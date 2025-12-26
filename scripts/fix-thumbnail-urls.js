// 썸네일 URL 일괄 수정 스크립트
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appwr3xRqHrc3z0zQ';
const TABLE_NAME = 'board';

const OLD_BUCKET = 'pub-bf39e5c4b6ef41af31941676cc384300.r2.dev';
const NEW_BUCKET = 'pub-a042ac0503284c5d8ed82f5ea918f615.r2.dev';

async function fixThumbnailUrls() {
  console.log('📷 썸네일 URL 수정 시작...\n');

  // 1. 모든 레코드 가져오기
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
    {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    }
  );

  const data = await response.json();
  const records = data.records || [];

  console.log(`총 ${records.length}개 레코드 발견\n`);

  let updated = 0;
  let skipped = 0;

  for (const record of records) {
    const thumbnailUrl = record.fields.thumbnailUrl;

    if (!thumbnailUrl) {
      console.log(`⏭️  ${record.fields.title}: 썸네일 없음`);
      skipped++;
      continue;
    }

    if (!thumbnailUrl.includes(OLD_BUCKET)) {
      console.log(`⏭️  ${record.fields.title}: 이미 올바른 URL`);
      skipped++;
      continue;
    }

    // URL 수정
    const newUrl = thumbnailUrl.replace(OLD_BUCKET, NEW_BUCKET);

    // Airtable 업데이트
    const updateResponse = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${record.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: { thumbnailUrl: newUrl }
        })
      }
    );

    if (updateResponse.ok) {
      console.log(`✅ ${record.fields.title}`);
      console.log(`   ${thumbnailUrl}`);
      console.log(`   → ${newUrl}\n`);
      updated++;
    } else {
      const error = await updateResponse.text();
      console.log(`❌ ${record.fields.title}: ${error}`);
    }
  }

  console.log('\n📊 결과 요약');
  console.log(`   수정됨: ${updated}개`);
  console.log(`   스킵됨: ${skipped}개`);
}

fixThumbnailUrls().catch(console.error);
