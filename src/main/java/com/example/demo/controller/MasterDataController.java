package com.example.demo.controller;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.MasterDataService;
import com.example.demo.vo.BOMPageVO;
import com.example.demo.vo.CustomerVO;
import com.example.demo.vo.PalletVO;
import com.example.demo.vo.ProductPageVO;
import com.example.demo.vo.ProductVO;
import com.example.demo.vo.StockVO;
import com.example.demo.vo.UserInfoVO;
import com.example.demo.vo.WarehouseVO;

import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;

@Controller
@Slf4j
@RestController
public class MasterDataController {

	@Autowired
	MasterDataService mService;

//	@PostMapping("/read_user")
//	public List<UserInfoVO> read_user() {
//		List<UserInfoVO> userList = mService.readUser();
//
//		return userList;
//	}

	// 출고 반품 - detail
	@PostMapping("/read_userInfo")
	public ResponseEntity<Map<String, Object>> read_userInfo(@RequestBody Map<String, Object> requestData) {
		
		System.out.println(requestData);
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
			List<UserInfoVO> resultList = mService.read_userInfo(paramMap);
			int totalCount = mService.getUserInfoTotalCount(paramMap);

			// 응답 데이터 구성
			Map<String, Object> response = new HashMap<>();
			response.put("records", resultList);
			response.put("totalCount", totalCount);
			response.put("currentPage", page);
			response.put("totalPages", (int) Math.ceil((double) totalCount / itemsPerPage));

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "데이터 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

//	// 출고 반품 - detail
//	@PostMapping("/read_userInfo_all")
//	public ResponseEntity<List<Map<String, Object>>> read_loadReturnSummary_all(
//			@RequestBody Map<String, Object> requestData) {
//		Map<String, Object> searchParams = (Map<String, Object>) requestData.get("searchParams");
//
//		// 페이징 없이 전체 데이터 조회
//		List<Map<String, Object>> allData = mService.read_userInfo_all(searchParams);
//
//		return ResponseEntity.ok(allData);
//	}

	@PostMapping("/read_stock")
	public List<StockVO> read_stock() {
		List<StockVO> userList = mService.read_stock();

		return userList;
	}

	@PostMapping("/read_stock_summary")
	public List<StockVO> read_stock_summary(@RequestBody Map<String, Object> map) {
		log.info("" + map);
		List<StockVO> userList = mService.read_stock_summary(map);
		return userList;
	}

	@PostMapping("/read_product_paged")
	public ProductPageVO readProductPaged(@RequestBody Map<String, Object> requestData) {
		System.out.println("=== Controller 진입 ===");
		System.out.println("Request Data: " + requestData);

		try {
			// 파라미터 추출
			int page = (Integer) requestData.getOrDefault("page", 1);
			int pageSize = (Integer) requestData.getOrDefault("pageSize", 100);

			// 검색 조건 추출
			ProductVO searchVal = new ProductVO();
			if (requestData.containsKey("searchCriteria")) {
				Map<String, Object> searchParam = (Map<String, Object>) requestData.get("searchCriteria");
				searchVal.setItemtype((String) searchParam.get("itemtype"));
				searchVal.setCar((String) searchParam.get("car"));
				searchVal.setItemcode((String) searchParam.get("itemcode"));
				searchVal.setItemname((String) searchParam.get("itemname"));
				searchVal.setSpec((String) searchParam.get("spec"));
				searchVal.setOitemcode((String) searchParam.get("oitemcode"));
				searchVal.setOitemname((String) searchParam.get("oitemname"));
				searchVal.setSpec2((String) searchParam.get("spec2"));
				searchVal.setLabelcolor((String) searchParam.get("labelcolor"));
			}

			System.out.println("Controller -> Service 호출");
			System.out.println("Page: " + page + ", PageSize: " + pageSize);

			// Service 호출
			ProductPageVO result = mService.getProductsPaged(page, pageSize, searchVal);

			System.out.println("Service -> Controller 응답");
			System.out.println("Total Count: " + result.getTotalCount());
			System.out.println("Data Size: " + result.getData().size());

			return result;

		} catch (Exception e) {
			System.err.println("Controller 오류: " + e.getMessage());
			e.printStackTrace();
			throw new RuntimeException("제품 페이징 조회 실패", e);
		}
	}

//	@PostMapping("/read_inbound_ckd")
//	public List<ProductVO> read_inbound_ckd() {
//		List<ProductVO> ckdList = mService.readInboundCkd();
//
//		return ckdList;
//	}

//	@PostMapping("/read_pallet")
//	public List<PalletVO> read_pallet(HttpServletRequest request, @RequestParam Map<String, String> param) {
//		String startdate = request.getParameter("startdate");
//		String enddate = request.getParameter("enddate");
//		String icode = request.getParameter("itemcode");
//		String issue = request.getParameter("issue");
//		String partner = request.getParameter("partner");
//
//		Map<String, Object> map = new HashMap<>();
//		if (startdate == null || startdate.isEmpty()) {
//			LocalDate today = LocalDate.now();
//			String formatted = today.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));// 오늘 날짜
//			LocalDate firstDayOfMonth = today.withDayOfMonth(1);
//			String formatted2 = firstDayOfMonth.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));// 15일전 날짜
//			map.put("startdate", formatted2);
//			map.put("enddate", formatted);
//		} else {
//			map.put("startdate", startdate);
//			map.put("enddate", enddate);
//		}
//		map.put("cucode", "master");
//		map.put("itemcode", icode);
//		map.put("issue", issue);
//		map.put("partner", partner);
//		List<PalletVO> list = mService.readPallet(map);
//		return list;
//	}

	// 입고처리 - 입고내역 List
	@PostMapping("/read_palletList")
	public Map<String, Object> readPalletList(@RequestBody Map<String, Object> params) {
		return mService.readPalletList(params);
	}

	@PostMapping("/pprint_yn_up")
	@ResponseBody
	public int pprint_yn_up(HttpServletResponse response, HttpServletRequest request, String pbarcode) {
		int result = 0;
		String parcodeArr[] = pbarcode.split(";");
		List<String> pbarcodeList = Arrays.asList(parcodeArr);
		System.out.println("==> pbarcodeList: " + pbarcodeList);
		result = mService.pprintYnUp(pbarcodeList);
		return result;
	}

	@GetMapping("/pallet_label_A3_print")
	@ResponseBody
	public void pallet_label_A3_print(HttpServletResponse response, HttpServletRequest request,
			@RequestParam Map<String, String> param, String chk) {

		// 파일 있는 곳에 pdf 파일 만들어줌
		String templatePath = "";
		String destPath = "";
		templatePath = "/reportUSA/WB_Label_Pallet_A3.jrxml";
		destPath = "/reportUSA/WB_Label_Pallet_A3.pdf";

		String barcodeArr[] = request.getParameter("pbarcode").split(";");
		List<String> barcodeList = Arrays.asList(barcodeArr);
		String pbarcode = barcodeList.stream().map(s -> "'" + s + "'").collect(Collectors.joining(","));
		String qty = param.get("qty");

		Connection conn = null;
		try {

			System.out.println("들어옴1");

			JasperReport jasperReport = JasperCompileManager.compileReport(templatePath);

			System.out.println("들어옴2");

			Map<String, Object> paramMap = new HashMap<String, Object>();

			System.out.println("들어옴3");

			// 재스퍼로 넘길 파라미터
			paramMap.put("pbarcode", pbarcode);
			paramMap.put("qty", qty);
			// paramMap.put("qmemo", URLDecoder.decode(qmemo, "utf-8"));

			System.out.println("@@@@@@@@@@여기@@@@@@@@@@@@@");
			System.out.println(paramMap.toString());

			Class.forName("oracle.jdbc.driver.OracleDriver");
			conn = DriverManager.getConnection("jdbc:oracle:thin:@45.58.2.218:1521:WBUSA", "wbusa", "woobo23300usa");
			response.setContentType("application/pdf");
			response.setHeader("Content-Disposition", "inline; filename=Pallet_A3.pdf");

			JasperPrint print = JasperFillManager.fillReport(jasperReport, paramMap, conn);
			JasperExportManager.exportReportToPdfStream(print, response.getOutputStream());

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (conn.isClosed() == false) {
					conn.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

	}

	@GetMapping("/pallet_del")
	@ResponseBody
	public int mng_pallet_del(HttpServletResponse response, HttpServletRequest request, String pbarcode) {
		int result = 0;
		result = mService.palletDel(pbarcode);
		return result;
	}

	@RequestMapping(value = "pallet_delAll")
	public void mng_pallet_delAll(HttpServletRequest request, @RequestParam Map<String, String> param,
			@RequestParam(value = "delList[]") List<String> chArr) throws SQLException {
		System.out.println("delAll 컨트롤러");

		int result = 0;
		String barNum = "";

		for (String i : chArr) {
			barNum = i;
			mService.palletDel(i);
		}

	}

	@PostMapping("/read_outbound")
	public List<ProductVO> read_outbound() {
		List<ProductVO> list = mService.readOutbound();

		return list;
	}

	@PostMapping("/read_customer")
	public List<CustomerVO> read_customer() {
		List<CustomerVO> customerList = mService.readCustomer();

		return customerList;
	}

	@PostMapping("/read_warehouse")
	public List<WarehouseVO> read_warehouse() {
		List<WarehouseVO> warehouseList = mService.readWarehouse();

		return warehouseList;
	}

	@PostMapping("/read_bom")
	public List<ProductVO> read_bom() {
		List<ProductVO> bomList = mService.readBom();

		return bomList;
	}

	@PostMapping("/read_bom_paged")
	public BOMPageVO readBomPaged(@RequestBody Map<String, Object> requestData) {
		System.out.println("=== BOM Controller 진입 ===");
		System.out.println("Request Data: " + requestData);

		try {
			// 파라미터 추출
			int page = (Integer) requestData.getOrDefault("page", 1);
			int pageSize = (Integer) requestData.getOrDefault("pageSize", 100);

			// 🔥 변경: BOM 검색 조건 추출
			ProductVO searchVal = new ProductVO();
			if (requestData.containsKey("searchCriteria")) {
				Map<String, Object> searchParam = (Map<String, Object>) requestData.get("searchCriteria");
				searchVal.setSubname((String) searchParam.get("subname"));
				searchVal.setItemcode((String) searchParam.get("itemcode"));
				searchVal.setItemname((String) searchParam.get("itemname"));
				searchVal.setSpec((String) searchParam.get("spec"));
				searchVal.setCondate((String) searchParam.get("condate"));
			}

			System.out.println("Controller -> Service 호출");
			System.out.println("Page: " + page + ", PageSize: " + pageSize);

			// 🔥 변경: BOM Service 호출
			BOMPageVO result = mService.getBomsPaged(page, pageSize, searchVal);

			System.out.println("Service -> Controller 응답");
			System.out.println("Total Count: " + result.getTotalCount());
			System.out.println("Data Size: " + result.getData().size());

			return result;

		} catch (Exception e) {
			System.err.println("BOM Controller 오류: " + e.getMessage());
			e.printStackTrace();
			throw new RuntimeException("BOM 페이징 조회 실패", e);
		}
	}

	@PostMapping("/insert_warehouse")
	public int insert_warehouse(@RequestBody Map<String, Object> insertParam) {
		return mService.insertWarehouse(insertParam);
	}

	@PostMapping("/update_warehouse")
	public int update_warehouse(@RequestBody Map<String, Object> updateParam) {
		return mService.updateWarehouse(updateParam);
	}

	@PostMapping("/delete_warehouse")
	public int delete_warehouse(@RequestBody List<String> iidList) {
		return mService.deleteWarehouse(iidList);
	}

	// 창고 라벨 발행
	@PostMapping("/WarehouseLabel")
	public void WarehouseLabel(HttpServletResponse response, @RequestParam("iidList") String iidStr) {
		System.out.println("===== Jasper labal print Start =====");
		Map<String, Object> paramMap = new HashMap<String, Object>();
		Connection conn = null;

		System.out.println("발행 할 iid 목록 : " + iidStr);

		// 대괄호 제거
		iidStr = iidStr.replaceAll("\\[|\\]", "");
		paramMap.put("iid", iidStr);

		try {
			String jasperPath = "/reportUSA/WB_Label_Warehouse.jrxml";
			JasperReport jasperReport = JasperCompileManager.compileReport(jasperPath);

			Class.forName("oracle.jdbc.driver.OracleDriver");
			conn = DriverManager.getConnection("jdbc:oracle:thin:@45.58.2.218:1521:WBUSA", "wbusa", "woobo23300usa");
			response.setContentType("application/pdf");
			response.setHeader("Content-Disposition", "inline; filename=Warehouse.pdf");

			JasperPrint print = JasperFillManager.fillReport(jasperReport, paramMap, conn);
			JasperExportManager.exportReportToPdfStream(print, response.getOutputStream());

		} catch (Exception e) {
			e.printStackTrace();
		}

		System.out.println("===== Jasper labal print End =====");
	}

	@PostMapping("/userAccess")
	public Map<String, Object> userAccess(@RequestBody List<Map<String, Object>> sList) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			mService.userAccess(sList);
			result.put("success", true);
			result.put("message", "Completed Successfully.");
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
		}

		return result;
	}
	
	@PostMapping("/userDelete")
	public int userDelete(@RequestBody List<Map<String, Object>> sList) {
		return mService.userDelete(sList);
	}

	@PostMapping("/userBlock")
	public Map<String, Object> userBlock(@RequestBody List<Map<String, Object>> sList) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			mService.userBlock(sList);
			result.put("success", true);
			result.put("message", "Completed Successfully.");
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
		}

		return result;
	}

	@GetMapping("/pallet_label_A4")
	@ResponseBody
	public void pallet_label_A4x2(HttpServletResponse response, HttpServletRequest request,
			@RequestParam Map<String, String> param, String chk) {

		// 파일 있는 곳에 pdf 파일 만들어줌
		String templatePath = "";
		String destPath = "";
		templatePath = "/reportUSA/WB_Label_Pallet_A4_double.jrxml";
		destPath = "/reportUSA/WB_Label_Pallet_A4_double.pdf";

		String barcodeArr[] = request.getParameter("pbarcode").split(";");
		List<String> barcodeList = Arrays.asList(barcodeArr);
		String pbarcode = barcodeList.stream().map(s -> "'" + s + "'").collect(Collectors.joining(","));
		String qty = param.get("qty");

		Connection conn = null;
		try {

			System.out.println("들어옴1");

			JasperReport jasperReport = JasperCompileManager.compileReport(templatePath);

			System.out.println("들어옴2");

			Map<String, Object> paramMap = new HashMap<String, Object>();

			System.out.println("들어옴3");

			// 재스퍼로 넘길 파라미터
			paramMap.put("pbarcode", pbarcode);
			paramMap.put("qty", qty);
			// paramMap.put("qmemo", URLDecoder.decode(qmemo, "utf-8"));

			System.out.println("@@@@@@@@@@여기@@@@@@@@@@@@@");
			System.out.println(paramMap.toString());

			Class.forName("oracle.jdbc.driver.OracleDriver");
			conn = DriverManager.getConnection("jdbc:oracle:thin:@45.58.2.218:1521:WBUSA", "wbusa", "woobo23300usa");
			response.setContentType("application/pdf");
			response.setHeader("Content-Disposition", "inline; filename=Pallet_A4.pdf");

			JasperPrint print = JasperFillManager.fillReport(jasperReport, paramMap, conn);
			JasperExportManager.exportReportToPdfStream(print, response.getOutputStream());

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (conn.isClosed() == false) {
					conn.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

	}

	@GetMapping("/pallet_label_A4_fabric")
	@ResponseBody
	public void pallet_label_A4_fabric(HttpServletResponse response, HttpServletRequest request,
			@RequestParam Map<String, String> param, String chk) {

		// 파일 있는 곳에 pdf 파일 만들어줌
		String templatePath = "";
		String destPath = "";
		templatePath = "/reportUSA/WB_Label_Pallet_A4_fabric.jrxml";
		destPath = "/reportUSA/WB_Label_Pallet_A4_fabric.pdf";

		String barcodeArr[] = request.getParameter("pbarcode").split(";");
		List<String> barcodeList = Arrays.asList(barcodeArr);
		String pbarcode = barcodeList.stream().map(s -> "'" + s + "'").collect(Collectors.joining(","));
		String qty = param.get("qty");

		Connection conn = null;
		try {

			JasperReport jasperReport = JasperCompileManager.compileReport(templatePath);

			Map<String, Object> paramMap = new HashMap<String, Object>();

			// 재스퍼로 넘길 파라미터
			paramMap.put("pbarcode", pbarcode);
			paramMap.put("qty", qty);
			// paramMap.put("qmemo", URLDecoder.decode(qmemo, "utf-8"));

			System.out.println("@@@@@@@@@@여기@@@@@@@@@@@@@");
			System.out.println(paramMap.toString());

			Class.forName("oracle.jdbc.driver.OracleDriver");
			conn = DriverManager.getConnection("jdbc:oracle:thin:@45.58.2.218:1521:WBUSA", "wbusa", "woobo23300usa");
			response.setContentType("application/pdf");
			response.setHeader("Content-Disposition", "inline; filename=Pallet_A4_fabric.pdf");

			JasperPrint print = JasperFillManager.fillReport(jasperReport, paramMap, conn);
			JasperExportManager.exportReportToPdfStream(print, response.getOutputStream());

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (conn.isClosed() == false) {
					conn.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

	}

	@GetMapping("/pallet_label_A4_fabric_puebla")
	@ResponseBody
	public void pallet_label_A4_fabric_puebla(HttpServletResponse response, HttpServletRequest request,
			@RequestParam Map<String, String> param, String chk) {
		
		// 파일 있는 곳에 pdf 파일 만들어줌
		String templatePath = "";
		String destPath = "";
		templatePath = "/reportUSA/WB_Label_Pallet_A4_fabric_puebla.jrxml";
		destPath = "/reportUSA/WB_Label_Pallet_A4_fabric_puebla.pdf";
		
		String barcodeArr[] = request.getParameter("pbarcode").split(";");
		List<String> barcodeList = Arrays.asList(barcodeArr);
		String pbarcode = barcodeList.stream().map(s -> "'" + s + "'").collect(Collectors.joining(","));
		String qty = param.get("qty");
		
		Connection conn = null;
		try {
			
			JasperReport jasperReport = JasperCompileManager.compileReport(templatePath);
			
			Map<String, Object> paramMap = new HashMap<String, Object>();
			
			// 재스퍼로 넘길 파라미터
			paramMap.put("pbarcode", pbarcode);
			paramMap.put("qty", qty);
			// paramMap.put("qmemo", URLDecoder.decode(qmemo, "utf-8"));
			
			System.out.println("@@@@@@@@@@여기@@@@@@@@@@@@@");
			System.out.println(paramMap.toString());
			
			Class.forName("oracle.jdbc.driver.OracleDriver");
			conn = DriverManager.getConnection("jdbc:oracle:thin:@45.58.2.218:1521:WBUSA", "wbusa", "woobo23300usa");
			response.setContentType("application/pdf");
			response.setHeader("Content-Disposition", "inline; filename=Pallet_A4_fabric_puebla.pdf");
			
			JasperPrint print = JasperFillManager.fillReport(jasperReport, paramMap, conn);
			JasperExportManager.exportReportToPdfStream(print, response.getOutputStream());
			
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (conn.isClosed() == false) {
					conn.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		
	}
	
	// 영업대라벨(영업이송)
	@GetMapping("/boxlabel")
	@ResponseBody
	public void boxlabel(HttpServletResponse response, HttpServletRequest request,
			@RequestParam Map<String, String> param, String chk) {

		// 파일 있는 곳에 pdf 파일 만들어줌
		String templatePath = "";
		String destPath = "";
		templatePath = "/reportUSA/WB_LABEL_Boxlabel.jrxml";
		destPath = "/reportUSA/WB_LABEL_Boxlabel.pdf";
		System.out.println("templatePath : "+templatePath);

//		String barcodeArr[] = request.getParameter("pbarcode").split(",");
//		List<String> barcodeList = Arrays.asList(barcodeArr);
//		String pbarcode = barcodeList.stream().map(s -> "'" + s + "'").collect(Collectors.joining(","));
		String iid = param.get("iid");

		Connection conn = null;
		try {

			System.out.println("들어옴1");

			JasperReport jasperReport = JasperCompileManager.compileReport(templatePath);

			System.out.println("들어옴2");

			Map<String, Object> paramMap = new HashMap<String, Object>();

			System.out.println("들어옴3");

			// 재스퍼로 넘길 파라미터
			//paramMap.put("pbarcode", pbarcode);
			paramMap.put("IID", iid);
			// paramMap.put("qmemo", URLDecoder.decode(qmemo, "utf-8"));

			System.out.println("@@@@@@@@@@여기@@@@@@@@@@@@@");
			System.out.println(paramMap.toString());

			Class.forName("oracle.jdbc.driver.OracleDriver");
			conn = DriverManager.getConnection("jdbc:oracle:thin:@45.58.2.218:1521:WBUSA", "wbusa", "woobo23300usa");
			response.setContentType("application/pdf");
			response.setHeader("Content-Disposition", "inline; filename=Pallet_A4.pdf");

			JasperPrint print = JasperFillManager.fillReport(jasperReport, paramMap, conn);
			JasperExportManager.exportReportToPdfStream(print, response.getOutputStream());

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (conn.isClosed() == false) {
					conn.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

	}
	
	// 영업대라벨(재고)
	@GetMapping("/boxlabelstock")
	@ResponseBody
	public void boxlabelstock(HttpServletResponse response, HttpServletRequest request,
			@RequestParam Map<String, String> param, String chk) {
		
		// 파일 있는 곳에 pdf 파일 만들어줌
		String templatePath = "";
		String destPath = "";
		templatePath = "/reportUSA/WB_LABEL_Boxlabel_Stock.jrxml";
		destPath = "/reportUSA/WB_LABEL_Boxlabel_Stock.pdf";
		System.out.println("templatePath : "+templatePath);
		
//		String barcodeArr[] = request.getParameter("pbarcode").split(",");
//		List<String> barcodeList = Arrays.asList(barcodeArr);
//		String pbarcode = barcodeList.stream().map(s -> "'" + s + "'").collect(Collectors.joining(","));
		String iid = param.get("iid");
		
		Connection conn = null;
		try {
			
			System.out.println("들어옴1");
			
			JasperReport jasperReport = JasperCompileManager.compileReport(templatePath);
			
			System.out.println("들어옴2");
			
			Map<String, Object> paramMap = new HashMap<String, Object>();
			
			System.out.println("들어옴3");
			
			// 재스퍼로 넘길 파라미터
			//paramMap.put("pbarcode", pbarcode);
			paramMap.put("IID", iid);
			// paramMap.put("qmemo", URLDecoder.decode(qmemo, "utf-8"));
			
			System.out.println("@@@@@@@@@@여기@@@@@@@@@@@@@");
			System.out.println(paramMap.toString());
			
			Class.forName("oracle.jdbc.driver.OracleDriver");
			conn = DriverManager.getConnection("jdbc:oracle:thin:@45.58.2.218:1521:WBUSA", "wbusa", "woobo23300usa");
			response.setContentType("application/pdf");
			response.setHeader("Content-Disposition", "inline; filename=Pallet_A4.pdf");
			
			JasperPrint print = JasperFillManager.fillReport(jasperReport, paramMap, conn);
			JasperExportManager.exportReportToPdfStream(print, response.getOutputStream());
			
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (conn.isClosed() == false) {
					conn.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		
	}
	// 영업대라벨(영업이송), 리포트라벨 테스트용
		@GetMapping("/boxlabeltest")
		@ResponseBody
		public void boxlabelTest(HttpServletResponse response, HttpServletRequest request,
				@RequestParam Map<String, String> param, String chk) {

			// 파일 있는 곳에 pdf 파일 만들어줌
			String templatePath = "";
			String destPath = "";
			templatePath = "/reportUSA/WB_LABEL_Boxlabel_TEST.jrxml";
			destPath = "/reportUSA/WB_LABEL_Boxlabel_TEST.pdf";
			System.out.println("templatePath : "+templatePath);

//			String barcodeArr[] = request.getParameter("pbarcode").split(",");
//			List<String> barcodeList = Arrays.asList(barcodeArr);
//			String pbarcode = barcodeList.stream().map(s -> "'" + s + "'").collect(Collectors.joining(","));
			String iid = param.get("iid");

			Connection conn = null;
			try {

				System.out.println("들어옴1");

				JasperReport jasperReport = JasperCompileManager.compileReport(templatePath);

				System.out.println("들어옴2");

				Map<String, Object> paramMap = new HashMap<String, Object>();

				System.out.println("들어옴3");

				// 재스퍼로 넘길 파라미터
				//paramMap.put("pbarcode", pbarcode);
				paramMap.put("IID", iid);
				// paramMap.put("qmemo", URLDecoder.decode(qmemo, "utf-8"));

				System.out.println("@@@@@@@@@@여기@@@@@@@@@@@@@");
				System.out.println(paramMap.toString());

				Class.forName("oracle.jdbc.driver.OracleDriver");
				conn = DriverManager.getConnection("jdbc:oracle:thin:@45.58.2.218:1521:WBUSA", "wbusa", "woobo23300usa");
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=Pallet_A4.pdf");

				JasperPrint print = JasperFillManager.fillReport(jasperReport, paramMap, conn);
				JasperExportManager.exportReportToPdfStream(print, response.getOutputStream());

			} catch (Exception e) {
				e.printStackTrace();
			} finally {
				try {
					if (conn.isClosed() == false) {
						conn.close();
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}

		}
		
		// 영업대라벨(재고)
		@GetMapping("/boxlabelstocktest")
		@ResponseBody
		public void boxlabelstockTest(HttpServletResponse response, HttpServletRequest request,
				@RequestParam Map<String, String> param, String chk) {
			
			// 파일 있는 곳에 pdf 파일 만들어줌
			String templatePath = "";
			String destPath = "";
			templatePath = "/reportUSA/WB_LABEL_Boxlabel_Stock_TEST.jrxml";
			destPath = "/reportUSA/WB_LABEL_Boxlabel_Stock_TEST.pdf";
			System.out.println("templatePath : "+templatePath);
			
//			String barcodeArr[] = request.getParameter("pbarcode").split(",");
//			List<String> barcodeList = Arrays.asList(barcodeArr);
//			String pbarcode = barcodeList.stream().map(s -> "'" + s + "'").collect(Collectors.joining(","));
			String iid = param.get("iid");
			
			Connection conn = null;
			try {
				
				System.out.println("들어옴1");
				
				JasperReport jasperReport = JasperCompileManager.compileReport(templatePath);
				
				System.out.println("들어옴2");
				
				Map<String, Object> paramMap = new HashMap<String, Object>();
				
				System.out.println("들어옴3");
				
				// 재스퍼로 넘길 파라미터
				//paramMap.put("pbarcode", pbarcode);
				paramMap.put("IID", iid);
				// paramMap.put("qmemo", URLDecoder.decode(qmemo, "utf-8"));
				
				System.out.println("@@@@@@@@@@여기@@@@@@@@@@@@@");
				System.out.println(paramMap.toString());
				
				Class.forName("oracle.jdbc.driver.OracleDriver");
				conn = DriverManager.getConnection("jdbc:oracle:thin:@45.58.2.218:1521:WBUSA", "wbusa", "woobo23300usa");
				response.setContentType("application/pdf");
				response.setHeader("Content-Disposition", "inline; filename=Pallet_A4.pdf");
				
				JasperPrint print = JasperFillManager.fillReport(jasperReport, paramMap, conn);
				JasperExportManager.exportReportToPdfStream(print, response.getOutputStream());
				
			} catch (Exception e) {
				e.printStackTrace();
			} finally {
				try {
					if (conn.isClosed() == false) {
						conn.close();
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
			
		}
	
	@PostMapping("/read_modal_user_access")
	public Map<String, Object> read_modal_user_access(@RequestBody Map<String, Object> param){
		return mService.read_modal_user_access(param);
	}
	
//	@PostMapping("/read_users_access")
//	public Map<String, Object> read_users_access (@RequestBody List<String> param){
//		return mService.read_users_access(param);
//	}
	
	@PostMapping("/read_users_access_init")
	public Map<String, Object> read_users_access_init (@RequestBody List<String> ids){
		return mService.read_users_access_init(ids);
	}
	
//	@PostMapping("/update_user_menu_access")
//	public int update_user_menu_access(@RequestBody Map<String, Object> param) {
//		System.out.println(param);
//		return mService.update_user_menu_access(param);
//	}
	
	@PostMapping("/update_user_menu_access")
	public int update_user_menu_access(@RequestBody Map<String, Object> param) {
		System.out.println(param);
		return mService.update_user_menu_access(param);
	}
	
	// 메인메뉴 로딩할때 메뉴 제어
	@PostMapping("/view_main_menu_user_access")
	public List<String> view_main_menu_user_access(@RequestBody String id){
		return mService.view_main_menu_user_access(id);
	}
	
	//사용자 추가전 유효성 체크
	@PostMapping("/check_wms_account")
	public int check_wms_account(@RequestBody Map<String, Object> param) {
		return mService.check_wms_account(param);
	}
	
	//사용자 추가
	@PostMapping("/insert_user_account")
	public int insert_user_account(@RequestBody Map<String, Object> param) {
		return mService.insert_user_account(param);
	}
	
	//비밀번호 수정
	@PostMapping("/update_user_pass")
	public int update_user_pass(@RequestBody Map<String, Object> param) {
		return mService.update_user_pass(param);
	}
	
	//공장 권한 지정
	@PostMapping("/update_user_factory_access")
	public int update_user_factory_access(@RequestBody Map<String, Object> param) {
		return mService.update_user_factory_access(param);
	}
	
	// 부서 변경
	@PostMapping("/update_user_department")
	public int update_user_department(@RequestBody Map<String, Object> param) {
		return mService.update_user_department(param);
	}

	// 공장 변경
	@PostMapping("/update_user_factory")
	public int update_user_factory(@RequestBody Map<String, Object> param) {
		return mService.update_user_factory(param);
	}
	
	
	
	
	
	// 기초자료 - 풀번정보
	@PostMapping("/read_itemMaster")
	public Map<String, Object> read_itemMaster(@RequestBody Map<String, Object> params) {
		return mService.read_itemMaster(params);
	}
	
	
	@GetMapping("/read_magam")
	public Map<String, Object> read_magam(){
		List<Map<String, Object>> list = mService.read_magam();
		
		Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("list", list);
        return result;
    }
	
	@PostMapping("/magamClose")
	public Map<String, Object> magamClose(@RequestBody Map<String, Object> param) {
        int count = mService.magamClose(param);

        Map<String, Object> result = new HashMap<>();
        result.put("success", count > 0);
        result.put("month", param.get("month"));
        return result;
    }
	
	@PostMapping("/magamCancel")
    public Map<String, Object> magamCancel(@RequestBody Map<String, Object> param) {
        int count = mService.magamCancel(param);

        Map<String, Object> result = new HashMap<>();
        result.put("success", count > 0);
        result.put("month", param.get("month"));
        return result;
    }
	
	
	// 사용자 정보 가져오기
	@GetMapping("/getUserInfo")
	@ResponseBody
	public Map<String, Object> getUserInfo(@RequestParam("id") String id){		
		return mService.getUserInfo(id);
	}	
	
	// 사용자 정보 업데이트
	@PostMapping("/updateUserInfo")
	public ResponseEntity<Map<String, Object>> updateUserInfo(
	        @RequestBody Map<String, Object> params) {

	    Map<String, Object> result = new HashMap<>();

	    mService.updateUserInfo(params);
	    result.put("success", true);
	    result.put("message", "저장되었습니다.");
//	    try {
//	    	mService.updateUserInfo(params);
//	    	result.put("success", true);
//	    	result.put("message", "저장되었습니다.");
//	    } catch (Exception e) {
//	        e.printStackTrace();
//	        result.put("success", false);
//	        result.put("message", "저장 중 오류가 발생했습니다.");
//	    }

	    return ResponseEntity.ok(result);
	}
	
	// 비밀번호 변경
	@PostMapping("/updateUserPassword")
	public Map<String, Object> updateUserPassword(@RequestBody Map<String, Object> params) {
		Map<String, Object> res = new HashMap<>();
	    try {
	        mService.updateUserPassword(params);
	        res.put("success", true);
	        return res;
	    } catch (IllegalArgumentException e) {
	        res.put("success", false);
	        res.put("message", e.getMessage());
	        return res;
	    } catch (Exception e) {
	        res.put("success", false);
	        res.put("message", "서버 오류가 발생했습니다.");
	        return res;
	    }
	}

	
	@PostMapping("/read_productInfo")
	public Map<String, Object> read_productInfo(@RequestBody Map<String, Object> params) {
		return mService.read_productInfo(params);
	}

	
	@PostMapping("/save_productInfo_changed")
	public void saveProductInfoChanged(@RequestBody Map<String, Object> body) {
	    try {
	        @SuppressWarnings("unchecked")
	        List<Map<String, Object>> records = (List<Map<String, Object>>) body.get("records");
	        
	        int updated = mService.save_productInfo_changed(records);
	    } catch (Exception e) {
	    	e.getMessage();
	    }
	}


	@PostMapping("/read_consignee")
	public Map<String, Object> read_consignee(){
		return mService.read_consignee();
	}
	
	@PostMapping("/create_consignee")
	public int create_consignee(@RequestBody Map<String, Object> params){
		return mService.create_consignee(params);
	}
	
	@PostMapping("/update_consignee")
	public int update_consignee(@RequestBody Map<String, Object> params) {
		return mService.update_consignee(params);
	}
	
	@PostMapping("/delete_consignee")
	public int delete_consignee(@RequestBody Map<String, Object> params) {
		return mService.delete_consignee(params);
	}
	
	
	@GetMapping("/read_lastDay")
	public Map<String, Object> read_lastDay(){
		return mService.read_lastDay();
	}
	
	@PostMapping("/setLastDay")
	public int setLastDay(@RequestBody Map<String, Object> params) {
		return mService.setLastDay(params);
	}
	
	@PostMapping("/updateLastDay")
	public int updateLastDay(@RequestBody Map<String, Object> params){
		return mService.updateLastDay(params);
	}
}








