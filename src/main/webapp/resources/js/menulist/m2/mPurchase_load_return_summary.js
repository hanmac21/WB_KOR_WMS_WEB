/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_loadReturnSummary = [];
let globalLoadReturnSummaryData = [];
let currentLoadReturnSummaryPage = 1;
let loadReturnSummaryItemsPerPage = 100;
let totalLoadReturnSummaryCount = 0;
let totalLoadReturnSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredLoadReturnSummaryData = [];
	window.loadReturnSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'SPEC', header: 'Supplier Code' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'TYPE', header: 'type' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_load_return_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		performLoadReturnSummaryDBSearch({ fromDate, toDate, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performLoadReturnSummaryDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_loadReturnSummary",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				// 서버에서 받은 전체 데이터 저장
				allServerData = response.records || [];
				filteredData_loadReturnSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentLoadReturnSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_load_return_summary').length) {
					renderLoadReturnSummaryView();
				} else {
					renderLoadReturnSummaryTableData();
					renderLoadReturnSummaryPagination();
					updateLoadReturnSummaryTotalCount();
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
		loadReturnSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalLoadReturnSummaryCount = filteredData_loadReturnSummary.length;
		totalLoadReturnSummaryPages = Math.ceil(totalLoadReturnSummaryCount / loadReturnSummaryItemsPerPage);

		const startIndex = (currentLoadReturnSummaryPage - 1) * loadReturnSummaryItemsPerPage;
		const endIndex = startIndex + loadReturnSummaryItemsPerPage;

		globalLoadReturnSummaryData = filteredData_loadReturnSummary.slice(startIndex, endIndex);
		window.filteredLoadReturnSummaryData = globalLoadReturnSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_loadReturnSummary.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

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

		currentLoadReturnSummaryPage = 1;
		applyClientPagination();

		renderLoadReturnSummaryTableData();
		renderLoadReturnSummaryPagination();
		updateLoadReturnSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderLoadReturnSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_load_return_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="loadReturnSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="loadReturnSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="loadReturnSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.suppliername')}<!-- custname --></div>
								<input type="text" id="loadReturnSummary_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="loadReturnSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="loadReturnSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="loadReturnSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="loadReturnSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnLoadReturnSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnLoadReturnSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="loadReturnSummaryTotalCount">${totalLoadReturnSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="loadReturnSummaryCurrentPageInfo">${currentLoadReturnSummaryPage}</strong>/<strong id="loadReturnSummaryTotalPageInfo">${totalLoadReturnSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="loadReturnSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_load_return_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="loadReturnSummaryExcelBtn" onclick="downloadAllLoadReturnSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_load_return_summary" id="loadReturnSummaryTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class='itemcodeVal' data-sort="CUSTNAME">${i18n.t('search.suppliername')}<!-- custname --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class="cnameVal" data-sort="SPEC">${i18n.t('search.customercode')}<!-- CCODE --></th>
									<th class='itemnameVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class="typeVal" data-sort="TYPE">${i18n.t('search.type')}<!-- TYPE --></th>
								</tr>
							</thead>
							<tbody id="loadReturnSummaryDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="loadReturnSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="loadReturnSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="loadReturnSummary_itemsPerPage" class="items-per-page-select">
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
		const { fromDate, toDate } = getDefaultDateRange();
		$("#loadReturnSummary_searchVal_fromDate").val(fromDate);
		$("#loadReturnSummary_searchVal_toDate").val(toDate);
		$("#loadReturnSummary_itemsPerPage").val(loadReturnSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderLoadReturnSummaryTableData();
		// 페이지네이션 렌더링
		renderLoadReturnSummaryPagination();
		// 이벤트 바인딩
		bindLoadReturnSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateLoadReturnSummaryTotalCount();
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
	    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const fromDate = fmtLocalDate(firstDayOfMonth);
		return { fromDate, toDate };
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const storage = $('#loadReturnSummary_searchVal_storage');
		const savedStorage = getCookie('selectedStorage');

		storage.empty();

		let storageList = ['all', 'INBOUND', 'PRODUCT', 'OUTSIDE'];

		// ILLINOIS 사용자는 OUTSIDE만 선택 가능
		if (savedStorage === 'ILLINOIS') {
			storageList = ['OUTSIDE'];
		}

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		storage.val(storageList[0]);

		window.autoSetStorageFields();
	}

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

	function updateLoadReturnSummaryTotalCount() {
		$(".loadReturnSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#loadReturnSummaryTotalCount').text(Number(totalLoadReturnSummaryCount).toLocaleString());
		$('#loadReturnSummaryCurrentPageInfo').text(currentLoadReturnSummaryPage);
		$('#loadReturnSummaryTotalPageInfo').text(totalLoadReturnSummaryPages);
	}

	function renderLoadReturnSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalLoadReturnSummaryData.length; i++) {
			let rowNumber = (currentLoadReturnSummaryPage - 1) * loadReturnSummaryItemsPerPage + i + 1;
			let data = globalLoadReturnSummaryData[i];
			tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
					<td class = 'itemcodeVal'>${data.CUSTNAME || data.custname || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "cnameVal">${data.SPEC || data.spec || ''}</td>
				    <td class = 'itemnameVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "typeVal">${data.TYPE || data.type || ''}</td>
				</tr>
			`;
		}

		$("#loadReturnSummaryDetailTableBody").html(tableBody);
		$('.loadReturnSummary_chkAll').prop('checked', false);
	}

	function renderLoadReturnSummaryPagination() {
		let paginationHtml = "";

		if (currentLoadReturnSummaryPage > 1) {
			paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="${currentLoadReturnSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="loadReturnSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentLoadReturnSummaryPage - 5);
		let endPage = Math.min(totalLoadReturnSummaryPages, currentLoadReturnSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentLoadReturnSummaryPage) {
				paginationHtml += `<button class="loadReturnSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalLoadReturnSummaryPages) {
			if (endPage < totalLoadReturnSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="${totalLoadReturnSummaryPages}">${totalLoadReturnSummaryPages}</button>`;
		}

		if (currentLoadReturnSummaryPage < totalLoadReturnSummaryPages) {
			paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="${currentLoadReturnSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="loadReturnSummary-page-btn disabled">&gt;</button>`;
		}

		$("#loadReturnSummaryPaginationContainer").html(paginationHtml);
	}

	function bindLoadReturnSummaryEvents() {
		$(".btnLoadReturnSummarySearch").off('click').on('click', function() {
			performLoadReturnSummarySearch();
		});

		$(".btnLoadReturnSummarySearchInit").off('click').on('click', function() {
			resetLoadReturnSummarySearch();
		});

		$('#loadReturnSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeLoadReturnSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.loadReturnSummary-page-btn').on('click', '.loadReturnSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentLoadReturnSummaryPage = page;
					applyClientPagination();
					renderLoadReturnSummaryTableData();
					renderLoadReturnSummaryPagination();
					updateLoadReturnSummaryTotalCount();
				}
			}
		});

		$('#loadReturnSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_load_return_summary input[type="text"], #view_mPurchase_load_return_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performLoadReturnSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#loadReturnSummary_searchVal_fromDate").val(),
			toDate: $("#loadReturnSummary_searchVal_toDate").val(),
			storage: $("#loadReturnSummary_searchVal_storage").val(),
			custname: $("#loadReturnSummary_searchVal_custname").val().trim().toUpperCase(),
			car: $("#loadReturnSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#loadReturnSummary_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#loadReturnSummary_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#loadReturnSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performLoadReturnSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentLoadReturnSummaryPage = 1;
		performLoadReturnSummaryDBSearch(searchCriteria);
	}

	function resetLoadReturnSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#loadReturnSummary_searchVal_fromDate").val(fromDate);
		$("#loadReturnSummary_searchVal_toDate").val(toDate);
		$("#loadReturnSummary_searchVal_custname").val('');
		$("#loadReturnSummary_searchVal_car").val('');
		$("#loadReturnSummary_searchVal_itemcode").val('');
		$("#loadReturnSummary_searchVal_oitemcode").val('');
		$("#loadReturnSummary_searchVal_itemname").val('');

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		currentLoadReturnSummaryPage = 1;
		performLoadReturnSummaryDBSearch({ fromDate, toDate, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeLoadReturnSummaryItemsPerPage = function(newItemsPerPage) {
		loadReturnSummaryItemsPerPage = newItemsPerPage;
		currentLoadReturnSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderLoadReturnSummaryTableData();
		renderLoadReturnSummaryPagination();
		updateLoadReturnSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportLoadReturnSummaryData = function() {
		return {
			total: filteredData_loadReturnSummary.length,
			currentPage: currentLoadReturnSummaryPage,
			itemsPerPage: loadReturnSummaryItemsPerPage,
			data: filteredData_loadReturnSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllLoadReturnSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_loadReturnSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.loadReturnSummaryColumns, {
		fileName: 'loadReturnSummary_All',
		sheetName: 'loadReturnSummary'
	});

	hideLoading();
};
