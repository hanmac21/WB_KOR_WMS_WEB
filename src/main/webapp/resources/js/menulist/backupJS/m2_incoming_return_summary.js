///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_incoming_return_summary 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : incomingReturnSummary -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : IncomingReturnSummary -> NewMenuName
// * 4. 표시된 오류 및 = 부분 수정
// * 5. AJAX 호출명 따라 백단 코드 생성
// * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
// * 
// * 백단 참고사항
// * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
// * 
// * 아래 Document Ready 부터 복 붙
// * -------------------------------------------------------------- */
//let globalIncomingReturnSummaryData = []; // 현재 조회된 데이터 저장
//let currentIncomingReturnSummaryPage = 1; // 현재 페이지
//let incomingReturnSummaryItemsPerPage = 1000; // 페이지당 항목 수
//let totalIncomingReturnSummaryCount = 0; // 서버에서 받은 총 개수 저장
//let totalIncomingReturnSummaryTotalPages = 0; // 서버에서 받은 총 개수 저장
//
//$(document).ready(function() {
//
//	window.filteredIncomingReturnSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//	window.incomingReturnSummaryColumns = [
//		{ key: 'INDATE', header: 'indate' },
//		{ key: 'FACTORY', header: 'factory' },
//		{ key: 'STORAGE', header: 'storage' },
//		{ key: 'CUSTNAME', header: 'Supplier' },
//		{ key: 'TYPE', header: 'type' },
//		{ key: 'CAR', header: 'car' },       // c.subname_ch AS car
//		{ key: 'ITEMCODE', header: 'itemcode' },
//		{ key: 'ITEMNAME', header: 'itemname' },
//		{ key: 'QTY', header: 'qty' }
//	];
//
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_incoming_return_summary = function(menuId) {
//		showLoading("data");
//
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		performIncomingReturnSummaryDBSearch({ fromDate, toDate, factory });
//	}
//});
//
//// DB에서 데이터 조회하는 함수
//function performIncomingReturnSummaryDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_incomingReturnSummary",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentIncomingReturnSummaryPage,
//			itemsPerPage: incomingReturnSummaryItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalIncomingReturnSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalIncomingReturnSummaryCount = data.totalCount || 0;
//			window.filteredIncomingReturnSummaryData = globalIncomingReturnSummaryData;
//
//			totalIncomingReturnSummaryTotalPages = data.totalPages;
//			currentIncomingReturnSummaryPage = data.currentPage;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_incoming_return_summary').length) {
//				renderIncomingReturnSummaryView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderIncomingReturnSummaryTableData();
//				renderIncomingReturnSummaryPagination();
//				updateIncomingReturnSummaryTotalCount();
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
//function renderIncomingReturnSummaryView() {
//	let content_output = `
//			<div class="divBlockControl" id="view_m2_incoming_return_summary">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">							
//							<div class="search-label" style="width:35%">
//								<div class="incoming_return_summary_searchVal_fromToDate">${i18n.t('search.date')}<!-- FromTo --></div>
//								<div class="incoming_return_summary_searchVal_fromToDateArea">
//									<input type="date" id="incoming_return_summary_searchVal_fromDate"/>
//									<span class="middleWave">~</span>
//									<input type="date" id="incoming_return_summary_searchVal_toDate"/>
//								</div>
//							</div>
//							<!--<div class="search-label">
//								<div class="search_inboundCondition">${i18n.t('search.inbound.status')}입고상태</div>
//								<select id="incoming_return_summary_searchVal_condition" >
//									<option value="">${i18n.t('search.all')} 전체 </option>
//									<option value="N">${i18n.t('search.inbound.waiting')}입고 대기중</option>
//									<option value="Y">${i18n.t('search.inbound.completed')} 입고 완료</option>
//								</select>
//							</div>-->
//							<div class="search-label">
//								<div class="incoming_return_summary_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//								<select id="incoming_return_summary_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="incoming_return_summary_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="incoming_return_summary_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_cname">${i18n.t('search.suppliername')}<!-- CNAME --></div>
//								<input type="text" id="incoming_return_summary_searchVal_cname" />
//							</div>
//							<div class="search-label">
//								<div class="incoming_return_summary_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="incoming_return_summary_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="incoming_return_summary_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="incoming_return_summary_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="incoming_return_summary_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="incoming_return_summary_searchVal_itemname" />
//							</div>
//						</div>
//							<div class="search_button_area">
//								<button class="btn btn-primary btnIncomingReturnSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//								<button class="btn btn-secondary btnIncomingReturnSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//							<span>${i18n.t('table.info.total')} <strong id="incomingReturnSummaryTotalCount">${totalIncomingReturnSummaryCount}</strong> ${i18n.t('table.info.records')} | 
//								${i18n.t('table.page')} <strong id="incomingReturnSummaryCurrentPageInfo">${currentIncomingReturnSummaryPage}</strong>/<strong id="incomingReturnSummaryTotalPageInfo">${totalIncomingReturnSummaryTotalPages}</strong> |  
//								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="incomingReturnSummaryTotalQty" style="color:#007bff"></span>
//							</span>
//							<div class="action-buttons-right m2_incoming_return_summary">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="incomingReturnSummaryExcelBtn" onclick="downloadAllIncomingReturnSummaryData()">Excel</button>
//								</div>
//							</div>
//							<!--<div class="btnInterfaceCommon btnIncomingReturnSummaryItemsArea" style="margin-left:24px;">
//								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfIncomingReturnSummary"/>
//								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfIncomingReturnSummaryCancel"/>
//							</div>-->
//						</div>
//						<table class="data-table m2_incoming_return_summary">
//							<thead>
//								<tr>
//									<!-- <th class = 'checkboxVal'>
//										<input type="checkbox" class="incomingReturn_summary_chkAll">
//									</th> -->
//									<th class = 'noVal'>${i18n.t('table.no')}<!-- No --></th>
//									<th class = 'dateVal'>${i18n.t('search.date')}<!-- INDATE --></th>
//									<!--<th class = 'statusVal' class = 'qtyVal'>${i18n.t('table.status')} STATUS</th> -->
//									<th class = 'factoryVal'>${i18n.t('search.factory')}<!-- FACTORY --></th>
//									<th class = 'storageVal'>${i18n.t('search.storage')}<!-- STORAGE --></th>
//									<th class = 'cnameVal'>${i18n.t('search.suppliername')}<!-- CNAME --></th>
//									<th class = 'typeVal'>${i18n.t('search.type')}<!-- TYPE --></th>
//									<th class = 'carVal'>${i18n.t('search.car')}<!-- CAR --></th>
//									<th class = 'itemcodeVal'>${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									<th class = 'itemnameVal'>${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									<th class = 'qtyVal'>${i18n.t('search.qty')}<!-- QTY --></th>
//								</tr>
//							</thead>
//							<tbody id="incomingReturnSummaryTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="incomingReturnSummaryPaginationContainer">
//						</div>
//					</div>
//				</div>
//			</div>
//		`;
//	/*<div class="search-label">
//							<div class="incoming_return_summary_searchVal_username">${i18n.t('search.username')}<!-- USERNAME --></div>
//							<input type="text" id="incoming_return_summary_searchVal_username" />
//						</div>*/
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="incomingReturnSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredIncomingReturnSummaryData, incomingReturnSummaryColumns, {fileName:'IncomingReturnSummary', sheetName:'IncomingReturnSummary'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//	
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#incoming_return_summary_searchVal_fromDate").val(fromDate);
//		$("#incoming_return_summary_searchVal_toDate").val(toDate);
//	})();
//	
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderIncomingReturnSummaryTableData();
//	// 페이지네이션 렌더링
//	renderIncomingReturnSummaryPagination();
//	// 이벤트 바인딩
//	bindIncomingReturnSummaryEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateIncomingReturnSummaryTotalCount();
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
//	const factory = $('#incoming_return_summary_searchVal_factory');
//	const storage = $('#incoming_return_summary_searchVal_storage');
//	const savedFactory = getCookie('selectedFactory');
//
//	// 공장별 창고 옵션 설정
//	function updateStorageOptions(factoryValue) {
//		storage.empty();
//
//		const options = {
//			'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'P1 W/HOUSE', 'Material+Sideseat+Outside', 'all'],
//			'PUEBLA': ['Material', 'PRODUCT', 'all'],
//			'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'P1 W/HOUSE', 'Material+Sideseat+Outside', 'all']
//		};
//
//		const storageList = options[factoryValue] || options[''];
//
//		storageList.forEach(item => {
//			const text = item === 'all' ? i18n.t('search.all') : item;
//			storage.append(`<option value="${item}">${text}</option>`);
//		});
//
//		// 첫 번째 옵션 선택 (Material)
//		storage.val(storageList[0]);
//	}
//
//	// 저장된 공장 선택
//	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
//		factory.val(savedFactory);
//	}
//
//	updateStorageOptions(savedFactory || '');
//
//	// 공장 변경 시 창고 업데이트
//	factory.on('change', function() {
//		updateStorageOptions($(this).val());
//	});
//	
//	window.autoSetStorageFields();
//}
//
//// 정규식으로 쿠기 가져오기
//function getCookie(cookieName) {
//	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//	return match ? decodeURIComponent(match[2]) : '';
//}
//
//// 총 개수를 업데이트하는 함수
//function updateIncomingReturnSummaryTotalCount() {
//	$('#incomingReturnSummaryTotalCount').text(totalIncomingReturnSummaryCount);
//}
//
//function renderIncomingReturnSummaryTableData() {
//	let tableBody = "";
//
//	//console.log("globalIncomingReturnSummaryData:", globalIncomingReturnSummaryData);
//	//console.log("데이터 개수:", globalIncomingReturnSummaryData.length);
//
//	$("#incomingReturnSummaryCurrentPageInfo").text(currentIncomingReturnSummaryPage);
//	$("#incomingReturnSummaryTotalPageInfo").text(totalIncomingReturnSummaryTotalPages);
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalIncomingReturnSummaryData.length; i++) {
//		let rowNumber = (currentIncomingReturnSummaryPage - 1) * incomingReturnSummaryItemsPerPage + i + 1;
//		let data = globalIncomingReturnSummaryData[i];
//		
//		let statusText = data.intf_yn === 'Y' ? 'Completed' : 'Waiting';
//		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
//
//		//console.log(`행 ${i}:`, data); // 각 행 데이터 확인
//
//		tableBody += `
//	            <tr>
//	            	<!-- <td class = 'checkboxVal'><input type="checkbox" class="incomingReturn_summary_chk ${statusClass}" 
//            			data-unique="${data.indate}_${data.itemcode}_${data.intf_yn}_${data.qty}_${data.factory}_${data.storage}"></td> -->
//                	<td class = 'noVal'>${rowNumber}</td>
//					<td class = 'dateVal'>${data.INDATE || data.indate || ''}</td>
//				    <!-- <td class = 'statusVal'><span class="${statusClass}">${statusText}</span></td> -->
//				    <td class = 'factoryVal'>${data.FACTORY || data.factory || ''}</td>
//				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
//					<td class = 'cnameVal'>${data.CUSTNAME || data.custname || ''}</td>
//				    <td class = 'typeVal'>${data.TYPE || data.type || ''}</td>
//				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
//				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
//				    <td class = 'itemnameVal'>${data.ITEMNAME || data.itemname || ''}</td>
//				    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//				</tr>
//	        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#incomingReturnSummaryTableBody").html(tableBody);
//}
//
//// 페이지네이션 렌더링
//function renderIncomingReturnSummaryPagination() {
//	let totalPages = Math.ceil(totalIncomingReturnSummaryCount / incomingReturnSummaryItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentIncomingReturnSummaryPage > 1) {
//		paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="${currentIncomingReturnSummaryPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="incomingReturnSummary-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentIncomingReturnSummaryPage - 5);
//	let endPage = Math.min(totalPages, currentIncomingReturnSummaryPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentIncomingReturnSummaryPage) {
//			paginationHtml += `<button class="incomingReturnSummary-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentIncomingReturnSummaryPage < totalPages) {
//		paginationHtml += `<button class="incomingReturnSummary-page-btn" data-page="${currentIncomingReturnSummaryPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="incomingReturnSummary-page-btn disabled">&gt;</button>`;
//	}
//
//	$("#incomingReturnSummaryPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindIncomingReturnSummaryEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.incomingReturn_summary_chkAll').on('change', '.incomingReturn_summary_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.incomingReturn_summary_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.incomingReturn_summary_chk').on('change', '.incomingReturn_summary_chk', function() {
//		let totalCheckboxes = $('.incomingReturn_summary_chk').length;
//		let checkedCheckboxes = $('.incomingReturn_summary_chk:checked').length;
//		$('.incomingReturn_summary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnIncomingReturnSummarySearch").off('click').on('click', function() {
//		performIncomingReturnSummarySearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnIncomingReturnSummarySearchInit").off('click').on('click', function() {
//		resetIncomingReturnSummarySearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.incomingReturnSummary-page-btn').on('click', '.incomingReturnSummary-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentIncomingReturnSummaryPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performIncomingReturnSummaryDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_incoming_return_summary input[type="text"], #view_m2_incoming_return_summary input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performIncomingReturnSummarySearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		/*intf_yn: $("#incoming_return_summary_searchVal_condition").val(),*/
//		fromDate: $("#incoming_return_summary_searchVal_fromDate").val(),
//		toDate: $("#incoming_return_summary_searchVal_toDate").val(),
//		factory: $("#incoming_return_summary_searchVal_factory").val(),
//		storage: $("#incoming_return_summary_searchVal_storage").val(),
//		cname: $("#incoming_return_summary_searchVal_cname").val().trim().toUpperCase(),
//		car: $("#incoming_return_summary_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#incoming_return_summary_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#incoming_return_summary_searchVal_itemname").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performIncomingReturnSummarySearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentIncomingReturnSummaryPage = 1;
//	performIncomingReturnSummaryDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetIncomingReturnSummarySearch() {
//	const factory = getCookie('selectedFactory');
//	const { fromDate, toDate } = getDefaultDateRange();
//
//	/*$("#incoming_return_summary_searchVal_condition").val('');*/
//	$("#incoming_return_summary_searchVal_fromDate").val(fromDate);
//	$("#incoming_return_summary_searchVal_toDate").val(toDate);
//	$("#incoming_return_summary_searchVal_factory").val(factory);
//	$("#incoming_return_summary_searchVal_storage").val('Material');
//	$("#incoming_return_summary_searchVal_cname").val('');
//	$("#incoming_return_summary_searchVal_car").val('');
//	$("#incoming_return_summary_searchVal_itemcode").val('');
//	$("#incoming_return_summary_searchVal_itemname").val('');
//	// 초기화 후 전체 데이터 다시 조회
//	currentIncomingReturnSummaryPage = 1;
//	performIncomingReturnSummaryDBSearch({ fromDate, toDate, factory });
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
//window.changeIncomingReturnSummaryItemsPerPage = function(newItemsPerPage) {
//	incomingReturnSummaryItemsPerPage = newItemsPerPage;
//	currentIncomingReturnSummaryPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performIncomingReturnSummaryDBSearch(searchCriteria);
//}
//
//window.exportIncomingReturnSummaryData = function() {
//	return {
//		total: globalIncomingReturnSummaryData.length,
//		currentPage: currentIncomingReturnSummaryPage,
//		itemsPerPage: incomingReturnSummaryItemsPerPage,
//		data: globalIncomingReturnSummaryData
//	};
//}
//function updateTotalQty() {
//	const searchMap = getCurrentSearchCriteria();
//	if (!searchMap) {
//		searchMap = {}; // null이면 빈 객체로 변경
//	}
//
//	$.ajax({
//		url: "/updateTotalQtyIncomingReturn",
//		type: "POST",
//		data: JSON.stringify(searchMap),
//		contentType: "application/json",
//		success: function(data) {
//			$(".incomingReturnSummaryTotalQty").text(Number(data).toLocaleString());
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
//window.downloadAllIncomingReturnSummaryData = function() {
//	let searchCriteria = {
//		intf_yn: $("#incoming_return_summary_searchVal_condition").val(),
//		fromDate: $("#incoming_return_summary_searchVal_fromDate").val(),
//		toDate: $("#incoming_return_summary_searchVal_toDate").val(),
//		factory: $("#incoming_return_summary_searchVal_factory").val(),
//		storage: $("#incoming_return_summary_searchVal_storage").val(),
//		cname: $("#incoming_return_summary_searchVal_cname").val().trim().toUpperCase(),
//		car: $("#incoming_return_summary_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#incoming_return_summary_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#incoming_return_summary_searchVal_itemname").val().trim().toUpperCase()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_incomingReturnSummary_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.incomingReturnSummaryColumns, {
//				fileName: 'IncomingReturnSummary_All',
//				sheetName: 'IncomingReturnSummary'
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
//
