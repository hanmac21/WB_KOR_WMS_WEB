package com.example.demo.config;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import com.example.demo.security.DmlPermissionMyBatisInterceptor;

@Configuration
@MapperScan(basePackages = "com.example.demo.mapper.wbpt", sqlSessionFactoryRef = "wbptSqlSessionFactory")
public class WbptDataSourceConfig {

    @Bean(name = "wbptDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.wbpt")
    public DataSource wbptDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "wbptSqlSessionFactory")
    public SqlSessionFactory wbptSqlSessionFactory(
            @Qualifier("wbptDataSource") DataSource dataSource,
            ApplicationContext applicationContext
    ) throws Exception {

        SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
        factory.setDataSource(dataSource);

        // ✅ wbpt mapper xml 경로 지정 (여기 중요)
        factory.setMapperLocations(applicationContext.getResources("classpath*:mybatis/WbptMapper.xml"));

        // ✅ 플러그인
        factory.setPlugins(new org.apache.ibatis.plugin.Interceptor[] {
                new DmlPermissionMyBatisInterceptor()
        });

        return factory.getObject();
    }

    @Bean(name = "wbptSqlSessionTemplate")
    public SqlSessionTemplate wbptSqlSessionTemplate(
            @Qualifier("wbptSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Bean(name = "wbptTransactionManager")
    public PlatformTransactionManager wbptTransactionManager(
            @Qualifier("wbptDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
