/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (서버 정렬/서버 페이징)
 * - itemsPerPage: 쿠키(itemsPerPage) 기준
 * - 검색: 전체 데이터 기반 (서버 where)
 * - 페이징: 서버 offset/limit
 * - 헤더 정렬: 전체 데이터 기반 정렬 후 페이징 결과만 표시
 * - 엑셀: 전체 쿼리 + 현재 정렬 포함
 * -------------------------------------------------------------- */

/*let globalPurchasePurchaseStockDetailData = [];
let currentPurchasePurchaseStockDetailPage = 1;
let purchaseStockDetailItemsPerPage = 100;

let totalPurchasePurchaseStockDetailCount = 0;
let totalPurchasePurchaseStockDetailPages = 0;

let currentSortColumn = 'YMDHMS'; // ✅ 기본 정렬
let currentSortOrder = 'desc';    // ✅ 기본 정렬

let totalQty = 0;

// ✅ 중복 호출 abort용
let currentXhr_purchaseStockDetail = null;

$(document).ready(function() {

	// ============================================================
	// ✅ Columns
	// ============================================================
	window.filteredPurchasePurchaseStockDetailData = [];
	window.purchaseStockDetailColumns = [
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'INDATE', header: 'indate' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'customer code' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'Barcode' }
	];

	// ============================================================
	// ✅ Main Call
	// ============================================================
	window.call_mPurchase_stockDetail = function(menuId) {
		showLoading("data");

		// 화면이 아직 없으면 먼저 렌더링
		if ($("#view_mPurchase_purchaseStockDetail").length === 0) {
			renderPurchasePurchaseStockDetailView();
		}

		syncItemsPerPage();
		currentPurchasePurchaseStockDetailPage = 1;

		// ✅ 첫 로딩은 DOM(select) 안 믿고, 쿠키/고정값으로만 criteria 구성
		const factory = (getCookie('selectedFactory') || 'all').trim().toUpperCase();
		const storage = 'Material'; // ✅ 원하시는 기본값

		performPurchasePurchaseStockDetailDBSearch({
			factory,
			storage,
		});
	};


	// ============================================================
	// ✅ Cookie Helpers
	// ============================================================
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function syncItemsPerPage() {
		const n = parseInt(getCookie('itemsPerPage'), 10);
		purchaseStockDetailItemsPerPage = (Number.isFinite(n) && n > 0) ? n : 100;

		if ($("#purchaseStockDetail_itemsPerPage").length) {
			$("#purchaseStockDetail_itemsPerPage").val(String(purchaseStockDetailItemsPerPage));
		}
	}

	// ============================================================
	// ✅ Search Criteria (존재하는 필드만)
	// ============================================================
	function getCurrentSearchCriteria() {
		const storageVal = $("#purchaseStockDetail_searchVal_storage").val();

		return {
			factory: ($("#purchaseStockDetail_searchVal_factory").val() || 'all'),
			storage: (storageVal == null || storageVal === '') ? 'all' : storageVal,
			car: ($("#purchaseStockDetail_searchVal_car").val() || '').trim().toUpperCase(),
			itemcode: ($("#purchaseStockDetail_searchVal_itemcode").val() || '').trim().toUpperCase(),
			itemname: ($("#purchaseStockDetail_searchVal_itemname").val() || '').trim().toUpperCase()
		};
	}


	// ============================================================
	// ✅ DB Search (서버 페이징 / 서버 정렬)
	// ============================================================
	function performPurchasePurchaseStockDetailDBSearch(searchCriteria) {
		showLoading("data");

		syncItemsPerPage();

		const page = (currentPurchasePurchaseStockDetailPage && currentPurchasePurchaseStockDetailPage > 0)
			? currentPurchasePurchaseStockDetailPage
			: 1;

		const itemsPerPage = purchaseStockDetailItemsPerPage;

		// ✅ 중복 호출 취소(abort)
		try {
			if (currentXhr_purchaseStockDetail) currentXhr_purchaseStockDetail.abort();
		} catch (e) { }

		currentXhr_purchaseStockDetail = $.ajax({
			url: "/read_purchaseStockDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page,
				itemsPerPage,
				sortColumn: currentSortColumn || 'YMDHMS',
				sortOrder: currentSortOrder || 'desc'
			}),
			contentType: "application/json",
			success: function(response) {
				globalPurchasePurchaseStockDetailData = response.records || [];

				totalPurchasePurchaseStockDetailCount = Number(response.totalCount || 0);
				totalPurchasePurchaseStockDetailPages = Math.ceil(totalPurchasePurchaseStockDetailCount / itemsPerPage);

				totalQty = Number(response.totalQty || 0);

				currentPurchasePurchaseStockDetailPage = page;

				renderPurchasePurchaseStockDetailTableData();
				renderPurchasePurchaseStockDetailPagination();
				updatePurchasePurchaseStockDetailTotalCount();
				updateTotalQty();
				hideLoading();
			},
			error: function(xhr, status) {
				if (status === 'abort') return;
				hideLoading();
				alert("조회 실패");
			},
			complete: function() {
				currentXhr_purchaseStockDetail = null;
			}
		});
	}

	// ============================================================
	// ✅ Sort (헤더 클릭 시 서버 정렬 → 서버 페이징 결과 표시)
	// ============================================================
	function applyServerSort(column) {
		if (!column) return;

		if (currentSortColumn === column) {
			currentSortOrder = (currentSortOrder === 'asc') ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		currentPurchasePurchaseStockDetailPage = 1;
		performPurchasePurchaseStockDetailDBSearch(getCurrentSearchCriteria());
		updateSortIndicators(column);
	}

	function updateSortIndicators(column) {
		$('#purchaseStockDetailTable thead th').removeClass('sort-asc sort-desc');
		$(`#purchaseStockDetailTable thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ View Render
	// ============================================================
	function renderPurchasePurchaseStockDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_purchaseStockDetail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="purchaseStockDetail_searchVal_factory">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="purchaseStockDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							
							
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="purchaseStockDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="purchaseStockDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="purchaseStockDetail_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnPurchaseStockDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnPurchaseStockDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
							</div>
					</div>

					<!-- 탭 -->
					<div class="tab-container">
						<div class="tab">목록</div>
					</div>

					<!-- 테이블 -->
					<div class="table-container">
						<div class="table-info">
							<span>
								${i18n.t('table.info.total')}
								<strong id="purchaseStockDetailTotalCount">0</strong>
								${i18n.t('table.info.records')}
								|
								${i18n.t('table.page')}
								<strong id="purchaseStockDetailCurrentPageInfo">1</strong>/
								<strong id="purchaseStockDetailTotalPageInfo">1</strong>
								|
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span>
								<span class="purchaseStockDetailTotalQty" style="color:#007bff">0</span>
							</span>

							<div class="action-buttons-right mPurchase_purchaseStockDetail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="purchaseStockDetailExcelBtn">Excel</button>
								</div>
							</div>
						</div>

						<table class="data-table mPurchase_purchaseStockDetail" id="purchaseStockDetailTable">
							<thead>
								<tr>
									<th class="noVal">${i18n.t('table.no')}</th>
									<th class="factoryVal" data-sort="FACTORY">${i18n.t('search.factory')}</th>
									<th class="storageVal" data-sort="STORAGE">${i18n.t('search.storage')}</th>
									<th class="dateVal" data-sort="INDATE">${i18n.t('search.date')}</th>
									<th class="carVal" data-sort="CAR">${i18n.t('search.car')}</th>
									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
									<th class="itemcodeVal" data-sort="SPEC">${i18n.t('search.customercode')}</th>
									<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
									<th class="locationVal" data-sort="LOCATION">${i18n.t('search.location')}</th>
									<th class="qtyVal" data-sort="QTY">${i18n.t('search.qty')}</th>
									<th class="userVal" data-sort="LOGINID">${i18n.t('search.user')}</th>
									<th class="hhmmVal" data-sort="HHMM">${i18n.t('table.time')}</th>
									<th class="barcodeVal" data-sort="BARCODE">${i18n.t('search.barcode')}</th>
								</tr>
							</thead>
							<tbody id="purchaseStockDetailDetailTableBody"></tbody>
						</table>

						<!-- 페이지네이션 -->
						<div class="pagination" id="purchaseStockDetailPaginationContainer"></div>

						<div class="items-per-page-selector">
							<label for="purchaseStockDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
							<select id="purchaseStockDetail_itemsPerPage" class="items-per-page-select">
								<option value="100">100</option>
								<option value="300">300</option>
								<option value="1000">1000</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		// 공장/창고 옵션 렌더
		renderFactoryStorage();

		// itemsPerPage 쿠키 반영
		syncItemsPerPage();

		// 이벤트 바인딩
		bindPurchasePurchaseStockDetailEvents();

		// 최초 표시값 업데이트
		updatePurchasePurchaseStockDetailTotalCount();
		updateTotalQty();
	}

	function renderFactoryStorage() {
		const factory = $('#purchaseStockDetail_searchVal_factory');
		const storage = $('#purchaseStockDetail_searchVal_storage');

		factory.empty();
		factory.append(`<option value="all">${i18n.t('search.all')}</option>`);
		factory.append(`<option value="SALTILLO">Saltillo</option>`);
		factory.append(`<option value="PUEBLA">Puebla</option>`);

		const savedFactory = (getCookie('selectedFactory') || '').trim().toUpperCase();
		factory.val(savedFactory || 'all');

		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				SALTILLO: ['Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'Material+Sideseat+Outside', 'P1 W/HOUSE', 'REDCAGE', 'all'],
				PUEBLA: ['Material', 'PRODUCT', 'REDCAGE', 'all'],
				'': ['Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'PRODUCT', 'Material+Sideseat+Outside', 'P1 W/HOUSE', 'REDCAGE', 'all']
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			// ✅ 기본값: 첫번째 (Material)
			storage.val(storageList[0] || 'all');

			// ✅ 타이밍/브라우저 이슈 방지: 값이 비었으면 강제 세팅
			if (storage.val() == null || storage.val() === '') {
				storage.val(storageList[0] || 'all');
			}
		}

		// 최초 1회 세팅
		updateStorageOptions(factory.val());

		// 공장 변경 시
		factory.off('change').on('change', function() {
			updateStorageOptions($(this).val());
		});
	}


	// ============================================================
	// ✅ Table Render
	// ============================================================
	function renderPurchasePurchaseStockDetailTableData() {
		let tableBody = "";

		const itemsPerPage = purchaseStockDetailItemsPerPage || 100;

		for (let i = 0; i < globalPurchasePurchaseStockDetailData.length; i++) {
			const r = globalPurchasePurchaseStockDetailData[i] || {};
			const rowNumber = (currentPurchasePurchaseStockDetailPage - 1) * itemsPerPage + i + 1;

			tableBody += `
				<tr>
					<td class="noVal">${rowNumber}</td>
					<td class="factoryVal">${r.FACTORY ?? r.factory ?? ''}</td>
					<td class="storageVal">${r.STORAGE ?? r.storage ?? ''}</td>
					<td class="dateVal">${r.INDATE ?? r.indate ?? ''}</td>
					<td class="carVal">${r.CAR ?? r.car ?? ''}</td>
					<td class="itemcodeVal">${r.ITEMCODE ?? r.itemcode ?? ''}</td>
					<td class="itemcodeVal">${r.SPEC ?? r.spec ?? ''}</td>
					<td class="itemnameVal">${r.ITEMNAME ?? r.itemname ?? ''}</td>
					<td class="locationVal">${r.LOCATION ?? r.location ?? ''}</td>
					<td class="qtyVal">${Number(r.QTY ?? r.qty ?? 0).toLocaleString()}</td>
					<td class="userVal">${r.LOGINID ?? r.loginid ?? ''}</td>
					<td class="hhmmVal">${r.HHMM ?? r.hhmm ?? ''}</td>
					<td class="barcodeVal">${r.BARCODE ?? r.barcode ?? ''}</td>
				</tr>
			`;
		}

		$("#purchaseStockDetailDetailTableBody").html(tableBody);
	}

	// ============================================================
	// ✅ Pagination Render
	// ============================================================
	function renderPurchasePurchaseStockDetailPagination() {
		let paginationHtml = "";

		if (totalPurchasePurchaseStockDetailPages <= 1) {
			$("#purchaseStockDetailPaginationContainer").html("");
			return;
		}

		// prev
		if (currentPurchasePurchaseStockDetailPage > 1) {
			paginationHtml += `<button class="purchaseStockDetail-page-btn" data-page="${currentPurchasePurchaseStockDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="purchaseStockDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentPurchasePurchaseStockDetailPage - 5);
		let endPage = Math.min(totalPurchasePurchaseStockDetailPages, currentPurchasePurchaseStockDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="purchaseStockDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) paginationHtml += `<span class="page-dots">...</span>`;
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentPurchasePurchaseStockDetailPage) {
				paginationHtml += `<button class="purchaseStockDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="purchaseStockDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalPurchasePurchaseStockDetailPages) {
			if (endPage < totalPurchasePurchaseStockDetailPages - 1) paginationHtml += `<span class="page-dots">...</span>`;
			paginationHtml += `<button class="purchaseStockDetail-page-btn" data-page="${totalPurchasePurchaseStockDetailPages}">${totalPurchasePurchaseStockDetailPages}</button>`;
		}

		// next
		if (currentPurchasePurchaseStockDetailPage < totalPurchasePurchaseStockDetailPages) {
			paginationHtml += `<button class="purchaseStockDetail-page-btn" data-page="${currentPurchasePurchaseStockDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="purchaseStockDetail-page-btn disabled">&gt;</button>`;
		}

		$("#purchaseStockDetailPaginationContainer").html(paginationHtml);
	}

	// ============================================================
	// ✅ Counters
	// ============================================================
	function updatePurchasePurchaseStockDetailTotalCount() {
		$('#purchaseStockDetailTotalCount').text(Number(totalPurchasePurchaseStockDetailCount).toLocaleString());
		$('#purchaseStockDetailCurrentPageInfo').text(currentPurchasePurchaseStockDetailPage);
		$('#purchaseStockDetailTotalPageInfo').text(totalPurchase_purchaseStockDetailPagesSafe());
	}

	function totalPurchase_purchaseStockDetailPagesSafe() {
		return totalPurchasePurchaseStockDetailPages > 0 ? totalPurchasePurchaseStockDetailPages : 1;
	}

	function updateTotalQty() {
		$(".purchaseStockDetailTotalQty").text(Number(totalQty).toLocaleString());
	}

	// ============================================================
	// ✅ Events
	// ============================================================
	function bindPurchasePurchaseStockDetailEvents() {

		// 검색
		$(".btnPurchaseStockDetailSearch").off('click').on('click', function() {
			currentPurchasePurchaseStockDetailPage = 1;
			performPurchasePurchaseStockDetailDBSearch(getCurrentSearchCriteria());
		});

		// 초기화
		$(".btnPurchaseStockDetailSearchInit").off('click').on('click', function() {
			resetPurchasePurchaseStockDetailSearch();
		});

		// itemsPerPage 변경
		$('#purchaseStockDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val(), 10) || 100;

			setCookie('itemsPerPage', newItemsPerPage);
			purchaseStockDetailItemsPerPage = newItemsPerPage;

			currentPurchasePurchaseStockDetailPage = 1;
			performPurchasePurchaseStockDetailDBSearch(getCurrentSearchCriteria());
		});

		// 페이지네이션
		$(document).off('click', '.purchaseStockDetail-page-btn').on('click', '.purchaseStockDetail-page-btn', function() {
			if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;

			const page = parseInt($(this).data('page'), 10);
			if (!page || page < 1) return;

			currentPurchasePurchaseStockDetailPage = page;
			performPurchasePurchaseStockDetailDBSearch(getCurrentSearchCriteria());
		});

		// 헤더 정렬
		$('#purchaseStockDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			applyServerSort(column);
		});

		// 엔터키 검색
		$('#view_mPurchase_purchaseStockDetail input[type="text"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) {
					currentPurchasePurchaseStockDetailPage = 1;
					performPurchasePurchaseStockDetailDBSearch(getCurrentSearchCriteria());
				}
			});

		// Excel
		$('#purchaseStockDetailExcelBtn').off('click').on('click', function() {
			downloadAllPurchasePurchaseStockDetailData_local();
		});

		// ✅ Excel 다운로드 (전체 + 현재 정렬 반영)
		function downloadAllPurchasePurchaseStockDetailData_local() {
			const payload = {
				searchParams: getCurrentSearchCriteria(),
				sortColumn: currentSortColumn || 'YMDHMS',
				sortOrder: currentSortOrder || 'desc'
			};

			showLoading("export");

			fetch('/purchaseStockDetail/excel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
				.then(res => {
					if (!res.ok) throw new Error('excel fail');
					return res.blob();
				})
				.then(blob => {
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = 'purchaseStockDetail.xlsx';
					a.click();
					window.URL.revokeObjectURL(url);
					hideLoading();
				})
				.catch(() => {
					hideLoading();
					alert("엑셀 다운로드 실패");
				});
		}
	}

	// ============================================================
	// ✅ Reset
	// ============================================================
	function resetPurchasePurchaseStockDetailSearch() {
		const factory = (getCookie('selectedFactory') || 'all').trim().toUpperCase();

		$("#purchaseStockDetail_searchVal_factory").val(factory);

		// ✅ 공장에 맞는 기본 storage로 재세팅
		if (factory === 'PUEBLA') {
			$("#purchaseStockDetail_searchVal_storage").val('Material');
		} else if (factory === 'SALTILLO') {
			$("#purchaseStockDetail_searchVal_storage").val('Material');
		} else {
			$("#purchaseStockDetail_searchVal_storage").val('all');
		}

		$("#purchaseStockDetail_searchVal_car").val('');
		$("#purchaseStockDetail_searchVal_itemcode").val('');
		$("#purchaseStockDetail_searchVal_itemname").val('');

		currentPurchasePurchaseStockDetailPage = 1;
		performPurchasePurchaseStockDetailDBSearch(getCurrentSearchCriteria());
	}


});*/
