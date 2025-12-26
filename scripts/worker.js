// KPFC Analytics Worker - GA4 Data API
// 환경변수로 민감 정보 관리 (Cloudflare Dashboard에서 설정)
// GA4_PROPERTY_ID, ADMIN_PASSWORD, SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Base64URL 인코딩
function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ArrayBuffer를 Base64URL로 변환
function arrayBufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// PEM 키를 CryptoKey로 변환
async function importPrivateKey(pem) {
  const pemContents = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

// JWT 생성
async function createJWT(env) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.SERVICE_ACCOUNT_EMAIL,
    sub: env.SERVICE_ACCOUNT_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/analytics.readonly'
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const unsigned = `${headerB64}.${payloadB64}`;

  const key = await importPrivateKey(env.SERVICE_ACCOUNT_PRIVATE_KEY);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${arrayBufferToBase64url(signature)}`;
}

// 액세스 토큰 획득
async function getAccessToken(env) {
  const jwt = await createJWT(env);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Token error: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// GA4 Data API 호출
async function runReport(accessToken, propertyId, request) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GA4 API error: ${error}`);
  }

  return await response.json();
}

// KST 날짜 포맷 (YYYY-MM-DD)
function formatDateKST(date) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

// 날짜 계산 유틸리티
function getDateRange(period) {
  const today = new Date();
  const formatDate = formatDateKST;

  let startDate, endDate, prevStartDate, prevEndDate;

  switch(period) {
    case 'weekly':
      endDate = formatDate(today);
      startDate = formatDate(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
      prevEndDate = formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
      prevStartDate = formatDate(new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000));
      break;
    case 'monthly':
      endDate = formatDate(today);
      startDate = formatDate(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));
      prevEndDate = formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
      prevStartDate = formatDate(new Date(today.getTime() - 59 * 24 * 60 * 60 * 1000));
      break;
    default: // daily
      endDate = formatDate(today);
      startDate = formatDate(today);
      prevEndDate = formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000));
      prevStartDate = prevEndDate;
  }

  return { startDate, endDate, prevStartDate, prevEndDate };
}

// 개요 데이터 조회
async function getOverview(accessToken, propertyId, period) {
  const { startDate, endDate, prevStartDate, prevEndDate } = getDateRange(period);

  const currentReport = await runReport(accessToken, propertyId, {
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ]
  });

  const prevReport = await runReport(accessToken, propertyId, {
    dateRanges: [{ startDate: prevStartDate, endDate: prevEndDate }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ]
  });

  const current = currentReport.rows?.[0]?.metricValues || [];
  const prev = prevReport.rows?.[0]?.metricValues || [];

  const calcChange = (curr, prv) => {
    const c = parseFloat(curr) || 0;
    const p = parseFloat(prv) || 0;
    if (p === 0) return c > 0 ? 100 : 0;
    return Math.round(((c - p) / p) * 100);
  };

  const formatDuration = (seconds) => {
    const s = parseFloat(seconds) || 0;
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins}분 ${secs}초`;
  };

  return {
    period: {
      startDate: startDate,
      endDate: endDate
    },
    visitors: {
      value: parseInt(current[0]?.value) || 0,
      change: calcChange(current[0]?.value, prev[0]?.value)
    },
    pageviews: {
      value: parseInt(current[1]?.value) || 0,
      change: calcChange(current[1]?.value, prev[1]?.value)
    },
    duration: {
      value: formatDuration(current[2]?.value),
      change: calcChange(current[2]?.value, prev[2]?.value)
    },
    bounceRate: {
      value: Math.round((parseFloat(current[3]?.value) || 0) * 100),
      change: calcChange(current[3]?.value, prev[3]?.value)
    }
  };
}

// 추이 데이터 조회
async function getTrend(accessToken, propertyId, period) {
  const days = period === 'monthly' ? 30 : period === 'weekly' ? 14 : 7;
  const today = new Date();
  const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

  const report = await runReport(accessToken, propertyId, {
    dateRanges: [{ startDate: formatDateKST(startDate), endDate: formatDateKST(today) }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' }
    ],
    orderBys: [{ dimension: { dimensionName: 'date' } }]
  });

  const trend = (report.rows || []).map(row => ({
    date: row.dimensionValues[0].value,
    visitors: parseInt(row.metricValues[0].value) || 0,
    pageviews: parseInt(row.metricValues[1].value) || 0
  }));

  return { trend };
}

// 트래픽 소스 조회
async function getTrafficSources(accessToken, propertyId, period) {
  const { startDate, endDate } = getDateRange(period);

  const report = await runReport(accessToken, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10
  });

  const total = (report.rows || []).reduce((sum, row) =>
    sum + parseInt(row.metricValues[0].value), 0);

  const sources = (report.rows || []).map(row => ({
    source: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value) || 0,
    percentage: total > 0 ? Math.round((parseInt(row.metricValues[0].value) / total) * 100) : 0
  }));

  return { sources };
}

// 기기별 조회
async function getDevices(accessToken, propertyId, period) {
  const { startDate, endDate } = getDateRange(period);

  const report = await runReport(accessToken, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
  });

  const total = (report.rows || []).reduce((sum, row) =>
    sum + parseInt(row.metricValues[0].value), 0);

  const devices = (report.rows || []).map(row => ({
    device: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value) || 0,
    percentage: total > 0 ? Math.round((parseInt(row.metricValues[0].value) / total) * 100) : 0
  }));

  return { devices };
}

// 인기 페이지 조회
async function getTopPages(accessToken, propertyId, period) {
  const { startDate, endDate } = getDateRange(period);

  const report = await runReport(accessToken, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10
  });

  const pages = (report.rows || []).map(row => ({
    path: row.dimensionValues[0].value,
    views: parseInt(row.metricValues[0].value) || 0
  }));

  return { pages };
}

// 지역별 조회
async function getGeography(accessToken, propertyId, period) {
  const { startDate, endDate } = getDateRange(period);

  const report = await runReport(accessToken, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'city' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 10
  });

  const regions = (report.rows || []).map(row => ({
    city: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value) || 0
  }));

  return { regions };
}

// 유입 경로 조회
async function getReferrers(accessToken, propertyId, period) {
  const { startDate, endDate } = getDateRange(period);

  const report = await runReport(accessToken, propertyId, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' }
    ],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10
  });

  const total = (report.rows || []).reduce((sum, row) =>
    sum + parseInt(row.metricValues[0].value), 0);

  const referrers = (report.rows || []).map(row => ({
    source: row.dimensionValues[0].value,
    medium: row.dimensionValues[1].value,
    sessions: parseInt(row.metricValues[0].value) || 0,
    percentage: total > 0 ? Math.round((parseInt(row.metricValues[0].value) / total) * 100) : 0
  }));

  return { referrers };
}

// 히스토리 데이터 조회
async function getHistoryStats(accessToken, propertyId, days) {
  const today = new Date();
  const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const formatDate = (d) => d.toISOString().split('T')[0];

  const report = await runReport(accessToken, propertyId, {
    dateRanges: [{ startDate: formatDateKST(startDate), endDate: formatDateKST(today) }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: true }]
  });

  const data = (report.rows || []).map(row => {
    const dateStr = row.dimensionValues[0].value;
    return {
      date: `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`,
      visitors: parseInt(row.metricValues[0].value) || 0,
      pageviews: parseInt(row.metricValues[1].value) || 0,
      avg_duration: parseFloat(row.metricValues[2].value) || 0,
      bounce_rate: parseFloat(row.metricValues[3].value) || 0
    };
  });

  return { data };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 환경변수 검증
    if (!env.GA4_PROPERTY_ID || !env.SERVICE_ACCOUNT_EMAIL || !env.SERVICE_ACCOUNT_PRIVATE_KEY) {
      return new Response(JSON.stringify({
        error: 'Missing environment variables',
        required: ['GA4_PROPERTY_ID', 'SERVICE_ACCOUNT_EMAIL', 'SERVICE_ACCOUNT_PRIVATE_KEY', 'ADMIN_PASSWORD']
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    try {
      // 관리자 인증
      if (path === '/auth' && request.method === 'POST') {
        const { password } = await request.json();
        if (password === env.ADMIN_PASSWORD) {
          return new Response(JSON.stringify({
            success: true,
            token: crypto.randomUUID(),
            expiresIn: 24 * 60 * 60 * 1000
          }), {
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
          });
        }
        return new Response(JSON.stringify({
          success: false,
          error: '비밀번호가 올바르지 않습니다'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      // 헬스 체크
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'kpfc-analytics',
          propertyId: env.GA4_PROPERTY_ID
        }), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      // GA4 API 호출
      const accessToken = await getAccessToken(env);
      const propertyId = env.GA4_PROPERTY_ID;
      const period = url.searchParams.get('period') || 'daily';
      const days = parseInt(url.searchParams.get('days')) || 7;

      // 전체 데이터
      if (path === '/analytics/all') {
        const [overview, trend, traffic, devices, pages, geography, referrers] = await Promise.all([
          getOverview(accessToken, propertyId, period),
          getTrend(accessToken, propertyId, period),
          getTrafficSources(accessToken, propertyId, period),
          getDevices(accessToken, propertyId, period),
          getTopPages(accessToken, propertyId, period),
          getGeography(accessToken, propertyId, period),
          getReferrers(accessToken, propertyId, period)
        ]);

        return new Response(JSON.stringify({
          overview,
          trend,
          traffic,
          devices,
          pages,
          geography,
          referrers
        }), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      // 개요
      if (path === '/analytics/overview') {
        const data = await getOverview(accessToken, propertyId, period);
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      // 히스토리
      if (path === '/history/stats') {
        const data = await getHistoryStats(accessToken, propertyId, days);
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
      }

      return new Response(JSON.stringify({
        error: 'Not Found',
        endpoints: ['/analytics/all', '/analytics/overview', '/history/stats', '/auth', '/health']
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }
  }
};
