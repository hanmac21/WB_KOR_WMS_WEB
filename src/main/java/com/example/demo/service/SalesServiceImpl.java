/* --------------------------------------------------------------
 * 📋 SalesService 인터페이스 및 구현체
 * -------------------------------------------------------------- */

package com.example.demo.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.demo.vo.StockVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.mapper.wbusa.SalesMapper;
import com.example.demo.mapper.wbpt.WbptMapper;

@Service
public class SalesServiceImpl implements SalesService {

	@Autowired
	private SalesMapper salesMapper;

	@Autowired
	private WbptMapper wbptMapper;

	@Override
	public Map<String, Object> readTransferDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readTransferDetail(queryParams);

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
	
	@Override
	public Map<String, Object> readTransferSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readTransferSummary(queryParams);
			
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

	
	@Override
	public Map<String, Object> read_salesInvoiceList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.read_salesInvoiceList(queryParams);
			
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

	// 거래처 업데이트
	@Transactional
	@Override
	public Map<String, Object> loadReturnCustomerUpdate(Map<String, Object> requestData) {
		Map<String, Object> result = new HashMap<>();
		List<String> iidList = (List<String>) requestData.get("iidList");
		String supplier = (String) requestData.get("supplier");

		String firstDate = ((String) iidList.get(iidList.size()-1)).split("\\|")[1].replace("-", "");
		Map<String, Object> lockParam = new HashMap<>();
		lockParam.put("condate", firstDate);
		if (wbptMapper.selectLockCnt(lockParam) > 0) {
			result.put("locked", true);
			return result;
		}
		try {
			for (int i = 0; i < iidList.size(); i++) {
				String uniqueValue = (String) iidList.get(i);

				String[] parts = uniqueValue.split("\\|");
				String iid = parts[0];
				Map<String,Object> map = new HashMap<>();
				map.put("iid", iid);
				map.put("custcode", supplier.split("_")[0]);
				map.put("custname", supplier.split("_")[1]);

				// WMS 테이블 UPDATE
				salesMapper.upWmsLoadReturnCustomer(map);

				// WMS의 IFNO값 가져오기
				String ifno = salesMapper.selIfnoLoadReturn(map);

				// ifno값이 있을 때
				if(ifno != null && !ifno.isEmpty()){
					map.put("ifno", ifno);
					// 인터페이스 테이블 UPDATE
					salesMapper.upIntfLoadReturnCustomer(map);
					// ERP 테이블 UPDATE
					salesMapper.upErpLoadReturnCustomer(map);
				}

			}
			result.put("success", true);
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			throw new RuntimeException(e);
		}
		return result;
	}


	// 예외처리 - 예외입고내역
	@Override
	public Map<String, Object> readSalesExceptionInputDetail(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		int itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

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
			List<Map<String, Object>> records = salesMapper.readSalesExceptionInputDetail(queryParams);
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

	// 예외처리 - 예외입고내역
	@Override
	public Map<String, Object> readSalesExceptionInputSummary(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		int itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

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
			List<Map<String, Object>> records = salesMapper.readSalesExceptionInputSummary(queryParams);
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


	// 예외처리 - 예외출고내역
	@Override
	public Map<String, Object> readSalesExceptionOutputDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readSalesExceptionOutputDetail(queryParams);
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

	// 예외처리 - 예외출고내역
	@Override
	public Map<String, Object> readSalesExceptionOutputSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readSalesExceptionOutputSummary(queryParams);
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

	// 출고처리 - 제품출고
	@Override
	public Map<String, Object> readSalesLoadDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readSalesLoadDetail(queryParams);
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

	// 출고처리 - 제품출고
	@Override
	public Map<String, Object> readSalesLoadSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readSalesLoadSummary(queryParams);
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

	// 출고처리 - 출고반품
	@Override
	public Map<String, Object> readSalesLoadReturnDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readSalesLoadReturnDetail(queryParams);
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

	// 출고처리 - 출고반품
	@Override
	public Map<String, Object> readSalesLoadReturnSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readSalesLoadReturnSummary(queryParams);
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

	// 재고이송관리 - 창고이동처리
	@Override
	public Map<String, Object> readSalesStorageDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readSalesStorageDetail(queryParams);
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

	// 재고이송관리 - 창고이동처리
	@Override
	public Map<String, Object> readSalesStorageSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = salesMapper.readSalesStorageSummary(queryParams);
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

	// 재고조회 - 재고조회
	@Override
	public Map<String, Object> readSalesStockDetail(Map<String, Object> body) {

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

		List<StockVO> records = salesMapper.readSalesStockDetail(param);

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

	// 재고조회 - 재고조회
	@Override
	public List<StockVO> readSalesStockDetailAll(Map<String, Object> body) {

		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) body.get("searchParams");

		Map<String, Object> param = new HashMap<>();
		if (searchParams != null && !searchParams.isEmpty()) {
			param.putAll(searchParams);
		}

		param.put("backupdate", param.getOrDefault("backupdate", ""));

		String sortKey = body.get("sortKey") == null ? "YMDHMS"
				: String.valueOf(body.get("sortKey")).trim().toUpperCase();
		String sortDir = body.get("sortDir") == null ? "DESC"
				: String.valueOf(body.get("sortDir")).trim().toUpperCase();

		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir)) {
			sortDir = "DESC";
		}

		param.put("sortKey", sortKey);
		param.put("sortDir", sortDir);

		System.out.println("PARAM_TO_MAPPER = " + param);

		try {
			return salesMapper.readSalesStockDetailAll(param);
		} catch (Exception e) {
			throw new RuntimeException("재고 전체 목록 조회 실패", e);
		}
	}

	// 재고조회 - 재고조회
	@Override
	public Map<String, Object> readSalesStockSummary(Map<String, Object> body) {

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
			case "ERPQTY":
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

		List<StockVO> records = salesMapper.readSalesStockSummary(param);

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
		res.put("totalErpQty", totalErpQty);
		res.put("totalPages", totalPages);
		res.put("currentPage", page);

		return res;
	}

	// 재고조회 - 창고별 재고현황
	@Override
	public Map<String, Object> readSalesStorageStockList(Map<String, Object> params) {
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");
		String fromdate = (String) searchParams.get("fromDate");
		String todate = (String) searchParams.get("toDate");
		LocalDate date = LocalDate.parse(fromdate);

		// 해당월의 1일
		LocalDate firstDay = date.withDayOfMonth(1);
		String sdate = firstDay.toString();

		// 2️⃣ fromdate 기준 어제
		LocalDate yesterday = date.minusDays(1);
		String ydate = yesterday.toString(); // yyyy-MM-dd
		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		Integer itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);
		queryParams.put("sdate", fromdate);
		queryParams.put("yesterday", ydate);

		// 페이징 파라미터가 있을 때만 설정
		if (page != null && page > 0) {
			int offset = (page - 1) * itemsPerPage;
			queryParams.put("offset", offset);
			queryParams.put("limit", itemsPerPage);
		}

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();
		List<Map<String, Object>> records = null;
		try {
			// 쿼리 실행
			System.out.println(queryParams);
			records = salesMapper.readSalesStorageStockList(queryParams);

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

	// 재고실사 - 상시재고실사
	@Override
	public Map<String, Object> readSalesStockCountAlwaysDetail(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		int itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

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
			List<Map<String, Object>> records = salesMapper.readSalesStockCountAlwaysDetail(queryParams);
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

	// 재고실사 - 상시재고실사
	@Override
	public Map<String, Object> readSalesStockCountAlwaysSummary(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		int itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

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
			List<Map<String, Object>> records = salesMapper.readSalesStockCountAlwaysSummary(queryParams);
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

	// 재고실사 - 말일재고실사
	@Override
	public Map<String, Object> readSalesStockCountLastdayDetail(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		int itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

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
			List<Map<String, Object>> records = salesMapper.readSalesStockCountLastdayDetail(queryParams);
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

	// 재고실사 - 말일재고실사
	@Override
	public Map<String, Object> readSalesStockCountLastdaySummary(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		int itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

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
			List<Map<String, Object>> records = salesMapper.readSalesStockCountLastdaySummary(queryParams);
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

	// 재고 비교 엑셀
	@Override
	public Map<String, Object> readSalesStockCountCompare(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		int itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

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
			List<Map<String, Object>> records = salesMapper.readSalesStockCountCompare(queryParams);
			System.out.println("--------------");
			System.out.println(queryParams);
			result.put("records", records);

		} catch (Exception e) {
			// 예외 발생 시 기본값 설정
			e.printStackTrace();
		}

		return result;
	}

	// 재고실사(미스캔)
	@Override
	public Map<String, Object> readSalesStockCountMissing(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		int itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

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
			List<Map<String, Object>> records = salesMapper.readSalesStockCountMissing(queryParams);
			System.out.println("--------------");
			System.out.println(queryParams);
			result.put("records", records);

		} catch (Exception e) {
			// 예외 발생 시 기본값 설정
			e.printStackTrace();
		}

		return result;
	}

	// 재고실사(미스캔) 엑셀
	@Override
	public List<Map<String, Object>> readSalesStockCountMissingAll(Map<String, Object> searchParam) {
		try {
			return salesMapper.readSalesStockCountMissingAll(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	// 재고실사확정 ERP
	@Override
	public List<StockVO> readSalesErpInterfaceSummary(Map<String, Object> paramMap) {
		try {
			return salesMapper.readSalesErpInterfaceSummary(paramMap);
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("ERP 목록 조회 실패", e);
		}
	}

	// 재고실사확정 ERP
	@Override
	public List<Map<String, Object>> readSalesErpInterfaceSummaryAll(Map<String, Object> searchParam) {
		try {
			return salesMapper.readSalesErpInterfaceSummaryAll(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("ERP 전체 목록 조회 실패", e);
		}
	}
}