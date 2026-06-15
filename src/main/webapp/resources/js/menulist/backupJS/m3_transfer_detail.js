/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m3_transfer_detail 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : transferDetail -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : TransferDetail -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

/*$(document).ready(function() {

	let globalTransferDetailData = []; // 현재 조회된 데이터 저장
	let currentTransferDetailPage = 1; // 현재 페이지
	let transferDetailItemsPerPage = 1000; // 페이지당 항목 수
	let totalTransferDetailCount = 0; // 서버에서 받은 총 개수 저장
	let totalTransferDetailQty = 0; // 서버에서 받은 총 개수 저장
	let totalTransferDetailPages = 0; // 서버에서 받은 총 페이지
	window.filteredTransferDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.transferDetailColumns = [
		{ key: 'SDATE', header: 'sdate' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'LOGINID', header: 'loginid' },
		{ key: 'TIME', header: 'time' },
		{ key: 'BARCODE', header: 'lot' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m3_transfer_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		
		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위로 조회
		performTransferDetailDBSearch({ fromDate, toDate, factory });
	}

	// DB에서 데이터 조회하는 함수
	function performTransferDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_transferDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentTransferDetailPage,
				itemsPerPage: transferDetailItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalTransferDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalTransferDetailCount = data.totalCount || 0;
				totalTransferDetailQty = data.totalQty || 0;
				totalTransferDetailPages = data.totalPages || 0;
				currentTransferDetailPage = data.currentPage || 0;
				window.filteredTransferDetailData = globalTransferDetailData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m3_transfer_detail').length) {
					renderTransferDetailView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderTransferDetailTableData();
					renderTransferDetailPagination();
					updateTransferDetailTotalCount();
					updateTransferDetailTotalQty();
				}

				hideLoading();
			},
			error: function(xhr, status, error) {
				console.error("DB 조회 실패:", error);
				hideLoading();
				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
			}
		});
	}

	// 사용자 뷰 렌더링 함수
	function renderTransferDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_m3_transfer_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="transferDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="transferDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="transferDetail_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="transferDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="transferDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="transferDetail_searchVal_itemname" />
							</div>							
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnTransferDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnTransferDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
						</div>
					</div>
					
					<!-- 탭 -->
					<div class="tab-container">
						<div class="tab">목록</div>
					</div>
					
					<!-- 테이블 -->
					<div class="table-container">
						<div class="action-buttons">
							<button class="btn btn-secondary">엑셀 다운로드</button>
						</div> 
						
						<div class="table-info">
							<span>${i18n.t('table.info.total')} <strong id="transferDetailTotalCount">${totalTransferDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="transferDetailCurrentPageInfo">${currentTransferDetailPage}</strong>/<strong id="transferDetailTotalPageInfo">${totalTransferDetailPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "transferDetailTotalQty"></strong>
							</span>
							<div class="action-buttons-right m3_transfer_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="transferDetailExcelBtn" onclick="downloadAllTransferDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m3_transfer_detail">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "loginidVal">${i18n.t('search.user')}<!-- loginid --></th>
									<th class = "timeVal">${i18n.t('table.time')}<!-- TIME --></th>
									<th class = "barcodeVal">${i18n.t('table.lot')}<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="transferDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="transferDetailPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		// = 위에 data-table, search-row i18n 부분 추가
		/*<button class="btn btn-success" id="transferDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredTransferDetailData, transferDetailColumns, {fileName:'TransferDetail', sheetName:'TransferDetail'})">Excel</button>*/
		/*$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function(){
			const { fromDate, toDate } = getDefaultDateRange();
			$("#transferDetail_searchVal_fromDate").val(fromDate);
			$("#transferDetail_searchVal_toDate").val(toDate);
  		})();
		
		// 공장 및 창고 선택
		renderFactoryStorage();	
		// 테이블 데이터 렌더링
		renderTransferDetailTableData();
		// 페이지네이션 렌더링
		renderTransferDetailPagination();
		// 이벤트 바인딩
		bindTransferDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateTransferDetailTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateTransferDetailTotalQty();

	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const factory = $('#transferDetail_searchVal_factory');
	    const savedFactory = getCookie('selectedFactory');

	    // 저장된 공장 선택
	    if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
	        factory.val(savedFactory);
	    }	    
	}
	
	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	    return match ? decodeURIComponent(match[2]) : '';
	}
	
	// 총 개수를 업데이트하는 함수
	function updateTransferDetailTotalCount() {
		$('#transferDetailTotalCount').text(totalTransferDetailCount.toLocaleString());
	}
	// 총 개수를 업데이트하는 함수
	function updateTransferDetailTotalQty() {
		$('#transferDetailTotalQty').text(totalTransferDetailQty.toLocaleString());
	}
	function renderTransferDetailTableData() {
		let tableBody = "";

		//console.log("globalTransferDetailData:", globalTransferDetailData);
		//console.log("데이터 개수:", globalTransferDetailData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalTransferDetailData.length; i++) {
			let rowNumber = (currentTransferDetailPage - 1) * transferDetailItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalTransferDetailData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "dateVal">${globalTransferDetailData[i].SDATE || globalTransferDetailData[i].sdate || ''}</td>
				<td class = "factoryVal">${globalTransferDetailData[i].FACTORY || globalTransferDetailData[i].factory || ''}</td>
				<td class = "storageVal">${globalTransferDetailData[i].STORAGE || globalTransferDetailData[i].storage || ''}</td>
				<td class = "carVal">${globalTransferDetailData[i].CAR || globalTransferDetailData[i].car || ''}</td>
				<td class = "itemcodeVal">${globalTransferDetailData[i].ITEMCODE || globalTransferDetailData[i].itemcode || ''}</td>
				<td class = "itemnameVal">${globalTransferDetailData[i].ITEMNAME || globalTransferDetailData[i].itemname || ''}</td>
				<td class = "qtyVal">${Number(globalTransferDetailData[i].QTY || globalTransferDetailData[i].qty || 0).toLocaleString()}</td>
				<td class = "loginidVal">${globalTransferDetailData[i].LOGINID || globalTransferDetailData[i].loginid || ''}</td>
				<td class = "timeVal">${globalTransferDetailData[i].TIME || globalTransferDetailData[i].time || ''}</td>
				<td class = "barcodeVal">${globalTransferDetailData[i].BARCODE || globalTransferDetailData[i].barcode || ''}</td>
            </tr>
        `;
		}
		// =
		//console.log("생성된 tableBody:", tableBody);
		$("#transferDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderTransferDetailPagination() {
		let totalPages = Math.ceil(totalTransferDetailCount / transferDetailItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentTransferDetailPage > 1) {
			paginationHtml += `<button class="transferDetail-page-btn" data-page="${currentTransferDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="transferDetail-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentTransferDetailPage - 5);
		let endPage = Math.min(totalPages, currentTransferDetailPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="transferDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentTransferDetailPage) {
				paginationHtml += `<button class="transferDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="transferDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="transferDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentTransferDetailPage < totalPages) {
			paginationHtml += `<button class="transferDetail-page-btn" data-page="${currentTransferDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="transferDetail-page-btn disabled">&gt;</button>`;
		}
		
		$('#transferDetailCurrentPageInfo').text(currentTransferDetailPage);
		$('#transferDetailTotalPageInfo').text(totalPages);
		$("#transferDetailPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindTransferDetailEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnTransferDetailSearch").off('click').on('click', function() {
			performTransferDetailSearch();
		});

		// 초기화 버튼 클릭
		$(".btnTransferDetailSearchInit").off('click').on('click', function() {
			resetTransferDetailSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.transferDetail-page-btn').on('click', '.transferDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentTransferDetailPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performTransferDetailDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m3_transfer_detail input[type="text"], #view_m3_transfer_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performTransferDetailSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#transferDetail_searchVal_fromDate").val(),
			toDate: $("#transferDetail_searchVal_toDate").val(),
			factory : $("#transferDetail_searchVal_factory").val(),
			car : $("#transferDetail_searchVal_car").val().trim(),
			itemcode : $("#transferDetail_searchVal_itemcode").val().trim(),
			itemname: $("#transferDetail_searchVal_itemname").val().trim()
		};
	}
	// =
	// 검색 수행 함수 - DB 조회
	function performTransferDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentTransferDetailPage = 1;
		performTransferDetailDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetTransferDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
		
		$("#transferDetail_searchVal_fromDate").val(fromDate);
		$("#transferDetail_searchVal_toDate").val(toDate);
		$("#transferDetail_searchVal_factory").val(factory);
		$("#transferDetail_searchVal_car").val(''); 
		$("#transferDetail_searchVal_itemcode").val(''); 
		$("#transferDetail_searchVal_itemname").val(''); 
		// =
		// 초기화 후 전체 데이터 다시 조회
		currentTransferDetailPage = 1;
		performTransferDetailDBSearch({ fromDate, toDate, factory });

		console.log('검색 조건이 초기화되었습니다.');
	}

	// 날짜 형식 변환 함수들
	function formatDateToYYYYMMDD(dateStr) {
		if (!dateStr) return '';
		return dateStr.replace(/-/g, '');
	}

	function formatDateFromYYYYMMDD(dateStr) {
		if (!dateStr || dateStr.length !== 8) return '';
		return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
	}

	// 유틸리티 함수들
	window.changeTransferDetailItemsPerPage = function(newItemsPerPage) {
		transferDetailItemsPerPage = newItemsPerPage;
		currentTransferDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performTransferDetailDBSearch(searchCriteria);
	}

	window.exportTransferDetailData = function() {
		return {
			total: globalTransferDetailData.length,
			currentPage: currentTransferDetailPage,
			itemsPerPage: transferDetailItemsPerPage,
			data: globalTransferDetailData
		};
	}
	
	function fmtLocalDate(d){
		const y = d.getFullYear();
		const m = String(d.getMonth()+1).padStart(2,'0');
		const dd = String(d.getDate()).padStart(2,'0');
		return `${y}-${m}-${dd}`;
	}
	
	function getDefaultDateRange(){
		const today = new Date();
		const toDate = fmtLocalDate(today);
		const fromDate = fmtLocalDate(today);
		return { fromDate, toDate };
	}

});
window.downloadAllTransferDetailData = function() {
	let searchCriteria = {
		fromDate : $("#transferDetail_searchVal_fromDate").val(),
		toDate : $("#transferDetail_searchVal_toDate").val(),
		factory : $("#transferDetail_searchVal_factory").val(),
		car : $("#transferDetail_searchVal_car").val().trim(),
		itemcode : $("#transferDetail_searchVal_itemcode").val().trim(),
		itemname: $("#transferDetail_searchVal_itemname").val().trim()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_transferDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.transferDetailColumns, {
				fileName: 'TransferDetail_All',
				sheetName: 'TransferDetail'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};*/

