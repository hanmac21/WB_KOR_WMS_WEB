package com.example.demo.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.demo.service.PurchaseService;
import com.example.demo.vo.StockVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.SalesService;

import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
@RestController
public class SalesController {
	@Autowired
	SalesService salesService;

	@Autowired
    PurchaseService purchaseService;

	@PostMapping("/loadReturnCustomerUpdate")
	public ResponseEntity<Map<String, Object>> loadReturnCustomerUpdate(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(salesService.loadReturnCustomerUpdate(requestData));
	}

	// 이손처리내역
	@PostMapping("/read_transferDetail")
	public Map<String, Object> readTransferDetail(@RequestBody Map<String, Object> params) {
		return salesService.readTransferDetail(params);
	}
	@PostMapping("/read_transferSummary")
	public Map<String, Object> readTransferSummary(@RequestBody Map<String, Object> params) {
		return salesService.readTransferSummary(params);
	}
	
	@PostMapping("/read_salesInvoiceList")
	public Map<String, Object> read_salesInvoiceList(@RequestBody Map<String, Object> params) {
		return salesService.read_salesInvoiceList(params);
	}

	// 예외처리 - 예외입고내역
	@PostMapping("/read_salesExceptionInputDetail")
	public Map<String, Object> readSalesExceptionInputDetail(@RequestBody Map<String, Object> params) {
		return salesService.readSalesExceptionInputDetail(params);
	}

	// 예외처리 - 예외입고내역
	@PostMapping("/read_salesExceptionInputSummary")
	public Map<String, Object> readSalesExceptionInputSummary(@RequestBody Map<String, Object> params) {
		return salesService.readSalesExceptionInputSummary(params);
	}

	// 예외처리 - 예외출고내역
	@PostMapping("/read_salesExceptionOutputDetail")
	public Map<String, Object> readSalesExceptionOutputDetail(@RequestBody Map<String, Object> params) {
		return salesService.readSalesExceptionOutputDetail(params);
	}

	// 예외처리 - 예외출고내역
	@PostMapping("/read_salesExceptionOutputSummary")
	public Map<String, Object> readSalesExceptionOutputSummary(@RequestBody Map<String, Object> params) {
		return salesService.readSalesExceptionOutputSummary(params);
	}

	// 출고처리 - 제품출고 list
	@PostMapping("/read_salesLoadDetail")
	public Map<String, Object> readSalesLoadDetail(@RequestBody Map<String, Object> params) {
		return salesService.readSalesLoadDetail(params);
	}

	// 출고처리 - 제품출고 sum
	@PostMapping("/read_salesLoadSummary")
	public Map<String, Object> readSalesLoadSummary(@RequestBody Map<String, Object> params) {
		return salesService.readSalesLoadSummary(params);
	}

	// 출고처리 - 출고반품 list
	@PostMapping("/read_salesLoadReturnDetail")
	public Map<String, Object> readSalesLoadReturnDetail(@RequestBody Map<String, Object> params) {
		return salesService.readSalesLoadReturnDetail(params);
	}

	// 출고처리 - 출고반품 sum
	@PostMapping("/read_salesLoadReturnSummary")
	public Map<String, Object> readSalesLoadReturnSummary(@RequestBody Map<String, Object> params) {
		return salesService.readSalesLoadReturnSummary(params);
	}

	// 재고이송관리 - 창고이동처리
	@PostMapping("/read_salesStorageDetail")
	public Map<String, Object> readSalesStorageDetail(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStorageDetail(params);
	}

	// 재고이송관리 - 창고이동처리
	@PostMapping("/read_salesStorageSummary")
	public Map<String, Object> readSalesStorageSummary(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStorageSummary(params);
	}

	// 재고조회 - 재고조회
	@PostMapping("/read_salesStockDetail")
	public Map<String, Object> readSalesStockDetail(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStockDetail(params);
	}

	// 재고조회 - 재고조회
	@PostMapping("/read_salesStockDetail_all")
	public List<StockVO> readSalesStockDetailAll(@RequestBody Map<String, Object> body) {
		return salesService.readSalesStockDetailAll(body);
	}

	// 재고조회 - 재고조회
	@PostMapping("/read_salesStockSummary")
	public Map<String, Object> readSalesStockSummary(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStockSummary(params);
	}

	// 창고별 재고현황
	@PostMapping("/read_salesStorageStockList")
	public Map<String, Object> readSalesStorageStockList(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStorageStockList(params);
	}

	// 재고실사 - 상시재고실사
	@PostMapping("/read_salesStockCountAlwaysDetail")
	public Map<String, Object> readSalesStockCountAlwaysDetail(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStockCountAlwaysDetail(params);
	}

	// 재고실사 - 상시재고실사
	@PostMapping("/read_salesStockCountAlwaysSummary")
	public Map<String, Object> readSalesStockCountAlwaysSummary(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStockCountAlwaysSummary(params);
	}

	// 재고실사 - 말일재고실사
	@PostMapping("/read_salesStockCountLastdayDetail")
	public Map<String, Object> readSalesStockCountLastdayDetail(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStockCountLastdayDetail(params);
	}

	// 재고실사 - 말일재고실사
	@PostMapping("/read_salesStockCountLastdaySummary")
	public Map<String, Object> readSalesStockCounLastdaySummary(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStockCountLastdaySummary(params);
	}

	// 재고 실사 검증
	@PostMapping("/read_salesStockCountCompare")
	public Map<String, Object> readSalesStockCountCompare(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStockCountCompare(params);
	}

	// 재고실사(미스캔)
	@PostMapping("/read_salesStockCountMissing")
	public Map<String, Object> readSalesStockCountMissing(@RequestBody Map<String, Object> params) {
		return salesService.readSalesStockCountMissing(params);
	}

	// 재고실사(미스캔) 엑셀
	@PostMapping("/read_salesStockCountMissing_all")
	public ResponseEntity<List<Map<String, Object>>> readSalesStockCountMissingAll(@RequestBody Map<String, Object> requestData) {
		System.out.println(requestData.get("searchParams"));

		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);
		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = salesService.readSalesStockCountMissingAll(queryParams);

		return ResponseEntity.ok(allData);
	}

	// 언팩 바코드 조회
	@PostMapping("/realSalesStockNotScan")
	public Map<String, Object> realSalesStockNotScan(@RequestBody Map<String, Object> param) {
		return purchaseService.realStockNotScan(param);
	}

	// 미스캔메뉴 재고조정
	@PostMapping("/salesAdjustment")
	public void adjustment(@RequestBody Map<String, Object> data) {
		purchaseService.adjustment(data);
	}

	// 예외 출고 등록
	@PostMapping("/salesInsertExcpetionOutput")
	public void insertExcpetionOutput(@RequestBody Map<String, Object> data) {
		purchaseService.insertExcpetionOutput(data);
	}

	// 재고실사확정 ERP
	@PostMapping("/read_salesErpInterfaceSummary")
	public ResponseEntity<Map<String, Object>> readSalesErpInterfaceSummary(@RequestBody Map<String, Object> requestData) {
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

			System.out.println(paramMap);
			// 서비스 호출
			List<StockVO> resultList = salesService.readSalesErpInterfaceSummary(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	// 재고실사확정 ERP
	@PostMapping("/read_salesErpInterfaceSummary_all")
	public ResponseEntity<List<Map<String, Object>>> readSalesErpInterfaceSummaryAll(@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 검색 조건 Map 생성
		Map<String, Object> paramMap = new HashMap<>();
		if (searchParams != null) {
			paramMap.putAll(searchParams);
		}

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = salesService.readSalesErpInterfaceSummaryAll(paramMap);

		return ResponseEntity.ok(allData);
	}
}
