/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */
let globalErpInterfaceSummaryData = []; // 현재 조회된 데이터 저장
let currentErpInterfaceSummaryPage = 1; // 현재 페이지
let erpInterfaceSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalErpInterfaceSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalErpInterfaceSummaryQty = 0; // 서버에서 받은 총 개수 저장
let totalErpInterfaceSummaryPages = 0; // 서버에서 받은 총 페이지

$(document).ready(function() {

	window.filteredErpInterfaceSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.erpInterfaceSummaryColumns = [
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'spec' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'COUNTQTY', header: 'countqty'},
		{ key: 'INOUT', header: 'in/out qty', type: 'number'},
		{ key: 'NOSCANQTY', header: 'noscanqty'},
		{ key: 'TOTALQTY', header: 'totalqty'},
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_erpInterface_summary = function(menuId) {
		//showLoading("data");

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 공장으로 조회
		//performErpInterfaceSummaryDBSearch({ factory });
		// 초기에 화면 그려지지 않도록 기초화면만 그려줌
		renderErpInterfaceSummaryView();
	}
});
// DB에서 데이터 조회하는 함수
function performErpInterfaceSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_erpInterfaceSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentErpInterfaceSummaryPage,
			itemsPerPage: erpInterfaceSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalErpInterfaceSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalErpInterfaceSummaryCount = data.totalCount || 0;
			totalErpInterfaceSummaryQty = data.totalQty || 0;
			currentErpInterfaceSummaryPage = data.currentPage || 0;
			window.filteredErpInterfaceSummaryData = globalErpInterfaceSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_erpInterface_summary').length) {
				renderErpInterfaceSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderErpInterfaceSummaryTableData();
				//renderErpInterfaceSummaryPagination();
				//updateErpInterfaceSummaryTotalCount();
				//updateErpInterfaceSummaryTotalQty();
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
function renderErpInterfaceSummaryView() {
	let loginid = $(".loginId").text().trim().toLowerCase();
	let btnAreaHtml = "";
	let locationbackupth = "";
	let locationbackupQtyHtml = "";
	let totalqtychk = "";
	if (loginid  == "wms" ) {
	        btnAreaHtml = `
				<input class="btn" type="date" id="erpInterfaceSummaryIntfDate" />
				<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfStockCountSummary"/>
				<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfStockCountSummaryDelete"/>
	        `;
	        locationbackupth = `<th class = "scanqtyVal"><input type="radio" name="qtyMode" id="backyn" value="backup">location backup</th>`;
            locationbackupQtyHtml = ` | <span class="tqtyTitle">Location Backup Qty : </span><span class="erpInterfaceSummaryTotalQty" id="erpInterfaceSummaryLocationBackupQty" style="color:#007bff"></span>`;
            totalqtychk = `<input type="radio" name="qtyMode" id="totalqtychk" value="total" checked style="margin-right:4px;">`;
	    }else{
			btnAreaHtml = ``
            locationbackupth = ``;
			totalqtychk = ``;
		}
	let content_output = `
			<div class="divBlockControl" id="view_m2_erpInterface_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="erpInterfaceSummary_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="erpInterfaceSummary_searchVal_sdate" />
							</div>
							<div class="search-label">
								<div class="erpInterfaceSummary_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="erpInterfaceSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="erpInterfaceSummary_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="erpInterfaceSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="erpInterfaceSummary_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="erpInterfaceSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="erpInterfaceSummary_searchVal_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="erpInterfaceSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="erpInterfaceSummary_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="erpInterfaceSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnErpInterfaceSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnErpInterfaceSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="erpInterfaceSummaryTotalCount">${totalErpInterfaceSummaryCount}</strong> ${i18n.t('table.info.records')} |   
								<span class="tqtyTitle">Count Qty : </span><span class="erpInterfaceSummaryTotalQty" id = "erpInterfaceSummaryCountQty" style="color:#007bff"></span> |
								<span class="tqtyTitle">In/Out Qty : </span><span class="erpInterfaceSummaryTotalQty" id = "erpInterfaceSummaryStockQty" style="color:#007bff"></span> |
								<span class="tqtyTitle">No scan Qty : </span><span class="erpInterfaceSummaryTotalQty" id = "erpInterfaceSummaryNoscanQty" style="color:#007bff"></span> |
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="erpInterfaceSummaryTotalQty" id = "erpInterfaceSummaryTotalQty" style="color:#007bff"></span>${locationbackupQtyHtml}
							</span>
							<div class="action-buttons-right m2_erpInterface_summary">
								<div id="defaultActions" class="action-group">
									${btnAreaHtml}
									<button class="btn btn-success" id="erpInterfaceSummaryExcelBtn" onclick="downloadAllErpInterfaceSummaryData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnStockCountSummaryItemsArea" style="margin-left:24px;">
								
							</div>
						</div>
						<table class="data-table m2_erpInterface_summary">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="erpInterfaceSummary_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "cnameVal">${i18n.t('search.customercode')}<!-- ITEMCODE --></th>
									<th class = "itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "scanqtyVal">Count Qty<!-- Count Qty --></th>
									<th class = "scanqtyVal">In/Out Qty<!-- Stock QTy --></th>
									<th class = "scanqtyVal">No scan Qty<!-- Noscan Qty --></th>
									<th class = "scanqtyVal">${totalqtychk}Total Qty<!-- Total Qty --></th>
									${locationbackupth}
								</tr>
							</thead>
							<tbody id="erpInterfaceSummaryTableBody">
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
	renderErpInterfaceSummaryTableData();
	// 페이지네이션 렌더링
	renderErpInterfaceSummaryPagination();
	// 이벤트 바인딩
	bindErpInterfaceSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateErpInterfaceSummaryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateErpInterfaceSummaryTotalQty();
	(function() {
		const today = new Date();
		// 하루 전날
	    const yesterday = new Date(today);
	    yesterday.setDate(today.getDate() - 1);

	    // 포맷팅
	    const toDate = fmtLocalDate(yesterday);

	    // input에 기본값 설정
	    $("#erpInterfaceSummary_searchVal_sdate").val(toDate);
	    $("#erpInterfaceSummaryIntfDate").val(toDate);

	    // 오늘까지만 선택 가능하도록 제한
	    $("#erpInterfaceSummary_searchVal_sdate").attr("max", fmtLocalDate(yesterday));
	    $("#erpInterfaceSummaryIntfDate").attr("max", fmtLocalDate(yesterday));
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
	const storage = $('#erpInterfaceSummary_searchVal_storage');
	const savedStorage = getCookie('selectedStorage');

	storage.empty();

	let storageList = ['INBOUND', 'OUTSIDE'];

	// ILLINOIS 사용자는 OUTSIDE만 선택 가능
	if (savedStorage === 'ILLINOIS') {
		storageList = ['OUTSIDE'];
	}

	storageList.forEach(item => {
		const text = item === 'all' ? i18n.t('search.all') : item;
		storage.append(`<option value="${item}">${text}</option>`);
	});

	// 첫 번째 옵션 선택 (INBOUND)
	// storage.val(storageList[0]);
	// DOM 렌더링 완료 후 val() 세팅
	setTimeout(() => {
		storage.val(storageList[0]).trigger('change');
	}, 0);
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}


// 총 개수를 업데이트하는 함수
function updateErpInterfaceSummaryTotalCount() {
	$('#erpInterfaceSummaryTotalCount').text(Number(totalErpInterfaceSummaryCount).toLocaleString());
}

//총 개수를 업데이트하는 함수
function updateErpInterfaceSummaryTotalQty() {
	$('#erpInterfaceSummaryTotalQty').text(totalErpInterfaceSummaryQty.toLocaleString());
}

function renderErpInterfaceSummaryTableData() {
	let tableBody = "";

	//console.log("globalErpInterfaceSummaryData:", globalErpInterfaceSummaryData);
	//console.log("데이터 개수:", globalErpInterfaceSummaryData.length);
	let countqty = 0;
	let stockqty = 0;
	let noscanqty = 0;
	let totalqty = 0;
	let locationbackupqty = 0;
    let loginid = $(".loginId").text().trim().toLowerCase();
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalErpInterfaceSummaryData.length; i++) {
		let rowNumber = (currentErpInterfaceSummaryPage - 1) * erpInterfaceSummaryItemsPerPage + i + 1;
		let data = globalErpInterfaceSummaryData[i];
		let statusText = data.intf_yn === 'Y' ? 'Completed' : 'Waiting';
		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
		let locationbackuptd = ``;

		//console.log(`행 ${i}:`, data); // 각 행 데이터 확인
		let tcqty = Number(data.COUNTQTY || data.countqty || 0);
		let tsqty = Number(data.INOUT || data.inout || 0);
		let tnqty = Number(data.NOSCANQTY || data.noscanqty || 0);
		let tlbqty = Number(data.LOCATIONBACKUPQTY || data.locationbackupqty || 0);       // locationbackup수량
		let tqty = Number(data.TOTALQTY || data.totalQty || 0);
		let no = i+1;
		let storage = $("#erpInterfaceSummary_searchVal_storage").val()
		if (loginid  == "wms" ) {
            locationbackuptd = `<td class = "scanqtyVal">${tlbqty}</td>`;
        }else{
            locationbackuptd = ``;
        }
		tableBody += `
            <tr>	
            	<td class = "checkboxVal"><input type="checkbox" class="erpInterfaceSummary_chk ${statusClass}" 
            			data-unique="${data.sdate}_${data.itemcode}_${data.intf_yn}_${tqty}_${data.factory}_${data.storage}_${tlbqty}"></td>
                <td class = "noVal">${no}</td>
                <td class = "carVal">${data.CAR || data.car || ''}</td>
                <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                <td class = "cnameVal">${data.SPEC || data.spec || ''}</td>
                <td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
                <td class = "scanqtyVal">${tcqty}</td>
                <td class = "scanqtyVal">${tsqty}</td>
                <td class = "scanqtyVal">${tnqty}</td>
                <td class = "scanqtyVal">${tqty}</td>
                ${locationbackuptd}
            </tr>
        `;
		countqty += tcqty;
		stockqty += tsqty;
		noscanqty += tnqty;
		totalqty += tqty;
		locationbackupqty += tlbqty;
	}
	
	//console.log("생성된 tableBody:", tableBody);
	$("#erpInterfaceSummaryTableBody").html(tableBody);
	$("#erpInterfaceSummaryTotalCount").text(globalErpInterfaceSummaryData.length.toLocaleString());
	$("#erpInterfaceSummaryCountQty").text(countqty.toLocaleString());
	$("#erpInterfaceSummaryStockQty").text(stockqty.toLocaleString());
	$("#erpInterfaceSummaryNoscanQty").text(noscanqty.toLocaleString());
	$("#erpInterfaceSummaryTotalQty").text(totalqty.toLocaleString());
	$("#erpInterfaceSummaryLocationBackupQty").text(locationbackupqty.toLocaleString());
	
	$(".erpInterfaceSummary_chkAll").prop("checked", false);
}

// 페이지네이션 렌더링
function renderErpInterfaceSummaryPagination() {
	let totalPages = Math.ceil(totalErpInterfaceSummaryCount / erpInterfaceSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentErpInterfaceSummaryPage > 1) {
		paginationHtml += `<button class="erpInterfaceSummary-page-btn" data-page="${currentErpInterfaceSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="erpInterfaceSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentErpInterfaceSummaryPage - 5);
	let endPage = Math.min(totalPages, currentErpInterfaceSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="erpInterfaceSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentErpInterfaceSummaryPage) {
			paginationHtml += `<button class="erpInterfaceSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="erpInterfaceSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="erpInterfaceSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentErpInterfaceSummaryPage < totalPages) {
		paginationHtml += `<button class="erpInterfaceSummary-page-btn" data-page="${currentErpInterfaceSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="erpInterfaceSummary-page-btn disabled">&gt;</button>`;
	}

	$("#erpInterfaceSummaryTotalPageInfo").text(totalPages);
	$("#erpInterfaceSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindErpInterfaceSummaryEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.erpInterfaceSummary_chkAll').on('change', '.erpInterfaceSummary_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.erpInterfaceSummary_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.erpInterfaceSummary_chk').on('change', '.erpInterfaceSummary_chk', function() {
		let totalCheckboxes = $('.erpInterfaceSummary_chk').length;
		let checkedCheckboxes = $('.erpInterfaceSummary_chk:checked').length;
		$('.erpInterfaceSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnErpInterfaceSummarySearch").off('click').on('click', function() {
		performErpInterfaceSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnErpInterfaceSummarySearchInit").off('click').on('click', function() {
		resetErpInterfaceSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.erpInterfaceSummary-page-btn').on('click', '.erpInterfaceSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentErpInterfaceSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performErpInterfaceSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_erpInterface_summary input[type="text"], #view_m2_erpInterface_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performErpInterfaceSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		/*intf_yn: $("#erpInterfaceSummary_searchVal_Condition").val(),*/
		storage: $("#erpInterfaceSummary_searchVal_storage").val(),
		startdate: $("#erpInterfaceSummary_searchVal_sdate").val(),
		car: $("#erpInterfaceSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#erpInterfaceSummary_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#erpInterfaceSummary_searchVal_oitemcode").val().trim().toUpperCase(),
		itemname: $("#erpInterfaceSummary_searchVal_itemname").val().trim().toUpperCase(),
	};
}

// 검색 수행 함수 - DB 조회
function performErpInterfaceSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentErpInterfaceSummaryPage = 1;
	performErpInterfaceSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetErpInterfaceSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const startdate = fromDate;

	// 오늘까지만 선택 가능하도록 제한
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	$("#erpInterfaceSummary_searchVal_sdate").attr("max", fmtLocalDate(yesterday));

	renderFactoryStorage();
	$("#erpInterfaceSummary_searchVal_car").val('');
	$("#erpInterfaceSummary_searchVal_itemcode").val('');
	$("#erpInterfaceSummary_searchVal_oitemcode").val('');
	$("#erpInterfaceSummary_searchVal_itemname").val('');

	// 초기화 후 전체 데이터 다시 조회
	currentErpInterfaceSummaryPage = 1;
	performErpInterfaceSummaryDBSearch({ startdate });

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
window.changeErpInterfaceSummaryItemsPerPage = function(newItemsPerPage) {
	erpInterfaceSummaryItemsPerPage = newItemsPerPage;
	currentErpInterfaceSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performErpInterfaceSummaryDBSearch(searchCriteria);
}

window.exportErpInterfaceSummaryData = function() {
	return {
		total: globalErpInterfaceSummaryData.length,
		currentPage: currentErpInterfaceSummaryPage,
		itemsPerPage: erpInterfaceSummaryItemsPerPage,
		data: globalErpInterfaceSummaryData
	};
}

window.downloadAllErpInterfaceSummaryData = function() {
	let searchCriteria = {
		/*intf_yn: $("#erpInterfaceSummary_searchVal_Condition").val(),*/
		storage: $("#erpInterfaceSummary_searchVal_storage").val(),
		scantype: $("#erpInterfaceSummary_searchVal_scantype").val(),
		startdate: $("#erpInterfaceSummary_searchVal_sdate").val(),
		car: $("#erpInterfaceSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#erpInterfaceSummary_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#erpInterfaceSummary_searchVal_oitemcode").val().trim().toUpperCase(),
		itemname: $("#erpInterfaceSummary_searchVal_itemname").val().trim().toUpperCase(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_erpInterfaceSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.erpInterfaceSummaryColumns, {
				fileName: 'ErpInterfaceSummary_All',
				sheetName: 'ErpInterfaceSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

$(document).on("click", ".btnIntfStockCountSummary", function() {

	if ($(".erpInterfaceSummary_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}
	
	const iidList = [];
	$(".erpInterfaceSummary_chk:checked").each(function() {
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
		date : $('#erpInterfaceSummaryIntfDate').val(),
		locationbackup : $('#backyn').is(':checked') ? 'Y' : 'N'
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
			performErpInterfaceSummaryDBSearch(searchVal);
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

$(document).on("click", ".btnIntfStockCountSummaryDelete", function() {

	/* 260128 인터페이스 삭제 intf_yn 값없어서 주석 처리 : 승인*/
	/*if ($(".erpInterfaceSummary_chk.status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}*/	
	
	const iidList = [];
	$(".erpInterfaceSummary_chk:checked").each(function() {
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
		date : $('#erpInterfaceSummaryIntfDate').val()
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
			performErpInterfaceSummaryDBSearch(searchVal);
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