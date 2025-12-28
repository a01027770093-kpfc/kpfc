# TDD: index.html 전체 세분화 완료

## 완료일: 2024-12-28

---

## 1. 세분화 요약

| 섹션 | 세분화 전 | 세분화 후 | 증가 |
|------|----------|----------|------|
| hero | 18개 | 24개 | +6 |
| process | 24개 | 25개 | +1 |
| features | 26개 | 34개 | +8 |
| trust | 25개 | 35개 | +10 |
| board | 2개 | 3개 | +1 |
| contact-form | 12개 | 15개 | +3 |
| **총계** | **107개** | **136개** | **+29** |

※ 최종 확인 결과 112개 (일부 중복 제거됨)

---

## 2. 섹션별 세분화 상세

### 2.1 Hero 섹션 (24개)
- `index-hero-title` → `index-hero-title-1`, `index-hero-title-highlight`, `index-hero-title-2`, `index-hero-title-3`, `index-hero-title-4`
- `index-hero-desc` → `index-hero-desc-brand`, `index-hero-desc-1`, `index-hero-desc-2`, `index-hero-desc-3`
- `index-hero-info1-desc` → `index-hero-info1-desc-1`, `index-hero-info1-desc-2`
- `index-hero-info2-desc` → `index-hero-info2-desc-1`, `index-hero-info2-desc-2`

### 2.2 Process 섹션 (25개)
- `index-process-title` → `index-process-title-brand`, `index-process-title-text`
- `index-process-detail3-subtitle` → `index-process-detail3-subtitle-1`, `index-process-detail3-subtitle-2`

### 2.3 Features 섹션 (34개)
- `index-service-title` → `index-service-title-1`, `index-service-title-highlight`
- `index-service-tab1-point` → `index-service-tab1-point-highlight`, `index-service-tab1-point-text`
- `index-service-tab1-detail` → `index-service-tab1-detail-1`, `index-service-tab1-detail-2`
- (tab2, tab3, tab4도 동일 패턴)

### 2.4 Trust 섹션 (35개)
- `index-trust-title` → `index-trust-title-1`, `index-trust-title-highlight`, `index-trust-title-2`
- `index-trust-indicator1-desc` → `index-trust-indicator1-desc-1`, `index-trust-indicator1-desc-2`
- `index-trust-indicator2-desc` → `index-trust-indicator2-desc-1`, `index-trust-indicator2-desc-2`
- `index-trust-sub1-label` → `index-trust-sub1-label-1`, `index-trust-sub1-label-2`
- (sub2, sub3, sub4도 동일 패턴)

### 2.5 Board 섹션 (3개)
- `index-board-title` → `index-board-title-highlight`, `index-board-title-text`

### 2.6 Contact-Form 섹션 (15개)
- `index-form-title` → `index-form-title-1`, `index-form-title-highlight`
- `index-form-desc` → `index-form-desc-1`, `index-form-desc-2`
- `index-form-contact-phone` → `index-form-contact-phone-label`, `index-form-contact-phone-number`

---

## 3. 세분화 규칙 적용 결과

### 3.1 처리된 유형
| 유형 | 처리 방법 | 예시 |
|------|----------|------|
| 하이라이트 span | 별도 data-editable + `-highlight` | `index-hero-title-highlight` |
| 줄바꿈 br | 앞뒤 span으로 분리 + `-1`, `-2` | `index-form-desc-1`, `-2` |
| 브랜드명 | 별도 data-editable + `-brand` | `index-hero-desc-brand` |
| strong 태그 | 별도 data-editable + `-number` | `index-form-contact-phone-number` |

### 3.2 검증 완료
- [x] 모든 data-editable에 순수 텍스트만 포함
- [x] HTML 태그 미포함
- [x] 텍스트 누락 없음
- [x] 스타일 유지됨

---

## 4. 파일 목록

- `docs/PRD-data-editable-segmentation.md` - 세분화 규칙
- `docs/TDD-segmentation-hero.md` - Hero 섹션 상세
- `docs/TDD-segmentation-process.md` - Process 섹션 상세
- `docs/TDD-segmentation-all.md` - 전체 요약 (본 문서)

---

*상태: ✅ 완료*
*총 data-editable: 112개*
