/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 미수령 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];
	let filteredData_purchaseFactoryUnreceivedWorkMove = [];
	let globalfactoryUnreceivedWorkMoveData = [];
	let unreceivedAllData = []; // 🔹 미수령 전체 데이터

	let currentfactoryUnreceivedWorkMovePage = 1;
	let factoryUnreceivedWorkMoveItemsPerPage = 100;
	let totalfactoryUnreceivedWorkMoveCount = 0;
	let totalfactoryUnreceivedWorkMovePages = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;

	// ✅ 전역 데이터
	let filteredfactoryUnreceivedWorkMoveData = [];
	let factoryUnreceivedWorkMoveColumns = [
		{ key: 'SENTFACTORY', header: 'Sent Factory' },
		{ key: 'SENTSTORAGE', header: 'Sent Storage' },
		{ key: 'SENTDATE', header: 'Sent Date' },
		{ key: 'WCCODE', header: 'Receive Work Shop', formatter: (val) => val?.split('-')[1] || '' },
		{ key: 'WCCODE_SUFFIX', header: 'Receiving Location' },
		{ key: 'RECEIVEDATE', header: 'Receive Date' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
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
		const qty = Number(row.QTY ?? row.qty ?? row.FROMQTY ?? row.fromqty ?? 0) || 0;
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
			fromDate: $('#factoryUnreceivedWorkMove_searchVal_fromDate').val(),
			toDate: $('#factoryUnreceivedWorkMove_searchVal_toDate').val(),
			factory: $('#factoryUnreceivedWorkMove_searchVal_factory').val(),
			storage: $('#factoryUnreceivedWorkMove_searchVal_storage').val(),
			workCenter: $('#factoryUnreceivedWorkMove_searchVal_receiveWorkCenter').val(),
			itemcode: ($('#factoryUnreceivedWorkMove_searchVal_itemcode').val() || '').trim().toUpperCase(),
			itemname: ($('#factoryUnreceivedWorkMove_searchVal_itemname').val() || '').trim().toUpperCase()
		};
	}

	function performfactoryUnreceivedWorkMoveDBSearch(searchCriteria) {
		showLoading('data');

		$.ajax({
			url: '/read_workMoveUnreceived',
			type: 'POST',
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: 'application/json',
			success: function(response) {
				console.log('-- DB 조회 결과 (전체) --');
				console.log(response);

				allServerData = response.records || [];
				filteredData_purchaseFactoryUnreceivedWorkMove = [...allServerData];
				totalQty = response.totalQty || 0;

				currentfactoryUnreceivedWorkMovePage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mPurchase_factory_unreceived_workMove').length) {
					renderfactoryUnreceivedWorkMoveView();
				} else {
					renderfactoryUnreceivedWorkMoveTableData();
					renderfactoryUnreceivedWorkMovePagination();
					updatefactoryUnreceivedWorkMoveTotalCount();
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
	// ✅ 현재 선택된 정렬을 unreceivedAllData에 다시 적용 (페이지 이동/검색 후에도 정렬 유지)
	// ✅ 현재 선택된 정렬을 unreceivedAllData에 다시 적용 (페이지 이동/검색 후에도 정렬 유지)
	function applyCurrentSortIfNeeded() {
		if (!currentSortColumn) return;

		const isDate = String(currentSortColumn).toUpperCase().includes('DATE');

		unreceivedAllData.sort((a, b) => {
			let valA = a[currentSortColumn] ?? a[String(currentSortColumn).toLowerCase()] ?? '';
			let valB = b[currentSortColumn] ?? b[String(currentSortColumn).toLowerCase()] ?? '';

			// ✅ 1) DATE 컬럼이면 date 비교로 "확정"
			if (isDate) {
				const timeA = new Date(String(valA).replace(' ', 'T')).getTime() || 0;
				const timeB = new Date(String(valB).replace(' ', 'T')).getTime() || 0;

				if (timeA < timeB) return currentSortOrder === 'asc' ? -1 : 1;
				if (timeA > timeB) return currentSortOrder === 'asc' ? 1 : -1;
				return 0;
			}

			// ✅ 2) DATE가 아니면 숫자 우선, 아니면 문자열
			const numA = parseFloat(valA);
			const numB = parseFloat(valB);
			const bothNumber = !isNaN(numA) && !isNaN(numB);

			if (bothNumber) {
				if (numA < numB) return currentSortOrder === 'asc' ? -1 : 1;
				if (numA > numB) return currentSortOrder === 'asc' ? 1 : -1;
				return 0;
			}

			const strA = String(valA).toUpperCase();
			const strB = String(valB).toUpperCase();

			if (strA < strB) return currentSortOrder === 'asc' ? -1 : 1;
			if (strA > strB) return currentSortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}




	// ============================================================
	// ✅ 페이징/정렬 함수 - IIFE 내부
	// ============================================================
	function applyClientPagination() {
		factoryUnreceivedWorkMoveItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		// 🔹 1) 전체 검색 결과에서 "미수령건만" 필터링
		const baseRows = filteredData_purchaseFactoryUnreceivedWorkMove || [];
		unreceivedAllData = baseRows.filter((row) => {
			const { diff } = calcQuantities(row);
			return diff !== 0;
		});

		applyCurrentSortIfNeeded(); // ✅ 추가

		// 🔹 2) 미수령 리스트 기준으로 총 건수/페이지 수 계산
		totalfactoryUnreceivedWorkMoveCount = unreceivedAllData.length;
		totalfactoryUnreceivedWorkMovePages =
			Math.ceil(totalfactoryUnreceivedWorkMoveCount / factoryUnreceivedWorkMoveItemsPerPage) || 1;

		const startIndex =
			(currentfactoryUnreceivedWorkMovePage - 1) * factoryUnreceivedWorkMoveItemsPerPage;
		const endIndex = startIndex + factoryUnreceivedWorkMoveItemsPerPage;

		// 🔹 3) 현재 페이지에 보여줄 미수령 데이터
		globalfactoryUnreceivedWorkMoveData = unreceivedAllData.slice(startIndex, endIndex);
		filteredfactoryUnreceivedWorkMoveData = globalfactoryUnreceivedWorkMoveData;
	}

	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		else { currentSortColumn = column; currentSortOrder = 'asc'; }

		currentfactoryUnreceivedWorkMovePage = 1;

		// ✅ 페이징 함수가: (미수령필터 + 현재정렬 + slice) 까지 다 처리
		applyClientPagination();

		renderfactoryUnreceivedWorkMoveTableData();
		renderfactoryUnreceivedWorkMovePagination();
		updatefactoryUnreceivedWorkMoveTotalCount();
		updateSortIndicators(column);
	}



	function updateSortIndicators(column) {
		const $view = $('#view_mPurchase_factory_unreceived_workMove');
		$view.find('.data-table thead th').removeClass('sort-asc sort-desc');
		$view.find(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}


	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatefactoryUnreceivedWorkMoveTotalCount() {
		$('#factoryUnreceivedWorkMoveTotalCount').text(
			Number(totalfactoryUnreceivedWorkMoveCount).toLocaleString()
		);
		$('#factoryUnreceivedWorkMoveCurrentPageInfo').text(currentfactoryUnreceivedWorkMovePage);
		$('#factoryUnreceivedWorkMoveTotalPageInfo').text(totalfactoryUnreceivedWorkMovePages);
		// 🔽 총수량 표시 갱신
		updateTotalQty();
	}

	function renderfactoryUnreceivedWorkMoveTableData() {
		let tableBody = '';

		for (let i = 0; i < globalfactoryUnreceivedWorkMoveData.length; i++) {
			const data = globalfactoryUnreceivedWorkMoveData[i];

			// 공통 수량 계산
			const { qty, scanQtySum } = calcQuantities(data);

			// 🔹 이미 applyClientPagination 에서 미수령건만 필터링됨
			//     여기서는 단순히 렌더만 하면 됨
			const rowNumber =
				(currentfactoryUnreceivedWorkMovePage - 1) *
				factoryUnreceivedWorkMoveItemsPerPage +
				(i + 1);

			const wccode = data.WCCODE || data.wccode || '';
			const receiveWorkCenter = wccode ? wccode.split('-')[1] : '';

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
                    <td class="unpackqtyVal">${qty.toLocaleString()}</td>
                    <td class="unpackqtyVal">${scanQtySum.toLocaleString()}</td>
                    <td class="barcodeVal">${data.BARCODE || data.barcode || ''}</td>
                </tr>
            `;
		}

		$('#factoryUnreceivedWorkMoveTableBody').html(tableBody);
	}

	// 🔹 엑셀용 데이터 생성 (화면과 동일 조건: 미수령건만, TOQTY = SCANQTY + SCANQTY2)
	function buildfactoryUnreceivedWorkMoveExcelData(sourceRows) {
		const baseRows = sourceRows || unreceivedAllData || [];
		const result = [];

		for (let i = 0; i < baseRows.length; i++) {
			const row = baseRows[i];
			const { qty, scanQtySum, diff } = calcQuantities(row);

			// 화면과 동일하게 "미수령건만"
			if (diff === 0) continue;

			result.push({
				SENTFACTORY: row.SENTFACTORY ?? row.sentfactory ?? '',
				SENTSTORAGE: row.SENTSTORAGE ?? row.sentstorage ?? '',
				SENTDATE: row.SENTDATE ?? row.sentdate ?? '',
				WCCODE: row.WCCODE ?? row.wccode ?? '',
				WCCODE_SUFFIX: row.WCCODE_SUFFIX ?? row.wccode_suffix ?? '',
				RECEIVEDATE: row.RECEIVEDATE ?? row.receivedate ?? '',
				CAR: row.CAR ?? row.car ?? '',
				ITEMCODE: row.ITEMCODE ?? row.itemcode ?? '',
				ITEMNAME: row.ITEMNAME ?? row.itemname ?? '',
				QTY: qty,
				TOQTY: scanQtySum,
				BARCODE: row.BARCODE ?? row.barcode ?? ''
			});
		}

		return result;
	}

	// ✅ 전역 제거용: 로컬 엑셀 다운로드 함수
	function downloadFactoryUnreceivedWorkMoveExcel() {
		try {
			// 현재 메모리의 “미수령 전체 데이터” (정렬/검색 반영된 상태)
			const excelData = buildfactoryUnreceivedWorkMoveExcelData(unreceivedAllData);

			console.log("EXCEL rows =", excelData.length);
			if (!Array.isArray(excelData) || excelData.length === 0) {
				alert("다운로드할 데이터가 없습니다.");
				return;
			}

			ExcelExporter.downloadExcel(excelData, factoryUnreceivedWorkMoveColumns, {
				fileName: 'factoryUnreceivedWorkMove_All',
				sheetName: 'factoryUnreceivedWorkMove'
			});
		} catch (e) {
			console.error("Excel download error:", e);
			alert("엑셀 다운로드 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
		}
	}

	function renderfactoryUnreceivedWorkMovePagination() {
		let paginationHtml = '';

		if (currentfactoryUnreceivedWorkMovePage > 1) {
			paginationHtml += `<button class="factoryUnreceivedWorkMove-page-btn" data-page="${currentfactoryUnreceivedWorkMovePage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryUnreceivedWorkMove-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentfactoryUnreceivedWorkMovePage - 5);
		let endPage = Math.min(totalfactoryUnreceivedWorkMovePages, currentfactoryUnreceivedWorkMovePage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="factoryUnreceivedWorkMove-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentfactoryUnreceivedWorkMovePage) {
				paginationHtml += `<button class="factoryUnreceivedWorkMove-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryUnreceivedWorkMove-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalfactoryUnreceivedWorkMovePages) {
			if (endPage < totalfactoryUnreceivedWorkMovePages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryUnreceivedWorkMove-page-btn" data-page="${totalfactoryUnreceivedWorkMovePages}">${totalfactoryUnreceivedWorkMovePages}</button>`;
		}

		if (currentfactoryUnreceivedWorkMovePage < totalfactoryUnreceivedWorkMovePages) {
			paginationHtml += `<button class="factoryUnreceivedWorkMove-page-btn" data-page="${currentfactoryUnreceivedWorkMovePage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryUnreceivedWorkMove-page-btn disabled">&gt;</button>`;
		}

		$('#factoryUnreceivedWorkMovePaginationContainer').html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		//const savedFactory = getCookie('selectedFactory');
		const factory = $('#factoryUnreceivedWorkMove_searchVal_factory');
		const storage = $('#factoryUnreceivedWorkMove_searchVal_storage');

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

			const storageList = [
				'Material',
				'Fabric',
				'Side seat',
				'Outside',
				'PRODUCT',
				'all'
			];

			storageList.forEach((item) => {
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
	function renderfactoryUnreceivedWorkMoveView() {
		const savedFactory = getCookie('selectedFactory');

		let content_output = `
        <div class="divBlockControl" id="view_mPurchase_factory_unreceived_workMove">
            <div class="content-body">
                <!-- 검색 영역 -->
                <div class="search-area">
                    <div class="search-row">
                        <div class="search-label">
                            <div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
                            <input type="date" id="factoryUnreceivedWorkMove_searchVal_fromDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_toDate">　</div>
                            <input type="date" id="factoryUnreceivedWorkMove_searchVal_toDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_factory">${i18n.t('search.sentfactory')}</div>
                            <select id="factoryUnreceivedWorkMove_searchVal_factory">
                                <!-- 동적으로 추가 -->
                            </select>
                        </div>
                        <div class="search-label">
                            <div class="searchVal_storage">${i18n.t('search.sentstorage')}</div>
                            <select id="factoryUnreceivedWorkMove_searchVal_storage">
                                <!-- 동적으로 추가 -->
                            </select>
                        </div>
                        <div class="search-label">
                            <div class="searchVal_receiveWorkCenter">${i18n.t('search.receiveworkcenter')}</div>
                            <select id="factoryUnreceivedWorkMove_searchVal_receiveWorkCenter">
                                <option value="H/REST">H/REST</option>
                            </select>
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
                            <input type="text" id="factoryUnreceivedWorkMove_searchVal_itemcode" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
                            <input type="text" id="factoryUnreceivedWorkMove_searchVal_itemname" />
                        </div>
                    </div>
                    <div class="search_button_area">
                        <button class="btn btn-primary btnFactoryUnreceivedWorkMoveSearch">${i18n.t('btn.search')}</button>
                        <button class="btn btn-secondary btnFactoryUnreceivedWorkMoveSearchInit">${i18n.t('btn.clear')}</button>
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
                            <strong id="factoryUnreceivedWorkMoveTotalCount">${totalfactoryUnreceivedWorkMoveCount}</strong>
                            ${i18n.t('table.info.records')}
                            |
                            ${i18n.t('table.page')}
                            <strong id="factoryUnreceivedWorkMoveCurrentPageInfo">${currentfactoryUnreceivedWorkMovePage}</strong> /
                            <strong id="factoryUnreceivedWorkMoveTotalPageInfo">${totalfactoryUnreceivedWorkMovePages}</strong>
                            |
                            ${i18n.t('search.qty.out')}
                            <strong id="factoryUnreceivedWorkMoveTotalFromQty">0</strong>
                            |
                            ${i18n.t('search.qty.scan')}
                            <strong id="factoryUnreceivedWorkMoveTotalToQty">0</strong>
                        </span>
                        <div class="action-buttons-right mPurchase_factory_unreceived_workMove">
                            <div id="defaultActions" class="action-group">
                                <button class="btn btn-success" id="factoryUnreceivedWorkMoveExcelBtn">Excel</button>
                            </div>
                        </div>
                    </div>

                    <table class="data-table mPurchase_factory_unreceived_workMove" id="factoryUnreceivedWorkMoveTable">
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
                                <th class="unpackqtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty.out')}</th>
                                <th class="unpackqtyVal" data-sort="TOQTY" data-type="number">${i18n.t('search.qty.scan')}</th>
                                <th class="barcodeVal" data-sort="BARCODE" data-type="string">LOT</th>
                            </tr>
                        </thead>
                        <tbody id="factoryUnreceivedWorkMoveTableBody">
                        </tbody>
                    </table>

                    <!-- 페이지네이션 -->
                    <div class="pagination" id="factoryUnreceivedWorkMovePaginationContainer"></div>

                    <div class="items-per-page-selector">
                        <label for="factoryUnreceivedWorkMove_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
                        <select id="factoryUnreceivedWorkMove_itemsPerPage" class="items-per-page-select">
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
			$('#factoryUnreceivedWorkMove_searchVal_toDate').val(toDate);
			$('#factoryUnreceivedWorkMove_searchVal_fromDate').val(fromDate);
			$('#factoryUnreceivedWorkMove_searchVal_factory').val(savedFactory || 'all');
			$('#factoryUnreceivedWorkMove_itemsPerPage').val(factoryUnreceivedWorkMoveItemsPerPage);
			console.log('🎯 Select 초기값 설정됨:', factoryUnreceivedWorkMoveItemsPerPage);
		})();

		renderFactoryStorage();
		renderfactoryUnreceivedWorkMoveTableData();
		renderfactoryUnreceivedWorkMovePagination();
		bindfactoryUnreceivedWorkMoveEvents();
		updatefactoryUnreceivedWorkMoveTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindfactoryUnreceivedWorkMoveEvents() {
		const $view = $('#view_mPurchase_factory_unreceived_workMove');

		// ✅ 엑셀 버튼 (전역/onclick 제거)
		$view.off('click', '#factoryUnreceivedWorkMoveExcelBtn')
			.on('click', '#factoryUnreceivedWorkMoveExcelBtn', function() {
				downloadFactoryUnreceivedWorkMoveExcel();
			});

		// 검색 버튼
		$view.off('click', '.btnFactoryUnreceivedWorkMoveSearch')
			.on('click', '.btnFactoryUnreceivedWorkMoveSearch', function() {
				handleFactoryUnreceivedWorkMoveSearch();
			});

		// 초기화 버튼
		$view.off('click', '.btnFactoryUnreceivedWorkMoveSearchInit')
			.on('click', '.btnFactoryUnreceivedWorkMoveSearchInit', function() {
				handleFactoryUnreceivedWorkMoveSearchInit();
			});

		// 페이지당 항목 수 변경
		$view.off('change', '#factoryUnreceivedWorkMove_itemsPerPage')
			.on('change', '#factoryUnreceivedWorkMove_itemsPerPage', function() {
				const newItemsPerPage = parseInt($(this).val(), 10);
				handleChangeFactoryUnreceivedWorkMoveItemsPerPage(newItemsPerPage);
			});

		// 페이지네이션 버튼 (✅ document → $view)
		$view.off('click', '.factoryUnreceivedWorkMove-page-btn')
			.on('click', '.factoryUnreceivedWorkMove-page-btn', function() {
				if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;
				const page = parseInt($(this).data('page'), 10);
				if (page && page > 0) handlePageChange(page);
			});

		// 헤더 정렬 (✅ 전역 선택자 → $view 범위)
		$view.off('click', '#factoryUnreceivedWorkMoveTable thead th[data-sort]')
			.on('click', '#factoryUnreceivedWorkMoveTable thead th[data-sort]', function() {
				const column = $(this).data('sort');
				const dataType = $(this).data('type') || 'string';
				handleSort(column, dataType);
			});

		// 엔터키 검색 (✅ $view 범위)
		$view.off('keypress', 'input[type="text"], input[type="date"]')
			.on('keypress', 'input[type="text"], input[type="date"]', function(e) {
				if (e.which === 13) handleFactoryUnreceivedWorkMoveSearch();
			});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleFactoryUnreceivedWorkMoveSearch() {
		const searchCriteria = getCurrentSearchCriteria();
		console.log('검색 조건:', searchCriteria);

		currentfactoryUnreceivedWorkMovePage = 1;
		performfactoryUnreceivedWorkMoveDBSearch(searchCriteria);
	}

	function handleFactoryUnreceivedWorkMoveSearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = 'SALTILLO'; // ✅ 고정값
		const storage = 'Material'; // ✅ 기본값

		$('#factoryUnreceivedWorkMove_searchVal_fromDate').val(fromDate);
		$('#factoryUnreceivedWorkMove_searchVal_toDate').val(toDate);
		$('#factoryUnreceivedWorkMove_searchVal_factory').val(factory);
		$('#factoryUnreceivedWorkMove_searchVal_itemcode').val('');
		$('#factoryUnreceivedWorkMove_searchVal_itemname').val('');

		renderFactoryStorage();

		currentfactoryUnreceivedWorkMovePage = 1;
		performfactoryUnreceivedWorkMoveDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function handlePageChange(page) {
		currentfactoryUnreceivedWorkMovePage = page;
		applyClientPagination();
		renderfactoryUnreceivedWorkMoveTableData();
		renderfactoryUnreceivedWorkMovePagination();
		updatefactoryUnreceivedWorkMoveTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeFactoryUnreceivedWorkMoveItemsPerPage(newItemsPerPage) {
		factoryUnreceivedWorkMoveItemsPerPage = newItemsPerPage;
		currentfactoryUnreceivedWorkMovePage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderfactoryUnreceivedWorkMoveTableData();
		renderfactoryUnreceivedWorkMovePagination();
		updatefactoryUnreceivedWorkMoveTotalCount();
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

		$('#factoryUnreceivedWorkMoveTotalFromQty').text(sumFrom.toLocaleString());
		$('#factoryUnreceivedWorkMoveTotalToQty').text(sumTo.toLocaleString());
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// 메인 호출 함수
	window.call_mPurchase_factory_unreceived_workMove = function(menuId) {
		function internalInit() {
			showLoading('data');
			const { fromDate, toDate } = getDefaultDateRange();
			const factory = 'SALTILLO'; // ✅ 고정
			const storage = 'Material';
			console.log('FACTORY - ' + factory);
			performfactoryUnreceivedWorkMoveDBSearch({ fromDate, toDate, factory, storage });
		}
		internalInit();
	};

	// 데이터 내보내기
	window.exportfactoryUnreceivedWorkMoveData = function() {
		function internalExport() {
			return {
				total: unreceivedAllData.length,
				currentPage: currentfactoryUnreceivedWorkMovePage,
				itemsPerPage: factoryUnreceivedWorkMoveItemsPerPage,
				data: unreceivedAllData
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeFactoryUnreceivedWorkMoveItemsPerPage = function(newItemsPerPage) {
		function internalChange() {
			handleChangeFactoryUnreceivedWorkMoveItemsPerPage(newItemsPerPage);
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
