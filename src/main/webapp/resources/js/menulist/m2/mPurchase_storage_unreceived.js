/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 미수령 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];
	let filteredData_purchaseStorageUnreceived = [];
	let globalStorageUnreceivedData = [];
	let unreceivedAllData = []; // 🔹 미수령 전체 데이터

	let currentStorageUnreceivedPage = 1;
	let storageUnreceivedItemsPerPage = 100;
	let totalStorageUnreceivedCount = 0;
	let totalStorageUnreceivedPages = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;

	// ✅ 전역 데이터
	let filteredStorageUnreceivedData = [];
	let storageUnreceivedColumns = [
		{ key: 'SENTSTORAGE', header: 'Sent Storage' },
		{ key: 'SENTDATE', header: 'Sent Date' },
		{ key: 'TOSTORAGE', header: 'Receive Storage' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'OITEMCODE', header: 'Spec' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Sent Qty', type: 'number' },
		{ key: 'TOQTY', header: 'Receive Qty', type: 'number' },
		{ key: 'BARCODE', header: 'LOT' }
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
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		const expires = 'expires=' + date.toUTCString();
		const cookieString = cookieName + '=' + encodeURIComponent(value) + ';' + expires + ';path=/';

		console.log('🍪 setCookie 호출:', cookieName, '=', value);
		console.log('🍪 쿠키 문자열:', cookieString);

		document.cookie = cookieString;

		// 저장 확인
		const savedValue = getCookie(cookieName);
		console.log('🍪 저장 확인:', cookieName, '=', savedValue);
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

	// 🔹 QTY / SCANQTY / SCANQTY2 / 합계 / 차이 계산 공통 함수
	function calcQuantities(row) {
		const qty = Number(row.FROMQTY ?? row.fromqty ?? row.QTY ?? row.qty ?? 0) || 0;
		const scanqty = Number(row.SCANQTY ?? row.scanqty ?? 0) || 0;
		const scanqty2 = Number(row.SCANQTY2 ?? row.scanqty2 ?? 0) || 0;

		const scanQtySum = scanqty + scanqty2;
		const diff = qty - scanQtySum;

		return { qty, scanqty, scanqty2, scanQtySum, diff };
	}

	// ============================================================
	// ✅ 검색/필터링 함수 - IIFE 내부
	// ============================================================
	function getCurrentSearchCriteria() {
		return {
			fromDate: $('#storageUnreceived_searchVal_fromDate').val(),
			toDate: $('#storageUnreceived_searchVal_toDate').val(),
			storage: $('#storageUnreceived_searchVal_storage').val(),
			itemcode: ($('#storageUnreceived_searchVal_itemcode').val() || '').trim().toUpperCase(),
			oitemcode: ($('#storageUnreceived_searchVal_oitemcode').val() || '').trim().toUpperCase(),
			itemname: ($('#storageUnreceived_searchVal_itemname').val() || '').trim().toUpperCase()
		};
	}

	function performStorageUnreceivedDBSearch(searchCriteria) {
		showLoading('data');

		$.ajax({
			url: '/read_storageUnreceived',
			type: 'POST',
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: 'application/json',
			success: function(response) {
				console.log('-- DB 조회 결과 (전체) --');
				console.log(response);

				allServerData = response.records || [];
				filteredData_purchaseStorageUnreceived = [...allServerData];
				totalQty = response.totalQty || 0;

				currentStorageUnreceivedPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mPurchase_storage_unreceived').length) {
					renderStorageUnreceivedView();
				} else {
					renderStorageUnreceivedTableData();
					renderStorageUnreceivedPagination();
					updateStorageUnreceivedTotalCount();
				}

				hideLoading();
			},
			error: function(xhr, status, error) {
				console.log('🔥 LOCAL ajax error:', status, error);
				console.log('Response:', xhr.responseText);

				const message =
					'An error occurred while processing the request.\n\n' +
					'Details:\n' +
					(xhr.responseText || error || status || 'Unknown error');

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
		storageUnreceivedItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		// 1) 원본 검색결과 → 미수령건만 필터
		const baseRows = filteredData_purchaseStorageUnreceived || [];
		unreceivedAllData = baseRows.filter((row) => {
			const { diff } = calcQuantities(row);
			return diff !== 0;
		});

		// ✅ 1-1) 정렬 유지 (페이지 이동/아이템수 변경 시에도 유지)
		if (currentSortColumn) {
			const toTime = (v) => {
				if (!v) return 0;
				const s = String(v).trim().replace(' ', 'T');
				const t = Date.parse(s);
				return isNaN(t) ? 0 : t;
			};

			unreceivedAllData.sort((a, b) => {
				const col = currentSortColumn;

				// ✅ 숫자 컬럼 강제 처리
				if (col === 'TOQTY') {
					const valA = calcQuantities(a).scanQtySum;
					const valB = calcQuantities(b).scanQtySum;
					if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
					if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
					return 0;
				}

				if (col === 'FROMQTY' || col === 'QTY') {
					const valA = calcQuantities(a).qty;
					const valB = calcQuantities(b).qty;
					if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
					if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
					return 0;
				}

				// ✅ date 처리
				const toTime = (v) => {
					if (!v) return 0;
					const s = String(v).trim().replace(' ', 'T');
					const t = Date.parse(s);
					return isNaN(t) ? 0 : t;
				};

				let valA = a[col] ?? a[String(col).toLowerCase()] ?? '';
				let valB = b[col] ?? b[String(col).toLowerCase()] ?? '';

				if (String(col).toUpperCase().includes('DATE')) {
					valA = toTime(valA);
					valB = toTime(valB);
				} else {
					valA = String(valA).toUpperCase();
					valB = String(valB).toUpperCase();
				}

				if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
				if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
				return 0;
			});

		}

		// 2) 페이징 계산
		totalStorageUnreceivedCount = unreceivedAllData.length;
		totalStorageUnreceivedPages = Math.ceil(totalStorageUnreceivedCount / storageUnreceivedItemsPerPage) || 1;

		const startIndex = (currentStorageUnreceivedPage - 1) * storageUnreceivedItemsPerPage;
		const endIndex = startIndex + storageUnreceivedItemsPerPage;

		globalStorageUnreceivedData = unreceivedAllData.slice(startIndex, endIndex);
		filteredStorageUnreceivedData = globalStorageUnreceivedData;
	}



	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		// ✅ 정렬 대상은 "미수령 전체 데이터"
		unreceivedAllData.sort((a, b) => {
			let valA = a[column] ?? a[column.toLowerCase()] ?? '';
			let valB = b[column] ?? b[column.toLowerCase()] ?? '';

			if (dataType === 'number') {
				// ✅ TOQTY는 무조건 SCANQTY + SCANQTY2 기준
				if (column === 'TOQTY') {
					valA = calcQuantities(a).scanQtySum;
					valB = calcQuantities(b).scanQtySum;
				}
				// ✅ FROMQTY(또는 QTY)는 calcQuantities의 qty 기준
				else if (column === 'FROMQTY' || column === 'QTY') {
					valA = calcQuantities(a).qty;
					valB = calcQuantities(b).qty;
				}
				else {
					valA = parseFloat(valA) || 0;
					valB = parseFloat(valB) || 0;
				}
			}

			if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
			if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		currentStorageUnreceivedPage = 1;

		// ✅ 정렬된 unreceivedAllData 기준으로 페이징만 다시 자르기
		const startIndex = (currentStorageUnreceivedPage - 1) * storageUnreceivedItemsPerPage;
		const endIndex = startIndex + storageUnreceivedItemsPerPage;

		globalStorageUnreceivedData = unreceivedAllData.slice(startIndex, endIndex);
		filteredStorageUnreceivedData = globalStorageUnreceivedData;

		renderStorageUnreceivedTableData();
		renderStorageUnreceivedPagination();
		updateStorageUnreceivedTotalCount();

		updateSortIndicators(column);
	}


	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updateStorageUnreceivedTotalCount() {
		$('#storageUnreceivedTotalCount').text(
			Number(totalStorageUnreceivedCount).toLocaleString()
		);
		$('#storageUnreceivedCurrentPageInfo').text(currentStorageUnreceivedPage);
		$('#storageUnreceivedTotalPageInfo').text(totalStorageUnreceivedPages);
		// 🔽 총수량 표시 갱신
		updateTotalQty();
	}

	function renderStorageUnreceivedTableData() {
		let tableBody = '';

		for (let i = 0; i < globalStorageUnreceivedData.length; i++) {
			const data = globalStorageUnreceivedData[i];

			// 공통 수량 계산
			const { qty, scanQtySum } = calcQuantities(data);

			// 🔹 이미 applyClientPagination 에서 미수령건만 필터링됨
			//     여기서는 단순히 렌더만 하면 됨
			const rowNumber =
				(currentStorageUnreceivedPage - 1) *
				storageUnreceivedItemsPerPage +
				(i + 1);

			tableBody += `
                <tr>
                    <td class="noVal">${rowNumber}</td>
                    <td class="storageVal">${data.SENTSTORAGE || data.sentstorage || ''}</td>
                    <td class="shortSet_2">${data.SENTDATE || data.sentdate || ''}</td>
                    <td class="storageVal">${data.TOSTORAGE || data.tostorage || ''}</td>
                    <td class="carVal">${data.CAR || data.car || ''}</td>
                    <td class="itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                    <td class="cnameVal">${data.OITEMCODE || data.oitemcode || ''}</td>
                    <td class="itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
                    <td class="unpackqtyVal">${qty.toLocaleString()}</td>
                    <td class="unpackqtyVal">${scanQtySum.toLocaleString()}</td>
                    <td class="barcodeVal">${data.BARCODE || data.barcode || ''}</td>
                </tr>
            `;
		}

		$('#storageUnreceivedTableBody').html(tableBody);
	}

	// 🔹 엑셀용 데이터 생성 (화면과 동일 조건: 미수령건만, TOQTY = SCANQTY + SCANQTY2)
	function buildStorageUnreceivedExcelData(sourceRows) {
		// 서버에서 새로 받은 records 를 쓰되, 없으면 unreceivedAllData 사용
		const baseRows = sourceRows || unreceivedAllData || [];
		const result = [];

		for (let i = 0; i < baseRows.length; i++) {
			const row = baseRows[i];
			const { qty, scanQtySum, diff } = calcQuantities(row);

			// 화면과 동일하게 "미수령건만"
			if (diff === 0) continue;

			result.push({
				SENTSTORAGE: row.SENTSTORAGE ?? row.sentstorage ?? '',
				SENTDATE: row.SENTDATE ?? row.sentdate ?? '',
				TOSTORAGE: row.TOSTORAGE ?? row.tostorage ?? '',
				CAR: row.CAR ?? row.car ?? '',
				ITEMCODE: row.ITEMCODE ?? row.itemcode ?? '',
				OITEMCODE: row.OITEMCODE ?? row.oitemcode ?? '',
				ITEMNAME: row.ITEMNAME ?? row.itemname ?? '',
				QTY: qty, // Sent Qty
				TOQTY: scanQtySum, // Receive Qty = SCANQTY + SCANQTY2
				BARCODE: row.BARCODE ?? row.barcode ?? ''
			});
		}

		return result;
	}

	function renderStorageUnreceivedPagination() {
		let paginationHtml = '';

		if (currentStorageUnreceivedPage > 1) {
			paginationHtml += `<button class="storageUnreceived-page-btn" data-page="${currentStorageUnreceivedPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="storageUnreceived-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentStorageUnreceivedPage - 5);
		let endPage = Math.min(totalStorageUnreceivedPages, currentStorageUnreceivedPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="storageUnreceived-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStorageUnreceivedPage) {
				paginationHtml += `<button class="storageUnreceived-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="storageUnreceived-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalStorageUnreceivedPages) {
			if (endPage < totalStorageUnreceivedPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="storageUnreceived-page-btn" data-page="${totalStorageUnreceivedPages}">${totalStorageUnreceivedPages}</button>`;
		}

		if (currentStorageUnreceivedPage < totalStorageUnreceivedPages) {
			paginationHtml += `<button class="storageUnreceived-page-btn" data-page="${currentStorageUnreceivedPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="storageUnreceived-page-btn disabled">&gt;</button>`;
		}

		$('#storageUnreceivedPaginationContainer').html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		//const savedFactory = getCookie('selectedFactory');
		const storage = $('#storageUnreceived_searchVal_storage');

		// ✅ 기존 선택값 유지
		const prevSelected = storage.val();

		storage.empty();

		const storageList = [
			'INBOUND', 'PRODUCT', 'OUTSIDE', 'all'
		];

		storageList.forEach((item) => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		// ✅ 기존 선택값이 유효하면 유지, 아니면 all
		if (prevSelected && storage.find(`option[value="${prevSelected}"]`).length) {
			storage.val(prevSelected);
		} else {
			storage.val('all');
		}
	}

	// ============================================================
	// ✅ 뷰 렌더링 함수 - IIFE 내부
	// ============================================================
	function renderStorageUnreceivedView() {
		const savedFactory = getCookie('selectedFactory');

		let content_output = `
        <div class="divBlockControl" id="view_mPurchase_storage_unreceived">
            <div class="content-body">
                <!-- 검색 영역 -->
                <div class="search-area">
                    <div class="search-row">
                        <div class="search-label">
                            <div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
                            <input type="date" id="storageUnreceived_searchVal_fromDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_toDate">　</div>
                            <input type="date" id="storageUnreceived_searchVal_toDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_storage">${i18n.t('search.sentstorage')}</div>
                            <select id="storageUnreceived_searchVal_storage">
                                <!-- 동적으로 추가 -->
                            </select>
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
                            <input type="text" id="storageUnreceived_searchVal_itemcode" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_oitemcode">${i18n.t('search.customercode')}</div>
                            <input type="text" id="storageUnreceived_searchVal_oitemcode" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
                            <input type="text" id="storageUnreceived_searchVal_itemname" />
                        </div>
                    </div>
                    <div class="search_button_area">
                        <button class="btn btn-primary btnStorageUnreceivedSearch">${i18n.t('btn.search')}</button>
                        <button class="btn btn-secondary btnStorageUnreceivedSearchInit">${i18n.t('btn.clear')}</button>
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
                            <strong id="storageUnreceivedTotalCount">${totalStorageUnreceivedCount}</strong>
                            ${i18n.t('table.info.records')}
                            |
                            ${i18n.t('table.page')}
                            <strong id="storageUnreceivedCurrentPageInfo">${currentStorageUnreceivedPage}</strong> /
                            <strong id="storageUnreceivedTotalPageInfo">${totalStorageUnreceivedPages}</strong>
                            |
                            ${i18n.t('search.qty.out')}
                            <strong id="storageUnreceivedTotalFromQty">0</strong>
                            |
                            ${i18n.t('search.qty.scan')}
                            <strong id="storageUnreceivedTotalToQty">0</strong>
                        </span>
                        <div class="action-buttons-right mPurchase_storage_unreceived">
                            <div id="defaultActions" class="action-group">
                                <button class="btn btn-success" id="storageUnreceivedExcelBtn" onclick="window.downloadAllStorageUnreceivedData_internal()">Excel</button>
                            </div>
                        </div>
                    </div>

                    <table class="data-table mPurchase_storage_unreceived" id="storageUnreceivedTable">
                        <thead>
                            <tr>
                                <th class="noVal">${i18n.t('table.no')}</th>
                                <th class="storageVal" data-sort="SENTSTORAGE" data-type="string">${i18n.t('search.sentstorage')}</th>
                                <th class="shortSet_2" data-sort="SENTDATE" data-type="date">${i18n.t('search.sentdate')}</th>
                                <th class="storageVal" data-sort="TOSTORAGE" data-type="string">${i18n.t('search.receivestorage')}</th>
                                <th class="carVal" data-sort="CAR" data-type="string">${i18n.t('search.car')}</th>
                                <th class="itemcodeVal" data-sort="ITEMCODE" data-type="string">${i18n.t('search.itemCode')}</th>
                                <th class="cnameVal" data-sort="OITEMCODE" data-type="string">${i18n.t('search.customercode')}</th>
                                <th class="itemnameVal" data-sort="ITEMNAME" data-type="string">${i18n.t('search.itemName')}</th>
                                <th class="unpackqtyVal" data-sort="FROMQTY" data-type="number">${i18n.t('search.qty.out')}</th>
                                <th class="unpackqtyVal" data-sort="TOQTY" data-type="number">${i18n.t('search.qty.scan')}</th>
                                <th class="barcodeVal" data-sort="BARCODE" data-type="string">LOT</th>
                            </tr>
                        </thead>
                        <tbody id="storageUnreceivedTableBody">
                        </tbody>
                    </table>

                    <!-- 페이지네이션 -->
                    <div class="pagination" id="storageUnreceivedPaginationContainer"></div>

                    <div class="items-per-page-selector">
                        <label for="storageUnreceived_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
                        <select id="storageUnreceived_itemsPerPage" class="items-per-page-select">
                            <option value="100" selected>100</option>
                            <option value="300">300</option>
                            <option value="1000">1000</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;

		$('.w_contentArea').append(content_output);

		// 화면에 기본 날짜 세팅
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$('#storageUnreceived_searchVal_toDate').val(toDate);
			$('#storageUnreceived_searchVal_fromDate').val(fromDate);
			$('#storageUnreceived_itemsPerPage').val(storageUnreceivedItemsPerPage);
			console.log('🎯 Select 초기값 설정됨:', storageUnreceivedItemsPerPage);
		})();

		renderFactoryStorage();
		renderStorageUnreceivedTableData();
		renderStorageUnreceivedPagination();
		bindStorageUnreceivedEvents();
		updateStorageUnreceivedTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindStorageUnreceivedEvents() {
		// 검색 버튼
		$('.btnStorageUnreceivedSearch')
			.off('click')
			.on('click', function() {
				handleStorageUnreceivedSearch();
			});

		// 초기화 버튼
		$('.btnStorageUnreceivedSearchInit')
			.off('click')
			.on('click', function() {
				handleStorageUnreceivedSearchInit();
			});

		// 페이지당 항목 수 변경
		$('#storageUnreceived_itemsPerPage')
			.off('change')
			.on('change', function() {
				const newItemsPerPage = parseInt($(this).val());
				handleChangeStorageUnreceivedItemsPerPage(newItemsPerPage);
			});

		// 페이지네이션 버튼
		$(document)
			.off('click', '.storageUnreceived-page-btn')
			.on('click', '.storageUnreceived-page-btn', function() {
				if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
					const page = parseInt($(this).data('page'));
					if (page && page > 0) {
						handlePageChange(page);
					}
				}
			});

		// 헤더 정렬
		$('#storageUnreceivedTable thead th[data-sort]')
			.off('click')
			.on('click', function() {
				const column = $(this).data('sort');
				const dataType = $(this).data('type') || 'string';
				handleSort(column, dataType);
			});

		// 엔터키 검색
		$('#view_mPurchase_storage_unreceived input[type="text"], #view_mPurchase_storage_unreceived input[type="date"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) {
					handleStorageUnreceivedSearch();
				}
			});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleStorageUnreceivedSearch() {
		const searchCriteria = getCurrentSearchCriteria();
		console.log('검색 조건:', searchCriteria);

		currentStorageUnreceivedPage = 1;
		performStorageUnreceivedDBSearch(searchCriteria);
	}

	function handleStorageUnreceivedSearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		$('#storageUnreceived_searchVal_fromDate').val(fromDate);
		$('#storageUnreceived_searchVal_toDate').val(toDate);
		$('#storageUnreceived_searchVal_itemcode').val('');
		$('#storageUnreceived_searchVal_oitemcode').val('');
		$('#storageUnreceived_searchVal_itemname').val('');

		renderFactoryStorage();
		const storage = 'all';   // ✅ 기본값

		currentStorageUnreceivedPage = 1;
		performStorageUnreceivedDBSearch({ storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}


	function handlePageChange(page) {
		currentStorageUnreceivedPage = page;
		applyClientPagination();
		renderStorageUnreceivedTableData();
		renderStorageUnreceivedPagination();
		updateStorageUnreceivedTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeStorageUnreceivedItemsPerPage(newItemsPerPage) {
		storageUnreceivedItemsPerPage = newItemsPerPage;
		currentStorageUnreceivedPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		// ✅ UI도 동기화
		$('#storageUnreceived_itemsPerPage').val(newItemsPerPage);

		applyClientPagination();
		renderStorageUnreceivedTableData();
		renderStorageUnreceivedPagination();
		updateStorageUnreceivedTotalCount();
	}


	function updateTotalQty() {
		let sumFrom = 0; // 보낸 수량 합계
		let sumTo = 0; // 받은 수량 합계 (SCANQTY + SCANQTY2)

		// 🔹 전체 "미수령" 데이터 기준으로 합계
		(unreceivedAllData || []).forEach((row) => {
			const { qty, scanQtySum, diff } = calcQuantities(row);

			if (diff !== 0) {
				sumFrom += qty;
				sumTo += scanQtySum;
			}
		});

		$('#storageUnreceivedTotalFromQty').text(sumFrom.toLocaleString());
		$('#storageUnreceivedTotalToQty').text(sumTo.toLocaleString());
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// 메인 호출 함수
	window.call_mPurchase_storage_unreceived = function(menuId) {
		function internalInit() {
			showLoading('data');
			const { fromDate, toDate } = getDefaultDateRange();
			const storage = 'all';

			performStorageUnreceivedDBSearch({ fromDate, toDate, storage });
		}
		internalInit();
	};

	// 엑셀 다운로드 (✅ 화면 정렬/필터 그대로 내보내기)
	window.downloadAllStorageUnreceivedData_internal = function() {
		function internalDownload() {
			// 🔹 현재 메모리에 있는 “미수령 전체 데이터” 사용
			//    - 정렬/검색/필터 반영된 상태 (unreceivedAllData)
			const excelData = buildStorageUnreceivedExcelData(unreceivedAllData);

			ExcelExporter.downloadExcel(excelData, storageUnreceivedColumns, {
				fileName: 'storageUnreceived_All',
				sheetName: 'storageUnreceived'
			});
		}

		internalDownload();
	};


	// 데이터 내보내기
	window.exportStorageUnreceivedData = function() {
		function internalExport() {
			return {
				total: unreceivedAllData.length,
				currentPage: currentStorageUnreceivedPage,
				itemsPerPage: storageUnreceivedItemsPerPage,
				data: unreceivedAllData
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeStorageUnreceivedItemsPerPage = function(newItemsPerPage) {
		function internalChange() {
			handleChangeStorageUnreceivedItemsPerPage(newItemsPerPage);
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