package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.demo.security.DmlPermissionMyBatisInterceptor;

@Configuration
public class SecurityBeans {

    @Bean
    public DmlPermissionMyBatisInterceptor dmlPermissionMyBatisInterceptor() {
        return new DmlPermissionMyBatisInterceptor();
    }
}
