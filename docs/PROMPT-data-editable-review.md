# data-editable 속성 점검 작업 분배

## 프로젝트 배경

### 목적
관리자 대시보드(`admin/pages.html`)에서 홈페이지 텍스트를 직접 수정할 수 있는 인라인 에디터 시스템.
HTML 파일의 `data-editable` 속성이 부여된 요소만 편집 가능.

### 핵심 문서
- PRD: `docs/PRD-inline-editor.md`
- TDD: `docs/TDD-inline-editor.md`

### ID 명명 규칙
```
{페이지}-{섹션}-{요소}[-{인덱스}]

예시:
- index-hero-badge
- index-hero-title
- index-process-step1-title
- about-system-feature1-title
```

### 마킹 제외 대상
- 헤더 (`<header>`)
- 푸터 (`<footer>`)
- 입력 폼 (`<form>`, `<input>`, `<select>`)
- 네비게이션 (`<nav>`)
- 스크립트/스타일 (`<script>`, `<style>`)

### 마킹 방법
```html
<!-- 마킹 전 -->
<h1>정책자금 전문 컨설팅</h1>

<!-- 마킹 후 -->
<h1 data-editable="index-hero-title">정책자금 전문 컨설팅</h1>
```

---

# 클로드1 요청문 (index.html, about.html)

```
## 작업: data-editable 속성 누락 점검 및 추가

### 프로젝트 배경
관리자 대시보드에서 홈페이지 텍스트를 편집할 수 있는 인라인 에디터 시스템입니다.
`data-editable` 속성이 부여된 요소만 관리자 페이지에서 편집 가능합니다.

### ID 명명 규칙
{페이지}-{섹션}-{요소}[-{인덱스}]
예: index-hero-badge, index-process-step1-title

### 담당 파일
1. **index.html** (메인 페이지)
2. **about.html** (회사 소개)

### 점검 항목

#### index.html 히어로 섹션 (누락 확인된 부분)
- [ ] bizen-rate-label: "KPFC 컨설팅" → index-hero-rate-premium-label
- [ ] bizen-rate-value: 95% → index-hero-rate-premium-value (동적 값이므로 스킵 가능)
- [ ] bizen-rate-status: "✅ 높은 승인률" → index-hero-rate-premium-status
- [ ] bizen-rate-label: "일반 신청" → index-hero-rate-standard-label
- [ ] bizen-rate-value: 45% → index-hero-rate-standard-value (동적 값이므로 스킵 가능)
- [ ] bizen-rate-status: "❌ 낮은 승인률" → index-hero-rate-standard-status
- [ ] bizen-graph-label: "KPFC 컨설팅" → index-hero-graph-premium-label
- [ ] bizen-graph-label: "일반 신청" → index-hero-graph-standard-label
- [ ] bizen-legend-label: "✅ 전문가 컨설팅" → index-hero-legend-premium
- [ ] bizen-legend-label: "❌ 직접 신청" → index-hero-legend-standard
- [ ] bizen-cta-btn: "정책자금 로드맵" → index-hero-cta-primary
- [ ] bizen-cta-btn: "전문가 네트워크" → index-hero-cta-secondary

#### index.html 기타 섹션 전체 점검
- process 섹션의 모든 텍스트 요소
- service 섹션의 모든 텍스트 요소
- trust 섹션의 모든 텍스트 요소
- board 섹션의 모든 텍스트 요소

#### about.html 전체 점검
- hero 섹션
- system 섹션
- category 섹션
- employees 섹션

### 작업 절차
1. Read 도구로 파일 전체 읽기
2. 각 섹션별로 텍스트 요소 확인
3. data-editable 누락된 요소 식별
4. Edit 도구로 속성 추가
5. 완료 후 변경 사항 정리

### 참고 문서
- docs/PRD-inline-editor.md
- docs/TDD-inline-editor.md

### 마킹 제외 대상
- 헤더, 푸터, 네비게이션
- 입력 폼, 스크립트, 스타일
```

---

# 클로드2 요청문 (fund.html, service.html)

```
## 작업: data-editable 속성 누락 점검 및 추가

### 프로젝트 배경
관리자 대시보드에서 홈페이지 텍스트를 편집할 수 있는 인라인 에디터 시스템입니다.
`data-editable` 속성이 부여된 요소만 관리자 페이지에서 편집 가능합니다.

### ID 명명 규칙
{페이지}-{섹션}-{요소}[-{인덱스}]
예: fund-hero-badge, service-expert-card1-title

### 담당 파일
1. **fund.html** (정책자금 안내)
2. **service.html** (서비스 안내)

### 점검 항목

#### fund.html 섹션별 점검
| 섹션 ID | 섹션명 | 아이콘 |
|---------|--------|--------|
| hero | 히어로 섹션 | 🎯 |
| process | 진행절차 섹션 | 📋 |
| detail | 자금상세 섹션 | 💰 |
| success | 성공사례 섹션 | 🏆 |

체크 포인트:
- 모든 제목(h1, h2, h3, h4)
- 모든 설명 텍스트(p, span)
- 버튼/링크 텍스트(a, button)
- 카드 내부 텍스트
- 리스트 항목

#### service.html 섹션별 점검
| 섹션 ID | 섹션명 | 아이콘 |
|---------|--------|--------|
| hero | 히어로 섹션 | 🎯 |
| expert | 전문가 섹션 | 👨‍💼 |

체크 포인트:
- 히어로 배지, 제목, 설명
- 카드 제목 및 설명
- CTA 버튼 텍스트
- 전문가 섹션 모든 텍스트

### 작업 절차
1. Read 도구로 파일 전체 읽기
2. 각 섹션별로 텍스트 요소 확인
3. data-editable 누락된 요소 식별
4. Edit 도구로 속성 추가
5. 완료 후 변경 사항 정리

### 참고 문서
- docs/PRD-inline-editor.md
- docs/TDD-inline-editor.md

### 마킹 제외 대상
- 헤더, 푸터, 네비게이션
- 입력 폼, 스크립트, 스타일
```

---

# 클로드3 요청문 (process.html + 전체 검증)

```
## 작업: data-editable 속성 누락 점검 및 전체 검증

### 프로젝트 배경
관리자 대시보드에서 홈페이지 텍스트를 편집할 수 있는 인라인 에디터 시스템입니다.
`data-editable` 속성이 부여된 요소만 관리자 페이지에서 편집 가능합니다.

### ID 명명 규칙
{페이지}-{섹션}-{요소}[-{인덱스}]
예: process-hero-badge, process-faq-title

### 담당 파일
1. **process.html** (진행 절차) - 주 작업
2. **전체 페이지 검증** - 보조 작업

### 점검 항목

#### process.html 섹션별 점검
| 섹션 ID | 섹션명 | 아이콘 |
|---------|--------|--------|
| hero | 히어로 섹션 | 🎯 |
| service | 서비스특징 섹션 | ✨ |
| faq | FAQ 섹션 | ❓ |
| cta | CTA 섹션 | 📢 |

체크 포인트:
- 모든 제목(h1, h2, h3, h4)
- 모든 설명 텍스트(p, span)
- 버튼/링크 텍스트(a, button)
- FAQ 질문/답변 텍스트
- CTA 섹션 모든 텍스트

### 전체 검증 작업

모든 페이지의 data-editable 개수 집계:
```bash
grep -c 'data-editable=' index.html about.html fund.html service.html process.html
```

결과 정리 형식:
| 페이지 | 기존 개수 | 추가 개수 | 총 개수 |
|--------|-----------|-----------|---------|
| index.html | ? | ? | ? |
| about.html | ? | ? | ? |
| fund.html | ? | ? | ? |
| service.html | ? | ? | ? |
| process.html | ? | ? | ? |

### 작업 절차
1. Read 도구로 process.html 전체 읽기
2. 각 섹션별로 텍스트 요소 확인
3. data-editable 누락된 요소 식별
4. Edit 도구로 속성 추가
5. Grep으로 전체 페이지 집계
6. 최종 리포트 작성

### 참고 문서
- docs/PRD-inline-editor.md
- docs/TDD-inline-editor.md

### 마킹 제외 대상
- 헤더, 푸터, 네비게이션
- 입력 폼, 스크립트, 스타일

### 최종 산출물
1. process.html 수정 완료
2. 전체 페이지 data-editable 집계표
3. 누락 항목 리포트 (있는 경우)
```

---

## 작업 완료 후

### 병합 순서
1. 클로드1 → 클로드2 → 클로드3 순서로 커밋
2. 또는 각자 별도 브랜치 후 병합

### 최종 확인
1. `admin/pages.html` 접속
2. 각 페이지 탭에서 편집 가능 항목 확인
3. 섹션별 그룹화 정상 표시 확인

---

## 📊 검증 현황 (2025-12-28 기준)

### 현재 data-editable 개수

| 페이지 | 개수 | 비고 |
|--------|------|------|
| index.html | 81개 | 히어로, 프로세스, 서비스, 트러스트, 보드 섹션 |
| about.html | 40개 | 히어로, 시스템, 카테고리, CEO, 직원 섹션 |
| fund.html | 40개 | 히어로, 프로세스, 상세, 성공사례 섹션 |
| process.html | 56개 | 히어로, 서비스특징, FAQ, CTA 섹션 |
| service.html | 21개 | 히어로, 전문가 섹션 |
| **총계** | **238개** | |

### 추가 작업 필요 항목 (Phase 2)

다음 세션에서 3개 클로드로 분담 예정:

| 담당 | 파일 | 추가 대상 | 예상 개수 |
|------|------|----------|----------|
| 클로드1 | index.html, about.html | 리스트 아이템, 상세 텍스트 | +30개 |
| 클로드2 | fund.html | fund-summary, info-value, requirement-text, benefit 등 | +80개 |
| 클로드3 | process.html, service.html | expert-list li, 상세 요건 텍스트 | +20개 |

### 관리자 대시보드 UI 개선 제안

- **섹션별 접힘/펼침** 구조 적용
- 기본 상태: 모든 섹션 접혀있음
- 편집하고자 할 때만 해당 섹션 펼침
- 편집 항목이 많아지면 필수적인 UX 개선

### 명명 규칙 준수 확인

```
✅ {페이지}-{섹션}-{요소}[-{인덱스}]

예시:
- index-hero-badge ✅
- fund-process-step1-title ✅
- service-expert-card1-title ✅
- process-faq-q1 ✅
```

### 제외 항목 확인

- ✅ 헤더/푸터/네비게이션 제외됨
- ✅ 입력 폼 제외됨
- ✅ 스크립트/스타일 제외됨
