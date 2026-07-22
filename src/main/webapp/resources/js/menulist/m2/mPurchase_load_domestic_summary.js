/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_loadDomesticSummary = [];
let globalLoadDomesticSummaryData = [];
let currentLoadDomesticSummaryPage = 1;
let loadDomesticSummaryItemsPerPage = 100;
let totalLoadDomesticSummaryCount = 0;
let totalLoadDomesticSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredLoadDomesticSummaryData = [];
	window.loadDomesticSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'SOURCE2', header: 'Type' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'SPEC', header: 'Supplier Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Qty' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_load_domestic_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const source2 = '내수품';

		performLoadDomesticSummaryDBSearch({ fromDate, toDate, source2 });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performLoadDomesticSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_loadSummary",
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
				filteredData_loadDomesticSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentLoadDomesticSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_load_domestic_summary').length) {
					renderLoadDomesticSummaryView();
				} else {
					renderLoadDomesticSummaryTableData();
					renderLoadDomesticSummaryPagination();
					updateLoadDomesticSummaryTotalCount();
				}

				// 총 수량 업데이트
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

	// 클라이언트에서 페이징 처리
	function applyClientPagination() {
		loadDomesticSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalLoadDomesticSummaryCount = filteredData_loadDomesticSummary.length;
		totalLoadDomesticSummaryPages = Math.ceil(totalLoadDomesticSummaryCount / loadDomesticSummaryItemsPerPage);

		const startIndex = (currentLoadDomesticSummaryPage - 1) * loadDomesticSummaryItemsPerPage;
		const endIndex = startIndex + loadDomesticSummaryItemsPerPage;

		globalLoadDomesticSummaryData = filteredData_loadDomesticSummary.slice(startIndex, endIndex);
		window.filteredLoadDomesticSummaryData = globalLoadDomesticSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_loadDomesticSummary.sort((a, b) => {
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

		currentLoadDomesticSummaryPage = 1;
		applyClientPagination();

		renderLoadDomesticSummaryTableData();
		renderLoadDomesticSummaryPagination();
		updateLoadDomesticSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderLoadDomesticSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_load_domestic_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="loadDomesticSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="loadDomesticSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.custname')}<!-- custname --></div>
								<input type="text" id="loadDomesticSummary_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="loadDomesticSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="loadDomesticSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}<!-- OITEMCODE --></div>
								<input type="text" id="loadDomesticSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="loadDomesticSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnLoadDomesticSummarySearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnLoadDomesticSummarySearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="loadDomesticSummaryTotalCount">${totalLoadDomesticSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="loadDomesticSummaryCurrentPageInfo">${currentLoadDomesticSummaryPage}</strong>/<strong id="loadDomesticSummaryTotalPageInfo">${totalLoadDomesticSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="loadDomesticSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_load_domestic_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="loadDomesticSummaryExcelBtn" onclick="downloadAllLoadDomesticSummaryData()">Excel</button>
								</div>
							</div>					
						</div>
						<table class="data-table mPurchase_load_domestic_summary" id="loadDomesticSummaryTable">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal" data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "dateVal" data-sort="SOURCE2">${i18n.t('search.type')}<!-- TYPE --></th>
									<th class = "storageVal" data-sort="CUSTNAME">${i18n.t('search.custname')}<!-- custname --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "cnameVal" data-sort="SPEC">${i18n.t('search.customercode')}<!-- CCODE --></th>
									<th class = "itemnameMedVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="loadDomesticSummarySummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="loadDomesticSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="loadDomesticSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="loadDomesticSummary_itemsPerPage" class="items-per-page-select">
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
		$("#loadDomesticSummary_searchVal_toDate").val(toDate);
		$("#loadDomesticSummary_searchVal_fromDate").val(fromDate);
		$("#loadDomesticSummary_itemsPerPage").val(loadDomesticSummaryItemsPerPage);

		// 테이블 데이터 렌더링
		renderLoadDomesticSummaryTableData();
		// 페이지네이션 렌더링
		renderLoadDomesticSummaryPagination();
		// 이벤트 바인딩
		bindLoadDomesticSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateLoadDomesticSummaryTotalCount();
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

	function updateLoadDomesticSummaryTotalCount() {
		$('#loadDomesticSummaryTotalCount').text(Number(totalLoadDomesticSummaryCount).toLocaleString());
		$('#loadDomesticSummaryCurrentPageInfo').text(currentLoadDomesticSummaryPage);
		$('#loadDomesticSummaryTotalPageInfo').text(totalLoadDomesticSummaryPages);
	}

	function renderLoadDomesticSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalLoadDomesticSummaryData.length; i++) {
			let rowNumber = (currentLoadDomesticSummaryPage - 1) * loadDomesticSummaryItemsPerPage + i + 1;
			let data = globalLoadDomesticSummaryData[i];
			
			tableBody += `
				<tr>
	                <td class = "noVal">${rowNumber}</td>
	                <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
	                <td class = "dateVal">${data.SOURCE2 || data.source2 || ''}</td>
					<td class = 'storageVal'>${data.CUSTNAME || data.custname || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "cnameVal">${data.SPEC || data.spec || ''}</td>
					<td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
	            </tr>
			`;
		}

		$("#loadDomesticSummarySummaryTableBody").html(tableBody);
		$(".loadDomesticSummary_chkAll").prop("checked", false);
	}

	function renderLoadDomesticSummaryPagination() {
		let paginationHtml = "";

		if (currentLoadDomesticSummaryPage > 1) {
			paginationHtml += `<button class="loadDomesticSummary-page-btn" data-page="${currentLoadDomesticSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="loadDomesticSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentLoadDomesticSummaryPage - 5);
		let endPage = Math.min(totalLoadDomesticSummaryPages, currentLoadDomesticSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="loadDomesticSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentLoadDomesticSummaryPage) {
				paginationHtml += `<button class="loadDomesticSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="loadDomesticSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalLoadDomesticSummaryPages) {
			if (endPage < totalLoadDomesticSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="loadDomesticSummary-page-btn" data-page="${totalLoadDomesticSummaryPages}">${totalLoadDomesticSummaryPages}</button>`;
		}

		if (currentLoadDomesticSummaryPage < totalLoadDomesticSummaryPages) {
			paginationHtml += `<button class="loadDomesticSummary-page-btn" data-page="${currentLoadDomesticSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="loadDomesticSummary-page-btn disabled">&gt;</button>`;
		}

		$("#loadDomesticSummaryPaginationContainer").html(paginationHtml);
	}

	function bindLoadDomesticSummaryEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.loadDomesticSummary_chkAll').on('change', '.loadDomesticSummary_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.loadDomesticSummary_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.loadDomesticSummary_chk').on('change', '.loadDomesticSummary_chk', function() {
			let totalCheckboxes = $('.loadDomesticSummary_chk').length;
			let checkedCheckboxes = $('.loadDomesticSummary_chk:checked').length;
			$('.loadDomesticSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnLoadDomesticSummarySearch").off('click').on('click', function() {
			performLoadDomesticSummarySearch();
		});

		$(".btnLoadDomesticSummarySearchInit").off('click').on('click', function() {
			resetLoadDomesticSummarySearch();
		});

		$('#loadDomesticSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeLoadDomesticSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.loadDomesticSummary-page-btn').on('click', '.loadDomesticSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentLoadDomesticSummaryPage = page;
					applyClientPagination();
					renderLoadDomesticSummaryTableData();
					renderLoadDomesticSummaryPagination();
					updateLoadDomesticSummaryTotalCount();
				}
			}
		});

		$('#loadDomesticSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_load_domestic_summary input[type="text"], #view_mPurchase_load_domestic_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performLoadDomesticSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#loadDomesticSummary_searchVal_fromDate").val(),
			toDate: $("#loadDomesticSummary_searchVal_toDate").val(),
			custname: $("#loadDomesticSummary_searchVal_custname").val().trim().toUpperCase(),
			car: $("#loadDomesticSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#loadDomesticSummary_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#loadDomesticSummary_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#loadDomesticSummary_searchVal_itemname").val().trim().toUpperCase(),
			source2 : "내수품"
		};
	}

	function performLoadDomesticSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentLoadDomesticSummaryPage = 1;
		performLoadDomesticSummaryDBSearch(searchCriteria);
	}

	function resetLoadDomesticSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		$("#loadDomesticSummary_searchVal_fromDate").val(fromDate);
		$("#loadDomesticSummary_searchVal_toDate").val(toDate);
		$("#loadDomesticSummary_searchVal_custname").val('');
		$("#loadDomesticSummary_searchVal_car").val('');
		$("#loadDomesticSummary_searchVal_itemcode").val('');
		$("#loadDomesticSummary_searchVal_oitemcode").val('');
		$("#loadDomesticSummary_searchVal_itemname").val('');

		let source2 = '내수품'

		currentLoadDomesticSummaryPage = 1;
		performLoadDomesticSummaryDBSearch({  toDate, fromDate, source2 });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".loadDomesticSummaryTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeLoadDomesticSummaryItemsPerPage = function(newItemsPerPage) {
		loadDomesticSummaryItemsPerPage = newItemsPerPage;
		currentLoadDomesticSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderLoadDomesticSummaryTableData();
		renderLoadDomesticSummaryPagination();
		updateLoadDomesticSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportLoadDomesticSummaryData = function() {
		return {
			total: filteredData_loadDomesticSummary.length,
			currentPage: currentLoadDomesticSummaryPage,
			itemsPerPage: loadDomesticSummaryItemsPerPage,
			data: filteredData_loadDomesticSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllLoadDomesticSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_loadDomesticSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.loadDomesticSummaryColumns, {
		fileName: 'loadDomesticSummary_All',
		sheetName: 'loadDomesticSummary'
	});

	hideLoading();
};
