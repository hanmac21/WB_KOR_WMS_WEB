<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>   
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>   
    
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>WOOBOTECH WMS</title>
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.25/css/dataTables.bootstrap4.min.css">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="/resources/js/common/common_alert.js"></script>
<script src="/resources/js/common/excel-exporter.js"></script>
<link rel="stylesheet" href="../resources/css/w_header.css" >
<style>
	body{
		font-size: 14px;
		display:flex;
	}
	.header-wrap{
		height: 43px;
		margin-bottom: 100px;
	}
	.header-ul{
		padding: 0;
		display: inline-flex;
		justify-content: space-evenly;
		margin-left: 250px;
	}
	.header-ul li{
		list-style-type: none;
		float: left;
		text-align: center;
		line-height: 50px;
		font-weight: bold;
		color: #fff;
		width: 210px;
	}
	.header-ul li:hover{
		cursor: pointer;
		background-color: #1a252f;
	}
	
	.header-content{
		display:flex;
	    background-color: #046565;
	    position: relative;
	    line-height: 38px;
	    width: 100%;
	    height: 100%;
	}
	
	.idArea {
	    display: flex;
	    align-items: center;
		margin-left: auto;
	    gap: 1em;
	}
	
	.userLogo{
		width: 30px;
		border-radius: 50%;
	}
	
	.loginId{
		color: white;
		font-size: 23px;
	}

	.logoutArea{
	    display: flex;
	    margin: 0px 11px;
    	align-items: center;
	}	
	
	span a{
		color: #fff;
	}
	li a{
		color: #fff;
		display: block;
	}
	.material-icons a:hover, 
	#header_userUpdate:hover {
		cursor: pointer;
		color: #fff;
		text-decoration: none;
		font-weight: bolder;
	}
	li a:hover{
		color: #fff;
		text-decoration: none;
		font-weight: bolder;
	}
	img.wooboTopLogo{
	}


#header_modal_userUpdateForm {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

.header_modal_userUpdateForm_content {
    background-color: #fff;
    margin: 11% auto;
    padding: 0;
    border-radius: 8px;
    width: 600px;
    max-width: 90%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.header_modal_userUpdateForm_header {
	padding: 20px 20px 4px 20px;
	border-bottom: 1px solid #ddd;
	display: flex;
	justify-content: space-between;
	align-items: end;
	background-color: #f8f9fa;
	border-radius: 8px 8px 0 0;
}

.header_modal_userUpdateForm_body {
    padding: 20px;
}

.header_modal_userUpdateForm_footer {
    padding: 20px;
    border-top: 1px solid #ddd;
    text-align: right;
    background-color: #f8f9fa;
    border-radius: 0 0 8px 8px;
}

.header_modal_userUpdateForm_close {
    color: #aaa;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.header_modal_userUpdateForm_close:hover {
    color: #000;
}

.header_modal_userUpdateForm_flex {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.header_modal_userUpdateForm_group {
    display: flex;
    flex-direction: column;
}

.header_modal_userUpdateForm_group.full-width {
    grid-column: 1 / -1;
}

.header_modal_userUpdateForm_label {
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
}

.header_modal_userUpdateForm_required {
    color: red;
}

.header_modal_userUpdateForm_input, .header_modal_userUpdateForm_textarea {
    padding: 10px !important;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.header_modal_userUpdateForm_input:focus, .header_modal_userUpdateForm_textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0,123,255,0.3);
}

.header_modal_userUpdateForm_textarea {
    resize: vertical;
    min-height: 80px;
}

.header_modal_userUpdateForm_btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-left: 10px;
}

.header_modal_userUpdateForm_btn_primary {
    background-color: #007bff;
    color: white;
    font-weight:600;
}

.header_modal_userUpdateForm_btn_primary:hover {
    background-color: #0056b3;
}

.header_modal_userUpdateForm_btn_secondary {
    background-color: #6c757d;
    color: white;
}

.header_modal_userUpdateForm_btn_secondary:hover {
    background-color: #545b62;
}

	
</style>
<!-- <link rel="icon" href="/resources/images/favicon.png"/> -->
<!-- <link rel="apple-touch-icon" href="/resources/images/favicon.png"/> --> 
</head>
<body>
	<div class="header-wrap">
		<div class="header-content">
			<!-- <span class="rpaMainTitle_1">WOOBO</span> 해더에 탭별 메인 타이틀 이름 넣는 것부터
			<span class="rpaMainTitle_2">TECH</span> 해더에 탭별 메인 타이틀 이름 넣는 것부터
			<span class="rpaMainTitle_3">WMS</span> 해더에 탭별 메인 타이틀 이름 넣는 것부터 -->
			<div class="headerFrontIcon">
				<img class="wooboTopLogo" src="../resources/images/wooboTechLogo_white_usa.png">
				<!-- <img src='../resources/images/woobotechLogo.png' class='headerHanmacLogo'> -->
				<!-- <span class="hanmacText">한맥시스템</span> -->
			</div>
			<div class="loginUserArea">
				<div class = "factoryArea">
					<span class="loginFactory"></span>					
				</div>				
			</div>
			<div class = "idArea">
				<button type="button" class="cacheReLoadBtn" title="캐시 초기화">
				    <span class="cacheText">Clear Cache</span>
				  </button>
				<img  class="userLogo" src = "../resources/images/userImg.png">
				<span class="loginId" data-loginid="${sessionScope.userId}"></span>
			</div>
			<div class = "logoutArea">
				<span class="material-icons btn-logout"><a href="/logout" id="logout">logout</a></span>
			</div>
		</div>
	</div>
	
	<!-- 비밀번호 변경 모달창 -->
	<div id="header_modal_userUpdateForm">
		    <div class="header_modal_userUpdateForm_content">
		        <div class="header_modal_userUpdateForm_header">
		            <h2 style="font-size:21pt;"><spring:message code ="title.passwordChange"/></h2>
		            <span class="inuserInfoTitle"><spring:message code ="modal.employeeId"/> : </span>
		            <span class="inuserInfo" id="header_userUpdate_inuser"></span>
		            <span class="header_modal_userUpdateForm_close" id="header_modal_userUpdateForm_close">&times;</span>
		        </div>
		        
		        <div class="header_modal_userUpdateForm_body">
		            <form id="form_header_userUpdateForm" name="form_header_userUpdateForm" method="post">
		                <div class="header_modal_userUpdateForm_flex">
		                    <div class="header_modal_userUpdateForm_group">
		                        <label class="header_modal_userUpdateForm_label"><spring:message code ="login.id"/><span class="header_modal_userUpdateForm_required"></span></label>
		                        <input type="text" name="KS_ID" id="header_userUpdate_id" class="header_modal_userUpdateForm_input" placeholder="Enter User ID" required readonly>
		                    </div>
		                    <div class="header_modal_userUpdateForm_group">
		                        <label class="header_modal_userUpdateForm_label"><spring:message code ="login.name"/><span class="header_modal_userUpdateForm_required">　*</span></label>
		                        <input type="text" name="KS_NAME" id="header_userUpdate_name" class="header_modal_userUpdateForm_input" placeholder="Enter User Name" required>
		                    </div>
		                    <div class="header_modal_userUpdateForm_group">
		                        <label class="header_modal_userUpdateForm_label"><spring:message code ="modal.password.current"/><span class="header_modal_userUpdateForm_required">　*</span></label>
		                        <input type="password" name="KS_CURRENT_PASSWD" id="header_userUpdate_currentPass" class="header_modal_userUpdateForm_input" placeholder="<spring:message code ="modal.enter.password.current"/>" required>
		                    </div>
		                    
		                    <div class="header_modal_userUpdateForm_group">
		                        <label class="header_modal_userUpdateForm_label"><spring:message code ="modal.password.change"/><span class="header_modal_userUpdateForm_required">　*</span></label>
		                        <input type="password" name="KS_NEW_PASSWD" id="header_userUpdate_newPass" class="header_modal_userUpdateForm_input" placeholder="<spring:message code ="modal.enter.password.change"/>" required>
		                    </div>
		                </div>
		            </form>
		        </div>
		        
		        <div class="header_modal_userUpdateForm_footer">
		            <button type="button" class="header_modal_userUpdateForm_btn header_modal_userUpdateForm_btn_primary" id="header_userUpdateConfirm"><spring:message code ="btn.change"/></button>
		            <button type="button" class="header_modal_userUpdateForm_btn header_modal_userUpdateForm_btn_secondary header_modal_userUpdateForm_close"><spring:message code ="btn.cancel"/></button>
		        </div>
		    </div>
		</div>
	
<script>
	//hover효과
	/*
	$("li:eq(0)").hover(function(){
		$(".menu1Sub").css("display","block");
		$(".menu2Sub,.menu3Sub").css("display","none");
	});
	$(".menu1Sub").hover(function(){
		$(this).css("display","block");
		$(".menu2Sub,.menu3Sub").css("display","none");
	},function(){
		$(this).css("display","none");
	});
	
	$("li:eq(1)").hover(function(){
		$(".menu2Sub").css("display","block");
		$(".menu1Sub,.menu3Sub").css("display","none");
	});
	$(".menu2Sub").hover(function(){
		$(this).css("display","block");
		$(".menu1Sub,.menu3Sub").css("display","none");
	},function(){
		$(this).css("display","none");
	});
	
	$("li:eq(2)").hover(function(){
		$(".menu3Sub").css("display","block");
		$(".menu1Sub,.menu2Sub").css("display","none");
	});
	$(".menu3Sub").hover(function(){
		$(this).css("display","block");
		$(".menu1Sub,.menu2Sub").css("display","none");
	},function(){
		$(this).css("display","none");
	});
	*/
	
	//클릭효과(혹시몰라서 남겨둠)
	/*
	$("li:eq(0)").on("click",function(){
		$(".menu1Sub").css("display","block");
		$(".menu2Sub,.menu3Sub").css("display","none");
	});
	$("li:eq(1)").on("click",function(){
		$(".menu2Sub").css("display","block");
		$(".menu1Sub,.menu3Sub").css("display","none");
	});
	$("li:eq(2)").on("click",function(){
		$(".menu3Sub").css("display","block");
		$(".menu1Sub,.menu2Sub").css("display","none");
	});
	*/
	/* $("#logout").on("click",function(){
		if(confirm("로그아웃 하시겠습니까?")){
			location.href = '/';
			return true;
		}else{
			return false;
		}
	}); */
	$(document).ready(function(){
	    $(".btnLogout").click(function(){
	        $("#logout").click();
	    });

	    console.log('전체 쿠키:', document.cookie);
	    console.log('selectedFactory:', getCookie('selectedFactory'));
	    console.log('name:', getCookie('name'));
		
	    function capitalizeFirst(str) {
	        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	    }

        if (getCookie('selectedStorage') === 'ILLINOIS'){
            $(".loginFactory").text((getCookie('selectedStorage') || ''));
        } else {
	        $(".loginFactory").text((getCookie('selectedFactory') || 'Factory Not Found'));
        }
	    /* $(".loginId").text(getCookie('userLoginId') || 'Name Not Found'); */
	    const loginId = sessionStorage.getItem('userId') || 'Name Not Found';
	    $(".loginId").text(loginId);
	});

	function getCookie(name) {
	    const cookies = document.cookie.split(';');
	    for (let cookie of cookies) {
	        const [key, value] = cookie.trim().split('=');
	        if (key === name) {
	            return decodeURIComponent(value || '');
	        }
	    }
	    return null;
	}
	
	
	// 모달 열기
	$(document).on('click', '.userLogo', function(e) {
	    e.preventDefault();
		$("#header_userUpdate_id").val($('.loginId').text());
		$("#header_userUpdate_name").val(decodeURIComponent(getCookie("userName")));
		$('#header_modal_userUpdateForm').show();

		// 쿠키에서 sabun 값을 가져와서 inuserInfo 클래스에 설정
		const sabunValue = getCookie('sabun');
		if (sabunValue) {
			$('#header_userUpdate_inuser').text(sabunValue);
		}
		
		// 패스워드 공백 방지
		$("#header_userUpdate_currentPass, #header_userUpdate_newPass").off("input keydown").on("input keydown", function(e) {
        	if (e.type === "keydown" && e.keyCode === 32) {
				e.preventDefault();
			} else if (e.type === "input") {
				$(this).val($(this).val().replace(/\s/g, ''));
			}
		});
		
		// 아이디 공백 방지 및 알럿 추가
		$("#header_userUpdate_id").off("input keydown").on("input keydown", function(e) {
			if (e.type === "keydown" && e.keyCode === 32) {
				e.preventDefault();
				alert(i18n.t('validation.enter.dot'));
				return false;
			} else if (e.type === "input") {
				// 입력된 텍스트에서 공백이 있는지 확인
				const currentValue = $(this).val();
				if (currentValue.includes(' ')) {
					alert(i18n.t('validation.enter.dot'));
					$(this).val(currentValue.replace(/\s/g, ''));
				}
			}
		});
	});
	
	// 모달 닫기
	$(document).on('click', '.header_modal_userUpdateForm_close, #header_modal_userUpdateForm_cancel', function() {
		$('#header_modal_userUpdateForm').hide();
		
	    $('#header_userUpdate_currentPass').val('');
	    $('#header_userUpdate_newPass').val('');
	});
	
	// 비밀번호 변경
	$(document).on('click', '#header_userUpdateConfirm', function() {
		const id = $("#header_userUpdate_id").val().trim();
		const currentPass = $("#header_userUpdate_currentPass").val().trim();
	    const newPass = $("#header_userUpdate_newPass").val().trim();
	    const name = $('#header_userUpdate_name').val().trim();

	 	// 유효성 검사
	    if (!currentPass) {
	        alert(i18n.t('validation.enter.currentPassword'));
	        $("#header_userUpdate_currentPass").focus();
	        return;
	    }
	 	
	 	if (!newPass) {
	        alert(i18n.t('validation.enter.newPassword'));
	        $("#header_userUpdate_newPass").focus();
	        return;
	    }
	 	
	 	if (!name){
	 		alert(i18n.t('validation.enter.name'));
	 		$("#header_userUpdate_name").focus();
	        return;
	 	}
	 	
	 	if (currentPass === newPass) {
	        alert(i18n.t('validation.password.same'));
	        $("#header_userUpdate_newPass").focus();
	        return;
	 	}
	 	
		const userInfo = {
			id: id,
			name: name,
			curPw : currentPass,
			pass: newPass
		}

		$.ajax({
			url: "/update_user_pass",
			type: "POST",
			data: JSON.stringify(userInfo),
			contentType: "application/json",
			success: function(data) {
				if (data == 2) {
					alert(i18n.t('success.password.change'));
					$('#header_modal_userUpdateForm').hide();
					location.href = '/';
				}
				
				if (data == -1){
				    alert(i18n.t('error.password.current.invalid'));
				    return;
				}

			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}
		});

	});
	
	
	
	$(document).on('click', '.wooboTopLogo', function(e) {
		/* e.stopPropagation();
		
		if ($(".tapAreaCommon").length >= 1) {
			$(".tapAreaCommon").each(function() {
	            let tapId = $(this).data("tapid");
	            $("#view_" + tapId).remove();
	        });
	        $(".tapAreaCommon").remove();
	        
	        // 메인 화면 표시
	        $(".w_titleArea").empty();
	        $(".w_defaultArea").show();
		} */
		location.reload();
	});
	
	// Cache clear button (jQuery) - Ctrl+Shift+R 동일 효과 (로그인 유지)
	$(document).off('click', '.cacheReLoadBtn').on('click', '.cacheReLoadBtn', async function () {
	    if (!confirm("Clear cache and reload the page?")) return;

	    // Service Worker 캐시만 제거 (세션/쿠키는 건드리지 않음)
	    if (window.caches && caches.keys) {
	        const keys = await caches.keys();
	        await Promise.all(keys.map(k => caches.delete(k)));
	    }

	    // 브라우저 HTTP 캐시 무시하고 강제 재로드 (Ctrl+Shift+R 동일)
	    location.reload(true);
	});



	
</script>
</body>
</html>