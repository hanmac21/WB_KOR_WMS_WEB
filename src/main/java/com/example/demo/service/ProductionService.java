package com.example.demo.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.vo.ProductVO;
import com.example.demo.vo.RealStockVO;
import com.example.demo.vo.SemiWorkVO;
import com.example.demo.vo.StockVO;

// 🔹 **1. 서비스 인터페이스**
public interface ProductionService {
	// 엑셀 업로드
	List<Map<String, Object>> excelUpload(MultipartFile file) throws IOException;

	// 재공 재고 실사 저장
	int insertStockCountWIPList(List<Map<String, Object>> list, String factory, String workshop, String loginid, String date);

	Map<String, Object> read_stockCountWIPList(Map<String, Object> params);
	
	//Total Qty
	String updateTotalQtyProductionStockCount(Map<String, Object> param);
	
//	// 반제품 생산실적 - detail
//	List<SemiWorkVO> read_semiProductionDetail(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_semiProductionDetail_all(Map<String, Object> searchParams);
//	int getSemiProductionDetailTotalCount(Map<String, Object> paramMap);
//	BigDecimal getSemiProductionDetailTotalQty(Map<String, Object> paramMap);
	
//	// 반제품 생산실적 - summary
//	List<SemiWorkVO> read_semiProductionSummary(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_semiProductionSummary_all(Map<String, Object> searchParams);
//	int getSemiProductionSummaryTotalCount(Map<String, Object> paramMap);
//	BigDecimal getSemiProductionSummaryTotalQty(Map<String, Object> paramMap);
	
//	// 이송처리 - detail
//	List<SemiWorkVO> read_transferDetail(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_transferDetail_all(Map<String, Object> searchParams);
//	int getTransferDetailTotalCount(Map<String, Object> paramMap);
//	int getTransferDetailTotalQty(Map<String, Object> paramMap);
//
//	// 이송처리 - summary
//	List<SemiWorkVO> read_transferSummary(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_transferSummary_all(Map<String, Object> searchParams);
//	int getTransferSummaryTotalCount(Map<String, Object> paramMap);
//	int getTransferSummaryTotalQty(Map<String, Object> paramMap);
	
//	// 제품 생산실적 - detail
//	Map<String, Object> read_productionDetail(Map<String, Object> requestData);
//	List<Map<String, Object>> read_productionDetail_all(Map<String, Object> requestData);
//	
//	// 제품 생산실적 - summary
//	Map<String, Object> read_productionSummary(Map<String, Object> requestData);
//	List<Map<String, Object>> read_productionSummary_all(Map<String, Object> requestData);
	
	// 작업장 내 예외입고 - detail
	Map<String, Object> read_productionExceptionInputDetail(Map<String, Object> requestData);
	List<Map<String, Object>> read_productionExceptionInputDetail_all(Map<String, Object> requestData);
	
	// 작업장 내 예외입고 - summary
	Map<String, Object> read_productionExceptionInputSummary(Map<String, Object> requestData);
	List<Map<String, Object>> read_productionExceptionInputSummary_all(Map<String, Object> requestData);
	
	// 작업장 내 예외출고 - detail
	Map<String, Object> read_productionExceptionOutputDetail(Map<String, Object> requestData);
	List<Map<String, Object>> read_productionExceptionOutputDetail_all(Map<String, Object> requestData);
	
	// 작업장 내 예외 출고 - summary
	Map<String, Object> read_productionExceptionOutputSummary(Map<String, Object> requestData);
	List<Map<String, Object>> read_productionExceptionOutputSummary_all(Map<String, Object> requestData);
	
	// 미적재 리스트 조회
	Map<String, Object> read_productionUnloadList(Map<String, Object> requestData);
	List<Map<String, Object>> read_productionUnloadList_all(Map<String, Object> requestData);
	
	// 재고 조회 - detail
	Map<String, Object> read_productionStockDetail(Map<String, Object> requestData);
	List<Map<String, Object>> read_productionStockDetail_all(Map<String, Object> requestData);
	
	// 재고 조회 - summary
	Map<String, Object> read_productionStockSummary(Map<String, Object> requestData);
	List<Map<String, Object>> read_productionStockSummary_all(Map<String, Object> requestData);
	
	// 재고 정보
	Map<String, Object> read_productionStockInfo(Map<String, Object> requestData);
	List<Map<String, Object>> read_productionStockInfo_all(Map<String, Object> requestData);
	
	// 재고 실사 조회
	List<RealStockVO> read_productionStockCountList(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionStockCountList_all(Map<String, Object> searchParam);
	int getProductionStockCountListTotalCount(Map<String, Object> paramMap);
	
	List<RealStockVO> read_productionStockCountSummary(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionStockCountSummary_all(Map<String, Object> searchParam);
	int getProductionStockCountSummaryTotalCount(Map<String, Object> paramMap);
	
	// 재고 실사 검증
	List<StockVO> read_productionStockCountCompare(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionStockCountCompare_all(Map<String, Object> searchParams);	
	Map<String, Object> read_productionStockCountCompare_detail(Map<String, Object> searchParams);
	
	// 재고 실사 (미스캔)
	List<StockVO> read_productionStockCountMissing(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionStockCountMissing_all(Map<String, Object> searchParams);
	int getProductionStockCountMissingTotalCount(Map<String, Object> paramMap);
	BigDecimal getProductionStockCountMissingTotalQty(Map<String, Object> paramMap);
	Map<String, Object> productionRealStockNotScan(Map<String, Object> param);
	//void productionInsertExcpetionOutput(@RequestBody Map<String, Object> data);
	
	// 재고 실사 ERP
	List<ProductVO> read_productionErpInterfaceSummary(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionErpInterfaceSummary_all(Map<String, Object> searchParams);
	
	// 재공재고실사 작업장별 조회
	List<RealStockVO> read_stockCountWIPWrokList(Map<String, Object> paramMap);

	Map<String, Object> read_productionWipStockList(Map<String, Object> params);

	// 생산실적 - 생산실적
	Map<String, Object> readProductionDetail(Map<String, Object> params);
	Map<String, Object> readProductionSummary(Map<String, Object> params);
	
	// 생산실적 - 반제품생산
	Map<String, Object> readSemiProductionDetail(Map<String, Object> params);
	Map<String, Object> readSemiProductionSummary(Map<String, Object> params);

}