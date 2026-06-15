///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_storage_detail 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : storageDetail -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : StorageDetail -> NewMenuName
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
//let globalStorageDetailData = []; // 현재 조회된 데이터 저장
//let currentStorageDetailPage = 1; // 현재 페이지
//let storageDetailItemsPerPage = 1000; // 페이지당 항목 수
//let totalStorageDetailCount = 0; // 서버에서 받은 총 개수 저장
//let totalStorageDetailQty = 0; // 서버에서 받은 총 개수 저장
//let totalStorageDetailPages = 0; // 서버에서 받은 총 페이지
//let menuType = null;
//let saveStorageForInit = null;
//let pendingStorageDetailInit = false;
//window.filteredStorageDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.storageDetailColumns = [
//	{ key: 'INTF_YN', header: 'status' },
//	{ key: 'SDATE', header: 'date' },
//	{ key: 'FACTORY', header: 'factory' },
//	{ key: 'STORAGE1', header: 'storage1' },
//	{ key: 'STORAGE2', header: 'storage2' },
//	{ key: 'CAR', header: 'car' },
//	{ key: 'ITEMCODE', header: 'itemcode' },
//	{ key: 'ITEMNAME', header: 'itemname' },
//	{ key: 'QTY', header: 'qty' },
//	{ key: 'LOGINID', header: 'user' },
//	{ key: 'HHMM', header: 'hh:mm' },
//	{ key: 'BARCODE', header: 'barcode' },
//];
//
//$(document).ready(function() {	
//	// 👉 실제 조회 함수
//	function initStorageDetailSearch() {
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
//		performStorageDetailDBSearch({ fromDate, toDate, factory, storage2 });
//	}
//
//	// 메인 호출 함수 - 메뉴 클릭 시 호출
//	window.call_m2_storage_detail = function(menuId) {
//		// 이 메뉴는 열렸다 → 플래그만 세팅
//		pendingStorageDetailInit = true;
//
//		// menuType 아직 없으면 대기
//		if (!menuType) {
//			return;
//		}
//
//		// menuType 이미 있으면 바로 조회
//		initStorageDetailSearch();
//	};
//
//	// ✅ 메뉴 타입 변경 이벤트 (한 번만 등록)
//	document.addEventListener('menuTypeChanged', function(e) {
//		menuType = e.detail.menuType;
//		
//		// 메뉴는 이미 눌려 있고, menuType만 늦게 들어온 경우
//		if (pendingStorageDetailInit) {
//			pendingStorageDetailInit = false;
//			initStorageDetailSearch();
//		}
//	});
//});
//
//
//// DB에서 데이터 조회하는 함수
//function performStorageDetailDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_storageDetail",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentStorageDetailPage,
//			itemsPerPage: storageDetailItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalStorageDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalStorageDetailCount = data.totalCount || 0;
//			totalStorageDetailQty = data.totalQty || 0;
//			totalStorageDetailPages = data.totalPages || 0;
//			currentStorageDetailPage = data.currentPage || 0;
//			window.filteredStorageDetailData = globalStorageDetailData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_storage_detail').length) {
//				renderStorageDetailView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderStorageDetailTableData();
//				renderStorageDetailPagination();
//				updateStorageDetailTotalCount();
//				updateStorageDetailTotalQty();
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
//function renderStorageDetailView() {
//	let loginid = $(".loginId").text().trim().toLowerCase();
//
//	let btnHtml = "";
//	if (loginid == "wms") {
//		btnHtml = `
//            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminStorageDelete"/>
//        `;
//	}
//	let content_output = `
//		<div class="divBlockControl" id="view_m2_storage_detail">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<div class="search-label">
//							<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//							<input type="date" id="storageDetail_searchVal_fromDate" /> 
//						</div>
//						<div class="search-label">
//							<div class="searchVal_toDate">　</div>
//							<input type="date" id="storageDetail_searchVal_toDate" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="storageDetail_searchVal_factory" class="factory-select">
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_storage">${i18n.t('search.storage.from')}<!-- STORAGE --></div>
//							<select id="storageDetail_searchVal_storage1" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_storage">${i18n.t('search.storage.to')}<!-- STORAGE --></div>
//							<select id="storageDetail_searchVal_storage2" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="storageDetail_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="storageDetail_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="storageDetail_searchVal_itemname" />
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnStorageDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnStorageDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<span>${i18n.t('table.info.total')} <strong id="storageDetailTotalCount">${totalStorageDetailCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="storageDetailCurrentPageInfo">${currentStorageDetailPage}</strong>/<strong id="storageDetailTotalPageInfo">${totalStorageDetailPages}</strong> | 
//							${i18n.t('table.info.qty')} : <strong id = "storageDetailTotalQty"></strong>
//						</span>
//						<div class="action-buttons-right m2_storage_detail">
//							<div id="defaultActions" class="action-group">
//								${btnHtml}
//								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnStorageDelete"/>
//								<button class="btn btn-success" id="storageDetailExcelBtn" onclick="downloadAllStorageDetailData()">Excel</button>
//							</div>
//						</div>
//						<div class="btnInterfaceCommon btnStorageItemsArea" style="margin-left:24px;">
//							<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfStorage"/>
//							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfStorageDelete"/>
//						</div>
//					</div>
//					<table class="data-table m2_storage_detail">
//						<thead>
//							<tr>
//								<th class = "checkboxVal">
//									<input type="checkbox" class="storage_chkAll">
//								</th>
//								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//								<th class = "statusVal">${i18n.t('table.status')}<!-- 상태 --></th>
//								<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
//								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = "storageVal">${i18n.t('search.storage.from')}<!-- FROM STORAGE --></th>
//								<th class = "storageVal">${i18n.t('search.storage.to')}<!-- TO STORAGE --></th>
//								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = "itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//								<th class = "loginidVal">${i18n.t('search.user')}<!-- USER --></th>
//								<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>
//								<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- LOT --></th>
//							</tr>
//						</thead>
//						<tbody id="storageDetailTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="storageDetailPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="storageDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredStorageDetailData, storageDetailColumns, {fileName:'StorageDetail', sheetName:'StorageDetail'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#storageDetail_searchVal_fromDate").val(fromDate);
//		$("#storageDetail_searchVal_toDate").val(toDate);
//	})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderStorageDetailTableData();
//	// 페이지네이션 렌더링
//	renderStorageDetailPagination();
//	// 이벤트 바인딩
//	bindStorageDetailEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateStorageDetailTotalCount();
//	// 초기 렌더링 후 수량 업데이트
//	updateStorageDetailTotalQty();
//
//}
//
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//	const factory = $('#storageDetail_searchVal_factory');
//	const storage1 = $('#storageDetail_searchVal_storage1');
//	const storage2 = $('#storageDetail_searchVal_storage2');
//	const savedFactory = getCookie('selectedFactory');
//
//	// 공장별 창고 옵션 설정
//	function updateStorageOptions(factoryValue) {
//		storage1.empty();
//		storage2.empty();
//
//		const options = {
//			'SALTILLO': ['all', 'Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'P1 W/HOUSE', 'REDCAGE'],
//			'PUEBLA': ['all', 'Material', 'PRODUCT'],
//			'': ['all', 'Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'P1 W/HOUSE', 'REDCAGE', 'PRODUCT']
//		};
//
//		const storageList = options[factoryValue] || options[''];
//
//		storageList.forEach(item => {
//			const text = item === 'all' ? i18n.t('search.all') : item;
//			storage1.append(`<option value="${item}">${text}</option>`);
//			storage2.append(`<option value="${item}">${text}</option>`);
//		});
//
//		// 첫 번째 옵션 선택 (Material)
////		storage.val(storageList[0]);
//		
//		if (menuType === "sales") {
//			saveStorageForInit = "P1 W/HOUSE";
//			storage2.val('P1 W/HOUSE');
//		}
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
//}
//
//// 정규식으로 쿠기 가져오기
//function getCookie(cookieName) {
//	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//	return match ? decodeURIComponent(match[2]) : '';
//}
//
//// 총 개수를 업데이트하는 함수
//function updateStorageDetailTotalCount() {
//	$('#storageDetailTotalCount').text(Number(totalStorageDetailCount).toLocaleString());
//}
//// 총 개수를 업데이트하는 함수
//function updateStorageDetailTotalQty() {
//	$('#storageDetailTotalQty').text(totalStorageDetailQty.toLocaleString());
//}
//function renderStorageDetailTableData() {
//	let tableBody = "";
//
//	//console.log("globalStorageDetailData:", globalStorageDetailData);
//	//console.log("데이터 개수:", globalStorageDetailData.length);
//
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalStorageDetailData.length; i++) {
//		let rowNumber = (currentStorageDetailPage - 1) * storageDetailItemsPerPage + i + 1;
//		let data = globalStorageDetailData[i];
//
//		let statusText = data.intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
//		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
//
//		//console.log(`행 ${i}:`, globalStorageDetailData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//        <tr>
//            <td class = "checkboxVal"><input type="checkbox" class="storage_chk ${statusClass}" 
//    			data-unique="${data.sdate}_${data.itemcode}_${data.intf_yn}_${data.qty}_${data.factory}_${data.storage2}_${data.storage1}_${data.barcode}_${data.mes_key}"
//    			data-delete="${data.iid}_${data.sdate}_${data.factory}_${data.storage2}_${data.barcode}">
//    		</td>
//		    <td class = "noVal">${rowNumber}</td>
//		    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
//            <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
//			<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
//			<td class = "storageVal">${data.STORAGE1 || data.storage1 || ''}</td>
//			<td class = "storageVal">${data.STORAGE2 || data.storage2 || ''}</td>
//			<td class = "carVal">${data.CAR || data.car || ''}</td>
//			<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
//			<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
//			<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//			<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td><!-- LOGINID -->
//			<td class = "hhmmVal">${data.hhmm || data.hhmm || ''}</td><!-- HHMM -->
//			<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td><!-- LOT -->
//        </tr>
//    `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#storageDetailTableBody").html(tableBody);
//	$('.storage_chkAll').prop('checked', false);
//}
//
//// 페이지네이션 렌더링
//function renderStorageDetailPagination() {
//	let totalPages = Math.ceil(totalStorageDetailCount / storageDetailItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentStorageDetailPage > 1) {
//		paginationHtml += `<button class="storageDetail-page-btn" data-page="${currentStorageDetailPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="storageDetail-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentStorageDetailPage - 5);
//	let endPage = Math.min(totalPages, currentStorageDetailPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="storageDetail-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentStorageDetailPage) {
//			paginationHtml += `<button class="storageDetail-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="storageDetail-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="storageDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentStorageDetailPage < totalPages) {
//		paginationHtml += `<button class="storageDetail-page-btn" data-page="${currentStorageDetailPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="storageDetail-page-btn disabled">&gt;</button>`;
//	}
//
//	$('#storageDetailCurrentPageInfo').text(currentStorageDetailPage);
//	$('#storageDetailTotalPageInfo').text(totalPages);
//	$("#storageDetailPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindStorageDetailEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.storage_chkAll').on('change', '.storage_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.storage_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.storage_chk').on('change', '.storage_chk', function() {
//		let totalCheckboxes = $('.storage_chk').length;
//		let checkedCheckboxes = $('.storage_chk:checked').length;
//		$('.storage_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnStorageDetailSearch").off('click').on('click', function() {
//		performStorageDetailSearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnStorageDetailSearchInit").off('click').on('click', function() {
//		resetStorageDetailSearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.storageDetail-page-btn').on('click', '.storageDetail-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentStorageDetailPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performStorageDetailDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_storage_detail input[type="text"], #view_m2_storage_detail input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performStorageDetailSearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		fromDate: $("#storageDetail_searchVal_fromDate").val(),
//		toDate: $("#storageDetail_searchVal_toDate").val(),
//		factory: $("#storageDetail_searchVal_factory").val(),
//		storage1: $("#storageDetail_searchVal_storage1").val(),
//		storage2: $("#storageDetail_searchVal_storage2").val(),
//		car: $("#storageDetail_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#storageDetail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#storageDetail_searchVal_itemname").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performStorageDetailSearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentStorageDetailPage = 1;
//	performStorageDetailDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetStorageDetailSearch() {
//	const { fromDate, toDate } = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//
//	$("#storageDetail_searchVal_fromDate").val(fromDate);
//	$("#storageDetail_searchVal_toDate").val(toDate);
//	$("#storageDetail_searchVal_factory").val(factory);
//	$("#storageDetail_searchVal_storage1").val('all');
//	$("#storageDetail_searchVal_storage2").val(saveStorageForInit);
//	$("#storageDetail_searchVal_car").val('');
//	$("#storageDetail_searchVal_itemcode").val('');
//	$("#storageDetail_searchVal_itemname").val('');
//	// =
//	// 초기화 후 전체 데이터 다시 조회
//	currentStorageDetailPage = 1;
//	performStorageDetailDBSearch({ fromDate, toDate, factory });
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
//window.changeStorageDetailItemsPerPage = function(newItemsPerPage) {
//	storageDetailItemsPerPage = newItemsPerPage;
//	currentStorageDetailPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performStorageDetailDBSearch(searchCriteria);
//}
//
//window.exportStorageDetailData = function() {
//	return {
//		total: globalStorageDetailData.length,
//		currentPage: currentStorageDetailPage,
//		itemsPerPage: storageDetailItemsPerPage,
//		data: globalStorageDetailData
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
//window.downloadAllStorageDetailData = function() {
//	let searchCriteria = {
//		fromDate: $("#storageDetail_searchVal_fromDate").val(),
//		toDate: $("#storageDetail_searchVal_toDate").val(),
//		factory: $("#storageDetail_searchVal_factory").val(),
//		storage1: $("#storageDetail_searchVal_storage1").val(),
//		storage2: $("#storageDetail_searchVal_storage2").val(),
//		car: $("#storageDetail_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#storageDetail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#storageDetail_searchVal_itemname").val().trim().toUpperCase()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_storageDetail_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.storageDetailColumns, {
//				fileName: 'StorageDetail_All',
//				sheetName: 'StorageDetail'
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
////삭제
//$(document).on("click", ".btnStorageDelete", function() {
//	let checkedLength = $(".storage_chk:checked").length;
//	const iidList = [];
//
//	// 체크된 요소가 없으면 경고창 표시 후 리턴
//	if (checkedLength === 0) {
//		alert(i18n.t('validation.no.select.items'));
//		return;
//	}
//	let stopFlag = true;
//
//	$(".storage_chk:checked").each(function() {
//
//		let unique = $(this).data("unique");
//		const uniqueSplit = unique.split("_");
//
//		let intf_yn = uniqueSplit[2];
//
//		if (intf_yn == 'Y') {
//			stopFlag = false;
//		} else {
//			let iid = $(this).data('delete');
//			iidList.push(iid);
//
//		}
//
//	});
//
//	if (!stopFlag) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		return;
//	}
//
//	if (!confirm(i18n.t('confirmation.items.delete'))) {
//		return;
//	}
//
//	showLoading("data");
//	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
//	console.log(iidList)
//	$.ajax({
//		url: "/deleteStorage",
//		type: "POST",
//		data: JSON.stringify({
//			iidList: iidList,
//			loginid: loginid
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			if (!data.success) {
//				hideLoading();
//
//				let message = "";
//
//				// 검증 실패
//				if (data.failList && data.failList.length > 0) {
//					message = "Some items cannot be deleted\n\n"; // 삭제할 수 없는 항목이 있습니다.
//
//					data.failList.forEach(function(item) {
//						if (item.failReason === 'INVALID_KIND') {
//							alert(`Code Error!`);
//							return;
//						} else if (item.failReason === 'POST_PROCESSING') {
//							message += `- Post-processing data exists\n${item.barcode}\n`; // 후처리 데이터 존재
//						} else if (item.failReason === 'MAGAM') {
//							message += `- Monthly closing completed\n${item.barcode}\n`; // 월 마감 완료
//						}
//					});
//
//				}
//				// 삭제 실패
//				else if (data.failReason === 'DELETE_FAILED') {
//					message = "Failed to delete\n\n";
//					message += `Operation: ${data.failedOperation}\n`;
//					message += `Barcode: ${data.failedBarcode}\n\n`;
//				}
//
//				alert(message);
//				return;
//			}
//
//			let searchVal = getCurrentSearchCriteria();
//			performStorageDetailDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.storage_chkAll').prop('checked', false);
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//
//	});
//});
//
//
//// 관리자용 삭제
//$(document).on("click", ".btnAdminStorageDelete", function() {
//	let checkedLength = $(".storage_chk:checked").length;
//	const iidList = [];
//
//	// 체크된 요소가 없으면 경고창 표시 후 리턴
//	if (checkedLength === 0) {
//		alert(i18n.t('validation.no.select.items'));
//		return;
//	}
//	let stopFlag = true;
//
//	$(".storage_chk:checked").each(function() {
//
//		let unique = $(this).data("unique");
//		const uniqueSplit = unique.split("_");
//
//		let intf_yn = uniqueSplit[2];
//
//		if (intf_yn == 'Y') {
//			stopFlag = false;
//		} else {
//			let iid = $(this).data('delete');
//			iidList.push(iid);
//
//		}
//
//	});
//
//	if (!stopFlag) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		return;
//	}
//
//	if (!confirm(i18n.t('confirmation.items.delete'))) {
//		return;
//	}
//
//	const reason = prompt("사유를 입력해 주세요");
//
//	if (reason === null) return;
//
//	if (reason.trim() === "") {
//		alert("내용이 비어 있습니다.");
//		return;
//	}
//
//	showLoading("data");
//
//	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
//	console.log(iidList)
//	$.ajax({
//		url: "/deleteStorage",
//		type: "POST",
//		data: JSON.stringify({
//			iidList: iidList,
//			loginid: loginid,
//			reason: reason,
//			admin: true
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			hideLoading();
//			if (data.success) {
//				alert("삭제 완료");
//
//				let searchVal = getCurrentSearchCriteria();
//				performStorageDetailDBSearch(searchVal);
//
//				// 전체 선택 해제
//				$('.storage_chkAll').prop('checked', false);
//			} else {
//				alert("삭제에 실패했습니다.");
//			}
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//
//	});
//});
//
//
////인터페이스 등록
//$(document).on("click", ".btnIntfStorage", function() {
//
//	if ($(".storage_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items'));
//		return;
//	}
//
//	const iidList = [];
//	$(".storage_chk:checked").each(function() {
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
//	if (!confirm(i18n.t('confirmation.interface.progress'))) {
//		return;
//	}
//
//	showLoading("data");
//
//	console.log(iidList)
//	$.ajax({
//		url: "/storage_confirm_summary",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performStorageDetailDBSearch(searchVal);
//
//			$('.storage_chkAll').prop('checked', false);
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//
//	});
//
//});
//
////인터페이스 등록 취소
//$(document).on("click", ".btnIntfStorageDelete", function() {
//
//	if ($(".storage_chk.status-waiting:checked").length > 0) {
//		alert(i18n.t('validation.unconfirm.items'));
//		return;
//	}
//
//	const iidList = [];
//	$(".storage_chk:checked").each(function() {
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
//	if (!confirm(i18n.t('confirmation.interface.progress'))) {
//		return;
//	}
//
//	showLoading("data");
//
//	console.log(iidList)
//	$.ajax({
//		url: "/storage_confirm_summary_cancel",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performStorageDetailDBSearch(searchVal);
//
//			$('.storage_chkAll').prop('checked', false);
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//
//	});
//
//});