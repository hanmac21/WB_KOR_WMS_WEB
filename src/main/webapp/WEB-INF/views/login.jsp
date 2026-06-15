<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>	

<!-- 배포 시 핗수 주석 처리 -->
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
final long v = System.currentTimeMillis();
%>
<!-- 배포 시 필수 주석 처리 -->
<!DOCTYPE html>
<html>
<head>
<meta charset="EUC-KR">
<title>Woobotech USA WMS</title>
<link rel="shortcut icon"
	href="https://www.hanmacsystem.com/web/upload/atom.ico">
<link
	href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR&display=swap"
	rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<link rel="stylesheet"
	href="<c:url value='/resources/css/w_login.css'/>?v=<%=v%>">
	
<!-- 다국어 jsp -->
<jsp:include page="/WEB-INF/views/include/i18n-str.jsp" />
<jsp:include page="/WEB-INF/views/include/i18n-text.jsp" />
<jsp:include page="/WEB-INF/views/include/i18n-btn.jsp" />

<style>
body {
/* 	margin: 0;
	height: 917px;
	width: 1918px;
	max-height: 917px;
	max-width: 1918px;
	background: #F5F5F5;
	height:100%;
	width:100%; */
	margin: 0;
    height: 100vh;
    width: 100vw;
    background: #F5F5F5;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-box {
	border: 1px solid black;
	width: 300px;
	height: 300px;
	margin: 0 auto;
}

h1 {
	text-align: center;
}

.button-box {
    height: 17%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 19px;
}

.form-group {
    align-items: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.form-group input.btn_storage,
.form-group input.btn_factorySelect {
    display: none;
}

.form-group .storage-label {
    display: inline-block;
    width: 100%;
    background: white;
    font-weight: 700;
    font-size: 10pt;
    padding: 9px 0px;
    border: 1px solid lightgray;
    border-radius: 5px;
    color: #777777;
    cursor: pointer;
    text-align: center;
    margin-top: 5px;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.form-group .storage-label:hover {
    border-color: #999;
    color: white;
    background-color: #007bff;
}

.form-group input.btn_storage:checked + .storage-label,
.form-group input.btn_factorySelect:checked + .storage-label {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

label {
	display: block;
	font-size: 14px;
	font-weight: bolder;
	color: #333;
}

.idCookie {
	width: 17px;
	height: 17px;
	border: 1px solid gray;
	float: right;
	margin-right: 46px;
	margin-bottom: 9px;
}

input[type="text"], input[type="password"] {
	margin: 5px 0;
	width: 91%;
	height: 18%;
	/* border: 1px solid #ccc; */
	border-radius: 4px;
}

.btn-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 10%;
}

button {
	display: block;
	margin: 0 auto;
	margin-top: 5px;
	width: 183px;
	height: 30px;
}

.setLang {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-family: Arial, sans-serif;
    font-size: 14px;
    justify-content: space-between;
    padding-top: 16px;
}
.setLang {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.setLang a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    text-decoration: none;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: all 0.2s;
    width: 100%;
    justify-content: space-around;
    background: white;
    max-height: 47%;
    mix-width: 21%;
}

.setLang a:hover {
	background: #f5f5f5;
	border-color: #999;
}

.setLang a.active {
	background: #007bff;
	color: white;
	border-color: #007bff;
}

.flag-icon {
	width: 30px;
	height: 20px;
	border-radius: 1px;
	display: inline-block;
}
</style>
</head>
<body class="body">
	<div class="loginBox">
		<div class="loginBox_imgArea">
			<img src="/resources/images/wmsMain_left.png">
		</div>
		<div class="content-wrap">
			<div class="loginBox">
				<!-- <div class="loginBoxImg">
				</div> -->
				<div class="loginForm">
					<div class="loginFormTitle">
						<!-- 로그인 -->
						<!-- <div class="w_mainTitle_1">WOOBOTECH</div>
						<div class="w_mainTitle_2">WMS</div> -->
						<img src="/resources/images/wmsMain_rightLogo.png">
					</div>
					<div class="button-box">
                        <div class="form-group">
                            <input type="radio" name="factorySelect" class="btn_factorySelect" id="select_wbta" value="WBTA" checked>
                            <label for="select_wbta" class="storage-label">WBTA</label>
                        </div>
                        <div class="form-group">
                            <input type="radio" name="factorySelect" class="btn_factorySelect" id="select_illinois" value="ILLINOIS">
                            <label for="select_illinois" class="storage-label">ILLINOIS</label>
                        </div>
                    </div>
						<div class="setLang">
							<a href="?lang=ko" class="active"> 
							<!-- <img src="https://flagcdn.com/w40/kr.png" alt="Korean Flag" class="flag-icon"> -->
							<span class="flag kr">한국어</span>
							</a>
							<a href="?lang=en">
							<!-- <img src="https://flagcdn.com/w40/us.png" alt="US Flag" class="flag-icon"> -->
							<span class="flag en">English</span>
							</a>
						</div>
						<div class="input-box">
							<span class="titleArea">ID</span>
							<input type="text" name="userId" id="userId" placeholder="<spring:message code='login.id'/>">
							<span class="titleArea">PW</span>
							<input type="password" name="userPw" id="userPw" value=""
								placeholder="<spring:message code='login.pw'/>">
						</div>

					<div class="idCookieDiv">
						<input type="checkbox" id="saveid">
						<span class="idCookieText"><spring:message code='login.remember'/></span>
					</div>
					<div class="btn-box">
						<button id="rpaCookieTask"><spring:message code='login.login'/></button>
					</div>

				</div>
			</div>
		</div>
	</div>
	<div class="footer-wrap">
	</div>

<script>
$(document).ready(function() {
    var savedStorage = getCookie('selectedStorage');

    if (savedStorage === 'ILLINOIS') {
        $('#select_illinois').prop('checked', true);
    } else {
        $('#select_wbta').prop('checked', true);
    }

    // 공장은 무조건 WBTA 고정 저장
    setCookie("selectedFactory", "WBTA", 30);

    // 라디오 변경 시 쿠키 처리
    $('.btn_factorySelect').on('change', function() {
        var selectedValue = $(this).val();

        // 공장은 항상 WBTA 고정
        setCookie("selectedFactory", "WBTA", 30);

        if (selectedValue === 'ILLINOIS') {
            setCookie("selectedStorage", "ILLINOIS", 30);
        } else {
            deleteCookie("selectedStorage");
        }
        console.log("Selection changed -> factory: WBTA, storage: " + (selectedValue === 'ILLINOIS' ? 'ILLINOIS' : '(none)'));
    });
			
	$("#rpaCookieTask").click(
        function(e) {
            e.preventDefault();
            let userId = $("#userId").val().trim();
            let userPw = $("#userPw").val().trim();

            // 공장은 무조건 WBTA
            let selectedFactory = "WBTA";

            // 라디오에서 선택된 값으로 storage 결정
            let selectedRadio = $(".btn_factorySelect:checked").val();
            let selectedStorage = (selectedRadio === 'ILLINOIS') ? 'ILLINOIS' : '';

            var checkFactoryAccess = selectedFactory; // 항상 WBTA

            // 공장 선택 누락 검증은 더 이상 필요 없음 (항상 WBTA 고정)
            // 필요 시 라디오 미선택 방어:
            if (!selectedRadio) {
                alert(i18n.t('validation.required.factory'));
                return false;
            }

            setCookie("selectedFactory", "WBTA", 30);
            if (selectedStorage) {
                setCookie("selectedStorage", selectedStorage, 30);
            } else {
                deleteCookie("selectedStorage");
            }

            console.log("USERID -- " + userId + " // PW -- " + userPw);
            console.log("selectedFactory -- WBTA (fixed)");
            console.log("selectedStorage -- " + (selectedStorage || '(none)'));

            if (!userId || !userId.trim()) {
                alert("Please enter your ID");
                $("#userId").focus();
                return false;
            }
            if (!userPw || !userPw.trim()) {
                alert(i18n.t('validation.enter.password'));
                $("#userPw").focus();
                return false;
            }

            const saveCheck = document.getElementById("saveid");

            if (userId == 'master2' && userPw == 'woo#*') {
                if (saveCheck.checked) {
                    setCookie("userLoginId", $('#userId').val(), 30);
                    setCookie("userLoginPw", $('#userPw').val(), 30);
                }
                // location.href = '/wwms.do';
            } else {
                $.ajax({
                    url: "/loginCheck",
                    type: "POST",
                    data: JSON.stringify({
                        userId: userId,
                        userPw: userPw,
                        factory: checkFactoryAccess  // 항상 WBTA
                    }),
                    contentType: "application/json",
                    success: function(data) {
                        console.log(" -- LOGIN ACCESS -- ");
                        console.log(data);

                        sessionStorage.setItem("factoryAccess", data.factoryAccess);

                        if (data.code === "loginFail") {
                            alert(i18n.t('validation.login'));
                        } else if (data.code === 'factoryFail') {
                            alert(i18n.t('validation.access.factory'));
                        } else if (data.code == 'ok') {
                            setCookie("selectedFactory", "WBTA", 30); // 고정
                            if (selectedStorage) {
                                setCookie("selectedStorage", selectedStorage, 30);
                            } else {
                                deleteCookie("selectedStorage");
                            }
                            if (saveCheck.checked) {
                                setCookie("userLoginId", $('#userId').val(), 30);
                                setCookie("userLoginPw", $('#userPw').val(), 30);
                            }
                            setCookie("userName", encodeURIComponent(data.name));
                            console.log("NAME COOKIE SET : " + getCookie("userName"));
                            setCookie("sabun", data.sabun);
                            location.href = '/wwms.do';
                        } else {
                            alert(i18n.t('validation.login'));
                            $("#userId").focus();
                            $("#userPw").val("");
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error("요청 실패");
                        console.error("Status:", status);
                        console.error("Error:", error);
                        console.error("Response:", xhr.responseText);
                        alert("오류가 발생했습니다: " + error);
                    }
                });

                if (saveCheck.checked) {
                    setCookie("userLoginId", $('#userId').val(), 30);
                    setCookie("userLoginPw", $('#userPw').val(), 30);
                } else {
                    deleteCookie("userLoginId");
                    deleteCookie("userLoginPw");
                    // selectedFactory는 WBTA 고정이므로 삭제하지 않음
                    deleteCookie("selectedStorage");
                }

                sessionStorage.setItem("userId", userId);
            }
        }
    );

	$("#userId").keydown(function(key) {
		if (key.keyCode == 13) {
			if ($("#userPw").val() == '') {
				alert(i18n.t('validation.enter.idPassword'));
				$("#userPw").focus();
				return false;
			} else {
				$("#rpaCookieTask").click();
			}
		}
	});

	$("#userPw").keydown(function(key) {
		if (key.keyCode == 13) {
			if ($("#userId").val() == '') {
				alert(i18n.t('validation.enter.idPassword'));
				$("#userId").focus();
				return false;
			} else {
				$("#rpaCookieTask").click();
			}
		}
	});

	var userLoginId = getCookie("userLoginId");
	var userLoginPw = getCookie("userLoginPw");
	$("input[name='userId']").val(userLoginId);
	$("input[name='userPw']").val(userLoginPw);

	if ($("input[name='userId']").val() != "") {
		$("#saveid").attr("checked", true);
	}
	;

	function setCookie(cookieName, value, exdays) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var cookieValue = escape(value)
				+ ((exdays == null) ? "" : "; expires="
						+ exdate.toGMTString());
		document.cookie = cookieName + "=" + cookieValue;
	}

	function deleteCookie(cookieName) {
		var expireDate = new Date();
		expireDate.setDate(expireDate.getDate() - 1);
		document.cookie = cookieName + "= " + "; expires="
				+ expireDate.toGMTString();
	}

	function getCookie(cookieName) {
		cookieName = cookieName + '=';
		var cookieData = document.cookie;
		var start = cookieData.indexOf(cookieName);
		var cookieValue = '';
		if (start != -1) {
			start += cookieName.length;
			var end = cookieData.indexOf(';', start);
			if (end == -1)
				end = cookieData.length;
			cookieValue = cookieData.substring(start, end);
		}
		return unescape(cookieValue);
	}

	function langEqual(a, b) {
		if (!a || !b)
			return false;
		a = (a + '').toLowerCase().replace('-', '_');
		b = (b + '').toLowerCase().replace('-', '_');
		if (a === b)
			return true;
		return a.split('_')[0] === b.split('_')[0];
	}

	var lang = getCookie('lang') || 'en';

	$('.setLang a').each(function() {
		var $a = $(this);
		$a.removeClass('active');

		var href = $a.attr('href') || '';
		var m = href.match(/[?&]lang=([^&#]+)/);
		var aLang = m ? decodeURIComponent(m[1]) : '';

		if (langEqual(aLang, lang)) {
			$a.addClass('active');
		}
	});

	// 3) 사용자가 언어 클릭 시: 쿠키 저장 후 이동
	$('.setLang a').on('click', function(e) {
		var href = $(this).attr('href') || '';
		var m = href.match(/[?&]lang=([^&#]+)/);
		if (m) {
			// 보유 중인 setCookie 함수 사용 (유효기간 365일 예시)
			setCookie('lang', m[1], 365);
		}
	});
});
</script>
</body>
</html>