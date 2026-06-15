package com.example.demo.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.service.InterfaceService;
import com.example.demo.service.ProductionService;
import com.example.demo.vo.ProductVO;
import com.example.demo.vo.RealStockVO;
import com.example.demo.vo.SemiWorkVO;
import com.example.demo.vo.StockVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class ProductionController {

	@Autowired
	InterfaceService iService;

	@Autowired
	ProductionService productionService;



	@PostMapping("inbound_confirm") // 입고확정
	public int inboundConfirm(@RequestBody List<String> list) {
		iService.inbound_confirm(list);
		return 0;
	}

	@PostMapping("inbound_confirm_cancel") // 입고확정
	public int inboundConfirmCancel(@RequestBody List<String> list) {
		iService.inbound_confirm_cancel(list);
		return 0;
	}
	
	@PostMapping("/excelUpload")
	public Map<String, Object> excelUpload(@RequestParam("file") MultipartFile file){
		Map<String, Object> result = new HashMap<>();
		
		try {
			List<Map<String, Object>> list = productionService.excelUpload(file);
			
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
	
	@GetMapping("/stockCountExcelFormDownload")
	public void downloadExcelForm(HttpServletResponse response) throws Exception {
		System.out.println("downloadExcelForm called");
	    /// 1. 서버에 저장된 파일 경로
	    String filePath = "C:/reportUSA/stockCount_excelform.xlsx";   // 실제 경로로 변경
	    File file = new File(filePath);

	    if (!file.exists()) {
	        response.sendError(HttpServletResponse.SC_NOT_FOUND);
	        return;
	    }

	    // 2. 응답 헤더 설정
	    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
	    response.setHeader("Content-Disposition", "attachment; filename=stockCount_excelform.xlsx");

	    // 3. 파일을 읽어서 OutputStream으로 바로 복사
	    try (FileInputStream fis = new FileInputStream(file);
	         ServletOutputStream os = response.getOutputStream()) {

	        byte[] buffer = new byte[8192];
	        int bytesRead;

	        while ((bytesRead = fis.read(buffer)) != -1) {
	            os.write(buffer, 0, bytesRead);
	        }

	        os.flush();
	    }
	}
	
	@PostMapping("/insertStockCountWIPList")
	public int insertStockCountWIPList (@RequestBody Map<String, Object> body){
	    List<Map<String, Object>> list = (List<Map<String, Object>>) body.get("list");
	    String factory  = (String) body.get("factory");
	    String workshop = (String) body.get("workshop");
	    if(workshop.split("-").length ==2) {
	    	factory = workshop.split("-")[0];
	    	workshop = workshop.split("-")[1];
	    }
	    String loginid = (String) body.get("loginid");
	    String date   = (String) body.get("date");
		return productionService.insertStockCountWIPList(list, factory, workshop, loginid, date);
	}
	
	@PostMapping("/read_stockCountWIPList")
	public Map<String, Object> read_stockCountWIPList(@RequestBody Map<String, Object> params) {
		return productionService.read_stockCountWIPList(params);
	}

//	// 제품 생산실적 - detail
//	@PostMapping("/read_productionDetail")
//	public ResponseEntity<Map<String, Object>> read_productionDetail(@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(productionService.read_productionDetail(requestData));
//	}
//
//	@PostMapping("/read_productionDetail_all")
//	public ResponseEntity<List<Map<String, Object>>> read_productionDetail_all(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(productionService.read_productionDetail_all(requestData));
//	}

//	// 제품 생산실적 - detail
//	@PostMapping("/read_productionSummary")
//	public ResponseEntity<Map<String, Object>> read_productionSummary(@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(productionService.read_productionSummary(requestData));
//	}
//
//	@PostMapping("/read_productionSummary_all")
//	public ResponseEntity<List<Map<String, Object>>> read_productionSummary_all(
//			@RequestBody Map<String, Object> requestData) {
//		return ResponseEntity.ok(productionService.read_productionSummary_all(requestData));
//	}

//	// 반제품 생산실적 - detail
//	@PostMapping("/read_semiProductionDetail")
//	public ResponseEntity<Map<String, Object>> read_semiProductionDetail(@RequestBody Map<String, Object> requestData) {
//		try {
//			// 검색 조건 파라미터 추출
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			Integer page = (Integer) requestData.getOrDefault("page", 1);
//			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);
//
//			// 검색 조건 Map 생성
//			Map<String, Object> paramMap = new HashMap<>();
//			if (searchParams != null) {
//				paramMap.putAll(searchParams);
//			}
//
//			// 페이징 정보 추가
//			paramMap.put("page", page);
//			paramMap.put("itemsPerPage", itemsPerPage);
//			paramMap.put("offset", (page - 1) * itemsPerPage);
//
//			// 서비스 호출
//			List<SemiWorkVO> resultList = productionService.read_semiProductionDetail(paramMap);
//			int totalCount = productionService.getSemiProductionDetailTotalCount(paramMap);
//			BigDecimal totalQty = productionService.getSemiProductionDetailTotalQty(paramMap);
//
//			// 응답 데이터 구성
//			Map<String, Object> response = new HashMap<>();
//			response.put("records", resultList);
//			response.put("totalCount", totalCount);
//			response.put("totalQty", totalQty);
//			response.put("currentPage", page);
//			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));
//
//			return ResponseEntity.ok(response);
//
//		} catch (Exception e) {
//			Map<String, Object> errorResponse = new HashMap<>();
//			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//		}
//	}
//
//	@PostMapping("/read_semiProductionDetail_all")
//	public ResponseEntity<List<Map<String, Object>>> read_semiProductionDetail_all(
//			@RequestBody Map<String, Object> requestData) {
//		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//
//		// 페이징 없이 전체 데이터 조회
//		List<Map<String, Object>> allData = productionService.read_semiProductionDetail_all(searchParams);
//
//		return ResponseEntity.ok(allData);
//	}

//	// 반제품 생산실적 - summary
//	@PostMapping("/read_semiProductionSummary")
//	public ResponseEntity<Map<String, Object>> read_semiProductionSummary(
//			@RequestBody Map<String, Object> requestData) {
//		try {
//			// 검색 조건 파라미터 추출
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			Integer page = (Integer) requestData.getOrDefault("page", 1);
//			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);
//
//			// 검색 조건 Map 생성
//			Map<String, Object> paramMap = new HashMap<>();
//			if (searchParams != null) {
//				paramMap.putAll(searchParams);
//			}
//
//			// 페이징 정보 추가
//			paramMap.put("page", page);
//			paramMap.put("itemsPerPage", itemsPerPage);
//			paramMap.put("offset", (page - 1) * itemsPerPage);
//
//			// 서비스 호출
//			List<SemiWorkVO> resultList = productionService.read_semiProductionSummary(paramMap);
//			int totalCount = productionService.getSemiProductionSummaryTotalCount(paramMap);
//			BigDecimal totalQty = productionService.getSemiProductionSummaryTotalQty(paramMap);
//
//			// 응답 데이터 구성
//			Map<String, Object> response = new HashMap<>();
//			response.put("records", resultList);
//			response.put("totalCount", totalCount);
//			response.put("totalQty", totalQty);
//			response.put("currentPage", page);
//			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));
//
//			return ResponseEntity.ok(response);
//
//		} catch (Exception e) {
//			Map<String, Object> errorResponse = new HashMap<>();
//			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//		}
//	}
//
//	@PostMapping("/read_semiProductionSummary_all")
//	public ResponseEntity<List<Map<String, Object>>> read_semiProductionSummary_all(
//			@RequestBody Map<String, Object> requestData) {
//		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//
//		// 페이징 없이 전체 데이터 조회
//		List<Map<String, Object>> allData = productionService.read_semiProductionSummary_all(searchParams);
//
//		return ResponseEntity.ok(allData);
//	}


	// 이송처리 - summary
//	@PostMapping("/read_transferSummary")
//	public ResponseEntity<Map<String, Object>> read_transferSummary(@RequestBody Map<String, Object> requestData) {
//		try {
//			// 검색 조건 파라미터 추출
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			Integer page = (Integer) requestData.getOrDefault("page", 1);
//			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);
//
//			// 검색 조건 Map 생성
//			Map<String, Object> paramMap = new HashMap<>();
//			if (searchParams != null) {
//				paramMap.putAll(searchParams);
//			}
//
//			// 페이징 정보 추가
//			paramMap.put("page", page);
//			paramMap.put("itemsPerPage", itemsPerPage);
//			paramMap.put("offset", (page - 1) * itemsPerPage);
//
//			// 서비스 호출
//			List<SemiWorkVO> resultList = productionService.read_transferSummary(paramMap);
//			int totalCount = productionService.getTransferSummaryTotalCount(paramMap);
//			int totalQty = productionService.getTransferSummaryTotalQty(paramMap);
//
//			// 응답 데이터 구성
//			Map<String, Object> response = new HashMap<>();
//			response.put("records", resultList);
//			response.put("totalCount", totalCount);
//			response.put("totalQty", totalQty);
//			response.put("currentPage", page);
//			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));
//
//			return ResponseEntity.ok(response);
//
//		} catch (Exception e) {
//			Map<String, Object> errorResponse = new HashMap<>();
//			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//		}
//	}
//
//	@PostMapping("/read_transferSummary_all")
//	public ResponseEntity<List<Map<String, Object>>> read_transferSummary_all(
//			@RequestBody Map<String, Object> requestData) {
//		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//
//		// 페이징 없이 전체 데이터 조회
//		List<Map<String, Object>> allData = productionService.read_transferSummary_all(searchParams);
//
//		return ResponseEntity.ok(allData);
//	}

	// 작업장 내 예외입고 - detail
	@PostMapping("/read_productionExceptionInputDetail")
	public ResponseEntity<Map<String, Object>> read_productionExceptionInputDetail(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionExceptionInputDetail(requestData));
	}

	@PostMapping("/read_productionExceptionInputDetail_all")
	public ResponseEntity<List<Map<String, Object>>> read_productionExceptionInputDetail_all(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionExceptionInputDetail_all(requestData));
	}

	// 작업장 내 예외입고 - summary
	@PostMapping("/read_productionExceptionInputSummary")
	public ResponseEntity<Map<String, Object>> read_productionExceptionInputSummary(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionExceptionInputSummary(requestData));
	}

	@PostMapping("/read_productionExceptionInputSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_productionExceptionInputSummary_all(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionExceptionInputSummary_all(requestData));
	}

	// 작업장 내 예외출고 - detail
	@PostMapping("/read_productionExceptionOutputDetail")
	public ResponseEntity<Map<String, Object>> read_productionExceptionOutputDetail(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionExceptionOutputDetail(requestData));
	}

	@PostMapping("/read_productionExceptionOutputDetail_all")
	public ResponseEntity<List<Map<String, Object>>> read_productionExceptionOutputDetail_all(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionExceptionOutputDetail_all(requestData));
	}

	// 작업장 내 예외입고 - summary
	@PostMapping("/read_productionExceptionOutputSummary")
	public ResponseEntity<Map<String, Object>> read_productionExceptionOutputSummary(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionExceptionOutputSummary(requestData));
	}

	@PostMapping("/read_productionExceptionOutputSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_productionExceptionOutputSummary_all(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionExceptionOutputSummary_all(requestData));
	}

	// 미적재 리스트
	@PostMapping("/read_productionUnloadList")
	public ResponseEntity<Map<String, Object>> read_productionUnloadList(@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionUnloadList(requestData));
	}

	@PostMapping("/read_productionUnloadList_all")
	public ResponseEntity<List<Map<String, Object>>> read_productionUnloadList_all(
			@RequestBody Map<String, Object> requestData) {
		return ResponseEntity.ok(productionService.read_productionUnloadList_all(requestData));
	}

    // 재고조회 - detail
    @PostMapping("/read_productionStockDetail")
    public ResponseEntity<Map<String, Object>> read_productionStockDetail(@RequestBody Map<String, Object> requestData) {
        return ResponseEntity.ok(productionService.read_productionStockDetail(requestData));
    } 
    
    @PostMapping("/read_productionStockDetail_all")
    public ResponseEntity<List<Map<String, Object>>> read_productionStockDetail_all(@RequestBody Map<String, Object> requestData) {
        return ResponseEntity.ok(productionService.read_productionStockDetail_all(requestData));
    }
    
    // 재고조회 - summary
    @PostMapping("/read_productionStockSummary")
    public ResponseEntity<Map<String, Object>> read_productionStockSummary(@RequestBody Map<String, Object> requestData) {
        return ResponseEntity.ok(productionService.read_productionStockSummary(requestData));
    } 
    
    @PostMapping("/read_productionStockSummary_all")
    public ResponseEntity<List<Map<String, Object>>> read_productionStockSummary_all(@RequestBody Map<String, Object> requestData) {
        return ResponseEntity.ok(productionService.read_productionStockSummary_all(requestData));
    }
    
    // 재고정보
    @PostMapping("/read_productionStockInfo")
    public ResponseEntity<Map<String, Object>> read_productionStockInfo(@RequestBody Map<String, Object> requestData) {
        return ResponseEntity.ok(productionService.read_productionStockInfo(requestData));
    } 
    
    @PostMapping("/read_productionStockInfo_all")
    public ResponseEntity<List<Map<String, Object>>> read_productionStockInfo_all(@RequestBody Map<String, Object> requestData) {
        return ResponseEntity.ok(productionService.read_productionStockInfo_all(requestData));
    }

	// 재고 실사 조회
	@PostMapping("/read_productionStockCountList")
	public ResponseEntity<Map<String, Object>> read_productionStockCountList(
			@RequestBody Map<String, Object> requestData) {
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
			System.out.println(paramMap);
			// 페이징 정보 추가
			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);

			// 서비스 호출
			List<RealStockVO> resultList = productionService.read_productionStockCountList(paramMap);
			int totalCount = productionService.getProductionStockCountListTotalCount(paramMap);

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

	@PostMapping("/read_stockCountWIPWrokList")
	public ResponseEntity<Map<String, Object>> read_stockCountWIPWrokList(
			@RequestBody Map<String, Object> requestData) {
		try {
			// 검색 조건 파라미터 추출
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);
			
			// 검색 조건 Map 생성
			Map<String, Object> paramMap = new HashMap<>();
			if (searchParams != null) {
				String wc = (String)searchParams.get("wc");
				
				paramMap.putAll(searchParams);
				if(wc.split("-").length ==2) {
					paramMap.put("factory", wc.split("-")[0]);
					paramMap.put("wc", wc.split("-")[1]);
				}
			}
			System.out.println(paramMap);
			System.out.println(paramMap);
			
			// 서비스 호출
			List<RealStockVO> resultList = productionService.read_stockCountWIPWrokList(paramMap);
			
			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			
			return ResponseEntity.ok(response);
			
		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/read_productionStockCountSummary")
	public ResponseEntity<Map<String, Object>> read_productionStockCountSummary(
			@RequestBody Map<String, Object> requestData) {
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
			List<RealStockVO> resultList = productionService.read_productionStockCountSummary(paramMap);
			int totalCount = productionService.getProductionStockCountSummaryTotalCount(paramMap);

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

	@PostMapping("/read_productionStockCountList_all")
	public ResponseEntity<List<Map<String, Object>>> read_productionStockCountList_all(@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = productionService.read_productionStockCountList_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	@PostMapping("/read_productionStockCountSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_productionStockCountSummary_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = productionService.read_productionStockCountSummary_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	@PostMapping("/updateTotalQty_productionStockCount")
	public String updateTotalQty_productionStockCount(@RequestBody Map<String, Object> param) {
		return productionService.updateTotalQtyProductionStockCount(param);
	}

	// 재고 실사 검증
	@PostMapping("/read_productionStockCountCompare")
	public ResponseEntity<Map<String, Object>> read_productionStockCountCompare(@RequestBody Map<String, Object> requestData) {
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

			List<StockVO> resultList = productionService.read_productionStockCountCompare(paramMap);
			// int totalCount = purchaseService.getStockCountCompareTotalCount(paramMap); //
			// 페이징 기능 삭제 251001 hj
			// Controller
			// Map<String, Object> totalMap =
			// purchaseService.getStockCountCompareTotal(paramMap); // 페이징 기능 삭제 251001 hj

//			BigDecimal totalQty_real = totalMap.get("TOTALQTY_REAL") != null
//					? new BigDecimal(totalMap.get("TOTALQTY_REAL").toString())
//					: BigDecimal.ZERO;
//
//			BigDecimal totalCount_real = totalMap.get("TOTALCOUNT_REAL") != null
//					? new BigDecimal(totalMap.get("TOTALCOUNT_REAL").toString())
//					: BigDecimal.ZERO;
//
//			BigDecimal totalQty_system = totalMap.get("TOTALQTY_SYSTEM") != null
//					? new BigDecimal(totalMap.get("TOTALQTY_SYSTEM").toString())
//					: BigDecimal.ZERO;
//
//			BigDecimal totalCount_system = totalMap.get("TOTALCOUNT_SYSTEM") != null
//					? new BigDecimal(totalMap.get("TOTALCOUNT_SYSTEM").toString())
//					: BigDecimal.ZERO;

			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			// response.put("totalCount", totalCount);
			// response.put("currentPage", page);
			// response.put("totalPages", (int) Math.ceil((double) totalCount /
			// itemsPerPage));

//			response.put("totalQty_real", totalQty_real);
//			response.put("totalCount_real", totalCount_real);
//			response.put("totalQty_system", totalQty_system);
//			response.put("totalCount_system", totalCount_system);

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	// 재고 실사 검증 - 엑셀
	@PostMapping("/read_productionStockCountCompare_all")
	public ResponseEntity<List<Map<String, Object>>> read_productionStockCountCompare_all(
			@RequestBody Map<String, Object> requestData) {
		System.out.println(requestData.get("searchParams"));
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = productionService.read_productionStockCountCompare_all(searchParams);

		return ResponseEntity.ok(allData);
	}

	// 재고 실사 검증 세부사항
	@PostMapping("/read_productionStockCountCompare_detail")
	public Map<String, Object> read_productionStockCountCompare_detail(@RequestBody Map<String, Object> param) {
		return productionService.read_productionStockCountCompare_detail(param);
	}
	
	// 재고 실사 (미스캔)
	
	@PostMapping("/read_productionStockCountMissing")
	public ResponseEntity<Map<String, Object>> read_productionStockCountMissing(@RequestBody Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			Integer page = (Integer) requestData.getOrDefault("page", 1);
			Integer itemsPerPage = (Integer) requestData.getOrDefault("itemsPerPage", 100);

			// 검색 조건 Map 생성
			Map<String, Object> paramMap = new HashMap<>();
			if (searchParams != null) {
				paramMap.putAll(searchParams);
			}

			System.out.println(paramMap);

			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);

			System.out.println("IN _STOCK_MISS");
			System.out.println(paramMap); // 이제 {barcode=C01136621020}로 출력됨

			List<StockVO> resultList = productionService.read_productionStockCountMissing(paramMap);
			int totalCount = productionService.getProductionStockCountMissingTotalCount(paramMap);
			BigDecimal totalQty = productionService.getProductionStockCountMissingTotalQty(paramMap);
			// Controller
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
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
	
	// 재고 실사 (미스캔) - 엑셀
	@PostMapping("/read_productionStockCountMissing_all")
	public ResponseEntity<List<Map<String, Object>>> read_stockCountMissing_all(
			@RequestBody Map<String, Object> requestData) {
		System.out.println(requestData.get("searchParams"));
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");

		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = productionService.read_productionStockCountMissing_all(searchParams);

		return ResponseEntity.ok(allData);
	}	
	
	// 언팩 바코드 조회
	@PostMapping("/productionRealStockNotScan")
	public Map<String, Object> productionRealStockNotScan(@RequestBody Map<String, Object> param) {
		return productionService.productionRealStockNotScan(param);
	}
	
	// 재고 실사 ERP
	@PostMapping("/read_productionErpInterfaceSummary")
	public ResponseEntity<Map<String, Object>> read_productionErpInterfaceSummary(@RequestBody Map<String, Object> requestData) {
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
				if ("SALTILLO".equals(factory) && "Material".equals(storage)) {
					storageList.add("Material");
					storageList.add("Side seat");
					storageList.add("Outside");
				} else if ("all".equals(storage)) {
					storageList.add("Material");
					storageList.add("Fabric");
					storageList.add("Side seat");
					storageList.add("Outside");
					storageList.add("PRODUCT");
				} else {
					storageList.add(storage);
				}
				paramMap.put("storage", storageList);
			}

			// 페이징 정보 추가
			paramMap.put("page", page);
			paramMap.put("itemsPerPage", itemsPerPage);
			paramMap.put("offset", (page - 1) * itemsPerPage);

			// 서비스 호출
			List<ProductVO> resultList = productionService.read_productionErpInterfaceSummary(paramMap);
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
	
	@PostMapping("/read_productionErpInterfaceSummary_all")
	public ResponseEntity<List<Map<String, Object>>> read_productionErpInterfaceSummary_all(
			@RequestBody Map<String, Object> requestData) {
		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
		// 검색 조건 Map 생성
		Map<String, Object> paramMap = new HashMap<>();
		if (searchParams != null) {
			paramMap.putAll(searchParams);
			// SALTILLO + Material 처리
			String factory = (String) searchParams.get("factory");
			String storage = (String) searchParams.get("storage");

			List<String> storageList = new ArrayList<>();
			if ("SALTILLO".equals(factory) && "Material".equals(storage)) {
				storageList.add("Material");
				storageList.add("Side seat");
				storageList.add("Outside");
			} else if ("all".equals(storage)) {
				storageList.add("Material");
				storageList.add("Fabric");
				storageList.add("Side seat");
				storageList.add("Outside");
				storageList.add("PRODUCT");
			} else {
				storageList.add(storage);
			}
			paramMap.put("storage", storageList);
		}
		// 페이징 없이 전체 데이터 조회
		List<Map<String, Object>> allData = productionService.read_productionErpInterfaceSummary_all(paramMap);

		return ResponseEntity.ok(allData);
	}

	@PostMapping("/read_productionWipStockList")
	public Map<String, Object> read_productionWipStockList(@RequestBody Map<String, Object> params) {
		return productionService.read_productionWipStockList(params);
	}
	
	// 생산실적 - 생산실적 List
	@PostMapping("/read_productionDetail")
	public Map<String, Object> readProductionDetail(@RequestBody Map<String, Object> params) {
		return productionService.readProductionDetail(params);
	}
	
	// 생산실적 - 생산실적 Sum
	@PostMapping("/read_productionSummary")
	public Map<String, Object> readProductionSummary(@RequestBody Map<String, Object> params) {
		return productionService.readProductionSummary(params);
	}
	
	// 생산실적 - 반제품생산 List
	@PostMapping("/read_semiProductionDetail")
	public Map<String, Object> readSemiProductionDetail(@RequestBody Map<String, Object> params) {
		return productionService.readSemiProductionDetail(params);
	}
	
	// 생산실적 - 반제품생산 Sum
	@PostMapping("/read_semiProductionSummary")
	public Map<String, Object> readSemiProductionSummary(@RequestBody Map<String, Object> params) {
		return productionService.readSemiProductionSummary(params);
	}
}
