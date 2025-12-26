/**
 * 이미지 생성 파이프라인
 * Gemini Nano Banana Pro → WebP 압축 → R2 업로드 → Airtable 업데이트
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 환경변수
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const CF_ACCOUNT_ID = 'bf39e5c4b6ef41af31941676cc384300';
const R2_BUCKET = 'kpfc';
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

// R2 클라이언트
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

// Gemini 클라이언트
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 게시글별 이미지 프롬프트
const postPrompts = {
  '2026년 중소기업 정책자금 4조원 공급 확정': {
    prompt: 'Professional Korean business meeting scene, modern office with large windows, Korean businessmen and businesswomen in suits discussing documents with charts showing growth, warm lighting, corporate atmosphere, photorealistic, high quality',
    filename: 'policy-fund-4trillion-2026'
  },
  '비수도권 기업 60% 이상 집중 지원': {
    prompt: 'Aerial view of modern Korean factory and office buildings in countryside region, green mountains in background, industrial park with clean facilities, blue sky, professional corporate photography style, photorealistic',
    filename: 'regional-support-60percent'
  },
  'AI 전환(AX) 기업 우대트랙 신설': {
    prompt: 'Modern Korean tech startup office, young Korean professionals working with AI interfaces and holographic displays, futuristic but realistic setting, blue accent lighting, clean minimal design, photorealistic',
    filename: 'ai-transformation-track'
  },
  '정책자금 내비게이션 AI 서비스 출시': {
    prompt: 'Korean business owner using tablet showing AI recommendation interface, modern office background, friendly professional atmosphere, digital graphs and fund options on screen, warm lighting, photorealistic',
    filename: 'policy-fund-navigator-ai'
  },
  '2026년 정책자금 신청일정 안내': {
    prompt: 'Professional calendar and planner on modern desk, Korean office setting, documents with government seals, laptop showing application form, organized workspace, soft natural lighting, photorealistic',
    filename: 'application-schedule-2026'
  },
  'K-뷰티 산업 정책자금 지원 2배 확대': {
    prompt: 'Modern Korean cosmetics factory and laboratory, K-beauty products on display, Korean scientists in white coats, clean bright facility, pink and white color scheme, export shipping containers visible, photorealistic',
    filename: 'kbeauty-fund-expansion'
  }
};

/**
 * Airtable에서 게시글 조회
 */
async function fetchPosts() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/board?filterByFormula=NOT({thumbnailUrl})`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    }
  });

  const data = await response.json();
  return data.records || [];
}

/**
 * Gemini로 이미지 생성
 */
async function generateImage(prompt) {
  console.log('  🎨 이미지 생성 중...');

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      responseModalities: ['image', 'text'],
    }
  });

  const result = await model.generateContent(prompt);
  const response = result.response;

  // 이미지 데이터 추출
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }

  throw new Error('이미지 생성 실패');
}

/**
 * WebP로 압축
 */
async function compressToWebP(imageBuffer) {
  console.log('  📦 WebP 압축 중...');

  return await sharp(imageBuffer)
    .resize(1200, 630, { fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer();
}

/**
 * R2에 업로드
 */
async function uploadToR2(buffer, filename) {
  console.log('  ☁️ R2 업로드 중...');

  const key = `board/${filename}.webp`;

  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/webp',
  }));

  // Public URL (R2 버킷에 커스텀 도메인이나 public access 설정 필요)
  return `https://pub-${CF_ACCOUNT_ID}.r2.dev/${key}`;
}

/**
 * Airtable 레코드 업데이트
 */
async function updateAirtable(recordId, thumbnailUrl) {
  console.log('  📝 Airtable 업데이트 중...');

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/board/${recordId}`;

  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: { thumbnailUrl }
    })
  });
}

/**
 * 메인 실행
 */
async function main() {
  console.log('🚀 이미지 생성 파이프라인 시작\n');

  // 1. Airtable에서 thumbnailUrl이 없는 게시글 조회
  console.log('📋 게시글 조회 중...');
  const posts = await fetchPosts();

  if (posts.length === 0) {
    console.log('✅ 모든 게시글에 이미지가 있습니다.');
    return;
  }

  console.log(`📝 ${posts.length}개 게시글 이미지 생성 필요\n`);

  // 2. 각 게시글에 대해 이미지 생성
  for (const post of posts) {
    const title = post.fields.title;
    const promptInfo = postPrompts[title];

    if (!promptInfo) {
      console.log(`⚠️ "${title}" - 프롬프트 없음, 건너뜀`);
      continue;
    }

    console.log(`\n🖼️ "${title}"`);

    try {
      // 이미지 생성
      const imageBuffer = await generateImage(promptInfo.prompt);

      // WebP 압축
      const webpBuffer = await compressToWebP(imageBuffer);

      // R2 업로드
      const thumbnailUrl = await uploadToR2(webpBuffer, promptInfo.filename);

      // Airtable 업데이트
      await updateAirtable(post.id, thumbnailUrl);

      console.log(`  ✅ 완료: ${thumbnailUrl}`);

      // Rate limit 방지
      await new Promise(r => setTimeout(r, 2000));

    } catch (error) {
      console.error(`  ❌ 오류: ${error.message}`);
    }
  }

  console.log('\n🎉 이미지 생성 파이프라인 완료!');
}

main().catch(console.error);
