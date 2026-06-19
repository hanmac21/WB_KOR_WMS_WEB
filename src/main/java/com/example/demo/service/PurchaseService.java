package com.example.demo.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Formatter.BigDecimalLayoutForm;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestBody;

import com.example.demo.vo.StockMoveVO;
import com.example.demo.vo.FactoryMoveVO;
import com.example.demo.vo.LoadVO;
import com.example.demo.vo.ProductVO;
import com.example.demo.vo.RealStockVO;
import com.example.demo.vo.StockVO;
import com.example.demo.vo.UnpackVO;
import com.example.demo.vo.WipReturnVO;
import com.example.demo.vo.WorkMoveVO;
import org.springframework.web.multipart.MultipartFile;

// 🔹 **1. 서비스 인터페이스**
public interface PurchaseService {

	List<RealStockVO> read_realStock(Map<String, Object> paramMap);
	List<String> read_realStock_dates(Map<String, Object> paramMap);
	List<RealStockVO> read_realStockSummary(Map<String, Object> paramMap);

	int getRealStockTotalCount(Map<String, Object> paramMap);
	int getRealStockSummaryTotalCount(Map<String, Object> paramMap);

	List<Map<String, Object>> read_realStock_all(Map<String, Object> searchParam);
	List<Map<String, Object>> read_realStockSummary_all(Map<String, Object> searchParam);

	String updateTotalQtyStockCount(Map<String, Object> param);

	// 바코드 히스토리 모달창
	Map<String,Object> search_stockInfo(String barcode);
	List<Map<String, Object>> show_stockHistory(String barcode);
	// 데이터 삭제
	Map<String, Object> deleteByKind(String kind, Map<String, Object> body);

	// 입고조회 - 입고내역 
	Map<String, Object> readIncomingDetail(Map<String, Object> param);
	Map<String, Object> readIncomingSummary(Map<String, Object> param);

	// 출고처리 - 제품출고
	Map<String, Object> readLoadDetail(Map<String, Object> params);
	Map<String, Object> readLoadSummary(Map<String, Object> params);

	Map<String, Object> readValidationDetail(Map<String, Object> params);

}