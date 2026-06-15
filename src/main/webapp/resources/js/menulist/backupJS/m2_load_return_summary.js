///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_load_return_summary 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : loadReturnSummary -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : LoadReturnSummary -> NewMenuName
// * 4. 표시된 오류 및 = 부분 수정
// * 5. AJAX 호출명 따라 백단 코드 생성
// * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
// * 
// * 백단 참고사항
// * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
// * 
// * 아래 Document Ready 부터 복 붙
// * -------------------------------------------------------------- */
//let globalLoadReturnSummaryData = []; // 현재 조회된 데이터 저장
//let currentLoadReturnSummaryPage = 1; // 현재 페이지
//let loadReturnSummaryItemsPerPage = 1000; // 페이지당 항목 수
//let totalLoadReturnSummaryCount = 0; // 서버에서 받은 총 개수 저장
//let totalLoadReturnSummaryTotalPages = 0; // 서버에서 받은 총 개수 저장
//
//let menuType = null;
//let saveStorageForInit = null;
//
//$(document).ready(function() {
//
//	window.filteredLoadReturnSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//	window.loadReturnSummaryColumns = [
//		{ key: 'OUTDATE', header: 'outdate' },
//		{ key: 'FACTORY', header: 'factory' },
//		{ key: 'STORAGE', header: 'storage' },
//		{ key: 'CNAME', header: 'Supplier' },
//		{ key: 'SPEC', header: 'Supplier Code' },
//		{ key: 'CAR', header: 'car' },       // c.subname_ch AS car
//		{ key: 'ITEMCODE', header: 'itemcode' },
//		{ key: 'ITEMNAME', header: 'itemname' },
//		{ key: 'QTY', header: 'qty' },
//		{ key: 'TYPE', header: 'type' },
//	];
//
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_load_return_summary = function(menuId) {
//		showLoading("data");
//
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		performLoadReturnSummaryDBSearch({ fromDate, toDate, factory });
//
//		// ✅ 또는 이벤트 리스너로 받기
//		document.addEventListener('menuTypeChanged', function(e) {
//			console.log("Menu Type:", e.detail.menuType);
//			menuType = e.detail.menuType;
//			console.log("Data Matching:", e.detail.dataMatching);
//			
//			// 뷰가 렌더링 되어있으면 메뉴 타입에 따라 번역 업데이트
//		    if ($('.loadReturnSummary_label_cname').length) {
//		    	updateLoadReturnSummaryTextByMenuType();
//		    }
//		});
//	}
//});
//
//// DB에서 데이터 조회하는 함수
//function performLoadReturnSummaryDBSearch(searchCriteria) {
//	showLoading("data");
//	$.ajax({
//		url: "/read_loadReturnSummary",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentLoadReturnSummaryPage,
//			itemsPerPage: loadReturnSummaryItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalLoadReturnSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalLoadReturnSummaryCount = data.totalCount || 0;
//			window.filteredLoadReturnSummaryData = globalLoadReturnSummaryData;
//
//			totalLoadReturnSummaryTotalPages = data.totalPages;
//			currentLoadReturnSummaryPage = data.currentPage;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_load_return_summary').length) {
//				renderLoadReturnSummaryView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderLoadReturnSummaryTableData();
//				renderLoadReturnSummaryPagination();
//				updateLoadReturnSummaryTotalCount();
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
//function renderLoadReturnSummaryView() {
//	let content_output = `
//			<div class="divBlockControl" id="view_m2_load_return_summary">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label" style="width:35%">
//								<div class="load_RS_searchVal_fromToDate">${i18n.t('search.date')}<!-- FromTo --></div>
//								<div class="load_RS_searchVal_fromToDateArea">
//									<input type="date" id="load_RS_searchVal_fromDate"/>
//									<span class="middleWave">~</span>
//									<input type="date" id="load_RS_searchVal_toDate"/>
//								</div>
//							</div>
//							<!-- <div class="search-label m3_loadReturn_summary">
//								<div class="search_loadReturnCondition">${i18n.t('search.input.status')}불출상태 </div>
//								<select id="load_RS_searchVal_Condition" >
//									<option value="">${i18n.t('search.all')}전체</option>
//									<option value="N">${i18n.t('search.input.waiting')}불출 대기중</option>
//									<option value="Y">${i18n.t('search.input.completed')}불출 완료</option>
//								</select>
//							</div>-->
//							<div class="search-label">
//								<div class="load_RS_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//								<select id="load_RS_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="load_RS_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="load_RS_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_cname loadReturnSummary_label_cname">${i18n.t('search.suppliername')}<!-- CNAME --></div>
//								<input type="text" id="load_RS_searchVal_cname" />
//							</div>
//							<div class="search-label">
//								<div class="load_RS_searchVal_type">${i18n.t('search.type')}<!-- TYPE --></div>
//								<input type="text" id="load_RS_searchVal_type" />
//							</div>
//							<div class="search-label">
//								<div class="load_RS_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="load_RS_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="load_RS_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="load_RS_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="load_RS_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="load_RS_searchVal_itemname" />
//							</div>
//						</div>
//							<div class="search_button_area">
//								<button class="btn btn-primary btnLoadReturnSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//								<button class="btn btn-secondary btnLoadReturnSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//							<span>${i18n.t('table.info.total')} <strong id="loadReturnSummaryTotalCount">${totalLoadReturnSummaryCount}</strong> ${i18n.t('table.info.records')} | 
//								${i18n.t('table.page')} <strong id="loadReturnSummaryCurrentPageInfo">${currentLoadReturnSummaryPage}</strong>/<strong id="loadReturnSummaryTotalPageInfo">${totalLoadReturnSummaryTotalPages}</strong> |  
//								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="loadReturnSummaryTotalQty" style="color:#007bff"></span>
//							</span>
//							<div class="action-buttons-right m2_load_return_summary">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="loadReturnSummaryExcelBtn" onclick="downloadAllLoadReturnSummaryData()">Excel</button>
//								</div>
//							</div>
//							<!--<div class="btnInterfaceCommon btnLoadReturnSummaryItemsArea" style="margin-left:24px;">
//								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfLoadReturnSummary"/>
//								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfLoadReturnSummaryDelete"/>
//							</div>-->
//						</div>
//						<table class="data-table m2_load_return_summary">
//							<thead>
//								<tr>	
//									<!-- <th class = "checkboxVal">
//										<input type="checkbox" class="loadReturnSummary_chkAll">
//									</th> -->
//									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//									<!-- <th class = "statusVal">${i18n.t('table.status')}STATUS</th>-->
//									<th class = "dateVal">${i18n.t('search.date')}<!-- INDATE --></th>
//									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//									<th class = 'itemcodeVal loadReturnSummary_label_cname'>${i18n.t('search.suppliername')}<!-- CNAME --></th>
//									<th class = "itemcodeVal">${i18n.t('search.custcode')}<!-- CCODE --></th>
//									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//									<th class = "typeVal">${i18n.t('search.type')}<!-- TYPE --></th>
//								</tr>
//							</thead>
//							<tbody id="loadReturnSummaryTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="loadReturnSummaryPaginationContainer">
//						</div>
//					</div>
//				</div>
//			</div>
//		`;
//	/*<div class="search-label">
//							<div class="load_RS_searchVal_username">${i18n.t('search.username')}<!-- USERNAME --></div>
//							<input type="text" id="load_RS_searchVal_username" />
//						</div>*/
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="loadReturnSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredLoadReturnSummaryData, loadReturnSummaryColumns, {fileName:'LoadReturnSummary', sheetName:'LoadReturnSummary'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#load_RS_searchVal_fromDate").val(fromDate);
//		$("#load_RS_searchVal_toDate").val(toDate);
//	})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderLoadReturnSummaryTableData();
//	// 페이지네이션 렌더링
//	renderLoadReturnSummaryPagination();
//	// 이벤트 바인딩
//	bindLoadReturnSummaryEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateLoadReturnSummaryTotalCount();
//	// mentType에 따라 텍스트 업데이트
//	updateLoadReturnSummaryTextByMenuType();
//}
//
//// mentType에 따라 텍스트 업데이트
//function updateLoadReturnSummaryTextByMenuType(){
//	let key;
//	
//	if (menuType === "purchase") {
//		key = 'search.suppliername';			// 협력사명
//	} else if (menuType === "sales") {
//		key = 'search.custname';				// 고객사명
//	}
//	
//	const label = $('.loadReturnSummary_label_cname');
//	if(label.length > 0){
//		label.text(i18n.t(key));
//	}
//}
//
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
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//	const factory = $('#load_RS_searchVal_factory');
//	const storage = $('#load_RS_searchVal_storage');
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
//		console.log(menuType)
//		if (menuType === "purchase") {
//			saveStorageForInit = "Material";
//			$("#load_RS_searchVal_storage").val('Material');
//		} else if (menuType === "fabric") {
//			saveStorageForInit = "Fabric";
//			$("#load_RS_searchVal_storage").val('Fabric');
//		} else if (menuType === "sales") {
//			saveStorageForInit = "P1 W/HOUSE";
//			$("#load_RS_searchVal_storage").val('P1 W/HOUSE');
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
//
//// 총 개수를 업데이트하는 함수
//function updateLoadReturnSummaryTotalCount() {
//	$('#loadReturnSummaryTotalCount').text(totalLoadReturnSummaryCount);
//}
//
//function renderLoadReturnSummaryTableData() {
//	let tableBody = "";
//
//	//console.log("globalLoadReturnSummaryData:", globalLoadReturnSummaryData);
//	//console.log("데이터 개수:", globalLoadReturnSummaryData.length);
//
//	$("#loadReturnSummaryCurrentPageInfo").text(currentLoadReturnSummaryPage);
//	$("#loadReturnSummaryTotalPageInfo").text(totalLoadReturnSummaryTotalPages);
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalLoadReturnSummaryData.length; i++) {
//		let rowNumber = (currentLoadReturnSummaryPage - 1) * loadReturnSummaryItemsPerPage + i + 1;
//		let un = globalLoadReturnSummaryData[i];
//		let statusText = un.confirm_yn === 'Y' ? 'Completed' : 'Waiting';
//		let statusClass = un.confirm_yn === 'Y' ? 'status-completed' : 'status-waiting';
//		//console.log(`행 ${i}:`, globalLoadSummaryData[i]); // 각 행 데이터 확인
//
//		//console.log(`행 ${i}:`, un); // 각 행 데이터 확인
//
//		tableBody += `
//	            <tr>
//	            	<!-- <td class = "checkboxVal"><input type="checkbox" class="loadReturnSummary_chk ${statusClass}" 
//            			data-unique="${un.outdate}_${un.itemcode}_${un.confirm_yn}_${un.qty}_${un.factory}_${un.storage}"></td> -->
//				    <td class = "noVal">${rowNumber}</td>
//				    <!--<td class = "statusVal"><span class="${statusClass}">${statusText}</span></td-->
//				    <td class = "dateVal">${un.OUTDATE || un.outdate || ''}</td>
//				    <td class = "factoryVal">${un.FACTORY || un.factory || ''}</td>
//				    <td class = "storageVal">${un.STORAGE || un.storage || ''}</td>
//			    	<td class = 'itemcodeVal'>${un.CNAME || un.cname || ''}</td>
//			    	<td class = "itemcodeVal">${un.SPEC || un.spec || ''}</td>
//				    <td class = "carVal">${un.CAR || un.car || ''}</td>
//				    <td class = "itemcodeVal">${un.ITEMCODE || un.itemcode || ''}</td>
//				    <td class = "itemnameVal">${un.ITEMNAME || un.itemname || ''}</td>
//				    <td class = "qtyVal">${Number(un.QTY || un.qty || 0).toLocaleString()}</td>
//					<td class = "typeVal">${un.TYPE || un.type || ''}</td>
//				</tr>
//	        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#loadReturnSummaryTableBody").html(tableBody);
//}
//
//// 페이지네이션 렌더링
//function renderLoadReturnSummaryPagination() {
//	let totalPages = Math.ceil(totalLoadReturnSummaryCount / loadReturnSummaryItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentLoadReturnSummaryPage > 1) {
//		paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="${currentLoadReturnSummaryPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="loadReturnSummary-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentLoadReturnSummaryPage - 5);
//	let endPage = Math.min(totalPages, currentLoadReturnSummaryPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentLoadReturnSummaryPage) {
//			paginationHtml += `<button class="loadReturnSummary-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentLoadReturnSummaryPage < totalPages) {
//		paginationHtml += `<button class="loadReturnSummary-page-btn" data-page="${currentLoadReturnSummaryPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="loadReturnSummary-page-btn disabled">&gt;</button>`;
//	}
//
//	$("#loadReturnSummaryPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindLoadReturnSummaryEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.loadReturnSummary_chkAll').on('change', '.loadReturnSummary_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.loadReturnSummary_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.loadReturnSummary_chk').on('change', '.loadReturnSummary_chk', function() {
//		let totalCheckboxes = $('.loadReturnSummary_chk').length;
//		let checkedCheckboxes = $('.loadReturnSummary_chk:checked').length;
//		$('.loadReturnSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnLoadReturnSummarySearch").off('click').on('click', function() {
//		performLoadReturnSummarySearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnLoadReturnSummarySearchInit").off('click').on('click', function() {
//		resetLoadReturnSummarySearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.loadReturnSummary-page-btn').on('click', '.loadReturnSummary-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentLoadReturnSummaryPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performLoadReturnSummaryDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_load_return_summary input[type="text"], #view_m2_load_return_summary input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performLoadReturnSummarySearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		/*intf_yn: $("#load_RS_searchVal_Condition").val(),*/
//		fromDate: $("#load_RS_searchVal_fromDate").val(),
//		toDate: $("#load_RS_searchVal_toDate").val(),
//		factory: $("#load_RS_searchVal_factory").val(),
//		storage: $("#load_RS_searchVal_storage").val(),
//		cname: $("#load_RS_searchVal_cname").val().trim().toUpperCase(),
//		type: $("#load_RS_searchVal_type").val().trim(),
//		car: $("#load_RS_searchVal_car").val().trim(),
//		itemcode: $("#load_RS_searchVal_itemcode").val().trim(),
//		itemname: $("#load_RS_searchVal_itemname").val().trim()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performLoadReturnSummarySearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentLoadReturnSummaryPage = 1;
//	performLoadReturnSummaryDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetLoadReturnSummarySearch() {
//	const {fromDate, toDate} = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//
//	$("#load_RS_searchVal_fromDate").val(fromDate);
//	$("#load_RS_searchVal_toDate").val(toDate);
//	$("#load_RS_searchVal_factory").val(factory);
//	$("#load_RS_searchVal_storage").val(saveStorageForInit);
//	$("#load_RS_searchVal_cname").val('');
//	$("#load_RS_searchVal_type").val('');
//	$("#load_RS_searchVal_car").val('');
//	$("#load_RS_searchVal_itemcode").val('');
//	$("#load_RS_searchVal_itemname").val('');
//	// 초기화 후 전체 데이터 다시 조회
//	currentLoadReturnSummaryPage = 1;
//	performLoadReturnSummaryDBSearch({ fromDate, toDate, factory });;
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
//window.changeLoadReturnSummaryItemsPerPage = function(newItemsPerPage) {
//	loadReturnSummaryItemsPerPage = newItemsPerPage;
//	currentLoadReturnSummaryPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performLoadReturnSummaryDBSearch(searchCriteria);
//}
//
//window.exportLoadReturnSummaryData = function() {
//	return {
//		total: globalLoadReturnSummaryData.length,
//		currentPage: currentLoadReturnSummaryPage,
//		itemsPerPage: loadReturnSummaryItemsPerPage,
//		data: globalLoadReturnSummaryData
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
//			$(".loadReturnSummaryTotalQty").text(Number(data).toLocaleString());
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
//window.downloadAllLoadReturnSummaryData = function() {
//	let searchCriteria = {
//		/*intf_yn: $("#load_RS_searchVal_Condition").val(),*/
//		fromDate: $("#load_RS_searchVal_fromDate").val(),
//		toDate: $("#load_RS_searchVal_toDate").val(),
//		factory: $("#load_RS_searchVal_factory").val(),
//		storage: $("#load_RS_searchVal_storage").val(),
//		cname: $("#load_RS_searchVal_cname").val().trim().toUpperCase(),
//		type: $("#load_RS_searchVal_type").val().trim(),
//		car: $("#load_RS_searchVal_car").val().trim(),
//		itemcode: $("#load_RS_searchVal_itemcode").val().trim(),
//		itemname: $("#load_RS_searchVal_itemname").val().trim()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_loadReturnSummary_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.loadReturnSummaryColumns, {
//				fileName: 'LoadReturnSummary_All',
//				sheetName: 'LoadReturnSummary'
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
//$(document).on("click", ".btnIntfLoadReturnSummary", function() {
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
//	$(".loadReturnSummary_chk:checked").each(function() {
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
//		url: "/loadReturn_confirm_summary",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performLoadReturnSummaryDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.loadReturnSummary_chkAll').prop('checked', false);
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
//$(document).on("click", ".btnIntfLoadReturnSummaryDelete", function() {
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
//	$(".loadReturnSummary_chk:checked").each(function() {
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
//		url: "/loadReturn_confirm_summary_cancel",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performLoadReturnSummaryDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.loadReturnSummary_chkAll').prop('checked', false);
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
