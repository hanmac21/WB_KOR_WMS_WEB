package com.example.demo.service;

import java.util.Map;

import com.example.demo.mapper.wbpt.WbBasicMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginServiceImpl implements LoginService{
	
	@Autowired
	WbBasicMapper ulsanMapper;
	
	@Override
	public Map<String, Object> loginCheck(Map<String,Object> idParam) {
		return ulsanMapper.loginCheck(idParam);
	}
	@Override
	public int loginCheck_factoryAccess(Map<String, Object> param) {
		return ulsanMapper.loginCheck_factoryAccess(param);
	}
	
	
}
