# 홈페이지 인라인 에디터 구현 요청문

## 전체 구현 요청

```
docs/PRD-inline-editor.md 기획서를 기반으로 홈페이지 인라인 텍스트 에디터를 구현해줘.

순서:
1. 각 HTML 파일에 data-editable 마킹 (헤더/푸터/폼 제외)
2. Worker에 GitHub API 연동 및 HTMLRewriter 기반 수정 API 구현
3. /admin/pages.html 관리자 UI 구현
4. 테스트
```

---

## 단계별 요청문

### Phase 1: HTML 마킹

```
index.html, about.html, service.html, fund.html, process.html 파일에
data-editable 속성을 추가해줘.

규칙:
- ID 형식: {페이지}-{섹션}-{요소}
- 제외: 헤더, 푸터, 폼, 네비게이션
- 포함: 제목, 설명, 버튼 텍스트, 리스트 항목
```

### Phase 2: Worker API

```
Worker에 홈페이지 텍스트 수정 API를 추가해줘.

엔드포인트:
1. GET /api/pages - 페이지 목록
2. GET /api/pages/:id/editables - 편집 가능 텍스트 조회
3. POST /api/pages/:id/update - 텍스트 수정 및 GitHub 커밋

안전성:
- HTMLRewriter 사용 (HTML 구조 유지)
- XSS 방지를 위한 escapeHtml 처리
- GitHub API로 파일 수정 및 커밋
```

### Phase 3: 관리자 UI

```
/admin/pages.html 홈페이지관리 페이지를 만들어줘.

기능:
1. 페이지 선택 드롭다운
2. iframe으로 페이지 미리보기
3. data-editable 요소 클릭 시 인라인 편집
4. 수정된 항목 목록 표시
5. "적용하기" 버튼 → Worker API 호출 → 완료 알림

UX:
- 편집 가능 요소 호버 시 파란 점선 테두리
- 편집 중인 요소 파란 실선 + 배경색
- 수정된 요소 초록 테두리
```

### Phase 4: 테스트

```
홈페이지 인라인 에디터 전체 흐름을 테스트해줘.

테스트 시나리오:
1. 관리자 대시보드 > 홈페이지관리 접속
2. 페이지 선택 후 미리보기 확인
3. 텍스트 클릭하여 수정
4. "적용하기" 클릭
5. GitHub 커밋 확인
6. 실제 사이트 반영 확인
```

---

## 버그 수정 / 개선 요청문

### HTML 구조 깨짐 시

```
홈페이지관리에서 텍스트 수정 후 HTML 구조가 깨졌어.
HTMLRewriter 로직을 확인하고 안전하게 텍스트만 교체되도록 수정해줘.
```

### GitHub 커밋 실패 시

```
홈페이지관리에서 적용하기 누르면 GitHub 커밋이 실패해.
Worker의 GitHub API 호출 로직을 확인하고 수정해줘.
에러 메시지: [에러 내용]
```

### 편집 UI 문제 시

```
홈페이지관리에서 텍스트 클릭해도 편집이 안 돼.
iframe 내부의 contentEditable 설정과 이벤트 핸들러를 확인해줘.
```

---

## 참고 파일

- 기획서: `docs/PRD-inline-editor.md`
- Worker: `scripts/worker.js`
- 관리자 UI: `admin/pages.html` (생성 예정)
- 대상 HTML: `index.html`, `about.html`, `service.html`, `fund.html`, `process.html`
