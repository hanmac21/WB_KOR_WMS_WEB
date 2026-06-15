/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 격주(2주) 부품 소요량 대시보드
 *
 * 메뉴명: m2_PartsRequirement
 * 영어명: partsRequirement_biweekly -> PartsRequirement
 * AJAX 호출: /read_parts_requirement_biweekly_dashboard
 *
 * ✅ 계산식
 *  - 현재고(앞) = 전월재고 + 입고 - 출고 - 기타수불
 *  - 1주 현재고 = 현재고(앞) + 1주 입고 - 1주 출고 - 1주 기타수불
 *  - 1주 소요량 = 1주 출고 + 1주 기타수불
 *  - 2주 현재고 = 1주 현재고 + 2주 입고 - 2주 출고 - 2주 기타수불
 *  - 2주 소요량 = 2주 출고 + 2주 기타수불
 *
 * ✅ 표시 규칙
 *  - 출고 / 기타수불 / 소요량은 화면상 양수로 표시
 * -------------------------------------------------------------- */

let currentBiweeklyPartsDetail = [];

$(document).ready(function () {
	let globalPartsData_biweekly = {};
	let currentBiweeklySupplier = "all";
	let currentBiweeklyFactory = "all";
	let currentBiweeklyStorage = "all";

	let biweeklyTrendChartInstance = null;
	let biweeklySupplierChartInstance = null;
	let biweeklyFactoryChartInstance = null;
	let biweeklyTopPartsChartInstance = null;

	// =========================
	// ✅ 공통 숫자 유틸
	// =========================
	function n(v) {
		return Number(v || 0);
	}

	function absn(v) {
		return Math.abs(n(v));
	}

	function nf(v) {
		return Number(v || 0).toLocaleString();
	}

	// =========================
	// ✅ 한 줄 데이터 계산 보정
	// =========================
	function normalizeBiweeklyRow(item) {
		const prevStock = n(item.PREV_STOCK);

		const curIn = n(item.CUR_IN);
		const curOut = absn(item.CUR_OUT);
		const curEtc = absn(item.CUR_ETC);
		const curStock = prevStock + curIn - curOut - curEtc;

		const n1In = n(item.N1_IN);
		const n1Out = absn(item.N1_OUT);
		const n1Etc = absn(item.N1_ETC);
		const n1Req = n1Out + n1Etc;
		const n1Stock = curStock + n1In - n1Out - n1Etc;

		const n2In = n(item.N2_IN);
		const n2Out = absn(item.N2_OUT);
		const n2Etc = absn(item.N2_ETC);
		const n2Req = n2Out + n2Etc;
		const n2Stock = n1Stock + n2In - n2Out - n2Etc;

		return {
			ITEMCODE: item.ITEMCODE || "",
			ITEMNAME: item.ITEMNAME || "",

			PREV_STOCK: prevStock,

			CUR_IN: curIn,
			CUR_OUT: curOut,
			CUR_ETC: curEtc,
			CUR_STOCK: curStock,

			N1_IN: n1In,
			N1_OUT: n1Out,
			N1_ETC: n1Etc,
			N1_REQ: n1Req,
			N1_STOCK: n1Stock,

			N2_IN: n2In,
			N2_OUT: n2Out,
			N2_ETC: n2Etc,
			N2_REQ: n2Req,
			N2_STOCK: n2Stock,
		};
	}

	// =========================
	// ✅ Date -> YYYY-Www
	// =========================
	function getIsoWeekString(date) {
		const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
		const dayNum = d.getUTCDay() || 7;
		d.setUTCDate(d.getUTCDate() + 4 - dayNum);

		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

		const y = d.getUTCFullYear();
		const w = String(weekNo).padStart(2, "0");
		return `${y}-W${w}`;
	}

	// =========================
	// ✅ YYYY-Www -> 다음주 YYYY-Www
	// =========================
	function getNextIsoWeekString(weekStr) {
		const m = /^(\d{4})-W(\d{2})$/.exec(String(weekStr || "").trim());
		if (!m) return "";

		const year = parseInt(m[1], 10);
		const week = parseInt(m[2], 10);

		const jan4 = new Date(Date.UTC(year, 0, 4));
		const jan4Day = jan4.getUTCDay() || 7;

		const week1Mon = new Date(jan4);
		week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

		const start = new Date(week1Mon);
		start.setUTCDate(week1Mon.getUTCDate() + (week - 1) * 7 + 7);

		return getIsoWeekString(
			new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
		);
	}

	// =========================
	// ✅ ISO week 범위 계산
	// ※ 월~토 기준
	// =========================
	function getIsoWeekRange(weekStr) {
		const m = /^(\d{4})-W(\d{2})$/.exec(String(weekStr || "").trim());
		if (!m) return null;

		const year = parseInt(m[1], 10);
		const week = parseInt(m[2], 10);

		const jan4 = new Date(Date.UTC(year, 0, 4));
		const jan4Day = jan4.getUTCDay() || 7;

		const week1Mon = new Date(jan4);
		week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

		const start = new Date(week1Mon);
		start.setUTCDate(week1Mon.getUTCDate() + (week - 1) * 7);

		const end = new Date(start);
		end.setUTCDate(start.getUTCDate() + 5);

		const fmt = (d) => {
			const y = d.getUTCFullYear();
			const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
			const da = String(d.getUTCDate()).padStart(2, "0");
			return `${y}.${mo}.${da}`;
		};

		return {
			start: fmt(start),
			end: fmt(end),
		};
	}

	// =========================
	// ✅ 기본 주차 세팅
	// =========================
	function setDefaultBiweeklyWeek() {
		const week = getIsoWeekString(new Date());
		$("#parts_requirement_biweekly_week").val(week);
		return week;
	}

	// =========================
	// ✅ 합계 Row
	// =========================
	function buildBiweeklyTotalRow(sum) {
		return `
			<tr class="parts-total-row">
				<td colspan="3">합계</td>
				<td class="parts-text-right">${nf(sum.PREV_STOCK)}</td>
				<td class="parts-text-right">${nf(sum.CUR_IN)}</td>
				<td class="parts-text-right">${nf(sum.CUR_OUT)}</td>
				<td class="parts-text-right">${nf(sum.CUR_ETC)}</td>
				<td class="parts-text-right">${nf(sum.CUR_STOCK)}</td>

				<td class="parts-text-right">${nf(sum.N1_IN)}</td>
				<td class="parts-text-right">${nf(sum.N1_OUT)}</td>
				<td class="parts-text-right">${nf(sum.N1_ETC)}</td>
				<td class="parts-text-right">${nf(sum.N1_REQ)}</td>
				<td class="parts-text-right">${nf(sum.N1_STOCK)}</td>

				<td class="parts-text-right">${nf(sum.N2_IN)}</td>
				<td class="parts-text-right">${nf(sum.N2_OUT)}</td>
				<td class="parts-text-right">${nf(sum.N2_ETC)}</td>
				<td class="parts-text-right">${nf(sum.N2_REQ)}</td>
				<td class="parts-text-right">${nf(sum.N2_STOCK)}</td>
			</tr>
		`;
	}

	// =========================
	// ✅ 동적 헤더 생성
	// =========================
	function buildBiweeklyTableHeader(selectedWeek) {
		const nextWeek = getNextIsoWeekString(selectedWeek);
		const range1 = getIsoWeekRange(selectedWeek);
		const range2 = getIsoWeekRange(nextWeek);

		const title1 = range1 ? `${range1.start} ~ ${range1.end}` : "선택주";
		const title2 = range2 ? `${range2.start} ~ ${range2.end}` : "다음주";

		return `
			<tr>
				<th rowspan="2">No</th>
				<th rowspan="2">품번</th>
				<th rowspan="2" class="parts-col-itemname">품명</th>
				<th rowspan="2" class="parts-text-right">전월재고</th>
				<th rowspan="2" class="parts-text-right">입고</th>
				<th rowspan="2" class="parts-text-right">출고</th>
				<th rowspan="2" class="parts-text-right">기타수불</th>
				<th rowspan="2" class="parts-text-right">현재고</th>

				<th colspan="5" class="parts-week-group w1">
					<span class="parts-week-date">${title1}</span>
					<span class="parts-week-divider">·</span>
					<span class="parts-week-label">수불/소요량</span>
				</th>
				<th colspan="5" class="parts-week-group w2">
					<span class="parts-week-date">${title2}</span>
					<span class="parts-week-divider">·</span>
					<span class="parts-week-label">수불/소요량</span>
				</th>
			</tr>
			<tr>
				<th class="parts-text-right">입고</th>
				<th class="parts-text-right">출고</th>
				<th class="parts-text-right">기타수불</th>
				<th class="parts-text-right">소요량</th>
				<th class="parts-text-right">현재고</th>

				<th class="parts-text-right">입고</th>
				<th class="parts-text-right">출고</th>
				<th class="parts-text-right">기타수불</th>
				<th class="parts-text-right">소요량</th>
				<th class="parts-text-right">현재고</th>
			</tr>
		`;
	}

	// =========================
	// ✅ 메인 호출 함수
	// =========================
	window.call_mDashboard_partsRequirement_biweekly = function (menuId) {
		createBiweeklyDashboardLayout();
		showLoading("data");

		const week = setDefaultBiweeklyWeek();
		renderDashboardPartsRequirementBiweekly(week);
	};

	// =========================
	// ✅ 메인 조회
	// =========================
	function renderDashboardPartsRequirementBiweekly(week) {
		currentBiweeklySupplier = "all";
		currentBiweeklyFactory = "all";
		currentBiweeklyStorage = "all";

		$("#parts-factory-select").val("all");
		$("#parts-storage-select").val("all");
		$("#parts-number-input").val("");
		$("#parts-name-input").val("");
		$("#parts-custname-input").val("");

		if (week) {
			$("#parts_requirement_biweekly_week").val(week);
		}

		destroyAllBiweeklyCharts();
		showLoading("data");

		const nextWeek = getNextIsoWeekString(week);
		const range1 = getIsoWeekRange(week);
		const range2 = getIsoWeekRange(nextWeek);

		$(".currentText").text(
			" 현 재고 [ " +
				(range1 ? `${range1.start} ~ ${range1.end}` : "-") +
				" / " +
				(range2 ? `${range2.start} ~ ${range2.end}` : "-") +
				" ]"
		);

		$.ajax({
			url: "/read_parts_requirement_biweekly_dashboard",
			type: "POST",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify({
				week: week,
				nextWeek: nextWeek,
				supplier: currentBiweeklySupplier,
				factory: currentBiweeklyFactory,
				storage: currentBiweeklyStorage,
				partNumber: $("#parts-number-input").val(),
				partName: $("#parts-name-input").val(),
				custName: $("#parts-custname-input").val(),
			}),
			success: function (response) {
				hideLoading();
				console.log("PARTS REQUIREMENT BIWEEKLY DASHBOARD LOAD", response);

				if (response && response.success) {
					globalPartsData_biweekly = response.data || {};
					renderBiweeklyDashboard(globalPartsData_biweekly, week);
				} else {
					alert("데이터 조회 실패: " + (response ? response.message : "Unknown"));
				}
			},
			error: function (xhr, status, error) {
				hideLoading();
				console.error("Ajax Error:", error, xhr && xhr.responseText);
				alert("데이터 조회 중 오류 발생");
			},
		});
	}

	// =========================
	// ✅ 레이아웃 생성
	// =========================
	function createBiweeklyDashboardLayout() {
		const html = `
			<div class="divBlockControl" id="view_mDashboard_partsRequirement_biweekly">
				<div class="content-body dashboard-parts-requirement">
					<div id="dashboard-parts-biweekly-wrapper">

						<div class="parts-dashboard-header" style="display:none">
							<h1 class="parts-dashboard-title">
								<i class="icon-package"></i>
								격주 부품 소요량 대시보드
							</h1>
						</div>

						<div class="parts-filter-section">
							<div class="parts-filter-row">
								<div class="parts-filter-group">
									<label>주별</label>
									<input type="week" id="parts_requirement_biweekly_week" class="parts-filter-input">
								</div>

								<!-- <div class="parts-filter-group">
									<label>공장</label>
									<select id="parts-factory-select" class="parts-filter-select">
										<option value="all">전체</option>
									</select>
								</div> -->

								<!--<div class="parts-filter-group">
									<label>창고</label>
									<select id="parts-storage-select" class="parts-filter-select">
										<option value="all">전체</option>
									</select>
								</div>-->

								<div class="parts-filter-group">
									<label>품번</label>
									<input type="text" id="parts-number-input" class="parts-filter-input" placeholder="품번 입력">
								</div>

								<div class="parts-filter-group">
									<label>품명</label>
									<input type="text" id="parts-name-input" class="parts-filter-input" placeholder="품명 입력">
								</div>
							</div>

							<div class="parts-filter-buttons">
								<button class="parts-btn parts-btn-search" id="parts-btn-biweekly-search">조회</button>
								<button class="parts-btn parts-btn-reset" id="parts-btn-biweekly-reset">초기화</button>
							</div>
						</div>

						<div class="parts-chart-grid">
							<div class="parts-chart-box">
								<h2 class="parts-chart-title">주별 소요량 추이</h2>
								<canvas id="parts-biweekly-trend-chart"></canvas>
							</div>

							<div class="parts-chart-box">
								<h2 class="parts-chart-title">거래처별 비율</h2>
								<canvas id="parts-biweekly-supplier-chart"></canvas>
							</div>

							<div class="parts-chart-box">
								<h2 class="parts-chart-title">공장별 소요량</h2>
								<canvas id="parts-biweekly-factory-chart"></canvas>
							</div>

							<div class="parts-chart-box">
								<h2 class="parts-chart-title">Top 10 부품</h2>
								<canvas id="parts-biweekly-top-chart"></canvas>
							</div>
						</div>

						<div class="parts-table-container">
							<div class="parts-table-header">
								<h2 class="parts-table-title">부품 소요량 상세 내역</h2>
							</div>

							<div class="parts-table-scroll">
								<table class="parts-table">
									<thead id="parts-biweekly-thead"></thead>
									<tbody id="parts-biweekly-tbody"></tbody>
									<tfoot id="parts-biweekly-tfoot"></tfoot>
								</table>
							</div>

							<div class="parts-table-footer">
								<button id="dashboard_partsRequirement_biweekly_excel">엑셀 다운로드</button>
								<span>총 <span id="parts-biweekly-table-count">0</span>건</span>
							</div>
						</div>

					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(html);
		$("#dashboard-parts-biweekly-wrapper").addClass("dashboardControl");
		$(".w_titleArea").addClass("dashboardControl");

		bindBiweeklyFilterEvents();
	}

	// =========================
	// ✅ 필터 이벤트
	// =========================
	function bindBiweeklyFilterEvents() {
		$("#parts-btn-biweekly-search")
			.off("click")
			.on("click", function () {
				const week = $("#parts_requirement_biweekly_week").val();
				searchWithBiweeklyFilters(week);
			});

		$("#parts-btn-biweekly-reset")
			.off("click")
			.on("click", function () {
				$("#parts-number-input").val("");
				$("#parts-name-input").val("");
				$("#parts-factory-select").val("all");
				$("#parts-storage-select").val("all");
				$("#parts-custname-input").val("");

				const week = setDefaultBiweeklyWeek();
				renderDashboardPartsRequirementBiweekly(week);
			});

		$("#parts-factory-select, #parts-storage-select")
			.off("change")
			.on("change", function () {
				currentBiweeklyFactory = $("#parts-factory-select").val();
				currentBiweeklyStorage = $("#parts-storage-select").val();

				if (this.id === "parts-factory-select") {
					updateBiweeklyFilterOptions(globalPartsData_biweekly);
				}
			});

		$(".parts-filter-input")
			.off("keypress")
			.on("keypress", function (e) {
				if (e.which === 13) {
					const week = $("#parts_requirement_biweekly_week").val();
					searchWithBiweeklyFilters(week);
				}
			});

		setDefaultBiweeklyWeek();
	}

	// =========================
	// ✅ 필터 조회
	// =========================
	function searchWithBiweeklyFilters(week) {
		showLoading("data");

		const nextWeek = getNextIsoWeekString(week);
		const range1 = getIsoWeekRange(week);
		const range2 = getIsoWeekRange(nextWeek);

		$(".currentText").text(
			" 현 재고 [ " +
				(range1 ? `${range1.start} ~ ${range1.end}` : "-") +
				" / " +
				(range2 ? `${range2.start} ~ ${range2.end}` : "-") +
				" ]"
		);

		$.ajax({
			url: "/read_parts_requirement_biweekly_dashboard",
			type: "POST",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify({
				week: week,
				nextWeek: nextWeek,
				factory: currentBiweeklyFactory,
				storage: currentBiweeklyStorage,
				partNumber: $("#parts-number-input").val(),
				partName: $("#parts-name-input").val(),
				custName: $("#parts-custname-input").val(),
			}),
			success: function (response) {
				hideLoading();
				console.log("PARTS REQUIREMENT BIWEEKLY DASHBOARD SEARCH", response);

				if (response && response.success) {
					globalPartsData_biweekly = response.data || {};
					renderBiweeklyDashboard(globalPartsData_biweekly, week);
				} else {
					alert("데이터 조회 실패: " + (response ? response.message : "Unknown"));
				}
			},
			error: function (xhr, status, error) {
				hideLoading();
				console.error("Ajax Error:", error, xhr && xhr.responseText);
				alert("데이터 조회 중 오류 발생");
			},
		});
	}

	// =========================
	// ✅ 차트 전체 제거
	// =========================
	function destroyAllBiweeklyCharts() {
		if (biweeklyTrendChartInstance) {
			biweeklyTrendChartInstance.destroy();
			biweeklyTrendChartInstance = null;
		}
		if (biweeklySupplierChartInstance) {
			biweeklySupplierChartInstance.destroy();
			biweeklySupplierChartInstance = null;
		}
		if (biweeklyFactoryChartInstance) {
			biweeklyFactoryChartInstance.destroy();
			biweeklyFactoryChartInstance = null;
		}
		if (biweeklyTopPartsChartInstance) {
			biweeklyTopPartsChartInstance.destroy();
			biweeklyTopPartsChartInstance = null;
		}
	}

	// =========================
	// ✅ 대시보드 렌더링
	// =========================
	function renderBiweeklyDashboard(data, selectedWeek) {
		console.log("BIWEEKLY DASHBOARD RENDERING", data);

		if (!data || !data.detail || data.detail.length === 0) {
			currentBiweeklyPartsDetail = [];

			$("#parts-biweekly-thead").empty();
			$("#parts-biweekly-tbody")
				.empty()
				.append(
					'<tr><td colspan="18" style="text-align:center; padding:40px; color:#6c757d;">조회된 데이터가 없습니다</td></tr>'
				);

			$("#parts-biweekly-tfoot").empty();
			$("#parts-biweekly-table-count").text("0");
			destroyAllBiweeklyCharts();
			return;
		}

		updateBiweeklyFilterOptions(data);
		renderBiweeklyTrendChart(data.weekly);
		renderBiweeklySupplierChart(data.supplier);
		renderBiweeklyFactoryChart(data.factory);
		renderBiweeklyTopPartsChart(data.topParts);
		renderBiweeklyTable(data.detail, selectedWeek);
	}

	// =========================
	// ✅ 필터 옵션 갱신
	// =========================
	function updateBiweeklyFilterOptions(data) {
		const $factorySelect = $("#parts-factory-select");
		const currentFactoryValue = $factorySelect.val();

		$factorySelect.empty().append('<option value="all">전체</option>');

		if (data.factories) {
			data.factories.forEach((factory) => {
				$factorySelect.append(`<option value="${factory}">${factory}</option>`);
			});
		}

		if (
			currentFactoryValue &&
			$factorySelect.find(`option[value="${currentFactoryValue}"]`).length > 0
		) {
			$factorySelect.val(currentFactoryValue);
		} else {
			$factorySelect.val("all");
		}

		const $storageSelect = $("#parts-storage-select");
		const currentStorageValue = $storageSelect.val();
		const selectedFactory = String($factorySelect.val() || "all").toUpperCase();

		$storageSelect.empty().append('<option value="all">전체</option>');

		if (data.storages) {
			data.storages.forEach((storage) => {
				const sUpper = String(storage).toUpperCase();

				if (selectedFactory === "PUEBLA") {
					if (sUpper === "MATERIAL") {
						$storageSelect.append(`<option value="${storage}">${storage}</option>`);
					}
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

		if (
			currentStorageValue &&
			$storageSelect.find(`option[value="${currentStorageValue}"]`).length > 0
		) {
			$storageSelect.val(currentStorageValue);
		} else {
			$storageSelect.val("all");
		}
	}

	// =========================
	// ✅ 주별 소요량 추이 차트
	// =========================
	function renderBiweeklyTrendChart(weekly) {
		if (!weekly || weekly.length === 0) return;

		const labels = weekly.map((m) => m.MONTH);
		const quantities = weekly.map((m) => m.QUANTITY || 0);

		if (biweeklyTrendChartInstance) biweeklyTrendChartInstance.destroy();

		const ctx = document.getElementById("parts-biweekly-trend-chart").getContext("2d");
		biweeklyTrendChartInstance = new Chart(ctx, {
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
				plugins: {
					legend: { display: false },
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							font: { size: 10 },
							callback: function (value) {
								return Number(value).toLocaleString();
							},
						},
					},
					x: {
						ticks: { font: { size: 10 } },
					},
				},
			},
		});
	}

	// =========================
	// ✅ 거래처별 차트
	// =========================
	function renderBiweeklySupplierChart(supplier) {
		if (!supplier || supplier.length === 0) return;

		const labels = supplier.map((s) => s.SUPPLIER_NAME);
		const quantities = supplier.map((s) => s.QUANTITY || 0);

		if (biweeklySupplierChartInstance) biweeklySupplierChartInstance.destroy();

		const ctx = document.getElementById("parts-biweekly-supplier-chart").getContext("2d");
		biweeklySupplierChartInstance = new Chart(ctx, {
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
					legend: {
						position: "bottom",
						labels: { font: { size: 10 } },
					},
				},
			},
		});
	}

	// =========================
	// ✅ 공장별 차트
	// =========================
	function renderBiweeklyFactoryChart(factory) {
		if (!factory || factory.length === 0) return;

		const labels = factory.map((f) => f.FACTORY_NAME);
		const quantities = factory.map((f) => f.QUANTITY || 0);

		if (biweeklyFactoryChartInstance) biweeklyFactoryChartInstance.destroy();

		const ctx = document.getElementById("parts-biweekly-factory-chart").getContext("2d");
		biweeklyFactoryChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: labels,
				datasets: [
					{
						label: "소요량",
						data: quantities,
						backgroundColor: "#667eea",
						borderRadius: 6,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							font: { size: 10 },
							callback: function (value) {
								return Number(value).toLocaleString();
							},
						},
					},
					x: {
						ticks: { font: { size: 10 } },
					},
				},
			},
		});
	}

	// =========================
	// ✅ Top 10 부품 차트
	// =========================
	function renderBiweeklyTopPartsChart(topParts) {
		if (!topParts || topParts.length === 0) return;

		const labels = topParts.map((p) => p.PART_NAME || p.PART_NUMBER);
		const quantities = topParts.map((p) => p.QUANTITY || 0);

		if (biweeklyTopPartsChartInstance) biweeklyTopPartsChartInstance.destroy();

		const ctx = document.getElementById("parts-biweekly-top-chart").getContext("2d");
		biweeklyTopPartsChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: labels,
				datasets: [
					{
						label: "소요량",
						data: quantities,
						backgroundColor: "#764ba2",
						borderRadius: 6,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: "y",
				plugins: {
					legend: { display: false },
				},
				scales: {
					x: {
						beginAtZero: true,
						ticks: {
							font: { size: 9 },
							callback: function (value) {
								return Number(value).toLocaleString();
							},
						},
					},
					y: {
						ticks: { font: { size: 9 } },
					},
				},
			},
		});
	}

	// =========================
	// ✅ 테이블 렌더
	// =========================
	function renderBiweeklyTable(detail, selectedWeek) {
		console.log("[renderBiweeklyTable] rows=", detail ? detail.length : 0);

		const $thead = $("#parts-biweekly-thead");
		const $tbody = $("#parts-biweekly-tbody");
		const $tfoot = $("#parts-biweekly-tfoot");

		$thead.empty();
		$tbody.empty();
		$tfoot.empty();

		const normalizedDetail = (detail || []).map(normalizeBiweeklyRow);
		currentBiweeklyPartsDetail = normalizedDetail.slice();

		$thead.append(buildBiweeklyTableHeader(selectedWeek));

		if (!normalizedDetail || normalizedDetail.length === 0) {
			$tbody.append(
				'<tr><td colspan="18" style="text-align:center; padding:40px; color:#6c757d;">조회된 데이터가 없습니다</td></tr>'
			);
			$("#parts-biweekly-table-count").text("0");
			return;
		}

		const sum = {
			PREV_STOCK: 0,
			CUR_IN: 0,
			CUR_OUT: 0,
			CUR_ETC: 0,
			CUR_STOCK: 0,
			N1_IN: 0,
			N1_OUT: 0,
			N1_ETC: 0,
			N1_REQ: 0,
			N1_STOCK: 0,
			N2_IN: 0,
			N2_OUT: 0,
			N2_ETC: 0,
			N2_REQ: 0,
			N2_STOCK: 0,
		};

		normalizedDetail.forEach((item) => {
			sum.PREV_STOCK += item.PREV_STOCK;
			sum.CUR_IN += item.CUR_IN;
			sum.CUR_OUT += item.CUR_OUT;
			sum.CUR_ETC += item.CUR_ETC;
			sum.CUR_STOCK += item.CUR_STOCK;

			sum.N1_IN += item.N1_IN;
			sum.N1_OUT += item.N1_OUT;
			sum.N1_ETC += item.N1_ETC;
			sum.N1_REQ += item.N1_REQ;
			sum.N1_STOCK += item.N1_STOCK;

			sum.N2_IN += item.N2_IN;
			sum.N2_OUT += item.N2_OUT;
			sum.N2_ETC += item.N2_ETC;
			sum.N2_REQ += item.N2_REQ;
			sum.N2_STOCK += item.N2_STOCK;
		});

		$tfoot.append(buildBiweeklyTotalRow(sum));

		normalizedDetail.forEach((item, idx) => {
			const row = `
				<tr>
					<td class="parts-text-right">${idx + 1}</td>
					<td style="font-weight:600;">${item.ITEMCODE || "-"}</td>
					<td class="parts-col-itemname" title="${(item.ITEMNAME || "").replace(/"/g, "&quot;")}">${item.ITEMNAME || "-"}</td>

					<td class="parts-text-right">${nf(item.PREV_STOCK)}</td>
					<td class="parts-text-right">${nf(item.CUR_IN)}</td>
					<td class="parts-text-right">${nf(item.CUR_OUT)}</td>
					<td class="parts-text-right">${nf(item.CUR_ETC)}</td>
					<td class="parts-text-right" style="font-weight:600;">${nf(item.CUR_STOCK)}</td>

					<td class="parts-text-right">${nf(item.N1_IN)}</td>
					<td class="parts-text-right">${nf(item.N1_OUT)}</td>
					<td class="parts-text-right">${nf(item.N1_ETC)}</td>
					<td class="parts-text-right">${nf(item.N1_REQ)}</td>
					<td class="parts-text-right" style="font-weight:600;">${nf(item.N1_STOCK)}</td>

					<td class="parts-text-right">${nf(item.N2_IN)}</td>
					<td class="parts-text-right">${nf(item.N2_OUT)}</td>
					<td class="parts-text-right">${nf(item.N2_ETC)}</td>
					<td class="parts-text-right">${nf(item.N2_REQ)}</td>
					<td class="parts-text-right" style="font-weight:600;">${nf(item.N2_STOCK)}</td>
				</tr>
			`;
			$tbody.append(row);
		});

		$("#parts-biweekly-table-count").text(normalizedDetail.length);
	}
});

// =========================
// ✅ 엑셀 다운로드
// =========================
$(document).on("click", "#dashboard_partsRequirement_biweekly_excel", function () {
	if (typeof XLSX === "undefined") {
		alert("Excel 라이브러리가 로드되지 않았습니다.");
		return;
	}

	function n(v) {
		return Number(v || 0);
	}

	function absn(v) {
		return Math.abs(n(v));
	}

	function normalizeBiweeklyRow(item) {
		const prevStock = n(item.PREV_STOCK);

		const curIn = n(item.CUR_IN);
		const curOut = absn(item.CUR_OUT);
		const curEtc = absn(item.CUR_ETC);
		const curStock = prevStock + curIn - curOut - curEtc;

		const n1In = n(item.N1_IN);
		const n1Out = absn(item.N1_OUT);
		const n1Etc = absn(item.N1_ETC);
		const n1Req = n1Out + n1Etc;
		const n1Stock = curStock + n1In - n1Out - n1Etc;

		const n2In = n(item.N2_IN);
		const n2Out = absn(item.N2_OUT);
		const n2Etc = absn(item.N2_ETC);
		const n2Req = n2Out + n2Etc;
		const n2Stock = n1Stock + n2In - n2Out - n2Etc;

		return {
			ITEMCODE: item.ITEMCODE || "",
			ITEMNAME: item.ITEMNAME || "",

			PREV_STOCK: prevStock,

			CUR_IN: curIn,
			CUR_OUT: curOut,
			CUR_ETC: curEtc,
			CUR_STOCK: curStock,

			N1_IN: n1In,
			N1_OUT: n1Out,
			N1_ETC: n1Etc,
			N1_REQ: n1Req,
			N1_STOCK: n1Stock,

			N2_IN: n2In,
			N2_OUT: n2Out,
			N2_ETC: n2Etc,
			N2_REQ: n2Req,
			N2_STOCK: n2Stock,
		};
	}

	function getIsoWeekString(date) {
		const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
		const dayNum = d.getUTCDay() || 7;
		d.setUTCDate(d.getUTCDate() + 4 - dayNum);

		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

		const y = d.getUTCFullYear();
		const w = String(weekNo).padStart(2, "0");
		return `${y}-W${w}`;
	}

	function getNextIsoWeekString(weekStr) {
		const m = /^(\d{4})-W(\d{2})$/.exec(String(weekStr || "").trim());
		if (!m) return "";

		const year = parseInt(m[1], 10);
		const week = parseInt(m[2], 10);

		const jan4 = new Date(Date.UTC(year, 0, 4));
		const jan4Day = jan4.getUTCDay() || 7;

		const week1Mon = new Date(jan4);
		week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

		const start = new Date(week1Mon);
		start.setUTCDate(week1Mon.getUTCDate() + (week - 1) * 7 + 7);

		return getIsoWeekString(
			new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
		);
	}

	function getIsoWeekRange(weekStr) {
		const m = /^(\d{4})-W(\d{2})$/.exec(String(weekStr || "").trim());
		if (!m) return null;

		const year = parseInt(m[1], 10);
		const week = parseInt(m[2], 10);

		const jan4 = new Date(Date.UTC(year, 0, 4));
		const jan4Day = jan4.getUTCDay() || 7;

		const week1Mon = new Date(jan4);
		week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

		const start = new Date(week1Mon);
		start.setUTCDate(week1Mon.getUTCDate() + (week - 1) * 7);

		const end = new Date(start);
		end.setUTCDate(start.getUTCDate() + 5);

		const fmt = (d) => {
			const y = d.getUTCFullYear();
			const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
			const da = String(d.getUTCDate()).padStart(2, "0");
			return `${y}.${mo}.${da}`;
		};

		return {
			start: fmt(start),
			end: fmt(end),
		};
	}

	const selectedWeek =
		$("#parts_requirement_biweekly_week").val() || getIsoWeekString(new Date());
	const nextWeek = getNextIsoWeekString(selectedWeek);
	const range1 = getIsoWeekRange(selectedWeek);
	const range2 = getIsoWeekRange(nextWeek);

	const title1 = range1 ? `${range1.start} ~ ${range1.end}` : "선택주";
	const title2 = range2 ? `${range2.start} ~ ${range2.end}` : "다음주";

	const headerRow1 = [
		"", "", "", "", "", "", "", "",
		title1, "", "", "", "",
		title2, "", "", "", ""
	];

	const headerRow2 = [
		"", "", "", "", "", "", "", "",
		"수불 / 소요량", "", "", "", "",
		"수불 / 소요량", "", "", "", ""
	];

	const headerRow3 = [
		"No", "품번", "품명", "전월재고", "입고", "출고", "기타수불", "현재고",
		"입고", "출고", "기타수불", "소요량", "현재고",
		"입고", "출고", "기타수불", "소요량", "현재고"
	];

	const data = [];
	data.push(headerRow1);
	data.push(headerRow2);
	data.push(headerRow3);

	const normalizedDetail = (currentBiweeklyPartsDetail || []).map(normalizeBiweeklyRow);

	let sum = {
		PREV_STOCK: 0,
		CUR_IN: 0,
		CUR_OUT: 0,
		CUR_ETC: 0,
		CUR_STOCK: 0,
		N1_IN: 0,
		N1_OUT: 0,
		N1_ETC: 0,
		N1_REQ: 0,
		N1_STOCK: 0,
		N2_IN: 0,
		N2_OUT: 0,
		N2_ETC: 0,
		N2_REQ: 0,
		N2_STOCK: 0,
	};

	normalizedDetail.forEach((item) => {
		sum.PREV_STOCK += item.PREV_STOCK;
		sum.CUR_IN += item.CUR_IN;
		sum.CUR_OUT += item.CUR_OUT;
		sum.CUR_ETC += item.CUR_ETC;
		sum.CUR_STOCK += item.CUR_STOCK;

		sum.N1_IN += item.N1_IN;
		sum.N1_OUT += item.N1_OUT;
		sum.N1_ETC += item.N1_ETC;
		sum.N1_REQ += item.N1_REQ;
		sum.N1_STOCK += item.N1_STOCK;

		sum.N2_IN += item.N2_IN;
		sum.N2_OUT += item.N2_OUT;
		sum.N2_ETC += item.N2_ETC;
		sum.N2_REQ += item.N2_REQ;
		sum.N2_STOCK += item.N2_STOCK;
	});

	data.push([
		"",
		"합계",
		"",
		sum.PREV_STOCK,
		sum.CUR_IN,
		sum.CUR_OUT,
		sum.CUR_ETC,
		sum.CUR_STOCK,
		sum.N1_IN,
		sum.N1_OUT,
		sum.N1_ETC,
		sum.N1_REQ,
		sum.N1_STOCK,
		sum.N2_IN,
		sum.N2_OUT,
		sum.N2_ETC,
		sum.N2_REQ,
		sum.N2_STOCK,
	]);

	normalizedDetail.forEach((item, idx) => {
		data.push([
			idx + 1,
			item.ITEMCODE || "",
			item.ITEMNAME || "",
			item.PREV_STOCK,
			item.CUR_IN,
			item.CUR_OUT,
			item.CUR_ETC,
			item.CUR_STOCK,
			item.N1_IN,
			item.N1_OUT,
			item.N1_ETC,
			item.N1_REQ,
			item.N1_STOCK,
			item.N2_IN,
			item.N2_OUT,
			item.N2_ETC,
			item.N2_REQ,
			item.N2_STOCK,
		]);
	});

	const ws = XLSX.utils.aoa_to_sheet(data);

	ws["!merges"] = [
		{ s: { r: 0, c: 8 }, e: { r: 0, c: 12 } },
		{ s: { r: 0, c: 13 }, e: { r: 0, c: 17 } },
		{ s: { r: 1, c: 8 }, e: { r: 1, c: 12 } },
		{ s: { r: 1, c: 13 }, e: { r: 1, c: 17 } }
	];

	ws["!cols"] = [
		{ wch: 8 },
		{ wch: 18 },
		{ wch: 40 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 12 }
	];

	const range = XLSX.utils.decode_range(ws["!ref"]);

	for (let R = 3; R <= range.e.r; ++R) {
		for (let C = 3; C <= 17; ++C) {
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

	ws["!freeze"] = { xSplit: 0, ySplit: 3 };

	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "격주 부품 소요량");

	XLSX.writeFile(
		wb,
		"주별_부품_소요량_" + new Date().toISOString().slice(0, 10) + ".xlsx"
	);
});