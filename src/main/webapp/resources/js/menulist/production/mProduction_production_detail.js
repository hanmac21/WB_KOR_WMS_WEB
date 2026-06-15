/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_productionDetail = [];
let globalProductionDetailData = [];
let currentProductionDetailPage = 1;
let productionDetailItemsPerPage = 100;
let totalProductionDetailCount = 0;
let totalProductionDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredProductionDetailData = [];
	window.productionDetailColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'INTF_YN', header: 'Status' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'OKQTY', header: 'OKQty' },
		{ key: 'NGQTY', header: 'NGQty' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'TIME', header: 'Time' },
		{ key: 'LINENO', header: 'Line No' },
		{ key: 'WORKPLACE', header: 'Work Center' },
		{ key: 'SHIFT', header: 'Shift' },
		{ key: 'BARCODE', header: 'Barcode' }
	];
	
	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mProduction_production_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		performProductionDetailDBSearch({ fromDate, toDate, factory });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performProductionDetailDBSearch(searchCriteria) {
		showLoading("data");
		$.ajax({
			url: "/read_productionDetail",
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
				filteredData_productionDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentProductionDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_production_detail').length) {
					renderProductionDetailView();
				} else {
					renderProductionDetailTableData();
					renderProductionDetailPagination();
					updateProductionDetailTotalCount();
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
		productionDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalProductionDetailCount = filteredData_productionDetail.length;
		totalProductionDetailPages = Math.ceil(totalProductionDetailCount / productionDetailItemsPerPage);

		const startIndex = (currentProductionDetailPage - 1) * productionDetailItemsPerPage;
		const endIndex = startIndex + productionDetailItemsPerPage;

		globalProductionDetailData = filteredData_productionDetail.slice(startIndex, endIndex);
		window.filteredProductionDetailData = globalProductionDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_productionDetail.sort((a, b) => {
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

		currentProductionDetailPage = 1;
		applyClientPagination();

		renderProductionDetailTableData();
		renderProductionDetailPagination();
		updateProductionDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderProductionDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_mProduction_production_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="productionDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="productionDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionDetail_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="productionDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productionDetail_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_lineno">${i18n.t('search.lineno')}<!-- LINENO --></div>
								<input type="text" id="productionDetail_searchVal_lineno" />
							</div>
							<div class="search-label">
								<div class="searchVal_workcenter">${i18n.t('search.workCenter')}<!-- WORKCENTER --></div>
								<input type="text" id="productionDetail_searchVal_workcenter" />
							</div>
							<div class="search-label">
								<div class="searchVal_okyn">OKYN</div>
								<select id="productionDetail_searchVal_okyn">
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="Y">Y</option>
									<option value="N">N</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnProductionDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnProductionDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="productionDetailTotalCount">${totalProductionDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="productionDetailCurrentPageInfo">${currentProductionDetailPage}</strong>/<strong id="productionDetailTotalPageInfo">${totalProductionDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="productionDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mProduction_production_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="productionDetailExcelBtn" onclick="downloadAllProductionDetailData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnProductionDetailItemsArea" style="margin-left:24px;">
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfProductionDetailDelete"/>
							</div>
						</div>
						<table class="data-table mProduction_production_detail" id="productionDetailTable">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="productionDetail_chkAll" />
									</th>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='statusVal' data-sort="STATUS">${i18n.t('table.status')}<!-- STATUS --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='factoryVal' data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class='carVal' data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class='qtyVal' data-sort="OKQTY" data-type="number">${i18n.t('search.okqty')}<!-- OKQTY --></th>
									<th class='qtyVal' data-sort="NGQTY" data-type="number">${i18n.t('search.ngqty')}<!-- NGQTY --></th>
									<th class="loginidVal" data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class="hhmmVal" data-sort="TIME">${i18n.t('table.time')}<!-- HHMM --></th>
									<th class="hhmmVal" data-sort="LINENO">${i18n.t('table.lineno')}<!-- LINENO --></th>
									<th class="locationVal" data-sort="WORKPLACE">${i18n.t('search.workCenter')}<!-- WORKPLACE --></th>
									<th class="dateVal" data-sort="SHIFT">SHIFT<!-- SHIFT --></th>
									<th class="barcodeVal" data-sort="BARCODE">${i18n.t('search.barcode')}<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="productionDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="productionDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="productionDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="productionDetail_itemsPerPage" class="items-per-page-select">
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
		$("#productionDetail_searchVal_fromDate").val(fromDate);
		$("#productionDetail_searchVal_toDate").val(toDate);
		$("#productionDetail_itemsPerPage").val(productionDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderProductionDetailTableData();
		// 페이지네이션 렌더링
		renderProductionDetailPagination();
		// 이벤트 바인딩
		bindProductionDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateProductionDetailTotalCount();
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
		const factory = $('#productionDetail_searchVal_factory');		
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

	function updateProductionDetailTotalCount() {
		$(".productionDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#productionDetailTotalCount').text(Number(totalProductionDetailCount).toLocaleString());
		$('#productionDetailCurrentPageInfo').text(currentProductionDetailPage);
		$('#productionDetailTotalPageInfo').text(totalProductionDetailPages);
	}

	function renderProductionDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalProductionDetailData.length; i++) {
			let rowNumber = (currentProductionDetailPage - 1) * productionDetailItemsPerPage + i + 1;
			let data = globalProductionDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
						
			tableBody += `
				<tr>
				     <td class = "checkboxVal"><input type="checkbox" class="productionDetail_chk ${statusClass}" 
	        			data-unique="${data.SDATE}_${data.ITEMCODE}_${data.INTF_YN}_${data.QTY}_${data.FACTORY}_${data.STORAGE}_${data.BARCODE}_${data.WMS_KEY}">
	        		</td>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
				    <td class = 'factoryVal'>${data.FACTORY || data.factory || ''}</td>
				    <td class = 'carVal'>${data.CAR || data.car || ''}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'itemnameLongVal'>${data.ITEMNAME || data.itemname || ''}</td>
				    <td class = "qtyVal">${Number(data.OKQTY || data.okqty || 0).toLocaleString()}</td>
					<td class = "qtyVal">${Number(data.NGQTY || data.ngqty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
					<td class = "hhmmVal">${data.TIME || data.time || ''}</td>
					<td class = "hhmmVal">${data.LINENO || data.lineno || ''}</td>
					<td class = "locationVal">${data.WORKPLACE || data.workplace || ''}</td>
					<td class = "dateVal">${data.SHIFT || data.shift || ''}</td>
					<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
				</tr>
			`;
		}

		$("#productionDetailTableBody").html(tableBody);
		$('.productionDetail_chkAll').prop('checked', false);
	}

	function renderProductionDetailPagination() {
		let paginationHtml = "";

		if (currentProductionDetailPage > 1) {
			paginationHtml += `<button class="productionDetail-page-btn" data-page="${currentProductionDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="productionDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentProductionDetailPage - 5);
		let endPage = Math.min(totalProductionDetailPages, currentProductionDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="productionDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentProductionDetailPage) {
				paginationHtml += `<button class="productionDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="productionDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalProductionDetailPages) {
			if (endPage < totalProductionDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="productionDetail-page-btn" data-page="${totalProductionDetailPages}">${totalProductionDetailPages}</button>`;
		}

		if (currentProductionDetailPage < totalProductionDetailPages) {
			paginationHtml += `<button class="productionDetail-page-btn" data-page="${currentProductionDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="productionDetail-page-btn disabled">&gt;</button>`;
		}

		$("#productionDetailPaginationContainer").html(paginationHtml);
	}

	function bindProductionDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.productionDetail_chkAll').on('change', '.productionDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.productionDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.productionDetail_chk').on('change', '.productionDetail_chk', function() {
			let totalCheckboxes = $('.productionDetail_chk').length;
			let checkedCheckboxes = $('.productionDetail_chk:checked').length;
			$('.productionDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnProductionDetailSearch").off('click').on('click', function() {
			performProductionDetailSearch();
		});

		$(".btnProductionDetailSearchInit").off('click').on('click', function() {
			resetProductionDetailSearch();
		});

		$('#productionDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeProductionDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.productionDetail-page-btn').on('click', '.productionDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentProductionDetailPage = page;
					applyClientPagination();
					renderProductionDetailTableData();
					renderProductionDetailPagination();
					updateProductionDetailTotalCount();
				}
			}
		});

		$('#productionDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mProduction_production_detail input[type="text"], #view_mProduction_production_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performProductionDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#productionDetail_searchVal_fromDate").val(),
			toDate: $("#productionDetail_searchVal_toDate").val(),
			factory: $("#productionDetail_searchVal_factory").val(),
			car: $("#productionDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#productionDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#productionDetail_searchVal_itemname").val().trim().toUpperCase(),
			lineno: $("#productionDetail_searchVal_lineno").val().trim().toUpperCase(),
			workCenter: $("#productionDetail_searchVal_workcenter").val().trim().toUpperCase(),
			okyn: $("#productionDetail_searchVal_okyn").val().trim().toUpperCase()
		};
	}

	function performProductionDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentProductionDetailPage = 1;
		performProductionDetailDBSearch(searchCriteria);
	}

	function resetProductionDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		renderFactoryStorage();
		
		$("#productionDetail_searchVal_fromDate").val(fromDate);
		$("#productionDetail_searchVal_toDate").val(toDate);
		$("#productionDetail_searchVal_car").val('');
		$("#productionDetail_searchVal_itemcode").val('');
		$("#productionDetail_searchVal_itemname").val('');
		$("#productionDetail_searchVal_lineno").val('');
		$("#productionDetail_searchVal_workcenter").val('');
		$("#productionDetail_searchVal_okyn").val('all');

		const factory = getCookie('selectedFactory');
		
		currentProductionDetailPage = 1;
		performProductionDetailDBSearch({ fromDate, toDate, factory });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeProductionDetailItemsPerPage = function(newItemsPerPage) {
		productionDetailItemsPerPage = newItemsPerPage;
		currentProductionDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderProductionDetailTableData();
		renderProductionDetailPagination();
		updateProductionDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportProductionDetailData = function() {
		return {
			total: filteredData_productionDetail.length,
			currentPage: currentProductionDetailPage,
			itemsPerPage: productionDetailItemsPerPage,
			data: filteredData_productionDetail
		};
	}

	// 인터페이스 삭제
	$(document).on("click", ".btnIntfProductionDetailDelete", function() {
		if ($(".productionDetail_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}

		const iidList = [];
		$(".productionDetail_chk:checked").each(function() {
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
			url: "/productionDetail_confirm_cancel",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performProductionDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.productionDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				console.error("요청 실패");
				console.error("Status:", status);       // 예: "error"
				console.error("Error:", error);         // 예: 서버 응답 메시지
				console.error("Response:", xhr.responseText); // 서버 응답 본문
				alert("오류가 발생했습니다: " + error);
			}
		});

	});
});

// 전체 데이터 엑셀 다운로드
window.downloadAllProductionDetailData = function() {
	showLoading("export");

	const processedData = filteredData_productionDetail.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.productionDetailColumns, {
		fileName: 'productionDetail_All',
		sheetName: 'productionDetail'
	});

	hideLoading();
};
