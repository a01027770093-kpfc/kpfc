/* ================================================
   BIZEN 방문통계 - analytics.js
   샘플 데이터 기반 통계 및 자동 분석
   ================================================ */

// 1년치 샘플 데이터 생성 (실제 운영 시 Google Analytics / Airtable 연동)
const sampleData = generateYearlyData();

function generateYearlyData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const currentDate = now.getDate();

  // 일간 데이터 (최근 1년, 월별로 그룹화)
  const dailyData = {};
  for (let m = 0; m <= currentMonth; m++) {
    const monthKey = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
    const daysInMonth = m === currentMonth ? currentDate : new Date(currentYear, m + 1, 0).getDate();

    dailyData[monthKey] = {
      labels: [],
      visitors: [],
      pageviews: [],
      duration: [],
      leads: []
    };

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${m + 1}/${d}`;
      // 랜덤하지만 일관된 데이터 생성 (시드 기반)
      const seed = m * 31 + d;
      const baseVisitors = 80 + Math.floor(Math.sin(seed) * 30 + 30);

      dailyData[monthKey].labels.push(dateStr);
      dailyData[monthKey].visitors.push(baseVisitors + Math.floor(Math.random() * 20));
      dailyData[monthKey].pageviews.push(baseVisitors * 3 + Math.floor(Math.random() * 50));
      dailyData[monthKey].duration.push(120 + Math.floor(Math.random() * 60));
      dailyData[monthKey].leads.push(Math.floor(baseVisitors * 0.05) + Math.floor(Math.random() * 3));
    }
  }

  // 주간 데이터 (최근 1년, 월별로 그룹화)
  const weeklyData = {};
  for (let m = 0; m <= currentMonth; m++) {
    const monthKey = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
    const weeksInMonth = m === currentMonth ? Math.ceil(currentDate / 7) : 4;

    weeklyData[monthKey] = {
      labels: [],
      visitors: [],
      pageviews: [],
      duration: [],
      leads: []
    };

    for (let w = 1; w <= weeksInMonth; w++) {
      const weekNum = m * 4 + w;
      weeklyData[monthKey].labels.push(`W${weekNum}`);

      const baseVisitors = 500 + Math.floor(Math.sin(weekNum) * 150 + 150);
      weeklyData[monthKey].visitors.push(baseVisitors + Math.floor(Math.random() * 100));
      weeklyData[monthKey].pageviews.push(baseVisitors * 3 + Math.floor(Math.random() * 200));
      weeklyData[monthKey].duration.push(140 + Math.floor(Math.random() * 40));
      weeklyData[monthKey].leads.push(Math.floor(baseVisitors * 0.04) + Math.floor(Math.random() * 5));
    }
  }

  // 월간 데이터 (최근 1년)
  const monthlyData = {
    labels: [],
    visitors: [],
    pageviews: [],
    duration: [],
    leads: []
  };

  for (let m = 0; m <= currentMonth; m++) {
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    monthlyData.labels.push(monthNames[m]);

    const baseVisitors = 2000 + Math.floor(Math.sin(m) * 500 + 500);
    monthlyData.visitors.push(baseVisitors + Math.floor(Math.random() * 300));
    monthlyData.pageviews.push(baseVisitors * 3 + Math.floor(Math.random() * 500));
    monthlyData.duration.push(145 + Math.floor(Math.random() * 30));
    monthlyData.leads.push(Math.floor(baseVisitors * 0.04) + Math.floor(Math.random() * 10));
  }

  return {
    daily: dailyData,
    weekly: weeklyData,
    monthly: monthlyData
  };
}

// 월 이름 배열
const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

// 현재 선택된 기간
let currentPeriod = 'daily';
let trendChart = null;

// 현재 선택된 월 (최신 월로 초기화)
const now = new Date();
let selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

// 펼쳐진 월 목록
let expandedMonths = new Set([selectedMonth]);

// 모바일 차트 네비게이션
let chartViewStart = 0;
const MOBILE_VIEW_COUNT = 4; // 모바일에서 한 번에 보여줄 데이터 개수

// 페이지 초기화
document.addEventListener('DOMContentLoaded', function() {
  initPeriodTabs();
  initChartNavigation();
  updateDashboard();
});

// 현재 데이터 가져오기 (일간/주간은 월별, 월간은 전체)
function getCurrentData() {
  if (currentPeriod === 'monthly') {
    return sampleData.monthly;
  }

  const monthData = currentPeriod === 'daily'
    ? sampleData.daily[selectedMonth]
    : sampleData.weekly[selectedMonth];

  // 해당 월 데이터가 없으면 빈 데이터 반환
  if (!monthData) {
    return { labels: [], visitors: [], pageviews: [], duration: [], leads: [] };
  }

  return monthData;
}

// 사용 가능한 월 목록 가져오기 (역순)
function getAvailableMonths() {
  const data = currentPeriod === 'daily' ? sampleData.daily : sampleData.weekly;
  return Object.keys(data).sort().reverse();
}

// 차트 네비게이션 초기화
function initChartNavigation() {
  const prevBtn = document.getElementById('chartPrevBtn');
  const nextBtn = document.getElementById('chartNextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (chartViewStart > 0) {
        chartViewStart--;
        updateDashboard();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      const data = sampleData[currentPeriod];
      const maxStart = data.labels.length - MOBILE_VIEW_COUNT;
      if (chartViewStart < maxStart) {
        chartViewStart++;
        updateDashboard();
      }
    });
  }
}

// 기간 탭 초기화
function initPeriodTabs() {
  const tabs = document.querySelectorAll('.period-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentPeriod = this.dataset.period;
      chartViewStart = 0; // 기간 변경 시 차트 시작점 리셋

      // 기간 변경 시 최신 월로 리셋
      const now = new Date();
      selectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      expandedMonths = new Set([selectedMonth]);

      updateDashboard();
    });
  });
}

// 대시보드 업데이트
function updateDashboard() {
  const data = getCurrentData();
  const prevData = getPreviousPeriodData();

  // 집계 기간 업데이트
  updatePeriodRange();

  // 통계 카드 업데이트
  updateStatCards(data, prevData);

  // 차트 업데이트
  updateChart(data);

  // 데이터 테이블 업데이트
  updateDataTable();

  // 인사이트 업데이트
  updateInsights(data, prevData);

  // 전환율 업데이트
  updateConversion(data);
}

// 집계 기간 업데이트 (통계 카드 기준일)
function updatePeriodRange() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDate = now.getDate();

  let rangeText = '';

  if (currentPeriod === 'monthly') {
    // 월간: 이번 달 전체
    rangeText = `${currentYear}.${String(currentMonth).padStart(2, '0')}.01 ~ ${currentYear}.${String(currentMonth).padStart(2, '0')}.${String(currentDate).padStart(2, '0')}`;
  } else if (currentPeriod === 'weekly') {
    // 주간: 이번 주 (월요일 ~ 오늘)
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(currentDate - mondayOffset);

    const monMonth = String(monday.getMonth() + 1).padStart(2, '0');
    const monDate = String(monday.getDate()).padStart(2, '0');
    const monYear = monday.getFullYear();

    rangeText = `${monYear}.${monMonth}.${monDate} ~ ${currentYear}.${String(currentMonth).padStart(2, '0')}.${String(currentDate).padStart(2, '0')}`;
  } else {
    // 일간: 오늘
    rangeText = `${currentYear}.${String(currentMonth).padStart(2, '0')}.${String(currentDate).padStart(2, '0')}`;
  }

  document.getElementById('period-range-value').textContent = rangeText;
}

// 이전 기간 데이터 (비교용)
function getPreviousPeriodData() {
  const data = getCurrentData();
  const len = data.visitors.length;

  if (len < 2) {
    return {
      visitors: data.visitors[0] || 0,
      pageviews: data.pageviews[0] || 0,
      duration: data.duration[0] || 0,
      leads: data.leads[0] || 0
    };
  }

  // 이전 기간의 마지막 값 (간단 비교)
  return {
    visitors: data.visitors[len - 2],
    pageviews: data.pageviews[len - 2],
    duration: data.duration[len - 2],
    leads: data.leads[len - 2]
  };
}

// 통계 카드 업데이트
function updateStatCards(data, prevData) {
  const current = {
    visitors: data.visitors[data.visitors.length - 1],
    pageviews: data.pageviews[data.pageviews.length - 1],
    duration: data.duration[data.duration.length - 1],
    leads: data.leads[data.leads.length - 1]
  };

  const periodLabel = getPeriodLabel();

  // 방문자
  document.getElementById('stat-visitors').textContent = current.visitors.toLocaleString();
  updateChangeIndicator('stat-visitors-change', current.visitors, prevData.visitors, periodLabel);

  // 페이지뷰
  document.getElementById('stat-pageviews').textContent = current.pageviews.toLocaleString();
  updateChangeIndicator('stat-pageviews-change', current.pageviews, prevData.pageviews, periodLabel);

  // 체류시간
  document.getElementById('stat-duration').textContent = formatDuration(current.duration);
  updateChangeIndicator('stat-duration-change', current.duration, prevData.duration, periodLabel);

  // 접수
  document.getElementById('stat-leads').textContent = current.leads.toLocaleString();
  updateChangeIndicator('stat-leads-change', current.leads, prevData.leads, periodLabel, true);
}

// 변화율 표시 업데이트
function updateChangeIndicator(elementId, current, previous, periodLabel, isCount = false) {
  const element = document.getElementById(elementId);
  const change = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : 0;
  const diff = current - previous;

  if (isCount) {
    // 접수는 건수로 표시
    const sign = diff >= 0 ? '+' : '';
    element.textContent = `${sign}${diff}건 ${periodLabel}`;
    element.className = `stat-change ${diff >= 0 ? 'positive' : 'negative'}`;
  } else {
    const sign = change >= 0 ? '+' : '';
    element.textContent = `${sign}${change}% ${periodLabel}`;
    element.className = `stat-change ${change >= 0 ? 'positive' : 'negative'}`;
  }
}

// 기간 레이블
function getPeriodLabel() {
  switch(currentPeriod) {
    case 'daily': return '전일 대비';
    case 'weekly': return '전주 대비';
    case 'monthly': return '전월 대비';
  }
}

// 시간 포맷
function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}분 ${sec}초`;
}

// 데이터 테이블 업데이트 (월별 그룹화)
function updateDataTable() {
  const tableBody = document.getElementById('analytics-table-body');
  const tableTitle = document.getElementById('table-title');

  // 테이블 타이틀 업데이트
  const titleMap = {
    daily: '일별 상세 데이터 (1년간)',
    weekly: '주간 상세 데이터 (1년간)',
    monthly: '월간 상세 데이터 (1년간)'
  };
  tableTitle.textContent = titleMap[currentPeriod];

  let rows = '';

  if (currentPeriod === 'monthly') {
    // 월간: 단순 역순 표시
    rows = renderMonthlyTable(sampleData.monthly);
  } else {
    // 일간/주간: 월별 그룹화
    rows = renderGroupedTable();
  }

  tableBody.innerHTML = rows;

  // 월 그룹 토글 이벤트 바인딩
  bindMonthToggleEvents();
}

// 월간 테이블 렌더링
function renderMonthlyTable(data) {
  if (!data.labels.length) return '<tr><td colspan="6" style="text-align:center; color:#999; padding:40px;">데이터가 없습니다</td></tr>';

  const totalVisitors = data.visitors.reduce((a, b) => a + b, 0);
  const totalPageviews = data.pageviews.reduce((a, b) => a + b, 0);
  const avgDuration = Math.round(data.duration.reduce((a, b) => a + b, 0) / data.duration.length);
  const totalLeads = data.leads.reduce((a, b) => a + b, 0);
  const totalConversionRate = ((totalLeads / totalVisitors) * 100).toFixed(2);

  let rows = '';
  const len = data.labels.length;

  for (let i = len - 1; i >= 0; i--) {
    const visitors = data.visitors[i];
    const pageviews = data.pageviews[i];
    const duration = data.duration[i];
    const leads = data.leads[i];
    const conversionRate = ((leads / visitors) * 100).toFixed(2);

    const isCurrent = i === len - 1;
    const rowClass = isCurrent ? 'current' : '';

    rows += `
      <tr class="${rowClass}">
        <td>${data.labels[i]}</td>
        <td class="text-primary">${visitors.toLocaleString()}</td>
        <td>${pageviews.toLocaleString()}</td>
        <td class="text-warning">${formatDuration(duration)}</td>
        <td class="text-error">${leads}건</td>
        <td class="text-success">${conversionRate}%</td>
      </tr>
    `;
  }

  rows += `
    <tr class="summary-row">
      <td><strong>연간 합계</strong></td>
      <td class="text-primary"><strong>${totalVisitors.toLocaleString()}</strong></td>
      <td><strong>${totalPageviews.toLocaleString()}</strong></td>
      <td class="text-warning"><strong>${formatDuration(avgDuration)}</strong> (평균)</td>
      <td class="text-error"><strong>${totalLeads}건</strong></td>
      <td class="text-success"><strong>${totalConversionRate}%</strong></td>
    </tr>
  `;

  return rows;
}

// 월별 그룹화 테이블 렌더링
function renderGroupedTable() {
  const months = getAvailableMonths();
  if (!months.length) return '<tr><td colspan="6" style="text-align:center; color:#999; padding:40px;">데이터가 없습니다</td></tr>';

  let rows = '';

  months.forEach((monthKey, monthIdx) => {
    const data = currentPeriod === 'daily' ? sampleData.daily[monthKey] : sampleData.weekly[monthKey];
    if (!data || !data.labels.length) return;

    // 월 합계 계산
    const totalVisitors = data.visitors.reduce((a, b) => a + b, 0);
    const totalPageviews = data.pageviews.reduce((a, b) => a + b, 0);
    const avgDuration = Math.round(data.duration.reduce((a, b) => a + b, 0) / data.duration.length);
    const totalLeads = data.leads.reduce((a, b) => a + b, 0);
    const conversionRate = ((totalLeads / totalVisitors) * 100).toFixed(2);

    // 월 이름 가져오기 (모바일에서는 축약)
    const [year, month] = monthKey.split('-');
    const monthLabel = isMobile()
      ? `${year.slice(2)}.${month}`               // 모바일: "25.11"
      : `${year}년 ${parseInt(month)}월`;         // PC: "2025년 11월"
    const isExpanded = expandedMonths.has(monthKey);
    const isCurrent = monthIdx === 0;

    // 월 헤더 행 (클릭으로 펼치기/접기) - 각 컬럼에 합계 표시
    rows += `
      <tr class="month-group-header ${isCurrent ? 'current' : ''}" data-month="${monthKey}">
        <td>
          <div class="month-toggle">
            <span class="toggle-icon">${isExpanded ? '▼' : '▶'}</span>
            <strong>${monthLabel}</strong>
          </div>
        </td>
        <td class="text-primary">${totalVisitors.toLocaleString()}</td>
        <td>${totalPageviews.toLocaleString()}</td>
        <td class="text-warning">${formatDuration(avgDuration)}</td>
        <td class="text-error">${totalLeads}건</td>
        <td class="text-success">${conversionRate}%</td>
      </tr>
    `;

    // 펼쳐진 경우 상세 데이터 표시
    if (isExpanded) {
      const len = data.labels.length;
      for (let i = len - 1; i >= 0; i--) {
        const visitors = data.visitors[i];
        const pageviews = data.pageviews[i];
        const duration = data.duration[i];
        const leads = data.leads[i];
        const cr = ((leads / visitors) * 100).toFixed(2);

        const isLatest = monthIdx === 0 && i === len - 1;

        rows += `
          <tr class="month-detail-row ${isLatest ? 'current' : ''}" data-month="${monthKey}">
            <td style="padding-left: 32px;">${data.labels[i]}</td>
            <td class="text-primary">${visitors.toLocaleString()}</td>
            <td>${pageviews.toLocaleString()}</td>
            <td class="text-warning">${formatDuration(duration)}</td>
            <td class="text-error">${leads}건</td>
            <td class="text-success">${cr}%</td>
          </tr>
        `;
      }

      // 월별 소계
      rows += `
        <tr class="month-subtotal" data-month="${monthKey}">
          <td style="padding-left: 32px;"><strong>소계</strong></td>
          <td class="text-primary"><strong>${totalVisitors.toLocaleString()}</strong></td>
          <td><strong>${totalPageviews.toLocaleString()}</strong></td>
          <td class="text-warning"><strong>${formatDuration(avgDuration)}</strong></td>
          <td class="text-error"><strong>${totalLeads}건</strong></td>
          <td class="text-success"><strong>${conversionRate}%</strong></td>
        </tr>
      `;
    }
  });

  return rows;
}

// 월 토글 이벤트 바인딩
function bindMonthToggleEvents() {
  document.querySelectorAll('.month-group-header').forEach(header => {
    header.addEventListener('click', function() {
      const monthKey = this.dataset.month;
      if (expandedMonths.has(monthKey)) {
        expandedMonths.delete(monthKey);
      } else {
        expandedMonths.add(monthKey);
      }
      // 선택된 월 업데이트
      selectedMonth = monthKey;
      chartViewStart = 0;
      updateDashboard();
    });
  });
}

// 모바일 여부 감지
function isMobile() {
  return window.innerWidth <= 768;
}

// 모바일용 데이터 슬라이싱
function getChartData(data) {
  const mobile = isMobile();

  if (!mobile) {
    return data;
  }

  // 모바일: 일부 데이터만 표시
  const end = chartViewStart + MOBILE_VIEW_COUNT;
  return {
    labels: data.labels.slice(chartViewStart, end),
    visitors: data.visitors.slice(chartViewStart, end),
    pageviews: data.pageviews.slice(chartViewStart, end),
    duration: data.duration.slice(chartViewStart, end),
    leads: data.leads.slice(chartViewStart, end)
  };
}

// 차트 네비게이션 UI 업데이트
function updateChartNavigation(data) {
  const mobile = isMobile();
  const prevBtn = document.getElementById('chartPrevBtn');
  const nextBtn = document.getElementById('chartNextBtn');
  const indicator = document.getElementById('chartNavIndicator');

  if (!prevBtn || !nextBtn || !indicator) return;

  if (!mobile) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    indicator.style.display = 'none';
    return;
  }

  const totalPoints = data.labels.length;
  const maxStart = totalPoints - MOBILE_VIEW_COUNT;
  const totalPages = Math.ceil(totalPoints / MOBILE_VIEW_COUNT);

  // 버튼 활성화/비활성화
  prevBtn.disabled = chartViewStart <= 0;
  nextBtn.disabled = chartViewStart >= maxStart;

  // 인디케이터 생성
  let dots = '';
  for (let i = 0; i <= maxStart; i++) {
    const isActive = i === chartViewStart ? 'active' : '';
    dots += `<span class="chart-nav-dot ${isActive}"></span>`;
  }
  indicator.innerHTML = dots;
}

// 차트 업데이트
function updateChart(data) {
  const ctx = document.getElementById('trendChart').getContext('2d');
  const mobile = isMobile();

  // 모바일용 데이터 슬라이싱
  const chartData = getChartData(data);

  // 차트 네비게이션 UI 업데이트
  updateChartNavigation(data);

  // 차트 타이틀 업데이트
  const titleMap = {
    daily: '일간 통계 추이 (최근 7일)',
    weekly: '주간 통계 추이 (최근 4주)',
    monthly: '월간 통계 추이 (최근 4개월)'
  };
  document.getElementById('chart-title').textContent = titleMap[currentPeriod];

  // 기존 차트 제거
  if (trendChart) {
    trendChart.destroy();
  }

  // 모바일용 폰트 크기
  const fontSize = mobile ? 10 : 12;
  const tickFontSize = mobile ? 9 : 11;
  const pointRadius = mobile ? 3 : 3;
  const borderWidth = mobile ? 2 : 2.5;

  // 새 차트 생성
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: '방문자',
          data: chartData.visitors,
          borderColor: '#0066CC',
          backgroundColor: 'rgba(0, 102, 204, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
          borderWidth: borderWidth,
          pointRadius: pointRadius,
          pointHoverRadius: pointRadius + 2
        },
        {
          label: '페이지뷰',
          data: chartData.pageviews,
          borderColor: '#10B981',
          backgroundColor: 'transparent',
          tension: 0.4,
          yAxisID: 'y',
          borderWidth: borderWidth,
          pointRadius: pointRadius,
          pointHoverRadius: pointRadius + 2
        },
        {
          label: '체류시간(초)',
          data: chartData.duration,
          borderColor: '#F59E0B',
          backgroundColor: 'transparent',
          tension: 0.4,
          yAxisID: 'y1',
          borderWidth: borderWidth,
          pointRadius: pointRadius,
          pointHoverRadius: pointRadius + 2
        },
        {
          label: '접수',
          data: chartData.leads,
          borderColor: '#EF4444',
          backgroundColor: 'transparent',
          tension: 0.4,
          yAxisID: 'y1',
          borderWidth: borderWidth,
          pointRadius: pointRadius,
          pointHoverRadius: pointRadius + 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'white',
          titleColor: '#1F2937',
          bodyColor: '#4B5563',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          padding: mobile ? 8 : 12,
          boxPadding: mobile ? 4 : 6,
          titleFont: {
            size: fontSize
          },
          bodyFont: {
            size: fontSize
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: tickFontSize
            },
            maxRotation: 0,
            minRotation: 0
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: {
            color: '#F3F4F6'
          },
          ticks: {
            font: {
              size: tickFontSize
            },
            maxTicksLimit: mobile ? 5 : 8,
            callback: function(value) {
              // 모바일에서 큰 숫자 간략화
              if (mobile && value >= 1000) {
                return (value / 1000).toFixed(1) + 'k';
              }
              return value;
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            font: {
              size: tickFontSize
            },
            maxTicksLimit: mobile ? 5 : 8
          }
        }
      }
    }
  });
}

// 화면 크기 변경 시 차트 재생성
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    updateDashboard();
  }, 250);
});

// 인사이트 업데이트
function updateInsights(data, prevData) {
  const container = document.getElementById('insights-container');
  const insights = generateInsights(data, prevData);

  container.innerHTML = insights.map(insight => `
    <div class="insight-card ${insight.type}">
      <div class="insight-icon">${insight.icon}</div>
      <div class="insight-content">
        <h4 class="insight-title">${insight.title}</h4>
        <p class="insight-desc">${insight.description}</p>
      </div>
    </div>
  `).join('');
}

// 인사이트 생성 (AI 없이 규칙 기반)
function generateInsights(data, prevData) {
  const insights = [];
  const len = data.visitors.length;

  const current = {
    visitors: data.visitors[len - 1],
    pageviews: data.pageviews[len - 1],
    duration: data.duration[len - 1],
    leads: data.leads[len - 1]
  };

  // 1. 연속 증가/감소 추세
  const visitorsTrend = detectTrend(data.visitors);
  if (visitorsTrend.streak >= 3) {
    insights.push({
      type: visitorsTrend.direction === 'up' ? 'positive' : 'warning',
      icon: visitorsTrend.direction === 'up' ? '📈' : '📉',
      title: `방문자 ${visitorsTrend.streak}${getPeriodUnit()} 연속 ${visitorsTrend.direction === 'up' ? '상승' : '하락'}`,
      description: `방문자 수가 ${visitorsTrend.streak}${getPeriodUnit()} 연속으로 ${visitorsTrend.direction === 'up' ? '증가' : '감소'}하고 있습니다.`
    });
  }

  // 2. 최고 기록
  const maxVisitors = Math.max(...data.visitors);
  if (current.visitors === maxVisitors) {
    insights.push({
      type: 'positive',
      icon: '🏆',
      title: '방문자 최고 기록 달성!',
      description: `${current.visitors.toLocaleString()}명으로 해당 기간 내 최고 방문자 수를 기록했습니다.`
    });
  }

  // 3. 전환율 분석
  const conversionRate = (current.leads / current.visitors * 100).toFixed(2);
  const prevConversionRate = (prevData.leads / prevData.visitors * 100).toFixed(2);

  if (conversionRate > prevConversionRate) {
    insights.push({
      type: 'positive',
      icon: '✨',
      title: '전환율 상승',
      description: `전환율이 ${prevConversionRate}%에서 ${conversionRate}%로 개선되었습니다.`
    });
  } else if (conversionRate < prevConversionRate) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: '전환율 주의',
      description: `전환율이 ${prevConversionRate}%에서 ${conversionRate}%로 하락했습니다. 랜딩 페이지 점검을 권장합니다.`
    });
  }

  // 4. 체류시간 분석
  const avgDuration = data.duration.reduce((a, b) => a + b, 0) / len;
  if (current.duration > avgDuration * 1.1) {
    insights.push({
      type: 'positive',
      icon: '⏱️',
      title: '체류시간 양호',
      description: `평균 체류시간이 평균(${formatDuration(Math.round(avgDuration))}) 대비 높습니다. 콘텐츠 품질이 좋습니다.`
    });
  } else if (current.duration < avgDuration * 0.9) {
    insights.push({
      type: 'warning',
      icon: '⏱️',
      title: '체류시간 감소',
      description: `평균 체류시간이 평균 대비 낮습니다. 콘텐츠 개선을 고려해보세요.`
    });
  }

  // 5. 접수 추세
  const leadsTrend = detectTrend(data.leads);
  if (leadsTrend.streak >= 2 && leadsTrend.direction === 'up') {
    insights.push({
      type: 'positive',
      icon: '📥',
      title: '접수 증가 추세',
      description: `상담 접수가 ${leadsTrend.streak}${getPeriodUnit()} 연속 증가하고 있습니다. 좋은 흐름입니다!`
    });
  }

  // 6. 페이지뷰/방문자 비율
  const pagesPerVisitor = (current.pageviews / current.visitors).toFixed(1);
  if (pagesPerVisitor >= 3.5) {
    insights.push({
      type: 'positive',
      icon: '📄',
      title: '높은 페이지 탐색률',
      description: `방문자당 평균 ${pagesPerVisitor}페이지를 조회합니다. 사이트 구조가 효과적입니다.`
    });
  }

  // 인사이트가 없을 경우 기본 메시지
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      icon: '📊',
      title: '안정적인 트래픽',
      description: '현재 방문 통계가 안정적으로 유지되고 있습니다.'
    });
  }

  return insights.slice(0, 4); // 최대 4개
}

// 추세 감지
function detectTrend(arr) {
  let streak = 1;
  let direction = null;

  for (let i = arr.length - 1; i > 0; i--) {
    const diff = arr[i] - arr[i - 1];
    const currentDir = diff > 0 ? 'up' : (diff < 0 ? 'down' : null);

    if (direction === null) {
      direction = currentDir;
    }

    if (currentDir === direction && currentDir !== null) {
      streak++;
    } else {
      break;
    }
  }

  return { streak, direction };
}

// 기간 단위
function getPeriodUnit() {
  switch(currentPeriod) {
    case 'daily': return '일';
    case 'weekly': return '주';
    case 'monthly': return '개월';
  }
}

// 전환율 업데이트
function updateConversion(data) {
  const len = data.visitors.length;
  const visitors = data.visitors[len - 1];
  const leads = data.leads[len - 1];
  const rate = (leads / visitors * 100).toFixed(2);

  document.getElementById('conversion-rate').textContent = rate + '%';
  document.getElementById('conversion-fill').style.width = Math.min(rate * 2, 100) + '%'; // 시각적 스케일 조정
  document.getElementById('conversion-detail').textContent = `${visitors.toLocaleString()}명 방문 중 ${leads}명 접수`;
}
