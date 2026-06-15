/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalStockCountLastDayDetailData = []; // 현재 조회된 데이터 저장
	let currentStockCountLastDayDetailPage = 1; // 현재 페이지
	let stockCountLastDayDetailItemsPerPage = 1000; // 페이지당 항목 수
	let totalStockCountLastDayDetailCount = 0; // 서버에서 받은 총 개수 저장
	let totalStockCountLastDayDetailPages = 0; // 서버에서 받은 총 페이지
	let totalStockCountLastDayDetailQty = 0;
	window.filteredStockCountLastDayDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.stockCountLastDayDetailColumns = [
		{ key: 'SCANTYPE', header: 'scantype' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'customer code' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'barcode' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_m2_stock_count_lastday_detail = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		let sdate = fromDate;
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		// 초기 로딩: 기본 공장으로 조회
		performStockCountLastDayDetailDBSearch({ storage ,sdate });
	};

	// DB에서 데이터 조회하는 함수
	function performStockCountLastDayDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_stockCountLastDayDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentStockCountLastDayDetailPage,
				itemsPerPage: stockCountLastDayDetailItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalStockCountLastDayDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalStockCountLastDayDetailCount = data.totalCount || 0;
				totalStockCountLastDayDetailPages = data.totalPages || 0;
				totalStockCountLastDayDetailQty = data.totalQty || 0;
				window.filteredStockCountLastDayDetailData = globalStockCountLastDayDetailData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_stock_count_lastday_detail').length) {
					renderStockCountLastDayDetailView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderStockCountLastDayDetailTableData();
					renderStockCountLastDayDetailPagination();
					updateStockCountLastDayDetailTotalCount();
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
	function renderStockCountLastDayDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_stock_count_lastday_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="stockCountLastDayDetail_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="stockCountLastDayDetail_searchVal_sdate" />
							</div>
							<div class="search-label">
								<div class="stockCountLastDayDetail_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="stockCountLastDayDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="stockCountLastDayDetail_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountLastDayDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="stockCountLastDayDetail_searchVal_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountLastDayDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="stockCountLastDayDetail_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="stockCountLastDayDetail_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="stockCountLastDayDetail_searchVal_loginid">${i18n.t('search.user')}<!-- USER --></div>
								<input type="text" id="stockCountLastDayDetail_searchVal_loginid" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnStockCountLastDayDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnStockCountLastDayDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="stockCountLastDayDetailTotalCount">${totalStockCountLastDayDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="stockCountLastDayDetailCurrentPageInfo">${currentStockCountLastDayDetailPage}</strong>/<strong id="stockCountLastDayDetailTotalPageInfo">${totalStockCountLastDayDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="stockCountLastDayDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right m2_stock_count_lastday_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockCountLastDayDetailExcelBtn" onclick="downloadAllStockCountLastDayDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_stock_count_lastday_detail">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "scantypeVal">${i18n.t('search.countType')}<!-- COUNTTYPE --></th>
									<th class = "scantypeVal">${i18n.t('search.scanType')}<!-- SCANTYPE --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- SDATE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemcodeVal">${i18n.t('search.customercode')}<!-- CUSTCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>   
									<th class = "userVal">${i18n.t('search.user')}<!-- LOGINID --></th>									    
									<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>	
									<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
								</tr>
							</thead>
							<tbody id="stockCountLastDayDetailDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="stockCountLastDayDetailPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		/*<button class="btn btn-success" id="stockCountLastDayDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredStockCountLastDayDetailData, stockCountLastDayDetailColumns, {fileName:'StockCountLastDayDetail', sheetName:'StockCountLastDayDetail'})">Excel</button>*/
		$(".w_contentArea").append(content_output);
		
		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#stockCountLastDayDetail_searchVal_sdate").val(fromDate);
		})();
		// 공장 및 창고 선택
		renderFactoryStorage();	
		// 테이블 데이터 렌더링
		renderStockCountLastDayDetailTableData();
		// 페이지네이션 렌더링
		renderStockCountLastDayDetailPagination();
		// 이벤트 바인딩
		bindStockCountLastDayDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateStockCountLastDayDetailTotalCount();
		
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

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const storage = $('#stockCountLastDayDetail_searchVal_storage');
		const savedStorage = getCookie('selectedStorage');

		storage.empty();

		let storageList = ['INBOUND',  'OUTSIDE', 'all'];

		// ILLINOIS 사용자는 OUTSIDE만 선택 가능
		if (savedStorage === 'ILLINOIS') {
			storageList = ['OUTSIDE'];
		}

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		storage.val(storageList[0]);
	    
	     window.autoSetStorageFields();
	}
	
	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	    return match ? decodeURIComponent(match[2]) : '';
	}
	
	// 총 개수를 업데이트하는 함수
	function updateStockCountLastDayDetailTotalCount() {
		$('.stockCountLastDayDetailTotalQty').text(Number(totalStockCountLastDayDetailQty).toLocaleString());
		$('#stockCountLastDayDetailTotalCount').text(Number(totalStockCountLastDayDetailCount).toLocaleString());
		$('#stockCountLastDayDetailTotalPageInfo').text(Number(totalStockCountLastDayDetailPages).toLocaleString());
	}

	function renderStockCountLastDayDetailTableData() {
		let tableBody = "";

		//console.log("globalStockCountLastDayDetailData:", globalStockCountLastDayDetailData);
		//console.log("데이터 개수:", globalStockCountLastDayDetailData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalStockCountLastDayDetailData.length; i++) {
			let rowNumber = (currentStockCountLastDayDetailPage - 1) * stockCountLastDayDetailItemsPerPage + i + 1;
			const data = globalStockCountLastDayDetailData[i];
			//console.log(`행 ${i}:`, globalStockCountLastDayDetailData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "scantypeVal">${data.SOURCE || data.source || ''}</td>
				<td class = "scantypeVal">${data.SCANTYPE || data.scantype || ''}</td>
                <td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
                <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
                <td class = "carVal">${data.CAR || data.car || ''}</td>
                <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                <td class = "itemcodeVal">${data.SPEC || data.spec || ''}</td>
                <td class = "itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
                <td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
                <td class = "locationVal">${data.LOCATION || data.location || ''}</td>
                <td class = "userVal">${data.LOGINID || data.loginid || ''}</td>
                <td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
				<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
            </tr>
        `;
		}

		//console.log("생성된 tableBody:", tableBody);
		$("#stockCountLastDayDetailDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderStockCountLastDayDetailPagination() {
		let totalPages = Math.ceil(totalStockCountLastDayDetailCount / stockCountLastDayDetailItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentStockCountLastDayDetailPage > 1) {
			paginationHtml += `<button class="stockCountLastDayDetail-page-btn" data-page="${currentStockCountLastDayDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="stockCountLastDayDetail-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentStockCountLastDayDetailPage - 5);
		let endPage = Math.min(totalPages, currentStockCountLastDayDetailPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="stockCountLastDayDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStockCountLastDayDetailPage) {
				paginationHtml += `<button class="stockCountLastDayDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="stockCountLastDayDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="stockCountLastDayDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentStockCountLastDayDetailPage < totalPages) {
			paginationHtml += `<button class="stockCountLastDayDetail-page-btn" data-page="${currentStockCountLastDayDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="stockCountLastDayDetail-page-btn disabled">&gt;</button>`;
		}

		$("#stockCountLastDayDetailCurrentPageInfo").html(currentStockCountLastDayDetailPage);
		$("#stockCountLastDayDetailPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindStockCountLastDayDetailEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnStockCountLastDayDetailSearch").off('click').on('click', function() {
			performStockCountLastDayDetailSearch();
		});

		// 초기화 버튼 클릭
		$(".btnStockCountLastDayDetailSearchInit").off('click').on('click', function() {
			resetStockCountLastDayDetailSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.stockCountLastDayDetail-page-btn').on('click', '.stockCountLastDayDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentStockCountLastDayDetailPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performStockCountLastDayDetailDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_stock_count_lastday_detail input[type="text"], #view_m2_stock_count_lastday_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performStockCountLastDayDetailSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			sdate: $("#stockCountLastDayDetail_searchVal_sdate").val(),
			storage: $("#stockCountLastDayDetail_searchVal_storage").val(),
			itemcode: $("#stockCountLastDayDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#stockCountLastDayDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#stockCountLastDayDetail_searchVal_itemname").val().trim().toUpperCase(),
			loginid: $("#stockCountLastDayDetail_searchVal_loginid").val().trim().toUpperCase()
		};
	}

	// 검색 수행 함수 - DB 조회
	function performStockCountLastDayDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentStockCountLastDayDetailPage = 1;
		performStockCountLastDayDetailDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetStockCountLastDayDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const sdate = fromDate;
		$("#stockCountLastDayDetail_searchVal_sdate").val(toDate);

		$("#stockCountLastDayDetail_searchVal_itemcode").val('');
		$("#stockCountLastDayDetail_searchVal_oitemcode").val('');
		$("#stockCountLastDayDetail_searchVal_itemname").val('');
		$("#stockCountLastDayDetail_searchVal_loginid").val('');

		renderFactoryStorage();
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		// 초기화 후 전체 데이터 다시 조회
		currentStockCountLastDayDetailPage = 1;
		performStockCountLastDayDetailDBSearch({ sdate, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	// 유틸리티 함수들
	window.changeStockCountLastDayDetailItemsPerPage = function(newItemsPerPage) {
		stockCountLastDayDetailItemsPerPage = newItemsPerPage;
		currentStockCountLastDayDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performStockCountLastDayDetailDBSearch(searchCriteria);
	}

	window.exportStockCountLastDayDetailData = function() {
		return {
			total: globalStockCountLastDayDetailData.length,
			currentPage: currentStockCountLastDayDetailPage,
			itemsPerPage: stockCountLastDayDetailItemsPerPage,
			data: globalStockCountLastDayDetailData
		};
	}
});


window.downloadAllStockCountLastDayDetailData = function() {
	let searchCriteria = {
		sdate: $("#stockCountLastDayDetail_searchVal_sdate").val(),
		storage: $("#stockCountLastDayDetail_searchVal_storage").val(),
		itemcode: $("#stockCountLastDayDetail_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#stockCountLastDayDetail_searchVal_oitemcode").val().trim().toUpperCase(),
		itemname: $("#stockCountLastDayDetail_searchVal_itemname").val().trim().toUpperCase(),
		loginid: $("#stockCountLastDayDetail_searchVal_loginid").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_stockCountLastDayDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.stockCountLastDayDetailColumns, {
				fileName: 'StockCountLastDayDetail_All',
				sheetName: 'StockCountLastDayDetail'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

