/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_salesStorageStockList = [];
let globalSalesStorageStockListData = [];
let currentSalesStorageStockListPage = 1;
let salesStorageStockListItemsPerPage = 100;
let totalSalesStorageStockListCount = 0;
let totalSalesStorageStockListPages = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';
let totalQty = 0;

$(document).ready(function() {

	window.filteredSalesStorageStockListData = [];
	window.salesStorageStockListColumns = [
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'INVENTORY_QTY', header: 'Inventory' },
		{ key: 'INCOMING_QTY', header: 'Incoming' },
		{ key: 'INCOMING_RETURN_QTY', header: 'Incoming Return' },
		{ key: 'INCOMING_EXCEPTION_QTY', header: 'Incoming Exception' },
		{ key: 'LOAD_QTY', header: 'Load' },
		{ key: 'LOAD_RETURN_QTY', header: 'Load Return' },
		{ key: 'LOAD_EXCEPTION_QTY', header: 'Load Exception' },
		{ key: 'STOCKMOVE_QTY', header: 'Stock Move' },
		{ key: 'ADJUSTMENT_QTY', header: 'Adjustment' },
		{ key: 'TOTAL_QTY', header: 'Total' },
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mSales_storageStock_list = function(menuId) {
		showLoading("data");

		const factory = getCookie('selectedFactory');
		const { fromDate, toDate } = getDefaultDateRange();
		const storage = 'PRODUCT';

		performSalesStorageStockListDBSearch({ fromDate, toDate, factory, storage });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesStorageStockListDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_salesStorageStockList",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
				// page, itemsPerPage 없음 = 전체 조회
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				// 서버에서 받은 전체 데이터 저장
				allServerData = response.records || [];
				filteredData_salesStorageStockList = [...allServerData]; // 초기에는 필터링 없음
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesStorageStockListPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_storageStock_list').length) {
					renderSalesStorageStockListView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderSalesStorageStockListTableData();
					renderSalesStorageStockListPagination();
					updateSalesStorageStockListTotalCount();
				}

				if (response.records && response.records.length > 0) {
					const r0 = response.records[0];

					totalQty = Number(r0.TOTALQTY ?? r0.totalqty ?? 0) || 0;
				}

				// ✅ 만약 서버가 totals를 records에 붙여서 주는 구조라면(방금 SQL처럼 OVER())
				// response.totalQty가 없을 때 첫 row에서 가져오기
				if ((!response.totalQty && response.records && response.records.length > 0)) {
					const r0 = response.records[0];
					totalQty = r0.TOTALQTY ?? r0.totalqty ?? totalQty;
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

	// 클라이언트에서 페이징 처리
	function applyClientPagination() {
		// ✅ 렌더링할 때마다 쿠키에서 읽기
		salesStorageStockListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesStorageStockListCount = filteredData_salesStorageStockList.length;
		totalSalesStorageStockListPages = Math.ceil(totalSalesStorageStockListCount / salesStorageStockListItemsPerPage);

		// 현재 페이지 범위 계산
		const startIndex = (currentSalesStorageStockListPage - 1) * salesStorageStockListItemsPerPage;
		const endIndex = startIndex + salesStorageStockListItemsPerPage;

		// 현재 페이지 데이터 추출
		globalSalesStorageStockListData = filteredData_salesStorageStockList.slice(startIndex, endIndex);
		window.filteredSalesStorageStockListData = globalSalesStorageStockListData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {		
		// 같은 컬럼 클릭 시 정렬 방향 토글
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		// 데이터 정렬
		filteredData_salesStorageStockList.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

			// 데이터 타입별 처리
			if (dataType === 'number') {
				valA = parseFloat(valA) || 0;
				valB = parseFloat(valB) || 0;
			} else if (dataType === 'date') {
				valA = new Date(valA).getTime() || 0;
				valB = new Date(valB).getTime() || 0;
			} else {
				valA = String(valA).toUpperCase();
				valB = String(valB).toUpperCase();
			}

			if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
			if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		// 페이지 1로 초기화 후 다시 페이징
		currentSalesStorageStockListPage = 1;
		applyClientPagination();

		// 테이블 업데이트
		renderSalesStorageStockListTableData();
		renderSalesStorageStockListPagination();
		updateSalesStorageStockListTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesStorageStockListView() {
		let content_output = `
			<div class="divBlockControl" id="view_mSales_storageStock_list">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
								<input type="date" id="salesStorageStockList_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="salesStorageStockList_searchVal_toDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesStorageStockList_searchVal_factory">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesStorageStockList_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>		
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesStorageStockList_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesStorageStockList_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSalesStorageStockListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnSalesStorageStockListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
						</div>
					</div>
					
					<!-- 탭 -->
					<div class="tab-container">
						<div class="tab">목록</div>
					</div>
					
					<!-- 테이블 -->
					<div class="table-container">
						<div class="action-buttons">
							<button class="btn btn-secondary">엑셀 다운로드</button>
						</div>
						
						<div class="table-info">
							<span>
								${i18n.t('table.info.total')}
								<strong id="salesStorageStockListTotalCount">${totalSalesStorageStockListCount}</strong>
								${i18n.t('table.info.records')}
								|
								${i18n.t('table.page')}
								<strong id="salesStorageStockListCurrentPageInfo">${currentSalesStorageStockListPage}</strong>/
								<strong id="salesStorageStockListTotalPageInfo">${totalSalesStorageStockListPages}</strong>
								|
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span>
								<span class="salesStorageStockListTotalQty" style="color:#007bff"></span>
							</span>
						
							<div class="action-buttons-right mSales_storageStock_list">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesStorageStockListExcelBtn" onclick="downloadAllSalesStorageStockListData()">Excel</button>
								</div>
							</div>
						</div>

						<table class="data-table mSales_storageStock_list" id="salesStorageStockListTable">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
								    <th class = "cucodeVal" data-sort="ITEMTYPE">${i18n.t('search.itemType')}<!-- ITEMCODE --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = 'itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
								    <th class = "qtyVal" data-sort="OKQTY" data-type="number">${i18n.t('table.inventory')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('table.incoming')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('table.incoming.return')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('table.incoming.exception')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('table.load')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('table.load.return')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('table.load.exception')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('table.stock.move')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('table.adjustment')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('table.total')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="salesStorageStockListListTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesStorageStockListPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="salesStorageStockList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="salesStorageStockList_itemsPerPage" class="items-per-page-select">
					            <option value="100" selected>100</option>
					            <option value="300">300</option>
					            <option value="1000">1000</option>
					        </select>
					    </div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		// 화면에 기본 날짜 세팅
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#salesStorageStockList_searchVal_fromDate").val(fromDate);
			$("#salesStorageStockList_searchVal_toDate").val(toDate);
			console.log("toDate : "+toDate);
			// ✅ Select 초기값 설정 추가!
			$("#salesStorageStockList_itemsPerPage").val(salesStorageStockListItemsPerPage);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSalesStorageStockListTableData();
		// 페이지네이션 렌더링
		renderSalesStorageStockListPagination();
		// 이벤트 바인딩
		bindSalesStorageStockListEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesStorageStockListTotalCount();
	}

	function fmtLocalDate(d) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${dd}`;
	}

	function getDefaultDateRange() {
		const today = new Date();
		const toDate = fmtLocalDate(today);
		const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);	 // 이번 달 1일
		const fromDate = fmtLocalDate(firstOfMonth);
		return { fromDate, toDate };
	}

	function renderFactoryStorage() {
		const factory = $('#salesStorageStockList_searchVal_factory');
		const storage = $('#salesStorageStockList_searchVal_storage');
		
		// 기본 선택: 쿠키값 있으면 그걸로
		const savedFactory = (getCookie('selectedFactory') || '').trim().toUpperCase();
		factory.val(savedFactory || 'all');

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

		factory.off('change').on('change', function() {
			updateStorageOptions($(this).val());
		});
	}



	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// ✅ 추가!
	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function updateSalesStorageStockListTotalCount() {
		$(".salesStorageStockListTotalQty").text(Number(totalQty).toLocaleString());
		$('#salesStorageStockListTotalCount').text(Number(totalSalesStorageStockListCount).toLocaleString());
		$('#salesStorageStockListCurrentPageInfo').text(currentSalesStorageStockListPage);
		$('#salesStorageStockListTotalPageInfo').text(totalSalesStorageStockListPages);
	}

	function renderSalesStorageStockListTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSalesStorageStockListData.length; i++) {
			let rowNumber = (currentSalesStorageStockListPage - 1) * salesStorageStockListItemsPerPage + i + 1;
			let data = globalSalesStorageStockListData[i];
			
			const itemtype = data.ITEMTYPE || data.itemtype;
			let type = '';
			
			switch(itemtype){
				case 'Commodity':
					type = i18n.t('type.commodity');
					break;
				case 'Products':
					type = i18n.t('type.products');
					break;
				case 'Semi-Products':
					type = i18n.t('type.semiProducts');
					break;
				case 'Raw-Materials':
					type = i18n.t('type.rawMaterials');
					break;
				case 'Sub-Materials':
					type = i18n.t('type.subMaterials');
					break;
			}
			
			tableBody += `
            <tr>
            	<td class = "noVal">${rowNumber}</td>
				<td class = "cucodeVal">${type}</td>
				<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
				<td class = "itemnameLongVal">${data.ITEMNAME|| ''}</td>
				<td class = "qtyVal">${Number(data.INVENTORY_QTY).toLocaleString()}</td>				
				<td class = "qtyVal">${Number(data.INCOMING_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.INCOMING_RETURN_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.INCOMING_EXCEPTION_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.LOAD_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.LOAD_RETURN_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.LOAD_EXCEPTION_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.STOCKMOVE_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.ADJUSTMENT_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.TOTAL_QTY).toLocaleString()}</td>
            </tr>
        `;
		}

		$("#salesStorageStockListListTableBody").html(tableBody);
	}

	function renderSalesStorageStockListPagination() {
		let paginationHtml = "";

		if (currentSalesStorageStockListPage > 1) {
			paginationHtml += `<button class="salesStorageStockList-page-btn" data-page="${currentSalesStorageStockListPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesStorageStockList-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesStorageStockListPage - 5);
		let endPage = Math.min(totalSalesStorageStockListPages, currentSalesStorageStockListPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesStorageStockList-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesStorageStockListPage) {
				paginationHtml += `<button class="salesStorageStockList-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesStorageStockList-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesStorageStockListPages) {
			if (endPage < totalSalesStorageStockListPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesStorageStockList-page-btn" data-page="${totalSalesStorageStockListPages}">${totalSalesStorageStockListPages}</button>`;
		}

		if (currentSalesStorageStockListPage < totalSalesStorageStockListPages) {
			paginationHtml += `<button class="salesStorageStockList-page-btn" data-page="${currentSalesStorageStockListPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesStorageStockList-page-btn disabled">&gt;</button>`;
		}

		$("#salesStorageStockListPaginationContainer").html(paginationHtml);
	}

	function bindSalesStorageStockListEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnSalesStorageStockListSearch").off('click').on('click', function() {
			performSalesStorageStockListSearch();
		});

		// 초기화 버튼 클릭
		$(".btnSalesStorageStockListSearchInit").off('click').on('click', function() {
			resetSalesStorageStockListSearch();
		});

		// ✅ 페이지당 항목 수 변경 이벤트 추가
		$('#salesStorageStockList_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesStorageStockListItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
		$(document).off('click', '.salesStorageStockList-page-btn').on('click', '.salesStorageStockList-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesStorageStockListPage = page;
					applyClientPagination();
					renderSalesStorageStockListTableData();
					renderSalesStorageStockListPagination();
					updateSalesStorageStockListTotalCount();
				}
			}
		});

		// 헤더 클릭 시 정렬
		$('#salesStorageStockListTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mSales_storageStock_list input[type="text"], #view_mSales_storageStock_list input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesStorageStockListSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#salesStorageStockList_searchVal_fromDate").val(),
			toDate: $("#salesStorageStockList_searchVal_toDate").val(),
			factory: $("#salesStorageStockList_searchVal_factory").val(),
			storage: $("#salesStorageStockList_searchVal_storage").val(),
			itemcode: $("#salesStorageStockList_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesStorageStockList_searchVal_itemname").val().trim().toUpperCase()
		};
	}


	function performSalesStorageStockListSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesStorageStockListPage = 1;
		performSalesStorageStockListDBSearch(searchCriteria);
	}

	function resetSalesStorageStockListSearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');
		let storage = 'PRODUCT';

		renderFactoryStorage();

		$("#salesStorageStockList_searchVal_itemcode").val('');
		$("#salesStorageStockList_searchVal_itemname").val('');

		// ✅ totals 즉시 초기화 (UI도 즉시 반영)
		totalQty = 0;

		currentSalesStorageStockListPage = 1;
		performSalesStorageStockListDBSearch({ fromDate, toDate, factory, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}


	window.changeSalesStorageStockListItemsPerPage = function(newItemsPerPage) {
		salesStorageStockListItemsPerPage = newItemsPerPage;
		currentSalesStorageStockListPage = 1; // 페이지를 1로 초기화

		// ✅ 쿠키에 저장 추가!
		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesStorageStockListTableData();
		renderSalesStorageStockListPagination();
		updateSalesStorageStockListTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSalesStorageStockListData = function() {
		return {
			total: filteredData_salesStorageStockList.length,
			currentPage: currentSalesStorageStockListPage,
			itemsPerPage: salesStorageStockListItemsPerPage,
			data: filteredData_salesStorageStockList
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesStorageStockListData = function() {
	let searchCriteria = {
		fromDate: $("#salesStorageStockList_searchVal_fromDate").val(),
		toDate: $("#salesStorageStockList_searchVal_toDate").val(),
		factory: $("#salesStorageStockList_searchVal_factory").val(),
		storage: $("#salesStorageStockList_searchVal_storage").val(),
		itemcode: $("#salesStorageStockList_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#salesStorageStockList_searchVal_itemname").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_salesStorageStockList",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log(response);

			ExcelExporter.downloadExcel(filteredData_salesStorageStockList, window.salesStorageStockListColumns, {
				fileName: 'salesStorageStockList_All',
				sheetName: 'salesStorageStockList'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};