/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */

let globalStockCountCompareData = []; // 현재 조회된 데이터 저장
let currentStockCountComparePage = 1; // 현재 페이지
let stockCountCompareItemsPerPage = 1000; // 페이지당 항목 수
let totalStockCountCompareCount = 0; // 서버에서 받은 총 개수 저장
let totalStockCountCompareQty = 0; // 서버에서 받은 총 개수 저장
let totalStockCountComparePages = 0; // 서버에서 받은 총 페이지
let total_real = 0;
let total_system = 0;

let menuType = null;
let saveStorageForInit = null;
let pendingRealStockInit = false;

$(document).ready(function() {

	window.filteredStockCountCompareData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.stockCountCompareColumns = [
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'LLOCATION', header: 'system location' },
		{ key: 'RLOCATION', header: 'real location' },
		{ key: 'LQTY', header: 'system qty' },
		{ key: 'RQTY', header: 'real qty' },
		{ key: 'DIFFQTY', header: 'diff' }
		//{ key: 'YMDHMS', header: 'ymdhms' },
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회   2번 조호됨 추후 수정
	window.call_m2_stock_count_compare = function(menuId) {
		showLoading("data");
		renderFactoryStorage();
		const factory = getCookie('selectedFactory');

		const { startdate, enddate } = getDefaultDateRange();

		//$("#stockCountCompare_searchVal_storage").val() || "";
		console.log("251001" + startdate);
		// 초기 로딩: 공장으로 조회
		//performStockCountCompareDBSearch({ startdate,  factory,storage });

		renderStockCountCompareView();
	}

	// ✅ 메뉴 타입 이벤트 리스너
	document.addEventListener('menuTypeChanged', function(e) {
		menuType = e.detail.menuType;
//		console.log("Menu Type:", e.detail.menuType);
//		console.log("Data Matching:", e.detail.dataMatching);

		// 👉 메뉴는 이미 열렸고(menu 클릭됨), menuType만 늦게 왔을 때
		if (pendingRealStockInit) {
			console.log('menuType 세팅 완료 → 대기 중이던 초기 조회 실행');
			pendingRealStockInit = false;
			initRealStockSearch();
		}
	});
});

// DB에서 데이터 조회하는 함수
function performStockCountCompareDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_stockCountCompare",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentStockCountComparePage,
			itemsPerPage: stockCountCompareItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalStockCountCompareData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			/*totalStockCountCompareCount = data.totalCount || 0;		// 페이징 기능 삭제 251001 hj
			totalStockCountCompareQty = data.totalQty || 0;
			totalStockCountComparePages = data.totalPages || 0;
			currentStockCountComparePage = data.currentPage || 0;*/
			window.filteredStockCountCompareData = globalStockCountCompareData;

			/*total_real = (data.totalQty_real || 0) + " / " + (data.totalCount_real || 0);		// 페이징 기능 삭제 251001 hj
			total_system = (data.totalQty_system || 0) + " / " + (data.totalCount_system || 0);*/



			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_stock_count_compare').length) {
				renderStockCountCompareView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderStockCountCompareTableData();
				//renderStockCountComparePagination();
				//updateStockCountCompareTotalCount();
				//updateStockCountCompareTotalQty();
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

// 사용자 뷰 렌더링 함수
function renderStockCountCompareView() {
	let content_output = `
			<div class="divBlockControl" id="view_m2_stock_count_compare">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="stockCountCompare_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="stockCountCompare_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="stockCountCompare_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountCompare_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_rack">${i18n.t('search.rack')}<!-- RACK --></div>
								<input type="text" id="stockCountCompare_searchVal_rack" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnStockCountCompareSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnStockCountCompareSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="stockCountCompareTotalCount">${totalStockCountCompareCount}</strong> ${i18n.t('table.info.records')}  
								<!--${i18n.t('table.page')} <strong id="stockCountCompareCurrentPageInfo">${currentStockCountComparePage}</strong>/<strong id="stockCountCompareTotalPageInfo" style="margin-right:50px;">${totalStockCountComparePages}</strong>--> | 
								${i18n.t('search.system.qty')} : <strong id = "stockCountCompareTotalQtyCount_system"></strong> || 
								${i18n.t('search.real.qty')} : <strong id = "stockCountCompareTotalQtyCount_real"></strong> || 
								${i18n.t('table.diff')} : <strong id = "stockCountCompareTotalQtyCount_diff"></strong>

							</span>
							<div class="action-buttons-right m2_stock_count_compare">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockCountCompareExcelBtn" onclick="downloadAllStockCountCompareData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_stock_count_compare">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
									    <th class = "dateVal">${i18n.t('search.factory')}<!-- factory --></th>
									    <th class = "locationVal-compare">${i18n.t('search.storage')}<!-- storage --></th>
									    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									    <th class = "itemnameVal-compare">${i18n.t('search.barcode')}<!-- barcode --></th>
									    <th class = "locationVal">${i18n.t('search.system.location')}<!-- 시스템로케이션 --></th>
									    <th class = "locationVal">${i18n.t('search.real.location')}<!-- 실사로케이션 --></th>
									    <th class = "scanqtyVal">${i18n.t('search.system.qty')}<!-- QTY --></th>									    
									    <th class = "qtyVal">${i18n.t('search.real.qty')}<!-- QTY --></th>									    
									    <th class = "qtyVal">${i18n.t('table.diff')}<!-- DIFF --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="stockCountCompareTableBody">
							</tbody>
						</table>
						
						<!--페이지네이션 //251001 페이징 삭제 hj
						<div class="pagination" id="stockCountComparePaginationContainer">
						</div>-->
					</div>
				</div>
			</div>
		`;

	$(".w_contentArea").append(content_output);
	hideLoading();
	(function() {
		const { startdate, toDate } = getDefaultDateRange();
		$("#stockCountCompare_searchVal_fromDate").val(startdate);
		$("#stockCountCompare_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderStockCountCompareTableData();
	// 페이지네이션 렌더링
	//renderStockCountComparePagination();
	// 이벤트 바인딩
	bindStockCountCompareEvents();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#stockCountCompare_searchVal_factory');
	const storage = $('#stockCountCompare_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');
	const savedStorage = getCookie('selectedStorage');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'WBTA': ['INBOUND', 'PRODUCT', 'OUTSIDE', 'all'],
		};

		const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {

			//const value = item.toUpperCase(); // value는 대문자로 변환
			const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
			storage.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택
		// storage.val(storageList[0].toUpperCase());
		// DOM 렌더링 완료 후 val() 세팅
		setTimeout(() => {
			if (menuType === "purchase") {
				saveStorageForInit = "INBOUND";
			} else if (menuType === "sales") {
				saveStorageForInit = "OUTBOUND";
			}
			console.log(menuType);
			if(savedStorage === 'ILLINOIS'){
				storage.val('OUTSIDE').trigger('change');
			}else {
				storage.val(storageList[0]).trigger('change');
			}
		}, 0);

		window.autoSetStorageFields();
	}

	// 저장된 공장 선택
	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
		factory.val(savedFactory);
	}

	updateStorageOptions(savedFactory || '');

	// 공장 변경 시 창고 업데이트
	factory.on('change', function() {
		updateStorageOptions($(this).val());
	});

	window.autoSetStorageFields();
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}


function renderStockCountCompareTableData() {
	let tableBody = "";
	console.log("길이 : " + globalStockCountCompareData.length);
	//console.log("globalStockCountCompareData:", globalStockCountCompareData);
	//console.log("데이터 개수:", globalStockCountCompareData.length);
	$("#stockCountCompareCurrentPageInfo").text(currentStockCountComparePage);
	$("#stockCountCompareTotalPageInfo").text(totalStockCountComparePages);
	//$("#stockCountCompareTotalCount").text((globalStockCountCompareData.length+"").replace(/\B(?=(\d{3})+(?!\d))/g, ","));
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	let trqty = 0;
	let tlqty = 0;
	let tdqty = -0
	for (let i = 0; i < globalStockCountCompareData.length; i++) {
		let rowNumber = (currentStockCountComparePage - 1) * stockCountCompareItemsPerPage + i + 1;
		// 변수로 먼저 저장
		const row = globalStockCountCompareData[i];

		//console.log(`행 ${i}:`, globalStockCountCompareData[i]); // 각 행 데이터 확인

		let rqty = globalStockCountCompareData[i].RQTY || globalStockCountCompareData[i].rqty || '';
		let lqty = globalStockCountCompareData[i].LQTY || globalStockCountCompareData[i].lqty || '';
		let dqty = globalStockCountCompareData[i].DIFFQTY || globalStockCountCompareData[i].diffqty || '';
		let color = '';
		if (dqty != 0) {
			color = 'orange';
		}
		if (globalStockCountCompareData[i].dlocation == 'TRUE') {
			color = 'orange';
		}
		const itemcode = row.REAL_ITEMCODE || row.real_itemcode || row.SYSTEM_ITEMCODE || row.system_itemcode || '';
		//let sdate = globalStockCountCompareData[i].SDATE || globalStockCountCompareData[i].sdate || '';
		//let location = globalStockCountCompareData[i].LOCATION || globalStockCountCompareData[i].location || '';
		tlqty += Number(lqty);
		trqty += Number(rqty);
		tdqty += Number(dqty);

		// data-itemcode="${itemcode}" data-sdate="${sdate}" data-location="${location}"
		tableBody += `
            <tr class="">
            	<td class = "noVal">${(i + 1)}</td>
				<td class = "dateVal">${globalStockCountCompareData[i].FACTORY || globalStockCountCompareData[i].factory || ''}</td>
				<td class = "locationVal-compare">${globalStockCountCompareData[i].STORAGE || globalStockCountCompareData[i].storage || ''}</td>
				<td class = "itemcodeVal">${globalStockCountCompareData[i].ITEMCODE || globalStockCountCompareData[i].itemcode || ''}</td>
				<td class = "itemnameVal-compare itemnameVal">${globalStockCountCompareData[i].BARCODE || globalStockCountCompareData[i].barcode || ''}</td>
				<td class = "locationVal ${color}">${globalStockCountCompareData[i].LLOCATION || globalStockCountCompareData[i].llocation || ''}</td>
				<td class = "locationVal ${color}">${globalStockCountCompareData[i].RLOCATION || globalStockCountCompareData[i].rlocation || ''}</td>
				<td class = "scanqtyVal">${Number(lqty).toLocaleString()}</td>
				<td class = "qtyVal">${Number(rqty).toLocaleString()}</td>				
				<td class = "qtyVal ${color}">${Number(dqty).toLocaleString()}</td>	
            </tr>
        `;
	}
	$("#stockCountCompareTotalQtyCount_real").text(Number(trqty).toLocaleString());
	$("#stockCountCompareTotalQtyCount_system").text(Number(tlqty).toLocaleString());
	$("#stockCountCompareTotalQtyCount_diff").text(Number(trqty - tlqty).toLocaleString());
	$("#stockCountCompareTotalCount").text(Number(globalStockCountCompareData.length).toLocaleString());

	//console.log("생성된 tableBody:", tableBody);
	$("#stockCountCompareTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderStockCountComparePagination() {
	let totalPages = Math.ceil(totalStockCountCompareCount / stockCountCompareItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentStockCountComparePage > 1) {
		paginationHtml += `<button class="stockCountCompare-page-btn" data-page="${currentStockCountComparePage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="stockCountCompare-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentStockCountComparePage - 5);
	let endPage = Math.min(totalPages, currentStockCountComparePage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="stockCountCompare-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentStockCountComparePage) {
			paginationHtml += `<button class="stockCountCompare-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="stockCountCompare-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="stockCountCompare-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentStockCountComparePage < totalPages) {
		paginationHtml += `<button class="stockCountCompare-page-btn" data-page="${currentStockCountComparePage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="stockCountCompare-page-btn disabled">&gt;</button>`;
	}

	$("#stockCountComparePaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindStockCountCompareEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnStockCountCompareSearch").off('click').on('click', function() {
		performStockCountCompareSearch();
	});

	// 초기화 버튼 클릭
	$(".btnStockCountCompareSearchInit").off('click').on('click', function() {
		resetStockCountCompareSearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	/*$(document).off('click', '.stockCountCompare-page-btn').on('click', '.stockCountCompare-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentStockCountComparePage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performStockCountCompareDBSearch(searchCriteria);
			}
		}
	});*/

	// 엔터키 검색
	$('#view_m2_stock_count_compare input[type="text"], #view_m2_stock_count_compare input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performStockCountCompareSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		startdate: $("#stockCountCompare_searchVal_fromDate").val(),
		itemcode: $("#stockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		factory: $("#stockCountCompare_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#stockCountCompare_searchVal_storage").val().trim().toUpperCase(),
		rack: $("#stockCountCompare_searchVal_rack").val().trim().toUpperCase()
		//car: $("#stockCountCompare_searchVal_car").val().trim().toUpperCase(),
		//itemcode: $("#stockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		//itemname: $("#stockCountCompare_searchVal_itemname").val().trim().toUpperCase()
	};
}

// 검색 수행 함수 - DB 조회
function performStockCountCompareSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentStockCountComparePage = 1;
	performStockCountCompareDBSearch(searchCriteria);
}

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayStr = `${year}-${month}-${day}`;

// 검색 조건 초기화
function resetStockCountCompareSearch() {
	const factory = getCookie('selectedFactory');
	const { fromDate, toDate } = getDefaultDateRange();

	$("#stockCountCompare_searchVal_fromDate").val(todayStr),
	$("#stockCountCompare_searchVal_itemcode").val('');
	$("#stockCountCompare_searchVal_rack").val('');
	
	// 공장, 창고 설정
	renderFactoryStorage();
	
	// 초기화 후 전체 데이터 다시 조회
	currentStockCountComparePage = 1;
	//performStockCountCompareDBSearch({ factory });

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

function fmtLocalDate(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${dd}`;
}

function getDefaultDateRange() {
	const today = new Date();
	const toDate = fmtLocalDate(today);
	const startdate = fmtLocalDate(today);
	return { startdate, toDate };
}


// 유틸리티 함수들
window.changeStockCountCompareItemsPerPage = function(newItemsPerPage) {
	stockCountCompareItemsPerPage = newItemsPerPage;
	currentStockCountComparePage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performStockCountCompareDBSearch(searchCriteria);
}

window.exportStockCountCompareData = function() {
	return {
		total: globalStockCountCompareData.length,
		currentPage: currentStockCountComparePage,
		itemsPerPage: stockCountCompareItemsPerPage,
		data: globalStockCountCompareData
	};
}


window.downloadAllStockCountCompareData = function() {
	let searchCriteria = {
		startdate: $("#stockCountCompare_searchVal_fromDate").val(),
		enddate: $("#stockCountCompare_searchVal_toDate").val(),
		location: $("#stockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		factory: $("#stockCountCompare_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#stockCountCompare_searchVal_storage").val().trim().toUpperCase(),
		rack: $("#stockCountCompare_searchVal_rack").val().trim().toUpperCase(),
		//car: $("#stockCountCompare_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#stockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		//itemname: $("#stockCountCompare_searchVal_itemname").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_stockCountCompare_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.stockCountCompareColumns, {
				fileName: 'StockCountCompare_All',
				sheetName: 'StockCountCompare'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};
// 모달 열기
$(document).on('click', '.modal_stockCountCompare_open', function() {
	// ⬇️ 이 한 줄만 추가하면, 다음 1회 showLoading은 스크롤 보존
	window.__preserveScrollNextLoading = true;
	showLoading("data");

	$('#modal_stockCountCompare').fadeIn(500);

	stockCountCompareDetail($(this));
});

// 모달 닫기
$(document).on('click', '.modal_stockCountCompare_close', function() {
	$('#modal_stockCountCompare').fadeOut(200);
});

// ESC 키로 닫기
$(document).keydown(function(e) {
	if (e.keyCode === 27) {
		$('#modal_stockCountCompare').fadeOut(200);
	}
});

function stockCountCompareDetail(element) {

	$(".tbody_stockCountCompare_detail").empty();
	let itemcode = element.data('itemcode');
	let sdate = element.data('sdate');
	let location = element.data('location');

	const detailParam = {
		itemcode: itemcode,
		sdate: sdate,
		location: location
	}

	$.ajax({
		url: "/read_stockCountCompare_detail",
		type: "POST",
		data: JSON.stringify(detailParam),
		contentType: "application/json",
		success: function(data) {
			console.log("Detail Read")
			console.log(data);

			let param = data.stockDB;
			//let systemParam = data.stockDB;
			//let realParam = data.realStockDB;

			/*let taskCount = 0;
			if (systemParam.length > realParam.length) {
				taskCount = systemParam.length;
			} else {
				taskCount = realParam.length;
			}
			console.log("Tast Count == " + taskCount);*/

			const realList = [];
			const systemList = [];

			for (let item of param) {
				let realQty = item.REALQTY;
				let systemQty = item.SYSTEMQTY;

				if (realQty == 0 && systemQty != 0) {
					systemList.push(item);
				} else if (realQty != 0 && systemQty == 0) {
					realList.push(item);
				}
			}
			console.log(realList);
			console.log(systemList);

			let systemParam = systemList;
			let realParam = realList;

			let taskCount = 0;
			if (systemParam.length > realParam.length) {
				taskCount = systemParam.length;
			} else {
				taskCount = realParam.length;
			}

			console.log("Tast Count == " + taskCount);
			let tbody = '';

			for (i = 0; i < taskCount; i++) {
				tbody += "<tr>"
				if (systemParam[i] != undefined) {
					tbody += `
						<!--<td class="compare_dateVal">${systemParam[i].SDATE}</td>
						<td class="compare_locationVal">${systemParam[i].LOCATION}</td>-->
						<td class="compare_barcodeVal">${systemParam[i].BARCODE}</td>
						<td class="compare_itemcodeVal">${systemParam[i].ITEMCODE}</td>
						<td class="compare_qtyVal right-border">${Number(systemParam[i].SYSTEMQTY).toLocaleString()}</td>
					`
				} else {
					tbody += `
						<!--<td class="compare_dateVal"></td>
						<td class="compare_locationVal"></td>-->
						<td class="compare_barcodeVal"></td>
						<td class="compare_itemcodeVal"></td>
						<td class="compare_qtyVal"></td>
					`;
				}
				if (realParam[i] != undefined) {
					tbody += `
						<!--<td class="compare_dateVal">${realParam[i].SDATE}</td>
						<td class="compare_locationVal">${realParam[i].LOCATION}</td>-->
						<td class="compare_barcodeVal">${realParam[i].BARCODE}</td>
						<td class="compare_itemcodeVal">${realParam[i].ITEMCODE}</td>
						<td class="compare_qtyVal">${Number(realParam[i].REALQTY).toLocaleString()}</td>
					`
				} else {
					tbody += `
						<!--<td class="compare_dateVal"></td>
						<td class="compare_locationVal"></td>-->
						<td class="compare_barcodeVal"></td>
						<td class="compare_itemcodeVal"></td>
						<td class="compare_qtyVal"></td>
					`;
				}



				tbody += "</tr>"
			}

			$('.tbody_stockCountCompare_detail').html(tbody);

			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

}
