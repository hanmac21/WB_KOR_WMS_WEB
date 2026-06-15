package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.QualityService;
import com.example.demo.vo.BomDecompositionVO;
import com.example.demo.vo.LoginVO;

import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
@RestController
public class QualityController {

	@Autowired
	QualityService qualityService;

	// 품질불량 - detail
	@PostMapping("/read_qualityDefectDetail")
	public ResponseEntity<Map<String, Object>> read_qualityDefectDetail(@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(qualityService.read_qualityDefectDetail(requestData));
	}

	@PostMapping("/read_qualityDefectDetail_all")
	public ResponseEntity<List<Map<String, Object>>> read_qualityDefectDetail_all(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(qualityService.read_qualityDefectDetail_all(requestData));
	}

	// 품질불량 - summary
	@PostMapping("/read_qualityDefectSummary")
	public ResponseEntity<Map<String, Object>> read_qualityDefectSummary(@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(qualityService.read_qualityDefectSummary(requestData));
	}

	@PostMapping("/read_qualityDefectSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_qualityDefectSummary_all(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(qualityService.read_qualityDefectSummary_all(requestData));
	}

	@PostMapping("/read_incomingInspectionList")
	public Map<String, Object> readIncomingInspectionList(@RequestBody Map<String, Object> params) {
		return qualityService.readIncomingInspectionList(params);
	}
	@PostMapping("/read_processInspectionList")
	public Map<String, Object> readprocessInspectionList(@RequestBody Map<String, Object> params) {
		return qualityService.readProcessInspectionList(params);
	}
	@PostMapping("/read_returnInspectionList")
	public Map<String, Object> readreturnInspectionList(@RequestBody Map<String, Object> params) {
		return qualityService.readReturnInspectionList(params);
	}
	@PostMapping("/read_warehouseInspectionList")
	public Map<String, Object> readwarehouseInspectionList(@RequestBody Map<String, Object> params) {
		return qualityService.readWarehouseInspectionList(params);
	}
	@PostMapping("/read_disposalList")
	public Map<String, Object> readDisposalList(@RequestBody Map<String, Object> params) {
		return qualityService.readDisposalList(params);
	}
	
	@PostMapping("/read_judgment")
	public Map<String, Object> read_judgment(@RequestBody Map<String, Object> params) {
		return qualityService.read_judgment(params);
	}
	
	@PostMapping("/read_qualityTotalList")
	public Map<String, Object> read_qualityTotalList(@RequestBody Map<String, Object> params) {
		return qualityService.read_qualityTotalList(params);
	}
	@PostMapping("/read_qualityTotalSum")
	public Map<String, Object> read_qualityTotalSum(@RequestBody Map<String, Object> params) {
		return qualityService.read_qualityTotalSum(params);
	}
	
//	// 작업장이동 Detail
//	@PostMapping("/read_qualityWorkshopDetail")
//	public ResponseEntity<Map<String, Object>> read_qualityWorkshopDetail(@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityWorkshopDetail(requestData));
//	}
//
//	@PostMapping("/read_qualityWorkshopDetail_all")
//	public ResponseEntity<List<Map<String, Object>>> read_qualityWorkshopDetail_all(@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityWorkshopDetail_all(requestData));
//	}

//	// 작업장이동 summary
//	@PostMapping("/read_qualityWorkshopSummary")
//	public ResponseEntity<Map<String, Object>> read_qualityWorkshopSummary(@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityWorkshopSummary(requestData));
//	}
//
//	@PostMapping("/read_qualityWorkshopSummary_all")
//	public ResponseEntity<List<Map<String, Object>>> read_qualityWorkshopSummary_all(@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityWorkshopSummary_all(requestData));
//	}

	// 작업장이동 Detail
	@PostMapping("/read_qualityWorkshopDetail")
	public Map<String, Object> read_qualityWorkshopDetail(@RequestBody Map<String, Object> params) {
		return qualityService.readQualityWorkshopDetail(params);
	}
	// 작업장이동 summary
	@PostMapping("/read_qualityWorkshopSummary")
	public Map<String, Object> read_qualityWorkshopSummary(@RequestBody Map<String, Object> params) {
		return qualityService.readQualityWorkshopSummary(params);
	}

	// 재고조회 list
	@PostMapping("/read_qualityStockList")
	public Map<String, Object> read_qualityStockList(@RequestBody Map<String, Object> params) {
		return qualityService.read_qualityStockList(params);
	}
	
	// 재고조회 list
	@PostMapping("/read_qualityStockSummary")
	public Map<String, Object> read_qualityStockSummary(@RequestBody Map<String, Object> params) {
		return qualityService.read_qualityStockSummary(params);
	}
	
	// 푼질 재고실사 LIST
	@PostMapping("/read_qualityStockcountList")
	public Map<String, Object> read_qualityStockcountList(@RequestBody Map<String, Object> params) {
		return qualityService.read_qualityStockcountList(params);
	}

	// 푼질 재고실사 SUM
	@PostMapping("/read_qualityStockcountSum")
	public Map<String, Object> read_qualityStockcountSum(@RequestBody Map<String, Object> params) {
		return qualityService.read_qualityStockcountSum(params);
	}
	
	// 품질 재고실사 LIST
	@PostMapping("/read_qualityStockcountListLastDay")
	public Map<String, Object> read_qualityStockcountListLastDay(@RequestBody Map<String, Object> params) {
		return qualityService.read_qualityStockcountListLastDay(params);
	}

	// 품질 재고실사 SUM
	@PostMapping("/read_qualityStockcountSumLastDay")
	public Map<String, Object> read_qualityStockcountSumLastDay(@RequestBody Map<String, Object> params) {
		return qualityService.read_qualityStockcountSumLastDay(params);
	}
	
	@PostMapping("/getBOMInfo")
	@ResponseBody
	public Map<String, Object> getBOMInfo(@RequestBody Map<String, Object> body) {
	    return qualityService.getBOMInfo(body);
	}

	// 분해
	@PostMapping("/bom/decomposition")
	@ResponseBody
	public Map<String, Object> decomposition(@RequestBody BomDecompositionVO req, HttpSession session) {
		LoginVO lvo =  (LoginVO) session.getAttribute("user");
		String loginId = lvo.getUserId();
	    // 또는 SecurityContextHolder 사용
		for (BomDecompositionVO item : req.getItems()) {
	        item.setParentItemCode(req.getParentItemCode());
	        item.setBarcode(req.getBarcode());
	        item.setLoginId(loginId);
	    }

		return qualityService.decomposition(req.getItems());
	}
	
	// 품질 거래처 불러오기 
	@GetMapping("/quality/getSupplierList")
  	public List<Map<String, Object>> getSupplierList(){
  		log.info("getSupplierList");
  		return qualityService.getSupplierList();
  	}
	
	@PostMapping("/scrap")
	public Map<String, Object> scrap(@RequestBody Map<String, Object>params){
		return qualityService.scrap(params);
	}
	
//	// 예외입고 - detail
//	@PostMapping("/read_qualityExceptionInputDetail")
//	public ResponseEntity<Map<String, Object>> read_qualityExceptionInputDetail(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityExceptionInputDetail(requestData));
//	}
//
//	@PostMapping("/read_qualityExceptionInputDetail_all")
//	public ResponseEntity<List<Map<String, Object>>> read_qualityExceptionInputDetail_all(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityExceptionInputDetail_all(requestData));
//	}

//	// 예외입고 - summary
//	@PostMapping("/read_qualityExceptionInputSummary")
//	public ResponseEntity<Map<String, Object>> read_qualityExceptionInputSummary(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityExceptionInputSummary(requestData));
//	}
//
//	@PostMapping("/read_qualityExceptionInputSummary_all")
//	public ResponseEntity<List<Map<String, Object>>> read_qualityExceptionInputSummary_all(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityExceptionInputSummary_all(requestData));
//	}

//	// 예외출고 - detail
//	@PostMapping("/read_qualityExceptionOutputDetail")
//	public ResponseEntity<Map<String, Object>> read_qualityExceptionOutputDetail(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityExceptionOutputDetail(requestData));
//	}
//
//	@PostMapping("/read_qualityExceptionOutputDetail_all")
//	public ResponseEntity<List<Map<String, Object>>> read_qualityExceptionOutputDetail_all(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityExceptionOutputDetail_all(requestData));
//	}

//	// 예외입고 - summary
//	@PostMapping("/read_qualityExceptionOutputSummary")
//	public ResponseEntity<Map<String, Object>> read_qualityExceptionOutputSummary(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityExceptionOutputSummary(requestData));
//	}
//	
//	@PostMapping("/read_qualityExceptionOutputSummary_all")
//	public ResponseEntity<List<Map<String, Object>>> read_qualityExceptionOutputSummary_all(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(qualityService.read_qualityExceptionOutputSummary_all(requestData));
//	}
	
	// 예외처리 - 예외입고내역
	@PostMapping("/read_qualityExceptionInputDetail")
	public Map<String, Object> readQualityExceptionInputDetail(@RequestBody Map<String, Object> params) {
		return qualityService.readQualityExceptionInputDetail(params);
	}
	
	// 예외처리 - 예외입고내역
	@PostMapping("/read_qualityExceptionInputSummary")
	public Map<String, Object> readQualityExceptionInputSummary(@RequestBody Map<String, Object> params) {
		return qualityService.readQualityExceptionInputSummary(params);
	}
	
	// 예외처리 - 예외출고내역
	@PostMapping("/read_qualityExceptionOutputDetail")
	public Map<String, Object> readQualityExceptionOutputDetail(@RequestBody Map<String, Object> params) {
		return qualityService.readQualityExceptionOutputDetail(params);
	}
	
	// 예외처리 - 예외출고내역
	@PostMapping("/read_qualityExceptionOutputSummary")
	public Map<String, Object> readQualityExceptionOutputSummary(@RequestBody Map<String, Object> params) {
		return qualityService.readQualityExceptionOutputSummary(params);
	}
	
	// 분해
	@PostMapping("/read_decomposition")
	public Map<String, Object> read_decomposition(@RequestBody Map<String, Object> params) {
		return qualityService.read_decomposition(params);
	}
	
	// 분해내역
	@PostMapping("/read_qualityDecompositionDetail")
	public Map<String, Object> readQualityDecompositionDetail(@RequestBody Map<String, Object> params) {
		return qualityService.readQualityDecompositionDetail(params);
	}

	// 분해폐기내역
	@PostMapping("/read_qualityDecompositionScrapDetail")
	public Map<String, Object> read_qualityDecompositionScrapDetail(@RequestBody Map<String, Object> params) {
		return qualityService.readQualityDecompositionScrapDetail(params);
	}
	
	// 폐기
	@PostMapping("/read_scrapList")
	public Map<String, Object> read_scrapList(@RequestBody Map<String, Object> params) {
		return qualityService.read_scrapList(params);
	}
	
	// 판정
	@PostMapping("/insSaltilloProductionInspection")
	public Map<String, Object> insSaltilloProductionInspection(@RequestBody Map<String, Object> params, HttpSession session) {
		LoginVO lvo =  (LoginVO) session.getAttribute("user");
		String loginId = lvo.getUserId();
		params.put("loginid", loginId);
		return qualityService.insSaltilloProductionInspection(params);
	}
	
	// 판정
	@PostMapping("/insSaltilloOKInspection")
	public Map<String, Object> insSaltilloOKInspection(@RequestBody Map<String, Object> params, HttpSession session) {
		LoginVO lvo =  (LoginVO) session.getAttribute("user");
		String loginId = lvo.getUserId();
		params.put("loginid", loginId);
		return qualityService.insSaltilloOKInspection(params);
	}
	
	// 재사용 내역
	@PostMapping("/read_qualityReusedList")
	public Map<String, Object> readQualityReusedList(@RequestBody Map<String, Object> params){
		return qualityService.readQualityReusedList(params);
	}

	@PostMapping("/read_qualityStockIOList")
	public Map<String, Object> read_qualityStockIOList(@RequestBody Map<String, Object> params) {
		return qualityService.read_qualityStockIOList(params);
	}

}
