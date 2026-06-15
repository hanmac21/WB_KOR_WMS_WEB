/* --------------------------------------------------------------
 * 📋 PurchaseService 인터페이스 및 구현체
 * -------------------------------------------------------------- */

package com.example.demo.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.jfree.util.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.demo.mapper.wbusa.WbusaMapper;
import com.example.demo.mapper.wbpt.WbptMapper;
import com.example.demo.vo.ProductVO;

@Service
public class InterfaceServiceImpl implements InterfaceService {

	@Autowired
	private WbusaMapper wbusaMapper;

	@Autowired
	private WbptMapper wbptMapper;

	// ++ JW

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public Map<String, Object> load_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key

		System.out.println(param);
		System.out.println("param size: " + param.size());
		int magamCnt = 0;
		int lockCnt = 0;
		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String date = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String cucode = parts[6];
			String invoiceno = parts[8];
			String roomCode = "";
			System.out.println("인보이스번호 : " + invoiceno);
			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomCode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomCode = "Q001";
			}else { // 자재창고일때
				roomCode = "M001";
			}

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_loadSummary_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("date", date);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("condate", condate);
			insertParam.put("cucode", cucode);
			insertParam.put("roomcode", roomCode);
			insertParam.put("invoiceno", invoiceno);

			System.out.println(" -- LOAD SUMMARY PARAM --");
			System.out.println(insertParam);

			// 검증 시작
			// 1️⃣ 마감 여부
			int magam = wbusaMapper.selectLoadCloseCnt(insertParam);
			if (magam > 0) {
				magamCnt++;
				continue; // 다음 데이터로 넘어감
			}

			// 락 여부
			int lock = wbusaMapper.selectLockCnt(insertParam);
			if (lock > 0) {
				lockCnt++;
				continue;
			}
			insertResult += wbusaMapper.load_confirm_summary_if(insertParam);
			insertResult += wbusaMapper.load_confirm_summary_updateYn(insertParam);
			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		Map<String, Object> result = new HashMap<>();
		result.put("magamCnt", magamCnt);
		result.put("lockCnt", lockCnt);

		return result;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public Map<String, Object> load_confirm_summary_cancel(@RequestBody Map<String, Object> body) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		@SuppressWarnings("unchecked")
		List<String> param = (List<String>) body.get("list");
		String loginid = (String) body.getOrDefault("loginid", " ");

		System.out.println(param);
		System.out.println("param size: " + param.size());
		int magamCnt = 0;
		int noExistCnt = 0;
		int lockCnt = 0;
		int laterCnt = 0;
		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));
			String iid = parts[0];
			String date = parts[1];
			String condate = parts[1].replace("-", "");
			String factory = parts[2];
			String storage = parts[3];
			String barcode = parts[4];
			String meskey = parts[5];
			String roomCode = "";

			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomCode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomCode = "Q001";
			}else { // 자재창고일때
				roomCode = "M001";
			}

			int insertResult = 0;
			Map<String, Object> map = new HashMap<String, Object>();

			map.put("cuddiv", "D");
			map.put("roomcode", roomCode);
			map.put("condate", condate);
			map.put("mes_key", meskey);
			map.put("meskey", meskey);
			map.put("ifno", "D"+meskey.substring(1));
			map.put("iid", iid);


			System.out.println(" -- LODD PARAM --");
			System.out.println(map);

			// 검증 시작
			// 1️⃣ 마감 여부
			int magam = wbusaMapper.selectLoadCloseCnt(map);
			if (magam > 0) {
				magamCnt++;
				continue; // 다음 데이터로 넘어감
			}

			// 락 여부
			int lock = wbusaMapper.selectLockCnt(map);
			if (lock > 0) {
				lockCnt++;
				continue;
			}

			// 3️⃣ 후처리 여부
			int later = wbusaMapper.selectLoadLaterCnt(map);
			if (later > 0) {
				laterCnt++;
				continue;
			}

			// 2️⃣ 삭제대상 존재 여부
			int noExist = wbusaMapper.selectLoadDeleteTargetCnt(map);
			if (noExist == 0) {
				noExistCnt++;
				continue;
			}

			insertResult += wbusaMapper.load_confirm_summary_cancel_if(map);
			insertResult += wbusaMapper.load_confirm_summary_cancel_updateYn(map);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		Map<String, Object> result = new HashMap<>();
		result.put("magamCnt", magamCnt);
		result.put("noExistCnt", noExistCnt);
		result.put("lockCnt", lockCnt);
		result.put("laterCnt", laterCnt);

		return result;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int loadReturn_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String date = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_loadReturnSummary_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("date", date);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("condate", condate);

			System.out.println(" -- LOAD SUMMARY PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.loadReturn_confirm_summary_if(insertParam);
			insertResult += wbusaMapper.loadReturn_confirm_summary_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int loadReturn_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String date = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_loadSummary_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			// insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("date", date);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("condate", condate);

			// WMS KEY 조회
			String mes_key = wbusaMapper.selectWmskey_loadReturnSummary(insertParam);

			if (mes_key != null && !"none".equals(mes_key)) {
				insertParam.put("mes_key", mes_key);
			} else {
				insertParam.put("mes_key", String.valueOf(newIfno_if));
			}

			System.out.println(" -- LODD PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.loadReturn_confirm_summary_cancel_if(insertParam);
			insertResult += wbusaMapper.loadReturn_confirm_summary_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int erpInterface_confirm_summary(@RequestBody Map<String, Object> param) {
		List<String> list = (List<String>) param.get("iidList");
		String erpDate = String.valueOf(param.get("date"));		// 사용자 지정 날짜
		String locationbackup = String.valueOf(param.getOrDefault("locationbackup", "N"));	// location backup 여부
		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key

		System.out.println(list);
		System.out.println("param size: " + list.size());
		String value = list.get(0);
		String[] valueParts = value.split("_");
		erpDate = erpDate.replace("-", "");
		String factory0 = valueParts[4];
		String storage0 = valueParts[5];
		String roomcode0 = "";
		System.out.println("storage : "+storage0.trim());
		if ("PRODUCT".equalsIgnoreCase(storage0)) { // 제품창고
			roomcode0 = "F001";
		}else if("OUTSIDE".equalsIgnoreCase(storage0.trim())) {	// 아웃사이드 일리노이창고
			roomcode0 = "Q001";
		}else { // 자재창고일때
			roomcode0 = "M001";
		}

		System.out.println("roomcode : "+roomcode0);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("condate", erpDate);
		map.put("factory", factory0);
		map.put("roomcode", roomcode0);

		if (wbusaMapper.selectLockCnt(map) > 0) {
			return 12;
		}

		wbusaMapper.erpInterface_confirm_summary_st_if_delete(map);
		wbusaMapper.erpInterface_confirm_summary_st_if(map);
		for (int i = 0; i < list.size(); i++) {

			String uniqueValue = (String) list.get(i);

			String[] parts = uniqueValue.split("_");

			System.out.println("=== Loop " + (i + 1) + " / " + list.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));
			parts[0] = "2026-01-31";
			String date = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = "";
			if("Y".equals(locationbackup)){
				qty = parts[6];		// locationbackup qty
			}else{
				qty = parts[3];		// totalqty
			}
			String factory = parts[4];
			String storage = parts[5];
			String roomcode = "";
			if ("PRODUCT".equalsIgnoreCase(storage0)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage0.trim())) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}
			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();


			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("date", erpDate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("roomcode", roomcode);
			insertParam.put("condate", erpDate);

			System.out.println(" -- LOAD SUMMARY PARAM --");
			System.out.println(insertParam);
			
			// 재고실사 인터페이스
			insertResult += wbusaMapper.erpInterface_confirm_summary_if(insertParam);
			
			
			System.out.println(insertResult);
			if (insertResult < 1) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}
		// ===== 재고조정 후처리: ERP 재고 -> T_ST_CHANGESUB 반영 =====
		Map<String, Object> stockParam = new HashMap<>();
		stockParam.put("gubun", "01");
		stockParam.put("branch", "000");
		stockParam.put("roomcode", roomcode0);
		stockParam.put("dateTo", erpDate);								//yyyymmdd
		stockParam.put("dateFrom", erpDate.substring(0, 6) + "01");		//yyyymm01
		stockParam.put("baseMonth", erpDate.substring(0, 6));			//yyyymm

		System.out.println("===== 재고조정 후처리 시작 =====");
		System.out.println("stockParam: " + stockParam);
		//260430 후처리임시 주석하고 프로세스로 대체
		Map<String, Object> closeMap = new HashMap<>();
		closeMap.put("condate", erpDate);
		wbusaMapper.stockClosePro(closeMap);
//		wbusaMapper.stockClosePro(closeMap);
//		wbusaMapper.mergeStockChangeSub(stockParam);
//		wbusaMapper.updateStockChangeSubInit(stockParam);
//		wbusaMapper.mergeStockChangeSub(stockParam);
//		wbusaMapper.updateStockChangeSubQty1(stockParam);
//		wbusaMapper.updateStockChangeSubQty2(stockParam);
//		wbusaMapper.updateStockChangeSubQty3(stockParam);

		System.out.println("===== 재고조정 후처리 완료 =====");
		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int stockCountPurWIPListIntf_delete(@RequestBody Map<String, Object> param) {
		int deleteCount = 0;

		// 원본 값 꺼내기 (null 안전하게 처리하고 싶으면 Objects.toString 사용해도 됨)
		String dateRaw = (String) param.get("date");
		String wcRaw = (String) param.get("wccode");
		String factoryRaw = (String) param.get("factory");

		// ✅ 공백 제거 + 대문자 변환
		String date = dateRaw != null ? dateRaw.trim() : "";
		String wc = wcRaw != null ? wcRaw.trim().toUpperCase() : "";
		String factory = factoryRaw != null ? factoryRaw.trim().toUpperCase() : "";

		String roomcode = "";

		// ✅ factory / wc 는 이미 전부 대문자라 equals 로만 비교
		if ("PRODUCT".equalsIgnoreCase(wc)) { // 제품창고
			roomcode = "F001";
		}else if("OUTSIDE".equalsIgnoreCase(wc.trim())) {	// 아웃사이드 일리노이창고
			roomcode = "Q001";
		}else { // 자재창고일때
			roomcode = "M001";
		}

		String condate = date.replace("-", "");

		param.put("condate", condate);
		param.put("roomcode", roomcode);

		if (wbusaMapper.selectLockCnt(param) > 0) {
			return 12;
		}

		/*if ("AUNDE".equals(wc) || "REDCAGE".equals(wc) || "TQ1".equals(wc)) {
			System.out.println("AUNDE storage : " + wc);*/
			deleteCount = wbusaMapper.stockCountPurWIPListIntf_if_storage_delete(param);
			System.out.println("DELETE COUNT 1");
			System.out.println(deleteCount);
		/*} else { // 재공재고실사 인터페이스
			System.out.println("storage 22 : " + wc);
			deleteCount = wbusaMapper.stockCountPurWIPListIntf_if_delete(param);
			System.out.println("DELETE COUNT 1");
			System.out.println(deleteCount);
		}*/

		return deleteCount;
	}

	// 재공재고실사 인터페이스등록
	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int stockCountPurWIPListIntf(@RequestBody Map<String, Object> intfParam) {
		System.out.println("TX active: " + TransactionSynchronizationManager.isActualTransactionActive());
		@SuppressWarnings("unchecked")
		List<String> param = (List<String>) intfParam.get("iidList");
		String intfDate = (String) intfParam.get("intfDate");
		String storage = (String) intfParam.get("wc");
		String factory = (String) intfParam.get("factory");

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		String[] dayparts = intfDate.split("-");
		String yearMonth = dayparts[0] + dayparts[1];

		if (wbusaMapper.isStorageClosed(yearMonth) > 0) {
			return 10;
		}


		Map<String, Object> lockParam = new HashMap<String, Object>();
		lockParam.put("condate", intfDate.replace("-", ""));
		if (wbusaMapper.selectLockCnt(lockParam) > 0) {
			return 12;
		}

		// ifno, ifno_yn, mes_key

		System.out.println(param);
		System.out.println("param size: " + param.size());
		System.out.println(intfParam);
		System.out.println(param);

		String unique = param.get(0); // 0번지 값
		String[] commonParts = unique.split("\\|"); // ← 정상적인 split
		System.out.println(Arrays.toString(commonParts));
		String roomcode = "";
		// String wc = commonParts[2];
		// String factory = wc.split("-")[0].trim();
		// String storage = wc.split("-")[1].trim();
		String date = commonParts[0];
		String condate = intfDate.replace("-", "");


		if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
			roomcode = "F001";
		}else if("OUTSIDE".equalsIgnoreCase(storage)) {	// 아웃사이드 일리노이창고
			roomcode = "Q001";
		}else { // 자재창고일때
			roomcode = "M001";
		}
		Map<String, Object> deleteParam = new HashMap<String, Object>();

		deleteParam.put("condate", condate);
		deleteParam.put("roomcode", roomcode);

		System.out.println("storage :" + storage);
		wbusaMapper.stockCountPurWIPListIntf_if_storage_delete(deleteParam);	// 창고 기존데이터 삭제
		wbusaMapper.erpInterface_confirm_summary_st_if_delete(deleteParam);		// 창고 재고실사 작업전 쿼리 삭제
		wbusaMapper.erpInterface_confirm_summary_st_if(deleteParam);			// 창고 재고실사 작업전 쿼리 등록

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("_");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String oitemcode = parts[1];
			String qty = parts[3];
			String bqty = parts[4];

			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage)) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}
			System.out.println("factory:" + factory + " storage:" + storage + " roomcode:" + roomcode);
			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			// 고객사 품번 ERP품번으로 바꿔주기
			String erpItemcode = wbusaMapper.getErpItemcode(oitemcode);
			if (erpItemcode == null) {
				System.out.println("ERP 품번 조회 없음 skip: " + oitemcode);
				continue;
			}
			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("date", date);
			insertParam.put("itemcode", erpItemcode);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("bqty", bqty);
			insertParam.put("roomcode", roomcode);
			insertParam.put("condate", condate);

			System.out.println(" -- LOAD SUMMARY PARAM --");
			System.out.println(insertParam);
			System.out.println("storage:" + storage);
			System.out.println("storage:" + storage + " --- length: " + storage.length());
			// 재고실사 인터페이스
			// 창고재고실사 인터페이스 재고실사확정 인터페이스랑 동일
			//if ("AUNDE".equalsIgnoreCase(storage.trim()) || "REDCAGE".equalsIgnoreCase(storage.trim()) || "TQ1".equalsIgnoreCase(storage.trim())) {
				System.out.println("AUNDE storage :" + storage);
				insertResult += wbusaMapper.stockCountSorage_if(insertParam);
			/*} else { // 재공재고실사 인터페이스
				System.out.println(" storage 22:" + storage);
				insertResult += wbusaMapper.stockCountPurWIPListIntf_if(insertParam);
			}*/
			// insertResult +=
			// wbmexMapper.erpInterface_confirm_summary_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 1) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}
		Map<String, Object> wipStockParam = new HashMap<String, Object>();
		wipStockParam.put("gubun", "01");
		wipStockParam.put("branch", "000");
		wipStockParam.put("roomcode", roomcode);
		wipStockParam.put("dateTo", condate);
		wipStockParam.put("dateFrom", condate.substring(0, 6) + "01");
		wipStockParam.put("baseMonth", condate.substring(0, 6));
		//260430 후처리임시 주석하고 프로세스로 대체
		Map<String, Object> closeMap = new HashMap<>();
		closeMap.put("condate", condate);
		wbusaMapper.stockClosePro(closeMap);
//		wbusaMapper.mergeStockChangeSub(wipStockParam);
//		wbusaMapper.updateStockChangeSubInit(wipStockParam);
//		wbusaMapper.mergeStockChangeSub(wipStockParam);
//		wbusaMapper.updateStockChangeSubQty1(wipStockParam);
//		wbusaMapper.updateStockChangeSubQty2(wipStockParam);
//		wbusaMapper.updateStockChangeSubQty3(wipStockParam);
		/*if ("AUNDE".equalsIgnoreCase(storage.trim()) || "REDCAGE".equalsIgnoreCase(storage.trim()) || "TQ1".equalsIgnoreCase(storage.trim())) {

		}else{
			Map<String, Object> wipStockParam = new HashMap<String, Object>();
			wipStockParam.put("gubun", "01");
			wipStockParam.put("branch", "000");
			wipStockParam.put("wccode", roomcode);
			wipStockParam.put("dateTo", condate);
			wipStockParam.put("dateFrom", condate.substring(0, 6) + "01");
			wipStockParam.put("baseMonth", condate.substring(0, 6));
			wbusaMapper.mergeWipStockChangeSub(wipStockParam);
			wbusaMapper.updateWipStockChangeSubInit(wipStockParam);
			wbusaMapper.mergeWipStockChangeSub(wipStockParam);
			wbusaMapper.updateWipStockChangeSubQty1(wipStockParam);
			wbusaMapper.updateWipStockChangeSubQty2(wipStockParam);
			wbusaMapper.updateWipStockChangeSubQty3(wipStockParam);
		}*/
		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int erpInterface_confirm_summary_cancel(@RequestBody Map<String,Object> param) {
		List<String> list = (List<String>)param.get("iidList");
		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		String erpDate = String.valueOf(param.get("date"));
		// ifno, ifno_yn, mes_key

		System.out.println(param);
		System.out.println("param size: " + param.size());

		Map<String, Object> lockParam = new HashMap<>();
		lockParam.put("condate", erpDate.replace("-", ""));
		if (wbusaMapper.selectLockCnt(lockParam) > 0) {
			return 12;
		}
		Map<String, Object> insertParam = new HashMap<String, Object>();
		String uniqueValue = (String) list.get(0);

		String[] parts = uniqueValue.split("_");

		System.out.println("uniqueValue: " + uniqueValue);
		System.out.println("parts: " + Arrays.toString(parts));

		String date = erpDate;
		String condate = erpDate.replace("-", "");
		String itemcode = parts[1];
		String intf_yn = parts[2];
		String qty = parts[3];
		String factory = parts[4];
		String storage = parts[5];
		String roomcode = "";
		if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
			roomcode = "F001";
		}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
			roomcode = "Q001";
		}else { // 자재창고일때
			roomcode = "M001";
		}

		// PARAM 이 가지고있던 데이터 넣어주기
		insertParam.put("date", date);
		insertParam.put("itemcode", itemcode);
		insertParam.put("intf_yn", intf_yn);
		insertParam.put("factory", factory);
		insertParam.put("storage", storage);
		insertParam.put("qty", qty);
		insertParam.put("roomcode", roomcode);
		insertParam.put("condate", condate);

		wbusaMapper.erpInterface_confirm_summary_if_delete(insertParam);
		/*for (int i = 0; i < list.size(); i++) {

			String uniqueValue = (String) list.get(i);

			String[] parts = uniqueValue.split("_");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String date = erpDate;
			String condate = erpDate.replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String roomcode = "";
			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();


			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("date", date);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("roomcode", roomcode);
			insertParam.put("condate", condate);

			// WMS KEY 조회
//			String mes_key = wbmexMapper.selectWmskey_stockCountSummary(insertParam);
//
//			if (mes_key != null && !"none".equals(mes_key)) {
//				insertParam.put("mes_key", mes_key);
//			} else {
//				insertParam.put("mes_key", String.valueOf(newIfno_if));
//			}

			System.out.println(" -- LODD PARAM --");
			System.out.println(insertParam);


			// insertResult +=
			// wbmexMapper.erpInterface_confirm_summary_cancel_updateYn(insertParam);
			
			//String storageKey = storage == null ? "" : storage.trim().toUpperCase();
			
			//if ("P1 W/HOUSE".equals(storageKey)) {
				//wbmexMapper.erpInterface_confirm_summary_mm_if_delete(insertParam);
			//}else {
				//wbmexMapper.erpInterface_confirm_summary_st_if_delete(insertParam);
			//}

			System.out.println(insertResult);
//			if (insertResult < 1) {
//				throw new RuntimeException("Task Error : Count Miss");
//			}

		}*/

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int transferSummary_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String date = parts[0];
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_transferSummary_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("date", date);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("qty", qty);

			System.out.println(" -- LOAD SUMMARY PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.transfer_confirm_summary_if(insertParam);
			insertResult += wbusaMapper.transfer_confirm_summary_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int transferSummary_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String date = parts[0];
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_transferSummary_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			// insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("date", date);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("qty", qty);

			// WMS KEY 조회
			String mes_key = wbusaMapper.selectWmskey_transferSummary(insertParam);

			if (mes_key != null && !"none".equals(mes_key)) {
				insertParam.put("mes_key", mes_key);
			} else {
				insertParam.put("mes_key", String.valueOf(newIfno_if));
			}

			System.out.println(" -- LODD PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.transfer_confirm_summary_cancel_if(insertParam);
			insertResult += wbusaMapper.transfer_confirm_summary_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	// ++ JW

    // 입고 list 인터페이스 삭제
	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public Map<String, Object> inbound_confirm_delete(List<String> list) {
		// 날짜, 거래처, 아이템코드 여부로 그룹
		// List<ProductVO> group = wbmexMapper.groupInbound(list);
		System.out.println("LIST -----------");
		System.out.println(list);
		int magamCnt = 0;
		int buyCnt = 0;
		int laterCnt = 0;
		int noExistCnt = 0;
		int lockCnt = 0;
		for (int i = 0; i < list.size(); i++) {
			String uniqueValue = (String) list.get(i);

			String[] parts = uniqueValue.split("\\|");

			String iid = parts[0];
			String indate = parts[1];
			String condate = parts[1].replace("-", "");
			String factory = parts[2];
			String storage = parts[3];
			String barcode = parts[4];
			String meskey = parts[5];

			String roomCode = "";

			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomCode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomCode = "Q001";
			}else { // 자재창고일때
				roomCode = "M001";
			}


			Map<String, Object> map = new HashMap<String, Object>();

			map.put("cuddiv", "D");
			map.put("roomcode", roomCode);
			map.put("condate", condate);
			map.put("mes_key", meskey);
			map.put("meskey", meskey);
			map.put("ifno", "D"+meskey.substring(1));
			map.put("iid", iid);

			System.out.println("==================");

			// 검증 시작
			// 1️⃣ 입고마감 여부
			int magam = wbusaMapper.selectIncomingCloseCnt(map);
			if (magam > 0) {
				magamCnt++;
				continue; // 다음 데이터로 넘어감
			}

			// 락 여부
			int lock = wbusaMapper.selectLockCnt(map);
			if (lock > 0) {
				lockCnt++;
				continue;
			}

			// 2️⃣ 매입처리 여부
			int buy = wbusaMapper.selectIncomingBuyCnt(map);
			if (buy > 0) {
				buyCnt++;
				continue;
			}

			// 3️⃣ 후처리 여부
			int later = wbusaMapper.selectIncomingLaterCnt(map);
			if (later > 0) {
				laterCnt++;
				continue;
			}

			// 4️⃣ 삭제 대상 여부
			int noExist = wbusaMapper.selectIncomingDeleteTargetCnt(map);
			if (noExist == 0) {
				noExistCnt++;
				continue;
			}
			// wbmexMapper.inbound_confirm(map); // 입고내역에 인터페이스 정보 업데이트
			map.put("factory", factory);
			map.put("storage", storage);
			wbusaMapper.inbound_intf_pm_delete(map);
			wbusaMapper.inbound_intf_qc_delete(map);
			wbusaMapper.inbound_confirm_delete(map); // 입고내역에 인터페이스 정보 업데이트
		}

		Map<String, Object> result = new HashMap<>();
		result.put("magamCnt", magamCnt);
		result.put("buyCnt", buyCnt);
		result.put("laterCnt", laterCnt);
		result.put("noExistCnt", noExistCnt);
		result.put("lockCnt", lockCnt);

		return result;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public Map<String, Object> inbound_confirm_summary(List<String> list) {
		// 날짜, 거래처, 아이템코드 여부로 그룹
		// List<ProductVO> group = wbmexMapper.groupInbound(list);
		System.out.println("LIST -----------");
		System.out.println(list);
		int magamCnt = 0;
		int lockCnt = 0;
		int priceCnt = 0;
		for (int i = 0; i < list.size(); i++) {
			String uniqueValue = (String) list.get(i);

			String[] parts = uniqueValue.split("\\|");

			String itemcode = parts[1];
			String condate = parts[0].replace("-", "");
			String cucode = parts[2];
			String qty = parts[3];
			String indate = parts[0];
			String factory = parts[4];
			String storage = parts[5];
			String invoiceno = parts[7];

			String roomCode = "";
			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomCode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomCode = "Q001";
			}else { // 자재창고일때
				roomCode = "M001";
			}
			System.out.println("itemcode: " + itemcode);
			System.out.println("cucode: " + cucode);
			System.out.println("qty: " + qty);

			Map<String, Object> map = new HashMap<String, Object>();
			LocalDate today = LocalDate.now();
			String date8 = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
			String maxIfno = wbusaMapper.selectIfnoIn(date8); // 오늘날짜 기준 가장큰 ifno값 가져오기
			String nextIfno = "";
			if (maxIfno == null) {
				maxIfno = date8 + "0001"; // 기본값
				System.out.println("maxIfno null값 : " + maxIfno);
				map.put("ifno", maxIfno);
				map.put("meskey", "20" + maxIfno.substring(2)); // mes_key값 ifno값에서 앞에 20빼고 +"PO"

			} else {
				long nextVal = Long.parseLong(maxIfno) + 1;
				nextIfno = String.format("%012d", nextVal); // 자리수 맞추기
				System.out.println("maxIfno null아닐때 : " + maxIfno);
				map.put("ifno", nextIfno);
				map.put("meskey", "20" + nextIfno.substring(2)); // mes_key값 ifno값에서 앞에 20빼고 +"PO"
			}
			// String[] iidArray = group.get(i).getIidlist().split(",");

			// 배열을 List<String>로 변환
			// List<String> iidList = Arrays.stream(iidArray)
			// .map(String::trim) // 공백 제거
			// .collect(Collectors.toList());
			// map.put("iidlist", iidList);
			map.put("cuddiv", "I");
			map.put("itemcode", itemcode == null ? "" : itemcode);
			map.put("custcode", cucode == null ? "" : cucode);
			map.put("qty", qty == null ? "0" : qty);
			map.put("indate", indate == null ? "" : indate);
			map.put("roomcode", roomCode);
			map.put("condate", condate);
			map.put("invoiceno", invoiceno);
			map.put("factory", factory);
			map.put("storage", storage);

			// 디버깅용 출력
			System.out.println("=== MAP 내용 출력 ===");
			for (String key : map.keySet()) {
				System.out.println(key + " : " + map.get(key) + " (null여부: " + (map.get(key) == null) + ")");
			}
			System.out.println("==================");

			// wbmexMapper.inbound_confirm(map); // 입고내역에 인터페이스 정보 업데이트

			// 검증 시작
			// 1️⃣ 입고마감 여부
			int magam = wbusaMapper.selectIncomingCloseCnt(map);
			if (magam > 0) {
				magamCnt++;
				continue; // 다음 데이터로 넘어감
			}

			// 락 여부
			int lock = wbusaMapper.selectLockCnt(map);
			if (lock > 0) {
				lockCnt++;
				continue;
			}
			
			// 단가 확인
			int price = wbusaMapper.selectUnitPrice(map);
			if (price > 0) {
				priceCnt++;
				continue;
			}

			wbusaMapper.inbound_confirm_summary(map); // 입고내역에 인터페이스 정보 업데이트
			wbusaMapper.inbound_intf_pm(map);
			wbusaMapper.inbound_intf_qc(map);

		}
		Map<String, Object> result = new HashMap<>();
		result.put("magamCnt", magamCnt);
		result.put("lockCnt", lockCnt);
		result.put("priceCnt", priceCnt);

		return result;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int inbound_confirm(List<String> list) {
		// 날짜, 거래처, 아이템코드 여부로 그룹
		List<ProductVO> group = wbusaMapper.groupInbound(list);

		for (int i = 0; i < group.size(); i++) {
			Map<String, Object> map = new HashMap<String, Object>();
			LocalDate today = LocalDate.now();
			String date8 = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
			String maxIfno = wbusaMapper.selectIfnoIn(date8); // 오늘날짜 기준 가장큰 ifno값 가져오기
			String nextIfno = "";
			if (maxIfno == null) {
				maxIfno = date8 + "0001"; // 기본값
				System.out.println("maxIfno null값 : " + maxIfno);
				map.put("ifno", maxIfno);
				map.put("meskey", "20" + maxIfno.substring(2)); // mes_key값 ifno값에서 앞에 20빼고 +"PO"

			} else {
				long nextVal = Long.parseLong(maxIfno) + 1;
				nextIfno = String.format("%012d", nextVal); // 자리수 맞추기
				System.out.println("maxIfno null아닐때 : " + maxIfno);
				map.put("ifno", nextIfno);
				map.put("meskey", "20" + nextIfno.substring(2)); // mes_key값 ifno값에서 앞에 20빼고 +"PO"
			}
			String[] iidArray = group.get(i).getIidlist().split(",");

			// 배열을 List<String>로 변환
			List<String> iidList = Arrays.stream(iidArray).map(String::trim) // 공백 제거
					.collect(Collectors.toList());
			map.put("iidlist", iidList);
			map.put("cuddiv", "I");
			map.put("itemcode", group.get(i).getItemcode());
			map.put("custcode", group.get(i).getCucode());
			map.put("qty", group.get(i).getQty());

			wbusaMapper.inbound_intf_pm(map);
			wbusaMapper.inbound_confirm(map); // 입고내역에 인터페이스 정보 업데이트
			wbusaMapper.inbound_intf_qc(map);
		}

		//
		return 0;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int inbound_confirm_cancel(List<String> list) { // 250822 출고인터페이스 취소 진행중
		// 중복 제거 (순서 유지)
		list = new ArrayList<>(new LinkedHashSet<>(list));
		for (int i = 0; i < list.size(); i++) {
			Map<String, Object> map = new HashMap<String, Object>();
			LocalDate today = LocalDate.now();
			String date8 = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
			String maxIfno = wbusaMapper.selectIfnoIn(date8); // 오늘날짜 기준 가장큰 ifno값 가져오기
			String nextIfno = "";
			if (maxIfno == null) {
				maxIfno = date8 + "0001"; // 기본값
				System.out.println("maxIfno null값 : " + maxIfno);
				map.put("ifno", maxIfno);

			} else {
				long nextVal = Long.parseLong(maxIfno) + 1;
				nextIfno = String.format("%012d", nextVal); // 자리수 맞추기
				System.out.println("maxIfno null아닐때 : " + maxIfno);
				map.put("ifno", nextIfno);
			}
			map.put("meskey", list.get(i)); // mes_key값 ifno값에서 앞에 20빼고 +"PO"

			map.put("cuddiv", "D");

			wbusaMapper.inbound_confirm_cancel(map);
			wbusaMapper.inbound_intf_pm_cancel(map);
			wbusaMapper.inbound_intf_qc_cancel(map);
		}

		//
		return 0;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int workMove_confirm(List<Map<String, Object>> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		for (int i = 0; i < param.size(); i++) {
			int insertResult = 0;
			Map<String, Object> row = param.get(i);
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_workMove_if(today);
			String maxIfno_real_if = wbusaMapper.selectIfno_workMove_real_if(today);
			String newIfno_if;
			String newIfno_real_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}
			if (maxIfno_real_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_real_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_real_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_real_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));
			insertParam.put("ifno_real_if", String.valueOf(newIfno_real_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("iid", row.get("iid"));
			insertParam.put("barcode", row.get("barcode"));
			insertParam.put("car", row.get("car"));
			insertParam.put("indate", row.get("indate"));
			insertParam.put("itemcode", row.get("itemcode"));
			insertParam.put("itemname", row.get("itemname"));
			insertParam.put("qty", row.get("qty"));
			insertParam.put("roomcode", row.get("roomcode"));
			insertParam.put("wccode", row.get("wccode"));
			insertParam.put("ymdhms", row.get("ymdhms"));

			System.out.println(" -- WORK MOVE PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.workMove_confirm_if(insertParam);
			// insertResult += wbmexMapper.workMove_confirm_real_if(insertParam);
			insertResult += wbusaMapper.workMove_confirm_updateWorkMove(insertParam);

			if (insertResult != 3) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int workmove_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String indate = parts[0];
			String condate = parts[0].replaceAll("-", "");
			String itemcode = parts[1];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String wccode = "";
			String roomcode = "";
			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_workMove_if(today);
			// String maxIfno_real_if = wbmexMapper.selectIfno_workMove_real_if(today);
			String newIfno_if;
			// String newIfno_real_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}
//			if (maxIfno_real_if == null) {
//				// 오늘 처음 생성이면 0001부터
//				newIfno_real_if = today + "0001";
//			} else {
//				// 마지막 4자리 추출 후 +1
//				String seqStr = maxIfno_real_if.substring(8); // 뒤 4자리
//				int seq = Integer.parseInt(seqStr) + 1;
//				newIfno_real_if = today + String.format("%04d", seq);
//			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));
			// insertParam.put("ifno_real_if", String.valueOf(newIfno_real_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("indate", indate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("qty", qty);
			insertParam.put("wccode", wccode);
			insertParam.put("barcode", barcode);
			insertParam.put("roomcode", roomcode);
			insertParam.put("condate", condate);

			System.out.println(" -- WORK MOVE PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.workMove_confirm_if(insertParam);
			// insertResult += wbmexMapper.workMove_confirm_real_if(insertParam);
			insertResult += wbusaMapper.workMove_confirm_updateWorkMove_summary(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int workMove_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String indate = parts[0];
			String condate = parts[0].replaceAll("-", "");
			String itemcode = parts[1];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String mes_key = parts[7];
			String wccode = "";
			String roomcode = "";
			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_workMove_if(today);
			// String maxIfno_real_if = wbmexMapper.selectIfno_workMove_real_if(today);
			String newIfno_if;
			String newIfno_real_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}
//			if (maxIfno_real_if == null) {
//				// 오늘 처음 생성이면 0001부터
//				newIfno_real_if = today + "0001";
//			} else {
//				// 마지막 4자리 추출 후 +1
//				String seqStr = maxIfno_real_if.substring(8); // 뒤 4자리
//				int seq = Integer.parseInt(seqStr) + 1;
//				newIfno_real_if = today + String.format("%04d", seq);
//			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));
			// insertParam.put("ifno_real_if", String.valueOf(newIfno_real_if));
			insertParam.put("indate", indate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("qty", qty);
			insertParam.put("wccode", wccode);
			insertParam.put("barcode", barcode);
			insertParam.put("roomcode", roomcode);
			insertParam.put("condate", condate);

			// WMS KEY 조회 251111 hj 주석 detail이라 unique에서 가져오는걸로 수정
			// String mes_key = wbmexMapper.selectWmskey_workMove(insertParam);

			if (mes_key != null && !"none".equals(mes_key)) {
				insertParam.put("mes_key", mes_key);
			} else {
				insertParam.put("mes_key", String.valueOf(newIfno_if));
			}

			// PARAM 이 가지고있던 데이터 넣어주기

			System.out.println(" -- WORK MOVE PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.workMove_confirm_summary_cancel_if(insertParam);
			// insertResult +=
			// wbmexMapper.workMove_confirm_summary_cancel_real_if(insertParam);
			insertResult += wbusaMapper.workMove_confirm_cancel_updateWorkMove_summary(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class) // 예외 입고 등록
	public int exceptionInput_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String indate = parts[0];
			String condate = parts[0].replaceAll("-", "");
			String itemcode = parts[1];
			String confirm_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String roomcode = "";
			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}
			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_exceptionInput_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("indate", indate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("confirm_yn", confirm_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("roomcode", roomcode);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);

			System.out.println(" -- EXCEPTION INPUT PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.exceptionInput_confirm_summary_if(insertParam);
			insertResult += wbusaMapper.exceptionInput_confirm_summary_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int exceptionInput_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String indate = parts[0];
			String condate = parts[0].replaceAll("-", "");
			String itemcode = parts[1];
			String confirm_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String mes_key = parts[7];
			String roomcode = "";
			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}
			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_exceptionInput_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			// insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("indate", indate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("confirm_yn", confirm_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("roomcode", roomcode);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("mes_key", mes_key);

			// 251110 DH - 프론트에서 mes_key값을 가져오므로 주석 처리
//			// WMS KEY 조회
//			String mes_key = wbmexMapper.selectWmskey_exceptionInputSummary(insertParam);
//			
//			if (mes_key != null && !"none".equals(mes_key)) {
//				insertParam.put("mes_key", mes_key);
//			} else {
//				insertParam.put("mes_key", String.valueOf(newIfno_if));
//			}

			System.out.println(" -- EXCEPTION INPUT PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.exceptionInput_confirm_summary_cancel_if(insertParam);
			insertResult += wbusaMapper.exceptionInput_confirm_summary_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class) // 예외 출고 등록
	public int exceptionOutput_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String outdate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String confirm_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_exceptionOutput_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("outdate", outdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("confirm_yn", confirm_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("condate", condate);

			System.out.println(" -- EXCEPTION OUTPUT PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.exceptionOutput_confirm_summary_if(insertParam);
			insertResult += wbusaMapper.exceptionOutput_confirm_summary_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int exceptionOutput_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String outdate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String confirm_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String mes_key = parts[7];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_exceptionOutput_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			// insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("outdate", outdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("confirm_yn", confirm_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("mes_key", mes_key);

			// 251110 DH - 프론트에서 mes_key값을 가져오므로 주석 처리
//			// WMS KEY 조회
//			String mes_key = wbmexMapper.selectWmskey_exceptionOutputSummary(insertParam);
//			
//			if (mes_key != null && !"none".equals(mes_key)) {
//				insertParam.put("mes_key", mes_key);
//			} else {
//				insertParam.put("mes_key", String.valueOf(newIfno_if));
//			}

			System.out.println(" -- EXCEPTION OUTPUT PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.exceptionOutput_confirm_summary_cancel_if(insertParam);
			insertResult += wbusaMapper.exceptionOutput_confirm_summary_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int storage_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String sdate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage2 = parts[5]; // instorage
			String storage1 = parts[6]; // outstorage
			String barcode = parts[7];
			String inroom = " ";
			String outroom = " ";
			// OUTSTORAGE
			if ("PRODUCT".equalsIgnoreCase(storage1)) { // 제품창고
				outroom = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage1.trim())) {	// 아웃사이드 일리노이창고
				outroom = "Q001";
			}else { // 자재창고일때
				outroom = "M001";
			}


			// INSTORAGE
			if ("PRODUCT".equalsIgnoreCase(storage2)) { // 제품창고
				inroom = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage2.trim())) {	// 아웃사이드 일리노이창고
				inroom = "Q001";
			}else { // 자재창고일때
				inroom = "M001";
			}

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_storage_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("sdate", sdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage2", storage2);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("inroom", inroom);
			insertParam.put("outroom", outroom);

			System.out.println(" -- MOVEMENT STORAGE PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.storage_confirm_summary_if(insertParam);
			insertResult += wbusaMapper.storage_confirm_summary_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int storage_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);
			System.out.println("param- gET");
			System.out.println(param.get(i));

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String sdate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage2 = parts[5]; // FAB
			String storage1 = parts[6]; // outstorage // MAT
			String barcode = parts[7];
			String inroom = "";
			String outroom = "";
			String mes_key = parts[8];
			// OUTSTORAGE

			// OUTSTORAGE
			if ("PRODUCT".equalsIgnoreCase(storage1)) { // 제품창고
				outroom = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage1.trim())) {	// 아웃사이드 일리노이창고
				outroom = "Q001";
			}else { // 자재창고일때
				outroom = "M001";
			}


			// INSTORAGE
			if ("PRODUCT".equalsIgnoreCase(storage2)) { // 제품창고
				inroom = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage2.trim())) {	// 아웃사이드 일리노이창고
				inroom = "Q001";
			}else { // 자재창고일때
				inroom = "M001";
			}

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_storage_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			// insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("sdate", sdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage2", storage2);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("inroom", inroom);
			insertParam.put("outroom", outroom);
			insertParam.put("mes_key", mes_key);

			// WMS KEY 조회
//			String mes_key = wbmexMapper.selectWmskey_storageSummary(insertParam);
//			
//			if (mes_key != null && !"none".equals(mes_key)) {
//				insertParam.put("mes_key", mes_key);
//			} else {
//				insertParam.put("mes_key", String.valueOf(newIfno_if));
//			}

			System.out.println(" -- EXCEPTION OUTPUT PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.storage_confirm_summary_cancel_if(insertParam);
			insertResult += wbusaMapper.storage_confirm_summary_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class) // 생산실적등록
	public int semiProduction_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String sdate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String qty = parts[3];
			String lineno = "";
			String factory = parts[5];
			String roomcode = "";

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_semiProduction_sub_if(today);
			String maxIfno_real_if = wbusaMapper.selectIfno_semiProduction_input_if(today);
			String newIfno_if;
			String newIfno_real_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}
			if (maxIfno_real_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_real_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_real_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_real_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));
			insertParam.put("ifno_real_if", String.valueOf(newIfno_real_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// 호기 작업
			// 'H01 || 라벨에 lineno / 공백이면 99 / 형식은 2자리로./ 최종값은 H0101
			if (lineno == null || lineno.trim().isEmpty()) {
				lineno = "H0199";
			} else {
				lineno = "H01" + String.format("%02d", Integer.parseInt(parts[4]));
			}

			// 작업장
			String wccode = "";
			if ("PUEBLA".equals(factory)) {
				wccode = "P0001";
				roomcode = "S001";
			} else {
				wccode = "C0001";
				roomcode = "F001";
			}

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("sdate", sdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("qty", qty);
			insertParam.put("lineno", lineno);
			insertParam.put("wccode", wccode);
			insertParam.put("condate", condate);
			insertParam.put("line", parts[4]);
			insertParam.put("roomcode", roomcode);

			System.out.println(" -- WORK MOVE PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.semiProduction_confirm_summary_updateYn(insertParam);
			insertResult += wbusaMapper.semiProduction_confirm_summary_sub_if(insertParam);
			wbusaMapper.transfer_confirm_summary_if(insertParam); // 영업이송
			List<Map<String, Object>> list = wbusaMapper.semiProduction_confirm_count(insertParam);
			int seqRealIf = Integer.parseInt(newIfno_real_if.substring(8));
			for (int k = 0; k < list.size(); k++) {
				String loopIfno_real_if = today + String.format("%04d", seqRealIf++);
				insertParam.put("ifno_real_if", loopIfno_real_if);

				insertParam.put("childcode", list.get(k).get("CHILDCODE"));
				insertParam.put("qtyper", list.get(k).get("QTYPER"));
				BigDecimal qtyper = (BigDecimal) list.get(k).get("QTYPER"); // DB에서 읽은 값
				BigDecimal qtyVal = new BigDecimal(qty); // 문자열을 BigDecimal로 변환
				// 곱셈 후 소수점 4자리까지 반올림
				BigDecimal result = qtyper.multiply(qtyVal).setScale(4, RoundingMode.HALF_UP);
				insertParam.put("inqty", result);
				insertParam.put("messeq", k + 1);

				insertResult += wbusaMapper.semiProduction_confirm_summary_input_if(insertParam);
			}

			System.out.println(insertResult);
			if (insertResult < 3) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class) // 생산실적 등록 취소
	public int semiProduction_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String sdate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String qty = parts[3];
			String lineno = "";
			String factory = parts[5];
			String meskey = parts[6];
			String roomcode = "";

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_semiProduction_sub_if(today);
			String maxIfno_real_if = wbusaMapper.selectIfno_semiProduction_input_if(today);
			String newIfno_if;
			String newIfno_real_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}
			if (maxIfno_real_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_real_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_real_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_real_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));
			insertParam.put("ifno_real_if", String.valueOf(newIfno_real_if));
			insertParam.put("sdate", sdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("qty", qty);
			insertParam.put("condate", condate);

			// WMS KEY 조회
			// String mes_key = wbmexMapper.selectWmskey_semiProduction(insertParam);

			if (meskey != null && !"none".equals(meskey)) {
				insertParam.put("mes_key", meskey);
			} else {
				insertParam.put("mes_key", String.valueOf(newIfno_if));
			}
			// 호기 작업
			// 'H01 || 라벨에 lineno / 공백이면 99 / 형식은 2자리로./ 최종값은 H0101
			if (lineno == null || lineno.trim().isEmpty()) {
				lineno = "H0199";
			} else {
				lineno = "H01" + String.format("%02d", Integer.parseInt(parts[4]));
			}

			// 작업장
			String wccode = "";
			if ("PUEBLA".equals(factory)) {
				wccode = "P0001";
				roomcode = "S001";
			} else {
				wccode = "C0001";
				roomcode = "F001";
			}

			insertParam.put("lineno", lineno);
			insertParam.put("wccode", wccode);
			insertParam.put("roomcode", roomcode);
			insertParam.put("line", parts[4]);
			// PARAM 이 가지고있던 데이터 넣어주기

			System.out.println(" -- WORK MOVE PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.semiProduction_confirm_summary_cancel_updateYn(insertParam);
			insertResult += wbusaMapper.semiProduction_confirm_summary_cancel_sub_if(insertParam);
			wbusaMapper.transfer_confirm_summary_cancel_if(insertParam); // 영업이송
			List<Map<String, Object>> list = wbusaMapper.semiProduction_confirm_count(insertParam);

			if (list.size() > 0) {
				insertParam.put("childcode", list.get(1).get("CHILDCODE"));
				insertParam.put("qtyper", list.get(1).get("QTYPER"));
				BigDecimal qtyper = (BigDecimal) list.get(1).get("QTYPER"); // DB에서 읽은 값
				BigDecimal qtyVal = new BigDecimal(qty); // 문자열을 BigDecimal로 변환
				// 곱셈 후 소수점 4자리까지 반올림
				BigDecimal result = qtyper.multiply(qtyVal).setScale(4, RoundingMode.HALF_UP);
				insertParam.put("inqty", result);
				insertResult += wbusaMapper.semiProduction_confirm_summary_cancel_input_if(insertParam);
			}

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class) // 불출반납 인터페이스
	public int wipReturn_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String indate = parts[0];
			String condate = parts[0].replaceAll("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String roomcode = "";
			String wccode = "";

			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}




			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_wipReturn_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("indate", indate);
			insertParam.put("condate", condate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("roomcode", roomcode);
			insertParam.put("wccode", wccode);

			System.out.println(" -- WIP RETURN PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.wipReturn_confirm_summary_if(insertParam);
			insertResult += wbusaMapper.wipReturn_confirm_summary_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int wipReturn_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String indate = parts[0];
			String condate = parts[0].replaceAll("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String mes_key = parts[7];
			String roomcode = "";
			String wccode = "";
			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_wipReturn_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("indate", indate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("roomcode", roomcode);
			insertParam.put("wccode", wccode);
			insertParam.put("condate", condate);
			insertParam.put("mes_key", mes_key);

			// 251110 DH - 프론트에서 mes_key값을 가져오므로 주석 처리
//			// WMS KEY 조회
//			String mes_key = wbmexMapper.selectWmskey_wipReturnSummary(insertParam);
//			
//			if (mes_key != null && !"none".equals(mes_key)) {
//				insertParam.put("mes_key", mes_key);
//			} else {
//				insertParam.put("mes_key", String.valueOf(newIfno_if));
//			}

			System.out.println(" -- WIP RETURN PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.wipReturn_confirm_summary_cancel_if(insertParam);
			insertResult += wbusaMapper.wipReturn_confirm_summary_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int incomingReturn_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String indate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_incomingReturn_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("indate", indate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);

			System.out.println(" -- WIP RETURN PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.incomingReturn_confirm_summary_if(insertParam);
			insertResult += wbusaMapper.incomingReturn_confirm_summary_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int incomingReturn_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String indate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String mes_key = parts[7];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_incomingReturn_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			// insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("indate", indate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("mes_key", mes_key);

			// 251110 DH - 프론트에서 mes_key값을 가져오므로 주석 처리
//			// WMS KEY 조회
//			String mes_key = wbmexMapper.selectWmskey_incomingReturnSummary(insertParam);
//			
//			if (mes_key != null && !"none".equals(mes_key)) {
//				insertParam.put("mes_key", mes_key);
//			} else {
//				insertParam.put("mes_key", String.valueOf(newIfno_if));
//			}

			System.out.println(" -- WIP RETURN PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.incomingReturn_confirm_summary_cancel_if(insertParam);
			insertResult += wbusaMapper.incomingReturn_confirm_summary_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}
	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int loadreturn_confirm_detail_cancel(@RequestBody List<String> param) {
		
		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		
		// ifno, ifno_yn, mes_key
		
		System.out.println(param);
		System.out.println("param size: " + param.size());
		
		for (int i = 0; i < param.size(); i++) {
			
			String uniqueValue = (String) param.get(i);
			
			String[] parts = uniqueValue.split("\\|");
			
			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));
			
			String indate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String mes_key = parts[7];
			String roomcode = "";
			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();
			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomcode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage)) {	// 아웃사이드 일리노이창고
				roomcode = "Q001";
			}else { // 자재창고일때
				roomcode = "M001";
			}
			
			// ifno와 mes_key 생성
			insertParam.put("ifno_if", "DE" + mes_key.substring(2));
			
			// insertParam.put("mes_key", String.valueOf(newIfno_if));
			
			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("indate", indate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("roomcode", roomcode);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("mes_key", mes_key);
			
			System.out.println(" -- LOAD RETURN INTF CANCEL PARAM --");
			System.out.println(insertParam);
			
			insertResult += wbusaMapper.loadReturn_confirm_detail_cancel_if(insertParam);
			insertResult += wbusaMapper.loadReturn_confirm_detail_cancel_updateYn(insertParam);
			
			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}
			
		}
		
		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class) // 공장 이동 등록
	public int factoryReceiving_confirm_summary(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String sdate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4]; // 입고 공장
			String storage = parts[5]; // 입고 창고
			String barcode = parts[6]; // 입고 창고
			String inroom = " "; // 입고 공장+창고
			String outroom = " "; // 출고 공장+창고

			if ("Saltillo".equals(factory)) { // 살티오 공장
				if ("Material".equals(storage)) { // 살티오 메테리얼
					outroom = "S001"; // 푸에블라 프로덕트 -> 살티오 메테리얼
					inroom = "M001";
				} else if ("Fabric".equals(storage)) { // 살티오 페브릭
					outroom = "P001"; // 푸에블라 메테리얼 -> 살티오 페브릭
					inroom = "O001";
				}
			} else { // 푸에블라공장
				if ("MATERIAL".equals(storage)) { // 푸에블라 메테리얼
					outroom = "O001"; // 살티오 페브릭 -> 푸에블라 메테리얼
					inroom = "P001";
				} else if ("PRODUCT".equals(storage)) { // 푸에블라 프로덕트
					outroom = "M001"; // 살티오 메테리얼 -> 푸에블라 프로덕트
					inroom = "S001";
				}
			}

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_factoryReceiving_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("sdate", sdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("inroom", inroom);
			insertParam.put("outroom", outroom);

			System.out.println(" -- MOVEMENT STORAGE PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.factoryReceiving_confirm_summary_if(insertParam);
			insertResult += wbusaMapper.factoryReceiving_confirm_summary_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int factoryReceiving_confirm_summary_cancel(@RequestBody List<String> param) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {

			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String sdate = parts[0];
			String condate = parts[0].replace("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String inroom = "";
			String outroom = "";

			if ("Saltillo".equals(factory)) { // 살티오 공장
				if ("Material".equals(storage)) { // 살티오 메테리얼
					outroom = "S001"; // 푸에블라 프로덕트 -> 살티오 메테리얼
					inroom = "M001";
				} else if ("Fabric".equals(storage)) { // 살티오 페브릭
					outroom = "P001"; // 푸에블라 메테리얼 -> 살티오 페브릭
					inroom = "O001";
				}
			} else { // 푸에블라공장
				if ("MATERIAL".equals(storage)) { // 푸에블라 메테리얼
					outroom = "O001"; // 살티오 페브릭 -> 푸에블라 메테리얼
					inroom = "P001";
				} else if ("PRODUCT".equals(storage)) { // 푸에블라 프로덕트
					outroom = "M001"; // 살티오 메테리얼 -> 푸에블라 프로덕트
					inroom = "S001";
				}
			}

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String maxIfno_if = wbusaMapper.selectIfno_factoryReceiving_if(today);
			String newIfno_if;

			if (maxIfno_if == null) {
				// 오늘 처음 생성이면 0001부터
				newIfno_if = today + "0001";
			} else {
				// 마지막 4자리 추출 후 +1
				String seqStr = maxIfno_if.substring(8); // 뒤 4자리
				int seq = Integer.parseInt(seqStr) + 1;
				newIfno_if = today + String.format("%04d", seq);
			}

			// ifno와 mes_key 생성
			insertParam.put("ifno_if", String.valueOf(newIfno_if));

			// insertParam.put("mes_key", String.valueOf(newIfno_if));

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("sdate", sdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("inroom", inroom);
			insertParam.put("outroom", outroom);

			// WMS KEY 조회
			String mes_key = wbusaMapper.selectWmskey_factoryReceiving(insertParam);

			if (mes_key != null && !"none".equals(mes_key)) {
				insertParam.put("mes_key", mes_key);
			} else {
				insertParam.put("mes_key", String.valueOf(newIfno_if));
			}

			System.out.println(" -- EXCEPTION OUTPUT PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.factoryReceiving_confirm_summary_cancel_if(insertParam);
			insertResult += wbusaMapper.factoryReceiving_confirm_summary_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int unreceivedItemDeliveryConfirm(List<String> list) {
		// 날짜, 거래처, 아이템코드 여부로 그룹
		// List<ProductVO> group = wbmexMapper.groupInbound(list);
		System.out.println("LIST -----------");
		System.out.println(list);
		int insertResult = 0;

		for (int i = 0; i < list.size(); i++) {
			String uniqueValue = (String) list.get(i);

			String[] parts = uniqueValue.split("\\|");

			String condate = parts[0].replace("-", "");
			String date = parts[0];
			String invoice_no = parts[1];

			Map<String, Object> iParam = new HashMap<String, Object>();
			iParam.put("condate", condate);
			iParam.put("invoice_no", invoice_no);
			iParam.put("date", date);

//			List<Map<String, Object>> intfList = wbusaMapper.selectInvoiceIntfList(iParam);
//
//			System.out.println("INTF List --");
//			System.out.println(intfList);

//			if("PUEBLA".equals(factory)) {
//				if("MATERIAL".equals(storage)) {
//					roomCode = "P001" ;
//				}else if("PRODUCT".equals(storage)) {
//					roomCode = "S001" ;
//				}
//			}else {
//				if("Material".equals(storage)) {
//					roomCode = "M001" ;
//				}else if("Fabric".equals(storage)) {
//					roomCode = "O001" ;
//				}
//			}
//			for (int j = 0; j < intfList.size(); j++) {
//				Map<String, Object> map = new HashMap<String, Object>();
//				Map<String, Object> param = intfList.get(j);
//				map.put("cuddiv", "D");
//				map.put("condate", condate);
//				map.put("date", date);
//				map.put("ifno", param.get("IFNO"));
//				map.put("mes_key", param.get("MES_KEY"));
//				map.put("invoice_no", invoice_no);
//
//				System.out.println("=== MAP 내용 출력 ===");
//				for (String key : map.keySet()) {
//					System.out.println(key + " : " + map.get(key) + " (null여부: " + (map.get(key) == null) + ")");
//				}
//				System.out.println("==================");
//				insertResult += wbmexMapper.unreceivedItemDeliveryConfirm(map);
//				wbptMapper.removeInvoiceWmskey(map);
//			}
//			insertResult += wbusaMapper.unreceivedItemDeliveryConfirm(iParam);
//			wbptMapper.removeInvoiceWmskey(iParam);
			insertResult += wbusaMapper.unreceivedItemDeliveryComplete(iParam);

		}
		return insertResult;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int unreceivedItemDeliveryConfirmCancel(List<String> list) {

		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		// 날짜, 거래처, 아이템코드 여부로 그룹
		// List<ProductVO> group = wbmexMapper.groupInbound(list);
		System.out.println("LIST -----------");
		System.out.println(list);
		int removeCount = 0;

		// 인터페이스에 필요한 정보 가져와야함.

		for (int i = 0; i < list.size(); i++) {

			String uniqueValue = (String) list.get(i);

			String[] parts = uniqueValue.split("\\|");

			String condate = parts[0].replace("-", "");
			String date = parts[0];
			String invoice_no = parts[1];

			Map<String, Object> iParam = new HashMap<String, Object>();

			iParam.put("condate", condate);
			iParam.put("date", date);
			iParam.put("invoice_no", invoice_no);

//			List<Map<String, Object>> reParam = wbusaMapper.restoreDeliveredIntfList(iParam);
//			System.out.println(reParam);
//			int pinCount = reParam.size();
			
//			for (int j = 0; j < reParam.size(); j++) {
//				Map<String,Object> intfParam = reParam.get(j); 
//				Map<String, Object> tempMap = new HashMap<>();
//
//				for (Map.Entry<String, Object> entry : intfParam.entrySet()) {
//				    tempMap.put(entry.getKey().toLowerCase(), entry.getValue());
//				}
//
//				intfParam.clear();
//				intfParam.putAll(tempMap);
//				String maxIfno_if = wbmexMapper.selectIfno_unreceivedItemDelivery_if(today);
//				String newIfno_if;
//
//				if (maxIfno_if == null) {
//					// 오늘 처음 생성이면 0001부터
//					newIfno_if = today + "0001";
//				} else {
//					// 마지막 4자리 추출 후 +1
//					String seqStr = maxIfno_if.substring(8); // 뒤 4자리
//					int seq = Integer.parseInt(seqStr) + 1;
//					newIfno_if = today + String.format("%04d", seq);
//				}
//
//				intfParam.put("ifno_if", String.valueOf(newIfno_if));
//				intfParam.put("mes_key", String.valueOf(newIfno_if));
//				intfParam.put("invoice_no", invoice_no);
//				intfParam.put("date", date);
//				
//				int intfCount = wbmexMapper.restoreDeliveredIntf(intfParam);
//				wbptMapper.updateInvoiceWmsKey(intfParam);
//				
//				if(intfCount == 1) {
//					pinCount--;
//				}
//				
//			}
			
//			String maxIfno = wbusaMapper.selectIfno_unreceivedItemDelivery_if(today);
//			long ifnoSeq;
//
//			if (maxIfno == null || maxIfno.isEmpty()) {
//				ifnoSeq = Long.parseLong(today + "0000");
//			}else {
//				String num = maxIfno;
//				ifnoSeq = Long.parseLong(num);
//			}
//
//			List<Map<String, Object>> rows = new ArrayList<>(reParam.size());
//			for(Map<String, Object> src : reParam) {
//				Map<String, Object> row = new HashMap<>();
//
//				String newIfno = String.format("%012d", ++ifnoSeq);
//
//				row.put("ifno", newIfno);
//				row.put("mes_key", newIfno);
//				row.put("invoice_no", invoice_no);
//				row.put("date", date);
//
//				row.put("itemcode", String.valueOf(src.get("ITEMCODE")));
//				row.put("condate", String.valueOf(src.get("CONDATE")));
//			    row.put("qty",     String.valueOf(src.get("QTY")));
//
//				rows.add(row);
//			}
//
//			Map<String, Object> params = new HashMap<>();
//			params.put("rows", rows);
//			if(pinCount == 0) {
//				System.out.println("pinCount 0  skip -- ");
//				String newIfno = String.format("%012d", ++ifnoSeq);
//				params.put("ifno", newIfno);
//				params.put("mes_key", newIfno);
//				params.put("invoice_no", invoice_no);
//				params.put("date", date);
//				wbptMapper.updateInvoiceWmsKey2(params);
//				continue;
//			}
//			int insCount = wbusaMapper.restoreDeliveredIntf(params);
//			wbptMapper.updateInvoiceWmsKey(params);
//
//			pinCount = rows.size() - insCount;
//
//			removeCount += pinCount;
//
//			System.out.println("IPARAM -- ");
//			System.out.println(iParam);
//
//			System.out.println("reParam -- ");
//			System.out.println(reParam);
//
//			System.out.println("pinCount -- ");
//			System.out.println(pinCount);
//
//			System.out.println("removeCount -- ");
//			System.out.println(removeCount);
//
//			// removeCount = wbptMapper.removeInvoiceWmskey(iParam);
			removeCount +=  wbusaMapper.unreceivedItemDeliveryCompleteCancel(iParam);

		}
		return removeCount;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int semiProduction_confirm_cancel(@RequestBody List<String> param) {
		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {
			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String sdate = parts[0];
			String condate = parts[0].replaceAll("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String meskey = parts[7];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();
			String ifno = "";
			// null 체크, 길이 체크 후 substring
			if (meskey != null && meskey.length() > 2) {
				ifno = "D" + meskey.substring(1); // 앞 첫글자 D로 변경 → "D12345"
			}
			insertParam.put("ifno_if", ifno);

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("sdate", sdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("meskey", meskey);

			System.out.println(" -- SEMI PRODUCTION PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.deleteWorksub(insertParam);
			insertResult += wbusaMapper.deleteWorkInput(insertParam);
			insertResult += wbusaMapper.deleteEntersub(insertParam);
			insertResult += wbusaMapper.semiProduction_confirm_summary_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 4) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int productionDetail_confirm_cancel(@RequestBody List<String> param) {
		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		// ifno, ifno_yn, mes_key
		// T_MM_DELIVERYSUB_IF - 135라인
		// T_MM_DELIVERYSUB_REAL_IF - 150라인

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {
			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String sdate = parts[0];
			String condate = parts[0].replaceAll("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String factory = parts[4];
			String storage = parts[5];
			String barcode = parts[6];
			String meskey = parts[7];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String ifno = "";
			// null 체크, 길이 체크 후 substring
			if (meskey != null && meskey.length() > 2) {
				ifno = "D" + meskey.substring(1); // 앞 첫글자 D로 변경 → "D12345"
			}
			insertParam.put("ifno_if", ifno);

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("sdate", sdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("factory", factory);
			insertParam.put("storage", storage);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("meskey", meskey);

			System.out.println(" -- PRODUCTION PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.deleteWorksub(insertParam);
			insertResult += wbusaMapper.deleteWorkInput(insertParam);
			insertResult += wbusaMapper.production_confirm_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 3) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}

		return 1;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public int salesTransfer_confirm_cancel(@RequestBody List<String> param) {
		// 오늘 날짜 (yyyyMMdd)
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

		System.out.println(param);
		System.out.println("param size: " + param.size());

		for (int i = 0; i < param.size(); i++) {
			String uniqueValue = (String) param.get(i);

			String[] parts = uniqueValue.split("\\|");

			System.out.println("=== Loop " + (i + 1) + " / " + param.size() + " ===");
			System.out.println("uniqueValue: " + uniqueValue);
			System.out.println("parts: " + Arrays.toString(parts));

			String sdate = parts[0];
			String condate = parts[0].replaceAll("-", "");
			String itemcode = parts[1];
			String intf_yn = parts[2];
			String qty = parts[3];
			String barcode = parts[4];
			String meskey = parts[5];

			int insertResult = 0;
			Map<String, Object> insertParam = new HashMap<String, Object>();

			String ifno = "";
			// null 체크, 길이 체크 후 substring
			if (meskey != null && meskey.length() > 2) {
				ifno = "D" + meskey.substring(1); // 앞 첫글자 D로 변경 → "D12345"
			}
			insertParam.put("ifno_if", ifno);

			// PARAM 이 가지고있던 데이터 넣어주기
			insertParam.put("sdate", sdate);
			insertParam.put("itemcode", itemcode);
			insertParam.put("intf_yn", intf_yn);
			insertParam.put("qty", qty);
			insertParam.put("barcode", barcode);
			insertParam.put("condate", condate);
			insertParam.put("meskey", meskey);

			System.out.println(" -- PRODUCTION PARAM --");
			System.out.println(insertParam);

			insertResult += wbusaMapper.deleteEntersub(insertParam);
			insertResult += wbusaMapper.salesTransfer_confirm_cancel_updateYn(insertParam);

			System.out.println(insertResult);
			if (insertResult < 2) {
				throw new RuntimeException("Task Error : Count Miss");
			}

		}




		return 1;
	}


	/* 반품검사 인터페이스 삭제 */
	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public Map<String, Object> returnInspection_intf_delete(List<String> list) {
		// 날짜, 거래처, 아이템코드 여부로 그룹
		System.out.println("LIST -----------");
		System.out.println(list);
		int magamCnt = 0;
		int buyCnt = 0;
		int laterCnt = 0;
		int noExistCnt = 0;
		int lockCnt = 0;
		for (int i = 0; i < list.size(); i++) {
			String uniqueValue = (String) list.get(i);

			String[] parts = uniqueValue.split("\\|");

			String iid = parts[0];
			String indate = parts[1];
			String condate = parts[1].replace("-", "");
			String factory = parts[2];
			String storage = parts[3];
			String barcode = parts[4];
			String mes_key = parts[5];
			String source2 = parts[6];

			String roomCode = "";

			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomCode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomCode = "Q001";
			}else { // 자재창고일때
				roomCode = "M001";
			}


			Map<String, Object> map = new HashMap<String, Object>();

			map.put("cuddiv", "D");
			map.put("roomcode", roomCode);
			map.put("condate", condate);
			map.put("mes_key", mes_key);
			map.put("meskey", mes_key);
			map.put("ifno", "D"+mes_key.substring(1));
			map.put("iid", iid);

			System.out.println("==================");

			// 검증 시작
			// 1️⃣ 마감 여부
			int magam = wbusaMapper.selectIncomingCloseCnt(map);
			if (magam > 0) {
				magamCnt++;
				continue; // 다음 데이터로 넘어감
			}

			// wbmexMapper.inbound_confirm(map); // 입고내역에 인터페이스 정보 업데이트
			map.put("factory", factory);
			map.put("storage", storage);
			wbusaMapper.returnInspection_intf_delete1(map);
			wbusaMapper.returnInspection_intf_delete2(map);
			wbusaMapper.returnInspection_intf_wms_delete(map);

		}

		Map<String, Object> result = new HashMap<>();
		result.put("magamCnt", magamCnt);
		result.put("buyCnt", buyCnt);
		result.put("laterCnt", laterCnt);
		result.put("noExistCnt", noExistCnt);
		result.put("lockCnt", lockCnt);

		return result;
	}

	/* 창고검사 인터페이스 삭제 */
	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public Map<String, Object> storageInspection_intf_delete(List<String> list) {
		// 날짜, 거래처, 아이템코드 여부로 그룹
		System.out.println("LIST -----------");
		System.out.println(list);
		int magamCnt = 0;
		int buyCnt = 0;
		int laterCnt = 0;
		int noExistCnt = 0;
		int lockCnt = 0;
		for (int i = 0; i < list.size(); i++) {
			String uniqueValue = (String) list.get(i);

			String[] parts = uniqueValue.split("\\|");

			String iid = parts[0];
			String indate = parts[1];
			String condate = parts[1].replace("-", "");
			String factory = parts[2];
			String storage = parts[3];
			String barcode = parts[4];
			String mes_key = parts[5];
			String source2 = parts[6];

			String roomCode = "";

			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomCode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomCode = "Q001";
			}else { // 자재창고일때
				roomCode = "M001";
			}


			Map<String, Object> map = new HashMap<String, Object>();

			map.put("cuddiv", "D");
			map.put("roomcode", roomCode);
			map.put("condate", condate);
			map.put("mes_key", mes_key);
			map.put("meskey", mes_key);
			map.put("ifno", "D"+mes_key.substring(1));
			map.put("iid", iid);

			System.out.println("==================");

			// 검증 시작
			// 1️⃣ 마감 여부
			int magam = wbusaMapper.selectIncomingCloseCnt(map);
			if (magam > 0) {
				magamCnt++;
				continue; // 다음 데이터로 넘어감
			}

			map.put("factory", factory);
			map.put("storage", storage);
			wbusaMapper.storageInspection_intf_delete(map);
			wbusaMapper.storageInspection_intf_wms_delete(map);

		}

		Map<String, Object> result = new HashMap<>();
		result.put("magamCnt", magamCnt);
		result.put("buyCnt", buyCnt);
		result.put("laterCnt", laterCnt);
		result.put("noExistCnt", noExistCnt);
		result.put("lockCnt", lockCnt);

		return result;
	}

	@Override
	@Transactional(transactionManager = "usaTransactionManager", rollbackFor = Exception.class)
	public Map<String, Object> scrap_intf_delete(List<String> list) {
		// 날짜, 거래처, 아이템코드 여부로 그룹
		System.out.println("LIST -----------");
		System.out.println(list);
		int magamCnt = 0;
		int buyCnt = 0;
		int laterCnt = 0;
		int noExistCnt = 0;
		int lockCnt = 0;
		for (int i = 0; i < list.size(); i++) {
			String uniqueValue = (String) list.get(i);

			String[] parts = uniqueValue.split("\\|");

			String iid = parts[0];
			String indate = parts[1];
			String condate = parts[1].replace("-", "");
			String factory = parts[2];
			String storage = parts[3];
			String barcode = parts[4];
			String mes_key = parts[5];
			String source2 = parts[6];

			String roomCode = "";

			if ("PRODUCT".equalsIgnoreCase(storage)) { // 제품창고
				roomCode = "F001";
			}else if("OUTSIDE".equalsIgnoreCase(storage.trim())) {	// 아웃사이드 일리노이창고
				roomCode = "Q001";
			}else { // 자재창고일때
				roomCode = "M001";
			}


			Map<String, Object> map = new HashMap<String, Object>();

			map.put("cuddiv", "D");
			map.put("roomcode", roomCode);
			map.put("condate", condate);
			map.put("mes_key", mes_key);
			map.put("meskey", mes_key);
			map.put("ifno", "D"+mes_key.substring(1));
			map.put("iid", iid);

			System.out.println("==================");

			// 검증 시작
			// 1️⃣ 마감 여부
			int magam = wbusaMapper.selectIncomingCloseCnt(map);
			if (magam > 0) {
				magamCnt++;
				continue; // 다음 데이터로 넘어감
			}

			map.put("factory", factory);
			map.put("storage", storage);
			wbusaMapper.scrap_intf_delete(map);
			wbusaMapper.scrap_intf_wms_delete(map);

		}

		Map<String, Object> result = new HashMap<>();
		result.put("magamCnt", magamCnt);
		result.put("buyCnt", buyCnt);
		result.put("laterCnt", laterCnt);
		result.put("noExistCnt", noExistCnt);
		result.put("lockCnt", lockCnt);

		return result;
	}
}