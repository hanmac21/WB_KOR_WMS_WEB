/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_semiProductionSummary = [];
let globalSemiProductionSummaryData = [];
let currentSemiProductionSummaryPage = 1;
let semiProductionSummaryItemsPerPage = 100;
let totalSemiProductionSummaryCount = 0;
let totalSemiProductionSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredSemiProductionSummaryData = [];
	window.semiProductionSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'OKQTY', header: 'Okqty' },
		{ key: 'NGQTY', header: 'Ngqty' },
	];
	
	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mProduction_semiProduction_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		performSemiProductionSummaryDBSearch({ fromDate, toDate, factory });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSemiProductionSummaryDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_semiProductionSummary",
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
				filteredData_semiProductionSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSemiProductionSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_semiProduction_summary').length) {
					renderSemiProductionSummaryView();
				} else {
					renderSemiProductionSummaryTableData();
					renderSemiProductionSummaryPagination();
					updateSemiProductionSummaryTotalCount();
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
		semiProductionSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSemiProductionSummaryCount = filteredData_semiProductionSummary.length;
		totalSemiProductionSummaryPages = Math.ceil(totalSemiProductionSummaryCount / semiProductionSummaryItemsPerPage);

		const startIndex = (currentSemiProductionSummaryPage - 1) * semiProductionSummaryItemsPerPage;
		const endIndex = startIndex + semiProductionSummaryItemsPerPage;

		globalSemiProductionSummaryData = filteredData_semiProductionSummary.slice(startIndex, endIndex);
		window.filteredSemiProductionSummaryData = globalSemiProductionSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_semiProductionSummary.sort((a, b) => {
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

		currentSemiProductionSummaryPage = 1;
		applyClientPagination();

		renderSemiProductionSummaryTableData();
		renderSemiProductionSummaryPagination();
		updateSemiProductionSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSemiProductionSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mProduction_semiProduction_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="semiProductionSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="semiProductionSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="semiProductionSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="semiProductionSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="semiProductionSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="semiProductionSummary_searchVal_itemname" />
							</div>
							<!-- <div class="search-label">
								<div class="searchVal_lineno">${i18n.t('table.lineno')}LINE NO</div>
								<input type="text" id="semiProductionSummary_searchVal_lineno" />
							</div> -->
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSemiProductionSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnSemiProductionSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="semiProductionSummaryTotalCount">${totalSemiProductionSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="semiProductionSummaryCurrentPageInfo">${currentSemiProductionSummaryPage}</strong>/<strong id="semiProductionSummaryTotalPageInfo">${totalSemiProductionSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="semiProductionSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mProduction_semiProduction_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="semiProductionSummaryExcelBtn" onclick="downloadAllSemiProductionSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mProduction_semiProduction_summary" id="semiProductionSummaryTable">
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
								</tr>
							</thead>
							<tbody id="semiProductionSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="semiProductionSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="semiProductionSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="semiProductionSummary_itemsPerPage" class="items-per-page-select">
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
		$("#semiProductionSummary_searchVal_fromDate").val(fromDate);
		$("#semiProductionSummary_searchVal_toDate").val(toDate);
		$("#semiProductionSummary_itemsPerPage").val(semiProductionSummaryItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSemiProductionSummaryTableData();
		// 페이지네이션 렌더링
		renderSemiProductionSummaryPagination();
		// 이벤트 바인딩
		bindSemiProductionSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSemiProductionSummaryTotalCount();
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
		const factory = $('#semiProductionSummary_searchVal_factory');		
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

	function updateSemiProductionSummaryTotalCount() {
		$(".semiProductionSummaryTotalQty").text(Number(totalQty).toLocaleString());
		$('#semiProductionSummaryTotalCount').text(Number(totalSemiProductionSummaryCount).toLocaleString());
		$('#semiProductionSummaryCurrentPageInfo').text(currentSemiProductionSummaryPage);
		$('#semiProductionSummaryTotalPageInfo').text(totalSemiProductionSummaryPages);
	}

	function renderSemiProductionSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSemiProductionSummaryData.length; i++) {
			let rowNumber = (currentSemiProductionSummaryPage - 1) * semiProductionSummaryItemsPerPage + i + 1;
			let data = globalSemiProductionSummaryData[i];
			
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
				</tr>
			`;
		}

		$("#semiProductionSummaryTableBody").html(tableBody);
	}

	function renderSemiProductionSummaryPagination() {
		let paginationHtml = "";

		if (currentSemiProductionSummaryPage > 1) {
			paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="${currentSemiProductionSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="semiProductionSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSemiProductionSummaryPage - 5);
		let endPage = Math.min(totalSemiProductionSummaryPages, currentSemiProductionSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSemiProductionSummaryPage) {
				paginationHtml += `<button class="semiProductionSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSemiProductionSummaryPages) {
			if (endPage < totalSemiProductionSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="${totalSemiProductionSummaryPages}">${totalSemiProductionSummaryPages}</button>`;
		}

		if (currentSemiProductionSummaryPage < totalSemiProductionSummaryPages) {
			paginationHtml += `<button class="semiProductionSummary-page-btn" data-page="${currentSemiProductionSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="semiProductionSummary-page-btn disabled">&gt;</button>`;
		}

		$("#semiProductionSummaryPaginationContainer").html(paginationHtml);
	}

	function bindSemiProductionSummaryEvents() {
		$(".btnSemiProductionSummarySearch").off('click').on('click', function() {
			performSemiProductionSummarySearch();
		});

		$(".btnSemiProductionSummarySearchInit").off('click').on('click', function() {
			resetSemiProductionSummarySearch();
		});

		$('#semiProductionSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSemiProductionSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.semiProductionSummary-page-btn').on('click', '.semiProductionSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSemiProductionSummaryPage = page;
					applyClientPagination();
					renderSemiProductionSummaryTableData();
					renderSemiProductionSummaryPagination();
					updateSemiProductionSummaryTotalCount();
				}
			}
		});

		$('#semiProductionSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mProduction_semiProduction_summary input[type="text"], #view_mProduction_semiProduction_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSemiProductionSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#semiProductionSummary_searchVal_fromDate").val(),
			toDate: $("#semiProductionSummary_searchVal_toDate").val(),
			factory: $("#semiProductionSummary_searchVal_factory").val(),
			car: $("#semiProductionSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#semiProductionSummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#semiProductionSummary_searchVal_itemname").val().trim().toUpperCase(),
//			lineno: $("#semiProductionSummary_searchVal_lineno").val().trim()
		};
	}

	function performSemiProductionSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSemiProductionSummaryPage = 1;
		performSemiProductionSummaryDBSearch(searchCriteria);
	}

	function resetSemiProductionSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#semiProductionSummary_searchVal_fromDate").val(fromDate);
		$("#semiProductionSummary_searchVal_toDate").val(toDate);
		$("#semiProductionSummary_searchVal_car").val('');
		$("#semiProductionSummary_searchVal_itemcode").val('');
		$("#semiProductionSummary_searchVal_itemname").val('');
//		$("#semiProductionSummary_searchVal_lineno").val('');

		const factory = getCookie('selectedFactory');
		
		currentSemiProductionSummaryPage = 1;
		performSemiProductionSummaryDBSearch({ fromDate, toDate, factory });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSemiProductionSummaryItemsPerPage = function(newItemsPerPage) {
		semiProductionSummaryItemsPerPage = newItemsPerPage;
		currentSemiProductionSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSemiProductionSummaryTableData();
		renderSemiProductionSummaryPagination();
		updateSemiProductionSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSemiProductionSummaryData = function() {
		return {
			total: filteredData_semiProductionSummary.length,
			currentPage: currentSemiProductionSummaryPage,
			itemsPerPage: semiProductionSummaryItemsPerPage,
			data: filteredData_semiProductionSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSemiProductionSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_semiProductionSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.semiProductionSummaryColumns, {
		fileName: 'semiProductionSummary_All',
		sheetName: 'semiProductionSummary'
	});

	hideLoading();
};
