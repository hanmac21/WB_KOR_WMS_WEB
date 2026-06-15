/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalProductionStockCountListData = []; // 현재 조회된 데이터 저장
	let currentProductionStockCountListPage = 1; // 현재 페이지
	let productionStockCountListItemsPerPage = 1000; // 페이지당 항목 수
	let totalProductionStockCountListCount = 0; // 서버에서 받은 총 개수 저장
	let totalProductionStockCountListPages = 0; // 서버에서 받은 총 페이지
	window.filteredProductionStockCountListData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.productionStockCountListColumns = [
		{ key: 'SCANTYPE', header: 'scantype' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'barcode' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mProduction_stock_count_list = function(menuId) {
		showLoading("data");
		
		const factory = getCookie('selectedFactory');
		const storage = factory == 'SALTILLO' ? 'H/REST' : 'Workshop';
		
		// 초기 로딩: 기본 공장으로 조회
		performProductionStockCountListDBSearch({ factory, storage });
	}

	// DB에서 데이터 조회하는 함수
	function performProductionStockCountListDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_productionStockCountList",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentProductionStockCountListPage,
				itemsPerPage: productionStockCountListItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalProductionStockCountListData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalProductionStockCountListCount = data.totalCount || 0;
				totalProductionStockCountListPages = data.totalPages || 0;
				window.filteredProductionStockCountListData = globalProductionStockCountListData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_stock_count_list').length) {
					renderProductionStockCountListView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderProductionStockCountListTableData();
					renderProductionStockCountListPagination();
					updateProductionStockCountListTotalCount();
				}

				updateTotalQty();

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
	function renderProductionStockCountListView() {
		let content_output = `
			<div class="divBlockControl" id="view_mProduction_stock_count_list">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="productionStockCountList_searchVal_scantype">${i18n.t('search.scanType')}<!-- SCANTYPE --></div>
								<select id="productionStockCountList_searchVal_scantype" >
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="LOCATION" >${i18n.t('search.location')}</option>
									<option value="BARCODE">${i18n.t('search.barcode')}</option>
								</select>
							</div>
							<div class="search-label">
								<div class="productionStockCountList_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionStockCountList_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="productionStockCountList_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="productionStockCountList_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="productionStockCountList_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="productionStockCountList_searchVal_sdate" />
							</div>
							<div class="search-label">
								<div class="productionStockCountList_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="productionStockCountList_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="productionStockCountList_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionStockCountList_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="productionStockCountList_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productionStockCountList_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="productionStockCountList_searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
								<input type="text" id="productionStockCountList_searchVal_location" />
							</div>
							<div class="search-label">
								<div class="productionStockCountList_searchVal_loginid">${i18n.t('search.user')}<!-- USER --></div>
								<input type="text" id="productionStockCountList_searchVal_loginid" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnProductionStockCountListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnProductionStockCountListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="productionStockCountListTotalCount">${totalProductionStockCountListCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="productionStockCountListCurrentPageInfo">${currentProductionStockCountListPage}</strong>/<strong id="productionStockCountListTotalPageInfo">${totalProductionStockCountListPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="productionStockCountListTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mProduction_stock_count_list">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="productionStockCountListExcelBtn" onclick="downloadAllProductionStockCountListData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mProduction_stock_count_list">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "scantypeVal">${i18n.t('search.scanType')}<!-- SCANTYPE --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- SDATE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>   
									<th class = "userVal">${i18n.t('search.user')}<!-- LOGINID --></th>									    
									<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>	
									<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
								</tr>
							</thead>
							<tbody id="productionStockCountListDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="productionStockCountListPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		/*<button class="btn btn-success" id="productionStockCountListExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionStockCountListData, productionStockCountListColumns, {fileName:'ProductionStockCountList', sheetName:'ProductionStockCountList'})">Excel</button>*/
		$(".w_contentArea").append(content_output);

		// 공장 및 창고 선택
		renderFactoryStorage();	
		// 테이블 데이터 렌더링
		renderProductionStockCountListTableData();
		// 페이지네이션 렌더링
		renderProductionStockCountListPagination();
		// 이벤트 바인딩
		bindProductionStockCountListEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateProductionStockCountListTotalCount();
		
	}


	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const factory = $('#productionStockCountList_searchVal_factory');
	    const storage = $('#productionStockCountList_searchVal_storage');
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
	            const text = item === 'all' ? i18n.t('search.all') : item;
	            storage.append(`<option value="${item}">${text}</option>`);
	        });
	        
	        // 첫 번째 옵션 선택 (Material)
	        storage.val(storageList[0]);
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
	function updateProductionStockCountListTotalCount() {
		$('#productionStockCountListTotalCount').text(Number(totalProductionStockCountListCount).toLocaleString());
	}

	function renderProductionStockCountListTableData() {
		let tableBody = "";

		//console.log("globalProductionStockCountListData:", globalProductionStockCountListData);
		//console.log("데이터 개수:", globalProductionStockCountListData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalProductionStockCountListData.length; i++) {
			let rowNumber = (currentProductionStockCountListPage - 1) * productionStockCountListItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalProductionStockCountListData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "scantypeVal">${globalProductionStockCountListData[i].SCANTYPE || globalProductionStockCountListData[i].scantype || ''}</td>
                <td class = "factoryVal">${globalProductionStockCountListData[i].FACTORY || globalProductionStockCountListData[i].factory || ''}</td>
                <td class = "storageVal">${globalProductionStockCountListData[i].STORAGE || globalProductionStockCountListData[i].storage || ''}</td>
                <td class = "dateVal">${globalProductionStockCountListData[i].SDATE || globalProductionStockCountListData[i].sdate || ''}</td>
                <td class = "carVal">${globalProductionStockCountListData[i].CAR || globalProductionStockCountListData[i].car || ''}</td>
                <td class = "itemcodeVal">${globalProductionStockCountListData[i].ITEMCODE || globalProductionStockCountListData[i].itemcode || ''}</td>
                <td class = "itemnameVal">${globalProductionStockCountListData[i].ITEMNAME || globalProductionStockCountListData[i].itemname || ''}</td>
                <td class = "qtyVal">${Number(globalProductionStockCountListData[i].QTY || globalProductionStockCountListData[i].qty || 0).toLocaleString()}</td>
                <td class = "locationVal">${globalProductionStockCountListData[i].LOCATION || globalProductionStockCountListData[i].location || ''}</td>
                <td class = "userVal">${globalProductionStockCountListData[i].LOGINID || globalProductionStockCountListData[i].loginid || ''}</td>
                <td class = "hhmmVal">${globalProductionStockCountListData[i].HHMM || globalProductionStockCountListData[i].hhmm || ''}</td>
				<td class = "barcodeVal">${globalProductionStockCountListData[i].BARCODE || globalProductionStockCountListData[i].barcode || ''}</td>
            </tr>
        `;
		}

		//console.log("생성된 tableBody:", tableBody);
		$("#productionStockCountListDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderProductionStockCountListPagination() {
		let totalPages = Math.ceil(totalProductionStockCountListCount / productionStockCountListItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentProductionStockCountListPage > 1) {
			paginationHtml += `<button class="productionStockCountList-page-btn" data-page="${currentProductionStockCountListPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="productionStockCountList-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentProductionStockCountListPage - 5);
		let endPage = Math.min(totalPages, currentProductionStockCountListPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="productionStockCountList-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentProductionStockCountListPage) {
				paginationHtml += `<button class="productionStockCountList-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="productionStockCountList-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="productionStockCountList-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentProductionStockCountListPage < totalPages) {
			paginationHtml += `<button class="productionStockCountList-page-btn" data-page="${currentProductionStockCountListPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="productionStockCountList-page-btn disabled">&gt;</button>`;
		}

		$("#productionStockCountListCurrentPageInfo").html(currentProductionStockCountListPage);
		$("#productionStockCountListPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindProductionStockCountListEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnProductionStockCountListSearch").off('click').on('click', function() {
			performProductionStockCountListSearch();
		});

		// 초기화 버튼 클릭
		$(".btnProductionStockCountListSearchInit").off('click').on('click', function() {
			resetProductionStockCountListSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.productionStockCountList-page-btn').on('click', '.productionStockCountList-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentProductionStockCountListPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performProductionStockCountListDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_mProduction_stock_count_list input[type="text"], #view_mProduction_stock_count_list input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performProductionStockCountListSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			scantype: $("#productionStockCountList_searchVal_scantype").val(),
			factory: $("#productionStockCountList_searchVal_factory").val(),
			storage: $("#productionStockCountList_searchVal_storage").val(),
			sdate: $("#productionStockCountList_searchVal_sdate").val(),
			car: $("#productionStockCountList_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#productionStockCountList_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#productionStockCountList_searchVal_itemname").val().trim().toUpperCase(),
			location: $("#productionStockCountList_searchVal_location").val().trim().toUpperCase(),
			loginid: $("#productionStockCountList_searchVal_loginid").val().trim().toUpperCase()
		};
	}

	// 검색 수행 함수 - DB 조회
	function performProductionStockCountListSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentProductionStockCountListPage = 1;
		performProductionStockCountListDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetProductionStockCountListSearch() {
		const factory = getCookie('selectedFactory');
		const storage = factory == 'SALTILLO' ? 'H/REST' : 'Workshop';
		renderFactoryStorage();
		
		$("#productionStockCountList_searchVal_scantype").val('all');
		$("#productionStockCountList_searchVal_sdate").val('');
		$("#productionStockCountList_searchVal_car").val('');
		$("#productionStockCountList_searchVal_itemcode").val('');
		$("#productionStockCountList_searchVal_itemname").val('');
		$("#productionStockCountList_searchVal_location").val('');
		$("#productionStockCountList_searchVal_loginid").val('');

		console.log($("#productionStockCountList_searchVal_scantype").val());
		
		// 초기화 후 전체 데이터 다시 조회
		currentProductionStockCountListPage = 1;
		performProductionStockCountListDBSearch({ factory, storage });

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
	window.changeProductionStockCountListItemsPerPage = function(newItemsPerPage) {
		productionStockCountListItemsPerPage = newItemsPerPage;
		currentProductionStockCountListPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performProductionStockCountListDBSearch(searchCriteria);
	}

	window.exportProductionStockCountListData = function() {
		return {
			total: globalProductionStockCountListData.length,
			currentPage: currentProductionStockCountListPage,
			itemsPerPage: productionStockCountListItemsPerPage,
			data: globalProductionStockCountListData
		};
	}

	function updateTotalQty() {
		const searchMap = getCurrentSearchCriteria();
		if (!searchMap) {
			searchMap = {}; // null이면 빈 객체로 변경
		}

		$.ajax({
			url: "/updateTotalQty_productionStockCount",
			type: "POST",
			data: JSON.stringify(searchMap),
			contentType: "application/json",
			success: function(data) {
				$(".productionStockCountListTotalQty").text(Number(data).toLocaleString());
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
});


window.downloadAllProductionStockCountListData = function() {
	let searchCriteria = {
		factory: $("#productionStockCountList_searchVal_factory").val(),
		storage: $("#productionStockCountList_searchVal_storage").val(),
		scantype: $("#productionStockCountList_searchVal_scantype").val(),
		sdate: $("#productionStockCountList_searchVal_sdate").val(),
		car: $("#productionStockCountList_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionStockCountList_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionStockCountList_searchVal_itemname").val().trim().toUpperCase(),
		location: $("#productionStockCountList_searchVal_location").val().trim().toUpperCase(),
		loginid: $("#productionStockCountList_searchVal_loginid").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_productionStockCountList_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionStockCountListColumns, {
				fileName: 'ProductionStockCountList_All',
				sheetName: 'ProductionStockCountList'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};


