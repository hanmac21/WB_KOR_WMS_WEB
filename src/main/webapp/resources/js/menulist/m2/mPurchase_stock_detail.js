/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고:
 *  - 화면: 서버 페이징 + 서버 정렬
 *  - 엑셀: 정렬 유지 + 전체 조회(페이징 없음)
 * -------------------------------------------------------------- */

$(document).ready(function() {
	console.log('🔍 Stock Detail Ready 시작');
	let globalStockDetailData = [];
	let currentStockDetailPage = 1;
	let stockDetailItemsPerPage = 1000;

	let totalStockDetailCount = 0;
	let totalStockDetailQty = 0;
	let totalStockDetailPages = 0;

	// ✅ 엑셀 다운로드용
	window.filteredStockDetailData = [];

	// ✅ 서버 정렬 상태(기본값)
	let stockDetailSortKey = 'YMDHMS'; // 서버에서 매핑할 키(아래 매핑표 참고)
	let stockDetailSortDir = 'DESC';

	// ✅ Excel 컬럼 정의(기존 유지)
	window.stockDetailColumns = [
		{ key: 'storage', header: 'storage' },        // ✅ syro -> storage
		{ key: 'sdate', header: 'sdate' },
		{ key: 'car', header: 'car' },
		{ key: 'itemcode', header: 'itemcode' },
		{ key: 'spec', header: 'customer code' },
		{ key: 'itemname', header: 'itemname' },
		{ key: 'location', header: 'location' },
		{ key: 'qty', header: 'qty' },
		{ key: 'loginid', header: 'user' },
		{ key: 'hhmm', header: 'hh:mm' },          // ✅ 키는 hhmm, 표시는 hh:mm
		{ key: 'madate', header: 'Made Date' },          // ✅ 키는 hhmm, 표시는 hh:mm
		{ key: 'barcode', header: 'Barcode' }
	];

	// =========================
	// 메인 호출
	// =========================
	window.call_mPurchase_stock_detail = function(menuId) {
		showLoading("data");

		// 초기 로딩: 공장만 세팅 + 기본 정렬 적용
		currentStockDetailPage = 1;
		stockDetailSortKey = 'YMDHMS';
		stockDetailSortDir = 'DESC';

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';

		performStockDetailDBSearch({  storage });
	};

	// =========================
	// DB 조회(페이징 + 정렬)
	// =========================
	function performStockDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_stockDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentStockDetailPage,
				itemsPerPage: stockDetailItemsPerPage,
				sortKey: stockDetailSortKey,
				sortDir: stockDetailSortDir
			}),
			contentType: "application/json",
			success: function(data) {
				globalStockDetailData = data.records || [];
				totalStockDetailCount = data.totalCount || 0;
				totalStockDetailQty = data.totalQty || 0;
				totalStockDetailPages = data.totalPages || 0;
				currentStockDetailPage = data.currentPage || 1;

				window.filteredStockDetailData = globalStockDetailData;

				// 첫 렌더
				if (!$('#view_mPurchase_stock_detail').length) {
					renderStockDetailView();
				} else {
					renderStockDetailTableData();
					renderStockDetailPagination();
					updateStockDetailTotalCount();
					updateStockDetailTotalQty();
					updateStockDetailSortIcons();
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
	function renderStockDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_stock_detail">
				<div class="content-body">

					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}</div>
								<select id="stockDetail_searchVal_storage"></select>
							</div>

							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}</div>
								<input type="text" id="stockDetail_searchVal_car" />
							</div>

							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="stockDetail_searchVal_itemcode" />
							</div>

							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}</div>
								<input type="text" id="stockDetail_searchVal_oitemcode" />
							</div>
							
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="stockDetail_searchVal_itemname" />
							</div>
						</div>

						<div class="search_button_area">
							<button class="btn btn-primary btnStockDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnStockDetailSearchInit">${i18n.t('btn.clear')}</button>
						</div>
					</div>

					<div class="tab-container">
						<div class="tab">목록</div>
					</div>

					<div class="table-container">
						<div class="table-info">
							<span>
								${i18n.t('table.info.total')} <strong id="stockDetailTotalCount">${totalStockDetailCount}</strong> ${i18n.t('table.info.records')} |
								${i18n.t('table.page')} <strong id="stockDetailCurrentPageInfo">${currentStockDetailPage}</strong>/<strong id="stockDetailTotalPageInfo">${totalStockDetailPages}</strong> |
								${i18n.t('table.info.qty')} : <strong id="stockDetailTotalQty"></strong>
							</span>

							<div class="action-buttons-right mPurchase_stock_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockDetailExcelBtn" onclick="downloadAllStockDetailData()">Excel</button>
								</div>
							</div>
						</div>

						<table class="data-table mPurchase_stock_detail">
							<thead>
								<tr>
									<th class="noVal">${i18n.t('table.no')}</th>

									<th class="storageVal sortable" data-sort-key="STORAGE">
										${i18n.t('search.storage')}
										<span class="sort-icon" data-sort-icon="STORAGE"></span>
									</th>

									<th class="dateVal sortable" data-sort-key="SDATE">
										${i18n.t('search.date')}
										<span class="sort-icon" data-sort-icon="SDATE"></span>
									</th>

									<th class="carVal sortable" data-sort-key="CAR">
										${i18n.t('search.car')}
										<span class="sort-icon" data-sort-icon="CAR"></span>
									</th>

									<th class="itemcodeVal sortable" data-sort-key="ITEMCODE">
										${i18n.t('search.itemCode')}
										<span class="sort-icon" data-sort-icon="ITEMCODE"></span>
									</th>

									<th class="cnameVal sortable" data-sort-key="SPEC">
										${i18n.t('search.customercode')}
										<span class="sort-icon" data-sort-icon="SPEC"></span>
									</th>

									<th class="itemnameLongVal sortable" data-sort-key="ITEMNAME">
										${i18n.t('search.itemName')}
										<span class="sort-icon" data-sort-icon="ITEMNAME"></span>
									</th>

									<th class="locationVal sortable" data-sort-key="LOCATION">
										${i18n.t('search.location')}
										<span class="sort-icon" data-sort-icon="LOCATION"></span>
									</th>

									<th class="qtyVal sortable" data-sort-key="QTY">
										${i18n.t('search.qty')}
										<span class="sort-icon" data-sort-icon="QTY"></span>
									</th>

									<th class="userVal sortable" data-sort-key="LOGINID">
										${i18n.t('search.user')}
										<span class="sort-icon" data-sort-icon="LOGINID"></span>
									</th>

									<th class="hhmmVal sortable" data-sort-key="HHMM">
										${i18n.t('table.time')}
										<span class="sort-icon" data-sort-icon="HHMM"></span>
									</th>
									
									<th class="dateVal sortable" data-sort-key="MADATE">
										${i18n.t('search.createddate')}
										<span class="sort-icon" data-sort-icon="MADATE"></span>
									</th>

									<th class="barcodeVal sortable" data-sort-key="BARCODE">
										${i18n.t('search.barcode')}
										<span class="sort-icon" data-sort-icon="BARCODE"></span>
									</th>

									<!-- ✅ 정렬 기준으로 자주 쓰는 YMDHMS도 클릭 가능하게 하려면 컬럼 추가하시거나,
									     HHMM 대신 YMDHMS로 매핑해도 됩니다. -->
								</tr>
							</thead>
							<tbody id="stockDetailTableBody"></tbody>
						</table>

						<div class="pagination" id="stockDetailPaginationContainer"></div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		renderFactoryStorage();
		renderStockDetailTableData();
		renderStockDetailPagination();
		bindStockDetailEvents();
		updateStockDetailTotalCount();
		updateStockDetailTotalQty();
		updateStockDetailSortIcons();
	}

	// =========================
	// Factory/Storage
	// =========================
	function renderFactoryStorage() {
		const storage = $('#stockDetail_searchVal_storage');
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
	function updateStockDetailTotalCount() {
		$('#stockDetailTotalCount').text(Number(totalStockDetailCount || 0).toLocaleString());
	}

	function updateStockDetailTotalQty() {
		$('#stockDetailTotalQty').text(Number(totalStockDetailQty || 0).toLocaleString());
	}

	// =========================
	// Table 렌더
	// =========================
	function renderStockDetailTableData() {
		let tableBody = "";

		$("#stockDetailCurrentPageInfo").text(currentStockDetailPage);
		$("#stockDetailTotalPageInfo").text(totalStockDetailPages);

		for (let i = 0; i < globalStockDetailData.length; i++) {
			let rowNumber = (currentStockDetailPage - 1) * stockDetailItemsPerPage + i + 1;
			let row = globalStockDetailData[i] || {};

			tableBody += `
				<tr>
					<td class="noVal">${rowNumber}</td>
					<td class="storageVal">${row.STORAGE || row.storage || ''}</td>
					<td class="dateVal">${row.SDATE || row.sdate || ''}</td>
					<td class="carVal">${row.CAR || row.car || ''}</td>
					<td class="itemcodeVal">${row.ITEMCODE || row.itemcode || ''}</td>
					<td class="cnameVal">${row.SPEC || row.spec || ''}</td>
					<td class="itemnameLongVal">${row.ITEMNAME || row.itemname || ''}</td>
					<td class="locationVal">${row.LOCATION || row.location || ''}</td>
					<td class="qtyVal">${Number(row.QTY || row.qty || 0).toLocaleString()}</td>
					<td class="userVal">${row.LOGINID || row.loginid || ''}</td>
					<td class="hhmmVal">${row.HHMM || row.hhmm || ''}</td>
					<td class="dateVal">${row.MADATE || row.madate || ''}</td>
					<td class="barcodeVal">${row.BARCODE || row.barcode || ''}</td>
				</tr>
			`;
		}

		$("#stockDetailTableBody").html(tableBody);
	}

	// =========================
	// Pagination 렌더
	// =========================
	function renderStockDetailPagination() {
		let totalPages = totalStockDetailPages || Math.ceil(totalStockDetailCount / stockDetailItemsPerPage) || 1;
		let paginationHtml = "";

		if (currentStockDetailPage > 1) {
			paginationHtml += `<button class="stockDetail-page-btn" data-page="${currentStockDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="stockDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentStockDetailPage - 5);
		let endPage = Math.min(totalPages, currentStockDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="stockDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) paginationHtml += `<span class="page-dots">...</span>`;
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStockDetailPage) {
				paginationHtml += `<button class="stockDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="stockDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalPages) {
			if (endPage < totalPages - 1) paginationHtml += `<span class="page-dots">...</span>`;
			paginationHtml += `<button class="stockDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		if (currentStockDetailPage < totalPages) {
			paginationHtml += `<button class="stockDetail-page-btn" data-page="${currentStockDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="stockDetail-page-btn disabled">&gt;</button>`;
		}

		$("#stockDetailPaginationContainer").html(paginationHtml);
	}

	// =========================
	// 정렬 아이콘 업데이트
	// =========================
	function updateStockDetailSortIcons() {
		// 전부 초기화
		$('#view_mPurchase_stock_detail thead .sort-icon').text('');

		// 현재 선택된 컬럼에만 표시
		let icon = (stockDetailSortDir === 'ASC') ? '▲' : '▼';
		$(`#view_mPurchase_stock_detail thead .sort-icon[data-sort-icon="${stockDetailSortKey}"]`).text(icon);
	}

	// =========================
	// Events
	// =========================
	function bindStockDetailEvents() {
		$(".btnStockDetailSearch").off('click').on('click', function() {
			performStockDetailSearch();
		});

		$(".btnStockDetailSearchInit").off('click').on('click', function() {
			resetStockDetailSearch();
		});

		$(document).off('click', '.stockDetail-page-btn').on('click', '.stockDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentStockDetailPage = page;
					let searchCriteria = getCurrentSearchCriteria();
					performStockDetailDBSearch(searchCriteria);
				}
			}
		});

		// ✅ 헤더 정렬 클릭(서버 정렬)
		$(document).off('click', '#view_mPurchase_stock_detail thead th.sortable')
			.on('click', '#view_mPurchase_stock_detail thead th.sortable', function() {

				const clickedKey = $(this).data('sort-key');
				if (!clickedKey) return;

				if (stockDetailSortKey === clickedKey) {
					// 같은 컬럼이면 ASC/DESC 토글
					stockDetailSortDir = (stockDetailSortDir === 'ASC') ? 'DESC' : 'ASC';
				} else {
					// 다른 컬럼이면 해당 컬럼으로 변경 + 기본 DESC
					stockDetailSortKey = clickedKey;
					stockDetailSortDir = 'DESC';
				}

				currentStockDetailPage = 1;
				updateStockDetailSortIcons();

				let searchCriteria = getCurrentSearchCriteria();
				performStockDetailDBSearch(searchCriteria);
			});

		$('#view_mPurchase_stock_detail input[type="text"], #view_mPurchase_stock_detail input[type="date"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) performStockDetailSearch();
			});
	}

	// =========================
	// 검색조건 수집
	// =========================
	function getCurrentSearchCriteria() {
		return {
			storage: $("#stockDetail_searchVal_storage").val(),
			car: $("#stockDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#stockDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#stockDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#stockDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performStockDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		currentStockDetailPage = 1;
		performStockDetailDBSearch(searchCriteria);
	}

	function resetStockDetailSearch() {
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';

		$("#stockDetail_searchVal_car").val('');
		$("#stockDetail_searchVal_itemcode").val('');
		$("#stockDetail_searchVal_oitemcode").val('');
		$("#stockDetail_searchVal_itemname").val('');

		renderFactoryStorage();

		currentStockDetailPage = 1;

		// 초기화 시 정렬도 기본으로
		stockDetailSortKey = 'YMDHMS';
		stockDetailSortDir = 'DESC';

		performStockDetailDBSearch({  storage });
	}

	// =========================
	// 외부에서 페이지사이즈 변경
	// =========================
	window.changeStockDetailItemsPerPage = function(newItemsPerPage) {
		stockDetailItemsPerPage = newItemsPerPage;
		currentStockDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performStockDetailDBSearch(searchCriteria);
	};

	window.exportStockDetailData = function() {
		return {
			total: globalStockDetailData.length,
			currentPage: currentStockDetailPage,
			itemsPerPage: stockDetailItemsPerPage,
			data: globalStockDetailData
		};
	};

	// =========================
	// Excel 다운로드: 전체 조회(페이징 없음) + 정렬 적용
	// =========================
	window.downloadAllStockDetailData = function() {
		let searchCriteria = getCurrentSearchCriteria();

		showLoading("export");

		$.ajax({
			url: "/read_stockDetail_all",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				sortKey: stockDetailSortKey,
				sortDir: stockDetailSortDir
			}),
			contentType: "application/json",
			success: function(data) {

				// ✅ 서버 응답 형태가 배열이든, {records: []}든 다 대응
				const rows = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : []);

				console.log("EXCEL rows length =", rows.length, "raw =", data);

				ExcelExporter.downloadExcel(rows, window.stockDetailColumns, {
					fileName: 'StockDetail_All',
					sheetName: 'StockDetail'
				});

				hideLoading();
			},

			error: function() {
				alert("전체 데이터 조회에 실패했습니다.");
				hideLoading();
			}
		});
	};

});
