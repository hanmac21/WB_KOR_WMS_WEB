/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_storageSummary = [];
let globalStorageSummaryData = [];
let currentStorageSummaryPage = 1;
let storageSummaryItemsPerPage = 100;
let totalStorageSummaryCount = 0;
let totalStorageSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredStorageSummaryData = [];
	window.storageSummaryColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'STORAGE1', header: 'from storage' },
		{ key: 'STORAGE2', header: 'to storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'OITEMCODE', header: 'spec' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_storage_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage1 = 'all';
		let storage2 = 'all';

		performStorageSummaryDBSearch({ fromDate, toDate, storage1, storage2 });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performStorageSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_storageSummary",
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
				filteredData_storageSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentStorageSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_storage_summary').length) {
					renderStorageSummaryView();
				} else {
					renderStorageSummaryTableData();
					renderStorageSummaryPagination();
					updateStorageSummaryTotalCount();
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
		storageSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalStorageSummaryCount = filteredData_storageSummary.length;
		totalStorageSummaryPages = Math.ceil(totalStorageSummaryCount / storageSummaryItemsPerPage);

		const startIndex = (currentStorageSummaryPage - 1) * storageSummaryItemsPerPage;
		const endIndex = startIndex + storageSummaryItemsPerPage;

		globalStorageSummaryData = filteredData_storageSummary.slice(startIndex, endIndex);
		window.filteredStorageSummaryData = globalStorageSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_storageSummary.sort((a, b) => {
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

		currentStorageSummaryPage = 1;
		applyClientPagination();

		renderStorageSummaryTableData();
		renderStorageSummaryPagination();
		updateStorageSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderStorageSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_storage_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="storageSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="storageSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage.from')}<!-- FROM STORAGE --></div>
								<select id="storageSummary_searchVal_storage1" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage.to')}<!-- TO STORAGE --></div>
								<select id="storageSummary_searchVal_storage2" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="storageSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="storageSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="storageSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="storageSummary_searchVal_itemname" />
							</div>	
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnStorageSummarySearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnStorageSummarySearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="storageSummaryTotalCount">${totalStorageSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="storageSummaryCurrentPageInfo">${currentStorageSummaryPage}</strong>/<strong id="storageSummaryTotalPageInfo">${totalStorageSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="storageSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_storage_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="storageSummaryExcelBtn" onclick="downloadAllStorageSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_storage_summary" id="storageSummaryTable">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal" data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "storageVal" data-sort="STORAGE1">${i18n.t('search.storage.from')}<!-- FROM STORAGE --></th>
									<th class = "storageVal" data-sort="STORAGE2">${i18n.t('search.storage.to')}<!-- TO STORAGE --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "cnameVal" data-sort="OITEMCODE">${i18n.t('search.customercode')}<!-- OITEMCODE --></th>
									<th class = "itemnameLongVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="storageSummaryDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="storageSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="storageSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="storageSummary_itemsPerPage" class="items-per-page-select">
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
		$("#storageSummary_searchVal_fromDate").val(fromDate);
		$("#storageSummary_searchVal_toDate").val(toDate);
		$("#storageSummary_itemsPerPage").val(storageSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderStorageSummaryTableData();
		// 페이지네이션 렌더링
		renderStorageSummaryPagination();
		// 이벤트 바인딩
		bindStorageSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateStorageSummaryTotalCount();
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
		const storage1 = $('#storageSummary_searchVal_storage1');
		const storage2 = $('#storageSummary_searchVal_storage2');

		storage1.empty();
		storage2.empty();

		const storageList = ['all', 'INBOUND', 'PRODUCT', 'OUTSIDE'];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage1.append(`<option value="${item}">${text}</option>`);
			storage2.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택 (all)
		storage1.val(storageList[0]);
		storage2.val(storageList[0]);
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

	function updateStorageSummaryTotalCount() {
		$(".storageSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#storageSummaryTotalCount').text(Number(totalStorageSummaryCount).toLocaleString());
		$('#storageSummaryCurrentPageInfo').text(currentStorageSummaryPage);
		$('#storageSummaryTotalPageInfo').text(totalStorageSummaryPages);
	}

	function renderStorageSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalStorageSummaryData.length; i++) {
			let rowNumber = (currentStorageSummaryPage - 1) * storageSummaryItemsPerPage + i + 1;
			let data = globalStorageSummaryData[i];
			
			tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
		            <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "storageVal">${data.STORAGE1 || data.storage1 || ''}</td>
					<td class = "storageVal">${data.STORAGE2 || data.storage2 || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "cnameVal">${data.OITEMCODE || data.oitemcode || ''}</td>
					<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
		        </tr>
			`;
		}

		$("#storageSummaryDetailTableBody").html(tableBody);
	}

	function renderStorageSummaryPagination() {
		let paginationHtml = "";

		if (currentStorageSummaryPage > 1) {
			paginationHtml += `<button class="storageSummary-page-btn" data-page="${currentStorageSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="storageSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentStorageSummaryPage - 5);
		let endPage = Math.min(totalStorageSummaryPages, currentStorageSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="storageSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStorageSummaryPage) {
				paginationHtml += `<button class="storageSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="storageSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalStorageSummaryPages) {
			if (endPage < totalStorageSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="storageSummary-page-btn" data-page="${totalStorageSummaryPages}">${totalStorageSummaryPages}</button>`;
		}

		if (currentStorageSummaryPage < totalStorageSummaryPages) {
			paginationHtml += `<button class="storageSummary-page-btn" data-page="${currentStorageSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="storageSummary-page-btn disabled">&gt;</button>`;
		}

		$("#storageSummaryPaginationContainer").html(paginationHtml);
	}

	function bindStorageSummaryEvents() {
		$(".btnStorageSummarySearch").off('click').on('click', function() {
			performStorageSummarySearch();
		});

		$(".btnStorageSummarySearchInit").off('click').on('click', function() {
			resetStorageSummarySearch();
		});

		$('#storageSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeStorageSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.storageSummary-page-btn').on('click', '.storageSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentStorageSummaryPage = page;
					applyClientPagination();
					renderStorageSummaryTableData();
					renderStorageSummaryPagination();
					updateStorageSummaryTotalCount();
				}
			}
		});

		$('#storageSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_storage_summary input[type="text"], #view_mPurchase_storage_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performStorageSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#storageSummary_searchVal_fromDate").val(),
			toDate: $("#storageSummary_searchVal_toDate").val(),
			storage1: $("#storageSummary_searchVal_storage1").val(),
			storage2: $("#storageSummary_searchVal_storage2").val(),
			car: $("#storageSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#storageSummary_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#storageSummary_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#storageSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performStorageSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentStorageSummaryPage = 1;
		performStorageSummaryDBSearch(searchCriteria);
	}

	function resetStorageSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		
		$("#storageSummary_searchVal_fromDate").val(fromDate);
		$("#storageSummary_searchVal_toDate").val(toDate);
		$("#storageSummary_searchVal_car").val('');
		$("#storageSummary_searchVal_itemcode").val('');
		$("#storageSummary_searchVal_oitemcode").val('');
		$("#storageSummary_searchVal_itemname").val('');

		renderFactoryStorage();

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage1 = 'all';
		let storage2 = 'all';

		currentStorageSummaryPage = 1;
		performStorageSummaryDBSearch({ fromDate, toDate, storage1, storage2 });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeStorageSummaryItemsPerPage = function(newItemsPerPage) {
		storageSummaryItemsPerPage = newItemsPerPage;
		currentStorageSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderStorageSummaryTableData();
		renderStorageSummaryPagination();
		updateStorageSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportStorageSummaryData = function() {
		return {
			total: filteredData_storageSummary.length,
			currentPage: currentStorageSummaryPage,
			itemsPerPage: storageSummaryItemsPerPage,
			data: filteredData_storageSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllStorageSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_storageSummary.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.storageSummaryColumns, {
		fileName: 'storageSummary_All',
		sheetName: 'storageSummary'
	});

	hideLoading();
};
