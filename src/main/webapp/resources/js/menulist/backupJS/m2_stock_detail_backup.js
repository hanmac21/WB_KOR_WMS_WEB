/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */


/*$(document).ready(function() {

	let globalStockDetailData = []; // 현재 조회된 데이터 저장
	let currentStockDetailPage = 1; // 현재 페이지
	let stockDetailItemsPerPage = 1000; // 페이지당 항목 수
	let totalStockDetailCount = 0; // 서버에서 받은 총 개수 저장
	let totalStockDetailQty = 0; // 서버에서 받은 총 개수 저장
	let totalStockDetailPages = 0; // 서버에서 받은 총 페이지
	window.filteredStockDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.stockDetailColumns = [
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'INDATE', header: 'indate' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'customer code' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'Barcode' }
	];


	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_stock_detail = function(menuId) {
		showLoading("data");

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 공장으로 조회
		performStockDetailDBSearch({ factory });
	}

	// DB에서 데이터 조회하는 함수
	function performStockDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_stockDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentStockDetailPage,
				itemsPerPage: stockDetailItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalStockDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalStockDetailCount = data.totalCount || 0;
				totalStockDetailQty = data.totalQty || 0;
				totalStockDetailPages = data.totalPages || 0;
				currentStockDetailPage = data.currentPage || 0;
				window.filteredStockDetailData = globalStockDetailData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_stock_detail').length) {
					renderStockDetailView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderStockDetailTableData();
					renderStockDetailPagination();
					updateStockDetailTotalCount();
					updateStockDetailTotalQty();
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
	function renderStockDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_stock_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="stockDetail_searchVal_factory">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="stockDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							
							
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="stockDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="stockDetail_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnStockDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnStockDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="stockDetailTotalCount">${totalStockDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="stockDetailCurrentPageInfo">${currentStockDetailPage}</strong>/<strong id="stockDetailTotalPageInfo">${totalStockDetailPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "stockDetailTotalQty"></strong>
							</span>
							<div class="action-buttons-right m2_stock_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockDetailExcelBtn" onclick="downloadAllStockDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_stock_detail">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
									    <th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									    <th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>									    
									    <th class = "dateVal">${i18n.t('search.date')}<!-- INSDATE --></th>
									    <th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									    <th class = "itemcodeVal">${i18n.t('search.customercode')}<!-- CUSTCODE --></th>
									    <th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									    <th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>
									    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>									    
									    <th class = "userVal">${i18n.t('search.user')}<!-- LOGINID --></th>									    
									    <th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>									    
										<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- LOT --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="stockDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="stockDetailPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		/* 날짜 임시 주석
		<div class="search-label">
								<div class="searchVal_indate">${i18n.t('search.date')}<!-- indate --></div>
								<input type="date" id="stockDetail_searchVal_indate" />
							</div>
		
		*/

		/*<button class="btn btn-success" id="stockDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredStockDetailData, stockDetailColumns, {fileName:'StockDetail', sheetName:'StockDetail'})">Excel</button>*/

		/* 임시 주석 필요시 사용
		<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
								<input type="text" id="searchVal_location" />
							</div>
							<th>${i18n.t('search.location')}<!-- LOCATION --></th>
							<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
		*/
		/*$(".w_contentArea").append(content_output);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderStockDetailTableData();
		// 페이지네이션 렌더링
		renderStockDetailPagination();
		// 이벤트 바인딩
		bindStockDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateStockDetailTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateStockDetailTotalQty();
	}

	function renderFactoryStorage() {
		const factory = $('#stockDetail_searchVal_factory');
		const storage = $('#stockDetail_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		let userChangedStorage = false;

		// ✅ 사용자가 창고를 직접 바꾸면 자동세팅이 덮어쓰지 못하게 플래그 ON
		storage.off('change.user').on('change.user', function() {
			userChangedStorage = true;
		});

		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				SALTILLO: ['Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'Material+Sideseat+Outside', 'P1 W/HOUSE', 'REDCAGE', 'all'],
				PUEBLA: ['Material', 'PRODUCT', 'REDCAGE', 'all'],
				'': ['Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'Product', 'Material+Sideseat+Outside', 'P1 W/HOUSE', 'REDCAGE', 'all']
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			// ✅ 공장 바뀔 때만 기본값 세팅 (이때는 사용자가 바꾸기 전이므로 플래그 리셋)
			userChangedStorage = false;
			storage.val(storageList[0]);

			// ✅ 여기서 autoSetStorageFields가 창고를 다시 덮어쓰면 “선택 불가”가 됩니다.
			// window.autoSetStorageFields();  // ❌ 제거(또는 조건부)
		}

		// 저장된 공장 선택
		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}

		updateStorageOptions(savedFactory || '');

		// 공장 변경 시에만 창고 옵션 다시 구성
		factory.off('change.factory').on('change.factory', function() {
			updateStorageOptions($(this).val());

			// ✅ 공장 변경 직후에만 자동세팅이 필요하면 여기서 1회만 호출
			if (typeof window.autoSetStorageFields === 'function') {
				window.autoSetStorageFields();
			}
		});

		// ✅ 초기 1회만 필요하면 여기서만 호출 (원하시면 주석 해제)
		// if (typeof window.autoSetStorageFields === 'function') {
		//     window.autoSetStorageFields();
		// }
	}


	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// 총 개수를 업데이트하는 함수
	function updateStockDetailTotalCount() {
		$('#stockDetailTotalCount').text(totalStockDetailCount.toLocaleString());
	}
	// 총 개수를 업데이트하는 함수
	function updateStockDetailTotalQty() {
		$('#stockDetailTotalQty').text(totalStockDetailQty.toLocaleString());
	}

	function renderStockDetailTableData() {
		let tableBody = "";

		//console.log("globalStockDetailData:", globalStockDetailData);
		//console.log("데이터 개수:", globalStockDetailData.length);
		$("#stockDetailCurrentPageInfo").text(currentStockDetailPage);
		$("#stockDetailTotalPageInfo").text(totalStockDetailPages);
		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalStockDetailData.length; i++) {
			let rowNumber = (currentStockDetailPage - 1) * stockDetailItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalStockDetailData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
            	<td class = "noVal">${rowNumber}</td>
				<td class = "factoryVal">${globalStockDetailData[i].FACTORY || globalStockDetailData[i].factory || ''}</td>
				<td class = "storageVal">${globalStockDetailData[i].STORAGE || globalStockDetailData[i].storage || ''}</td>				
				<td class = "dateVal">${globalStockDetailData[i].INSDATE || globalStockDetailData[i].indate || ''}</td>
				<td class = "carVal">${globalStockDetailData[i].CAR || globalStockDetailData[i].car || ''}</td>
				<td class = "itemcodeVal">${globalStockDetailData[i].ITEMCODE || globalStockDetailData[i].itemcode || ''}</td>
				<td class = "itemcodeVal">${globalStockDetailData[i].SPEC || globalStockDetailData[i].spec || ''}</td>
				<td class = "itemnameVal">${globalStockDetailData[i].ITEMNAME || globalStockDetailData[i].itemname || ''}</td>
				<td class = "locationVal">${globalStockDetailData[i].LOCATION || globalStockDetailData[i].location || ''}</td>
				<td class = "qtyVal">${Number(globalStockDetailData[i].QTY || globalStockDetailData[i].qty || 0).toLocaleString()}</td>				
				<td class = "userVal">${globalStockDetailData[i].LOGINID || globalStockDetailData[i].loginid || ''}</td>
				<td class = "hhmmVal">${globalStockDetailData[i].HHMM || globalStockDetailData[i].hhmm || ''}</td>
				<td class = "barcodeVal">${globalStockDetailData[i].BARCODE || globalStockDetailData[i].barcode || ''}</td>
            </tr>
        `;
		}

		/* 임시 주석 필요시 사용
		<td>${globalStockDetailData[i].LOCATION || globalStockDetailData[i].location || ''}</td>
		<td>${globalStockDetailData[i].YMDHMS || globalStockDetailData[i].ymdhms || ''}</td>
				*/
		//console.log("생성된 tableBody:", tableBody);
		/*$("#stockDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderStockDetailPagination() {
		let totalPages = Math.ceil(totalStockDetailCount / stockDetailItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentStockDetailPage > 1) {
			paginationHtml += `<button class="stockDetail-page-btn" data-page="${currentStockDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="stockDetail-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentStockDetailPage - 5);
		let endPage = Math.min(totalPages, currentStockDetailPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="stockDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStockDetailPage) {
				paginationHtml += `<button class="stockDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="stockDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="stockDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentStockDetailPage < totalPages) {
			paginationHtml += `<button class="stockDetail-page-btn" data-page="${currentStockDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="stockDetail-page-btn disabled">&gt;</button>`;
		}

		$("#stockDetailPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindStockDetailEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnStockDetailSearch").off('click').on('click', function() {
			performStockDetailSearch();
		});

		// 초기화 버튼 클릭
		$(".btnStockDetailSearchInit").off('click').on('click', function() {
			resetStockDetailSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.stockDetail-page-btn').on('click', '.stockDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentStockDetailPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performStockDetailDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_stock_detail input[type="text"], #view_m2_stock_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performStockDetailSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			factory: $("#stockDetail_searchVal_factory").val(),
			storage: $("#stockDetail_searchVal_storage").val(),
			indate: $("#stockDetail_searchVal_indate").val(),
			car: $("#stockDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#stockDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#stockDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	// 검색 수행 함수 - DB 조회
	function performStockDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentStockDetailPage = 1;
		performStockDetailDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetStockDetailSearch() {
		const factory = getCookie('selectedFactory');

		$("#stockDetail_searchVal_car").val('');
		$("#stockDetail_searchVal_itemcode").val('');
		$("#stockDetail_searchVal_itemname").val('');

		// 공장, 창고 기본값 설정
		renderFactoryStorage()

		// 초기화 후 전체 데이터 다시 조회
		currentStockDetailPage = 1;
		performStockDetailDBSearch({ factory });

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
	window.changeStockDetailItemsPerPage = function(newItemsPerPage) {
		stockDetailItemsPerPage = newItemsPerPage;
		currentStockDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performStockDetailDBSearch(searchCriteria);
	}

	window.exportStockDetailData = function() {
		return {
			total: globalStockDetailData.length,
			currentPage: currentStockDetailPage,
			itemsPerPage: stockDetailItemsPerPage,
			data: globalStockDetailData
		};
	}

});
window.downloadAllStockDetailData = function() {
	let searchCriteria = {
		factory: $("#stockDetail_searchVal_factory").val(),
		storage: $("#stockDetail_searchVal_storage").val(),
		indate: $("#stockDetail_searchVal_indate").val(),
		car: $("#stockDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#stockDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#stockDetail_searchVal_itemname").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_stockDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.stockDetailColumns, {
				fileName: 'StockDetail_All',
				sheetName: 'StockDetail'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};*/
