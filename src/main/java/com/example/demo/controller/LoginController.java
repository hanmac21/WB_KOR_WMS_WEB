package com.example.demo.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.demo.service.LoginService;
import com.example.demo.vo.LoginVO;

import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
public class LoginController {

	@Autowired
	LoginService loginService;

	@GetMapping("/")
	public String login() {
		log.info("Login Page Load");
		return "login";
	}

	@GetMapping("/logout")
	public String logout(Model model, HttpServletRequest request) {
		HttpSession session = request.getSession();
		session.invalidate();
		log.info("Logout Success");
		return "redirect:/";
	}

	@PostMapping("/loginCheck")
	@ResponseBody
	public Map<String, Object> loginCheck(@RequestBody Map<String,Object> idParam, HttpServletRequest request) throws Exception {
		System.out.println(" -- ENTER LOGINCHECK -- ");
		System.out.println(idParam);
		
		String userId = (String)idParam.get("userId");
		String factoryCheck = (String)idParam.get("factory");
		log.info(userId);

		int factoryCheckCount = loginService.loginCheck_factoryAccess(idParam);
		
		Map<String, Object> result = new LinkedHashMap<>();
		
		Map<String, Object> loginCheck = loginService.loginCheck(idParam);
		
		boolean loginSuccess = loginCheck != null && !"none".equals(loginCheck.get("KS_NAME")) && !"none".equals(loginCheck.get("KS_ID"));
		
	    // 로그인 성공시 세션 설정
	    if(loginSuccess) {
	    	if(factoryCheckCount > 0) {
	    		HttpSession session = request.getSession();
		        LoginVO loginVO = new LoginVO();
		        loginVO.setUserId(userId);
		        session.setMaxInactiveInterval(60 * 60*24); // 24시간
		        session.setAttribute("user", loginVO); 
		        
		     // ✅ 여기 추가
		        boolean canDml = false;/* TODO: DB에서 권한 조회해서 true/false */
		        String DML_ACCESS = (String)loginCheck.get("KS_DML_ACCESS");
		        System.out.println("DML ACCESS");
		        System.out.println(DML_ACCESS);
		        if(DML_ACCESS.equals("Y")) {
		        	canDml = true;
		        }
		        System.out.println(canDml);
		        session.setAttribute("SESSION_CAN_DML", canDml);
		        
		        // 접근 공장을 세션에 저장
		        String factoryAccess = (String)loginCheck.get("KS_FACTORY_ACCESS");
		        session.setAttribute("factoryAccess", factoryAccess);
		        
		        System.out.println(loginCheck);
		        
		        result.put("success", true);
		        result.put("code", "ok");
		        result.put("name", loginCheck.get("KS_NAME"));
		        result.put("sabun", loginCheck.get("KS_SABUN"));
		        result.put("factoryAccess", factoryAccess);
		        
		        System.out.println("세션 설정 완료: " + session.getAttribute("user"));
			}else {
//				result = "factoryFail";
				result.put("success", false);
				result.put("code", "factoryFail");			
			}
	    }else {
//	    	result = "loginFail";
			result.put("success", false);
			result.put("code", "loginFail");
	    }
		
	    
	    return result;
	}

	@GetMapping("/errorPage")
	public String errorPage(Model model) {
		return "/errorPage";
	}

	@GetMapping("/wwms.do")
	public String main() {
		return "/w_main";
	}

}
