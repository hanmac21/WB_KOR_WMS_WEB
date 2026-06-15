/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_validationDetail = [];
let globalValidationDetailData = [];
let currentValidationDetailPage = 1;
let validationDetailItemsPerPage = 100;
let totalValidationDetailCount = 0;
let totalValidationDetailPages = 0;
let totalQty = 0;
let totalCartQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function () {
    window.filteredValidationDetailData = [];
    window.validationDetailColumns = [
        {key: 'SDATE', header: 'Date'},
        {key: 'CARTBARCODE', header: 'Cart barcode'},
        {key: 'ASSYBARCODE', header: 'ASSY barcode'},
        {key: 'ASSYQTY', header: 'Qty', type:'number' },
        {key: 'ITEMCODE', header: 'Itemcode'},
        {key: 'OITEMCODE', header: 'SPEC'},
        {key: 'SOURCE', header: 'Source'},
    ];

    // 메인 호출 함수 - 메뉴 클릭 시 호출
    window.call_mPurchase_validation_detail = function (menuId) {
        showLoading("data");
        const {fromDate, toDate} = getDefaultDateRange();

        performValidationDetailDBSearch({fromDate, toDate});
    };

    // DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
    function performValidationDetailDBSearch(searchCriteria) {
        showLoading("data");
        $.ajax({
            url: "/read_validationDetail",
            type: "POST",
            data: JSON.stringify({
                searchParams: searchCriteria
            }),
            contentType: "application/json",
            success: function (response) {
                console.log("-- DB 조회 결과 (전체) --");
                console.log(response);

                // 서버에서 받은 전체 데이터 저장
                allServerData = response.records || [];
                filteredData_validationDetail = [...allServerData];
                totalQty = response.totalQty || 0;
                totalCartQty = response.totalCartQty || 0;

                // 페이지 초기화
                currentValidationDetailPage = 1;
                currentSortColumn = null;
                currentSortOrder = 'asc';

                // 클라이언트에서 페이징 처리
                applyClientPagination();

                // 첫 번째 검색이라면 뷰를 렌더링
                if (!$('#view_mPurchase_validation_detail').length) {
                    renderValidationDetailView();
                } else {
                    renderValidationDetailTableData();
                    renderValidationDetailPagination();
                    updateValidationDetailTotalCount();
                }

                hideLoading();
            },
            error: function (xhr, status, error) {
                console.error("DB 조회 실패:", error);
                hideLoading();
                alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
            }
        });
    }

    // 클라이언트에서 페이징 처리
    function applyClientPagination() {
        validationDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

        totalValidationDetailCount = filteredData_validationDetail.length;
        totalValidationDetailPages = Math.ceil(totalValidationDetailCount / validationDetailItemsPerPage);

        const startIndex = (currentValidationDetailPage - 1) * validationDetailItemsPerPage;
        const endIndex = startIndex + validationDetailItemsPerPage;

        globalValidationDetailData = filteredData_validationDetail.slice(startIndex, endIndex);
        window.filteredValidationDetailData = globalValidationDetailData;
    }

    // 클라이언트에서 정렬 처리
    function applyClientSort(column, dataType) {
        if (currentSortColumn === column) {
            currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = column;
            currentSortOrder = 'asc';
        }

        filteredData_validationDetail.sort((a, b) => {
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

        currentValidationDetailPage = 1;
        applyClientPagination();

        renderValidationDetailTableData();
        renderValidationDetailPagination();
        updateValidationDetailTotalCount();

        updateSortIndicators(column);

    }

    // 헤더에 정렬 방향 표시
    function updateSortIndicators(column) {
        $('.data-table thead th').removeClass('sort-asc sort-desc');
        $(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
    }

    // 사용자 뷰 렌더링 함수
    function renderValidationDetailView() {
        let content_output = `
			<div class="divBlockControl" id="view_mPurchase_validation_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- FromTo --></div>
								<input type="date" id="validationDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="validationDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="search_cartbarcode">${i18n.t('search.cartbarcode')}<!-- CART BARCODE --></div>
								<input type="text" id="validationDetail_searchVal_cartbarcode" />
							</div>
							<div class="search-label">
								<div class="search_assybarcode">${i18n.t('search.assybarcode')}<!-- ASSY BARCODE --></div>
								<input type="text" id="validationDetail_searchVal_assybarcode" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="validationDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_spec">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="validationDetail_searchVal_spec" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnValidationDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnValidationDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="validationDetailTotalCount">${totalValidationDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="validationDetailCurrentPageInfo">${currentValidationDetailPage}</strong>/<strong id="validationDetailTotalPageInfo">${totalValidationDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.cartqty')} : </span><span class="validationDetailTotalCartQty" style="color:#007bff"></span> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="validationDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_validation_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="validationDetailExcelBtn" onclick="downloadAllValidationDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_validation_detail" id="validationDetailTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}<!-- NO --></th>
									<th class='dateVal' data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class='barcodeVal transysBarcodeVal' data-sort="CARTBARCODE">${i18n.t('search.cartbarcode')}<!-- BARCODE --></th>
									<th class='transysBarcodeVal' data-sort="ASSYBARCODE">${i18n.t('search.assybarcode')}<!-- BARCODE --></th>
									<th class='qtyVal' data-sort="ASSYQTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class='itemcodeVal' data-sort="OITEMCODE">${i18n.t('search.customercode')}<!-- SPEC --></th>
									<th class='sourceVal' data-sort="SOURCE">${i18n.t('search.source')}<!-- SPEC --></th>
								</tr>
							</thead>
							<tbody id="validationDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="validationDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="validationDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="validationDetail_itemsPerPage" class="items-per-page-select">
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
        const {fromDate, toDate} = getDefaultDateRange();
        $("#validationDetail_searchVal_fromDate").val(fromDate);
        $("#validationDetail_searchVal_toDate").val(toDate);
        $("#validationDetail_itemsPerPage").val(validationDetailItemsPerPage);

        // 테이블 데이터 렌더링
        renderValidationDetailTableData();
        // 페이지네이션 렌더링
        renderValidationDetailPagination();
        // 이벤트 바인딩
        bindValidationDetailEvents();
        // 초기 렌더링 후 카운트 업데이트
        updateValidationDetailTotalCount();
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
        return {fromDate, toDate};
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

    function updateValidationDetailTotalCount() {
        $(".validationDetailTotalQty").text(Number(totalQty).toLocaleString());
        $(".validationDetailTotalCartQty").text(Number(totalCartQty).toLocaleString());
        $('#validationDetailTotalCount').text(Number(totalValidationDetailCount).toLocaleString());
        $('#validationDetailCurrentPageInfo').text(currentValidationDetailPage);
        $('#validationDetailTotalPageInfo').text(totalValidationDetailPages);
    }

    function renderValidationDetailTableData() {
        let tableBody = "";

        for (let i = 0; i < globalValidationDetailData.length; i++) {
            let rowNumber = (currentValidationDetailPage - 1) * validationDetailItemsPerPage + i + 1;
            let data = globalValidationDetailData[i];

            tableBody += `
				<tr>
				    <td class = "noVal">${rowNumber}</td>
				    <td class = 'dateVal'>${data.SDATE || data.sdate || ''}</td>
					<td class = 'barcodeVal transysBarcodeVal'>${data.CARTBARCODE || data.cartbarcode || ''}</td>
					<td class = 'transysBarcodeVal'>${data.ASSYBARCODE || data.assybarcode || ''}</td>
				    <td class = 'qtyVal'>${Number(data.ASSYQTY || data.assyqty || 0).toLocaleString()}</td>
				    <td class = 'itemcodeVal'>${data.ITEMCODE || data.itemcode || ''}</td>
				    <td class = 'itemcodeVal'>${data.OITEMCODE || data.oitemcode || ''}</td>
					<td class = 'sourceVal'>${data.SOURCE || data.source || ''}</td>
				</tr>
			`;
        }

        $("#validationDetailTableBody").html(tableBody);
    }

    function renderValidationDetailPagination() {
        let paginationHtml = "";

        if (currentValidationDetailPage > 1) {
            paginationHtml += `<button class="validationDetail-page-btn" data-page="${currentValidationDetailPage - 1}">&lt;</button>`;
        } else {
            paginationHtml += `<button class="validationDetail-page-btn disabled">&lt;</button>`;
        }

        let startPage = Math.max(1, currentValidationDetailPage - 5);
        let endPage = Math.min(totalValidationDetailPages, currentValidationDetailPage + 5);

        if (startPage > 1) {
            paginationHtml += `<button class="validationDetail-page-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHtml += `<span class="page-dots">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === currentValidationDetailPage) {
                paginationHtml += `<button class="validationDetail-page-btn active" data-page="${i}">${i}</button>`;
            } else {
                paginationHtml += `<button class="validationDetail-page-btn" data-page="${i}">${i}</button>`;
            }
        }

        if (endPage < totalValidationDetailPages) {
            if (endPage < totalValidationDetailPages - 1) {
                paginationHtml += `<span class="page-dots">...</span>`;
            }
            paginationHtml += `<button class="validationDetail-page-btn" data-page="${totalValidationDetailPages}">${totalValidationDetailPages}</button>`;
        }

        if (currentValidationDetailPage < totalValidationDetailPages) {
            paginationHtml += `<button class="validationDetail-page-btn" data-page="${currentValidationDetailPage + 1}">&gt;</button>`;
        } else {
            paginationHtml += `<button class="validationDetail-page-btn disabled">&gt;</button>`;
        }

        $("#validationDetailPaginationContainer").html(paginationHtml);
    }

    function bindValidationDetailEvents() {
        $(".btnValidationDetailSearch").off('click').on('click', function () {
            performValidationDetailSearch();
        });

        $(".btnValidationDetailSearchInit").off('click').on('click', function () {
            resetValidationDetailSearch();
        });

        $('#validationDetail_itemsPerPage').off('change').on('change', function () {
            const newItemsPerPage = parseInt($(this).val());
            changeValidationDetailItemsPerPage(newItemsPerPage);
        });

        $(document).off('click', '.validationDetail-page-btn').on('click', '.validationDetail-page-btn', function () {
            if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
                let page = parseInt($(this).data('page'));
                if (page && page > 0) {
                    currentValidationDetailPage = page;
                    applyClientPagination();
                    renderValidationDetailTableData();
                    renderValidationDetailPagination();
                    updateValidationDetailTotalCount();
                }
            }
        });

        $('#validationDetailTable thead th[data-sort]').off('click').on('click', function () {
            const column = $(this).data('sort');
            const dataType = $(this).data('type') || 'string';
            applyClientSort(column, dataType);
        });

        $('#view_mPurchase_validation_detail input[type="text"], #view_mPurchase_validation_detail input[type="date"]').off('keypress').on('keypress', function (e) {
            if (e.which === 13) {
                performValidationDetailSearch();
            }
        });
    }

    function getCurrentSearchCriteria() {
        return {
            fromDate: $("#validationDetail_searchVal_fromDate").val(),
            toDate: $("#validationDetail_searchVal_toDate").val(),
            cartBarcode: $("#validationDetail_searchVal_cartbarcode").val().trim().toUpperCase(),
            assyBarcode: $("#validationDetail_searchVal_assybarcode").val().trim().toUpperCase(),
            itemcode: $("#validationDetail_searchVal_itemcode").val().trim().toUpperCase(),
            oitemcode: $("#validationDetail_searchVal_spec").val().trim().toUpperCase(),
        };
    }

    function performValidationDetailSearch() {
        let searchCriteria = getCurrentSearchCriteria();
        console.log("검색 조건:", searchCriteria);

        currentValidationDetailPage = 1;
        performValidationDetailDBSearch(searchCriteria);
    }

    function resetValidationDetailSearch() {
        const {fromDate, toDate} = getDefaultDateRange();

        $("#validationDetail_searchVal_fromDate").val(fromDate);
        $("#validationDetail_searchVal_toDate").val(toDate);
        $("#validationDetail_searchVal_cartbarcode").val('');
        $("#validationDetail_searchVal_assybarcode").val('');
        $("#validationDetail_searchVal_itemcode").val('');
        $("#validationDetail_searchVal_spec").val('');

        currentValidationDetailPage = 1;
        performValidationDetailDBSearch({fromDate, toDate});

        console.log('검색 조건이 초기화되었습니다.');
    }

    window.changeValidationDetailItemsPerPage = function (newItemsPerPage) {
        validationDetailItemsPerPage = newItemsPerPage;
        currentValidationDetailPage = 1;

        setCookie('itemsPerPage', newItemsPerPage);

        applyClientPagination();
        renderValidationDetailTableData();
        renderValidationDetailPagination();
        updateValidationDetailTotalCount();

        console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
    }

    window.exportValidationDetailData = function () {
        return {
            total: filteredData_validationDetail.length,
            currentPage: currentValidationDetailPage,
            itemsPerPage: validationDetailItemsPerPage,
            data: filteredData_validationDetail
        };
    }
});

// 전체 데이터 엑셀 다운로드
window.downloadAllValidationDetailData = function () {
    showLoading("export");

    const processedData = filteredData_validationDetail.map(item => {
        return {
            ...item
        };
    });

    ExcelExporter.downloadExcel(processedData, window.validationDetailColumns, {
        fileName: 'validationDetail_All',
        sheetName: 'validationDetail'
    });

    hideLoading();
};
