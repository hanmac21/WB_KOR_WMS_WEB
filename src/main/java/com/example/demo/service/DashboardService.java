package com.example.demo.service;

import java.util.List;
import java.util.Map;

// 🔹 **1. 서비스 인터페이스**
public interface DashboardService {

	/**
	 * 대시보드 데이터 조회
	 * 
	 * @param params 검색 파라미터 (month, supplier, factory, warehouse, partNumber,
	 *               partName)
	 * @return 대시보드 데이터 (summary, monthly, supplier, factory, topParts, detail,
	 *         filters)
	 */
	Map<String, Object> getDashboardData(Map<String, Object> params);

	Map<String, Object> read_parts_requirement_weekly_dashboard(Map<String, Object> params);

	List<Map<String, Object>> getFabricUsageData(String sdate, String edate, String factory);

	Map<String, Object> getSalesOutDashboard(Map<String, Object> req);

	List<String> getSalesOutSubCategory(Map<String, Object> req);

	Map<String, Object> readDashboardVendorStockStatus(Map<String, Object> param);

	List<Map<String, Object>> getDashboardVehicleItemShipmentStatus(Map<String, Object> req);

	List<Map<String, Object>> getDashboardInterfaceStatus(Map<String, Object> req);

	Map<String, Object> getPartsRequirementBiweeklyDashboard(Map<String, Object> req);

	/* =========================
     * 품질 대시보드 메인
     * ========================= */
    Map<String, Object> getQualityDashboardMain(Map<String, Object> req);

	List<Map<String, Object>> readQualityDashboardListLevel1(Map<String, Object> paramMap);
    List<Map<String, Object>> readQualityDashboardListLevel2(Map<String, Object> paramMap);
    List<Map<String, Object>> readQualityDashboardListLevel3(Map<String, Object> paramMap);
    List<Map<String, Object>> readQualityDashboardListLevel4(Map<String, Object> paramMap);

    /* =========================
     * 재고 대시보드(New) - 일자별 4종
     * ========================= */
    Map<String, Object> getStockDailyDashboard(Map<String, Object> params);

}