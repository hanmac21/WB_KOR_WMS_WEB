/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */

let globalProductionStockCountCompareData = []; // 현재 조회된 데이터 저장
let currentProductionStockCountComparePage = 1; // 현재 페이지
let productionStockCountCompareItemsPerPage = 1000; // 페이지당 항목 수
let totalProductionStockCountCompareCount = 0; // 서버에서 받은 총 개수 저장
let totalProductionStockCountCompareQty = 0; // 서버에서 받은 총 개수 저장
let totalProductionStockCountComparePages = 0; // 서버에서 받은 총 페이지
let total_real = 0;
let total_system = 0;

$(document).ready(function() {

	window.filteredProductionStockCountCompareData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.productionStockCountCompareColumns = [
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
	window.call_mProduction_stock_count_compare = function(menuId) {
		showLoading("data");
		renderFactoryStorage();
		const factory = getCookie('selectedFactory');

		const { startdate, enddate } = getDefaultDateRange();

		const storage = torage = getDefaultStorage(factory);
		
		console.log('storage');
		console.log(storage);
		
		
		console.log("251001" + startdate);
		// 초기 로딩: 공장으로 조회
		//performProductionStockCountCompareDBSearch({ startdate,  factory,storage });

		renderProductionStockCountCompareView();
		
	}

});

// 초기에 창고값이 없어서 창고값 세팅 해주는 함수
function getDefaultStorage(factory) {
	const f = String(factory || '').toUpperCase();
	
	console.log(f)
	
	if (f === 'SALTILLO') {
		return 'H/REST';     // 🔹 SALTILLO 기본 H/REST
	} else if (f === 'PUEBLA') {
		return 'WORKSHOP';   // 🔹 PUEBLA 기본 WORKSHOP
	}
	return 'ALL';            // 🔹 그 외(all) 기본 ALL
}


// DB에서 데이터 조회하는 함수
function performProductionStockCountCompareDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_productionStockCountCompare",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentProductionStockCountComparePage,
			itemsPerPage: productionStockCountCompareItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalProductionStockCountCompareData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			/*totalProductionStockCountCompareCount = data.totalCount || 0;		// 페이징 기능 삭제 251001 hj
			totalProductionStockCountCompareQty = data.totalQty || 0;
			totalProductionStockCountComparePages = data.totalPages || 0;
			currentProductionStockCountComparePage = data.currentPage || 0;*/
			window.filteredProductionStockCountCompareData = globalProductionStockCountCompareData;

			/*total_real = (data.totalQty_real || 0) + " / " + (data.totalCount_real || 0);		// 페이징 기능 삭제 251001 hj
			total_system = (data.totalQty_system || 0) + " / " + (data.totalCount_system || 0);*/



			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mProduction_stock_count_compare').length) {
				renderProductionStockCountCompareView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderProductionStockCountCompareTableData();
				//renderProductionStockCountComparePagination();
				//updateProductionStockCountCompareTotalCount();
				//updateProductionStockCountCompareTotalQty();
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
function renderProductionStockCountCompareView() {
	let content_output = `
			<div class="divBlockControl" id="view_mProduction_stock_count_compare">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="productionStockCountCompare_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionStockCountCompare_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="productionStockCountCompare_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionStockCountCompare_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_rack">${i18n.t('search.rack')}<!-- RACK --></div>
								<input type="text" id="productionStockCountCompare_searchVal_rack" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnProductionStockCountCompareSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnProductionStockCountCompareSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="productionStockCountCompareTotalCount">${totalProductionStockCountCompareCount}</strong> ${i18n.t('table.info.records')}  
								<!--${i18n.t('table.page')} <strong id="productionStockCountCompareCurrentPageInfo">${currentProductionStockCountComparePage}</strong>/<strong id="productionStockCountCompareTotalPageInfo" style="margin-right:50px;">${totalProductionStockCountComparePages}</strong>--> | 
								${i18n.t('search.system.qty')} : <strong id = "productionStockCountCompareTotalQtyCount_system"></strong> || 
								${i18n.t('search.real.qty')} : <strong id = "productionStockCountCompareTotalQtyCount_real"></strong> || 
								${i18n.t('table.diff')} : <strong id = "productionStockCountCompareTotalQtyCount_diff"></strong>

							</span>
							<div class="action-buttons-right mProduction_stock_count_compare">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="productionStockCountCompareExcelBtn" onclick="downloadAllProductionStockCountCompareData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mProduction_stock_count_compare">
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
							<tbody id="productionStockCountCompareTableBody">
							</tbody>
						</table>
						
						<!--페이지네이션 //251001 페이징 삭제 hj
						<div class="pagination" id="productionStockCountComparePaginationContainer">
						</div>-->
					</div>
				</div>
			</div>
		`;

	/*
	
	<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
							<input type="text" id="productionStockCountCompare_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
							<input type="text" id="productionStockCountCompare_searchVal_itemname" />
						</div>
	*/
	/*<button class="btn btn-success" id="productionStockCountCompareExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionStockCountCompareData, productionStockCountCompareColumns, {fileName:'ProductionStockCountCompare', sheetName:'ProductionStockCountCompare'})">Excel</button>*/

	/* 임시 주석 필요시 사용
									${i18n.t('table.info.qty')} : <strong id = "productionStockCountCompareTotalQty"></strong>
	
	<div class="search-label">
							<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
							<input type="text" id="searchVal_location" />
						</div>
						<th>${i18n.t('search.location')}<!-- LOCATION --></th>
						<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
	*/
	$(".w_contentArea").append(content_output);
	hideLoading();
	(function() {
		const { startdate, toDate } = getDefaultDateRange();
		$("#productionStockCountCompare_searchVal_fromDate").val(startdate);
		$("#productionStockCountCompare_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderProductionStockCountCompareTableData();
	// 페이지네이션 렌더링
	//renderProductionStockCountComparePagination();
	// 이벤트 바인딩
	bindProductionStockCountCompareEvents();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#productionStockCountCompare_searchVal_factory');
	const storage = $('#productionStockCountCompare_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'SALTILLO': ['H/REST'],
			'PUEBLA': ['Workshop'],
			'': ['H/REST', 'Workshop', 'all']
		};

		const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {
			const value = item.toUpperCase(); // value는 대문자로 변환
			const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
			storage.append(`<option value="${value}">${text}</option>`);
		});

		// 첫 번째 옵션 선택
		storage.val(storageList[0].toUpperCase());
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
	//window.call_mProduction_stock_count_compare();
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}


function renderProductionStockCountCompareTableData() {
	let tableBody = "";
	console.log("길이 : " + globalProductionStockCountCompareData.length);
	//console.log("globalProductionStockCountCompareData:", globalProductionStockCountCompareData);
	//console.log("데이터 개수:", globalProductionStockCountCompareData.length);
	$("#productionStockCountCompareCurrentPageInfo").text(currentProductionStockCountComparePage);
	$("#productionStockCountCompareTotalPageInfo").text(totalProductionStockCountComparePages);
	//$("#productionStockCountCompareTotalCount").text((globalProductionStockCountCompareData.length+"").replace(/\B(?=(\d{3})+(?!\d))/g, ","));
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	let trqty = 0;
	let tlqty = 0;
	let tdqty = -0
	for (let i = 0; i < globalProductionStockCountCompareData.length; i++) {
		let rowNumber = (currentProductionStockCountComparePage - 1) * productionStockCountCompareItemsPerPage + i + 1;
		// 변수로 먼저 저장
		const row = globalProductionStockCountCompareData[i];

		//console.log(`행 ${i}:`, globalProductionStockCountCompareData[i]); // 각 행 데이터 확인

		let rqty = globalProductionStockCountCompareData[i].RQTY || globalProductionStockCountCompareData[i].rqty || '';
		let lqty = globalProductionStockCountCompareData[i].LQTY || globalProductionStockCountCompareData[i].lqty || '';
		let dqty = globalProductionStockCountCompareData[i].DIFFQTY || globalProductionStockCountCompareData[i].diffqty || '';
		let color = '';
		if (dqty != 0) {
			color = 'orange';
		}
		if (globalProductionStockCountCompareData[i].dlocation == 'TRUE') {
			color = 'orange';
		}
		const itemcode = row.REAL_ITEMCODE || row.real_itemcode || row.SYSTEM_ITEMCODE || row.system_itemcode || '';
		//let sdate = globalProductionStockCountCompareData[i].SDATE || globalProductionStockCountCompareData[i].sdate || '';
		//let location = globalProductionStockCountCompareData[i].LOCATION || globalProductionStockCountCompareData[i].location || '';
		tlqty += Number(lqty);
		trqty += Number(rqty);
		tdqty += Number(dqty);

		// data-itemcode="${itemcode}" data-sdate="${sdate}" data-location="${location}"
		tableBody += `
            <tr class="">
            	<td class = "noVal">${(i + 1)}</td>
				<td class = "dateVal">${globalProductionStockCountCompareData[i].FACTORY || globalProductionStockCountCompareData[i].factory || ''}</td>
				<td class = "locationVal-compare">${globalProductionStockCountCompareData[i].STORAGE || globalProductionStockCountCompareData[i].storage || ''}</td>
				<td class = "itemcodeVal">${globalProductionStockCountCompareData[i].ITEMCODE || globalProductionStockCountCompareData[i].itemcode || ''}</td>
				<td class = "itemnameVal-compare itemnameVal">${globalProductionStockCountCompareData[i].BARCODE || globalProductionStockCountCompareData[i].barcode || ''}</td>
				<td class = "locationVal ${color}">${globalProductionStockCountCompareData[i].LLOCATION || globalProductionStockCountCompareData[i].llocation || ''}</td>
				<td class = "locationVal ${color}">${globalProductionStockCountCompareData[i].RLOCATION || globalProductionStockCountCompareData[i].rlocation || ''}</td>
				<td class = "scanqtyVal">${Number(lqty).toLocaleString()}</td>
				<td class = "qtyVal">${Number(rqty).toLocaleString()}</td>				
				<td class = "qtyVal ${color}">${Number(dqty).toLocaleString()}</td>	
            </tr>
        `;
	}
	$("#productionStockCountCompareTotalQtyCount_real").text(Number(trqty).toLocaleString());
	$("#productionStockCountCompareTotalQtyCount_system").text(Number(tlqty).toLocaleString());
	$("#productionStockCountCompareTotalQtyCount_diff").text(Number(trqty - tlqty).toLocaleString());
	$("#productionStockCountCompareTotalCount").text(Number(globalProductionStockCountCompareData.length).toLocaleString());
	/* 임시 주석 필요시 사용
	<td>${globalProductionStockCountCompareData[i].LOCATION || globalProductionStockCountCompareData[i].location || ''}</td>
	<td>${globalProductionStockCountCompareData[i].YMDHMS || globalProductionStockCountCompareData[i].ymdhms || ''}</td>
	<td class = "dateVal">${realqty.toLocaleString()} (${cntReal || 0})</td>
				<td class = "dateVal">${systemqty.toLocaleString()} (${cntSystem || 0})</td>		
			*/
	//console.log("생성된 tableBody:", tableBody);
	$("#productionStockCountCompareTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderProductionStockCountComparePagination() {
	let totalPages = Math.ceil(totalProductionStockCountCompareCount / productionStockCountCompareItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentProductionStockCountComparePage > 1) {
		paginationHtml += `<button class="productionStockCountCompare-page-btn" data-page="${currentProductionStockCountComparePage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="productionStockCountCompare-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentProductionStockCountComparePage - 5);
	let endPage = Math.min(totalPages, currentProductionStockCountComparePage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="productionStockCountCompare-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentProductionStockCountComparePage) {
			paginationHtml += `<button class="productionStockCountCompare-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="productionStockCountCompare-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="productionStockCountCompare-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentProductionStockCountComparePage < totalPages) {
		paginationHtml += `<button class="productionStockCountCompare-page-btn" data-page="${currentProductionStockCountComparePage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="productionStockCountCompare-page-btn disabled">&gt;</button>`;
	}

	$("#productionStockCountComparePaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindProductionStockCountCompareEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnProductionStockCountCompareSearch").off('click').on('click', function() {
		performProductionStockCountCompareSearch();
	});

	// 초기화 버튼 클릭
	$(".btnProductionStockCountCompareSearchInit").off('click').on('click', function() {
		resetProductionStockCountCompareSearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	/*$(document).off('click', '.productionStockCountCompare-page-btn').on('click', '.productionStockCountCompare-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentProductionStockCountComparePage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performProductionStockCountCompareDBSearch(searchCriteria);
			}
		}
	});*/

	// 엔터키 검색
	$('#view_mProduction_stock_count_compare input[type="text"], #view_mProduction_stock_count_compare input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performProductionStockCountCompareSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		startdate: $("#productionStockCountCompare_searchVal_fromDate").val(),
		itemcode: $("#productionStockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		factory: $("#productionStockCountCompare_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#productionStockCountCompare_searchVal_storage").val().trim().toUpperCase(),
		rack: $("#productionStockCountCompare_searchVal_rack").val().trim().toUpperCase()
		//car: $("#productionStockCountCompare_searchVal_car").val().trim().toUpperCase(),
		//itemcode: $("#productionStockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		//itemname: $("#productionStockCountCompare_searchVal_itemname").val().trim().toUpperCase()
	};
}

// 검색 수행 함수 - DB 조회
function performProductionStockCountCompareSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentProductionStockCountComparePage = 1;
	performProductionStockCountCompareDBSearch(searchCriteria);
}

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayStr = `${year}-${month}-${day}`;
// 검색 조건 초기화
function resetProductionStockCountCompareSearch() {
	const factory = getCookie('selectedFactory');
	const { fromDate, toDate } = getDefaultDateRange();

	$("#productionStockCountCompare_searchVal_fromDate").val(todayStr),
		$("#productionStockCountCompare_searchVal_itemcode").val(''),
		$("#productionStockCountCompare_searchVal_factory").val(''),
		$("#productionStockCountCompare_searchVal_storage").val(''),
		$("#productionStockCountCompare_searchVal_rack").val('')
	//$("#productionStockCountCompare_searchVal_car").val(''),
	//$("#productionStockCountCompare_searchVal_itemcode").val(''),
	//$("#productionStockCountCompare_searchVal_itemname").val('')

	// 초기화 후 전체 데이터 다시 조회
	currentProductionStockCountComparePage = 1;
	//performProductionStockCountCompareDBSearch({ factory });

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
window.changeProductionStockCountCompareItemsPerPage = function(newItemsPerPage) {
	productionStockCountCompareItemsPerPage = newItemsPerPage;
	currentProductionStockCountComparePage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performProductionStockCountCompareDBSearch(searchCriteria);
}

window.exportProductionStockCountCompareData = function() {
	return {
		total: globalProductionStockCountCompareData.length,
		currentPage: currentProductionStockCountComparePage,
		itemsPerPage: productionStockCountCompareItemsPerPage,
		data: globalProductionStockCountCompareData
	};
}


window.downloadAllProductionStockCountCompareData = function() {
	let searchCriteria = {
		startdate: $("#productionStockCountCompare_searchVal_fromDate").val(),
		enddate: $("#productionStockCountCompare_searchVal_toDate").val(),
		location: $("#productionStockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		factory: $("#productionStockCountCompare_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#productionStockCountCompare_searchVal_storage").val().trim().toUpperCase(),
		rack: $("#productionStockCountCompare_searchVal_rack").val().trim().toUpperCase(),
		//car: $("#productionStockCountCompare_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionStockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		//itemname: $("#productionStockCountCompare_searchVal_itemname").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_productionStockCountCompare_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionStockCountCompareColumns, {
				fileName: 'ProductionStockCountCompare_All',
				sheetName: 'ProductionStockCountCompare'
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
$(document).on('click', '.modal_productionStockCountCompare_open', function() {
	// ⬇️ 이 한 줄만 추가하면, 다음 1회 showLoading은 스크롤 보존
	window.__preserveScrollNextLoading = true;
	showLoading("data");

	$('#modal_productionStockCountCompare').fadeIn(500);

	productionStockCountCompareDetail($(this));
});

// 모달 닫기
$(document).on('click', '.modal_productionStockCountCompare_close', function() {
	$('#modal_productionStockCountCompare').fadeOut(200);
});

// ESC 키로 닫기
$(document).keydown(function(e) {
	if (e.keyCode === 27) {
		$('#modal_productionStockCountCompare').fadeOut(200);
	}
});

function productionStockCountCompareDetail(element) {

	$(".tbody_productionStockCountCompare_detail").empty();
	let itemcode = element.data('itemcode');
	let sdate = element.data('sdate');
	let location = element.data('location');

	const detailParam = {
		itemcode: itemcode,
		sdate: sdate,
		location: location
	}

	$.ajax({
		url: "/read_productionStockCountCompare_detail",
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

			$('.tbody_productionStockCountCompare_detail').html(tbody);

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
