// loadCSS.js
window.loadCSSForMenu = function(menuId) {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';

	console.log(menuId)
	link.href = '../resources/css/menulist' + menuId;
	/*if (menuId.startsWith("m1")) {
	  link.href = '../resources/css/menulist/m1/m1.css';
	} else if (menuId.startsWith("m2")) {
	  link.href = '../resources/css/menulist/m2/m2.css';
	} else if (menuId.startsWith("m3")) {
	  link.href = '../resources/css/menulist/m3/m3.css';
	} else if (menuId.startsWith("m4")) {
	  link.href = '../resources/css/menulist/m4/m4.css';
	} else if (menuId.startsWith("m5")) {
	  link.href = '../resources/css/menulist/m5/m5.css';
	} else if (menuId.startsWith("m6")) {
	  link.href = '../resources/css/menulist/m6/m6.css';
	}*/

	document.head.appendChild(link);


};

var isLoadingActive = false; // 예: 로딩 활성 상태
let loadingTimeoutId = null; // ✨ 이 한 줄만 추가

window.showLoading = showLoading;
window.hideLoading = hideLoading;

// 로딩창 표시 함수
function showLoading(type, opts = {}) {
	
	// 새 옵션 or 전역 플래그(다음 1회만) → 기본동작 결정
	 const preserveScroll =
	   (typeof opts.preserveScroll === 'boolean')
	     ? opts.preserveScroll
	     : (window.__preserveScrollNextLoading === true);

	 // 플래그는 1회용이므로 여기서 바로 리셋
	 window.__preserveScrollNextLoading = false;

	isLoadingActive = true

	if (loadingTimeoutId) {
		clearTimeout(loadingTimeoutId);
		loadingTimeoutId = null;
	}

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
		/*'export': {
			text: '파일을 내보내는 중입니다...',
			subtitle: '엑셀 파일을 생성하고 있습니다'
		},*/
		'export': {
			text: 'Exporting file...\nPlease do not refresh.',
			subtitle: 'Generating Excel file'
		},
		'import': {
			text: '파일을 가져오는 중입니다...',
			subtitle: '데이터를 검증하고 있습니다'
		},
		'insert': {
			text: '데이터를 등록하는 중입니다...',
			subtitle: '잠시만 기다려주세요'
		},
		'update': {
			text: '데이터를 수정하는 중입니다...',
			subtitle: '잠시만 기다려주세요'
		},
		'task': {
			text: i18n.t('info.loading'),
			subtitle: i18n.t('info.processing')
		},
		'download': {
			text: '파일 다운로드 중입니다...',
			subtitle: '잠시만 기다려주세요'
		}
	};

	const message = loadingMessages[type];
	text.textContent = message.text;
	subtitle.textContent = message.subtitle;

	// 로딩창 표시
	overlay.classList.remove('hidden');

	// 3초 후 자동으로 숨기기 (데모용)
	/*setTimeout(() => {
		hideLoading();
	}, 3000);*/
	
	if (!preserveScroll) {
		// 모든 스크롤 맨 위로 이동
		window.scrollTo(0, 0);
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
	
		// 모든 스크롤 가능한 요소들 맨 위로 이동
		document.querySelectorAll('*').forEach(element => {
			if (element.scrollTop > 0) {
				element.scrollTop = 0;
			}
			if (element.scrollLeft > 0) {
				element.scrollLeft = 0;
			}
		});
	}
}

// 로딩창 숨기기 함수
function hideLoading() {
	console.log(`🛑 hideLoading 호출`);

	// 🔑 중요: 로딩이 활성화되지 않았으면 무시
	if (!isLoadingActive) {
		console.log("❌ 로딩이 활성화되지 않음 - hideLoading 무시");
		return;
	}

	isLoadingActive = false;
	const overlay = document.getElementById('loadingOverlay');
	overlay.style.animation = 'fadeOut 0.3s ease-in-out';

	// 🔑 핵심: loadingTimeoutId에 새로운 타이머 ID 저장
	loadingTimeoutId = setTimeout(() => {
		console.log(`⏰ 타이머 실행 - 현재 로딩 상태: ${isLoadingActive}`);

		// 🔑 중요: 타이머 실행 시점에 다시 로딩이 활성화되었는지 확인
		if (!isLoadingActive) {
			overlay.classList.add('hidden');
			overlay.style.animation = '';
			console.log("✅ hideLoading 완료");
		} else {
			console.log("🔄 새로운 로딩이 활성화되어 hideLoading 취소됨");
		}

		// 타이머 완료 후 ID 초기화
		loadingTimeoutId = null;

	}, 300); // 0.3초 (애니메이션 시간)

	console.log(`⏰ hideLoading 타이머 설정: ${loadingTimeoutId}`);
}

// 페이지 로드 시 로딩창 표시 (선택사항)
/*
window.addEventListener('load', function() {
	showLoading('main');
});
*/

// ESC 키로 로딩창 닫기 (개발 시 유용)
/*document.addEventListener('keydown', function(event) {
	if (event.key === 'Escape') {
		
	}
});*/

document.addEventListener('keydown', function(event) {
	if (event.key === 'Escape' && isLoadingActive) {
		event.preventDefault();
		event.stopImmediatePropagation();
	}
});







