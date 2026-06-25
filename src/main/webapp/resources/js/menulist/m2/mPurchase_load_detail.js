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
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'SPEC', header: 'Supplier Code' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'HHMM', header: 'Time' },
		{ key: 'BARCODE', header: 'Barcode' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_load_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		performLoadDetailDBSearch({ fromDate, toDate });
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
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_load_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="loadDetail_searchVal_fromDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="loadDetail_searchVal_toDate" />
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
							<div class="action-buttons-right mPurchase_load_detail">
								<div id="defaultActions" class="action-group">
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnLoadDetailDelete"/>
									<button class="btn btn-success" id="loadDetailExcelBtn" onclick="downloadAllLoadDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_load_detail" id="loadDetailTable">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="loadDetail_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal" data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "storageVal" data-sort="CUSTNAME">${i18n.t('search.suppliername')}<!-- custname --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "cnameVal" data-sort="SPEC">${i18n.t('search.customercode')}<!-- CCODE --></th>
									<th class = "itemnameMedVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "loginidVal" data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class = "hhmmVal" data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
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

		// 테이블 데이터 렌더링
		renderLoadDetailTableData();
		// 페이지네이션 렌더링
		renderLoadDetailPagination();
		// 이벤트 바인딩
		bindLoadDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateLoadDetailTotalCount();
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

			tableBody += `
				<tr>
				    <td class = "checkboxVal"><input type="checkbox" class="loadDetail_chk" 
		    			data-delete="${data.IID}|${data.SDATE}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}|${data.MESKEY || ''}">
		    		</td>
				    <td class = "noVal">${rowNumber}</td>
		            <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "storageVal">${data.CUSTNAME || data.custname || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "cnameVal">${data.SPEC || data.spec || ''}</td>
					<td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
					<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
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
			fromDate: $("#loadDetail_searchVal_fromDate").val(),
			toDate: $("#loadDetail_searchVal_toDate").val(),
			custname: $("#loadDetail_searchVal_custname").val().trim().toUpperCase(),
			car: $("#loadDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#loadDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#loadDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#loadDetail_searchVal_itemname").val().trim().toUpperCase(),
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
		$("#loadDetail_searchVal_fromDate").val(fromDate);
		$("#loadDetail_searchVal_toDate").val(toDate);
		$("#loadDetail_searchVal_custname").val('');
		$("#loadDetail_searchVal_car").val('');
		$("#loadDetail_searchVal_itemcode").val('');
		$("#loadDetail_searchVal_oitemcode").val('');
		$("#loadDetail_searchVal_itemname").val('');

		currentLoadDetailPage = 1;
		performLoadDetailDBSearch({  toDate, fromDate });

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
});

// 전체 데이터 엑셀 다운로드
window.downloadAllLoadDetailData = function() {
	showLoading("export");

	const processedData = filteredData_loadDetail.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.loadDetailColumns, {
		fileName: 'loadDetail_All',
		sheetName: 'loadDetail'
	});

	hideLoading();
};
