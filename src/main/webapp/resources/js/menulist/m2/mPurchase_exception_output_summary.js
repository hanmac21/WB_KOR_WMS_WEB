/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_exceptionOutputSummary = [];
let globalExceptionOutputSummaryData = [];
let currentExceptionOutputSummaryPage = 1;
let exceptionOutputSummaryItemsPerPage = 100;
let totalExceptionOutputSummaryCount = 0;
let totalExceptionOutputSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredExceptionOutputSummaryData = [];
	window.exceptionOutputSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'OITEMCODE', header: 'Spec' },
		{ key: 'ITEMNAME', header: 'temname' },
		{ key: 'QTY', header: 'Qty' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_exception_output_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		performExceptionOutputSummaryDBSearch({ fromDate, toDate, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performExceptionOutputSummaryDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_exceptionOutputSummary",
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
				filteredData_exceptionOutputSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentExceptionOutputSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_exception_output_summary').length) {
					renderExceptionOutputSummaryView();
				} else {
					renderExceptionOutputSummaryTableData();
					renderExceptionOutputSummaryPagination();
					updateExceptionOutputSummaryTotalCount();
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
		exceptionOutputSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalExceptionOutputSummaryCount = filteredData_exceptionOutputSummary.length;
		totalExceptionOutputSummaryPages = Math.ceil(totalExceptionOutputSummaryCount / exceptionOutputSummaryItemsPerPage);

		const startIndex = (currentExceptionOutputSummaryPage - 1) * exceptionOutputSummaryItemsPerPage;
		const endIndex = startIndex + exceptionOutputSummaryItemsPerPage;

		globalExceptionOutputSummaryData = filteredData_exceptionOutputSummary.slice(startIndex, endIndex);
		window.filteredExceptionOutputSummaryData = globalExceptionOutputSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_exceptionOutputSummary.sort((a, b) => {
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

		currentExceptionOutputSummaryPage = 1;
		applyClientPagination();

		renderExceptionOutputSummaryTableData();
		renderExceptionOutputSummaryPagination();
		updateExceptionOutputSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderExceptionOutputSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_exception_output_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="exceptionOutputSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="exceptionOutputSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="exceptionOutputSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="exceptionOutputSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="exceptionOutputSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="exceptionOutputSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="exceptionOutputSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnExceptionOutputSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnExceptionOutputSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="exceptionOutputSummaryTotalCount">${totalExceptionOutputSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="exceptionOutputSummaryCurrentPageInfo">${currentExceptionOutputSummaryPage}</strong>/<strong id="exceptionOutputSummaryTotalPageInfo">${totalExceptionOutputSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="exceptionOutputSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_exception_output_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="exceptionOutputSummaryExcelBtn" onclick="downloadAllExceptionOutputSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_exception_output_summary" id="exceptionOutputSummaryTable">
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
							<tbody id="exceptionOutputSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="exceptionOutputSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="exceptionOutputSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="exceptionOutputSummary_itemsPerPage" class="items-per-page-select">
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
		$("#exceptionOutputSummary_searchVal_fromDate").val(fromDate);
		$("#exceptionOutputSummary_searchVal_toDate").val(toDate);
		$("#exceptionOutputSummary_itemsPerPage").val(exceptionOutputSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderExceptionOutputSummaryTableData();
		// 페이지네이션 렌더링
		renderExceptionOutputSummaryPagination();
		// 이벤트 바인딩
		bindExceptionOutputSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateExceptionOutputSummaryTotalCount();
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
		const storage = $('#exceptionOutputSummary_searchVal_storage');
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

	function updateExceptionOutputSummaryTotalCount() {
		$(".exceptionOutputSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#exceptionOutputSummaryTotalCount').text(Number(totalExceptionOutputSummaryCount).toLocaleString());
		$('#exceptionOutputSummaryCurrentPageInfo').text(currentExceptionOutputSummaryPage);
		$('#exceptionOutputSummaryTotalPageInfo').text(totalExceptionOutputSummaryPages);
	}

	function renderExceptionOutputSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalExceptionOutputSummaryData.length; i++) {
			let rowNumber = (currentExceptionOutputSummaryPage - 1) * exceptionOutputSummaryItemsPerPage + i + 1;
			let data = globalExceptionOutputSummaryData[i];
			
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

		$("#exceptionOutputSummaryTableBody").html(tableBody);
	}

	function renderExceptionOutputSummaryPagination() {
		let paginationHtml = "";

		if (currentExceptionOutputSummaryPage > 1) {
			paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="${currentExceptionOutputSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="exceptionOutputSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentExceptionOutputSummaryPage - 5);
		let endPage = Math.min(totalExceptionOutputSummaryPages, currentExceptionOutputSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentExceptionOutputSummaryPage) {
				paginationHtml += `<button class="exceptionOutputSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalExceptionOutputSummaryPages) {
			if (endPage < totalExceptionOutputSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="${totalExceptionOutputSummaryPages}">${totalExceptionOutputSummaryPages}</button>`;
		}

		if (currentExceptionOutputSummaryPage < totalExceptionOutputSummaryPages) {
			paginationHtml += `<button class="exceptionOutputSummary-page-btn" data-page="${currentExceptionOutputSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="exceptionOutputSummary-page-btn disabled">&gt;</button>`;
		}

		$("#exceptionOutputSummaryPaginationContainer").html(paginationHtml);
	}

	function bindExceptionOutputSummaryEvents() {
		$(".btnExceptionOutputSummarySearch").off('click').on('click', function() {
			performExceptionOutputSummarySearch();
		});

		$(".btnExceptionOutputSummarySearchInit").off('click').on('click', function() {
			resetExceptionOutputSummarySearch();
		});

		$('#exceptionOutputSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeExceptionOutputSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.exceptionOutputSummary-page-btn').on('click', '.exceptionOutputSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentExceptionOutputSummaryPage = page;
					applyClientPagination();
					renderExceptionOutputSummaryTableData();
					renderExceptionOutputSummaryPagination();
					updateExceptionOutputSummaryTotalCount();
				}
			}
		});

		$('#exceptionOutputSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_exception_output_summary input[type="text"], #view_mPurchase_exception_output_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performExceptionOutputSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#exceptionOutputSummary_searchVal_fromDate").val(),
			toDate: $("#exceptionOutputSummary_searchVal_toDate").val(),
			storage: $("#exceptionOutputSummary_searchVal_storage").val(),
			car: $("#exceptionOutputSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#exceptionOutputSummary_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#exceptionOutputSummary_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#exceptionOutputSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performExceptionOutputSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentExceptionOutputSummaryPage = 1;
		performExceptionOutputSummaryDBSearch(searchCriteria);
	}

	function resetExceptionOutputSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#exceptionOutputSummary_searchVal_fromDate").val(fromDate);
		$("#exceptionOutputSummary_searchVal_toDate").val(toDate);
		$("#exceptionOutputSummary_searchVal_car").val('');
		$("#exceptionOutputSummary_searchVal_itemcode").val('');
		$("#exceptionOutputSummary_searchVal_oitemcode").val('');
		$("#exceptionOutputSummary_searchVal_itemname").val('');

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';
		
		currentExceptionOutputSummaryPage = 1;
		performExceptionOutputSummaryDBSearch({ fromDate, toDate, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeExceptionOutputSummaryItemsPerPage = function(newItemsPerPage) {
		exceptionOutputSummaryItemsPerPage = newItemsPerPage;
		currentExceptionOutputSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderExceptionOutputSummaryTableData();
		renderExceptionOutputSummaryPagination();
		updateExceptionOutputSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportExceptionOutputSummaryData = function() {
		return {
			total: filteredData_exceptionOutputSummary.length,
			currentPage: currentExceptionOutputSummaryPage,
			itemsPerPage: exceptionOutputSummaryItemsPerPage,
			data: filteredData_exceptionOutputSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllExceptionOutputSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_exceptionOutputSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.exceptionOutputSummaryColumns, {
		fileName: 'exceptionOutputSummary_All',
		sheetName: 'exceptionOutputSummary'
	});

	hideLoading();
};
