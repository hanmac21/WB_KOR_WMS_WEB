/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m3_exception_input_detail 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : productionExceptionInputDetail -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : ProductionExceptionInputDetail -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

let globalProductionExceptionInputDetailData = []; // 현재 조회된 데이터 저장
let currentProductionExceptionInputDetailPage = 1; // 현재 페이지
let productionExceptionInputDetailItemsPerPage = 1000; // 페이지당 항목 수
let totalProductionExceptionInputDetailCount = 0; // 서버에서 받은 총 개수 저장
let totalProductionExceptionInputDetailQty = 0; // 서버에서 받은 총 개수 저장
let totalProductionExceptionInputDetailPages = 0; // 서버에서 받은 총 페이지
let totalProductionExceptionInputDetailTotalPages = 0; // 서버에서 받은 총 페이지 수
window.filteredProductionExceptionInputDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
window.productionExceptionInputDetailColumns = [
	{ key: 'INDATE', header: 'Date' },				// INDATE or OUTDATE or SDATE로 변경
	{ key: 'FACTORY', header: 'Factory' },
	{ key: 'STORAGE', header: 'Storage' },
	{ key: 'CAR', header: 'Car' },       
	{ key: 'ITEMCODE', header: 'Item Code' },
	{ key: 'ITEMNAME', header: 'Item Name' },
	{ key: 'QTY', header: 'Qty' },
	{ key: 'LOGINID', header: 'User' },
	{ key: 'TIME', header: 'Time' },
	{ key: 'BARCODE', header: 'Barcode' }
];

$(document).ready(function() {
	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m3_exception_input_detail = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		const storage = factory == 'SALTILLO' ? "H/REST" : "Workshop"
		
		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performProductionExceptionInputDetailDBSearch({ fromDate, toDate, factory, storage });
	}
});

// DB에서 데이터 조회하는 함수
function performProductionExceptionInputDetailDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_productionExceptionInputDetail",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentProductionExceptionInputDetailPage,
			itemsPerPage: productionExceptionInputDetailItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalProductionExceptionInputDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalProductionExceptionInputDetailCount = data.totalCount || 0;
			totalProductionExceptionInputDetailQty = data.totalQty || 0;
			totalProductionExceptionInputDetailPages = data.totalPages || 0;
			currentProductionExceptionInputDetailPage = data.currentPage || 0;
			window.filteredProductionExceptionInputDetailData = globalProductionExceptionInputDetailData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m3_exception_input_detail').length) {
				renderProductionExceptionInputDetailView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderProductionExceptionInputDetailTableData();
				renderProductionExceptionInputDetailPagination();
				updateProductionExceptionInputDetailTotalCount();
				updateProductionExceptionInputDetailTotalQty();
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
function renderProductionExceptionInputDetailView() {
	let content_output = `
		<div class="divBlockControl" id="view_m3_exception_input_detail">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="productionExceptionInputDetail_searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
							<input type="date" id="productionExceptionInputDetail_searchVal_fromDate"/> 
						</div>
						<div class="search-label">
							<div class="productionExceptionInputDetail_searchVal_toDate">　</div>
							<input type="date" id="productionExceptionInputDetail_searchVal_toDate"/>
						</div>
						<div class="search-label">
							<div class="productionExceptionInputDetail_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
							<select id="productionExceptionInputDetail_searchVal_factory" class="factory-select">
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
							</select>
						</div>
						<div class="search-label">
							<div class="productionExceptionInputDetail_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
							<select id="productionExceptionInputDetail_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="productionExceptionInputDetail_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
							<input type="text" id="productionExceptionInputDetail_searchVal_car" />
						</div>
						<div class="search-label">
							<div class="productionExceptionInputDetail_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
							<input type="text" id="productionExceptionInputDetail_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="productionExceptionInputDetail_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
							<input type="text" id="productionExceptionInputDetail_searchVal_itemname" />
						</div>
					</div>
					<div class="search_button_area">
						<button class="btn btn-primary btnProductionExceptionInputDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
						<button class="btn btn-secondary btnProductionExceptionInputDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
						<span>${i18n.t('table.info.total')} <strong id="productionExceptionInputDetailTotalCount">${totalProductionExceptionInputDetailCount}</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="productionExceptionInputDetailCurrentPageInfo">${currentProductionExceptionInputDetailPage}</strong>/<strong id="productionExceptionInputDetailTotalPageInfo">${totalProductionExceptionInputDetailPages}</strong> |
							${i18n.t('table.info.qty')} : <strong id = "productionExceptionInputDetailTotalQty"></strong>  
						</span>
						<div class="action-buttons-right m3_exception_input_detail">
							<div id="defaultActions" class="action-group">								
								<button class="btn btn-success" id="productionExceptionInputDetailExcelBtn" onclick="downloadAllProductionExceptionInputDetailData()">Excel</button>
							</div>
						</div>
					</div>
					<table class="data-table m3_exception_input_detail">
						<thead>
							<tr>
								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
								<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
								<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
								<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
								<th class = "loginidVal">${i18n.t('search.user')}<!-- USER --></th>
								<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>
								<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
							</tr>
						</thead>
						<tbody id="productionExceptionInputDetailTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="productionExceptionInputDetailPaginationContainer">
					</div>
				</div>
			</div>
		</div>
	`;
	// = 위에 data-table, search-row i18n 부분 추가
	/*<button class="btn btn-success" id="productionExceptionInputDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionExceptionInputDetailData, productionExceptionInputDetailColumns, {fileName:'ProductionExceptionInputDetail', sheetName:'ProductionExceptionInputDetail'})">Excel</button>*/
	$(".w_contentArea").append(content_output);

	// ⬇️ 추가: 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#productionExceptionInputDetail_searchVal_fromDate").val(fromDate);
		$("#productionExceptionInputDetail_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderProductionExceptionInputDetailTableData();
	// 페이지네이션 렌더링
	renderProductionExceptionInputDetailPagination();
	// 이벤트 바인딩
	bindProductionExceptionInputDetailEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateProductionExceptionInputDetailTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateProductionExceptionInputDetailTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
    const factory = $('#productionExceptionInputDetail_searchVal_factory');
    const storage = $('#productionExceptionInputDetail_searchVal_storage');
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
function updateProductionExceptionInputDetailTotalCount() {
	$('#productionExceptionInputDetailTotalCount').text(totalProductionExceptionInputDetailCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateProductionExceptionInputDetailTotalQty() {
	$('#productionExceptionInputDetailTotalQty').text(totalProductionExceptionInputDetailQty.toLocaleString());
}

function renderProductionExceptionInputDetailTableData() {
	let tableBody = "";

	//console.log("globalProductionExceptionInputDetailData:", globalProductionExceptionInputDetailData);
	//console.log("데이터 개수:", globalProductionExceptionInputDetailData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalProductionExceptionInputDetailData.length; i++) {
		let rowNumber = (currentProductionExceptionInputDetailPage - 1) * productionExceptionInputDetailItemsPerPage + i + 1;
		let data = globalProductionExceptionInputDetailData[i];
		//console.log(`행 ${i}:`, data); // 각 행 데이터 확인

		tableBody += `
        <tr>
            <td class = "noVal">${rowNumber}</td>
		    <td class = "dateVal">${data.INDATE || data.indate || ''}</td>
		    <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
		    <td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
		    <td class = "carVal">${data.CAR || data.car || ''}</td>
		    <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
		    <td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
		    <td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
			<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
			<td class = "hhmmVal">${data.TIME || data.time || ''}</td>
			<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
        </tr>
    `;
	}
	// =
	//console.log("생성된 tableBody:", tableBody);
	$("#productionExceptionInputDetailTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderProductionExceptionInputDetailPagination() {
	let totalPages = Math.ceil(totalProductionExceptionInputDetailCount / productionExceptionInputDetailItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentProductionExceptionInputDetailPage > 1) {
		paginationHtml += `<button class="productionExceptionInputDetail-page-btn" data-page="${currentProductionExceptionInputDetailPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="productionExceptionInputDetail-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentProductionExceptionInputDetailPage - 5);
	let endPage = Math.min(totalPages, currentProductionExceptionInputDetailPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="productionExceptionInputDetail-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentProductionExceptionInputDetailPage) {
			paginationHtml += `<button class="productionExceptionInputDetail-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="productionExceptionInputDetail-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="productionExceptionInputDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentProductionExceptionInputDetailPage < totalPages) {
		paginationHtml += `<button class="productionExceptionInputDetail-page-btn" data-page="${currentProductionExceptionInputDetailPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="productionExceptionInputDetail-page-btn disabled">&gt;</button>`;
	}

	$('#currentProductionExceptionInputDetailPage').text(currentProductionExceptionInputDetailPage);
	$('#productionExceptionInputDetailTotalPageInfo').text(totalPages);
	$("#productionExceptionInputDetailPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindProductionExceptionInputDetailEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnProductionExceptionInputDetailSearch").off('click').on('click', function() {
		performProductionExceptionInputDetailSearch();
	});

	// 초기화 버튼 클릭
	$(".btnProductionExceptionInputDetailSearchInit").off('click').on('click', function() {
		resetProductionExceptionInputDetailSearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.productionExceptionInputDetail-page-btn').on('click', '.productionExceptionInputDetail-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentProductionExceptionInputDetailPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performProductionExceptionInputDetailDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m3_exception_input_detail input[type="text"], #view_m3_exception_input_detail input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performProductionExceptionInputDetailSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		fromDate: $("#productionExceptionInputDetail_searchVal_fromDate").val(),
		toDate: $("#productionExceptionInputDetail_searchVal_toDate").val(),
		factory : $("#productionExceptionInputDetail_searchVal_factory").val(),
		storage : $("#productionExceptionInputDetail_searchVal_storage").val(),
		car : $("#productionExceptionInputDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode : $("#productionExceptionInputDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionExceptionInputDetail_searchVal_itemname").val().trim().toUpperCase()
	};
}
// =
// 검색 수행 함수 - DB 조회
function performProductionExceptionInputDetailSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentProductionExceptionInputDetailPage = 1;
	performProductionExceptionInputDetailDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetProductionExceptionInputDetailSearch() {
	// 날짜 지정
	const { fromDate, toDate } = getDefaultDateRange();
	
	// 공장, 창고, 작업장 초기화
	renderFactoryStorage();
	
	$("#productionExceptionInputDetail_searchVal_fromDate").val(fromDate);
	$("#productionExceptionInputDetail_searchVal_toDate").val(toDate);
	$("#productionExceptionInputDetail_searchVal_car").val(''); 
	$("#productionExceptionInputDetail_searchVal_itemcode").val(''); 
	$("#productionExceptionInputDetail_searchVal_itemname").val(''); 
	
	// =
	// 초기화 후 전체 데이터 다시 조회
	const factory = getCookie('selectedFactory');
	const storage = factory == 'SALTILLO' ? "H/REST" : "Workshop"	
	
	currentProductionExceptionInputDetailPage = 1;
	performProductionExceptionInputDetailDBSearch({ fromDate, toDate, factory, storage});

	console.log('검색 조건이 초기화되었습니다.');
}


function fmtLocalDate(d){
	const y = d.getFullYear();
	const m = String(d.getMonth()+1).padStart(2,'0');
	const dd = String(d.getDate()).padStart(2,'0');
	return `${y}-${m}-${dd}`;
}

function getDefaultDateRange(){
	const today = new Date();
	const toDate = fmtLocalDate(today);
	const fromDate = fmtLocalDate(today);
	return { fromDate, toDate };
}

// 유틸리티 함수들
window.changeProductionExceptionInputDetailItemsPerPage = function(newItemsPerPage) {
	productionExceptionInputDetailItemsPerPage = newItemsPerPage;
	currentProductionExceptionInputDetailPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performProductionExceptionInputDetailDBSearch(searchCriteria);
}

window.exportProductionExceptionInputDetailData = function() {
	return {
		total: globalProductionExceptionInputDetailData.length,
		currentPage: currentProductionExceptionInputDetailPage,
		itemsPerPage: productionExceptionInputDetailItemsPerPage,
		data: globalProductionExceptionInputDetailData
	};
}

window.downloadAllProductionExceptionInputDetailData = function() {
	let searchCriteria = getCurrentSearchCriteria();

	showLoading("export");

	$.ajax({
		url: "/read_productionExceptionInputDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionExceptionInputDetailColumns, {
				fileName: 'ProductionExceptionInputDetail_All',
				sheetName: 'ProductionExceptionInputDetail'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};