///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_exception_input_summary 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : exceptionInputSummary -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : ExceptionInputSummary -> NewMenuName
// * 4. 표시된 오류 및 = 부분 수정
// * 5. AJAX 호출명 따라 백단 코드 생성
// * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
// * 
// * 백단 참고사항
// * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
// * 
// * 아래 Document Ready 부터 복 붙
// * -------------------------------------------------------------- */
//
//let globalExceptionInputSummaryData = []; // 현재 조회된 데이터 저장
//let currentExceptionInputSummaryPage = 1; // 현재 페이지
//let exceptionInputSummaryItemsPerPage = 1000; // 페이지당 항목 수
//let totalExceptionInputSummaryCount = 0; // 서버에서 받은 총 개수 저장
//let totalExceptionInputSummaryTotalPages = 0; // 서버에서 받은 총 개수 저장
//window.filteredExceptionInputSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.exceptionInputSummaryColumns = [
//	{ key: 'INDATE', header: 'Date' },
//	{ key: 'FACTORY', header: 'Factory' },
//	{ key: 'STORAGE', header: 'Storage' },
//	{ key: 'TYPE', header: 'Type' },
//	{ key: 'CAR', header: 'Car' },       
//	{ key: 'ITEMCODE', header: 'Item Code' },
//	{ key: 'ITEMNAME', header: 'Item Name' },
//	{ key: 'QTY', header: 'Qty' }
//];
//
//$(document).ready(function() {	
//
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_exception_input_summary = function(menuId) {
//		showLoading("data");
//
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		performExceptionInputSummaryDBSearch({ fromDate, toDate, factory });
//	}
//});
//
//
//
//// DB에서 데이터 조회하는 함수
//function performExceptionInputSummaryDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_exceptionInputSummary",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentExceptionInputSummaryPage,
//			itemsPerPage: exceptionInputSummaryItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalExceptionInputSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalExceptionInputSummaryCount = data.totalCount || 0;
//			window.filteredExceptionInputSummaryData = globalExceptionInputSummaryData;
//
//			totalExceptionInputSummaryTotalPages = data.totalPages;
//			currentExceptionInputSummaryPage = data.currentPage;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_exception_input_summary').length) {
//				renderExceptionInputSummaryView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderExceptionInputSummaryTableData();
//				renderExceptionInputSummaryPagination();
//				updateExceptionInputSummaryTotalCount();
//			}
//
//			updateTotalQty()
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
//function renderExceptionInputSummaryView() {
//	let content_output = `
//		<div class="divBlockControl" id="view_m2_exception_input_summary">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">						
//						<div class="search-label" style="width:36%">
//							<div class="exception_IS_searchVal_fromToDate">${i18n.t('search.from')}<!-- FromTo --></div>
//							<div class="exception_IS_searchVal_fromToDateArea">
//								<input type="date" id="exception_IS_searchVal_fromDate"/>
//								<span class="middleWave">~</span>
//								<input type="date" id="exception_IS_searchVal_toDate"/>
//							</div>
//						</div>
//						<!--<div class="search-label">
//							<div class="exception_IS_searchVal_condition">${i18n.t('search.input.status')} 상태</div>
//							<select id="exception_IS_searchVal_condition" >
//								<option value="">${i18n.t('search.all')} 전체 </option>
//								<option value="N">${i18n.t('search.input.waiting')} 대기중 </option>
//								<option value="Y">${i18n.t('search.input.completed')} 완료 </option>
//							</select>
//						</div> -->
//						<div class="search-label">
//							<div class="exception_IS_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="exception_IS_searchVal_factory" class="factory-select">
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="exception_IS_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//							<select id="exception_IS_searchVal_storage" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="exception_IS_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="exception_IS_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="exception_IS_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="exception_IS_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="exception_IS_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="exception_IS_searchVal_itemname" />
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnExceptionInputSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnExceptionInputSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
//						</div>
//				</div>
//				
//				<!-- 탭 -->
//				<div class="tab-container">
//					<div class="tab">목록</div>
//				</div>
//				
//				<!-- 테이블 -->
//				<div class="table-container">
//					<div class="action-buttons">
//						<button class="btn btn-secondary">엑셀 다운로드</button>
//					</div>
//					
//					<div class="table-info">
//						<span>${i18n.t('table.info.total')} <strong id="exceptionInputSummaryTotalCount">${totalExceptionInputSummaryCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="exceptionInputSummaryCurrentPageInfo">${currentExceptionInputSummaryPage}</strong>/<strong id="exceptionInputSummaryTotalPageInfo">${totalExceptionInputSummaryTotalPages}</strong> |  
//							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="exceptionInputSummaryTotalQty" style="color:#007bff"></span>
//						</span>
//						<div class="action-buttons-right m2_exception_input_summary">
//							<div id="defaultActions" class="action-group">
//								<button class="btn btn-success" id="exceptionInputSummaryExcelBtn" onclick="downloadAllExceptionInputSummaryData()">Excel</button>
//							</div>
//						</div>
//						<!--<div class="btnInterfaceCommon btnExceptionInputItemsArea" style="margin-left:24px;">
//							<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfExceptionInput"/>
//							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfExceptionInputDelete"/>
//						</div>-->
//					</div>
//					<table class="data-table m2_exception_input_summary">
//						<thead>
//							<tr>
//								<!-- <th class = "checkboxVal">
//									<input type="checkbox" class="exceptionInput_chkAll">
//								</th> -->
//								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//								<!--<th class = "statusVal">${i18n.t('table.status')} 상태 </th>-->
//								<th class = "dateVal">${i18n.t('search.date')}<!-- INDATE --></th>
//								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//								<th class = "typeVal">${i18n.t('search.type')}<!-- TYPE --></th>
//								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = "itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//							</tr>
//						</thead>
//						<tbody id="exceptionInputSummaryTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="exceptionInputSummaryPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	/*<div class="search-label">
//							<div class="exception_IS_searchVal_username">${i18n.t('search.username')}<!-- USERNAME --></div>
//							<input type="text" id="exception_IS_searchVal_username" />
//						</div>*/
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="exceptionInputSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredExceptionInputSummaryData, exceptionInputSummaryColumns, {fileName:'ExceptionInputSummary', sheetName:'ExceptionInputSummary'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#exception_IS_searchVal_fromDate").val(fromDate);
//		$("#exception_IS_searchVal_toDate").val(toDate);
//	})();
//	
//	// 공장 및 창고 선택
//	renderFactoryStorage();	
//	// 테이블 데이터 렌더링
//	renderExceptionInputSummaryTableData();
//	// 페이지네이션 렌더링
//	renderExceptionInputSummaryPagination();
//	// 이벤트 바인딩
//	bindExceptionInputSummaryEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateExceptionInputSummaryTotalCount();
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
//
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//    const factory = $('#exception_IS_searchVal_factory');
//    const storage = $('#exception_IS_searchVal_storage');
//    const savedFactory = getCookie('selectedFactory');
//
//    // 공장별 창고 옵션 설정
//    function updateStorageOptions(factoryValue) {
//        storage.empty();
//        
//        const options = {
//            'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'Material+Sideseat+Outside', 'all'],
//            'PUEBLA': ['Material', 'PRODUCT', 'all'],
//            '': ['Material', 'Fabric', 'Side seat', 'Outside', 'Material+Sideseat+Outside', 'PRODUCT', 'all']
//        };
//        
//        const storageList = options[factoryValue] || options[''];
//        
//        storageList.forEach(item => {
//            const text = item === 'all' ? i18n.t('search.all') : item;
//            storage.append(`<option value="${item}">${text}</option>`);
//        });
//        
//        // 첫 번째 옵션 선택 (Material)
//        storage.val(storageList[0]);
//    }
//
//    // 저장된 공장 선택
//    if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
//        factory.val(savedFactory);
//    }
//    
//    updateStorageOptions(savedFactory || '');
//
//    // 공장 변경 시 창고 업데이트
//    factory.on('change', function() {
//        updateStorageOptions($(this).val());
//    });
//    
//    window.autoSetStorageFields();
//}
//
//// 정규식으로 쿠기 가져오기
//function getCookie(cookieName) {
//    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//    return match ? decodeURIComponent(match[2]) : '';
//}
//
//// 총 개수를 업데이트하는 함수
//function updateExceptionInputSummaryTotalCount() {
//	$('#exceptionInputSummaryTotalCount').text(totalExceptionInputSummaryCount);
//}
//
//function renderExceptionInputSummaryTableData() {
//	let tableBody = "";
//
//	//console.log("globalExceptionInputSummaryData:", globalExceptionInputSummaryData);
//	//console.log("데이터 개수:", globalExceptionInputSummaryData.length);
//
//	$("#exceptionInputSummaryCurrentPageInfo").text(currentExceptionInputSummaryPage);
//	$("#exceptionInputSummaryTotalPageInfo").text(totalExceptionInputSummaryTotalPages);
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalExceptionInputSummaryData.length; i++) {
//		let rowNumber = (currentExceptionInputSummaryPage - 1) * exceptionInputSummaryItemsPerPage + i + 1;
//		let data = globalExceptionInputSummaryData[i];
//		
//		let statusText = data.confirm_yn === 'Y' ? 'Completed' : 'Waiting';
//		let statusClass = data.confirm_yn === 'Y' ? 'status-completed' : 'status-waiting';
//		
//		//console.log(`행 ${i}:`, data); // 각 행 데이터 확인
//
//		tableBody += `
//            <tr>
//            	<!-- <td class = "checkboxVal"><input type="checkbox" class="exceptionInput_chk ${statusClass}" 
//        			data-unique="${data.indate}_${data.itemcode}_${data.confirm_yn}_${data.qty}_${data.factory}_${data.storage}"></td> -->
//			    <td class = "noVal">${rowNumber}</td>
//			    <!--<td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>-->
//			    <td class = "dateVal">${data.INDATE || data.indate || ''}</td>
//			    <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
//			    <td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
//			    <td class = "typeVal">${data.TYPE || data.type || ''}</td>
//			    <td class = "carVal">${data.CAR || data.car || ''}</td>
//			    <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
//			    <td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
//			    <td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//			</tr>
//        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#exceptionInputSummaryTableBody").html(tableBody);	
//}
//
//// 페이지네이션 렌더링
//function renderExceptionInputSummaryPagination() {
//	let totalPages = Math.ceil(totalExceptionInputSummaryCount / exceptionInputSummaryItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentExceptionInputSummaryPage > 1) {
//		paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="${currentExceptionInputSummaryPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="exceptionInputSummary-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentExceptionInputSummaryPage - 5);
//	let endPage = Math.min(totalPages, currentExceptionInputSummaryPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentExceptionInputSummaryPage) {
//			paginationHtml += `<button class="exceptionInputSummary-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentExceptionInputSummaryPage < totalPages) {
//		paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="${currentExceptionInputSummaryPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="exceptionInputSummary-page-btn disabled">&gt;</button>`;
//	}
//
//	$("#exceptionInputSummaryPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindExceptionInputSummaryEvents() {
////	// 전체 선택 체크박스
////	$(document).off('change', '.exceptionInput_chkAll').on('change', '.exceptionInput_chkAll', function() {
////		let isChecked = $(this).is(':checked');
////		$('.exceptionInput_chk').prop('checked', isChecked);
////	});
////
////	// 개별 체크박스
////	$(document).off('change', '.exceptionInput_chk').on('change', '.exceptionInput_chk', function() {
////		let totalCheckboxes = $('.exceptionInput_chk').length;
////		let checkedCheckboxes = $('.exceptionInput_chk:checked').length;
////		$('.exceptionInput_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
////	});
//	
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnExceptionInputSummarySearch").off('click').on('click', function() {
//		performExceptionInputSummarySearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnExceptionInputSummarySearchInit").off('click').on('click', function() {
//		resetExceptionInputSummarySearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.exceptionInputSummary-page-btn').on('click', '.exceptionInputSummary-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentExceptionInputSummaryPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performExceptionInputSummaryDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_exception_input_summary input[type="text"], #view_m2_exception_input_summary input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performExceptionInputSummarySearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		/*intf_yn: $("#exception_IS_searchVal_condition").val(),*/
//		fromDate: $("#exception_IS_searchVal_fromDate").val(),
//		toDate: $("#exception_IS_searchVal_toDate").val(),
//		factory: $("#exception_IS_searchVal_factory").val(),
//		storage: $("#exception_IS_searchVal_storage").val(),
//		car: $("#exception_IS_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#exception_IS_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#exception_IS_searchVal_itemname").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performExceptionInputSummarySearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentExceptionInputSummaryPage = 1;
//	performExceptionInputSummaryDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetExceptionInputSummarySearch() {
//	const factory = getCookie('selectedFactory');
//	const { fromDate, toDate } = getDefaultDateRange();
//	
//	$("#exception_IS_searchVal_fromDate").val(fromDate);
//	$("#exception_IS_searchVal_toDate").val(toDate);
//	$("#exception_IS_searchVal_condition").val('');
//	$("#exception_IS_searchVal_factory").val(factory);
//	$("#exception_IS_searchVal_storage").val('Material');
//	$("#exception_IS_searchVal_car").val('');
//	$("#exception_IS_searchVal_itemcode").val('');
//	$("#exception_IS_searchVal_itemname").val('');
//	// 초기화 후 전체 데이터 다시 조회
//	currentExceptionInputSummaryPage = 1;
//	performExceptionInputSummaryDBSearch({ fromDate, toDate, factory });
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
//window.changeExceptionInputSummaryItemsPerPage = function(newItemsPerPage) {
//	exceptionInputSummaryItemsPerPage = newItemsPerPage;
//	currentExceptionInputSummaryPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performExceptionInputSummaryDBSearch(searchCriteria);
//}
//
//window.exportExceptionInputSummaryData = function() {
//	return {
//		total: globalExceptionInputSummaryData.length,
//		currentPage: currentExceptionInputSummaryPage,
//		itemsPerPage: exceptionInputSummaryItemsPerPage,
//		data: globalExceptionInputSummaryData
//	};
//}
//
//function updateTotalQty() {
//	const searchMap = getCurrentSearchCriteria();
//	if (!searchMap) {
//		searchMap = {}; // null이면 빈 객체로 변경
//	}
//
//	$.ajax({
//		url: "/updateTotalQty_exception_input",
//		type: "POST",
//		data: JSON.stringify(searchMap),
//		contentType: "application/json",
//		success: function(data) {
//			$(".exceptionInputSummaryTotalQty").text(Number(data).toLocaleString());
//		},
//		error: function(xhr, status, error) {
//			console.error("요청 실패");
//			console.error("Status:", status);       // 예: "error"
//			console.error("Error:", error);         // 예: 서버 응답 메시지
//			console.error("Response:", xhr.responseText); // 서버 응답 본문
//			alert("오류가 발생했습니다: " + error);
//		}
//	});
//}
//
//
//
//window.downloadAllExceptionInputSummaryData = function() {
//	let searchCriteria = {
//		intf_yn: $("#exception_IS_searchVal_condition").val(),
//		fromDate: $("#exception_IS_searchVal_fromDate").val(),
//		toDate: $("#exception_IS_searchVal_toDate").val(),
//		factory: $("#exception_IS_searchVal_factory").val(),
//		storage: $("#exception_IS_searchVal_storage").val(),
//		car: $("#exception_IS_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#exception_IS_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#exception_IS_searchVal_itemname").val().trim().toUpperCase(),
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_exceptionInputSummary_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.exceptionInputSummaryColumns, {
//				fileName: 'ExceptionInputSummary_All',
//				sheetName: 'ExceptionInputSummary'
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
////// 인터페이스
////$(document).on("click", ".btnIntfExceptionInput", function() {
////
////	if ($(".status-completed:checked").length > 0) {
////		alert(i18n.t('validation.confirm.items'));
////		return;
////	}
////
////	if (!confirm(i18n.t('confirmation.interface.progress'))) {
////		return;
////	}
////
////	const iidList = [];
////	$(".exceptionInput_chk:checked").each(function() {
////		let iid = $(this).data('unique');
////		iidList.push(iid);
////	});
////
////	// 체크된 요소가 없으면 경고창 표시 후 리턴
////	if (iidList.length === 0) {
////		alert(i18n.t('validation.no.select.items'));
////		return;
////	}
////
////	showLoading("data");
////
////	console.log(iidList)
////	$.ajax({
////		url: "/exceptionInput_confirm_summary",
////		type: "POST",
////		data: JSON.stringify(iidList),
////		contentType: "application/json",
////		success: function(data) {
////			let searchVal = getCurrentSearchCriteria();
////			performExceptionInputSummaryDBSearch(searchVal);	
////			
////			// 전체 선택 해제
////			$('.exceptionInput_chkAll').prop('checked', false);
////		},
////		error: function(xhr, status, error) {
////			console.error("요청 실패");
////			console.error("Status:", status);       // 예: "error"
////			console.error("Error:", error);         // 예: 서버 응답 메시지
////			console.error("Response:", xhr.responseText); // 서버 응답 본문
////			alert("오류가 발생했습니다: " + error);
////		}
////	});
////
////});
////
////$(document).on("click", ".btnIntfExceptionInputDelete", function() {
////
////	if ($(".status-waiting:checked").length > 0) {
////		alert(i18n.t('validation.unconfirm.items'));
////		return;
////	}
////
////	if (!confirm(i18n.t('confirmation.interface.progress'))) {
////		return;
////	}
////
////
////	const iidList = [];
////	$(".exceptionInput_chk:checked").each(function() {
////		let iid = $(this).data('unique');
////		iidList.push(iid);
////	});
////
////	// 체크된 요소가 없으면 경고창 표시 후 리턴
////	if (iidList.length === 0) {
////		alert(i18n.t('validation.no.select.items'));
////		return;
////	}
////
////	showLoading("data");
////
////	console.log(iidList)
////	$.ajax({
////		url: "/exceptionInput_confirm_summary_cancel",
////		type: "POST",
////		data: JSON.stringify(iidList),
////		contentType: "application/json",
////		success: function(data) {
////			let searchVal = getCurrentSearchCriteria();
////			performExceptionInputSummaryDBSearch(searchVal);	
////			
////			// 전체 선택 해제
////			$('.exceptionInput_chkAll').prop('checked', false);
////		},
////		error: function(xhr, status, error) {
////			console.error("요청 실패");
////			console.error("Status:", status);       // 예: "error"
////			console.error("Error:", error);         // 예: 서버 응답 메시지
////			console.error("Response:", xhr.responseText); // 서버 응답 본문
////			alert("오류가 발생했습니다: " + error);
////		}
////	});
////
////});
//
//
//
