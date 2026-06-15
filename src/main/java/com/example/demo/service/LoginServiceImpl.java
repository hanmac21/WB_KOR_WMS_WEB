package com.example.demo.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.mapper.wbusa.WbusaMapper;

@Service
public class LoginServiceImpl implements LoginService{
	
	@Autowired
	WbusaMapper mexMapper;
	
	@Override
	public Map<String, Object> loginCheck(Map<String,Object> idParam) {
		return mexMapper.loginCheck(idParam);
	}
	@Override
	public int loginCheck_factoryAccess(Map<String, Object> param) {
		return mexMapper.loginCheck_factoryAccess(param);
	}
	
	
}
