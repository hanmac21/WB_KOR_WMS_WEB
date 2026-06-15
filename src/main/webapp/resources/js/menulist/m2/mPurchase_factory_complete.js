/* ============================================================
 * 📌 구매 - 재고 - 공장간이동 완료 (클라이언트 정렬/페이징)
 * ✅ 완전 격리: IIFE + 모든 window 함수 내부 로직화
 * ============================================================ */
(function() {
	// ============================================================
	// ✅ 모든 변수 - IIFE 내부에서 격리됨
	// ============================================================
	let allServerData = [];
	let filteredData_purchaseFactoryComplete = [];
	let globalfactoryCompleteData = [];
	let currentfactoryCompletePage = 1;
	let factoryCompleteItemsPerPage = 100;
	let totalfactoryCompleteCount = 0;
	let totalfactoryCompletePages = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let menuType = null;
	let saveStorageForInit = null;
	let totalQty = 0;
	let totalFromQtyAll = 0;
	let totalToQtyAll = 0;


	// ✅ 전역 데이터
	let filteredfactoryCompleteData = [];
	let factoryCompleteColumns = [
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
	    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const fromDate = fmtLocalDate(firstDayOfMonth);
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
			moveFactory: $("#factoryComplete_searchVal_moveFactory").val(),
			moveStorage: $("#factoryComplete_searchVal_storage").val(),
			scan: $("#factoryComplete_searchVal_scan").val(),
			itemcode: ($("#factoryComplete_searchVal_itemcode").val() || '').trim().toUpperCase(),
			itemname: ($("#factoryComplete_searchVal_itemname").val() || '').trim().toUpperCase()
		};
	}

	function performfactoryCompleteDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_factoryComplete",
			type: "POST",
			data: JSON.stringify({ searchParams: searchCriteria }),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				allServerData = response.records || [];
				filteredData_purchaseFactoryComplete = [...allServerData];
				totalQty = response.totalQty || 0;

				// ✅ 기존 정렬 상태 백업
				const prevSortColumn = currentSortColumn;
				const prevSortOrder = currentSortOrder;

				// ✅ 뷰 신규 생성 여부
				const isNewView = !$('#view_mPurchase_factory_complete').length;

				currentfactoryCompletePage = 1;

				// ✅ 먼저 페이징 계산
				applyClientPagination();

				// ✅ 뷰 없으면 생성 (생성 내부에서 렌더/바인딩/업데이트까지 진행됨)
				if (isNewView) {
					renderfactoryCompleteView();
				}

				// ✅ 정렬 유지 적용
				if (prevSortColumn) {
					currentSortColumn = prevSortColumn;
					currentSortOrder = prevSortOrder;

					const colDef = factoryCompleteColumns.find(c => c.key === currentSortColumn);
					const dataType = colDef?.type || 'string';

					sortDataOnly(currentSortColumn, dataType);
					applyClientPagination();

					updateSortIndicators(currentSortColumn);
				}

				// ✅ 기존 뷰일 때만 여기서 다시 렌더 (신규 생성이면 renderfactoryCompleteView()가 이미 렌더함)
				if (!isNewView) {
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



	/** ✅ 토글 없이 정렬만 수행하는 함수(추가) */
	function sortDataOnly(column, dataType) {
		filteredData_purchaseFactoryComplete.sort((a, b) => {
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
		factoryCompleteItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalfactoryCompleteCount = filteredData_purchaseFactoryComplete.length;
		totalfactoryCompletePages = Math.ceil(totalfactoryCompleteCount / factoryCompleteItemsPerPage);

		const startIndex = (currentfactoryCompletePage - 1) * factoryCompleteItemsPerPage;
		const endIndex = startIndex + factoryCompleteItemsPerPage;

		globalfactoryCompleteData = filteredData_purchaseFactoryComplete.slice(startIndex, endIndex);
		filteredfactoryCompleteData = globalfactoryCompleteData;
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

		currentfactoryCompletePage = 1;
		applyClientPagination();

		renderfactoryCompleteTableData();
		renderfactoryCompletePagination();
		updatefactoryCompleteTotalCount();

		updateSortIndicators(column);
	}

	function updateSortIndicators(column) {
		$('#factoryCompleteTable thead th').removeClass('sort-asc sort-desc');
		$(`#factoryCompleteTable thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// ============================================================
	// ✅ UI 업데이트 함수 - IIFE 내부
	// ============================================================
	function updatefactoryCompleteTotalCount() {
		// 🔹 건수 / 페이지 정보 유지
		$('#factoryCompleteTotalCount').text(Number(totalfactoryCompleteCount).toLocaleString());
		$('#factoryCompleteCurrentPageInfo').text(currentfactoryCompletePage);
		$('#factoryCompleteTotalPageInfo').text(totalfactoryCompletePages);

		// 🔹 FROMQTY / TOQTY 전체 합계 계산 (현재 필터된 전체 데이터 기준)
		let fromSum = 0;
		let toSum = 0;

		for (let i = 0; i < filteredData_purchaseFactoryComplete.length; i++) {
			const row = filteredData_purchaseFactoryComplete[i];
			const fromVal = Number(row.FROMQTY || row.fromqty || 0);
			const toVal = Number(row.TOQTY || row.toqty || 0);

			if (!isNaN(fromVal)) fromSum += fromVal;
			if (!isNaN(toVal)) toSum += toVal;
		}

		// 필요 시 전역 변수에 보관
		totalFromQtyAll = fromSum;
		totalToQtyAll = toSum;

		// 화면 반영
		$('#factoryCompleteTotalFromQty').text(fromSum.toLocaleString());
		$('#factoryCompleteTotalToQty').text(toSum.toLocaleString());
	}


	function renderfactoryCompleteTableData() {
		let tableBody = "";

		for (let i = 0; i < globalfactoryCompleteData.length; i++) {
			let rowNumber = (currentfactoryCompletePage - 1) * factoryCompleteItemsPerPage + i + 1;

			tableBody += `
            <tr>
                <td class="noVal">${rowNumber}</td>
                <td class="itemcodeVal">${globalfactoryCompleteData[i].FROMFACTORY || globalfactoryCompleteData[i].fromfactory || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteData[i].FROMDATE || globalfactoryCompleteData[i].fromdate || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteData[i].TOFACTORY || globalfactoryCompleteData[i].tofactory || ''}</td>
				<td class="wccodeVal">${globalfactoryCompleteData[i].TOSTORAGE || globalfactoryCompleteData[i].tostorage || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteData[i].TODATE || globalfactoryCompleteData[i].todate || ''}</td>
                <td class="carVal">${globalfactoryCompleteData[i].CAR || globalfactoryCompleteData[i].car || ''}</td>
                <td class="itemcodeVal">${globalfactoryCompleteData[i].ITEMCODE || globalfactoryCompleteData[i].itemcode || ''}</td>
                <td class="itemnameVal">${globalfactoryCompleteData[i].ITEMNAME || globalfactoryCompleteData[i].itemname || ''}</td>
                <td class="scanqtyVal">${Number(globalfactoryCompleteData[i].FROMQTY || globalfactoryCompleteData[i].fromqty || 0).toLocaleString()}</td>
                <td class="unpackqtyVal">${Number(globalfactoryCompleteData[i].TOQTY || globalfactoryCompleteData[i].toqty || 0).toLocaleString()}</td>
                <td class="barcodeVal">${globalfactoryCompleteData[i].BARCODE || globalfactoryCompleteData[i].barcode || ''}</td>
            </tr>
        `;
		}

		$("#factoryCompleteDetailTableBody").html(tableBody);
	}

	function renderfactoryCompletePagination() {
		let paginationHtml = "";

		if (currentfactoryCompletePage > 1) {
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="${currentfactoryCompletePage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryComplete-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentfactoryCompletePage - 5);
		let endPage = Math.min(totalfactoryCompletePages, currentfactoryCompletePage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentfactoryCompletePage) {
				paginationHtml += `<button class="factoryComplete-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryComplete-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalfactoryCompletePages) {
			if (endPage < totalfactoryCompletePages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="${totalfactoryCompletePages}">${totalfactoryCompletePages}</button>`;
		}

		if (currentfactoryCompletePage < totalfactoryCompletePages) {
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="${currentfactoryCompletePage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryComplete-page-btn disabled">&gt;</button>`;
		}

		$("#factoryCompletePaginationContainer").html(paginationHtml);
	}

	// ============================================================
	// ✅ 공장/창고 선택 함수 - IIFE 내부
	// ============================================================
	function renderFactoryStorage() {
		const factory = $('#factoryComplete_searchVal_factory');
		const moveFactory = $('#factoryComplete_searchVal_moveFactory');
		const storage = $('#factoryComplete_searchVal_storage');
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
				storage.val('all');
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
	function renderfactoryCompleteView() {
		let content_output = `
		<div class="divBlockControl" id="view_mPurchase_factory_complete">
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
							<select id="factoryComplete_searchVal_factory" >
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}</option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_moveFactory">${i18n.t('search.receivefactory')}</div>
							<select id="factoryComplete_searchVal_moveFactory" >
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}</option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_moveStorage">${i18n.t('search.receivestorage')}</div>
							<select id="factoryComplete_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_scan">${i18n.t('search.scanType.load')}</div>
							<select id="factoryComplete_searchVal_scan" >
								<option value="all">${i18n.t('search.all')}</option>
								<option value="Y">Y</option>
								<option value="N">N</option>
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
					    <span>
					        ${i18n.t('table.info.total')} 
					        <strong id="factoryCompleteTotalCount">${totalfactoryCompleteCount}</strong> 
					        ${i18n.t('table.info.records')} | 
					        ${i18n.t('table.page')} 
					        <strong id="factoryCompleteCurrentPageInfo">${currentfactoryCompletePage}</strong> /
					        <strong id="factoryCompleteTotalPageInfo">${totalfactoryCompletePages}</strong>
					        <!-- 🔽 여기부터 추가 -->
					        | ${i18n.t('search.qty.out')} :
					        <strong id="factoryCompleteTotalFromQty">0</strong>
					        | ${i18n.t('search.qty.in')} :
					        <strong id="factoryCompleteTotalToQty">0</strong>
					        <!-- 🔼 합계 영역 -->
					    </span>
					    <div class="action-buttons-right mPurchase_factory_complete">
					        <div id="defaultActions" class="action-group">
					            <button class="btn btn-success" id="factoryCompleteExcelBtn">Excel</button>
					        </div>
					    </div>
					</div>
					<table class="data-table mPurchase_factory_complete" id="factoryCompleteTable">
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
								<th class="barcodeVal" data-sort="BARCODE">LOT</th>
							</tr>
						</thead>
						<tbody id="factoryCompleteDetailTableBody">
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

		(function() {
			const { fromDate, toDate } = getDefaultDateRange();

			// ✅ 쿠키 반영해서 UI와 로직 통일
			factoryCompleteItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

			$("#factoryComplete_searchVal_toDate").val(toDate);
			$("#factoryComplete_searchVal_fromDate").val(fromDate);
			$("#factoryComplete_itemsPerPage").val(factoryCompleteItemsPerPage);
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
		// Excel 버튼
		$('#factoryCompleteExcelBtn').off('click').on('click', function() {
			downloadFactoryCompleteExcel('all');   // ✅ 전체(정렬/필터 반영)
			// downloadFactoryCompleteExcel('page'); // ✅ 현재 페이지만 원하면 이걸로
		});

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

			// ✅ 1차: th data-type
			let dataType = $(this).attr('data-type') || $(this).data('type') || 'string';

			// ✅ 2차: columns 정의(type)로 보정
			if (dataType === 'string') {
				const colDef = factoryCompleteColumns.find(c => c.key === column);
				if (colDef && colDef.type) dataType = colDef.type;
			}

			handleSort(column, dataType);
		});


		// 엔터키 검색
		$('#view_mPurchase_factory_complete input[type="text"], #view_mPurchase_factory_complete input[type="date"]').off('keypress').on('keypress', function(e) {
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

		currentfactoryCompletePage = 1;
		performfactoryCompleteDBSearch(searchCriteria);
	}

	function handleFactoryCompleteSearchInit() {
		const { fromDate, toDate } = getDefaultDateRange();

		const moveFactory = getCookie('selectedFactory');
		const factory =
			moveFactory === 'SALTILLO' ? 'PUEBLA' :
				moveFactory === 'PUEBLA' ? 'SALTILLO' : 'all';

		const moveStorage = 'all';
		const scan = 'all';

		// ✅ UI 값도 같이 초기화(서버/화면 불일치 방지)
		$("#factoryComplete_searchVal_fromDate").val(fromDate);
		$("#factoryComplete_searchVal_toDate").val(toDate);
		$("#factoryComplete_searchVal_itemcode").val('');
		$("#factoryComplete_searchVal_itemname").val('');

		$("#factoryComplete_searchVal_factory").val(factory);
		$("#factoryComplete_searchVal_moveFactory").val(moveFactory);
		$("#factoryComplete_searchVal_scan").val(scan);

		// storage 옵션은 renderFactoryStorage에서 다시 채워지므로,
		// 현재 선택값을 먼저 세팅해두고 유지되게 처리(아래 3번 함수 참고)
		$("#factoryComplete_searchVal_storage").val(moveStorage);

		renderFactoryStorage();

		currentfactoryCompletePage = 1;

		// ✅ 서버로 보내는 키 정확히 맞춤
		performfactoryCompleteDBSearch({
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
		currentfactoryCompletePage = page;
		applyClientPagination();
		renderfactoryCompleteTableData();
		renderfactoryCompletePagination();
		updatefactoryCompleteTotalCount();
	}

	function handleSort(column, dataType) {
		applyClientSort(column, dataType);
	}

	function handleChangeFactoryCompleteItemsPerPage(newItemsPerPage) {
		factoryCompleteItemsPerPage = newItemsPerPage;
		currentfactoryCompletePage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderfactoryCompleteTableData();
		renderfactoryCompletePagination();
		updatefactoryCompleteTotalCount();
	}
	function downloadFactoryCompleteExcel(mode = 'all') {
		// mode: 'all' | 'page'
		const excelData = (mode === 'page')
			? (Array.isArray(globalfactoryCompleteData) ? [...globalfactoryCompleteData] : [])
			: (Array.isArray(filteredData_purchaseFactoryComplete) ? [...filteredData_purchaseFactoryComplete] : []);

		ExcelExporter.downloadExcel(excelData, factoryCompleteColumns, {
			fileName: mode === 'page' ? 'factoryComplete_CurrentPage' : 'factoryComplete_All',
			sheetName: 'factoryComplete'
		});
	}

	// ============================================================
	// ✅ window 전역 함수 - 내부 함수 래핑 (격리된 로직 실행)
	// ============================================================

	// 메인 호출 함수
	window.call_mPurchase_factory_complete = function(menuId) {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalInit() {
			showLoading("data");

			const { fromDate, toDate } = getDefaultDateRange();
			const moveFactory = getCookie('selectedFactory');
			const factory = moveFactory === 'SALTILLO' ? 'PUEBLA' : moveFactory === 'PUEBLA' ? 'SALTILLO' : 'all';

			console.log("FACTORY - " + factory + " // Move - " + moveFactory);

			performfactoryCompleteDBSearch({ fromDate, toDate, factory, moveFactory });
		}

		internalInit();
	};


	// 데이터 내보내기
	window.exportfactoryCompleteData = function() {
		// 🎯 내부 함수로 감싸기 - 격리된 변수에 접근 가능
		function internalExport() {
			return {
				total: filteredData_purchaseFactoryComplete.length,
				currentPage: currentfactoryCompletePage,
				itemsPerPage: factoryCompleteItemsPerPage,
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