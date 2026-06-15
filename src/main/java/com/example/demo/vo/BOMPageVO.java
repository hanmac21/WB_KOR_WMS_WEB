package com.example.demo.vo;

import java.util.List;

import lombok.Data;

@Data
public class BOMPageVO {
	
	private List<ProductVO> data;           // Tree 구조 데이터
    private int totalCount;                 // 전체 데이터 개수  
    private int currentPage;                // 현재 페이지
    private int totalPages;                 // 전체 페이지 수
    
    // 생성자, getter, setter
    public BOMPageVO() {}
    
    public BOMPageVO(List<ProductVO> data, int totalCount, int currentPage, int pageSize) {
        this.data = data;
        this.totalCount = totalCount;
        this.currentPage = currentPage;
        this.totalPages = (int) Math.ceil((double) totalCount / pageSize);
    }
}
