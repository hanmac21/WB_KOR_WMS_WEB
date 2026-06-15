/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - WIP Summary (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_wipSummary = [];
let globalWipSummaryData = [];
let currentWipSummaryPage = 1;
let wipSummaryItemsPerPage = 100;
let totalWipSummaryCount = 0;
let totalWipSummaryQty = 0;
let totalWipSummaryPages = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredWipSummaryData = [];
	window.wipSummaryColumns = [
		{ header: 'INDATE', key: 'INDATE' },
		{ header: 'FACTORY', key: 'FACTORY' },
		{ header: 'STORAGE', key: 'STORAGE' },
		{ header: 'CAR', key: 'CAR' },
		{ header: 'ITEMCODE', key: 'ITEMCODE' },
		{ header: 'ITEMNAME', key: 'ITEMNAME' },
		{ header: 'QTY', key: 'QTY' },
		{ header: 'WCCODE', key: 'WCCODE' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_wipSummary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performWipSummaryDBSearch({ fromDate, toDate, factory });
	}
});

// DB에서 데이터 조회하는 함수
function performWipSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_wipSummary",
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
			filteredData_wipSummary = [...allServerData];
			totalWipSummaryQty = totalQtyValue;

			// 페이지 초기화
			currentWipSummaryPage = 1;
			currentSortColumn = null;
			currentSortOrder = 'asc';

			// 클라이언트에서 페이징 처리
			applyClientPagination();

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mPurchase_wipSummary').length) {
				renderWipSummaryView();
			} else {
				renderWipSummaryTableData();
				renderWipSummaryPagination();
				updateWipSummaryTotalCount();
			}

			// 총 수량 업데이트
			updateWipSummaryTotalQty();

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
	wipSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

	totalWipSummaryCount = filteredData_wipSummary.length;
	totalWipSummaryPages = Math.ceil(totalWipSummaryCount / wipSummaryItemsPerPage);

	const startIndex = (currentWipSummaryPage - 1) * wipSummaryItemsPerPage;
	const endIndex = startIndex + wipSummaryItemsPerPage;

	globalWipSummaryData = filteredData_wipSummary.slice(startIndex, endIndex);
	window.filteredWipSummaryData = globalWipSummaryData;
}

// 클라이언트에서 정렬 처리
function applyClientSort(column, dataType) {
	if (currentSortColumn === column) {
		currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
	} else {
		currentSortColumn = column;
		currentSortOrder = 'asc';
	}

	filteredData_wipSummary.sort((a, b) => {
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

	currentWipSummaryPage = 1;
	applyClientPagination();

	renderWipSummaryTableData();
	renderWipSummaryPagination();
	updateWipSummaryTotalCount();

	updateSortIndicators(column);
}

// 헤더에 정렬 방향 표시
function updateSortIndicators(column) {
	$('.data-table thead th').removeClass('sort-asc sort-desc');
	$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
}

// 사용자 뷰 렌더링 함수
function renderWipSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_mPurchase_wipSummary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="wipSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="wipSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="wipSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="wipSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_wccode">${i18n.t('search.wccode')}<!-- WCCODE --></div>
								<select id="wipSummary_searchVal_wccode" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="wipSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="wipSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="wipSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnWipSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnWipSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="wipSummaryTotalCount">${totalWipSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="wipSummaryCurrentPageInfo">${currentWipSummaryPage}</strong>/<strong id="wipSummaryTotalPageInfo">${totalWipSummaryPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id="wipSummaryTotalQty"></strong>
							</span>
							<div class="action-buttons-right mPurchase_wipSummary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="wipSummaryExcelBtn" onclick="downloadAllWipSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_wipSummary" id="wipSummaryTable">
							<thead>
								<tr>
									<th class="noVal">${i18n.t('table.no')}<!-- No --></th>									
									<th class="dateVal" data-sort="INDATE" data-type="date">${i18n.t('search.date')}<!-- INDATE --></th>										
									<th class="factoryVal" data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class="storageVal" data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class="carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class="qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class="wccodeVal" data-sort="WCCODE">${i18n.t('search.wccode')}<!-- WCCODE --></th>
								</tr>
							</thead>
							<tbody id="wipSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="wipSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="wipSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="wipSummary_itemsPerPage" class="items-per-page-select">
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

	// ⬇️ 추가: 화면에 기본 날짜 세팅
	const { fromDate, toDate } = getDefaultDateRange();
	$("#wipSummary_searchVal_fromDate").val(fromDate);
	$("#wipSummary_searchVal_toDate").val(toDate);
	$("#wipSummary_itemsPerPage").val(wipSummaryItemsPerPage);

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderWipSummaryTableData();
	// 페이지네이션 렌더링
	renderWipSummaryPagination();
	// 이벤트 바인딩
	bindWipSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateWipSummaryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateWipSummaryTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#wipSummary_searchVal_factory');
	const storage = $('#wipSummary_searchVal_storage');
	const wccode = $('#wipSummary_searchVal_wccode');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'P1 W/HOUSE', 'all'],
			'PUEBLA': ['Material', 'PRODUCT', 'all'],
			'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'P1 W/HOUSE', 'all']
		};

		const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택 (Material)
		storage.val(storageList[0]);
		
		window.autoSetStorageFields();
	}
	
	// 공장별 작업장 옵션 설정
	function updateWccodeOptions(factoryValue) {
		wccode.empty();

		const options = {
			'SALTILLO': ['H/REST', 'OUTSIDE', 'all'],
			'PUEBLA': ['Workshop', 'all'],
			'': ['H/REST', 'OUTSIDE', 'WORKSHOP', 'all']
		};

		const wccodeList = options[factoryValue] || options[''];

		wccodeList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			wccode.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택
		wccode.val(wccodeList[0]);
		
		window.autoSetStorageFields();
	}

	// 저장된 공장 선택
	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
		factory.val(savedFactory);
	}

	updateStorageOptions(savedFactory || '');
	updateWccodeOptions(savedFactory || '');

	// 공장 변경 시 창고, 작업장 업데이트
	factory.on('change', function() {
		updateStorageOptions($(this).val());
		updateWccodeOptions($(this).val());
	});
	
	window.autoSetStorageFields();
}

// 정규식으로 쿠키 가져오기
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

// 총 개수를 업데이트하는 함수
function updateWipSummaryTotalCount() {
	$('#wipSummaryTotalCount').text(Number(totalWipSummaryCount).toLocaleString());
	$('#wipSummaryCurrentPageInfo').text(currentWipSummaryPage);
	$('#wipSummaryTotalPageInfo').text(totalWipSummaryPages);
}

// 총 수량을 업데이트하는 함수
function updateWipSummaryTotalQty() {
	$('#wipSummaryTotalQty').text(Number(totalWipSummaryQty).toLocaleString());
}

function renderWipSummaryTableData() {
	let tableBody = "";

	for (let i = 0; i < globalWipSummaryData.length; i++) {
		let rowNumber = (currentWipSummaryPage - 1) * wipSummaryItemsPerPage + i + 1;

		tableBody += `
            <tr>
                <td class="noVal">${rowNumber}</td>
                <td class="dateVal">${globalWipSummaryData[i].INDATE || ''}</td>
				<td class="factoryVal">${globalWipSummaryData[i].FACTORY || ''}</td>
				<td class="storageVal">${globalWipSummaryData[i].STORAGE || ''}</td>
				<td class="carVal">${globalWipSummaryData[i].CAR || ''}</td>
				<td class="itemcodeVal">${globalWipSummaryData[i].ITEMCODE || ''}</td>
				<td class="itemnameVal">${globalWipSummaryData[i].ITEMNAME || ''}</td>
				<td class="qtyVal">${Number(globalWipSummaryData[i].QTY || 0).toLocaleString()}</td>
				<td class="wccodeVal">${globalWipSummaryData[i].WCCODE || ''}</td>
            </tr>
        `;
	}

	$("#wipSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderWipSummaryPagination() {
	let paginationHtml = "";

	// 이전 버튼
	if (currentWipSummaryPage > 1) {
		paginationHtml += `<button class="wipSummary-page-btn" data-page="${currentWipSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="wipSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentWipSummaryPage - 5);
	let endPage = Math.min(totalWipSummaryPages, currentWipSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="wipSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentWipSummaryPage) {
			paginationHtml += `<button class="wipSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="wipSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalWipSummaryPages) {
		if (endPage < totalWipSummaryPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="wipSummary-page-btn" data-page="${totalWipSummaryPages}">${totalWipSummaryPages}</button>`;
	}

	// 다음 버튼
	if (currentWipSummaryPage < totalWipSummaryPages) {
		paginationHtml += `<button class="wipSummary-page-btn" data-page="${currentWipSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="wipSummary-page-btn disabled">&gt;</button>`;
	}

	$("#wipSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindWipSummaryEvents() {
	// 검색 버튼 클릭
	$(".btnWipSummarySearch").off('click').on('click', function() {
		performWipSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnWipSummarySearchInit").off('click').on('click', function() {
		resetWipSummarySearch();
	});

	// 페이지당 항목 수 변경
	$('#wipSummary_itemsPerPage').off('change').on('change', function() {
		const newItemsPerPage = parseInt($(this).val());
		changeWipSummaryItemsPerPage(newItemsPerPage);
	});

	// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
	$(document).off('click', '.wipSummary-page-btn').on('click', '.wipSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentWipSummaryPage = page;
				applyClientPagination();
				renderWipSummaryTableData();
				renderWipSummaryPagination();
				updateWipSummaryTotalCount();
			}
		}
	});

	// 테이블 헤더 클릭 - 정렬
	$('#wipSummaryTable thead th[data-sort]').off('click').on('click', function() {
		const column = $(this).data('sort');
		const dataType = $(this).data('type') || 'string';
		applyClientSort(column, dataType);
	});

	// 엔터키 검색
	$('#view_mPurchase_wipSummary input[type="text"], #view_mPurchase_wipSummary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performWipSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		fromDate: $("#wipSummary_searchVal_fromDate").val(),
		toDate: $("#wipSummary_searchVal_toDate").val(),
		factory: $("#wipSummary_searchVal_factory").val(),
		storage: $("#wipSummary_searchVal_storage").val(),
		wccode: $("#wipSummary_searchVal_wccode").val(),
		car: $("#wipSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#wipSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#wipSummary_searchVal_itemname").val().trim().toUpperCase()
	};
}

// 검색 수행 함수 - DB 조회
function performWipSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentWipSummaryPage = 1;
	performWipSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetWipSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const factory = getCookie('selectedFactory');

	$("#wipSummary_searchVal_fromDate").val(fromDate);
	$("#wipSummary_searchVal_toDate").val(toDate);
	$("#wipSummary_searchVal_car").val('');
	$("#wipSummary_searchVal_itemcode").val('');
	$("#wipSummary_searchVal_itemname").val('');

	// 공장, 창고, 작업장 초기화
	renderFactoryStorage();

	// 초기화 후 전체 데이터 다시 조회
	currentWipSummaryPage = 1;
	performWipSummaryDBSearch({ fromDate, toDate, factory });

	console.log('검색 조건이 초기화되었습니다.');
}

// 날짜 형식 변환 함수들
function formatDateToYYYYMMDD(dateStr) {
	if (!dateStr) return '';
	return dateStr.replace(/-/g, '');
}

function formatDateFromYYYYMMDD(dateStr) {
	if (!dateStr || dateStr.length !== 8) return '';
	return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
}

// 유틸리티 함수들
window.changeWipSummaryItemsPerPage = function(newItemsPerPage) {
	wipSummaryItemsPerPage = newItemsPerPage;
	currentWipSummaryPage = 1;

	setCookie('itemsPerPage', newItemsPerPage);

	applyClientPagination();
	renderWipSummaryTableData();
	renderWipSummaryPagination();
	updateWipSummaryTotalCount();

	console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
}

window.exportWipSummaryData = function() {
	return {
		total: filteredData_wipSummary.length,
		currentPage: currentWipSummaryPage,
		itemsPerPage: wipSummaryItemsPerPage,
		data: filteredData_wipSummary
	};
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

// 전체 데이터 엑셀 다운로드
window.downloadAllWipSummaryData = function() {
	showLoading("export");

	// ✅ 클라이언트에 이미 전체 데이터가 있으므로 바로 다운로드
	ExcelExporter.downloadExcel(filteredData_wipSummary, window.wipSummaryColumns, {
		fileName: 'WipSummary_All',
		sheetName: 'WipSummary'
	});

	hideLoading();
};