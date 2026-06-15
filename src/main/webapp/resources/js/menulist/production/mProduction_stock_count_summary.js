/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */
let globalProductionStockCountSummaryData = []; // 현재 조회된 데이터 저장
let currentProductionStockCountSummaryPage = 1; // 현재 페이지
let productionStockCountSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalProductionStockCountSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalProductionStockCountSummaryPages = 0; // 서버에서 받은 총 페이지

$(document).ready(function() {

	window.filteredProductionStockCountSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.productionStockCountSummaryColumns = [
		{ key: 'SCANTYPE', header: 'scantype' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mProduction_stock_count_summary = function(menuId) {
		showLoading("data");

		const factory = getCookie('selectedFactory');
		const storage = factory == 'SALTILLO' ? 'H/REST' : 'Workshop';

		// 초기 로딩: 기본 공장으로 조회
		performProductionStockCountSummaryDBSearch({ factory, storage });
	}
});
// DB에서 데이터 조회하는 함수
function performProductionStockCountSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_productionStockCountSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentProductionStockCountSummaryPage,
			itemsPerPage: productionStockCountSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalProductionStockCountSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalProductionStockCountSummaryCount = data.totalCount || 0;
			currentProductionStockCountSummaryPage = data.currentPage || 0;
			window.filteredProductionStockCountSummaryData = globalProductionStockCountSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mProduction_stock_count_summary').length) {
				renderProductionStockCountSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderProductionStockCountSummaryTableData();
				renderProductionStockCountSummaryPagination();
				updateProductionStockCountSummaryTotalCount();
			}

			updateTotalQty();

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
function renderProductionStockCountSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_mProduction_stock_count_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="productionStockCountSummary_searchVal_scantype">${i18n.t('search.scanType')}<!-- SCANTYPE --></div>
								<select id="productionStockCountSummary_searchVal_scantype" >
									<option value="LOCATION">${i18n.t('search.location')}</option>
									<option value="BARCODE">${i18n.t('search.barcode')}</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="productionStockCountSummary_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionStockCountSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="productionStockCountSummary_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="productionStockCountSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="productionStockCountSummary_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="productionStockCountSummary_searchVal_sdate" />
							</div>
							<div class="search-label">
								<div class="productionStockCountSummary_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="productionStockCountSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="productionStockCountSummary_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionStockCountSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="productionStockCountSummary_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productionStockCountSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnProductionStockCountSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnProductionStockCountSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="productionStockCountSummaryTotalCount">${totalProductionStockCountSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="productionStockCountSummaryCurrentPageInfo">${currentProductionStockCountSummaryPage}</strong>/<strong id="productionStockCountSummaryTotalPageInfo">${totalProductionStockCountSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="productionStockCountSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mProduction_stock_count_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="productionStockCountSummaryExcelBtn" onclick="downloadAllProductionStockCountSummaryData()">Excel</button>
								</div>
							</div>
							<!--<div class="btnInterfaceCommon btnStockCountSummaryItemsArea" style="margin-left:24px;">
								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfStockCountSummary"/>
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfStockCountSummaryDelete"/>
							</div>-->
						</div>
						<table class="data-table mProduction_stock_count_summary">
							<thead>
								<tr>
									<!-- <th class = "checkboxVal">
										<input type="checkbox" class="productionStockCountSummary_chkAll">
									</th> -->
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "scantypeVal">${i18n.t('search.scanType')}<!-- SCANTYPE --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- SDATE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="productionStockCountSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="productionStockCountSummaryPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
	/*<button class="btn btn-success" id="productionStockCountSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionStockCountSummaryData, productionStockCountSummaryColumns, {fileName:'ProductionStockCountSummary', sheetName:'ProductionStockCountSummary'})">Excel</button>*/
	$(".w_contentArea").append(content_output);

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderProductionStockCountSummaryTableData();
	// 페이지네이션 렌더링
	renderProductionStockCountSummaryPagination();
	// 이벤트 바인딩
	bindProductionStockCountSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateProductionStockCountSummaryTotalCount();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#productionStockCountSummary_searchVal_factory');
	const storage = $('#productionStockCountSummary_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
            'SALTILLO': ['H/REST'],
            'PUEBLA': ['Workshop'],
            '': ['H/REST', 'Workshop', 'all']
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
function updateProductionStockCountSummaryTotalCount() {
	$('#productionStockCountSummaryTotalCount').text(Number(totalProductionStockCountSummaryCount).toLocaleString());
}

function renderProductionStockCountSummaryTableData() {
	let tableBody = "";

	//console.log("globalProductionStockCountSummaryData:", globalProductionStockCountSummaryData);
	//console.log("데이터 개수:", globalProductionStockCountSummaryData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalProductionStockCountSummaryData.length; i++) {
		let rowNumber = (currentProductionStockCountSummaryPage - 1) * productionStockCountSummaryItemsPerPage + i + 1;
		let un = globalProductionStockCountSummaryData[i]
		let statusText = globalProductionStockCountSummaryData[i].intf_yn === 'Y' ? 'Completed' : 'Waiting';
		let statusClass = globalProductionStockCountSummaryData[i].intf_yn === 'Y' ? 'status-completed' : 'status-waiting';

		//console.log(`행 ${i}:`, globalProductionStockCountSummaryData[i]); // 각 행 데이터 확인

		tableBody += `
            <tr>	
            	<!-- <td class = "checkboxVal"><input type="checkbox" class="productionStockCountSummary_chk ${statusClass}" 
            			data-unique="${un.sdate}_${un.itemcode}_${un.intf_yn}_${un.qty}_${un.factory}_${un.storage}_${un.scantype}"></td> -->
                <td class = "noVal">${rowNumber}</td>
                <td class = "scantypeVal">${globalProductionStockCountSummaryData[i].SCANTYPE || globalProductionStockCountSummaryData[i].scantype || ''}</td>
                <td class = "factoryVal">${globalProductionStockCountSummaryData[i].FACTORY || globalProductionStockCountSummaryData[i].factory || ''}</td>
                <td class = "storageVal">${globalProductionStockCountSummaryData[i].STORAGE || globalProductionStockCountSummaryData[i].storage || ''}</td>
                <td class = "dateVal">${globalProductionStockCountSummaryData[i].SDATE || globalProductionStockCountSummaryData[i].sdate || ''}</td>
                <td class = "carVal">${globalProductionStockCountSummaryData[i].CAR || globalProductionStockCountSummaryData[i].car || ''}</td>
                <td class = "itemcodeVal">${globalProductionStockCountSummaryData[i].ITEMCODE || globalProductionStockCountSummaryData[i].itemcode || ''}</td>
                <td class = "itemnameVal">${globalProductionStockCountSummaryData[i].ITEMNAME || globalProductionStockCountSummaryData[i].itemname || ''}</td>
                <td class = "qtyVal">${Number(globalProductionStockCountSummaryData[i].QTY || globalProductionStockCountSummaryData[i].qty || 0).toLocaleString()}</td>
            </tr>
        `;
	}

	//console.log("생성된 tableBody:", tableBody);
	$("#productionStockCountSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderProductionStockCountSummaryPagination() {
	let totalPages = Math.ceil(totalProductionStockCountSummaryCount / productionStockCountSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentProductionStockCountSummaryPage > 1) {
		paginationHtml += `<button class="productionStockCountSummary-page-btn" data-page="${currentProductionStockCountSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="productionStockCountSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentProductionStockCountSummaryPage - 5);
	let endPage = Math.min(totalPages, currentProductionStockCountSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="productionStockCountSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentProductionStockCountSummaryPage) {
			paginationHtml += `<button class="productionStockCountSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="productionStockCountSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="productionStockCountSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentProductionStockCountSummaryPage < totalPages) {
		paginationHtml += `<button class="productionStockCountSummary-page-btn" data-page="${currentProductionStockCountSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="productionStockCountSummary-page-btn disabled">&gt;</button>`;
	}

	$("#productionStockCountSummaryCurrentPageInfo").text(currentProductionStockCountSummaryPage);
	$("#productionStockCountSummaryTotalPageInfo").text(totalPages);
	$("#productionStockCountSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindProductionStockCountSummaryEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.productionStockCountSummary_chkAll').on('change', '.productionStockCountSummary_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.productionStockCountSummary_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.productionStockCountSummary_chk').on('change', '.productionStockCountSummary_chk', function() {
		let totalCheckboxes = $('.productionStockCountSummary_chk').length;
		let checkedCheckboxes = $('.productionStockCountSummary_chk:checked').length;
		$('.productionStockCountSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnProductionStockCountSummarySearch").off('click').on('click', function() {
		performProductionStockCountSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnProductionStockCountSummarySearchInit").off('click').on('click', function() {
		resetProductionStockCountSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.productionStockCountSummary-page-btn').on('click', '.productionStockCountSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentProductionStockCountSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performProductionStockCountSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_mProduction_stock_count_summary input[type="text"], #view_mProduction_stock_count_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performProductionStockCountSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		scantype: $("#productionStockCountSummary_searchVal_scantype").val(),
		factory: $("#productionStockCountSummary_searchVal_factory").val(),
		storage: $("#productionStockCountSummary_searchVal_storage").val(),
		sdate: $("#productionStockCountSummary_searchVal_sdate").val(),
		car: $("#productionStockCountSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionStockCountSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionStockCountSummary_searchVal_itemname").val().trim().toUpperCase(),
	};
}

// 검색 수행 함수 - DB 조회
function performProductionStockCountSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentProductionStockCountSummaryPage = 1;
	performProductionStockCountSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetProductionStockCountSummarySearch() {
	const factory = getCookie('selectedFactory');
	const storage = factory == 'SALTILLO' ? 'H/REST' : 'Workshop';
	renderFactoryStorage();
	
	$("#productionStockCountSummary_searchVal_scantype").val('LOCATION');
	$("#productionStockCountSummary_searchVal_sdate").val('');
	$("#productionStockCountSummary_searchVal_car").val('');
	$("#productionStockCountSummary_searchVal_itemcode").val('');
	$("#productionStockCountSummary_searchVal_itemname").val('');

	// 초기화 후 전체 데이터 다시 조회
	currentProductionStockCountSummaryPage = 1;
	performProductionStockCountSummaryDBSearch({ factory, storage });

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
window.changeProductionStockCountSummaryItemsPerPage = function(newItemsPerPage) {
	productionStockCountSummaryItemsPerPage = newItemsPerPage;
	currentProductionStockCountSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performProductionStockCountSummaryDBSearch(searchCriteria);
}

window.exportProductionStockCountSummaryData = function() {
	return {
		total: globalProductionStockCountSummaryData.length,
		currentPage: currentProductionStockCountSummaryPage,
		itemsPerPage: productionStockCountSummaryItemsPerPage,
		data: globalProductionStockCountSummaryData
	};
}
function updateTotalQty() {
	const searchMap = getCurrentSearchCriteria();
	if (!searchMap) {
		searchMap = {}; // null이면 빈 객체로 변경
	}

	$.ajax({
		url: "/updateTotalQty_productionStockCount",
		type: "POST",
		data: JSON.stringify(searchMap),
		contentType: "application/json",
		success: function(data) {
			$(".productionStockCountSummaryTotalQty").text(Number(data).toLocaleString());
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});
}


window.downloadAllProductionStockCountSummaryData = function() {
	let searchCriteria = {
		factory: $("#productionStockCountSummary_searchVal_factory").val(),
		storage: $("#productionStockCountSummary_searchVal_storage").val(),
		scantype: $("#productionStockCountSummary_searchVal_scantype").val(),
		sdate: $("#productionStockCountSummary_searchVal_sdate").val(),
		car: $("#productionStockCountSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionStockCountSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionStockCountSummary_searchVal_itemname").val().trim().toUpperCase(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_productionStockCountSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionStockCountSummaryColumns, {
				fileName: 'ProductionStockCountSummary_All',
				sheetName: 'ProductionStockCountSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

/*$(document).on("click", ".btnIntfStockCountSummary", function() {

	if ($(".status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	const iidList = [];
	$(".productionStockCountSummary_chk:checked").each(function() {
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
		url: "/stockCount_confirm_summary",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performProductionStockCountSummaryDBSearch(searchVal);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

});*/

/*$(document).on("click", ".btnIntfStockCountSummaryDelete", function() {

	if ($(".status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}


	const iidList = [];
	$(".productionStockCountSummary_chk:checked").each(function() {
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
		url: "/stockCount_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performProductionStockCountSummaryDBSearch(searchVal);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

});*/