# PRD: data-editable 세분화 규칙

## 1. 개요

### 1.1 목적
페이지 편집 기능에서 텍스트만 순수하게 교체할 수 있도록, 복합 HTML 구조를 가진 요소를 세분화합니다.

### 1.2 문제점
```html
<!-- 문제: HTML 태그가 포함된 요소 -->
<h1 data-editable="index-hero-title">
    자금 조달의 <span class="highlight">어려움</span>을
</h1>
```
- 페이지 편집에서 HTML 코드가 노출됨
- 텍스트 수정 시 span/br 구조가 손상됨
- 스타일링이 사라지는 문제 발생

### 1.3 해결책
```html
<!-- 해결: 텍스트 부분만 개별 data-editable -->
<h1 class="bizen-main-title">
    <span data-editable="index-hero-title-1">자금 조달의</span>
    <span class="highlight" data-editable="index-hero-title-highlight">어려움</span>
    <span data-editable="index-hero-title-2">을</span>
</h1>
```

---

## 2. 세분화 규칙

### 2.1 세분화 대상
| 유형 | 설명 | 예시 |
|------|------|------|
| 하이라이트 span | 스타일링된 텍스트 | `<span class="highlight">텍스트</span>` |
| 줄바꿈 br | 멀티라인 텍스트 | `텍스트1<br>텍스트2` |
| 강조 태그 | strong, em 등 | `<strong>중요</strong>` |
| 브랜드명 | 고정 스타일 | `<span class="brand">KPFC</span>` |
| 동적 요소 | 카운터 등 | `<span class="count-up">95%</span>` |

### 2.2 명명 규칙
```
{페이지}-{섹션}-{요소}-{세분화번호}
```

**예시:**
- `index-hero-title-1` (첫 번째 텍스트)
- `index-hero-title-highlight` (하이라이트 텍스트)
- `index-hero-title-2` (두 번째 텍스트)
- `index-hero-desc-brand` (브랜드명)

### 2.3 제외 대상 (세분화 불필요)
- 순수 텍스트만 있는 요소
- 동적 카운터 (count-up) - 편집 불가
- SVG 아이콘
- 폼 입력 요소

---

## 3. 작업 체크리스트

### 3.1 index.html (총 112개) ✅

| 섹션 | 상태 | 세분화 수 | 비고 |
|------|------|-----------|------|
| hero | ✅ 완료 | 27개 | 타이틀 5개, 설명 4개, 정보카드 4개 |
| process | ✅ 완료 | 26개 | 타이틀 2개, 서브타이틀 2개 세분화 |
| features | ✅ 완료 | 35개 | 타이틀, point, detail 세분화 |
| trust | ✅ 완료 | 33개 | 타이틀, indicator, sub-label 세분화 |
| board | ✅ 완료 | 3개 | 타이틀 2개 세분화 |
| contact-form | ✅ 완료 | 15개 | 타이틀, 설명, 전화번호 세분화 |

### 3.2 about.html (총 88개) ✅

| 섹션 | 상태 | 세분화 수 | 비고 |
|------|------|-----------|------|
| hero | ✅ 완료 | 6개 | 기본 |
| system | ✅ 완료 | 43개 | 6개 카드 x (타이틀+설명+리스트) |
| ceo | ✅ 완료 | 29개 | 인사말 본문 세분화 + 섹션 라벨 |
| category | ✅ 완료 | 10개 | 기본 |
| employees | ✅ 완료 | 3개 | 섹션 라벨 + 직원 이름 |

### 3.3 fund.html (총 178개) ✅

| 섹션 | 상태 | 세분화 수 | 비고 |
|------|------|-----------|------|
| hero | ✅ 완료 | 22개 | 타이틀/설명 세분화, 버튼 텍스트 |
| process | ✅ 완료 | 22개 | CTA 버튼 + Step 상세 텍스트 8개 |
| detail | ✅ 완료 | 103개 | 4개 자금 유형 x 상세 항목 |
| success | ✅ 완료 | 34개 | CTA 버튼 포함 |

### 3.4 service.html (총 61개) ✅

| 섹션 | 상태 | 세분화 수 | 비고 |
|------|------|-----------|------|
| hero | ✅ 완료 | 24개 | 타이틀/설명 세분화, 버튼 텍스트 |
| expert | ✅ 완료 | 40개 | 6개 전문가 카드, CTA 버튼 |

### 3.5 process.html (총 60개) ✅

| 섹션 | 상태 | 세분화 수 | 비고 |
|------|------|-----------|------|
| hero | ✅ 완료 | 11개 | subtitle 세분화 (하이라이트) |
| service | ✅ 완료 | 30개 | 6개 특징 카드 x 5개 항목 |
| faq | ✅ 완료 | 14개 | Q1~Q6, A1~A6 |
| cta | ✅ 완료 | 10개 | 타이틀 세분화, 버튼/뱃지 |

### 3.6 전체 현황

| 페이지 | 개수 | 상태 |
|--------|------|------|
| index.html | 112개 | ✅ |
| about.html | 88개 | ✅ |
| fund.html | 178개 | ✅ |
| service.html | 61개 | ✅ |
| process.html | 60개 | ✅ |
| **총계** | **499개** | ✅ |

### 3.7 제외 페이지
- marketing.html: ⏸️ 작업 범위 외

---

## 4. 검증 방법

### 4.1 세분화 후 체크
1. [ ] 각 data-editable에 순수 텍스트만 있는지 확인
2. [ ] HTML 태그가 포함되지 않았는지 확인
3. [ ] 텍스트 누락 없는지 확인
4. [ ] 페이지 편집에서 정상 동작 확인

### 4.2 금지 패턴
```html
<!-- ❌ 잘못된 예시 -->
<span data-editable="id">텍스트 <span>중첩</span></span>
<span data-editable="id">텍스트<br>줄바꿈</span>

<!-- ✅ 올바른 예시 -->
<span data-editable="id">순수 텍스트만</span>
```

---

## 5. 점검 규칙 (CRITICAL)

### 5.1 핵심 원칙
**data-editable 개수만 확인하지 말고, 편집 가능해야 할 모든 텍스트에 data-editable이 있는지 확인**

### 5.2 점검 체크리스트
| 점검 항목 | 설명 |
|-----------|------|
| ✅ 타이틀 | 모든 제목 텍스트에 data-editable 있는지 |
| ✅ 설명문 | 본문 설명, 서브타이틀에 data-editable 있는지 |
| ✅ 리스트 항목 | ul/li 각 항목에 data-editable 있는지 |
| ✅ CTA 버튼 | 버튼 텍스트에 data-editable 있는지 |
| ✅ 인사말/메시지 | CEO 인사말, 안내 메시지 등 본문 텍스트 |
| ✅ 카드 내용 | 카드 내 모든 텍스트 (제목, 설명, 태그) |
| ✅ 배지/라벨 | 뱃지, 라벨 텍스트 |

### 5.3 누락 사례 (수정 필요)
```html
<!-- ❌ 잘못된 예시: 본문 텍스트에 data-editable 누락 -->
<div class="ceo-message">
    <p>정책자금은 서류를 대신 넣어주는 일이 아닙니다.</p>
    <p>한 번의 잘못된 신청이 다음 심사까지 영향을 줍니다.</p>
</div>

<!-- ✅ 올바른 예시: 각 문장에 data-editable 추가 -->
<div class="ceo-message">
    <p data-editable="about-ceo-message-1">정책자금은 서류를 대신 넣어주는 일이 아닙니다.</p>
    <p data-editable="about-ceo-message-2">한 번의 잘못된 신청이 다음 심사까지 영향을 줍니다.</p>
</div>
```

### 5.4 점검 방법
1. **시각적 확인**: 브라우저에서 페이지를 보며 모든 텍스트 요소 확인
2. **코드 확인**: 섹션별로 HTML 코드를 읽어 누락된 data-editable 찾기
3. **비교 확인**: 비슷한 구조의 섹션과 비교하여 누락 여부 확인

### 5.5 우선순위
1. **필수**: 타이틀, 설명문, CTA 버튼
2. **필수**: 본문 메시지 (인사말, 안내문 등)
3. **권장**: 리스트 항목, 태그, 라벨

---

*문서 버전: 1.1*
*작성일: 2024-12-28*
*수정사항: 점검 규칙 추가 (섹션 5)*
