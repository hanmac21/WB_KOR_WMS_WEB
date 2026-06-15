/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Snap Detail
 * 비고:
 *  - 화면: 서버 페이징 + 서버 정렬
 *  - 엑셀: 정렬 유지 + 전체 조회(페이징 없음)
 * -------------------------------------------------------------- */

$(document).ready(function() {
	console.log('🔍 Stock Detail Ready 시작');
	let globalStockSnapDetailData = [];
	let currentStockSnapDetailPage = 1;
	let stockSnapDetailItemsPerPage = 1000;

	let totalStockSnapDetailCount = 0;
	let totalStockSnapDetailQty = 0;
	let totalStockSnapDetailPages = 0;
	// ✅ 엑셀 다운로드용
	window.filteredStockSnapDetailData = [];

	// ✅ 서버 정렬 상태(기본값)
	let stockSnapDetailSortKey = 'YMDHMS'; // 서버에서 매핑할 키(아래 매핑표 참고)
	let stockSnapDetailSortDir = 'DESC';

	// ✅ Excel 컬럼 정의(기존 유지)
	window.stockSnapDetailColumns = [
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
	window.call_mPurchase_stock_snap_detail = function(menuId) {
		showLoading("data");

		// 초기 로딩: 공장만 세팅 + 기본 정렬 적용
		currentStockSnapDetailPage = 1;
		stockSnapDetailSortKey = 'YMDHMS';
		stockSnapDetailSortDir = 'DESC';

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';

		const { fromDate, toDate } = getDefaultDateRange();
		const [_yi, _mi, _di] = fromDate.split('-').map(Number);
		const bd_init = new Date(_yi, _mi - 1, _di);
		bd_init.setDate(bd_init.getDate() + 1);
		const backupdate = fmtLocalDate(bd_init);

		performStockSnapDetailDBSearch({ storage, backupdate });
	};

	// =========================
	// DB 조회(페이징 + 정렬)
	// =========================
	function performStockSnapDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_stockSnapDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentStockSnapDetailPage,
				itemsPerPage: stockSnapDetailItemsPerPage,
				sortKey: stockSnapDetailSortKey,
				sortDir: stockSnapDetailSortDir
			}),
			contentType: "application/json",
			success: function(data) {
				if (data && data.success === false) {
					hideLoading();
					alert(data.message || "데이터 조회에 실패했습니다.");
					return;
				}

				globalStockSnapDetailData = data.records || [];
				totalStockSnapDetailCount = data.totalCount || 0;
				totalStockSnapDetailQty = data.totalQty || 0;
				totalStockSnapDetailPages = data.totalPages || 0;
				currentStockSnapDetailPage = data.currentPage || 1;

				window.filteredStockSnapDetailData = globalStockSnapDetailData;

				// 첫 렌더
				if (!$('#view_mPurchase_stock_snap_detail').length) {
					renderStockSnapDetailView();
				} else {
					renderStockSnapDetailTableData();
					renderStockSnapDetailPagination();
					updateStockSnapDetailTotalCount();
					updateStockSnapDetailTotalQty();
					updateStockSnapDetailSortIcons();
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
	function renderStockSnapDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_stock_snap_detail">
				<div class="content-body">

					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_backupdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="stockSnapDetail_searchVal_backupdate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}</div>
								<select id="stockSnapDetail_searchVal_storage"></select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}</div>
								<input type="text" id="stockSnapDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="stockSnapDetail_searchVal_itemcode" />
							</div>							
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}</div>
								<input type="text" id="stockSnapDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="stockSnapDetail_searchVal_itemname" />
							</div>
						</div>

						<div class="search_button_area">
							<button class="btn btn-primary btnStockSnapDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnStockSnapDetailSearchInit">${i18n.t('btn.clear')}</button>
						</div>
					</div>

					<div class="tab-container">
						<div class="tab">목록</div>
					</div>

					<div class="table-container">
						<div class="table-info">
							<span>
								${i18n.t('table.info.total')} <strong id="stockSnapDetailTotalCount">${totalStockSnapDetailCount}</strong> ${i18n.t('table.info.records')} |
								${i18n.t('table.page')} <strong id="stockSnapDetailCurrentPageInfo">${currentStockSnapDetailPage}</strong>/<strong id="stockSnapDetailTotalPageInfo">${totalStockSnapDetailPages}</strong> |
								${i18n.t('table.info.qty')} : <strong id="stockSnapDetailTotalQty"></strong>
							</span>

							<div class="action-buttons-right mPurchase_stock_snap_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockSnapDetailExcelBtn" onclick="downloadAllStockSnapDetailData()">Excel</button>
								</div>
							</div>
						</div>

						<table class="data-table mPurchase_stock_snap_detail">
							<thead>
								<tr>
									<th class="noVal">${i18n.t('table.no')}</th>
									<th class="storageVal sortable" data-sort-key="STORAGE">${i18n.t('search.storage')}
										<span class="sort-icon" data-sort-icon="STORAGE"></span>
									</th>
									<th class="dateVal sortable" data-sort-key="SDATE">${i18n.t('search.date')}
										<span class="sort-icon" data-sort-icon="SDATE"></span>
									</th>
									<th class="carVal sortable" data-sort-key="CAR">${i18n.t('search.car')}
										<span class="sort-icon" data-sort-icon="CAR"></span>
									</th>
									<th class="itemcodeVal sortable" data-sort-key="ITEMCODE">${i18n.t('search.itemCode')}
										<span class="sort-icon" data-sort-icon="ITEMCODE"></span>
									</th>
									<th class="cnameVal sortable" data-sort-key="SPEC">${i18n.t('search.customercode')}
										<span class="sort-icon" data-sort-icon="SPEC"></span>
									</th>
									<th class="itemnameLongVal sortable" data-sort-key="ITEMNAME">${i18n.t('search.itemName')}
										<span class="sort-icon" data-sort-icon="ITEMNAME"></span>
									</th>
									<th class="locationVal sortable" data-sort-key="LOCATION">${i18n.t('search.location')}
										<span class="sort-icon" data-sort-icon="LOCATION"></span>
									</th>
									<th class="qtyVal sortable" data-sort-key="QTY">${i18n.t('search.qty')}
										<span class="sort-icon" data-sort-icon="QTY"></span>
									</th>
									<th class="userVal sortable" data-sort-key="LOGINID">${i18n.t('search.user')}
										<span class="sort-icon" data-sort-icon="LOGINID"></span>
									</th>
									<th class="hhmmVal sortable" data-sort-key="HHMM">${i18n.t('table.time')}
										<span class="sort-icon" data-sort-icon="HHMM"></span>
									</th>									
									<th class="dateVal sortable" data-sort-key="MADATE">${i18n.t('search.createddate')}
										<span class="sort-icon" data-sort-icon="MADATE"></span>
									</th>
									<th class="barcodeVal sortable" data-sort-key="BARCODE">${i18n.t('search.barcode')}
										<span class="sort-icon" data-sort-icon="BARCODE"></span>
									</th>
								</tr>
							</thead>
							<tbody id="stockSnapDetailTableBody"></tbody>
						</table>

						<div class="pagination" id="stockSnapDetailPaginationContainer"></div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		// 화면 기본 날짜 세팅
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#stockSnapDetail_searchVal_backupdate").val(fromDate);
		})();

		renderFactoryStorage();
		renderStockSnapDetailTableData();
		renderStockSnapDetailPagination();
		bindStockSnapDetailEvents();
		updateStockSnapDetailTotalCount();
		updateStockSnapDetailTotalQty();
		updateStockSnapDetailSortIcons();
	}

	function fmtLocalDate(d){
		const y = d.getFullYear();
		const m = String(d.getMonth()+1).padStart(2,'0');
		const dd = String(d.getDate()).padStart(2,'0');
		return `${y}-${m}-${dd}`;
	}
	function getDefaultDateRange(){
		const today = new Date();
		today.setDate(today.getDate() - 1);
		const toDate = fmtLocalDate(today);
		const fromDate = fmtLocalDate(today);
		return { fromDate, toDate };
	}

	// =========================
	// Factory/Storage
	// =========================
	function renderFactoryStorage() {
		const storage = $('#stockSnapDetail_searchVal_storage');
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
	function updateStockSnapDetailTotalCount() {
		$('#stockSnapDetailTotalCount').text(Number(totalStockSnapDetailCount || 0).toLocaleString());
	}

	function updateStockSnapDetailTotalQty() {
		$('#stockSnapDetailTotalQty').text(Number(totalStockSnapDetailQty || 0).toLocaleString());
	}

	// =========================
	// Table 렌더
	// =========================
	function renderStockSnapDetailTableData() {
		let tableBody = "";

		$("#stockSnapDetailCurrentPageInfo").text(currentStockSnapDetailPage);
		$("#stockSnapDetailTotalPageInfo").text(totalStockSnapDetailPages);

		for (let i = 0; i < globalStockSnapDetailData.length; i++) {
			let rowNumber = (currentStockSnapDetailPage - 1) * stockSnapDetailItemsPerPage + i + 1;
			let row = globalStockSnapDetailData[i] || {};

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

		$("#stockSnapDetailTableBody").html(tableBody);
	}

	// =========================
	// Pagination 렌더
	// =========================
	function renderStockSnapDetailPagination() {
		let totalPages = totalStockSnapDetailPages || Math.ceil(totalStockSnapDetailCount / stockSnapDetailItemsPerPage) || 1;
		let paginationHtml = "";

		if (currentStockSnapDetailPage > 1) {
			paginationHtml += `<button class="stockSnapDetail-page-btn" data-page="${currentStockSnapDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="stockSnapDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentStockSnapDetailPage - 5);
		let endPage = Math.min(totalPages, currentStockSnapDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="stockSnapDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) paginationHtml += `<span class="page-dots">...</span>`;
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStockSnapDetailPage) {
				paginationHtml += `<button class="stockSnapDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="stockSnapDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalPages) {
			if (endPage < totalPages - 1) paginationHtml += `<span class="page-dots">...</span>`;
			paginationHtml += `<button class="stockSnapDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		if (currentStockSnapDetailPage < totalPages) {
			paginationHtml += `<button class="stockSnapDetail-page-btn" data-page="${currentStockSnapDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="stockSnapDetail-page-btn disabled">&gt;</button>`;
		}

		$("#stockSnapDetailPaginationContainer").html(paginationHtml);
	}

	// =========================
	// 정렬 아이콘 업데이트
	// =========================
	function updateStockSnapDetailSortIcons() {
		// 전부 초기화
		$('#view_mPurchase_stock_snap_detail thead .sort-icon').text('');

		// 현재 선택된 컬럼에만 표시
		let icon = (stockSnapDetailSortDir === 'ASC') ? '▲' : '▼';
		$(`#view_mPurchase_stock_snap_detail thead .sort-icon[data-sort-icon="${stockSnapDetailSortKey}"]`).text(icon);
	}

	// =========================
	// Events
	// =========================
	function bindStockSnapDetailEvents() {
		$(".btnStockSnapDetailSearch").off('click').on('click', function() {
			performStockSnapDetailSearch();
		});

		$(".btnStockSnapDetailSearchInit").off('click').on('click', function() {
			resetStockSnapDetailSearch();
		});

		$(document).off('click', '.stockSnapDetail-page-btn').on('click', '.stockSnapDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentStockSnapDetailPage = page;
					let searchCriteria = getCurrentSearchCriteria();
					performStockSnapDetailDBSearch(searchCriteria);
				}
			}
		});

		// ✅ 헤더 정렬 클릭(서버 정렬)
		$(document).off('click', '#view_mPurchase_stock_snap_detail thead th.sortable')
			.on('click', '#view_mPurchase_stock_snap_detail thead th.sortable', function() {

				const clickedKey = $(this).data('sort-key');
				if (!clickedKey) return;

				if (stockSnapDetailSortKey === clickedKey) {
					// 같은 컬럼이면 ASC/DESC 토글
					stockSnapDetailSortDir = (stockSnapDetailSortDir === 'ASC') ? 'DESC' : 'ASC';
				} else {
					// 다른 컬럼이면 해당 컬럼으로 변경 + 기본 DESC
					stockSnapDetailSortKey = clickedKey;
					stockSnapDetailSortDir = 'DESC';
				}

				currentStockSnapDetailPage = 1;
				updateStockSnapDetailSortIcons();

				let searchCriteria = getCurrentSearchCriteria();
				performStockSnapDetailDBSearch(searchCriteria);
			});

		$('#view_mPurchase_stock_snap_detail input[type="text"], #view_mPurchase_stock_snap_detail input[type="date"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) performStockSnapDetailSearch();
			});
	}

	// =========================
	// 검색조건 수집
	// =========================
	function getCurrentSearchCriteria() {
		let backupdate = $("#stockSnapDetail_searchVal_backupdate").val();

		if (!backupdate) {
			alert("날짜를 선택해주세요.");
			$("#stockSnapDetail_searchVal_backupdate").focus();
			return null;
		}
        const [_y, _m, _d] = backupdate.split('-').map(Number);
        let backupdate_temp = new Date(_y, _m - 1, _d);

		let today = new Date();

		backupdate_temp.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);

		// ✅ 오늘 날짜는 조회 불가
		if (backupdate_temp >= today) {
			alert("오늘 날짜는 조회할 수 없습니다.");
			$("#stockSnapDetail_searchVal_backupdate").focus();
			return null;
		}

		// 오늘 이전 날짜만 +1일 처리
        if (backupdate_temp < today) {
            backupdate_temp.setDate(backupdate_temp.getDate() + 1);
            backupdate = fmtLocalDate(backupdate_temp);
        }

		return {
			backupdate: backupdate, // ✅ 선택한 날짜 그대로 서버 전달
			storage: $("#stockSnapDetail_searchVal_storage").val(),
			car: $("#stockSnapDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#stockSnapDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#stockSnapDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#stockSnapDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performStockSnapDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		if (!searchCriteria) return;

		currentStockSnapDetailPage = 1;
		performStockSnapDetailDBSearch(searchCriteria);
	}

	function resetStockSnapDetailSearch() {

		$("#stockSnapDetail_searchVal_car").val('');
		$("#stockSnapDetail_searchVal_itemcode").val('');
		$("#stockSnapDetail_searchVal_oitemcode").val('');
		$("#stockSnapDetail_searchVal_itemname").val('');
		$("#stockSnapDetail_searchVal_backupdate").val(backupdate);

		renderFactoryStorage();

		currentStockSnapDetailPage = 1;

		// 초기화 시 정렬도 기본으로
		stockSnapDetailSortKey = 'YMDHMS';
		stockSnapDetailSortDir = 'DESC';

		const { fromDate, toDate } = getDefaultDateRange();
		const [_yr, _mr, _dr] = fromDate.split('-').map(Number);
		const bd_reset = new Date(_yr, _mr - 1, _dr);
		bd_reset.setDate(bd_reset.getDate() + 1);
		const backupdate = fmtLocalDate(bd_reset);

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';

		performStockSnapDetailDBSearch({ storage, backupdate});
	}

	// =========================
	// 외부에서 페이지사이즈 변경
	// =========================
	window.changeStockSnapDetailItemsPerPage = function(newItemsPerPage) {
		stockSnapDetailItemsPerPage = newItemsPerPage;
		currentStockSnapDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performStockSnapDetailDBSearch(searchCriteria);
	};

	window.exportStockSnapDetailData = function() {
		return {
			total: globalStockSnapDetailData.length,
			currentPage: currentStockSnapDetailPage,
			itemsPerPage: stockSnapDetailItemsPerPage,
			data: globalStockSnapDetailData
		};
	};

	// =========================
	// Excel 다운로드: 전체 조회(페이징 없음) + 정렬 적용
	// =========================
	window.downloadAllStockSnapDetailData = function() {
		let searchCriteria = getCurrentSearchCriteria();

		showLoading("export");

		$.ajax({
			url: "/read_stockSnapDetail_all",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				sortKey: stockSnapDetailSortKey,
				sortDir: stockSnapDetailSortDir
			}),
			contentType: "application/json",
			success: function(data) {

				// ✅ 서버 응답 형태가 배열이든, {records: []}든 다 대응
				const rows = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : []);

				console.log("EXCEL rows length =", rows.length, "raw =", data);

				ExcelExporter.downloadExcel(rows, window.stockSnapDetailColumns, {
					fileName: 'StockSnapDetail_All',
					sheetName: 'StockSnapDetail'
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
