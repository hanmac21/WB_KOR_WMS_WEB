/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_unpackSummary = [];
let globalUnpackSummaryData = [];
let currentUnpackSummaryPage = 1;
let unpackSummaryItemsPerPage = 100;
let totalUnpackSummaryCount = 0;
let totalUnpackSummaryPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';
$(document).ready(function() {

	window.filteredUnpackSummaryData = [];
	window.unpackSummaryColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'barcode' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_m2_unpack_summary = function(menuId) {
		showLoading("data");

		const factory = getCookie('selectedFactory');
		const { fromDate, toDate } = getDefaultDateRange();
		let storage = 'Material';

		performUnpackSummaryDBSearch({ factory, storage, toDate, fromDate });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performUnpackSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_unpackSummary",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
				// page, itemsPerPage 없음 = 전체 조회
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				// 서버에서 받은 전체 데이터 저장
				allServerData = response.records || [];
				filteredData_unpackSummary = [...allServerData]; // 초기에는 필터링 없음
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentUnpackSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_unpack_summary').length) {
					renderUnpackSummaryView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderUnpackSummaryTableData();
					renderUnpackSummaryPagination();
					updateUnpackSummaryTotalCount();
				}

				// 총 수량 업데이트
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

	// 클라이언트에서 페이징 처리
	function applyClientPagination() {
		// ✅ 렌더링할 때마다 쿠키에서 읽기
		unpackSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalUnpackSummaryCount = filteredData_unpackSummary.length;
		totalUnpackSummaryPages = Math.ceil(totalUnpackSummaryCount / unpackSummaryItemsPerPage);

		// 현재 페이지 범위 계산
		const startIndex = (currentUnpackSummaryPage - 1) * unpackSummaryItemsPerPage;
		const endIndex = startIndex + unpackSummaryItemsPerPage;

		// 현재 페이지 데이터 추출
		globalUnpackSummaryData = filteredData_unpackSummary.slice(startIndex, endIndex);
		window.filteredUnpackSummaryData = globalUnpackSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		// 같은 컬럼 클릭 시 정렬 방향 토글
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		// 데이터 정렬
		filteredData_unpackSummary.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

			// 데이터 타입별 처리
			if (dataType === 'number') {
				valA = parseFloat(valA) || 0;
				valB = parseFloat(valB) || 0;
			} else if (dataType === 'date') {
				valA = new Date(valA).getTime() || 0;
				valB = new Date(valB).getTime() || 0;
			} else {
				valA = String(valA).toUpperCase();
				valB = String(valB).toUpperCase();
			}

			if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
			if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		// 페이지 1로 초기화 후 다시 페이징
		currentUnpackSummaryPage = 1;
		applyClientPagination();

		// 테이블 업데이트
		renderUnpackSummaryTableData();
		renderUnpackSummaryPagination();
		updateUnpackSummaryTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderUnpackSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_unpack_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="unpackSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="unpackSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}</div>
								<select id="unpackSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')} </option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="unpackSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="unpackSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="unpackSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="unpackSummary_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnUnpackSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnUnpackSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="unpackSummaryTotalCount">${totalUnpackSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="unpackSummaryCurrentPageInfo">${currentUnpackSummaryPage}</strong>/<strong id="unpackSummaryTotalPageInfo">${totalUnpackSummaryPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="unpackSummaryTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right m2_unpack_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="unpackSummaryExcelBtn" onclick="downloadAllUnpackSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_unpack_summary" id="unpackSummaryTable">
							<thead>
								<tr>
									<th class="noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class="dateVal" data-sort="SDATE">${i18n.t('table.date')}<!-- SDATE --></th>
									<th class="factoryVal" data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class="storageVal" data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class="carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class="qtyVal" data-sort="QTY">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class="scanqtyVal" data-sort="PRINT_QTY">${i18n.t('search.qty.print')}<!-- PRINT_QTY --></th>
									<th class="scanqtyVal" data-sort="SCANQTY">${i18n.t('search.qty.scan')}<!-- SCANQTY --></th>
									<th class="scanqtyVal" data-sort="REMAINING_QTY">${i18n.t('search.qty.remain')}<!-- REMAINING_QTY --></th>
								</tr>
							</thead>
							<tbody id="unpackSummaryDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="unpackSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="unpackSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="unpackSummary_itemsPerPage" class="items-per-page-select">
					            <option value="100" selected>100</option>
					            <option value="300">300</option>
					            <option value="1000">1000</option>
					        </select>
					    </div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		// 화면에 기본 날짜 세팅
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#unpackSummary_searchVal_toDate").val(toDate);
			$("#unpackSummary_searchVal_fromDate").val(fromDate);

			// ✅ Select 초기값 설정 추가!
			$("#unpackSummary_itemsPerPage").val(unpackSummaryItemsPerPage);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderUnpackSummaryTableData();
		// 페이지네이션 렌더링
		renderUnpackSummaryPagination();
		// 이벤트 바인딩
		bindUnpackSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateUnpackSummaryTotalCount();
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
	    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const fromDate = fmtLocalDate(firstDayOfMonth);
		return { fromDate, toDate };
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const factory = $('#unpackSummary_searchVal_factory');
		const storage = $('#unpackSummary_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'all'],
				'PUEBLA': ['Material', 'PRODUCT', 'all'],
				'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'all']
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			storage.val(storageList[0]);
		}

		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}

		updateStorageOptions(savedFactory || '');

		factory.on('change', function() {
			updateStorageOptions($(this).val());
		});
	}

	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// ✅ 추가!
	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function updateUnpackSummaryTotalCount() {
		$('#unpackSummaryTotalCount').text(Number(totalUnpackSummaryCount).toLocaleString());
		$('#unpackSummaryCurrentPageInfo').text(currentUnpackSummaryPage);
		$('#unpackSummaryTotalPageInfo').text(totalUnpackSummaryPages);
	}

	function renderUnpackSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalUnpackSummaryData.length; i++) {
			let rowNumber = (currentUnpackSummaryPage - 1) * unpackSummaryItemsPerPage + i + 1;

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "dateVal">${globalUnpackSummaryData[i].SDATE || globalUnpackSummaryData[i].sdate || ''}</td>
				<td class = "factoryVal">${globalUnpackSummaryData[i].FACTORY || globalUnpackSummaryData[i].factory || ''}</td>
				<td class = "storageVal">${globalUnpackSummaryData[i].STORAGE || globalUnpackSummaryData[i].storage || ''}</td>
				<td class = "carVal">${globalUnpackSummaryData[i].CAR || globalUnpackSummaryData[i].car || ''}</td>
				<td class = "itemcodeVal">${globalUnpackSummaryData[i].ITEMCODE || globalUnpackSummaryData[i].itemcode || ''}</td>
				<td class = "itemnameVal">${globalUnpackSummaryData[i].ITEMNAME || globalUnpackSummaryData[i].itemname || ''}</td>
				<td class = "qtyVal">${Number(globalUnpackSummaryData[i].QTY || globalUnpackSummaryData[i].qty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackSummaryData[i].PRINT_QTY || globalUnpackSummaryData[i].print_qty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackSummaryData[i].SCANQTY || globalUnpackSummaryData[i].scanqty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackSummaryData[i].REMAINING_QTY || globalUnpackSummaryData[i].remaining_qty || 0).toLocaleString()}</td>
            </tr>
        `;
		}

		$("#unpackSummaryDetailTableBody").html(tableBody);
	}

	function renderUnpackSummaryPagination() {
		let paginationHtml = "";

		if (currentUnpackSummaryPage > 1) {
			paginationHtml += `<button class="unpackSummary-page-btn" data-page="${currentUnpackSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="unpackSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentUnpackSummaryPage - 5);
		let endPage = Math.min(totalUnpackSummaryPages, currentUnpackSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="unpackSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentUnpackSummaryPage) {
				paginationHtml += `<button class="unpackSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="unpackSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalUnpackSummaryPages) {
			if (endPage < totalUnpackSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="unpackSummary-page-btn" data-page="${totalUnpackSummaryPages}">${totalUnpackSummaryPages}</button>`;
		}

		if (currentUnpackSummaryPage < totalUnpackSummaryPages) {
			paginationHtml += `<button class="unpackSummary-page-btn" data-page="${currentUnpackSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="unpackSummary-page-btn disabled">&gt;</button>`;
		}

		$("#unpackSummaryPaginationContainer").html(paginationHtml);
	}

	function bindUnpackSummaryEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnUnpackSummarySearch").off('click').on('click', function() {
			performUnpackSummarySearch();
		});

		// 초기화 버튼 클릭
		$(".btnUnpackSummarySearchInit").off('click').on('click', function() {
			resetUnpackSummarySearch();
		});

		// ✅ 페이지당 항목 수 변경 이벤트 추가
		$('#unpackSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeUnpackSummaryItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
		$(document).off('click', '.unpackSummary-page-btn').on('click', '.unpackSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentUnpackSummaryPage = page;
					applyClientPagination();
					renderUnpackSummaryTableData();
					renderUnpackSummaryPagination();
					updateUnpackSummaryTotalCount();
				}
			}
		});

		// 헤더 클릭 시 정렬
		$('#unpackSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_m2_unpack_summary input[type="text"], #view_m2_unpack_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performUnpackSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#unpackSummary_searchVal_fromDate").val(),
			toDate: $("#unpackSummary_searchVal_toDate").val(),
			factory: $("#unpackSummary_searchVal_factory").val(),
			storage: $("#unpackSummary_searchVal_storage").val(),
			car: $("#unpackSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#unpackSummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#unpackSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performUnpackSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentUnpackSummaryPage = 1;
		performUnpackSummaryDBSearch(searchCriteria);
	}

	function resetUnpackSummarySearch() {
		const factory = getCookie('selectedFactory');
		const storage = 'Material';
		const { fromDate, toDate } = getDefaultDateRange();

		$("#unpackSummary_searchVal_fromDate").val(fromDate);
		$("#unpackSummary_searchVal_toDate").val(toDate);
		$("#unpackSummary_searchVal_factory").val(factory);
		$("#unpackSummary_searchVal_storage").val('Material');
		$("#unpackSummary_searchVal_car").val('');
		$("#unpackSummary_searchVal_itemcode").val('');
		$("#unpackSummary_searchVal_itemname").val('');

		currentUnpackSummaryPage = 1;
		performUnpackSummaryDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".unpackSummaryTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeUnpackSummaryItemsPerPage = function(newItemsPerPage) {
		unpackSummaryItemsPerPage = newItemsPerPage;
		currentUnpackSummaryPage = 1; // 페이지를 1로 초기화

		// ✅ 쿠키에 저장 추가!
		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderUnpackSummaryTableData();
		renderUnpackSummaryPagination();
		updateUnpackSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportUnpackSummaryData = function() {
		return {
			total: filteredData_unpackSummary.length,
			currentPage: currentUnpackSummaryPage,
			itemsPerPage: unpackSummaryItemsPerPage,
			data: filteredData_unpackSummary
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllUnpackSummaryData = function() {
	let searchCriteria = {
		fromDate: $("#unpackSummary_searchVal_fromDate").val(),
		toDate: $("#unpackSummary_searchVal_toDate").val(),
		factory: $("#unpackSummary_searchVal_factory").val(),
		storage: $("#unpackSummary_searchVal_storage").val(),
		car: $("#unpackSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#unpackSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#unpackSummary_searchVal_itemname").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_unpackSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log(response);

			ExcelExporter.downloadExcel(filteredData_unpackSummary, window.unpackSummaryColumns, {
				fileName: 'unpackSummary_All',
				sheetName: 'unpackSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};