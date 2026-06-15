package com.example.demo.mapper.wbpt;

import java.util.Map;

import org.springframework.stereotype.Repository;

@Repository
public interface WbptMapper {
	
	int removeInvoiceWmskey(Map<String, Object> param);
	void updateInvoiceWmsKey(Map<String, Object> param);
	void updateInvoiceWmsKey2(Map<String, Object> param);
}