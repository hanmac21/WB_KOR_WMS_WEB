/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 미수령 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
/*(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];

	let filteredData_purchaseFactoryComplete = [];
	let globalfactoryCompleteWorkMoveData = [];
	let currentfactoryCompleteWorkMovePage = 1;
	let factoryCompleteWorkMoveItemsPerPage = 100;
	let totalfactoryCompleteWorkMoveCount = 0;
	let totalfactoryCompleteWorkMovePages = 0;

	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;

	// ✅ 전역 데이터
	let filteredfactoryCompleteData = [];
	let factoryCompleteColumns = [
		{ key: 'SENTFACTORY', header: 'Sent Factory' },
		{ key: 'SENTSTORAGE', header: 'Sent Storage' },
		{ key: 'SENTDATE', header: 'Sent Date' },
		{ key: 'WCCODE', header: 'Receive Work Shop', formatter: (val) => val?.split('-')[1] || '' },
		{ key: 'WCCODE_SUFFIX', header: 'Receiving Location'},
		{ key: 'RECEIVEDATE', header: 'Receive Date' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'FROMQTY', header: 'Sent Qty', type: 'number' },
		{ key: 'TOQTY', header: 'Receive Qty', type: 'number' },
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
			fromDate: $("#factoryComplete_searchVal_fromDate").val(),
			toDate: $("#factoryComplete_searchVal_toDate").val(),
			factory: $("#factoryComplete_searchVal_factory").val(),
			storage: $("#factoryComplete_searchVal_storage").val(),
			workCenter: $("#factoryComplete_searchVal_receiveWorkCenter").val(),
			itemcode: ($("#factoryComplete_searchVal_itemcode").val() || '').trim().toUpperCase(),
			itemname: ($("#factoryComplete_searchVal_itemname").val() || '').trim().toUpperCase()
		};
	}

	function performfactoryCompleteDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_workMoveComplete",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				allServerData = response.records || [];
				filteredData_purchaseFactoryComplete = [...allServerData];
				totalQty = response.totalQty || 0;

				currentfactoryCompleteWorkMovePage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mPurchase_factory_complete_workMove').length) {
					// 🔹 화면 처음 생성할 때
					renderfactoryCompleteView();
				} else {
					// 🔹 이미 화면이 있는 상태에서 다시 조회할 때 → 테이블/페이지네이션/카운트 다시 그림
					renderfactoryCompleteTableData();
					renderfactoryCompletePagination();
					updatefactoryCompleteTotalCount();
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
		factoryCompleteWorkMoveItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalfactoryCompleteWorkMoveCount = filteredData_purchaseFactoryComplete.length;
		totalfactoryCompleteWorkMovePages = Math.ceil(totalfactoryCompleteWorkMoveCount / factoryCompleteWorkMoveItemsPerPage);

		const startIndex = (currentfactoryCompleteWorkMovePage - 1) * factoryCompleteWorkMoveItemsPerPage;
		const endIndex = startIndex + factoryCompleteWorkMoveItemsPerPage;

		globalfactoryCompleteWorkMoveData = filteredData_purchaseFactoryComplete.slice(startIndex, endIndex);
		filteredfactoryCompleteData = globalfactoryCompleteWorkMoveData;
	}

	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_purchaseFactoryComplete.sort((a, b) => {
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

		currentfactoryCompleteWorkMovePage = 1;
		applyClientPagination();

		renderfactoryCompleteTableData();
		renderfactoryCompletePagination();
		updatefactoryCompleteTotalCount();

		updateSortIndicators(column);
	}

	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatefactoryCompleteTotalCount() {
		$('#factoryCompleteTotalCount').text(Number(totalfactoryCompleteWorkMoveCount).toLocaleString());
		$('#factoryCompleteCurrentPageInfo').text(currentfactoryCompleteWorkMovePage);
		$('#factoryCompleteTotalPageInfo').text(totalfactoryCompleteWorkMovePages);
	}

	function renderfactoryCompleteTableData() {
		let tableBody = "";

		for (let i = 0; i < globalfactoryCompleteWorkMoveData.length; i++) {
			let rowNumber = (currentfactoryCompleteWorkMovePage - 1) * factoryCompleteWorkMoveItemsPerPage + i + 1;
			const data = globalfactoryCompleteWorkMoveData[i];
			
			let wccode = data.WCCODE || data.wccode || '';
			let receiveWorkCenter = wccode ? wccode.split('-')[1] : '';

			// 받은 수량이 없다 = 샌딩 정보가 없다
			if (!data.FROMQTY){
				data.SENTFACTORY = '';
				data.SENTSTORAGE = '';
				data.SENTDATE = '';
				data.FROMQTY = '';
			}	
			
			
			tableBody += `
            <tr>
                <td class="noVal">${rowNumber}</td>
                <td class="shortSet_1">${data.SENTFACTORY || data.sentfactory || ''}</td>
                <td class="shortSet_1">${data.SENTSTORAGE || data.sentstorage || ''}</td>
                <td class="shortSet_2">${data.SENTDATE || data.sentdate || ''}</td>
                <td class="shortSet_1">${receiveWorkCenter}</td>
                <td class="itemcodeVal">${data.WCCODE_SUFFIX || data.wccode_suffix || ''}</td>
                <td class="shortSet_2">${data.RECEIVEDATE || data.receivedate || ''}</td>
                <td class="carVal">${data.CAR || data.car || ''}</td>
                <td class="itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                <td class="itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
                <td class="scanqtyVal">${Number(data.FROMQTY || data.fromqty || 0).toLocaleString()}</td>
                <td class="unpackqtyVal">${Number(data.TOQTY || data.toqty || 0).toLocaleString()}</td>
                <td class="barcodeVal">${data.BARCODE || data.barcode || ''}</td>
            </tr>
        `;
		}

		$("#factoryCompleteWorkMoveTableBody").html(tableBody);
	}

	function renderfactoryCompletePagination() {
		let paginationHtml = "";

		if (currentfactoryCompleteWorkMovePage > 1) {
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="${currentfactoryCompleteWorkMovePage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryComplete-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentfactoryCompleteWorkMovePage - 5);
		let endPage = Math.min(totalfactoryCompleteWorkMovePages, currentfactoryCompleteWorkMovePage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentfactoryCompleteWorkMovePage) {
				paginationHtml += `<button class="factoryComplete-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryComplete-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalfactoryCompleteWorkMovePages) {
			if (endPage < totalfactoryCompleteWorkMovePages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="${totalfactoryCompleteWorkMovePages}">${totalfactoryCompleteWorkMovePages}</button>`;
		}

		if (currentfactoryCompleteWorkMovePage < totalfactoryCompleteWorkMovePages) {
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="${currentfactoryCompleteWorkMovePage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryComplete-page-btn disabled">&gt;</button>`;
		}

		$("#factoryCompletePaginationContainer").html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		const savedFactory = getCookie('selectedFactory');
		const factory = $('#factoryComplete_searchVal_factory');
		const storage = $('#factoryComplete_searchVal_storage');

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
	function renderfactoryCompleteView() {
		const savedFactory = getCookie('selectedFactory');

		let content_output = `
		<div class="divBlockControl" id="view_mPurchase_factory_complete_workMove">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
							<input type="date" id="factoryComplete_searchVal_fromDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_toDate">　</div>
							<input type="date" id="factoryComplete_searchVal_toDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.sentfactory')}</div>
							<select id="factoryComplete_searchVal_factory" class="factory-select">
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_storage">${i18n.t('search.sentstorage')}</div>
							<select id="factoryComplete_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>						
						<div class="search-label">
							<div class="searchVal_receiveWorkCenter">${i18n.t('search.receiveworkcenter')}</div>
							<select id="factoryComplete_searchVal_receiveWorkCenter" >
								<option value="H/REST">H/REST</option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
							<input type="text" id="factoryComplete_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
							<input type="text" id="factoryComplete_searchVal_itemname" />
						</div>
					</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnFactoryCompleteSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnFactoryCompleteSearchInit">${i18n.t('btn.clear')}</button>
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
						<span>${i18n.t('table.info.total')} <strong id="factoryCompleteTotalCount">${totalfactoryCompleteWorkMoveCount}</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="factoryCompleteCurrentPageInfo">${currentfactoryCompleteWorkMovePage}</strong>/<strong id="factoryCompleteTotalPageInfo">${totalfactoryCompleteWorkMovePages}</strong>
						</span>
						<div class="action-buttons-right mPurchase_factory_complete_workMove">
							<div id="defaultActions" class="action-group">
								<button class="btn btn-success" id="factoryCompleteExcelBtn" onclick="window.downloadAllfactoryCompleteData_internal()">Excel</button>
							</div>
						</div>
					</div>
					<table class="data-table mPurchase_factory_complete_workMove" id="factoryCompleteTable">
						<thead>
							<tr>
								<th class="noVal">${i18n.t('table.no')}</th>
								<th class="shortSet_1" data-sort="SENTFACTORY" data-type="string">${i18n.t('search.sentfactory')}</th>
								<th class="shortSet_1" data-sort="SENTSTORAGE" data-type="string">${i18n.t('search.sentstorage')}</th>
								<th class="shortSet_2" data-sort="SENTDATE" data-type="date">${i18n.t('search.sentdate')}</th>
								<th class="shortSet_1" data-sort="WCCODE" data-type="string">${i18n.t('search.receiveworkcenter')}</th>
								<th class="itemcodeVal" data-sort="WCCODE_SUFFIX" data-type="string">${i18n.t('search.receivinglocation')}</th>
								<th class="shortSet_2" data-sort="RECEIVEDATE" data-type="date">${i18n.t('search.receivedate')}</th>
								<th class="carVal" data-sort="CAR" data-type="string">${i18n.t('search.car')}</th>
								<th class="itemcodeVal" data-sort="ITEMCODE" data-type="string">${i18n.t('search.itemCode')}</th>
								<th class="itemnameVal" data-sort="ITEMNAME" data-type="string">${i18n.t('search.itemName')}</th>
								<th class="scanqtyVal" data-sort="FROMQTY" data-type="number">${i18n.t('search.qty.out')}</th>
								<th class="unpackqtyVal" data-sort="TOQTY" data-type="number">${i18n.t('search.qty.in')}</th>
								<th class="barcodeVal" data-sort="BARCODE" data-type="string">LOT</th>
							</tr>
						</thead>
						<tbody id="factoryCompleteWorkMoveTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="factoryCompletePaginationContainer">
					</div>
					<div class="items-per-page-selector">
				        <label for="factoryComplete_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
				        <select id="factoryComplete_itemsPerPage" class="items-per-page-select">
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
			$("#factoryComplete_searchVal_toDate").val(toDate);
			$("#factoryComplete_searchVal_fromDate").val(fromDate);
			$("#factoryComplete_searchVal_factory").val(savedFactory || 'all');
			$("#factoryComplete_itemsPerPage").val(factoryCompleteWorkMoveItemsPerPage);
			console.log("🎯 Select 초기값 설정됨:", factoryCompleteWorkMoveItemsPerPage);
		})();

		renderFactoryStorage();
		renderfactoryCompleteTableData();
		renderfactoryCompletePagination();
		bindfactoryCompleteEvents();
		updatefactoryCompleteTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindfactoryCompleteEvents() {
		// 검색 버튼
		$(".btnFactoryCompleteSearch").off('click').on('click', function() {
			handleFactoryCompleteSearch();
		});

		// 초기화 버튼
		$(".btnFactoryCompleteSearchInit").off('click').on('click', function() {
			handleFactoryCompleteSearchInit();
		});

		// 페이지당 항목 수 변경
		$('#factoryComplete_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			handleChangeFactoryCompleteItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼
		$(document).off('click', '.factoryComplete-page-btn').on('click', '.factoryComplete-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					handlePageChange(page);
				}
			}
		});

		// 헤더 정렬
		$('#factoryCompleteTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			handleSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mPurchase_factory_complete_workMove input[type="text"], #view_mPurchase_factory_complete_workMove input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				handleFactoryCompleteSearch();
			}
		});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleFactoryCompleteSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentfactoryCompleteWorkMovePage = 1;
		performfactoryCompleteDBSearch(searchCriteria);
	}

	function handleFactoryCompleteSearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = 'SALTILLO';  // ✅ 고정
		const storage = 'Material';

		$("#factoryComplete_searchVal_fromDate").val(fromDate);
		$("#factoryComplete_searchVal_toDate").val(toDate);
		$("#factoryComplete_searchVal_factory").val(factory);  // ✅ 추가
		$("#factoryComplete_searchVal_storage").val(storage);  // ✅ 추가
		$("#factoryComplete_searchVal_itemcode").val('');
		$("#factoryComplete_searchVal_itemname").val('');

		renderFactoryStorage();

		currentfactoryCompleteWorkMovePage = 1;
		performfactoryCompleteDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function handlePageChange(page) {
		currentfactoryCompleteWorkMovePage = page;
		applyClientPagination();
		renderfactoryCompleteTableData();
		renderfactoryCompletePagination();
		updatefactoryCompleteTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeFactoryCompleteItemsPerPage(newItemsPerPage) {
		factoryCompleteWorkMoveItemsPerPage = newItemsPerPage;
		currentfactoryCompleteWorkMovePage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderfactoryCompleteTableData();
		renderfactoryCompletePagination();
		updatefactoryCompleteTotalCount();
	}

	function updateTotalQty() {
		$(".factoryCompleteTotalQty").text(Number(totalQty).toLocaleString());
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// ✅ 수정 (Saltillo 고정)
	window.call_mPurchase_factory_complete_workMove = function(menuId) {
		function internalInit() {
			showLoading("data");
			const { fromDate, toDate } = getDefaultDateRange();
			const factory = 'SALTILLO';  // ✅ 고정
			const storage = 'Material';
			console.log("FACTORY - " + factory);
			performfactoryCompleteDBSearch({ fromDate, toDate, factory, storage });
		}
		internalInit();
	};

	// 엑셀 다운로드
	window.downloadAllfactoryCompleteData_internal = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalDownload() {
			let searchCriteria = {
				fromDate: $("#factoryComplete_searchVal_fromDate").val(),
				toDate: $("#factoryComplete_searchVal_toDate").val(),
				factory: $("#factoryComplete_searchVal_factory").val(),
				storage: $("#factoryComplete_searchVal_storage").val(),
				workCenter: $("#factoryComplete_searchVal_receiveWorkCenter").val(),  // ✅ 변경
				itemcode: ($("#factoryComplete_searchVal_itemcode").val() || '').trim().toUpperCase(),
				itemname: ($("#factoryComplete_searchVal_itemname").val() || '').trim().toUpperCase()
			};

			showLoading("export");

			$.ajax({
				url: "/read_workMoveComplete",
				type: "POST",
				data: JSON.stringify({
					searchParams: searchCriteria
				}),
				contentType: "application/json",
				success: function(response) {
					console.log(response);

					ExcelExporter.downloadExcel(filteredData_purchaseFactoryComplete, factoryCompleteColumns, {
						fileName: 'factoryComplete_All',
						sheetName: 'factoryComplete'
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
	window.exportfactoryCompleteData = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalExport() {
			return {
				total: filteredData_purchaseFactoryComplete.length,
				currentPage: currentfactoryCompleteWorkMovePage,
				itemsPerPage: factoryCompleteWorkMoveItemsPerPage,
				data: filteredData_purchaseFactoryComplete
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeFactoryCompleteItemsPerPage = function(newItemsPerPage) {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalChange() {
			handleChangeFactoryCompleteItemsPerPage(newItemsPerPage);
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