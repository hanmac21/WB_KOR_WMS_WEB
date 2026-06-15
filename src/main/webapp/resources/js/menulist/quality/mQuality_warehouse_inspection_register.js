/* 창고검사 등록 */

(function () {

	let whReg_allData = [];
	let whReg_filteredData = [];
	let whReg_pageData = [];
	let whReg_currentPage = 1;
	let whReg_itemsPerPage = 100;
	let whReg_totalCount = 0;
	let whReg_totalPages = 0;
	let whReg_totalQty = 0;
	let whReg_sortColumn = null;
	let whReg_sortOrder = 'asc';
	let whReg_hasExcelUploaded = false;

	function whReg_renderTable() {
		let rows = '';
		for (let i = 0; i < whReg_pageData.length; i++) {
			const d = whReg_pageData[i];
			const no = (whReg_currentPage - 1) * whReg_itemsPerPage + i + 1;
			const qty = Number(d.QTY || d.qty || 0);
			rows += `
				<tr>
					<td class="noVal">${no}</td>
					<td class="dateVal">${d.SDATE    || d.sdate    || ''}</td>
					<td class="itemcodeVal">${d.ITEMCODE || d.itemcode || ''}</td>
					<td class="okngQtyVal">${Number(qty).toLocaleString()}</td>
					<td class="lineVal">${d.JUDGMENT || d.judgment || ''}</td>
				</tr>`;
		}
		$('#whReg_tbody').html(rows);
		whReg_updateSummary();
	}

	function whReg_renderPagination() {
		let html = '';
		const cur = whReg_currentPage, tot = whReg_totalPages;
		html += `<button class="whReg-page-btn${cur === 1 ? ' disabled' : ''}" data-page="${cur - 1}">&lt;</button>`;
		const s = Math.max(1, cur - 5), e = Math.min(tot, cur + 5);
		if (s > 1) { html += `<button class="whReg-page-btn" data-page="1">1</button>`; if (s > 2) html += `<span class="page-dots">...</span>`; }
		for (let p = s; p <= e; p++) html += `<button class="whReg-page-btn${p === cur ? ' active' : ''}" data-page="${p}">${p}</button>`;
		if (e < tot) { if (e < tot - 1) html += `<span class="page-dots">...</span>`; html += `<button class="whReg-page-btn" data-page="${tot}">${tot}</button>`; }
		html += `<button class="whReg-page-btn${cur >= tot ? ' disabled' : ''}" data-page="${cur + 1}">&gt;</button>`;
		$('#whReg_pagination').html(html);
	}

	function whReg_updateCount() {
		$('#whReg_totalCount').text(Number(whReg_totalCount).toLocaleString());
		$('#whReg_curPage').text(whReg_currentPage);
		$('#whReg_totPage').text(whReg_totalPages);
	}

	function whReg_updateSummary() {
		let sum = 0;
		(whReg_filteredData || []).forEach(function (row) {
			sum += parseFloat(row.QTY ?? row.qty ?? 0) || 0;
		});
		whReg_totalQty = sum;
		$('#whReg_tQty').text(Number(sum).toLocaleString());
	}

	$(document).ready(function () {

		window.whRegColumns = [
			{ key: 'SDATE',    header: 'date' },
			{ key: 'ITEMCODE', header: 'itemcode' },
			{ key: 'QTY',      header: 'qty', type: 'number' },
			{ key: 'JUDGMENT', header: 'judgment' }
		];

		window.call_mQuality_warehouse_inspection_register = function () {
			if (!$('#view_mQuality_warehouse_inspection_register').length) {
				renderWhRegView();
			}
		};

		function whReg_applyPagination() {
			whReg_itemsPerPage = parseInt(whReg_getCookie('itemsPerPage')) || 100;
			whReg_totalCount = whReg_filteredData.length;
			whReg_totalPages = Math.ceil(whReg_totalCount / whReg_itemsPerPage);
			const start = (whReg_currentPage - 1) * whReg_itemsPerPage;
			whReg_pageData = whReg_filteredData.slice(start, start + whReg_itemsPerPage);
		}

		function whReg_applySort(column, dataType) {
			if (whReg_sortColumn === column) {
				whReg_sortOrder = whReg_sortOrder === 'asc' ? 'desc' : 'asc';
			} else {
				whReg_sortColumn = column;
				whReg_sortOrder = 'asc';
			}
			whReg_filteredData.sort((a, b) => {
				let va = a[column] || a[column.toLowerCase()] || '';
				let vb = b[column] || b[column.toLowerCase()] || '';
				if (dataType === 'number') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
				else { va = String(va).toUpperCase(); vb = String(vb).toUpperCase(); }
				if (va < vb) return whReg_sortOrder === 'asc' ? -1 : 1;
				if (va > vb) return whReg_sortOrder === 'asc' ?  1 : -1;
				return 0;
			});
			whReg_currentPage = 1;
			whReg_applyPagination();
			whReg_renderTable();
			whReg_renderPagination();
			whReg_updateCount();
			$('.data-table.whReg thead th').removeClass('sort-asc sort-desc');
			$(`.data-table.whReg thead th[data-sort="${column}"]`).addClass('sort-' + whReg_sortOrder);
		}

		function renderWhRegView() {
			const html = `
				<div class="divBlockControl" id="view_mQuality_warehouse_inspection_register">
					<div class="content-body">
						<div class="search-area">
							<div class="search-row">
							</div>
							<div class="search_button_area">
								<button class="btn btn-primary" id="whReg_saveBtn">${i18n.t('btn.save')}</button>
							</div>
						</div>

						<div class="tab-container">
							<div class="tab">${i18n.t('quality.inspection.warehouse.register') || '창고검사 등록'}</div>
						</div>

						<div class="table-container">
							<div class="table-info">
								<span>
									${i18n.t('table.info.total')} <strong id="whReg_totalCount">0</strong> ${i18n.t('table.info.records')}
									| ${i18n.t('table.page')} <strong id="whReg_curPage">1</strong> / <strong id="whReg_totPage">1</strong>
									| QTY : <span id="whReg_tQty" style="color:#007bff">0</span>
								</span>
								<div class="action-buttons-right">
									<button class="btn btn-success" id="whReg_excelFormBtn">Excel Form</button>
									<input type="file" id="whReg_excelFile" accept=".xlsx, .xls" style="display:none;" />
									<input type="button" id="whReg_fileSelectBtn" value="Select File" style="background-color: #185c37; color: white;" class="btn" />
									<button class="btn btn-success" onclick="whReg_downloadExcel()">Excel</button>
								</div>
							</div>

							<table class="data-table whReg" id="whReg_table">
								<thead>
									<tr>
										<th class="noVal">No</th>
										<th class="dateVal"     data-sort="SDATE">${i18n.t('search.date')}</th>
										<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
										<th class="okngQtyVal"  data-sort="QTY" data-type="number">QTY</th>
										<th class="lineVal"     data-sort="JUDGMENT">${i18n.t('search.judgment') || 'Judgment'}</th>
									</tr>
								</thead>
								<tbody id="whReg_tbody"></tbody>
							</table>

							<div class="pagination" id="whReg_pagination"></div>
							<div class="items-per-page-selector">
								<label for="whReg_ipp">${i18n.t('table.itemsPerPage')}:</label>
								<select id="whReg_ipp" class="items-per-page-select">
									<option value="100" selected>100</option>
									<option value="300">300</option>
									<option value="1000">1000</option>
								</select>
							</div>
						</div>
					</div>
				</div>`;

			$('.w_contentArea').append(html);

			const savedItemsPerPage = parseInt(whReg_getCookie('itemsPerPage')) || 100;
			whReg_itemsPerPage = savedItemsPerPage;
			$('#whReg_ipp').val(savedItemsPerPage);

			whReg_renderTable();
			whReg_renderPagination();
			whReg_updateCount();
			whReg_updateSummary();
			whReg_bindEvents();
		}

		function whReg_bindEvents() {
			$('#whReg_excelFormBtn').off('click').on('click', function () {
				window.location.href = '/inspectionExcelFormDownload';
			});

			$('#whReg_fileSelectBtn').off('click').on('click', function () {
				$('#whReg_excelFile').click();
			});

			$('#whReg_excelFile').off('change').on('change', function () {
				if (whReg_hasExcelUploaded) {
					if (confirm('Already uploaded. Refresh to load a new file.\nRefresh now?')) {
						sessionStorage.setItem('autoOpenMenuId', 'mQuality_warehouse_inspection_register');
						location.reload();
					}
					this.value = '';
					return;
				}
				if (this.files[0]) {
					whReg_excelUpload(this.files[0]);
				}
				this.value = '';
			});

			$('#whReg_saveBtn').off('click').on('click', whReg_save);

			$('#whReg_ipp').off('change').on('change', function () {
				whReg_setCookie('itemsPerPage', $(this).val());
				whReg_currentPage = 1;
				whReg_applyPagination();
				whReg_renderTable();
				whReg_renderPagination();
				whReg_updateCount();
			});

			$(document).off('click', '.whReg-page-btn').on('click', '.whReg-page-btn', function () {
				if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;
				const p = parseInt($(this).data('page'));
				if (p > 0) {
					whReg_currentPage = p;
					whReg_applyPagination();
					whReg_renderTable();
					whReg_renderPagination();
					whReg_updateCount();
				}
			});

			$('#whReg_table thead th[data-sort]').off('click').on('click', function () {
				whReg_applySort($(this).data('sort'), $(this).data('type') || 'string');
			});

		}

		function whReg_excelUpload(file) {
			const formData = new FormData();
			formData.append('file', file);
			showLoading('import');
			$.ajax({
				url: '/inspectionExcelUpload',
				type: 'POST',
				data: formData,
				processData: false,
				contentType: false,
				success: function (res) {
					if (!res.success) {
						alert(res.message || 'Excel Processing Failed');
						hideLoading();
						return;
					}
					const excelData = res.data || [];
					if (excelData.length === 0) {
						alert('No data available');
						hideLoading();
						return;
					}
					whReg_filteredData = excelData.map(item => ({
						SDATE:    item.sdate    || item.SDATE    || '',
						ITEMCODE: (item.itemcode || item.ITEMCODE || '').toUpperCase(),
						QTY:      Number(item.qty || item.QTY || 0),
						JUDGMENT: (item.judgment  || item.JUDGMENT  || '').toUpperCase()
					}));
					whReg_allData = [...whReg_filteredData];
					whReg_hasExcelUploaded = true;
					whReg_currentPage = 1;
					whReg_applyPagination();
					whReg_renderTable();
					whReg_renderPagination();
					whReg_updateCount();
					whReg_updateSummary();
					$('#whReg_fileSelectBtn').prop('disabled', true).css('opacity', '0.5');
					$('#whReg_excelFile').prop('disabled', true);
					hideLoading();
				},
				error: function (xhr, status, error) {
					const message = 'An error occurred.\n\nDetails:\n' + (xhr.responseText || error || status || 'Unknown error');
					window.showCopyableAlert ? window.showCopyableAlert(message) : alert(message);
					hideLoading();
				}
			});
		}

		function whReg_save() {
			if (whReg_filteredData.length === 0) {
				alert('No data available.');
				return;
			}
			const loginid = sessionStorage.getItem('userId') || '';
			const source = "STORAGE";
			if (!confirm(`${whReg_filteredData.length} items will be saved.\nDo you want to continue?`)) return;

			showLoading('data');
			$.ajax({
				url: '/insertWarehouseInspection',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({ list: whReg_filteredData, loginid, source }),
				success: function (res) {
					alert(res + ' items have been saved.');
					hideLoading();
				},
				error: function (xhr, status, error) {
					const message = 'An error occurred.\n\nDetails:\n' + (xhr.responseText || error || status || 'Unknown error');
					window.showCopyableAlert ? window.showCopyableAlert(message) : alert(message);
					hideLoading();
				}
			});
		}

		const autoMenuId = sessionStorage.getItem('autoOpenMenuId');
		if (autoMenuId === 'mQuality_warehouse_inspection_register') {
			sessionStorage.removeItem('autoOpenMenuId');
			if (typeof window.call_mQuality_warehouse_inspection_register === 'function') {
				window.call_mQuality_warehouse_inspection_register();
			}
		}
	});

	function whReg_fmt(d) {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	function whReg_getCookie(name) {
		const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return m ? decodeURIComponent(m[2]) : '';
	}

	function whReg_setCookie(name, val, days = 365) {
		const d = new Date();
		d.setTime(d.getTime() + days * 86400000);
		document.cookie = name + '=' + encodeURIComponent(val) + ';expires=' + d.toUTCString() + ';path=/';
	}

	window.whReg_downloadExcel = function () {
		ExcelExporter.downloadExcel(whReg_filteredData, window.whRegColumns, {
			fileName: 'Warehouse_Inspection_Register',
			sheetName: 'WarehouseInspection'
		});
	};

})();
