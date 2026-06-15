package com.example.demo.config;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
	
	@Bean
	public InternalResourceViewResolver viewResolver() {
		InternalResourceViewResolver resolver = new InternalResourceViewResolver();
		resolver.setPrefix("/WEB-INF/views/");
		resolver.setSuffix(".jsp");
		return resolver;
	}
	
	
	// 메시지 번들 위치 지정
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource ms = new ReloadableResourceBundleMessageSource();
        ms.setBasenames(
        	"classpath:/i18n/common/message",
        	"classpath:/i18n/alert/message",
        	"classpath:/i18n/basicData/message",
        	"classpath:/i18n/purchase/message",
        	"classpath:/i18n/production/message",
        	"classpath:/i18n/sales/message",
        	"classpath:/i18n/quality/message",
        	"classpath:/i18n/dashboard/message"
        ); 
        ms.setDefaultEncoding("UTF-8");
        ms.setUseCodeAsDefaultMessage(true);  // 예외 시 코드 자체 렌더링 
        ms.setFallbackToSystemLocale(false);
        ms.setCacheSeconds(1); // 개발 중 즉시 반영
        return ms;
    }

    // 기본 로케일
    @Bean
    public LocaleResolver localeResolver() {        
        // 쿠키 방식
        CookieLocaleResolver clr = new CookieLocaleResolver();
        clr.setDefaultLocale(Locale.ENGLISH); // 기본 언어 값
        clr.setCookieName("lang");
        clr.setCookieMaxAge(60 * 60 * 24 * 365); // 1년 유지
        return clr;
    }

    // 언어 전환
    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor i = new LocaleChangeInterceptor();
        i.setParamName("lang");
        return i;
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
    	registry.addInterceptor(localeChangeInterceptor());
    }
	
}