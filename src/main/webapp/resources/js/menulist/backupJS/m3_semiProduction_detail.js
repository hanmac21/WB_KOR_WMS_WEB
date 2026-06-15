///* --------------------------------------------------------------
// * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
// * 비고: 검색 버튼 클릭 시마다 DB에서 조회
// * 
// * DB 검색 버전 초기 세팅 파일
// * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
// * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
// * 
// * 1. 메뉴명 m3_semiProduction_detail 을 전부 사용하는 메뉴명으로 Replace
// * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : semiProductionDetail -> newMenuName
// * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : SemiProductionDetail -> NewMenuName
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
//$(document).ready(function() {
//
//	let globalSemiProductionDetailData = []; // 현재 조회된 데이터 저장
//	let currentSemiProductionDetailPage = 1; // 현재 페이지
//	let semiProductionDetailItemsPerPage = 1000; // 페이지당 항목 수
//	let totalSemiProductionDetailCount = 0; // 서버에서 받은 총 개수 저장
//	let totalSemiProductionDetailQty = 0; // 서버에서 받은 총 개수 저장
//	let totalSemiProductionDetailPages = 0; // 서버에서 받은 총 페이지
//	window.filteredSemiProductionDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//	window.semiProductionDetailColumns = [
//		{ key: 'SDATE', header: 'sdate' },
//		{ key: 'INTF_YN', header: 'Status' },
//		{ key: 'FACTORY', header: 'factory' },
//		{ key: 'LINENO', header: 'line no' },
//		{ key: 'CAR', header: 'car' },
//		{ key: 'ITEMCODE', header: 'itemcode' },
//		{ key: 'ITEMNAME', header: 'itemname' },
//		{ key: 'OKQTY', header: 'OKqty' },
//		{ key: 'NGQTY', header: 'NGqty' },
//		{ key: 'LOGINID', header: 'loginid' },
//		{ key: 'TIME', header: 'time' },
//		{ key: 'BARCODE', header: 'lot' }
//	];
//
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_m3_semiProduction_detail = function(menuId) {
//		showLoading("data");
//		const { fromDate, toDate } = getDefaultDateRange();
//		
//		const factory = getCookie('selectedFactory');
//
//		// 초기 로딩: 기본 날짜 범위로 조회
//		performSemiProductionDetailDBSearch({ fromDate, toDate, factory });
//	}
//
//	// DB에서 데이터 조회하는 함수
//	function performSemiProductionDetailDBSearch(searchCriteria) {
//		showLoading("data");
//
//		$.ajax({
//			url: "/read_semiProductionDetail",
//			type: "POST",
//			data: JSON.stringify({
//				searchParams: searchCriteria,
//				page: currentSemiProductionDetailPage,
//				itemsPerPage: semiProductionDetailItemsPerPage
//			}),
//			contentType: "application/json",
//			success: function(data) {
//				console.log("-- DB 조회 결과 --");
//				console.log(data);
//
//				globalSemiProductionDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//				totalSemiProductionDetailCount = data.totalCount || 0;
//				totalSemiProductionDetailQty = data.totalQty || 0;
//				totalSemiProductionDetailPages = data.totalPages || 0;
//				currentSemiProductionDetailPage = data.currentPage || 0;
//				window.filteredSemiProductionDetailData = globalSemiProductionDetailData;
//				
//				// 첫 번째 검색이라면 뷰를 렌더링
//				if (!$('#view_m3_semiProduction_detail').length) {
//					renderSemiProductionDetailView();
//				} else {
//					// 기존 뷰가 있다면 테이블만 업데이트
//					renderSemiProductionDetailTableData();
//					renderSemiProductionDetailPagination();
//					updateSemiProductionDetailTotalCount();
//					updateSemiProductionDetailTotalQty();
//				}
//
//				hideLoading();
//			},
//			error: function(xhr, status, error) {				
//				if(xhr && xhr.status === 401) return;
//				
//				console.error("DB 조회 실패:", error);
//				hideLoading();
//				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
//			}
//		});
//	}
//
//	// 사용자 뷰 렌더링 함수
//	function renderSemiProductionDetailView() {
//		let content_output = `
//			<div class="divBlockControl" id="view_m3_semiProduction_detail">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//								<input type="date" id="semiProductionDetail_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="semiProductionDetail_searchVal_toDate" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//								<select id="semiProductionDetail_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="semiProductionDetail_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="semiProductionDetail_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="semiProductionDetail_searchVal_itemname" />
//							</div>
//						</div>
//							<div class="search_button_area">
//								<button class="btn btn-primary btnSemiProductionDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//								<button class="btn btn-secondary btnSemiProductionDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//							<span>${i18n.t('table.info.total')} <strong id="semiProductionDetailTotalCount">${totalSemiProductionDetailCount}</strong> ${i18n.t('table.info.records')} | 
//								${i18n.t('table.page')} <strong id="semiProductionDetailCurrentPageInfo">${currentSemiProductionDetailPage}</strong>/<strong id="semiProductionDetailTotalPageInfo">${totalSemiProductionDetailPages}</strong> | 
//								${i18n.t('table.info.qty')} : <strong id = "semiProductionDetailTotalQty"></strong>
//							</span>
//							<div class="action-buttons-right m3_semiProduction_detail">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="semiProductionDetailExcelBtn" onclick="downloadAllSemiProductionDetailData()">Excel</button>
//								</div>
//							</div>
//							<div class="btnInterfaceCommon btnSemiProductionDetailItemsArea" style="margin-left:24px;">
//								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfSemiProductionDetailDelete"/>
//							</div>
//						</div>
//						<table class="data-table m3_semiProduction_detail">
//							<thead>
//								<tr>
//									<th class = "checkboxVal">
//										<input type="checkbox" class="semiProduction_chkAll">
//									</th>
//									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
//									<th class = "statusVal">${i18n.t('table.status')}</th>
//									<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
//									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//									<th class = "linenoVal">Line No<!-- lineno --></th>
//									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									<th class = "qtyVal">${i18n.t('search.okqty')}<!-- QTY --></th>
//									<th class = "qtyVal">${i18n.t('search.ngqty')}<!-- QTY --></th>
//									<th class = "loginidVal">${i18n.t('search.user')}<!-- loginid --></th>
//									<th class = "timeVal">${i18n.t('table.time')}<!-- TIME --></th>
//									<th class = "barcodeVal">${i18n.t('table.lot')}<!-- LOT --></th>
//								</tr>
//							</thead>
//							<tbody id="semiProductionDetailTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="semiProductionDetailPaginationContainer">
//						</div>
//					</div>
//				</div>
//			</div>
//		`;
//		// = 위에 data-table, search-row i18n 부분 추가
//		/*<button class="btn btn-success" id="semiProductionDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredSemiProductionDetailData, semiProductionDetailColumns, {fileName:'SemiProductionDetail', sheetName:'SemiProductionDetail'})">Excel</button>*/
//		$(".w_contentArea").append(content_output);
//
//		// ⬇️ 추가: 화면에 기본 날짜 세팅
//		(function(){
//			const { fromDate, toDate } = getDefaultDateRange();
//			$("#semiProductionDetail_searchVal_fromDate").val(fromDate);
//			$("#semiProductionDetail_searchVal_toDate").val(toDate);
//  		})();
//		
//		// 공장 및 창고 선택
//		renderFactoryStorage();	
//		// 테이블 데이터 렌더링
//		renderSemiProductionDetailTableData();
//		// 페이지네이션 렌더링
//		renderSemiProductionDetailPagination();
//		// 이벤트 바인딩
//		bindSemiProductionDetailEvents();
//		// 초기 렌더링 후 카운트 업데이트
//		updateSemiProductionDetailTotalCount();
//		// 초기 렌더링 후 수량 업데이트
//		updateSemiProductionDetailTotalQty();
//
//	}
//
//	// 공장 및 창고 선택 함수
//	function renderFactoryStorage() {
//	    const factory = $('#semiProductionDetail_searchVal_factory');
//	    const savedFactory = getCookie('selectedFactory');
//
//	    // 저장된 공장 선택
//	    if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
//	        factory.val(savedFactory);
//	    }	    
//	}
//	
//	// 정규식으로 쿠기 가져오기
//	function getCookie(cookieName) {
//	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//	    return match ? decodeURIComponent(match[2]) : '';
//	}
//	
//	// 총 개수를 업데이트하는 함수
//	function updateSemiProductionDetailTotalCount() {
//		$('#semiProductionDetailTotalCount').text(Number(totalSemiProductionDetailCount).toLocaleString());
//	}
//	// 총 개수를 업데이트하는 함수
//	function updateSemiProductionDetailTotalQty() {
//		$('#semiProductionDetailTotalQty').text(totalSemiProductionDetailQty.toLocaleString());
//	}
//	function renderSemiProductionDetailTableData() {
//		let tableBody = "";
//
//		//console.log("globalSemiProductionDetailData:", globalSemiProductionDetailData);
//		//console.log("데이터 개수:", globalSemiProductionDetailData.length);
//
//		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//		for (let i = 0; i < globalSemiProductionDetailData.length; i++) {
//			let rowNumber = (currentSemiProductionDetailPage - 1) * semiProductionDetailItemsPerPage + i + 1;
//			let data = globalSemiProductionDetailData[i];
//			
//			let statusText = data.intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
//			let statusClass = data.intf_yn === 'Y' ? 'status-completed' : 'status-waiting';		
//			//console.log(`행 ${i}:`, globalSemiProductionDetailData[i]); // 각 행 데이터 확인
//
//			tableBody += `
//            <tr>
//			    <td class = "checkboxVal"><input type="checkbox" class="semiProduction_chk ${statusClass}" 
//        			data-unique="${data.sdate}_${data.itemcode}_${data.intf_yn}_${data.qty}_${data.factory}_${data.storage}_${data.barcode}_${data.wms_key}">
//        		</td>
//                <td class = "noVal">${rowNumber}</td>
//                <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
//                <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
//				<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
//				<td class = "linenoVal">${data.LINENO || data.lineno || ''}</td>
//				<td class = "carVal">${data.CAR || data.car || ''}</td>
//				<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
//				<td class = "itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
//				<td class = "qtyVal">${Number(data.OKQTY || data.okqty || 0).toLocaleString()}</td>
//				<td class = "qtyVal">${Number(data.NGQTY || data.ngqty || 0).toLocaleString()}</td>
//				<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
//				<td class = "timeVal">${data.TIME || data.time || ''}</td>
//				<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
//            </tr>
//        `;
//		}
//		// =
//		//console.log("생성된 tableBody:", tableBody);
//		$("#semiProductionDetailTableBody").html(tableBody);
//		$(".semiProduction_chkAll").prop("checked", false);
//	}
//
//	// 페이지네이션 렌더링
//	function renderSemiProductionDetailPagination() {
//		let totalPages = Math.ceil(totalSemiProductionDetailCount / semiProductionDetailItemsPerPage); // 변경
//		let paginationHtml = "";
//
//		// 이전 버튼
//		if (currentSemiProductionDetailPage > 1) {
//			paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="${currentSemiProductionDetailPage - 1}">&lt;</button>`;
//		} else {
//			paginationHtml += `<button class="semiProductionDetail-page-btn disabled">&lt;</button>`;
//		}
//
//		// 페이지 번호 버튼들
//		let startPage = Math.max(1, currentSemiProductionDetailPage - 5);
//		let endPage = Math.min(totalPages, currentSemiProductionDetailPage + 5);
//
//		// 첫 페이지
//		if (startPage > 1) {
//			paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="1">1</button>`;
//			if (startPage > 2) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//		}
//
//		// 중간 페이지들
//		for (let i = startPage; i <= endPage; i++) {
//			if (i === currentSemiProductionDetailPage) {
//				paginationHtml += `<button class="semiProductionDetail-page-btn active" data-page="${i}">${i}</button>`;
//			} else {
//				paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="${i}">${i}</button>`;
//			}
//		}
//
//		// 마지막 페이지
//		if (endPage < totalPages) {
//			if (endPage < totalPages - 1) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//			paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//		}
//
//		// 다음 버튼
//		if (currentSemiProductionDetailPage < totalPages) {
//			paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="${currentSemiProductionDetailPage + 1}">&gt;</button>`;
//		} else {
//			paginationHtml += `<button class="semiProductionDetail-page-btn disabled">&gt;</button>`;
//		}
//
//		$('#semiProductionDetailCurrentPageInfo').text(currentSemiProductionDetailPage);
//		$('#semiProductionDetailTotalPageInfo').text(totalPages);
//		$("#semiProductionDetailPaginationContainer").html(paginationHtml);
//	}
//
//	// 이벤트 바인딩
//	function bindSemiProductionDetailEvents() {
//		// 검색 버튼 클릭 - DB에서 새로 조회
//		$(".btnSemiProductionDetailSearch").off('click').on('click', function() {
//			performSemiProductionDetailSearch();
//		});
//
//		// 초기화 버튼 클릭
//		$(".btnSemiProductionDetailSearchInit").off('click').on('click', function() {
//			resetSemiProductionDetailSearch();
//		});
//
//		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//		$(document).off('click', '.semiProductionDetail-page-btn').on('click', '.semiProductionDetail-page-btn', function() {
//			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//				let page = parseInt($(this).data('page'));
//				if (page && page > 0) {
//					currentSemiProductionDetailPage = page;
//					// 현재 검색 조건으로 DB에서 새 페이지 조회
//					let searchCriteria = getCurrentSearchCriteria();
//					performSemiProductionDetailDBSearch(searchCriteria);
//				}
//			}
//		});
//
//		// 엔터키 검색
//		$('#view_m3_semiProduction_detail input[type="text"], #view_m3_semiProduction_detail input[type="date"]').off('keypress').on('keypress', function(e) {
//			if (e.which === 13) {
//				performSemiProductionDetailSearch();
//			}
//		});
//	}
//
//	// 현재 검색 조건 수집 함수
//	function getCurrentSearchCriteria() {
//		return {
//			fromDate: $("#semiProductionDetail_searchVal_fromDate").val(),
//			toDate: $("#semiProductionDetail_searchVal_toDate").val(),
//			factory : $("#semiProductionDetail_searchVal_factory").val(),
//			car : $("#semiProductionDetail_searchVal_car").val().trim(),
//			itemcode : $("#semiProductionDetail_searchVal_itemcode").val().trim(),
//			itemname: $("#semiProductionDetail_searchVal_itemname").val().trim()
//		};
//	}
//	// =
//	// 검색 수행 함수 - DB 조회
//	function performSemiProductionDetailSearch() {
//		let searchCriteria = getCurrentSearchCriteria();
//
//		console.log("검색 조건:", searchCriteria);
//
//		// 페이지를 1로 초기화하고 DB에서 검색
//		currentSemiProductionDetailPage = 1;
//		performSemiProductionDetailDBSearch(searchCriteria);
//	}
//
//	// 검색 조건 초기화
//	function resetSemiProductionDetailSearch() {
//		const { fromDate, toDate } = getDefaultDateRange();
//		const factory = getCookie('selectedFactory');
//		
//		$("#semiProductionDetail_searchVal_fromDate").val(fromDate);
//		$("#semiProductionDetail_searchVal_toDate").val(toDate);
//		$("#semiProductionDetail_searchVal_factory").val(factory);
//		$("#semiProductionDetail_searchVal_car").val(''); 
//		$("#semiProductionDetail_searchVal_itemcode").val(''); 
//		$("#semiProductionDetail_searchVal_itemname").val(''); 
//		// =
//		// 초기화 후 전체 데이터 다시 조회
//		currentSemiProductionDetailPage = 1;
//		performSemiProductionDetailDBSearch({ fromDate, toDate, factory });
//
//		console.log('검색 조건이 초기화되었습니다.');
//	}
//
//	// 날짜 형식 변환 함수들
//	function formatDateToYYYYMMDD(dateStr) {
//		if (!dateStr) return '';
//		return dateStr.replace(/-/g, '');
//	}
//
//	function formatDateFromYYYYMMDD(dateStr) {
//		if (!dateStr || dateStr.length !== 8) return '';
//		return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
//	}
//
//	// 유틸리티 함수들
//	window.changeSemiProductionDetailItemsPerPage = function(newItemsPerPage) {
//		semiProductionDetailItemsPerPage = newItemsPerPage;
//		currentSemiProductionDetailPage = 1;
//		let searchCriteria = getCurrentSearchCriteria();
//		performSemiProductionDetailDBSearch(searchCriteria);
//	}
//
//	window.exportSemiProductionDetailData = function() {
//		return {
//			total: globalSemiProductionDetailData.length,
//			currentPage: currentSemiProductionDetailPage,
//			itemsPerPage: semiProductionDetailItemsPerPage,
//			data: globalSemiProductionDetailData
//		};
//	}
//	
//	function fmtLocalDate(d){
//		const y = d.getFullYear();
//		const m = String(d.getMonth()+1).padStart(2,'0');
//		const dd = String(d.getDate()).padStart(2,'0');
//		return `${y}-${m}-${dd}`;
//	}
//	
//	function getDefaultDateRange(){
//		const today = new Date();
//		const toDate = fmtLocalDate(today);
//		const fromDate = fmtLocalDate(today);
//		return { fromDate, toDate };
//	}
//	
//	$(document).on("click", ".btnIntfSemiProductionDetailDelete", function() {
//
//		if ($(".semiProduction_chk.status-waiting:checked").length > 0) {
//			alert(i18n.t('validation.unconfirm.items'));
//			return;
//		}
//		
//		const iidList = [];
//		$(".semiProduction_chk:checked").each(function() {
//			let iid = $(this).data('unique');
//			iidList.push(iid);
//		});
//		
//		// 체크된 요소가 없으면 경고창 표시 후 리턴
//		if (iidList.length === 0) {
//			alert(i18n.t('validation.no.select.items'));
//			return;
//		}
//		
//		if (!confirm(i18n.t('confirmation.interface.progress'))) {
//			return;
//		}
//			
//		showLoading("data");
//		
//		console.log(iidList)
//		
//		$.ajax({
//			url: "/semiProduction_confirm_cancel",
//			type: "POST",
//			data: JSON.stringify(iidList),
//			contentType: "application/json",
//			success: function(data) {
//				let searchVal = getCurrentSearchCriteria();
//				performSemiProductionDetailDBSearch(searchVal);	
//				
//				// 전체 선택 해제
//				$('.semiProduction_chkAll').prop('checked', false);
//			},
//			error: function(xhr, status, error) {
//				// ❌ alert(res.message) <- res 없음 (버그)
//				window.handleAjaxError(xhr, status, error);
//			}
//
//		});
//
//	});
//
//});
//window.downloadAllSemiProductionDetailData = function() {
//	let searchCriteria = {
//		fromDate : $("#semiProductionDetail_searchVal_fromDate").val(),
//		toDate : $("#semiProductionDetail_searchVal_toDate").val(),
//		factory : $("#semiProductionDetail_searchVal_factory").val(),
//		car : $("#semiProductionDetail_searchVal_car").val().trim(),
//		itemcode : $("#semiProductionDetail_searchVal_itemcode").val().trim(),
//		itemname: $("#semiProductionDetail_searchVal_itemname").val().trim()
//	};
//	// =
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_semiProductionDetail_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.semiProductionDetailColumns, {
//				fileName: 'SemiProductionDetail_All',
//				sheetName: 'SemiProductionDetail'
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
//
