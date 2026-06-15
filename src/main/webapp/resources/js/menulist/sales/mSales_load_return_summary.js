/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_salesLoadReturnSummary = [];
let globalSalesLoadReturnSummaryData = [];
let currentSalesLoadReturnSummaryPage = 1;
let salesLoadReturnSummaryItemsPerPage = 100;
let totalSalesLoadReturnSummaryCount = 0;
let totalSalesLoadReturnSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredSalesLoadReturnSummaryData = [];
	window.salesLoadReturnSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'SPEC', header: 'Supplier Code' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'TYPE', header: 'type' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mSales_load_return_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';

		performSalesLoadReturnSummaryDBSearch({ fromDate, toDate, factory, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesLoadReturnSummaryDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_salesLoadReturnSummary",
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
				filteredData_salesLoadReturnSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesLoadReturnSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_load_return_summary').length) {
					renderSalesLoadReturnSummaryView();
				} else {
					renderSalesLoadReturnSummaryTableData();
					renderSalesLoadReturnSummaryPagination();
					updateSalesLoadReturnSummaryTotalCount();
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
		salesLoadReturnSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesLoadReturnSummaryCount = filteredData_salesLoadReturnSummary.length;
		totalSalesLoadReturnSummaryPages = Math.ceil(totalSalesLoadReturnSummaryCount / salesLoadReturnSummaryItemsPerPage);

		const startIndex = (currentSalesLoadReturnSummaryPage - 1) * salesLoadReturnSummaryItemsPerPage;
		const endIndex = startIndex + salesLoadReturnSummaryItemsPerPage;

		globalSalesLoadReturnSummaryData = filteredData_salesLoadReturnSummary.slice(startIndex, endIndex);
		window.filteredSalesLoadReturnSummaryData = globalSalesLoadReturnSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_salesLoadReturnSummary.sort((a, b) => {
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

		currentSalesLoadReturnSummaryPage = 1;
		applyClientPagination();

		renderSalesLoadReturnSummaryTableData();
		renderSalesLoadReturnSummaryPagination();
		updateSalesLoadReturnSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesLoadReturnSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mSales_load_return_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="salesLoadReturnSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="salesLoadReturnSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesLoadReturnSummary_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesLoadReturnSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.custname')}<!-- custname --></div>
								<input type="text" id="salesLoadReturnSummary_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="salesLoadReturnSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesLoadReturnSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesLoadReturnSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSalesLoadReturnSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnSalesLoadReturnSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesLoadReturnSummaryTotalCount">${totalSalesLoadReturnSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="salesLoadReturnSummaryCurrentPageInfo">${currentSalesLoadReturnSummaryPage}</strong>/<strong id="salesLoadReturnSummaryTotalPageInfo">${totalSalesLoadReturnSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesLoadReturnSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mSales_load_return_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesLoadReturnSummaryExcelBtn" onclick="downloadAllSalesLoadReturnSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mSales_load_return_summary" id="salesLoadReturnSummaryTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='factoryVal' data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class='itemcodeVal' data-sort="CUSTNAME">${i18n.t('search.custname')}<!-- custname --></th>
									<th class="cnameVal" data-sort="SPEC">${i18n.t('search.customercode')}<!-- CCODE --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='itemnameVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class="typeVal" data-sort="TYPE">${i18n.t('search.type')}<!-- TYPE --></th>
								</tr>
							</thead>
							<tbody id="salesLoadReturnSummaryDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesLoadReturnSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="salesLoadReturnSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="salesLoadReturnSummary_itemsPerPage" class="items-per-page-select">
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
		$("#salesLoadReturnSummary_searchVal_fromDate").val(fromDate);
		$("#salesLoadReturnSummary_searchVal_toDate").val(toDate);
		$("#salesLoadReturnSummary_itemsPerPage").val(salesLoadReturnSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSalesLoadReturnSummaryTableData();
		// 페이지네이션 렌더링
		renderSalesLoadReturnSummaryPagination();
		// 이벤트 바인딩
		bindSalesLoadReturnSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesLoadReturnSummaryTotalCount();
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
		const factory = $('#salesLoadReturnSummary_searchVal_factory');
		const storage = $('#salesLoadReturnSummary_searchVal_storage');
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

	function updateSalesLoadReturnSummaryTotalCount() {
		$(".salesLoadReturnSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#salesLoadReturnSummaryTotalCount').text(Number(totalSalesLoadReturnSummaryCount).toLocaleString());
		$('#salesLoadReturnSummaryCurrentPageInfo').text(currentSalesLoadReturnSummaryPage);
		$('#salesLoadReturnSummaryTotalPageInfo').text(totalSalesLoadReturnSummaryPages);
	}

	function renderSalesLoadReturnSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSalesLoadReturnSummaryData.length; i++) {
			let rowNumber = (currentSalesLoadReturnSummaryPage - 1) * salesLoadReturnSummaryItemsPerPage + i + 1;
			let data = globalSalesLoadReturnSummaryData[i];
			tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'factoryVal'>${data.FACTORY || data.factory || ''}</td>
				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
					<td class = 'itemcodeVal'>${data.CUSTNAME || data.custname || ''}</td>
					<td class = "cnameVal">${data.SPEC || data.spec || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'itemnameVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "typeVal">${data.TYPE || data.type || ''}</td>
				</tr>
			`;
		}

		$("#salesLoadReturnSummaryDetailTableBody").html(tableBody);
		$('.salesLoadReturnSummary_chkAll').prop('checked', false);
	}

	function renderSalesLoadReturnSummaryPagination() {
		let paginationHtml = "";

		if (currentSalesLoadReturnSummaryPage > 1) {
			paginationHtml += `<button class="salesLoadReturnSummary-page-btn" data-page="${currentSalesLoadReturnSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesLoadReturnSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesLoadReturnSummaryPage - 5);
		let endPage = Math.min(totalSalesLoadReturnSummaryPages, currentSalesLoadReturnSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesLoadReturnSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesLoadReturnSummaryPage) {
				paginationHtml += `<button class="salesLoadReturnSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesLoadReturnSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesLoadReturnSummaryPages) {
			if (endPage < totalSalesLoadReturnSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesLoadReturnSummary-page-btn" data-page="${totalSalesLoadReturnSummaryPages}">${totalSalesLoadReturnSummaryPages}</button>`;
		}

		if (currentSalesLoadReturnSummaryPage < totalSalesLoadReturnSummaryPages) {
			paginationHtml += `<button class="salesLoadReturnSummary-page-btn" data-page="${currentSalesLoadReturnSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesLoadReturnSummary-page-btn disabled">&gt;</button>`;
		}

		$("#salesLoadReturnSummaryPaginationContainer").html(paginationHtml);
	}

	function bindSalesLoadReturnSummaryEvents() {
		$(".btnSalesLoadReturnSummarySearch").off('click').on('click', function() {
			performSalesLoadReturnSummarySearch();
		});

		$(".btnSalesLoadReturnSummarySearchInit").off('click').on('click', function() {
			resetSalesLoadReturnSummarySearch();
		});

		$('#salesLoadReturnSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesLoadReturnSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.salesLoadReturnSummary-page-btn').on('click', '.salesLoadReturnSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesLoadReturnSummaryPage = page;
					applyClientPagination();
					renderSalesLoadReturnSummaryTableData();
					renderSalesLoadReturnSummaryPagination();
					updateSalesLoadReturnSummaryTotalCount();
				}
			}
		});

		$('#salesLoadReturnSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mSales_load_return_summary input[type="text"], #view_mSales_load_return_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesLoadReturnSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#salesLoadReturnSummary_searchVal_fromDate").val(),
			toDate: $("#salesLoadReturnSummary_searchVal_toDate").val(),
			factory: $("#salesLoadReturnSummary_searchVal_factory").val(),
			storage: $("#salesLoadReturnSummary_searchVal_storage").val(),
			custname: $("#salesLoadReturnSummary_searchVal_custname").val().trim().toUpperCase(),
			car: $("#salesLoadReturnSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#salesLoadReturnSummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesLoadReturnSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performSalesLoadReturnSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesLoadReturnSummaryPage = 1;
		performSalesLoadReturnSummaryDBSearch(searchCriteria);
	}

	function resetSalesLoadReturnSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#salesLoadReturnSummary_searchVal_fromDate").val(fromDate);
		$("#salesLoadReturnSummary_searchVal_toDate").val(toDate);
		$("#salesLoadReturnSummary_searchVal_custname").val('');
		$("#salesLoadReturnSummary_searchVal_car").val('');
		$("#salesLoadReturnSummary_searchVal_itemcode").val('');
		$("#salesLoadReturnSummary_searchVal_itemname").val('');

		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';

		currentSalesLoadReturnSummaryPage = 1;
		performSalesLoadReturnSummaryDBSearch({ fromDate, toDate, factory, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSalesLoadReturnSummaryItemsPerPage = function(newItemsPerPage) {
		salesLoadReturnSummaryItemsPerPage = newItemsPerPage;
		currentSalesLoadReturnSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesLoadReturnSummaryTableData();
		renderSalesLoadReturnSummaryPagination();
		updateSalesLoadReturnSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSalesLoadReturnSummaryData = function() {
		return {
			total: filteredData_salesLoadReturnSummary.length,
			currentPage: currentSalesLoadReturnSummaryPage,
			itemsPerPage: salesLoadReturnSummaryItemsPerPage,
			data: filteredData_salesLoadReturnSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesLoadReturnSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_salesLoadReturnSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.salesLoadReturnSummaryColumns, {
		fileName: 'salesLoadReturnSummary_All',
		sheetName: 'salesLoadReturnSummary'
	});

	hideLoading();
};
