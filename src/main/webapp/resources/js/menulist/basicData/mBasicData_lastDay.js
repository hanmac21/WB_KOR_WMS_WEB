/* --------------------------------------------------------------
 * 📌 말일재고실사 날짜 지정 (mBasicData_lastDay)
 *  - 실사 날짜 지정 (전체 창고 일괄 적용)
 *  - 지정된 날짜 이후에는 수정 불가
 *  - 테이블에 지정 이력 표시
 * -------------------------------------------------------------- */

let lastDayData = [];   // 서버에서 가져온 실사 날짜 지정 리스트
let lastDayMap = {};   // 현재 지정된 실사 날짜 정보
let currentMonthInventoryMap = {}; // 창고별 현재 월의 실사 날짜

let menuType = null;            // 현재 페이지의 타입
let saveStorageForInit = null;
let pendingLastDayInit = false;

$(document).ready(function () {
    window.call_mBasicData_lastDay = function (menuId) {
        pendingLastDayInit = true;
		showLoading("data")

        if (!menuType) return;
        performLastDayListDBSearch();   // 실사 날짜 데이터 로딩
    };

    document.addEventListener('menuTypeChanged', function(e) {
       menuType = e.detail.menuType;

       if (pendingLastDayInit) {
           pendingLastDayInit = false;
           performLastDayListDBSearch();
       }
    });
});


/* ================================
 * 서버에서 실사 날짜 조회
 * ================================ */
function performLastDayListDBSearch() {
    $.ajax({
        url: '/read_lastDay',
        type: 'GET',
        dataType: 'json',
        success: handleLastDayListSuccess,
        error: function () {
            lastDayData = [];
            lastDayMap = {};
            currentMonthInventoryDate = null;
            renderLastDayTable();
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
			// Failed to retrieve data. Please try again.
        }
    });
}

/* ================================
 * 실사 날짜 조회 성공 처리
 * ================================ */
function handleLastDayListSuccess(res) {
    lastDayData = [];
    lastDayMap = {};
    currentMonthInventoryMap = {};

    const list = res && Array.isArray(res.list) ? res.list : [];
    const now = new Date();
    const currentYM = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');    // 현재 년월 구하기 (yyyy-MM)

    list.forEach(function (row) {
        const factory = row.factory || row.FACTORY || '';
        const storage = row.storage || row.STORAGE || '';
        const sdate = row.sdate || row.SDATE || '';
        const ymdhms = row.ymdhms || row.YMDHMS || '';
        const loginid = row.loginid || row.LOGINID || '';

        lastDayMap[sdate] = true;

        lastDayData.push({
            factory,
            storage,
            sdate,
            ymdhms,
            loginid
        });
        
        // 창고별로 현재 월 실사 날짜 저장
        if (sdate && sdate.substring(0, 7) === currentYM) {
            currentMonthInventoryMap[storage] = sdate;
        }
    });

    if (!$('#view_mBasicData_lastDay').length) {
        renderLastDayView();    // 뷰 먼저 생성
    } else {
        renderLastDayTable();   // 이미 뷰가 있으면 테이블만 갱신
    }

    checkDateEditability(); // 날짜 수정 가능 여부 체크
    
	hideLoading();
}


/* ================================
 * 화면 렌더링
 * ================================ */
function renderLastDayView() {
    const content_output = `
        <div class="divBlockControl" id="view_mBasicData_lastDay">
            <div class="content-body">
                <!-- 검색 영역 -->
                <div class="search-area">
                    <div class="search-row">                        
                        <div class="search-label">
                            <div class="searchVal_factory">${i18n.t('search.factory')}<!-- Factory --></div>
                            <select id="lastDay_searchVal_factory" class="factory-select">
                                <option value="WBTA">WBTA</option>
                            </select>
                        </div>                        
                        <div class="search-label">
                            <div class="searchVal_storage">${i18n.t('search.storage')}<!-- Storage --></div>
                            <select id="lastDay_searchVal_storage" >
                                <!-- 동적으로 추가 -->
                            </select>
                        </div>
                        <div class="search-label">
                            <div class="lastDay_searchVal_fromDate">
                                ${i18n.t('basicData.lastDay')}
                            </div>
                            <input type="date" id="lastDay_searchVal_fromDate"/>
                        </div>
                    </div>
                    <div class="search_button_area">
                        <button class="btn btn-primary btnLastDaySave">${i18n.t('btn.save')}</button>
                        <button class="btn btn-warning btnLastDayModify">${i18n.t('btn.edit')}</button>
                    </div>
                </div>

                <!-- 테이블 -->
                <div class="table-container">
                	<div class="table-info">
                		<span id="currentMonthLabel">
                			지정된 실사 날짜 : <span id="currentInventoryDate">미지정</span>
                		</span>
                	</div>
                	<table class="data-table mBasicData_lastDay">
                        <thead>
                            <tr>
                                <th>${i18n.t('table.no')}</th>
                                <th class="factoryVal">${i18n.t('search.factory')}</th>
                                <th class="storageVal">${i18n.t('search.storage')}</th>
                                <th class="itemcodeVal">${i18n.t('basicData.lastDay')}</th>
                                <th class="itemcodeVal">${i18n.t('search.date')}</th>
                                <th class="itemcodeVal">${i18n.t('search.user')}</th>
                            </tr>
                        </thead>
                        <tbody id="lastDayTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    $(".w_contentArea").append(content_output);

    initLastDay();          // 날짜 기본값
    bindLastDayEvents();    // 버튼 이벤트 바인딩
    renderFactoryStorage(); // 공장 및 창고 선택
    renderLastDayTable();   // 테이블 렌더링
}


/* ================================
 * 테이블 렌더링
 * ================================ */
function renderLastDayTable() {
    const $tbody = $('#lastDayTableBody');
    if (!$tbody.length) return;

    storageLastDayText();

    let html = '';
    
    lastDayData.forEach(function (row, idx) {
        html += `
            <tr>
                <td>${idx + 1}</td>
                <td class="factoryVal">${row.factory}</td>
                <td class="storageVal">${row.storage}</td>
                <td class="itemcodeVal">${row.sdate}</td>
                <td class="itemcodeVal">${row.ymdhms}</td>
                <td class="itemcodeVal">${row.loginid}</td>
            </tr>
        `;
    });

    $tbody.html(html);
}

/* ================================
 * 테이블 상단 창고별 지정 날짜 텍스트 변경
 * ================================ */
function storageLastDayText(){
    // 현재 월 표시 업데이트
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1~12
    const selectedStorage = $('#lastDay_searchVal_storage').val() || '';

    // 현재 선택된 창고의 실사 날짜
    const inventoryDate = currentMonthInventoryMap[selectedStorage] || null;

    $('#currentMonthLabel').html(
        `${selectedStorage} - ${i18n.tf('table.stockCount.monthLabel', currentMonth)} : <span id="currentInventoryDate"></span>`
    );
    $('#currentInventoryDate').text(inventoryDate || i18n.t('table.notSet'));
}

/* ================================
 * 공장에 따른 창고 선택 리스트 변경
 * ================================ */
function renderFactoryStorage() {
    const factory = $('#lastDay_searchVal_factory');
    const storage = $('#lastDay_searchVal_storage');
    const savedFactory = getCookie('selectedFactory');

    function updateStorageOptions(factoryValue) {
        storage.empty();

        const options = {
            'WBTA': ['INBOUND', 'PRODUCT', 'OUTSIDE'],
        };

        // 메뉴 별 기본 총고
        const storageByMenu = {
            purchase: 	'INBOUND',
            sales: 		'PRODUCT'
        }

        const storageList = options[factoryValue] || options[''];

        storageList.forEach(item => {
            const text = item === 'all' ? i18n.t('search.all') : item;
            storage.append(`<option value="${item}">${text}</option>`);
        });

        // 첫 번째 옵션 선택 (INBOUND)
//			storage.val(storageList[0]);

        // 메뉴에 따라 창고 기본값 설정
        let defaultStorage = storageByMenu[menuType] || storageList[0];

        // 옵션에 창고 기본값이 없을경우 첫 번째 옵션으로 변경
        // 예) quality : REDCAGE -> 푸에블라는 REDCAGE 창고가 없음 -> INBOUND로 변경
        if(!storageList.includes(defaultStorage)){
            defaultStorage = storageList[0];
        }

        console.log(menuType);
        console.log(defaultStorage);

        saveStorageForInit = defaultStorage;
        storage.val(defaultStorage);

        storageLastDayText();           // 라벨 텍스트 갱신
        checkDateEditability();         // 버튼 상태 갱신
    }

    if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
        factory.val(savedFactory);
    }

    updateStorageOptions(savedFactory || '');

    factory.on('change', function() {
        updateStorageOptions($(this).val());
    });

    window.autoSetStorageFields();
}


/* ================================
 * 날짜 수정 가능 여부 체크
 * ================================ */
function checkDateEditability() {
    const $dateInput = $('#lastDay_searchVal_fromDate');
    const $saveBtn = $('.btnLastDaySave');
    const $modifyBtn = $('.btnLastDayModify');

    const selectedStorage = $('#lastDay_searchVal_storage').val() || '';
    const currentMonthInventoryDate = currentMonthInventoryMap[selectedStorage] || null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!currentMonthInventoryDate) {
        // 현재 월에 지정된 날짜가 없으면 저장만 가능
        $dateInput.prop('disabled', false);
        $saveBtn.prop('disabled', false);
        $modifyBtn.prop('disabled', true);
        $dateInput.css('background-color', '');
        return;
    }
    
    const inventoryDate = new Date(currentMonthInventoryDate);
    inventoryDate.setHours(0, 0, 0, 0);
    
    // 지정된 실사 날짜가 오늘보다 이전이면 (실사 날짜를 지났으면) 수정 불가
    if (inventoryDate < today) {
        $dateInput.prop('disabled', true);
        $saveBtn.prop('disabled', true);
        $modifyBtn.prop('disabled', true);
        $dateInput.css('background-color', '#ecf0f1');
    } else {
        // 실사 날짜가 오늘 또는 미래이면 수정 가능
        $dateInput.prop('disabled', false);
        $saveBtn.prop('disabled', true); // 이미 지정되어 있으므로 저장 불가
        $modifyBtn.prop('disabled', false);
        $dateInput.css('background-color', '');
        // 현재 지정된 날짜를 입력 필드에 표시
        $dateInput.val(currentMonthInventoryDate);
    }
}


/* ================================
 * 날짜 기본값: 현재 날짜
 * ================================ */
function initLastDay() {
    const now = new Date();
    const y   = now.getFullYear();
    const m   = String(now.getMonth() + 1).padStart(2, '0');
    const dd  = String(now.getDate()).padStart(2, '0');
    const $dateInput = $('#lastDay_searchVal_fromDate');

    // 이번 달 25일 ~ 말일로 제한
    const minDate = `${y}-${m}-25`;
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate(); // 이번 달 말일
    const maxDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

    $dateInput.attr('min', minDate);
    $dateInput.attr('max', maxDate);

    // 기본값: 오늘이 25일 이후면 오늘, 아니면 25일
    const todayNum = now.getDate();
    if (todayNum >= 25) {
        $dateInput.val(`${y}-${m}-${dd}`);
    } else {
        $dateInput.val(minDate);
    }
}


/* ================================
 * 이벤트 바인딩
 * ================================ */
function bindLastDayEvents() {
    // 저장 버튼
    $(document).off('click', '.btnLastDaySave').on('click', '.btnLastDaySave', function () {
        onClickLastDay();
    });

    // 수정 버튼
    $(document).off('click', '.btnLastDayModify').on('click', '.btnLastDayModify', function () {
        onClickLastDayModify();
    });

    // 창고 변경 시 라벨 + 버튼 상태 갱신
    $(document).off('change', '#lastDay_searchVal_storage').on('change', '#lastDay_searchVal_storage', function () {
        storageLastDayText();
        checkDateEditability();
    });
}


/* ================================
 * 입력된 날짜 얻기
 *  - return: 'YYYY-MM-DD'
 * ================================ */
function getSelectedLastDay() {
    const sdate = $('#lastDay_searchVal_fromDate').val(); // "2025-12-31"
    if (!sdate) {
        return null;
    }

    return sdate;
}


/* ================================
 * 날짜 저장 실행
 * ================================ */
function onClickLastDay() {
	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';
    const selectedStorage = $('#lastDay_searchVal_storage').val();
    const currentMonthInventoryDate = currentMonthInventoryMap[selectedStorage];
	
    const sdate = getSelectedLastDay();
    if (!sdate) {
        alert('Please select a date.');
        // 날짜를 선택해 주세요.
        return;
    }

    // 현재 월의 날짜인지 확인
    const now = new Date();
    const currentYM = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const selectedYM = sdate.substring(0, 7);
    
    if (selectedYM !== currentYM) {
        alert('Only dates within this month can be selected.');
        // 이번 달의 날짜만 지정할 수 있습니다.
        return;
    }

    // 25일 이후만 허용
    const selectedDay = parseInt(sdate.substring(8, 10), 10);
    if (selectedDay < 25) {
        alert('Stock count date must be between the 25th and the end of the month.');
        // 실사 날짜는 25일부터 말일까지만 지정할 수 있습니다.
        return;
    }

    if (lastDayMap[selectedStorage + '_' + sdate]) {
        alert('This date has already been assigned for this storage.');
        // 이미 지정된 날짜입니다.
        return;
    }
    
    // 현재 월에 이미 지정된 날짜가 있는지 체크
    if (currentMonthInventoryDate) {
        alert('A stock count date has already been set for this month.\nPlease use the edit button.');
        // 이번 달은 이미 실사 날짜가 지정되어 있습니다.\n수정 버튼을 이용해주세요.
        return;
    }

    if (!confirm(`Do you want to set the month-end stock count date for ${selectedStorage} storage to ${sdate}?`)) {
        // ${selectedStorage} 창고의 말일 재고 실사일을 ${sdate}로 지정하시겠습니까?
        return;
    }

    $.ajax({
        url: '/setLastDay',
        type: 'POST',
        data: JSON.stringify({
            factory: $('#lastDay_searchVal_factory').val(),
            storage: selectedStorage,
            sdate: sdate,
            loginid: loginid
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (res) {
            if (res === 1) {
                alert(`The stock count date for ${selectedStorage} storage has been successfully saved.`);
                // ${selectedStorage} 창고의 실사 날짜가 성공적으로 저장되었습니다.
                performLastDayListDBSearch(); // 리스트 재조회
            } else {
                alert('An error occurred while saving the date.');
                // 날짜 저장 중 오류가 발생했습니다.
            }
        },
        error: function (xhr) {
            alert('An error occurred while saving the date.\n' + (xhr.responseText || ''));
            // 날짜 저장 중 오류가 발생했습니다.
        }
    });
}


/* ================================
 * 날짜 수정 실행
 * ================================ */
function onClickLastDayModify() {
	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';
    const selectedStorage = $('#lastDay_searchVal_storage').val();
    const currentMonthInventoryDate = currentMonthInventoryMap[selectedStorage];
	
    const sdate = getSelectedLastDay();
    if (!sdate) {
        alert('Please select a date to edit.');
        // 수정할 날짜를 선택해 주세요.
        return;
    }
    
    // 현재 월의 날짜인지 확인
    const now = new Date();
    const currentYM = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const selectedYM = sdate.substring(0, 7);
    
    if (selectedYM !== currentYM) {
        alert('Only dates within this month can be selected.');
        // 이번 달의 날짜만 지정할 수 있습니다.
        return;
    }

    // 25일 이후만 허용
    const selectedDay = parseInt(sdate.substring(8, 10), 10);
    if (selectedDay < 25) {
        alert('Stock count date must be between the 25th and the end of the month.');
        return;
    }
    
    // 현재 월에 지정된 날짜가 없으면 수정 불가
    if (!currentMonthInventoryDate) {
        alert('No stock count date has been set for this month.\nPlease use the save button.');
        // 이번 달에 지정된 실사 날짜가 없습니다.\n저장 버튼을 이용해주세요.
        return;
    }
    
    // 지정된 실사 날짜가 오늘보다 이전이면 (날짜를 지났으면) 수정 불가
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inventoryDate = new Date(currentMonthInventoryDate);
    inventoryDate.setHours(0, 0, 0, 0);
    
    if (inventoryDate < today) {
        alert('The assigned stock count date has already passed and cannot be modified.');
        // 지정된 실사 날짜가 지나서 수정이 불가능합니다.
        return;
    }

    if (!confirm(`Do you want to change the month-end stock count date for ${selectedStorage} storage to ${sdate}?`)) {
        // ${selectedStorage} 창고의 말일재고실사 날짜를 ${sdate}로 수정하시겠습니까?
        return;
    }

    $.ajax({
        url: '/updateLastDay',
        type: 'POST',
        data: JSON.stringify({
            factory: $('#lastDay_searchVal_factory').val(),
            storage: selectedStorage,
        	sdate: sdate,
        	loginid: loginid
        }),
		contentType: "application/json",
        success: function (res) {
            if (res === 1) {
                alert(`The stock count date for ${selectedStorage} storage has been successfully updated.`);
                // ${selectedStorage} 창고의 실사 날짜가 성공적으로 수정되었습니다.
                performLastDayListDBSearch(); // 리스트 재조회
            } else {
                alert('An error occurred while saving the date.');
                // 날짜 수정 중 오류가 발생했습니다.
            }
        },
        error: function (xhr) {
            alert('An error occurred while saving the date.\n' + (xhr.responseText || ''));
            // 날짜 수정 중 오류가 발생했습니다.
        }
    });
}