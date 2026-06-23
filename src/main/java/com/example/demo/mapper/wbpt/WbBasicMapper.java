package com.example.demo.mapper.wbpt;

import com.example.demo.vo.ProductVO;
import com.example.demo.vo.UserInfoVO;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface WbBasicMapper {
    Map<String, Object> loginCheck(Map<String, Object> idParam);

    int loginCheck_factoryAccess(Map<String, Object> param);

    int userDelete(Map<String, Object> param);

    List<UserInfoVO> read_userInfo(Map<String, Object> paramMap);

    int getUserInfoTotalCount(Map<String, Object> paramMap);

    List<Map<String, Object>> read_roles_for_users(Map<String, Object> p);

    List<Map<String, Object>> read_role_menus(List<String> roleIds);

    List<Map<String, Object>> read_users_effective_menu_state(List<String> userIds);

    int updateOtherRolesN(Map<String, Object> map);

    int mergeManager(Map<String, Object> map);

    List<String> getRolesY(Map<String, Object> map);

    int updateUserRolesN(Map<String, Object> map);

    int mergeUserRole(Map<String, Object> map);

    List<String> getRoleMenus(Map<String, Object> map2);

    int deleteOverrideMenus(Map<String, Object> map);

    int mergeOverrideY(Map<String, Object> map);

    int mergeOverrideN(Map<String, Object> map);

    List<String> view_main_menu_user_access(String id);

    int check_wms_account(Map<String, Object> param);

    int insert_user_account(Map<String, Object> param);

    String selectUserPassword(String id);

    int update_user_pass(Map<String, Object> param);

    int update_user_pass_menu_access(Map<String, Object> param);

    Map<String, Object> getUserInfo(String id);

    void updateUserInfo(Map<String, Object> params);

    int updateUserPassword(Map<String, Object> upd);

    List<ProductVO> read_productInfo(Map<String, Object> queryParams);

    int save_productInfo_changed(Map<String, Object> record);
}
