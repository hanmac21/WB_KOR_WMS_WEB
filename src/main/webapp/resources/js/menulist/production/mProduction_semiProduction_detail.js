/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_semiProductionDetail = [];
let globalSemiProductionDetailData = [];
let currentSemiProductionDetailPage = 1;
let semiProductionDetailItemsPerPage = 100;
let totalSemiProductionDetailCount = 0;
let totalSemiProductionDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredSemiProductionDetailData = [];
	window.semiProductionDetailColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'INTF_YN', header: 'Status' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'LINENO', header: 'Line no' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'OKQTY', header: 'OKqty' },
		{ key: 'NGQTY', header: 'NGqty' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'TIME', header: 'Time' },
		{ key: 'BARCODE', header: 'Barcode' }
	];
	
	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mProduction_semiProduction_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		performSemiProductionDetailDBSearch({ fromDate, toDate, factory });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSemiProductionDetailDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_semiProductionDetail",
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
				filteredData_semiProductionDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSemiProductionDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_semiProduction_detail').length) {
					renderSemiProductionDetailView();
				} else {
					renderSemiProductionDetailTableData();
					renderSemiProductionDetailPagination();
					updateSemiProductionDetailTotalCount();
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
		semiProductionDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSemiProductionDetailCount = filteredData_semiProductionDetail.length;
		totalSemiProductionDetailPages = Math.ceil(totalSemiProductionDetailCount / semiProductionDetailItemsPerPage);

		const startIndex = (currentSemiProductionDetailPage - 1) * semiProductionDetailItemsPerPage;
		const endIndex = startIndex + semiProductionDetailItemsPerPage;

		globalSemiProductionDetailData = filteredData_semiProductionDetail.slice(startIndex, endIndex);
		window.filteredSemiProductionDetailData = globalSemiProductionDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_semiProductionDetail.sort((a, b) => {
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

		currentSemiProductionDetailPage = 1;
		applyClientPagination();

		renderSemiProductionDetailTableData();
		renderSemiProductionDetailPagination();
		updateSemiProductionDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSemiProductionDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_mProduction_semiProduction_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="semiProductionDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="semiProductionDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="semiProductionDetail_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="semiProductionDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="semiProductionDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="semiProductionDetail_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSemiProductionDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnSemiProductionDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="semiProductionDetailTotalCount">${totalSemiProductionDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="semiProductionDetailCurrentPageInfo">${currentSemiProductionDetailPage}</strong>/<strong id="semiProductionDetailTotalPageInfo">${totalSemiProductionDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="semiProductionDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mProduction_semiProduction_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="semiProductionDetailExcelBtn" onclick="downloadAllSemiProductionDetailData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnSemiProductionDetailItemsArea" style="margin-left:24px;">
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfSemiProductionDetailDelete"/>
							</div>
						</div>
						<table class="data-table mProduction_semiProduction_detail" id="semiProductionDetailTable">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="semiProductionDetail_chkAll" />
									</th>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='statusVal' data-sort="STATUS">${i18n.t('table.status')}<!-- STATUS --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='factoryVal' data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class="hhmmVal" data-sort="LINENO">${i18n.t('table.lineno')}<!-- LINENO --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="OKQTY" data-type="number">${i18n.t('search.okqty')}<!-- OKQTY --></th>
									<th class='qtyVal' data-sort="NGQTY" data-type="number">${i18n.t('search.ngqty')}<!-- NGQTY --></th>
									<th class="loginidVal" data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class="hhmmVal" data-sort="TIME">${i18n.t('table.time')}<!-- HHMM --></th>
									<th class="barcodeVal" data-sort="BARCODE">${i18n.t('search.barcode')}<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="semiProductionDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="semiProductionDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="semiProductionDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="semiProductionDetail_itemsPerPage" class="items-per-page-select">
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
		$("#semiProductionDetail_searchVal_fromDate").val(fromDate);
		$("#semiProductionDetail_searchVal_toDate").val(toDate);
		$("#semiProductionDetail_itemsPerPage").val(semiProductionDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSemiProductionDetailTableData();
		// 페이지네이션 렌더링
		renderSemiProductionDetailPagination();
		// 이벤트 바인딩
		bindSemiProductionDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSemiProductionDetailTotalCount();
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
		const factory = $('#semiProductionDetail_searchVal_factory');		
		const savedFactory = getCookie('selectedFactory');
		
		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}		
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

	function updateSemiProductionDetailTotalCount() {
		$(".semiProductionDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#semiProductionDetailTotalCount').text(Number(totalSemiProductionDetailCount).toLocaleString());
		$('#semiProductionDetailCurrentPageInfo').text(currentSemiProductionDetailPage);
		$('#semiProductionDetailTotalPageInfo').text(totalSemiProductionDetailPages);
	}

	function renderSemiProductionDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSemiProductionDetailData.length; i++) {
			let rowNumber = (currentSemiProductionDetailPage - 1) * semiProductionDetailItemsPerPage + i + 1;
			let data = globalSemiProductionDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
						
			tableBody += `
				<tr>
				     <td class = "checkboxVal"><input type="checkbox" class="semiProductionDetail_chk ${statusClass}" 
	        			data-unique="${data.SDATE}_${data.ITEMCODE}_${data.INTF_YN}_${data.QTY}_${data.FACTORY}_${data.STORAGE}_${data.BARCODE}_${data.WMS_KEY}">
	        		</td>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'factoryVal'>${data.FACTORY || data.factory || ''}</td>
					<td class = "hhmmVal">${data.LINENO || data.lineno || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'itemnameLongVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = "qtyVal">${Number(data.OKQTY || data.okqty || 0).toLocaleString()}</td>
					<td class = "qtyVal">${Number(data.NGQTY || data.ngqty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
					<td class = "hhmmVal">${data.TIME || data.time || ''}</td>
					<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
				</tr>
			`;
		}

		$("#semiProductionDetailTableBody").html(tableBody);
		$('.semiProductionDetail_chkAll').prop('checked', false);
	}

	function renderSemiProductionDetailPagination() {
		let paginationHtml = "";

		if (currentSemiProductionDetailPage > 1) {
			paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="${currentSemiProductionDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="semiProductionDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSemiProductionDetailPage - 5);
		let endPage = Math.min(totalSemiProductionDetailPages, currentSemiProductionDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSemiProductionDetailPage) {
				paginationHtml += `<button class="semiProductionDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSemiProductionDetailPages) {
			if (endPage < totalSemiProductionDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="${totalSemiProductionDetailPages}">${totalSemiProductionDetailPages}</button>`;
		}

		if (currentSemiProductionDetailPage < totalSemiProductionDetailPages) {
			paginationHtml += `<button class="semiProductionDetail-page-btn" data-page="${currentSemiProductionDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="semiProductionDetail-page-btn disabled">&gt;</button>`;
		}

		$("#semiProductionDetailPaginationContainer").html(paginationHtml);
	}

	function bindSemiProductionDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.semiProductionDetail_chkAll').on('change', '.semiProductionDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.semiProductionDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.semiProductionDetail_chk').on('change', '.semiProductionDetail_chk', function() {
			let totalCheckboxes = $('.semiProductionDetail_chk').length;
			let checkedCheckboxes = $('.semiProductionDetail_chk:checked').length;
			$('.semiProductionDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnSemiProductionDetailSearch").off('click').on('click', function() {
			performSemiProductionDetailSearch();
		});

		$(".btnSemiProductionDetailSearchInit").off('click').on('click', function() {
			resetSemiProductionDetailSearch();
		});

		$('#semiProductionDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSemiProductionDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.semiProductionDetail-page-btn').on('click', '.semiProductionDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSemiProductionDetailPage = page;
					applyClientPagination();
					renderSemiProductionDetailTableData();
					renderSemiProductionDetailPagination();
					updateSemiProductionDetailTotalCount();
				}
			}
		});

		$('#semiProductionDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mProduction_semiProduction_detail input[type="text"], #view_mProduction_semiProduction_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSemiProductionDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#semiProductionDetail_searchVal_fromDate").val(),
			toDate: $("#semiProductionDetail_searchVal_toDate").val(),
			factory: $("#semiProductionDetail_searchVal_factory").val(),
			car: $("#semiProductionDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#semiProductionDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#semiProductionDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performSemiProductionDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSemiProductionDetailPage = 1;
		performSemiProductionDetailDBSearch(searchCriteria);
	}

	function resetSemiProductionDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#semiProductionDetail_searchVal_fromDate").val(fromDate);
		$("#semiProductionDetail_searchVal_toDate").val(toDate);
		$("#semiProductionDetail_searchVal_car").val('');
		$("#semiProductionDetail_searchVal_itemcode").val('');
		$("#semiProductionDetail_searchVal_itemname").val('');

		const factory = getCookie('selectedFactory');
		
		currentSemiProductionDetailPage = 1;
		performSemiProductionDetailDBSearch({ fromDate, toDate, factory });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSemiProductionDetailItemsPerPage = function(newItemsPerPage) {
		semiProductionDetailItemsPerPage = newItemsPerPage;
		currentSemiProductionDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSemiProductionDetailTableData();
		renderSemiProductionDetailPagination();
		updateSemiProductionDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSemiProductionDetailData = function() {
		return {
			total: filteredData_semiProductionDetail.length,
			currentPage: currentSemiProductionDetailPage,
			itemsPerPage: semiProductionDetailItemsPerPage,
			data: filteredData_semiProductionDetail
		};
	}

	$(document).on("click", ".btnIntfSemiProductionDetailDelete", function() {

		if ($(".semiProductionDetail_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}
		
		const iidList = [];
		$(".semiProductionDetail_chk:checked").each(function() {
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
			url: "/semiProduction_confirm_cancel",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performSemiProductionDetailDBSearch(searchVal);	
				
				// 전체 선택 해제
				$('.semiProductionDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSemiProductionDetailData = function() {
	showLoading("export");

	const processedData = filteredData_semiProductionDetail.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.semiProductionDetailColumns, {
		fileName: 'semiProductionDetail_All',
		sheetName: 'semiProductionDetail'
	});

	hideLoading();
};
