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

<!-- <script src="/resources/js/w_menuList.js"></script> -->
<link rel="stylesheet" href="../resources/css/w_header.css" >
<!-- <link rel="icon" href="/resources/images/favicon.png"/>
<link rel="apple-touch-icon" href="/resources/images/favicon.png"/>  -->


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
				<div class="menuCommon menu1Tap7">
					<i class="fa-solid fa-list" style="color : white;"></i>
					<p id="m1_7" class="divBlockTrigger" data-matching="BASICDATA_WAREHOUSELAYOUT" data-group="<spring:message code ="menu.group.basicData"/>">
						<spring:message code ="basicData.storageStructure"/><!-- 창고구조관리 -->
					</p>
				</div>
				<div class="menuCommon menu1Tap8">
					<i class="fa-solid fa-list" style="color : white;"></i>
					<p id="mBasicData_magam" class="divBlockTrigger" data-matching="BASICDATA_MAGAM" data-group="<spring:message code ="menu.group.basicData"/>">
						<spring:message code ="basicData.magam"/><!-- 마감 -->
					</p>
				</div>
			</div>

			<!-- 구매 -->
	        <input type="checkbox" class="answer" id="answer02">
	        <label for="answer02" data-matching="PURCHASE">
	            <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-02.png">
	            <span class="normalLink"><spring:message code ="menu.group.logistic"/><!-- 구매 --></span>
	            <i class="fa-solid fa-plus" style="color: white;position: absolute;top: 16px;right: 13px;"></i>
	        </label>
	        <div class="menuListCallBack_2">
	        	<!-- 팔레트 중분류 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_m2_pallet">
	                <label for="sub_m2_pallet">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-03.png">
	                    <span><spring:message code ="purchase.palletLabel"/><!-- 팔레트라벨 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_pallet_list" class="divBlockTrigger" data-matching="PURCHASE_PALLETLABELLIST" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="menu.group.pallet"/>">
	                        	<spring:message code ="purchase.palletLabel.list"/><!-- 팔레트 라벨 목록 -->
	                        </p>
	                    </div>
	                </div>
	            </div>

	            <!-- 입고조회 중분류 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_m2_3">
	                <label for="sub_m2_3">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-04.png">
	                    <span><spring:message code ="purchase.inbound.inquiry"/><!-- 입고조회 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_incomingDetail" class="divBlockTrigger" data-matching="PURCHASE_INCOMING" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inbound.inquiry"/>">
	                        	<spring:message code ="purchase.inbound.detail.list"/><!-- 입고조회 (나열형) -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_incomingSummary" class="divBlockTrigger" data-matching="PURCHASE_INCOMING" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inbound.inquiry"/>">
	                        	<spring:message code ="purchase.incoming.summary"/><!-- 입고조회 (나열형)-->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_incoming_return_detail" class="divBlockTrigger" data-matching="PURCHASE_INCOMING" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inbound.inquiry"/>">
	                        	<spring:message code ="purchase.incoming.return.detail"/><!-- 입고반품조회 (나열형)-->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_incoming_return_summary" class="divBlockTrigger" data-matching="PURCHASE_INCOMING" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inbound.inquiry"/>">
	                        	<spring:message code ="purchase.incoming.return.summary"/><!-- 입고반품조회 (나열형)-->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_unreceivedItems" class="divBlockTrigger" data-matching="PURCHASE_INCOMING" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inbound.inquiry"/>">
	                        	<spring:message code ="purchase.incoming.unreceivedItems"/><!-- 미착품조회 (나열형)-->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_unreceivedItemcodes" class="divBlockTrigger" data-matching="PURCHASE_INCOMING" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inbound.inquiry"/>">
	                        	<spring:message code ="purchase.incoming.unreceivedItemCodes"/><!-- 미착품조회 (나열형)-->
	                        </p>
	                    </div>
	                </div>
	            </div>

	            <!-- 적재 중분류 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_m2_5">
	                <label for="sub_m2_5">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-07.png">
	                    <span><spring:message code ="purchase.stacking"/><!-- 적재 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="m2_5_2" class="divBlockTrigger" data-matching="PURCHASE_LOCATIONSTATUS"  data-menu-type="purchase" data-group="<spring:message code ="menu.group.logistic" />> <spring:message code ="purchase.stacking"/>">
	                        	<spring:message code ="purchase.stacking.locationStatus"/><!-- LOCATION 현황 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_stock_summary" class="divBlockTrigger" data-matching="PURCHASE_STOCK" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.stacking"/>">
	                        	<spring:message code ="purchase.stock.summary"/><!-- 재고 - 상세 -->
	                        </p>
	                    </div>

	                    <div class="menuCommon" style= "display:none">
		                    <i class="fa-solid fa-list" style="color: white;"></i>
		                    <p id="mPurchase_unloadList" class="divBlockTrigger" data-matching="PURCHASE_LOCATIONSTATUS" data-menu-type="purchase" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.stacking"/>">
		                    	<spring:message code ="purchase.stacking.unloadList"/><!-- LOCATION 현황 -->
		                    </p>
		                </div>
	                </div>
	            </div>

	            <!-- 출고 중분류 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_m2_load">
	                <label for="sub_m2_load">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-06.png">
	                    <span><spring:message code ="purchase.load"/><!-- 출고 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_load_detail" class="divBlockTrigger" data-matching="PURCHASE_LOAD" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.load"/>">
	                        	<spring:message code ="purchase.load.detail"/><!-- 출고 detail -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_load_summary" class="divBlockTrigger" data-matching="PURCHASE_LOAD" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.load"/>">
	                        	<spring:message code ="purchase.load.summary"/><!-- 출고 summary -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_load_return_detail" class="divBlockTrigger" data-matching="PURCHASE_LOAD" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.load"/>">
	                        	<spring:message code ="purchase.load.return.detail"/><!-- 출고 반품 detail -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_load_return_summary" class="divBlockTrigger" data-matching="PURCHASE_LOAD" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.load"/>">
	                        	<spring:message code ="purchase.load.return.summary"/><!-- 출고 반품 summary -->
	                        </p>
	                    </div>

	                </div>
	            </div>

	            <!-- 대차검증 중분류 -->
                <div class="sub-accordion menuCommon">
                    <input type="checkbox" class="answer" id="sub_m2_validation">
                    <label for="sub_m2_validation">
                        <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-17.png">
                        <span><spring:message code ="purchase.validation"/><!-- 검증 --></span>
                    </label>
                    <div>
                        <div class="menuCommon">
                            <i class="fa-solid fa-list" style="color: white;"></i>
                            <p id="mPurchase_validation_detail" class="divBlockTrigger" data-matching="PURCHASE_STOCK" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.validation"/>">
                                <spring:message code ="purchase.validation"/><!-- 검증 - 상세 -->
                            </p>
                        </div>
                    </div>
                </div>

				<!-- 이동 중분류 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_m2_movement">
	                <label for="sub_m2_movement">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-10.png">
	                    <span><spring:message code ="purchase.movement"/><!-- 이동 --></span>
	                </label>
	                <div>
	                	<div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_storage_detail" class="divBlockTrigger" data-matching="PURCHASE_MOVEMENT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.movement"/>">
	                        	<spring:message code ="purchase.movement.storage.detail"/><!-- 창고간이동 detail -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_storage_summary" style="font-size:10.5pt" class="divBlockTrigger" data-matching="PURCHASE_MOVEMENT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.movement"/>">
	                        	<spring:message code ="purchase.movement.storage.summary"/><!-- 창고간이동 summary -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_storage_complete" class="divBlockTrigger" data-matching="PURCHASE_MOVEMENT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.movement"/>">
	                        	<spring:message code ="purchase.movement.storage.complete"/><!-- 창고 이동 처리(완료) -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_storage_unreceived" class="divBlockTrigger" data-matching="PURCHASE_MOVEMENT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.movement"/>">
	                        	<spring:message code ="purchase.movement.storage.unreceived"/><!-- 창고 이동 처리(미도착) -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_storage_transfer_check" class="divBlockTrigger" data-matching="PURCHASE_MOVEMENT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.movement"/>">
	                        	<spring:message code ="purchase.movement.factory.transfer.check"/><!-- 이송 후 재고확인 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_storage_sending_detail" class="divBlockTrigger" data-matching="PURCHASE_MOVEMENT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.movement"/>">
	                        	<spring:message code ="purchase.movement.storage.detail.sending"/><!-- 창고 이동 출고 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_storage_receiving_detail" class="divBlockTrigger" data-matching="PURCHASE_MOVEMENT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.movement"/>">
	                        	<spring:message code ="purchase.movement.storage.detail.receiving"/><!-- 창고 이동 입고 -->
	                        </p>
	                    </div>
	                </div>
	            </div>

	            <!-- 예외 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_m2_exception">
	                <label for="sub_m2_exception">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-12.png">
	                    <span><spring:message code ="purchase.exception"/><!-- 이동 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_exception_input_detail" class="divBlockTrigger" data-matching="PURCHASE_EXCEPTION" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.input.detail"/><!-- 예외 입고 detail -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_exception_input_summary" class="divBlockTrigger" data-matching="PURCHASE_EXCEPTION" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.input.summary"/><!-- 예외 입고 summary -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_exception_output_detail" class="divBlockTrigger" data-matching="PURCHASE_EXCEPTION" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.output.detail"/><!-- 예외 출고 detail -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_exception_output_summary" class="divBlockTrigger" data-matching="PURCHASE_EXCEPTION" style="font-size:10.7pt;"data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.output.summary"/><!-- 예외 출고 summary -->
	                        </p>
	                    </div>
	                </div>
	            </div>

	            <!-- 품질 중분류 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_m2_quality">
	                <label for="sub_m2_quality">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-12.png">
	                    <span><spring:message code="quality.title"/><!-- 품질 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon">
                            <i class="fa-solid fa-upload" style="color: white;"></i>
                            <p id="mQuality_loadReturn_inspection_register" class="divBlockTrigger" data-matching="PURCHASE_QUALITY" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="quality.title"/>">
                                <spring:message code="quality.inspection.loadReturn.register"/><!-- 출고반품/반품검사 등록 -->
                            </p>
                        </div>
                        <div class="menuCommon">
                            <i class="fa-solid fa-upload" style="color: white;"></i>
                            <p id="mQuality_warehouse_inspection_register" class="divBlockTrigger" data-matching="PURCHASE_QUALITY" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="quality.title"/>">
                                <spring:message code="quality.inspection.warehouse.register"/><!-- 창고검사 등록 -->
                            </p>
                        </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mQuality_warehouse_inspection_list" class="divBlockTrigger" data-matching="PURCHASE_QUALITY" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="quality.title"/>">
	                            <spring:message code="quality.inspection.warehouse"/><!-- 창고검사 - List -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mQuality_return_inspection_list" class="divBlockTrigger" data-matching="PURCHASE_QUALITY" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="quality.title"/>">
	                            <spring:message code="quality.inspection.return"/><!-- 반품검사 - List -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mQuality_disposal_list" class="divBlockTrigger" data-matching="PURCHASE_QUALITY" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="quality.title"/>">
	                            <spring:message code="quality.scrap.list"/><!-- 폐기 - List -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mQuality_conditionChange_list" class="divBlockTrigger" data-matching="PURCHASE_QUALITY" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="quality.title"/>">
	                            <spring:message code="quality.conditionChange.list"/><!-- 양불전환내역 - List -->
	                        </p>
	                    </div>
	                </div>
	            </div>

	            <!-- 재고 중분류 -->
	            <div class="sub-accordion menuCommon" >
	                <input type="checkbox" class="answer" id="sub_m2_8">
	                <label for="sub_m2_8">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-08.png">
	                    <span><spring:message code ="purchase.stock"/><!-- 재고 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon" style="">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <!-- mPurchase_stockDetail -->
	                        <p id="mPurchase_stock_detail" class="divBlockTrigger" data-matching="PURCHASE_STOCK" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.stock"/>">
	                        	<spring:message code ="purchase.stock.detail"/><!-- 재고 - 상세 -->
	                        </p>
	                    </div>
						<div class="menuCommon" style="">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <!-- mPurchase_stockSanpDetail -->
	                        <p id="mPurchase_stock_snap_detail" class="divBlockTrigger" data-matching="PURCHASE_STOCK" data-group="<spring:message code ="menu.group.purchase"/> > <spring:message code ="purchase.stock"/>">
	                        	<spring:message code ="purchase.stock.snap.detail"/><!-- 재고 - 시점 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon" style="">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <!-- mPurchase_stockSummary -->
	                        <p id="mPurchase_stock_summary" class="divBlockTrigger" data-matching="PURCHASE_STOCK" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.stock"/>">
	                        	<spring:message code ="purchase.stock.summary"/><!-- 재고 - 상세 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
			            	<i class="fa-solid fa-list" style="color: white;"></i>
			                <p id="mPurchase_storageStock_list" class="divBlockTrigger" data-matching="PURCHASE_STOCK" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.stock"/>">
			                	<spring:message code ="purchase.stock.storage"/><!-- 재고 정보 -->
			                </p>
			            </div>
	                    <div class="menuCommon">
			            	<i class="fa-solid fa-list" style="color: white;"></i>
			                <p id="m2_stock_info" class="divBlockTrigger" data-matching="PURCHASE_STOCKINFO" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.stock"/>">
			                	<spring:message code ="purchase.stock.info"/><!-- 재고 정보 -->
			                </p>
			            </div>
						<div class="menuCommon">
			                 <i class="fa-solid fa-list" style="color: white;"></i>
			                 <p id="m2_stock_history" class="divBlockTrigger" data-matching="PURCHASE_STOCKINFO" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.stock"/>">
			                 	<spring:message code ="purchase.stock.history"/><!-- Lot history -->
			                 </p>
			            </div>
						<div class="menuCommon">
			                 <i class="fa-solid fa-list" style="color: white;"></i>
			                 <p id="m2_stock_movement" class="divBlockTrigger" data-matching="PURCHASE_STOCKINFO" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.stock"/>">
			                 	<spring:message code ="purchase.stock.movement"/><!-- 재고 수불부 -->
			                 </p>
			            </div>
						<c:if test="${cookie.userLoginId.value == 'wms' or cookie.userLoginId.value == 'master'}">
						    <div class="menuCommon" style="display:none">
						        <i class="fa-solid fa-list" style="color: white;"></i>
						        <p id="mPurchase_stock_total" class="divBlockTrigger" data-matching="PURCHASE_STOCK" data-group="<spring:message code='menu.group.logistic'/> > <spring:message code ="purchase.stock"/>">
						            <spring:message code="purchase.stock.total"/>
						            <!-- 사내 총 재고 -->
						        </p>
						    </div>
						</c:if>
	                </div>
	            </div>

	            <!-- 재고 실사 중분류 -->
	            <div class="sub-accordion menuCommon" >
	                <input type="checkbox" class="answer" id="sub_m2_7">
	                <label for="sub_m2_7">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-09.png">
	                    <span><spring:message code ="purchase.inventory"/><!-- 재고 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="m2_7_1" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory"/>">
	                        	<spring:message code ="purchase.inventory.counting"/><!-- 재고 - 상세 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="m2_7_3" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory"/>">
	                        	<spring:message code ="purchase.inventory.summary"/><!-- 재고 - 요약 -->
	                        </p>
	                    </div>
						<div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_exception_input_detail_stockCount" class="divBlockTrigger" data-matching="PURCHASE_EXCEPTION" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.input.detail.stockCount"/><!-- 예외 입고 detail -->
	                        </p>
	                    </div>
						<div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_exception_output_detail_stockCount" class="divBlockTrigger" data-matching="PURCHASE_EXCEPTION" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.output.detail.stockCount"/><!-- 예외 출고 detail -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
                            <i class="fa-solid fa-list" style="color: white;"></i>
                            <p id="m2_stock_count_missing" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" style="font-size: 11pt;" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory.lastDay"/>">
                                <spring:message code ="purchase.stockcount.missing"/><!-- 재고 미스캔 -->
                            </p>
                        </div>
	                </div>
	            </div>

	            <!-- 재고 실사 중분류 -->
	            <div class="sub-accordion menuCommon" >
	                <input type="checkbox" class="answer" id="sub_m2_stockCount">
	                <label for="sub_m2_stockCount">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-09.png">
	                    <span><spring:message code ="purchase.inventory.lastDay"/><!-- 재고 --></span>
	                </label>
	                <div>
						<div class="menuCommon">
							<i class="fa-solid fa-list" style="color : white;"></i>
							<p id="mBasicData_lastDay" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory.lastDay"/>">
								<spring:message code ="basicData.lastDay"/><!-- 마감 -->
							</p>
						</div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="m2_stock_count_lastday_detail" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.inventory.lastDay.detail"/><!-- 재고 - 상세 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="m2_stock_count_lastday_summary" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.inventory.lastDay.summary"/><!-- 재고 - 상세 -->
	                        </p>
	                    </div>
						<c:if test="${cookie.userLoginId.value == 'wms' or cookie.userLoginId.value == 'master'}">
							
							<div class="menuCommon">
								<i class="fa-solid fa-list" style="color: white;"></i>
								<p id="m2_stock_adjust_reason" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" style="font-size: 11pt;" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory.lastDay"/>">
									<spring:message code ="purchase.stockcount.adjust"/><!-- 재고 조정 -->
								</p>
							</div>
						</c:if>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="m2_stock_count_missing" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" style="font-size: 11pt;" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.stockcount.missing"/><!-- 재고 미스캔 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="m2_erpInterface_summary" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" style="font-size: 11pt;" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.erpInterface.summary"/><!-- 재고실사 인터페이스 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mPurchase_stock_count_wip_list" class="divBlockTrigger" data-matching="PURCHASE_STOCKCOUNT" style="font-size: 11pt;" data-group="<spring:message code ="menu.group.logistic"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.stockCount.wip"/><!-- 재고실사 인터페이스 -->
	                        </p>
	                    </div>
	                </div>
	            </div>
	        </div>

            <!-- 영업 -->
			<input type="checkbox" class="answer"id="answerSales" style = "display:none">
			<label for="answerSales" data-matching="SALES" style = "display:none">
				<img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-16.png">
				<span class="normalLink" data-matching="SALES"><spring:message code ="menu.group.sales"/><!-- 영업 --></span>
				<i class="fa-solid fa-plus " style="color: white;position: absolute;top: 16px;right: 13px;"></i>
			</label>
			<div class="menuListCallBack_sales">
	            <!-- 완제품 출고 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_mSales_load">
	                <label for="sub_mSales_load">
	                   	<img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-06.png">
	                    <span><spring:message code ="purchase.load"/><!-- 완제품 출고 --></span>
	                </label>
	                <div>
	                   	<div class="menuCommon">
							<i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_load_detail" class="divBlockTrigger" data-matching="SALES_LOAD" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.load"/>">
	                        	<spring:message code ="purchase.load.detail"/><!--출고 detail-->
							</p>
	                   	</div>
	                   	<div class="menuCommon">
							<i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_load_summary" class="divBlockTrigger" data-matching="SALES_LOAD" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.load"/>">
	                        	<spring:message code ="purchase.load.summary"/><!-- 출고 summary-->
							</p>
	                   	</div>
	                   	<div class="menuCommon">
							<i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_load_return_detail" class="divBlockTrigger" data-matching="SALES_LOAD" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.load"/>">
	                        	<spring:message code ="purchase.load.return.detail"/><!--출고 detail-->
							</p>
	                   	</div>
	                   	<div class="menuCommon">
							<i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_load_return_summary" class="divBlockTrigger" data-matching="SALES_LOAD" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="sales.load"/>">
	                        	<spring:message code ="purchase.load.return.summary"/><!-- 출고 summary-->
							</p>
	                   	</div>	                   	
	                    <div class="menuCommon" style= "">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_unreceivedItems" class="divBlockTrigger" data-matching="SALES_LOAD" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.load"/>">
	                        	<spring:message code ="sales.invoice.list"/><!-- 인보이스 list -->
	                        </p>
	                    </div>
	                </div>
	            </div>

				<!-- 이송처리 중분류 -->
	            <c:if test="${fn:toUpperCase(cookie.selectedFactory.value) eq 'SALTILLO'}">
		            <div class="sub-accordion menuCommon">
		                <input type="checkbox" class="answer" id="sub_mSales_transfer">
		                <label for="sub_mSales_transfer">
		                   <!--  <i class="fa-solid fa-cube" style="color: white;"></i> -->
		                   	<img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-15.png">
		                    <span><spring:message code ="production.transfer"/><!-- 이송처리 --></span>
		                </label>
		                <div>
		                    <div class="menuCommon">
		                        <i class="fa-solid fa-list" style="color: white;"></i>
		                        <p id="mSales_transfer_detail" class="divBlockTrigger" data-matching="SALES_MOVEMENT" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="production.transfer"/>">
		                        	<spring:message code ="production.transfer.detail"/><!-- 이송처리 detail-->
		                        </p>
		                    </div>
		                   <div class="menuCommon">
		                        <i class="fa-solid fa-list" style="color: white;"></i>
		                        <p id="mSales_transfer_summary" class="divBlockTrigger" data-matching="SALES_MOVEMENT" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="production.transfer"/>">
		                        	<spring:message code ="production.transfer.summary"/><!-- 이송처리 detail-->
		                        </p>
		                    </div>
		                </div>
		            </div>
				</c:if>
	            
	            <!-- 이동 중분류 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_mSales_movement">
	                <label for="sub_mSales_movement">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-10.png">
	                    <span><spring:message code ="purchase.movement"/><!-- 이동 --></span>
	                </label>
	                <div>
	                	<div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_storage_detail" class="divBlockTrigger" data-matching="SALES_MOVEMENT" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.movement"/>">
	                        	<spring:message code ="purchase.movement.storage.detail"/><!-- 창고간이동 detail -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_storage_summary" style="font-size:10.5pt" class="divBlockTrigger" data-matching="SALES_MOVEMENT" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.movement"/>">
	                        	<spring:message code ="purchase.movement.storage.summary"/><!-- 창고간이동 summary -->
	                        </p>
	                    </div>
	                </div>
	            </div>

	            <!-- 예외 -->
	            <div class="sub-accordion menuCommon">
	                <input type="checkbox" class="answer" id="sub_mSales_exception">
	                <label for="sub_mSales_exception">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-12.png">
	                    <span><spring:message code ="purchase.exception"/><!-- 이동 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_exception_input_detail" class="divBlockTrigger" data-matching="SALES_EXCEPTION" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.input.detail"/><!-- 예외 입고 detail -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_exception_input_summary" class="divBlockTrigger" data-matching="SALES_EXCEPTION" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.input.summary"/><!-- 예외 입고 summary -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_exception_output_detail" class="divBlockTrigger" data-matching="SALES_EXCEPTION" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.output.detail"/><!-- 예외 출고 detail -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_exception_output_summary" class="divBlockTrigger" data-matching="SALES_EXCEPTION" style="font-size:10.7pt;"data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.exception"/>">
	                        	<spring:message code ="purchase.exception.output.summary"/><!-- 예외 출고 summary -->
	                        </p>
	                    </div>
	                </div>
	            </div>

	            <!-- 재고 중분류 -->
	            <div class="sub-accordion menuCommon" >
	                <input type="checkbox" class="answer" id="sub_mSales_stock">
	                <label for="sub_mSales_stock">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-08.png">
	                    <span><spring:message code ="purchase.stock"/><!-- 재고 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon" style="">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_stock_detail" class="divBlockTrigger" data-matching="SALES_STOCK" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.stock"/>">
	                        	<spring:message code ="purchase.stock.detail"/><!-- 재고 - 상세 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon" style="">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_stock_summary" class="divBlockTrigger" data-matching="SALES_STOCK" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.stock"/>">
	                        	<spring:message code ="purchase.stock.summary"/><!-- 재고 - 상세 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
			            	<i class="fa-solid fa-list" style="color: white;"></i>
			                <p id="mSales_storageStock_list" class="divBlockTrigger" data-matching="SALES_STOCK" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.stock"/>">
			                	<spring:message code ="purchase.stock.storage"/><!-- 재고 정보 -->
			                </p>
			            </div>
	                    <div class="menuCommon">
			            	<i class="fa-solid fa-list" style="color: white;"></i>
			                <p id="m2_stock_info" class="divBlockTrigger" data-matching="SALES_STOCKINFO" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.stock"/>">
			                	<spring:message code ="purchase.stock.info"/><!-- 재고 정보 -->
			                </p>
			            </div>
						<div class="menuCommon">
			                 <i class="fa-solid fa-list" style="color: white;"></i>
			                 <p id="m2_stock_history" class="divBlockTrigger" data-matching="SALES_STOCKINFO" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.stock"/>">
			                 	<spring:message code ="purchase.stock.history"/><!-- Lot history -->
			                 </p>
			            </div>
						<div class="menuCommon">
			                 <i class="fa-solid fa-list" style="color: white;"></i>
			                 <p id="m2_stock_movement" class="divBlockTrigger" data-matching="SALES_STOCKINFO" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.stock"/>">
			                 	<spring:message code ="purchase.stock.movement"/><!-- 재고 수불부 -->
			                 </p>
			            </div>
						<c:if test="${cookie.userLoginId.value == 'wms' or cookie.userLoginId.value == 'master'}">
						    <div class="menuCommon">
						        <i class="fa-solid fa-list" style="color: white;"></i>
						        <p id="mPurchase_stock_total" class="divBlockTrigger" data-matching="SALES_STOCK" data-group="<spring:message code='menu.group.sales'/> > <spring:message code ="purchase.stock"/>">
						            <spring:message code="purchase.stock.total"/>
						            <!-- 사내 총 재고 -->
						        </p>
						    </div>
						</c:if>
	                </div>
	            </div>

	            <!-- 재고 실사 중분류 -->
	            <div class="sub-accordion menuCommon" >
	                <input type="checkbox" class="answer" id="sub_mSales_stockCount">
	                <label for="sub_mSales_stockCount">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-09.png">
	                    <span><spring:message code ="purchase.inventory"/><!-- 재고 실사 --></span>
	                </label>
	                <div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_stock_count_always_detail" class="divBlockTrigger" data-matching="SALES_STOCKCOUNT" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.inventory"/>">
	                        	<spring:message code ="purchase.inventory.counting"/><!-- 재고 실사 현황 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_stock_count_always_summary" class="divBlockTrigger" data-matching="SALES_STOCKCOUNT" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.inventory"/>">
	                        	<spring:message code ="purchase.inventory.summary"/><!-- 재고 실사 현황 -->
	                        </p>
	                    </div>
	                </div>
	            </div>

	            <!-- 재고 실사 중분류 -->
	            <div class="sub-accordion menuCommon" >
	                <input type="checkbox" class="answer" id="sub_mSales_stockCountLastDay">
	                <label for="sub_mSales_stockCountLastDay">
	                    <img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-09.png">
	                    <span><spring:message code ="purchase.inventory.lastDay"/><!-- 재고 실사 --></span>
	                </label>
	                <div>
						<div class="menuCommon">
							<i class="fa-solid fa-list" style="color : white;"></i>
							<p id="mBasicData_lastDay" class="divBlockTrigger" data-matching="SALES_STOCKCOUNT" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.inventory.lastDay"/>">
								<spring:message code ="basicData.lastDay"/><!-- 마감 -->
							</p>
						</div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_stock_count_lastday_detail" class="divBlockTrigger" data-matching="SALES_STOCKCOUNT" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.inventory.lastDay.detail"/><!-- 재고 실사 현황 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_stock_count_lastday_summary" class="divBlockTrigger" data-matching="SALES_STOCKCOUNT" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.inventory.lastDay.summary"/><!-- 재고 실사 현황 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_stock_count_compare" class="divBlockTrigger" data-matching="SALES_STOCKCOUNT" style="font-size: 11pt;" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.stockcount.compare"/><!-- 재고 실사 검증 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_stock_count_missing" class="divBlockTrigger" data-matching="SALES_STOCKCOUNT" style="font-size: 11pt;" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.stockcount.missing"/><!-- 재고 미스캔 -->
	                        </p>
	                    </div>
	                    <div class="menuCommon">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mSales_erpInterface_summary" class="divBlockTrigger" data-matching="SALES_STOCKCOUNT" style="font-size: 11pt;" data-group="<spring:message code ="menu.group.sales"/> > <spring:message code ="purchase.inventory.lastDay"/>">
	                        	<spring:message code ="purchase.erpInterface.summary"/><!-- 재고실사 인터페이스 -->
	                        </p>
	                    </div>
	                </div>
	            </div>        
			</div>

			<!-- 대시보드 -->
			<input type="checkbox" class="answer"id="answer06">
			<label for="answer06" data-matching="DASHBOARD_STATUS" >
				<img class="menuIconCommon" src="../resources/images/menuicon/WMS Web Icon-19.png">
				<span class="normalLink" data-matching="DASHBOARD_STATUS"><spring:message code ="menu.group.dashboard"/><!-- 대시보드 --></span>
				<i class="fa-solid fa-plus " style="color: white;position: absolute;top: 16px;right: 13px;"></i>
			</label>
			<div class="menuListCallBack_6">
				<!-- 대시보드 중분류 -->
				<div class="sub-accordion menuCommon">
	                    <div class="menuCommon hasAccess" style="display:none">
	                        <i class="fa-solid fa-list" style="color: white;"></i>
	                        <p id="mDashboard_stock" class="divBlockTrigger" data-matching="DASHBOARD_STOCK" data-group="<spring:message code ="menu.group.dashboard"/>">
								<spring:message code ="dashboard.stock"/><!-- 재고 대시보드 -->
							</p>
	                    </div>
						<div class="menuCommon hasAccess" >
							<i class="fa-solid fa-list" style="color: white;"></i>
							<p id="mDashboard_stockDailyStatus" class="divBlockTrigger" data-matching="DASHBOARD_STOCK" data-group="<spring:message code ="menu.group.dashboard"/>">
								재고 대시보드(New)
							</p>
						</div>
						<div class="menuCommon" style="display:none">
							<i class="fa-solid fa-list" style="color: white;"></i>
							<p id="mDashboard_sales" class="divBlockTrigger" data-matching="DASHBOARD_SALES" data-group="<spring:message code ="menu.group.dashboard"/>">
								<spring:message code ="dashboard.sales"/><!-- 원단 소요량 -->
							</p>
						</div> 

						<c:if test="${cookie.userLoginId.value == 'wms' or cookie.userLoginId.value == 'master' or cookie.userLoginId.value == 'challg23.lee'}">
							
							<div class="menuCommon" style="display:none">
								<i class="fa-solid fa-list" style="color: white;"></i>
								<p id="mDashboard_vendorStockStatus"
								class="divBlockTrigger"
								data-matching="DASHBOARD_VENDOR_STOCK_STATUS"
								data-group="<spring:message code='menu.group.dashboard'/>">
								<spring:message code="dashboard.vendorStockStatus"/><!-- Vendor Inbound / Requirement / Stock Status -->
							</p>
						</div>
						
						<div class="menuCommon" style="display:none">
							<i class="fa-solid fa-list" style="color: white;"></i>
							<p id="mDashboard_vehicleItemShipmentStatus"
							class="divBlockTrigger"
							data-matching="DASHBOARD_VEHICLE_ITEM_SHIPMENT_STATUS"
							data-group="<spring:message code='menu.group.dashboard'/>">
							<spring:message code="dashboard.vehicleItemShipmentStatus"/><!-- Shipment Status by Vehicle Model / Item -->
						</p>
					</div>
				</c:if>
				<c:if test="${cookie.userLoginId.value == 'wms' or cookie.userLoginId.value == 'master'}">
					<div class="menuCommon" style="">
						<i class="fa-solid fa-list" style="color: white;"></i>
						<p id="mDashboard_interfaceStatus"
						class="divBlockTrigger"
						data-matching="DASHBOARD_INTERFACE_STATUS"
						data-group="<spring:message code='menu.group.dashboard'/>">
						<spring:message code="dashboard.interfaceStatus"/><!-- Interface Status -->
						</p>
					</div>
				</c:if>
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
