/* ================================================
   KPFC 한국정책자금지원센터 대시보드 JavaScript
   ================================================ */

// API URL
const DASHBOARD_API_URL = 'https://kpfc-analytics.a01027770093.workers.dev';

// 차트 인스턴스 저장
let combinedChart = null;

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', function() {
  loadWeeklyChartData(7);
});

// 모바일 여부 감지
function isMobile() {
  return window.innerWidth <= 768;
}

// 화면 크기 변경 시 차트 재생성
let resizeTimeout;
let lastChartData = null;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    if (lastChartData) {
      renderCombinedChart(lastChartData);
    }
  }, 250);
});

/* ================================================
   주간 현황 차트 데이터 로드
   ================================================ */
async function loadWeeklyChartData(days = 7) {
  const ctx = document.getElementById('combinedChart');
  if (!ctx) return;

  try {
    // 히스토리 데이터 가져오기
    const historyResponse = await fetch(`${DASHBOARD_API_URL}/history/cached?days=${days}`);
    const historyData = await historyResponse.json();

    // 접수 데이터 가져오기
    const leadsResponse = await fetch(`${DASHBOARD_API_URL}/leads`);
    const leadsData = await leadsResponse.json();
    const leads = leadsData.leads || [];

    if (historyData.data && historyData.data.length > 0) {
      // 날짜순 정렬 (오래된 순)
      const sortedData = [...historyData.data].sort((a, b) => a.date.localeCompare(b.date));

      // 라벨 생성
      const labels = sortedData.map(d => {
        const month = d.date.substring(5, 7);
        const day = d.date.substring(8, 10);
        return `${parseInt(month)}/${parseInt(day)}`;
      });

      // 데이터 추출
      const visitors = sortedData.map(d => d.visitors || 0);
      const pageviews = sortedData.map(d => d.pageviews || 0);
      const durations = sortedData.map(d => Math.round((d.avg_duration || 0) / 60)); // 분 단위

      // 날짜별 접수 수 계산
      const leadsByDate = sortedData.map(d => {
        const dateStr = d.date;
        return leads.filter(l => l.createdTime && l.createdTime.startsWith(dateStr)).length;
      });

      // 차트 데이터 저장 (리사이즈 시 재사용)
      lastChartData = {
        labels,
        visitors,
        pageviews,
        durations,
        leads: leadsByDate
      };

      // 차트 렌더링
      renderCombinedChart(lastChartData);
    }
  } catch (error) {
    console.error('차트 데이터 로드 오류:', error);
  }
}

/* ================================================
   복합 통계 차트 렌더링
   ================================================ */
function renderCombinedChart(data) {
  const ctx = document.getElementById('combinedChart');
  if (!ctx) return;

  // 기존 차트 제거
  if (combinedChart) {
    combinedChart.destroy();
  }

  const mobile = isMobile();

  // 모바일용 설정
  const tickFontSize = mobile ? 8 : 12;
  const pointRadius = mobile ? 2 : 4;
  const pointHoverRadius = mobile ? 4 : 6;
  const borderWidth = mobile ? 1.5 : 2;

  combinedChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: '방문자',
          data: data.visitors,
          borderColor: '#1D00AD',
          backgroundColor: 'rgba(29, 0, 173, 0.1)',
          borderWidth: borderWidth,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#1D00AD',
          pointBorderColor: '#fff',
          pointBorderWidth: mobile ? 1 : 2,
          pointRadius: pointRadius,
          pointHoverRadius: pointHoverRadius,
          yAxisID: 'y'
        },
        {
          label: '페이지뷰',
          data: data.pageviews,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: borderWidth,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: mobile ? 1 : 2,
          pointRadius: pointRadius,
          pointHoverRadius: pointHoverRadius,
          yAxisID: 'y'
        },
        {
          label: '체류시간(분)',
          data: data.durations,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: borderWidth,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#F59E0B',
          pointBorderColor: '#fff',
          pointBorderWidth: mobile ? 1 : 2,
          pointRadius: pointRadius,
          pointHoverRadius: pointHoverRadius,
          yAxisID: 'y'
        },
        {
          label: '접수',
          data: data.leads,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: borderWidth,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#EF4444',
          pointBorderColor: '#fff',
          pointBorderWidth: mobile ? 1 : 2,
          pointRadius: pointRadius,
          pointHoverRadius: pointHoverRadius,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleFont: {
            size: mobile ? 10 : 13,
            weight: '600'
          },
          bodyFont: {
            size: mobile ? 9 : 12
          },
          padding: mobile ? 8 : 12,
          cornerRadius: 8,
          mode: 'index',
          intersect: false
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
            color: '#9CA3AF',
            maxRotation: 0,
            minRotation: 0
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          grid: {
            color: '#F3F4F6'
          },
          ticks: {
            font: {
              size: tickFontSize
            },
            color: '#9CA3AF',
            maxTicksLimit: mobile ? 5 : 8,
            callback: function(value) {
              if (mobile && value >= 1000) {
                return (value / 1000).toFixed(1) + 'k';
              }
              return value;
            }
          },
          title: {
            display: !mobile,
            text: '방문자 / 페이지뷰 / 체류시간',
            font: {
              size: 11
            },
            color: '#9CA3AF'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            font: {
              size: tickFontSize
            },
            color: '#EF4444',
            maxTicksLimit: mobile ? 5 : 8
          },
          title: {
            display: !mobile,
            text: '접수',
            font: {
              size: 11
            },
            color: '#EF4444'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

// 필터 변경 이벤트
document.addEventListener('DOMContentLoaded', function() {
  const chartFilter = document.querySelector('.chart-filter');
  if (chartFilter) {
    chartFilter.addEventListener('change', function(e) {
      const days = parseInt(e.target.value);
      loadWeeklyChartData(days);
    });
  }
});
