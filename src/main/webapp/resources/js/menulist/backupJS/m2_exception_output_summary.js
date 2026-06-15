///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_exception_output_summary 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : exceptionOutputSummary -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : ExceptionOutputSummary -> NewMenuName
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
//let globalExceptionOutputSummaryData = []; // 현재 조회된 데이터 저장
//let currentExceptionOutputSummaryPage = 1; // 현재 페이지
//let exceptionOutputSummaryItemsPerPage = 1000; // 페이지당 항목 수
//let totalExceptionOutputSummaryCount = 0; // 서버에서 받은 총 개수 저장
//let totalExceptionOutputSummaryTotalPages = 0; // 서버에서 받은 총 개수 저장
//window.filteredExceptionOutputSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.exceptionOutputSummaryColumns = [
//	{ key: 'OUTDATE', header: 'Date' },
//	{ key: 'FACTORY', header: 'Factory' },
//	{ key: 'STORAGE', header: 'Storage' },	
//	{ key: 'TYPE', header: 'Type' },
//	{ key: 'CAR', header: 'Car' },       // c.subname_ch AS car
//	{ key: 'ITEMCODE', header: 'Itemcode' },
//	{ key: 'ITEMNAME', header: 'temname' },
//	{ key: 'QTY', header: 'Qty' }
//];
//
//$(document).ready(function() {
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_exception_output_summary = function(menuId) {
//		showLoading("data");
//
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		performExceptionOutputSummaryDBSearch({ fromDate, toDate, factory });
//	}
//});
//
//
//// DB에서 데이터 조회하는 함수
//function performExceptionOutputSummaryDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_exceptionOutputSummary",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentExceptionOutputSummaryPage,
//			itemsPerPage: exceptionOutputSummaryItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalExceptionOutputSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalExceptionOutputSummaryCount = data.totalCount || 0;
//			window.filteredExceptionOutputSummaryData = globalExceptionOutputSummaryData;
//
//			totalExceptionOutputSummaryTotalPages = data.totalPages;
//			currentExceptionOutputSummaryPage = data.currentPage;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_exception_output_summary').length) {
//				renderExceptionOutputSummaryView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderExceptionOutputSummaryTableData();
//				renderExceptionOutputSummaryPagination();
//				updateExceptionOutputSummaryTotalCount();
//			}
//
//			updateTotalQty()
//
//			$(".m2_exception_output_summary").siblings('.tabCommon').css('font-size', '9.2pt');
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
//function renderExceptionOutputSummaryView() {
//	let content_output = `
//		<div class="divBlockControl" id="view_m2_exception_output_summary">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<div class="search-label" style="width:36%">
//							<div class="exception_OS_searchVal_fromToDate">${i18n.t('search.from')}<!-- FromTo --></div>
//							<div class="exception_OS_searchVal_fromToDateArea">
//								<input type="date" id="exception_OS_searchVal_fromDate"/>
//								<span class="middleWave">~</span>
//								<input type="date" id="exception_OS_searchVal_toDate"/>
//							</div>
//						</div>
//						<!-- <div class="search-label">
//							<div class="exception_OS_searchVal_condition">${i18n.t('search.input.status')}상태 </div>
//							<select id="exception_OS_searchVal_condition" >
//								<option value="">${i18n.t('search.all')} 전체 </option>
//								<option value="N">${i18n.t('search.input.waiting')} 대기중 </option>
//								<option value="Y">${i18n.t('search.input.completed')} 완료</option>
//							</select>
//						</div>-->
//						<div class="search-label">
//							<div class="exception_OS_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="exception_OS_searchVal_factory" class="factory-select">
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="exception_OS_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//							<select id="exception_OS_searchVal_storage" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<!--
//						<div class="search-label">
//							<div class="exception_OS_searchVal_custcode">${i18n.t('search.custcode')}custcode</div>
//							<input type="text" id="exception_OS_searchVal_custcode" />
//						</div> -->
//						<div class="search-label">
//							<div class="exception_OS_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="exception_OS_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="exception_OS_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="exception_OS_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="exception_OS_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="exception_OS_searchVal_itemname" />
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnExceptionOutputSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnExceptionOutputSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<span>${i18n.t('table.info.total')} <strong id="exceptionOutputSummaryTotalCount">${totalExceptionOutputSummaryCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="exceptionOutputSummaryCurrentPageInfo">${currentExceptionOutputSummaryPage}</strong>/<strong id="exceptionOutputSummaryTotalPageInfo">${totalExceptionOutputSummaryTotalPages}</strong> |  
//							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="exceptionOutputSummaryTotalQty" style="color:#007bff"></span>
//						</span>
//						<div class="action-buttons-right m2_exception_output_summary">
//							<div id="defaultActions" class="action-group">
//								<button class="btn btn-success" id="exceptionOutputSummaryExcelBtn" onclick="downloadAllExceptionOutputSummaryData()">Excel</button>
//							</div>
//						</div>
//						<!--<div class="btnInterfaceCommon btnExceptionOutputItemsArea" style="margin-left:24px;">
//							<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfExceptionOutput"/>
//							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfExceptionOutputDelete"/>
//						</div>-->
//					</div>
//					<table class="data-table m2_exception_output_summary">
//						<thead>
//							<tr>
//								<!-- <th class = "checkboxVal">
//									<input type="checkbox" class="exceptionOutput_chkAll">
//								</th> -->
//								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//								<!--<th class = "statusVal">${i18n.t('table.status')} 상태 </th>-->
//								<th class = "dateVal">${i18n.t('search.date')}<!-- OUTDATE --></th>
//								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//								<!-- <th class = "cucodeVal">${i18n.t('search.cucode')}CUSTCODE</th> -->
//								<th class = "typeVal">${i18n.t('search.type')}<!-- TYPE --></th>
//								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//							</tr>
//						</thead>
//						<tbody id="exceptionOutputSummaryTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="exceptionOutputSummaryPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	/*<div class="search-label">
//							<div class="exception_OS_searchVal_username">${i18n.t('search.username')}<!-- USERNAME --></div>
//							<input type="text" id="exception_OS_searchVal_username" />
//						</div>*/
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="exceptionOutputSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredExceptionOutputSummaryData, exceptionOutputSummaryColumns, {fileName:'ExceptionOutputSummary', sheetName:'ExceptionOutputSummary'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//	
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#exception_OS_searchVal_fromDate").val(fromDate);
//		$("#exception_OS_searchVal_toDate").val(toDate);
//	})();
//	
//	// 공장 및 창고 선택
//	renderFactoryStorage();	
//	// 테이블 데이터 렌더링
//	renderExceptionOutputSummaryTableData();
//	// 페이지네이션 렌더링
//	renderExceptionOutputSummaryPagination();
//	// 이벤트 바인딩
//	bindExceptionOutputSummaryEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateExceptionOutputSummaryTotalCount();
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
//    const factory = $('#exception_OS_searchVal_factory');
//    const storage = $('#exception_OS_searchVal_storage');
//    const savedFactory = getCookie('selectedFactory');
//
//    // 공장별 창고 옵션 설정
//    function updateStorageOptions(factoryValue) {
//        storage.empty();
//        
//        const options = {
//            'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'Material+Sideseat+Outside', 'all'],
//            'PUEBLA': ['Material', 'PRODUCT', 'all'],
//            '': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'Material+Sideseat+Outside', 'all']
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
//function updateExceptionOutputSummaryTotalCount() {
//	$('#exceptionOutputSummaryTotalCount').text(totalExceptionOutputSummaryCount);
//}
//
//function renderExceptionOutputSummaryTableData() {
//	let tableBody = "";
//
//	//console.log("globalExceptionOutputSummaryData:", globalExceptionOutputSummaryData);
//	//console.log("데이터 개수:", globalExceptionOutputSummaryData.length);
//
//	$("#exceptionOutputSummaryCurrentPageInfo").text(currentExceptionOutputSummaryPage);
//	$("#exceptionOutputSummaryTotalPageInfo").text(totalExceptionOutputSummaryTotalPages);
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalExceptionOutputSummaryData.length; i++) {
//		let rowNumber = (currentExceptionOutputSummaryPage - 1) * exceptionOutputSummaryItemsPerPage + i + 1;
//		let data = globalExceptionOutputSummaryData[i];
//		
//		let statusText = data.confirm_yn === 'Y' ? 'Completed' : 'Waiting';
//		let statusClass = data.confirm_yn === 'Y' ? 'status-completed' : 'status-waiting';
//
//		//console.log(`행 ${i}:`, data); // 각 행 데이터 확인
//
//		tableBody += `
//            <tr>
//			    <!-- <td class = "checkboxVal"><input type="checkbox" class="exceptionOutput_chk ${statusClass}" 
//        			data-unique="${data.outdate}_${data.itemcode}_${data.confirm_yn}_${data.qty}_${data.factory}_${data.storage}"></td> -->
//			    <td class = "noVal">${rowNumber}</td>
//			   <!-- <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>-->
//			    <td class = "dateVal">${data.OUTDATE || data.outdate || ''}</td>
//			    <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
//			    <td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
//			    <!-- <td class = "cucodeVal">${data.CUSTCODE || data.custcode || ''}</td> -->
//			    <td class = "typeVal">${data.TYPE || data.type || ''}</td>
//			    <td class = "carVal">${data.CAR || data.car || ''}</td>
//			    <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
//			    <td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
//			    <td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//			</tr>
//        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#exceptionOutputSummaryTableBody").html(tableBody);
//}
//
//// 페이지네이션 렌더링
//function renderExceptionOutputSummaryPagination() {
//	let totalPages = Math.ceil(totalExceptionOutputSummaryCount / exceptionOutputSummaryItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentExceptionOutputSummaryPage > 1) {
//		paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="${currentExceptionOutputSummaryPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="exceptionOutputSummary-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentExceptionOutputSummaryPage - 5);
//	let endPage = Math.min(totalPages, currentExceptionOutputSummaryPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentExceptionOutputSummaryPage) {
//			paginationHtml += `<button class="exceptionOutputSummary-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentExceptionOutputSummaryPage < totalPages) {
//		paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="${currentExceptionOutputSummaryPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="exceptionOutputSummary-page-btn disabled">&gt;</button>`;
//	}
//
//	$("#exceptionOutputSummaryPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindExceptionOutputSummaryEvents() {
////	// 전체 선택 체크박스
////	$(document).off('change', '.exceptionOutput_chkAll').on('change', '.exceptionOutput_chkAll', function() {
////		let isChecked = $(this).is(':checked');
////		$('.exceptionOutput_chk').prop('checked', isChecked);
////	});
////
////	// 개별 체크박스
////	$(document).off('change', '.exceptionOutput_chk').on('change', '.exceptionOutput_chk', function() {
////		let totalCheckboxes = $('.exceptionOutput_chk').length;
////		let checkedCheckboxes = $('.exceptionOutput_chk:checked').length;
////		$('.exceptionOutput_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
////	});
//	
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnExceptionOutputSummarySearch").off('click').on('click', function() {
//		performExceptionOutputSummarySearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnExceptionOutputSummarySearchInit").off('click').on('click', function() {
//		resetExceptionOutputSummarySearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.exceptionOutputSummary-page-btn').on('click', '.exceptionOutputSummary-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentExceptionOutputSummaryPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performExceptionOutputSummaryDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_exception_output_summary input[type="text"], #view_m2_exception_output_summary input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performExceptionOutputSummarySearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		/*intf_yn: $("#exception_OS_searchVal_condition").val(),*/
//		fromDate: $("#exception_OS_searchVal_fromDate").val(),
//		toDate: $("#exception_OS_searchVal_toDate").val(),
//		factory: $("#exception_OS_searchVal_factory").val(),
//		storage: $("#exception_OS_searchVal_storage").val(),
////		custcode: $("#exception_OS_searchVal_custcode").val().trim().toUpperCase(),
//		car: $("#exception_OS_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#exception_OS_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#exception_OS_searchVal_itemname").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performExceptionOutputSummarySearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentExceptionOutputSummaryPage = 1;
//	performExceptionOutputSummaryDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetExceptionOutputSummarySearch() {
//	const factory = getCookie('selectedFactory');
//	const { fromDate, toDate } = getDefaultDateRange();
//	
//	$("#exception_OS_searchVal_fromDate").val(fromDate);
//	$("#exception_OS_searchVal_toDate").val(toDate);
//	$("#exception_OS_searchVal_condition").val('');
//	$("#exception_OS_searchVal_factory").val(factory);
//	$("#exception_OS_searchVal_storage").val('Material');
////	$("#exception_OS_searchVal_custcode").val('');
//	$("#exception_OS_searchVal_car").val('');
//	$("#exception_OS_searchVal_itemcode").val('');
//	$("#exception_OS_searchVal_itemname").val('');
//	// 초기화 후 전체 데이터 다시 조회
//	currentExceptionOutputSummaryPage = 1;
//	performExceptionOutputSummaryDBSearch({ fromDate, toDate, factory });
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
//window.changeExceptionOutputSummaryItemsPerPage = function(newItemsPerPage) {
//	exceptionOutputSummaryItemsPerPage = newItemsPerPage;
//	currentExceptionOutputSummaryPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performExceptionOutputSummaryDBSearch(searchCriteria);
//}
//
//window.exportExceptionOutputSummaryData = function() {
//	return {
//		total: globalExceptionOutputSummaryData.length,
//		currentPage: currentExceptionOutputSummaryPage,
//		itemsPerPage: exceptionOutputSummaryItemsPerPage,
//		data: globalExceptionOutputSummaryData
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
//		url: "/updateTotalQty_exception_output",
//		type: "POST",
//		data: JSON.stringify(searchMap),
//		contentType: "application/json",
//		success: function(data) {
//			$(".exceptionOutputSummaryTotalQty").text(Number(data).toLocaleString());
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
//window.downloadAllExceptionOutputSummaryData = function() {
//	let searchCriteria = {
//		intf_yn: $("#exception_OS_searchVal_condition").val(),			
//		fromDate: $("#exception_OS_searchVal_fromDate").val(),
//		toDate: $("#exception_OS_searchVal_toDate").val(),
//		factory: $("#exception_OS_searchVal_factory").val(),
//		storage: $("#exception_OS_searchVal_storage").val(),
////		custcode: $("#exception_OS_searchVal_custcode").val().trim().toUpperCase(),
//		car: $("#exception_OS_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#exception_OS_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#exception_OS_searchVal_itemname").val().trim().toUpperCase()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_exceptionOutputSummary_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.exceptionOutputSummaryColumns, {
//				fileName: 'ExceptionOutputSummary_All',
//				sheetName: 'ExceptionOutputSummary'
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
//
////// 인터페이스 등록
////$(document).on("click", ".btnIntfExceptionOutput", function() {
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
////	$(".exceptionOutput_chk:checked").each(function() {
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
////		url: "/exceptionOutput_confirm_summary",
////		type: "POST",
////		data: JSON.stringify(iidList),
////		contentType: "application/json",
////		success: function(data) {
////			let searchVal = getCurrentSearchCriteria();
////			performExceptionOutputSummaryDBSearch(searchVal);
////			
////			// 전체 선택 해제
////			$('.exceptionOutput_chkAll').prop('checked', false);
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
//////인터페이스 등록 취소
////$(document).on("click", ".btnIntfExceptionOutputDelete", function() {
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
////	$(".exceptionOutput_chk:checked").each(function() {
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
////		url: "/exceptionOutput_confirm_summary_cancel",
////		type: "POST",
////		data: JSON.stringify(iidList),
////		contentType: "application/json",
////		success: function(data) {
////			let searchVal = getCurrentSearchCriteria();
////			performExceptionOutputSummaryDBSearch(searchVal);
////			
////			// 전체 선택 해제
////			$('.exceptionOutput_chkAll').prop('checked', false);
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
