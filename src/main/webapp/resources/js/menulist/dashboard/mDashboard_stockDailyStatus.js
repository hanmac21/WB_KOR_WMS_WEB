/* --------------------------------------------------------------
 * 재고 대시보드 - 일자별 재고/입고/창고이동/출고 현황
 * 메뉴 ID  : mDashboard_stockDailyStatus
 * AJAX URL : /read_wms_stock_daily_dashboard
 *
 * 서버 응답 형식:
 * {
 *   "success": true,
 *   "data": {
 *     "stock":    [{"DT":"2026-04-01","STOCK_QTY":10000}, ...],
 *     "inbound":  [{"SDATE":"2026-04-01","QTY":500}, ...],
 *     "move":     [{"SDATE":"2026-04-01","QTY":200}, ...],
 *     "outbound": [{"SDATE":"2026-04-01","QTY":300}, ...]
 *   }
 * }
 *
 * DB 쿼리 (백단 참고):
 *  재고:     SELECT DT, SUM(QTY) OVER (ORDER BY DT) AS STOCK_QTY
 *             FROM (SELECT TRUNC(TO_DATE(SDATE,'YYYY-MM-DD')) AS DT,
 *                          SUM(PLUSQTY - MINUSQTY) AS QTY
 *                   FROM V_STOCK
 *                   WHERE SDATE BETWEEN :sdate AND :edate
 *                   GROUP BY TRUNC(TO_DATE(SDATE,'YYYY-MM-DD')))
 *             ORDER BY DT
 *  입고:     SELECT SDATE, SUM(QTY) FROM T_WMS_INBOUND
 *             WHERE SDATE BETWEEN :sdate AND :edate AND SOURCE = 'INCOMING'
 *             GROUP BY SDATE ORDER BY SDATE
 *  창고이동: SELECT SDATE, SUM(QTY) FROM T_WMS_STOCKMOVE
 *             WHERE SDATE BETWEEN :sdate AND :edate AND SOURCE = 'RECEIVING'
 *             GROUP BY SDATE ORDER BY SDATE
 *  출고:     SELECT SDATE, SUM(QTY) FROM T_WMS_OUTBOUND
 *             WHERE SDATE BETWEEN :sdate AND :edate AND SOURCE = 'LOAD'
 *             GROUP BY SDATE ORDER BY SDATE
 * -------------------------------------------------------------- */

$(document).ready(function () {

	var chartInstances = { stock: null, inbound: null, move: null, outbound: null };

	// ── 날짜 유틸 ──────────────────────────────────────────────
	function getFirstDayOfMonth() {
		var d = new Date();
		return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
	}

	function getTodayYMD() {
		var d = new Date();
		return (
			d.getFullYear() + '-' +
			String(d.getMonth() + 1).padStart(2, '0') + '-' +
			String(d.getDate()).padStart(2, '0')
		);
	}

	// ── 진입점 ─────────────────────────────────────────────────
	window.call_mDashboard_stockDailyStatus = function (menuId) {
		createDashboardLayout();
		$('#wsd2-sdate').val(getFirstDayOfMonth());
		$('#wsd2-edate').val(getTodayYMD());
		fetchDashboard();
	};

	// ── AJAX 조회 ───────────────────────────────────────────────
	function fetchDashboard() {
		var params = {
			sdate:   $('#wsd2-sdate').val(),
			edate:   $('#wsd2-edate').val(),
			factory: $('#wsd2-factory').val() || '',
			storage: $('#wsd2-storage').val() || ''
		};

		destroyAllCharts();
		showLoading('data');

		$.ajax({
			url:         '/read_wms_stock_daily_dashboard',
			type:        'POST',
			dataType:    'json',
			contentType: 'application/json; charset=utf-8',
			data:        JSON.stringify(params),
			success: function (res) {
				hideLoading();
				if (res && res.success) {
					renderAll(res.data);
				} else {
					alert('데이터 조회 실패: ' + ((res && res.message) ? res.message : ''));
				}
			},
			error: function () {
				hideLoading();
				alert('데이터 조회 중 오류가 발생했습니다.');
			}
		});
	}

	// ── 차트 전체 파괴 ─────────────────────────────────────────
	function destroyAllCharts() {
		Object.keys(chartInstances).forEach(function (k) {
			if (chartInstances[k]) { chartInstances[k].destroy(); chartInstances[k] = null; }
		});
	}

	// ── 전체 렌더 ───────────────────────────────────────────────
	function renderAll(data) {
		data = data || {};
		var stock    = data.stock    || [];
		var inbound  = data.inbound  || [];
		var move     = data.move     || [];
		var outbound = data.outbound || [];

		renderBarChart('wsd2-chart-stock',    stock,    'DT',    'STOCK_QTY', '재고 수량',    '#3b82f6', 'stock');
		renderBarChart('wsd2-chart-inbound',  inbound,  'SDATE', 'QTY',       '입고 수량',    '#10b981', 'inbound');
		renderBarChart('wsd2-chart-move',     move,     'SDATE', 'QTY',       '창고이동 수량', '#f59e0b', 'move');
		renderBarChart('wsd2-chart-outbound', outbound, 'SDATE', 'QTY',       '출고 수량',    '#ef4444', 'outbound');

		updateKpi('wsd2-kpi-stock',    stock,    'STOCK_QTY');
		updateKpi('wsd2-kpi-inbound',  inbound,  'QTY');
		updateKpi('wsd2-kpi-move',     move,     'QTY');
		updateKpi('wsd2-kpi-outbound', outbound, 'QTY');
	}

	// ── 막대 차트 렌더 ─────────────────────────────────────────
	function renderBarChart(canvasId, rows, labelKey, valueKey, seriesLabel, color, instanceKey) {
		var labels = rows.map(function (r) {
			var raw = r[labelKey] || '';
			var date = (typeof raw === 'string' && raw.length >= 10) ? raw.substring(5, 10) : String(raw);
			var qty  = Math.round(parseFloat(r[valueKey] || 0));
			return [date, '(' + qty.toLocaleString() + ')'];
		});
		var values = rows.map(function (r) { return parseFloat(r[valueKey] || 0); });

		var canvas = document.getElementById(canvasId);
		if (!canvas) return;

		if (chartInstances[instanceKey]) {
			chartInstances[instanceKey].destroy();
			chartInstances[instanceKey] = null;
		}

		chartInstances[instanceKey] = new Chart(canvas.getContext('2d'), {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					label:           seriesLabel,
					data:            values,
					backgroundColor: color + 'bb',
					borderColor:     color,
					borderWidth:     1,
					borderRadius:    4
				}]
			},
			options: {
				responsive:          true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: function (ctx) {
								return ' ' + ctx.parsed.y.toLocaleString();
							}
						}
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							font:     { size: 11 },
							callback: function (v) { return v.toLocaleString(); }
						}
					},
					x: {
						ticks: { font: { size: 11 }, maxRotation: 0, minRotation: 0 }
					}
				}
			}
		});
	}

	// ── KPI 합계 업데이트 ──────────────────────────────────────
	function updateKpi(elId, rows, valueKey) {
		var total = rows.reduce(function (s, r) {
			return s + parseFloat(r[valueKey] || 0);
		}, 0);
		$('#' + elId).text(Math.round(total).toLocaleString());
	}

	// ── 이벤트 바인딩 ──────────────────────────────────────────
	function bindFilterEvents() {
		$('#wsd2-btn-search').off('click').on('click', function () {
			fetchDashboard();
		});

		$('#wsd2-sdate, #wsd2-edate').off('keypress').on('keypress', function (e) {
			if (e.which === 13) fetchDashboard();
		});
	}

	// ── 레이아웃 생성 ──────────────────────────────────────────
	function createDashboardLayout() {
		var html = [
			'<div class="divBlockControl" id="view_mDashboard_stockDailyStatus">',
			'<div class="content-body" style = "width:100%">',
			'<div id="dashboard-stock-daily-wrapper">',

			/* ── 검색 조건 (기존 parts-filter-* 클래스 재사용) ── */
			'<div class="parts-filter-section">',
				'<div class="parts-filter-row">',
					'<div class="parts-filter-group">',
						'<label>FROM</label>',
						'<input type="date" id="wsd2-sdate" class="parts-filter-input">',
					'</div>',
					'<div class="parts-filter-group">',
						'<label>TO</label>',
						'<input type="date" id="wsd2-edate" class="parts-filter-input">',
					'</div>',
					'<div class="parts-filter-group">',
						'<label>창고</label>',
						'<select id="wsd2-storage" class="parts-filter-select">',
							'<option value="">전체</option>',
						'</select>',
					'</div>',
				'</div>',
				'<div class="parts-filter-buttons">',
					'<button class="parts-btn parts-btn-search" id="wsd2-btn-search">조회</button>',
				'</div>',
			'</div>',


			/* ── 차트 2×2 그리드 ── */
			'<div class="wsd2-chart-grid">',

				'<div class="wsd2-chart-box">',
					'<h2 class="wsd2-chart-title">일자별 총재고현황</h2>',
					'<div class="wsd2-chart-wrap"><canvas id="wsd2-chart-stock"></canvas></div>',
				'</div>',

				'<div class="wsd2-chart-box">',
					'<h2 class="wsd2-chart-title">일자별 총 입고현황</h2>',
					'<div class="wsd2-chart-wrap"><canvas id="wsd2-chart-inbound"></canvas></div>',
				'</div>',

				'<div class="wsd2-chart-box">',
					'<h2 class="wsd2-chart-title">일자별 총 창고이동현황</h2>',
					'<div class="wsd2-chart-wrap"><canvas id="wsd2-chart-move"></canvas></div>',
				'</div>',

				'<div class="wsd2-chart-box">',
					'<h2 class="wsd2-chart-title">일자별 총 출고현황</h2>',
					'<div class="wsd2-chart-wrap"><canvas id="wsd2-chart-outbound"></canvas></div>',
				'</div>',

			'</div>', /* /wsd2-chart-grid */

			'</div>', /* /dashboard-stock-daily-wrapper */
			'</div>',
			'</div>'
		].join('');

		$('.w_contentArea').append(html);
		$('#dashboard-stock-daily-wrapper').addClass('dashboardControl');
		$('.w_titleArea').addClass('dashboardControl');

		injectStyle();
		bindFilterEvents();
	}

	// ── 인라인 CSS ─────────────────────────────────────────────
	// mDashboard.css 에 옮기고 이 함수는 제거해도 됩니다.
	function injectStyle() {
		if (document.getElementById('wsd2-inline-style')) return;
		var style = document.createElement('style');
		style.id = 'wsd2-inline-style';
		style.textContent = [
			'#dashboard-stock-daily-wrapper{background:#f8f9fa;min-height:calc(94vh - 80px);}',
			'.wsd2-kpi-row{display:flex;gap:16px;padding:14px 16px 10px;}',
			'.wsd2-kpi-card{flex:1;border-radius:10px;padding:18px 22px;color:#fff;min-width:0;}',
			'.wsd2-kpi-blue {background:linear-gradient(135deg,#3b82f6,#1d4ed8);}',
			'.wsd2-kpi-green{background:linear-gradient(135deg,#10b981,#059669);}',
			'.wsd2-kpi-amber{background:linear-gradient(135deg,#f59e0b,#d97706);}',
			'.wsd2-kpi-red  {background:linear-gradient(135deg,#ef4444,#dc2626);}',
			'.wsd2-kpi-label{font-size:12px;font-weight:600;opacity:.85;margin-bottom:6px;}',
			'.wsd2-kpi-value{font-size:26px;font-weight:700;letter-spacing:-0.5px;}',

			'.wsd2-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px 16px 16px;}',
			'.wsd2-chart-box{background:#fff;border-radius:10px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,.07);}',
			'.wsd2-chart-title{font-size:13px;font-weight:700;color:#374151;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid #e5e7eb;}',
			'.wsd2-chart-wrap{position:relative;height:250px;}'
		].join('');
		document.head.appendChild(style);
	}

});
