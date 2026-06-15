/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 미수령 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];
	let filteredData_salesTransferDetail = [];
	let globalSalesTransferDetailData = [];
	let unreceivedAllData = []; // 🔹 미수령 전체 데이터

	let currentSalesTransferDetailPage = 1;
	let salesTransferDetailItemsPerPage = 100;
	let totalSalesTransferDetailCount = 0;
	let totalsalesTransferDetailPages = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;

	// ✅ 전역 데이터
	let filteredSalesTransferDetailData = [];
	let salesTransferDetailColumns = [
		{ key: 'INTF_YN', header: 'Status' },
		{ key: 'SDATE', header: 'Date' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'ITEMNAME', header: 'Item Name' },
		{ key: 'QTY', header: 'Qty', type: 'number' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'LOGINID', header: 'User Name' },
		{ key: 'OITEMCODE', header: 'OITEMCODE' },
		{ key: 'SEQ', header: 'SEQ' },
		{ key: 'PRINTDATE', header: 'Print YMDHMS' },
		{ key: 'WORKPLACE', header: 'Work Place' },
		{ key: 'SHIFT', header: 'Shift' },
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
			fromDate: $('#salesTransferDetail_searchVal_fromDate').val(),
			toDate: $('#salesTransferDetail_searchVal_toDate').val(),
			oitemcode: ($('#salesTransferDetail_searchVal_oitemcode').val() || ''),
			car: $('#salesTransferDetail_searchVal_car').val(),
			itemcode: ($('#salesTransferDetail_searchVal_itemcode').val() || ''),
			itemname: ($('#salesTransferDetail_searchVal_itemname').val() || '')
		};
	}

	function performsalesTransferDetailDBSearch(searchCriteria) {
		showLoading('data');

		$.ajax({
			url: '/read_transferDetail',
			type: 'POST',
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: 'application/json',
			success: function(response) {
				console.log('-- DB 조회 결과 (전체) --');
				console.log(response);

				allServerData = response.records || [];
				filteredData_salesTransferDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				currentSalesTransferDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mSales_transfer_detail').length) {
					rendersalesTransferDetailView();
				} else {
					rendersalesTransferDetailTableData();
					rendersalesTransferDetailPagination();
					updatesalesTransferDetailTotalCount();
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
		salesTransferDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		// 🔹 1) 전체 검색 결과에서 "미수령건만" 필터링
		const baseRows = filteredData_salesTransferDetail || [];
		unreceivedAllData = baseRows.filter((row) => {
			const { diff } = calcQuantities(row);
			return diff !== 0;
		});

		// 🔹 2) 미수령 리스트 기준으로 총 건수/페이지 수 계산
		totalSalesTransferDetailCount = unreceivedAllData.length;
		totalsalesTransferDetailPages =
			Math.ceil(totalSalesTransferDetailCount / salesTransferDetailItemsPerPage) || 1;

		const startIndex =
			(currentSalesTransferDetailPage - 1) * salesTransferDetailItemsPerPage;
		const endIndex = startIndex + salesTransferDetailItemsPerPage;

		// 🔹 3) 현재 페이지에 보여줄 미수령 데이터
		globalSalesTransferDetailData = unreceivedAllData.slice(startIndex, endIndex);
		filteredSalesTransferDetailData = globalSalesTransferDetailData;
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
		filteredData_salesTransferDetail.sort((a, b) => {
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

		currentSalesTransferDetailPage = 1;
		applyClientPagination();

		rendersalesTransferDetailTableData();
		rendersalesTransferDetailPagination();
		updatesalesTransferDetailTotalCount();

		updateSortIndicators(column);
	}

	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatesalesTransferDetailTotalCount() {
		$('#salesTransferDetailTotalCount').text(
			Number(totalSalesTransferDetailCount).toLocaleString()
		);
		$('#salesTransferDetailCurrentPageInfo').text(currentSalesTransferDetailPage);
		$('#salesTransferDetailTotalPageInfo').text(totalsalesTransferDetailPages);
		// 🔽 총수량 표시 갱신
		updateTotalQty();
	}

	function rendersalesTransferDetailTableData() {
		let tableBody = '';

		for (let i = 0; i < globalSalesTransferDetailData.length; i++) {
			const data = globalSalesTransferDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			// 🔹 이미 applyClientPagination 에서 미수령건만 필터링됨
			//     여기서는 단순히 렌더만 하면 됨
			const rowNumber =
				(currentSalesTransferDetailPage - 1) *
				salesTransferDetailItemsPerPage +
				(i + 1);

			const wccode = data.WCCODE || data.wccode || '';
			const receiveWorkCenter = wccode ? wccode.split('-')[1] : '';

			tableBody += `
                <tr>
				    <td class = "checkboxVal"><input type="checkbox" class="salesTransferDetail_chk ${statusClass}" 
				    	data-unique="${data.SDATE}_${data.ITEMCODE}_${data.INTF_YN}_${data.QTY}_${data.BARCODE}_${data.MES_KEY}"
	        			data-delete="${data.IID}_${data.SDATE}_${data.IFNO}_${data.BARCODE}_${data.MES_KEY}">
	        		</td>
                    <td class="noVal">${rowNumber}</td>
                	<td class='statusVal'><span class="${statusClass}">${statusText}</span></td>
                    <td class="shortSet_1">${data.SDATE || data.sdate || ''}</td>
                    <td class="itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                    <td class="itemnameVal">${data.ITEMNAME || data.itemname || ''}</td>
                    <td class="qtyVal">${data.QTY || data.qty || ''}</td>
                    <td class="carVal">${data.CAR || data.car || ''}</td>
                    <td class="loginidVal">${data.LOGINID || data.loginid || ''}</td>
                    <td class="itemcodeVal">${data.OITEMCODE || data.oitemcode || ''}</td>
                    <td class="seqVal">${data.SEQ || data.seq || ''}</td>
                    <td class="itemcodeVal">${data.PRINTDATE || data.printdate || ''}</td>
                    <td class="locationVal">${data.WORKPLACE || data.workplace || ''}</td>
                    <td class="dateVal">${data.SHIFT || data.shift || ''}</td>
                    <td class="memoVal">${data.PRODUCTBARCODE || data.productbarcode || ''}</td>
					<td class="barcodeVal">${data.BARCODE || data.barcode || ''}</td>
                </tr>
            `;
		}

		$('#salesTransferDetailTableBody').html(tableBody);
	}

	// 🔹 엑셀용 데이터 생성 (화면과 동일 조건: 미수령건만, TOQTY = SCANQTY + SCANQTY2)
	function buildsalesTransferDetailExcelData(sourceRows) {
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

	function rendersalesTransferDetailPagination() {
		let paginationHtml = '';

		if (currentSalesTransferDetailPage > 1) {
			paginationHtml += `<button class="salesTransferDetail-page-btn" data-page="${currentSalesTransferDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesTransferDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesTransferDetailPage - 5);
		let endPage = Math.min(totalsalesTransferDetailPages, currentSalesTransferDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesTransferDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesTransferDetailPage) {
				paginationHtml += `<button class="salesTransferDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesTransferDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalsalesTransferDetailPages) {
			if (endPage < totalsalesTransferDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="salesTransferDetail-page-btn" data-page="${totalsalesTransferDetailPages}">${totalsalesTransferDetailPages}</button>`;
		}

		if (currentSalesTransferDetailPage < totalsalesTransferDetailPages) {
			paginationHtml += `<button class="salesTransferDetail-page-btn" data-page="${currentSalesTransferDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesTransferDetail-page-btn disabled">&gt;</button>`;
		}

		$('#salesTransferDetailPaginationContainer').html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		const savedFactory = getCookie('selectedFactory');
		const factory = $('#salesTransferDetail_searchVal_factory');
		const storage = $('#salesTransferDetail_searchVal_storage');

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
	function rendersalesTransferDetailView() {
		const savedFactory = getCookie('selectedFactory');
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminSalesTransferDetailDelete"/>
	        `;
		}
		let content_output = `
        <div class="divBlockControl" id="view_mSales_transfer_detail">
            <div class="content-body">
                <!-- 검색 영역 -->
                <div class="search-area">
                    <div class="search-row">
                        <div class="search-label">
                            <div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
                            <input type="date" id="salesTransferDetail_searchVal_fromDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_toDate">　</div>
                            <input type="date" id="salesTransferDetail_searchVal_toDate" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_oitemcode">OITEMCODE</div>
                            <input type="text" id="salesTransferDetail_searchVal_oitemcode" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_car">${i18n.t('search.car')}</div>
                            <input type="text" id="salesTransferDetail_searchVal_car" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
                            <input type="text" id="salesTransferDetail_searchVal_itemcode" />
                        </div>
                        <div class="search-label">
                            <div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
                            <input type="text" id="salesTransferDetail_searchVal_itemname" />
                        </div>
                    </div>
                    <div class="search_button_area">
                        <button class="btn btn-primary btnSalesTransferDetailSearch">${i18n.t('btn.search')}</button>
                        <button class="btn btn-secondary btnSalesTransferDetailSearchInit">${i18n.t('btn.clear')}</button>
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
						    <strong id="salesTransferDetailTotalCount">${totalSalesTransferDetailCount}</strong>
						    ${i18n.t('table.info.records')}
						    |
						    ${i18n.t('table.page')}
						    <strong id="salesTransferDetailCurrentPageInfo">${currentSalesTransferDetailPage}</strong> /
						    <strong id="salesTransferDetailTotalPageInfo">${totalsalesTransferDetailPages}</strong>
						
						    <!-- ✅ 추가: 총수량(From/To) -->
						    <span style="margin-left:10px;">|</span>
						    <span style="margin-left:10px;">${i18n.t('table.info.qty')} :</span>
						    <strong id="salesTransferDetailTotalFromQty" style="color:#007bff">0</strong>
						</span>

                        <div class="action-buttons-right mSales_transfer_detail">
                            <div id="defaultActions" class="action-group">
								<!--<input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminSalesTransferDetailDelete"/>-->
								${btnHtml}
								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnSalesTransferDetailDelete"/>
                                <button class="btn btn-success" id="salesTransferDetailExcelBtn" onclick="window.downloadAllsalesTransferDetailData_internal()">Excel</button>
                            </div>
                        </div>
						<div class="btnInterfaceCommon btnSalesTransferDetailItemsArea" style="margin-left:24px;">
							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfSalesTransferDetailDelete"/>
						</div>
                    </div>

                    <table class="data-table mSales_transfer_detail" id="salesTransferDetailTable">
                        <thead>
                            <tr>
								<th class = 'checkboxVal'>
									<input type="checkbox" class="salesTransferDetail_chkAll">
								</th>
                                <th class="noVal">${i18n.t('table.no')}</th>
								<th class='statusVal' data-sort="INTF_YN">${i18n.t('table.status')}<!-- STATUS --></th>
                                <th class="shortSet_1" data-sort="SDATE" data-type="string">${i18n.t('search.date')}</th>
                                <th class="itemcodeVal" data-sort="ITEMCODE" data-type="string">${i18n.t('search.itemCode')}</th>
                                <th class="itemnameVal" data-sort="ITEMNAME" data-type="string">${i18n.t('search.itemName')}</th>
                                <th class="qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
                                <th class="carVal" data-sort="CAR" data-type="string">${i18n.t('search.car')}</th>
                                <th class="loginidVal" data-sort="LOGINID" data-type="string">${i18n.t('search.userName')}</th>
                                <th class="itemcodeVal" data-sort="OITEMCODE" data-type="string">OITEMCODE</th>
                                <th class="seqVal" data-sort="SEQ" data-type="string">${i18n.t('table.seq')}</th>
                                <th class="itemcodeVal" data-sort="PRINTDATE" data-type="string">${i18n.t('search.printymdhms')}</th>
                                <th class = "locationVal" data-sort="WORKPLACE">${i18n.t('search.workCenter')}<!-- WORKPLACE --></th>
								<th class = "dateVal" data-sort="SHIFT">SHIFT<!-- SHIFT --></th>
                                <th class="memoVal" data-sort="PRODUCTBARCODE" data-type="string">BOX</th>
								<th class="barcodeVal" data-sort="BARCODE" data-type="string">LOT</th>
                            </tr>
                        </thead>
                        <tbody id="salesTransferDetailTableBody">
                        </tbody>
                    </table>

                    <!-- 페이지네이션 -->
                    <div class="pagination" id="salesTransferDetailPaginationContainer"></div>

                    <div class="items-per-page-selector">
                        <label for="salesTransferDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
                        <select id="salesTransferDetail_itemsPerPage" class="items-per-page-select">
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
			$('#salesTransferDetail_searchVal_toDate').val(toDate);
			$('#salesTransferDetail_searchVal_fromDate').val(fromDate);
			$('#salesTransferDetail_searchVal_factory').val(savedFactory || 'all');
			$('#salesTransferDetail_itemsPerPage').val(salesTransferDetailItemsPerPage);
			console.log('🎯 Select 초기값 설정됨:', salesTransferDetailItemsPerPage);
		})();

		renderFactoryStorage();
		rendersalesTransferDetailTableData();
		rendersalesTransferDetailPagination();
		bindsalesTransferDetailEvents();
		updatesalesTransferDetailTotalCount();
		updateTotalQty(); // ✅ 추가: 페이지 옆 총수량 즉시 갱신
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindsalesTransferDetailEvents() {
		// 검색 버튼
		$('.btnSalesTransferDetailSearch')
			.off('click')
			.on('click', function() {
				handleSalesTransferDetailSearch();
			});

		// 초기화 버튼
		$('.btnSalesTransferDetailSearchInit')
			.off('click')
			.on('click', function() {
				handleSalesTransferDetailSearchInit();
			});

		// 페이지당 항목 수 변경
		$('#salesTransferDetail_itemsPerPage')
			.off('change')
			.on('change', function() {
				const newItemsPerPage = parseInt($(this).val());
				handleChangeSalesTransferDetailItemsPerPage(newItemsPerPage);
			});

		// 페이지네이션 버튼
		$(document)
			.off('click', '.salesTransferDetail-page-btn')
			.on('click', '.salesTransferDetail-page-btn', function() {
				if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
					const page = parseInt($(this).data('page'));
					if (page && page > 0) {
						handlePageChange(page);
					}
				}
			});

		// 헤더 정렬
		$('#salesTransferDetailTable thead th[data-sort]')
			.off('click')
			.on('click', function() {
				const column = $(this).data('sort');
				const dataType = $(this).data('type') || 'string';
				handleSort(column, dataType);
			});

		// 엔터키 검색
		$('#view_mSales_transfer_detail input[type="text"], #view_mSales_transfer_detail input[type="date"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) {
					handleSalesTransferDetailSearch();
				}
			});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleSalesTransferDetailSearch() {
		const searchCriteria = getCurrentSearchCriteria();
		console.log('검색 조건:', searchCriteria);

		currentSalesTransferDetailPage = 1;
		performsalesTransferDetailDBSearch(searchCriteria);
	}

	function handleSalesTransferDetailSearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		$('#salesTransferDetail_searchVal_fromDate').val(fromDate);
		$('#salesTransferDetail_searchVal_toDate').val(toDate);
		$('#salesTransferDetail_searchVal_oitemcode').val('');
		$('#salesTransferDetail_searchVal_car').val('');
		$('#salesTransferDetail_searchVal_itemcode').val('');
		$('#salesTransferDetail_searchVal_itemname').val('');

		renderFactoryStorage();

		currentSalesTransferDetailPage = 1;
		performsalesTransferDetailDBSearch({ toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function handlePageChange(page) {
		currentSalesTransferDetailPage = page;
		applyClientPagination();
		rendersalesTransferDetailTableData();
		rendersalesTransferDetailPagination();
		updatesalesTransferDetailTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeSalesTransferDetailItemsPerPage(newItemsPerPage) {
		salesTransferDetailItemsPerPage = newItemsPerPage;
		currentSalesTransferDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		rendersalesTransferDetailTableData();
		rendersalesTransferDetailPagination();
		updatesalesTransferDetailTotalCount();
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

		$('#salesTransferDetailTotalFromQty').text(sumFrom.toLocaleString());
		$('#salesTransferDetailTotalToQty').text(sumTo.toLocaleString());
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// 메인 호출 함수
	window.call_mSales_transfer_detail = function(menuId) {
		function internalInit() {
			showLoading('data');
			const { fromDate, toDate } = getDefaultDateRange();
			const factory = 'SALTILLO'; // ✅ 고정
			const storage = 'Material';
			console.log('FACTORY - ' + factory);
			performsalesTransferDetailDBSearch({ fromDate, toDate, factory, storage });
		}
		internalInit();
	};

	// 엑셀 다운로드 (✅ 화면 정렬/필터 그대로 내보내기)
	window.downloadAllsalesTransferDetailData_internal = function() {
		function internalDownload() {
			// 🔹 현재 메모리에 있는 “미수령 전체 데이터” 사용
			//    - 정렬/검색/필터 반영된 상태 (unreceivedAllData)
			const excelData = buildsalesTransferDetailExcelData(unreceivedAllData);

			ExcelExporter.downloadExcel(excelData, salesTransferDetailColumns, {
				fileName: 'salesTransferDetail_All',
				sheetName: 'salesTransferDetail'
			});
		}

		internalDownload();
	};


	// 데이터 내보내기
	window.exportsalesTransferDetailData = function() {
		function internalExport() {
			return {
				total: unreceivedAllData.length,
				currentPage: currentSalesTransferDetailPage,
				itemsPerPage: salesTransferDetailItemsPerPage,
				data: unreceivedAllData
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeSalesTransferDetailItemsPerPage = function(newItemsPerPage) {
		function internalChange() {
			handleChangeSalesTransferDetailItemsPerPage(newItemsPerPage);
		}

		internalChange();
	};
	

	// 삭제
	$(document).on("click", ".btnSalesTransferDetailDelete", function() {			
		const iidList = [];
		$(".salesTransferDetail_chk:checked").each(function() {
			let iid = $(this).data('delete');
			iidList.push(iid);
		});
		
		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}
		
		if (!$(".salesTransferDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.interface.tryAgain'));
			
			let searchVal = getCurrentSearchCriteria();
			performsalesTransferDetailDBSearch(searchVal);	
			return;
		}
		
		if (!confirm(i18n.t('confirmation.items.delete'))) {
			return;
		}
		
		showLoading("data");

		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
		
		console.log(iidList)
		
		$.ajax({
			url: "/deleteSalesTransfer",
			type: "POST",
			data: JSON.stringify({
				iidList : iidList,
				loginid : loginid
			}),
			contentType: "application/json",
			success: function(data) {
	            if (!data.success) {
	                hideLoading();
	                
	                let message = "";
	                
	                // 검증 실패
	                if (data.failList && data.failList.length > 0){
	                	message = "Some items cannot be deleted\n\n"; // 삭제할 수 없는 항목이 있습니다.
	                    
	                    data.failList.forEach(function(item) {
	                    	if (item.failReason === 'INVALID_KIND'){
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
	                else if (data.failReason === 'DELETE_FAILED'){
	                	message = "Failed to delete\n\n";
	                	message += `Operation: ${data.failedOperation}\n`;
	                	message += `Barcode: ${data.failedBarcode}\n\n`;	
	                }   
	                
	                
	                alert(message);
	                return;
	            }

				alert(i18n.tf('success.barcode.delete', iidList.length));
				
				let searchVal = getCurrentSearchCriteria();
				performsalesTransferDetailDBSearch(searchVal);	
				
				// 전체 선택 해제
				$('.salesTransferDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});
	

	// 관리자용 삭제
	$(document).on("click", ".btnAdminSalesTransferDetailDelete", function() {			
		const iidList = [];
		$(".salesTransferDetail_chk:checked").each(function() {
			let iid = $(this).data('delete');
			iidList.push(iid);
		});
		
		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}
		
		if (!$(".salesTransferDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.interface.tryAgain'));;
			
			let searchVal = getCurrentSearchCriteria();
			performsalesTransferDetailDBSearch(searchVal);	
			return;
		}
		
		if (!confirm(i18n.t('confirmation.items.delete'))) {
			return;
		}
		console.log(iidList);
		const reason = prompt("사유를 입력해 주세요");
		
		if (reason === null) return;
		
	    if (reason.trim() === "") {
	        alert("내용이 비어 있습니다.");
	        return;
	    }
	    
		showLoading("data");

		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
		
		console.log(iidList)
		$.ajax({
			url: "/deleteSalesTransfer",
			type: "POST",
			data: JSON.stringify({
				iidList: iidList,
				loginid: loginid,
				reason: reason,
				admin: true
			}),
			contentType: "application/json",
			success: function(data) {
				hideLoading();
				if (data.success) {
					alert(i18n.tf('success.barcode.delete', iidList.length));

					let searchVal = getCurrentSearchCriteria();
					performsalesTransferDetailDBSearch(searchVal);	
					
					// 전체 선택 해제
					$('.salesTransferDetail_chkAll').prop('checked', false);
				} else {
			        alert("삭제에 실패했습니다.");
			    }
				
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});
	

	// 인터페이스 삭제
	$(document).on("click", ".btnIntfSalesTransferDetailDelete", function() {
		if ($(".salesTransferDetail_chk status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}

		const iidList = [];
		$(".salesTransferDetail_chk:checked").each(function() {
			let iid = $(this).data('unique');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}
		
		if (!confirm(i18n.t('confirmation.interface.progress'))) return;
		
		showLoading("data");

		console.log(iidList)
		$.ajax({
			url: "/salesTransfer_confirm_cancel",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performsalesTransferDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.productionDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}
		});

	});


	// ============================================================
	// ✅ 초기화 - $(document).ready
	// ============================================================
	$(document).ready(function() {
		// 초기화 코드 필요시 여기 추가
	});
	$(document).on('click', '.salesTransferDetail_chkAll', function () {
	    const isChecked = $(this).prop('checked');
	    $('input.salesTransferDetail_chk').prop('checked', isChecked);
	});
})(); // ← IIFE 종료 - 모든 변수/함수 격리됨
