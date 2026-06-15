/* --------------------------------------------------------------
 * 📌 대시보드 - 생산 현황 (DB 검색 버전)
 * - 첫 로드: 오늘 날짜 자동 조회
 * - 공장 필터 추가 (Saltillo / Puebla)
 * - AJAX 요청: sdate + factory + workplace 함께 전송
 * -------------------------------------------------------------- */

let currentProcess = 'ALL'; // ✅ 공정 기본값

$(document).ready(function() {
	// ============================================================
	// ✅ 전역(화면) 상태 값
	// ============================================================
	let globalProductionData = {};
	let currentFilter = 'all';
	let filterType = 'part'; // 'part' | 'vehicle' | 'line'
	let currentFactory = 'SALTILLO'; // 기본 공장

	let hourlyChartInstance = null;
	let lineChartInstance = null;

	// ============================================================
	// ✅ 유틸: 오늘 날짜 yyyy-mm-dd
	// ============================================================
	function getTodayYMD() {
		const d = new Date();
		return (
			d.getFullYear() +
			'-' +
			String(d.getMonth() + 1).padStart(2, '0') +
			'-' +
			String(d.getDate()).padStart(2, '0')
		);
	}

	// ============================================================
	// ✅ 메인 호출 함수 (메뉴 진입 시 실행)
	// ============================================================
	window.call_mDashboard_production = function(menuId) {
		createDashboardLayout();

		// ✅ 첫 로드: 오늘 날짜 자동 세팅 후 즉시 조회
		const today = getTodayYMD();
		$('#dashboard_production_date').val(today);

		// ✅ 공장 기본값 세팅
		$('#production-factory-select').val('SALTILLO');
		currentFactory = 'SALTILLO';

		// ✅ 공정 기본값 세팅
		currentProcess = 'ALL';
		setProcessOptionsByFactory(currentFactory);

		render_dashboard_production(today, currentFactory, currentProcess);
	};

	// ============================================================
	// ✅ 조회 함수: sdate + factory + workplace 전송
	// ============================================================
	function render_dashboard_production(date, factory, process, afterLoad) {
		const sdate = date || getTodayYMD();
		const fac = (factory || currentFactory || 'SALTILLO').toUpperCase();
		const proc = process || currentProcess || 'ALL';

		// ✅ 상태값 동기화
		currentFactory = fac;
		currentProcess = proc;

		// ✅ 여기서 "필터 초기화"를 해버리면 유지가 안됨
		// 필요하면 초기화는 '조회 버튼' 같은 곳에서만 하세요.
		// currentFilter = 'all';
		// filterType = 'part';
		// ✅ 기존 차트 완전 제거 (필수)
		if (hourlyChartInstance) {
			hourlyChartInstance.destroy();
			hourlyChartInstance = null;
		}
		if (lineChartInstance) {
			lineChartInstance.destroy();
			lineChartInstance = null;
		}


		showLoading('data');

		$.ajax({
			url: '/read_production_dashboard',
			type: 'POST',
			dataType: 'json',
			data: JSON.stringify({ sdate, factory: fac, workplace: proc }),
			contentType: 'application/json',
			success: function(response) {
				hideLoading();

				if (response && response.success) {
					globalProductionData = response.data || response;
					renderDashboard(globalProductionData);
					applyFilter(); // ✅ 최초 로드시 차트 보장

					// ✅ 로드 완료 후 콜백
					if (typeof afterLoad === 'function') afterLoad();
				} else {
					alert(
						i18n.t('common.fetchFailed', {
							message: response?.message || i18n.t('common.unknownError')
						})
					);
				}
			},
			error: function() {
				hideLoading();
				alert(i18n.t('common.fetchError'));
			}
		});
	}


	// ============================================================
	// ✅ 레이아웃 생성
	// ============================================================
	function createDashboardLayout() {
		const html = `
	<div class="divBlockControl" id="view_mDashboard_production">
		<div class="content-body dashboard-production">
			<div id="dashboard-production-wrapper">

				<div class="production-filter-kpi-container">
					<div class="production-filter-card production-filter-card-v2">

						<!-- ✅ 상단 1줄 -->
						<div class="production-top-row">
							<div class="production-field">
								<div class="production-field-label">${i18n.t('dashboard.production.date')}</div>
								<input type="date" id="dashboard_production_date" class="production-input-date"/>
							</div>

							<div class="production-field">
								<div class="production-field-label">${i18n.t('dashboard.production.factory')}</div>
								<select id="production-factory-select" class="production-filter-select">
									<option value="SALTILLO">${i18n.t('factory.saltillo')}</option>
									<option value="PUEBLA">${i18n.t('factory.puebla')}</option>
								</select>
							</div>

							<div class="production-field">
								<div class="production-field-label">${i18n.t('dashboard.production.process')}</div>
								<select id="production-process-select" class="production-filter-select"></select>
							</div>
						</div>

						<!-- ✅ 하단 2열 그리드 -->
						<div class="production-bottom-grid">
							<!-- 왼쪽: 버튼/셀렉트 -->
							<div class="production-left-area">
								<div class="production-filter-buttons">
									<button class="production-filter-btn active" data-type="part">
										${i18n.t('dashboard.production.filter.part')}
									</button>
									<button class="production-filter-btn" data-type="vehicle">
										${i18n.t('dashboard.production.filter.vehicle')}
									</button>
									<button class="production-filter-btn" data-type="line">
										${i18n.t('dashboard.production.filter.line')}
									</button>
								</div>

								<select id="production-filter-select" class="production-filter-select">
									<option value="all">${i18n.t('common.all')}</option>
								</select>
							</div>

							<!-- 오른쪽: 새로고침(2줄 높이) -->
							<button type="button" id="production-refresh-btn" class="production-refresh-btn-big">
								${i18n.t('common.refresh')}
							</button>
						</div>

					</div>

					<!-- KPI 3개는 기존 그대로 유지 -->
					<div class="production-kpi-card production-kpi-blue">
						<div class="production-kpi-header">
							<span class="production-kpi-label">${i18n.t('dashboard.production.kpi.totalQty')}</span>
							<i class="icon-trending"></i>
						</div>
						<div class="production-kpi-value" id="production-total-quantity">0</div>
						<div class="production-kpi-unit"></div>
					</div>

					<div class="production-kpi-card production-kpi-indigo">
						<div class="production-kpi-header">
							<span class="production-kpi-label">${i18n.t('dashboard.production.kpi.totalCount')}</span>
							<i class="icon-calendar"></i>
						</div>
						<div class="production-kpi-value" id="production-total-count">0</div>
						<div class="production-kpi-unit"></div>
					</div>

					<div class="production-kpi-card production-kpi-purple">
						<div class="production-kpi-header">
							<span class="production-kpi-label">${i18n.t('dashboard.production.kpi.avgQty')}</span>
							<i class="icon-factory"></i>
						</div>
						<div class="production-kpi-value" id="production-avg-quantity">0</div>
						<div class="production-kpi-unit"></div>
					</div>
					
					<div class="production-kpi-card production-kpi-teal">
						<div class="production-kpi-header">
							<span class="production-kpi-label">${i18n.t('dashboard.production.kpi.avgCount')}</span>
							<i class="icon-chart"></i>
						</div>
						<div class="production-kpi-value" id="production-avg-count">0</div>
						<div class="production-kpi-unit"></div>
					</div>

				</div>

				<!-- 이하 차트/테이블 영역은 기존 코드 그대로 두시면 됩니다 -->
				<div class="production-chart-grid">
					<div class="production-chart-box">
						<h2 class="production-chart-title">${i18n.t('dashboard.production.chart.hourly')}</h2>
						<canvas id="production-hourly-chart"></canvas>
					</div>

					<div class="production-chart-box">
						<h2 class="production-chart-title">${i18n.t('dashboard.production.chart.line')}</h2>
						<canvas id="production-line-chart"></canvas>
					</div>
				</div>

				<div class="production-table-container">
					<div class="production-table-header">
						<h2 class="production-table-title">${i18n.t('dashboard.production.table.title')}</h2>
						<div class="production-table-actions">
							<button type="button" id="production-excel-btn" class="production-excel-btn">
								${i18n.t('common.excelDownload') || 'Excel Download'}
							</button>
						</div>
					</div>
					<div class="production-table-scroll">
						<table class="production-table">
							<thead>
								<tr>
									<th>${i18n.t('dashboard.production.table.time')}</th>
									<th>${i18n.t('dashboard.production.table.line')}</th>
									<th>${i18n.t('dashboard.production.table.vehicle')}</th>
									<th>${i18n.t('dashboard.production.table.itemcode')}</th>
									<th>${i18n.t('dashboard.production.table.itemname')}</th>
									<th class="production-text-right">${i18n.t('dashboard.production.table.qty')}</th>
								</tr>
							</thead>
							<tbody id="production-tbody"></tbody>
						</table>
					</div>
					<div class="production-table-footer">
						<span>
							${i18n.t('dashboard.production.table.total')}
							<span id="production-table-count">0</span>
							${i18n.t('unit.count')}
						</span>
					</div>
				</div>

			</div>
		</div>
	</div>
	`;

		$('.w_contentArea').append(html);
		$('#dashboard-production-wrapper').addClass('dashboardControl');
		$('.w_titleArea').addClass('dashboardControl');

		bindFilterEvents();
	}


	// ============================================================
	// ✅ 이벤트 바인딩
	// ============================================================
	function bindFilterEvents() {
		// 공장 변경
		$('#production-factory-select')
			.off('change')
			.on('change', function() {
				currentFactory = ($(this).val() || 'SALTILLO').toUpperCase();

				setProcessOptionsByFactory(currentFactory);

				// ✅ 공정값은 셀렉트에서 다시 읽기(안전)
				currentProcess = $('#production-process-select').val() || 'ALL';

				const sdate = $('#dashboard_production_date').val() || getTodayYMD();
				render_dashboard_production(sdate, currentFactory, currentProcess);
			});

		// 공정 변경
		$('#production-process-select')
			.off('change')
			.on('change', function() {
				currentProcess = $(this).val() || 'ALL';
				const sdate = $('#dashboard_production_date').val() || getTodayYMD();
				render_dashboard_production(sdate, currentFactory, currentProcess);
			});

		// 3버튼
		$('.production-filter-btn')
			.off('click')
			.on('click', function() {
				$('.production-filter-btn').removeClass('active');
				$(this).addClass('active');

				filterType = $(this).data('type'); // part | vehicle | line
				currentFilter = 'all';

				updateFilterOptions();
				applyFilter();
			});

		// select 변경
		$('#production-filter-select')
			.off('change')
			.on('change', function() {
				currentFilter = $(this).val();
				applyFilter();
			});

		// 날짜 변경
		$('#dashboard_production_date')
			.off('change')
			.on('change', function() {
				const sdate = $(this).val() || getTodayYMD();
				render_dashboard_production(sdate, currentFactory, currentProcess);
			});

		// 새로고침 (현재 선택 상태 유지)
		$('#production-refresh-btn')
			.off('click')
			.on('click', function() {

				// ✅ 현재 상단 선택값
				const sdate = $('#dashboard_production_date').val() || getTodayYMD();
				const fac = ($('#production-factory-select').val() || currentFactory || 'SALTILLO').toUpperCase();
				const proc = $('#production-process-select').val() || currentProcess || 'ALL';

				// ✅ 현재 하단 필터 상태 저장
				const prevFilterType = filterType || 'part';     // part | vehicle | line
				const prevFilterValue = $('#production-filter-select').val() || currentFilter || 'all';

				// ✅ 재조회 + 로드 완료 후 복원
				render_dashboard_production(sdate, fac, proc, function() {

					// 탭(active) 복원
					filterType = prevFilterType;
					$('.production-filter-btn').removeClass('active');
					$(`.production-filter-btn[data-type="${filterType}"]`).addClass('active');

					// 옵션 재구성
					updateFilterOptions();

					// select 값 복원
					currentFilter = prevFilterValue;
					$('#production-filter-select').val(currentFilter);

					// 값이 새 데이터에 없으면 all로
					if ($('#production-filter-select').val() == null) {
						currentFilter = 'all';
						$('#production-filter-select').val('all');
					}

					// 적용
					applyFilter();
				});
			});

		// 엑셀 다운로드(현재 필터 적용된 리스트)
		$('#production-excel-btn')
			.off('click')
			.on('click', function() {
				downloadProductionExcelCSV();
			});



	}


	// ============================================================
	// ✅ 필터 옵션 업데이트
	// ============================================================
	function updateFilterOptions() {
		const $select = $('#production-filter-select');
		$select.empty();
		$select.append(`<option value="all">${i18n.t('common.all')}</option>`);

		const detail = globalProductionData.detail || [];
		if (!detail.length) return;

		if (filterType === 'part') {
			const itemcodes = [...new Set(detail.map(d => d.ITEMCODE))].sort();
			itemcodes.forEach(code => {
				$select.append(`<option value="${code}">${code}</option>`);
			});
		} else if (filterType === 'vehicle') {
			const vehicles = [...new Set(detail.map(d => d.SUBNAME_CH))].sort();
			vehicles.forEach(v => {
				$select.append(`<option value="${v}">${v}</option>`);
			});
		} else if (filterType === 'line') {
			const lines = [...new Set(detail.map(d => d.LINENO).filter(v => v !== null && v !== undefined && v !== ''))]
				.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

			lines.forEach(l => {
				$select.append(`<option value="${l}">NO ${l}</option>`);
			});
		}
	}

	// ============================================================
	// ✅ 필터 적용
	// ============================================================
	function applyFilter() {
		let filteredDetail = globalProductionData.detail || [];

		if (currentFilter !== 'all') {
			if (filterType === 'part') {
				filteredDetail = filteredDetail.filter(d => d.ITEMCODE === currentFilter);
			} else if (filterType === 'vehicle') {
				filteredDetail = filteredDetail.filter(d => d.SUBNAME_CH === currentFilter);
			} else if (filterType === 'line') {
				filteredDetail = filteredDetail.filter(d => String(d.LINENO) === String(currentFilter));
			}
		}

		const filteredData_dashboardProduction = {
			summary: calculateSummary(filteredDetail),
			hourly: calculateHourly(filteredDetail),
			line: calculateLine(filteredDetail),
			detail: filteredDetail
		};

		updateKPICards(
			filteredData_dashboardProduction.summary,
			filteredData_dashboardProduction.hourly
		);
		renderHourlyChart(filteredData_dashboardProduction.hourly);
		renderLineChart(filteredData_dashboardProduction.line);
		renderProductionTable(filteredData_dashboardProduction.detail);
	}

	// ============================================================
	// ✅ 집계 계산
	// ============================================================
	function calculateSummary(details) {
		const totalQty = details.reduce((sum, d) => sum + parseInt(d.QTY || 0, 10), 0);
		const countQty = details.length;
		return { TOTAL_QTY: totalQty, COUNT_QTY: countQty };
	}

	function calculateHourly(details) {
		const hourlyMap = {};

		details.forEach(d => {
			const hour = extractHour(d.STIME);
			if (!hour) return;

			if (!hourlyMap[hour]) {
				hourlyMap[hour] = { QTY: 0, count: 0 };
			}
			hourlyMap[hour].QTY += parseInt(d.QTY || 0, 10);
			hourlyMap[hour].count += 1;
		});

		return Object.keys(hourlyMap)
			.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
			.map(hour => ({
				STIME: hour,
				QTY: hourlyMap[hour].QTY,
				count: hourlyMap[hour].count
			}));
	}


	function calculateLine(details) {
		const lineMap = {};
		details.forEach(d => {
			const line = d.LINENO;
			if (!line) return;

			if (!lineMap[line]) lineMap[line] = { QTY: 0, count: 0 };
			lineMap[line].QTY += parseInt(d.QTY || 0, 10);
			lineMap[line].count += 1;
		});

		return Object.keys(lineMap)
			.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
			.map(line => ({
				LINENO: line,
				QTY: lineMap[line].QTY,
				count: lineMap[line].count
			}));
	}

	// ============================================================
	// ✅ 렌더링
	// ============================================================
	function renderDashboard(data) {
		const detail = data?.detail || [];
		if (!detail.length) return;

		const summary = data.summary || calculateSummary(detail);
		const hourly = data.hourly || calculateHourly(detail);

		updateKPICards(summary, hourly);
		renderHourlyChart(hourly);
		renderLineChart(data.line || calculateLine(detail));
		renderProductionTable(detail);
	}


	function updateKPICards(summary, hourlyList) {
		const totalQty = summary.TOTAL_QTY || 0;
		const countQty = summary.COUNT_QTY || 0;

		const avgQuantity = calculateAvgQtyByHour(totalQty, hourlyList);
		const avgCount = calculateAvgCountByHour(countQty, hourlyList);

		$('#production-total-quantity').text(totalQty.toLocaleString());
		$('#production-total-count').text(countQty.toLocaleString());

		$('#production-avg-quantity').text(
			avgQuantity.toLocaleString(undefined, {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2
			})
		);

		$('#production-avg-count').text(
			avgCount.toLocaleString(undefined, {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2
			})
		);
	}



	// 차트/테이블 렌더 함수는 기존 그대로 사용 (아래는 생략 없이 유지하세요)
	// renderHourlyChart, renderLineChart, renderProductionTable...

	function renderHourlyChart(hourly) {
		const list = hourly || [];
		const labels = list.map(h => (h.STIME || '') + ':00');
		const quantities = list.map(h => h.QTY || 0);
		const counts = list.map(h => h.count || 0);

		if (hourlyChartInstance) hourlyChartInstance.destroy();

		const ctx = document.getElementById('production-hourly-chart').getContext('2d');
		hourlyChartInstance = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{ label: i18n.t('dashboard.production.chart.qty'), data: quantities, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', yAxisID: 'y', fill: true, tension: 0.4, borderWidth: 2 },
					{ label: i18n.t('dashboard.production.chart.count'), data: counts, borderColor: '#8b5cf6', backgroundColor: 'transparent', yAxisID: 'y1', borderDash: [5, 5], borderWidth: 2, pointRadius: 2 }
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: { legend: { labels: { font: { size: 11 } } } },
				scales: {
					y: { type: 'linear', position: 'left', ticks: { font: { size: 10 } } },
					y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { size: 10 } } },
					x: { ticks: { font: { size: 10 } } }
				}
			}
		});
	}

	function renderLineChart(line) {
		const list = line || [];
		const labels = list.map(l => 'No' + (l.LINENO || ''));
		const quantities = list.map(l => l.QTY || 0);

		if (lineChartInstance) lineChartInstance.destroy();

		const ctx = document.getElementById('production-line-chart').getContext('2d');
		lineChartInstance = new Chart(ctx, {
			type: 'bar',
			data: { labels: labels, datasets: [{ label: i18n.t('dashboard.production.chart.qty'), data: quantities, backgroundColor: '#10b981', borderRadius: 6 }] },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				scales: {
					y: { beginAtZero: true, ticks: { font: { size: 10 } } },
					x: { ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45 } }
				}
			}
		});
	}

	function renderProductionTable(detail) {
		const $tbody = $('#production-tbody');
		$tbody.empty();

		(detail || []).forEach(item => {
			const row = `
				<tr>
					<td>${item.STIME || ''}</td>
					<td><span class="production-line-badge">NO ${item.LINENO || ''}</span></td>
					<td>${item.SUBNAME_CH || ''}</td>
					<td style="font-weight: 500;">${item.ITEMCODE || ''}</td>
					<td>${item.ITEMNAME || ''}</td>
					<td class="production-text-right" style="font-weight: 600;">${parseInt(item.QTY || 0, 10).toLocaleString()}</td>
				</tr>
			`;
			$tbody.append(row);
		});

		$('#production-table-count').text((detail || []).length);
	}

	function setProcessOptionsByFactory(factoryValue) {
		const fac = (factoryValue || 'SALTILLO').toUpperCase();
		const $proc = $('#production-process-select');

		$proc.empty();

		const processMap = {
			SALTILLO: [
				{ v: 'ALL', t: i18n.t('common.all') },
				{ v: 'C&S', t: 'C&S' },
				{ v: 'COVERING ASSEMBLY', t: 'Covering Assembly' },
				{ v: 'ASSEMBLY', t: 'Assembly' },
				{ v: 'PIP', t: 'PIP' }
			],
			PUEBLA: [{ v: 'ALL', t: i18n.t('common.all') }]
		};

		const list = processMap[fac] || processMap.SALTILLO;

		list.forEach(o => {
			$proc.append(`<option value="${o.v}">${o.t}</option>`);
		});

		if (!$proc.find(`option[value="${currentProcess}"]`).length) {
			currentProcess = 'ALL';
		}
		$proc.val(currentProcess);
	}
	function getFilteredDetailForExport() {
		let filteredDetail = globalProductionData.detail || [];

		if (currentFilter !== 'all') {
			if (filterType === 'part') {
				filteredDetail = filteredDetail.filter(d => d.ITEMCODE === currentFilter);
			} else if (filterType === 'vehicle') {
				filteredDetail = filteredDetail.filter(d => d.SUBNAME_CH === currentFilter);
			} else if (filterType === 'line') {
				filteredDetail = filteredDetail.filter(d => String(d.LINENO) === String(currentFilter));
			}
		}

		return filteredDetail;
	}

	function csvEscape(v) {
		if (v === null || v === undefined) return '';
		const s = String(v);
		// 쉼표/따옴표/개행 포함 시 "..." 처리
		if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
		return s;
	}

	function downloadProductionExcelCSV() {
		const sdate = $('#dashboard_production_date').val() || getTodayYMD();
		const fac = ($('#production-factory-select').val() || currentFactory || 'SALTILLO').toUpperCase();
		const proc = $('#production-process-select').val() || currentProcess || 'ALL';

		const detail = getFilteredDetailForExport();

		if (!detail.length) {
			alert(i18n.t('common.noData') || 'No data');
			return;
		}

		// ✅ 화면 테이블과 동일 컬럼 순서
		const headers = ['TIME', 'LINE', 'VEHICLE', 'ITEMCODE', 'ITEMNAME', 'QTY'];

		let csv = '';
		csv += headers.map(csvEscape).join(',') + '\r\n';

		detail.forEach(d => {
			const row = [
				d.STIME || '',
				(d.LINENO ? `NO ${d.LINENO}` : ''),
				d.SUBNAME_CH || '',
				d.ITEMCODE || '',
				d.ITEMNAME || '',
				(d.QTY != null ? d.QTY : '')
			];
			csv += row.map(csvEscape).join(',') + '\r\n';
		});

		// ✅ 엑셀 한글 깨짐 방지 BOM 추가
		const bom = '\uFEFF';
		const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

		const fileName =
			`production_${fac}_${proc}_${sdate}_${filterType}_${currentFilter}.csv`
				.replace(/[\\/:*?"<>|]/g, '_');

		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
	// 시간대 개수 계산 (hourly chart 기준)
	function getHourlySlotCount(hourlyList) {
		if (!hourlyList || !hourlyList.length) return 0;
		return hourlyList.length;
	}

	function calculateAvgQtyByHour(totalQty, hourlyList) {
		if (!hourlyList || hourlyList.length <= 1) return totalQty;

		const avg = totalQty / hourlyList.length;

		// 소수점 3번째 자리에서 반올림 → 소수점 2자리
		return Math.round(avg * 100) / 100;
	}


	function extractHour(stime) {
		if (!stime) return null;

		const s = String(stime).trim();

		// 16:30 → 16
		if (s.includes(':')) return s.split(':')[0];

		// 1630 / 1600 → 16
		if (s.length >= 4) return s.substring(0, 2);

		// 16 → 16
		if (s.length === 2) return s;

		return null;
	}
	function calculateAvgCountByHour(totalCount, hourlyList) {
		if (!hourlyList || hourlyList.length <= 1) return totalCount;

		const avg = totalCount / hourlyList.length;

		// 소수점 3번째 자리에서 반올림 → 소수점 2자리
		return Math.round(avg * 100) / 100;
	}




});
