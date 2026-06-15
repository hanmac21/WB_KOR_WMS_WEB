/* --------------------------------------------------------------
 * 📋 ProductionService 인터페이스 및 구현체
 * -------------------------------------------------------------- */

package com.example.demo.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.mapper.wbmex.ProductionMapper;
import com.example.demo.vo.LocationVO;
import com.example.demo.vo.ProductVO;
import com.example.demo.vo.RealStockNotScanVO;
import com.example.demo.vo.RealStockVO;
import com.example.demo.vo.SemiWorkVO;
import com.example.demo.vo.StockVO;
import com.example.demo.vo.WorkVO;

@Service
public class ProductionServiceImpl implements ProductionService {

	@Autowired
	private ProductionMapper productionMapper;
	
	@Override
	public List<Map<String, Object>> excelUpload(MultipartFile file) throws IOException {
		// 1. 파일명 / 확장자 체크
        String filename = file.getOriginalFilename();
        if (filename == null || 
           !(filename.toLowerCase().endsWith(".xlsx") || filename.toLowerCase().endsWith(".xls"))) {
            throw new IllegalArgumentException("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
        }

        List<Map<String, Object>> list = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new IllegalArgumentException("엑셀 시트가 비어 있습니다.");
            }
            
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
            
			int rowCount = sheet.getPhysicalNumberOfRows();
			
			for (int i = 1; i < rowCount; i++) {
				Row row = sheet.getRow(i);
				if (row == null) continue;
				
				String itemcode = String.valueOf(getCellValue(row.getCell(0), evaluator)).trim();
				String itemname = String.valueOf(getCellValue(row.getCell(1), evaluator)).trim();
				
				if (itemcode.isEmpty() ) continue;       // "" or "   " = skip
				
				//String itemname = productionMapper.getItemName(itemcode);

				Object qty  = getCellValue(row.getCell(2), evaluator);
				Object bqty = getCellValue(row.getCell(3), evaluator);

				boolean qtyNumeric  = qty  instanceof Number;
				boolean bqtyNumeric = bqty instanceof Number;
				if (!qtyNumeric && !bqtyNumeric) continue;

				Map<String, Object> map = new HashMap<>();
				map.put("itemcode", itemcode);
				map.put("itemname", itemname);
				map.put("qty",  qtyNumeric  ? qty  : null);
				map.put("bqty", bqtyNumeric ? bqty : null);

				list.add(map);
			}
        }
        
		return list;		
	}
	
	
	private Object getCellValue(Cell cell, FormulaEvaluator evaluator) {
	    if (cell == null) return "";

	    switch (cell.getCellType()) {
	        case STRING:  return cell.getStringCellValue();
	        case NUMERIC: return cell.getNumericCellValue();
	        case BOOLEAN: return cell.getBooleanCellValue();
	        case FORMULA:
	            // 수식 결과 타입 기준으로 다시 분기
	            switch (cell.getCachedFormulaResultType()) {
	                case STRING:  return cell.getStringCellValue();
	                case NUMERIC: return cell.getNumericCellValue();
	                case BOOLEAN: return cell.getBooleanCellValue();
	                default: return "";
	            }
	        default: return "";
	    }
	}

	
	// 재공 재고 실사 저장
	@Override
	public int insertStockCountWIPList(List<Map<String, Object>> list, String factory, String workshop , String loginid, String date) {
		System.out.println(list);

		int insertResult = 0;
		
		for(Map<String, Object> row : list) {
			System.out.println(row);
			System.out.println(date);
			String itemcode = (String) row.get("itemcode");
			Object o = row.get("qty");

			BigDecimal qty = (o == null)
			        ? BigDecimal.ZERO
			        : new BigDecimal(o.toString()).setScale(2, RoundingMode.HALF_UP);
			//BigDecimal qty = row.get("qty") == null ? BigDecimal.ZERO : BigDecimal.valueOf(((Number) row.get("qty")).longValue());
			Map<String, Object> param = new HashMap<>();
			param.put("itemcode", itemcode);
			param.put("qty", qty.stripTrailingZeros().toPlainString());
			param.put("factory", factory);
			param.put("workshop", workshop);
			param.put("loginid", loginid);
			param.put("date", date);
			
			if (productionMapper.searchStockCountWIPList(param) > 0) {
				continue;
			}			
			
			productionMapper.updateStockCountWIPList(param);							// 기존 데이터 N으로 업데이트
			insertResult += productionMapper.insertStockCountWIPList(param);			// 새 데이터 Insert
		}
		return insertResult;
	}

	@Override
	public Map<String, Object> read_stockCountWIPList(Map<String, Object> params){
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");
		
		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);
		
		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();
		
		try {
			// 쿼리 실행
			List<Map<String, Object>> records = productionMapper.read_stockCountWIPList(queryParams);
			
			result.put("records", records);
			
			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
								: 0;
				
				result.put("totalCount", totalCount);
				
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
			}
			
		} catch (Exception e) {
			// 예외 발생 시 기본값 설정
			e.printStackTrace();
			result.put("records", new ArrayList<>());
			result.put("totalCount", 0);
		}
		
		return result;
	}
	
	
	//Total Qty
	@Override
	public String updateTotalQtyProductionStockCount(Map<String, Object> param) {
		return productionMapper.updateTotalQtyProductionStockCount(param);
	}
	
//	// 제품 생산실적 - detail
//	@Override
//	public Map<String, Object> read_productionDetail(Map<String, Object> requestData) {
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
//			List<WorkVO> resultList = productionMapper.read_productionDetail(paramMap);
//			int totalCount = productionMapper.getProductionDetailTotalCount(paramMap);
//			BigDecimal totalQty = productionMapper.getProductionDetailTotalQty(paramMap);
//
//			// 응답 데이터 구성
//			Map<String, Object> response = new HashMap<>();
//			response.put("records", resultList);
//			response.put("totalCount", totalCount);
//			response.put("totalQty", totalQty);
//			response.put("currentPage", page);
//			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));
//
//			return response;
//
//		} catch (Exception e) {
//			Map<String, Object> errorResponse = new HashMap<>();
//			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
//			return errorResponse;
//		}
//	}
//	
//	@Override
//	public List<Map<String, Object>> read_productionDetail_all(Map<String, Object> requestData) {
//		try {
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			return productionMapper.read_productionDetail_all(searchParams);
//		} catch (Exception e) {
//			throw new RuntimeException("제품 생산 실적 목록 조회 실패", e);
//		}
//	}
	
//	// 제품 생산실적 - summary
//	@Override
//	public Map<String, Object> read_productionSummary(Map<String, Object> requestData) {
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
//			List<WorkVO> resultList = productionMapper.read_productionSummary(paramMap);
//			int totalCount = productionMapper.getProductionSummaryTotalCount(paramMap);
//			BigDecimal totalQty = productionMapper.getProductionSummaryTotalQty(paramMap);
//
//			// 응답 데이터 구성
//			Map<String, Object> response = new HashMap<>();
//			response.put("records", resultList);
//			response.put("totalCount", totalCount);
//			response.put("totalQty", totalQty);
//			response.put("currentPage", page);
//			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));
//
//			return response;
//
//		} catch (Exception e) {
//			Map<String, Object> errorResponse = new HashMap<>();
//			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
//			return errorResponse;
//		}
//	}
//	
//	@Override
//	public List<Map<String, Object>> read_productionSummary_all(Map<String, Object> requestData) {
//		try {
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			return productionMapper.read_productionSummary_all(searchParams);
//		} catch (Exception e) {
//			throw new RuntimeException("제품 생산 실적 목록 조회 실패", e);
//		}
//	}
	
//	// 반제품 생산실적 - detail
//	@Override
//	public List<SemiWorkVO> read_semiProductionDetail(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.read_semiProductionDetail(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("반제품 생산실적 목록 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public List<Map<String, Object>> read_semiProductionDetail_all(Map<String, Object> searchParam) {
//		try {
//			return productionMapper.read_semiProductionDetail_all(searchParam);
//		} catch (Exception e) {
//			throw new RuntimeException("반제품 생산실적 전체 목록 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public int getSemiProductionDetailTotalCount(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.getSemiProductionDetailTotalCount(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("반제품 생산실적 총 개수 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public BigDecimal getSemiProductionDetailTotalQty(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.getSemiProductionDetailTotalQty(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("반제품 생산실적 총 개수 조회 실패", e);
//		}
//	}
	
//	// 반제품 생산실적 - summary
//	@Override
//	public List<SemiWorkVO> read_semiProductionSummary(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.read_semiProductionSummary(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("반제품 생산실적 목록 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public List<Map<String, Object>> read_semiProductionSummary_all(Map<String, Object> searchParam) {
//		try {
//			return productionMapper.read_semiProductionSummary_all(searchParam);
//		} catch (Exception e) {
//			throw new RuntimeException("반제품 생산실적 전체 목록 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public int getSemiProductionSummaryTotalCount(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.getSemiProductionSummaryTotalCount(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("반제품 생산실적 총 개수 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public BigDecimal getSemiProductionSummaryTotalQty(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.getSemiProductionSummaryTotalQty(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("반제품 생산실적 총 개수 조회 실패", e);
//		}
//	}
	
//	// 이송처리- detail
//	@Override
//	public List<SemiWorkVO> read_transferDetail(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.read_transferDetail(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("이송처리 목록 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public List<Map<String, Object>> read_transferDetail_all(Map<String, Object> searchParam) {
//		try {
//			return productionMapper.read_transferDetail_all(searchParam);
//		} catch (Exception e) {
//			throw new RuntimeException("이송처리 전체 목록 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public int getTransferDetailTotalCount(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.getTransferDetailTotalCount(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("이송처리 총 개수 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public int getTransferDetailTotalQty(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.getTransferDetailTotalQty(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("이송처리 총 개수 조회 실패", e);
//		}
//	}
//	
//	// 이송처리- detail
//	@Override
//	public List<SemiWorkVO> read_transferSummary(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.read_transferSummary(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("이송처리 목록 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public List<Map<String, Object>> read_transferSummary_all(Map<String, Object> searchParam) {
//		try {
//			return productionMapper.read_transferSummary_all(searchParam);
//		} catch (Exception e) {
//			throw new RuntimeException("이송처리 전체 목록 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public int getTransferSummaryTotalCount(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.getTransferSummaryTotalCount(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("이송처리 총 개수 조회 실패", e);
//		}
//	}
//	
//	@Override
//	public int getTransferSummaryTotalQty(Map<String, Object> paramMap) {
//		try {
//			return productionMapper.getTransferSummaryTotalQty(paramMap);
//		} catch (Exception e) {
//			throw new RuntimeException("이송처리 총 개수 조회 실패", e);
//		}
//	}
	
	// 작업장 내 예외 입고 - detail
	@Override
	public Map<String, Object> read_productionExceptionInputDetail(Map<String, Object> requestData) {
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
			List<ProductVO> resultList = productionMapper.read_productionExceptionInputDetail(paramMap);
			int totalCount = productionMapper.getProductionExceptionInputDetailTotalCount(paramMap);
			BigDecimal totalQty = productionMapper.getProductionExceptionInputDetailTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return response;

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return errorResponse;
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionExceptionInputDetail_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return productionMapper.read_productionExceptionInputDetail_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("생산 - 예외입고 목록 조회 실패", e);
		}
	}
	
	// 작업장 내 예외 입고 - summary
	@Override
	public Map<String, Object> read_productionExceptionInputSummary(Map<String, Object> requestData) {
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
			List<ProductVO> resultList = productionMapper.read_productionExceptionInputSummary(paramMap);
			int totalCount = productionMapper.getProductionExceptionInputSummaryTotalCount(paramMap);
			BigDecimal totalQty = productionMapper.getProductionExceptionInputSummaryTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return response;

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return errorResponse;
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionExceptionInputSummary_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return productionMapper.read_productionExceptionInputSummary_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("생산 - 예외 입고 조회 실패", e);
		}
	}
	
	// 작업장 내 예외 츌고 - detail
	@Override
	public Map<String, Object> read_productionExceptionOutputDetail(Map<String, Object> requestData) {
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
			List<ProductVO> resultList = productionMapper.read_productionExceptionOutputDetail(paramMap);
			int totalCount = productionMapper.getProductionExceptionOutputDetailTotalCount(paramMap);
			BigDecimal totalQty = productionMapper.getProductionExceptionOutputDetailTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return response;

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return errorResponse;
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionExceptionOutputDetail_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return productionMapper.read_productionExceptionOutputDetail_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("제품 생산 실적 목록 조회 실패", e);
		}
	}
	
	// 작업장 내 예외 입고 - summary
	@Override
	public Map<String, Object> read_productionExceptionOutputSummary(Map<String, Object> requestData) {
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
			List<ProductVO> resultList = productionMapper.read_productionExceptionOutputSummary(paramMap);
			int totalCount = productionMapper.getProductionExceptionOutputSummaryTotalCount(paramMap);
			BigDecimal totalQty = productionMapper.getProductionExceptionOutputSummaryTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return response;

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return errorResponse;
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionExceptionOutputSummary_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return productionMapper.read_productionExceptionOutputSummary_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("생산 - 예외 입고 조회 실패", e);
		}
	}
	
	// 미적재 리스트 조회
	@Override
	public Map<String, Object> read_productionUnloadList(Map<String, Object> requestData) {
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
			List<LocationVO> resultList = productionMapper.read_productionUnloadList(paramMap);
			int totalCount = productionMapper.getProductionUnloadListTotalCount(paramMap);
			BigDecimal totalQty = productionMapper.getProductionUnloadListTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return response;

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return errorResponse;
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionUnloadList_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return productionMapper.read_productionUnloadList_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("미적재 리스트 조회 실패", e);
		}
	}

	// 재고조회 - detail
	@Override
	public Map<String, Object> read_productionStockDetail(Map<String, Object> requestData) {
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
			List<StockVO> resultList = productionMapper.read_productionStockDetail(paramMap);
			int totalCount = productionMapper.getProductionStockDetailTotalCount(paramMap);
			BigDecimal totalQty = productionMapper.getProductionStockDetailTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return response;

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return errorResponse;
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionStockDetail_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return productionMapper.read_productionStockDetail_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("재고조회 목록 조회 실패", e);
		}
	}
	
	// 재고조회 - summary
	@Override
	public Map<String, Object> read_productionStockSummary(Map<String, Object> requestData) {
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
			List<StockVO> resultList = productionMapper.read_productionStockSummary(paramMap);
			int totalCount = productionMapper.getProductionStockSummaryTotalCount(paramMap);
			BigDecimal totalQty = productionMapper.getProductionStockSummaryTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return response;

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return errorResponse;		
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionStockSummary_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return productionMapper.read_productionStockSummary_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("재고조회 목록 조회 실패", e);
		}
	}
	
	// 재고정보
	@Override
	public Map<String, Object> read_productionStockInfo(Map<String, Object> requestData) {
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
			List<StockVO> resultList = productionMapper.read_productionStockInfo(paramMap);
			int totalCount = productionMapper.getProductionStockInfoTotalCount(paramMap);
			BigDecimal totalQty = productionMapper.getProductionStockInfoTotalQty(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("totalQty", totalQty);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return response;

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return errorResponse;
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionStockInfo_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return productionMapper.read_productionStockInfo_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("재고조회 목록 조회 실패", e);
		}
	}
	
	// 재고 실사 조회
	
	@Override
	public List<RealStockVO> read_productionStockCountList(Map<String, Object> paramMap) {
		try {
			return productionMapper.read_productionStockCountList(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 목록 조회 실패", e);
		}
	}

	@Override
	public List<RealStockVO> read_stockCountWIPWrokList(Map<String, Object> paramMap) {
		try {
			System.out.println("paramMap 서비스임플:"+paramMap);
			return productionMapper.read_stockCountWIPWrokList(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 목록 조회 실패", e);
		}
	}

	@Override
	public List<RealStockVO> read_productionStockCountSummary(Map<String, Object> paramMap) {
		try {
			return productionMapper.read_productionStockCountSummary(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 목록 조회 실패", e);
		}
	}

	@Override
	public int getProductionStockCountListTotalCount(Map<String, Object> paramMap) {
		try {
			return productionMapper.getProductionStockCountListTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 총 개수 조회 실패", e);
		}
	}

	@Override
	public int getProductionStockCountSummaryTotalCount(Map<String, Object> paramMap) {
		try {
			return productionMapper.getProductionStockCountSummaryTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 총 개수 조회 실패", e);
		}
	}
	
	// 재고 실사 조회
	@Override
	public List<Map<String, Object>> read_productionStockCountList_all(Map<String, Object> searchParam) {
		try {
			return productionMapper.read_productionStockCountList_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 전체 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_productionStockCountSummary_all(Map<String, Object> searchParam) {
		try {
			return productionMapper.read_productionStockCountSummary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 전체 목록 조회 실패", e);
		}
	}
	
	// 재고 실사 검증
	@Override
	public List<StockVO> read_productionStockCountCompare(Map<String, Object> paramMap) {
		try {
			return productionMapper.read_productionStockCountCompare(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionStockCountCompare_all(Map<String, Object> searchParam) {
		try {
			return productionMapper.read_productionStockCountCompare_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}
	
	@Override
	public Map<String, Object> read_productionStockCountCompare_detail(Map<String, Object> param) {
		System.out.println(param);
		Map<String, Object> resultParam = new HashMap<String, Object>();
		// resultParam.put("stockDB",
		// productionMapper.readStockCountCompare_detail_stock(param));
		// resultParam.put("realStockDB",
		// productionMapper.readStockCountCompare_detail_realStock(param));
		resultParam.put("stockDB", productionMapper.read_productionStockCountCompare_detail(param));
		return resultParam;
	}
	
	// 재고 실사 (미스캔)
	@Override
	public List<StockVO> read_productionStockCountMissing(Map<String, Object> paramMap) {
		try {
			return productionMapper.read_productionStockCountMissing(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public int getProductionStockCountMissingTotalCount(Map<String, Object> paramMap) {
		try {
			return productionMapper.getProductionStockCountMissingTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public BigDecimal getProductionStockCountMissingTotalQty(Map<String, Object> paramMap) {
		try {
			return productionMapper.getProductionStockCountMissingTotalQty(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_productionStockCountMissing_all(Map<String, Object> searchParam) {
		try {
			return productionMapper.read_productionStockCountMissing_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}
	
	@Override
	public Map<String, Object> productionRealStockNotScan(Map<String, Object> param) {
		System.out.println(param);
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			productionMapper.deleteProductionRealStockNotScan(param);

			Map<String, Object> map = new HashMap<String, Object>();
			List<String> unique = (List<String>) param.get("barcode");
			List<String> barcodes = new ArrayList<String>();
			List<String> qty = new ArrayList<String>();
			List<String> itemcode = new ArrayList<String>();
			List<RealStockNotScanVO> stockList = new ArrayList<RealStockNotScanVO>();
			for (int i = 0; i < unique.size(); i++) {
				String parts[] = unique.get(i).split("_");
				RealStockNotScanVO vo = new RealStockNotScanVO();
				vo.setBarcode(parts[0]);
				vo.setQty(parts[1].replaceAll(",", ""));
				vo.setItemcode(parts[2]);
				vo.setDate((String) param.get("date"));
				vo.setFactory((String) param.get("factory"));
				vo.setStorage((String) param.get("storage"));
				vo.setLoginid((String) param.get("loginid"));
				stockList.add(vo);
			}
			if (unique.size() > 0) {
				int ins = productionMapper.insertProductionRealStockNotScan(stockList);
			}
			// 정상 수행 시
			result.put("success", true);
			result.put("message", "정상 처리되었습니다.");

		} catch (Exception e) {
			// 에러 발생 시
			result.put("success", false);
			result.put("message", e.getMessage());
			e.printStackTrace();
		}
		return result;
	}
	
	// 재고 실사 ERP
	@Override
	public List<ProductVO> read_productionErpInterfaceSummary(Map<String, Object> paramMap) {
		try {
			return productionMapper.read_productionErpInterfaceSummary(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("ERP 목록 조회 실패", e);
		}
	}
	
	@Override
	public List<Map<String, Object>> read_productionErpInterfaceSummary_all(Map<String, Object> searchParam) {
		try {
			return productionMapper.read_productionErpInterfaceSummary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("ERP 전체 목록 조회 실패", e);
		}
	}

	@Override
	public Map<String, Object> read_productionWipStockList(Map<String, Object> params) {
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		Integer itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);

		// 페이징 파라미터가 있을 때만 설정
		if (page != null && page > 0) {
			int offset = (page - 1) * itemsPerPage;
			queryParams.put("offset", offset);
			queryParams.put("limit", itemsPerPage);
		}

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();

		try {
			// 쿼리 실행
			System.out.println(queryParams);
			List<Map<String, Object>> records = productionMapper.read_productionWipStockList(queryParams);

			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
						: 0;
				Double totalQty = firstRecord.get("TOTALQTY") != null ? ((Number) firstRecord.get("TOTALQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				if (page != null && page > 0) {
					result.put("totalPages", 0);
				}
			}

		} catch (Exception e) {
			// 예외 발생 시 기본값 설정
			e.printStackTrace();
			result.put("records", new ArrayList<>());
			result.put("totalCount", 0);
			result.put("totalQty", 0);
			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}

	// 생산실적 - 생산실적 List
	@Override
	public Map<String, Object> readProductionDetail(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		Integer itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);

		// 페이징 파라미터가 있을 때만 설정
		if (page != null && page > 0) {
			int offset = (page - 1) * itemsPerPage;
			queryParams.put("offset", offset);
			queryParams.put("limit", itemsPerPage);
		}

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();

		try {
			// 쿼리 실행
			List<Map<String, Object>> records = productionMapper.readProductionDetail(queryParams);
			System.out.println("--------------");
			System.out.println(queryParams);
			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
						: 0;
				Double totalQty = firstRecord.get("TOTALQTY") != null
						? ((Number) firstRecord.get("TOTALQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				if (page != null && page > 0) {
					result.put("totalPages", 0);
				}
			}

		} catch (Exception e) {
			// 예외 발생 시 기본값 설정
			e.printStackTrace();
			result.put("records", new ArrayList<>());
			result.put("totalCount", 0);
			result.put("totalQty", 0);
			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}
	
	// 생산실적 - 생산실적 Sum
	@Override
	public Map<String, Object> readProductionSummary(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		Integer itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);

		// 페이징 파라미터가 있을 때만 설정
		if (page != null && page > 0) {
			int offset = (page - 1) * itemsPerPage;
			queryParams.put("offset", offset);
			queryParams.put("limit", itemsPerPage);
		}

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();

		try {
			// 쿼리 실행
			List<Map<String, Object>> records = productionMapper.readProductionSummary(queryParams);
			System.out.println("--------------");
			System.out.println(queryParams);
			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
						: 0;
				Double totalQty = firstRecord.get("TOTALQTY") != null
						? ((Number) firstRecord.get("TOTALQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				if (page != null && page > 0) {
					result.put("totalPages", 0);
				}
			}

		} catch (Exception e) {
			// 예외 발생 시 기본값 설정
			e.printStackTrace();
			result.put("records", new ArrayList<>());
			result.put("totalCount", 0);
			result.put("totalQty", 0);
			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}
		
	// 생산실적 - 반제품생산
	@Override
	public Map<String, Object> readSemiProductionDetail(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		Integer itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);

		// 페이징 파라미터가 있을 때만 설정
		if (page != null && page > 0) {
			int offset = (page - 1) * itemsPerPage;
			queryParams.put("offset", offset);
			queryParams.put("limit", itemsPerPage);
		}

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();

		try {
			// 쿼리 실행
			List<Map<String, Object>> records = productionMapper.readSemiProductionDetail(queryParams);
			System.out.println("--------------");
			System.out.println(queryParams);
			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
						: 0;
				Double totalQty = firstRecord.get("TOTALQTY") != null
						? ((Number) firstRecord.get("TOTALQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				if (page != null && page > 0) {
					result.put("totalPages", 0);
				}
			}

		} catch (Exception e) {
			// 예외 발생 시 기본값 설정
			e.printStackTrace();
			result.put("records", new ArrayList<>());
			result.put("totalCount", 0);
			result.put("totalQty", 0);
			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}
	
	// 생산실적 - 반제품생산
	@Override
	public Map<String, Object> readSemiProductionSummary(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		Integer itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);

		// 페이징 파라미터가 있을 때만 설정
		if (page != null && page > 0) {
			int offset = (page - 1) * itemsPerPage;
			queryParams.put("offset", offset);
			queryParams.put("limit", itemsPerPage);
		}

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();

		try {
			// 쿼리 실행
			List<Map<String, Object>> records = productionMapper.readSemiProductionSummary(queryParams);
			System.out.println("--------------");
			System.out.println(queryParams);
			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
						: 0;
				Double totalQty = firstRecord.get("TOTALQTY") != null
						? ((Number) firstRecord.get("TOTALQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				if (page != null && page > 0) {
					result.put("totalPages", 0);
				}
			}

		} catch (Exception e) {
			// 예외 발생 시 기본값 설정
			e.printStackTrace();
			result.put("records", new ArrayList<>());
			result.put("totalCount", 0);
			result.put("totalQty", 0);
			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}
}