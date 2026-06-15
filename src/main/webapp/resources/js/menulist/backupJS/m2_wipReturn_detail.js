///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_wipReturn_Detail 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : wipReturnDetail -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : WipReturnDetail -> NewMenuName
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
//let globalWipReturnDetailData = []; // 현재 조회된 데이터 저장
//let currentWipReturnDetailPage = 1; // 현재 페이지
//let wipReturnDetailItemsPerPage = 1000; // 페이지당 항목 수
//let totalWipReturnDetailCount = 0; // 서버에서 받은 총 개수 저장
//let totalWipReturnDetailQty = 0; // 서버에서 받은 총 개수 저장
//let totalWipReturnDetailPages = 0; // 서버에서 받은 총 페이지
//window.filteredWipReturnDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.wipReturnDetailColumns = [
//	{ key: 'INTF_YN', header: 'Status' },
//	{ key: 'INDATE', header: 'Date' },
//	{ key: 'FACTORY', header: 'Factory' },
//	{ key: 'STORAGE', header: 'Storage' },
//	{ key: 'CAR', header: 'Car' },
//	{ key: 'ITEMCODE', header: 'Itemcode' },
//	{ key: 'ITEMNAME', header: 'Itemname' },
//	{ key: 'QTY', header: 'Qty' },
//	{ key: 'ROOMCODE', header: 'Location' },
//	{ key: 'WCCODE', header: 'Wccode' },
//	{ key: 'LOGINID', header: 'User' },
//	{ key: 'HHMM', header: 'Time' },
//	{ key: 'BARCODE', header: 'Barcode' },
//];
//
//$(document).ready(function() {	
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_wipReturn_detail = function(menuId) {
//		showLoading("data");
//		const { fromDate, toDate } = getDefaultDateRange();
//		
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위로 조회
//		performWipReturnDetailDBSearch({ fromDate, toDate, factory });
//	}
//});
//
//// DB에서 데이터 조회하는 함수
//function performWipReturnDetailDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_wipReturnDetail",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentWipReturnDetailPage,
//			itemsPerPage: wipReturnDetailItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalWipReturnDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalWipReturnDetailCount = data.totalCount || 0;
//			totalWipReturnDetailQty = data.totalQty || 0;
//			totalWipReturnDetailPages = data.totalPages || 0;
//			currentWipReturnDetailPage = data.currentPage || 0;
//			window.filteredWipReturnDetailData = globalWipReturnDetailData;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_wipReturn_detail').length) {
//				renderWipReturnDetailView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderWipReturnDetailTableData();
//				renderWipReturnDetailPagination();
//				updateWipReturnDetailTotalCount();
//				updateWipReturnDetailTotalQty();
//			}
//
//			hideLoading();
//		},
//		error: function(xhr, status, error) {
//			console.error("DB 조회 실패:", error);
//			 console.error('[WIP Return Detail][AJAX ERROR]',
//				      { status, error, httpStatus: xhr.status, resp: xhr.responseText });
//			hideLoading();
//			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
//		}
//	});
//}
//
//// 사용자 뷰 렌더링 함수
//function renderWipReturnDetailView() {
//	let loginid = $(".loginId").text().trim().toLowerCase();
//
//	let btnHtml = "";
//	if (loginid == "wms") {
//		btnHtml = `
//            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminWipReturnDelete"/>
//        `;
//	}
//	
//	let content_output = `
//		<div class="divBlockControl" id="view_m2_wipReturn_detail">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<div class="search-label">
//							<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//							<input type="date" id="wipReturnDetail_searchVal_fromDate" /> 
//						</div>
//						<div class="search-label">
//							<div class="searchVal_toDate">　</div>
//							<input type="date" id="wipReturnDetail_searchVal_toDate" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="wipReturnDetail_searchVal_factory" class="factory-select">
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//							<select id="wipReturnDetail_searchVal_storage" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_wccode">${i18n.t('search.wccode')}<!-- WCCODE --></div>
//							<select id="wipReturnDetail_searchVal_wccode" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="wipReturnDetail_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="wipReturnDetail_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="wipReturnDetail_searchVal_itemname" />
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnWipReturnDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnWipReturnDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<span>${i18n.t('table.info.total')} <strong id="wipReturnDetailTotalCount">${totalWipReturnDetailCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="wipReturnDetailCurrentPageInfo">${currentWipReturnDetailPage}</strong>/<strong id="wipReturnDetailTotalPageInfo">${totalWipReturnDetailPages}</strong> | 
//							${i18n.t('table.info.qty')} : <strong id = "wipReturnDetailTotalQty"></strong>
//						</span>
//						<div class="action-buttons-right m2_wipReturn_detail">
//							<div id="defaultActions" class="action-group">
//								${btnHtml}
//								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnWipReturnDelete"/>
//								<button class="btn btn-success" id="wipReturnDetailExcelBtn" onclick="downloadAllWipReturnDetailData()">Excel</button>
//							</div>
//						</div>
//						<div class="btnIntfCommon btnWipReturnDetailItemsArea">
//							<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfWipReturnSummary"/>
//							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfWipReturnSummaryCancel"/>
//						</div>
//					</div>
//					<table class="data-table m2_wipReturn_detail">
//						<thead>
//							<tr>
//								<th class = "checkboxVal">
//									<input type="checkbox" class="wipReturn_chkAll">
//								</th>
//								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>										
//								<th class = "statusVal">${i18n.t('table.status')} <!-- STATUS --></th>
//								<th class = "dateVal">${i18n.t('table.date')}<!-- INDATE --></th>
//								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>									
//								<th class = "locationVal">${i18n.t('search.location')}<!-- ROOMCODE --></th>
//								<th class = "wccodeVal">${i18n.t('search.wccode')}<!-- WCCODE --></th>
//								<th class = "loginidVal">${i18n.t('search.user')}<!-- USER --></th>	
//								<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>	
//								<th class = 'barcodeVal'>${i18n.t('search.barcode')}<!-- LOT --></th>									
//							</tr>
//						</thead>
//						<tbody id="wipReturnDetailTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="wipReturnDetailPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="wipReturnDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredWipReturnDetailData, wipReturnDetailColumns, {fileName:'WipReturnDetail', sheetName:'WipReturnDetail'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//	
//	/* 미사용 컬럼 정리 25-09-25 */
//	/*
//		<th class = "lotVal">${i18n.t('table.lot')}<!-- LOT --></th>
//								<th class = "seqVal">${i18n.t('table.seq')}<!-- SEQ --></th></th>
//								
//								
//			<td class = "lotVal">${globalWipReturnDetailData[i].LOT || globalWipReturnDetailData[i].lot || ''}</td>
//			<td class = "seqVal">${globalWipReturnDetailData[i].SEQ || globalWipReturnDetailData[i].seq || ''}</td></td>
//		
//	*/
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function(){
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#wipReturnDetail_searchVal_fromDate").val(fromDate);
//		$("#wipReturnDetail_searchVal_toDate").val(toDate);
//		})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();		
//	// 테이블 데이터 렌더링
//	renderWipReturnDetailTableData();
//	// 페이지네이션 렌더링
//	renderWipReturnDetailPagination();
//	// 이벤트 바인딩
//	bindWipReturnDetailEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateWipReturnDetailTotalCount();
//	// 초기 렌더링 후 수량 업데이트
//	updateWipReturnDetailTotalQty();
//
//}
//
//// 공장 및 창고 선택 함수
//function renderFactoryStorage() {
//    const factory = $('#wipReturnDetail_searchVal_factory');
//    const storage = $('#wipReturnDetail_searchVal_storage');
//    const wccode = $('#wipReturnDetail_searchVal_wccode');
//    const savedFactory = getCookie('selectedFactory');
//
//    // 공장별 창고 옵션 설정
//    function updateStorageOptions(factoryValue) {
//        storage.empty();
//        
//        const options = {
//            'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'P1 W/HOUSE', 'all'],
//            'PUEBLA': ['Material', 'PRODUCT', 'all'],
//            '': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'P1 W/HOUSE', 'all']
//        };
//        
//        const storageList = options[factoryValue] || options[''];
//        
//        storageList.forEach(item => {
//            const text = item === 'all' ? i18n.t('search.all') : item;
//            storage.append(`<option value="${item}">${text}</option>`);
//        });
//        
//        // 첫 번째 옵션 선택 (Material)
//        storage.val(storageList[0]);
//        
//        window.autoSetStorageFields();
//    }
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
//	
//	window.autoSetStorageFields();
//}
//
//// 정규식으로 쿠기 가져오기
//function getCookie(cookieName) {
//    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//    return match ? decodeURIComponent(match[2]) : '';
//}
//
//// 총 개수를 업데이트하는 함수
//function updateWipReturnDetailTotalCount() {
//	$('#wipReturnDetailTotalCount').text(totalWipReturnDetailCount);
//}
//// 총 개수를 업데이트하는 함수
//function updateWipReturnDetailTotalQty() {
//	$('#wipReturnDetailTotalQty').text(totalWipReturnDetailQty.toLocaleString());
//}
//function renderWipReturnDetailTableData() {
//	let tableBody = "";
//
//	//console.log("globalWipReturnDetailData:", globalWipReturnDetailData);
//	//console.log("데이터 개수:", globalWipReturnDetailData.length);
//
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalWipReturnDetailData.length; i++) {
//		let rowNumber = (currentWipReturnDetailPage - 1) * wipReturnDetailItemsPerPage + i + 1;
//		let data = globalWipReturnDetailData[i];
//		
//		let statusText = data.intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
//		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';		
//
//		//console.log(`행 ${i}:`, globalWipReturnDetailData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//        <tr>
//		    <td class = "checkboxVal"><input type="checkbox" class="wipReturn_chk ${statusClass}" 
//    			data-unique="${data.indate}_${data.itemcode}_${data.intf_yn}_${data.qty}_${data.factory}_${data.storage}_${data.barcode}_${data.wms_key}"
//    			data-delete="${data.iid}_${data.indate}_${data.factory}_${data.storage}_${data.barcode}">
//    		</td>
//		    <td class = "noVal">${rowNumber}</td>
//		    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
//            <td class = "dateVal">${data.INDATE || data.indate || ''}</td>
//            <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
//			<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
//			<td class = "carVal">${data.CAR || data.car || ''}</td>
//			<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
//			<td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
//			<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//			<td class = "locationVal">${data.ROOMCODE || data.roomcode || ''}</td>
//			<td class = "wccodeVal">${data.WCCODE || data.wccode || ''}</td>
//			<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
//			<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
//			<td class = 'barcodeVal'>${data.barcode || data.BARCODE || ''}</td>
//        </tr>
//    `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#wipReturnDetailTableBody").html(tableBody);
//	$(".wipReturn_chkAll").prop("checked", false);
//
//}
//
//// 페이지네이션 렌더링
//function renderWipReturnDetailPagination() {
//	let totalPages = Math.ceil(totalWipReturnDetailCount / wipReturnDetailItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentWipReturnDetailPage > 1) {
//		paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="${currentWipReturnDetailPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="wipReturnDetail-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentWipReturnDetailPage - 5);
//	let endPage = Math.min(totalPages, currentWipReturnDetailPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentWipReturnDetailPage) {
//			paginationHtml += `<button class="wipReturnDetail-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentWipReturnDetailPage < totalPages) {
//		paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="${currentWipReturnDetailPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="wipReturnDetail-page-btn disabled">&gt;</button>`;
//	}
//	
//	$('#wipReturnDetailCurrentPageInfo').text(currentWipReturnDetailPage);
//	$('#wipReturnDetailTotalPageInfo').text(totalPages);
//	$("#wipReturnDetailPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindWipReturnDetailEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.wipReturn_chkAll').on('change', '.wipReturn_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.wipReturn_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.wipReturn_chk').on('change', '.wipReturn_chk', function() {
//		let totalCheckboxes = $('.wipReturn_chk').length;
//		let checkedCheckboxes = $('.wipReturn_chk:checked').length;
//		$('.wipReturn_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//	
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnWipReturnDetailSearch").off('click').on('click', function() {
//		performWipReturnDetailSearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnWipReturnDetailSearchInit").off('click').on('click', function() {
//		resetWipReturnDetailSearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.wipReturnDetail-page-btn').on('click', '.wipReturnDetail-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentWipReturnDetailPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performWipReturnDetailDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_wipReturn_detail input[type="text"], #view_m2_wipReturn_detail input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performWipReturnDetailSearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		fromDate: $("#wipReturnDetail_searchVal_fromDate").val(),
//		toDate: $("#wipReturnDetail_searchVal_toDate").val(),
//		factory : $("#wipReturnDetail_searchVal_factory").val(),
//		storage : $("#wipReturnDetail_searchVal_storage").val(),
//		car : $("#wipReturnDetail_searchVal_car").val().trim().toUpperCase(),
//		itemcode : $("#wipReturnDetail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#wipReturnDetail_searchVal_itemname").val().trim().toUpperCase(),
//		wccode: $("#wipReturnDetail_searchVal_wccode").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performWipReturnDetailSearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentWipReturnDetailPage = 1;
//	performWipReturnDetailDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetWipReturnDetailSearch() {
//	const { fromDate, toDate } = getDefaultDateRange();
//	const factory = getCookie('selectedFactory');
//	$("#wipReturnDetail_searchVal_fromDate").val(fromDate);
//	$("#wipReturnDetail_searchVal_toDate").val(toDate);
//	$("#wipReturnDetail_searchVal_car").val(''); 
//	$("#wipReturnDetail_searchVal_itemcode").val(''); 
//	$("#wipReturnDetail_searchVal_itemname").val(''); 
//	
//	// 공장, 창고, 작업장 초기화
//	renderFactoryStorage();
//	
//	// =
//	// 초기화 후 전체 데이터 다시 조회
//	currentWipReturnDetailPage = 1;
//	performWipReturnDetailDBSearch({ fromDate, toDate, factory });
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
//window.changeWipReturnDetailItemsPerPage = function(newItemsPerPage) {
//	wipReturnDetailItemsPerPage = newItemsPerPage;
//	currentWipReturnDetailPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performWipReturnDetailDBSearch(searchCriteria);
//}
//
//window.exportWipReturnDetailData = function() {
//	return {
//		total: globalWipReturnDetailData.length,
//		currentPage: currentWipReturnDetailPage,
//		itemsPerPage: wipReturnDetailItemsPerPage,
//		data: globalWipReturnDetailData
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
//window.downloadAllWipReturnDetailData = function() {
//	let searchCriteria = {
//		fromDate : $("#wipReturnDetail_searchVal_fromDate").val(),
//		toDate : $("#wipReturnDetail_searchVal_toDate").val(),
//		factory : $("#wipReturnDetail_searchVal_factory").val(),
//		storage : $("#wipReturnDetail_searchVal_storage").val(),
//		car : $("#wipReturnDetail_searchVal_car").val().trim().toUpperCase(),
//		itemcode : $("#wipReturnDetail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#wipReturnDetail_searchVal_itemname").val().trim().toUpperCase(),
//		wccode: $("#wipReturnDetail_searchVal_wccode").val().trim().toUpperCase()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_wipReturnDetail_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.wipReturnDetailColumns, {
//				fileName: 'WipReturnDetail_All',
//				sheetName: 'WipReturnDetail'
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
//// 데이터 삭제
//$(document).on("click", ".btnWipReturnDelete", function() {	
//	if ($(".wipReturn_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//	
//	const iidList = [];
//	$(".wipReturn_chk:checked").each(function() {
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
//		url: "/deleteWipReturn",
//		type: "POST",
//		data: JSON.stringify({
//			iidList : iidList,
//			loginid : loginid
//		}),
//		contentType: "application/json",
//		success: function(data) {
//            if (!data.success) {
//                hideLoading();
//                
//                let message = "";
//                
//                // 검증 실패
//                if (data.failList && data.failList.length > 0){
//                	message = "Some items cannot be deleted\n\n"; // 삭제할 수 없는 항목이 있습니다.
//                    
//                    data.failList.forEach(function(item) {
//                    	if (item.failReason === 'INVALID_KIND'){
//                    		alert(`Code Error!`);
//                    		return;
//                    	} else if (item.failReason === 'POST_PROCESSING') {
//                            message += `- Post-processing data exists\n${item.barcode}\n`; // 후처리 데이터 존재
//                        } else if (item.failReason === 'MAGAM') {
//                            message += `- Monthly closing completed\n${item.barcode}\n`; // 월 마감 완료
//                        }
//                    });
//                    
//                }
//                // 삭제 실패
//                else if (data.failReason === 'DELETE_FAILED'){
//                	message = "Failed to delete\n\n";
//                	message += `Operation: ${data.failedOperation}\n`;
//                	message += `Barcode: ${data.failedBarcode}\n\n`;	
//                }   
//                
//                
//                alert(message);
//                return;
//            }
//			
//			let searchVal = getCurrentSearchCriteria();
//			performWipReturnDetailDBSearch(searchVal);	
//			
//			// 전체 선택 해제
//			$('.wipReturn_chkAll').prop('checked', false);
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//	});
//});
//
//
//// 관리자용 삭제
//$(document).on("click", ".btnAdminWipReturnDelete", function() {	
//	if ($(".wipReturn_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//	
//	const iidList = [];
//	$(".wipReturn_chk:checked").each(function() {
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
//		url: "/deleteWipReturn",
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
//		        let searchVal = getCurrentSearchCriteria();
//		        performWipReturnDetailDBSearch(searchVal);	
//		        
//		        // 전체 선택 해제
//		        $('.wipReturn_chkAll').prop('checked', false);
//			} else {
//		        alert("삭제에 실패했습니다.");
//		    }			
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
//
//// 인터페이스 등록
//$(document).on("click", ".btnIntfWipReturnSummary", function() {
//	if ($(".wipReturn_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items'));
//		return;
//	}
//	
//	const iidList = [];
//	$(".wipReturn_chk:checked").each(function() {
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
//		url: "/wipReturn_confirm_summary",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performWipReturnDetailDBSearch(searchVal);
//			
//			// 전체 선택 해제
//			$('.wipReturn_chkAll').prop('checked', false);
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//	});
//
//});
//
//// 인터페이스 삭제
//$(document).on("click", ".btnIntfWipReturnSummaryCancel", function() {
//	if ($(".wipReturn_chk.status-waiting:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items'));
//		return;
//	}
//	
//	const iidList = [];
//	$(".wipReturn_chk:checked").each(function() {
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
//		url: "/wipReturn_confirm_summary_cancel",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performWipReturnDetailDBSearch(searchVal);
//			
//			// 전체 선택 해제
//			$('.wipReturn_chkAll').prop('checked', false);
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//	});
//
//});
//
