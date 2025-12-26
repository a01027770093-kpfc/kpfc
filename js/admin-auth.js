// BIZEN 관리자 인증 모듈
const WORKER_URL = 'https://bizen-homepage.weandbiz.workers.dev';
const AUTH_KEY = 'bizen_admin_auth';

// 인증 상태 확인
function checkAuth() {
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return false;

  try {
    const { token, expiresAt } = JSON.parse(auth);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return false;
  }
}

// 로그인 처리
async function login(password) {
  try {
    const response = await fetch(`${WORKER_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        token: result.token,
        expiresAt: Date.now() + result.expiresIn
      }));
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 로그아웃
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = '/admin/';
}

// 로그인 모달 표시
function showLoginModal() {
  // 기존 모달 제거
  const existing = document.getElementById('login-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'login-modal';
  modal.innerHTML = `
    <style>
      #login-modal {
        position: fixed;
        inset: 0;
        background: rgba(10, 22, 40, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .login-box {
        background: linear-gradient(145deg, #0f2847, #1a365d);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 16px;
        padding: 40px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }
      .login-box h2 {
        color: #fff;
        font-size: 24px;
        margin: 0 0 8px 0;
        text-align: center;
      }
      .login-box p {
        color: rgba(255,255,255,0.6);
        font-size: 14px;
        margin: 0 0 24px 0;
        text-align: center;
      }
      .login-input {
        width: 100%;
        padding: 14px 16px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: #fff;
        font-size: 16px;
        outline: none;
        box-sizing: border-box;
      }
      .login-input:focus {
        border-color: #3B82F6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }
      .login-btn {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #3B82F6, #2563EB);
        border: none;
        border-radius: 10px;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 16px;
        transition: all 0.3s;
      }
      .login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
      }
      .login-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      .login-error {
        color: #EF4444;
        font-size: 13px;
        margin-top: 12px;
        text-align: center;
        display: none;
      }
    </style>
    <div class="login-box">
      <h2>BIZEN 관리자</h2>
      <p>관리자 비밀번호를 입력하세요</p>
      <input type="password" class="login-input" id="login-password" placeholder="비밀번호" autocomplete="current-password">
      <button class="login-btn" id="login-submit">로그인</button>
      <p class="login-error" id="login-error"></p>
    </div>
  `;

  document.body.appendChild(modal);

  const passwordInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('login-submit');
  const errorEl = document.getElementById('login-error');

  // 엔터키 처리
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitBtn.click();
  });

  // 로그인 버튼 클릭
  submitBtn.addEventListener('click', async () => {
    const password = passwordInput.value.trim();
    if (!password) {
      errorEl.textContent = '비밀번호를 입력하세요';
      errorEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '로그인 중...';
    errorEl.style.display = 'none';

    const result = await login(password);

    if (result.success) {
      modal.remove();
      window.location.reload();
    } else {
      errorEl.textContent = '비밀번호가 올바르지 않습니다';
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = '로그인';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });

  passwordInput.focus();
}

// 페이지 로드 시 인증 체크
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) {
    showLoginModal();
  }
});

// 전역 함수 등록
window.bizenAuth = { checkAuth, login, logout, showLoginModal };
