/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */

let globalStockHistoryData = []; // 현재 조회된 데이터 저장
let currentStockHistoryPage = 1; // 현재 페이지
let stockHistoryItemsPerPage = 1000; // 페이지당 항목 수
let totalStockHistoryCount = 0; // 서버에서 받은 총 개수 저장
let totalStockHistoryQty = 0; // 서버에서 받은 총 개수 저장
let totalStockHistoryPages = 0; // 서버에서 받은 총 페이지
let stockHistoryLocation = "";// 위치 정보 저장

$(document).ready(function() {

	window.filteredStockHistoryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.stockHistoryColumns = [
		{ key: 'KIND', header: 'kind' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'TIME', header: 'time' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'MEMO', header: 'MEMO' }
	];


	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_stock_history = function(menuId) {
		showLoading("data");

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 공장으로 조회
		/*performStockHistoryDBSearch({
			factory: factory,
			barcode: ''  // 빈 문자열 추가
		});*/
		renderStockHistoryView();
		hideLoading();
	}
});

// DB에서 데이터 조회하는 함수
function performStockHistoryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_stockHistory",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentStockHistoryPage,
			itemsPerPage: stockHistoryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalStockHistoryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalStockHistoryCount = data.totalCount || 0;
			totalStockHistoryQty = data.totalQty || 0;
			totalStockHistoryPages = data.totalPages || 0;
			currentStockHistoryPage = data.currentPage || 0;
			window.filteredStockHistoryData = globalStockHistoryData;
			stockHistoryLocation = data.location !== null ? data.location.LOCATION : '';
			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_stock_history').length) {
				renderStockHistoryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderStockHistoryTableData();
				renderStockHistoryPagination();
				updateStockHistoryTotalCount();
				updateStockHistoryTotalQty();
				updateStockHistoryLocation();
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
function renderStockHistoryView() {
	let content_output = `
			<div class="divBlockControl" id="view_m2_stock_history">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label stockHistory">
								<div class="searchVal_barcode">${i18n.t('search.barcode')}<!-- BARCODE --></div>
								<input type="text" id="stockHistory_searchVal_barcode" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnStockHistorySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnStockHistorySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="stockHistoryTotalCount">${totalStockHistoryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="stockHistoryCurrentPageInfo">${currentStockHistoryPage}</strong>/<strong id="stockHistoryTotalPageInfo">${totalStockHistoryPages}</strong> | 
								<!--${i18n.t('table.info.qty')} : <strong id = "stockHistoryTotalQty"></strong>-->${i18n.t('search.location')} : <strong id = "stockHistoryLocation"></strong>
							</span>
							<div class="action-buttons-right m2_stock_history">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockHistoryExcelBtn" onclick="downloadAllStockHistoryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_stock_history">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
										<th class = "locationVal">${i18n.t('table.kind')}<!-- KIND --></th>
										<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
										<th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>
									    <th class = "userVal">${i18n.t('search.user')}<!-- LOGINID --></th>						    
									    <th class = "dateVal">${i18n.t('table.date')}<!-- TIME --></th>									    
									    <th class = "locationVal">${i18n.t('table.worktime')}<!-- TIME --></th>									    
									    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>									    
									    <th class = "oitemnameVal">${i18n.t('search.memo')}<!-- memo --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="stockHistoryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="stockHistoryPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
	/*<button class="btn btn-success" id="stockHistoryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredStockHistoryData, stockHistoryColumns, {fileName:'StockHistory', sheetName:'StockHistory'})">Excel</button>*/

	/* 임시 주석 필요시 사용
	<div class="search-label">
							<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
							<input type="text" id="searchVal_location" />
						</div>
						<th>${i18n.t('search.location')}<!-- LOCATION --></th>
						<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
						
						<div class="search-label stockHistory">
								<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
								<input type="text" id="stockHistory_searchVal_location" />
							</div>
	*/
	$(".w_contentArea").append(content_output);

	// 테이블 데이터 렌더링
	renderStockHistoryTableData();
	// 페이지네이션 렌더링
	renderStockHistoryPagination();
	// 이벤트 바인딩
	bindStockHistoryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateStockHistoryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateStockHistoryTotalQty();
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}

// 총 개수를 업데이트하는 함수
function updateStockHistoryTotalCount() {
	$('#stockHistoryTotalCount').text(totalStockHistoryCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateStockHistoryTotalQty() {
	$('#stockHistoryTotalQty').text(totalStockHistoryQty.toLocaleString());
}

function updateStockHistoryLocation() {
	$('#stockHistoryLocation').text(stockHistoryLocation);
}

function renderStockHistoryTableData() {
	let tableBody = "";

	$("#stockHistoryCurrentPageInfo").text(currentStockHistoryPage);
	$("#stockHistoryTotalPageInfo").text(totalStockHistoryPages);

	for (let i = 0; i < globalStockHistoryData.length; i++) {
		let rowNumber = totalStockHistoryCount - ((currentStockHistoryPage - 1) * stockHistoryItemsPerPage + i);

		const row = globalStockHistoryData[i];

		const kind = (row.KIND || row.kind || '').trim();
		const factory = (row.FACTORY || row.factory || '').trim();
		const storage = (row.STORAGE || row.storage || '').trim();
		const location = (row.LOCATION || row.location || '').trim();

		// ✅ KIND가 특정 값이면 LOCATION 대신 factory-storage 표시
		const specialKinds = new Set(['FACTORY RECEIVE', 'FACTORY SENDING', 'STOCK MOVE']);
		const displayLocation = specialKinds.has(kind)
			? (
				factory && storage ? `${factory}-${storage}`
					: (factory || storage || '')
			)
			: location;

		const memo = (row.MEMO || row.memo || '').replace(/\n/g, '<br>');

		tableBody += `
			<tr>
				<td class="noVal">${rowNumber}</td>
				<td class="locationVal">${kind}</td>
				<td class="storageVal">${storage}</td>
				<td class="locationVal">${displayLocation}</td>
				<td class="userVal">${(row.LOGINID || row.loginid || '').trim()}</td>
				<td class="dateVal">${(row.SDATE || row.sdate || '').trim()}</td>
				<td class="locationVal">${(row.TIME || row.time || '').trim()}</td>
				<td class="qtyVal">${Number(row.QTY || row.qty || 0).toLocaleString()}</td>
				<td class="oitemnameVal">${memo}</td>
			</tr>
		`;
	}
	$("#stockHistoryTableBody").html(tableBody);

	// 기존 코드에 맞게 tableBody 넣는 부분은 유지
	// $("#yourTbody").html(tableBody);
}


// 페이지네이션 렌더링
function renderStockHistoryPagination() {
	let totalPages = Math.ceil(totalStockHistoryCount / stockHistoryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentStockHistoryPage > 1) {
		paginationHtml += `<button class="stockHistory-page-btn" data-page="${currentStockHistoryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="stockHistory-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentStockHistoryPage - 5);
	let endPage = Math.min(totalPages, currentStockHistoryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="stockHistory-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentStockHistoryPage) {
			paginationHtml += `<button class="stockHistory-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="stockHistory-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="stockHistory-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentStockHistoryPage < totalPages) {
		paginationHtml += `<button class="stockHistory-page-btn" data-page="${currentStockHistoryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="stockHistory-page-btn disabled">&gt;</button>`;
	}

	$("#stockHistoryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindStockHistoryEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnStockHistorySearch").off('click').on('click', function() {
		let searchCriteria = getCurrentSearchCriteria();
		let barcode = searchCriteria.barcode;
		performStockHistoryDBSearch(barcode);
/*
		let barcode = $("#stockHistory_searchVal_barcode").val().trim();
		let location = $("#stockHistory_searchVal_location").val();

		if (barcode == '' && location == '') {
			alert("Please enter barcode or location");
			return;
		}

		showLoading("data");

		if (barcode != '') {
			$.ajax({
				url: "/stock_history_barcodeCheck",
				type: "POST",
				data: barcode,
				contentType: "application/json",
				success: function(data) {
					console.log(data);
					if (data.length > 1) {
						$('.modal_stockInfoDetail_bg').addClass('show');
						$('#overlay_modal_stockHistory_selectBarcode').addClass('active');
						$('#modalContainer_modal_stockHistory_selectBarcode').addClass('active');
						$('.content_modal_stockHistory_selectBarcode').scrollTop(0);

						$(".item_modal_stockHistory_selectBarcode").remove();

						let output = "";
						for (i = 0; i < data.length; i++) {
							output += `
									<li class="item_modal_stockHistory_selectBarcode">
					                    <span class="itemText_modal_stockHistory_selectBarcode">${data[i]}</span>
					                    <span class="itemBadge_modal_stockHistory_selectBarcode">선택</span>
					                </li>
								`
						}
						$(".list_modal_stockHistory_selectBarcode").prepend(output);
						hideLoading();
					} else if (data.length == 0) {
						alert("No data available.");
						hideLoading();
					} else {
						closeModal_stockHistory_selectBarcode();
						//						performStockHistoryDBSearch(data[0]);

						let searchCriteria = getCurrentSearchCriteria();
						let barcode = searchCriteria.barcode;
						performStockHistoryDBSearch(barcode);
					}
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
			// 현재 검색 조건으로 DB에서 새 페이지 조회
			let searchCriteria = getCurrentSearchCriteria();
			performStockHistoryDBSearch(searchCriteria);
		}*/
	});

	// 초기화 버튼 클릭
	$(".btnStockHistorySearchInit").off('click').on('click', function() {
		resetStockHistorySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.stockHistory-page-btn').on('click', '.stockHistory-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentStockHistoryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performStockHistoryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_stock_history input[type="text"], #view_m2_stock_history input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			//performStockHistorySearch();
			$(".btnStockHistorySearch").click();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	console.log("storage : " + $("#searchVal_storage").val());
	return {
		barcode: $("#stockHistory_searchVal_barcode").val().trim()
	};
}

// 검색 수행 함수 - DB 조회
function performStockHistorySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", barcode);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentStockHistoryPage = 1;
	performStockHistoryDBSearch(searchCriteria);
}

// 검색 조건 초기화
// ✅ 검색 조건 + 조회 결과(내용)까지 완전 초기화
function resetStockHistorySearch() {

	// 1) 검색 입력값 초기화
	$("#stockHistory_searchVal_barcode").val('');
	if ($("#stockHistory_searchVal_location").length) {
		$("#stockHistory_searchVal_location").val('');
	}

	// 2) 전역 상태(데이터/카운트/페이지/로케이션) 초기화
	globalStockHistoryData = [];
	window.filteredStockHistoryData = [];

	currentStockHistoryPage = 1;
	totalStockHistoryCount = 0;
	totalStockHistoryQty = 0;
	totalStockHistoryPages = 0;
	stockHistoryLocation = '';

	// 3) 화면이 이미 떠있으면, 내용(테이블/페이지/카운트)도 즉시 비움
	$("#stockHistoryTableBody").empty();
	$("#stockHistoryPaginationContainer").empty();

	$("#stockHistoryTotalCount").text('0');
	$("#stockHistoryTotalQty").text('0');          // 숨겨져있어도 값은 세팅
	$("#stockHistoryLocation").text('');

	$("#stockHistoryCurrentPageInfo").text('1');
	$("#stockHistoryTotalPageInfo").text('0');

	console.log('검색 조건 + 조회 내용이 초기화되었습니다.');

	// 4) 필요 시 뷰가 없으면 다시 렌더링
	//    (탭 닫혔다가 다시 열리는 구조면 안전장치)
	if (!$('#view_m2_stock_history').length) {
		renderStockHistoryView();
	}
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
window.changeStockHistoryItemsPerPage = function(newItemsPerPage) {
	stockHistoryItemsPerPage = newItemsPerPage;
	currentStockHistoryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performStockHistoryDBSearch(searchCriteria);
}

window.exportStockHistoryData = function() {
	return {
		total: globalStockHistoryData.length,
		currentPage: currentStockHistoryPage,
		itemsPerPage: stockHistoryItemsPerPage,
		data: globalStockHistoryData
	};
}


window.downloadAllStockHistoryData = function() {
	//	let searchCriteria = {
	//		barcode: saveFullBarcode
	//	};

	let searchCriteria = {
		barcode: $("#stockHistory_searchVal_barcode").val().trim(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_stockHistory_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.stockHistoryColumns, {
				fileName: 'StockHistory_All',
				sheetName: 'StockHistory'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

var saveFullBarcode = "";

// 닫기 버튼
$(document).on("click", "#closeBtn_modal_stockHistory_selectBarcode", function(e) {
	closeModal_stockHistory_selectBarcode();
});
function closeModal_stockHistory_selectBarcode() {
	$('#overlay_modal_stockHistory_selectBarcode').removeClass('active');
	$('#modalContainer_modal_stockHistory_selectBarcode').removeClass('active');
	$(".modal_stockInfoDetail_bg").removeClass("show");
}
$(document).on("click", ".item_modal_stockHistory_selectBarcode", function(e) {
	let barcodeText = $(this).find('.itemText_modal_stockHistory_selectBarcode').text();
	console.log(barcodeText);
	saveFullBarcode = barcodeText;
	closeModal_stockHistory_selectBarcode();
	performStockHistoryDBSearch(barcodeText)
});


