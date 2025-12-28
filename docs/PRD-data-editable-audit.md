# PRD: data-editable 속성 전체 점검

## 1. 개요

### 1.1 목적
index.html 및 기타 페이지의 모든 편집 가능한 텍스트 요소에 `data-editable` 속성이 올바르게 마킹되어 있는지 점검하고 누락된 항목을 추가합니다.

### 1.2 명명 규칙
```
{페이지}-{섹션}-{요소}[-{인덱스}]
```

예시: `index-hero-title`, `index-features-item1-desc`

### 1.3 제외 대상
- 헤더/푸터/네비게이션
- 입력 폼 (`<form>`, `<input>`, `<select>`)
- 스크립트/스타일
- 동적 카운터 (count-up 등)
- SVG 아이콘

---

## 2. 점검 현황

### 2.1 index.html (총 107개)

| 섹션 | 상태 | 마킹 수 | 비고 |
|------|------|---------|------|
| hero | ✅ 완료 | 18개 | 2024-12-28 점검 완료 |
| process | ✅ 완료 | 24개 | 2024-12-28 리스트 항목 6개 추가 |
| features (bizen-service) | ✅ 완료 | 26개 | 탭/노트러스트 포함 |
| trust | ✅ 완료 | 25개 | 리뷰/보장 포함 |
| board | ✅ 완료 | 2개 | 동적 콘텐츠 제외 |
| contact-form | ✅ 완료 | 12개 | 폼 제외, 정보영역만 |

### 2.2 기타 페이지

| 페이지 | 상태 | 비고 |
|--------|------|------|
| about.html | ⏳ 예정 | |
| service.html | ⏳ 예정 | |
| fund.html | ⏳ 예정 | +124개 추가됨 (이전 커밋) |
| process.html | ⏳ 예정 | |

---

## 3. 완료된 섹션 상세

### 3.1 index.html - hero 섹션 (18개)

| # | ID | 요소 |
|---|-----|------|
| 1 | index-hero-badge | 배지 텍스트 |
| 2 | index-hero-title | 메인 타이틀 |
| 3 | index-hero-desc | 서브 설명 |
| 4 | index-hero-rate-title | 승인률 카드 제목 |
| 5 | index-hero-rate-premium-label | KPFC 컨설팅 라벨 |
| 6 | index-hero-rate-premium-status | KPFC 상태 |
| 7 | index-hero-rate-standard-label | 일반 신청 라벨 |
| 8 | index-hero-rate-standard-status | 일반 상태 |
| 9 | index-hero-graph-premium-label | 그래프 KPFC 라벨 |
| 10 | index-hero-graph-standard-label | 그래프 일반 라벨 |
| 11 | index-hero-legend-premium | 레전드 전문가 |
| 12 | index-hero-legend-standard | 레전드 직접 신청 |
| 13 | index-hero-info1-title | 정보카드1 제목 |
| 14 | index-hero-info1-desc | 정보카드1 설명 |
| 15 | index-hero-info2-title | 정보카드2 제목 |
| 16 | index-hero-info2-desc | 정보카드2 설명 |
| 17 | index-hero-cta-primary | CTA 버튼1 |
| 18 | index-hero-cta-secondary | CTA 버튼2 |

---

## 4. 다음 작업

### Phase 1: index.html 나머지 섹션 ✅ 완료
1. [x] process 섹션 점검 (24개)
2. [x] features 섹션 점검 (26개)
3. [x] trust 섹션 점검 (25개) - testimonials 포함
4. [x] board 섹션 점검 (2개)
5. [x] contact-form 섹션 점검 (12개)
※ FAQ 섹션은 HTML에 없음 (JSON-LD 메타데이터에만 존재)

### Phase 2: 기타 페이지
6. [ ] about.html 전체 점검
7. [ ] service.html 전체 점검
8. [ ] fund.html 추가 점검 (기존 +124개 확인)
9. [ ] process.html 전체 점검

### Phase 3: 검증
10. [ ] 전체 data-editable 목록 추출
11. [ ] 중복 ID 검사
12. [ ] 관리자 페이지에서 테스트

---

## 5. 커밋 이력

| 날짜 | 커밋 | 내용 |
|------|------|------|
| 2024-12-28 | 3376506 | fund +124, service +38 |
| 2024-12-28 | 5c1e6e7 | index +8, about +24 |
| 2024-12-28 | 067295b | 총 238개 완료 |
| 2024-12-28 | - | index.html 전체 점검 완료 (107개) |

---

## 6. index.html 추가 섹션 상세

### 6.1 process 섹션 (24개)

| # | ID | 요소 |
|---|-----|------|
| 1 | index-process-title | 섹션 제목 |
| 2 | index-process-subtitle | 서브타이틀 |
| 3 | index-process-desc | 설명 |
| 4-9 | index-process-step1~3-title/desc | 스텝 제목/설명 |
| 10-21 | index-process-detail1~3-* | 상세카드 내용 |
| 22-24 | index-process-detail1/2-list1~3 | 리스트 항목 |

### 6.2 features 섹션 (26개)

| # | ID | 요소 |
|---|-----|------|
| 1-2 | index-service-title/subtitle | 섹션 헤더 |
| 3-6 | index-service-tab1~4-btn | 탭 버튼 |
| 7-22 | index-service-tab1~4-* | 탭 콘텐츠 |
| 23-26 | index-service-notrust* | 신뢰 배너 |

### 6.3 trust 섹션 (25개)

| # | ID | 요소 |
|---|-----|------|
| 1-2 | index-trust-title/subtitle | 섹션 헤더 |
| 3-6 | index-trust-indicator1~2-* | 지표 카드 |
| 7-10 | index-trust-sub1~4-label | 서브 지표 |
| 11-14 | index-trust-guarantee* | 보장 배너 |
| 15-24 | index-trust-review1~5-* | 리뷰 카드 |
| 25 | index-trust-cta | CTA 버튼 |

### 6.4 contact-form 섹션 (12개)

| # | ID | 요소 |
|---|-----|------|
| 1 | index-form-badge | 배지 |
| 2 | index-form-title | 제목 |
| 3 | index-form-desc | 설명 |
| 4-7 | index-form-benefit1~4 | 혜택 목록 |
| 8-10 | index-form-contact-* | 연락처 정보 |
| 11-12 | index-form-form-* | 폼 헤더 |

---

*문서 버전: 1.1*
*수정일: 2024-12-28*
*다음 작업: 기타 페이지 점검 (about, service, fund, process)*
