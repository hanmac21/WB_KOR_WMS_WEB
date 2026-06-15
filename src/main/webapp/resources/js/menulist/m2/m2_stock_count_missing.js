/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */

let globalStockCountMissingData = []; // 현재 조회된 데이터 저장
let currentStockCountMissingPage = 1; // 현재 페이지
let stockCountMissingItemsPerPage = 1000; // 페이지당 항목 수
let totalStockCountMissingCount = 0; // 서버에서 받은 총 개수 저장
let totalStockCountMissingQty = 0; // 서버에서 받은 총 수량 저장
let totalStockCountMissingPages = 0; // 서버에서 받은 총 페이지
let stockCountDate = "";
let total_real = 0;
let total_system = 0;

$(document).ready(function() {

	window.filteredStockCountMissingData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.stockCountMissingColumns = [
		{ key: 'SDATE', header: 'indate' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'CUSTCODE', header: 'custcode' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'OITEMCODE', header: 'spec' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'SENDING', header: 'sending' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'STATUS', header: 'status' },
	];


	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_stock_count_missing = function(menuId) {
		//showLoading("data");
		// 초기 로딩: 공장으로 조회
		//performStockCountMissingDBSearch({ startdate, enddate, factory, storage });
		renderStockCountMissingView();
	}
});

// DB에서 데이터 조회하는 함수
function performStockCountMissingDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_stockCountMissing",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentStockCountMissingPage,
			itemsPerPage: stockCountMissingItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalStockCountMissingData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalStockCountMissingCount = data.totalCount || 0;
			totalStockCountMissingQty = data.totalQty || 0;
			totalStockCountMissingPages = data.totalPages || 0;
			currentStockCountMissingPage = data.currentPage || 0;
			window.filteredStockCountMissingData = globalStockCountMissingData;
			stockCountDate = data.stockCountDate;

			total_real = (data.totalQty_real || 0) + " / " + (data.totalCount_real || 0);
			//totalCount_real = data.totalCount_real || 0;
			total_system = (data.totalQty_system || 0) + " / " + (data.totalCount_system || 0);
			//totalCount_system = data.totalCount_system || 0;



			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_stock_count_missing').length) {
				renderStockCountMissingView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderStockCountMissingTableData();
				//renderStockCountMissingPagination();
				updateStockCountMissingTotalCount();
				updateStockCountMissingTotalQty();
			}
			$("#stockNotScanHiddenFactory").val($("#stockCountMissing_searchVal_factory").val());
			$("#stockNotScanHiddenStorage").val($("#stockCountMissing_searchVal_storage").val());
			$("#stockNotScanHiddenDate").val($("#stockCountMissing_searchVal_fromDate").val());
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
function renderStockCountMissingView() {
	const isIllinois = getCookie('selectedStorage') === 'ILLINOIS';
	const productMoveBtn = isIllinois
		? ''
		: `<input type="button" value="제품창고 이동" class="btn btn-primary btnStockCountMissingProductStorageMove"/>`;

	let content_output = `
			<div class="divBlockControl" id="view_m2_stock_count_missing">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="stockCountMissing_searchVal_fromDate" /> 
							</div>
							<!--<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="stockCountMissing_searchVal_toDate" />
							</div>-->
							<div class="search-label">
                                <div class="searchVal_hour">${i18n.t('search.hour')}<!-- HOUR --></div>
                                <select id="stockCountMissing_searchVal_hour">
                                    ${(function() {
                                        var opts = '';
                                        for (var i = 0; i < 24; i++) {
                                            var h = String(i).padStart(2, '0');
                                            opts += '<option value="' + h + '">' + h + '</option>';
                                        }
                                        return opts;
                                    })()}
                                </select>
                            </div>
                            <div class="search-label">
                                <div class="searchVal_timeDirection">&nbsp;</div>
                                <select id="stockCountMissing_searchVal_timeDirection">
                                    <option value="before">${i18n.t('search.before')}<!-- 이전 --></option>
                                    <option value="after">${i18n.t('search.after')}<!-- 이후 --></option>
                                </select>
                            </div>
							<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
								<input type="text" id="stockCountMissing_searchVal_location" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="stockCountMissing_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
                                <div class="searchVal_custname">${i18n.t('search.supplier')}<!-- CUSTOMER --></div>
                                <select id="stockCountMissing_searchVal_custcode">
                                    <option value="">${i18n.t('search.all')}<!-- ALL --></option>
                                    <option value="A021">WBTM</option>
                                    <option value="0001">WOOBO</option>
                                </select>
                            </div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountMissing_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}<!-- SPEC --></div>
								<input type="text" id="stockCountMissing_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">Status<!-- Status --></div>
								<select id="stockCountMissing_searchVal_status" >
									<option value = 'all'>All</option>
									<option value = 'complete'>${i18n.t('search.exception.output.completed')}</option>
									<option value = 'adjust'>${i18n.t('table.adjustment')}</option>
									<option value = 'noscan'>${i18n.t('search.noscan')}</option>
								</select>
							</div>
						</div>
							<div class="search_button_area">
								<input type = 'hidden' id = "stockNotScanHiddenFactory">
								<input type = 'hidden' id = "stockNotScanHiddenStorage">
								<input type = 'hidden' id = "stockNotScanHiddenDate">
								<button class="btn btn-primary btnStockCountMissingSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnStockCountMissingSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="stockCountMissingTotalCount"></strong> ${i18n.t('table.info.records')} | 
								<!--${i18n.t('table.page')} <strong id="stockCountMissingCurrentPageInfo">${currentStockCountMissingPage}</strong>/<strong id="stockCountMissingTotalPageInfo" style="margin-right:50px;">${totalStockCountMissingPages}</strong>-->  
								${i18n.t('table.info.qty')} : <strong id = "stockCountMissingTotalQty"></strong>

							</span>
							<div class="action-buttons-right m2_stock_count_missing">
								<div id="defaultActions" class="action-group">
									${i18n.t('table.info.total')} : <strong id= "checkedCount">0 </strong> ${i18n.t('table.info.records')} | 
									${i18n.t('table.info.qty')} : <strong id= "checkedQty">0 </strong>
									<span class="btn-divider"></span>
									${productMoveBtn}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnStockCountMissingExceptionOut"/>
									<input type="button" style="display:none" value="${i18n.t('btn.exceptionOut')}" class="btn btn-success btnStockCountMissingExceptionOut"/>
									<button class="btn btn-primary" style="display:none" id="stockCountMissingConfirmBtn" onclick="realStockNotScan()">Confirm</button>
									<button class="btn btn-success" id="stockCountMissingExcelBtn" onclick="downloadAllStockCountMissingData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_stock_count_missing">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
									    <th class = "dateVal">${i18n.t('search.date')}<!-- INDATE --></th>
									    <th class = "locationVal_short">${i18n.t('search.location')}<!-- LOCATION --></th>
									    <th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
									    <th class = "itemcodeVal">${i18n.t('search.supplier')}<!-- ITEMCODE --></th>
									    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									    <th class = "cnameVal">${i18n.t('search.customercode')}<!-- ITEMCODE --></th>
									    <th class = "itemnameVal_short">${i18n.t('search.itemName')}<!-- ITEMCODE --></th>
										<th class = "itemcodeVal">${i18n.t('search.lastjob')}<!-- LAST JOB --></th>
									    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>									    
									    <th class = "dateVal"><input type = 'checkbox' class ='check' id = 'stockNotScanCheckAll'>DELETE<!-- QTY --></th>									    
									    <th class = "exStatusVal">Status<!-- STATUS --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="stockCountMissingTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션
						<div class="pagination" id="stockCountMissingPaginationContainer">
						</div> -->
					</div>
				</div>
			</div>
		`;

	$(".w_contentArea").append(content_output);

	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#stockCountMissing_searchVal_fromDate").val(fromDate);
		$("#stockCountMissing_searchVal_toDate").val(toDate);
		$("#stockNotScanHiddenDate").val(fromDate);
		const currentHour = String(new Date().getHours()).padStart(2, '0');
		$("#stockCountMissing_searchVal_hour").val(currentHour);
		$("#stockCountMissing_searchVal_timeDirection").val('before');
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderStockCountMissingTableData();
	// 페이지네이션 렌더링
	renderStockCountMissingPagination();
	// 이벤트 바인딩
	bindStockCountMissingEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateStockCountMissingTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateStockCountMissingTotalQty();
	// 버튼 표시 상태 초기화
	toggleProductStorageMoveBtn();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const storage = $('#stockCountMissing_searchVal_storage');
	const savedStorage = getCookie('selectedStorage');

	storage.empty();

	const storageList = ['INBOUND', 'OUTSIDE', 'all'];

	storageList.forEach(item => {
		//const value = item.toUpperCase(); // value는 대문자로 변환
		const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
		storage.append(`<option value="${item}">${text}</option>`);
	});

	// 첫 번째 옵션 선택
	// storage.val(storageList[0].toUpperCase());
	// DOM 렌더링 완료 후 val() 세팅
	setTimeout(() => {
		if(savedStorage === 'ILLINOIS'){
			storage.val('OUTSIDE').trigger('change');
		}else {
			storage.val(storageList[0]).trigger('change');
		}
	}, 0);

	window.autoSetStorageFields();

	// 창고 변경 시 버튼 표시 갱신
	storage.on('change', function() {
		toggleProductStorageMoveBtn();
	});
	$("#stockNotScanHiddenFactory").val('WBTA');
	$("#stockNotScanHiddenStorage").val($('#stockCountMissing_searchVal_storage').val());

	window.autoSetStorageFields();
}

// 창고에 따라 제품창고 이동 버튼 표시/숨김
function toggleProductStorageMoveBtn() {
	const currentStorage = $('#stockCountMissing_searchVal_storage').val();
	if (currentStorage === 'OUTSIDE') {
		$('.btnStockCountMissingProductStorageMove').hide();
	} else {
		$('.btnStockCountMissingProductStorageMove').show();
	}
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}

// 총 개수를 업데이트하는 함수
function updateStockCountMissingTotalCount() {
	$('#stockCountMissingTotalCount').text(totalStockCountMissingCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateStockCountMissingTotalQty() {
	//$('#stockCountMissingTotalQty').text(totalStockCountMissingQty.toLocaleString());
	$('#stockCountMissingTotalQty').text(totalStockCountMissingQty.toLocaleString());
}

function renderStockCountMissingTableData() {
	let tableBody = "";

	//console.log("globalStockCountMissingData:", globalStockCountMissingData);
	//console.log("데이터 개수:", globalStockCountMissingData.length);
	$("#stockCountMissingCurrentPageInfo").text(currentStockCountMissingPage);
	$("#stockCountMissingTotalPageInfo").text(totalStockCountMissingPages);
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	const custcodeNameMap = { 'A021': 'WBTM', '0001': 'WOOBO' };
	let totalqty = 0;
	for (let i = 0; i < globalStockCountMissingData.length; i++) {
		let rowNumber = (currentStockCountMissingPage - 1) * stockCountMissingItemsPerPage + i + 1;
		// 변수로 먼저 저장
		const row = globalStockCountMissingData[i];

		const itemcode = row.ITEMCODE_REAL || row.itemcode_real || row.ITEMCODE_SYSTEM || row.itemcode_system || '';
		let sdate = globalStockCountMissingData[i].SDATE || globalStockCountMissingData[i].sdate || '';
		let location = globalStockCountMissingData[i].LOCATION || globalStockCountMissingData[i].location || '';

		//console.log(`행 ${i}:`, globalStockCountMissingData[i]); // 각 행 데이터 확인
		let barcode = globalStockCountMissingData[i].BARCODE || globalStockCountMissingData[i].barcode || '';
		let qty = Number(globalStockCountMissingData[i].QTY || globalStockCountMissingData[i].qty || 0).toLocaleString();
		let itemcode2 = globalStockCountMissingData[i].ITEMCODE || globalStockCountMissingData[i].itemcode || '';
		let isChecked = (globalStockCountMissingData[i].flag == 1) ? "checked" : "";

		// 비활성화 조건 N이면서 ADJUST가 CHANGE가 아니거나 바코드스캔이 Y일때
		let isDisabled = "";
		//const isDisabled = ((globalStockCountMissingData[i].useynnow == 'N' && globalStockCountMissingData[i].adjust != 'CHANGE') || globalStockCountMissingData[i].barcodescan =='Y' || globalStockCountMissingData[i].useynlocation =='N') ? "disabled" : "";

		let searchDate = $("#stockCountMissing_searchVal_fromDate").val()
		// statusText와 함께 상태 클래스도 추가
		let statusText = '';
		let statusClass = '';
		if (globalStockCountMissingData[i].adjust === 'ADJUSTMENT' || globalStockCountMissingData[i].adjust === 'LOADEXCEPTION-NOSCAN') {
			statusText = i18n.t('table.adjustment');
			statusClass = 'status-waiting';
			isDisabled = 'disabled';
		} else if (globalStockCountMissingData[i].useynbarcode === 'N' || globalStockCountMissingData[i].barcodescan === 'Y') {
			statusText = i18n.t('search.exception.output.completed');
			statusClass = 'status-completed';
			isDisabled = 'disabled';
		} else {
			statusText = '';
			statusClass = '';
		}

		if (isDisabled == 'disabled') {
			isChecked = ''
		}
		//let statusClass = (globalStockCountMissingData[i].useynnow == 'N' || globalStockCountMissingData[i].barcodescan =='Y') ? "status-completed" : "";

		let factory = globalStockCountMissingData[i].FACTORY || globalStockCountMissingData[i].factory || '';
		let storage = globalStockCountMissingData[i].STORAGE || globalStockCountMissingData[i].storage || '';
		let no = i + 1;
		tableBody += `
            <tr class="" data-itemcode="${itemcode}" data-sdate="${sdate}" data-location="${location}">
            	<td class = "noVal">${no}</td>
				<td class = "dateVal">${globalStockCountMissingData[i].SDATE || globalStockCountMissingData[i].sdate || ''}</td>
				<td class = "locationVal_short">${globalStockCountMissingData[i].LOCATION || globalStockCountMissingData[i].location || ''}</td>
				<td class = "barcodeVal">${globalStockCountMissingData[i].BARCODE || globalStockCountMissingData[i].barcode || ''}</td>
				<td class = "itemcodeVal">${custcodeNameMap[globalStockCountMissingData[i].CUSTCODE || globalStockCountMissingData[i].custcode] || globalStockCountMissingData[i].CUSTCODE || globalStockCountMissingData[i].custcode || ''}</td>
				<td class = "itemcodeVal">${globalStockCountMissingData[i].ITEMCODE || globalStockCountMissingData[i].itemcode || ''}</td>
				<td class = "cnameVal">${globalStockCountMissingData[i].OITEMCODE || globalStockCountMissingData[i].oitemcode || ''}</td>
				<td class = "itemnameVal_short">${globalStockCountMissingData[i].ITEMNAME || globalStockCountMissingData[i].itemname || ''}</td>
				<td class = "itemcodeVal">${globalStockCountMissingData[i].SENDING || globalStockCountMissingData[i].sending || ''}</td>
				<td class = "qtyVal">${Number(globalStockCountMissingData[i].QTY || globalStockCountMissingData[i].qty || 0).toLocaleString()}</td>
				<td class = "dateVal"><input type = 'checkbox' class= 'stockNotScanCheck' data-barcode='${barcode}_${qty}_${itemcode2}' ${isChecked} ${isDisabled}  data-unique="${barcode}|${searchDate}|${factory}|${storage}|${qty.replaceAll(',', '')}|${itemcode2}"></td>
				<td class="exStatusVal ${statusClass}">${statusText}</td>
            </tr>
        `;
		totalqty = Number(totalqty) + Number(globalStockCountMissingData[i].QTY || globalStockCountMissingData[i].qty || 0)
	}

	/* 임시 주석 필요시 사용
	<td>${globalStockCountMissingData[i].LOCATION || globalStockCountMissingData[i].location || ''}</td>
	<td>${globalStockCountMissingData[i].YMDHMS || globalStockCountMissingData[i].ymdhms || ''}</td>
			*/
	//console.log("생성된 tableBody:", tableBody);
	$("#stockCountMissingTableBody").html(tableBody);
	let all = globalStockCountMissingData.length;
	let checked = $(".stockNotScanCheck:checked").length;
	console.log("all checked " + all + "--" + checked)
	$("#stockNotScanCheckAll").prop("checked", all === checked ? true : false);
	totalStockCountMissingQty = totalqty.toLocaleString();
	totalStockCountMissingCount = globalStockCountMissingData.length.toLocaleString()
	updateChecked();
}

// 페이지네이션 렌더링
function renderStockCountMissingPagination() {
	let totalPages = Math.ceil(totalStockCountMissingCount / stockCountMissingItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentStockCountMissingPage > 1) {
		paginationHtml += `<button class="stockCountMissing-page-btn" data-page="${currentStockCountMissingPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="stockCountMissing-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentStockCountMissingPage - 5);
	let endPage = Math.min(totalPages, currentStockCountMissingPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="stockCountMissing-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentStockCountMissingPage) {
			paginationHtml += `<button class="stockCountMissing-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="stockCountMissing-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="stockCountMissing-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentStockCountMissingPage < totalPages) {
		paginationHtml += `<button class="stockCountMissing-page-btn" data-page="${currentStockCountMissingPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="stockCountMissing-page-btn disabled">&gt;</button>`;
	}

	$("#stockCountMissingPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindStockCountMissingEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnStockCountMissingSearch").off('click').on('click', function() {
		performStockCountMissingSearch();
	});

	// 초기화 버튼 클릭
	$(".btnStockCountMissingSearchInit").off('click').on('click', function() {
		resetStockCountMissingSearch();
	});

	$("#stockCountMissingConfirmBtn").off('click').on('click', function() {
		realStockNotScan();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.stockCountMissing-page-btn').on('click', '.stockCountMissing-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentStockCountMissingPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performStockCountMissingDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_stock_count_missing input[type="text"], #view_m2_stock_count_missing input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performStockCountMissingSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		startdate: $("#stockCountMissing_searchVal_fromDate").val(),
		enddate: $("#stockCountMissing_searchVal_toDate").val(),
		location: $("#stockCountMissing_searchVal_location").val().trim().toUpperCase(),
		storage: $("#stockCountMissing_searchVal_storage").val().trim().toUpperCase(),
		itemcode: $("#stockCountMissing_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#stockCountMissing_searchVal_oitemcode").val().trim().toUpperCase(),
		status: $("#stockCountMissing_searchVal_status").val().trim().toUpperCase(),
		custcode: $("#stockCountMissing_searchVal_custcode").val().trim(),
		hour: $("#stockCountMissing_searchVal_hour").val(),
		timeDirection: $("#stockCountMissing_searchVal_timeDirection").val(),
	};
}

// 검색 수행 함수 - DB 조회
function performStockCountMissingSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentStockCountMissingPage = 1;
	performStockCountMissingDBSearch(searchCriteria);
}

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayStr = `${year}-${month}-${day}`;
// 검색 조건 초기화
function resetStockCountMissingSearch() {

	let startdate = todayStr;
	let enddate = todayStr;
	const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';

	$("#stockCountMissing_searchVal_fromDate").val(todayStr);
	$("#stockCountMissing_searchVal_location").val('');
	$("#stockCountMissing_searchVal_itemcode").val('');
	$("#stockCountMissing_searchVal_oitemcode").val('');
	$("#stockCountMissing_searchVal_custcode").val('');
	$("#stockCountMissing_searchVal_status").val('all');
	const currentHour = String(new Date().getHours()).padStart(2, '0');
	$("#stockCountMissing_searchVal_hour").val(currentHour);
	$("#stockCountMissing_searchVal_timeDirection").val('before');

	// 공장, 창고 선택
	renderFactoryStorage();

	// 초기화 후 전체 데이터 다시 조회
	currentStockCountMissingPage = 1;
	//performStockCountMissingDBSearch({ startdate, enddate, factory, storage });

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
window.changeStockCountMissingItemsPerPage = function(newItemsPerPage) {
	stockCountMissingItemsPerPage = newItemsPerPage;
	currentStockCountMissingPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performStockCountMissingDBSearch(searchCriteria);
}

window.exportStockCountMissingData = function() {
	return {
		total: globalStockCountMissingData.length,
		currentPage: currentStockCountMissingPage,
		itemsPerPage: stockCountMissingItemsPerPage,
		data: globalStockCountMissingData
	};
}


window.downloadAllStockCountMissingData = function() {
	let searchCriteria = {
		startdate: $("#stockCountMissing_searchVal_fromDate").val(),
		enddate: $("#stockCountMissing_searchVal_toDate").val(),
		location: $("#stockCountMissing_searchVal_location").val().trim().toUpperCase(),
		storage: $("#stockCountMissing_searchVal_storage").val().trim().toUpperCase(),
		itemcode: $("#stockCountMissing_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#stockCountMissing_searchVal_oitemcode").val().trim().toUpperCase(),
		status: $("#stockCountMissing_searchVal_status").val().trim().toUpperCase(),
		custcode: $("#stockCountMissing_searchVal_custcode").val().trim(),
		hour: $("#stockCountMissing_searchVal_hour").val(),
		timeDirection: $("#stockCountMissing_searchVal_timeDirection").val(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_stockCountMissing_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			const custcodeNameMap = { 'A021': 'WBTM', '0001': 'WOOBO' };
			data.forEach(row => {
				// custcode 화면이랑 동일하게 변경 (A021→WBTM, 0001→WOOBO)
				const rawCustcode = row.CUSTCODE || row.custcode || '';
				row.CUSTCODE = custcodeNameMap[rawCustcode] || rawCustcode;

				// oitemcode(spec) 소문자 키 대비
				if (!row.OITEMCODE && row.oitemcode) row.OITEMCODE = row.oitemcode;

				// status값 화면이랑 동일하게 변경
				const adjust = row.ADJUST || row.adjust || '';
				const useynbarcode = row.USEYNBARCODE || row.useynbarcode || '';
				const barcodescan = row.BARCODESCAN || row.barcodescan || '';
				if (adjust === 'ADJUSTMENT' || adjust === 'LOADEXCEPTION-NOSCAN') {
					row.STATUS = i18n.t('table.adjustment');
				} else if (useynbarcode === 'N' || barcodescan === 'Y') {
					row.STATUS = i18n.t('search.exception.output.completed');
				} else {
					row.STATUS = '';
				}
			});
			ExcelExporter.downloadExcel(data, window.stockCountMissingColumns, {
				fileName: 'StockCountMissing_All',
				sheetName: 'StockCountMissing'
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
$(document).on('click', '.modal_stockCountMissing_open', function() {
	showLoading("data");

	$('#modal_stockCountMissing').fadeIn(500);

	stockCountMissingDetail($(this));
});

// 모달 닫기
$(document).on('click', '.modal_stockCountMissing_close', function() {
	$('#modal_stockCountMissing').fadeOut(200);
});

// ESC 키로 닫기
$(document).keydown(function(e) {
	if (e.keyCode === 27) {
		$('#modal_stockCountMissing').fadeOut(200);
	}
});

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
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	}
}

// 전체선택 클릭 시 개별 체크박스 모두 체크/해제
$(document).on("change", "#stockNotScanCheckAll", function() {
	$(".stockNotScanCheck:not(:disabled)").prop("checked", $(this).prop("checked"));
	updateChecked();
});

// 개별 체크박스 클릭 시 전체선택 상태 업데이트
$(document).on("change", ".stockNotScanCheck", function() {
	let all = $(".stockNotScanCheck:not(:disabled)").length;
	let checked = $(".stockNotScanCheck:checked:not(:disabled)").length;
	$("#stockNotScanCheckAll").prop("checked", all === checked);
	updateChecked();
});

// 체크된 개수, 수량 계산 함수
function updateChecked() {
	const count = $(".stockNotScanCheck:checked").length;

	$("#checkedCount").text(count.toLocaleString());
	let totalqty = 0;
	$(".stockNotScanCheck:checked").each(function() {
		let iid = $(this).data('unique');
		let qty = iid.split("_")[4];
		totalqty += Number(qty);
	});
	$("#checkedQty").text(totalqty.toLocaleString());
}

// 예외 출고
$(document).on("click", ".btnStockCountMissingExceptionOut", function() {
	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';
	const sabun = getCookie("sabun");
	console.log("loginid:" + loginid + " sabun:" + sabun);
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

	let date = iidList[0].split("_")[1];
	// dateStr: "yyyy-mm-dd"
	const [year, month, day] = date.split("-").map(Number);

	// 해당 월의 마지막 날 계산
	const lastDay = new Date(year, month, 0).getDate();

	const searchDate = $('#stockCountMissing_searchVal_fromDate').val();

	console.log(iidList)
	console.log(sabun);

	if (date === stockCountDate) {
		if (confirm("Do you want to adjust inventory?")) {
			showLoading("data");
			$.ajax({
				url: `/adjustment`,
				type: "POST",
				data: JSON.stringify({
					loginid: loginid,
					sabun: sabun,
					date: date,
					list: iidList,
					memo: "ADJUSTMENT"
				}),
				contentType: "application/json",
				success: function(data) {
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performStockCountMissingDBSearch(searchCriteria);
				},
				error: function(xhr, status, error) {
					// ❌ alert(res.message) <- res 없음 (버그)
					window.handleAjaxError(xhr, status, error);
				}

			});
		} else {
			hideLoading();
		}
	} else {
		if (confirm("Do you want to proceed with an exception load?")) {
			showLoading("data");
			$.ajax({
				url: `/insertExcpetionOutput`,
				type: "POST",
				data: JSON.stringify({
					loginid: loginid,
					sabun: sabun,
					list: iidList,
					searchDate: searchDate,
					memo: "LOADEXCEPTION-NOSCAN"
				}),
				contentType: "application/json",
				success: function(data) {
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performStockCountMissingDBSearch(searchCriteria);
				},
				error: function(xhr, status, error) {
					// ❌ alert(res.message) <- res 없음 (버그)
					window.handleAjaxError(xhr, status, error);
				}

			});
		} else {
			hideLoading();
		}
	}
});

$(document).on("click", ".btnStockCountMissingProductStorageMove", function(){
	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';
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

	if (confirm("Do you want to move the selected items to PRODUCT storage?")) {
		showLoading("data");
		$.ajax({
			url: `/moveProduct`,
			type: "POST",
			data: JSON.stringify({
				loginid: loginid,
				list: iidList,
			}),
			contentType: "application/json",
			success: function(data) {
				alert("이동처리 되었습니다");
				let searchCriteria = getCurrentSearchCriteria();
				performStockCountMissingDBSearch(searchCriteria);
			},
			error: function(xhr, status, error) {
				window.handleAjaxError(xhr, status, error);
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