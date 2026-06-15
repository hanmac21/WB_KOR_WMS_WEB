/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_incomingReturnDetail = [];
let globalIncomingReturnDetailData = [];
let currentIncomingReturnDetailPage = 1;
let incomingReturnDetailItemsPerPage = 100;
let totalIncomingReturnDetailCount = 0;
let totalIncomingReturnDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredIncomingReturnDetailData = [];
	window.incomingReturnDetailColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'TYPE', header: 'Type' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'CAR', header: 'Car' }, 
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'OITEMCODE', header: 'spec' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'INVOICE_NO', header: 'Invoice No' },
		{ key: 'LOGINID', header: 'Loginid' },
		{ key: 'HHMM', header: 'Time' },
		{ key: 'BARCODE', header: 'Barcode' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_incoming_return_detail = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		performIncomingReturnDetailDBSearch({ fromDate,  toDate, storage });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performIncomingReturnDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_incomingReturnDetail",
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
				filteredData_incomingReturnDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentIncomingReturnDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_incoming_return_detail').length) {
					renderIncomingReturnDetailView();
				} else {
					renderIncomingReturnDetailTableData();
					renderIncomingReturnDetailPagination();
					updateIncomingReturnDetailTotalCount();
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
		incomingReturnDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalIncomingReturnDetailCount = filteredData_incomingReturnDetail.length;
		totalIncomingReturnDetailPages = Math.ceil(totalIncomingReturnDetailCount / incomingReturnDetailItemsPerPage);

		const startIndex = (currentIncomingReturnDetailPage - 1) * incomingReturnDetailItemsPerPage;
		const endIndex = startIndex + incomingReturnDetailItemsPerPage;

		globalIncomingReturnDetailData = filteredData_incomingReturnDetail.slice(startIndex, endIndex);
		window.filteredIncomingReturnDetailData = globalIncomingReturnDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_incomingReturnDetail.sort((a, b) => {
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

		currentIncomingReturnDetailPage = 1;
		applyClientPagination();

		renderIncomingReturnDetailTableData();
		renderIncomingReturnDetailPagination();
		updateIncomingReturnDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderIncomingReturnDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		let intfBtnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminIncomingReturnDetailDelete"/>
	        `;
			intfBtnHtml = `
				<div class="btnInterfaceCommon btnIncomingReturnDetailItemsArea" style="margin-left:24px;">
					<!-- <input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfIncomingReturnDetail"/> -->
					<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfIncomingReturnDetailCancel"/>
				</div>
			`;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_incoming_return_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
								<input type="date" id="incomingReturnDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="incomingReturnDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}</div>
								<select id="incomingReturnDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.suppliername')}<!-- custname --></div>
								<input type="text" id="incomingReturnDetail_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}</div>
								<input type="text" id="incomingReturnDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="incomingReturnDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}</div>
								<input type="text" id="incomingReturnDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="incomingReturnDetail_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnIncomingReturnDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnIncomingReturnDetailSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="incomingReturnDetailTotalCount">${totalIncomingReturnDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="incomingReturnDetailCurrentPageInfo">${currentIncomingReturnDetailPage}</strong>/<strong id="incomingReturnDetailTotalPageInfo">${totalIncomingReturnDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="incomingReturnDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_incoming_return_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnIncomingReturnDetailDelete"/>
									<button class="btn btn-success" id="incomingReturnDetailExcelBtn" onclick="downloadAllIncomingReturnDetailData()">Excel</button>
								</div>
							</div>
							${intfBtnHtml}
						</div>
						<table class="data-table mPurchase_incoming_return_detail" id="incomingReturnDetailTable">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="incomingReturnDetail_chkAll" />
									</th>
									<th class='noVal'>${i18n.t('table.no')}</th>
									<th class='statusVal' data-sort="STATUS">${i18n.t('table.status')}</th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}</th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}</th>
									<th class='typeVal' data-sort="TYPE">${i18n.t('search.type')}<!-- TYPE --></th>
									<th class='cnameVal' data-sort="CUSTNAME">${i18n.t('search.suppliername')}<!-- CNAME --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}</th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
									<th class='cnameVal' data-sort="OITEMCODE">${i18n.t('search.customercode')}</th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
									<th class='invoiceNoVal' data-sort="INVOICENO">${i18n.t('search.invoiceNo')}</th>
									<th class='loginidVal' data-sort="LOGINID">${i18n.t('search.user')}</th>
									<th class='hhmmVal' data-sort="HHMM">${i18n.t('table.time')}</th>
									<th class='barcodeVal' data-sort="BARCODE">${i18n.t('search.barcode')}</th>
								</tr>
							</thead>
							<tbody id="incomingReturnDetailDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="incomingReturnDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="incomingReturnDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="incomingReturnDetail_itemsPerPage" class="items-per-page-select">
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
		$("#incomingReturnDetail_searchVal_fromDate").val(fromDate);
		$("#incomingReturnDetail_searchVal_toDate").val(toDate);
		$("#incomingReturnDetail_itemsPerPage").val(incomingReturnDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderIncomingReturnDetailTableData();
		// 페이지네이션 렌더링
		renderIncomingReturnDetailPagination();
		// 이벤트 바인딩
		bindIncomingReturnDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateIncomingReturnDetailTotalCount();
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
		const storage = $('#incomingReturnDetail_searchVal_storage');
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

	function updateIncomingReturnDetailTotalCount() {
		$(".incomingReturnDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#incomingReturnDetailTotalCount').text(Number(totalIncomingReturnDetailCount).toLocaleString());
		$('#incomingReturnDetailCurrentPageInfo').text(currentIncomingReturnDetailPage);
		$('#incomingReturnDetailTotalPageInfo').text(totalIncomingReturnDetailPages);
	}

	function renderIncomingReturnDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalIncomingReturnDetailData.length; i++) {
			let rowNumber = (currentIncomingReturnDetailPage - 1) * incomingReturnDetailItemsPerPage + i + 1;
			let data = globalIncomingReturnDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			
			tableBody += `
				<tr>
				     <td class = "checkboxVal"><input type="checkbox" class="incomingReturnDetail_chk ${statusClass}" 
	        			data-unique="${data.SDATE}|${data.ITEMCODE}|${data.INTF_YN}|${data.QTY}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}|${data.MES_KEY}"
	        			data-delete="${data.IID}|${data.SDATE}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}|${data.MES_KEY || ''}">
	        		</td>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
				    <td class = 'typeVal'>${data.TYPE || data.type || ''}</td>
					<td class = 'cnameVal'>${data.CUSTNAME || data.custname || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'cnameVal'>${data.OITEMCODE || data.oitemcode || ''}</td>
				    <td class = 'itemnameLongVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
				    <td class = 'invoiceNoVal'>${data.INVOICENO || data.invoiceno || ''}</td>
					<td class = 'loginidVal'>${data.LOGINID || data.loginid || ''}</td>
					<td class = 'hhmmVal'>${data.HHMM || data.hhmm || ''}</td>
					<td class = 'barcodeVal'>${data.BARCODE || data.barcode || ''}</td>
				</tr>
			`;
		}

		$("#incomingReturnDetailDetailTableBody").html(tableBody);
		$('.incomingReturnDetail_chkAll').prop('checked', false);
	}

	function renderIncomingReturnDetailPagination() {
		let paginationHtml = "";

		if (currentIncomingReturnDetailPage > 1) {
			paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="${currentIncomingReturnDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="incomingReturnDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentIncomingReturnDetailPage - 5);
		let endPage = Math.min(totalIncomingReturnDetailPages, currentIncomingReturnDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentIncomingReturnDetailPage) {
				paginationHtml += `<button class="incomingReturnDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalIncomingReturnDetailPages) {
			if (endPage < totalIncomingReturnDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="${totalIncomingReturnDetailPages}">${totalIncomingReturnDetailPages}</button>`;
		}

		if (currentIncomingReturnDetailPage < totalIncomingReturnDetailPages) {
			paginationHtml += `<button class="incomingReturnDetail-page-btn" data-page="${currentIncomingReturnDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="incomingReturnDetail-page-btn disabled">&gt;</button>`;
		}

		$("#incomingReturnDetailPaginationContainer").html(paginationHtml);
	}

	function bindIncomingReturnDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.incomingReturnDetail_chkAll').on('change', '.incomingReturnDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.incomingReturnDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.incomingReturnDetail_chk').on('change', '.incomingReturnDetail_chk', function() {
			let totalCheckboxes = $('.incomingReturnDetail_chk').length;
			let checkedCheckboxes = $('.incomingReturnDetail_chk:checked').length;
			$('.incomingReturnDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnIncomingReturnDetailSearch").off('click').on('click', function() {
			performIncomingReturnDetailSearch();
		});

		$(".btnIncomingReturnDetailSearchInit").off('click').on('click', function() {
			resetIncomingReturnDetailSearch();
		});

		$('#incomingReturnDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeIncomingReturnDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.incomingReturnDetail-page-btn').on('click', '.incomingReturnDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentIncomingReturnDetailPage = page;
					applyClientPagination();
					renderIncomingReturnDetailTableData();
					renderIncomingReturnDetailPagination();
					updateIncomingReturnDetailTotalCount();
				}
			}
		});

		$('#incomingReturnDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_incoming_return_detail input[type="text"], #view_mPurchase_incoming_return_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performIncomingReturnDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#incomingReturnDetail_searchVal_fromDate").val(),
			toDate: $("#incomingReturnDetail_searchVal_toDate").val(),
			storage: $("#incomingReturnDetail_searchVal_storage").val(),
			custname: $("#incomingReturnDetail_searchVal_custname").val().trim().toUpperCase(),
			car: $("#incomingReturnDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#incomingReturnDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#incomingReturnDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#incomingReturnDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performIncomingReturnDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentIncomingReturnDetailPage = 1;
		performIncomingReturnDetailDBSearch(searchCriteria);
	}

	function resetIncomingReturnDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#incomingReturnDetail_searchVal_fromDate").val(fromDate);
		$("#incomingReturnDetail_searchVal_toDate").val(toDate);
		$("#incomingReturnDetail_searchVal_custname").val('');
		$("#incomingReturnDetail_searchVal_car").val('');
		$("#incomingReturnDetail_searchVal_itemcode").val('');
		$("#incomingReturnDetail_searchVal_oitemcode").val('');
		$("#incomingReturnDetail_searchVal_itemname").val('');

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';
		
		currentIncomingReturnDetailPage = 1;
		performIncomingReturnDetailDBSearch({ fromDate, toDate, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeIncomingReturnDetailItemsPerPage = function(newItemsPerPage) {
		incomingReturnDetailItemsPerPage = newItemsPerPage;
		currentIncomingReturnDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderIncomingReturnDetailTableData();
		renderIncomingReturnDetailPagination();
		updateIncomingReturnDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportIncomingReturnDetailData = function() {
		return {
			total: filteredData_incomingReturnDetail.length,
			currentPage: currentIncomingReturnDetailPage,
			itemsPerPage: incomingReturnDetailItemsPerPage,
			data: filteredData_incomingReturnDetail
		};
	}

	//삭제
	$(document).on("click", ".btnIncomingReturnDetailDelete", function() {
		const iidList = [];
		$(".incomingReturnDetail_chk:checked").each(function() {
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
			url: "/deleteIncomingReturn",
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
							} else if (item.failReason === 'INBOUND AND OUTBOUND') {
								message += `- Incoming And Location Time Different\n${item.barcode}\n`;
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
				performIncomingReturnDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.incomingReturnDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});


	// 관리자용 삭제
	$(document).on("click", ".btnAdminIncomingReturnDetailDelete", function() {
		const iidList = [];
		$(".incomingReturnDetail_chk:checked").each(function() {
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
			url: "/deleteIncomingReturn",
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
					performIncomingReturnDetailDBSearch(searchVal);

					// 전체 선택 해제
					$('.incomingReturnDetail_chkAll').prop('checked', false);
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


	$(document).on("click", ".btnIntfIncomingReturnDetailCancel", function() {

		if ($(".incomingReturnDetail_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}

		const iidList = [];
		$(".incomingReturnDetail_chk:checked").each(function() {
			let iid = $(this).data('unique');
			iidList.push(iid);
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

		console.log(iidList)
		$.ajax({
			url: "/incomingReturn_confirm_summary_cancel",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performIncomingReturnDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.incomingReturnDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});
});

// 전체 데이터 엑셀 다운로드
window.downloadAllIncomingReturnDetailData = function() {
	showLoading("export");

	const processedData = filteredData_incomingReturnDetail.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting'),
			PURCHASETYPE: item.CUSTCODE === '0039'
				? i18n.t('search.type.free')
				: i18n.t('search.type.normal')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.incomingReturnDetailColumns, {
		fileName: 'incomingReturnDetail_All',
		sheetName: 'incomingReturnDetail'
	});

	hideLoading();
};
