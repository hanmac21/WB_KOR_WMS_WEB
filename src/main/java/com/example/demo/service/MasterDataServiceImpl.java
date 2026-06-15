package com.example.demo.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.mapper.wbpt.WbptMapper;
import com.example.demo.vo.BOMPageVO;
import com.example.demo.vo.CustomerVO;
import com.example.demo.vo.ProductPageVO;
import com.example.demo.vo.ProductVO;
import com.example.demo.vo.StockVO;
import com.example.demo.vo.UserInfoVO;
import com.example.demo.vo.WarehouseVO;

@Service
public class MasterDataServiceImpl implements MasterDataService {

	@Autowired
	WbptMapper usaMapper;

	/*
	 * public List<UserInfoVO> readUser() { return usaMapper.readUser();
	 * 
	 * }
	 */

	@Override
	public List<StockVO> read_stock() {
		return usaMapper.read_stock();
	}

	@Override
	public List<StockVO> read_stock_summary(Map<String, Object> map) {
		return usaMapper.read_stock_summary(map);
	}

	@Override
	public ProductPageVO getProductsPaged(int page, int pageSize, ProductVO searchCriteria) {
		System.out.println("=== ServiceImpl 진입 ===");
		System.out.println("Page: " + page + ", PageSize: " + pageSize);

		try {
			// 오프셋 계산
			int offset = (page - 1) * pageSize;

			// 파라미터 맵 생성
			Map<String, Object> params = new HashMap<>();
			params.put("pageSize", pageSize);
			params.put("offset", offset);
			params.put("searchCriteria", searchCriteria);

			System.out.println("searchCriteria: " + searchCriteria);

			System.out.println("ServiceImpl -> Mapper 호출 (Count)");
			// 1. 전체 개수 조회
			int totalCount = usaMapper.readProductCount(params);
			System.out.println("Total Count: " + totalCount);

			System.out.println("ServiceImpl -> Mapper 호출 (Data)");
			// 2. 페이지 데이터 조회
			List<ProductVO> products = usaMapper.readProductPaged(params);
			System.out.println("Data Size: " + products.size());

			// 3. 페이지 정보 계산
			int totalPages = (int) Math.ceil((double) totalCount / pageSize);

			// 4. 결과 객체 생성
			ProductPageVO result = new ProductPageVO();
			result.setData(products);
			result.setTotalCount(totalCount);
			result.setCurrentPage(page);
			result.setTotalPages(totalPages);
			result.setPageSize(pageSize);
			result.setHasNext(page < totalPages);
			result.setHasPrev(page > 1);
			result.setPvo(searchCriteria);

			System.out.println("ServiceImpl -> Controller 응답");
			System.out.println("Result: " + result.getTotalCount() + "건, " + result.getTotalPages() + "페이지");

			return result;

		} catch (Exception e) {
			System.err.println("ServiceImpl 오류: " + e.getMessage());
			e.printStackTrace();
			throw new RuntimeException("제품 페이징 조회 실패", e);
		}
	}

	public List<ProductVO> readProduct() {
		return usaMapper.readProduct();
	}

	public List<CustomerVO> readCustomer() {
		return usaMapper.readCustomer();
	}

//	public List<ProductVO> readInboundCkd() {
//		return usaMapper.readInboundCkd();
//	}

	public List<WarehouseVO> readWarehouse() {
		return usaMapper.readWarehouse();
	}

	public List<ProductVO> readBom() {
		return usaMapper.readBom();
	}

	private List<ProductVO> convertToTreeStructure(List<Map<String, Object>> rawData) {
		System.out.println("=== Tree 구조 변환 시작 ===");
		System.out.println("Raw Data Size: " + rawData.size());

		// 🔥 첫 번째 데이터의 컬럼 구조 확인
		if (!rawData.isEmpty()) {
			Map<String, Object> firstRow = rawData.get(0);
			System.out.println("=== 첫 번째 Row 컬럼 구조 ===");
			for (String key : firstRow.keySet()) {
				System.out.println("  " + key + " = " + firstRow.get(key) + " ("
						+ (firstRow.get(key) != null ? firstRow.get(key).getClass().getSimpleName() : "null") + ")");
			}
		}

		Map<String, ProductVO> parentMap = new HashMap<>();
		List<ProductVO> result = new ArrayList<>();

		for (int i = 0; i < rawData.size(); i++) {
			Map<String, Object> row = rawData.get(i);

			// 🔥 Oracle 대소문자 처리 - 소문자/대문자 모두 체크
			String subname = getStringValue(row, "subname", "SUBNAME");
			String itemcode = getStringValue(row, "itemcode", "ITEMCODE");
			String itemname = getStringValue(row, "itemname", "ITEMNAME");
			String spec = getStringValue(row, "spec", "SPEC");
			String condate = getStringValue(row, "condate", "CONDATE");

			// 부모 키 생성
			String parentKey = String.format("%s-%s-%s-%s-%s", subname, itemcode, itemname, spec, condate);

			if (i < 3) {
				System.out.println("Row " + i + " Parent Key: " + parentKey);
				System.out.println("  subname: " + subname + ", itemcode: " + itemcode);
			}

			// 부모 항목 처리
			if (!parentMap.containsKey(parentKey)) {
				ProductVO parent = new ProductVO();
				parent.setId(parentKey);
				parent.setSubname(subname);
				parent.setItemcode(itemcode);
				parent.setItemname(itemname);
				parent.setSpec(spec);
				parent.setCondate(condate);
				parent.setChildren(new ArrayList<>());
				parent.setParent(true);

				parentMap.put(parentKey, parent);
				result.add(parent);

				if (result.size() <= 3) {
					System.out.println("부모 항목 " + result.size() + " 생성: " + itemcode + " (" + itemname + ")");
				}
			}

			// 🔥 자식 항목 처리 - Oracle 대소문자 처리
			String itemcode1 = getStringValue(row, "itemcode_1", "ITEMCODE_1");
			String itemname1 = getStringValue(row, "itemname_1", "ITEMNAME_1");
			String spec1 = getStringValue(row, "spec_1", "SPEC_1");

			if (itemcode1 != null && !itemcode1.trim().isEmpty()) {
				ProductVO child = new ProductVO();
				child.setId(parentKey + "-child-" + itemcode1);
				child.setParentId(parentKey);
				child.setItemcode(itemcode1);
				child.setItemname(itemname1);
				child.setSpec(spec1);

				// 🔥 Oracle Number -> String 안전 변환
				Object qtyperObj = getObjectValue(row, "qtyper", "QTYPER");
				Object orderidxObj = getObjectValue(row, "orderidx", "ORDERIDX");

				child.setQtyper(qtyperObj != null ? String.valueOf(qtyperObj) : "0");
				child.setOrderidx(orderidxObj != null ? String.valueOf(orderidxObj) : "0");
				child.setChild(true);

				parentMap.get(parentKey).getChildren().add(child);

				if (i < 5) {
					System.out.println("자식 항목 추가: " + itemcode1 + " -> 부모: " + itemcode);
				}
			}
		}

		System.out.println("=== Tree 구조 변환 완료 ===");
		System.out.println("최종 부모 항목 수: " + result.size());

		// 🔥 각 부모별 자식 수 확인
		for (int i = 0; i < Math.min(5, result.size()); i++) {
			ProductVO parent = result.get(i);
			System.out.println("부모 " + (i + 1) + ": " + parent.getItemcode() + " (" + parent.getItemname()
					+ ") - 자식 수: " + (parent.getChildren() != null ? parent.getChildren().size() : 0));
		}

		return result;
	}

	// 🔥 Oracle 대소문자 컬럼명 처리 헬퍼 메서드
	private String getStringValue(Map<String, Object> row, String lowerKey, String upperKey) {
		Object value = row.get(lowerKey);
		if (value == null) {
			value = row.get(upperKey);
		}
		return value != null ? value.toString() : null;
	}

	private Object getObjectValue(Map<String, Object> row, String lowerKey, String upperKey) {
		Object value = row.get(lowerKey);
		if (value == null) {
			value = row.get(upperKey);
		}
		return value;
	}

	// 🔥 Service 메서드도 ProductVO로 수정 필요
	@Override
	public BOMPageVO getBomsPaged(int page, int pageSize, ProductVO searchVal) {
		try {
			System.out.println("=== Service getBomsPaged 진입 ===");

			// 1. 전체 카운트 조회
			int totalCount = usaMapper.getBomTotalCount(searchVal);
			System.out.println("Total Count: " + totalCount);

			// 2. 페이징된 BOM 데이터 조회
			Map<String, Object> params = new HashMap<>();
			params.put("searchVal", searchVal);
			params.put("offset", (page - 1) * pageSize);
			params.put("limit", pageSize);

			List<Map<String, Object>> rawData = usaMapper.getBomsPaged(params);
			System.out.println("Raw Data Size: " + rawData.size());

			// 3. Tree 구조로 변환 (ProductVO 사용)
			List<ProductVO> treeData = convertToTreeStructure(rawData);
			System.out.println("Tree Data Size: " + treeData.size());

			// 🔥 BomPageVO 생성 시 ProductVO 리스트 사용
			BOMPageVO result = new BOMPageVO();
			result.setData(treeData); // List<ProductVO>
			result.setTotalCount(totalCount);
			result.setCurrentPage(page);
			result.setTotalPages((int) Math.ceil((double) totalCount / pageSize));

			return result;

		} catch (Exception e) {
			System.err.println("Service getBomsPaged 오류: " + e.getMessage());
			e.printStackTrace();
			throw new RuntimeException("BOM 페이징 조회 실패", e);
		}
	}

	public int insertWarehouse(Map<String, Object> insertParam) {
		return usaMapper.insertWarehouse(insertParam);
	}

	public int updateWarehouse(Map<String, Object> updateParam) {
		return usaMapper.updateWarehouse(updateParam);
	}

	public int deleteWarehouse(List<String> iidList) {
		return usaMapper.deleteWarehouse(iidList);
	}

	@Override
	public List<ProductVO> readOutbound() {
		return usaMapper.readOutbound();
	}

//	@Override
//	public List<PalletVO> readPallet(Map<String, Object> map) {
//		return usaMapper.readPallet(map);
//	}


	// 입고처리 - 입고내역
	@Override
	public Map<String, Object> readPalletList(Map<String, Object> params) {
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
			List<Map<String, Object>> records = usaMapper.readPalletList(queryParams);
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
	public int pprintYnUp(List<String> pbarcodeList) {
		return usaMapper.pprintYnUp(pbarcodeList);
	}

	@Override
	public int palletDel(String pbarcode) {
		return usaMapper.palletDel(pbarcode);
	}

	@Override
	@Transactional
	public int userAccess(List<Map<String, Object>> sList) {

		int insertCount = 0;

		for (int i = 0; i < sList.size(); i++) {
			Map<String, Object> param = sList.get(i);
			System.out.println("-- PARAM --  SERVICE");
			insertCount += usaMapper.userAccess(param);
		}

		if (insertCount == 0) {
			throw new RuntimeException("Task Error : Count Miss");
		}

		return insertCount;
	}

	@Override
	public int userDelete(List<Map<String, Object>> sList) {

		int insertCount = 0;

		System.out.println("-- PARAM --  SERVICE");
		for (int i = 0; i < sList.size(); i++) {
			Map<String, Object> param = sList.get(i);
			insertCount += usaMapper.userDelete(param);
//			insertCount += usaMapper.userDelete_menuAccess(param);
		}

		return insertCount;
	}

	@Override
	@Transactional
	public int userBlock(List<Map<String, Object>> sList) {

		int insertCount = 0;

		for (int i = 0; i < sList.size(); i++) {
			Map<String, Object> param = sList.get(i);
			System.out.println("-- PARAM --  SERVICE");
			insertCount = usaMapper.userBlock(param);
		}

		if (insertCount == 0) {
			throw new RuntimeException("Task Error : Count Miss");
		}

		return insertCount;
	}

	// 사용자 조회
	@Override
	public List<UserInfoVO> read_userInfo(Map<String, Object> paramMap) {
		try {
			return usaMapper.read_userInfo(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("공장 이동 목록 조회 실패", e);
		}
	}

	@Override
	public int getUserInfoTotalCount(Map<String, Object> paramMap) {
		try {
			return usaMapper.getUserInfoTotalCount(paramMap);
		} catch (Exception e) {
			throw new RuntimeException("공장 이동 총 개수 조회 실패", e);
		}
	}

//	@Override
//	public List<Map<String, Object>> read_userInfo_all(Map<String, Object> searchParam) {
//		try {
//			return usaMapper.read_userInfo_all(searchParam);
//		} catch (Exception e) {
//			throw new RuntimeException("공장 이동 전체 목록 조회 실패", e);
//		}
//	}

	@Override
	public Map<String, Object> read_modal_user_access(Map<String, Object> param) {
		return usaMapper.read_modal_user_access(param);
	}
	
//	@Override
//	public Map<String, Object> read_users_access(List<String> param){
//		System.out.println(param);
//		return usaMapper.read_users_access(param);
//	}
	
	@Override
	public Map<String, Object> read_users_access_init(List<String> ids){
		// ✅ 정리(중복 제거 + trim)
        List<String> userIds = normalizeIds(ids);
        int totalCnt = userIds.size();

        // 1) roles (+ assigned count)
        Map<String, Object> p = new HashMap<>();
        p.put("list", userIds);
        p.put("totalCnt", totalCnt);

        List<Map<String, Object>> roles = usaMapper.read_roles_for_users(p);

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
                roleIds.isEmpty() ? Collections.emptyList() : usaMapper.read_role_menus(roleIds);

        // 3) userMenus (선택 사용자들의 현재 권한 상태 Y/N/M 집계)
        List<Map<String, Object>> userMenus = usaMapper.read_users_effective_menu_state(userIds);

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
	
//	@Override
//	public int update_user_menu_access(Map<String, Object> param) {
//		return usaMapper.update_user_menu_access(param);
//	}
	
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
        count += usaMapper.updateOtherRolesN(map);
		
        // Manager 역할 추가 또는 활성화
        count += usaMapper.mergeManager(map);
//		
//        // 기초자료를 제외한 나머지 OVERRIDE 삭제
//        count += usaMapper.deleteOverride(map);
		
		// 모든 예외 삭제
		
		return count;
	}
	
	private int handleNormalRoles(String userId, List<String> finalRoles) {		
		int count = 0;
		
		// 활성화된 역할 조회
		Map<String, Object> map = new HashMap<>();
		map.put("userId", userId);
		List<String> existingRoles = usaMapper.getRolesY(map);
		
		// finalRoles에 없는 역할은 N 처리
		for (String existingRole : existingRoles) {
			if (!finalRoles.contains(existingRole)) {
				map.put("roleId", existingRole);
				count += usaMapper.updateUserRolesN(map);
			}
		}
		
		// finalRoles 모두 추가 / 활성화
		for (String roleId : finalRoles) {
			map.put("roleId", roleId);
			count += usaMapper.mergeUserRole(map);
		}
		
		return count;
	}
	
	private int cleanupRedundantOverrides(String userId) {
		int count = 0;
		
		// 활성화된 역할 조회 
		Map<String, Object> map = new HashMap<>();
		map.put("userId", userId);
		List<String> activeRoles = usaMapper.getRolesY(map);		
		if (activeRoles == null || activeRoles.isEmpty()) return 0;
		
		// 역할에 포함된 모든 메뉴 조회
		Map<String, Object> map2 = new HashMap<>();
		map2.put("roleIds", activeRoles);
		List<String> roleMenus = usaMapper.getRoleMenus(map2);		
		if (roleMenus == null || roleMenus.isEmpty()) return 0;
		
		// 해당 메뉴들의 OVERRIDE 삭제
		map.put("menuCodes", roleMenus);
		count += usaMapper.deleteOverrideMenus(map);
		
		return count;
	}
	
	private int handleOverrides(String userId, List<String> overrideAdded, List<String> overrideRemoved) {
		int count = 0;
		
		// 역할 외 추가된 메뉴 -> Y
		for (String menuCode : overrideAdded) {
			Map<String, Object> map = new HashMap<>();
			map.put("userId", userId);
			map.put("menuCode", menuCode);
			count += usaMapper.mergeOverrideY(map);
		}
		
		// 역할 외 제외된 메뉴 -> N
		for (String menuCode : overrideRemoved) {
			Map<String, Object> map = new HashMap<>();
			map.put("userId", userId);
			map.put("menuCode", menuCode);
			count += usaMapper.mergeOverrideN(map);
		}
		
		return count;
	}
	
	@Override
	public List<String> view_main_menu_user_access(String id) {
		return usaMapper.view_main_menu_user_access(id);
	}

	@Override
	public int check_wms_account(Map<String, Object> param) {
		return usaMapper.check_wms_account(param);
	}

	@Override
	public int insert_user_account(Map<String, Object> param) {
		int insertCount = 0;

		// 해당 사번이 메뉴 권한이 지정되어있는지 체크.
		// 있으면 해당 권한을 이어서 부여받고 없을시 전부 비활성 상태로 새로만들어준다
		// 사용자 삭제할때마다 권한도 새로만들기는 하나. 기존에있던 저장정보가 재대로 삭제가 안되거나 할시
		// Pk 로 걸려있는 sabun 은 무결성 제약조건 오류가 난다.
		// 이미 데이터를 복사 떠서 권한테이블이 만들어졌기때문에 오류 방지 차원에서 필요하다.

//		int accessCheck = usaMapper.user_menu_accessCheck(param);
//		if (accessCheck != 1) {
//			insertCount += usaMapper.insert_user_account_menu_access(param);
//		}

		insertCount += usaMapper.insert_user_account(param);
		return insertCount;
	}

	@Override
	public int update_user_pass(Map<String, Object> param) {
		String id = String.valueOf(param.get("id"));
		String curPw = String.valueOf(param.get("curPw"));
		int insertCount = 0;
		
		String dbPw = usaMapper.selectUserPassword(id);
		if(!dbPw.equals(curPw)) {
            return -1;
        }
		
		// int validationCheck = usaMapper.update_user_validationCheck(param);
		// if(validationCheck != 1) {
		insertCount += usaMapper.update_user_pass(param);
		insertCount += usaMapper.update_user_pass_menu_access(param);
		// }
		return insertCount;
	}
	
	@Override
	public int update_user_factory_access(Map<String, Object> param) {
		return usaMapper.update_user_factory_access(param);
	}
	
	@Override
	public int update_user_department(Map<String, Object> param) {
		return usaMapper.update_user_department(param);
	}

	@Override
	public int update_user_factory(Map<String, Object> param) {
		return usaMapper.update_user_factory(param);
	}
	
	
	@Override
	public Map<String, Object> read_itemMaster(Map<String, Object> params) {
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
			List<Map<String, Object>> records = usaMapper.read_itemMaster(queryParams);

			result.put("records", records);

			// 첫 번째 레코드에서 totalCount, totalQty 추출
			if (records != null && !records.isEmpty()) {
				Map<String, Object> firstRecord = records.get(0);
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
	
	@Override
	public List<Map<String, Object>> read_magam(){
		return usaMapper.read_magam();
	}
	
	// 마감 등록
	@Override
    public int magamClose(Map<String, Object> param) {
        return usaMapper.magamClose(param);
    }

    // 마감 취소(삭제)
	@Override
    public int magamCancel(Map<String, Object> param) {
        return usaMapper.magamCancel(param);
    }
	
	// 사용자 정보 가져오기
	@Override
	public Map<String, Object> getUserInfo(String id){
		return usaMapper.getUserInfo(id);
	}
	
	@Override
	@Transactional
    public void updateUserInfo(Map<String, Object> params) {
		usaMapper.updateUserInfo(params);
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

		int updated = usaMapper.updateUserPassword(upd);
//		updated += usaMapper.updateUserMenuAccessPassword(upd);
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
			List<ProductVO> records = usaMapper.read_productInfo(queryParams);

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
	@Override
    public int save_productInfo_changed(List<Map<String, Object>> records) {

        int total = 0;

        for (Map<String, Object> map : records) {

            String itemcode = String.valueOf(map.get("itemcode"));
            
            if (itemcode == null || itemcode.trim().isEmpty()) 
            	continue;

            // ✅ payload에 해당 키가 있었는지 플래그
            map.put("isUnit", map.containsKey("UNIT_WEIGHT"));
            map.put("isPallet", map.containsKey("PALLET_WEIGHT"));
            
            total += usaMapper.save_productInfo_changed(map);
        }

        return total;
    }
	
	@Override
	public Map<String, Object> read_consignee(){
		Map<String, Object> response = new HashMap<>();
		List<Map<String, Object>> resultList = usaMapper.read_consignee(); 
		response.put("records", resultList);
		return response;
	}
	
	@Override
	public int create_consignee(Map<String, Object> params){
		return usaMapper.create_consignee(params);
	}
	
	@Override
	public int update_consignee(Map<String, Object> params) {
		return usaMapper.update_consignee(params);
	}
	
	@Override
	public int delete_consignee(Map<String, Object> params){
		return usaMapper.delete_consignee(params);
	}
	
	@Override
	public Map<String, Object> read_lastDay(){
		List<Map<String, Object>> list = usaMapper.read_lastDay();
		
		Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("list", list);
        return result;
	}
	
	@Override
	public int setLastDay(Map<String, Object> params) {
		return usaMapper.setLastDay(params);
	}
	
	@Override
	public int updateLastDay(Map<String, Object> params) {
		return usaMapper.updateLastDay(params);
	}
	
}
