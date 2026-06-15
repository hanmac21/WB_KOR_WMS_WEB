/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */


$(document).ready(function() {

	let globalProductionStockDetailData = []; // 현재 조회된 데이터 저장
	let currentProductionStockDetailPage = 1; // 현재 페이지
	let productionStockDetailItemsPerPage = 1000; // 페이지당 항목 수
	let totalProductionStockDetailCount = 0; // 서버에서 받은 총 개수 저장
	let totalProductionStockDetailQty = 0; // 서버에서 받은 총 개수 저장
	let totalProductionStockDetailPages = 0; // 서버에서 받은 총 페이지
	window.filteredProductionStockDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.productionStockDetailColumns = [
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'INDATE', header: 'indate' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'barcode' }
	];


	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mProduction_stock_detail = function(menuId) {
		showLoading("data");
		
		const factory = getCookie('selectedFactory');
		const storage = factory == 'SALTILLO' ? 'H/REST' : 'Workshop';
		
		// 초기 로딩: 공장으로 조회
		performProductionStockDetailDBSearch({ factory , storage});
	}

	// DB에서 데이터 조회하는 함수
	function performProductionStockDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_productionStockDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentProductionStockDetailPage,
				itemsPerPage: productionStockDetailItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalProductionStockDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalProductionStockDetailCount = data.totalCount || 0;
				totalProductionStockDetailQty = data.totalQty || 0;
				totalProductionStockDetailPages = data.totalPages || 0;
				currentProductionStockDetailPage = data.currentPage || 0;
				window.filteredProductionStockDetailData = globalProductionStockDetailData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_stock_detail').length) {
					renderProductionStockDetailView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderProductionStockDetailTableData();
					renderProductionStockDetailPagination();
					updateProductionStockDetailTotalCount();
					updateProductionStockDetailTotalQty();
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
	function renderProductionStockDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_mProduction_stock_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionStockDetail_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="productionStockDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							
							<!--<div class="search-label">
								<div class="searchVal_indate">${i18n.t('search.date')} indate </div>
								<input type="date" id="productionStockDetail_searchVal_indate" />
							</div>-->
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="productionStockDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionStockDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productionStockDetail_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnProductionStockDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnProductionStockDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="productionStockDetailTotalCount">${totalProductionStockDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="productionStockDetailCurrentPageInfo">${currentProductionStockDetailPage}</strong>/<strong id="productionStockDetailTotalPageInfo">${totalProductionStockDetailPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "productionStockDetailTotalQty"></strong>
							</span>
							<div class="action-buttons-right mProduction_stock_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="productionStockDetailExcelBtn" onclick="downloadAllProductionStockDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mProduction_stock_detail">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
									    <th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									    <th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>									    
									    <th class = "dateVal">${i18n.t('search.date')}<!-- INSDATE --></th>
									    <th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									    <th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									    <th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>
									    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>									    
									    <th class = "userVal">${i18n.t('search.user')}<!-- LOGINID --></th>									    
									    <th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>									    
										<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- LOT --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="productionStockDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="productionStockDetailPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		/*<button class="btn btn-success" id="productionStockDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionStockDetailData, productionStockDetailColumns, {fileName:'ProductionStockDetail', sheetName:'ProductionStockDetail'})">Excel</button>*/
		
		/* 임시 주석 필요시 사용
		<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
								<input type="text" id="searchVal_location" />
							</div>
							<th>${i18n.t('search.location')}<!-- LOCATION --></th>
							<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
		*/
		$(".w_contentArea").append(content_output);

		// 공장 및 창고 선택
		renderFactoryStorage();		
		// 테이블 데이터 렌더링
		renderProductionStockDetailTableData();
		// 페이지네이션 렌더링
		renderProductionStockDetailPagination();
		// 이벤트 바인딩
		bindProductionStockDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateProductionStockDetailTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateProductionStockDetailTotalQty();
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const factory = $('#productionStockDetail_searchVal_factory');
	    const storage = $('#productionStockDetail_searchVal_storage');
	    const savedFactory = getCookie('selectedFactory');

	    // 공장별 창고 옵션 설정
	    function updateStorageOptions(factoryValue) {
	        storage.empty();
	        
	        const options = {
                'SALTILLO': ['H/REST'],
                'PUEBLA': ['Workshop'],
                '': ['H/REST', 'Workshop', 'all']
            };

            const storageList = options[factoryValue] || options[''];

            storageList.forEach(item => {
                const value = item.toUpperCase(); // value는 대문자로 변환
                const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
                storage.append(`<option value="${value}">${text}</option>`);
            });
	        
            // 첫 번째 옵션 선택
            storage.val(storageList[0].toUpperCase());
	    }

	    // 저장된 공장 선택
	    if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
	        factory.val(savedFactory);
	    }
	    
	    updateStorageOptions(savedFactory || '');

	    // 공장 변경 시 창고 업데이트
	    factory.on('change', function() {
	        updateStorageOptions($(this).val());
	    });
	}
	
	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	    return match ? decodeURIComponent(match[2]) : '';
	}
	
	// 총 개수를 업데이트하는 함수
	function updateProductionStockDetailTotalCount() {
		$('#productionStockDetailTotalCount').text(totalProductionStockDetailCount.toLocaleString());
	}
	// 총 개수를 업데이트하는 함수
	function updateProductionStockDetailTotalQty() {
		$('#productionStockDetailTotalQty').text(totalProductionStockDetailQty.toLocaleString());
	}

	function renderProductionStockDetailTableData() {
		let tableBody = "";

		//console.log("globalProductionStockDetailData:", globalProductionStockDetailData);
		//console.log("데이터 개수:", globalProductionStockDetailData.length);
		$("#productionStockDetailCurrentPageInfo").text(currentProductionStockDetailPage);
		$("#productionStockDetailTotalPageInfo").text(totalProductionStockDetailPages);
		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalProductionStockDetailData.length; i++) {
			let rowNumber = (currentProductionStockDetailPage - 1) * productionStockDetailItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalProductionStockDetailData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
            	<td class = "noVal">${rowNumber}</td>
				<td class = "factoryVal">${globalProductionStockDetailData[i].FACTORY || globalProductionStockDetailData[i].factory || ''}</td>
				<td class = "storageVal">${globalProductionStockDetailData[i].STORAGE || globalProductionStockDetailData[i].storage || ''}</td>				
				<td class = "dateVal">${globalProductionStockDetailData[i].INSDATE || globalProductionStockDetailData[i].indate || ''}</td>
				<td class = "carVal">${globalProductionStockDetailData[i].CAR || globalProductionStockDetailData[i].car || ''}</td>
				<td class = "itemcodeVal">${globalProductionStockDetailData[i].ITEMCODE || globalProductionStockDetailData[i].itemcode || ''}</td>
				<td class = "itemnameVal">${globalProductionStockDetailData[i].ITEMNAME || globalProductionStockDetailData[i].itemname || ''}</td>
				<td class = "locationVal">${globalProductionStockDetailData[i].LOCATION || globalProductionStockDetailData[i].location || ''}</td>
				<td class = "qtyVal">${Number(globalProductionStockDetailData[i].QTY || globalProductionStockDetailData[i].qty || 0).toLocaleString()}</td>				
				<td class = "userVal">${globalProductionStockDetailData[i].LOGINID || globalProductionStockDetailData[i].loginid || ''}</td>
				<td class = "hhmmVal">${globalProductionStockDetailData[i].HHMM || globalProductionStockDetailData[i].hhmm || ''}</td>
				<td class = "barcodeVal">${globalProductionStockDetailData[i].BARCODE || globalProductionStockDetailData[i].barcode || ''}</td>
            </tr>
        `;
		}
		
		/* 임시 주석 필요시 사용
		<td>${globalProductionStockDetailData[i].LOCATION || globalProductionStockDetailData[i].location || ''}</td>
		<td>${globalProductionStockDetailData[i].YMDHMS || globalProductionStockDetailData[i].ymdhms || ''}</td>
				*/
		//console.log("생성된 tableBody:", tableBody);
		$("#productionStockDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderProductionStockDetailPagination() {
		let totalPages = Math.ceil(totalProductionStockDetailCount / productionStockDetailItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentProductionStockDetailPage > 1) {
			paginationHtml += `<button class="productionStockDetail-page-btn" data-page="${currentProductionStockDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="productionStockDetail-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentProductionStockDetailPage - 5);
		let endPage = Math.min(totalPages, currentProductionStockDetailPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="productionStockDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentProductionStockDetailPage) {
				paginationHtml += `<button class="productionStockDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="productionStockDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="productionStockDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentProductionStockDetailPage < totalPages) {
			paginationHtml += `<button class="productionStockDetail-page-btn" data-page="${currentProductionStockDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="productionStockDetail-page-btn disabled">&gt;</button>`;
		}

		$("#productionStockDetailPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindProductionStockDetailEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnProductionStockDetailSearch").off('click').on('click', function() {
			performProductionStockDetailSearch();
		});

		// 초기화 버튼 클릭
		$(".btnProductionStockDetailSearchInit").off('click').on('click', function() {
			resetProductionStockDetailSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.productionStockDetail-page-btn').on('click', '.productionStockDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentProductionStockDetailPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performProductionStockDetailDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_mProduction_stock_detail input[type="text"], #view_mProduction_stock_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performProductionStockDetailSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			factory: $("#productionStockDetail_searchVal_factory").val(),
			storage: $("#productionStockDetail_searchVal_storage").val(),
			indate: $("#productionStockDetail_searchVal_indate").val(),
			car: $("#productionStockDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#productionStockDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#productionStockDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	// 검색 수행 함수 - DB 조회
	function performProductionStockDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentProductionStockDetailPage = 1;
		performProductionStockDetailDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetProductionStockDetailSearch() {
		const factory = getCookie('selectedFactory');
		const storage = factory == 'SALTILLO' ? 'H/REST' : 'Workshop'
			
		renderFactoryStorage();
		
		$("#productionStockDetail_searchVal_indate").val('');
		$("#productionStockDetail_searchVal_car").val('');
		$("#productionStockDetail_searchVal_itemcode").val('');
		$("#productionStockDetail_searchVal_itemname").val('');

		// 초기화 후 전체 데이터 다시 조회
		currentProductionStockDetailPage = 1;
		performProductionStockDetailDBSearch({ factory, storage });

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
	window.changeProductionStockDetailItemsPerPage = function(newItemsPerPage) {
		productionStockDetailItemsPerPage = newItemsPerPage;
		currentProductionStockDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performProductionStockDetailDBSearch(searchCriteria);
	}

	window.exportProductionStockDetailData = function() {
		return {
			total: globalProductionStockDetailData.length,
			currentPage: currentProductionStockDetailPage,
			itemsPerPage: productionStockDetailItemsPerPage,
			data: globalProductionStockDetailData
		};
	}

});
window.downloadAllProductionStockDetailData = function() {
	let searchCriteria = {
		factory: $("#productionStockDetail_searchVal_factory").val(),
		storage: $("#productionStockDetail_searchVal_storage").val(),
		indate: $("#productionStockDetail_searchVal_indate").val(),
		car: $("#productionStockDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionStockDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionStockDetail_searchVal_itemname").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_productionStockDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionStockDetailColumns, {
				fileName: 'ProductionStockDetail_All',
				sheetName: 'ProductionStockDetail'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};
