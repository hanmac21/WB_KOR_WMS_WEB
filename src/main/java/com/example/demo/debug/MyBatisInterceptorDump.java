package com.example.demo.debug;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class MyBatisInterceptorDump {

    @Bean
    public ApplicationRunner dumpInterceptors(Map<String, SqlSessionFactory> factories) {
        return args -> {
            factories.forEach((name, factory) -> {
                List<Interceptor> list = factory.getConfiguration().getInterceptors();
                log.info("✅ [{}] interceptors count = {}", name, list.size());
                for (Interceptor it : list) {
                    log.info("   - {}", it.getClass().getName());
                }
            });
        };
    }
}
