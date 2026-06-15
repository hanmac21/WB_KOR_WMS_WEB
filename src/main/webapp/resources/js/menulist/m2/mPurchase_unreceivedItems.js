/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = []; // 서버에서 받은 전체 데이터 (원본)
let filteredData_purchaseUnreceivedItems = []; // 검색 필터링된 데이터
let globalUnreceivedItemData = []; // 현재 페이지에 표시될 데이터
let currentunreceivedItemPage = 1; // 현재 페이지
let unreceivedItemItemsPerPage = 1000; // 페이지당 항목 수
let totalunreceivedItemCount = 0; // 총 개수
let totalunreceivedItemPages = 0; // 총 페이지
let totalQty = 0; // 총 수량
let currentSortColumn = null; // 현재 정렬 컬럼
let currentSortOrder = 'asc'; // 현재 정렬 방향

$(document).ready(function() {

	window.filteredunreceivedItemData = [];
	window.unreceivedItemColumns = [
		{ key: 'OUTDATE', header: 'DATE' },
		{ key: 'CUSTNAME', header: 'CUST NAME' },
		{ key: 'INVOICENO', header: 'INVOICE NO' },
		{ key: 'QTY', header: 'QTY', type: 'number' },
		{ key: 'COUNT', header: 'COUNT', type: 'number' },
		{ key: 'CONTAINER', header: 'CONTAINER' },
		{ key: 'SECURITY', header: 'SECURITY' },
		{ key: 'BOX1', header: 'BOX1' },
		{ key: 'BOX2', header: 'BOX2' },
		{ key: 'BOX3', header: 'BOX3' },
		{ key: 'CARRIER', header: 'CARRIER' },
		{ key: 'DATENO', header: 'DATENO' },
		{ key: 'FOWARDING', header: 'FOWARDING' },
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_unreceivedItems = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		performunreceivedItemDBSearch({ toDate, fromDate });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performunreceivedItemDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_unreceivedItem",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
				// page, itemsPerPage 없음 = 전체 조회
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				allServerData = (response.records || []).map(r => {
					const wmsKey = (r.WMS_KEY ?? "").toString().trim();
					return { ...r, STATUS: wmsKey === "N" ? "delivered" : "unreceived"};
				});

				filteredData_purchaseUnreceivedItems = [...allServerData];

				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentunreceivedItemPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_unreceivedItems').length) {
					renderunreceivedItemView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderunreceivedItemTableData();
					renderunreceivedItemPagination();
					updateunreceivedItemTotalCount();
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
		// ✅ 첫 줄에 추가
		unreceivedItemItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalunreceivedItemCount = filteredData_purchaseUnreceivedItems.length;
		totalunreceivedItemPages = Math.ceil(totalunreceivedItemCount / unreceivedItemItemsPerPage);

		// 현재 페이지 범위 계산
		const startIndex = (currentunreceivedItemPage - 1) * unreceivedItemItemsPerPage;
		const endIndex = startIndex + unreceivedItemItemsPerPage;

		// 현재 페이지 데이터 추출
		globalUnreceivedItemData = filteredData_purchaseUnreceivedItems.slice(startIndex, endIndex);
		window.filteredunreceivedItemData = globalUnreceivedItemData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		// 같은 컬럼 클릭 시 정렬 방향 토글
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		// 데이터 정렬
		filteredData_purchaseUnreceivedItems.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

			// 데이터 타입별 처리
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

		// 페이지 1로 초기화 후 다시 페이징
		currentunreceivedItemPage = 1;
		applyClientPagination();

		// 테이블 업데이트
		renderunreceivedItemTableData();
		renderunreceivedItemPagination();
		updateunreceivedItemTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderunreceivedItemView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_unreceivedItems">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
					    <div class="search-row">
					    	<!-- ✅ 검색구분자 (미도착 / 배송완료) 추가 -->
							<div class="search-label">
							    <div class="searchVal_status">${i18n.t('search.arrival')}<!-- 상태 --></div>
							    <select id="unreceivedItem_searchVal_status">
							        <option value="all">${i18n.t('common.all')}<!-- 전체 --></option>
							        <option value="N">${i18n.t('search.unreceived')}<!-- 미도착 --></option>
							        <option value="Y">${i18n.t('search.delivered')}<!-- 배송완료 --></option>
							    </select>
							</div>
					        <div class="search-label">
					            <div class="searchVal_fromDate">${i18n.t('search.arrivaldate')}<!-- 생성일 --></div>
					            <input type="date" id="unreceivedItem_searchVal_fromDate" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_toDate">　</div>
					            <input type="date" id="unreceivedItem_searchVal_toDate" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_invoiceNo">${i18n.t('search.invoiceNo')}<!-- 인보이스 번호 --></div>
					            <input type="text" id="unreceivedItem_searchVal_invoiceNo" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_containerNo">${i18n.t('search.containerNo')}<!-- 컨테이너 번호 --></div>
					            <input type="text" id="unreceivedItem_searchVal_containerNo" />
					        </div>
					    </div>
					    <div class="search_button_area">
					        <button class="btn btn-primary btnunreceivedItemSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
					        <button class="btn btn-secondary btnunreceivedItemSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="unreceivedItemTotalCount">${totalunreceivedItemCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="unreceivedItemCurrentPageInfo">${currentunreceivedItemPage}</strong>/<strong id="unreceivedItemTotalPageInfo">${totalunreceivedItemPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="unreceivedItemTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_unreceivedItems">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-secondary" id="unreceivedItemDeliveryConfirmCancelBtn" style="">${i18n.t('search.deliveryConfirmCancel')}</button>
								</div>
								<div id="defaultActions" class="action-group">
									<button class="btn btn-info" id="unreceivedItemDeliveryConfirmBtn" style="">${i18n.t('search.deliveryConfirm')}</button>
								</div>
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="unreceivedItemExcelBtn" onclick="downloadAllunreceivedItemData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_unreceivedItems" id="unreceivedItemTable">
							<thead>
								<tr>
									<th class = 'checkboxVal'>
										<input type="checkbox" class="unreceivedItems_chkAll">
									</th>
									<th class='noVal'>${i18n.t('table.no')}<!-- No --></th>
									<th class='cucodeVal' data-sort="STATUS">${i18n.t('search.arrival')}<!-- status --></th>
									<th class='dateVal' data-sort="OUTDATE">${i18n.t('search.date')}<!-- date --></th>
									<th class='cucodeVal' data-sort="CUSTNAME">${i18n.t('search.cname')}<!-- date --></th>
									<th class='invoiceNoVal' data-sort="INVOICENO">${i18n.t('search.invoiceNo')}<!-- INVOICE_NO --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class='qtyVal' data-sort="COUNT" data-type="number">${i18n.t('search.count')}<!-- CNT --></th>
									<th class='cucodeVal' data-sort="CONTAINER">${i18n.t('search.containerNo')}<!-- CONTAINER --></th>
									<th class='cucodeVal' data-sort="SECURITY">${i18n.t('search.securitySeal')}<!-- SECURITY --></th>
									<th class='cucodeVal' data-sort="BOX1">BOX1<!-- BOX1 --></th>
									<th class='cucodeVal' data-sort="BOX2">BOX2<!-- BOX2 --></th>
									<th class='cucodeVal' data-sort="BOX3">BOX3<!-- BOX3 --></th>
									<th class='portVal' data-sort="CARRIER">CARRIER<!-- CARRIER --></th>
									<th class='portVal' data-sort="DATENO">DATENO<!-- DATENO --></th>
									<th class='portVal' data-sort="FOWARDING">FOWARDING<!-- FOWARDING --></th>
								</tr>
							</thead>
							<tbody id="unreceivedItemDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="unreceivedItemPaginationContainer">
						</div>
						<div class="items-per-page-selector">
						    <label for="unreceivedItem_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
						    <select id="unreceivedItem_itemsPerPage" class="items-per-page-select">
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
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#unreceivedItem_searchVal_toDate").val(toDate);
			$("#unreceivedItem_searchVal_fromDate").val(fromDate);

			// ✅ 추가
			$("#unreceivedItem_itemsPerPage").val(unreceivedItemItemsPerPage);
		})();

		// 테이블 데이터 렌더링
		renderunreceivedItemTableData();
		// 페이지네이션 렌더링
		renderunreceivedItemPagination();
		// 이벤트 바인딩
		bindunreceivedItemEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateunreceivedItemTotalCount();
	}

	function fmtLocalDate(d) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${dd}`;
	}

	function getDefaultDateRange() {
		const today = new Date();
		// 이번 달 1일
		const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

		// 이번 달 마지막 날
		const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		const toDate = fmtLocalDate(lastDay);
		const fromDate = fmtLocalDate(firstDay);
		return { fromDate, toDate };
	}

	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// ✅ 추가
	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function updateunreceivedItemTotalCount() {
		$('#unreceivedItemTotalCount').text(Number(totalunreceivedItemCount).toLocaleString());
		$('#unreceivedItemCurrentPageInfo').text(currentunreceivedItemPage);
		$('#unreceivedItemTotalPageInfo').text(totalunreceivedItemPages);
	}

	function renderunreceivedItemTableData() {
		let tableBody = "";

		for (let i = 0; i < globalUnreceivedItemData.length; i++) {
			let rowNumber = (currentunreceivedItemPage - 1) * unreceivedItemItemsPerPage + i + 1;
			let data = globalUnreceivedItemData[i];

			// ✅ 상태 판단: status가 있으면 delivered, 없으면 unreceived
			const isConfirm = (data.COMPLETE_YN ?? "").toString().trim();
			const statusKey = isConfirm === "Y"? "delivered" : "unreceived";
			const statusText = statusKey === "delivered"
				? (i18n.t("search.delivered") || "Delivered")
				: (i18n.t("search.unreceived") || "Not Arrived");

			const statusHtml = `
				<td class="cucodeVal">
					<span class="status-badge ${statusKey}">${statusText}</span>
				</td>
			`;

			tableBody += `
            <tr>
                <td class='checkboxVal'><input type="checkbox" class="unreceivedItems_chk" data-unique="${data.OUTDATE}|${data.INVOICENO}"></td>
                <td class='noVal'>${rowNumber}</td>
                ${statusHtml}
                <td class='dateVal'>${data.OUTDATE || ''}</td>
                <td class='cucodeVal'>${data.CUSTNAME || ''}</td>
                <td class='invoiceNoVal'>${data.INVOICENO || ''}</td>
                <td class='qtyVal'>${Number(data.QTY || '').toLocaleString()}</td>
                <td class='qtyVal'>${Number(data.COUNT || '').toLocaleString()}</td>
                <td class='cucodeVal'>${data.CONTAINER || ''}</td>
                <td class='cucodeVal'>${data.SECURITY || ''}</td>
                <td class='cucodeVal'>${data.BOX1 || ''}</td>
                <td class='cucodeVal'>${data.BOX2 || ''}</td>
                <td class='cucodeVal'>${data.BOX3 || ''}</td>
                <td class='portVal'>${data.CARRIER || ''}</td>
                <td class='portVal'>${data.DATENO || ''}</td>
                <td class='portVal'>${data.FOWARDING || ''}</td>
            </tr>
        `;
		}

		$("#unreceivedItemDetailTableBody").html(tableBody);
	}


	function renderunreceivedItemPagination() {
		let paginationHtml = "";

		if (currentunreceivedItemPage > 1) {
			paginationHtml += `<button class="unreceivedItem-page-btn" data-page="${currentunreceivedItemPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="unreceivedItem-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentunreceivedItemPage - 5);
		let endPage = Math.min(totalunreceivedItemPages, currentunreceivedItemPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="unreceivedItem-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentunreceivedItemPage) {
				paginationHtml += `<button class="unreceivedItem-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="unreceivedItem-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalunreceivedItemPages) {
			if (endPage < totalunreceivedItemPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="unreceivedItem-page-btn" data-page="${totalunreceivedItemPages}">${totalunreceivedItemPages}</button>`;
		}

		if (currentunreceivedItemPage < totalunreceivedItemPages) {
			paginationHtml += `<button class="unreceivedItem-page-btn" data-page="${currentunreceivedItemPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="unreceivedItem-page-btn disabled">&gt;</button>`;
		}

		$("#unreceivedItemPaginationContainer").html(paginationHtml);
	}

	function bindunreceivedItemEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnunreceivedItemSearch").off('click').on('click', function() {
			performunreceivedItemSearch();
		});

		// 초기화 버튼 클릭
		$(".btnunreceivedItemSearchInit").off('click').on('click', function() {
			resetunreceivedItemSearch();
		});

		// ✅ 페이지당 항목 수 변경 이벤트 추가
		$('#unreceivedItem_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeunreceivedItemItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
		$(document).off('click', '.unreceivedItem-page-btn').on('click', '.unreceivedItem-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentunreceivedItemPage = page;
					applyClientPagination();
					renderunreceivedItemTableData();
					renderunreceivedItemPagination();
					updateunreceivedItemTotalCount();
				}
			}
		});

		// 헤더 클릭 시 정렬
		$('#unreceivedItemTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mPurchase_unreceivedItems input[type="text"], #view_mPurchase_unreceivedItems input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performunreceivedItemSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			status: $("#unreceivedItem_searchVal_status").val(),
			toDate: $("#unreceivedItem_searchVal_toDate").val(),
			fromDate: $("#unreceivedItem_searchVal_fromDate").val(),
			//arrivalFromDate: $("#unreceivedItem_searchVal_arrivalFromDate").val(),
			//arrivalToDate: $("#unreceivedItem_searchVal_arrivalToDate").val(),
			invoiceNo: $("#unreceivedItem_searchVal_invoiceNo").val().trim().toUpperCase(),
			//portOfDeparture: $("#unreceivedItem_searchVal_portOfDeparture").val().trim().toUpperCase(),
			//portOfArrival: $("#unreceivedItem_searchVal_portOfArrival").val().trim().toUpperCase(),
			containerNo: $("#unreceivedItem_searchVal_containerNo").val().trim().toUpperCase(),
			//securitySeal: $("#unreceivedItem_searchVal_securitySeal").val().trim().toUpperCase(),
			//cucode: $("#unreceivedItem_searchVal_cucode").val().trim().toUpperCase(),
			// blcode: $("#unreceivedItem_searchVal_blcode").val().trim().toUpperCase()
		};
	}

	function performunreceivedItemSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentunreceivedItemPage = 1;
		performunreceivedItemDBSearch(searchCriteria);
	}

	function resetunreceivedItemSearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		$("#unreceivedItem_searchVal_status").val("all"),
			$("#unreceivedItem_searchVal_fromDate").val(fromDate);
		$("#unreceivedItem_searchVal_toDate").val(toDate);
		$("#unreceivedItem_searchVal_car").val('');
		$("#unreceivedItem_searchVal_itemcode").val('');
		$("#unreceivedItem_searchVal_itemname").val('');

		currentunreceivedItemPage = 1;
		performunreceivedItemDBSearch({ toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".unreceivedItemTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeunreceivedItemItemsPerPage = function(newItemsPerPage) {
		unreceivedItemItemsPerPage = newItemsPerPage;
		currentunreceivedItemPage = 1;

		// ✅ 쿠키에 저장 추가
		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderunreceivedItemTableData();
		renderunreceivedItemPagination();
		updateunreceivedItemTotalCount();
	}

	window.exportunreceivedItemData = function() {
		return {
			total: filteredData_purchaseUnreceivedItems.length,
			currentPage: currentunreceivedItemPage,
			itemsPerPage: unreceivedItemItemsPerPage,
			data: filteredData_purchaseUnreceivedItems
		};
	}
	

	// ✅ 체크 항목 상태 검사 (cucodeVal 안의 status-badge 기준)
	function validateSelectedDeliveryStatus(mode) {
		// mode: "confirm" | "cancel"
		let hasInvalid = false;

		$(".unreceivedItems_chk:checked").each(function() {
			const $tr = $(this).closest("tr");
			const $badge = $tr.find("td.cucodeVal .status-badge"); // ✅ 요청하신 위치

			const isUnreceived = $badge.hasClass("unreceived");
			const isDelivered = $badge.hasClass("delivered");

			if (mode === "cancel" && isUnreceived) {
				alert(i18n.t("validation.cannot.cancel.unreceived"));
				hasInvalid = true;
				return false; // break each
			}

			if (mode === "confirm" && isDelivered) {
				alert(i18n.t("validation.cannot.confirm.delivered"));
				hasInvalid = true;
				return false; // break each
			}
		});

		return !hasInvalid;
	}

	$(document).on("click", "#unreceivedItemDeliveryConfirmBtn", function() {

		const iidList = [];
		$(".unreceivedItems_chk:checked").each(function() {
			let iid = $(this).data('unique');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}
		// ✅ Delivered 포함이면 배송완료 버튼 불가
		if (!validateSelectedDeliveryStatus("confirm")) return;

		console.log("Confirm Btn");
		console.log(iidList);
		if (confirm("Do you want to complete the delivery?")) {
			showLoading("data");
			$.ajax({
				url: "/unreceivedItemDeliveryConfirm",
				type: "POST",
				data: JSON.stringify(iidList),
				contentType: "application/json",
				success: function(data) {
					console.log("-- Supplier update --");
					console.log(data);

					alert("Delivery has been completed successfully."); // ✅ 완료 얼럿(영어)

					let searchCriteria = getCurrentSearchCriteria();
					performunreceivedItemDBSearch(searchCriteria);
				},
				error: function(xhr, status, error) {
					console.error("DB 조회 실패:", error);
					hideLoading();
					alert("Fail");
				}
			});
		}
	});

	$(document).on("click", "#unreceivedItemDeliveryConfirmCancelBtn", function() {

		const iidList = [];
		$(".unreceivedItems_chk:checked").each(function() {
			let iid = $(this).data('unique');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		// ✅ unreceived 포함이면 취소 버튼 불가
		if (!validateSelectedDeliveryStatus("cancel")) return;

		console.log("Confirm Btn");
		console.log(iidList);
		if (confirm("Do you want to cancel the delivery?")) {
			showLoading("data");
			$.ajax({
				url: "/unreceivedItemDeliveryConfirmCancel",
				type: "POST",
				data: JSON.stringify(iidList),
				contentType: "application/json",
				success: function(data) {
					console.log("-- Confirm Cancel update --");
					console.log(data);

					alert("Delivery has been canceled successfully."); // ✅ 완료 얼럿(영어)
					let searchCriteria = getCurrentSearchCriteria();
					performunreceivedItemDBSearch(searchCriteria);
				},
				error: function(xhr, status, error) {
					console.error("DB 조회 실패:", error);
					hideLoading();
					alert("Fail");
				}
			});
		}
	});
	$(document).on('click', '.unreceivedItems_chkAll', function() {
		const isChecked = $(this).prop('checked');
		$('input.unreceivedItems_chk').prop('checked', isChecked);
	});
	
});

// 전체 데이터 엑셀 다운로드
window.downloadAllunreceivedItemData = function() {
	let searchCriteria = {
		status: $("#unreceivedItem_searchVal_status").val(),
		toDate: $("#unreceivedItem_searchVal_toDate").val(),
		fromDate: $("#unreceivedItem_searchVal_fromDate").val(),
		//arrivalFromDate: $("#unreceivedItem_searchVal_arrivalFromDate").val(),
		//arrivalToDate: $("#unreceivedItem_searchVal_arrivalToDate").val(),
		//invoiceNo: $("#unreceivedItem_searchVal_invoiceNo").val().trim().toUpperCase(),
		//portOfDeparture: $("#unreceivedItem_searchVal_portOfDeparture").val().trim().toUpperCase(),
		//portOfArrival: $("#unreceivedItem_searchVal_portOfArrival").val().trim().toUpperCase(),
		containerNo: $("#unreceivedItem_searchVal_containerNo").val().trim().toUpperCase(),
		//securitySeal: $("#unreceivedItem_searchVal_securitySeal").val().trim().toUpperCase(),
		//cucode: $("#unreceivedItem_searchVal_cucode").val().trim().toUpperCase(),
		// blcode: $("#unreceivedItem_searchVal_blcode").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_unreceivedItem",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log(response);

			ExcelExporter.downloadExcel(filteredData_purchaseUnreceivedItems, window.unreceivedItemColumns, {
				fileName: 'unreceivedItem_All',
				sheetName: 'unreceivedItem'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};











