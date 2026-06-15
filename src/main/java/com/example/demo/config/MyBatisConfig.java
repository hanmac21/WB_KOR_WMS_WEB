package com.example.demo.config;

import org.apache.ibatis.session.Configuration;
import org.mybatis.spring.boot.autoconfigure.ConfigurationCustomizer;
import org.springframework.context.annotation.Bean;

import com.example.demo.security.DmlPermissionMyBatisInterceptor;

@org.springframework.context.annotation.Configuration
public class MyBatisConfig {

    @Bean
    public ConfigurationCustomizer mybatisCustomizer() {
        return (Configuration configuration) -> configuration.addInterceptor(new DmlPermissionMyBatisInterceptor());
    }
}
