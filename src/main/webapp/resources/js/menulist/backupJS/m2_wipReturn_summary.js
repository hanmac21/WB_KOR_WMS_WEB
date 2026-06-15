///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_wipReturn_summary 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : wipReturnSummary -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : WipReturnSummary -> NewMenuName
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
//let globalWipReturnSummaryData = []; // 현재 조회된 데이터 저장
//let currentWipReturnSummaryPage = 1; // 현재 페이지
//let wipReturnSummaryItemsPerPage = 1000; // 페이지당 항목 수
//let totalWipReturnSummaryCount = 0; // 서버에서 받은 총 개수 저장
//let totalWipReturnSummaryQty = 0; // 서버에서 받은 총 개수 저장
//let totalWipReturnSummaryPages = 0; // 서버에서 받은 총 페이지
//$(document).ready(function() {
//
//	window.filteredWipReturnSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//	window.wipReturnSummaryColumns = [
//		{ key: 'INDATE', header: 'date' },
//		{ key: 'FACTORY', header: 'factory' },
//		{ key: 'STORAGE', header: 'storage' },
//		{ key: 'CAR', header: 'car' },
//		{ key: 'ITEMCODE', header: 'itemcode' },
//		{ key: 'ITEMNAME', header: 'itemname' },
//		{ key: 'QTY', header: 'qty' },
//		{ key: 'WCCODE', header: 'wccode' }
//		// =
//	];
//
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_wipReturn_summary = function(menuId) {
//		showLoading("data");
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		performWipReturnSummaryDBSearch({ fromDate, toDate, factory });
//	}
//});
//
//// DB에서 데이터 조회하는 함수
//function performWipReturnSummaryDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_wipReturnSummary",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentWipReturnSummaryPage,
//			itemsPerPage: wipReturnSummaryItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalWipReturnSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalWipReturnSummaryCount = data.totalCount || 0;
//			totalWipReturnSummaryQty = data.totalQty || 0;
//			totalWipReturnSummaryPages = data.totalPages || 0;
//			currentWipReturnSummaryPage = data.currentPage || 0;
//			window.filteredWipReturnSummaryData = globalWipReturnSummaryData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_wipReturn_summary').length) {
//				renderWipReturnSummaryView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderWipReturnSummaryTableData();
//				renderWipReturnSummaryPagination();
//				updateWipReturnSummaryTotalCount();
//				updateWipReturnSummaryTotalQty();
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
//function renderWipReturnSummaryView() {
//	let content_output = `
//			<div class="divBlockControl" id="view_m2_wipReturn_summary">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//								<input type="date" id="wipReturnSummary_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="wipReturnSummary_searchVal_toDate" />
//							</div>
//							<!--<div class="search-label">
//								<div class="searchVal_condition">${i18n.t('search.input.status')} 불출상태 </div>
//								<select id="wipReturnSummary_searchVal_condition" >
//									<option value="">${i18n.t('search.all')}전체 </option>
//									<option value="N">${i18n.t('search.input.waiting')}대기중</option>
//									<option value="Y">${i18n.t('search.input.completed')} 완료</option>
//								</select>
//							</div>-->
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//								<select id="wipReturnSummary_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="wipReturnSummary_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_wccode">${i18n.t('search.wccode')}<!-- WCCODE --></div>
//								<select id="wipReturnSummary_searchVal_wccode" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="wipReturnSummary_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="wipReturnSummary_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="wipReturnSummary_searchVal_itemname" />
//							</div>
//						</div>
//							<div class="search_button_area">
//								<button class="btn btn-primary btnWipReturnSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//								<button class="btn btn-secondary btnWipReturnSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//							<span>${i18n.t('table.info.total')} <strong id="wipReturnSummaryTotalCount">${totalWipReturnSummaryCount}</strong> ${i18n.t('table.info.records')} | 
//								${i18n.t('table.page')} <strong id="wipReturnSummaryCurrentPageInfo">${currentWipReturnSummaryPage}</strong>/<strong id="wipReturnSummaryTotalPageInfo">${totalWipReturnSummaryPages}</strong> | 
//								${i18n.t('table.info.qty')} : <strong id = "wipReturnSummaryTotalQty"></strong>
//							</span>
//							<div class="action-buttons-right m2_wipReturn_summary">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="wipReturnSummaryExcelBtn" onclick="downloadAllWipReturnSummaryData()">Excel</button>
//								</div>
//							</div>
//							<!--<div class="btnIntfCommon btnWipReturnSummaryItemsArea">
//								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfWipReturnSummary"/>
//								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfWipReturnSummaryCancel"/>
//							</div>-->	
//						</div>
//						<table class="data-table m2_wipReturn_summary">
//							<thead>
//								<tr>
//									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//									<th class = "dateVal">${i18n.t('table.date')}<!-- INDATE --></th>										
//									<!--<th class = "statusVal">${i18n.t('table.status')} STATUS</th>-->
//									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//									<th class = "wccodeVal">${i18n.t('search.wccode')}<!-- WCCODE --></th>
//								</tr>
//							</thead>
//							<tbody id="wipReturnSummaryTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="wipReturnSummaryPaginationContainer">
//						</div>
//					</div>
//				</div>
//			</div>
//		`;
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="wipReturnSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredWipReturnSummaryData, wipReturnSummaryColumns, {fileName:'WipReturnSummary', sheetName:'WipReturnSummary'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#wipReturnSummary_searchVal_fromDate").val(fromDate);
//		$("#wipReturnSummary_searchVal_toDate").val(toDate);
//	})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderWipReturnSummaryTableData();
//	// 페이지네이션 렌더링
//	renderWipReturnSummaryPagination();
//	// 이벤트 바인딩
//	bindWipReturnSummaryEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateWipReturnSummaryTotalCount();
//	// 초기 렌더링 후 수량 업데이트
//	updateWipReturnSummaryTotalQty();
//
//}
//
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//	const factory = $('#wipReturnSummary_searchVal_factory');
//	const storage = $('#wipReturnSummary_searchVal_storage');
//	const wccode = $('#wipReturnSummary_searchVal_wccode');
//	const savedFactory = getCookie('selectedFactory');
//
//	// 공장별 창고 옵션 설정
//	function updateStorageOptions(factoryValue) {
//		storage.empty();
//
//		const options = {
//			'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'all'],
//			'PUEBLA': ['Material', 'PRODUCT', 'all'],
//			'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'all']
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
//		
//		window.autoSetStorageFields();
//	}
//	
//	// 공장별 작업장 옵션 설정
//	function updateWccodeOptions(factoryValue) {
//		wccode.empty();
//
//		const options = {
//			'SALTILLO': ['H/REST', 'OUTSIDE', 'all'],
//			'PUEBLA': ['Workshop', 'all'],
//			'': ['H/REST', 'OUTSIDE', 'WORKSHOP', 'all']
//		};
//
//		const wccodeList = options[factoryValue] || options[''];
//
//		wccodeList.forEach(item => {
//			const text = item === 'all' ? i18n.t('search.all') : item;
//			wccode.append(`<option value="${item}">${text}</option>`);
//		});
//
//		// 첫 번째 옵션 선택 (Material)
//		wccode.val(wccodeList[0]);
//		
//		window.autoSetStorageFields();
//	}
//
//	// 저장된 공장 선택
//	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
//		factory.val(savedFactory);
//	}
//
//	updateStorageOptions(savedFactory || '');
//	updateWccodeOptions(savedFactory || '');
//
//	// 공장 변경 시 창고 업데이트
//	factory.on('change', function() {
//		updateStorageOptions($(this).val());
//		updateWccodeOptions($(this).val());
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
//function updateWipReturnSummaryTotalCount() {
//	$('#wipReturnSummaryTotalCount').text(totalWipReturnSummaryCount);
//}
//// 총 개수를 업데이트하는 함수
//function updateWipReturnSummaryTotalQty() {
//	$('#wipReturnSummaryTotalQty').text(totalWipReturnSummaryQty.toLocaleString());
//}
//function renderWipReturnSummaryTableData() {
//	let tableBody = "";
//
//	//console.log("globalWipReturnSummaryData:", globalWipReturnSummaryData);
//	//console.log("데이터 개수:", globalWipReturnSummaryData.length);
//
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalWipReturnSummaryData.length; i++) {
//		let inputData = globalWipReturnSummaryData;
//
//		let rowNumber = (currentWipReturnSummaryPage - 1) * wipReturnSummaryItemsPerPage + i + 1;
//		//console.log(`행 ${i}:`, inputData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//            <tr>
//                <td class = "noVal">${rowNumber}</td>
//				<td class = "dateVal">${inputData[i].INDATE || inputData[i].indate || ''}</td>
//				<td class = "factoryVal">${inputData[i].FACTORY || inputData[i].factory || ''}</td>
//				<td class = "storageVal">${inputData[i].STORAGE || inputData[i].storage || ''}</td>
//				<td class = "carVal">${inputData[i].CAR || inputData[i].car || ''}</td>
//				<td class = "itemcodeVal">${inputData[i].ITEMCODE || inputData[i].itemcode || ''}</td>
//				<td class = "itemnameMedVal">${inputData[i].ITEMNAME || inputData[i].itemname || ''}</td>
//				<td class = "qtyVal">${Number(inputData[i].QTY || inputData[i].qty || 0).toLocaleString()}</td>
//				<td class = "wccodeVal">${inputData[i].WCCODE || inputData[i].wccode || ''}</td>
//            </tr>
//        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#wipReturnSummaryTableBody").html(tableBody);
//}
//
//// 페이지네이션 렌더링
//function renderWipReturnSummaryPagination() {
//	let totalPages = Math.ceil(totalWipReturnSummaryCount / wipReturnSummaryItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentWipReturnSummaryPage > 1) {
//		paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="${currentWipReturnSummaryPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="wipReturnSummary-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentWipReturnSummaryPage - 5);
//	let endPage = Math.min(totalPages, currentWipReturnSummaryPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentWipReturnSummaryPage) {
//			paginationHtml += `<button class="wipReturnSummary-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentWipReturnSummaryPage < totalPages) {
//		paginationHtml += `<button class="wipReturnSummary-page-btn" data-page="${currentWipReturnSummaryPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="wipReturnSummary-page-btn disabled">&gt;</button>`;
//	}
//
//	$('#wipReturnSummaryCurrentPageInfo').text(currentWipReturnSummaryPage);
//	$('#wipReturnSummaryTotalPageInfo').text(totalPages);
//	$("#wipReturnSummaryPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindWipReturnSummaryEvents() {
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnWipReturnSummarySearch").off('click').on('click', function() {
//		performWipReturnSummarySearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnWipReturnSummarySearchInit").off('click').on('click', function() {
//		resetWipReturnSummarySearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.wipReturnSummary-page-btn').on('click', '.wipReturnSummary-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentWipReturnSummaryPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performWipReturnSummaryDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_wipReturn_summary input[type="text"], #view_m2_wipReturn_summary input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performWipReturnSummarySearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		fromDate: $("#wipReturnSummary_searchVal_fromDate").val(),
//		toDate: $("#wipReturnSummary_searchVal_toDate").val(),
//		factory: $("#wipReturnSummary_searchVal_factory").val().trim(),
//		storage: $("#wipReturnSummary_searchVal_storage").val().trim(),
//		car: $("#wipReturnSummary_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#wipReturnSummary_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#wipReturnSummary_searchVal_itemname").val().trim().toUpperCase(),
//		wccode: $("#wipReturnSummary_searchVal_wccode").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performWipReturnSummarySearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentWipReturnSummaryPage = 1;
//	performWipReturnSummaryDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetWipReturnSummarySearch() {
//	const { fromDate, toDate } = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//	
//	$("#wipReturnSummary_searchVal_fromDate").val(fromDate);
//	$("#wipReturnSummary_searchVal_toDate").val(toDate);
//	$("#wipReturnSummary_searchVal_car").val('');
//	$("#wipReturnSummary_searchVal_itemcode").val('');
//	$("#wipReturnSummary_searchVal_itemname").val('');
//	
//	// 공장, 창고, 작업장 초기화
//	renderFactoryStorage();
//	
//	// =
//	// 초기화 후 전체 데이터 다시 조회
//	currentWipReturnSummaryPage = 1;
//	performWipReturnSummaryDBSearch({ fromDate, toDate, factory });
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
//window.changeWipReturnSummaryItemsPerPage = function(newItemsPerPage) {
//	wipReturnSummaryItemsPerPage = newItemsPerPage;
//	currentWipReturnSummaryPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performWipReturnSummaryDBSearch(searchCriteria);
//}
//
//window.exportWipReturnSummaryData = function() {
//	return {
//		total: globalWipReturnSummaryData.length,
//		currentPage: currentWipReturnSummaryPage,
//		itemsPerPage: wipReturnSummaryItemsPerPage,
//		data: globalWipReturnSummaryData
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
//window.downloadAllWipReturnSummaryData = function() {
//	let searchCriteria = {
//		fromDate: $("#wipReturnSummary_searchVal_fromDate").val(),
//		toDate: $("#wipReturnSummary_searchVal_toDate").val(),
//		factory: $("#wipReturnSummary_searchVal_factory").val(),
//		storage: $("#wipReturnSummary_searchVal_storage").val(),
//		car: $("#wipReturnSummary_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#wipReturnSummary_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#wipReturnSummary_searchVal_itemname").val().trim().toUpperCase(),
//		wccode: $("#wipReturnSummary_searchVal_wccode").val().trim().toUpperCase()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_wipReturnSummary_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.wipReturnSummaryColumns, {
//				fileName: 'WipReturnSummary_All',
//				sheetName: 'WipReturnSummary'
//			});
//			hideLoading();
//		},
//		error: function() {
//			alert("전체 데이터 조회에 실패했습니다.");
//			hideLoading();
//		}
//	});
//};
////
////$(document).on("click", ".btnIntfWipReturnSummary", function() {
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
////	$(".wipReturnSummary_chk:checked").each(function() {
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
////		url: "/wipReturn_confirm_summary",
////		type: "POST",
////		data: JSON.stringify(iidList),
////		contentType: "application/json",
////		success: function(data) {
////			let searchVal = getCurrentSearchCriteria();
////			performWipReturnSummaryDBSearch(searchVal);
////			
////			// 전체 선택 해제
////			$('.wipReturnSummary_chkAll').prop('checked', false);
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
////$(document).on("click", ".btnIntfWipReturnSummaryCancel", function() {
////
////	if ($(".status-waiting:checked").length > 0) {
////		alert(i18n.t('validation.confirm.items'));
////		return;
////	}
////
////	if (!confirm(i18n.t('confirmation.interface.progress'))) {
////		return;
////	}
////
////	const iidList = [];
////	$(".wipReturnSummary_chk:checked").each(function() {
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
////		url: "/wipReturn_confirm_summary_cancel",
////		type: "POST",
////		data: JSON.stringify(iidList),
////		contentType: "application/json",
////		success: function(data) {
////			let searchVal = getCurrentSearchCriteria();
////			performWipReturnSummaryDBSearch(searchVal);
////			
////			// 전체 선택 해제
////			$('.wipReturnSummary_chkAll').prop('checked', false);
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
