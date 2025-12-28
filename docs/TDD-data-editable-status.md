# TDD: data-editable 전체 현황

## 최종 업데이트: 2024-12-28

---

## 1. 전체 요약

| 페이지 | data-editable 수 | 상태 | 비고 |
|--------|------------------|------|------|
| index.html | 112개 | ✅ 완료 | 세분화 완료 |
| about.html | 86개 | ✅ 완료 | CEO 인사말 세분화 포함 |
| fund.html | 170개 | ✅ 완료 | 히어로+상세 세분화 완료 |
| service.html | 61개 | ✅ 완료 | 히어로 세분화 완료 |
| process.html | 60개 | ✅ 완료 | CTA 세분화 완료 |
| marketing.html | ⏸️ 제외 | - | 작업 범위 외 |
| **총계** | **489개** | ✅ | |

---

## 2. 페이지별 섹션 상세

### 2.1 index.html (112개) ✅

| 섹션 | 개수 | 세분화 | 상태 |
|------|------|--------|------|
| hero | 27개 | 타이틀 5개, 설명 4개 세분화 | ✅ |
| process | 26개 | 타이틀 2개 세분화 | ✅ |
| service (features) | 35개 | 타이틀, point, detail 세분화 | ✅ |
| trust | 33개 | 타이틀, indicator, sub-label 세분화 | ✅ |
| board | 3개 | 타이틀 2개 세분화 | ✅ |
| form | 15개 | 타이틀, 설명, 전화번호 세분화 | ✅ |

**세분화 규칙 적용:**
- 하이라이트 span → `-highlight`
- 줄바꿈 br → `-1`, `-2`
- 브랜드명 → `-brand`
- strong 태그 → `-number`

---

### 2.2 about.html (86개) ✅

| 섹션 | 개수 | 세분화 | 상태 |
|------|------|--------|------|
| hero | 6개 | 기본 | ✅ |
| system | 43개 | 카드 6개 x (타이틀+설명+리스트3개) | ✅ |
| ceo | 28개 | 인사말 본문 세분화 (PC/모바일) | ✅ |
| category | 10개 | 기본 | ✅ |
| employees | 2개 | 기본 (직원 이름 추가 가능) | ✅ |

**주요 수정 내역:**
- CEO 인사말 본문 PC/모바일 각각 세분화
- CEO 버튼 텍스트 추가

---

### 2.3 fund.html (170개) ✅

| 섹션 | 개수 | 세분화 | 상태 |
|------|------|--------|------|
| hero | 22개 | 타이틀/설명 세분화, 버튼 텍스트 | ✅ |
| process | 14개 | CTA 버튼 포함 | ✅ |
| detail | 103개 | 4개 자금 유형 x 상세 항목 | ✅ |
| success | 34개 | CTA 버튼 포함 | ✅ |

**주요 수정 내역:**
- hero-title 세분화 (하이라이트 분리)
- hero-desc 세분화
- 버튼 텍스트 세분화
- 모바일 stat-label 추가

---

### 2.4 service.html (61개) ✅

| 섹션 | 개수 | 세분화 | 상태 |
|------|------|--------|------|
| hero | 24개 | 타이틀/설명 세분화, 버튼 텍스트 | ✅ |
| expert | 40개 | 6개 전문가 카드, CTA 버튼 | ✅ |

**주요 수정 내역:**
- hero-title 세분화 (하이라이트 분리)
- hero-desc 세분화
- 버튼 텍스트 세분화

---

### 2.5 process.html (60개) ✅

| 섹션 | 개수 | 세분화 | 상태 |
|------|------|--------|------|
| hero | 11개 | subtitle 세분화 (하이라이트) | ✅ |
| service | 30개 | 6개 특징 카드 x 5개 항목 | ✅ |
| faq | 14개 | Q1~Q6, A1~A6 | ✅ |
| cta | 10개 | 타이틀 세분화, 버튼/뱃지 | ✅ |

**주요 수정 내역:**
- hero-subtitle 세분화 (하이라이트 분리)
- cta-title 세분화
- cta 버튼 텍스트 추가
- cta 뱃지 텍스트 추가

---

## 3. 세분화 패턴 정리

### 3.1 타이틀 세분화
```html
<!-- Before -->
<h1 data-editable="xxx-title">텍스트 <span class="highlight">강조</span> 텍스트</h1>

<!-- After -->
<h1>
  <span data-editable="xxx-title-1">텍스트 </span>
  <span class="highlight" data-editable="xxx-title-highlight">강조</span>
  <span data-editable="xxx-title-2"> 텍스트</span>
</h1>
```

### 3.2 설명 세분화
```html
<!-- Before -->
<p data-editable="xxx-desc">문장1<br>문장2</p>

<!-- After -->
<p>
  <span data-editable="xxx-desc-1">문장1</span><br>
  <span data-editable="xxx-desc-2">문장2</span>
</p>
```

### 3.3 버튼 텍스트
```html
<!-- Before -->
<a class="btn">버튼 텍스트</a>

<!-- After -->
<a class="btn">
  <span data-editable="xxx-btn-primary">버튼 텍스트</span>
</a>
```

---

## 4. 제외 항목

### 4.1 data-editable 불필요
- 헤더/푸터 네비게이션 링크
- 저작권 표시
- 폼 라벨 (고정)
- 동적 카운터 (count-up)
- SVG 아이콘
- 정부기관 로고/링크

### 4.2 작업 범위 외
- marketing.html (온라인마케팅 페이지)
- post.html (게시글 상세)
- policy.html (이용약관)
- privacy.html (개인정보처리방침)

---

## 5. 검증 완료 항목

- [x] 모든 data-editable에 순수 텍스트만 포함
- [x] HTML 태그 미포함
- [x] 텍스트 누락 없음
- [x] 스타일 유지됨
- [x] PC/모바일 동기화 고려됨
- [x] 버튼 텍스트 편집 가능
- [x] 하이라이트 텍스트 개별 편집 가능

---

*문서 버전: 1.0*
*작성일: 2024-12-28*
*상태: ✅ 전체 완료 (marketing.html 제외)*
