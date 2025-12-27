# TDD: 홈페이지 인라인 텍스트 에디터

## 1. 개요

### 1.1 목적
PRD-inline-editor.md에 정의된 인라인 텍스트 에디터의 기술 구현 상세

### 1.2 관련 문서
- PRD: `docs/PRD-inline-editor.md`
- 메인 PRD: `PRD-KPFC-homepage.md`

---

## 2. 시스템 아키텍처

### 2.1 전체 구조

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Admin UI      │     │   Cloudflare     │     │   GitHub API    │
│   pages.html    │────>│   Worker         │────>│   REST API      │
│                 │     │   kpfc-api       │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        │ 1. GET /api/pages      │ 2. 파일 목록 조회      │
        │───────────────────────>│                        │
        │                        │                        │
        │ 3. GET /api/pages/:id/editables                 │
        │───────────────────────>│ 4. HTML 파일 읽기      │
        │                        │───────────────────────>│
        │                        │<───────────────────────│
        │                        │ 5. data-editable 파싱  │
        │<───────────────────────│                        │
        │                        │                        │
        │ 6. POST /api/pages/:id/update                   │
        │───────────────────────>│ 7. HTML 수정 & 커밋    │
        │                        │───────────────────────>│
        │<───────────────────────│                        │
```

### 2.2 컴포넌트 상세

| 컴포넌트 | 위치 | 역할 |
|----------|------|------|
| Admin UI | `admin/pages.html` | 페이지 편집 인터페이스 |
| Worker API | `worker/index.js` | API 엔드포인트, GitHub 연동 |
| HTML Parser | Worker 내장 | data-editable 속성 파싱 |
| GitHub Client | Worker 내장 | 파일 읽기/쓰기/커밋 |

---

## 3. API 상세 설계

### 3.1 페이지 목록 조회

**Endpoint**: `GET /api/pages`

**Response**:
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

### 3.2 편집 가능 텍스트 조회

**Endpoint**: `GET /api/pages/:pageId/editables`

**로직**:
1. GitHub API로 HTML 파일 읽기
2. Base64 디코딩
3. 정규식으로 `data-editable` 속성 파싱
4. ID, 텍스트, 태그명 추출

**Response**:
```json
{
  "success": true,
  "pageId": "index",
  "editables": [
    { "id": "index-hero-title", "text": "정책자금 전문 컨설팅", "tag": "h1" },
    { "id": "index-hero-desc", "text": "중소기업을 위한 맞춤 솔루션", "tag": "p" }
  ]
}
```

### 3.3 텍스트 수정 적용

**Endpoint**: `POST /api/pages/:pageId/update`

**Request**:
```json
{
  "changes": {
    "index-hero-title": "새로운 제목",
    "index-hero-desc": "새로운 설명"
  }
}
```

**로직**:
1. GitHub API로 HTML 파일 읽기
2. 각 변경사항에 대해 정규식으로 텍스트 교체
3. XSS 방지를 위한 HTML 이스케이프
4. GitHub API로 커밋 & 푸시

**Response**:
```json
{
  "success": true,
  "message": "2개 항목이 수정되었습니다. 배포까지 약 1-2분 소요됩니다.",
  "commitSha": "abc123..."
}
```

---

## 4. 데이터 모델

### 4.1 페이지 정의 (Worker 하드코딩)

```javascript
const PAGES = [
  { id: 'index', name: '메인 페이지', path: 'index.html' },
  { id: 'about', name: '회사 소개', path: 'about.html' },
  { id: 'service', name: '서비스 안내', path: 'service.html' },
  { id: 'fund', name: '정책자금 안내', path: 'fund.html' },
  { id: 'process', name: '진행 절차', path: 'process.html' },
];
```

### 4.2 Editable 객체

```typescript
interface Editable {
  id: string;      // data-editable 속성값 (예: "index-hero-title")
  text: string;    // 현재 텍스트 내용
  tag: string;     // HTML 태그명 (예: "h1", "p", "span")
}
```

### 4.3 ID 명명 규칙

```
{페이지}-{섹션}-{요소}[-{인덱스}]

예시:
- index-hero-title
- index-hero-desc
- about-intro-title
- service-features-item1-title
```

---

## 5. 보안 설계

### 5.1 XSS 방지

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

### 5.2 GitHub 토큰 보안

| 항목 | 설정 |
|------|------|
| 저장 위치 | Cloudflare Worker Secret |
| 환경변수명 | `GITHUB_TOKEN` |
| 권한 | `repo` (Contents read/write) |

### 5.3 CORS 설정

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

---

## 6. 파일 구조

### 6.1 Worker 파일

```
worker/
└── index.js          # 메인 Worker 코드
    ├── handlePages()           # GET /api/pages
    ├── handlePageEditables()   # GET /api/pages/:id/editables
    ├── handlePageUpdate()      # POST /api/pages/:id/update
    ├── fetchGitHubFile()       # GitHub 파일 읽기
    ├── updateGitHubFile()      # GitHub 파일 수정
    └── escapeHtml()            # XSS 방지
```

### 6.2 Admin UI 파일

```
admin/
└── pages.html        # 페이지 편집 UI
    ├── 페이지 탭
    ├── 검색 필터
    ├── 편집 목록 (textarea)
    ├── 저장 바
    └── 토스트 알림
```

### 6.3 배포 파일

```
dist/
└── admin/
    └── pages.html    # 프로덕션 배포용
```

---

## 7. 구현 상태

### 7.1 완료된 항목

| 항목 | 파일 | 상태 |
|------|------|------|
| Worker API | `worker/index.js` | ✅ 완료 |
| GET /api/pages | Worker | ✅ 완료 |
| GET /api/pages/:id/editables | Worker | ✅ 완료 |
| POST /api/pages/:id/update | Worker | ✅ 완료 |
| Admin UI | `admin/pages.html` | ✅ 완료 |
| HTML data-editable 마킹 | 각 페이지 | ✅ 완료 |

### 7.2 미완료 항목

| 항목 | 설명 | 상태 |
|------|------|------|
| dist 배포 | `dist/admin/pages.html` 생성 | ⏳ 진행 중 |
| 사이드바 메뉴 | 모든 admin 페이지에 메뉴 추가 | ⏳ 진행 중 |
| 프로덕션 테스트 | 실제 환경 테스트 | 대기 |

---

## 8. 배포 체크리스트

### 8.1 Worker 배포 ✅

```bash
# 완료됨
Worker URL: https://kpfc-api.a01027770093.workers.dev
환경변수: GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH
Secret: GITHUB_TOKEN
```

### 8.2 Admin UI 배포 ⏳

```bash
# 필요한 작업
1. admin/pages.html → dist/admin/pages.html 복사
2. 모든 admin/*.html 사이드바에 "페이지 편집" 메뉴 추가
3. Git commit & push
4. Vercel 자동 배포
```

---

## 9. 테스트 시나리오

### 9.1 기능 테스트

| 시나리오 | 예상 결과 |
|----------|-----------|
| 페이지 목록 조회 | 5개 페이지 표시 |
| 편집 가능 텍스트 로드 | data-editable 항목 표시 |
| 텍스트 수정 | 수정 표시, 저장 바 활성화 |
| 저장 | GitHub 커밋, 성공 토스트 |
| 검색 | ID/텍스트로 필터링 |

### 9.2 엣지 케이스

| 케이스 | 처리 |
|--------|------|
| 빈 텍스트 | 허용 (빈 문자열 저장) |
| 특수문자 | HTML 이스케이프 적용 |
| 긴 텍스트 | textarea 자동 확장 |
| 네트워크 오류 | 에러 메시지 표시 |

---

## 10. 향후 개선

### 10.1 Phase 2 계획

- [ ] 이미지 교체 기능
- [ ] 수정 이력 관리
- [ ] 버전 롤백 기능
- [ ] 다중 사용자 편집 잠금
- [ ] 미리보기 모바일/데스크톱 전환

### 10.2 기술 부채

| 항목 | 설명 | 우선순위 |
|------|------|----------|
| iframe 미리보기 | 현재 목록 방식, 실시간 미리보기 미구현 | 중 |
| contentEditable | 현재 textarea 방식, 인라인 편집 미구현 | 중 |
| 동시 편집 잠금 | 미구현 | 낮음 |

---

*문서 버전: 1.0*
*작성일: 2025-12-27*
