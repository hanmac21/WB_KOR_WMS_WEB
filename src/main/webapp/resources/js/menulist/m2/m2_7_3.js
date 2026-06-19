/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */
let globalRealStockSummaryData = []; // 현재 조회된 데이터 저장
let currentRealStockSummaryPage = 1; // 현재 페이지
let realStockSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalRealStockSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalRealStockSummaryPages = 0; // 서버에서 받은 총 페이지
let realStockSummaryAvailableDates = []; // 데이터 있는 날짜 목록 (현재 달)
let realStockSummaryCalYear = new Date().getFullYear();
let realStockSummaryCalMonth = new Date().getMonth() + 1;

$(document).ready(function() {

	window.filteredRealStockSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.realStockSummaryColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'customer code' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_m2_7_3 = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		let sdate = fromDate;

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage = 'INBOUND'; // 기본값

		performRealStockSummaryDBSearch({ sdate,  storage });
	};
});

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

// DB에서 데이터 조회하는 함수
function performRealStockSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_realStockSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentRealStockSummaryPage,
			itemsPerPage: realStockSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalRealStockSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalRealStockSummaryCount = data.totalCount || 0;
			currentRealStockSummaryPage = data.currentPage || 0;
			window.filteredRealStockSummaryData = globalRealStockSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_7_3').length) {
				renderRealStockSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderRealStockSummaryTableData();
				renderRealStockSummaryPagination();
				updateRealStockSummaryTotalCount();
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
function renderRealStockSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_m2_7_3">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="stockCountSummary_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="text" id="stockCountSummary_searchVal_sdate" readonly="readonly" class="realstock-datepicker" placeholder="YYYY-MM-DD" />
							</div>
							<div class="search-label">
								<div class="stockCountSummary_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="stockCountSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="stockCountSummary_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="stockCountSummary_searchVal_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountSummary_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="stockCountSummary_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="stockCountSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnRealStockSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnRealStockSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="realStockSummaryTotalCount">${totalRealStockSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="realStockSummaryCurrentPageInfo">${currentRealStockSummaryPage}</strong>/<strong id="realStockSummaryTotalPageInfo">${totalRealStockSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="stockCountSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right m2_7_3">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="realStockSummaryExcelBtn" onclick="downloadAllRealStockSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_7_3">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- SDATE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemcodeVal">${i18n.t('search.customercode')}<!-- CUSTCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="realStockSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="realStockSummaryPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
	$(".w_contentArea").append(content_output);
	
	// ⬇️ 추가: 화면에 기본 날짜 세팅 (datepicker 초기화 전 raw val 세팅)
	(function() {
		const { fromDate } = getDefaultDateRange();
		$("#stockCountSummary_searchVal_sdate").val(fromDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 달력 초기화 (날짜 하이라이트 포함)
	initRealStockSummaryDatepicker();
	// 테이블 데이터 렌더링
	renderRealStockSummaryTableData();
	// 페이지네이션 렌더링
	renderRealStockSummaryPagination();
	// 이벤트 바인딩
	bindRealStockSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateRealStockSummaryTotalCount();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const storage = $('#stockCountSummary_searchVal_storage');
	const savedStorage = getCookie('selectedStorage');

	storage.empty();

	let storageList = ['INBOUND',  'OUTSIDE', 'all'];

	// ILLINOIS 사용자는 OUTSIDE만 선택 가능
	if (savedStorage === 'ILLINOIS') {
		storageList = ['OUTSIDE'];
	}

	storageList.forEach(item => {
		const text = item === 'all' ? i18n.t('search.all') : item;
		storage.append(`<option value="${item}">${text}</option>`);
	});

	storage.val(storageList[0]);
	
	window.autoSetStorageFields();
}

// 달력 초기화 - jQuery UI Datepicker로 데이터 있는 날 하이라이트
function initRealStockSummaryDatepicker() {
	const storage = $("#stockCountSummary_searchVal_storage").val() || '';
	const yearMonth = toYearMonthSummary(realStockSummaryCalYear, realStockSummaryCalMonth);
	loadRealStockSummaryDates(storage, yearMonth, function() {
		$("#stockCountSummary_searchVal_sdate").datepicker({
			dateFormat: "yy-mm-dd",
			beforeShow: function(input, inst) {
				setTimeout(function() {
					inst.dpDiv.css("z-index", 9999);
				}, 0);
			},
			beforeShowDay: function(date) {
				const y = date.getFullYear();
				const m = String(date.getMonth() + 1).padStart(2, '0');
				const d = String(date.getDate()).padStart(2, '0');
				const dateStr = `${y}-${m}-${d}`;
				if (realStockSummaryAvailableDates.indexOf(dateStr) !== -1) {
					return [true, "realstock-has-data", "데이터 있음"];
				}
				return [true, "", ""];
			},
			onChangeMonthYear: function(year, month) {
				realStockSummaryCalYear = year;
				realStockSummaryCalMonth = month;
				const storage = $("#stockCountSummary_searchVal_storage").val() || '';
				loadRealStockSummaryDates(storage, toYearMonthSummary(year, month), function() {
					$("#stockCountSummary_searchVal_sdate").datepicker("refresh");
				});
			}
		});
	});
}

function toYearMonthSummary(year, month) {
	return `${year}-${String(month).padStart(2, '0')}`;
}

// DB에서 해당 월에 데이터 있는 날짜 목록 로드
function loadRealStockSummaryDates(storage, yearMonth, callback) {
	const paramMap = { yearMonth: yearMonth };
	if (storage && storage !== 'all') {
		paramMap.storage = storage;
	}
	$.ajax({
		url: "/read_realStock_dates",
		type: "POST",
		data: JSON.stringify(paramMap),
		contentType: "application/json",
		success: function(dates) {
			realStockSummaryAvailableDates = dates || [];
			if (typeof callback === 'function') callback();
		},
		error: function() {
			realStockSummaryAvailableDates = [];
			if (typeof callback === 'function') callback();
		}
	});
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}


// 총 개수를 업데이트하는 함수
function updateRealStockSummaryTotalCount() {
	$('#realStockSummaryTotalCount').text(Number(totalRealStockSummaryCount).toLocaleString());
}

function renderRealStockSummaryTableData() {
	let tableBody = "";

	//console.log("globalRealStockSummaryData:", globalRealStockSummaryData);
	//console.log("데이터 개수:", globalRealStockSummaryData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalRealStockSummaryData.length; i++) {
		let rowNumber = (currentRealStockSummaryPage - 1) * realStockSummaryItemsPerPage + i + 1;
		let un = globalRealStockSummaryData[i]
		let statusText = globalRealStockSummaryData[i].intf_yn === 'Y' ? 'Completed' : 'Waiting';
		let statusClass = globalRealStockSummaryData[i].intf_yn === 'Y' ? 'status-completed' : 'status-waiting';

		//console.log(`행 ${i}:`, globalRealStockSummaryData[i]); // 각 행 데이터 확인

		tableBody += `
            <tr>	
                <td class = "noVal">${rowNumber}</td>
                <td class = "dateVal">${globalRealStockSummaryData[i].SDATE || globalRealStockSummaryData[i].sdate || ''}</td>
                <td class = "carVal">${globalRealStockSummaryData[i].CAR || globalRealStockSummaryData[i].car || ''}</td>
                <td class = "itemcodeVal">${globalRealStockSummaryData[i].ITEMCODE || globalRealStockSummaryData[i].itemcode || ''}</td>
                <td class = "itemcodeVal">${globalRealStockSummaryData[i].SPEC || globalRealStockSummaryData[i].spec || ''}</td>
                <td class = "itemnameVal">${globalRealStockSummaryData[i].ITEMNAME || globalRealStockSummaryData[i].itemname || ''}</td>
                <td class = "qtyVal">${Number(globalRealStockSummaryData[i].QTY || globalRealStockSummaryData[i].qty || 0).toLocaleString()}</td>
            </tr>
        `;
	}

	//console.log("생성된 tableBody:", tableBody);
	$("#realStockSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderRealStockSummaryPagination() {
	let totalPages = Math.ceil(totalRealStockSummaryCount / realStockSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentRealStockSummaryPage > 1) {
		paginationHtml += `<button class="realStockSummary-page-btn" data-page="${currentRealStockSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="realStockSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentRealStockSummaryPage - 5);
	let endPage = Math.min(totalPages, currentRealStockSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="realStockSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentRealStockSummaryPage) {
			paginationHtml += `<button class="realStockSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="realStockSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="realStockSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentRealStockSummaryPage < totalPages) {
		paginationHtml += `<button class="realStockSummary-page-btn" data-page="${currentRealStockSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="realStockSummary-page-btn disabled">&gt;</button>`;
	}

	$("#realStockSummaryCurrentPageInfo").text(currentRealStockSummaryPage);
	$("#realStockSummaryTotalPageInfo").text(totalPages);
	$("#realStockSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindRealStockSummaryEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.stockCountSummary_chkAll').on('change', '.stockCountSummary_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.stockCountSummary_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.stockCountSummary_chk').on('change', '.stockCountSummary_chk', function() {
		let totalCheckboxes = $('.stockCountSummary_chk').length;
		let checkedCheckboxes = $('.stockCountSummary_chk:checked').length;
		$('.stockCountSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnRealStockSummarySearch").off('click').on('click', function() {
		performRealStockSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnRealStockSummarySearchInit").off('click').on('click', function() {
		resetRealStockSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.realStockSummary-page-btn').on('click', '.realStockSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentRealStockSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performRealStockSummaryDBSearch(searchCriteria);
			}
		}
	});

	// storage 변경 시 달력 날짜 하이라이트 갱신 (현재 표시 중인 달 기준)
	$("#stockCountSummary_searchVal_storage").off('change.datepicker').on('change.datepicker', function() {
		const storage = $(this).val() || '';
		loadRealStockSummaryDates(storage, toYearMonthSummary(realStockSummaryCalYear, realStockSummaryCalMonth), function() {
			$("#stockCountSummary_searchVal_sdate").datepicker("refresh");
		});
	});

	// 엔터키 검색
	$('#view_m2_7_3 input[type="text"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performRealStockSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		intf_yn: $("#stockCountSummary_searchVal_Condition").val(),
		scantype: 'all',
		storage: $("#stockCountSummary_searchVal_storage").val(),
		sdate: $("#stockCountSummary_searchVal_sdate").val(),
		//car: $("#stockCountSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#stockCountSummary_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#stockCountSummary_searchVal_oitemcode").val().trim().toUpperCase(),
		itemname: $("#stockCountSummary_searchVal_itemname").val().trim().toUpperCase(),
	};
}

// 검색 수행 함수 - DB 조회
function performRealStockSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentRealStockSummaryPage = 1;
	performRealStockSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetRealStockSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const sdate = fromDate;

	$("#stockCountSummary_searchVal_sdate").datepicker("setDate", fromDate);
	$("#stockCountSummary_searchVal_itemcode").val('');
	$("#stockCountSummary_searchVal_itemname").val('');
	
	renderFactoryStorage();
	let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값
	
	// 초기화 후 전체 데이터 다시 조회
	currentRealStockSummaryPage = 1;
	performRealStockSummaryDBSearch({  storage, sdate });

	console.log('검색 조건이 초기화되었습니다.');
}

// 유틸리티 함수들
window.changeRealStockSummaryItemsPerPage = function(newItemsPerPage) {
	realStockSummaryItemsPerPage = newItemsPerPage;
	currentRealStockSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performRealStockSummaryDBSearch(searchCriteria);
}

window.exportRealStockSummaryData = function() {
	return {
		total: globalRealStockSummaryData.length,
		currentPage: currentRealStockSummaryPage,
		itemsPerPage: realStockSummaryItemsPerPage,
		data: globalRealStockSummaryData
	};
}
function updateTotalQty() {
	let searchMap = getCurrentSearchCriteria();
	if (!searchMap) {
		searchMap = {}; // null이면 빈 객체로 변경
	}

	$.ajax({
		url: "/updateTotalQty_stockCount",
		type: "POST",
		data: JSON.stringify(searchMap),
		contentType: "application/json",
		success: function(data) {
			$(".stockCountSummaryTotalQty").text(Number(data).toLocaleString());
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


window.downloadAllRealStockSummaryData = function() {
	let searchCriteria = {
		intf_yn: $("#stockCountSummary_searchVal_Condition").val(),
		storage: $("#stockCountSummary_searchVal_storage").val(),
		scantype: 'all',
		sdate: $("#stockCountSummary_searchVal_sdate").val(),
		//car: $("#stockCountSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#stockCountSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#stockCountSummary_searchVal_itemname").val().trim().toUpperCase(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_realStockSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.realStockSummaryColumns, {
				fileName: 'RealStockSummary_All',
				sheetName: 'RealStockSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};
