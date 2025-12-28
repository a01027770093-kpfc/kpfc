# TDD: Process 섹션 세분화 완료

## 완료일: 2024-12-28

---

## 1. 세분화 결과 (총 25개)

### 1.1 헤더 (4개 → 세분화 후 5개)
| ID | 텍스트 | 비고 |
|----|--------|------|
| `index-process-title-brand` | KPFC | 하이라이트 스타일 |
| `index-process-title-text` | 의 진행 절차 | |
| `index-process-subtitle` | 기관 심사 기준 그대로 진행합니다 | 순수 텍스트 |
| `index-process-desc` | 96% 승인 노하우, 실제 기관 심사 기준으로 점검합니다 | 순수 텍스트 |

### 1.2 3단계 스텝 (6개)
| ID | 텍스트 |
|----|--------|
| `index-process-step1-title` | 유선 심사 |
| `index-process-step1-desc` | 사업장 현황 · 기본 요건 서류 심사 |
| `index-process-step2-title` | 방문 심사 |
| `index-process-step2-desc` | 1차 통과 사업자 대상 현장 심사 진행 |
| `index-process-step3-title` | 계약서 작성 |
| `index-process-step3-desc` | 심사 통과 사업자에 한해 계약 진행 |

### 1.3 상세카드 1 (5개)
| ID | 텍스트 |
|----|--------|
| `index-process-detail1-title` | 서류 기반 사전 심사 |
| `index-process-detail1-subtitle` | 정책자금 기관의 심사 기준으로 점검 |
| `index-process-detail1-list1` | 업종 적합 여부 |
| `index-process-detail1-list2` | 매출 · 부채 · 신용 상태 |
| `index-process-detail1-list3` | 국세 · 지방세 체납 여부 |
| `index-process-detail1-message` | 가능성 없는 진행은 여기서 중단됩니다 |

### 1.4 상세카드 2 (7개)
| ID | 텍스트 |
|----|--------|
| `index-process-detail2-title` | 현장 방문 심사 진행 |
| `index-process-detail2-condition` | 1차 심사 통과 사업자에 한해 |
| `index-process-detail2-subtitle` | 사업장을 직접 방문해 심사를 진행합니다. |
| `index-process-detail2-list1` | 실제 사업 운영 여부 |
| `index-process-detail2-list2` | 사업 구조 · 운영 안정성 |
| `index-process-detail2-list3` | 향후 성장 가능성 |
| `index-process-detail2-message` | 전화·서류만으로 판단하지 않습니다 |

### 1.5 상세카드 3 (3개 → 세분화 후 4개)
| ID | 텍스트 | 비고 |
|----|--------|------|
| `index-process-detail3-title` | 심사 통과 사업자만 계약 가능 | 순수 텍스트 |
| `index-process-detail3-subtitle-1` | 저희는 상담 후 계약이 아니라 | 세분화됨 |
| `index-process-detail3-subtitle-2` | 심사 통과 후 계약을 원칙으로 합니다. | 세분화됨 |

---

## 2. 변경 내역

### 2.1 타이틀 세분화
**Before:**
```html
<h2 data-editable="index-process-title">
    <span class="kpfc-process-highlight">KPFC</span>의 진행 절차
</h2>
```

**After:**
```html
<h2 class="kpfc-process-title">
    <span class="kpfc-process-highlight" data-editable="index-process-title-brand">KPFC</span>
    <span data-editable="index-process-title-text">의 진행 절차</span>
</h2>
```

### 2.2 상세카드3 서브타이틀 세분화
**Before:**
```html
<p data-editable="index-process-detail3-subtitle">
    저희는 상담 후 계약이 아니라<br>심사 통과 후 계약을 원칙으로 합니다.
</p>
```

**After:**
```html
<p class="kpfc-detail-subtitle">
    <span data-editable="index-process-detail3-subtitle-1">저희는 상담 후 계약이 아니라</span><br>
    <span data-editable="index-process-detail3-subtitle-2">심사 통과 후 계약을 원칙으로 합니다.</span>
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
