/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_exceptionInputSummary = [];
let globalExceptionInputSummaryData = [];
let currentExceptionInputSummaryPage = 1;
let exceptionInputSummaryItemsPerPage = 100;
let totalExceptionInputSummaryCount = 0;
let totalExceptionInputSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredExceptionInputSummaryData = [];
	window.exceptionInputSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },       
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'OITEMCODE', header: 'Spec' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Qty' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_exception_input_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		performExceptionInputSummaryDBSearch({ fromDate, toDate,  storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performExceptionInputSummaryDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_exceptionInputSummary",
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
				filteredData_exceptionInputSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentExceptionInputSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_exception_input_summary').length) {
					renderExceptionInputSummaryView();
				} else {
					renderExceptionInputSummaryTableData();
					renderExceptionInputSummaryPagination();
					updateExceptionInputSummaryTotalCount();
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
		exceptionInputSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalExceptionInputSummaryCount = filteredData_exceptionInputSummary.length;
		totalExceptionInputSummaryPages = Math.ceil(totalExceptionInputSummaryCount / exceptionInputSummaryItemsPerPage);

		const startIndex = (currentExceptionInputSummaryPage - 1) * exceptionInputSummaryItemsPerPage;
		const endIndex = startIndex + exceptionInputSummaryItemsPerPage;

		globalExceptionInputSummaryData = filteredData_exceptionInputSummary.slice(startIndex, endIndex);
		window.filteredExceptionInputSummaryData = globalExceptionInputSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_exceptionInputSummary.sort((a, b) => {
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

		currentExceptionInputSummaryPage = 1;
		applyClientPagination();

		renderExceptionInputSummaryTableData();
		renderExceptionInputSummaryPagination();
		updateExceptionInputSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderExceptionInputSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_exception_input_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="exceptionInputSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="exceptionInputSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="exceptionInputSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="exceptionInputSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="exceptionInputSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="exceptionInputSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="exceptionInputSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnExceptionInputSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnExceptionInputSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="exceptionInputSummaryTotalCount">${totalExceptionInputSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="exceptionInputSummaryCurrentPageInfo">${currentExceptionInputSummaryPage}</strong>/<strong id="exceptionInputSummaryTotalPageInfo">${totalExceptionInputSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="exceptionInputSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_exception_input_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="exceptionInputSummaryExcelBtn" onclick="downloadAllExceptionInputSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_exception_input_summary" id="exceptionInputSummaryTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='cnameVal' data-sort="OITEMCODE">${i18n.t('search.customercode')}<!-- ITEMCODE --></th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="exceptionInputSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="exceptionInputSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="exceptionInputSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="exceptionInputSummary_itemsPerPage" class="items-per-page-select">
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
		$("#exceptionInputSummary_searchVal_fromDate").val(fromDate);
		$("#exceptionInputSummary_searchVal_toDate").val(toDate);
		$("#exceptionInputSummary_itemsPerPage").val(exceptionInputSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderExceptionInputSummaryTableData();
		// 페이지네이션 렌더링
		renderExceptionInputSummaryPagination();
		// 이벤트 바인딩
		bindExceptionInputSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateExceptionInputSummaryTotalCount();
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
		const storage = $('#exceptionInputSummary_searchVal_storage');
		const savedStorage = getCookie('selectedStorage');

		storage.empty();

		let storageList = ['INBOUND', 'PRODUCT', 'OUTSIDE', 'all'];

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

	function updateExceptionInputSummaryTotalCount() {
		$(".exceptionInputSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#exceptionInputSummaryTotalCount').text(Number(totalExceptionInputSummaryCount).toLocaleString());
		$('#exceptionInputSummaryCurrentPageInfo').text(currentExceptionInputSummaryPage);
		$('#exceptionInputSummaryTotalPageInfo').text(totalExceptionInputSummaryPages);
	}

	function renderExceptionInputSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalExceptionInputSummaryData.length; i++) {
			let rowNumber = (currentExceptionInputSummaryPage - 1) * exceptionInputSummaryItemsPerPage + i + 1;
			let data = globalExceptionInputSummaryData[i];
			
			tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'cnameVal'>${data.OITEMCODE || data.oitemcode || ''}</td>
				    <td class = 'itemnameLongVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
				</tr>
			`;
		}

		$("#exceptionInputSummaryTableBody").html(tableBody);
	}

	function renderExceptionInputSummaryPagination() {
		let paginationHtml = "";

		if (currentExceptionInputSummaryPage > 1) {
			paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="${currentExceptionInputSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="exceptionInputSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentExceptionInputSummaryPage - 5);
		let endPage = Math.min(totalExceptionInputSummaryPages, currentExceptionInputSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentExceptionInputSummaryPage) {
				paginationHtml += `<button class="exceptionInputSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalExceptionInputSummaryPages) {
			if (endPage < totalExceptionInputSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="${totalExceptionInputSummaryPages}">${totalExceptionInputSummaryPages}</button>`;
		}

		if (currentExceptionInputSummaryPage < totalExceptionInputSummaryPages) {
			paginationHtml += `<button class="exceptionInputSummary-page-btn" data-page="${currentExceptionInputSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="exceptionInputSummary-page-btn disabled">&gt;</button>`;
		}

		$("#exceptionInputSummaryPaginationContainer").html(paginationHtml);
	}

	function bindExceptionInputSummaryEvents() {
		$(".btnExceptionInputSummarySearch").off('click').on('click', function() {
			performExceptionInputSummarySearch();
		});

		$(".btnExceptionInputSummarySearchInit").off('click').on('click', function() {
			resetExceptionInputSummarySearch();
		});

		$('#exceptionInputSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeExceptionInputSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.exceptionInputSummary-page-btn').on('click', '.exceptionInputSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentExceptionInputSummaryPage = page;
					applyClientPagination();
					renderExceptionInputSummaryTableData();
					renderExceptionInputSummaryPagination();
					updateExceptionInputSummaryTotalCount();
				}
			}
		});

		$('#exceptionInputSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_exception_input_summary input[type="text"], #view_mPurchase_exception_input_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performExceptionInputSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#exceptionInputSummary_searchVal_fromDate").val(),
			toDate: $("#exceptionInputSummary_searchVal_toDate").val(),
			storage: $("#exceptionInputSummary_searchVal_storage").val(),
			car: $("#exceptionInputSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#exceptionInputSummary_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#exceptionInputSummary_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#exceptionInputSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performExceptionInputSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentExceptionInputSummaryPage = 1;
		performExceptionInputSummaryDBSearch(searchCriteria);
	}

	function resetExceptionInputSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#exceptionInputSummary_searchVal_fromDate").val(fromDate);
		$("#exceptionInputSummary_searchVal_toDate").val(toDate);
		$("#exceptionInputSummary_searchVal_car").val('');
		$("#exceptionInputSummary_searchVal_itemcode").val('');
		$("#exceptionInputSummary_searchVal_oitemcode").val('');
		$("#exceptionInputSummary_searchVal_itemname").val('');

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';
		
		currentExceptionInputSummaryPage = 1;
		performExceptionInputSummaryDBSearch({ fromDate, toDate, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeExceptionInputSummaryItemsPerPage = function(newItemsPerPage) {
		exceptionInputSummaryItemsPerPage = newItemsPerPage;
		currentExceptionInputSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderExceptionInputSummaryTableData();
		renderExceptionInputSummaryPagination();
		updateExceptionInputSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportExceptionInputSummaryData = function() {
		return {
			total: filteredData_exceptionInputSummary.length,
			currentPage: currentExceptionInputSummaryPage,
			itemsPerPage: exceptionInputSummaryItemsPerPage,
			data: filteredData_exceptionInputSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllExceptionInputSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_exceptionInputSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.exceptionInputSummaryColumns, {
		fileName: 'exceptionInputSummary_All',
		sheetName: 'exceptionInputSummary'
	});

	hideLoading();
};
