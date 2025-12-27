# PRD: 홈페이지 인라인 텍스트 에디터

## 1. 개요

### 1.1 배경
관리자가 홈페이지 텍스트를 수정하려면 현재 HTML 파일을 직접 편집해야 합니다. 비개발자도 쉽게 텍스트를 수정할 수 있는 인라인 에디터가 필요합니다.

### 1.2 목표
- 관리자 대시보드에서 프론트엔드 페이지를 미리보며 텍스트 직접 수정
- 수정 즉시 미리보기 반영
- "적용하기" 클릭 시 실제 HTML 파일 수정 및 자동 배포

### 1.3 범위
- **포함**: 모든 페이지의 텍스트 콘텐츠 (제목, 설명, 버튼 텍스트 등)
- **제외**: 헤더, 푸터, 입력 폼, 이미지, 스타일

---

## 2. 사용자 흐름

```
1. 관리자 대시보드 > "홈페이지관리" 메뉴 클릭
2. 페이지 선택 (index.html, about.html 등)
3. 미리보기에서 수정할 텍스트 클릭
4. 텍스트 직접 편집 (실시간 미리보기)
5. "적용하기" 버튼 클릭
6. 로딩 표시 (1-2분)
7. "배포 완료" 알림
```

---

## 3. 화면 설계

### 3.1 홈페이지관리 페이지 (`/admin/pages.html`)

```
┌─────────────────────────────────────────────────────────────┐
│  홈페이지관리                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  페이지 선택: [메인 페이지 ▼]        [초기화] [적용하기]      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │          (페이지 미리보기 iframe)            │   │   │
│  │  │                                             │   │   │
│  │  │   [정책자금 전문 컨설팅]  ← 클릭하면 편집     │   │   │
│  │  │   중소기업을 위한 맞춤 솔루션                 │   │   │
│  │  │                                             │   │   │
│  │  │   [무료 상담 신청]                           │   │   │
│  │  │                                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  수정된 항목: 3개                                            │
│  ├ index-hero-title: "정책자금 전문 컨설팅" → "..."         │
│  ├ index-hero-desc: "중소기업을 위한..." → "..."            │
│  └ index-cta-btn: "무료 상담 신청" → "..."                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 편집 가능 요소 표시

```css
/* 편집 가능 요소 호버 시 */
[data-editable]:hover {
  outline: 2px dashed #3B82F6;
  cursor: text;
}

/* 현재 편집 중인 요소 */
[data-editable]:focus {
  outline: 2px solid #3B82F6;
  background: rgba(59, 130, 246, 0.1);
}

/* 수정된 요소 */
[data-editable].modified {
  outline: 2px solid #10B981;
  background: rgba(16, 185, 129, 0.1);
}
```

---

## 4. 기술 아키텍처

### 4.1 전체 흐름

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   관리자     │     │   Worker     │     │   GitHub     │     │   Vercel     │
│   브라우저   │     │   API        │     │   API        │     │   배포       │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       │ 1. 수정 내용 전송   │                    │                    │
       │───────────────────>│                    │                    │
       │                    │                    │                    │
       │                    │ 2. HTML 파일 조회   │                    │
       │                    │───────────────────>│                    │
       │                    │                    │                    │
       │                    │ 3. HTMLRewriter로  │                    │
       │                    │    텍스트 교체     │                    │
       │                    │                    │                    │
       │                    │ 4. 커밋 & 푸시     │                    │
       │                    │───────────────────>│                    │
       │                    │                    │                    │
       │                    │                    │ 5. 웹훅 트리거     │
       │                    │                    │───────────────────>│
       │                    │                    │                    │
       │ 6. 완료 응답       │                    │                    │
       │<───────────────────│                    │                    │
       │                    │                    │                    │
```

### 4.2 컴포넌트 구성

| 컴포넌트 | 역할 | 기술 |
|----------|------|------|
| 관리자 UI | 미리보기, 인라인 편집 | HTML/JS, iframe, contentEditable |
| Worker API | HTML 수정, GitHub 연동 | Cloudflare Workers, HTMLRewriter |
| GitHub API | 파일 읽기/쓰기, 커밋 | REST API |
| Vercel | 자동 배포 | GitHub 웹훅 |

---

## 5. 안전한 HTML 수정 방식

### 5.1 HTMLRewriter 사용 (권장)

Cloudflare Workers 내장 기능으로 HTML 구조를 유지하면서 텍스트만 안전하게 교체합니다.

```javascript
// Worker 코드 예시
async function updateHTML(html, changes) {
  let response = new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });

  // 각 변경사항에 대해 HTMLRewriter 적용
  for (const [id, newText] of Object.entries(changes)) {
    response = new HTMLRewriter()
      .on(`[data-editable="${id}"]`, {
        element(el) {
          el.setInnerContent(escapeHtml(newText));
        }
      })
      .transform(response);
  }

  return await response.text();
}
```

### 5.2 안전성 보장 포인트

| 항목 | 위험 | 대응책 |
|------|------|--------|
| XSS 공격 | 악성 스크립트 삽입 | `escapeHtml()` 처리 |
| HTML 구조 파손 | 태그 깨짐 | HTMLRewriter 사용 (텍스트만 변경) |
| 잘못된 요소 수정 | 동일 텍스트 혼동 | `data-editable` ID로 정확히 식별 |
| 동시 편집 충돌 | Git 충돌 | 단일 편집자 제한 + 잠금 기능 |
| 배포 실패 | Vercel 빌드 오류 | HTML 검증 후 커밋 |

### 5.3 XSS 방지 함수

```javascript
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
```

---

## 6. 데이터 마킹 규칙

### 6.1 ID 명명 규칙

```
{페이지}-{섹션}-{요소}[-{인덱스}]
```

| 구분 | 설명 | 예시 |
|------|------|------|
| 페이지 | HTML 파일명 (확장자 제외) | index, about, service |
| 섹션 | 페이지 내 섹션 ID | hero, features, cta, process |
| 요소 | 요소 타입 | title, desc, btn, item |
| 인덱스 | 동일 요소 여러 개일 때 | 1, 2, 3 |

### 6.2 마킹 예시

```html
<!-- index.html -->
<section id="hero">
  <h1 data-editable="index-hero-title">정책자금 전문 컨설팅</h1>
  <p data-editable="index-hero-desc">중소기업을 위한 맞춤 솔루션을 제공합니다</p>
  <a data-editable="index-hero-btn">무료 상담 신청</a>
</section>

<section id="features">
  <h2 data-editable="index-features-title">서비스 특징</h2>
  <div class="feature-item">
    <h3 data-editable="index-features-item1-title">전문 컨설팅</h3>
    <p data-editable="index-features-item1-desc">10년 이상 경력의 전문가</p>
  </div>
  <div class="feature-item">
    <h3 data-editable="index-features-item2-title">높은 성공률</h3>
    <p data-editable="index-features-item2-desc">95% 이상의 승인율</p>
  </div>
</section>

<!-- about.html -->
<section id="intro">
  <h1 data-editable="about-intro-title">회사 소개</h1>
  <p data-editable="about-intro-desc">한국정책자금지원센터는...</p>
</section>
```

### 6.3 마킹 제외 대상

- 헤더 (`<header>`)
- 푸터 (`<footer>`)
- 입력 폼 (`<form>`, `<input>`, `<select>`)
- 네비게이션 (`<nav>`)
- 스크립트/스타일 (`<script>`, `<style>`)

---

## 7. API 설계

### 7.1 페이지 목록 조회

```
GET /api/pages
```

**Response:**
```json
{
  "success": true,
  "pages": [
    { "id": "index", "name": "메인 페이지", "path": "index.html" },
    { "id": "about", "name": "회사 소개", "path": "about.html" },
    { "id": "service", "name": "서비스 안내", "path": "service.html" },
    { "id": "fund", "name": "정책자금 안내", "path": "fund.html" },
    { "id": "process", "name": "진행 절차", "path": "process.html" }
  ]
}
```

### 7.2 페이지 편집 가능 텍스트 조회

```
GET /api/pages/{pageId}/editables
```

**Response:**
```json
{
  "success": true,
  "pageId": "index",
  "editables": [
    { "id": "index-hero-title", "text": "정책자금 전문 컨설팅", "tag": "h1" },
    { "id": "index-hero-desc", "text": "중소기업을 위한 맞춤 솔루션", "tag": "p" },
    { "id": "index-hero-btn", "text": "무료 상담 신청", "tag": "a" }
  ]
}
```

### 7.3 텍스트 수정 적용

```
POST /api/pages/{pageId}/update
```

**Request:**
```json
{
  "changes": {
    "index-hero-title": "정책자금 전문 컨설팅 센터",
    "index-hero-desc": "중소기업과 스타트업을 위한 맞춤 솔루션",
    "index-hero-btn": "지금 무료 상담받기"
  }
}
```

**Response:**
```json
{
  "success": true,
  "commitSha": "abc123...",
  "message": "3개 항목이 수정되었습니다. 배포까지 약 1-2분 소요됩니다."
}
```

---

## 8. 구현 단계

### Phase 1: 기반 작업 (1일) ✅ 완료

1. [x] HTML 파일에 `data-editable` 속성 마킹
   - index.html ✅
   - about.html ✅
   - service.html ✅
   - fund.html ✅
   - process.html ✅

2. [x] Worker에 GitHub API 연동 함수 추가
   - 파일 읽기 (`GET /repos/.../contents/...`) ✅
   - 파일 수정 및 커밋 (`PUT /repos/.../contents/...`) ✅

### Phase 2: 백엔드 API (1일) ✅ 완료

3. [x] Worker API 엔드포인트 구현
   - `GET /api/pages` - 페이지 목록 ✅
   - `GET /api/pages/:id/editables` - 편집 가능 텍스트 조회 ✅
   - `POST /api/pages/:id/update` - 텍스트 수정 적용 ✅

4. [x] HTMLRewriter 기반 안전한 HTML 수정 로직 ✅

### Phase 3: 프론트엔드 UI (1일) ⏳ 진행 중

5. [x] `/admin/pages.html` 페이지 생성 ✅
6. [ ] iframe 미리보기 구현 (목록/폼 방식으로 대체)
7. [ ] contentEditable 인라인 편집 구현 (textarea 방식으로 대체)
8. [x] 변경사항 추적 및 표시 ✅
9. [x] "적용하기" 버튼 및 로딩 상태 ✅

### Phase 4: 배포 및 통합 ✅ 완료

10. [x] dist/admin/pages.html 배포 ✅
11. [x] 관리자 사이드바에 메뉴 추가 ✅
    - admin/index.html ✅
    - admin/leads.html ✅
    - admin/board.html ✅
    - admin/employees.html ✅
    - admin/analytics.html ✅
    - admin/settings.html ✅
12. [ ] 프로덕션 테스트 ⏳

### Phase 5: 테스트 및 안정화 (예정)

13. [ ] 전체 흐름 테스트
14. [ ] 엣지 케이스 처리 (빈 텍스트, 특수문자 등)
15. [ ] 에러 핸들링 및 롤백 방안

---

## 9. 리스크 및 대응

| 리스크 | 확률 | 영향 | 대응책 |
|--------|------|------|--------|
| HTML 구조 파손 | 낮음 | 높음 | HTMLRewriter 사용, 수정 전 백업 |
| GitHub API 실패 | 낮음 | 중간 | 재시도 로직, 에러 메시지 표시 |
| Vercel 배포 실패 | 낮음 | 중간 | HTML 문법 검증, 롤백 커밋 준비 |
| 동시 편집 충돌 | 중간 | 중간 | 편집 잠금 기능 (Phase 2) |
| XSS 공격 | 중간 | 높음 | 텍스트 이스케이프 필수 |

---

## 10. 성공 지표

- [ ] 관리자가 5분 이내에 텍스트 수정 가능
- [ ] HTML 구조 파손 0건
- [ ] 수정 후 2분 이내 배포 완료
- [ ] 비개발자도 사용 가능한 UX

---

## 11. 향후 확장 (Phase 2)

- 이미지 교체 기능
- 수정 이력 관리
- 버전 롤백 기능
- 다중 사용자 편집 잠금
- 미리보기 모바일/데스크톱 전환

---

*문서 버전: 1.0*
*작성일: 2024-12-27*
