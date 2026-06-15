/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_salesStockCountLastdaySummary = [];
let globalSalesStockCountLastdaySummaryData = [];
let currentSalesStockCountLastdaySummaryPage = 1;
let salesStockCountLastdaySummaryItemsPerPage = 100;
let totalSalesStockCountLastdaySummaryCount = 0;
let totalSalesStockCountLastdaySummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredSalesStockCountLastdaySummaryData = [];
	window.salesStockCountLastdaySummaryColumns = [
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'customer code' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mSales_stock_count_lastday_summary = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		const sdate = toDate;

		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT'; // 기본값

		performSalesStockCountLastdaySummaryDBSearch({ sdate, factory, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesStockCountLastdaySummaryDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_salesStockCountLastdaySummary",
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
				filteredData_salesStockCountLastdaySummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesStockCountLastdaySummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_stock_count_lastday_summary').length) {
					renderSalesStockCountLastdaySummaryView();
				} else {
					renderSalesStockCountLastdaySummaryTableData();
					renderSalesStockCountLastdaySummaryPagination();
					updateSalesStockCountLastdaySummaryTotalCount();
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
		salesStockCountLastdaySummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesStockCountLastdaySummaryCount = filteredData_salesStockCountLastdaySummary.length;
		totalSalesStockCountLastdaySummaryPages = Math.ceil(totalSalesStockCountLastdaySummaryCount / salesStockCountLastdaySummaryItemsPerPage);

		const startIndex = (currentSalesStockCountLastdaySummaryPage - 1) * salesStockCountLastdaySummaryItemsPerPage;
		const endIndex = startIndex + salesStockCountLastdaySummaryItemsPerPage;

		globalSalesStockCountLastdaySummaryData = filteredData_salesStockCountLastdaySummary.slice(startIndex, endIndex);
		window.filteredSalesStockCountLastdaySummaryData = globalSalesStockCountLastdaySummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_salesStockCountLastdaySummary.sort((a, b) => {
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

		currentSalesStockCountLastdaySummaryPage = 1;
		applyClientPagination();

		renderSalesStockCountLastdaySummaryTableData();
		renderSalesStockCountLastdaySummaryPagination();
		updateSalesStockCountLastdaySummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesStockCountLastdaySummaryView() {
		let loginid = $(".loginId").text().trim().toLowerCase();
		let content_output = `
			<div class="divBlockControl" id="view_mSales_stock_count_lastday_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="salesStockCountLastdaySummary_searchVal_sdate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesStockCountLastdaySummary_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesStockCountLastdaySummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesStockCountLastdaySummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesStockCountLastdaySummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSalesStockCountLastdaySummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnSalesStockCountLastdaySummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesStockCountLastdaySummaryTotalCount">${totalSalesStockCountLastdaySummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="salesStockCountLastdaySummaryCurrentPageInfo">${currentSalesStockCountLastdaySummaryPage}</strong>/<strong id="salesStockCountLastdaySummaryTotalPageInfo">${totalSalesStockCountLastdaySummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesStockCountLastdaySummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mSales_stock_count_lastday_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesStockCountLastdaySummaryExcelBtn" onclick="downloadAllSalesStockCountLastdaySummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mSales_stock_count_lastday_summary" id="salesStockCountLastdaySummaryTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='factoryVal' data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='itemcodeVal' data-sort="CUSTCODE">${i18n.t('search.customercode')}<!-- CUSTCODE --></th>
									<th class='itemnameVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="salesStockCountLastdaySummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesStockCountLastdaySummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="salesStockCountLastdaySummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="salesStockCountLastdaySummary_itemsPerPage" class="items-per-page-select">
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
		$("#salesStockCountLastdaySummary_searchVal_sdate").val(toDate);
		$("#salesStockCountLastdaySummary_itemsPerPage").val(salesStockCountLastdaySummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSalesStockCountLastdaySummaryTableData();
		// 페이지네이션 렌더링
		renderSalesStockCountLastdaySummaryPagination();
		// 이벤트 바인딩
		bindSalesStockCountLastdaySummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesStockCountLastdaySummaryTotalCount();
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
		const factory = $('#salesStockCountLastdaySummary_searchVal_factory');
		const storage = $('#salesStockCountLastdaySummary_searchVal_storage');
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

	function updateSalesStockCountLastdaySummaryTotalCount() {
		$(".salesStockCountLastdaySummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#salesStockCountLastdaySummaryTotalCount').text(Number(totalSalesStockCountLastdaySummaryCount).toLocaleString());
		$('#salesStockCountLastdaySummaryCurrentPageInfo').text(currentSalesStockCountLastdaySummaryPage);
		$('#salesStockCountLastdaySummaryTotalPageInfo').text(totalSalesStockCountLastdaySummaryPages);
	}

	function renderSalesStockCountLastdaySummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSalesStockCountLastdaySummaryData.length; i++) {
			let rowNumber = (currentSalesStockCountLastdaySummaryPage - 1) * salesStockCountLastdaySummaryItemsPerPage + i + 1;
			let data = globalSalesStockCountLastdaySummaryData[i];
			
			tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
					<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
					<td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "itemcodeVal">${data.SPEC || data.spec || ''}</td>
					<td class = "itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
				</tr>
			`;
		}

		$("#salesStockCountLastdaySummaryTableBody").html(tableBody);
	}

	function renderSalesStockCountLastdaySummaryPagination() {
		let paginationHtml = "";

		if (currentSalesStockCountLastdaySummaryPage > 1) {
			paginationHtml += `<button class="salesStockCountLastdaySummary-page-btn" data-page="${currentSalesStockCountLastdaySummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesStockCountLastdaySummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesStockCountLastdaySummaryPage - 5);
		let endPage = Math.min(totalSalesStockCountLastdaySummaryPages, currentSalesStockCountLastdaySummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesStockCountLastdaySummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesStockCountLastdaySummaryPage) {
				paginationHtml += `<button class="salesStockCountLastdaySummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesStockCountLastdaySummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesStockCountLastdaySummaryPages) {
			if (endPage < totalSalesStockCountLastdaySummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesStockCountLastdaySummary-page-btn" data-page="${totalSalesStockCountLastdaySummaryPages}">${totalSalesStockCountLastdaySummaryPages}</button>`;
		}

		if (currentSalesStockCountLastdaySummaryPage < totalSalesStockCountLastdaySummaryPages) {
			paginationHtml += `<button class="salesStockCountLastdaySummary-page-btn" data-page="${currentSalesStockCountLastdaySummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesStockCountLastdaySummary-page-btn disabled">&gt;</button>`;
		}

		$("#salesStockCountLastdaySummaryPaginationContainer").html(paginationHtml);
	}

	function bindSalesStockCountLastdaySummaryEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.salesStockCountLastdaySummary_chkAll').on('change', '.salesStockCountLastdaySummary_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.salesStockCountLastdaySummary_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.salesStockCountLastdaySummary_chk').on('change', '.salesStockCountLastdaySummary_chk', function() {
			let totalCheckboxes = $('.salesStockCountLastdaySummary_chk').length;
			let checkedCheckboxes = $('.salesStockCountLastdaySummary_chk:checked').length;
			$('.salesStockCountLastdaySummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnSalesStockCountLastdaySummarySearch").off('click').on('click', function() {
			performSalesStockCountLastdaySummarySearch();
		});

		$(".btnSalesStockCountLastdaySummarySearchInit").off('click').on('click', function() {
			resetSalesStockCountLastdaySummarySearch();
		});

		$('#salesStockCountLastdaySummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesStockCountLastdaySummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.salesStockCountLastdaySummary-page-btn').on('click', '.salesStockCountLastdaySummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesStockCountLastdaySummaryPage = page;
					applyClientPagination();
					renderSalesStockCountLastdaySummaryTableData();
					renderSalesStockCountLastdaySummaryPagination();
					updateSalesStockCountLastdaySummaryTotalCount();
				}
			}
		});

		$('#salesStockCountLastdaySummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mSales_stock_count_lastday_summary input[type="text"], #view_mSales_stock_count_lastday_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesStockCountLastdaySummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			factory: $("#salesStockCountLastdaySummary_searchVal_factory").val(),
			storage: $("#salesStockCountLastdaySummary_searchVal_storage").val(),
			sdate: $("#salesStockCountLastdaySummary_searchVal_sdate").val(),
			itemcode: $("#salesStockCountLastdaySummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesStockCountLastdaySummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performSalesStockCountLastdaySummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesStockCountLastdaySummaryPage = 1;
		performSalesStockCountLastdaySummaryDBSearch(searchCriteria);
	}

	function resetSalesStockCountLastdaySummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const sdate = toDate;

		$("#salesStockCountLastdaySummary_searchVal_sdate").val(toDate);
		$("#salesStockCountLastdaySummary_searchVal_itemcode").val('');
		$("#salesStockCountLastdaySummary_searchVal_itemname").val('');

		renderFactoryStorage();
		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';
		
		currentSalesStockCountLastdaySummaryPage = 1;
		performSalesStockCountLastdaySummaryDBSearch({ sdate, factory, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSalesStockCountLastdaySummaryItemsPerPage = function(newItemsPerPage) {
		salesStockCountLastdaySummaryItemsPerPage = newItemsPerPage;
		currentSalesStockCountLastdaySummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesStockCountLastdaySummaryTableData();
		renderSalesStockCountLastdaySummaryPagination();
		updateSalesStockCountLastdaySummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSalesStockCountLastdaySummaryData = function() {
		return {
			total: filteredData_salesStockCountLastdaySummary.length,
			currentPage: currentSalesStockCountLastdaySummaryPage,
			itemsPerPage: salesStockCountLastdaySummaryItemsPerPage,
			data: filteredData_salesStockCountLastdaySummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesStockCountLastdaySummaryData = function() {
	showLoading("export");

	const processedData = filteredData_salesStockCountLastdaySummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.salesStockCountLastdaySummaryColumns, {
		fileName: 'salesStockCountLastdaySummary_All',
		sheetName: 'salesStockCountLastdaySummary'
	});

	hideLoading();
};
