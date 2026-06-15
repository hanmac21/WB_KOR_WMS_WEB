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

	/**
	 * RACK 목록 조회
	 * 
	 * @param storage    저장소 필터 ('default', 'saltillo', 'puebla' 등)
	 * @param factory    공장 필터 ('default', 'factory_1', 'factory_2' 등)
	 * @param searchType 검색 타입 ('default', 'searchVal-car', 'searchVal-product')
	 * @param keyword    검색 키워드
	 * @return RACK 목록 데이터
	 */
	List<Map<String, Object>> getRackList(String storage, String factory, String searchType, String keyword);

	/**
	 * RACK 상세 정보 조회
	 * 
	 * @param rackId  RACK ID ('A', 'B', 'C', 'D' 등)
	 * @param storage 저장소 필터
	 * @param factory 공장 필터
	 * @return RACK 상세 정보 (모듈 및 포지션 포함)
	 */
	Map<String, Object> getRackDetail(String rackId, String storage, String factory);

	List<WorkMoveVO> read_workMove();
	
	List<RealStockVO> read_realStock(Map<String, Object> paramMap);
	List<String> read_realStock_dates(Map<String, Object> paramMap);
	List<RealStockVO> read_realStockSummary(Map<String, Object> paramMap);
	
	Map<String, Object> read_stockCountLastDayDetail(Map<String, Object> requestData);
	List<Map<String, Object>> read_stockCountLastDayDetail_all(Map<String, Object> requestData);

	Map<String, Object> read_stockCountLastDaySummary(Map<String, Object> requestData);
	List<Map<String, Object>> read_stockCountLastDaySummary_all(Map<String, Object> requestData);
	
	int getRealStockTotalCount(Map<String, Object> paramMap);
	int getRealStockSummaryTotalCount(Map<String, Object> paramMap);

	int checkLocationRow(Map<String, String> param);
	
	int checkWorkLocationRow(Map<String, String> request);

	Map<String, Object> unloadedList(int page, int size, String factory, String storage) throws Exception;
	
	void insertExcpetionOutput(@RequestBody Map<String, Object> data);
	
	void adjustment(@RequestBody Map<String, Object> data);
	
	Map<String, Object> locationDetail(String barcode);
	
	List<Map<String,Object>> read_stockinfoInclude(String barcode);
	List<Map<String,Object>> read_stockInfoInclude_total(String itemcode);
	
	// 불출 - detail
	List<WorkMoveVO> read_wipDetail(Map<String, Object> paramMap);
	List<Map<String, Object>> read_wipDetail_all(Map<String, Object> searchParams);

	List<WorkMoveVO> read_wipSummary(Map<String, Object> paramMap);
	List<Map<String, Object>> read_wip_summary_all(Map<String, Object> searchParams);

	List<Map<String, Object>> read_incomingListSummary_all(Map<String, Object> searchParams);

	
	List<Map<String, Object>> read_realStock_all(Map<String, Object> searchParam);
	List<Map<String, Object>> read_realStockSummary_all(Map<String, Object> searchParam);
	
	// 재고 - detail
	List<StockVO> read_stockDetail(Map<String, Object> paramMap);
	List<StockVO> read_stockDetail_all(Map<String, Object> searchParam);

	List<StockVO> read_stockSnapDetail(Map<String, Object> param);
	List<StockVO> read_stockSnapDetail_all(Map<String, Object> param);

	List<StockVO> read_stockSummary(Map<String, Object> paramMap);
	List<StockVO> read_stockSummary_all(Map<String, Object> searchParam);

	// 재고 - 수불부
	List<StockVO> read_stockMovement(Map<String, Object> paramMap);
	List<Map<String, Object>> read_stockMovement_all(Map<String, Object> searchParam);
	int getStockMovementTotalCount(Map<String, Object> paramMap);
	int check_stockMovement(String itemcode);
	
	// 공장 이동 완료
	List<Map<String, Object>> read_factoryComplete_all(Map<String, Object> searchParams);

	// 피딩 - detail
	List<WipReturnVO> read_feedingDetail(Map<String, Object> paramMap);
	int getFeedingDetailTotalCount(Map<String, Object> paramMap);
	BigDecimal getFeedingDetailTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_feedingDetail_all(Map<String, Object> searchParams);
	
	// 피딩 - summary
	List<WipReturnVO> read_feedingSummary(Map<String, Object> paramMap);
	int getFeedingSummaryTotalCount(Map<String, Object> paramMap);
	BigDecimal getFeedingSummaryTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_feedingSummary_all(Map<String, Object> searchParams);
	
	// 언팩 - detail
	List<UnpackVO> read_unpackDetail(Map<String, Object> paramMap);
	int getUnpackDetailTotalCount(Map<String, Object> paramMap);
	BigDecimal getUnpackDetailTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_unpackDetail_all(Map<String, Object> searchParams);
	
	// 언팩 잔량
	List<UnpackVO> read_unpackBalance(Map<String, Object> paramMap);
	int getUnpackBalanceTotalCount(Map<String, Object> paramMap);
	BigDecimal getUnpackBalanceTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_unpackBalance_all(Map<String, Object> searchParams);

	// 언팩
	List<Map<String, Object>> read_unpackSummary_all(Map<String, Object> searchParams);

	List<String> selectCustomer();
	Map<String, Object> loadCustomerUpdate(Map<String, Object> map);

	//TOTAL QTY
	String updateTotalQtyPalletList(Map<String, Object> param);
	String updateTotalQtyIncomingListDetail(Map<String, Object> param);
	String updateTotalQtyStockCount(Map<String, Object> param);
	
	// 이송 후 재고확인
	List<FactoryMoveVO> read_factoryTransferCheck(Map<String, Object> paramMap);
	List<Map<String, Object>> read_factoryTransferCheck_all(Map<String, Object> searchParams);
	int getFactoryTransferCheckTotalCount(Map<String, Object> paramMap);

	// 입고 detail
	List<ProductVO> read_incomingDetail(Map<String, Object> paramMap);
	List<Map<String, Object>> read_incomingDetail_all(Map<String, Object> searchParams);

	// 입고 Summary
	List<ProductVO> read_incomingSummary(Map<String, Object> paramMap);
	Map<String, Object> incommingSupplierUpdate(Map<String, Object> requestData);
	List<String> selectSupplier();

	// 재고 정보
	List<StockVO> read_stockInfo(Map<String, Object> paramMap);
	List<Map<String, Object>> read_stockInfo_all(Map<String, Object> searchParams);
	int getStockInfoTotalCount(Map<String, Object> paramMap);
	BigDecimal getStockInfoTotalQty(Map<String, Object> paramMap);
	
	// 재고 히스토리
	List<StockVO> read_stockHistory(Map<String, Object> paramMap);
	List<Map<String, Object>> read_stockHistory_all(Map<String, Object> searchParams);
	int getStockHistoryTotalCount(Map<String, Object> paramMap);
	List<String> stock_history_barcodeCheck(String barcode);
	BigDecimal getStockHistoryTotalQty(Map<String, Object> paramMap);
	
	// 재고 비교
	List<StockVO> read_stockCountCompare(Map<String, Object> paramMap);
	List<Map<String, Object>> read_stockCountCompare_all(Map<String, Object> searchParams);
	int getStockCountCompareTotalCount(Map<String, Object> paramMap);
	Map<String, Object> read_stockCountCompare_detail(Map<String, Object> searchParams);
	Map<String, Object> getStockCountCompareTotal(Map<String, Object> searchParams);

	// 언팩바코드 모달용
	Map<String, Object> searchUnpackBarcodes(Map<String, Object> param);


	
	String getStockCountDate(Map<String, Object> paramMap);
	// 재고 누락
	List<StockVO> read_stockCountMissing(Map<String, Object> paramMap);
	List<Map<String, Object>> read_stockCountMissing_all(Map<String, Object> searchParams);
	Map<String, Object> read_stockCountMissing_detail(Map<String, Object> searchParams);

	Map<String, Object> realStockNotScan(Map<String, Object> param);

	// erp interface - detail
	List<ProductVO> read_erpInterfaceDetail(Map<String, Object> param);
	List<Map<String, Object>> read_erpInterfaceDetail_all(Map<String, Object> searchParams);
	int getErpInterfaceDetailTotalCount(Map<String, Object> paramMap);
	BigDecimal getErpInterfaceDetailTotalQty(Map<String, Object> paramMap);

	// erp interface - summary
	List<StockVO> read_erpInterfaceSummary(Map<String, Object> paramMap);
	List<Map<String, Object>> read_erpInterfaceSummary_all(Map<String, Object> searchParams);

	// 미적재 리스트
	Map<String, Object> readUnloadList(Map<String, Object> params);

	// 바코드 히스토리 모달창
	Map<String,Object> search_stockInfo(String barcode);
	List<Map<String, Object>> show_stockHistory(String barcode);
	Map<String,Object> show_stockHistory_sangho(String custCode);

	// 대시보드
	Map<String, Object> read_dashboard_stock(Map<String, Object> param);
	Map<String, Object> read_production_dashboard(Map<String, Object> param);

	
	// 데이터 삭제
	Map<String, Object> deleteByKind(String kind, Map<String, Object> body);

	//구매
	Map<String, Object> readUnreceivedItem(Map<String, Object> param);
	Map<String, Object> readUnreceivedItemCodes(Map<String, Object> params);
	Map<String, Object> readFactoryUnreceived(Map<String, Object> param);
	Map<String, Object> readFactoryComplete(Map<String, Object> param);
	Map<String, Object> readFactoryUnreceivedSummary(Map<String, Object> param);
	Map<String, Object> readFactoryCompleteSummary(Map<String, Object> param);

	Map<String, Object> readWorkMoveUnreceived(Map<String, Object> param);
	Map<String, Object> readWorkMoveComplete(Map<String, Object> param);

	// 입고조회 - 입고내역 
	Map<String, Object> readIncomingDetail(Map<String, Object> param);
	Map<String, Object> readIncomingSummary(Map<String, Object> param);
	
	// 입고조회 - 입고반품
	Map<String, Object> readIncomingReturnDetail(Map<String, Object> params);
	Map<String, Object> readIncomingReturnSummary(Map<String, Object> params);
	
	// 공정불출 - 독립불출내역
	Map<String, Object> readWipDetail(Map<String, Object> param);
	Map<String, Object> readWipSummary(Map<String, Object> param);
	
	// 공정불출 - 공정불출반납
	Map<String, Object> readWipReturnDetail(Map<String, Object> params);
	Map<String, Object> readWipReturnSummary(Map<String, Object> params);

	// 출고처리 - 제품출고
	Map<String, Object> readLoadDetail(Map<String, Object> params);
	Map<String, Object> readLoadSummary(Map<String, Object> params);
	
	// 출고처리 - 출고반품
	Map<String, Object> readLoadReturnDetail(Map<String, Object> params);
	Map<String, Object> readLoadReturnSummary(Map<String, Object> params);
	
	// 재고이송관리 - 창고이동처리
	Map<String, Object> readStorageDetail(Map<String, Object> params);
	Map<String, Object> readStorageSummary(Map<String, Object> params);
	
	// 재고이송관리 - 창고이동출고
	Map<String, Object> readStorageSendingDetail(Map<String, Object> params);
	// 재고이송관리 - 창고이동입고
	Map<String, Object> readStorageReceivingDetail(Map<String, Object> params);
	// 재고이송관리 - 창고간이송(완료)
	Map<String, Object> readStorageComplete(Map<String, Object> params);
	// 재고이송관리 - 창고간이송(미도착)
	Map<String, Object> readStorageUnreceived(Map<String, Object> params);

	List<StockMoveVO> read_storageTransferCheck(Map<String, Object> paramMap);
	int getStorageTransferCheckTotalCount(Map<String, Object> paramMap);
	List<Map<String, Object>> read_storageTransferCheck_all(Map<String, Object> searchParams);

	// 재고이송관리 - 공장이동출고
	Map<String, Object> readFactorySendingDetail(Map<String, Object> params);
	// 재고이송관리 - 공장이동입고
	Map<String, Object> readFactoryReceivingDetail(Map<String, Object> params);

	// 예외처리 - 예외입고내역
	Map<String, Object> readExceptionInputDetail(Map<String, Object> params);
	Map<String, Object> readExceptionInputSummary(Map<String, Object> params);
	
	// 예외처리 - 예외출고내역
	Map<String, Object> readExceptionOutputDetail(Map<String, Object> params);
	Map<String, Object> readExceptionOutputSummary(Map<String, Object> params);
	
	// 언팩 - sum
	Map<String, Object> readUnpackSummary(Map<String, Object> param);
	
	// 재공재고 실사 
	Map<String, Object> readPurchaseStockCountWIPList(Map<String, Object> param);
	
	// 재공재고 실사 - SAVE
	int insertStockCountWIPList_purchase(List<Map<String, Object>> list, String factory, String workshop, String loginid, String date);

	Map<String, Object> read_stockTotal(Map<String, Object> params);
	
	Map<String, Object> readStockStation(Map<String, Object> param);
	
	Map<String, Object> read_purchaseStockDetail(Map<String, Object> param);
	
	Map<String, Object> read_purchaseStorageStockList(Map<String, Object> params);

	int loadDateUpdate(Map<String, Object> map);
	
	Map<String, Object> readExceptionInputDetailStockCount(Map<String, Object> params);
	Map<String, Object> readExceptionOutputDetailStockCount(Map<String, Object> params);

	// 재고 누락
	List<StockVO> read_stockCountAdjust(Map<String, Object> paramMap);
	List<Map<String, Object>> read_stockCountAdjust_all(Map<String, Object> searchParams);
	Map<String, Object> read_stockCountAdjust_detail(Map<String, Object> searchParams);

	Map<String, Object> readValidationDetail(Map<String, Object> params);

	int deleteStockCountWIPList(Map<String, Object> param);

	int moveProduct(Map<String, Object> param);

	// 엑셀 업로드
	List<Map<String, Object>> excelUpload(MultipartFile file) throws IOException;

	// 출고반품 검사 등록
	int inspectionReturn(List<Map<String, Object>> list, String loginid, String source);
	// 창고 검사 등록
	int insertWarehouseInspection(List<Map<String, Object>> list, String loginid, String source);

	Map<String, Object> updateRtInsp(Map<String, Object> body);
	Map<String, Object> updateWhInsp(Map<String, Object> body);
	Map<String, Object> updateConditionChange(Map<String, Object> req);

	Map<String, Object> readConditionChange(Map<String, Object> params);

}