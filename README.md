# 한국정책자금지원센터 KPFC 홈페이지

중소기업 정책자금 전문 컨설팅 기관 KPFC의 공식 홈페이지입니다.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | KPFC Homepage |
| **버전** | 1.0.0 |
| **유형** | 정적 HTML 웹사이트 |
| **배포 URL** | https://kpfc.kr / https://k-pfc.co.kr |
| **빌드 결과** | `dist/` 폴더 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **폰트** | Pretendard (CDN) |
| **차트** | Chart.js |
| **빌드** | Node.js (build.cjs) |
| **이미지 처리** | Sharp, Puppeteer |
| **클라우드** | AWS S3 (이미지 저장) |
| **분석** | Google Analytics (G-HS98DV98SR) |

---

## 디렉토리 구조

```
kpfc-homepage/
├── index.html              # 메인 페이지
├── about.html              # 회사소개
├── process.html            # 진행절차
├── fund.html               # 정책자금 안내
├── service.html            # 전문가 서비스
├── marketing.html          # 온라인 마케팅
├── post.html               # 게시판 (공지사항/뉴스)
├── policy.html             # 이용약관
├── privacy.html            # 개인정보처리방침
│
├── admin/                  # 관리자 대시보드
│   ├── index.html          # 대시보드 메인
│   ├── leads.html          # 접수내역 관리
│   ├── board.html          # 게시판 관리
│   ├── board-edit.html     # 게시판 에디터
│   ├── analytics.html      # 방문통계
│   └── settings.html       # 설정
│
├── css/
│   ├── main.css            # 메인 사이트 스타일
│   └── dashboard.css       # 관리자 대시보드 스타일
│
├── js/
│   ├── analytics.js        # 통계 차트 및 데이터
│   ├── components.js       # 공통 컴포넌트 로더
│   └── settings.js         # 설정 페이지 기능
│
├── images/
│   ├── kpfc-logo.png       # 로고
│   ├── og-image.png        # OG 이미지
│   └── board/              # 게시판 썸네일
│
├── docs/                   # 개발 문서
│   ├── PRD-inline-editor.md
│   ├── PRD-employee-cards.md
│   └── *.html              # 설정 가이드
│
├── scripts/
│   └── generate-images.mjs # 이미지 생성 스크립트
│
├── build.cjs               # 빌드 스크립트
├── package.json            # 프로젝트 설정
├── company-info.md         # 회사 정보
├── llms.txt                # AI 크롤러용 정보
└── dist/                   # 빌드 결과물 (배포용)
```

---

## 페이지 구성

### 공개 페이지

| 페이지 | 파일 | 설명 |
|--------|------|------|
| 메인 | `index.html` | 히어로, 서비스 소개, CTA, 고객 후기 |
| 회사소개 | `about.html` | 비전, 미션, 전문가 소개 |
| 진행절차 | `process.html` | 상담부터 지원금 수령까지 프로세스 |
| 정책자금 | `fund.html` | 창업/운전/시설자금 상세 안내 |
| 전문가서비스 | `service.html` | 컨설팅 서비스 상세 |
| 마케팅 | `marketing.html` | 온라인 마케팅 서비스 |
| 게시판 | `post.html` | 공지사항, 뉴스, 정책자금 소식 |
| 이용약관 | `policy.html` | 서비스 이용약관 |
| 개인정보 | `privacy.html` | 개인정보처리방침 |

### 관리자 페이지 (`/admin/`)

| 페이지 | 파일 | 설명 |
|--------|------|------|
| 대시보드 | `index.html` | 주요 지표 요약 |
| 접수내역 | `leads.html` | 상담 신청 목록 관리 |
| 게시판 관리 | `board.html` | 게시글 CRUD |
| 게시판 에디터 | `board-edit.html` | 게시글 작성/수정 |
| 방문통계 | `analytics.html` | 일간/주간/월간 통계 차트 |
| 설정 | `settings.html` | 시스템 설정 |

---

## 브랜드 가이드

### 회사 정보

| 항목 | 내용 |
|------|------|
| **브랜드명** | 한국정책자금지원센터 |
| **영문명** | KPFC (Korea Policy Fund Center) |
| **대표** | 이종현 |
| **대표번호** | 1588-9097 |
| **이메일** | gunme7@naver.com |
| **주소** | 서울특별시 강남구 강남대로 92길 31, 6층 |
| **사업자등록번호** | 168-60-00727 |

### 브랜드 컬러

```css
/* Primary - 딥 네이비 퍼플 */
--primary: #1D00AD;
--primary-dark: #150080;
--primary-light: #E8E5F8;
--primary-hover: #2E1AE0;

/* Accent - 브라이트 인디고 */
--accent: #4338CA;
--accent-dark: #3730A3;
--accent-light: #6366F1;

/* Status Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
```

### 타이포그래피

- **기본 폰트**: Pretendard
- **폰트 CDN**: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css`

---

## 주요 기능

### 1. SEO 최적화
- Google/Naver 검색 콘솔 연동
- JSON-LD 구조화 데이터 (Organization, FinancialService, BreadcrumbList, FAQ)
- Open Graph / Twitter Card 메타태그
- Canonical URL 설정
- AI 크롤러용 `llms.txt` 제공

### 2. 관리자 대시보드
- 접수내역 관리 (Airtable 연동 가능)
- 게시판 CRUD (썸네일 업로드 지원)
- 방문통계 차트 (일간/주간/월간)
- 자동 인사이트 분석

### 3. 반응형 디자인
- 모바일 최적화 (320px~)
- 태블릿 (768px~)
- 데스크톱 (1024px~)

### 4. 성능 최적화
- Preconnect / DNS-prefetch
- 이미지 최적화 (WebP 지원)
- CSS 변수 기반 테마 시스템

---

## 개발 가이드

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
# http://localhost:8080 에서 확인
```

### 빌드

```bash
npm run build
# dist/ 폴더에 결과물 생성
```

### 이미지 생성

```bash
npm run generate-images
# 게시판 썸네일 자동 생성
```

---

## 빌드 프로세스

`build.cjs` 스크립트가 수행하는 작업:

1. `dist/` 폴더 생성
2. HTML 파일 복사 (index, about, process, fund, service, marketing, post, policy, privacy)
3. 정적 파일 복사 (sitemap.xml, robots.txt)
4. 이미지 파일 복사 (png, jpg, svg, webp, ico 등)
5. 폴더 복사 (css, js, images, admin)

---

## 외부 연동

### Google Analytics
- 추적 ID: `G-HS98DV98SR`
- GTM 사용

### 검색엔진
- Google Search Console: `oTFWvzDYhGW_CdsEylpP3AJMWRj3hYKZD8vA_d6YBMo`
- Naver Search Advisor: `0750d6e9927b747383b5ef33b9dc00b66c202059`

### 클라우드 서비스
- AWS S3: 이미지 저장
- Airtable: 게시판/접수내역 데이터 (선택적)

---

## 성과 지표

- **승인률**: 95%
- **평균 지원금**: 3.2억원
- **누적 성공 사례**: 150건+
- **고객 만족도**: 4.9/5.0

---

## 라이선스

Copyright 2025 한국정책자금지원센터 KPFC. All Rights Reserved.

---

## 문의

- **대표번호**: 1588-9097
- **이메일**: gunme7@naver.com
- **운영시간**: 평일 09:00 ~ 18:00
