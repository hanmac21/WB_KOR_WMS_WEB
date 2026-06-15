/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_salesExceptionInputSummary = [];
let globalSalesExceptionInputSummaryData = [];
let currentSalesExceptionInputSummaryPage = 1;
let salesExceptionInputSummaryItemsPerPage = 100;
let totalSalesExceptionInputSummaryCount = 0;
let totalSalesExceptionInputSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredSalesExceptionInputSummaryData = [];
	window.salesExceptionInputSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },       
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Qty' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mSales_exception_input_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';

		performSalesExceptionInputSummaryDBSearch({ fromDate, toDate, factory, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesExceptionInputSummaryDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_salesExceptionInputSummary",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				// 서버에서 받은 전체 데이터 저장
				allServerData = response.records || [];
				filteredData_salesExceptionInputSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesExceptionInputSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_exception_input_summary').length) {
					renderSalesExceptionInputSummaryView();
				} else {
					renderSalesExceptionInputSummaryTableData();
					renderSalesExceptionInputSummaryPagination();
					updateSalesExceptionInputSummaryTotalCount();
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

	// 클라이언트에서 페이징 처리
	function applyClientPagination() {
		salesExceptionInputSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesExceptionInputSummaryCount = filteredData_salesExceptionInputSummary.length;
		totalSalesExceptionInputSummaryPages = Math.ceil(totalSalesExceptionInputSummaryCount / salesExceptionInputSummaryItemsPerPage);

		const startIndex = (currentSalesExceptionInputSummaryPage - 1) * salesExceptionInputSummaryItemsPerPage;
		const endIndex = startIndex + salesExceptionInputSummaryItemsPerPage;

		globalSalesExceptionInputSummaryData = filteredData_salesExceptionInputSummary.slice(startIndex, endIndex);
		window.filteredSalesExceptionInputSummaryData = globalSalesExceptionInputSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_salesExceptionInputSummary.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

			if (dataType === 'number') {
				valA = parseFloat(valA) || 0;
				valB = parseFloat(valB) || 0;
			} else if (dataType === 'date') {
				valA = new Date(valA).getTime() || 0;
				valB = new Date(valB).getTime() || 0;
			} else {
				valA = String(valA).toUpperCase();
				valB = String(valB).toUpperCase();
			}

			if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
			if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		currentSalesExceptionInputSummaryPage = 1;
		applyClientPagination();

		renderSalesExceptionInputSummaryTableData();
		renderSalesExceptionInputSummaryPagination();
		updateSalesExceptionInputSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesExceptionInputSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mSales_exception_input_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="salesExceptionInputSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="salesExceptionInputSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesExceptionInputSummary_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesExceptionInputSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="salesExceptionInputSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesExceptionInputSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesExceptionInputSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSalesExceptionInputSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnSalesExceptionInputSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesExceptionInputSummaryTotalCount">${totalSalesExceptionInputSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="salesExceptionInputSummaryCurrentPageInfo">${currentSalesExceptionInputSummaryPage}</strong>/<strong id="salesExceptionInputSummaryTotalPageInfo">${totalSalesExceptionInputSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesExceptionInputSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mSales_exception_input_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesExceptionInputSummaryExcelBtn" onclick="downloadAllSalesExceptionInputSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mSales_exception_input_summary" id="salesExceptionInputSummaryTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='factoryVal' data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="salesExceptionInputSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesExceptionInputSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="salesExceptionInputSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="salesExceptionInputSummary_itemsPerPage" class="items-per-page-select">
					            <option value="100" selected>100</option>
					            <option value="300">300</option>
					            <option value="1000">1000</option>
					        </select>
					    </div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		// 화면에 기본 날짜 세팅
		const { fromDate, toDate } = getDefaultDateRange();
		$("#salesExceptionInputSummary_searchVal_fromDate").val(fromDate);
		$("#salesExceptionInputSummary_searchVal_toDate").val(toDate);
		$("#salesExceptionInputSummary_itemsPerPage").val(salesExceptionInputSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSalesExceptionInputSummaryTableData();
		// 페이지네이션 렌더링
		renderSalesExceptionInputSummaryPagination();
		// 이벤트 바인딩
		bindSalesExceptionInputSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesExceptionInputSummaryTotalCount();
	}

	function fmtLocalDate(d) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${dd}`;
	}

	function getDefaultDateRange() {
		const today = new Date();
		const toDate = fmtLocalDate(today);
	    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const fromDate = fmtLocalDate(firstDayOfMonth);
		return { fromDate, toDate };
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const factory = $('#salesExceptionInputSummary_searchVal_factory');
		const storage = $('#salesExceptionInputSummary_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
	            'WBTA': ['MATERIAL', 'PRODUCT', 'all'],
	        };

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			// 두 번째 옵션 선택 (PRODUCT)
			storage.val(storageList[1]);
		}

		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}

		updateStorageOptions(savedFactory || '');

		factory.on('change', function() {
			updateStorageOptions($(this).val());
		});

		window.autoSetStorageFields();
	}

	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function updateSalesExceptionInputSummaryTotalCount() {
		$(".salesExceptionInputSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#salesExceptionInputSummaryTotalCount').text(Number(totalSalesExceptionInputSummaryCount).toLocaleString());
		$('#salesExceptionInputSummaryCurrentPageInfo').text(currentSalesExceptionInputSummaryPage);
		$('#salesExceptionInputSummaryTotalPageInfo').text(totalSalesExceptionInputSummaryPages);
	}

	function renderSalesExceptionInputSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSalesExceptionInputSummaryData.length; i++) {
			let rowNumber = (currentSalesExceptionInputSummaryPage - 1) * salesExceptionInputSummaryItemsPerPage + i + 1;
			let data = globalSalesExceptionInputSummaryData[i];
			
			tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'factoryVal'>${data.FACTORY || data.factory || ''}</td>
				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'itemnameLongVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
				</tr>
			`;
		}

		$("#salesExceptionInputSummaryTableBody").html(tableBody);
	}

	function renderSalesExceptionInputSummaryPagination() {
		let paginationHtml = "";

		if (currentSalesExceptionInputSummaryPage > 1) {
			paginationHtml += `<button class="salesExceptionInputSummary-page-btn" data-page="${currentSalesExceptionInputSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesExceptionInputSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesExceptionInputSummaryPage - 5);
		let endPage = Math.min(totalSalesExceptionInputSummaryPages, currentSalesExceptionInputSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesExceptionInputSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesExceptionInputSummaryPage) {
				paginationHtml += `<button class="salesExceptionInputSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesExceptionInputSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesExceptionInputSummaryPages) {
			if (endPage < totalSalesExceptionInputSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesExceptionInputSummary-page-btn" data-page="${totalSalesExceptionInputSummaryPages}">${totalSalesExceptionInputSummaryPages}</button>`;
		}

		if (currentSalesExceptionInputSummaryPage < totalSalesExceptionInputSummaryPages) {
			paginationHtml += `<button class="salesExceptionInputSummary-page-btn" data-page="${currentSalesExceptionInputSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesExceptionInputSummary-page-btn disabled">&gt;</button>`;
		}

		$("#salesExceptionInputSummaryPaginationContainer").html(paginationHtml);
	}

	function bindSalesExceptionInputSummaryEvents() {
		$(".btnSalesExceptionInputSummarySearch").off('click').on('click', function() {
			performSalesExceptionInputSummarySearch();
		});

		$(".btnSalesExceptionInputSummarySearchInit").off('click').on('click', function() {
			resetSalesExceptionInputSummarySearch();
		});

		$('#salesExceptionInputSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesExceptionInputSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.salesExceptionInputSummary-page-btn').on('click', '.salesExceptionInputSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesExceptionInputSummaryPage = page;
					applyClientPagination();
					renderSalesExceptionInputSummaryTableData();
					renderSalesExceptionInputSummaryPagination();
					updateSalesExceptionInputSummaryTotalCount();
				}
			}
		});

		$('#salesExceptionInputSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mSales_exception_input_summary input[type="text"], #view_mSales_exception_input_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesExceptionInputSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#salesExceptionInputSummary_searchVal_fromDate").val(),
			toDate: $("#salesExceptionInputSummary_searchVal_toDate").val(),
			factory: $("#salesExceptionInputSummary_searchVal_factory").val(),
			storage: $("#salesExceptionInputSummary_searchVal_storage").val(),
			car: $("#salesExceptionInputSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#salesExceptionInputSummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesExceptionInputSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performSalesExceptionInputSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesExceptionInputSummaryPage = 1;
		performSalesExceptionInputSummaryDBSearch(searchCriteria);
	}

	function resetSalesExceptionInputSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#salesExceptionInputSummary_searchVal_fromDate").val(fromDate);
		$("#salesExceptionInputSummary_searchVal_toDate").val(toDate);
		$("#salesExceptionInputSummary_searchVal_car").val('');
		$("#salesExceptionInputSummary_searchVal_itemcode").val('');
		$("#salesExceptionInputSummary_searchVal_itemname").val('');

		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';
		
		currentSalesExceptionInputSummaryPage = 1;
		performSalesExceptionInputSummaryDBSearch({ fromDate, toDate, factory, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSalesExceptionInputSummaryItemsPerPage = function(newItemsPerPage) {
		salesExceptionInputSummaryItemsPerPage = newItemsPerPage;
		currentSalesExceptionInputSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesExceptionInputSummaryTableData();
		renderSalesExceptionInputSummaryPagination();
		updateSalesExceptionInputSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSalesExceptionInputSummaryData = function() {
		return {
			total: filteredData_salesExceptionInputSummary.length,
			currentPage: currentSalesExceptionInputSummaryPage,
			itemsPerPage: salesExceptionInputSummaryItemsPerPage,
			data: filteredData_salesExceptionInputSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesExceptionInputSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_salesExceptionInputSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.salesExceptionInputSummaryColumns, {
		fileName: 'salesExceptionInputSummary_All',
		sheetName: 'salesExceptionInputSummary'
	});

	hideLoading();
};
