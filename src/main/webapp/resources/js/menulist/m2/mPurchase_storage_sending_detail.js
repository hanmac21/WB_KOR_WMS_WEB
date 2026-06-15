/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_storageSendingDetail = [];
let globalStorageSendingDetailData = [];
let currentStorageSendingDetailPage = 1;
let storageSendingDetailItemsPerPage = 100;
let totalStorageSendingDetailCount = 0;
let totalStorageSendingDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredStorageSendingDetailData = [];
	window.storageSendingDetailColumns = [
		{ key: 'SDATE', header: 'sdate' },
		{ key: 'STORAGE1', header: 'storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'OITEMCODE', header: 'spec' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'lot' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_storage_sending_detail = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		performStorageSendingDetailDBSearch({ fromDate, toDate, storage });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performStorageSendingDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_storageSendingDetail",
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
				filteredData_storageSendingDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentStorageSendingDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_storage_sending_detail').length) {
					renderStorageSendingDetailView();
				} else {
					renderStorageSendingDetailTableData();
					renderStorageSendingDetailPagination();
					updateStorageSendingDetailTotalCount();
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
		storageSendingDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalStorageSendingDetailCount = filteredData_storageSendingDetail.length;
		totalStorageSendingDetailPages = Math.ceil(totalStorageSendingDetailCount / storageSendingDetailItemsPerPage);

		const startIndex = (currentStorageSendingDetailPage - 1) * storageSendingDetailItemsPerPage;
		const endIndex = startIndex + storageSendingDetailItemsPerPage;

		globalStorageSendingDetailData = filteredData_storageSendingDetail.slice(startIndex, endIndex);
		window.filteredStorageSendingDetailData = globalStorageSendingDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_storageSendingDetail.sort((a, b) => {
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

		currentStorageSendingDetailPage = 1;
		applyClientPagination();

		renderStorageSendingDetailTableData();
		renderStorageSendingDetailPagination();
		updateStorageSendingDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderStorageSendingDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminStorageSendingDetailDelete"/>
	        `;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_storage_sending_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="storageSendingDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="storageSendingDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.sentstorage')}<!-- STORAGE --></div>
								<select id="storageSendingDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="storageSendingDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="storageSendingDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="storageSendingDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="storageSendingDetail_searchVal_itemname" />
							</div>	
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnStorageSendingDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnStorageSendingDetailSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="storageSendingDetailTotalCount">${totalStorageSendingDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="storageSendingDetailCurrentPageInfo">${currentStorageSendingDetailPage}</strong>/<strong id="storageSendingDetailTotalPageInfo">${totalStorageSendingDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="storageSendingDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_storage_sending_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnStorageSendingDetailDelete"/>
									<button class="btn btn-success" id="storageSendingDetailExcelBtn" onclick="downloadAllStorageSendingDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_storage_sending_detail" id="storageSendingDetailTable">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="storageSendingDetail_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal" data-sort="OUTDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "storageVal" data-sort="STORAGE1">${i18n.t('search.sentstorage')}<!-- STORAGE --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "cnameVal" data-sort="OITEMCODE">${i18n.t('search.customercode')}<!-- ITEMCODE --></th>
									<th class = "itemnameLongVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "loginidVal" data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class = "hhmmVal" data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
									<th class = "barcodeVal" data-sort="BARCODE">${i18n.t('search.barcode')}<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="storageSendingDetailDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="storageSendingDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="storageSendingDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="storageSendingDetail_itemsPerPage" class="items-per-page-select">
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
		$("#storageSendingDetail_searchVal_fromDate").val(fromDate);
		$("#storageSendingDetail_searchVal_toDate").val(toDate);
		$("#storageSendingDetail_itemsPerPage").val(storageSendingDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderStorageSendingDetailTableData();
		// 페이지네이션 렌더링
		renderStorageSendingDetailPagination();
		// 이벤트 바인딩
		bindStorageSendingDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateStorageSendingDetailTotalCount();
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
		const storage = $('#storageSendingDetail_searchVal_storage');
		const savedStorage = getCookie('selectedStorage');

		storage.empty();

		const storageList =  ['INBOUND', 'PRODUCT', 'OUTSIDE', 'all'];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		if(savedStorage === 'ILLINOIS'){
			storage.val('OUTSIDE');
		}else {
			storage.val(storageList[0]);
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

	function updateStorageSendingDetailTotalCount() {
		$(".storageSendingDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#storageSendingDetailTotalCount').text(Number(totalStorageSendingDetailCount).toLocaleString());
		$('#storageSendingDetailCurrentPageInfo').text(currentStorageSendingDetailPage);
		$('#storageSendingDetailTotalPageInfo').text(totalStorageSendingDetailPages);
	}

	function renderStorageSendingDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalStorageSendingDetailData.length; i++) {
			let rowNumber = (currentStorageSendingDetailPage - 1) * storageSendingDetailItemsPerPage + i + 1;
			let data = globalStorageSendingDetailData[i];
			
			tableBody += `
				<tr>
		            <td class = "checkboxVal"><input type="checkbox" class="storageSendingDetail_chk" 
		    			data-delete="${data.IID}_${data.SDATE}_${data.FACTORY}_${data.STORAGE1}_${data.BARCODE}">
		    		</td>
				    <td class = "noVal">${rowNumber}</td>
		            <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "storageVal">${data.STORAGE1 || data.storage1 || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "cnameVal">${data.OITEMCODE || data.oitemcode || ''}</td>
					<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td><!-- LOGINID -->
					<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td><!-- HHMM -->
					<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td><!-- LOT -->
		        </tr>
			`;
		}

		$("#storageSendingDetailDetailTableBody").html(tableBody);
		$(".storageSendingDetail_chkAll").prop("checked", false);
	}

	function renderStorageSendingDetailPagination() {
		let paginationHtml = "";

		if (currentStorageSendingDetailPage > 1) {
			paginationHtml += `<button class="storageSendingDetail-page-btn" data-page="${currentStorageSendingDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="storageSendingDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentStorageSendingDetailPage - 5);
		let endPage = Math.min(totalStorageSendingDetailPages, currentStorageSendingDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="storageSendingDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStorageSendingDetailPage) {
				paginationHtml += `<button class="storageSendingDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="storageSendingDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalStorageSendingDetailPages) {
			if (endPage < totalStorageSendingDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="storageSendingDetail-page-btn" data-page="${totalStorageSendingDetailPages}">${totalStorageSendingDetailPages}</button>`;
		}

		if (currentStorageSendingDetailPage < totalStorageSendingDetailPages) {
			paginationHtml += `<button class="storageSendingDetail-page-btn" data-page="${currentStorageSendingDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="storageSendingDetail-page-btn disabled">&gt;</button>`;
		}

		$("#storageSendingDetailPaginationContainer").html(paginationHtml);
	}

	function bindStorageSendingDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.storageSendingDetail_chkAll').on('change', '.storageSendingDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.storageSendingDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.storageSendingDetail_chk').on('change', '.storageSendingDetail_chk', function() {
			let totalCheckboxes = $('.storageSendingDetail_chk').length;
			let checkedCheckboxes = $('.storageSendingDetail_chk:checked').length;
			$('.storageSendingDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnStorageSendingDetailSearch").off('click').on('click', function() {
			performStorageSendingDetailSearch();
		});

		$(".btnStorageSendingDetailSearchInit").off('click').on('click', function() {
			resetStorageSendingDetailSearch();
		});

		$('#storageSendingDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeStorageSendingDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.storageSendingDetail-page-btn').on('click', '.storageSendingDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentStorageSendingDetailPage = page;
					applyClientPagination();
					renderStorageSendingDetailTableData();
					renderStorageSendingDetailPagination();
					updateStorageSendingDetailTotalCount();
				}
			}
		});

		$('#storageSendingDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_storage_sending_detail input[type="text"], #view_mPurchase_storage_sending_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performStorageSendingDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#storageSendingDetail_searchVal_fromDate").val(),
			toDate: $("#storageSendingDetail_searchVal_toDate").val(),
			storage: $("#storageSendingDetail_searchVal_storage").val(),
			car: $("#storageSendingDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#storageSendingDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#storageSendingDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#storageSendingDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performStorageSendingDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentStorageSendingDetailPage = 1;
		performStorageSendingDetailDBSearch(searchCriteria);
	}

	function resetStorageSendingDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		
		$("#storageSendingDetail_searchVal_fromDate").val(fromDate);
		$("#storageSendingDetail_searchVal_toDate").val(toDate);
		$("#storageSendingDetail_searchVal_car").val('');
		$("#storageSendingDetail_searchVal_itemcode").val('');
		$("#storageSendingDetail_searchVal_oitemcode").val('');
		$("#storageSendingDetail_searchVal_itemname").val('');
		
		renderFactoryStorage();
		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		currentStorageSendingDetailPage = 1;
		performStorageSendingDetailDBSearch({ fromDate, toDate, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeStorageSendingDetailItemsPerPage = function(newItemsPerPage) {
		storageSendingDetailItemsPerPage = newItemsPerPage;
		currentStorageSendingDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderStorageSendingDetailTableData();
		renderStorageSendingDetailPagination();
		updateStorageSendingDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportStorageSendingDetailData = function() {
		return {
			total: filteredData_storageSendingDetail.length,
			currentPage: currentStorageSendingDetailPage,
			itemsPerPage: storageSendingDetailItemsPerPage,
			data: filteredData_storageSendingDetail
		};
	}

	//데이터 삭제
	$(document).on("click", ".btnStorageSendingDetailDelete", function() {
		const iidList = [];
		$(".storageSendingDetail_chk:checked").each(function() {
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
			url: "/deleteFactorySending",
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
					//return; 251218 SHJ 실패시에도 재조회 되도록 주석 삭제가 되었는데도 ALERT창 뜨고 그대로 남아있는경우가 있어 새로고침 시키는게 나을거 같음
				}

				let searchVal = getCurrentSearchCriteria();
				performStorageSendingDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.storageSendingDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});


	// 관리자용 삭제
	$(document).on("click", ".btnAdminStorageSendingDetailDelete", function() {
		const iidList = [];
		$(".storageSendingDetail_chk:checked").each(function() {
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
			url: "/deleteFactorySending",
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
					performStorageSendingDetailDBSearch(searchVal);

					// 전체 선택 해제
					$('.storageSendingDetail_chkAll').prop('checked', false);
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
});

// 전체 데이터 엑셀 다운로드
window.downloadAllStorageSendingDetailData = function() {
	showLoading("export");

	const processedData = filteredData_storageSendingDetail.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.storageSendingDetailColumns, {
		fileName: 'storageSendingDetail_All',
		sheetName: 'storageSendingDetail'
	});

	hideLoading();
};
