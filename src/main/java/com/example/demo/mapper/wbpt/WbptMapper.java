package com.example.demo.mapper.wbpt;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.example.demo.vo.*;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface WbptMapper {
	// List<UserInfoVO> readUser();

	List<UserInfoVO> read_userInfo(Map<String, Object> paramMap);

	// List<Map<String, Object>> read_userInfo_all(Map<String, Object> searchParam);
	int getUserInfoTotalCount(Map<String, Object> paramMap);

	List<StockVO> read_stock();

	List<RealStockVO> read_realStock(Map<String, Object> paramMap);

	List<String> read_realStock_dates(Map<String, Object> paramMap);

	List<RealStockVO> read_realStockSummary(Map<String, Object> paramMap);

	int getRealStockTotalCount(Map<String, Object> paramMap);

	int getRealStockSummaryTotalCount(Map<String, Object> paramMap);

	// 재고실사 - 말일
	List<RealStockVO> read_stockCountLastDayDetail(Map<String, Object> paramMap);
	int getStockCountLastDayDetailTotalCount(Map<String, Object> paramMap);
	BigDecimal getStockCountLastDayDetailTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_stockCountLastDayDetail_all(Map<String, Object> searchParams);
	
	// 재고실사 - 말일
	List<RealStockVO> read_stockCountLastDaySummary(Map<String, Object> paramMap);
	int getStockCountLastDaySummaryTotalCount(Map<String, Object> paramMap);
	BigDecimal getStockCountLastDaySummaryTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> read_stockCountLastDaySummary_all(Map<String, Object> searchParams);
	
	List<ProductVO> readProduct();

	List<ProductVO> readProductPaged(Map<String, Object> params);

	int readProductCount(Map<String, Object> params);
	
	List<ProductVO> read_productInfo(Map<String, Object> queryParams);

	List<CustomerVO> readCustomer();

	List<ProductVO> readInboundCkd();

	List<WarehouseVO> readWarehouse();

	List<ProductVO> readBom();

	List<Map<String, Object>> read_magam();

	int magamClose(Map<String, Object> param);

	int magamCancel(Map<String, Object> param);

	List<Map<String, Object>> read_lastDay();

	int setLastDay(Map<String, Object> params);
	
	int updateLastDay(Map<String, Object> params);
	
	// 팔레트 정보
	PalletVO palletInfo(String barcode);

	Map<String, Object> read_modal_user_access(Map<String, Object> param);

//	Map<String, Object> read_users_access(List<String> param);

	List<Map<String, Object>> read_roles_for_users(Map<String, Object> p);
	List<Map<String, Object>> read_role_menus(List<String> roleIds);
	List<Map<String, Object>> read_users_effective_menu_state(List<String> userIds);

	int update_user_menu_access(Map<String, Object> param);

	int updateOtherRolesN(Map<String, Object> param);
	int mergeManager(Map<String, Object> param);
	int deleteOverride(Map<String, Object> param);
	List<String> getRolesY(Map<String, Object> map);
	int updateUserRolesN(Map<String, Object> map);
	int mergeUserRole(Map<String, Object> map);
	List<String> getRoleMenus(Map<String, Object> map2);
	int deleteOverrideMenus(Map<String, Object> map);
	int mergeOverrideY(Map<String, Object> map);
	int mergeOverrideN(Map<String, Object> map);

	List<String> view_main_menu_user_access(String id);

	int update_user_factory_access(Map<String, Object> param);

	int loginCheck_factoryAccess(Map<String, Object> param);

	int update_user_department(Map<String, Object> param);

	int update_user_factory(Map<String, Object> param);
	

	// 사용자 등록 기능 그룹
	int check_wms_account(Map<String, Object> param);

	int user_menu_accessCheck(Map<String, Object> param);

	int insert_user_account(Map<String, Object> param);

	int insert_user_account_menu_access(Map<String, Object> param);

	int update_user_validationCheck(Map<String, Object> param);

	int update_user_pass(Map<String, Object> param);

	int update_user_pass_menu_access(Map<String, Object> param);

	// 🔥 새로 추가: BOM 페이징 메서드
	List<Map<String, Object>> getBomsPaged(Map<String, Object> params);

	int getBomTotalCount(ProductVO searchVal);

	int insertWarehouse(Map<String, Object> insertParam);

	int updateWarehouse(Map<String, Object> updateParam);

	int deleteWarehouse(List<String> iidList);

	List<Map<String, Object>> read_realStock_all(Map<String, Object> searchParam);

	List<Map<String, Object>> read_realStockSummary_all(Map<String, Object> searchParam);

	/**
	 * RACK 목록 조회
	 */
	List<Map<String, Object>> selectRackList(Map<String, Object> params);

	List<Map<String, Object>> selectWorkRackList(Map<String, Object> params);

	/**
	 * RACK 기본 정보 조회
	 */
	Map<String, Object> selectRackInfo(Map<String, Object> params);

	Map<String, Object> selectWorkRackInfo(Map<String, Object> params);

	/**
	 * RACK 상세 포지션 정보 조회
	 */
	List<Map<String, Object>> selectRackDetail(Map<String, Object> params);

	List<Map<String, Object>> selectWorkRackDetail(Map<String, Object> params);

	/**
	 * 전체 창고 통계 조회
	 */
	Map<String, Object> selectWarehouseStatistics();

	List<ProductVO> readOutbound();

//	List<PalletVO> readPallet(Map<String, Object> map);

	List<Map<String, Object>> readPalletList(Map<String, Object> queryParams);

	int pprintYnUp(List<String> pbarcodeList);

	int palletDel(String pbarcode);

	List<WorkMoveVO> read_workMove();

	List<RealStockVO> read_realStock();

	List<ProductVO> groupInbound(List<String> list);

	int inbound_intf_pm(Map<String, Object> map);

	int inbound_intf_qc(Map<String, Object> map);

	String selectIfnoIn(String date8);

	int inbound_confirm(Map<String, Object> map);

	int inbound_confirm_summary_cancel(Map<String, Object> map);

	int inbound_confirm_summary(Map<String, Object> map);

	int workMove_confirm_if(Map<String, Object> param);

	// int workMove_confirm_real_if(Map<String, Object> param);

	int workMove_confirm_updateWorkMove(Map<String, Object> param);

	int workMove_confirm_summary_cancel_if(Map<String, Object> param);

	// int workMove_confirm_summary_cancel_real_if(Map<String, Object> param);

	int workMove_confirm_cancel_updateWorkMove_summary(Map<String, Object> param);

	String selectWmskey_workMove(Map<String, Object> param);

	String selectWmskey_incoming(Map<String, Object> param);

	int workMove_confirm_updateWorkMove_summary(Map<String, Object> param);

	int workMove_confirm_if_cancel(Map<String, Object> param);

	int workMove_confirm_real_if_cancel(Map<String, Object> param);

	int workMove_confirm_updateWorkMove_cancel(Map<String, Object> param);

	int inbound_confirm_cancel(Map<String, Object> map);

	int inbound_intf_pm_cancel(Map<String, Object> map);

	int inbound_intf_qc_cancel(Map<String, Object> map);

	int inbound_confirm_delete(Map<String, Object> map);
	void inbound_intf_qc_delete(Map<String, Object> map);
	void inbound_intf_pm_delete(Map<String, Object> map);

	int userAccess(Map<String, Object> param);

	int userBlock(Map<String, Object> param);

	int userDelete(Map<String, Object> param);

	int userDelete_menuAccess(Map<String, Object> param);

	Map<String, Object> loginCheck(Map<String, Object> idParam);

	int checkLocationRow(Map<String, String> param);

	int checkWorkLocationRow(Map<String, String> param);

	// List<Map<String, Object>> unloadedList();

	// 미적재 리스트
	List<Map<String, Object>> unloadedList(Map<String, Object> params);

	int unloadedListCount(Map<String, Object> params); // 전체 개수 조회 메서드 추가

	// 예외출고 등록
	void insertExceptionOutput(Map<String, Object> insertParam);

	String getCustName(String custcode);

	void updateUnloadedBarcode(Map<String, Object> insertParam);

	List<StockVO> read_stock_summary(Map<String, Object> map);

	List<Map<String, Object>> selectLocationDetail(String location);

	List<Map<String, Object>> selectWorkLocationDetail(String location);

	int getWipSummaryCount(Map<String, Object> params);

	List<Map<String, Object>> read_stockinfoInclude(String barcode);

	List<Map<String, Object>> read_stockInfoInclude_total(String itemcode);

	// 불출 - detail
	List<WorkMoveVO> read_wipDetail(Map<String, Object> paramMap);

	List<Map<String, Object>> read_wipDetail_all(Map<String, Object> searchParam);

	int getWipDetailTotalCount(Map<String, Object> paramMap);

	BigDecimal getWipDetailTotalQty(Map<String, Object> paramMap);

	List<WorkMoveVO> read_wipSummary(Map<String, Object> paramMap);

	List<Map<String, Object>> read_wip_summary_all(Map<String, Object> searchParam);

	int getWipSummaryTotalCount(Map<String, Object> paramMap);

	BigDecimal getWipSummaryTotalQty(Map<String, Object> params);

//	List<Map<String, Object>> getWipSummaryList(Map<String, Object> params);

	int getIncomingSummaryCount(Map<String, Object> params);

//	List<Map<String, Object>> getIncomingSummaryList(Map<String, Object> params);
	List<Map<String, Object>> read_incomingListSummary_all(Map<String, Object> searchParam);

	// 재고 - detail
	List<StockVO> read_stockDetail(Map<String, Object> paramMap);

	//List<Map<String, Object>> read_stockDetail_all(Map<String, Object> searchParam);
	List<StockVO> read_stockDetail_all(Map<String, Object> searchParam);

	List<StockVO> read_stockSnapDetail(Map<String, Object> paramMap);
	List<StockVO> read_stockSnapDetail_all(Map<String, Object> searchParam);
	
	// 재고 - detail
	List<StockVO> read_stockSummary(Map<String, Object> paramMap);
	
	//List<Map<String, Object>> read_stockDetail_all(Map<String, Object> searchParam);
	List<StockVO> read_stockSummary_all(Map<String, Object> searchParam);


	int getStockDetailTotalCount(Map<String, Object> paramMap);

	BigDecimal getStockDetailTotalQty(Map<String, Object> paramMap);

	// 재고 - 수불부
	List<StockVO> read_stockMovement(Map<String, Object> paramMap);

	List<Map<String, Object>> read_stockMovement_all(Map<String, Object> searchParam);

	int getStockMovementTotalCount(Map<String, Object> paramMap);

	BigDecimal getStockMovementTotalQty(Map<String, Object> paramMap);

	int check_stockMovement(String itemcode);

	// 공장 이동
	// List<FactoryMoveVO> read_factoryComplete(Map<String, Object> paramMap);
	List<Map<String, Object>> read_factoryComplete_all(Map<String, Object> searchParam);

	int getFactoryCompleteTotalCount(Map<String, Object> paramMap);

	// 재고 - summary
	//List<Map<String, Object>> read_stockSummary(Map<String, Object> paramMap);

	//List<Map<String, Object>> read_stockSummary_all(Map<String, Object> searchParam);

	int getStockSummaryTotalCount(Map<String, Object> paramMap);

	Map<String, Object> getStockSummaryTotalQty(Map<String, Object> paramMap);

//	// 공정불출반납 - detail
//	List<WipReturnVO> read_wipReturnDetail(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_wipReturnDetail_all(Map<String, Object> searchParam);
//
//	int getWipReturnDetailTotalCount(Map<String, Object> paramMap);
//
//	BigDecimal getWipReturnDetailTotalQty(Map<String, Object> paramMap);

//	// 공정불출반납 - summary
//	List<WipReturnVO> read_wipReturnSummary(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_wipReturnSummary_all(Map<String, Object> searchParam);
//
//	int getWipReturnSummaryTotalCount(Map<String, Object> paramMap);
//
//	BigDecimal getWipReturnSummaryTotalQty(Map<String, Object> paramMap);

	// 피딩 - detail
	List<WipReturnVO> read_feedingDetail(Map<String, Object> paramMap);

	List<Map<String, Object>> read_feedingDetail_all(Map<String, Object> searchParam);

	int getFeedingDetailTotalCount(Map<String, Object> paramMap);

	BigDecimal getFeedingDetailTotalQty(Map<String, Object> paramMap);

	// 피딩 - summary
	List<WipReturnVO> read_feedingSummary(Map<String, Object> paramMap);

	List<Map<String, Object>> read_feedingSummary_all(Map<String, Object> searchParam);

	int getFeedingSummaryTotalCount(Map<String, Object> paramMap);

	BigDecimal getFeedingSummaryTotalQty(Map<String, Object> paramMap);

	// 언팩 detail
	List<UnpackVO> read_unpackDetail(Map<String, Object> paramMap);

	List<Map<String, Object>> read_unpackDetail_all(Map<String, Object> searchParam);

	int getUnpackDetailTotalCount(Map<String, Object> paramMap);

	BigDecimal getUnpackDetailTotalQty(Map<String, Object> paramMap);

	// 언팩 detail
	List<UnpackVO> read_unpackBalance(Map<String, Object> paramMap);

	List<Map<String, Object>> read_unpackBalance_all(Map<String, Object> searchParam);

	int getUnpackBalanceTotalCount(Map<String, Object> paramMap);

	BigDecimal getUnpackBalanceTotalQty(Map<String, Object> paramMap);

	// 언팩 summary
	List<UnpackVO> read_unpackSummary(Map<String, Object> paramMap);

	List<Map<String, Object>> read_unpackSummary_all(Map<String, Object> searchParam);

	int getUnpackSummaryTotalCount(Map<String, Object> paramMap);

	BigDecimal getUnpackSummaryTotalQty(Map<String, Object> paramMap);

//	// 출고 detail
//	List<LoadVO> read_loadDetail(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_loadDetail_all(Map<String, Object> searchParam);
//
//	int getLoadDetailTotalCount(Map<String, Object> paramMap);
//
//	BigDecimal getLoadDetailTotalQty(Map<String, Object> paramMap);
//
//	// 출고 summary
//	List<LoadVO> read_loadSummary(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_loadSummary_all(Map<String, Object> searchParam);
//
//	int getLoadSummaryTotalCount(Map<String, Object> paramMap);
//
//	BigDecimal getLoadSummaryTotalQty(Map<String, Object> paramMap);

	List<String> selectCustomer();

	int loadCustomerUpdate(Map<String, Object> map);

//	// 예외입고처리 - detail
//	List<ProductVO> read_exceptionInputDetail(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_exceptionInputDetail_all(Map<String, Object> searchParam);
//
//	int getExceptionInputDetailTotalCount(Map<String, Object> paramMap);

//	// 예외입고처리 - sum
//	List<ProductVO> read_exceptionInputSummary(Map<String, Object> paramMap);
//
//	int getExceptionInputSummaryTotalCount(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_exceptionInputSummary_all(Map<String, Object> searchParam);

//	// 예외입고처리 - detail
//	List<ProductVO> read_exceptionOutputDetail(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_exceptionOutputDetail_all(Map<String, Object> searchParam);
//
//	int getExceptionOutputDetailTotalCount(Map<String, Object> paramMap);

//	// 예외입고처리 - sum
//	List<ProductVO> read_exceptionOutputSummary(Map<String, Object> paramMap);
//
//	int getExceptionOutputSummaryTotalCount(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_exceptionOutputSummary_all(Map<String, Object> searchParam);

//	// 입고반품 - detail
//	List<ProductVO> read_incomingReturnDetail(Map<String, Object> paramMap);
//
//	int getIncomingReturnDetailTotalCount(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_incomingReturnDetail_all(Map<String, Object> searchParam);

//	// 입고반품 - detail
//	List<ProductVO> read_incomingReturnSummary(Map<String, Object> paramMap);
//
//	int getIncomingReturnSummaryTotalCount(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_incomingReturnSummary_all(Map<String, Object> searchParam);

//	// 출고반품 - detail
//	List<ProductVO> read_loadReturnDetail(Map<String, Object> paramMap);
//
//	int getLoadReturnDetailTotalCount(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_loadReturnDetail_all(Map<String, Object> searchParam);

//	// 출고반품 - detail
//	List<ProductVO> read_loadReturnSummary(Map<String, Object> paramMap);
//
//	int getLoadReturnSummaryTotalCount(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_loadReturnSummary_all(Map<String, Object> searchParam);

	// TOTAL QTY
	String updateTotalQtyPalletList(Map<String, Object> param);

	String updateTotalQtyIncomingListDetail(Map<String, Object> param);

//	String updateTotalQtyIncomingListSummary(Map<String, Object> param);
	String updateTotalQtyStockCount(Map<String, Object> param);

	String updateTotalQtyExceptionInput(Map<String, Object> param);

	String updateTotalQtyExceptionOutput(Map<String, Object> param);

//	String updateTotalQtyIncomingReturn(Map<String, Object> param);

//	String updateTotalQtyLoadReturn(Map<String, Object> param);

	// Interface Max VAL
	String selectIfno_workMove_if(String date);

	String selectIfno_workMove_real_if(String date);

	String selectIfno_semiProduction_sub_if(String date);

	String selectIfno_semiProduction_input_if(String date);

	String selectIfno_exceptionInput_if(String date);

	String selectIfno_exceptionOutput_if(String date);

	String selectIfno_storage_if(String date);

	String selectIfno_wipReturn_if(String date);

	String selectIfno_incomingReturn_if(String date);

	String selectIfno_loadSummary_if(String date);

	String selectIfno_loadReturnSummary_if(String date);

	String selectIfno_stockCountSummary_if(String date);

	String selectIfno_wipStockstockCountSummary_if(String date);

	String selectIfno_transferSummary_if(String date);

	String selectIfno_factoryReceiving_if(String today);
	
	String selectIfno_unreceivedItemDelivery_if(String date);

	// UPDATE WMS DB
	int semiProduction_confirm_summary_updateYn(Map<String, Object> param);

	int semiProduction_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int exceptionInput_confirm_summary_updateYn(Map<String, Object> param);

	int exceptionInput_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int exceptionOutput_confirm_summary_updateYn(Map<String, Object> insertParam);

	int exceptionOutput_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int storage_confirm_summary_updateYn(Map<String, Object> param);

	int storage_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int wipReturn_confirm_summary_updateYn(Map<String, Object> param);

	int wipReturn_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int incomingReturn_confirm_summary_updateYn(Map<String, Object> param);

	int incomingReturn_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int load_confirm_summary_updateYn(Map<String, Object> param);

	int load_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int loadReturn_confirm_summary_updateYn(Map<String, Object> param);

	int loadReturn_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int erpInterface_confirm_summary_updateYn(Map<String, Object> param);

	int erpInterface_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int transfer_confirm_summary_updateYn(Map<String, Object> param);

	int transfer_confirm_summary_cancel_updateYn(Map<String, Object> param);

	int factoryReceiving_confirm_summary_updateYn(Map<String, Object> param);

	int factoryReceiving_confirm_summary_cancel_updateYn(Map<String, Object> insertParam);
	
	int semiProduction_confirm_cancel_updateYn(Map<String, Object> insertParam);
	
	int production_confirm_cancel_updateYn(Map<String, Object> insertParam);

	int salesTransfer_confirm_cancel_updateYn(Map<String, Object> insertParam);


	// Interface TASK
	int semiProduction_confirm_summary_sub_if(Map<String, Object> param);

	List<Map<String, Object>> semiProduction_confirm_count(Map<String, Object> insertParam);

	int semiProduction_confirm_summary_input_if(Map<String, Object> param);

	int semiProduction_confirm_summary_cancel_sub_if(Map<String, Object> param);

	int semiProduction_confirm_summary_cancel_input_if(Map<String, Object> param);

	int exceptionInput_confirm_summary_if(Map<String, Object> param);

	int exceptionInput_confirm_summary_cancel_if(Map<String, Object> param);

	int exceptionOutput_confirm_summary_if(Map<String, Object> param);

	int exceptionOutput_confirm_summary_cancel_if(Map<String, Object> param);

	int storage_confirm_summary_if(Map<String, Object> param);

	int storage_confirm_summary_cancel_if(Map<String, Object> param);

	int wipReturn_confirm_summary_if(Map<String, Object> param);

	int wipReturn_confirm_summary_cancel_if(Map<String, Object> param);

	int incomingReturn_confirm_summary_if(Map<String, Object> param);

	int incomingReturn_confirm_summary_cancel_if(Map<String, Object> param);

	int load_confirm_summary_if(Map<String, Object> param);

	int load_confirm_summary_cancel_if(Map<String, Object> param);

	int loadReturn_confirm_summary_if(Map<String, Object> param);

	int loadReturn_confirm_summary_cancel_if(Map<String, Object> param);

	int erpInterface_confirm_summary_if(Map<String, Object> param);
	int erpInterface_confirm_summary_if_delete(Map<String, Object> param);
	int erpInterface_confirm_summary_mm_if(Map<String, Object> param);
	int erpInterface_confirm_summary_st_if(Map<String, Object> param);

	int stockCountPurWIPListIntf_if(Map<String, Object> param);
	int stockCountPurWIPListIntf_if_delete(Map<String, Object> param);
	int stockCountPurWIPListIntf_delete(Map<String, Object> param);

	int erpInterface_confirm_summary_cancel_if(Map<String, Object> param);

	int transfer_confirm_summary_if(Map<String, Object> param);

	int transfer_confirm_summary_cancel_if(Map<String, Object> param);

	int factoryReceiving_confirm_summary_if(Map<String, Object> param);

	int factoryReceiving_confirm_summary_cancel_if(Map<String, Object> insertParam);

	int deleteWorksub(Map<String, Object> insertParam);
	int deleteWorkInput(Map<String, Object> insertParam);
	int deleteEntersub(Map<String, Object> insertParam);

	// WMS_KEY SELECT DB
	String selectWmskey_semiProduction(Map<String, Object> param);

	String selectWmskey_exceptionInputSummary(Map<String, Object> param);

	String selectWmskey_exceptionOutputSummary(Map<String, Object> param);

	String selectWmskey_storageSummary(Map<String, Object> Param);

	String selectWmskey_wipReturnSummary(Map<String, Object> param);

	String selectWmskey_incomingReturnSummary(Map<String, Object> param);

	String selectWmskey_loadSummary(Map<String, Object> param);

	String selectWmskey_loadReturnSummary(Map<String, Object> param);

	String selectWmskey_stockCountSummary(Map<String, Object> param);

	String selectWmskey_transferSummary(Map<String, Object> param);

	String selectWmskey_factoryReceiving(Map<String, Object> param);
	
	String selectWmskey_unreceivedItemDelivery(Map<String, Object> param);

//	// 창고간이동 - detail
//	List<StockMoveVO> read_storageDetail(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_storageDetail_all(Map<String, Object> searchParam);
//
//	int getStorageDetailTotalCount(Map<String, Object> paramMap);
//
//	BigDecimal getStorageDetailTotalQty(Map<String, Object> paramMap);

//	// 창고간이동 - summary
//	List<StockMoveVO> read_storageSummary(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_storageSummary_all(Map<String, Object> searchParam);
//
//	int getStorageSummaryTotalCount(Map<String, Object> paramMap);
//
//	BigDecimal getStorageSummaryTotalQty(Map<String, Object> paramMap);

//	// 공장간이동 - detail
//	List<FactoryMoveVO> read_factoryDetail(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_factoryDetail_all(Map<String, Object> searchParam);
//
//	int getFactoryDetailTotalCount(Map<String, Object> paramMap);
//
//	BigDecimal getFactoryDetailTotalQty(Map<String, Object> paramMap);

//	// 공장간이동 - detail sending
//	List<FactoryMoveVO> read_factoryDetailSending(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_factoryDetailSending_all(Map<String, Object> searchParam);
//
//	int getFactoryDetailSendingTotalCount(Map<String, Object> paramMap);
//
//	BigDecimal getFactoryDetailSendingTotalQty(Map<String, Object> paramMap);

//	// 공장간이동 - detail receiving
//	List<FactoryMoveVO> read_factoryDetailReceiving(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_factoryDetailReceiving_all(Map<String, Object> searchParam);
//
//	int getFactoryDetailReceivingTotalCount(Map<String, Object> paramMap);
//
//	BigDecimal getFactoryDetailReceivingTotalQty(Map<String, Object> paramMap);

//	// 공장간이동 - summary
//	List<FactoryMoveVO> read_factorySummary(Map<String, Object> paramMap);
//
//	List<Map<String, Object>> read_factorySummary_all(Map<String, Object> searchParam);
//
//	int getFactorySummaryTotalCount(Map<String, Object> paramMap);
//
//	int getFactorySummaryTotalQty(Map<String, Object> paramMap);

	// 이송 후 재고확인
	List<FactoryMoveVO> read_factoryTransferCheck(Map<String, Object> paramMap);

	int getFactoryTransferCheckTotalCount(Map<String, Object> paramMap);

	List<Map<String, Object>> read_factoryTransferCheck_all(Map<String, Object> searchParam);

	// 입고 detail
	List<ProductVO> read_incomingDetail(Map<String, Object> paramMap);

	List<Map<String, Object>> read_incomingDetail_all(Map<String, Object> searchParam);

	int getIncomingDetailTotalCount(Map<String, Object> paramMap);

	BigDecimal getIncomingDetailTotalQty(Map<String, Object> paramMap);

	// 입고 Summary
	List<ProductVO> read_incomingSummary(Map<String, Object> paramMap);

	int getIncomingSummaryTotalCount(Map<String, Object> paramMap);

	BigDecimal getIncomingSummaryTotalQty(Map<String, Object> paramMap);

	List<String> selectSupplier(); // 공급사 데이터

	int incommingSupplierUpdate(Map<String, Object> map);

	void buyrequestsubIfSupplierUpdate(Map<String, Object> map);

	void buyrequestsubSupplierUpdate(Map<String, Object> map);

	void entersubIfSupplierUpdate(Map<String, Object> map);

	void entersubSupplierUpdate(Map<String, Object> map);


	void deliverysubIfSupplierUpdate(Map<String, Object> map);

	void deliverysubSupplierUpdate(Map<String, Object> map);

	// 재고 정보
	List<StockVO> read_stockInfo(Map<String, Object> paramMap);

	List<Map<String, Object>> read_stockInfo_all(Map<String, Object> searchParam);

	int getStockInfoTotalCount(Map<String, Object> paramMap);

	BigDecimal getStockInfoTotalQty(Map<String, Object> paramMap);

	// 재고 이력
	List<StockVO> read_stockHistory(Map<String, Object> paramMap);

	List<Map<String, Object>> read_stockHistory_all(Map<String, Object> searchParam);

	int getStockHistoryTotalCount(Map<String, Object> paramMap);

	List<String> stock_history_barcodeCheck(String barcode);

	BigDecimal getStockHistoryTotalQty(Map<String, Object> paramMap);

	// 재고 비교
	List<StockVO> read_stockCountCompare(Map<String, Object> paramMap);

	List<Map<String, Object>> read_stockCountCompare_all(Map<String, Object> searchParam);

	int getStockCountCompareTotalCount(Map<String, Object> paramMap);

	List<Map<String, Object>> readStockCountCompare_detail_stock(Map<String, Object> param);

	List<Map<String, Object>> readStockCountCompare_detail_realStock(Map<String, Object> param);

	Map<String, Object> getStockCountCompareTotal(Map<String, Object> param);

	List<Map<String, Object>> searchUnpackBarcodes(Map<String, Object> param);

	List<Map<String, Object>> readStockCountCompare_detail_compareDetail(Map<String, Object> param);

	String getStockCountDate(Map<String, Object> paramMap);
	// 재고 비교
	List<StockVO> read_stockCountMissing(Map<String, Object> paramMap);

	List<Map<String, Object>> read_stockCountMissing_all(Map<String, Object> searchParam);

	int getStockCountMissingTotalCount(Map<String, Object> paramMap);

	BigDecimal getStockCountMissingTotalQty(Map<String, Object> paramMap);

	List<Map<String, Object>> readStockCountMissing_detail_stock(Map<String, Object> param);

	List<Map<String, Object>> readStockCountMissing_detail_realStock(Map<String, Object> param);
	// Map<String, Object> getStockCountMissingTotal(Map<String, Object> param);

	// realStockNotScan테이블
	int deleteRealStockNotScan(Map<String, Object> param);

	int insertRealStockNotScan(List<RealStockNotScanVO> stockList);

	// erp interface - detail
	List<ProductVO> read_erpInterfaceDetail(Map<String, Object> paramMap);

	List<Map<String, Object>> read_erpInterfaceDetail_all(Map<String, Object> searchParam);

	int getErpInterfaceDetailTotalCount(Map<String, Object> paramMap);

	BigDecimal getErpInterfaceDetailTotalQty(Map<String, Object> paramMap);

	// erp interface - summary
	List<StockVO> read_erpInterfaceSummary(Map<String, Object> paramMap);

	List<Map<String, Object>> read_erpInterfaceSummary_all(Map<String, Object> searchParam);

	int getErpInterfaceSummaryTotalCount(Map<String, Object> paramMap);

	BigDecimal getErpInterfaceSummaryTotalQty(Map<String, Object> paramMap);

	// erp 마감 체크
	int selectLockCnt(Map<String, Object> map);

	// erp 입고 인터페이스 삭제 사전체크
	int selectIncomingCloseCnt(Map<String, Object> map);

	int selectIncomingBuyCnt(Map<String, Object> map);

	int selectIncomingLaterCnt(Map<String, Object> map);

	int selectIncomingDeleteTargetCnt(Map<String, Object> map);

	// erp 출고 인터페이스 삭제대상 체크
	int selectLoadCloseCnt(Map<String, Object> map);

	int selectLoadDeleteTargetCnt(Map<String, Object> insertParam);

	int selectLoadLaterCnt(Map<String, Object> insertParam);

	int selectLoadReturnLaterCnt(Map<String, Object> map);

	int selectLoadReturnDeleteTargetCnt(Map<String, Object> map);

	int selectIncomingReturnLaterCnt(Map<String, Object> map);

	int selectIncomingReturnDeleteTargetCnt(Map<String, Object> map);

	// 단가 등록 체크
	int selectUnitPrice(Map<String, Object> map);

//	// 공정불출반납 - detail
//	List<WipReturnVO> read_unloadList(Map<String, Object> paramMap);
//	List<Map<String, Object>> read_unloadList_all(Map<String, Object> searchParam);
//	int getUnloadListTotalCount(Map<String, Object> paramMap);
//	BigDecimal getUnloadListTotalQty(Map<String, Object> paramMap);
	
	// 미적재 리스트
	List<Map<String, Object>> readUnloadList(Map<String, Object> queryParams);

	// 바코드 히스토리 모달창
	Map<String, Object> search_stockInfo(String barcode);	
	List<Map<String, Object>> show_stockHistory(String barcode);
	Map<String, Object> show_stockHistory_sangho(String custCode);

	// 대시보드
	List<Map<String, Object>> dashboard_stock();

	int dashboard_stock_totalCount();

	// 생산 대시보드 값
	Map<String, Object> dashboard_production_summary_work(Map<String, Object> param);
	List<Map<String, Object>> dashboard_production_hourly_work(Map<String, Object> param);
	List<Map<String, Object>> dashboard_production_line_work(Map<String, Object> param);
	List<Map<String, Object>> dashboard_production_detail_work(Map<String, Object> param);
	
	// 생산 대시보드 값
	Map<String, Object> dashboard_production_summary(Map<String, Object> param);
	List<Map<String, Object>> dashboard_production_hourly(Map<String, Object> param);
	List<Map<String, Object>> dashboard_production_line(Map<String, Object> param);
	List<Map<String, Object>> dashboard_production_detail(Map<String, Object> param);

	String getKind(Map<String, Object> param);

	// 파트라벨 목록 조회
	List<String> selectpbBarcode(String barcode);

	// lastStatus 값 이전으로 업데이트
	int updateLaststatusPallet(Map<String, Object> param);

	int updateLaststatusPart(Map<String, Object> param);

	// 적재된 팔레트 바코드 살리기
	void updateLocationBarcodeByY(Map<String, Object> param);

	// 로케이션 바코드 살리기
	void updateWorkLocationBarcodeByY(Map<String, Object> param);
	
	// ===== 검증 관련 메서드 =====
	/// WbmexMapper_3 파일에 작성
	// 후처리 검증
	Integer checkPostProcessingForLocation(Map<String, Object> param);

	int checkHistory(Map<String, Object> param);

	int checkOutboundAndLocation(Map<String, Object> param);

	int checkWorkmoveAndLocation(Map<String, Object> param);

	int checkInboundAndLocation(Map<String, Object> param);

	int checkSendingAndReceiving(Map<String, Object> param);

	int checkStorageMovement(Map<String, Object> param);

	// 마감 검증
	int checkMagamInput(Map<String, Object> param);

	// ===== 삭제 관련 메서드 =====
	/// WbmexMapper_3 파일에 작성
	// 예외 입고 삭제
	int updateExceptionInput(Map<String, Object> param);

	int updateExceptionInputInLocation(Map<String, Object> param);

	int updateExceptionInputInStock(Map<String, Object> param);

	// 예외 출고 삭제
	int updateExceptionOutput(Map<String, Object> param);

	int updateExceptionOutputInStock(Map<String, Object> param);

	// 공정 불출 삭제
	int updateWip(Map<String, Object> param);

	int updateWipInStock(Map<String, Object> param);

	int updateWipInWorkStock(Map<String, Object> param);

	// 공정 불출 반납 삭제
	int updateWipReturn(Map<String, Object> param);

	int updateWipReturnInLocation(Map<String, Object> param);

	int updateWipReturnInStock(Map<String, Object> param);

	int updateWipReturnInWorkStock(Map<String, Object> param);

	// 입고 삭제
	int updateIncoming(Map<String, Object> param);

	int updateIncomingInLocation(Map<String, Object> param);

	int updateIncomingInStock(Map<String, Object> param);

	// 입고 반품 삭제
	int updateInboundByY(Map<String, Object> param);

	int updateIncomingReturn(Map<String, Object> param);

	int updateIncomingReturnInStock(Map<String, Object> param);

	// 출고 삭제
	int updateLoad(Map<String, Object> param);

	int updateLoadInStock(Map<String, Object> param);

	// 출고 반납 삭제
	int updateLoadReturn(Map<String, Object> param);

	int updateLoadReturnInLocation(Map<String, Object> param);

	int updateLoadReturnInStock(Map<String, Object> param);

	// 공장 출고 삭제
	int updateSending(Map<String, Object> param);

	int updateSendingInLocation(Map<String, Object> param);

	int updateSendingInStock(Map<String, Object> param);

	// 공장 입고 삭제
	int updateReceiving(Map<String, Object> param);

	int updateReceivingInLocation(Map<String, Object> param);

	int updateReceivingInStock(Map<String, Object> param);

	// 창고 이동 삭제
	int updateStorage(Map<String, Object> param);

	int updateStorageInLocation(Map<String, Object> param);

	int updateStorageInStock(Map<String, Object> param);
	
	// 생산품 이동 삭제
	int updateProductMove(Map<String, Object> param);

	int updateProductMoveInStock(Map<String, Object> param);

	int insertProductMoveIntfDelete(Map<String, Object> param);		// 인터페이스 삭제

	int updateRtInsp(@Param("iids") List<String> iids, @Param("loginid") String loginid);
	int updateWhInsp(@Param("iids") List<String> iids, @Param("loginid") String loginid);
	int updateConditionChange(@Param("iids") List<String> iids, @Param("loginid") String loginid);
	
	// 재고 등록
	void insertStock(Map<String, Object> param);

	// LastStatus 업데이트
	void updateLaststatus_pallet(Map<String, Object> barcode);

	List<String> read_palletInBarcodeList(String barcode);

	void updateLaststatus_barcode(Map<String, Object> barcode);

	// 재고조정 location N으로 업데이트
	void adjustment(Map<String, Object> insertParam);

	void adjustmentInBackup(Map<String, Object> insertParam);

	// 품번 정보
	List<Map<String, Object>> read_itemMaster(Map<String, Object> param);

	List<Map<String, Object>> readUnreceivedItem(Map<String, Object> param);
	List<Map<String, Object>> readUnreceivedItemCodes(Map<String, Object> queryParams);

	List<Map<String, Object>> readFactoryUnreceived(Map<String, Object> param);
	List<Map<String, Object>> readFactoryComplete(Map<String, Object> param);
	List<Map<String, Object>> readFactoryUnreceivedSummary(Map<String, Object> param);
	List<Map<String, Object>> readFactoryCompleteSummary(Map<String, Object> param);

	List<Map<String, Object>> readWorkMoveUnreceived(Map<String, Object> param);

	List<Map<String, Object>> readWorkMoveComplete(Map<String, Object> param);

	// 입고조회 - 입고내역
	List<Map<String, Object>> readIncomingDetail(Map<String, Object> param);

	List<Map<String, Object>> readIncomingSummary(Map<String, Object> param);

	// 공정불출 - 독립불출내역
	List<Map<String, Object>> readWipDetail(Map<String, Object> param);

	List<Map<String, Object>> readWipSummary(Map<String, Object> param);

	// 언팩 - sum
	List<Map<String, Object>> readUnpackSummary(Map<String, Object> param);

	// 재공재고실사
	List<Map<String, Object>> readPurchaseStockCountWIPList(Map<String, Object> param);

	// 기존 데이터 조회
	int searchStockCountWIPList(Map<String, Object> param);
	// 기존 데이터 N으로 업데이트
	//void updateStockCountWIPList(Map<String, Object> param);
	
	// 기존 데이터 삭제
	int deleteStockCountWIPList(Map<String, Object> param);
	// 워크 로케이션 인써트
	int insertStockCountWIPList(Map<String, Object> param);
	// T_ST_CHANGESUB 데이터 존재 여부 확인
	int checkStChangesub(Map<String, Object> param);

	List<Map<String, Object>> read_stockTotal(Map<String, Object> queryParams);
	
	List<Map<String, Object>> readStockStation(Map<String, Object> param);

	// 창고 마감 여부
	int isStorageClosed(String yearMonth);
	
	// 작업장 마감 여부
	int isWorkshopClosed(String yearMonth);

	// 입고인터페이스 삭제 0039
	int inbound_intf_0039_worksub_cancel(Map<String, Object> map);
	int inbound_intf_0039_workinput_cancel(Map<String, Object> map);
	int inbound_intf_0039_entersub_cancel(Map<String, Object> map);

	// 사용자 정보 가져오기
	Map<String, Object> getUserInfo(String id);

	// 사용자 정보 업데이트
	int updateUserInfo(Map<String, Object> params);

	// 현재 비밀번호 검색
	String selectUserPassword(String id);

	// 비밀번호 변경
	int updateUserPassword(Map<String, Object> upd);

	int updateUserMenuAccessPassword(Map<String, Object> upd);
	
	int unreceivedItemDeliveryConfirm(Map<String, Object> insertParam);
	
	
	List<Map<String, Object>> read_purchaseStockDetail(Map<String, Object> param);

	List<Map<String, Object>> read_purchaseStorageStockList(Map<String, Object> queryParams);
	
	List<Map<String, Object>> selectInvoiceIntfList(Map<String, Object> param);

	int save_productInfo_changed(Map<String, Object> r);

	List<Map<String, Object>> read_consignee();
	int create_consignee(Map<String, Object> params);
	int update_consignee(Map<String, Object> params);
	int delete_consignee(Map<String, Object> params);

	
	int restoreDeliveredIntf(Map<String, Object> param);
	
	List<Map<String, Object>> restoreDeliveredIntfList(Map<String, Object> param);

	List<Map<String, Object>> readLoadDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readLoadSummary(Map<String, Object> queryParams);

	List<Map<String, Object>> readStorageDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readStorageSummary(Map<String, Object> queryParams);

	List<Map<String, Object>> readStorageSendingDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readStorageReceivingDetail(Map<String, Object> queryParams);

	List<Map<String, Object>> readStorageComplete(Map<String, Object> queryParams);
	List<Map<String, Object>> readStorageUnreceived(Map<String, Object> queryParams);

	List<StockMoveVO> read_storageTransferCheck(Map<String, Object> paramMap);
	int getStorageTransferCheckTotalCount(Map<String, Object> paramMap);
	List<Map<String, Object>> read_storageTransferCheck_all(Map<String, Object> searchParam);

	List<Map<String, Object>> readFactorySendingDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readFactoryReceivingDetail(Map<String, Object> queryParams);

	List<Map<String, Object>> readIncomingReturnDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readIncomingReturnSummary(Map<String, Object> queryParams);

	List<Map<String, Object>> readLoadReturnDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readLoadReturnSummary(Map<String, Object> queryParams);

	List<Map<String, Object>> readExceptionInputDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readExceptionInputSummary(Map<String, Object> queryParams);

	List<Map<String, Object>> readExceptionOutputDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readExceptionOutputSummary(Map<String, Object> queryParams);

	List<Map<String, Object>> readWipReturnDetail(Map<String, Object> queryParams);
	List<Map<String, Object>> readWipReturnSummary(Map<String, Object> queryParams);

	void erpInterface_confirm_summary_st_if_delete(Map<String, Object> map);

	
	int stockCountPurWIPListIntf_if_storage_delete(Map<String, Object> deleteParam);

	void erpInterface_confirm_summary_mm_if_delete(Map<String, Object> deleteParam);

	int stockCountSorage_if(Map<String, Object> insertParam);

	int loadReturn_confirm_detail_cancel_updateYn(Map<String, Object> insertParam);

	int loadReturn_confirm_detail_cancel_if(Map<String, Object> insertParam);

	int loadDateUpdate(Map<String, Object> map);

	// 재고조정 - ERP 재고 반영 (erpInterface_confirm_summary 후처리)
	int mergeStockChangeSub(Map<String, Object> param);
	int updateStockChangeSubInit(Map<String, Object> param);
	int updateStockChangeSubQty1(Map<String, Object> param);
	int updateStockChangeSubQty2(Map<String, Object> param);
	int updateStockChangeSubQty3(Map<String, Object> param);

	// 재공재고 조정 - 재공재고실사 인터페이스 후처리 (stockCountPurWIPListIntf)
   int mergeWipStockChangeSub(Map<String, Object> param);
   int updateWipStockChangeSubInit(Map<String, Object> param);
   int updateWipStockChangeSubQty1(Map<String, Object> param);
   int updateWipStockChangeSubQty2(Map<String, Object> param);
   int updateWipStockChangeSubQty3(Map<String, Object> param);

	List<Map<String, Object>> readExceptionInputDetailStockCount(Map<String, Object> queryParams);	
	List<Map<String, Object>> readExceptionOutputDetailStockCount(Map<String, Object> queryParams);

	List<StockVO> read_stockCountAdjust(Map<String, Object> paramMap);
	List<Map<String, Object>> read_stockCountAdjust_all(Map<String, Object> searchParam);
	int getStockCountAdjustTotalCount(Map<String, Object> paramMap);
	BigDecimal getStockCountAdjustTotalQty(Map<String, Object> paramMap);
	List<Map<String, Object>> readStockCountAdjust_detail_stock(Map<String, Object> param);
	List<Map<String, Object>> readStockCountAdjust_detail_realStock(Map<String, Object> param);

	List<Map<String, Object>> readValidationDetail(Map<String, Object> queryParams);

	Map<String, Object> getItemInfoSpec(String s);

	void stockMoveProduct(Map<String, Object> insertParam);

	void insertStockProduct(Map<String, Object> insertParam);

	void updateUnloadedBarcodeMoveProduct(Map<String, Object> insertParam);
    String getErpItemcode(String oitemcode);

	int stockClosePro(Map<String, Object> closeMap);

	int insertLoadReturnInspection(Map<String, Object> param);
	int insertWarehouseInspection(Map<String, Object> param);

	String getBarcodeSeq(Map<String, Object> param);
	int makeBarcode(Map<String, Object> param);
	int insOutputReturn(Map<String, Object> param);
	int conditionChange(Map<String, Object> param);
	int basicLocation(Map<String, Object> param);
	int insInspection(Map<String, Object> param);
	int removeBarcode(Map<String, Object> param);

	int unreceivedItemDeliveryComplete(Map<String, Object> iParam);

	int unreceivedItemDeliveryCompleteCancel(Map<String, Object> iParam);

	List<Map<String, Object>> readConditionChange(Map<String, Object> queryParams);

	void returnInspection_intf_delete1(Map<String, Object> map);
	void returnInspection_intf_delete2(Map<String, Object> map);
	void returnInspection_intf_wms_delete(Map<String, Object> map);

	void storageInspection_intf_delete(Map<String, Object> map);
	void storageInspection_intf_wms_delete(Map<String, Object> map);

	void scrap_intf_delete(Map<String, Object> map);
	void scrap_intf_wms_delete(Map<String, Object> map);

	void insertExceptionOutputN(Map<String, Object> insertParam);
}
