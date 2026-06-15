package com.example.demo.service;

import java.util.List;
import java.util.Map;

import com.example.demo.vo.BomDecompositionVO;

// 🔹 **1. 서비스 인터페이스**
public interface QualityService {	
	Map<String, Object> read_qualityDefectDetail(Map<String, Object> paramMap);
	List<Map<String, Object>> read_qualityDefectDetail_all(Map<String, Object> searchParams);
	
	Map<String, Object> read_qualityDefectSummary(Map<String, Object> requestData);
	List<Map<String, Object>> read_qualityDefectSummary_all(Map<String, Object> requestData);
	
	Map<String, Object> readIncomingInspectionList(Map<String, Object> param);
	Map<String, Object> readProcessInspectionList(Map<String, Object> param);
	Map<String, Object> readReturnInspectionList(Map<String, Object> param);
	Map<String, Object> readWarehouseInspectionList(Map<String, Object> param);
	Map<String, Object> readDisposalList(Map<String, Object> param);
	Map<String, Object> read_judgment(Map<String, Object> param);
	
	Map<String, Object> read_qualityTotalList(Map<String, Object> param);
	Map<String, Object> read_qualityTotalSum(Map<String, Object> param);
	
//	Map<String, Object> read_qualityStockDetail(Map<String, Object> requestData);
//	List<Map<String, Object>> read_qualityStockDetail_all(Map<String, Object> requestData);
//	
//	List<Map<String, Object>> read_qualityStockSummary(Map<String, Object> paramMap);
//	Map<String, Object> getQualityStockSummaryTotalQty(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_qualityStockSummary_all(Map<String, Object> searchParams);
	
//	Map<String, Object> read_qualityWorkshopDetail(Map<String, Object> requestData);
//	List<Map<String, Object>> read_qualityWorkshopDetail_all(Map<String, Object> requestData);
//	Map<String, Object> read_qualityWorkshopSummary(Map<String, Object> requestData);
//	List<Map<String, Object>> read_qualityWorkshopSummary_all(Map<String, Object> requestData);

	// 작업장이동
	Map<String, Object> readQualityWorkshopDetail(Map<String, Object> params);
	Map<String, Object> readQualityWorkshopSummary(Map<String, Object> params);

	Map<String, Object> read_qualityStockList(Map<String, Object> params);
	Map<String, Object> read_qualityStockSummary(Map<String, Object> params);
	
	// 품질 재고실사
	Map<String, Object> read_qualityStockcountList(Map<String, Object> params);	
	Map<String, Object> read_qualityStockcountSum(Map<String, Object> params);	
	
	// 품질 재고실사
	Map<String, Object> read_qualityStockcountListLastDay(Map<String, Object> params);
	Map<String, Object> read_qualityStockcountSumLastDay(Map<String, Object> params);
	
	// BOM 정보 조회
	Map<String, Object> getBOMInfo(Map<String, Object> body);
	// 분해
	Map<String, Object> decomposition(List<BomDecompositionVO> list);
	
	// 폐기
	Map<String, Object> scrap(Map<String, Object> params);
	
//	Map<String, Object> read_qualityExceptionInputDetail(Map<String, Object> requestData);
//	List<Map<String, Object>> read_qualityExceptionInputDetail_all(Map<String, Object> requestData);

//	Map<String, Object> read_qualityExceptionInputSummary(Map<String, Object> requestData);
//	List<Map<String, Object>> read_qualityExceptionInputSummary_all(Map<String, Object> requestData);

//	Map<String, Object> read_qualityExceptionOutputDetail(Map<String, Object> requestData);
//	List<Map<String, Object>> read_qualityExceptionOutputDetail_all(Map<String, Object> requestData);

//	Map<String, Object> read_qualityExceptionOutputSummary(Map<String, Object> requestData);
//	List<Map<String, Object>> read_qualityExceptionOutputSummary_all(Map<String, Object> requestData);
	
	// 예외처리 - 예외입고내역
	Map<String, Object> readQualityExceptionInputDetail(Map<String, Object> params);
	Map<String, Object> readQualityExceptionInputSummary(Map<String, Object> params);
	
	// 예외처리 - 예외출고내역
	Map<String, Object> readQualityExceptionOutputDetail(Map<String, Object> params);
	Map<String, Object> readQualityExceptionOutputSummary(Map<String, Object> params);
	
	Map<String, Object> read_decomposition(Map<String, Object> params);
	Map<String, Object> readQualityDecompositionDetail(Map<String, Object> params);
	Map<String, Object> readQualityDecompositionScrapDetail(Map<String, Object> params);
	
	Map<String, Object> read_scrapList(Map<String, Object> params);
	
	// 판정
	Map<String, Object> insSaltilloProductionInspection(Map<String, Object> params);
	Map<String, Object> insSaltilloOKInspection(Map<String, Object> params);
	// 거래처 불러오기
	List<Map<String, Object>> getSupplierList();
	Map<String, Object> readQualityReusedList(Map<String, Object> params);

	// 품질 재고조회
    Map<String, Object> read_qualityStockIOList(Map<String, Object> params);
}