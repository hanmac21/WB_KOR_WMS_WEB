/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */

let globalProductionStockCountMissingData = []; // 현재 조회된 데이터 저장
let currentProductionStockCountMissingPage = 1; // 현재 페이지
let productionStockCountMissingItemsPerPage = 1000; // 페이지당 항목 수
let totalProductionStockCountMissingCount = 0; // 서버에서 받은 총 개수 저장
let totalProductionStockCountMissingQty = 0; // 서버에서 받은 총 수량 저장
let totalProductionStockCountMissingPages = 0; // 서버에서 받은 총 페이지
let total_real = 0;
let total_system = 0;

$(document).ready(function() {

	window.filteredProductionStockCountMissingData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.productionStockCountMissingColumns = [
		{ key: 'INDATE', header: 'indate' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'SENDING', header: 'sending' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'FLAG2', header: 'status' }
	];


	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mProduction_stock_count_missing = function(menuId) {
		//showLoading("data");

		const factory = getCookie('selectedFactory');
		const storage = 'Material';

		let startdate = todayStr;
		let enddate = todayStr;

		// 초기 로딩: 공장으로 조회
		//performProductionStockCountMissingDBSearch({ startdate, enddate, factory, storage });
		renderProductionStockCountMissingView();
	}
});

// DB에서 데이터 조회하는 함수
function performProductionStockCountMissingDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_productionStockCountMissing",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentProductionStockCountMissingPage,
			itemsPerPage: productionStockCountMissingItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalProductionStockCountMissingData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalProductionStockCountMissingCount = data.totalCount || 0;
			totalProductionStockCountMissingQty = data.totalQty || 0;
			totalProductionStockCountMissingPages = data.totalPages || 0;
			currentProductionStockCountMissingPage = data.currentPage || 0;
			window.filteredProductionStockCountMissingData = globalProductionStockCountMissingData;

			total_real = (data.totalQty_real || 0) + " / " + (data.totalCount_real || 0);
			//totalCount_real = data.totalCount_real || 0;
			total_system = (data.totalQty_system || 0) + " / " + (data.totalCount_system || 0);
			//totalCount_system = data.totalCount_system || 0;



			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mProduction_stock_count_missing').length) {
				renderProductionStockCountMissingView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderProductionStockCountMissingTableData();
				//renderProductionStockCountMissingPagination();
				updateProductionStockCountMissingTotalCount();
				updateProductionStockCountMissingTotalQty();
			}
			$("#stockNotScanHiddenFactory").val($("#productionStockCountMissing_searchVal_factory").val());
			$("#stockNotScanHiddenStorage").val($("#productionStockCountMissing_searchVal_storage").val());
			$("#stockNotScanHiddenDate").val($("#productionStockCountMissing_searchVal_fromDate").val());
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
function renderProductionStockCountMissingView() {
	let content_output = `
			<div class="divBlockControl" id="view_mProduction_stock_count_missing">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="productionStockCountMissing_searchVal_fromDate" /> 
							</div>
							<!--<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="productionStockCountMissing_searchVal_toDate" />
							</div>-->
							<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
								<input type="text" id="productionStockCountMissing_searchVal_location" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionStockCountMissing_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="productionStockCountMissing_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionStockCountMissing_searchVal_itemcode" />
							</div>
						</div>
							<div class="search_button_area">
								<input type = 'hidden' id = "stockNotScanHiddenFactory">
								<input type = 'hidden' id = "stockNotScanHiddenStorage">
								<input type = 'hidden' id = "stockNotScanHiddenDate">
								<button class="btn btn-primary btnProductionStockCountMissingSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnProductionStockCountMissingSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="productionStockCountMissingTotalCount">${totalProductionStockCountMissingCount}</strong> ${i18n.t('table.info.records')} | 
								<!--${i18n.t('table.page')} <strong id="productionStockCountMissingCurrentPageInfo">${currentProductionStockCountMissingPage}</strong>/<strong id="productionStockCountMissingTotalPageInfo" style="margin-right:50px;">${totalProductionStockCountMissingPages}</strong>-->  
								${i18n.t('table.info.qty')} : <strong id = "productionStockCountMissingTotalQty"></strong>

							</span>
							<div class="action-buttons-right mProduction_stock_count_missing">
								<div id="defaultActions" class="action-group">
									<input type="button" style="display:none" value="${i18n.t('btn.delete')}" class="btn btn-danger btnProductionStockCountMissingExceptionOut"/> <!--임시 블락. 기능 정검 하고 사용 해야함. */ -->
									<input type="button" style="display:none" value="${i18n.t('btn.exceptionOut')}" class="btn btn-success btnProductionStockCountMissingExceptionOut"/>
									<button class="btn btn-primary" style="display:none" id="productionStockCountMissingConfirmBtn" onclick="realStockNotScan()">Confirm</button>
									<button class="btn btn-success" id="productionStockCountMissingExcelBtn" onclick="downloadAllProductionStockCountMissingData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mProduction_stock_count_missing">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
									    <th class = "dateVal">${i18n.t('search.date')}<!-- INDATE --></th>
									    <th class = "locationVal_short">${i18n.t('search.location')}<!-- LOCATION --></th>
									    <th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
									    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									    <th class = "itemnameVal_short">${i18n.t('search.itemName')}<!-- ITEMCODE --></th>
										<th class = "itemcodeVal">${i18n.t('search.lastjob')}<!-- LAST JOB --></th>
									    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>									    
									    <th class = "dateVal"><input type = 'checkbox' class ='check' id = 'stockNotScanCheckAll'>DELETE<!-- QTY --></th>									    
									    <th class = "exStatusVal">Status<!-- STATUS --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="productionStockCountMissingTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션
						<div class="pagination" id="productionStockCountMissingPaginationContainer">
						</div> -->
					</div>
				</div>
			</div>
		`;
		
		/* 삭제기능 임시 블락 - 기능점검후 사용해야함. */
		
	/*<button class="btn btn-success" id="productionStockCountMissingExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionStockCountMissingData, productionStockCountMissingColumns, {fileName:'ProductionStockCountMissing', sheetName:'ProductionStockCountMissing'})">Excel</button>*/

	/* 임시 주석 필요시 사용
									${i18n.t('table.info.qty')} : <strong id = "productionStockCountMissingTotalQty"></strong>
	
	<div class="search-label">
							<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
							<input type="text" id="searchVal_location" />
						</div>
						<th>${i18n.t('search.location')}<!-- LOCATION --></th>
						<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
	*/
	$(".w_contentArea").append(content_output);

	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#productionStockCountMissing_searchVal_fromDate").val(fromDate);
		$("#productionStockCountMissing_searchVal_toDate").val(toDate);
		$("#stockNotScanHiddenDate").val(fromDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderProductionStockCountMissingTableData();
	// 페이지네이션 렌더링
	renderProductionStockCountMissingPagination();
	// 이벤트 바인딩
	bindProductionStockCountMissingEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateProductionStockCountMissingTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateProductionStockCountMissingTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#productionStockCountMissing_searchVal_factory');
	const storage = $('#productionStockCountMissing_searchVal_storage');
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
	$("#stockNotScanHiddenFactory").val($('#productionStockCountMissing_searchVal_factory').val());
	$("#stockNotScanHiddenStorage").val($('#productionStockCountMissing_searchVal_storage').val());
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}

// 총 개수를 업데이트하는 함수
function updateProductionStockCountMissingTotalCount() {
	$('#productionStockCountMissingTotalCount').text(totalProductionStockCountMissingCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateProductionStockCountMissingTotalQty() {
	//$('#productionStockCountMissingTotalQty').text(totalProductionStockCountMissingQty.toLocaleString());
	$('#productionStockCountMissingTotalQty').text(totalProductionStockCountMissingQty.toLocaleString());
}

function renderProductionStockCountMissingTableData() {
	let tableBody = "";

	//console.log("globalProductionStockCountMissingData:", globalProductionStockCountMissingData);
	//console.log("데이터 개수:", globalProductionStockCountMissingData.length);
	$("#productionStockCountMissingCurrentPageInfo").text(currentProductionStockCountMissingPage);
	$("#productionStockCountMissingTotalPageInfo").text(totalProductionStockCountMissingPages);
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	let totalqty = 0;
	for (let i = 0; i < globalProductionStockCountMissingData.length; i++) {
		let rowNumber = (currentProductionStockCountMissingPage - 1) * productionStockCountMissingItemsPerPage + i + 1;
		// 변수로 먼저 저장
		const row = globalProductionStockCountMissingData[i];
		const qtyReal = Number(row.QTY_REAL || row.qty_real || 0);
		const qtySystem = Number(row.QTY_SYSTEM || row.qty_system || 0);
		const cntReal = Number(row.CNT_REAL || row.cnt_real || 0);
		const cntSystem = Number(row.CNT_SYSTEM || row.cnt_system || 0);
		//const diff = qtySystem - qtyReal;
		//const diffCount = cntSystem - cntReal;

		const itemcode = row.ITEMCODE_REAL || row.itemcode_real || row.ITEMCODE_SYSTEM || row.itemcode_system || '';
		let sdate = globalProductionStockCountMissingData[i].SDATE || globalProductionStockCountMissingData[i].sdate || '';
		let indate = globalProductionStockCountMissingData[i].INDATE || globalProductionStockCountMissingData[i].indate || '';
		let location = globalProductionStockCountMissingData[i].LOCATION || globalProductionStockCountMissingData[i].location || '';
		// 차이값 표시 로직
		/*let diffDisplay = '';
		if (diff !== 0 && qtyReal !== 0) {  // 차이가 있고 real이 0이 아닐 때
			diffDisplay = `${Math.abs(diff).toLocaleString()} (${Math.abs(diffCount)})`;
		}*/

		//console.log(`행 ${i}:`, globalProductionStockCountMissingData[i]); // 각 행 데이터 확인
		let barcode = globalProductionStockCountMissingData[i].BARCODE || globalProductionStockCountMissingData[i].barcode || '';
		let qty = Number(globalProductionStockCountMissingData[i].QTY || globalProductionStockCountMissingData[i].qty || 0).toLocaleString();
		let itemcode2 = globalProductionStockCountMissingData[i].ITEMCODE || globalProductionStockCountMissingData[i].itemcode || '';
		let isChecked = (globalProductionStockCountMissingData[i].flag == 1) ? "checked" : "";
		const isDisabled = (globalProductionStockCountMissingData[i].flag2 == 0) ? "disabled" : "";
		if (isDisabled == 'disabled') {
			isChecked = ''
		}

		// statusText와 함께 상태 클래스도 추가
		let statusText = (globalProductionStockCountMissingData[i].flag2 == 1) ? i18n.t('') : i18n.t('search.exception.output.completed');
		let statusClass = (globalProductionStockCountMissingData[i].flag2 == 1) ? "" : "status-completed";

		let factory = globalProductionStockCountMissingData[i].FACTORY || globalProductionStockCountMissingData[i].factory || '';
		let storage = globalProductionStockCountMissingData[i].STORAGE || globalProductionStockCountMissingData[i].storage || '';

		tableBody += `
            <tr class="" data-itemcode="${itemcode}" data-sdate="${sdate}" data-location="${location}">
            	<td class = "noVal">${globalProductionStockCountMissingData[i].RN || globalProductionStockCountMissingData[i].rn || ''}</td>
				<td class = "dateVal">${globalProductionStockCountMissingData[i].INDATE || globalProductionStockCountMissingData[i].indate || ''}</td>
				<td class = "locationVal_short">${globalProductionStockCountMissingData[i].LOCATION || globalProductionStockCountMissingData[i].location || ''}</td>
				<td class = "barcodeVal">${globalProductionStockCountMissingData[i].BARCODE || globalProductionStockCountMissingData[i].barcode || ''}</td>
				<td class = "itemcodeVal">${globalProductionStockCountMissingData[i].ITEMCODE || globalProductionStockCountMissingData[i].itemcode || ''}</td>
				<td class = "itemnameVal_short">${globalProductionStockCountMissingData[i].ITEMNAME || globalProductionStockCountMissingData[i].itemname || ''}</td>
				<td class = "itemcodeVal">${globalProductionStockCountMissingData[i].SENDING || globalProductionStockCountMissingData[i].sending || ''}</td>
				<td class = "qtyVal">${Number(globalProductionStockCountMissingData[i].QTY || globalProductionStockCountMissingData[i].qty || 0).toLocaleString()}</td>
				<td class = "dateVal"><input type = 'checkbox' class= 'stockNotScanCheck' data-barcode='${barcode}_${qty}_${itemcode2}' ${isChecked} ${isDisabled}  data-unique="${barcode}_${indate}_${factory}_${storage}_${qty.replaceAll(',', '')}_${itemcode2}"></td>
				<td class="exStatusVal ${statusClass}">${statusText}</td>
            </tr>
        `;

	}

	/* 임시 주석 필요시 사용
	<td>${globalProductionStockCountMissingData[i].LOCATION || globalProductionStockCountMissingData[i].location || ''}</td>
	<td>${globalProductionStockCountMissingData[i].YMDHMS || globalProductionStockCountMissingData[i].ymdhms || ''}</td>
			*/
	//console.log("생성된 tableBody:", tableBody);
	$("#productionStockCountMissingTableBody").html(tableBody);
	let all = globalProductionStockCountMissingData.length;
	let checked = $(".stockNotScanCheck:checked").length;
	console.log("all checked " + all + "--" + checked)
	$("#stockNotScanCheckAll").prop("checked", all === checked ? true : false);
}

// 페이지네이션 렌더링
function renderProductionStockCountMissingPagination() {
	let totalPages = Math.ceil(totalProductionStockCountMissingCount / productionStockCountMissingItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentProductionStockCountMissingPage > 1) {
		paginationHtml += `<button class="productionStockCountMissing-page-btn" data-page="${currentProductionStockCountMissingPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="productionStockCountMissing-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentProductionStockCountMissingPage - 5);
	let endPage = Math.min(totalPages, currentProductionStockCountMissingPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="productionStockCountMissing-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentProductionStockCountMissingPage) {
			paginationHtml += `<button class="productionStockCountMissing-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="productionStockCountMissing-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="productionStockCountMissing-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentProductionStockCountMissingPage < totalPages) {
		paginationHtml += `<button class="productionStockCountMissing-page-btn" data-page="${currentProductionStockCountMissingPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="productionStockCountMissing-page-btn disabled">&gt;</button>`;
	}

	$("#productionStockCountMissingPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindProductionStockCountMissingEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnProductionStockCountMissingSearch").off('click').on('click', function() {
		performProductionStockCountMissingSearch();
	});

	// 초기화 버튼 클릭
	$(".btnProductionStockCountMissingSearchInit").off('click').on('click', function() {
		resetProductionStockCountMissingSearch();
	});

	$("#productionStockCountMissingConfirmBtn").off('click').on('click', function() {
		realStockNotScan();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.productionStockCountMissing-page-btn').on('click', '.productionStockCountMissing-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentProductionStockCountMissingPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performProductionStockCountMissingDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_mProduction_stock_count_missing input[type="text"], #view_mProduction_stock_count_missing input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performProductionStockCountMissingSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		startdate: $("#productionStockCountMissing_searchVal_fromDate").val(),
		enddate: $("#productionStockCountMissing_searchVal_toDate").val(),
		location: $("#productionStockCountMissing_searchVal_location").val().trim().toUpperCase(),
		factory: $("#productionStockCountMissing_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#productionStockCountMissing_searchVal_storage").val().trim().toUpperCase(),
		itemcode: $("#productionStockCountMissing_searchVal_itemcode").val().trim().toUpperCase(),
	};
}

// 검색 수행 함수 - DB 조회
function performProductionStockCountMissingSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentProductionStockCountMissingPage = 1;
	performProductionStockCountMissingDBSearch(searchCriteria);
}

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayStr = `${year}-${month}-${day}`;
// 검색 조건 초기화
function resetProductionStockCountMissingSearch() {
	const factory = getCookie('selectedFactory');

	let startdate = todayStr;
	let enddate = todayStr;
	const storage = 'MATERIAL';

	$("#productionStockCountMissing_searchVal_fromDate").val(todayStr),
		$("#productionStockCountMissing_searchVal_endDate").val(todayStr),
		$("#productionStockCountMissing_searchVal_location").val(''),
		$("#productionStockCountMissing_searchVal_factory").val('SALTILLO'),
		$("#productionStockCountMissing_searchVal_storage").val('MATERIAL'),
		$("#productionStockCountMissing_searchVal_itemcode").val('')

	// 초기화 후 전체 데이터 다시 조회
	currentProductionStockCountMissingPage = 1;
	performProductionStockCountMissingDBSearch({ startdate, enddate, factory, storage });

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
	const fromDate = fmtLocalDate(today);
	return { fromDate, toDate };
}


// 유틸리티 함수들
window.changeProductionStockCountMissingItemsPerPage = function(newItemsPerPage) {
	productionStockCountMissingItemsPerPage = newItemsPerPage;
	currentProductionStockCountMissingPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performProductionStockCountMissingDBSearch(searchCriteria);
}

window.exportProductionStockCountMissingData = function() {
	return {
		total: globalProductionStockCountMissingData.length,
		currentPage: currentProductionStockCountMissingPage,
		itemsPerPage: productionStockCountMissingItemsPerPage,
		data: globalProductionStockCountMissingData
	};
}


window.downloadAllProductionStockCountMissingData = function() {
	let searchCriteria = {
		startdate: $("#productionStockCountMissing_searchVal_fromDate").val(),
		enddate: $("#productionStockCountMissing_searchVal_toDate").val(),
		location: $("#productionStockCountMissing_searchVal_location").val().trim().toUpperCase(),
		factory: $("#productionStockCountMissing_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#productionStockCountMissing_searchVal_storage").val().trim().toUpperCase(),
		itemcode: $("#productionStockCountMissing_searchVal_itemcode").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_productionStockCountMissing_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionStockCountMissingColumns, {
				fileName: 'ProductionStockCountMissing_All',
				sheetName: 'ProductionStockCountMissing'
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
$(document).on('click', '.modal_productionStockCountMissing_open', function() {
	showLoading("data");

	$('#modal_productionStockCountMissing').fadeIn(500);

	productionStockCountMissingDetail($(this));
});

// 모달 닫기
$(document).on('click', '.modal_productionStockCountMissing_close', function() {
	$('#modal_productionStockCountMissing').fadeOut(200);
});

// ESC 키로 닫기
$(document).keydown(function(e) {
	if (e.keyCode === 27) {
		$('#modal_productionStockCountMissing').fadeOut(200);
	}
});

/*function productionStockCountMissingDetail(element) {

	$(".tbody_productionStockCountMissing_detail").empty();
	let itemcode = element.data('itemcode');
	let sdate = element.data('sdate');
	let location = element.data('location');

	const detailParam = {
		itemcode: itemcode,
		sdate: sdate,
		location: location
	}

	$.ajax({
		url: "/read_productionStockCountMissing_detail",
		type: "POST",
		data: JSON.stringify(detailParam),
		contentType: "application/json",
		success: function(data) {
			console.log("Detail Read")
			console.log(data);

			let systemParam = data.stockDB;
			let realParam = data.realStockDB;

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
				if (realParam[i] != undefined) {
					tbody += `
						<td class="compare_dateVal">${realParam[i].SDATE}</td>
						<td class="compare_locationVal">${realParam[i].LOCATION}</td>
						<td class="compare_barcodeVal">${realParam[i].BARCODE}</td>
						<td class="compare_itemcodeVal">${realParam[i].ITEMCODE}</td>
						<td class="compare_qtyVal">${realParam[i].REALQTY}</td>
					`
				} else {
					tbody += `
						<td class="compare_dateVal"></td>
						<td class="compare_locationVal"></td>
						<td class="compare_barcodeVal"></td>
						<td class="compare_itemcodeVal"></td>
						<td class="compare_qtyVal"></td>
					`;
				}

				if (systemParam[i] != undefined) {
					tbody += `
						<td class="compare_dateVal">${systemParam[i].SDATE}</td>
						<td class="compare_locationVal">${systemParam[i].LOCATION}</td>
						<td class="compare_barcodeVal">${systemParam[i].BARCODE}</td>
						<td class="compare_itemcodeVal">${systemParam[i].ITEMCODE}</td>
						<td class="compare_qtyVal">${systemParam[i].SYSTEMQTY}</td>
					`
				} else {
					tbody += `
						<td class="compare_dateVal"></td>
						<td class="compare_locationVal"></td>
						<td class="compare_barcodeVal"></td>
						<td class="compare_itemcodeVal"></td>
						<td class="compare_qtyVal"></td>
					`;
				}

				tbody += "</tr>"
			}


			$('.tbody_productionStockCountMissing_detail').html(tbody);

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
*/
// realstocknotscan테이블에 delete -> insert
function realStockNotScan() {
	// 체크된 체크박스에서 data-barcode만 추출
	let barcodes = $(".stockNotScanCheck:checked").map(function() {
		return $(this).data("barcode");
	}).get();
	let factory = $("#stockNotScanHiddenFactory").val();
	let storage = $("#stockNotScanHiddenStorage").val();
	let date = $("#stockNotScanHiddenDate").val();
	data = {
		barcode: barcodes,
		date: date,
		factory: factory,
		storage: storage,
		loginid: $(".loginId").text()
	}
	console.log("선택된 바코드들:", barcodes);
	if (confirm("Do you want to submit the data?")) {
		$.ajax({
			url: "/realStockNotScan",
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			success: function(data) {
				console.log("realStockNotScan")
				if (data.success) {
					alert("Success");
				} else {
					alert("Fail");
				}
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
}

// 전체선택 클릭 시 개별 체크박스 모두 체크/해제
$(document).on("change", "#stockNotScanCheckAll", function() {
	$(".stockNotScanCheck:not(:disabled)").prop("checked", $(this).prop("checked"));
});

// 개별 체크박스 클릭 시 전체선택 상태 업데이트
$(document).on("change", ".stockNotScanCheck", function() {
	let all = $(".stockNotScanCheck:not(:disabled)").length;
	let checked = $(".stockNotScanCheck:checked:not(:disabled)").length;
	$("#stockNotScanCheckAll").prop("checked", all === checked);
});


// 예외 출고
$(document).on("click", ".btnProductionStockCountMissingExceptionOut", function() {
	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
	const sabun = getCookie("sabun");

	const iidList = [];
	$(".stockNotScanCheck:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	console.log(iidList)
	console.log(sabun);
	if (confirm("Do you want to proceed with an exception load?")) {
		showLoading("data");
		$.ajax({
			url: `/insertExcpetionOutput`,
			type: "POST",
			data: JSON.stringify({
				loginid: loginid,
				sabun: sabun,
				list: iidList,
				memo : "LOADEXCEPTION-NOSCAN"
			}),
			contentType: "application/json",
			success: function(data) {
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performProductionStockCountMissingDBSearch(searchCriteria);
			},
			error: function(xhr, status, error) {
				console.error("요청 실패");
				console.error("Status:", status);       // 예: "error"
				console.error("Error:", error);         // 예: 서버 응답 메시지
				console.error("Response:", xhr.responseText); // 서버 응답 본문
				alert("오류가 발생했습니다: " + error);
			}
		});
	} else {
		hideLoading();
	}

});

function getCookie(name) {
	const cookies = document.cookie ? document.cookie.split('; ') : [];
	for (const c of cookies) {
		const [k, v] = c.split('=');
		if (k === decodeURIComponent(name)) {
			return decodeURIComponent(v || '');
		}
	}
	return null; // 없으면 null
}