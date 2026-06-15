/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_salesStockCountAlwaysDetail = [];
let globalSalesStockCountAlwaysDetailData = [];
let currentSalesStockCountAlwaysDetailPage = 1;
let salesStockCountAlwaysDetailItemsPerPage = 100;
let totalSalesStockCountAlwaysDetailCount = 0;
let totalSalesStockCountAlwaysDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredSalesStockCountAlwaysDetailData = [];
	window.salesStockCountAlwaysDetailColumns = [
		{ key: 'SCANTYPE', header: 'scantype' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'customer code' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'barcode' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mSales_stock_count_always_detail = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		const sdate = toDate;

		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT'; // 기본값

		performSalesStockCountAlwaysDetailDBSearch({ sdate, factory, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesStockCountAlwaysDetailDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_salesStockCountAlwaysDetail",
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
				filteredData_salesStockCountAlwaysDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesStockCountAlwaysDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_stock_count_always_detail').length) {
					renderSalesStockCountAlwaysDetailView();
				} else {
					renderSalesStockCountAlwaysDetailTableData();
					renderSalesStockCountAlwaysDetailPagination();
					updateSalesStockCountAlwaysDetailTotalCount();
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
		salesStockCountAlwaysDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesStockCountAlwaysDetailCount = filteredData_salesStockCountAlwaysDetail.length;
		totalSalesStockCountAlwaysDetailPages = Math.ceil(totalSalesStockCountAlwaysDetailCount / salesStockCountAlwaysDetailItemsPerPage);

		const startIndex = (currentSalesStockCountAlwaysDetailPage - 1) * salesStockCountAlwaysDetailItemsPerPage;
		const endIndex = startIndex + salesStockCountAlwaysDetailItemsPerPage;

		globalSalesStockCountAlwaysDetailData = filteredData_salesStockCountAlwaysDetail.slice(startIndex, endIndex);
		window.filteredSalesStockCountAlwaysDetailData = globalSalesStockCountAlwaysDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_salesStockCountAlwaysDetail.sort((a, b) => {
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

		currentSalesStockCountAlwaysDetailPage = 1;
		applyClientPagination();

		renderSalesStockCountAlwaysDetailTableData();
		renderSalesStockCountAlwaysDetailPagination();
		updateSalesStockCountAlwaysDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesStockCountAlwaysDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();
		let content_output = `
			<div class="divBlockControl" id="view_mSales_stock_count_always_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_counttype">${i18n.t('search.countType')}<!-- LASTDAY --></div>
								<select id="salesStockCountAlwaysDetail_searchVal_counttype" >
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="ALWAYS">ALWAYS</option>
									<option value="LASTDAY">LASTDAY</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_scantype">${i18n.t('search.scanType')}<!-- SCANTYPE --></div>
								<select id="salesStockCountAlwaysDetail_searchVal_scantype" >
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="LOCATION" >${i18n.t('search.location')}</option>
									<option value="BARCODE">${i18n.t('search.barcode')}</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="salesStockCountAlwaysDetail_searchVal_sdate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesStockCountAlwaysDetail_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesStockCountAlwaysDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesStockCountAlwaysDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesStockCountAlwaysDetail_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_loginid">${i18n.t('search.user')}<!-- USER --></div>
								<input type="text" id="salesStockCountAlwaysDetail_searchVal_loginid" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSalesStockCountAlwaysDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnSalesStockCountAlwaysDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesStockCountAlwaysDetailTotalCount">${totalSalesStockCountAlwaysDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="salesStockCountAlwaysDetailCurrentPageInfo">${currentSalesStockCountAlwaysDetailPage}</strong>/<strong id="salesStockCountAlwaysDetailTotalPageInfo">${totalSalesStockCountAlwaysDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesStockCountAlwaysDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mSales_stock_count_always_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesStockCountAlwaysDetailExcelBtn" onclick="downloadAllSalesStockCountAlwaysDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mSales_stock_count_always_detail" id="salesStockCountAlwaysDetailTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='scantypeVal' data-sort="SOURCE">${i18n.t('search.countType')}</th>
									<th class='scantypeVal' data-sort="SCANTYPE">${i18n.t('search.scanType')}</th>
									<th class='factoryVal' data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='itemcodeVal' data-sort="CUSTCODE">${i18n.t('search.customercode')}<!-- CUSTCODE --></th>
									<th class='itemnameVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class='locationVal' data-sort="LOCATION">${i18n.t('search.location')}<!-- LOCATION --></th>
									<th class='loginidVal' data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class='hhmmVal' data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
									<th class='barcodeVal' data-sort="BARCODE">${i18n.t('search.barcode')}<!-- BARCODE --></th>
								</tr>
							</thead>
							<tbody id="salesStockCountAlwaysDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesStockCountAlwaysDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="salesStockCountAlwaysDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="salesStockCountAlwaysDetail_itemsPerPage" class="items-per-page-select">
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
		$("#salesStockCountAlwaysDetail_searchVal_sdate").val(toDate);
		$("#salesStockCountAlwaysDetail_itemsPerPage").val(salesStockCountAlwaysDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSalesStockCountAlwaysDetailTableData();
		// 페이지네이션 렌더링
		renderSalesStockCountAlwaysDetailPagination();
		// 이벤트 바인딩
		bindSalesStockCountAlwaysDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesStockCountAlwaysDetailTotalCount();
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
		const factory = $('#salesStockCountAlwaysDetail_searchVal_factory');
		const storage = $('#salesStockCountAlwaysDetail_searchVal_storage');
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

	function updateSalesStockCountAlwaysDetailTotalCount() {
		$(".salesStockCountAlwaysDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#salesStockCountAlwaysDetailTotalCount').text(Number(totalSalesStockCountAlwaysDetailCount).toLocaleString());
		$('#salesStockCountAlwaysDetailCurrentPageInfo').text(currentSalesStockCountAlwaysDetailPage);
		$('#salesStockCountAlwaysDetailTotalPageInfo').text(totalSalesStockCountAlwaysDetailPages);
	}

	function renderSalesStockCountAlwaysDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSalesStockCountAlwaysDetailData.length; i++) {
			let rowNumber = (currentSalesStockCountAlwaysDetailPage - 1) * salesStockCountAlwaysDetailItemsPerPage + i + 1;
			let data = globalSalesStockCountAlwaysDetailData[i];
			
			tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
					<td class = "scantypeVal">${data.SOURCE || data.source || ''}</td>
					<td class = "scantypeVal">${data.SCANTYPE || data.scantype || ''}</td>
					<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
					<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
					<td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "itemcodeVal">${data.SPEC || data.spec || ''}</td>
					<td class = "itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "locationVal">${data.LOCATION || data.location || ''}</td>
					<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
					<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
					<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
				</tr>
			`;
		}

		$("#salesStockCountAlwaysDetailTableBody").html(tableBody);
	}

	function renderSalesStockCountAlwaysDetailPagination() {
		let paginationHtml = "";

		if (currentSalesStockCountAlwaysDetailPage > 1) {
			paginationHtml += `<button class="salesStockCountAlwaysDetail-page-btn" data-page="${currentSalesStockCountAlwaysDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesStockCountAlwaysDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesStockCountAlwaysDetailPage - 5);
		let endPage = Math.min(totalSalesStockCountAlwaysDetailPages, currentSalesStockCountAlwaysDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesStockCountAlwaysDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesStockCountAlwaysDetailPage) {
				paginationHtml += `<button class="salesStockCountAlwaysDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesStockCountAlwaysDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesStockCountAlwaysDetailPages) {
			if (endPage < totalSalesStockCountAlwaysDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesStockCountAlwaysDetail-page-btn" data-page="${totalSalesStockCountAlwaysDetailPages}">${totalSalesStockCountAlwaysDetailPages}</button>`;
		}

		if (currentSalesStockCountAlwaysDetailPage < totalSalesStockCountAlwaysDetailPages) {
			paginationHtml += `<button class="salesStockCountAlwaysDetail-page-btn" data-page="${currentSalesStockCountAlwaysDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesStockCountAlwaysDetail-page-btn disabled">&gt;</button>`;
		}

		$("#salesStockCountAlwaysDetailPaginationContainer").html(paginationHtml);
	}

	function bindSalesStockCountAlwaysDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.salesStockCountAlwaysDetail_chkAll').on('change', '.salesStockCountAlwaysDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.salesStockCountAlwaysDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.salesStockCountAlwaysDetail_chk').on('change', '.salesStockCountAlwaysDetail_chk', function() {
			let totalCheckboxes = $('.salesStockCountAlwaysDetail_chk').length;
			let checkedCheckboxes = $('.salesStockCountAlwaysDetail_chk:checked').length;
			$('.salesStockCountAlwaysDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnSalesStockCountAlwaysDetailSearch").off('click').on('click', function() {
			performSalesStockCountAlwaysDetailSearch();
		});

		$(".btnSalesStockCountAlwaysDetailSearchInit").off('click').on('click', function() {
			resetSalesStockCountAlwaysDetailSearch();
		});

		$('#salesStockCountAlwaysDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesStockCountAlwaysDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.salesStockCountAlwaysDetail-page-btn').on('click', '.salesStockCountAlwaysDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesStockCountAlwaysDetailPage = page;
					applyClientPagination();
					renderSalesStockCountAlwaysDetailTableData();
					renderSalesStockCountAlwaysDetailPagination();
					updateSalesStockCountAlwaysDetailTotalCount();
				}
			}
		});

		$('#salesStockCountAlwaysDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mSales_stock_count_always_detail input[type="text"], #view_mSales_stock_count_always_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesStockCountAlwaysDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			counttype: $("#salesStockCountAlwaysDetail_searchVal_counttype").val(),
			scantype: $("#salesStockCountAlwaysDetail_searchVal_scantype").val(),
			factory: $("#salesStockCountAlwaysDetail_searchVal_factory").val(),
			storage: $("#salesStockCountAlwaysDetail_searchVal_storage").val(),
			sdate: $("#salesStockCountAlwaysDetail_searchVal_sdate").val(),
			itemcode: $("#salesStockCountAlwaysDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesStockCountAlwaysDetail_searchVal_itemname").val().trim().toUpperCase(),
			loginid: $("#salesStockCountAlwaysDetail_searchVal_loginid").val().trim().toUpperCase()
		};
	}

	function performSalesStockCountAlwaysDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesStockCountAlwaysDetailPage = 1;
		performSalesStockCountAlwaysDetailDBSearch(searchCriteria);
	}

	function resetSalesStockCountAlwaysDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const sdate = toDate;

		$("#salesStockCountAlwaysDetail_searchVal_counttype").val("all");
		$("#salesStockCountAlwaysDetail_searchVal_scantype").val("all");
		$("#salesStockCountAlwaysDetail_searchVal_sdate").val(toDate);
		$("#salesStockCountAlwaysDetail_searchVal_itemcode").val('');
		$("#salesStockCountAlwaysDetail_searchVal_itemname").val('');
		$("#salesStockCountAlwaysDetail_searchVal_loginid").val('');

		renderFactoryStorage();
		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';
		
		currentSalesStockCountAlwaysDetailPage = 1;
		performSalesStockCountAlwaysDetailDBSearch({ sdate, factory, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSalesStockCountAlwaysDetailItemsPerPage = function(newItemsPerPage) {
		salesStockCountAlwaysDetailItemsPerPage = newItemsPerPage;
		currentSalesStockCountAlwaysDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesStockCountAlwaysDetailTableData();
		renderSalesStockCountAlwaysDetailPagination();
		updateSalesStockCountAlwaysDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSalesStockCountAlwaysDetailData = function() {
		return {
			total: filteredData_salesStockCountAlwaysDetail.length,
			currentPage: currentSalesStockCountAlwaysDetailPage,
			itemsPerPage: salesStockCountAlwaysDetailItemsPerPage,
			data: filteredData_salesStockCountAlwaysDetail
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesStockCountAlwaysDetailData = function() {
	showLoading("export");

	const processedData = filteredData_salesStockCountAlwaysDetail.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.salesStockCountAlwaysDetailColumns, {
		fileName: 'salesStockCountAlwaysDetail_All',
		sheetName: 'salesStockCountAlwaysDetail'
	});

	hideLoading();
};
