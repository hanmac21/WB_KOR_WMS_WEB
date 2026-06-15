/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_productionWipStockList = [];
let globalProductionWipStockListData = [];
let currentProductionWipStockListPage = 1;
let productionWipStockListItemsPerPage = 100;
let totalProductionWipStockListCount = 0;
let totalProductionWipStockListPages = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

let totalQty = 0;

$(document).ready(function() {

	window.filteredProductionWipStockListData = [];
	window.productionWipStockListColumns = [
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'INVENTORY_QTY', header: 'Inventory' },
		{ key: 'INCOMING_QTY', header: 'Incoming' },
		{ key: 'INCOMING_RETURN_QTY', header: 'Incoming Return' },
		{ key: 'INCOMING_EXCEPTION_QTY', header: 'Incoming Exception' },
		{ key: 'WIP_INPUT_QTY', header: 'WIP Input' },
		{ key: 'WIP_RETURN_QTY', header: 'WIP Return' },
		{ key: 'LOAD_QTY', header: 'Load' },
		{ key: 'LOAD_RETURN_QTY', header: 'Load Return' },
		{ key: 'LOAD_EXCEPTION_QTY', header: 'Load Exception' },
		{ key: 'RECEIVING_QTY', header: 'Receiving' },
		{ key: 'SENDING_QTY', header: 'Sending' },
		{ key: 'STOCKMOVE_QTY', header: 'Stock Move' },
		{ key: 'PRODUCTION_QTY', header: 'Production' },
		{ key: 'PRODUCTIONMOVE_QTY', header: 'Production Move' },
		{ key: 'ADJUSTMENT_QTY', header: 'Adjustment' },
		{ key: 'TOTAL_QTY', header: 'Total' },
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mProduction_wipStock_list = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		
		const factory = getCookie('selectedFactory');
		const storage = 'H/REST';
		
		performProductionWipStockListDBSearch({ fromDate, toDate, factory, storage });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performProductionWipStockListDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_productionWipStockList",
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
				filteredData_productionWipStockList = [...allServerData]; // 초기에는 필터링 없음
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentProductionWipStockListPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_wipStock_list').length) {
					renderProductionWipStockListView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderProductionWipStockListTableData();
					renderProductionWipStockListPagination();
					updateProductionWipStockListTotalCount();
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


				// 총 수량 업데이트
				updateTotalQty();

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
		productionWipStockListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalProductionWipStockListCount = filteredData_productionWipStockList.length;
		totalProductionWipStockListPages = Math.ceil(totalProductionWipStockListCount / productionWipStockListItemsPerPage);

		// 현재 페이지 범위 계산
		const startIndex = (currentProductionWipStockListPage - 1) * productionWipStockListItemsPerPage;
		const endIndex = startIndex + productionWipStockListItemsPerPage;

		// 현재 페이지 데이터 추출
		globalProductionWipStockListData = filteredData_productionWipStockList.slice(startIndex, endIndex);
		window.filteredProductionWipStockListData = globalProductionWipStockListData;
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
		filteredData_productionWipStockList.sort((a, b) => {
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
		currentProductionWipStockListPage = 1;
		applyClientPagination();

		// 테이블 업데이트
		renderProductionWipStockListTableData();
		renderProductionWipStockListPagination();
		updateProductionWipStockListTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderProductionWipStockListView() {
		let content_output = `
			<div class="divBlockControl" id="view_mProduction_wipStock_list">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
								<input type="month" id="productionWipStockList_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionWipStockList_searchVal_factory">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="productionWipStockList_searchVal_storage" >
									<option value="REDCAGE">REDCAGE</option>
								</select>
							</div>		
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionWipStockList_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productionWipStockList_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnProductionWipStockListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnProductionWipStockListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
								<strong id="productionWipStockListTotalCount">${totalProductionWipStockListCount}</strong>
								${i18n.t('table.info.records')}
								|
								${i18n.t('table.page')}
								<strong id="productionWipStockListCurrentPageInfo">${currentProductionWipStockListPage}</strong>/
								<strong id="productionWipStockListTotalPageInfo">${totalProductionWipStockListPages}</strong>
								|
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span>
								<span class="productionWipStockListTotalQty" style="color:#007bff"></span>
							</span>
						
							<div class="action-buttons-right mProduction_wipStock_list">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="productionWipStockListExcelBtn" onclick="downloadAllProductionWipStockListData()">Excel</button>
								</div>
							</div>
						</div>

						<table class="data-table mProduction_wipStock_list" id="productionWipStockListTable">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
								    <th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = 'itemnameVal_short' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
								    <th class = "qtyVal" data-sort="INVENTORY_QTY" data-type="number">${i18n.t('table.basicqty')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="INCOMING_EXCEPTION_QTY" data-type="number">${i18n.t('table.incoming.exception')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="WIP_INPUT_QTY" data-type="number">${i18n.t('table.wip.input')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="WIP_RETURN_QTY" data-type="number">${i18n.t('table.wip.return')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="LOAD_EXCEPTION_QTY" data-type="number">${i18n.t('table.load.exception')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="TOREDCAGE_QTY" data-type="number">${i18n.t('table.redcage')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="PRODUCTION_QTY" data-type="number">${i18n.t('table.production')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="PRODUCTIONMOVE_QTY" data-type="number">${i18n.t('table.production.move')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="PRODUCTIONUSED_QTY" data-type="number">${i18n.t('table.production.used')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="DISASSEMBLY_QTY" data-type="number">${i18n.t('table.production.disassembly')}<!-- QTY --></th>
									<th class = "qtyVal" data-sort="TOTAL_QTY" data-type="number">${i18n.t('table.totalstockqty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="productionWipStockListListTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="productionWipStockListPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="productionWipStockList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="productionWipStockList_itemsPerPage" class="items-per-page-select">
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
			$("#productionWipStockList_searchVal_fromDate").val(fromDate);
			$("#productionWipStockList_searchVal_toDate").val(toDate);

			// ✅ Select 초기값 설정 추가!
			$("#productionWipStockList_itemsPerPage").val(productionWipStockListItemsPerPage);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderProductionWipStockListTableData();
		// 페이지네이션 렌더링
		renderProductionWipStockListPagination();
		// 이벤트 바인딩
		bindProductionWipStockListEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateProductionWipStockListTotalCount();
	}

//	function fmtLocalDate(d) {
//		const y = d.getFullYear();
//		const m = String(d.getMonth() + 1).padStart(2, '0');
////		const dd = String(d.getDate()).padStart(2, '0');
////		return `${y}-${m}-${dd}`;
//		return `${y}-${m}`;
//	}
//
//	function getDefaultDateRange() {
//		const today = new Date();
//		const toDate = fmtLocalDate(today);
//		const fromDate = fmtLocalDate(today);
//		return { fromDate, toDate };
//	}
	
	function fmtLocalYm(d) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		return `${y}-${m}`;
	}

	function getPrevYm(ym) {
		const [yStr, mStr] = ym.split("-");
		let y = parseInt(yStr, 10);
		let m = parseInt(mStr, 10);

		m -= 1;
		if (m === 0) {
			m = 12;
			y -= 1;
		}

	  return `${y}-${String(m).padStart(2, "0")}`;
	}

	function getDefaultDateRange() {
		const today = new Date();
		const fromDate = fmtLocalYm(today);
		const toDate = getPrevYm(fromDate);

		return { fromDate, toDate };
	}

	function renderFactoryStorage() {
		const factory = $('#productionWipStockList_searchVal_factory');
		const storage = $('#productionWipStockList_searchVal_storage');
	    const savedFactory = getCookie('selectedFactory');
		
		// 공장별 창고 옵션 설정
	    function updateStorageOptions(factoryValue) {
	        storage.empty();
	        
	        const options = {
				SALTILLO: ['H/REST'],
				PUEBLA: ['Workshop'],
				all: ['all'] // all일 때는 storage 강제 의미 없게
			};
	        
	        const storageList = options[factoryValue] || options[''];
	        
	        storageList.forEach(item => {
	            const text = item === 'all' ? i18n.t('search.all') : item;
	            storage.append(`<option value="${item}">${text}</option>`);
	        });
	        
	        // 첫 번째 옵션 선택 (Material)
	        storage.val(storageList[0]);
	    }

	    // 저장된 공장 선택
	    if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
	        factory.val(savedFactory);
	    }

		updateStorageOptions(factory.val());

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

	function updateProductionWipStockListTotalCount() {
		$('#productionWipStockListTotalCount').text(Number(totalProductionWipStockListCount).toLocaleString());
		$('#productionWipStockListCurrentPageInfo').text(currentProductionWipStockListPage);
		$('#productionWipStockListTotalPageInfo').text(totalProductionWipStockListPages);
	}

	function renderProductionWipStockListTableData() {
		let tableBody = "";

		for (let i = 0; i < globalProductionWipStockListData.length; i++) {
			let rowNumber = (currentProductionWipStockListPage - 1) * productionWipStockListItemsPerPage + i + 1;
			let data = globalProductionWipStockListData[i];
			
			tableBody += `
            <tr>
            	<td class = "noVal">${rowNumber}</td>
				<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
				<td class = "itemnameVal_short">${data.ITEMNAME|| ''}</td>
				<td class = "qtyVal">${Number(data.INVENTORY_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.INCOMING_EXCEPTION_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.WIP_INPUT_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.WIP_RETURN_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.LOAD_EXCEPTION_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.TOREDCAGE_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.PRODUCTION_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.PRODUCTIONMOVE_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.PRODUCTIONUSED_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.DISASSEMBLY_QTY).toLocaleString()}</td>
				<td class = "qtyVal">${Number(data.TOTAL_QTY).toLocaleString()}</td>
            </tr>
        `;
		}

		$("#productionWipStockListListTableBody").html(tableBody);
	}

	function renderProductionWipStockListPagination() {
		let paginationHtml = "";

		if (currentProductionWipStockListPage > 1) {
			paginationHtml += `<button class="productionWipStockList-page-btn" data-page="${currentProductionWipStockListPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="productionWipStockList-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentProductionWipStockListPage - 5);
		let endPage = Math.min(totalProductionWipStockListPages, currentProductionWipStockListPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="productionWipStockList-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentProductionWipStockListPage) {
				paginationHtml += `<button class="productionWipStockList-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="productionWipStockList-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalProductionWipStockListPages) {
			if (endPage < totalProductionWipStockListPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="productionWipStockList-page-btn" data-page="${totalProductionWipStockListPages}">${totalProductionWipStockListPages}</button>`;
		}

		if (currentProductionWipStockListPage < totalProductionWipStockListPages) {
			paginationHtml += `<button class="productionWipStockList-page-btn" data-page="${currentProductionWipStockListPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="productionWipStockList-page-btn disabled">&gt;</button>`;
		}

		$("#productionWipStockListPaginationContainer").html(paginationHtml);
	}

	function bindProductionWipStockListEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnProductionWipStockListSearch").off('click').on('click', function() {
			performProductionWipStockListSearch();
		});

		// 초기화 버튼 클릭
		$(".btnProductionWipStockListSearchInit").off('click').on('click', function() {
			resetProductionWipStockListSearch();
		});

		// ✅ 페이지당 항목 수 변경 이벤트 추가
		$('#productionWipStockList_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeProductionWipStockListItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
		$(document).off('click', '.productionWipStockList-page-btn').on('click', '.productionWipStockList-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentProductionWipStockListPage = page;
					applyClientPagination();
					renderProductionWipStockListTableData();
					renderProductionWipStockListPagination();
					updateProductionWipStockListTotalCount();
				}
			}
		});

		// 헤더 클릭 시 정렬
		$('#productionWipStockListTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mProduction_wipStock_list input[type="text"], #view_mProduction_wipStock_list input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performProductionWipStockListSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		const fromDate = $("#productionWipStockList_searchVal_fromDate").val(); // YYYY-MM
		const toDate = fromDate ? getPrevYm(fromDate) : "";                    // ✅ 자동 전월
		
		return {
			fromDate: $("#productionWipStockList_searchVal_fromDate").val(),
			toDate,
			factory: $("#productionWipStockList_searchVal_factory").val(),
			storage: $("#productionWipStockList_searchVal_storage").val(),
			itemcode: $("#productionWipStockList_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#productionWipStockList_searchVal_itemname").val().trim().toUpperCase()
		};
	}


	function performProductionWipStockListSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentProductionWipStockListPage = 1;
		performProductionWipStockListDBSearch(searchCriteria);
	}

	function resetProductionWipStockListSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		
		renderFactoryStorage();
		
		const factory = getCookie('selectedFactory');
		const storage = 'H/REST';	
		
		$("#productionWipStockList_searchVal_itemcode").val('');
		$("#productionWipStockList_searchVal_itemname").val('');

		// ✅ totals 즉시 초기화 (UI도 즉시 반영)
		totalQty = 0;
		updateTotalQty();

		currentProductionWipStockListPage = 1;
		performProductionWipStockListDBSearch({ fromDate, toDate, factory, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".productionWipStockListTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeProductionWipStockListItemsPerPage = function(newItemsPerPage) {
		productionWipStockListItemsPerPage = newItemsPerPage;
		currentProductionWipStockListPage = 1; // 페이지를 1로 초기화

		// ✅ 쿠키에 저장 추가!
		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderProductionWipStockListTableData();
		renderProductionWipStockListPagination();
		updateProductionWipStockListTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportProductionWipStockListData = function() {
		return {
			total: filteredData_productionWipStockList.length,
			currentPage: currentProductionWipStockListPage,
			itemsPerPage: productionWipStockListItemsPerPage,
			data: filteredData_productionWipStockList
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllProductionWipStockListData = function() {
	let searchCriteria = {
		fromDate: $("#productionWipStockList_searchVal_fromDate").val(),
		factory: $("#productionWipStockList_searchVal_factory").val(),
		storage: $("#productionWipStockList_searchVal_storage").val(),
		itemcode: $("#productionWipStockList_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionWipStockList_searchVal_itemname").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_productionWipStockList",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log(response);

			ExcelExporter.downloadExcel(filteredData_productionWipStockList, window.productionWipStockListColumns, {
				fileName: 'productionWipStockList_All',
				sheetName: 'productionWipStockList'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};