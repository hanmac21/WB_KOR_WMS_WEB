/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 월별 부품 소요량 대시보드
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * 메뉴명: m2_PartsRequirement
 * 영어명: partsRequirement -> PartsRequirement
 * AJAX 호출: /read_parts_requirement_dashboard
 * 
 * -------------------------------------------------------------- */
let currentPartsDetail = [];

$(document).ready(function() {

	let globalPartsData = {};
	let currentSupplier = 'all';
	let currentFactory = 'all';
	let currentstorage = 'all';

	let monthlyChartInstance = null;
	let supplierChartInstance = null;
	let factoryChartInstance = null;
	let topPartsChartInstance = null;

	// 🔹 현재 리스트에 보여주는 상세 데이터(정렬 포함)를 저장

	// ============ 메인 호출 함수 ============
	window.call_mDashboard_partsRequirement = function(menuId) {
		createDashboardLayout();
		showLoading("data");

		const today = new Date();
		const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
		$("#parts_requirement_month").val(currentMonth);

		render_dashboard_partsRequirement(currentMonth);
	}

	function render_dashboard_partsRequirement(month) {
		// 필터 상태 초기화
		currentSupplier = 'all';
		currentFactory = 'all';
		currentstorage = 'all';

		// UI 필터 초기화
		$('#parts-supplier-select').val('all');
		$('#parts-factory-select').val('all');
		$('#parts-storage-select').val('all');
		$('#parts-number-input').val('');
		$('#parts-name-input').val('');

		// 기존 차트 완전 제거
		destroyAllCharts();

		showLoading("data");

		// yyyy-mm을 yyyy-mm-dd 형식으로 변환 (해당 월의 마지막 날)
		const [year, monthNum] = month.split('-');
		const lastDay = new Date(year, monthNum, 0).getDate(); // 해당 월의 마지막 날
		const formattedMonth = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

		$(".currentText").text(" 현 재고 [ ~" + formattedMonth + " ]")

		$.ajax({
			url: '/read_parts_requirement_dashboard',
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',  // 추가
			data: JSON.stringify({
				month: month,
				supplier: currentSupplier,
				factory: currentFactory,
				storage: currentstorage,
				partNumber: $('#parts-number-input').val(),
				partName: $('#parts-name-input').val(),
				custname: $('#parts-custname-input').val()
			}),
			contentType: 'application/json',
			success: function(response) {
				hideLoading();
				console.log("PARTS REQUIREMENT DASHBOARD LOAD", response);

				if (response.success) {
					globalPartsData = response.data;
					renderDashboard(globalPartsData);
				} else {
					alert('데이터 조회 실패: ' + response.message);
				}
			},
			error: function(xhr, status, error) {
				hideLoading();
				console.error('Ajax Error:', error);
				alert('데이터 조회 중 오류 발생');
			}
		});
	}

	// ============================================
	// 📋 서버에서 받아야 할 JSON 형식
	// ============================================
	/*
	{
		"success": true,
		"data": {
			"summary": {
				"TOTAL_BASIC": 5000,      // 전월재고 합계
				"TOTAL_INCOMING": 3000,    // 입고 합계
				"TOTAL_OUTBOUND": 4000,    // 출고 합계
				"TOTAL_STOCK": 4000        // 현재고 합계
			},
			"monthly": [
				{"MONTH": "2024-08", "QUANTITY": 4500, "AMOUNT": 45000000},
				{"MONTH": "2024-09", "QUANTITY": 5200, "AMOUNT": 52000000},
				{"MONTH": "2024-10", "QUANTITY": 4800, "AMOUNT": 48000000},
				{"MONTH": "2024-11", "QUANTITY": 5000, "AMOUNT": 50000000}
			],
			"supplier": [
				{"SUPPLIER_NAME": "거래처 A", "QUANTITY": 2000, "AMOUNT": 20000000},
				{"SUPPLIER_NAME": "거래처 B", "QUANTITY": 1500, "AMOUNT": 15000000}
			],
			"factory": [
				{"FACTORY_NAME": "1공장", "QUANTITY": 2500, "AMOUNT": 25000000},
				{"FACTORY_NAME": "2공장", "QUANTITY": 1500, "AMOUNT": 15000000}
			],
			"topParts": [
				{"PART_NUMBER": "P001001", "PART_NAME": "부품명1", "QUANTITY": 500, "AMOUNT": 5000000},
				{"PART_NUMBER": "P001002", "PART_NAME": "부품명2", "QUANTITY": 450, "AMOUNT": 4500000}
			],
			"detail": [
				{
					"ITEMCODE": "P001001",
					"ITEMNAME": "부품명1",
					"QTY_BASIC": 100,      // 전월재고
					"QTY_INCOMING": 50,    // 입고
					"QTY_OUTBOUND": 70,    // 출고
					"QTY_STOCK": 80,       // 현재고
					"MONTH": "2024-11"
				}
			],
			"suppliers": ["거래처 A", "거래처 B", "거래처 C"],
			"factories": ["1공장", "2공장", "3공장"],
			"storages": ["A창고", "B창고", "C창고"]
		}
	}
	*/

	// ============ 대시보드 레이아웃 생성 ============
	function createDashboardLayout() {
		const html = `
		<div class="divBlockControl" id="view_mDashboard_partsRequirement">
			<div class="content-body dashboard-parts-requirement">
				<div id="dashboard-parts-wrapper">
					
					<div class="parts-dashboard-header" style="display:none">
						<h1 class="parts-dashboard-title">
							<i class="icon-package"></i>
							월별 부품 소요량 대시보드
						</h1>
					</div>

					<!-- 필터 섹션 -->
					<div class="parts-filter-section">
						<div class="parts-filter-row">
							<div class="parts-filter-group">
								<label>품번</label>
								<input type="text" id="parts-number-input" class="parts-filter-input" placeholder="품번 입력">
							</div>

							<div class="parts-filter-group">
								<label>품명</label>
								<input type="text" id="parts-name-input" class="parts-filter-input" placeholder="품명 입력">
							</div>

							<div class="parts-filter-group">
								<label>월별</label>
								<input type="month" id="parts_requirement_month" class="parts-filter-input">
							</div>

							<div class="parts-filter-group">
								<label>공장</label>
								<select id="parts-factory-select" class="parts-filter-select">
									<option value="all">전체</option>
								</select>
							</div>

							<div class="parts-filter-group">
								<label>창고</label>
								<select id="parts-storage-select" class="parts-filter-select">
									<option value="all">전체</option>
								</select>
							</div>
							
							<div class="parts-filter-group">
								<label>입고처</label>
								<input type="text" id="parts-custname-input" class="parts-filter-input" placeholder="입고처 입력 (합계 불일치)">
							</div>
							
						</div>

						<div class="parts-filter-buttons">
							<button class="parts-btn parts-btn-search" id="parts-btn-search">조회</button>
							<button class="parts-btn parts-btn-reset" id="parts-btn-reset">초기화</button>
						</div>
					</div>

					<!-- KPI 카드 -->
					<div class="parts-kpi-container">
						<div class="parts-kpi-card parts-kpi-blue">
							<div class="parts-kpi-header">
								<span class="parts-kpi-label">전월말 재고</span>
								<i class="icon-package"></i>
							</div>
							<div class="parts-kpi-value" id="parts-total-basic">0</div>
							<div class="parts-kpi-unit"></div>
						</div>
					
						<div class="parts-kpi-card parts-kpi-indigo">
							<div class="parts-kpi-header">
								<span class="parts-kpi-label">당월 입고</span>
								<span class="parts-kpi-label">(CKD, LOCAL, 예외입고)</span>
								<i class="icon-trending"></i>
							</div>
							<div class="parts-kpi-value" id="parts-total-incoming">0</div>
							<div class="parts-kpi-unit"></div>
						</div>
					
						<div class="parts-kpi-card parts-kpi-purple">
							<div class="parts-kpi-header">
								<span class="parts-kpi-label">당월 출고</span>
								<span class="parts-kpi-label">(불출, 출고,예외출고)</span>
								<i class="icon-dollar"></i>
							</div>
							<div class="parts-kpi-value" id="parts-total-outbound">0</div>
							<div class="parts-kpi-unit"></div>
						</div>
					
						<!-- ✅ 새로 추가: 기타수불 -->
						<div class="parts-kpi-card parts-kpi-orange">
							<div class="parts-kpi-header">
								<span class="parts-kpi-label">기타수불</span>
								<span class="parts-kpi-label">(입고반품, 불출반납, 출고반입, 재고조정, 창고이동, 공장이동 등)</span>
								<i class="icon-exchange"></i>
							</div>
							<div class="parts-kpi-value" id="parts-total-etc">0</div>
							<div class="parts-kpi-unit"></div>
						</div>
					
						<div class="parts-kpi-card parts-kpi-green">
							<div class="parts-kpi-header">
								<span class="parts-kpi-label currentText">현재고</span>
								<i class="icon-users"></i>
							</div>
							<div class="parts-kpi-value" id="parts-total-stock">0</div>
							<div class="parts-kpi-unit"></div>
						</div>
					</div>

					<!-- 차트 그리드 -->
					<div class="parts-chart-grid">
						<div class="parts-chart-box">
							<h2 class="parts-chart-title">월별 소요량 추이</h2>
							<canvas id="parts-monthly-chart"></canvas>
						</div>

						<div class="parts-chart-box">
							<h2 class="parts-chart-title">거래처별 비율</h2>
							<canvas id="parts-supplier-chart"></canvas>
						</div>

						<div class="parts-chart-box">
							<h2 class="parts-chart-title">공장별 소요량</h2>
							<canvas id="parts-factory-chart"></canvas>
						</div>

						<div class="parts-chart-box">
							<h2 class="parts-chart-title">Top 10 부품</h2>
							<canvas id="parts-top-chart"></canvas>
						</div>
					</div>

					<!-- 테이블 -->
					<div class="parts-table-container">
						<div class="parts-table-header">
							<h2 class="parts-table-title">부품 소요량 상세 내역</h2>
						</div>
						<div class="parts-table-scroll">
							<table class="parts-table">
								<thead>
									<tr>
										<th>No</th>
										<th>품번</th>
										<th>품명</th>
										<th class="parts-text-right">전월말 재고</th>
										<th class="parts-text-right">당월 입고</th>
										<th class="parts-text-right">당월 출고</th>
										<th class="parts-text-right">기타 수불</th>
										<th class="parts-text-right">현재고(월별)</th>
										<th>월</th>
										<th>입고처</th>
									</tr>
								</thead>
								<tbody id="parts-tbody"></tbody>
							</table>
						</div>
						<div class="parts-table-footer">
							<button id="dashboard_partsRequirement_excel">엑셀 다운로드</button>
							<span>총 <span id="parts-table-count">0</span>건</span>
						</div>
					</div>

				</div>
			</div>
		</div>
		`;

		$('.w_contentArea').append(html);
		$('#dashboard-parts-wrapper').addClass('dashboardControl');
		$('.w_titleArea').addClass('dashboardControl');
		bindFilterEvents();
	}

	// ============ 필터 이벤트 바인딩 ============
	function bindFilterEvents() {
		// 조회 버튼
		$('#parts-btn-search').on('click', function() {
			const month = $('#parts_requirement_month').val();
			searchWithFilters(month);
		});

		// 초기화 버튼
		$('#parts-btn-reset').on('click', function() {
			$('#parts-number-input').val('');
			$('#parts-name-input').val('');
			$('#parts-factory-select').val('all');
			$('#parts-storage-select').val('all');
			$('#parts-custname-input').val('');
			$('#parts-name-input').val('');

			const today = new Date();
			const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
			$('#parts_requirement_month').val(currentMonth);

			render_dashboard_partsRequirement(currentMonth);
		});

		// 월 변경
		$('#parts_requirement_month').on('change', function() {
			const month = $(this).val();
			searchWithFilters(month);
		});

		// 셀렉트박스 변경
		$('#parts-supplier-select, #parts-factory-select, #parts-storage-select').on('change', function() {
			currentSupplier = $('#parts-supplier-select').val();
			currentFactory = $('#parts-factory-select').val();
			currentstorage = $('#parts-storage-select').val();
			// ✅ 공장이 바뀌면 창고 옵션 다시 구성
			if (this.id === 'parts-factory-select') {
				updateFilterOptions(globalPartsData);
			}
		});

		// Enter 키 이벤트
		$('.parts-filter-input').on('keypress', function(e) {
			if (e.which === 13) {
				const month = $('#parts_requirement_month').val();
				searchWithFilters(month);
			}
		});
	}

	// ============ 필터 적용 조회 ============
	function searchWithFilters(month) {
		showLoading("data");

		// yyyy-mm을 yyyy-mm-dd 형식으로 변환 (해당 월의 마지막 날)
		const [year, monthNum] = month.split('-');
		const lastDay = new Date(year, monthNum, 0).getDate(); // 해당 월의 마지막 날
		const formattedMonth = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;

		$(".currentText").text(" 현 재고 [ ~" + formattedMonth + " ]");

		$.ajax({
			url: '/read_parts_requirement_dashboard',
			type: 'POST',
			dataType: 'json',
			data: JSON.stringify({
				month: month,
				factory: $('#parts-factory-select').val(),
				storage: $('#parts-storage-select').val(),
				partNumber: $('#parts-number-input').val(),  // 품번 셀렉트
				partName: $('#parts-name-input').val(),      // 품명 셀렉트
				custname: $('#parts-custname-input').val()
			}),
			contentType: 'application/json',
			success: function(response) {
				hideLoading();
				console.log("PARTS REQUIREMENT DASHBOARD SEARCH", response);

				if (response.success) {
					globalPartsData = response.data;
					renderDashboard(globalPartsData);
				} else {
					alert('데이터 조회 실패: ' + response.message);
				}
			},
			error: function(xhr, status, error) {
				hideLoading();
				console.error('Ajax Error:', error);
				alert('데이터 조회 중 오류 발생');
			}
		});
	}

	// ============ 차트 전체 제거 ============
	function destroyAllCharts() {
		if (monthlyChartInstance) {
			monthlyChartInstance.destroy();
			monthlyChartInstance = null;
		}
		if (supplierChartInstance) {
			supplierChartInstance.destroy();
			supplierChartInstance = null;
		}
		if (factoryChartInstance) {
			factoryChartInstance.destroy();
			factoryChartInstance = null;
		}
		if (topPartsChartInstance) {
			topPartsChartInstance.destroy();
			topPartsChartInstance = null;
		}
	}

	// ============ 대시보드 렌더링 ============
	function renderDashboard(data) {
		console.log("DASHBOARD RENDERING", data);

		if (!data || !data.detail || data.detail.length === 0) {
			$("#parts-tbody").empty();
			$("#parts-tbody").append('<tr><td colspan="8" style="text-align:center; padding:40px; color:#6c757d;">조회된 데이터가 없습니다</td></tr>');
			$(".parts-kpi-value").text('0');
			$("#parts-table-count").text('0');
			destroyAllCharts();
			return;
		}

		updateKPICards(data.summary);
		updateFilterOptions(data);
		renderMonthlyChart(data.monthly);
		renderSupplierChart(data.supplier);
		renderFactoryChart(data.factory);
		renderTopPartsChart(data.topParts);
		renderPartsTable(data.detail);
	}
	// ============ 1. KPI 카드 업데이트 ============
	function updateKPICards(summary) {
		const totalBasic = summary.TOTAL_BASIC || 0; // 전월말 재고
		const totalIncoming = summary.TOTAL_INCOMING || 0; // 당월 입고
		const totalOutbound = summary.TOTAL_OUTBOUND || 0; // 당월 출고
		const totalStock = summary.TOTAL_STOCK || 0; // 현재고

		// ✅ 기타수불 = 현재고 - 전월말재고 - 입고 + 출고
		const etcQty = totalStock - totalBasic - totalIncoming + totalOutbound;

		$('#parts-total-basic').text(totalBasic.toLocaleString());
		$('#parts-total-incoming').text(totalIncoming.toLocaleString());
		$('#parts-total-outbound').text(totalOutbound.toLocaleString());
		$('#parts-total-etc').text(etcQty.toLocaleString());
		$('#parts-total-stock').text(totalStock.toLocaleString());
	}


	// ============ 필터 옵션 업데이트 ============
	// ============ 필터 옵션 업데이트 ============
	function updateFilterOptions(data) {

		// ※ 품번/품명은 지금 input 태그라서 select처럼 비우면 에러나니,
		//    기존 코드가 있다면 주석처리하시고, 여기서는 공장/창고만 다룹니다.

		// 공장
		const $factorySelect = $('#parts-factory-select');
		const currentFactoryValue = $factorySelect.val();
		$factorySelect.empty();
		$factorySelect.append('<option value="all">전체</option>');
		if (data.factories) {
			data.factories.forEach(factory => {
				$factorySelect.append(`<option value="${factory}">${factory}</option>`);
			});
		}
		// 기존 선택 유지
		if (currentFactoryValue && $factorySelect.find(`option[value="${currentFactoryValue}"]`).length > 0) {
			$factorySelect.val(currentFactoryValue);
		} else {
			$factorySelect.val('all');
		}

		// 창고
		const $storageSelect = $('#parts-storage-select');
		const currentStorageValue = $storageSelect.val();
		const selectedFactory = ($factorySelect.val() || 'all').toUpperCase();

		$storageSelect.empty();
		$storageSelect.append('<option value="all">전체</option>');

		if (data.storages) {
			data.storages.forEach(storage => {
				const sUpper = String(storage).toUpperCase();

				// ✅ PUEBLA 선택 시: MATERIAL 만 보이게
				if (selectedFactory === 'PUEBLA') {
					if (sUpper === 'MATERIAL') {
						$storageSelect.append(`<option value="${storage}">${storage}</option>`);
					}
					return; // 다른 창고는 추가하지 않음
				}

				// ✅ SALTILLO 선택 시: P1W/HOUSE, PRODUCT 는 숨기기
				if (selectedFactory === 'SALTILLO') {
					if (sUpper === 'P1W/HOUSE' || sUpper === 'PRODUCT') {
						return; // 이 둘은 스킵
					}
					$storageSelect.append(`<option value="${storage}">${storage}</option>`);
					return;
				}

				// 그 외(ALL/다른 공장): 전체 표시
				//$storageSelect.append(`<option value="${storage}">${storage}</option>`);
				// ✅ 그 외(ALL/다른 공장): P1W/HOUSE, P1/HOUSE, PRODUCT 제외하고 전체 표시
				if (sUpper === 'P1W/HOUSE' || sUpper === 'P1/HOUSE' || sUpper === 'PRODUCT') {
					return;
				}
				$storageSelect.append(`<option value="${storage}">${storage}</option>`);
			});
		}

		// 기존 선택값이 남아 있으면 유지, 없으면 'all'
		if (currentStorageValue && $storageSelect.find(`option[value="${currentStorageValue}"]`).length > 0) {
			$storageSelect.val(currentStorageValue);
		} else {
			$storageSelect.val('all');
		}
	}


	// ============ 2. 월별 소요량 추이 차트 ============
	function renderMonthlyChart(monthly) {
		if (!monthly || monthly.length === 0) return;

		const labels = monthly.map(m => m.MONTH);
		const quantities = monthly.map(m => m.QUANTITY || 0);

		if (monthlyChartInstance) monthlyChartInstance.destroy();

		const ctx = document.getElementById('parts-monthly-chart').getContext('2d');
		monthlyChartInstance = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: '소요량',
					data: quantities,
					borderColor: '#667eea',
					backgroundColor: 'rgba(102, 126, 234, 0.1)',
					fill: true,
					tension: 0.4,
					borderWidth: 2
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false }
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							font: { size: 10 },
							callback: function(value) {
								return value.toLocaleString();
							}
						}
					},
					x: {
						ticks: { font: { size: 10 } }
					}
				}
			}
		});
	}

	// ============ 3. 거래처별 비율 차트 ============
	function renderSupplierChart(supplier) {
		if (!supplier || supplier.length === 0) return;

		const labels = supplier.map(s => s.SUPPLIER_NAME);
		const quantities = supplier.map(s => s.QUANTITY || 0);

		if (supplierChartInstance) supplierChartInstance.destroy();

		const ctx = document.getElementById('parts-supplier-chart').getContext('2d');
		supplierChartInstance = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: labels,
				datasets: [{
					data: quantities,
					backgroundColor: [
						'#667eea',
						'#764ba2',
						'#f093fb',
						'#4facfe',
						'#00f2fe',
						'#43e97b',
						'#fa709a',
						'#fee140'
					]
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom',
						labels: { font: { size: 10 } }
					}
				}
			}
		});
	}

	// ============ 4. 공장별 소요량 차트 ============
	function renderFactoryChart(factory) {
		if (!factory || factory.length === 0) return;

		const labels = factory.map(f => f.FACTORY_NAME);
		const quantities = factory.map(f => f.QUANTITY || 0);

		if (factoryChartInstance) factoryChartInstance.destroy();

		const ctx = document.getElementById('parts-factory-chart').getContext('2d');
		factoryChartInstance = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					label: '소요량',
					data: quantities,
					backgroundColor: '#667eea',
					borderRadius: 6
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false }
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							font: { size: 10 },
							callback: function(value) {
								return value.toLocaleString();
							}
						}
					},
					x: {
						ticks: { font: { size: 10 } }
					}
				}
			}
		});
	}

	// ============ 5. Top 10 부품 차트 ============
	function renderTopPartsChart(topParts) {
		if (!topParts || topParts.length === 0) return;

		const labels = topParts.map(p => p.PART_NAME || p.PART_NUMBER);
		const quantities = topParts.map(p => p.QUANTITY || 0);

		if (topPartsChartInstance) topPartsChartInstance.destroy();

		const ctx = document.getElementById('parts-top-chart').getContext('2d');
		topPartsChartInstance = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					label: '소요량',
					data: quantities,
					backgroundColor: '#764ba2',
					borderRadius: 6
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				plugins: {
					legend: { display: false }
				},
				scales: {
					x: {
						beginAtZero: true,
						ticks: {
							font: { size: 9 },
							callback: function(value) {
								return value.toLocaleString();
							}
						}
					},
					y: {
						ticks: { font: { size: 9 } }
					}
				}
			}
		});
	}

	// ============ 6. 부품 소요량 테이블 ============
	function renderPartsTable(detail) {
		const $tbody = $('#parts-tbody');
		$tbody.empty();

		// 🔹 현재 화면에 사용한 detail을 그대로 저장 (정렬/필터 반영된 상태)
		currentPartsDetail = detail ? detail.slice() : [];

		if (!detail || detail.length === 0) {
			$tbody.append('<tr><td colspan="8" style="text-align:center; padding:40px; color:#6c757d;">조회된 데이터가 없습니다</td></tr>');
			$('#parts-table-count').text('0');
			return;
		}

		detail.forEach((item, index) => {
			// ✅ 기타수불 = 현재고 - 전월말재고 - 입고 + 출고
			let etcqty = Number(item.QTY_STOCK)-Number(item.QTY_BASIC) - Number(item.QTY_INCOMING)+ Number(item.QTY_OUTBOUND)
			const row = `
			<tr>
				<td>${index + 1}</td>
				<td style="font-weight: 500;">${item.ITEMCODE || '-'}</td>
				<td>${item.ITEMNAME || '-'}</td>
				<td class="parts-text-right">${(item.QTY_BASIC || 0).toLocaleString()}</td>
				<td class="parts-text-right">${(item.QTY_INCOMING || 0).toLocaleString()}</td>
				<td class="parts-text-right" style="font-weight: 600;">${(item.QTY_OUTBOUND || 0).toLocaleString()}</td>
				<td class="parts-text-right" style="font-weight: 600;">${etcqty.toLocaleString()}</td>
				<td class="parts-text-right" style="font-weight: 600;">${(item.QTY_STOCK || 0).toLocaleString()}</td>
				<td>${item.MONTH || ''}</td>
				<td>${item.SANGHO || ''}</td>
			</tr>
		`;
			$tbody.append(row);
		});

		$('#parts-table-count').text(detail.length);
	}



});
$(document).on("click", "#dashboard_partsRequirement_excel", function() {
	// SheetJS 라이브러리가 로드되어 있는지 확인
	if (typeof XLSX === 'undefined') {
		alert('Excel 라이브러리가 로드되지 않았습니다.');
		return;
	}

	const data = [];

	// 1번 줄: KPI 헤더
	data.push(['전월말 재고', '당월 입고', '당월 출고', '기타수불', '현재고']);

	// 2번 줄: KPI 값
	const totalBasicText = $('#parts-total-basic').text();
	const totalIncomingText = $('#parts-total-incoming').text();
	const totalOutboundText = $('#parts-total-outbound').text();
	const totalStockText = $('#parts-total-stock').text();

	// 문자열 → 숫자 변환
	const totalBasicNum = parseFloat(totalBasicText.replace(/,/g, '')) || 0;
	const totalIncomingNum = parseFloat(totalIncomingText.replace(/,/g, '')) || 0;
	const totalOutboundNum = parseFloat(totalOutboundText.replace(/,/g, '')) || 0;
	const totalStockNum = parseFloat(totalStockText.replace(/,/g, '')) || 0;

	// ✅ 기타수불 = 현재고 - 전월말재고 - 입고 + 출고
	const totalEtcNum = totalStockNum - totalBasicNum - totalIncomingNum + totalOutboundNum;
	const totalEtcText = totalEtcNum.toLocaleString();

	// 2번 줄: KPI 값 추가 (기타수불 포함)
	data.push([
		totalBasicText,
		totalIncomingText,
		totalOutboundText,
		totalEtcText,
		totalStockText
	]);

	// 빈 줄 추가
	data.push([]);

	// 3번 줄: 상세 내역 헤더
	data.push(['No', '품번', '품명', '전월재고', '입고', '출고','기타수불', '현재고', '월', '입고처']);

	// 4번 줄부터: 상세 내역 데이터
	const table = document.getElementById('parts-tbody');
	const rows = table.querySelectorAll('tr');

	// 4번 줄부터: 상세 내역 데이터 (화면과 동일한 currentPartsDetail 기준)
	let sumBasic = 0, sumIncoming = 0, sumOutbound = 0, sumStock = 0, sumEtc = 0;

	currentPartsDetail.forEach((item, index) => {
		const basic = item.QTY_BASIC || 0;
		const incoming = item.QTY_INCOMING || 0;
		const outbound = item.QTY_OUTBOUND || 0;
		const stock = item.QTY_STOCK || 0;
		const etc = Number(stock)-Number(basic)-Number(incoming)+Number(outbound)
		
		const rowData = [
			index + 1,
			item.ITEMCODE || '',
			item.ITEMNAME || '',
			basic,
			incoming,
			outbound,
			etc,
			stock,
			item.MONTH || '',
			item.SANGHO || ''
		];

		data.push(rowData);

		sumBasic += basic;
		sumIncoming += incoming;
		sumOutbound += outbound;
		sumEtc += etc;
		sumStock += stock;
	});

	// 빈 줄 추가
	data.push([]);

	// 합계 행 추가 (소수점 2자리로 반올림)
	data.push([
		'',
		'',
		'합계',
		Math.round(sumBasic * 100) / 100,
		Math.round(sumIncoming * 100) / 100,
		Math.round(sumOutbound * 100) / 100,
		Math.round(sumEtc * 100) / 100,
		Math.round(sumStock * 100) / 100,
		'',
		''
	]);

	// 워크시트 생성
	const ws = XLSX.utils.aoa_to_sheet(data);

	// 열 너비 자동 조정
	const colWidths = [];
	data.forEach(row => {
		row.forEach((cell, colIndex) => {
			const cellLength = String(cell).length;
			if (!colWidths[colIndex] || colWidths[colIndex] < cellLength) {
				colWidths[colIndex] = cellLength;
			}
		});
	});

	ws['!cols'] = colWidths.map(width => ({ wch: width + 2 }));

	// 숫자 컬럼만 숫자 타입으로 설정 (D, E, F, G 컬럼 = 인덱스 3, 4, 5, 6)
	const range = XLSX.utils.decode_range(ws['!ref']);
	const numberColumns = [3, 4, 5, 6];

	for (let R = range.s.r; R <= range.e.r; ++R) {
		for (let C = range.s.c; C <= range.e.c; ++C) {
			const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
			if (ws[cellAddress]) {
				if ((R === 1 && C <= 4) || (numberColumns.includes(C) && R > 3)) {
					const cellValue = ws[cellAddress].v;
					if (cellValue !== '' && cellValue !== null && cellValue !== undefined) {
						const numValue = parseFloat(String(cellValue).replace(/,/g, ''));
						if (!isNaN(numValue)) {
							ws[cellAddress].t = 'n';
							ws[cellAddress].v = numValue;
							// 여기서 z 포맷 주던 부분
							// ws[cellAddress].z = '#,##0.##';
						}
					}
				} else {
					ws[cellAddress].t = 's';
					ws[cellAddress].z = '@';
				}
			}
		}
	}



	// 워크북 생성
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, '월별 부품 소요량');

	// 파일 다운로드
	XLSX.writeFile(wb, '월별_부품_소요량_' + new Date().toISOString().slice(0, 10) + '.xlsx');
});
