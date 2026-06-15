$(document).ready(function() {

	/*// Date input 모든 키보드 입력 감지
	document.addEventListener('keydown', function(e) {
		const target = e.target;
		if (target.type === 'date') {
			console.log('Date input 키입력:', e.key, '현재값:', target.value);
		}
	});*/

	// Date input 포커스 떨어질 때
	document.addEventListener('blur', function(e) {
		const target = e.target;
		if (target.type === 'date') {
			console.log('포커스 떨어짐:', target.value);

			const value = target.value;

			// 값이 비어있으면 return
			if (!value) {
				//alert('잘못된 날짜가 입력되었습니다');
				target.value = '';
				return;
			}

			const [year, month, day] = value.split('-');

			if (year && month && day) {
				// 입력된 날짜가 실제로 유효한 날짜인지 확인
				const inputDate = new Date(year, month - 1, day);

				// 입력된 year, month, day와 실제 date 객체의 값이 같은지 비교
				if (inputDate.getFullYear() != year ||
					inputDate.getMonth() + 1 != month ||
					inputDate.getDate() != day) {
					//alert('잘못된 날짜가 입력되었습니다');
					target.value = ''; // 입력값 초기화
					return;
				}
			}
		}
	}, true);
	/* 날짜 클릭 했을떄 이벤트 document.addEventListener('click', function(e) {
		if (e.target.type === 'date') {
			e.target.placeholder = 'yyyy-mm-dd';
			console.log('Date input 클릭:', e.target.id, '- 속성 추가됨');
		}
	});*/

	/*// ✅ 대분류만 auto 방식, 중분류는 기존 방식 유지
	$('input.answer').each(function() {
		const $checkbox = $(this);
		const $content = $checkbox.next('label').next('div');

		// 초기 상태 설정
		if ($checkbox.is(':checked')) {
			$content.css('max-height', '');
		} else {
			$content.css('max-height', '0');
		}

		// 체크박스 변경 이벤트
		$checkbox.on('change', function() {
			if ($checkbox.is(':checked')) {
				// ✅ 대분류 펼치기: 0 → scrollHeight → auto
				const targetHeight = $content.prop('scrollHeight');
				$content.css('max-height', targetHeight + 'px');

				// 애니메이션 완료 후 auto로 변경 (중분류 변경에 자동 대응)
				setTimeout(() => {
					if ($checkbox.is(':checked')) {
						$content.css('max-height', '');
					}
				}, 300); // CSS transition 시간과 맞춤

			} else {
				// ✅ 대분류 접기: auto → 현재높이 → 0
				const currentHeight = $content.prop('scrollHeight');
				$content.css('max-height', currentHeight + 'px');

				// 다음 프레임에서 0으로 변경
				requestAnimationFrame(() => {
					$content.css('max-height', '0');
				});``
			}
		});
	});

	// ✅ 중분류(서브 아코디언)는 기존 방식 그대로 유지
	$('.sub-accordion input').each(function() {
		const $checkbox = $(this);
		const $content = $checkbox.next('label').next('div');

		// 초기 상태 설정
		if ($checkbox.is(':checked')) {
			$content.css('max-height', $content.prop('scrollHeight') + 'px');
		} else {
			$content.css('max-height', '0');
		}

		// 중분류 체크박스 변경 이벤트
		$checkbox.on('change', function() {
			if ($checkbox.is(':checked')) {
				// 중분류 펼치기
				const targetHeight = $content.prop('scrollHeight');
				$content.css('max-height', targetHeight + 'px');
			} else {
				// 중분류 접기
				$content.css('max-height', '0');
			}
		});
	});*/

	// ✅ 모든 아코디언의 높이를 재계산하는 함수
	function recalculateAllAccordions() {
		$('input.answer:checked').each(function() {
			const $content = $(this).next('label').next('div');
			const realHeight = $content.prop('scrollHeight');
			$content.css('max-height', realHeight + 'px');
		});

		// 100ms 후에 auto로 변경
		setTimeout(() => {
			$('input.answer:checked').each(function() {
				const $content = $(this).next('label').next('div');
				$content.css('max-height', 'auto');
			});
		}, 100);
	}

	$('input.answer').each(function() {
		const $checkbox = $(this);
		const $content = $checkbox.next('label').next('div');

		// 초기 상태 설정
		if ($checkbox.is(':checked')) {
			$content.css('max-height', 'auto');
		} else {
			$content.css('max-height', '0');
		}

		// 체크박스 변경 이벤트
		$checkbox.on('change', function() {
			if ($checkbox.is(':checked')) {
				// 펼치기
				const targetHeight = $content.prop('scrollHeight');
				$content.css('max-height', targetHeight + 'px');

				setTimeout(() => {
					if ($checkbox.is(':checked')) {
						$content.css('max-height', 'auto');
						// ✅ 모든 아코디언 높이 재계산
						recalculateAllAccordions();
					}
				}, 350);

			} else {
				// 접기
				const currentHeight = $content.prop('scrollHeight');
				$content.css('max-height', currentHeight + 'px');

				requestAnimationFrame(() => {
					$content.css('max-height', '0');
				});

				// ✅ 접기 완료 후 다른 아코디언들 높이 재계산
				setTimeout(() => {
					recalculateAllAccordions();
				}, 350);
			}
		});
	});

	// ✅ 서브메뉴 변경 시에도 전체 재계산
	$(document).on('change', '.sub-accordion input', function() {
		setTimeout(() => {
			recalculateAllAccordions();
		}, 100);
	});

	// ✅ 윈도우 리사이즈 시에도 재계산
	$(window).on('resize', function() {
		recalculateAllAccordions();
	});
	function showLoading(type) {
		const overlay = document.getElementById('loadingOverlay');
		const text = document.getElementById('loadingText');
		const subtitle = document.getElementById('loadingSubtitle');

		// 로딩 텍스트 변경
		const loadingMessages = {
			'main': {
				text: '시스템을 불러오는 중입니다...',
				subtitle: '잠시만 기다려주세요'
			},
			'data': {
				text: i18n.t('info.loading'),
				subtitle: i18n.t('info.processing')
			},
			'export': {
				text: '파일을 내보내는 중입니다...',
				subtitle: '엑셀 파일을 생성하고 있습니다'
			},
			'import': {
				text: '파일을 가져오는 중입니다...',
				subtitle: '데이터를 검증하고 있습니다'
			},
			'insert': {
				text: '데이터를 등록하는 중입니다...',
				subtitle: '잠시만 기다려주세요'
			}
		};

		const message = loadingMessages[type];
		text.textContent = message.text;
		subtitle.textContent = message.subtitle;

		// 로딩창 표시
		overlay.classList.remove('hidden');

		// 3초 후 자동으로 숨기기 (데모용)
		setTimeout(() => {
			hideLoading();
		}, 3000);
	}

	// 로딩창 숨기기 함수
	function hideLoading() {
		const overlay = document.getElementById('loadingOverlay');
		overlay.style.animation = 'fadeOut 0.3s ease-in-out';
		setTimeout(() => {
			overlay.classList.add('hidden');
			overlay.style.animation = '';
		}, 300);
	}

	// 페이지 로드 시 로딩창 표시 (선택사항)
	/*
	window.addEventListener('load', function() {
		showLoading('main');
	});
	*/

	// ESC 키로 로딩창 닫기 (개발 시 유용)
	document.addEventListener('keydown', function(event) {
		if (event.key === 'Escape') {
			hideLoading();
		}
	});

	// 메뉴 토글 버튼 클릭
	$(document).on('click', '.menu-toggle-btn', function() {
		$('.menuListArea').toggleClass('active');
		$('.menu-toggle-btn').toggleClass('active');
		$('.contentArea').toggleClass('menu-open');
	});

	/*// 메뉴 항목 클릭 시 메뉴 닫기
	$(document).on('click', '.menuListArea .divBlockTrigger', function() {
		$('.menuListArea').removeClass('active');
		$('.menu-toggle-btn').removeClass('active');
		$('.contentArea').removeClass('menu-open');
	});*/

	// 메뉴 바깥쪽 클릭 시 메뉴 닫기
	/*$(document).on('click', function(e) {
		if (!$(e.target).closest('.menuListArea').length &&
			!$(e.target).closest('.menu-toggle-btn').length) {
			$('.menuListArea').removeClass('active');
			$('.menu-toggle-btn').removeClass('active');
			$('.contentArea').removeClass('menu-open');
		}
	});*/


});




/*$(document).on("change", ".accordion input[type='checkbox']", function() {
	const $this = $(this);

	$(".accordion input[type='checkbox']").each(function(index) {
		const id = $(this).attr("id");
		const isChecked = $(this).is(":checked");
		console.log("Checkbox ID:", id, "Checked:", isChecked);
	});

	console.log($this)
	// 체크된 경우
	if ($this.is(":checked")) {
		// 다른 체크박스들 모두 해제
		$(".accordion input[type='checkbox']").not($this).prop("checked", false);

		// 아이콘 초기화: 모두 플러스로
		$(".accordion label i.fa-plus, .accordion label i.fa-minus")
			.removeClass("fa-minus")
			.addClass("fa-plus");

		// 현재 label의 아이콘을 - 로 변경
		$this.siblings("label").find("i.fa-plus").removeClass("fa-plus").addClass("fa-minus");
	} else {
		// 체크 해제 시 해당 아이콘 다시 플러스로
		$this.siblings("label").find("i.fa-minus").removeClass("fa-minus").addClass("fa-plus");
	}
});*/

$(".accordion label").on("click", function(e) {
	const $label = $(this);
	const $checkbox = $("#" + $label.attr("for")); // 해당 label이 제어하는 체크박스
	const isChecked = $checkbox.prop("checked");

	// 현재 체크박스가 체크 안되어 있으면 → 열기
	if (!isChecked) {
		// 모든 체크박스 해제
		$(".accordion input[type='checkbox']").prop("checked", false);

		// 모든 아이콘 플러스로 초기화
		$(".accordion label i.fa-minus").removeClass("fa-minus").addClass("fa-plus");

		// 현재만 체크
		$checkbox.prop("checked", true);

		// 현재 아이콘 변경
		$label.find("i.fa-plus").removeClass("fa-plus").addClass("fa-minus");
	} else {
		// 현재만 해제
		$checkbox.prop("checked", false);
		$label.find("i.fa-minus").removeClass("fa-minus").addClass("fa-plus");
	}
});

$(document).on("click", ".divBlockTrigger", function(e) {

	e.preventDefault();

	// ✅ accordion의 스크롤 위치 저장
	const accordionContainer = $('.accordion');
	const accordionScrollTop = accordionContainer.scrollTop();

	let clickMenuId = $(this).prop("id");
	let viewName = "view_" + clickMenuId;

	if ($(".tapAreaCommon").length < 9 || $("#" + viewName).length === 1) {
		$(".w_defaultArea").hide();
		//임시화면 제거 - 추후엔 없애야 함
		//$(".w_tapArea").remove();
		//$(".w_tapArea").empty();
		$(".w_titleArea").empty();
		//$(".w_contentArea").empty();
		$(".divBlockControl").css("display", "none");

		//console.log(clickMenuId);

		//$(".saveClickMenuId").attr("id",clickMenuId);

		//변수 그룹 
		let fnName = "call_" + clickMenuId;

		//탭&타이틀, 아이디 변수
		let menuName = $(this).text();
		let groupName = $(this).data("group");
		let id = $(this).attr('id');

		//console.log("존재여부 -- " + $("#"+viewName).length);

		console.log("Call ID - " + fnName);
		console.log("View ID - " + viewName);
		//console.log("View ID - " + menuName);

		//호출방법
		/*if(typeof window[fnName] === "function") {
			window[fnName](); // call_변수명 호출
		}else {
			console.log("Function 변수명 호출 실패 -- " + fnName );
		}*/

		// 호출 까지되는데 이제 호출하기전에 앞에 id가 view_변수명으로 체크해서 length 1이면 해당 창 display 조절 없으면 호출 식으로하는게맞는듯
		// 상단 탭영역 생성시키고 탭 tap_변수명 으로 탭들어간건 활성화처럼보이게, 내부영역은 display 활성화 
		// x 표시 누르면 탭 없애고 div 박스 삭제


		$(".tapAreaCommon").removeClass("tapSelected");
		if ($("#" + viewName).length === 0) {
			var tap_output;
			if (clickMenuId.startsWith("m7_")) {
				tap_output = `
						<div class="tapAreaCommon tapSelected longDiv" data-tapid="${clickMenuId}">
							<div class="tapCommon">${menuName}</div>
							<div class="tapX" id="${clickMenuId}">X</div>
						</div>
				`;
			} else {
				tap_output = `
						<div class="tapAreaCommon tapSelected" data-tapid="${clickMenuId}">
							<div class="tapCommon">${menuName}</div>
							<div class="tapX" id="${clickMenuId}">X</div>
						</div>
				`;
			}
			$(".w_tapArea").prepend(tap_output);

			console.log("260120");
			console.log(fnName);
			console.log('fnName:', fnName, typeof window[fnName]);
			console.log(typeof window[fnName], window[fnName]);
			window[fnName]();

			// ★★★ 여기 추가 — 새로 열린 탭에만 스토리지 자동세팅
			window.autoSetStorageFields($("#" + viewName));
		} else if ($("#" + viewName).length > 0 && !$("#" + viewName).is(":visible")) {
			$(".tapCommon").each(function() {
				console.log($(this).text());
				console.log(menuName)
				if ($(this).parent().data('tapid') === id) {							// 동일한 이름일 때 페이지가 안열리는 현상 때문에 코드 수정 - 기존 : 이름, 현재 : id
					$(this).closest(".tapAreaCommon").addClass("tapSelected");
				}
			});
			$("#" + viewName).show();
		}
		//call_m1_1();

		// 탭 넣어주기 변수 처리



		//타이틀 아웃 풋은 선택한 값의 text 값과 상위 div 의 text 값을 이용. 상위Text > 선택Text 로 구성한다. (이렇게 할 시 각 메뉴 js 파일 내 코드 작성 필요 없음)

		//console.log("Title 출력 형식 -- " + groupName + " > " + menuName);

		let titleAreaOutput = `
			<div class="w_titleText_1">${groupName} > </div>
			<div class="w_titleText_2">${menuName}</div>
		`;

		/*if(menuName == "창고관리"){
			titleAreaOutput += `
				<div class="header-actions">
					<button class="btn-new" id="btnInsert_warehouse">
						✚ 신규 등록
					</button>
				</div>
			`
		}*/

		$(".w_titleArea").prepend(titleAreaOutput);

		// ✅ accordion 스크롤 복원
		setTimeout(() => {
			accordionContainer.scrollTop(accordionScrollTop);
		}, 0);
	} else {
		alert(i18n.t('warning.tab.limit')); // 해결
	}

});

$(document).on("click", ".tapAreaCommon", function() {
	let moveTapId = $(this).data("tapid");

	if ($(this).hasClass("tapSelected")) {
		// 이미 선택된 탭
	} else {
		// menuTypeChanged 이벤트 발생 방지
		const originalDispatch = document.dispatchEvent;
		document.dispatchEvent = function(event) {
			if (event.type === 'menuTypeChanged') return;
			return originalDispatch.call(document, event);
		};

		$("#" + moveTapId).click();

		// 원래대로 복원
		document.dispatchEvent = originalDispatch;
	}
});
$(document).on("click", ".tapX", function(event) {
	event.stopPropagation();

	let tapCloseId = $(this).attr("id");
	let $currentTap = $(this).closest(".tapAreaCommon");

	$(".w_contentArea").removeClass('dashboardControl')

	console.log("TAP Close ID = " + tapCloseId);
	//console.log($(this).closest(".tapAreaCommon").hasClass("tapSelected"));
	//console.log($(".tapAreaCommon").length);



	if ($currentTap.hasClass("tapSelected") && $(".tapAreaCommon").length === 1) {
		//console.log("메인 화면으로 이동!");
		$(".w_titleArea").empty();
		$(".w_defaultArea").show();
		// ✅ 마지막 탭 종료 - 액티브 상태의 메뉴 토글 버튼만 클릭
		if ($(".menu-toggle-btn").hasClass("active")) {
			$(".menu-toggle-btn").click();
		}
	} else if ($currentTap.hasClass("tapSelected")) {
		//console.log("바로 옆 탭으로 이동!")
		if ($currentTap.prevAll(".tapAreaCommon").length > 0) {
			//console.log("이전 탭이 존재함.");
			let $prevTap = $currentTap.prevAll(".tapAreaCommon").first();
			let moveId = $prevTap.data("tapid");
			$("#" + moveId).click();
		} else {
			//console.log("이전 탭이 존재하지 않음.");
			let $nextTap = $currentTap.nextAll(".tapAreaCommon").first();
			let moveId = $nextTap.data("tapid");
			$("#" + moveId).click();
		}
	}



	$(this).closest(".tapAreaCommon").remove();
	$("#view_" + tapCloseId).remove();


});
/* 탭기능 */
/* 누른 버튼의 id 값을 가져와서 일치하는 div가 있는지 먼저 찾고 있으면 보여주기, 없으면 추가하기.*/


// 모달 닫기
function closeModal() {
	document.getElementById('warehouseEditModal').style.display = 'none';
}







// ============================
// 공장 접근 권한에 따른 공장 설정
// ============================
(function () {
	function readFactoryAccess() {
	   // 1) 단일 키로 저장한 경우
		let v = sessionStorage.getItem("factoryAccess");
	    
	    return String(v || "ALL").toUpperCase();
	}

	function applyFactoryAccessToSelect($sel) {
		if (!$sel || $sel.length === 0) return;
		
		const access = readFactoryAccess();

	    // ALL이면 전체 허용 (필터 없음)
	    if (access === "ALL") {
	    	// 원본 옵션 백업(해당 select 최초 1회)
	    	if (!$sel.data("originOptions")) {
		    	$sel.data("originOptions", $sel.html());
		    } 
	    	return;
	    }
	    
		// 원본 옵션 백업(최초 1회)
		if (!$sel.data("originOptions")) {
			$sel.data("originOptions", $sel.html());
		} else {
			$sel.html($sel.data("originOptions"));
		}

	    // SALTILLO / PUEBLA면 해당 공장만 남김 (all 옵션도 제거)
	    $sel.find("option").each(function () {
	    	const val = String($(this).val() || "").toUpperCase();
	    	const keep = (val === access);
	    	if (!keep) $(this).remove();
	    });
	}

	// ✅ 핵심: 동적으로 생성/교체돼도 무조건 잡히게 "이벤트 위임"으로 처리
	$(document).off(".factoryAccessSelect");

	$(document).on("mousedown.factoryAccessSelect focus.factoryAccessSelect ", "select.factory-select", function () {
		applyFactoryAccessToSelect($(this));
	});
})();






function buildLoginUrl() {
	return `/?expired=true`;
}
window.__redirecting401 = false;


(function() {
	if (window.__xhr401Installed) return;
	window.__xhr401Installed = true;

	const _open = XMLHttpRequest.prototype.open;
	const _send = XMLHttpRequest.prototype.send;

	XMLHttpRequest.prototype.open = function(method, url) {
		this.__method = method; this.__url = url;
		return _open.apply(this, arguments);
	};

	XMLHttpRequest.prototype.send = function() {
		this.addEventListener('loadend', () => {
			if (this.status === 401 && !window.__redirecting401) {
				window.__redirecting401 = true;
				const h = (this.getResponseHeader && this.getResponseHeader('X-Login-Redirect')) || null;
				const url = h || (typeof buildLoginUrl === 'function' ? buildLoginUrl() : '/?expired=true');
				alert(i18n.t('warning.session.expired'));
				window.location.replace(url);
			}
		});
		return _send.apply(this, arguments);
	};
})();

// 세션만료 되었을때 데이터 조회 오류 alert창 뜨는거 방지
(function($) {
	if (!$.ajaxPrefilter) return; // 혹시 모를 구버전 방어

	$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
		const origError = options.error;

		options.error = function(xhr, status, error) {
			// 🔹 401 이면 개별 error 콜백은 아예 실행하지 않음
			if (xhr && xhr.status === 401) {
				// 로딩바 정리하고 싶으면 여기서만 처리
				if (typeof hideLoading === 'function') {
					hideLoading();
				}
				return;
			}

			// 그 외 에러는 원래 error 콜백 그대로 실행
			if (typeof origError === 'function') {
				return origError.apply(this, arguments);
			}
		};
	});
})(jQuery);

$.ajaxSetup({
	headers: { 'X-Requested-With': 'XMLHttpRequest' },
	statusCode: {
		401: function(xhr) {
			if (window.__redirecting401) return;

			window.__redirecting401 = true;
			const url = xhr.getResponseHeader('X-Login-Redirect') || buildLoginUrl();
			alert(i18n.t('warning.session.expired'));
			window.location.replace(url);
		}
	}
});

window.showCopyableAlert = function(message) {
	// 기존 모달 제거
	if ($("#copyableAlertModal").length) $("#copyableAlertModal").remove();

	const modalHtml = `
        <div id="copyableAlertModal"
             style="
                position: fixed; inset: 0;
                background: rgba(15, 23, 42, 0.45);
                display: flex; align-items: center; justify-content: center;
                z-index: 9999;
             ">
            <div style="
                background: #ffffff;
                width: 460px;
                max-width: 90%;
                border-radius: 12px;
                box-shadow: 0 18px 45px rgba(15, 23, 42, 0.35);
                overflow: hidden;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                height:50%;
             ">
                <!-- 헤더 -->
                <div style="
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: #f9fafb;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                 ">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="
                            display:inline-flex;
                            width: 22px; height: 22px;
                            border-radius: 999px;
                            background: rgba(15, 23, 42, 0.25);
                            align-items:center; justify-content:center;
                            font-size: 14px;
                        ">!</span>
                        <span style="font-size: 15px; font-weight: 600;">
                            Notice
                        </span>
                    </div>
                    <button id="closeAlertBtn"
                        style="
                            border: none;
                            background: transparent;
                            color: #e5e7eb;
                            font-size: 16px;
                            cursor: pointer;
                            padding: 0 4px;
                        "
                        aria-label="Close">
                        ✕
                    </button>
                </div>

                <!-- 내용 -->
                <div style="padding: 14px 16px 6px 16px; font-size: 13px; color:#111827;">
                    <p style="margin: 0 0 8px 0; line-height: 1.5;">
                        You can copy the message below if needed:
                    </p>
                    <textarea id="copyableAlertText"
                        style="
                            width: 100%;
                            height: 310px;
                            padding: 10px 12px;
                            box-sizing: border-box;
                            border-radius: 8px;
                            border: 1px solid #d1d5db;
                            background: #f9fafb;
                            font-size: 14px;
                            line-height: 1.4;
                            resize: vertical;
                            color:#111827;
                        ">${message}</textarea>
                </div>

                <!-- 버튼 영역 -->
                <div style="
                    padding: 10px 16px 12px 16px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                 ">
                    <button id="copyAlertBtn"
                        style="
                            padding: 6px 12px;
                            font-size: 12px;
                            border-radius: 999px;
                            border: 1px solid #d1d5db;
                            background: #ffffff;
                            color: #374151;
                            cursor: pointer;
                        ">
                        Copy
                    </button>
                    <button id="closeAlertBtnBottom"
                        style="
                            padding: 6px 14px;
                            font-size: 12px;
                            border-radius: 999px;
                            border: none;
                            background: #2563eb;
                            color: #f9fafb;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;

	$("body").append(modalHtml);

	// 복사 버튼
	$("#copyAlertBtn").on("click", function() {
		const textarea = document.getElementById("copyableAlertText");
		textarea.select();
		document.execCommand("copy");
		alert("Copied to clipboard.");
	});

	// 닫기 버튼 (위/아래 둘 다)
	$("#closeAlertBtn, #closeAlertBtnBottom").on("click", function() {
		$("#copyableAlertModal").remove();
	});


	function handleAjaxError(xhr, status, error) {
		console.error("AJAX request failed");
		console.error("HTTP:", xhr && xhr.status, "Status:", status);
		console.error("Error:", error);
		console.error("Response:", xhr && xhr.responseText);

		// ✅ 1) 403이면 무조건 권한 모달
		if (xhr && Number(xhr.status) === 403) {
			window.showI18nAlert("NO_DML_PERMISSION");
			return;
		}

		// ✅ 2) JSON(code) 내려온 경우도 처리
		let json = null;
		try {
			json = xhr.responseJSON || JSON.parse(xhr.responseText);
		} catch (e) { }

		if (json && json.code) {
			if (json.code === "NO_DML_PERMISSION") {
				window.showI18nAlert("NO_DML_PERMISSION");
				return;
			}
			window.showI18nAlert("ERROR");
			return;
		}

		// ✅ 3) 나머지는 일반 에러 모달
		window.showI18nAlert("ERROR");
	}

	$(document).ajaxError(function(event, xhr, settings, error) {
		console.log("🔥 GLOBAL ajaxError called:", settings.url, xhr.status);
		handleAjaxError(xhr, xhr.statusText, error);
	});

	window.showI18nAlert = function(i18nKey) {
		const lang = window.getLang();

		const dict = {
			ko: {
				NO_DML_PERMISSION: "데이터 편집 권한이 없습니다.",
				ERROR: "오류가 발생했습니다.",
				NOTICE: "알림",
				CLOSE: "닫기"
			},
			en: {
				NO_DML_PERMISSION: "You do not have permission to edit data.",
				ERROR: "An error occurred.",
				NOTICE: "Notice",
				CLOSE: "Close"
			},
			es: {
				NO_DML_PERMISSION: "No tiene permiso para editar los datos.",
				ERROR: "Ocurrió un error.",
				NOTICE: "Aviso",
				CLOSE: "Cerrar"
			}
		};

		const msg = (dict[lang] && dict[lang][i18nKey]) || dict.ko[i18nKey] || dict.ko.ERROR;

		window.showCopyableAlert(msg, (dict[lang] && dict[lang].NOTICE) || dict.ko.NOTICE);
	};




};




