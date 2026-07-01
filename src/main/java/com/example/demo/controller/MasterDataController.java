package com.example.demo.controller;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
import org.springframework.web.multipart.MultipartFile;

@Controller
@Slf4j
@RestController
public class MasterDataController {

	@Autowired
	MasterDataService mService;

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

	@PostMapping("/userDelete")
	public int userDelete(@RequestBody List<Map<String, Object>> sList) {
		return mService.userDelete(sList);
	}

	@PostMapping("/read_users_access_init")
	public Map<String, Object> read_users_access_init (@RequestBody List<String> ids){
		return mService.read_users_access_init(ids);
	}

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
	@ResponseBody
	public Map<String, Object> save_productInfo_changed(@RequestBody Map<String, Object> body) {
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> records =
				(List<Map<String, Object>>) body.getOrDefault("records", Collections.emptyList());

		Map<String, Object> result = new HashMap<>();
		try {
			int updated = mService.save_productInfo_changed(records);
			result.put("success", true);
			result.put("updated", updated);
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
		}
		return result;
	}

	@PostMapping("/read_sequenceManagement")
	public Map<String, Object> read_sequenceManagement(@RequestBody Map<String, Object> params) {
		return mService.read_sequenceManagement(params);
	}

	@PostMapping("/upload_sequenceInfo")
	public ResponseEntity<?> upload_sequenceInfo(@RequestParam("file") MultipartFile file) {
		Map<String, Object> result = new HashMap<>();

		if (file == null || file.isEmpty()) {
			result.put("message", "업로드된 파일이 없습니다.");
			return ResponseEntity.badRequest().body(result);
		}

		String name = file.getOriginalFilename();
		if (name == null || !(name.toLowerCase().endsWith(".xlsx") || name.toLowerCase().endsWith(".xls"))) {
			result.put("message", "엑셀 파일 (.xlsx, .xls)만 업로드 가능합니다.");
			return ResponseEntity.badRequest().body(result);
		}

		try{
			int insertCount = mService.upload_sequenceInfo(file);
			result.put("insertCount", insertCount);
			return ResponseEntity.ok(result);
		} catch (IllegalArgumentException e){
			result.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(result);
		} catch (Exception e){
			e.printStackTrace();
			result.put("message", "서버 처리 중 오류가 발생했습니다");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
		}
	}
}








