/* 출고반품/반품검사 등록 */

(function () {

	let lrReg_allData = [];
	let lrReg_filteredData = [];
	let lrReg_pageData = [];
	let lrReg_currentPage = 1;
	let lrReg_itemsPerPage = 100;
	let lrReg_totalCount = 0;
	let lrReg_totalPages = 0;
	let lrReg_totalQty = 0;
	let lrReg_sortColumn = null;
	let lrReg_sortOrder = 'asc';
	let lrReg_hasExcelUploaded = false;

	function lrReg_renderTable() {
		let rows = '';
		for (let i = 0; i < lrReg_pageData.length; i++) {
			const d = lrReg_pageData[i];
			const no = (lrReg_currentPage - 1) * lrReg_itemsPerPage + i + 1;
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
		$('#lrReg_tbody').html(rows);
		lrReg_updateSummary();
	}

	function lrReg_renderPagination() {
		let html = '';
		const cur = lrReg_currentPage, tot = lrReg_totalPages;
		html += `<button class="lrReg-page-btn${cur === 1 ? ' disabled' : ''}" data-page="${cur - 1}">&lt;</button>`;
		const s = Math.max(1, cur - 5), e = Math.min(tot, cur + 5);
		if (s > 1) { html += `<button class="lrReg-page-btn" data-page="1">1</button>`; if (s > 2) html += `<span class="page-dots">...</span>`; }
		for (let p = s; p <= e; p++) html += `<button class="lrReg-page-btn${p === cur ? ' active' : ''}" data-page="${p}">${p}</button>`;
		if (e < tot) { if (e < tot - 1) html += `<span class="page-dots">...</span>`; html += `<button class="lrReg-page-btn" data-page="${tot}">${tot}</button>`; }
		html += `<button class="lrReg-page-btn${cur >= tot ? ' disabled' : ''}" data-page="${cur + 1}">&gt;</button>`;
		$('#lrReg_pagination').html(html);
	}

	function lrReg_updateCount() {
		$('#lrReg_totalCount').text(Number(lrReg_totalCount).toLocaleString());
		$('#lrReg_curPage').text(lrReg_currentPage);
		$('#lrReg_totPage').text(lrReg_totalPages);
	}

	function lrReg_updateSummary() {
		let sum = 0;
		(lrReg_filteredData || []).forEach(function (row) {
			sum += parseFloat(row.QTY ?? row.qty ?? 0) || 0;
		});
		lrReg_totalQty = sum;
		$('#lrReg_tQty').text(Number(sum).toLocaleString());
	}

	$(document).ready(function () {

		window.lrRegColumns = [
			{ key: 'SDATE',    header: 'date' },
			{ key: 'ITEMCODE', header: 'itemcode' },
			{ key: 'QTY',      header: 'qty', type: 'number' },
			{ key: 'JUDGMENT', header: 'judgment' }
		];

		window.call_mQuality_loadReturn_inspection_register = function () {
			if (!$('#view_mQuality_loadReturn_inspection_register').length) {
				renderLrRegView();
			}
		};

		function lrReg_applyPagination() {
			lrReg_itemsPerPage = parseInt(lrReg_getCookie('itemsPerPage')) || 100;
			lrReg_totalCount = lrReg_filteredData.length;
			lrReg_totalPages = Math.ceil(lrReg_totalCount / lrReg_itemsPerPage);
			const start = (lrReg_currentPage - 1) * lrReg_itemsPerPage;
			lrReg_pageData = lrReg_filteredData.slice(start, start + lrReg_itemsPerPage);
		}

		function lrReg_applySort(column, dataType) {
			if (lrReg_sortColumn === column) {
				lrReg_sortOrder = lrReg_sortOrder === 'asc' ? 'desc' : 'asc';
			} else {
				lrReg_sortColumn = column;
				lrReg_sortOrder = 'asc';
			}
			lrReg_filteredData.sort((a, b) => {
				let va = a[column] || a[column.toLowerCase()] || '';
				let vb = b[column] || b[column.toLowerCase()] || '';
				if (dataType === 'number') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
				else { va = String(va).toUpperCase(); vb = String(vb).toUpperCase(); }
				if (va < vb) return lrReg_sortOrder === 'asc' ? -1 : 1;
				if (va > vb) return lrReg_sortOrder === 'asc' ?  1 : -1;
				return 0;
			});
			lrReg_currentPage = 1;
			lrReg_applyPagination();
			lrReg_renderTable();
			lrReg_renderPagination();
			lrReg_updateCount();
			$('.data-table.lrReg thead th').removeClass('sort-asc sort-desc');
			$(`.data-table.lrReg thead th[data-sort="${column}"]`).addClass('sort-' + lrReg_sortOrder);
		}

		function renderLrRegView() {
			const html = `
				<div class="divBlockControl" id="view_mQuality_loadReturn_inspection_register">
					<div class="content-body">
						<div class="search-area">
							<div class="search-row">
							</div>
							<div class="search_button_area">
								<button class="btn btn-primary" id="lrReg_saveBtn">${i18n.t('btn.save')}</button>
							</div>
						</div>

						<div class="tab-container">
							<div class="tab">${i18n.t('quality.inspection.loadReturn.register') || '출고반품/반품검사 등록'}</div>
						</div>

						<div class="table-container">
							<div class="table-info">
								<span>
									${i18n.t('table.info.total')} <strong id="lrReg_totalCount">0</strong> ${i18n.t('table.info.records')}
									| ${i18n.t('table.page')} <strong id="lrReg_curPage">1</strong> / <strong id="lrReg_totPage">1</strong>
									| QTY : <span id="lrReg_tQty" style="color:#007bff">0</span>
								</span>
								<div class="action-buttons-right">
									<button class="btn btn-success" id="lrReg_excelFormBtn">Excel Form</button>
									<input type="file" id="lrReg_excelFile" accept=".xlsx, .xls" style="display:none;" />
									<input type="button" id="lrReg_fileSelectBtn" value="Select File" style="background-color: #185c37; color: white;" class="btn" />
									<button class="btn btn-success" onclick="lrReg_downloadExcel()">Excel</button>
								</div>
							</div>

							<table class="data-table lrReg" id="lrReg_table">
								<thead>
									<tr>
										<th class="noVal">No</th>
										<th class="dateVal"     data-sort="SDATE">${i18n.t('search.date')}</th>
										<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
										<th class="okngQtyVal"  data-sort="QTY" data-type="number">QTY</th>
										<th class="lineVal"     data-sort="JUDGMENT">${i18n.t('search.judgment') || 'Judgment'}</th>
									</tr>
								</thead>
								<tbody id="lrReg_tbody"></tbody>
							</table>

							<div class="pagination" id="lrReg_pagination"></div>
							<div class="items-per-page-selector">
								<label for="lrReg_ipp">${i18n.t('table.itemsPerPage')}:</label>
								<select id="lrReg_ipp" class="items-per-page-select">
									<option value="100" selected>100</option>
									<option value="300">300</option>
									<option value="1000">1000</option>
								</select>
							</div>
						</div>
					</div>
				</div>`;

			$('.w_contentArea').append(html);

			const savedItemsPerPage = parseInt(lrReg_getCookie('itemsPerPage')) || 100;
			lrReg_itemsPerPage = savedItemsPerPage;
			$('#lrReg_ipp').val(savedItemsPerPage);

			lrReg_renderTable();
			lrReg_renderPagination();
			lrReg_updateCount();
			lrReg_updateSummary();
			lrReg_bindEvents();
		}

		function lrReg_bindEvents() {
			$('#lrReg_excelFormBtn').off('click').on('click', function () {
				window.location.href = '/inspectionExcelFormDownload';
			});

			$('#lrReg_fileSelectBtn').off('click').on('click', function () {
				$('#lrReg_excelFile').click();
			});

			$('#lrReg_excelFile').off('change').on('change', function () {
				if (lrReg_hasExcelUploaded) {
					if (confirm('Already uploaded. Refresh to load a new file.\nRefresh now?')) {
						sessionStorage.setItem('autoOpenMenuId', 'mQuality_loadReturn_inspection_register');
						location.reload();
					}
					this.value = '';
					return;
				}
				if (this.files[0]) {
					lrReg_excelUpload(this.files[0]);
				}
				this.value = '';
			});

			$('#lrReg_saveBtn').off('click').on('click', lrReg_save);

			$('#lrReg_ipp').off('change').on('change', function () {
				lrReg_setCookie('itemsPerPage', $(this).val());
				lrReg_currentPage = 1;
				lrReg_applyPagination();
				lrReg_renderTable();
				lrReg_renderPagination();
				lrReg_updateCount();
			});

			$(document).off('click', '.lrReg-page-btn').on('click', '.lrReg-page-btn', function () {
				if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;
				const p = parseInt($(this).data('page'));
				if (p > 0) {
					lrReg_currentPage = p;
					lrReg_applyPagination();
					lrReg_renderTable();
					lrReg_renderPagination();
					lrReg_updateCount();
				}
			});

			$('#lrReg_table thead th[data-sort]').off('click').on('click', function () {
				lrReg_applySort($(this).data('sort'), $(this).data('type') || 'string');
			});

		}

		function lrReg_excelUpload(file) {
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
					lrReg_filteredData = excelData.map(item => ({
						SDATE:    item.sdate    || item.SDATE    || '',
						ITEMCODE: (item.itemcode || item.ITEMCODE || '').toUpperCase(),
						QTY:      Number(item.qty || item.QTY || 0),
						JUDGMENT: (item.judgment  || item.JUDGMENT  || '').toUpperCase()
					}));
					lrReg_allData = [...lrReg_filteredData];
					lrReg_hasExcelUploaded = true;
					lrReg_currentPage = 1;
					lrReg_applyPagination();
					lrReg_renderTable();
					lrReg_renderPagination();
					lrReg_updateCount();
					lrReg_updateSummary();
					$('#lrReg_fileSelectBtn').prop('disabled', true).css('opacity', '0.5');
					$('#lrReg_excelFile').prop('disabled', true);
					hideLoading();
				},
				error: function (xhr, status, error) {
					const message = 'An error occurred.\n\nDetails:\n' + (xhr.responseText || error || status || 'Unknown error');
					window.showCopyableAlert ? window.showCopyableAlert(message) : alert(message);
					hideLoading();
				}
			});
		}

		function lrReg_save() {
			if (lrReg_filteredData.length === 0) {
				alert('No data available.');
				return;
			}
			const loginid = sessionStorage.getItem('userId') || '';
			const source = 'RETURN';
			if (!confirm(`${lrReg_filteredData.length} items will be saved.\nDo you want to continue?`)) return;

			showLoading('data');
			$.ajax({
				url: '/inspectionReturn',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({ list: lrReg_filteredData, loginid, source }),
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
		if (autoMenuId === 'mQuality_loadReturn_inspection_register') {
			sessionStorage.removeItem('autoOpenMenuId');
			if (typeof window.call_mQuality_loadReturn_inspection_register === 'function') {
				window.call_mQuality_loadReturn_inspection_register();
			}
		}
	});

	function lrReg_fmt(d) {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	function lrReg_getCookie(name) {
		const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return m ? decodeURIComponent(m[2]) : '';
	}

	function lrReg_setCookie(name, val, days = 365) {
		const d = new Date();
		d.setTime(d.getTime() + days * 86400000);
		document.cookie = name + '=' + encodeURIComponent(val) + ';expires=' + d.toUTCString() + ';path=/';
	}

	window.lrReg_downloadExcel = function () {
		ExcelExporter.downloadExcel(lrReg_filteredData, window.lrRegColumns, {
			fileName: 'LoadReturn_Inspection_Register',
			sheetName: 'LoadReturnInspection'
		});
	};

})();
