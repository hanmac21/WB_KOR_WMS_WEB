/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Summary
 * 비고:
 *  - 화면: 서버 페이징 + 서버 정렬
 *  - 엑셀: 정렬 유지 + 전체 조회(페이징 없음)
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalStockSummaryData = [];
	let currentStockSummaryPage = 1;
	let stockSummaryItemsPerPage = 1000;

	let totalStockSummaryCount = 0;
	let totalStockSummaryQty = 0;
	let totalStockSummaryPages = 0;
	// ✅ 엑셀 다운로드용
	window.filteredStockSummaryData = [];

	// ✅ 서버 정렬 상태(기본값)
	let stockSummarySortKey = 'YMDHMS'; // 서버에서 매핑할 키(아래 매핑표 참고)
	let stockSummarySortDir = 'DESC';

	// ✅ Excel 컬럼 정의(기존 유지)
	window.stockSummaryColumns = [
		{ key: 'storage', header: 'storage' },
		{ key: 'car', header: 'car' },
		{ key: 'itemcode', header: 'itemcode' },
		{ key: 'spec', header: 'customer code' },
		{ key: 'itemname', header: 'itemname' },
		{ key: 'qty', header: 'qty' },
	];
	// =========================
	// 메인 호출
	// =========================
	window.call_mPurchase_stock_summary = function(menuId) {
		showLoading("data");

		// 초기 로딩: 공장만 세팅 + 기본 정렬 적용
		currentStockSummaryPage = 1;
		stockSummarySortKey = 'YMDHMS';
		stockSummarySortDir = 'DESC';

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';

		performStockSummaryDBSearch({  storage });
	};

	// =========================
	// DB 조회(페이징 + 정렬)
	// =========================
	function performStockSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_stockSummary",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentStockSummaryPage,
				itemsPerPage: stockSummaryItemsPerPage,
				sortKey: stockSummarySortKey,
				sortDir: stockSummarySortDir
			}),
			contentType: "application/json",
			success: function(data) {
				console.log('data');
				console.log(data);
				globalStockSummaryData = data.records || [];
				totalStockSummaryCount = data.totalCount || 0;
				totalStockSummaryQty = data.totalQty || 0;
				totalStockSummaryPages = data.totalPages || 0;
				currentStockSummaryPage = data.currentPage || 1;

				window.filteredStockSummaryData = globalStockSummaryData;

				// 첫 렌더
				if (!$('#view_mPurchase_stock_summary').length) {
					renderStockSummaryView();
				} else {
					renderStockSummaryTableData();
					renderStockSummaryPagination();
					updateStockSummaryTotalCount();
					updateStockSummaryTotalQty();
					updateStockSummarySortIcons();
				}

				hideLoading();
			},
			error: function(xhr, status, error) {
				console.error("DB 조회 실패:", error);
				hideLoading();
				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
			}
		});
	}

	// =========================
	// View 렌더
	// =========================
	function renderStockSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_stock_summary">
				<div class="content-body">

					<div class="search-area">
						<div class="search-row">

							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}</div>
								<select id="stockSummary_searchVal_storage"></select>
							</div>

							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}</div>
								<input type="text" id="stockSummary_searchVal_car" />
							</div>

							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="stockSummary_searchVal_itemcode" />
							</div>

							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}</div>
								<input type="text" id="stockSummary_searchVal_oitemcode" />
							</div>

							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="stockSummary_searchVal_itemname" />
							</div>
						</div>

						<div class="search_button_area">
							<button class="btn btn-primary btnStockSummarySearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnStockSummarySearchInit">${i18n.t('btn.clear')}</button>
						</div>
					</div>

					<div class="tab-container">
						<div class="tab">목록</div>
					</div>

					<div class="table-container">
						<div class="table-info">
							<span>${i18n.t('table.info.total')} <strong id="stockSummaryTotalCount">${totalStockSummaryCount}</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="stockSummaryCurrentPageInfo">${currentStockSummaryPage}</strong>/<strong id="stockSummaryTotalPageInfo">${totalStockSummaryPages}</strong> | 
							${i18n.t('table.info.qty')} : <strong id = "stockSummaryTotalQty"></strong>
						</span>

							<div class="action-buttons-right mPurchase_stock_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockSummaryExcelBtn" onclick="downloadAllStockSummaryData()">Excel</button>
								</div>
							</div>
						</div>

						<table class="data-table mPurchase_stock_summary">
							<thead>
								<tr>
								    <th class="noVal">${i18n.t('table.no')}<!-- NO --></th>
								
								    <th class="storageVal sortable" data-sort-key="STORAGE">
								        ${i18n.t('search.storage')}<!-- STORAGE -->
								        <span class="sort-icon" data-sort-icon="STORAGE"></span>
								    </th>
								
								    <th class="carVal sortable" data-sort-key="CAR">
								        ${i18n.t('search.car')}<!-- CAR -->
								        <span class="sort-icon" data-sort-icon="CAR"></span>
								    </th>
								
								    <th class="itemcodeVal sortable" data-sort-key="ITEMCODE">
								        ${i18n.t('search.itemCode')}<!-- ITEMCODE -->
								        <span class="sort-icon" data-sort-icon="ITEMCODE"></span>
								    </th>
								
								    <th class="cnameVal sortable" data-sort-key="SPEC">
								        ${i18n.t('search.customercode')}<!-- SPEC -->
								        <span class="sort-icon" data-sort-icon="SPEC"></span>
								    </th>
								
								    <th class="itemnameMedVal sortable" data-sort-key="ITEMNAME">
								        ${i18n.t('search.itemName')}<!-- ITEMNAME -->
								        <span class="sort-icon" data-sort-icon="ITEMNAME"></span>
								    </th>
								
								    <th class="qtyVal sortable" data-sort-key="QTY">
								        ${i18n.t('search.qty')}<!-- QTY -->
								        <span class="sort-icon" data-sort-icon="QTY"></span>
								    </th>								</tr>

							</thead>
							<tbody id="stockSummaryTableBody"></tbody>
						</table>

						<div class="pagination" id="stockSummaryPaginationContainer"></div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		renderFactoryStorage();
		renderStockSummaryTableData();
		renderStockSummaryPagination();
		bindStockSummaryEvents();
		updateStockSummaryTotalCount();
		updateStockSummaryTotalQty();
		updateStockSummarySortIcons();
	}

	// =========================
	// Factory/Storage
	// =========================
	function renderFactoryStorage() {
		const storage = $('#stockSummary_searchVal_storage');
		const savedStorage = getCookie('selectedStorage');

		storage.empty();

		let storageList = ['INBOUND',  'OUTSIDE', 'all'];

		// ILLINOIS 사용자는 OUTSIDE만 선택 가능
		if (savedStorage === 'ILLINOIS') {
			storageList = ['OUTSIDE'];
		}

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		storage.val(storageList[0]);
	}

	// =========================
	// Cookie
	// =========================
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// =========================
	// Total 표시
	// =========================
	function updateStockSummaryTotalCount() {
		$('#stockSummaryTotalCount').text(Number(totalStockSummaryCount || 0).toLocaleString());
	}

	function updateStockSummaryTotalQty() {
		$('#stockSummaryTotalQty').text(Number(totalStockSummaryQty || 0).toLocaleString());
	}

	// =========================
	// Table 렌더
	// =========================
	function renderStockSummaryTableData() {
		let tableBody = "";

		$("#stockSummaryCurrentPageInfo").text(currentStockSummaryPage);
		$("#stockSummaryTotalPageInfo").text(totalStockSummaryPages);

		for (let i = 0; i < globalStockSummaryData.length; i++) {
			let rowNumber = (currentStockSummaryPage - 1) * stockSummaryItemsPerPage + i + 1;
			let row = globalStockSummaryData[i] || {};

			tableBody += `
				<tr>
		        	<td class = "noVal">${rowNumber}</td>			
					<td class = "storageVal">${row.STROAGE || row.storage || ''}</td>				
					<td class = "carVal">${row.CAR || row.car || ''}</td>
					<td class = "itemcodeVal">${row.ITEMCODE || row.itemcode || ''}</td>
					<td class = "cnameVal">${row.SPEC || row.spec || ''}</td>
					<td class = "itemnameMedVal">${row.ITEMNAME || row.itemname || ''}</td>
					<td class = "qtyVal">${Number(row.QTY || row.qty || 0).toLocaleString()}</td>
				</tr>
			`;
		}

		$("#stockSummaryTableBody").html(tableBody);
	}

	// =========================
	// Pagination 렌더
	// =========================
	function renderStockSummaryPagination() {
		let totalPages = totalStockSummaryPages || Math.ceil(totalStockSummaryCount / stockSummaryItemsPerPage) || 1;
		let paginationHtml = "";

		if (currentStockSummaryPage > 1) {
			paginationHtml += `<button class="stockSummary-page-btn" data-page="${currentStockSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="stockSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentStockSummaryPage - 5);
		let endPage = Math.min(totalPages, currentStockSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="stockSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) paginationHtml += `<span class="page-dots">...</span>`;
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStockSummaryPage) {
				paginationHtml += `<button class="stockSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="stockSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalPages) {
			if (endPage < totalPages - 1) paginationHtml += `<span class="page-dots">...</span>`;
			paginationHtml += `<button class="stockSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		if (currentStockSummaryPage < totalPages) {
			paginationHtml += `<button class="stockSummary-page-btn" data-page="${currentStockSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="stockSummary-page-btn disabled">&gt;</button>`;
		}

		$("#stockSummaryPaginationContainer").html(paginationHtml);
	}

	// =========================
	// 정렬 아이콘 업데이트
	// =========================
	function updateStockSummarySortIcons() {
		// 전부 초기화
		$('#view_mPurchase_stock_summary thead .sort-icon').text('');

		// 현재 선택된 컬럼에만 표시
		let icon = (stockSummarySortDir === 'ASC') ? '▲' : '▼';
		$(`#view_mPurchase_stock_summary thead .sort-icon[data-sort-icon="${stockSummarySortKey}"]`).text(icon);
	}

	// =========================
	// Events
	// =========================
	function bindStockSummaryEvents() {
		$(".btnStockSummarySearch").off('click').on('click', function() {
			performStockSummarySearch();
		});

		$(".btnStockSummarySearchInit").off('click').on('click', function() {
			resetStockSummarySearch();
		});

		$(document).off('click', '.stockSummary-page-btn').on('click', '.stockSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentStockSummaryPage = page;
					let searchCriteria = getCurrentSearchCriteria();
					performStockSummaryDBSearch(searchCriteria);
				}
			}
		});

		// ✅ 헤더 정렬 클릭(서버 정렬)
		$(document).off('click', '#view_mPurchase_stock_summary thead th.sortable')
			.on('click', '#view_mPurchase_stock_summary thead th.sortable', function() {

				const clickedKey = $(this).data('sort-key');
				if (!clickedKey) return;

				if (stockSummarySortKey === clickedKey) {
					// 같은 컬럼이면 ASC/DESC 토글
					stockSummarySortDir = (stockSummarySortDir === 'ASC') ? 'DESC' : 'ASC';
				} else {
					// 다른 컬럼이면 해당 컬럼으로 변경 + 기본 DESC
					stockSummarySortKey = clickedKey;
					stockSummarySortDir = 'DESC';
				}

				currentStockSummaryPage = 1;
				updateStockSummarySortIcons();

				let searchCriteria = getCurrentSearchCriteria();
				performStockSummaryDBSearch(searchCriteria);
			});

		$('#view_mPurchase_stock_summary input[type="text"], #view_mPurchase_stock_summary input[type="date"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) performStockSummarySearch();
			});
	}

	// =========================
	// 검색조건 수집
	// =========================
	function getCurrentSearchCriteria() {
		return {
			storage: $("#stockSummary_searchVal_storage").val(),
			car: $("#stockSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#stockSummary_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#stockSummary_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#stockSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performStockSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		currentStockSummaryPage = 1;
		performStockSummaryDBSearch(searchCriteria);
	}

	function resetStockSummarySearch() {
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';

		$("#stockSummary_searchVal_car").val('');
		$("#stockSummary_searchVal_itemcode").val('');
		$("#stockSummary_searchVal_oitemcode").val('');
		$("#stockSummary_searchVal_itemname").val('');

		renderFactoryStorage();

		currentStockSummaryPage = 1;

		// 초기화 시 정렬도 기본으로
		stockSummarySortKey = 'YMDHMS';
		stockSummarySortDir = 'DESC';

		performStockSummaryDBSearch({  storage });
	}

	// =========================
	// 외부에서 페이지사이즈 변경
	// =========================
	window.changeStockSummaryItemsPerPage = function(newItemsPerPage) {
		stockSummaryItemsPerPage = newItemsPerPage;
		currentStockSummaryPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performStockSummaryDBSearch(searchCriteria);
	};

	window.exportStockSummaryData = function() {
		return {
			total: globalStockSummaryData.length,
			currentPage: currentStockSummaryPage,
			itemsPerPage: stockSummaryItemsPerPage,
			data: globalStockSummaryData
		};
	};

	// =========================
	// Excel 다운로드: 전체 조회(페이징 없음) + 정렬 적용
	// =========================
	window.downloadAllStockSummaryData = function() {
		let searchCriteria = getCurrentSearchCriteria();

		showLoading("export");

		$.ajax({
			url: "/read_stockSummary",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				excel: "Y",                 // ✅ 추가
				sortKey: stockSummarySortKey,
				sortDir: stockSummarySortDir,
				// page/itemsPerPage는 엑셀에서는 안 써도 됨
			}),
			contentType: "application/json",
			success: function(data) {
				const rows = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : data);
				ExcelExporter.downloadExcel(rows || [], window.stockSummaryColumns, {
					fileName: "StockSummary_All",
					sheetName: "StockSummary"
				});
				hideLoading();
			}
		});

	};

});
