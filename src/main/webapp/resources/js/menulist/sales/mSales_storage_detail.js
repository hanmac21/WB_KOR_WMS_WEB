/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_salesStorageDetail = [];
let globalSalesStorageDetailData = [];
let currentSalesStorageDetailPage = 1;
let salesStorageDetailItemsPerPage = 100;
let totalSalesStorageDetailCount = 0;
let totalSalesStorageDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredSalesStorageDetailData = [];
	window.salesStorageDetailColumns = [
		{ key: 'INTF_YN', header: 'status' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE1', header: 'From storage' },
		{ key: 'STORAGE2', header: 'To storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'barcode' },
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mSales_storage_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage1 = 'all';
		let storage2 = 'all';

		performSalesStorageDetailDBSearch({ fromDate, toDate, factory, storage1, storage2 });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSalesStorageDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_salesStorageDetail",
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
				filteredData_salesStorageDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentSalesStorageDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mSales_storage_detail').length) {
					renderSalesStorageDetailView();
				} else {
					renderSalesStorageDetailTableData();
					renderSalesStorageDetailPagination();
					updateSalesStorageDetailTotalCount();
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
		salesStorageDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSalesStorageDetailCount = filteredData_salesStorageDetail.length;
		totalSalesStorageDetailPages = Math.ceil(totalSalesStorageDetailCount / salesStorageDetailItemsPerPage);

		const startIndex = (currentSalesStorageDetailPage - 1) * salesStorageDetailItemsPerPage;
		const endIndex = startIndex + salesStorageDetailItemsPerPage;

		globalSalesStorageDetailData = filteredData_salesStorageDetail.slice(startIndex, endIndex);
		window.filteredSalesStorageDetailData = globalSalesStorageDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_salesStorageDetail.sort((a, b) => {
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

		currentSalesStorageDetailPage = 1;
		applyClientPagination();

		renderSalesStorageDetailTableData();
		renderSalesStorageDetailPagination();
		updateSalesStorageDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSalesStorageDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminSalesStorageDetailDelete"/>
	        `;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mSales_storage_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="salesStorageDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="salesStorageDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="salesStorageDetail_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage.from')}<!-- FROM STORAGE --></div>
								<select id="salesStorageDetail_searchVal_storage1" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage.to')}<!-- TO STORAGE --></div>
								<select id="salesStorageDetail_searchVal_storage2" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="salesStorageDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="salesStorageDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="salesStorageDetail_searchVal_itemname" />
							</div>	
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSalesStorageDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnSalesStorageDetailSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="salesStorageDetailTotalCount">${totalSalesStorageDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="salesStorageDetailCurrentPageInfo">${currentSalesStorageDetailPage}</strong>/<strong id="salesStorageDetailTotalPageInfo">${totalSalesStorageDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="salesStorageDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mSales_storage_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnSalesStorageDetailDelete"/>
									<button class="btn btn-success" id="salesStorageDetailExcelBtn" onclick="downloadAllSalesStorageDetailData()">Excel</button>
								</div>
							</div>							
							<div class="btnInterfaceCommon btnSalesStorageDetailItemsArea" style="margin-left:24px;">
								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfSalesStorageDetail"/>
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfSalesStorageDetailDelete"/>
							</div>
						</div>
						<table class="data-table mSales_storage_detail" id="salesStorageDetailTable">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="salesStorageDetail_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "statusVal" data-sort="INTF_YN">${i18n.t('table.status')}<!-- STATUS --></th>
									<th class = "dateVal" data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "factoryVal" data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal" data-sort="STORAGE1">${i18n.t('search.storage.from')}<!-- FROM STORAGE --></th>
									<th class = "storageVal" data-sort="STORAGE2">${i18n.t('search.storage.to')}<!-- TO STORAGE --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameLongVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "loginidVal" data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class = "hhmmVal" data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
									<th class = "barcodeVal" data-sort="BARCODE">${i18n.t('search.barcode')}<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="salesStorageDetailDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="salesStorageDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="salesStorageDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="salesStorageDetail_itemsPerPage" class="items-per-page-select">
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
		$("#salesStorageDetail_searchVal_toDate").val(toDate);
		$("#salesStorageDetail_searchVal_fromDate").val(fromDate);
		$("#salesStorageDetail_itemsPerPage").val(salesStorageDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderSalesStorageDetailTableData();
		// 페이지네이션 렌더링
		renderSalesStorageDetailPagination();
		// 이벤트 바인딩
		bindSalesStorageDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSalesStorageDetailTotalCount();
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
		const factory = $('#salesStorageDetail_searchVal_factory');
		const storage1 = $('#salesStorageDetail_searchVal_storage1');
		const storage2 = $('#salesStorageDetail_searchVal_storage2');
		const savedFactory = getCookie('selectedFactory');

		// 공장별 창고 옵션 설정
		function updateStorageOptions(factoryValue) {
			storage1.empty();
			storage2.empty();

			const options = {
				'WBTA': ['all', 'MATERIAL', 'PRODUCT'],
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage1.append(`<option value="${item}">${text}</option>`);
				storage2.append(`<option value="${item}">${text}</option>`);
			});

			// 첫 번째 옵션 선택 (all)
			storage1.val(storageList[0]);
			storage2.val(storageList[0]);
		}

		// 저장된 공장 선택
		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}

		updateStorageOptions(savedFactory || '');

		// 공장 변경 시 창고 업데이트
		factory.on('change', function() {
			updateStorageOptions($(this).val());
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

	function updateSalesStorageDetailTotalCount() {
		$('#salesStorageDetailTotalCount').text(Number(totalSalesStorageDetailCount).toLocaleString());
		$('#salesStorageDetailCurrentPageInfo').text(currentSalesStorageDetailPage);
		$('#salesStorageDetailTotalPageInfo').text(totalSalesStorageDetailPages);
	}

	function renderSalesStorageDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSalesStorageDetailData.length; i++) {
			let rowNumber = (currentSalesStorageDetailPage - 1) * salesStorageDetailItemsPerPage + i + 1;
			let data = globalSalesStorageDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			
			tableBody += `
				<tr>
		            <td class = "checkboxVal"><input type="checkbox" class="salesStorageDetail_chk ${statusClass}" 
		    			data-unique="${data.SDATE}_${data.ITEMCODE}_${data.INTF_YN}_${data.QTY}_${data.FACTORY}_${data.STORAGE2}_${data.STORAGE1}_${data.BARCODE}_${data.MES_KEY}"
		    			data-delete="${data.IID}_${data.SDATE}_${data.FACTORY}_${data.STORAGE2}_${data.BARCODE}">
		    		</td>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
		            <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
					<td class = "storageVal">${data.STORAGE1 || data.storage1 || ''}</td>
					<td class = "storageVal">${data.STORAGE2 || data.storage2 || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td><!-- LOGINID -->
					<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td><!-- HHMM -->
					<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td><!-- LOT -->
		        </tr>
			`;
		}

		$("#salesStorageDetailDetailTableBody").html(tableBody);
		$(".salesStorageDetail_chkAll").prop("checked", false);
	}

	function renderSalesStorageDetailPagination() {
		let paginationHtml = "";

		if (currentSalesStorageDetailPage > 1) {
			paginationHtml += `<button class="salesStorageDetail-page-btn" data-page="${currentSalesStorageDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesStorageDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesStorageDetailPage - 5);
		let endPage = Math.min(totalSalesStorageDetailPages, currentSalesStorageDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesStorageDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesStorageDetailPage) {
				paginationHtml += `<button class="salesStorageDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesStorageDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSalesStorageDetailPages) {
			if (endPage < totalSalesStorageDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesStorageDetail-page-btn" data-page="${totalSalesStorageDetailPages}">${totalSalesStorageDetailPages}</button>`;
		}

		if (currentSalesStorageDetailPage < totalSalesStorageDetailPages) {
			paginationHtml += `<button class="salesStorageDetail-page-btn" data-page="${currentSalesStorageDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesStorageDetail-page-btn disabled">&gt;</button>`;
		}

		$("#salesStorageDetailPaginationContainer").html(paginationHtml);
	}

	function bindSalesStorageDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.salesStorageDetail_chkAll').on('change', '.salesStorageDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.salesStorageDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.salesStorageDetail_chk').on('change', '.salesStorageDetail_chk', function() {
			let totalCheckboxes = $('.salesStorageDetail_chk').length;
			let checkedCheckboxes = $('.salesStorageDetail_chk:checked').length;
			$('.salesStorageDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnSalesStorageDetailSearch").off('click').on('click', function() {
			performSalesStorageDetailSearch();
		});

		$(".btnSalesStorageDetailSearchInit").off('click').on('click', function() {
			resetSalesStorageDetailSearch();
		});

		$('#salesStorageDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSalesStorageDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.salesStorageDetail-page-btn').on('click', '.salesStorageDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesStorageDetailPage = page;
					applyClientPagination();
					renderSalesStorageDetailTableData();
					renderSalesStorageDetailPagination();
					updateSalesStorageDetailTotalCount();
				}
			}
		});

		$('#salesStorageDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mSales_storage_detail input[type="text"], #view_mSales_storage_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSalesStorageDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#salesStorageDetail_searchVal_fromDate").val(),
			toDate: $("#salesStorageDetail_searchVal_toDate").val(),
			factory: $("#salesStorageDetail_searchVal_factory").val(),
			storage1: $("#salesStorageDetail_searchVal_storage1").val(),
			storage2: $("#salesStorageDetail_searchVal_storage2").val(),
			car: $("#salesStorageDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#salesStorageDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesStorageDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performSalesStorageDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSalesStorageDetailPage = 1;
		performSalesStorageDetailDBSearch(searchCriteria);
	}

	function resetSalesStorageDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		
		$("#salesStorageDetail_searchVal_fromDate").val(fromDate);
		$("#salesStorageDetail_searchVal_toDate").val(toDate);
		$("#salesStorageDetail_searchVal_car").val('');
		$("#salesStorageDetail_searchVal_itemcode").val('');
		$("#salesStorageDetail_searchVal_itemname").val('');
		
		renderFactoryStorage();
		const factory = getCookie('selectedFactory');

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage1 = 'all';
		let storage2 = 'all';

		currentSalesStorageDetailPage = 1;
		performSalesStorageDetailDBSearch({ fromDate, toDate, factory, storage1, storage2});

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".salesStorageDetailTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeSalesStorageDetailItemsPerPage = function(newItemsPerPage) {
		salesStorageDetailItemsPerPage = newItemsPerPage;
		currentSalesStorageDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSalesStorageDetailTableData();
		renderSalesStorageDetailPagination();
		updateSalesStorageDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSalesStorageDetailData = function() {
		return {
			total: filteredData_salesStorageDetail.length,
			currentPage: currentSalesStorageDetailPage,
			itemsPerPage: salesStorageDetailItemsPerPage,
			data: filteredData_salesStorageDetail
		};
	}

	//삭제
	$(document).off("click", ".btnSalesStorageDetailDelete").on("click", ".btnSalesStorageDetailDelete", function() {
		const $btn = $(this);
		if ($btn.prop('disabled')) return;

		let checkedLength = $(".salesStorageDetail_chk:checked").length;
		const iidList = [];

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (checkedLength === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}
		let stopFlag = true;

		$(".salesStorageDetail_chk:checked").each(function() {

			let unique = $(this).data("unique");
			const uniqueSplit = unique.split("_");

			let intf_yn = uniqueSplit[2];

			if (intf_yn == 'Y') {
				stopFlag = false;
			} else {
				let iid = $(this).data('delete');
				iidList.push(iid);

			}

		});

		if (!stopFlag) {
			alert(i18n.t('validation.confirm.items.delete'));
			return;
		}

		if (!confirm(i18n.t('confirmation.items.delete'))) {
			return;
		}

		$btn.prop('disabled', true);
		showLoading("data");
		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
		console.log(iidList)
		$.ajax({
			url: "/deleteStorage",
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
				performSalesStorageDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.salesStorageDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			},
			complete: function() {
				$btn.prop('disabled', false);
			}

		});
	});


	// 관리자용 삭제
	$(document).off("click", ".btnAdminSalesStorageDetailDelete").on("click", ".btnAdminSalesStorageDetailDelete", function() {
		let checkedLength = $(".salesStorageDetail_chk:checked").length;
		const iidList = [];

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (checkedLength === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}
		let stopFlag = true;

		$(".salesStorageDetail_chk:checked").each(function() {

			let unique = $(this).data("unique");
			const uniqueSplit = unique.split("_");

			let intf_yn = uniqueSplit[2];

			if (intf_yn == 'Y') {
				stopFlag = false;
			} else {
				let iid = $(this).data('delete');
				iidList.push(iid);

			}

		});

		if (!stopFlag) {
			alert(i18n.t('validation.confirm.items.delete'));
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
			url: "/deleteStorage",
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
					performSalesStorageDetailDBSearch(searchVal);

					// 전체 선택 해제
					$('.salesStorageDetail_chkAll').prop('checked', false);
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


	//인터페이스 등록
	$(document).off("click", ".btnIntfSalesStorageDetail").on("click", ".btnIntfSalesStorageDetail", function() {

		if ($(".salesStorageDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}

		const iidList = [];
		$(".salesStorageDetail_chk:checked").each(function() {
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
			url: "/storage_confirm_summary",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performSalesStorageDetailDBSearch(searchVal);

				$('.salesStorageDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});

	//인터페이스 등록 취소
	$(document).off("click", ".btnIntfSalesStorageDetailDelete").on("click", ".btnIntfSalesStorageDetailDelete", function() {

		if ($(".salesStorageDetail_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}

		const iidList = [];
		$(".salesStorageDetail_chk:checked").each(function() {
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
			url: "/storage_confirm_summary_cancel",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performSalesStorageDetailDBSearch(searchVal);

				$('.salesStorageDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});
});

// 전체 데이터 엑셀 다운로드
window.downloadAllSalesStorageDetailData = function() {
	showLoading("export");

	const processedData = filteredData_salesStorageDetail.map(item => {
		return {
			...item,
			INTF_YN: item.INTF_YN === 'Y'
				? i18n.t('search.input.completed')
				: i18n.t('search.input.waiting')
		};
	});

	ExcelExporter.downloadExcel(processedData, window.salesStorageDetailColumns, {
		fileName: 'salesStorageDetail_All',
		sheetName: 'salesStorageDetail'
	});

	hideLoading();
};
