package com.example.demo.vo;

import java.util.List;

import lombok.Data;

@Data
public class ProductPageVO {
	
    private List<ProductVO> data;
    private int totalCount;
    private int currentPage;
    private int totalPages;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrev;
    private ProductVO pvo;
    
    // 기본 생성자
    public ProductPageVO() {}
    
    // toString 메서드 (디버깅용)
    @Override
    public String toString() {
        return "ProductPageVO{" +
                "totalCount=" + totalCount +
                ", currentPage=" + currentPage +
                ", totalPages=" + totalPages +
                ", pageSize=" + pageSize +
                ", dataSize=" + (data != null ? data.size() : 0) +
                ", hasNext=" + hasNext +
                ", hasPrev=" + hasPrev +
                '}';
    }
}
