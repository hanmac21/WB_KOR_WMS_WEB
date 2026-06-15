/* --------------------------------------------------------------
 * 📋 SalesService 인터페이스 및 구현체
 * -------------------------------------------------------------- */

package com.example.demo.service;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.time.temporal.IsoFields;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.mapper.wbusa.DashboardMapper;

@Service
public class DashboardServiceImpl implements DashboardService {

	@Autowired
	private DashboardMapper dashboardMapper;

	@Override
	public Map<String, Object> getDashboardData(Map<String, Object> params) {
		Map<String, Object> result = new HashMap<>();

		// custcode 변환
		String custname = (String) params.get("custname");
		String custcode = dashboardMapper.getCustcode(custname);
		params.put("custcode", custcode);

		String month = (String) params.get("month");

		// 월 시작일/종료일 계산
		if (month != null && !month.isEmpty()) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
			Date date = null;
			try {
				date = sdf.parse(month);
			} catch (ParseException e) {
				e.printStackTrace();
			}

			Calendar cal = Calendar.getInstance();
			cal.setTime(date);

			// 전달의 마지막 날 (month 기준으로 계산)
			Calendar prevCal = Calendar.getInstance();
			prevCal.setTime(date); // month 기준으로 설정
			prevCal.add(Calendar.MONTH, -1);
			prevCal.set(Calendar.DAY_OF_MONTH, prevCal.getActualMaximum(Calendar.DAY_OF_MONTH));
			String startDate_prev = new SimpleDateFormat("yyyy-MM-dd").format(prevCal.getTime());

			System.out.println("startDate_prev");
			System.out.println(startDate_prev);

			// 시작일 (1일)
			cal.set(Calendar.DAY_OF_MONTH, 1);
			String startDate = new SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());

			// 종료일 (마지막 날)
			cal.set(Calendar.DAY_OF_MONTH, cal.getActualMaximum(Calendar.DAY_OF_MONTH));
			String endDate = new SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());

			params.put("startDate", startDate);
			params.put("startDate_prev", startDate_prev);
			params.put("endDate", endDate);
		}

		// 파라미터 정제
		cleanParams(params);

		// 1. 요약 정보 조회 (KPI 카드용)
		Map<String, Object> summary = dashboardMapper.selectSummary(params);

		// 2. 월별 추이 조회 (차트용)
		// List<Map<String, Object>> monthly = dashboardMapper.selectMonthly(params);

		// 3. 거래처별 집계 (차트용)
		// List<Map<String, Object>> supplier =
		// dashboardMapper.selectBySupplier(params);

		// 4. 공장별 집계 (차트용)
		// List<Map<String, Object>> factory = dashboardMapper.selectByFactory(params);

		// 5. Top 10 부품 (차트용)
		// List<Map<String, Object>> topParts = dashboardMapper.selectTopParts(params);

		// 6. 상세 내역 (테이블용)
		List<Map<String, Object>> detail = dashboardMapper.selectDetail(params);

		// 7. 필터 옵션 목록
		// List<String> suppliers = dashboardMapper.selectSupplierList();
		List<String> factories = dashboardMapper.selectFactoryList();
		List<String> storage = dashboardMapper.selectWarehouseList();

		// 품번 품명
		// List<String> itemcode = dashboardMapper.selectItemCodeList(params);
		// List<String> itemname = dashboardMapper.selectItemNameList(params);

		// 결과 조합
		result.put("summary", summary != null ? summary : new HashMap<>());
		// result.put("monthly", monthly != null ? monthly : List.of());
		// result.put("supplier", supplier != null ? supplier : List.of());
		// result.put("factory", factory != null ? factory : List.of());
		// result.put("topParts", topParts != null ? topParts : List.of());
		result.put("detail", detail != null ? detail : Collections.emptyList());// result.put("detail", detail != null ?
																				// detail : List.of()); List.of()가 자바8에서
																				// 사용못해서 자바8도 동작하도록 수정
		// result.put("suppliers", suppliers != null ? suppliers : List.of());
		result.put("factories", factories != null ? factories : Collections.emptyList());// result.put("factories",
																							// factories != null ?
																							// factories : List.of());
		result.put("storages", storage != null ? storage : Collections.emptyList());// result.put("storages", storage !=
																					// null ? storage : List.of());
		// 결과 조합
		// result.put("itemcodes", itemcode != null ? itemcode : List.of());
		// result.put("itemnames", itemname != null ? itemname : List.of());

		return result;
	}

	@Override
	public Map<String, Object> read_parts_requirement_weekly_dashboard(Map<String, Object> params) {
		Map<String, Object> result = new HashMap<>();

		// -------------------------------------------------
		// ✅ 1) custname -> custcode (null 안전)
		// -------------------------------------------------
		String custname = (String) params.get("custname"); // ※ 컨트롤러에서 custname으로 넣는 걸 권장
		if (custname != null)
			custname = custname.trim();

		if (custname != null && !custname.isEmpty()) {
			String custcode = dashboardMapper.getCustcode(custname);
			params.put("custcode", custcode);
		} else {
			params.put("custcode", null);
		}

		// -------------------------------------------------
		// ✅ 2) month 확정 (프론트는 month=YYYY-MM 보내는 방식)
		// - week 로직은 이제 사용 안 함 (있어도 fallback 정도만)
		// -------------------------------------------------
		String month = (String) params.get("month");
		if (month != null)
			month = month.trim();

		// 혹시라도 아직 week 보내는 화면이 남아있으면 fallback만 지원
		String week = (String) params.get("week");
		if ((month == null || month.isEmpty()) && week != null && !week.trim().isEmpty()) {
			month = isoWeekToMonth(week.trim());
		}

		if (month == null || month.isEmpty()) {
			throw new IllegalArgumentException("month is required. (expected format: yyyy-MM)");
		}

		params.put("month", month); // ✅ 반드시 유지

		// -------------------------------------------------
		// ✅ 3) 월 시작/종료일 계산 (yyyy-MM 기준)
		// -------------------------------------------------
		java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM");
		java.util.Date date;
		try {
			date = sdf.parse(month);
		} catch (java.text.ParseException e) {
			throw new RuntimeException("month parse error: " + month, e);
		}

		java.util.Calendar cal = java.util.Calendar.getInstance();
		cal.setTime(date);

		// 전달의 마지막 날 (startDate_prev)
		java.util.Calendar prevCal = java.util.Calendar.getInstance();
		prevCal.setTime(date);
		prevCal.add(java.util.Calendar.MONTH, -1);
		prevCal.set(java.util.Calendar.DAY_OF_MONTH, prevCal.getActualMaximum(java.util.Calendar.DAY_OF_MONTH));
		String startDate_prev = new java.text.SimpleDateFormat("yyyy-MM-dd").format(prevCal.getTime());

		// 시작일 (1일)
		cal.set(java.util.Calendar.DAY_OF_MONTH, 1);
		String startDate = new java.text.SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());

		// 종료일 (마지막 날)
		cal.set(java.util.Calendar.DAY_OF_MONTH, cal.getActualMaximum(java.util.Calendar.DAY_OF_MONTH));
		String endDate = new java.text.SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());

		params.put("startDate", startDate);
		params.put("startDate_prev", startDate_prev);
		params.put("endDate", endDate);

		// -------------------------------------------------
		// ✅ 4) 파라미터 정제
		// -------------------------------------------------
		cleanParams(params);

		// -------------------------------------------------
		// ✅ 5) 상세/필터 옵션
		// -------------------------------------------------
		List<Map<String, Object>> detail_weekly = dashboardMapper.selectDetail_weekly(params);
		List<String> factories_weekly = dashboardMapper.selectFactoryList_weekly();
		List<String> storage_weekly = dashboardMapper.selectWarehouseList_weekly();

		result.put("detail", detail_weekly != null ? detail_weekly : java.util.Collections.emptyList());
		result.put("factories", factories_weekly != null ? factories_weekly : java.util.Collections.emptyList());
		result.put("storages", storage_weekly != null ? storage_weekly : java.util.Collections.emptyList());

		return result;
	}

	// (fallback 용으로만 유지 가능)
	private String isoWeekToMonth(String week) {
		if (week == null)
			return null;
		week = week.trim();
		if (week.isEmpty())
			return null;

		String[] parts = week.split("-W");
		if (parts.length != 2) {
			throw new IllegalArgumentException("Invalid ISO week format: " + week);
		}

		int y = Integer.parseInt(parts[0]);
		int w = Integer.parseInt(parts[1]);

		LocalDate monday = LocalDate.of(y, 1, 4).with(IsoFields.WEEK_OF_WEEK_BASED_YEAR, w)
				.with(ChronoField.DAY_OF_WEEK, 1);

		return monday.format(DateTimeFormatter.ofPattern("yyyy-MM"));
	}

	/**
	 * 파라미터 정제 (all -> null 변환)
	 */
	private void cleanParams(Map<String, Object> params) {
		if ("all".equals(params.get("supplier"))) {
			params.put("supplier", null);
		}
		if ("all".equals(params.get("factory"))) {
			params.put("factory", null);
		}
		if ("all".equals(params.get("warehouse"))) {
			params.put("warehouse", null);
		}
		if (params.get("partNumber") != null && params.get("partNumber").toString().trim().isEmpty()) {
			params.put("partNumber", null);
		}
		if (params.get("partName") != null && params.get("partName").toString().trim().isEmpty()) {
			params.put("partName", null);
		}
	}

	@Override
	public List<Map<String, Object>> getFabricUsageData(String sdate, String edate, String factory) {
		Map<String, String> params = new HashMap<>();
		params.put("sdate", sdate);
		params.put("edate", edate);
		params.put("factory", factory);

		return dashboardMapper.selectFabricUsageList(params);
	}

	// -------------------------------
	// utils
	// -------------------------------
	private static Map<String, Object> mapOf(Object... kv) {
		Map<String, Object> m = new HashMap<>();
		for (int i = 0; i < kv.length; i += 2) {
			m.put(String.valueOf(kv[i]), kv[i + 1]);
		}
		return m;
	}

	private static String asString(Object o) {
		return (o == null) ? "" : String.valueOf(o).trim();
	}

	private static long asLong(Object o) {
		if (o == null)
			return 0L;
		if (o instanceof Number)
			return ((Number) o).longValue();
		String s = String.valueOf(o).trim();
		if (s.isEmpty())
			return 0L;
		try {
			return new BigDecimal(s).longValue();
		} catch (Exception ignore) {
			return 0L;
		}
	}

	private static BigDecimal asBigDecimal(Object o) {
		if (o == null)
			return BigDecimal.ZERO;
		if (o instanceof BigDecimal)
			return (BigDecimal) o;
		if (o instanceof Number)
			return BigDecimal.valueOf(((Number) o).doubleValue());
		String s = String.valueOf(o).trim();
		if (s.isEmpty())
			return BigDecimal.ZERO;
		try {
			return new BigDecimal(s);
		} catch (Exception ignore) {
			return BigDecimal.ZERO;
		}
	}

	@Override
	public Map<String, Object> getSalesOutDashboard(Map<String, Object> req) {

		// 쿼리 결과: [{YMD, CNT, TOTAL_QTY, TOTAL_AMT}, ...]
		List<Map<String, Object>> dailyRows = dashboardMapper.selectSalesOutDashboardDaily(req);

		long shipCount = 0L;
		long shipQty = 0L;
		BigDecimal shipAmount = BigDecimal.ZERO;

		List<Map<String, Object>> dailyCount = new ArrayList<>();
		List<Map<String, Object>> dailyQty = new ArrayList<>();
		List<Map<String, Object>> dailyAmount = new ArrayList<>();

		for (Map<String, Object> r : dailyRows) {

			String ymd = asString(r.get("YMD"));
			long cnt = asLong(r.get("CNT"));
			long qty = asLong(r.get("TOTAL_QTY"));
			BigDecimal amt = asBigDecimal(r.get("TOTAL_AMT"));

			shipCount += cnt;
			shipQty += qty;
			shipAmount = shipAmount.add(amt);

			dailyCount.add(mapOf("YMD", ymd, "VALUE", cnt));
			dailyQty.add(mapOf("YMD", ymd, "VALUE", qty));
			dailyAmount.add(mapOf("YMD", ymd, "VALUE", amt.longValue()));
		}

		Map<String, Object> summary = new HashMap<>();
		summary.put("SHIP_COUNT", shipCount);
		summary.put("SHIP_QTY", shipQty);
		summary.put("SHIP_AMOUNT", shipAmount.longValue());

		Map<String, Object> data = new HashMap<>();
		data.put("summary", summary);
		data.put("dailyCount", dailyCount);
		data.put("dailyQty", dailyQty);
		data.put("dailyAmount", dailyAmount);

		return data;
	}

	@Override
	public List<String> getSalesOutSubCategory(Map<String, Object> req) {

		String main = asString(req.get("main"));
		// dateFrom/dateTo도 같이 보내면 “해당 기간 기준 distinct” 가능

		if ("CAR".equals(main)) {
			return dashboardMapper.selectSalesOutCarList(req);
		}

		if ("CUSTOMER".equals(main)) {
			return dashboardMapper.selectSalesOutCustomerList(req);
		}

		return new ArrayList<>();
	}

	@Override
	public Map<String, Object> readDashboardVendorStockStatus(Map<String, Object> param) {
		Map<String, Object> result = new HashMap<>();

		List<Map<String, Object>> list = dashboardMapper.selectDashboardVendorStockStatus(param);
		int totalCount = dashboardMapper.selectDashboardVendorStockStatusCount(param);

		result.put("data", list);
		result.put("totalCount", totalCount);

		return result;
	}

	@Override
	public List<Map<String, Object>> getDashboardVehicleItemShipmentStatus(Map<String, Object> req) {
		return dashboardMapper.selectDashboardVehicleItemShipmentStatus(req);
	}

	@Override
	public List<Map<String, Object>> getDashboardInterfaceStatus(Map<String, Object> req) {
		return dashboardMapper.selectDashboardInterfaceStatus(req);
	}

	@Override
	public Map<String, Object> getPartsRequirementBiweeklyDashboard(Map<String, Object> req) {

		Map<String, Object> result = new HashMap<>();
		Map<String, Object> param = new HashMap<>(req);

		String week = String.valueOf(req.get("week") == null ? "" : req.get("week")).trim();
		if ("".equals(week)) {
			throw new RuntimeException("week is required");
		}

		LocalDate week1Start = parseIsoWeekStart(week); // 월요일
		LocalDate week1End = week1Start.plusDays(5); // 토요일 기준
		LocalDate week2Start = week1Start.plusWeeks(1);
		LocalDate week2End = week2Start.plusDays(5);

		LocalDate monthStart = week1Start.withDayOfMonth(1);
		LocalDate prevDay = week1Start.minusDays(1);

		param.put("week", week);
		param.put("week1Start", week1Start.toString());
		param.put("week1End", week1End.toString());
		param.put("week2Start", week2Start.toString());
		param.put("week2End", week2End.toString());
		param.put("monthStart", monthStart.toString());
		param.put("prevDay", prevDay.toString());
		param.put("prevInventoryDate", monthStart.toString());

		List<Map<String, Object>> detail = dashboardMapper.selectPartsRequirementBiweeklyDetail(param);
		List<String> factories = dashboardMapper.selectPartsRequirementBiweeklyFactories(param);
		List<String> storages = dashboardMapper.selectPartsRequirementBiweeklyStorages(param);

		result.put("detail", detail);
		result.put("factories", factories);
		result.put("storages", storages);

		// 프론트 호환용
		result.put("weekly", new ArrayList<>());
		result.put("supplier", new ArrayList<>());
		result.put("factory", new ArrayList<>());
		result.put("topParts", new ArrayList<>());

		return result;
	}

	private LocalDate parseIsoWeekStart(String week) {
		// 예: 2026-W03 -> 2026-W03-1(월요일)
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("YYYY-'W'ww-e", Locale.US);
		return LocalDate.parse(week + "-1", formatter);
	}

		@Override
    public List<Map<String, Object>> readQualityDashboardListLevel1(Map<String, Object> paramMap) {
        return dashboardMapper.readQualityDashboardListLevel1(paramMap);
    }

    @Override
    public List<Map<String, Object>> readQualityDashboardListLevel2(Map<String, Object> paramMap) {
        return dashboardMapper.readQualityDashboardListLevel2(paramMap);
    }

    @Override
    public List<Map<String, Object>> readQualityDashboardListLevel3(Map<String, Object> paramMap) {
        return dashboardMapper.readQualityDashboardListLevel3(paramMap);
    }

    @Override
    public List<Map<String, Object>> readQualityDashboardListLevel4(Map<String, Object> paramMap) {
        return dashboardMapper.readQualityDashboardListLevel4(paramMap);
    }

	/* =========================
     * 품질 대시보드 메인
     * ========================= */
    @Override
    public Map<String, Object> getQualityDashboardMain(Map<String, Object> req) {
        Map<String, Object> result = new HashMap<>();

        Map<String, Object> summary = dashboardMapper.readQualityDashboardSummary(req);
        List<Map<String, Object>> judgmentChart = dashboardMapper.readQualityDashboardJudgmentChart(req);
        List<Map<String, Object>> responsibilityChart = dashboardMapper.readQualityDashboardResponsibilityChart(req);
        List<Map<String, Object>> defectTypeChart = dashboardMapper.readQualityDashboardDefectTypeChart(req);

        result.put("summary", summary != null ? summary : new HashMap<>());
        result.put("judgmentChart", judgmentChart);
        result.put("responsibilityChart", responsibilityChart);

        // JS에서 vendorChart 키를 그대로 사용하고 있어서 맞춰서 내려줌
        result.put("vendorChart", defectTypeChart);

        return result;
    }

    /* =========================
     * 재고 대시보드(New) - 일자별 4종
     * ========================= */
    @Override
    public Map<String, Object> getStockDailyDashboard(Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();

        // "전체" 선택 시 null 처리하여 SQL <if> 조건이 생략되도록
        if ("".equals(params.get("factory"))) params.put("factory", null);
        if ("".equals(params.get("storage"))) params.put("storage", null);

        List<Map<String, Object>> stock    = dashboardMapper.selectStockDailySummary(params);
        List<Map<String, Object>> inbound  = dashboardMapper.selectInboundDailySummary(params);
        List<Map<String, Object>> move     = dashboardMapper.selectMoveDailySummary(params);
        List<Map<String, Object>> outbound = dashboardMapper.selectOutboundDailySummary(params);

        result.put("stock",    stock    != null ? stock    : Collections.emptyList());
        result.put("inbound",  inbound  != null ? inbound  : Collections.emptyList());
        result.put("move",     move     != null ? move     : Collections.emptyList());
        result.put("outbound", outbound != null ? outbound : Collections.emptyList());

        return result;
    }

}