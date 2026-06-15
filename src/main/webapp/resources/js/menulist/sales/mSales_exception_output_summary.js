/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_salesExceptionOutputSummary = [];
let globalSalesExceptionOutputSummaryData = [];
let currentSalesExceptionOutputSummaryPage = 1;
let salesExceptionOutputSummaryItemsPerPage = 100;
let totalSalesExceptionOutputSummaryCount = 0;
let totalSalesExceptionOutputSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredSalesExceptionOutputSummaryData = [];
	window.salesExceptionOutputSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'ITEMNAME', header: 'temname' },
		{ key: 'QTY', header: 'Qty' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mSales_exception_output_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';

		performSalesExceptionOutputSummaryDBSearch({ fromDate, toDate, factory, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesExceptionOutputSummaryDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_salesExceptionOutputSummary",
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
				filteredData_salesExceptionOutputSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesExceptionOutputSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_exception_output_summary').length) {
					renderSalesExceptionOutputSummaryView();
				} else {
					renderSalesExceptionOutputSummaryTableData();
					renderSalesExceptionOutputSummaryPagination();
					updateSalesExceptionOutputSummaryTotalCount();
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
		salesExceptionOutputSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesExceptionOutputSummaryCount = filteredData_salesExceptionOutputSummary.length;
		totalSalesExceptionOutputSummaryPages = Math.ceil(totalSalesExceptionOutputSummaryCount / salesExceptionOutputSummaryItemsPerPage);

		const startIndex = (currentSalesExceptionOutputSummaryPage - 1) * salesExceptionOutputSummaryItemsPerPage;
		const endIndex = startIndex + salesExceptionOutputSummaryItemsPerPage;

		globalSalesExceptionOutputSummaryData = filteredData_salesExceptionOutputSummary.slice(startIndex, endIndex);
		window.filteredSalesExceptionOutputSummaryData = globalSalesExceptionOutputSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_salesExceptionOutputSummary.sort((a, b) => {
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

		currentSalesExceptionOutputSummaryPage = 1;
		applyClientPagination();

		renderSalesExceptionOutputSummaryTableData();
		renderSalesExceptionOutputSummaryPagination();
		updateSalesExceptionOutputSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesExceptionOutputSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mSales_exception_output_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="salesExceptionOutputSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="salesExceptionOutputSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesExceptionOutputSummary_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesExceptionOutputSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="salesExceptionOutputSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesExceptionOutputSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesExceptionOutputSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSalesExceptionOutputSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnSalesExceptionOutputSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesExceptionOutputSummaryTotalCount">${totalSalesExceptionOutputSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="salesExceptionOutputSummaryCurrentPageInfo">${currentSalesExceptionOutputSummaryPage}</strong>/<strong id="salesExceptionOutputSummaryTotalPageInfo">${totalSalesExceptionOutputSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesExceptionOutputSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mSales_exception_output_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesExceptionOutputSummaryExcelBtn" onclick="downloadAllSalesExceptionOutputSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mSales_exception_output_summary" id="salesExceptionOutputSummaryTable">
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
							<tbody id="salesExceptionOutputSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesExceptionOutputSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="salesExceptionOutputSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="salesExceptionOutputSummary_itemsPerPage" class="items-per-page-select">
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
		$("#salesExceptionOutputSummary_searchVal_fromDate").val(fromDate);
		$("#salesExceptionOutputSummary_searchVal_toDate").val(toDate);
		$("#salesExceptionOutputSummary_itemsPerPage").val(salesExceptionOutputSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSalesExceptionOutputSummaryTableData();
		// 페이지네이션 렌더링
		renderSalesExceptionOutputSummaryPagination();
		// 이벤트 바인딩
		bindSalesExceptionOutputSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesExceptionOutputSummaryTotalCount();
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
		const factory = $('#salesExceptionOutputSummary_searchVal_factory');
		const storage = $('#salesExceptionOutputSummary_searchVal_storage');
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

	function updateSalesExceptionOutputSummaryTotalCount() {
		$(".salesExceptionOutputSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#salesExceptionOutputSummaryTotalCount').text(Number(totalSalesExceptionOutputSummaryCount).toLocaleString());
		$('#salesExceptionOutputSummaryCurrentPageInfo').text(currentSalesExceptionOutputSummaryPage);
		$('#salesExceptionOutputSummaryTotalPageInfo').text(totalSalesExceptionOutputSummaryPages);
	}

	function renderSalesExceptionOutputSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSalesExceptionOutputSummaryData.length; i++) {
			let rowNumber = (currentSalesExceptionOutputSummaryPage - 1) * salesExceptionOutputSummaryItemsPerPage + i + 1;
			let data = globalSalesExceptionOutputSummaryData[i];
			
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

		$("#salesExceptionOutputSummaryTableBody").html(tableBody);
	}

	function renderSalesExceptionOutputSummaryPagination() {
		let paginationHtml = "";

		if (currentSalesExceptionOutputSummaryPage > 1) {
			paginationHtml += `<button class="salesExceptionOutputSummary-page-btn" data-page="${currentSalesExceptionOutputSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesExceptionOutputSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesExceptionOutputSummaryPage - 5);
		let endPage = Math.min(totalSalesExceptionOutputSummaryPages, currentSalesExceptionOutputSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesExceptionOutputSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesExceptionOutputSummaryPage) {
				paginationHtml += `<button class="salesExceptionOutputSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesExceptionOutputSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesExceptionOutputSummaryPages) {
			if (endPage < totalSalesExceptionOutputSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesExceptionOutputSummary-page-btn" data-page="${totalSalesExceptionOutputSummaryPages}">${totalSalesExceptionOutputSummaryPages}</button>`;
		}

		if (currentSalesExceptionOutputSummaryPage < totalSalesExceptionOutputSummaryPages) {
			paginationHtml += `<button class="salesExceptionOutputSummary-page-btn" data-page="${currentSalesExceptionOutputSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesExceptionOutputSummary-page-btn disabled">&gt;</button>`;
		}

		$("#salesExceptionOutputSummaryPaginationContainer").html(paginationHtml);
	}

	function bindSalesExceptionOutputSummaryEvents() {
		$(".btnSalesExceptionOutputSummarySearch").off('click').on('click', function() {
			performSalesExceptionOutputSummarySearch();
		});

		$(".btnSalesExceptionOutputSummarySearchInit").off('click').on('click', function() {
			resetSalesExceptionOutputSummarySearch();
		});

		$('#salesExceptionOutputSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesExceptionOutputSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.salesExceptionOutputSummary-page-btn').on('click', '.salesExceptionOutputSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesExceptionOutputSummaryPage = page;
					applyClientPagination();
					renderSalesExceptionOutputSummaryTableData();
					renderSalesExceptionOutputSummaryPagination();
					updateSalesExceptionOutputSummaryTotalCount();
				}
			}
		});

		$('#salesExceptionOutputSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mSales_exception_output_summary input[type="text"], #view_mSales_exception_output_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesExceptionOutputSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#salesExceptionOutputSummary_searchVal_fromDate").val(),
			toDate: $("#salesExceptionOutputSummary_searchVal_toDate").val(),
			factory: $("#salesExceptionOutputSummary_searchVal_factory").val(),
			storage: $("#salesExceptionOutputSummary_searchVal_storage").val(),
			car: $("#salesExceptionOutputSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#salesExceptionOutputSummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesExceptionOutputSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performSalesExceptionOutputSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesExceptionOutputSummaryPage = 1;
		performSalesExceptionOutputSummaryDBSearch(searchCriteria);
	}

	function resetSalesExceptionOutputSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#salesExceptionOutputSummary_searchVal_fromDate").val(fromDate);
		$("#salesExceptionOutputSummary_searchVal_toDate").val(toDate);
		$("#salesExceptionOutputSummary_searchVal_car").val('');
		$("#salesExceptionOutputSummary_searchVal_itemcode").val('');
		$("#salesExceptionOutputSummary_searchVal_itemname").val('');

		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';
		
		currentSalesExceptionOutputSummaryPage = 1;
		performSalesExceptionOutputSummaryDBSearch({ fromDate, toDate, factory, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSalesExceptionOutputSummaryItemsPerPage = function(newItemsPerPage) {
		salesExceptionOutputSummaryItemsPerPage = newItemsPerPage;
		currentSalesExceptionOutputSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesExceptionOutputSummaryTableData();
		renderSalesExceptionOutputSummaryPagination();
		updateSalesExceptionOutputSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSalesExceptionOutputSummaryData = function() {
		return {
			total: filteredData_salesExceptionOutputSummary.length,
			currentPage: currentSalesExceptionOutputSummaryPage,
			itemsPerPage: salesExceptionOutputSummaryItemsPerPage,
			data: filteredData_salesExceptionOutputSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesExceptionOutputSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_salesExceptionOutputSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.salesExceptionOutputSummaryColumns, {
		fileName: 'salesExceptionOutputSummary_All',
		sheetName: 'salesExceptionOutputSummary'
	});

	hideLoading();
};
