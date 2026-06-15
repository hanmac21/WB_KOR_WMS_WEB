///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_load_summary 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : loadSummary -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : LoadSummary -> NewMenuName
// * 4. 표시된 오류 및 = 부분 수정
// * 5. AJAX 호출명 따라 백단 코드 생성
// * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
// * 
// * 백단 참고사항
// * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
// * 
// * 아래 Document Ready 부터 복 붙
// * -------------------------------------------------------------- */
//let globalLoadSummaryData = []; // 현재 조회된 데이터 저장
//let currentLoadSummaryPage = 1; // 현재 페이지
//let loadSummaryItemsPerPage = 1000; // 페이지당 항목 수
//let totalLoadSummaryCount = 0; // 서버에서 받은 총 개수 저장
//let totalLoadSummaryQty = 0; // 서버에서 받은 총 개수 저장
//let totalLoadSummaryPages = 0; // 서버에서 받은 총 페이지
//let menuType = null;
//let saveStorageForInit = null;
//let pendingLoadSummaryInit = false;
//
//$(document).ready(function() {
//
//	window.filteredLoadSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//	window.loadSummaryColumns = [
//		{ key: 'INTF_YN', header: 'Status' },
//		{ key: 'OUTDATE', header: 'Date' },
//		{ key: 'FACTORY', header: 'Factory' },
//		{ key: 'STORAGE', header: 'Storage' },
//		{ key: 'SOURCE3', header: 'Product Factory' },
//		{ key: 'CNAME', header: 'Supplier' },
//		{ key: 'SPEC', header: 'Supplier Code' },
//		{ key: 'CAR', header: 'Car' },
//		{ key: 'ITEMCODE', header: 'Item Code' },
//		{ key: 'ITEMNAME', header: 'Item Name' },
//		{ key: 'QTY', header: 'Qty' },
//		{ key: 'DOCK', header: 'Dock' },
//		{ key: 'INVOICENO', header: 'Invoice No' },
//		{ key: 'CONTAINER', header: 'Container No' }
//	];
//
//	// 👉 실제 조회 함수
//	function initLoadSummarySearch() {
//		showLoading("data");
//		const { fromDate, toDate } = getDefaultDateRange();
//		const factory = getCookie('selectedFactory');
//
//		// ✅ 메뉴 타입별 기본 STORAGE 지정
//		let storage = 'Material';
//		if (menuType === 'purchase') {
//			storage = 'Material';
//		} else if (menuType === 'fabric') {
//			storage = 'Fabric';
//		} else if (menuType === 'sales') {
//			storage = 'P1 W/HOUSE';
//		}
//
//		console.log('LoadSummary 초기 조회:', { fromDate, toDate, factory, storage, menuType });
//
//		performLoadSummaryDBSearch({ fromDate, toDate, factory, storage });
//	}
//
//	// 메인 호출 함수 - 메뉴 클릭 시 호출
//	window.call_m2_load_summary = function(menuId) {
//		// 이 메뉴는 열렸다 → 플래그만 세팅
//		pendingLoadSummaryInit = true;
//
//		// menuType 아직 없으면 대기
//		if (!menuType) {
//			console.log('LoadSummary: menuType 없음 → menuTypeChanged 올 때까지 대기');
//			return;
//		}
//
//		// menuType 이미 있으면 바로 조회
//		initLoadSummarySearch();
//	};
//
//	// ✅ 메뉴 타입 변경 이벤트 (한 번만 등록)
//	document.addEventListener('menuTypeChanged', function(e) {
//		console.log("Menu Type:", e.detail.menuType);
//		menuType = e.detail.menuType;
//		console.log("Data Matching:", e.detail.dataMatching);
//
//		// 라벨 번역
//		if ($('.loadSummary_label_cname').length) {
//			updateLoadSummaryTextByMenuType();
//		}
//
//		// 메뉴는 이미 눌려 있고, menuType만 늦게 들어온 경우
//		if (pendingLoadSummaryInit) {
//			console.log('LoadSummary: menuType 세팅 완료 → 대기 중이던 초기 조회 실행');
//			pendingLoadSummaryInit = false;
//			initLoadSummarySearch();
//		}
//	});
//});
//
//// DB에서 데이터 조회하는 함수
//function performLoadSummaryDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_loadSummary",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentLoadSummaryPage,
//			itemsPerPage: loadSummaryItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalLoadSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalLoadSummaryCount = data.totalCount || 0;
//			totalLoadSummaryQty = data.totalQty || 0;
//			totalLoadSummaryPages = data.totalPages || 0;
//			currentLoadSummaryPage = data.currentPage || 0;
//			window.filteredLoadSummaryData = globalLoadSummaryData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_load_summary').length) {
//				renderLoadSummaryView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderLoadSummaryTableData();
//				renderLoadSummaryPagination();
//				updateLoadSummaryTotalCount();
//				updateLoadSummaryTotalQty();
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
//function renderLoadSummaryView() {
//	let content_output = `
//			<div class="divBlockControl" id="view_m2_load_summary">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label m3_load_summary">
//								<div class="search_loadCondition">${i18n.t('search.input.status')}<!-- 불출상태 --></div>
//								<select id="loadSummary_searchVal_Condition" >
//									<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
//									<option value="N">${i18n.t('search.input.waiting')}<!-- 불출 대기중 --></option>
//									<option value="Y">${i18n.t('search.input.completed')}<!-- 불출 완료 --></option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//								<input type="date" id="loadSummary_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="loadSummary_searchVal_toDate" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//								<select id="loadSummary_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="loadSummary_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_cname loadSummary_label_source3">${i18n.t('search.productFactory')}<!-- SOURCE --></div>
//								<input type="text" id="loadSummary_searchVal_source3" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_cname loadSummary_label_cname">${i18n.t('search.suppliername')}<!-- CNAME --></div>
//								<input type="text" id="loadSummary_searchVal_cname" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="loadSummary_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="loadSummary_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="loadSummary_searchVal_itemname" />
//							</div>								
//							<div class="search-label">
//								<div class="searchVal_invoiceNo">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></div>
//								<input type="text" id="loadSummary_searchVal_invoiceNo" />
//							</div>	
//						</div>
//							<div class="search_button_area">
//								<button class="btn btn-primary btnLoadSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//								<button class="btn btn-secondary btnLoadSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//							<span>${i18n.t('table.info.total')} <strong id="loadSummaryTotalCount">${totalLoadSummaryCount}</strong> ${i18n.t('table.info.records')} | 
//								${i18n.t('table.page')} <strong id="loadSummaryCurrentPageInfo">${currentLoadSummaryPage}</strong>/<strong id="loadSummaryTotalPageInfo">${totalLoadSummaryPages}</strong> | 
//								${i18n.t('table.info.qty')} : <strong id = "loadSummaryTotalQty"></strong>
//							</span>
//							<div class="btnInterfaceCommon btnLoadSummaryItemsArea" style="margin-left:24px;">
//								<select id = "loadSummaryCustomer">
//								</select>
//								<button class="btn btn-success" id="loadSummaryChangeBtn">Change</button>
//							</div>
//							<div class="action-buttons-right m2_load_summary">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="loadSummaryExcelBtn" onclick="downloadAllLoadSummaryData()">Excel</button>
//								</div>
//							</div>
//							<div class="btnInterfaceCommon btnLoadSummaryItemsArea" style="margin-left:24px;">
//								<!--<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfLoadSummary"/>-->
//								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfLoadSummaryDelete"/>
//							</div>
//						</div>
//						<table class="data-table m2_load_summary">
//							<thead>
//								<tr>						
//									<th class = "checkboxVal">
//										<input type="checkbox" class="loadSummary_chkAll">
//									</th>
//									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//									<th class = "statusVal">${i18n.t('table.status')}<!-- STATUS --></th>
//									<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
//									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//									<th class = "storageVal">${i18n.t('search.productFactory')}<!-- STORAGE --></th>
//									<th class = 'itemcodeVal loadSummary_label_cname'>${i18n.t('search.suppliername')}<!-- CNAME --></th>
//									<th class = "itemcodeVal">${i18n.t('search.custcode')}<!-- CCODE --></th>
//									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									<th class = "itemnameVal_short">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//									<th class = "itemcodeVal">${i18n.t('search.dock')}<!-- USER --></th>
//									<th class = "itemcodeVal">${i18n.t('search.invoiceNo')}<!-- USER --></th>
//									<th class = "itemcodeVal">${i18n.t('search.containerNo')}<!-- USER --></th>
//								</tr>
//							</thead>
//							<tbody id="loadSummaryTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="loadSummaryPaginationContainer">
//						</div>
//					</div>
//				</div>
//			</div>
//		`;
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="loadSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredLoadSummaryData, loadSummaryColumns, {fileName:'LoadSummary', sheetName:'LoadSummary'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#loadSummary_searchVal_fromDate").val(fromDate);
//		$("#loadSummary_searchVal_toDate").val(toDate);
//	})();
//
//	// 거래처 데이터 가져오기
//	selectCustomer();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderLoadSummaryTableData();
//	// 페이지네이션 렌더링
//	renderLoadSummaryPagination();
//	// 이벤트 바인딩
//	bindLoadSummaryEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateLoadSummaryTotalCount();
//	// 초기 렌더링 후 수량 업데이트
//	updateLoadSummaryTotalQty();
//	// mentType에 따라 텍스트 업데이트
//	updateLoadSummaryTextByMenuType();
//}
//
//function selectCustomer() {
//	$.ajax({
//		url: "/selectCustomer",
//		type: "POST",
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- select Customer --");
//			console.log(data);
//			let $select = $("#loadSummaryCustomer");
//			$select.empty(); // 기존 option 제거
//
//			$.each(data, function(index, value) {
//				$select.append($("<option>", {
//					value: value,
//					text: value.split("_")[1]
//				}));
//			});
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
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//	const factory = $('#loadSummary_searchVal_factory');
//	const storage = $('#loadSummary_searchVal_storage');
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
//
//		if (menuType === "purchase") {
//			saveStorageForInit = "Material";
//			$("#loadSummary_searchVal_storage").val('Material');
//		} else if (menuType === "fabric") {
//			saveStorageForInit = "Fabric";
//			$("#loadSummary_searchVal_storage").val('Fabric');
//		} else if (menuType === "sales") {
//			saveStorageForInit = "P1 W/HOUSE";
//			$("#loadSummary_searchVal_storage").val('P1 W/HOUSE');
//		}
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
//function updateLoadSummaryTextByMenuType() {
//	let key;
//
//	if (menuType === "purchase") {
//		key = 'search.suppliername';			// 협력사명
//	} else if (menuType === "sales") {
//		key = 'search.custname';				// 고객사명
//	}
//
//	const label = $('.loadSummary_label_cname');
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
//
//// 총 개수를 업데이트하는 함수
//function updateLoadSummaryTotalCount() {
//	$('#loadSummaryTotalCount').text(totalLoadSummaryCount);
//}
//// 총 개수를 업데이트하는 함수
//function updateLoadSummaryTotalQty() {
//	$('#loadSummaryTotalQty').text(totalLoadSummaryQty.toLocaleString());
//}
//function renderLoadSummaryTableData() {
//	let tableBody = "";
//
//	//console.log("globalLoadSummaryData:", globalLoadSummaryData);
//	//console.log("데이터 개수:", globalLoadSummaryData.length);
//
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalLoadSummaryData.length; i++) {
//		let rowNumber = (currentLoadSummaryPage - 1) * loadSummaryItemsPerPage + i + 1;
//		let un = globalLoadSummaryData[i]
//		let statusText = globalLoadSummaryData[i].intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
//		let statusClass = globalLoadSummaryData[i].intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
//		//console.log(`행 ${i}:`, globalLoadSummaryData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//            <tr>
//            	<td class = "checkboxVal"><input type="checkbox" class="loadSummary_chk ${statusClass}" 
//            		data-unique="${un.outdate}_${un.itemcode}_${un.intf_yn}_${un.qty}_${un.factory}_${un.storage}_${un.custcode}_${un.mes_key}_${un.invoiceno}"></td>
//                <td class = "noVal">${rowNumber}</td>
//                <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
//                <td class = "dateVal">${globalLoadSummaryData[i].OUTDATE || globalLoadSummaryData[i].outdate || ''}</td>
//				<td class = "factoryVal">${globalLoadSummaryData[i].FACTORY || globalLoadSummaryData[i].factory || ''}</td>
//				<td class = "storageVal">${globalLoadSummaryData[i].STORAGE || globalLoadSummaryData[i].storage || ''}</td>
//				<td class = "storageVal">${globalLoadSummaryData[i].SOURCE3 || globalLoadSummaryData[i].source3 || ''}</td>
//				<td class = 'itemcodeVal'>${globalLoadSummaryData[i].CNAME || globalLoadSummaryData[i].cname || ''}</td>
//				<td class = "itemcodeVal">${globalLoadSummaryData[i].SPEC || globalLoadSummaryData[i].spec || ''}</td>
//				<td class = "carVal">${globalLoadSummaryData[i].CAR || globalLoadSummaryData[i].car || ''}</td>
//				<td class = "itemcodeVal">${globalLoadSummaryData[i].ITEMCODE || globalLoadSummaryData[i].itemcode || ''}</td>
//				<td class = "itemnameVal_short">${globalLoadSummaryData[i].ITEMNAME || globalLoadSummaryData[i].itemname || ''}</td>
//				<td class = "qtyVal">${Number(globalLoadSummaryData[i].QTY || globalLoadSummaryData[i].qty || 0).toLocaleString()}</td>
//				<td class = "itemcodeVal">${globalLoadSummaryData[i].DOCK || globalLoadSummaryData[i].dock || ''}</td>
//				<td class = "itemcodeVal">${globalLoadSummaryData[i].INVOICENO || globalLoadSummaryData[i].invoiceno || ''}</td>
//				<td class = "itemcodeVal">${globalLoadSummaryData[i].CONTAINER || globalLoadSummaryData[i].container || ''}</td>
//            </tr>
//        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#loadSummaryTableBody").html(tableBody);
//	$(".loadSummary_chkAll").prop("checked", false);
//}
//
//// 페이지네이션 렌더링
//function renderLoadSummaryPagination() {
//	let totalPages = Math.ceil(totalLoadSummaryCount / loadSummaryItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentLoadSummaryPage > 1) {
//		paginationHtml += `<button class="loadSummary-page-btn" data-page="${currentLoadSummaryPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="loadSummary-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentLoadSummaryPage - 5);
//	let endPage = Math.min(totalPages, currentLoadSummaryPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="loadSummary-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentLoadSummaryPage) {
//			paginationHtml += `<button class="loadSummary-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="loadSummary-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="loadSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentLoadSummaryPage < totalPages) {
//		paginationHtml += `<button class="loadSummary-page-btn" data-page="${currentLoadSummaryPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="loadSummary-page-btn disabled">&gt;</button>`;
//	}
//
//	$('#loadSummaryTotalPageInfo').text(totalPages);
//	$("#loadSummaryPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindLoadSummaryEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.loadSummary_chkAll').on('change', '.loadSummary_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.loadSummary_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.loadSummary_chk').on('change', '.loadSummary_chk', function() {
//		let totalCheckboxes = $('.loadSummary_chk').length;
//		let checkedCheckboxes = $('.loadSummary_chk:checked').length;
//		$('.loadSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnLoadSummarySearch").off('click').on('click', function() {
//		performLoadSummarySearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnLoadSummarySearchInit").off('click').on('click', function() {
//		resetLoadSummarySearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.loadSummary-page-btn').on('click', '.loadSummary-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentLoadSummaryPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performLoadSummaryDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_load_summary input[type="text"], #view_m2_load_summary input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performLoadSummarySearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		intf_yn: $("#loadSummary_searchVal_Condition").val(),
//		fromDate: $("#loadSummary_searchVal_fromDate").val(),
//		toDate: $("#loadSummary_searchVal_toDate").val(),
//		factory: $("#loadSummary_searchVal_factory").val(),
//		storage: $("#loadSummary_searchVal_storage").val(),
//		source3: $("#loadSummary_searchVal_source3").val(),
//		cname: $("#loadSummary_searchVal_cname").val().trim().toUpperCase(),
//		car: $("#loadSummary_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#loadSummary_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#loadSummary_searchVal_itemname").val().trim().toUpperCase(),
//		invoiceNo: $("#loadSummary_searchVal_invoiceNo").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performLoadSummarySearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentLoadSummaryPage = 1;
//	performLoadSummaryDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetLoadSummarySearch() {
//	const { fromDate, toDate } = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//	$("#loadSummary_searchVal_fromDate").val(fromDate);
//	$("#loadSummary_searchVal_toDate").val(toDate);
//	$("#loadSummary_searchVal_factory").val(factory);
//	$("#loadSummary_searchVal_storage").val(saveStorageForInit);
//	$("#loadSummary_searchVal_cname").val('');
//	$("#loadSummary_searchVal_car").val('');
//	$("#loadSummary_searchVal_itemcode").val('');
//	$("#loadSummary_searchVal_itemname").val('');
//	$("#loadSummary_searchVal_invoiceNo").val('');
//	// =
//	// 초기화 후 전체 데이터 다시 조회
//	currentLoadSummaryPage = 1;
//	performLoadSummaryDBSearch({ fromDate, toDate, factory });
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
//window.changeLoadSummaryItemsPerPage = function(newItemsPerPage) {
//	loadSummaryItemsPerPage = newItemsPerPage;
//	currentLoadSummaryPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performLoadSummaryDBSearch(searchCriteria);
//}
//
//window.exportLoadSummaryData = function() {
//	return {
//		total: globalLoadSummaryData.length,
//		currentPage: currentLoadSummaryPage,
//		itemsPerPage: loadSummaryItemsPerPage,
//		data: globalLoadSummaryData
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
//window.downloadAllLoadSummaryData = function() {
//	let searchCriteria = {
//		intf_yn: $("#loadSummary_searchVal_Condition").val(),
//		fromDate: $("#loadSummary_searchVal_fromDate").val(),
//		toDate: $("#loadSummary_searchVal_toDate").val(),
//		factory: $("#loadSummary_searchVal_factory").val(),
//		storage: $("#loadSummary_searchVal_storage").val(),
//		cucode: $("#loadSummary_searchVal_cucode").val(),
//		cname: $("#loadSummary_searchVal_cname").val(),
//		car: $("#loadSummary_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#loadSummary_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#loadSummary_searchVal_itemname").val().trim().toUpperCase(),
//		invoiceNo: $("#loadSummary_searchVal_invoiceNo").val().trim().toUpperCase()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_loadSummary_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.loadSummaryColumns, {
//				fileName: 'LoadSummary_All',
//				sheetName: 'LoadSummary'
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
////공급사 업데이트
//$(document).on("click", "#loadSummaryChangeBtn", function() {
//	if ($(".loadSummary_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items'));
//		return;
//	}
//
//	const iidList = [];
//	$(".loadSummary_chk:checked").each(function() {
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
//	data = {
//		iidList: iidList,
//		supplier: $("#loadSummaryCustomer").val()
//	}
//
//	if (confirm("Do you want to register the customer?")) {
//		showLoading("data");
//		$.ajax({
//			url: "/loadCustomerUpdate",
//			type: "POST",
//			data: JSON.stringify(data),
//			contentType: "application/json",
//			success: function(data) {
//				console.log("-- load update --");
//				console.log(data);
//				let searchVal = getCurrentSearchCriteria();
//				performLoadSummaryDBSearch(searchVal);
//				hideLoading();
//			},
//			error: function(xhr, status, error) {
//				// ❌ alert(res.message) <- res 없음 (버그)
//				window.handleAjaxError(xhr, status, error);
//			}
//
//		});
//	}
//});
//
//$(document).on("click", ".btnIntfLoadSummary", function() {
//
//	if ($(".loadSummary_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items'));
//		return;
//	}
//
//	let hasUndefined = false;
//
//	const iidList = [];
//	$(".loadSummary_chk:checked").each(function() {
//		let iid = $(this).data('unique');
//		if (!iid || iid.split("_")[6] === 'undefined' || iid.split("_")[6] === 'null') {
//			alert("Cust Code is Empty");
//			hasUndefined = true;
//			return false; // 🔹 each 반복 중단
//		}
//		iidList.push(iid);
//	});
//
//	// 하나라도 undefined면 전체 중단
//	if (hasUndefined) return;
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
//	console.log(iidList)
//	$.ajax({
//		url: "/load_confirm_summary",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let msg = [];
//			if (data.magamCnt > 0) msg.push(`closed: ${data.magamCnt} case(s)`);
//			if (data.lockCnt > 0) msg.push(`lock: ${data.lockCnt} case(s)`);
//			if (msg.length > 0) {
//				alert("The following items were not processed:\n" + msg.join("\n"));
//			} else {
//
//			}
//			let searchVal = getCurrentSearchCriteria();
//			performLoadSummaryDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.loadSummary_chkAll').prop('checked', false);
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
//$(document).on("click", ".btnIntfLoadSummaryDelete", function() {
//
//	if ($(".loadSummary_chk.status-waiting:checked").length > 0) {
//		alert(i18n.t('validation.unconfirm.items'));
//		return;
//	}
//
//	let hasUndefined = false;
//
//	const iidList = [];
//	$(".loadSummary_chk:checked").each(function() {
//		let iid = $(this).data('unique');
//		if (!iid || iid.split("_")[6] === 'undefined' || iid.split("_")[6] === 'null') {
//			alert("Cust Code is Empty");
//			hasUndefined = true;
//			return false; // 🔹 each 반복 중단
//		}
//		iidList.push(iid);
//	});
//
//	// 하나라도 undefined면 전체 중단
//	if (hasUndefined) return;
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
//		url: "/load_confirm_summary_cancel",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let msg = [];
//
//			if (data.magamCnt > 0) msg.push(`closed: ${data.magamCnt} case(s)`);
//			if (data.lockCnt > 0) msg.push(`lock: ${data.lockCnt} case(s)`);
//			if (data.noExistCnt > 0) msg.push(`No deletable records: ${data.noExistCnt} case(s)`);
//
//			if (msg.length > 0) {
//				alert("The following items were not processed:\n" + msg.join("\n"));
//			} else {
//
//			}
//			let searchVal = getCurrentSearchCriteria();
//			performLoadSummaryDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.loadSummary_chkAll').prop('checked', false);
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//
//	});
//
//});
