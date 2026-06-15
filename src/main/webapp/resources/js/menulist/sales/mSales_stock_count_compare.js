/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */

let globalSalesStockCountCompareData = []; // 현재 조회된 데이터 저장
let currentSalesStockCountComparePage = 1; // 현재 페이지
let salesStockCountCompareItemsPerPage = 1000; // 페이지당 항목 수
let totalSalesStockCountCompareCount = 0; // 서버에서 받은 총 개수 저장
let totalSalesStockCountComparePages = 0; // 서버에서 받은 총 페이지
let total_real = 0;
let total_system = 0;

$(document).ready(function() {

	window.filteredSalesStockCountCompareData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.salesStockCountCompareColumns = [
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'LLOCATION', header: 'system location' },
		{ key: 'RLOCATION', header: 'real location' },
		{ key: 'LQTY', header: 'system qty' },
		{ key: 'RQTY', header: 'real qty' },
		{ key: 'DIFFQTY', header: 'diff' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회   2번 조호됨 추후 수정
	window.call_mSales_stock_count_compare = function() {
		showLoading("data");
		renderFactoryStorage();

		renderSalesStockCountCompareView();
	}
});

// DB에서 데이터 조회하는 함수
function performSalesStockCountCompareDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_salesStockCountCompare",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentSalesStockCountComparePage,
			itemsPerPage: salesStockCountCompareItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalSalesStockCountCompareData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			window.filteredSalesStockCountCompareData = globalSalesStockCountCompareData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mSales_stock_count_compare').length) {
				renderSalesStockCountCompareView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderSalesStockCountCompareTableData();
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
function renderSalesStockCountCompareView() {
	let content_output = `
			<div class="divBlockControl" id="view_mSales_stock_count_compare">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="salesStockCountCompare_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesStockCountCompare_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesStockCountCompare_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesStockCountCompare_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_rack">${i18n.t('search.rack')}<!-- RACK --></div>
								<input type="text" id="salesStockCountCompare_searchVal_rack" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnSalesStockCountCompareSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnSalesStockCountCompareSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesStockCountCompareTotalCount">${totalSalesStockCountCompareCount}</strong> ${i18n.t('table.info.records')}  
								${i18n.t('search.system.qty')} : <strong id = "salesStockCountCompareTotalQtyCount_system"></strong> || 
								${i18n.t('search.real.qty')} : <strong id = "salesStockCountCompareTotalQtyCount_real"></strong> || 
								${i18n.t('table.diff')} : <strong id = "salesStockCountCompareTotalQtyCount_diff"></strong>
							</span>
							<div class="action-buttons-right mSales_stock_count_compare">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesStockCountCompareExcelBtn" onclick="downloadAllSalesStockCountCompareData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mSales_stock_count_compare">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
									    <th class = "dateVal">${i18n.t('search.factory')}<!-- factory --></th>
									    <th class = "locationVal-compare">${i18n.t('search.storage')}<!-- storage --></th>
									    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									    <th class = "barcodeVal">${i18n.t('search.barcode')}<!-- barcode --></th>
									    <th class = "locationVal">${i18n.t('search.system.location')}<!-- 시스템로케이션 --></th>
									    <th class = "locationVal">${i18n.t('search.real.location')}<!-- 실사로케이션 --></th>
									    <th class = "scanqtyVal">${i18n.t('search.system.qty')}<!-- QTY --></th>									    
									    <th class = "qtyVal">${i18n.t('search.real.qty')}<!-- QTY --></th>									    
									    <th class = "qtyVal">${i18n.t('table.diff')}<!-- DIFF --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="salesStockCountCompareTableBody">
							</tbody>
						</table>
					</div>
				</div>
			</div>
		`;

	$(".w_contentArea").append(content_output);
	hideLoading();
	(function() {
		const { startdate, toDate } = getDefaultDateRange();
		$("#salesStockCountCompare_searchVal_fromDate").val(startdate);
		$("#salesStockCountCompare_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderSalesStockCountCompareTableData();
	// 이벤트 바인딩
	bindSalesStockCountCompareEvents();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#salesStockCountCompare_searchVal_factory');
	const storage = $('#salesStockCountCompare_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'WBTA': ['MATERIAL', 'PRODUCT', 'all'],
		};

		const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
			storage.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택
		// storage.val(storageList[0].toUpperCase());
		// DOM 렌더링 완료 후 val() 세팅
		setTimeout(() => {
			storage.val(storageList[1]);
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


function renderSalesStockCountCompareTableData() {
	let tableBody = "";
	console.log("길이 : " + globalSalesStockCountCompareData.length);
	$("#salesStockCountCompareCurrentPageInfo").text(currentSalesStockCountComparePage);
	$("#salesStockCountCompareTotalPageInfo").text(totalSalesStockCountComparePages);

	let trqty = 0;
	let tlqty = 0;
	let tdqty = -0
	for (let i = 0; i < globalSalesStockCountCompareData.length; i++) {
		let rowNumber = (currentSalesStockCountComparePage - 1) * salesStockCountCompareItemsPerPage + i + 1;
		// 변수로 먼저 저장
		const row = globalSalesStockCountCompareData[i];
		let rqty = globalSalesStockCountCompareData[i].RQTY || globalSalesStockCountCompareData[i].rqty || '';
		let lqty = globalSalesStockCountCompareData[i].LQTY || globalSalesStockCountCompareData[i].lqty || '';
		let dqty = globalSalesStockCountCompareData[i].DIFFQTY || globalSalesStockCountCompareData[i].diffqty || '';
		let color = '';
		if (dqty != 0) {
			color = 'orange';
		}
		if (globalSalesStockCountCompareData[i].dlocation == 'TRUE') {
			color = 'orange';
		}
		tlqty += Number(lqty);
		trqty += Number(rqty);
		tdqty += Number(dqty);

		tableBody += `
            <tr class="">
            	<td class = "noVal">${(i + 1)}</td>
				<td class = "dateVal">${globalSalesStockCountCompareData[i].FACTORY || globalSalesStockCountCompareData[i].factory || ''}</td>
				<td class = "locationVal-compare">${globalSalesStockCountCompareData[i].STORAGE || globalSalesStockCountCompareData[i].storage || ''}</td>
				<td class = "itemcodeVal">${globalSalesStockCountCompareData[i].ITEMCODE || globalSalesStockCountCompareData[i].itemcode || ''}</td>
				<td class = "barcodeVal itemnameVal">${globalSalesStockCountCompareData[i].BARCODE || globalSalesStockCountCompareData[i].barcode || ''}</td>
				<td class = "locationVal ${color}">${globalSalesStockCountCompareData[i].LLOCATION || globalSalesStockCountCompareData[i].llocation || ''}</td>
				<td class = "locationVal ${color}">${globalSalesStockCountCompareData[i].RLOCATION || globalSalesStockCountCompareData[i].rlocation || ''}</td>
				<td class = "scanqtyVal">${Number(lqty).toLocaleString()}</td>
				<td class = "qtyVal">${Number(rqty).toLocaleString()}</td>				
				<td class = "qtyVal ${color}">${Number(dqty).toLocaleString()}</td>	
            </tr>
        `;
	}
	$("#salesStockCountCompareTotalQtyCount_real").text(Number(trqty).toLocaleString());
	$("#salesStockCountCompareTotalQtyCount_system").text(Number(tlqty).toLocaleString());
	$("#salesStockCountCompareTotalQtyCount_diff").text(Number(trqty - tlqty).toLocaleString());
	$("#salesStockCountCompareTotalCount").text(Number(globalSalesStockCountCompareData.length).toLocaleString());

	//console.log("생성된 tableBody:", tableBody);
	$("#salesStockCountCompareTableBody").html(tableBody);
}

// 이벤트 바인딩
function bindSalesStockCountCompareEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnSalesStockCountCompareSearch").off('click').on('click', function() {
		performSalesStockCountCompareSearch();
	});

	// 초기화 버튼 클릭
	$(".btnSalesStockCountCompareSearchInit").off('click').on('click', function() {
		resetSalesStockCountCompareSearch();
	});

	// 엔터키 검색
	$('#view_mSales_stock_count_compare input[type="text"], #view_mSales_stock_count_compare input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performSalesStockCountCompareSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		startdate: $("#salesStockCountCompare_searchVal_fromDate").val(),
		itemcode: $("#salesStockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		factory: $("#salesStockCountCompare_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#salesStockCountCompare_searchVal_storage").val().trim().toUpperCase(),
		rack: $("#salesStockCountCompare_searchVal_rack").val().trim().toUpperCase()
	};
}

// 검색 수행 함수 - DB 조회
function performSalesStockCountCompareSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentSalesStockCountComparePage = 1;
	performSalesStockCountCompareDBSearch(searchCriteria);
}

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayStr = `${year}-${month}-${day}`;

// 검색 조건 초기화
function resetSalesStockCountCompareSearch() {

	$("#salesStockCountCompare_searchVal_fromDate").val(todayStr);
	$("#salesStockCountCompare_searchVal_itemcode").val('');
	$("#salesStockCountCompare_searchVal_rack").val('');

	// 공장, 창고 설정
	renderFactoryStorage();

	console.log('검색 조건이 초기화되었습니다.');
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
window.changeSalesStockCountCompareItemsPerPage = function(newItemsPerPage) {
	salesStockCountCompareItemsPerPage = newItemsPerPage;
	currentSalesStockCountComparePage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performSalesStockCountCompareDBSearch(searchCriteria);
}

window.exportSalesStockCountCompareData = function() {
	return {
		total: globalSalesStockCountCompareData.length,
		currentPage: currentSalesStockCountComparePage,
		itemsPerPage: salesStockCountCompareItemsPerPage,
		data: globalSalesStockCountCompareData
	};
}


window.downloadAllSalesStockCountCompareData = function() {
	let searchCriteria = {
		startdate: $("#salesStockCountCompare_searchVal_fromDate").val(),
		itemcode: $("#salesStockCountCompare_searchVal_itemcode").val().trim().toUpperCase(),
		factory: $("#salesStockCountCompare_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#salesStockCountCompare_searchVal_storage").val().trim().toUpperCase(),
		rack: $("#salesStockCountCompare_searchVal_rack").val().trim().toUpperCase(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_salesStockCountCompare",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data.records, window.salesStockCountCompareColumns, {
				fileName: 'SalesStockCountCompare_All',
				sheetName: 'SalesStockCountCompare'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};