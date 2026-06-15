package com.example.demo.mapper.wbmex;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.example.demo.vo.LocationVO;
import com.example.demo.vo.ProductVO;
import com.example.demo.vo.RealStockNotScanVO;
import com.example.demo.vo.RealStockVO;
import com.example.demo.vo.SemiWorkVO;
import com.example.demo.vo.StockVO;
import com.example.demo.vo.WorkVO;

@Repository
public interface ProductionMapper {
	// 품명 조회
	String getItemName(String itemcode);
	// 기존 데이터 조회
	int searchStockCountWIPList(Map<String, Object> param);
	// 기존 데이터 N으로 업데이트
	void updateStockCountWIPList(Map<String, Object> param);
	// 워크 로케이션 인써트
	int insertStockCountWIPList(Map<String, Object> param);
	List<Map<String, Object>> read_stockCountWIPList(Map<String, Object> queryParams);
	
	//Total Qty
	String updateTotalQtyProductionStockCount(Map<String, Object> param);
	
//	// 반제품 생산실적 - detail
//	List<SemiWorkVO> read_semiProductionDetail(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_semiProductionDetail_all(Map<String, Object> searchParam);
//	int getSemiProductionDetailTotalCount(Map<String, Object> paramMap);
//	BigDecimal getSemiProductionDetailTotalQty(Map<String, Object> paramMap);
	
//	// 반제품 생산실적 - summary
//	List<SemiWorkVO> read_semiProductionSummary(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_semiProductionSummary_all(Map<String, Object> searchParam);
//	int getSemiProductionSummaryTotalCount(Map<String, Object> paramMap);
//	BigDecimal getSemiProductionSummaryTotalQty(Map<String, Object> paramMap);
	
	// 이송처리 - detail
//	List<SemiWorkVO> read_transferDetail(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_transferDetail_all(Map<String, Object> searchParam);
//	int getTransferDetailTotalCount(Map<String, Object> paramMap);
//	int getTransferDetailTotalQty(Map<String, Object> paramMap);
//	
//	// 이송처리 - summary
//	List<SemiWorkVO> read_transferSummary(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_transferSummary_all(Map<String, Object> searchParam);
//	int getTransferSummaryTotalCount(Map<String, Object> paramMap);
//	int getTransferSummaryTotalQty(Map<String, Object> paramMap);
	
//	// 제품 생산실적 - detail
//	List<WorkVO> read_productionDetail(Map<String, Object> paramMap);
//	int getProductionDetailTotalCount(Map<String, Object> paramMap);
//	BigDecimal getProductionDetailTotalQty(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_productionDetail_all(Map<String, Object> searchParams);
	
//	// 제품 생산실적 - summary	
//	List<WorkVO> read_productionSummary(Map<String, Object> paramMap);
//	int getProductionSummaryTotalCount(Map<String, Object> paramMap);
//	BigDecimal getProductionSummaryTotalQty(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_productionSummary_all(Map<String, Object> searchParams);
	
	// 작업장 내 예외 입고 - detail
	List<ProductVO> read_productionExceptionInputDetail(Map<String, Object> paramMap);
	int getProductionExceptionInputDetailTotalCount(Map<String, Object> paramMap);
	BigDecimal getProductionExceptionInputDetailTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionExceptionInputDetail_all(Map<String, Object> searchParams);
	
	// 작업장 내 예외 입고 - summary
	List<ProductVO> read_productionExceptionInputSummary(Map<String, Object> paramMap);
	int getProductionExceptionInputSummaryTotalCount(Map<String, Object> paramMap);
	BigDecimal getProductionExceptionInputSummaryTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionExceptionInputSummary_all(Map<String, Object> searchParams);
	
	// 작업장 내 예외 입고 - detail	
	List<ProductVO> read_productionExceptionOutputDetail(Map<String, Object> paramMap);
	int getProductionExceptionOutputDetailTotalCount(Map<String, Object> paramMap);
	BigDecimal getProductionExceptionOutputDetailTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionExceptionOutputDetail_all(Map<String, Object> searchParams);
	
	// 작업장 내 예외 출고 - summary
	List<ProductVO> read_productionExceptionOutputSummary(Map<String, Object> paramMap);
	int getProductionExceptionOutputSummaryTotalCount(Map<String, Object> paramMap);
	BigDecimal getProductionExceptionOutputSummaryTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionExceptionOutputSummary_all(Map<String, Object> searchParams);
	
	// 미적재 리스트 조회
	List<LocationVO> read_productionUnloadList(Map<String, Object> paramMap);
	int getProductionUnloadListTotalCount(Map<String, Object> paramMap);
	BigDecimal getProductionUnloadListTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionUnloadList_all(Map<String, Object> searchParams);
	
	// 재고 조회 - detail
	List<StockVO> read_productionStockDetail(Map<String, Object> paramMap);
	int getProductionStockDetailTotalCount(Map<String, Object> paramMap);
	BigDecimal getProductionStockDetailTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionStockDetail_all(Map<String, Object> searchParams);
	
	// 재고 조회 - summary
	List<StockVO> read_productionStockSummary(Map<String, Object> paramMap);
	int getProductionStockSummaryTotalCount(Map<String, Object> paramMap);
	BigDecimal getProductionStockSummaryTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionStockSummary_all(Map<String, Object> searchParams);
	
	// 재고 조회 - summary
	List<StockVO> read_productionStockInfo(Map<String, Object> paramMap);
	int getProductionStockInfoTotalCount(Map<String, Object> paramMap);
	BigDecimal getProductionStockInfoTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionStockInfo_all(Map<String, Object> searchParams);
	// 재고 실사 조회
	List<RealStockVO> read_productionStockCountList(Map<String, Object> paramMap);
	List<RealStockVO> read_productionStockCountSummary(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionStockCountList_all(Map<String, Object> searchParam);
	List<Map<String, Object>> read_productionStockCountSummary_all(Map<String, Object> searchParam);
	int getProductionStockCountListTotalCount(Map<String, Object> paramMap);
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
	
	int deleteProductionRealStockNotScan(Map<String, Object> param);
	int insertProductionRealStockNotScan(List<RealStockNotScanVO> stockList);
	
	// 재고 실사 ERP
	List<ProductVO> read_productionErpInterfaceSummary(Map<String, Object> paramMap);
	List<Map<String, Object>> read_productionErpInterfaceSummary_all(Map<String, Object> searchParams);
	
	// 재공재고실사 작업장별 조회
	List<RealStockVO> read_stockCountWIPWrokList(Map<String, Object> paramMap);
	
	// 재공재고현황
	List<Map<String, Object>> read_productionWipStockList(Map<String, Object> queryParams);
	
	// 생산실적 - 생산실적 
	List<Map<String, Object>> readProductionDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readProductionSummary(Map<String, Object> queryParams);

	// 생산실적 - 반제품생산 
	List<Map<String, Object>> readSemiProductionDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readSemiProductionSummary(Map<String, Object> queryParams);
	
}
