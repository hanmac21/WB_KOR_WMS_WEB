/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */


$(document).ready(function() {

	let globalStockInfoData = []; // 현재 조회된 데이터 저장
	let currentStockInfoPage = 1; // 현재 페이지
	let stockInfoItemsPerPage = 1000; // 페이지당 항목 수
	let totalStockInfoCount = 0; // 서버에서 받은 총 개수 저장
	let totalStockInfoQty = 0; // 서버에서 받은 총 개수 저장
	let totalStockInfoPages = 0; // 서버에서 받은 총 페이지
	window.filteredStockInfoData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.stockInfoColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'OITEMCODE', header: 'spec' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'BARCODE', header: 'lot' },
	];


	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_stock_info = function(menuId) {
//		showLoading("data");
//
//		const factory = getCookie('selectedFactory');
//
//		performStockInfoDBSearch({
//			factory: factory,
//			barcode: ''  // 빈 문자열 추가
//		});
		
		renderStockInfoView();
	}

	// DB에서 데이터 조회하는 함수
	function performStockInfoDBSearch(searchCriteria) {
		showLoading("data");
		
		$.ajax({
			url: "/read_stockInfo",
			type: "POST",
			data: JSON.stringify({
				barcode : $("#stockInfo_searchVal_barcode").val().trim(),
				searchParams: searchCriteria,
				page: currentStockInfoPage,
				itemsPerPage: stockInfoItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalStockInfoData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalStockInfoCount = data.totalCount || 0;
				totalStockInfoQty = data.totalQty || 0;
				totalStockInfoPages = data.totalPages || 0;
				currentStockInfoPage = data.currentPage || 0;
				window.filteredStockInfoData = globalStockInfoData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_stock_info').length) {
					renderStockInfoView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderStockInfoTableData();
					renderStockInfoPagination();
					updateStockInfoTotalCount();
					updateStockInfoTotalQty();
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
	function renderStockInfoView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_stock_info">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="stockInfo_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.location')}</div>
								<input type="text" id="stockInfo_searchVal_location" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="stockInfo_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}</div>
								<input type="text" id="stockInfo_searchVal_oitemcode" />
							</div>
							<div class="search-label" style ="width: 30%;">
								<div class="searchVal_barcode">${i18n.t('search.barcode')}</div>
								<input type="text" id="stockInfo_searchVal_barcode" />
							</div>
						</div>
							<div class="search_button_area_horizontal">
								<button class="btn btn-primary btnStockInfoSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnStockInfoSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="stockInfoTotalCount">${totalStockInfoCount}</strong> ${i18n.t('table.info.records')} | 
								<!-- ${i18n.t('table.page')} <strong id="stockInfoCurrentPageInfo">${currentStockInfoPage}</strong>/<strong id="stockInfoTotalPageInfo">${totalStockInfoPages}</strong> | --> 
								${i18n.t('table.info.qty')} : <strong id = "stockInfoTotalQty"></strong>
							</span>
							<div class="action-buttons-right m2_stock_info">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockInfoExcelBtn" onclick="downloadAllStockInfoData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_stock_info">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
									    <th class = "dateVal">${i18n.t('search.date')}<!-- INSDATE --></th>			
										<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
										<th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>
									    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									    <th class = "cnameVal">${i18n.t('search.customercode')}<!-- SPEC --></th>
									    <th class = "itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>									    
									    <th class = "barcodeVal">${i18n.t('table.lot')}<!-- BARCODE --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="stockInfoTableBody">
							</tbody>
						</table>				
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderStockInfoTableData();
		// 페이지네이션 렌더링
		renderStockInfoPagination();
		// 이벤트 바인딩
		bindStockInfoEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateStockInfoTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateStockInfoTotalQty();
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const storage = $('#stockInfo_searchVal_storage');
		const savedStorage = getCookie('selectedStorage');

		storage.empty();

		let storageList = ['INBOUND', 'PRODUCT', 'OUTSIDE', 'all'];

		// ILLINOIS 사용자는 OUTSIDE만 선택 가능
		if (savedStorage === 'ILLINOIS') {
			storageList = ['OUTSIDE'];
		}

		storageList.forEach(item => {
			const value = item;
			const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
			storage.append(`<option value="${value}">${text}</option>`);
		});

		// 첫 번째 옵션 선택
		// storage.val(storageList[0]);
		// DOM 렌더링 완료 후 val() 세팅
		setTimeout(() => {
			storage.val(storageList[0]).trigger('change');
		}, 0);
	}

	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// 총 개수를 업데이트하는 함수
	function updateStockInfoTotalCount() {
		$('#stockInfoTotalCount').text(totalStockInfoCount.toLocaleString());
	}
	// 총 개수를 업데이트하는 함수
	function updateStockInfoTotalQty() {
		$('#stockInfoTotalQty').text(totalStockInfoQty.toLocaleString());
	}

	function renderStockInfoTableData() {
		let tableBody = "";

		//console.log("globalStockInfoData:", globalStockInfoData);
		//console.log("데이터 개수:", globalStockInfoData.length);
		$("#stockInfoCurrentPageInfo").text(currentStockInfoPage);
		$("#stockInfoTotalPageInfo").text(totalStockInfoPages);
		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalStockInfoData.length; i++) {
			let rowNumber = (currentStockInfoPage - 1) * stockInfoItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalStockInfoData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr data-barcode="${globalStockInfoData[i].barcode}">
            	<td class = "noVal">${Number(rowNumber).toLocaleString()}</td>
				<td class = "dateVal">${globalStockInfoData[i].SDATE || globalStockInfoData[i].sdate || ''}</td>
				<td class = "storageVal">${globalStockInfoData[i].STORAGE || globalStockInfoData[i].storage || ''}</td>
				<td class = "locationVal">${globalStockInfoData[i].LOCATION || globalStockInfoData[i].location || ''}</td>
				<td class = "itemcodeVal">${globalStockInfoData[i].ITEMCODE || globalStockInfoData[i].itemcode || ''}</td>
				<td class = "cnameVal">${globalStockInfoData[i].OITEMCODE || globalStockInfoData[i].oitemcode || ''}</td>
				<td class = "itemnameLongVal">${globalStockInfoData[i].ITEMNAME || globalStockInfoData[i].itemname || ''}</td>
				<td class = "qtyVal">${Number(globalStockInfoData[i].QTY || globalStockInfoData[i].qty || 0).toLocaleString()}</td>				
				<td class = "barcodeVal">${globalStockInfoData[i].BARCODE || globalStockInfoData[i].barcode || ''}</td>
            </tr>
        `;
		}

		$("#stockInfoTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderStockInfoPagination() {
		let totalPages = Math.ceil(totalStockInfoCount / stockInfoItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentStockInfoPage > 1) {
			paginationHtml += `<button class="stockInfo-page-btn" data-page="${currentStockInfoPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="stockInfo-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentStockInfoPage - 5);
		let endPage = Math.min(totalPages, currentStockInfoPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="stockInfo-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStockInfoPage) {
				paginationHtml += `<button class="stockInfo-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="stockInfo-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="stockInfo-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentStockInfoPage < totalPages) {
			paginationHtml += `<button class="stockInfo-page-btn" data-page="${currentStockInfoPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="stockInfo-page-btn disabled">&gt;</button>`;
		}

		$("#stockInfoPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindStockInfoEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnStockInfoSearch").off('click').on('click', function() {
			performStockInfoSearch();
		});

		// 초기화 버튼 클릭
		$(".btnStockInfoSearchInit").off('click').on('click', function() {
			resetStockInfoSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.stockInfo-page-btn').on('click', '.stockInfo-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentStockInfoPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performStockInfoDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_stock_info input[type="text"], #view_m2_stock_info input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performStockInfoSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			storage: $("#stockInfo_searchVal_storage").val(),
			location: $("#stockInfo_searchVal_location").val().trim().toUpperCase(),
			itemcode: $("#stockInfo_searchVal_itemcode").val().trim(),
			oitemcode: $("#stockInfo_searchVal_oitemcode").val().trim(),
			barcode: $("#stockInfo_searchVal_barcode").val().trim()
			/*location: $("#stockInfo_searchVal_location").val().trim(), */
		};
	}

	// 검색 수행 함수 - DB 조회
	function performStockInfoSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);
		
		/*if (searchCriteria.barcode) {
			// 필요하면 안내 메시지 활성화
			//alert("Enter barcode or itemcode");
			return;
		}*/
		
		// 페이지를 1로 초기화하고 DB에서 검색
		currentStockInfoPage = 1;
		performStockInfoDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetStockInfoSearch() {
		const factory = getCookie('selectedFactory');
		
		renderFactoryStorage();
		
		$("#stockInfo_searchVal_location").val('');
		$("#stockInfo_searchVal_itemcode").val('');
		$("#stockInfo_searchVal_oitemcode").val('');
		$("#stockInfo_searchVal_barcode").val('')

//		// 초기화 후 전체 데이터 다시 조회
//		currentStockInfoPage = 1;
//		performStockInfoDBSearch({ factory });

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
	window.changeStockInfoItemsPerPage = function(newItemsPerPage) {
		stockInfoItemsPerPage = newItemsPerPage;
		currentStockInfoPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performStockInfoDBSearch(searchCriteria);
	}

	window.exportStockInfoData = function() {
		return {
			total: globalStockInfoData.length,
			currentPage: currentStockInfoPage,
			itemsPerPage: stockInfoItemsPerPage,
			data: globalStockInfoData
		};
	}

});
window.downloadAllStockInfoData = function() {
	let searchCriteria = {
		storage: $("#stockInfo_searchVal_storage").val(),
		location: $("#stockInfo_searchVal_location").val().trim().toUpperCase(),
		itemcode: $("#stockInfo_searchVal_itemcode").val().trim(),
		oitemcode: $("#stockInfo_searchVal_oitemcode").val().trim(),
		barcode: $("#stockInfo_searchVal_barcode").val().trim(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_stockInfo_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.stockInfoColumns, {
				fileName: 'StockInfo_All',
				sheetName: 'StockInfo'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

function openModal() {
//	$('#overlay_stockInfoDetail').addClass('active');
	$('#overlay_stockInfoDetail_2').addClass('active');
	$('#modalContainer_stockInfoDetail_2').addClass('active');
//	$('#modalContainer_stockInfoDetail').addClass('active');
	$(".modal_stockInfoDetail_bg").addClass("show");
}

function closeModal() {
	$('#overlay_stockInfoDetail_2').removeClass('active');
//	$('#overlay_stockInfoDetail').removeClass('active');
	$('#modalContainer_stockInfoDetail_2').removeClass('active');
//	$('#modalContainer_stockInfoDetail').removeClass('active');
	$(".modal_stockInfoDetail_bg").removeClass("show");
}

// 모달 열기
$(document).on("click", ".modal_stockInfoDetail_open", function(e) {
	
	showLoading("data");
	
	let barcode = $(this).data("barcode");
	let itemcode = $(this).find(".itemcodeVal").text();
	
	//console.log(barcode);
	console.log(itemcode);
//	$.ajax({
//		url: "/read_stockinfoInclude",
//		type: "POST",
//		data: barcode,
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data);
//			if(data.length == 0){
//				alert("No data available.");
//				return;
//			}
//			
//			$(".barcodeListTitle_stockInfoDetail").remove();
//			$(".barcodeItem_stockInfoDetail").remove();
//			
//			$('.content_stockInfoDetail').scrollTop(0);
//			openModal();
//			
//			$(".date_stockInfoDetail").text("Made Data : "+data[0].MDATE);
//			$(".count_stockInfoDetail").text("Count:"+data.length);
//			$(".parentBarcodeValue_stockInfoDetail").text(data[0].PBARCODE);
//			
//			let output = "<div class='barcodeListTitle_stockInfoDetail'>BARCODE LIST</div>";
//			for(i=0;i<data.length;i++){
//				output += `
//					<div class="barcodeItem_stockInfoDetail">
//	                    <span class="barcodeNumber_stockInfoDetail">${data[i].BBARCODE}</span>
//	                </div>
//				`
//			}
//			$(".barcodeList_stockInfoDetail").after(output);
//		},
//		error: function(xhr, status, error) {
//			console.error("요청 실패");
//			console.error("Status:", status);       // 예: "error"
//			console.error("Error:", error);         // 예: 서버 응답 메시지
//			console.error("Response:", xhr.responseText); // 서버 응답 본문
//			alert("오류가 발생했습니다: " + error);
//		}
//		
//	});
	$.ajax({
			url: "/read_stockInfoInclude_total",
			type: "POST",
			data: itemcode,
			contentType: "application/json",
			success: function(data) {
				console.log(data)
				
				openModal();
				
				let qtySum = 0;
				$(".barcodeList_stockInfoDetail_2").empty();

				$(".date_stockInfoDetail_2").text(i18n.t('table.info.total') + " "+ data.length + i18n.t('table.info.records'));
				let output = `
					<table class="modal_stockInfoTableControl">
						<thead>
							<th>${i18n.t('search.date')}</th>
							<th class = "qtyVal">${i18n.t('search.qty')}</th>
							<th class = "locationVal">${i18n.t('search.location')}</th>
						</thead>
						<tbody>
				`;
				for(i=0;i<data.length;i++) {
					output += `
							<tr>
								<td class = "dateVal">${data[i].INDATE}</td>
								<td class = "qtyVal">${Number(data[i].QTY).toLocaleString()}</td>
								<td class = "locationVal">${data[i].LOCATION}</td>
							</tr>
					`
					qtySum += parseInt(data[i].QTY);
				}
				output += "</tbody></table>";
				
				$(".count_stockInfoDetail_2").text(i18n.t('table.info.qty') + " : " + Number(qtySum).toLocaleString());
				$(".barcodeList_stockInfoDetail_2").prepend(output);
				hideLoading();
			},
	    error: function(xhr, status, error) {
	        console.error("요청 실패");
	        console.error("Status:", status);       // 예: "error"
	        console.error("Error:", error);         // 예: 서버 응답 메시지
	        console.error("Response:", xhr.responseText); // 서버 응답 본문
	        alert("오류가 발생했습니다: " + error);
	    }
	});

});

// 닫기 버튼
$(document).on("click", "#closeBtn_stockInfoDetail", function(e) {
	closeModal();
});

// 오버레이 클릭
$(document).on("click", "#overlay_stockInfoDetail", function(e) {
	closeModal();
});
