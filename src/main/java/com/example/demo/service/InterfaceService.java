package com.example.demo.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestBody;

// 🔹 **1. 서비스 인터페이스**
public interface InterfaceService {
	
	/* 입고내역 인터페이스 */
	int inbound_confirm(List<String> list);
	int inbound_confirm_cancel(List<String> list);
	Map<String, Object> inbound_confirm_summary(List<String> list);
	//Map<String, Object> inbound_confirm_summary_cancel(List<String> list);
	Map<String, Object> inbound_confirm_delete(List<String> list);
	
	/* 불출 인터페이스 */
	int workMove_confirm(List<Map<String, Object>> param);
	int workmove_confirm_summary(@RequestBody List<String> list);
	int workMove_confirm_summary_cancel(@RequestBody List<String> list);	

	/* 예외 입고 인터페이스 */
	int exceptionInput_confirm_summary(@RequestBody List<String> list);
	int exceptionInput_confirm_summary_cancel(@RequestBody List<String> list);	
	
	/* 예외 출고 인터페이스 */
	int exceptionOutput_confirm_summary(@RequestBody List<String> list);
	int exceptionOutput_confirm_summary_cancel(@RequestBody List<String> list);	
	
	/* 창고 이동 인터페이스 */
	int storage_confirm_summary(@RequestBody List<String> list);
	int storage_confirm_summary_cancel(@RequestBody List<String> list);	
	
	/* 반제품 생산 인터페이스 */
	int semiProduction_confirm_summary(@RequestBody List<String> list);
	int semiProduction_confirm_summary_cancel(@RequestBody List<String> list);
	
	/* 공정불출반납 인터페이스 */
	int wipReturn_confirm_summary(@RequestBody List<String> list);
	int wipReturn_confirm_summary_cancel(@RequestBody List<String> list);
	
	/* 입고반납 인터페이스 */
	int incomingReturn_confirm_summary(@RequestBody List<String> list);
	int incomingReturn_confirm_summary_cancel(@RequestBody List<String> list);
	
	/* 출고등록 인터페이스 */
	Map<String, Object> load_confirm_summary(@RequestBody List<String> list);
	Map<String, Object> load_confirm_summary_cancel(@RequestBody Map<String, Object> body);

	/* 출고반품 취소 인터페이스 */
	int loadreturn_confirm_detail_cancel(@RequestBody List<String> list);
	
	/* 출고반품 인터페이스 */
	int loadReturn_confirm_summary(@RequestBody List<String> list);
	int loadReturn_confirm_summary_cancel(@RequestBody List<String> list);
	
	/* 재고실사 인터페이스 */
	int erpInterface_confirm_summary(@RequestBody Map<String, Object> param);
	int erpInterface_confirm_summary_cancel(@RequestBody Map<String, Object> param);
	/* 재공 재고실사 인터페이스 */
	int stockCountPurWIPListIntf(@RequestBody Map<String,Object> list);
	int stockCountPurWIPListIntf_delete(@RequestBody Map<String, Object> param);
	
	/* 생산이동 인터페이스 */
	int transferSummary_confirm_summary(@RequestBody List<String> list);
	int transferSummary_confirm_summary_cancel(@RequestBody List<String> list);
	
	/* 공장이동 인터페이스 */
	int factoryReceiving_confirm_summary(List<String> list);
	int factoryReceiving_confirm_summary_cancel(List<String> list);
	
	/* 미착품조회 인터페이스 */
	int unreceivedItemDeliveryConfirm(List<String> list);
	int unreceivedItemDeliveryConfirmCancel(List<String> list);
	
	/* 푸에블라-반제품실적 인터페이스 */
	int semiProduction_confirm_cancel(List<String> list);
	
	/* 살티요-생산실적 인터페이스 */
	int productionDetail_confirm_cancel(List<String> list);
	
	/* 생산품이동 인터페이스 */
	int salesTransfer_confirm_cancel(List<String> list);

	/* 반품검사 인터페이스 삭제 */
	Map<String, Object> returnInspection_intf_delete(List<String> list);

	/* 창고검사 인터페이스 삭제 */
	Map<String, Object> storageInspection_intf_delete(List<String> list);

	/* 창고검사 인터페이스 삭제 */
	Map<String, Object> scrap_intf_delete(List<String> list);
}