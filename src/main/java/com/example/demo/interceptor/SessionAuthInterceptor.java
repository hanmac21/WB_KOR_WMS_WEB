package com.example.demo.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.servlet.HandlerInterceptor;

import com.example.demo.vo.LoginVO;

import lombok.var;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class SessionAuthInterceptor implements HandlerInterceptor {
	private boolean isAjax(HttpServletRequest req) {
		String xrw = req.getHeader("X-Requested-With");
		String accept = req.getHeader("Accept");
		return "XMLHttpRequest".equalsIgnoreCase(xrw) || (accept != null && accept.contains("application/json"));
	}
	
//	private String buildRedirectUrl(HttpServletRequest req) throws UnsupportedEncodingException{
//		String url = req.getRequestURI();
//		String qs = req.getQueryString();
//		String current = url + (qs != null ? "?" + qs : "");
//		return "/?expired=true&redirect=" + URLEncoder.encode(current, "UTF-8");
//	}
	
	private boolean isBypassPath(String url) {
		return url.equals("/")
				|| url.startsWith("/static/")
				|| url.startsWith("/css/")
				|| url.startsWith("/js/")
				|| url.startsWith("/img/")
				|| url.startsWith("/favicon/")
				|| url.startsWith("/health/");
	}
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		if ("1".equals(request.getParameter("kill"))) {
	        var s = request.getSession(false);
	        if (s != null) s.invalidate();    // ★ 강제 종료
	    }

			
		String uri = request.getRequestURI();
		
		if(isBypassPath(uri) || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
			return true;
		}
		
		HttpSession session = request.getSession(false);
		
		LoginVO user = (session == null) ? null : (LoginVO) session.getAttribute("user");
		if(user != null) return true;
		
		// 캐시 금지 (뒤로가기 시 만료 화면 복귀 방지)
		response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader("Expires", 0);
		
		if(isAjax(request)) {
			response.setHeader("X-Login-Redirect", "/");
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}else {
			response.sendRedirect("/");
		}
		
		return false;
		//		if(session == null) {//			response.sendRedirect("/");//			return false;//		}//		//		String requestURI = request.getRequestURI();//		//		LoginVO sessionVal = (LoginVO)session.getAttribute("user");//		log.info("SessionId Val ==> "+sessionVal);//		//		if(sessionVal == null) {//			response.sendRedirect("/");//			return false;//		}
		
		
		/*
		 * if(requestURI.startsWith("/main") && !"master".equals(svo.getLoginid())) {
		 * log.warn("비 정상 접근 ID : {}", svo.getLoginid()); response.sendRedirect("/");
		 * return false; }
		 */
		 
		//		return true;
	}

	
}
