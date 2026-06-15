///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_load_return_detail 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : loadReturnDetail -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : LoadReturnDetail -> NewMenuName
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
//let globalLoadReturnDetailData = []; // 현재 조회된 데이터 저장
//let currentLoadReturnDetailPage = 1; // 현재 페이지
//let loadReturnDetailItemsPerPage = 1000; // 페이지당 항목 수
//let totalLoadReturnDetailCount = 0; // 서버에서 받은 총 개수 저장
//let totalLoadReturnDetailTotalPages = 0; // 서버에서 받은 총 개수 저장
//let menuType = null;
//let saveStorageForInit = null;
//window.filteredLoadReturnDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.loadReturnDetailColumns = [
//	{ key: 'OUTDATE', header: 'Date' },
//	{ key: 'FACTORY', header: 'factory' },
//	{ key: 'STORAGE', header: 'storage' },
//	{ key: 'CNAME', header: 'Supplier' },
//	{ key: 'SPEC', header: 'Supplier Code' },
//	{ key: 'CAR', header: 'car' },       // c.subname_ch AS car
//	{ key: 'ITEMCODE', header: 'itemcode' },
//	{ key: 'ITEMNAME', header: 'itemname' },
//	{ key: 'QTY', header: 'qty' },
//	{ key: 'LOGINID', header: 'User' },
//	{ key: 'HHMM', header: 'hhmm' },
//	{ key: 'TYPE', header: 'type' },
//	{ key: 'BARCODE', header: 'lot' }
//];
//
//$(document).ready(function() {
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_load_return_detail = function(menuId) {
//		showLoading("data");
//
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		performLoadReturnDetailDBSearch({ fromDate, toDate, factory });
//
//		// ✅ 또는 이벤트 리스너로 받기
//		document.addEventListener('menuTypeChanged', function(e) {
//			console.log("Menu Type:", e.detail.menuType);
//			menuType = e.detail.menuType;
//			console.log("Data Matching:", e.detail.dataMatching);
//			
//			// 뷰가 렌더링 되어있으면 메뉴 타입에 따라 번역 업데이트
//		    if ($('.loadReturnDetail_label_cname').length) {
//		    	console.log("업데이트 함");
//		    	updateLoadReturnDetailTextByMenuType();
//		    }
//		});
//	}
//});
//
//// DB에서 데이터 조회하는 함수
//function performLoadReturnDetailDBSearch(searchCriteria) {
//	showLoading("data");
//	$.ajax({
//		url: "/read_loadReturnDetail",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentLoadReturnDetailPage,
//			itemsPerPage: loadReturnDetailItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalLoadReturnDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalLoadReturnDetailCount = data.totalCount || 0;
//			window.filteredLoadReturnDetailData = globalLoadReturnDetailData;
//
//			totalLoadReturnDetailTotalPages = data.totalPages;
//			currentLoadReturnDetailPage = data.currentPage;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_load_return_detail').length) {
//				renderLoadReturnDetailView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderLoadReturnDetailTableData();
//				renderLoadReturnDetailPagination();
//				updateLoadReturnDetailTotalCount();
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
//function renderLoadReturnDetailView() {
//	let loginid = $(".loginId").text().trim().toLowerCase();
//
//	let btnHtml = "";
//	if (loginid == "wms") {
//		btnHtml = `
//            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminLoadReturnDetailDelete"/>
//        `;
//	}
//	let content_output = `
//		<div class="divBlockControl" id="view_m2_load_return_detail">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<div class="search-label" style="width:32%">
//							<div class="load_RD_searchVal_fromToDate">${i18n.t('search.date')}<!-- FromTo --></div>
//							<div class="load_RD_searchVal_fromToDateArea">
//								<input type="date" id="load_RD_searchVal_fromDate"/>
//								<span class="middleWave">~</span>
//								<input type="date" id="load_RD_searchVal_toDate"/>
//							</div>
//						</div>
//						<div class="search-label">
//							<div class="load_RD_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="load_RD_searchVal_factory" class="factory-select">
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="load_RD_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//							<select id="load_RD_searchVal_storage" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_cname loadReturnDetail_label_cname">${i18n.t('search.suppliername')}<!-- CNAME --></div>
//							<input type="text" id="load_RD_searchVal_cname" />
//						</div>
//						<div class="search-label">
//							<div class="load_RD_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="load_RD_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="load_RD_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="load_RD_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="load_RD_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="load_RD_searchVal_itemname" />
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnLoadReturnDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnLoadReturnDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<span>${i18n.t('table.info.total')} <strong id="loadReturnDetailTotalCount">${totalLoadReturnDetailCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="loadReturnDetailCurrentPageInfo">${currentLoadReturnDetailPage}</strong>/<strong id="loadReturnDetailTotalPageInfo">${totalLoadReturnDetailTotalPages}</strong> |  
//							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="loadReturnDetailTotalQty" style="color:#007bff"></span>
//						</span>
//						<div class="action-buttons-right m2_load_return_detail">
//							<div id="defaultActions" class="action-group">
//								${btnHtml}
//								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnLoadReturnDetailDelete"/>
//								<button class="btn btn-success" id="loadReturnDetailExcelBtn" onclick="downloadAllLoadReturnDetailData()">Excel</button>
//							</div>
//						</div>
//					</div>
//					<table class="data-table m2_load_return_detail">
//						<thead>
//							<tr>
//								<th class = "checkboxVal">
//									<input type="checkbox" class="loadReturnDetail_chkAll">
//								</th>
//								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//								<th class = "statusVal">${i18n.t('table.status')}</th>
//								<th class = "dateVal">${i18n.t('search.date')}<!-- INDATE --></th>
//								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//								<th class = 'itemcodeVal loadReturnDetail_label_cname'>${i18n.t('search.suppliername')}<!-- CNAME --></th>
//								<th class = "itemcodeVal">${i18n.t('search.custcode')}<!-- CCODE --></th>
//								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//								<th class = "loginidVal">${i18n.t('search.user')}<!-- USER --></th>
//								<th class = "hhmmVal">Time<!-- HHMM --></th>
//								<th class = "typeVal">${i18n.t('search.type')}<!-- TYPE --></th>
//								<th class = "barcodeVal">${i18n.t('table.lot')}<!-- LOT --></th>
//							</tr>
//						</thead>
//						<tbody id="loadReturnDetailTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="loadReturnDetailPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	/*<div class="search-label">
//							<div class="load_RD_searchVal_username">${i18n.t('search.username')}<!-- USERNAME --></div>
//							<input type="text" id="load_RD_searchVal_username" />
//						</div>*/
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="loadReturnDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredLoadReturnDetailData, loadReturnDetailColumns, {fileName:'LoadReturnDetail', sheetName:'LoadReturnDetail'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#load_RD_searchVal_fromDate").val(fromDate);
//		$("#load_RD_searchVal_toDate").val(toDate);
//	})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderLoadReturnDetailTableData();
//	// 페이지네이션 렌더링
//	renderLoadReturnDetailPagination();
//	// 이벤트 바인딩
//	bindLoadReturnDetailEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateLoadReturnDetailTotalCount();
//	// mentType에 따라 텍스트 업데이트
//	updateLoadReturnDetailTextByMenuType();
//}
//
//// mentType에 따라 텍스트 업데이트
//function updateLoadReturnDetailTextByMenuType(){
//	let key;
//	
//	if (menuType === "purchase") {
//		key = 'search.suppliername';			// 협력사명
//	} else if (menuType === "sales") {
//		key = 'search.custname';				// 고객사명
//	}
//	
//	const label = $('.loadReturnDetail_label_cname');
//	if(label.length > 0){
//		label.text(i18n.t(key));
//	}
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
//	const factory = $('#load_RD_searchVal_factory');
//	const storage = $('#load_RD_searchVal_storage');
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
//		if (menuType === "purchase") {
//			saveStorageForInit = "Material";
//			$("#load_RD_searchVal_storage").val('Material');
//		} else if (menuType === "fabric") {
//			saveStorageForInit = "Fabric";
//			$("#load_RD_searchVal_storage").val('Fabric');
//		} else if (menuType === "sales") {
//			saveStorageForInit = "P1 W/HOUSE";
//			$("#load_RD_searchVal_storage").val('P1 W/HOUSE');
//		}
//
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
//function updateLoadReturnDetailTotalCount() {
//	$('#loadReturnDetailTotalCount').text(totalLoadReturnDetailCount);
//}
//
//function renderLoadReturnDetailTableData() {
//	let tableBody = "";
//
//	//console.log("globalLoadReturnDetailData:", globalLoadReturnDetailData);
//	//console.log("데이터 개수:", globalLoadReturnDetailData.length);
//
//	$("#loadReturnDetailCurrentPageInfo").text(currentLoadReturnDetailPage);
//	$("#loadReturnDetailTotalPageInfo").text(totalLoadReturnDetailTotalPages);
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalLoadReturnDetailData.length; i++) {
//		let rowNumber = (currentLoadReturnDetailPage - 1) * loadReturnDetailItemsPerPage + i + 1;
//		let data = globalLoadReturnDetailData[i];
//
//		let statusText = data.intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
//		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
//
//		//console.log(`행 ${i}:`, globalLoadReturnDetailData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//            <tr>
//			    <td class = "checkboxVal"><input type="checkbox" class="loadReturnDetail_chk ${statusClass}" 
//					data-unique="${data.indate}_${data.itemcode}_${data.intf_yn}_${data.qty}_${data.factory}_${data.storage}_${data.barcode}"
//					data-delete="${data.iid}_${data.outdate}_${data.factory}_${data.storage}_${data.barcode}">
//				</td>
//			    <td class = "noVal">${rowNumber}</td>
//			    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
//			    <td class = "dateVal">${data.OUTDATE || data.outdate || ''}</td>
//			    <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
//			    <td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
//			    <td class = 'itemcodeVal'>${data.CNAME || data.cname || ''}</td>
//			    <td class = "itemcodeVal">${data.SPEC || data.spec || ''}</td>
//			    <td class = "carVal">${data.CAR || data.car || ''}</td>
//			    <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
//			    <td class = "itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
//			    <td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//				<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
//			    <td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
//				<td class = "typeVal">${data.TYPE || data.type || ''}</td>
//			    <td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
//			</tr>
//        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#loadReturnDetailTableBody").html(tableBody);
//	$(".loadReturnDetail_chkAll").prop("checked", false);
//}
//
//// 페이지네이션 렌더링
//function renderLoadReturnDetailPagination() {
//	let totalPages = Math.ceil(totalLoadReturnDetailCount / loadReturnDetailItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentLoadReturnDetailPage > 1) {
//		paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="${currentLoadReturnDetailPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="loadReturnDetail-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentLoadReturnDetailPage - 5);
//	let endPage = Math.min(totalPages, currentLoadReturnDetailPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentLoadReturnDetailPage) {
//			paginationHtml += `<button class="loadReturnDetail-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentLoadReturnDetailPage < totalPages) {
//		paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="${currentLoadReturnDetailPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="loadReturnDetail-page-btn disabled">&gt;</button>`;
//	}
//
//	$("#loadReturnDetailPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindLoadReturnDetailEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.loadReturnDetail_chkAll').on('change', '.loadReturnDetail_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.loadReturnDetail_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.loadReturnDetail_chk').on('change', '.loadReturnDetail_chk', function() {
//		let totalCheckboxes = $('.loadReturnDetail_chk').length;
//		let checkedCheckboxes = $('.loadReturnDetail_chk:checked').length;
//		$('.loadReturnDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnLoadReturnDetailSearch").off('click').on('click', function() {
//		performLoadReturnDetailSearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnLoadReturnDetailSearchInit").off('click').on('click', function() {
//		resetLoadReturnDetailSearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.loadReturnDetail-page-btn').on('click', '.loadReturnDetail-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentLoadReturnDetailPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performLoadReturnDetailDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_load_return_detail input[type="text"], #view_m2_load_return_detail input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performLoadReturnDetailSearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		fromDate: $("#load_RD_searchVal_fromDate").val(),
//		toDate: $("#load_RD_searchVal_toDate").val(),
//		factory: $("#load_RD_searchVal_factory").val(),
//		storage: $("#load_RD_searchVal_storage").val(),
//		cname: $("#load_RD_searchVal_cname").val().trim().toUpperCase(),
//		car: $("#load_RD_searchVal_car").val().trim(),
//		itemcode: $("#load_RD_searchVal_itemcode").val().trim(),
//		itemname: $("#load_RD_searchVal_itemname").val().trim()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performLoadReturnDetailSearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentLoadReturnDetailPage = 1;
//	performLoadReturnDetailDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetLoadReturnDetailSearch() {
//	const {fromDate, toDate} = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//
//	$("#load_RD_searchVal_fromDate").val(fromDate);
//	$("#load_RD_searchVal_toDate").val(toDate);
//	$("#load_RD_searchVal_factory").val(factory);
//	$("#load_RD_searchVal_storage").val(saveStorageForInit);
//	$("#load_RD_searchVal_cname").val('');
//	$("#load_RD_searchVal_car").val('');
//	$("#load_RD_searchVal_itemcode").val('');
//	$("#load_RD_searchVal_itemname").val('');
//	// 초기화 후 전체 데이터 다시 조회
//	currentLoadReturnDetailPage = 1;
//	performLoadReturnDetailDBSearch({ fromDate, toDate, factory, saveStorageForInit });;
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
//window.changeLoadReturnDetailItemsPerPage = function(newItemsPerPage) {
//	loadReturnDetailItemsPerPage = newItemsPerPage;
//	currentLoadReturnDetailPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performLoadReturnDetailDBSearch(searchCriteria);
//}
//
//window.exportLoadReturnDetailData = function() {
//	return {
//		total: globalLoadReturnDetailData.length,
//		currentPage: currentLoadReturnDetailPage,
//		itemsPerPage: loadReturnDetailItemsPerPage,
//		data: globalLoadReturnDetailData
//	};
//}
//function updateTotalQty() {
//	const searchMap = getCurrentSearchCriteria();
//	if (!searchMap) {
//		searchMap = {}; // null이면 빈 객체로 변경
//	}
//
//	$.ajax({
//		url: "/updateTotalQtyLoadReturn",
//		type: "POST",
//		data: JSON.stringify(searchMap),
//		contentType: "application/json",
//		success: function(data) {
//			$(".loadReturnDetailTotalQty").text(Number(data).toLocaleString());
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
//window.downloadAllLoadReturnDetailData = function() {
//	let searchCriteria = {
//		fromDate: $("#load_RD_searchVal_fromDate").val(),
//		toDate: $("#load_RD_searchVal_toDate").val(),
//		factory: $("#load_RD_searchVal_factory").val(),
//		storage: $("#load_RD_searchVal_storage").val(),
//		cname: $("#load_RD_searchVal_cname").val().trim().toUpperCase(),
//		car: $("#load_RD_searchVal_car").val().trim(),
//		itemcode: $("#load_RD_searchVal_itemcode").val().trim(),
//		itemname: $("#load_RD_searchVal_itemname").val().trim()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_loadReturnDetail_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.loadReturnDetailColumns, {
//				fileName: 'LoadReturnDetail_All',
//				sheetName: 'LoadReturnDetail'
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
////삭제
//$(document).on("click", ".btnLoadReturnDetailDelete", function() {
//	if ($(".loadReturnDetail_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//
//	const iidList = [];
//	$(".loadReturnDetail_chk:checked").each(function() {
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
//		url: "/deleteLoadReturn",
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
//						} else if (item.failReason === 'LOAD AND OUTBOUND') {
//							message += `- Load And Location Time Different\n${item.barcode}\n`;
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
//			performLoadReturnDetailDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.loadReturnDetail_chkAll').prop('checked', false);
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
//$(document).on("click", ".btnAdminLoadReturnDetailDelete", function() {
//	if ($(".loadReturnDetail_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//
//	const iidList = [];
//	$(".loadReturnDetail_chk:checked").each(function() {
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
//    if (reason.trim() === "") {
//        alert("내용이 비어 있습니다.");
//        return;
//    }
//    
//	showLoading("data");
//
//	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
//
//	console.log(iidList)
//	$.ajax({
//		url: "/deleteLoadReturn",
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
//		        alert("삭제 완료");
//				
//		        let searchVal = getCurrentSearchCriteria();
//		        performLoadReturnDetailDBSearch(searchVal);
//		        
//		        // 전체 선택 해제
//		        $('.loadReturnDetail_chkAll').prop('checked', false);
//			} else {
//		        alert("삭제에 실패했습니다.");				
//			}
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//
//	});
//});