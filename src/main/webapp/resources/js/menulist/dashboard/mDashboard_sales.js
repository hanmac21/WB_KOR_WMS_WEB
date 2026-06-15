/* --------------------------------------------------------------
 * 📌 영업(출고) 대시보드 - 사진 레이아웃 버전 (통파일)
 * - TOP: 필터(좌) + KPI 3개(우)
 * - BODY: 일자별 출고 건수/수량/금액 차트 3개(세로)
 * - 쿼리/응답 포맷은 아래 "권장 포맷" 참고
 * -------------------------------------------------------------- */

$(document).ready(function () {
	// ============================================================
	// ✅ 전역 상태
	// ============================================================
	let currentFactory = "SALTILLO";
	let globalOutSalesData = {};

	// Chart.js instance 3개
	let chartDailyCount = null;
	let chartDailyQty = null;
	let chartDailyAmount = null;

	// ============================================================
	// ✅ 유틸: 오늘 날짜 yyyy-mm-dd
	// ============================================================
	function getTodayYMD() {
		const d = new Date();
		return (
			d.getFullYear() +
			"-" +
			String(d.getMonth() + 1).padStart(2, "0") +
			"-" +
			String(d.getDate()).padStart(2, "0")
		);
	}

	// ============================================================
	// ✅ 진입 함수 (메뉴 진입 시 호출)
	// ============================================================
	window.call_mDashboard_sales = function (menuId) {
		createSalesOutDashboardLayout();

		function getThisMonthStart() {
			const d = new Date();

			return (
				d.getFullYear() +
				"-" +
				String(d.getMonth() + 1).padStart(2, "0") +
				"-01"
			);
		}

		const today = getTodayYMD();

		$("#sales_date_from").val(getThisMonthStart());
		$("#sales_date_to").val(today);

		$("#sales_factory").val("SALTILLO");
		currentFactory = "SALTILLO";

		// (선택) storage/category 기본값
		$("#sales_storage").val("ALL");
		$("#sales_main_category").val("ALL");
		$("#sales_sub_category").val("ALL");

		bindSalesOutDashboardEvents();

		// ✅ 첫 조회
		render_sales_dashboard();
	};

	// ============================================================
	// ✅ Layout 생성 (사진 레이아웃)
	// ============================================================
	function createSalesOutDashboardLayout() {
		// 중복 생성 방지 (메뉴 재진입 시)
		$("#view_mDashboard_sales").remove();

		const html = `
		<div class="divBlockControl" id="view_mDashboard_sales">
			<div class="content-body dashboard-sales">
				<div id="dashboard-sales-wrapper" class="salesDash">

					<!-- =======================
					     TOP AREA (FILTER + KPI)
					     ======================= -->
					<div class="salesDashTop">

						<!-- LEFT: FILTER CARD -->
						<div class="salesDashFilterCard">

							<div class="filterGrid">

								<div class="filterField">
									<div class="filterLabel">${i18n.t("dashboard.sales.dateFrom") || "날짜 선택"}</div>
									<input type="date" id="sales_date_from" class="filterInput"/>
								</div>


								<div class="filterField">
									<div class="filterLabel">${i18n.t("dashboard.sales.factory") || "공장"}</div>
									<select id="sales_factory" class="filterSelect">
										<option value="SALTILLO">${i18n.t("factory.saltillo") || "Saltillo"}</option>
										<option value="PUEBLA">${i18n.t("factory.puebla") || "Puebla"}</option>
									</select>
								</div>

								<div class="filterField">
									<div class="filterLabel">${i18n.t("dashboard.sales.storage") || "창고"}</div>
									<select id="sales_storage" class="filterSelect">
										<option value="ALL">${i18n.t("common.all") || "ALL"}</option>
										<!-- 필요 시 동적 추가 -->
									</select>
								</div>
								<div class="filterField">
									<div class="filterLabel">${i18n.t("dashboard.sales.dateTo") || "날짜 선택"}</div>
									<input type="date" id="sales_date_to" class="filterInput"/>
								</div>

								<div class="filterField">
									<div class="filterLabel">${i18n.t("dashboard.sales.mainCategory") || "대분류"}</div>
									<select id="sales_main_category" class="filterSelect">
										<option value="ALL">ALL</option>
										<option value="CAR">차종</option>
										<option value="CUSTOMER">고객사</option>
									</select>
								</div>

								<div class="filterField">
									<div class="filterLabel">${i18n.t("dashboard.sales.subCategory") || "세부"}</div>
									<select id="sales_sub_category" class="filterSelect">
										<option value="ALL">${i18n.t("common.all") || "ALL"}</option>
										<!-- 필요 시 동적 추가 -->
									</select>
								</div>

								<div class="filterAction">
									<button type="button" id="sales_refresh" class="filterRefreshBtn">
										${i18n.t("common.refresh") || "새로고침"}
									</button>
								</div>

							</div>
						</div>

						<!-- RIGHT: KPI CARDS 3 -->
						<div class="salesDashKpiRow">
							<div class="kpiCard kpiDark">
								<div class="kpiTitle">${i18n.t("dashboard.sales.kpi.shipCount") || "출고 건수"}</div>
								<div class="kpiValue" id="kpi_ship_count">0</div>
							</div>

							<div class="kpiCard kpiNavy">
								<div class="kpiTitle">${i18n.t("dashboard.sales.kpi.shipQty") || "출고 수량"}</div>
								<div class="kpiValue" id="kpi_ship_qty">0</div>
							</div>

							<div class="kpiCard kpiBlue">
								<div class="kpiTitle">${i18n.t("dashboard.sales.kpi.shipAmount") || "출고 금액"}</div>
								<div class="kpiValue" id="kpi_ship_amount">0</div>
							</div>
						</div>

					</div>


					<!-- =======================
					     CHART STACK (3 rows)
					     ======================= -->
					<div class="salesDashCharts">

						<div class="chartBox">
							<div class="chartTitle">${i18n.t("dashboard.sales.chart.dailyCount") || "일자별 출고 건수"}</div>
							<div class="chartCanvasWrap">
								<canvas id="chart_daily_count"></canvas>
							</div>
						</div>

						<div class="chartBox">
							<div class="chartTitle">${i18n.t("dashboard.sales.chart.dailyQty") || "일자별 출고 수량"}</div>
							<div class="chartCanvasWrap">
								<canvas id="chart_daily_qty"></canvas>
							</div>
						</div>

						<div class="chartBox">
							<div class="chartTitle">${i18n.t("dashboard.sales.chart.dailyAmount") || "일자별 출고 금액"}</div>
							<div class="chartCanvasWrap">
								<canvas id="chart_daily_amount"></canvas>
							</div>
						</div>

					</div>

				</div>
			</div>
		</div>
		`;

		$(".w_contentArea").append(html);
		$("#dashboard-sales-wrapper").addClass("dashboardControl");
		$(".w_titleArea").addClass("dashboardControl");
	}

	// ============================================================
	// ✅ 소분류 로딩
	// ============================================================
	function loadSubCategory() {
		const main = $("#sales_main_category").val();
		const factory = ($("#sales_factory").val() || "SALTILLO").toUpperCase();
		const dateFrom = $("#sales_date_from").val() || getTodayYMD();
		const dateTo = $("#sales_date_to").val() || getTodayYMD();

		if (main === "ALL") {
			$("#sales_sub_category").html('<option value="ALL">ALL</option>');
			return;
		}

		$.ajax({
			url: "/read_sales_out_subcategory",
			type: "POST",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify({ main, factory, dateFrom, dateTo }),
			success: function (res) {
				let html = '<option value="ALL">ALL</option>';

				if (res.success && res.data) {
					res.data.forEach((v) => {
						html += `<option value="${v}">${v}</option>`;
					});
				}

				$("#sales_sub_category").html(html);
			},
		});
	}

	// ============================================================
	// ✅ 이벤트 바인딩
	// ============================================================
	function bindSalesOutDashboardEvents() {
		// 필터 변경 시 자동 조회
		$("#sales_factory, #sales_storage")
			.off("change")
			.on("change", function () {
				render_sales_dashboard();
			});

		$("#sales_main_category")
			.off("change")
			.on("change", function () {
				loadSubCategory();
			});

		$("#sales_sub_category")
			.off("change")
			.on("change", function () {
				render_sales_dashboard();
			});

		$("#sales_date_from, #sales_date_to")
			.off("change")
			.on("change", function () {
				render_sales_dashboard();
			});

		// 새로고침 버튼
		$("#sales_refresh")
			.off("click")
			.on("click", function () {
				render_sales_dashboard();
			});
	}

	// ============================================================
	// ✅ 차트 제거
	// ============================================================
	function destroyCharts() {
		if (chartDailyCount) {
			chartDailyCount.destroy();
			chartDailyCount = null;
		}
		if (chartDailyQty) {
			chartDailyQty.destroy();
			chartDailyQty = null;
		}
		if (chartDailyAmount) {
			chartDailyAmount.destroy();
			chartDailyAmount = null;
		}
	}

	// ============================================================
	// ✅ 메인 조회 (영업/출고 대시보드)
	// ============================================================
	function render_sales_dashboard(afterLoad) {
		const dateFrom = $("#sales_date_from").val() || getTodayYMD();
		const dateTo = $("#sales_date_to").val() || getTodayYMD();
		const factory = ($("#sales_factory").val() || "SALTILLO").toUpperCase();
		const storage = $("#sales_storage").val() || "ALL";
		const main = $("#sales_main_category").val() || "ALL";
		const sub = $("#sales_sub_category").val() || "ALL";

		currentFactory = factory;

		// 차트 초기화
		destroyCharts();

		showLoading("data");

		$.ajax({
			url: "/read_sales_out_dashboard", // ✅ 서버에서 맞춰주세요
			type: "POST",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify({
				dateFrom,
				dateTo,
				factory,
				storage,
				main,
				sub,
			}),
			success: function (res) {
				hideLoading();

				if (res && res.success) {
					globalOutSalesData = res.data || {};

					console.log(
						"dailyCount sample:",
						globalOutSalesData.dailyCount?.[0],
					);
					console.log(
						"dailyQty sample:",
						globalOutSalesData.dailyQty?.[0],
					);
					console.log(
						"dailyAmount sample:",
						globalOutSalesData.dailyAmount?.[0],
					);

					updateKpis(globalOutSalesData.summary);

					renderDailyCountChart(globalOutSalesData.dailyCount || []);
					renderDailyQtyChart(globalOutSalesData.dailyQty || []);
					renderDailyAmountChart(
						globalOutSalesData.dailyAmount || [],
					);

					if (typeof afterLoad === "function") afterLoad();
				} else {
					alert(
						i18n.t("common.fetchFailed", {
							message:
								res?.message || i18n.t("common.unknownError"),
						}),
					);
				}
			},
			error: function () {
				hideLoading();
				alert(i18n.t("common.fetchError"));
			},
		});
	}

	// ============================================================
	// ✅ KPI 업데이트
	// 권장 summary 포맷:
	// { SHIP_COUNT: 10, SHIP_QTY: 1200, SHIP_AMOUNT: 3400000 }
	// ============================================================
	function updateKpis(summary) {
		const shipCount = summary?.SHIP_COUNT || 0;
		const shipQty = summary?.SHIP_QTY || 0;
		const shipAmount = summary?.SHIP_AMOUNT || 0;

		$("#kpi_ship_count").text(Number(shipCount).toLocaleString());
		$("#kpi_ship_qty").text(Number(shipQty).toLocaleString());
		$("#kpi_ship_amount").text(Number(shipAmount).toLocaleString());
	}

	// ============================================================
	// ✅ Chart Render Helpers (공통)
	// 권장 list 포맷:
	// [{ YMD:'2026-01-12', VALUE: 10 }, ...]
	// 또는 [{ ymd:'2026-01-12', value: 10 }, ...]
	// ============================================================
	function normalizeDailyList(list) {
		return (list || []).map((d) => {
			const ymd = d.YMD || d.ymd || d.date || "";
			const value = d.VALUE ?? d.value ?? d.val ?? 0;
			return { ymd, value: Number(value) || 0 };
		});
	}
	function generateDateRange(start, end) {
		const dates = [];
		let current = new Date(start);
		const endDate = new Date(end);

		while (current <= endDate) {
			const y =
				current.getFullYear() +
				"-" +
				String(current.getMonth() + 1).padStart(2, "0") +
				"-" +
				String(current.getDate()).padStart(2, "0");

			dates.push(y);
			current.setDate(current.getDate() + 1);
		}

		return dates;
	}
	function buildDailySeries(list, start, end) {
		const map = {};
		list.forEach((v) => {
			map[v.ymd] = v.value;
		});

		const labels = generateDateRange(start, end);
		const values = labels.map((d) => map[d] || 0);

		return { labels, values };
	}

	function buildLineChart(ctx, labels, data, labelText) {
		const chartType = labels.length <= 2 ? "bar" : "line";
		return new Chart(ctx, {
			type: chartType,
			data: {
				labels,
				datasets: [
					{
						label: labelText,
						data,
						borderColor: "#3b82f6",
						fill: false,
						backgroundColor: "rgba(59, 130, 246, 0.5)",
						tension: 0,
						pointRadius: 4,
						pointHoverRadius: 6,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				devicePixelRatio: 1,
				animation: false,
				interaction: { mode: "index", intersect: false },
				plugins: {
					legend: { display: false },
					tooltip: {
						bodyFont: {
							family: "Arial",
						},
						titleFont: {
							family: "Arial",
						},
					},
				},
				scales: {
					x: {
						ticks: {
							autoSkip: true,
							font: { size: 11 },
							maxTicksLimit: 10,
						},
					},
					y: {
						beginAtZero: true,
						ticks: {
							font: { size: 11 },
							padding: 10,
							maxTicksLimit: 6, // ← 눈금 갯수 제한
							callback: function (value) {
								return value.toLocaleString();
							},
						},
					},
				},
			},
		});
	}

	// ============================================================
	// ✅ 일자별 출고 건수 차트
	// ============================================================
	function renderDailyCountChart(list) {
		// list: [{YMD:'2026-02-03', VALUE:123}, ...]
		const norm = normalizeDailyList(list); // ✅ YMD/VALUE -> ymd/value로 정규화

		const range = buildDailySeries(
			norm,
			$("#sales_date_from").val(),
			$("#sales_date_to").val(),
		);

		const labels = range.labels;
		const values = range.values;

		const canvas = document.getElementById("chart_daily_count");
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		chartDailyCount = buildLineChart(ctx, labels, values, "출고 건수");
	}

	// ============================================================
	// ✅ 일자별 출고 수량 차트
	// ============================================================
	function renderDailyQtyChart(list) {
		// list: [{YMD:'2026-02-03', VALUE:251472}, ...]
		const norm = normalizeDailyList(list);

		const range = buildDailySeries(
			norm,
			$("#sales_date_from").val(),
			$("#sales_date_to").val(),
		);

		const labels = range.labels;
		const values = range.values;

		const canvas = document.getElementById("chart_daily_qty");
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		chartDailyQty = buildLineChart(ctx, labels, values, "출고 수량");
	}

	// ============================================================
	// ✅ 일자별 출고 금액 차트
	// ============================================================
	function renderDailyAmountChart(list) {
		// list: [{YMD:'2026-02-03', VALUE:304695.95}, ...]
		const norm = normalizeDailyList(list);

		const range = buildDailySeries(
			norm,
			$("#sales_date_from").val(),
			$("#sales_date_to").val(),
		);

		const labels = range.labels;
		const values = range.values;

		const canvas = document.getElementById("chart_daily_amount");
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		chartDailyAmount = buildLineChart(ctx, labels, values, "출고 금액");
	}
});
