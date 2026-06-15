/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 미수령 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];
	let filteredData_salesTransferSummary = [];
	let globalSalesTransferSummaryData = [];
	let unreceivedAllData = []; // 🔹 미수령 전체 데이터

	let currentSalesTransferSummaryPage = 1;
	let salesTransferSummaryItemsPerPage = 100;
	let totalSalesTransferSummaryCount = 0;
	let totalsalesTransferSummaryPages = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;

	// ✅ 전역 데이터
	let filteredSalesTransferSummaryData = [];
	let salesTransferSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Qty', type: 'number' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'LOGINID', header: 'User Name' },
		{ key: 'WORKPLACE', header: 'Work Place' },
		{ key: 'SHIFT', header: 'Shift' },
		{ key: 'OITEMCODE', header: 'OITEMCODE' }
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
			fromDate: $('#salesTransferSummary_searchVal_fromDate').val(),
			toDate: $('#salesTransferSummary_searchVal_toDate').val(),
			oitemcode: ($('#salesTransferSummary_searchVal_oitemcode').val() || ''),
			car: $('#salesTransferSummary_searchVal_car').val(),
			itemcode: ($('#salesTransferSummary_searchVal_itemcode').val() || ''),
			itemname: ($('#salesTransferSummary_searchVal_itemname').val() || '')
		};
	}

	function performsalesTransferSummaryDBSearch(searchCriteria) {
		showLoading('data');

		$.ajax({
			url: '/read_transferSummary',
			type: 'POST',
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: 'application/json',
			success: function(response) {
				console.log('-- DB 조회 결과 (전체) --');
				console.log(response);

				allServerData = response.records || [];
				filteredData_salesTransferSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				currentSalesTransferSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mSales_transfer_summary').length) {
					rendersalesTransferSummaryView();
				} else {
					rendersalesTransferSummaryTableData();
					rendersalesTransferSummaryPagination();
					updatesalesTransferSummaryTotalCount();
				}

				hideLoading();
			},
			error: function(xhr, status, error) {
				console.log('🔥 LOCAL ajax error:', status, error);
				console.log('Response:', xhr.responseText);

				const message =
					'An error occurred while processing the request.\n\n' +
					'Summarys:\n' +
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
		salesTransferSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		// 🔹 1) 전체 검색 결과에서 "미수령건만" 필터링
		const baseRows = filteredData_salesTransferSummary || [];
		unreceivedAllData = baseRows.filter((row) => {
			const { diff } = calcQuantities(row);
			return diff !== 0;
		});

		// 🔹 2) 미수령 리스트 기준으로 총 건수/페이지 수 계산
		totalSalesTransferSummaryCount = unreceivedAllData.length;
		totalsalesTransferSummaryPages =
			Math.ceil(totalSalesTransferSummaryCount / salesTransferSummaryItemsPerPage) || 1;

		const startIndex =
			(currentSalesTransferSummaryPage - 1) * salesTransferSummaryItemsPerPage;
		const endIndex = startIndex + salesTransferSummaryItemsPerPage;

		// 🔹 3) 현재 페이지에 보여줄 미수령 데이터
		globalSalesTransferSummaryData = unreceivedAllData.slice(startIndex, endIndex);
		filteredSalesTransferSummaryData = globalSalesTransferSummaryData;
	}

	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		// 정렬 대상은 "전체 결과"가 아니라, 미수령 기준으로 보고 싶으시면
		// 여기서 baseRows 를 unreceivedAllData 로 바꿀 수도 있음.
		filteredData_salesTransferSummary.sort((a, b) => {
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

		currentSalesTransferSummaryPage = 1;
		applyClientPagination();

		rendersalesTransferSummaryTableData();
		rendersalesTransferSummaryPagination();
		updatesalesTransferSummaryTotalCount();

		updateSortIndicators(column);
	}

	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatesalesTransferSummaryTotalCount() {
		$('#salesTransferSummaryTotalCount').text(
			Number(totalSalesTransferSummaryCount).toLocaleString()
		);
		$('#salesTransferSummaryCurrentPageInfo').text(currentSalesTransferSummaryPage);
		$('#salesTransferSummaryTotalPageInfo').text(totalsalesTransferSummaryPages);
		// 🔽 총수량 표시 갱신
		updateTotalQty();
	}

	function rendersalesTransferSummaryTableData() {
		let tableBody = '';

		for (let i = 0; i < globalSalesTransferSummaryData.length; i++) {
			const data = globalSalesTransferSummaryData[i];

			// 🔹 이미 applyClientPagination 에서 미수령건만 필터링됨
			//     여기서는 단순히 렌더만 하면 됨
			const rowNumber =
				(currentSalesTransferSummaryPage - 1) *
				salesTransferSummaryItemsPerPage +
				(i + 1);

			const wccode = data.WCCODE || data.wccode || '';
			const receiveWorkCenter = wccode ? wccode.split('-')[1] : '';

			tableBody += `
                <tr>
                    <td class="noVal">${rowNumber}</td>
                    <td class="shortSet_1">${data.SDATE || data.sdate || ''}</td>
                    <td class="itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                    <td class="itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
                    <td class="qtyVal">${data.QTY || data.qty || ''}</td>
                    <td class="carVal">${data.CAR || data.car || ''}</td>
                    <td class="loginidVal">${data.LOGINID || data.loginid || ''}</td>
                    <td class="locationVal">${data.WORKPLACE || data.workplace || ''}</td>
                    <td class="dateVal">${data.SHIFT || data.shift || ''}</td>
                    <td class="itemcodeVal">${data.OITEMCODE || data.oitemcode || ''}</td>
                </tr>
            `;
		}

		$('#salesTransferSummaryTableBody').html(tableBody);
	}

	// 🔹 엑셀용 데이터 생성 (화면과 동일 조건: 미수령건만, TOQTY = SCANQTY + SCANQTY2)
	function buildsalesTransferSummaryExcelData(sourceRows) {
		// 서버에서 새로 받은 records 를 쓰되, 없으면 unreceivedAllData 사용
		const baseRows = sourceRows || unreceivedAllData || [];
		const result = [];

		for (let i = 0; i < baseRows.length; i++) {
			const row = baseRows[i];
			const { qty, scanQtySum, diff } = calcQuantities(row);

			// 화면과 동일하게 "미수령건만"
			if (diff === 0) continue;

			result.push({
				SDATE: row.SDATE ?? row.sdate ?? '',
				ITEMCODE: row.ITEMCODE ?? row.itemcode ?? '',
				ITEMNAME: row.ITEMNAME ?? row.itemname ?? '',
				QTY: qty, // 보낸 수량
				CAR: row.CAR ?? row.car ?? '',
				LOGINID: row.LOGINID ?? row.loginid ?? '',

				// 🔽 여기 3개가 지금 비어 있는 부분
				OITEMCODE: row.OITEMCODE ?? row.oitemcode ?? row.oItemcode ?? '',
				SEQ: row.SEQ ?? row.seq ?? row.Seq ?? '',
				PRINTDATE: row.PRINTDATE ?? row.printdate ?? row.printDate ?? '',

				// ✅ 추가 (엑셀에 WORKPLACE/SHIFT 나오게)
				WORKPLACE: row.WORKPLACE ?? row.workplace ?? '',
				SHIFT: row.SHIFT ?? row.shift ?? '',

				BARCODE: row.BARCODE ?? row.barcode ?? ''
			});
		}

		return result;
	}

	function rendersalesTransferSummaryPagination() {
		let paginationHtml = '';

		if (currentSalesTransferSummaryPage > 1) {
			paginationHtml += `<button class="salesTransferSummary-page-btn" data-page="${currentSalesTransferSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesTransferSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesTransferSummaryPage - 5);
		let endPage = Math.min(totalsalesTransferSummaryPages, currentSalesTransferSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesTransferSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesTransferSummaryPage) {
				paginationHtml += `<button class="salesTransferSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesTransferSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalsalesTransferSummaryPages) {
			if (endPage < totalsalesTransferSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesTransferSummary-page-btn" data-page="${totalsalesTransferSummaryPages}">${totalsalesTransferSummaryPages}</button>`;
		}

		if (currentSalesTransferSummaryPage < totalsalesTransferSummaryPages) {
			paginationHtml += `<button class="salesTransferSummary-page-btn" data-page="${currentSalesTransferSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesTransferSummary-page-btn disabled">&gt;</button>`;
		}

		$('#salesTransferSummaryPaginationContainer').html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		const savedFactory = getCookie('selectedFactory');
		const factory = $('#salesTransferSummary_searchVal_factory');
		const storage = $('#salesTransferSummary_searchVal_storage');

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
	function rendersalesTransferSummaryView() {
		const savedFactory = getCookie('selectedFactory');

		let content_output = `
        <div class="divBlockControl" id="view_mSales_transfer_summary">
            <div class="content-body">
                <!-- 검색 영역 -->
                <div class="search-area">
                    <div class="search-row">
                        <div class="search-label">
                            <div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
                            <input type="date" id="salesTransferSummary_searchVal_fromDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_toDate">　</div>
                            <input type="date" id="salesTransferSummary_searchVal_toDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_oitemcode">OITEMCODE</div>
                            <input type="text" id="salesTransferSummary_searchVal_oitemcode" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_car">${i18n.t('search.car')}</div>
                            <input type="text" id="salesTransferSummary_searchVal_car" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
                            <input type="text" id="salesTransferSummary_searchVal_itemcode" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
                            <input type="text" id="salesTransferSummary_searchVal_itemname" />
                        </div>
                    </div>
                    <div class="search_button_area">
                        <button class="btn btn-primary btnSalesTransferSummarySearch">${i18n.t('btn.search')}</button>
                        <button class="btn btn-secondary btnSalesTransferSummarySearchInit">${i18n.t('btn.clear')}</button>
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
						    <strong id="salesTransferSummaryTotalCount">${totalSalesTransferSummaryCount}</strong>
						    ${i18n.t('table.info.records')}
						    |
						    ${i18n.t('table.page')}
						    <strong id="salesTransferSummaryCurrentPageInfo">${currentSalesTransferSummaryPage}</strong> /
						    <strong id="salesTransferSummaryTotalPageInfo">${totalsalesTransferSummaryPages}</strong>
						
						    <!-- ✅ 추가: Qty 합계 -->
						    <span style="margin-left:10px;">|</span>
						    <span style="margin-left:10px;">${i18n.t('table.info.qty')} :</span>
						    <strong id="salesTransferSummaryTotalQty" style="color:#007bff">0</strong>
						</span>

                        <div class="action-buttons-right mSales_transfer_summary">
                            <div id="defaultActions" class="action-group">
                                <button class="btn btn-success" id="salesTransferSummaryExcelBtn" onclick="window.downloadAllsalesTransferSummaryData_internal()">Excel</button>
                            </div>
                        </div>
                    </div>

                    <table class="data-table mSales_transfer_summary" id="salesTransferSummaryTable">
                        <thead>
                            <tr>
                                <th class="noVal">${i18n.t('table.no')}</th>
                                <th class="shortSet_1" data-sort="SDATE" data-type="string">${i18n.t('search.date')}</th>
                                <th class="itemcodeVal" data-sort="ITEMCODE" data-type="string">${i18n.t('search.itemCode')}</th>
                                <th class="itemnameVal" data-sort="ITEMNAME" data-type="string">${i18n.t('search.itemName')}</th>
                                <th class="qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
                                <th class="carVal" data-sort="CAR" data-type="string">${i18n.t('search.car')}</th>
                                <th class="loginidVal" data-sort="LOGINID" data-type="string">${i18n.t('search.userName')}</th>
                                <th class = "locationVal" data-sort="WORKPLACE">${i18n.t('search.workCenter')}<!-- WORKPLACE --></th>
								<th class = "dateVal" data-sort="SHIFT">SHIFT<!-- SHIFT --></th>
                                <th class="itemcodeVal" data-sort="OITEMCODE" data-type="string">OITEMCODE</th>
                            </tr>
                        </thead>
                        <tbody id="salesTransferSummaryTableBody">
                        </tbody>
                    </table>

                    <!-- 페이지네이션 -->
                    <div class="pagination" id="salesTransferSummaryPaginationContainer"></div>

                    <div class="items-per-page-selector">
                        <label for="salesTransferSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
                        <select id="salesTransferSummary_itemsPerPage" class="items-per-page-select">
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
			$('#salesTransferSummary_searchVal_toDate').val(toDate);
			$('#salesTransferSummary_searchVal_fromDate').val(fromDate);
			$('#salesTransferSummary_searchVal_factory').val(savedFactory || 'all');
			$('#salesTransferSummary_itemsPerPage').val(salesTransferSummaryItemsPerPage);
			console.log('🎯 Select 초기값 설정됨:', salesTransferSummaryItemsPerPage);
		})();

		renderFactoryStorage();
		rendersalesTransferSummaryTableData();
		rendersalesTransferSummaryPagination();
		bindsalesTransferSummaryEvents();
		updatesalesTransferSummaryTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindsalesTransferSummaryEvents() {
		// 검색 버튼
		$('.btnSalesTransferSummarySearch')
			.off('click')
			.on('click', function() {
				handleSalesTransferSummarySearch();
			});

		// 초기화 버튼
		$('.btnSalesTransferSummarySearchInit')
			.off('click')
			.on('click', function() {
				handleSalesTransferSummarySearchInit();
			});

		// 페이지당 항목 수 변경
		$('#salesTransferSummary_itemsPerPage')
			.off('change')
			.on('change', function() {
				const newItemsPerPage = parseInt($(this).val());
				handleChangeSalesTransferSummaryItemsPerPage(newItemsPerPage);
			});

		// 페이지네이션 버튼
		$(document)
			.off('click', '.salesTransferSummary-page-btn')
			.on('click', '.salesTransferSummary-page-btn', function() {
				if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
					const page = parseInt($(this).data('page'));
					if (page && page > 0) {
						handlePageChange(page);
					}
				}
			});

		// 헤더 정렬
		$('#salesTransferSummaryTable thead th[data-sort]')
			.off('click')
			.on('click', function() {
				const column = $(this).data('sort');
				const dataType = $(this).data('type') || 'string';
				handleSort(column, dataType);
			});

		// 엔터키 검색
		$('#view_mSales_transfer_summary input[type="text"], #view_mSales_transfer_summary input[type="date"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) {
					handleSalesTransferSummarySearch();
				}
			});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleSalesTransferSummarySearch() {
		const searchCriteria = getCurrentSearchCriteria();
		console.log('검색 조건:', searchCriteria);

		currentSalesTransferSummaryPage = 1;
		performsalesTransferSummaryDBSearch(searchCriteria);
	}

	function handleSalesTransferSummarySearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		$('#salesTransferSummary_searchVal_fromDate').val(fromDate);
		$('#salesTransferSummary_searchVal_toDate').val(toDate);
		$('#salesTransferSummary_searchVal_oitemcode').val('');
		$('#salesTransferSummary_searchVal_car').val('');
		$('#salesTransferSummary_searchVal_itemcode').val('');
		$('#salesTransferSummary_searchVal_itemname').val('');

		renderFactoryStorage();

		currentSalesTransferSummaryPage = 1;
		performsalesTransferSummaryDBSearch({ toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function handlePageChange(page) {
		currentSalesTransferSummaryPage = page;
		applyClientPagination();
		rendersalesTransferSummaryTableData();
		rendersalesTransferSummaryPagination();
		updatesalesTransferSummaryTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeSalesTransferSummaryItemsPerPage(newItemsPerPage) {
		salesTransferSummaryItemsPerPage = newItemsPerPage;
		currentSalesTransferSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		rendersalesTransferSummaryTableData();
		rendersalesTransferSummaryPagination();
		updatesalesTransferSummaryTotalCount();
	}

	function updateTotalQty() {
		let total = 0;

		// ✅ "미수령" 데이터 기준 QTY 합계
		(unreceivedAllData || []).forEach((row) => {
			const { qty, diff } = calcQuantities(row);
			if (diff !== 0) total += qty;
		});

		$('#salesTransferSummaryTotalQty').text(total.toLocaleString());
	}


	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// 메인 호출 함수
	window.call_mSales_transfer_summary = function(menuId) {
		function internalInit() {
			showLoading('data');
			const { fromDate, toDate } = getDefaultDateRange();
			const factory = 'SALTILLO'; // ✅ 고정
			const storage = 'Material';
			console.log('FACTORY - ' + factory);
			performsalesTransferSummaryDBSearch({ fromDate, toDate, factory, storage });
		}
		internalInit();
	};

	// 엑셀 다운로드 (✅ 화면 정렬/필터 그대로 내보내기)
	window.downloadAllsalesTransferSummaryData_internal = function() {
		function internalDownload() {
			// 🔹 현재 메모리에 있는 “미수령 전체 데이터” 사용
			//    - 정렬/검색/필터 반영된 상태 (unreceivedAllData)
			const excelData = buildsalesTransferSummaryExcelData(unreceivedAllData);

			ExcelExporter.downloadExcel(excelData, salesTransferSummaryColumns, {
				fileName: 'salesTransferSummary_All',
				sheetName: 'salesTransferSummary'
			});
		}

		internalDownload();
	};


	// 데이터 내보내기
	window.exportsalesTransferSummaryData = function() {
		function internalExport() {
			return {
				total: unreceivedAllData.length,
				currentPage: currentSalesTransferSummaryPage,
				itemsPerPage: salesTransferSummaryItemsPerPage,
				data: unreceivedAllData
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeSalesTransferSummaryItemsPerPage = function(newItemsPerPage) {
		function internalChange() {
			handleChangeSalesTransferSummaryItemsPerPage(newItemsPerPage);
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
