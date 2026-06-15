package com.example.demo.vo;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class StockVO {
	private String rn;
	
	private String sdate;
	private String car;
	private String itemcode;
	private String oitemcode;
	private String itemname;
	private String qty;
	private String type;
	private String barcode;
	private String lotdate;
	private String ymdhms;
	private String print_qty;
	private String print_ymdhms;
	private String factory;
	private String storage;
	private String sumqty;
	private String location;
	private String indate;
	private String hhmm;
	private String bdate;
	private String loginid;
	private String use_yn;
	private String pname;
	private String pno;
	private String ldate;
	private String wip;
	private String barcode_count;
	private String kind;
	private String time;
	private String work;
	private String last_status;
	private String madate;
	
	private String llocation;
	private String rlocation;
	private String system_itemcode;
	private String system_itemname;
	private String rqty;
	private String lqty;
	private String diffqty;
	private String cnt_real;
	private String cnt_system;
	private String flag;
	private String flag2;
	
	private String countqty;
	private String stockqty;
	private String noscanqty;
	
	private String difflocation;
	
	private BigDecimal noqty1;
	private BigDecimal noqty2;
	private BigDecimal unpackqty;
	
	private String lastjob;
	private BigDecimal plusqty;
	private BigDecimal minusqty;
	private String sending;
	
	private String useynnow;
	private String barcodescan;
	private String adjust;
	private String useynbarcode;
	private String spec;
	
	private String memo;
	private String inout;
	
	private Long totalCount;
	private BigDecimal totalQty;
	private BigDecimal totalErpQty;
	private String locationbackupqty;

	private String custcode;


	public Long getTotalCount() { return totalCount; }
	public void setTotalCount(Long totalCount) { this.totalCount = totalCount; }

	public BigDecimal getTotalQty() { return totalQty; }
	public void setTotalQty(BigDecimal totalQty) { this.totalQty = totalQty; }
	
	public BigDecimal getTotalErpQty() { return totalErpQty; }
	public void setTotalErpQty(BigDecimal totalErpQty) { this.totalErpQty = totalErpQty; }
	


}
