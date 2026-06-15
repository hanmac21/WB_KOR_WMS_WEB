/* --------------------------------------------------------------
 * 📌 업체별 입고수량 및 소요량/재고현황 대시보드
 * - 메뉴명: vendorStockStatus
 * - 방식: MVC2 / AJAX
 * - 구성:
 *   1) KPI 카드 5개
 *   2) A~B 기간 당월 소요량 차트
 *   3) 재고/입출고 요약 차트
 *   4) 메인 리스트
 * -------------------------------------------------------------- */

$(document).ready(function () {
	let globalVendorStockData = [];
	let totalVendorStockCount = 0;

	let needChartInstance = null;
	let summaryChartInstance = null;

	// ============================================================
	// ✅ 유틸
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

	function getCurrentMonthYM() {
		const d = new Date();
		return (
			d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
		);
	}

	function getMonthRange(ym) {
		const parts = (ym || getCurrentMonthYM()).split("-");
		const year = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10);

		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 1); // 다음달 1일
		//const prevMonthEndDate = new Date(year, month - 1, 0); // 전월 말일
		const prevMonthEndDate = new Date(year, month - 1, 1); // 선택월 1일
		

		return {
			sdate:
				startDate.getFullYear() +
				"-" +
				String(startDate.getMonth() + 1).padStart(2, "0") +
				"-" +
				String(startDate.getDate()).padStart(2, "0"),
			edate:
				endDate.getFullYear() +
				"-" +
				String(endDate.getMonth() + 1).padStart(2, "0") +
				"-" +
				String(endDate.getDate()).padStart(2, "0"),
			prevMonthEnd:
				prevMonthEndDate.getFullYear() +
				"-" +
				String(prevMonthEndDate.getMonth() + 1).padStart(2, "0") +
				"-" +
				String(prevMonthEndDate.getDate()).padStart(2, "0"),
		};
	}

	function nvlNumber(v) {
		const num = parseFloat(v);
		return isNaN(num) ? 0 : num;
	}

	function formatNumber(v) {
		return nvlNumber(v).toLocaleString("en-US");
	}

	// ============================================================
	// ✅ 메인 호출 함수
	// ============================================================
	window.call_mDashboard_vendorStockStatus = function (menuId) {
		$("#view_mDashboard_vendorStockStatus").remove();

		createDashboardLayout();

		$("#vendorStock_ym").val(getCurrentMonthYM());

		bindVendorStockEvents();
		readVendorStockDashboard();
	};

	// ============================================================
	// ✅ AJAX 조회
	// ============================================================
	function readVendorStockDashboard() {
		const ym = $("#vendorStock_ym").val() || getCurrentMonthYM();
		const range = getMonthRange(ym);

		const vendorName = ($("#vendorStock_vendorName").val() || "").trim();
		const pno = ($("#vendorStock_pno").val() || "").trim();
		const pname = ($("#vendorStock_pname").val() || "").trim();

		showLoading("data");

		$.ajax({
			url: "/read_dashboard_vendorStockStatus",
			type: "POST",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify({
				ym: ym,
				sdate: range.sdate,
				edate: range.edate,
				prevMonthEnd: range.prevMonthEnd,
				vendorName: vendorName,
				pno: pno,
				pname: pname,
			}),
			success: function (response) {
				hideLoading("data");

				if (response && response.success) {
					globalVendorStockData = response.data || [];
					totalVendorStockCount =
						response.totalCount || globalVendorStockData.length;

					renderVendorStockDashboard(globalVendorStockData);
				} else {
					globalVendorStockData = [];
					totalVendorStockCount = 0;
					renderVendorStockDashboard([]);
					alert("데이터 조회 실패");
				}
			},
			error: function (xhr, status, error) {
				hideLoading("data");
				console.error("Ajax Error:", error);
				globalVendorStockData = [];
				totalVendorStockCount = 0;
				renderVendorStockDashboard([]);
				alert("데이터 조회 중 오류 발생");
			},
		});
	}

	// ============================================================
	// ✅ 레이아웃
	// ============================================================
	function createDashboardLayout() {
		const html = `
	<div class="divBlockControl" id="view_mDashboard_vendorStockStatus">
		<div class="content-body vendorStockStatus-dashboard">
			<div id="vendorStockStatus-dashboard-wrapper">

				<!-- 검색 영역 -->
				<div class="vendorStockStatus-search-area">
					<div class="vendorStockStatus-search-row">
						<div class="vendorStockStatus-search-item">
							<label>조회월</label>
							<input type="month" id="vendorStock_ym" class="vendorStockStatus-input" />
						</div>

						<div class="vendorStockStatus-search-item">
							<label>업체명</label>
							<input type="text" id="vendorStock_vendorName" class="vendorStockStatus-input" placeholder="Vendor Name" />
						</div>

						<div class="vendorStockStatus-search-item">
							<label>P/NO</label>
							<input type="text" id="vendorStock_pno" class="vendorStockStatus-input" placeholder="P/NO" />
						</div>

						<div class="vendorStockStatus-search-item">
							<label>P/NAME</label>
							<input type="text" id="vendorStock_pname" class="vendorStockStatus-input" placeholder="P/NAME" />
						</div>

						<div class="vendorStockStatus-search-item vendorStockStatus-search-btn-wrap">
							<label>&nbsp;</label>
							<button type="button" id="vendorStock_btnSearch" class="vendorStockStatus-btn-search">조회</button>
						</div>
					</div>
				</div>

				<!-- KPI -->
				<div class="vendorStockStatus-kpi-container">
					<div class="vendorStockStatus-kpi-card vendorStockStatus-kpi-card-blue">
						<div class="vendorStockStatus-kpi-title">당월 소요량</div>
						<div id="kpi_need_qty" class="vendorStockStatus-kpi-value">0</div>
					</div>

					<div class="vendorStockStatus-kpi-card vendorStockStatus-kpi-card-cyan">
						<div class="vendorStockStatus-kpi-title">전월재고</div>
						<div id="kpi_prev_stock" class="vendorStockStatus-kpi-value">0</div>
					</div>

					<div class="vendorStockStatus-kpi-card vendorStockStatus-kpi-card-green">
						<div class="vendorStockStatus-kpi-title">당월입고</div>
						<div id="kpi_in_qty" class="vendorStockStatus-kpi-value">0</div>
					</div>

					<div class="vendorStockStatus-kpi-card vendorStockStatus-kpi-card-orange">
						<div class="vendorStockStatus-kpi-title">당월출고</div>
						<div id="kpi_out_qty" class="vendorStockStatus-kpi-value">0</div>
					</div>

					<div class="vendorStockStatus-kpi-card vendorStockStatus-kpi-card-purple">
						<div class="vendorStockStatus-kpi-title">현재재고</div>
						<div id="kpi_current_stock" class="vendorStockStatus-kpi-value">0</div>
					</div>
				</div>

				<!-- 리스트 -->
				<div class="vendorStockStatus-table-section">
					<div class="vendorStockStatus-table-header">
					<h3 class="vendorStockStatus-table-title">업체별 품목별 입고 및 소요량 현황</h3>

					<div class="vendorStockStatus-table-header-right">
						<div class="vendorStockStatus-table-count">
							총 <strong id="vendorStock_totalCount">0</strong> 건
						</div>
						<button
							type="button"
							id="vendorStock_btnExcel"
							class="vendorStockStatus-btn-excel"
						>
							엑셀 다운로드
						</button>
					</div>
				</div>

					<div class="vendorStockStatus-table-wrapper">
						<table class="vendorStockStatus-table" id="vendorStock_table">
							<thead>
								<tr>
									<th>순</th>
									<th>업체명</th>
									<th>P/NO</th>
									<th>P/NAME</th>
									<th>전월재고</th>
									<th>당월입고</th>
									<th>당월출고</th>
									<th>현재재고</th>
									<th>당월소요량</th>
									<th>비고</th>
								</tr>
							</thead>
							<tbody id="vendorStock_tbody"></tbody>
						</table>
					</div>
				</div>

			</div>
		</div>
	</div>
	`;

		$(".w_contentArea").append(html);
		$("#vendorStockStatus-dashboard-wrapper").addClass(
			"vendorStockStatus-control",
		);
		$(".w_titleArea").addClass("vendorStockStatus-control");
	}

	// ============================================================
	// ✅ 이벤트
	// ============================================================
	function bindVendorStockEvents() {
		$("#vendorStock_btnExcel")
			.off("click")
			.on("click", function () {
				downloadVendorStockExcel();
			});
		$("#vendorStock_btnSearch")
			.off("click")
			.on("click", function () {
				readVendorStockDashboard();
			});

		$("#vendorStock_ym")
			.off("change")
			.on("change", function () {
				// readVendorStockDashboard();
			});

		$("#vendorStock_vendorName, #vendorStock_pno, #vendorStock_pname")
			.off("keydown")
			.on("keydown", function (e) {
				if (e.key === "Enter") {
					readVendorStockDashboard();
				}
			});
	}

	// ============================================================
	// ✅ 전체 렌더링
	// ============================================================
	function renderVendorStockDashboard(data) {
		updateVendorStockKpi(data || []);
		renderVendorNeedChart(data || []);
		renderVendorSummaryChart(data || []);
		renderVendorStockTable(data || []);
	}

	// ============================================================
	// ✅ KPI
	// ============================================================
	function updateVendorStockKpi(data) {
		const totalNeedQty = data.reduce(
			(acc, item) => acc + nvlNumber(item.NEED_QTY),
			0,
		);
		const totalPrevStock = data.reduce(
			(acc, item) => acc + nvlNumber(item.PREV_STOCK),
			0,
		);
		const totalInQty = data.reduce(
			(acc, item) => acc + nvlNumber(item.IN_QTY),
			0,
		);
		const totalOutQty = data.reduce(
			(acc, item) => acc + nvlNumber(item.OUT_QTY),
			0,
		);
		const totalCurrentStock = data.reduce(
			(acc, item) => acc + nvlNumber(item.CURRENT_STOCK),
			0,
		);

		$("#kpi_need_qty").text(formatNumber(totalNeedQty));
		$("#kpi_prev_stock").text(formatNumber(totalPrevStock));
		$("#kpi_in_qty").text(formatNumber(totalInQty));
		$("#kpi_out_qty").text(formatNumber(totalOutQty));
		$("#kpi_current_stock").text(formatNumber(totalCurrentStock));
		$("#vendorStock_totalCount").text(
			(data || []).length.toLocaleString("en-US"),
		);
	}

	// ============================================================
	// ✅ 차트 1 : 업체별 소요량
	// ============================================================
	function renderVendorNeedChart(data) {
		const vendorMap = {};

		data.forEach((item) => {
			const vendorName = item.VENDOR_NAME || "Unknown";
			if (!vendorMap[vendorName]) {
				vendorMap[vendorName] = 0;
			}
			vendorMap[vendorName] += nvlNumber(item.NEED_QTY);
		});

		const labels = Object.keys(vendorMap).sort(
			(a, b) => vendorMap[b] - vendorMap[a],
		);
		const values = labels.map((label) => vendorMap[label]);

		if (needChartInstance) {
			needChartInstance.destroy();
			needChartInstance = null;
		}

		const canvas = document.getElementById("vendorNeedChart");
		if (!canvas) return;

		const ctx = canvas.getContext("2d");

		needChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: labels,
				datasets: [
					{
						label: "당월 소요량",
						data: values,
						backgroundColor: "#3b82f6",
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								return (
									"소요량: " +
									formatNumber(context.parsed.y || 0)
								);
							},
						},
					},
				},
				scales: {
					x: {
						ticks: {
							autoSkip: false,
							maxRotation: 45,
							minRotation: 0,
						},
					},
					y: {
						beginAtZero: true,
						ticks: {
							callback: function (value) {
								return formatNumber(value);
							},
						},
					},
				},
			},
		});
	}

	// ============================================================
	// ✅ 차트 2 : 전체 요약
	// ============================================================
	function renderVendorSummaryChart(data) {
		const totalPrevStock = data.reduce(
			(acc, item) => acc + nvlNumber(item.PREV_STOCK),
			0,
		);
		const totalInQty = data.reduce(
			(acc, item) => acc + nvlNumber(item.IN_QTY),
			0,
		);
		const totalOutQty = data.reduce(
			(acc, item) => acc + nvlNumber(item.OUT_QTY),
			0,
		);
		const totalCurrentStock = data.reduce(
			(acc, item) => acc + nvlNumber(item.CURRENT_STOCK),
			0,
		);

		if (summaryChartInstance) {
			summaryChartInstance.destroy();
			summaryChartInstance = null;
		}

		const canvas = document.getElementById("vendorSummaryChart");
		if (!canvas) return;

		const ctx = canvas.getContext("2d");

		summaryChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: ["전월재고", "당월입고", "당월출고", "현재재고"],
				datasets: [
					{
						label: "수량",
						data: [
							totalPrevStock,
							totalInQty,
							totalOutQty,
							totalCurrentStock,
						],
						backgroundColor: [
							"#06b6d4",
							"#10b981",
							"#f59e0b",
							"#8b5cf6",
						],
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								return (
									"수량: " +
									formatNumber(context.parsed.y || 0)
								);
							},
						},
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							callback: function (value) {
								return formatNumber(value);
							},
						},
					},
				},
			},
		});
	}

	// ============================================================
	// ✅ 리스트
	// ============================================================
	function renderVendorStockTable(data) {
		const $tbody = $("#vendorStock_tbody");
		$tbody.empty();

		if (!data || data.length === 0) {
			$tbody.append(`
				<tr>
					<td colspan="10" style="text-align:center; padding:40px 0;">
						조회된 데이터가 없습니다.
					</td>
				</tr>
			`);
			return;
		}

		let html = "";

		data.forEach((item, index) => {
			html += `
				<tr>
					<td class="vendorStockStatus-text-center">${item.ROW_NUM || index + 1}</td>
					<td>${item.VENDOR_NAME || ""}</td>
					<td>${item.PNO || ""}</td>
					<td>${item.PNAME || ""}</td>
					<td class="vendorStockStatus-text-right">${formatNumber(item.PREV_STOCK)}</td>
					<td class="vendorStockStatus-text-right">${formatNumber(item.IN_QTY)}</td>
					<td class="vendorStockStatus-text-right">${formatNumber(item.OUT_QTY)}</td>
					<td class="vendorStockStatus-text-right">${formatNumber(item.CURRENT_STOCK)}</td>
					<td class="vendorStockStatus-text-right">${formatNumber(item.NEED_QTY)}</td>
					<td>${item.REMARK || ""}</td>
				</tr>
			`;
		});

		$tbody.append(html);
	}

	function downloadVendorStockExcel() {
		if (!globalVendorStockData || globalVendorStockData.length === 0) {
			alert("다운로드할 데이터가 없습니다.");
			return;
		}

		const headers = [
			"순",
			"업체명",
			"P/NO",
			"P/NAME",
			"전월재고",
			"당월입고",
			"당월출고",
			"현재재고",
			"당월소요량",
			"비고",
		];

		const rows = globalVendorStockData.map((item, index) => [
			item.ROW_NUM || index + 1,
			item.VENDOR_NAME || "",
			item.PNO || "",
			item.PNAME || "",
			nvlNumber(item.PREV_STOCK),
			nvlNumber(item.IN_QTY),
			nvlNumber(item.OUT_QTY),
			nvlNumber(item.CURRENT_STOCK),
			nvlNumber(item.NEED_QTY),
			item.REMARK || "",
		]);

		const csvContent = [headers, ...rows]
			.map((row) =>
				row
					.map((cell) => {
						const value = cell == null ? "" : String(cell);
						return `"${value.replace(/"/g, '""')}"`;
					})
					.join(","),
			)
			.join("\n");

		const ym = $("#vendorStock_ym").val() || getCurrentMonthYM();
		const fileName = "vendorStockStatus_" + ym + ".csv";

		const blob = new Blob(["\uFEFF" + csvContent], {
			type: "text/csv;charset=utf-8;",
		});

		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", fileName);
		link.style.visibility = "hidden";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
});
