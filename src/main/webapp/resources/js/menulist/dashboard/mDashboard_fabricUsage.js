/* ========================================================
 * 📌 Fabric Usage Tracking Dashboard (원단 사용량 추적 대시보드)
 * - Query-based: Semi-finished production → Fabric requirement tracking (쿼리 기반: 반제품 생산 → 원단 소요량 추적)
 * - UI: Requirement by fabric, supply status (UI: 원단별 소요량, 공급 현황)
 * ======================================================== */

let currentProcess = 'ALL';

$(document).ready(function() {
	let globalProductionData = [];
	let currentFilter = 'all';
	let filterType = 'fabric'; // 'fabric' | 'product'

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

	// ✅ Dashboard entry
	window.call_mDashboard_fabricUsage = function(menuId) {
		createDashboardLayout();

		// ✅ Default date: today ~ today
		const today = getTodayYMD();
		$('#fabricUsage_sdate').val(today);
		$('#fabricUsage_edate').val(today);

		updateDashboardSubtitle();
		render_dashboard_fabricUsage();
	};

	// ✅ Fetch data
	function render_dashboard_fabricUsage(afterLoad) {
		const sdate = $('#fabricUsage_sdate').val() || getTodayYMD();
		const edate = $('#fabricUsage_edate').val() || getTodayYMD();

		showLoading('data');

		$.ajax({
			url: '/read_fabricUsage_dashboard',
			type: 'POST',
			dataType: 'json',
			data: JSON.stringify({ sdate, edate }),
			contentType: 'application/json',
			success: function(response) {
				hideLoading();

				if (response && response.success) {
					globalProductionData = response.data || [];
					renderDashboard(globalProductionData);
					updateFilterOptions(); // ✅ options regenerate after load

					if (typeof afterLoad === 'function') afterLoad();
				} else {
					alert(i18n.t('common.fetchError') || 'Failed to fetch data');
				}
			},
			error: function() {
				hideLoading();
				alert(i18n.t('common.fetchError') || 'Failed to fetch data');
			}
		});
	}

	// ✅ Layout
	/* ========================================================
 * 📌 Fabric Usage Tracking Dashboard (원단 사용량 추적 대시보드)
 * - Layout change: "Left Panel(필터+공급현황)"을 상단으로 이동
 * - 위치: (주제목/기간선택 영역) 아래, KPI 위에 배치
 * ======================================================== */
	function createDashboardLayout() {
		// 이미 열려 있으면 중복 생성 방지
		if ($('#view_mDashboard_fabricUsage').length) return;

		const html = `
		<div class="divBlockControl" id="view_mDashboard_fabricUsage">
			<div class="content-body fabricUsage-production-modern">
				<div id="fabricUsage-production-wrapper">

					<!-- Header -->
					<div class="fabricUsage-header-section">
						<div class="fabricUsage-header-top">

							<!-- ✅ 1) 제목 -->
							<div class="fabricUsage-header-title">
								<h1>${i18n.t('dashboard.fabricUsage') || 'Fabric Usage Dashboard'}</h1>
								<p class="fabricUsage-header-subtitle" id="fabricUsage-subtitle">-</p>
							</div>

							<!-- ✅ 2) (요청) 제목과 기간선택 사이에: 필터 + 공급현황 -->
							<div class="fabricUsage-topbar-in-headerTop">

								<!-- Filter -->
								<div class="fabricUsage-topbar-left">
									<div class="fabricUsage-filter-box">
										<h3 class="fabricUsage-filter-title">
											${i18n.t('dashboard.fabricUsage.filter.title') || 'Filter'}
										</h3>

										<div class="fabricUsage-filter-buttons">
											<button class="fabricUsage-filter-btn active" data-type="fabric">
												${i18n.t('dashboard.fabricUsage.filter.fabric') || 'By Fabric'}
											</button>
											<button class="fabricUsage-filter-btn" data-type="product">
												${i18n.t('dashboard.fabricUsage.filter.product') || 'By Product'}
											</button>
										</div>

										<select id="fabricUsage-filter-select" class="fabricUsage-filter-select">
											<option value="all">${i18n.t('dashboard.fabricUsage.filter.all') || 'All'}</option>
										</select>
									</div>
								</div>

								<!-- Flow -->
								<div class="fabricUsage-topbar-right">
									<div class="fabricUsage-flow-box">
										<h3 class="fabricUsage-flow-title">
											${i18n.t('dashboard.fabricUsage.flow.title') || 'Supply Status'}
										</h3>

										<div class="fabricUsage-flow-items">
											<div class="fabricUsage-flow-stage">
												<p class="fabricUsage-flow-label">
													${i18n.t('dashboard.fabricUsage.flow.need') || 'Required'}
												</p>
												<p class="fabricUsage-flow-qty" id="fabricUsage-flow-need">0</p>
											</div>

											<div class="fabricUsage-flow-arrow">→</div>

											<div class="fabricUsage-flow-stage">
												<p class="fabricUsage-flow-label">
													${i18n.t('dashboard.fabricUsage.flow.work') || 'Work Issue'}
												</p>
												<p class="fabricUsage-flow-qty" id="fabricUsage-flow-work">0</p>
											</div>

											<div class="fabricUsage-flow-arrow">→</div>

											<div class="fabricUsage-flow-stage">
												<p class="fabricUsage-flow-label">
													${i18n.t('dashboard.fabricUsage.flow.receive') || 'Receiving'}
												</p>
												<p class="fabricUsage-flow-qty" id="fabricUsage-flow-receive">0</p>
											</div>
										</div>
									</div>
								</div>

							</div>

							<!-- ✅ 3) 기간선택 -->
							<div class="fabricUsage-date-controls">
								<input type="date" id="fabricUsage_sdate" class="fabricUsage-date-input"/>
								<span style="padding:0 8px;">~</span>
								<input type="date" id="fabricUsage_edate" class="fabricUsage-date-input"/>

								<button type="button" id="fabricUsage-refresh-btn" class="fabricUsage-refresh-btn">
									${i18n.t('common.read') || 'Read'}
								</button>
							</div>

						</div>

						<!-- KPI -->
						<div class="fabricUsage-kpi-grid">
							<div class="fabricUsage-kpi-card kpi-blue">
								<div class="kpi-icon"><i class="icon-box"></i></div>
								<div class="kpi-content">
									<p class="kpi-label">${i18n.t('dashboard.fabricUsage.kpi.totalNeed') || 'Total Fabric Requirement'}</p>
									<p class="kpi-value" id="fabricUsage-total-need">0</p>
									<p class="kpi-unit">${i18n.t('common.units') || 'units'}</p>
								</div>
							</div>

							<div class="fabricUsage-kpi-card kpi-purple">
								<div class="kpi-icon"><i class="icon-chart"></i></div>
								<div class="kpi-content">
									<p class="kpi-label">${i18n.t('dashboard.fabricUsage.kpi.fabricCount') || 'Fabric Item Count'}</p>
									<p class="kpi-value" id="fabricUsage-fabric-count">0</p>
									<p class="kpi-unit">${i18n.t('common.items') || 'items'}</p>
								</div>
							</div>

							<div class="fabricUsage-kpi-card kpi-emerald">
								<div class="kpi-icon"><i class="icon-trending"></i></div>
								<div class="kpi-content">
									<p class="kpi-label">${i18n.t('dashboard.fabricUsage.kpi.productCount') || 'Semi-finished Product Types'}</p>
									<p class="kpi-value" id="fabricUsage-product-count">0</p>
									<p class="kpi-unit">${i18n.t('common.items') || 'items'}</p>
								</div>
							</div>

							<div class="fabricUsage-kpi-card kpi-orange">
								<div class="kpi-icon"><i class="icon-alert"></i></div>
								<div class="kpi-content">
									<p class="kpi-label">${i18n.t('dashboard.fabricUsage.kpi.shortage') || 'Unfulfilled Requirement'}</p>
									<p class="kpi-value" id="fabricUsage-shortage">0</p>
									<p class="kpi-unit">${i18n.t('common.items') || 'items'}</p>
								</div>
							</div>
						</div>

						<!-- Table -->
						<div class="fabricUsage-content-section">
							<div class="fabricUsage-right-panel">
								<div class="fabricUsage-table-section">
									<div class="fabricUsage-table-header">
										<h2 class="fabricUsage-table-title">
											${i18n.t('dashboard.fabricUsage.table.title') || 'Fabric Usage Status'}
										</h2>

										<button type="button" id="fabricUsage-excel-btn" class="fabricUsage-table-export-btn">
											📥 ${i18n.t('common.excelDownload') || 'Export'}
										</button>
									</div>

									<div class="fabricUsage-table-wrapper">
										<table class="fabricUsage-table">
											<thead>
												<tr>
													<th>${i18n.t('dashboard.fabricUsage.th.itemCode') || 'ITEMCODE'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.itemName') || 'ITEMNAME'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.childCode') || 'CHILDCODE'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.childName') || 'CHILDNAME'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.prodQty') || 'PRODQTY'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.sendingQty') || 'SENDINGQTY'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.qtyPer') || 'QTYPER'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.need') || 'NEED'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.needSum') || 'NEEDSUM'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.workMoveQty') || 'WORKMOVEQTY'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.receivingQty') || 'RECEIVINGQTY'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.currentStock') || 'CURRENT_STOCK'}</th>
													<th>${i18n.t('dashboard.fabricUsage.th.inputRate') || 'inputRate'}</th>
												</tr>
											</thead>
											<tbody id="fabricUsage-tbody"></tbody>
										</table>
									</div>

									<div class="fabricUsage-table-footer">
										<span>
											${i18n.t('dashboard.fabricUsage.table.totalPrefix') || 'Total:'}
											<strong id="fabricUsage-table-count">0</strong>
											${i18n.t('dashboard.fabricUsage.table.totalSuffix') || 'items'}
										</span>
									</div>
								</div>
							</div>
						</div>

					</div><!-- /fabricUsage-header-section -->

				</div><!-- /fabricUsage-production-wrapper -->
			</div>
		</div>
	`;

		$('.w_contentArea').append(html);
		$('#fabricUsage-production-wrapper').addClass('dashboardControl');
		$('.w_titleArea').addClass('dashboardControl');

		bindFilterEvents();
	}



	// ✅ Events
	function bindFilterEvents() {
		$('.fabricUsage-filter-btn')
			.off('click')
			.on('click', function() {
				$('.fabricUsage-filter-btn').removeClass('active');
				$(this).addClass('active');
				filterType = $(this).data('type');
				currentFilter = 'all';
				updateFilterOptions();
				applyFilter();
			});

		$('#fabricUsage-filter-select')
			.off('change')
			.on('change', function() {
				currentFilter = $(this).val();
				applyFilter();
			});

		$('#fabricUsage_sdate, #fabricUsage_edate')
			.off('change')
			.on('change', function() {
				updateDashboardSubtitle();
			});

		$('#fabricUsage-refresh-btn')
			.off('click')
			.on('click', function() {
				updateDashboardSubtitle();
				render_dashboard_fabricUsage();
			});

		$('#fabricUsage-excel-btn')
			.off('click')
			.on('click', function() {
				downloadFabricUsageExcelCSV();
			});
	}

	// ✅ Filter options
	function updateFilterOptions() {
		const $select = $('#fabricUsage-filter-select');
		$select.empty();
		$select.append(`<option value="all">${i18n.t('dashboard.fabricUsage.filter.all') || 'All'}</option>`);

		if (!globalProductionData.length) return;

		if (filterType === 'fabric') {
			const fabrics = [...new Set(globalProductionData.map((d) => d.CHILDCODE))].sort();
			fabrics.forEach((code) => {
				const name = globalProductionData.find((d) => d.CHILDCODE === code)?.CHILDNAME || '';
				$select.append(`<option value="${code}">${code} - ${name}</option>`);
			});
		} else if (filterType === 'product') {
			const products = [...new Set(globalProductionData.map((d) => d.ITEMCODE))].sort();
			products.forEach((code) => {
				const name = globalProductionData.find((d) => d.ITEMCODE === code)?.ITEMNAME || '';
				$select.append(`<option value="${code}">${code} - ${name}</option>`);
			});
		}
	}

	// ✅ Apply filter to data
	function applyFilter() {
		let filteredData = globalProductionData;

		if (currentFilter !== 'all') {
			if (filterType === 'fabric') {
				filteredData = filteredData.filter((d) => d.CHILDCODE === currentFilter);
			} else if (filterType === 'product') {
				filteredData = filteredData.filter((d) => d.ITEMCODE === currentFilter);
			}
		}

		const summary = calculateSummary(filteredData);
		updateKPICards(summary);
		updateFlowCards(filteredData);
		renderProductionTable(filteredData);
	}

	// ✅ Summary calc
	function calculateSummary(details) {
		const totalNeed = details.reduce((sum, d) => sum + parseInt(d.NEED || 0, 10), 0);
		const fabricCount = [...new Set(details.map((d) => d.CHILDCODE))].length;
		const productCount = [...new Set(details.map((d) => d.ITEMCODE))].length;
		const shortage = details.filter(
			(d) => parseInt(d.NEED || 0, 10) > parseInt(d.RECEIVINGQTY || 0, 10)
		).length;

		return {
			TOTAL_NEED: totalNeed,
			FABRIC_COUNT: fabricCount,
			PRODUCT_COUNT: productCount,
			SHORTAGE: shortage
		};
	}

	// ✅ Render dashboard
	function renderDashboard(data) {
		if (!data.length) {
			$('#fabricUsage-tbody').empty();
			$('.kpi-value').text('0');
			$('#fabricUsage-table-count').text('0');
			updateFlowCards([]);
			return;
		}

		const summary = calculateSummary(data);
		updateKPICards(summary);
		updateFlowCards(data);
		renderProductionTable(data);
	}

	function updateKPICards(summary) {
		$('#fabricUsage-total-need').text((summary.TOTAL_NEED || 0).toLocaleString());
		$('#fabricUsage-fabric-count').text((summary.FABRIC_COUNT || 0).toLocaleString());
		$('#fabricUsage-product-count').text((summary.PRODUCT_COUNT || 0).toLocaleString());
		$('#fabricUsage-shortage').text((summary.SHORTAGE || 0).toLocaleString());
	}

	function updateFlowCards(data) {
		const totalNeed = data.reduce((sum, d) => sum + parseInt(d.NEED || 0, 10), 0);
		const totalWork = data.reduce((sum, d) => sum + parseInt(d.WORKMOVEQTY || 0, 10), 0);
		const totalReceive = data.reduce((sum, d) => sum + parseInt(d.RECEIVINGQTY || 0, 10), 0);

		$('#fabricUsage-flow-need').text(totalNeed.toLocaleString());
		$('#fabricUsage-flow-work').text(totalWork.toLocaleString());
		$('#fabricUsage-flow-receive').text(totalReceive.toLocaleString());
	}

	function updateDashboardSubtitle() {
		const sdate = $('#fabricUsage_sdate').val() || '-';
		const edate = $('#fabricUsage_edate').val() || '-';
		$('#fabricUsage-subtitle').text(`${sdate} ~ ${edate}`);
	}

	// ✅ Table render
	function renderProductionTable(detail) {
		const $tbody = $('#fabricUsage-tbody');
		$tbody.empty();

		(detail || []).forEach((item) => {
			const needSum = parseFloat(item.NEEDSUM || 0);
			const work = parseFloat(item.WORKMOVEQTY || 0);

			// ✅ 투입률 = 불출 / 필요원단합
			const inputRate = needSum > 0 ? (work / needSum) : 0;

			const row = `
			<tr>
				<td><strong>${item.ITEMCODE || ''}</strong></td>
				<td>${item.ITEMNAME || ''}</td>
				<td><strong>${item.CHILDCODE || ''}</strong></td>
				<td>${item.CHILDNAME || ''}</td>

				<td class="text-right">${parseInt(item.PRODQTY || 0, 10).toLocaleString()}</td>
				<td class="text-right">${parseInt(item.SENDINGQTY || 0, 10).toLocaleString()}</td>
				<td class="text-right">${parseInt(item.QTYPER || 0, 10).toLocaleString()}</td>
				<td class="text-right">${parseFloat(item.NEED || 0).toLocaleString()}</td>
				<td class="text-right">${parseFloat(item.NEEDSUM || 0).toLocaleString()}</td>
				<td class="text-right">${parseFloat(item.WORKMOVEQTY || 0).toLocaleString()}</td>
				<td class="text-right">${parseFloat(item.RECEIVINGQTY || 0).toLocaleString()}</td>
				<td class="text-right">${parseFloat(item.CURRENT_STOCK || 0).toLocaleString()}</td>

				<!-- ✅ 투입률 표시 (소수 5자리 예시) -->
				<td class="text-right">${inputRate.toFixed(5)}</td>
			</tr>
		`;
			$tbody.append(row);
		});

		$('#fabricUsage-table-count').text((detail || []).length);
	}


	// ✅ CSV export helpers
	function csvEscape(v) {
		if (v === null || v === undefined) return '';
		const s = String(v);
		if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
		return s;
	}

	// ✅ CSV export
	function downloadFabricUsageExcelCSV() {
		const sdate = $('#fabricUsage_sdate').val() || getTodayYMD();

		let detail = globalProductionData;

		// ✅ 현재 필터 적용 (기존 로직 유지)
		if (currentFilter !== 'all') {
			if (filterType === 'fabric') {
				detail = detail.filter((d) => d.CHILDCODE === currentFilter);
			} else if (filterType === 'product') {
				detail = detail.filter((d) => d.ITEMCODE === currentFilter);
			}
		}

		if (!detail.length) {
			alert(i18n.t('common.noData') || 'No data');
			return;
		}

		// ✅ 엑셀(CSV) 헤더: 요청하신 th 기준으로 맞춤
		const headers = [
			i18n.t('dashboard.fabricUsage.th.itemCode') || 'ITEMCODE',
			i18n.t('dashboard.fabricUsage.th.itemName') || 'ITEMNAME',
			i18n.t('dashboard.fabricUsage.th.childCode') || 'CHILDCODE',
			i18n.t('dashboard.fabricUsage.th.childName') || 'CHILDNAME',
			i18n.t('dashboard.fabricUsage.th.prodQty') || 'PRODQTY',
			i18n.t('dashboard.fabricUsage.th.sendingQty') || 'SENDINGQTY',
			i18n.t('dashboard.fabricUsage.th.qtyPer') || 'QTYPER',
			i18n.t('dashboard.fabricUsage.th.need') || 'NEED',
			i18n.t('dashboard.fabricUsage.th.needSum') || 'NEEDSUM',
			i18n.t('dashboard.fabricUsage.th.workMoveQty') || 'WORKMOVEQTY',
			i18n.t('dashboard.fabricUsage.th.receivingQty') || 'RECEIVINGQTY',
			i18n.t('dashboard.fabricUsage.th.currentStock') || 'CURRENT_STOCK',
			i18n.t('dashboard.fabricUsage.th.inputRate') || 'INPUTRATE'
		];

		let csv = '';
		csv += headers.map(csvEscape).join(',') + '\r\n';

		detail.forEach((d) => {
			const prodQty = parseFloat(d.PRODQTY || 0);
			const sendingQty = parseFloat(d.SENDINGQTY || 0);
			const qtyPer = parseFloat(d.QTYPER || 0);
			const need = parseFloat(d.NEED || 0);
			const needSum = parseFloat(d.NEEDSUM || 0);
			const workMoveQty = parseFloat(d.WORKMOVEQTY || 0);
			const receivingQty = parseFloat(d.RECEIVINGQTY || 0);

			// ✅ 투입률 = 불출 / 필요원단합
			const inputRate = needSum > 0 ? (workMoveQty / needSum) : 0;

			const row = [
				d.ITEMCODE || '',
				d.ITEMNAME || '',
				d.CHILDCODE || '',
				d.CHILDNAME || '',

				prodQty,
				sendingQty,
				qtyPer,
				need,
				needSum,
				workMoveQty,
				receivingQty,
				parseFloat(d.CURRENT_STOCK || 0),

				// 필요하시면 toFixed(6) 같은 형식으로 변경 가능
				inputRate
			];

			csv += row.map(csvEscape).join(',') + '\r\n';
		});

		// ✅ UTF-8 BOM (엑셀 한글 깨짐 방지)
		const bom = '\uFEFF';
		const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

		const fileName = `fabricUsage_${sdate}.csv`.replace(/[\\/:*?"<>|]/g, '_');

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

});
