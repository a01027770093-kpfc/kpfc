const https = require('https');

// 환경변수에서 읽기 (실행 시: AIRTABLE_TOKEN=xxx node scripts/add-posts.js)
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appwr3xRqHrc3z0zQ';
const TABLE_NAME = 'board';

if (!AIRTABLE_TOKEN) {
  console.error('❌ AIRTABLE_TOKEN 환경변수가 필요합니다.');
  console.error('   사용법: AIRTABLE_TOKEN=xxx node scripts/add-posts.js');
  process.exit(1);
}

const posts = [
  {
    fields: {
      title: '2026년 중소기업 정책자금 4조원 공급 확정',
      content: '중소벤처기업부는 2026년 중소기업 정책자금을 4조원 규모로 공급한다고 발표했습니다. 이는 전년 대비 15% 증가한 규모로, 특히 혁신성장 분야와 지역 기업에 대한 지원이 강화됩니다.',
      date: '2025-12-26',
      tag: '정책소식',
      isPublic: true
    }
  },
  {
    fields: {
      title: '비수도권 기업 60% 이상 집중 지원',
      content: '정부는 지역 균형 발전을 위해 비수도권 기업에 정책자금의 60% 이상을 집중 지원하기로 결정했습니다. 지방 소재 중소기업들의 자금 접근성이 크게 개선될 전망입니다.',
      date: '2025-12-25',
      tag: '정책소식',
      isPublic: true
    }
  },
  {
    fields: {
      title: 'AI 전환(AX) 기업 우대트랙 신설',
      content: '인공지능 기술을 도입하는 기업을 위한 특별 지원 프로그램이 신설됩니다. AI 전환 기업은 금리 우대와 함께 별도의 심사 트랙을 통해 신속하게 자금을 지원받을 수 있습니다.',
      date: '2025-12-24',
      tag: '업계동향',
      isPublic: true
    }
  },
  {
    fields: {
      title: '정책자금 내비게이션 AI 서비스 출시',
      content: '중소기업진흥공단에서 AI 기반 정책자금 추천 서비스를 출시합니다. 기업 정보를 입력하면 맞춤형 정책자금을 추천받을 수 있어 복잡한 자금 찾기가 간편해집니다.',
      date: '2025-12-23',
      tag: '공지',
      isPublic: true
    }
  },
  {
    fields: {
      title: '2026년 정책자금 신청일정 안내',
      content: '2026년 1분기 정책자금 신청이 1월 2일부터 시작됩니다. 주요 자금별 신청 기간과 필요 서류를 미리 확인하시고, 조기 마감에 대비하시기 바랍니다.',
      date: '2025-12-22',
      tag: '공지',
      isPublic: true
    }
  },
  {
    fields: {
      title: 'K-뷰티 산업 정책자금 지원 2배 확대',
      content: '수출 호조를 보이는 K-뷰티 산업에 대한 정책자금 지원이 전년 대비 2배로 확대됩니다. 화장품 제조 및 유통 기업들의 글로벌 진출을 적극 지원할 계획입니다.',
      date: '2025-12-21',
      tag: '업계동향',
      isPublic: true
    }
  }
];

async function addPosts() {
  const postData = JSON.stringify({ records: posts });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: `/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const result = JSON.parse(data);
          console.log(`✅ ${result.records.length}개 게시글 추가 완료!`);
          result.records.forEach((r, i) => {
            console.log(`   ${i+1}. ${r.fields.title} (${r.id})`);
          });
          resolve(result);
        } else {
          console.error('❌ 오류:', data);
          reject(new Error(data));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

addPosts().catch(console.error);
