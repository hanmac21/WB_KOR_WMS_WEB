1/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalRealStockData = []; // 현재 조회된 데이터 저장
	let currentRealStockPage = 1; // 현재 페이지
	let realStockItemsPerPage = 1000; // 페이지당 항목 수
	let totalRealStockCount = 0; // 서버에서 받은 총 개수 저장
	let totalRealStockPages = 0; // 서버에서 받은 총 페이지
	let realStockAvailableDates = []; // t_wms_realstock에 데이터 있는 날짜 목록 (현재 달)
	let realStockCalYear = new Date().getFullYear();   // 달력에 표시 중인 연도
	let realStockCalMonth = new Date().getMonth() + 1; // 달력에 표시 중인 월 (1-12)

	window.filteredRealStockData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.realStockColumns = [
		{ key: 'SCANTYPE', header: 'scantype' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'SPEC', header: 'customer code' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'barcode' }
	];

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_m2_7_1 = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		let sdate = fromDate;

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		performRealStockDBSearch({ sdate, storage });
	};

	// DB에서 데이터 조회하는 함수
	function performRealStockDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_realStock",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentRealStockPage,
				itemsPerPage: realStockItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalRealStockData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalRealStockCount = data.totalCount || 0;
				totalRealStockPages = data.totalPages || 0;
				window.filteredRealStockData = globalRealStockData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_7_1').length) {
					renderRealStockView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderRealStockTableData();
					renderRealStockPagination();
					updateRealStockTotalCount();
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
	function renderRealStockView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_7_1">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="stockCountDetail_searchVal_counttype">${i18n.t('search.countType')}<!-- LASTDAY --></div>
								<select id="stockCountDetail_searchVal_counttype" >
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="ALWAYS">ALWAYS</option>
									<option value="LASTDAY">LASTDAY</option>
								</select>
							</div>
							<div class="search-label">
								<div class="stockCountDetail_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="text" id="stockCountDetail_searchVal_sdate" readonly="readonly" class="realstock-datepicker" placeholder="YYYY-MM-DD" />
							</div>
							<div class="search-label">
								<div class="stockCountDetail_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="stockCountDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="stockCountDetail_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="stockCountDetail_searchVal_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="stockCountDetail_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="stockCountDetail_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="stockCountDetail_searchVal_loginid">${i18n.t('search.user')}<!-- USER --></div>
								<input type="text" id="stockCountDetail_searchVal_loginid" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnRealStockSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnRealStockSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="realStockTotalCount">${totalRealStockCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="realStockCurrentPageInfo">${currentRealStockPage}</strong>/<strong id="realStockTotalPageInfo">${totalRealStockPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="stockCountDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right m2_7_1">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="realStockExcelBtn" onclick="downloadAllRealStockData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_7_1">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "scantypeVal">${i18n.t('search.countType')}<!-- COUNTTYPE --></th>
									<th class = "scantypeVal">${i18n.t('search.scanType')}<!-- SCANTYPE --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- SDATE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "cnameVal">${i18n.t('search.customercode')}<!-- CUSTCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>   
									<th class = "userVal">${i18n.t('search.user')}<!-- LOGINID --></th>									    
									<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>	
									<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
								</tr>
							</thead>
							<tbody id="realStockDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="realStockPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		/*<button class="btn btn-success" id="realStockExcelBtn" onclick="ExcelExporter.downloadExcel(filteredRealStockData, realStockColumns, {fileName:'RealStock', sheetName:'RealStock'})">Excel</button>*/
		$(".w_contentArea").append(content_output);
		
		// ⬇️ 추가: 화면에 기본 날짜 세팅 (datepicker 초기화 전 raw val 세팅)
		(function() {
			const { fromDate } = getDefaultDateRange();
			$("#stockCountDetail_searchVal_sdate").val(fromDate);
		})();
		// 공장 및 창고 선택
		renderFactoryStorage();
		// 달력 초기화 (날짜 하이라이트 포함)
		initRealStockDatepicker();
		// 테이블 데이터 렌더링
		renderRealStockTableData();
		// 페이지네이션 렌더링
		renderRealStockPagination();
		// 이벤트 바인딩
		bindRealStockEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateRealStockTotalCount();
		
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

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const storage = $('#stockCountDetail_searchVal_storage');
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
	function initRealStockDatepicker() {
		const storage = $("#stockCountDetail_searchVal_storage").val() || '';
		const yearMonth = toYearMonth(realStockCalYear, realStockCalMonth);
		loadRealStockDates(storage, yearMonth, function() {
			$("#stockCountDetail_searchVal_sdate").datepicker({
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
					if (realStockAvailableDates.indexOf(dateStr) !== -1) {
						return [true, "realstock-has-data", "데이터 있음"];
					}
					return [true, "", ""];
				},
				onChangeMonthYear: function(year, month) {
					realStockCalYear = year;
					realStockCalMonth = month;
					const storage = $("#stockCountDetail_searchVal_storage").val() || '';
					loadRealStockDates(storage, toYearMonth(year, month), function() {
						$("#stockCountDetail_searchVal_sdate").datepicker("refresh");
					});
				}
			});
		});
	}

	function toYearMonth(year, month) {
		return `${year}-${String(month).padStart(2, '0')}`;
	}

	// DB에서 해당 월에 데이터 있는 날짜 목록 로드
	function loadRealStockDates(storage, yearMonth, callback) {
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
				realStockAvailableDates = dates || [];
				if (typeof callback === 'function') callback();
			},
			error: function() {
				realStockAvailableDates = [];
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
	function updateRealStockTotalCount() {
		$('#realStockTotalCount').text(Number(totalRealStockCount).toLocaleString());
	}

	function renderRealStockTableData() {
		let tableBody = "";

		//console.log("globalRealStockData:", globalRealStockData);
		//console.log("데이터 개수:", globalRealStockData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalRealStockData.length; i++) {
			let rowNumber = (currentRealStockPage - 1) * realStockItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalRealStockData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "scantypeVal">${globalRealStockData[i].SOURCE || globalRealStockData[i].source || ''}</td>
				<td class = "scantypeVal">${globalRealStockData[i].SCANTYPE || globalRealStockData[i].scantype || ''}</td>
                <td class = "storageVal">${globalRealStockData[i].STORAGE || globalRealStockData[i].storage || ''}</td>
                <td class = "dateVal">${globalRealStockData[i].SDATE || globalRealStockData[i].sdate || ''}</td>
                <td class = "carVal">${globalRealStockData[i].CAR || globalRealStockData[i].car || ''}</td>
                <td class = "itemcodeVal">${globalRealStockData[i].ITEMCODE || globalRealStockData[i].itemcode || ''}</td>
                <td class = "cnameVal">${globalRealStockData[i].SPEC || globalRealStockData[i].spec || ''}</td>
                <td class = "itemnameVal">${globalRealStockData[i].ITEMNAME || globalRealStockData[i].itemname || ''}</td>
                <td class = "qtyVal">${Number(globalRealStockData[i].QTY || globalRealStockData[i].qty || 0).toLocaleString()}</td>
                <td class = "locationVal">${globalRealStockData[i].LOCATION || globalRealStockData[i].location || ''}</td>
                <td class = "userVal">${globalRealStockData[i].LOGINID || globalRealStockData[i].loginid || ''}</td>
                <td class = "hhmmVal">${globalRealStockData[i].HHMM || globalRealStockData[i].hhmm || ''}</td>
				<td class = "barcodeVal">${globalRealStockData[i].BARCODE || globalRealStockData[i].barcode || ''}</td>
            </tr>
        `;
		}

		//console.log("생성된 tableBody:", tableBody);
		$("#realStockDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderRealStockPagination() {
		let totalPages = Math.ceil(totalRealStockCount / realStockItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentRealStockPage > 1) {
			paginationHtml += `<button class="realStock-page-btn" data-page="${currentRealStockPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="realStock-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentRealStockPage - 5);
		let endPage = Math.min(totalPages, currentRealStockPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="realStock-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentRealStockPage) {
				paginationHtml += `<button class="realStock-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="realStock-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="realStock-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentRealStockPage < totalPages) {
			paginationHtml += `<button class="realStock-page-btn" data-page="${currentRealStockPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="realStock-page-btn disabled">&gt;</button>`;
		}

		$("#realStockCurrentPageInfo").html(currentRealStockPage);
		$("#realStockPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindRealStockEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnRealStockSearch").off('click').on('click', function() {
			performRealStockSearch();
		});

		// 초기화 버튼 클릭
		$(".btnRealStockSearchInit").off('click').on('click', function() {
			resetRealStockSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.realStock-page-btn').on('click', '.realStock-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentRealStockPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performRealStockDBSearch(searchCriteria);
				}
			}
		});

		// storage 변경 시 달력 날짜 하이라이트 갱신 (현재 표시 중인 달 기준)
		$("#stockCountDetail_searchVal_storage").off('change.datepicker').on('change.datepicker', function() {
			const storage = $(this).val() || '';
			loadRealStockDates(storage, toYearMonth(realStockCalYear, realStockCalMonth), function() {
				$("#stockCountDetail_searchVal_sdate").datepicker("refresh");
			});
		});

		// 엔터키 검색
		$('#view_m2_7_1 input[type="text"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performRealStockSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			counttype: $("#stockCountDetail_searchVal_counttype").val(),
			storage: $("#stockCountDetail_searchVal_storage").val(),
			sdate: $("#stockCountDetail_searchVal_sdate").val(),
			//car: $("#stockCountDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#stockCountDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#stockCountDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#stockCountDetail_searchVal_itemname").val().trim().toUpperCase(),
			//location: $("#stockCountDetail_searchVal_location").val().trim().toUpperCase(),
			loginid: $("#stockCountDetail_searchVal_loginid").val().trim().toUpperCase()
		};
	}

	// 검색 수행 함수 - DB 조회
	function performRealStockSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentRealStockPage = 1;
		performRealStockDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetRealStockSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const sdate = fromDate;

		$("#stockCountDetail_searchVal_sdate").datepicker("setDate", toDate);
		$("#stockCountDetail_searchVal_itemcode").val('');
		$("#stockCountDetail_searchVal_oitemcode").val('');
		$("#stockCountDetail_searchVal_itemname").val('');
		$("#stockCountDetail_searchVal_loginid").val('');

		renderFactoryStorage();
		let storage = getCookie('selectedStorage') === 'ILLINOIS' ? 'OUTSIDE' : 'INBOUND'; // 기본값

		// 초기화 후 전체 데이터 다시 조회
		currentRealStockPage = 1;
		performRealStockDBSearch({  storage, sdate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	// 유틸리티 함수들
	window.changeRealStockItemsPerPage = function(newItemsPerPage) {
		realStockItemsPerPage = newItemsPerPage;
		currentRealStockPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performRealStockDBSearch(searchCriteria);
	}

	window.exportRealStockData = function() {
		return {
			total: globalRealStockData.length,
			currentPage: currentRealStockPage,
			itemsPerPage: realStockItemsPerPage,
			data: globalRealStockData
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
				$(".stockCountDetailTotalQty").text(Number(data).toLocaleString());
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
});


window.downloadAllRealStockData = function() {
	let searchCriteria = {
		counttype: $("#stockCountDetail_searchVal_counttype").val(),
		storage: $("#stockCountDetail_searchVal_storage").val(),
		sdate: $("#stockCountDetail_searchVal_sdate").val(),
		itemcode: $("#stockCountDetail_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#stockCountDetail_searchVal_oitemcode").val().trim().toUpperCase(),
		itemname: $("#stockCountDetail_searchVal_itemname").val().trim().toUpperCase(),
		loginid: $("#stockCountDetail_searchVal_loginid").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_realStock_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.realStockColumns, {
				fileName: 'RealStock_All',
				sheetName: 'RealStock'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

