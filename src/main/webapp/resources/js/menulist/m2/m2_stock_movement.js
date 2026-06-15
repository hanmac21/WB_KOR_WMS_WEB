/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */


$(document).ready(function() {

	let globalstockMovementData = []; // 현재 조회된 데이터 저장
	let currentstockMovementPage = 1; // 현재 페이지
	let stockMovementItemsPerPage = 1000; // 페이지당 항목 수
	let totalstockMovementCount = 0; // 서버에서 받은 총 개수 저장
	let totalstockMovementQty = 0; // 서버에서 받은 총 개수 저장
	let totalstockMovementPages = 0; // 서버에서 받은 총 페이지
	window.filteredstockMovementData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.stockMovementColumns = [
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'SDATE', header: 'sdate' },
		{ key: 'KIND', header: 'kind' },
		{ key: 'PLUSQTY', header: 'plusqty' },
		{ key: 'MINUSQTY', header: 'minusqty' },
		{ key: 'REMAINQTY', header: 'remainqty' } 
	];


	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_stock_movement = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 공장으로 조회
		//performstockMovementDBSearch({ factory, toDate, fromDate });
		renderstockMovementView();
		hideLoading();
	}

	// DB에서 데이터 조회하는 함수
	function performstockMovementDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/check_stockMovement",
			type: "POST",
			data: JSON.stringify(searchCriteria),
			contentType: "application/json",
			success: function(data) {
				if (data == 0) {
					alert("The item code does not exist.");
					hideLoading();
					return;
				}


				$.ajax({
					url: "/read_stockMovement",
					type: "POST",
					data: JSON.stringify({
						searchParams: searchCriteria,
						page: currentstockMovementPage,
						itemsPerPage: stockMovementItemsPerPage
					}),
					contentType: "application/json",
					success: function(data) {
						console.log("-- DB 조회 결과 --");
						console.log(data);

						globalstockMovementData = data.records || data || []; // 서버 응답 구조에 맞게 조정
						totalstockMovementCount = data.totalCount || 0;
						totalstockMovementQty = data.totalQty || 0;
						totalstockMovementPages = data.totalPages || 0;
						currentstockMovementPage = data.currentPage || 0;
						window.filteredstockMovementData = globalstockMovementData;

						// 첫 번째 검색이라면 뷰를 렌더링
						if (!$('#view_m2_stock_movement').length) {
							renderstockMovementView();
						} else {
							// 기존 뷰가 있다면 테이블만 업데이트
							renderstockMovementTableData();
							renderstockMovementPagination();
							updatestockMovementTotalCount();
							updatestockMovementTotalQty();
						}

						hideLoading();
					},
					error: function(xhr, status, error) {
						console.error("DB 조회 실패:", error);
						hideLoading();
						alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
					}
				});
			},
			error: function(xhr, status, error) {
				console.error("요청 실패");
				console.error("Status:", status);       // 예: "error"
				console.error("Error:", error);         // 예: 서버 응답 메시지
				console.error("Response:", xhr.responseText); // 서버 응답 본문
				alert("오류가 발생했습니다: " + error);
			}

		});
	}

	// 사용자 뷰 렌더링 함수
	function renderstockMovementView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_stock_movement">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="stockMovement_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="stockMovement_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="stockMovement_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockMovement_searchVal_itemcode" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnstockMovementSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnstockMovementSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="stockMovementTotalCount">${totalstockMovementCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="stockMovementCurrentPageInfo">${currentstockMovementPage}</strong>/<strong id="stockMovementTotalPageInfo">${totalstockMovementPages}</strong> | 
								
							</span>
							<div class="action-buttons-right m2_stock_movement">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockMovementExcelBtn" onclick="downloadAllstockMovementData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_stock_movement">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
										<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>									    
										<th class = "dateVal">${i18n.t('search.date')}<!-- SDATE --></th>
									    <th class = "locationVal">${i18n.t('table.kind')}<!-- KIND --></th>
									    <th class = "qtyVal">${i18n.t('search.qty.plus')}<!-- Plus Qty --></th>									    
									    <th class = "qtyVal">${i18n.t('search.qty.minus')}<!-- Minus QTY --></th>									    
									    <th class = "qtyVal">${i18n.t('search.qty.stock')}<!-- STOCK QTY --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="stockMovementTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="stockMovementPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#stockMovement_searchVal_fromDate").val(fromDate);
			$("#stockMovement_searchVal_toDate").val(toDate);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderstockMovementTableData();
		// 페이지네이션 렌더링
		renderstockMovementPagination();
		// 이벤트 바인딩
		bindstockMovementEvents();
		// 초기 렌더링 후 카운트 업데이트
		updatestockMovementTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updatestockMovementTotalQty();
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const storage = $('#stockMovement_searchVal_storage');
		const savedStorage = getCookie('selectedStorage');

		storage.empty();

		const storageList = ['INBOUND', 'PRODUCT', 'OUTSIDE', 'all'];

		storageList.forEach(item => {
			//const value = item.toUpperCase(); // value는 대문자로 변환
			const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
			storage.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택
		// storage.val(storageList[0]);
		// DOM 렌더링 완료 후 val() 세팅
		setTimeout(() => {
			if(savedStorage === 'ILLINOIS'){
				storage.val('OUTSIDE').trigger('change');
			}else {
				storage.val(storageList[0]).trigger('change');
			}
		}, 0);

		window.autoSetStorageFields();
	}

	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// 총 개수를 업데이트하는 함수
	function updatestockMovementTotalCount() {
		$('#stockMovementTotalCount').text(totalstockMovementCount.toLocaleString());
	}
	// 총 개수를 업데이트하는 함수
	function updatestockMovementTotalQty() {
		$('#stockMovementTotalQty').text(totalstockMovementQty.toLocaleString());
	}

	function renderstockMovementTableData() {
		let tableBody = "";
		let totalStockQty = 0;

		//console.log("globalstockMovementData:", globalstockMovementData);
		//console.log("데이터 개수:", globalstockMovementData.length);
		$("#stockMovementCurrentPageInfo").text(currentstockMovementPage);
		$("#stockMovementTotalPageInfo").text(totalstockMovementPages);
		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalstockMovementData.length; i++) {
			let rowNumber = (currentstockMovementPage - 1) * stockMovementItemsPerPage + i + 1;
			let data = globalstockMovementData[i];
			//console.log(`행 ${i}:`, globalstockMovementData[i]); // 각 행 데이터 확인

			totalStockQty += (data.plusqty - data.minusqty); 
						
			tableBody += `
            <tr>
            	<td class = "noVal">${rowNumber}</td>		
				<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>				
				<td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
				<td class = "locationVal">${data.KIND || data.kind || ''}</td>
				<td class = "qtyVal">${Number(data.PLUSQTY || data.plusqty || 0).toLocaleString()}</td>				
				<td class = "qtyVal">${Number(-data.MINUSQTY || -data.minusqty || 0).toLocaleString()}</td>				
				<td class = "qtyVal">${Number(totalStockQty).toLocaleString()}</td>				
            </tr>
        `;
		}

		/* 임시 주석 필요시 사용
		<td>${globalstockMovementData[i].LOCATION || globalstockMovementData[i].location || ''}</td>
		<td>${globalstockMovementData[i].YMDHMS || globalstockMovementData[i].ymdhms || ''}</td>
				*/
		//console.log("생성된 tableBody:", tableBody);
		$("#stockMovementTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderstockMovementPagination() {
		let totalPages = Math.ceil(totalstockMovementCount / stockMovementItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentstockMovementPage > 1) {
			paginationHtml += `<button class="stockMovement-page-btn" data-page="${currentstockMovementPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="stockMovement-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentstockMovementPage - 5);
		let endPage = Math.min(totalPages, currentstockMovementPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="stockMovement-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentstockMovementPage) {
				paginationHtml += `<button class="stockMovement-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="stockMovement-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="stockMovement-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentstockMovementPage < totalPages) {
			paginationHtml += `<button class="stockMovement-page-btn" data-page="${currentstockMovementPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="stockMovement-page-btn disabled">&gt;</button>`;
		}

		$("#stockMovementPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindstockMovementEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnstockMovementSearch").off('click').on('click', function() {
			performstockMovementSearch();
		});

		// 초기화 버튼 클릭
		$(".btnstockMovementSearchInit").off('click').on('click', function() {
			resetstockMovementSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.stockMovement-page-btn').on('click', '.stockMovement-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentstockMovementPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performstockMovementDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_stock_movement input[type="text"], #view_m2_stock_movement input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performstockMovementSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#stockMovement_searchVal_fromDate").val(),
			toDate: $("#stockMovement_searchVal_toDate").val(),
			itemcode: $("#stockMovement_searchVal_itemcode").val().trim().toUpperCase(),
			storage: $("#stockMovement_searchVal_storage").val()
		};
	}

	// 검색 수행 함수 - DB 조회
	function performstockMovementSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		/*let itemcodeCheck = searchCriteria.itemcode;
		if(itemcodeCheck == ''){
			alert("You must enter the item code.");
			return;
		}*/
		// 아이템코드로 검색해서 카운트가 있어야지만 조회 가능하게.


		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentstockMovementPage = 1;
		performstockMovementDBSearch(searchCriteria);
	}


	// 검색 조건 초기화
	function resetstockMovementSearch() {
		// 1) 검색 입력 값 초기화
		const { fromDate, toDate } = getDefaultDateRange();

		$("#stockMovement_searchVal_fromDate").val(fromDate);
		$("#stockMovement_searchVal_toDate").val(toDate);
		$("#stockMovement_searchVal_itemcode").val('');

		// 공장, 창고 기본값 설정
		renderFactoryStorage();
		// 2) 전역 변수 초기화
		globalstockMovementData = [];
		totalstockMovementCount = 0;
		totalstockMovementQty = 0;
		totalstockMovementPages = 0;
		currentstockMovementPage = 1;
		window.filteredstockMovementData = [];

		// 3) 화면 비우기
		$("#stockMovementTableBody").empty();
		$("#stockMovementPaginationContainer").empty();
		$("#stockMovementTotalCount").text('0');
		$("#stockMovementCurrentPageInfo").text('1');
		$("#stockMovementTotalPageInfo").text('0');

		console.log('검색 조건이 초기화되었습니다.');
	}

	// 유틸리티 함수들
	window.changestockMovementItemsPerPage = function(newItemsPerPage) {
		stockMovementItemsPerPage = newItemsPerPage;
		currentstockMovementPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performstockMovementDBSearch(searchCriteria);
	}

	window.exportstockMovementData = function() {
		return {
			total: globalstockMovementData.length,
			currentPage: currentstockMovementPage,
			itemsPerPage: stockMovementItemsPerPage,
			data: globalstockMovementData
		};
	}

	function fmtLocalDate(d) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${dd}`;
	}

	function getDefaultDateRange() {
		const today = new Date();
//		const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0); // 전월 말일
		const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);	 // 이번 달 1일
		const toDate = fmtLocalDate(today);
		const fromDate = fmtLocalDate(firstOfMonth);
		return { fromDate, toDate };
	}

});
window.downloadAllstockMovementData = function() {
	let searchCriteria = {
		fromDate: $("#stockMovement_searchVal_fromDate").val(),
		toDate: $("#stockMovement_searchVal_toDate").val(),
		itemcode: $("#stockMovement_searchVal_itemcode").val().trim().toUpperCase(),
		storage: $("#stockMovement_searchVal_storage").val()
	};

	showLoading("export");

	$.ajax({
		url: "/read_stockMovement_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			let totalStockQty = 0;
	        const processedData = data.map(row => {
	            // 숫자로 안전하게 변환
	            const plus = Number(row.PLUSQTY) || 0;
	            const minus = Number(row.MINUSQTY) || 0;

	            totalStockQty += (plus - minus); // 누적 잔량 계산

	            return {
	                ...row,
	                MINUSQTY: minus ? `-${minus}` : '', // minusqty에 - 붙이기
	                REMAINQTY: totalStockQty             // 잔량 추가
	            };
	        });
			ExcelExporter.downloadExcel(processedData, window.stockMovementColumns, {
				fileName: 'stockMovement_All',
				sheetName: 'stockMovement'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};
