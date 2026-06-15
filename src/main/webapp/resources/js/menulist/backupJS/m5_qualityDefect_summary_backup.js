/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m5_qualityDefect_summary 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : qualityDefectSummary -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : QualityDefectSummary -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

/*let globalQualityDefectSummaryData = []; // 현재 조회된 데이터 저장
let currentQualityDefectSummaryPage = 1; // 현재 페이지
let qualityDefectSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalQualityDefectSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalQualityDefectSummaryQty = 0; // 서버에서 받은 총 개수 저장
let totalQualityDefectSummaryPages = 0; // 서버에서 받은 총 페이지
window.filteredQualityDefectSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
window.qualityDefectSummaryColumns = [
	{ key: 'SDATE', header: 'date' },
	{ key: 'FACTORY', header: 'factory' },
	{ key: 'CAR', header: 'car' },
	{ key: 'ITEMCODE', header: 'itemcode' },
	{ key: 'ITEMNAME', header: 'itemname' },
	{ key: 'QTY', header: 'qty' },
];

$(document).ready(function() {
	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m5_qualityDefect_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위로 조회
		performQualityDefectSummaryDBSearch({ fromDate, toDate, factory });
	}
});

// DB에서 데이터 조회하는 함수
function performQualityDefectSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_qualityDefectSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentQualityDefectSummaryPage,
			itemsPerPage: qualityDefectSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalQualityDefectSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalQualityDefectSummaryCount = data.totalCount || 0;
			totalQualityDefectSummaryQty = data.totalQty || 0;
			totalQualityDefectSummaryPages = data.totalPages || 0;
			currentQualityDefectSummaryPage = data.currentPage || 0;
			window.filteredQualityDefectSummaryData = globalQualityDefectSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m5_qualityDefect_summary').length) {
				renderQualityDefectSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderQualityDefectSummaryTableData();
				renderQualityDefectSummaryPagination();
				updateQualityDefectSummaryTotalCount();
				updateQualityDefectSummaryTotalQty();
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
function renderQualityDefectSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_m5_qualityDefect_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<!-- <div class="search-label m5_qualityDefect_summary">
								<div class="search_semiProductionCondition">${i18n.t('search.input.status')}</div>
								<select id="qualityDefectSummary_searchVal_Condition" >
									<option value="">${i18n.t('search.all')}</option>
									<option value="N">${i18n.t('search.input.waiting')}</option>
									<option value="Y">${i18n.t('search.input.completed')}</option>
								</select>
							</div> -->
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="qualityDefectSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="qualityDefectSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="qualityDefectSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="qualityDefectSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="qualityDefectSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="qualityDefectSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnQualityDefectSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary QualityDefectSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="qualityDefectSummaryTotalCount">${totalQualityDefectSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="qualityDefectSummaryCurrentPageInfo">${currentQualityDefectSummaryPage}</strong>/<strong id="qualityDefectSummaryTotalPageInfo">${totalQualityDefectSummaryPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "qualityDefectSummaryTotalQty"></strong>
							</span>
							<div class="action-buttons-right m5_qualityDefect_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="qualityDefectSummaryExcelBtn" onclick="downloadAllQualityDefectSummaryData()">Excel</button>
								</div>
							</div> <!--
							<div class="btnInterfaceCommon btnSemiProductionItemsArea" style="margin-left:24px;">
								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfSemiProduction"/>
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfSemiProductionDelete"/>
							</div> -->
						</div>
						<table class="data-table m5_qualityDefect_summary">
							<thead>
								<tr>
									<!-- <th class = "checkboxVal">
										<input type="checkbox" class="semiProduction_chkAll">
									</th> --> 
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<!-- <th class = "statusVal">${i18n.t('table.status')}</th> -->
									<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="qualityDefectSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="qualityDefectSummaryPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
									/*<th>${i18n.t('table.time')}<!-- TIME --></th>*/
	// = 위에 data-table, search-row i18n 부분 추가
	/*<button class="btn btn-success" id="qualityDefectSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredQualityDefectSummaryData, qualityDefectSummaryColumns, {fileName:'QualityDefectSummary', sheetName:'QualityDefectSummary'})">Excel</button>*/
	/*$(".w_contentArea").append(content_output);

	// ⬇️ 추가: 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#qualityDefectSummary_searchVal_fromDate").val(fromDate);
		$("#qualityDefectSummary_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderQualityDefectSummaryTableData();
	// 페이지네이션 렌더링
	renderQualityDefectSummaryPagination();
	// 이벤트 바인딩
	bindQualityDefectSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateQualityDefectSummaryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateQualityDefectSummaryTotalQty();

}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#qualityDefectSummary_searchVal_factory');
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
function updateQualityDefectSummaryTotalCount() {
	$('#qualityDefectSummaryTotalCount').text(totalQualityDefectSummaryCount);
}
// 총 개수를 업데이트하는 함수
function updateQualityDefectSummaryTotalQty() {
	$('#qualityDefectSummaryTotalQty').text(totalQualityDefectSummaryQty.toLocaleString());
}
function renderQualityDefectSummaryTableData() {
	let tableBody = "";

	//console.log("globalQualityDefectSummaryData:", globalQualityDefectSummaryData);
	//console.log("데이터 개수:", globalQualityDefectSummaryData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalQualityDefectSummaryData.length; i++) {
		let rowNumber = (currentQualityDefectSummaryPage - 1) * qualityDefectSummaryItemsPerPage + i + 1;
		let statusText = globalQualityDefectSummaryData[i].intf_yn === 'Y' ? 'Completed' : 'Waiting';
		let statusClass = globalQualityDefectSummaryData[i].intf_yn === 'Y' ? 'status-completed' : 'status-waiting';

		//console.log(`행 ${i}:`, globalQualityDefectSummaryData[i]); // 각 행 데이터 확인

		tableBody += `
            <tr>
            	<!-- <td class = "checkboxVal"><input type="checkbox" class="semiProduction_chk ${statusClass}" 
            		data-unique="${globalQualityDefectSummaryData[i].sdate}_${globalQualityDefectSummaryData[i].itemcode}_${globalQualityDefectSummaryData[i].intf_yn}_${globalQualityDefectSummaryData[i].qty}_${globalQualityDefectSummaryData[i].lineno}_${globalQualityDefectSummaryData[i].factory}"></td> -->
                <td class = "noVal">${rowNumber}</td>
                <!-- <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td> -->
                <td class = "dateVal">${globalQualityDefectSummaryData[i].SDATE || globalQualityDefectSummaryData[i].sdate || ''}</td>
				<td class = "factoryVal">${globalQualityDefectSummaryData[i].FACTORY || globalQualityDefectSummaryData[i].factory || ''}</td>
				<td class = "carVal">${globalQualityDefectSummaryData[i].CAR || globalQualityDefectSummaryData[i].car || ''}</td>
				<td class = "itemcodeVal">${globalQualityDefectSummaryData[i].ITEMCODE || globalQualityDefectSummaryData[i].itemcode || ''}</td>
				<td class = "itemnameMedVal">${globalQualityDefectSummaryData[i].ITEMNAME || globalQualityDefectSummaryData[i].itemname || ''}</td>
				<td class = "qtyVal">${Number(globalQualityDefectSummaryData[i].QTY || globalQualityDefectSummaryData[i].qty || 0).toLocaleString()}</td>
            </tr>
        `;
	}
	// =
	//console.log("생성된 tableBody:", tableBody);
	$("#qualityDefectSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderQualityDefectSummaryPagination() {
	let totalPages = Math.ceil(totalQualityDefectSummaryCount / qualityDefectSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentQualityDefectSummaryPage > 1) {
		paginationHtml += `<button class="qualityDefectSummary-page-btn" data-page="${currentQualityDefectSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="qualityDefectSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentQualityDefectSummaryPage - 5);
	let endPage = Math.min(totalPages, currentQualityDefectSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="qualityDefectSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentQualityDefectSummaryPage) {
			paginationHtml += `<button class="qualityDefectSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="qualityDefectSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="qualityDefectSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentQualityDefectSummaryPage < totalPages) {
		paginationHtml += `<button class="qualityDefectSummary-page-btn" data-page="${currentQualityDefectSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="qualityDefectSummary-page-btn disabled">&gt;</button>`;
	}

	$('#qualityDefectSummaryTotalPageInfo').text(totalPages);
	$("#qualityDefectSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindQualityDefectSummaryEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.semiProduction_chkAll').on('change', '.semiProduction_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.semiProduction_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.semiProduction_chk').on('change', '.semiProduction_chk', function() {
		let totalCheckboxes = $('.semiProduction_chk').length;
		let checkedCheckboxes = $('.semiProduction_chk:checked').length;
		$('.semiProduction_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});

	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnQualityDefectSummarySearch").off('click').on('click', function() {
		performQualityDefectSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnQualityDefectSummarySearchInit").off('click').on('click', function() {
		resetQualityDefectSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.qualityDefectSummary-page-btn').on('click', '.qualityDefectSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentQualityDefectSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performQualityDefectSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m5_qualityDefect_summary input[type="text"], #view_m5_qualityDefect_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performQualityDefectSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		intf_yn: $("#qualityDefectSummary_searchVal_Condition").val(),
		fromDate: $("#qualityDefectSummary_searchVal_fromDate").val(),
		toDate: $("#qualityDefectSummary_searchVal_toDate").val(),
		factory: $("#qualityDefectSummary_searchVal_factory").val(),
		car: $("#qualityDefectSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#qualityDefectSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#qualityDefectSummary_searchVal_itemname").val().trim().toUpperCase()
	};
}
// =
// 검색 수행 함수 - DB 조회
function performQualityDefectSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentQualityDefectSummaryPage = 1;
	performQualityDefectSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetQualityDefectSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const factory = getCookie('selectedFactory');

	$("#qualityDefectSummary_searchVal_Condition").val('');
	$("#qualityDefectSummary_searchVal_fromDate").val(fromDate);
	$("#qualityDefectSummary_searchVal_toDate").val(toDate);
	$("#qualityDefectSummary_searchVal_factory").val(factory);
	$("#qualityDefectSummary_searchVal_car").val('');
	$("#qualityDefectSummary_searchVal_itemcode").val('');
	$("#qualityDefectSummary_searchVal_itemname").val('');
	// =
	// 초기화 후 전체 데이터 다시 조회
	currentQualityDefectSummaryPage = 1;
	performQualityDefectSummaryDBSearch({ fromDate, toDate });

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
window.changeQualityDefectSummaryItemsPerPage = function(newItemsPerPage) {
	qualityDefectSummaryItemsPerPage = newItemsPerPage;
	currentQualityDefectSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performQualityDefectSummaryDBSearch(searchCriteria);
}

window.exportQualityDefectSummaryData = function() {
	return {
		total: globalQualityDefectSummaryData.length,
		currentPage: currentQualityDefectSummaryPage,
		itemsPerPage: qualityDefectSummaryItemsPerPage,
		data: globalQualityDefectSummaryData
	};
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
window.downloadAllQualityDefectSummaryData = function() {
	let searchCriteria = {
		intf_yn: $("#qualityDefectSummary_searchVal_Condition").val(),
		fromDate: $("#qualityDefectSummary_searchVal_fromDate").val(),
		toDate: $("#qualityDefectSummary_searchVal_toDate").val(),
		factory: $("#qualityDefectSummary_searchVal_factory").val(),
		car: $("#qualityDefectSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#qualityDefectSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#qualityDefectSummary_searchVal_itemname").val().trim().toUpperCase()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_qualityDefectSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.qualityDefectSummaryColumns, {
				fileName: 'QualityDefectSummary_All',
				sheetName: 'QualityDefectSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

$(document).on("click", ".btnIntfDefective", function() {

	if ($(".status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	const iidList = [];
	$(".semiProduction_chk:checked").each(function() {
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
		url: "/semiProduction_confirm_summary",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performQualityDefectSummaryDBSearch(searchVal);
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

$(document).on("click", ".btnIntfDefectiveDelete", function() {

	if ($(".status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}


	const iidList = [];
	$(".semiProduction_chk:checked").each(function() {
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
		url: "/semiProduction_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performQualityDefectSummaryDBSearch(searchVal);
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

