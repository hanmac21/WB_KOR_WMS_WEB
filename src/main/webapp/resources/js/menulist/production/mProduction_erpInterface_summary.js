/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */
let globalProductionErpInterfaceSummaryData = []; // 현재 조회된 데이터 저장
let currentProductionErpInterfaceSummaryPage = 1; // 현재 페이지
let productionErpInterfaceSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalProductionErpInterfaceSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalProductionErpInterfaceSummaryQty = 0; // 서버에서 받은 총 개수 저장
let totalProductionErpInterfaceSummaryPages = 0; // 서버에서 받은 총 페이지

$(document).ready(function() {

	window.filteredProductionErpInterfaceSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.productionErpInterfaceSummaryColumns = [
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'COUNTQTY', header: 'countqty'},
		{ key: 'STOCKQTY', header: 'in/out qty'},
		{ key: 'NOSCANQTY', header: 'noscanqty'},
		{ key: 'TOTALQTY', header: 'totalqty'},
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mProduction_erpInterface_summary = function(menuId) {
		//showLoading("data");

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 공장으로 조회
		//performProductionErpInterfaceSummaryDBSearch({ factory });
		// 초기에 화면 그려지지 않도록 기초화면만 그려줌
		renderProductionErpInterfaceSummaryView();
	}
});
// DB에서 데이터 조회하는 함수
function performProductionErpInterfaceSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_productionErpInterfaceSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentProductionErpInterfaceSummaryPage,
			itemsPerPage: productionErpInterfaceSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalProductionErpInterfaceSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalProductionErpInterfaceSummaryCount = data.totalCount || 0;
			totalProductionErpInterfaceSummaryQty = data.totalQty || 0;
			currentProductionErpInterfaceSummaryPage = data.currentPage || 0;
			window.filteredProductionErpInterfaceSummaryData = globalProductionErpInterfaceSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mProduction_erpInterface_summary').length) {
				renderProductionErpInterfaceSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderProductionErpInterfaceSummaryTableData();
				//renderProductionErpInterfaceSummaryPagination();
				//updateProductionErpInterfaceSummaryTotalCount();
				//updateProductionErpInterfaceSummaryTotalQty();
			}

			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("DB 조회 실패:", error);
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

// 사용자 뷰 렌더링 함수
function renderProductionErpInterfaceSummaryView() {
	let loginid = $(".loginId").text().trim().toLowerCase();
	let btnAreaHtml = "";
	if (loginid  == "wms" ) {
	        btnAreaHtml = `
			<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfStockCountSummaryProduction"/>
			<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfStockCountSummaryDeleteProduction"/>
												
	        `;
	    }else{
			btnAreaHtml = ``
		}
	let content_output = `
			<div class="divBlockControl" id="view_mProduction_erpInterface_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="productionErpInterfaceSummary_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="productionErpInterfaceSummary_searchVal_sdate" />
							</div>
							<div class="search-label">
								<div class="productionErpInterfaceSummary_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionErpInterfaceSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									
								</select>
							</div>
							<div class="search-label">
								<div class="productionErpInterfaceSummary_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="productionErpInterfaceSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="productionErpInterfaceSummary_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="productionErpInterfaceSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="productionErpInterfaceSummary_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionErpInterfaceSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="productionErpInterfaceSummary_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productionErpInterfaceSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnProductionErpInterfaceSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnProductionErpInterfaceSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
							</div>
					</div>
					
					<!-- 탭 -->
					<div class="tab-container">
						<div class="tab">목록</div>
					</div>
					
					<!-- 테이블 -->
					<div class="table-container">
						<div class="action-buttons">
							<button class="btn btn-secondary">엑셀 다운로드</button>
						</div>
						
						<div class="table-info">
							<span>${i18n.t('table.info.total')} <strong id="productionErpInterfaceSummaryTotalCount">${totalProductionErpInterfaceSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								<!--${i18n.t('table.page')} <strong id="productionErpInterfaceSummaryCurrentPageInfo">${currentProductionErpInterfaceSummaryPage}</strong>/<strong id="productionErpInterfaceSummaryTotalPageInfo">${totalProductionErpInterfaceSummaryPages}</strong> |-->  
								<span class="tqtyTitle">Count Qty : </span><span class="productionErpInterfaceSummaryTotalQty" id = "productionErpInterfaceSummaryCountQty" style="color:#007bff"></span> |
								<span class="tqtyTitle">In/Out Qty : </span><span class="productionErpInterfaceSummaryTotalQty" id = "productionErpInterfaceSummaryStockQty" style="color:#007bff"></span> |
								<span class="tqtyTitle">No scan Qty : </span><span class="productionErpInterfaceSummaryTotalQty" id = "productionErpInterfaceSummaryNoscanQty" style="color:#007bff"></span> |
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="productionErpInterfaceSummaryTotalQty" id = "productionErpInterfaceSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mProduction_erpInterface_summary">
								<div id="defaultActions" class="action-group">
									${btnAreaHtml}
									<button class="btn btn-success" id="productionErpInterfaceSummaryExcelBtn" onclick="downloadAllProductionErpInterfaceSummaryData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnStockCountSummaryItemsArea" style="margin-left:24px;">
								
							</div>
						</div>
						<table class="data-table mProduction_erpInterface_summary">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="productionErpInterfaceSummary_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<!-- <th class = "statusVal">${i18n.t('table.status')}STATUS </th>-->
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "scanqtyVal">Count Qty<!-- Count Qty --></th>
									<th class = "scanqtyVal">In/Out Qty<!-- Stock QTy --></th>
									<th class = "scanqtyVal">No scan Qty<!-- Noscan Qty --></th>
									<th class = "scanqtyVal">Total Qty<!-- Total Qty --></th>
								</tr>
							</thead>
							<tbody id="productionErpInterfaceSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<!--<div class="pagination" id="productionErpInterfaceSummaryPaginationContainer">
						</div>-->
					</div>
				</div>
			</div>
		`;
	/*<button class="btn btn-success" id="productionErpInterfaceSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionErpInterfaceSummaryData, productionErpInterfaceSummaryColumns, {fileName:'ProductionErpInterfaceSummary', sheetName:'ProductionErpInterfaceSummary'})">Excel</button>*/
	/*<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfStockCountSummary"/>
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfStockCountSummaryDelete"/>*/
								
								/*<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>*/
	$(".w_contentArea").append(content_output);
	
	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderProductionErpInterfaceSummaryTableData();
	// 페이지네이션 렌더링
	renderProductionErpInterfaceSummaryPagination();
	// 이벤트 바인딩
	bindProductionErpInterfaceSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateProductionErpInterfaceSummaryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateProductionErpInterfaceSummaryTotalQty();
	(function() {
		const today = new Date();
		// 하루 전날
	    const yesterday = new Date(today);
	    yesterday.setDate(today.getDate() - 1);

	    // 포맷팅
	    const toDate = fmtLocalDate(yesterday);

	    // input에 기본값 설정
	    $("#productionErpInterfaceSummary_searchVal_sdate").val(toDate);

	    // 오늘까지만 선택 가능하도록 제한
	    $("#productionErpInterfaceSummary_searchVal_sdate").attr("max", fmtLocalDate(yesterday));
	})();
	function fmtLocalDate(d) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${dd}`;
	}
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#productionErpInterfaceSummary_searchVal_factory');
	const storage = $('#productionErpInterfaceSummary_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'SALTILLO': ['H/REST'],
			'PUEBLA': ['Workshop'],
			'': ['H/REST', 'Workshop']
		};

		const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택 (Material)
		storage.val(storageList[0]);
	}

	// 저장된 공장 선택
	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
		factory.val(savedFactory);
	}

	updateStorageOptions(savedFactory || '');

	// 공장 변경 시 창고 업데이트
	factory.on('change', function() {
		updateStorageOptions($(this).val());
	});
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}


// 총 개수를 업데이트하는 함수
function updateProductionErpInterfaceSummaryTotalCount() {
	$('#productionErpInterfaceSummaryTotalCount').text(Number(totalProductionErpInterfaceSummaryCount).toLocaleString());
}

//총 개수를 업데이트하는 함수
function updateProductionErpInterfaceSummaryTotalQty() {
	$('.productionErpInterfaceSummaryTotalQty').text(totalProductionErpInterfaceSummaryQty.toLocaleString());
}

function renderProductionErpInterfaceSummaryTableData() {
	let tableBody = "";

	//console.log("globalProductionErpInterfaceSummaryData:", globalProductionErpInterfaceSummaryData);
	//console.log("데이터 개수:", globalProductionErpInterfaceSummaryData.length);
	let countqty = 0;
	let stockqty = 0;
	let noscanqty = 0;
	let totalqty = 0;
	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalProductionErpInterfaceSummaryData.length; i++) {
		let rowNumber = (currentProductionErpInterfaceSummaryPage - 1) * productionErpInterfaceSummaryItemsPerPage + i + 1;
		let un = globalProductionErpInterfaceSummaryData[i]
		let statusText = globalProductionErpInterfaceSummaryData[i].intf_yn === 'Y' ? 'Completed' : 'Waiting';
		let statusClass = globalProductionErpInterfaceSummaryData[i].intf_yn === 'Y' ? 'status-completed' : 'status-waiting';

		//console.log(`행 ${i}:`, globalProductionErpInterfaceSummaryData[i]); // 각 행 데이터 확인
		let tcqty = Number(globalProductionErpInterfaceSummaryData[i].COUNTQTY || globalProductionErpInterfaceSummaryData[i].countqty || 0);
		let tsqty = Number(globalProductionErpInterfaceSummaryData[i].STOCKQTY || globalProductionErpInterfaceSummaryData[i].stockqty || 0);
		let tnqty = Number(globalProductionErpInterfaceSummaryData[i].NOSCANQTY || globalProductionErpInterfaceSummaryData[i].noscanqty || 0);
		let tqty = Number(globalProductionErpInterfaceSummaryData[i].TOTALQTY || globalProductionErpInterfaceSummaryData[i].totalqty || 0);
		tableBody += `
            <tr>	
            	<td class = "checkboxVal"><input type="checkbox" class="productionErpInterfaceSummary_chk ${statusClass}" 
            			data-unique="${un.sdate}_${un.itemcode}_${un.intf_yn}_${un.totalqty}_${un.factory}_${un.storage}"></td>
                <td class = "noVal">${globalProductionErpInterfaceSummaryData[i].RN|| globalProductionErpInterfaceSummaryData[i].rn || ''}</td>
                <!--<td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>-->
                <td class = "factoryVal">${globalProductionErpInterfaceSummaryData[i].FACTORY || globalProductionErpInterfaceSummaryData[i].factory || ''}</td>
                <td class = "storageVal">${globalProductionErpInterfaceSummaryData[i].STORAGE || globalProductionErpInterfaceSummaryData[i].storage || ''}</td>
                <td class = "carVal">${globalProductionErpInterfaceSummaryData[i].CAR || globalProductionErpInterfaceSummaryData[i].car || ''}</td>
                <td class = "itemcodeVal">${globalProductionErpInterfaceSummaryData[i].ITEMCODE || globalProductionErpInterfaceSummaryData[i].itemcode || ''}</td>
                <td class = "itemnameLongVal">${globalProductionErpInterfaceSummaryData[i].ITEMNAME || globalProductionErpInterfaceSummaryData[i].itemname || ''}</td>
                <td class = "scanqtyVal">${Number(globalProductionErpInterfaceSummaryData[i].COUNTQTY || globalProductionErpInterfaceSummaryData[i].countqty || 0).toLocaleString()}</td>
                <td class = "scanqtyVal">${Number(globalProductionErpInterfaceSummaryData[i].STOCKQTY || globalProductionErpInterfaceSummaryData[i].stockqty || 0).toLocaleString()}</td>
                <td class = "scanqtyVal">${Number(globalProductionErpInterfaceSummaryData[i].NOSCANQTY || globalProductionErpInterfaceSummaryData[i].noscanqty || 0).toLocaleString()}</td>
                <td class = "scanqtyVal">${Number(globalProductionErpInterfaceSummaryData[i].TOTALQTY || globalProductionErpInterfaceSummaryData[i].totalqty || 0).toLocaleString()}</td>
            </tr>
        `;
	countqty += tcqty;
	stockqty += tsqty;
	noscanqty += tnqty;
	totalqty += tqty;
	}
	//console.log("생성된 tableBody:", tableBody);
	$("#productionErpInterfaceSummaryTableBody").html(tableBody);
	$("#productionErpInterfaceSummaryTotalCount").text(globalProductionErpInterfaceSummaryData.length.toLocaleString());
	$("#productionErpInterfaceSummaryCountQty").text(countqty.toLocaleString());
	$("#productionErpInterfaceSummaryStockQty").text(stockqty.toLocaleString());
	$("#productionErpInterfaceSummaryNoscanQty").text(noscanqty.toLocaleString());
	$("#productionErpInterfaceSummaryTotalQty").text(totalqty.toLocaleString());
	
	$(".productionErpInterfaceSummary_chkAll").prop("checked", false);
}

// 페이지네이션 렌더링
function renderProductionErpInterfaceSummaryPagination() {
	let totalPages = Math.ceil(totalProductionErpInterfaceSummaryCount / productionErpInterfaceSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentProductionErpInterfaceSummaryPage > 1) {
		paginationHtml += `<button class="productionErpInterfaceSummary-page-btn" data-page="${currentProductionErpInterfaceSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="productionErpInterfaceSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentProductionErpInterfaceSummaryPage - 5);
	let endPage = Math.min(totalPages, currentProductionErpInterfaceSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="productionErpInterfaceSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentProductionErpInterfaceSummaryPage) {
			paginationHtml += `<button class="productionErpInterfaceSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="productionErpInterfaceSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="productionErpInterfaceSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentProductionErpInterfaceSummaryPage < totalPages) {
		paginationHtml += `<button class="productionErpInterfaceSummary-page-btn" data-page="${currentProductionErpInterfaceSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="productionErpInterfaceSummary-page-btn disabled">&gt;</button>`;
	}

	$("#productionErpInterfaceSummaryTotalPageInfo").text(totalPages);
	$("#productionErpInterfaceSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindProductionErpInterfaceSummaryEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.productionErpInterfaceSummary_chkAll').on('change', '.productionErpInterfaceSummary_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.productionErpInterfaceSummary_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.productionErpInterfaceSummary_chk').on('change', '.productionErpInterfaceSummary_chk', function() {
		let totalCheckboxes = $('.productionErpInterfaceSummary_chk').length;
		let checkedCheckboxes = $('.productionErpInterfaceSummary_chk:checked').length;
		$('.productionErpInterfaceSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnProductionErpInterfaceSummarySearch").off('click').on('click', function() {
		performProductionErpInterfaceSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnProductionErpInterfaceSummarySearchInit").off('click').on('click', function() {
		resetProductionErpInterfaceSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.productionErpInterfaceSummary-page-btn').on('click', '.productionErpInterfaceSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentProductionErpInterfaceSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performProductionErpInterfaceSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_mProduction_erpInterface_summary input[type="text"], #view_mProduction_erpInterface_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performProductionErpInterfaceSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		/*intf_yn: $("#productionErpInterfaceSummary_searchVal_Condition").val(),*/
		factory: $("#productionErpInterfaceSummary_searchVal_factory").val(),
		storage: $("#productionErpInterfaceSummary_searchVal_storage").val(),
		sdate: $("#productionErpInterfaceSummary_searchVal_sdate").val(),
		car: $("#productionErpInterfaceSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionErpInterfaceSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionErpInterfaceSummary_searchVal_itemname").val().trim().toUpperCase(),
	};
}

// 검색 수행 함수 - DB 조회
function performProductionErpInterfaceSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentProductionErpInterfaceSummaryPage = 1;
	performProductionErpInterfaceSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetProductionErpInterfaceSummarySearch() {
	const factory = getCookie('selectedFactory');

	/*$("#productionErpInterfaceSummary_searchVal_Condition").val(""),*/
		$("#productionErpInterfaceSummary_searchVal_scantype").val('LOCATION');
	$("#productionErpInterfaceSummary_searchVal_factory").val(factory);
	$("#productionErpInterfaceSummary_searchVal_storage").val('Material');
	$("#productionErpInterfaceSummary_searchVal_sdate").val('');
	$("#productionErpInterfaceSummary_searchVal_car").val('');
	$("#productionErpInterfaceSummary_searchVal_itemcode").val('');
	$("#productionErpInterfaceSummary_searchVal_itemname").val('');
	$("#productionErpInterfaceSummary_searchVal_location").val('');

	// 초기화 후 전체 데이터 다시 조회
	currentProductionErpInterfaceSummaryPage = 1;
	performProductionErpInterfaceSummaryDBSearch({ factory });

	console.log('검색 조건이 초기화되었습니다.');
}

// 날짜 형식 변환 함수들
function formatDateToYYYYMMDD(dateStr) {
	if (!dateStr) return '';
	return dateStr.replace(/-/g, '');
}

function formatDateFromYYYYMMDD(dateStr) {
	if (!dateStr || dateStr.length !== 8) return '';
	return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
}

// 유틸리티 함수들
window.changeProductionErpInterfaceSummaryItemsPerPage = function(newItemsPerPage) {
	productionErpInterfaceSummaryItemsPerPage = newItemsPerPage;
	currentProductionErpInterfaceSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performProductionErpInterfaceSummaryDBSearch(searchCriteria);
}

window.exportProductionErpInterfaceSummaryData = function() {
	return {
		total: globalProductionErpInterfaceSummaryData.length,
		currentPage: currentProductionErpInterfaceSummaryPage,
		itemsPerPage: productionErpInterfaceSummaryItemsPerPage,
		data: globalProductionErpInterfaceSummaryData
	};
}

window.downloadAllProductionErpInterfaceSummaryData = function() {
	let searchCriteria = {
		/*intf_yn: $("#productionErpInterfaceSummary_searchVal_Condition").val(),*/
		factory: $("#productionErpInterfaceSummary_searchVal_factory").val(),
		storage: $("#productionErpInterfaceSummary_searchVal_storage").val(),
		scantype: $("#productionErpInterfaceSummary_searchVal_scantype").val(),
		sdate: $("#productionErpInterfaceSummary_searchVal_sdate").val(),
		car: $("#productionErpInterfaceSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionErpInterfaceSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionErpInterfaceSummary_searchVal_itemname").val().trim().toUpperCase(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_productionErpInterfaceSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionErpInterfaceSummaryColumns, {
				fileName: 'ProductionErpInterfaceSummary_All',
				sheetName: 'ProductionErpInterfaceSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

$(document).on("click", ".btnIntfStockCountSummaryProduction", function() {

	if ($(".status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	const iidList = [];
	$(".productionErpInterfaceSummary_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	showLoading("data");

	console.log(iidList)
	$.ajax({
		url: "/erpInterface_confirm_summary",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performProductionErpInterfaceSummaryDBSearch(searchVal);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
			hideLoading();
		}
	});

});

$(document).on("click", ".btnIntfStockCountSummaryDeleteProduction", function() {

	if ($(".status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}


	const iidList = [];
	$(".productionErpInterfaceSummary_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	showLoading("data");

	console.log(iidList)
	$.ajax({
		url: "/erpInterface_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performProductionErpInterfaceSummaryDBSearch(searchVal);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
			hideLoading();
		}
	});

});