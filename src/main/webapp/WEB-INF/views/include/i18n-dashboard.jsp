<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<script>
	window.I18N = Object.assign(window.I18N || Object.create(null), {
	    /* Dashboard Common */
	    "common.all": "<spring:message code='common.all' javaScriptEscape='true'/>",
	    "common.count": "<spring:message code='common.count' javaScriptEscape='true'/>",
	    "common.unknownError": "<spring:message code='common.unknownError' javaScriptEscape='true'/>",
	    "common.fetchFailed": "<spring:message code='common.fetchFailed' javaScriptEscape='true'/>",
	    "common.fetchError": "<spring:message code='common.fetchError' javaScriptEscape='true'/>",
	    "common.read": "<spring:message code='common.read' javaScriptEscape='true'/>",
	    "common.refresh": "<spring:message code='common.refresh' javaScriptEscape='true'/>",
	    "common.excelDownload": "<spring:message code='common.excelDownload' javaScriptEscape='true'/>",
	    "common.noData": "<spring:message code='common.noData' javaScriptEscape='true'/>",
	    "common.units": "<spring:message code='common.units' javaScriptEscape='true'/>",
	    "common.items": "<spring:message code='common.items' javaScriptEscape='true'/>",
	
	    /* Dashboard Menu */
	    "dashboard.title": "<spring:message code='dashboard.title' javaScriptEscape='true'/>",
	    "dashboard.stock": "<spring:message code='dashboard.stock' javaScriptEscape='true'/>",
	    "dashboard.production": "<spring:message code='dashboard.production' javaScriptEscape='true'/>",
	    "dashboard.requirement.weekly": "<spring:message code='dashboard.requirement.weekly' javaScriptEscape='true'/>",
	    "dashboard.requirement": "<spring:message code='dashboard.requirement' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage": "<spring:message code='dashboard.fabricUsage' javaScriptEscape='true'/>",
	    "dashboard.sales": "<spring:message code='dashboard.sales' javaScriptEscape='true'/>",
	
	    /* Production Dashboard */
	    "dashboard.production.date": "<spring:message code='dashboard.production.date' javaScriptEscape='true'/>",
	    "dashboard.production.factory": "<spring:message code='dashboard.production.factory' javaScriptEscape='true'/>",
	    "dashboard.production.process": "<spring:message code='dashboard.production.process' javaScriptEscape='true'/>",
	
	    "dashboard.production.filter.part": "<spring:message code='dashboard.production.filter.part' javaScriptEscape='true'/>",
	    "dashboard.production.filter.vehicle": "<spring:message code='dashboard.production.filter.vehicle' javaScriptEscape='true'/>",
	    "dashboard.production.filter.line": "<spring:message code='dashboard.production.filter.line' javaScriptEscape='true'/>",
	
	    "dashboard.production.kpi.totalQty": "<spring:message code='dashboard.production.kpi.totalQty' javaScriptEscape='true'/>",
	    "dashboard.production.kpi.totalCount": "<spring:message code='dashboard.production.kpi.totalCount' javaScriptEscape='true'/>",
	    "dashboard.production.kpi.avgQty": "<spring:message code='dashboard.production.kpi.avgQty' javaScriptEscape='true'/>",
	    "dashboard.production.kpi.avgCount": "<spring:message code='dashboard.production.kpi.avgCount' javaScriptEscape='true'/>",
	    "dashboard.production.kpi.lines": "<spring:message code='dashboard.production.kpi.lines' javaScriptEscape='true'/>",
	
	    "dashboard.production.chart.hourly": "<spring:message code='dashboard.production.chart.hourly' javaScriptEscape='true'/>",
	    "dashboard.production.chart.line": "<spring:message code='dashboard.production.chart.line' javaScriptEscape='true'/>",
	    "dashboard.production.chart.qty": "<spring:message code='dashboard.production.chart.qty' javaScriptEscape='true'/>",
	    "dashboard.production.chart.count": "<spring:message code='dashboard.production.chart.count' javaScriptEscape='true'/>",
	
	    "dashboard.production.table.title": "<spring:message code='dashboard.production.table.title' javaScriptEscape='true'/>",
	    "dashboard.production.table.time": "<spring:message code='dashboard.production.table.time' javaScriptEscape='true'/>",
	    "dashboard.production.table.line": "<spring:message code='dashboard.production.table.line' javaScriptEscape='true'/>",
	    "dashboard.production.table.vehicle": "<spring:message code='dashboard.production.table.vehicle' javaScriptEscape='true'/>",
	    "dashboard.production.table.itemcode": "<spring:message code='dashboard.production.table.itemcode' javaScriptEscape='true'/>",
	    "dashboard.production.table.itemname": "<spring:message code='dashboard.production.table.itemname' javaScriptEscape='true'/>",
	    "dashboard.production.table.qty": "<spring:message code='dashboard.production.table.qty' javaScriptEscape='true'/>",
	    "dashboard.production.table.total": "<spring:message code='dashboard.production.table.total' javaScriptEscape='true'/>",
	
	    /* Process */
	    "process.all": "<spring:message code='process.all' javaScriptEscape='true'/>",
	    "process.cs": "<spring:message code='process.cs' javaScriptEscape='true'/>",
	    "process.covering": "<spring:message code='process.covering' javaScriptEscape='true'/>",
	    "process.assembly": "<spring:message code='process.assembly' javaScriptEscape='true'/>",
	    "process.pip": "<spring:message code='process.pip' javaScriptEscape='true'/>",
	
	    /* Factory */
	    "factory.saltillo": "<spring:message code='factory.saltillo' javaScriptEscape='true'/>",
	    "factory.puebla": "<spring:message code='factory.puebla' javaScriptEscape='true'/>",
	
	    /* Unit */
	    "unit.pcs": "<spring:message code='unit.pcs' javaScriptEscape='true'/>",
	    "unit.pcsPerCount": "<spring:message code='unit.pcsPerCount' javaScriptEscape='true'/>",
	
	    /* Fabric Usage Dashboard - KPI */
	    "dashboard.fabricUsage.kpi.totalNeed": "<spring:message code='dashboard.fabricUsage.kpi.totalNeed' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.kpi.fabricCount": "<spring:message code='dashboard.fabricUsage.kpi.fabricCount' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.kpi.productCount": "<spring:message code='dashboard.fabricUsage.kpi.productCount' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.kpi.shortage": "<spring:message code='dashboard.fabricUsage.kpi.shortage' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.unit.units": "<spring:message code='dashboard.fabricUsage.unit.units' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.unit.items": "<spring:message code='dashboard.fabricUsage.unit.items' javaScriptEscape='true'/>",
	
	    /* Fabric Usage Dashboard - Filter */
	    "dashboard.fabricUsage.filter.title": "<spring:message code='dashboard.fabricUsage.filter.title' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.filter.fabric": "<spring:message code='dashboard.fabricUsage.filter.fabric' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.filter.product": "<spring:message code='dashboard.fabricUsage.filter.product' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.filter.all": "<spring:message code='dashboard.fabricUsage.filter.all' javaScriptEscape='true'/>",
	
	    /* Fabric Usage Dashboard - Flow */
	    "dashboard.fabricUsage.flow.title": "<spring:message code='dashboard.fabricUsage.flow.title' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.flow.need": "<spring:message code='dashboard.fabricUsage.flow.need' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.flow.work": "<spring:message code='dashboard.fabricUsage.flow.work' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.flow.receive": "<spring:message code='dashboard.fabricUsage.flow.receive' javaScriptEscape='true'/>",
	
	    /* Fabric Usage Dashboard - Table */
	    "dashboard.fabricUsage.table.title": "<spring:message code='dashboard.fabricUsage.table.title' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.table.totalPrefix": "<spring:message code='dashboard.fabricUsage.table.totalPrefix' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.table.totalSuffix": "<spring:message code='dashboard.fabricUsage.table.totalSuffix' javaScriptEscape='true'/>",
	
	    /* Fabric Usage Dashboard - Table header(th) */
	    "dashboard.fabricUsage.th.itemCode": "<spring:message code='dashboard.fabricUsage.th.itemCode' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.itemName": "<spring:message code='dashboard.fabricUsage.th.itemName' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.childCode": "<spring:message code='dashboard.fabricUsage.th.childCode' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.childName": "<spring:message code='dashboard.fabricUsage.th.childName' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.prodQty": "<spring:message code='dashboard.fabricUsage.th.prodQty' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.sendingQty": "<spring:message code='dashboard.fabricUsage.th.sendingQty' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.qtyPer": "<spring:message code='dashboard.fabricUsage.th.qtyPer' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.need": "<spring:message code='dashboard.fabricUsage.th.need' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.needSum": "<spring:message code='dashboard.fabricUsage.th.needSum' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.workMoveQty": "<spring:message code='dashboard.fabricUsage.th.workMoveQty' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.receivingQty": "<spring:message code='dashboard.fabricUsage.th.receivingQty' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.currentStock": "<spring:message code='dashboard.fabricUsage.th.currentStock' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.supplyRate": "<spring:message code='dashboard.fabricUsage.th.supplyRate' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.th.inputRate": "<spring:message code='dashboard.fabricUsage.th.inputRate' javaScriptEscape='true'/>",
	
	    /* Fabric Usage Dashboard - CSV headers */
	    "dashboard.fabricUsage.csv.fabricCode": "<spring:message code='dashboard.fabricUsage.csv.fabricCode' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.csv.fabricName": "<spring:message code='dashboard.fabricUsage.csv.fabricName' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.csv.product": "<spring:message code='dashboard.fabricUsage.csv.product' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.csv.qtyPer": "<spring:message code='dashboard.fabricUsage.csv.qtyPer' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.csv.need": "<spring:message code='dashboard.fabricUsage.csv.need' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.csv.workMoveQty": "<spring:message code='dashboard.fabricUsage.csv.workMoveQty' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.csv.receivingQty": "<spring:message code='dashboard.fabricUsage.csv.receivingQty' javaScriptEscape='true'/>",
	    "dashboard.fabricUsage.csv.supplyRate": "<spring:message code='dashboard.fabricUsage.csv.supplyRate' javaScriptEscape='true'/>",
	
	    /* Sales Dashboard */
	    "dashboard.sales.dateFrom": "<spring:message code='dashboard.sales.dateFrom' javaScriptEscape='true'/>",
	    "dashboard.sales.dateTo": "<spring:message code='dashboard.sales.dateTo' javaScriptEscape='true'/>",
	    "dashboard.sales.factory": "<spring:message code='dashboard.sales.factory' javaScriptEscape='true'/>",
	    "dashboard.sales.storage": "<spring:message code='dashboard.sales.storage' javaScriptEscape='true'/>",
	    "dashboard.sales.mainCategory": "<spring:message code='dashboard.sales.mainCategory' javaScriptEscape='true'/>",
	    "dashboard.sales.subCategory": "<spring:message code='dashboard.sales.subCategory' javaScriptEscape='true'/>",
	
	    "dashboard.sales.kpi.shipCount": "<spring:message code='dashboard.sales.kpi.shipCount' javaScriptEscape='true'/>",
	    "dashboard.sales.kpi.shipQty": "<spring:message code='dashboard.sales.kpi.shipQty' javaScriptEscape='true'/>",
	    "dashboard.sales.kpi.shipAmount": "<spring:message code='dashboard.sales.kpi.shipAmount' javaScriptEscape='true'/>",
	
	    "dashboard.sales.chart.dailyCount": "<spring:message code='dashboard.sales.chart.dailyCount' javaScriptEscape='true'/>",
	    "dashboard.sales.chart.dailyQty": "<spring:message code='dashboard.sales.chart.dailyQty' javaScriptEscape='true'/>",
	    "dashboard.sales.chart.dailyAmount": "<spring:message code='dashboard.sales.chart.dailyAmount' javaScriptEscape='true'/>"
	});
</script>