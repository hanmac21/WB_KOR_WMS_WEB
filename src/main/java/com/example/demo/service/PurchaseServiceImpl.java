/* --------------------------------------------------------------
 * 📋 PurchaseService 인터페이스 및 구현체
 * -------------------------------------------------------------- */

package com.example.demo.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import com.example.demo.vo.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.demo.mapper.wbpt.WbptMapper;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PurchaseServiceImpl implements PurchaseService {

	@Autowired
	private WbptMapper purchaseMapper;

	public List<WorkMoveVO> read_workMove() {
		return purchaseMapper.read_workMove();
	}

	@Override
	public List<RealStockVO> read_realStock(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_realStock(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 목록 조회 실패", e);
		}
	}

	@Override
	public List<String> read_realStock_dates(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_realStock_dates(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 날짜 목록 조회 실패", e);
		}
	}

	@Override
	public List<RealStockVO> read_realStockSummary(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_realStockSummary(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 목록 조회 실패", e);
		}
	}

	@Override
	public int getRealStockTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getRealStockTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 총 개수 조회 실패", e);
		}
	}

	@Override
	public int getRealStockSummaryTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getRealStockSummaryTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 총 개수 조회 실패", e);
		}
	}
	
	@Override
	public Map<String, Object> read_stockCountLastDayDetail(Map<String, Object> requestData) {
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
			List<RealStockVO> resultList = purchaseMapper.read_stockCountLastDayDetail(paramMap);
			int totalCount = purchaseMapper.getStockCountLastDayDetailTotalCount(paramMap);
			BigDecimal totalQty = purchaseMapper.getStockCountLastDayDetailTotalQty(paramMap);

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
	public List<Map<String, Object>> read_stockCountLastDayDetail_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return purchaseMapper.read_stockCountLastDayDetail_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("품질 불량 전체 목록 조회 실패", e);
		}
	}
	
	@Override
	public Map<String, Object> read_stockCountLastDaySummary(Map<String, Object> requestData) {
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
			List<RealStockVO> resultList = purchaseMapper.read_stockCountLastDaySummary(paramMap);
			int totalCount = purchaseMapper.getStockCountLastDaySummaryTotalCount(paramMap);
			BigDecimal totalQty = purchaseMapper.getStockCountLastDaySummaryTotalQty(paramMap);

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
	public List<Map<String, Object>> read_stockCountLastDaySummary_all(Map<String, Object> requestData) {
		try {
			Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
			return purchaseMapper.read_stockCountLastDaySummary_all(searchParams);
		} catch (Exception e) {
			throw new RuntimeException("품질 불량 전체 목록 조회 실패", e);
		}
	}

//	@Override
//	@Transactional
//	public int workMove_confirm_cancel(List<Map<String, Object>> param) {
//
//		// 오늘 날짜 (yyyyMMdd)
//		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
//
//		// ifno, ifno_yn, mes_key
//		// T_MM_DELIVERYSUB_IF - 135라인
//		// T_MM_DELIVERYSUB_REAL_IF - 150라인
//
//		for (int i = 0; i < param.size(); i++) {
//			int insertResult = 0;
//			Map<String, Object> row = param.get(i);
//			Map<String, Object> insertParam = new HashMap<String, Object>();
//
//			String maxIfno_if = purchaseMapper.selectIfno_workMove_if(today);
//			String maxIfno_real_if = purchaseMapper.selectIfno_workMove_real_if(today);
//			String newIfno_if;
//			String newIfno_real_if;
//
//			if (maxIfno_if == null) {
//				// 오늘 처음 생성이면 0001부터
//				newIfno_if = today + "0001";
//			} else {
//				// 마지막 4자리 추출 후 +1
//				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
//				int seq = Integer.parseInt(seqStr) + 1;
//				newIfno_if = today + String.format("%04d", seq);
//			}
//			if (maxIfno_real_if == null) {
//				// 오늘 처음 생성이면 0001부터
//				newIfno_real_if = today + "0001";
//			} else {
//				// 마지막 4자리 추출 후 +1
//				String seqStr = maxIfno_real_if.substring(8); // 뒤 4자리
//				int seq = Integer.parseInt(seqStr) + 1;
//				newIfno_real_if = today + String.format("%04d", seq);
//			}
//
//			// ifno와 wms_key 생성
//			insertParam.put("ifno_if", String.valueOf(newIfno_if));
//			insertParam.put("ifno_real_if", String.valueOf(newIfno_real_if));
//
//			// insertParam.put("wms_key", newIfno_if);
//			// PARAM 이 가지고있던 데이터 넣어주기
//			insertParam.put("iid", row.get("iid"));
////			insertParam.put("barcode", row.get("barcode"));
////			insertParam.put("car", row.get("car"));
////			insertParam.put("indate", row.get("indate"));
////			insertParam.put("itemcode", row.get("itemcode"));
////			insertParam.put("itemname", row.get("itemname"));
////			insertParam.put("qty", row.get("qty"));
////			insertParam.put("roomcode", row.get("roomcode"));
////			insertParam.put("wccode", row.get("wccode"));
////			insertParam.put("ymdhms", row.get("ymdhms"));
//			insertParam.put("wms_key", String.valueOf(row.get("wms_key")));
//
//			System.out.println(" -- WORK MOVE PARAM --");
//			System.out.println(insertParam);
//
//			insertResult += purchaseMapper.workMove_confirm_if_cancel(insertParam);
//			insertResult += purchaseMapper.workMove_confirm_real_if_cancel(insertParam);
//			insertResult += purchaseMapper.workMove_confirm_updateWorkMove_cancel(insertParam);
//
//			if (insertResult != 3) {
//				throw new RuntimeException("Task Error : Count Miss");
//			}
//
//		}
//
//		return 1;
//	}

	@Override
	public List<Map<String, Object>> getRackList(String storage, String factory, String searchType, String keyword) {

		// 🔸 매개변수 검증 및 기본값 설정
		Map<String, Object> params = new HashMap<>();
		params.put("storage", StringUtils.hasText(storage) ? storage : "default");
		params.put("factory", StringUtils.hasText(factory) ? factory : "default");
		params.put("searchType", StringUtils.hasText(searchType) ? searchType : "default");
		params.put("keyword", StringUtils.hasText(keyword) ? keyword.trim() : "");

		try {
			// 🔸 매퍼를 통해 RACK 목록 조회
			List<Map<String, Object>> rackList = new ArrayList<>();
			if ("H/REST".equals(storage)) {
				rackList = purchaseMapper.selectWorkRackList(params);
			} else {
				rackList = purchaseMapper.selectRackList(params);
			}

			// 🔸 데이터 후처리 (필요시)
			return processRackListData(rackList);

		} catch (Exception e) {
			throw new RuntimeException("RACK 목록 조회 중 오류 발생: " + e.getMessage(), e);
		}
	}

	public Map<String, Object> getRackDetail(String rackId, String storage, String factory) {
		if (!StringUtils.hasText(rackId))
			throw new IllegalArgumentException("RACK ID는 필수입니다.");

		Map<String, Object> params = new HashMap<>();
		String fx = StringUtils.hasText(factory) ? factory.trim() : "default";
		String st = StringUtils.hasText(storage) ? storage.trim() : "default";
		String rackIdNorm = rackId.toUpperCase().trim();

		params.put("rackId", rackIdNorm);
		params.put("storage", st);
		params.put("factory", fx);

		try {
			Map<String, Object> rackInfo = new HashMap<String, Object>();
			List<Map<String, Object>> positions = new ArrayList<>();
			if ("H/REST".equals(storage)) {
				rackInfo = purchaseMapper.selectWorkRackInfo(params);
				positions = purchaseMapper.selectWorkRackDetail(params);
			} else {
				rackInfo = purchaseMapper.selectRackInfo(params);
				positions = purchaseMapper.selectRackDetail(params);
			}
			if (rackInfo == null)
				throw new RuntimeException("RACK 정보를 찾을 수 없습니다: " + rackId);

			// 👇 factory/storage/rackId 컨텍스트 넘김
			rackInfo.put("factory", fx);
			rackInfo.put("storage", st);
			rackInfo.put("rackId", rackIdNorm);
			rackInfo.put("modules", buildModuleStructure(positions, rackIdNorm, st, fx));

			return rackInfo;
		} catch (Exception e) {
			throw new RuntimeException("RACK 상세 조회 중 오류 발생: " + e.getMessage(), e);
		}
	}

	// ---- 스킴 도우미 ----
	private String[] getLevelScheme(String factory) {
		if (factory != null && factory.equalsIgnoreCase("Puebla")) {
			return new String[] { "4", "3", "2", "1" }; // 시각상 위→아래
		}
		return new String[] { "D", "C", "B", "A" }; // Saltillo 기본
	}

	private String[] getPositionScheme(String factory) {
		if (factory != null && factory.equalsIgnoreCase("Puebla")) {
			return new String[] { "L", "R" };
		}
		return new String[] { "1", "2" };
	}

	private List<Map<String, Object>> buildModuleStructure(List<Map<String, Object>> positions, String rackId,
			String storage, String factory) {

		boolean isRackOnly = positions.stream().allMatch(p ->
				p.get("MODULENUM") == null &&
						p.get("LEVELNAME") == null &&
						p.get("POSITIONNUM") == null
		);

		if (isRackOnly) {
			// 모듈/레벨/포지션 구조 없이 positions 그대로 반환
			Map<String, Object> module = new HashMap<>();
			module.put("moduleNumber", 1);
			module.put("positions", positions.stream()
					.map(p -> createPositionData(p, 1, rackId, storage, factory, null, null))
					.collect(Collectors.toList()));
			return Collections.singletonList(module);
		}

		Map<Integer, List<Map<String, Object>>> moduleMap = positions.stream()
				.collect(Collectors.groupingBy(p -> ensureInteger(p.get("MODULENUM"))));

		int maxModuleFromData = moduleMap.keySet().stream().mapToInt(Integer::intValue).max().orElse(0);
		int maxModule = Math.max(1, maxModuleFromData); // 최소 1 유지 (또는 정책대로)

		List<Map<String, Object>> modules = new ArrayList<>();
		for (int moduleNum = 1; moduleNum <= maxModule; moduleNum++) {
			Map<String, Object> module = new HashMap<>();
			module.put("moduleNumber", moduleNum);

			List<Map<String, Object>> modulePositions = moduleMap.getOrDefault(moduleNum, Collections.emptyList());
			List<Map<String, Object>> processed = processPositionData(modulePositions, moduleNum, rackId, storage,
					factory);

			module.put("positions", processed);
			modules.add(module);
		}
		return modules;
	}

	private List<Map<String, Object>> processPositionData(List<Map<String, Object>> positions, int moduleNum,
			String rackId, String storage, String factory) {

		String[] levels = getLevelScheme(factory);
		String[] posScheme = getPositionScheme(factory);

		List<Map<String, Object>> all = new ArrayList<>();
		for (String level : levels) {
			for (String pos : posScheme) {
				final String lv = level;
				final String pz = pos;

				Map<String, Object> existing = positions.stream()
						.filter(p -> Objects.toString(p.get("LEVELNAME"), "").equals(lv)
								&& Objects.toString(p.get("POSITIONNUM"), "").equals(pz))
						.findFirst().orElse(null);

				Map<String, Object> slot = createPositionData(existing, moduleNum, rackId, storage, factory, lv, pz);
				all.add(slot);
			}
		}
		return all;
	}

	private Map<String, Object> createPositionData(Map<String, Object> dbData, int moduleNum, String rackId,
			String storage, String factory, String level, String pos) {

		Map<String, Object> m = new HashMap<>();
		String positionId = String.format("%s", rackId);

		if (dbData != null) {
			m.put("iid", dbData.get("IID"));
			m.put("positionId", positionId);
			m.put("location", dbData.get("LOCATION"));
			m.put("module", dbData.get("MODULENUM"));
			m.put("level", dbData.get("LEVELNAME"));
			m.put("position", dbData.get("POSITIONNUM"));
			m.put("status", dbData.get("POSITIONSTATUS"));
			m.put("useyn", dbData.get("USEYN"));
			m.put("sdate", dbData.get("SDATE"));
			m.put("ymdhms", dbData.get("YMDHMS"));
			m.put("ymdhmsD", dbData.get("YMDHMS_D"));
			m.put("barcode", dbData.get("BARCODE"));
			m.put("itemcode", dbData.get("ITEMCODE"));
			m.put("qty", ensureInteger(dbData.get("QTY")));
			m.put("memo", dbData.get("MEMO"));
			m.put("loginid", dbData.get("LOGINID"));
			m.put("delMemo", dbData.get("DEL_MEMO"));
			m.put("itemcode_mi", dbData.get("ITEMCODE_MI"));
			m.put("itemname_mi", dbData.get("ITEMNAME_MI"));
			m.put("carname", dbData.get("CARNAME"));
			m.put("indate_wms", dbData.get("INDATE_WMS"));
		} else {
			m.put("iid", null);
			m.put("positionId", positionId);
			m.put("location", String.format("%s-%s-%s", factory, storage, rackId));
			m.put("module", null);
			m.put("level", null);
			m.put("position", null);
			m.put("status", "empty");
			m.put("useyn", "Y");
			m.put("indate", null);
			m.put("ymdhms", null);
			m.put("ymdhmsD", null);
			m.put("barcode", null);
			m.put("itemcode", null);
			m.put("qty", 0);
			m.put("memo", null);
			m.put("loginid", null);
			m.put("delMemo", null);
			m.put("carInfo", null);
		}
		return m;
	}

//	/**
//	 * RACK 목록 데이터 후처리
//	 */
	private List<Map<String, Object>> processRackListData(List<Map<String, Object>> rackList) {

		return rackList.stream().map(rack -> {
			// 🔸 데이터 타입 보정
			rack.put("utilizationRate", ensureInteger(rack.get("UTILIZATIONRATE")));
			rack.put("currentCount", ensureInteger(rack.get("CURRENTCOUNT")));
			rack.put("totalCapacity", ensureInteger(rack.get("TOTALCAPACITY")));
			rack.put("totalQty", ensureInteger(rack.get("TOTALQTY")));

			// 🔸 키 이름 정규화 (Oracle 대문자 → camelCase)
			rack.put("rackId", rack.get("RACKID"));
			rack.put("rackName", rack.get("RACKNAME"));
			rack.put("storage", rack.get("STORAGE"));
			rack.put("area", rack.get("AREA"));
			rack.put("lastUpdated", rack.get("LASTUPDATED"));

			return rack;
		}).collect(Collectors.toList());
	}

	/**
	 * Integer 타입 보장
	 */
	private Integer ensureInteger(Object value) {
		if (value == null)
			return 0;
		if (value instanceof Integer)
			return (Integer) value;
		if (value instanceof Number)
			return ((Number) value).intValue();
		try {
			return Integer.valueOf(value.toString());
		} catch (NumberFormatException e) {
			return 0;
		}
	}

//	@Override
//	public int inbound_confirm_cancel_summary(List<String> list) { // 250822 출고인터페이스 취소 진행중
//		// 중복 제거 (순서 유지)
//		list = new ArrayList<>(new LinkedHashSet<>(list));
//		for (int i = 0; i < list.size(); i++) {
//			Map<String, Object> map = new HashMap<String, Object>();
//			LocalDate today = LocalDate.now();
//			String date8 = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
//			String maxIfno = purchaseMapper.selectIfnoIn(date8); // 오늘날짜 기준 가장큰 ifno값 가져오기
//			String nextIfno = "";
//			if (maxIfno == null) {
//				maxIfno = date8 + "0001"; // 기본값
//				System.out.println("maxIfno null값 : " + maxIfno);
//				map.put("ifno", maxIfno);
//
//			} else {
//				long nextVal = Long.parseLong(maxIfno) + 1;
//				nextIfno = String.format("%012d", nextVal); // 자리수 맞추기
//				System.out.println("maxIfno null아닐때 : " + maxIfno);
//				map.put("ifno", nextIfno);
//			}
//			map.put("meskey", list.get(i)); // mes_key값 ifno값에서 앞에 20빼고 +"PO"
//
//			map.put("cuddiv", "D");
//
//			purchaseMapper.inbound_confirm_cancel(map);
//			purchaseMapper.inbound_intf_pm_cancel(map);
//			purchaseMapper.inbound_intf_qc_cancel(map);
//		}
//
//		//
//		return 0;
//	}

	@Override
	public int checkWorkLocationRow(Map<String, String> param) {
		return purchaseMapper.checkWorkLocationRow(param);
	}

	@Override
	public int checkLocationRow(Map<String, String> param) {
		return purchaseMapper.checkLocationRow(param);
	}

//	@Override
//	public List<Map<String, Object>> unloadedList() {
//		return purchaseMapper.unloadedList();
//	}
	@Override
	public Map<String, Object> unloadedList(int page, int size, String factory, String storage) throws Exception {
		Map<String, Object> result = new HashMap<>();
		Map<String, Object> params = new HashMap<>();

		// 페이징 계산
		int offset = (page - 1) * size;
		params.put("offset", offset);
		params.put("pageSize", size);
		params.put("factory", factory);
		params.put("storage", storage);

		// 데이터 조회
		List<Map<String, Object>> list = purchaseMapper.unloadedList(params);

		// 전체 개수 조회
		int totalCount = purchaseMapper.unloadedListCount(params);

		// 총 페이지 수 계산
		int totalPages = (int) Math.ceil((double) totalCount / size);

		result.put("list", list);
		result.put("total", totalCount);
		result.put("page", page);
		result.put("size", size);
		result.put("totalPages", totalPages);
		result.put("success", true);

		return result;
	}

	// 예외 출고 등록
	@Override
	public void insertExcpetionOutput(@RequestBody Map<String, Object> data) {
		List<String> list = (List<String>) data.get("list");

		// 오늘 날짜와 현재 시간 추가
//		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		String searchDate = (String) data.get("searchDate");
		String nowDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

		Map<String, Object> insertParam = new HashMap<String, Object>();

		for (int i = 0; i < list.size(); i++) {
			String uniqueValue = (String) list.get(i);

			String[] uniqueParts = uniqueValue.split("\\|");
			System.out.println(uniqueValue);

			System.out.println(uniqueParts[0]);

			String barcode = uniqueParts[0];
			String sdate = uniqueParts[1];
			String factory = uniqueParts[2];
			String storage = uniqueParts[3];
			String qty = uniqueParts[4];
			String itemcode = uniqueParts[5];
			String loginid = (String) data.get("loginid");
			String memo = (String) data.get("memo");
//			String custcode = (String) data.get("sabun");
//			String custname = purchaseMapper.getCustName(custcode);

			String insertDate = searchDate;

			if (insertDate == null || insertDate.trim().isEmpty()) {
				insertDate = sdate;
			}

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("date", insertDate);
			insertParam.put("sdate", insertDate);
			insertParam.put("barcode", barcode);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("itemcode", itemcode);
			insertParam.put("qty", qty);
			insertParam.put("loginid", loginid);
//			insertParam.put("custcode", custcode);
//			insertParam.put("custname", custname);
			insertParam.put("source", "LOADEXCEPTION");
			insertParam.put("memo", memo);
			insertParam.put("ymdhms", nowDateTime);
			insertParam.put("laststatus", 50);

			// 바코드 파싱 (인라인)
			if (barcode.split(",").length == 5) { // 파트라벨
				String[] parts = barcode.split("_", -1);
				insertParam.put("itemcode", parts[0]);
				insertParam.put("bdate", parts[1]);
				insertParam.put("seq", parts[2]);
//				insertParam.put("qty", parts[3]);						// 251022 DH - 바코드에서 자른 값 보단 DB에서 조회해서 전달해준값으로 수량 지정
				insertParam.put("scmmex", parts[4]);
				insertParam.put("type", "box");

				// laststatus 50으로 업데이트 - Barcode 테이블
				System.out.println("파트 진입 1");
				try {
					purchaseMapper.updateLaststatus_barcode(insertParam);
					System.out.println("UPDATE 성공");
				} catch (Exception e) {
					System.out.println("UPDATE 실패: " + e.getMessage());
					e.printStackTrace();
				}

			} else if (barcode.startsWith("P") && (barcode.endsWith("MEX") || barcode.endsWith("USA"))) { // 팔레트라벨
				String[] parts = barcode.split(",", -1);
				String bdate = (parts.length >= 1 && parts[0].length() >= 8) ? parts[0].substring(1, 7) : "";
				String seq = (parts.length >= 1 && parts[0].length() >= 8) ? parts[0].substring(7) : "";
				String scmmex = (parts.length >= 4) ? parts[3] : "";
				insertParam.put("itemcode", parts[1]);
				insertParam.put("bdate", bdate);
				insertParam.put("seq", seq);
				insertParam.put("scmmex", scmmex);
				insertParam.put("type", "pallet");

				// laststatus 50으로 업데이트 - Pallet 테이블
				System.out.println("팔레트 진입 3");
				System.out.println("바코드 Status -- " + barcode);
				purchaseMapper.updateLaststatus_pallet(insertParam);
				List<String> barcodeList = purchaseMapper.read_palletInBarcodeList(barcode);
				for (int j = 0; j < barcodeList.size(); j++) {
					// laststatus 50으로 업데이트 - Barcode 테이블
					System.out.println("파트 진입 3");
					insertParam.put("barcode", barcodeList.get(j));
					purchaseMapper.updateLaststatus_barcode(insertParam);
				}
			}else if(barcode.split("_",-1).length == 6){
				String[] parts = barcode.split("_", -1);
				Map<String, Object> item = purchaseMapper.getItemInfoSpec(parts[3]);
				insertParam.put("oitemcode", item.get("OITEMCODE"));
				insertParam.put("itemcode", item.get("ITEMCODE"));
				insertParam.put("bdate", parts[2].substring(2)+parts[1]+parts[0]);
				insertParam.put("seq", parts[5]);
				insertParam.put("scmmex", "");
				insertParam.put("type", "BOX");
			}

			System.out.println("============= INSERT EXCEPTION OUTPUT =============");
			System.out.println(insertParam);
			insertParam.put("barcode", barcode);
			// 예외 출고 등록
			purchaseMapper.insertExceptionOutput(insertParam);

			// Stock 테이블 등록
			purchaseMapper.insertStock(insertParam);

			// location useyn N으로 업데이트
			purchaseMapper.updateUnloadedBarcode(insertParam);

		}
	}

	// 미스캔메뉴 재고조정
	@Override
	public void adjustment(@RequestBody Map<String, Object> data) {
		List<String> list = (List<String>) data.get("list");

		Map<String, Object> insertParam = new HashMap<String, Object>();

		for (int i = 0; i < list.size(); i++) {
			String uniqueValue = (String) list.get(i);

			String[] uniqueParts = uniqueValue.split("\\|");
			System.out.println(uniqueParts);

			String barcode = uniqueParts[0];
			String outdate = uniqueParts[1];
			String factory = uniqueParts[2];
			String storage = uniqueParts[3];
			String qty = uniqueParts[4];
			String itemcode = uniqueParts[5];
			String loginid = (String) data.get("loginid");
			String memo = (String) data.get("memo");
			String date = data.get("date") == null ? "" : data.get("date").toString();

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("barcode", barcode);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("itemcode", itemcode);
			insertParam.put("qty", qty);
			insertParam.put("loginid", loginid);
			insertParam.put("memo", memo);
			insertParam.put("laststatus", 1);
			insertParam.put("date", date);

			// 바코드 파싱 (인라인)
			if (barcode.split(",").length == 5) { // 파트라벨
				String[] parts = barcode.split(",", -1);
				insertParam.put("itemcode", parts[0]);
				insertParam.put("bdate", parts[1]);
				insertParam.put("seq", parts[2]);
//					insertParam.put("qty", parts[3]);						// 251022 DH - 바코드에서 자른 값 보단 DB에서 조회해서 전달해준값으로 수량 지정
				insertParam.put("scmmex", parts[4]);
				insertParam.put("type", "box");

				// laststatus 50으로 업데이트 - Barcode 테이블
				System.out.println("파트 진입 1");
				try {
					purchaseMapper.updateLaststatus_barcode(insertParam);
					System.out.println("UPDATE 성공");
				} catch (Exception e) {
					System.out.println("UPDATE 실패: " + e.getMessage());
					e.printStackTrace();
				}

			} else if (barcode.length() == 12 && barcode.startsWith("P")) { // (구)팔레트라벨
				PalletVO palletInfo = purchaseMapper.palletInfo(barcode);
				insertParam.put("itemcode", palletInfo.getItemcode());
				insertParam.put("bdate", "");
				insertParam.put("seq", "");
				insertParam.put("qty", palletInfo.getQty());
				insertParam.put("scmmex", "");
				insertParam.put("type", "pallet");

				// laststatus 50으로 업데이트 - Pallet 테이블
				System.out.println("팔레트 진입 2");
				purchaseMapper.updateLaststatus_pallet(insertParam);
				List<String> barcodeList = purchaseMapper.read_palletInBarcodeList(barcode);
				for (int j = 0; j < barcodeList.size(); j++) {
					// laststatus 50으로 업데이트 - Barcode 테이블
					insertParam.put("barcode", barcodeList.get(j));
					System.out.println("파트 진입 2");
					purchaseMapper.updateLaststatus_barcode(insertParam);
				}

			} else if (barcode.startsWith("P") && barcode.endsWith("MEX")) { // 팔레트라벨
				String[] parts = barcode.split(",", -1);
				String bdate = (parts.length >= 1 && parts[0].length() >= 8) ? parts[0].substring(1, 7) : "";
				String seq = (parts.length >= 1 && parts[0].length() >= 8) ? parts[0].substring(7) : "";
				String scmmex = (parts.length >= 4) ? parts[3] : "";
				insertParam.put("itemcode", parts[1]);
				insertParam.put("bdate", bdate);
				insertParam.put("seq", seq);
//					insertParam.put("qty", parts[2]);						// 251022 DH - 바코드에서 자른 값 보단 DB에서 조회해서 전달해준값으로 수량 지정
				insertParam.put("scmmex", scmmex);
				insertParam.put("type", "pallet");

				// laststatus 50으로 업데이트 - Pallet 테이블
				System.out.println("팔레트 진입 3");
				System.out.println("바코드 Status -- " + barcode);
				purchaseMapper.updateLaststatus_pallet(insertParam);
				List<String> barcodeList = purchaseMapper.read_palletInBarcodeList(barcode);
				for (int j = 0; j < barcodeList.size(); j++) {
					// laststatus 50으로 업데이트 - Barcode 테이블
					System.out.println("파트 진입 3");
					insertParam.put("barcode", barcodeList.get(j));
					purchaseMapper.updateLaststatus_barcode(insertParam);
				}
			}

			System.out.println("============= ADJUSTMENT UPDATE =============");
			System.out.println(insertParam);

			// location useyn N으로 업데이트
			purchaseMapper.adjustment(insertParam);
			// OUTBOUND USEYN = 'N'으로 INSERT
			purchaseMapper.insertExceptionOutputN(insertParam);
			// 삭제하는 날짜를 기준으로 locationbackup useyn N으로 업데이트
			purchaseMapper.adjustmentInBackup(insertParam);

		}
	}

	// 적재위치 detail
	@Override
	public Map<String, Object> locationDetail(String barcode) {
		Map<String, Object> result = new HashMap<>();
		try {
			List<Map<String, Object>> list = new ArrayList<>();
			
			list = purchaseMapper.selectLocationDetail(barcode);
			result.put("list", list);
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
		}
		return result;
	}

	// 불출 - detail
	@Override
	public List<WorkMoveVO> read_wipDetail(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_wipDetail(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("불출 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_wipDetail_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_wipDetail_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("불출 전체 목록 조회 실패", e);
		}
	}

	// 불출 - summary
	@Override
	public List<WorkMoveVO> read_wipSummary(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_wipSummary(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("불출 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_wip_summary_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_wip_summary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("불출 내역 전체 목록 조회 실패", e);
		}
	}

	// 입고 - detail
	@Override
	public List<ProductVO> read_incomingDetail(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_incomingDetail(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("입고 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_incomingDetail_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_incomingDetail_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("입고 전체 목록 조회 실패", e);
		}
	}

	// 입고 - summary
	@Override
	public List<ProductVO> read_incomingSummary(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_incomingSummary(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("입고 목록 조회 실패", e);
		}
	}

	// 입고 - summary - 공급사 업데이트
	@Override
	public Map<String, Object> incommingSupplierUpdate(Map<String, Object> requestData) {
		List<String> iidList = (List<String>) requestData.get("iidList");
		String supplier = (String) requestData.get("supplier");

		int magamCnt = 0;
		int lockCnt = 0;
		int buyCnt = 0;
		int laterCnt = 0;
		int noExistCnt = 0;

		for (String uniqueValue : iidList) {
			String[] parts = uniqueValue.split("\\|");

			String iid     = parts[0];
			String condate = parts.length > 1 ? parts[1].replace("-", "") : "";
			String meskey  = parts.length > 5 ? parts[5] : "";

			Map<String, Object> map = new HashMap<>();
			map.put("custcode", supplier.split("_")[0]);
			map.put("custname", supplier.split("_")[1]);
			map.put("iid",     iid);
			map.put("condate", condate);
			map.put("meskey",  meskey);

			// 1️⃣ 입고마감 여부
			int magam = purchaseMapper.selectIncomingCloseCnt(map);
			if (magam > 0) {
				magamCnt++;
				continue;
			}

			// 락 여부
			int lock = purchaseMapper.selectLockCnt(map);
			if (lock > 0) {
				lockCnt++;
				continue;
			}

			// 2️⃣ 매입처리 여부
			int buy = purchaseMapper.selectIncomingBuyCnt(map);
			if (buy > 0) {
				buyCnt++;
				continue;
			}

			// 3️⃣ 후처리 여부
			int later = purchaseMapper.selectIncomingLaterCnt(map);
			if (later > 0) {
				laterCnt++;
				continue;
			}

			// 4️⃣ 삭제 대상 여부
			int noExist = purchaseMapper.selectIncomingDeleteTargetCnt(map);
			if (noExist == 0) {
				noExistCnt++;
				continue;
			}

			purchaseMapper.incommingSupplierUpdate(map);
			// meskey가 있는 경우에만 인터페이스 관련 테이블에 업데이트 함
			if (!meskey.isEmpty()){
				purchaseMapper.buyrequestsubIfSupplierUpdate(map);
				purchaseMapper.buyrequestsubSupplierUpdate(map);

				purchaseMapper.entersubIfSupplierUpdate(map);
				purchaseMapper.entersubSupplierUpdate(map);
			}
		}

		Map<String, Object> result = new HashMap<>();
		result.put("magamCnt",   magamCnt);
		result.put("lockCnt",    lockCnt);
		result.put("buyCnt",     buyCnt);
		result.put("laterCnt",   laterCnt);
		result.put("noExistCnt", noExistCnt);
		return result;
	}

	@Override
	public List<Map<String, Object>> read_incomingListSummary_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_incomingListSummary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("입고 내역 전체 목록 조회 실패", e);
		}
	}

	@Override
	public List<String> selectSupplier() {
		try {
			return purchaseMapper.selectSupplier();
		} catch (Exception e) {
			throw new RuntimeException("FAIL", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_realStock_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_realStock_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 전체 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_realStockSummary_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_realStockSummary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고실사 전체 목록 조회 실패", e);
		}
	}

	// 재고 - detail
	@Override
	public List<StockVO> read_stockDetail(Map<String, Object> paramMap) {

		// 오늘 날짜 (yyyy-MM-dd)
		String today = LocalDate.now().toString();

		String toDate = (String) paramMap.get("toDate");
		if (toDate == null || toDate.trim().isEmpty()) {
			toDate = today;
		}

		// YYYY-MM-dd -> 같은 달 1일(YYYY-MM-01)
		String fromDate = toDate.substring(0, 8) + "01";

		paramMap.put("fromDate", fromDate);
		paramMap.put("toDate", toDate);

		try {
			return purchaseMapper.read_stockDetail(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고 목록 조회 실패", e);
		}
	}

	@Override
	public List<StockVO> read_stockDetail_all(Map<String, Object> searchParam) {

		String toDate = (String) searchParam.get("toDate");

		if (toDate == null || toDate.trim().isEmpty()) {
			toDate = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		}
		toDate = toDate.trim();

		String toDateYmd = toDate.replace("-", "");
		if (toDateYmd.length() != 8) {
			throw new IllegalArgumentException("toDate format invalid: " + toDate);
		}

		String fromDateYmd = toDateYmd.substring(0, 6) + "01";

		searchParam.put("fromDate", fromDateYmd);
		searchParam.put("toDate", toDateYmd);

		String sortKey = (String) searchParam.get("sortKey");
		String sortDir = (String) searchParam.get("sortDir");

		if (sortKey == null || sortKey.trim().isEmpty())
			sortKey = "YMDHMS";
		if (sortDir == null || sortDir.trim().isEmpty())
			sortDir = "DESC";
		sortDir = sortDir.trim().toUpperCase();
		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
			sortDir = "DESC";

		searchParam.put("sortKey", sortKey.trim().toUpperCase());
		searchParam.put("sortDir", sortDir);

		try {
			return purchaseMapper.read_stockDetail_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고 전체 목록 조회 실패", e);
		}
	}

	@Override
	public List<StockVO> read_stockSnapDetail(Map<String, Object> paramMap) {
		ZoneId zoneId = ZoneId.of("America/Chicago");
		LocalDate today = LocalDate.now(zoneId);

		String backupdate = String.valueOf(paramMap.getOrDefault("backupdate", "")).trim();

		if (!backupdate.isEmpty()) {
			LocalDate reqDate = LocalDate.parse(backupdate);

			if (reqDate.isAfter(today)) {
				// 🔥 오늘로 강제 보정
				backupdate = today.toString();
				paramMap.put("backupdate", backupdate);
			}
		}

		String toDate = (String) paramMap.get("toDate");
		if (toDate == null || toDate.trim().isEmpty()) {
			toDate = today.toString();
		}

		// YYYY-MM-dd -> 같은 달 1일(YYYY-MM-01)
		String fromDate = toDate.substring(0, 8) + "01";

		paramMap.put("fromDate", fromDate);
		paramMap.put("toDate", toDate);
		paramMap.put("backupdate", backupdate);

		try {
			return purchaseMapper.read_stockSnapDetail(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고 목록 조회 실패", e);
		}
	}

	@Override
	public List<StockVO> read_stockSnapDetail_all(Map<String, Object> searchParam) {

		String toDate = (String) searchParam.get("toDate");

		if (toDate == null || toDate.trim().isEmpty()) {
			toDate = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		}
		toDate = toDate.trim();

		String toDateYmd = toDate.replace("-", "");
		if (toDateYmd.length() != 8) {
			throw new IllegalArgumentException("toDate format invalid: " + toDate);
		}

		String fromDateYmd = toDateYmd.substring(0, 6) + "01";

		searchParam.put("fromDate", fromDateYmd);
		searchParam.put("toDate", toDateYmd);

		String sortKey = (String) searchParam.get("sortKey");
		String sortDir = (String) searchParam.get("sortDir");

		if (sortKey == null || sortKey.trim().isEmpty())
			sortKey = "YMDHMS";
		if (sortDir == null || sortDir.trim().isEmpty())
			sortDir = "DESC";
		sortDir = sortDir.trim().toUpperCase();
		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
			sortDir = "DESC";

		searchParam.put("sortKey", sortKey.trim().toUpperCase());
		searchParam.put("sortDir", sortDir);

		try {
			return purchaseMapper.read_stockSnapDetail_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고 전체 목록 조회 실패", e);
		}
	}
	
	@Override
	public List<StockVO> read_stockSummary(Map<String, Object> paramMap) {
		
		// 오늘 날짜 (yyyy-MM-dd)
		String today = LocalDate.now().toString();
		
		String toDate = (String) paramMap.get("toDate");
		if (toDate == null || toDate.trim().isEmpty()) {
			toDate = today;
		}
		
		// YYYY-MM-dd -> 같은 달 1일(YYYY-MM-01)
		String fromDate = toDate.substring(0, 8) + "01";
		
		paramMap.put("fromDate", fromDate);
		paramMap.put("toDate", toDate);
		
		try {
			return purchaseMapper.read_stockSummary(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고 목록 조회 실패", e);
		}
	}

	@Override
	public List<StockVO> read_stockSummary_all(Map<String, Object> searchParam) {
		
		String toDate = (String) searchParam.get("toDate");
		
		if (toDate == null || toDate.trim().isEmpty()) {
			toDate = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		}
		toDate = toDate.trim();
		
		String toDateYmd = toDate.replace("-", "");
		if (toDateYmd.length() != 8) {
			throw new IllegalArgumentException("toDate format invalid: " + toDate);
		}
		
		String fromDateYmd = toDateYmd.substring(0, 6) + "01";
		
		searchParam.put("fromDate", fromDateYmd);
		searchParam.put("toDate", toDateYmd);
		
		String sortKey = (String) searchParam.get("sortKey");
		String sortDir = (String) searchParam.get("sortDir");
		
		if (sortKey == null || sortKey.trim().isEmpty())
			sortKey = "YMDHMS";
		if (sortDir == null || sortDir.trim().isEmpty())
			sortDir = "DESC";
		sortDir = sortDir.trim().toUpperCase();
		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
			sortDir = "DESC";
		
		searchParam.put("sortKey", sortKey.trim().toUpperCase());
		searchParam.put("sortDir", sortDir);
		
		try {
			return purchaseMapper.read_stockSummary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고 전체 목록 조회 실패", e);
		}
	}

	// 재고 - 수불부
	@Override
	public List<StockVO> read_stockMovement(Map<String, Object> paramMap) {
		System.out.println("2번");
		System.out.println(paramMap);
		try {
			return purchaseMapper.read_stockMovement(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_stockMovement_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_stockMovement_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("재고 전체 목록 조회 실패", e);
		}
	}

	@Override
	public int getStockMovementTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getStockMovementTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("재고 총 개수 조회 실패", e);
		}
	}

	// 피딩 - detail
	@Override
	public List<WipReturnVO> read_feedingDetail(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_feedingDetail(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("피딩 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_feedingDetail_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_feedingDetail_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("피딩 전체 목록 조회 실패", e);
		}
	}

	@Override
	public int getFeedingDetailTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getFeedingDetailTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("피딩 총 개수 조회 실패", e);
		}
	}

	@Override
	public BigDecimal getFeedingDetailTotalQty(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getFeedingDetailTotalQty(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("피딩 총 개수 조회 실패", e);
		}
	}

	// 피딩 - summary
	@Override
	public List<WipReturnVO> read_feedingSummary(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_feedingSummary(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("피딩 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_feedingSummary_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_feedingSummary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("피딩 전체 목록 조회 실패", e);
		}
	}

	@Override
	public int getFeedingSummaryTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getFeedingSummaryTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("피딩 총 개수 조회 실패", e);
		}
	}

	@Override
	public BigDecimal getFeedingSummaryTotalQty(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getFeedingSummaryTotalQty(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("피딩 총 개수 조회 실패", e);
		}
	}

	// 언팩 - detail
	@Override
	public List<UnpackVO> read_unpackDetail(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_unpackDetail(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("언팩 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_unpackDetail_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_unpackDetail_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("언팩 전체 목록 조회 실패", e);
		}
	}

	@Override
	public int getUnpackDetailTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getUnpackDetailTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("언팩 총 개수 조회 실패", e);
		}
	}

	@Override
	public BigDecimal getUnpackDetailTotalQty(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getUnpackDetailTotalQty(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("언팩 총 개수 조회 실패", e);
		}
	}

	// 언팩 - detail
	@Override
	public List<UnpackVO> read_unpackBalance(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_unpackBalance(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("언팩 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_unpackBalance_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_unpackBalance_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("언팩 전체 목록 조회 실패", e);
		}
	}

	@Override
	public int getUnpackBalanceTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getUnpackBalanceTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("언팩 총 개수 조회 실패", e);
		}
	}

	@Override
	public BigDecimal getUnpackBalanceTotalQty(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getUnpackBalanceTotalQty(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("언팩 총 개수 조회 실패", e);
		}
	}


	@Override
	public List<Map<String, Object>> read_unpackSummary_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_unpackSummary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("언팩 전체 목록 조회 실패", e);
		}
	}

	@Override
	public List<String> selectCustomer() {
		try {
			return purchaseMapper.selectCustomer();
		} catch (Exception e) {
			throw new RuntimeException("FAIL", e);
		}
	}

	// 출고 - list - 공급사 업데이트
	@Override
	public Map<String, Object> loadCustomerUpdate(Map<String, Object> requestData) {
		List<String> iidList = (List<String>) requestData.get("iidList");
		String supplier = (String) requestData.get("supplier");

		int magamCnt = 0;
		int lockCnt = 0;
		int laterCnt = 0;
		int noExistCnt = 0;

		for (String uniqueValue : iidList) {
			String[] parts = uniqueValue.split("\\|");

			String iid     = parts[0];
			String condate = parts.length > 1 ? parts[1].replace("-", "") : "";
			String meskey  = parts.length > 5 ? parts[5] : "";

			Map<String, Object> map = new HashMap<>();
			map.put("custcode", supplier.split("\\|")[0]);
			map.put("custname", supplier.split("\\|")[1]);
			map.put("iid",     iid);
			map.put("condate", condate);
			map.put("meskey",  meskey);
			map.put("mes_key", meskey);				// 출고 후처리, 삭제 대상 여부에 mes_key가 필요해서 추가함

			// 1️ 출고마감 여부
			int magam = purchaseMapper.selectLoadCloseCnt(map);
			if (magam > 0) {
				magamCnt++;
				continue;
			}

			// 2 락 여부
			int lock = purchaseMapper.selectLockCnt(map);
			if (lock > 0) {
				lockCnt++;
				continue;
			}

			// 3 후처리 여부
			int later = purchaseMapper.selectLoadLaterCnt(map);
			if (later > 0) {
				laterCnt++;
				continue;
			}

			// 4 삭제 대상 여부
			int noExist = purchaseMapper.selectLoadDeleteTargetCnt(map);
			if (noExist == 0) {
				noExistCnt++;
				continue;
			}

			purchaseMapper.loadCustomerUpdate(map);
			// meskey가 있는 경우에만 인터페이스 관련 테이블에 업데이트 함
			if (!meskey.isEmpty()){
				purchaseMapper.deliverysubIfSupplierUpdate(map);
				purchaseMapper.deliverysubSupplierUpdate(map);
			}
		}

		Map<String, Object> result = new HashMap<>();
		result.put("magamCnt",   magamCnt);
		result.put("lockCnt",    lockCnt);
		result.put("laterCnt",   laterCnt);
		result.put("noExistCnt", noExistCnt);
		return result;
	}

	// 출고 - summary - 날짜 업데이트
	@Override
	public int loadDateUpdate(Map<String, Object> map) {
		try {
			return purchaseMapper.loadDateUpdate(map);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_factoryComplete_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_factoryComplete_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("공장 이동 전체 목록 조회 실패", e);
		}
	}

	// 이송 후 재고확인
	@Override
	public List<FactoryMoveVO> read_factoryTransferCheck(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_factoryTransferCheck(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("이송 후 재고확인 목록 조회 실패", e);
		}
	}

	@Override
	public int getFactoryTransferCheckTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getFactoryTransferCheckTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("이송 후 재고확인 총 개수 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_factoryTransferCheck_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_factoryTransferCheck_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("이송 후 재고확인 전체 목록 조회 실패", e);
		}
	}

	// TOTAL QTY
	@Override
	public String updateTotalQtyPalletList(Map<String, Object> param) {
		return purchaseMapper.updateTotalQtyPalletList(param);
	}

	@Override
	public String updateTotalQtyIncomingListDetail(Map<String, Object> param) {
		return purchaseMapper.updateTotalQtyIncomingListDetail(param);
	}

	@Override
	public String updateTotalQtyStockCount(Map<String, Object> param) {
		return purchaseMapper.updateTotalQtyStockCount(param);
	}

	@Override
	public List<StockVO> read_stockInfo(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_stockInfo(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public int getStockInfoTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getStockInfoTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public BigDecimal getStockInfoTotalQty(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getStockInfoTotalQty(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_stockInfo_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_stockInfo_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public List<StockVO> read_stockHistory(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_stockHistory(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public int getStockHistoryTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getStockHistoryTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_stockHistory_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_stockHistory_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public BigDecimal getStockHistoryTotalQty(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getStockHistoryTotalQty(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public List<String> stock_history_barcodeCheck(String barcode) {
		return purchaseMapper.stock_history_barcodeCheck(barcode);
	}

	@Override
	public List<Map<String, Object>> read_stockinfoInclude(String barcode) {
		return purchaseMapper.read_stockinfoInclude(barcode);
	}

	@Override
	public List<Map<String, Object>> read_stockInfoInclude_total(String itemcode) {
		return purchaseMapper.read_stockInfoInclude_total(itemcode);
	}

	@Override
	public List<StockVO> read_stockCountCompare(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_stockCountCompare(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public int getStockCountCompareTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getStockCountCompareTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_stockCountCompare_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_stockCountCompare_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public Map<String, Object> read_stockCountCompare_detail(Map<String, Object> param) {
		System.out.println(param);
		Map<String, Object> resultParam = new HashMap<String, Object>();
		// resultParam.put("stockDB",
		// purchaseMapper.readStockCountCompare_detail_stock(param));
		// resultParam.put("realStockDB",
		// purchaseMapper.readStockCountCompare_detail_realStock(param));
		resultParam.put("stockDB", purchaseMapper.readStockCountCompare_detail_compareDetail(param));
		return resultParam;
	}

	@Override
	public Map<String, Object> getStockCountCompareTotal(Map<String, Object> param) {
		return purchaseMapper.getStockCountCompareTotal(param);
	}

	public Map<String, Object> searchUnpackBarcodes(Map<String, Object> param) {
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("list", purchaseMapper.searchUnpackBarcodes(param));
		return result;
	}

	@Override
	public String getStockCountDate(Map<String, Object> paramMap){
		return purchaseMapper.getStockCountDate(paramMap);
	}

	@Override
	public List<StockVO> read_stockCountMissing(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_stockCountMissing(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_stockCountMissing_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_stockCountMissing_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public Map<String, Object> read_stockCountMissing_detail(Map<String, Object> param) {
		System.out.println(param);
		Map<String, Object> resultParam = new HashMap<String, Object>();
		resultParam.put("stockDB", purchaseMapper.readStockCountMissing_detail_stock(param));
		resultParam.put("realStockDB", purchaseMapper.readStockCountMissing_detail_realStock(param));
		return resultParam;
	}

	@Override
	public Map<String, Object> realStockNotScan(Map<String, Object> param) {
		System.out.println(param);
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			purchaseMapper.deleteRealStockNotScan(param);

			Map<String, Object> map = new HashMap<String, Object>();
			List<String> unique = (List<String>) param.get("barcode");
			List<String> barcodes = new ArrayList<String>();
			List<String> qty = new ArrayList<String>();
			List<String> itemcode = new ArrayList<String>();
			List<RealStockNotScanVO> stockList = new ArrayList<RealStockNotScanVO>();
			for (int i = 0; i < unique.size(); i++) {
				String parts[] = unique.get(i).split("\\|");
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
				int ins = purchaseMapper.insertRealStockNotScan(stockList);
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

	// erp interface - detail
	@Override
	public List<ProductVO> read_erpInterfaceDetail(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_erpInterfaceDetail(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("ERP 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_erpInterfaceDetail_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_erpInterfaceDetail_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("ERP 전체 목록 조회 실패", e);
		}
	}

	@Override
	public int getErpInterfaceDetailTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getErpInterfaceDetailTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("ERP 총 개수 조회 실패", e);
		}
	}

	@Override
	public BigDecimal getErpInterfaceDetailTotalQty(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getErpInterfaceDetailTotalQty(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("ERP 총 개수 조회 실패", e);
		}
	}

	// erp interface - summary
	@Override
	public List<StockVO> read_erpInterfaceSummary(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_erpInterfaceSummary(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("ERP 목록 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_erpInterfaceSummary_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_erpInterfaceSummary_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("ERP 전체 목록 조회 실패", e);
		}
	}

	// 미적재 리스트
	@Override
	public Map<String, Object> readUnloadList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readUnloadList(queryParams);
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
	
	@Override
	public Map<String, Object> search_stockInfo(String barcode) {
		Map<String, Object> map = purchaseMapper.search_stockInfo(barcode);
		System.out.println("search_stockInfo : "+map);
		return map;
	}

	@Override
	public List<Map<String, Object>> show_stockHistory(String barcode) {
		return purchaseMapper.show_stockHistory(barcode);
	}

	@Override
	public Map<String, Object> show_stockHistory_sangho(String custCode) {
		return purchaseMapper.show_stockHistory_sangho(custCode);
	}

	@Override
	public int check_stockMovement(String itemcode) {
		return purchaseMapper.check_stockMovement(itemcode);
	}

	@Override
	public Map<String, Object> read_dashboard_stock(Map<String, Object> param) {
		Map<String, Object> result = new HashMap<String, Object>();

		int totalCount = purchaseMapper.dashboard_stock_totalCount();

		List<Map<String, Object>> totalData = purchaseMapper.dashboard_stock();

		result.put("success", "true");
		result.put("totalCount", totalCount);
		result.put("data", totalData);

		return result;
	}

	@Override
	public Map<String, Object> read_production_dashboard(Map<String, Object> param) {
		System.out.println(param);

		Map<String, Object> result = new HashMap<String, Object>();

		// int totalCount = purchaseMapper.dashboard_production_totalCount();

		Map<String, Object> summary = null;
		List<Map<String, Object>> hourly = null;
		List<Map<String, Object>> line = null;
		List<Map<String, Object>> detail = null;

		String factory = (String) param.get("factory");
		if (factory.equals("SALTILLO")) {
			summary = purchaseMapper.dashboard_production_summary_work(param);
			hourly = purchaseMapper.dashboard_production_hourly_work(param);
			line = purchaseMapper.dashboard_production_line_work(param);
			detail = purchaseMapper.dashboard_production_detail_work(param);
		} else {
			summary = purchaseMapper.dashboard_production_summary(param);
			hourly = purchaseMapper.dashboard_production_hourly(param);
			line = purchaseMapper.dashboard_production_line(param);
			detail = purchaseMapper.dashboard_production_detail(param);
		}

		System.out.println(summary);
		// List<Map<String, Object>> totalData = purchaseMapper.dashboard_production();

		result.put("success", "true");
		result.put("totalCount", summary.get("COUNT_QTY"));
		result.put("summary", summary);
		result.put("hourly", hourly);
		result.put("line", line);
		result.put("detail", detail);

		System.out.println(result);

		return result;
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

				if ("PRODUCT MOVE".equals(kind)) {
					iid = parts[0];
					date = parts[1];
					ifno = parts[2];
					barcode = parts[3];
					meskey = parts[4];
				} else {
					iid = parts[0];
					date = parts[1];
					factory = parts[2];
					storage = parts[3];
					barcode = parts[4];
					if (parts.length > 5) meskey = parts[5];
				}

				String loginid = (String) map.get("loginid");
				boolean admin = Boolean.TRUE.equals(map.get("admin")); // 관리자용 : 관리자용 삭제로 했는지 판단
				String reason = (String) map.get("reason"); // 관리자용 : 사유

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
				param.put("admin", admin);
				param.put("reason", reason);

				// System.out.println("========== DELETE VALIDATION PARAM ==========");
				// System.out.println("kind     = " + kind);
				// System.out.println("iid      = " + iid);
				// System.out.println("date     = " + date);
				// System.out.println("factory  = " + factory);
				// System.out.println("storage  = " + storage);
				// System.out.println("barcode  = " + barcode);
				// System.out.println("ifno     = " + ifno);
				// System.out.println("meskey   = " + meskey);
				// System.out.println("partsLen = " + parts.length);
				// System.out.println("rawValue = " + uniqueValue);
				// System.out.println("============================================");

				// ===== 검증 함수 호출 =====
				String validationResult = validateForDelete(kind, param);
				if (validationResult != null) {
					param.put("failReason", validationResult);
					failList.add(param);
					continue;
				}
				// ===== 검증 끝 =====

				// 검증 통과한 항목 저장
				validItems.add(param);

			} catch (Exception e) {
				Map<String, Object> err = new HashMap<>();
				err.put("value", uniqueValue);
				err.put("reason", e.getMessage());
				failList.add(err);
			}
		}

		// ===== 2단계: 검증 결과 확인 =====
		// 하나라도 실패하면 전체 취소
		System.out.println(failList);
		if (!failList.isEmpty()) {
			result.put("success", false);
			result.put("failList", failList);
			System.out.println("*************************************");
			System.out.println("일부 항목이 검증 실패하여 삭제가 취소되었습니다.");
			System.out.println("*************************************");
			return result;
		}

		// ===== 3단계: 모두 통과했을 때만 삭제 =====
		try {
			for (Map<String, Object> param : validItems) {
		if (Boolean.TRUE.equals(param.get("admin"))) {
					// 관리자용 삭제 서비스
					deleteAdmin(kind, param);
				} else {
					// 일반 유저용 삭제 서비스
					deleteDispatcher(kind, param);
				}
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

	// 상태값
	private static int resolveLastStatus(String lastKind, String kind) {
		if (lastKind == null)
			return 1; // 기본값
		if ("INCOMING".equals(kind) && "PALLET".equals(lastKind))			// 260303 팔레트로 입고된거 삭제하면 LASTSTATUS = 1
			return 1;
		switch (lastKind) {
		case "BARCODE":
			return 1;
		case "FACTORY SENDING":
			return 5;
		case "INCOMING RETURN":
			return 9;
		case "INCOMING":
		case "EXCEPTION INCOMING":
		case "FACTORY RECEIVE":
		case "WIP RETURN":
		case "LOAD RETURN":
		case "PRODUCTION":
		case "PRODUCT MOVE":
			return 10;
		case "LOCATION":
		case "STOCKCOUNT LOCATION":
		case "STOCKCOUNT BARCODE":
			return 20;
		case "UNPACKING":
			return 30;
		case "WIP INPUT":
			return 40;
		case "LOAD":
		case "EXCEPTION LOAD":
			return 50;
		default:
			return 10;
		}
	}

	// 검증 함수 - 종류 별 다른 매퍼 호출
	private String validateForDelete(String kind, Map<String, Object> param) {
		boolean loginid = (boolean) param.get("admin");

		// INCOMING / LOAD 검증은 관리자 여부와 무관하게 항상 실행
		if ("INCOMING".equals(kind)) {
			String condate = ((String) param.get("date")).replaceAll("-", "");
			param.put("condate", condate);

			int closeCnt = purchaseMapper.selectIncomingCloseCnt(param);
			if (closeCnt > 0) return "INCOMING_CLOSE";

			int lockCnt = purchaseMapper.selectLockCnt(param);
			if (lockCnt > 0) return "LOCK";

			int buyCnt = purchaseMapper.selectIncomingBuyCnt(param);
			if (buyCnt > 0) return "BUY";

			int laterCnt = purchaseMapper.selectIncomingLaterCnt(param);
			if (laterCnt > 0) return "LATER";

			int targetCnt = purchaseMapper.selectIncomingDeleteTargetCnt(param);
			if (targetCnt == 0) return "NO_TARGET";
		} else if ("LOAD".equals(kind)) {
			String condate = ((String) param.get("date")).replaceAll("-", "");
			param.put("condate", condate);

			int closeCnt = purchaseMapper.selectLoadCloseCnt(param);
			if (closeCnt > 0) return "LOAD_CLOSE";

			int lockCnt = purchaseMapper.selectLockCnt(param);
			if (lockCnt > 0) return "LOCK";

			int laterCnt = purchaseMapper.selectLoadLaterCnt(param);
			if (laterCnt > 0) return "LATER";

			int targetCnt = purchaseMapper.selectLoadDeleteTargetCnt(param);
			if (targetCnt == 0) return "NO_TARGET";
		} else if ("LOAD RETURN".equals(kind)) {
			String condate = ((String) param.get("date")).replaceAll("-", "");
			param.put("condate", condate);

			int closeCnt = purchaseMapper.selectLoadCloseCnt(param);
			if (closeCnt > 0) return "LOAD_CLOSE";

			int lockCnt = purchaseMapper.selectLockCnt(param);
			if (lockCnt > 0) return "LOCK";

			int laterCnt = purchaseMapper.selectLoadReturnLaterCnt(param);
			if (laterCnt > 0) return "LATER";

			int targetCnt = purchaseMapper.selectLoadReturnDeleteTargetCnt(param);
			if (targetCnt == 0) return "NO_TARGET";
		} else if ("INCOMING RETURN".equals(kind)) {
			String condate = ((String) param.get("date")).replaceAll("-", "");
			param.put("condate", condate);

			int closeCnt = purchaseMapper.selectIncomingCloseCnt(param);
			if (closeCnt > 0) return "INCOMING_CLOSE";

			int lockCnt = purchaseMapper.selectLockCnt(param);
			if (lockCnt > 0) return "LOCK";

			int laterCnt = purchaseMapper.selectIncomingReturnLaterCnt(param);
			if (laterCnt > 0) return "LATER";

			int targetCnt = purchaseMapper.selectIncomingReturnDeleteTargetCnt(param);
			if (targetCnt == 0) return "NO_TARGET";
		}

		// 관리자면 후처리 및 마감 검증 X
		if (loginid) {
			isAdmin = true;
			return null;
		}

		// 공통 1차 검증 : 후처리 존재 여부
		int postProcessing = purchaseMapper.checkHistory(param);

		// 종류별 추가 검증 (실패 시 즉시 리턴)
		switch (kind) {
		case "EXCEPTION LOAD": {
			int outbound = 0;
			outbound = purchaseMapper.checkOutboundAndLocation(param);
			if (outbound == 0)
				return "LOAD AND LOCATION";
			break;
		}
		case "WIP INPUT": {
			int workmove = 0;
			workmove = purchaseMapper.checkWorkmoveAndLocation(param);
			if (workmove == 0)
				return "WORKMOVE AND LOCATION";
			break;
		}
		// case "INCOMING RETURN": {
		// 	int inbound = 0;
		// 	inbound = purchaseMapper.checkInboundAndLocation(param);
		// 	if (inbound == 0)
		// 		return "INBOUND AND LOCATION";
		// 	break;
		// }
		case "LOAD RETURN": {
			int load = 0;
			load = purchaseMapper.checkOutboundAndLocation(param);
			if (load == 0)
				return "LOAD AND LOCATION";
			break;
		}
		case "FACTORY SENDING": {
			int sending = 0;
			sending = purchaseMapper.checkSendingAndReceiving(param);
			if (sending != 0)
				return "RECEIVING";
			break;
		}
		case "STORAGE": {
			int storage = 0;
			storage = purchaseMapper.checkStorageMovement(param);
			if (storage == 0)
				return "STORAGEMOVE";
			break;
		}
		// 나머지 종류들은 추가 검증 없음
		case "EXCEPTION INCOMING":
		case "WIP RETURN":
		case "INCOMING":
		case "LOAD":
			break;
		}
		System.out.println("후처리 검증 완료");

		// 데이터 건수가 0 이상이면 삭제 불가
		if (postProcessing > 0) {
			return "POST_PROCESSING";
		}
		String orginalDate = (String) param.get("date");
		String date = ((String) param.get("date")).replaceAll("-", "");
		if (date.length() == 8) {
			date = date.substring(0, 6);
		} else if (date.length() == 6) {
			date = "20" + date;
		}
		param.put("date", date);

		// 2차 검증: 마감
		int magam = purchaseMapper.checkMagamInput(param);

		if (magam > 0) {
			return "MAGAM";
		}
		param.put("date", orginalDate); // 원래 날짜로 복원
		return null; // 모든 검증 통과
	}

	// 종류별 삭제 매퍼 실행
	private void deleteDispatcher(String kind, Map<String, Object> param) {
		String barcode = (String) param.get("barcode");
		String lastKind = purchaseMapper.getKind(param);
		System.out.println("마지막 종류 : " + lastKind);

		// laststatus 추가
		int lastStatus = resolveLastStatus(lastKind, kind);
		param.put("laststatus", lastStatus);
		System.out.println("마지막 상태값: " + param.get("laststatus"));

		switch (kind) {
		case "EXCEPTION INCOMING":
			// ===== 예외 입고 =====
			updateStockForInput(param, barcode);
			break;
		case "EXCEPTION LOAD":
			// ===== 예외 출고 =====
			updateStockForOutput(param, barcode);
			break;
		case "WIP INPUT":
			// ===== 공정 불출 =====
			updateStockForWip(param, barcode);
			break;
		case "WIP RETURN":
			// ===== 공정 불출 반납 =====
			updateStockForWipReturn(param, barcode);
			break;
		case "INCOMING":
			// ===== 입고 =====
			updateStockForIncoming(param, barcode);
			break;
		case "INCOMING RETURN":
			// ===== 입고 반품 =====
			updateStockForIncomingReturn(param, barcode);
			break;
		case "LOAD":
			// ===== 출고 =====
			updateStockForLoad(param, barcode);
			break;
		case "LOAD RETURN":
			// ===== 출고 반납 =====
			updateStockForLoadReturn(param, barcode);
			break;
		case "FACTORY SENDING":
			// ===== 공장 출고 =====
			updateStockForSending(param, barcode);
			break;
		case "STOCK MOVE":
			// 창고 이동 삭제
			updateStockForStorage(param, barcode);
			break;
		case "FACTORY RECEIVE":
			// 공장 입고 삭제
			updateStockForReceiving(param, barcode);
			break;
		case "PRODUCT MOVE":
			// ===== 공장 출고 =====
			updateStockForProductMove(param, barcode);
			break;
		default:
			throw new IllegalArgumentException("Unsupported kind: " + kind);
		}
	}

	private void deleteAdmin(String kind, Map<String, Object> param) {
		String barcode = (String) param.get("barcode");

		switch (kind) {
		case "EXCEPTION INCOMING":
			// ===== 예외 입고 =====
			assertAffected(purchaseMapper.updateExceptionInput(param), "예외입고-삭제", barcode);
			break;
		case "EXCEPTION LOAD":
			// ===== 예외 출고 =====
			assertAffected(purchaseMapper.updateExceptionOutput(param), "예외출고-삭제", barcode);
			break;
		case "WIP INPUT":
			// ===== 공정 불출 =====
			assertAffected(purchaseMapper.updateWip(param), "공정불출-삭제", barcode);
			break;
		case "WIP RETURN":
			// ===== 공정 불출 반납 =====
			assertAffected(purchaseMapper.updateWipReturn(param), "공정불출반납-삭제", barcode);
			break;
		case "INCOMING":
			// ===== 입고 =====
			assertAffected(purchaseMapper.updateIncoming(param), "입고-삭제", barcode);
			break;
		case "INCOMING RETURN":
			// ===== 입고 반품 =====
			assertAffected(purchaseMapper.updateIncomingReturn(param), "입고반품-삭제", barcode);
			break;
		case "LOAD":
			// ===== 출고 =====
			assertAffected(purchaseMapper.updateLoad(param), "출고-삭제", barcode);
			break;
		case "LOAD RETURN":
			// ===== 출고 반납 =====
			assertAffected(purchaseMapper.updateLoadReturn(param), "출고반납-삭제", barcode);
			break;
		case "FACTORY SENDING":
			// ===== 공장 출고 =====
			assertAffected(purchaseMapper.updateSending(param), "공장이동출고-삭제", barcode);
			break;
		case "STOCK MOVE":
			// ===== 창고 이동 =====
			assertAffected(purchaseMapper.updateStorage(param), "창고이동-삭제", barcode);
			break;
		case "FACTORY RECEIVE":
			// ===== 공장 입고 =====
			assertAffected(purchaseMapper.updateReceiving(param), "공장이동입고-삭제", barcode);
			break;
		case "PRODUCT MOVE":
			// ===== 공장 입고 =====
			assertAffected(purchaseMapper.updateProductMove(param), "생산품이동-삭제", barcode);
			// ===== 인터페이스 삭제 =====
			purchaseMapper.insertProductMoveIntfDelete(param);
			break;
		default:
			throw new IllegalArgumentException("Unsupported kind: " + kind);
		}
	}

	boolean isAdmin = false; // 관리자 아이디 인지

	// 예외 입고
	private void updateStockForInput(Map<String, Object> param, String barcode) {
		// 예외 입고 삭제 (로케이션)
		assertAffected(purchaseMapper.updateExceptionInputInLocation(param), "예외입고-로케이션", barcode);
		System.out.println("로케이션 삭제 완료");

		// 예외 입고 삭제 (인바운드)
		assertAffected(purchaseMapper.updateExceptionInput(param), "예외입고-삭제", barcode);
		System.out.println("인바운드 삭제 완료");

		if (barcode.split(",").length == 5 || barcode.contains("_")) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			// assertAffected(purchaseMapper.updateExceptionInputInStock(param), "예외입고-재고",
			// barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);
					// assertAffected(purchaseMapper.updateExceptionInputInStock(param), "예외입고-재고",
					// child);
				}
			}
		}
	}

	// 예외 출고
	private void updateStockForOutput(Map<String, Object> param, String barcode) {
		// 메모 추가
		param.put("memo_d", "OUTPUT");
		// 적재된 팔레트 바코드 살리기
		purchaseMapper.updateLocationBarcodeByY(param);

		// 예외 출고 삭제 (아웃바운드)
		assertAffected(purchaseMapper.updateExceptionOutput(param), "예외출고-삭제", barcode);
		System.out.println("아웃바운드 삭제 완료");

		if (barcode.split(",").length == 5 || barcode.contains("_")) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			assertAffected(purchaseMapper.updateExceptionOutputInStock(param), "예외출고-재고", barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);
					assertAffected(purchaseMapper.updateExceptionOutputInStock(param), "예외출고-재고", child);
				}
			}
		}
	}

	// 공정 불출
	private void updateStockForWip(Map<String, Object> param, String barcode) {
		// 메모 추가
		param.put("memo_d", "공정불출");
		// 적재된 팔레트 바코드 살리기
		purchaseMapper.updateLocationBarcodeByY(param);

		// 공정 불출 삭제
		assertAffected(purchaseMapper.updateWip(param), "공정불출-삭제", barcode);
		System.out.println("워크무브 삭제 완료");

		if (barcode.split(",").length == 5) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			assertAffected(purchaseMapper.updateWipInStock(param), "공정불출-재고", barcode);
			assertAffected(purchaseMapper.updateWipInWorkStock(param), "공정불출-작업장재고", barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);
					assertAffected(purchaseMapper.updateWipInStock(param), "공정불출-재고", child);
				}
			}
		}
	}

	// 공정 불출 반납
	private void updateStockForWipReturn(Map<String, Object> param, String barcode) {
		// 공정 불출 삭제 (로케이션)
		assertAffected(purchaseMapper.updateWipReturnInLocation(param), "공정불출반납-로케이션", barcode);
		System.out.println("로케이션 삭제 완료");

		// 공정 불출 반납 삭제
		assertAffected(purchaseMapper.updateWipReturn(param), "공정불출반납-삭제", barcode);
		System.out.println("워크무브 삭제 완료");

		if (barcode.split(",").length == 5) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			assertAffected(purchaseMapper.updateWipReturnInStock(param), "공정불출반납-재고", barcode);
			assertAffected(purchaseMapper.updateWipReturnInWorkStock(param), "공정불출반납-작업장재고", barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);
					assertAffected(purchaseMapper.updateWipInStock(param), "공정불출반납-재고", child);
				}
			}
		}
	}

	// 입고
	private void updateStockForIncoming(Map<String, Object> param, String barcode) {
		// 입고 삭제 (로케이션)
		assertAffected(purchaseMapper.updateIncomingInLocation(param), "입고-로케이션", barcode);

		// 입고 삭제
		assertAffected(purchaseMapper.updateIncoming(param), "입고-삭제", barcode);
		System.out.println("인바운드 삭제 완료");

		if (barcode.split(",").length == 5 || barcode.contains("_")) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			assertAffected(purchaseMapper.updateIncomingInStock(param), "입고-재고", barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);
					assertAffected(purchaseMapper.updateIncomingInStock(param), "입고-재고", child);
				}
			}
		}
	}

	// 입고 반품
	private void updateStockForIncomingReturn(Map<String, Object> param, String barcode) {
		// 인바운드 N인것중에 최신을 Y로 업데이트
		purchaseMapper.updateInboundByY(param);

		// 메모 추가
		param.put("memo_d", "INCOMING RETURN");
		// Location에서 Y로 업데이트
		purchaseMapper.updateLocationBarcodeByY(param);

		// 입고 반품 삭제
		assertAffected(purchaseMapper.updateIncomingReturn(param), "입고반품-삭제", barcode);
		System.out.println("인바운드 삭제 완료");

		if (barcode.split(",").length == 5 || barcode.contains("_")) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			assertAffected(purchaseMapper.updateIncomingReturnInStock(param), "입고반품-재고", barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);
					assertAffected(purchaseMapper.updateIncomingReturnInStock(param), "입고반품-재고", child);
				}
			}
		}
	}

	// 출고
	private void updateStockForLoad(Map<String, Object> param, String barcode) {
		// 메모 추가
		param.put("memo_d", "OUTPUT");
		// 바코드 살리기
		purchaseMapper.updateLocationBarcodeByY(param);

		// 출고 삭제
		assertAffected(purchaseMapper.updateLoad(param), "출고-삭제", barcode);
		System.out.println("아웃바운드 삭제 완료");

		if (barcode.split(",").length == 5 || barcode.contains("_")) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			assertAffected(purchaseMapper.updateLoadInStock(param), "출고-재고", barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);
					assertAffected(purchaseMapper.updateLoadInStock(param), "출고-재고", child);
				}
			}
		}
	}

	// 출고 반납
	private void updateStockForLoadReturn(Map<String, Object> param, String barcode) {
		// 출고반납 삭제 (로케이션)
		assertAffected(purchaseMapper.updateLoadReturnInLocation(param), "출고반납-로케이션", barcode);

		// 출고 반납 삭제
		assertAffected(purchaseMapper.updateLoadReturn(param), "출고반납-삭제", barcode);
		System.out.println("아웃바운드 삭제 완료");

		if (barcode.split(",").length == 5 || barcode.contains("_")) {
			purchaseMapper.updateLaststatusPart(param);
			System.out.println("파트 라벨");

			assertAffected(purchaseMapper.updateLoadReturnInStock(param), "출고반납-재고", barcode);
		} else {
			purchaseMapper.updateLaststatusPallet(param);
			System.out.println("파레트 라벨");

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);
					assertAffected(purchaseMapper.updateLoadReturnInStock(param), "출고반납-재고", child);
				}
			}
		}
	}

	// 공장 출고
	private void updateStockForSending(Map<String, Object> param, String barcode) {
		// 공장 Sending 삭제
		assertAffected(purchaseMapper.updateSending(param), "공장이동출고-삭제", barcode);
		System.out.println("공장 출고 삭제 완료");

		// Location 살리기용 메모 추가
		param.put("memo_d", "MOVE FACTORY");

		if (barcode.split(",").length == 5) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			// 공장 Sending 삭제 (로케이션)
			assertAffected(purchaseMapper.updateSendingInLocation(param), "공장이동출고-로케이션", barcode);

			// 바코드 살리기
			purchaseMapper.updateLocationBarcodeByY(param);

			assertAffected(purchaseMapper.updateSendingInStock(param), "공장이동출고-재고", barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);

					// 공장 Sending 삭제 (로케이션)
					assertAffected(purchaseMapper.updateSendingInLocation(param), "공장이동출고-로케이션", barcode);

					// 바코드 살리기
					purchaseMapper.updateLocationBarcodeByY(param);

					assertAffected(purchaseMapper.updateSendingInStock(param), "공장이동출고-재고", child);
				}
			}
		}
	}

	// 공장 입고
	private void updateStockForReceiving(Map<String, Object> param, String barcode) {
		// 공장 Receiving 삭제
		assertAffected(purchaseMapper.updateReceiving(param), "공장이동입고-삭제", barcode);
		System.out.println("공장 출고 삭제 완료");

		// Location 살리기용 메모 추가
		param.put("memo_d", "FACTORY MOVE");

		if (barcode.split(",").length == 5) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			// 공장 Receiving 삭제 (로케이션)
			assertAffected(purchaseMapper.updateReceivingInLocation(param), "공장이동입고-로케이션", barcode);

			// 바코드 살리기
			purchaseMapper.updateLocationBarcodeByY(param);

			assertAffected(purchaseMapper.updateReceivingInStock(param), "공장이동입고-재고", barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);

					// 공장 Receiving 삭제 (로케이션)
					assertAffected(purchaseMapper.updateReceivingInLocation(param), "공장이동출고-로케이션", barcode);

					// 바코드 살리기
					purchaseMapper.updateLocationBarcodeByY(param);

					assertAffected(purchaseMapper.updateReceivingInStock(param), "공장이동출고-재고", child);
				}
			}
		}
	}

	// 창고 이동
	private void updateStockForStorage(Map<String, Object> param, String barcode) {
		// 공장 Sending 삭제
		assertAffected(purchaseMapper.updateStorage(param), "창고이동-삭제", barcode);
		System.out.println("창고 이동 삭제 완료");

		// Location 살리기용 메모 추가
		param.put("memo_d", "MOVE WAREHOUSE");

		if (barcode.split(",").length == 5 || barcode.contains("_")) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			// 공장 Sending 삭제 (로케이션)
			assertAffected(purchaseMapper.updateStorageInLocation(param), "창고이동-로케이션", barcode);

			// 바코드 살리기
			purchaseMapper.updateLocationBarcodeByY(param);

			assertAffected(purchaseMapper.updateStorageInStock(param), "창고이동-재고", barcode);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);

					// 공장 Sending 삭제 (로케이션)
					assertAffected(purchaseMapper.updateStorageInLocation(param), "창고이동-로케이션", barcode);

					// 바코드 살리기
					purchaseMapper.updateLocationBarcodeByY(param);

					assertAffected(purchaseMapper.updateStorageInStock(param), "창고이동-재고", child);
				}
			}
		}
	}

	// 생산품 이동
	private void updateStockForProductMove(Map<String, Object> param, String barcode) {
		System.out.println(param);
		// 생산품 이동 삭제
		assertAffected(purchaseMapper.updateProductMove(param), "생산품이동-삭제", barcode);
		System.out.println("생산품이동 이동 삭제 완료");

		// Location 살리기용 메모 추가
		param.put("memo_d", "PRODUCTMOVE");

		if (barcode.split(",").length == 5) {
			System.out.println("파트 라벨");
			purchaseMapper.updateLaststatusPart(param);

			// 바코드 살리기
			purchaseMapper.updateWorkLocationBarcodeByY(param);

			purchaseMapper.updateProductMoveInStock(param);
		} else {
			System.out.println("파레트 라벨");
			purchaseMapper.updateLaststatusPallet(param);

			List<String> children = purchaseMapper.selectpbBarcode(barcode);
			if (children != null) {
				for (String child : children) {
					param.put("barcode", child);
					param.put("qty", child.split(",")[3]);
					purchaseMapper.updateLaststatusPart(param);

					// 바코드 살리기
					purchaseMapper.updateWorkLocationBarcodeByY(param);

					purchaseMapper.updateProductMoveInStock(param);
				}
			}
		}

		// 인터페이스 삭제
		purchaseMapper.insertProductMoveIntfDelete(param);
	}

	// Helper : 영향행 검증
	private static void assertAffected(int affected, String operation, String barcode) {
		if (affected == 0) {
			throw new RuntimeException("DELETE_FAILED|" + operation + "|" + barcode);
		}
	}

	// 반품 검사 삭제
	@Override
	public Map<String, Object> updateRtInsp(Map<String, Object> req){
		Map<String, Object> result = new HashMap<>();

		List<String> list = (List<String>) req.get("iidList");
		String loginid = (String) req.get("loginid");

		// 리스트에서 iid 값만 추출
		List<String> iids = list.stream().map(s -> s.split("\\|", -1)[0]).collect(Collectors.toList());

		int count = purchaseMapper.updateRtInsp(iids, loginid);

		result.put("success", true);
		result.put("deleteCount", count);
		return result;
	}

	// 창고 검사 삭제
	@Override
	public Map<String, Object> updateWhInsp(Map<String, Object> req){
		Map<String, Object> result = new HashMap<>();

		List<String> list = (List<String>) req.get("iidList");
		String loginid = (String) req.get("loginid");

		// 리스트에서 iid 값만 추출
		List<String> iids = list.stream().map(s -> s.split("\\|", -1)[0]).collect(Collectors.toList());

		int count = purchaseMapper.updateWhInsp(iids, loginid);

		result.put("success", true);
		result.put("deleteCount", count);
		return result;
	}

	// 양불 전환 삭제
	@Override
	public Map<String, Object> updateConditionChange(Map<String, Object> req){
		Map<String, Object> result = new HashMap<>();

		List<String> list = (List<String>) req.get("iidList");
		String loginid = (String) req.get("loginid");

		// 리스트에서 iid 값만 추출
		List<String> iids = list.stream().map(s -> s.split("\\|", -1)[0]).collect(Collectors.toList());

		int count = purchaseMapper.updateConditionChange(iids, loginid);

		result.put("success", true);
		result.put("deleteCount", count);
		return result;
	}

	@Override
	public Map<String, Object> readUnreceivedItem(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readUnreceivedItem(queryParams);

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
	public Map<String, Object> readUnreceivedItemCodes(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readUnreceivedItemCodes(queryParams);

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
	public Map<String, Object> readFactoryUnreceived(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readFactoryUnreceived(queryParams);

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
	public Map<String, Object> readFactoryUnreceivedSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readFactoryUnreceivedSummary(queryParams);

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
	public Map<String, Object> readWorkMoveComplete(Map<String, Object> params) {
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

		System.out.println("PARAM");
		System.out.println(queryParams);

		try {
			// 쿼리 실행
			List<Map<String, Object>> records = purchaseMapper.readWorkMoveComplete(queryParams);

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
	public Map<String, Object> readWorkMoveUnreceived(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readWorkMoveUnreceived(queryParams);

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
	public Map<String, Object> readFactoryComplete(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readFactoryComplete(queryParams);

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
	public Map<String, Object> readFactoryCompleteSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readFactoryCompleteSummary(queryParams);

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
			List<Map<String, Object>> records = purchaseMapper.readIncomingDetail(queryParams);
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
			List<Map<String, Object>> records = purchaseMapper.readIncomingSummary(queryParams);
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

	// 입고처리 - 입고반품
	@Override
	public Map<String, Object> readIncomingReturnDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readIncomingReturnDetail(queryParams);
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
	
	// 입고처리 - 입고반품
	@Override
	public Map<String, Object> readIncomingReturnSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readIncomingReturnSummary(queryParams);
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
	
	// 공정불출 - 독립불출내역
	@Override
	public Map<String, Object> readWipDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readWipDetail(queryParams);
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

	// 공정불출 - 독립불출내역
	@Override
	public Map<String, Object> readWipSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readWipSummary(queryParams);
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

	// 공정불출 - 독립불출내역
	@Override
	public Map<String, Object> readUnpackSummary(Map<String, Object> params) {
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
			System.err.println("CHECK ______________");
			System.err.println(queryParams);
			List<Map<String, Object>> records = purchaseMapper.readUnpackSummary(queryParams);
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

	// 공정불출 - 공정불출반납
	@Override
	public Map<String, Object> readWipReturnDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readWipReturnDetail(queryParams);
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
	
	// 공정불출 - 공정불출반납
	@Override
	public Map<String, Object> readWipReturnSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readWipReturnSummary(queryParams);
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
			List<Map<String, Object>> records = purchaseMapper.readLoadDetail(queryParams);
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
			List<Map<String, Object>> records = purchaseMapper.readLoadSummary(queryParams);
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
	public Map<String, Object> readLoadReturnDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readLoadReturnDetail(queryParams);
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
	public Map<String, Object> readLoadReturnSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readLoadReturnSummary(queryParams);
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
	public Map<String, Object> readStorageDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readStorageDetail(queryParams);
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
	public Map<String, Object> readStorageSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readStorageSummary(queryParams);
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

	// 재고이송관리 - 창고이동출고
	@Override
	public Map<String, Object> readStorageSendingDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readStorageSendingDetail(queryParams);
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

	// 재고이송관리 - 창고이동입고
	@Override
	public Map<String, Object> readStorageReceivingDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readStorageReceivingDetail(queryParams);
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

	@Override
	public Map<String, Object> readStorageUnreceived(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readStorageUnreceived(queryParams);

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
	public Map<String, Object> readStorageComplete(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readStorageComplete(queryParams);

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

	// 이송 후 재고확인
	@Override
	public List<StockMoveVO> read_storageTransferCheck(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_storageTransferCheck(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("이송 후 재고확인 목록 조회 실패", e);
		}
	}

	@Override
	public int getStorageTransferCheckTotalCount(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.getStorageTransferCheckTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("이송 후 재고확인 총 개수 조회 실패", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_storageTransferCheck_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_storageTransferCheck_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("이송 후 재고확인 전체 목록 조회 실패", e);
		}
	}
	
	// 재고이송관리 - 공장이동출고
	@Override
	public Map<String, Object> readFactorySendingDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readFactorySendingDetail(queryParams);
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
	
	// 재고이송관리 - 공장이동입고
	@Override
	public Map<String, Object> readFactoryReceivingDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readFactoryReceivingDetail(queryParams);
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
	public Map<String, Object> readExceptionInputDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readExceptionInputDetail(queryParams);
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
	public Map<String, Object> readExceptionInputSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readExceptionInputSummary(queryParams);
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
	public Map<String, Object> readExceptionOutputDetail(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readExceptionOutputDetail(queryParams);
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
	public Map<String, Object> readExceptionOutputSummary(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readExceptionOutputSummary(queryParams);
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
	
	// 공정불출 - 독립불출내역
	@Override
	public Map<String, Object> readPurchaseStockCountWIPList(Map<String, Object> params) {
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
			System.err.println("CHECK ______________");
			System.err.println(queryParams);
			List<Map<String, Object>> records = purchaseMapper.readPurchaseStockCountWIPList(queryParams);
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

	// 재공 재고 실사 저장
	@Override
	public int insertStockCountWIPList_purchase(List<Map<String, Object>> list, String factory, String workshop,
			String loginid, String date) {

		// T_ST_CHANGESUB 데이터 존재 여부 확인 (있으면 저장 불가)
		String roomcode = "PRODUCT".equalsIgnoreCase(workshop) ? "F001" : workshop;
		Map<String, Object> checkParam = new HashMap<>();
		checkParam.put("sdate", date);
		checkParam.put("roomcode", roomcode);
		if (purchaseMapper.checkStChangesub(checkParam) > 0) {
			return -1;
		}

		int insertResult = 0;
		Map<String, Object> dParam = new HashMap<String, Object>();

		dParam.put("date", date);
		dParam.put("factory", factory);
		dParam.put("storage", workshop);

		System.out.println(dParam);
		purchaseMapper.deleteStockCountWIPList(dParam); // 기존 데이터 삭제

		for (Map<String, Object> row : list) {
			// System.out.println(row);
			// System.out.println(date);
			String itemcode = (String) row.get("itemcode");
			String itemname = (String) row.get("itemname");
			Object b = row.get("bqty");
			Object o = row.get("qty");

			BigDecimal qty = (o == null) ? BigDecimal.ZERO
					: new BigDecimal(o.toString()).setScale(2, RoundingMode.HALF_UP);
			// BigDecimal qty = row.get("qty") == null ? BigDecimal.ZERO :
			// BigDecimal.valueOf(((Number) row.get("qty")).longValue());
			BigDecimal bqty = (b == null) ? BigDecimal.ZERO
					: new BigDecimal(b.toString()).setScale(2, RoundingMode.HALF_UP);
			// BigDecimal qty = row.get("qty") == null ? BigDecimal.ZERO :
			// BigDecimal.valueOf(((Number) row.get("qty")).longValue());
			Map<String, Object> param = new HashMap<>();
			param.put("itemcode", itemcode);
			param.put("itemname", itemname);
			param.put("qty", qty.stripTrailingZeros().toPlainString());
			param.put("bqty", bqty.stripTrailingZeros().toPlainString());
			param.put("factory", factory);
			param.put("workshop", workshop);
			param.put("loginid", loginid);
			param.put("date", date);

			// System.out.println(param);

//			if (purchaseMapper.searchStockCountWIPList(param) > 0) {
//				continue;
//			}
			// purchaseMapper.updateStockCountWIPList(param); // 기존 데이터 N으로 업데이트

			insertResult += purchaseMapper.insertStockCountWIPList(param); // 새 데이터 Insert
		}
		return insertResult;
	}

	@Override
	public Map<String, Object> read_stockTotal(Map<String, Object> params) {
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? (Integer) params.get("page") : null;
		Integer itemsPerPage = params.get("itemsPerPage") != null ? (Integer) params.get("itemsPerPage") : 100;

		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);

		System.out.println(queryParams);

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
			List<Map<String, Object>> records = purchaseMapper.read_stockTotal(queryParams);

			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
//				Map<String, Object> firstRecord = records.get(0);
//				Double totalCount = firstRecord.get("TOTALCOUNT") != null
//						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
//						: 0;
//				Double totalQty = firstRecord.get("TOTALQTY") != null ? ((Number) firstRecord.get("TOTALQTY")).doubleValue()
//						: 0;
//				result.put("totalCount", totalCount);

				double totalQty = 0.0;

				// 리스트에서 수량 추출 시작
				for (Map<String, Object> record : records) {
					// 아이템 코드가 TOTAL일 경우 각 컼럼의 수량을 합산한 후 브레이크를 해 뒤에 나오는 수량을 더 더하지 않음
					// 즉, 계산된 결과를 더해 총 수량을 추출
					if ("TOTAL".equals(record.get("ITEMCODE"))) {
						totalQty = getDouble(record, "INBOUND") + getDouble(record, "PRODUCT") + getDouble(record, "OUTSIDE");
						break;

						// 품번 또는 품명으로 검색했을 때는 TOTAL이 리스트에 없으므로 각각의 수량을 계속 더해서 총 수량을 추출
					} else {
						totalQty += getDouble(record, "INBOUND") + getDouble(record, "PRODUCT") + getDouble(record, "OUTSIDE");
					}
				}

				// 소수점 둘째 자리까지 표시
				totalQty = Math.round(totalQty * 100.0) / 100.0;

				result.put("totalQty", totalQty);

//				// 페이징 정보 계산
//				if (page != null && page > 0) {
//					int totalPages = (int) Math.ceil((double) totalCount / itemsPerPage);
//					result.put("totalPages", totalPages);
//				}
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

	// 유틸 함수
	private double getDouble(Map<String, Object> map, String key) {
		Object v = map.get(key);
		return v == null ? 0.0 : ((Number) v).doubleValue();
	}

	@Override
	public Map<String, Object> readStockStation(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readStockStation(queryParams);

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
	public Map<String, Object> read_purchaseStockDetail(Map<String, Object> params) {

		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// page가 null이면 전체 조회 (엑셀용)
		Integer page = params.get("page") != null ? Integer.parseInt(String.valueOf(params.get("page"))) : null;
		Integer itemsPerPage = params.get("itemsPerPage") != null
				? Integer.parseInt(String.valueOf(params.get("itemsPerPage")))
				: 100;

		// ✅ 정렬 파라미터 (둘 다 지원: sortKey/sortDir or sortColumn/sortOrder)
		String sortKey = params.get("sortKey") != null ? String.valueOf(params.get("sortKey"))
				: (params.get("sortColumn") != null ? String.valueOf(params.get("sortColumn")) : "YMDHMS");

		String sortDir = params.get("sortDir") != null ? String.valueOf(params.get("sortDir"))
				: (params.get("sortOrder") != null ? String.valueOf(params.get("sortOrder")) : "DESC");

		sortKey = sortKey == null ? "YMDHMS" : sortKey.trim().toUpperCase();
		sortDir = sortDir == null ? "DESC" : sortDir.trim().toUpperCase();
		if (!"ASC".equals(sortDir) && !"DESC".equals(sortDir))
			sortDir = "DESC";

		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);

		// ✅ 정렬값을 MyBatis로 내려보냄 (이게 핵심)
		queryParams.put("sortKey", sortKey);
		queryParams.put("sortDir", sortDir);

		// ✅ 페이징 파라미터가 있을 때만 설정
		if (page != null && page > 0) {
			int offset = (page - 1) * itemsPerPage;

			// 현재 mapper/쿼리에서 limit을 쓰고 있으니 유지
			queryParams.put("offset", offset);
			queryParams.put("limit", itemsPerPage);

			// ✅ 혹시 쿼리에서 itemsPerPage로 쓰는 경우 대비(혼용 방지)
			queryParams.put("itemsPerPage", itemsPerPage);
		}

		Map<String, Object> result = new HashMap<>();

		try {
			System.out.println("QP__");
			System.out.println(queryParams);

			List<Map<String, Object>> records = purchaseMapper.read_purchaseStockDetail(queryParams);
			result.put("records", records);

			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);

				long totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).longValue()
						: 0L;

				long totalQty = firstRecord.get("TOTALQTY") != null ? ((Number) firstRecord.get("TOTALQTY")).longValue()
						: 0L;

				result.put("totalCount", totalCount);
				result.put("totalQty", totalQty);

				if (page != null && page > 0) {
					long totalPages = (itemsPerPage <= 0) ? 0
							: (long) Math.ceil((double) totalCount / (double) itemsPerPage);
					result.put("totalPages", totalPages);
				}
			} else {
				result.put("totalCount", 0L);
				result.put("totalQty", 0L);
				if (page != null && page > 0) {
					result.put("totalPages", 0L);
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
			result.put("records", new ArrayList<>());
			result.put("totalCount", 0L);
			result.put("totalQty", 0L);
			if (page != null && page > 0) {
				result.put("totalPages", 0L);
			}
		}

		return result;
	}

	@Override
	public Map<String, Object> read_purchaseStorageStockList(Map<String, Object> params) {
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
		queryParams.put("sdate", sdate);
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
			records = purchaseMapper.read_purchaseStorageStockList(queryParams);

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
	public Map<String, Object> readExceptionInputDetailStockCount(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readExceptionInputDetailStockCount(queryParams);
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
	public Map<String, Object> readExceptionOutputDetailStockCount(Map<String, Object> params) {
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
			List<Map<String, Object>> records = purchaseMapper.readExceptionOutputDetailStockCount(queryParams);
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

	@Override
	public List<StockVO> read_stockCountAdjust(Map<String, Object> paramMap) {
		try {
			return purchaseMapper.read_stockCountAdjust(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public List<Map<String, Object>> read_stockCountAdjust_all(Map<String, Object> searchParam) {
		try {
			return purchaseMapper.read_stockCountAdjust_all(searchParam);
		} catch (Exception e) {
			throw new RuntimeException("Fail", e);
		}
	}

	@Override
	public Map<String, Object> read_stockCountAdjust_detail(Map<String, Object> param) {
		System.out.println(param);
		Map<String, Object> resultParam = new HashMap<String, Object>();
		resultParam.put("stockDB", purchaseMapper.readStockCountAdjust_detail_stock(param));
		resultParam.put("realStockDB", purchaseMapper.readStockCountAdjust_detail_realStock(param));
		return resultParam;
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
			List<Map<String, Object>> records = purchaseMapper.readValidationDetail(queryParams);
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
	public int deleteStockCountWIPList(Map<String, Object> param) {
		String date = (String) param.get("date");
		Map<String, Object> lockParam = new HashMap<>();
		lockParam.put("condate", date.replace("-", ""));
		if (purchaseMapper.selectLockCnt(lockParam) > 0) {
			return 12;
		}
		return purchaseMapper.deleteStockCountWIPList(param);
	}

	@Override
	public int moveProduct(Map<String, Object> data){
		@SuppressWarnings("unchecked")
		List<String> list = (List<String>) data.get("list");

		Map<String, Object> insertParam = new HashMap<String, Object>();

		String nowDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        for (String s : list) {
            String uniqueValue = (String) s;

            String[] uniqueParts = uniqueValue.split("\\|");
            System.out.println(uniqueParts);

            String barcode = uniqueParts[0];
            String sdate = uniqueParts[1];
            String factory = uniqueParts[2];
            String storage = uniqueParts[3];
            String qty = uniqueParts[4];
            String itemcode = uniqueParts[5];
            String loginid = (String) data.get("loginid");

            // PARAM 이 가지고있던 데이터 넣어주기
            insertParam.put("sdate", sdate);
            insertParam.put("barcode", barcode);
            insertParam.put("factory", factory);
            insertParam.put("lastfactory", factory);
            insertParam.put("storage1", storage);
            insertParam.put("laststorage", "PRODUCT");
            insertParam.put("storage2", "PRODUCT");
            insertParam.put("itemcode", itemcode);
            insertParam.put("qty", qty);
            insertParam.put("loginid", loginid);
            insertParam.put("source", "STORAGEMOVE");
			insertParam.put("source2", "RECEIVING");
            insertParam.put("memo", "STORAGEMOVE-NOSCAN");
            insertParam.put("ymdhms", nowDateTime);
            insertParam.put("laststatus", 10);

			if (barcode.split("_", -1).length == 6) {        // 박스 바코드일때
				String[] parts2 = barcode.split("_", -1);
				Map<String, Object> item = purchaseMapper.getItemInfoSpec(parts2[3]);
				insertParam.put("itemcode", item.get("ITEMCODE"));
				insertParam.put("location", factory + "-" + "PRODUCT" + "-" + item.get("CAR"));
				insertParam.put("rack", item.get("CAR"));
				purchaseMapper.updateLaststatusPart(insertParam);
			}else if(barcode.split(",", -1).length == 5){
				purchaseMapper.updateLaststatusPart(insertParam);
			}else if(barcode.split(",", -1).length == 4){
				purchaseMapper.updateLaststatusPallet(insertParam);
				List<String> barcodeList = purchaseMapper.read_palletInBarcodeList(barcode);
				for (int j = 0; j < barcodeList.size(); j++) {
					insertParam.put("barcode", barcodeList.get(j));
					purchaseMapper.updateLaststatusPart(insertParam);
				}
			}

			// 창고 이동 처리
            purchaseMapper.stockMoveProduct(insertParam);

			// Stock 테이블 등록
			insertParam.put("inqty", "0");
			insertParam.put("outqty", qty);
			purchaseMapper.insertStockProduct(insertParam);

			// location useyn N으로 업데이트
			purchaseMapper.updateUnloadedBarcodeMoveProduct(insertParam);
        }
		
		return 0;
	}

	// 반품검사 등록 (엑셀 데이터)
	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int inspectionReturn(List<Map<String, Object>> list, String loginid, String source) {
		int count = 0;
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

		for (Map<String, Object> item : list) {
			Map<String, Object> map = new HashMap<>();
			String sdate    = item.getOrDefault("SDATE",    item.getOrDefault("sdate",    today)).toString();
			String oitemcode = item.getOrDefault("ITEMCODE", item.getOrDefault("itemcode", "")).toString();
			Object qty      = item.getOrDefault("QTY",      item.getOrDefault("qty",      0));
			String judgment = item.getOrDefault("JUDGMENT", item.getOrDefault("judgment", "")).toString();

			map.put("date",    sdate);
			map.put("oitemcode", oitemcode);
			map.put("qty",      qty);
			map.put("judgment", judgment);
			map.put("source2", judgment);
			map.put("source", source);
			map.put("loginid",  loginid);
			map.put("bdate",    sdate.replaceAll("-","").substring(2));

			// sdate "2026-04-05" → "05_04_2026" (바코드 날짜 형식)
			String[] dp = sdate.split("-");
			String datePrefix = dp[2] + "_" + dp[1] + "_" + dp[0];
			map.put("datePrefix", datePrefix);

			// 기존 바코드 순번 조회 → 없으면 1, 있으면 마지막 순번 +1
			String originBarcode = purchaseMapper.getBarcodeSeq(map);
			int seq = 1;
			if (originBarcode != null && !originBarcode.isEmpty()) {
				String[] parts = originBarcode.split("_");
				try {
					seq = Integer.parseInt(parts[parts.length - 1]) + 1;
				} catch (NumberFormatException e) {
					seq = 1;
				}
			}

			// 새 바코드 생성: MM_dd_yyyy_oitemcode_qty_seq
			String newBarcode = datePrefix + "_" + oitemcode + "_" + qty + "_" + seq;
			map.put("barcode", newBarcode);
			map.put("seq",     seq);
			map.put("labelType","DEFECTIVE");
			Map<String, Object> itemInfo = purchaseMapper.getItemInfoSpec(oitemcode);
			map.put("itemcode", itemInfo.get("ITEMCODE"));
			map.put("itemname", itemInfo.get("ITEMNAME"));
			map.put("laststatus", 10);

			map.put("storage", "PRODUCT");
			map.put("factory", "WBTA");

			map.put("location", "WBTA-PRODUCT-"+itemInfo.get("CAR"));
			map.put("rack", itemInfo.get("CAR"));
			purchaseMapper.makeBarcode(map);


			// 출고반품 등록
			purchaseMapper.insOutputReturn(map);

			// 양불전환

			map.put("oldokyn", "Y");
			map.put("newokyn", "N");
			// 양불 전환 insert
			purchaseMapper.conditionChange(map);

			// location에 저장
			purchaseMapper.basicLocation(map);
			if ("SCRAP".equals(judgment)) {
				map.put("dmemo", "SCRAP");
				purchaseMapper.removeBarcode(map);
			}
			// 검사 등록
			purchaseMapper.insInspection(map);

			count++;
		}

		/*if(true){
			TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
			return count;
		}*/

		return count;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int insertWarehouseInspection(List<Map<String, Object>> list, String loginid, String source) {
		int count = 0;
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

		for (Map<String, Object> item : list) {
			Map<String, Object> map = new HashMap<>();
			String sdate    = item.getOrDefault("SDATE",    item.getOrDefault("sdate",    today)).toString();
			String oitemcode = item.getOrDefault("ITEMCODE", item.getOrDefault("itemcode", "")).toString();
			Object qty      = item.getOrDefault("QTY",      item.getOrDefault("qty",      0));
			String judgment = item.getOrDefault("JUDGMENT", item.getOrDefault("judgment", "")).toString();

			map.put("date",    sdate);
			map.put("oitemcode", oitemcode);
			map.put("qty",      qty);
			map.put("judgment", judgment);
			map.put("source2", judgment);
			map.put("source", source);
			map.put("loginid",  loginid);
			map.put("bdate",    sdate.replaceAll("-","").substring(2));

			// sdate "2026-04-05" → "05_04_2026" (바코드 날짜 형식)
			String[] dp = sdate.split("-");
			String datePrefix = dp[2] + "_" + dp[1] + "_" + dp[0];
			map.put("datePrefix", datePrefix);

			// 기존 바코드 순번 조회 → 없으면 1, 있으면 마지막 순번 +1
			String originBarcode = purchaseMapper.getBarcodeSeq(map);
			int seq = 1;
			if (originBarcode != null && !originBarcode.isEmpty()) {
				String[] parts = originBarcode.split("_");
				try {
					seq = Integer.parseInt(parts[parts.length - 1]) + 1;
				} catch (NumberFormatException e) {
					seq = 1;
				}
			}

			// 새 바코드 생성: MM_dd_yyyy_oitemcode_qty_seq
			String newBarcode = datePrefix + "_" + oitemcode + "_" + qty + "_" + seq;
			map.put("barcode", newBarcode);
			map.put("seq",     seq);
			map.put("labelType","DEFECTIVE");
			Map<String, Object> itemInfo = purchaseMapper.getItemInfoSpec(oitemcode);
			map.put("itemcode", itemInfo.get("ITEMCODE"));
			map.put("itemname", itemInfo.get("ITEMNAME"));
			map.put("laststatus", 10);

			map.put("storage", "PRODUCT");
			map.put("factory", "WBTA");

			map.put("location", "WBTA-PRODUCT-"+itemInfo.get("CAR"));
			map.put("rack", itemInfo.get("CAR"));
			purchaseMapper.makeBarcode(map);

			// 양불전환

			map.put("oldokyn", "Y");
			map.put("newokyn", "N");
			// 양불 전환 insert
			purchaseMapper.conditionChange(map);

			// location에 저장
			purchaseMapper.basicLocation(map);
			if ("SCRAP".equals(judgment)) {
				map.put("dmemo", "SCRAP");
				purchaseMapper.removeBarcode(map);
			}
			// 검사 등록
			purchaseMapper.insInspection(map);

			count++;
		}

		/*if(true){
			TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
			return count;
		}*/

		return count;
	}

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

				// A: DATE
				String rowDate = "";
				Cell dateCell = row.getCell(0);
				if (dateCell != null) {
					if (dateCell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(dateCell)) {
						java.util.Date javaDate = DateUtil.getJavaDate(dateCell.getNumericCellValue());
						rowDate = javaDate.toInstant()
								.atZone(java.time.ZoneId.systemDefault())
								.toLocalDate()
								.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
					} else {
						Object dateVal = getCellValue(dateCell, evaluator);
						if (dateVal instanceof Number) {
							rowDate = String.valueOf(((Number) dateVal).longValue());
						} else {
							rowDate = String.valueOf(dateVal).trim();
						}
						if (rowDate.startsWith("'")) {
							rowDate = rowDate.substring(1).trim();
						}
						// YYYYMMDD → YYYY-MM-DD
						if (rowDate.matches("\\d{8}")) {
							rowDate = rowDate.substring(0, 4) + "-" + rowDate.substring(4, 6) + "-" + rowDate.substring(6, 8);
						}
						// MM/dd/yyyy → YYYY-MM-DD (미국 형식)
						if (rowDate.matches("\\d{1,2}/\\d{1,2}/\\d{4}")) {
							rowDate = LocalDate.parse(rowDate, DateTimeFormatter.ofPattern("M/d/yyyy"))
									.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
						}
						// MM-dd-yyyy → YYYY-MM-DD (미국 형식, 대시)
						if (rowDate.matches("\\d{1,2}-\\d{1,2}-\\d{4}")) {
							rowDate = LocalDate.parse(rowDate, DateTimeFormatter.ofPattern("M-d-yyyy"))
									.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
						}
						// yyyy/MM/dd → YYYY-MM-DD
						if (rowDate.matches("\\d{4}/\\d{2}/\\d{2}")) {
							rowDate = rowDate.replace("/", "-");
						}
						// yyyy.MM.dd → YYYY-MM-DD
						if (rowDate.matches("\\d{4}\\.\\d{2}\\.\\d{2}")) {
							rowDate = rowDate.replace(".", "-");
						}
					}
				}

				// B: ITEMCODE
				String itemcode = String.valueOf(getCellValue(row.getCell(1), evaluator)).trim();
				if (itemcode.isEmpty()) continue;

				// C: QTY (숫자)
				Object qtyVal = getCellValue(row.getCell(2), evaluator);
				if (!(qtyVal instanceof Number)) continue;

				// D: JUDGMENT (텍스트)
				String judgment = String.valueOf(getCellValue(row.getCell(3), evaluator)).trim();

				Map<String, Object> map = new HashMap<>();
				map.put("sdate",    rowDate);
				map.put("itemcode", itemcode);
				map.put("qty",      qtyVal);
				map.put("judgment", judgment);

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

	@Override
	public Map<String, Object> readConditionChange(Map<String, Object> params) {
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");
		Map<String, Object> queryParams = new HashMap<>();
		queryParams.put("searchParams", searchParams);

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();

		try {
			// 쿼리 실행
			List<Map<String, Object>> records = purchaseMapper.readConditionChange(queryParams);

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
}
