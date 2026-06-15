/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 제거 버전)
 * 비고: 전체 데이터를 한 번에 테이블에 렌더링
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_StockTotal = [];
let globalStockTotalData = [];
let totalStockTotalCount = 0;
let totalQty = 0;

$(document).ready(function () {

    window.filteredStockTotalData = [];
    window.stockTotalColumns = [
        { key: 'ITEMCODE', header: 'itemcode' },
        { key: 'ITEMNAME', header: 'itemname' },
        { key: 'MATERIAL', header: 'MATERIAL OK', type: 'number' },
        { key: '', header: 'MATERIAL NG', type: 'number' },
        { key: 'PRODUCT', header: 'PRODUCT OK', type: 'number' },
        { key: '', header: 'PRODUCT NG', type: 'number' },
        { key: 'OUTSIDE', header: 'OUTSIDE OK', type: 'number' },
        { key: '', header: 'OUTSIDE NG', type: 'number' },
    ];

    // 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
    window.call_mPurchase_stock_total = function (menuId) {
        showLoading("data");

        const { fromDate, toDate } = getDefaultDateRange();

        performStockTotalDBSearch({ fromDate });
    }

    // DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
    function performStockTotalDBSearch(searchCriteria) {
        showLoading("data");

        $.ajax({
            url: "/read_stockTotal",
            type: "POST",
            data: JSON.stringify({
                searchParams: searchCriteria
                // page, itemsPerPage 없음 = 전체 조회
            }),
            contentType: "application/json",
            success: function (response) {
                console.log("-- DB 조회 결과 (전체) --");
                console.log(response);

                // 서버에서 받은 전체 데이터 저장
                allServerData = response.records || [];
                filteredData_StockTotal = [...allServerData]; // 초기에는 필터링 없음
                globalStockTotalData = filteredData_StockTotal;
                window.filteredStockTotalData = globalStockTotalData;

                totalQty = response.totalQty || 0;
                totalStockTotalCount = filteredData_StockTotal.length;

                // 첫 번째 검색이라면 뷰를 렌더링
                if (!$('#view_mPurchase_stock_total').length) {
                    renderStockTotalView();
                } else {
                    // 기존 뷰가 있다면 테이블만 업데이트
                    renderStockTotalTableData();
                    updateStockTotalTotalCount();
                }

                // 총 수량 업데이트
                updateTotalQty();

                hideLoading();
            },
            error: function (xhr, status, error) {
                console.error("DB 조회 실패:", error);
                hideLoading();
                alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
            }
        });
    }

    // 사용자 뷰 렌더링 함수
    function renderStockTotalView() {
        let content_output = `
			<div class="divBlockControl" id="view_mPurchase_stock_total">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label" style="display:none">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="stockTotal_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockTotal_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="stockTotal_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnStockTotalSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnStockTotalSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>
								${i18n.t('table.info.total')} <strong id="stockTotalTotalCount">${totalStockTotalCount} </strong>${i18n.t('table.info.records')}
								|
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="stockTotalTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_stock_total">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="stockTotalExcelBtn" onclick="downloadAllStockTotalData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_stock_total" id="stockTotalTable">
							<thead>
								<tr>
									<th rowspan="2" class="noVal">${i18n.t('table.no')}<!-- No --></th>
									<th rowspan="2" class="itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th rowspan="2" class="itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
						        	<th colspan="2" class="qtyVal">INBOUND</th>
						        	<th colspan="2" class="qtyVal">PRODUCT</th>
						        	<th colspan="2" class="qtyVal">OUTSIDE</th>
								</tr>
								<tr>
									<th class="qtyVal">OK</th>
									<th class="qtyVal">NG</th>
									<th class="qtyVal">OK</th>
									<th class="qtyVal">NG</th>
									<th class="qtyVal">OK</th>
                                    <th class="qtyVal">NG</th>
								</tr>
							</thead>
							<tbody id="stockTotalDetailTableBody">
							</tbody>
						</table>
					</div>
				</div>
			</div>
		`;

        $(".w_contentArea").append(content_output);

        // 화면에 기본 날짜 세팅
        (function () {
            const { fromDate, toDate } = getDefaultDateRange();
            $("#stockTotal_searchVal_toDate").val(toDate);
            $("#stockTotal_searchVal_fromDate").val(fromDate);
        })();

        // 테이블 데이터 렌더링
        renderStockTotalTableData();
        // 이벤트 바인딩
        bindStockTotalEvents();
        // 초기 렌더링 후 카운트 업데이트
        updateStockTotalTotalCount();
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
        const fromDate = fmtLocalDate(today);
        return { fromDate, toDate };
    }

    function getCookie(cookieName) {
        const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : '';
    }

    function updateStockTotalTotalCount() {
        $('#stockTotalTotalCount').text(Number(totalStockTotalCount).toLocaleString());
    }

    function renderStockTotalTableData() {
        let tableBody = "";

        for (let i = 0; i < globalStockTotalData.length; i++) {
            let rowNumber = i + 1;
            let data = globalStockTotalData[i];

            tableBody += `
                <tr>
                    <td class="noVal">${rowNumber}</td>
                    <td class="itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                    <td class="itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
            		<td class="qtyVal">${Number(data.INBOUND || data.inbound || 0).toLocaleString()}</td>
            		<td class="qtyVal">0</td>
	            	<td class="qtyVal">${Number(data.PRODUCT || data.product || 0).toLocaleString()}</td>
	            	<td class="qtyVal">0</td>
	            	<td class="qtyVal">${Number(data.OUTSIDE || data.outside || 0).toLocaleString()}</td>
                    <td class="qtyVal">0</td>
                </tr>
            `;
        }

        $("#stockTotalDetailTableBody").html(tableBody);
    }

    function bindStockTotalEvents() {
        // 검색 버튼 클릭 - DB에서 새로 조회
        $(".btnStockTotalSearch").off('click').on('click', function () {
            performStockTotalSearch();
        });

        // 초기화 버튼 클릭
        $(".btnStockTotalSearchInit").off('click').on('click', function () {
            resetStockTotalSearch();
        });

        // 엔터키 검색
        $('#view_mPurchase_stock_total input[type="text"], #view_mPurchase_stock_total input[type="date"]')
            .off('keypress')
            .on('keypress', function (e) {
                if (e.which === 13) {
                    performStockTotalSearch();
                }
            });
    }

    function getCurrentSearchCriteria() {
        return {
            fromDate: $("#stockTotal_searchVal_fromDate").val(),
            itemcode: $("#stockTotal_searchVal_itemcode").val().trim().toUpperCase(),
            itemname: $("#stockTotal_searchVal_itemname").val().trim().toUpperCase()
        };
    }

    function performStockTotalSearch() {
        let searchCriteria = getCurrentSearchCriteria();
        console.log("검색 조건:", searchCriteria);

        performStockTotalDBSearch(searchCriteria);
    }

    function resetStockTotalSearch() {
        const { fromDate, toDate } = getDefaultDateRange();

        $("#stockTotal_searchVal_fromDate").val(fromDate);
        $("#stockTotal_searchVal_itemcode").val('');
        $("#stockTotal_searchVal_itemname").val('');

        performStockTotalDBSearch({ });

        console.log('검색 조건이 초기화되었습니다.');
    }

    function updateTotalQty() {
        $(".stockTotalTotalQty").text(Number(totalQty).toLocaleString());
    }

    // 엑셀/외부에서 사용할 데이터 export (페이징/정렬 제거 버전)
    window.exportStockTotalData = function () {
        return {
            total: filteredData_StockTotal.length,
            data: filteredData_StockTotal
        };
    }
});

// 전체 데이터 엑셀 다운로드
window.downloadAllStockTotalData = function () {
    let searchCriteria = {
		fromDate: $("#stockTotal_searchVal_fromDate").val(),
        itemcode: $("#stockTotal_searchVal_itemcode").val().trim().toUpperCase(),
        itemname: $("#stockTotal_searchVal_itemname").val().trim().toUpperCase()
    };

    showLoading("export");

    $.ajax({
        url: "/read_stockTotal",
        type: "POST",
        data: JSON.stringify({
            searchParams: searchCriteria
        }),
        contentType: "application/json",
        success: function (response) {
            console.log(response);

            ExcelExporter.downloadExcel(filteredData_StockTotal, window.stockTotalColumns, {
                fileName: 'stockTotal_All',
                sheetName: 'stockTotal'
            });
            hideLoading();
        },
        error: function () {
            alert("전체 데이터 조회에 실패했습니다.");
            hideLoading();
        }
    });
};
