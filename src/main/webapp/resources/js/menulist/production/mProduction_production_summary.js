/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_productionSummary = [];
let globalProductionSummaryData = [];
let currentProductionSummaryPage = 1;
let productionSummaryItemsPerPage = 100;
let totalProductionSummaryCount = 0;
let totalProductionSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredProductionSummaryData = [];
	window.productionSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'OKQTY', header: 'OKQty' },
		{ key: 'NGQTY', header: 'NGQty' },
		{ key: 'LINENO', header: 'Line No' },
		{ key: 'WORKPLACE', header: 'Work Center' },
		{ key: 'SHIFT', header: 'Shift' }
	];
	
	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mProduction_production_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		performProductionSummaryDBSearch({ fromDate, toDate, factory });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performProductionSummaryDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_productionSummary",
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
				filteredData_productionSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentProductionSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_production_summary').length) {
					renderProductionSummaryView();
				} else {
					renderProductionSummaryTableData();
					renderProductionSummaryPagination();
					updateProductionSummaryTotalCount();
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
		productionSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalProductionSummaryCount = filteredData_productionSummary.length;
		totalProductionSummaryPages = Math.ceil(totalProductionSummaryCount / productionSummaryItemsPerPage);

		const startIndex = (currentProductionSummaryPage - 1) * productionSummaryItemsPerPage;
		const endIndex = startIndex + productionSummaryItemsPerPage;

		globalProductionSummaryData = filteredData_productionSummary.slice(startIndex, endIndex);
		window.filteredProductionSummaryData = globalProductionSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_productionSummary.sort((a, b) => {
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

		currentProductionSummaryPage = 1;
		applyClientPagination();

		renderProductionSummaryTableData();
		renderProductionSummaryPagination();
		updateProductionSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderProductionSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mProduction_production_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="productionSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="productionSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="productionSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productionSummary_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_lineno">${i18n.t('search.lineno')}<!-- LINENO --></div>
								<input type="text" id="productionSummary_searchVal_lineno" />
							</div>
							<div class="search-label">
								<div class="searchVal_workcenter">${i18n.t('search.workCenter')}<!-- WORKCENTER --></div>
								<input type="text" id="productionSummary_searchVal_workcenter" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnProductionSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnProductionSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="productionSummaryTotalCount">${totalProductionSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="productionSummaryCurrentPageInfo">${currentProductionSummaryPage}</strong>/<strong id="productionSummaryTotalPageInfo">${totalProductionSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="productionSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mProduction_production_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="productionSummaryExcelBtn" onclick="downloadAllProductionSummaryData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnProductionSummaryItemsArea" style="margin-left:24px;">
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfProductionSummaryDelete"/>
							</div>
						</div>
						<table class="data-table mProduction_production_summary" id="productionSummaryTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='factoryVal' data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="OKQTY" data-type="number">${i18n.t('search.okqty')}<!-- OKQTY --></th>
									<th class='qtyVal' data-sort="NGQTY" data-type="number">${i18n.t('search.ngqty')}<!-- NGQTY --></th>
									<th class="hhmmVal" data-sort="LINENO">${i18n.t('table.lineno')}<!-- LINENO --></th>
									<th class="locationVal" data-sort="WORKPLACE">${i18n.t('search.workCenter')}<!-- WORKPLACE --></th>
									<th class="dateVal" data-sort="SHIFT">SHIFT<!-- SHIFT --></th>
								</tr>
							</thead>
							<tbody id="productionSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="productionSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="productionSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="productionSummary_itemsPerPage" class="items-per-page-select">
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
		$("#productionSummary_searchVal_fromDate").val(fromDate);
		$("#productionSummary_searchVal_toDate").val(toDate);
		$("#productionSummary_itemsPerPage").val(productionSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderProductionSummaryTableData();
		// 페이지네이션 렌더링
		renderProductionSummaryPagination();
		// 이벤트 바인딩
		bindProductionSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateProductionSummaryTotalCount();
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
		const factory = $('#productionSummary_searchVal_factory');		
		const savedFactory = getCookie('selectedFactory');
		
		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}		
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

	function updateProductionSummaryTotalCount() {
		$(".productionSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#productionSummaryTotalCount').text(Number(totalProductionSummaryCount).toLocaleString());
		$('#productionSummaryCurrentPageInfo').text(currentProductionSummaryPage);
		$('#productionSummaryTotalPageInfo').text(totalProductionSummaryPages);
	}

	function renderProductionSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalProductionSummaryData.length; i++) {
			let rowNumber = (currentProductionSummaryPage - 1) * productionSummaryItemsPerPage + i + 1;
			let data = globalProductionSummaryData[i];
			
			tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'factoryVal'>${data.FACTORY || data.factory || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'itemnameLongVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = "qtyVal">${Number(data.OKQTY || data.okqty || 0).toLocaleString()}</td>
					<td class = "qtyVal">${Number(data.NGQTY || data.ngqty || 0).toLocaleString()}</td>
					<td class = "hhmmVal">${data.LINENO || data.lineno || ''}</td>
					<td class = "locationVal">${data.WORKPLACE || data.workplace || ''}</td>
					<td class = "dateVal">${data.SHIFT || data.shift || ''}</td>
				</tr>
			`;
		}

		$("#productionSummaryTableBody").html(tableBody);
	}

	function renderProductionSummaryPagination() {
		let paginationHtml = "";

		if (currentProductionSummaryPage > 1) {
			paginationHtml += `<button class="productionSummary-page-btn" data-page="${currentProductionSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="productionSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentProductionSummaryPage - 5);
		let endPage = Math.min(totalProductionSummaryPages, currentProductionSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="productionSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentProductionSummaryPage) {
				paginationHtml += `<button class="productionSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="productionSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalProductionSummaryPages) {
			if (endPage < totalProductionSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="productionSummary-page-btn" data-page="${totalProductionSummaryPages}">${totalProductionSummaryPages}</button>`;
		}

		if (currentProductionSummaryPage < totalProductionSummaryPages) {
			paginationHtml += `<button class="productionSummary-page-btn" data-page="${currentProductionSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="productionSummary-page-btn disabled">&gt;</button>`;
		}

		$("#productionSummaryPaginationContainer").html(paginationHtml);
	}

	function bindProductionSummaryEvents() {
		$(".btnProductionSummarySearch").off('click').on('click', function() {
			performProductionSummarySearch();
		});

		$(".btnProductionSummarySearchInit").off('click').on('click', function() {
			resetProductionSummarySearch();
		});

		$('#productionSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeProductionSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.productionSummary-page-btn').on('click', '.productionSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentProductionSummaryPage = page;
					applyClientPagination();
					renderProductionSummaryTableData();
					renderProductionSummaryPagination();
					updateProductionSummaryTotalCount();
				}
			}
		});

		$('#productionSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mProduction_production_summary input[type="text"], #view_mProduction_production_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performProductionSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#productionSummary_searchVal_fromDate").val(),
			toDate: $("#productionSummary_searchVal_toDate").val(),
			factory: $("#productionSummary_searchVal_factory").val(),
			car: $("#productionSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#productionSummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#productionSummary_searchVal_itemname").val().trim().toUpperCase(),
			lineno: $("#productionSummary_searchVal_lineno").val().trim().toUpperCase(),
			workCenter: $("#productionSummary_searchVal_workcenter").val().trim().toUpperCase()
		};
	}

	function performProductionSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentProductionSummaryPage = 1;
		performProductionSummaryDBSearch(searchCriteria);
	}

	function resetProductionSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#productionSummary_searchVal_fromDate").val(fromDate);
		$("#productionSummary_searchVal_toDate").val(toDate);
		$("#productionSummary_searchVal_car").val('');
		$("#productionSummary_searchVal_itemcode").val('');
		$("#productionSummary_searchVal_itemname").val('');
		$("#productionSummary_searchVal_lineno").val('');
		$("#productionSummary_searchVal_workcenter").val('');

		const factory = getCookie('selectedFactory');
		
		currentProductionSummaryPage = 1;
		performProductionSummaryDBSearch({ fromDate, toDate, factory });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeProductionSummaryItemsPerPage = function(newItemsPerPage) {
		productionSummaryItemsPerPage = newItemsPerPage;
		currentProductionSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderProductionSummaryTableData();
		renderProductionSummaryPagination();
		updateProductionSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportProductionSummaryData = function() {
		return {
			total: filteredData_productionSummary.length,
			currentPage: currentProductionSummaryPage,
			itemsPerPage: productionSummaryItemsPerPage,
			data: filteredData_productionSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllProductionSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_productionSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.productionSummaryColumns, {
		fileName: 'productionSummary_All',
		sheetName: 'productionSummary'
	});

	hideLoading();
};
