/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_wipReturnSummary = [];
let globalWipReturnSummaryData = [];
let currentWipReturnSummaryPage = 1;
let wipReturnSummaryItemsPerPage = 100;
let totalWipReturnSummaryCount = 0;
let totalWipReturnSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredWipReturnSummaryData = [];
	window.wipReturnSummaryColumns = [
		{ key: 'INDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'WCCODE', header: 'Wccode' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_wip_return_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		performWipReturnSummaryDBSearch({ factory, toDate, fromDate });
	}

});
// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
function performWipReturnSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_wipReturnSummary",
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
			filteredData_wipReturnSummary = [...allServerData];
			totalQty = response.totalQty || 0;

			// 페이지 초기화
			currentWipReturnSummaryPage = 1;
			currentSortColumn = null;
			currentSortOrder = 'asc';

			// 클라이언트에서 페이징 처리
			applyClientPagination();

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mPurchase_wip_return_summary').length) {
				renderWipReturnSummaryView();
			} else {
				renderWipReturnSummaryTableData();
				renderWipReturnSummaryPagination();
				updateWipReturnSummaryTotalCount();
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
	wipReturnSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

	totalWipReturnSummaryCount = filteredData_wipReturnSummary.length;
	totalWipReturnSummaryPages = Math.ceil(totalWipReturnSummaryCount / wipReturnSummaryItemsPerPage);

	const startIndex = (currentWipReturnSummaryPage - 1) * wipReturnSummaryItemsPerPage;
	const endIndex = startIndex + wipReturnSummaryItemsPerPage;

	globalWipReturnSummaryData = filteredData_wipReturnSummary.slice(startIndex, endIndex);
	window.filteredWipReturnSummaryData = globalWipReturnSummaryData;
}

// 클라이언트에서 정렬 처리
function applyClientSort(column, dataType) {
	if (currentSortColumn === column) {
		currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
	} else {
		currentSortColumn = column;
		currentSortOrder = 'asc';
	}

	filteredData_wipReturnSummary.sort((a, b) => {
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

	currentWipReturnSummaryPage = 1;
	applyClientPagination();

	renderWipReturnSummaryTableData();
	renderWipReturnSummaryPagination();
	updateWipReturnSummaryTotalCount();

	updateSortIndicators(column);
}

// 헤더에 정렬 방향 표시
function updateSortIndicators(column) {
	$('.data-table thead th').removeClass('sort-asc sort-desc');
	$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
}

// 사용자 뷰 렌더링 함수
function renderWipReturnSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_mPurchase_wip_return_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row mPurchase_wip_detail">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="wipReturnSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="wipReturnSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="wipReturnSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="wipReturnSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_wccode">${i18n.t('search.wccode')}<!-- WCCODE --></div>
								<select id="wipReturnSummary_searchVal_wccode" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="wipReturnSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEM CODE --></div>
								<input type="text" id="wipReturnSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEM NAME --></div>
								<input type="text" id="wipReturnSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnWipReturnSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnWipReturnSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="wipReturnSummaryTotalCount">${totalWipReturnSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="wipReturnSummaryCurrentPageInfo">${currentWipReturnSummaryPage}</strong>/<strong id="wipReturnSummaryTotalPageInfo">${totalWipReturnSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="wipReturnSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_wip_return_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="wipReturnSummaryExcelBtn" onclick="downloadAllWipReturnSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_wip_return_summary" id="wipReturnSummaryTable">
							<thead>
								<tr>
									<th class="noVal">${i18n.t('table.no')}</th>
							        <th class='dateVal' data-sort="INDATE" data-type="date">${i18n.t('search.date')}</th>
							        <th class='factoryVal' data-sort="FACTORY">${i18n.t('search.factory')}</th>
							        <th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}</th>
							        <th class='carVal' data-sort="CAR">${i18n.t('search.car')}</th>
							        <th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
							        <th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
							        <th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
									<th class="wccodeVal" data-sort="WCCODE">${i18n.t('search.wccode')}</th>
							    </tr>
							</thead>
							<tbody id="wipReturnSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="wipReturnSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="wipReturnSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="wipReturnSummary_itemsPerPage" class="items-per-page-select">
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
	$("#wipReturnSummary_searchVal_toDate").val(toDate);
	$("#wipReturnSummary_searchVal_fromDate").val(fromDate);
	$("#wipReturnSummary_itemsPerPage").val(wipReturnSummaryItemsPerPage);

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderWipReturnSummaryTableData();
	// 페이지네이션 렌더링
	renderWipReturnSummaryPagination();
	// 이벤트 바인딩
	bindWipReturnSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateWipReturnSummaryTotalCount();
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

// ✅ 수정 필요
function renderFactoryStorage() {
	const factory = $('#wipReturnSummary_searchVal_factory');
	const storage = $('#wipReturnSummary_searchVal_storage');
	const wccode = $('#wipReturnSummary_searchVal_wccode'); // ✅ 추가
	const savedFactory = getCookie('selectedFactory');

	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'all'],
			'PUEBLA': ['Material', 'PRODUCT', 'all'],
			'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'all']
		};

		const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		storage.val(storageList[0]);

		window.autoSetStorageFields();
	}

	// ✅ 추가
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

		wccode.val(wccodeList[0]);
	}

	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
		factory.val(savedFactory);
	}

	updateStorageOptions(savedFactory || '');
	updateWccodeOptions(savedFactory || ''); // ✅ 추가

	factory.on('change', function() {
		updateStorageOptions($(this).val());
		updateWccodeOptions($(this).val()); // ✅ 추가
	});
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

function updateWipReturnSummaryTotalCount() {
	$(".wipReturnSummaryTotalQty").text(Number(totalQty).toLocaleString());
	$('#wipReturnSummaryTotalCount').text(Number(totalWipReturnSummaryCount).toLocaleString());
	$('#wipReturnSummaryCurrentPageInfo').text(currentWipReturnSummaryPage);
	$('#wipReturnSummaryTotalPageInfo').text(totalWipReturnSummaryPages);
}

function renderWipReturnSummaryTableData() {
	let tableBody = "";

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalWipReturnSummaryData.length; i++) {
		let rowNumber = (currentWipReturnSummaryPage - 1) * wipReturnSummaryItemsPerPage + i + 1;
		let data = globalWipReturnSummaryData[i];
		
		tableBody += `
			<tr>
			    <td class = "noVal">${rowNumber}</td>
	            <td class = "dateVal">${data.INDATE || data.indate || ''}</td>
	            <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
				<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
				<td class = "carVal">${data.CAR || data.car || ''}</td>
				<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
				<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
				<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
				<td class = "wccodeVal">${data.WCCODE || data.wccode || ''}</td>
			</tr>
		`;
	}

	$("#wipReturnSummaryTableBody").html(tableBody);
}

function renderWipReturnSummaryPagination() {
	let paginationHtml = "";

	if (currentWipReturnSummaryPage > 1) {
		paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="${currentWipReturnSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="wipReturnSummary-page-btn disabled">&lt;</button>`;
	}

	let startPage = Math.max(1, currentWipReturnSummaryPage - 5);
	let endPage = Math.min(totalWipReturnSummaryPages, currentWipReturnSummaryPage + 5);

	if (startPage > 1) {
		paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	for (let i = startPage; i <= endPage; i++) {
		if (i === currentWipReturnSummaryPage) {
			paginationHtml += `<button class="wipReturnSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	if (endPage < totalWipReturnSummaryPages) {
		if (endPage < totalWipReturnSummaryPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="${totalWipReturnSummaryPages}">${totalWipReturnSummaryPages}</button>`;
	}

	if (currentWipReturnSummaryPage < totalWipReturnSummaryPages) {
		paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="${currentWipReturnSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="wipReturnSummary-page-btn disabled">&gt;</button>`;
	}

	$("#wipReturnSummaryPaginationContainer").html(paginationHtml);
}

function bindWipReturnSummaryEvents() {
	$(".btnWipReturnSummarySearch").off('click').on('click', function() {
		performWipReturnSummarySearch();
	});

	$(".btnWipReturnSummarySearchInit").off('click').on('click', function() {
		resetWipReturnSummarySearch();
	});

	$('#wipReturnSummary_itemsPerPage').off('change').on('change', function() {
		const newItemsPerPage = parseInt($(this).val());
		changeWipReturnSummaryItemsPerPage(newItemsPerPage);
	});

	$(document).off('click', '.wipReturnSummary-page-btn').on('click', '.wipReturnSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentWipReturnSummaryPage = page;
				applyClientPagination();
				renderWipReturnSummaryTableData();
				renderWipReturnSummaryPagination();
				updateWipReturnSummaryTotalCount();
			}
		}
	});

	$('#wipReturnSummaryTable thead th[data-sort]').off('click').on('click', function() {
		const column = $(this).data('sort');
		const dataType = $(this).data('type') || 'string';
		applyClientSort(column, dataType);
	});

	$('#view_mPurchase_wip_return_summary input[type="text"], #view_mPurchase_wip_return_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performWipReturnSummarySearch();
		}
	});
}

function getCurrentSearchCriteria() {
	return {
		fromDate: $("#wipReturnSummary_searchVal_fromDate").val(),
		toDate: $("#wipReturnSummary_searchVal_toDate").val(),
		factory: $("#wipReturnSummary_searchVal_factory").val(),
		storage: $("#wipReturnSummary_searchVal_storage").val(),
		car: $("#wipReturnSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#wipReturnSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#wipReturnSummary_searchVal_itemname").val().trim().toUpperCase(),
		wccode: $("#wipReturnSummary_searchVal_wccode").val(),
	};
}

function performWipReturnSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();
	console.log("검색 조건:", searchCriteria);

	currentWipReturnSummaryPage = 1;
	performWipReturnSummaryDBSearch(searchCriteria);
}

function resetWipReturnSummarySearch() {
	const factory = getCookie('selectedFactory');
	const { fromDate, toDate } = getDefaultDateRange();

	$("#wipReturnSummary_searchVal_fromDate").val(fromDate);
	$("#wipReturnSummary_searchVal_toDate").val(toDate);
	$("#wipReturnSummary_searchVal_car").val('');
	$("#wipReturnSummary_searchVal_itemcode").val('');
	$("#wipReturnSummary_searchVal_itemname").val('');

	// 공장, 창고, 작업장 초기화
	renderFactoryStorage();

	currentWipReturnSummaryPage = 1;
	performWipReturnSummaryDBSearch({ factory, toDate, fromDate });

	console.log('검색 조건이 초기화되었습니다.');
}


window.changeWipReturnSummaryItemsPerPage = function(newItemsPerPage) {
	wipReturnSummaryItemsPerPage = newItemsPerPage;
	currentWipReturnSummaryPage = 1;

	setCookie('itemsPerPage', newItemsPerPage);

	applyClientPagination();
	renderWipReturnSummaryTableData();
	renderWipReturnSummaryPagination();
	updateWipReturnSummaryTotalCount();

	console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
}

window.exportWipReturnSummaryData = function() {
	return {
		total: filteredData_wipReturnSummary.length,
		currentPage: currentWipReturnSummaryPage,
		itemsPerPage: wipReturnSummaryItemsPerPage,
		data: filteredData_wipReturnSummary
	};
}

// 전체 데이터 엑셀 다운로드
window.downloadAllWipReturnSummaryData = function() {
	showLoading("export");

	// ✅ WIP Detail은 데이터 가공 없이 그대로 내보냄
	ExcelExporter.downloadExcel(filteredData_wipReturnSummary, window.wipReturnSummaryColumns, {
		fileName: 'wipReturnSummary_All',
		sheetName: 'wipReturnSummary'
	});

	hideLoading();
};