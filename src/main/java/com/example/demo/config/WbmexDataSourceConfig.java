package com.example.demo.config;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import com.example.demo.security.DmlPermissionMyBatisInterceptor;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@MapperScan(
    basePackages = "com.example.demo.mapper.wbmex",
    sqlSessionTemplateRef = "wbmexSqlSessionTemplate"   // ✅ template로 고정(강력 추천)
)
public class WbmexDataSourceConfig {

    @Bean(name = "wbmexDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.wbmex")
    public DataSource wbmexDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "wbmexSqlSessionFactory")
    public SqlSessionFactory wbmexSqlSessionFactory(
            @Qualifier("wbmexDataSource") DataSource dataSource,
            DmlPermissionMyBatisInterceptor dmlInterceptor
    ) throws Exception {

        SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
        factory.setDataSource(dataSource);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        factory.setMapperLocations(resolver.getResources("classpath:mybatis/*.xml"));

        // ✅ Interceptor 장착(핵심)
        factory.setPlugins(new org.apache.ibatis.plugin.Interceptor[] { dmlInterceptor });

        log.info("✅ wbmexSqlSessionFactory LOADED - plugins added");

        return factory.getObject();
    }

    @Bean(name = "wbmexSqlSessionTemplate")
    public SqlSessionTemplate wbmexSqlSessionTemplate(
            @Qualifier("wbmexSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Bean(name = "wbmexTransactionManager")
    public PlatformTransactionManager wbmexTransactionManager(
            @Qualifier("wbmexDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
