1/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalRealStockOutData = []; // 현재 조회된 데이터 저장
	let currentRealStockOutPage = 1; // 현재 페이지
	let realStockOutItemsPerPage = 1000; // 페이지당 항목 수
	let totalRealStockOutCount = 0; // 서버에서 받은 총 개수 저장
	let totalRealStockOutPages = 0; // 서버에서 받은 총 페이지
	let realStockOutAvailableDates = []; // t_wms_realstock에 데이터 있는 날짜 목록 (현재 달)
	let realStockOutCalYear = new Date().getFullYear();   // 달력에 표시 중인 연도
	let realStockOutCalMonth = new Date().getMonth() + 1; // 달력에 표시 중인 월 (1-12)

	window.filteredRealStockOutData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.realStockOutColumns = [
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
	window.call_mPurchase_stockcount_out_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		let sdate = fromDate;

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage = '사외'; // 기본값

		performRealStockOutDBSearch({ sdate, storage });
	};

	// DB에서 데이터 조회하는 함수
	function performRealStockOutDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_realStock",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentRealStockOutPage,
				itemsPerPage: realStockOutItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalRealStockOutData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalRealStockOutCount = data.totalCount || 0;
				totalRealStockOutPages = data.totalPages || 0;
				window.filteredRealStockOutData = globalRealStockOutData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_stockcount_out_detail').length) {
					renderRealStockOutView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderRealStockOutTableData();
					renderRealStockOutPagination();
					updateRealStockOutTotalCount();
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
	function renderRealStockOutView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_stockcount_out_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="stockCountOutDetail_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="text" id="stockCountOutDetail_searchVal_sdate" readonly="readonly" class="realstock-datepicker" placeholder="YYYY-MM-DD" />
							</div>
							<div class="search-label">
								<div class="stockCountOutDetail_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="stockCountOutDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="stockCountOutDetail_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountOutDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="stockCountOutDetail_searchVal_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountOutDetail_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="stockCountOutDetail_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="stockCountOutDetail_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="stockCountOutDetail_searchVal_loginid">${i18n.t('search.user')}<!-- USER --></div>
								<input type="text" id="stockCountOutDetail_searchVal_loginid" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnRealStockOutSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnRealStockOutSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="realStockOutTotalCount">${totalRealStockOutCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="realStockOutCurrentPageInfo">${currentRealStockOutPage}</strong>/<strong id="realStockOutTotalPageInfo">${totalRealStockOutPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="stockCountOutDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_stockcount_out_detail">
								<div id="defaultActions" class="action-group">
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnRealStockOutDelete"/>
									<button class="btn btn-success" id="realStockOutExcelBtn" onclick="downloadAllRealStockOutData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_stockcount_out_detail">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="realStockOut_chkAll"/>
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
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
									<th class = "barcodeVal transysBarcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
								</tr>
							</thead>
							<tbody id="realStockOutDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="realStockOutPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		/*<button class="btn btn-success" id="realStockOutExcelBtn" onclick="ExcelExporter.downloadExcel(filteredRealStockOutData, realStockOutColumns, {fileName:'RealStockOut', sheetName:'RealStockOut'})">Excel</button>*/
		$(".w_contentArea").append(content_output);
		
		// ⬇️ 추가: 화면에 기본 날짜 세팅 (datepicker 초기화 전 raw val 세팅)
		(function() {
			const { fromDate } = getDefaultDateRange();
			$("#stockCountOutDetail_searchVal_sdate").val(fromDate);
		})();
		// 공장 및 창고 선택
		renderFactoryStorage();
		// 달력 초기화 (날짜 하이라이트 포함)
		initRealStockOutDatepicker();
		// 테이블 데이터 렌더링
		renderRealStockOutTableData();
		// 페이지네이션 렌더링
		renderRealStockOutPagination();
		// 이벤트 바인딩
		bindRealStockOutEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateRealStockOutTotalCount();
		
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
	    const storage = $('#stockCountOutDetail_searchVal_storage');

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
	function initRealStockOutDatepicker() {
		const storage = $("#stockCountOutDetail_searchVal_storage").val() || '';
		const yearMonth = toYearMonth(realStockOutCalYear, realStockOutCalMonth);
		loadRealStockOutDates(storage, yearMonth, function() {
			$("#stockCountOutDetail_searchVal_sdate").datepicker({
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
					if (realStockOutAvailableDates.indexOf(dateStr) !== -1) {
						return [true, "realstock-has-data", "데이터 있음"];
					}
					return [true, "", ""];
				},
				onChangeMonthYear: function(year, month) {
					realStockOutCalYear = year;
					realStockOutCalMonth = month;
					const storage = $("#stockCountOutDetail_searchVal_storage").val() || '';
					loadRealStockOutDates(storage, toYearMonth(year, month), function() {
						$("#stockCountOutDetail_searchVal_sdate").datepicker("refresh");
					});
				}
			});
		});
	}

	function toYearMonth(year, month) {
		return `${year}-${String(month).padStart(2, '0')}`;
	}

	// DB에서 해당 월에 데이터 있는 날짜 목록 로드
	function loadRealStockOutDates(storage, yearMonth, callback) {
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
				realStockOutAvailableDates = dates || [];
				if (typeof callback === 'function') callback();
			},
			error: function() {
				realStockOutAvailableDates = [];
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
	function updateRealStockOutTotalCount() {
		$('#realStockOutTotalCount').text(Number(totalRealStockOutCount).toLocaleString());
	}

	function renderRealStockOutTableData() {
		let tableBody = "";

		//console.log("globalRealStockOutData:", globalRealStockOutData);
		//console.log("데이터 개수:", globalRealStockOutData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalRealStockOutData.length; i++) {
			let rowNumber = (currentRealStockOutPage - 1) * realStockOutItemsPerPage + i + 1;

			let data = globalRealStockOutData[i];
			//console.log(`행 ${i}:`, globalRealStockOutData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
				<td class='checkboxVal'><input type="checkbox" class="realStockOut_chk"
					data-delete="${data.iid}|${data.sdate}|${data.factory}|${data.storage}|${data.barcode}">
				</td>
                <td class = "noVal">${rowNumber}</td>
                <td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
                <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
                <td class = "carVal">${data.CAR || data.car || ''}</td>
                <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                <td class = "cnameVal">${data.SPEC || data.spec || ''}</td>
                <td class = "itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
                <td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
                <td class = "locationVal">${data.LOCATION || data.location || ''}</td>
                <td class = "userVal">${data.LOGINID || data.loginid || ''}</td>
                <td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
				<td class = "barcodeVal transysBarcodeVal">${data.BARCODE || data.barcode || ''}</td>
            </tr>
        `;
		}

		//console.log("생성된 tableBody:", tableBody);
		$("#realStockOutDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderRealStockOutPagination() {
		let totalPages = Math.ceil(totalRealStockOutCount / realStockOutItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentRealStockOutPage > 1) {
			paginationHtml += `<button class="realStockOut-page-btn" data-page="${currentRealStockOutPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="realStockOut-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentRealStockOutPage - 5);
		let endPage = Math.min(totalPages, currentRealStockOutPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="realStockOut-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentRealStockOutPage) {
				paginationHtml += `<button class="realStockOut-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="realStockOut-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="realStockOut-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentRealStockOutPage < totalPages) {
			paginationHtml += `<button class="realStockOut-page-btn" data-page="${currentRealStockOutPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="realStockOut-page-btn disabled">&gt;</button>`;
		}

		$("#realStockOutCurrentPageInfo").html(currentRealStockOutPage);
		$("#realStockOutPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindRealStockOutEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.realStockOut_chkAll').on('change', '.realStockOut_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.realStockOut_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.realStockOut_chk').on('change', '.realStockOut_chk', function() {
			let totalCheckboxes = $('.realStockOut_chk').length;
			let checkedCheckboxes = $('.realStockOut_chk:checked').length;
			$('.realStockOut_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnRealStockOutSearch").off('click').on('click', function() {
			performRealStockOutSearch();
		});

		// 초기화 버튼 클릭
		$(".btnRealStockOutSearchInit").off('click').on('click', function() {
			resetRealStockOutSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.realStockOut-page-btn').on('click', '.realStockOut-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentRealStockOutPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performRealStockOutDBSearch(searchCriteria);
				}
			}
		});

		// storage 변경 시 달력 날짜 하이라이트 갱신 (현재 표시 중인 달 기준)
		$("#stockCountOutDetail_searchVal_storage").off('change.datepicker').on('change.datepicker', function() {
			const storage = $(this).val() || '';
			loadRealStockOutDates(storage, toYearMonth(realStockOutCalYear, realStockOutCalMonth), function() {
				$("#stockCountOutDetail_searchVal_sdate").datepicker("refresh");
			});
		});

		// 엔터키 검색
		$('#view_mPurchase_stockcount_out_detail input[type="text"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performRealStockOutSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			storage: $("#stockCountOutDetail_searchVal_storage").val(),
			sdate: $("#stockCountOutDetail_searchVal_sdate").val(),
			//car: $("#stockCountOutDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#stockCountOutDetail_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#stockCountOutDetail_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#stockCountOutDetail_searchVal_itemname").val().trim().toUpperCase(),
			//location: $("#stockCountOutDetail_searchVal_location").val().trim().toUpperCase(),
			loginid: $("#stockCountOutDetail_searchVal_loginid").val().trim().toUpperCase()
		};
	}

	// 검색 수행 함수 - DB 조회
	function performRealStockOutSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentRealStockOutPage = 1;
		performRealStockOutDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetRealStockOutSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const sdate = fromDate;

		$("#stockCountOutDetail_searchVal_sdate").datepicker("setDate", toDate);
		$("#stockCountOutDetail_searchVal_itemcode").val('');
		$("#stockCountOutDetail_searchVal_oitemcode").val('');
		$("#stockCountOutDetail_searchVal_itemname").val('');
		$("#stockCountOutDetail_searchVal_loginid").val('');

		renderFactoryStorage();
		let storage = '사외'; // 기본값

		// 초기화 후 전체 데이터 다시 조회
		currentRealStockOutPage = 1;
		performRealStockOutDBSearch({  storage, sdate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	// 유틸리티 함수들
	window.changeRealStockOutItemsPerPage = function(newItemsPerPage) {
		realStockOutItemsPerPage = newItemsPerPage;
		currentRealStockOutPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performRealStockOutDBSearch(searchCriteria);
	}

	window.exportRealStockOutData = function() {
		return {
			total: globalRealStockOutData.length,
			currentPage: currentRealStockOutPage,
			itemsPerPage: realStockOutItemsPerPage,
			data: globalRealStockOutData
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
				$(".stockCountOutDetailTotalQty").text(Number(data).toLocaleString());
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


	//삭제
	$(document).on("click", ".btnRealStockOutDelete", function() {
		const iidList = [];
		$(".realStockOut_chk:checked").each(function() {
			let iid = $(this).data('delete');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		if (!confirm(i18n.t('confirmation.items.delete'))) {
			return;
		}

		showLoading("data");

		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");

		console.log(iidList)

		$.ajax({
			url: "/deleteRealStockOut",
			type: "POST",
			data: JSON.stringify({
				iidList: iidList,
				loginid: loginid,
				admin: false
			}),
			contentType: "application/json",
			success: function(data) {
				if (!data.success) {
					hideLoading();

					let message = "";

					// 검증 실패
					if (data.failList && data.failList.length > 0) {
						message = "Some items cannot be deleted\n\n"; // 삭제할 수 없는 항목이 있습니다.

						data.failList.forEach(function(item) {
							if (item.failReason === 'INVALID_KIND') {
								alert(`Code Error!`);
								return;
							} else if (item.failReason === 'POST_PROCESSING') {
								message += `- Post-processing data exists\n${item.barcode}\n`; // 후처리 데이터 존재
							} else if (item.failReason === 'MAGAM') {
								message += `- Monthly closing completed\n${item.barcode}\n`; // 월 마감 완료
							}
						});

					}
					// 삭제 실패
					else if (data.failReason === 'DELETE_FAILED') {
						message = "Failed to delete\n\n";
						message += `Operation: ${data.failedOperation}\n`;
						message += `Barcode: ${data.failedBarcode}\n\n`;
					}


					alert(message);
					return;
				}

				alert("정상적으로 삭제되었습니다");

				let searchVal = getCurrentSearchCriteria();
				performRealStockOutDBSearch(searchVal);

				// 전체 선택 해제
				$('.realStockOut_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}
		});
	});
});


window.downloadAllRealStockOutData = function() {
	let searchCriteria = {
		storage: $("#stockCountOutDetail_searchVal_storage").val(),
		sdate: $("#stockCountOutDetail_searchVal_sdate").val(),
		itemcode: $("#stockCountOutDetail_searchVal_itemcode").val().trim().toUpperCase(),
		oitemcode: $("#stockCountOutDetail_searchVal_oitemcode").val().trim().toUpperCase(),
		itemname: $("#stockCountOutDetail_searchVal_itemname").val().trim().toUpperCase(),
		loginid: $("#stockCountOutDetail_searchVal_loginid").val().trim().toUpperCase()
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
			ExcelExporter.downloadExcel(data, window.realStockOutColumns, {
				fileName: 'RealStockOut_All',
				sheetName: 'RealStockOut'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

