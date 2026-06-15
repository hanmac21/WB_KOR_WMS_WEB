/* --------------------------------------------------------------
 * 📌 구매 - 입고조회 - 수정삭제(집계형)
 * 비고: 
 * -------------------------------------------------------------- */
/* let currentIncoming_summaryPage = 1; // 현재 페이지
let incoming_summaryItemsPerPage = 1000; // 페이지당 항목 수
let totalIncoming_summaryCount = 0; // 전체 데이터 수

$(document).ready(function() {
	let today = new Date();
	let yyyy = today.getFullYear();
	let mm = String(today.getMonth() + 1).padStart(2, '0');  // 월은 0부터 시작
	let dd = String(today.getDate()).padStart(2, '0');
	let formattedDate = `${yyyy}-${mm}-${dd}`;
	$("#incoming_IS_searchVal_indate_from").val(formattedDate);
	$("#incoming_IS_searchVal_indate_to").val(formattedDate);
	window.call_m2_3_2 = function(menuId) {
		showLoading("data");
		loadIncoming_summaryData();
	}

	// 현재 테이블 데이터 반환 (엑셀 다운로드용)
	window.getCurrentTableData = function() {
		let tableData = [];
		$("#inboundTableBody tr").each(function() {
			let row = {};
			$(this).find("td").each(function(index) {
				if (index === 0) return; // 체크박스 제외
				let headerText = $(`#view_m2_3_2 table thead th:eq(${index})`).text().trim();
				row[headerText] = $(this).text().trim();
			});
			tableData.push(row);
		});
		return tableData;
	};

	// 입고조회 컬럼 정의 (엑셀 다운로드용)
	window.inboundColumns = [
	    { header: 'INTF_YN', key: 'INTF_YN' },        // 대문자로 수정
	    { header: 'INDATE', key: 'INDATE' },
	    { header: 'FACTORY', key: 'FACTORY' },
	    { header: 'STORAGE', key: 'STORAGE' },
	    { header: 'CUSTCODE', key: 'CUSTCODE' },      // CUSTCODE로 수정
	    { header: 'CNAME', key: 'CNAME' },
	    { header: 'CAR', key: 'CAR' },
	    { header: 'ITEMCODE', key: 'ITEMCODE' },      // ITEMCODE로 수정
	    { header: 'ITEMNAME', key: 'ITEMNAME' },      // ITEMNAME으로 수정
	    { header: 'QTY', key: 'QTY' },
	    { header: 'INVOICE_NO', key: 'INVOICE_NO' },
	    { header: 'CONTAINER NO', key: 'CONTAINER_NO' } // 실제 필드명 확인 필요
	];



});


// 날짜 변환 함수들
function formatDateToYYYYMMDD(dateStr) {
	if (!dateStr) return '';
	return dateStr.replace(/-/g, '');
}

function formatDateFromYYYYMMDD(dateStr) {
	if (!dateStr || dateStr.length !== 8) return '';
	return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
}

// 데이터 로드 함수
function loadIncoming_summaryData() {
	let searchCriteria = getSearchCriteria();

	let factory = '';
	
	if($("#incoming_IS_searchVal_factory").val() == null || $("#incoming_IS_searchVal_factory").val() == ''){
		factory = getCookie('selectedFactory');
	}
	else {
		factory = $("#incoming_IS_searchVal_factory").val();
	}

	searchCriteria.factory = factory;
	
	const { fromDate, toDate } = getDefaultDateRange();
	
	searchCriteria.fromDate = $("#incoming_IS_searchVal_indate_from").val() || getDefaultDateRange().fromDate;
	searchCriteria.toDate = $("#incoming_IS_searchVal_indate_to").val() || getDefaultDateRange().toDate;
	console.log(searchCriteria);
	
	
	$.ajax({
		url: "/read_incoming_summary",
		type: "POST",
		data: JSON.stringify({
			page: currentIncoming_summaryPage,
			itemsPerPage: incoming_summaryItemsPerPage,
			searchCriteria: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log("-- 조회. 입고조회 SUM. 정보 --");
			console.log(response);

			totalIncoming_summaryCount = response.totalCount;
			renderIncoming_summaryView(response.data);
			hideLoading();

			updateTotalQty()
		},
		error: function(xhr, status, error) {
			console.error("데이터 로드 실패:", error);
			hideLoading();
		}
	});
}

function updateTotalQty() {
	const searchMap = getSearchCriteria();
	
	let factory = '';
	
	if($("#incoming_IS_searchVal_factory").val() == null || $("#incoming_IS_searchVal_factory").val() == ''){
		factory = getCookie('selectedFactory');
	}
	else {
		factory = $("#incoming_IS_searchVal_factory").val();
	}

	searchMap.factory = factory;
	
	console.log($("#incoming_IS_searchVal_factory").val());
	console.log(searchMap);
	
	$.ajax({
		url: "/updateTotalQty_incomingList_summary",
		type: "POST",
		data: JSON.stringify(searchMap),
		contentType: "application/json",
		success: function(data) {
			$(".incomingListSummaryTotalQty").text(Number(data).toLocaleString());
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


$(document).on("click", ".btnIntfIncoming", function() {

	if ($(".status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}
	
	const iidList = [];
	$(".inbound_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	showLoading("data");

	console.log(iidList)
	$.ajax({
		url: "/inbound_confirm_summary",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			loadIncoming_summaryData();
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

});

$(document).on("click", ".btnIntfIncomingDelete", function() {

	if ($(".status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	const iidList = [];
	$(".inbound_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	showLoading("data");

	console.log(iidList)
	$.ajax({
		url: "/inbound_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			loadIncoming_summaryData();
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

});

// 검색 조건 수집
function getSearchCriteria() {
	return {
		inboundCondition: $("#incoming_IS_searchVal_inboundCondition").val(),
		fromDate: $("#incoming_IS_searchVal_indate_from").val(),
		toDate: $("#incoming_IS_searchVal_indate_to").val(),		
		factory: $("#incoming_IS_searchVal_factory").val(),		
		storage: $("#incoming_IS_searchVal_storage").val(),		
		cucode: $("#incoming_IS_searchVal_cucode").val(),
		cname: $("#incoming_IS_searchVal_cname").val(),
		car: $("#incoming_IS_searchVal_car").val(),
		itemCode: $("#incoming_IS_searchVal_itemcode").val(),
		itemName: $("#incoming_IS_searchVal_itemname").val(),
	};

}

// 뷰 렌더링 함수
function renderIncoming_summaryView(data) {
	if (!$("#view_m2_3_2").length) {
		let content_output = `
				<div class="divBlockControl" id="view_m2_3_2">
					<div class="content-body">
						<!-- 검색 영역 -->
						<div class="search-area">
							<div class="search-row m2_3_2">
								<div class="search-label m2_3_2">
									<div class="search_inboundCondition">${i18n.t('search.inbound.status')}<!-- 입고상태 --></div>
									<select id="incoming_IS_searchVal_inboundCondition" >
										<option value="">${i18n.t('search.all')}<!-- 전체 --></option>

										<option value="N">${i18n.t('search.inbound.waiting')}<!-- 입고 대기중 --></option>
										<option value="Y">${i18n.t('search.inbound.completed')}<!-- 입고 완료 --></option>
									</select>
								</div>
								<div class="search-label m2_3_2" style="width: 33%;">
									<div class="search_indate">${i18n.t('search.date')}<!-- FromDATE --></div>
									<input type="date" id="incoming_IS_searchVal_indate_from" class="dateRangeCommon"/>
									<span class="commonWave"> ~ </span>
									<input type="date" id="incoming_IS_searchVal_indate_to" class="dateRangeCommon"/>
								</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="incoming_IS_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="incoming_IS_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
								<div class="search-label m2_3_2">
									<div class="search_cucode">${i18n.t('search.cucode')}<!-- CUCODE --></div>
									<input type="text" id="incoming_IS_searchVal_cucode" />
								</div>
								<div class="search-label m2_3_2">
									<div class="search_cname">${i18n.t('search.cname')}<!-- CNAME --></div>
									<input type="text" id="incoming_IS_searchVal_cname" />
								</div>
								<div class="search-label m2_3_2">
									<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
									<input type="text" id="incoming_IS_searchVal_car" />
								</div>
								<div class="search-label m2_3_2">
									<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEM CODE --></div>
									<input type="text" id="incoming_IS_searchVal_itemcode" />
								</div>
								<div class="search-label m2_3_2">
									<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEM NAME --></div>
									<input type="text" id="incoming_IS_searchVal_itemname" />
								</div>
							</div>
								<div class="search_button_area">
									<button class="btn btn-primary btnInboundSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
									<button class="btn btn-secondary btnInboundSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
								</div>
						</div>
						
						<!-- 탭 -->
						<div class="tab-container">
							<div class="tab">목록</div>
						</div>
						
						<!-- 테이블 -->
						<div class="table-container">
							<div class="action-buttons">
								<button class="btn btn-success">신규 등록</button>
								<button class="btn btn-primary">수정</button>
								<button class="btn btn-secondary">삭제</button>
								<button class="btn btn-secondary">엑셀 다운로드</button>
							</div>
							
							<div class="table-info m2_3_2">
								<span>${i18n.t('table.info.total')} <strong id="inboundTotalCount">${totalIncoming_summaryCount}</strong>${i18n.t('table.info.records')} | 
									${i18n.t('table.page')} <strong id="inboundCurrentPageInfo">${currentIncoming_summaryPage}</strong>/<strong id="inboundTotalPageInfo">${Math.ceil(totalIncoming_summaryCount / incoming_summaryItemsPerPage)}</strong> | 
									${i18n.t('table.info.qty')} : <strong class="incomingListSummaryTotalQty"></strong>
								</span>
								<div class="btnInboundItemsArea">
									<input type="button" value="${i18n.t('btn.inbound.btnIntf')}" class="btn btn-success btnIntfIncoming"/>
									<input type="button" value="${i18n.t('btn.inbound.btnIntf.delete')}" class="btn btn-warning btnIntfIncomingDelete"/>
									<button class="btn btn-success" id="incomingListSummaryExcelBtn" onclick="downloadAllIncomingListSummaryData()">Excel</button>
								</div>
							</div>
							
							<table class="data-table m2_3_2">
								<thead>
									<tr>
										<th>
											<input type="checkbox" class="inbound_chkAll">
										</th>
										<th>${i18n.t('table.no')}<!-- No --></th>
										<th>${i18n.t('table.status')}<!-- STATUS --></th>
										<th>${i18n.t('search.date')}<!-- INDATE --></th>
										<th>${i18n.t('search.factory')}<!-- FACTORY --></th>
										<th>${i18n.t('search.storage')}<!-- STORAGE --></th>
										<th>${i18n.t('search.cucode')}<!-- CUCODE --></th>
										<th>${i18n.t('search.cname')}<!-- CNAME --></th>
										<th>${i18n.t('search.car')}<!-- CAR --></th>
										<th>${i18n.t('search.itemCode')}<!-- ITEM CODE --></th>
										<th>${i18n.t('search.itemName')}<!-- ITEM NAME --></th>
										<th>${i18n.t('search.qty')}<!-- QTY --></th>
										<th>${i18n.t('search.invoiceNo')}<!-- INVOICE NO --></th>
										<th>Ifno<!-- 인터페이스 --></th>
									</tr>
								</thead>
								<tbody id="inboundTableBody">
								</tbody>
							</table>
							
							<!-- 페이지네이션 -->
							<div class="pagination" id="inboundPaginationContainer">
							</div>
						</div>
					</div>
				</div>
			`;
		/*<input type="button" value="${i18n.t('btn.inbound.complete')}" class="btn btn-success btnInboundItems"/>
		<input type="button" value="${i18n.t('btn.inbound.cancel')}" class="btn btn-warning btnInboundItems_cancel"/>
		<button class="btn btn-success" id="inboundExcelBtn" onclick="ExcelExporter.downloadExcel(getCurrentTableData(), inboundColumns, {fileName:'Inbound', sheetName:'Inbound'})">Excel</button>*/

		/* 검색 보류
		<div class="search-label m2_3_2">
									<div class="search_invoice_no">${i18n.t('search.invoiceNo')}<!-- INVOICE<br>NO --></div>
									<input type="text" id="incoming_IS_searchVal_invoice_no" />
								</div>
								<div class="search-label m2_3_2">
									<div class="search_container_no">${i18n.t('search.containerNo')}<!-- CONTAINER<br>NO --></div>
									<input type="text" id="incoming_IS_searchVal_container_no" />
								</div>
			
		*/
		
		

		/*$(".w_contentArea").append(content_output);
		bindIncoming_summaryEvents();
	}

	renderIncoming_summaryTableData(data);
	renderIncoming_summaryPagination();
	
	if (!initFlag) {
		initSettingFromToDate();
		renderFactoryStorage();
		initFlag = true;
	}
}

let initFlag = false;

// 날짜 관련 함수
function initSettingFromToDate() {
	// 날짜 초기값 설정
	const today = new Date();
	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(today.getDate() - 7);

	// 날짜를 YYYY-MM-DD 형식으로 변환
	const todayStr = today.toISOString().split('T')[0];
	const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

	// 값 설정
	$('#incoming_IS_searchVal_indate_from').val(todayStr);
	$('#incoming_IS_searchVal_indate_to').val(todayStr);
}


// 날짜 관련 함수
function fmtLocalDate(d){
	const y = d.getFullYear();
	const m = String(d.getMonth()+1).padStart(2,'0');
	const dd = String(d.getDate()).padStart(2,'0');
	return `${y}-${m}-${dd}`;
}

function getDefaultDateRange(){
	const today = new Date();
	const toDate = fmtLocalDate(today);
	const fromDate = fmtLocalDate(today);
	//let fromdate = $("#incoming_IS_searchVal_indate_from").val();
	//let todate = 	$("#incoming_IS_searchVal_indate_from").val();
	return { fromDate, toDate };
}



// 공장 및 창고 선택 함수
function renderFactoryStorage() {
    const factory = $('#incoming_IS_searchVal_factory');
    const storage = $('#incoming_IS_searchVal_storage');
    const savedFactory = getCookie('selectedFactory');

    // 공장별 창고 옵션 설정
    function updateStorageOptions(factoryValue) {
        storage.empty();
        
        const options = {
            'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'all'],
            'PUEBLA': ['Material', 'PRODUCT', 'all'],
            '': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'all']
        };
        
        const storageList = options[factoryValue] || options[''];
        
        storageList.forEach(item => {
            const text = item === 'all' ? i18n.t('search.all') : item;
            storage.append(`<option value="${item}">${text}</option>`);
        });
        
        // 첫 번째 옵션 선택 (Material)
        storage.val(storageList[0]);
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

// 테이블 데이터 렌더링
function renderIncoming_summaryTableData(data) {
	let tableBody = "";
	let startIndex = (currentIncoming_summaryPage - 1) * incoming_summaryItemsPerPage;

	for (let i = 0; i < data.length; i++) {
		let rowNumber = startIndex + i + 1;
		let statusText = data[i].INTF_YN === 'Y' ? 'Completed' : 'Waiting';
		let statusClass = data[i].INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';

		tableBody += `
				<tr>
					<td><input type="checkbox" class="inbound_chk ${statusClass}" data-iid="${data[i].MAX_IID}" data-unique="${data[i].INDATE || ''}_${data[i].ITEMCODE || ''}_${data[i].CUSTCODE || ''}_${data[i].QTY || ''}_${data[i].FACTORY || ''}_${data[i].STORAGE || ''}" ${!data[i].CUSTCODE ? 'disabled' : ''}></td>
					<td>${rowNumber}</td>
					<td><span class="${statusClass}">${statusText}</span></td>
					<td>${data[i].INDATE || ''}</td>
					<td>${data[i].FACTORY || ''}</td>
					<td>${data[i].STORAGE || ''}</td>
					<td>${data[i].CUSTCODE || ''}</td>
					<td>${data[i].CNAME || ''}</td>
					<td>${data[i].CAR || ''}</td>
					<td>${data[i].ITEMCODE || ''}</td>
					<td>${data[i].ITEMNAME || ''}</td>
					<td>${data[i].QTY || ''}</td>
					<td>${data[i].INVOICE_NO || ''}</td>
					<td>${data[i].IFNO || ''}</td>
				</tr>
			`;
	}


	$("#inboundTableBody").html(tableBody);
	$("#inboundTotalCount").text(totalIncoming_summaryCount);
	$("#inboundCurrentPageInfo").text(currentIncoming_summaryPage);
	$("#inboundTotalPageInfo").text(Math.ceil(totalIncoming_summaryCount / incoming_summaryItemsPerPage));
	//$(".status-completed").prop("disabled", true);
}

// 페이지네이션 렌더링
function renderIncoming_summaryPagination() {
	let totalPages = Math.ceil(totalIncoming_summaryCount / incoming_summaryItemsPerPage);
	let paginationHtml = "";

	if (currentIncoming_summaryPage > 1) {
		paginationHtml += `<button class="incoming_summary-page-btn" data-page="${currentIncoming_summaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="incoming_summary-page-btn disabled">&lt;</button>`;
	}

	let startPage = Math.max(1, currentIncoming_summaryPage - 5);
	let endPage = Math.min(totalPages, currentIncoming_summaryPage + 5);

	if (startPage > 1) {
		paginationHtml += `<button class="incoming_summary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	for (let i = startPage; i <= endPage; i++) {
		if (i === currentIncoming_summaryPage) {
			paginationHtml += `<button class="incoming_summary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="incoming_summary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="incoming_summary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	if (currentIncoming_summaryPage < totalPages) {
		paginationHtml += `<button class="incoming_summary-page-btn" data-page="${currentIncoming_summaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="incoming_summary-page-btn disabled">&gt;</button>`;
	}

	$("#inboundPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindIncoming_summaryEvents() {
	// 검색 버튼
	$(".btnInboundSearch").off('click').on('click', function() {
		showLoading("task");
		currentIncoming_summaryPage = 1;
		loadIncoming_summaryData();
	});

	// 초기화 버튼
	$(".btnInboundSearchInit").off('click').on('click', function() {
		showLoading("data");
		
		const factory = getCookie('selectedFactory');
		
		$("#incoming_IS_searchVal_inboundCondition").val('');
		$("#incoming_IS_searchVal_indate_from").val('');
		$("#incoming_IS_searchVal_indate_to").val('');
		$("#incoming_IS_searchVal_factory").val(factory);
		$("#incoming_IS_searchVal_storage").val('Material');
		$("#incoming_IS_searchVal_cucode").val('');
		$("#incoming_IS_searchVal_cname").val('');
		$("#incoming_IS_searchVal_car").val('');
		$("#incoming_IS_searchVal_itemcode").val('');
		$("#incoming_IS_searchVal_itemname").val('');
		currentIncoming_summaryPage = 1;
		loadIncoming_summaryData();
		initSettingFromToDate();
		renderFactoryStorage();
	});

	// 페이지네이션 버튼
	$(document).off('click', '.incoming_summary-page-btn').on('click', '.incoming_summary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				showLoading("data");
				currentIncoming_summaryPage = page;
				loadIncoming_summaryData();
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_3_2 input[type="text"], #view_m2_3_2 input[type="date"], #view_m2_3_2 select').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			currentIncoming_summaryPage = 1;
			loadIncoming_summaryData();
		}
	});

	// 전체 선택 체크박스
	$(document).off('change', '.inbound_chkAll').on('change', '.inbound_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.inbound_chk').each(function() {
	        if (!$(this).is(':disabled')) {   // disabled가 아닌 경우만 체크
	            $(this).prop('checked', isChecked);
	        }
	    });
	});

	// 개별 체크박스
	$(document).off('change', '.inbound_chk').on('change', '.inbound_chk', function() {
		let totalCheckboxes = $('.inbound_chk').length;
		let checkedCheckboxes = $('.inbound_chk:checked').length;
		$('.inbound_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});

	// 입고 완료 버튼
	$(".btnInboundItems").off('click').on('click', function() {
		let checkedItems = $('.inbound_chk:checked');
		if (checkedItems.length === 0) {
			alert('입고 완료 처리할 항목을 선택해주세요.');
			return;
		}

		let iidList = [];
		checkedItems.each(function() {
			iidList.push($(this).data('iid'));
		});

		processInboundComplete(iidList);
	});

	// 입고 취소 버튼
	$(".btnInboundItems_cancel").off('click').on('click', function() {
		let checkedItems = $('.inbound_chk:checked');
		if (checkedItems.length === 0) {
			alert('입고 취소할 항목을 선택해주세요.');
			return;
		}

		let iidList = [];
		checkedItems.each(function() {
			iidList.push($(this).data('iid'));
		});

		processInboundCancel(iidList);
	});
}

// 입고 완료 처리 함수
function processInboundComplete(iidList) {
	if (!confirm('선택한 항목을 입고 완료 처리하시겠습니까?')) {
		return;
	}

	showLoading("processing");

	$.ajax({
		url: "/workMoveRelease",
		type: "POST",
		data: JSON.stringify({ iidList: iidList }),
		contentType: "application/json",
		success: function(response) {
			alert('입고 완료 처리되었습니다.');
			loadIncoming_summaryData();
			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("입고 완료 처리 실패:", error);
			alert('입고 완료 처리 중 오류가 발생했습니다.');
			hideLoading();
		}
	});
}

// 입고 취소 함수
function processInboundCancel(iidList) {
	if (!confirm('선택한 항목의 입고를 취소하시겠습니까?')) {
		return;
	}

	showLoading("task");

	$.ajax({
		url: "/workMoveCancel",
		type: "POST",
		data: JSON.stringify({ iidList: iidList }),
		contentType: "application/json",
		success: function(response) {
			alert('입고 취소가 완료되었습니다.');
			loadIncoming_summaryData();
			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("입고 취소 실패:", error);
			alert('입고 취소 중 오류가 발생했습니다.');
			hideLoading();
		}
	});
}

// 엑셀 다운로드
window.downloadAllIncomingListSummaryData = function() {
	let searchCriteria = {
		confirm_yn : $("#incoming_IS_searchVal_inboundCondition").val(),
		fromDate : $("#incoming_IS_searchVal_indate_from").val(),
		toDate : $("#incoming_IS_searchVal_indate_to").val(),
		factory : $("#incoming_IS_searchVal_factory").val(),
		storage : $("#incoming_IS_searchVal_storage").val(),
		cucode : $("#incoming_IS_searchVal_cucode").val().trim(),
		cuname : $("#incoming_IS_searchVal_cname").val().trim(),
		car : $("#incoming_IS_searchVal_car").val().trim(),
		itemcode : $("#incoming_IS_searchVal_itemcode").val().trim(),
		itemname: $("#incoming_IS_searchVal_itemname").val().trim()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_incomingListSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.inboundColumns, {
				fileName: 'IncomingListSummary_All',
				sheetName: 'IncomingListSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};
*/
