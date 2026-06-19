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
	int userDelete(List<Map<String, Object>> sList);

	// 사용자 조회
	List<UserInfoVO> read_userInfo(Map<String, Object> paramMap);
	int getUserInfoTotalCount(Map<String, Object> paramMap);

	// 사용자 권한 일괄 조회
	Map<String, Object> read_users_access_init(List<String> ids);
	
	// 사용자 권한 업데이트
	int update_user_menu_access(Map<String, Object> param);
	
	//메뉴 뷰
	List<String> view_main_menu_user_access(String id);
	
	//사용자 체크
	int check_wms_account(Map<String, Object> param);
	
	//사용자 등록
	int insert_user_account(Map<String, Object> param);
	
	//비밀번호 변경
	int update_user_pass(Map<String, Object> param);

	// 사용자 정보 가져오기
	Map<String, Object> getUserInfo(String id);

	// 사용자 정보 업데이트
	void updateUserInfo(Map<String, Object> params);

	void updateUserPassword(Map<String, Object> params);


	Map<String, Object> read_productInfo(Map<String, Object> params);

}
