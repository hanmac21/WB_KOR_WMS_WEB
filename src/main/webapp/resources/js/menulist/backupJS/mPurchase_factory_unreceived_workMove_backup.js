/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 미수령 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
/*(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];
	let filteredData_purchaseFactoryUnreceived = [];
	let globalfactoryUnreceivedData = [];
	let currentfactoryUnreceivedPage = 1;
	let factoryUnreceivedItemsPerPage = 100;
	let totalfactoryUnreceivedCount = 0;
	let totalfactoryUnreceivedPages = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;

	// ✅ 전역 데이터
	let filteredfactoryUnreceivedData = [];
	let factoryUnreceivedColumns = [
		{ key: 'FACTORY', header: 'Sent Factory' },
		{ key: 'STORAGE', header: 'Sent Storage' },
		{ key: 'INDATE', header: 'Sent Date' },
		{ key: 'WCCODE', header: 'Receive Work Shop', formatter: (val) => val?.split('-')[1] || '' },
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
		const fromDate = fmtLocalDate(today);
		return { fromDate, toDate };
	}

	// ============================================================
	// ✅ 검색/필터링 함수 - IIFE 내부
	// ============================================================
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#factoryUnreceived_searchVal_fromDate").val(),
			toDate: $("#factoryUnreceived_searchVal_toDate").val(),
			factory: $("#factoryUnreceived_searchVal_factory").val(),
			storage: $("#factoryUnreceived_searchVal_storage").val(),
			workCenter: $("#factoryUnreceived_searchVal_receiveWorkCenter").val(),
			itemcode: ($("#factoryUnreceived_searchVal_itemcode").val() || '').trim().toUpperCase(),
			itemname: ($("#factoryUnreceived_searchVal_itemname").val() || '').trim().toUpperCase()
		};
	}

	function performfactoryUnreceivedDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_workMoveUnreceived",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				allServerData = response.records || [];
				filteredData_purchaseFactoryUnreceived = [...allServerData];
				totalQty = response.totalQty || 0;

				currentfactoryUnreceivedPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mPurchase_factory_unreceived_workMove').length) {
					renderfactoryUnreceivedView();
				} else {
					renderfactoryUnreceivedTableData();
					renderfactoryUnreceivedPagination();
					updatefactoryUnreceivedTotalCount();
				}

				hideLoading();
			},
			error: function(xhr, status, error) {
				console.log("🔥 LOCAL ajax error:", status, error);
				console.log("Response:", xhr.responseText);

				const message = "An error occurred while processing the request.\n\n"
					+ "Details:\n"
					+ (xhr.responseText || error || status || "Unknown error");

				// 🔹 기본 alert 대신 커스텀 모달 사용
				window.showCopyableAlert(message);

				hideLoading();
			}
		});
	}

	// ============================================================
	// ✅ 페이징/정렬 함수 - IIFE 내부
	// ============================================================
	function applyClientPagination() {
		factoryUnreceivedItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalfactoryUnreceivedCount = filteredData_purchaseFactoryUnreceived.length;
		totalfactoryUnreceivedPages = Math.ceil(totalfactoryUnreceivedCount / factoryUnreceivedItemsPerPage);

		const startIndex = (currentfactoryUnreceivedPage - 1) * factoryUnreceivedItemsPerPage;
		const endIndex = startIndex + factoryUnreceivedItemsPerPage;

		globalfactoryUnreceivedData = filteredData_purchaseFactoryUnreceived.slice(startIndex, endIndex);
		filteredfactoryUnreceivedData = globalfactoryUnreceivedData;
	}

	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_purchaseFactoryUnreceived.sort((a, b) => {
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

		currentfactoryUnreceivedPage = 1;
		applyClientPagination();

		renderfactoryUnreceivedTableData();
		renderfactoryUnreceivedPagination();
		updatefactoryUnreceivedTotalCount();

		updateSortIndicators(column);
	}

	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatefactoryUnreceivedTotalCount() {
		$('#factoryUnreceivedTotalCount').text(Number(totalfactoryUnreceivedCount).toLocaleString());
		$('#factoryUnreceivedCurrentPageInfo').text(currentfactoryUnreceivedPage);
		$('#factoryUnreceivedTotalPageInfo').text(totalfactoryUnreceivedPages);
	}

	function renderfactoryUnreceivedTableData() {
		let tableBody = "";

		for (let i = 0; i < globalfactoryUnreceivedData.length; i++) {
			let rowNumber = (currentfactoryUnreceivedPage - 1) * factoryUnreceivedItemsPerPage + i + 1;
			let wccode = globalfactoryUnreceivedData[i].WCCODE || globalfactoryUnreceivedData[i].wccode || '';
			let receiveWorkCenter = wccode ? wccode.split('-')[1] : '';

			tableBody += `
            <tr>
                <td class="noVal">${rowNumber}</td>
                <td class="itemcodeVal">${globalfactoryUnreceivedData[i].FACTORY || globalfactoryUnreceivedData[i].factory || ''}</td>
                <td class="itemcodeVal">${globalfactoryUnreceivedData[i].STORAGE || globalfactoryUnreceivedData[i].storage || ''}</td>
                <td class="locationVal_short">${globalfactoryUnreceivedData[i].INDATE || globalfactoryUnreceivedData[i].indate || ''}</td>
                <td class="itemcodeVal"></td>
                <td class="carVal">${globalfactoryUnreceivedData[i].CAR || globalfactoryUnreceivedData[i].car || ''}</td>
                <td class="itemcodeVal">${globalfactoryUnreceivedData[i].ITEMCODE || globalfactoryUnreceivedData[i].itemcode || ''}</td>
                <td class="itemnameVal">${globalfactoryUnreceivedData[i].ITEMNAME || globalfactoryUnreceivedData[i].itemname || ''}</td>
                <td class="scanqtyVal">${Number(globalfactoryUnreceivedData[i].QTY || globalfactoryUnreceivedData[i].qty || 0).toLocaleString()}</td>
                <td class="barcodeVal">${globalfactoryUnreceivedData[i].BARCODE || globalfactoryUnreceivedData[i].barcode || ''}</td>
            </tr>
        `;
		}

		$("#factoryUnreceivedWorkMoveTableBody").html(tableBody);
	}

	function renderfactoryUnreceivedPagination() {
		let paginationHtml = "";

		if (currentfactoryUnreceivedPage > 1) {
			paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="${currentfactoryUnreceivedPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryUnreceived-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentfactoryUnreceivedPage - 5);
		let endPage = Math.min(totalfactoryUnreceivedPages, currentfactoryUnreceivedPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentfactoryUnreceivedPage) {
				paginationHtml += `<button class="factoryUnreceived-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalfactoryUnreceivedPages) {
			if (endPage < totalfactoryUnreceivedPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="${totalfactoryUnreceivedPages}">${totalfactoryUnreceivedPages}</button>`;
		}

		if (currentfactoryUnreceivedPage < totalfactoryUnreceivedPages) {
			paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="${currentfactoryUnreceivedPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryUnreceived-page-btn disabled">&gt;</button>`;
		}

		$("#factoryUnreceivedPaginationContainer").html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		const savedFactory = getCookie('selectedFactory');
		const factory = $('#factoryUnreceived_searchVal_factory');
		const storage = $('#factoryUnreceived_searchVal_storage');

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

			const storageList = ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'Material+Sideseat+Outside', 'all'];

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
	function renderfactoryUnreceivedView() {
		const savedFactory = getCookie('selectedFactory');

		let content_output = `
		<div class="divBlockControl" id="view_mPurchase_factory_unreceived_workMove">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
							<input type="date" id="factoryUnreceived_searchVal_fromDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_toDate">　</div>
							<input type="date" id="factoryUnreceived_searchVal_toDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.sentfactory')}</div>
							<select id="factoryUnreceived_searchVal_factory" class="factory-select">
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_storage">${i18n.t('search.sentstorage')}</div>
							<select id="factoryUnreceived_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>						
						<div class="search-label">
							<div class="searchVal_receiveWorkCenter">${i18n.t('search.receiveworkcenter')}</div>
							<select id="factoryUnreceived_searchVal_receiveWorkCenter" >
								<option value="H/REST">H/REST</option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
							<input type="text" id="factoryUnreceived_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
							<input type="text" id="factoryUnreceived_searchVal_itemname" />
						</div>
					</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnFactoryUnreceivedSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnFactoryUnreceivedSearchInit">${i18n.t('btn.clear')}</button>
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
						<span>${i18n.t('table.info.total')} <strong id="factoryUnreceivedTotalCount">${totalfactoryUnreceivedCount}</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="factoryUnreceivedCurrentPageInfo">${currentfactoryUnreceivedPage}</strong>/<strong id="factoryUnreceivedTotalPageInfo">${totalfactoryUnreceivedPages}</strong>
						</span>
						<div class="action-buttons-right mPurchase_factory_unreceived_workMove">
							<div id="defaultActions" class="action-group">
								<button class="btn btn-success" id="factoryUnreceivedExcelBtn" onclick="window.downloadAllfactoryUnreceivedData_internal()">Excel</button>
							</div>
						</div>
					</div>
					<table class="data-table mPurchase_factory_unreceived_workMove" id="factoryUnreceivedTable">
						<thead>
							<tr>
								<th class="noVal">${i18n.t('table.no')}</th>
								<th class="itemcodeVal" data-sort="FACTORY">${i18n.t('search.sentfactory')}</th>
								<th class="itemcodeVal" data-sort="STORAGE">${i18n.t('search.sentstorage')}</th>
								<th class="locationVal_short" data-sort="INDATE" data-type="date">${i18n.t('search.sentdate')}</th>
								<th class="itemcodeVal" data-sort="WCCODE">${i18n.t('search.receiveworkcenter')}</th>
								<th class="carVal" data-sort="CAR">${i18n.t('search.car')}</th>
								<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
								<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
								<th class="scanqtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty.out')}</th>
								<th class="barcodeVal" data-sort="BARCODE">LOT</th>
							</tr>
						</thead>
						<tbody id="factoryUnreceivedWorkMoveTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="factoryUnreceivedPaginationContainer">
					</div>
					<div class="items-per-page-selector">
				        <label for="factoryUnreceived_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
				        <select id="factoryUnreceived_itemsPerPage" class="items-per-page-select">
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
			$("#factoryUnreceived_searchVal_toDate").val(toDate);
			$("#factoryUnreceived_searchVal_fromDate").val(fromDate);
			$("#factoryUnreceived_searchVal_factory").val(savedFactory || 'all');
			$("#factoryUnreceived_itemsPerPage").val(factoryUnreceivedItemsPerPage);
			console.log("🎯 Select 초기값 설정됨:", factoryUnreceivedItemsPerPage);
		})();

		renderFactoryStorage();
		renderfactoryUnreceivedTableData();
		renderfactoryUnreceivedPagination();
		bindfactoryUnreceivedEvents();
		updatefactoryUnreceivedTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindfactoryUnreceivedEvents() {
		// 검색 버튼
		$(".btnFactoryUnreceivedSearch").off('click').on('click', function() {
			handleFactoryUnreceivedSearch();
		});

		// 초기화 버튼
		$(".btnFactoryUnreceivedSearchInit").off('click').on('click', function() {
			handleFactoryUnreceivedSearchInit();
		});

		// 페이지당 항목 수 변경
		$('#factoryUnreceived_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			handleChangeFactoryUnreceivedItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼
		$(document).off('click', '.factoryUnreceived-page-btn').on('click', '.factoryUnreceived-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					handlePageChange(page);
				}
			}
		});

		// 헤더 정렬
		$('#factoryUnreceivedTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			handleSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mPurchase_factory_unreceived_workMove input[type="text"], #view_mPurchase_factory_unreceived_workMove input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				handleFactoryUnreceivedSearch();
			}
		});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleFactoryUnreceivedSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentfactoryUnreceivedPage = 1;
		performfactoryUnreceivedDBSearch(searchCriteria);
	}

	function handleFactoryUnreceivedSearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		const moveFactory = getCookie('selectedFactory') || 'SALTILLO';
		const factory = 'SALTILLO';  // ✅ 고정값으로 변경
		const storage = 'Material';  // ✅ 기본값

		$("#factoryUnreceived_searchVal_fromDate").val(fromDate);
		$("#factoryUnreceived_searchVal_toDate").val(toDate);
		$("#factoryUnreceived_searchVal_factory").val(factory);  // ✅ 추가
		$("#factoryUnreceived_searchVal_itemcode").val('');
		$("#factoryUnreceived_searchVal_itemname").val('');

		renderFactoryStorage();

		currentfactoryUnreceivedPage = 1;
		performfactoryUnreceivedDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function handlePageChange(page) {
		currentfactoryUnreceivedPage = page;
		applyClientPagination();
		renderfactoryUnreceivedTableData();
		renderfactoryUnreceivedPagination();
		updatefactoryUnreceivedTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeFactoryUnreceivedItemsPerPage(newItemsPerPage) {
		factoryUnreceivedItemsPerPage = newItemsPerPage;
		currentfactoryUnreceivedPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderfactoryUnreceivedTableData();
		renderfactoryUnreceivedPagination();
		updatefactoryUnreceivedTotalCount();
	}

	function updateTotalQty() {
		$(".factoryUnreceivedTotalQty").text(Number(totalQty).toLocaleString());
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// 메인 호출 함수
	window.call_mPurchase_factory_unreceived_workMove = function(menuId) {
		function internalInit() {
			showLoading("data");
			const { fromDate, toDate } = getDefaultDateRange();
			const factory = 'SALTILLO';  // ✅ 고정
			const storage = 'Material';
			console.log("FACTORY - " + factory);
			performfactoryUnreceivedDBSearch({ fromDate, toDate, factory, storage });
		}
		internalInit();
	};

	// 엑셀 다운로드
	window.downloadAllfactoryUnreceivedData_internal = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalDownload() {
			let searchCriteria = {
				fromDate: $("#factoryUnreceived_searchVal_fromDate").val(),
				toDate: $("#factoryUnreceived_searchVal_toDate").val(),
				factory: $("#factoryUnreceived_searchVal_factory").val(),
				storage: $("#factoryUnreceived_searchVal_storage").val(),
				workCenter: $("#factoryUnreceived_searchVal_receiveWorkCenter").val(),
				itemcode: ($("#factoryUnreceived_searchVal_itemcode").val() || '').trim().toUpperCase(),
				itemname: ($("#factoryUnreceived_searchVal_itemname").val() || '').trim().toUpperCase()
			};

			showLoading("export");

			$.ajax({
				url: "/read_workMoveUnreceived",
				type: "POST",
				data: JSON.stringify({
					searchParams: searchCriteria
				}),
				contentType: "application/json",
				success: function(response) {
					console.log(response);

					ExcelExporter.downloadExcel(filteredData_purchaseFactoryUnreceived, factoryUnreceivedColumns, {
						fileName: 'factoryUnreceived_All',
						sheetName: 'factoryUnreceived'
					});
					hideLoading();
				},
				error: function(xhr, status, error) {
					console.log("🔥 LOCAL ajax error:", status, error);
					console.log("Response:", xhr.responseText);

					const message = "An error occurred while processing the request.\n\n"
						+ "Details:\n"
						+ (xhr.responseText || error || status || "Unknown error");

					// 🔹 기본 alert 대신 커스텀 모달 사용
					window.showCopyableAlert(message);

					hideLoading();
				}
			});
		}

		internalDownload();
	};

	// 데이터 내보내기
	window.exportfactoryUnreceivedData = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalExport() {
			return {
				total: filteredData_purchaseFactoryUnreceived.length,
				currentPage: currentfactoryUnreceivedPage,
				itemsPerPage: factoryUnreceivedItemsPerPage,
				data: filteredData_purchaseFactoryUnreceived
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeFactoryUnreceivedItemsPerPage = function(newItemsPerPage) {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalChange() {
			handleChangeFactoryUnreceivedItemsPerPage(newItemsPerPage);
		}

		internalChange();
	};

	// ============================================================
	// ✅ 초기화 - $(document).ready
	// ============================================================
	$(document).ready(function() {
		// 초기화 코드 필요시 여기 추가
	});

})(); // ← IIFE 종료 - 모든 변수/함수 격리됨 */