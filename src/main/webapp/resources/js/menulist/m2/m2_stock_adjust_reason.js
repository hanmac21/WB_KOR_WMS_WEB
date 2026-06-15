/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고:
 *  - 목록 row 클릭 시 상세 모달 오픈
 *  - 상세는 /read_stockCountAdjust_detail 로 조회
 *  - 조회 구분자: 클릭한 itemcode, location + 상단 검색조건(startdate, factory, storage, search location, search itemcode)
 * -------------------------------------------------------------- */

let globalStockCountAdjustData = [];
let currentStockCountAdjustPage = 1;
let stockCountAdjustItemsPerPage = 1000;
let totalStockCountAdjustCount = 0;
let totalStockCountAdjustQty = 0;
let totalStockCountAdjustPages = 0;
let total_real = 0;
let total_system = 0;

$(document).ready(function () {
	window.filteredStockCountAdjustData = [];
	window.stockCountAdjustColumns = [
		{ key: "LOCATION", header: "location" },
		{ key: "ITEMCODE", header: "itemcode" },
		{ key: "ITEMNAME", header: "itemname" },
		{ key: "SENDING", header: "sending" },
		{ key: "QTY", header: "qty" },
		{ key: "STATUS", header: "status" },
	];

	window.call_m2_stock_adjust_reason = function (menuId) {
		renderStockCountAdjustView();
	};
});

function performStockCountAdjustDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_stockCountAdjust",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentStockCountAdjustPage,
			itemsPerPage: stockCountAdjustItemsPerPage,
		}),
		contentType: "application/json",
		success: function (data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalStockCountAdjustData = data.records || data || [];
			totalStockCountAdjustCount = data.totalCount || 0;
			totalStockCountAdjustQty = data.totalQty || 0;
			totalStockCountAdjustPages = data.totalPages || 0;
			currentStockCountAdjustPage = data.currentPage || 0;
			window.filteredStockCountAdjustData = globalStockCountAdjustData;

			total_real =
				(data.totalQty_real || 0) + " / " + (data.totalCount_real || 0);
			total_system =
				(data.totalQty_system || 0) +
				" / " +
				(data.totalCount_system || 0);

			if (!$("#view_m2_stock_adjust_reason").length) {
				renderStockCountAdjustView();
			} else {
				renderStockCountAdjustTableData();
				updateStockCountAdjustTotalCount();
				updateStockCountAdjustTotalQty();
			}

			$("#stockNotScanHiddenFactory").val(
				$("#stockCountAdjust_searchVal_factory").val(),
			);
			$("#stockNotScanHiddenStorage").val(
				$("#stockCountAdjust_searchVal_storage").val(),
			);
			$("#stockNotScanHiddenDate").val(
				$("#stockCountAdjust_searchVal_fromDate").val(),
			);

			hideLoading();
		},
		error: function (xhr, status, error) {
			console.error("DB 조회 실패:", error);
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		},
	});
}

function renderStockCountAdjustView() {
	let content_output = `
		<div class="divBlockControl" id="view_m2_stock_adjust_reason">
			<div class="content-body">
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="searchVal_fromDate">${i18n.t("search.date")}</div>
							<input type="date" id="stockCountAdjust_searchVal_fromDate" />
						</div>

						<div class="search-label">
							<div class="searchVal_location">${i18n.t("search.location")}</div>
							<input type="text" id="stockCountAdjust_searchVal_location" />
						</div>

						<div class="search-label">
							<div class="searchVal_factory">${i18n.t("search.factory")}</div>
							<select id="stockCountAdjust_searchVal_factory" class="factory-select">
								<option value="WBTA">WBTA</option>
							</select>
						</div>

						<div class="search-label">
							<div class="searchVal_storage">${i18n.t("search.storage")}</div>
							<select id="stockCountAdjust_searchVal_storage"></select>
						</div>

						<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t("search.itemCode")}</div>
							<input type="text" id="stockCountAdjust_searchVal_itemcode" />
						</div>
					</div>

					<div class="search_button_area">
						<input type="hidden" id="stockNotScanHiddenFactory">
						<input type="hidden" id="stockNotScanHiddenStorage">
						<input type="hidden" id="stockNotScanHiddenDate">
						<button class="btn btn-primary btnStockCountAdjustSearch">${i18n.t("btn.search")}</button>
						<button class="btn btn-secondary btnStockCountAdjustSearchInit">${i18n.t("btn.clear")}</button>
					</div>
				</div>

				<div class="tab-container">
					<div class="tab">목록</div>
				</div>

				<div class="table-container">
					<div class="table-info">
						<span>
							${i18n.t("table.info.total")} <strong id="stockCountAdjustTotalCount"></strong> ${i18n.t("table.info.records")} |
							${i18n.t("table.info.qty")} : <strong id="stockCountAdjustTotalQty"></strong>
						</span>
					</div>

					<table class="data-table m2_stock_adjust_reason">
						<thead>
							<tr>
								<th class="noVal">${i18n.t("table.no")}</th>
								<th class="locationVal_short">${i18n.t("search.location")}</th>
								<th class="itemcodeVal">${i18n.t("search.itemCode")}</th>
								<th class="itemnameVal_short">${i18n.t("search.itemName")}</th>
								<th class="itemcodeVal">${i18n.t("search.lastjob")}</th>
								<th class="qtyVal">${i18n.t("search.qty")}</th>
								<th class="dateVal"><input type="checkbox" class="check" id="stockNotScanCheckAll">DELETE</th>
								<th class="exStatusVal">Status</th>
								<th class="reasonVal">Reason</th>
							</tr>
						</thead>
						<tbody id="stockCountAdjustTableBody"></tbody>
					</table>
				</div>
			</div>
		</div>

		<div id="modal_stockCountAdjust" class="stock-adjust-modal" style="display:none;">
			<div class="stock-adjust-modal__dim"></div>
			<div class="stock-adjust-modal__dialog">
				<div class="stock-adjust-modal__header">
					<h3>Stock Adjust Detail</h3>
					<button type="button" class="modal_stockCountAdjust_close btn btn-secondary">X</button>
				</div>

				<div class="stock-adjust-modal__summary">
					<div><strong>Date</strong> : <span id="modalStockAdjustDate"></span></div>
					<div><strong>Factory</strong> : <span id="modalStockAdjustFactory"></span></div>
					<div><strong>Storage</strong> : <span id="modalStockAdjustStorage"></span></div>
					<div><strong>Location</strong> : <span id="modalStockAdjustLocation"></span></div>
					<div><strong>ItemCode</strong> : <span id="modalStockAdjustItemcode"></span></div>
				</div>

				<div class="stock-adjust-modal__summary2">
					<div><strong>Total Count</strong> : <span id="modalStockAdjustTotalCount">0</span></div>
					<div><strong>Total Qty</strong> : <span id="modalStockAdjustTotalQty">0</span></div>
				</div>

				<div class="stock-adjust-modal__body">
					<table class="data-table stock-adjust-detail-table">
						<thead>
							<tr>
								<th class="noVal">NO</th>
								<th class="dateVal">DATE</th>
								<th class="locationVal_short">LOCATION</th>
								<th class="barcodeVal">BARCODE</th>
								<th class="itemcodeVal">ITEMCODE</th>
								<th class="itemnameVal_short">ITEMNAME</th>
								<th class="qtyVal">QTY</th>
								<th class="itemcodeVal">SENDING</th>
								<th class="memoVal">ADJUST</th>
								<th class="useynVal">USEYN</th>
								<th class="useynVal">USEYNNOW</th>
								<th class="statusVal">BARCODESCAN</th>
								<th class="statusVal">USEYNBARCODE</th>
							</tr>
						</thead>
						<tbody class="tbody_stockCountAdjust_detail"></tbody>
					</table>
				</div>
			</div>
		</div>
	`;

	$(".w_contentArea").append(content_output);

	(function () {
		const { fromDate } = getDefaultDateRange();
		$("#stockCountAdjust_searchVal_fromDate").val(fromDate);
		$("#stockNotScanHiddenDate").val(fromDate);
	})();

	renderFactoryStorage();
	renderStockCountAdjustTableData();
	renderStockCountAdjustPagination();
	bindStockCountAdjustEvents();
	updateStockCountAdjustTotalCount();
	updateStockCountAdjustTotalQty();
}

function renderFactoryStorage() {
	const factory = $("#stockCountAdjust_searchVal_factory");
	const storage = $("#stockCountAdjust_searchVal_storage");
	const savedFactory = getCookie("selectedFactory");
	const savedStorage = getCookie('selectedStorage');

	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'WBTA': ['INBOUND', 'PRODUCT', 'OUTSIDE', 'all'],
		};

		const storageList = options[factoryValue] || options[""];

		storageList.forEach((item) => {
			const text = item === "all" ? i18n.t("search.all") : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		// storage.val(storageList[0].toUpperCase());
        // DOM 렌더링 완료 후 val() 세팅
        setTimeout(() => {
			if(savedStorage === 'ILLINOIS'){
				storage.val('OUTSIDE').trigger('change');
			}else {
				storage.val(storageList[0]).trigger('change');
			}
        }, 0);

		window.autoSetStorageFields();
	}

	if (
		savedFactory &&
		factory.find(`option[value="${savedFactory}"]`).length
	) {
		factory.val(savedFactory);
	}

	updateStorageOptions(savedFactory || "");

	factory
		.off("change.stockAdjustFactory")
		.on("change.stockAdjustFactory", function () {
			updateStorageOptions($(this).val());
		});

	$("#stockNotScanHiddenFactory").val(
		$("#stockCountAdjust_searchVal_factory").val(),
	);
	$("#stockNotScanHiddenStorage").val(
		$("#stockCountAdjust_searchVal_storage").val(),
	);

	window.autoSetStorageFields();
}

function getCookie(cookieName) {
	const match = document.cookie.match(
		new RegExp("(^| )" + cookieName + "=([^;]+)"),
	);
	return match ? decodeURIComponent(match[2]) : "";
}

function updateStockCountAdjustTotalCount() {
	$("#stockCountAdjustTotalCount").text(
		Number(totalStockCountAdjustCount || 0).toLocaleString(),
	);
}

function updateStockCountAdjustTotalQty() {
	$("#stockCountAdjustTotalQty").text(
		Number(totalStockCountAdjustQty || 0).toLocaleString(),
	);
}

function renderStockCountAdjustTableData() {
	let tableBody = "";
	let totalqty = 0;

	for (let i = 0; i < globalStockCountAdjustData.length; i++) {
		const row = globalStockCountAdjustData[i];

		let location = row.LOCATION || row.location || "";
		let itemcode = row.ITEMCODE || row.itemcode || "";
		let itemname = row.ITEMNAME || row.itemname || "";
		let sending = row.SENDING || row.sending || "";
		let qtyNum = Number(row.QTY || row.qty || 0);
		let qty = qtyNum.toLocaleString();
		let factory = row.FACTORY || row.factory || "";
		let storage = row.STORAGE || row.storage || "";
		let searchDate = $("#stockCountAdjust_searchVal_fromDate").val();

		let isChecked = row.flag == 1 ? "checked" : "";
		let isDisabled = "disabled";

		let statusText = "";
		let statusClass = "";

		if (
			row.ADJUST === "ADJUSTMENT" ||
			row.adjust === "ADJUSTMENT" ||
			row.ADJUST === "LOADEXCEPTION-NOSCAN" ||
			row.adjust === "LOADEXCEPTION-NOSCAN"
		) {
			statusText = i18n.t("table.adjustment");
			statusClass = "status-waiting";
		}

		if (isDisabled === "disabled") {
			isChecked = "";
		}

		let no = i + 1;

		tableBody += `
			<tr class="modal_stockCountAdjust_open"
				data-itemcode="${escapeHtml(itemcode)}"
				data-location="${escapeHtml(location)}"
				data-factory="${escapeHtml(factory)}"
				data-storage="${escapeHtml(storage)}"
				data-startdate="${escapeHtml(searchDate)}">
				<td class="noVal">${no}</td>
				<td class="locationVal_short">${escapeHtml(location)}</td>
				<td class="itemcodeVal">${escapeHtml(itemcode)}</td>
				<td class="itemnameVal_short">${escapeHtml(itemname)}</td>
				<td class="itemcodeVal">${escapeHtml(sending)}</td>
				<td class="qtyVal">${qty}</td>
				<td class="dateVal">
					<input type="checkbox"
						   class="stockNotScanCheck"
						   data-barcode="${itemcode}_${qtyNum}"
						   ${isChecked}
						   ${isDisabled}
						   data-unique="${itemcode}_${searchDate}_${factory}_${storage}_${qtyNum}">
				</td>
				<td class="exStatusVal ${statusClass}">${statusText}</td>
				<td class="reasonVal"><input type="text" placeholder="Adjustment Reason"></td>
			</tr>
		`;

		totalqty += qtyNum;
	}

	$("#stockCountAdjustTableBody").html(tableBody);

	let all = globalStockCountAdjustData.length;
	let checked = $(".stockNotScanCheck:checked").length;
	$("#stockNotScanCheckAll").prop("checked", all === checked);

	totalStockCountAdjustQty = totalqty;
	totalStockCountAdjustCount = globalStockCountAdjustData.length;

	updateChecked();
}

function renderStockCountAdjustPagination() {
	let totalPages = Math.ceil(
		totalStockCountAdjustCount / stockCountAdjustItemsPerPage,
	);
	let paginationHtml = "";

	if (currentStockCountAdjustPage > 1) {
		paginationHtml += `<button class="stockCountAdjust-page-btn" data-page="${currentStockCountAdjustPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="stockCountAdjust-page-btn disabled">&lt;</button>`;
	}

	let startPage = Math.max(1, currentStockCountAdjustPage - 5);
	let endPage = Math.min(totalPages, currentStockCountAdjustPage + 5);

	if (startPage > 1) {
		paginationHtml += `<button class="stockCountAdjust-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	for (let i = startPage; i <= endPage; i++) {
		if (i === currentStockCountAdjustPage) {
			paginationHtml += `<button class="stockCountAdjust-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="stockCountAdjust-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="stockCountAdjust-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	if (currentStockCountAdjustPage < totalPages) {
		paginationHtml += `<button class="stockCountAdjust-page-btn" data-page="${currentStockCountAdjustPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="stockCountAdjust-page-btn disabled">&gt;</button>`;
	}

	$("#stockCountAdjustPaginationContainer").html(paginationHtml);
}

function bindStockCountAdjustEvents() {
	$(".btnStockCountAdjustSearch")
		.off("click")
		.on("click", function () {
			performStockCountAdjustSearch();
		});

	$(".btnStockCountAdjustSearchInit")
		.off("click")
		.on("click", function () {
			resetStockCountAdjustSearch();
		});

	$("#stockCountAdjustConfirmBtn")
		.off("click")
		.on("click", function () {
			realStockNotScan();
		});

	$(document)
		.off("click", ".stockCountAdjust-page-btn")
		.on("click", ".stockCountAdjust-page-btn", function () {
			if (!$(this).hasClass("disabled") && !$(this).hasClass("active")) {
				let page = parseInt($(this).data("page"));
				if (page && page > 0) {
					currentStockCountAdjustPage = page;
					let searchCriteria = getCurrentSearchCriteria();
					performStockCountAdjustDBSearch(searchCriteria);
				}
			}
		});

	$(document)
		.off(
			"click",
			"#stockCountAdjustTableBody tr.modal_stockCountAdjust_open",
		)
		.on(
			"click",
			"#stockCountAdjustTableBody tr.modal_stockCountAdjust_open",
			function (e) {
				if ($(e.target).is("input, textarea, button, select, label")) {
					return;
				}
				//openStockCountAdjustModal($(this)); 모달기능 임시 주석 0326
			},
		);

	$(document)
		.off("click", ".modal_stockCountAdjust_close, .stock-adjust-modal__dim")
		.on(
			"click",
			".modal_stockCountAdjust_close, .stock-adjust-modal__dim",
			function () {
				$("#modal_stockCountAdjust").fadeOut(200);
			},
		);

	$(document)
		.off("keydown.stockAdjustModal")
		.on("keydown.stockAdjustModal", function (e) {
			if (e.keyCode === 27) {
				$("#modal_stockCountAdjust").fadeOut(200);
			}
		});
}
function getCurrentSearchCriteria() {
	return {
		startdate: $("#stockCountAdjust_searchVal_fromDate").val(),
		enddate: $("#stockCountAdjust_searchVal_toDate").val(),
		location: $("#stockCountAdjust_searchVal_location")
			.val()
			.trim()
			.toUpperCase(),
		factory: $("#stockCountAdjust_searchVal_factory")
			.val()
			.trim()
			.toUpperCase(),
		storage: $("#stockCountAdjust_searchVal_storage")
			.val()
			.trim()
			.toUpperCase(),
		itemcode: $("#stockCountAdjust_searchVal_itemcode")
			.val()
			.trim()
			.toUpperCase(),
	};
}

function performStockCountAdjustSearch() {
	let searchCriteria = getCurrentSearchCriteria();
	currentStockCountAdjustPage = 1;
	performStockCountAdjustDBSearch(searchCriteria);
}

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const todayStr = `${year}-${month}-${day}`;

function resetStockCountAdjustSearch() {
	$("#stockCountAdjust_searchVal_fromDate").val(todayStr);
	$("#stockCountAdjust_searchVal_location").val("");
	$("#stockCountAdjust_searchVal_itemcode").val("");

	renderFactoryStorage();

	currentStockCountAdjustPage = 1;
	console.log("검색 조건이 초기화되었습니다.");
}

function formatDateToYYYYMMDD(dateStr) {
	if (!dateStr) return "";
	return dateStr.replace(/-/g, "");
}

function formatDateFromYYYYMMDD(dateStr) {
	if (!dateStr || dateStr.length !== 8) return "";
	return (
		dateStr.substring(0, 4) +
		"-" +
		dateStr.substring(4, 6) +
		"-" +
		dateStr.substring(6, 8)
	);
}

function fmtLocalDate(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${dd}`;
}

function getDefaultDateRange() {
	const today = new Date();
	const toDate = fmtLocalDate(today);
	const fromDate = fmtLocalDate(today);
	return { fromDate, toDate };
}

window.changeStockCountAdjustItemsPerPage = function (newItemsPerPage) {
	stockCountAdjustItemsPerPage = newItemsPerPage;
	currentStockCountAdjustPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performStockCountAdjustDBSearch(searchCriteria);
};

window.exportStockCountAdjustData = function () {
	return {
		total: globalStockCountAdjustData.length,
		currentPage: currentStockCountAdjustPage,
		itemsPerPage: stockCountAdjustItemsPerPage,
		data: globalStockCountAdjustData,
	};
};

window.downloadAllStockCountAdjustData = function () {
	let searchCriteria = {
		startdate: $("#stockCountAdjust_searchVal_fromDate").val(),
		location: $("#stockCountAdjust_searchVal_location")
			.val()
			.trim()
			.toUpperCase(),
		factory: $("#stockCountAdjust_searchVal_factory")
			.val()
			.trim()
			.toUpperCase(),
		storage: $("#stockCountAdjust_searchVal_storage")
			.val()
			.trim()
			.toUpperCase(),
		itemcode: $("#stockCountAdjust_searchVal_itemcode")
			.val()
			.trim()
			.toUpperCase(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_stockCountAdjust_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
		}),
		contentType: "application/json",
		success: function (data) {
			data.forEach((row) => {
				if (
					row.ADJUST === "ADJUSTMENT" ||
					row.ADJUST === "LOADEXCEPTION-NOSCAN" ||
					row.adjust === "ADJUSTMENT" ||
					row.adjust === "LOADEXCEPTION-NOSCAN"
				) {
					row.STATUS = i18n.t("table.adjustment");
				} else {
					row.STATUS = "";
				}
			});

			ExcelExporter.downloadExcel(data, window.stockCountAdjustColumns, {
				fileName: "StockCountAdjust_All",
				sheetName: "StockCountAdjust",
			});
			hideLoading();
		},
		error: function () {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		},
	});
};

function openStockCountAdjustModal($row) {
	const searchCriteria = getCurrentSearchCriteria();

	const detailParam = {
		startdate: searchCriteria.startdate,
		factory: searchCriteria.factory,
		storage: searchCriteria.storage,
		searchLocation: searchCriteria.location,
		searchItemcode: searchCriteria.itemcode,
		location: ($row.data("location") || "").toString().trim().toUpperCase(),
		itemcode: ($row.data("itemcode") || "").toString().trim().toUpperCase(),
	};

	$("#modalStockAdjustDate").text(detailParam.startdate || "");
	$("#modalStockAdjustFactory").text(detailParam.factory || "");
	$("#modalStockAdjustStorage").text(detailParam.storage || "");
	$("#modalStockAdjustLocation").text(detailParam.location || "");
	$("#modalStockAdjustItemcode").text(detailParam.itemcode || "");
	$("#modalStockAdjustTotalCount").text("0");
	$("#modalStockAdjustTotalQty").text("0");

	$(".tbody_stockCountAdjust_detail").html(
		`<tr><td colspan="13" style="text-align:center;">Loading...</td></tr>`,
	);

	$("#modal_stockCountAdjust").fadeIn(200);
	stockCountAdjustDetail(detailParam);
}

function stockCountAdjustDetail(detailParam) {
	showLoading("data");

	$.ajax({
		url: "/read_stockCountAdjust_detail",
		type: "POST",
		data: JSON.stringify(detailParam),
		contentType: "application/json",
		success: function (data) {
			const rows = data.records || data || [];
			let tbody = "";
			let totalQty = 0;

			if (!rows.length) {
				tbody = `<tr><td colspan="13" style="text-align:center;">No data</td></tr>`;
			} else {
				for (let i = 0; i < rows.length; i++) {
					const row = rows[i];

					const indate = row.INDATE || row.indate || "";
					const location = row.LOCATION || row.location || "";
					const barcode = row.BARCODE || row.barcode || "";
					const itemcode = row.ITEMCODE || row.itemcode || "";
					const itemname = row.ITEMNAME || row.itemname || "";
					const qty = Number(row.QTY || row.qty || 0);
					const sending = row.SENDING || row.sending || "";
					const adjust = row.ADJUST || row.adjust || "";
					const useyn = row.USEYN || row.useyn || "";
					const useynnow = row.USEYNNOW || row.useynnow || "";
					const barcodescan =
						row.BARCODESCAN || row.barcodescan || "";
					const useynbarcode =
						row.USEYNBARCODE || row.useynbarcode || "";

					totalQty += qty;

					tbody += `
						<tr>
							<td class="noVal">${i + 1}</td>
							<td class="dateVal">${escapeHtml(indate)}</td>
							<td class="locationVal_short">${escapeHtml(location)}</td>
							<td class="barcodeVal">${escapeHtml(barcode)}</td>
							<td class="itemcodeVal">${escapeHtml(itemcode)}</td>
							<td class="itemnameVal_short">${escapeHtml(itemname)}</td>
							<td class="qtyVal">${qty.toLocaleString()}</td>
							<td class="itemcodeVal">${escapeHtml(sending)}</td>
							<td class="memoVal">${escapeHtml(adjust)}</td>
							<td class="useynVal">${escapeHtml(useyn)}</td>
							<td class="useynVal">${escapeHtml(useynnow)}</td>
							<td class="statusVal">${escapeHtml(barcodescan)}</td>
							<td class="statusVal">${escapeHtml(useynbarcode)}</td>
						</tr>
					`;
				}
			}

			$(".tbody_stockCountAdjust_detail").html(tbody);
			$("#modalStockAdjustTotalCount").text(rows.length.toLocaleString());
			$("#modalStockAdjustTotalQty").text(totalQty.toLocaleString());
			hideLoading();
		},
		error: function (xhr, status, error) {
			console.error("상세 조회 실패:", error);
			console.error(xhr.responseText);
			$(".tbody_stockCountAdjust_detail").html(
				`<tr><td colspan="13" style="text-align:center;">Error</td></tr>`,
			);
			hideLoading();
			alert("상세 조회 중 오류가 발생했습니다.");
		},
	});
}

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function realStockNotScan() {
	let barcodes = $(".stockNotScanCheck:checked")
		.map(function () {
			return $(this).data("barcode");
		})
		.get();

	let factory = $("#stockNotScanHiddenFactory").val();
	let storage = $("#stockNotScanHiddenStorage").val();
	let date = $("#stockNotScanHiddenDate").val();

	let data = {
		barcode: barcodes,
		date: date,
		factory: factory,
		storage: storage,
		loginid: $(".loginId").text(),
	};

	if (confirm("Do you want to submit the data?")) {
		$.ajax({
			url: "/realStockNotScan",
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			success: function (data) {
				if (data.success) {
					alert("Success");
				} else {
					alert("Fail");
				}
				hideLoading();
			},
			error: function (xhr, status, error) {
				window.handleAjaxError(xhr, status, error);
			},
		});
	}
}

$(document).on("change", "#stockNotScanCheckAll", function () {
	$(".stockNotScanCheck:not(:disabled)").prop(
		"checked",
		$(this).prop("checked"),
	);
	updateChecked();
});

$(document).on("change", ".stockNotScanCheck", function () {
	let all = $(".stockNotScanCheck:not(:disabled)").length;
	let checked = $(".stockNotScanCheck:checked:not(:disabled)").length;
	$("#stockNotScanCheckAll").prop("checked", all === checked);
	updateChecked();
});

function updateChecked() {
	const count = $(".stockNotScanCheck:checked").length;

	$("#checkedCount").text(count.toLocaleString());

	let totalqty = 0;
	$(".stockNotScanCheck:checked").each(function () {
		let iid = $(this).data("unique");
		let qty = (iid || "").split("_")[4] || 0;
		totalqty += Number(qty);
	});

	$("#checkedQty").text(totalqty.toLocaleString());
}

$(document).on("click", ".btnStockCountAdjustExceptionOut", function () {
	const loginid = sessionStorage.getItem("userId") || "Name Not Found";
	const sabun = getCookie("sabun");
	const iidList = [];

	$(".stockNotScanCheck:checked").each(function () {
		let iid = $(this).data("unique");
		iidList.push(iid);
	});

	if (iidList.length === 0) {
		alert(i18n.t("validation.no.select.items"));
		return;
	}

	let date = iidList[0].split("_")[1];
	const [year, month, day] = date.split("-").map(Number);
	const lastDay = new Date(year, month, 0).getDate();

	if (day == lastDay) {
		if (confirm("Do you want to adjust inventory?")) {
			showLoading("data");
			$.ajax({
				url: `/adjustment`,
				type: "POST",
				data: JSON.stringify({
					loginid: loginid,
					sabun: sabun,
					list: iidList,
					memo: "ADJUSTMENT",
				}),
				contentType: "application/json",
				success: function () {
					let searchCriteria = getCurrentSearchCriteria();
					performStockCountAdjustDBSearch(searchCriteria);
				},
				error: function (xhr, status, error) {
					window.handleAjaxError(xhr, status, error);
				},
			});
		} else {
			hideLoading();
		}
	} else {
		if (confirm("Do you want to proceed with an exception load?")) {
			showLoading("data");
			$.ajax({
				url: `/insertExcpetionOutput`,
				type: "POST",
				data: JSON.stringify({
					loginid: loginid,
					sabun: sabun,
					list: iidList,
					memo: "LOADEXCEPTION-NOSCAN",
				}),
				contentType: "application/json",
				success: function () {
					let searchCriteria = getCurrentSearchCriteria();
					performStockCountAdjustDBSearch(searchCriteria);
				},
				error: function (xhr, status, error) {
					window.handleAjaxError(xhr, status, error);
				},
			});
		} else {
			hideLoading();
		}
	}
});

function getCookie(name) {
	const cookies = document.cookie ? document.cookie.split("; ") : [];
	for (const c of cookies) {
		const [k, v] = c.split("=");
		if (k === decodeURIComponent(name)) {
			return decodeURIComponent(v || "");
		}
	}
	return null;
}
