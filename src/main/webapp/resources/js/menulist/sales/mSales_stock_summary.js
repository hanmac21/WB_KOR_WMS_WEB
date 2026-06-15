/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Summary
 * 비고:
 *  - 화면: 서버 페이징 + 서버 정렬
 *  - 엑셀: 정렬 유지 + 전체 조회(페이징 없음)
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalSalesStockSummaryData = [];
	let currentSalesStockSummaryPage = 1;
	let salesStockSummaryItemsPerPage = 1000;

	let totalSalesStockSummaryCount = 0;
	let totalSalesStockSummaryQty = 0;
	let totalSalesStockSummaryErpQty = 0;
	let totalSalesStockSummaryPages = 0;
	// ✅ 엑셀 다운로드용
	window.filteredSalesStockSummaryData = [];

	// ✅ 서버 정렬 상태(기본값)
	let salesStockSummarySortKey = 'YMDHMS'; // 서버에서 매핑할 키(아래 매핑표 참고)
	let salesStockSummarySortDir = 'DESC';

	// ✅ Excel 컬럼 정의(기존 유지)
	window.salesStockSummaryColumns = [
		{ key: 'factory', header: 'factory' },
		{ key: 'car', header: 'car' },
		{ key: 'itemcode', header: 'itemcode' },
		{ key: 'spec', header: 'customer code' },
		{ key: 'itemname', header: 'itemname' },
		{ key: 'qty', header: 'qty' },
		{ key: 'noqty1', header: 'noqty1' },
		{ key: 'noqty2', header: 'noqty2' },
		{ key: 'noqty3', header: 'noqty3' },
		{ key: 'totalQty', header: 'totalQty' }
	];
	// =========================
	// 메인 호출
	// =========================
	window.call_mSales_stock_summary = function(menuId) {
		showLoading("data");

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 공장만 세팅 + 기본 정렬 적용
		currentSalesStockSummaryPage = 1;
		salesStockSummarySortKey = 'YMDHMS';
		salesStockSummarySortDir = 'DESC';

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage = 'PRODUCT';

		performSalesStockSummaryDBSearch({ factory, storage });
	};

	// =========================
	// DB 조회(페이징 + 정렬)
	// =========================
	function performSalesStockSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_salesStockSummary",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentSalesStockSummaryPage,
				itemsPerPage: salesStockSummaryItemsPerPage,
				sortKey: salesStockSummarySortKey,
				sortDir: salesStockSummarySortDir
			}),
			contentType: "application/json",
			success: function(data) {
				console.log('data');
				console.log(data);
				globalSalesStockSummaryData = data.records || [];
				totalSalesStockSummaryCount = data.totalCount || 0;
				totalSalesStockSummaryQty = data.totalQty || 0;
				totalSalesStockSummaryErpQty = data.totalErpQty || 0;
				totalSalesStockSummaryPages = data.totalPages || 0;
				currentSalesStockSummaryPage = data.currentPage || 1;

				window.filteredSalesStockSummaryData = globalSalesStockSummaryData;

				// 첫 렌더
				if (!$('#view_mSales_stock_summary').length) {
					renderSalesStockSummaryView();
				} else {
					renderSalesStockSummaryTableData();
					renderSalesStockSummaryPagination();
					updateSalesStockSummaryTotalCount();
					updateSalesStockSummaryTotalQty();
					updateSalesStockSummarySortIcons();
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
	function renderSalesStockSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mSales_stock_summary">
				<div class="content-body">

					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}</div>
								<select id="salesStockSummary_searchVal_factory">
									<option value="WBTA">WBTA</option>
								</select>
							</div>

							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}</div>
								<select id="salesStockSummary_searchVal_storage"></select>
							</div>

							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}</div>
								<input type="text" id="salesStockSummary_searchVal_car" />
							</div>

							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="salesStockSummary_searchVal_itemcode" />
							</div>

							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="salesStockSummary_searchVal_itemname" />
							</div>
						</div>

						<div class="search_button_area">
							<button class="btn btn-primary btnSalesStockSummarySearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnSalesStockSummarySearchInit">${i18n.t('btn.clear')}</button>
						</div>
					</div>

					<div class="tab-container">
						<div class="tab">목록</div>
					</div>

					<div class="table-container">
						<div class="table-info">
							<span>${i18n.t('table.info.total')} <strong id="salesStockSummaryTotalCount">${totalSalesStockSummaryCount}</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="salesStockSummaryCurrentPageInfo">${currentSalesStockSummaryPage}</strong>/<strong id="salesStockSummaryTotalPageInfo">${totalSalesStockSummaryPages}</strong> | 
							${i18n.t('table.info.qty')} : <strong id = "salesStockSummaryTotalQty"></strong> |
							SUM QTY : <strong id = "salesStockSummaryTotalERPQty"></strong>
						</span>

							<div class="action-buttons-right mSales_stock_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesStockSummaryExcelBtn" onclick="downloadAllSalesStockSummaryData()">Excel</button>
								</div>
							</div>
						</div>

						<table class="data-table mSales_stock_summary">
							<thead>
								<tr>
								    <th class="noVal">${i18n.t('table.no')}<!-- NO --></th>
								
								    <th class="factoryVal sortable" data-sort-key="FACTORY">
								        ${i18n.t('search.factory')}<!-- FACTORY -->
								        <span class="sort-icon" data-sort-icon="FACTORY"></span>
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
								    </th>
								
								    <th class="qtyVal sortable" data-sort-key="NOQTY1">
								        ${i18n.t('table.qty.inX')}<!-- NOQTY1 -->
								        <span class="sort-icon" data-sort-icon="NOQTY1"></span>
								    </th>
								
								    <th class="qtyVal sortable" data-sort-key="NOQTY2">
								        ${i18n.t('table.qty.outX')}<!-- NOQTY2 -->
								        <span class="sort-icon" data-sort-icon="NOQTY2"></span>
								    </th>
								
								    <th class="qtyVal sortable" data-sort-key="NOQTY3">
								        ${i18n.t('table.qty.outwait')}<!-- NOQTY3 -->
								        <span class="sort-icon" data-sort-icon="NOQTY3"></span>
								    </th>
								</tr>

							</thead>
							<tbody id="salesStockSummaryTableBody"></tbody>
						</table>

						<div class="pagination" id="salesStockSummaryPaginationContainer"></div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		renderFactoryStorage();
		renderSalesStockSummaryTableData();
		renderSalesStockSummaryPagination();
		bindSalesStockSummaryEvents();
		updateSalesStockSummaryTotalCount();
		updateSalesStockSummaryTotalQty();
		updateSalesStockSummarySortIcons();
	}

	// =========================
	// Factory/Storage
	// =========================
	function renderFactoryStorage() {
		const factory = $('#salesStockSummary_searchVal_factory');
		const storage = $('#salesStockSummary_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'WBTA': ['MATERIAL', 'PRODUCT', 'all'],
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			storage.val(storageList[1]);
		}

		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}
		
		updateStorageOptions(savedFactory || '');

		factory.off('change.factory').on('change.factory', function() {
			updateStorageOptions($(this).val());
			if (typeof window.autoSetStorageFields === 'function') {
				window.autoSetStorageFields();
			}
		});
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
	function updateSalesStockSummaryTotalCount() {
		$('#salesStockSummaryTotalCount').text(Number(totalSalesStockSummaryCount || 0).toLocaleString());
	}

	function updateSalesStockSummaryTotalQty() {
		$('#salesStockSummaryTotalQty').text(Number(totalSalesStockSummaryQty || 0).toLocaleString());
		$('#salesStockSummaryTotalERPQty').text(Number(totalSalesStockSummaryErpQty || 0).toLocaleString());
	}

	// =========================
	// Table 렌더
	// =========================
	function renderSalesStockSummaryTableData() {
		let tableBody = "";

		$("#salesStockSummaryCurrentPageInfo").text(currentSalesStockSummaryPage);
		$("#salesStockSummaryTotalPageInfo").text(totalSalesStockSummaryPages);

		for (let i = 0; i < globalSalesStockSummaryData.length; i++) {
			let rowNumber = (currentSalesStockSummaryPage - 1) * salesStockSummaryItemsPerPage + i + 1;
			let row = globalSalesStockSummaryData[i] || {};

			tableBody += `
				<tr>
		        	<td class = "noVal">${rowNumber}</td>
					<td class = "factoryVal">${row.FACTORY || row.factory || ''}</td>				
					<td class = "carVal">${row.CAR || row.car || ''}</td>
					<td class = "itemcodeVal">${row.ITEMCODE || row.itemcode || ''}</td>
					<td class = "cnameVal">${row.SPEC || row.spec || ''}</td>
					<td class = "itemnameMedVal">${row.ITEMNAME || row.itemname || ''}</td>
					<td class = "qtyVal">${Number(row.QTY || row.qty || 0).toLocaleString()}</td>
					<td class = "qtyVal">${Number(row.NOQTY1 || row.noqty1 || 0).toLocaleString()}</td>
					<td class = "qtyVal">${Number(row.NOQTY2 || row.noqty2 || 0).toLocaleString()}</td>
					<td class = "qtyVal">${Number(row.NOQTY3 || row.noqty3 || 0).toLocaleString()}</td>
				</tr>
			`;
		}

		$("#salesStockSummaryTableBody").html(tableBody);
	}

	// =========================
	// Pagination 렌더
	// =========================
	function renderSalesStockSummaryPagination() {
		let totalPages = totalSalesStockSummaryPages || Math.ceil(totalSalesStockSummaryCount / salesStockSummaryItemsPerPage) || 1;
		let paginationHtml = "";

		if (currentSalesStockSummaryPage > 1) {
			paginationHtml += `<button class="salesStockSummary-page-btn" data-page="${currentSalesStockSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesStockSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesStockSummaryPage - 5);
		let endPage = Math.min(totalPages, currentSalesStockSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesStockSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) paginationHtml += `<span class="page-dots">...</span>`;
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesStockSummaryPage) {
				paginationHtml += `<button class="salesStockSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesStockSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalPages) {
			if (endPage < totalPages - 1) paginationHtml += `<span class="page-dots">...</span>`;
			paginationHtml += `<button class="salesStockSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		if (currentSalesStockSummaryPage < totalPages) {
			paginationHtml += `<button class="salesStockSummary-page-btn" data-page="${currentSalesStockSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesStockSummary-page-btn disabled">&gt;</button>`;
		}

		$("#salesStockSummaryPaginationContainer").html(paginationHtml);
	}

	// =========================
	// 정렬 아이콘 업데이트
	// =========================
	function updateSalesStockSummarySortIcons() {
		// 전부 초기화
		$('#view_mSales_stock_summary thead .sort-icon').text('');

		// 현재 선택된 컬럼에만 표시
		let icon = (salesStockSummarySortDir === 'ASC') ? '▲' : '▼';
		$(`#view_mSales_stock_summary thead .sort-icon[data-sort-icon="${salesStockSummarySortKey}"]`).text(icon);
	}

	// =========================
	// Events
	// =========================
	function bindSalesStockSummaryEvents() {
		$(".btnSalesStockSummarySearch").off('click').on('click', function() {
			performSalesStockSummarySearch();
		});

		$(".btnSalesStockSummarySearchInit").off('click').on('click', function() {
			resetSalesStockSummarySearch();
		});

		$(document).off('click', '.salesStockSummary-page-btn').on('click', '.salesStockSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesStockSummaryPage = page;
					let searchCriteria = getCurrentSearchCriteria();
					performSalesStockSummaryDBSearch(searchCriteria);
				}
			}
		});

		// ✅ 헤더 정렬 클릭(서버 정렬)
		$(document).off('click', '#view_mSales_stock_summary thead th.sortable')
			.on('click', '#view_mSales_stock_summary thead th.sortable', function() {

				const clickedKey = $(this).data('sort-key');
				if (!clickedKey) return;

				if (salesStockSummarySortKey === clickedKey) {
					// 같은 컬럼이면 ASC/DESC 토글
					salesStockSummarySortDir = (salesStockSummarySortDir === 'ASC') ? 'DESC' : 'ASC';
				} else {
					// 다른 컬럼이면 해당 컬럼으로 변경 + 기본 DESC
					salesStockSummarySortKey = clickedKey;
					salesStockSummarySortDir = 'DESC';
				}

				currentSalesStockSummaryPage = 1;
				updateSalesStockSummarySortIcons();

				let searchCriteria = getCurrentSearchCriteria();
				performSalesStockSummaryDBSearch(searchCriteria);
			});

		$('#view_mSales_stock_summary input[type="text"], #view_mSales_stock_summary input[type="date"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) performSalesStockSummarySearch();
			});
	}

	// =========================
	// 검색조건 수집
	// =========================
	function getCurrentSearchCriteria() {
		return {
			factory: $("#salesStockSummary_searchVal_factory").val(),
			storage: $("#salesStockSummary_searchVal_storage").val(),
			car: $("#salesStockSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#salesStockSummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesStockSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performSalesStockSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		currentSalesStockSummaryPage = 1;
		performSalesStockSummaryDBSearch(searchCriteria);
	}

	function resetSalesStockSummarySearch() {
		const factory = getCookie('selectedFactory');
		const storage = "PRODUCT";

		$("#salesStockSummary_searchVal_car").val('');
		$("#salesStockSummary_searchVal_itemcode").val('');
		$("#salesStockSummary_searchVal_itemname").val('');

		renderFactoryStorage();

		currentSalesStockSummaryPage = 1;

		// 초기화 시 정렬도 기본으로
		salesStockSummarySortKey = 'YMDHMS';
		salesStockSummarySortDir = 'DESC';

		performSalesStockSummaryDBSearch({ factory, storage });
	}

	// =========================
	// 외부에서 페이지사이즈 변경
	// =========================
	window.changeSalesStockSummaryItemsPerPage = function(newItemsPerPage) {
		salesStockSummaryItemsPerPage = newItemsPerPage;
		currentSalesStockSummaryPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performSalesStockSummaryDBSearch(searchCriteria);
	};

	window.exportSalesStockSummaryData = function() {
		return {
			total: globalSalesStockSummaryData.length,
			currentPage: currentSalesStockSummaryPage,
			itemsPerPage: salesStockSummaryItemsPerPage,
			data: globalSalesStockSummaryData
		};
	};

	// =========================
	// Excel 다운로드: 전체 조회(페이징 없음) + 정렬 적용
	// =========================
	window.downloadAllSalesStockSummaryData = function() {
		let searchCriteria = getCurrentSearchCriteria();

		showLoading("export");

		$.ajax({
			url: "/read_salesStockSummary",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				excel: "Y",                 // ✅ 추가
				sortKey: salesStockSummarySortKey,
				sortDir: salesStockSummarySortDir,
				// page/itemsPerPage는 엑셀에서는 안 써도 됨
			}),
			contentType: "application/json",
			success: function(data) {
				const rows = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : data);
				ExcelExporter.downloadExcel(rows || [], window.salesStockSummaryColumns, {
					fileName: "SalesStockSummary_All",
					sheetName: "SalesStockSummary"
				});
				hideLoading();
			}
		});

	};

});
