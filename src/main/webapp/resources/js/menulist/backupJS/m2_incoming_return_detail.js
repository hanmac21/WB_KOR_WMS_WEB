///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m2_incoming_return_detail 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : incomingReturnDetail -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : IncomingReturnDetail -> NewMenuName
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
//let globalIncomingReturnDetailData = []; // 현재 조회된 데이터 저장
//let currentIncomingReturnDetailPage = 1; // 현재 페이지
//let incomingReturnDetailItemsPerPage = 1000; // 페이지당 항목 수
//let totalIncomingReturnDetailCount = 0; // 서버에서 받은 총 개수 저장
//let totalIncomingReturnDetailTotalPages = 0; // 서버에서 받은 총 개수 저장
//window.filteredIncomingReturnDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//window.incomingReturnDetailColumns = [
//	{ key: 'INDATE', header: 'Date' },
//	{ key: 'FACTORY', header: 'Factory' },
//	{ key: 'STORAGE', header: 'Storage' },
//	{ key: 'TYPE', header: 'Type' },
//	{ key: 'CUSTNAME', header: 'Supplier' },
//	{ key: 'CAR', header: 'Car' },       // c.subname_ch AS car
//	{ key: 'ITEMCODE', header: 'Itemcode' },
//	{ key: 'ITEMNAME', header: 'Itemname' },
//	{ key: 'QTY', header: 'Qty' },
//	{ key: 'INVOICE_NO', header: 'Invoice No' },
//	{ key: 'LOGINID', header: 'Loginid' },
//	{ key: 'HHMM', header: 'Time' },
//	{ key: 'BARCODE', header: 'Barcode' }
//];
//
//$(document).ready(function() {
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m2_incoming_return_detail = function(menuId) {
//		showLoading("data");
//
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
//		performIncomingReturnDetailDBSearch({ fromDate, toDate, factory });
//	}
//});
//
//// DB에서 데이터 조회하는 함수
//function performIncomingReturnDetailDBSearch(searchCriteria) {
//	showLoading("data");
//
//	$.ajax({
//		url: "/read_incomingReturnDetail",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria,
//			page: currentIncomingReturnDetailPage,
//			itemsPerPage: incomingReturnDetailItemsPerPage
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log("-- DB 조회 결과 --");
//			console.log(data);
//
//			globalIncomingReturnDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//			totalIncomingReturnDetailCount = data.totalCount || 0;
//			window.filteredIncomingReturnDetailData = globalIncomingReturnDetailData;
//
//			totalIncomingReturnDetailTotalPages = data.totalPages;
//			currentIncomingReturnDetailPage = data.currentPage;
//
//			// 첫 번째 검색이라면 뷰를 렌더링
//			if (!$('#view_m2_incoming_return_detail').length) {
//				renderIncomingReturnDetailView();
//			} else {
//				// 기존 뷰가 있다면 테이블만 업데이트
//				renderIncomingReturnDetailTableData();
//				renderIncomingReturnDetailPagination();
//				updateIncomingReturnDetailTotalCount();
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
//function renderIncomingReturnDetailView() {
//	let loginid = $(".loginId").text().trim().toLowerCase();
//
//	let btnHtml = "";
//	if (loginid == "wms") {
//		btnHtml = `
//            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminIncomingReturnDelete"/>
//        `;
//	}
//
//	let content_output = `
//		<div class="divBlockControl" id="view_m2_incoming_return_detail">
//			<div class="content-body">
//				<!-- 검색 영역 -->
//				<div class="search-area">
//					<div class="search-row">
//						<div class="search-label" style="width:32%">
//							<div class="incoming_return_detail_searchVal_fromToDate">${i18n.t('search.date')}<!-- FromTo --></div>
//							<div class="incoming_return_detail_searchVal_fromToDateArea">
//								<input type="date" id="incoming_return_detail_searchVal_fromDate" class="dateRangeCommon"/>
//								<span class="middleWave">~</span>
//								<input type="date" id="incoming_return_detail_searchVal_toDate" class="dateRangeCommon"/>
//							</div>
//						</div>
//						<div class="search-label">
//							<div class="incoming_return_detail_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//							<select id="incoming_return_detail_searchVal_factory" class="factory-select">
//								<option value="SALTILLO">Saltillo</option>
//								<option value="PUEBLA">Puebla</option>
//								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="incoming_return_detail_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//							<select id="incoming_return_detail_searchVal_storage" >
//								<!-- 동적으로 추가 -->
//							</select>
//						</div>
//						<div class="search-label">
//							<div class="searchVal_cname">${i18n.t('search.suppliername')}<!-- CNAME --></div>
//							<input type="text" id="incoming_return_detail_searchVal_cname" />
//						</div>
//						<div class="search-label">
//							<div class="incoming_return_detail_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//							<input type="text" id="incoming_return_detail_searchVal_car" />
//						</div>
//						<div class="search-label">
//							<div class="incoming_return_detail_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//							<input type="text" id="incoming_return_detail_searchVal_itemcode" />
//						</div>
//						<div class="search-label">
//							<div class="incoming_return_detail_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//							<input type="text" id="incoming_return_detail_searchVal_itemname" />
//						</div>
//					</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnIncomingReturnDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnIncomingReturnDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<span>${i18n.t('table.info.total')} <strong id="incomingReturnDetailTotalCount">${totalIncomingReturnDetailCount}</strong> ${i18n.t('table.info.records')} | 
//							${i18n.t('table.page')} <strong id="incomingReturnDetailCurrentPageInfo">${currentIncomingReturnDetailPage}</strong>/<strong id="incomingReturnDetailTotalPageInfo">${totalIncomingReturnDetailTotalPages}</strong> |  
//							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="incomingReturnDetailTotalQty" style="color:#007bff"></span>
//						</span>
//						<div class="action-buttons-right m2_incoming_return_detail">
//							<div id="defaultActions" class="action-group">
//								${btnHtml}
//								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnIncomingReturnDelete"/>
//								<button class="btn btn-success" id="incomingReturnDetailExcelBtn" onclick="downloadAllIncomingReturnDetailData()">Excel</button>
//							</div>
//						</div>
//						<div class="btnInterfaceCommon btnIncomingReturnDetailItemsArea" style="margin-left:24px;">
//							<!-- <input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfIncomingReturnDetail"/> -->
//							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfIncomingReturnDetailCancel"/>
//						</div>
//					</div>
//					<table class="data-table m2_incoming_return_detail">
//						<thead>
//							<tr>
//								<th class = "checkboxVal">
//									<input type="checkbox" class="incomingReturn_chkAll">
//								</th>
//								<th class = 'noVal'>${i18n.t('table.no')}<!-- No --></th>
//								<th class = "statusVal">${i18n.t('table.status')}</th>								
//								<th class = 'dateVal'>${i18n.t('search.date')}<!-- INDATE --></th>
//								<th class = 'factoryVal'>${i18n.t('search.factory')}<!-- FACTORY --></th>
//								<th class = 'storageVal'>${i18n.t('search.storage')}<!-- STORAGE --></th>
//								<th class = 'typeVal'>${i18n.t('search.type')}<!-- TYPE --></th>
//								<th class = 'cnameVal'>${i18n.t('search.suppliername')}<!-- CNAME --></th>
//								<th class = 'carVal'>${i18n.t('search.car')}<!-- CAR --></th>
//								<th class = 'itemcodeVal'>${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//								<th class = 'itemnameVal'>${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//								<th class = 'qtyVal'>${i18n.t('search.qty')}<!-- QTY --></th>
//								<th class = 'invoiceNoVal'>${i18n.t('search.invoiceNo')}<!-- INVOICE_NO --></th>
//								<th class = 'loginidVal'>${i18n.t('search.user')}<!-- USER --></th>
//								<th class = 'hhmmVal'>${i18n.t('table.time')}<!-- HHMM --></th>
//								<th class = 'barcodeVal'>${i18n.t('search.barcode')}<!-- LOT --></th>
//							</tr>
//						</thead>
//						<tbody id="incomingReturnDetailTableBody">
//						</tbody>
//					</table>
//					
//					<!-- 페이지네이션 -->
//					<div class="pagination" id="incomingReturnDetailPaginationContainer">
//					</div>
//				</div>
//			</div>
//		</div>
//	`;
//	/*<div class="search-label">
//							<div class="incoming_return_detail_searchVal_username">${i18n.t('search.username')}<!-- USERNAME --></div>
//							<input type="text" id="incoming_return_detail_searchVal_username" />
//						</div>*/
//	// = 위에 data-table, search-row i18n 부분 추가
//	/*<button class="btn btn-success" id="incomingReturnDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredIncomingReturnDetailData, incomingReturnDetailColumns, {fileName:'IncomingReturnDetail', sheetName:'IncomingReturnDetail'})">Excel</button>*/
//	$(".w_contentArea").append(content_output);
//
//	// ⬇️ 추가: 화면에 기본 날짜 세팅
//	(function() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		$("#incoming_return_detail_searchVal_fromDate").val(fromDate);
//		$("#incoming_return_detail_searchVal_toDate").val(toDate);
//	})();
//
//	// 공장 및 창고 선택
//	renderFactoryStorage();
//	// 테이블 데이터 렌더링
//	renderIncomingReturnDetailTableData();
//	// 페이지네이션 렌더링
//	renderIncomingReturnDetailPagination();
//	// 이벤트 바인딩
//	bindIncomingReturnDetailEvents();
//	// 초기 렌더링 후 카운트 업데이트
//	updateIncomingReturnDetailTotalCount();
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
//	const factory = $('#incoming_return_detail_searchVal_factory');
//	const storage = $('#incoming_return_detail_searchVal_storage');
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
//		storage.val(storageList[0]);
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
//
//	window.autoSetStorageFields();
//}
//
//// 정규식으로 쿠기 가져오기
//function getCookie(cookieName) {
//	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//	return match ? decodeURIComponent(match[2]) : '';
//}
//
//// 총 개수를 업데이트하는 함수
//function updateIncomingReturnDetailTotalCount() {
//	$('#incomingReturnDetailTotalCount').text(totalIncomingReturnDetailCount);
//}
//
//function renderIncomingReturnDetailTableData() {
//	let tableBody = "";
//
//	//console.log("globalIncomingReturnDetailData:", globalIncomingReturnDetailData);
//	//console.log("데이터 개수:", globalIncomingReturnDetailData.length);
//
//	$("#incomingReturnDetailCurrentPageInfo").text(currentIncomingReturnDetailPage);
//	$("#incomingReturnDetailTotalPageInfo").text(totalIncomingReturnDetailTotalPages);
//	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//	for (let i = 0; i < globalIncomingReturnDetailData.length; i++) {
//		let rowNumber = (currentIncomingReturnDetailPage - 1) * incomingReturnDetailItemsPerPage + i + 1;
//		let data = globalIncomingReturnDetailData[i];
//
//		let statusText = data.intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
//		let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
//
//		//console.log(`행 ${i}:`, globalIncomingReturnDetailData[i]); // 각 행 데이터 확인
//
//		tableBody += `
//            <tr>
//			     <td class = "checkboxVal"><input type="checkbox" class="incomingReturn_chk ${statusClass}" 
//        			data-unique="${data.indate}_${data.itemcode}_${data.intf_yn}_${data.qty}_${data.factory}_${data.storage}_${data.barcode}_${data.mes_key}"
//        			data-delete="${data.iid}_${data.indate}_${data.factory}_${data.storage}_${data.barcode}">
//        		</td>
//			    <td class = "noVal">${rowNumber}</td>
//			    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
//			    <td class = 'dateVal'>${data.INDATE || data.indate || ''}</td>
//			    <td class = 'factoryVal'>${data.FACTORY || data.factory || ''}</td>
//			    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
//			    <td class = 'typeVal'>${data.TYPE || data.type || ''}</td>
//				<td class = 'cnameVal'>${data.CUSTNAME || data.custname || ''}</td>
//			    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
//			    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
//			    <td class = 'itemnameVal'>${data.ITEMNAME || data.itemname || ''}</td>
//			    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//			    <td class = 'invoiceNoVal'></td>
//				<td class = 'loginidVal'>${data.LOGINID || data.loginid || ''}</td>
//				<td class = 'hhmmVal'>${data.HHMM || data.hhmm || ''}</td>
//				<td class = 'barcodeVal'>${data.BARCODE || data.barcode || ''}</td>
//			</tr>
//        `;
//	}
//	// =
//	//console.log("생성된 tableBody:", tableBody);
//	$("#incomingReturnDetailTableBody").html(tableBody);
//	$('.incomingReturn_summary_chkAll').prop('checked', false);
//}
//
//// 페이지네이션 렌더링
//function renderIncomingReturnDetailPagination() {
//	let totalPages = Math.ceil(totalIncomingReturnDetailCount / incomingReturnDetailItemsPerPage); // 변경
//	let paginationHtml = "";
//
//	// 이전 버튼
//	if (currentIncomingReturnDetailPage > 1) {
//		paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="${currentIncomingReturnDetailPage - 1}">&lt;</button>`;
//	} else {
//		paginationHtml += `<button class="incomingReturnDetail-page-btn disabled">&lt;</button>`;
//	}
//
//	// 페이지 번호 버튼들
//	let startPage = Math.max(1, currentIncomingReturnDetailPage - 5);
//	let endPage = Math.min(totalPages, currentIncomingReturnDetailPage + 5);
//
//	// 첫 페이지
//	if (startPage > 1) {
//		paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="1">1</button>`;
//		if (startPage > 2) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//	}
//
//	// 중간 페이지들
//	for (let i = startPage; i <= endPage; i++) {
//		if (i === currentIncomingReturnDetailPage) {
//			paginationHtml += `<button class="incomingReturnDetail-page-btn active" data-page="${i}">${i}</button>`;
//		} else {
//			paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="${i}">${i}</button>`;
//		}
//	}
//
//	// 마지막 페이지
//	if (endPage < totalPages) {
//		if (endPage < totalPages - 1) {
//			paginationHtml += `<span class="page-dots">...</span>`;
//		}
//		paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//	}
//
//	// 다음 버튼
//	if (currentIncomingReturnDetailPage < totalPages) {
//		paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="${currentIncomingReturnDetailPage + 1}">&gt;</button>`;
//	} else {
//		paginationHtml += `<button class="incomingReturnDetail-page-btn disabled">&gt;</button>`;
//	}
//
//	$("#incomingReturnDetailPaginationContainer").html(paginationHtml);
//}
//
//// 이벤트 바인딩
//function bindIncomingReturnDetailEvents() {
//	// 전체 선택 체크박스
//	$(document).off('change', '.incomingReturn_chkAll').on('change', '.incomingReturn_chkAll', function() {
//		let isChecked = $(this).is(':checked');
//		$('.incomingReturn_chk').prop('checked', isChecked);
//	});
//
//	// 개별 체크박스
//	$(document).off('change', '.incomingReturn_chk').on('change', '.incomingReturn_chk', function() {
//		let totalCheckboxes = $('.incomingReturn_chk').length;
//		let checkedCheckboxes = $('.incomingReturn_chk:checked').length;
//		$('.incomingReturn_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
//	});
//
//	// 검색 버튼 클릭 - DB에서 새로 조회
//	$(".btnIncomingReturnDetailSearch").off('click').on('click', function() {
//		performIncomingReturnDetailSearch();
//	});
//
//	// 초기화 버튼 클릭
//	$(".btnIncomingReturnDetailSearchInit").off('click').on('click', function() {
//		resetIncomingReturnDetailSearch();
//	});
//
//	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//	$(document).off('click', '.incomingReturnDetail-page-btn').on('click', '.incomingReturnDetail-page-btn', function() {
//		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//			let page = parseInt($(this).data('page'));
//			if (page && page > 0) {
//				currentIncomingReturnDetailPage = page;
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performIncomingReturnDetailDBSearch(searchCriteria);
//			}
//		}
//	});
//
//	// 엔터키 검색
//	$('#view_m2_incoming_return_detail input[type="text"], #view_m2_incoming_return_detail input[type="date"]').off('keypress').on('keypress', function(e) {
//		if (e.which === 13) {
//			performIncomingReturnDetailSearch();
//		}
//	});
//}
//
//// 현재 검색 조건 수집 함수
//function getCurrentSearchCriteria() {
//	return {
//		fromDate: $("#incoming_return_detail_searchVal_fromDate").val(),
//		toDate: $("#incoming_return_detail_searchVal_toDate").val(),
//		factory: $("#incoming_return_detail_searchVal_factory").val(),
//		storage: $("#incoming_return_detail_searchVal_storage").val(),
//		cname: $("#incoming_return_detail_searchVal_cname").val().trim().toUpperCase(),
//		car: $("#incoming_return_detail_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#incoming_return_detail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#incoming_return_detail_searchVal_itemname").val().trim().toUpperCase()
//	};
//}
//// =
//// 검색 수행 함수 - DB 조회
//function performIncomingReturnDetailSearch() {
//	let searchCriteria = getCurrentSearchCriteria();
//
//	console.log("검색 조건:", searchCriteria);
//
//	// 페이지를 1로 초기화하고 DB에서 검색
//	currentIncomingReturnDetailPage = 1;
//	performIncomingReturnDetailDBSearch(searchCriteria);
//}
//
//// 검색 조건 초기화
//function resetIncomingReturnDetailSearch() {
//	const factory = getCookie('selectedFactory');
//	const { fromDate, toDate } = getDefaultDateRange();
//
//	$("#incoming_return_detail_searchVal_fromDate").val(fromDate);
//	$("#incoming_return_detail_searchVal_toDate").val(toDate);
//	$("#incoming_return_detail_searchVal_factory").val(factory);
//	$("#incoming_return_detail_searchVal_storage").val('Material');
//	$("#incoming_return_detail_searchVal_custcode").val('');
//	$("#incoming_return_detail_searchVal_cname").val('');
//	$("#incoming_return_detail_searchVal_car").val('');
//	$("#incoming_return_detail_searchVal_itemcode").val('');
//	$("#incoming_return_detail_searchVal_itemname").val('');
//	// 초기화 후 전체 데이터 다시 조회
//	currentIncomingReturnDetailPage = 1;
//	performIncomingReturnDetailDBSearch({ fromDate, toDate, factory });
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
//window.changeIncomingReturnDetailItemsPerPage = function(newItemsPerPage) {
//	incomingReturnDetailItemsPerPage = newItemsPerPage;
//	currentIncomingReturnDetailPage = 1;
//	let searchCriteria = getCurrentSearchCriteria();
//	performIncomingReturnDetailDBSearch(searchCriteria);
//}
//
//window.exportIncomingReturnDetailData = function() {
//	return {
//		total: globalIncomingReturnDetailData.length,
//		currentPage: currentIncomingReturnDetailPage,
//		itemsPerPage: incomingReturnDetailItemsPerPage,
//		data: globalIncomingReturnDetailData
//	};
//}
//function updateTotalQty() {
//	const searchMap = getCurrentSearchCriteria();
//	if (!searchMap) {
//		searchMap = {}; // null이면 빈 객체로 변경
//	}
//
//	$.ajax({
//		url: "/updateTotalQtyIncomingReturn",
//		type: "POST",
//		data: JSON.stringify(searchMap),
//		contentType: "application/json",
//		success: function(data) {
//			$(".incomingReturnDetailTotalQty").text(Number(data).toLocaleString());
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
//window.downloadAllIncomingReturnDetailData = function() {
//	let searchCriteria = {
//		fromDate: $("#incoming_return_detail_searchVal_fromDate").val(),
//		toDate: $("#incoming_return_detail_searchVal_toDate").val(),
//		factory: $("#incoming_return_detail_searchVal_factory").val(),
//		storage: $("#incoming_return_detail_searchVal_storage").val(),
//		car: $("#incoming_return_detail_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#incoming_return_detail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#incoming_return_detail_searchVal_itemname").val().trim().toUpperCase()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_incomingReturnDetail_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.incomingReturnDetailColumns, {
//				fileName: 'IncomingReturnDetail_All',
//				sheetName: 'IncomingReturnDetail'
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
//$(document).on("click", ".btnIncomingReturnDelete", function() {
//	if ($(".incomingReturn_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//
//	const iidList = [];
//	$(".incomingReturn_chk:checked").each(function() {
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
//		url: "/deleteIncomingReturn",
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
//						} else if (item.failReason === 'INBOUND AND OUTBOUND') {
//							message += `- Incoming And Location Time Different\n${item.barcode}\n`;
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
//
//				alert(message);
//				return;
//			}
//
//			let searchVal = getCurrentSearchCriteria();
//			performIncomingReturnDetailDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.incomingReturn_chkAll').prop('checked', false);
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
//$(document).on("click", ".btnAdminIncomingReturnDelete", function() {
//	if ($(".incomingReturn_chk.status-completed:checked").length > 0) {
//		alert(i18n.t('validation.confirm.items.delete'));
//		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
//		return;
//	}
//
//	const iidList = [];
//	$(".incomingReturn_chk:checked").each(function() {
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
//		url: "/deleteIncomingReturn",
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
//				performIncomingReturnDetailDBSearch(searchVal);
//
//				// 전체 선택 해제
//				$('.incomingReturn_chkAll').prop('checked', false);
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
//
///*
// * 251105 등록 기능 사용X로 주석처리
// */
////$(document).on("click", ".btnIntfIncomingReturnDetail", function() {
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
////	$(".incomingReturn_summary_chk:checked").each(function() {
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
////		url: "/incomingReturn_confirm_summary",
////		type: "POST",
////		data: JSON.stringify(iidList),
////		contentType: "application/json",
////		success: function(data) {
////			let searchVal = getCurrentSearchCriteria();
////			performIncomingReturnSummaryDBSearch(searchVal);
////			
////			// 전체 선택 해제
////			$('.incomingReturn_summary_chkAll').prop('checked', false);
////		},
////		error: function(xhr, status, error) {
////			console.error("요청 실패");
////			console.error("Status:", status);       // 예: "error"
////			console.error("Error:", error);         // 예: 서버 응답 메시지
////			console.error("Response:", xhr.responseText); // 서버 응답 본문
////			alert("오류가 발생했습니다: " + error);
////		}
////	});
////});
//
//$(document).on("click", ".btnIntfIncomingReturnDetailCancel", function() {
//
//	if ($(".incomingReturn_chk.status-waiting:checked").length > 0) {
//		alert(i18n.t('validation.unconfirm.items'));
//		return;
//	}
//
//	const iidList = [];
//	$(".incomingReturn_chk:checked").each(function() {
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
//		url: "/incomingReturn_confirm_summary_cancel",
//		type: "POST",
//		data: JSON.stringify(iidList),
//		contentType: "application/json",
//		success: function(data) {
//			let searchVal = getCurrentSearchCriteria();
//			performIncomingReturnSummaryDBSearch(searchVal);
//
//			// 전체 선택 해제
//			$('.incomingReturn_summary_chkAll').prop('checked', false);
//		},
//		error: function(xhr, status, error) {
//			// ❌ alert(res.message) <- res 없음 (버그)
//			window.handleAjaxError(xhr, status, error);
//		}
//
//	});
//
//});