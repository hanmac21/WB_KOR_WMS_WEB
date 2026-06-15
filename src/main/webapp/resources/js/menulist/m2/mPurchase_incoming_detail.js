/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_incomingDetail = [];
let globalIncomingDetailData = [];
let currentIncomingDetailPage = 1;
let incomingDetailItemsPerPage = 100;
let totalIncomingDetailCount = 0;
let totalIncomingDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredIncomingDetailData = [];
	window.incomingDetailColumns = [
		{ key: 'INTF_YN', header: 'status' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'OITEMCODE', header: 'spec' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' },
		{ key: 'INVOICENO', header: 'invoiceno' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'time' },
		{ key: 'BARCODE', header: 'barcode' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_incomingDetail = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		performIncomingDetailDBSearch({ storage, toDate, fromDate });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performIncomingDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_incomingDetail",
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
				filteredData_incomingDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentIncomingDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_incomingDetail').length) {
					renderIncomingDetailView();
				} else {
					renderIncomingDetailTableData();
					renderIncomingDetailPagination();
					updateIncomingDetailTotalCount();
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
		incomingDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalIncomingDetailCount = filteredData_incomingDetail.length;
		totalIncomingDetailPages = Math.ceil(totalIncomingDetailCount / incomingDetailItemsPerPage);

		const startIndex = (currentIncomingDetailPage - 1) * incomingDetailItemsPerPage;
		const endIndex = startIndex + incomingDetailItemsPerPage;

		globalIncomingDetailData = filteredData_incomingDetail.slice(startIndex, endIndex);
		window.filteredIncomingDetailData = globalIncomingDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_incomingDetail.sort((a, b) => {
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

		currentIncomingDetailPage = 1;
		applyClientPagination();

		renderIncomingDetailTableData();
		renderIncomingDetailPagination();
		updateIncomingDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderIncomingDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminIncomingDelete"/>
	            <input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfIncomingDetailDelete"/>
	        `;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_incomingDetail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row m2_3_1">
						    <div class="search-label">
                                <div class="search_inboundCondition">${i18n.t('search.inbound.status')}<!-- 입고상태 --></div>
                                <select id="incomingDetail_searchVal_condition" >
                                    <option value="">${i18n.t('search.all')}<!-- 전체 --></option>
                                    <option value="N">${i18n.t('search.input.waiting')}<!-- 입고 대기중 --></option>
                                    <option value="Y">${i18n.t('search.input.completed')}<!-- 입고 완료 --></option>
                                </select>
                            </div>
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
								<input type="date" id="incomingDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="incomingDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}</div>
								<select id="incomingDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_cname">${i18n.t('search.suppliername')}<!-- CNAME --></div>
								<input type="text" id="incomingDetail_searchVal_cname" />
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}</div>
								<input type="text" id="incomingDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="incomingDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}</div>
								<input type="text" id="incomingDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="incomingDetail_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="search_invoice_no">${i18n.t('search.invoiceNo')}</div>
								<input type="text" id="incomingDetail_searchVal_invoice_no" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">DELETED</div>
								<select id="incomingDetail_searchVal_useyn" >
									<option value="Y">N</option>
									<option value="N">Y</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnIncomingDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnIncomingDetailSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="incomingDetailTotalCount">${totalIncomingDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="incomingDetailCurrentPageInfo">${currentIncomingDetailPage}</strong>/<strong id="incomingDetailTotalPageInfo">${totalIncomingDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="incomingDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="btnInterfaceCommon btnIncomingDetailItemsArea" style="margin-left:24px;">
                                <select id = "incomingDetailSupplier">
                                </select>
                                <button class="btn btn-success" id="incomingDetailChangeBtn" onclick="">Change</button>
                            </div>
							<div class="action-buttons-right mPurchase_incomingDetail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnIncomingDelete"/>
									<button class="btn btn-success" id="incomingDetailExcelBtn" onclick="downloadAllIncomingDetailData()">Excel</button>
								</div>
							</div>
							
						</div>
						<table class="data-table mPurchase_incomingDetail" id="incomingDetailTable">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="incoming_chkAll" />
									</th>
									<th class='noVal'>${i18n.t('table.no')}</th>
									<th class='statusVal' data-sort="STATUS">${i18n.t('table.status')}</th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}</th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}</th>
									<th class='cnameVal' data-sort="CNAME">${i18n.t('search.suppliername')}<!-- CNAME --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}</th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
									<th class='cnameVal' data-sort="OITEMCODE">${i18n.t('search.customercode')}</th>
									<th class='itemnameMedVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
									<th class='invoiceNoVal' data-sort="INVOICENO">${i18n.t('search.invoiceNo')}</th>
									<th class='loginidVal' data-sort="LOGINID">${i18n.t('search.user')}</th>
									<th class='hhmmVal' data-sort="HHMM">${i18n.t('table.time')}</th>
									<th class='barcodeVal' data-sort="BARCODE">${i18n.t('search.barcode')}</th>
								</tr>
							</thead>
							<tbody id="incomingDetailDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="incomingDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="incomingDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="incomingDetail_itemsPerPage" class="items-per-page-select">
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
		$("#incomingDetail_searchVal_toDate").val(toDate);
		$("#incomingDetail_searchVal_fromDate").val(fromDate);
		$("#incomingDetail_itemsPerPage").val(incomingDetailItemsPerPage);

		// 공급사 데이터 가져오기
		selectSupplier();
		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderIncomingDetailTableData();
		// 페이지네이션 렌더링
		renderIncomingDetailPagination();
		// 이벤트 바인딩
		bindIncomingDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateIncomingDetailTotalCount();
	}
    function selectSupplier() {
    	$.ajax({
    		url: "/selectSupplier",
    		type: "POST",
    		contentType: "application/json",
    		success: function(data) {
    			console.log("-- select Supplier --");
    			console.log(data);
    			let $select = $("#incomingDetailSupplier");
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
		const storage = $('#incomingDetail_searchVal_storage');
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

	function updateIncomingDetailTotalCount() {
		$(".incomingDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#incomingDetailTotalCount').text(Number(totalIncomingDetailCount).toLocaleString());
		$('#incomingDetailCurrentPageInfo').text(currentIncomingDetailPage);
		$('#incomingDetailTotalPageInfo').text(totalIncomingDetailPages);
	}

	function renderIncomingDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalIncomingDetailData.length; i++) {
			let rowNumber = (currentIncomingDetailPage - 1) * incomingDetailItemsPerPage + i + 1;
			let data = globalIncomingDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';

			let ymdhms = data.YMDHMS || '';
			let hhmm = ymdhms.substring(8, 10) + ":" + ymdhms.substring(10, 12);

			tableBody += `
				<tr>
					<td class='checkboxVal'><input type="checkbox" class="incoming_chk ${statusClass} row-checkbox" 
						data-global-index="${i}" data-filtered-index="${i}" 
						data-chk-inboundbar="${data.BARCODE || ''}" 
						data-chk-meskey="${data.MESKEY || ''}"
	        			data-delete="${data.IID}|${data.SDATE}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}|${data.MESKEY || ''}">
					</td>
					<td class='noVal'>${rowNumber}</td>
				    <td class="statusVal"><span class="${statusClass}">${statusText}</span></td>
					<td class='dateVal'>${data.SDATE || ''}</td>
					<td class='storageVal'>${data.STORAGE || ''}</td>
					<td class='cnameVal'>${data.CUSTNAME || ''}</td>
					<td class='carVal'>${data.CAR || ''}</td>
					<td class='itemcodeVal'>${data.ITEMCODE || ''}</td>
					<td class='cnameVal'>${data.OITEMCODE || ''}</td>
					<td class='itemnameMedVal'>${data.ITEMNAME || ''}</td>
					<td class='qtyVal'>${Number(data.QTY || 0).toLocaleString()}</td>
					<td class='invoiceNoVal'>${data.INVOICENO || ''}</td>
					<td class='loginidVal'>${data.LOGINID || ''}</td>
					<td class='hhmmVal'>${hhmm || ''}</td>
					<td class='barcodeVal'>${data.BARCODE || ''}</td>
	            </tr>
			`;
		}

		$("#incomingDetailDetailTableBody").html(tableBody);
	}

	function renderIncomingDetailPagination() {
		let paginationHtml = "";

		if (currentIncomingDetailPage > 1) {
			paginationHtml += `<button class="incomingDetail-page-btn" data-page="${currentIncomingDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="incomingDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentIncomingDetailPage - 5);
		let endPage = Math.min(totalIncomingDetailPages, currentIncomingDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="incomingDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentIncomingDetailPage) {
				paginationHtml += `<button class="incomingDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="incomingDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalIncomingDetailPages) {
			if (endPage < totalIncomingDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="incomingDetail-page-btn" data-page="${totalIncomingDetailPages}">${totalIncomingDetailPages}</button>`;
		}

		if (currentIncomingDetailPage < totalIncomingDetailPages) {
			paginationHtml += `<button class="incomingDetail-page-btn" data-page="${currentIncomingDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="incomingDetail-page-btn disabled">&gt;</button>`;
		}

		$("#incomingDetailPaginationContainer").html(paginationHtml);
	}

	function bindIncomingDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.incoming_chkAll').on('change', '.incoming_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.incoming_chk').prop('checked', isChecked);
		});

		$(".btnIncomingDetailSearch").off('click').on('click', function() {
			performIncomingDetailSearch();
		});

		$(".btnIncomingDetailSearchInit").off('click').on('click', function() {
			resetIncomingDetailSearch();
		});

		$('#incomingDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeIncomingDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.incomingDetail-page-btn').on('click', '.incomingDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentIncomingDetailPage = page;
					applyClientPagination();
					renderIncomingDetailTableData();
					renderIncomingDetailPagination();
					updateIncomingDetailTotalCount();
				}
			}
		});

		$('#incomingDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_incomingDetail input[type="text"], #view_mPurchase_incomingDetail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performIncomingDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
		    inboundCondition: $("#incomingDetail_searchVal_condition").val(),
			fromDate: $("#incomingDetail_searchVal_fromDate").val(),
			toDate: $("#incomingDetail_searchVal_toDate").val(),
			useyn: $("#incomingDetail_searchVal_useyn").val(),
			storage: $("#incomingDetail_searchVal_storage").val(),
			cname: $("#incomingDetail_searchVal_cname").val().trim().toUpperCase(),
			car: $("#incomingDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#incomingDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#incomingDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#incomingDetail_searchVal_itemname").val().trim().toUpperCase(),
			invoice_no: $("#incomingDetail_searchVal_invoice_no").val().trim().toUpperCase(),
		};
	}

	function performIncomingDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentIncomingDetailPage = 1;
		performIncomingDetailDBSearch(searchCriteria);
	}

	function resetIncomingDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		$("#incomingDetail_searchVal_condition").val('');
		$("#incomingDetail_searchVal_fromDate").val(fromDate);
		$("#incomingDetail_searchVal_toDate").val(toDate);
		$("#incomingDetail_searchVal_useyn").val('Y');
		$("#incomingDetail_searchVal_cname").val('');
		$("#incomingDetail_searchVal_car").val('');
		$("#incomingDetail_searchVal_itemcode").val('');
		$("#incomingDetail_searchVal_oitemcode").val('');
		$("#incomingDetail_searchVal_itemname").val('');
		$("#incomingDetail_searchVal_invoice_no").val('');

		renderFactoryStorage();
		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'all';

		currentIncomingDetailPage = 1;
		performIncomingDetailDBSearch({ storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeIncomingDetailItemsPerPage = function(newItemsPerPage) {
		incomingDetailItemsPerPage = newItemsPerPage;
		currentIncomingDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderIncomingDetailTableData();
		renderIncomingDetailPagination();
		updateIncomingDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportIncomingDetailData = function() {
		return {
			total: filteredData_incomingDetail.length,
			currentPage: currentIncomingDetailPage,
			itemsPerPage: incomingDetailItemsPerPage,
			data: filteredData_incomingDetail
		};
	}

	//삭제
	$(document).on("click", ".btnIncomingDelete", function() {
		const iidList = [];
		$(".incoming_chk:checked").each(function() {
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
			url: "/deleteIncoming",
			type: "POST",
			data: JSON.stringify({
				iidList: iidList,
				loginid: loginid,
				admin: false
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
				performIncomingDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.incoming_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}
		});
	});

	// 관리자용 삭제
	$(document).on("click", ".btnAdminIncomingDelete", function() {
		const iidList = [];
		$(".incoming_chk:checked").each(function() {
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
			url: "/deleteIncoming",
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

					// 재조회
					let searchVal = getCurrentSearchCriteria();
					performIncomingDetailDBSearch(searchVal);

					// 전체 선택 해제
					$('.incoming_chkAll').prop('checked', false);
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
	
	//공급사 업데이트
	$(document).on("click", "#incomingDetailChangeBtn", function() {
		// if ($(".incoming_chk.status-completed:checked").length > 0) {
		// 	alert(i18n.t('validation.confirm.items'));
		// 	return;
		// }

		const iidList = [];
		$(".incoming_chk:checked").each(function() {
			let deleteVal = $(this).data('delete');
			if (deleteVal) iidList.push(deleteVal);
		});

		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		const data = {
			iidList: iidList,
			supplier: $("#incomingDetailSupplier").val()
		};

		if (confirm("Do you want to register the supplier?")) {
			showLoading("data");
			$.ajax({
				url: "/incommingSupplierUpdate",
				type: "POST",
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function(data) {
					console.log("-- Supplier update --");
					console.log(data);
					alert("Supplier has been changed.");
					let searchVal = getCurrentSearchCriteria();
					performIncomingDetailDBSearch(searchVal);
					$('.incoming_chkAll').prop('checked', false);
				},
				error: function(xhr, status, error) {
					console.error("DB 조회 실패:", error);
					hideLoading();
					alert("Fail");
				}
			});
		}

	});

});

$(document).on("click", ".btnIntfIncomingDetailDelete", function() {

	if ($(".incoming_chk.status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	const iidList = [];
	$(".incoming_chk:checked").each(function() {
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

	$.ajax({
		url: "/inbound_confirm_delete",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			hideLoading();
			let msg = [];

			if (data.magamCnt > 0) msg.push(`closed: ${data.magamCnt} case(s)`);
			if (data.lockCnt > 0) msg.push(`lock: ${data.lockCnt} case(s)`);
			if (data.buyCnt > 0) msg.push(`Purchase confirmed: ${data.buyCnt} case(s)`);
			if (data.laterCnt > 0) msg.push(`Post-processing done: ${data.laterCnt} case(s)`);
			if (data.noExistCnt > 0) msg.push(`No deletable records: ${data.noExistCnt} case(s)`);

			if (msg.length > 0) {
				alert("The following items were not processed:\n" + msg.join("\n"));
			}

			// 재조회
            let searchVal = getCurrentSearchCriteria();
            performIncomingDetailDBSearch(searchVal);

            // 전체 선택 해제
            $('.incoming_chkAll').prop('checked', false);


		},
		error: function(xhr, status, error) {
			hideLoading();
			window.handleAjaxError(xhr, status, error);
		}

	});

});

// 전체 데이터 엑셀 다운로드
window.downloadAllIncomingDetailData = function() {
	showLoading("export");

	const processedData = filteredData_incomingDetail.map(item => {
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

	ExcelExporter.downloadExcel(processedData, window.incomingDetailColumns, {
		fileName: 'incomingDetail_All',
		sheetName: 'incomingDetail'
	});

	hideLoading();
};





// 테이블의 바코드 칸 클릭 이벤트 전메뉴 공통으로 사용
// 모달 열기
$(document).on('click', '.barcodeVal', function(e) {
	// 객체 가져오기
	const sel = window.getSelection && window.getSelection();
	// 조건식 : 선택 영역이 최소 1개 + 선택된 텍스트 길이가 0 보다 커야함 + 선택의 시작 노드가 현재 셀 내부인지 확인
	const hasSelection = sel && sel.rangeCount > 0 && sel.toString().length > 0 && (this.contains(sel.anchorNode) || this === sel.anchorNode);

	if (hasSelection) {
		// 부모 tr 모달 클릭도 막고, 모달 열지 않음
		e.stopPropagation();
		return;
	}

	// ⬇️ 이 한 줄만 추가하면, 다음 1회 showLoading은 스크롤 보존
	window.__preserveScrollNextLoading = true;

	const barcodeValue = $(this).text().trim();

	// TH 내부 클릭이면 리턴
	if ($(this).closest('th').length) return;

	$("#qrcode").empty();

	showLoading("data");


	$.when(
		$.post("/search_stockInfo", { barcode: barcodeValue }),
		$.post("/show_stockHistory", { barcode: barcodeValue })
	).done((stockInfoRes, historyRes) => {
		const stockInfoData = stockInfoRes[0];
		const historyData = historyRes[0];
		let location = "";
		console.log("히스토리 데이터:", stockInfoData);
		if(stockInfoData.LASTSTATUS >= 10 && stockInfoData.LASTSTATUS <= 40){
			location = stockInfoData.LOCATION;
		}
        $('.modal-title-barcode .value').text(barcodeValue);
        $('.modal-title-itemcode .value').text(stockInfoData.SPEC);
        $('.modal-title-itemname .value').text(stockInfoData.ITEMNAME);
        $('.modal-title-location .value').text(location ?? '');

		renderModal(historyData);

		$("#qrcode").empty();
		new QRCode(document.getElementById("qrcode"), { text: barcodeValue, width: 200, height: 200 });

		$("#qrAndHistoryModal").css("display", "flex");
	}).fail((xhr) => {
		console.error(xhr);
	}).always(() => {
		hideLoading();
	});
});

//히스토리 모달 렌더링
async function renderModal(data) {
	const modalHistoryDiv = document.getElementById('modalHistoryDiv');
	modalHistoryDiv.innerHTML = '';
	$('.modal-data').remove();		//251229 로케이션현황에서 모달창을 켜고 LOT HISTORY모달창을 켤때 이전 데이터가 남아있는 현상 수정
	if (!data || data.length === 0) {
		// 빈 상태 표시
		modalHistoryDiv.innerHTML = `
	        <div class="empty-state">
	            <div class="empty-state-icon">📋</div>
	            <div class="empty-state-text">There is no history</div>
	        </div>
	    `;
	} else {
		// 히스토리 카드들 생성
		let historyHtml = '';
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			const sequenceNumber = data.length - i;

			let checkBarcode = item.BARCODE.charAt(0);  // 첫 번째 글자
			let checkBarcodeKor = item.BARCODE.split(",")[3];  // 콤마 맨 뒤 값 (SCMMEX)
			let checkBarcodeMex = item.BARCODE.split(",")[4];  // 콤마 맨 뒤 값 (WMSMEX)

			// 수량 포맷팅
			let qtyFormatted = '-';
			if (item.QTY) {
				const num = Number(item.QTY);
				qtyFormatted = Number.isInteger(num)
					? num.toLocaleString()
					: num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
			}

			// 공통 필드: 날짜/시간, 수량
			historyHtml += `<div class="history-card">`
			if (item.KIND === 'PALLET') {

				console.log("ENTER 5")
				console.log(checkBarcode + " -- " + checkBarcodeKor);
				if (checkBarcode !== "P") {
					console.log("ENTER 1")
					return;
				} else {
					console.log("ENTER 2")
					if (checkBarcodeKor === "SCMMEX") {
						console.log("ENTER 3")
						historyHtml += `
			                <div class="history-header korBackground">
								<span class = "quantity-badge">${sequenceNumber} </span>
			                    <span>${item.KIND}</span>
			                </div>
		               `
					} else if (checkBarcodeKor === "WMSUSA") {
						historyHtml += `
			                <div class="history-header usaBackground">
								<span class = "quantity-badge">${sequenceNumber} </span>
			                    <span>${item.KIND}</span>
			                </div>
		               `
					} else {
						console.log("ENTER 4")
						historyHtml += `
			                <div class="history-header mexBackground">
								<span class = "quantity-badge">${sequenceNumber} </span>
			                    <span>${item.KIND}</span>
			                </div>
		               `
					}
				}
			} else if (item.KIND === 'BARCODE' || item.KIND === 'PALLET_BARCODE' || item.KIND === 'PALLET_BARCODE_INCLUDE') {
				console.log("ENTER 6")
				console.log(checkBarcode + " -- " + checkBarcodeKor + "--" + checkBarcodeMex);
				if (checkBarcodeMex === "WMSMEX") {
					historyHtml += `
			                <div class="history-header mexBackground">
								<span class = "quantity-badge">${sequenceNumber} </span>
			                    <span>${item.KIND}</span>
			                </div>
		               `
				} else if (checkBarcodeMex === "WMSUSA") {
					historyHtml += `
			                <div class="history-header usaBackground">
								<span class = "quantity-badge">${sequenceNumber} </span>
			                    <span>${item.KIND}</span>
			                </div>
		               `
				} else {
					historyHtml += `
			                <div class="history-header korBackground">
								<span class = "quantity-badge">${sequenceNumber} </span>
			                    <span>${item.KIND}</span>
			                </div>
		               `
				}
			} else {
				console.log("ENTER 7")
				historyHtml += `
	                <div class="history-header">
						<span class = "quantity-badge">${sequenceNumber} </span>
	                    <span>${item.KIND}</span>
	                </div>
               `
			}
			historyHtml += `
	                <div class="history-items">
	                    <div class="history-item">
	                        <div class="item-detail">
	                            <div class="detail-label">${i18n.t('table.date')}</div>
	                            <div class="detail-value">${item.SDATE || '-'}</div>
	                        </div>
	                        <div class="item-detail">
	                            <div class="detail-label">${i18n.t('table.worktime')}</div>
	                            <div class="detail-value">${item.TIME || '-'}</div>
	                        </div>
	                        <div class="item-detail">
	                            <div class="detail-label">${i18n.t('search.qty')}</div>
	                            <div class="detail-value">${qtyFormatted}</div>
	                        </div>`;
			if (item.KIND === 'PALLET' && checkBarcode === "P" && checkBarcodeKor === "SCMMEX") {
				try {
					const data = await $.ajax({
						url: "/show_stockHistory_sangho",
						type: "POST",
						data: {
							custCode: item.CUSTCODE
						}
					});

					historyHtml += `
						<div class="item-detail">
				            <div class="detail-label">${i18n.t('search.factory')}</div>
				                <div class="detail-value">
				                <span class="detail-value">KOREA - ${data.CU_SANGHO}</span>
				            </div>
				        </div>
			    `;
				} catch (error) {
					console.error("CUSTNAME NOT FOUND:", error);
				}

			} else {
				historyHtml += `
                        <div class="item-detail">
                            <div class="detail-label">${i18n.t('search.factory')}</div>
                            <div class="detail-value">
                                <span class="detail-value">${item.FACTORY || '-'}</span>
                            </div>
                        </div>
                    `;
			}
			// kind 값에 따라 추가 필드 표시
			if (item.KIND && (item.KIND.includes('WIP') || item.KIND.includes('LOCATION'))) {
				// location 필드 추가
				if (item.LOCATION) {
					historyHtml += `
	                    <div class="item-detail">
	                        <div class="detail-label">${i18n.t('search.location')}</div>
	                        <div class="detail-value">${item.LOCATION}</div>
	                    </div>`;
				}
				// 작업장 필드 추가
				if (item.WORK && item.WORK !== ' ') {
					historyHtml += `
	                    <div class="item-detail">
	                        <div class="detail-label">${i18n.t('search.wccode')}</div>
	                        <div class="detail-value">${item.WORK}</div>
	                    </div>`;
				}
			}

			if (item.KIND && (item.KIND.includes('BARCODE') || item.KIND.includes('PALLET'))) {
				// location 필드 추가
				if (item.LASTSTATUS) {
					historyHtml += `
	                    <div class="item-detail">
	                        <div class="detail-label">${i18n.t('table.laststatus')}</div>
	                        <div class="detail-value">${item.LASTSTATUS}</div>
	                    </div>`;
				}
			}

			if (item.KIND && (item.KIND.includes('WORKMOVE'))) {
				// work 필드 추가
				if (item.WORK) {
					historyHtml += `
	                    <div class="item-detail">
	                        <div class="detail-label">Work</div>
	                        <div class="detail-value">${item.WORK}</div>
	                    </div>`;
				}
			}

			//*/ 공장간이송 추가
			if (item.KIND == 'FACTORY MOVE SENDING') {
				// factory 필드 추가
				if (item.FACTORY) {
					historyHtml += `
						<div class="item-detail">
							<div class="detail-label">${i18n.t('search.factory')}</div>
							<div class="detail-value">${item.FACTORY}</div>
						</div>`;
				}
			}
			if (item.KIND == 'FACTORY MOVE RECEIVE') {
				// factory 필드 추가
				if (item.FACTORY) {
					historyHtml += `
						<div class="item-detail">
							<div class="detail-label">${i18n.t('search.factory')}</div>
							<div class="detail-value">${item.FACTORY}</div>
						</div>
						<div class="item-detail">
							<div class="detail-label">${i18n.t('search.storage')}</div>
							<div class="detail-value">${item.STORAGE}</div>
						</div>`;
				}
			}

			// LOGINID 필드 추가
			if (item.LOGINID && item.LOGINID != ' ') {
				historyHtml += `
                    <div class="item-detail">
                        <div class="detail-label">${i18n.t('search.user')}</div>
                        <div class="detail-value">${item.LOGINID || '-'}</div>
                    </div>`;
			}

			if (item.KIND && item.KIND.includes('PALLET')) {
				if ((item.PARTBARCODE).split(",").length === 4) {
					historyHtml += `
						<div class="item-detail">
		                    <div class="detail-label">Pallet Barcode</div>
		                    <div class="detail-value">${item.PARTBARCODE}</div>
		                </div>`;
				} else {

					const parts = item.PARTBARCODE.match(/.*?MEX/g) || item.PARTBARCODE.match(/.*?USA/g) || [];

					historyHtml += `
						<div class="item-detail">
		                    <div class="detail-label">Part Barcode</div>
		                    <div class="detail-value">`
					for (j = 0; j < parts.length; j++) {
						historyHtml += `
							<div class="detail-value">${parts[j]}</div>
							`
					}

					historyHtml += `
		                    </div>
		                </div>`;
				}

			}

			if (item.KIND == 'STOCK MOVE' || item.KIND == 'FACTORY MOVE' || item.KIND == 'FACTORY SENDING' || item.KIND == 'FACTORY RECEIVE') {
				const factory = item.FACTORY || '';
				const storage = item.STORAGE || '';
				const custcode = item.CUSTCODE || '';
				const custname = item.CUSTNAME || '';
				historyHtml += `
               	   	<div class="item-detail">
        	            <div class="detail-label">${i18n.t('search.location')}</div>
    	        		<div class="detail-value">${custcode} ${custname} -> ${factory} ${storage}</div>
	            	</div>
	            `
			} else if (item.KIND == 'LOAD') {

				const custcode = item.CUSTCODE || '';
				const storage = item.STORAGE || '';
				try {

					const data = await $.ajax({
						url: "/show_stockHistory_sangho",
						type: "POST",
						data: {
							custCode: custcode
						}
					});

					historyHtml += `
			           	<div class="item-detail">
			            	<div class="detail-label">${i18n.t('search.location')}</div>
			    			<div class="detail-value">${storage} -> ${data.CU_SANGHO || ''}</div>
				       	</div>
				    `
				} catch (error) {
					console.error("CUSTNAME NOT FOUND:", error);
				}

			}
			/*if(item.STORAGE != ' '){
				historyHtml += `
					<div class="item-detail">
						<div class="detail-label">${i18n.t('search.storage')}</div>
						<div class="detail-value">${item.STORAGE}</div>
					</div>
				`
			}*/

			historyHtml += `
           	<div class="item-detail">
	            	<div class="detail-label">${i18n.t('search.memo')}</div>
	    			<div class="detail-value"> ${item.MEMO || ''}</div>
		       	</div>
		    `;
			historyHtml += `
	                    </div>
	                </div>
	            </div>`;
		}
		modalHistoryDiv.innerHTML = historyHtml;
	}
}

// 닫기 버튼 동작
$(document).on("click", ".modal-close", function() {
	$("#qrAndHistoryModal").css("display", "none");
});

// 모달 배경 클릭 시 닫기
$(document).on('click', '#qrAndHistoryModal', function(e) {
	if (e.target === this) $(this).hide();
});