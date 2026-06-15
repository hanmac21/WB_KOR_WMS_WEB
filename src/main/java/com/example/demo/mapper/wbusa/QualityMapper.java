package com.example.demo.mapper.wbusa;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.example.demo.vo.BomDecompositionVO;
import com.example.demo.vo.DefectiveVO;
import com.example.demo.vo.ProductVO;
import com.example.demo.vo.StockVO;
import com.example.demo.vo.WorkMoveVO;

@Repository
public interface QualityMapper {

	// 품질 불량 - detail
	List<DefectiveVO> read_qualityDefectDetail(Map<String, Object> paramMap);
	List<Map<String, Object>> read_qualityDefectDetail_all(Map<String, Object> searchParam);
	int getQualityDefectDetailTotalCount(Map<String, Object> paramMap);
	BigDecimal getQualityDefectDetailTotalQty(Map<String, Object> paramMap);

	// 품질 불량 - summary
	List<DefectiveVO> read_qualityDefectSummary(Map<String, Object> paramMap);
	List<Map<String, Object>> read_qualityDefectSummary_all(Map<String, Object> searchParams);
	int getQualityDefectSummaryTotalCount(Map<String, Object> paramMap);
	BigDecimal getQualityDefectSummaryTotalQty(Map<String, Object> paramMap);

	List<Map<String, Object>> readIncomingInspectionList(Map<String, Object> param);
	List<Map<String, Object>> readProcessInspectionList(Map<String, Object> param);
	List<Map<String, Object>> readReturnInspectionList(Map<String, Object> param);
	List<Map<String, Object>> readWarehouseInspectionList(Map<String, Object> param);
	List<Map<String, Object>> readDisposalList(Map<String, Object> param);
	List<Map<String, Object>> read_judgment(Map<String, Object> param);

	List<Map<String, Object>> read_qualityTotalList(Map<String, Object> param);
	List<Map<String, Object>> read_qualityTotalSum(Map<String, Object> param);

	// 작업장이동
	List<Map<String, Object>> readQualityWorkshopDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readQualityWorkshopSummary(Map<String, Object> queryParams);

	// 품질재고조회 list
	List<Map<String, Object>> read_qualityStockList(Map<String, Object> queryParams);
	// 품질재고조회 sum
	List<Map<String, Object>> read_qualityStockSummary(Map<String, Object> queryParams);

	// 품질재고실사 list
	List<Map<String, Object>> read_qualityStockcountList(Map<String, Object> queryParams);

	// 품질재고실사 sum
	List<Map<String, Object>> read_qualityStockcountSum(Map<String, Object> queryParams);

	// 품질재고실사 list
	List<Map<String, Object>> read_qualityStockcountListLastDay(Map<String, Object> queryParams);

	// 품질재고실사 sum
	List<Map<String, Object>> read_qualityStockcountSumLastDay(Map<String, Object> queryParams);

	List<Map<String, Object>> getBOMInfo(Map<String, Object> p);
	// 분해작업
	int insertDecomposition(Map<String, Object> map);
	// 바코드가 작업장에 있는지 확인
	int checkWorkLocation(String barcode);
	// 창고 useyn = 'N'
	int updateLocationUseyn(String barcode);
	// 작업장 useyn = 'N'
	int updateWorkLocationUseyn(String barcode);
	// 바코드 useyn = 'N'
	int updateBarcodeUseyn(String barcode);
	// 레드케이지에 있는지 확인
	int checkRedcage(String barcode);
	// 작업장에 있는지 확인
	int checkWorklocation(String barcode);
	// 레드케이지 -> 작업장 이동
	int moveRedcageToWorklocation(Map<String, Object> transferMap);
	// 바코드 정보 가져오기
	Map<String, Object> getBarcodeInfo(String barcode);
	// inspection테이블 postyn= 'N'
	int inspectionPostY(String barcode);

	// 폐기
	int scrapInspection(Map<String, Object> map);
	int scrapLocation(Map<String, Object> map);
	int scrapBarcode(Map<String, Object> map);

	// 예외처리 - 예외입고내역
	List<Map<String, Object>> readQualityExceptionInputDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readQualityExceptionInputSummary(Map<String, Object> queryParams);

	// 예외처리 - 예외출고내역
	List<Map<String, Object>> readQualityExceptionOutputDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readQualityExceptionOutputSummary(Map<String, Object> queryParams);

	List<Map<String, Object>> read_decomposition(Map<String, Object> queryParams);
	List<Map<String, Object>> readQualityDecompositionDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readQualityDecompositionScrapDetail(Map<String, Object> queryParams);

	List<Map<String, Object>> read_scrapList(Map<String, Object> queryParams);

	// 바코드 순번 가져오기
	Integer getMaxBarcodeSeq(Map<String, Object> param);
	// 바코드 순번 insert
	int insertBarcodeMax(Map<String, Object> param);
	// 바코드 순번 update
	int updateBarcodeMax(Map<String, Object> param);
	// 바코드 생성
	int makeBarcode(Map<String, Object> param);
	// location insert
	int insertLocation(Map<String, Object> param);
	// inspection insert
	int insInspection(Map<String, Object> param);

	// 거래처 불러오기
	List<Map<String, Object>> getSupplierList();

	void insWorkMove(Map<String, Object> transferMap);
	int updateBarcodeN(Map<String, Object> param);
	List<Map<String, Object>> getBomList(Map<String, Object> param);
	int insInspectionPostynY(Map<String, Object> param);

	List<Map<String, Object>> readQualityReusedList(Map<String, Object> queryParams);

	// 품질 수불 재고조회
    List<Map<String, Object>> read_qualityStockIOList(Map<String, Object> queryParams);
}
