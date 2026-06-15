package com.example.demo.service;

import java.util.List;
import java.util.Map;

import com.example.demo.vo.BOMPageVO;
import com.example.demo.vo.CustomerVO;
import com.example.demo.vo.PalletVO;
import com.example.demo.vo.ProductPageVO;
import com.example.demo.vo.ProductVO;
import com.example.demo.vo.StockVO;
import com.example.demo.vo.UserInfoVO;
import com.example.demo.vo.WarehouseVO;

public interface MasterDataService {
	// public List<UserInfoVO> readUser();

	public List<StockVO> read_stock();

	ProductPageVO getProductsPaged(int page, int pageSize, ProductVO searchCriteria);

	public List<ProductVO> readProduct();

	public List<CustomerVO> readCustomer();

//	public List<ProductVO> readInboundCkd();

	public List<WarehouseVO> readWarehouse();

	public List<ProductVO> readBom();

	BOMPageVO getBomsPaged(int page, int pageSize, ProductVO searchVal);

	public int insertWarehouse(Map<String, Object> insertParam);

	public int updateWarehouse(Map<String, Object> updateParam);

	public int deleteWarehouse(List<String> iidList);

	public List<ProductVO> readOutbound();

//	public List<PalletVO> readPallet(Map<String, Object> map);
	Map<String, Object> readPalletList(Map<String, Object> params);

	public int pprintYnUp(List<String> pbarcodeList);

	public int palletDel(String pbarcode);

	public int userAccess(List<Map<String, Object>> sList);

	public int userBlock(List<Map<String, Object>> sList);
	
	public int userDelete(List<Map<String, Object>> sList);

	public List<StockVO> read_stock_summary(Map<String, Object> map);

	// 사용자 조회
	List<UserInfoVO> read_userInfo(Map<String, Object> paramMap);
	int getUserInfoTotalCount(Map<String, Object> paramMap);
	//List<Map<String, Object>> read_userInfo_all(Map<String, Object> searchParams);
	
	// 사용자 권한 조회
	public Map<String, Object> read_modal_user_access(Map<String, Object> param);

	// 사용자 권한 일괄 조회
//	public Map<String, Object> read_users_access(List<String> param);
	public Map<String, Object> read_users_access_init(List<String> ids);
	
	// 사용자 권한 업데이트
	public int update_user_menu_access(Map<String, Object> param);
	
	//메뉴 뷰
	public List<String> view_main_menu_user_access(String id);
	
	//사용자 체크
	public int check_wms_account(Map<String, Object> param);
	
	//사용자 등록
	public int insert_user_account(Map<String, Object> param);
	
	//비밀번호 변경
	public int update_user_pass(Map<String, Object> param);
	
	//공장 권한 지정
	public int update_user_factory_access(Map<String, Object> param);

	// 부서 변경
	public int update_user_department(Map<String, Object> param);

	// 공장 변경
	public int update_user_factory(Map<String, Object> param);
	
	// 품번정보
	Map<String, Object> read_itemMaster(Map<String, Object> param);

	public List<Map<String, Object>> read_magam();

	public int magamClose(Map<String, Object> param);

	public int magamCancel(Map<String, Object> param);

	// 사용자 정보 가져오기
	public Map<String, Object> getUserInfo(String id);

	// 사용자 정보 업데이트
	public void updateUserInfo(Map<String, Object> params);

	public void updateUserPassword(Map<String, Object> params);

	public Map<String, Object> read_productInfo(Map<String, Object> params);

	public int save_productInfo_changed(List<Map<String, Object>> records);

	public Map<String, Object> read_consignee();
	public int create_consignee(Map<String, Object> params);
	public int update_consignee(Map<String, Object> params);
	public int delete_consignee(Map<String, Object> params);

	public Map<String, Object> read_lastDay();
	public int setLastDay(Map<String, Object> params);
	public int updateLastDay(Map<String, Object> params);

}
