<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<!-- 배포 시 핋수 제거 또는 주석 처리 -->
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
final long v = System.currentTimeMillis();
%>
<!-- 배포 시 핋수 제거 또는 주석 처리 -->

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>WOOBOTECH WMS</title>
<script src="/resources/js/common/cookie-namespace.js"></script>
<link href='/resources/css/core-main.css' rel='stylesheet' />
<link href='/resources/css/daygrid-main.css' rel='stylesheet' />
<link href='/resources/css/w_inbound.css' rel='stylesheet' />
<link rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
<script src='/resources/js/core-main.js'></script>
<script src='/resources/js/interaction-main.js'></script>
<script src='/resources/js/daygrid-main.js'></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="<c:url value='/resources/js/w_menuList.js'/>?v=<%=v%>"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

<!-- 다국어 jsp -->
<jsp:include page="/WEB-INF/views/include/i18n-str.jsp" />
<jsp:include page="/WEB-INF/views/include/i18n-text.jsp" />
<jsp:include page="/WEB-INF/views/include/i18n-dashboard.jsp" />
<jsp:include page="/WEB-INF/views/include/i18n-btn.jsp" />

<script src="/resources/js/global-table-wrapper.js"></script>

<!-- 공용 JS -->
<script src="/resources/js/common/loadCSS.js"></script>
<!-- 번들 : 메뉴리스트 Import -->
<script src='/resources/dist/bundle.js'></script>
<link rel="stylesheet"
	href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">

<!-- 개발용 -->
<link rel="stylesheet"
	href="<c:url value='/resources/css/menulist/common.css'/>?v=<%=v%>">
<link rel="stylesheet"
	href="<c:url value='/resources/css/menulist/m1.css'/>?v=<%=v%>">
<link rel="stylesheet"
	href="<c:url value='/resources/css/menulist/m2.css'/>?v=<%=v%>">
<link rel="stylesheet"
	href="<c:url value='/resources/css/menulist/m3.css'/>?v=<%=v%>">
<link rel="stylesheet"
	href="<c:url value='/resources/css/menulist/m4.css'/>?v=<%=v%>">
<link rel="stylesheet"
	href="<c:url value='/resources/css/menulist/m5.css'/>?v=<%=v%>">
<link rel="stylesheet"
	href="<c:url value='/resources/css/menulist/m6.css'/>?v=<%=v%>">
	
<link rel="stylesheet"
	href="<c:url value='/resources/css/menulist/mDashboard.css'/>?v=<%=v%>">

<link rel="stylesheet"
	href="<c:url value='/resources/css/menulist/mModal-judgment.css'/>?v=<%=v%>">

<!-- 전역 정렬 기능 -->
<script src="/resources/js/common/tableSortUtil.js"></script>

<c:if test="${cookie.lang.value == 'es-MX' || cookie.lang.value == 'es_MX'}">
	<link rel="stylesheet" href="/resources/css/lang_es.css">
</c:if>

<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
<!-- 해결 -->
<script src="https://kit.fontawesome.com/505799415e.js"
	crossorigin="anonymous"></script>
<!-- 아이콘 kits -->
<script type="text/javascript">

</script>
<style>
body {
	margin: 40px 10px;
	padding: 0;
	font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
	font-size: 14px;
	display: flex;
	flex-wrap: wrap;
}
.fc-content {
	cursor: pointer
}

.insert-modal {
	position: relative;
	left: 510px;
	top: 850px;
}

.date-wrap label {
	width: 60px;
}

.date-wrap, .jobName-wrap, .start-wrap, .btn-wrap {
	float: left;
}

.date-wrap, .jobName-wrap, .start-wrap {
	margin-top: 0px;
}

#addBtn, #updateBtn, #clearBtn, #deleteBtn {
	float: left;
	height: 45px;
}

#holidayBtn {
	float: left;
	border: 2px solid red;
	letter-spacing: 0;
	width: 103px;
	margin-right: 13px;
	color: red;
}

.btn-wrap, .holiday-wrap {
	overflow: hidden;
}

.holiday {
	font-size: 30px;
	float: left;
	padding: 2px;
	color: red;
}

.holiday:hover {
	cursor: pointer;
}

#holidayDate {
	float: left;
	width: 120px;
}

.holidayBtn-wrap {
	display: none;
}

input[type="checkbox"]:checked {
	accent-color: #000000;
}

body>div.header-wrap {
	margin-bottom: 0;
	width: 100%;
}

input[type="time"]::-webkit-calendar-picker-indicator {
	
}

/* 스크롤바 */

*::-webkit-scrollbar {
    width: 13px; /* 세로 스크롤바 너비 */
    height: 16px; /* 가로 스크롤바 높이 */
}

*::-webkit-scrollbar-track {
    background: #f1f1f1;
}

*::-webkit-scrollbar-thumb {
    background: #888;
    border: 3px solid #f1f1f1;
}

*::-webkit-scrollbar-thumb:hover {
    background: #555;
}


/* 리스트 스크롤 */
/* 스크롤바 디자인 */
.data-table tbody::-webkit-scrollbar {
    width: 20px;
}

.data-table tbody::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.data-table tbody::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.data-table tbody::-webkit-scrollbar-thumb:hover {
    background: #555;
}

</style>
</head>
<body style="position: relative;">
	<%@ include file="/WEB-INF/views/include/header.jsp"%>
	<div class="serviceView">
		<%@ include file="/WEB-INF/views/include/menuList.jsp"%>
		<input type="hidden" class="saveClickMenuId">

		<div class="contentArea">
			<div class="w_tapArea">
			</div>
			<div class="w_titleArea"></div>
			<div class="w_contentArea">
				<div class="w_defaultArea">
					<img alt="" src="../resources/images/woobo_wms_main_img.png">
				</div>
			</div>
		</div>

		<div class="loading-overlay hidden" id="loadingOverlay">
			<div class="loading-container">
				<div class="loading-logo">
					<img alt="" src="../resources/images/wooboTechLogo_ol.png">
					<h1>WOOBOTECH WMS</h1>
				</div>

				<div class="main-spinner">
					<div class="spinner-ring"></div>
					<div class="spinner-ring"></div>
					<div class="spinner-ring"></div>
				</div>

				<div class="loading-text" id="loadingText">시스템을 불러오는 중입니다...</div>

				<div class="loading-subtitle" id="loadingSubtitle">잠시만 기다려주세요
				</div>

				<div class="progress-container">
					<div class="progress-bar"></div>
				</div>

				<div class="loading-dots">
					<div class="dot"></div>
					<div class="dot"></div>
					<div class="dot"></div>
				</div>
			</div>

		</div>

		</div>

		<div id="positionModal" class="modal">
			<div class="modal-content">
				<div class="modal-header">
					<div class="modal-title"><spring:message code ="search.location"/></div>
					<div class="modal-title" id="modalLocation"></div>
					<span class="close">&times;</span>
				</div>
				<div class="modal-body">
					<div class="modal-data">
						<div class="modal-info">
							<div class="info-label">Item Code</div>
							<div class="info-value" id="modalItemCode"></div>
						</div>
						<div class="modal-info">
							<div class="info-label">Item Name</div>
							<div class="info-value" id="modalItemName"></div>
						</div>
						<div class="modal-info">
							<div class="info-label">Qty</div>
							<div class="info-value" id="modalCarType"></div>
						</div>
						<div class="modal-info">
							<div class="info-label">Inbound Date</div>
							<div class="info-value" id="modalInboundDate"></div>
						</div>
						<div class="modal-info">
							<div class="info-label">Storage Date</div>
							<div class="info-value" id="modalStorageDate"></div>
						</div>
						<div class="modal-info">
							<div class="info-label">LOT</div>
							<div class="info-value" id="modalLot"></div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 모달 -->
		<div id="userInfoMenuAccessModal" class="userInfoModal-overlay">
			<div class="userInfoModal-container">
				<!-- 모달 헤더 -->
				<div class="userInfoModal-header">
					<h3 class="userInfoModal-title"><spring:message code ="title.menuPermission"/></h3>
					<button class="userInfoModal-close" type="button">&times;</button>
				</div>
				
				<!-- 사용자 정보 섹션 -->
				<div class="userInfoModal-user-info-section usersInfo">
					<div class="userInfoModal-user-info-grid">
						<div class="userInfoModal-user-info-item">
							<span class="userInfoModal-user-info-label">선택한 사용자 : </span> 
							<span class="userInfoModal-user-info-value" id="userCount"></span>
						</div>
					</div>
				</div>
				
				<div class="userInfoModal-role-section">
				  	<div id="roleList" class="role-list">
				  		<span class="role-title">Roles</span>
				  	</div>
				</div>
				
				<!-- 사용자 정보 섹션 -->
				<div class="userInfoModal-user-info-section userInfo">
					<div class="userInfoModal-user-info-grid">
						<div class="userInfoModal-user-info-item">
							<span class="userInfoModal-user-info-label"><spring:message code ="table.access"/></span> <span
								class="userInfoModal-user-info-value" id="userInfoModal_access"></span>
						</div>
						<div class="userInfoModal-user-info-item">
							<span class="userInfoModal-user-info-label"><spring:message code ="search.bu_name"/>:</span> <span
								class="userInfoModal-user-info-value" id="userInfoModal_buName"></span>
						</div>
						<div class="userInfoModal-user-info-item">
							<span class="userInfoModal-user-info-label"><spring:message code ="search.ks_name"/>:</span> <span
								class="userInfoModal-user-info-value" id="userInfoModal_ksName"></span>
						</div>
						<div class="userInfoModal-user-info-item">
							<span class="userInfoModal-user-info-label"><spring:message code ="search.ks_id"/>:</span> <span
								class="userInfoModal-user-info-value" id="userInfoModal_ksId"></span>
						</div>
						<div class="userInfoModal-user-info-item">
							<span class="userInfoModal-user-info-label"><spring:message code ="search.ks_indate"/>:</span> <span
								class="userInfoModal-user-info-value" id="userInfoModal_ksIndate"></span>
						</div>
					</div>
				</div>

				<!-- 모달 바디 -->
				<div class="userInfoModal-body">
					<div class="userInfoModal_menuDivAreaCommon control_basicData_parent">
						<div class="userInfoModal_commonTitle userInfoModal_menu1">
							<input type="checkbox" class="userInfoBigMenuCommon" data-control="control_basicData" data-unique="BASICDATA">
							<div><spring:message code ="menu.group.basicData"/></div>
						</div>
					</div>
					<div class="userInfoModal_menuDivAreaCommon control_purchase_parent">
						<div class="userInfoModal_commonTitle userInfoModal_menu2">
							<input type="checkbox" class="userInfoBigMenuCommon" data-control="control_purchase" data-unique="PURCHASE">
							<div><spring:message code ="menu.group.purchase"/></div>
						</div>
					</div>
					<div class="userInfoModal_menuDivAreaCommon control_sales_parent">
						<div class="userInfoModal_commonTitle userInfoModal_menuSales">
							<input type="checkbox" class="userInfoBigMenuCommon" data-control="control_sales" data-unique="SALES">
							<div><spring:message code ="menu.group.sales"/></div>
						</div>
					</div>
				</div>
				
				<div class="userInfoModal_btnArea">
					<input type="button" class="btn btn-primary userInfoModal_btnSuccess" value="<spring:message code ="btn.save"/>">
					<input type="button" class="btn btn-secondary userInfoModal_btnCancel" value="<spring:message code ="btn.cancel"/>">
					<input type="button" class="btn btn-warning userInfoModal_btnInit" value="<spring:message code ="btn.clear"/>">
				</div>
			</div>
		</div>
		
		<!-- modal_userInsertForm 모달 -->
		<div id="modal_userInsertForm">
		    <div class="modal_userInsertForm_content">
		        <!-- 헤더 -->
		        <div class="modal_userInsertForm_header">
		            <h2 style="font-size:21pt;"><spring:message code ="title.registration"/></h2>
		            <span class="modal_userInsertForm_close modal_userInsertForm_close()">&times;</span>
		        </div>
		        
		        <!-- 본문 -->
		        <div class="modal_userInsertForm_body">
		            <form id="form_userInsertForm" name="form_userInsertForm" method="post">
		                <div class="modal_userInsertForm_grid">
		                    <!-- KS_ID -->
		                    <div class="modal_userInsertForm_group">
		                        <label class="modal_userInsertForm_label"><spring:message code ="login.id"/><span class="modal_userInsertForm_required">*</span></label>
		                        <input type="text" name="KS_ID" id="userInsert_id" class="modal_userInsertForm_input" placeholder="<spring:message code ="modal.enter.id"/>" required>
		                    </div>
		                    
		                    <!-- KS_PASSWD -->
		                    <div class="modal_userInsertForm_group">
		                        <label class="modal_userInsertForm_label"><spring:message code ="login.pw"/><span class="modal_userInsertForm_required">*</span></label>
		                        <input type="password" name="KS_PASSWD" id="userInsert_pass" class="modal_userInsertForm_input" placeholder="<spring:message code ="modal.enter.password"/>" required>
		                    </div>

		                    <!-- KS_FACTORY -->
		                    <div class="modal_userInsertForm_group">
		                        <label class="modal_userInsertForm_label"><spring:message code ="modal.factory"/></label>
		                        <select class="modal_userInsertForm_label" id="userInsert_factory" >
		                        	<option value="ULSAN">ULSAN</option>
		                        </select>
		                    </div>

		                    <!-- KS_BUSOR -->
		                    <div class="modal_userInsertForm_group">
		                        <label class="modal_userInsertForm_label"><spring:message code ="modal.department"/><span class="modal_userInsertForm_required">*</span></label>
		                        <select class="modal_userInsertForm_label" id="userInsert_busor" >
		                        	<option value="default"><spring:message code ="modal.department.select"/></option>
		                        	<option value="000000">WooboTech</option>
		                        	<option value="102000">Logistic Depat.</option>
		                        	<option value="103000">Purchase Depat.</option>
		                        	<option value="104000">Operating Depat.</option>
		                        	<option value="105000">Sales Depat.</option>
		                        	<option value="others">Others</option>
		                        </select>
		                        <input type="text" style="display:none;" class="others_depatInput" placeholder="<spring:message code ="modal.enter.department"/>">
		                        <!-- <input type="text" name="KS_BUSOR" class="modal_userInsertForm_input" placeholder="부서코드를 입력하세요" required> -->
		                    </div>
		                    
		                    <!-- KS_NAME -->
		                    <div class="modal_userInsertForm_group">
		                        <label class="modal_userInsertForm_label"><spring:message code ="modal.name"/><span class="modal_userInsertForm_required">*</span></label>
		                        <input type="text" name="KS_NAME" id="userInsert_name" class="modal_userInsertForm_input" placeholder="<spring:message code ="modal.enter.name"/>" required>
		                    </div>
		                    
		                    <!-- KS_SDATE -->
		                    <div class="modal_userInsertForm_group">
		                        <label class="modal_userInsertForm_label"><spring:message code ="modal.indate"/><span class="modal_userInsertForm_required">*</span></label>
		                        <input type="date" name="KS_INDATE" id="userInsert_sdate" class="modal_userInsertForm_input" required>
		                    </div>
		                    
		                    <!-- KS_INUSER -->
		                    <!-- <div class="modal_userInsertForm_group">
		                        <label class="modal_userInsertForm_label">등록자</label>
		                        <input type="text" name="KS_INUSER" class="modal_userInsertForm_input" placeholder="등록자를 입력하세요">
		                    </div> -->
		                    
		                    <!-- KS_SABUN -->
		                    <%-- <div class="modal_userInsertForm_group">
		                        <label class="modal_userInsertForm_label"><spring:message code ="modal.employeeId"/></label>
		                        <input type="text" name="KS_SABUN" id="userInsert_sabun" class="modal_userInsertForm_input" placeholder="<spring:message code ="modal.enter.employeeId"/>">
		                    </div> --%>
		                    
		                    <!-- KS_REMARK -->
		                    <!-- <div class="modal_userInsertForm_group full-width">
		                        <label class="modal_userInsertForm_label">비고</label>
		                        <textarea name="KS_REMARK" class="modal_userInsertForm_textarea" placeholder="비고사항을 입력하세요"></textarea>
		                    </div> -->
		                </div>
		            </form>
		        </div>
		        
		        <!-- 푸터 -->
		        <div class="modal_userInsertForm_footer">
		            <button type="button" class="modal_userInsertForm_btn modal_userInsertForm_btn_primary" id="userInsertConfirm"><spring:message code ="btn.save"/></button>
		            <button type="button" class="modal_userInsertForm_btn modal_userInsertForm_btn_secondary modal_userInsertForm_close"><spring:message code ="btn.cancel"/></button>
		        </div>
		    </div>
		</div>
		
		
		<div class="modal_userUpdateForm">
	        <div class="modal_userUpdateForm_content">
	            <div class="modal_userUpdateForm_sidebar">
	                <div class="modal_userUpdateForm_sidebar_header">
	                    <h2><spring:message code ="modal.title.user"/></h2>
	                    <p class="userInfo-name"></p>
	                </div>
	                
	                <button class="modal_userUpdateForm_nav_item active" data-panel="0">
					    <span class="modal_userUpdateForm_nav_icon">👤</span>
					    <span><spring:message code ="modal.title.basic"/></span>
					</button>
					<button class="modal_userUpdateForm_nav_item" data-panel="1">
					    <span class="modal_userUpdateForm_nav_icon">💼</span>
					    <span><spring:message code ="modal.title.department"/></span>
					</button>
					<button class="modal_userUpdateForm_nav_item" data-panel="2">
					    <span class="modal_userUpdateForm_nav_icon">⚙️</span>
					    <span><spring:message code ="modal.title.account"/></span>
					</button>
					<button class="modal_userUpdateForm_nav_item" data-panel="3">
					    <span class="modal_userUpdateForm_nav_icon">🔐</span>
					    <span><spring:message code ="modal.title.security"/></span>
					</button>
	            </div>
	
	            <div class="modal_userUpdateForm_main">
	                <div class="modal_userUpdateForm_header">
	                    <h3 class="modal_userUpdateForm_title" id="userUpdate_currentTitle"><spring:message code ="modal.title.basic"/></h3>
	                    <button class="modal_userUpdateForm_close">×</button>
	                </div>
	
	                <div class="modal_userUpdateForm_body">
	                    <!-- Section 1: 기본 정보 -->
	                    <div class="modal_userUpdateForm_section active">
	                        <div class="modal_userUpdateForm_section_header">
	                            <div class="modal_userUpdateForm_section_icon">👤</div>
	                            <h4 class="modal_userUpdateForm_section_title"><spring:message code ="modal.title.basic.user"/></h4>
	                        </div>
	
	                        <div class="modal_userUpdateForm_info_card">
	                            <div class="modal_userUpdateForm_info_row">
	                                <span class="modal_userUpdateForm_info_label"><spring:message code ="modal.name"/></span>
	                                <span class="modal_userUpdateForm_info_value userInfo-name"></span>
	                            </div>
	                            <div class="modal_userUpdateForm_info_row">
	                                <span class="modal_userUpdateForm_info_label"><spring:message code ="login.id"/></span>
	                                <span class="modal_userUpdateForm_info_value userInfo-id"></span>
	                            </div>
	                            <div class="modal_userUpdateForm_info_row">
	                                <span class="modal_userUpdateForm_info_label"><spring:message code ="modal.department"/></span>
	                                <span class="modal_userUpdateForm_info_value userInfo-dept"></span>
	                            </div>
	                            <div class="modal_userUpdateForm_info_row">
	                                <span class="modal_userUpdateForm_info_label"><spring:message code ="modal.indate"/></span>
	                                <span class="modal_userUpdateForm_info_value userInfo-indate"></span>
	                            </div>
	                            <div class="modal_userUpdateForm_info_row">
	                                <span class="modal_userUpdateForm_info_label"><spring:message code ="modal.status"/></span>
	                                <span class="modal_userUpdateForm_status_badge modal_userUpdateForm_status_active"></span>
	                            </div>
	                        </div>
	                    </div>

	                    <%--
	                    <!-- Section 2: 공장 접근 권한 -->
	                    <div class="modal_userUpdateForm_section">
	                        <div class="modal_userUpdateForm_section_header">
	                            <div class="modal_userUpdateForm_section_icon">🏭</div>
	                            <h4 class="modal_userUpdateForm_section_title"><spring:message code ="modal.title.factory"/></h4>
	                        </div>

	                        <div class="modal_userUpdateForm_group" style="margin-bottom: 24px;">
	                            <label class="modal_userUpdateForm_label modal_userUpdateForm_required"><spring:message code ="table.primaryFactory"/></label>
	                            <select class="modal_userUpdateForm_select" id="user_factory">
								  <option value="SALTILLO">Saltillo</option>
								  <option value="PUEBLA">Puebla</option>
								</select>
	                        </div>

	                        <p class="modal_userUpdateForm_str">
	                            <spring:message code ="table.factory.access"/>
	                        </p>

	                        <div class="modal_userUpdateForm_checkbox_grid">
							  	<label class="modal_userUpdateForm_checkbox_card">
							    	<input type="checkbox" name="factoryAccess" value="ALL">
							    	<div class="modal_userUpdateForm_checkbox_label"><span>All</span></div>
							  	</label>

							  	<label class="modal_userUpdateForm_checkbox_card">
							    	<input type="checkbox" name="factoryAccess" value="SALTILLO">
							    	<div class="modal_userUpdateForm_checkbox_label"><span>Saltillo</span></div>
							  	</label>

							  	<label class="modal_userUpdateForm_checkbox_card">
							    	<input type="checkbox" name="factoryAccess" value="PUEBLA">
							    	<div class="modal_userUpdateForm_checkbox_label"><span>Puebla</span></div>
							  	</label>
							</div>
	                    </div> --%>

	                    <!-- Section 3: 근무 정보 -->
	                    <div class="modal_userUpdateForm_section">
	                        <div class="modal_userUpdateForm_section_header">
	                            <div class="modal_userUpdateForm_section_icon">💼</div>
	                            <h4 class="modal_userUpdateForm_section_title"><spring:message code ="modal.title.department"/></h4>
	                        </div>
	                        
	                        <!-- 현재 부서 -->
	                        <div class="body_userDepartment_group">
			                    <label class="body_userDepartment_label"><spring:message code ="modal.department.current"/></label>
			                    <input type="text" class="modal_userUpdateForm_text" id="user_department" readonly>
			                </div>
	
							
	                        <div class="modal_userUpdateForm_grid">
	                            <div class="modal_userUpdateForm_group">
	                                <label class="modal_userUpdateForm_label"><spring:message code ="modal.department.new"/></label>
	                                <select class="modal_userUpdateForm_select" id="newUserDepartment">
	                                	<option value=""></option>
				                    	<option value="000000">WooboTech</option>
				                    	<option value="100000">Product Depat.</option>
				                    	<option value="101000">Quality Depat.</option>
				                    	<option value="102000">Logistic Depat.</option>
				                    	<option value="103000">Purchase Depat.</option>
				                    	<option value="104000">Operating Depat.</option>
				                    	<option value="105000">Sales Depat.</option>
				                    	<option value="others">Others</option>
	                                </select>
	                                <input type="text" id="modal_userUpdateForm_department" class="others_departInput" placeholder="<spring:message code ="modal.enter.department"/>" style="display:none;">
	                            </div>
	                        </div>
	                    </div>
	
	                    <!-- Section 4: 계정 설정 -->
	                    <div class="modal_userUpdateForm_section">
	                        <div class="modal_userUpdateForm_section_header">
	                            <div class="modal_userUpdateForm_section_icon">⚙️</div>
	                            <h4 class="modal_userUpdateForm_section_title"><spring:message code ="modal.title.account"/></h4>
	                        </div>
	
	                        <div class="modal_userUpdateForm_toggle_group">
	                            <div class="modal_userUpdateForm_toggle_item">
	                                <div class="modal_userUpdateForm_toggle_info">
	                                    <h4><spring:message code ="modal.permission"/></h4>
	                                </div>
	                                <label class="modal_userUpdateForm_toggle">
	                                    <input type="checkbox" value="dml_access">
	                                    <span class="modal_userUpdateForm_toggle_slider"></span>
	                                </label>
	                            </div>
	                            <div class="modal_userUpdateForm_toggle_item">
	                                <div class="modal_userUpdateForm_toggle_info">
	                                    <h4><spring:message code ="modal.account.activation"/></h4>
	                                </div>
	                                <label class="modal_userUpdateForm_toggle">
	                                    <input type="checkbox" value="login_access">
	                                    <span class="modal_userUpdateForm_toggle_slider"></span>
	                                </label>
	                            </div>
	                        </div>
	                    </div>
	
	                    <!-- Section 5: 보안 설정 -->
	                    <div class="modal_userUpdateForm_section">
	                        <div class="modal_userUpdateForm_section_header">
	                            <div class="modal_userUpdateForm_section_icon">🔐</div>
	                            <h4 class="modal_userUpdateForm_section_title"><spring:message code ="modal.title.security.password"/></h4>
	                        </div>
	
	                        <div class="modal_userUpdateForm_group">
	                            <label class="modal_userUpdateForm_label"><spring:message code ="modal.password.change"/></label>
	                            <input type="password" class="modal_userUpdateForm_input" id="pw_new" placeholder="<spring:message code ="modal.enter.password.change"/>">
	                        </div>
	
	                        <div class="modal_userUpdateForm_group">
	                            <label class="modal_userUpdateForm_label"><spring:message code ="modal.password.comfirm"/></label>
	                            <input type="password" class="modal_userUpdateForm_input" id="pw_confirm" placeholder="<spring:message code ="modal.enter.password.check"/>">
	                        </div>
	                        
	                        <div class="modal_userUpdateForm_section_footer">
						    <button type="button" class="modal_userUpdateForm_btn modal_userUpdateForm_btn_primary" id="btnChangePassword">
						      <spring:message code ="modal.title.security.password"/>
						    </button>
						  </div>
	                    </div>
	                </div>
	
	                <div class="modal_userUpdateForm_footer">
	                    <button class="modal_userUpdateForm_btn modal_userUpdateForm_btn_secondary"><spring:message code ="btn.cancel"/></button>
	                    <button class="modal_userUpdateForm_btn modal_userUpdateForm_btn_primary" id="btnChangeInfo"><spring:message code ="btn.saveChange"/></button>
	                </div>
	            </div>
	        </div>
	    </div>

		<div class="modal_stockInfoDetail_bg"></div>
		<div class="modal_stockInfoDetail" id="modalContainer_stockInfoDetail">
	        <div class="header_stockInfoDetail">
	            <h2 class="title_stockInfoDetail">Barcode Info</h2>
	            <button class="closeBtn_stockInfoDetail" id="closeBtn_stockInfoDetail">&times;</button>
	        </div>
	        
	        <div class="content_stockInfoDetail">
	            <div class="infoRow_stockInfoDetail">
	                <span class="date_stockInfoDetail"></span>
	                <span class="count_stockInfoDetail"></span>
	            </div>
	
	            <div class="parentBarcode_stockInfoDetail">
	                <div class="parentBarcodeLabel_stockInfoDetail">PALLET</div>
	                <div class="parentBarcodeValue_stockInfoDetail"></div>
	            </div>
	
	            <div class="barcodeList_stockInfoDetail">
	        	</div>
	    	</div>
	 </div>
	    <div class="modal_stockInfoDetail_2" id="modalContainer_stockInfoDetail_2">
	    	<div class="header_stockInfoDetail">
	            <h2 class="title_stockInfoDetail"><spring:message code ="title.info.itemcodeLocation"/></h2>
	            <button class="closeBtn_stockInfoDetail" id="closeBtn_stockInfoDetail">&times;</button>
	        </div>
	    	<div class="content_stockInfoDetail_2">
	            <div class="infoRow_stockInfoDetail_2">
	                <span class="date_stockInfoDetail_2"></span>
	                <span class="count_stockInfoDetail_2"></span>
	            </div>
	
	            <div class="barcodeList_stockInfoDetail_2">
	        	</div>
	    	</div>
	  	</div>
	<div class="modal_stockHistory_selectBarcode" id="modalContainer_modal_stockHistory_selectBarcode">
        <div class="header_modal_stockHistory_selectBarcode">
            <h2 class="title_modal_stockHistory_selectBarcode">Select Barcode</h2>
            <button class="closeBtn_modal_stockHistory_selectBarcode" id="closeBtn_modal_stockHistory_selectBarcode">&times;</button>
        </div>
        
        <div class="content_modal_stockHistory_selectBarcode">
            <ul class="list_modal_stockHistory_selectBarcode">
            </ul>
        </div>
    </div>
    
    <!-- 재고 비교 모달 -->
    <!-- 모달 HTML -->
	<div id="modal_stockCountCompare" class="modal_stockCountCompare_overlay" style="display: none;">
	    <div class="modal_stockCountCompare_container">
	        <div class="modal_stockCountCompare_header">
	            <h2>Stock Compare Detail</h2>
	            <button class="modal_stockCountCompare_close">&times;</button>
	        </div>
	        
	        <div class="modal_stockCountCompare_body">
	            <table class="table_stockCountCompare_detail">
	                <thead>
	                    <tr>
	                        <th colspan="3" class="header_stockCountCompare_system">System Inventory</th>
	                        <th colspan="3" class="header_stockCountCompare_real">Real Inventory</th>
	                    </tr>
	                    <tr>
	                        <!-- <th class="th_stockCountCompare_sdate">SDATE</th>
	                        <th class="th_stockCountCompare_location">LOCATION</th> -->
	                        <th class="th_stockCountCompare_barcode">BARCODE</th>
	                        <th class="th_stockCountCompare_itemcode">ITEMCODE</th>
	                        <th class="th_stockCountCompare_qty">SYSTEM QTY</th>

	                        <!-- <th class="th_stockCountCompare_sdate">SDATE</th>
	                        <th class="th_stockCountCompare_location">LOCATION</th> -->
	                        <th class="th_stockCountCompare_barcode">BARCODE</th>
	                        <th class="th_stockCountCompare_itemcode">ITEMCODE</th>
	                        <th class="th_stockCountCompare_qty">REAL QTY</th>
	                    </tr>
	                </thead>
	                <tbody class="tbody_stockCountCompare_detail">
	                    <!-- 데이터가 여기 들어갑니다 -->
	                </tbody>
	            </table>
	        </div>
	    </div>
	</div>	
	
	<!-- Unpack -->
    <div class="modal-unpack" id="modalOverlay" style="display: none;">
        <div class="modal-container">
            <div class="modal-header">
                <div class="modal-title-wrapper">
                    <span class="modal-title"><spring:message code ="title.unpackBarcode"/></span>
                    <span class="item-count" id="itemCount"></span>
                </div>
                <button class="close-btn closeUnpackModal">&times;</button>
            </div>
            <div class="modal-body">
            	<div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th><spring:message code ="table.no"/></th>
                                <th><spring:message code ="search.barcode"/></th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <!-- Data will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 분해 모달 -->
    <div class="modal-overlay_decomposition" id="decompositionModal">
    	<div class="modal_decomposition">
    		<div class="modal-header_decomposition">
    			<div class="modal-title_decomposition"><spring:message code ="modal.title.decomposition"/></div>
    			<div class="item-Info">
    				<div class="item-info-decomposition">
    					<span class="item-info-label"><spring:message code ="search.itemCode"/> :</span>
    					<span id="decompositionItemcode"></span>
    					<input type = "hidden" id="decompositionBarcode">
    				</div>
    				<div class="item-info-decomposition">
    					<span class="item-info-label"><spring:message code ="search.itemName"/> :</span>
    					<span id="decompositionItemname"></span>
    				</div>    				
    				<div class="item-info-decomposition">
    					<span class="item-info-label"><spring:message code ="search.qty"/> :</span>
    					<span id="decompositionQty"></span>
    				</div>    				
    			</div>
    		</div>
    		
    		<div class="modal-body_decomposition">
    			<table class="bom-table">
    				<thead>
	    				<tr>
	    					<th class="col-itemcode"><spring:message code ="modal.bom.itemcode"/></th>
	    					<th class="col-itemname"><spring:message code ="modal.bom.itemname"/></th>
	    					<th class="col-qty"><spring:message code ="search.qty"/></th>    					
	    				</tr>
    				</thead>
    				<tbody id="bomTableBody">
    				</tbody>
    			</table>
    		</div>
    		
    		<div class="modal-footer_decomposition">
    			<button class="btn btn-secondary btnCloseDecompositionModal"><spring:message code ="btn.cancel"/></button>
    			<button class="btn btn-primary btnConfirmBom"><spring:message code ="btn.save"/></button>
    		</div>
    	</div>
    </div>

	<!-- 판정 모달창 -->
	<div class="modal-overlay_judgment" id="judgmentModal" style="display: none;">
	    <div class="modal-content_judgment">
	        <div class="modal-header_judgment">
	            <span class="screen-number_judgment" id="modalScreenNumber">1/7</span>
	            <h2 class="modal-title_judgment">INSPECTION JUDGMENT</h2>
	            <button class="modal-close_judgment" onclick="closeJudgmentModal()">&times;</button>
	        </div>
	        
	        <div class="modal-body_judgment">
	            <!-- 품번 정보 표시 영역 -->
	            <div class="info-section_judgment">
	                <div class="info-display_judgment">
	                    <div class="info-row_judgment">
	                        <span class="info-label_judgment">ITEMCODE:</span>
	                        <span class="info-value_judgment" id="modal_itemcode"></span>
	                    </div>
	                    <div class="info-row_judgment">
	                        <span class="info-label_judgment">ITEMNAME:</span>
	                        <span class="info-value_judgment" id="modal_itemname"></span>
	                    </div>
	                    <div class="info-row_judgment">
	                        <span class="info-label_judgment">QTY:</span>
	                        <span class="info-value_judgment" id="modal_scanQty"></span>
	                    </div>
	                </div>
	            </div>
	            
	            <!-- 동적 컨텐츠 영역 -->
	            <div class="action-section_judgment" id="modalActionSection">
	                <!-- 여기에 각 화면별 컨텐츠가 동적으로 렌더링됩니다 -->
	            </div>
	        </div>
	    </div>
	</div>
    
    
    <div class="modal-overlay_factoryAccess" id="factoryAccessModal" >
        <div class="modal-container_factoryAccess">
            <!-- Header -->
            <div class="modal-header_factoryAccess">
                <h2><spring:message code ="title.setFactoryAccess"/></h2>
                <button class="modal-close_factoryAccess" id="closeModal">&times;</button>
            </div>

            <!-- Body -->
            <div class="modal-body_factoryAccess">
                <div class="radio-group_factoryAccess">
                    <div class="radio-item_factoryAccess">
                        <input type="radio" id="factoryAll" name="factory" value="all" checked>
                        <label for="factoryAll"><spring:message code ="search.all"/></label>
                    </div>
                    <div class="radio-item_factoryAccess">
                        <input type="radio" id="factorySaltillo" name="factory" value="SALTILLO">
                        <label for="factorySaltillo">Saltillo</label>
                    </div>
                    <div class="radio-item_factoryAccess">
                        <input type="radio" id="factoryPuebla" name="factory" value="PUEBLA">
                        <label for="factoryPuebla">Puebla</label>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer_factoryAccess">
                <button class="btn-save_factoryAccess" id="saveFactory"><spring:message code ="btn.save"/></button>
            </div>
        </div>
    </div>
    
    <div id="qrAndHistoryModal"  class="modal-overlay2">
    	<!-- QR 모달 -->
		<div id="qrModal">
			<div style="background:#fff; margin:10% auto; padding:20px; width:250px; border-radius:8px; text-align:center;">
				<h5 id="qrModalLabel">QR</h5>
				<div id="qrcode"></div>
			</div>
		</div>
		
		<!-- history 모달 -->
		<div id="historyModal">
	        <div class="modal-container">
	            <div class="modal-header">
	                <div class="modal-title"><spring:message code ="title.info.barcode"/></div>
	                <button class="modal-close">&times;</button>
	                <div class="modal-title-barcode">
	                	<span class = 'label'><spring:message code ="search.barcode"/></span>
	                	<span class = 'value'></span>
	                </div>
	                <div class="modal-title-itemcode">
	                	<span class = 'label'><spring:message code ="search.suppliercode"/></span>
	                	<span class = 'value'></span>
	                </div>
	                <div class="modal-title-itemname">
	                	<span class = 'label'><spring:message code ="search.itemName"/></span>
	                	<span class = 'value'></span>
	                </div>
	                <div class="modal-title-location">
	                	<span class = 'label'><spring:message code ="search.location"/></span>
	                	<span class = 'value'></span>
	                </div>
	            </div>
	            <div class="modal-body">
	                <div class="history-div" id="modalHistoryDiv">
	                	<!-- 동적으로 추가 -->
	                </div>
	            </div>
	        </div>
	    </div>
    </div>

    <div id="warehouseEditModal" style="display:none;"></div>
</body>
	<script type="text/javascript">
        console.log("Button Click Prevention -- ON");

        // 모든 버튼 클릭에 적용
        $(document).on('click', 'button', function(e) {
            const $btn = $(this);

            // 이미 비활성화되어 있으면 클릭 무시
            if ($btn.prop('disabled')) {
                console.log("Already disabled - click ignored");
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }

            // 버튼 즉시 비활성화
            console.log("Button clicked - disabling...");
            $btn.prop('disabled', true);

            // 1초 후 자동 활성화 (안전장치)
            setTimeout(() => {
                $btn.prop('disabled', false);
                console.log("Button re-enabled");
            }, 1000);
        });
	</script>
</html>
