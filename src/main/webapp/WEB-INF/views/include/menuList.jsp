<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title></title>
<link rel="shortcut icon" href="https://www.hanmacsystem.com/web/upload/atom.ico">
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.25/css/dataTables.bootstrap4.min.css">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>

<link rel="stylesheet" href="../resources/css/w_header.css" >


</head>

<script type="text/javascript">
	$(document).ready(function(){

		showLoading("data");

		function getCookie(name) {
		    const cookies = document.cookie.split(';');
		    for(let cookie of cookies) {
		        const [key, value] = cookie.trim().split('=');
		        if(key === name) {
		            return value;
		        }
		    }
		    return null;
		}

		const id = getCookie('userLoginId');
		console.log('id 값:', id);

		// MMMM 사번은 전체 메뉴 접근 가능
		if (id === 'master' || id === 'wms') {
		//if (sabun === 'MMMM') {
		    console.log('MASTER 사번 - 전체 메뉴 표시');
		    hideLoading();
		    return; // AJAX 호출하지 않고 종료
		} 

		console.log("Login ID : ", id);

		// 260409 DH - 메뉴 권한 기능 임시 제거
		hideLoading();
		return;

		$.ajax({
			url: "/view_main_menu_user_access",
			type: "POST",
			data: id,
			contentType: "application/json",
			success: function(data) {
				console.log("-- ACCESS MENU --")
				
				// 배열을 Set으로 변환
				const menuSet = new Set(Array.isArray(data) ? data : []);
				
 				// 대분류 숨김처리
 				const mainMenus = ['BASICDATA', 'PURCHASE', 'SALES', 'DASHBOARD'];
				
				$('[data-matching]').each(function(){
					const key = $(this).attr('data-matching');
					
					if(mainMenus.includes(key)) return;
					
					// 대시보드는 권한 없이 모든 사용자가 볼 수 있도록 변경
					if (key.includes('DASHBOARD')) return;
					
					if (!menuSet.has(key)) {
				        $(this).closest('.menuCommon').hide();
				        $(this).closest('.sub-accordion.menuCommon').hide();
				    } else {
				        $(this).closest('.menuCommon').addClass('hasAccess');
				    }
				});
				
				hideLoading();

			},
		    error: function(xhr, status, error) {
		        console.error("요청 실패");
		        console.error("Status:", status);       // 예: "error"
		        console.error("Error:", error);         // 예: 서버 응답 메시지
		        console.error("Response:", xhr.responseText); // 서버 응답 본문
		        alert("오류가 발생했습니다: " + error);
		    }
		});


	});
</script>

<body>
	<button class="menu-toggle-btn">☰</button>
	<div class="menuListArea">
		<div class="accordion">
			<input type="checkbox" class="answer" id="answer01">
			<label for="answer01" data-matching="BASICDATA" style="border-top:0px solid;">
				<img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-01.png">
				<span class="normalLink"><spring:message code ="menu.group.basicData"/><!-- 기초자료 --></span>
				<i class="fa-solid fa-plus " style="color: white;position: absolute;top: 16px;right: 13px;"></i>
			</label>
			<div class="menuListCallBack_1">
				<div class="menuCommon menu1Tap1">
					<i class="fa-solid fa-list" style="color : white;"></i>
					<p id="mBasicData_userInfo" class="divBlockTrigger" data-matching="BASICDATA_USERINFO" data-group="<spring:message code ="menu.group.basicData"/>">
						<spring:message code ="basicData.userInfo"/><!-- 사용자정보 -->
					</p>
				</div>
				<div class="menuCommon menu1Tap3">
					<i class="fa-solid fa-list" style="color : white;"></i>
					<p id="mBasicData_productInfo" class="divBlockTrigger" data-matching="BASICDATA_PRODUCTINFO" data-group="<spring:message code ="menu.group.basicData"/>">
						<spring:message code ="basicData.productInfo"/><!-- 품번정보 -->
					</p>
				</div>
				<div class="menuCommon menu1Tap3">
					<i class="fa-solid fa-list" style="color : white;"></i>
					<p id="mBasicData_warehouse" class="divBlockTrigger" data-matching="BASICDATA_PRODUCTINFO" data-group="<spring:message code ="menu.group.basicData"/>">
						<spring:message code ="basicData.storageStructure"/><!-- 창고구조정보 -->
					</p>
				</div>
				<div class="menuCommon menu1Tap3">
					<i class="fa-solid fa-list" style="color : white;"></i>
					<p id="mBasicData_sequenceManagement" class="divBlockTrigger" data-matching="BASICDATA_PRODUCTINFO" data-group="<spring:message code ="menu.group.basicData"/>">
						서열 정보
					</p>
				</div>
			</div>

			<!-- 입고조회 대분류 -->
            <input type="checkbox" class="answer" id="answer02">
            <label for="answer02" data-matching="PURCHASE_INCOMING">
                <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-04.png">
                <span class="normalLink"><spring:message code="purchase.inbound.inquiry"/></span>
                <i class="fa-solid fa-plus"style="color:white; position:absolute; top:16px; right:13px;"></i>
            </label>
            <div class="menuListCallBack_2">
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_incomingDetail" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_INCOMING" data-group="<spring:message code='purchase.inbound.inquiry'/>">
                        <spring:message code="purchase.inbound.detail.list"/>
                    </p>
                </div>
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_incomingSummary" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_INCOMING" data-group="<spring:message code='purchase.inbound.inquiry'/>">
                        <spring:message code="purchase.incoming.summary"/>
                    </p>
                </div>
            </div>

            <!-- 출고 대분류 -->
            <input type="checkbox" class="answer" id="answer03">
            <label for="answer03" data-matching="PURCHASE_LOAD">
                <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-06.png">
                <span class="normalLink"> <spring:message code="purchase.load"/></span>
                <i class="fa-solid fa-plus" style="color:white; position:absolute; top:16px; right:13px;"></i>
            </label>
            <div class="menuListCallBack_3">
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_load_detail" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_LOAD" data-group="<spring:message code='purchase.load'/>">
                        <spring:message code="purchase.load.detail"/>
                    </p>
                </div>
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_load_summary" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_LOAD" data-group="<spring:message code='purchase.load'/>">
                        <spring:message code="purchase.load.summary"/>
                    </p>
                </div>
            </div>

            <!-- 대차검증 대분류 -->
            <input type="checkbox" class="answer" id="answer04">
            <label for="answer04" data-matching="PURCHASE_VALIDATION">
                <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-17.png">
                <span class="normalLink"> <spring:message code="purchase.validation"/> </span>
                <i class="fa-solid fa-plus" style="color:white; position:absolute; top:16px; right:13px;"></i>
            </label>
            <div class="menuListCallBack_4">
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_validation_detail" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_VALIDATION" data-group="<spring:message code='purchase.validation'/>">
                        <spring:message code="purchase.validation"/>
                    </p>
                </div>
            </div>

            <!-- 서열관리 대분류 -->
            <input type="checkbox" class="answer" id="answer05">
            <label for="answer05" data-matching="PURCHASE_SEQUENCE">
                <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-10.png">
                <span class="normalLink">서열관리</span>
                <i class="fa-solid fa-plus" style="color:white; position:absolute; top:16px; right:13px;"></i>
            </label>

            <div class="menuListCallBack_5">
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_sequence_summary" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code='purchase.inventory'/>">
                        전체 서열 내역
                    </p>
                </div>
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_sequence_f" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code='purchase.inventory'/>">
                        LINE F
                    </p>
                </div>
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_sequence_r" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code='purchase.inventory'/>">
                        LINE R
                    </p>
                </div>
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_sequence_t" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code='purchase.inventory'/>">
                        LINE T
                    </p>
                </div>
            </div>

            <!-- 재고실사 대분류 -->
            <input type="checkbox" class="answer" id="answer06">
            <label for="answer06" data-matching="PURCHASE_STOCKCOUNT">
                <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-09.png">
                <span class="normalLink"><spring:message code="purchase.inventory"/></span>
                <i class="fa-solid fa-plus" style="color:white; position:absolute; top:16px; right:13px;"></i>
            </label>

            <div class="menuListCallBack_6">
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_stockcount_detail" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code='purchase.inventory'/>">
                        <spring:message code="purchase.inventory.detail"/>
                    </p>
                </div>
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_stockcount_summary" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code='purchase.inventory'/>">
                        <spring:message code="purchase.inventory.summary"/>
                    </p>
                </div>
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_stockcount_out_detail" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code='purchase.inventory'/>">
                        <spring:message code="purchase.inventory.out.detail"/>
                    </p>
                </div>
                <div class="menuCommon">
                    <i class="fa-solid fa-list" style="color:#046565;"></i>
                    <p id="mPurchase_stockcount_out_summary" class="divBlockTrigger" data-menu-type="purchase" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code='purchase.inventory'/>">
                        <spring:message code="purchase.inventory.out.summary"/>
                    </p>
                </div>
            </div>
		</div>

		<div class="menuListFooterArea">
			<div class="btnLogoutArea">
				<span class="material-icons" >
					<a href="/logout" id="logout" >logout</a>
				</span>
				<a class="btnLogout" href="/logout"><spring:message code ="btn.logout"/><!-- 로그아웃 --></a>
			</div>
			<div class="copyRight">
				<p class="copyRightHanmacSystem">© 2026, Hanmac System. <br> All rights reserved.</p>
			</div>
		</div>
	</div>
</body>
<script>
	window.currentMenuType = window.currentMenuType ?? null;
	window.currentDataMatching = window.currentDataMatching ?? null;

	$(document).on('click', '.divBlockTrigger', function () {
	    let menuType = (this.dataset.menuType || '').toLowerCase().trim();
	    let dataMatching = this.dataset.matching || '';

	    if (!menuType) {
	        const g = (this.dataset.group || '').toLowerCase();
	        const m = (this.dataset.matching || '').toLowerCase();
	        if (g.includes('sales') || m.startsWith('sales')) menuType = 'sales';
	        else if (g.includes('purchase') || m.startsWith('purchase')) menuType = 'purchase';
	        else if (g.includes('fabric') || m.startsWith('fabric')) menuType = 'fabric';
	        else if (g.includes('production') || m.startsWith('production')) menuType = 'production';
	        else if (g.includes('quality') || m.startsWith('quality')) menuType = 'quality';
	    }

	    console.log('[CLICK divBlockTrigger]', {
	        menuTypeRaw: this.dataset.menuType,
	        group: this.dataset.group,
	        matching: this.dataset.matching,
	        resolvedMenuType: menuType,
	        dataMatching
	    });

	    window.currentMenuType = menuType;
	    window.currentDataMatching = dataMatching;

	    try {
	        localStorage.setItem('menuType', menuType);
	        localStorage.setItem('dataMatching', dataMatching);
	    } catch(e){}

	    document.dispatchEvent(new CustomEvent('menuTypeChanged', {
	        detail: { menuType, dataMatching }
	    }));
	});

	window.getMenuType = function() {
	    return (
	        (window.currentMenuType && String(window.currentMenuType).toLowerCase().trim()) ||
	        (localStorage.getItem('menuType') || '').toLowerCase().trim() ||
	        (document.body?.dataset?.menuType || '').toLowerCase().trim()
	    );
	};

	window.getDataMatching = function() {
	    return (
	        window.currentDataMatching ||
	        localStorage.getItem('dataMatching') ||
	        ''
	    );
	};

	// 1. 맵
	window.STORAGE_MAP = {
	    'purchase': 'Material',
	    'fabric': 'Fabric',
	    'sales': 'P1 W/HOUSE',
	    'production': 'Material',
	    'production_h/rest': 'Material',
	    'quality': 'Material'
	};

	// 2. 기본 창고 구하기 (여기만 수정)
	window.getDefaultStorage = function(menuType) {
	    const mt = (menuType || '').toLowerCase();
	    const dm = (window.getDataMatching() || '').toUpperCase();  // 예: PRODUCTION_STOCKCOMPARE

	    // ✅ PRODUCTION_STOCKCOMPARE 메뉴일 때만 H/REST
	    if ( dm === 'PRODUCTION_STOCKCOMPARE' || dm === 'PRODUCTION_STOCKINFO' || dm === 'PRODUCTION_STOCKMOVEMENT') {
	        return 'H/REST';
	    }

	    if (!window.STORAGE_MAP) return '';
	    return window.STORAGE_MAP[mt] || '';
	};

	window.autoSetStorageFields = function($tabRoot) {
	    if (!$tabRoot || $tabRoot.length === 0) return;

	    const menuType = window.getMenuType();
	    const storageValue = window.getDefaultStorage(menuType);

	    console.log('menuType', menuType);
	    console.log('storageValue', storageValue);

	    // 🔥 현재 탭($tabRoot) 내부 것만 변경
	    const $targets = $tabRoot.find("[id$='_searchVal_storage']");
	    console.log('[autoSetStorageFields] target count =', $targets.length);

	    $targets.each(function() {
	        console.log(' - target id:', this.id, '현재값:', $(this).val());
	    });

	    $targets.val(storageValue).trigger('change');
	};


	// 메뉴 타입 바뀔 때는 그대로 두셔도 OK
	document.addEventListener('menuTypeChanged', function() {
		console.log('[menuTypeChanged event triggered]');
	    window.autoSetStorageFields();
	});

	// 쿠키값 가져오는 함수
	  function getCookie(name) {
	    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
	    return match ? decodeURIComponent(match[1]) : null;
	  }

	  (function () {
	    // 실제 쿠키 이름/값은 확인해서 맞게 바꿔 주세요
	    const lang = getCookie('lang');   // 예: 'ko', 'en', 'es-MX', 'es_MX' 등
	  })();

</script>
</html>
