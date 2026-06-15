/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_conditionChange = [];
let globalConditionChangeData = [];
let currentConditionChangePage = 1;
let conditionChangeItemsPerPage = 100;
let totalConditionChangeCount = 0;
let totalConditionChangePages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredConditionChangeData = [];
	window.conditionChangeColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },       
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'OITEMCODE', header: 'Spec' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'OLDOKYN', header: 'Before' },
		{ key: 'NEWOKYN', header: 'After' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'HHMM', header: 'Time' },
		{ key: 'BARCODE', header: 'Barcode' },
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mQuality_conditionChange_list = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		performConditionChangeDBSearch({ fromDate, toDate });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performConditionChangeDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_conditionChange",
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
				filteredData_conditionChange = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentConditionChangePage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mQuality_conditionChange_list').length) {
					renderConditionChangeView();
				} else {
					renderConditionChangeTableData();
					renderConditionChangePagination();
					updateConditionChangeTotalCount();
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
		conditionChangeItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalConditionChangeCount = filteredData_conditionChange.length;
		totalConditionChangePages = Math.ceil(totalConditionChangeCount / conditionChangeItemsPerPage);

		const startIndex = (currentConditionChangePage - 1) * conditionChangeItemsPerPage;
		const endIndex = startIndex + conditionChangeItemsPerPage;

		globalConditionChangeData = filteredData_conditionChange.slice(startIndex, endIndex);
		window.filteredConditionChangeData = globalConditionChangeData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_conditionChange.sort((a, b) => {
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

		currentConditionChangePage = 1;
		applyClientPagination();

		renderConditionChangeTableData();
		renderConditionChangePagination();
		updateConditionChangeTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderConditionChangeView() {
		let content_output = `
			<div class="divBlockControl" id="view_mQuality_conditionChange_list">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="conditionChange_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="conditionChange_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="conditionChange_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="conditionChange_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="conditionChange_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="conditionChange_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnConditionChangeSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnConditionChangeSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="conditionChangeTotalCount">${totalConditionChangeCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="conditionChangeCurrentPageInfo">${currentConditionChangePage}</strong>/<strong id="conditionChangeTotalPageInfo">${totalConditionChangePages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="conditionChangeTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mQuality_conditionChange_list">
								<div id="defaultActions" class="action-group">
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnConditionChangeDelete"/>
									<button class="btn btn-success" id="conditionChangeExcelBtn" onclick="downloadAllConditionChangeData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mQuality_conditionChange_list" id="conditionChangeTable">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="conditionChange_chkAll" />
									</th>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='cnameVal' data-sort="OITEMCODE">${i18n.t('search.customercode')}<!-- OITEMCODE --></th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='carVal' data-sort="OLDOKYN">${i18n.t('search.before')}<!-- BEFORE --></th>
									<th class='carVal' data-sort="NEWOKYN">${i18n.t('search.after')}<!-- AFTER --></th>
									<th class='loginidVal' data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class='hhmmVal' data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
									<th class='barcodeVal' data-sort="BARCODE">${i18n.t('search.barcode')}<!-- BARCODE --></th>
								</tr>
							</thead>
							<tbody id="conditionChangeTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="conditionChangePaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="conditionChange_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="conditionChange_itemsPerPage" class="items-per-page-select">
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
		$("#conditionChange_searchVal_fromDate").val(fromDate);
		$("#conditionChange_searchVal_toDate").val(toDate);
		$("#conditionChange_itemsPerPage").val(conditionChangeItemsPerPage);

		// 테이블 데이터 렌더링
		renderConditionChangeTableData();
		// 페이지네이션 렌더링
		renderConditionChangePagination();
		// 이벤트 바인딩
		bindConditionChangeEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateConditionChangeTotalCount();
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

	function updateConditionChangeTotalCount() {
		$(".conditionChangeTotalQty").text(Number(totalQty).toLocaleString());
		$('#conditionChangeTotalCount').text(Number(totalConditionChangeCount).toLocaleString());
		$('#conditionChangeCurrentPageInfo').text(currentConditionChangePage);
		$('#conditionChangeTotalPageInfo').text(totalConditionChangePages);
	}

	function renderConditionChangeTableData() {
		let tableBody = "";

		for (let i = 0; i < globalConditionChangeData.length; i++) {
			let rowNumber = (currentConditionChangePage - 1) * conditionChangeItemsPerPage + i + 1;
			let data = globalConditionChangeData[i];

			let oldokyn = data.OLDOKYN === "Y" ? "OK" : "NG";
			let newokyn = data.NEWOKYN === "Y" ? "OK" : "NG";

			tableBody += `
				<tr>
				     <td class = "checkboxVal"><input type="checkbox" class="conditionChange_chk" 
	        			data-delete="${data.IID}|${data.SDATE}|${data.FACTORY}|${data.STORAGE}|${data.BARCODE}">
	        		</td>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'storageVal'>${data.STORAGE || data.storage || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'cnameVal'>${data.OITEMCODE || data.oitemcode || ''}</td>
				    <td class = 'itemnameLongVal'>${data.ITEMNAME || data.itemname || ''}</td>
					<td class = 'carVal'>${oldokyn}</td>
					<td class = 'carVal'>${newokyn}</td>
					<td class = 'loginidVal'>${data.LOGINID || data.loginid || ''}</td>
					<td class = 'hhmmVal'>${data.HHMM || data.hhmm || ''}</td>
					<td class = 'barcodeVal'>${data.BARCODE || data.barcode || ''}</td>
				</tr>
			`;
		}

		$("#conditionChangeTableBody").html(tableBody);
		$('.conditionChange_chkAll').prop('checked', false);
	}

	function renderConditionChangePagination() {
		let paginationHtml = "";

		if (currentConditionChangePage > 1) {
			paginationHtml += `<button class="conditionChange-page-btn" data-page="${currentConditionChangePage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="conditionChange-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentConditionChangePage - 5);
		let endPage = Math.min(totalConditionChangePages, currentConditionChangePage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="conditionChange-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentConditionChangePage) {
				paginationHtml += `<button class="conditionChange-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="conditionChange-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalConditionChangePages) {
			if (endPage < totalConditionChangePages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="conditionChange-page-btn" data-page="${totalConditionChangePages}">${totalConditionChangePages}</button>`;
		}

		if (currentConditionChangePage < totalConditionChangePages) {
			paginationHtml += `<button class="conditionChange-page-btn" data-page="${currentConditionChangePage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="conditionChange-page-btn disabled">&gt;</button>`;
		}

		$("#conditionChangePaginationContainer").html(paginationHtml);
	}

	function bindConditionChangeEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.conditionChange_chkAll').on('change', '.conditionChange_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.conditionChange_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.conditionChange_chk').on('change', '.conditionChange_chk', function() {
			let totalCheckboxes = $('.conditionChange_chk').length;
			let checkedCheckboxes = $('.conditionChange_chk:checked').length;
			$('.conditionChange_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnConditionChangeSearch").off('click').on('click', function() {
			performConditionChangeSearch();
		});

		$(".btnConditionChangeSearchInit").off('click').on('click', function() {
			resetConditionChangeSearch();
		});

		$('#conditionChange_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeConditionChangeItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.conditionChange-page-btn').on('click', '.conditionChange-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentConditionChangePage = page;
					applyClientPagination();
					renderConditionChangeTableData();
					renderConditionChangePagination();
					updateConditionChangeTotalCount();
				}
			}
		});

		$('#conditionChangeTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mQuality_conditionChange_list input[type="text"], #view_mQuality_conditionChange_list input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performConditionChangeSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#conditionChange_searchVal_fromDate").val(),
			toDate: $("#conditionChange_searchVal_toDate").val(),
			car: $("#conditionChange_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#conditionChange_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#conditionChange_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#conditionChange_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performConditionChangeSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentConditionChangePage = 1;
		performConditionChangeDBSearch(searchCriteria);
	}

	function resetConditionChangeSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		
		$("#conditionChange_searchVal_fromDate").val(fromDate);
		$("#conditionChange_searchVal_toDate").val(toDate);
		$("#conditionChange_searchVal_car").val('');
		$("#conditionChange_searchVal_itemcode").val('');
		$("#conditionChange_searchVal_oitemcode").val('');
		$("#conditionChange_searchVal_itemname").val('');

		currentConditionChangePage = 1;
		performConditionChangeDBSearch({ fromDate, toDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeConditionChangeItemsPerPage = function(newItemsPerPage) {
		conditionChangeItemsPerPage = newItemsPerPage;
		currentConditionChangePage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderConditionChangeTableData();
		renderConditionChangePagination();
		updateConditionChangeTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportConditionChangeData = function() {
		return {
			total: filteredData_conditionChange.length,
			currentPage: currentConditionChangePage,
			itemsPerPage: conditionChangeItemsPerPage,
			data: filteredData_conditionChange
		};
	}

	// 삭제
	$(document).on("click", ".btnConditionChangeDelete", function() {
		const iidList = [];
		$(".conditionChange_chk:checked").each(function() {
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
			url: "/updateConditionChange",
			type: "POST",
			data: JSON.stringify({
				iidList : iidList,
				loginid : loginid
			}),
			contentType: "application/json",
			success: function(data) {
				if (data && data.success) {
					alert(i18n.tf('success.barcode.delete', data.deleteCount || 0));
				}

				let searchVal = getCurrentSearchCriteria();
				performConditionChangeDBSearch(searchVal);	
				
				// 전체 선택 해제
				$('.conditionChange_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});
});

// 전체 데이터 엑셀 다운로드
window.downloadAllConditionChangeData = function() {
	showLoading("export");

	const processedData = filteredData_conditionChange.map(item => {
		return { ...item };
	});

	ExcelExporter.downloadExcel(processedData, window.conditionChangeColumns, {
		fileName: 'conditionChange_All',
		sheetName: 'conditionChange'
	});

	hideLoading();
};
