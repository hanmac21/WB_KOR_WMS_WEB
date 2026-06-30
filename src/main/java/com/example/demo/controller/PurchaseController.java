	package com.example.demo.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.PurchaseService;
import com.example.demo.vo.FactoryMoveVO;
import com.example.demo.vo.LoadVO;
import com.example.demo.vo.ProductVO;
import com.example.demo.vo.RealStockVO;
import com.example.demo.vo.StockMoveVO;
import com.example.demo.vo.StockVO;
import com.example.demo.vo.UnpackVO;
import com.example.demo.vo.WipReturnVO;
import com.example.demo.vo.WorkMoveVO;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@Controller
@Slf4j
@RestController
public class PurchaseController {

	@Autowired
	PurchaseService purchaseService;

	@PostMapping("/read_realStock")
	public ResponseEntity<Map<String, Object>> read_realStock(@RequestBody Map<String, Object> requestData) {
		try {
			// 검색 조건 파라미터 추출
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);

			// 검색 조건 Map 생성
			Map<String, Object> paramMap = new HashMap<>();
			if (searchParams != null) {
				paramMap.putAll(searchParams);
			}

			// 페이징 정보 추가
			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);

			// 서비스 호출
			List<RealStockVO> resultList = purchaseService.read_realStock(paramMap);
			int totalCount = purchaseService.getRealStockTotalCount(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_realStock_dates")
	public ResponseEntity<List<String>> read_realStock_dates(@RequestBody Map<String, Object> requestData) {
		Map<String, Object> paramMap = new HashMap<>();
		if (requestData != null) {
			paramMap.putAll(requestData);
		}
		List<String> dates = purchaseService.read_realStock_dates(paramMap);
		return ResponseEntity.ok(dates);
	}

	@PostMapping("/read_realStockSummary")
	public ResponseEntity<Map<String, Object>> read_realStockSummary(@RequestBody Map<String, Object> requestData) {
		try {
			// 검색 조건 파라미터 추출
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);

			// 검색 조건 Map 생성
			Map<String, Object> paramMap = new HashMap<>();
			if (searchParams != null) {
				paramMap.putAll(searchParams);
			}

			// 페이징 정보 추가
			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);

			// 서비스 호출
			List<RealStockVO> resultList = purchaseService.read_realStockSummary(paramMap);
			int totalCount = purchaseService.getRealStockSummaryTotalCount(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_realStock_all")
	public ResponseEntity<List<Map<String, Object>>> read_realStock_all(@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_realStock_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	@PostMapping("/read_realStockSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_realStockSummary_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_realStockSummary_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	@PostMapping("/updateTotalQty_stockCount")
	public String updateTotalQtyStockCount(@RequestBody Map<String, Object> param) {
		return purchaseService.updateTotalQtyStockCount(param);
	}

	// 입고처리 - 입고내역 List
	@PostMapping("/read_incomingDetail")
	public Map<String, Object> readIncomingDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readIncomingDetail(params);
	}

	// 입고처리 - 입고내역 Sum.
	@PostMapping("/read_incomingSummary")
	public Map<String, Object> readIncomingSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readIncomingSummary(params);
	}

	// 출고처리 - 제품출고 list
	@PostMapping("/read_loadDetail")
	public Map<String, Object> readLoadDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readLoadDetail(params);
	}

	// 출고처리 - 제품출고 sum
	@PostMapping("/read_loadSummary")
	public Map<String, Object> readLoadSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readLoadSummary(params);
	}

	@PostMapping("/read_validationDetail")
	public Map<String, Object> readValidationDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readValidationDetail(params);
	}


	// 바코드 위치 조회
	@PostMapping("/search_stockInfo")
	public Map<String, Object> search_stockInfo(@RequestParam String barcode) {
		return purchaseService.search_stockInfo(barcode);
	}

	// 바코드 히스토리 모달창
	@PostMapping("/show_stockHistory")
	public List<Map<String, Object>> show_stockHistory(@RequestParam String barcode) {
		return purchaseService.show_stockHistory(barcode);
	}

	// 입고 삭제
	@PostMapping("/deleteIncoming")
	public ResponseEntity<Map<String, Object>> deleteIncoming(@RequestBody Map<String, Object> body) {
		try {
			Map<String, Object> ok = purchaseService.deleteByKind("INCOMING", body);
			return ResponseEntity.ok(ok); // 200
		} catch (RuntimeException e) {
			Map<String, Object> res = new HashMap<>();
			res.put("success", false);

			String msg = e.getMessage();
			if (msg != null && msg.startsWith("DELETE_FAILED|")) {
				String[] parts = msg.split("\\|", 3);
				res.put("failReason", parts[0]);
				res.put("failedOperation", parts[1]);
				res.put("failedBarcode", parts[2]);

				// 보통 비즈니스 실패 = 400
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
			}

			res.put("message", msg != null ? msg : "SERVER_ERROR");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res); // 500
		}
	}

	// 출고 삭제
	@PostMapping("/deleteLoad")
	public Map<String, Object> deleteLoad(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("LOAD", body);
		} catch (RuntimeException e) {
			Map<String, Object> res = new HashMap<>();
			res.put("success", false);

			String msg = e.getMessage();
			if (msg != null && msg.startsWith("DELETE_FAILED|")) {
				String[] parts = msg.split("\\|", 3);
				res.put("failReason", parts[0]);
				res.put("failedOperation", parts[1]);
				res.put("failedBarcode", parts[2]);
			} else {
				res.put("message", msg);
			}
			return res; // 항상 200 OK + JSON 바디
		}
	}

	// 재고실사 삭제
	@PostMapping("/deleteRealStock")
	public ResponseEntity<Map<String, Object>> deleteRealStock(@RequestBody Map<String, Object> body) {
		try {
			Map<String, Object> ok = purchaseService.deleteByKind("STOCKCOUNT", body);
			return ResponseEntity.ok(ok); // 200
		} catch (RuntimeException e) {
			Map<String, Object> res = new HashMap<>();
			res.put("success", false);

			String msg = e.getMessage();
			if (msg != null && msg.startsWith("DELETE_FAILED|")) {
				String[] parts = msg.split("\\|", 3);
				res.put("failReason", parts[0]);
				res.put("failedOperation", parts[1]);
				res.put("failedBarcode", parts[2]);

				// 보통 비즈니스 실패 = 400
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
			}

			res.put("message", msg != null ? msg : "SERVER_ERROR");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res); // 500
		}
	}


}
