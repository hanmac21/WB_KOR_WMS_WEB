// 아코디언 메뉴 초기화 함수 (bundle.js에서 호출용)

window.initAccordionMenu = function() {
    
    // CSS transition 동적 추가 (만약 CSS 파일에 없다면)
    if (!$('#accordion-animation-css').length) {
        $('<style id="accordion-animation-css">')
            .text(`
                .accordion > div,
                .sub-accordion > div {
                    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }
                
                .accordion label i.fa-plus {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .sub-accordion label i.fa-chevron-right {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `)
            .appendTo('head');
    }

    // 높이 계산 및 애니메이션 함수
    function animateAccordion($checkbox, $content, isOpening) {
        if (isOpening) {
            // 펼치기: 실제 높이를 계산하여 설정
            $content.css('max-height', 'none'); // 임시로 제한 해제
            const actualHeight = $content.prop('scrollHeight');
            $content.css('max-height', '0'); // 다시 0으로 설정
            
            // 강제 리플로우 후 애니메이션 시작
            $content[0].offsetHeight;
            $content.css('max-height', actualHeight + 'px');
        } else {
            // 접기: 현재 높이에서 0으로
            const currentHeight = $content.prop('scrollHeight');
            $content.css('max-height', currentHeight + 'px');
            
            // 강제 리플로우 후 애니메이션 시작
            $content[0].offsetHeight;
            $content.css('max-height', '0');
        }
    }

    // 기존 이벤트 제거 (중복 방지)
    $('input.answer').off('change.accordion');
    $('.sub-accordion input[type="checkbox"]').off('change.accordion');
    $('.accordion > div, .sub-accordion > div').off('transitionend.accordion');

    // 메인 아코디언 처리
    $('input.answer').each(function() {
        const $checkbox = $(this);
        const $content = $checkbox.next('label').next('div');

        // 초기 상태 설정
        if ($checkbox.is(':checked')) {
            $content.css('max-height', 'none');
            const actualHeight = $content.prop('scrollHeight');
            $content.css('max-height', actualHeight + 'px');
        } else {
            $content.css('max-height', '0');
        }

        // 체크박스 상태 변경 이벤트 - animateAccordion 함수 사용
        $checkbox.on('change.accordion', function() {
            const isOpening = $checkbox.is(':checked');
            
            if (isOpening) {
                console.log('아코디언 펼치기:', $checkbox.next('label').find('.normalLink').text());
            } else {
                console.log('아코디언 접기:', $checkbox.next('label').find('.normalLink').text());
                // 접을 때 내부 서브 아코디언도 모두 접기
                $content.find('.sub-accordion input[type="checkbox"]').prop('checked', false);
                $content.find('.sub-accordion > div').css('max-height', '0');
            }
            
            // 애니메이션 함수 사용
            animateAccordion($checkbox, $content, isOpening);
        });

        // 애니메이션 완료 후 처리
        $content.on('transitionend.accordion', function(e) {
            // 이벤트 버블링 방지 (서브 아코디언 이벤트와 구분)
            if (e.target === this) {
                if ($checkbox.is(':checked')) {
                    // 펼쳐진 상태에서는 auto로 설정하여 내용 변경에 대응
                    $(this).css('max-height', 'none');
                }
            }
        });
    });

    // 서브 아코디언 처리
    $('.sub-accordion input[type="checkbox"]').each(function() {
        const $subCheckbox = $(this);
        const $subContent = $subCheckbox.next('label').next('div');
        const $parentContent = $subCheckbox.closest('.accordion > div');
        const $parentCheckbox = $parentContent.prev('label').prev('input');

        // 서브 아코디언 초기 상태 설정
        if ($subCheckbox.is(':checked')) {
            $subContent.css('max-height', 'none');
            const actualHeight = $subContent.prop('scrollHeight');
            $subContent.css('max-height', actualHeight + 'px');
            // 부모도 높이 재조정
            if ($parentCheckbox.is(':checked')) {
                setTimeout(function() {
                    $parentContent.css('max-height', 'none');
                    const newParentHeight = $parentContent.prop('scrollHeight');
                    $parentContent.css('max-height', newParentHeight + 'px');
                }, 10);
            }
        } else {
            $subContent.css('max-height', '0');
        }

        // 서브 아코디언 상태 변경 이벤트
        $subCheckbox.on('change.accordion', function() {
            const isOpening = $subCheckbox.is(':checked');
            const subMenuName = $subCheckbox.next('label').find('span').text();
            
            if (isOpening) {
                console.log('서브메뉴 펼치기:', subMenuName);
            } else {
                console.log('서브메뉴 접기:', subMenuName);
            }
            
            // 서브 아코디언도 animateAccordion 함수 사용
            animateAccordion($subCheckbox, $subContent, isOpening);
        });

        // 서브 아코디언 애니메이션 완료 후 부모 높이 조정
        $subContent.on('transitionend.accordion', function(e) {
            if (e.target === this) {
                setTimeout(function() {
                    // 부모가 열려있을 때만 높이 재계산
                    if ($parentCheckbox.is(':checked')) {
                        $parentContent.css('max-height', 'none');
                        const newParentHeight = $parentContent.prop('scrollHeight');
                        $parentContent.css('max-height', newParentHeight + 'px');
                    }
                }, 10);
                
                if ($subCheckbox.is(':checked')) {
                    // 서브메뉴가 펼쳐진 상태에서는 auto로 설정
                    $(this).css('max-height', 'none');
                }
            }
        });
    });

    // 창 크기 변경 시 높이 재계산
    let resizeTimer;
    $(window).off('resize.accordion').on('resize.accordion', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // 열려있는 아코디언들의 높이 재계산
            $('input.answer:checked').each(function() {
                const $content = $(this).next('label').next('div');
                $content.css('max-height', 'none');
                const newHeight = $content.prop('scrollHeight');
                $content.css('max-height', newHeight + 'px');
            });
            
            // 열려있는 서브 아코디언들의 높이 재계산
            $('.sub-accordion input[type="checkbox"]:checked').each(function() {
                const $subContent = $(this).next('label').next('div');
                $subContent.css('max-height', 'none');
                const newHeight = $subContent.prop('scrollHeight');
                $subContent.css('max-height', newHeight + 'px');
            });
        }, 100);
    });

    // 프로그래밍 방식으로 메뉴 제어
    window.toggleMainMenu = function(menuId, open = null) {
        const $checkbox = $(`#${menuId}`);
        if ($checkbox.length > 0) {
            if (open === null) {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
            } else {
                $checkbox.prop('checked', open);
            }
            $checkbox.trigger('change.accordion');
        }
    };

    window.toggleSubMenu = function(subMenuId, open = null) {
        const $checkbox = $(`#${subMenuId}`);
        if ($checkbox.length > 0) {
            if (open === null) {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
            } else {
                $checkbox.prop('checked', open);
            }
            $checkbox.trigger('change.accordion');
        }
    };

    // 메뉴 아이템 클릭 이벤트
    $('.divBlockTrigger').off('click.accordion').on('click.accordion', function() {
        const menuId = $(this).attr('id');
        const group = $(this).data('group');
        const menuName = $(this).text();
        
        console.log(`메뉴 클릭: ${menuName} (ID: ${menuId}, 그룹: ${group})`);
        
        // 활성 메뉴 스타일 초기화
        $('.divBlockTrigger').parent().css('background-color', '');
        
        // 현재 메뉴 활성화
        $(this).parent().css('background-color', '#e3f2fd');
        
        // 실제 메뉴 처리 로직
        if (typeof window[`call_${menuId}`] === 'function') {
            window[`call_${menuId}`]();
        } else {
            console.log(`함수 call_${menuId}가 정의되지 않았습니다.`);
        }
    });

    // 부드러운 스크롤 효과 (선택사항)
    window.smoothScrollToMenu = function(menuId) {
        const $menu = $(`#${menuId}`);
        if ($menu.length > 0) {
            $menu[0].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    };

    console.log('아코디언 메뉴가 초기화되었습니다.');
    console.log('사용법:');
    console.log('toggleMainMenu("answer02", true);  // 구매 메뉴 펼치기');
    console.log('toggleSubMenu("sub_m2_1", true);   // 입고등록 서브메뉴 펼치기');
    console.log('smoothScrollToMenu("m2_1-1");      // 특정 메뉴로 부드럽게 스크롤');
};

// bundle.js에서 사용하는 방법:
// $(document).ready(function() {
//     if (typeof window.initAccordionMenu === 'function') {
//         window.initAccordionMenu();
//     }
// });

// 또는 특정 메뉴 로드 시:
// function loadMenuPage() {
//     // 메뉴 HTML 로드 후
//     window.initAccordionMenu();
// }