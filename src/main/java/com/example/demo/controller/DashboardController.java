package com.example.demo.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.DashboardService;

import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
@RestController
public class DashboardController {
	@Autowired
	DashboardService dashboardService;

	// 작업장 내 예외입고 - detail
	// @PostMapping("/read_salesExceptionInputDetail")
	// public ResponseEntity<Map<String, Object>> read_salesExceptionInputDetail(
	// @RequestBody Map<String, Object> requestData) {
	// return
	// ResponseEntity.ok(salesService.read_salesExceptionInputDetail(requestData));
	// }

	/**
	 * 월별 부품 소요량 대시보드 데이터 조회
	 * 
	 * @param params { month: "2024-11", supplier: "거래처 A" or "all", factory: "1공장"
	 *               or "all", storage: "A창고" or "all", partNumber: "P001001",
	 *               partName: "부품명" }
	 * @return { success: true, data: { summary, monthly, supplier, factory,
	 *         topParts, detail, filters } }
	 */
	@PostMapping("/read_parts_requirement_dashboard")
	@ResponseBody
	public Map<String, Object> read_parts_requirement_dashboard(@RequestBody Map<String, String> params) {
		Map<String, Object> result = new HashMap<>();

		try {
			log.info("=== 월별 부품 소요량 대시보드 조회 시작 ===");
			log.info("파라미터: {}", params);

			// 파라미터 변환 (String -> Object)
			Map<String, Object> queryParams = new HashMap<>();
			queryParams.put("month", params.get("month"));
			queryParams.put("supplier", params.get("supplier"));
			queryParams.put("factory", params.get("factory"));
			queryParams.put("storage", params.get("storage"));
			queryParams.put("partNumber", params.get("partNumber"));
			queryParams.put("partName", params.get("partName"));
			queryParams.put("custname", params.get("custname"));

			log.info("=== 월별 부품 소요량 대시보드 조회 시작 ===");
			log.info("파라미터: {}", params);

			// 서비스 호출
			Map<String, Object> data = dashboardService.getDashboardData(queryParams);

			result.put("success", true);
			result.put("data", data);

			log.info("조회 성공 - 상세 데이터 건수: {}", ((java.util.List<?>) data.get("detail")).size());

		} catch (Exception e) {
			log.error("월별 부품 소요량 대시보드 조회 중 오류 발생", e);
			result.put("success", false);
			result.put("message", "데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
		}

		return result;
	}

	@PostMapping("/read_parts_requirement_weekly_dashboard")
	@ResponseBody
	public Map<String, Object> read_parts_requirement_weekly_dashboard(@RequestBody Map<String, String> params) {
		Map<String, Object> result = new HashMap<>();

		try {
			log.info("=== 주별 부품 소요량 대시보드 조회 시작 ===");
			log.info("파라미터: {}", params);

			Map<String, Object> queryParams = new HashMap<>();
			queryParams.put("month", params.get("month")); // ✅ week
			queryParams.put("supplier", params.get("supplier"));
			queryParams.put("factory", params.get("factory"));
			queryParams.put("storage", params.get("storage"));
			queryParams.put("partNumber", params.get("partNumber"));
			queryParams.put("partName", params.get("partName"));
			queryParams.put("custname", params.get("custname"));

			Map<String, Object> data = dashboardService.read_parts_requirement_weekly_dashboard(queryParams);

			result.put("success", true);
			result.put("data", data);

			Object d = data.get("detail");
			log.info("조회 성공 - 상세 데이터 건수: {}", (d instanceof java.util.List) ? ((java.util.List<?>) d).size() : 0);

		} catch (Exception e) {
			log.error("주별 부품 소요량 대시보드 조회 중 오류 발생", e);
			result.put("success", false);
			result.put("message", "데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
		}

		return result;
	}

	@PostMapping("/read_fabricUsage_dashboard")
	@ResponseBody
	public Map<String, Object> readFabricUsageDashboard(@RequestBody Map<String, String> params) {
		Map<String, Object> result = new HashMap<>();
		try {
			String sdate = params.get("sdate");
			String edate = params.get("edate");
			String factory = params.get("factory");

			List<Map<String, Object>> data = dashboardService.getFabricUsageData(sdate, edate, factory);

			result.put("success", true);
			result.put("data", data);
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
		}
		return result;
	}

	@PostMapping("/read_sales_out_dashboard")
	@ResponseBody
	public Map<String, Object> readSalesOutDashboard(@RequestBody Map<String, Object> req) {

		Map<String, Object> res = new HashMap<>();

		try {
			res.put("success", true);
			res.put("data", dashboardService.getSalesOutDashboard(req));
		} catch (Exception e) {
			res.put("success", false);
			res.put("message", e.getMessage());
		}

		return res;
	}

	@PostMapping("/read_sales_out_subcategory")
	@ResponseBody
	public Map<String, Object> readSalesOutSubCategory(@RequestBody Map<String, Object> req) {

		Map<String, Object> res = new HashMap<>();

		try {
			res.put("success", true);
			res.put("data", dashboardService.getSalesOutSubCategory(req));
		} catch (Exception e) {
			res.put("success", false);
			res.put("message", e.getMessage());
		}

		return res;
	}

	@PostMapping("/read_dashboard_vendorStockStatus")
	@ResponseBody
	public Map<String, Object> readDashboardVendorStockStatus(@RequestBody Map<String, Object> param) {
		Map<String, Object> result = new HashMap<>();

		try {
			Map<String, Object> dataMap = dashboardService.readDashboardVendorStockStatus(param);

			result.put("success", true);
			result.put("totalCount", dataMap.get("totalCount"));
			result.put("data", dataMap.get("data"));
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
			result.put("totalCount", 0);
			result.put("data", null);
		}

		return result;
	}

	@PostMapping("/read_dashboard_vehicleItemShipmentStatus")
	@ResponseBody
	public Map<String, Object> readDashboardVehicleItemShipmentStatus(@RequestBody Map<String, Object> req) {
		Map<String, Object> res = new HashMap<>();

		try {
			List<Map<String, Object>> data = dashboardService.getDashboardVehicleItemShipmentStatus(req);

			res.put("success", true);
			res.put("data", data);
			res.put("totalCount", data.size());
		} catch (Exception e) {
			e.printStackTrace();
			res.put("success", false);
			res.put("message", e.getMessage());
			res.put("data", new ArrayList<>());
			res.put("totalCount", 0);
		}

		return res;
	}

	@PostMapping("/read_dashboard_interfaceStatus")
	@ResponseBody
	public Map<String, Object> readDashboardInterfaceStatus(@RequestBody Map<String, Object> req) {

		Map<String, Object> res = new HashMap<>();

		try {
			List<Map<String, Object>> data = dashboardService.getDashboardInterfaceStatus(req);

			res.put("success", true);
			res.put("data", data);
			res.put("totalCount", data != null ? data.size() : 0);

		} catch (Exception e) {
			res.put("success", false);
			res.put("message", e.getMessage());
		}

		return res;
	}

	@PostMapping("/read_parts_requirement_biweekly_dashboard")
	@ResponseBody
	public Map<String, Object> readPartsRequirementBiweeklyDashboard(@RequestBody Map<String, Object> req) {
		Map<String, Object> res = new HashMap<>();

		try {
			res.put("success", true);
			res.put("data", dashboardService.getPartsRequirementBiweeklyDashboard(req));
		} catch (Exception e) {
			res.put("success", false);
			res.put("message", e.getMessage());
		}

		return res;
	}
		@PostMapping("/read_quality_dashboard_list_level1")
	public ResponseEntity<Map<String, Object>> readQualityDashboardListLevel1(
			@RequestBody Map<String, Object> paramMap) {

		Map<String, Object> response = new HashMap<>();

		try {
			List<Map<String, Object>> records = dashboardService.readQualityDashboardListLevel1(paramMap);
			response.put("success", true);
			response.put("records", records);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PostMapping("/read_quality_dashboard_list_level2")
	public ResponseEntity<Map<String, Object>> readQualityDashboardListLevel2(
			@RequestBody Map<String, Object> paramMap) {

		Map<String, Object> response = new HashMap<>();

		try {
			List<Map<String, Object>> records = dashboardService.readQualityDashboardListLevel2(paramMap);
			response.put("success", true);
			response.put("records", records);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PostMapping("/read_quality_dashboard_list_level3")
	public ResponseEntity<Map<String, Object>> readQualityDashboardListLevel3(
			@RequestBody Map<String, Object> paramMap) {

		Map<String, Object> response = new HashMap<>();

		try {
			List<Map<String, Object>> records = dashboardService.readQualityDashboardListLevel3(paramMap);
			response.put("success", true);
			response.put("records", records);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PostMapping("/read_quality_dashboard_list_level4")
	public ResponseEntity<Map<String, Object>> readQualityDashboardListLevel4(
			@RequestBody Map<String, Object> paramMap) {

		Map<String, Object> response = new HashMap<>();

		try {
			List<Map<String, Object>> records = dashboardService.readQualityDashboardListLevel4(paramMap);
			response.put("success", true);
			response.put("records", records);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	/* =========================
     * 품질 대시보드 메인
     * ========================= */
    @PostMapping("/read_quality_dashboard_main")
    public Map<String, Object> readQualityDashboardMain(@RequestBody Map<String, Object> req) {
        Map<String, Object> res = new HashMap<>();

        try {
            Map<String, Object> data = dashboardService.getQualityDashboardMain(req);

            res.put("success", true);
            res.put("summary", data.get("summary"));
            res.put("judgmentChart", data.get("judgmentChart"));
            res.put("responsibilityChart", data.get("responsibilityChart"));
            res.put("vendorChart", data.get("vendorChart"));
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }

        return res;
    }

    /**
     * 재고 대시보드(New) - 일자별 재고/입고/창고이동/출고 현황
     *
     * @param params { sdate, edate, factory, storage }
     * @return { success, data: { stock, inbound, move, outbound } }
     */
    @PostMapping("/read_wms_stock_daily_dashboard")
    @ResponseBody
    public Map<String, Object> readWmsStockDailyDashboard(@RequestBody Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> queryParams = new HashMap<>();
            queryParams.put("sdate",   params.get("sdate"));
            queryParams.put("edate",   params.get("edate"));
            queryParams.put("factory", params.get("factory"));
            queryParams.put("storage", params.get("storage"));

            Map<String, Object> data = dashboardService.getStockDailyDashboard(queryParams);
            result.put("success", true);
            result.put("data", data);
        } catch (Exception e) {
            log.error("재고 대시보드 일자별 조회 오류", e);
            result.put("success", false);
            result.put("message", "데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

}
