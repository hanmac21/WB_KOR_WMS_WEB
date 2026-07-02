/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */
let globalRealStockOutSummaryData = []; // 현재 조회된 데이터 저장
let currentRealStockOutSummaryPage = 1; // 현재 페이지
let realStockOutSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalRealStockOutSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalRealStockOutSummaryPages = 0; // 서버에서 받은 총 페이지
let realStockOutSummaryAvailableDates = []; // 데이터 있는 날짜 목록 (현재 달)
let realStockOutSummaryCalYear = new Date().getFullYear();
let realStockOutSummaryCalMonth = new Date().getMonth() + 1;

$(document).ready(function() {

	window.filteredRealStockOutSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.realStockOutSummaryColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'customer code' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_stockcount_out_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		let sdate = fromDate;

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage = '사외'; // 기본값

		performRealStockOutSummaryDBSearch({ sdate,  storage });
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
function performRealStockOutSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_realStockSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentRealStockOutSummaryPage,
			itemsPerPage: realStockOutSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalRealStockOutSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalRealStockOutSummaryCount = data.totalCount || 0;
			currentRealStockOutSummaryPage = data.currentPage || 0;
			window.filteredRealStockOutSummaryData = globalRealStockOutSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mPurchase_stockcount_out_summary').length) {
				renderRealStockOutSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderRealStockOutSummaryTableData();
				renderRealStockOutSummaryPagination();
				updateRealStockOutSummaryTotalCount();
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
function renderRealStockOutSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_mPurchase_stockcount_out_summary">
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
								<button class="btn btn-primary btnRealStockOutSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnRealStockOutSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="realStockOutSummaryTotalCount">${totalRealStockOutSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="realStockOutSummaryCurrentPageInfo">${currentRealStockOutSummaryPage}</strong>/<strong id="realStockOutSummaryTotalPageInfo">${totalRealStockOutSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="stockCountSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_stockcount_out_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="realStockOutSummaryExcelBtn" onclick="downloadAllRealStockOutSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_stockcount_out_summary">
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
							<tbody id="realStockOutSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="realStockOutSummaryPaginationContainer">
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
	initRealStockOutSummaryDatepicker();
	// 테이블 데이터 렌더링
	renderRealStockOutSummaryTableData();
	// 페이지네이션 렌더링
	renderRealStockOutSummaryPagination();
	// 이벤트 바인딩
	bindRealStockOutSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateRealStockOutSummaryTotalCount();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const storage = $('#stockCountSummary_searchVal_storage');

	storage.empty();

	// 전체 옵션을 기본값으로 먼저 추가
	storage.append(`<option value="사외">${i18n.t('search.all')}</option>`);

	$.ajax({
		url: "/read_warehouse",
		type: "POST",
		data: JSON.stringify({
			searchParams: {
				type: "사외"
			}
		}),
		contentType: "application/json",
		success: function(response) {
			let records = response.records || [];

			// DB 창고 목록 추가 (사외만)
			records.forEach(item => {
				const val = item.STORAGE || '';
				if (val !== '') {
					storage.append(`<option value="${val}">${val}</option>`);
				}
			});

			// 기본값을 전체로
			storage.val('사외');

			window.autoSetStorageFields();
		},
		error: function(xhr, status, error) {
			console.error("창고 목록 조회 실패:", error);
			// 실패해도 전체 옵션은 유지되고 기본값 세팅
			storage.val('사외');
			window.autoSetStorageFields();
		}
	});
}

// 달력 초기화 - jQuery UI Datepicker로 데이터 있는 날 하이라이트
function initRealStockOutSummaryDatepicker() {
	const storage = $("#stockCountSummary_searchVal_storage").val() || '';
	const yearMonth = toYearMonthSummary(realStockOutSummaryCalYear, realStockOutSummaryCalMonth);
	loadRealStockOutSummaryDates(storage, yearMonth, function() {
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
				if (realStockOutSummaryAvailableDates.indexOf(dateStr) !== -1) {
					return [true, "realstock-has-data", "데이터 있음"];
				}
				return [true, "", ""];
			},
			onChangeMonthYear: function(year, month) {
				realStockOutSummaryCalYear = year;
				realStockOutSummaryCalMonth = month;
				const storage = $("#stockCountSummary_searchVal_storage").val() || '';
				loadRealStockOutSummaryDates(storage, toYearMonthSummary(year, month), function() {
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
function loadRealStockOutSummaryDates(storage, yearMonth, callback) {
	const paramMap = { yearMonth: yearMonth };
	if (storage && storage !== '사외') {
		paramMap.storage = storage;
	}
	$.ajax({
		url: "/read_realStock_dates",
		type: "POST",
		data: JSON.stringify(paramMap),
		contentType: "application/json",
		success: function(dates) {
			realStockOutSummaryAvailableDates = dates || [];
			if (typeof callback === 'function') callback();
		},
		error: function() {
			realStockOutSummaryAvailableDates = [];
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
function updateRealStockOutSummaryTotalCount() {
	$('#realStockOutSummaryTotalCount').text(Number(totalRealStockOutSummaryCount).toLocaleString());
}

function renderRealStockOutSummaryTableData() {
	let tableBody = "";

	//console.log("globalRealStockOutSummaryData:", globalRealStockOutSummaryData);
	//console.log("데이터 개수:", globalRealStockOutSummaryData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalRealStockOutSummaryData.length; i++) {
		let rowNumber = (currentRealStockOutSummaryPage - 1) * realStockOutSummaryItemsPerPage + i + 1;

		//console.log(`행 ${i}:`, globalRealStockOutSummaryData[i]); // 각 행 데이터 확인

		tableBody += `
            <tr>	
                <td class = "noVal">${rowNumber}</td>
                <td class = "dateVal">${globalRealStockOutSummaryData[i].SDATE || globalRealStockOutSummaryData[i].sdate || ''}</td>
                <td class = "carVal">${globalRealStockOutSummaryData[i].CAR || globalRealStockOutSummaryData[i].car || ''}</td>
                <td class = "itemcodeVal">${globalRealStockOutSummaryData[i].ITEMCODE || globalRealStockOutSummaryData[i].itemcode || ''}</td>
                <td class = "itemcodeVal">${globalRealStockOutSummaryData[i].SPEC || globalRealStockOutSummaryData[i].spec || ''}</td>
                <td class = "itemnameVal">${globalRealStockOutSummaryData[i].ITEMNAME || globalRealStockOutSummaryData[i].itemname || ''}</td>
                <td class = "qtyVal">${Number(globalRealStockOutSummaryData[i].QTY || globalRealStockOutSummaryData[i].qty || 0).toLocaleString()}</td>
            </tr>
        `;
	}

	//console.log("생성된 tableBody:", tableBody);
	$("#realStockOutSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderRealStockOutSummaryPagination() {
	let totalPages = Math.ceil(totalRealStockOutSummaryCount / realStockOutSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentRealStockOutSummaryPage > 1) {
		paginationHtml += `<button class="realStockOutSummary-page-btn" data-page="${currentRealStockOutSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="realStockOutSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentRealStockOutSummaryPage - 5);
	let endPage = Math.min(totalPages, currentRealStockOutSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="realStockOutSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentRealStockOutSummaryPage) {
			paginationHtml += `<button class="realStockOutSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="realStockOutSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="realStockOutSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentRealStockOutSummaryPage < totalPages) {
		paginationHtml += `<button class="realStockOutSummary-page-btn" data-page="${currentRealStockOutSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="realStockOutSummary-page-btn disabled">&gt;</button>`;
	}

	$("#realStockOutSummaryCurrentPageInfo").text(currentRealStockOutSummaryPage);
	$("#realStockOutSummaryTotalPageInfo").text(totalPages);
	$("#realStockOutSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindRealStockOutSummaryEvents() {
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
	$(".btnRealStockOutSummarySearch").off('click').on('click', function() {
		performRealStockOutSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnRealStockOutSummarySearchInit").off('click').on('click', function() {
		resetRealStockOutSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.realStockOutSummary-page-btn').on('click', '.realStockOutSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentRealStockOutSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performRealStockOutSummaryDBSearch(searchCriteria);
			}
		}
	});

	// storage 변경 시 달력 날짜 하이라이트 갱신 (현재 표시 중인 달 기준)
	$("#stockCountSummary_searchVal_storage").off('change.datepicker').on('change.datepicker', function() {
		const storage = $(this).val() || '';
		loadRealStockOutSummaryDates(storage, toYearMonthSummary(realStockOutSummaryCalYear, realStockOutSummaryCalMonth), function() {
			$("#stockCountSummary_searchVal_sdate").datepicker("refresh");
		});
	});

	// 엔터키 검색
	$('#view_mPurchase_stockcount_out_summary input[type="text"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performRealStockOutSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		storage: $("#stockCountSummary_searchVal_storage").val(),
		sdate: $("#stockCountSummary_searchVal_sdate").val(),
		//car: $("#stockCountSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#stockCountSummary_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#stockCountSummary_searchVal_oitemcode").val().trim().toUpperCase(),
		itemname: $("#stockCountSummary_searchVal_itemname").val().trim().toUpperCase(),
	};
}

// 검색 수행 함수 - DB 조회
function performRealStockOutSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentRealStockOutSummaryPage = 1;
	performRealStockOutSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetRealStockOutSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const sdate = fromDate;

	$("#stockCountSummary_searchVal_sdate").datepicker("setDate", fromDate);
	$("#stockCountSummary_searchVal_itemcode").val('');
	$("#stockCountSummary_searchVal_itemname").val('');
	
	renderFactoryStorage();
	let storage = '사외'
	
	// 초기화 후 전체 데이터 다시 조회
	currentRealStockOutSummaryPage = 1;
	performRealStockOutSummaryDBSearch({  storage, sdate });

	console.log('검색 조건이 초기화되었습니다.');
}

// 유틸리티 함수들
window.changeRealStockOutSummaryItemsPerPage = function(newItemsPerPage) {
	realStockOutSummaryItemsPerPage = newItemsPerPage;
	currentRealStockOutSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performRealStockOutSummaryDBSearch(searchCriteria);
}

window.exportRealStockOutSummaryData = function() {
	return {
		total: globalRealStockOutSummaryData.length,
		currentPage: currentRealStockOutSummaryPage,
		itemsPerPage: realStockOutSummaryItemsPerPage,
		data: globalRealStockOutSummaryData
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


window.downloadAllRealStockOutSummaryData = function() {
	let searchCriteria = {
		storage: $("#stockCountSummary_searchVal_storage").val(),
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
			ExcelExporter.downloadExcel(data, window.realStockOutSummaryColumns, {
				fileName: 'RealStockOutSummary_All',
				sheetName: 'RealStockOutSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};
