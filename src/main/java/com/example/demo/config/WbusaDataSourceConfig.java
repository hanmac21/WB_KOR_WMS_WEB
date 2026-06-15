package com.example.demo.config;

import com.example.demo.security.DmlPermissionMyBatisInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import javax.sql.DataSource;

@Slf4j
@Configuration
@MapperScan(
    basePackages = "com.example.demo.mapper.wbusa",
    sqlSessionFactoryRef = "wbusaSqlSessionFactory"
)
public class WbusaDataSourceConfig {

    @Bean(name = "wbusaDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.wbusa")
    public DataSource wbusaDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "wbusaSqlSessionFactory")
    public SqlSessionFactory wbusaSqlSessionFactory(
            @Qualifier("wbusaDataSource") DataSource dataSource,
            DmlPermissionMyBatisInterceptor dmlInterceptor
    ) throws Exception {

        SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
        factory.setDataSource(dataSource);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        factory.setMapperLocations(resolver.getResources("classpath:mybatis/*.xml"));

        factory.setPlugins(new org.apache.ibatis.plugin.Interceptor[] { dmlInterceptor });

        log.info("✅ wbusaSqlSessionFactory LOADED - plugins added");

        return factory.getObject();
    }

    @Bean(name = "wbusaSqlSessionTemplate")
    public SqlSessionTemplate wbusaSqlSessionTemplate(
            @Qualifier("wbusaSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Primary
    @Bean(name = "usaTransactionManager")
    public DataSourceTransactionManager usaTransactionManager(
            @Qualifier("wbusaDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
