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
<meta charset="UTF-8">
<title>WOOBOTECH KOR WMS</title>
<link rel="shortcut icon"
	href="https://www.hanmacsystem.com/web/upload/atom.ico">
<link
	href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR&display=swap"
	rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<link rel="stylesheet"
	href="<c:url value='/resources/css/w_login.css'/>?v=<%=v%>">
</head>
<body class="body">
	<div class="loginBox">
		<div class="loginBox_imgArea">
			<img src="/resources/images/wmsMain_left.png">
		</div>
		<div class="content-wrap">
			<div class="loginBox">
				<div class="loginForm">
					<div class="loginFormTitle">
						<!-- 로그인 -->
						<img src="/resources/images/wmsMain_rightLogo.png">
					</div>
					<div class="button-box">
                        <!-- 울산: 현재 선택 가능 -->
                        <div class="form-group">
                            <input type="radio" name="factorySelect" class="btn_factorySelect" id="select_ulsan" value="ULSAN" checked>
                            <label for="select_ulsan" class="storage-label">울산</label>
                        </div>
                        <div class="form-group">
                            <input type="radio" name="factorySelect" class="btn_factorySelect" id="select_pt" value="PT">
                            <label for="select_pt" class="storage-label">평택</label>
                        </div>
                    </div>
						<div class="input-box">
							<span class="titleArea">ID</span>
							<input type="text" name="userId" id="userId" placeholder="아이디">
							<span class="titleArea">PW</span>
							<input type="password" name="userPw" id="userPw" value=""
								placeholder="패스워드">
						</div>

					<div class="idCookieDiv">
                        <input type="checkbox" id="saveid">
                        <label for="saveid" class="idCookieText">아이디 기억하기</label>
                    </div>
					<div class="btn-box">
						<button id="rpaCookieTask">로그인</button>
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

    if (savedStorage === "PT") {
        $('#select_pt').prop('checked', true);
    } else {
        $('#select_ulsan').prop('checked', true);
    }

    // 라디오 변경 시 쿠키 처리
    $('.btn_factorySelect').on('change', function() {
        var selectedValue = $(this).val();
        setCookie("selectedFactory", selectedValue, 30);
        console.log("Selection changed -> factory: " + selectedValue);
    });
			
	$("#rpaCookieTask").click(
        function(e) {
            e.preventDefault();
            let userId = $("#userId").val().trim();
            let userPw = $("#userPw").val().trim();

            // 선택된 사업장 (울산 / 평택)
            let selectedFactory = $(".btn_factorySelect:checked").val();
            var checkFactoryAccess = selectedFactory;

            // 필요 시 라디오 미선택 방어:
            if (!selectedFactory) {
                alert("공장을 선택해 주세요.");
                return false;
            }

            setCookie("selectedFactory", selectedFactory, 30);

            console.log("USERID -- " + userId + " // PW -- " + userPw);
            console.log("selectedFactory -- " + selectedFactory);

            if (!userId || !userId.trim()) {
                alert("아이디를 입력해 주세요.");
                $("#userId").focus();
                return false;
            }
            if (!userPw || !userPw.trim()) {
                alert("비밀번호를 입력해 주세요.");
                $("#userPw").focus();
                return false;
            }

            const saveCheck = document.getElementById("saveid");

            if (userId == 'master2' && userPw == 'woo#*') {
                if (saveCheck.checked) {
                    setCookie("userLoginId", $('#userId').val(), 30);
                    setCookie("userLoginPw", $('#userPw').val(), 30);
                }
            } else {
                $.ajax({
                    url: "/loginCheck",
                    type: "POST",
                    data: JSON.stringify({
                        userId: userId,
                        userPw: userPw,
                        factory: checkFactoryAccess
                    }),
                    contentType: "application/json",
                    success: function(data) {
                        console.log(" -- LOGIN ACCESS -- ");
                        console.log(data);

                        sessionStorage.setItem("factoryAccess", data.factoryAccess);

                        if (data.code === "loginFail") {
                            alert("아이디 또는 비밀번호가 잘못되었습니다. 다시 시도해 주세요.");
                        } else if (data.code === 'factoryFail') {
                            alert("공장 접근 권한이 없습니다.");
                        } else if (data.code == 'ok') {
                            setCookie("selectedFactory", selectedFactory, 30);
                            if (saveCheck.checked) {
                                setCookie("userLoginId", $('#userId').val(), 30);
                                setCookie("userLoginPw", $('#userPw').val(), 30);
                            }
                            setCookie("userName", encodeURIComponent(data.name));
                            console.log("NAME COOKIE SET : " + getCookie("userName"));
                            location.href = '/wwms.do';
                        } else {
                            alert("아이디 또는 비밀번호가 잘못되었습니다. 다시 시도해 주세요.");
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
                }

                sessionStorage.setItem("userId", userId);
            }
        }
    );

	$("#userId").keydown(function(key) {
		if (key.keyCode == 13) {
			if ($("#userPw").val() == '') {
				alert("아이디, 비밀번호를 확인해 주세요.");
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
				alert("아이디, 비밀번호를 확인해 주세요.");
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

	var lang = getCookie('lang') || 'ko';

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