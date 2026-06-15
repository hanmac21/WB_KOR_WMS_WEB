///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m3_semiProduction_summary 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : semiProductionSummary -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : SemiProductionSummary -> NewMenuName
// * 4. 표시된 오류 및 = 부분 수정
// * 5. AJAX 호출명 따라 백단 코드 생성
// * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
// * 
// * 백단 참고사항
// * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
// * 
// * 아래 Document Ready 부터 복 붙
// * -------------------------------------------------------------- */
//let globalSemiProductionSummaryData = []; // 현재 조회된 데이터 저장
//let currentSemiProductionSummaryPage = 1; // 현재 페이지
//let semiProductionSummaryItemsPerPage = 1000; // 페이지당 항목 수
//let totalSemiProductionSummaryCount = 0; // 서버에서 받은 총 개수 저장
//let totalSemiProductionSummaryQty = 0; // 서버에서 받은 총 개수 저장
//let totalSemiProductionSummaryPages = 0; // 서버에서 받은 총 페이지
//window.filteredSemiProductionSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.semiProductionSummaryColumns = [
//	{ key: 'SDATE', header: 'sdate' },
//	{ key: 'FACTORY', header: 'factory' },
//	{ key: 'CAR', header: 'car' },
//	{ key: 'ITEMCODE', header: 'itemcode' },
//	{ key: 'ITEMNAME', header: 'itemname' },
//	{ key: 'OKQTY', header: 'okqty' },
//	{ key: 'NGQTY', header: 'ngqty' },
//];
//
//$(document).ready(function() {
//
//
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m3_semiProduction_summary = function(menuId) {
//		showLoading("data");
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위로 조회
//		performSemiProductionSummaryDBSearch({ fromDate, toDate, factory });
//	}
//
//
//});
//// DB에서 데이터 조회하는 함수
//function performSemiProductionSummaryDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_semiProductionSummary",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentSemiProductionSummaryPage,
//			itemsPerPage: semiProductionSummaryItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalSemiProductionSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalSemiProductionSummaryCount = data.totalCount || 0;
//			totalSemiProductionSummaryQty = data.totalQty || 0;
//			totalSemiProductionSummaryPages = data.totalPages || 0;
//			currentSemiProductionSummaryPage = data.currentPage || 0;
//			window.filteredSemiProductionSummaryData = globalSemiProductionSummaryData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m3_semiProduction_summary').length) {
//				renderSemiProductionSummaryView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderSemiProductionSummaryTableData();
//				renderSemiProductionSummaryPagination();
//				updateSemiProductionSummaryTotalCount();
//				updateSemiProductionSummaryTotalQty();
//			}
//
//			hideLoading();
//		},
//		error: function(xhr, status, error) {
//			console.error("DB 조회 실패:", error);
//			hideLoading();
//			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
//		}
//	});
//}
//
//// 사용자 뷰 렌더링 함수
//function renderSemiProductionSummaryView() {
//	let content_output = `
//			<div class="divBlockControl" id="view_m3_semiProduction_summary">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<!--<div class="search-label m3_semiProduction_summary">
//								<div class="search_semiProductionCondition">${i18n.t('search.input.status')} 불출상태</div>
//								<select id="semiProductionSummary_searchVal_Condition" >
//									<option value="">${i18n.t('search.all')}전체 </option>
//									<option value="N">${i18n.t('search.input.waiting')} 불출 대기중 </option>
//									<option value="Y">${i18n.t('search.input.completed')} 불출 완료 </option>
//								</select>
//							</div> -->
//							<div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//								<input type="date" id="semiProductionSummary_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="semiProductionSummary_searchVal_toDate" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//								<select id="semiProductionSummary_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="semiProductionSummary_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="semiProductionSummary_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="semiProductionSummary_searchVal_itemname" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('table.lineno')}<!-- LINE NO --></div>
//								<input type="text" id="semiProductionSummary_searchVal_lineno" />
//							</div>
//						</div>
//							<div class="search_button_area">
//								<button class="btn btn-primary btnSemiProductionSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//								<button class="btn btn-secondary btnSemiProductionSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
//							</div>
//					</div>
//					
//					<!-- 탭 -->
//					<div class="tab-container">
//						<div class="tab">목록</div>
//					</div>
//					
//					<!-- 테이블 -->
//					<div class="table-container">
//						<div class="action-buttons">
//							<button class="btn btn-secondary">엑셀 다운로드</button>
//						</div> 
//						
//						<div class="table-info">
//							<span>${i18n.t('table.info.total')} <strong id="semiProductionSummaryTotalCount">${totalSemiProductionSummaryCount}</strong> ${i18n.t('table.info.records')} | 
//								${i18n.t('table.page')} <strong id="semiProductionSummaryCurrentPageInfo">${currentSemiProductionSummaryPage}</strong>/<strong id="semiProductionSummaryTotalPageInfo">${totalSemiProductionSummaryPages}</strong> | 
//								${i18n.t('table.info.qty')} : <strong id = "semiProductionSummaryTotalQty"></strong>
//							</span>
//							<div class="action-buttons-right m3_semiProduction_summary">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="semiProductionSummaryExcelBtn" onclick="downloadAllSemiProductionSummaryData()">Excel</button>
//								</div>
//							</div>
//							<!--<div class="btnInterfaceCommon btnSemiProductionItemsArea" style="margin-left:24px;">
//								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfSemiProduction"/>
//								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfSemiProductionDelete"/>
//							</div>-->
//						</div>
//						<table class="data-table m3_semiProduction_summary">
//							<thead>
//								<tr>
//									<!-- <th class = "checkboxVal">
//										<input type="checkbox" class="semiProduction_chkAll">
//									</th> -->
//									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//									<!-- <th class = "statusVal">${i18n.t('table.status')}STATUS </th>-->
//									<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
//									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//									<!--<th class = "linenoVal">${i18n.t('table.lineno')} LINE NO </th>-->
//									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									<th class = "qtyVal">${i18n.t('search.okqty')}<!-- QTY --></th>
//									<th class = "qtyVal">${i18n.t('search.ngqty')}<!-- QTY --></th>
//								</tr>
//							</thead>
//							<tbody id="semiProductionSummaryTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="semiProductionSummaryPaginationContainer">
//						</div>
//					</div>
//				</div>
//			</div>
//		`;
//									/*<th>${i18n.t('table.time')}<!-- TIME --></th>*/
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="semiProductionSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredSemiProductionSummaryData, semiProductionSummaryColumns, {fileName:'SemiProductionSummary', sheetName:'SemiProductionSummary'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#semiProductionSummary_searchVal_fromDate").val(fromDate);
//		$("#semiProductionSummary_searchVal_toDate").val(toDate);
//	})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderSemiProductionSummaryTableData();
//	// 페이지네이션 렌더링
//	renderSemiProductionSummaryPagination();
//	// 이벤트 바인딩
//	bindSemiProductionSummaryEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateSemiProductionSummaryTotalCount();
//	// 초기 렌더링 후 수량 업데이트
//	updateSemiProductionSummaryTotalQty();
//
//}
//
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//	const factory = $('#semiProductionSummary_searchVal_factory');
//	const savedFactory = getCookie('selectedFactory');
//
//	// 저장된 공장 선택
//	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
//		factory.val(savedFactory);
//	}
//}
//
//// 정규식으로 쿠기 가져오기
//function getCookie(cookieName) {
//	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//	return match ? decodeURIComponent(match[2]) : '';
//}
//
//// 총 개수를 업데이트하는 함수
//function updateSemiProductionSummaryTotalCount() {
//	$('#semiProductionSummaryTotalCount').text(totalSemiProductionSummaryCount);
//}
//// 총 개수를 업데이트하는 함수
//function updateSemiProductionSummaryTotalQty() {
//	$('#semiProductionSummaryTotalQty').text(totalSemiProductionSummaryQty.toLocaleString());
//}
//function renderSemiProductionSummaryTableData() {
//	let tableBody = "";
//
//	//console.log("globalSemiProductionSummaryData:", globalSemiProductionSummaryData);
//	//console.log("데이터 개수:", globalSemiProductionSummaryData.length);
//
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalSemiProductionSummaryData.length; i++) {
//		let rowNumber = (currentSemiProductionSummaryPage - 1) * semiProductionSummaryItemsPerPage + i + 1;
//		let statusText = globalSemiProductionSummaryData[i].intf_yn === 'Y' ? 'Completed' : 'Waiting';
//		let statusClass = globalSemiProductionSummaryData[i].intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
//
//		//console.log(`행 ${i}:`, globalSemiProductionSummaryData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//            <tr>
//            	<!-- <td class = "checkboxVal"><input type="checkbox" class="semiProduction_chk ${statusClass}" 
//            		data-unique="${globalSemiProductionSummaryData[i].sdate}_${globalSemiProductionSummaryData[i].itemcode}_${globalSemiProductionSummaryData[i].intf_yn}_${globalSemiProductionSummaryData[i].qty}_${globalSemiProductionSummaryData[i].lineno}_${globalSemiProductionSummaryData[i].factory}_${globalSemiProductionSummaryData[i].wms_key}"></td> -->
//                <td class = "noVal">${rowNumber}</td>
//                <!--<td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>-->
//                <td class = "dateVal">${globalSemiProductionSummaryData[i].SDATE || globalSemiProductionSummaryData[i].sdate || ''}</td>
//				<td class = "factoryVal">${globalSemiProductionSummaryData[i].FACTORY || globalSemiProductionSummaryData[i].factory || ''}</td>
//                <!--<td class = "linenoVal">${globalSemiProductionSummaryData[i].LINENO || globalSemiProductionSummaryData[i].lineno || ''}</td>-->
//				<td class = "carVal">${globalSemiProductionSummaryData[i].CAR || globalSemiProductionSummaryData[i].car || ''}</td>
//				<td class = "itemcodeVal">${globalSemiProductionSummaryData[i].ITEMCODE || globalSemiProductionSummaryData[i].itemcode || ''}</td>
//				<td class = "itemnameVal">${globalSemiProductionSummaryData[i].ITEMNAME || globalSemiProductionSummaryData[i].itemname || ''}</td>
//				<td class = "qtyVal">${Number(globalSemiProductionSummaryData[i].OKQTY || globalSemiProductionSummaryData[i].okqty || 0).toLocaleString()}</td>
//				<td class = "qtyVal">${Number(globalSemiProductionSummaryData[i].NGQTY || globalSemiProductionSummaryData[i].ngqty || 0).toLocaleString()}</td>
//            </tr>
//        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#semiProductionSummaryTableBody").html(tableBody);
//}
//
//// 페이지네이션 렌더링
//function renderSemiProductionSummaryPagination() {
//	let totalPages = Math.ceil(totalSemiProductionSummaryCount / semiProductionSummaryItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentSemiProductionSummaryPage > 1) {
//		paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="${currentSemiProductionSummaryPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="semiProductionSummary-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentSemiProductionSummaryPage - 5);
//	let endPage = Math.min(totalPages, currentSemiProductionSummaryPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentSemiProductionSummaryPage) {
//			paginationHtml += `<button class="semiProductionSummary-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentSemiProductionSummaryPage < totalPages) {
//		paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="${currentSemiProductionSummaryPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="semiProductionSummary-page-btn disabled">&gt;</button>`;
//	}
//
//	$('#semiProductionSummaryCurrentPageInfo').text(currentSemiProductionSummaryPage);
//	$('#semiProductionSummaryTotalPageInfo').text(totalPages);
//	$("#semiProductionSummaryPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindSemiProductionSummaryEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.semiProduction_chkAll').on('change', '.semiProduction_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.semiProduction_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.semiProduction_chk').on('change', '.semiProduction_chk', function() {
//		let totalCheckboxes = $('.semiProduction_chk').length;
//		let checkedCheckboxes = $('.semiProduction_chk:checked').length;
//		$('.semiProduction_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnSemiProductionSummarySearch").off('click').on('click', function() {
//		performSemiProductionSummarySearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnSemiProductionSummarySearchInit").off('click').on('click', function() {
//		resetSemiProductionSummarySearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.semiProductionSummary-page-btn').on('click', '.semiProductionSummary-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentSemiProductionSummaryPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performSemiProductionSummaryDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m3_semiProduction_summary input[type="text"], #view_m3_semiProduction_summary input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performSemiProductionSummarySearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		/*intf_yn: $("#semiProductionSummary_searchVal_Condition").val(),*/
//		fromDate: $("#semiProductionSummary_searchVal_fromDate").val(),
//		toDate: $("#semiProductionSummary_searchVal_toDate").val(),
//		factory: $("#semiProductionSummary_searchVal_factory").val(),
//		car: $("#semiProductionSummary_searchVal_car").val().trim(),
//		itemcode: $("#semiProductionSummary_searchVal_itemcode").val().trim(),
//		itemname: $("#semiProductionSummary_searchVal_itemname").val().trim(),
//		lineno: $("#semiProductionSummary_searchVal_lineno").val().trim()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performSemiProductionSummarySearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentSemiProductionSummaryPage = 1;
//	performSemiProductionSummaryDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetSemiProductionSummarySearch() {
//	const { fromDate, toDate } = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//
//	/*$("#semiProductionSummary_searchVal_Condition").val('');*/
//	$("#semiProductionSummary_searchVal_fromDate").val(fromDate);
//	$("#semiProductionSummary_searchVal_toDate").val(toDate);
//	$("#semiProductionSummary_searchVal_factory").val(factory);
//	$("#semiProductionSummary_searchVal_car").val('');
//	$("#semiProductionSummary_searchVal_itemcode").val('');
//	$("#semiProductionSummary_searchVal_itemname").val('');
//	// =
//	// 초기화 후 전체 데이터 다시 조회
//	currentSemiProductionSummaryPage = 1;
//	performSemiProductionSummaryDBSearch({ fromDate, toDate });
//
//	console.log('검색 조건이 초기화되었습니다.');
//}
//
//// 날짜 형식 변환 함수들
//function formatDateToYYYYMMDD(dateStr) {
//	if (!dateStr) return '';
//	return dateStr.replace(/-/g, '');
//}
//
//function formatDateFromYYYYMMDD(dateStr) {
//	if (!dateStr || dateStr.length !== 8) return '';
//	return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
//}
//
//// 유틸리티 함수들
//window.changeSemiProductionSummaryItemsPerPage = function(newItemsPerPage) {
//	semiProductionSummaryItemsPerPage = newItemsPerPage;
//	currentSemiProductionSummaryPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performSemiProductionSummaryDBSearch(searchCriteria);
//}
//
//window.exportSemiProductionSummaryData = function() {
//	return {
//		total: globalSemiProductionSummaryData.length,
//		currentPage: currentSemiProductionSummaryPage,
//		itemsPerPage: semiProductionSummaryItemsPerPage,
//		data: globalSemiProductionSummaryData
//	};
//}
//
//function fmtLocalDate(d) {
//	const y = d.getFullYear();
//	const m = String(d.getMonth() + 1).padStart(2, '0');
//	const dd = String(d.getDate()).padStart(2, '0');
//	return `${y}-${m}-${dd}`;
//}
//
//function getDefaultDateRange() {
//	const today = new Date();
//	const toDate = fmtLocalDate(today);
//	const fromDate = fmtLocalDate(today);
//	return { fromDate, toDate };
//}
//window.downloadAllSemiProductionSummaryData = function() {
//	let searchCriteria = {
//		/*intf_yn: $("#semiProductionSummary_searchVal_Condition").val(),*/
//		fromDate: $("#semiProductionSummary_searchVal_fromDate").val(),
//		toDate: $("#semiProductionSummary_searchVal_toDate").val(),
//		factory: $("#semiProductionSummary_searchVal_factory").val(),
//		car: $("#semiProductionSummary_searchVal_car").val().trim(),
//		itemcode: $("#semiProductionSummary_searchVal_itemcode").val().trim(),
//		itemname: $("#semiProductionSummary_searchVal_itemname").val().trim()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_semiProductionSummary_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.semiProductionSummaryColumns, {
//				fileName: 'SemiProductionSummary_All',
//				sheetName: 'SemiProductionSummary'
//			});
//			hideLoading();
//		},
//		error: function() {
//			alert("전체 데이터 조회에 실패했습니다.");
//			hideLoading();
//		}
//	});
//};
//
//$(document).on("click", ".btnIntfSemiProduction", function() {
//
//	if ($(".status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items'));
//		return;
//	}
//
//	if (!confirm(i18n.t('confirmation.interface.progress'))) {
//		return;
//	}
//
//	const iidList = [];
//	$(".semiProduction_chk:checked").each(function() {
//		let iid = $(this).data('unique');
//		iidList.push(iid);
//	});
//
//	// 체크된 요소가 없으면 경고창 표시 후 리턴
//	if (iidList.length === 0) {
//		alert(i18n.t('validation.no.select.items'));
//		return;
//	}
//
//	showLoading("data");
//
//	console.log(iidList)
//	$.ajax({
//		url: "/semiProduction_confirm_summary",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performSemiProductionSummaryDBSearch(searchVal);
//		},
//		error: function(xhr, status, error) {
//			console.error("요청 실패");
//			console.error("Status:", status);       // 예: "error"
//			console.error("Error:", error);         // 예: 서버 응답 메시지
//			console.error("Response:", xhr.responseText); // 서버 응답 본문
//			alert("오류가 발생했습니다: " + error);
//		}
//	});
//
//});
//
//$(document).on("click", ".btnIntfSemiProductionDelete", function() {
//
//	if ($(".status-waiting:checked").length > 0) {
//		alert(i18n.t('validation.unconfirm.items'));
//		return;
//	}
//
//	if (!confirm(i18n.t('confirmation.interface.progress'))) {
//		return;
//	}
//
//
//	const iidList = [];
//	$(".semiProduction_chk:checked").each(function() {
//		let iid = $(this).data('unique');
//		iidList.push(iid);
//	});
//
//	// 체크된 요소가 없으면 경고창 표시 후 리턴
//	if (iidList.length === 0) {
//		alert(i18n.t('validation.no.select.items'));
//		return;
//	}
//
//	showLoading("data");
//
//	console.log(iidList)
//	$.ajax({
//		url: "/semiProduction_confirm_summary_cancel",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performSemiProductionSummaryDBSearch(searchVal);
//		},
//		error: function(xhr, status, error) {
//			console.error("요청 실패");
//			console.error("Status:", status);       // 예: "error"
//			console.error("Error:", error);         // 예: 서버 응답 메시지
//			console.error("Response:", xhr.responseText); // 서버 응답 본문
//			alert("오류가 발생했습니다: " + error);
//		}
//	});
//
//});
//
