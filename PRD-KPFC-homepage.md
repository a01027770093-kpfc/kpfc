# PRD: 한국정책자금지원센터(KPFC) 홈페이지 제작

## 1. 프로젝트 개요

### 1.1 목표
bizen 홈페이지 디자인을 기반으로 한국정책자금지원센터(KPFC) 홈페이지 제작

### 1.2 기본 정보
- **클라이언트**: 한국정책자금지원센터
- **도메인**: kpfc.kr
- **기반 템플릿**: bizen (F:\pola_homepage\1.14th_jeonyejin_bizen)
- **개발 방식**: 순수 HTML 파일 직접 편집 (빌드 시스템 미사용)

### 1.3 프로젝트 경로
| 환경 | 경로 |
|------|------|
| **Vercel** | https://vercel.com/kpfcs-projects/kpfc |
| **GitHub** | https://github.com/a01027770093-kpfc/kpfc |
| **로컬** | F:\pola_homepage\4.20th_ijonghyun_KPFC\ |
| **관리자대시보드** | 로컬 프로젝트 경로 내 `admin/` 폴더 |

### 1.4 R2 이미지 저장소
| 항목 | 값 |
|------|-----|
| **버킷명** | kpfc |
| **Public URL** | https://pub-bf39e5c4b6ef41af31941676cc384300.r2.dev/ |
| **이미지 경로** | board/{filename}.webp |

### 1.3 일정
- Phase 1: 파일 복사 및 기본 세팅 ✅
- Phase 2: 컨텐츠 커스텀 (텍스트, 이미지)
- Phase 3: 디자인 커스텀 (색상, 레이아웃)
- Phase 4: 테스트 및 최종 검수

---

## 2. 개발 방식 (중요)

### 2.1 순수 HTML 방식
- **빌드 시스템 미사용**: node build.js 사용하지 않음
- **직접 편집**: bizen dist/ 폴더의 완성된 HTML 파일을 직접 수정
- **로컬 테스트**: 브라우저에서 HTML 파일 직접 열어서 확인

### 2.2 작업 폴더 구조
```
F:\pola_homepage\4.20th_ijonghyun_KPFC\
├── index.html          ← 메인 페이지 (모든 페이지 접근 가능)
├── about.html          ← 회사소개
├── fund.html           ← 정책자금
├── service.html        ← 서비스
├── process.html        ← 진행절차
├── marketing.html      ← 마케팅 (선택)
├── css/
│   └── main.css        ← 스타일시트
├── js/
│   └── main.js         ← 스크립트
├── images/             ← 이미지 폴더
├── color-guide.html    ← 컬러 가이드
├── company-info.md     ← 회사 정보
└── PRD-KPFC-homepage.md ← 이 문서
```

### 2.3 인덱스 페이지 네비게이션
index.html에서 모든 페이지로 접근 가능한 구조:
- 상단 헤더 메뉴에 모든 페이지 링크 포함
- 각 페이지 간 상호 링크 연결

---

## 3. 페이지 구성

| 페이지 | 파일명 | 설명 | 담당 |
|--------|--------|------|------|
| 메인 | index.html | 랜딩 페이지 | 클로드 1 |
| 회사소개 | about.html | 센터 소개, 대표 인사말 | 클로드 2 |
| 정책자금 | fund.html | 정책자금 종류 및 안내 | 클로드 2 |
| 서비스 | service.html | 제공 서비스 안내 | 클로드 3 |
| 진행절차 | process.html | 상담~지원 프로세스 | 클로드 3 |
| 마케팅 | marketing.html | 마케팅 서비스 (선택) | 클로드 3 |

---

## 4. 브랜드 컬러 시스템

### 4.1 Primary - 딥 네이비 퍼플 (#1D00AD 기반)
| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | 딥 네이비 퍼플 | #1D00AD |
| Primary Light | 라이트 | #2E1AE0 |
| Primary Dark | 다크 | #150080 |
| Primary Pale | 페일 (배경) | #E8E5F8 |

### 4.2 Accent - 브라이트 인디고
| 용도 | 색상 | HEX |
|------|------|-----|
| Accent | 인디고 | #4338CA |
| Accent Light | 라이트 | #6366F1 |
| Accent Dark | 다크 | #3730A3 |
| Accent Pale | 페일 | #EEF2FF |

### 4.3 Secondary - 차분한 네이비 블루
| 용도 | 색상 | HEX |
|------|------|-----|
| Secondary | 네이비 블루 | #1E3A5F |
| Secondary Light | 라이트 | #2D5A87 |
| Secondary Dark | 다크 | #0F1D30 |
| Secondary Pale | 페일 | #E8F0F8 |

### 4.4 컬러 가이드 파일
- 위치: `color-guide.html`
- 클릭하면 색상값 복사 가능

---

## 5. 리라이팅 규칙 (텍스트 치환)

### 5.0 SEO 리라이팅 원칙
- **의도 유지**: 원본 텍스트의 의도와 목적 유지
- **글자수 유지**: 원본과 비슷한 글자수 유지
- **맥락 유지**: 문맥과 톤앤매너 유지
- **SEO 최적화**: 검색엔진 최적화를 위한 키워드 자연스럽게 삽입
- **키워드**: 정책자금, 중소기업, 기업자금, 정부지원금, 자금지원 등

### 5.1 회사명 치환
| 기존 | 변경 |
|------|------|
| 비젠파트너스 | 한국정책자금지원센터 |
| 비젠 | KPFC |
| BIZEN | KPFC |
| bizen | kpfc |

### 5.2 연락처 치환
| 항목 | 변경값 |
|------|--------|
| 대표번호 | 1588-9097 |
| 핸드폰 | 010-2777-0093 |
| 이메일 | gunme7@naver.com |

### 5.3 도메인/URL 치환
| 기존 | 변경 |
|------|------|
| bizen.co.kr | kpfc.kr |
| https://bizen.co.kr | https://kpfc.kr |

### 5.4 주소 치환
| 기존 | 변경 |
|------|------|
| (기존 주소) | 서울특별시 강남구 강남대로 92길 31, 6층 |

### 5.5 대표자 치환
| 기존 | 변경 |
|------|------|
| (기존 대표) | 이종현 |

### 5.6 사업자번호 치환
| 기존 | 변경 |
|------|------|
| (기존 번호) | 168-60-00727 |

### 5.7 컬러 치환 (CSS)
| 기존 (bizen) | 변경 (KPFC) |
|--------------|-------------|
| #1D4ED8 | #1D00AD |
| #2563EB | #2E1AE0 |
| #1E40AF | #150080 |
| #3B82F6 | #4338CA |

---

## 6. 공통 컴포넌트 규칙

### 6.1 동일 디자인 적용 (KPFC 브랜딩 기준)
모든 페이지에서 아래 컴포넌트는 **KPFC 브랜딩된 동일한 디자인** 사용:
- **헤더**: 로고, 메뉴, 연락처 (KPFC 브랜딩)
- **푸터**: 회사 정보, 링크 (KPFC 브랜딩)
- **상담 입력폼**: 동일한 폼 디자인 (KPFC 브랜딩)

### 6.2 헤더 액티브 상태
- 현재 페이지에 해당하는 메뉴에 `active` 클래스 적용
- 각 페이지별로 액티브 메뉴만 다르게 설정:
  - index.html → 홈 active
  - about.html → 회사소개 active
  - fund.html → 정책자금 active
  - service.html → 서비스 active
  - process.html → 진행절차 active
  - marketing.html → 마케팅 active

### 6.3 작업 순서 권장
1. **클로드 1**이 먼저 index.html에서 헤더/푸터/폼 KPFC 브랜딩 완료
2. **클로드 2, 3**은 클로드 1이 완성한 헤더/푸터/폼을 복사하여 사용
3. 각 페이지에서 헤더 active 클래스만 해당 메뉴로 변경

---

## 7. 컨텍스트 관리 규칙

### 7.1 컨텍스트 10% 이하 시
- 현재 작업 상태 정리
- 다음 세션용 요청문 생성
- 완료/미완료 항목 명확히 기록
- PRD 문서 업데이트

### 7.2 세션 인수인계 형식
```
## 인수인계 요약
- 완료: [완료된 작업 목록]
- 진행중: [현재 작업]
- 미완료: [남은 작업]
- 다음 작업: [우선순위 순]
```

---

## 8. 커스텀 범위

### 8.1 필수 변경 (Must)
- [ ] 회사명: 비젠파트너스 → 한국정책자금지원센터
- [ ] 로고 교체
- [ ] 대표번호: 1588-9097
- [ ] 주소, 이메일, 사업자번호
- [ ] 도메인: bizen.co.kr → kpfc.kr
- [ ] OG 이미지, 파비콘
- [ ] 브랜드 컬러 적용 (#1D00AD 기반)

### 8.2 권장 변경 (Should)
- [ ] 대표 이미지 교체
- [ ] CEO 인사말 작성
- [ ] 서비스 항목 재정의

### 8.3 선택 변경 (Could)
- [ ] 마케팅 페이지 유지 여부
- [ ] 추가 페이지 요청

---

## 6. 작업 분배 (클로드 1, 2, 3)

### 클로드 1 (현재 세션) - 프로젝트 셋업 & 메인 페이지
**담당 범위**:
1. ✅ bizen → KPFC 파일 복사
2. ✅ 컬러 가이드 생성
3. **index.html** (메인 페이지) 커스텀
4. 공통 헤더/푸터 수정
5. CSS 컬러 변수 업데이트

**작업 파일**: `index.html`, `css/main.css`

### 클로드 2 - 서브 페이지 (about, fund)
**담당 범위**:
1. **about.html** 전체 커스텀
2. **fund.html** 전체 커스텀

**작업 파일**: `about.html`, `fund.html`

### 클로드 3 - 서브 페이지 (service, process, marketing)
**담당 범위**:
1. **service.html** 전체 커스텀
2. **process.html** 전체 커스텀
3. **marketing.html** (필요시)

**작업 파일**: `service.html`, `process.html`, `marketing.html`

---

## 7. 회사 정보

| 항목 | 내용 |
|------|------|
| **브랜드명** | 한국정책자금지원센터 |
| **영문명** | KPFC (Korea Policy Fund Center) |
| **대표** | 이종현 |
| **대표번호** | 1588-9097 |
| **핸드폰** | 010-2777-0093 |
| **이메일** | gunme7@naver.com |
| **홈페이지** | https://kpfc.kr |
| **주소** | 서울특별시 강남구 강남대로 92길 31, 6층 |
| **사업자등록번호** | 168-60-00727 |

---

## 8. 체크리스트

### Phase 1: 파일 복사 ✅
- [x] bizen 전체 복사
- [x] 컬러 가이드 생성
- [x] 불필요 파일 제거 (bizen 특화 파일)

### Phase 2: 공통 커스텀 ✅
- [x] 헤더 - 로고, 메뉴, 연락처
- [x] 푸터 - 회사 정보 전체
- [x] CSS 컬러 변수 업데이트 (#1D4ED8 → #1D00AD, #3B82F6 → #4338CA)
- [x] 상담 폼 수정

### Phase 3: 페이지별 커스텀
- [x] index.html (클로드 1) ✅
- [x] about.html (클로드 2) ✅
- [x] fund.html (클로드 2) ✅
- [ ] service.html (클로드 3) ⏳ 미완료
- [x] process.html (클로드 3) ✅
- [x] marketing.html (클로드 3) ✅

### Phase 4: 마무리
- [ ] 로고 이미지 파일 추가 (images/kpfc-logo-white.png)
- [ ] KPFC용 Worker URL 변경
- [ ] OG 이미지 교체
- [ ] 파비콘 교체
- [x] 메타 태그 수정 (완료된 페이지들)
- [ ] 전체 테스트

---

## 9. 참고 자료

- bizen 소스: `F:\pola_homepage\1.14th_jeonyejin_bizen\dist`
- 회사 정보: `company-info.md`
- 컬러 가이드: `color-guide.html`
- 기획서: `폴라애드 정책자금 홈페이지 구성안.hwpx`

---

## 10. 세션 인수인계 (2024-12-26)

### 완료된 작업 ✅

| 파일 | 담당 | 상태 | 변경 내용 |
|------|------|------|----------|
| index.html | 클로드 1 | ✅ | CSS 컬러 변수, 메타태그, 헤더, 푸터, 상담폼, 히어로, 프로세스, 서비스, 신뢰 섹션, 게시판 목업, 이메일 템플릿 |
| about.html | 클로드 2 | ✅ | 메타태그, 헤더, 히어로, 본문(KPFC System, 정책자금 시스템, 사업분야, 대표 인사말), 폼, 푸터 |
| fund.html | 클로드 2 | ✅ | 메타태그, 헤더, 히어로, 본문(프로세스, 정책자금 전문, 승인사례), 폼, 푸터 |
| process.html | 클로드 3 | ✅ | 푸터 전체 교체 (로고, 대표, 사업자, 전화, 이메일, 주소, 메뉴, Copyright) |
| marketing.html | 클로드 3 | ✅ | 메타태그, 헤더, 폼 영역, 이메일 템플릿(고객/담당자), 푸터 |

### 미완료 작업 ⏳

| 우선순위 | 작업 | 설명 |
|----------|------|------|
| 1 | **service.html** | 클로드 3 담당이었으나 미완료. KPFC 브랜딩 필요 |
| 2 | **로고 이미지** | `images/kpfc-logo-white.png` 파일 필요 |
| 3 | **Worker URL** | `https://bizen-homepage.weandbiz.workers.dev` → KPFC용 Worker로 변경 |
| 4 | **OG 이미지** | KPFC용 Open Graph 이미지 교체 |
| 5 | **파비콘** | KPFC용 favicon 교체 |
| 6 | **전체 테스트** | 모든 페이지 브라우저 확인 |

### 다음 세션 요청문

```
KPFC 홈페이지 작업 계속 진행해줘.

PRD 문서: PRD-KPFC-homepage.md

남은 작업:
1. service.html - KPFC 브랜딩 적용 (index.html 헤더/푸터 복사 후 active 클래스 변경)
2. 로고 이미지 파일 준비 (images/kpfc-logo-white.png)
3. Worker URL 변경
4. OG 이미지, 파비콘 교체
5. 전체 테스트

회사 정보는 company-info.md 참고
컬러 가이드는 color-guide.html 참고
```

### 변경된 회사 정보 요약

- **브랜드명**: 한국정책자금지원센터 (KPFC)
- **대표**: 이종현
- **대표번호**: 1588-9097
- **이메일**: gunme7@naver.com
- **주소**: 서울특별시 강남구 강남대로 92길 31, 6층
- **사업자등록번호**: 168-60-00727
- **도메인**: kpfc.kr

---

---

## 11. 이미지 생성 파이프라인 (TDD 상태 체크)

### 11.1 파이프라인 개요
```
이미지 생성 (Gemini) → WebP 압축 (100KB) → R2 버킷 저장 → Airtable 캐시 → 프론트엔드 연동
```

### 11.2 스크립트 위치
- `scripts/generate-images.mjs` - 메인 파이프라인 스크립트

### 11.3 환경 설정
| 항목 | 상태 | 값 |
|------|------|-----|
| Gemini API Key | ✅ | .env에 설정됨 |
| R2 Bucket | ✅ | `kpfc` |
| R2 Access Key | ✅ | .env에 설정됨 |
| Airtable API Key | ✅ | .env에 설정됨 |
| Airtable Base ID | ✅ | `appwr3xRqHrc3z0zQ` |

### 11.4 게시글 이미지 생성 상태

| 게시글 제목 | 파일명 | 상태 | R2 URL |
|------------|--------|------|--------|
| 2026년 중소기업 정책자금 4조원 공급 확정 | policy-fund-4trillion-2026.webp | ✅ | [R2 완료] |
| 비수도권 기업 60% 이상 집중 지원 | regional-support-60percent.webp | ✅ | [R2 완료] |
| AI 전환(AX) 기업 우대트랙 신설 | ai-transformation-track.webp | ✅ | [R2 완료] |
| 정책자금 내비게이션 AI 서비스 출시 | policy-fund-navigator-ai.webp | ✅ | [R2 완료] |
| 2026년 정책자금 신청일정 안내 | application-schedule-2026.webp | ✅ | [R2 완료] |
| K-뷰티 산업 정책자금 지원 2배 확대 | kbeauty-fund-expansion.webp | ✅ | [R2 완료] |

### 11.5 파이프라인 체크리스트

**Phase 1: 이미지 생성** ✅
- [x] Gemini API 연동 (gemini-2.0-flash-exp)
- [x] 게시글별 프롬프트 정의
- [x] 6개 게시글 이미지 생성 완료

**Phase 2: 이미지 압축** ✅
- [x] Sharp 라이브러리 설정
- [x] WebP 포맷 변환 (1200x630)
- [x] Quality 85로 압축

**Phase 3: R2 업로드** ✅
- [x] AWS S3 SDK 연동
- [x] R2 버킷 `kpfc` 생성됨
- [x] Public URL 설정

**Phase 4: Airtable 연동** ✅
- [x] thumbnailUrl 필드 업데이트 로직
- [x] 모든 게시글 URL 업데이트 완료

**Phase 5: 프론트엔드 연동** ⏳
- [ ] post.html에서 thumbnailUrl 표시 확인
- [ ] index.html 게시판 섹션 이미지 표시 확인

### 11.6 재개 명령어
```bash
cd F:\pola_homepage\4.20th_ijonghyun_KPFC
npm run generate-images
```

### 11.7 마지막 실행 결과 (2025-12-26)
```
✅ 6개 완료 (모든 게시글 이미지 생성 완료)

R2 URL 패턴: https://pub-bf39e5c4b6ef41af31941676cc384300.r2.dev/board/{filename}.webp

생성된 파일:
1. policy-fund-4trillion-2026.webp
2. regional-support-60percent.webp
3. ai-transformation-track.webp
4. policy-fund-navigator-ai.webp
5. application-schedule-2026.webp
6. kbeauty-fund-expansion.webp
```

---

---

## 12. 빌드 시스템 수정 (2025-12-26) ⚠️ 중요

### 12.1 문제 상황
- **기존**: src/ 폴더의 bizen 템플릿 컴포넌트가 빌드되어 배포됨
- **결과**: 루트의 KPFC 커스텀된 HTML 파일이 무시됨

### 12.2 해결 조치 (완료)
| 작업 | 상태 | 설명 |
|------|------|------|
| **src/ 폴더 삭제** | ✅ | bizen 템플릿 컴포넌트 완전 폐기 |
| **build.cjs 수정** | ✅ | 루트 HTML → dist 직접 복사 |
| **vercel.json 추가** | ✅ | outputDirectory: dist |

### 12.3 빌드 소스 (공식)
```
⚠️ 빌드 소스는 반드시 루트의 HTML 파일만 사용

F:\pola_homepage\4.20th_ijonghyun_KPFC\
├── index.html      ← 메인 (빌드 소스)
├── about.html      ← 회사소개 (빌드 소스)
├── fund.html       ← 정책자금 (빌드 소스)
├── process.html    ← 진행절차 (빌드 소스)
├── service.html    ← 서비스 (빌드 소스)
├── marketing.html  ← 마케팅 (빌드 소스)
├── post.html       ← 게시글 상세 (빌드 소스)
├── policy.html     ← 이용약관 (빌드 소스)
└── privacy.html    ← 개인정보처리방침 (빌드 소스)
```

### 12.4 빌드 흐름
```
루트 HTML 파일들 (KPFC 커스텀 완료)
    ↓
build.cjs (직접 복사, 변환 없음)
    ↓
dist/ 폴더
    ↓
Vercel 배포
```

### 12.5 금지 사항
- ❌ src/ 폴더 재생성 금지
- ❌ bizen 템플릿 컴포넌트 사용 금지
- ❌ 루트 HTML 외 다른 소스로 빌드 금지

### 12.6 재빌드 체크리스트
- [x] src/ 폴더 삭제 (bizen 템플릿 폐기)
- [x] build.cjs 수정 (루트 HTML 직접 복사)
- [x] vercel.json 추가 (outputDirectory: dist)
- [ ] Git commit & push
- [ ] Vercel 빌드 성공 확인

---

*문서 버전: 1.4*
*작성일: 2024-12-25*
*수정: 2024-12-26 - 세션 인수인계 추가, 진행 상황 업데이트*
*수정: 2025-12-26 - 이미지 생성 파이프라인 TDD 상태 체크 추가*
*수정: 2025-12-26 - 빌드 시스템 수정 (src 삭제, 루트 HTML 직접 복사)*
