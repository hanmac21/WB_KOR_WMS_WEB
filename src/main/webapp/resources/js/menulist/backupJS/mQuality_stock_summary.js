///* --------------------------------------------------------------
// * 📌 Quality - Stock - Stock Detail
// * 비고: 
// * -------------------------------------------------------------- */
//
//let globalQualityStockSummaryData = []; // 현재 조회된 데이터 저장
//let currentQualityStockSummaryPage = 1; // 현재 페이지
//let qualityStockSummaryItemsPerPage = 1000; // 페이지당 항목 수
//let totalQualityStockSummaryCount = 0; // 서버에서 받은 총 개수 저장
//let totalQualityStockSummaryQty = 0; // 서버에서 받은 총 수량 저장
//let totalQualityStockSummaryERPQty = 0;
//let totalQualityStockSummaryPages = 0; // 서버에서 받은 총 개수 저장
//window.filteredQualityStockSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.qualityStockSummaryColumns = [
//	{ key: 'FACTORY', header: 'factory' },
//	{ key: 'CAR', header: 'car' },
//	{ key: 'ITEMCODE', header: 'itemcode' },
//	{ key: 'SPEC', header: 'customer code' },
//	{ key: 'ITEMNAME', header: 'itemname' },
//	{ key: 'QTY', header: 'qty' },
//	{ key: 'NOQTY1', header: 'In IF X', type: 'number' },
//	{ key: 'NOQTY2', header: 'Out IF X', type: 'number' },
//	{ key: 'UNPACKQTY', header: 'unpackqty' },
//	{ key: 'TOTALQTY', header: 'totalqty' }
//];
//
//let saveToDate;
//
//$(document).ready(function() {
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_mQuality_stock_summary = function(menuId) {
//		showLoading("data");
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 공장으로 조회
//		performQualityStockSummaryDBSearch({ factory });
//	}
//});
//
//// DB에서 데이터 조회하는 함수
//function performQualityStockSummaryDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_qualityStockSummary",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentQualityStockSummaryPage,
//			itemsPerPage: qualityStockSummaryItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//			console.log(data.totalQty);
////			console.log(data.totalQty.TOTAL_QTY);
//			globalQualityStockSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalQualityStockSummaryCount = data.totalCount || 0;
//			totalQualityStockSummaryQty = data.totalQty.TOTAL_QTY || 0;
//			totalQualityStockSummaryERPQty = data.totalQty.ERPQTY || 0;
//			totalQualityStockSummaryPages = data.totalPages || 0;
//			window.filteredQualityStockSummaryData = globalQualityStockSummaryData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_mQuality_stock_summary').length) {
//				renderQualityStockSummaryView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderQualityStockSummaryTableData();
//				renderQualityStockSummaryPagination();
//				updateQualityStockSummaryTotalCount();
//				updateQualityStockSummaryTotalQty();
//			}
//			$("#qualityStockSummary_searchVal_toDate").val(searchCriteria.toDate);
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
//function renderQualityStockSummaryView() {
//	let content_output = `
//		<div class="divBlockControl" id="view_mQuality_stock_summary">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<!-- <div class="search-label">
//							<div class="searchVal_toDate">${i18n.t('search.date')}</div>
//							<input type="date" id="qualityStockSummary_searchVal_toDate" />
//						</div> -->
//						<div class="search-label">
//							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="qualityStockSummary_searchVal_factory" class="">
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//							<select id="qualityStockSummary_searchVal_storage" >								
//								<option value="REDCAGE">REDCAGE</option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="qualityStockSummary_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="qualityStockSummary_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="qualityStockSummary_searchVal_itemname" />
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnQualityStockSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnQualityStockSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<span>${i18n.t('table.info.total')} <strong id="qualityStockSummaryTotalCount">${totalQualityStockSummaryCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="qualityStockSummaryCurrentPageInfo">${currentQualityStockSummaryPage}</strong>/<strong id="qualityStockSummaryTotalPageInfo">${totalQualityStockSummaryPages}</strong> | 
//							${i18n.t('table.info.qty')} : <strong id = "qualityStockSummaryTotalQty"></strong> |
//							SUM QTY : <strong id = "qualityStockSummaryTotalERPQty"></strong>
//						</span>
//						<div class="action-buttons-right mQuality_stock_summary">
//							<div id="defaultActions" class="action-group">
//								<button class="btn btn-success" id="qualityStockSummaryExcelBtn" onclick="downloadAllQualityStockSummaryData()">Excel</button>
//							</div>
//						</div>
//					</div>
//					<table class="data-table mQuality_stock_summary">
//						<thead>
//							<tr>
//								 <tr>
//								    <th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
//								    <th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>									    
//								    <th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								    <th class = "itemcodeVal">${i18n.t('search.customercode')}<!-- CUSTCODE --></th>
//								    <th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//									<th class = "qtyVal">${i18n.t('table.qty.inX')}<!-- QTY --></th>
//									<th class = "qtyVal">${i18n.t('table.qty.outX')}<!-- QTY --></th>
//									<th class = "qtyVal">${i18n.t('table.qty.unpackqty')}<!-- QTY --></th>
//								  </tr>
//							</tr>
//						</thead>
//						<tbody id="qualityStockSummaryTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="qualityStockSummaryPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	/* <th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th> */
//	/*<button class="btn btn-success" id="qualityStockSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredQualityStockSummaryData, qualityStockSummaryColumns, {fileName:'QualityStockSummary', sheetName:'QualityStockSummary'})">Excel</button>*/
//	/*<th>${i18n.t('search.location')}<!-- LOCATION --></th>*/
//	/*<div class="search-label">
//							<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
//							<input type="text" id="searchVal_location" />
//						</div>*/
//
//
//	$(".w_contentArea").append(content_output);
//
//	// 공장 및 창고 선택
////	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderQualityStockSummaryTableData();
//	// 페이지네이션 렌더링
//	renderQualityStockSummaryPagination();
//	// 이벤트 바인딩
//	bindQualityStockSummaryEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateQualityStockSummaryTotalCount();
//	// 초기 렌더링 후 totalqty 업데이트
//	updateQualityStockSummaryTotalQty();
//}
//
//// 공장 및 창고 선택 함수
////function renderFactoryStorage() {
////	const factory = $('#qualityStockSummary_searchVal_factory');
////	const storage = $('#qualityStockSummary_searchVal_storage');
////	const savedFactory = getCookie('selectedFactory');
////
////    // 공장별 창고 옵션 설정
////    function updateStorageOptions(factoryValue) {
////        storage.empty();
////        
////        const options = {
////            'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside','AUNDE', 'Material+Sideseat+Outside', 'P1 W/HOUSE', 'all'],
////            'PUEBLA': ['Material', 'PRODUCT', 'all'],
////            '': ['Material', 'Fabric', 'Side seat', 'Outside','AUNDE', 'Product', 'Material+Sideseat+Outside', 'P1 W/HOUSE', 'all']
////        };
////        
////        const storageList = options[factoryValue] || options[''];
////
////		storageList.forEach(item => {
////			
////			// 자동 창고선택 기능때문에 주석. 대문자로 작동안함. 버그 발생시 되돌리기 251129
////			//const value = item.toUpperCase(); // value는 대문자로 변환
////			
////			const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
////			storage.append(`<option value="${item}">${text}</option>`);
////		});
////
////		// 첫 번째 옵션 선택
////		storage.val(storageList[0]);
////        
////        window.autoSetStorageFields();
////	}
////
////	// 저장된 공장 선택
////	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
////		factory.val(savedFactory);
////	}
////
////	updateStorageOptions(savedFactory || '');
////
////	// 공장 변경 시 창고 업데이트
////	factory.on('change', function() {
////		updateStorageOptions($(this).val());
////	});
////	window.autoSetStorageFields();
////}
//
//// 정규식으로 쿠기 가져오기
//function getCookie(cookieName) {
//	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//	return match ? decodeURIComponent(match[2]) : '';
//}
//
//// 총 개수를 업데이트하는 함수
//function updateQualityStockSummaryTotalCount() {
//	$('#qualityStockSummaryTotalCount').text(totalQualityStockSummaryCount.toLocaleString());
//}
//// 총 수량를 업데이트하는 함수
//function updateQualityStockSummaryTotalQty() {
//	$('#qualityStockSummaryTotalQty').text(totalQualityStockSummaryQty.toLocaleString());
//	$('#qualityStockSummaryTotalERPQty').text(totalQualityStockSummaryERPQty.toLocaleString());
//}
//
//function renderQualityStockSummaryTableData() {
//	let tableBody = "";
//
//	//console.log("globalQualityStockSummaryData:", globalQualityStockSummaryData);
//	//console.log("데이터 개수:", globalQualityStockSummaryData.length);
//
//	$("#qualityStockSummaryCurrentPageInfo").text(currentQualityStockSummaryPage);
//	$("#qualityStockSummaryTotalPageInfo").text(totalQualityStockSummaryPages);
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	
//	let totalqty = 0;
//	let erpttotalqty = 0;
//	for (let i = 0; i < globalQualityStockSummaryData.length; i++) {
//		let rowNumber = (currentQualityStockSummaryPage - 1) * qualityStockSummaryItemsPerPage + i + 1;
//
//		//console.log(`행 ${i}:`, globalQualityStockSummaryData[i]); // 각 행 데이터 확인
//	
//		tableBody += `
//        <tr>
//        	<td class = "noVal">${rowNumber}</td>
//			<td class = "factoryVal">${globalQualityStockSummaryData[i].FACTORY || globalQualityStockSummaryData[i].factory || ''}</td>				
//			<td class = "carVal">${globalQualityStockSummaryData[i].CAR || globalQualityStockSummaryData[i].car || ''}</td>
//			<td class = "itemcodeVal">${globalQualityStockSummaryData[i].ITEMCODE || globalQualityStockSummaryData[i].itemcode || ''}</td>
//			<td class = "itemcodeVal">${globalQualityStockSummaryData[i].SPEC || globalQualityStockSummaryData[i].spec || ''}</td>
//			<td class = "itemnameMedVal">${globalQualityStockSummaryData[i].ITEMNAME || globalQualityStockSummaryData[i].itemname || ''}</td>
//			<td class = "qtyVal">${Number(globalQualityStockSummaryData[i].QTY || globalQualityStockSummaryData[i].qty || 0).toLocaleString()}</td>
//			<td class = "qtyVal">${Number(globalQualityStockSummaryData[i].NOQTY1 || globalQualityStockSummaryData[i].noqty1 || 0).toLocaleString()}</td>
//			<td class = "qtyVal">${Number(globalQualityStockSummaryData[i].NOQTY2 || globalQualityStockSummaryData[i].noqty2 || 0).toLocaleString()}</td>
//			<td class = "qtyVal">${Number(globalQualityStockSummaryData[i].UNPACKQTY || globalQualityStockSummaryData[i].unpackqty || 0).toLocaleString()}</td>
//        </tr>
//    `;
//		totalqty = totalqty + Number(globalQualityStockSummaryData[i].qty);
//	}
//	/* <td class = "storageVal">${globalQualityStockSummaryData[i].STORAGE || globalQualityStockSummaryData[i].storage || ''}</td> */
//	/*<td>${globalQualityStockSummaryData[i].LOCATION || globalQualityStockSummaryData[i].location || ''}</td>*/
//	//console.log("생성된 tableBody:", tableBody);
//	$("#qualityStockSummaryTableBody").html(tableBody);
//}
//
//// 페이지네이션 렌더링
//function renderQualityStockSummaryPagination() {
//	let totalPages = Math.ceil(totalQualityStockSummaryCount / qualityStockSummaryItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentQualityStockSummaryPage > 1) {
//		paginationHtml += `<button class="qualityStockSummary-page-btn" data-page="${currentQualityStockSummaryPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="qualityStockSummary-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentQualityStockSummaryPage - 5);
//	let endPage = Math.min(totalPages, currentQualityStockSummaryPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="qualityStockSummary-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentQualityStockSummaryPage) {
//			paginationHtml += `<button class="qualityStockSummary-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="qualityStockSummary-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="qualityStockSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentQualityStockSummaryPage < totalPages) {
//		paginationHtml += `<button class="qualityStockSummary-page-btn" data-page="${currentQualityStockSummaryPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="qualityStockSummary-page-btn disabled">&gt;</button>`;
//	}
//
//	$("#qualityStockSummaryPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindQualityStockSummaryEvents() {
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnQualityStockSummarySearch").off('click').on('click', function() {
//		performQualityStockSummarySearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnQualityStockSummarySearchInit").off('click').on('click', function() {
//		resetQualityStockSummarySearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.qualityStockSummary-page-btn').on('click', '.qualityStockSummary-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentQualityStockSummaryPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				const { fromDate } = getDefaultDateRange();
//
//				let searchCriteria = getCurrentSearchCriteria();
//				searchCriteria.fromDate = fromDate;
//
//				performQualityStockSummaryDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_mQuality_stock_summary input[type="text"], #view_mQuality_stock_summary input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performQualityStockSummarySearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		toDate: saveToDate,
//		factory: $("#qualityStockSummary_searchVal_factory").val(),
//		storage: $("#qualityStockSummary_searchVal_storage").val(),
//		car: $("#qualityStockSummary_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#qualityStockSummary_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#qualityStockSummary_searchVal_itemname").val().trim().toUpperCase()
//	};
//}
//
//// 검색 수행 함수 - DB 조회
//function performQualityStockSummarySearch() {
//	const { fromDate } = getDefaultDateRange();
//
//	let searchCriteria = getCurrentSearchCriteria();
//	searchCriteria.fromDate = fromDate;
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentQualityStockSummaryPage = 1;
//	performQualityStockSummaryDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetQualityStockSummarySearch() {
//	const factory = getCookie('selectedFactory');
//	
//	$("#qualityStockSummary_searchVal_factory").val(factory);
//	$("#qualityStockSummary_searchVal_car").val('');
//	$("#qualityStockSummary_searchVal_itemcode").val('');
//	$("#qualityStockSummary_searchVal_itemname").val('');
//
//	// 공장, 창고 기본값 설정
////	renderFactoryStorage()
//	
//	// 초기화 후 전체 데이터 다시 조회
//	currentQualityStockSummaryPage = 1;
//	performQualityStockSummaryDBSearch({ factory });
//
//	console.log('검색 조건이 초기화되었습니다.');
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
//	const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);	 // 이번 달 1일
//	const fromDate = fmtLocalDate(firstOfMonth);
//	return { fromDate };
//}
//
//window.downloadAllQualityStockSummaryData = function() {
//	const { fromDate } = getDefaultDateRange();
//
//	let searchCriteria = getCurrentSearchCriteria();
//	searchCriteria.fromDate = fromDate;
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_qualityStockSummary_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			data.forEach(row => {
//				// totalqty 값 계산
//				row.TOTALQTY = row.QTY - row.NOQTY1 +row.NOQTY2 + row.UNPACKQTY
//		    });
//			
//			// TOTALQTY 합계 계산
//	        const totalTotalQty = data.reduce((sum, row) => {
//	            const v = Number(row.TOTALQTY) || 0;
//	            return sum + v;
//	        }, 0);
//			
//			
//			// ⬅ 소수점 두자리까지만 나오도록 반올림
//			const totalTotalQtyHeader = Number(totalTotalQty.toFixed(2));
//			
//			// 엑셀용 컬럼 복사 + TOTALQTY 헤더만 수정
//	        const exportColumns = window.qualityStockSummaryColumns.map(col => {
//	            if (col.key === 'TOTALQTY') {
//	                // 헤더를 합계 값으로 표시 (원하는 텍스트로 바꿔도 됨)
//	                return {
//	                    ...col,
//	                    header: `${totalTotalQtyHeader}`
//	                    // 또는 그냥 합계 숫자만:
//	                    // header: String(totalTotalQty)
//	                };
//	            }
//	            return col;
//	        });
//			ExcelExporter.downloadExcel(data, exportColumns, {
//				fileName: 'QualityStockSummary_All',
//				sheetName: 'QualityStockSummary'
//			});
//			hideLoading();
//		},
//		error: function() {
//			alert("전체 데이터 조회에 실패했습니다.");
//			hideLoading();
//		}
//	});
//};
