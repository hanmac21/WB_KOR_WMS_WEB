package com.example.demo.mapper.wbpt;

import com.example.demo.vo.RealStockVO;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface WbUlsanMapper {
    List<RealStockVO> read_realStock(Map<String, Object> paramMap);

    List<String> read_realStock_dates(Map<String, Object> paramMap);

    List<RealStockVO> read_realStockSummary(Map<String, Object> paramMap);

    int getRealStockTotalCount(Map<String, Object> paramMap);

    int getRealStockSummaryTotalCount(Map<String, Object> paramMap);

    List<Map<String, Object>> read_realStock_all(Map<String, Object> searchParam);

    List<Map<String, Object>> read_realStockSummary_all(Map<String, Object> searchParam);

    String updateTotalQtyStockCount(Map<String, Object> param);

    Map<String, Object> search_stockInfo(String barcode);

    List<Map<String, Object>> show_stockHistory(String barcode);

    int updateIncomingInLocation(Map<String, Object> param);

    int updateIncoming(Map<String, Object> param);

    int updateIncomingInStock(Map<String, Object> param);

    void updateLocationBarcodeByY(Map<String, Object> param);

    int updateLoad(Map<String, Object> param);

    int updateLoadInStock(Map<String, Object> param);

    int updateRealStock(Map<String, Object> param);

    List<Map<String, Object>> readIncomingDetail(Map<String, Object> queryParams);

    List<Map<String, Object>> readIncomingSummary(Map<String, Object> queryParams);

    List<Map<String, Object>> readLoadDetail(Map<String, Object> queryParams);

    List<Map<String, Object>> readLoadSummary(Map<String, Object> queryParams);

    List<Map<String, Object>> readValidationDetail(Map<String, Object> queryParams);
}
