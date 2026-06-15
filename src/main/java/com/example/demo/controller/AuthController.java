package com.example.demo.controller;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.security.PermissionFilter;

@RestController
public class AuthController {

//    @PostMapping("/loginCheck")
//    public Map<String, Object> loginCheck(HttpServletRequest request /*, @RequestBody Map<String,Object> body */) {
//
//        // TODO: 여기서 사용자께서 DB 들러서 권한값 조회
//        // 예: boolean canDml = (권한컬럼 == 'Y');
//        boolean canDml = false; // <- 일단 예시
//
//        HttpSession session = request.getSession(true);
//        session.setAttribute(PermissionFilter.SESSION_CAN_DML, canDml);
//
//        return Map.of(
//                "result", "OK",
//                "canDml", canDml
//        );
//    }
//
//    @PostMapping("/logout")
//    public Map<String, Object> logout(HttpServletRequest request) {
//        HttpSession session = request.getSession(false);
//        if (session != null) {
//            // 1) 권한만 지울 수도 있고
//            session.removeAttribute(PermissionFilter.SESSION_CAN_DML);
//
//            // 2) 보통은 세션 자체 무효화가 더 깔끔합니다.
//            session.invalidate();
//        }
//        return Map.of("result", "OK");
//    }
}
