///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 mQuality_exception_input_detail 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : qualityExceptionInputDetail -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : QualityExceptionInputDetail -> NewMenuName
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
//let allServerData = [];
//let filteredData_qualityExceptionInputDetail = [];
//let globalQualityExceptionInputDetailData = []; // 현재 조회된 데이터 저장
//let currentQualityExceptionInputDetailPage = 1; // 현재 페이지
//let qualityExceptionInputDetailItemsPerPage = 1000; // 페이지당 항목 수
//let totalQualityExceptionInputDetailCount = 0; // 서버에서 받은 총 개수 저장
//let totalQualityExceptionInputDetailTotalPages = 0; // 서버에서 받은 총 개수 저장
//window.filteredQualityExceptionInputDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.qualityExceptionInputDetailColumns = [
//	{ key: 'INDATE', header: 'Date' },
//	{ key: 'INTF_YN', header: 'Status' },
//	{ key: 'FACTORY', header: 'Factory' },
//	{ key: 'STORAGE', header: 'Storage' },
//	{ key: 'CAR', header: 'Car' },       
//	{ key: 'ITEMCODE', header: 'Itemcode' },
//	{ key: 'ITEMNAME', header: 'Itemname' },
//	{ key: 'QTY', header: 'Qty' },
//	{ key: 'OKQTY', header: 'OK Qty' },
//	{ key: 'NGQTY', header: 'NG Qty' },
//	{ key: 'LOGINID', header: 'User' },
//	{ key: 'TIME', header: 'Time' },
//	{ key: 'BARCODE', header: 'Barcode' },
//	{ key: 'SOURCE2', header: 'Type' },	
//	{ key: 'INVOICENO', header: 'Memo' },
//];
//
//$(document).ready(function() {
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_mQuality_exception_input_detail = function(menuId) {
//		showLoading("data");
//
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		performQualityExceptionInputDetailDBSearch({ fromDate, toDate, factory });
//	}
//});
//
//// DB에서 데이터 조회하는 함수
//function performQualityExceptionInputDetailDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_qualityExceptionInputDetail",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentQualityExceptionInputDetailPage,
//			itemsPerPage: qualityExceptionInputDetailItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalQualityExceptionInputDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalQualityExceptionInputDetailCount = data.totalCount || 0;
//			window.filteredQualityExceptionInputDetailData = globalQualityExceptionInputDetailData;
//
//			totalQualityExceptionInputDetailTotalPages = data.totalPages;
//			currentQualityExceptionInputDetailPage = data.currentPage;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_mQuality_exception_input_detail').length) {
//				renderQualityExceptionInputDetailView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderQualityExceptionInputDetailTableData();
//				renderQualityExceptionInputDetailPagination();
//				updateQualityExceptionInputDetailTotalCount();
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
//function renderQualityExceptionInputDetailView() {
//	let content_output = `
//		<div class="divBlockControl" id="view_mQuality_exception_input_detail">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<div class="search-label">
//							<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
//							<input type="date" id="qualityExceptionInputDetail_searchVal_fromDate" /> 
//						</div>
//						<div class="search-label">
//							<div class="searchVal_toDate">　</div>
//							<input type="date" id="qualityExceptionInputDetail_searchVal_toDate" />
//						</div>
//						<div class="search-label">
//							<div class="qualityExceptionInputDetail_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="qualityExceptionInputDetail_searchVal_factory" class="factory-select">
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="qualityExceptionInputDetail_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//							<select id="qualityExceptionInputDetail_searchVal_storage" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="qualityExceptionInputDetail_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="qualityExceptionInputDetail_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="qualityExceptionInputDetail_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="qualityExceptionInputDetail_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="qualityExceptionInputDetail_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="qualityExceptionInputDetail_searchVal_itemname" />
//						</div>
//						<div class="search-label">
//							<div class="qualityExceptionInputDetail_searchVal_source">${i18n.t('search.type')}<!-- TYPE --></div>
//							<select id="qualityExceptionInputDetail_searchVal_source" >
//								<option value="all">${i18n.t('search.all')}</option>
//								<option value="EXCEPTION">EXCEPTION</option>
//								<option value="STOCKCOUNT">STOCKCOUNT</option>
//							</select>
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnQualityExceptionInputDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnQualityExceptionInputDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<span>${i18n.t('table.info.total')} <strong id="qualityExceptionInputDetailTotalCount">${totalQualityExceptionInputDetailCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="qualityExceptionInputDetailCurrentPageInfo">${currentQualityExceptionInputDetailPage}</strong>/<strong id="qualityExceptionInputDetailTotalPageInfo">${totalQualityExceptionInputDetailTotalPages}</strong> |  
//							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="qualityExceptionInputDetailTotalQty" style="color:#007bff"></span>
//						</span>
//						<div class="action-buttons-right mQuality_exception_input_detail">
//							<div id="defaultActions" class="action-group">
//								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnQualityExceptionInputDelete"/>
//								<button class="btn btn-success" id="qualityExceptionInputDetailExcelBtn" onclick="downloadAllQualityExceptionInputDetailData()">Excel</button>
//							</div>
//						</div>
//						<div class="btnInterfaceCommon btnExceptionInputItemsArea" style="margin-left:24px;">
//							<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfExceptionInputSale"/>
//							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfExceptionInputDeleteSale"/>
//						</div>
//					</div>
//					<table class="data-table mQuality_exception_input_detail">
//						<thead>
//							<tr>
//								<th class = "checkboxVal">
//									<input type="checkbox" class="qualityExceptionInput_chkAll">
//								</th>
//								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//								<th class = "statusVal">${i18n.t('table.status')}</th>
//								<th class = "dateVal">${i18n.t('search.date')}<!-- INDATE --></th>
//								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
//								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
//								<th class = "qtyVal">${i18n.t('search.okqty')}<!-- QTY --></th>
//								<th class = "qtyVal">${i18n.t('search.ngqty')}<!-- QTY --></th>
//								<th class = "loginidVal">${i18n.t('search.user')}<!-- USER --></th>
//								<th class = "hhmmVal">${i18n.t('table.time')}<!-- TIME --></th>
//								<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- LOT --></th>
//								<th class = "cnameVal">${i18n.t('search.type')}<!-- type --></th>
//								<th class = "memoVal">${i18n.t('search.memo')}<!-- memo --></th>
//							</tr>
//						</thead>
//						<tbody id="qualityExceptionInputDetailTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="qualityExceptionInputDetailPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	/*<div class="search-label">
//							<div class="qualityExceptionInputDetail_searchVal_username">${i18n.t('search.username')}<!-- USERNAME --></div>
//							<input type="text" id="qualityExceptionInputDetail_searchVal_username" />
//						</div>*/
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="qualityExceptionInputDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredQualityExceptionInputDetailData, qualityExceptionInputDetailColumns, {fileName:'QualityExceptionInputDetail', sheetName:'QualityExceptionInputDetail'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#qualityExceptionInputDetail_searchVal_fromDate").val(fromDate);
//		$("#qualityExceptionInputDetail_searchVal_toDate").val(toDate);
//	})();
//	
//	// 공장 및 창고 선택
//	renderFactoryStorage();		
//	// 테이블 데이터 렌더링
//	renderQualityExceptionInputDetailTableData();
//	// 페이지네이션 렌더링
//	renderQualityExceptionInputDetailPagination();
//	// 이벤트 바인딩
//	bindQualityExceptionInputDetailEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateQualityExceptionInputDetailTotalCount();
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
//    const factory = $('#qualityExceptionInputDetail_searchVal_factory');
//    const storage = $('#qualityExceptionInputDetail_searchVal_storage');
//    const savedFactory = getCookie('selectedFactory');
//
//    // 공장별 창고 옵션 설정
//    function updateStorageOptions(factoryValue) {
//        storage.empty();
//        
//        const options = {
//            'SALTILLO': ['REDCAGE'],
//            'PUEBLA': ['REDCAGE'],
//            '': ['REDCAGE']
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
//function updateQualityExceptionInputDetailTotalCount() {
//	$('#qualityExceptionInputDetailTotalCount').text(totalQualityExceptionInputDetailCount.toLocaleString());
//}
//
//function renderQualityExceptionInputDetailTableData() {
//	let tableBody = "";
//
//	//console.log("globalQualityExceptionInputDetailData:", globalQualityExceptionInputDetailData);
//	//console.log("데이터 개수:", globalQualityExceptionInputDetailData.length);
//
//	$("#qualityExceptionInputDetailCurrentPageInfo").text(currentQualityExceptionInputDetailPage);
//	$("#qualityExceptionInputDetailTotalPageInfo").text(totalQualityExceptionInputDetailTotalPages);
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalQualityExceptionInputDetailData.length; i++) {
//		let rowNumber = (currentQualityExceptionInputDetailPage - 1) * qualityExceptionInputDetailItemsPerPage + i + 1;
//		let data = globalQualityExceptionInputDetailData[i];
//		
//		let statusText = data.intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
//		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';		
//		//console.log(`행 ${i}:`, globalQualityExceptionInputDetailData[i]); // 각 행 데이터 확인
//		
//		let source2 = "";
//		// source2 값 코드 -> 사유 변환
//		if(data.source2 == "EX01"){
//			source2 = i18n.t('reason.ex01')
//		}else if(data.source2 == "EX02"){
//			source2 = i18n.t('reason.ex02')
//		}else if(data.source2 == "EX03"){
//			source2 = i18n.t('reason.ex03')
//		}else if(data.source2 == "EX04"){
//			source2 = i18n.t('reason.ex04')
//		}else if(data.source2 == "EX05"){
//			source2 = i18n.t('reason.ex05')
//		}else{
//			source2 = data.source2
//		}
//		
//		tableBody += `
//            <tr>
//			    <td class = "checkboxVal"><input type="checkbox" class="qualityExceptionInput_chk ${statusClass}" 
//        			data-unique="${data.indate}_${data.itemcode}_${data.intf_yn}_${data.qty}_${data.factory}_${data.storage}_${data.barcode}"
//        			data-delete="${data.iid}_${data.indate}_${data.factory}_${data.storage}_${data.barcode}">
//        		</td>
//			    <td class = "noVal">${rowNumber}</td>
//			    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
//			    <td class = "dateVal">${data.INDATE || data.indate || ''}</td>
//			    <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
//			    <td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
//			    <td class = "carVal">${data.CAR || data.car || ''}</td>
//			    <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
//			    <td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
//			    <td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//				<td class = "qtyVal">${Number(data.OKQTY || data.okqty || 0).toLocaleString()}</td>
//				<td class = "qtyVal">${Number(data.NGQTY || data.ngqty || 0).toLocaleString()}</td>
//				<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
//				<td class = "hhmmVal">${data.TIME || data.time || ''}</td>
//				<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
//				<td class = 'cnameVal'>${source2}</td>
//				<td class = "memoVal">
//				    <span class="memoText" title="${data.INVOICENO || data.invoiceno || ''}">
//				    	${data.INVOICENO || data.invoiceno || ''}
//				    </span>
//				</td>
//			</tr>
//        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#qualityExceptionInputDetailTableBody").html(tableBody);
//	$(".qualityExceptionInput_chkAll").prop("checked", false);
//}
//
//// 페이지네이션 렌더링
//function renderQualityExceptionInputDetailPagination() {
//	let totalPages = Math.ceil(totalQualityExceptionInputDetailCount / qualityExceptionInputDetailItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentQualityExceptionInputDetailPage > 1) {
//		paginationHtml += `<button class="qualityExceptionInputDetail-page-btn" data-page="${currentQualityExceptionInputDetailPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="qualityExceptionInputDetail-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentQualityExceptionInputDetailPage - 5);
//	let endPage = Math.min(totalPages, currentQualityExceptionInputDetailPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="qualityExceptionInputDetail-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentQualityExceptionInputDetailPage) {
//			paginationHtml += `<button class="qualityExceptionInputDetail-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="qualityExceptionInputDetail-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="qualityExceptionInputDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentQualityExceptionInputDetailPage < totalPages) {
//		paginationHtml += `<button class="qualityExceptionInputDetail-page-btn" data-page="${currentQualityExceptionInputDetailPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="qualityExceptionInputDetail-page-btn disabled">&gt;</button>`;
//	}
//
//	$("#qualityExceptionInputDetailPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindQualityExceptionInputDetailEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.qualityExceptionInput_chkAll').on('change', '.qualityExceptionInput_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.qualityExceptionInput_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.qualityExceptionInput_chk').on('change', '.qualityExceptionInput_chk', function() {
//		let totalCheckboxes = $('.qualityExceptionInput_chk').length;
//		let checkedCheckboxes = $('.qualityExceptionInput_chk:checked').length;
//		$('.qualityExceptionInput_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//	
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnQualityExceptionInputDetailSearch").off('click').on('click', function() {
//		performQualityExceptionInputDetailSearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnQualityExceptionInputDetailSearchInit").off('click').on('click', function() {
//		resetQualityExceptionInputDetailSearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.qualityExceptionInputDetail-page-btn').on('click', '.qualityExceptionInputDetail-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentQualityExceptionInputDetailPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performQualityExceptionInputDetailDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_mQuality_exception_input_detail input[type="text"], #view_mQuality_exception_input_detail input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performQualityExceptionInputDetailSearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		fromDate: $("#qualityExceptionInputDetail_searchVal_fromDate").val(),
//		toDate: $("#qualityExceptionInputDetail_searchVal_toDate").val(),
//		factory: $("#qualityExceptionInputDetail_searchVal_factory").val(),
//		storage: $("#qualityExceptionInputDetail_searchVal_storage").val(),
//		car: $("#qualityExceptionInputDetail_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#qualityExceptionInputDetail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#qualityExceptionInputDetail_searchVal_itemname").val().trim().toUpperCase(),
//		source: $('#qualityExceptionInputDetail_searchVal_source').val()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performQualityExceptionInputDetailSearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentQualityExceptionInputDetailPage = 1;
//	performQualityExceptionInputDetailDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetQualityExceptionInputDetailSearch() {
//	const factory = getCookie('selectedFactory');
//	const { fromDate, toDate } = getDefaultDateRange();
//	renderFactoryStorage();
//	
//	$("#qualityExceptionInputDetail_searchVal_fromDate").val(fromDate);
//	$("#qualityExceptionInputDetail_searchVal_toDate").val(toDate);
//	$("#qualityExceptionInputDetail_searchVal_car").val('');
//	$("#qualityExceptionInputDetail_searchVal_itemcode").val('');
//	$("#qualityExceptionInputDetail_searchVal_itemname").val('');
//	$('#qualityExceptionInputDetail_searchVal_source').val('all')
//	// 초기화 후 전체 데이터 다시 조회
//	currentQualityExceptionInputDetailPage = 1;
//	performQualityExceptionInputDetailDBSearch({ fromDate, toDate, factory });
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
//window.changeQualityExceptionInputDetailItemsPerPage = function(newItemsPerPage) {
//	qualityExceptionInputDetailItemsPerPage = newItemsPerPage;
//	currentQualityExceptionInputDetailPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performQualityExceptionInputDetailDBSearch(searchCriteria);
//}
//
//window.exportQualityExceptionInputDetailData = function() {
//	return {
//		total: globalQualityExceptionInputDetailData.length,
//		currentPage: currentQualityExceptionInputDetailPage,
//		itemsPerPage: qualityExceptionInputDetailItemsPerPage,
//		data: globalQualityExceptionInputDetailData
//	};
//}
//
//function updateTotalQty() {
//	const searchMap = getCurrentSearchCriteria();
//	if (!searchMap) {
//		searchMap = {}; // null이면 빈 객체로 변경
//	}
//
//	$.ajax({
//		url: "/updateTotalQty_exception_input",
//		type: "POST",
//		data: JSON.stringify(searchMap),
//		contentType: "application/json",
//		success: function(data) {
//			$(".qualityExceptionInputDetailTotalQty").text(Number(data).toLocaleString());
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
//window.downloadAllQualityExceptionInputDetailData = function() {
//	let searchCriteria = {
//		fromDate: $("#qualityExceptionInputDetail_searchVal_fromDate").val(),
//		toDate: $("#qualityExceptionInputDetail_searchVal_toDate").val(),
//		factory: $("#qualityExceptionInputDetail_searchVal_factory").val(),
//		storage: $("#qualityExceptionInputDetail_searchVal_storage").val(),
//		car: $("#qualityExceptionInputDetail_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#qualityExceptionInputDetail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#qualityExceptionInputDetail_searchVal_itemname").val().trim().toUpperCase(),
//		source: $('#qualityExceptionInputDetail_searchVal_source').val()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_qualityExceptionInputDetail_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.qualityExceptionInputDetailColumns, {
//				fileName: 'QualityExceptionInputDetail_All',
//				sheetName: 'QualityExceptionInputDetail'
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
//// 삭제
//$(document).on("click", ".btnQualityExceptionInputDelete", function() {	
//	if ($(".qualityExceptionInput_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//	
//	const iidList = [];
//	$(".qualityExceptionInput_chk:checked").each(function() {
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
//		url: "/deleteExceptionInput",
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
//			performQualityExceptionInputDetailDBSearch(searchVal);	
//			
//			// 전체 선택 해제
//			$('.qualityExceptionInput_chkAll').prop('checked', false);
//		},
//		error: function(xhr, status, error) {
//			console.error("요청 실패");
//			console.error("Status:", status);       // 예: "error"
//			console.error("Error:", error);         // 예: 서버 응답 메시지
//			console.error("Response:", xhr.responseText); // 서버 응답 본문
//			alert("오류가 발생했습니다: " + error);
//		}
//	});
//});
//
//
//
////인터페이스
//$(document).on("click", ".btnIntfExceptionInputSale", function() {
//	
//	if ($(".qualityExceptionInput_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items'));
//		return;
//	}
//	
//	const iidList = [];
//	$(".qualityExceptionInput_chk:checked").each(function() {
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
//		url: "/exceptionInput_confirm_summary",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performQualityExceptionInputDetailDBSearch(searchVal);	
//			
//			// 전체 선택 해제
//			$('.qualityExceptionInput_chkAll').prop('checked', false);
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
//$(document).on("click", ".btnIntfExceptionInputDeleteSale", function() {
//
//	if ($(".qualityExceptionInput_chk.status-waiting:checked").length > 0) {
//		alert(i18n.t('validation.unconfirm.items'));
//		return;
//	}
//	
//	const iidList = [];
//	$(".qualityExceptionInput_chk:checked").each(function() {
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
//		url: "/exceptionInput_confirm_summary_cancel",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performQualityExceptionInputDetailDBSearch(searchVal);	
//			
//			// 전체 선택 해제
//			$('.qualityExceptionInput_chkAll').prop('checked', false);
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
