/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = []; // 서버에서 받은 전체 데이터 (원본)
let filteredData_purchaseUnreceivedItems = []; // 검색 필터링된 데이터
let globalUnreceivedItemData = []; // 현재 페이지에 표시될 데이터
let currentUnreceivedItemCodesPage = 1; // 현재 페이지
let unreceivedItemCodesItemsPerPage = 1000; // 페이지당 항목 수
let totalUnreceivedItemCodesCount = 0; // 총 개수
let totalUnreceivedItemCodesPages = 0; // 총 페이지
let totalQty = 0; // 총 수량
let currentSortColumn = null; // 현재 정렬 컬럼
let currentSortOrder = 'asc'; // 현재 정렬 방향

$(document).ready(function() {

	window.filteredUnreceivedItemCodesData = [];
	window.unreceivedItemCodesColumns = [
		{ key: 'OUTDATE', header: 'DATE' },
		{ key: 'CUSTNAME', header: 'CUST NAME' },
		{ key: 'INVOICENO', header: 'INVOICE NO' },
		{ key: 'ITEMCODE', header: 'ITEMCODE' },
		{ key: 'OITEMCODE', header: 'SPEC' },
		{ key: 'ITEMNAME', header: 'ITEMNAME' },
		{ key: 'QTY', header: 'QTY', type: 'number' },
		{ key: 'CONTAINER', header: 'CONTAINER' },
		{ key: 'SECURITY', header: 'SECURITY' },
		{ key: 'BOX1', header: 'BOX1' },
		{ key: 'BOX2', header: 'BOX2' },
		{ key: 'BOX3', header: 'BOX3' },
		{ key: 'CARRIER', header: 'CARRIER' },
		{ key: 'DATENO', header: 'DATENO' },
		{ key: 'FOWARDING', header: 'FOWARDING' },
		{ key: 'BARCODE', header: 'BARCODE' },
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_unreceivedItemcodes = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		performUnreceivedItemCodesDBSearch({ toDate, fromDate });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performUnreceivedItemCodesDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_unreceivedItemCodes",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
				// page, itemsPerPage 없음 = 전체 조회
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				// 서버에서 받은 전체 데이터 저장
				allServerData = response.records || [];
				filteredData_purchaseUnreceivedItems = [...allServerData]; // 초기에는 필터링 없음
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentUnreceivedItemCodesPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_unreceivedItemcodes').length) {
					renderUnreceivedItemCodesView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderUnreceivedItemCodesTableData();
					renderUnreceivedItemCodesPagination();
					updateUnreceivedItemCodesTotalCount();
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
		unreceivedItemCodesItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalUnreceivedItemCodesCount = filteredData_purchaseUnreceivedItems.length;
		totalUnreceivedItemCodesPages = Math.ceil(totalUnreceivedItemCodesCount / unreceivedItemCodesItemsPerPage);

		// 현재 페이지 범위 계산
		const startIndex = (currentUnreceivedItemCodesPage - 1) * unreceivedItemCodesItemsPerPage;
		const endIndex = startIndex + unreceivedItemCodesItemsPerPage;

		// 현재 페이지 데이터 추출
		globalUnreceivedItemData = filteredData_purchaseUnreceivedItems.slice(startIndex, endIndex);
		window.filteredUnreceivedItemCodesData = globalUnreceivedItemData;
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
		currentUnreceivedItemCodesPage = 1;
		applyClientPagination();

		// 테이블 업데이트
		renderUnreceivedItemCodesTableData();
		renderUnreceivedItemCodesPagination();
		updateUnreceivedItemCodesTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderUnreceivedItemCodesView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_unreceivedItemcodes">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
					    <div class="search-row">
					        <div class="search-label">
					            <div class="searchVal_fromDate">${i18n.t('search.arrivaldate')}<!-- 생성일 --></div>
					            <input type="date" id="unreceivedItemCodes_searchVal_fromDate" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_toDate">　</div>
					            <input type="date" id="unreceivedItemCodes_searchVal_toDate" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_invoiceNo">${i18n.t('search.invoiceNo')}<!-- 인보이스 번호 --></div>
					            <input type="text" id="unreceivedItemCodes_searchVal_invoiceNo" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_containerNo">${i18n.t('search.containerNo')}<!-- 컨테이너 번호 --></div>
					            <input type="text" id="unreceivedItemCodes_searchVal_containerNo" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- 품번 --></div>
					            <input type="text" id="unreceivedItemCodes_searchVal_itemcode" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_oitemcode">${i18n.t('search.customercode')}<!-- 고객사 품번 --></div>
					            <input type="text" id="unreceivedItemCodes_searchVal_oitemcode" />
					        </div>
					        <div class="search-label">
					            <div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- 품명 --></div>
					            <input type="text" id="unreceivedItemCodes_searchVal_itemname" />
					        </div>
					    </div>
					    <div class="search_button_area">
					        <button class="btn btn-primary btnUnreceivedItemCodesSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
					        <button class="btn btn-secondary btnUnreceivedItemCodesSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="unreceivedItemCodesTotalCount">${totalUnreceivedItemCodesCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="unreceivedItemCodesCurrentPageInfo">${currentUnreceivedItemCodesPage}</strong>/<strong id="unreceivedItemCodesTotalPageInfo">${totalUnreceivedItemCodesPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="unreceivedItemCodesTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_unreceivedItemcodes">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="unreceivedItemCodesExcelBtn" onclick="downloadAllUnreceivedItemCodesData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_unreceivedItemcodes" id="unreceivedItemCodesTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- No --></th>
									<th class='dateVal' data-sort="OUTDATE">${i18n.t('search.date')}<!-- date --></th>
									<th class='cucodeVal' data-sort="CUSTNAME">${i18n.t('search.cname')}<!-- date --></th>
									<th class='invoiceNoVal' data-sort="INVOICENO">${i18n.t('search.invoiceNo')}<!-- INVOICE_NO --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- INVOICE_NO --></th>
									<th class='cnameVal' data-sort="OITEMCODE">${i18n.t('search.customercode')}<!-- INVOICE_NO --></th>
									<th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- INVOICE_NO --></th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class='cucodeVal' data-sort="CONTAINER">${i18n.t('search.containerNo')}<!-- CONTAINER --></th>
									<th class='cucodeVal' data-sort="SECURITY">${i18n.t('search.securitySeal')}<!-- SECURITY --></th>
									<th class='cucodeVal' data-sort="BOX1">BOX1<!-- BOX1 --></th>
									<th class='cucodeVal' data-sort="BOX2">BOX2<!-- BOX2 --></th>
									<th class='cucodeVal' data-sort="BOX3">BOX3<!-- BOX3 --></th>
									<th class='portVal' data-sort="CARRIER">CARRIER<!-- CARRIER --></th>
									<th class='portVal' data-sort="DATENO">DATENO<!-- DATENO --></th>
									<th class='portVal' data-sort="FOWARDING">FOWARDING<!-- FOWARDING --></th>
									<th class='barcodeVal' data-sort="BARCODE">${i18n.t('search.barcode')}<!-- BARCODE --></th>
								</tr>
							</thead>
							<tbody id="unreceivedItemCodesDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="unreceivedItemCodesPaginationContainer">
						</div>
						<div class="items-per-page-selector">
						    <label for="unreceivedItemCodes_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
						    <select id="unreceivedItemCodes_itemsPerPage" class="items-per-page-select">
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
			$("#unreceivedItemCodes_searchVal_toDate").val(toDate);
			$("#unreceivedItemCodes_searchVal_fromDate").val(fromDate);

			// ✅ 추가
			$("#unreceivedItemCodes_itemsPerPage").val(unreceivedItemCodesItemsPerPage);
		})();

		// 테이블 데이터 렌더링
		renderUnreceivedItemCodesTableData();
		// 페이지네이션 렌더링
		renderUnreceivedItemCodesPagination();
		// 이벤트 바인딩
		bindUnreceivedItemCodesEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateUnreceivedItemCodesTotalCount();
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

	// ✅ 추가
	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function updateUnreceivedItemCodesTotalCount() {
		$('#unreceivedItemCodesTotalCount').text(Number(totalUnreceivedItemCodesCount).toLocaleString());
		$('#unreceivedItemCodesCurrentPageInfo').text(currentUnreceivedItemCodesPage);
		$('#unreceivedItemCodesTotalPageInfo').text(totalUnreceivedItemCodesPages);
	}

	function renderUnreceivedItemCodesTableData() {
		let tableBody = "";

		for (let i = 0; i < globalUnreceivedItemData.length; i++) {
			let rowNumber = (currentUnreceivedItemCodesPage - 1) * unreceivedItemCodesItemsPerPage + i + 1;
			let data = globalUnreceivedItemData[i];

			tableBody += `
            <tr>
				<td class='noVal'>${rowNumber}</td>
                <td class='dateVal'>${data.OUTDATE || ''}</td>
                <td class='cucodeVal'>${data.CUSTNAME || ''}</td>
                <td class='invoiceNoVal'>${data.INVOICENO || ''}</td>
                <td class='itemcodeVal'>${data.ITEMCODE || ''}</td>
                <td class='cnameVal'>${data.OITEMCODE || ''}</td>
                <td class='itemnameLongVal'>${data.ITEMNAME || ''}</td>
                <td class='qtyVal'>${Number(data.QTY || '').toLocaleString()}</td>
                <td class='cucodeVal'>${data.CONTAINER || ''}</td>
                <td class='cucodeVal'>${data.SECURITY || ''}</td>
                <td class='cucodeVal'>${data.BOX1 || ''}</td>
                <td class='cucodeVal'>${data.BOX2 || ''}</td>
                <td class='cucodeVal'>${data.BOX3 || ''}</td>
                <td class='portVal'>${data.CARRIER || ''}</td>
                <td class='portVal'>${data.DATENO || ''}</td>
                <td class='portVal'>${data.FOWARDING || ''}</td>
                <td class='barcodeVal'>${data.BARCODE || ''}</td>
            </tr>
        `;
		}

		$("#unreceivedItemCodesDetailTableBody").html(tableBody);
	}

	function renderUnreceivedItemCodesPagination() {
		let paginationHtml = "";

		if (currentUnreceivedItemCodesPage > 1) {
			paginationHtml += `<button class="unreceivedItemCodes-page-btn" data-page="${currentUnreceivedItemCodesPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="unreceivedItemCodes-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentUnreceivedItemCodesPage - 5);
		let endPage = Math.min(totalUnreceivedItemCodesPages, currentUnreceivedItemCodesPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="unreceivedItemCodes-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentUnreceivedItemCodesPage) {
				paginationHtml += `<button class="unreceivedItemCodes-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="unreceivedItemCodes-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalUnreceivedItemCodesPages) {
			if (endPage < totalUnreceivedItemCodesPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="unreceivedItemCodes-page-btn" data-page="${totalUnreceivedItemCodesPages}">${totalUnreceivedItemCodesPages}</button>`;
		}

		if (currentUnreceivedItemCodesPage < totalUnreceivedItemCodesPages) {
			paginationHtml += `<button class="unreceivedItemCodes-page-btn" data-page="${currentUnreceivedItemCodesPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="unreceivedItemCodes-page-btn disabled">&gt;</button>`;
		}

		$("#unreceivedItemCodesPaginationContainer").html(paginationHtml);
	}

	function bindUnreceivedItemCodesEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnUnreceivedItemCodesSearch").off('click').on('click', function() {
			performUnreceivedItemCodesSearch();
		});

		// 초기화 버튼 클릭
		$(".btnUnreceivedItemCodesSearchInit").off('click').on('click', function() {
			resetUnreceivedItemCodesSearch();
		});

		// ✅ 페이지당 항목 수 변경 이벤트 추가
		$('#unreceivedItemCodes_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeUnreceivedItemCodesItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
		$(document).off('click', '.unreceivedItemCodes-page-btn').on('click', '.unreceivedItemCodes-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentUnreceivedItemCodesPage = page;
					applyClientPagination();
					renderUnreceivedItemCodesTableData();
					renderUnreceivedItemCodesPagination();
					updateUnreceivedItemCodesTotalCount();
				}
			}
		});

		// 헤더 클릭 시 정렬
		$('#unreceivedItemCodesTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mPurchase_unreceivedItemcodes input[type="text"], #view_mPurchase_unreceivedItemcodes input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performUnreceivedItemCodesSearch();
			}
		});
	}


	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#unreceivedItemCodes_searchVal_fromDate").val(),
			toDate: $("#unreceivedItemCodes_searchVal_toDate").val(),
			invoiceNo: $("#unreceivedItemCodes_searchVal_invoiceNo").val().trim().toUpperCase(),
			containerNo: $("#unreceivedItemCodes_searchVal_containerNo").val().trim().toUpperCase(),
			itemcode: $("#unreceivedItemCodes_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#unreceivedItemCodes_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#unreceivedItemCodes_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performUnreceivedItemCodesSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentUnreceivedItemCodesPage = 1;
		performUnreceivedItemCodesDBSearch(searchCriteria);
	}

	function resetUnreceivedItemCodesSearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		$("#unreceivedItemCodes_searchVal_fromDate").val(fromDate);
		$("#unreceivedItemCodes_searchVal_toDate").val(toDate);
		$("#unreceivedItemCodes_searchVal_invoiceNo").val('');
		$("#unreceivedItemCodes_searchVal_containerNo").val('');
		$("#unreceivedItemCodes_searchVal_itemcode").val('');
		$("#unreceivedItemCodes_searchVal_oitemcode").val('');
		$("#unreceivedItemCodes_searchVal_itemname").val('');

		currentUnreceivedItemCodesPage = 1;
		performUnreceivedItemCodesDBSearch({ toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".unreceivedItemCodesTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeUnreceivedItemCodesItemsPerPage = function(newItemsPerPage) {
		unreceivedItemCodesItemsPerPage = newItemsPerPage;
		currentUnreceivedItemCodesPage = 1;

		// ✅ 쿠키에 저장 추가
		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderUnreceivedItemCodesTableData();
		renderUnreceivedItemCodesPagination();
		updateUnreceivedItemCodesTotalCount();
	}

	window.exportUnreceivedItemCodesData = function() {
		return {
			total: filteredData_purchaseUnreceivedItems.length,
			currentPage: currentUnreceivedItemCodesPage,
			itemsPerPage: unreceivedItemCodesItemsPerPage,
			data: filteredData_purchaseUnreceivedItems
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllUnreceivedItemCodesData = function() {
	let searchCriteria = {
		fromDate: $("#unreceivedItemCodes_searchVal_fromDate").val(),
		toDate: $("#unreceivedItemCodes_searchVal_toDate").val(),
		invoiceNo: $("#unreceivedItemCodes_searchVal_invoiceNo").val().trim().toUpperCase(),
		containerNo: $("#unreceivedItemCodes_searchVal_containerNo").val().trim().toUpperCase(),
		itemcode: $("#unreceivedItemCodes_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#unreceivedItemCodes_searchVal_oitemcode").val().trim().toUpperCase(),
		itemname: $("#unreceivedItemCodes_searchVal_itemname").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_unreceivedItemCodes",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log(response);

			ExcelExporter.downloadExcel(filteredData_purchaseUnreceivedItems, window.unreceivedItemCodesColumns, {
				fileName: 'unreceivedItemCodes_All',
				sheetName: 'unreceivedItemCodes'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};



/*$(document).on("click", "#unreceivedItemDeliveryConfirmBtn", function() {

	const iidList = [];

	$(".unreceivedItemcodes_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	console.log("Confirm Btn");
	console.log(iidList);
	if (confirm("Do you really want to complete the delivery?")) {
		showLoading("data");
		$.ajax({
			url: "/unreceivedItemDeliveryConfirm",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				console.log("-- Supplier update --");
				console.log(data);
				$(".btnIncomingSummarySearch").trigger("click");
				hideLoading();
			},
			error: function(xhr, status, error) {
				console.error("DB 조회 실패:", error);
				hideLoading();
				alert("Fail");
			}
		});
	}
});
$(document).on('click', '.unreceivedItemcodes_chkAll', function () {
    const isChecked = $(this).prop('checked');
    $('input.unreceivedItemcodes_chk').prop('checked', isChecked);
});*/




