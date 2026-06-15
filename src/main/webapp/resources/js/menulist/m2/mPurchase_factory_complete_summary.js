/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 완료 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];
	let filteredData_purchaseFactoryCompleteSummary = [];
	let globalfactoryCompleteSummaryData = [];
	let currentfactoryCompleteSummaryPage = 1;
	let factoryCompleteSummaryItemsPerPage = 100;
	let totalfactoryCompleteSummaryCount = 0;
	let totalfactoryCompleteSummaryPages = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let menuType = null;
	let saveStorageForInit = null;
	let totalQty = 0;
	let totalFromQtyAll = 0;
	let totalToQtyAll = 0;


	// ✅ 전역 데이터
	let filteredfactoryCompleteSummaryData = [];
	let factoryCompleteSummaryColumns = [
		{ key: 'FROMFACTORY', header: 'Sent Factory' },
		{ key: 'FROMDATE', header: 'Sent Date' },
		{ key: 'TOFACTORY', header: 'Receive Factory' },
		{ key: 'TOSTORAGE', header: 'Receive Storage' },
		{ key: 'TODATE', header: 'Receive Date' },
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
		const fromDate = fmtLocalDate(today);
		return { fromDate, toDate };
	}

	// ============================================================
	// ✅ 검색/필터링 함수 - IIFE 내부
	// ============================================================
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#factoryCompleteSummary_searchVal_fromDate").val(),
			toDate: $("#factoryCompleteSummary_searchVal_toDate").val(),
			factory: $("#factoryCompleteSummary_searchVal_factory").val(),
			moveFactory: $("#factoryCompleteSummary_searchVal_moveFactory").val(),
			moveStorage: $("#factoryCompleteSummary_searchVal_storage").val(),
			scan: $("#factoryCompleteSummary_searchVal_scan").val(),
			itemcode: ($("#factoryCompleteSummary_searchVal_itemcode").val() || '').trim().toUpperCase(),
			itemname: ($("#factoryCompleteSummary_searchVal_itemname").val() || '').trim().toUpperCase()
		};
	}

	function performfactoryCompleteSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_factoryCompleteSummary",
			type: "POST",
			data: JSON.stringify({ searchParams: searchCriteria }),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				allServerData = response.records || [];
				filteredData_purchaseFactoryCompleteSummary = [...allServerData];
				totalQty = response.totalQty || 0;

				// ✅ 기존 정렬 상태 백업
				const prevSortColumn = currentSortColumn;
				const prevSortOrder = currentSortOrder;

				// ✅ 뷰 신규 생성 여부
				const isNewView = !$('#view_mPurchase_factory_complete_summary').length;

				currentfactoryCompleteSummaryPage = 1;

				// ✅ 먼저 페이징 계산
				applyClientPagination();

				// ✅ 뷰 없으면 생성 (생성 내부에서 렌더/바인딩/업데이트까지 진행됨)
				if (isNewView) {
					renderfactoryCompleteSummaryView();
				}

				// ✅ 정렬 유지 적용
				if (prevSortColumn) {
					currentSortColumn = prevSortColumn;
					currentSortOrder = prevSortOrder;

					const colDef = factoryCompleteSummaryColumns.find(c => c.key === currentSortColumn);
					const dataType = colDef?.type || 'string';

					sortDataOnly(currentSortColumn, dataType);
					applyClientPagination();

					updateSortIndicators(currentSortColumn);
				}

				// ✅ 기존 뷰일 때만 여기서 다시 렌더 (신규 생성이면 renderfactoryCompleteSummaryView()가 이미 렌더함)
				if (!isNewView) {
					renderfactoryCompleteSummaryTableData();
					renderfactoryCompleteSummaryPagination();
					updatefactoryCompleteSummaryTotalCount();
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
		filteredData_purchaseFactoryCompleteSummary.sort((a, b) => {
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
		factoryCompleteSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalfactoryCompleteSummaryCount = filteredData_purchaseFactoryCompleteSummary.length;
		totalfactoryCompleteSummaryPages = Math.ceil(totalfactoryCompleteSummaryCount / factoryCompleteSummaryItemsPerPage);

		const startIndex = (currentfactoryCompleteSummaryPage - 1) * factoryCompleteSummaryItemsPerPage;
		const endIndex = startIndex + factoryCompleteSummaryItemsPerPage;

		globalfactoryCompleteSummaryData = filteredData_purchaseFactoryCompleteSummary.slice(startIndex, endIndex);
		filteredfactoryCompleteSummaryData = globalfactoryCompleteSummaryData;
	}

	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_purchaseFactoryCompleteSummary.sort((a, b) => {
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

		currentfactoryCompleteSummaryPage = 1;
		applyClientPagination();

		renderfactoryCompleteSummaryTableData();
		renderfactoryCompleteSummaryPagination();
		updatefactoryCompleteSummaryTotalCount();

		updateSortIndicators(column);
	}

	function updateSortIndicators(column) {
		$('#factoryCompleteSummaryTable thead th').removeClass('sort-asc sort-desc');
		$(`#factoryCompleteSummaryTable thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatefactoryCompleteSummaryTotalCount() {
		// 🔹 건수 / 페이지 정보 유지
		$('#factoryCompleteSummaryTotalCount').text(Number(totalfactoryCompleteSummaryCount).toLocaleString());
		$('#factoryCompleteSummaryCurrentPageInfo').text(currentfactoryCompleteSummaryPage);
		$('#factoryCompleteSummaryTotalPageInfo').text(totalfactoryCompleteSummaryPages);

		// 🔹 FROMQTY / TOQTY 전체 합계 계산 (현재 필터된 전체 데이터 기준)
		let fromSum = 0;
		let toSum = 0;

		for (let i = 0; i < filteredData_purchaseFactoryCompleteSummary.length; i++) {
			const row = filteredData_purchaseFactoryCompleteSummary[i];
			const fromVal = Number(row.FROMQTY || row.fromqty || 0);
			const toVal = Number(row.TOQTY || row.toqty || 0);

			if (!isNaN(fromVal)) fromSum += fromVal;
			if (!isNaN(toVal)) toSum += toVal;
		}

		// 필요 시 전역 변수에 보관
		totalFromQtyAll = fromSum;
		totalToQtyAll = toSum;

		// 화면 반영
		$('#factoryCompleteSummaryTotalFromQty').text(fromSum.toLocaleString());
		$('#factoryCompleteSummaryTotalToQty').text(toSum.toLocaleString());
	}


	function renderfactoryCompleteSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalfactoryCompleteSummaryData.length; i++) {
			let rowNumber = (currentfactoryCompleteSummaryPage - 1) * factoryCompleteSummaryItemsPerPage + i + 1;

			tableBody += `
            <tr>
                <td class="noVal">${rowNumber}</td>
                <td class="itemcodeVal">${globalfactoryCompleteSummaryData[i].FROMFACTORY || globalfactoryCompleteSummaryData[i].fromfactory || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteSummaryData[i].FROMDATE || globalfactoryCompleteSummaryData[i].fromdate || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteSummaryData[i].TOFACTORY || globalfactoryCompleteSummaryData[i].tofactory || ''}</td>
				<td class="wccodeVal">${globalfactoryCompleteSummaryData[i].TOSTORAGE || globalfactoryCompleteSummaryData[i].tostorage || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteSummaryData[i].TODATE || globalfactoryCompleteSummaryData[i].todate || ''}</td>
                <td class="carVal">${globalfactoryCompleteSummaryData[i].CAR || globalfactoryCompleteSummaryData[i].car || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteSummaryData[i].ITEMCODE || globalfactoryCompleteSummaryData[i].itemcode || ''}</td>
                <td class="itemnameVal">${globalfactoryCompleteSummaryData[i].ITEMNAME || globalfactoryCompleteSummaryData[i].itemname || ''}</td>
                <td class="scanqtyVal">${Number(globalfactoryCompleteSummaryData[i].FROMQTY || globalfactoryCompleteSummaryData[i].fromqty || 0).toLocaleString()}</td>
                <td class="unpackqtyVal">${Number(globalfactoryCompleteSummaryData[i].TOQTY || globalfactoryCompleteSummaryData[i].toqty || 0).toLocaleString()}</td>
            </tr>
        `;
		}

		$("#factoryCompleteSummaryDetailTableBody").html(tableBody);
	}

	function renderfactoryCompleteSummaryPagination() {
		let paginationHtml = "";

		if (currentfactoryCompleteSummaryPage > 1) {
			paginationHtml += `<button class="factoryCompleteSummary-page-btn" data-page="${currentfactoryCompleteSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryCompleteSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentfactoryCompleteSummaryPage - 5);
		let endPage = Math.min(totalfactoryCompleteSummaryPages, currentfactoryCompleteSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="factoryCompleteSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentfactoryCompleteSummaryPage) {
				paginationHtml += `<button class="factoryCompleteSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryCompleteSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalfactoryCompleteSummaryPages) {
			if (endPage < totalfactoryCompleteSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryCompleteSummary-page-btn" data-page="${totalfactoryCompleteSummaryPages}">${totalfactoryCompleteSummaryPages}</button>`;
		}

		if (currentfactoryCompleteSummaryPage < totalfactoryCompleteSummaryPages) {
			paginationHtml += `<button class="factoryCompleteSummary-page-btn" data-page="${currentfactoryCompleteSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryCompleteSummary-page-btn disabled">&gt;</button>`;
		}

		$("#factoryCompleteSummaryPaginationContainer").html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		const factory = $('#factoryCompleteSummary_searchVal_factory');
		const moveFactory = $('#factoryCompleteSummary_searchVal_moveFactory');
		const storage = $('#factoryCompleteSummary_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		function updateStorageOptions(factoryValue) {
			// ✅ 기존 선택값(사용자 선택/초기화값) 보관
			const prevSelected = storage.val();

			storage.empty();

			const options = {
				'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'P1 W/HOUSE', 'all'],
				'PUEBLA': ['Material', 'PRODUCT', 'all'],
				'all': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'P1 W/HOUSE', 'all']
			};

			const storageList = options[factoryValue] || options['all'];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			// ✅ 1순위: 기존 선택값 유지 (있고, 이번 옵션 목록에도 존재하면 유지)
			if (prevSelected && storage.find(`option[value="${prevSelected}"]`).length) {
				storage.val(prevSelected);
				return;
			}

			// ✅ 2순위: menuType 기본값 (선택값이 없거나 유효하지 않을 때만)
			if (menuType === "purchase") {
				saveStorageForInit = "Material";
				storage.val('Material');
			} else if (menuType === "fabric") {
				saveStorageForInit = "Fabric";
				storage.val('Fabric');
			} else if (menuType === "sales") {
				saveStorageForInit = "P1 W/HOUSE";
				storage.val('P1 W/HOUSE');
			} else {
				saveStorageForInit = "Material";
				storage.val('Material');
			}
		}


		function getOppositeFactory(currentFactory) {
			if (currentFactory === 'SALTILLO') return 'PUEBLA';
			if (currentFactory === 'PUEBLA') return 'SALTILLO';
			return 'all';
		}

		if (savedFactory) {
			const sentFactory = getOppositeFactory(savedFactory);
			factory.val(sentFactory);
			moveFactory.val(savedFactory);
		}

		updateStorageOptions(moveFactory.val() || savedFactory || '');

		factory.on('change', function() {
			const selectedFactory = $(this).val();
			const oppositeFactory = getOppositeFactory(selectedFactory);

			moveFactory.val(oppositeFactory);
			updateStorageOptions(oppositeFactory);
		});

		moveFactory.on('change', function() {
			const selectedMoveFactory = $(this).val();
			const oppositeFactory = getOppositeFactory(selectedMoveFactory);

			factory.val(oppositeFactory);
			updateStorageOptions(selectedMoveFactory);
		});
	}

	// ============================================================
	// ✅ 뷰 렌더링 함수 - IIFE 내부
	// ============================================================
	function renderfactoryCompleteSummaryView() {
		let content_output = `
		<div class="divBlockControl" id="view_mPurchase_factory_complete_summary">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="searchVal_fromDate"> ${i18n.t('search.date')}</div>
							<input type="date" id="factoryCompleteSummary_searchVal_fromDate" /> 
						</div>
						<div class="search-label">
							<div class="searchVal_toDate">　</div>
							<input type="date" id="factoryCompleteSummary_searchVal_toDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.sentfactory')}</div>
							<select id="factoryCompleteSummary_searchVal_factory" >
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}</option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_moveFactory">${i18n.t('search.receivefactory')}</div>
							<select id="factoryCompleteSummary_searchVal_moveFactory" >
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}</option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_moveStorage">${i18n.t('search.receivestorage')}</div>
							<select id="factoryCompleteSummary_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_scan">${i18n.t('search.scanType.load')}</div>
							<select id="factoryCompleteSummary_searchVal_scan" >
								<option value="all">${i18n.t('search.all')}</option>
								<option value="Y">Y</option>
								<option value="N">N</option>
							</select>
						</div>						
						<div class="search-label">
							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
							<input type="text" id="factoryCompleteSummary_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
							<input type="text" id="factoryCompleteSummary_searchVal_itemname" />
						</div>
					</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnFactoryCompleteSummarySearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnFactoryCompleteSummarySearchInit">${i18n.t('btn.clear')}</button>
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
					        <strong id="factoryCompleteSummaryTotalCount">${totalfactoryCompleteSummaryCount}</strong> 
					        ${i18n.t('table.info.records')} | 
					        ${i18n.t('table.page')} 
					        <strong id="factoryCompleteSummaryCurrentPageInfo">${currentfactoryCompleteSummaryPage}</strong> /
					        <strong id="factoryCompleteSummaryTotalPageInfo">${totalfactoryCompleteSummaryPages}</strong>
					        <!-- 🔽 여기부터 추가 -->
					        | ${i18n.t('search.qty.out')} :
					        <strong id="factoryCompleteSummaryTotalFromQty">0</strong>
					        | ${i18n.t('search.qty.in')} :
					        <strong id="factoryCompleteSummaryTotalToQty">0</strong>
					        <!-- 🔼 합계 영역 -->
					    </span>
					    <div class="action-buttons-right mPurchase_factory_complete_summary">
					        <div id="defaultActions" class="action-group">
					            <button class="btn btn-success" id="factoryCompleteSummaryExcelBtn">Excel</button>
					        </div>
					    </div>
					</div>
					<table class="data-table mPurchase_factory_complete_summary" id="factoryCompleteSummaryTable">
						<thead>
							<tr>
								<th class="noVal">${i18n.t('table.no')}</th>
								<th class="itemcodeVal" data-sort="FROMFACTORY">${i18n.t('search.sentfactory')}</th>
								<th class="itemcodeVal" data-sort="FROMDATE" data-type="date">${i18n.t('search.sentdate')}</th>
								<th class="itemcodeVal" data-sort="TOFACTORY">${i18n.t('search.receivefactory')}</th>
								<th class="wccodeVal" data-sort="TOSTORAGE">${i18n.t('search.receivestorage')}</th>
								<th class="itemcodeVal" data-sort="TODATE" data-type="date">${i18n.t('search.receivedate')}</th>
								<th class="carVal" data-sort="CAR">${i18n.t('search.car')}</th>
								<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
								<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
								<th class="scanqtyVal" data-sort="FROMQTY" data-type="number">${i18n.t('search.qty.out')}</th>
								<th class="unpackqtyVal" data-sort="TOQTY" data-type="number">${i18n.t('search.qty.in')}</th>
							</tr>
						</thead>
						<tbody id="factoryCompleteSummaryDetailTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="factoryCompleteSummaryPaginationContainer">
					</div>
					<div class="items-per-page-selector">
				        <label for="factoryCompleteSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
				        <select id="factoryCompleteSummary_itemsPerPage" class="items-per-page-select">
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
			factoryCompleteSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

			$("#factoryCompleteSummary_searchVal_toDate").val(toDate);
			$("#factoryCompleteSummary_searchVal_fromDate").val(fromDate);
			$("#factoryCompleteSummary_itemsPerPage").val(factoryCompleteSummaryItemsPerPage);
		})();

		renderFactoryStorage();
		renderfactoryCompleteSummaryTableData();
		renderfactoryCompleteSummaryPagination();
		bindfactoryCompleteSummaryEvents();
		updatefactoryCompleteSummaryTotalCount();
	}

	// ============================================================
	// ✅ 이벤트 바인딩 함수 - IIFE 내부
	// ============================================================
	function bindfactoryCompleteSummaryEvents() {
		// Excel 버튼
		$('#factoryCompleteSummaryExcelBtn').off('click').on('click', function() {
			downloadFactoryCompleteSummaryExcel('all');   // ✅ 전체(정렬/필터 반영)
			// downloadFactoryCompleteSummaryExcel('page'); // ✅ 현재 페이지만 원하면 이걸로
		});

		// 검색 버튼
		$(".btnFactoryCompleteSummarySearch").off('click').on('click', function() {
			handleFactoryCompleteSummarySearch();
		});

		// 초기화 버튼
		$(".btnFactoryCompleteSummarySearchInit").off('click').on('click', function() {
			handleFactoryCompleteSummarySearchInit();
		});

		// 페이지당 항목 수 변경
		$('#factoryCompleteSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			handleChangeFactoryCompleteSummaryItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼
		$(document).off('click', '.factoryCompleteSummary-page-btn').on('click', '.factoryCompleteSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					handlePageChange(page);
				}
			}
		});

		// 헤더 정렬
		$('#factoryCompleteSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');

			// ✅ 1차: th data-type
			let dataType = $(this).attr('data-type') || $(this).data('type') || 'string';

			// ✅ 2차: columns 정의(type)로 보정
			if (dataType === 'string') {
				const colDef = factoryCompleteSummaryColumns.find(c => c.key === column);
				if (colDef && colDef.type) dataType = colDef.type;
			}

			handleSort(column, dataType);
		});


		// 엔터키 검색
		$('#view_mPurchase_factory_complete_summary input[type="text"], #view_mPurchase_factory_complete_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				handleFactoryCompleteSummarySearch();
			}
		});
	}

	// ============================================================
	// ✅ 이벤트 핸들러 함수 - IIFE 내부
	// ============================================================
	function handleFactoryCompleteSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentfactoryCompleteSummaryPage = 1;
		performfactoryCompleteSummaryDBSearch(searchCriteria);
	}

	function handleFactoryCompleteSummarySearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		const moveFactory = getCookie('selectedFactory');
		const factory =
			moveFactory === 'SALTILLO' ? 'PUEBLA' :
				moveFactory === 'PUEBLA' ? 'SALTILLO' : 'all';

		const moveStorage = 'all';
		const scan = 'all';

		// ✅ UI 값도 같이 초기화(서버/화면 불일치 방지)
		$("#factoryCompleteSummary_searchVal_fromDate").val(fromDate);
		$("#factoryCompleteSummary_searchVal_toDate").val(toDate);
		$("#factoryCompleteSummary_searchVal_itemcode").val('');
		$("#factoryCompleteSummary_searchVal_itemname").val('');

		$("#factoryCompleteSummary_searchVal_factory").val(factory);
		$("#factoryCompleteSummary_searchVal_moveFactory").val(moveFactory);
		$("#factoryCompleteSummary_searchVal_scan").val(scan);

		// storage 옵션은 renderFactoryStorage에서 다시 채워지므로,
		// 현재 선택값을 먼저 세팅해두고 유지되게 처리(아래 3번 함수 참고)
		$("#factoryCompleteSummary_searchVal_storage").val(moveStorage);

		renderFactoryStorage();

		currentfactoryCompleteSummaryPage = 1;

		// ✅ 서버로 보내는 키 정확히 맞춤
		performfactoryCompleteSummaryDBSearch({
			fromDate,
			toDate,
			factory,
			moveFactory,
			moveStorage,
			scan
		});

		console.log('검색 조건이 초기화되었습니다.');
	}


	function handlePageChange(page) {
		currentfactoryCompleteSummaryPage = page;
		applyClientPagination();
		renderfactoryCompleteSummaryTableData();
		renderfactoryCompleteSummaryPagination();
		updatefactoryCompleteSummaryTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeFactoryCompleteSummaryItemsPerPage(newItemsPerPage) {
		factoryCompleteSummaryItemsPerPage = newItemsPerPage;
		currentfactoryCompleteSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderfactoryCompleteSummaryTableData();
		renderfactoryCompleteSummaryPagination();
		updatefactoryCompleteSummaryTotalCount();
	}
	function downloadFactoryCompleteSummaryExcel(mode = 'all') {
		// mode: 'all' | 'page'
		const excelData = (mode === 'page')
			? (Array.isArray(globalfactoryCompleteSummaryData) ? [...globalfactoryCompleteSummaryData] : [])
			: (Array.isArray(filteredData_purchaseFactoryCompleteSummary) ? [...filteredData_purchaseFactoryCompleteSummary] : []);

		ExcelExporter.downloadExcel(excelData, factoryCompleteSummaryColumns, {
			fileName: mode === 'page' ? 'factoryCompleteSummary_CurrentPage' : 'factoryCompleteSummary_All',
			sheetName: 'factoryCompleteSummary'
		});
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	window.call_mPurchase_factory_complete_summary = function(menuId) {
		function internalInit() {
			showLoading("data");

			// ✅ 1) 뷰가 없으면 먼저 렌더링(여기서 date value도 세팅됨)
			const isNewView = !$('#view_mPurchase_factory_complete_summary').length;
			if (isNewView) {
				renderfactoryCompleteSummaryView();
			}

			// ✅ 2) 그래도 혹시 비어있으면 안전하게 다시 세팅
			const { fromDate, toDate } = getDefaultDateRange();
			if (!$("#factoryCompleteSummary_searchVal_fromDate").val()) {
				$("#factoryCompleteSummary_searchVal_fromDate").val(fromDate);
			}
			if (!$("#factoryCompleteSummary_searchVal_toDate").val()) {
				$("#factoryCompleteSummary_searchVal_toDate").val(toDate);
			}

			// ✅ 3) 이제 UI에서 읽어서 조회
			const criteria = getCurrentSearchCriteria();
			if (!criteria.moveStorage) criteria.moveStorage = 'all';
			if (!criteria.scan) criteria.scan = 'all';

			performfactoryCompleteSummaryDBSearch(criteria);
		}
		internalInit();
	};



	// 데이터 내보내기
	window.exportfactoryCompleteSummaryData = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalExport() {
			return {
				total: filteredData_purchaseFactoryCompleteSummary.length,
				currentPage: currentfactoryCompleteSummaryPage,
				itemsPerPage: factoryCompleteSummaryItemsPerPage,
				data: filteredData_purchaseFactoryCompleteSummary
			};
		}

		return internalExport();
	};

	// 항목 수 변경
	window.changeFactoryCompleteSummaryItemsPerPage = function(newItemsPerPage) {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalChange() {
			handleChangeFactoryCompleteSummaryItemsPerPage(newItemsPerPage);
		}

		internalChange();
	};

	// ============================================================
	// ✅ 이벤트 리스너 - IIFE 내부
	// ============================================================
	document.addEventListener('menuTypeChanged', function(e) {
		console.log("Menu Type:", e.detail.menuType);
		menuType = e.detail.menuType;
		console.log("Data Matching:", e.detail.dataMatching);
	});

	// ============================================================
	// ✅ 초기화
	// ============================================================
	$(document).ready(function() {
		// 필요시 초기화 코드 추가
	});

})(); // ← IIFE 종료 - 모든 변수/함수 격리됨