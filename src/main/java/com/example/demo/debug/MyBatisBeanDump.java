package com.example.demo.debug;

import java.util.Map;

import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class MyBatisBeanDump {

    @Bean
    public ApplicationRunner dumpSqlSessionFactories(Map<String, SqlSessionFactory> factories) {
        return args -> {
            log.info("✅ SqlSessionFactory beans count = {}", factories.size());
            factories.forEach((k, v) -> log.info("✅ SqlSessionFactory bean name = {}", k));
        };
    }
}
