/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_salesLoadSummary = [];
let globalSalesLoadSummaryData = [];
let currentSalesLoadSummaryPage = 1;
let salesLoadSummaryItemsPerPage = 100;
let totalSalesLoadSummaryCount = 0;
let totalSalesLoadSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredSalesLoadSummaryData = [];
	window.salesLoadSummaryColumns = [
		{ key: 'INTF_YN', header: 'Status' },
		{ key: 'SDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'SPEC', header: 'Supplier Code' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'DOCK', header: 'Dock' },
		{ key: 'INVOICENO', header: 'Invoice No' },
		{ key: 'CONTAINER', header: 'Container No' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mSales_load_summary = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';

		performSalesLoadSummaryDBSearch({ fromDate, toDate, factory, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesLoadSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_salesLoadSummary",
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
				filteredData_salesLoadSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesLoadSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_load_summary').length) {
					renderSalesLoadSummaryView();
				} else {
					renderSalesLoadSummaryTableData();
					renderSalesLoadSummaryPagination();
					updateSalesLoadSummaryTotalCount();
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
		salesLoadSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesLoadSummaryCount = filteredData_salesLoadSummary.length;
		totalSalesLoadSummaryPages = Math.ceil(totalSalesLoadSummaryCount / salesLoadSummaryItemsPerPage);

		const startIndex = (currentSalesLoadSummaryPage - 1) * salesLoadSummaryItemsPerPage;
		const endIndex = startIndex + salesLoadSummaryItemsPerPage;

		globalSalesLoadSummaryData = filteredData_salesLoadSummary.slice(startIndex, endIndex);
		window.filteredSalesLoadSummaryData = globalSalesLoadSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_salesLoadSummary.sort((a, b) => {
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

		currentSalesLoadSummaryPage = 1;
		applyClientPagination();

		renderSalesLoadSummaryTableData();
		renderSalesLoadSummaryPagination();
		updateSalesLoadSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesLoadSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mSales_load_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_loadCondition">${i18n.t('search.input.status')}<!-- 불출상태 --></div>
								<select id="salesLoadSummary_searchVal_Condition" >
									<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="N">${i18n.t('search.input.waiting')}<!-- 불출 대기중 --></option>
									<option value="Y">${i18n.t('search.input.completed')}<!-- 불출 완료 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="salesLoadSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="salesLoadSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesLoadSummary_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesLoadSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.custname')}<!-- custname --></div>
								<input type="text" id="salesLoadSummary_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="salesLoadSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesLoadSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesLoadSummary_searchVal_itemname" />
							</div>						
							<div class="search-label">
								<div class="searchVal_invoiceNo">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></div>
								<input type="text" id="salesLoadSummary_searchVal_invoiceNo" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSalesLoadSummarySearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnSalesLoadSummarySearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesLoadSummaryTotalCount">${totalSalesLoadSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="salesLoadSummaryCurrentPageInfo">${currentSalesLoadSummaryPage}</strong>/<strong id="salesLoadSummaryTotalPageInfo">${totalSalesLoadSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesLoadSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="btnInterfaceCommon btnSalesLoadSummaryItemsArea" style="margin-left:24px;">
								<select id = "salesLoadSummaryCustomer">
								</select>
								<button class="btn btn-success" id="salesLoadSummaryChangeBtn">Change</button>
							</div>
							<div class="btnInterfaceCommon btnSalesLoadSummaryItemsArea" style="margin-left:24px;">
								<input class="btn" type= "date" id="salesLoadSummaryChangeDate" />
								<button class="btn btn-success" id="salesLoadSummaryChangeDateBtn">Date Change</button>
							</div>
							<div class="action-buttons-right mSales_load_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesLoadSummaryExcelBtn" onclick="downloadAllSalesLoadSummaryData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnSalesLoadSummaryItemsArea" style="margin-left:24px;">
								<!--<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfSalesLoadSummary"/>-->
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfSalesLoadSummaryDelete"/>
							</div>							
						</div>
						<table class="data-table mSales_load_summary" id="salesLoadSummaryTable">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="salesLoadSummary_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "statusVal_long" data-sort="INTF_YN">${i18n.t('table.status')}</th>
									<th class = "dateVal" data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "factoryVal" data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal" data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "storageVal" data-sort="CUSTNAME">${i18n.t('search.custname')}<!-- custname --></th>
									<th class = "itemcodeVal" data-sort="SPEC">${i18n.t('search.customercode')}<!-- CCODE --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameMedVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "loginidVal" data-sort="DOCK">${i18n.t('search.dock')}<!-- DOCK --></th>
									<th class = "loginidVal" data-sort="INVOICENO">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></th>
									<th class = "loginidVal" data-sort="CONTAINER">${i18n.t('search.containerNo')}<!-- CONTAINER --></th>
								</tr>
							</thead>
							<tbody id="salesLoadSummarySummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesLoadSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="salesLoadSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="salesLoadSummary_itemsPerPage" class="items-per-page-select">
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
		$("#salesLoadSummary_searchVal_toDate").val(toDate);
		$("#salesLoadSummary_searchVal_fromDate").val(fromDate);
		$("#salesLoadSummary_itemsPerPage").val(salesLoadSummaryItemsPerPage);

		// 거래처 데이터 가져오기
		selectCustomer();
		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSalesLoadSummaryTableData();
		// 페이지네이션 렌더링
		renderSalesLoadSummaryPagination();
		// 이벤트 바인딩
		bindSalesLoadSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesLoadSummaryTotalCount();
	}

	function selectCustomer() {
		$.ajax({
			url: "/selectCustomer",
			type: "POST",
			contentType: "application/json",
			success: function(data) {
				console.log("-- select Customer --");
				console.log(data);
				let $select = $("#salesLoadSummaryCustomer");
				$select.empty(); // 기존 option 제거

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
		const factory = $('#salesLoadSummary_searchVal_factory');
		const storage = $('#salesLoadSummary_searchVal_storage');
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

	function updateSalesLoadSummaryTotalCount() {
		$('#salesLoadSummaryTotalCount').text(Number(totalSalesLoadSummaryCount).toLocaleString());
		$('#salesLoadSummaryCurrentPageInfo').text(currentSalesLoadSummaryPage);
		$('#salesLoadSummaryTotalPageInfo').text(totalSalesLoadSummaryPages);
	}

	function renderSalesLoadSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSalesLoadSummaryData.length; i++) {
			let rowNumber = (currentSalesLoadSummaryPage - 1) * salesLoadSummaryItemsPerPage + i + 1;
			let data = globalSalesLoadSummaryData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			
			tableBody += `
				<tr>
				    <td class = "checkboxVal"><input type="checkbox" class="salesLoadSummary_chk ${statusClass}" 
	            		data-unique="${data.SDATE}_${data.ITEMCODE}_${data.INTF_YN}_${data.QTY}_${data.FACTORY}_${data.STORAGE}_${data.CUSTCODE}_${data.MES_KEY}_${data.INVOICENO}"></td>
	                <td class = "noVal">${rowNumber}</td>
	                <td class = "statusVal_long"><span class="${statusClass}">${statusText}</span></td>
	                <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
					<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
					<td class = 'storageVal'>${data.CUSTNAME || data.custname || ''}</td>
					<td class = "itemcodeVal">${data.SPEC || data.spec || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.DOCK || data.dock || ''}</td>
					<td class = "loginidVal">${data.INVOICENO || data.invoiceno || ''}</td>
					<td class = "loginidVal">${data.CONTAINER || data.container || ''}</td>
	            </tr>
			`;
		}

		$("#salesLoadSummarySummaryTableBody").html(tableBody);
		$(".salesLoadSummary_chkAll").prop("checked", false);
	}

	function renderSalesLoadSummaryPagination() {
		let paginationHtml = "";

		if (currentSalesLoadSummaryPage > 1) {
			paginationHtml += `<button class="salesLoadSummary-page-btn" data-page="${currentSalesLoadSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesLoadSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesLoadSummaryPage - 5);
		let endPage = Math.min(totalSalesLoadSummaryPages, currentSalesLoadSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesLoadSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesLoadSummaryPage) {
				paginationHtml += `<button class="salesLoadSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesLoadSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesLoadSummaryPages) {
			if (endPage < totalSalesLoadSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesLoadSummary-page-btn" data-page="${totalSalesLoadSummaryPages}">${totalSalesLoadSummaryPages}</button>`;
		}

		if (currentSalesLoadSummaryPage < totalSalesLoadSummaryPages) {
			paginationHtml += `<button class="salesLoadSummary-page-btn" data-page="${currentSalesLoadSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesLoadSummary-page-btn disabled">&gt;</button>`;
		}

		$("#salesLoadSummaryPaginationContainer").html(paginationHtml);
	}

	function bindSalesLoadSummaryEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.salesLoadSummary_chkAll').on('change', '.salesLoadSummary_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.salesLoadSummary_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.salesLoadSummary_chk').on('change', '.salesLoadSummary_chk', function() {
			let totalCheckboxes = $('.salesLoadSummary_chk').length;
			let checkedCheckboxes = $('.salesLoadSummary_chk:checked').length;
			$('.salesLoadSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnSalesLoadSummarySearch").off('click').on('click', function() {
			performSalesLoadSummarySearch();
		});

		$(".btnSalesLoadSummarySearchInit").off('click').on('click', function() {
			resetSalesLoadSummarySearch();
		});

		$('#salesLoadSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesLoadSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.salesLoadSummary-page-btn').on('click', '.salesLoadSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesLoadSummaryPage = page;
					applyClientPagination();
					renderSalesLoadSummaryTableData();
					renderSalesLoadSummaryPagination();
					updateSalesLoadSummaryTotalCount();
				}
			}
		});

		$('#salesLoadSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mSales_load_summary input[type="text"], #view_mSales_load_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesLoadSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			intf_yn: $("#salesLoadSummary_searchVal_Condition").val(),
			fromDate: $("#salesLoadSummary_searchVal_fromDate").val(),
			toDate: $("#salesLoadSummary_searchVal_toDate").val(),
			factory: $("#salesLoadSummary_searchVal_factory").val(),
			storage: $("#salesLoadSummary_searchVal_storage").val(),
			custname: $("#salesLoadSummary_searchVal_custname").val().trim().toUpperCase(),
			car: $("#salesLoadSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#salesLoadSummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesLoadSummary_searchVal_itemname").val().trim().toUpperCase(),
			invoiceNo: $("#salesLoadSummary_searchVal_invoiceNo").val().trim().toUpperCase()
		};
	}

	function performSalesLoadSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesLoadSummaryPage = 1;
		performSalesLoadSummaryDBSearch(searchCriteria);
	}

	function resetSalesLoadSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		
		$("#salesLoadSummary_searchVal_Condition").val('');
		$("#salesLoadSummary_searchVal_fromDate").val(fromDate);
		$("#salesLoadSummary_searchVal_toDate").val(toDate);
		$("#salesLoadSummary_searchVal_custname").val('');
		$("#salesLoadSummary_searchVal_car").val('');
		$("#salesLoadSummary_searchVal_itemcode").val('');
		$("#salesLoadSummary_searchVal_itemname").val('');
		$("#salesLoadSummary_searchVal_invoiceNo").val('');
		
		renderFactoryStorage();
		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';

		currentSalesLoadSummaryPage = 1;
		performSalesLoadSummaryDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".salesLoadSummaryTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeSalesLoadSummaryItemsPerPage = function(newItemsPerPage) {
		salesLoadSummaryItemsPerPage = newItemsPerPage;
		currentSalesLoadSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesLoadSummaryTableData();
		renderSalesLoadSummaryPagination();
		updateSalesLoadSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSalesLoadSummaryData = function() {
		return {
			total: filteredData_salesLoadSummary.length,
			currentPage: currentSalesLoadSummaryPage,
			itemsPerPage: salesLoadSummaryItemsPerPage,
			data: filteredData_salesLoadSummary
		};
	}


	//공급사 업데이트
	$(document).on("click", "#salesLoadSummaryChangeBtn", function() {
		if ($(".salesLoadSummary_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}

		const iidList = [];
		$(".salesLoadSummary_chk:checked").each(function() {
			let iid = $(this).data('unique');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		data = {
			iidList: iidList,
			supplier: $("#salesLoadSummaryCustomer").val()
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
					performSalesLoadSummaryDBSearch(searchVal);
					hideLoading();
				},
				error: function(xhr, status, error) {
					// ❌ alert(res.message) <- res 없음 (버그)
					window.handleAjaxError(xhr, status, error);
				}

			});
		}
	});

	$(document).on("click", ".btnIntfSalesLoadSummary", function() {

		if ($(".salesLoadSummary_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}

		let hasUndefined = false;

		const iidList = [];
		$(".salesLoadSummary_chk:checked").each(function() {
			let iid = $(this).data('unique');
			if (!iid || iid.split("_")[6] === 'undefined' || iid.split("_")[6] === 'null') {
				alert("Cust Code is Empty");
				hasUndefined = true;
				return false; // 🔹 each 반복 중단
			}
			iidList.push(iid);
		});

		// 하나라도 undefined면 전체 중단
		if (hasUndefined) return;

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		if (!confirm(i18n.t('confirmation.interface.progress'))) {
			return;
		}

		showLoading("data");
		console.log(iidList)
		$.ajax({
			url: "/load_confirm_summary",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let msg = [];
				if (data.magamCnt > 0) msg.push(`closed: ${data.magamCnt} case(s)`);
				if (data.lockCnt > 0) msg.push(`lock: ${data.lockCnt} case(s)`);
				if (msg.length > 0) {
					alert("The following items were not processed:\n" + msg.join("\n"));
				} else {

				}
				let searchVal = getCurrentSearchCriteria();
				performSalesLoadSummaryDBSearch(searchVal);

				// 전체 선택 해제
				$('.salesLoadSummary_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});

	$(document).on("click", ".btnIntfSalesLoadSummaryDelete", function() {

		if ($(".salesLoadSummary_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}

		let hasUndefined = false;

		const iidList = [];
		$(".salesLoadSummary_chk:checked").each(function() {
			let iid = $(this).data('unique');
			if (!iid || iid.split("_")[6] === 'undefined' || iid.split("_")[6] === 'null') {
				alert("Cust Code is Empty");
				hasUndefined = true;
				return false; // 🔹 each 반복 중단
			}
			iidList.push(iid);
		});

		// 하나라도 undefined면 전체 중단
		if (hasUndefined) return;

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		if (!confirm(i18n.t('confirmation.interface.progress'))) {
			return;
		}

		showLoading("data");

		let loginid = $(".loginId").text().trim();
		console.log(iidList)
		$.ajax({
			url: "/load_confirm_summary_cancel",
			type: "POST",
			data: JSON.stringify({ list: iidList, loginid: loginid }),
			contentType: "application/json",
			success: function(data) {
				let msg = [];

				if (data.magamCnt > 0) msg.push(`closed: ${data.magamCnt} case(s)`);
				if (data.lockCnt > 0) msg.push(`lock: ${data.lockCnt} case(s)`);
				if (data.noExistCnt > 0) msg.push(`No deletable records: ${data.noExistCnt} case(s)`);

				if (msg.length > 0) {
					alert("The following items were not processed:\n" + msg.join("\n"));
				} else {

				}
				let searchVal = getCurrentSearchCriteria();
				performSalesLoadSummaryDBSearch(searchVal);

				// 전체 선택 해제
				$('.salesLoadSummary_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});

	$(document).on("click", "#salesLoadSummaryChangeDateBtn", function() {
		
		if ($(".salesLoadSummary_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}


		let hasUndefined = false;

		const iidList = [];
		$(".salesLoadSummary_chk:checked").each(function() {
			let iid = $(this).data('unique');
			iidList.push(iid);
		});

		// 하나라도 undefined면 전체 중단
		if (hasUndefined) return;

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}
		
		var dateVal = $("#salesLoadSummaryChangeDate").val();

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
			newdate: $("#salesLoadSummaryChangeDate").val()
		}
		console.log(iidList)
		$.ajax({
			url: "/loadDateUpdate",
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			success: function(data) {
				console.log("-- load date update --");
				console.log(data);
				let searchVal = getCurrentSearchCriteria();
				performSalesLoadSummaryDBSearch(searchVal);
				hideLoading();
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});


});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesLoadSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_salesLoadSummary.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.salesLoadSummaryColumns, {
		fileName: 'salesLoadSummary_All',
		sheetName: 'salesLoadSummary'
	});

	hideLoading();
};
