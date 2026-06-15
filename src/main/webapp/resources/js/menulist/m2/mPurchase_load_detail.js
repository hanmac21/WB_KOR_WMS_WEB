/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_loadDetail = [];
let globalLoadDetailData = [];
let currentLoadDetailPage = 1;
let loadDetailItemsPerPage = 100;
let totalLoadDetailCount = 0;
let totalLoadDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredLoadDetailData = [];
	window.loadDetailColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'SPEC', header: 'Supplier Code' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'DOCK', header: 'Dock' },
		{ key: 'INVOICENO', header: 'Invoice No' },
		{ key: 'CONTAINER', header: 'Container No' },
		{ key: 'HHMM', header: 'Time' },
	    { key: 'SOURCE3', header: 'Box No' },
		{ key: 'TYPE', header: 'Type' },
		{ key: 'BARCODE', header: 'Barcode' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_load_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		performLoadDetailDBSearch({ fromDate, toDate, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performLoadDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_loadDetail",
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
				filteredData_loadDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentLoadDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_load_detail').length) {
					renderLoadDetailView();
				} else {
					renderLoadDetailTableData();
					renderLoadDetailPagination();
					updateLoadDetailTotalCount();
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
		loadDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalLoadDetailCount = filteredData_loadDetail.length;
		totalLoadDetailPages = Math.ceil(totalLoadDetailCount / loadDetailItemsPerPage);

		const startIndex = (currentLoadDetailPage - 1) * loadDetailItemsPerPage;
		const endIndex = startIndex + loadDetailItemsPerPage;

		globalLoadDetailData = filteredData_loadDetail.slice(startIndex, endIndex);
		window.filteredLoadDetailData = globalLoadDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_loadDetail.sort((a, b) => {
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

		currentLoadDetailPage = 1;
		applyClientPagination();

		renderLoadDetailTableData();
		renderLoadDetailPagination();
		updateLoadDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderLoadDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		let intfBtnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminLoadDetailDelete"/>
	        `;
			intfBtnHtml = `				
				<div class="btnInterfaceCommon btnLoadDetailItemsArea" style="margin-left:24px;">
					<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfLoadDetailDelete"/>
				</div>	
			`;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_load_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_loadCondition">${i18n.t('search.input.status')}<!-- 불출상태 --></div>
								<select id="loadDetail_searchVal_Condition" >
									<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="N">${i18n.t('search.input.waiting')}<!-- 불출 대기중 --></option>
									<option value="Y">${i18n.t('search.input.completed')}<!-- 불출 완료 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="loadDetail_searchVal_fromDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="loadDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="loadDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.suppliername')}<!-- custname --></div>
								<input type="text" id="loadDetail_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="loadDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="loadDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}<!-- OITEMCODE --></div>
								<input type="text" id="loadDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="loadDetail_searchVal_itemname" />
							</div>						
							<div class="search-label">
								<div class="searchVal_invoiceNo">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></div>
								<input type="text" id="loadDetail_searchVal_invoiceNo" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnLoadDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnLoadDetailSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="loadDetailTotalCount">${totalLoadDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="loadDetailCurrentPageInfo">${currentLoadDetailPage}</strong>/<strong id="loadDetailTotalPageInfo">${totalLoadDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="loadDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="btnInterfaceCommon btnLoadDetailItemsArea" style="margin-left:24px;">
								<select id="loadDetailCustomer"></select>
								<button class="btn btn-success" id="loadDetailChangeBtn">Change</button>
							</div>
							<div class="btnInterfaceCommon btnLoadDetailItemsArea" style="margin-left:24px;">
								<input class="btn" type="date" id="loadDetailChangeDate" />
								<button class="btn btn-success" id="loadDetailChangeDateBtn">Date Change</button>
							</div>
							<div class="action-buttons-right mPurchase_load_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnLoadDetailDelete"/>
									<button class="btn btn-success" id="loadDetailExcelBtn" onclick="downloadAllLoadDetailData()">Excel</button>
								</div>
							</div>
							${intfBtnHtml}
						</div>
						<table class="data-table mPurchase_load_detail" id="loadDetailTable">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="loadDetail_chkAll">
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
									<th class = "loginidVal" data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class = "loginidVal" data-sort="DOCK">${i18n.t('search.dock')}<!-- DOCK --></th>
									<th class = "wccodeVal" data-sort="INVOICENO">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></th>
									<th class = "loginidVal" data-sort="CONTAINER">${i18n.t('search.containerNo')}<!-- CONTAINER --></th>
									<th class = "hhmmVal" data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
									<th class = "typeVal" data-sort="SEQ">${i18n.t('table.seq')}<!-- TYPE --></th>
									<th class = "typeVal" data-sort="TYPE">${i18n.t('search.type')}<!-- TYPE --></th>
									<th class = "barcodeVal transysBarcodeVal" data-sort="BARCODE">${i18n.t('search.barcode')}<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="loadDetailDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="loadDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="loadDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="loadDetail_itemsPerPage" class="items-per-page-select">
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
		$("#loadDetail_searchVal_toDate").val(toDate);
		$("#loadDetail_searchVal_fromDate").val(fromDate);
		$("#loadDetail_itemsPerPage").val(loadDetailItemsPerPage);

		// 거래처 데이터 가져오기
		selectCustomer();
		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderLoadDetailTableData();
		// 페이지네이션 렌더링
		renderLoadDetailPagination();
		// 이벤트 바인딩
		bindLoadDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateLoadDetailTotalCount();
	}

	function selectCustomer() {
		const customers = [
			'0005|TRANSYS_AL',
			'0006|ADIENT',
			'0002|LEAR',
			'0004|TRANSYS_IL',
			'A022|TRANSYS_GA'
		];
		const $select = $("#loadDetailCustomer");
		$select.empty();
		customers.forEach(function(value) {
			$select.append($("<option>", {
				value: value,
				text: value.split("|").slice(1)
			}));
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
		const storage = $('#loadDetail_searchVal_storage');
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

	function updateLoadDetailTotalCount() {
		$('#loadDetailTotalCount').text(Number(totalLoadDetailCount).toLocaleString());
		$('#loadDetailCurrentPageInfo').text(currentLoadDetailPage);
		$('#loadDetailTotalPageInfo').text(totalLoadDetailPages);
	}

	function renderLoadDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalLoadDetailData.length; i++) {
			let rowNumber = (currentLoadDetailPage - 1) * loadDetailItemsPerPage + i + 1;
			let data = globalLoadDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			
			tableBody += `
				<tr>
				    <td class = "checkboxVal"><input type="checkbox" class="loadDetail_chk ${statusClass}" 
		    			data-unique="${data.SDATE}|${data.ITEMCODE}|${data.INTF_YN}|${data.QTY}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}"
		    			data-delete="${data.IID}|${data.SDATE}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}|${data.MESKEY || ''}">
		    		</td>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = "statusVal_long"><span class="${statusClass}">${statusText}</span></td>
		            <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
					<td class = "storageVal">${data.CUSTNAME || data.custname || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "cnameVal">${data.SPEC || data.spec || ''}</td>
					<td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
					<td class = "loginidVal">${data.DOCK || data.dock || ''}</td>
					<td class = "wccodeVal">${data.INVOICENO || data.invoiceno || ''}</td>
					<td class = "loginidVal">${data.CONTAINER || data.container || ''}</td>
					<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
					<td class = "typeVal">${data.SEQ || data.seq || ''}</td>
					<td class = "typeVal">${data.TYPE || data.type || ''}</td>
					<td class = "barcodeVal transysBarcodeVal">${data.BARCODE || data.barcode || ''}</td>
		        </tr>
			`;
		}

		$("#loadDetailDetailTableBody").html(tableBody);
		$(".loadDetail_chkAll").prop("checked", false);
	}

	function renderLoadDetailPagination() {
		let paginationHtml = "";

		if (currentLoadDetailPage > 1) {
			paginationHtml += `<button class="loadDetail-page-btn" data-page="${currentLoadDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="loadDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentLoadDetailPage - 5);
		let endPage = Math.min(totalLoadDetailPages, currentLoadDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="loadDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentLoadDetailPage) {
				paginationHtml += `<button class="loadDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="loadDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalLoadDetailPages) {
			if (endPage < totalLoadDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="loadDetail-page-btn" data-page="${totalLoadDetailPages}">${totalLoadDetailPages}</button>`;
		}

		if (currentLoadDetailPage < totalLoadDetailPages) {
			paginationHtml += `<button class="loadDetail-page-btn" data-page="${currentLoadDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="loadDetail-page-btn disabled">&gt;</button>`;
		}

		$("#loadDetailPaginationContainer").html(paginationHtml);
	}

	function bindLoadDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.loadDetail_chkAll').on('change', '.loadDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.loadDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.loadDetail_chk').on('change', '.loadDetail_chk', function() {
			let totalCheckboxes = $('.loadDetail_chk').length;
			let checkedCheckboxes = $('.loadDetail_chk:checked').length;
			$('.loadDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnLoadDetailSearch").off('click').on('click', function() {
			performLoadDetailSearch();
		});

		$(".btnLoadDetailSearchInit").off('click').on('click', function() {
			resetLoadDetailSearch();
		});

		$('#loadDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeLoadDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.loadDetail-page-btn').on('click', '.loadDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentLoadDetailPage = page;
					applyClientPagination();
					renderLoadDetailTableData();
					renderLoadDetailPagination();
					updateLoadDetailTotalCount();
				}
			}
		});

		$('#loadDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_load_detail input[type="text"], #view_mPurchase_load_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performLoadDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			intf_yn: $("#loadDetail_searchVal_Condition").val(),
			fromDate: $("#loadDetail_searchVal_fromDate").val(),
			toDate: $("#loadDetail_searchVal_toDate").val(),
			storage: $("#loadDetail_searchVal_storage").val(),
			custname: $("#loadDetail_searchVal_custname").val().trim().toUpperCase(),
			car: $("#loadDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#loadDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#loadDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#loadDetail_searchVal_itemname").val().trim().toUpperCase(),
			invoiceNo: $("#loadDetail_searchVal_invoiceNo").val().trim().toUpperCase()
		};
	}

	function performLoadDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentLoadDetailPage = 1;
		performLoadDetailDBSearch(searchCriteria);
	}

	function resetLoadDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#loadDetail_searchVal_Condition").val('');
		$("#loadDetail_searchVal_fromDate").val(fromDate);
		$("#loadDetail_searchVal_toDate").val(toDate);
		$("#loadDetail_searchVal_custname").val('');
		$("#loadDetail_searchVal_car").val('');
		$("#loadDetail_searchVal_itemcode").val('');
		$("#loadDetail_searchVal_oitemcode").val('');
		$("#loadDetail_searchVal_itemname").val('');
		$("#loadDetail_searchVal_invoiceNo").val('');

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';
		renderFactoryStorage();

		currentLoadDetailPage = 1;
		performLoadDetailDBSearch({ storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".loadDetailTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeLoadDetailItemsPerPage = function(newItemsPerPage) {
		loadDetailItemsPerPage = newItemsPerPage;
		currentLoadDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderLoadDetailTableData();
		renderLoadDetailPagination();
		updateLoadDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportLoadDetailData = function() {
		return {
			total: filteredData_loadDetail.length,
			currentPage: currentLoadDetailPage,
			itemsPerPage: loadDetailItemsPerPage,
			data: filteredData_loadDetail
		};
	}


	//삭제
	$(document).on("click", ".btnLoadDetailDelete", function() {
		const iidList = [];
		$(".loadDetail_chk:checked").each(function() {
			let iid = $(this).data('delete');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		if (!confirm(i18n.t('confirmation.items.delete'))) {
			return;
		}

		showLoading("data");

		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");

		console.log(iidList)
		$.ajax({
			url: "/deleteLoad",
			type: "POST",
			data: JSON.stringify({
				iidList: iidList,
				loginid: loginid
			}),
			contentType: "application/json",
			success: function(data) {
				if (!data.success) {
					hideLoading();

					let message = "";
					// 검증 실패
					if (data.failList && data.failList.length > 0) {
						message = "Some items cannot be deleted\n\n"; // 삭제할 수 없는 항목이 있습니다.

						data.failList.forEach(function(item) {
							if (item.failReason === 'INVALID_KIND') {
								alert(`Code Error!`);
								return;
							} else if (item.failReason === 'POST_PROCESSING') {
								message += `- Post-processing data exists\n${item.barcode}\n`; // 후처리 데이터 존재
							} else if (item.failReason === 'MAGAM') {
								message += `- Monthly closing completed\n${item.barcode}\n`; // 월 마감 완료
							}
						});
					}
					// 삭제 실패
					else if (data.failReason === 'DELETE_FAILED') {
						message = "Failed to delete\n\n";
						message += `Operation: ${data.failedOperation}\n`;
						message += `Barcode: ${data.failedBarcode}\n\n`;
					}

					alert(message);
					return;
				}

				let searchVal = getCurrentSearchCriteria();
				performLoadDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.loadDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});


	// 관리자용 삭제
	$(document).on("click", ".btnAdminLoadDetailDelete", function() {
		const iidList = [];
		$(".loadDetail_chk:checked").each(function() {
			let iid = $(this).data('delete');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		if (!confirm(i18n.t('confirmation.items.delete'))) {
			return;
		}

		const reason = prompt("사유를 입력해 주세요");

		if (reason === null) return;

		if (reason.trim() === "") {
			alert("내용이 비어 있습니다.");
			return;
		}

		showLoading("data");

		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");

		console.log(iidList)
		$.ajax({
			url: "/deleteLoad",
			type: "POST",
			data: JSON.stringify({
				iidList: iidList,
				loginid: loginid,
				reason: reason,
				admin: true
			}),
			contentType: "application/json",
			success: function(data) {
				hideLoading();
				if (data.success) {
					alert("삭제 완료");

					let searchVal = getCurrentSearchCriteria();
					performLoadDetailDBSearch(searchVal);

					// 전체 선택 해제
					$('.loadDetail_chkAll').prop('checked', false);
				} else {
					alert("삭제에 실패했습니다.");
				}
			},
			error: function(xhr, status, error) {
				console.log("🔥 LOCAL ajax error:", status, error);
				console.log("Response:", xhr.responseText);

				const message = "An error occurred while processing the request.\n\n"
					+ "Details:\n"
					+ (xhr.responseText || error || status || "Unknown error");

				// 🔹 기본 alert 대신 커스텀 모달 사용
				window.showCopyableAlert(message);

				hideLoading();
			}
		});
	});

	$(document).on("click", ".btnIntfLoadDetailDelete", function() {
		if ($(".loadDetail_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}

		const iidList = [];
		$(".loadDetail_chk:checked").each(function() {
			let iid = $(this).data('delete');
			if (iid) iidList.push(iid);
		});

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
				if (data.laterCnt > 0) msg.push(`Post-processing done: ${data.laterCnt} case(s)`);
				if (data.noExistCnt > 0) msg.push(`No deletable records: ${data.noExistCnt} case(s)`);

				if (msg.length > 0) {
					alert("The following items were not processed:\n" + msg.join("\n"));
				} else {

				}
				let searchVal = getCurrentSearchCriteria();
				performLoadDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.loadDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});


// 거래처 변경
	$(document).on("click", "#loadDetailChangeBtn", function() {
		// if ($(".loadDetail_chk.status-completed:checked").length > 0) {
		// 	alert(i18n.t('validation.confirm.items'));
		// 	return;
		// }

		const iidList = [];
		$(".loadDetail_chk:checked").each(function() {
			let deleteVal = $(this).data('delete');
			if (deleteVal) iidList.push(deleteVal);
		});

		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		const data = {
			iidList: iidList,
			supplier: $("#loadDetailCustomer").val()
		};

		if (confirm("Do you want to register the customer?")) {
			showLoading("data");
			$.ajax({
				url: "/loadCustomerUpdate",
				type: "POST",
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(data) {
					console.log("-- load customer update --");
					alert("Customer has been changed.");
					let searchVal = getCurrentSearchCriteria();
					performLoadDetailDBSearch(searchVal);
					$('.loadDetail_chkAll').prop('checked', false);
				},
				error: function(xhr, status, error) {
					window.handleAjaxError(xhr, status, error);
				}
			});
		}
	});


// 날짜 변경
	$(document).on("click", "#loadDetailChangeDateBtn", function() {
		if ($(".loadDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}

		const iidList = [];
		$(".loadDetail_chk:checked").each(function() {
			let deleteVal = $(this).data('delete');
			if (deleteVal) iidList.push(deleteVal.split('|')[0]);
		});

		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		const dateVal = $("#loadDetailChangeDate").val();
		if (!dateVal) {
			alert("Select a date.");
			return;
		}

		if (!confirm('Do you want to change the date?')) {
			return;
		}

		showLoading("data");
		$.ajax({
			url: "/loadDateUpdate",
			type: "POST",
			data: JSON.stringify({ iidList: iidList, newdate: dateVal }),
			contentType: "application/json",
			success: function(data) {
				console.log("-- load date update --");
				let searchVal = getCurrentSearchCriteria();
				performLoadDetailDBSearch(searchVal);
				$('.loadDetail_chkAll').prop('checked', false);
				hideLoading();
			},
			error: function(xhr, status, error) {
				window.handleAjaxError(xhr, status, error);
			}
		});
	});
});

// 전체 데이터 엑셀 다운로드
window.downloadAllLoadDetailData = function() {
	showLoading("export");

	const processedData = filteredData_loadDetail.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.loadDetailColumns, {
		fileName: 'loadDetail_All',
		sheetName: 'loadDetail'
	});

	hideLoading();
};
