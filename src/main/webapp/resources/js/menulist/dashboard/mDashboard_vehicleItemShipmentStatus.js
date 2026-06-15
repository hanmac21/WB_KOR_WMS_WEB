/* --------------------------------------------------------------
 * 📌 차종별 품목별 출고현황 대시보드
 * - 메뉴명: vehicleItemShipmentStatus
 * - 방식: MVC2 / AJAX
 * - 구성:
 *   1) KPI 카드 5개
 *   2) 월 조회 검색영역
 *   3) 메인 리스트
 *
 * 서버 응답 예시
 * {
 *   "success": true,
 *   "totalCount": 3,
 *   "data": [
 *     {
 *       "ROW_NUM": 1,
 *       "CAR_NAME": "AVANTE",
 *       "PNO": "P123456",
 *       "PNAME": "HEADREST COVER",
 *       "OUT_QTY": 1200,
 *       "OUT_CNT": 25,
 *       "AVG_OUT_QTY": 48,
 *       "REMARK": ""
 *     }
 *   ]
 * }
 * -------------------------------------------------------------- */

$(document).ready(function () {
	let globalVehicleItemShipmentStatusData = [];
	let totalVehicleItemShipmentStatusCount = 0;

	// ============================================================
	// ✅ 유틸
	// ============================================================
	function getCurrentMonthYM() {
		const d = new Date();
		return (
			d.getFullYear() +
			"-" +
			String(d.getMonth() + 1).padStart(2, "0")
		);
	}

	function getMonthRange(ym) {
		const parts = (ym || getCurrentMonthYM()).split("-");
		const year = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10);

		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 1);

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
	window.call_mDashboard_vehicleItemShipmentStatus = function (menuId) {
		$("#view_mDashboard_vehicleItemShipmentStatus").remove();

		createVehicleItemShipmentStatusLayout();

		$("#vehicleItemShipmentStatus_ym").val(getCurrentMonthYM());

		bindVehicleItemShipmentStatusEvents();
		readVehicleItemShipmentStatusDashboard();
	};

	// ============================================================
	// ✅ AJAX 조회
	// ============================================================
	function readVehicleItemShipmentStatusDashboard() {
		const ym = $("#vehicleItemShipmentStatus_ym").val() || getCurrentMonthYM();
		const range = getMonthRange(ym);

		const carName = ($("#vehicleItemShipmentStatus_carName").val() || "").trim();
		const pno = ($("#vehicleItemShipmentStatus_pno").val() || "").trim();
		const pname = ($("#vehicleItemShipmentStatus_pname").val() || "").trim();

		showLoading("data");

		$.ajax({
			url: "/read_dashboard_vehicleItemShipmentStatus",
			type: "POST",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify({
				ym: ym,
				sdate: range.sdate,
				edate: range.edate,
				carName: carName,
				pno: pno,
				pname: pname,
			}),
			success: function (response) {
				hideLoading("data");

				if (response && response.success) {
					globalVehicleItemShipmentStatusData = response.data || [];
					totalVehicleItemShipmentStatusCount =
						response.totalCount || globalVehicleItemShipmentStatusData.length;

					renderVehicleItemShipmentStatusDashboard(globalVehicleItemShipmentStatusData);
				} else {
					globalVehicleItemShipmentStatusData = [];
					totalVehicleItemShipmentStatusCount = 0;
					renderVehicleItemShipmentStatusDashboard([]);
					alert("데이터 조회 실패");
				}
			},
			error: function (xhr, status, error) {
				hideLoading("data");
				console.error("Ajax Error:", error);
				globalVehicleItemShipmentStatusData = [];
				totalVehicleItemShipmentStatusCount = 0;
				renderVehicleItemShipmentStatusDashboard([]);
				alert("데이터 조회 중 오류 발생");
			},
		});
	}

	// ============================================================
	// ✅ 레이아웃
	// ============================================================
	function createVehicleItemShipmentStatusLayout() {
		const html = `
	<div class="divBlockControl" id="view_mDashboard_vehicleItemShipmentStatus">
		<div class="content-body vehicleItemShipmentStatus-dashboard">
			<div id="vehicleItemShipmentStatus-dashboard-wrapper">

				<!-- 검색 영역 -->
				<div class="vehicleItemShipmentStatus-search-area">
					<div class="vehicleItemShipmentStatus-search-row">
						<div class="vehicleItemShipmentStatus-search-item">
							<label>조회월</label>
							<input type="month" id="vehicleItemShipmentStatus_ym" class="vehicleItemShipmentStatus-input" />
						</div>

						<div class="vehicleItemShipmentStatus-search-item">
							<label>차종</label>
							<input
								type="text"
								id="vehicleItemShipmentStatus_carName"
								class="vehicleItemShipmentStatus-input"
								placeholder="Car Name"
							/>
						</div>

						<div class="vehicleItemShipmentStatus-search-item">
							<label>P/NO</label>
							<input
								type="text"
								id="vehicleItemShipmentStatus_pno"
								class="vehicleItemShipmentStatus-input"
								placeholder="P/NO"
							/>
						</div>

						<div class="vehicleItemShipmentStatus-search-item">
							<label>P/NAME</label>
							<input
								type="text"
								id="vehicleItemShipmentStatus_pname"
								class="vehicleItemShipmentStatus-input"
								placeholder="P/NAME"
							/>
						</div>

						<div class="vehicleItemShipmentStatus-search-item vehicleItemShipmentStatus-search-btn-wrap">
							<label>&nbsp;</label>
							<button
								type="button"
								id="vehicleItemShipmentStatus_btnSearch"
								class="vehicleItemShipmentStatus-btn-search"
							>
								조회
							</button>
						</div>
					</div>
				</div>

				<!-- KPI -->
				<div class="vehicleItemShipmentStatus-kpi-container">
					<div class="vehicleItemShipmentStatus-kpi-card vehicleItemShipmentStatus-kpi-card-rose">
						<div class="vehicleItemShipmentStatus-kpi-title">총 출고량</div>
						<div id="vehicleItemShipmentStatus_kpi_total_out_qty" class="vehicleItemShipmentStatus-kpi-value">0</div>
					</div>

					<div class="vehicleItemShipmentStatus-kpi-card vehicleItemShipmentStatus-kpi-card-indigo">
						<div class="vehicleItemShipmentStatus-kpi-title">총 출고건수</div>
						<div id="vehicleItemShipmentStatus_kpi_total_out_cnt" class="vehicleItemShipmentStatus-kpi-value">0</div>
					</div>

					<div class="vehicleItemShipmentStatus-kpi-card vehicleItemShipmentStatus-kpi-card-emerald">
						<div class="vehicleItemShipmentStatus-kpi-title">차종 수</div>
						<div id="vehicleItemShipmentStatus_kpi_total_car_count" class="vehicleItemShipmentStatus-kpi-value">0</div>
					</div>

					<div class="vehicleItemShipmentStatus-kpi-card vehicleItemShipmentStatus-kpi-card-amber">
						<div class="vehicleItemShipmentStatus-kpi-title">품목 수</div>
						<div id="vehicleItemShipmentStatus_kpi_total_item_count" class="vehicleItemShipmentStatus-kpi-value">0</div>
					</div>

					<div class="vehicleItemShipmentStatus-kpi-card vehicleItemShipmentStatus-kpi-card-violet">
						<div class="vehicleItemShipmentStatus-kpi-title">평균 출고량</div>
						<div id="vehicleItemShipmentStatus_kpi_avg_out_qty" class="vehicleItemShipmentStatus-kpi-value">0</div>
					</div>
				</div>

				<!-- 리스트 -->
				<div class="vehicleItemShipmentStatus-table-section">
					<div class="vehicleItemShipmentStatus-table-header">
						<h3 class="vehicleItemShipmentStatus-table-title">차종별 품목별 출고 현황</h3>

						<div class="vehicleItemShipmentStatus-table-header-right">
							<div class="vehicleItemShipmentStatus-table-count">
								총 <strong id="vehicleItemShipmentStatus_totalCount">0</strong> 건
							</div>
							<button
								type="button"
								id="vehicleItemShipmentStatus_btnExcel"
								class="vehicleItemShipmentStatus-btn-excel"
							>
								엑셀 다운로드
							</button>
						</div>
					</div>

					<div class="vehicleItemShipmentStatus-table-wrapper">
						<table class="vehicleItemShipmentStatus-table" id="vehicleItemShipmentStatus_table">
							<thead>
								<tr>
									<th>순</th>
									<th>차종</th>
									<th>P/NO</th>
									<th>P/NAME</th>
									<th>당월출고량</th>
									<th>출고건수</th>
									<th>평균출고량</th>
									<th>비고</th>
								</tr>
							</thead>
							<tbody id="vehicleItemShipmentStatus_tbody"></tbody>
						</table>
					</div>
				</div>

			</div>
		</div>
	</div>
	`;

		$(".w_contentArea").append(html);
		$("#vehicleItemShipmentStatus-dashboard-wrapper").addClass(
			"vehicleItemShipmentStatus-control"
		);
		$(".w_titleArea").addClass("vehicleItemShipmentStatus-control");
	}

	// ============================================================
	// ✅ 이벤트
	// ============================================================
	function bindVehicleItemShipmentStatusEvents() {
		$("#vehicleItemShipmentStatus_btnExcel")
			.off("click")
			.on("click", function () {
				downloadVehicleItemShipmentStatusExcel();
			});
		$("#vehicleItemShipmentStatus_btnSearch")
			.off("click")
			.on("click", function () {
				readVehicleItemShipmentStatusDashboard();
			});

		$("#vehicleItemShipmentStatus_ym")
			.off("change")
			.on("change", function () {
				// readVehicleItemShipmentStatusDashboard();
			});

		$(
			"#vehicleItemShipmentStatus_carName, #vehicleItemShipmentStatus_pno, #vehicleItemShipmentStatus_pname"
		)
			.off("keydown")
			.on("keydown", function (e) {
				if (e.key === "Enter") {
					readVehicleItemShipmentStatusDashboard();
				}
			});
	}

	// ============================================================
	// ✅ 전체 렌더링
	// ============================================================
	function renderVehicleItemShipmentStatusDashboard(data) {
		updateVehicleItemShipmentStatusKpi(data || []);
		renderVehicleItemShipmentStatusTable(data || []);
	}

	// ============================================================
	// ✅ KPI
	// ============================================================
	function updateVehicleItemShipmentStatusKpi(data) {
		const totalOutQty = data.reduce(
			(acc, item) => acc + nvlNumber(item.OUT_QTY),
			0
		);

		const totalOutCnt = data.reduce(
			(acc, item) => acc + nvlNumber(item.OUT_CNT),
			0
		);

		const carSet = new Set();
		const itemSet = new Set();

		data.forEach((item) => {
			if (item.CAR_NAME) {
				carSet.add(item.CAR_NAME);
			}
			if (item.PNO) {
				itemSet.add(item.PNO);
			}
		});

		const avgOutQty =
			data.length > 0 ? totalOutQty / data.length : 0;

		$("#vehicleItemShipmentStatus_kpi_total_out_qty").text(
			formatNumber(totalOutQty)
		);
		$("#vehicleItemShipmentStatus_kpi_total_out_cnt").text(
			formatNumber(totalOutCnt)
		);
		$("#vehicleItemShipmentStatus_kpi_total_car_count").text(
			formatNumber(carSet.size)
		);
		$("#vehicleItemShipmentStatus_kpi_total_item_count").text(
			formatNumber(itemSet.size)
		);
		$("#vehicleItemShipmentStatus_kpi_avg_out_qty").text(
			formatNumber(avgOutQty.toFixed(2))
		);

		$("#vehicleItemShipmentStatus_totalCount").text(
			(data || []).length.toLocaleString("en-US")
		);
	}

	// ============================================================
	// ✅ 리스트
	// ============================================================
	function renderVehicleItemShipmentStatusTable(data) {
		const $tbody = $("#vehicleItemShipmentStatus_tbody");
		$tbody.empty();

		if (!data || data.length === 0) {
			$tbody.append(`
				<tr>
					<td colspan="8" style="text-align:center; padding:40px 0;">
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
					<td class="vehicleItemShipmentStatus-text-center">${item.ROW_NUM || index + 1}</td>
					<td>${item.CAR_NAME || ""}</td>
					<td>${item.PNO || ""}</td>
					<td>${item.PNAME || ""}</td>
					<td class="vehicleItemShipmentStatus-text-right">${formatNumber(item.OUT_QTY)}</td>
					<td class="vehicleItemShipmentStatus-text-right">${formatNumber(item.OUT_CNT)}</td>
					<td class="vehicleItemShipmentStatus-text-right">${formatNumber(item.AVG_OUT_QTY)}</td>
					<td>${item.REMARK || ""}</td>
				</tr>
			`;
		});

		$tbody.append(html);
	}
	function downloadVehicleItemShipmentStatusExcel() {
	if (
		!globalVehicleItemShipmentStatusData ||
		globalVehicleItemShipmentStatusData.length === 0
	) {
		alert("다운로드할 데이터가 없습니다.");
		return;
	}

	const headers = [
		"순",
		"차종",
		"P/NO",
		"P/NAME",
		"당월출고량",
		"출고건수",
		"평균출고량",
		"비고"
	];

	const rows = globalVehicleItemShipmentStatusData.map((item, index) => [
		item.ROW_NUM || index + 1,
		item.CAR_NAME || "",
		item.PNO || "",
		item.PNAME || "",
		nvlNumber(item.OUT_QTY),
		nvlNumber(item.OUT_CNT),
		nvlNumber(item.AVG_OUT_QTY),
		item.REMARK || ""
	]);

	const csvContent = [headers, ...rows]
		.map((row) =>
			row
				.map((cell) => {
					const value = cell == null ? "" : String(cell);
					return `"${value.replace(/"/g, '""')}"`;
				})
				.join(",")
		)
		.join("\n");

	const ym = $("#vehicleItemShipmentStatus_ym").val() || getCurrentMonthYM();
	const fileName = "vehicleItemShipmentStatus_" + ym + ".csv";

	const blob = new Blob(["\uFEFF" + csvContent], {
		type: "text/csv;charset=utf-8;"
	});

	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
});