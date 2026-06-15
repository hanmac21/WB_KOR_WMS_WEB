/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m3_unloadList 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : productionUnloadList -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : ProductionUnloadList -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

let globalProductionUnloadListData = []; // 현재 조회된 데이터 저장
let currentProductionUnloadListPage = 1; // 현재 페이지
let productionUnloadListItemsPerPage = 1000; // 페이지당 항목 수
let totalProductionUnloadListCount = 0; // 서버에서 받은 총 개수 저장
let totalProductionUnloadListQty = 0; // 서버에서 받은 총 개수 저장
let totalProductionUnloadListPages = 0; // 서버에서 받은 총 페이지
$(document).ready(function() {

	window.filteredProductionUnloadListData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.productionUnloadListColumns = [
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'INDATE', header: 'indate' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'OLDLOCATION', header: 'oldlocation' },
		{ key: 'SOURCE', header: 'source' },
		{ key: 'RACK', header: 'rack' }
		// =
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m3_unloadList = function(menuId) {
		showLoading("data");
		// 251017 DH - 날짜 검색 관련 제거
//		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		// 251017 DH - 날짜 검색 관련 제거
//		performProductionUnloadListDBSearch({ fromDate, toDate, factory });
		performProductionUnloadListDBSearch({ factory });
	}
});

// DB에서 데이터 조회하는 함수
function performProductionUnloadListDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_productionUnloadList",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentProductionUnloadListPage,
			itemsPerPage: productionUnloadListItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalProductionUnloadListData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalProductionUnloadListCount = data.totalCount || 0;
			totalProductionUnloadListQty = data.totalQty || 0;
			totalProductionUnloadListPages = data.totalPages || 0;
			currentProductionUnloadListPage = data.currentPage || 0;
			window.filteredProductionUnloadListData = globalProductionUnloadListData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m3_unloadList').length) {
				renderProductionUnloadListView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderProductionUnloadListTableData();
				renderProductionUnloadListPagination();
				updateProductionUnloadListTotalCount();
				updateProductionUnloadListTotalQty();
			}

			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("DB 조회 실패:", error);
			console.error('[WIP Return Detail][AJAX ERROR]',
				{ status, error, httpStatus: xhr.status, resp: xhr.responseText });
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

// 사용자 뷰 렌더링 함수
function renderProductionUnloadListView() {
	let content_output = `
			<div class="divBlockControl" id="view_m3_unloadList">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<!-- <div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
								<input type="date" id="productionUnloadList_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="productionUnloadList_searchVal_toDate" />
							</div> -->
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionUnloadList_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="productionUnloadList_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="productionUnloadList_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionUnloadList_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productionUnloadList_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_source">${i18n.t('search.type')}<!-- SOURCE --></div>
								<input type="text" id="productionUnloadList_searchVal_source" />
							</div>
							<div class="search-label">
								<div class="searchVal_rack">RACK<!-- RACK --></div>
								<input type="text" id="productionUnloadList_searchVal_rack" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnProductionUnloadListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnProductionUnloadListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="productionUnloadListTotalCount">${totalProductionUnloadListCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="productionUnloadListCurrentPageInfo">${currentProductionUnloadListPage}</strong>/<strong id="productionUnloadListTotalPageInfo">${totalProductionUnloadListPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "productionUnloadListTotalQty"></strong>
							</span>
							<div class="action-buttons-right m3_unloadList">
								<div id="defaultActions" class="action-group">
									<input type="button" value="${i18n.t('btn.exceptionOut')}" class="btn btn-success btnExceptionOut_productionUnloadList"/>
									<button class="btn btn-success" id="productionUnloadListExcelBtn" onclick="downloadAllProductionUnloadListData()">Excel</button>
								</div>
							</div>
							<!--<div class="btnIntfCommon btnProductionUnloadListItemsArea">
								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfProductionUnloadList"/>
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfProductionUnloadListCancel"/>
							</div>-->	
						</div>
						<table class="data-table m3_unloadList">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="productionUnloadList_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>										
									<th class = "dateVal">${i18n.t('table.date')}<!-- INDATE --></th>										
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "locationVal">OLD LOCATION<!-- OLD LOCATION --></th>
									<th class = "locationVal">${i18n.t('search.type')}<!-- SOURCE --></th>
									<th class = "noVal">${i18n.t('search.rack')}<!-- RACK --></th>
								</tr>
							</thead>
							<tbody id="productionUnloadListTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="productionUnloadListPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
	// = 위에 data-table, search-row i18n 부분 추가
	/*<button class="btn btn-success" id="productionUnloadListExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionUnloadListData, productionUnloadListColumns, {fileName:'ProductionUnloadList', sheetName:'ProductionUnloadList'})">Excel</button>*/
	$(".w_contentArea").append(content_output);

	// ⬇️ 추가: 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#productionUnloadList_searchVal_fromDate").val(fromDate);
		$("#productionUnloadList_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderProductionUnloadListTableData();
	// 페이지네이션 렌더링
	renderProductionUnloadListPagination();
	// 이벤트 바인딩
	bindProductionUnloadListEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateProductionUnloadListTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateProductionUnloadListTotalQty();

}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#productionUnloadList_searchVal_factory');
	const storage = $('#productionUnloadList_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'SALTILLO': ['H/REST', 'all'],
			'PUEBLA': ['Workshop', 'all'],
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
function updateProductionUnloadListTotalCount() {
	$('#productionUnloadListTotalCount').text(totalProductionUnloadListCount);
}
// 총 개수를 업데이트하는 함수
function updateProductionUnloadListTotalQty() {
	$('#productionUnloadListTotalQty').text(totalProductionUnloadListQty.toLocaleString());
}
function renderProductionUnloadListTableData() {
	let tableBody = "";

	//console.log("globalProductionUnloadListData:", globalProductionUnloadListData);
	//console.log("데이터 개수:", globalProductionUnloadListData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalProductionUnloadListData.length; i++) {
		let inputData = globalProductionUnloadListData;

		let rowNumber = (currentProductionUnloadListPage - 1) * productionUnloadListItemsPerPage + i + 1;
		//console.log(`행 ${i}:`, inputData[i]); // 각 행 데이터 확인

		tableBody += `
            <tr>
            	<td class = "checkboxVal"><input type="checkbox" class="productionUnloadList_chk" 
            		data-unique="${inputData[i].barcode}_${inputData[i].indate}_${inputData[i].factory}_${inputData[i].storage}_${inputData[i].qty}_${inputData[i].source}"></td>
                <td class = "noVal">${rowNumber}</td>
				<td class = "barcodeVal">${inputData[i].BARCODE || inputData[i].barcode || ''}</td>
				<td class = "dateVal">${inputData[i].INDATE || inputData[i].indate || ''}</td>
				<td class = "factoryVal">${inputData[i].FACTORY || inputData[i].factory || ''}</td>
				<td class = "storageVal">${inputData[i].STORAGE || inputData[i].storage || ''}</td>
				<td class = "carVal">${inputData[i].CAR || inputData[i].car || ''}</td>
				<td class = "itemcodeVal">${inputData[i].ITEMCODE || inputData[i].itemcode || ''}</td>
				<td class = "itemnameMedVal">${inputData[i].ITEMNAME || inputData[i].itemname || ''}</td>
				<td class = "qtyVal">${Number(inputData[i].QTY || inputData[i].qty || 0).toLocaleString()}</td>
				<td class = "locationVal">${inputData[i].OLDLOCATION || inputData[i].oldlocation || ''}</td>
				<td class = "locationVal">${inputData[i].SOURCE || inputData[i].source || ''}</td>
				<td class = "noVal">${inputData[i].RACK || inputData[i].rack || ''}</td>
            </tr>
        `;
	}
	// =
	//console.log("생성된 tableBody:", tableBody);
	$("#productionUnloadListTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderProductionUnloadListPagination() {
	let totalPages = Math.ceil(totalProductionUnloadListCount / productionUnloadListItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentProductionUnloadListPage > 1) {
		paginationHtml += `<button class="productionUnloadList-page-btn" data-page="${currentProductionUnloadListPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="productionUnloadList-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentProductionUnloadListPage - 5);
	let endPage = Math.min(totalPages, currentProductionUnloadListPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="productionUnloadList-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentProductionUnloadListPage) {
			paginationHtml += `<button class="productionUnloadList-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="productionUnloadList-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="productionUnloadList-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentProductionUnloadListPage < totalPages) {
		paginationHtml += `<button class="productionUnloadList-page-btn" data-page="${currentProductionUnloadListPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="productionUnloadList-page-btn disabled">&gt;</button>`;
	}

	$('#productionUnloadListCurrentPageInfo').text(currentProductionUnloadListPage);
	$('#productionUnloadListTotalPageInfo').text(totalPages);
	$("#productionUnloadListPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindProductionUnloadListEvents() {

	// 전체 선택 체크박스
	$(document).off('change', '.productionUnloadList_chkAll').on('change', '.productionUnloadList_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.productionUnloadList_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.productionUnloadList_chk').on('change', '.productionUnloadList_chk', function() {
		let totalCheckboxes = $('.productionUnloadList_chk').length;
		let checkedCheckboxes = $('.productionUnloadList_chk:checked').length;
		$('.productionUnloadList_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});

	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnProductionUnloadListSearch").off('click').on('click', function() {
		performProductionUnloadListSearch();
	});

	// 초기화 버튼 클릭
	$(".btnProductionUnloadListSearchInit").off('click').on('click', function() {
		resetProductionUnloadListSearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.productionUnloadList-page-btn').on('click', '.productionUnloadList-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentProductionUnloadListPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performProductionUnloadListDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m3_unloadList input[type="text"], #view_m3_unloadList input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performProductionUnloadListSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		// 251017 DH - 날짜 검색 관련 제거
		/*wipCondition: $("#productionUnloadList_searchVal_condition").val(),
		fromDate: $("#productionUnloadList_searchVal_fromDate").val(),
		toDate: $("#productionUnloadList_searchVal_toDate").val(),*/
		factory: $("#productionUnloadList_searchVal_factory").val().trim(),
		storage: $("#productionUnloadList_searchVal_storage").val().trim(),
		car: $("#productionUnloadList_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionUnloadList_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionUnloadList_searchVal_itemname").val().trim().toUpperCase(),
		rack: $("#productionUnloadList_searchVal_rack").val().trim().toUpperCase()
	};
}
// =
// 검색 수행 함수 - DB 조회
function performProductionUnloadListSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentProductionUnloadListPage = 1;
	performProductionUnloadListDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetProductionUnloadListSearch() {
	// 251017 DH - 날짜 검색 관련 제거
//	const { fromDate, toDate } = getDefaultDateRange();	
//	$("#productionUnloadList_searchVal_fromDate").val(fromDate);
//	$("#productionUnloadList_searchVal_toDate").val(toDate);
	
	const factory = getCookie('selectedFactory');
	
	$("#productionUnloadList_searchVal_factory").val(factory);
	$("#productionUnloadList_searchVal_storage").val('Material');
	$("#productionUnloadList_searchVal_car").val('');
	$("#productionUnloadList_searchVal_itemcode").val('');
	$("#productionUnloadList_searchVal_itemname").val('');
	$("#productionUnloadList_searchVal_source").val('');
	$("#productionUnloadList_searchVal_rack").val('');
	// =
	// 초기화 후 전체 데이터 다시 조회
	currentProductionUnloadListPage = 1;
//	performProductionUnloadListDBSearch({ fromDate, toDate, factory });
	performProductionUnloadListDBSearch({ factory });

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
window.changeProductionUnloadListItemsPerPage = function(newItemsPerPage) {
	productionUnloadListItemsPerPage = newItemsPerPage;
	currentProductionUnloadListPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performProductionUnloadListDBSearch(searchCriteria);
}

window.exportProductionUnloadListData = function() {
	return {
		total: globalProductionUnloadListData.length,
		currentPage: currentProductionUnloadListPage,
		itemsPerPage: productionUnloadListItemsPerPage,
		data: globalProductionUnloadListData
	};
}

function fmtLocalDate(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${dd}`;
}

function getDefaultDateRange() {
	const today = new Date();
	const toDate = fmtLocalDate(today);
	const fromDate = fmtLocalDate(today);
	return { fromDate, toDate };
}


window.downloadAllProductionUnloadListData = function() {
	let searchCriteria = {
		// 251017 DH - 날짜 검색 관련 제거
		/* fromDate: $("#productionUnloadList_searchVal_fromDate").val(),
		toDate: $("#productionUnloadList_searchVal_toDate").val(), */
		factory: $("#productionUnloadList_searchVal_factory").val().trim(),
		storage: $("#productionUnloadList_searchVal_storage").val().trim(),
		car: $("#productionUnloadList_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionUnloadList_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionUnloadList_searchVal_itemname").val().trim().toUpperCase(),
		rack: $("#productionUnloadList_searchVal_rack").val().trim().toUpperCase()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_productionUnloadList_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionUnloadListColumns, {
				fileName: 'ProductionUnloadList_All',
				sheetName: 'ProductionUnloadList'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};



//// 251112 DH - PDA 생산 예외출고가 정상적으로 동작하면 주석 해제하고 백단 만들어야함
//$(document).on("click", ".btnExceptionOut_productionUnloadList", function() {
//	const loginid = getCookie("userLoginId");
//	const sabun = getCookie("sabun");
//	
//	const iidList = [];
//	$(".productionUnloadList_chk:checked").each(function() {
//		let iid = $(this).data('unique');
//		iidList.push(iid);
//	});
//
//	// 체크된 요소가 없으면 경고창 표시 후 리턴
//	if (iidList.length === 0) {
//		alert(i18n.t('validation.no.select.items'));
//		return;
//	}
//
//	
//	
//	console.log(iidList)
//	console.log(sabun);
//	if(confirm("Do you want to proceed with an exception load?")){
//		showLoading("data");
//		$.ajax({
//			url: `/insertProductionExcpetionOutput`,
//			type: "POST",
//			data: JSON.stringify({
//				loginid: loginid,
//				sabun : sabun,
//				list : iidList,
//				memo : "LOADEXCEPTION-UNLOAD"
//			}),
//			contentType: "application/json",
//			success: function(data) {
////				loadUnloadedPage(1);
//				// 현재 검색 조건으로 DB에서 새 페이지 조회
//				let searchCriteria = getCurrentSearchCriteria();
//				performProductionUnloadListDBSearch(searchCriteria);
//				hideLoading();
//			},
//			error: function(xhr, status, error) {
//				console.error("요청 실패");
//				console.error("Status:", status);       // 예: "error"
//				console.error("Error:", error);         // 예: 서버 응답 메시지
//				console.error("Response:", xhr.responseText); // 서버 응답 본문
//				alert("오류가 발생했습니다: " + error);
//			}
//		});
//	}else{
//		hideLoading();
//	}
//	
//});

