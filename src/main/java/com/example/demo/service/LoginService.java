package com.example.demo.service;

import java.util.Map;

public interface LoginService {
	
	Map<String, Object> loginCheck(Map<String, Object> idParam);
	int loginCheck_factoryAccess(Map<String, Object> param);
}
