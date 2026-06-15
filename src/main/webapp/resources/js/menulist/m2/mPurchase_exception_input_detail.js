/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_exceptionInputDetail = [];
let globalExceptionInputDetailData = [];
let currentExceptionInputDetailPage = 1;
let exceptionInputDetailItemsPerPage = 100;
let totalExceptionInputDetailCount = 0;
let totalExceptionInputDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredExceptionInputDetailData = [];
	window.exceptionInputDetailColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'INTF_YN', header: 'Status' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },       
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'OITEMCODE', header: 'Spec' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'HHMM', header: 'Time' },
		{ key: 'BARCODE', header: 'Barcode' },
		{ key: 'SOURCE2', header: 'Type' },	
		{ key: 'INVOICENO', header: 'Memo' },
		{ key: 'SOURCE2', header: 'Type' },
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_exception_input_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		performExceptionInputDetailDBSearch({ fromDate, toDate, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performExceptionInputDetailDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_exceptionInputDetail",
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
				filteredData_exceptionInputDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentExceptionInputDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_exception_input_detail').length) {
					renderExceptionInputDetailView();
				} else {
					renderExceptionInputDetailTableData();
					renderExceptionInputDetailPagination();
					updateExceptionInputDetailTotalCount();
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
		exceptionInputDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalExceptionInputDetailCount = filteredData_exceptionInputDetail.length;
		totalExceptionInputDetailPages = Math.ceil(totalExceptionInputDetailCount / exceptionInputDetailItemsPerPage);

		const startIndex = (currentExceptionInputDetailPage - 1) * exceptionInputDetailItemsPerPage;
		const endIndex = startIndex + exceptionInputDetailItemsPerPage;

		globalExceptionInputDetailData = filteredData_exceptionInputDetail.slice(startIndex, endIndex);
		window.filteredExceptionInputDetailData = globalExceptionInputDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_exceptionInputDetail.sort((a, b) => {
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

		currentExceptionInputDetailPage = 1;
		applyClientPagination();

		renderExceptionInputDetailTableData();
		renderExceptionInputDetailPagination();
		updateExceptionInputDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderExceptionInputDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		let intfBtnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminExceptionInputDetailDelete"/>
	        `;
			intfBtnHtml = `				
				<div class="btnInterfaceCommon btnExceptionInputDetailItemsArea" style="margin-left:24px;">
					<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfExceptionInputDetail"/>
					<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfExceptionInputDetailDelete"/>
				</div>
			`;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_exception_input_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="exceptionInputDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="exceptionInputDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="exceptionInputDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="exceptionInputDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="exceptionInputDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="exceptionInputDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="exceptionInputDetail_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_source">${i18n.t('search.type')}<!-- TYPE --></div>
								<select id="exceptionInputDetail_searchVal_source" >
									<option value="all">${i18n.t('search.all')}</option>
									<option value="EXCEPTION">EXCEPTION</option>
									<option value="STOCKCOUNT">STOCKCOUNT</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnExceptionInputDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnExceptionInputDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="exceptionInputDetailTotalCount">${totalExceptionInputDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="exceptionInputDetailCurrentPageInfo">${currentExceptionInputDetailPage}</strong>/<strong id="exceptionInputDetailTotalPageInfo">${totalExceptionInputDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="exceptionInputDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_exception_input_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnExceptionInputDetailDelete"/>
									<button class="btn btn-success" id="exceptionInputDetailExcelBtn" onclick="downloadAllExceptionInputDetailData()">Excel</button>
								</div>
							</div>
							${intfBtnHtml}
						</div>
						<table class="data-table mPurchase_exception_input_detail" id="exceptionInputDetailTable">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="exceptionInputDetail_chkAll" />
									</th>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='statusVal' data-sort="STATUS">${i18n.t('table.status')}</th>
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
									<th class="cnameVal" data-sort="SOURCE2">${i18n.t('search.type')}<!-- TYPE --></th>
									<th class="memoVal" data-sort="INVOICENO">${i18n.t('search.memo')}<!-- memo --></th>
								</tr>
							</thead>
							<tbody id="exceptionInputDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="exceptionInputDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="exceptionInputDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="exceptionInputDetail_itemsPerPage" class="items-per-page-select">
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
		$("#exceptionInputDetail_searchVal_fromDate").val(fromDate);
		$("#exceptionInputDetail_searchVal_toDate").val(toDate);
		$("#exceptionInputDetail_itemsPerPage").val(exceptionInputDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderExceptionInputDetailTableData();
		// 페이지네이션 렌더링
		renderExceptionInputDetailPagination();
		// 이벤트 바인딩
		bindExceptionInputDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateExceptionInputDetailTotalCount();
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
		const storage = $('#exceptionInputDetail_searchVal_storage');
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

	function updateExceptionInputDetailTotalCount() {
		$(".exceptionInputDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#exceptionInputDetailTotalCount').text(Number(totalExceptionInputDetailCount).toLocaleString());
		$('#exceptionInputDetailCurrentPageInfo').text(currentExceptionInputDetailPage);
		$('#exceptionInputDetailTotalPageInfo').text(totalExceptionInputDetailPages);
	}

	function renderExceptionInputDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalExceptionInputDetailData.length; i++) {
			let rowNumber = (currentExceptionInputDetailPage - 1) * exceptionInputDetailItemsPerPage + i + 1;
			let data = globalExceptionInputDetailData[i];

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
				     <td class = "checkboxVal"><input type="checkbox" class="exceptionInputDetail_chk ${statusClass}" 
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
					<td class = 'cnameVal'>${source2}</td>
					<td class = "memoVal">
					    <span class="memoText" title="${data.INVOICENO || data.invoiceno || ''}">
					    	${data.INVOICENO || data.invoiceno || ''}
					    </span>
					</td>
				</tr>
			`;
		}

		$("#exceptionInputDetailTableBody").html(tableBody);
		$('.exceptionInputDetail_chkAll').prop('checked', false);
	}

	function renderExceptionInputDetailPagination() {
		let paginationHtml = "";

		if (currentExceptionInputDetailPage > 1) {
			paginationHtml += `<button class="exceptionInputDetail-page-btn" data-page="${currentExceptionInputDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="exceptionInputDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentExceptionInputDetailPage - 5);
		let endPage = Math.min(totalExceptionInputDetailPages, currentExceptionInputDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="exceptionInputDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentExceptionInputDetailPage) {
				paginationHtml += `<button class="exceptionInputDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="exceptionInputDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalExceptionInputDetailPages) {
			if (endPage < totalExceptionInputDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="exceptionInputDetail-page-btn" data-page="${totalExceptionInputDetailPages}">${totalExceptionInputDetailPages}</button>`;
		}

		if (currentExceptionInputDetailPage < totalExceptionInputDetailPages) {
			paginationHtml += `<button class="exceptionInputDetail-page-btn" data-page="${currentExceptionInputDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="exceptionInputDetail-page-btn disabled">&gt;</button>`;
		}

		$("#exceptionInputDetailPaginationContainer").html(paginationHtml);
	}

	function bindExceptionInputDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.exceptionInputDetail_chkAll').on('change', '.exceptionInputDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.exceptionInputDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.exceptionInputDetail_chk').on('change', '.exceptionInputDetail_chk', function() {
			let totalCheckboxes = $('.exceptionInputDetail_chk').length;
			let checkedCheckboxes = $('.exceptionInputDetail_chk:checked').length;
			$('.exceptionInputDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnExceptionInputDetailSearch").off('click').on('click', function() {
			performExceptionInputDetailSearch();
		});

		$(".btnExceptionInputDetailSearchInit").off('click').on('click', function() {
			resetExceptionInputDetailSearch();
		});

		$('#exceptionInputDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeExceptionInputDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.exceptionInputDetail-page-btn').on('click', '.exceptionInputDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentExceptionInputDetailPage = page;
					applyClientPagination();
					renderExceptionInputDetailTableData();
					renderExceptionInputDetailPagination();
					updateExceptionInputDetailTotalCount();
				}
			}
		});

		$('#exceptionInputDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_exception_input_detail input[type="text"], #view_mPurchase_exception_input_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performExceptionInputDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#exceptionInputDetail_searchVal_fromDate").val(),
			toDate: $("#exceptionInputDetail_searchVal_toDate").val(),
			storage: $("#exceptionInputDetail_searchVal_storage").val(),
			car: $("#exceptionInputDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#exceptionInputDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#exceptionInputDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#exceptionInputDetail_searchVal_itemname").val().trim().toUpperCase(),
			source: $("#exceptionInputDetail_searchVal_source").val().trim().toUpperCase()
		};
	}

	function performExceptionInputDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentExceptionInputDetailPage = 1;
		performExceptionInputDetailDBSearch(searchCriteria);
	}

	function resetExceptionInputDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#exceptionInputDetail_searchVal_fromDate").val(fromDate);
		$("#exceptionInputDetail_searchVal_toDate").val(toDate);
		$("#exceptionInputDetail_searchVal_car").val('');
		$("#exceptionInputDetail_searchVal_itemcode").val('');
		$("#exceptionInputDetail_searchVal_oitemcode").val('');
		$("#exceptionInputDetail_searchVal_itemname").val('');
		$("#exceptionInputDetail_searchVal_source").val('all');

		const storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND';
		
		currentExceptionInputDetailPage = 1;
		performExceptionInputDetailDBSearch({ fromDate, toDate, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeExceptionInputDetailItemsPerPage = function(newItemsPerPage) {
		exceptionInputDetailItemsPerPage = newItemsPerPage;
		currentExceptionInputDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderExceptionInputDetailTableData();
		renderExceptionInputDetailPagination();
		updateExceptionInputDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportExceptionInputDetailData = function() {
		return {
			total: filteredData_exceptionInputDetail.length,
			currentPage: currentExceptionInputDetailPage,
			itemsPerPage: exceptionInputDetailItemsPerPage,
			data: filteredData_exceptionInputDetail
		};
	}

	// 삭제
	$(document).on("click", ".btnExceptionInputDetailDelete", function() {
		const iidList = [];
		$(".exceptionInputDetail_chk:checked").each(function() {
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
			url: "/deleteExceptionInput",
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
				performExceptionInputDetailDBSearch(searchVal);	
				
				// 전체 선택 해제
				$('.exceptionInputDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});


	// 관리자용 삭제
	$(document).on("click", ".btnAdminExceptionInputDetailDelete", function() {
		const iidList = [];
		$(".exceptionInputDetail_chk:checked").each(function() {
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
			url: "/deleteExceptionInput",
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
					performExceptionInputDetailDBSearch(searchVal);	
					
					// 전체 선택 해제
					$('.exceptionInputDetail_chkAll').prop('checked', false);
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
	$(document).on("click", ".btnIntfExceptionInputDetail", function() {		
		if ($(".exceptionInputDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}
		
		const iidList = [];
		$(".exceptionInputDetail_chk:checked").each(function() {
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
			url: "/exceptionInput_confirm_summary",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performExceptionInputDetailDBSearch(searchVal);	
				
				// 전체 선택 해제
				$('.exceptionInputDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});

	$(document).on("click", ".btnIntfExceptionInputDetailDelete", function() {

		if ($(".exceptionInputDetail_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}
		
		const iidList = [];
		$(".exceptionInputDetail_chk:checked").each(function() {
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
			url: "/exceptionInput_confirm_summary_cancel",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performExceptionInputDetailDBSearch(searchVal);	
				
				// 전체 선택 해제
				$('.exceptionInputDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});

});

// 전체 데이터 엑셀 다운로드
window.downloadAllExceptionInputDetailData = function() {
	showLoading("export");

	const processedData = filteredData_exceptionInputDetail.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.exceptionInputDetailColumns, {
		fileName: 'exceptionInputDetail_All',
		sheetName: 'exceptionInputDetail'
	});

	hideLoading();
};
