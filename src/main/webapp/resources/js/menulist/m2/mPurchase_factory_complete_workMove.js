/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 미수령 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];

	let filteredData_purchaseFactoryCompleteWorkMove = [];
	let globalfactoryCompleteWorkMoveData = [];
	let currentfactoryCompleteWorkMovePage = 1;
	let factoryCompleteWorkMoveItemsPerPage = 100;
	let totalfactoryCompleteWorkMoveCount = 0;
	let totalfactoryCompleteWorkMovePages = 0;

	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;

	// ✅ 전역 데이터
	let filteredfactoryCompleteWorkMoveData = [];
	let factoryCompleteWorkMoveColumns = [
		{ key: 'FACTORY', header: 'Sent Factory' },
		{ key: 'STORAGE', header: 'Sent Storage' },
		{ key: 'INDATE', header: 'Sent Date' },
		{ key: 'WCCODE', header: 'Receive Work Shop', formatter: (val) => val?.split('-')[1] || '' },
		{ key: 'LOCATION', header: 'Location' },
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
			fromDate: $("#factoryCompleteWorkMove_searchVal_fromDate").val(),
			toDate: $("#factoryCompleteWorkMove_searchVal_toDate").val(),
			factory: $("#factoryCompleteWorkMove_searchVal_factory").val(),
			storage: $("#factoryCompleteWorkMove_searchVal_storage").val(),
			scan: $("#factoryCompleteWorkMove_searchVal_scan").val(),
			workCenter: $("#factoryCompleteWorkMove_searchVal_receiveWorkCenter").val(),
			location: $("#factoryCompleteWorkMove_searchVal_location").val(),
			itemcode: ($("#factoryCompleteWorkMove_searchVal_itemcode").val() || '').trim().toUpperCase(),
			itemname: ($("#factoryCompleteWorkMove_searchVal_itemname").val() || '').trim().toUpperCase()
		};
	}

	function performfactoryCompleteWorkMoveDBSearch(searchCriteria) {
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
				filteredData_purchaseFactoryCompleteWorkMove = [...allServerData];
				totalQty = response.totalQty || 0;

				currentfactoryCompleteWorkMovePage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mPurchase_factory_complete_workMove').length) {
					// 🔹 화면 처음 생성할 때
					renderfactoryCompleteWorkMoveView();
				} else {
					// 🔹 이미 화면이 있는 상태에서 다시 조회할 때 → 테이블/페이지네이션/카운트 다시 그림
					renderfactoryCompleteWorkMoveTableData();
					renderfactoryCompleteWorkMovePagination();
					updatefactoryCompleteWorkMoveTotalCount();
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

		totalfactoryCompleteWorkMoveCount = filteredData_purchaseFactoryCompleteWorkMove.length;
		totalfactoryCompleteWorkMovePages = Math.ceil(totalfactoryCompleteWorkMoveCount / factoryCompleteWorkMoveItemsPerPage);

		const startIndex = (currentfactoryCompleteWorkMovePage - 1) * factoryCompleteWorkMoveItemsPerPage;
		const endIndex = startIndex + factoryCompleteWorkMoveItemsPerPage;

		globalfactoryCompleteWorkMoveData = filteredData_purchaseFactoryCompleteWorkMove.slice(startIndex, endIndex);
		filteredfactoryCompleteWorkMoveData = globalfactoryCompleteWorkMoveData;
	}

	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		// ✅ 완료(complete) 화면: 전체 데이터 배열을 정렬해야 함
		filteredData_purchaseFactoryCompleteWorkMove.sort((a, b) => {
			let valA = a[column] ?? a[column.toLowerCase()] ?? '';
			let valB = b[column] ?? b[column.toLowerCase()] ?? '';

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

		// ✅ 정렬하면 1페이지로
		currentfactoryCompleteWorkMovePage = 1;

		applyClientPagination();

		renderfactoryCompleteWorkMoveTableData();
		renderfactoryCompleteWorkMovePagination();
		updatefactoryCompleteWorkMoveTotalCount();

		updateSortIndicators(column);
	}


	function updateSortIndicators(column) {
		const $view = $('#view_mPurchase_factory_complete_workMove');
		$view.find('.data-table thead th').removeClass('sort-asc sort-desc');
		$view.find(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}


	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatefactoryCompleteWorkMoveTotalCount() {
		$('#factoryCompleteWorkMoveTotalCount').text(Number(totalfactoryCompleteWorkMoveCount).toLocaleString());
		$('#factoryCompleteWorkMoveCurrentPageInfo').text(currentfactoryCompleteWorkMovePage);
		$('#factoryCompleteWorkMoveTotalPageInfo').text(totalfactoryCompleteWorkMovePages);
		// 🔽 총수량 표시 갱신
		updateTotalQty();
	}

	function renderfactoryCompleteWorkMoveTableData() {
		let tableBody = "";

		for (let i = 0; i < globalfactoryCompleteWorkMoveData.length; i++) {
			let rowNumber = (currentfactoryCompleteWorkMovePage - 1) * factoryCompleteWorkMoveItemsPerPage + i + 1;
			const data = globalfactoryCompleteWorkMoveData[i];

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
                <td class="itemcodeVal">${globalfactoryCompleteWorkMoveData[i].FACTORY || globalfactoryCompleteWorkMoveData[i].factory || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteWorkMoveData[i].STORAGE || globalfactoryCompleteWorkMoveData[i].storage || ''}</td>
                <td class="locationVal_short">${globalfactoryCompleteWorkMoveData[i].INDATE || globalfactoryCompleteWorkMoveData[i].indate || ''}</td>
                <td class="itemcodeVal">${receiveWorkCenter}</td>
                <td class="itemcodeVal">${globalfactoryCompleteWorkMoveData[i].LOCATION || globalfactoryCompleteWorkMoveData[i].location || ''}</td>
                <td class="carVal">${globalfactoryCompleteWorkMoveData[i].CAR || globalfactoryCompleteWorkMoveData[i].car || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteWorkMoveData[i].ITEMCODE || globalfactoryCompleteWorkMoveData[i].itemcode || ''}</td>
                <td class="itemnameVal">${globalfactoryCompleteWorkMoveData[i].ITEMNAME || globalfactoryCompleteWorkMoveData[i].itemname || ''}</td>
                <td class="scanqtyVal">${Number(globalfactoryCompleteWorkMoveData[i].QTY || globalfactoryCompleteWorkMoveData[i].qty || 0).toLocaleString()}</td>
                <td class="barcodeVal">${globalfactoryCompleteWorkMoveData[i].BARCODE || globalfactoryCompleteWorkMoveData[i].barcode || ''}</td>
            </tr>
        `;
		}

		$("#factoryCompleteWorkMoveTableBody").html(tableBody);
	}

	function renderfactoryCompleteWorkMovePagination() {
		let paginationHtml = "";

		if (currentfactoryCompleteWorkMovePage > 1) {
			paginationHtml += `<button class="factoryCompleteWorkMove-page-btn" data-page="${currentfactoryCompleteWorkMovePage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryCompleteWorkMove-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentfactoryCompleteWorkMovePage - 5);
		let endPage = Math.min(totalfactoryCompleteWorkMovePages, currentfactoryCompleteWorkMovePage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="factoryCompleteWorkMove-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentfactoryCompleteWorkMovePage) {
				paginationHtml += `<button class="factoryCompleteWorkMove-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryCompleteWorkMove-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalfactoryCompleteWorkMovePages) {
			if (endPage < totalfactoryCompleteWorkMovePages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryCompleteWorkMove-page-btn" data-page="${totalfactoryCompleteWorkMovePages}">${totalfactoryCompleteWorkMovePages}</button>`;
		}

		if (currentfactoryCompleteWorkMovePage < totalfactoryCompleteWorkMovePages) {
			paginationHtml += `<button class="factoryCompleteWorkMove-page-btn" data-page="${currentfactoryCompleteWorkMovePage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryCompleteWorkMove-page-btn disabled">&gt;</button>`;
		}

		$("#factoryCompleteWorkMovePaginationContainer").html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		//const savedFactory = getCookie('selectedFactory');
		const factory = $('#factoryCompleteWorkMove_searchVal_factory');
		const storage = $('#factoryCompleteWorkMove_searchVal_storage');

		function updateFactoryOptions() {
			factory.empty();

			/*if (savedFactory === 'SALTILLO') {
				factory.append(`<option value="SALTILLO">Saltillo</option>`);
			} else if (savedFactory === 'PUEBLA') {
				factory.append(`<option value="PUEBLA">Puebla</option>`);
			} else {*/
				factory.append(`<option value="SALTILLO">Saltillo</option>`);
				factory.append(`<option value="PUEBLA">Puebla</option>`);
				factory.append(`<option value="all">${i18n.t('search.all')}</option>`);
			/*}*/

			factory.val(factory.find('option:first').val());
		}

		function updateStorageOptions() {
			storage.empty();

			const storageList = ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'all'];

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
	function renderfactoryCompleteWorkMoveView() {
		const savedFactory = getCookie('selectedFactory');

		let content_output = `
		<div class="divBlockControl" id="view_mPurchase_factory_complete_workMove">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
							<input type="date" id="factoryCompleteWorkMove_searchVal_fromDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_toDate">　</div>
							<input type="date" id="factoryCompleteWorkMove_searchVal_toDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.sentfactory')}</div>
							<select id="factoryCompleteWorkMove_searchVal_factory" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_storage">${i18n.t('search.sentstorage')}</div>
							<select id="factoryCompleteWorkMove_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>						
						<div class="search-label">
							<div class="searchVal_receiveWorkCenter">${i18n.t('search.receiveworkcenter')}</div>
							<select id="factoryCompleteWorkMove_searchVal_receiveWorkCenter" >
								<option value="H/REST">H/REST</option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_scan">${i18n.t('search.scanType.load')}</div>
							<select id="factoryCompleteWorkMove_searchVal_scan" >
								<option value="all">${i18n.t('search.all')}</option>
								<option value="Y">Y</option>
								<option value="N">N</option>
							</select>
						</div>						
						<div class="search-label">
							<div class="searchVal_location">${i18n.t('search.location')}</div>
							<input type="text" id="factoryCompleteWorkMove_searchVal_location" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
							<input type="text" id="factoryCompleteWorkMove_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
							<input type="text" id="factoryCompleteWorkMove_searchVal_itemname" />
						</div>
					</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnFactoryCompleteWorkMoveSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnFactoryCompleteWorkMoveSearchInit">${i18n.t('btn.clear')}</button>
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
					        <strong id="factoryCompleteWorkMoveTotalCount">${totalfactoryCompleteWorkMoveCount}</strong>
					        ${i18n.t('table.info.records')}
					        | ${i18n.t('table.page')}
					        <strong id="factoryCompleteWorkMoveCurrentPageInfo">${currentfactoryCompleteWorkMovePage}</strong> /
					        <strong id="factoryCompleteWorkMoveTotalPageInfo">${totalfactoryCompleteWorkMovePages}</strong>
					        | ${i18n.t('table.info.qty')}
					        <strong class="factoryCompleteWorkMoveTotalQty">
					            ${Number(totalQty).toLocaleString()}
					        </strong>
					    </span>
						<div class="action-buttons-right mPurchase_factory_complete_workMove">
							<div id="defaultActions" class="action-group">
								<button class="btn btn-success" id="factoryCompleteWorkMoveExcelBtn">Excel</button>
							</div>
						</div>
					</div>
					<table class="data-table mPurchase_factory_complete_workMove" id="factoryCompleteWorkMoveTable">
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
								<th class="barcodeVal" data-sort="BARCODE">LOT</th>
							</tr>
						</thead>
						<tbody id="factoryCompleteWorkMoveTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="factoryCompleteWorkMovePaginationContainer">
					</div>
					<div class="items-per-page-selector">
				        <label for="factoryCompleteWorkMove_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
				        <select id="factoryCompleteWorkMove_itemsPerPage" class="items-per-page-select">
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
			$("#factoryCompleteWorkMove_searchVal_toDate").val(toDate);
			$("#factoryCompleteWorkMove_searchVal_fromDate").val(fromDate);
			$("#factoryCompleteWorkMove_searchVal_factory").val(savedFactory || 'all');
			$("#factoryCompleteWorkMove_itemsPerPage").val(factoryCompleteWorkMoveItemsPerPage);
			console.log("🎯 Select 초기값 설정됨:", factoryCompleteWorkMoveItemsPerPage);
		})();

		renderFactoryStorage();
		renderfactoryCompleteWorkMoveTableData();
		renderfactoryCompleteWorkMovePagination();
		bindfactoryCompleteWorkMoveEvents();
		updatefactoryCompleteWorkMoveTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindfactoryCompleteWorkMoveEvents() {
		const $view = $('#view_mPurchase_factory_complete_workMove');

		// ✅ 엑셀 버튼 (전역함수/onclick 제거)
		$view.off('click', '#factoryCompleteWorkMoveExcelBtn')
			.on('click', '#factoryCompleteWorkMoveExcelBtn', function() {
				downloadFactoryCompleteWorkMoveExcel();
			});

		// 검색 버튼
		$view.off('click', '.btnFactoryCompleteWorkMoveSearch')
			.on('click', '.btnFactoryCompleteWorkMoveSearch', handleFactoryCompleteWorkMoveSearch);

		// 초기화 버튼
		$view.off('click', '.btnFactoryCompleteWorkMoveSearchInit')
			.on('click', '.btnFactoryCompleteWorkMoveSearchInit', handleFactoryCompleteWorkMoveSearchInit);

		// 페이지당 항목 수 변경
		$view.off('change', '#factoryCompleteWorkMove_itemsPerPage')
			.on('change', '#factoryCompleteWorkMove_itemsPerPage', function() {
				handleChangeFactoryCompleteWorkMoveItemsPerPage(parseInt($(this).val(), 10));
			});

		// 헤더 정렬
		$view.off('click', '#factoryCompleteWorkMoveTable thead th[data-sort]')
			.on('click', '#factoryCompleteWorkMoveTable thead th[data-sort]', function() {
				const column = $(this).data('sort');
				const dataType = $(this).data('type') || 'string';
				handleSort(column, dataType);
			});

		// 페이지네이션 버튼
		$view.off('click', '.factoryCompleteWorkMove-page-btn')
			.on('click', '.factoryCompleteWorkMove-page-btn', function() {
				if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;
				const page = parseInt($(this).data('page'), 10);
				if (page && page > 0) handlePageChange(page);
			});



		// 엔터키 검색
		$('#view_mPurchase_factory_complete_workMove input[type="text"], #view_mPurchase_factory_complete_workMove input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				handleFactoryCompleteWorkMoveSearch();
			}
		});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleFactoryCompleteWorkMoveSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentfactoryCompleteWorkMovePage = 1;
		performfactoryCompleteWorkMoveDBSearch(searchCriteria);
	}

	function handleFactoryCompleteWorkMoveSearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = 'SALTILLO';  // ✅ 고정
		const storage = 'Material';

		$("#factoryCompleteWorkMove_searchVal_fromDate").val(fromDate);
		$("#factoryCompleteWorkMove_searchVal_toDate").val(toDate);
		$("#factoryCompleteWorkMove_searchVal_factory").val(factory);  // ✅ 추가
		$("#factoryCompleteWorkMove_searchVal_storage").val(storage);  // ✅ 추가
		$("#factoryCompleteWorkMove_searchVal_scan").val('all');  // ✅ 추가
		$("#factoryCompleteWorkMove_searchVal_location").val('');  // ✅ 추가
		$("#factoryCompleteWorkMove_searchVal_itemcode").val('');
		$("#factoryCompleteWorkMove_searchVal_itemname").val('');

		renderFactoryStorage();

		currentfactoryCompleteWorkMovePage = 1;
		performfactoryCompleteWorkMoveDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function handlePageChange(page) {
		currentfactoryCompleteWorkMovePage = page;
		applyClientPagination();
		renderfactoryCompleteWorkMoveTableData();
		renderfactoryCompleteWorkMovePagination();
		updatefactoryCompleteWorkMoveTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeFactoryCompleteWorkMoveItemsPerPage(newItemsPerPage) {
		factoryCompleteWorkMoveItemsPerPage = newItemsPerPage;
		currentfactoryCompleteWorkMovePage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderfactoryCompleteWorkMoveTableData();
		renderfactoryCompleteWorkMovePagination();
		updatefactoryCompleteWorkMoveTotalCount();
	}

	function updateTotalQty() {
		$(".factoryCompleteWorkMoveTotalQty").text(Number(totalQty).toLocaleString());
	}

	function downloadFactoryCompleteWorkMoveExcel() {
		try {
			let src = filteredData_purchaseFactoryCompleteWorkMove;

			if (!Array.isArray(src) || src.length === 0) {
				src = globalfactoryCompleteWorkMoveData;
			}

			if (!Array.isArray(src) || src.length === 0) {
				alert("다운로드할 데이터가 없습니다.");
				return;
			}

			const exportRows = src.map(r => {
				const wccode = (r.WCCODE ?? r.wccode ?? '');
				return {
					FACTORY: (r.FACTORY ?? r.factory ?? ''),
					STORAGE: (r.STORAGE ?? r.storage ?? ''),
					INDATE: (r.INDATE ?? r.indate ?? ''),
					WCCODE: wccode,
					LOCATION: (r.LOCATION ?? r.location ?? ''),
					CAR: (r.CAR ?? r.car ?? ''),
					ITEMCODE: (r.ITEMCODE ?? r.itemcode ?? ''),
					ITEMNAME: (r.ITEMNAME ?? r.itemname ?? ''),
					QTY: (r.QTY ?? r.qty ?? 0),
					BARCODE: (r.BARCODE ?? r.barcode ?? '')
				};
			});

			ExcelExporter.downloadExcel(exportRows, factoryCompleteWorkMoveColumns, {
				fileName: 'factoryCompleteWorkMove_All',
				sheetName: 'factoryCompleteWorkMove'
			});

		} catch (e) {
			console.error("Excel download error:", e);
			alert("엑셀 다운로드 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
		}
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
			performfactoryCompleteWorkMoveDBSearch({ fromDate, toDate, factory, storage });
		}
		internalInit();
	};


	// 데이터 내보내기
	window.exportfactoryCompleteWorkMoveData = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalExport() {
			return {
				total: filteredData_purchaseFactoryCompleteWorkMove.length,
				currentPage: currentfactoryCompleteWorkMovePage,
				itemsPerPage: factoryCompleteWorkMoveItemsPerPage,
				data: filteredData_purchaseFactoryCompleteWorkMove
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeFactoryCompleteWorkMoveItemsPerPage = function(newItemsPerPage) {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalChange() {
			handleChangeFactoryCompleteWorkMoveItemsPerPage(newItemsPerPage);
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