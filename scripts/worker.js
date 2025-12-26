// ================================================
// KPFC 통합 Workers API
// 기능: GA4 Analytics + 문의접수 + 게시판
// 작성일: 2024-12-26
// 배포: Cloudflare Workers
//
// ⚠️ Cloudflare 환경변수 설정 필요:
//   - GA4_PROPERTY_ID: Google Analytics 4 속성 ID
//   - SERVICE_ACCOUNT_EMAIL: Google 서비스 계정 이메일
//   - SERVICE_ACCOUNT_PRIVATE_KEY: Google 서비스 계정 Private Key
//   - ADMIN_PASSWORD: 관리자 비밀번호
//   - AIRTABLE_TOKEN: Airtable Personal Access Token
//   - AIRTABLE_BASE_ID: Airtable Base ID
//   - TELEGRAM_BOT_TOKEN: Telegram Bot Token
//   - TELEGRAM_CHAT_ID: Telegram Chat ID
//   - RESEND_API_KEY: Resend API Key (이메일 발송)
// ================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ================================================
// 유틸리티 함수
// ================================================

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

// HTML 이스케이프
function escapeHtml(str) {
  if (!str) return '-';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// KST 현재 시간
function getKSTNow() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst;
}

// KST 날짜 포맷 (YYYY-MM-DD)
function formatDateKST(date) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

// KST 시간 포맷 (HH:MM)
function formatTimeKST(date) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[1].substring(0, 5);
}

// KST ISO 포맷 (YYYY-MM-DDTHH:MM:SS+09:00)
function formatISOKST(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace('Z', '+09:00');
}

// ================================================
// Google Analytics JWT/Token
// ================================================

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

// ================================================
// GA4 Data API
// ================================================

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

function getDateRange(period) {
  const today = new Date();

  let startDate, endDate, prevStartDate, prevEndDate;

  switch(period) {
    case 'weekly':
      endDate = formatDateKST(today);
      startDate = formatDateKST(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
      prevEndDate = formatDateKST(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
      prevStartDate = formatDateKST(new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000));
      break;
    case 'monthly':
      endDate = formatDateKST(today);
      startDate = formatDateKST(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));
      prevEndDate = formatDateKST(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
      prevStartDate = formatDateKST(new Date(today.getTime() - 59 * 24 * 60 * 60 * 1000));
      break;
    default:
      endDate = formatDateKST(today);
      startDate = formatDateKST(today);
      prevEndDate = formatDateKST(new Date(today.getTime() - 24 * 60 * 60 * 1000));
      prevStartDate = prevEndDate;
  }

  return { startDate, endDate, prevStartDate, prevEndDate };
}

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
    period: { startDate, endDate },
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

async function getHistoryStats(accessToken, propertyId, days) {
  const today = new Date();
  const startDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

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

// ================================================
// Airtable 캐시 조회 (GA4 API 호출 없이)
// ================================================

async function getHistoryStatsFromCache(env, days) {
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID) {
    throw new Error('Airtable not configured');
  }

  // 날짜 범위 계산
  const today = new Date();
  const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const startDateStr = formatDateKST(startDate);

  // Airtable에서 캐시된 데이터 조회
  const response = await fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/analytics_daily?` +
    `filterByFormula=IS_AFTER({date}, '${startDateStr}')&sort[0][field]=date&sort[0][direction]=desc`,
    {
      headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch from Airtable');
  }

  const result = await response.json();
  const data = (result.records || []).map(record => ({
    date: record.fields.date,
    visitors: record.fields.visitors || 0,
    pageviews: record.fields.pageviews || 0,
    avg_duration: record.fields.avg_duration || 0,
    bounce_rate: record.fields.bounce_rate || 0
  }));

  return { data, source: 'airtable', cached: true };
}

// 캐시된 개요 데이터 조회 (최근 N일 합산)
async function getOverviewFromCache(env, days) {
  const historyData = await getHistoryStatsFromCache(env, days);
  const data = historyData.data;

  if (!data || data.length === 0) {
    return {
      visitors: { value: 0, change: 0 },
      pageviews: { value: 0, change: 0 },
      duration: { value: '0분 0초', change: 0 },
      bounceRate: { value: 0, change: 0 },
      source: 'airtable'
    };
  }

  // 최신 데이터 (오늘 또는 어제)
  const latest = data[0];

  // 이전 기간 데이터 (비교용)
  const prev = data[1] || data[0];

  const calcChange = (curr, prv) => {
    if (prv === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prv) / prv) * 100);
  };

  const formatDuration = (seconds) => {
    const s = parseFloat(seconds) || 0;
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins}분 ${secs}초`;
  };

  return {
    period: { startDate: data[data.length - 1]?.date, endDate: latest.date },
    visitors: {
      value: latest.visitors,
      change: calcChange(latest.visitors, prev.visitors)
    },
    pageviews: {
      value: latest.pageviews,
      change: calcChange(latest.pageviews, prev.pageviews)
    },
    duration: {
      value: formatDuration(latest.avg_duration),
      change: calcChange(latest.avg_duration, prev.avg_duration)
    },
    bounceRate: {
      value: Math.round(latest.bounce_rate * 100),
      change: calcChange(latest.bounce_rate, prev.bounce_rate)
    },
    source: 'airtable'
  };
}

// ================================================
// 문의 접수 핸들러
// ================================================

async function handleSubmit(request, env) {
  console.log('📥 KPFC 문의 접수');

  const data = await request.json();
  const results = {
    success: true,
    airtable: { success: false, id: null, error: null },
    email: { customer: { success: false, error: null }, staff: { success: false, error: null } },
    telegram: { success: false, error: null }
  };

  // KST 현재 시간
  const now = new Date();
  const kst = getKSTNow();
  const submitDate = kst.toISOString().split('T')[0];
  const submitTime = kst.toISOString().split('T')[1].substring(0, 5);

  // ================================================
  // 1. Airtable 저장
  // ================================================
  if (env.AIRTABLE_TOKEN && env.AIRTABLE_BASE_ID) {
    try {
      console.log('📤 Airtable 저장 중...');

      // 프론트에서 전달받은 필드 사용
      const rawFields = data.airtableFields || {};

      // 필드명 변환 (프론트 → Airtable)
      const fields = { ...rawFields };

      // "지원받고 싶은 자금종류" 배열을 문자열로 변환
      if (rawFields['지원받고 싶은 자금종류']) {
        const fundTypes = rawFields['지원받고 싶은 자금종류'];
        fields['지원받고 싶은 자금종류'] = Array.isArray(fundTypes) ? fundTypes.join(', ') : fundTypes;
      }

      // 체크박스 필드 제거 (Airtable에 없음)
      delete fields['개인정보 수집및이용동의'];

      // 접수일시 추가
      fields['접수일'] = submitDate;
      fields['접수시간'] = submitTime;
      fields['상태'] = '신규';

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/consulting`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        }
      );

      if (airtableResponse.ok) {
        const airtableResult = await airtableResponse.json();
        results.airtable.success = true;
        results.airtable.id = airtableResult.id;
        console.log('✅ Airtable 저장 완료:', airtableResult.id);
      } else {
        const error = await airtableResponse.json();
        results.airtable.error = error;
        console.error('❌ Airtable 에러:', error);
      }
    } catch (error) {
      results.airtable.error = error.message;
      console.error('❌ Airtable 예외:', error.message);
    }
  }

  // ================================================
  // 2. 고객 이메일 발송 (Resend)
  // ================================================
  if (data.customerEmail && env.RESEND_API_KEY) {
    try {
      console.log('📧 고객 이메일 발송 중...');

      const customerEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: data.emailFrom || '한국정책자금지원센터 <noreply@mail.policy-fund.online>',
          to: [data.customerEmail],
          subject: data.customerSubject || '[한국정책자금지원센터] 무료진단 신청이 접수되었습니다',
          html: data.customerHtml
        })
      });

      if (customerEmailResponse.ok) {
        const result = await customerEmailResponse.json();
        results.email.customer.success = true;
        console.log('✅ 고객 이메일 발송 완료:', result.id);
      } else {
        const error = await customerEmailResponse.json();
        results.email.customer.error = error;
        console.error('❌ 고객 이메일 에러:', error);
      }
    } catch (error) {
      results.email.customer.error = error.message;
      console.error('❌ 고객 이메일 예외:', error.message);
    }
  } else {
    results.email.customer.success = true;
    results.email.customer.error = 'Skipped (no email or API key)';
  }

  // ================================================
  // 3. 내부 이메일 발송 (담당자용)
  // ================================================
  if (data.staffEmails && data.staffEmails.length > 0 && env.RESEND_API_KEY) {
    try {
      console.log('📧 내부 이메일 발송 중...');

      const staffEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: data.emailFrom || '한국정책자금지원센터 <noreply@mail.policy-fund.online>',
          to: data.staffEmails[0],
          bcc: data.staffEmails.slice(1).join(','),
          subject: data.staffSubject || '[한국정책자금지원센터] 신규 무료진단 접수',
          html: data.staffHtml
        })
      });

      if (staffEmailResponse.ok) {
        const result = await staffEmailResponse.json();
        results.email.staff.success = true;
        console.log('✅ 내부 이메일 발송 완료:', result.id);
      } else {
        const error = await staffEmailResponse.json();
        results.email.staff.error = error;
        console.error('❌ 내부 이메일 에러:', error);
      }
    } catch (error) {
      results.email.staff.error = error.message;
      console.error('❌ 내부 이메일 예외:', error.message);
    }
  }

  // ================================================
  // 4. Telegram 메시지 발송
  // ================================================
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    try {
      console.log('📱 Telegram 발송 중...');

      const fields = data.airtableFields || {};
      const telegramText = buildTelegramMessage(fields, submitDate, submitTime);

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: telegramText,
            parse_mode: 'HTML',
            disable_web_page_preview: true
          })
        }
      );

      if (telegramResponse.ok) {
        const result = await telegramResponse.json();
        results.telegram.success = true;
        console.log('✅ Telegram 발송 완료:', result.result.message_id);
      } else {
        const error = await telegramResponse.json();
        results.telegram.error = error;
        console.error('❌ Telegram 에러:', error);
      }
    } catch (error) {
      results.telegram.error = error.message;
      console.error('❌ Telegram 예외:', error.message);
    }
  }

  console.log('📊 최종 결과:', results);
  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// Telegram 메시지 생성
function buildTelegramMessage(fields, submitDate, submitTime) {
  let msg = '🔔 <b>한국정책자금지원센터 신규 상담</b>\n\n';
  msg += '👤 <b>고객정보</b>\n';
  msg += '├ 기업명: <b>' + escapeHtml(fields['기업명']) + '</b>\n';
  msg += '├ 사업자번호: ' + escapeHtml(fields['사업자번호']) + '\n';
  msg += '├ 대표자명: <b>' + escapeHtml(fields['대표자명']) + '</b>\n';
  msg += '├ 연락처: <code>' + escapeHtml(fields['연락처']) + '</code>\n';
  msg += '├ 이메일: ' + escapeHtml(fields['이메일']) + '\n';
  msg += '├ 지역: ' + escapeHtml(fields['지역']) + '\n';
  msg += '└ 통화가능: <b>' + escapeHtml(fields['통화가능시간']) + '</b>\n\n';

  msg += '💰 <b>자금정보</b>\n';
  const fundTypes = fields['지원받고 싶은 자금종류'];
  if (Array.isArray(fundTypes)) {
    msg += '├ 자금종류: ' + fundTypes.join(', ') + '\n';
  }
  if (fields['필요자금규모']) msg += '├ 필요규모: ' + escapeHtml(fields['필요자금규모']) + '\n';
  if (fields['업종']) msg += '├ 업종: ' + escapeHtml(fields['업종']) + '\n';
  if (fields['설립연도']) msg += '├ 설립연도: ' + escapeHtml(fields['설립연도']) + '\n';
  if (fields['직전년도매출']) msg += '└ 매출: ' + escapeHtml(fields['직전년도매출']) + '\n';

  if (fields['문의사항'] && fields['문의사항'] !== '-') {
    msg += '\n💬 <b>문의</b>\n' + escapeHtml(fields['문의사항']) + '\n';
  }

  msg += '\n📅 ' + submitDate + ' ' + submitTime;
  return msg;
}

// ================================================
// 접수내역 API 핸들러
// ================================================

async function handleLeadsAPI(request, env, path) {
  const method = request.method;

  // GET /leads - 접수 내역 전체 조회
  if (method === 'GET' && path === '/leads') {
    try {
      console.log('📋 Fetching leads...');

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/consulting?sort[0][field]=접수일&sort[0][direction]=desc`,
        {
          headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` }
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to fetch leads'
        }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      const leads = result.records.map(record => ({
        id: record.id,
        createdTime: record.createdTime,
        기업명: record.fields['기업명'],
        사업자번호: record.fields['사업자번호'],
        대표자명: record.fields['대표자명'],
        연락처: record.fields['연락처'],
        이메일: record.fields['이메일'],
        지역: record.fields['지역'],
        업종: record.fields['업종'],
        설립연도: record.fields['설립연도'],
        직전년도매출: record.fields['직전년도매출'],
        통화가능시간: record.fields['통화가능시간'],
        필요자금규모: record.fields['필요자금규모'],
        자금종류: record.fields['지원받고 싶은 자금종류'],
        문의사항: record.fields['문의사항'],
        상태: record.fields['상태'] || '신규',
        메모: record.fields['메모'] || ''
      }));

      console.log(`✅ Fetched ${leads.length} leads`);

      return new Response(JSON.stringify({
        success: true,
        leads: leads
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  // PATCH /leads/:id - 접수 상태/메모 수정
  if (method === 'PATCH' && path.startsWith('/leads/')) {
    const recordId = path.replace('/leads/', '');

    try {
      const data = await request.json();
      const fields = {};

      if (data.상태 !== undefined) fields['상태'] = data.상태;
      if (data.메모 !== undefined) fields['메모'] = data.메모;

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/consulting/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        }
      );

      if (!airtableResponse.ok) {
        const error = await airtableResponse.json();
        return new Response(JSON.stringify({
          success: false,
          error: error.error?.message || 'Failed to update lead'
        }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      const result = await airtableResponse.json();
      return new Response(JSON.stringify({
        success: true,
        record: result
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// ================================================
// 게시판 API 핸들러
// ================================================

async function handleBoardAPI(request, env, path) {
  const method = request.method;

  // GET /board - 게시글 목록 조회
  if (method === 'GET' && (path === '/board' || path === '/posts')) {
    try {
      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/board?sort[0][field]=date&sort[0][direction]=desc`,
        {
          headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` }
        }
      );

      if (!airtableResponse.ok) {
        return new Response(JSON.stringify({ posts: [], message: 'No board table or empty' }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      const data = await airtableResponse.json();
      // board.html에서 사용하는 한글 필드명에 맞춰 매핑
      const records = (data.records || []).map(record => ({
        id: record.id,
        제목: record.fields['title'] || '',
        내용: record.fields['content'] || '',
        요약: record.fields['summary'] || record.fields['content']?.substring(0, 100) || '',
        카테고리: record.fields['category'] || record.fields['tag'] || '',
        썸네일URL: record.fields['thumbnailUrl'] || '',
        태그: record.fields['tags'] || record.fields['tag'] || '',
        작성일: record.fields['date'] || '',
        조회수: record.fields['views'] || 0,
        게시여부: record.fields['isPublic'] !== false
      }));

      return new Response(JSON.stringify({ records }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  // GET /posts/:id - 개별 게시글 조회
  if (method === 'GET' && path.startsWith('/posts/')) {
    try {
      const recordId = path.replace('/posts/', '');
      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/board/${recordId}`,
        {
          headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` }
        }
      );

      const record = await airtableResponse.json();
      const post = {
        id: record.id,
        title: record.fields['title'] || '',
        content: record.fields['content'] || '',
        summary: record.fields['content']?.substring(0, 100) || '',
        category: record.fields['tag'] || '',
        thumbnail: record.fields['thumbnailUrl'] || '',
        tags: record.fields['tag'] || '',
        date: record.fields['date'] || '',
        views: 0,
        isPublic: record.fields['isPublic'] || false
      };

      return new Response(JSON.stringify({ post }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// ================================================
// 메인 핸들러
// ================================================

export default {
  async fetch(request, env) {
    // Preflight 요청 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ================================================
      // 관리자 인증 API (POST /auth)
      // ================================================
      if (path === '/auth' && request.method === 'POST') {
        const { password } = await request.json();
        if (password === env.ADMIN_PASSWORD) {
          return new Response(JSON.stringify({
            success: true,
            token: crypto.randomUUID(),
            expiresIn: 24 * 60 * 60 * 1000
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({
          success: false,
          error: '비밀번호가 올바르지 않습니다'
        }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      // ================================================
      // 헬스 체크
      // ================================================
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'kpfc-api',
          version: '2.0.1',
          features: ['analytics', 'submit', 'leads', 'board'],
          env_status: {
            GA4_PROPERTY_ID: !!env.GA4_PROPERTY_ID,
            SERVICE_ACCOUNT_EMAIL: !!env.SERVICE_ACCOUNT_EMAIL,
            SERVICE_ACCOUNT_PRIVATE_KEY: !!env.SERVICE_ACCOUNT_PRIVATE_KEY,
            AIRTABLE_TOKEN: !!env.AIRTABLE_TOKEN,
            AIRTABLE_BASE_ID: !!env.AIRTABLE_BASE_ID,
            TELEGRAM_BOT_TOKEN: !!env.TELEGRAM_BOT_TOKEN,
            RESEND_API_KEY: !!env.RESEND_API_KEY
          }
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      // ================================================
      // 문의 접수 API (POST / 또는 /submit)
      // ================================================
      if (request.method === 'POST' && (path === '/' || path === '/submit')) {
        return await handleSubmit(request, env);
      }

      // ================================================
      // 접수내역 API (/leads)
      // ================================================
      if (path === '/leads' || path.startsWith('/leads/')) {
        return await handleLeadsAPI(request, env, path);
      }

      // ================================================
      // 게시판 API (/board, /posts)
      // ================================================
      if (path === '/board' || path === '/posts' || path.startsWith('/posts/')) {
        return await handleBoardAPI(request, env, path);
      }

      // ================================================
      // Google Analytics API
      // ================================================
      if (path.startsWith('/analytics') || path.startsWith('/history')) {
        // 환경변수 검증
        if (!env.GA4_PROPERTY_ID || !env.SERVICE_ACCOUNT_EMAIL || !env.SERVICE_ACCOUNT_PRIVATE_KEY) {
          return new Response(JSON.stringify({
            error: 'Missing GA environment variables'
          }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        const accessToken = await getAccessToken(env);
        const propertyId = env.GA4_PROPERTY_ID;
        const period = url.searchParams.get('period') || 'daily';
        const days = parseInt(url.searchParams.get('days')) || 7;

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
            overview, trend, traffic, devices, pages, geography, referrers
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        if (path === '/analytics/overview') {
          const data = await getOverview(accessToken, propertyId, period);
          return new Response(JSON.stringify(data), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }

        if (path === '/history/stats') {
          const data = await getHistoryStats(accessToken, propertyId, days);
          return new Response(JSON.stringify(data), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      }

      // ================================================
      // Airtable 캐시 조회 API (GA4 API 호출 없음)
      // ================================================
      if (path === '/analytics/cached' || path === '/history/cached') {
        try {
          const days = parseInt(url.searchParams.get('days')) || 30;
          const data = await getHistoryStatsFromCache(env, days);
          return new Response(JSON.stringify(data), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            error: error.message,
            data: [],
            source: 'airtable',
            cached: true
          }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      }

      if (path === '/analytics/overview/cached') {
        try {
          const days = parseInt(url.searchParams.get('days')) || 7;
          const data = await getOverviewFromCache(env, days);
          return new Response(JSON.stringify(data), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            error: error.message,
            source: 'airtable'
          }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      }

      // ================================================
      // 수동 백필 API (과거 데이터 일괄 수집)
      // GET /backfill?days=30
      // ================================================
      if (path === '/backfill') {
        try {
          const days = parseInt(url.searchParams.get('days')) || 7;

          // 환경변수 검증
          if (!env.GA4_PROPERTY_ID || !env.SERVICE_ACCOUNT_EMAIL || !env.SERVICE_ACCOUNT_PRIVATE_KEY) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Missing GA environment variables'
            }), {
              status: 500,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
          }
          if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Missing Airtable environment variables'
            }), {
              status: 500,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
          }

          console.log(`📊 Backfill started for ${days} days`);

          const accessToken = await getAccessToken(env);
          const propertyId = env.GA4_PROPERTY_ID;
          const results = [];

          // 과거 N일간 데이터 수집
          for (let i = 1; i <= days; i++) {
            const targetDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = formatDateKST(targetDate);

            try {
              // GA4에서 해당 날짜 데이터 수집
              const report = await runReport(accessToken, propertyId, {
                dateRanges: [{ startDate: dateStr, endDate: dateStr }],
                metrics: [
                  { name: 'activeUsers' },
                  { name: 'screenPageViews' },
                  { name: 'averageSessionDuration' },
                  { name: 'bounceRate' }
                ]
              });

              const row = report.rows?.[0]?.metricValues || [];
              const analyticsData = {
                date: dateStr,
                visitors: parseInt(row[0]?.value) || 0,
                pageviews: parseInt(row[1]?.value) || 0,
                avg_duration: parseFloat(row[2]?.value) || 0,
                bounce_rate: parseFloat(row[3]?.value) || 0,
                collected_at: formatISOKST()
              };

              // Airtable에서 해당 날짜 레코드 확인 (중복 방지)
              const checkResponse = await fetch(
                `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/analytics_daily?filterByFormula={date}='${dateStr}'`,
                {
                  headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` }
                }
              );
              const existingData = await checkResponse.json();

              if (existingData.records && existingData.records.length > 0) {
                // 기존 레코드 업데이트
                const recordId = existingData.records[0].id;
                await fetch(
                  `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/analytics_daily/${recordId}`,
                  {
                    method: 'PATCH',
                    headers: {
                      'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      fields: {
                        visitors: analyticsData.visitors,
                        pageviews: analyticsData.pageviews,
                        avg_duration: analyticsData.avg_duration,
                        bounce_rate: analyticsData.bounce_rate,
                        collected_at: analyticsData.collected_at
                      }
                    })
                  }
                );
                results.push({ date: dateStr, action: 'updated', ...analyticsData });
              } else {
                // 새 레코드 생성
                await fetch(
                  `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/analytics_daily`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      fields: {
                        date: analyticsData.date,
                        visitors: analyticsData.visitors,
                        pageviews: analyticsData.pageviews,
                        avg_duration: analyticsData.avg_duration,
                        bounce_rate: analyticsData.bounce_rate,
                        collected_at: analyticsData.collected_at
                      }
                    })
                  }
                );
                results.push({ date: dateStr, action: 'created', ...analyticsData });
              }

              console.log(`✅ ${dateStr} processed`);
            } catch (dayError) {
              console.error(`❌ ${dateStr} failed:`, dayError.message);
              results.push({ date: dateStr, action: 'error', error: dayError.message });
            }
          }

          console.log(`🎉 Backfill completed: ${results.length} days processed`);

          return new Response(JSON.stringify({
            success: true,
            processed: results.length,
            results: results
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });

        } catch (error) {
          console.error('💥 Backfill error:', error.message);
          return new Response(JSON.stringify({
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      }

      // ================================================
      // 기본 응답
      // ================================================
      return new Response(JSON.stringify({
        message: 'KPFC API',
        endpoints: [
          'POST / - 문의 접수',
          'POST /submit - 문의 접수',
          'POST /auth - 관리자 로그인',
          'GET /leads - 접수 내역 조회',
          'PATCH /leads/:id - 접수 상태 수정',
          'GET /board - 게시글 목록',
          'GET /posts - 게시글 목록',
          'GET /posts/:id - 게시글 상세',
          'GET /analytics/all - GA4 전체 데이터',
          'GET /analytics/overview - GA4 개요',
          'GET /analytics/cached - 캐시된 히스토리',
          'GET /analytics/overview/cached - 캐시된 개요',
          'GET /history/stats - GA4 히스토리',
          'GET /history/cached - 캐시된 히스토리',
          'GET /backfill?days=N - 과거 데이터 백필',
          'GET /health - 헬스 체크'
        ]
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('💥 Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  },

  // ================================================
  // Scheduled Event Handler (Cron Trigger)
  // 매일 KST 01:00 (UTC 16:00) GA4 데이터 수집 → Airtable 저장
  // ================================================
  async scheduled(event, env, ctx) {
    console.log('🕐 Cron triggered (KST):', formatISOKST());

    try {
      // 환경변수 검증
      if (!env.GA4_PROPERTY_ID || !env.SERVICE_ACCOUNT_EMAIL || !env.SERVICE_ACCOUNT_PRIVATE_KEY) {
        console.error('❌ Missing GA environment variables');
        return;
      }
      if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID) {
        console.error('❌ Missing Airtable environment variables');
        return;
      }

      // GA4 Access Token 획득
      const accessToken = await getAccessToken(env);
      const propertyId = env.GA4_PROPERTY_ID;

      // 어제 날짜 (KST 기준)
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const dateStr = formatDateKST(yesterday);

      console.log('📊 Collecting GA4 data for:', dateStr);

      // GA4에서 어제 데이터 수집
      const report = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: dateStr, endDate: dateStr }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' }
        ]
      });

      const row = report.rows?.[0]?.metricValues || [];
      const analyticsData = {
        date: dateStr,
        visitors: parseInt(row[0]?.value) || 0,
        pageviews: parseInt(row[1]?.value) || 0,
        avg_duration: parseFloat(row[2]?.value) || 0,
        bounce_rate: parseFloat(row[3]?.value) || 0,
        collected_at: formatISOKST()
      };

      console.log('📈 GA4 Data:', analyticsData);

      // Airtable에서 해당 날짜 레코드 확인 (중복 방지)
      const checkResponse = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/analytics_daily?filterByFormula={date}='${dateStr}'`,
        {
          headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` }
        }
      );

      const existingData = await checkResponse.json();

      if (existingData.records && existingData.records.length > 0) {
        // 기존 레코드 업데이트
        const recordId = existingData.records[0].id;
        console.log('🔄 Updating existing record:', recordId);

        await fetch(
          `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/analytics_daily/${recordId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: {
                visitors: analyticsData.visitors,
                pageviews: analyticsData.pageviews,
                avg_duration: analyticsData.avg_duration,
                bounce_rate: analyticsData.bounce_rate,
                collected_at: analyticsData.collected_at
              }
            })
          }
        );
        console.log('✅ Record updated');
      } else {
        // 새 레코드 생성
        console.log('➕ Creating new record');

        await fetch(
          `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/analytics_daily`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.AIRTABLE_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: {
                date: analyticsData.date,
                visitors: analyticsData.visitors,
                pageviews: analyticsData.pageviews,
                avg_duration: analyticsData.avg_duration,
                bounce_rate: analyticsData.bounce_rate,
                collected_at: analyticsData.collected_at
              }
            })
          }
        );
        console.log('✅ Record created');
      }

      console.log('🎉 Cron job completed successfully');

    } catch (error) {
      console.error('💥 Cron error:', error.message);
    }
  }
};
