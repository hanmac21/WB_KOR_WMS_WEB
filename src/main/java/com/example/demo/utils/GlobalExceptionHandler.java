package com.example.demo.utils;

import java.util.LinkedHashMap;
import java.util.Map;

import org.mybatis.spring.MyBatisSystemException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.demo.exception.ForbiddenException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /* =========================================================
     * 1) 인터셉터에서 직접 던진 ForbiddenException
     * ========================================================= */
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(ForbiddenException e) {
        return forbiddenBody("NO_DML_PERMISSION");
    }

    /* =========================================================
     * 2) MyBatis가 감싸서 올라오는 케이스
     *    (MyBatisSystemException → PersistenceException → ForbiddenException)
     * ========================================================= */
    @ExceptionHandler(MyBatisSystemException.class)
    public ResponseEntity<Map<String, Object>> handleMyBatis(MyBatisSystemException e) {
        Throwable root = rootCause(e);
        if (root instanceof ForbiddenException) {
            return forbiddenBody("NO_DML_PERMISSION");
        }
        return errorBody(HttpStatus.INTERNAL_SERVER_ERROR, "SERVER_ERROR");
    }

    /* =========================================================
     * 3) 그 외 모든 예외 (최종 안전망)
     * ========================================================= */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAny(Exception e) {
        Throwable root = rootCause(e);
        if (root instanceof ForbiddenException) {
            return forbiddenBody("NO_DML_PERMISSION");
        }
        return errorBody(HttpStatus.INTERNAL_SERVER_ERROR, "SERVER_ERROR");
    }

    /* =========================================================
     * 공통 Response Body
     * ========================================================= */
    private ResponseEntity<Map<String, Object>> forbiddenBody(String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("code", code);
        // 프론트 i18n 사용 시 message는 무시됨
        body.put("message", "데이터 편집 권한이 없습니다.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body); // 403
    }

    private ResponseEntity<Map<String, Object>> errorBody(HttpStatus status, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("code", code);
        body.put("message", "오류가 발생했습니다.");
        return ResponseEntity.status(status).body(body);
    }

    /* =========================================================
     * Root Cause 추출
     * ========================================================= */
    private Throwable rootCause(Throwable t) {
        Throwable cur = t;
        while (cur.getCause() != null && cur.getCause() != cur) {
            cur = cur.getCause();
        }
        return cur;
    }
}
