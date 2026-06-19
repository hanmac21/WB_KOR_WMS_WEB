/* --------------------------------------------------------------
 * 📋 PurchaseService 인터페이스 및 구현체
 * -------------------------------------------------------------- */

package com.example.demo.service;

import java.util.*;

import com.example.demo.vo.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.example.demo.mapper.wbpt.WbUlsanMapper;

@Service
public class PurchaseServiceImpl implements PurchaseService {

	@Autowired
	private WbUlsanMapper ulsanMapper;

	@Override
	public List<RealStockVO> read_realStock(Map<String, Object> paramMap) {
		try {
			return ulsanMapper.read_realStock(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 목록 조회 실패", e);
		}
	}

	@Override
	public List<String> read_realStock_dates(Map<String, Object> paramMap) {
		try {
			return ulsanMapper.read_realStock_dates(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 날짜 목록 조회 실패", e);
		}
	}

	@Override
	public List<RealStockVO> read_realStockSummary(Map<String, Object> paramMap) {
		try {
			return ulsanMapper.read_realStockSummary(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 목록 조회 실패", e);
		}
	}

	@Override
	public int getRealStockTotalCount(Map<String, Object> paramMap) {
		try {
			return ulsanMapper.getRealStockTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 총 개수 조회 실패", e);
		}
	}

	@Override
	public int getRealStockSummaryTotalCount(Map<String, Object> paramMap) {
		try {
			return ulsanMapper.getRealStockSummaryTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 총 개수 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_realStock_all(Map<String, Object> searchParam) {
		try {
			return ulsanMapper.read_realStock_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 전체 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_realStockSummary_all(Map<String, Object> searchParam) {
		try {
			return ulsanMapper.read_realStockSummary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 전체 목록 조회 실패", e);
		}
	}

	@Override
	public String updateTotalQtyStockCount(Map<String, Object> param) {
		return ulsanMapper.updateTotalQtyStockCount(param);
	}

	@Override
	public Map<String, Object> search_stockInfo(String barcode) {
		Map<String, Object> map = ulsanMapper.search_stockInfo(barcode);
		System.out.println("search_stockInfo : "+map);
		return map;
	}

	@Override
	public List<Map<String, Object>> show_stockHistory(String barcode) {
		return ulsanMapper.show_stockHistory(barcode);
	}

	// ===== 데이터 삭제 =====
	// 1. resolveLastStatus 함수에 상태값 있는지 확인
	// 2. validateForDelete 함수에 각 종류 별 검증 함수 추가
	// 3. deleteDispatcher 함수에 kind별 case 추가, updateStock...함수 생성
	// 4. updateStock... 함수에 맞는 로직 생성
	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public Map<String, Object> deleteByKind(String kind, Map<String, Object> map) {
		List<String> list = (List<String>) map.get("iidList");
		Map<String, Object> result = new HashMap<>();
		List<Map<String, Object>> failList = new ArrayList<>();
		List<Map<String, Object>> validItems = new ArrayList<>();

		// ===== 1단계: 전체 검증 먼저 =====
		for (String uniqueValue : list) {
			try {
				String[] parts = uniqueValue.split("\\|");

				Map<String, Object> param = new HashMap<>();
				String iid = "";
				String date = "";
				String factory = "";
				String storage = "";
				String barcode = "";
				String ifno = "";
				String meskey = "";

				iid = parts[0];
				date = parts[1];
				factory = parts[2];
				storage = parts[3];
				barcode = parts[4];
				if (parts.length > 5) meskey = parts[5];

				String loginid = (String) map.get("loginid");

				param.put("iid", iid);
				param.put("date", date);
				param.put("factory", factory);
				param.put("lastfactory", factory);
				param.put("storage", storage);
				param.put("laststorage", storage);
				param.put("barcode", barcode);

				param.put("ifno", ifno);
				param.put("meskey", meskey);
				param.put("mes_key", meskey);

				param.put("loginid", loginid);
				param.put("kind", kind);

				// 검증 통과한 항목 저장
				validItems.add(param);

			} catch (Exception e) {
				Map<String, Object> err = new HashMap<>();
				err.put("value", uniqueValue);
				err.put("reason", e.getMessage());
				failList.add(err);
			}
		}

		// ===== 3단계: 모두 통과했을 때만 삭제 =====
		try {
			for (Map<String, Object> param : validItems) {
				deleteDispatcher(kind, param);
			}
			result.put("success", true);

		} catch (RuntimeException e) {
			// 삭제 도중 실패 한 것이 있으면 메세지 전달 후 롤백
			/// - 실패 기준 : 영향을 받은 행이 0일 경우
			String message = e.getMessage();

			if (message.startsWith("DELETE_FAILED|")) {
				String[] parts = message.split("\\|");
				result.put("success", false);
				result.put("failReason", parts[0]);
				result.put("failedOperation", parts[1]);
				result.put("failedBarcode", parts[2]);

				System.out.println("*************************************");
				System.out.println("삭제 작업 실패: " + parts[1]);
				System.out.println("바코드: " + parts[2]);
				System.out.println("*************************************");
			}

			// ★ 트랜잭션이 살아있을 때만 롤백 표시
			if (TransactionSynchronizationManager.isActualTransactionActive()) {
				TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
			}

			// 롤백
			throw e;
		}
		/*if (true) { 테스트용 롤백
			TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
			return result;
		}*/

		return result;
	}

	// 종류별 삭제 매퍼 실행
	private void deleteDispatcher(String kind, Map<String, Object> param) {
		String barcode = (String) param.get("barcode");
		switch (kind) {
		case "INCOMING":
			// ===== 입고 =====
			updateStockForIncoming(param, barcode);
			break;
		case "LOAD":
			// ===== 출고 =====
			updateStockForLoad(param, barcode);
			break;
		default:
			throw new IllegalArgumentException("Unsupported kind: " + kind);
		}
	}

	// 입고
	private void updateStockForIncoming(Map<String, Object> param, String barcode) {
		// 입고 삭제 (로케이션)
		assertAffected(ulsanMapper.updateIncomingInLocation(param), "입고-로케이션", barcode);

		// 입고 삭제
		assertAffected(ulsanMapper.updateIncoming(param), "입고-삭제", barcode);
		System.out.println("인바운드 삭제 완료");

		assertAffected(ulsanMapper.updateIncomingInStock(param), "입고-재고", barcode);
	}

	// 출고
	private void updateStockForLoad(Map<String, Object> param, String barcode) {
		// 메모 추가
		param.put("memo_d", "OUTPUT");
		// 바코드 살리기
		ulsanMapper.updateLocationBarcodeByY(param);

		// 출고 삭제
		assertAffected(ulsanMapper.updateLoad(param), "출고-삭제", barcode);
		System.out.println("아웃바운드 삭제 완료");

		assertAffected(ulsanMapper.updateLoadInStock(param), "출고-재고", barcode);
	}

	// Helper : 영향행 검증
	private static void assertAffected(int affected, String operation, String barcode) {
		if (affected == 0) {
			throw new RuntimeException("DELETE_FAILED|" + operation + "|" + barcode);
		}
	}

	// 입고처리 - 입고내역
	@Override
	public Map<String, Object> readIncomingDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = ulsanMapper.readIncomingDetail(queryParams);
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

	// 입고처리 - 입고내역
	@Override
	public Map<String, Object> readIncomingSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = ulsanMapper.readIncomingSummary(queryParams);
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
	public Map<String, Object> readLoadDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = ulsanMapper.readLoadDetail(queryParams);
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
	public Map<String, Object> readLoadSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = ulsanMapper.readLoadSummary(queryParams);
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
	public Map<String, Object> readValidationDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = ulsanMapper.readValidationDetail(queryParams);
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
				Double totalCartQty = firstRecord.get("TOTALCARTQTY") != null
						? ((Number) firstRecord.get("TOTALCARTQTY")).doubleValue()
						: 0;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);
				result.put("totalCartQty", totalCartQty);

				// 페이징 정보 계산
				if (page != null && page > 0) {
					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				// 데이터가 없을 경우
				result.put("totalCount", 0);
				result.put("totalQty", 0);
				result.put("totalCartQty", 0);
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
			result.put("totalCartQty", 0);
			if (page != null && page > 0) {
				result.put("totalPages", 0);
			}
		}

		return result;
	}

}
