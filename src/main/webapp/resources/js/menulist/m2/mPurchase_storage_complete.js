/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 완료 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];
	let filteredData_purchaseStorageComplete = [];
	let globalStorageCompleteData = [];
	let currentStorageCompletePage = 1;
	let storageCompleteItemsPerPage = 100;
	let totalStorageCompleteCount = 0;
	let totalStorageCompletePages = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let totalQty = 0;
	let totalFromQtyAll = 0;
	let totalToQtyAll = 0;

	// ✅ 전역 데이터
	let filteredStorageCompleteData = [];
	let storageCompleteColumns = [
		{ key: 'FROMSTORAGE', header: 'Sent Storage' },
		{ key: 'FROMDATE', header: 'Sent Date' },
		{ key: 'TOSTORAGE', header: 'Receive Storage' },
		{ key: 'TODATE', header: 'Receive Date' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Item Code' },
		{ key: 'OITEMCODE', header: 'Spec' },
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
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
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
			fromDate: $("#storageComplete_searchVal_fromDate").val(),
			toDate: $("#storageComplete_searchVal_toDate").val(),
			fromStorage: $("#storageComplete_searchVal_fromStorage").val(),
			toStorage: $("#storageComplete_searchVal_toStorage").val(),
			scan: $("#storageComplete_searchVal_scan").val(),
			itemcode: ($("#storageComplete_searchVal_itemcode").val() || '').trim().toUpperCase(),
			oitemcode: ($("#storageComplete_searchVal_oitemcode").val() || '').trim().toUpperCase(),
			itemname: ($("#storageComplete_searchVal_itemname").val() || '').trim().toUpperCase()
		};
	}

	function performStorageCompleteDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_storageComplete",
			type: "POST",
			data: JSON.stringify({ searchParams: searchCriteria }),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				allServerData = response.records || [];
				filteredData_purchaseStorageComplete = [...allServerData];
				totalQty = response.totalQty || 0;

				// ✅ 기존 정렬 상태 백업
				const prevSortColumn = currentSortColumn;
				const prevSortOrder = currentSortOrder;

				// ✅ 뷰 신규 생성 여부
				const isNewView = !$('#view_mPurchase_storage_complete').length;

				currentStorageCompletePage = 1;

				// ✅ 먼저 페이징 계산
				applyClientPagination();

				// ✅ 뷰 없으면 생성 (생성 내부에서 렌더/바인딩/업데이트까지 진행됨)
				if (isNewView) {
					renderStorageCompleteView();
				}

				// ✅ 정렬 유지 적용
				if (prevSortColumn) {
					currentSortColumn = prevSortColumn;
					currentSortOrder = prevSortOrder;

					const colDef = storageCompleteColumns.find(c => c.key === currentSortColumn);
					const dataType = colDef?.type || 'string';

					sortDataOnly(currentSortColumn, dataType);
					applyClientPagination();

					updateSortIndicators(currentSortColumn);
				}

				// ✅ 기존 뷰일 때만 여기서 다시 렌더 (신규 생성이면 renderStorageCompleteView()가 이미 렌더함)
				if (!isNewView) {
					renderStorageCompleteTableData();
					renderStorageCompletePagination();
					updateStorageCompleteTotalCount();
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



	/** ✅ 토글 없이 정렬만 수행하는 함수(추가) */
	function sortDataOnly(column, dataType) {
		filteredData_purchaseStorageComplete.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

			if (dataType === 'number') {
				valA = parseFloat(valA) || 0;
				valB = parseFloat(valB) || 0;
			} else if (dataType === 'date') {
				const toTime = (v) => {
					if (!v) return 0;
					const s = String(v).trim().replace(' ', 'T');
					const t = Date.parse(s);
					return isNaN(t) ? 0 : t;
				};
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


	// ============================================================
	// ✅ 페이징/정렬 함수 - IIFE 내부
	// ============================================================
	function applyClientPagination() {
		storageCompleteItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalStorageCompleteCount = filteredData_purchaseStorageComplete.length;
		totalStorageCompletePages = Math.ceil(totalStorageCompleteCount / storageCompleteItemsPerPage);

		const startIndex = (currentStorageCompletePage - 1) * storageCompleteItemsPerPage;
		const endIndex = startIndex + storageCompleteItemsPerPage;

		globalStorageCompleteData = filteredData_purchaseStorageComplete.slice(startIndex, endIndex);
		filteredStorageCompleteData = globalStorageCompleteData;
	}

	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_purchaseStorageComplete.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

			if (dataType === 'number') {
				valA = parseFloat(valA) || 0;
				valB = parseFloat(valB) || 0;
			} else if (dataType === 'date') {
				const toTime = (v) => {
					if (!v) return 0;
					const s = String(v).replace(' ', 'T'); // '2025-12-12 10:11:12' -> '2025-12-12T10:11:12'
					const t = Date.parse(s);
					return isNaN(t) ? 0 : t;
				};
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

		currentStorageCompletePage = 1;
		applyClientPagination();

		renderStorageCompleteTableData();
		renderStorageCompletePagination();
		updateStorageCompleteTotalCount();

		updateSortIndicators(column);
	}

	function updateSortIndicators(column) {
		$('#storageCompleteTable thead th').removeClass('sort-asc sort-desc');
		$(`#storageCompleteTable thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updateStorageCompleteTotalCount() {
		// 🔹 건수 / 페이지 정보 유지
		$('#storageCompleteTotalCount').text(Number(totalStorageCompleteCount).toLocaleString());
		$('#storageCompleteCurrentPageInfo').text(currentStorageCompletePage);
		$('#storageCompleteTotalPageInfo').text(totalStorageCompletePages);

		// 🔹 FROMQTY / TOQTY 전체 합계 계산 (현재 필터된 전체 데이터 기준)
		let fromSum = 0;
		let toSum = 0;

		for (let i = 0; i < filteredData_purchaseStorageComplete.length; i++) {
			const row = filteredData_purchaseStorageComplete[i];
			const fromVal = Number(row.FROMQTY || row.fromqty || 0);
			const toVal = Number(row.TOQTY || row.toqty || 0);

			if (!isNaN(fromVal)) fromSum += fromVal;
			if (!isNaN(toVal)) toSum += toVal;
		}

		// 필요 시 전역 변수에 보관
		totalFromQtyAll = fromSum;
		totalToQtyAll = toSum;

		// 화면 반영
		$('#storageCompleteTotalFromQty').text(fromSum.toLocaleString());
		$('#storageCompleteTotalToQty').text(toSum.toLocaleString());
	}


	function renderStorageCompleteTableData() {
		let tableBody = "";

		for (let i = 0; i < globalStorageCompleteData.length; i++) {
			let rowNumber = (currentStorageCompletePage - 1) * storageCompleteItemsPerPage + i + 1;

			tableBody += `
            <tr>
                <td class="noVal">${rowNumber}</td>
                <td class="itemcodeVal">${globalStorageCompleteData[i].FROMSTORAGE || globalStorageCompleteData[i].fromstorage || ''}</td>
                <td class="itemcodeVal">${globalStorageCompleteData[i].FROMDATE || globalStorageCompleteData[i].fromdate || ''}</td>
				<td class="wccodeVal">${globalStorageCompleteData[i].TOSTORAGE || globalStorageCompleteData[i].tostorage || ''}</td>
                <td class="itemcodeVal">${globalStorageCompleteData[i].TODATE || globalStorageCompleteData[i].todate || ''}</td>
                <td class="carVal">${globalStorageCompleteData[i].CAR || globalStorageCompleteData[i].car || ''}</td>
                <td class="itemcodeVal">${globalStorageCompleteData[i].ITEMCODE || globalStorageCompleteData[i].itemcode || ''}</td>
                <td class="cnameVal">${globalStorageCompleteData[i].OITEMCODE || globalStorageCompleteData[i].oitemcode || ''}</td>
                <td class="itemnameVal">${globalStorageCompleteData[i].ITEMNAME || globalStorageCompleteData[i].itemname || ''}</td>
                <td class="scanqtyVal">${Number(globalStorageCompleteData[i].FROMQTY || globalStorageCompleteData[i].fromqty || 0).toLocaleString()}</td>
                <td class="unpackqtyVal">${Number(globalStorageCompleteData[i].TOQTY || globalStorageCompleteData[i].toqty || 0).toLocaleString()}</td>
                <td class="barcodeVal">${globalStorageCompleteData[i].BARCODE || globalStorageCompleteData[i].barcode || ''}</td>
            </tr>
        `;
		}

		$("#storageCompleteDetailTableBody").html(tableBody);
	}

	function renderStorageCompletePagination() {
		let paginationHtml = "";

		if (currentStorageCompletePage > 1) {
			paginationHtml += `<button class="storageComplete-page-btn" data-page="${currentStorageCompletePage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="storageComplete-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentStorageCompletePage - 5);
		let endPage = Math.min(totalStorageCompletePages, currentStorageCompletePage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="storageComplete-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStorageCompletePage) {
				paginationHtml += `<button class="storageComplete-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="storageComplete-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalStorageCompletePages) {
			if (endPage < totalStorageCompletePages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="storageComplete-page-btn" data-page="${totalStorageCompletePages}">${totalStorageCompletePages}</button>`;
		}

		if (currentStorageCompletePage < totalStorageCompletePages) {
			paginationHtml += `<button class="storageComplete-page-btn" data-page="${currentStorageCompletePage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="storageComplete-page-btn disabled">&gt;</button>`;
		}

		$("#storageCompletePaginationContainer").html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		const fromStorage = $('#storageComplete_searchVal_fromStorage');
		const toStorage = $('#storageComplete_searchVal_toStorage');

		const storageList = ['INBOUND', 'PRODUCT', 'OUTSIDE', 'all'];

		function updateStorageOptions($targetStorage) {
			// ✅ 기존 선택값 보관
			const prevSelected = $targetStorage.val();

			$targetStorage.empty();

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				$targetStorage.append(`<option value="${item}">${text}</option>`);
			});

			// ✅ 기존 선택값 유지 (있고, 옵션 목록에도 존재하면 유지)
			if (prevSelected && $targetStorage.find(`option[value="${prevSelected}"]`).length) {
				$targetStorage.val(prevSelected);
				return;
			}

			$targetStorage.val('all');
		}

		// ✅ 초기 옵션 채우기
		updateStorageOptions(fromStorage);
		updateStorageOptions(toStorage);

		// ✅ fromStorage 변경 시 toStorage는 무조건 all
		fromStorage.on('change', function() {
			toStorage.val('all');
		});
	}

	// ============================================================
	// ✅ 뷰 렌더링 함수 - IIFE 내부
	// ============================================================
	function renderStorageCompleteView() {
		let content_output = `
		<div class="divBlockControl" id="view_mPurchase_storage_complete">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
							<input type="date" id="storageComplete_searchVal_fromDate" /> 
						</div>
						<div class="search-label">
							<div class="searchVal_toDate">　</div>
							<input type="date" id="storageComplete_searchVal_toDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_fromStorage">${i18n.t('search.sentstorage')}</div>
							<select id="storageComplete_searchVal_fromStorage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_toStorage">${i18n.t('search.receivestorage')}</div>
							<select id="storageComplete_searchVal_toStorage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_scan">${i18n.t('search.scanType.load')}</div>
							<select id="storageComplete_searchVal_scan" >
								<option value="all">${i18n.t('search.all')}</option>
								<option value="Y">Y</option>
								<option value="N">N</option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
							<input type="text" id="storageComplete_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_oitemcode">${i18n.t('search.customercode')}</div>
							<input type="text" id="storageComplete_searchVal_oitemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
							<input type="text" id="storageComplete_searchVal_itemname" />
						</div>
					</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnStorageCompleteSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnStorageCompleteSearchInit">${i18n.t('btn.clear')}</button>
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
					        <strong id="storageCompleteTotalCount">${totalStorageCompleteCount}</strong> 
					        ${i18n.t('table.info.records')} | 
					        ${i18n.t('table.page')} 
					        <strong id="storageCompleteCurrentPageInfo">${currentStorageCompletePage}</strong> /
					        <strong id="storageCompleteTotalPageInfo">${totalStorageCompletePages}</strong>
					        <!-- 🔽 여기부터 추가 -->
					        | ${i18n.t('search.qty.out')} :
					        <strong id="storageCompleteTotalFromQty">0</strong>
					        | ${i18n.t('search.qty.in')} :
					        <strong id="storageCompleteTotalToQty">0</strong>
					        <!-- 🔼 합계 영역 -->
					    </span>
					    <div class="action-buttons-right mPurchase_storage_complete">
					        <div id="defaultActions" class="action-group">
					            <button class="btn btn-success" id="storageCompleteExcelBtn">Excel</button>
					        </div>
					    </div>
					</div>
					<table class="data-table mPurchase_storage_complete" id="storageCompleteTable">
						<thead>
							<tr>
								<th class="noVal">${i18n.t('table.no')}</th>
								<th class="storageVal" data-sort="FROMSTORAGE">${i18n.t('search.sentstorage')}</th>
								<th class="itemcodeVal" data-sort="FROMDATE" data-type="date">${i18n.t('search.sentdate')}</th>
								<th class="storageVal" data-sort="TOSTORAGE">${i18n.t('search.receivestorage')}</th>
								<th class="itemcodeVal" data-sort="TODATE" data-type="date">${i18n.t('search.receivedate')}</th>
								<th class="carVal" data-sort="CAR">${i18n.t('search.car')}</th>
								<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
								<th class="cnameVal" data-sort="OITEMCODE">${i18n.t('search.customercode')}</th>
								<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
								<th class="scanqtyVal" data-sort="FROMQTY" data-type="number">${i18n.t('search.qty.out')}</th>
								<th class="unpackqtyVal" data-sort="TOQTY" data-type="number">${i18n.t('search.qty.in')}</th>
								<th class="barcodeVal" data-sort="BARCODE">LOT</th>
							</tr>
						</thead>
						<tbody id="storageCompleteDetailTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="storageCompletePaginationContainer">
					</div>
					<div class="items-per-page-selector">
				        <label for="storageComplete_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
				        <select id="storageComplete_itemsPerPage" class="items-per-page-select">
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

		(function() {
			const { fromDate, toDate } = getDefaultDateRange();

			// ✅ 쿠키 반영해서 UI와 로직 통일
			storageCompleteItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

			$("#storageComplete_searchVal_toDate").val(toDate);
			$("#storageComplete_searchVal_fromDate").val(fromDate);
			$("#storageComplete_itemsPerPage").val(storageCompleteItemsPerPage);
		})();

		renderFactoryStorage();
		renderStorageCompleteTableData();
		renderStorageCompletePagination();
		bindStorageCompleteEvents();
		updateStorageCompleteTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindStorageCompleteEvents() {
		// Excel 버튼
		$('#storageCompleteExcelBtn').off('click').on('click', function() {
			downloadStorageCompleteExcel('all');   // ✅ 전체(정렬/필터 반영)
			// downloadStorageCompleteExcel('page'); // ✅ 현재 페이지만 원하면 이걸로
		});

		// 검색 버튼
		$(".btnStorageCompleteSearch").off('click').on('click', function() {
			handleStorageCompleteSearch();
		});

		// 초기화 버튼
		$(".btnStorageCompleteSearchInit").off('click').on('click', function() {
			handleStorageCompleteSearchInit();
		});

		// 페이지당 항목 수 변경
		$('#storageComplete_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			handleChangeStorageCompleteItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼
		$(document).off('click', '.storageComplete-page-btn').on('click', '.storageComplete-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					handlePageChange(page);
				}
			}
		});

		// 헤더 정렬
		$('#storageCompleteTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');

			// ✅ 1차: th data-type
			let dataType = $(this).attr('data-type') || $(this).data('type') || 'string';

			// ✅ 2차: columns 정의(type)로 보정
			if (dataType === 'string') {
				const colDef = storageCompleteColumns.find(c => c.key === column);
				if (colDef && colDef.type) dataType = colDef.type;
			}

			handleSort(column, dataType);
		});


		// 엔터키 검색
		$('#view_mPurchase_storage_complete input[type="text"], #view_mPurchase_storage_complete input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				handleStorageCompleteSearch();
			}
		});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleStorageCompleteSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentStorageCompletePage = 1;
		performStorageCompleteDBSearch(searchCriteria);
	}

	function handleStorageCompleteSearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		const fromStorage = 'all'; // 기본값
		const toStorage = 'all';
		const scan = 'all';

		// ✅ UI 값도 같이 초기화(서버/화면 불일치 방지)
		$("#storageComplete_searchVal_fromDate").val(fromDate);
		$("#storageComplete_searchVal_toDate").val(toDate);
		$("#storageComplete_searchVal_itemcode").val('');
		$("#storageComplete_searchVal_oitemcode").val('');
		$("#storageComplete_searchVal_itemname").val('');
		$("#storageComplete_searchVal_scan").val(scan);

		renderFactoryStorage();

		currentStorageCompletePage = 1;

		// ✅ 서버로 보내는 키 정확히 맞춤
		performStorageCompleteDBSearch({ fromDate, toDate,  fromStorage, toStorage, scan });

		console.log('검색 조건이 초기화되었습니다.');
	}


	function handlePageChange(page) {
		currentStorageCompletePage = page;
		applyClientPagination();
		renderStorageCompleteTableData();
		renderStorageCompletePagination();
		updateStorageCompleteTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeStorageCompleteItemsPerPage(newItemsPerPage) {
		storageCompleteItemsPerPage = newItemsPerPage;
		currentStorageCompletePage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderStorageCompleteTableData();
		renderStorageCompletePagination();
		updateStorageCompleteTotalCount();
	}
	function downloadStorageCompleteExcel(mode = 'all') {
		// mode: 'all' | 'page'
		const excelData = (mode === 'page')
			? (Array.isArray(globalStorageCompleteData) ? [...globalStorageCompleteData] : [])
			: (Array.isArray(filteredData_purchaseStorageComplete) ? [...filteredData_purchaseStorageComplete] : []);

		ExcelExporter.downloadExcel(excelData, storageCompleteColumns, {
			fileName: mode === 'page' ? 'storageComplete_CurrentPage' : 'storageComplete_All',
			sheetName: 'storageComplete'
		});
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// 메인 호출 함수
	window.call_mPurchase_storage_complete = function(menuId) {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalInit() {
			showLoading("data");

			const { fromDate, toDate } = getDefaultDateRange();
			const fromStorage = 'all'; // 기본값
			const toStorage = 'all';

			performStorageCompleteDBSearch({ fromDate, toDate,  fromStorage, toStorage });
		}

		internalInit();
	};


	// 데이터 내보내기
	window.exportStorageCompleteData = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalExport() {
			return {
				total: filteredData_purchaseStorageComplete.length,
				currentPage: currentStorageCompletePage,
				itemsPerPage: storageCompleteItemsPerPage,
				data: filteredData_purchaseStorageComplete
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeStorageCompleteItemsPerPage = function(newItemsPerPage) {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalChange() {
			handleChangeStorageCompleteItemsPerPage(newItemsPerPage);
		}

		internalChange();
	};

	// ============================================================
	// ✅ 초기화
	// ============================================================
	$(document).ready(function() {
		// 필요시 초기화 코드 추가
	});

})(); // ← IIFE 종료 - 모든 변수/함수 격리됨