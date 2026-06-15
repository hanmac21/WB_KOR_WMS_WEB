package com.example.demo.vo;

import java.util.List;

import lombok.Data;

@Data
public class ProductVO {
	private String iidlist;
	private String iid;
	
	private String rn;
	
	private String sdate;
	private String location;
	private String itemtype;
	private String car;
	private String itemcode;
	private String itemname;
	private String spec;
	private String oitemcode;
	private String oitemname;
	private String spec2;
	private String labelcolor;
	private String hhmm;
	private String time;
	private String bdate;
	private String source2;
	
	//inbound
	private String indate;
	private String factory;
	private String storage;
	private String type;
	private String username;
	private String loginid;
	private String cucode;
	private String cname;
	private String qty;
	private String okqty;
	private String ngqty;
	private String barcode;
	private String ymdhms;
	private String invoice_no;
	private String invoiceno;
	private String blcode;
	private String container_no;
	private String meskey;
	private String intf_yn;
	private String mes_key;
	
	//outbound
	private String outdate;
	private String custcode;
	private String custname;
	private String cu_sangho;
	private String cno;
	private String confirm_yn;
	
	//bom
	private String id;
	private String subname;
	private String condate;
	private String itemcode_1;
	private String itemname_1;
	private String spec_1;
	private String qtyper;
	private String orderidx;
	private String parentId;
	
	//bom - children
	private List<ProductVO> children;
	private boolean isParent;
	private boolean isChild;
	
	
	
	
	
	
	
	
	
	
	
	
	
}
