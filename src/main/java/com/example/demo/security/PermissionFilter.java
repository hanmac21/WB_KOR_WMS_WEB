package com.example.demo.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)  // 가장 먼저 타게
public class PermissionFilter extends OncePerRequestFilter {

    public static final String SESSION_CAN_DML = "SESSION_CAN_DML";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);

        Object v = (session != null) ? session.getAttribute(SESSION_CAN_DML) : null;
//        log.info("✅ [PERM-FILTER] uri={}, session={}, SESSION_CAN_DML={}",
//                request.getRequestURI(), (session != null), v);

        boolean canDml = false;
        if (v instanceof Boolean) canDml = (Boolean) v;
        if (v instanceof String) canDml = "Y".equalsIgnoreCase((String) v) || "true".equalsIgnoreCase((String) v);

        try {
            AuthContext.setCanDml(canDml);
            chain.doFilter(request, response);
        } finally {
            AuthContext.clear();
        }
    }
}
