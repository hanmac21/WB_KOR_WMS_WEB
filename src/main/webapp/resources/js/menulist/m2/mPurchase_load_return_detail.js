/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_loadReturnDetail = [];
let globalLoadReturnDetailData = [];
let currentLoadReturnDetailPage = 1;
let loadReturnDetailItemsPerPage = 100;
let totalLoadReturnDetailCount = 0;
let totalLoadReturnDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredLoadReturnDetailData = [];
	window.loadReturnDetailColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'Supplier Code' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'HHMM', header: 'hhmm' },
		{ key: 'TYPE', header: 'type' },
		{ key: 'BARCODE', header: 'lot' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_load_return_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		performLoadReturnDetailDBSearch({ fromDate, toDate, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performLoadReturnDetailDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_loadReturnDetail",
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
				filteredData_loadReturnDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentLoadReturnDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_load_return_detail').length) {
					renderLoadReturnDetailView();
				} else {
					renderLoadReturnDetailTableData();
					renderLoadReturnDetailPagination();
					updateLoadReturnDetailTotalCount();
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
		loadReturnDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalLoadReturnDetailCount = filteredData_loadReturnDetail.length;
		totalLoadReturnDetailPages = Math.ceil(totalLoadReturnDetailCount / loadReturnDetailItemsPerPage);

		const startIndex = (currentLoadReturnDetailPage - 1) * loadReturnDetailItemsPerPage;
		const endIndex = startIndex + loadReturnDetailItemsPerPage;

		globalLoadReturnDetailData = filteredData_loadReturnDetail.slice(startIndex, endIndex);
		window.filteredLoadReturnDetailData = globalLoadReturnDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_loadReturnDetail.sort((a, b) => {
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

		currentLoadReturnDetailPage = 1;
		applyClientPagination();

		renderLoadReturnDetailTableData();
		renderLoadReturnDetailPagination();
		updateLoadReturnDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderLoadReturnDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		let intfBtnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminLoadReturnDetailDelete"/>
	        `;
			intfBtnHtml = `
				<div class="btnInterfaceCommon btnLoadReturnDetailItemsArea" style="margin-left:24px;">
					<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfLoadReturnDetailDelete"/>
				</div>
			`;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_load_return_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="loadReturnDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="loadReturnDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="loadReturnDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.suppliername')}<!-- custname --></div>
								<input type="text" id="loadReturnDetail_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="loadReturnDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="loadReturnDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="loadReturnDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="loadReturnDetail_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnLoadReturnDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnLoadReturnDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="loadReturnDetailTotalCount">${totalLoadReturnDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="loadReturnDetailCurrentPageInfo">${currentLoadReturnDetailPage}</strong>/<strong id="loadReturnDetailTotalPageInfo">${totalLoadReturnDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="loadReturnDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="btnInterfaceCommon btnLoadReturnDetailItemsArea" style="margin-left:24px;">
								<select id = "loadReturnDetailCustomer">
								</select>
								<button class="btn btn-success" id="loadReturnDetailChangeBtn">Change</button>
							</div>
							<div class="action-buttons-right mPurchase_load_return_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnLoadReturnDetailDelete"/>
									<button class="btn btn-success" id="loadReturnDetailExcelBtn" onclick="downloadAllLoadReturnDetailData()">Excel</button>
								</div>
							</div>
							${intfBtnHtml}
						</div>
						<table class="data-table mPurchase_load_return_detail" id="loadReturnDetailTable">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="loadReturnDetail_chkAll" />
									</th>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='statusVal' data-sort="STATUS">${i18n.t('table.status')}</th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class='itemcodeVal' data-sort="CUSTNAME">${i18n.t('search.suppliername')}<!-- custname --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class="cnameVal" data-sort="SPEC">${i18n.t('search.customercode')}<!-- CCODE --></th>
									<th class='itemnameVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class='loginidVal' data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class='hhmmVal' data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
									<th class="typeVal" data-sort="TYPE">${i18n.t('search.type')}<!-- TYPE --></th>
									<th class='barcodeVal transysBarcodeVal' data-sort="BARCODE">${i18n.t('search.barcode')}<!-- BARCODE --></th>
								</tr>
							</thead>
							<tbody id="loadReturnDetailDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="loadReturnDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="loadReturnDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="loadReturnDetail_itemsPerPage" class="items-per-page-select">
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
		$("#loadReturnDetail_searchVal_fromDate").val(fromDate);
		$("#loadReturnDetail_searchVal_toDate").val(toDate);
		$("#loadReturnDetail_itemsPerPage").val(loadReturnDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderLoadReturnDetailTableData();
		// 페이지네이션 렌더링
		renderLoadReturnDetailPagination();
		// 이벤트 바인딩
		bindLoadReturnDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateLoadReturnDetailTotalCount();
		// 고객사 목록 로드
		selectCustomer();
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
		const storage = $('#loadReturnDetail_searchVal_storage');
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

	function selectCustomer() {
		$.ajax({
			url: "/selectCustomer",
			type: "POST",
			contentType: "application/json",
			success: function(data) {
				console.log("-- select Customer --");
				console.log(data);
				let $select = $("#loadReturnDetailCustomer");
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

	function updateLoadReturnDetailTotalCount() {
		$(".loadReturnDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#loadReturnDetailTotalCount').text(Number(totalLoadReturnDetailCount).toLocaleString());
		$('#loadReturnDetailCurrentPageInfo').text(currentLoadReturnDetailPage);
		$('#loadReturnDetailTotalPageInfo').text(totalLoadReturnDetailPages);
	}

	function renderLoadReturnDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalLoadReturnDetailData.length; i++) {
			let rowNumber = (currentLoadReturnDetailPage - 1) * loadReturnDetailItemsPerPage + i + 1;
			let data = globalLoadReturnDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			
			tableBody += `
				<tr>
				     <td class = "checkboxVal"><input type="checkbox" class="loadReturnDetail_chk ${statusClass}" 
	        			data-unique="${data.SDATE}|${data.ITEMCODE}|${data.INTF_YN}|${data.QTY}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}|${data.MES_KEY}"
	        			data-delete="${data.IID}|${data.SDATE}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}|${data.MES_KEY || ''}">
	        		</td>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
					<td class = 'itemcodeVal'>${data.CUSTNAME || data.custname || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "cnameVal">${data.SPEC || data.spec || ''}</td>
				    <td class = 'itemnameVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = 'loginidVal'>${data.LOGINID || data.loginid || ''}</td>
					<td class = 'hhmmVal'>${data.HHMM || data.hhmm || ''}</td>
					<td class = "typeVal">${data.TYPE || data.type || ''}</td>
					<td class = 'barcodeVal transysBarcodeVal'>${data.BARCODE || data.barcode || ''}</td>
				</tr>
			`;
		}

		$("#loadReturnDetailDetailTableBody").html(tableBody);
		$('.loadReturnDetail_chkAll').prop('checked', false);
	}

	function renderLoadReturnDetailPagination() {
		let paginationHtml = "";

		if (currentLoadReturnDetailPage > 1) {
			paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="${currentLoadReturnDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="loadReturnDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentLoadReturnDetailPage - 5);
		let endPage = Math.min(totalLoadReturnDetailPages, currentLoadReturnDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentLoadReturnDetailPage) {
				paginationHtml += `<button class="loadReturnDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalLoadReturnDetailPages) {
			if (endPage < totalLoadReturnDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="${totalLoadReturnDetailPages}">${totalLoadReturnDetailPages}</button>`;
		}

		if (currentLoadReturnDetailPage < totalLoadReturnDetailPages) {
			paginationHtml += `<button class="loadReturnDetail-page-btn" data-page="${currentLoadReturnDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="loadReturnDetail-page-btn disabled">&gt;</button>`;
		}

		$("#loadReturnDetailPaginationContainer").html(paginationHtml);
	}

	function bindLoadReturnDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.loadReturnDetail_chkAll').on('change', '.loadReturnDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.loadReturnDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.loadReturnDetail_chk').on('change', '.loadReturnDetail_chk', function() {
			let totalCheckboxes = $('.loadReturnDetail_chk').length;
			let checkedCheckboxes = $('.loadReturnDetail_chk:checked').length;
			$('.loadReturnDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnLoadReturnDetailSearch").off('click').on('click', function() {
			performLoadReturnDetailSearch();
		});

		$(".btnLoadReturnDetailSearchInit").off('click').on('click', function() {
			resetLoadReturnDetailSearch();
		});

		$('#loadReturnDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeLoadReturnDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.loadReturnDetail-page-btn').on('click', '.loadReturnDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentLoadReturnDetailPage = page;
					applyClientPagination();
					renderLoadReturnDetailTableData();
					renderLoadReturnDetailPagination();
					updateLoadReturnDetailTotalCount();
				}
			}
		});

		$('#loadReturnDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_load_return_detail input[type="text"], #view_mPurchase_load_return_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performLoadReturnDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#loadReturnDetail_searchVal_fromDate").val(),
			toDate: $("#loadReturnDetail_searchVal_toDate").val(),
			storage: $("#loadReturnDetail_searchVal_storage").val(),
			custname: $("#loadReturnDetail_searchVal_custname").val().trim().toUpperCase(),
			car: $("#loadReturnDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#loadReturnDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#loadReturnDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#loadReturnDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performLoadReturnDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentLoadReturnDetailPage = 1;
		performLoadReturnDetailDBSearch(searchCriteria);
	}

	function resetLoadReturnDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#loadReturnDetail_searchVal_fromDate").val(fromDate);
		$("#loadReturnDetail_searchVal_toDate").val(toDate);
		$("#loadReturnDetail_searchVal_custname").val('');
		$("#loadReturnDetail_searchVal_car").val('');
		$("#loadReturnDetail_searchVal_itemcode").val('');
		$("#loadReturnDetail_searchVal_oitemcode").val('');
		$("#loadReturnDetail_searchVal_itemname").val('');

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		currentLoadReturnDetailPage = 1;
		performLoadReturnDetailDBSearch({ fromDate, toDate,  storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeLoadReturnDetailItemsPerPage = function(newItemsPerPage) {
		loadReturnDetailItemsPerPage = newItemsPerPage;
		currentLoadReturnDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderLoadReturnDetailTableData();
		renderLoadReturnDetailPagination();
		updateLoadReturnDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportLoadReturnDetailData = function() {
		return {
			total: filteredData_loadReturnDetail.length,
			currentPage: currentLoadReturnDetailPage,
			itemsPerPage: loadReturnDetailItemsPerPage,
			data: filteredData_loadReturnDetail
		};
	}

	//거래처 업데이트
	$(document).on("click", "#loadReturnDetailChangeBtn", function() {
		/*if ($(".loadReturnDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}*/

		const iidList = [];
		$(".loadReturnDetail_chk:checked").each(function() {
			let iid = $(this).data('delete');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		data = {
			iidList: iidList,
			supplier: $("#loadReturnDetailCustomer").val()
		}

		if (confirm("Do you want to register the customer?")) {
			showLoading("data");
			$.ajax({
				url: "/loadReturnCustomerUpdate",
				type: "POST",
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(data) {
					if (data && data.locked) {
						alert(i18n.t('warning.locked'));
						hideLoading();
						return;
					}
					console.log("-- load update --");
					console.log(data);
					let searchVal = getCurrentSearchCriteria();
					performLoadReturnDetailDBSearch(searchVal);
					hideLoading();
				},
				error: function(xhr, status, error) {
					// ❌ alert(res.message) <- res 없음 (버그)
					window.handleAjaxError(xhr, status, error);
				}

			});
		}
	});

	//삭제
	$(document).on("click", ".btnLoadReturnDetailDelete", function() {
		const iidList = [];
		$(".loadReturnDetail_chk:checked").each(function() {
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
			url: "/deleteLoadReturn",
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
							} else if (item.failReason === 'LOAD AND OUTBOUND') {
								message += `- Load And Location Time Different\n${item.barcode}\n`;
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
				performLoadReturnDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.loadReturnDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});


	// 관리자용 삭제
	$(document).on("click", ".btnAdminLoadReturnDetailDelete", function() {
		const iidList = [];
		$(".loadReturnDetail_chk:checked").each(function() {
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
			url: "/deleteLoadReturn",
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
			        performLoadReturnDetailDBSearch(searchVal);
			        
			        // 전체 선택 해제
			        $('.loadReturnDetail_chkAll').prop('checked', false);
				} else {
			        alert("삭제에 실패했습니다.");				
				}
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});
	
	$(document).on("click", ".btnIntfLoadReturnDetailDelete", function() {

		if ($(".loadReturnDetail_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}

		let hasUndefined = false;

		const iidList = [];
		$(".loadReturnDetail_chk:checked").each(function() {
			let iid = $(this).data('unique');
			
			/*if (!iid || iid.split("_")[2] === 'undefined') {
				alert("Customer Code is Empty");
				hasUndefined = true;
				return false; // 🔹 each 반복 중단
			}*/
			iidList.push(iid);
		});
		console.log(iidList);
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

		$.ajax({
			url: "/loadreturn_confirm_detail_cancel",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let msg = [];

				let searchVal = getCurrentSearchCriteria();
				performLoadReturnDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.loadReturnDetail_chkAll').prop('checked', false);

			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});
});

// 전체 데이터 엑셀 다운로드
window.downloadAllLoadReturnDetailData = function() {
	showLoading("export");

	const processedData = filteredData_loadReturnDetail.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.loadReturnDetailColumns, {
		fileName: 'loadReturnDetail_All',
		sheetName: 'loadReturnDetail'
	});

	hideLoading();
};
