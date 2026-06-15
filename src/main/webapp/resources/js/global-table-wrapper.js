// 전역 함수 - 모든 data-table을 table-wrapper로 래핑
window.wrapDataTables = function() {
    $('table.data-table').each(function() {
        // 이미 래핑되었으면 스킵
        if ($(this).parent().hasClass('table-wrapper')) {
            return;
        }
        
        // table-wrapper로 감싸기
        $(this).wrap('<div class="table-wrapper"></div>');
    });
};

// 페이지 로드 시 실행
$(document).ready(function() {
    window.wrapDataTables();
});

// 동적 로드 시에도 실행 (AJAX 완료 후)
$(document).on('ajaxComplete', function() {
    window.wrapDataTables();
});

// 메뉴 변경 시에도 실행
document.addEventListener('menuTypeChanged', function() {
    setTimeout(function() {
        window.wrapDataTables();
    }, 100);
});