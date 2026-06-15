package com.example.demo.mapper.wbusa;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface DashboardMapper {
	/**
	 * 요약 정보 조회 (KPI 카드)
	 */
	Map<String, Object> selectSummary(Map<String, Object> params);

	/**
	 * 월별 추이 조회 (최근 4개월)
	 */
	// List<Map<String, Object>> selectMonthly(Map<String, Object> params);

	/**
	 * 거래처별 집계
	 */
	// List<Map<String, Object>> selectBySupplier(Map<String, Object> params);

	/**
	 * 공장별 집계
	 */
	// List<Map<String, Object>> selectByFactory(Map<String, Object> params);

	/**
	 * Top 10 부품
	 */
	// List<Map<String, Object>> selectTopParts(Map<String, Object> params);

	/**
	 * 상세 내역
	 */
	List<Map<String, Object>> selectDetail(Map<String, Object> params);

	/**
	 * 거래처 목록
	 */
	// List<String> selectSupplierList();

	/**
	 * 공장 목록
	 */
	List<String> selectFactoryList();

	/**
	 * 창고 목록
	 */
	List<String> selectWarehouseList();

	/**
	 * 상세 내역
	 */
	List<Map<String, Object>> selectDetail_weekly(Map<String, Object> params);

	/**
	 * 거래처 목록
	 */
	// List<String> selectSupplierList();

	/**
	 * 공장 목록
	 */
	List<String> selectFactoryList_weekly();

	/**
	 * 창고 목록
	 */
	List<String> selectWarehouseList_weekly();

	String getCustcode(String custname);

	/**
	 * 공장 목록
	 */
	// List<String> selectItemNameList(Map<String, Object> params);

	/**
	 * 창고 목록
	 */
	// List<String> selectItemCodeList(Map<String, Object> params);

	List<Map<String, Object>> selectFabricUsageList(Map<String, String> params);

	List<Map<String, Object>> selectSalesOutDashboardRows(Map<String, Object> req);

	List<Map<String, Object>> selectSalesOutDashboardDaily(Map<String, Object> req);

	List<String> selectSalesOutCarList(Map<String, Object> req);

	List<String> selectSalesOutCustomerList(Map<String, Object> req);

	List<Map<String, Object>> selectDashboardVendorStockStatus(Map<String, Object> param);

    int selectDashboardVendorStockStatusCount(Map<String, Object> param);

	List<Map<String, Object>> selectDashboardVehicleItemShipmentStatus(Map<String, Object> param);

	List<Map<String, Object>> selectDashboardInterfaceStatus(Map<String, Object> param);

	List<Map<String, Object>> selectPartsRequirementBiweeklyDetail(Map<String, Object> param);

	List<String> selectPartsRequirementBiweeklyFactories(Map<String, Object> param);

	List<String> selectPartsRequirementBiweeklyStorages(Map<String, Object> param);
	
	/* =========================
     * 품질 대시보드 메인
     * ========================= */
    Map<String, Object> readQualityDashboardSummary(Map<String, Object> req);

    List<Map<String, Object>> readQualityDashboardJudgmentChart(Map<String, Object> req);

    List<Map<String, Object>> readQualityDashboardResponsibilityChart(Map<String, Object> req);

    List<Map<String, Object>> readQualityDashboardDefectTypeChart(Map<String, Object> req);

	List<Map<String, Object>> readQualityDashboardListLevel1(Map<String, Object> paramMap);
    List<Map<String, Object>> readQualityDashboardListLevel2(Map<String, Object> paramMap);
    List<Map<String, Object>> readQualityDashboardListLevel3(Map<String, Object> paramMap);
    List<Map<String, Object>> readQualityDashboardListLevel4(Map<String, Object> paramMap);

    /* =========================
     * 재고 대시보드(New) - 일자별 4종
     * ========================= */
    List<Map<String, Object>> selectStockDailySummary(Map<String, Object> params);
    List<Map<String, Object>> selectInboundDailySummary(Map<String, Object> params);
    List<Map<String, Object>> selectMoveDailySummary(Map<String, Object> params);
    List<Map<String, Object>> selectOutboundDailySummary(Map<String, Object> params);
}
