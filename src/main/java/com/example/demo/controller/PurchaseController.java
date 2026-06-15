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

	// 🔹 **1. RACK 목록 조회 API**
	@PostMapping("/rack/list")
	public ResponseEntity<Map<String, Object>> getRackList(@RequestParam Map<String, String> filters) {

		log.info(" -- rack/list -- Enter!");
		try {
			// 🔸 필터 조건 추출
			String storage = filters.getOrDefault("storage", "default");
			String factory = filters.getOrDefault("factory", "default");
			String searchType = filters.getOrDefault("searchType", "default");
			String keyword = filters.getOrDefault("keyword", "");

			// 🔸 서비스에서 데이터 조회
			List<Map<String, Object>> rackList = purchaseService.getRackList(storage, factory, searchType, keyword);

			// 🔸 전체 통계 계산
			Map<String, Object> summary = calculateSummary(rackList);

			// 🔸 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("message", "RACK 목록 조회 성공");
			response.put("data", rackList);
			response.put("summary", summary);
			response.put("timestamp", new Date());

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			// 🔸 에러 응답
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("message", "RACK 목록 조회 실패: " + e.getMessage());
			errorResponse.put("data", new ArrayList<>());
			errorResponse.put("error", e.getClass().getSimpleName());
			errorResponse.put("timestamp", new Date());

			return ResponseEntity.status(500).body(errorResponse);
		}
	}

	// 🔹 **2. RACK 상세 조회 API**
	@PostMapping("/rack/detail")
	public ResponseEntity<Map<String, Object>> getRackDetail(@RequestParam Map<String, String> request) {

		log.info(" -- rack/detail -- Enter!");
		System.err.println(request);

		int checkVal = 0;

		if ("H/REST".equals(request.get("storage"))) {
			checkVal = purchaseService.checkWorkLocationRow(request);
		} else {
			checkVal = purchaseService.checkLocationRow(request);
		}

		if (checkVal == 0) {
			// 옵션 1: 데이터가 없는 경우 - 빈 데이터와 함께 성공 응답
			Map<String, Object> emptyResponse = new HashMap<>();
			emptyResponse.put("success", true);
			emptyResponse.put("message", "조회된 데이터가 없습니다");
			emptyResponse.put("data", new HashMap<>()); // 빈 데이터
			emptyResponse.put("timestamp", new Date());
			return ResponseEntity.ok(emptyResponse);
		} else {

			try {
				String rackId = request.get("rackId");
				String storage = request.getOrDefault("storage", "default");
				String factory = request.getOrDefault("factory", "default");

				if (rackId == null || rackId.trim().isEmpty()) {
					Map<String, Object> errorResponse = new HashMap<>();
					errorResponse.put("success", false);
					errorResponse.put("message", "RACK ID가 필요합니다");
					return ResponseEntity.badRequest().body(errorResponse);
				}

				// 🔸 서비스에서 상세 데이터 조회
				Map<String, Object> rackDetail = purchaseService.getRackDetail(rackId, storage, factory);

				// 🔸 응답 데이터 구성
				Map<String, Object> response = new HashMap<>();
				response.put("success", true);
				response.put("message", "RACK 상세 정보 조회 성공");
				response.put("data", rackDetail);
				response.put("timestamp", new Date());

				return ResponseEntity.ok(response);

			} catch (Exception e) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("message", "RACK 상세 조회 실패: " + e.getMessage());
				errorResponse.put("data", null);
				errorResponse.put("error", e.getClass().getSimpleName());
				errorResponse.put("timestamp", new Date());

				return ResponseEntity.status(500).body(errorResponse);
			}
		}
	}

	// 상세 정보 모달창
	@PostMapping("/rack/locationDetail")
	public Map<String, Object> locationDetail(@RequestParam String barcode) {
		log.info("locationDetail");
		return purchaseService.locationDetail(barcode);
	}

	// 🔸 **통계 계산 헬퍼 메소드**
	private Map<String, Object> calculateSummary(List<Map<String, Object>> rackList) {
		Map<String, Object> summary = new HashMap<>();

		int totalRacks = rackList.size();
		int totalCurrentCount = 0;
		int totalCapacity = 0;

		for (Map<String, Object> rack : rackList) {
			totalCurrentCount += (Integer) rack.getOrDefault("currentCount", 0);
			totalCapacity += (Integer) rack.getOrDefault("totalCapacity", 0);
		}

		int overallUtilizationRate = totalCapacity > 0 ? Math.round(totalCurrentCount * 100.0f / totalCapacity) : 0;

		summary.put("totalRacks", totalRacks);
		summary.put("overallUtilizationRate", overallUtilizationRate);
		summary.put("totalCurrentCount", totalCurrentCount);
		summary.put("totalCapacity", totalCapacity);

		return summary;
	}

	@PostMapping("/read_workMove")
	public List<WorkMoveVO> read_workMove() {
		List<WorkMoveVO> wList = purchaseService.read_workMove();

		return wList;
	}

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

	// 재고실사 - 말일
	@PostMapping("/read_stockCountLastDayDetail")
	public ResponseEntity<Map<String, Object>> read_stockCountLastDayDetail(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(purchaseService.read_stockCountLastDayDetail(requestData));
	}

	@PostMapping("/read_stockCountLastDayDetail_all")
	public ResponseEntity<List<Map<String, Object>>> read_stockCountLastDayDetail_all(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(purchaseService.read_stockCountLastDayDetail_all(requestData));
	}

	// 재고실사 - 말일
	@PostMapping("/read_stockCountLastDaySummary")
	public ResponseEntity<Map<String, Object>> read_stockCountLastDaySummary(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(purchaseService.read_stockCountLastDaySummary(requestData));
	}

	@PostMapping("/read_stockCountLastDaySummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_stockCountLastDaySummary_all(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(purchaseService.read_stockCountLastDaySummary_all(requestData));
	}

	// 미적재 리스트
	@GetMapping("/rack/unloaded")
	public Map<String, Object> unloadedList(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "100") int size, String factory, String storage) {

		Map<String, Object> result = new HashMap<>();
		try {
			Map<String, Object> paginationResult = purchaseService.unloadedList(page, size, factory, storage);
			return paginationResult;
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
			result.put("list", new ArrayList<>());
			result.put("total", 0);
			result.put("page", 1);
			result.put("totalPages", 0);
		}
		return result;
	}

	// 예외 출고 등록
	@PostMapping("/insertExcpetionOutput")
	public void insertExcpetionOutput(@RequestBody Map<String, Object> data) {
		purchaseService.insertExcpetionOutput(data);
	}

	// 미스캔메뉴 재고조정
	@PostMapping("/adjustment")
	public void adjustment(@RequestBody Map<String, Object> data) {
		purchaseService.adjustment(data);
	}

	@PostMapping("/read_stockDetail")
	public Map<String, Object> readStockDetail(@RequestBody Map<String, Object> body) {

		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) body.get("searchParams");

		int page = (body.get("page") == null) ? 1 : Integer.parseInt(String.valueOf(body.get("page")));
		int itemsPerPage = (body.get("itemsPerPage") == null) ? 1000
				: Integer.parseInt(String.valueOf(body.get("itemsPerPage")));

		if (page < 1)
			page = 1;
		if (itemsPerPage < 1)
			itemsPerPage = 1000;

		int offset = (page - 1) * itemsPerPage;

		// ✅ sortKey/sortDir 우선, 없으면 legacy(sortColumn/sortOrder)
		String sortKey = (body.get("sortKey") != null) ? String.valueOf(body.get("sortKey"))
				: (body.get("sortColumn") != null ? String.valueOf(body.get("sortColumn")) : "YMDHMS");

		String sortDir = (body.get("sortDir") != null) ? String.valueOf(body.get("sortDir"))
				: (body.get("sortOrder") != null ? String.valueOf(body.get("sortOrder")) : "DESC");

		sortKey = (sortKey == null) ? "YMDHMS" : sortKey.trim().toUpperCase();
		sortDir = (sortDir == null) ? "DESC" : sortDir.trim().toUpperCase();
		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
			sortDir = "DESC";

		// ✅ sortKey 화이트리스트(Mapper <choose>와 1:1)
		switch (sortKey) {
			case "FACTORY":
			case "STORAGE":
			case "SDATE":
			case "CAR":
			case "ITEMCODE":
			case "SPEC":
			case "ITEMNAME":
			case "LOCATION":
			case "QTY":
			case "LOGINID":
			case "HHMM":
			case "BARCODE":
			case "YMDHMS":
			case "MADATE":
				break;
			default:
				sortKey = "YMDHMS";
				break;
		}

		// ✅ param: searchParams는 "풀어서" 최상위로 넣기
		Map<String, Object> param = new HashMap<>();
		if (searchParams != null && !searchParams.isEmpty()) {
			param.putAll(searchParams);
		}

		param.put("offset", offset);
		param.put("itemsPerPage", itemsPerPage);
		param.put("sortKey", sortKey);
		param.put("sortDir", sortDir);

		System.out.println("PARAM_TO_MAPPER = " + param);

		List<StockVO> records = purchaseService.read_stockDetail(param);

		long totalCount = 0L;
		BigDecimal totalQty = BigDecimal.ZERO;

		if (records != null && !records.isEmpty()) {
			Long tc = records.get(0).getTotalCount();
			BigDecimal tq = records.get(0).getTotalQty();
			totalCount = (tc == null) ? 0L : tc.longValue();
			totalQty = (tq == null) ? BigDecimal.ZERO : tq;
		}

		long totalPages = (itemsPerPage <= 0) ? 0 : (long) Math.ceil((double) totalCount / (double) itemsPerPage);

		Map<String, Object> res = new HashMap<>();
		res.put("records", records);
		res.put("totalCount", totalCount);
		res.put("totalQty", totalQty);
		res.put("totalPages", totalPages);
		res.put("currentPage", page);

		return res;
	}

	@PostMapping("/read_stockSnapDetail")
	public Map<String, Object> readStockSnapDetail(@RequestBody Map<String, Object> body) {

		Map<String, Object> res = new HashMap<>();

		try {
			@SuppressWarnings("unchecked")
			Map<String, Object> searchParams = (Map<String, Object>) body.get("searchParams");

			int page = (body.get("page") == null) ? 1 : Integer.parseInt(String.valueOf(body.get("page")));
			int itemsPerPage = (body.get("itemsPerPage") == null) ? 1000
					: Integer.parseInt(String.valueOf(body.get("itemsPerPage")));

			if (page < 1)
				page = 1;
			if (itemsPerPage < 1)
				itemsPerPage = 1000;

			int offset = (page - 1) * itemsPerPage;

			String sortKey = (body.get("sortKey") != null) ? String.valueOf(body.get("sortKey"))
					: (body.get("sortColumn") != null ? String.valueOf(body.get("sortColumn")) : "YMDHMS");

			String sortDir = (body.get("sortDir") != null) ? String.valueOf(body.get("sortDir"))
					: (body.get("sortOrder") != null ? String.valueOf(body.get("sortOrder")) : "DESC");

			sortKey = (sortKey == null) ? "YMDHMS" : sortKey.trim().toUpperCase();
			sortDir = (sortDir == null) ? "DESC" : sortDir.trim().toUpperCase();
			if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
				sortDir = "DESC";

			switch (sortKey) {
				case "FACTORY":
				case "STORAGE":
				case "INDATE":
				case "CAR":
				case "ITEMCODE":
				case "SPEC":
				case "ITEMNAME":
				case "LOCATION":
				case "QTY":
				case "LOGINID":
				case "HHMM":
				case "BARCODE":
				case "YMDHMS":
				case "MADATE":
					break;
				default:
					sortKey = "YMDHMS";
					break;
			}

			Map<String, Object> param = new HashMap<>();
			if (searchParams != null && !searchParams.isEmpty()) {
				param.putAll(searchParams);
			}

			param.put("offset", offset);
			param.put("itemsPerPage", itemsPerPage);
			param.put("sortKey", sortKey);
			param.put("sortDir", sortDir);

			System.out.println("PARAM_TO_MAPPER = " + param);

			List<StockVO> records = purchaseService.read_stockSnapDetail(param);

			long totalCount = 0L;
			BigDecimal totalQty = BigDecimal.ZERO;

			if (records != null && !records.isEmpty()) {
				Long tc = records.get(0).getTotalCount();
				BigDecimal tq = records.get(0).getTotalQty();
				totalCount = (tc == null) ? 0L : tc.longValue();
				totalQty = (tq == null) ? BigDecimal.ZERO : tq;
			}

			long totalPages = (itemsPerPage <= 0) ? 0 : (long) Math.ceil((double) totalCount / (double) itemsPerPage);

			res.put("success", true);
			res.put("records", records);
			res.put("totalCount", totalCount);
			res.put("totalQty", totalQty);
			res.put("totalPages", totalPages);
			res.put("currentPage", page);

			return res;

		} catch (IllegalArgumentException e) {
			res.put("success", false);
			res.put("message", e.getMessage());
			res.put("records", new ArrayList<>());
			res.put("totalCount", 0);
			res.put("totalQty", BigDecimal.ZERO);
			res.put("totalPages", 0);
			res.put("currentPage", 1);
			return res;

		} catch (Exception e) {
			res.put("success", false);
			res.put("message", "데이터 조회 중 오류가 발생했습니다.");
			res.put("records", new ArrayList<>());
			res.put("totalCount", 0);
			res.put("totalQty", BigDecimal.ZERO);
			res.put("totalPages", 0);
			res.put("currentPage", 1);
			return res;
		}
	}

	@PostMapping("/read_stockSnapDetail_all")
	public List<StockVO> readStockSnapDetailAll(@RequestBody Map<String, Object> body) {

		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) body.get("searchParams");

		String sortKey = body.get("sortKey") == null ? "YMDHMS"
				: String.valueOf(body.get("sortKey")).trim().toUpperCase();
		String sortDir = body.get("sortDir") == null ? "DESC"
				: String.valueOf(body.get("sortDir")).trim().toUpperCase();
		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
			sortDir = "DESC";

		Map<String, Object> param = new HashMap<>();
		if (searchParams != null)
			param.putAll(searchParams);
		param.put("sortKey", sortKey);
		param.put("sortDir", sortDir);

		return purchaseService.read_stockSnapDetail_all(param);
	}

	@PostMapping("/read_stockSummary")
	public Map<String, Object> readStockSummary(@RequestBody Map<String, Object> body) {

		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) body.get("searchParams");

		int page = (body.get("page") == null) ? 1 : Integer.parseInt(String.valueOf(body.get("page")));
		int itemsPerPage = (body.get("itemsPerPage") == null) ? 1000
				: Integer.parseInt(String.valueOf(body.get("itemsPerPage")));

		if (page < 1)
			page = 1;
		if (itemsPerPage < 1)
			itemsPerPage = 1000;

		int offset = (page - 1) * itemsPerPage;

		String sortKey = (body.get("sortKey") != null) ? String.valueOf(body.get("sortKey"))
				: (body.get("sortColumn") != null ? String.valueOf(body.get("sortColumn")) : "YMDHMS");

		String sortDir = (body.get("sortDir") != null) ? String.valueOf(body.get("sortDir"))
				: (body.get("sortOrder") != null ? String.valueOf(body.get("sortOrder")) : "DESC");

		sortKey = (sortKey == null) ? "YMDHMS" : sortKey.trim().toUpperCase();
		sortDir = (sortDir == null) ? "DESC" : sortDir.trim().toUpperCase();
		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
			sortDir = "DESC";

		switch (sortKey) {
			case "FACTORY":
			case "STORAGE":
			case "SDATE":
			case "CAR":
			case "ITEMCODE":
			case "SPEC":
			case "ITEMNAME":
			case "LOCATION":
			case "QTY":
			case "LOGINID":
			case "HHMM":
			case "BARCODE":
			case "YMDHMS":
			case "ERPQTY": // ✅ ERPQTY 정렬도 쓸거면 추가
				break;
			default:
				sortKey = "YMDHMS";
				break;
		}

		Map<String, Object> param = new HashMap<>();
		if (searchParams != null && !searchParams.isEmpty()) {
			param.putAll(searchParams);
		}

		param.put("offset", offset);
		param.put("itemsPerPage", itemsPerPage);
		param.put("sortKey", sortKey);
		param.put("sortDir", sortDir);

		System.out.println("PARAM_TO_MAPPER = " + param);

		List<StockVO> records = purchaseService.read_stockSummary(param);

		long totalCount = 0L;
		BigDecimal totalQty = BigDecimal.ZERO;
		BigDecimal totalErpQty = BigDecimal.ZERO;

		if (records != null && !records.isEmpty()) {
			Long tc = records.get(0).getTotalCount();
			BigDecimal tq = records.get(0).getTotalQty();
			BigDecimal teq = records.get(0).getTotalErpQty();

			totalCount = (tc == null) ? 0L : tc.longValue();
			totalQty = (tq == null) ? BigDecimal.ZERO : tq;
			totalErpQty = (teq == null) ? BigDecimal.ZERO : teq;
		}

		long totalPages = (itemsPerPage <= 0) ? 0 : (long) Math.ceil((double) totalCount / (double) itemsPerPage);

		Map<String, Object> res = new HashMap<>();
		res.put("records", records);
		res.put("totalCount", totalCount);
		res.put("totalQty", totalQty);
		res.put("totalErpQty", totalErpQty); // ✅ 추가
		res.put("totalPages", totalPages);
		res.put("currentPage", page);

		return res;
	}

	@PostMapping("/read_stockSummary_all")
	public List<StockVO> readStockSummaryAll(@RequestBody Map<String, Object> body) {

		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) body.get("searchParams");

		String sortKey = body.get("sortKey") == null ? "YMDHMS"
				: String.valueOf(body.get("sortKey")).trim().toUpperCase();
		String sortDir = body.get("sortDir") == null ? "DESC"
				: String.valueOf(body.get("sortDir")).trim().toUpperCase();
		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
			sortDir = "DESC";

		Map<String, Object> param = new HashMap<>();
		if (searchParams != null)
			param.putAll(searchParams);
		param.put("sortKey", sortKey);
		param.put("sortDir", sortDir);

		return purchaseService.read_stockSummary_all(param);
	}

	@PostMapping("/read_stockDetail_all")
	public List<StockVO> readStockDetailAll(@RequestBody Map<String, Object> body) {

		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) body.get("searchParams");

		String sortKey = body.get("sortKey") == null ? "YMDHMS"
				: String.valueOf(body.get("sortKey")).trim().toUpperCase();
		String sortDir = body.get("sortDir") == null ? "DESC"
				: String.valueOf(body.get("sortDir")).trim().toUpperCase();
		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
			sortDir = "DESC";

		Map<String, Object> param = new HashMap<>();
		if (searchParams != null)
			param.putAll(searchParams);
		param.put("sortKey", sortKey);
		param.put("sortDir", sortDir);

		return purchaseService.read_stockDetail_all(param);
	}

	// 재고 수불부
	@PostMapping("/read_stockMovement")
	public ResponseEntity<Map<String, Object>> read_stockMovement(@RequestBody Map<String, Object> requestData) {
		System.out.println("1번");
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
			List<StockVO> resultList = purchaseService.read_stockMovement(paramMap);

			int totalCount = purchaseService.getStockMovementTotalCount(paramMap);
			// BigDecimal totalQty = purchaseService.getStockMovementTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			// response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_stockMovement_all")
	public ResponseEntity<List<Map<String, Object>>> read_stockMovement_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_stockMovement_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	@PostMapping("/read_wipDetail_all")
	public ResponseEntity<List<Map<String, Object>>> read_wipDetail_all(@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_wipDetail_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	@PostMapping("/read_wip_summary_all")
	public ResponseEntity<List<Map<String, Object>>> read_wip_summary_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_wip_summary_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 공급사 조회
	@PostMapping("/selectSupplier")
	public List<String> selectSupplier() {

		// 공급사 데이터
		List<String> result = purchaseService.selectSupplier();

		return result;
	}

	// 입고 공급사 업데이트
	@PostMapping("/incommingSupplierUpdate")
	public Map<String, Object> incommingSupplierUpdate(@RequestBody Map<String, Object> requestData) {
		return purchaseService.incommingSupplierUpdate(requestData);
	}

	@PostMapping("/read_incomingListSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_incomingListSummary_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_incomingListSummary_all(searchParams);

		return ResponseEntity.ok(allData);
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

	@PostMapping("/read_incomingDetail_all")
	public ResponseEntity<List<Map<String, Object>>> read_incomingDetail_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_incomingDetail_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 피딩 - detail
	@PostMapping("/read_feedingDetail")
	public ResponseEntity<Map<String, Object>> read_feedingDetail(@RequestBody Map<String, Object> requestData) {
		System.out.println("1번");
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
			List<WipReturnVO> resultList = purchaseService.read_feedingDetail(paramMap);
			int totalCount = purchaseService.getFeedingDetailTotalCount(paramMap);
			BigDecimal totalQty = purchaseService.getFeedingDetailTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_feedingDetail_all")
	public ResponseEntity<List<Map<String, Object>>> read_feedingDetail_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_feedingDetail_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 피딩 - detail
	@PostMapping("/read_feedingSummary")
	public ResponseEntity<Map<String, Object>> read_feedingSummary(@RequestBody Map<String, Object> requestData) {
		System.out.println("1번");
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
			List<WipReturnVO> resultList = purchaseService.read_feedingSummary(paramMap);
			int totalCount = purchaseService.getFeedingSummaryTotalCount(paramMap);
			BigDecimal totalQty = purchaseService.getFeedingSummaryTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_feedingSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_feedingSummary_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_feedingSummary_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 언팩 - detail
	@PostMapping("/read_unpackDetail")
	public ResponseEntity<Map<String, Object>> read_unpackDetail(@RequestBody Map<String, Object> requestData) {
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
			List<UnpackVO> resultList = purchaseService.read_unpackDetail(paramMap);
			int totalCount = purchaseService.getUnpackDetailTotalCount(paramMap);
			BigDecimal totalQty = purchaseService.getUnpackDetailTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_unpackDetail_all")
	public ResponseEntity<List<Map<String, Object>>> read_unpackDetail_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_unpackDetail_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 언팩 - detail
	@PostMapping("/read_unpackBalance")
	public ResponseEntity<Map<String, Object>> read_unpackBalance(@RequestBody Map<String, Object> requestData) {
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
			List<UnpackVO> resultList = purchaseService.read_unpackBalance(paramMap);
			int totalCount = purchaseService.getUnpackBalanceTotalCount(paramMap);
			BigDecimal totalQty = purchaseService.getUnpackBalanceTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_unpackBalance_all")
	public ResponseEntity<List<Map<String, Object>>> read_unpackBalance_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_unpackBalance_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	@PostMapping("/read_unpackSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_unpackSummaryl_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_unpackSummary_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 거래처 조회
	@PostMapping("/selectCustomer")
	public List<String> selectCustomer() {

		// 공급사 데이터
		List<String> result = purchaseService.selectCustomer();

		return result;
	}

	// 출고 공급사 업데이트
	@PostMapping("/loadCustomerUpdate")
	public Map<String, Object> loadCustomerUpdate(@RequestBody Map<String, Object> requestData) {
		return purchaseService.loadCustomerUpdate(requestData);
	}

	// 출고 날짜 업데이트
	@PostMapping("/loadDateUpdate")
	public int loadDateUpdate(@RequestBody Map<String, Object> requestData) {
		List<String> iidList = (List<String>) requestData.get("iidList");
		String newdate = (String) requestData.get("newdate");

		for (String iid : iidList) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("newdate", newdate);
			map.put("iid", iid);

			purchaseService.loadDateUpdate(map);
		}

		return 0;
	}

	// 공자 이동 완료 엑셀 다운로드
	@PostMapping("/read_factoryComplete_all")
	public ResponseEntity<List<Map<String, Object>>> read_factoryComplete_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_factoryComplete_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 이송 후 재고확인
	@PostMapping("/read_factoryTransferCheck")
	public ResponseEntity<Map<String, Object>> read_factoryTransferCheck(@RequestBody Map<String, Object> requestData) {
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
			List<FactoryMoveVO> resultList = purchaseService.read_factoryTransferCheck(paramMap);
			int totalCount = purchaseService.getFactoryTransferCheckTotalCount(paramMap);

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

	@PostMapping("/read_factoryTransferCheck_all")
	public ResponseEntity<List<Map<String, Object>>> read_factoryTransferCheck_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_factoryTransferCheck_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// TOTAL QTY
	@PostMapping("/updateTotalQty_palletList")
	public String updateTotalQtyPalletList(@RequestBody Map<String, Object> param) {
		log.info("DEBUG - " + param);
		return purchaseService.updateTotalQtyPalletList(param);
	}

	@PostMapping("/updateTotalQty_incomingList_detail")
	public String updateTotalQtyIncomingListDetail(@RequestBody Map<String, Object> param) {
		return purchaseService.updateTotalQtyIncomingListDetail(param);
	}

	@PostMapping("/updateTotalQty_stockCount")
	public String updateTotalQtyStockCount(@RequestBody Map<String, Object> param) {
		return purchaseService.updateTotalQtyStockCount(param);
	}

	// 재고 정보 - stock Info
	@PostMapping("/read_stockInfo")
	public ResponseEntity<Map<String, Object>> read_stockInfo(@RequestBody Map<String, Object> requestData) {
		try {
			// 검색 조건 파라미터 추출
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			System.out.println(requestData);
			// String barcode = (String) requestData.get("barcode");
			// String location = (String) searchParams.get("location");
			// String factory = (String) searchParams.get("factory");
			// String storage = (String) searchParams.get("storage");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);

			// String parts[] = barcode.split(",");
			// String itemcode = "";
			// if (parts.length == 5) {
			// itemcode = parts[0];
			// } else if (parts.length == 4) {
			// itemcode = parts[1];
			// } else {
			//
			// itemcode = parts[0];
			// }
			// 검색 조건 Map 생성
			Map<String, Object> paramMap = new HashMap<>();
			if (searchParams != null) {
				paramMap.putAll(searchParams);
			}

			// 251017 검색 영역에서 아이템 코드 추가로 그냥 전체 입력 + purAll 주석 해제
			// paramMap.put("itemcode", itemcode);
			// paramMap.put("factory", factory);
			// paramMap.put("storage", storage);
			// paramMap.put("location", location);
			// 페이징 정보 추가
			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);
			System.out.println("IN _STOCK");
			System.out.println(searchParams);
			System.out.println(paramMap);
			// 서비스 호출
			List<StockVO> resultList = purchaseService.read_stockInfo(paramMap);
			int totalCount = purchaseService.getStockInfoTotalCount(paramMap);
			BigDecimal totalQty = purchaseService.getStockInfoTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	// stock info 엑셀다운로드
	@PostMapping("/read_stockInfo_all")
	public ResponseEntity<List<Map<String, Object>>> read_stockInfo_all(@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 251017 DH - 아이템 코드로 검색 기능 추가로 기존 코드 주석 처리
		// // 검색 조건 Map 생성
		// Map<String, Object> paramMap = new HashMap<>();
		//
		// String barcode = (String) searchParams.get("barcode");
		// String location = (String) searchParams.get("location");
		// String factory = (String) searchParams.get("factory");
		// String storage = (String) searchParams.get("storage");
		//
		// String parts[] = barcode.split(",");
		// String itemcode = "";
		// if (parts.length == 5) {
		// itemcode = parts[0];
		// } else if (parts.length == 4) {
		// itemcode = parts[1];
		// } else {
		//
		// itemcode = parts[0];
		// }
		//
		// paramMap.put("itemcode", itemcode);
		// paramMap.put("location", location);
		// paramMap.put("factory", factory);
		// paramMap.put("storage", storage);

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_stockInfo_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	@PostMapping("/read_stockinfoInclude")
	public List<Map<String, Object>> read_stockinfoInclude(@RequestBody String barcode) {
		return purchaseService.read_stockinfoInclude(barcode);
	}

	@PostMapping("/read_stockInfoInclude_total")
	public List<Map<String, Object>> read_stockInfoInclude_total(@RequestBody String itemcode) {
		return purchaseService.read_stockInfoInclude_total(itemcode);
	}

	@PostMapping("/read_stockHistory")
	public ResponseEntity<Map<String, Object>> read_stockHistory(@RequestBody Map<String, Object> requestData) {
		try {
			System.out.println(requestData);
			// Map<String, Object> searchParams = (Map<String, Object>)
			// requestData.get("searchParams");
			String searchParams = (String) requestData.get("searchParams");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);

			Map<String, Object> paramMap = new HashMap<>();

			// searchParams에서 barcode만 추출
			// if (searchParams != null && searchParams.containsKey("barcode")) {
			paramMap.put("barcode", searchParams);
			// }

			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);
			// paramMap.put("location", searchParams.get("location"));

			System.out.println("IN _STOCK");
			System.out.println(paramMap); // 이제 {barcode=C01136621020}로 출력됨

			List<StockVO> resultList = purchaseService.read_stockHistory(paramMap);
//			int totalCount = purchaseService.getStockHistoryTotalCount(paramMap);
//			BigDecimal totalQty = purchaseService.getStockHistoryTotalQty(paramMap);
			Map<String, Object> location = purchaseService.search_stockInfo(searchParams);
			Map<String, Object> response = new HashMap<>();

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (resultList != null && !resultList.isEmpty()) {
				StockVO firstRecord = resultList.get(0);
				Double totalCount = firstRecord.getTotalCount() != null
						? ((Number) firstRecord.getTotalCount()).doubleValue()
						: 0;
				response.put("totalCount", totalCount);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					response.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				response.put("totalCount", 0);
				if (page != null && page > 0) {
					response.put("totalPages", 0);
				}
			}


			response.put("records", resultList);
//			response.put("totalCount", totalCount);
			response.put("totalQty", 0);
			response.put("currentPage", page);
//			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));
			response.put("location", location);

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	// 재고 히스토리
	@PostMapping("/read_stockHistory_all")
	public ResponseEntity<List<Map<String, Object>>> read_stockHistory_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_stockHistory_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 재고 바코드 길이체크
	@PostMapping("/stock_history_barcodeCheck")
	public List<String> stock_history_barcodeCheck(@RequestBody String barcode) {
		return purchaseService.stock_history_barcodeCheck(barcode);
	}

	@PostMapping("/read_stockCountCompare")
	public ResponseEntity<Map<String, Object>> read_stockCountCompare(@RequestBody Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);

			// 검색 조건 Map 생성
			Map<String, Object> paramMap = new HashMap<>();
			if (searchParams != null) {
				paramMap.putAll(searchParams);
			}

			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);

			System.out.println("IN _STOCK");
			System.out.println(paramMap); // 이제 {barcode=C01136621020}로 출력됨

			List<StockVO> resultList = purchaseService.read_stockCountCompare(paramMap);
			// int totalCount = purchaseService.getStockCountCompareTotalCount(paramMap); //
			// 페이징 기능 삭제 251001 hj
			// Controller
			// Map<String, Object> totalMap =
			// purchaseService.getStockCountCompareTotal(paramMap); // 페이징 기능 삭제 251001 hj

			// BigDecimal totalQty_real = totalMap.get("TOTALQTY_REAL") != null
			// ? new BigDecimal(totalMap.get("TOTALQTY_REAL").toString())
			// : BigDecimal.ZERO;
			//
			// BigDecimal totalCount_real = totalMap.get("TOTALCOUNT_REAL") != null
			// ? new BigDecimal(totalMap.get("TOTALCOUNT_REAL").toString())
			// : BigDecimal.ZERO;
			//
			// BigDecimal totalQty_system = totalMap.get("TOTALQTY_SYSTEM") != null
			// ? new BigDecimal(totalMap.get("TOTALQTY_SYSTEM").toString())
			// : BigDecimal.ZERO;
			//
			// BigDecimal totalCount_system = totalMap.get("TOTALCOUNT_SYSTEM") != null
			// ? new BigDecimal(totalMap.get("TOTALCOUNT_SYSTEM").toString())
			// : BigDecimal.ZERO;

			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			// response.put("totalCount", totalCount);
			// response.put("currentPage", page);
			// response.put("totalPages", (int) Math.ceil((double) totalCount /
			// itemsPerPage));

			// response.put("totalQty_real", totalQty_real);
			// response.put("totalCount_real", totalCount_real);
			// response.put("totalQty_system", totalQty_system);
			// response.put("totalCount_system", totalCount_system);

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	// 재고 비교 엑셀
	@PostMapping("/read_stockCountCompare_all")
	public ResponseEntity<List<Map<String, Object>>> read_stockCountCompare_all(
			@RequestBody Map<String, Object> requestData) {
		System.out.println(requestData.get("searchParams"));
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_stockCountCompare_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 재고 비교 세부사항
	@PostMapping("/read_stockCountCompare_detail")
	public Map<String, Object> read_stockCountCompare_detail(@RequestBody Map<String, Object> param) {
		return purchaseService.read_stockCountCompare_detail(param);
	}

	@PostMapping("/read_stockCountMissing")
	public ResponseEntity<Map<String, Object>> read_stockCountMissing(@RequestBody Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);

			// 검색 조건 Map 생성
			Map<String, Object> paramMap = new HashMap<>();
			if (searchParams != null) {
				paramMap.putAll(searchParams);
			}

			// startdate +1 로직 추가
			String startDateObj = (String) paramMap.get("startdate");
			if (startDateObj != null) {
				String startdate = startDateObj.toString().trim();
				if (!startdate.isEmpty()) {
					LocalDate date = LocalDate.parse(startdate); // yyyy-MM-dd 가정
					String nextStartDate = date.plusDays(1).toString();

					// 새 파라미터 추가
					paramMap.put("nextDate", nextStartDate);
				}
			}

			System.out.println(paramMap);

			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);

			System.out.println("IN _STOCK_MISS");
			System.out.println(paramMap); // 이제 {barcode=C01136621020}로 출력됨

			String stockCountDate = purchaseService.getStockCountDate(paramMap);
			List<StockVO> resultList = purchaseService.read_stockCountMissing(paramMap);
			// int totalCount = purchaseService.getStockCountMissingTotalCount(paramMap);
			// BigDecimal totalQty = purchaseService.getStockCountMissingTotalQty(paramMap);
			// Controller
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("stockCountDate", stockCountDate);
			// response.put("totalCount", totalCount);
			// response.put("totalQty", totalQty);
			// response.put("currentPage", page);
			// response.put("totalPages", (int) Math.ceil((double) totalCount /
			// itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	// 재고 비교 엑셀
	@PostMapping("/read_stockCountMissing_all")
	public ResponseEntity<List<Map<String, Object>>> read_stockCountMissing_all(
			@RequestBody Map<String, Object> requestData) {
		System.out.println(requestData.get("searchParams"));

		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
		// startdate +1 로직 추가
		String startDateObj = (String) searchParams.get("startdate");
		if (startDateObj != null) {
			String startdate = startDateObj.toString().trim();
			if (!startdate.isEmpty()) {
				LocalDate date = LocalDate.parse(startdate); // yyyy-MM-dd 가정
				String nextStartDate = date.plusDays(1).toString();

				// 새 파라미터 추가
				searchParams.put("nextDate", nextStartDate);
			}
		}

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_stockCountMissing_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 재고 비교 세부사항
	@PostMapping("/read_stockCountMissing_detail")
	public Map<String, Object> read_stockCountMissing_detail(@RequestBody Map<String, Object> param) {
		return purchaseService.read_stockCountMissing_detail(param);
	}

	// 언팩 바코드 조회
	@PostMapping("/searchUnpackBarcodes")
	public Map<String, Object> searchUnpackBarcodes(@RequestBody Map<String, Object> param) {
		return purchaseService.searchUnpackBarcodes(param);
	}

	// 언팩 바코드 조회
	@PostMapping("/realStockNotScan")
	public Map<String, Object> realStockNotScan(@RequestBody Map<String, Object> param) {
		return purchaseService.realStockNotScan(param);
	}

	// ERP 인터페이스 - detail
	@PostMapping("/read_erpInterfaceDetail")
	public ResponseEntity<Map<String, Object>> read_erpInterfaceDetail(@RequestBody Map<String, Object> requestData) {
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
			List<ProductVO> resultList = purchaseService.read_erpInterfaceDetail(paramMap);
			int totalCount = purchaseService.getErpInterfaceDetailTotalCount(paramMap);
			BigDecimal totalQty = purchaseService.getErpInterfaceDetailTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_erpInterfaceDetail_all")
	public ResponseEntity<List<Map<String, Object>>> read_erpInterfaceDetail_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_erpInterfaceDetail_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// ERP 인터페이스 - summary
	@PostMapping("/read_erpInterfaceSummary")
	public ResponseEntity<Map<String, Object>> read_erpInterfaceSummary(@RequestBody Map<String, Object> requestData) {
		try {
			// 검색 조건 파라미터 추출
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);

			// 검색 조건 Map 생성
			Map<String, Object> paramMap = new HashMap<>();
			if (searchParams != null) {
				paramMap.putAll(searchParams);
				// SALTILLO + Material 처리
				String factory = (String) searchParams.get("factory");
				String storage = (String) searchParams.get("storage");

				List<String> storageList = new ArrayList<>();
				// if ("SALTILLO".equals(factory) && "Material".equals(storage)) {
				// storageList.add("Material");
				// storageList.add("Side seat");
				// storageList.add("Outside");
				// } else if ("all".equals(storage)) {
				// storageList.add("Material");
				// storageList.add("Fabric");
				// storageList.add("Side seat");
				// storageList.add("Outside");
				// storageList.add("PRODUCT");
				// } else {
				// storageList.add(storage);
				// }
				// paramMap.put("storage", storageList);
				// startdate +1 로직 추가
				String startDateObj = (String) searchParams.get("startdate");
				if (startDateObj != null) {
					String startdate = startDateObj.toString().trim();
					if (!startdate.isEmpty()) {
						LocalDate date = LocalDate.parse(startdate); // yyyy-MM-dd 가정
						String nextStartDate = date.plusDays(1).toString();

						// -1일 (전날)
						String preStartDate = date.minusDays(1).toString();

						// 새 파라미터 추가
						paramMap.put("nextDate", nextStartDate);
						paramMap.put("preDate", preStartDate);
					}
				}
			}

			// 페이징 정보 추가
			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);

			// 서비스 호출
			List<StockVO> resultList = purchaseService.read_erpInterfaceSummary(paramMap);
			// int totalCount = purchaseService.getErpInterfaceSummaryTotalCount(paramMap);
			// BigDecimal totalQty =
			// purchaseService.getErpInterfaceSummaryTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			// response.put("totalCount", totalCount);
			// response.put("totalQty", totalQty);
			// response.put("currentPage", page);
			// response.put("totalPages", (int) Math.ceil((double) totalCount /
			// itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_erpInterfaceSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_erpInterfaceSummary_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
		// 검색 조건 Map 생성
		Map<String, Object> paramMap = new HashMap<>();
		if (searchParams != null) {
			paramMap.putAll(searchParams);
			// SALTILLO + Material 처리
			String factory = (String) searchParams.get("factory");
			String storage = (String) searchParams.get("storage");

			// List<String> storageList = new ArrayList<>();
			// if ("SALTILLO".equals(factory) && "Material".equals(storage)) {
			// storageList.add("Material");
			// storageList.add("Side seat");
			// storageList.add("Outside");
			// } else if ("all".equals(storage)) {
			// storageList.add("Material");
			// storageList.add("Fabric");
			// storageList.add("Side seat");
			// storageList.add("Outside");
			// storageList.add("PRODUCT");
			// } else {
			// storageList.add(storage);
			// }
			// paramMap.put("storage", storageList);
			String startDateObj = (String) searchParams.get("startdate");
			if (startDateObj != null) {
				String startdate = startDateObj.toString().trim();
				if (!startdate.isEmpty()) {
					LocalDate date = LocalDate.parse(startdate); // yyyy-MM-dd 가정
					String nextStartDate = date.plusDays(1).toString();

					// 새 파라미터 추가
					paramMap.put("nextDate", nextStartDate);
				}
			}
		}
		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_erpInterfaceSummary_all(paramMap);

		return ResponseEntity.ok(allData);
	}

	// 미적재 리스트
	@PostMapping("/read_unloadList")
	public Map<String, Object> readUnloadList(@RequestBody Map<String, Object> params) {
		return purchaseService.readUnloadList(params);
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

	@PostMapping("/show_stockHistory_sangho")
	public Map<String, Object> show_stockHistory_sangho(@RequestParam String custCode) {
		return purchaseService.show_stockHistory_sangho(custCode);
	}

	// 재고 수불부 항목 존재여부 체크 (아이템코드)
	@PostMapping("/check_stockMovement")
	public int check_stockMovement(@RequestBody Map<String, Object> param) {
		System.out.println("Check Param - Stock Movement");
		String itemcode = (String) param.get("itemcode");
		System.out.println(itemcode);
		return purchaseService.check_stockMovement(itemcode);
	}

	@PostMapping("/read_dashboard_stock")
	public Map<String, Object> read_dashboard_stock(@RequestBody Map<String, Object> param) {
		return purchaseService.read_dashboard_stock(param);
	}

	@PostMapping("/read_production_dashboard")
	public Map<String, Object> read_production_dashboard(@RequestBody Map<String, Object> param) {
		return purchaseService.read_production_dashboard(param);
	}

	// 예외입고 삭제
	@PostMapping("/deleteExceptionInput")
	public Map<String, Object> deleteExceptionInput(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("EXCEPTION INCOMING", body);
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

	// 예외출고 삭제
	@PostMapping("/deleteExceptionOutput")
	public Map<String, Object> deleteExceptionOutput(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("EXCEPTION LOAD", body);
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

	// 공정불출 삭제
	@PostMapping("/deleteWip")
	public Map<String, Object> deleteWip(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("WIP INPUT", body);
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

	// 공정불출반납 삭제
	@PostMapping("/deleteWipReturn")
	public Map<String, Object> deleteWipReturn(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("WIP RETURN", body);
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

	// 입고 반품 삭제
	@PostMapping("/deleteIncomingReturn")
	public Map<String, Object> deleteIncomingReturn(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("INCOMING RETURN", body);
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

	// 출고 반납 삭제
	@PostMapping("/deleteLoadReturn")
	public Map<String, Object> deleteLoadReturn(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("LOAD RETURN", body);
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

	// 공장출고 삭제
	@PostMapping("/deleteFactorySending")
	public Map<String, Object> deleteFactorySending(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("FACTORY SENDING", body);
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

	// 창고이동 삭제
	@PostMapping("/deleteStorage")
	public Map<String, Object> deleteStorage(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("STOCK MOVE", body);
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

	// 공창입고 삭제
	@PostMapping("/deleteFactoryReceiving")
	public Map<String, Object> deleteFactoryReceiving(@RequestBody Map<String, Object> body) {
		try {
			return purchaseService.deleteByKind("FACTORY RECEIVE", body);
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

	@PostMapping("/deleteSalesTransfer")
	public ResponseEntity<Map<String, Object>> deleteSalesTransfer(@RequestBody Map<String, Object> body) {
		try {
			Map<String, Object> ok = purchaseService.deleteByKind("PRODUCT MOVE", body);
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

	// 반품 검사 삭제
	@PostMapping("/updateRtInsp")
	public Map<String, Object> updateRtInsp(@RequestBody Map<String, Object> req) {
		return purchaseService.updateRtInsp(req);
	}

	// 창고 검사 삭제
	@PostMapping("/updateWhInsp")
	public Map<String, Object> updateWhInsp(@RequestBody Map<String, Object> req) {
		return purchaseService.updateWhInsp(req);
	}

	// 양불 전환 삭제
	@PostMapping("/updateConditionChange")
	public Map<String, Object> updateConditionChange(@RequestBody Map<String, Object> req) {
		return purchaseService.updateConditionChange(req);
	}

	// 구매 - 입고처리 - 미착품조회 List
	@PostMapping("/read_unreceivedItem")
	public Map<String, Object> readUnreceivedItem(@RequestBody Map<String, Object> params) {
		return purchaseService.readUnreceivedItem(params);
	}

	// 구매 - 입고처리 - 미착품조회(품번) List
	@PostMapping("/read_unreceivedItemCodes")
	public Map<String, Object> readUnreceivedItemCodes(@RequestBody Map<String, Object> params) {
		return purchaseService.readUnreceivedItemCodes(params);
	}

	// 구매 - 재고 이송 관리 - 공장간 이송(미도착)
	@PostMapping("/read_factoryUnreceived")
	public Map<String, Object> readFactoryUnreceived(@RequestBody Map<String, Object> params) {
		return purchaseService.readFactoryUnreceived(params);
	}

	@PostMapping("/read_factoryUnreceivedSummary")
	public Map<String, Object> readFactoryUnreceivedSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readFactoryUnreceivedSummary(params);
	}

	// 구매 - 재고 이송 관리 - 공장간 이송(완료)
	@PostMapping("/read_factoryComplete")
	public Map<String, Object> readFactoryComplete(@RequestBody Map<String, Object> params) {
		return purchaseService.readFactoryComplete(params);
	}

	@PostMapping("/read_factoryCompleteSummary")
	public Map<String, Object> readFactoryCompleteSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readFactoryCompleteSummary(params);
	}

	// 구매 - 재고 이송 관리 - 공장간 이송(미도착)
	@PostMapping("/read_workMoveUnreceived")
	public Map<String, Object> readWorkMoveUnreceived(@RequestBody Map<String, Object> params) {
		return purchaseService.readWorkMoveUnreceived(params);
	}

	@PostMapping("/read_workMoveComplete")
	public Map<String, Object> readWorkMoveComplete(@RequestBody Map<String, Object> params) {
		return purchaseService.readWorkMoveComplete(params);
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

	// 입고조회 - 입고반품 list
	@PostMapping("/read_incomingReturnDetail")
	public Map<String, Object> readIncomingReturnDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readIncomingReturnDetail(params);
	}

	// 입고조회 - 입고반품 sum
	@PostMapping("/read_incomingReturnSummary")
	public Map<String, Object> readIncomingReturnSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readIncomingReturnSummary(params);
	}

	// 공정불출 - 독립불출내역 list
	@PostMapping("/read_wipDetail")
	public Map<String, Object> readWipDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readWipDetail(params);
	}

	// 공정불출 - 독립불출내역 list
	@PostMapping("/read_wipSummary")
	public Map<String, Object> readWipSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readWipSummary(params);
	}

	// 언팩 - Sum
	@PostMapping("/read_unpackSummary")
	public Map<String, Object> readUnpackSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readUnpackSummary(params);
	}

	// 공정불출 - 공정불출반납 list
	@PostMapping("/read_wipReturnDetail")
	public Map<String, Object> readWipReturnDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readWipReturnDetail(params);
	}

	// 공정불출 - 공정불출반납 Sum
	@PostMapping("/read_wipReturnSummary")
	public Map<String, Object> readWipReturnSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readWipReturnSummary(params);
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

	// 출고처리 - 출고반품 list
	@PostMapping("/read_loadReturnDetail")
	public Map<String, Object> readLoadReturnDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readLoadReturnDetail(params);
	}

	// 출고처리 - 출고반품 sum
	@PostMapping("/read_loadReturnSummary")
	public Map<String, Object> readLoadReturnSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readLoadReturnSummary(params);
	}

	// 재고이송관리 - 창고이동처리
	@PostMapping("/read_storageDetail")
	public Map<String, Object> readStorageDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readStorageDetail(params);
	}

	// 재고이송관리 - 창고이동처리
	@PostMapping("/read_storageSummary")
	public Map<String, Object> readStorageSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readStorageSummary(params);
	}

	// 재고이송관리 - 창고이동출고
	@PostMapping("/read_storageSendingDetail")
	public Map<String, Object> readStorageSendingDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readStorageSendingDetail(params);
	}

	// 재고이송관리 - 창고이동출고
	@PostMapping("/read_storageReceivingDetail")
	public Map<String, Object> readStorageReceivingDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readStorageReceivingDetail(params);
	}

	// 구매 - 재고 이송 관리 - 창고간 이송(완료)
	@PostMapping("/read_storageComplete")
	public Map<String, Object> readStorageComplete(@RequestBody Map<String, Object> params) {
		return purchaseService.readStorageComplete(params);
	}

	// 구매 - 재고 이송 관리 - 창고간 이송(미도착)
	@PostMapping("/read_storageUnreceived")
	public Map<String, Object> readStorageUnreceived(@RequestBody Map<String, Object> params) {
		return purchaseService.readStorageUnreceived(params);
	}

	// 이송 후 재고확인
	@PostMapping("/read_storageTransferCheck")
	public ResponseEntity<Map<String, Object>> read_storageTransferCheck(@RequestBody Map<String, Object> requestData) {
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
			List<StockMoveVO> resultList = purchaseService.read_storageTransferCheck(paramMap);
			int totalCount = purchaseService.getStorageTransferCheckTotalCount(paramMap);

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

	@PostMapping("/read_storageTransferCheck_all")
	public ResponseEntity<List<Map<String, Object>>> read_storageTransferCheck_all(@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_storageTransferCheck_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 재고이송관리 - 공장이동출고
	@PostMapping("/read_factorySendingDetail")
	public Map<String, Object> readFactorySendingDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readFactorySendingDetail(params);
	}

	// 재고이송관리 - 공장이동입고
	@PostMapping("/read_factoryReceivingDetail")
	public Map<String, Object> readFactoryReceivingDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readFactoryReceivingDetail(params);
	}

	// 예외처리 - 예외입고내역
	@PostMapping("/read_exceptionInputDetail")
	public Map<String, Object> readExceptionInputDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readExceptionInputDetail(params);
	}

	// 예외처리 - 예외입고내역
	@PostMapping("/read_exceptionInputSummary")
	public Map<String, Object> readExceptionInputSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readExceptionInputSummary(params);
	}

	// 예외처리 - 예외출고내역
	@PostMapping("/read_exceptionOutputDetail")
	public Map<String, Object> readExceptionOutputDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readExceptionOutputDetail(params);
	}

	// 예외처리 - 예외출고내역
	@PostMapping("/read_exceptionOutputSummary")
	public Map<String, Object> readExceptionOutputSummary(@RequestBody Map<String, Object> params) {
		return purchaseService.readExceptionOutputSummary(params);
	}

	// 재공재고실사 - 구매
	@PostMapping("/read_purchaseStockCountWIPList")
	public Map<String, Object> readPurchaseStockCountWIPList(@RequestBody Map<String, Object> params) {
		return purchaseService.readPurchaseStockCountWIPList(params);
	}

	@PostMapping("/insertStockCountWIPList_purchase")
	public int insertStockCountWIPList_purchase(@RequestBody Map<String, Object> body) {
		List<Map<String, Object>> list = (List<Map<String, Object>>) body.get("list");
		String factory = (String) body.get("factory");
		String workshop = (String) body.get("workshop");
		if (workshop.split("-").length == 2) {
			factory = workshop.split("-")[0];
			workshop = workshop.split("-")[1];
		}
		String loginid = (String) body.get("loginid");
		String date = (String) body.get("date");
		return purchaseService.insertStockCountWIPList_purchase(list, factory, workshop, loginid, date);
	}

	@PostMapping("/read_stockTotal")
	public Map<String, Object> read_stockTotal(@RequestBody Map<String, Object> params) {
		return purchaseService.read_stockTotal(params);
	}

	// 구매 - 재고 이송 관리 - 공장간 이송(미도착)
	@PostMapping("/read_stockStation")
	public Map<String, Object> readStockStation(@RequestBody Map<String, Object> params) {
		return purchaseService.readStockStation(params);
	}

	@PostMapping("/read_purchaseStockDetail")
	public Map<String, Object> read_purchaseStockDetail(@RequestBody Map<String, Object> params) {
		System.out.println(params);
		return purchaseService.read_purchaseStockDetail(params);
	}

	@PostMapping("/read_purchaseStorageStockList")
	public Map<String, Object> read_purchaseStorageStockList(@RequestBody Map<String, Object> params) {
		return purchaseService.read_purchaseStorageStockList(params);
	}

	// 예외처리 - 예외입고내역
	@PostMapping("/read_exceptionInputDetailStockCount")
	public Map<String, Object> readExceptionInputDetailStockCount(@RequestBody Map<String, Object> params) {
		return purchaseService.readExceptionInputDetailStockCount(params);
	}

	// 예외처리 - 예외출고내역
	@PostMapping("/read_exceptionOutputDetailStockCount")
	public Map<String, Object> readExceptionOutputDetailStockCount(@RequestBody Map<String, Object> params) {
		return purchaseService.readExceptionOutputDetailStockCount(params);
	}

	@PostMapping("/read_stockCountAdjust")
	public ResponseEntity<Map<String, Object>> read_stockCountAdjust(@RequestBody Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);

			// 검색 조건 Map 생성
			Map<String, Object> paramMap = new HashMap<>();
			if (searchParams != null) {
				paramMap.putAll(searchParams);
			}

			// startdate +1 로직 추가
			String startDateObj = (String) paramMap.get("startdate");
			if (startDateObj != null) {
				String startdate = startDateObj.toString().trim();
				if (!startdate.isEmpty()) {
					LocalDate date = LocalDate.parse(startdate); // yyyy-MM-dd 가정
					String nextStartDate = date.plusDays(1).toString();

					// 새 파라미터 추가
					paramMap.put("nextDate", nextStartDate);
				}
			}

			System.out.println(paramMap);

			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);

			System.out.println("IN _STOCK_MISS");
			System.out.println(paramMap); // 이제 {barcode=C01136621020}로 출력됨

			List<StockVO> resultList = purchaseService.read_stockCountAdjust(paramMap);
			// int totalCount = purchaseService.getStockCountAdjustTotalCount(paramMap);
			// BigDecimal totalQty = purchaseService.getStockCountAdjustTotalQty(paramMap);
			// Controller
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			// response.put("totalCount", totalCount);
			// response.put("totalQty", totalQty);
			// response.put("currentPage", page);
			// response.put("totalPages", (int) Math.ceil((double) totalCount /
			// itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	// 재고 비교 엑셀
	@PostMapping("/read_stockCountAdjust_all")
	public ResponseEntity<List<Map<String, Object>>> read_stockCountAdjust_all(
			@RequestBody Map<String, Object> requestData) {
		System.out.println(requestData.get("searchParams"));

		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
		// startdate +1 로직 추가
		String startDateObj = (String) searchParams.get("startdate");
		if (startDateObj != null) {
			String startdate = startDateObj.toString().trim();
			if (!startdate.isEmpty()) {
				LocalDate date = LocalDate.parse(startdate); // yyyy-MM-dd 가정
				String nextStartDate = date.plusDays(1).toString();

				// 새 파라미터 추가
				searchParams.put("nextDate", nextStartDate);
			}
		}

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = purchaseService.read_stockCountAdjust_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 재고 비교 세부사항
	@PostMapping("/read_stockCountAdjust_detail")
	public Map<String, Object> read_stockCountAdjust_detail(@RequestBody Map<String, Object> param) {
		return purchaseService.read_stockCountAdjust_detail(param);
	}

	@PostMapping("/read_validationDetail")
	public Map<String, Object> readValidationDetail(@RequestBody Map<String, Object> params) {
		return purchaseService.readValidationDetail(params);
	}

	@PostMapping("/stockCountPurWIPList_delete")
	public int deleteStockCountWIPList(@RequestBody Map<String, Object> param) {
		System.out.println("deleteStockCountWIPList param = " + param);
		return purchaseService.deleteStockCountWIPList(param);
	}

	@PostMapping("/moveProduct")
	public int moveProduct(@RequestBody Map<String, Object> param){
		return purchaseService.moveProduct(param);
	}

	@PostMapping("/inspectionExcelUpload")
	public Map<String, Object> inspectionExcelUpload(@RequestParam("file") MultipartFile file){
		Map<String, Object> result = new HashMap<>();

		try {
			List<Map<String, Object>> list = purchaseService.excelUpload(file);

			result.put("success", true);
			result.put("data", list);

		} catch (IllegalArgumentException e) {
			result.put("success", false);
			result.put("message", e.getMessage());

		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "엑셀 처리 중 알 수 없는 오류가 발생했습니다.");
		}

		return result;
	}

	@GetMapping("/inspectionExcelFormDownload")
	public void inspectionExcelFormDownload(HttpServletResponse response) throws Exception {
		File file = new File("C:\\reportUSA\\inspectionExcel.xlsx");
		if (!file.exists()) {
			response.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found: " + file.getPath());
			return;
		}
		response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		response.setHeader("Content-Disposition", "attachment; filename=\"inspectionExcel.xlsx\"");
		response.setContentLengthLong(file.length());
		try (FileInputStream fis = new FileInputStream(file);
			 OutputStream os = response.getOutputStream()) {
			byte[] buf = new byte[4096];
			int len;
			while ((len = fis.read(buf)) != -1) {
				os.write(buf, 0, len);
			}
		}
	}

	@PostMapping("/inspectionReturn")
	public int inspectionReturn(@RequestBody Map<String, Object> body) {
		List<Map<String, Object>> list = (List<Map<String, Object>>) body.get("list");
		String loginid = (String) body.getOrDefault("loginid", "");
		String source  = (String) body.getOrDefault("source",  "");
		return purchaseService.inspectionReturn(list, loginid, source);
	}

	@PostMapping("/insertWarehouseInspection")
	public int insertWarehouseInspection(@RequestBody Map<String, Object> body) {
		List<Map<String, Object>> list = (List<Map<String, Object>>) body.get("list");
		String loginid = (String) body.getOrDefault("loginid", "");
		String source  = (String) body.getOrDefault("source",  "");
		return purchaseService.insertWarehouseInspection(list, loginid, source);
	}

	// 양불 전환 내역
	@PostMapping("/read_conditionChange")
	public Map<String, Object> readConditionChange(@RequestBody Map<String, Object> params) {
		return purchaseService.readConditionChange(params);
	}
}
