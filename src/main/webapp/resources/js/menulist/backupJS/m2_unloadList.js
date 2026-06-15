///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_unloadList 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : unloadList -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : UnloadList -> NewMenuName
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
//let globalUnloadListData = []; // 현재 조회된 데이터 저장
//let currentUnloadListPage = 1; // 현재 페이지
//let unloadListItemsPerPage = 1000; // 페이지당 항목 수
//let totalUnloadListCount = 0; // 서버에서 받은 총 개수 저장
//let totalUnloadListQty = 0; // 서버에서 받은 총 개수 저장
//let totalUnloadListPages = 0; // 서버에서 받은 총 페이지
//$(document).ready(function() {
//
//	window.filteredUnloadListData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//	window.unloadListColumns = [
//		{ key: 'BARCODE', header: 'barcode' },
//		{ key: 'INDATE', header: 'indate' },
//		{ key: 'FACTORY', header: 'factory' },
//		{ key: 'STORAGE', header: 'storage' },
//		{ key: 'CAR', header: 'car' },
//		{ key: 'ITEMCODE', header: 'itemcode' },
//		{ key: 'ITEMNAME', header: 'itemname' },
//		{ key: 'QTY', header: 'qty' },
//		{ key: 'OLDLOCATION', header: 'oldlocation' },
//		{ key: 'SOURCE', header: 'source' },
//		{ key: 'RACK', header: 'rack' }
//		// =
//	];
//
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_unloadList = function(menuId) {
//		showLoading("data");
//		// 251017 DH - 날짜 검색 관련 제거
//		//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		// 251017 DH - 날짜 검색 관련 제거
//		//		performUnloadListDBSearch({ fromDate, toDate, factory });
//		performUnloadListDBSearch({ factory });
//	}
//});
//
//// DB에서 데이터 조회하는 함수
//function performUnloadListDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_unloadList",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentUnloadListPage,
//			itemsPerPage: unloadListItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalUnloadListData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalUnloadListCount = data.totalCount || 0;
//			totalUnloadListQty = data.totalQty || 0;
//			totalUnloadListPages = data.totalPages || 0;
//			currentUnloadListPage = data.currentPage || 0;
//			window.filteredUnloadListData = globalUnloadListData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_unloadList').length) {
//				renderUnloadListView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderUnloadListTableData();
//				renderUnloadListPagination();
//				updateUnloadListTotalCount();
//				updateUnloadListTotalQty();
//			}
//
//			hideLoading();
//		},
//		error: function(xhr, status, error) {
//			console.error("DB 조회 실패:", error);
//			console.error('[WIP Return Detail][AJAX ERROR]',
//				{ status, error, httpStatus: xhr.status, resp: xhr.responseText });
//			hideLoading();
//			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
//		}
//	});
//}
//
//// 사용자 뷰 렌더링 함수
//function renderUnloadListView() {
//	let content_output = `
//			<div class="divBlockControl" id="view_m2_unloadList">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<!-- <div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
//								<input type="date" id="unloadList_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="unloadList_searchVal_toDate" />
//							</div> -->
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//								<select id="unloadList_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="unloadList_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="unloadList_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="unloadList_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="unloadList_searchVal_itemname" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_source">${i18n.t('search.type')}<!-- SOURCE --></div>
//								<input type="text" id="unloadList_searchVal_source" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_rack">RACK<!-- RACK --></div>
//								<input type="text" id="unloadList_searchVal_rack" />
//							</div>
//						</div>
//							<div class="search_button_area">
//								<button class="btn btn-primary btnUnloadListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//								<button class="btn btn-secondary btnUnloadListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//							<span>${i18n.t('table.info.total')} <strong id="unloadListTotalCount">${totalUnloadListCount}</strong> ${i18n.t('table.info.records')} | 
//								${i18n.t('table.page')} <strong id="unloadListCurrentPageInfo">${currentUnloadListPage}</strong>/<strong id="unloadListTotalPageInfo">${totalUnloadListPages}</strong> | 
//								${i18n.t('table.info.qty')} : <strong id = "unloadListTotalQty"></strong>
//							</span>
//							<div class="action-buttons-right m2_unloadList">
//								<div id="defaultActions" class="action-group">
//									<input type="button" value="${i18n.t('btn.exceptionOut')}" class="btn btn-success btnExceptionOut_unloadList"/>
//									<button class="btn btn-success" id="unloadListExcelBtn" onclick="downloadAllUnloadListData()">Excel</button>
//								</div>
//							</div>
//							<!--<div class="btnIntfCommon btnUnloadListItemsArea">
//								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfUnloadList"/>
//								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfUnloadListCancel"/>
//							</div>-->	
//						</div>
//						<table class="data-table m2_unloadList">
//							<thead>
//								<tr>
//									<th class = "checkboxVal">
//										<input type="checkbox" class="unloadList_chkAll">
//									</th>
//									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//									<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>										
//									<th class = "dateVal">${i18n.t('table.date')}<!-- INDATE --></th>										
//									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//									<th class = "locationVal">OLD LOCATION<!-- OLD LOCATION --></th>
//									<th class = "locationVal">${i18n.t('search.type')}<!-- SOURCE --></th>
//									<th class = "noVal">${i18n.t('search.rack')}<!-- RACK --></th>
//								</tr>
//							</thead>
//							<tbody id="unloadListTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="unloadListPaginationContainer">
//						</div>
//					</div>
//				</div>
//			</div>
//		`;
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="unloadListExcelBtn" onclick="ExcelExporter.downloadExcel(filteredUnloadListData, unloadListColumns, {fileName:'UnloadList', sheetName:'UnloadList'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#unloadList_searchVal_fromDate").val(fromDate);
//		$("#unloadList_searchVal_toDate").val(toDate);
//	})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderUnloadListTableData();
//	// 페이지네이션 렌더링
//	renderUnloadListPagination();
//	// 이벤트 바인딩
//	bindUnloadListEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateUnloadListTotalCount();
//	// 초기 렌더링 후 수량 업데이트
//	updateUnloadListTotalQty();
//
//}
//
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//	const factory = $('#unloadList_searchVal_factory');
//	const storage = $('#unloadList_searchVal_storage');
//	const savedFactory = getCookie('selectedFactory');
//
//	// 공장별 창고 옵션 설정
//	function updateStorageOptions(factoryValue) {
//		storage.empty();
//
//		const options = {
//			'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'Material+Sideseat+Outside', 'all'],
//			'PUEBLA': ['Material', 'PRODUCT', 'all'],
//			'': ['Material', 'Fabric', 'Side seat', 'Outside', 'Material+Sideseat+Outside', 'PRODUCT', 'all']
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
//function updateUnloadListTotalCount() {
//	$('#unloadListTotalCount').text(totalUnloadListCount);
//}
//// 총 개수를 업데이트하는 함수
//function updateUnloadListTotalQty() {
//	$('#unloadListTotalQty').text(totalUnloadListQty.toLocaleString());
//}
//function renderUnloadListTableData() {
//	let tableBody = "";
//
//	//console.log("globalUnloadListData:", globalUnloadListData);
//	//console.log("데이터 개수:", globalUnloadListData.length);
//
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalUnloadListData.length; i++) {
//		let inputData = globalUnloadListData;
//
//		let rowNumber = (currentUnloadListPage - 1) * unloadListItemsPerPage + i + 1;
//		//console.log(`행 ${i}:`, inputData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//            <tr>
//            	<td class = "checkboxVal"><input type="checkbox" class="unloadList_chk" 
//            		data-unique="${inputData[i].barcode}_${inputData[i].indate}_${inputData[i].factory}_${inputData[i].storage}_${inputData[i].qty}_${inputData[i].source}"></td>
//                <td class = "noVal">${rowNumber}</td>
//				<td class = "barcodeVal">${inputData[i].BARCODE || inputData[i].barcode || ''}</td>
//				<td class = "dateVal">${inputData[i].INDATE || inputData[i].indate || ''}</td>
//				<td class = "factoryVal">${inputData[i].FACTORY || inputData[i].factory || ''}</td>
//				<td class = "storageVal">${inputData[i].STORAGE || inputData[i].storage || ''}</td>
//				<td class = "carVal">${inputData[i].CAR || inputData[i].car || ''}</td>
//				<td class = "itemcodeVal">${inputData[i].ITEMCODE || inputData[i].itemcode || ''}</td>
//				<td class = "itemnameMedVal">${inputData[i].ITEMNAME || inputData[i].itemname || ''}</td>
//				<td class = "qtyVal">${Number(inputData[i].QTY || inputData[i].qty || 0).toLocaleString()}</td>
//				<td class = "locationVal">${inputData[i].OLDLOCATION || inputData[i].oldlocation || ''}</td>
//				<td class = "locationVal">${inputData[i].SOURCE || inputData[i].source || ''}</td>
//				<td class = "noVal">${inputData[i].RACK || inputData[i].rack || ''}</td>
//            </tr>
//        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#unloadListTableBody").html(tableBody);
//}
//
//// 페이지네이션 렌더링
//function renderUnloadListPagination() {
//	let totalPages = Math.ceil(totalUnloadListCount / unloadListItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentUnloadListPage > 1) {
//		paginationHtml += `<button class="unloadList-page-btn" data-page="${currentUnloadListPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="unloadList-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentUnloadListPage - 5);
//	let endPage = Math.min(totalPages, currentUnloadListPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="unloadList-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentUnloadListPage) {
//			paginationHtml += `<button class="unloadList-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="unloadList-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="unloadList-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentUnloadListPage < totalPages) {
//		paginationHtml += `<button class="unloadList-page-btn" data-page="${currentUnloadListPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="unloadList-page-btn disabled">&gt;</button>`;
//	}
//
//	$('#unloadListCurrentPageInfo').text(currentUnloadListPage);
//	$('#unloadListTotalPageInfo').text(totalPages);
//	$("#unloadListPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindUnloadListEvents() {
//
//	// 전체 선택 체크박스
//	$(document).off('change', '.unloadList_chkAll').on('change', '.unloadList_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.unloadList_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.unloadList_chk').on('change', '.unloadList_chk', function() {
//		let totalCheckboxes = $('.unloadList_chk').length;
//		let checkedCheckboxes = $('.unloadList_chk:checked').length;
//		$('.unloadList_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnUnloadListSearch").off('click').on('click', function() {
//		performUnloadListSearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnUnloadListSearchInit").off('click').on('click', function() {
//		resetUnloadListSearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.unloadList-page-btn').on('click', '.unloadList-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentUnloadListPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performUnloadListDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_unloadList input[type="text"], #view_m2_unloadList input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performUnloadListSearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		// 251017 DH - 날짜 검색 관련 제거
//		/*wipCondition: $("#unloadList_searchVal_condition").val(),
//		fromDate: $("#unloadList_searchVal_fromDate").val(),
//		toDate: $("#unloadList_searchVal_toDate").val(),*/
//		factory: $("#unloadList_searchVal_factory").val().trim(),
//		storage: $("#unloadList_searchVal_storage").val().trim(),
//		car: $("#unloadList_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#unloadList_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#unloadList_searchVal_itemname").val().trim().toUpperCase(),
//		rack: $("#unloadList_searchVal_rack").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performUnloadListSearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentUnloadListPage = 1;
//	performUnloadListDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetUnloadListSearch() {
//	// 251017 DH - 날짜 검색 관련 제거
//	//	const { fromDate, toDate } = getDefaultDateRange();	
//	//	$("#unloadList_searchVal_fromDate").val(fromDate);
//	//	$("#unloadList_searchVal_toDate").val(toDate);
//
//	const factory = getCookie('selectedFactory');
//
//	$("#unloadList_searchVal_factory").val(factory);
//	$("#unloadList_searchVal_storage").val('Material');
//	$("#unloadList_searchVal_car").val('');
//	$("#unloadList_searchVal_itemcode").val('');
//	$("#unloadList_searchVal_itemname").val('');
//	$("#unloadList_searchVal_source").val('');
//	$("#unloadList_searchVal_rack").val('');
//	// =
//	// 초기화 후 전체 데이터 다시 조회
//	currentUnloadListPage = 1;
//	//	performUnloadListDBSearch({ fromDate, toDate, factory });
//	performUnloadListDBSearch({ factory });
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
//window.changeUnloadListItemsPerPage = function(newItemsPerPage) {
//	unloadListItemsPerPage = newItemsPerPage;
//	currentUnloadListPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performUnloadListDBSearch(searchCriteria);
//}
//
//window.exportUnloadListData = function() {
//	return {
//		total: globalUnloadListData.length,
//		currentPage: currentUnloadListPage,
//		itemsPerPage: unloadListItemsPerPage,
//		data: globalUnloadListData
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
//
//
//window.downloadAllUnloadListData = function() {
//	let searchCriteria = {
//		// 251017 DH - 날짜 검색 관련 제거
//		/* fromDate: $("#unloadList_searchVal_fromDate").val(),
//		toDate: $("#unloadList_searchVal_toDate").val(), */
//		factory: $("#unloadList_searchVal_factory").val().trim(),
//		storage: $("#unloadList_searchVal_storage").val().trim(),
//		car: $("#unloadList_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#unloadList_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#unloadList_searchVal_itemname").val().trim().toUpperCase(),
//		rack: $("#unloadList_searchVal_rack").val().trim().toUpperCase()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_unloadList_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.unloadListColumns, {
//				fileName: 'UnloadList_All',
//				sheetName: 'UnloadList'
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
//$(document).on("click", ".btnExceptionOut_unloadList", function() {
//	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
//	const sabun = getCookie("sabun");
//
//	const iidList = [];
//	$(".unloadList_chk:checked").each(function() {
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
//
//
//	console.log(iidList)
//	console.log(sabun);
//	if (confirm("Do you want to proceed with an exception load?")) {
//		showLoading("data");
//		$.ajax({
//			url: `/insertExcpetionOutput`,
//			type: "POST",
//			data: JSON.stringify({
//				loginid: loginid,
//				sabun: sabun,
//				list: iidList,
//				memo: "LOADEXCEPTION-UNLOAD"
//			}),
//			contentType: "application/json",
//			success: function(data) {
//				//				loadUnloadedPage(1);
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performUnloadListDBSearch(searchCriteria);
//				hideLoading();
//			},
//			error: function(xhr, status, error) {
//				// ❌ alert(res.message) <- res 없음 (버그)
//				window.handleAjaxError(xhr, status, error);
//			}
//
//		});
//	} else {
//		hideLoading();
//	}
//
//});
//
