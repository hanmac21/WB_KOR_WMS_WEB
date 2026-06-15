/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_feeding_summary 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : feedingSummary -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : FeedingSummary -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

let globalFeedingSummaryData = []; // 현재 조회된 데이터 저장
let currentFeedingSummaryPage = 1; // 현재 페이지
let feedingSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalFeedingSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalFeedingSummaryQty = 0; // 서버에서 받은 총 개수 저장
let totalFeedingSummaryPages = 0; // 서버에서 받은 총 페이지
let totalFeedingSummaryTotalPages = 0; // 서버에서 받은 총 페이지 수
window.filteredFeedingSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
window.feedingSummaryColumns = [
	{ key: 'INDATE', header: 'Date' },				// INDATE or OUTDATE or SDATE로 변경
	{ key: 'FACTORY', header: 'Factory' },
	{ key: 'STORAGE', header: 'Storage' },
	{ key: 'CAR', header: 'Car' },       
	{ key: 'ITEMCODE', header: 'Item Code' },
	{ key: 'ITEMNAME', header: 'Item Name' },
	{ key: 'QTY', header: 'Qty' },
];

$(document).ready(function() {
	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_feeding_summary = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performFeedingSummaryDBSearch({ fromDate, toDate, factory });
	}
});

// DB에서 데이터 조회하는 함수
function performFeedingSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_feedingSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentFeedingSummaryPage,
			itemsPerPage: feedingSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalFeedingSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalFeedingSummaryCount = data.totalCount || 0;
			totalFeedingSummaryQty = data.totalQty || 0;
			totalFeedingSummaryPages = data.totalPages || 0;
			currentFeedingSummaryPage = data.currentPage || 0;
			window.filteredFeedingSummaryData = globalFeedingSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_feeding_summary').length) {
				renderFeedingSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderFeedingSummaryTableData();
				renderFeedingSummaryPagination();
				updateFeedingSummaryTotalCount();
				updateFeedingSummaryTotalQty();
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
function renderFeedingSummaryView() {
	let content_output = `
		<div class="divBlockControl" id="view_m2_feeding_summary">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="feedingSummary_searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
							<input type="date" id="feedingSummary_searchVal_fromDate"/> 
						</div>
						<div class="search-label">
							<div class="feedingSummary_searchVal_toDate">　</div>
							<input type="date" id="feedingSummary_searchVal_toDate"/>
						</div>
						<div class="search-label">
							<div class="feedingSummary_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
							<select id="feedingSummary_searchVal_factory" class="factory-select">
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
							</select>
						</div>
						<div class="search-label">
							<div class="feedingSummary_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
							<select id="feedingSummary_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="feedingSummary_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
							<input type="text" id="feedingSummary_searchVal_car" />
						</div>
						<div class="search-label">
							<div class="feedingSummary_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
							<input type="text" id="feedingSummary_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="feedingSummary_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
							<input type="text" id="feedingSummary_searchVal_itemname" />
						</div>
					</div>
					<div class="search_button_area">
						<button class="btn btn-primary btnFeedingSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
						<button class="btn btn-secondary btnFeedingSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
						<span>${i18n.t('table.info.total')} <strong id="feedingSummaryTotalCount">${totalFeedingSummaryCount}</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="feedingSummaryCurrentPageInfo">${currentFeedingSummaryPage}</strong>/<strong id="feedingSummaryTotalPageInfo">${totalFeedingSummaryPages}</strong> |
							${i18n.t('table.info.qty')} : <strong id = "feedingSummaryTotalQty"></strong>  
						</span>
						<div class="action-buttons-right m2_feeding_summary">
							<div id="defaultActions" class="action-group">								
								<button class="btn btn-success" id="feedingSummaryExcelBtn" onclick="downloadAllFeedingSummaryData()">Excel</button>
							</div>
						</div>
					</div>
					<table class="data-table m2_feeding_summary">
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
							</tr>
						</thead>
						<tbody id="feedingSummaryTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="feedingSummaryPaginationContainer">
					</div>
				</div>
			</div>
		</div>
	`;
	// = 위에 data-table, search-row i18n 부분 추가
	/*<button class="btn btn-success" id="feedingSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredFeedingSummaryData, feedingSummaryColumns, {fileName:'FeedingSummary', sheetName:'FeedingSummary'})">Excel</button>*/
	$(".w_contentArea").append(content_output);

	// ⬇️ 추가: 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#feedingSummary_searchVal_fromDate").val(fromDate);
		$("#feedingSummary_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderFeedingSummaryTableData();
	// 페이지네이션 렌더링
	renderFeedingSummaryPagination();
	// 이벤트 바인딩
	bindFeedingSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateFeedingSummaryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateFeedingSummaryTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
    const factory = $('#feedingSummary_searchVal_factory');
    const storage = $('#feedingSummary_searchVal_storage');
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
function updateFeedingSummaryTotalCount() {
	$('#feedingSummaryTotalCount').text(totalFeedingSummaryCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateFeedingSummaryTotalQty() {
	$('#feedingSummaryTotalQty').text(totalFeedingSummaryQty.toLocaleString());
}

function renderFeedingSummaryTableData() {
	let tableBody = "";

	//console.log("globalFeedingSummaryData:", globalFeedingSummaryData);
	//console.log("데이터 개수:", globalFeedingSummaryData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalFeedingSummaryData.length; i++) {
		let rowNumber = (currentFeedingSummaryPage - 1) * feedingSummaryItemsPerPage + i + 1;
		let data = globalFeedingSummaryData[i];
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
        </tr>
    `;
	}
	// =
	//console.log("생성된 tableBody:", tableBody);
	$("#feedingSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderFeedingSummaryPagination() {
	let totalPages = Math.ceil(totalFeedingSummaryCount / feedingSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentFeedingSummaryPage > 1) {
		paginationHtml += `<button class="feedingSummary-page-btn" data-page="${currentFeedingSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="feedingSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentFeedingSummaryPage - 5);
	let endPage = Math.min(totalPages, currentFeedingSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="feedingSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentFeedingSummaryPage) {
			paginationHtml += `<button class="feedingSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="feedingSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="feedingSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentFeedingSummaryPage < totalPages) {
		paginationHtml += `<button class="feedingSummary-page-btn" data-page="${currentFeedingSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="feedingSummary-page-btn disabled">&gt;</button>`;
	}

	$('#currentFeedingSummaryPage').text(currentFeedingSummaryPage);
	$('#feedingSummaryTotalPageInfo').text(totalPages);
	$("#feedingSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindFeedingSummaryEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnFeedingSummarySearch").off('click').on('click', function() {
		performFeedingSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnFeedingSummarySearchInit").off('click').on('click', function() {
		resetFeedingSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.feedingSummary-page-btn').on('click', '.feedingSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentFeedingSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performFeedingSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_feeding_summary input[type="text"], #view_m2_feeding_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performFeedingSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		fromDate: $("#feedingSummary_searchVal_fromDate").val(),
		toDate: $("#feedingSummary_searchVal_toDate").val(),
		factory : $("#feedingSummary_searchVal_factory").val(),
		storage : $("#feedingSummary_searchVal_storage").val(),
		car : $("#feedingSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode : $("#feedingSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#feedingSummary_searchVal_itemname").val().trim().toUpperCase()
	};
}
// =
// 검색 수행 함수 - DB 조회
function performFeedingSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentFeedingSummaryPage = 1;
	performFeedingSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetFeedingSummarySearch() {
	// 날짜 지정
	const { fromDate, toDate } = getDefaultDateRange();
	// 공장 가져오기
	const factory = getCookie('selectedFactory');
	
	// 공장, 창고, 작업장 초기화
	renderFactoryStorage();
	
	$("#feedingSummary_searchVal_fromDate").val(fromDate);
	$("#feedingSummary_searchVal_toDate").val(toDate);
	$("#feedingSummary_searchVal_car").val(''); 
	$("#feedingSummary_searchVal_itemcode").val(''); 
	$("#feedingSummary_searchVal_itemname").val(''); 
	
	// =
	// 초기화 후 전체 데이터 다시 조회
	currentFeedingSummaryPage = 1;
	performFeedingSummaryDBSearch({ fromDate, toDate, factory });

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
window.changeFeedingSummaryItemsPerPage = function(newItemsPerPage) {
	feedingSummaryItemsPerPage = newItemsPerPage;
	currentFeedingSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performFeedingSummaryDBSearch(searchCriteria);
}

window.exportFeedingSummaryData = function() {
	return {
		total: globalFeedingSummaryData.length,
		currentPage: currentFeedingSummaryPage,
		itemsPerPage: feedingSummaryItemsPerPage,
		data: globalFeedingSummaryData
	};
}

window.downloadAllFeedingSummaryData = function() {
	let searchCriteria = getCurrentSearchCriteria();

	showLoading("export");

	$.ajax({
		url: "/read_feedingSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.feedingSummaryColumns, {
				fileName: 'FeedingSummary_All',
				sheetName: 'FeedingSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};