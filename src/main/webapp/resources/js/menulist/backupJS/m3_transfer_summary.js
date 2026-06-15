/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m3_transfer_summary 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : transferSummary -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : TransferSummary -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */
/*let globalTransferSummaryData = []; // 현재 조회된 데이터 저장
let currentTransferSummaryPage = 1; // 현재 페이지
let transferSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalTransferSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalTransferSummaryQty = 0; // 서버에서 받은 총 개수 저장
let totalTransferSummaryPages = 0; // 서버에서 받은 총 페이지

$(document).ready(function() {

	window.filteredTransferSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.transferSummaryColumns = [
		{ key: 'SDATE', header: 'sdate' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m3_transfer_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위로 조회
		performTransferSummaryDBSearch({ fromDate, toDate, factory });
	}
});

// DB에서 데이터 조회하는 함수
function performTransferSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_transferSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentTransferSummaryPage,
			itemsPerPage: transferSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalTransferSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalTransferSummaryCount = data.totalCount || 0;
			totalTransferSummaryQty = data.totalQty || 0;
			totalTransferSummaryPages = data.totalPages || 0;
			currentTransferSummaryPage = data.currentPage || 0;
			window.filteredTransferSummaryData = globalTransferSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m3_transfer_summary').length) {
				renderTransferSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderTransferSummaryTableData();
				renderTransferSummaryPagination();
				updateTransferSummaryTotalCount();
				updateTransferSummaryTotalQty();
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
function renderTransferSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_m3_transfer_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<!-- <div class="search-label m3_transfer_summary">
								<div class="search_transferCondition">${i18n.t('search.input.status')}불출상태 </div>
								<select id="transferSummary_searchVal_condition" >
									<option value="">${i18n.t('search.all')} 전체 </option>
									<option value="N">${i18n.t('search.input.waiting')} 불출 대기중 </option>
									<option value="Y">${i18n.t('search.input.completed')} 불출 완료 </option>
								</select>
							</div>-->
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="transferSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="transferSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="transferSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="transferSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="transferSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="transferSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnTransferSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnTransferSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="transferSummaryTotalCount">${totalTransferSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="transferSummaryCurrentPageInfo">${currentTransferSummaryPage}</strong>/<strong id="transferSummaryTotalPageInfo">${totalTransferSummaryPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "transferSummaryTotalQty"></strong>
							</span>
							<div class="action-buttons-right m3_transfer_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="transferSummaryExcelBtn" onclick="downloadAllTransferSummaryData()">Excel</button>
								</div>
							</div>
							<!--<div class="btnInterfaceCommon btnTransferSummaryItemsArea" style="margin-left:24px;">
								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfTransferSummary"/>
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfTransferSummaryDelete"/>
							</div>-->
						</div>
						<table class="data-table m3_transfer_summary">
							<thead>
								<tr>
									<!--<th class = "checkboxVal">
										<input type="checkbox" class="transferSummary_chkAll">
									</th> -->
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<!--<th class = "statusVal">${i18n.t('table.status')} STATUS</th> -->
									<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="transferSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="transferSummaryPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
	// = 위에 data-table, search-row i18n 부분 추가
	/*<button class="btn btn-success" id="transferSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredTransferSummaryData, transferSummaryColumns, {fileName:'TransferSummary', sheetName:'TransferSummary'})">Excel</button>*/
	/*$(".w_contentArea").append(content_output);

	// ⬇️ 추가: 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#transferSummary_searchVal_fromDate").val(fromDate);
		$("#transferSummary_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderTransferSummaryTableData();
	// 페이지네이션 렌더링
	renderTransferSummaryPagination();
	// 이벤트 바인딩
	bindTransferSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateTransferSummaryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateTransferSummaryTotalQty();

}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#transferSummary_searchVal_factory');
	const savedFactory = getCookie('selectedFactory');

	// 저장된 공장 선택
	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
		factory.val(savedFactory);
	}
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}

// 총 개수를 업데이트하는 함수
function updateTransferSummaryTotalCount() {
	$('#transferSummaryTotalCount').text(totalTransferSummaryCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateTransferSummaryTotalQty() {
	$('#transferSummaryTotalQty').text(totalTransferSummaryQty.toLocaleString());
}
function renderTransferSummaryTableData() {
	let tableBody = "";

	//console.log("globalTransferSummaryData:", globalTransferSummaryData);
	//console.log("데이터 개수:", globalTransferSummaryData.length);
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalTransferSummaryData.length; i++) {
		let rowNumber = (currentTransferSummaryPage - 1) * transferSummaryItemsPerPage + i + 1;
		let statusText = globalTransferSummaryData[i].intf_yn === 'Y' ? 'Completed' : 'Waiting';
		let statusClass = globalTransferSummaryData[i].intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
		let un = globalTransferSummaryData[i];

		//console.log(`행 ${i}:`, globalTransferSummaryData[i]); // 각 행 데이터 확인

		tableBody += `
	            <tr>
	            	<!--<td class = "checkboxVal"><input type="checkbox" class="transferSummary_chk ${statusClass}" 
	            		data-unique="${un.sdate}_${un.itemcode}_${un.intf_yn}_${un.qty}"></td> -->
	                <td class = "noVal">${rowNumber}</td>
	                <!--<td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>-->
	                <td class = "dateVal">${globalTransferSummaryData[i].SDATE || globalTransferSummaryData[i].sdate || ''}</td>
					<td class = "carVal">${globalTransferSummaryData[i].CAR || globalTransferSummaryData[i].car || ''}</td>
					<td class = "itemcodeVal">${globalTransferSummaryData[i].ITEMCODE || globalTransferSummaryData[i].itemcode || ''}</td>
					<td class = "itemnameVal">${globalTransferSummaryData[i].ITEMNAME || globalTransferSummaryData[i].itemname || ''}</td>
					<td class = "qtyVal">${Number(globalTransferSummaryData[i].QTY || globalTransferSummaryData[i].qty || 0).toLocaleString()}</td>
	            </tr>
	        `;
	}
	// =
	//console.log("생성된 tableBody:", tableBody);
	$("#transferSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderTransferSummaryPagination() {
	let totalPages = Math.ceil(totalTransferSummaryCount / transferSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentTransferSummaryPage > 1) {
		paginationHtml += `<button class="transferSummary-page-btn" data-page="${currentTransferSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="transferSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentTransferSummaryPage - 5);
	let endPage = Math.min(totalPages, currentTransferSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="transferSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentTransferSummaryPage) {
			paginationHtml += `<button class="transferSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="transferSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="transferSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentTransferSummaryPage < totalPages) {
		paginationHtml += `<button class="transferSummary-page-btn" data-page="${currentTransferSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="transferSummary-page-btn disabled">&gt;</button>`;
	}

	$('#transferSummaryCurrentPageInfo').text(currentTransferSummaryPage);
	$('#transferSummaryTotalPageInfo').text(totalPages);
	$("#transferSummaryCurrentPageInfo").text(currentTransferSummaryPage);
	$("#transferSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindTransferSummaryEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.transferSummary_chkAll').on('change', '.transferSummary_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.transferSummary_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.transferSummary_chk').on('change', '.transferSummary_chk', function() {
		let totalCheckboxes = $('.transferSummary_chk').length;
		let checkedCheckboxes = $('.transferSummary_chk:checked').length;
		$('.transferSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnTransferSummarySearch").off('click').on('click', function() {
		performTransferSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnTransferSummarySearchInit").off('click').on('click', function() {
		resetTransferSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.transferSummary-page-btn').on('click', '.transferSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentTransferSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performTransferSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m3_transfer_summary input[type="text"], #view_m3_transfer_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performTransferSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		/*intf_yn: $("#transferSummary_searchVal_condition").val(),*/
		/*fromDate: $("#transferSummary_searchVal_fromDate").val(),
		toDate: $("#transferSummary_searchVal_toDate").val(),
		factory: $("#transferSummary_searchVal_factory").val(),
		car: $("#transferSummary_searchVal_car").val().trim(),
		itemcode: $("#transferSummary_searchVal_itemcode").val().trim(),
		itemname: $("#transferSummary_searchVal_itemname").val().trim()
	};
}
// =
// 검색 수행 함수 - DB 조회
function performTransferSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentTransferSummaryPage = 1;
	performTransferSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetTransferSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const factory = getCookie('selectedFactory');

	/*$("#transferSummary_searchVal_condition").val("");*/
	/*$("#transferSummary_searchVal_fromDate").val(fromDate);
	$("#transferSummary_searchVal_toDate").val(toDate);
	$("#transferSummary_searchVal_factory").val(factory);
	$("#transferSummary_searchVal_car").val('');
	$("#transferSummary_searchVal_itemcode").val('');
	$("#transferSummary_searchVal_itemname").val('');
	// =
	// 초기화 후 전체 데이터 다시 조회
	currentTransferSummaryPage = 1;
	performTransferSummaryDBSearch({ fromDate, toDate });

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
window.changeTransferSummaryItemsPerPage = function(newItemsPerPage) {
	transferSummaryItemsPerPage = newItemsPerPage;
	currentTransferSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performTransferSummaryDBSearch(searchCriteria);
}

window.exportTransferSummaryData = function() {
	return {
		total: globalTransferSummaryData.length,
		currentPage: currentTransferSummaryPage,
		itemsPerPage: transferSummaryItemsPerPage,
		data: globalTransferSummaryData
	};
}

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
	return { fromDate, toDate };
}


window.downloadAllTransferSummaryData = function() {
	let searchCriteria = {
		/*intf_yn: $("#transferSummary_searchVal_condition").val(),*/
		/*fromDate: $("#transferSummary_searchVal_fromDate").val(),
		toDate: $("#transferSummary_searchVal_toDate").val(),
		factory: $("#transferSummary_searchVal_factory").val(),
		car: $("#transferSummary_searchVal_car").val().trim(),
		itemcode: $("#transferSummary_searchVal_itemcode").val().trim(),
		itemname: $("#transferSummary_searchVal_itemname").val().trim()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_transferSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.transferSummaryColumns, {
				fileName: 'TransferSummary_All',
				sheetName: 'TransferSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

$(document).on("click", ".btnIntfTransferSummary", function() {

	if ($(".status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	const iidList = [];
	$(".transferSummary_chk:checked").each(function() {
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
		url: "/transferSummary_confirm_summary",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performTransferSummaryDBSearch(searchVal);
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

$(document).on("click", ".btnIntfTransferSummaryDelete", function() {

	if ($(".status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}


	const iidList = [];
	$(".transferSummary_chk:checked").each(function() {
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
		url: "/transferSummary_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performTransferSummaryDBSearch(searchVal);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

});*/

