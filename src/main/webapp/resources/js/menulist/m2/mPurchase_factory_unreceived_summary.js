/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 미수령 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];
	let filteredData_purchaseFactoryUnreceivedSummary = [];
	let globalfactoryUnreceivedSummaryData = [];
	let unreceivedAllData = []; // 🔹 미수령 전체 데이터

	let currentfactoryUnreceivedSummaryPage = 1;
	let factoryUnreceivedSummaryItemsPerPage = 100;
	let totalfactoryUnreceivedSummaryCount = 0;
	let totalfactoryUnreceivedSummaryPages = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;

	// ✅ 전역 데이터
	let filteredfactoryUnreceivedSummaryData = [];
	let factoryUnreceivedSummaryColumns = [
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
		const fromDate = fmtLocalDate(today);
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
			fromDate: $('#factoryUnreceivedSummary_searchVal_fromDate').val(),
			toDate: $('#factoryUnreceivedSummary_searchVal_toDate').val(),
			factory: $('#factoryUnreceivedSummary_searchVal_factory').val(),
			storage: $('#factoryUnreceivedSummary_searchVal_storage').val(),
			workCenter: $('#factoryUnreceivedSummary_searchVal_receiveWorkCenter').val(),
			itemcode: ($('#factoryUnreceivedSummary_searchVal_itemcode').val() || '').trim().toUpperCase(),
			itemname: ($('#factoryUnreceivedSummary_searchVal_itemname').val() || '').trim().toUpperCase()
		};
	}

	function performfactoryUnreceivedSummaryDBSearch(searchCriteria) {
		showLoading('data');

		$.ajax({
			url: '/read_factoryUnreceivedSummary',
			type: 'POST',
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: 'application/json',
			success: function(response) {
				console.log('-- DB 조회 결과 (전체) --');
				console.log(response);

				allServerData = response.records || [];
				filteredData_purchaseFactoryUnreceivedSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				currentfactoryUnreceivedSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mPurchase_factory_unreceived_summary').length) {
					renderfactoryUnreceivedSummaryView();
				} else {
					renderfactoryUnreceivedSummaryTableData();
					renderfactoryUnreceivedSummaryPagination();
					updatefactoryUnreceivedSummaryTotalCount();
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
		factoryUnreceivedSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		// 1) 원본 검색결과 → 미수령건만 필터
		const baseRows = filteredData_purchaseFactoryUnreceivedSummary || [];
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
		totalfactoryUnreceivedSummaryCount = unreceivedAllData.length;
		totalfactoryUnreceivedSummaryPages = Math.ceil(totalfactoryUnreceivedSummaryCount / factoryUnreceivedSummaryItemsPerPage) || 1;

		const startIndex = (currentfactoryUnreceivedSummaryPage - 1) * factoryUnreceivedSummaryItemsPerPage;
		const endIndex = startIndex + factoryUnreceivedSummaryItemsPerPage;

		globalfactoryUnreceivedSummaryData = unreceivedAllData.slice(startIndex, endIndex);
		filteredfactoryUnreceivedSummaryData = globalfactoryUnreceivedSummaryData;
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

		currentfactoryUnreceivedSummaryPage = 1;

		// ✅ 정렬된 unreceivedAllData 기준으로 페이징만 다시 자르기
		const startIndex = (currentfactoryUnreceivedSummaryPage - 1) * factoryUnreceivedSummaryItemsPerPage;
		const endIndex = startIndex + factoryUnreceivedSummaryItemsPerPage;

		globalfactoryUnreceivedSummaryData = unreceivedAllData.slice(startIndex, endIndex);
		filteredfactoryUnreceivedSummaryData = globalfactoryUnreceivedSummaryData;

		renderfactoryUnreceivedSummaryTableData();
		renderfactoryUnreceivedSummaryPagination();
		updatefactoryUnreceivedSummaryTotalCount();

		updateSortIndicators(column);
	}


	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatefactoryUnreceivedSummaryTotalCount() {
		$('#factoryUnreceivedSummaryTotalCount').text(
			Number(totalfactoryUnreceivedSummaryCount).toLocaleString()
		);
		$('#factoryUnreceivedSummaryCurrentPageInfo').text(currentfactoryUnreceivedSummaryPage);
		$('#factoryUnreceivedSummaryTotalPageInfo').text(totalfactoryUnreceivedSummaryPages);
		// 🔽 총수량 표시 갱신
		updateTotalQty();
	}

	function renderfactoryUnreceivedSummaryTableData() {
		let tableBody = '';

		for (let i = 0; i < globalfactoryUnreceivedSummaryData.length; i++) {
			const data = globalfactoryUnreceivedSummaryData[i];

			// 공통 수량 계산
			const { qty, scanQtySum } = calcQuantities(data);

			// 🔹 이미 applyClientPagination 에서 미수령건만 필터링됨
			//     여기서는 단순히 렌더만 하면 됨
			const rowNumber =
				(currentfactoryUnreceivedSummaryPage - 1) *
				factoryUnreceivedSummaryItemsPerPage +
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
                </tr>
            `;
		}

		$('#factoryUnreceivedSummaryTableBody').html(tableBody);
	}

	// 🔹 엑셀용 데이터 생성 (화면과 동일 조건: 미수령건만, TOQTY = SCANQTY + SCANQTY2)
	function buildfactoryUnreceivedSummaryExcelData(sourceRows) {
		// 서버에서 새로 받은 records 를 쓰되, 없으면 unreceivedAllData 사용
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
				QTY: qty, // Sent Qty
				TOQTY: scanQtySum, // Receive Qty = SCANQTY + SCANQTY2
				BARCODE: row.BARCODE ?? row.barcode ?? ''
			});
		}

		return result;
	}

	function renderfactoryUnreceivedSummaryPagination() {
		let paginationHtml = '';

		if (currentfactoryUnreceivedSummaryPage > 1) {
			paginationHtml += `<button class="factoryUnreceivedSummary-page-btn" data-page="${currentfactoryUnreceivedSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryUnreceivedSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentfactoryUnreceivedSummaryPage - 5);
		let endPage = Math.min(totalfactoryUnreceivedSummaryPages, currentfactoryUnreceivedSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="factoryUnreceivedSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentfactoryUnreceivedSummaryPage) {
				paginationHtml += `<button class="factoryUnreceivedSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryUnreceivedSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalfactoryUnreceivedSummaryPages) {
			if (endPage < totalfactoryUnreceivedSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryUnreceivedSummary-page-btn" data-page="${totalfactoryUnreceivedSummaryPages}">${totalfactoryUnreceivedSummaryPages}</button>`;
		}

		if (currentfactoryUnreceivedSummaryPage < totalfactoryUnreceivedSummaryPages) {
			paginationHtml += `<button class="factoryUnreceivedSummary-page-btn" data-page="${currentfactoryUnreceivedSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryUnreceivedSummary-page-btn disabled">&gt;</button>`;
		}

		$('#factoryUnreceivedSummaryPaginationContainer').html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		//const savedFactory = getCookie('selectedFactory');
		const factory = $('#factoryUnreceivedSummary_searchVal_factory');
		const storage = $('#factoryUnreceivedSummary_searchVal_storage');

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
			// ✅ 기존 선택값 유지
			const prevSelected = storage.val();

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

			// ✅ 기존 선택값이 유효하면 유지, 아니면 Material
			if (prevSelected && storage.find(`option[value="${prevSelected}"]`).length) {
				storage.val(prevSelected);
			} else {
				storage.val('Material');
			}
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
	function renderfactoryUnreceivedSummaryView() {
		const savedFactory = getCookie('selectedFactory');

		let content_output = `
        <div class="divBlockControl" id="view_mPurchase_factory_unreceived_summary">
            <div class="content-body">
                <!-- 검색 영역 -->
                <div class="search-area">
                    <div class="search-row">
                        <div class="search-label">
                            <div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
                            <input type="date" id="factoryUnreceivedSummary_searchVal_fromDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_toDate">　</div>
                            <input type="date" id="factoryUnreceivedSummary_searchVal_toDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_factory">${i18n.t('search.sentfactory')}</div>
                            <select id="factoryUnreceivedSummary_searchVal_factory">
                                <!-- 동적으로 추가 -->
                            </select>
                        </div>
                        <div class="search-label">
                            <div class="searchVal_storage">${i18n.t('search.sentstorage')}</div>
                            <select id="factoryUnreceivedSummary_searchVal_storage">
                                <!-- 동적으로 추가 -->
                            </select>
                        </div>
                        <div class="search-label">
                            <div class="searchVal_receiveWorkCenter">${i18n.t('search.receiveworkcenter')}</div>
                            <select id="factoryUnreceivedSummary_searchVal_receiveWorkCenter">
                                <option value="H/REST">H/REST</option>
                            </select>
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
                            <input type="text" id="factoryUnreceivedSummary_searchVal_itemcode" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
                            <input type="text" id="factoryUnreceivedSummary_searchVal_itemname" />
                        </div>
                    </div>
                    <div class="search_button_area">
                        <button class="btn btn-primary btnFactoryUnreceivedSummarySearch">${i18n.t('btn.search')}</button>
                        <button class="btn btn-secondary btnFactoryUnreceivedSummarySearchInit">${i18n.t('btn.clear')}</button>
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
                            <strong id="factoryUnreceivedSummaryTotalCount">${totalfactoryUnreceivedSummaryCount}</strong>
                            ${i18n.t('table.info.records')}
                            |
                            ${i18n.t('table.page')}
                            <strong id="factoryUnreceivedSummaryCurrentPageInfo">${currentfactoryUnreceivedSummaryPage}</strong> /
                            <strong id="factoryUnreceivedSummaryTotalPageInfo">${totalfactoryUnreceivedSummaryPages}</strong>
                            |
                            ${i18n.t('search.qty.out')}
                            <strong id="factoryUnreceivedSummaryTotalFromQty">0</strong>
                            |
                            ${i18n.t('search.qty.scan')}
                            <strong id="factoryUnreceivedSummaryTotalToQty">0</strong>
                        </span>
                        <div class="action-buttons-right mPurchase_factory_unreceived_summary">
                            <div id="defaultActions" class="action-group">
                                <button class="btn btn-success" id="factoryUnreceivedSummaryExcelBtn" onclick="window.downloadAllfactoryUnreceivedSummaryData_internal()">Excel</button>
                            </div>
                        </div>
                    </div>

                    <table class="data-table mPurchase_factory_unreceived_summary" id="factoryUnreceivedSummaryTable">
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
                                <th class="unpackqtyVal" data-sort="FROMQTY" data-type="number">${i18n.t('search.qty.out')}</th>
                                <th class="unpackqtyVal" data-sort="TOQTY" data-type="number">${i18n.t('search.qty.scan')}</th>
                            </tr>
                        </thead>
                        <tbody id="factoryUnreceivedSummaryTableBody">
                        </tbody>
                    </table>

                    <!-- 페이지네이션 -->
                    <div class="pagination" id="factoryUnreceivedSummaryPaginationContainer"></div>

                    <div class="items-per-page-selector">
                        <label for="factoryUnreceivedSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
                        <select id="factoryUnreceivedSummary_itemsPerPage" class="items-per-page-select">
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
			$('#factoryUnreceivedSummary_searchVal_toDate').val(toDate);
			$('#factoryUnreceivedSummary_searchVal_fromDate').val(fromDate);
			$('#factoryUnreceivedSummary_searchVal_factory').val(savedFactory || 'all');
			$('#factoryUnreceivedSummary_itemsPerPage').val(factoryUnreceivedSummaryItemsPerPage);
			console.log('🎯 Select 초기값 설정됨:', factoryUnreceivedSummaryItemsPerPage);
		})();

		renderFactoryStorage();
		renderfactoryUnreceivedSummaryTableData();
		renderfactoryUnreceivedSummaryPagination();
		bindfactoryUnreceivedSummaryEvents();
		updatefactoryUnreceivedSummaryTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindfactoryUnreceivedSummaryEvents() {
		// 검색 버튼
		$('.btnFactoryUnreceivedSummarySearch')
			.off('click')
			.on('click', function() {
				handleFactoryUnreceivedSummarySearch();
			});

		// 초기화 버튼
		$('.btnFactoryUnreceivedSummarySearchInit')
			.off('click')
			.on('click', function() {
				handleFactoryUnreceivedSummarySearchInit();
			});

		// 페이지당 항목 수 변경
		$('#factoryUnreceivedSummary_itemsPerPage')
			.off('change')
			.on('change', function() {
				const newItemsPerPage = parseInt($(this).val());
				handleChangeFactoryUnreceivedSummaryItemsPerPage(newItemsPerPage);
			});

		// 페이지네이션 버튼
		$(document)
			.off('click', '.factoryUnreceivedSummary-page-btn')
			.on('click', '.factoryUnreceivedSummary-page-btn', function() {
				if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
					const page = parseInt($(this).data('page'));
					if (page && page > 0) {
						handlePageChange(page);
					}
				}
			});

		// 헤더 정렬
		$('#factoryUnreceivedSummaryTable thead th[data-sort]')
			.off('click')
			.on('click', function() {
				const column = $(this).data('sort');
				const dataType = $(this).data('type') || 'string';
				handleSort(column, dataType);
			});

		// 엔터키 검색
		$('#view_mPurchase_factory_unreceived_summary input[type="text"], #view_mPurchase_factory_unreceived_summary input[type="date"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) {
					handleFactoryUnreceivedSummarySearch();
				}
			});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleFactoryUnreceivedSummarySearch() {
		const searchCriteria = getCurrentSearchCriteria();
		console.log('검색 조건:', searchCriteria);

		currentfactoryUnreceivedSummaryPage = 1;
		performfactoryUnreceivedSummaryDBSearch(searchCriteria);
	}

	function handleFactoryUnreceivedSummarySearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = 'SALTILLO';   // ✅ 고정
		const storage = 'Material';   // ✅ 기본값

		$('#factoryUnreceivedSummary_searchVal_fromDate').val(fromDate);
		$('#factoryUnreceivedSummary_searchVal_toDate').val(toDate);
		$('#factoryUnreceivedSummary_searchVal_factory').val(factory);
		$('#factoryUnreceivedSummary_searchVal_storage').val(storage);
		$('#factoryUnreceivedSummary_searchVal_itemcode').val('');
		$('#factoryUnreceivedSummary_searchVal_itemname').val('');

		renderFactoryStorage();

		currentfactoryUnreceivedSummaryPage = 1;
		performfactoryUnreceivedSummaryDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}


	function handlePageChange(page) {
		currentfactoryUnreceivedSummaryPage = page;
		applyClientPagination();
		renderfactoryUnreceivedSummaryTableData();
		renderfactoryUnreceivedSummaryPagination();
		updatefactoryUnreceivedSummaryTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeFactoryUnreceivedSummaryItemsPerPage(newItemsPerPage) {
		factoryUnreceivedSummaryItemsPerPage = newItemsPerPage;
		currentfactoryUnreceivedSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		// ✅ UI도 동기화
		$('#factoryUnreceivedSummary_itemsPerPage').val(newItemsPerPage);

		applyClientPagination();
		renderfactoryUnreceivedSummaryTableData();
		renderfactoryUnreceivedSummaryPagination();
		updatefactoryUnreceivedSummaryTotalCount();
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

		$('#factoryUnreceivedSummaryTotalFromQty').text(sumFrom.toLocaleString());
		$('#factoryUnreceivedSummaryTotalToQty').text(sumTo.toLocaleString());
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// 메인 호출 함수
	window.call_mPurchase_factory_unreceived_summary = function(menuId) {
		function internalInit() {
			showLoading('data');
			const { fromDate, toDate } = getDefaultDateRange();
			const factory = 'SALTILLO'; // ✅ 고정
			const storage = 'Material';
			console.log('FACTORY - ' + factory);
			performfactoryUnreceivedSummaryDBSearch({ fromDate, toDate, factory, storage });
		}
		internalInit();
	};

	// 엑셀 다운로드 (✅ 화면 정렬/필터 그대로 내보내기)
	window.downloadAllfactoryUnreceivedSummaryData_internal = function() {
		function internalDownload() {
			// 🔹 현재 메모리에 있는 “미수령 전체 데이터” 사용
			//    - 정렬/검색/필터 반영된 상태 (unreceivedAllData)
			const excelData = buildfactoryUnreceivedSummaryExcelData(unreceivedAllData);

			ExcelExporter.downloadExcel(excelData, factoryUnreceivedSummaryColumns, {
				fileName: 'factoryUnreceivedSummary_All',
				sheetName: 'factoryUnreceivedSummary'
			});
		}

		internalDownload();
	};


	// 데이터 내보내기
	window.exportfactoryUnreceivedSummaryData = function() {
		function internalExport() {
			return {
				total: unreceivedAllData.length,
				currentPage: currentfactoryUnreceivedSummaryPage,
				itemsPerPage: factoryUnreceivedSummaryItemsPerPage,
				data: unreceivedAllData
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeFactoryUnreceivedSummaryItemsPerPage = function(newItemsPerPage) {
		function internalChange() {
			handleChangeFactoryUnreceivedSummaryItemsPerPage(newItemsPerPage);
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
