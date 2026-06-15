/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */

let globalSalesStockCountMissingData = []; // 현재 조회된 데이터 저장
let currentSalesStockCountMissingPage = 1; // 현재 페이지
let salesStockCountMissingItemsPerPage = 1000; // 페이지당 항목 수
let totalSalesStockCountMissingCount = 0; // 서버에서 받은 총 개수 저장
let totalSalesStockCountMissingQty = 0; // 서버에서 받은 총 수량 저장
let totalSalesStockCountMissingPages = 0; // 서버에서 받은 총 페이지

$(document).ready(function() {

	window.filteredSalesStockCountMissingData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.salesStockCountMissingColumns = [
		{ key: 'SDATE', header: 'indate' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'SENDING', header: 'sending' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'STATUS', header: 'status' },
	];


	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mSales_stock_count_missing = function(menuId) {

		renderSalesStockCountMissingView();
	}
});

// DB에서 데이터 조회하는 함수
function performSalesStockCountMissingDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_salesStockCountMissing",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentSalesStockCountMissingPage,
			itemsPerPage: salesStockCountMissingItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalSalesStockCountMissingData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalSalesStockCountMissingCount = data.totalCount || 0;
			totalSalesStockCountMissingQty = data.totalQty || 0;
			totalSalesStockCountMissingPages = data.totalPages || 0;
			currentSalesStockCountMissingPage = data.currentPage || 0;
			window.filteredSalesStockCountMissingData = globalSalesStockCountMissingData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mSales_stock_count_missing').length) {
				renderSalesStockCountMissingView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderSalesStockCountMissingTableData();
				updateSalesStockCountMissingTotalCount();
				updateSalesStockCountMissingTotalQty();
			}
			$("#stockNotScanHiddenFactory").val($("#salesStockCountMissing_searchVal_factory").val());
			$("#stockNotScanHiddenStorage").val($("#salesStockCountMissing_searchVal_storage").val());
			$("#stockNotScanHiddenDate").val($("#salesStockCountMissing_searchVal_fromDate").val());
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
function renderSalesStockCountMissingView() {
	let content_output = `
			<div class="divBlockControl" id="view_mSales_stock_count_missing">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="salesStockCountMissing_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
								<input type="text" id="salesStockCountMissing_searchVal_location" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesStockCountMissing_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesStockCountMissing_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesStockCountMissing_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">Status<!-- Status --></div>
								<select id="salesStockCountMissing_searchVal_status" >
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
								<button class="btn btn-primary btnSalesStockCountMissingSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnSalesStockCountMissingSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesStockCountMissingTotalCount"></strong> ${i18n.t('table.info.records')} | 
								<!--${i18n.t('table.page')} <strong id="salesStockCountMissingCurrentPageInfo">${currentSalesStockCountMissingPage}</strong>/<strong id="salesStockCountMissingTotalPageInfo" style="margin-right:50px;">${totalSalesStockCountMissingPages}</strong>-->  
								${i18n.t('table.info.qty')} : <strong id = "salesStockCountMissingTotalQty"></strong>

							</span>
							<div class="action-buttons-right mSales_stock_count_missing">
								<div id="defaultActions" class="action-group">
									${i18n.t('table.info.total')} : <strong id= "checkedCount">0 </strong> ${i18n.t('table.info.records')} | 
									${i18n.t('table.info.qty')} : <strong id= "checkedQty">0 </strong>
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnSalesStockCountMissingExceptionOut"/>
									<input type="button" style="display:none" value="${i18n.t('btn.exceptionOut')}" class="btn btn-success btnSalesStockCountMissingExceptionOut"/>
									<button class="btn btn-primary" style="display:none" id="salesStockCountMissingConfirmBtn" onclick="realStockNotScan()">Confirm</button>
									<button class="btn btn-success" id="salesStockCountMissingExcelBtn" onclick="downloadAllSalesStockCountMissingData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mSales_stock_count_missing">
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
							<tbody id="salesStockCountMissingTableBody">
							</tbody>
						</table>
						
					</div>
				</div>
			</div>
		`;

	$(".w_contentArea").append(content_output);

	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#salesStockCountMissing_searchVal_fromDate").val(fromDate);
		$("#salesStockCountMissing_searchVal_toDate").val(toDate);
		$("#stockNotScanHiddenDate").val(fromDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderSalesStockCountMissingTableData();
	// 이벤트 바인딩
	bindSalesStockCountMissingEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateSalesStockCountMissingTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateSalesStockCountMissingTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#salesStockCountMissing_searchVal_factory');
	const storage = $('#salesStockCountMissing_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'WBTA': ['MATERIAL', 'PRODUCT', 'all'],
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

	$("#stockNotScanHiddenFactory").val(factory.val());
	$("#stockNotScanHiddenStorage").val(storage.val());

	window.autoSetStorageFields();
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}

// 총 개수를 업데이트하는 함수
function updateSalesStockCountMissingTotalCount() {
	$('#salesStockCountMissingTotalCount').text(totalSalesStockCountMissingCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateSalesStockCountMissingTotalQty() {
	$('#salesStockCountMissingTotalQty').text(totalSalesStockCountMissingQty.toLocaleString());
}

function renderSalesStockCountMissingTableData() {
	let tableBody = "";

	$("#salesStockCountMissingCurrentPageInfo").text(currentSalesStockCountMissingPage);
	$("#salesStockCountMissingTotalPageInfo").text(totalSalesStockCountMissingPages);
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	let totalqty = 0;
	for (let i = 0; i < globalSalesStockCountMissingData.length; i++) {
		let rowNumber = (currentSalesStockCountMissingPage - 1) * salesStockCountMissingItemsPerPage + i + 1;
		// 변수로 먼저 저장
		const row = globalSalesStockCountMissingData[i];

		const itemcode = row.ITEMCODE_REAL || row.itemcode_real || row.ITEMCODE_SYSTEM || row.itemcode_system || '';
		let sdate = row.SDATE || row.sdate || '';
		let location = row.LOCATION || row.location || '';

		let barcode = row.BARCODE || row.barcode || '';
		let qty = Number(row.QTY || row.qty || 0).toLocaleString();
		let itemcode2 = row.ITEMCODE || row.itemcode || '';
		let isChecked = (row.flag == 1) ? "checked" : "";

		// 비활성화 조건 N이면서 ADJUST가 CHANGE가 아니거나 바코드스캔이 Y일때
		let isDisabled = "";

		let searchDate = $("#salesStockCountMissing_searchVal_fromDate").val()
		// statusText와 함께 상태 클래스도 추가
		let statusText = '';
		let statusClass = '';
		if (row.ADJUST === 'ADJUSTMENT' || row.ADJUST === 'LOADEXCEPTION-NOSCAN') {
			statusText = i18n.t('table.adjustment');
			statusClass = 'status-waiting';
			isDisabled = 'disabled';
		} else if (row.USEYNBARCODE === 'N' || row.USEYNBARCODE === 'Y') {
			statusText = i18n.t('search.exception.output.completed');
			statusClass = 'status-completed';
			isDisabled = 'disabled';
		} else {
			statusText = '';
			statusClass = '';
		}

		if (isDisabled === 'disabled') {
			isChecked = ''
		}

		let factory = row.FACTORY || row.factory || '';
		let storage = row.STORAGE || row.storage || '';
		let no = i + 1;
		tableBody += `
            <tr class="" data-itemcode="${itemcode}" data-sdate="${sdate}" data-location="${location}">
            	<td class = "noVal">${no}</td>
				<td class = "dateVal">${row.SDATE || row.sdate || ''}</td>
				<td class = "locationVal_short">${row.LOCATION || row.location || ''}</td>
				<td class = "barcodeVal">${row.BARCODE || row.barcode || ''}</td>
				<td class = "itemcodeVal">${row.ITEMCODE || row.itemcode || ''}</td>
				<td class = "itemnameVal_short">${row.ITEMNAME || row.itemname || ''}</td>
				<td class = "itemcodeVal">${row.SENDING || row.sending || ''}</td>
				<td class = "qtyVal">${Number(row.QTY || row.qty || 0).toLocaleString()}</td>
				<td class = "dateVal"><input type = 'checkbox' class= 'stockNotScanCheck' data-barcode='${barcode}_${qty}_${itemcode2}' ${isChecked} ${isDisabled}  data-unique="${barcode}_${searchDate}_${factory}_${storage}_${qty.replaceAll(',', '')}_${itemcode2}"></td>
				<td class="exStatusVal ${statusClass}">${statusText}</td>
            </tr>
        `;
		totalqty = Number(totalqty) + Number(row.QTY || row.qty || 0)
	}

	//console.log("생성된 tableBody:", tableBody);
	$("#salesStockCountMissingTableBody").html(tableBody);
	let all = globalSalesStockCountMissingData.length;
	let checked = $(".stockNotScanCheck:checked").length;
	console.log("all checked " + all + "--" + checked)
	$("#stockNotScanCheckAll").prop("checked", all === checked ? true : false);
	totalSalesStockCountMissingQty = totalqty.toLocaleString();
	totalSalesStockCountMissingCount = globalSalesStockCountMissingData.length.toLocaleString()
	updateChecked();
}

// 이벤트 바인딩
function bindSalesStockCountMissingEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnSalesStockCountMissingSearch").off('click').on('click', function() {
		performSalesStockCountMissingSearch();
	});

	// 초기화 버튼 클릭
	$(".btnSalesStockCountMissingSearchInit").off('click').on('click', function() {
		resetSalesStockCountMissingSearch();
	});

	$("#salesStockCountMissingConfirmBtn").off('click').on('click', function() {
		realStockNotScan();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.salesStockCountMissing-page-btn').on('click', '.salesStockCountMissing-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentSalesStockCountMissingPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performSalesStockCountMissingDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_mSales_stock_count_missing input[type="text"], #view_mSales_stock_count_missing input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performSalesStockCountMissingSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		startdate: $("#salesStockCountMissing_searchVal_fromDate").val(),
		enddate: $("#salesStockCountMissing_searchVal_toDate").val(),
		location: $("#salesStockCountMissing_searchVal_location").val().trim().toUpperCase(),
		factory: $("#salesStockCountMissing_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#salesStockCountMissing_searchVal_storage").val().trim().toUpperCase(),
		itemcode: $("#salesStockCountMissing_searchVal_itemcode").val().trim().toUpperCase(),
		status: $("#salesStockCountMissing_searchVal_status").val().trim().toUpperCase(),
	};
}

// 검색 수행 함수 - DB 조회
function performSalesStockCountMissingSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentSalesStockCountMissingPage = 1;
	performSalesStockCountMissingDBSearch(searchCriteria);
}

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayStr = `${year}-${month}-${day}`;
// 검색 조건 초기화
function resetSalesStockCountMissingSearch() {

	$("#salesStockCountMissing_searchVal_fromDate").val(todayStr);
	$("#salesStockCountMissing_searchVal_location").val('');
	$("#salesStockCountMissing_searchVal_itemcode").val('');
	$("#salesStockCountMissing_searchVal_status").val('all');

	// 공장, 창고 선택
	renderFactoryStorage();

	// 초기화 후 전체 데이터 다시 조회
	currentSalesStockCountMissingPage = 1;

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
	const fromDate = fmtLocalDate(today);
	return { fromDate, toDate };
}


// 유틸리티 함수들
window.changeSalesStockCountMissingItemsPerPage = function(newItemsPerPage) {
	salesStockCountMissingItemsPerPage = newItemsPerPage;
	currentSalesStockCountMissingPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performSalesStockCountMissingDBSearch(searchCriteria);
}

window.exportSalesStockCountMissingData = function() {
	return {
		total: globalSalesStockCountMissingData.length,
		currentPage: currentSalesStockCountMissingPage,
		itemsPerPage: salesStockCountMissingItemsPerPage,
		data: globalSalesStockCountMissingData
	};
}


window.downloadAllSalesStockCountMissingData = function() {
	let searchCriteria = {
		startdate: $("#salesStockCountMissing_searchVal_fromDate").val(),
		enddate: $("#salesStockCountMissing_searchVal_toDate").val(),
		location: $("#salesStockCountMissing_searchVal_location").val().trim().toUpperCase(),
		factory: $("#salesStockCountMissing_searchVal_factory").val().trim().toUpperCase(),
		storage: $("#salesStockCountMissing_searchVal_storage").val().trim().toUpperCase(),
		itemcode: $("#salesStockCountMissing_searchVal_itemcode").val().trim().toUpperCase(),
		status: $("#salesStockCountMissing_searchVal_status").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_salesStockCountMissing_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			data.forEach(row => {
				// status값 화면이랑 동일하게 변경
				if (row.ADJUST === 'ADJUSTMENT' || row.ADJUST === 'LOADEXCEPTION-NOSCAN') {
					row.STATUS = i18n.t('table.adjustment');     // 조정
				} else if ((row.USEYNBARCODE === 'N') || row.BARCODESCAN === 'Y') {
					row.STATUS = i18n.t('search.exception.output.completed'); // 완료
				} else {
					row.STATUS = '';
				}
			});
			ExcelExporter.downloadExcel(data, window.salesStockCountMissingColumns, {
				fileName: 'SalesStockCountMissing_All',
				sheetName: 'SalesStockCountMissing'
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
$(document).on('click', '.modal_salesStockCountMissing_open', function() {
	showLoading("data");

	$('#modal_salesStockCountMissing').fadeIn(500);

	salesStockCountMissingDetail($(this));
});

// 모달 닫기
$(document).on('click', '.modal_salesStockCountMissing_close', function() {
	$('#modal_salesStockCountMissing').fadeOut(200);
});

// ESC 키로 닫기
$(document).keydown(function(e) {
	if (e.keyCode === 27) {
		$('#modal_salesStockCountMissing').fadeOut(200);
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
			url: "/realSalesStockNotScan",
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
$(document).on("click", ".btnSalesStockCountMissingExceptionOut", function() {
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

	console.log(iidList)
	console.log(sabun);

	if (day == lastDay) {
		if (confirm("Do you want to adjust inventory?")) {
			showLoading("data");
			$.ajax({
				url: `/salesAdjustment`,
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
					performSalesStockCountMissingDBSearch(searchCriteria);
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
				url: `/salesInsertExcpetionOutput`,
				type: "POST",
				data: JSON.stringify({
					loginid: loginid,
					sabun: sabun,
					list: iidList,
					memo: "LOADEXCEPTION-NOSCAN"
				}),
				contentType: "application/json",
				success: function(data) {
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performSalesStockCountMissingDBSearch(searchCriteria);
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