/* ============================================================
 * CHANGELOG
 * 2026-03-12 v1.1.0
 * - 검색조건 "판정"을 source 기반(전체/수입/공정/반품/창고)으로 변경
 * - KPI 카드 클릭 시 source 자동 선택 + active 강조 + 전체 대시보드 재조회
 * - 검색조건 변경 시 KPI 카드 active 동기화
 * - 샘플데이터 제거, 실제 백엔드 AJAX 구조 기준으로 정리
 * - 대시보드 메인(summary/chart) + 1차 리스트 + 드릴다운 구조 연동
 * ============================================================ */

/* --------------------------------------------------------------
 * 📌 대시보드 - 품질 현황
 * - 1번 영역: 검색 + KPI
 * - 2번 영역: source / 귀책 / 불량형태 차트
 * - 3번 영역: 리스트
 * - 행 클릭 시 4단계 드릴다운 모달
 * -------------------------------------------------------------- */

$(document).ready(function () {
	let dashboardQualityData = {};
	let judgmentChartInstance = null;
	let responsibilityChartInstance = null;
	let vendorChartInstance = null;

	let dqDrillState = {
		level: 1,
		level1Row: null,
		level2Row: null,
		level3Row: null,
		level2List: [],
		level3List: [],
		level4List: [],
	};

	const DQ_SOURCE_MAP = {
		ALL: "전체",
		INCOMING: "수입",
		PROCESS: "공정",
		RETURN: "반품",
		STORAGE: "창고",
	};

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

	function getCurrentDashboardParams() {
		return {
			sdate: ($("#dq_date").val() || "").trim(),
			factory: ($("#dq_factory").val() || "ALL").toUpperCase(),
			source: ($("#dq_source").val() || "ALL").toUpperCase(),
		};
	}

	function getSourceLabel(source) {
		return DQ_SOURCE_MAP[(source || "ALL").toUpperCase()] || "전체";
	}

	function syncKpiActiveBySource(source) {
		const currentSource = (source || "ALL").toUpperCase();

		$(".dq-kpi-card").removeClass("active");

		if (currentSource === "INCOMING") {
			$("#dq_kpi_card_in").addClass("active");
		} else if (currentSource === "PROCESS") {
			$("#dq_kpi_card_process").addClass("active");
		} else if (currentSource === "RETURN") {
			$("#dq_kpi_card_return").addClass("active");
		} else if (currentSource === "STORAGE") {
			$("#dq_kpi_card_storage").addClass("active");
		}
	}

	function setDashboardSource(source, shouldRefresh) {
		const nextSource = (source || "ALL").toUpperCase();

		$("#dq_source").val(nextSource);
		syncKpiActiveBySource(nextSource);

		if (shouldRefresh !== false) {
			refreshDashboardQuality();
		}
	}

	window.call_mDashboard_quality = function (menuId) {
		createDashboardQualityLayout();

		$("#dq_date").val("");
		$("#dq_factory").val("ALL");
		$("#dq_source").val("ALL");

		syncKpiActiveBySource("ALL");

		loadDashboardQualityData({
			sdate: "",
			factory: "ALL",
			source: "ALL",
		});
	};

	function createDashboardQualityLayout() {
		if ($("#view_mDashboard_qualityNew").length) {
			$("#view_mDashboard_qualityNew").remove();
		}

		const html = `
			<div class="divBlockControl" id="view_mDashboard_qualityNew">
				<div class="content-body dashboard-quality-new">
					<div class="dq-wrap">

						<!-- 1번 영역 -->
						<div class="dq-section dq-top-section">
							<div class="dq-search-panel">
								<div class="dq-search-grid">
									<div class="dq-field">
										<div class="dq-label">날짜</div>
										<input type="date" id="dq_date" class="dq-input" />
									</div>

									<div class="dq-field">
										<div class="dq-label">공장</div>
										<select id="dq_factory" class="dq-select">
											<option value="ALL" selected>전체</option>
											<option value="SALTILLO">Saltillo</option>
											<option value="PUEBLA">Puebla</option>
										</select>
									</div>

									<div class="dq-field full">
										<div class="dq-label">판정</div>
										<select id="dq_source" class="dq-select">
											<option value="ALL">전체</option>
											<option value="INCOMING">수입</option>
											<option value="PROCESS">공정</option>
											<option value="RETURN">반품</option>
											<option value="STORAGE">창고</option>
										</select>
									</div>

									<div class="dq-field full">
										<button type="button" id="dq_refresh_btn" class="dq-refresh-btn">새로고침</button>
									</div>
								</div>
							</div>

							<div class="dq-kpi-grid">
								<div class="dq-kpi-card kpi-in" id="dq_kpi_card_in" data-source="INCOMING">
									<div class="dq-kpi-label">수입 총수량</div>
									<div class="dq-kpi-qty" id="dq_kpi_in_qty">0</div>
									<div class="dq-kpi-count">Count <span id="dq_kpi_in_count">0</span></div>
								</div>

								<div class="dq-kpi-card kpi-process" id="dq_kpi_card_process" data-source="PROCESS">
									<div class="dq-kpi-label">공정 총수량</div>
									<div class="dq-kpi-qty" id="dq_kpi_process_qty">0</div>
									<div class="dq-kpi-count">Count <span id="dq_kpi_process_count">0</span></div>
								</div>

								<div class="dq-kpi-card kpi-return" id="dq_kpi_card_return" data-source="RETURN">
									<div class="dq-kpi-label">반품 총수량</div>
									<div class="dq-kpi-qty" id="dq_kpi_return_qty">0</div>
									<div class="dq-kpi-count">Count <span id="dq_kpi_return_count">0</span></div>
								</div>

								<div class="dq-kpi-card kpi-warehouse" id="dq_kpi_card_storage" data-source="STORAGE">
									<div class="dq-kpi-label">창고 총수량</div>
									<div class="dq-kpi-qty" id="dq_kpi_storage_qty">0</div>
									<div class="dq-kpi-count">Count <span id="dq_kpi_storage_count">0</span></div>
								</div>
							</div>
						</div>

						<!-- 2번 영역 -->
						<div class="dq-section dq-chart-section">
							<div class="dq-chart-box">
								<div class="dq-chart-title">판정</div>
								<div class="dq-chart-canvas-wrap">
									<canvas id="dq_judgment_chart"></canvas>
								</div>
							</div>

							<div class="dq-chart-box">
								<div class="dq-chart-title">귀책</div>
								<div class="dq-chart-canvas-wrap">
									<canvas id="dq_responsibility_chart"></canvas>
								</div>
							</div>

							<div class="dq-chart-box">
								<div class="dq-chart-title">불량형태</div>
								<div class="dq-chart-canvas-wrap">
									<canvas id="dq_vendor_chart"></canvas>
								</div>
							</div>
						</div>

						<!-- 3번 영역 -->
						<div class="dq-section dq-table-section">
							<div class="dq-table-header">
								<div class="dq-table-title">품질 현황 리스트</div>
								<div class="dq-table-guide">행 클릭 시 하위 세부정보로 이동합니다.</div>
								<div class="dq-table-count">총 <span id="dq_table_total_count">0</span>건</div>
							</div>

							<div class="dq-table-scroll">
								<table class="dq-table">
									<thead>
										<tr>
											<th>No</th>
											<th>공장</th>
											<th>담당</th>
											<th>귀책사유(메인)</th>
											<th>수량</th>
											<th>OK</th>
											<th>NG</th>
											<th>총건수</th>
										</tr>
									</thead>
									<tbody id="dq_table_body"></tbody>
								</table>
							</div>
						</div>

					</div>
				</div>
			</div>

			<div id="dqDetailModal">
				<div class="dq-modal-dialog">
					<div class="dq-modal-header">
						<div>
							<div class="dq-modal-title" id="dq_modal_title">세부 내역</div>
							<div id="dq_modal_path" style="font-size:12px;color:#64748b;margin-top:6px;"></div>
						</div>
						<div style="display:flex; gap:8px; align-items:center;">
							<button type="button" class="dq-modal-close" id="dqModalBackBtn" style="display:none;">←</button>
							<button type="button" class="dq-modal-close" id="dqModalCloseBtn">×</button>
						</div>
					</div>

					<div class="dq-modal-body">
						<div class="dq-modal-info" id="dq_modal_info_wrap">
							<div class="dq-modal-info-card">
								<div class="dq-modal-info-label">공장</div>
								<div class="dq-modal-info-value" id="dq_modal_factory"></div>
							</div>
							<div class="dq-modal-info-card">
								<div class="dq-modal-info-label">담당</div>
								<div class="dq-modal-info-value" id="dq_modal_manager"></div>
							</div>
							<div class="dq-modal-info-card">
								<div class="dq-modal-info-label">메인</div>
								<div class="dq-modal-info-value" id="dq_modal_main"></div>
							</div>
							<div class="dq-modal-info-card">
								<div class="dq-modal-info-label">선택값</div>
								<div class="dq-modal-info-value" id="dq_modal_selected"></div>
							</div>
						</div>

						<div class="dq-table-scroll">
							<table class="dq-modal-table">
								<thead id="dq_modal_table_head"></thead>
								<tbody id="dq_modal_detail_body"></tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(html);
		bindDashboardQualityEvents();
	}

	function bindDashboardQualityEvents() {
		$("#dq_date, #dq_factory, #dq_source")
			.off("change")
			.on("change", function () {
				syncKpiActiveBySource($("#dq_source").val());
				refreshDashboardQuality();
			});

		$("#dq_refresh_btn")
			.off("click")
			.on("click", function () {
				syncKpiActiveBySource($("#dq_source").val());
				refreshDashboardQuality();
			});

		$(document)
			.off("click", ".dq-kpi-card")
			.on("click", ".dq-kpi-card", function () {
				const source = ($(this).data("source") || "").toString().toUpperCase();
				setDashboardSource(source, true);
			});

		$(document)
			.off("click", "#dq_table_body tr")
			.on("click", "#dq_table_body tr", function () {
				const idx = $(this).data("index");
				const row = dashboardQualityData.list[idx];
				openLevel2Modal(row);
			});

		$("#dqModalBackBtn")
			.off("click")
			.on("click", function () {
				goDrillBack();
			});

		$("#dqModalCloseBtn")
			.off("click")
			.on("click", function () {
				$("#dqDetailModal").fadeOut(150);
			});

		$(document)
			.off("click", "#dqDetailModal")
			.on("click", "#dqDetailModal", function (e) {
				if (e.target.id === "dqDetailModal") {
					$("#dqDetailModal").fadeOut(150);
				}
			});

		$(document)
			.off("keydown.dqModal")
			.on("keydown.dqModal", function (e) {
				if (e.key === "Escape") {
					$("#dqDetailModal").fadeOut(150);
				}
			});
	}

	function refreshDashboardQuality() {
		const params = getCurrentDashboardParams();
		loadDashboardQualityData(params);
	}

	function loadDashboardQualityData(params) {
		showLoading("data");

		$.ajax({
			url: "/read_quality_dashboard_main",
			type: "POST",
			data: JSON.stringify(params),
			contentType: "application/json",
			dataType: "json",
			success: function (res) {
				hideLoading();

				if (res && res.success) {
					dashboardQualityData.summary = res.summary || {};
					dashboardQualityData.judgmentChart = res.judgmentChart || [];
					dashboardQualityData.responsibilityChart = res.responsibilityChart || [];
					dashboardQualityData.vendorChart = res.vendorChart || [];

					renderDashboardQualityKPI(dashboardQualityData.summary);
					renderDashboardQualityCharts(dashboardQualityData);
					loadQualityLevel1List(params);
				} else {
					alert(res.message || "데이터 조회에 실패했습니다.");
				}
			},
			error: function (xhr, status, error) {
				hideLoading();
				if (window.handleAjaxError) {
					window.handleAjaxError(xhr, status, error);
				} else {
					alert("데이터 조회 중 오류가 발생했습니다.");
				}
			},
		});
	}

	function loadQualityLevel1List(params) {
		$.ajax({
			url: "/read_quality_dashboard_list_level1",
			type: "POST",
			data: JSON.stringify(params),
			contentType: "application/json",
			dataType: "json",
			success: function (res) {
				if (res && res.success) {
					dashboardQualityData.list = res.records || [];
					renderDashboardQualityTable(dashboardQualityData.list);
				} else {
					alert(res.message || "리스트 조회에 실패했습니다.");
				}
			},
			error: function (xhr, status, error) {
				if (window.handleAjaxError) {
					window.handleAjaxError(xhr, status, error);
				} else {
					alert("리스트 조회 중 오류가 발생했습니다.");
				}
			},
		});
	}

	function renderDashboardQualityKPI(summary) {
		$("#dq_kpi_in_qty").text(Number(summary.INQTY || summary.inQty || 0).toLocaleString());
		$("#dq_kpi_in_count").text(Number(summary.INCOUNT || summary.inCount || 0).toLocaleString());

		$("#dq_kpi_process_qty").text(Number(summary.PROCESSQTY || summary.processQty || 0).toLocaleString());
		$("#dq_kpi_process_count").text(Number(summary.PROCESSCOUNT || summary.processCount || 0).toLocaleString());

		$("#dq_kpi_return_qty").text(Number(summary.RETURNQTY || summary.returnQty || 0).toLocaleString());
		$("#dq_kpi_return_count").text(Number(summary.RETURNCOUNT || summary.returnCount || 0).toLocaleString());

		$("#dq_kpi_storage_qty").text(Number(summary.STORAGEQTY || summary.storageQty || 0).toLocaleString());
		$("#dq_kpi_storage_count").text(Number(summary.STORAGECOUNT || summary.storageCount || 0).toLocaleString());

		syncKpiActiveBySource($("#dq_source").val());
	}

	function renderDashboardQualityCharts(data) {
		renderJudgmentChart(data.judgmentChart || []);
		renderResponsibilityChart(data.responsibilityChart || []);
		renderVendorChart(data.vendorChart || []);
	}

	function renderJudgmentChart(list) {
		if (judgmentChartInstance) {
			judgmentChartInstance.destroy();
			judgmentChartInstance = null;
		}

		const ctx = document.getElementById("dq_judgment_chart").getContext("2d");

		judgmentChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: list.map((x) => x.LABEL || x.label || ""),
				datasets: [
					{
						label: "수량",
						data: list.map((x) => Number(x.QTY || x.qty || 0)),
						backgroundColor: ["#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#10b981"],
						borderRadius: 8,
						maxBarThickness: 48,
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
						ticks: { font: { size: 11 } },
					},
					x: {
						ticks: { font: { size: 11 } },
					},
				},
			},
		});
	}

	function renderResponsibilityChart(list) {
		if (responsibilityChartInstance) {
			responsibilityChartInstance.destroy();
			responsibilityChartInstance = null;
		}

		const ctx = document.getElementById("dq_responsibility_chart").getContext("2d");

		responsibilityChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: list.map((x) => x.LABEL || x.label || ""),
				datasets: [
					{
						label: "수량",
						data: list.map((x) => Number(x.QTY || x.qty || 0)),
						backgroundColor: "#10b981",
						borderRadius: 8,
						maxBarThickness: 48,
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
						ticks: { font: { size: 11 } },
					},
					x: {
						ticks: { font: { size: 11 } },
					},
				},
			},
		});
	}

	function renderVendorChart(list) {
		if (vendorChartInstance) {
			vendorChartInstance.destroy();
			vendorChartInstance = null;
		}

		const ctx = document.getElementById("dq_vendor_chart").getContext("2d");

		vendorChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: list.map((x) => x.LABEL || x.label || ""),
				datasets: [
					{
						label: "수량",
						data: list.map((x) => Number(x.QTY || x.qty || 0)),
						backgroundColor: "#f59e0b",
						borderRadius: 8,
						maxBarThickness: 48,
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
						ticks: { font: { size: 11 } },
					},
					x: {
						ticks: {
							font: { size: 10 },
							maxRotation: 35,
							minRotation: 0,
						},
					},
				},
			},
		});
	}

	function renderDashboardQualityTable(list) {
		const $tbody = $("#dq_table_body");
		$tbody.empty();

		(list || []).forEach((row, idx) => {
			const html = `
				<tr data-index="${idx}">
					<td>${idx + 1}</td>
					<td>${row.FACTORY || row.factory || ""}</td>
					<td>${row.RESPONSIBILITY || row.responsibility || ""}</td>
					<td><span class="dq-badge">${row.MAINCATEGORY || row.maincategory || ""}</span></td>
					<td class="dq-text-right">${Number(row.QTY || row.qty || 0).toLocaleString()}</td>
					<td class="dq-text-right">${Number(row.OKQTY || row.okqty || 0).toLocaleString()}</td>
					<td class="dq-text-right">${Number(row.NGQTY || row.ngqty || 0).toLocaleString()}</td>
					<td class="dq-text-right">${Number(row.TOTALCOUNT || row.totalcount || 0).toLocaleString()}</td>
				</tr>
			`;
			$tbody.append(html);
		});

		$("#dq_table_total_count").text((list || []).length.toLocaleString());
	}

	function openLevel2Modal(level1Row) {
		if (!level1Row) return;

		dqDrillState.level = 2;
		dqDrillState.level1Row = level1Row;
		dqDrillState.level2Row = null;
		dqDrillState.level3Row = null;

		updateModalHeader();

		const params = {
			...getCurrentDashboardParams(),
			responsibility: level1Row.RESPONSIBILITY || level1Row.responsibility || "",
			maincategory: level1Row.MAINCATEGORY || level1Row.maincategory || "",
		};

		showLoading("data");

		$.ajax({
			url: "/read_quality_dashboard_list_level2",
			type: "POST",
			data: JSON.stringify(params),
			contentType: "application/json",
			dataType: "json",
			success: function (res) {
				hideLoading();

				if (res && res.success) {
					dqDrillState.level2List = res.records || [];
					renderModalLevel2Table(dqDrillState.level2List);
					$("#dqDetailModal").fadeIn(150);
				} else {
					alert(res.message || "2차 리스트 조회에 실패했습니다.");
				}
			},
			error: function (xhr, status, error) {
				hideLoading();
				if (window.handleAjaxError) {
					window.handleAjaxError(xhr, status, error);
				} else {
					alert("2차 리스트 조회 중 오류가 발생했습니다.");
				}
			},
		});
	}

	function openLevel3Modal(level2Row) {
		if (!level2Row) return;

		dqDrillState.level = 3;
		dqDrillState.level2Row = level2Row;
		dqDrillState.level3Row = null;

		updateModalHeader();

		const level1 = dqDrillState.level1Row || {};

		const params = {
			...getCurrentDashboardParams(),
			responsibility: level1.RESPONSIBILITY || level1.responsibility || "",
			maincategory: level1.MAINCATEGORY || level1.maincategory || "",
			subcategory: level2Row.SUBCATEGORY || level2Row.subcategory || "",
		};

		showLoading("data");

		$.ajax({
			url: "/read_quality_dashboard_list_level3",
			type: "POST",
			data: JSON.stringify(params),
			contentType: "application/json",
			dataType: "json",
			success: function (res) {
				hideLoading();

				if (res && res.success) {
					dqDrillState.level3List = res.records || [];
					renderModalLevel3Table(dqDrillState.level3List);
				} else {
					alert(res.message || "3차 리스트 조회에 실패했습니다.");
				}
			},
			error: function (xhr, status, error) {
				hideLoading();
				if (window.handleAjaxError) {
					window.handleAjaxError(xhr, status, error);
				} else {
					alert("3차 리스트 조회 중 오류가 발생했습니다.");
				}
			},
		});
	}

	function openLevel4Modal(level3Row) {
		if (!level3Row) return;

		dqDrillState.level = 4;
		dqDrillState.level3Row = level3Row;

		updateModalHeader();

		const level1 = dqDrillState.level1Row || {};
		const level2 = dqDrillState.level2Row || {};

		const params = {
			...getCurrentDashboardParams(),
			responsibility: level1.RESPONSIBILITY || level1.responsibility || "",
			maincategory: level1.MAINCATEGORY || level1.maincategory || "",
			subcategory: level2.SUBCATEGORY || level2.subcategory || "",
			detailcategory: level3Row.DETAILCATEGORY || level3Row.detailcategory || "",
		};

		showLoading("data");

		$.ajax({
			url: "/read_quality_dashboard_list_level4",
			type: "POST",
			data: JSON.stringify(params),
			contentType: "application/json",
			dataType: "json",
			success: function (res) {
				hideLoading();

				if (res && res.success) {
					dqDrillState.level4List = res.records || [];
					renderModalLevel4Table(dqDrillState.level4List);
				} else {
					alert(res.message || "최종 상세 조회에 실패했습니다.");
				}
			},
			error: function (xhr, status, error) {
				hideLoading();
				if (window.handleAjaxError) {
					window.handleAjaxError(xhr, status, error);
				} else {
					alert("최종 상세 조회 중 오류가 발생했습니다.");
				}
			},
		});
	}

	function updateModalHeader() {
		const level1 = dqDrillState.level1Row || {};
		const level2 = dqDrillState.level2Row || {};
		const level3 = dqDrillState.level3Row || {};

		const factory = level1.FACTORY || level1.factory || "";
		const responsibility = level1.RESPONSIBILITY || level1.responsibility || "";
		const maincategory = level1.MAINCATEGORY || level1.maincategory || "";
		const subcategory = level2.SUBCATEGORY || level2.subcategory || "";
		const detailcategory = level3.DETAILCATEGORY || level3.detailcategory || "";

		$("#dq_modal_factory").text(factory);
		$("#dq_modal_manager").text(responsibility);
		$("#dq_modal_main").text(maincategory);

		if (dqDrillState.level === 2) {
			$("#dq_modal_title").text("세부 내역 - 2단계");
			$("#dq_modal_selected").text(maincategory);
			$("#dq_modal_path").text(`${responsibility} > ${maincategory}`);
			$("#dqModalBackBtn").hide();
		} else if (dqDrillState.level === 3) {
			$("#dq_modal_title").text("세부 내역 - 3단계");
			$("#dq_modal_selected").text(subcategory);
			$("#dq_modal_path").text(`${responsibility} > ${maincategory} > ${subcategory}`);
			$("#dqModalBackBtn").show();
		} else if (dqDrillState.level === 4) {
			$("#dq_modal_title").text("세부 내역 - 최종");
			$("#dq_modal_selected").text(detailcategory);
			$("#dq_modal_path").text(`${responsibility} > ${maincategory} > ${subcategory} > ${detailcategory}`);
			$("#dqModalBackBtn").show();
		}
	}

	function renderModalLevel2Table(list) {
		updateModalHeader();

		$("#dq_modal_table_head").html(`
			<tr>
				<th>No</th>
				<th>공장</th>
				<th>담당</th>
				<th>귀책사유(서브)</th>
				<th>수량</th>
				<th>OK</th>
				<th>NG</th>
				<th>총건수</th>
			</tr>
		`);

		const $tbody = $("#dq_modal_detail_body");
		$tbody.empty();

		(list || []).forEach((row, idx) => {
			const tr = `
				<tr class="dq-modal-row-level2" data-index="${idx}" style="cursor:pointer;">
					<td>${idx + 1}</td>
					<td>${row.FACTORY || ""}</td>
					<td>${row.RESPONSIBILITY || ""}</td>
					<td>${row.SUBCATEGORY || ""}</td>
					<td>${Number(row.QTY || 0).toLocaleString()}</td>
					<td>${Number(row.OKQTY || 0).toLocaleString()}</td>
					<td>${Number(row.NGQTY || 0).toLocaleString()}</td>
					<td>${Number(row.TOTALCOUNT || 0).toLocaleString()}</td>
				</tr>
			`;
			$tbody.append(tr);
		});

		$(document)
			.off("click", ".dq-modal-row-level2")
			.on("click", ".dq-modal-row-level2", function () {
				const idx = $(this).data("index");
				openLevel3Modal(dqDrillState.level2List[idx]);
			});
	}

	function renderModalLevel3Table(list) {
		updateModalHeader();

		$("#dq_modal_table_head").html(`
			<tr>
				<th>No</th>
				<th>공장</th>
				<th>담당</th>
				<th>귀책사유(디테일)</th>
				<th>수량</th>
				<th>OK</th>
				<th>NG</th>
				<th>총건수</th>
			</tr>
		`);

		const $tbody = $("#dq_modal_detail_body");
		$tbody.empty();

		(list || []).forEach((row, idx) => {
			const tr = `
				<tr class="dq-modal-row-level3" data-index="${idx}" style="cursor:pointer;">
					<td>${idx + 1}</td>
					<td>${row.FACTORY || ""}</td>
					<td>${row.RESPONSIBILITY || ""}</td>
					<td>${row.DETAILCATEGORY || ""}</td>
					<td>${Number(row.QTY || 0).toLocaleString()}</td>
					<td>${Number(row.OKQTY || 0).toLocaleString()}</td>
					<td>${Number(row.NGQTY || 0).toLocaleString()}</td>
					<td>${Number(row.TOTALCOUNT || 0).toLocaleString()}</td>
				</tr>
			`;
			$tbody.append(tr);
		});

		$(document)
			.off("click", ".dq-modal-row-level3")
			.on("click", ".dq-modal-row-level3", function () {
				const idx = $(this).data("index");
				openLevel4Modal(dqDrillState.level3List[idx]);
			});
	}

	function renderModalLevel4Table(list) {
		updateModalHeader();

		$("#dq_modal_table_head").html(`
			<tr>
				<th>No</th>
				<th>SDATE</th>
				<th>ITEMCODE</th>
				<th>ITEMNAME</th>
				<th>MAINCATEGORY</th>
				<th>SUBCATEGORY</th>
				<th>DETAILCATEGORY</th>
				<th>QTY</th>
				<th>OKQTY</th>
				<th>NGQTY</th>
				<th>JUDGMENT</th>
				<th>SOURCE</th>
				<th>SOURCE2</th>
				<th>LOGINID</th>
				<th>판정전 바코드</th>
				<th>판정후 바코드</th>
			</tr>
		`);

		const $tbody = $("#dq_modal_detail_body");
		$tbody.empty();

		(list || []).forEach((row, idx) => {
			const tr = `
				<tr>
					<td>${idx + 1}</td>
					<td>${row.SDATE || ""}</td>
					<td>${row.ITEMCODE || ""}</td>
					<td class="fixItemname">${row.ITEMNAME || ""}</td>
					<td>${row.MAINCATEGORY || ""}</td>
					<td>${row.SUBCATEGORY || ""}</td>
					<td>${row.DETAILCATEGORY || ""}</td>
					<td>${Number(row.QTY || 0).toLocaleString()}</td>
					<td>${Number(row.OKQTY || 0).toLocaleString()}</td>
					<td>${Number(row.NGQTY || 0).toLocaleString()}</td>
					<td>${row.JUDGMENT || ""}</td>
					<td>${row.SOURCE || ""}</td>
					<td>${row.SOURCE2 || ""}</td>
					<td>${row.LOGINID || ""}</td>
					<td>${row.BARCODE || ""}</td>
					<td>${row.BARCODE2 || ""}</td>
				</tr>
			`;
			$tbody.append(tr);
		});
	}

	function goDrillBack() {
		if (dqDrillState.level === 4) {
			dqDrillState.level = 3;
			renderModalLevel3Table(dqDrillState.level3List);
			return;
		}

		if (dqDrillState.level === 3) {
			dqDrillState.level = 2;
			renderModalLevel2Table(dqDrillState.level2List);
		}
	}
});