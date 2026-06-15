package com.example.demo.service;

import com.example.demo.vo.StockVO;

import java.util.List;
import java.util.Map;

// 🔹 **1. 서비스 인터페이스**
public interface SalesService {
	// 이송처리내역
	Map<String, Object> readTransferDetail(Map<String, Object> param);
	Map<String, Object> readTransferSummary(Map<String, Object> param);
	
	// 인보이스내역
	Map<String, Object> read_salesInvoiceList(Map<String, Object> params);

	// 거래처 업데이트
	Map<String, Object> loadReturnCustomerUpdate(Map<String, Object> requestData);

	// 예외처리 - 예외입고내역 - detail
	Map<String, Object> readSalesExceptionInputDetail(Map<String, Object> params);

	// 예외처리 - 예외입고내역 - summary
	Map<String, Object> readSalesExceptionInputSummary(Map<String, Object> params);

	// 예외처리 - 예외출고내역
	Map<String, Object> readSalesExceptionOutputDetail(Map<String, Object> params);

	// 예외처리 - 예외출고내역
	Map<String, Object> readSalesExceptionOutputSummary(Map<String, Object> params);

	// 출고처리 - 제품출고 list
	Map<String, Object> readSalesLoadDetail(Map<String, Object> params);

	// 출고처리 - 제품출고 sum
	Map<String, Object> readSalesLoadSummary(Map<String, Object> params);

	// 출고처리 - 출고반품 list
	Map<String, Object> readSalesLoadReturnDetail(Map<String, Object> params);

	// 출고처리 - 출고반품 sum
	Map<String, Object> readSalesLoadReturnSummary(Map<String, Object> params);

	// 재고이송관리 - 창고이동처리
	Map<String, Object> readSalesStorageDetail(Map<String, Object> params);

	// 재고이송관리 - 창고이동처리
	Map<String, Object> readSalesStorageSummary(Map<String, Object> params);

	// 재고조회 - 재고조회
	Map<String, Object> readSalesStockDetail(Map<String, Object> params);

	// 재고조회 - 재고조회
	List<StockVO> readSalesStockDetailAll(Map<String, Object> param);

	// 재고조회 - 재고조회
	Map<String, Object> readSalesStockSummary(Map<String, Object> params);

	// 재고조회 - 창고별 재고현황
	Map<String, Object> readSalesStorageStockList(Map<String, Object> params);

	// 재고실사 - 상시재고실사
	Map<String, Object> readSalesStockCountAlwaysDetail(Map<String, Object> params);

	// 재고실사 - 상시재고실사
	Map<String, Object> readSalesStockCountAlwaysSummary(Map<String, Object> params);

	// 재고실사 - 말일재고실사
	Map<String, Object> readSalesStockCountLastdayDetail(Map<String, Object> params);

	// 재고실사 - 말일재고실사
	Map<String, Object> readSalesStockCountLastdaySummary(Map<String, Object> params);

	// 재고 비교 엑셀
	Map<String, Object> readSalesStockCountCompare(Map<String, Object> params);

	// 재고실사(미스캔)
	Map<String, Object> readSalesStockCountMissing(Map<String, Object> params);

	// 재고실사(미스캔) 엑셀
	List<Map<String, Object>> readSalesStockCountMissingAll(Map<String, Object> searchParams);

	// 재고실사확정 ERP
	List<StockVO> readSalesErpInterfaceSummary(Map<String, Object> paramMap);

	// 재고실사확정 ERP
	List<Map<String, Object>> readSalesErpInterfaceSummaryAll(Map<String, Object> paramMap);
}