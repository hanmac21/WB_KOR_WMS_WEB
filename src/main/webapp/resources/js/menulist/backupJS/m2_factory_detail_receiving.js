///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_factory_detail_receiving 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : factoryDetailReceiving -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : FactoryDetailReceiving -> NewMenuName
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
//let globalFactoryDetailReceivingData = []; // 현재 조회된 데이터 저장
//let currentFactoryDetailReceivingPage = 1; // 현재 페이지
//let factoryDetailReceivingItemsPerPage = 1000; // 페이지당 항목 수
//let totalFactoryDetailReceivingCount = 0; // 서버에서 받은 총 개수 저장
//let totalFactoryDetailReceivingQty = 0; // 서버에서 받은 총 개수 저장
//let totalFactoryDetailReceivingPages = 0; // 서버에서 받은 총 페이지
//
//let menuType = null;
//let saveStorageForInit = null;
//window.filteredFactoryDetailReceivingData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.factoryDetailReceivingColumns = [
//	{ key: 'SDATE', header: 'sdate' },
//	{ key: 'FACTORY', header: 'factory' },
//	{ key: 'STORAGE', header: 'storage' },
//	{ key: 'CAR', header: 'car' },
//	{ key: 'ITEMCODE', header: 'itemcode' },
//	{ key: 'ITEMNAME', header: 'itemname' },
//	{ key: 'QTY', header: 'qty' },
//	{ key: 'LOGINID', header: 'user' },
//	{ key: 'HHMM', header: 'hh:mm' },
//	{ key: 'BARCODE', header: 'lot' }
//];
//
//$(document).ready(function() {
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_factory_detail_receiving = function(menuId) {
//		showLoading("data");
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		performFactoryDetailReceivingDBSearch({ fromDate, toDate, factory });
//	}
//
//	// ✅ 또는 이벤트 리스너로 받기
//	document.addEventListener('menuTypeChanged', function(e) {
//		console.log("Menu Type:", e.detail.menuType);
//		menuType = e.detail.menuType;
//		console.log("Data Matching:", e.detail.dataMatching);
//	});
//});
//
//
//// DB에서 데이터 조회하는 함수
//function performFactoryDetailReceivingDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_factoryDetailReceiving",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentFactoryDetailReceivingPage,
//			itemsPerPage: factoryDetailReceivingItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalFactoryDetailReceivingData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalFactoryDetailReceivingCount = data.totalCount || 0;
//			totalFactoryDetailReceivingQty = data.totalQty || 0;
//			totalFactoryDetailReceivingPages = data.totalPages || 0;
//			currentFactoryDetailReceivingPage = data.currentPage || 0;
//			window.filteredFactoryDetailReceivingData = globalFactoryDetailReceivingData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_factory_detail_receiving').length) {
//				renderFactoryDetailReceivingView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderFactoryDetailReceivingTableData();
//				renderFactoryDetailReceivingPagination();
//				updateFactoryDetailReceivingTotalCount();
//				updateFactoryDetailReceivingTotalQty();
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
//function renderFactoryDetailReceivingView() {
//	let loginid = $(".loginId").text().trim().toLowerCase();
//
//	let btnHtml = "";
//	if (loginid == "wms") {
//		btnHtml = `
//            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminFactoryReceivingDelete"/>
//        `;
//	}
//
//	let content_output = `
//		<div class="divBlockControl" id="view_m2_factory_detail_receiving">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<div class="search-label">
//							<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//							<input type="date" id="factoryDetailReceiving_searchVal_fromDate" /> 
//						</div>
//						<div class="search-label">
//							<div class="searchVal_toDate">　</div>
//							<input type="date" id="factoryDetailReceiving_searchVal_toDate" />
//						</div>
//						<!--<div class="search-label m2_factory_detail_receiving">
//							<div class="search_factoryDetailReceivingCondition">${i18n.t('search.input.status')} 불출상태 </div>
//							<select id="factoryDetailReceiving_searchVal_Condition" >
//								<option value="">${i18n.t('search.all')}전체</option>
//								<option value="N">${i18n.t('search.input.waiting')} 불출 대기중</option>
//								<option value="Y">${i18n.t('search.input.completed')} 불출 완료 </option>
//							</select>
//						</div>-->
//						<div class="search-label">
//							<div class="searchVal_factory">${i18n.t('search.factory')}</div>
//							<select id="factoryDetailReceiving_searchVal_factory" >
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//								<option value="all">${i18n.t('search.all')} </option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//							<select id="factoryDetailReceiving_searchVal_storage" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="factoryDetailReceiving_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="factoryDetailReceiving_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="factoryDetailReceiving_searchVal_itemname" />
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnFactoryDetailReceivingSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnFactoryDetailReceivingSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<span>${i18n.t('table.info.total')} <strong id="factoryDetailReceivingTotalCount">${totalFactoryDetailReceivingCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="factoryDetailReceivingCurrentPageInfo">${currentFactoryDetailReceivingPage}</strong>/<strong id="factoryDetailReceivingTotalPageInfo">${totalFactoryDetailReceivingPages}</strong> | 
//							${i18n.t('table.info.qty')} : <strong id = "factoryDetailReceivingTotalQty"></strong>
//						</span>
//						<div class="action-buttons-right m2_factory_detail_receiving">
//							<div id="defaultActions" class="action-group">
//								${btnHtml}
//								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnFactoryReceivingDelete"/>
//								<button class="btn btn-success" id="factoryDetailReceivingExcelBtn" onclick="downloadAllFactoryDetailReceivingData()">Excel</button>
//							</div>
//						</div>
//						<div class="btnInterfaceCommon btnFactoryReceivingItemsArea" style="margin-left:24px;">
//							<!-- <input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfFactoryReceiving"/> -->
//							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfFactoryReceivingDelete"/>
//						</div>
//					</div>
//					<table class="data-table m2_factory_detail_receiving">
//						<thead>
//							<tr>
//								<th class = "checkboxVal">
//									<input type="checkbox" class="factoryReceiving_chkAll">
//								</th> 
//								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//								<th class = "statusVal">${i18n.t('table.status')}<!-- CONFIRMYN --> </th>
//								<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
//								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = "qtyVal">${i18n.t('search.qty')}<!-- Qty --></th>
//								<th class = "loginidVal">${i18n.t('search.user')}<!-- LOGINID --></th>
//								<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>
//								<th class = "barcodeVal">${i18n.t('table.lot')}<!-- LOT --></th>
//							</tr>
//						</thead>
//						<tbody id="factoryDetailReceivingTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="factoryDetailReceivingPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="factoryDetailReceivingExcelBtn" onclick="ExcelExporter.downloadExcel(filteredFactoryDetailReceivingData, factoryDetailReceivingColumns, {fileName:'FactoryDetailReceiving', sheetName:'FactoryDetailReceiving'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#factoryDetailReceiving_searchVal_fromDate").val(fromDate);
//		$("#factoryDetailReceiving_searchVal_toDate").val(toDate);
//	})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderFactoryDetailReceivingTableData();
//	// 페이지네이션 렌더링
//	renderFactoryDetailReceivingPagination();
//	// 이벤트 바인딩
//	bindFactoryDetailReceivingEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateFactoryDetailReceivingTotalCount();
//	// 초기 렌더링 후 수량 업데이트
//	updateFactoryDetailReceivingTotalQty();
//
//}
//
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//	const factory = $('#factoryDetailReceiving_searchVal_factory');
//	const storage = $('#factoryDetailReceiving_searchVal_storage');
//	const savedFactory = getCookie('selectedFactory');
//
//	// 공장별 창고 옵션 설정
//	function updateStorageOptions(factoryValue) {
//		storage.empty();
//
//		const options = {
//			'SALTILLO': ['all', 'Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'Material+Sideseat+Outside', 'P1 W/HOUSE'],
//			'PUEBLA': ['all', 'Material', 'PRODUCT'],
//			'': ['all', 'Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'PRODUCT', 'Material+Sideseat+Outside', 'P1 W/HOUSE']
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
//		//storage.val(storageList[0]);
//
//		// ✅ menuType에 따라 storage 설정
//		console.log(menuType)
//		if (menuType === "purchase") {
//			saveStorageForInit = "Material";
//			$("#factoryDetailReceiving_searchVal_storage").val('Material');
//		} else if (menuType === "fabric") {
//			saveStorageForInit = "Fabric";
//			$("#factoryDetailReceiving_searchVal_storage").val('Fabric');
//		} else if (menuType === "sales") {
//			saveStorageForInit = "P1 W/HOUSE";
//			$("#factoryDetailReceiving_searchVal_storage").val('P1 W/HOUSE');
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
//function updateFactoryDetailReceivingTotalCount() {
//	$('#factoryDetailReceivingTotalCount').text(totalFactoryDetailReceivingCount.toLocaleString());
//}
//// 총 개수를 업데이트하는 함수
//function updateFactoryDetailReceivingTotalQty() {
//	$('#factoryDetailReceivingTotalQty').text(totalFactoryDetailReceivingQty.toLocaleString());
//}
//function renderFactoryDetailReceivingTableData() {
//	let tableBody = "";
//
//	//console.log("globalFactoryDetailReceivingData:", globalFactoryDetailReceivingData);
//	//console.log("데이터 개수:", globalFactoryDetailReceivingData.length);
//
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalFactoryDetailReceivingData.length; i++) {
//		let rowNumber = (currentFactoryDetailReceivingPage - 1) * factoryDetailReceivingItemsPerPage + i + 1;
//		let data = globalFactoryDetailReceivingData[i];
//
//		let statusText = data.intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
//		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
//
//		//console.log(`행 ${i}:`, globalFactoryDetailReceivingData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//        <tr>
//			<td class = "checkboxVal"><input type="checkbox" class="factoryReceiving_chk ${statusClass}" 
//				data-unique="${data.sdate}_${data.itemcode}_${data.intf_yn}_${data.qty}_${data.factory}_${data.storage}_${data.barcode}_${data.source}"
//	    		data-delete="${data.iid}_${data.sdate}_${data.factory}_${data.storage}_${data.barcode}">
//			</td>			
//			<td class = "noVal">${rowNumber}</td>
//			<td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
//            <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
//			<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
//			<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
//			<td class = "carVal">${data.CAR || data.car || ''}</td>
//			<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
//			<td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
//			<td class = "qtyVal">${data.QTY || data.qty || ''}</td>
//			<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
//			<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
//			<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
//        </tr>
//    `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#factoryDetailReceivingTableBody").html(tableBody);
//
//	// 전체 선택 해제
//	$('.factoryReceiving_chkAll').prop('checked', false);
//}
//
//// 페이지네이션 렌더링
//function renderFactoryDetailReceivingPagination() {
//	let totalPages = Math.ceil(totalFactoryDetailReceivingCount / factoryDetailReceivingItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentFactoryDetailReceivingPage > 1) {
//		paginationHtml += `<button class="factoryDetailReceiving-page-btn" data-page="${currentFactoryDetailReceivingPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="factoryDetailReceiving-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentFactoryDetailReceivingPage - 5);
//	let endPage = Math.min(totalPages, currentFactoryDetailReceivingPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="factoryDetailReceiving-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentFactoryDetailReceivingPage) {
//			paginationHtml += `<button class="factoryDetailReceiving-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="factoryDetailReceiving-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="factoryDetailReceiving-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentFactoryDetailReceivingPage < totalPages) {
//		paginationHtml += `<button class="factoryDetailReceiving-page-btn" data-page="${currentFactoryDetailReceivingPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="factoryDetailReceiving-page-btn disabled">&gt;</button>`;
//	}
//
//	$('#factoryDetailReceivingCurrentPageInfo').text(currentFactoryDetailReceivingPage);
//	$('#factoryDetailReceivingTotalPageInfo').text(totalPages);
//	$("#factoryDetailReceivingPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindFactoryDetailReceivingEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.factoryReceiving_chkAll').on('change', '.factoryReceiving_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.factoryReceiving_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.factoryReceiving_chk').on('change', '.factoryReceiving_chk', function() {
//		let totalCheckboxes = $('.factoryReceiving_chk').length;
//		let checkedCheckboxes = $('.factoryReceiving_chk:checked').length;
//		$('.factoryReceiving_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnFactoryDetailReceivingSearch").off('click').on('click', function() {
//		performFactoryDetailReceivingSearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnFactoryDetailReceivingSearchInit").off('click').on('click', function() {
//		resetFactoryDetailReceivingSearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.factoryDetailReceiving-page-btn').on('click', '.factoryDetailReceiving-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentFactoryDetailReceivingPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performFactoryDetailReceivingDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_factory_detail_receiving input[type="text"], #view_m2_factory_detail_receiving input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performFactoryDetailReceivingSearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		/*confirm_yn : $("#factoryDetailReceiving_searchVal_Condition").val(),*/
//		fromDate: $("#factoryDetailReceiving_searchVal_fromDate").val(),
//		toDate: $("#factoryDetailReceiving_searchVal_toDate").val(),
//		factory: $("#factoryDetailReceiving_searchVal_factory").val(),
//		storage: $("#factoryDetailReceiving_searchVal_storage").val(),
//		car: $("#factoryDetailReceiving_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#factoryDetailReceiving_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#factoryDetailReceiving_searchVal_itemname").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performFactoryDetailReceivingSearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentFactoryDetailReceivingPage = 1;
//	performFactoryDetailReceivingDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetFactoryDetailReceivingSearch() {
//	const { fromDate, toDate } = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//
//	$("#factoryDetailReceiving_searchVal_Condition").val(""),
//		$("#factoryDetailReceiving_searchVal_fromDate").val(fromDate);
//	$("#factoryDetailReceiving_searchVal_toDate").val(toDate);
//	$("#factoryDetailReceiving_searchVal_factory").val(factory)
//	$("#factoryDetailReceiving_searchVal_storage").val(saveStorageForInit)
//	$("#factoryDetailReceiving_searchVal_car").val('');
//	$("#factoryDetailReceiving_searchVal_itemcode").val('');
//	$("#factoryDetailReceiving_searchVal_itemname").val('');
//	// =
//	// 초기화 후 전체 데이터 다시 조회
//	currentFactoryDetailReceivingPage = 1;
//	performFactoryDetailReceivingDBSearch({ fromDate, toDate, factory, storage: saveStorageForInit });
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
//window.changeFactoryDetailReceivingItemsPerPage = function(newItemsPerPage) {
//	factoryDetailReceivingItemsPerPage = newItemsPerPage;
//	currentFactoryDetailReceivingPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performFactoryDetailReceivingDBSearch(searchCriteria);
//}
//
//window.exportFactoryDetailReceivingData = function() {
//	return {
//		total: globalFactoryDetailReceivingData.length,
//		currentPage: currentFactoryDetailReceivingPage,
//		itemsPerPage: factoryDetailReceivingItemsPerPage,
//		data: globalFactoryDetailReceivingData
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
//window.downloadAllFactoryDetailReceivingData = function() {
//	let searchCriteria = {
//		confirm_yn: $("#factoryDetailReceiving_searchVal_Condition").val(),
//		fromDate: $("#factoryDetailReceiving_searchVal_fromDate").val(),
//		toDate: $("#factoryDetailReceiving_searchVal_toDate").val(),
//		factory: $("#factoryDetailReceiving_searchVal_factory").val(),
//		storage: $("#factoryDetailReceiving_searchVal_storage").val(),
//		car: $("#factoryDetailReceiving_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#factoryDetailReceiving_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#factoryDetailReceiving_searchVal_itemname").val().trim().toUpperCase()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_factoryDetailReceiving_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.factoryDetailReceivingColumns, {
//				fileName: 'FactoryDetailReceiving_All',
//				sheetName: 'FactoryDetailReceiving'
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
////데이터 삭제
//$(document).on("click", ".btnFactoryReceivingDelete", function() {
//
//	const iidList = [];
//	const uniqueList = [];
//	$(".factoryReceiving_chk:checked").each(function() {
//		let iid = $(this).data('delete');
//		iidList.push(iid);
//	});
//
//	$(".factoryReceiving_chk:checked").each(function() {
//		let unique = $(this).data('unique');
//		const row = unique.split("_");
//		uniqueList.push(row[8]);
//	});
//
//	/*for(i=0; i<uniqueList.length; i++) {
//		// 이거 체크해서 돌려보내는것 부터
//		
//		if(uniqueList[i] != 'RECEVING'){
//			return
//		}
//	}*/
//
//
//	// 인퍼테이스 사용 시 주석 해제
//	if ($(".status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//
//
//	// 체크된 요소가 없으면 경고창 표시 후 리턴
//	if (iidList.length === 0) {
//		alert(i18n.t('validation.no.select.items'));
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
//		url: "/deleteFactoryReceiving",
//		type: "POST",
//		data: JSON.stringify({
//			loginid: loginid,
//			iidList:iidList}),
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
//			performFactoryDetailReceivingDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.factoryReceiving_chkAll').prop('checked', false);
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
//$(document).on("click", ".btnAdminFactoryReceivingDelete", function() {
//
//	const iidList = [];
//	$(".factoryReceiving_chk:checked").each(function() {
//		let iid = $(this).data('delete');
//		iidList.push(iid);
//	});
//
//	// 인퍼테이스 사용 시 주석 해제
//	if ($(".status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//
//	// 체크된 요소가 없으면 경고창 표시 후 리턴
//	if (iidList.length === 0) {
//		alert(i18n.t('validation.no.select.items'));
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
//
//	console.log(iidList)
//	$.ajax({
//		url: "/deleteFactoryReceiving",
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
//				performFactoryDetailReceivingDBSearch(searchVal);
//
//				// 전체 선택 해제
//				$('.factoryReceiving_chkAll').prop('checked', false);
//			} else {
//				alert("삭제에 실패했습니다.");
//			}
//		},
//		error: function(xhr, status, error) {
//			console.log("🔥 LOCAL ajax error:", status, error);
//			console.log("Response:", xhr.responseText);
//
//			const message = "An error occurred while processing the request.\n\n"
//				+ "Details:\n"
//				+ (xhr.responseText || error || status || "Unknown error");
//
//			// 🔹 기본 alert 대신 커스텀 모달 사용
//			window.showCopyableAlert(message);
//
//			hideLoading();
//		}
//	});
//});
//
////인터페이스 등록
//$(document).on("click", ".btnIntfFactoryReceiving", function() {
//
//	if ($(".factoryReceiving_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items'));
//		return;
//	}
//
//	const iidList = [];
//	$(".factoryReceiving_chk:checked").each(function() {
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
//		url: "/factoryReceiving_confirm_summary",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performFactoryDetailReceivingDBSearch(searchVal);
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
////인터페이스 등록 취소
//$(document).on("click", ".btnIntfFactoryReceivingDelete", function() {
//
//	if ($(".factoryReceiving_chk.status-waiting:checked").length > 0) {
//		alert(i18n.t('validation.unconfirm.items'));
//		return;
//	}
//
//	const iidList = [];
//	$(".factoryReceiving_chk:checked").each(function() {
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
//		url: "/factoryReceiving_confirm_summary_cancel",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performFactoryDetailReceivingDBSearch(searchVal);
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//
//	});
//
//});
