package com.example.demo.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.demo.security.PermissionFilter;

@Configuration
public class WebFilterConfig {

//    public FilterRegistrationBean<PermissionFilter> permissionFilter() {
//    	System.out.println("✅ WebFilterConfig.permissionFilter() LOADED");
//    	
//        FilterRegistrationBean<PermissionFilter> bean = new FilterRegistrationBean<>();
//        bean.setFilter(new PermissionFilter());
//        bean.addUrlPatterns("/*");
//        bean.setOrder(1); // 필요시 조정
//        return bean;
//    }
}
