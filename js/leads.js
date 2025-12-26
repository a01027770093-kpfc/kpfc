/* ================================================
   BIZEN 접수내역 JavaScript
   Airtable 연동 버전
   ================================================ */

const WORKER_URL = 'https://bizen-homepage.weandbiz.workers.dev';

// 전역 변수
let allLeads = [];
let filteredLeads = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  loadSidebar('leads');
  loadDashboardHeader('접수내역', '상담 신청 접수 내역을 관리합니다');
  loadLeads();
});

// Airtable에서 데이터 로드
async function loadLeads() {
  try {
    showLoading(true);

    const response = await fetch(`${WORKER_URL}/leads`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to load leads');
    }

    allLeads = result.leads;
    filteredLeads = [...allLeads];
    renderLeads();
    updateTotalCount();

  } catch (error) {
    console.error('Error loading leads:', error);
    showError('데이터를 불러오는 중 오류가 발생했습니다.');
  } finally {
    showLoading(false);
  }
}

// 테이블 렌더링
function renderLeads() {
  const tbody = document.getElementById('leadsTableBody');

  if (filteredLeads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px; color: #6B7280;">
          접수된 내역이 없습니다.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredLeads.map(lead => `
    <tr data-id="${lead.id}">
      <td><input type="checkbox" class="lead-checkbox"></td>
      <td data-label="접수일">${formatDate(lead.createdTime)}</td>
      <td data-label="이름"><strong>${lead.대표자명}</strong></td>
      <td data-label="연락처"><a href="tel:${lead.연락처}">${lead.연락처}</a></td>
      <td data-label="회사명">${lead.기업명}</td>
      <td data-label="업종">${lead.업종 || '-'}</td>
      <td data-label="희망금액">${lead.필요자금규모 || '-'}</td>
      <td data-label="상태">
        <select class="status-select ${getStatusClass(lead.상태)}" onchange="updateStatus(this, '${lead.id}')">
          <option value="대기중" ${lead.상태 === '대기중' ? 'selected' : ''}>대기중</option>
          <option value="상담중" ${lead.상태 === '상담중' ? 'selected' : ''}>상담중</option>
          <option value="완료" ${lead.상태 === '완료' ? 'selected' : ''}>완료</option>
          <option value="취소" ${lead.상태 === '취소' ? 'selected' : ''}>취소</option>
        </select>
      </td>
      <td data-label="메모">
        <input type="text" class="memo-input" value="${lead.메모 || ''}" placeholder="메모 입력..." onchange="saveMemo(this, '${lead.id}')">
      </td>
      <td>
        <button class="btn-icon" onclick="viewDetail('${lead.id}')" title="상세보기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button class="btn-icon btn-icon-danger" onclick="deleteLead('${lead.id}')" title="삭제">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
}

// 날짜 포맷
function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 상태 클래스 반환
function getStatusClass(status) {
  const statusMap = {
    '대기중': 'pending',
    '상담중': 'progress',
    '완료': 'complete',
    '취소': 'cancel'
  };
  return statusMap[status] || 'pending';
}

// 총 개수 업데이트
function updateTotalCount() {
  document.getElementById('totalCount').textContent = filteredLeads.length;
}

// 로딩 표시
function showLoading(show) {
  const tbody = document.getElementById('leadsTableBody');
  if (show) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px;">
          <div style="display: inline-block; width: 24px; height: 24px; border: 3px solid #E5E7EB; border-top-color: #3B82F6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 10px; color: #6B7280;">데이터를 불러오는 중...</p>
        </td>
      </tr>
    `;
  }
}

// 에러 표시
function showError(message) {
  const tbody = document.getElementById('leadsTableBody');
  tbody.innerHTML = `
    <tr>
      <td colspan="10" style="text-align: center; padding: 40px; color: #EF4444;">
        ${message}
        <br><br>
        <button onclick="loadLeads()" style="padding: 8px 16px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer;">다시 시도</button>
      </td>
    </tr>
  `;
}

// 전체 선택
function toggleSelectAll() {
  const selectAll = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.lead-checkbox');
  checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

// 검색
function searchLeads() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();

  if (!keyword) {
    filteredLeads = [...allLeads];
  } else {
    filteredLeads = allLeads.filter(lead =>
      lead.대표자명.toLowerCase().includes(keyword) ||
      lead.기업명.toLowerCase().includes(keyword) ||
      lead.연락처.includes(keyword) ||
      (lead.이메일 && lead.이메일.toLowerCase().includes(keyword))
    );
  }

  renderLeads();
  updateTotalCount();
}

// 엑셀 다운로드
function exportToExcel() {
  if (filteredLeads.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  // CSV 생성
  const headers = ['접수일', '대표자명', '연락처', '이메일', '기업명', '업종', '희망금액', '상태', '메모'];
  const rows = filteredLeads.map(lead => [
    formatDate(lead.createdTime),
    lead.대표자명,
    lead.연락처,
    lead.이메일,
    lead.기업명,
    lead.업종,
    lead.필요자금규모,
    lead.상태,
    lead.메모
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell || ''}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `BIZEN_접수내역_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// 상태 변경
async function updateStatus(select, recordId) {
  const status = select.value;
  select.className = 'status-select ' + getStatusClass(status);

  try {
    const response = await fetch(`${WORKER_URL}/leads`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordId: recordId,
        fields: { '상태': status }
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    // 로컬 데이터 업데이트
    const lead = allLeads.find(l => l.id === recordId);
    if (lead) lead.상태 = status;

  } catch (error) {
    console.error('Error updating status:', error);
    alert('상태 변경 중 오류가 발생했습니다.');
  }
}

// 메모 저장
async function saveMemo(input, recordId) {
  const memo = input.value;

  try {
    const response = await fetch(`${WORKER_URL}/leads`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordId: recordId,
        fields: { '메모': memo }
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    // 로컬 데이터 업데이트
    const lead = allLeads.find(l => l.id === recordId);
    if (lead) lead.메모 = memo;

  } catch (error) {
    console.error('Error saving memo:', error);
    alert('메모 저장 중 오류가 발생했습니다.');
  }
}

// 상세보기
function viewDetail(recordId) {
  const lead = allLeads.find(l => l.id === recordId);
  if (!lead) return;

  document.getElementById('detailDate').textContent = formatDate(lead.createdTime);
  document.getElementById('detailName').textContent = lead.대표자명;
  document.getElementById('detailPhone').textContent = lead.연락처;
  document.getElementById('detailEmail').textContent = lead.이메일 || '-';
  document.getElementById('detailCompany').textContent = lead.기업명;
  document.getElementById('detailBusiness').textContent = lead.업종 || '-';
  document.getElementById('detailBizNo').textContent = lead.사업자번호 || '-';
  document.getElementById('detailAmount').textContent = lead.필요자금규모 || '-';
  document.getElementById('detailContent').textContent = lead.문의사항 || '문의 내용이 없습니다.';

  document.getElementById('detailModal').classList.add('open');
}

// 상세보기 모달 닫기
function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('open');
}

// 전화걸기
function callCustomer() {
  const phone = document.getElementById('detailPhone').textContent;
  window.location.href = 'tel:' + phone.replace(/-/g, '');
}

// 삭제 (Airtable에서는 실제 삭제하지 않고 UI에서만 제거)
function deleteLead(recordId) {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  // UI에서 제거
  allLeads = allLeads.filter(l => l.id !== recordId);
  filteredLeads = filteredLeads.filter(l => l.id !== recordId);
  renderLeads();
  updateTotalCount();

  // TODO: 실제 Airtable 삭제 API 호출이 필요하면 추가
}

// 필터 변경
document.getElementById('statusFilter')?.addEventListener('change', function() {
  const status = this.value;

  if (!status) {
    filteredLeads = [...allLeads];
  } else {
    const statusMap = {
      'pending': '대기중',
      'progress': '상담중',
      'complete': '완료',
      'cancel': '취소'
    };
    filteredLeads = allLeads.filter(lead => lead.상태 === statusMap[status]);
  }

  renderLeads();
  updateTotalCount();
});

document.getElementById('dateFilter')?.addEventListener('change', function() {
  const days = parseInt(this.value);

  if (this.value === 'all') {
    filteredLeads = [...allLeads];
  } else {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    filteredLeads = allLeads.filter(lead => new Date(lead.createdTime) >= cutoff);
  }

  renderLeads();
  updateTotalCount();
});

// 엔터키로 검색
document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    searchLeads();
  }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeDetailModal();
  }
});

// 모달 외부 클릭 시 닫기
document.getElementById('detailModal')?.addEventListener('click', function(e) {
  if (e.target === this) {
    closeDetailModal();
  }
});

// 스피너 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
