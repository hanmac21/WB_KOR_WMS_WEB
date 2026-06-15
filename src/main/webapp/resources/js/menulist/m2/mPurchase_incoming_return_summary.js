/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_incomingReturnSummary = [];
let globalIncomingReturnSummaryData = [];
let currentIncomingReturnSummaryPage = 1;
let incomingReturnSummaryItemsPerPage = 100;
let totalIncomingReturnSummaryCount = 0;
let totalIncomingReturnSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredIncomingReturnSummaryData = [];
	window.incomingReturnSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'TYPE', header: 'Type' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'CAR', header: 'Car' }, 
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'OITEMCODE', header: 'spec' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'QTY', header: 'Qty' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_incoming_return_summary = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		performIncomingReturnSummaryDBSearch({ fromDate, toDate, storage });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performIncomingReturnSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_incomingReturnSummary",
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
				filteredData_incomingReturnSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentIncomingReturnSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_incoming_return_summary').length) {
					renderIncomingReturnSummaryView();
				} else {
					renderIncomingReturnSummaryTableData();
					renderIncomingReturnSummaryPagination();
					updateIncomingReturnSummaryTotalCount();
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
		incomingReturnSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalIncomingReturnSummaryCount = filteredData_incomingReturnSummary.length;
		totalIncomingReturnSummaryPages = Math.ceil(totalIncomingReturnSummaryCount / incomingReturnSummaryItemsPerPage);

		const startIndex = (currentIncomingReturnSummaryPage - 1) * incomingReturnSummaryItemsPerPage;
		const endIndex = startIndex + incomingReturnSummaryItemsPerPage;

		globalIncomingReturnSummaryData = filteredData_incomingReturnSummary.slice(startIndex, endIndex);
		window.filteredIncomingReturnSummaryData = globalIncomingReturnSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_incomingReturnSummary.sort((a, b) => {
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

		currentIncomingReturnSummaryPage = 1;
		applyClientPagination();

		renderIncomingReturnSummaryTableData();
		renderIncomingReturnSummaryPagination();
		updateIncomingReturnSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderIncomingReturnSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_incoming_return_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
								<input type="date" id="incomingReturnSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="incomingReturnSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}</div>
								<select id="incomingReturnSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.suppliername')}<!-- custname --></div>
								<input type="text" id="incomingReturnSummary_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}</div>
								<input type="text" id="incomingReturnSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="incomingReturnSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}</div>
								<input type="text" id="incomingReturnSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="incomingReturnSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnIncomingReturnSummarySearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnIncomingReturnSummarySearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="incomingReturnSummaryTotalCount">${totalIncomingReturnSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="incomingReturnSummaryCurrentPageInfo">${currentIncomingReturnSummaryPage}</strong>/<strong id="incomingReturnSummaryTotalPageInfo">${totalIncomingReturnSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="incomingReturnSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_incoming_return_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="incomingReturnSummaryExcelBtn" onclick="downloadAllIncomingReturnSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_incoming_return_summary" id="incomingReturnSummaryTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}</th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}</th>		
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}</th>
									<th class='typeVal' data-sort="TYPE">${i18n.t('search.type')}<!-- TYPE --></th>
									<th class='cnameVal' data-sort="CUSTNAME">${i18n.t('search.suppliername')}<!-- custname --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}</th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
									<th class='cnameVal' data-sort="OITEMCODE">${i18n.t('search.customercode')}</th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
								</tr>
							</thead>
							<tbody id="incomingReturnSummaryDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="incomingReturnSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="incomingReturnSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="incomingReturnSummary_itemsPerPage" class="items-per-page-select">
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
		$("#incomingReturnSummary_searchVal_fromDate").val(fromDate);
		$("#incomingReturnSummary_searchVal_toDate").val(toDate);
		$("#incomingReturnSummary_itemsPerPage").val(incomingReturnSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderIncomingReturnSummaryTableData();
		// 페이지네이션 렌더링
		renderIncomingReturnSummaryPagination();
		// 이벤트 바인딩
		bindIncomingReturnSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateIncomingReturnSummaryTotalCount();
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
		const storage = $('#incomingReturnSummary_searchVal_storage');
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

	function updateIncomingReturnSummaryTotalCount() {
		$(".incomingReturnSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#incomingReturnSummaryTotalCount').text(Number(totalIncomingReturnSummaryCount).toLocaleString());
		$('#incomingReturnSummaryCurrentPageInfo').text(currentIncomingReturnSummaryPage);
		$('#incomingReturnSummaryTotalPageInfo').text(totalIncomingReturnSummaryPages);
	}

	function renderIncomingReturnSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalIncomingReturnSummaryData.length; i++) {
			let rowNumber = (currentIncomingReturnSummaryPage - 1) * incomingReturnSummaryItemsPerPage + i + 1;
			let data = globalIncomingReturnSummaryData[i];
			tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
				    <td class = 'typeVal'>${data.TYPE || data.type || ''}</td>
					<td class = 'cnameVal'>${data.CUSTNAME || data.custname || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'cnameVal'>${data.OITEMCODE || data.oitemcode || ''}</td>
				    <td class = 'itemnameLongVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
				</tr>
			`;
		}

		$("#incomingReturnSummaryDetailTableBody").html(tableBody);
	}

	function renderIncomingReturnSummaryPagination() {
		let paginationHtml = "";

		if (currentIncomingReturnSummaryPage > 1) {
			paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="${currentIncomingReturnSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="incomingReturnSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentIncomingReturnSummaryPage - 5);
		let endPage = Math.min(totalIncomingReturnSummaryPages, currentIncomingReturnSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentIncomingReturnSummaryPage) {
				paginationHtml += `<button class="incomingReturnSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalIncomingReturnSummaryPages) {
			if (endPage < totalIncomingReturnSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="${totalIncomingReturnSummaryPages}">${totalIncomingReturnSummaryPages}</button>`;
		}

		if (currentIncomingReturnSummaryPage < totalIncomingReturnSummaryPages) {
			paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="${currentIncomingReturnSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="incomingReturnSummary-page-btn disabled">&gt;</button>`;
		}

		$("#incomingReturnSummaryPaginationContainer").html(paginationHtml);
	}

	function bindIncomingReturnSummaryEvents() {
		$(".btnIncomingReturnSummarySearch").off('click').on('click', function() {
			performIncomingReturnSummarySearch();
		});

		$(".btnIncomingReturnSummarySearchInit").off('click').on('click', function() {
			resetIncomingReturnSummarySearch();
		});

		$('#incomingReturnSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeIncomingReturnSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.incomingReturnSummary-page-btn').on('click', '.incomingReturnSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentIncomingReturnSummaryPage = page;
					applyClientPagination();
					renderIncomingReturnSummaryTableData();
					renderIncomingReturnSummaryPagination();
					updateIncomingReturnSummaryTotalCount();
				}
			}
		});

		$('#incomingReturnSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_incoming_return_summary input[type="text"], #view_mPurchase_incoming_return_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performIncomingReturnSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#incomingReturnSummary_searchVal_fromDate").val(),
			toDate: $("#incomingReturnSummary_searchVal_toDate").val(),
			storage: $("#incomingReturnSummary_searchVal_storage").val(),
			custname: $("#incomingReturnSummary_searchVal_custname").val().trim().toUpperCase(),
			car: $("#incomingReturnSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#incomingReturnSummary_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#incomingReturnSummary_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#incomingReturnSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performIncomingReturnSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentIncomingReturnSummaryPage = 1;
		performIncomingReturnSummaryDBSearch(searchCriteria);
	}

	function resetIncomingReturnSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#incomingReturnSummary_searchVal_fromDate").val(fromDate);
		$("#incomingReturnSummary_searchVal_toDate").val(toDate);
		$("#incomingReturnSummary_searchVal_custname").val('');
		$("#incomingReturnSummary_searchVal_car").val('');
		$("#incomingReturnSummary_searchVal_itemcode").val('');
		$("#incomingReturnSummary_searchVal_oitemcode").val('');
		$("#incomingReturnSummary_searchVal_itemname").val('');

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';
		
		currentIncomingReturnSummaryPage = 1;
		performIncomingReturnSummaryDBSearch({ fromDate, toDate, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeIncomingReturnSummaryItemsPerPage = function(newItemsPerPage) {
		incomingReturnSummaryItemsPerPage = newItemsPerPage;
		currentIncomingReturnSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderIncomingReturnSummaryTableData();
		renderIncomingReturnSummaryPagination();
		updateIncomingReturnSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportIncomingReturnSummaryData = function() {
		return {
			total: filteredData_incomingReturnSummary.length,
			currentPage: currentIncomingReturnSummaryPage,
			itemsPerPage: incomingReturnSummaryItemsPerPage,
			data: filteredData_incomingReturnSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllIncomingReturnSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_incomingReturnSummary.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting'),
			PURCHASETYPE: item.CUSTCODE === '0039'
				? i18n.t('search.type.free')
				: i18n.t('search.type.normal')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.incomingReturnSummaryColumns, {
		fileName: 'incomingReturnSummary_All',
		sheetName: 'incomingReturnSummary'
	});

	hideLoading();
};
