/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_salesLoadDetail = [];
let globalSalesLoadDetailData = [];
let currentSalesLoadDetailPage = 1;
let salesLoadDetailItemsPerPage = 100;
let totalSalesLoadDetailCount = 0;
let totalSalesLoadDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredSalesLoadDetailData = [];
	window.salesLoadDetailColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'SPEC', header: 'Supplier Code' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
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
	window.call_mSales_load_detail = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT';

		performSalesLoadDetailDBSearch({ fromDate, toDate, factory, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesLoadDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_salesLoadDetail",
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
				filteredData_salesLoadDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesLoadDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_load_detail').length) {
					renderSalesLoadDetailView();
				} else {
					renderSalesLoadDetailTableData();
					renderSalesLoadDetailPagination();
					updateSalesLoadDetailTotalCount();
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
		salesLoadDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesLoadDetailCount = filteredData_salesLoadDetail.length;
		totalSalesLoadDetailPages = Math.ceil(totalSalesLoadDetailCount / salesLoadDetailItemsPerPage);

		const startIndex = (currentSalesLoadDetailPage - 1) * salesLoadDetailItemsPerPage;
		const endIndex = startIndex + salesLoadDetailItemsPerPage;

		globalSalesLoadDetailData = filteredData_salesLoadDetail.slice(startIndex, endIndex);
		window.filteredSalesLoadDetailData = globalSalesLoadDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_salesLoadDetail.sort((a, b) => {
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

		currentSalesLoadDetailPage = 1;
		applyClientPagination();

		renderSalesLoadDetailTableData();
		renderSalesLoadDetailPagination();
		updateSalesLoadDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesLoadDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminSalesLoadDetailDelete"/>
	        `;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mSales_load_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="salesLoadDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="salesLoadDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesLoadDetail_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="salesLoadDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_custname salesLoadDetail_label_custname">${i18n.t('search.custname')}<!-- custname --></div>
								<input type="text" id="salesLoadDetail_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="salesLoadDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesLoadDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesLoadDetail_searchVal_itemname" />
							</div>						
							<div class="search-label">
								<div class="searchVal_invoiceNo">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></div>
								<input type="text" id="salesLoadDetail_searchVal_invoiceNo" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSalesLoadDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnSalesLoadDetailSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesLoadDetailTotalCount">${totalSalesLoadDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="salesLoadDetailCurrentPageInfo">${currentSalesLoadDetailPage}</strong>/<strong id="salesLoadDetailTotalPageInfo">${totalSalesLoadDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesLoadDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mSales_load_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnSalesLoadDetailDelete"/>
									<button class="btn btn-success" id="salesLoadDetailExcelBtn" onclick="downloadAllSalesLoadDetailData()">Excel</button>
								</div>
							</div>
							
						</div>
						<table class="data-table mSales_load_detail" id="salesLoadDetailTable">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="salesLoadDetail_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "statusVal_long" data-sort="INTF_YN">${i18n.t('table.status')}</th>
									<th class = "dateVal" data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "factoryVal" data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal" data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "storageVal" data-sort="CUSTNAME">${i18n.t('search.custname')}<!-- custname --></th>
									<th class = "itemcodeVal" data-sort="CUSTCODE">${i18n.t('search.custcode')}<!-- CCODE --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameMedVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "loginidVal" data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class = "loginidVal" data-sort="DOCK">${i18n.t('search.dock')}<!-- DOCK --></th>
									<th class = "loginidVal" data-sort="INVOICENO">${i18n.t('search.invoiceNo')}<!-- INVOICENO --></th>
									<th class = "loginidVal" data-sort="CONTAINER">${i18n.t('search.containerNo')}<!-- CONTAINER --></th>
									<th class = "hhmmVal" data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
									<th class = "typeVal" data-sort="SEQ">${i18n.t('table.seq')}<!-- TYPE --></th>
									<th class = "typeVal" data-sort="TYPE">${i18n.t('search.type')}<!-- TYPE --></th>
									<th class = "barcodeVal transysBarcodeVal" data-sort="BARCODE">${i18n.t('search.barcode')}<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="salesLoadDetailDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesLoadDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="salesLoadDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="salesLoadDetail_itemsPerPage" class="items-per-page-select">
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
		$("#salesLoadDetail_searchVal_toDate").val(toDate);
		$("#salesLoadDetail_searchVal_fromDate").val(fromDate);
		$("#salesLoadDetail_itemsPerPage").val(salesLoadDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSalesLoadDetailTableData();
		// 페이지네이션 렌더링
		renderSalesLoadDetailPagination();
		// 이벤트 바인딩
		bindSalesLoadDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesLoadDetailTotalCount();
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
		const factory = $('#salesLoadDetail_searchVal_factory');
		const storage = $('#salesLoadDetail_searchVal_storage');
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

	function updateSalesLoadDetailTotalCount() {
		$('#salesLoadDetailTotalCount').text(Number(totalSalesLoadDetailCount).toLocaleString());
		$('#salesLoadDetailCurrentPageInfo').text(currentSalesLoadDetailPage);
		$('#salesLoadDetailTotalPageInfo').text(totalSalesLoadDetailPages);
	}

	function renderSalesLoadDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSalesLoadDetailData.length; i++) {
			let rowNumber = (currentSalesLoadDetailPage - 1) * salesLoadDetailItemsPerPage + i + 1;
			let data = globalSalesLoadDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			
			tableBody += `
				<tr>
				    <td class = "checkboxVal"><input type="checkbox" class="salesLoadDetail_chk ${statusClass}" 
		    			data-unique="${data.SDATE}_${data.ITEMCODE}_${data.INTF_YN}_${data.QTY}_${data.FACTORY}_${data.STORAGE}_${data.BARCODE}"
		    			data-delete="${data.IID}_${data.SDATE}_${data.FACTORY}_${data.STORAGE}_${data.BARCODE}">
		    		</td>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = "statusVal_long"><span class="${statusClass}">${statusText}</span></td>
		            <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
					<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
					<td class = "storageVal">${data.CUSTNAME || data.custname || ''}</td>
					<td class = "itemcodeVal">${data.SPEC || data.spec || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
					<td class = "loginidVal">${data.DOCK || data.dock || ''}</td>
					<td class = "loginidVal">${data.INVOICENO || data.invoiceno || ''}</td>
					<td class = "loginidVal">${data.CONTAINER || data.container || ''}</td>
					<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
					<td class = "typeVal">${data.SEQ || data.seq || ''}</td>
					<td class = "typeVal">${data.TYPE || data.type || ''}</td>
					<td class = "barcodeVal transysBarcodeVal">${data.BARCODE || data.barcode || ''}</td>
		        </tr>
			`;
		}

		$("#salesLoadDetailDetailTableBody").html(tableBody);
		$(".salesLoadDetail_chkAll").prop("checked", false);
	}

	function renderSalesLoadDetailPagination() {
		let paginationHtml = "";

		if (currentSalesLoadDetailPage > 1) {
			paginationHtml += `<button class="salesLoadDetail-page-btn" data-page="${currentSalesLoadDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesLoadDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesLoadDetailPage - 5);
		let endPage = Math.min(totalSalesLoadDetailPages, currentSalesLoadDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesLoadDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesLoadDetailPage) {
				paginationHtml += `<button class="salesLoadDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesLoadDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesLoadDetailPages) {
			if (endPage < totalSalesLoadDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesLoadDetail-page-btn" data-page="${totalSalesLoadDetailPages}">${totalSalesLoadDetailPages}</button>`;
		}

		if (currentSalesLoadDetailPage < totalSalesLoadDetailPages) {
			paginationHtml += `<button class="salesLoadDetail-page-btn" data-page="${currentSalesLoadDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesLoadDetail-page-btn disabled">&gt;</button>`;
		}

		$("#salesLoadDetailPaginationContainer").html(paginationHtml);
	}

	function bindSalesLoadDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.salesLoadDetail_chkAll').on('change', '.salesLoadDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.salesLoadDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.salesLoadDetail_chk').on('change', '.salesLoadDetail_chk', function() {
			let totalCheckboxes = $('.salesLoadDetail_chk').length;
			let checkedCheckboxes = $('.salesLoadDetail_chk:checked').length;
			$('.salesLoadDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnSalesLoadDetailSearch").off('click').on('click', function() {
			performSalesLoadDetailSearch();
		});

		$(".btnSalesLoadDetailSearchInit").off('click').on('click', function() {
			resetSalesLoadDetailSearch();
		});

		$('#salesLoadDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesLoadDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.salesLoadDetail-page-btn').on('click', '.salesLoadDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesLoadDetailPage = page;
					applyClientPagination();
					renderSalesLoadDetailTableData();
					renderSalesLoadDetailPagination();
					updateSalesLoadDetailTotalCount();
				}
			}
		});

		$('#salesLoadDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mSales_load_detail input[type="text"], #view_mSales_load_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesLoadDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#salesLoadDetail_searchVal_fromDate").val(),
			toDate: $("#salesLoadDetail_searchVal_toDate").val(),
			factory: $("#salesLoadDetail_searchVal_factory").val(),
			storage: $("#salesLoadDetail_searchVal_storage").val(),
			custname: $("#salesLoadDetail_searchVal_custname").val().trim().toUpperCase(),
			car: $("#salesLoadDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#salesLoadDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesLoadDetail_searchVal_itemname").val().trim().toUpperCase(),
			invoiceNo: $("#salesLoadDetail_searchVal_invoiceNo").val().trim().toUpperCase()
		};
	}

	function performSalesLoadDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesLoadDetailPage = 1;
		performSalesLoadDetailDBSearch(searchCriteria);
	}

	function resetSalesLoadDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
		const storage = 'PRODUCT'
		renderFactoryStorage();
		$("#salesLoadDetail_searchVal_fromDate").val(fromDate);
		$("#salesLoadDetail_searchVal_toDate").val(toDate);
		$("#salesLoadDetail_searchVal_custname").val('');
		$("#salesLoadDetail_searchVal_car").val('');
		$("#salesLoadDetail_searchVal_itemcode").val('');
		$("#salesLoadDetail_searchVal_itemname").val('');
		$("#salesLoadDetail_searchVal_invoiceNo").val('');

		currentSalesLoadDetailPage = 1;
		performSalesLoadDetailDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".salesLoadDetailTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeSalesLoadDetailItemsPerPage = function(newItemsPerPage) {
		salesLoadDetailItemsPerPage = newItemsPerPage;
		currentSalesLoadDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesLoadDetailTableData();
		renderSalesLoadDetailPagination();
		updateSalesLoadDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSalesLoadDetailData = function() {
		return {
			total: filteredData_salesLoadDetail.length,
			currentPage: currentSalesLoadDetailPage,
			itemsPerPage: salesLoadDetailItemsPerPage,
			data: filteredData_salesLoadDetail
		};
	}


	//삭제
	$(document).on("click", ".btnSalesLoadDetailDelete", function() {
		if ($(".salesLoadDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items.delete'));
			// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
			return;
		}

		const iidList = [];
		$(".salesLoadDetail_chk:checked").each(function() {
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
				performSalesLoadDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.salesLoadDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});


	// 관리자용 삭제
	$(document).on("click", ".btnAdminSalesLoadDetailDelete", function() {
		if ($(".salesLoadDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items.delete'));
			// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
			return;
		}

		const iidList = [];
		$(".salesLoadDetail_chk:checked").each(function() {
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
					performSalesLoadDetailDBSearch(searchVal);

					// 전체 선택 해제
					$('.salesLoadDetail_chkAll').prop('checked', false);
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

});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesLoadDetailData = function() {
	showLoading("export");

	const processedData = filteredData_salesLoadDetail.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.salesLoadDetailColumns, {
		fileName: 'salesLoadDetail_All',
		sheetName: 'salesLoadDetail'
	});

	hideLoading();
};
