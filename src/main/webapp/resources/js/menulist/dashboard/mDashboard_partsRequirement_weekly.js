/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 주별 부품 소요량 대시보드 (ISO week 입력 + 월내 W1~W5 피벗 유지)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 *
 * 메뉴명: m2_PartsRequirement
 * 영어명: partsRequirement_weekly -> PartsRequirement
 * AJAX 호출: /read_parts_requirement_weekly_dashboard
 *
 * ✅ 핵심:
 *  - UI는 <input type="week"> (예: 2026-W03) 값을 사용
 *  - 서버는 week 값을 받아 month(yyyy-MM)로 변환해 SQL의 #{month}에 매핑(서버쪽에서 처리)
 *  - 화면 상단 기간 표시는 ISO week 범위(월~일)로 표시
 *
 * -------------------------------------------------------------- */

let currentWeeklyPartsDetail = [];

$(document).ready(function() {
	let globalPartsData_weekly = {};
	let currentWeeklySupplier = "all";
	let currentWeeklyFactory = "all";
	let currentWeeklystorage = "all";

	let weeklyChartInstance = null;
	let supplierWeeklyChartInstance = null;
	let factoryWeeklyChartInstance = null;
	let topPartsWeeklyChartInstance = null;

	// =========================
	// ✅ ISO week 범위 계산
	// weekStr: "2026-W03" => {start:'2026-01-13', end:'2026-01-19'} 같은 형식
	// =========================
	function getIsoWeekRange(weekStr) {
		const m = /^(\d{4})-W(\d{2})$/.exec(String(weekStr || "").trim());
		if (!m) return null;

		const year = parseInt(m[1], 10);
		const week = parseInt(m[2], 10);

		// ISO week 기준: 1월 4일이 포함된 주가 1주차
		const jan4 = new Date(Date.UTC(year, 0, 4));
		const jan4Day = jan4.getUTCDay() || 7; // 1(Mon)~7(Sun)

		// week1의 월요일
		const week1Mon = new Date(jan4);
		week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

		// 선택 주의 월요일
		const start = new Date(week1Mon);
		start.setUTCDate(week1Mon.getUTCDate() + (week - 1) * 7);

		// 선택 주의 일요일
		const end = new Date(start);
		end.setUTCDate(start.getUTCDate() + 6);

		const fmt = (d) => {
			const y = d.getUTCFullYear();
			const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
			const da = String(d.getUTCDate()).padStart(2, "0");
			return `${y}-${mo}-${da}`;
		};

		return { start: fmt(start), end: fmt(end) };
	}

	// =========================
	// ✅ 테이블 합계 Row (헤더 아래/스크롤 시 상단 고정)
	// =========================
	function buildTotalRow(sum, nf) {
		return `
		<tr class="parts-total-row">
		  <td>합계</td>
		  <td></td>
		  <td class="parts-text-right">${nf(sum.PREV_STOCK)}</td>

		  <td class="parts-text-right">${nf(sum.W1_IN)}</td>
		  <td class="parts-text-right">${nf(sum.W1_OUT)}</td>
		  <td class="parts-text-right">${nf(sum.W1_ETC)}</td>
		  <td class="parts-text-right">${nf(sum.W1_STOCK)}</td>

		  <td class="parts-text-right">${nf(sum.W2_IN)}</td>
		  <td class="parts-text-right">${nf(sum.W2_OUT)}</td>
		  <td class="parts-text-right">${nf(sum.W2_ETC)}</td>
		  <td class="parts-text-right">${nf(sum.W2_STOCK)}</td>

		  <td class="parts-text-right">${nf(sum.W3_IN)}</td>
		  <td class="parts-text-right">${nf(sum.W3_OUT)}</td>
		  <td class="parts-text-right">${nf(sum.W3_ETC)}</td>
		  <td class="parts-text-right">${nf(sum.W3_STOCK)}</td>

		  <td class="parts-text-right">${nf(sum.W4_IN)}</td>
		  <td class="parts-text-right">${nf(sum.W4_OUT)}</td>
		  <td class="parts-text-right">${nf(sum.W4_ETC)}</td>
		  <td class="parts-text-right">${nf(sum.W4_STOCK)}</td>

		  <td class="parts-text-right">${nf(sum.W5_IN)}</td>
		  <td class="parts-text-right">${nf(sum.W5_OUT)}</td>
		  <td class="parts-text-right">${nf(sum.W5_ETC)}</td>
		  <td class="parts-text-right">${nf(sum.W5_STOCK)}</td>
		</tr>
	`;
	}



	// ============ 메인 호출 함수 ============
	window.call_mDashboard_partsRequirement_weekly = function(menuId) {
		createWeeklyDashboardLayout();
		showLoading("data");

		// ✅ type="month" 기본값 세팅 (오늘 기준 YYYY-MM)
		const today = new Date();
		const ym = getYearMonthString(today); // "YYYY-MM"
		$("#parts_requirement_month").val(ym);

		// ✅ 월 기준으로 첫 조회
		render_dashboard_partsRequirement_weekly(ym);
	};

	// ✅ Date -> "YYYY-Www"
	function getIsoWeekString(date) {
		// UTC 기준으로 계산
		const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
		// ISO week: 목요일 기준
		const dayNum = d.getUTCDay() || 7; // Mon=1..Sun=7
		d.setUTCDate(d.getUTCDate() + 4 - dayNum);

		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

		const y = d.getUTCFullYear();
		const w = String(weekNo).padStart(2, "0");
		return `${y}-W${w}`;
	}

	function render_dashboard_partsRequirement_weekly(month) {
		// 필터 상태 초기화
		currentWeeklySupplier = "all";
		currentWeeklyFactory = "all";
		currentWeeklystorage = "all";

		// UI 필터 초기화
		$("#parts-supplier-select").val("all");
		$("#parts-factory-select").val("all");
		$("#parts-storage-select").val("all");
		$("#parts-number-input").val("");
		$("#parts-name-input").val("");
		$("#parts-custname-input").val("");

		// ✅ month 입력창에 현재 조회월 표시(초기/재조회 모두 일치)
		if (month) $("#parts_requirement_month").val(month);

		// 기존 차트 완전 제거
		destroyAllWeeklyCharts();

		showLoading("data");

		// ✅ 상단 기간 표기(월 기준)
		$(".currentText").text(" 현 재고 [ " + (month || "-") + " ]");

		$.ajax({
			url: "/read_parts_requirement_weekly_dashboard",
			type: "POST",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify({
				month: month,                 // ✅ month로 전달
				supplier: currentWeeklySupplier,
				factory: currentWeeklyFactory,
				storage: currentWeeklystorage,
				partNumber: $("#parts-number-input").val(),
				partName: $("#parts-name-input").val(),
				custName: $("#parts-custname-input").val()
			}),
			success: function(response) {
				hideLoading();
				console.log("PARTS REQUIREMENT MONTHLY(W1~W5) DASHBOARD LOAD", response);

				if (response && response.success) {
					globalPartsData_weekly = response.data || {};
					renderWeeklyDashboard(globalPartsData_weekly);
				} else {
					alert("데이터 조회 실패: " + (response ? response.message : "Unknown"));
				}
			},
			error: function(xhr, status, error) {
				hideLoading();
				console.error("Ajax Error:", error, xhr && xhr.responseText);
				alert("데이터 조회 중 오류 발생");
			},
		});
	}


	// ============ 대시보드 레이아웃 생성 ============
	function createWeeklyDashboardLayout() {
		const html = `
      <div class="divBlockControl" id="view_mDashboard_partsRequirement_weekly">
        <div class="content-body dashboard-parts-requirement">
          <div id="dashboard-parts-wrapper">

            <div class="parts-dashboard-header" style="display:none">
              <h1 class="parts-dashboard-title">
                <i class="icon-package"></i>
                주별 부품 소요량 대시보드
              </h1>
            </div>

            <!-- 필터 섹션 -->
            <div class="parts-filter-section">
              <div class="parts-filter-row">
                <div class="parts-filter-group">
                  <label>주별</label>
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
                  <label>품번</label>
                  <input type="text" id="parts-number-input" class="parts-filter-input" placeholder="품번 입력">
                </div>

                <div class="parts-filter-group">
                  <label>품명</label>
                  <input type="text" id="parts-name-input" class="parts-filter-input" placeholder="품명 입력">
                </div>



                <!-- <div class="parts-filter-group">
                  <label>입고처</label>
                  <input type="text" id="parts-custname-input" class="parts-filter-input" placeholder="입고처 입력 (합계 불일치)">
                </div> -->
              </div>

              <div class="parts-filter-buttons">
                <button class="parts-btn parts-btn-search" id="parts-btn-search">조회</button>
                <button class="parts-btn parts-btn-reset" id="parts-btn-reset">초기화</button>
              </div>
            </div>

            <!-- 차트 그리드 -->
            <div class="parts-chart-grid">
              <div class="parts-chart-box">
                <h2 class="parts-chart-title">주별 소요량 추이</h2>
                <canvas id="parts-weekly-chart"></canvas>
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
					  <!-- ✅ 1행: 주차 그룹 헤더 -->
					  <tr>
					    <th rowspan="2">품번</th>
					    <th rowspan="2" class="parts-col-itemname">품명</th>

					    <th rowspan="2" class="parts-text-right">이월재고</th>
					
					    <th colspan="4" class="parts-week-group w1">1주차 (W1)</th>
						<th colspan="4" class="parts-week-group w2">2주차 (W2)</th>
						<th colspan="4" class="parts-week-group w3">3주차 (W3)</th>
						<th colspan="4" class="parts-week-group w4">4주차 (W4)</th>
						<th colspan="4" class="parts-week-group w5">5주차 (W5)</th>
					  </tr>
					
					  <!-- ✅ 2행: 반복 헤더 -->
					  <tr>
					    <th class="parts-text-right">입고</th>
					    <th class="parts-text-right">출고</th>
					    <th class="parts-text-right">기타수불</th>
					    <th class="parts-text-right">재고</th>
					
					    <th class="parts-text-right">입고</th>
					    <th class="parts-text-right">출고</th>
					    <th class="parts-text-right">기타수불</th>
					    <th class="parts-text-right">재고</th>
					
					    <th class="parts-text-right">입고</th>
					    <th class="parts-text-right">출고</th>
					    <th class="parts-text-right">기타수불</th>
					    <th class="parts-text-right">재고</th>
					
					    <th class="parts-text-right">입고</th>
					    <th class="parts-text-right">출고</th>
					    <th class="parts-text-right">기타수불</th>
					    <th class="parts-text-right">재고</th>
					
					    <th class="parts-text-right">입고</th>
					    <th class="parts-text-right">출고</th>
					    <th class="parts-text-right">기타수불</th>
					    <th class="parts-text-right">재고</th>
					  </tr>
					</thead>

                  <tbody id="parts-tbody"></tbody>
                  <tfoot id="parts-tfoot"></tfoot>
                </table>
              </div>
              <div class="parts-table-footer">
                <button id="dashboard_partsRequirement_weekly_excel">엑셀 다운로드</button>
                <span>총 <span id="parts-table-count">0</span>건</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

		$(".w_contentArea").append(html);
		$("#dashboard-parts-wrapper").addClass("dashboardControl");
		$(".w_titleArea").addClass("dashboardControl");

		bindWeeklyFilterEvents();
	}

	// ============ 필터 이벤트 바인딩 ============
	// ✅ 주별이 아니라 "월별(YYYY-MM)" 선택으로 변경
	function bindWeeklyFilterEvents() {

		// 월 기본값 세팅 (페이지 로드 시 1회 호출되는 흐름이면 여기서도 OK)
		function setDefaultMonth() {
			const today = new Date();
			const ym = getYearMonthString(today); // "YYYY-MM"
			$("#parts_requirement_month").val(ym);
			return ym;
		}

		// 검색 버튼
		$("#parts-btn-search").off("click").on("click", function() {
			const month = $("#parts_requirement_month").val(); // "YYYY-MM"
			searchWithWeeklyFilters(month);
		});

		// 리셋 버튼
		$("#parts-btn-reset").off("click").on("click", function() {
			$("#parts-number-input").val("");
			$("#parts-name-input").val("");
			$("#parts-factory-select").val("all");
			$("#parts-storage-select").val("all");
			$("#parts-custname-input").val("");

			const month = setDefaultMonth();
			render_dashboard_partsRequirement_weekly(month); // ✅ 함수명은 유지(내부가 month로 동작하게)
		});

		// 월 변경
		/*$("#parts_requirement_month").off("change").on("change", function() {
			const month = $(this).val();
			searchWithWeeklyFilters(month);
		});*/

		// 공장/창고 변경
		$("#parts-factory-select, #parts-storage-select").off("change").on("change", function() {
			currentWeeklyFactory = $("#parts-factory-select").val();
			currentWeeklystorage = $("#parts-storage-select").val();

			if (this.id === "parts-factory-select") {
				updateWeeklyFilterOptions(globalPartsData_weekly);
			}
		});

		// 엔터 검색
		$(".parts-filter-input").off("keypress").on("keypress", function(e) {
			if (e.which === 13) {
				const month = $("#parts_requirement_month").val();
				searchWithWeeklyFilters(month);
			}
		});
		// bindWeeklyFilterEvents() 마지막 줄에 추가
		$("#parts_requirement_month").val(getYearMonthString(new Date()));

	}

	// ✅ 유틸: Date -> "YYYY-MM"
	function getYearMonthString(date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		return `${y}-${m}`;
	}


	// ============ 필터 적용 조회 ============
	// ============ 필터 적용 조회 ============
	function searchWithWeeklyFilters(month) {
		showLoading("data");

		// ✅ 상단 기간 표기(월 기준)
		$(".currentText").text(" 현 재고 [ " + (month || "-") + " ]");

		$.ajax({
			url: "/read_parts_requirement_weekly_dashboard",
			type: "POST",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify({
				month: month,
				factory: currentWeeklyFactory,
				storage: currentWeeklystorage,
				partNumber: $("#parts-number-input").val(),
				partName: $("#parts-name-input").val(),
				custName: $("#parts-custname-input").val()
			}),
			success: function(response) {
				hideLoading();
				console.log("PARTS REQUIREMENT MONTHLY(W1~W5) DASHBOARD SEARCH", response);

				if (response && response.success) {
					globalPartsData_weekly = response.data || {};
					renderWeeklyDashboard(globalPartsData_weekly);
				} else {
					alert("데이터 조회 실패: " + (response ? response.message : "Unknown"));
				}
			},
			error: function(xhr, status, error) {
				hideLoading();
				console.error("Ajax Error:", error, xhr && xhr.responseText);
				alert("데이터 조회 중 오류 발생");
			},
		});
	}

	// ============ 차트 전체 제거 ============
	function destroyAllWeeklyCharts() {
		if (weeklyChartInstance) {
			weeklyChartInstance.destroy();
			weeklyChartInstance = null;
		}
		if (supplierWeeklyChartInstance) {
			supplierWeeklyChartInstance.destroy();
			supplierWeeklyChartInstance = null;
		}
		if (factoryWeeklyChartInstance) {
			factoryWeeklyChartInstance.destroy();
			factoryWeeklyChartInstance = null;
		}
		if (topPartsWeeklyChartInstance) {
			topPartsWeeklyChartInstance.destroy();
			topPartsWeeklyChartInstance = null;
		}
	}

	// ============ 대시보드 렌더링 ============
	function renderWeeklyDashboard(data) {
		console.log("DASHBOARD RENDERING", data);

		if (!data || !data.detail || data.detail.length === 0) {

			// ✅ 핵심: 이전 데이터 제거 (엑셀/합계 초기화)
			currentWeeklyPartsDetail = [];

			$("#parts-tbody").empty().append(
				'<tr><td colspan="23" style="text-align:center; padding:40px; color:#6c757d;">조회된 데이터가 없습니다</td></tr>'
			);

			// ✅ 합계(tfoot)도 비우기
			$("#parts-tfoot").empty();

			$("#parts-table-count").text("0");
			destroyAllWeeklyCharts();
			return;
		}

		updateWeeklyFilterOptions(data);
		renderWeeklyChart(data.weekly);   // 서버에서 주별 추이 제공 시
		renderSupplierWeeklyChart(data.supplier);
		renderFactoryWeeklyChart(data.factory);
		renderTopPartsWeeklyChart(data.topParts);
		renderPartsWeeklyTable(data.detail);
	}

	// ============ 필터 옵션 업데이트 ============
	function updateWeeklyFilterOptions(data) {
		// 공장
		const $factorySelect = $("#parts-factory-select");
		const currentWeeklyFactoryValue = $factorySelect.val();
		$factorySelect.empty().append('<option value="all">전체</option>');
		if (data.factories) {
			data.factories.forEach((factory) => {
				$factorySelect.append(`<option value="${factory}">${factory}</option>`);
			});
		}
		if (currentWeeklyFactoryValue && $factorySelect.find(`option[value="${currentWeeklyFactoryValue}"]`).length > 0) {
			$factorySelect.val(currentWeeklyFactoryValue);
		} else {
			$factorySelect.val("all");
		}

		// 창고
		const $storageSelect = $("#parts-storage-select");
		const currentWeeklystorageValue = $storageSelect.val();
		const selectedFactory = String($factorySelect.val() || "all").toUpperCase();

		$storageSelect.empty().append('<option value="all">전체</option>');

		if (data.storages) {
			data.storages.forEach((storage) => {
				const sUpper = String(storage).toUpperCase();

				if (selectedFactory === "PUEBLA") {
					if (sUpper === "MATERIAL") $storageSelect.append(`<option value="${storage}">${storage}</option>`);
					return;
				}

				if (selectedFactory === "SALTILLO") {
					if (sUpper === "P1W/HOUSE" || sUpper === "PRODUCT") return;
					$storageSelect.append(`<option value="${storage}">${storage}</option>`);
					return;
				}

				if (sUpper === "P1W/HOUSE" || sUpper === "P1/HOUSE" || sUpper === "PRODUCT") return;
				$storageSelect.append(`<option value="${storage}">${storage}</option>`);
			});
		}

		if (currentWeeklystorageValue && $storageSelect.find(`option[value="${currentWeeklystorageValue}"]`).length > 0) {
			$storageSelect.val(currentWeeklystorageValue);
		} else {
			$storageSelect.val("all");
		}
	}

	// ============ 주별 소요량 추이 차트 ============
	function renderWeeklyChart(weekly) {
		if (!weekly || weekly.length === 0) return;

		const labels = weekly.map((m) => m.MONTH);
		const quantities = weekly.map((m) => m.QUANTITY || 0);

		if (weeklyChartInstance) weeklyChartInstance.destroy();

		const ctx = document.getElementById("parts-weekly-chart").getContext("2d");
		weeklyChartInstance = new Chart(ctx, {
			type: "line",
			data: {
				labels: labels,
				datasets: [
					{
						label: "소요량",
						data: quantities,
						borderColor: "#667eea",
						backgroundColor: "rgba(102, 126, 234, 0.1)",
						fill: true,
						tension: 0.4,
						borderWidth: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							font: { size: 10 },
							callback: function(value) {
								return Number(value).toLocaleString();
							},
						},
					},
					x: { ticks: { font: { size: 10 } } },
				},
			},
		});
	}

	function renderSupplierWeeklyChart(supplier) {
		if (!supplier || supplier.length === 0) return;

		const labels = supplier.map((s) => s.SUPPLIER_NAME);
		const quantities = supplier.map((s) => s.QUANTITY || 0);

		if (supplierWeeklyChartInstance) supplierWeeklyChartInstance.destroy();

		const ctx = document.getElementById("parts-supplier-chart").getContext("2d");
		supplierWeeklyChartInstance = new Chart(ctx, {
			type: "doughnut",
			data: {
				labels: labels,
				datasets: [
					{
						data: quantities,
						backgroundColor: [
							"#667eea",
							"#764ba2",
							"#f093fb",
							"#4facfe",
							"#00f2fe",
							"#43e97b",
							"#fa709a",
							"#fee140",
						],
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: "bottom", labels: { font: { size: 10 } } },
				},
			},
		});
	}

	function renderFactoryWeeklyChart(factory) {
		if (!factory || factory.length === 0) return;

		const labels = factory.map((f) => f.FACTORY_NAME);
		const quantities = factory.map((f) => f.QUANTITY || 0);

		if (factoryWeeklyChartInstance) factoryWeeklyChartInstance.destroy();

		const ctx = document.getElementById("parts-factory-chart").getContext("2d");
		factoryWeeklyChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: labels,
				datasets: [{ label: "소요량", data: quantities, backgroundColor: "#667eea", borderRadius: 6 }],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							font: { size: 10 },
							callback: function(value) {
								return Number(value).toLocaleString();
							},
						},
					},
					x: { ticks: { font: { size: 10 } } },
				},
			},
		});
	}

	function renderTopPartsWeeklyChart(topParts) {
		if (!topParts || topParts.length === 0) return;

		const labels = topParts.map((p) => p.PART_NAME || p.PART_NUMBER);
		const quantities = topParts.map((p) => p.QUANTITY || 0);

		if (topPartsWeeklyChartInstance) topPartsWeeklyChartInstance.destroy();

		const ctx = document.getElementById("parts-top-chart").getContext("2d");
		topPartsWeeklyChartInstance = new Chart(ctx, {
			type: "bar",
			data: { labels: labels, datasets: [{ label: "소요량", data: quantities, backgroundColor: "#764ba2", borderRadius: 6 }] },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: "y",
				plugins: { legend: { display: false } },
				scales: {
					x: {
						beginAtZero: true,
						ticks: {
							font: { size: 9 },
							callback: function(value) {
								return Number(value).toLocaleString();
							},
						},
					},
					y: { ticks: { font: { size: 9 } } },
				},
			},
		});
	}

	// ============ 테이블 렌더 ============
	function renderPartsWeeklyTable(detail) {
		console.log("[renderPartsTable] rows=", detail ? detail.length : 0);

		const $tbody = $("#parts-tbody");
		const $tfoot = $("#parts-tfoot");   // ✅ 추가
		$tbody.empty();
		$tfoot.empty();                     // ✅ 추가

		currentWeeklyPartsDetail = detail ? detail.slice() : [];

		if (!detail || detail.length === 0) {
			$tbody.append(
				'<tr><td colspan="23" style="text-align:center; padding:40px; color:#6c757d;">조회된 데이터가 없습니다</td></tr>'
			);
			$("#parts-table-count").text("0");
			return;
		}

		const n = (v) => Number(v || 0);
		const nf = (v) => n(v).toLocaleString();

		const sum = {
			PREV_STOCK: 0,
			W1_IN: 0, W1_OUT: 0, W1_ETC: 0, W1_STOCK: 0,
			W2_IN: 0, W2_OUT: 0, W2_ETC: 0, W2_STOCK: 0,
			W3_IN: 0, W3_OUT: 0, W3_ETC: 0, W3_STOCK: 0,
			W4_IN: 0, W4_OUT: 0, W4_ETC: 0, W4_STOCK: 0,
			W5_IN: 0, W5_OUT: 0, W5_ETC: 0, W5_STOCK: 0
		};

		detail.forEach((item) => {
			sum.PREV_STOCK += n(item.PREV_STOCK);

			sum.W1_IN += n(item.W1_IN); sum.W1_OUT += n(item.W1_OUT); sum.W1_ETC += n(item.W1_ETC); sum.W1_STOCK += n(item.W1_STOCK);
			sum.W2_IN += n(item.W2_IN); sum.W2_OUT += n(item.W2_OUT); sum.W2_ETC += n(item.W2_ETC); sum.W2_STOCK += n(item.W2_STOCK);
			sum.W3_IN += n(item.W3_IN); sum.W3_OUT += n(item.W3_OUT); sum.W3_ETC += n(item.W3_ETC); sum.W3_STOCK += n(item.W3_STOCK);
			sum.W4_IN += n(item.W4_IN); sum.W4_OUT += n(item.W4_OUT); sum.W4_ETC += n(item.W4_ETC); sum.W4_STOCK += n(item.W4_STOCK);
			sum.W5_IN += n(item.W5_IN); sum.W5_OUT += n(item.W5_OUT); sum.W5_ETC += n(item.W5_ETC); sum.W5_STOCK += n(item.W5_STOCK);
		});

		// ✅ 합계 row는 tfoot에 (하단 고정용)
		$tfoot.append(buildTotalRow(sum, nf));

		// ✅ 상세는 tbody에
		detail.forEach((item) => {
			const row = `
			<tr>
				<td style="font-weight:600;">${item.ITEMCODE || "-"}</td>
				<td class="parts-col-itemname" title="${(item.ITEMNAME || "").replace(/"/g, "&quot;")}">${item.ITEMNAME || "-"}</td>
				<td class="parts-text-right">${nf(item.PREV_STOCK)}</td>

				<td class="parts-text-right">${nf(item.W1_IN)}</td>
				<td class="parts-text-right">${nf(item.W1_OUT)}</td>
				<td class="parts-text-right">${nf(item.W1_ETC)}</td>
				<td class="parts-text-right" style="font-weight:600;">${nf(item.W1_STOCK)}</td>

				<td class="parts-text-right">${nf(item.W2_IN)}</td>
				<td class="parts-text-right">${nf(item.W2_OUT)}</td>
				<td class="parts-text-right">${nf(item.W2_ETC)}</td>
				<td class="parts-text-right" style="font-weight:600;">${nf(item.W2_STOCK)}</td>

				<td class="parts-text-right">${nf(item.W3_IN)}</td>
				<td class="parts-text-right">${nf(item.W3_OUT)}</td>
				<td class="parts-text-right">${nf(item.W3_ETC)}</td>
				<td class="parts-text-right" style="font-weight:600;">${nf(item.W3_STOCK)}</td>

				<td class="parts-text-right">${nf(item.W4_IN)}</td>
				<td class="parts-text-right">${nf(item.W4_OUT)}</td>
				<td class="parts-text-right">${nf(item.W4_ETC)}</td>
				<td class="parts-text-right" style="font-weight:600;">${nf(item.W4_STOCK)}</td>

				<td class="parts-text-right">${nf(item.W5_IN)}</td>
				<td class="parts-text-right">${nf(item.W5_OUT)}</td>
				<td class="parts-text-right">${nf(item.W5_ETC)}</td>
				<td class="parts-text-right" style="font-weight:600;">${nf(item.W5_STOCK)}</td>
			</tr>
		`;
			$tbody.append(row);
		});

		$("#parts-table-count").text(detail.length);
	}

});

// =========================
// ✅ 엑셀 다운로드 (그룹 헤더 merge/colspan 유지 버전)
// =========================
$(document).on("click", "#dashboard_partsRequirement_weekly_excel", function() {
	if (typeof XLSX === "undefined") {
		alert("Excel 라이브러리가 로드되지 않았습니다.");
		return;
	}

	const n = (v) => Number(v || 0);

	// =========================
	// 1) 2줄 헤더(그룹 + 서브헤더) 만들기
	//    A~C는 고정, D~W는 W1~W5 (각 4칸)
	// =========================
	const headerRow1 = [
		"", "", "",                 // A:품번 B:품명 C:이월재고 -> 2행에서 표시, 1행은 빈칸
		"1주차", "", "", "",         // D~G merge
		"2주차", "", "", "",         // H~K merge
		"3주차", "", "", "",         // L~O merge
		"4주차", "", "", "",         // P~S merge
		"5주차", "", "", ""          // T~W merge
	];

	const headerRow2 = [
		"품번", "품명", "이월재고",
		"입고", "출고", "기타수불", "재고",
		"입고", "출고", "기타수불", "재고",
		"입고", "출고", "기타수불", "재고",
		"입고", "출고", "기타수불", "재고",
		"입고", "출고", "기타수불", "재고"
	];

	const data = [];
	data.push(headerRow1);
	data.push(headerRow2);

	// =========================
	// 2) 합계(3행)
	// =========================
	let tPrev = 0;
	let t = {
		W1_IN: 0, W1_OUT: 0, W1_ETC: 0, W1_STOCK: 0,
		W2_IN: 0, W2_OUT: 0, W2_ETC: 0, W2_STOCK: 0,
		W3_IN: 0, W3_OUT: 0, W3_ETC: 0, W3_STOCK: 0,
		W4_IN: 0, W4_OUT: 0, W4_ETC: 0, W4_STOCK: 0,
		W5_IN: 0, W5_OUT: 0, W5_ETC: 0, W5_STOCK: 0
	};

	(currentWeeklyPartsDetail || []).forEach((item) => {
		tPrev += n(item.PREV_STOCK);

		t.W1_IN += n(item.W1_IN); t.W1_OUT += n(item.W1_OUT); t.W1_ETC += n(item.W1_ETC); t.W1_STOCK += n(item.W1_STOCK);
		t.W2_IN += n(item.W2_IN); t.W2_OUT += n(item.W2_OUT); t.W2_ETC += n(item.W2_ETC); t.W2_STOCK += n(item.W2_STOCK);
		t.W3_IN += n(item.W3_IN); t.W3_OUT += n(item.W3_OUT); t.W3_ETC += n(item.W3_ETC); t.W3_STOCK += n(item.W3_STOCK);
		t.W4_IN += n(item.W4_IN); t.W4_OUT += n(item.W4_OUT); t.W4_ETC += n(item.W4_ETC); t.W4_STOCK += n(item.W4_STOCK);
		t.W5_IN += n(item.W5_IN); t.W5_OUT += n(item.W5_OUT); t.W5_ETC += n(item.W5_ETC); t.W5_STOCK += n(item.W5_STOCK);
	});

	data.push([
		"합계", "",
		tPrev,
		t.W1_IN, t.W1_OUT, t.W1_ETC, t.W1_STOCK,
		t.W2_IN, t.W2_OUT, t.W2_ETC, t.W2_STOCK,
		t.W3_IN, t.W3_OUT, t.W3_ETC, t.W3_STOCK,
		t.W4_IN, t.W4_OUT, t.W4_ETC, t.W4_STOCK,
		t.W5_IN, t.W5_OUT, t.W5_ETC, t.W5_STOCK
	]);

	// =========================
	// 3) 상세 데이터 (4행부터)
	// =========================
	(currentWeeklyPartsDetail || []).forEach((item) => {
		data.push([
			item.ITEMCODE || "",
			item.ITEMNAME || "",
			n(item.PREV_STOCK),

			n(item.W1_IN), n(item.W1_OUT), n(item.W1_ETC), n(item.W1_STOCK),
			n(item.W2_IN), n(item.W2_OUT), n(item.W2_ETC), n(item.W2_STOCK),
			n(item.W3_IN), n(item.W3_OUT), n(item.W3_ETC), n(item.W3_STOCK),
			n(item.W4_IN), n(item.W4_OUT), n(item.W4_ETC), n(item.W4_STOCK),
			n(item.W5_IN), n(item.W5_OUT), n(item.W5_ETC), n(item.W5_STOCK)
		]);
	});

	const ws = XLSX.utils.aoa_to_sheet(data);

	// =========================
	// 4) ✅ 1행 그룹 헤더 merge (colspan 구현)
	//    0-based: A=0, B=1...
	//    D~G : 3~6
	// =========================
	ws["!merges"] = [
		{ s: { r: 0, c: 3 }, e: { r: 0, c: 6 } },  // 1주차
		{ s: { r: 0, c: 7 }, e: { r: 0, c: 10 } }, // 2주차
		{ s: { r: 0, c: 11 }, e: { r: 0, c: 14 } },// 3주차
		{ s: { r: 0, c: 15 }, e: { r: 0, c: 18 } },// 4주차
		{ s: { r: 0, c: 19 }, e: { r: 0, c: 22 } } // 5주차
	];

	// =========================
	// 5) 열 너비 (품명 넓게)
	// =========================
	ws["!cols"] = [
		{ wch: 18 }, // 품번
		{ wch: 40 }, // 품명
		{ wch: 14 }, // 이월재고
		// 나머지 숫자들
		...Array.from({ length: 20 }, () => ({ wch: 12 }))
	];

	// =========================
	// 6) 숫자 타입 강제(이월재고~끝까지)
	//    - 헤더 2줄은 제외(0,1행)
	//    - 합계/상세부터 적용(2행부터)
	// =========================
	const range = XLSX.utils.decode_range(ws["!ref"]);

	for (let R = 2; R <= range.e.r; ++R) {          // 2행(합계)부터
		for (let C = 2; C <= 22; ++C) {             // C(이월재고)~W(마지막)
			const addr = XLSX.utils.encode_cell({ r: R, c: C });
			if (!ws[addr]) continue;

			const v = ws[addr].v;
			const num = parseFloat(String(v).replace(/,/g, ""));
			if (!isNaN(num)) {
				ws[addr].t = "n";
				ws[addr].v = num;
			}
		}
	}

	// =========================
	// 7) (선택) Freeze Pane: 헤더 2줄 고정
	// =========================
	ws["!freeze"] = { xSplit: 0, ySplit: 2 }; // 2행까지 고정(라이브러리 버전에 따라 무시될 수 있음)

	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "주별 부품 소요량");

	XLSX.writeFile(wb, "주별_부품_소요량_" + new Date().toISOString().slice(0, 10) + ".xlsx");
});

