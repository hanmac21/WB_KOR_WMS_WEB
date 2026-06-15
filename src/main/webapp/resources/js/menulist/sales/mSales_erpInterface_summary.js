/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */
let globalSalesErpInterfaceSummaryData = []; // 현재 조회된 데이터 저장
let currentSalesErpInterfaceSummaryPage = 1; // 현재 페이지
let salesErpInterfaceSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalSalesErpInterfaceSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalSalesErpInterfaceSummaryQty = 0; // 서버에서 받은 총 개수 저장
let totalSalesErpInterfaceSummaryPages = 0; // 서버에서 받은 총 페이지

$(document).ready(function() {

	window.filteredSalesErpInterfaceSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.salesErpInterfaceSummaryColumns = [
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'COUNTQTY', header: 'countqty'},
		{ key: 'INOUT', header: 'in/out qty', type: 'number'},
		{ key: 'NOSCANQTY', header: 'noscanqty'},
		{ key: 'TOTALQTY', header: 'totalqty'},
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mSales_erpInterface_summary = function(menuId) {
		//showLoading("data");

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 공장으로 조회
		//performSalesErpInterfaceSummaryDBSearch({ factory });
		// 초기에 화면 그려지지 않도록 기초화면만 그려줌
		renderSalesErpInterfaceSummaryView();
	}
});
// DB에서 데이터 조회하는 함수
function performSalesErpInterfaceSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_salesErpInterfaceSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentSalesErpInterfaceSummaryPage,
			itemsPerPage: salesErpInterfaceSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalSalesErpInterfaceSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalSalesErpInterfaceSummaryCount = data.totalCount || 0;
			totalSalesErpInterfaceSummaryQty = data.totalQty || 0;
			currentSalesErpInterfaceSummaryPage = data.currentPage || 0;
			window.filteredSalesErpInterfaceSummaryData = globalSalesErpInterfaceSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mSales_erpInterface_summary').length) {
				renderSalesErpInterfaceSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderSalesErpInterfaceSummaryTableData();
				//renderSalesErpInterfaceSummaryPagination();
				//updateSalesErpInterfaceSummaryTotalCount();
				//updateSalesErpInterfaceSummaryTotalQty();
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
function renderSalesErpInterfaceSummaryView() {
	let loginid = $(".loginId").text().trim().toLowerCase();
	let btnAreaHtml = "";
	if (loginid  == "wms" ) {
	        btnAreaHtml = `
				<input class="btn" type="date" id="salesErpInterfaceSummaryIntfDate" />
				<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfSalesStockCountSummary"/>
				<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfSalesStockCountSummaryDelete"/>
	        `;
	    }else{
			btnAreaHtml = ``
		}
	let content_output = `
			<div class="divBlockControl" id="view_mSales_erpInterface_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="salesErpInterfaceSummary_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="salesErpInterfaceSummary_searchVal_sdate" />
							</div>
							<div class="search-label">
								<div class="salesErpInterfaceSummary_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesErpInterfaceSummary_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>									
								</select>
							</div>
							<div class="search-label">
								<div class="salesErpInterfaceSummary_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesErpInterfaceSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="salesErpInterfaceSummary_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="salesErpInterfaceSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="salesErpInterfaceSummary_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesErpInterfaceSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="salesErpInterfaceSummary_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesErpInterfaceSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnSalesErpInterfaceSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnSalesErpInterfaceSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesErpInterfaceSummaryTotalCount">${totalSalesErpInterfaceSummaryCount}</strong> ${i18n.t('table.info.records')} |   
								<span class="tqtyTitle">Count Qty : </span><span class="salesErpInterfaceSummaryTotalQty" id = "salesErpInterfaceSummaryCountQty" style="color:#007bff"></span> |
								<span class="tqtyTitle">In/Out Qty : </span><span class="salesErpInterfaceSummaryTotalQty" id = "salesErpInterfaceSummaryStockQty" style="color:#007bff"></span> |
								<span class="tqtyTitle">No scan Qty : </span><span class="salesErpInterfaceSummaryTotalQty" id = "salesErpInterfaceSummaryNoscanQty" style="color:#007bff"></span> |
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesErpInterfaceSummaryTotalQty" id = "salesErpInterfaceSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mSales_erpInterface_summary">
								<div id="defaultActions" class="action-group">
									${btnAreaHtml}
									<button class="btn btn-success" id="salesErpInterfaceSummaryExcelBtn" onclick="downloadAllSalesErpInterfaceSummaryData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnSalesStockCountSummaryItemsArea" style="margin-left:24px;">
								
							</div>
						</div>
						<table class="data-table mSales_erpInterface_summary">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="salesErpInterfaceSummary_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "scanqtyVal">Count Qty<!-- Count Qty --></th>
									<th class = "scanqtyVal">In/Out Qty<!-- Stock QTy --></th>
									<th class = "scanqtyVal">No scan Qty<!-- Noscan Qty --></th>
									<th class = "scanqtyVal">Total Qty<!-- Total Qty --></th>
								</tr>
							</thead>
							<tbody id="salesErpInterfaceSummaryTableBody">
							</tbody>
						</table>
						
					</div>
				</div>
			</div>
		`;

	$(".w_contentArea").append(content_output);
	
	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderSalesErpInterfaceSummaryTableData();
	// 페이지네이션 렌더링
	renderSalesErpInterfaceSummaryPagination();
	// 이벤트 바인딩
	bindSalesErpInterfaceSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateSalesErpInterfaceSummaryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateSalesErpInterfaceSummaryTotalQty();
	(function() {
		const today = new Date();
		// 하루 전날
	    const yesterday = new Date(today);
	    yesterday.setDate(today.getDate() - 1);

	    // 포맷팅
	    const toDate = fmtLocalDate(yesterday);

	    // input에 기본값 설정
	    $("#salesErpInterfaceSummary_searchVal_sdate").val(toDate);
	    $("#salesErpInterfaceSummaryIntfDate").val(toDate);

	    // 오늘까지만 선택 가능하도록 제한
	    $("#salesErpInterfaceSummary_searchVal_sdate").attr("max", fmtLocalDate(yesterday));
	    $("#salesErpInterfaceSummaryIntfDate").attr("max", fmtLocalDate(yesterday));
	})();

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

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#salesErpInterfaceSummary_searchVal_factory');
	const storage = $('#salesErpInterfaceSummary_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'WBTA': ['MATERIAL', 'PRODUCT'],
		};

		const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택 (Material)
		// storage.val(storageList[0]);
		// DOM 렌더링 완료 후 val() 세팅
		setTimeout(() => {
			storage.val(storageList[1]);
		}, 0);
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
function updateSalesErpInterfaceSummaryTotalCount() {
	$('#salesErpInterfaceSummaryTotalCount').text(Number(totalSalesErpInterfaceSummaryCount).toLocaleString());
}

//총 개수를 업데이트하는 함수
function updateSalesErpInterfaceSummaryTotalQty() {
	$('#salesErpInterfaceSummaryTotalQty').text(totalSalesErpInterfaceSummaryQty.toLocaleString());
}

function renderSalesErpInterfaceSummaryTableData() {
	let tableBody = "";

	//console.log("globalSalesErpInterfaceSummaryData:", globalSalesErpInterfaceSummaryData);
	//console.log("데이터 개수:", globalSalesErpInterfaceSummaryData.length);
	let countqty = 0;
	let stockqty = 0;
	let noscanqty = 0;
	let totalqty = 0;
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalSalesErpInterfaceSummaryData.length; i++) {
		let rowNumber = (currentSalesErpInterfaceSummaryPage - 1) * salesErpInterfaceSummaryItemsPerPage + i + 1;
		let data = globalSalesErpInterfaceSummaryData[i];
		let statusText = data.intf_yn === 'Y' ? 'Completed' : 'Waiting';
		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';

		//console.log(`행 ${i}:`, data); // 각 행 데이터 확인
		let tcqty = Number(data.COUNTQTY || data.countqty || 0);
		let tsqty = Number(data.INOUT || data.inout || 0);
		let tnqty = Number(data.NOSCANQTY || data.noscanqty || 0);
		let tqty = Number(data.TOTALQTY || data.totalQty || 0);
		let no = i+1;
		let storage = $("#salesErpInterfaceSummary_searchVal_storage").val()
		tableBody += `
            <tr>	
            	<td class = "checkboxVal"><input type="checkbox" class="salesErpInterfaceSummary_chk ${statusClass}" 
            			data-unique="${data.sdate}_${data.itemcode}_${data.intf_yn}_${tqty}_${data.factory}_${data.storage}"></td>
                <td class = "noVal">${no}</td>
                <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
                <td class = "carVal">${data.CAR || data.car || ''}</td>
                <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                <td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
                <td class = "scanqtyVal">${tcqty}</td>
                <td class = "scanqtyVal">${tsqty}</td>
                <td class = "scanqtyVal">${tnqty}</td>
                <td class = "scanqtyVal">${tqty}</td>
            </tr>
        `;
		countqty += tcqty;
		stockqty += tsqty;
		noscanqty += tnqty;
		totalqty += tqty;
	}
	
	//console.log("생성된 tableBody:", tableBody);
	$("#salesErpInterfaceSummaryTableBody").html(tableBody);
	$("#salesErpInterfaceSummaryTotalCount").text(globalSalesErpInterfaceSummaryData.length.toLocaleString());
	$("#salesErpInterfaceSummaryCountQty").text(countqty.toLocaleString());
	$("#salesErpInterfaceSummaryStockQty").text(stockqty.toLocaleString());
	$("#salesErpInterfaceSummaryNoscanQty").text(noscanqty.toLocaleString());
	$("#salesErpInterfaceSummaryTotalQty").text(totalqty.toLocaleString());
	
	$(".salesErpInterfaceSummary_chkAll").prop("checked", false);
}

// 페이지네이션 렌더링
function renderSalesErpInterfaceSummaryPagination() {
	let totalPages = Math.ceil(totalSalesErpInterfaceSummaryCount / salesErpInterfaceSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentSalesErpInterfaceSummaryPage > 1) {
		paginationHtml += `<button class="salesErpInterfaceSummary-page-btn" data-page="${currentSalesErpInterfaceSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="salesErpInterfaceSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentSalesErpInterfaceSummaryPage - 5);
	let endPage = Math.min(totalPages, currentSalesErpInterfaceSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="salesErpInterfaceSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentSalesErpInterfaceSummaryPage) {
			paginationHtml += `<button class="salesErpInterfaceSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="salesErpInterfaceSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="salesErpInterfaceSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentSalesErpInterfaceSummaryPage < totalPages) {
		paginationHtml += `<button class="salesErpInterfaceSummary-page-btn" data-page="${currentSalesErpInterfaceSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="salesErpInterfaceSummary-page-btn disabled">&gt;</button>`;
	}

	$("#salesErpInterfaceSummaryTotalPageInfo").text(totalPages);
	$("#salesErpInterfaceSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindSalesErpInterfaceSummaryEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.salesErpInterfaceSummary_chkAll').on('change', '.salesErpInterfaceSummary_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.salesErpInterfaceSummary_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.salesErpInterfaceSummary_chk').on('change', '.salesErpInterfaceSummary_chk', function() {
		let totalCheckboxes = $('.salesErpInterfaceSummary_chk').length;
		let checkedCheckboxes = $('.salesErpInterfaceSummary_chk:checked').length;
		$('.salesErpInterfaceSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnSalesErpInterfaceSummarySearch").off('click').on('click', function() {
		performSalesErpInterfaceSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnSalesErpInterfaceSummarySearchInit").off('click').on('click', function() {
		resetSalesErpInterfaceSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.salesErpInterfaceSummary-page-btn').on('click', '.salesErpInterfaceSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentSalesErpInterfaceSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performSalesErpInterfaceSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_mSales_erpInterface_summary input[type="text"], #view_mSales_erpInterface_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performSalesErpInterfaceSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		/*intf_yn: $("#salesErpInterfaceSummary_searchVal_Condition").val(),*/
		factory: $("#salesErpInterfaceSummary_searchVal_factory").val(),
		storage: $("#salesErpInterfaceSummary_searchVal_storage").val(),
		startdate: $("#salesErpInterfaceSummary_searchVal_sdate").val(),
		car: $("#salesErpInterfaceSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#salesErpInterfaceSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#salesErpInterfaceSummary_searchVal_itemname").val().trim().toUpperCase(),
	};
}

// 검색 수행 함수 - DB 조회
function performSalesErpInterfaceSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentSalesErpInterfaceSummaryPage = 1;
	performSalesErpInterfaceSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetSalesErpInterfaceSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const factory = getCookie('selectedFactory');
	const startdate = fromDate;

	// 오늘까지만 선택 가능하도록 제한
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	$("#salesErpInterfaceSummary_searchVal_sdate").attr("max", fmtLocalDate(yesterday));

	renderFactoryStorage();
	$("#salesErpInterfaceSummary_searchVal_car").val('');
	$("#salesErpInterfaceSummary_searchVal_itemcode").val('');
	$("#salesErpInterfaceSummary_searchVal_itemname").val('');

	// 초기화 후 전체 데이터 다시 조회
	currentSalesErpInterfaceSummaryPage = 1;
	performSalesErpInterfaceSummaryDBSearch({ startdate, factory });

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

// 유틸리티 함수들
window.changeSalesErpInterfaceSummaryItemsPerPage = function(newItemsPerPage) {
	salesErpInterfaceSummaryItemsPerPage = newItemsPerPage;
	currentSalesErpInterfaceSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performSalesErpInterfaceSummaryDBSearch(searchCriteria);
}

window.exportSalesErpInterfaceSummaryData = function() {
	return {
		total: globalSalesErpInterfaceSummaryData.length,
		currentPage: currentSalesErpInterfaceSummaryPage,
		itemsPerPage: salesErpInterfaceSummaryItemsPerPage,
		data: globalSalesErpInterfaceSummaryData
	};
}

window.downloadAllSalesErpInterfaceSummaryData = function() {
	let searchCriteria = {
		/*intf_yn: $("#salesErpInterfaceSummary_searchVal_Condition").val(),*/
		factory: $("#salesErpInterfaceSummary_searchVal_factory").val(),
		storage: $("#salesErpInterfaceSummary_searchVal_storage").val(),
		scantype: $("#salesErpInterfaceSummary_searchVal_scantype").val(),
		startdate: $("#salesErpInterfaceSummary_searchVal_sdate").val(),
		car: $("#salesErpInterfaceSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#salesErpInterfaceSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#salesErpInterfaceSummary_searchVal_itemname").val().trim().toUpperCase(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_salesErpInterfaceSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.salesErpInterfaceSummaryColumns, {
				fileName: 'SalesErpInterfaceSummary_All',
				sheetName: 'SalesErpInterfaceSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

$(document).on("click", ".btnIntfSalesStockCountSummary", function() {

	if ($(".salesErpInterfaceSummary_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}
	
	const iidList = [];
	$(".salesErpInterfaceSummary_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});
	
	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}
	
	const payLoad = {
		iidList : iidList,
		date : $('#salesErpInterfaceSummaryIntfDate').val()
	}

	showLoading("data");

	console.log(iidList)
	$.ajax({
		url: "/erpInterface_confirm_summary",
		type: "POST",
		data: JSON.stringify(payLoad),
		contentType: "application/json",
		success: function(data) {
			if (data === 12) {
				alert(i18n.t('warning.locked'));
				hideLoading();
				return;
			}
			let searchVal = getCurrentSearchCriteria();
			performSalesErpInterfaceSummaryDBSearch(searchVal);
			alert("인터페이스 완료되었습니다.")
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
			hideLoading();
		}
	});

});

$(document).on("click", ".btnIntfSalesStockCountSummaryDelete", function() {

	/* 260128 인터페이스 삭제 intf_yn 값없어서 주석 처리 : 승인*/
	/*if ($(".salesErpInterfaceSummary_chk.status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}*/	
	
	const iidList = [];
	$(".salesErpInterfaceSummary_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});
	
	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	showLoading("data");

	console.log(iidList)
	const payLoad = {
		iidList : iidList,
		date : $('#salesErpInterfaceSummaryIntfDate').val()
	}
	$.ajax({
		url: "/erpInterface_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(payLoad),
		contentType: "application/json",
		success: function(data) {
			if (data === 12) {
				alert(i18n.t('warning.locked'));
				hideLoading();
				return;
			}
			alert("인터페이스 삭제 완료되었습니다.")
			let searchVal = getCurrentSearchCriteria();
			performSalesErpInterfaceSummaryDBSearch(searchVal);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
			hideLoading();
		}
	});

});