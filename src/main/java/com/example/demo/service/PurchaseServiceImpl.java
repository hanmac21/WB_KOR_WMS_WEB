/* --------------------------------------------------------------
 * 📋 PurchaseService 인터페이스 및 구현체
 * -------------------------------------------------------------- */

package com.example.demo.service;

import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.*;

import com.example.demo.mapper.wbpt.WbBasicMapper;
import com.example.demo.vo.*;
import org.apache.ibatis.session.ExecutorType;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.example.demo.mapper.wbpt.WbUlsanMapper;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PurchaseServiceImpl implements PurchaseService {

	@Autowired
	@Qualifier("wbptSqlSessionFactory")
	SqlSessionFactory sqlSessionFactory;

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
				String iid = parts[0];
				String date = parts[1];
				String factory = parts[2];
				String storage = parts[3];
				String barcode = parts[4];
				String loginid = (String) map.get("loginid");

				param.put("iid", iid);
				param.put("date", date);
				param.put("factory", factory);
				param.put("storage", storage);
				param.put("barcode", barcode);
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
		case "STOCKCOUNT":
			// ===== 출고 =====
			updateStockForRealStock(param, barcode);
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

//		assertAffected(ulsanMapper.updateIncomingInStock(param), "입고-재고", barcode);
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

//		assertAffected(ulsanMapper.updateLoadInStock(param), "출고-재고", barcode);
	}

	// 입고
	private void updateStockForRealStock(Map<String, Object> param, String barcode) {
		// 입고 삭제
		assertAffected(ulsanMapper.updateRealStock(param), "재고실사-삭제", barcode);
		System.out.println("재고실사 삭제 완료");
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

	@Override
	public Map<String, Object> read_sequenceSummary(Map<String, Object> params) {
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();

		try {
			// 쿼리 실행
			List<Map<String, Object>> records = ulsanMapper.read_sequenceSummary(searchParams);

			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = (Map<String, Object>) records.get(0);
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

	// 전체 페이지: 3개 라인 전부
	@Override
	public int upload_sequenceAll(MultipartFile file) throws Exception {
		return upload_sequence(file, Arrays.asList("T", "R", "F"));
	}

	// LINE T/R/F 페이지: 해당 라인만 (범위 밖 시트는 무시)
	@Override
	public int upload_sequenceLine(MultipartFile file, String line) throws Exception {
		return upload_sequence(file, Collections.singletonList(line));
	}

	// 코어 (모든 페이지 공유)
	private int upload_sequence(MultipartFile file, List<String> allowedLines) throws Exception {
		String[] sheetNames = {
			"LINE T",
			"LINE R",
			"LINE F"
		};

		int insertCount = 0;

		try (InputStream is = file.getInputStream();
		     Workbook wb = WorkbookFactory.create(is);
		     SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH, false)) {

			WbUlsanMapper mapper = session.getMapper(WbUlsanMapper.class);

			for (String sheetName : sheetNames) {
				String line = sheetName.substring(sheetName.length() - 1);   // "LINE T" -> "T"
				if (!allowedLines.contains(line)) continue;   // 이 화면 범위 아님

				Sheet sheet = wb.getSheet(sheetName);
				if (sheet == null) {
					System.out.println("시트 없음(건너뜀): " + sheetName);
					continue;
				}

				List<Map<String, Object>> rows = parseSequenceSheet(sheet, line);
				if (rows.isEmpty()) continue;

				String sdate = (String) rows.get(0).get("sdate");

				try {
					Map<String, Object> key = new HashMap<>();
					key.put("line", line);
					key.put("sdate", sdate);
					mapper.updateSequenceN(key);

					for (Map<String, Object> row : rows) {
						mapper.insertSequence(row);
					}
					session.flushStatements();
					session.commit();
					insertCount += rows.size();
				} catch (Exception ex) {
					session.rollback();
					System.out.println("실패(" + line + "): " + ex.getMessage());
				}
			}
		}
		return insertCount;
	}

	// 시트 -> 행 리스트. 컬럼 매핑은 나중에 교체(placeholder).
	private List<Map<String, Object>> parseSequenceSheet(Sheet sheet, String line) {
		List<Map<String, Object>> rows = new ArrayList<>();

		// 0행 헤더, 1행부터 데이터
		for (int i = 1; i <= sheet.getLastRowNum(); i++) {
			Row row = sheet.getRow(i);
			if (row == null || isEmptyRow(row)) continue;

			// 수량이 0이면 스킵
			String qty = getString(row.getCell(9));
			if ("0".equals(qty)) continue;

			String sdate = normalizeDate(getString(row.getCell(0)));   // DATE (삭제 키)
			if (sdate.isEmpty()) continue;

			Map<String, Object> map = new HashMap<>();
			map.put("sdate", sdate);
			map.put("j", getString(row.getCell(1)));
			map.put("halc", getString(row.getCell(2)));
			map.put("skid", getString(row.getCell(3)));
			map.put("productcode", getString(row.getCell(4)));
			map.put("spec", getString(row.getCell(5)));
			map.put("itemname", getString(row.getCell(6)));
			map.put("time", getString(row.getCell(7)));
			map.put("seq", getString(row.getCell(8)));
			map.put("qty", getString(row.getCell(9)));
			map.put("line", getString(row.getCell(10)));
			map.put("op1", "");
			map.put("op2", "");
			map.put("op3", "");
			map.put("op4", getString(row.getCell(14)));

			rows.add(map);
		}
		return rows;
	}

	// 행이 비어있는지 검사
	private boolean isEmptyRow(Row row) {
		for (Cell cell : row) {
			if (cell != null && !getString(cell).isEmpty()){
				return false;
			}
		}
		return true;
	}

	// 셀 타입을 문자열로 추출
	private String getString(Cell cell) {
		if (cell == null) return "";

		switch (cell.getCellType()) {
			case STRING:
				return cell.getStringCellValue().trim();
			case NUMERIC:
				if (DateUtil.isCellDateFormatted(cell)) {
					return new SimpleDateFormat("yyyy-MM-dd").format(cell.getDateCellValue());
				}
				double d = cell.getNumericCellValue();
				if (d == Math.floor(d) && !Double.isInfinite(d)) {
					return String.valueOf((long)d);
				}
				return String.valueOf(d);
			default:
				return "";
		}
	}

	// 날짜 정규화
	private String normalizeDate(String s){
		if (s == null) return "";
		s = s.trim();
		if (s.isEmpty()) return "";

		// 구분자 (. 또는 -) 로 분리
		String[] parts = s.split("[.\\-/]");
		if (parts.length != 3){
			// 예상 형식이 아니므로 원본 그대로
			return s;
		}

		String y = parts[0].trim();
		String m = parts[1].trim();
		String d = parts[2].trim();

		// 연도가 두 자리인 경우 네 자리로 변경
		if (y.length() == 2){
			y = "20" + y;
		}

		// 월/일이 한 자리인 경우 두 자리로 변경
		if (m.length() == 1) m = "0" + m;
		if (d.length() == 1) d = "0" + d;

		return y + "-" + m + "-" + d;
	}

	@Override
	public Map<String, Object> read_sequence(Map<String, Object> params) {
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();

		try {
			// 쿼리 실행
			System.out.println(searchParams);
			List<Map<String, Object>> records = ulsanMapper.read_sequence(searchParams);

			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = (Map<String, Object>) records.get(0);
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
}
