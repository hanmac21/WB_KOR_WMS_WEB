///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_storage_summary 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : storageSummary -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : StorageSummary -> NewMenuName
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
//
//let globalStorageSummaryData = []; // 현재 조회된 데이터 저장
//let currentStorageSummaryPage = 1; // 현재 페이지
//let storageSummaryItemsPerPage = 1000; // 페이지당 항목 수
//let totalStorageSummaryCount = 0; // 서버에서 받은 총 개수 저장
//let totalStorageSummaryQty = 0; // 서버에서 받은 총 개수 저장
//let totalStorageSummaryPages = 0; // 서버에서 받은 총 페이지
//let menuType = null;
//let saveStorageForInit = null;
//let pendingStorageSummaryInit = false;
//window.filteredStorageSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.storageSummaryColumns = [
//	{ key: 'SDATE', header: 'sdate' },
//	{ key: 'FACTORY', header: 'factory' },
//	{ key: 'STORAGE1', header: 'from storage' },
//	{ key: 'STORAGE2', header: 'to storage' },
//	{ key: 'CAR', header: 'car' },
//	{ key: 'ITEMCODE', header: 'itemcode' },
//	{ key: 'ITEMNAME', header: 'itemname' },
//	{ key: 'QTY', header: 'qty' },
//];
//
//$(document).ready(function() {
//	// 👉 실제 조회 함수
//	function initStorageSummarySearch() {
//		showLoading("data");
//		const { fromDate, toDate } = getDefaultDateRange();
//		const factory = getCookie('selectedFactory');
//
//		// ✅ 메뉴 타입별 기본 STORAGE 지정
//		let storage2 = 'all';
//		if (menuType === 'sales') {
//			storage2 = 'P1 W/HOUSE';
//		}
//
//		performStorageSummaryDBSearch({ fromDate, toDate, factory, storage2 });
//	}
//
//	// 메인 호출 함수 - 메뉴 클릭 시 호출
//	window.call_m2_storage_summary = function(menuId) {
//		// 이 메뉴는 열렸다 → 플래그만 세팅
//		pendingStorageSummaryInit = true;
//
//		// menuType 아직 없으면 대기
//		if (!menuType) {
//			return;
//		}
//
//		// menuType 이미 있으면 바로 조회
//		initStorageSummarySearch();
//	};
//
//	// ✅ 메뉴 타입 변경 이벤트 (한 번만 등록)
//	document.addEventListener('menuTypeChanged', function(e) {
//		menuType = e.detail.menuType;
//		
//		// 메뉴는 이미 눌려 있고, menuType만 늦게 들어온 경우
//		if (pendingStorageSummaryInit) {
//			pendingStorageSummaryInit = false;
//			initStorageSummarySearch();
//		}
//	});
//});
//
//// DB에서 데이터 조회하는 함수
//function performStorageSummaryDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_storageSummary",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentStorageSummaryPage,
//			itemsPerPage: storageSummaryItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalStorageSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalStorageSummaryCount = data.totalCount || 0;
//			totalStorageSummaryQty = data.totalQty || 0;
//			totalStorageSummaryPages = data.totalPages || 0;
//			currentStorageSummaryPage = data.currentPage || 0;
//			window.filteredStorageSummaryData = globalStorageSummaryData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_storage_summary').length) {
//				renderStorageSummaryView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderStorageSummaryTableData();
//				renderStorageSummaryPagination();
//				updateStorageSummaryTotalCount();
//				updateStorageSummaryTotalQty();
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
//function renderStorageSummaryView() {
//	let content_output = `
//		<div class="divBlockControl" id="view_m2_storage_summary">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<div class="search-label">
//							<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//							<input type="date" id="storageSummary_searchVal_fromDate" /> 
//						</div>
//						<div class="search-label">
//							<div class="searchVal_toDate">　</div>
//							<input type="date" id="storageSummary_searchVal_toDate" />
//						</div>
//						<!-- <div class="search-label">
//							<div class="search_storageSummaryCondition">${i18n.t('search.input.status')}상태</div>
//							<select id="storageSummary_searchVal_condition" >
//								<option value="">${i18n.t('search.all')} 전체 </option>
//								<option value="N">${i18n.t('search.input.waiting')} 대기중</option>
//								<option value="Y">${i18n.t('search.input.completed')} 완료 </option>
//							</select>
//						</div>-->
//						<div class="search-label">
//							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="storageSummary_searchVal_factory" class="factory-select">
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//							</select>
//						</div>							
//						<div class="search-label">
//							<div class="searchVal_storage">${i18n.t('search.storage.from')}<!-- FROM STORAGE --></div>
//							<select id="storageSummary_searchVal_storage1" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_storage">${i18n.t('search.storage.to')}<!-- TO STORAGE --></div>
//							<select id="storageSummary_searchVal_storage2" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="storageSummary_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="storageSummary_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="storageSummary_searchVal_itemname" />
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnStorageSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnStorageSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<span>${i18n.t('table.info.total')} <strong id="storageSummaryTotalCount">${totalStorageSummaryCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="storageSummaryCurrentPageInfo">${currentStorageSummaryPage}</strong>/<strong id="storageSummaryTotalPageInfo">${totalStorageSummaryPages}</strong> | 
//							${i18n.t('table.info.qty')} : <strong id = "storageSummaryTotalQty"></strong>
//						</span>
//						<div class="action-buttons-right m2_storage_summary">
//							<div id="defaultActions" class="action-group">
//								<button class="btn btn-success" id="storageSummaryExcelBtn" onclick="downloadAllStorageSummaryData()">Excel</button>
//							</div>
//						</div>
//						<!--<div class="btnInterfaceCommon btnStorageItemsArea" style="margin-left:24px;">
//							<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfStorage"/>
//							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfStorageDelete"/>
//						</div>-->
//					</div>
//					<table class="data-table m2_storage_summary">
//						<thead>
//							<tr>
//								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//								<!-- <th class = "statusVal">${i18n.t('table.status')}<!-- 상태 </th>-->
//								<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
//								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = "storageVal">${i18n.t('search.storage.from')}<!-- From STORAGE --></th>
//								<th class = "storageVal">${i18n.t('search.storage.to')}<!-- To STORAGE --></th>
//								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = "itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//							</tr>
//						</thead>
//						<tbody id="storageSummaryTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="storageSummaryPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="storageSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredStorageSummaryData, storageSummaryColumns, {fileName:'StorageSummary', sheetName:'StorageSummary'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function(){
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#storageSummary_searchVal_fromDate").val(fromDate);
//		$("#storageSummary_searchVal_toDate").val(toDate);
//		})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();	
//	// 테이블 데이터 렌더링
//	renderStorageSummaryTableData();
//	// 페이지네이션 렌더링
//	renderStorageSummaryPagination();
//	// 이벤트 바인딩
//	bindStorageSummaryEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateStorageSummaryTotalCount();
//	// 초기 렌더링 후 수량 업데이트
//	updateStorageSummaryTotalQty();
//
//}
//
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//    const factory = $('#storageSummary_searchVal_factory');
//    const storage1 = $('#storageSummary_searchVal_storage1');
//    const storage2 = $('#storageSummary_searchVal_storage2');
//    const savedFactory = getCookie('selectedFactory');
//
//    // 공장별 창고 옵션 설정
//    function updateStorageOptions(factoryValue) {
//        storage1.empty();
//        storage2.empty();
//        
//        const options = {
//            'SALTILLO': ['all', 'Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'P1 W/HOUSE', 'REDCAGE'],
//            'PUEBLA': ['all', 'Material', 'PRODUCT'],
//            '': ['all', 'Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'P1 W/HOUSE', 'REDCAGE', 'PRODUCT']
//        };
//        
//        const storageList = options[factoryValue] || options[''];
//        
//        storageList.forEach(item => {
//            const text = item === 'all' ? i18n.t('search.all') : item;
//            storage1.append(`<option value="${item}">${text}</option>`);
//            storage2.append(`<option value="${item}">${text}</option>`);
//        });
//        
//        // 첫 번째 옵션 선택 (Material)
////        storage.val(storageList[0]);
//        saveStorageForInit = 'all'
//        
//		if (menuType === "sales") {
//			saveStorageForInit = "P1 W/HOUSE";
//			storage.val('P1 W/HOUSE');
//		}
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
//}
//
//// 정규식으로 쿠기 가져오기
//function getCookie(cookieName) {
//    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//    return match ? decodeURIComponent(match[2]) : '';
//}
//
//// 총 개수를 업데이트하는 함수
//function updateStorageSummaryTotalCount() {
//	$('#storageSummaryTotalCount').text(totalStorageSummaryCount);
//}
//// 총 개수를 업데이트하는 함수
//function updateStorageSummaryTotalQty() {
//	$('#storageSummaryTotalQty').text(totalStorageSummaryQty.toLocaleString());
//}
//function renderStorageSummaryTableData() {
//	let tableBody = "";
//
//	//console.log("globalStorageSummaryData:", globalStorageSummaryData);
//	//console.log("데이터 개수:", globalStorageSummaryData.length);
//
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalStorageSummaryData.length; i++) {
//		let rowNumber = (currentStorageSummaryPage - 1) * storageSummaryItemsPerPage + i + 1;
//
//		//console.log(`행 ${i}:`, globalStorageSummaryData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//        <tr>
//            <td class = "noVal">${rowNumber}</td>
//            <td class = "dateVal">${globalStorageSummaryData[i].SDATE || globalStorageSummaryData[i].sdate || ''}</td>
//			<td class = "factoryVal">${globalStorageSummaryData[i].FACTORY || globalStorageSummaryData[i].factory || ''}</td>
//			<td class = "storageVal">${globalStorageSummaryData[i].STORAGE1 || globalStorageSummaryData[i].storage1 || ''}</td>
//			<td class = "storageVal">${globalStorageSummaryData[i].STORAGE2 || globalStorageSummaryData[i].storage2 || ''}</td>
//			<td class = "carVal">${globalStorageSummaryData[i].CAR || globalStorageSummaryData[i].car || ''}</td>
//			<td class = "itemcodeVal">${globalStorageSummaryData[i].ITEMCODE || globalStorageSummaryData[i].itemcode || ''}</td>
//			<td class = "itemnameLongVal">${globalStorageSummaryData[i].ITEMNAME || globalStorageSummaryData[i].itemname || ''}</td>
//			<td class = "qtyVal">${Number(globalStorageSummaryData[i].QTY || globalStorageSummaryData[i].qty || 0).toLocaleString()}</td>
//        </tr>
//    `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#storageSummaryTableBody").html(tableBody);
//}
//
//// 페이지네이션 렌더링
//function renderStorageSummaryPagination() {
//	let totalPages = Math.ceil(totalStorageSummaryCount / storageSummaryItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentStorageSummaryPage > 1) {
//		paginationHtml += `<button class="storageSummary-page-btn" data-page="${currentStorageSummaryPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="storageSummary-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentStorageSummaryPage - 5);
//	let endPage = Math.min(totalPages, currentStorageSummaryPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="storageSummary-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentStorageSummaryPage) {
//			paginationHtml += `<button class="storageSummary-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="storageSummary-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="storageSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentStorageSummaryPage < totalPages) {
//		paginationHtml += `<button class="storageSummary-page-btn" data-page="${currentStorageSummaryPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="storageSummary-page-btn disabled">&gt;</button>`;
//	}
//
//	$('#storageSummaryTotalPageInfo').text(totalPages);
//	$("#storageSummaryPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindStorageSummaryEvents() {	
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnStorageSummarySearch").off('click').on('click', function() {
//		performStorageSummarySearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnStorageSummarySearchInit").off('click').on('click', function() {
//		resetStorageSummarySearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.storageSummary-page-btn').on('click', '.storageSummary-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentStorageSummaryPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performStorageSummaryDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_storage_summary input[type="text"], #view_m2_storage_summary input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performStorageSummarySearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		/*intf_yn: $("#storageSummary_searchVal_condition").val(),*/
//		fromDate: $("#storageSummary_searchVal_fromDate").val(),
//		toDate: $("#storageSummary_searchVal_toDate").val(),
//		factory : $("#storageSummary_searchVal_factory").val(),
//		storage1 : $("#storageSummary_searchVal_storage1").val(),
//		storage2 : $("#storageSummary_searchVal_storage2").val(),
//		car : $("#storageSummary_searchVal_car").val().trim().toUpperCase(),
//		itemcode : $("#storageSummary_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#storageSummary_searchVal_itemname").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performStorageSummarySearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentStorageSummaryPage = 1;
//	performStorageSummaryDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetStorageSummarySearch() {
//	const { fromDate, toDate } = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//
//	$("#storageSummary_searchVal_condition").val('');
//	$("#storageSummary_searchVal_fromDate").val(fromDate);
//	$("#storageSummary_searchVal_toDate").val(toDate);
//	$("#storageSummary_searchVal_storage1").val('all'); 
//	$("#storageSummary_searchVal_storage2").val(saveStorageForInit); 
//	$("#storageSummary_searchVal_car").val(''); 
//	$("#storageSummary_searchVal_itemcode").val(''); 
//	$("#storageSummary_searchVal_itemname").val(''); 
//	// =
//	// 초기화 후 전체 데이터 다시 조회
//	currentStorageSummaryPage = 1;
//	performStorageSummaryDBSearch({ fromDate, toDate, factory });
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
//window.changeStorageSummaryItemsPerPage = function(newItemsPerPage) {
//	storageSummaryItemsPerPage = newItemsPerPage;
//	currentStorageSummaryPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performStorageSummaryDBSearch(searchCriteria);
//}
//
//window.exportStorageSummaryData = function() {
//	return {
//		total: globalStorageSummaryData.length,
//		currentPage: currentStorageSummaryPage,
//		itemsPerPage: storageSummaryItemsPerPage,
//		data: globalStorageSummaryData
//	};
//}
//
//function fmtLocalDate(d){
//	const y = d.getFullYear();
//	const m = String(d.getMonth()+1).padStart(2,'0');
//	const dd = String(d.getDate()).padStart(2,'0');
//	return `${y}-${m}-${dd}`;
//}
//
//function getDefaultDateRange(){
//	const today = new Date();
//	const toDate = fmtLocalDate(today);
//	const fromDate = fmtLocalDate(today);
//	return { fromDate, toDate };
//}
//
//window.downloadAllStorageSummaryData = function() {
//	let searchCriteria = {
//		fromDate : $("#storageSummary_searchVal_fromDate").val(),
//		toDate : $("#storageSummary_searchVal_toDate").val(),
//		factory : $("#storageSummary_searchVal_factory").val(),
//		storage1 : $("#storageSummary_searchVal_storage1").val(),
//		storage2 : $("#storageSummary_searchVal_storage2").val(),
//		car : $("#storageSummary_searchVal_car").val().trim().toUpperCase(),
//		itemcode : $("#storageSummary_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#storageSummary_searchVal_itemname").val().trim().toUpperCase()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_storageSummary_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.storageSummaryColumns, {
//				fileName: 'StorageSummary_All',
//				sheetName: 'StorageSummary'
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
//////인터페이스 등록
////$(document).on("click", ".btnIntfStorage", function() {
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
////	$(".storage_chk:checked").each(function() {
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
////		url: "/storage_confirm_summary",
////		type: "POST",
////		data: JSON.stringify(iidList),
////		contentType: "application/json",
////		success: function(data) {
////			let searchVal = getCurrentSearchCriteria();
////			performStorageSummaryDBSearch(searchVal);			
////
////			$('.storage_chkAll').prop('checked', false);
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
////$(document).on("click", ".btnIntfStorageDelete", function() {
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
////	$(".storage_chk:checked").each(function() {
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
////		url: "/storage_confirm_summary_cancel",
////		type: "POST",
////		data: JSON.stringify(iidList),
////		contentType: "application/json",
////		success: function(data) {
////			let searchVal = getCurrentSearchCriteria();
////			performStorageSummaryDBSearch(searchVal);	
////
////			$('.storage_chkAll').prop('checked', false);
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