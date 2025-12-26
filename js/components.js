/* ================================================
   BIZEN 컴포넌트 로더
   공통 컴포넌트를 동적으로 로드하여 코드 중복 제거
   ================================================ */

// 대시보드 사이드바 컴포넌트
function loadSidebar(currentPage) {
  const sidebarHTML = `
    <div class="sidebar-header">
      <h1 class="logo">BIZEN</h1>
      <span class="logo-sub">관리자</span>
    </div>

    <nav class="sidebar-nav">
      <a href="index.html" class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}">
        <span class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </span>
        <span class="nav-text">대시보드</span>
      </a>
      <a href="leads.html" class="nav-item ${currentPage === 'leads' ? 'active' : ''}">
        <span class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
          </svg>
        </span>
        <span class="nav-text">접수내역</span>
      </a>
      <a href="board.html" class="nav-item ${currentPage === 'board' ? 'active' : ''}">
        <span class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </span>
        <span class="nav-text">게시판 관리</span>
      </a>
      <a href="analytics.html" class="nav-item ${currentPage === 'analytics' ? 'active' : ''}">
        <span class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </span>
        <span class="nav-text">방문통계</span>
      </a>
      <a href="settings.html" class="nav-item ${currentPage === 'settings' ? 'active' : ''}">
        <span class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </span>
        <span class="nav-text">설정</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <a href="../index.html" class="nav-item">
        <span class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </span>
        <span class="nav-text">사이트 보기</span>
      </a>
    </div>
  `;

  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.innerHTML = sidebarHTML;
  }
}

// 대시보드 헤더 컴포넌트
function loadDashboardHeader(title, subtitle) {
  const headerHTML = `
    <div class="header-left">
      <button class="mobile-menu-btn" onclick="toggleSidebar()" aria-label="메뉴 열기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div>
        <h2 class="page-title">${title}</h2>
        <p class="page-subtitle">${subtitle}</p>
      </div>
    </div>
    <div class="header-right">
      <span class="user-name">관리자</span>
      <button class="btn-logout" onclick="handleLogout()">로그아웃</button>
    </div>
  `;

  const header = document.querySelector('.dashboard-header');
  if (header) {
    header.innerHTML = headerHTML;
  }
}

// 사이드바 토글 (모바일)
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  let overlay = document.querySelector('.sidebar-overlay');

  // 오버레이가 없으면 생성
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.onclick = closeSidebar;
    document.body.appendChild(overlay);
  }

  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

// 사이드바 닫기
function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  sidebar?.classList.remove('open');
  overlay?.classList.remove('open');
}

// 로그아웃 처리
function handleLogout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    alert('로그아웃 되었습니다.');
    // window.location.href = '/login.html';
  }
}

// 반응형 처리
function initResponsive() {
  const menuBtn = document.querySelector('.mobile-menu-btn');

  function handleResize() {
    if (window.innerWidth <= 768) {
      if (menuBtn) menuBtn.style.display = 'flex';
    } else {
      if (menuBtn) menuBtn.style.display = 'none';
      document.querySelector('.sidebar')?.classList.remove('open');
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  // 사이드바 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.querySelector('.mobile-menu-btn');

    if (window.innerWidth <= 768 &&
        sidebar &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !menuBtn?.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  initResponsive();
});
