# TDD: Hero 섹션 세분화 완료

## 완료일: 2024-12-28

---

## 1. 세분화 결과 (총 24개)

### 1.1 배지
| ID | 텍스트 |
|----|--------|
| `index-hero-badge` | 정책자금 전문 컨설팅 |

### 1.2 메인 타이틀 (5개로 세분화)
| ID | 텍스트 | 비고 |
|----|--------|------|
| `index-hero-title-1` | 자금 조달의 | |
| `index-hero-title-highlight` | 어려움 | 하이라이트 스타일 |
| `index-hero-title-2` | 을 | |
| `index-hero-title-3` | 겪고 계신가요? | |
| `index-hero-title-4` | 이제 전문가와 함께하세요 | |

### 1.3 서브 설명 (4개로 세분화)
| ID | 텍스트 | 비고 |
|----|--------|------|
| `index-hero-desc-brand` | KPFC | 브랜드명 스타일 |
| `index-hero-desc-1` | 의 전문 컨설팅으로 | |
| `index-hero-desc-2` | 정책자금 승인률 | |
| `index-hero-desc-3` | 달성 | |

※ 동적 카운터 `95%`는 편집 불가 (count-up 클래스)

### 1.4 승인률 카드 (9개)
| ID | 텍스트 |
|----|--------|
| `index-hero-rate-title` | 📊 KPFC와 함께한 승인률 |
| `index-hero-rate-premium-label` | KPFC 컨설팅 |
| `index-hero-rate-premium-status` | ✅ 높은 승인률 |
| `index-hero-rate-standard-label` | 일반 신청 |
| `index-hero-rate-standard-status` | ❌ 낮은 승인률 |
| `index-hero-graph-premium-label` | KPFC 컨설팅 |
| `index-hero-graph-standard-label` | 일반 신청 |
| `index-hero-legend-premium` | ✅ 전문가 컨설팅 |
| `index-hero-legend-standard` | ❌ 직접 신청 |

### 1.5 정보 카드 (6개로 세분화)
| ID | 텍스트 |
|----|--------|
| `index-hero-info1-title` | 기업심사관 전문가 |
| `index-hero-info1-desc-1` | 정책자금 심사기준 정밀 분석 |
| `index-hero-info1-desc-2` | 맞춤형 사업계획서 작성 지원 |
| `index-hero-info2-title` | 1:1 맞춤 컨설팅 |
| `index-hero-info2-desc-1` | 대표자 역량 분석 기반 |
| `index-hero-info2-desc-2` | 자격요건 정밀 진단 |

### 1.6 CTA 버튼 (2개)
| ID | 텍스트 |
|----|--------|
| `index-hero-cta-primary` | 정책자금 로드맵 |
| `index-hero-cta-secondary` | 전문가 네트워크 |

---

## 2. 변경 전/후 비교

### 2.1 메인 타이틀
**Before:**
```html
<h1 data-editable="index-hero-title">
    자금 조달의 <span class="bizen-highlight">어려움</span>을<br>
    겪고 계신가요?<br>
    이제 전문가와 함께하세요
</h1>
```

**After:**
```html
<h1 class="bizen-main-title">
    <span data-editable="index-hero-title-1">자금 조달의</span>
    <span class="bizen-highlight" data-editable="index-hero-title-highlight">어려움</span>
    <span data-editable="index-hero-title-2">을</span><br class="mobile-br">
    <span data-editable="index-hero-title-3">겪고 계신가요?</span><br>
    <span data-editable="index-hero-title-4">이제 전문가와 함께하세요</span>
</h1>
```

### 2.2 서브 설명
**Before:**
```html
<p data-editable="index-hero-desc">
    <span class="bizen-brand-name">KPFC</span>의 전문 컨설팅으로<br>
    정책자금 승인률 <span class="count-up">0%</span> 달성
</p>
```

**After:**
```html
<p class="bizen-sub-desc">
    <span class="bizen-brand-name" data-editable="index-hero-desc-brand">KPFC</span>
    <span data-editable="index-hero-desc-1">의 전문 컨설팅으로</span><br>
    <span data-editable="index-hero-desc-2">정책자금 승인률</span>
    <span class="count-up">0%</span>
    <span data-editable="index-hero-desc-3">달성</span>
</p>
```

---

## 3. 검증 완료
- [x] 순수 텍스트만 포함
- [x] HTML 태그 미포함
- [x] 텍스트 누락 없음
- [x] 스타일 유지됨

---

*상태: ✅ 완료*
