///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_load_detail 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : loadDetail -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : LoadDetail -> NewMenuName
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
//let globalLoadDetailData = []; // 현재 조회된 데이터 저장
//let currentLoadDetailPage = 1; // 현재 페이지
//let loadDetailItemsPerPage = 1000; // 페이지당 항목 수
//let totalLoadDetailCount = 0; // 서버에서 받은 총 개수 저장
//let totalLoadDetailQty = 0; // 서버에서 받은 총 개수 저장
//let totalLoadDetailPages = 0; // 서버에서 받은 총 페이지
//let menuType = null;
//let saveStorageForInit = null;
//let pendingLoadDetailInit = false;
//
//window.filteredLoadDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.loadDetailColumns = [
//	{ key: 'OUTDATE', header: 'Date' },
//	{ key: 'FACTORY', header: 'Factory' },
//	{ key: 'STORAGE', header: 'Storage' },
//	{ key: 'SOURCE3', header: 'Product Factory' },
//	{ key: 'CNAME', header: 'Supplier' },
//	{ key: 'SPEC', header: 'Supplier Code' },
//	{ key: 'CAR', header: 'Car' },
//	{ key: 'ITEMCODE', header: 'Itemcode' },
//	{ key: 'ITEMNAME', header: 'Itemname' },
//	{ key: 'QTY', header: 'Qty' },
//	{ key: 'LOGINID', header: 'User' },
//	{ key: 'DOCK', header: 'Dock' },
//	{ key: 'INVOICENO', header: 'Invoice No' },
//	{ key: 'CONTAINER', header: 'Container No' },
//	{ key: 'HHMM', header: 'Time' },
//	{ key: 'SOURCE3', header: 'Box No' },
//	{ key: 'TYPE', header: 'Type' },
//	{ key: 'BARCODE', header: 'Barcode' }
//];
//
//
//$(document).ready(function() {
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//
//	// 👉 실제 조회를 담당하는 내부 함수
//	function initLoadDetailSearch() {
//		showLoading("data");
//		const { fromDate, toDate } = getDefaultDateRange();
//		const factory = getCookie('selectedFactory');
//
//		// ✅ 메뉴 타입별 기본 STORAGE 지정
//		let storage = 'Material'; // 기본값
//		if (menuType === 'purchase') {
//			storage = 'Material';
//		} else if (menuType === 'fabric') {
//			storage = 'Fabric';
//		} else if (menuType === 'sales') {
//			storage = 'P1 W/HOUSE';
//		}
//
//		console.log('초기 조회 파라미터:', { fromDate, toDate, factory, storage, menuType });
//
//		performLoadDetailDBSearch({ fromDate, toDate, factory, storage });
//	}
//
//	// 메인 호출 함수 - 메뉴 클릭 시 호출
//	window.call_m2_load_detail = function(menuId) {
//		// 👉 “이 메뉴는 열렸다” 표시만 먼저 해 둠
//		pendingLoadDetailInit = true;
//
//		// 아직 menuType이 없으면 바로 나가고, 아래 이벤트에서 다시 불러줌
//		if (!menuType) {
//			console.log('menuType 없음 → menuTypeChanged 올 때까지 대기');
//			return;
//		}
//
//		// menuType 이미 있으면 바로 실행
//		initLoadDetailSearch();
//	};
//
//	// ✅ 메뉴 타입 이벤트 리스너
//	document.addEventListener('menuTypeChanged', function(e) {
//		console.log("Menu Type:", e.detail.menuType);
//		menuType = e.detail.menuType;
//		console.log("Data Matching:", e.detail.dataMatching);
//
//		// 라벨 번역
//		if ($('.loadDetail_label_cname').length) {
//			updateLoadDetailTextByMenuType();
//		}
//
//		// 👉 메뉴는 이미 열렸고(menu 클릭됨), menuType만 늦게 왔을 때
//		if (pendingLoadDetailInit) {
//			console.log('menuType 세팅 완료 → 대기 중이던 초기 조회 실행');
//			pendingLoadDetailInit = false;
//			initLoadDetailSearch();
//		}
//	});
//});
//
//// DB에서 데이터 조회하는 함수
//function performLoadDetailDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_loadDetail",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentLoadDetailPage,
//			itemsPerPage: loadDetailItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalLoadDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalLoadDetailCount = data.totalCount || 0;
//			totalLoadDetailQty = data.totalQty || 0;
//			totalLoadDetailPages = data.totalPages || 0;
//			currentLoadDetailPage = data.currentPage || 0;
//			window.filteredLoadDetailData = globalLoadDetailData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_load_detail').length) {
//				renderLoadDetailView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderLoadDetailTableData();
//				renderLoadDetailPagination();
//				updateLoadDetailTotalCount();
//				updateLoadDetailTotalQty();
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
//function renderLoadDetailView() {
//	let loginid = $(".loginId").text().trim().toLowerCase();
//
//	let btnHtml = "";
//	if (loginid == "wms") {
//		btnHtml = `
//            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminLoadDetailDelete"/>
//        `;
//	}
//	let content_output = `
//		<div class="divBlockControl" id="view_m2_load_detail">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<div class="search-label">
//							<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//							<input type="date" id="loadDetail_searchVal_fromDate" /> 
//						</div>
//						<div class="search-label">
//							<div class="searchVal_toDate">　</div>
//							<input type="date" id="loadDetail_searchVal_toDate" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="loadDetail_searchVal_factory" class="factory-select">
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//							<select id="loadDetail_searchVal_storage" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_cname loadDetail_label_source3">${i18n.t('search.productFactory')}<!-- SOURCE --></div>
//							<input type="text" id="loadDetail_searchVal_source3" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_cname loadDetail_label_cname">${i18n.t('search.suppliername')}<!-- CNAME --></div>
//							<input type="text" id="loadDetail_searchVal_cname" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="loadDetail_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="loadDetail_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="loadDetail_searchVal_itemname" />
//						</div>						
//						<div class="search-label">
//							<div class="searchVal_invoiceNo">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></div>
//							<input type="text" id="loadDetail_searchVal_invoiceNo" />
//						</div>
//					</div>
//					<div class="search_button_area">
//						<button class="btn btn-primary btnLoadDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//						<button class="btn btn-secondary btnLoadDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
//					</div>
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
//						<span>${i18n.t('table.info.total')} <strong id="loadDetailTotalCount">${totalLoadDetailCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="loadDetailCurrentPageInfo">${currentLoadDetailPage}</strong>/<strong id="loadDetailTotalPageInfo">${totalLoadDetailPages}</strong> | 
//							${i18n.t('table.info.qty')} : <strong id = "loadDetailTotalQty"></strong>
//						</span>
//						<div class="action-buttons-right m2_load_detail">
//							<div id="defaultActions" class="action-group">
//								${btnHtml}
//								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnLoadDetailDelete"/>
//								<button class="btn btn-success" id="loadDetailExcelBtn" onclick="downloadAllLoadDetailData()">Excel</button>
//							</div>
//						</div>
//					</div>
//					<table class="data-table m2_load_detail">
//						<thead>
//							<tr>
//								<th class = "checkboxVal">
//									<input type="checkbox" class="loadDetail_chkAll">
//								</th>
//								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//								<th class = "statusVal_long">${i18n.t('table.status')}</th>
//								<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
//								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//								<th class = "storageVal">${i18n.t('search.productFactory')}<!-- STORAGE --></th>
//								<th class = "storageVal loadDetail_label_cname">${i18n.t('search.suppliername')}<!-- CNAME --></th>
//								<th class = "itemcodeVal">${i18n.t('search.custcode')}<!-- CCODE --></th>
//								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//								<th class = "loginidVal">${i18n.t('search.user')}<!-- USER --></th>
//								<th class = "loginidVal">${i18n.t('search.dock')}<!-- USER --></th>
//								<th class = "loginidVal">${i18n.t('search.invoiceNo')}<!-- USER --></th>
//								<th class = "loginidVal">${i18n.t('search.containerNo')}<!-- USER --></th>
//								<th class = "hhmmVal">${i18n.t('table.time')}<!-- TIME --></th>
//								<th class = "typeVal">${i18n.t('table.seq')}<!-- TYPE --></th>
//								<th class = "typeVal">${i18n.t('search.type')}<!-- TYPE --></th>
//								<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- LOT --></th>
//							</tr>
//						</thead>
//						<tbody id="loadDetailTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="loadDetailPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="loadDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredLoadDetailData, loadDetailColumns, {fileName:'LoadDetail', sheetName:'LoadDetail'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ✅ 렌더링 후 바로 날짜 세팅
//	const { fromDate, toDate } = getDefaultDateRange();
//
//	$("#loadDetail_searchVal_fromDate").val(fromDate);
//	$("#loadDetail_searchVal_toDate").val(toDate);
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderLoadDetailTableData();
//	// 페이지네이션 렌더링
//	renderLoadDetailPagination();
//	// 이벤트 바인딩
//	bindLoadDetailEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateLoadDetailTotalCount();
//	// 초기 렌더링 후 수량 업데이트
//	updateLoadDetailTotalQty();
//	// mentType에 따라 텍스트 업데이트
//	updateLoadDetailTextByMenuType();
//}
//
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//	const factory = $('#loadDetail_searchVal_factory');
//	const storage = $('#loadDetail_searchVal_storage');
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
//		//storage.val(storageList[0]);
//
//		// ✅ menuType에 따라 storage 설정
//		console.log(menuType)
//		if (menuType === "purchase") {
//			saveStorageForInit = "Material";
//			$("#loadDetail_searchVal_storage").val('Material');
//		} else if (menuType === "fabric") {
//			saveStorageForInit = "Fabric";
//			$("#loadDetail_searchVal_storage").val('Fabric');
//		} else if (menuType === "sales") {
//			saveStorageForInit = "P1 W/HOUSE";
//			$("#loadDetail_searchVal_storage").val('P1 W/HOUSE');
//		}
//
//
//	}
//
//	// 저장된 공장 선택
//	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
//		factory.val(savedFactory); 						// TODO 250925 나중에 DB에 공장값 추가되면 주석 해제 후 아래 코드 삭제
////		factory.val('all');
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
//// mentType에 따라 텍스트 업데이트
//function updateLoadDetailTextByMenuType() {
//	let key;
//
//	if (menuType === "purchase") {
//		key = 'search.suppliername';			// 협력사명
//	} else if (menuType === "sales") {
//		key = 'search.custname';				// 고객사명
//	}
//
//	const label = $('.loadDetail_label_cname');
//	if (label.length > 0) {
//		label.text(i18n.t(key));
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
//function updateLoadDetailTotalCount() {
//	$('#loadDetailTotalCount').text(totalLoadDetailCount);
//}
//// 총 개수를 업데이트하는 함수
//function updateLoadDetailTotalQty() {
//	$('#loadDetailTotalQty').text(totalLoadDetailQty.toLocaleString());
//}
//function renderLoadDetailTableData() {
//	let tableBody = "";
//
//	//console.log("globalLoadDetailData:", globalLoadDetailData);
//	//console.log("데이터 개수:", globalLoadDetailData.length);
//
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalLoadDetailData.length; i++) {
//		let rowNumber = (currentLoadDetailPage - 1) * loadDetailItemsPerPage + i + 1;
//		let data = globalLoadDetailData[i];
//
//		let statusText = data.intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
//		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
//
//		//console.log(`행 ${i}:`, globalLoadDetailData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//        <tr>
//		    <td class = "checkboxVal"><input type="checkbox" class="loadDetail_chk ${statusClass}" 
//    			data-unique="${data.indate}_${data.itemcode}_${data.intf_yn}_${data.qty}_${data.factory}_${data.storage}_${data.barcode}"
//    			data-delete="${data.iid}_${data.outdate}_${data.factory}_${data.storage}_${data.barcode}">
//    		</td>
//		    <td class = "noVal">${rowNumber}</td>
//		    <td class = "statusVal_long"><span class="${statusClass}">${statusText}</span></td>
//            <td class = "dateVal">${data.OUTDATE || data.outdate || ''}</td>
//			<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
//			<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
//			<td class = "storageVal">${data.SOURCE3 || data.source3 || ''}</td>
//			<td class = "storageVal">${data.CNAME || data.cname || ''}</td>
//			<td class = "itemcodeVal">${data.SPEC || data.spec || ''}</td>
//			<td class = "carVal">${data.CAR || data.car || ''}</td>
//			<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
//			<td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
//			<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//			<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
//			<td class = "loginidVal">${data.DOCK || data.dock || ''}</td>
//			<td class = "loginidVal">${data.INVOICENO || data.invoiceno || ''}</td>
//			<td class = "loginidVal">${data.CONTAINER || data.container || ''}</td>
//			<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
//			<td class = "typeVal">${data.SEQ || data.seq || ''}</td>
//			<td class = "typeVal">${data.TYPE || data.type || ''}</td>
//			<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
//        </tr>
//    `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#loadDetailTableBody").html(tableBody);
//	$(".loadDetail_chkAll").prop("checked", false);
//}
//
//// 페이지네이션 렌더링
//function renderLoadDetailPagination() {
//	let totalPages = Math.ceil(totalLoadDetailCount / loadDetailItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentLoadDetailPage > 1) {
//		paginationHtml += `<button class="loadDetail-page-btn" data-page="${currentLoadDetailPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="loadDetail-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentLoadDetailPage - 5);
//	let endPage = Math.min(totalPages, currentLoadDetailPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="loadDetail-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentLoadDetailPage) {
//			paginationHtml += `<button class="loadDetail-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="loadDetail-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="loadDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentLoadDetailPage < totalPages) {
//		paginationHtml += `<button class="loadDetail-page-btn" data-page="${currentLoadDetailPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="loadDetail-page-btn disabled">&gt;</button>`;
//	}
//
//	$('#loadDetailTotalPageInfo').text(totalPages);
//	$("#loadDetailPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindLoadDetailEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.loadDetail_chkAll').on('change', '.loadDetail_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.loadDetail_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.loadDetail_chk').on('change', '.loadDetail_chk', function() {
//		let totalCheckboxes = $('.loadDetail_chk').length;
//		let checkedCheckboxes = $('.loadDetail_chk:checked').length;
//		$('.loadDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnLoadDetailSearch").off('click').on('click', function() {
//		performLoadDetailSearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnLoadDetailSearchInit").off('click').on('click', function() {
//		resetLoadDetailSearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.loadDetail-page-btn').on('click', '.loadDetail-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentLoadDetailPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performLoadDetailDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_load_detail input[type="text"], #view_m2_load_detail input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performLoadDetailSearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		fromDate: $("#loadDetail_searchVal_fromDate").val(),
//		toDate: $("#loadDetail_searchVal_toDate").val(),
//		factory: $("#loadDetail_searchVal_factory").val(),
//		storage: $("#loadDetail_searchVal_storage").val(),
//		source3: $("#loadDetail_searchVal_source3").val(),
//		cname: $("#loadDetail_searchVal_cname").val().trim().toUpperCase(),
//		car: $("#loadDetail_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#loadDetail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#loadDetail_searchVal_itemname").val().trim().toUpperCase(),
//		invoiceNo: $("#loadDetail_searchVal_invoiceNo").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performLoadDetailSearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentLoadDetailPage = 1;
//	performLoadDetailDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetLoadDetailSearch() {
//	const { fromDate, toDate } = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//	$("#loadDetail_searchVal_fromDate").val(fromDate);
//	$("#loadDetail_searchVal_toDate").val(toDate);
//	$("#loadDetail_searchVal_factory").val(factory);
//	$("#loadDetail_searchVal_storage").val(saveStorageForInit);
//	$("#loadDetail_searchVal_source3").val('');
//	$("#loadDetail_searchVal_cname").val('');
//	$("#loadDetail_searchVal_car").val('');
//	$("#loadDetail_searchVal_itemcode").val('');
//	$("#loadDetail_searchVal_itemname").val('');
//	$("#loadDetail_searchVal_invoiceNo").val('');
//	// =
//	// 초기화 후 전체 데이터 다시 조회
//	currentLoadDetailPage = 1;
//	performLoadDetailDBSearch({ fromDate, toDate, factory });
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
//window.changeLoadDetailItemsPerPage = function(newItemsPerPage) {
//	loadDetailItemsPerPage = newItemsPerPage;
//	currentLoadDetailPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performLoadDetailDBSearch(searchCriteria);
//}
//
//window.exportLoadDetailData = function() {
//	return {
//		total: globalLoadDetailData.length,
//		currentPage: currentLoadDetailPage,
//		itemsPerPage: loadDetailItemsPerPage,
//		data: globalLoadDetailData
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
//window.downloadAllLoadDetailData = function() {
//	let searchCriteria = {
//		fromDate: $("#loadDetail_searchVal_fromDate").val(),
//		toDate: $("#loadDetail_searchVal_toDate").val(),
//		factory: $("#loadDetail_searchVal_factory").val(),
//		storage: $("#loadDetail_searchVal_storage").val(),
//		car: $("#loadDetail_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#loadDetail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#loadDetail_searchVal_itemname").val().trim().toUpperCase(),
//		invoiceNo: $("#loadDetail_searchVal_invoiceNo").val().trim().toUpperCase()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_loadDetail_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.loadDetailColumns, {
//				fileName: 'LoadDetail_All',
//				sheetName: 'LoadDetail'
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
//$(document).on("click", ".btnLoadDetailDelete", function() {
//	if ($(".loadDetail_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//
//	const iidList = [];
//	$(".loadDetail_chk:checked").each(function() {
//		let iid = $(this).data('delete');
//		iidList.push(iid);
//	});
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
//
//	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
//
//	console.log(iidList)
//	$.ajax({
//		url: "/deleteLoad",
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
//			performLoadDetailDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.loadDetail_chkAll').prop('checked', false);
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
//$(document).on("click", ".btnAdminLoadDetailDelete", function() {
//	if ($(".loadDetail_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//
//	const iidList = [];
//	$(".loadDetail_chk:checked").each(function() {
//		let iid = $(this).data('delete');
//		iidList.push(iid);
//	});
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
//		url: "/deleteLoad",
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
//				performLoadDetailDBSearch(searchVal);
//
//				// 전체 선택 해제
//				$('.loadDetail_chkAll').prop('checked', false);
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
