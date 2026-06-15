package com.example.demo.vo;

import lombok.Data;

@Data
public class WarehouseVO {
	
	private int iid;
	private String barcode;
	private String rack;
	private String module;
	private String levelcode;
	private String position;
	private String factory;
	private String storage;
}
