package com.example.demo.interceptor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SessionConfig implements WebMvcConfigurer {

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		InterceptorRegistration sessionCheckInterceptor = registry.addInterceptor(new SessionAuthInterceptor());
		sessionCheckInterceptor
			.addPathPatterns("/**")
			.excludePathPatterns(
		            "/", 
		            "/loginCheck", 
		            "/logout", 
		            "/error",                    
		            "/resources/**",
		            "/.well-known/**",           
		            "/favicon.ico",              
		            "/static/**",                
		            "/css/**",
		            "/js/**",
		            "/images/**",
		            "/pallet_label_A4",          // 세션 체크 제외
		            "/pallet_label_A4_fabric",    // 세션 체크 제외
		            "/pallet_label_A4_fabric_puebla",    // 세션 체크 제외
		            "/boxlabel",    // 세션 체크 제외
		            "/boxlabelstock",    // 세션 체크 제외
		            "/boxlabeltest",
		            "/boxlabelstocktest",
					"/pallet_label_A3_print"
		        ).order(2);
		
	}
	
	@Bean
	public SessionAuthInterceptor sessionAuthInterceptor() {
		return new SessionAuthInterceptor();
	}
	
}
