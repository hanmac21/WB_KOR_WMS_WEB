package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.InterfaceService;

import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
@RestController
public class InterfaceController {

	@Autowired
	InterfaceService interfaceService;

	// 입고내역 인터페이스
	@PostMapping("inbound_confirm_summary") // 입고확정
	public Map<String, Object> inboundConfirm_summary(@RequestBody List<String> list) {
		return interfaceService.inbound_confirm_summary(list);
	}

	// 입고내역 인터페이스 삭제
	@PostMapping("inbound_confirm_delete") // 입고확정
	public Map<String, Object> inbound_confirm_delete(@RequestBody List<String> list) {

		return interfaceService.inbound_confirm_delete(list);
	}

	@PostMapping("/workMove_confirm")
	public Map<String, Object> workMove_confirm(@RequestBody Map<String, Object> requestData) {
		System.out.println(" -- workMove_confirm -- ");
		System.out.println(requestData);
		Map<String, Object> result = new HashMap<>();
		try {
			List<Map<String, Object>> list = (List<Map<String, Object>>) requestData.get("list");
			interfaceService.workMove_confirm(list);
			result.put("success", true);
			result.put("message", "Completed Successfully.");
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
		}

		return result;
	}

	@PostMapping("/workmove_confirm_summary")
	public Map<String, Object> workmove_confirm_summary(@RequestBody List<String> list) {
		System.out.println(" -- workmove_confirm_summary -- ");
		Map<String, Object> result = new HashMap<>();
		try {
			// List<Map<String, Object>> list = (List<Map<String, Object>>)
			// requestData.get("list");
			interfaceService.workmove_confirm_summary(list);
			result.put("success", true);
			result.put("message", "Completed Successfully.");
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
		}

		return result;
	}

	@PostMapping("/workMove_confirm_summary_cancel")
	public Map<String, Object> workMove_confirm_summary_cancel(@RequestBody List<String> list) {
		System.out.println(" -- workMove_confirm_summary_cancel -- ");
		Map<String, Object> result = new HashMap<>();
		try {
			// List<Map<String, Object>> list = (List<Map<String, Object>>)
			// requestData.get("list");
			interfaceService.workMove_confirm_summary_cancel(list);
			result.put("success", true);
			result.put("message", "Completed Successfully.");
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
		}

		return result;
	}

	// 반제품생산 인터페이스
	@PostMapping("/semiProduction_confirm_summary") // 입고확정
	public int semiProduction_confirm_summary(@RequestBody List<String> list) {
		interfaceService.semiProduction_confirm_summary(list);
		return 0;
	}

	// 반제품생산 인터페이스
	@PostMapping("/semiProduction_confirm_summary_cancel") // 입고확정
	public int semiProduction_confirm_summary_cancel(@RequestBody List<String> list) {
		interfaceService.semiProduction_confirm_summary_cancel(list);
		return 0;
	}

	// 예외입고 등록 인터페이스
	@PostMapping("/exceptionInput_confirm_summary") // 입고확정
	public int exceptionInput_confirm_summary(@RequestBody List<String> list) {
		interfaceService.exceptionInput_confirm_summary(list);
		return 0;
	}

	// 예외입고 등록 취소 인터페이스
	@PostMapping("/exceptionInput_confirm_summary_cancel") // 입고확정
	public int exceptionInput_confirm_summary_cancel(@RequestBody List<String> list) {
		interfaceService.exceptionInput_confirm_summary_cancel(list);
		return 0;
	}

	// 예외출고 등록 인터페이스
	@PostMapping("/exceptionOutput_confirm_summary") // 입고확정
	public int exceptionOutput_confirm_summary(@RequestBody List<String> list) {
		interfaceService.exceptionOutput_confirm_summary(list);
		return 0;
	}

	// 예외출고 등록 취소 인터페이스
	@PostMapping("/exceptionOutput_confirm_summary_cancel") // 입고확정
	public int exceptionOutput_confirm_summary_cancel(@RequestBody List<String> list) {
		interfaceService.exceptionOutput_confirm_summary_cancel(list);
		return 0;
	}

	// 창고이동 등록 인터페이스
	@PostMapping("/storage_confirm_summary") // 입고확정
	public int storage_confirm_summary(@RequestBody List<String> list) {
		interfaceService.storage_confirm_summary(list);
		return 0;
	}

	// 창고이동 등록 취소 인터페이스
	@PostMapping("/storage_confirm_summary_cancel") // 입고확정
	public int storage_confirm_summary_cancel(@RequestBody List<String> list) {
		interfaceService.storage_confirm_summary_cancel(list);
		return 0;
	}

	// 공정불출반납 인터페이스
	@PostMapping("/wipReturn_confirm_summary") // 입고확정
	public int wipReturn_confirm_summary(@RequestBody List<String> list) {
		interfaceService.wipReturn_confirm_summary(list);
		return 0;
	}

	// 공정불출반납 인터페이스
	@PostMapping("/wipReturn_confirm_summary_cancel") // 입고확정
	public int wipReturn_confirm_summary_cancel(@RequestBody List<String> list) {
		interfaceService.wipReturn_confirm_summary_cancel(list);
		return 0;
	}

	// 입고반납 인터페이스
	@PostMapping("/incomingReturn_confirm_summary") // 입고확정
	public int incomingReturn_confirm_summary(@RequestBody List<String> list) {
		interfaceService.incomingReturn_confirm_summary(list);
		return 0;
	}

	// 입고반납 인터페이스
	@PostMapping("/incomingReturn_confirm_summary_cancel") // 입고확정
	public int incomingReturn_confirm_summary_cancel(@RequestBody List<String> list) {
		interfaceService.incomingReturn_confirm_summary_cancel(list);
		return 0;
	}

	// 출고등록 인터페이스
	@PostMapping("/load_confirm_summary") // 출고확정
	public Map<String, Object> load_confirm_summary(@RequestBody List<String> list) {

		return interfaceService.load_confirm_summary(list);
	}

	// 출고등록 인터페이스
	@PostMapping("/load_confirm_summary_cancel") // 입고확정
	public Map<String, Object> load_confirm_summary_cancel(@RequestBody Map<String, Object> body) {

		return interfaceService.load_confirm_summary_cancel(body);
	}

	// 출고반품 취소 인터페이스
	@PostMapping("/loadreturn_confirm_detail_cancel") // 입고확정
	public int loadreturn_confirm_detail_cancel(@RequestBody List<String> list) {
		
		return interfaceService.loadreturn_confirm_detail_cancel(list);
	}

	// 출고반품 인터페이스
	@PostMapping("/loadReturn_confirm_summary") // 입고확정
	public int loadReturn_confirm_summary(@RequestBody List<String> list) {
		interfaceService.loadReturn_confirm_summary(list);
		return 0;
	}

	// 출고반품 인터페이스
	@PostMapping("/loadReturn_confirm_summary_cancel") // 입고확정
	public int loadReturn_confirm_summary_cancel(@RequestBody List<String> list) {
		interfaceService.loadReturn_confirm_summary_cancel(list);
		return 0;
	}

	// 재고실사 인터페이스
	@PostMapping("/erpInterface_confirm_summary") // 입고확정
	public int erpInterface_confirm_summary(@RequestBody Map<String, Object> param) {

		return interfaceService.erpInterface_confirm_summary(param);
	}

	// 재고실사 인터페이스
	@PostMapping("/erpInterface_confirm_summary_cancel") // 입고확정
	public int erpInterface_confirm_summary_cancel(@RequestBody Map<String, Object> param) {

		return interfaceService.erpInterface_confirm_summary_cancel(param);
	}

	@PostMapping("/stockCountPurWIPListIntf") // 재공재고실사 인터페이스
	public int stockCountPurWIPListIntf(@RequestBody Map<String, Object> list) {
		return interfaceService.stockCountPurWIPListIntf(list);
	}

	@PostMapping("/stockCountPurWIPListIntf_delete") // 재공재고실사 인터페이스 삭제
	public int stockCountPurWIPListIntf_delete(@RequestBody Map<String, Object> param) {
		return interfaceService.stockCountPurWIPListIntf_delete(param);
	}

	// 생산이동 인터페이스
	@PostMapping("/transferSummary_confirm_summary") // 입고확정
	public int transferSummary_confirm_summary(@RequestBody List<String> list) {
		interfaceService.transferSummary_confirm_summary(list);
		return 0;
	}

	// 생산이동 인터페이스
	@PostMapping("/transferSummary_confirm_summary_cancel") // 입고확정
	public int transferSummary_confirm_summary_cancel(@RequestBody List<String> list) {
		interfaceService.transferSummary_confirm_summary_cancel(list);
		return 0;
	}

	// 공장이동 인터페이스
	@PostMapping("/factoryReceiving_confirm_summary") // 확정
	public int factoryReceiving_confirm_summary(@RequestBody List<String> list) {
		interfaceService.factoryReceiving_confirm_summary(list);
		return 0;
	}

	// 공장이동 인터페이스
	@PostMapping("/factoryReceiving_confirm_summary_cancel") // 취소
	public int factoryReceiving_confirm_summary_cancel(@RequestBody List<String> list) {
		interfaceService.factoryReceiving_confirm_summary_cancel(list);
		return 0;
	}

	// 미착품 조회 품번 인터페이스
	@PostMapping("/unreceivedItemDeliveryConfirm") // 배송완료
	public int unreceivedItemDeliveryConfirm(@RequestBody List<String> list) {
		return interfaceService.unreceivedItemDeliveryConfirm(list);
	}
	
	// 미착품 조회 품번 인터페이스
	@PostMapping("/unreceivedItemDeliveryConfirmCancel") // 배송완료 취소
	public int unreceivedItemDeliveryConfirmCancel(@RequestBody List<String> list) {
		return interfaceService.unreceivedItemDeliveryConfirmCancel(list);
	}
	
	// 푸에블라-반제품생산 인터페이스
	@PostMapping("/semiProduction_confirm_cancel")
	public int semiProduction_confirm_cancel(@RequestBody List<String> list) {
		return interfaceService.semiProduction_confirm_cancel(list);
	}
	
	// 살티요-생산실적 인터페이스
	@PostMapping("/productionDetail_confirm_cancel")
	public int productionDetail_confirm_cancel(@RequestBody List<String> list) {
		return interfaceService.productionDetail_confirm_cancel(list);
	}
	
	// 생산품이동 인터페이스
	@PostMapping("/salesTransfer_confirm_cancel")
	public int salesTransfer_confirm_cancel(@RequestBody List<String> list) {
		return interfaceService.salesTransfer_confirm_cancel(list);
	}

	// 반품검사 인터페이스 삭제
	@PostMapping("returnInspection_intf_delete")
	public Map<String, Object> returnInspection_intf_delete(@RequestBody List<String> list) {

		return interfaceService.returnInspection_intf_delete(list);
	}

	// 창고검사 인터페이스 삭제
	@PostMapping("storageInspection_intf_delete")
	public Map<String, Object> storageInspection_intf_delete(@RequestBody List<String> list) {

		return interfaceService.storageInspection_intf_delete(list);
	}

	// 폐기 인터페이스 삭제
	@PostMapping("scrap_intf_delete")
	public Map<String, Object> scrap_intf_delete(@RequestBody List<String> list) {

		return interfaceService.scrap_intf_delete(list);
	}
}
