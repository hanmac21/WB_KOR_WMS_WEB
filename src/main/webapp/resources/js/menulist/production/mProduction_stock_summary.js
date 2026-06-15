/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */

let globalProductionStockSummaryData = []; // 현재 조회된 데이터 저장
let currentProductionStockSummaryPage = 1; // 현재 페이지
let productionStockSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalProductionStockSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalProductionStockSummaryQty = 0; // 서버에서 받은 총 수량 저장
let totalProductionStockSummaryPages = 0; // 서버에서 받은 총 개수 저장
window.filteredProductionStockSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
window.productionStockSummaryColumns = [
	{ key: 'FACTORY', header: 'factory' },
	{ key: 'CAR', header: 'car' },
	{ key: 'ITEMCODE', header: 'itemcode' },
	{ key: 'ITEMNAME', header: 'itemname' },
	{ key: 'QTY', header: 'qty' },
	{ key: 'NOQTY1', header: 'In IF X' },
	{ key: 'NOQTY2', header: 'Out IF X' },
];

$(document).ready(function() {
	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mProduction_stock_summary = function(menuId) {
		showLoading("data");

		const { fromDate } = getDefaultDateRange();
		
		const factory = getCookie('selectedFactory');
		const storage = factory == 'SALTILLO' ? 'H/REST' : 'Workshop'
		
		// 초기 로딩: 공장으로 조회
		performProductionStockSummaryDBSearch({ fromDate, factory, storage });
	}
});

// DB에서 데이터 조회하는 함수
function performProductionStockSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_productionStockSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentProductionStockSummaryPage,
			itemsPerPage: productionStockSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalProductionStockSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalProductionStockSummaryCount = data.totalCount || 0;
			totalProductionStockSummaryQty = data.totalQty || 0;
			totalProductionStockSummaryPages = data.totalPages || 0;
			window.filteredProductionStockSummaryData = globalProductionStockSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mProduction_stock_summary').length) {
				renderProductionStockSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderProductionStockSummaryTableData();
				renderProductionStockSummaryPagination();
				updateProductionStockSummaryTotalCount();
				updateProductionStockSummaryTotalQty();
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
function renderProductionStockSummaryView() {
	let content_output = `
		<div class="divBlockControl" id="view_mProduction_stock_summary">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
							<select id="productionStockSummary_searchVal_factory" class="factory-select">
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
							<select id="productionStockSummary_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
							<input type="text" id="productionStockSummary_searchVal_car" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
							<input type="text" id="productionStockSummary_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
							<input type="text" id="productionStockSummary_searchVal_itemname" />
						</div>
					</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnProductionStockSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnProductionStockSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
						<span>${i18n.t('table.info.total')} <strong id="productionStockSummaryTotalCount">${totalProductionStockSummaryCount}</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="productionStockSummaryCurrentPageInfo">${currentProductionStockSummaryPage}</strong>/<strong id="productionStockSummaryTotalPageInfo">${totalProductionStockSummaryPages}</strong> | 
							${i18n.t('table.info.qty')} : <strong id = "productionStockSummaryTotalQty"></strong>
						</span>
						<div class="action-buttons-right mProduction_stock_summary">
							<div id="defaultActions" class="action-group">
								<button class="btn btn-success" id="productionStockSummaryExcelBtn" onclick="downloadAllProductionStockSummaryData()">Excel</button>
							</div>
						</div>
					</div>
					<table class="data-table mProduction_stock_summary">
						<thead>
							<tr>
								 <tr>
								    <th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
								    <th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>									    
								    <th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
								    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
								    <th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
								    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "qtyVal">${i18n.t('table.qty.inX')}<!-- QTY --></th>
									<th class = "qtyVal">${i18n.t('table.qty.outX')}<!-- QTY --></th>
								  </tr>
							</tr>
						</thead>
						<tbody id="productionStockSummaryTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="productionStockSummaryPaginationContainer">
					</div>
				</div>
			</div>
		</div>
	`;
	/* <th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th> */
	/*<button class="btn btn-success" id="productionStockSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionStockSummaryData, productionStockSummaryColumns, {fileName:'ProductionStockSummary', sheetName:'ProductionStockSummary'})">Excel</button>*/
	/*<th>${i18n.t('search.location')}<!-- LOCATION --></th>*/
	/*<div class="search-label">
							<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
							<input type="text" id="searchVal_location" />
						</div>*/
	
	
	$(".w_contentArea").append(content_output);

	// 공장 및 창고 선택
	renderFactoryStorage();		
	// 테이블 데이터 렌더링
	renderProductionStockSummaryTableData();
	// 페이지네이션 렌더링
	renderProductionStockSummaryPagination();
	// 이벤트 바인딩
	bindProductionStockSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateProductionStockSummaryTotalCount();
	// 초기 렌더링 후 totalqty 업데이트
	updateProductionStockSummaryTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
    const factory = $('#productionStockSummary_searchVal_factory');
    const storage = $('#productionStockSummary_searchVal_storage');
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
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
}

// 총 개수를 업데이트하는 함수
function updateProductionStockSummaryTotalCount() {
	$('#productionStockSummaryTotalCount').text(totalProductionStockSummaryCount.toLocaleString());
}
// 총 수량를 업데이트하는 함수
function updateProductionStockSummaryTotalQty() {
	$('#productionStockSummaryTotalQty').text(totalProductionStockSummaryQty.toLocaleString());
}

function renderProductionStockSummaryTableData() {
	let tableBody = "";

	//console.log("globalProductionStockSummaryData:", globalProductionStockSummaryData);
	//console.log("데이터 개수:", globalProductionStockSummaryData.length);
	
	$("#productionStockSummaryCurrentPageInfo").text(currentProductionStockSummaryPage);
	$("#productionStockSummaryTotalPageInfo").text(totalProductionStockSummaryPages);
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	let totalqty = 0;
	for (let i = 0; i < globalProductionStockSummaryData.length; i++) {
		let rowNumber = (currentProductionStockSummaryPage - 1) * productionStockSummaryItemsPerPage + i + 1;
	
		//console.log(`행 ${i}:`, globalProductionStockSummaryData[i]); // 각 행 데이터 확인

		tableBody += `
        <tr>
        	<td class = "noVal">${rowNumber}</td>
			<td class = "factoryVal">${globalProductionStockSummaryData[i].FACTORY || globalProductionStockSummaryData[i].factory || ''}</td>				
			<td class = "carVal">${globalProductionStockSummaryData[i].CAR || globalProductionStockSummaryData[i].car || ''}</td>
			<td class = "itemcodeVal">${globalProductionStockSummaryData[i].ITEMCODE || globalProductionStockSummaryData[i].itemcode || ''}</td>
			<td class = "itemnameMedVal">${globalProductionStockSummaryData[i].ITEMNAME || globalProductionStockSummaryData[i].itemname || ''}</td>
			<td class = "qtyVal">${Number(globalProductionStockSummaryData[i].QTY || globalProductionStockSummaryData[i].qty || 0).toLocaleString()}</td>
			<td class = "qtyVal">${Number(globalProductionStockSummaryData[i].NOQTY1 || globalProductionStockSummaryData[i].noqty1 || 0).toLocaleString()}</td>
			<td class = "qtyVal">${Number(globalProductionStockSummaryData[i].NOQTY2 || globalProductionStockSummaryData[i].noqty2 || 0).toLocaleString()}</td>
        </tr>
    `;
	totalqty = totalqty + Number(globalProductionStockSummaryData[i].qty);
	}
	/* <td class = "storageVal">${globalProductionStockSummaryData[i].STORAGE || globalProductionStockSummaryData[i].storage || ''}</td> */
	/*<td>${globalProductionStockSummaryData[i].LOCATION || globalProductionStockSummaryData[i].location || ''}</td>*/
	//console.log("생성된 tableBody:", tableBody);
	$("#productionStockSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderProductionStockSummaryPagination() {
	let totalPages = Math.ceil(totalProductionStockSummaryCount / productionStockSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentProductionStockSummaryPage > 1) {
		paginationHtml += `<button class="productionStockSummary-page-btn" data-page="${currentProductionStockSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="productionStockSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentProductionStockSummaryPage - 5);
	let endPage = Math.min(totalPages, currentProductionStockSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="productionStockSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentProductionStockSummaryPage) {
			paginationHtml += `<button class="productionStockSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="productionStockSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="productionStockSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentProductionStockSummaryPage < totalPages) {
		paginationHtml += `<button class="productionStockSummary-page-btn" data-page="${currentProductionStockSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="productionStockSummary-page-btn disabled">&gt;</button>`;
	}

	$("#productionStockSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindProductionStockSummaryEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnProductionStockSummarySearch").off('click').on('click', function() {
		performProductionStockSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnProductionStockSummarySearchInit").off('click').on('click', function() {
		resetProductionStockSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.productionStockSummary-page-btn').on('click', '.productionStockSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentProductionStockSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				const { fromDate } = getDefaultDateRange();
				
				let searchCriteria = getCurrentSearchCriteria();		
				searchCriteria.fromDate = fromDate;
				
				performProductionStockSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_mProduction_stock_summary input[type="text"], #view_mProduction_stock_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performProductionStockSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		factory: $("#productionStockSummary_searchVal_factory").val(),
		storage: $("#productionStockSummary_searchVal_storage").val(),
		car: $("#productionStockSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionStockSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionStockSummary_searchVal_itemname").val().trim().toUpperCase()
	};
}

// 검색 수행 함수 - DB 조회
function performProductionStockSummarySearch() {
	const { fromDate } = getDefaultDateRange();
	
	let searchCriteria = getCurrentSearchCriteria();		
	searchCriteria.fromDate = fromDate;
	
	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentProductionStockSummaryPage = 1;
	performProductionStockSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetProductionStockSummarySearch() {
	const factory = getCookie('selectedFactory');
	const storage = factory == 'SALTILLO' ? 'H/REST' : 'Workshop'
	renderFactoryStorage();
		
	const { fromDate } = getDefaultDateRange();
	
	$("#productionStockSummary_searchVal_car").val('');
	$("#productionStockSummary_searchVal_itemcode").val('');
	$("#productionStockSummary_searchVal_itemname").val('');

	// 초기화 후 전체 데이터 다시 조회
	currentProductionStockSummaryPage = 1;
	performProductionStockSummaryDBSearch({ fromDate, factory, storage });

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

window.downloadAllProductionStockSummaryData = function() {
	const { fromDate } = getDefaultDateRange();
	
	let searchCriteria = getCurrentSearchCriteria();		
	searchCriteria.fromDate = fromDate;

	showLoading("export");

	$.ajax({
		url: "/read_productionStockSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionStockSummaryColumns, {
				fileName: 'ProductionStockSummary_All',
				sheetName: 'ProductionStockSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};
