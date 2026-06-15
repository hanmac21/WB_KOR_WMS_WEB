/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_exceptionOutputDetail = [];
let globalExceptionOutputDetailData = [];
let currentExceptionOutputDetailPage = 1;
let exceptionOutputDetailItemsPerPage = 100;
let totalExceptionOutputDetailCount = 0;
let totalExceptionOutputDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredExceptionOutputDetailData = [];
	window.exceptionOutputDetailColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'INTF_YN', header: 'Status' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },      
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'OITEMCODE', header: 'Spec' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'HHMM', header: 'Time' },
		{ key: 'BARCODE', header: 'Barcode' },
		{ key: 'SOURCE2', header: 'Type' },
		{ key: 'INVOICENO', header: 'Memo' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_exception_output_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		performExceptionOutputDetailDBSearch({ fromDate, toDate,  storage });
	};
	
	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performExceptionOutputDetailDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_exceptionOutputDetail",
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
				filteredData_exceptionOutputDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentExceptionOutputDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_exception_output_detail').length) {
					renderExceptionOutputDetailView();
				} else {
					renderExceptionOutputDetailTableData();
					renderExceptionOutputDetailPagination();
					updateExceptionOutputDetailTotalCount();
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
		exceptionOutputDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalExceptionOutputDetailCount = filteredData_exceptionOutputDetail.length;
		totalExceptionOutputDetailPages = Math.ceil(totalExceptionOutputDetailCount / exceptionOutputDetailItemsPerPage);

		const startIndex = (currentExceptionOutputDetailPage - 1) * exceptionOutputDetailItemsPerPage;
		const endIndex = startIndex + exceptionOutputDetailItemsPerPage;

		globalExceptionOutputDetailData = filteredData_exceptionOutputDetail.slice(startIndex, endIndex);
		window.filteredExceptionOutputDetailData = globalExceptionOutputDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_exceptionOutputDetail.sort((a, b) => {
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

		currentExceptionOutputDetailPage = 1;
		applyClientPagination();

		renderExceptionOutputDetailTableData();
		renderExceptionOutputDetailPagination();
		updateExceptionOutputDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderExceptionOutputDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		let intfBtnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminExceptionOutputDetailDelete"/>
	        `;
			intfBtnHtml = `				
				<div class="btnInterfaceCommon btnExceptionOutputDetailItemsArea" style="margin-left:24px;">
					<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfExceptionOutputDetail"/>
					<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfExceptionOutputDetailDelete"/>
				</div>
			`;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_exception_output_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="exceptionOutputDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="exceptionOutputDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="exceptionOutputDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="exceptionOutputDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="exceptionOutputDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="exceptionOutputDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="exceptionOutputDetail_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_source">${i18n.t('search.type')}<!-- TYPE --></div>
								<select id="exceptionOutputDetail_searchVal_source" >
									<option value="all">${i18n.t('search.all')}</option>
									<option value="EXCEPTION">EXCEPTION</option>
									<option value="STOCKCOUNT">STOCKCOUNT</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnExceptionOutputDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnExceptionOutputDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="exceptionOutputDetailTotalCount">${totalExceptionOutputDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="exceptionOutputDetailCurrentPageInfo">${currentExceptionOutputDetailPage}</strong>/<strong id="exceptionOutputDetailTotalPageInfo">${totalExceptionOutputDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="exceptionOutputDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_exception_output_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnExceptionOutputDetailDelete"/>
									<button class="btn btn-success" id="exceptionOutputDetailExcelBtn" onclick="downloadAllExceptionOutputDetailData()">Excel</button>
								</div>
							</div>
							${intfBtnHtml}
						</div>
						<table class="data-table mPurchase_exception_output_detail" id="exceptionOutputDetailTable">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="exceptionOutputDetail_chkAll" />
									</th>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='statusVal' data-sort="STATUS">${i18n.t('table.status')}<!-- STATUS --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='cnameVal' data-sort="OITEMCODE">${i18n.t('search.customercode')}<!-- ITEMCODE --></th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class='loginidVal' data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class='hhmmVal' data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
									<th class='barcodeVal' data-sort="BARCODE">${i18n.t('search.barcode')}<!-- BARCODE --></th>
									<th class="invoiceNoVal" data-sort="SOURCE2">${i18n.t('search.type')}<!-- TYPE --></th>
									<th class="memoVal" data-sort="INVOICENO">${i18n.t('search.memo')}<!-- memo --></th>
								</tr>
							</thead>
							<tbody id="exceptionOutputDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="exceptionOutputDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="exceptionOutputDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="exceptionOutputDetail_itemsPerPage" class="items-per-page-select">
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
		$("#exceptionOutputDetail_searchVal_fromDate").val(fromDate);
		$("#exceptionOutputDetail_searchVal_toDate").val(toDate);
		$("#exceptionOutputDetail_itemsPerPage").val(exceptionOutputDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderExceptionOutputDetailTableData();
		// 페이지네이션 렌더링
		renderExceptionOutputDetailPagination();
		// 이벤트 바인딩
		bindExceptionOutputDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateExceptionOutputDetailTotalCount();
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
		const storage = $('#exceptionOutputDetail_searchVal_storage');
		const savedStorage = getCookie('selectedStorage');

		storage.empty();

		let storageList = ['INBOUND', 'PRODUCT', 'OUTSIDE', 'all'];

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

	function updateExceptionOutputDetailTotalCount() {
		$(".exceptionOutputDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#exceptionOutputDetailTotalCount').text(Number(totalExceptionOutputDetailCount).toLocaleString());
		$('#exceptionOutputDetailCurrentPageInfo').text(currentExceptionOutputDetailPage);
		$('#exceptionOutputDetailTotalPageInfo').text(totalExceptionOutputDetailPages);
	}

	function renderExceptionOutputDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalExceptionOutputDetailData.length; i++) {
			let rowNumber = (currentExceptionOutputDetailPage - 1) * exceptionOutputDetailItemsPerPage + i + 1;
			let data = globalExceptionOutputDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			
			let source2 = "";
			// source2 값 코드 -> 사유 변환
			if(data.SOURCE2 === "EX01"){
				source2 = i18n.t('reason.ex01')
			}else if(data.SOURCE2 === "EX02"){
				source2 = i18n.t('reason.ex02')
			}else if(data.SOURCE2 === "EX03"){
				source2 = i18n.t('reason.ex03')
			}else if(data.SOURCE2 === "EX04"){
				source2 = i18n.t('reason.ex04')
			}else if(data.SOURCE2 === "EX05"){
				source2 = i18n.t('reason.ex05')
			}else if(data.SOURCE2 === "EX06"){
				source2 = i18n.t('reason.ex06')
			}else if(data.SOURCE2 === "EX07"){
				source2 = i18n.t('reason.ex07')
			}else{
				source2 = data.SOURCE2
			}
			
			tableBody += `
				<tr>
				     <td class = "checkboxVal"><input type="checkbox" class="exceptionOutputDetail_chk ${statusClass}" 
	        			data-unique="${data.SDATE}|${data.ITEMCODE}|${data.INTF_YN}|${data.QTY}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}|${data.MES_KEY}"
	        			data-delete="${data.IID}|${data.SDATE}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}">
	        		</td>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'cnameVal'>${data.OITEMCODE || data.oitemcode || ''}</td>
				    <td class = 'itemnameLongVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = 'qtyVal'>${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = 'loginidVal'>${data.LOGINID || data.loginid || ''}</td>
					<td class = 'hhmmVal'>${data.HHMM || data.hhmm || ''}</td>
					<td class = 'barcodeVal'>${data.BARCODE || data.barcode || ''}</td>
					<td class = 'invoiceNoVal'>${source2}</td>
					<td class = "memoVal">
					    <span class="memoText" title="${data.INVOICENO || data.invoiceno || ''}">
					    	${data.INVOICENO || data.invoiceno || ''}
					    </span>
					</td>
				</tr>
			`;
		}

		$("#exceptionOutputDetailTableBody").html(tableBody);
		$('.exceptionOutputDetail_chkAll').prop('checked', false);
	}

	function renderExceptionOutputDetailPagination() {
		let paginationHtml = "";

		if (currentExceptionOutputDetailPage > 1) {
			paginationHtml += `<button class="exceptionOutputDetail-page-btn" data-page="${currentExceptionOutputDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="exceptionOutputDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentExceptionOutputDetailPage - 5);
		let endPage = Math.min(totalExceptionOutputDetailPages, currentExceptionOutputDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="exceptionOutputDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentExceptionOutputDetailPage) {
				paginationHtml += `<button class="exceptionOutputDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="exceptionOutputDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalExceptionOutputDetailPages) {
			if (endPage < totalExceptionOutputDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="exceptionOutputDetail-page-btn" data-page="${totalExceptionOutputDetailPages}">${totalExceptionOutputDetailPages}</button>`;
		}

		if (currentExceptionOutputDetailPage < totalExceptionOutputDetailPages) {
			paginationHtml += `<button class="exceptionOutputDetail-page-btn" data-page="${currentExceptionOutputDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="exceptionOutputDetail-page-btn disabled">&gt;</button>`;
		}

		$("#exceptionOutputDetailPaginationContainer").html(paginationHtml);
	}

	function bindExceptionOutputDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.exceptionOutputDetail_chkAll').on('change', '.exceptionOutputDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.exceptionOutputDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.exceptionOutputDetail_chk').on('change', '.exceptionOutputDetail_chk', function() {
			let totalCheckboxes = $('.exceptionOutputDetail_chk').length;
			let checkedCheckboxes = $('.exceptionOutputDetail_chk:checked').length;
			$('.exceptionOutputDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnExceptionOutputDetailSearch").off('click').on('click', function() {
			performExceptionOutputDetailSearch();
		});

		$(".btnExceptionOutputDetailSearchInit").off('click').on('click', function() {
			resetExceptionOutputDetailSearch();
		});

		$('#exceptionOutputDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeExceptionOutputDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.exceptionOutputDetail-page-btn').on('click', '.exceptionOutputDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentExceptionOutputDetailPage = page;
					applyClientPagination();
					renderExceptionOutputDetailTableData();
					renderExceptionOutputDetailPagination();
					updateExceptionOutputDetailTotalCount();
				}
			}
		});

		$('#exceptionOutputDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_exception_output_detail input[type="text"], #view_mPurchase_exception_output_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performExceptionOutputDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#exceptionOutputDetail_searchVal_fromDate").val(),
			toDate: $("#exceptionOutputDetail_searchVal_toDate").val(),
			storage: $("#exceptionOutputDetail_searchVal_storage").val(),
			car: $("#exceptionOutputDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#exceptionOutputDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#exceptionOutputDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#exceptionOutputDetail_searchVal_itemname").val().trim().toUpperCase(),
			source: $("#exceptionOutputDetail_searchVal_source").val().trim().toUpperCase()
		};
	}

	function performExceptionOutputDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentExceptionOutputDetailPage = 1;
		performExceptionOutputDetailDBSearch(searchCriteria);
	}

	function resetExceptionOutputDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#exceptionOutputDetail_searchVal_fromDate").val(fromDate);
		$("#exceptionOutputDetail_searchVal_toDate").val(toDate);
		$("#exceptionOutputDetail_searchVal_car").val('');
		$("#exceptionOutputDetail_searchVal_itemcode").val('');
		$("#exceptionOutputDetail_searchVal_oitemcode").val('');
		$("#exceptionOutputDetail_searchVal_itemname").val('');
		$("#exceptionOutputDetail_searchVal_source").val('all');

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';
		
		currentExceptionOutputDetailPage = 1;
		performExceptionOutputDetailDBSearch({ fromDate, toDate, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeExceptionOutputDetailItemsPerPage = function(newItemsPerPage) {
		exceptionOutputDetailItemsPerPage = newItemsPerPage;
		currentExceptionOutputDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderExceptionOutputDetailTableData();
		renderExceptionOutputDetailPagination();
		updateExceptionOutputDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportExceptionOutputDetailData = function() {
		return {
			total: filteredData_exceptionOutputDetail.length,
			currentPage: currentExceptionOutputDetailPage,
			itemsPerPage: exceptionOutputDetailItemsPerPage,
			data: filteredData_exceptionOutputDetail
		};
	}

	// 삭제
	$(document).on("click", ".btnExceptionOutputDetailDelete", function() {
		const iidList = [];
		$(".exceptionOutputDetail_chk:checked").each(function() {
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
			url: "/deleteExceptionOutput",
			type: "POST",
			data: JSON.stringify({
				iidList : iidList,
				loginid : loginid
			}),
			contentType: "application/json",
			success: function(data) {
	            if (!data.success) {
	                hideLoading();
	                
	                let message = "";
	                
	                // 검증 실패
	                if (data.failList && data.failList.length > 0){
	                	message = "Some items cannot be deleted\n\n"; // 삭제할 수 없는 항목이 있습니다.
	                    
	                    data.failList.forEach(function(item) {
	                    	if (item.failReason === 'INVALID_KIND'){
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
	                else if (data.failReason === 'DELETE_FAILED'){
	                	message = "Failed to delete\n\n";
	                	message += `Operation: ${data.failedOperation}\n`;
	                	message += `Barcode: ${data.failedBarcode}\n\n`;	
	                }   
	                
	                
	                alert(message);
	                return;
	            }
				
				let searchVal = getCurrentSearchCriteria();
				performExceptionOutputDetailDBSearch(searchVal);	
				
				// 전체 선택 해제
				$('.exceptionOutputDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});


	// 관리자용 삭제
	$(document).on("click", ".btnAdminExceptionOutputDetailDelete", function() {
		const iidList = [];
		$(".exceptionOutputDetail_chk:checked").each(function() {
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
			url: "/deleteExceptionOutput",
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
					performExceptionOutputDetailDBSearch(searchVal);	
					
					// 전체 선택 해제
					$('.exceptionOutputDetail_chkAll').prop('checked', false);
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



	//인터페이스
	$(document).on("click", ".btnIntfExceptionOutputDetail", function() {		
		if ($(".exceptionOutputDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}
		
		const iidList = [];
		$(".exceptionOutputDetail_chk:checked").each(function() {
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
			url: "/exceptionOutput_confirm_summary",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performExceptionOutputDetailDBSearch(searchVal);	
				
				// 전체 선택 해제
				$('.exceptionOutputDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});

	$(document).on("click", ".btnIntfExceptionOutputDetailDelete", function() {

		if ($(".exceptionOutputDetail_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}
		
		const iidList = [];
		$(".exceptionOutputDetail_chk:checked").each(function() {
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
			url: "/exceptionOutput_confirm_summary_cancel",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performExceptionOutputDetailDBSearch(searchVal);	
				
				// 전체 선택 해제
				$('.exceptionOutputDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});

});

// 전체 데이터 엑셀 다운로드
window.downloadAllExceptionOutputDetailData = function() {
	showLoading("export");

	const processedData = filteredData_exceptionOutputDetail.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.exceptionOutputDetailColumns, {
		fileName: 'exceptionOutputDetail_All',
		sheetName: 'exceptionOutputDetail'
	});

	hideLoading();
};
