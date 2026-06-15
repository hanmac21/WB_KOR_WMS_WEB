/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고:
 *  - 화면: 서버 페이징 + 서버 정렬
 *  - 엑셀: 정렬 유지 + 전체 조회(페이징 없음)
 * -------------------------------------------------------------- */

$(document).ready(function() {
	console.log('🔍 Stock Detail Ready 시작');
	let globalSalesStockDetailData = [];
	let currentSalesStockDetailPage = 1;
	let salesStockDetailItemsPerPage = 1000;

	let totalSalesStockDetailCount = 0;
	let totalSalesStockDetailQty = 0;
	let totalSalesStockDetailPages = 0;

	// ✅ 엑셀 다운로드용
	window.filteredSalesStockDetailData = [];

	// ✅ 서버 정렬 상태(기본값)
	let salesStockDetailSortKey = 'YMDHMS'; // 서버에서 매핑할 키(아래 매핑표 참고)
	let salesStockDetailSortDir = 'DESC';

	// ✅ Excel 컬럼 정의(기존 유지)
	window.salesStockDetailColumns = [
		{ key: 'factory', header: 'factory' },
		{ key: 'storage', header: 'storage' },        // ✅ syro -> storage
		{ key: 'sdate', header: 'sdate' },
		{ key: 'car', header: 'car' },
		{ key: 'itemcode', header: 'itemcode' },
		{ key: 'spec', header: 'customer code' },
		{ key: 'itemname', header: 'itemname' },
		{ key: 'location', header: 'location' },
		{ key: 'qty', header: 'qty' },
		{ key: 'loginid', header: 'user' },
		{ key: 'hhmm', header: 'hh:mm' },          // ✅ 키는 hhmm, 표시는 hh:mm
		{ key: 'madate', header: 'Made Date' },          // ✅ 키는 hhmm, 표시는 hh:mm
		{ key: 'barcode', header: 'Barcode' }
	];

	// =========================
	// 메인 호출
	// =========================
	window.call_mSales_stock_detail = function(menuId) {
		showLoading("data");

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 공장만 세팅 + 기본 정렬 적용
		currentSalesStockDetailPage = 1;
		salesStockDetailSortKey = 'YMDHMS';
		salesStockDetailSortDir = 'DESC';

		// ✅ 메뉴 타입별 기본 STORAGE 지정
		let storage = 'PRODUCT';

		performSalesStockDetailDBSearch({ factory, storage });
	};

	// =========================
	// DB 조회(페이징 + 정렬)
	// =========================
	function performSalesStockDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_salesStockDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentSalesStockDetailPage,
				itemsPerPage: salesStockDetailItemsPerPage,
				sortKey: salesStockDetailSortKey,
				sortDir: salesStockDetailSortDir
			}),
			contentType: "application/json",
			success: function(data) {
				globalSalesStockDetailData = data.records || [];
				totalSalesStockDetailCount = data.totalCount || 0;
				totalSalesStockDetailQty = data.totalQty || 0;
				totalSalesStockDetailPages = data.totalPages || 0;
				currentSalesStockDetailPage = data.currentPage || 1;

				window.filteredSalesStockDetailData = globalSalesStockDetailData;

				// 첫 렌더
				if (!$('#view_mSales_stock_detail').length) {
					renderSalesStockDetailView();
				} else {
					renderSalesStockDetailTableData();
					renderSalesStockDetailPagination();
					updateSalesStockDetailTotalCount();
					updateSalesStockDetailTotalQty();
					updateSalesStockDetailSortIcons();
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

	// =========================
	// View 렌더
	// =========================
	function renderSalesStockDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_mSales_stock_detail">
				<div class="content-body">

					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}</div>
								<select id="salesStockDetail_searchVal_factory">
									<option value="WBTA">WBTA</option>
								</select>
							</div>

							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}</div>
								<select id="salesStockDetail_searchVal_storage"></select>
							</div>

							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}</div>
								<input type="text" id="salesStockDetail_searchVal_car" />
							</div>

							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="salesStockDetail_searchVal_itemcode" />
							</div>

							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="salesStockDetail_searchVal_itemname" />
							</div>
						</div>

						<div class="search_button_area">
							<button class="btn btn-primary btnSalesStockDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnSalesStockDetailSearchInit">${i18n.t('btn.clear')}</button>
						</div>
					</div>

					<div class="tab-container">
						<div class="tab">목록</div>
					</div>

					<div class="table-container">
						<div class="table-info">
							<span>
								${i18n.t('table.info.total')} <strong id="salesStockDetailTotalCount">${totalSalesStockDetailCount}</strong> ${i18n.t('table.info.records')} |
								${i18n.t('table.page')} <strong id="salesStockDetailCurrentPageInfo">${currentSalesStockDetailPage}</strong>/<strong id="salesStockDetailTotalPageInfo">${totalSalesStockDetailPages}</strong> |
								${i18n.t('table.info.qty')} : <strong id="salesStockDetailTotalQty"></strong>
							</span>

							<div class="action-buttons-right mSales_stock_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="salesStockDetailExcelBtn" onclick="downloadAllSalesStockDetailData()">Excel</button>
								</div>
							</div>
						</div>

						<table class="data-table mSales_stock_detail">
							<thead>
								<tr>
									<th class="noVal">${i18n.t('table.no')}</th>

									<th class="factoryVal sortable" data-sort-key="FACTORY">
										${i18n.t('search.factory')}
										<span class="sort-icon" data-sort-icon="FACTORY"></span>
									</th>

									<th class="storageVal sortable" data-sort-key="STORAGE">
										${i18n.t('search.storage')}
										<span class="sort-icon" data-sort-icon="STORAGE"></span>
									</th>

									<th class="dateVal sortable" data-sort-key="SDATE">
										${i18n.t('search.date')}
										<span class="sort-icon" data-sort-icon="SDATE"></span>
									</th>

									<th class="carVal sortable" data-sort-key="CAR">
										${i18n.t('search.car')}
										<span class="sort-icon" data-sort-icon="CAR"></span>
									</th>

									<th class="itemcodeVal sortable" data-sort-key="ITEMCODE">
										${i18n.t('search.itemCode')}
										<span class="sort-icon" data-sort-icon="ITEMCODE"></span>
									</th>

									<th class="cnameVal sortable" data-sort-key="SPEC">
										${i18n.t('search.customercode')}
										<span class="sort-icon" data-sort-icon="SPEC"></span>
									</th>

									<th class="itemnameLongVal sortable" data-sort-key="ITEMNAME">
										${i18n.t('search.itemName')}
										<span class="sort-icon" data-sort-icon="ITEMNAME"></span>
									</th>

									<th class="locationVal sortable" data-sort-key="LOCATION">
										${i18n.t('search.location')}
										<span class="sort-icon" data-sort-icon="LOCATION"></span>
									</th>

									<th class="qtyVal sortable" data-sort-key="QTY">
										${i18n.t('search.qty')}
										<span class="sort-icon" data-sort-icon="QTY"></span>
									</th>

									<th class="userVal sortable" data-sort-key="LOGINID">
										${i18n.t('search.user')}
										<span class="sort-icon" data-sort-icon="LOGINID"></span>
									</th>

									<th class="hhmmVal sortable" data-sort-key="HHMM">
										${i18n.t('table.time')}
										<span class="sort-icon" data-sort-icon="HHMM"></span>
									</th>
									
									<th class="dateVal sortable" data-sort-key="MADATE">
										${i18n.t('search.createddate')}
										<span class="sort-icon" data-sort-icon="MADATE"></span>
									</th>

									<th class="barcodeVal sortable" data-sort-key="BARCODE">
										${i18n.t('search.barcode')}
										<span class="sort-icon" data-sort-icon="BARCODE"></span>
									</th>

									<!-- ✅ 정렬 기준으로 자주 쓰는 YMDHMS도 클릭 가능하게 하려면 컬럼 추가하시거나,
									     HHMM 대신 YMDHMS로 매핑해도 됩니다. -->
								</tr>
							</thead>
							<tbody id="salesStockDetailTableBody"></tbody>
						</table>

						<div class="pagination" id="salesStockDetailPaginationContainer"></div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		renderFactoryStorage();
		renderSalesStockDetailTableData();
		renderSalesStockDetailPagination();
		bindSalesStockDetailEvents();
		updateSalesStockDetailTotalCount();
		updateSalesStockDetailTotalQty();
		updateSalesStockDetailSortIcons();
	}

	// =========================
	// Factory/Storage
	// =========================
	function renderFactoryStorage() {
		const factory = $('#salesStockDetail_searchVal_factory');
		const storage = $('#salesStockDetail_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				WBTA: ['MATERIAL', 'PRODUCT', 'all'],
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			storage.val(storageList[1]);
		}

		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}

		updateStorageOptions(savedFactory || '');

		factory.off('change.factory').on('change.factory', function() {
			updateStorageOptions($(this).val());
			if (typeof window.autoSetStorageFields === 'function') {
				window.autoSetStorageFields();
			}
		});
	}

	// =========================
	// Cookie
	// =========================
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// =========================
	// Total 표시
	// =========================
	function updateSalesStockDetailTotalCount() {
		$('#salesStockDetailTotalCount').text(Number(totalSalesStockDetailCount || 0).toLocaleString());
	}

	function updateSalesStockDetailTotalQty() {
		$('#salesStockDetailTotalQty').text(Number(totalSalesStockDetailQty || 0).toLocaleString());
	}

	// =========================
	// Table 렌더
	// =========================
	function renderSalesStockDetailTableData() {
		let tableBody = "";

		$("#salesStockDetailCurrentPageInfo").text(currentSalesStockDetailPage);
		$("#salesStockDetailTotalPageInfo").text(totalSalesStockDetailPages);

		for (let i = 0; i < globalSalesStockDetailData.length; i++) {
			let rowNumber = (currentSalesStockDetailPage - 1) * salesStockDetailItemsPerPage + i + 1;
			let row = globalSalesStockDetailData[i] || {};

			tableBody += `
				<tr>
					<td class="noVal">${rowNumber}</td>
					<td class="factoryVal">${row.FACTORY || row.factory || ''}</td>
					<td class="storageVal">${row.STORAGE || row.storage || ''}</td>
					<td class="dateVal">${row.SDATE || row.sdate || ''}</td>
					<td class="carVal">${row.CAR || row.car || ''}</td>
					<td class="itemcodeVal">${row.ITEMCODE || row.itemcode || ''}</td>
					<td class="cnameVal">${row.SPEC || row.spec || ''}</td>
					<td class="itemnameLongVal">${row.ITEMNAME || row.itemname || ''}</td>
					<td class="locationVal">${row.LOCATION || row.location || ''}</td>
					<td class="qtyVal">${Number(row.QTY || row.qty || 0).toLocaleString()}</td>
					<td class="userVal">${row.LOGINID || row.loginid || ''}</td>
					<td class="hhmmVal">${row.HHMM || row.hhmm || ''}</td>
					<td class="dateVal">${row.MADATE || row.madate || ''}</td>
					<td class="barcodeVal">${row.BARCODE || row.barcode || ''}</td>
				</tr>
			`;
		}

		$("#salesStockDetailTableBody").html(tableBody);
	}

	// =========================
	// Pagination 렌더
	// =========================
	function renderSalesStockDetailPagination() {
		let totalPages = totalSalesStockDetailPages || Math.ceil(totalSalesStockDetailCount / salesStockDetailItemsPerPage) || 1;
		let paginationHtml = "";

		if (currentSalesStockDetailPage > 1) {
			paginationHtml += `<button class="salesStockDetail-page-btn" data-page="${currentSalesStockDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="salesStockDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSalesStockDetailPage - 5);
		let endPage = Math.min(totalPages, currentSalesStockDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="salesStockDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) paginationHtml += `<span class="page-dots">...</span>`;
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSalesStockDetailPage) {
				paginationHtml += `<button class="salesStockDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="salesStockDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalPages) {
			if (endPage < totalPages - 1) paginationHtml += `<span class="page-dots">...</span>`;
			paginationHtml += `<button class="salesStockDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		if (currentSalesStockDetailPage < totalPages) {
			paginationHtml += `<button class="salesStockDetail-page-btn" data-page="${currentSalesStockDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="salesStockDetail-page-btn disabled">&gt;</button>`;
		}

		$("#salesStockDetailPaginationContainer").html(paginationHtml);
	}

	// =========================
	// 정렬 아이콘 업데이트
	// =========================
	function updateSalesStockDetailSortIcons() {
		// 전부 초기화
		$('#view_mSales_stock_detail thead .sort-icon').text('');

		// 현재 선택된 컬럼에만 표시
		let icon = (salesStockDetailSortDir === 'ASC') ? '▲' : '▼';
		$(`#view_mSales_stock_detail thead .sort-icon[data-sort-icon="${salesStockDetailSortKey}"]`).text(icon);
	}

	// =========================
	// Events
	// =========================
	function bindSalesStockDetailEvents() {
		$(".btnSalesStockDetailSearch").off('click').on('click', function() {
			performSalesStockDetailSearch();
		});

		$(".btnSalesStockDetailSearchInit").off('click').on('click', function() {
			resetSalesStockDetailSearch();
		});

		$(document).off('click', '.salesStockDetail-page-btn').on('click', '.salesStockDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSalesStockDetailPage = page;
					let searchCriteria = getCurrentSearchCriteria();
					performSalesStockDetailDBSearch(searchCriteria);
				}
			}
		});

		// ✅ 헤더 정렬 클릭(서버 정렬)
		$(document).off('click', '#view_mSales_stock_detail thead th.sortable')
			.on('click', '#view_mSales_stock_detail thead th.sortable', function() {

				const clickedKey = $(this).data('sort-key');
				if (!clickedKey) return;

				if (salesStockDetailSortKey === clickedKey) {
					// 같은 컬럼이면 ASC/DESC 토글
					salesStockDetailSortDir = (salesStockDetailSortDir === 'ASC') ? 'DESC' : 'ASC';
				} else {
					// 다른 컬럼이면 해당 컬럼으로 변경 + 기본 DESC
					salesStockDetailSortKey = clickedKey;
					salesStockDetailSortDir = 'DESC';
				}

				currentSalesStockDetailPage = 1;
				updateSalesStockDetailSortIcons();

				let searchCriteria = getCurrentSearchCriteria();
				performSalesStockDetailDBSearch(searchCriteria);
			});

		$('#view_mSales_stock_detail input[type="text"], #view_mSales_stock_detail input[type="date"]')
			.off('keypress')
			.on('keypress', function(e) {
				if (e.which === 13) performSalesStockDetailSearch();
			});
	}

	// =========================
	// 검색조건 수집
	// =========================
	function getCurrentSearchCriteria() {
		return {
			factory: $("#salesStockDetail_searchVal_factory").val(),
			storage: $("#salesStockDetail_searchVal_storage").val(),
			car: $("#salesStockDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#salesStockDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#salesStockDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performSalesStockDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		currentSalesStockDetailPage = 1;
		performSalesStockDetailDBSearch(searchCriteria);
	}

	function resetSalesStockDetailSearch() {
		const factory = getCookie('selectedFactory');
		const storage =  "PRODUCT";

		$("#salesStockDetail_searchVal_car").val('');
		$("#salesStockDetail_searchVal_itemcode").val('');
		$("#salesStockDetail_searchVal_itemname").val('');

		renderFactoryStorage();

		currentSalesStockDetailPage = 1;

		// 초기화 시 정렬도 기본으로
		salesStockDetailSortKey = 'YMDHMS';
		salesStockDetailSortDir = 'DESC';

		performSalesStockDetailDBSearch({ factory, storage });
	}

	// =========================
	// 외부에서 페이지사이즈 변경
	// =========================
	window.changeSalesStockDetailItemsPerPage = function(newItemsPerPage) {
		salesStockDetailItemsPerPage = newItemsPerPage;
		currentSalesStockDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performSalesStockDetailDBSearch(searchCriteria);
	};

	window.exportSalesStockDetailData = function() {
		return {
			total: globalSalesStockDetailData.length,
			currentPage: currentSalesStockDetailPage,
			itemsPerPage: salesStockDetailItemsPerPage,
			data: globalSalesStockDetailData
		};
	};

	// =========================
	// Excel 다운로드: 전체 조회(페이징 없음) + 정렬 적용
	// =========================
	window.downloadAllSalesStockDetailData = function() {
		let searchCriteria = getCurrentSearchCriteria();

		showLoading("export");

		$.ajax({
			url: "/read_salesStockDetail_all",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				sortKey: salesStockDetailSortKey,
				sortDir: salesStockDetailSortDir
			}),
			contentType: "application/json",
			success: function(data) {

				// ✅ 서버 응답 형태가 배열이든, {records: []}든 다 대응
				const rows = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : []);

				console.log("EXCEL rows length =", rows.length, "raw =", data);

				ExcelExporter.downloadExcel(rows, window.salesStockDetailColumns, {
					fileName: 'SalesStockDetail_All',
					sheetName: 'SalesStockDetail'
				});

				hideLoading();
			},

			error: function() {
				alert("전체 데이터 조회에 실패했습니다.");
				hideLoading();
			}
		});
	};

});
