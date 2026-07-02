package com.example.demo.service;

import java.io.InputStream;
import java.lang.reflect.Executable;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.example.demo.mapper.wbpt.WbBasicMapper;
import org.apache.ibatis.session.ExecutorType;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.poi.ss.usermodel.*;
import org.jfree.util.HashNMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.vo.ProductVO;
import com.example.demo.vo.UserInfoVO;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MasterDataServiceImpl implements MasterDataService {

	@Autowired
	@Qualifier("wbptSqlSessionFactory")
	SqlSessionFactory sqlSessionFactory;

	@Autowired
	WbBasicMapper basicMapper;

	@Override
	public int userDelete(List<Map<String, Object>> sList) {

		int insertCount = 0;

		System.out.println("-- PARAM --  SERVICE");
		for (int i = 0; i < sList.size(); i++) {
			Map<String, Object> param = sList.get(i);
			insertCount += basicMapper.userDelete(param);
//			insertCount += basicMapper.userDelete_menuAccess(param);
		}

		return insertCount;
	}

	// 사용자 조회
	@Override
	public List<UserInfoVO> read_userInfo(Map<String, Object> paramMap) {
		try {
			return basicMapper.read_userInfo(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("공장 이동 목록 조회 실패", e);
		}
	}

	@Override
	public int getUserInfoTotalCount(Map<String, Object> paramMap) {
		try {
			return basicMapper.getUserInfoTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("공장 이동 총 개수 조회 실패", e);
		}
	}

	@Override
	public Map<String, Object> read_users_access_init(List<String> ids){
		// ✅ 정리(중복 제거 + trim)
        List<String> userIds = normalizeIds(ids);
        int totalCnt = userIds.size();

        // 1) roles (+ assigned count)
        Map<String, Object> p = new HashMap<>();
        p.put("list", userIds);
        p.put("totalCnt", totalCnt);

        List<Map<String, Object>> roles = basicMapper.read_roles_for_users(p);

        // 2) roleMenus (roles에서 roleId 뽑아 1번에)
        List<String> roleIds = new ArrayList<>();
        for (Map<String, Object> r : roles) {
            Object rid = r.get("ROLE_ID");
            if (rid == null) rid = r.get("role_id");
            if (rid == null) continue;
            String s = String.valueOf(rid).trim();
            if (!s.isEmpty()) roleIds.add(s);
        }

        List<Map<String, Object>> roleMenus =
                roleIds.isEmpty() ? Collections.emptyList() : basicMapper.read_role_menus(roleIds);

        // 3) userMenus (선택 사용자들의 현재 권한 상태 Y/N/M 집계)
        List<Map<String, Object>> userMenus = basicMapper.read_users_effective_menu_state(userIds);

        Map<String, Object> res = new HashMap<>();
        res.put("roles", roles);
        res.put("roleMenus", roleMenus);
        res.put("userMenus", userMenus);
        return res;
	}
	
	private List<String> normalizeIds(List<String> ids) {
        if (ids == null) return Collections.emptyList();

        List<String> out = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (String x : ids) {
            if (x == null) continue;
            String v = x.trim();
            if (v.isEmpty()) continue;

            String key = v.toUpperCase();
            if (seen.add(key)) out.add(v);
        }
        return out;
    }

	@Override
	@SuppressWarnings("unchecked")
	@Transactional
	public int update_user_menu_access(Map<String, Object> param) {
		// {userIds=[test2], finalRoles=[SALES], isManager=false, overrideAdded=[], overrideRemoved=[]}
		int totalUpdated = 0;
		
		try {
			// 파라미터 파싱
			List<String> userIds = (List<String>) param.get("userIds");
			List<String> finalRoles = (List<String>) param.get("finalRoles");
			boolean isManager = (boolean) param.get("isManager");
			List<String> overrideAdded = (List<String>) param.get("overrideAdded");
			List<String> overrideRemoved = (List<String>) param.get("overrideRemoved");
			// 각 사용자 별 처리
			for(String userId : userIds) {
				// MANAGER일 경우
				if (isManager) {
					totalUpdated += handleManagerRole(userId);
					
					// 역할에 포함된 예외 삭제
					totalUpdated += cleanupRedundantOverrides(userId);
					
					// 예외 INSERT
	                totalUpdated += handleOverrides(userId, overrideAdded, overrideRemoved);
					continue;		// MANAGER는 여기서 종료
				}
				
				// 일반 역할인 경우
				totalUpdated += handleNormalRoles(userId, finalRoles);
				
				// 역할에 포함된 예외 삭제
				totalUpdated += cleanupRedundantOverrides(userId);
				
				// 예외 INSERT
                totalUpdated += handleOverrides(userId, overrideAdded, overrideRemoved);

			}
		} catch (Exception e) {

            e.printStackTrace();
            throw new RuntimeException("권한 업데이트 중 오류 발생: " + e.getMessage());
        }
        
        return totalUpdated;
	}
	
	private int handleManagerRole(String userId) {		
		int count = 0;
		
		// Manager 역할 외 전부 N 처리
        Map<String, Object> map = new HashMap<>();
        map.put("userId", userId);
        count += basicMapper.updateOtherRolesN(map);
		
        // Manager 역할 추가 또는 활성화
        count += basicMapper.mergeManager(map);
//		
//        // 기초자료를 제외한 나머지 OVERRIDE 삭제
//        count += basicMapper.deleteOverride(map);
		
		// 모든 예외 삭제
		
		return count;
	}
	
	private int handleNormalRoles(String userId, List<String> finalRoles) {		
		int count = 0;
		
		// 활성화된 역할 조회
		Map<String, Object> map = new HashMap<>();
		map.put("userId", userId);
		List<String> existingRoles = basicMapper.getRolesY(map);
		
		// finalRoles에 없는 역할은 N 처리
		for (String existingRole : existingRoles) {
			if (!finalRoles.contains(existingRole)) {
				map.put("roleId", existingRole);
				count += basicMapper.updateUserRolesN(map);
			}
		}
		
		// finalRoles 모두 추가 / 활성화
		for (String roleId : finalRoles) {
			map.put("roleId", roleId);
			count += basicMapper.mergeUserRole(map);
		}
		
		return count;
	}
	
	private int cleanupRedundantOverrides(String userId) {
		int count = 0;
		
		// 활성화된 역할 조회 
		Map<String, Object> map = new HashMap<>();
		map.put("userId", userId);
		List<String> activeRoles = basicMapper.getRolesY(map);		
		if (activeRoles == null || activeRoles.isEmpty()) return 0;
		
		// 역할에 포함된 모든 메뉴 조회
		Map<String, Object> map2 = new HashMap<>();
		map2.put("roleIds", activeRoles);
		List<String> roleMenus = basicMapper.getRoleMenus(map2);		
		if (roleMenus == null || roleMenus.isEmpty()) return 0;
		
		// 해당 메뉴들의 OVERRIDE 삭제
		map.put("menuCodes", roleMenus);
		count += basicMapper.deleteOverrideMenus(map);
		
		return count;
	}
	
	private int handleOverrides(String userId, List<String> overrideAdded, List<String> overrideRemoved) {
		int count = 0;
		
		// 역할 외 추가된 메뉴 -> Y
		for (String menuCode : overrideAdded) {
			Map<String, Object> map = new HashMap<>();
			map.put("userId", userId);
			map.put("menuCode", menuCode);
			count += basicMapper.mergeOverrideY(map);
		}
		
		// 역할 외 제외된 메뉴 -> N
		for (String menuCode : overrideRemoved) {
			Map<String, Object> map = new HashMap<>();
			map.put("userId", userId);
			map.put("menuCode", menuCode);
			count += basicMapper.mergeOverrideN(map);
		}
		
		return count;
	}
	
	@Override
	public List<String> view_main_menu_user_access(String id) {
		return basicMapper.view_main_menu_user_access(id);
	}

	@Override
	public int check_wms_account(Map<String, Object> param) {
		return basicMapper.check_wms_account(param);
	}

	@Override
	public int insert_user_account(Map<String, Object> param) {
		int insertCount = 0;

		// 해당 사번이 메뉴 권한이 지정되어있는지 체크.
		// 있으면 해당 권한을 이어서 부여받고 없을시 전부 비활성 상태로 새로만들어준다
		// 사용자 삭제할때마다 권한도 새로만들기는 하나. 기존에있던 저장정보가 재대로 삭제가 안되거나 할시
		// Pk 로 걸려있는 sabun 은 무결성 제약조건 오류가 난다.
		// 이미 데이터를 복사 떠서 권한테이블이 만들어졌기때문에 오류 방지 차원에서 필요하다.

//		int accessCheck = basicMapper.user_menu_accessCheck(param);
//		if (accessCheck != 1) {
//			insertCount += basicMapper.insert_user_account_menu_access(param);
//		}

		insertCount += basicMapper.insert_user_account(param);
		return insertCount;
	}

	@Override
	public int update_user_pass(Map<String, Object> param) {
		String id = String.valueOf(param.get("id"));
		String curPw = String.valueOf(param.get("curPw"));
		int insertCount = 0;
		
		String dbPw = basicMapper.selectUserPassword(id);
		if(!dbPw.equals(curPw)) {
            return -1;
        }
		
		// int validationCheck = basicMapper.update_user_validationCheck(param);
		// if(validationCheck != 1) {
		insertCount += basicMapper.update_user_pass(param);
		insertCount += basicMapper.update_user_pass_menu_access(param);
		// }
		return insertCount;
	}

	// 사용자 정보 가져오기
	@Override
	public Map<String, Object> getUserInfo(String id){
		return basicMapper.getUserInfo(id);
	}
	
	@Override
	@Transactional
    public void updateUserInfo(Map<String, Object> params) {
		basicMapper.updateUserInfo(params);
    }
	
	@Override
	@Transactional
	public void updateUserPassword(Map<String, Object> params) {
		String id        = String.valueOf(params.get("id"));
		String newPw     = String.valueOf(params.get("newPw"));
		
		// 변경
		Map<String, Object> upd = new HashMap<>();
		upd.put("id", id);
		upd.put("newPw", newPw);

		int updated = basicMapper.updateUserPassword(upd);
//		updated += basicMapper.updateUserMenuAccessPassword(upd);
		if (updated <= 0) {
			throw new IllegalArgumentException("비밀번호 변경에 실패했습니다.");
		}
	}


	@Override
	public Map<String, Object> read_productInfo(Map<String, Object> params) {
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
			List<ProductVO> records = basicMapper.read_productInfo(queryParams);

			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = (Map<String, Object>) records.get(0);
				Double totalCount = firstRecord.get("TOTALCOUNT") != null
						? ((Number) firstRecord.get("TOTALCOUNT")).doubleValue()
						: 0;
				Double totalQty = firstRecord.get("TOTALQTY") != null ? ((Number) firstRecord.get("TOTALQTY")).doubleValue()
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

	@Transactional
	public int save_productInfo_changed(List<Map<String, Object>> records) {
		if (records == null || records.isEmpty()) return 0;

		int count = 0;
		for (Map<String, Object> record : records) {
			Object itemcode = record.get("itemcode");
			if (itemcode == null || String.valueOf(itemcode).isEmpty()) continue;

			System.out.println(record);
			count += basicMapper.save_productInfo_changed(record);
		}
		return count;
	}

	@Override
	public Map<String, Object> read_warehouse(Map<String, Object> params) {
		@SuppressWarnings("unchecked")
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");
		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();
		try {
			// 쿼리 실행
			System.out.println(searchParams);
			List<Map<String, Object>> records = basicMapper.read_warehouse(searchParams);
			result.put("records", records);

			int totalCount = records.size();
			result.put("totalCount", totalCount);
		} catch (Exception e) {
			// 예외 발생 시 기본값 설정
			e.printStackTrace();
			result.put("records", new ArrayList<>());
			result.put("totalCount", 0);
		}
		return result;
	}

	@Override
	public void create_warehouse (Map<String, Object> param) {
		basicMapper.create_warehouse(param);
	}

	@Override
	public void delete_warehouse (Map<String, Object> param) {
		basicMapper.delete_warehouse(param);
	}

	@Override
	public Map<String, Object> read_sequenceManagement(Map<String, Object> params) {
		Map<String, Object> searchParams = (Map<String, Object>) params.get("searchParams");

		// 결과 객체 초기화 (먼저!)
		Map<String, Object> result = new HashMap<>();

		try {
			// 쿼리 실행
			List<ProductVO> records = basicMapper.read_sequenceManagement(searchParams);

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


	@Override
	public int upload_sequenceInfo(MultipartFile file) throws Exception{
		List<Map<String, Object>> list = parseExcel(file);

		if (list.isEmpty()) {
			throw new IllegalArgumentException("업로드할 데이터가 없습니다");
		}

		// autoCommit = false;
		try (SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH, false)){
			WbBasicMapper batchMapper = session.getMapper(WbBasicMapper.class);

			// 기존 데이터 전체 삭제 후 새로 insert
			batchMapper.delete_sequenceInfoAll();

			int count = 0;
			for (Map<String, Object> map : list) {
				batchMapper.upload_sequenceInfo(map);
				count++;

				if (count % 1000 == 0){
					session.flushStatements();
				}
			}
			session.flushStatements();
			session.commit();
			return count;
		}
	}

	private List<Map<String, Object>> parseExcel(MultipartFile file) throws Exception {
		List<Map<String, Object>> result = new ArrayList<>();

		try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
			Sheet sheet = workbook.getSheetAt(3);
			if (sheet == null) {
				throw new IllegalArgumentException("시트를 읽을 수 없습니다");
			}

			// 3행부터 데이터
			for (int i = 2; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				if (row == null || isEmptyRow(row)) continue;

				Map<String, Object> map = new HashMap<>();
				map.put("sdate", normalizeDate(getString(row.getCell(0))));
				map.put("colorname", getString(row.getCell(1)));
				map.put("material", getString(row.getCell(2)));
				map.put("region", getString(row.getCell(3)));
				map.put("car", getString(row.getCell(4)));
				map.put("colorcode", getString(row.getCell(5)));
				map.put("row1_headrest", getString(row.getCell(6)));
				map.put("row1_hcode", getString(row.getCell(7)));
				map.put("row2_headrest", getString(row.getCell(8)));
				map.put("row2_seat", getString(row.getCell(9)));
				map.put("row2_hcode", getString(row.getCell(10)));
				map.put("limousine", getString(row.getCell(11)));
				map.put("row3_headrest", getString(row.getCell(12)));
				map.put("row3_hcode", getString(row.getCell(13)));
				map.put("row1_lh_code", getString(row.getCell(14)));
				map.put("row1_rh_code", getString(row.getCell(15)));
				map.put("row2_lh_code", getString(row.getCell(16)));
				map.put("row2_rh_code", getString(row.getCell(17)));
				map.put("row2_ctr_code", getString(row.getCell(18)));
				map.put("row3_lh_code", getString(row.getCell(19)));
				map.put("row3_rh_code", getString(row.getCell(20)));
				map.put("row3_ctr_code", getString(row.getCell(21)));
				map.put("lx2_pe_code", getString(row.getCell(22)));
				result.add(map);
			}
		}
		return result;
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

}
