package com.example.demo.vo;

import lombok.Data;

@Data
public class RealStockNotScanVO {
	private String date;
	private String itemcode;
	private String qty;
	private String barcode;
	private String factory;
	private String storage;
	private String loginid;
}
