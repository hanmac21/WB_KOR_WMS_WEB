/* --------------------------------------------------------------
 * 📌 마감관리 (mBasicData_magam)
 *  - 년월 1개 선택 후 [마감] / [마감취소]
 *  - 테이블에 월별 마감내역 표시
 * -------------------------------------------------------------- */

let monthCloseData = [];   // 서버에서 가져온 마감 리스트
let closedMonthMap = {};   // 이미 마감된 월 정보

$(document).ready(function () {
    window.call_mBasicData_magam = function (menuId) {
		showLoading("data");
        renderMagamView();      // 화면 구성
        loadMonthCloseList();   // 마감 리스트 로딩
    };
});


/* ================================
 * 서버에서 마감 리스트 조회
 * ================================ */
function loadMonthCloseList() {
    $.ajax({
        url: '/read_magam',
        type: 'GET',
        dataType: 'json',
        success: handleMonthCloseListSuccess,
        error: function () {
            monthCloseData = [];
            closedMonthMap = {};
            renderMonthCloseTable();
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
        }
    });
}

/* ================================
 * 마감 리스트 조회 성공 처리
 * ================================ */
function handleMonthCloseListSuccess(res) {
    monthCloseData = [];
    closedMonthMap = {};

    const list = res && Array.isArray(res.list) ? res.list : [];

    list.forEach(function (row) {
        const month = row.month || row.MONTH; // 예: "202510"
        if (!month || month.length < 6) return;

        const ym = month.substring(0, 4) + '-' + month.substring(4, 6); // "2025-10"
        const sdate = row.sdate || row.SDATE || '';
        const inuser = row.inuser || row.INUSER || '';

        // 행이 있다는 것 자체가 마감 상태
        const closeYn = 'Y';

        closedMonthMap[ym] = true;

        monthCloseData.push({
            ym,
            closeYn,
            sdate,
            inuser
        });
    });

    renderMonthCloseTable();
    
	hideLoading();
}


/* ================================
 * 화면 렌더링
 * ================================ */
function renderMagamView() {
    const content_output = `
        <div class="divBlockControl" id="view_mBasicData_magam">
            <div class="content-body">
                <!-- 검색 영역 -->
                <div class="search-area">
                    <div class="search-row">
                        <div class="search-label">
                            <div class="magam_searchVal_fromDate">
                                ${i18n.t('search.date')}<!-- DATE -->
                            </div>
                            <input type="month" id="magam_searchVal_fromDate"/>
                        </div>
                    </div>
                    <div class="search_button_area">
                        <button class="btn btn-primary btnMagamClose">${i18n.t('btn.closed')}</button>
                        <button class="btn btn-secondary btnMagamCancel">${i18n.t('btn.cancel')}</button>
                    </div>
                </div>

                <!-- 테이블 -->
                <div class="table-container">
                    <table class="data-table mBasicData_magam">
                        <thead>
                            <tr>
                                <th>${i18n.t('table.select')}</th>
                                <th>${i18n.t('table.no')}</th>
                                <th>${i18n.t('table.yearMonth')}</th>
                                <th>${i18n.t('table.status')}</th>
                                <th>${i18n.t('table.closingDate')}</th>
                                <th>${i18n.t('search.user')}</th>
                            </tr>
                        </thead>
                        <tbody id="magamTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    $(".w_contentArea").append(content_output);

    initYearMonth();         // 날짜 기본값
    bindMonthCloseEvents();  // 버튼/체크박스 이벤트 바인딩
}


/* ================================
 * 테이블 렌더링
 * ================================ */
function renderMonthCloseTable() {
    const $tbody = $('#magamTableBody');
    if (!$tbody.length) return;

    let html = '';
    monthCloseData.forEach(function (row, idx) {
        const statusText = (row.closeYn === 'Y') ? i18n.t('btn.closed') : i18n.t('table.notClosed');

        html += `
            <tr data-ym="${row.ym}">
                <td style="text-align:center;">
                    <input type="checkbox" class="magamRowChk" data-ym="${row.ym}" />
                </td>
                <td>${idx + 1}</td>
                <td>${row.ym}</td>
                <td>${statusText}</td>
                <td>${row.sdate || ''}</td>
                <td>${row.inuser || ''}</td>
            </tr>
        `;
    });

    $tbody.html(html);
}


/* ================================
 * 날짜 기본값: 현재 년월
 * ================================ */
function initYearMonth() {
    const now = new Date();
    const y   = now.getFullYear();
    const m   = String(now.getMonth() + 1).padStart(2, '0');
    $('#magam_searchVal_fromDate').val(`${y}-${m}`);
}


/* ================================
 * 이벤트 바인딩
 * ================================ */
function bindMonthCloseEvents() {
    // 체크박스 변경 시: 항상 단건 선택(라디오처럼 동작)
    $(document).off('change', '.magamRowChk').on('change', '.magamRowChk', function () {
        if ($(this).is(':checked')) {
            // 자신만 체크, 나머지는 해제
            $('#magamTableBody .magamRowChk').not(this).prop('checked', false);
        }
    });

    // 마감 버튼
    $(document).off('click', '.btnMagamClose').on('click', '.btnMagamClose', function () {
        onClickMonthClose();
    });

    // 마감취소 버튼
    $(document).off('click', '.btnMagamCancel').on('click', '.btnMagamCancel', function () {
        onClickMonthCancel();
    });
}


/* ================================
 * 입력된 년월로부터 키 얻기
 *  - return: { ym: 'YYYY-MM', yyyymm: 'YYYYMM' }
 * ================================ */
function getSelectedYearMonth() {
    const ym = $('#magam_searchVal_fromDate').val(); // "2025-12"
    if (!ym) {
        return null;
    }

    const parts = ym.split('-');
    if (parts.length < 2) return null;

    const y      = parts[0];
    const m      = parts[1];
    const yyyymm = `${y}${m}`;

    return { ym, yyyymm };
}


/* ================================
 * 마감 실행
 * ================================ */
function onClickMonthClose() {
	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';
	
    const ymInfo = getSelectedYearMonth();
    if (!ymInfo) {
        alert('Please select a year and month.');			// 년월을 선택해 주세요.
        return;
    }

    const { ym, yyyymm } = ymInfo;

    if (closedMonthMap[ym]) {
        alert(ym + ' This month has already been closed.');			// 이미 마감된 월입니다.
        return;
    }

    if (!confirm(yyyymm + ' Do you want to close the inventory for this month?')) {			// 월 재고를 마감하시겠습니까?
        return;
    }

    $.ajax({
        url: '/magamClose',
        type: 'POST',
        data: JSON.stringify({ 
        	month: yyyymm,
        	loginid: loginid
        }),
		contentType: "application/json",
        success: function (res) {
            if (res && res.success) {
                alert(yyyymm + ' Month closing has been completed.');			// 월 마감이 완료되었습니다.
                loadMonthCloseList(); // 리스트 재조회
            } else {
                alert((res && res.message) || 'An error occurred during the closing process.');			// 마감 처리 중 오류가 발생했습니다.
            }
        },
        error: function () {
            alert('An error occurred during the closing process.');			// 마감 처리 중 오류가 발생했습니다.
        }
    });
}


/* ================================
 * 마감 취소 (단건만, 체크박스 기반)
 * ================================ */
function onClickMonthCancel() {
    const $checked = $('#magamTableBody .magamRowChk:checked');

    if ($checked.length === 0) {
        alert('Please select a year and month to cancel the closing.');			// 마감 취소할 년월을 선택해 주세요.
        return;
    }

    // 단건으로 강제 (여러 개가 체크되어 있어도 첫 번째만 사용)
    const $target = $checked.first();
    const ym = $target.data('ym'); // "2025-12"

    if (!ym) {
        alert('The selected data contains an invalid year/month value.');			// 선택된 데이터의 년월 정보가 올바르지 않습니다.
        return;
    }

    if (!closedMonthMap[ym]) {
        alert(ym + ' is not in a closed state.');			// 은(는) 마감 상태가 아닙니다.
        return;
    }

    const yyyymm = ym.replace('-', ''); // "202512"

    if (!confirm(ym + ' Do you want to cancel the month closing?')) {		// 월 마감을 취소하시겠습니까?
        return;
    }

    $.ajax({
        url: '/magamCancel',
        type: 'POST',
        data: JSON.stringify({ 
        	month: yyyymm,
        }),
		contentType: "application/json",
        success: function (res) {
            if (res && res.success) {
                alert(ym + ' Month closing cancellation has been completed.'); 		// 월 마감취소가 완료되었습니다.
                loadMonthCloseList(); // 리스트 재조회
            } else {
                alert((res && res.message) || 'An error occurred while canceling the month closing.'); // 마감 취소 중 오류가 발생했습니다.
            }
        },
        error: function () {
            alert('An error occurred while canceling the month closing.');
        }
    });
}
