/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = []; // 서버에서 받은 전체 데이터 (원본)
let filteredData_salesInvoiceLists = []; // 검색 필터링된 데이터
let globalInvoiceListData = []; // 현재 페이지에 표시될 데이터
let currentSalesInvoiceListPage = 1; // 현재 페이지
let salesInvoiceListItemsPerPage = 1000; // 페이지당 항목 수
let totalSalesInvoiceListCount = 0; // 총 개수
let totalSalesInvoiceListPages = 0; // 총 페이지
let totalQty = 0; // 총 수량
let currentSortColumn = null; // 현재 정렬 컬럼
let currentSortOrder = 'asc'; // 현재 정렬 방향

$(document).ready(function() {

	window.filteredSalesInvoiceListData = [];
	window.salesInvoiceListColumns = [
		{ key: 'SDATE', header: 'DATE' },
		{ key: 'CUSTNAME', header: 'CUSTNAME' },
		{ key: 'INVOICENO', header: 'INVOICENO' },
		{ key: 'QTY', header: 'QTY' , type: 'number' },
		{ key: 'BOXQTY', header: 'BOXQTY' , type: 'number' },
		{ key: 'SOURCE3', header: 'FACTORY' },
		{ key: 'DOCK', header: 'DOCK' },
		{ key: 'CONTAINER', header: 'CONTAINER' },
		{ key: 'BOX1', header: 'BOX1' },
		{ key: 'BOX2', header: 'BOX2' },
		{ key: 'BOX3', header: 'BOX3' },
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mSales_unreceivedItems = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		
		performSalesInvoiceListDBSearch({ fromDate, toDate });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesInvoiceListDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_salesInvoiceList",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
				// page, itemsPerPage 없음 = 전체 조회
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				// 서버에서 받은 전체 데이터 저장
				allServerData = response.records || [];
				filteredData_salesInvoiceLists = [...allServerData]; // 초기에는 필터링 없음
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesInvoiceListPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_unreceivedItems').length) {
					renderSalesInvoiceListView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderSalesInvoiceListTableData();
					renderSalesInvoiceListPagination();
					updateSalesInvoiceListTotalCount();
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
		// ✅ 첫 줄에 추가
		salesInvoiceListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesInvoiceListCount = filteredData_salesInvoiceLists.length;
		totalSalesInvoiceListPages = Math.ceil(totalSalesInvoiceListCount / salesInvoiceListItemsPerPage);

		// 현재 페이지 범위 계산
		const startIndex = (currentSalesInvoiceListPage - 1) * salesInvoiceListItemsPerPage;
		const endIndex = startIndex + salesInvoiceListItemsPerPage;

		// 현재 페이지 데이터 추출
		globalInvoiceListData = filteredData_salesInvoiceLists.slice(startIndex, endIndex);
		window.filteredSalesInvoiceListData = globalInvoiceListData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		// 같은 컬럼 클릭 시 정렬 방향 토글
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		// 데이터 정렬
		filteredData_salesInvoiceLists.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

			// 데이터 타입별 처리
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

		// 페이지 1로 초기화 후 다시 페이징
		currentSalesInvoiceListPage = 1;
		applyClientPagination();

		// 테이블 업데이트
		renderSalesInvoiceListTableData();
		renderSalesInvoiceListPagination();
		updateSalesInvoiceListTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesInvoiceListView() {
		let content_output = `
			<div class="divBlockControl" id="view_mSales_unreceivedItems">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
					            <div class="searchVal_fromDate">${i18n.t('search.date')}<!-- 날짜 --></div>
					            <input type="date" id="salesInvoiceList_searchVal_fromDate" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_toDate">　</div>
					            <input type="date" id="salesInvoiceList_searchVal_toDate" />
					        </div>						
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.cname')}<!-- CUSTNAME --></div>
								<input type="text" id="salesInvoiceList_searchVal_custname" />
							</div>
						    <div class="search-label">
					            <div class="searchVal_invoiceNo">${i18n.t('search.invoiceNo')}<!-- 인보이스 번호 --></div>
					            <input type="text" id="salesInvoiceList_searchVal_invoiceNo" />
					        </div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<input type="text" id="salesInvoiceList_searchVal_factory" />
							</div>						
							<div class="search-label">
								<div class="searchVal_dock">${i18n.t('search.dock')}<!-- DOCK --></div>
								<input type="text" id="salesInvoiceList_searchVal_dock" />
							</div>						
					        <div class="search-label">
					            <div class="searchVal_containerNo">${i18n.t('search.containerNo')}<!-- 컨테이너 번호 --></div>
					            <input type="text" id="salesInvoiceList_searchVal_containerNo" />
					        </div>
						</div>					
					    <div class="search_button_area">
					        <button class="btn btn-primary btnSalesInvoiceListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
					        <button class="btn btn-secondary btnSalesInvoiceListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesInvoiceListTotalCount">${totalSalesInvoiceListCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="salesInvoiceListCurrentPageInfo">${currentSalesInvoiceListPage}</strong>/<strong id="salesInvoiceListTotalPageInfo">${totalSalesInvoiceListPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesInvoiceListTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mSales_unreceivedItems">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesInvoiceListExcelBtn" onclick="downloadAllSalesInvoiceListData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mSales_unreceivedItems" id="salesInvoiceListTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- No --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}</th>
									<th class='cnameVal' data-sort="CUSTNAME">${i18n.t('search.cname')}</th>
									<th class='invoiceNoVal' data-sort="INVOICENO">${i18n.t('search.invoice')}</th>
							        <th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
							        <th class='qtyVal' data-sort="BOXQTY" data-type="number">${i18n.t('search.boxcount')}</th>
							        <th class='factoryVal' data-sort="SOURCE3">${i18n.t('search.factory')}</th>
									<th class='factoryVal' data-sort="DOCK">${i18n.t('search.dock')}</th>
									<th class='sourceVal' data-sort="CONTAINER">${i18n.t('search.containerNo')}</th>
									<th class='invoiceNoVal' data-sort="BOX1">BOX 1<!-- BOX1 --></th>
									<th class='invoiceNoVal' data-sort="BOX2">BOX 2<!-- BOX2 --></th>
									<th class='invoiceNoVal' data-sort="BOX3">BOX 3<!-- BOX3 --></th>
								</tr>
							</thead>
							<tbody id="salesInvoiceListDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesInvoiceListPaginationContainer">
						</div>
						<div class="items-per-page-selector">
						    <label for="salesInvoiceList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
						    <select id="salesInvoiceList_itemsPerPage" class="items-per-page-select">
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
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#salesInvoiceList_searchVal_toDate").val(toDate);
			$("#salesInvoiceList_searchVal_fromDate").val(fromDate);

			// ✅ 추가
			$("#salesInvoiceList_itemsPerPage").val(salesInvoiceListItemsPerPage);
		})();
		
		// 테이블 데이터 렌더링
		renderSalesInvoiceListTableData();
		// 페이지네이션 렌더링
		renderSalesInvoiceListPagination();
		// 이벤트 바인딩
		bindSalesInvoiceListEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesInvoiceListTotalCount();
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

	// ✅ 추가
	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function updateSalesInvoiceListTotalCount() {
		$('#salesInvoiceListTotalCount').text(Number(totalSalesInvoiceListCount).toLocaleString());
		$('#salesInvoiceListCurrentPageInfo').text(currentSalesInvoiceListPage);
		$('#salesInvoiceListTotalPageInfo').text(totalSalesInvoiceListPages);
	}

	function renderSalesInvoiceListTableData() {
		let tableBody = "";

		for (let i = 0; i < globalInvoiceListData.length; i++) {
			let rowNumber = (currentSalesInvoiceListPage - 1) * salesInvoiceListItemsPerPage + i + 1;
			let data = globalInvoiceListData[i];

			tableBody += `
            <tr>
				<td class='noVal'>${rowNumber}</td>
				<td class='dateVal'>${data.SDATE || ''}</td>
				<td class='cnameVal'>${data.CUSTNAME || ''}</td>
				<td class='invoiceNoVal'>${data.INVOICENO || ''}</td>
				<td class='qtyVal'>${Number(data.QTY || 0).toLocaleString()}</td>
				<td class='qtyVal'>${Number(data.BOXQTY || 0).toLocaleString()}</td>
				<td class='factoryVal'>${data.SOURCE3 || ''}</td>
				<td class='factoryVal'>${data.DOCK || ''}</td>
				<td class='sourceVal'>${data.CONTAINER || ''}</td>
				<td class='invoiceNoVal'>${data.BOX1 || ''}</td>
				<td class='invoiceNoVal'>${data.BOX2 || ''}</td>
				<td class='invoiceNoVal'>${data.BOX3 || ''}</td>
            </tr>
        `;
		}

		$("#salesInvoiceListDetailTableBody").html(tableBody);
	}

	function renderSalesInvoiceListPagination() {
		let paginationHtml = "";

		if (currentSalesInvoiceListPage > 1) {
			paginationHtml += `<button class="salesInvoiceList-page-btn" data-page="${currentSalesInvoiceListPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesInvoiceList-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesInvoiceListPage - 5);
		let endPage = Math.min(totalSalesInvoiceListPages, currentSalesInvoiceListPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesInvoiceList-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesInvoiceListPage) {
				paginationHtml += `<button class="salesInvoiceList-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesInvoiceList-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesInvoiceListPages) {
			if (endPage < totalSalesInvoiceListPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesInvoiceList-page-btn" data-page="${totalSalesInvoiceListPages}">${totalSalesInvoiceListPages}</button>`;
		}

		if (currentSalesInvoiceListPage < totalSalesInvoiceListPages) {
			paginationHtml += `<button class="salesInvoiceList-page-btn" data-page="${currentSalesInvoiceListPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesInvoiceList-page-btn disabled">&gt;</button>`;
		}

		$("#salesInvoiceListPaginationContainer").html(paginationHtml);
	}

	function bindSalesInvoiceListEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnSalesInvoiceListSearch").off('click').on('click', function() {
			performSalesInvoiceListSearch();
		});

		// 초기화 버튼 클릭
		$(".btnSalesInvoiceListSearchInit").off('click').on('click', function() {
			resetSalesInvoiceListSearch();
		});

		// ✅ 페이지당 항목 수 변경 이벤트 추가
		$('#salesInvoiceList_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesInvoiceListItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
		$(document).off('click', '.salesInvoiceList-page-btn').on('click', '.salesInvoiceList-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesInvoiceListPage = page;
					applyClientPagination();
					renderSalesInvoiceListTableData();
					renderSalesInvoiceListPagination();
					updateSalesInvoiceListTotalCount();
				}
			}
		});

		// 헤더 클릭 시 정렬
		$('#salesInvoiceListTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mSales_unreceivedItems input[type="text"], #view_mSales_unreceivedItems input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesInvoiceListSearch();
			}
		});
	}


	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#salesInvoiceList_searchVal_fromDate").val(),
			toDate: $("#salesInvoiceList_searchVal_toDate").val(),
			custname: $("#salesInvoiceList_searchVal_custname").val().trim().toUpperCase(),
			invoiceNo: $("#salesInvoiceList_searchVal_invoiceNo").val().trim().toUpperCase(),
			factory: $("#salesInvoiceList_searchVal_factory").val().trim().toUpperCase(),
			dock: $("#salesInvoiceList_searchVal_dock").val().trim().toUpperCase(),
			containerNo: $("#salesInvoiceList_searchVal_containerNo").val().trim().toUpperCase()
		};
	}

	function performSalesInvoiceListSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesInvoiceListPage = 1;
		performSalesInvoiceListDBSearch(searchCriteria);
	}

	function resetSalesInvoiceListSearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		$("#salesInvoiceList_searchVal_fromDate").val(fromDate);
		$("#salesInvoiceList_searchVal_toDate").val(toDate);
		$("#salesInvoiceList_searchVal_custname").val('');
		$("#salesInvoiceList_searchVal_invoiceNo").val('');
		$("#salesInvoiceList_searchVal_factory").val('');
		$("#salesInvoiceList_searchVal_dock").val('');
		$("#salesInvoiceList_searchVal_containerNo").val('');
		
		currentSalesInvoiceListPage = 1;
		performSalesInvoiceListDBSearch({ fromDate, toDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".salesInvoiceListTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeSalesInvoiceListItemsPerPage = function(newItemsPerPage) {
		salesInvoiceListItemsPerPage = newItemsPerPage;
		currentSalesInvoiceListPage = 1;

		// ✅ 쿠키에 저장 추가
		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesInvoiceListTableData();
		renderSalesInvoiceListPagination();
		updateSalesInvoiceListTotalCount();
	}

	window.exportSalesInvoiceListData = function() {
		return {
			total: filteredData_salesInvoiceLists.length,
			currentPage: currentSalesInvoiceListPage,
			itemsPerPage: salesInvoiceListItemsPerPage,
			data: filteredData_salesInvoiceLists
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesInvoiceListData = function() {
	let searchCriteria = {
		fromDate: $("#salesInvoiceList_searchVal_fromDate").val(),
		toDate: $("#salesInvoiceList_searchVal_toDate").val(),
		custname: $("#salesInvoiceList_searchVal_custname").val().trim().toUpperCase(),
		invoiceNo: $("#salesInvoiceList_searchVal_invoiceNo").val().trim().toUpperCase(),
		factory: $("#salesInvoiceList_searchVal_factory").val().trim().toUpperCase(),
		dock: $("#salesInvoiceList_searchVal_dock").val().trim().toUpperCase(),
		containerNo: $("#salesInvoiceList_searchVal_containerNo").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_salesInvoiceList",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log(response);

			ExcelExporter.downloadExcel(filteredData_salesInvoiceLists, window.salesInvoiceListColumns, {
				fileName: 'salesInvoiceList_All',
				sheetName: 'salesInvoiceList'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};



