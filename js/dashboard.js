/* ================================================
   KPFC 한국정책자금지원센터 대시보드 JavaScript
   ================================================ */

// 차트 인스턴스 저장
let combinedChart = null;

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', function() {
  initCombinedChart();
});

// 모바일 여부 감지
function isMobile() {
  return window.innerWidth <= 768;
}

// 화면 크기 변경 시 차트 재생성
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    initCombinedChart();
  }, 250);
});

/* ================================================
   복합 통계 차트 (Chart.js)
   방문자, 페이지뷰, 체류시간, 접수량
   ================================================ */
function initCombinedChart() {
  const ctx = document.getElementById('combinedChart');
  if (!ctx) return;

  // 기존 차트 제거
  if (combinedChart) {
    combinedChart.destroy();
  }

  const mobile = isMobile();

  // 모바일용 설정
  const fontSize = mobile ? 9 : 12;
  const tickFontSize = mobile ? 8 : 12;
  const pointRadius = mobile ? 2 : 4;
  const pointHoverRadius = mobile ? 4 : 6;
  const borderWidth = mobile ? 1.5 : 2;

  // 빈 데이터로 초기화 (실제 API 연동 필요)
  combinedChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: '방문자',
          data: [],
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
          data: [],
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
          label: '체류시간(초)',
          data: [],
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
          data: [],
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

  // 필터 변경 시 차트 업데이트
  const chartFilter = document.querySelector('.chart-filter');
  if (chartFilter) {
    chartFilter.addEventListener('change', function(e) {
      const days = e.target.value;
      // TODO: API 호출하여 데이터 업데이트
      console.log('차트 기간 변경:', days + '일');
    });
  }
}

/* ================================================
   모바일 메뉴 토글 - components.js에서 처리
   ================================================ */

/* ================================================
   TODO: Airtable API 연동
   ================================================ */

// 접수 내역 가져오기 (예시)
async function fetchLeads() {
  // const AIRTABLE_TOKEN = 'your_token';
  // const BASE_ID = 'your_base_id';
  // const TABLE_NAME = '고객정보';

  // const response = await fetch(
  //   `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
  //   {
  //     headers: {
  //       'Authorization': `Bearer ${AIRTABLE_TOKEN}`
  //     }
  //   }
  // );
  // const data = await response.json();
  // return data.records;
}

// 통계 데이터 가져오기 (Vercel Analytics API 예시)
async function fetchAnalytics() {
  // TODO: Vercel Analytics API 연동
}
