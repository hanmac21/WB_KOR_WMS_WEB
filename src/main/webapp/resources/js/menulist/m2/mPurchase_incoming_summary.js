/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_incomingSummary = [];
let globalIncomingSummaryData = [];
let currentIncomingSummaryPage = 1;
let incomingSummaryItemsPerPage = 100;
let totalIncomingSummaryCount = 0;
let totalIncomingSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredIncomingSummaryData = [];
	window.incomingSummaryColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CUSTCODE', header: 'custcode' },
		{ key: 'CUSTNAME', header: 'custname' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_incomingSummary = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		const storage = 'all';

		performIncomingSummaryDBSearch({ storage, toDate, fromDate });
	}
});

// DB에서 데이터 조회하는 함수
function performIncomingSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_incomingSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
			// ❌ page, itemsPerPage 제거 (클라이언트 페이징이므로)
		}),
		contentType: "application/json",
		success: function(response) {
			console.log("-- DB 조회 결과 (전체) --");
			console.log(response);

			// ✅ 서버 응답 구조 확인 및 데이터 추출
			let records = [];
			let totalCount = 0;
			let totalQtyValue = 0;

			// Case 1: response가 배열인 경우
			if (Array.isArray(response)) {
				records = response;
				totalCount = response.length > 0 && response[0].TOTALCOUNT !== undefined ? response[0].TOTALCOUNT : records.length;
				totalQtyValue = response.length > 0 && response[0].TOTALQTY !== undefined ? response[0].TOTALQTY : 0;
			}
			// Case 2: response가 객체이고 records 속성이 있는 경우
			else if (response && response.records) {
				records = response.records;
				totalCount = response.totalCount || records.length;
				totalQtyValue = response.totalQty || records.reduce((sum, item) => sum + (parseFloat(item.QTY) || 0), 0);
			}
			// Case 3: response의 첫 번째 항목에 TOTALCOUNT가 있는 경우 (MyBatis 서브쿼리 방식)
			else if (response && response.length > 0 && response[0].TOTALCOUNT !== undefined) {
				records = response;
				totalCount = response[0].TOTALCOUNT || 0;
				totalQtyValue = response[0].TOTALQTY || 0;
			}

			console.log("추출된 레코드 수:", records.length);
			console.log("전체 카운트:", totalCount);
			console.log("전체 수량:", totalQtyValue);

			// ✅ 클라이언트 페이징 방식 변수에 할당
			allServerData = records;
			filteredData_incomingSummary = [...allServerData];
			totalQty = totalQtyValue;

			// 페이지 초기화
			currentIncomingSummaryPage = 1;
			currentSortColumn = null;
			currentSortOrder = 'asc';

			// 클라이언트에서 페이징 처리
			applyClientPagination();

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mPurchase_incomingSummary').length) {
				renderIncomingSummaryView();
			} else {
				renderIncomingSummaryTableData();
				renderIncomingSummaryPagination();
				updateIncomingSummaryTotalCount();
			}
			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("DB 조회 실패:", error);
			console.error("응답:", xhr.responseText);
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

// 클라이언트에서 페이징 처리
function applyClientPagination() {
	incomingSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

	totalIncomingSummaryCount = filteredData_incomingSummary.length;
	totalIncomingSummaryPages = Math.ceil(totalIncomingSummaryCount / incomingSummaryItemsPerPage);

	const startIndex = (currentIncomingSummaryPage - 1) * incomingSummaryItemsPerPage;
	const endIndex = startIndex + incomingSummaryItemsPerPage;

	globalIncomingSummaryData = filteredData_incomingSummary.slice(startIndex, endIndex);
	window.filteredIncomingSummaryData = globalIncomingSummaryData;
}

// 클라이언트에서 정렬 처리
function applyClientSort(column, dataType) {
	if (currentSortColumn === column) {
		currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
	} else {
		currentSortColumn = column;
		currentSortOrder = 'asc';
	}

	filteredData_incomingSummary.sort((a, b) => {
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

	currentIncomingSummaryPage = 1;
	applyClientPagination();

	renderIncomingSummaryTableData();
	renderIncomingSummaryPagination();
	updateIncomingSummaryTotalCount();

	updateSortIndicators(column);
}

// 헤더에 정렬 방향 표시
function updateSortIndicators(column) {
	$('.data-table thead th').removeClass('sort-asc sort-desc');
	$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
}

// 사용자 뷰 렌더링 함수
function renderIncomingSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_mPurchase_incomingSummary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="incomingSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="incomingSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="incomingSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_cname">${i18n.t('search.suppliername')}<!-- CNAME --></div>
								<input type="text" id="incomingSummary_searchVal_cname" />
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="incomingSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="incomingSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}<!-- OITEMCODE --></div>
								<input type="text" id="incomingSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="incomingSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnIncomingSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnIncomingSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화--> </button>
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
							<span>${i18n.t('table.info.total')} <strong id="incomingSummaryTotalCount">${totalIncomingSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="incomingSummaryCurrentPageInfo">${currentIncomingSummaryPage}</strong>/<strong id="incomingSummaryTotalPageInfo">${totalIncomingSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="incomingSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_incomingSummary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="incomingSummaryExcelBtn" onclick="downloadAllIncomingSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_incomingSummary" id="incomingSummaryTable">
							<thead>
								<tr>
									<th class = 'noVal'>${i18n.t('table.no')}<!-- No --></th>
									<th class = 'dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}<!-- SDATE --></th>
									<th class = 'statusVal' data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = 'statusVal' data-sort="CUSTCODE">${i18n.t('search.scode')}<!-- CUCODE --></th>
									<th class = 'cnameVal' data-sort="CUSTNAME">${i18n.t('search.suppliername')}<!-- CNAME --></th>
									<th class = 'carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = 'itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEM CODE --></th>
									<th class = 'cnameVal' data-sort="OITEMCODE">${i18n.t('search.customercode')}<!-- OITEM CODE --></th>
									<th class = 'itemnameMedVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEM NAME --></th>
									<th class = 'qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="incomingSummarySummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="incomingSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="incomingSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="incomingSummary_itemsPerPage" class="items-per-page-select">
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
	$("#incomingSummary_searchVal_toDate").val(toDate);
	$("#incomingSummary_searchVal_fromDate").val(fromDate);
	$("#incomingSummary_itemsPerPage").val(incomingSummaryItemsPerPage);



	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderIncomingSummaryTableData();
	// 페이지네이션 렌더링
	renderIncomingSummaryPagination();
	// 이벤트 바인딩
	bindIncomingSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateIncomingSummaryTotalCount();
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
	const storage = $('#incomingSummary_searchVal_storage');

	storage.empty();

	let storageList = ['all', 'MATERIAL', 'PRODUCT', 'WORKSHOP', 'HSD', 'CNF', 'SW'];

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

function updateIncomingSummaryTotalCount() {
	$(".incomingSummaryTotalQty").text(Number(totalQty).toLocaleString());
	$('#incomingSummaryTotalCount').text(Number(totalIncomingSummaryCount).toLocaleString());
	$('#incomingSummaryCurrentPageInfo').text(currentIncomingSummaryPage);
	$('#incomingSummaryTotalPageInfo').text(totalIncomingSummaryPages);
}

function renderIncomingSummaryTableData() {
	let tableBody = "";

	for (let i = 0; i < globalIncomingSummaryData.length; i++) {
		let rowNumber = (currentIncomingSummaryPage - 1) * incomingSummaryItemsPerPage + i + 1;
		let un = globalIncomingSummaryData[i];


		tableBody += `
            <tr>
                <td class = 'noVal'>${rowNumber}</td>
                <td class = 'dateVal'>${globalIncomingSummaryData[i].SDATE || ''}</td>
				<td class = 'statusVal'>${globalIncomingSummaryData[i].STORAGE || ''}</td>
				<td class = 'statusVal'>${globalIncomingSummaryData[i].CUSTCODE || ''}</td>
				<td class = 'cnameVal'>${globalIncomingSummaryData[i].CUSTNAME || ''}</td>
				<td class = 'carVal'>${globalIncomingSummaryData[i].CAR || ''}</td>
				<td class = 'itemcodeVal'>${globalIncomingSummaryData[i].ITEMCODE || ''}</td>
				<td class = 'cnameVal'>${globalIncomingSummaryData[i].OITEMCODE || ''}</td>
				<td class = 'itemnameMedVal'>${globalIncomingSummaryData[i].ITEMNAME || ''}</td>
				<td class = 'qtyVal'>${Number(globalIncomingSummaryData[i].QTY || '').toLocaleString()}</td>
            </tr>
        `;
	}

	$("#incomingSummarySummaryTableBody").html(tableBody);
}

function renderIncomingSummaryPagination() {
	let paginationHtml = "";

	if (currentIncomingSummaryPage > 1) {
		paginationHtml += `<button class="incomingSummary-page-btn" data-page="${currentIncomingSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="incomingSummary-page-btn disabled">&lt;</button>`;
	}

	let startPage = Math.max(1, currentIncomingSummaryPage - 5);
	let endPage = Math.min(totalIncomingSummaryPages, currentIncomingSummaryPage + 5);

	if (startPage > 1) {
		paginationHtml += `<button class="incomingSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	for (let i = startPage; i <= endPage; i++) {
		if (i === currentIncomingSummaryPage) {
			paginationHtml += `<button class="incomingSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="incomingSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	if (endPage < totalIncomingSummaryPages) {
		if (endPage < totalIncomingSummaryPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="incomingSummary-page-btn" data-page="${totalIncomingSummaryPages}">${totalIncomingSummaryPages}</button>`;
	}

	if (currentIncomingSummaryPage < totalIncomingSummaryPages) {
		paginationHtml += `<button class="incomingSummary-page-btn" data-page="${currentIncomingSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="incomingSummary-page-btn disabled">&gt;</button>`;
	}

	$("#incomingSummaryPaginationContainer").html(paginationHtml);
}

function bindIncomingSummaryEvents() {
	$(".btnIncomingSummarySearch").off('click').on('click', function() {
		performIncomingSummarySearch();
	});

	$(".btnIncomingSummarySearchInit").off('click').on('click', function() {
		resetIncomingSummarySearch();
	});

	$('#incomingSummary_itemsPerPage').off('change').on('change', function() {
		const newItemsPerPage = parseInt($(this).val());
		changeIncomingSummaryItemsPerPage(newItemsPerPage);
	});

	$(document).off('click', '.incomingSummary-page-btn').on('click', '.incomingSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentIncomingSummaryPage = page;
				applyClientPagination();
				renderIncomingSummaryTableData();
				renderIncomingSummaryPagination();
				updateIncomingSummaryTotalCount();
			}
		}
	});

	$('#incomingSummaryTable thead th[data-sort]').off('click').on('click', function() {
		const column = $(this).data('sort');
		const dataType = $(this).data('type') || 'string';
		applyClientSort(column, dataType);
	});

	$('#view_mPurchase_incomingSummary input[type="text"], #view_mPurchase_incomingSummary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performIncomingSummarySearch();
		}
	});
}

function getCurrentSearchCriteria() {
	return {
		fromDate: $("#incomingSummary_searchVal_fromDate").val(),
		toDate: $("#incomingSummary_searchVal_toDate").val(),
		storage: $("#incomingSummary_searchVal_storage").val(),
		cname: $("#incomingSummary_searchVal_cname").val().trim().toUpperCase(),
		car: $("#incomingSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#incomingSummary_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#incomingSummary_searchVal_oitemcode").val().trim().toUpperCase(),
		itemname: $("#incomingSummary_searchVal_itemname").val().trim().toUpperCase(),
	};
}

function performIncomingSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();
	console.log("검색 조건:", searchCriteria);

	currentIncomingSummaryPage = 1;
	performIncomingSummaryDBSearch(searchCriteria);
}

function resetIncomingSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();

	$("#incomingSummary_searchVal_fromDate").val(fromDate);
	$("#incomingSummary_searchVal_toDate").val(toDate);
	$("#incomingSummary_searchVal_cname").val('');
	$("#incomingSummary_searchVal_car").val('');
	$("#incomingSummary_searchVal_itemcode").val('');
	$("#incomingSummary_searchVal_oitemcode").val('');
	$("#incomingSummary_searchVal_itemname").val('');

	renderFactoryStorage();
	const storage = 'all';

	currentIncomingSummaryPage = 1;
	performIncomingSummaryDBSearch({  storage, toDate, fromDate });

	console.log('검색 조건이 초기화되었습니다.');
}

window.changeIncomingSummaryItemsPerPage = function(newItemsPerPage) {
	incomingSummaryItemsPerPage = newItemsPerPage;
	currentIncomingSummaryPage = 1;

	setCookie('itemsPerPage', newItemsPerPage);

	applyClientPagination();
	renderIncomingSummaryTableData();
	renderIncomingSummaryPagination();
	updateIncomingSummaryTotalCount();

	console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
}

window.exportIncomingSummaryData = function() {
	return {
		total: filteredData_incomingSummary.length,
		currentPage: currentIncomingSummaryPage,
		itemsPerPage: incomingSummaryItemsPerPage,
		data: filteredData_incomingSummary
	};
}


// 전체 데이터 엑셀 다운로드
// ✅ 수정 (이미 filteredData_incomingSummary에 데이터가 있으므로)
window.downloadAllIncomingSummaryData = function() {
	showLoading("export");

	// ✅ 엑셀 내보내기 전 데이터 가공
	const processedData = filteredData_incomingSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.incomingSummaryColumns, {
		fileName: 'incomingSummary_All',
		sheetName: 'incomingSummary'
	});

	hideLoading();
};
