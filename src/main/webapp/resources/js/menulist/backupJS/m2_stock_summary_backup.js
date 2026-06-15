/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */

/*let globalStockSummaryData = []; // 현재 조회된 데이터 저장
let currentStockSummaryPage = 1; // 현재 페이지
let stockSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalStockSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalStockSummaryQty = 0; // 서버에서 받은 총 수량 저장
let totalStockSummaryERPQty = 0;
let totalStockSummaryPages = 0; // 서버에서 받은 총 개수 저장
window.filteredStockSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
window.stockSummaryColumns = [
	{ key: 'FACTORY', header: 'factory' },
	{ key: 'CAR', header: 'car' },
	{ key: 'ITEMCODE', header: 'itemcode' },
	{ key: 'SPEC', header: 'customer code' },
	{ key: 'ITEMNAME', header: 'itemname' },
	{ key: 'QTY', header: 'qty' },
	{ key: 'NOQTY1', header: 'In IF X', type: 'number' },
	{ key: 'NOQTY2', header: 'Out IF X', type: 'number' },
	{ key: 'UNPACKQTY', header: 'unpackqty' },
	{ key: 'TOTALQTY', header: 'totalqty' }
];

let saveToDate;

$(document).ready(function() {
	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_stock_summary = function(menuId) {
		showLoading("data");

		const { fromDate } = getDefaultDateRange();
		//const toDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
		const factory = getCookie('selectedFactory');

		// 초기 로딩: 공장으로 조회
		performStockSummaryDBSearch({ factory, fromDate });
	}
});

// DB에서 데이터 조회하는 함수
function performStockSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_stockSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentStockSummaryPage,
			itemsPerPage: stockSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);
			console.log(data.totalQty);
			console.log(data.totalQty.TOTAL_QTY);
			globalStockSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalStockSummaryCount = data.totalCount || 0;
			totalStockSummaryQty = data.totalQty.TOTAL_QTY || 0;
			totalStockSummaryERPQty = data.totalQty.ERPQTY || 0;
			totalStockSummaryPages = data.totalPages || 0;
			window.filteredStockSummaryData = globalStockSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_stock_summary').length) {
				renderStockSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderStockSummaryTableData();
				renderStockSummaryPagination();
				updateStockSummaryTotalCount();
				updateStockSummaryTotalQty();
			}
			$("#stockSummary_searchVal_toDate").val(searchCriteria.toDate);
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
function renderStockSummaryView() {
	let content_output = `
		<div class="divBlockControl" id="view_m2_stock_summary">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<!-- <div class="search-label">
							<div class="searchVal_toDate">${i18n.t('search.date')}</div>
							<input type="date" id="stockSummary_searchVal_toDate" />
						</div> -->
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
							<select id="stockSummary_searchVal_factory" class="">
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
							<select id="stockSummary_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
							<input type="text" id="stockSummary_searchVal_car" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
							<input type="text" id="stockSummary_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
							<input type="text" id="stockSummary_searchVal_itemname" />
						</div>
					</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnStockSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnStockSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
						<span>${i18n.t('table.info.total')} <strong id="stockSummaryTotalCount">${totalStockSummaryCount}</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="stockSummaryCurrentPageInfo">${currentStockSummaryPage}</strong>/<strong id="stockSummaryTotalPageInfo">${totalStockSummaryPages}</strong> | 
							${i18n.t('table.info.qty')} : <strong id = "stockSummaryTotalQty"></strong> |
							SUM QTY : <strong id = "stockSummaryTotalERPQty"></strong>
						</span>
						<div class="action-buttons-right m2_stock_summary">
							<div id="defaultActions" class="action-group">
								<button class="btn btn-success" id="stockSummaryExcelBtn" onclick="downloadAllStockSummaryData()">Excel</button>
							</div>
						</div>
					</div>
					<table class="data-table m2_stock_summary">
						<thead>
							<tr>
								 <tr>
								    <th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
								    <th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>									    
								    <th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
								    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
								    <th class = "itemcodeVal">${i18n.t('search.customercode')}<!-- CUSTCODE --></th>
								    <th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
								    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "qtyVal">${i18n.t('table.qty.inX')}<!-- QTY --></th>
									<th class = "qtyVal">${i18n.t('table.qty.outX')}<!-- QTY --></th>
									<th class = "qtyVal">${i18n.t('table.qty.unpackqty')}<!-- QTY --></th>
								  </tr>
							</tr>
						</thead>
						<tbody id="stockSummaryTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="stockSummaryPaginationContainer">
					</div>
				</div>
			</div>
		</div>
	`;
	/* <th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th> */
	/*<button class="btn btn-success" id="stockSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredStockSummaryData, stockSummaryColumns, {fileName:'StockSummary', sheetName:'StockSummary'})">Excel</button>*/
	/*<th>${i18n.t('search.location')}<!-- LOCATION --></th>*/
	/*<div class="search-label">
							<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
							<input type="text" id="searchVal_location" />
						</div>*/


	/*$(".w_contentArea").append(content_output);

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderStockSummaryTableData();
	// 페이지네이션 렌더링
	renderStockSummaryPagination();
	// 이벤트 바인딩
	bindStockSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateStockSummaryTotalCount();
	// 초기 렌더링 후 totalqty 업데이트
	updateStockSummaryTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#stockSummary_searchVal_factory');
	const storage = $('#stockSummary_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');

    // 공장별 창고 옵션 설정
    function updateStorageOptions(factoryValue) {
        storage.empty();
        
        const options = {
            'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside','AUNDE', 'Material+Sideseat+Outside', 'P1 W/HOUSE', 'REDCAGE', 'all'],
            'PUEBLA': ['Material', 'PRODUCT', 'REDCAGE', 'all'],
            '': ['Material', 'Fabric', 'Side seat', 'Outside','AUNDE', 'Product', 'Material+Sideseat+Outside', 'P1 W/HOUSE', 'REDCAGE', 'all']
        };
        
        const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {
			
			// 자동 창고선택 기능때문에 주석. 대문자로 작동안함. 버그 발생시 되돌리기 251129
			//const value = item.toUpperCase(); // value는 대문자로 변환
			
			const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
			storage.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택
		storage.val(storageList[0]);
        
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

// 총 개수를 업데이트하는 함수
function updateStockSummaryTotalCount() {
	$('#stockSummaryTotalCount').text(totalStockSummaryCount.toLocaleString());
}
// 총 수량를 업데이트하는 함수
function updateStockSummaryTotalQty() {
	$('#stockSummaryTotalQty').text(totalStockSummaryQty.toLocaleString());
	$('#stockSummaryTotalERPQty').text(totalStockSummaryERPQty.toLocaleString());
}

function renderStockSummaryTableData() {
	let tableBody = "";

	//console.log("globalStockSummaryData:", globalStockSummaryData);
	//console.log("데이터 개수:", globalStockSummaryData.length);

	$("#stockSummaryCurrentPageInfo").text(currentStockSummaryPage);
	$("#stockSummaryTotalPageInfo").text(totalStockSummaryPages);
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	
	let totalqty = 0;
	let erpttotalqty = 0;
	for (let i = 0; i < globalStockSummaryData.length; i++) {
		let rowNumber = (currentStockSummaryPage - 1) * stockSummaryItemsPerPage + i + 1;

		//console.log(`행 ${i}:`, globalStockSummaryData[i]); // 각 행 데이터 확인
	
		tableBody += `
        <tr>
        	<td class = "noVal">${rowNumber}</td>
			<td class = "factoryVal">${globalStockSummaryData[i].FACTORY || globalStockSummaryData[i].factory || ''}</td>				
			<td class = "carVal">${globalStockSummaryData[i].CAR || globalStockSummaryData[i].car || ''}</td>
			<td class = "itemcodeVal">${globalStockSummaryData[i].ITEMCODE || globalStockSummaryData[i].itemcode || ''}</td>
			<td class = "itemcodeVal">${globalStockSummaryData[i].SPEC || globalStockSummaryData[i].spec || ''}</td>
			<td class = "itemnameMedVal">${globalStockSummaryData[i].ITEMNAME || globalStockSummaryData[i].itemname || ''}</td>
			<td class = "qtyVal">${Number(globalStockSummaryData[i].QTY || globalStockSummaryData[i].qty || 0).toLocaleString()}</td>
			<td class = "qtyVal">${Number(globalStockSummaryData[i].NOQTY1 || globalStockSummaryData[i].noqty1 || 0).toLocaleString()}</td>
			<td class = "qtyVal">${Number(globalStockSummaryData[i].NOQTY2 || globalStockSummaryData[i].noqty2 || 0).toLocaleString()}</td>
			<td class = "qtyVal">${Number(globalStockSummaryData[i].UNPACKQTY || globalStockSummaryData[i].unpackqty || 0).toLocaleString()}</td>
        </tr>
    `;
		totalqty = totalqty + Number(globalStockSummaryData[i].qty);
	}
	/* <td class = "storageVal">${globalStockSummaryData[i].STORAGE || globalStockSummaryData[i].storage || ''}</td> */
	/*<td>${globalStockSummaryData[i].LOCATION || globalStockSummaryData[i].location || ''}</td>*/
	//console.log("생성된 tableBody:", tableBody);
	/*$("#stockSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderStockSummaryPagination() {
	let totalPages = Math.ceil(totalStockSummaryCount / stockSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentStockSummaryPage > 1) {
		paginationHtml += `<button class="stockSummary-page-btn" data-page="${currentStockSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="stockSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentStockSummaryPage - 5);
	let endPage = Math.min(totalPages, currentStockSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="stockSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentStockSummaryPage) {
			paginationHtml += `<button class="stockSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="stockSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="stockSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentStockSummaryPage < totalPages) {
		paginationHtml += `<button class="stockSummary-page-btn" data-page="${currentStockSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="stockSummary-page-btn disabled">&gt;</button>`;
	}

	$("#stockSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindStockSummaryEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnStockSummarySearch").off('click').on('click', function() {
		performStockSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnStockSummarySearchInit").off('click').on('click', function() {
		resetStockSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.stockSummary-page-btn').on('click', '.stockSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentStockSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				const { fromDate } = getDefaultDateRange();

				let searchCriteria = getCurrentSearchCriteria();
				searchCriteria.fromDate = fromDate;

				performStockSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_stock_summary input[type="text"], #view_m2_stock_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performStockSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		toDate: saveToDate,
		factory: $("#stockSummary_searchVal_factory").val(),
		storage: $("#stockSummary_searchVal_storage").val(),
		car: $("#stockSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#stockSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#stockSummary_searchVal_itemname").val().trim().toUpperCase()
	};
}

// 검색 수행 함수 - DB 조회
function performStockSummarySearch() {
	const { fromDate } = getDefaultDateRange();
	//const { toDate } = $("#storageSummary_searchVal_toDate").val();

	let searchCriteria = getCurrentSearchCriteria();
	searchCriteria.fromDate = fromDate;

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentStockSummaryPage = 1;
	performStockSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetStockSummarySearch() {
	const factory = getCookie('selectedFactory');
	
	$("#stockSummary_searchVal_car").val('');
	$("#stockSummary_searchVal_itemcode").val('');
	$("#stockSummary_searchVal_itemname").val('');

	// 공장, 창고 기본값 설정
	renderFactoryStorage()
	
	// 초기화 후 전체 데이터 다시 조회
	currentStockSummaryPage = 1;
	performStockSummaryDBSearch({ factory });

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
	const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);	 // 이번 달 1일
	const fromDate = fmtLocalDate(firstOfMonth);
	return { fromDate };
}

window.downloadAllStockSummaryData = function() {
	const { fromDate } = getDefaultDateRange();

	let searchCriteria = getCurrentSearchCriteria();
	searchCriteria.fromDate = fromDate;

	showLoading("export");

	$.ajax({
		url: "/read_stockSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			data.forEach(row => {
				// totalqty 값 계산
				row.TOTALQTY = row.QTY - row.NOQTY1 +row.NOQTY2 + row.UNPACKQTY
		    });
			
			// TOTALQTY 합계 계산
	        const totalTotalQty = data.reduce((sum, row) => {
	            const v = Number(row.TOTALQTY) || 0;
	            return sum + v;
	        }, 0);
			
			
			// ⬅ 소수점 두자리까지만 나오도록 반올림
			const totalTotalQtyHeader = Number(totalTotalQty.toFixed(2));
			
			// 엑셀용 컬럼 복사 + TOTALQTY 헤더만 수정
	        const exportColumns = window.stockSummaryColumns.map(col => {
	            if (col.key === 'TOTALQTY') {
	                // 헤더를 합계 값으로 표시 (원하는 텍스트로 바꿔도 됨)
	                return {
	                    ...col,
	                    header: `${totalTotalQtyHeader}`
	                    // 또는 그냥 합계 숫자만:
	                    // header: String(totalTotalQty)
	                };
	            }
	            return col;
	        });
			ExcelExporter.downloadExcel(data, exportColumns, {
				fileName: 'StockSummary_All',
				sheetName: 'StockSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};*/
