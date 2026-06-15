/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 미수령 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];

	let filteredData_purchaseStockStation = [];
	let globalstockStationData = [];
	let currentstockStationPage = 1;
	let stockStationItemsPerPage = 100;
	let totalstockStationCount = 0;
	let totalstockStationPages = 0;

	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;

	// ✅ 전역 데이터
	let filteredstockStationData = [];
	let stockStationColumns = [
		{ key: 'FACTORY', header: 'Sent Factory' },
		{ key: 'STORAGE', header: 'Sent Storage' },
		{ key: 'INDATE', header: 'Sent Date' },
		{ key: 'WCCODE', header: 'Receive Work Shop', formatter: (val) => val?.split('-')[1] || '' },
		{ key: 'LOCATION', header: 'Location'},
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Sent Qty', type: 'number' },
		{ key: 'BARCODE', header: 'LOT' },
	];

	// ============================================================
	// ✅ 유틸리티 함수 - IIFE 내부
	// ============================================================
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		const cookieString = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";

		console.log("🍪 setCookie 호출:", cookieName, "=", value);
		console.log("🍪 쿠키 문자열:", cookieString);

		document.cookie = cookieString;

		// 저장 확인
		const savedValue = getCookie(cookieName);
		console.log("🍪 저장 확인:", cookieName, "=", savedValue);
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

	// ============================================================
	// ✅ 검색/필터링 함수 - IIFE 내부
	// ============================================================
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#stockStation_searchVal_fromDate").val(),
			toDate: $("#stockStation_searchVal_toDate").val(),
			factory: $("#stockStation_searchVal_factory").val(),
			storage: $("#stockStation_searchVal_storage").val(),
			scan: $("#stockStation_searchVal_scan").val(),
			workCenter: $("#stockStation_searchVal_receiveWorkCenter").val(),
			workCenter: $("#stockStation_searchVal_location").val(),
			itemcode: ($("#stockStation_searchVal_itemcode").val() || '').trim().toUpperCase(),
			itemname: ($("#stockStation_searchVal_itemname").val() || '').trim().toUpperCase()
		};
	}

	function performstockStationDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_stockStation",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				allServerData = response.records || [];
				filteredData_purchaseStockStation = [...allServerData];
				totalQty = response.totalQty || 0;

				currentstockStationPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mPurchase_stock_station').length) {
					// 🔹 화면 처음 생성할 때
					renderstockStationView();
				} else {
					// 🔹 이미 화면이 있는 상태에서 다시 조회할 때 → 테이블/페이지네이션/카운트 다시 그림
					renderstockStationTableData();
					renderstockStationPagination();
					updatestockStationTotalCount();
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

	// ============================================================
	// ✅ 페이징/정렬 함수 - IIFE 내부
	// ============================================================
	function applyClientPagination() {
		stockStationItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalstockStationCount = filteredData_purchaseStockStation.length;
		totalstockStationPages = Math.ceil(totalstockStationCount / stockStationItemsPerPage);

		const startIndex = (currentstockStationPage - 1) * stockStationItemsPerPage;
		const endIndex = startIndex + stockStationItemsPerPage;

		globalstockStationData = filteredData_purchaseStockStation.slice(startIndex, endIndex);
		filteredstockStationData = globalstockStationData;
	}

	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_purchaseStockStation.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

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

		currentstockStationPage = 1;
		applyClientPagination();

		renderstockStationTableData();
		renderstockStationPagination();
		updatestockStationTotalCount();

		updateSortIndicators(column);
	}

	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatestockStationTotalCount() {
		$('#stockStationTotalCount').text(Number(totalstockStationCount).toLocaleString());
		$('#stockStationCurrentPageInfo').text(currentstockStationPage);
		$('#stockStationTotalPageInfo').text(totalstockStationPages);
		// 🔽 총수량 표시 갱신
		updateTotalQty();
	}

	function renderstockStationTableData() {
		let tableBody = "";

		for (let i = 0; i < globalstockStationData.length; i++) {
			let rowNumber = (currentstockStationPage - 1) * stockStationItemsPerPage + i + 1;
			const data = globalstockStationData[i];

			let wccode = data.WCCODE || data.wccode || '';
			let receiveWorkCenter = wccode ? wccode.split('-')[1] : '';

			// 받은 수량이 없다 = 샌딩 정보가 없다
			if (!data.FROMQTY) {
				data.SENTFACTORY = '';
				data.SENTSTORAGE = '';
				data.SENTDATE = '';
				data.FROMQTY = '';
			}


			tableBody += `
            <tr>
                <td class="noVal">${rowNumber}</td>
                <td class="itemcodeVal">${globalstockStationData[i].FACTORY || globalstockStationData[i].factory || ''}</td>
                <td class="itemcodeVal">${globalstockStationData[i].STORAGE || globalstockStationData[i].storage || ''}</td>
                <td class="locationVal_short">${globalstockStationData[i].INDATE || globalstockStationData[i].indate || ''}</td>
                <td class="itemcodeVal">${receiveWorkCenter}</td>
                <td class="itemcodeVal">${globalstockStationData[i].LOCATION || globalstockStationData[i].location}</td>
                <td class="carVal">${globalstockStationData[i].CAR || globalstockStationData[i].car || ''}</td>
                <td class="itemcodeVal">${globalstockStationData[i].ITEMCODE || globalstockStationData[i].itemcode || ''}</td>
                <td class="itemnameVal">${globalstockStationData[i].ITEMNAME || globalstockStationData[i].itemname || ''}</td>
                <td class="scanqtyVal">${Number(globalstockStationData[i].QTY || globalstockStationData[i].qty || 0).toLocaleString()}</td>
                <td class="barcodeVal">${globalstockStationData[i].BARCODE || globalstockStationData[i].barcode || ''}</td>
            </tr>
        `;
		}

		$("#stockStationTableBody").html(tableBody);
	}

	function renderstockStationPagination() {
		let paginationHtml = "";

		if (currentstockStationPage > 1) {
			paginationHtml += `<button class="stockStation-page-btn" data-page="${currentstockStationPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="stockStation-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentstockStationPage - 5);
		let endPage = Math.min(totalstockStationPages, currentstockStationPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="stockStation-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentstockStationPage) {
				paginationHtml += `<button class="stockStation-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="stockStation-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalstockStationPages) {
			if (endPage < totalstockStationPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="stockStation-page-btn" data-page="${totalstockStationPages}">${totalstockStationPages}</button>`;
		}

		if (currentstockStationPage < totalstockStationPages) {
			paginationHtml += `<button class="stockStation-page-btn" data-page="${currentstockStationPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="stockStation-page-btn disabled">&gt;</button>`;
		}

		$("#stockStationPaginationContainer").html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		const savedFactory = getCookie('selectedFactory');
		const factory = $('#stockStation_searchVal_factory');
		const storage = $('#stockStation_searchVal_storage');

		function updateFactoryOptions() {
			factory.empty();

			if (savedFactory === 'SALTILLO') {
				factory.append(`<option value="SALTILLO">Saltillo</option>`);
			} else if (savedFactory === 'PUEBLA') {
				factory.append(`<option value="PUEBLA">Puebla</option>`);
			} else {
				factory.append(`<option value="SALTILLO">Saltillo</option>`);
				factory.append(`<option value="PUEBLA">Puebla</option>`);
				factory.append(`<option value="all">${i18n.t('search.all')}</option>`);
			}

			factory.val(factory.find('option:first').val());
		}

		function updateStorageOptions() {
			storage.empty();

			const storageList = ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT',  'all'];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			storage.val('Material');
		}

		updateFactoryOptions();
		updateStorageOptions();

		factory.on('change', function() {
			updateStorageOptions();
		});
	}

	// ============================================================
	// ✅ 뷰 렌더링 함수 - IIFE 내부
	// ============================================================
	function renderstockStationView() {
		const savedFactory = getCookie('selectedFactory');

		let content_output = `
		<div class="divBlockControl" id="view_mPurchase_stock_station">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
							<input type="date" id="stockStation_searchVal_fromDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_toDate">　</div>
							<input type="date" id="stockStation_searchVal_toDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.sentfactory')}</div>
							<select id="stockStation_searchVal_factory" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_storage">${i18n.t('search.sentstorage')}</div>
							<select id="stockStation_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>						
						<div class="search-label">
							<div class="searchVal_receiveWorkCenter">${i18n.t('search.receiveworkcenter')}</div>
							<select id="stockStation_searchVal_receiveWorkCenter" >
								<option value="H/REST">H/REST</option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_scan">${i18n.t('search.scanType.load')}</div>
							<select id="stockStation_searchVal_scan" >
								<option value="Y">Y</option>
								<option value="N">N</option>
							</select>
						</div>						
						<div class="search-label">
							<div class="searchVal_location">${i18n.t('search.location')}</div>
							<input type="text" id="stockStation_searchVal_location" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
							<input type="text" id="stockStation_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
							<input type="text" id="stockStation_searchVal_itemname" />
						</div>
					</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnStockStationSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnStockStationSearchInit">${i18n.t('btn.clear')}</button>
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
						<span>
					        ${i18n.t('table.info.total')}
					        <strong id="stockStationTotalCount">${totalstockStationCount}</strong>
					        ${i18n.t('table.info.records')}
					        | ${i18n.t('table.page')}
					        <strong id="stockStationCurrentPageInfo">${currentstockStationPage}</strong> /
					        <strong id="stockStationTotalPageInfo">${totalstockStationPages}</strong>
					        | ${i18n.t('table.info.qty')}
					        <strong class="stockStationTotalQty">
					            ${Number(totalQty).toLocaleString()}
					        </strong>
					    </span>
						<div class="action-buttons-right mPurchase_stock_station">
							<div id="defaultActions" class="action-group">
								<button class="btn btn-success" id="stockStationExcelBtn" onclick="window.downloadAllstockStationData_internal()">Excel</button>
							</div>
						</div>
					</div>
					<table class="data-table mPurchase_stock_station" id="stockStationTable">
						<thead>
							<tr>
								<th class="noVal">${i18n.t('table.no')}</th>
								<th class="itemcodeVal" data-sort="FACTORY">${i18n.t('search.sentfactory')}</th>
								<th class="itemcodeVal" data-sort="STORAGE">${i18n.t('search.sentstorage')}</th>
								<th class="locationVal_short" data-sort="INDATE" data-type="date">${i18n.t('search.sentdate')}</th>
								<th class="itemcodeVal" data-sort="WCCODE">${i18n.t('search.receiveworkcenter')}</th>
								<th class="itemcodeVal" data-sort="LOCATION">${i18n.t('search.location')}</th>
								<th class="carVal" data-sort="CAR">${i18n.t('search.car')}</th>
								<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
								<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
								<th class="scanqtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty.out')}</th>
							</tr>
						</thead>
						<tbody id="stockStationTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="stockStationPaginationContainer">
					</div>
					<div class="items-per-page-selector">
				        <label for="stockStation_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
				        <select id="stockStation_itemsPerPage" class="items-per-page-select">
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
			$("#stockStation_searchVal_toDate").val(toDate);
			$("#stockStation_searchVal_fromDate").val(fromDate);
			$("#stockStation_searchVal_factory").val(savedFactory || 'all');
			$("#stockStation_itemsPerPage").val(stockStationItemsPerPage);
			console.log("🎯 Select 초기값 설정됨:", stockStationItemsPerPage);
		})();

		renderFactoryStorage();
		renderstockStationTableData();
		renderstockStationPagination();
		bindstockStationEvents();
		updatestockStationTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindstockStationEvents() {
		// 검색 버튼
		$(".btnStockStationSearch").off('click').on('click', function() {
			handleStockStationSearch();
		});

		// 초기화 버튼
		$(".btnStockStationSearchInit").off('click').on('click', function() {
			handleStockStationSearchInit();
		});

		// 페이지당 항목 수 변경
		$('#stockStation_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			handleChangeStockStationItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼
		$(document).off('click', '.stockStation-page-btn').on('click', '.stockStation-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					handlePageChange(page);
				}
			}
		});

		// 헤더 정렬
		$('#stockStationTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			handleSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mPurchase_stock_station input[type="text"], #view_mPurchase_stock_station input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				handleStockStationSearch();
			}
		});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleStockStationSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentstockStationPage = 1;
		performstockStationDBSearch(searchCriteria);
	}

	function handleStockStationSearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = 'SALTILLO';  // ✅ 고정
		const storage = 'Material';

		$("#stockStation_searchVal_fromDate").val(fromDate);
		$("#stockStation_searchVal_toDate").val(toDate);
		$("#stockStation_searchVal_factory").val(factory);  // ✅ 추가
		$("#stockStation_searchVal_storage").val(storage);  // ✅ 추가
		$("#stockStation_searchVal_location").val('');  // ✅ 추가
		$("#stockStation_searchVal_itemcode").val('');
		$("#stockStation_searchVal_itemname").val('');

		renderFactoryStorage();

		currentstockStationPage = 1;
		performstockStationDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function handlePageChange(page) {
		currentstockStationPage = page;
		applyClientPagination();
		renderstockStationTableData();
		renderstockStationPagination();
		updatestockStationTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeStockStationItemsPerPage(newItemsPerPage) {
		stockStationItemsPerPage = newItemsPerPage;
		currentstockStationPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderstockStationTableData();
		renderstockStationPagination();
		updatestockStationTotalCount();
	}

	function updateTotalQty() {
		$(".stockStationTotalQty").text(Number(totalQty).toLocaleString());
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// ✅ 수정 (Saltillo 고정)
	window.call_mPurchase_stock_station = function(menuId) {
		function internalInit() {
			showLoading("data");
			const { fromDate, toDate } = getDefaultDateRange();
			const factory = 'SALTILLO';  // ✅ 고정
			const storage = 'Material';
			console.log("FACTORY - " + factory);
			performstockStationDBSearch({ fromDate, toDate, factory, storage });
		}
		internalInit();
	};

	// 엑셀 다운로드
	window.downloadAllstockStationData_internal = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalDownload() {
			let searchCriteria = {
				fromDate: $("#stockStation_searchVal_fromDate").val(),
				toDate: $("#stockStation_searchVal_toDate").val(),
				factory: $("#stockStation_searchVal_factory").val(),
				storage: $("#stockStation_searchVal_storage").val(),
				scan: $("#stockStation_searchVal_scan").val(),
				workCenter: $("#stockStation_searchVal_receiveWorkCenter").val(),  // ✅ 변경
				itemcode: $("#stockStation_searchVal_itemcode").val(),
				itemname: $("#stockStation_searchVal_itemname").val()
			};

			showLoading("export");

			$.ajax({
				url: "/read_stockStation",
				type: "POST",
				data: JSON.stringify({
					searchParams: searchCriteria
				}),
				contentType: "application/json",
				success: function(response) {
					console.log(response);

					ExcelExporter.downloadExcel(filteredData_purchaseStockStation, stockStationColumns, {
						fileName: 'stockStation_All',
						sheetName: 'stockStation'
					});
					hideLoading();
				},
				error: function() {
					alert("전체 데이터 조회에 실패했습니다.");
					hideLoading();
				}
			});
		}

		internalDownload();
	};

	// 데이터 내보내기
	window.exportstockStationData = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalExport() {
			return {
				total: filteredData_purchaseStockStation.length,
				currentPage: currentstockStationPage,
				itemsPerPage: stockStationItemsPerPage,
				data: filteredData_purchaseStockStation
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeStockStationItemsPerPage = function(newItemsPerPage) {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalChange() {
			handleChangeStockStationItemsPerPage(newItemsPerPage);
		}

		internalChange();
	};

	// ============================================================
	// ✅ 초기화 - $(document).ready
	// ============================================================
	$(document).ready(function() {
		// 초기화 코드 필요시 여기 추가
	});

})(); // ← IIFE 종료 - 모든 변수/함수 격리됨