/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_EXTRA 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : common -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : Common -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalCommonData = [];
	let currentCommonPage = 1;
	let commonItemsPerPage = 100;
	let totalCommonCount = 0;
	window.filteredCommonData = [];
	window.commonColumns = [];

	let dailyChartInstance = null;
	let factoryChartInstance = null;
	let storageChartInstance = null;

	// ============ 메인 호출 함수 ============
	window.call_mDashboard_stock = function(menuId) {
		// 1. 대시보드 HTML 구조 생성
		createDashboardLayout();

		// 2. 로딩 시작
		showLoading("data");

		// ============================================
		// 🧪 테스트용 가데이터 (실제 운영시 주석 해제)
		// ============================================
		/*setTimeout(function() {
			hideLoading("data");

			// 가짜 응답 데이터
			const mockResponse = {
				success: true,
				totalCount: 56,
				data: [
					{ "date": "2025-09-25 23:00:00", "factory": "PUEBLA", "storage": "Material", "total_qty": 328.9, "cnt_qty": 8 },
					{ "date": "2025-09-25 23:00:00", "factory": "PUEBLA", "storage": "PRODUCT", "total_qty": 41094, "cnt_qty": 560 },
					{ "date": "2025-09-25 23:00:00", "factory": "Saltillo", "storage": "Fabric", "total_qty": 5644639.79, "cnt_qty": 1184 },
					{ "date": "2025-09-25 23:00:00", "factory": "Saltillo", "storage": "Outside", "total_qty": 267490, "cnt_qty": 1224 },
					{ "date": "2025-09-25 23:00:00", "factory": "Saltillo", "storage": "Side seat", "total_qty": 54098, "cnt_qty": 1517 },
					{ "date": "2025-09-26 23:00:00", "factory": "Saltillo", "storage": "AUNDE", "total_qty": 3262.9, "cnt_qty": 21 },
				]
			};

			globalCommonData = mockResponse.data;
			totalCommonCount = mockResponse.totalCount;
			// ⭐ DOM이 준비된 후 렌더링 (약간의 딜레이 추가)
			setTimeout(function() {
				renderDashboard(globalCommonData);
			}, 100);

		}, 1000); // 1초 딜레이로 로딩 효과 확인*/



		// 3. Ajax 호출


		$.ajax({
			url: '/read_dashboard_stock',
			type: 'POST',
			dataType: 'json',
			data: JSON.stringify({
				/*startDate: '2025-09-25',
				endDate: '2025-10-08',*/
				factory: '',
				storage: ''
			}),
			contentType: 'application/json',
			// Ajax success 함수에 추가
			success: function(response) {
				hideLoading("data");
				console.log("=== 전체 response ===");
				console.log(response);
				console.log("=== response.data ===");
				console.log(response.data);
				console.log("=== 첫번째 데이터 ===");
				console.log(response.data[0]);
				console.log("=== 키 목록 ===");
				console.log(Object.keys(response.data[0]));

				if (response.success) {
					globalCommonData = response.data;
					totalCommonCount = response.totalCount;
					renderDashboard(globalCommonData);
				}
			},
			error: function(xhr, status, error) {
				hideLoading("data");
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
		"totalCount": 150,
		"data": [
			{
				"date": "2025-09-25 23:00:00",
				"factory": "PUEBLA",
				"storage": "MATERIAL",
				"total_qty": 61440.5,
				"cnt_qty": 479
			},
			{
				"date": "2025-09-26 23:00:00",
				"factory": "Saltillo",
				"storage": "Fabric",
				"total_qty": 5644639.79,
				"cnt_qty": 1184
			}
		]
	}
	*/


	// ============ 대시보드 레이아웃 생성 ============
	// HTML 레이블 수정
	function createDashboardLayout() {
		const html = `
    <div class="divBlockControl" id="view_mDashboard_stock">
        <div class="content-body dashboard">
            <div id="dashboard-wrapper">
                <!-- KPI 카드 영역 -->
                <div class="kpi-container">
					<div class="kpi-card kpi-card-blue">
					    <div class="kpi-title">총 재고 수량</div>
					    <div id="total-total_qty" class="kpi-value">0</div>
					</div>
					<!-- <div class="kpi-card kpi-card-pink">
					    <div class="kpi-title">총 건수</div>
					    <div id="total-cnt_qty" class="kpi-value">0</div>
					</div> -->
					<div class="kpi-card kpi-card-cyan">
					    <div class="kpi-title">WBTA 재고</div>
					    <div id="total-factories" class="kpi-value">0</div>
					</div>
                </div>
		            
		            <!-- 차트 영역 -->
		            <div class="chart-container">
		                <div class="chart-box">
		                    <h3 class="chart-title">일자별 재고 수량</h3>
		                    <canvas id="dailyChart"></canvas>
		                </div>
		                <div class="chart-box">
		                    <h3 class="chart-title">공장별 재고 비중</h3>
		                    <canvas id="factoryChart"></canvas>
		                </div>
		                <div class="chart-box">
		                    <h3 class="chart-title">창고별 재고 수량</h3>
		                    <canvas id="storageChart"></canvas>
		                </div>
		                <div class="chart-box">
		                    <h3 class="chart-title">창고별 수량</h3>
		                    <canvas id="storageCountChart"></canvas>
		                </div>
		            </div>
		            
		        </div>
       		</div>
		</div>
    `;

		$('.w_contentArea').append(html);
		$('#dashboard-wrapper').addClass('dashboardControl');
		$('.w_titleArea').addClass('dashboardControl');
	}

	// ============ 대시보드 렌더링 ============
	function renderDashboard(data) {
		if (!data || data.length === 0) {
			$('#dashboard-wrapper').append('<div style="text-align:center; padding:50px;">조회된 데이터가 없습니다.</div>');
			return;
		}

		updateKPICards(data);
		renderDailyChart(data);
		renderFactoryChart(data);
		renderWarehouseChart(data);
		renderWarehouseCountChart(data);
	}

	// ============ 1. KPI 카드 업데이트 ============
	function updateKPICards(data) {
		const totalSum = data.reduce((acc, item) => acc + (parseFloat(item.TOTAL_QTY ?? item.total_qty ?? 0) || 0), 0);

		const factoryData = {};
		data.forEach(item => {
			const factory = item.FACTORY || 'Unknown';
			if (!factoryData[factory]) {
				factoryData[factory] = 0;
			}
			factoryData[factory] += parseFloat(item.TOTAL_QTY || 0);
		});

		const wbtaSum = factoryData['WBTA'] || 0;

		$('#total-total_qty').text(parseFloat(totalSum.toFixed(2)).toLocaleString('en-US'));
		$('#total-factories').text(parseFloat(wbtaSum.toFixed(2)).toLocaleString('en-US'));
	}

	// ============ 2. 일자별 차트 ============
	// ============ 2. 일자별 차트 ============
	function renderDailyChart(data) {
		// 날짜별 합계
		const dailySum = {}; // { 'MM-DD': totalQty }
		const dailySumOriginal = {}; // tooltip 용 원본

		data.forEach(item => {
			// ✅ SDATE / DATE 둘 다 대응 (혹시 모를 케이스 방어)
			const rawDate = (item.SDATE || item.DATE || item.date || "");
			if (!rawDate) return;

			// 'YYYY-MM-DD ...' 형태면 MM-DD로 표시
			const mmdd = rawDate.length >= 10 ? rawDate.substring(5, 10) : rawDate;

			if (!dailySum[mmdd]) {
				dailySum[mmdd] = 0;
				dailySumOriginal[mmdd] = 0;
			}

			// ✅ TOTAL_QTY / total_qty 둘 다 대응
			const qty = parseFloat(item.TOTAL_QTY ?? item.total_qty ?? 0) || 0;

			dailySum[mmdd] += qty;
			dailySumOriginal[mmdd] += qty;
		});

		// 최근 10일
		const labels = Object.keys(dailySum).sort().slice(-10);
		if (labels.length === 0) return;

		// ✅ 단위 자동 선택: M(백만) / K(천) / 원값
		const maxVal = Math.max(...labels.map(d => dailySum[d] || 0));
		let unitDiv = 1;
		let unitText = '수량';

		if (maxVal >= 1000000) {
			unitDiv = 1000000;
			unitText = '수량 (M)';
		} else if (maxVal >= 1000) {
			unitDiv = 1000;
			unitText = '수량 (K)';
		} else {
			unitDiv = 1;
			unitText = '수량';
		}

		// ✅ Math.round 제거 + 소수점 유지 (0 떨어짐 방지)
		const series = labels.map(d => Number(((dailySum[d] || 0) / unitDiv).toFixed(2)));

		if (dailyChartInstance) dailyChartInstance.destroy();

		const ctx = document.getElementById('dailyChart').getContext('2d');
		dailyChartInstance = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: '수량',
					data: series,
					borderColor: '#3b82f6',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					fill: true,
					tension: 0.4
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					tooltip: {
						callbacks: {
							// ✅ label(mm-dd) 기준으로 원본값 찾아서 표시
							label: function(context) {
								const mmdd = context.label || '';
								const originalValue = dailySumOriginal[mmdd] || 0;
								return '수량: ' + parseFloat(originalValue.toFixed(2)).toLocaleString('en-US');
							}
						}
					}
				},
				scales: {
					y: {
						type: 'linear',
						position: 'left',
						title: { display: true, text: unitText },
						beginAtZero: true
					}
				}
			}
		});
	}

	// ============ 3. 공장별 차트 ============
	function renderFactoryChart(data) {
		const factoryData = {};
		const factoryDataOriginal = {}; // 원본 수량 저장용

		data.forEach(item => {
			if (!factoryData[item.FACTORY]) {
				factoryData[item.FACTORY] = 0;
				factoryDataOriginal[item.FACTORY] = 0;
			}
			factoryData[item.FACTORY] += parseFloat(item.TOTAL_QTY || 0);
			factoryDataOriginal[item.FACTORY] += parseFloat(item.TOTAL_QTY || 0);
		});

		const factories = Object.keys(factoryData);

		const maxVal = Math.max(...Object.values(factoryData));
		let unitDiv = 1, unitText = '수량';
		if (maxVal >= 1000000) { unitDiv = 1000000; unitText = '수량 (M)'; }
		else if (maxVal >= 1000) { unitDiv = 1000; unitText = '수량 (K)'; }

		const total_qtys = factories.map(f => Number((factoryData[f] / unitDiv).toFixed(2)));

		if (factoryChartInstance) factoryChartInstance.destroy();

		const ctx = document.getElementById('factoryChart').getContext('2d');
		factoryChartInstance = new Chart(ctx, {
			type: 'pie',
			data: {
				labels: factories,
				datasets: [{
					data: total_qtys,
					backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: 'bottom' },
					tooltip: {
						callbacks: {
							label: function(context) {
								const label = context.label || '';
								const originalValue = factoryDataOriginal[label] || 0;
								return label + ': ' + parseFloat(originalValue.toFixed(2)).toLocaleString('en-US');
							}
						}
					}
				}
			}
		});
	}

	// ============ 4. 창고별 차트 ============
	function renderWarehouseChart(data) {
		const storageData = {};
		const storageDataOriginal = {}; // 원본 수량 저장용

		data.forEach(item => {
			const wh = item.STORAGE || '';
			if (wh === '' || wh === 'Unknown') return;

			if (!storageData[wh]) {
				storageData[wh] = 0;
				storageDataOriginal[wh] = 0;
			}
			storageData[wh] += parseFloat(item.TOTAL_QTY || 0);
			storageDataOriginal[wh] += parseFloat(item.TOTAL_QTY || 0);
		});

		const storages = Object.keys(storageData)
			.sort((a, b) => storageData[b] - storageData[a]);

		const maxVal = Math.max(...Object.values(storageData));
		let unitDiv = 1, unitText = '수량';
		if (maxVal >= 1000000) { unitDiv = 1000000; unitText = '수량 (M)'; }
		else if (maxVal >= 1000) { unitDiv = 1000; unitText = '수량 (K)'; }

		const total_qtys = storages.map(w => Number((storageData[w] / unitDiv).toFixed(2)));

		if (storageChartInstance) storageChartInstance.destroy();

		const ctx = document.getElementById('storageChart').getContext('2d');
		storageChartInstance = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: storages,
				datasets: [{
					label: '수량',
					data: total_qtys,
					backgroundColor: '#3b82f6'
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: function(context) {
								const label = context.label || '';
								const originalValue = storageDataOriginal[label] || 0;
								return '수량: ' + parseFloat(originalValue.toFixed(2)).toLocaleString('en-US');
							}
						}
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						title: { display: true, text: unitText }
					}
				}
			}
		});
	}

	// ============ 5. 창고별 수량 차트 (가로) ============
	function renderWarehouseCountChart(data) {
		const storageData = {};
		const storageDataOriginal = {}; // 원본 수량 저장용

		data.forEach(item => {
			const wh = item.STORAGE || '';
			if (wh === '' || wh === 'Unknown') return;

			if (!storageData[wh]) {
				storageData[wh] = 0;
				storageDataOriginal[wh] = 0;
			}
			storageData[wh] += parseFloat(item.TOTAL_QTY || 0);
			storageDataOriginal[wh] += parseFloat(item.TOTAL_QTY || 0);
		});

		const storages = Object.keys(storageData)
			.sort((a, b) => storageData[b] - storageData[a]);
		const total_qtys = storages.map(w => (storageData[w] / 1000000).toFixed(1));

		const ctx = document.getElementById('storageCountChart').getContext('2d');
		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: storages,
				datasets: [{
					label: '수량',
					data: total_qtys,
					backgroundColor: '#f59e0b'
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: function(context) {
								const label = context.label || '';
								const originalValue = storageDataOriginal[label] || 0;
								return '수량: ' + parseFloat(originalValue.toFixed(2)).toLocaleString('en-US');
							}
						}
					}
				},
				scales: {
					x: {
						title: { display: true, text: '수량 (M)' }
					}
				}
			}
		});
	}

});

