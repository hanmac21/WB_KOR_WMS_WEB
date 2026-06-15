/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_loadSummary = [];
let globalLoadSummaryData = [];
let currentLoadSummaryPage = 1;
let loadSummaryItemsPerPage = 100;
let totalLoadSummaryCount = 0;
let totalLoadSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredLoadSummaryData = [];
	window.loadSummaryColumns = [
		{ key: 'INTF_YN', header: 'Status' },
		{ key: 'SDATE', header: 'Date' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'SPEC', header: 'Supplier Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'DOCK', header: 'Dock' },
		{ key: 'INVOICENO', header: 'Invoice No' },
		{ key: 'CONTAINER', header: 'Container No' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_load_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		performLoadSummaryDBSearch({ fromDate, toDate, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performLoadSummaryDBSearch(searchCriteria) {
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
				filteredData_loadSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentLoadSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_load_summary').length) {
					renderLoadSummaryView();
				} else {
					renderLoadSummaryTableData();
					renderLoadSummaryPagination();
					updateLoadSummaryTotalCount();
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
		loadSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalLoadSummaryCount = filteredData_loadSummary.length;
		totalLoadSummaryPages = Math.ceil(totalLoadSummaryCount / loadSummaryItemsPerPage);

		const startIndex = (currentLoadSummaryPage - 1) * loadSummaryItemsPerPage;
		const endIndex = startIndex + loadSummaryItemsPerPage;

		globalLoadSummaryData = filteredData_loadSummary.slice(startIndex, endIndex);
		window.filteredLoadSummaryData = globalLoadSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_loadSummary.sort((a, b) => {
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

		currentLoadSummaryPage = 1;
		applyClientPagination();

		renderLoadSummaryTableData();
		renderLoadSummaryPagination();
		updateLoadSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderLoadSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_load_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<!-- 상태검색 - detail로 이동
							<div class="search-label">
								<div class="search_loadCondition">${i18n.t('search.input.status')}</div>
								<select id="loadSummary_searchVal_Condition" >
									<option value="">${i18n.t('search.all')}</option>
									<option value="N">${i18n.t('search.input.waiting')}</option>
									<option value="Y">${i18n.t('search.input.completed')}</option>
								</select>
							</div>
							-->
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="loadSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="loadSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="loadSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.suppliername')}<!-- custname --></div>
								<input type="text" id="loadSummary_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="loadSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="loadSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}<!-- OITEMCODE --></div>
								<input type="text" id="loadSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="loadSummary_searchVal_itemname" />
							</div>						
							<div class="search-label">
								<div class="searchVal_invoiceNo">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></div>
								<input type="text" id="loadSummary_searchVal_invoiceNo" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnLoadSummarySearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnLoadSummarySearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="loadSummaryTotalCount">${totalLoadSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="loadSummaryCurrentPageInfo">${currentLoadSummaryPage}</strong>/<strong id="loadSummaryTotalPageInfo">${totalLoadSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="loadSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<!-- 거래처변경/날짜변경 - detail로 이동
							<div class="btnInterfaceCommon btnLoadSummaryItemsArea" style="margin-left:24px;">
								<select id="loadSummaryCustomer"></select>
								<button class="btn btn-success" id="loadSummaryChangeBtn">Change</button>
							</div>
							<div class="btnInterfaceCommon btnLoadSummaryItemsArea" style="margin-left:24px;">
								<input class="btn" type="date" id="loadSummaryChangeDate" />
								<button class="btn btn-success" id="loadSummaryChangeDateBtn">Date Change</button>
							</div>
							-->
							<div class="action-buttons-right mPurchase_load_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="loadSummaryExcelBtn" onclick="downloadAllLoadSummaryData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnLoadSummaryItemsArea" style="margin-left:24px;">
								<!--<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfLoadSummary"/>-->
								<!-- <input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfLoadSummaryDelete"/> -->
							</div>							
						</div>
						<table class="data-table mPurchase_load_summary" id="loadSummaryTable">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="loadSummary_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "statusVal_long" data-sort="INTF_YN">${i18n.t('table.status')}</th>
									<th class = "dateVal" data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "storageVal" data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "storageVal" data-sort="CUSTNAME">${i18n.t('search.suppliername')}<!-- custname --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "cnameVal" data-sort="SPEC">${i18n.t('search.customercode')}<!-- CCODE --></th>
									<th class = "itemnameMedVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "loginidVal" data-sort="DOCK">${i18n.t('search.dock')}<!-- DOCK --></th>
									<th class = "wccodeVal" data-sort="INVOICENO">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></th>
									<th class = "loginidVal" data-sort="CONTAINER">${i18n.t('search.containerNo')}<!-- CONTAINER --></th>
								</tr>
							</thead>
							<tbody id="loadSummarySummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="loadSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="loadSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="loadSummary_itemsPerPage" class="items-per-page-select">
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
		$("#loadSummary_searchVal_toDate").val(toDate);
		$("#loadSummary_searchVal_fromDate").val(fromDate);
		$("#loadSummary_itemsPerPage").val(loadSummaryItemsPerPage);

		// 거래처 데이터 가져오기 - detail로 이동
		// selectCustomer();
		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderLoadSummaryTableData();
		// 페이지네이션 렌더링
		renderLoadSummaryPagination();
		// 이벤트 바인딩
		bindLoadSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateLoadSummaryTotalCount();
	}

	/* 거래처 데이터 - detail로 이동
	function selectCustomer() {
		$.ajax({
			url: "/selectCustomer",
			type: "POST",
			contentType: "application/json",
			success: function(data) {
				console.log("-- select Customer --");
				console.log(data);
				let $select = $("#loadSummaryCustomer");
				$select.empty();
				$.each(data, function(index, value) {
					$select.append($("<option>", {
						value: value,
						text: value.split("_")[1]
					}));
				});
				hideLoading();
			},
			error: function(xhr, status, error) {
				console.error("DB 조회 실패:", error);
				hideLoading();
				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
			}
		});
	}
	*/

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
		const storage = $('#loadSummary_searchVal_storage');
		const savedStorage = getCookie('selectedStorage');

		storage.empty();

		let storageList = ['all', 'INBOUND', 'PRODUCT', 'OUTSIDE'];

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

	function updateLoadSummaryTotalCount() {
		$('#loadSummaryTotalCount').text(Number(totalLoadSummaryCount).toLocaleString());
		$('#loadSummaryCurrentPageInfo').text(currentLoadSummaryPage);
		$('#loadSummaryTotalPageInfo').text(totalLoadSummaryPages);
	}

	function renderLoadSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalLoadSummaryData.length; i++) {
			let rowNumber = (currentLoadSummaryPage - 1) * loadSummaryItemsPerPage + i + 1;
			let data = globalLoadSummaryData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			
			tableBody += `
				<tr>
				    <td class = "checkboxVal"><input type="checkbox" class="loadSummary_chk ${statusClass}" 
	            		data-unique="${data.SDATE}|${data.ITEMCODE}|${data.INTF_YN}|${data.QTY}|${data.FACTORY}|${data.STORAGE}|${data.CUSTCODE}|${data.MES_KEY}|${data.INVOICENO}"></td>
	                <td class = "noVal">${rowNumber}</td>
	                <td class = "statusVal_long"><span class="${statusClass}">${statusText}</span></td>
	                <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
					<td class = 'storageVal'>${data.CUSTNAME || data.custname || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "cnameVal">${data.SPEC || data.spec || ''}</td>
					<td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.DOCK || data.dock || ''}</td>
					<td class = "wccodeVal">${data.INVOICENO || data.invoiceno || ''}</td>
					<td class = "loginidVal">${data.CONTAINER || data.container || ''}</td>
	            </tr>
			`;
		}

		$("#loadSummarySummaryTableBody").html(tableBody);
		$(".loadSummary_chkAll").prop("checked", false);
	}

	function renderLoadSummaryPagination() {
		let paginationHtml = "";

		if (currentLoadSummaryPage > 1) {
			paginationHtml += `<button class="loadSummary-page-btn" data-page="${currentLoadSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="loadSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentLoadSummaryPage - 5);
		let endPage = Math.min(totalLoadSummaryPages, currentLoadSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="loadSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentLoadSummaryPage) {
				paginationHtml += `<button class="loadSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="loadSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalLoadSummaryPages) {
			if (endPage < totalLoadSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="loadSummary-page-btn" data-page="${totalLoadSummaryPages}">${totalLoadSummaryPages}</button>`;
		}

		if (currentLoadSummaryPage < totalLoadSummaryPages) {
			paginationHtml += `<button class="loadSummary-page-btn" data-page="${currentLoadSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="loadSummary-page-btn disabled">&gt;</button>`;
		}

		$("#loadSummaryPaginationContainer").html(paginationHtml);
	}

	function bindLoadSummaryEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.loadSummary_chkAll').on('change', '.loadSummary_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.loadSummary_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.loadSummary_chk').on('change', '.loadSummary_chk', function() {
			let totalCheckboxes = $('.loadSummary_chk').length;
			let checkedCheckboxes = $('.loadSummary_chk:checked').length;
			$('.loadSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnLoadSummarySearch").off('click').on('click', function() {
			performLoadSummarySearch();
		});

		$(".btnLoadSummarySearchInit").off('click').on('click', function() {
			resetLoadSummarySearch();
		});

		$('#loadSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeLoadSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.loadSummary-page-btn').on('click', '.loadSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentLoadSummaryPage = page;
					applyClientPagination();
					renderLoadSummaryTableData();
					renderLoadSummaryPagination();
					updateLoadSummaryTotalCount();
				}
			}
		});

		$('#loadSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_load_summary input[type="text"], #view_mPurchase_load_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performLoadSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			// intf_yn: $("#loadSummary_searchVal_Condition").val(), // detail로 이동
			fromDate: $("#loadSummary_searchVal_fromDate").val(),
			toDate: $("#loadSummary_searchVal_toDate").val(),
			storage: $("#loadSummary_searchVal_storage").val(),
			custname: $("#loadSummary_searchVal_custname").val().trim().toUpperCase(),
			car: $("#loadSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#loadSummary_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#loadSummary_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#loadSummary_searchVal_itemname").val().trim().toUpperCase(),
			invoiceNo: $("#loadSummary_searchVal_invoiceNo").val().trim().toUpperCase()
		};
	}

	function performLoadSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentLoadSummaryPage = 1;
		performLoadSummaryDBSearch(searchCriteria);
	}

	function resetLoadSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		// $("#loadSummary_searchVal_Condition").val(''); // detail로 이동
		$("#loadSummary_searchVal_fromDate").val(fromDate);
		$("#loadSummary_searchVal_toDate").val(toDate);
		$("#loadSummary_searchVal_custname").val('');
		$("#loadSummary_searchVal_car").val('');
		$("#loadSummary_searchVal_itemcode").val('');
		$("#loadSummary_searchVal_oitemcode").val('');
		$("#loadSummary_searchVal_itemname").val('');
		$("#loadSummary_searchVal_invoiceNo").val('');
		
		renderFactoryStorage();
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		currentLoadSummaryPage = 1;
		performLoadSummaryDBSearch({ storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".loadSummaryTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeLoadSummaryItemsPerPage = function(newItemsPerPage) {
		loadSummaryItemsPerPage = newItemsPerPage;
		currentLoadSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderLoadSummaryTableData();
		renderLoadSummaryPagination();
		updateLoadSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportLoadSummaryData = function() {
		return {
			total: filteredData_loadSummary.length,
			currentPage: currentLoadSummaryPage,
			itemsPerPage: loadSummaryItemsPerPage,
			data: filteredData_loadSummary
		};
	}


	/* 거래처변경 핸들러 - detail로 이동
	$(document).on("click", "#loadSummaryChangeBtn", function() {
		if ($(".loadSummary_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}

		const iidList = [];
		$(".loadSummary_chk:checked").each(function() {
			let iid = $(this).data('unique');
			iidList.push(iid);
		});

		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		data = {
			iidList: iidList,
			supplier: $("#loadSummaryCustomer").val()
		}

		if (confirm("Do you want to register the customer?")) {
			showLoading("data");
			$.ajax({
				url: "/loadCustomerUpdate",
				type: "POST",
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(data) {
					console.log("-- load update --");
					console.log(data);
					let searchVal = getCurrentSearchCriteria();
					performLoadSummaryDBSearch(searchVal);
					hideLoading();
				},
				error: function(xhr, status, error) {
					window.handleAjaxError(xhr, status, error);
				}
			});
		}
	});
	*/

	// $(document).on("click", ".btnIntfLoadSummary", function() {
	//
	// 	if ($(".loadSummary_chk.status-completed:checked").length > 0) {
	// 		alert(i18n.t('validation.confirm.items'));
	// 		return;
	// 	}
	//
	// 	let hasUndefined = false;
	//
	// 	const iidList = [];
	// 	$(".loadSummary_chk:checked").each(function() {
	// 		let iid = $(this).data('unique');
	// 		if (!iid || iid.split("_")[6] === 'undefined' || iid.split("_")[6] === 'null') {
	// 			alert("Cust Code is Empty");
	// 			hasUndefined = true;
	// 			return false; // 🔹 each 반복 중단
	// 		}
	// 		iidList.push(iid);
	// 	});
	//
	// 	// 하나라도 undefined면 전체 중단
	// 	if (hasUndefined) return;
	//
	// 	// 체크된 요소가 없으면 경고창 표시 후 리턴
	// 	if (iidList.length === 0) {
	// 		alert(i18n.t('validation.no.select.items'));
	// 		return;
	// 	}
	//
	// 	if (!confirm(i18n.t('confirmation.interface.progress'))) {
	// 		return;
	// 	}
	//
	// 	showLoading("data");
	// 	console.log(iidList)
	// 	$.ajax({
	// 		url: "/load_confirm_summary",
	// 		type: "POST",
	// 		data: JSON.stringify(iidList),
	// 		contentType: "application/json",
	// 		success: function(data) {
	// 			let msg = [];
	// 			if (data.magamCnt > 0) msg.push(`closed: ${data.magamCnt} case(s)`);
	// 			if (data.lockCnt > 0) msg.push(`lock: ${data.lockCnt} case(s)`);
	// 			if (msg.length > 0) {
	// 				alert("The following items were not processed:\n" + msg.join("\n"));
	// 			} else {
	//
	// 			}
	// 			let searchVal = getCurrentSearchCriteria();
	// 			performLoadSummaryDBSearch(searchVal);
	//
	// 			// 전체 선택 해제
	// 			$('.loadSummary_chkAll').prop('checked', false);
	// 		},
	// 		error: function(xhr, status, error) {
	// 			// ❌ alert(res.message) <- res 없음 (버그)
	// 			window.handleAjaxError(xhr, status, error);
	// 		}
	//
	// 	});
	//
	// });

	// $(document).on("click", ".btnIntfLoadSummaryDelete", function() {
	//
	// 	if ($(".loadSummary_chk.status-waiting:checked").length > 0) {
	// 		alert(i18n.t('validation.unconfirm.items'));
	// 		return;
	// 	}
	//
	// 	let hasUndefined = false;
	//
	// 	const iidList = [];
	// 	$(".loadSummary_chk:checked").each(function() {
	// 		let iid = $(this).data('unique');
	// 		if (!iid || iid.split("_")[6] === 'undefined' || iid.split("_")[6] === 'null') {
	// 			alert("Cust Code is Empty");
	// 			hasUndefined = true;
	// 			return false; // 🔹 each 반복 중단
	// 		}
	// 		iidList.push(iid);
	// 	});
	//
	// 	// 하나라도 undefined면 전체 중단
	// 	if (hasUndefined) return;
	//
	// 	// 체크된 요소가 없으면 경고창 표시 후 리턴
	// 	if (iidList.length === 0) {
	// 		alert(i18n.t('validation.no.select.items'));
	// 		return;
	// 	}
	//
	// 	if (!confirm(i18n.t('confirmation.interface.progress'))) {
	// 		return;
	// 	}
	//
	// 	showLoading("data");
	//
	// 	let loginid = $(".loginId").text().trim();
	// 	console.log(iidList)
	// 	$.ajax({
	// 		url: "/load_confirm_summary_cancel",
	// 		type: "POST",
	// 		data: JSON.stringify({ list: iidList, loginid: loginid }),
	// 		contentType: "application/json",
	// 		success: function(data) {
	// 			let msg = [];
	//
	// 			if (data.magamCnt > 0) msg.push(`closed: ${data.magamCnt} case(s)`);
	// 			if (data.lockCnt > 0) msg.push(`lock: ${data.lockCnt} case(s)`);
	// 			if (data.noExistCnt > 0) msg.push(`No deletable records: ${data.noExistCnt} case(s)`);
	//
	// 			if (msg.length > 0) {
	// 				alert("The following items were not processed:\n" + msg.join("\n"));
	// 			} else {
	//
	// 			}
	// 			let searchVal = getCurrentSearchCriteria();
	// 			performLoadSummaryDBSearch(searchVal);
	//
	// 			// 전체 선택 해제
	// 			$('.loadSummary_chkAll').prop('checked', false);
	// 		},
	// 		error: function(xhr, status, error) {
	// 			// ❌ alert(res.message) <- res 없음 (버그)
	// 			window.handleAjaxError(xhr, status, error);
	// 		}
	//
	// 	});
	//
	// });

	/* 날짜변경 핸들러 - detail로 이동
	$(document).on("click", "#loadSummaryChangeDateBtn", function() {
		if ($(".loadSummary_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}

		const iidList = [];
		$(".loadSummary_chk:checked").each(function() {
			let iid = $(this).data('unique');
			iidList.push(iid);
		});

		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		var dateVal = $("#loadSummaryChangeDate").val();
		if (!dateVal) {
			alert("Select a date.");
			return;
		}

		if (!confirm('Do you want to change the date?')) {
			return;
		}

		showLoading("data");
		data = {
			iidList: iidList,
			newdate: dateVal
		}
		$.ajax({
			url: "/loadDateUpdate",
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			success: function(data) {
				console.log("-- load date update --");
				console.log(data);
				let searchVal = getCurrentSearchCriteria();
				performLoadSummaryDBSearch(searchVal);
				hideLoading();
			},
			error: function(xhr, status, error) {
				window.handleAjaxError(xhr, status, error);
			}
		});
	});
	*/


});

// 전체 데이터 엑셀 다운로드
window.downloadAllLoadSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_loadSummary.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.loadSummaryColumns, {
		fileName: 'loadSummary_All',
		sheetName: 'loadSummary'
	});

	hideLoading();
};
