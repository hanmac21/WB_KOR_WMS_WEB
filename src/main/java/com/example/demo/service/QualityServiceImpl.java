/* --------------------------------------------------------------
 * 📋 QualityService 인터페이스 및 구현체
 * -------------------------------------------------------------- */

package com.example.demo.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jfree.util.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.mapper.wbusa.QualityMapper;
import com.example.demo.mapper.wbusa.WbusaMapper;
import com.example.demo.vo.BomDecompositionVO;
import com.example.demo.vo.DefectiveVO;

@Service
public class QualityServiceImpl implements QualityService {

	@Autowired
	private QualityMapper qualityMapper;
	@Autowired
	private WbusaMapper purchaseMapper;

	// 품질 불량 - detail
	@Override
	public Map<String, Object> read_qualityDefectDetail(Map<String, Object> requestData) {
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
			List<DefectiveVO> resultList = qualityMapper.read_qualityDefectDetail(paramMap);
			int totalCount = qualityMapper.getQualityDefectDetailTotalCount(paramMap);
			BigDecimal totalQty = qualityMapper.getQualityDefectDetailTotalQty(paramMap);

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
	public List<Map<String, Object>> read_qualityDefectDetail_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return qualityMapper.read_qualityDefectDetail_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("품질 불량 전체 목록 조회 실패", e);
		}
	}

	// 품질 불량 - summary
	@Override
	public Map<String, Object> read_qualityDefectSummary(Map<String, Object> requestData) {
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
			List<DefectiveVO> resultList = qualityMapper.read_qualityDefectSummary(paramMap);
			int totalCount = qualityMapper.getQualityDefectSummaryTotalCount(paramMap);
			BigDecimal totalQty = qualityMapper.getQualityDefectSummaryTotalQty(paramMap);

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
	public List<Map<String, Object>> read_qualityDefectSummary_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return qualityMapper.read_qualityDefectSummary_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("품질 불량 전체 목록 조회 실패", e);
		}
	}

	@Override
	public Map<String, Object> readIncomingInspectionList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readIncomingInspectionList(queryParams);

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
	
	@Override
	public Map<String, Object> read_judgment(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.read_judgment(queryParams);
			
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



	@Override
	public Map<String, Object> readProcessInspectionList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readProcessInspectionList(queryParams);

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


	@Override
	public Map<String, Object> readReturnInspectionList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readReturnInspectionList(queryParams);

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

	@Override
	public Map<String, Object> readWarehouseInspectionList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readWarehouseInspectionList(queryParams);
			
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
	
	@Override
	public Map<String, Object> readDisposalList(Map<String, Object> params) {
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		Integer itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);

		if (page != null && page > 0) {
			int offset = (page - 1) * itemsPerPage;
			queryParams.put("offset", offset);
			queryParams.put("limit", itemsPerPage);
		}

		Map<String, Object> result = new HashMap<>();

		try {
			List<Map<String, Object>> records = qualityMapper.readDisposalList(queryParams);

			result.put("records", records);

			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue() : 0;
				Double totalQty = firstRecord.get("TOTALQTY") != null
						? ((Number) firstRecord.get("TOTALQTY")).doubleValue() : 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);

				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				if (page != null && page > 0) {
					result.put("totalPages", 0);
				}
			}
		} catch (Exception e) {
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

	@Override
	public Map<String, Object> read_qualityTotalList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.read_qualityTotalList(queryParams);
			
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
	
	@Override
	public Map<String, Object> read_qualityTotalSum(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.read_qualityTotalSum(queryParams);
			
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

//	// 작업장 이동 Detail
//	@Override
//	public Map<String, Object> read_qualityWorkshopDetail(Map<String, Object> requestData) {
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
//			List<WorkMoveVO> resultList = qualityMapper.read_qualityWorkshopDetail(paramMap);
//			int totalCount = qualityMapper.getQualityWorkshopDetailTotalCount(paramMap);
//			BigDecimal totalQty = qualityMapper.getQualityWorkshopDetailTotalQty(paramMap);
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
//	public List<Map<String, Object>> read_qualityWorkshopDetail_all(Map<String, Object> requestData) {
//		try {
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			return qualityMapper.read_qualityWorkshopDetail_all(searchParams);
//		} catch (Exception e) {
//			throw new RuntimeException("품질 - 작업장이동 목록 조회 실패", e);
//		}
//	}

	// 작업장 이동 Summary
//	@Override
//	public Map<String, Object> read_qualityWorkshopSummary(Map<String, Object> requestData) {
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
//			List<WorkMoveVO> resultList = qualityMapper.read_qualityWorkshopSummary(paramMap);
//			int totalCount = qualityMapper.getQualityWorkshopSummaryTotalCount(paramMap);
//			BigDecimal totalQty = qualityMapper.getQualityWorkshopSummaryTotalQty(paramMap);
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
//	public List<Map<String, Object>> read_qualityWorkshopSummary_all(Map<String, Object> requestData) {
//		try {
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			return qualityMapper.read_qualityWorkshopSummary_all(searchParams);
//		} catch (Exception e) {
//			throw new RuntimeException("품질 - 작업장이동 목록 조회 실패", e);
//		}
//	}


	@Override
	public Map<String, Object> readQualityWorkshopDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readQualityWorkshopDetail(queryParams);
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
				Double totalOkQty = firstRecord.get("TOTALOKQTY") != null
						? ((Number) firstRecord.get("TOTALOKQTY")).doubleValue()
						: 0;
				Double totalNgQty = firstRecord.get("TOTALNGQTY") != null
						? ((Number) firstRecord.get("TOTALNGQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);
				result.put("totalOkQty", totalOkQty);
				result.put("totalNgQty", totalNgQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				result.put("totalOkQty", 0);
				result.put("totalNgQty", 0);

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
			result.put("totalOkQty", 0);
			result.put("totalNgQty", 0);

			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}

	@Override
	public Map<String, Object> readQualityWorkshopSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readQualityWorkshopSummary(queryParams);
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
				Double totalOkQty = firstRecord.get("TOTALOKQTY") != null
						? ((Number) firstRecord.get("TOTALOKQTY")).doubleValue()
						: 0;
				Double totalNgQty = firstRecord.get("TOTALNGQTY") != null
						? ((Number) firstRecord.get("TOTALNGQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);
				result.put("totalOkQty", totalOkQty);
				result.put("totalNgQty", totalNgQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				result.put("totalOkQty", 0);
				result.put("totalNgQty", 0);

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
			result.put("totalOkQty", 0);
			result.put("totalNgQty", 0);

			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}

	// 재고조회 list
	@Override
	public Map<String, Object> read_qualityStockList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.read_qualityStockList(queryParams);

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
	
	// 재고조회 Summary
	@Override
	public Map<String, Object> read_qualityStockSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.read_qualityStockSummary(queryParams);

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
	
	// 품질 재고실사 list
	@Override
	public Map<String, Object> read_qualityStockcountList(Map<String, Object> params) {
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
			System.out.println(queryParams);
			// 쿼리 실행
			List<Map<String, Object>> records = qualityMapper.read_qualityStockcountList(queryParams);

			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
						: 0;
				Double totalQty = firstRecord.get("TOTALQTY") != null ? ((Number) firstRecord.get("TOTALQTY")).doubleValue()
						: 0;
				Double totalOKQty = firstRecord.get("OKTOTALQTY") != null ? ((Number) firstRecord.get("OKTOTALQTY")).doubleValue()
						: 0;
				Double totalNGQty = firstRecord.get("NGTOTALQTY") != null ? ((Number) firstRecord.get("NGTOTALQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalOKQty", totalOKQty);
				result.put("totalNGQty", totalNGQty);
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

	// 품질 재고실사 sum
	@Override
	public Map<String, Object> read_qualityStockcountSum(Map<String, Object> params) {
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
			System.out.println(queryParams);
			// 쿼리 실행
			List<Map<String, Object>> records = qualityMapper.read_qualityStockcountSum(queryParams);
			
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
	
	// 품질 재고실사 list
	@Override
	public Map<String, Object> read_qualityStockcountListLastDay(Map<String, Object> params) {
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
			System.out.println(queryParams);
			// 쿼리 실행
			List<Map<String, Object>> records = qualityMapper.read_qualityStockcountListLastDay(queryParams);

			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
						: 0;
				Double totalQty = firstRecord.get("TOTALQTY") != null ? ((Number) firstRecord.get("TOTALQTY")).doubleValue()
						: 0;
				Double totalOKQty = firstRecord.get("OKTOTALQTY") != null ? ((Number) firstRecord.get("OKTOTALQTY")).doubleValue()
						: 0;
				Double totalNGQty = firstRecord.get("NGTOTALQTY") != null ? ((Number) firstRecord.get("NGTOTALQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalOKQty", totalOKQty);
				result.put("totalNGQty", totalNGQty);
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

	// 품질 재고실사 sum
	@Override
	public Map<String, Object> read_qualityStockcountSumLastDay(Map<String, Object> params) {
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
			System.out.println(queryParams);
			// 쿼리 실행
			List<Map<String, Object>> records = qualityMapper.read_qualityStockcountSumLastDay(queryParams);
			
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
	
	@Override
	public Map<String, Object> getBOMInfo(Map<String, Object> body) {
	    Map<String, Object> result = new HashMap<>();

	    String itemcode = body.get("itemcode") == null ? "" : body.get("itemcode").toString().trim();
	    
	    if (itemcode.isEmpty()) {
	        result.put("success", false);
	        result.put("message", "itemcode is empty");
	        result.put("list", Collections.emptyList());
	        return result;
	    }

	    List<Map<String, Object>> list = qualityMapper.getBOMInfo(body);

	    result.put("success", true);
	    result.put("list", list);
	    return result;
	}

	// 분해작업
	@Transactional
	@Override
	public Map<String, Object> decomposition(List<BomDecompositionVO> list) {
		Map<String, Object> result = new HashMap<>();
		
		 // ✅ 공통값은 첫 번째 값 기준으로 한 번만 사용
	    BomDecompositionVO first = list.get(0);

	    // 예시: barcode / parentItemCode 등
	    String barcode = first.getBarcode();
	    String itemcode = first.getParentItemCode();
	    String loginid = first.getLoginId();
		System.out.println("itemcode : "+itemcode);
		System.out.println("loginid : "+loginid);

	    Map<String, Object> info = qualityMapper.getBarcodeInfo(barcode);
		String factory = info.get("FACTORY").toString();
		Log.info("itemcode : "+itemcode);
		Log.info("factory : "+factory);
		Log.info("loginid : "+loginid);
		Log.info("qty : "+info.get("QTY"));
		// 분해는 생산에서 가능
		// 레드케이지에 있는지 확인
		int existRedcage = qualityMapper.checkRedcage(barcode);
		int existWorklocation = qualityMapper.checkWorklocation(barcode);
		if(existRedcage == 1) {
			// 레드케이지에 있으면 이송
			Map<String, Object> transferMap = new HashMap<>();
			transferMap.put("barcode", barcode);
			transferMap.put("itemcode", barcode.split(",")[0]); // 바코드에서 아이템코드 추출
			transferMap.put("factory",factory);
			transferMap.put("storage","REDCAGE");
			transferMap.put("loginid",loginid);
			transferMap.put("qty",info.get("QTY"));
			transferMap.put("source","FROMREDCAGE");
			if("Saltillo".equalsIgnoreCase(factory)) {
				transferMap.put("wstorage","H/REST");
			}else {
				transferMap.put("wstorage","Workshop");
			}
			
			transferMap.put("okyn","Y");
			
			int moveCnt = qualityMapper.moveRedcageToWorklocation(transferMap);
		}else if(existWorklocation == 1){
			// 작업장에 이미 있는경우 다음작업으로 진행
		}else {
			throw new RuntimeException("Only materials available at the redcage or worklocation can be decomposed");
		}
		
		// 창고에 있는 바코드 useyn = 'N'
		int updateCnt = qualityMapper.updateLocationUseyn(barcode);
		// 작업장에 있는 바코드 useyn = 'N'
		int updateCnt1 = qualityMapper.updateWorkLocationUseyn(barcode);
		// 바코드 useyn = 'N'
		int updateCnt2 = qualityMapper.updateBarcodeUseyn(barcode);

		
		// 분해 자재 insert작업
		for (BomDecompositionVO vo : list) {
			// 분해 테이블에 insert
			Map<String,Object> map = new HashMap<>();
			map.put("barcode",barcode);
			map.put("itemcode",itemcode);
			map.put("childcode",vo.getChildItemCode());
			map.put("qty",vo.getQty());
			map.put("basicqty",vo.getBasicqty());
			map.put("scrapqty",vo.getMaxqty() - vo.getQty());
			map.put("maxqty",vo.getMaxqty());
			map.put("factory",factory);
			map.put("source","DECOMPOSITION");
			if("Saltillo".equalsIgnoreCase(factory)) {
				map.put("wstorage","H/REST");
			}else {
				map.put("wstorage","Workshop");
			}
			map.put("loginid",loginid);
			int cnt = qualityMapper.insertDecomposition(map);
			if (cnt != 1) {
	            throw new RuntimeException("decomposition fail");
	        }
	    }
		// 처리여부 Y업데이트
		int postyn = qualityMapper.inspectionPostY(barcode);
		result.put("success", true);
		result.put("list", list);
		return result;
	}
	
	// 폐기 작업
	@Transactional
	@Override
	public Map<String, Object> scrap(Map<String, Object> params) {
		Map<String, Object> result = new HashMap<>();
		
		String loginid = String.valueOf(params.get("loginid"));
		List<String> lists = (List<String>) params.get("iidList");
		int ok = 0;
		int skipped = 0;
		
		for(String list : lists) {
			String[] parts = list.split("_");
			
			String iid = parts[0];
			String barcode = parts[1];
			
			// 레드케이지에 있는지 확인
			int existRedcage = qualityMapper.checkRedcage(barcode);
			// 레드케이지에 없다면 건너뛰기
			if(existRedcage == 0) {
				skipped++;
				continue;
			}
			
			Map<String, Object> map = new HashMap<>();
			map.put("iid", iid);
			map.put("barcode", barcode);
			map.put("loginid", loginid);
			ok += qualityMapper.scrapInspection(map);
			qualityMapper.scrapLocation(map);
			qualityMapper.scrapBarcode(map);
		}
		
		result.put("success", true);
	    result.put("ok", ok);
	    result.put("skipped", skipped);		
		return result;
	}

//	// 예외 입고 - detail
//	@Override
//	public Map<String, Object> read_qualityExceptionInputDetail(Map<String, Object> requestData) {
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
//			List<ProductVO> resultList = qualityMapper.read_qualityExceptionInputDetail(paramMap);
//			int totalCount = qualityMapper.getQualityExceptionInputDetailTotalCount(paramMap);
//			BigDecimal totalQty = qualityMapper.getQualityExceptionInputDetailTotalQty(paramMap);
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
//	public List<Map<String, Object>> read_qualityExceptionInputDetail_all(Map<String, Object> requestData) {
//		try {
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			return qualityMapper.read_qualityExceptionInputDetail_all(searchParams);
//		} catch (Exception e) {
//			throw new RuntimeException("생산 - 예외입고 목록 조회 실패", e);
//		}
//	}

//	// 예외 입고 - summary
//	@Override
//	public Map<String, Object> read_qualityExceptionInputSummary(Map<String, Object> requestData) {
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
//			List<ProductVO> resultList = qualityMapper.read_qualityExceptionInputSummary(paramMap);
//			int totalCount = qualityMapper.getQualityExceptionInputSummaryTotalCount(paramMap);
//			BigDecimal totalQty = qualityMapper.getQualityExceptionInputSummaryTotalQty(paramMap);
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
//	public List<Map<String, Object>> read_qualityExceptionInputSummary_all(Map<String, Object> requestData) {
//		try {
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			return qualityMapper.read_qualityExceptionInputSummary_all(searchParams);
//		} catch (Exception e) {
//			throw new RuntimeException("생산 - 예외 입고 조회 실패", e);
//		}
//	}

//	// 예외 츌고 - detail
//	@Override
//	public Map<String, Object> read_qualityExceptionOutputDetail(Map<String, Object> requestData) {
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
//			List<ProductVO> resultList = qualityMapper.read_qualityExceptionOutputDetail(paramMap);
//			int totalCount = qualityMapper.getQualityExceptionOutputDetailTotalCount(paramMap);
//			BigDecimal totalQty = qualityMapper.getQualityExceptionOutputDetailTotalQty(paramMap);
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
//	public List<Map<String, Object>> read_qualityExceptionOutputDetail_all(Map<String, Object> requestData) {
//		try {
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			return qualityMapper.read_qualityExceptionOutputDetail_all(searchParams);
//		} catch (Exception e) {
//			throw new RuntimeException("제품 생산 실적 목록 조회 실패", e);
//		}
//	}

//	// 예외 입고 - summary
//	@Override
//	public Map<String, Object> read_qualityExceptionOutputSummary(Map<String, Object> requestData) {
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
//			List<ProductVO> resultList = qualityMapper.read_qualityExceptionOutputSummary(paramMap);
//			int totalCount = qualityMapper.getQualityExceptionOutputSummaryTotalCount(paramMap);
//			BigDecimal totalQty = qualityMapper.getQualityExceptionOutputSummaryTotalQty(paramMap);
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
//	public List<Map<String, Object>> read_qualityExceptionOutputSummary_all(Map<String, Object> requestData) {
//		try {
//			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//			return qualityMapper.read_qualityExceptionOutputSummary_all(searchParams);
//		} catch (Exception e) {
//			throw new RuntimeException("생산 - 예외 입고 조회 실패", e);
//		}
//	}

	// 예외처리 - 예외입고내역
	@Override
	public Map<String, Object> readQualityExceptionInputDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readQualityExceptionInputDetail(queryParams);
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
				Double totalOkQty = firstRecord.get("TOTALOKQTY") != null
						? ((Number) firstRecord.get("TOTALOKQTY")).doubleValue()
						: 0;
				Double totalNgQty = firstRecord.get("TOTALNGQTY") != null
						? ((Number) firstRecord.get("TOTALNGQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);
				result.put("totalOkQty", totalOkQty);
				result.put("totalNgQty", totalNgQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				result.put("totalOkQty", 0);
				result.put("totalNgQty", 0);

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
			result.put("totalOkQty", 0);
			result.put("totalNgQty", 0);

			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}
	
	// 예외처리 - 예외입고내역
	@Override
	public Map<String, Object> readQualityExceptionInputSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readQualityExceptionInputSummary(queryParams);
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
				Double totalOkQty = firstRecord.get("TOTALOKQTY") != null
						? ((Number) firstRecord.get("TOTALOKQTY")).doubleValue()
						: 0;
				Double totalNgQty = firstRecord.get("TOTALNGQTY") != null
						? ((Number) firstRecord.get("TOTALNGQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);
				result.put("totalOkQty", totalOkQty);
				result.put("totalNgQty", totalNgQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				result.put("totalOkQty", 0);
				result.put("totalNgQty", 0);

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
			result.put("totalOkQty", 0);
			result.put("totalNgQty", 0);

			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}
	
	// 예외처리 - 예외츨고내역
	@Override
	public Map<String, Object> readQualityExceptionOutputDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readQualityExceptionOutputDetail(queryParams);
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
				Double totalOkQty = firstRecord.get("TOTALOKQTY") != null
						? ((Number) firstRecord.get("TOTALOKQTY")).doubleValue()
						: 0;
				Double totalNgQty = firstRecord.get("TOTALNGQTY") != null
						? ((Number) firstRecord.get("TOTALNGQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);
				result.put("totalOkQty", totalOkQty);
				result.put("totalNgQty", totalNgQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				result.put("totalOkQty", 0);
				result.put("totalNgQty", 0);

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
			result.put("totalOkQty", 0);
			result.put("totalNgQty", 0);

			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}
	
	// 예외처리 - 예외츨고내역
	@Override
	public Map<String, Object> readQualityExceptionOutputSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readQualityExceptionOutputSummary(queryParams);
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
				Double totalOkQty = firstRecord.get("TOTALOKQTY") != null
						? ((Number) firstRecord.get("TOTALOKQTY")).doubleValue()
						: 0;
				Double totalNgQty = firstRecord.get("TOTALNGQTY") != null
						? ((Number) firstRecord.get("TOTALNGQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);
				result.put("totalOkQty", totalOkQty);
				result.put("totalNgQty", totalNgQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				result.put("totalOkQty", 0);
				result.put("totalNgQty", 0);

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
			result.put("totalOkQty", 0);
			result.put("totalNgQty", 0);

			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}

	@Override
	public Map<String, Object> read_decomposition(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.read_decomposition(queryParams);

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
	
	@Override
	public Map<String, Object> readQualityDecompositionDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readQualityDecompositionDetail(queryParams);

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

	@Override
	public Map<String, Object> readQualityDecompositionScrapDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.readQualityDecompositionScrapDetail(queryParams);
			
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
	
	@Override
	public Map<String, Object> read_scrapList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.read_scrapList(queryParams);

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
	
	// 살티오 공정검사
	public Map<String, Object> insSaltilloProductionInspection(Map<String, Object> param) {
		Map<String, Object> result = new HashMap<String, Object>();
		
		String date = (String)param.get("date");
		if (date == null || date.isEmpty()) {
		    date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		    param.put("date", date);
		}
		String barcode = (String)param.get("barcode");
		String loginid = (String)param.get("loginid");
		String factory = (String)param.get("factory");
		Object vScan = param.get("scanQty");
		Object vHold   = param.get("holdQty");
		Object vJudgement   = param.get("judgementQty");

		String scanqty = (vScan == null) ? "0" : vScan.toString();
		String holdqty   = (vHold   == null) ? "0" : vHold.toString();
		String judgementqty   = (vJudgement   == null) ? "0" : vJudgement.toString();
		
		String labeltype = (String)param.get("labeltype");
		String itemtype = (String)param.get("itemtype");
		String mainline = (String)param.get("mainline");
		String presource = (String)param.get("presource");
		String line = (String)param.get("line");
		String itemcode = (String) param.get("itemcode");
		String judgment= (String) param.get("judgment");
		param.put("line", mainline+"_"+line);
		
		String okyn = "";

		if(factory.equalsIgnoreCase("SALTILLO")) { 	
			param.put("wstorage", "H/REST");
		}else {									
			param.put("wstorage", "Workshop");
		}
		
		param.put("storage", "REDCAGE");
		
		// 마감월 체크
		Map<String, Object> magamMap = new HashMap<String, Object>();
		String orginalDate = (String) param.get("date");
		String date8 = ((String) param.get("date")).replaceAll("-", "");
		if (date8.length() == 8) {
			date8 = date8.substring(0, 6);
		} else if (date8.length() == 6) {
			date8 = "20" + date;
		}
		magamMap.put("date", date8);
		magamMap.put("loginid", loginid);
		int magam = purchaseMapper.checkMagamInput(magamMap);
		if(magam>0 && !"wms".equals(loginid)) {
			result.put("response", "warning.closed.storage");
			return result;
		}
		
		//---------------------------------------------------------------------------------
		
		param.put(okyn, okyn);		// reused로 인해 변경된 okyn값 복원
		
		// 양품 바코드거나 불량바코드면서 판정 수량과 불량 수량이 다르면 새로운 불량 바코드를 만들어야함
		if(!("REUSED").equals(judgment)) {
			param.put("type", "Defective");
			param.put("okyn", "N");
			okyn = "N";
			// ng barcode 생성 laststatus = 10 qty값
			Integer seq = qualityMapper.getMaxBarcodeSeq(param); 		//  barcodemax 테이블에서 seq를 가져옴
			if (seq == null) {
				seq = 0;
			}
			
			seq ++;
			String newBarcode = "";
			String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
			BigDecimal ngQty = new BigDecimal(param.get("judgementQty").toString());
			String ngQtyFormatted = String.format("%08.2f", ngQty);
			// 5자리 정수 + '.' + 소수 2자리 = 총 8자리
			newBarcode =
					param.get("itemcode") + "," +
							today + "," +
							String.format("%05d", seq)+ "," +
							ngQtyFormatted +
							",WMSMEX";
			param.put("newbarcode", newBarcode);
			param.put("barcode", newBarcode);
			param.put("laststatus", 91);
			param.put("scanQty", judgementqty);
			param.put("okQty", 0);
			param.put("ngQty", judgementqty);
			param.put("barcode", newBarcode);
			param.put("qty", ngQty);
			int insertBarcode = qualityMapper.makeBarcode(param);
			if(insertBarcode>0) {
				if(seq == 1) {
					qualityMapper.insertBarcodeMax(param);
				}else {
					param.put("seq", seq);
					qualityMapper.updateBarcodeMax(param);
				}
			}
			// ngbarcode location REDCAGE에 insert qty값
			param.put("location", param.get("factory")+"-"+param.get("storage"));
			int insertLocationNG = qualityMapper.insertLocation(param);
			//  inspection 테이블 insert
			int insInspection = qualityMapper.insInspection(param);			
		}else if (("REUSED").equals(judgment)) {			// 재사용
			param.put("type", "REUSED");
			param.put("okyn", "Y");
			okyn = "Y";
			// ng barcode 생성 laststatus = 10 qty값
			Integer seq = qualityMapper.getMaxBarcodeSeq(param); 		//  barcodemax 테이블에서 seq를 가져옴
			if (seq == null) {
				seq = 0;
			}
			
			seq ++;
			String newBarcode = "";
			String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
			BigDecimal ngQty = new BigDecimal(param.get("judgementQty").toString());
			String ngQtyFormatted = String.format("%08.2f", ngQty);
			// 5자리 정수 + '.' + 소수 2자리 = 총 8자리
			newBarcode =
					param.get("itemcode") + "," +
							today + "," +
							String.format("%05d", seq)+ "," +
							ngQtyFormatted +
							",WMSMEX";
			
			param.put("newbarcode", newBarcode);
			param.put("laststatus", 91);
			param.put("qty", ngQty);
			int insertBarcode = qualityMapper.makeBarcode(param);
			if(insertBarcode>0) {
				if(seq == 1) {
					qualityMapper.insertBarcodeMax(param);
				}else {
					param.put("seq", seq);
					qualityMapper.updateBarcodeMax(param);
				}
			}
			// ngbarcode location REDCAGE에 insert okqty값
			param.put("location", param.get("factory")+"-"+param.get("storage"));
			param.put("scanQty", judgementqty);
			param.put("okQty", judgementqty);
			param.put("ngQty", 0);
			param.put("barcode", newBarcode);
			
			inspectionProcessReused(param);
//			int insertLocationNG = qualityMapper.insertLocation(param);
			//  inspection 테이블 insert
			int insInspection = qualityMapper.insInspectionPostynY(param);
		}
		result.put("response", "success");
		return result;
	}


	// 살티오 OK 판정
	public Map<String, Object> insSaltilloOKInspection(Map<String, Object> param) {
		Map<String, Object> result = new HashMap<String, Object>();
		
		String date = (String)param.get("date");
		if (date == null || date.isEmpty()) {
			date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
			param.put("date", date);
		}
		String loginid = (String)param.get("loginid");
		String factory = (String)param.get("factory");
		Object vScan = param.get("scanQty");
		Object vhold   = param.get("holdQty");
		Object vOk   = param.get("okQty");
		
		String scanqty = (vScan == null) ? "0" : vScan.toString();
		String holdqty   = (vhold   == null) ? "0" : vhold.toString();
		String okqty   = (vOk   == null) ? "0" : vOk.toString();
		
		String labeltype = (String)param.get("labeltype");
		String itemtype = (String)param.get("itemtype");
		String presource = (String)param.get("presource");
		String line = (String)param.get("line");
		String itemcode = (String) param.get("itemcode");
		String judgment= (String) param.get("judgment");
		
		String okyn = "";
		
		param.put("storage", "REDCAGE");
		
		// 마감월 체크
		Map<String, Object> magamMap = new HashMap<String, Object>();
		String orginalDate = (String) param.get("date");
		String date8 = ((String) param.get("date")).replaceAll("-", "");
		if (date8.length() == 8) {
			date8 = date8.substring(0, 6);
		} else if (date8.length() == 6) {
			date8 = "20" + date;
		}
		magamMap.put("date", date8);
		magamMap.put("loginid", loginid);
		int magam = purchaseMapper.checkMagamInput(magamMap);
		if(magam>0) {
			result.put("response", "");
			return result;
		}
		
		//---------------------------------------------------------------------------------
		
		// 양품 바코드생성
		param.put("type", "OK");
		param.put("okyn", "Y");
		okyn = "Y";
		// ng barcode 생성 laststatus = 10 qty값
		Integer seq = qualityMapper.getMaxBarcodeSeq(param); 		//  barcodemax 테이블에서 seq를 가져옴
		if (seq == null) {
			seq = 0;
		}
		
		seq ++;
		String newBarcode = "";
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
		BigDecimal ngQty = new BigDecimal(param.get("okQty").toString());
		String ngQtyFormatted = String.format("%08.2f", ngQty);
		// 5자리 정수 + '.' + 소수 2자리 = 총 8자리
		newBarcode =
				param.get("itemcode") + "," +
						today + "," +
						String.format("%05d", seq)+ "," +
						ngQtyFormatted +
						",WMSMEX";
		
		param.put("newbarcode", newBarcode);
		param.put("laststatus", 10);
		param.put("ngQty", ngQty);
		param.put("qty", ngQty);
		int insertBarcode = qualityMapper.makeBarcode(param);
		if(insertBarcode>0) {
			if(seq == 1) {
				qualityMapper.insertBarcodeMax(param);
			}else {
				param.put("seq", seq);
				qualityMapper.updateBarcodeMax(param);
			}
		}
		// location REDCAGE에 insert okqty값
		param.put("location", param.get("factory")+"-"+param.get("storage"));
		Map<String,Object> map = new HashMap<String, Object>(param);
		map.put("scanQty", okqty);
		map.put("barcode", newBarcode);
		int insertLocationNG = qualityMapper.insertLocation(map);
		
		param.put("ngQty", 0);
		param.put("scanQty", okqty);
		param.put("line", "");
		//  inspection 테이블 insert
		int insInspection = qualityMapper.insInspection(param);
		result.put("response", "success");
		return result;
	}
	
	// 거래처 가져오기
	public List<Map<String, Object>> getSupplierList() {
		return qualityMapper.getSupplierList();
	}
	
	public int inspectionProcessReused(Map<String, Object> param) {
		// workmove로 이송작업
		Map<String, Object> transferMap = new HashMap<>(param);
		transferMap.put("source", "FROMREDCAGE");
		qualityMapper.insWorkMove(transferMap);
		
		String barcode = String.valueOf(param.get("barcode"));
		// 바코드 useyn = 'N'
		int setN = qualityMapper.updateBarcodeN(param);
		
		// 분해 테이블에 source = 'REUSED'로 insert
		// BOM list 가져오기
		List<Map<String, Object>> list = qualityMapper.getBomList(param);
		for (Map<String, Object> row : list) {
			Map<String, Object> map = new HashMap<>();
			map.put(barcode, barcode);
			map.put("itemcode", row.get("ITEMCODE"));
			map.put("childcode", row.get("CHILDCODE"));
			// 수량 = QTYPER * 바코드수량
			Double qtyper = Double.parseDouble(row.get("QTYPER").toString());
			Double qty = qtyper * Double.parseDouble(param.get("qty").toString());

			map.put("qty",qty);
			map.put("basicqty",param.get("qty"));
			map.put("scrapqty",0);
			map.put("maxqty",qty);
			map.put("factory",param.get("factory"));
			map.put("source", "REUSED");
			
			if("Saltillo".equalsIgnoreCase(param.get("factory").toString())) {
				map.put("wstorage","H/REST");
			}else {
				map.put("wstorage","Workshop");
			}
			map.put("loginid",param.get("loginid"));
			
			int cnt = qualityMapper.insertDecomposition(map);			
			if (cnt != 1) {
	            throw new RuntimeException("decomposition fail");
	        }
		}
		return 0;
	}
	
	@Override
	public Map<String, Object> readQualityReusedList(Map<String, Object> params){
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
			List<Map<String, Object>> records = qualityMapper.readQualityReusedList(queryParams);

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

	// 품질 수불 재고조회
	@Override
	public Map<String, Object> read_qualityStockIOList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = qualityMapper.read_qualityStockIOList(queryParams);

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

}