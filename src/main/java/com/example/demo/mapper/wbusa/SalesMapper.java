package com.example.demo.mapper.wbusa;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.example.demo.vo.StockVO;
import org.springframework.stereotype.Repository;

import com.example.demo.vo.ProductVO;

@Repository
public interface SalesMapper {
	// 이송처리내역
	List<Map<String, Object>> readTransferDetail(Map<String, Object> param);
	List<Map<String, Object>> readTransferSummary(Map<String, Object> param);
	
	List<Map<String, Object>> read_salesInvoiceList(Map<String, Object> queryParams);

	// 출고반품 거래처 업데이트
	int upWmsLoadReturnCustomer(Map<String, Object> map);
	String selIfnoLoadReturn(Map<String, Object> map);
	int upIntfLoadReturnCustomer(Map<String, Object> map);
	int upErpLoadReturnCustomer(Map<String, Object> map);

	// 예외처리 - 예외입고내역 - detail
	List<Map<String, Object>> readSalesExceptionInputDetail(Map<String, Object> queryParams);

	// 예외처리 - 예외입고내역 - summary
	List<Map<String, Object>> readSalesExceptionInputSummary(Map<String, Object> queryParams);

	// 예외처리 - 예외출고내역
	List<Map<String, Object>> readSalesExceptionOutputDetail(Map<String, Object> queryParams);

	// 예외처리 - 예외출고내역
	List<Map<String, Object>> readSalesExceptionOutputSummary(Map<String, Object> queryParams);

	// 출고처리 - 제품출고
	List<Map<String, Object>> readSalesLoadDetail(Map<String, Object> queryParams);

	// 출고처리 - 제품출고
	List<Map<String, Object>> readSalesLoadSummary(Map<String, Object> queryParams);

	// 출고처리 - 출고반품
	List<Map<String, Object>> readSalesLoadReturnDetail(Map<String, Object> queryParams);

	// 출고처리 - 출고반품
	List<Map<String, Object>> readSalesLoadReturnSummary(Map<String, Object> queryParams);

	// 재고이송관리 - 창고이동처리
	List<Map<String, Object>> readSalesStorageDetail(Map<String, Object> queryParams);

	// 재고이송관리 - 창고이동처리
	List<Map<String, Object>> readSalesStorageSummary(Map<String, Object> queryParams);

	// 재고조회 - 재고조회
	List<StockVO> readSalesStockDetail(Map<String, Object> param);

	// 재고조회 - 재고조회
	List<StockVO> readSalesStockDetailAll(Map<String, Object> param);

	// 재고조회 - 재고조회
	List<StockVO> readSalesStockSummary(Map<String, Object> param);

	// 재고조회 - 창고별 재고현황
	List<Map<String, Object>> readSalesStorageStockList(Map<String, Object> queryParams);

	// 재고실사 - 상시재고실사
	List<Map<String, Object>> readSalesStockCountAlwaysDetail(Map<String, Object> queryParams);

	// 재고실사 - 상시재고실사
	List<Map<String, Object>> readSalesStockCountAlwaysSummary(Map<String, Object> queryParams);

	// 재고실사 - 말일재고실사
	List<Map<String, Object>> readSalesStockCountLastdayDetail(Map<String, Object> queryParams);

	// 재고실사 - 말일재고실사
	List<Map<String, Object>> readSalesStockCountLastdaySummary(Map<String, Object> queryParams);

	// 재고 비교 엑셀
	List<Map<String, Object>> readSalesStockCountCompare(Map<String, Object> queryParams);

	// 재고실사(미스캔)
	List<Map<String, Object>> readSalesStockCountMissing(Map<String, Object> queryParams);

	// 재고실사(미스캔) 엑셀
	List<Map<String, Object>> readSalesStockCountMissingAll(Map<String, Object> searchParam);

	// 재고실사확정 ERP
	List<StockVO> readSalesErpInterfaceSummary(Map<String, Object> paramMap);

	// 재고실사확정 ERP
	List<Map<String, Object>> readSalesErpInterfaceSummaryAll(Map<String, Object> searchParam);
}
