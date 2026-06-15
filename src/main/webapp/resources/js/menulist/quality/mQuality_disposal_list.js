/* 폐기 List - source2 IN ('SCRAP','RETURN') */

let displ_allData = [];
let displ_filteredData = [];
let displ_pageData = [];
let displ_currentPage = 1;
let displ_itemsPerPage = 100;
let displ_totalCount = 0;
let displ_totalPages = 0;
let displ_sortColumn = null;
let displ_sortOrder = 'asc';
let displ_totalQty = 0;

$(document).ready(function () {

	window.displColumns = [
		{ key: 'SDATE',   header: 'date' },
		{ key: 'ITEMCODE',header: 'itemcode' },
		{ key: 'SPEC',    header: 'spec' },
		{ key: 'CAR',     header: 'car' },
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'QTY',     header: 'qty', type: 'number' },
		{ key: 'SOURCE',  header: 'source' },
		{ key: 'SOURCE2', header: 'judgment' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'LOGINID', header: 'loginid' },
		{ key: 'YMDHMS',  header: 'ymdhms' }
	];

	window.call_mQuality_disposal_list = function () {
		if (!$('#view_mQuality_disposal_list').length) {
			displ_renderView();
		}
		const { fromDate, toDate } = displ_defaultDateRange();
		displ_dbSearch({ fromDate, toDate, judgment: 'SCRAP' });
	};

	function displ_dbSearch(params) {
		showLoading('data');
		$.ajax({
			url: '/read_disposalList',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ searchParams: params }),
			success: function (res) {
				displ_allData = res.records || [];
				displ_filteredData = [...displ_allData];
				displ_currentPage = 1;
				displ_sortColumn = null;
				displ_sortOrder = 'asc';

				displ_totalQty = displ_allData.length > 0
					? Number(displ_allData[0].TOTALQTY || displ_allData[0].totalqty || 0)
					: 0;

				displ_paginate();
				displ_renderTable();
				displ_renderPagination();
				displ_updateCount();
				$('#displ_tQty').text(Number(displ_totalQty).toLocaleString());
				hideLoading();
			},
			error: function () {
				hideLoading();
				alert('데이터 조회에 실패했습니다.');
			}
		});
	}

	function displ_paginate() {
		displ_itemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;
		displ_totalCount = displ_filteredData.length;
		displ_totalPages = Math.ceil(displ_totalCount / displ_itemsPerPage);
		const start = (displ_currentPage - 1) * displ_itemsPerPage;
		displ_pageData = displ_filteredData.slice(start, start + displ_itemsPerPage);
	}

	function displ_sort(column, dataType) {
		if (displ_sortColumn === column) {
			displ_sortOrder = displ_sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			displ_sortColumn = column;
			displ_sortOrder = 'asc';
		}
		displ_filteredData.sort((a, b) => {
			let va = a[column] || a[column.toLowerCase()] || '';
			let vb = b[column] || b[column.toLowerCase()] || '';
			if (dataType === 'number') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
			else { va = String(va).toUpperCase(); vb = String(vb).toUpperCase(); }
			if (va < vb) return displ_sortOrder === 'asc' ? -1 : 1;
			if (va > vb) return displ_sortOrder === 'asc' ?  1 : -1;
			return 0;
		});
		displ_currentPage = 1;
		displ_paginate();
		displ_renderTable();
		displ_renderPagination();
		displ_updateCount();
		$('.data-table.displ thead th').removeClass('sort-asc sort-desc');
		$(`.data-table.displ thead th[data-sort="${column}"]`).addClass('sort-' + displ_sortOrder);
	}

	function displ_renderView() {
		const { fromDate, toDate } = displ_defaultDateRange();
		const isWms = $(".loginId").text().trim().toLowerCase() === "wms";
		let btnHtml = isWms ? `<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfScrapDelete"/>` : '';
		let chkHtml = isWms ? `<th class='checkboxVal'><input type="checkbox" class="displ_chkAll" /></th>` : '';
		const html = `
			<div class="divBlockControl" id="view_mQuality_disposal_list">
				<div class="content-body">
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div>${i18n.t('search.date')}</div>
								<input type="date" id="displ_fromDate" value="${fromDate}" />
							</div>
							<div class="search-label">
								<div>　</div>
								<input type="date" id="displ_toDate" value="${toDate}" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.itemCode')}</div>
								<input type="text" id="displ_itemcode" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.oitemcode')}</div>
								<input type="text" id="displ_spec" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.car') || 'Car'}</div>
								<input type="text" id="displ_car" />
							</div>
							<div class="search-label">
								<div>Barcode</div>
								<input type="text" id="displ_barcode" />
							</div>
							<div class="search-label">
								<div>구분</div>
								<select id="displ_source">
									<option value="">${i18n.t('search.all')}</option>
									<option value="STORAGE">STORAGE</option>
									<option value="RETURN">RETURN</option>
								</select>
							</div>
							<div class="search-label">
								<div>${i18n.t('search.judgment') || '판정'}</div>
								<select id="displ_judgment" disabled>
									<option value="SCRAP" selected>SCRAP</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary" id="displ_searchBtn">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary" id="displ_clearBtn">${i18n.t('btn.clear')}</button>
						</div>
					</div>

					<div class="tab-container">
						<div class="tab">${i18n.t('quality.scrap.list') || '폐기'}</div>
					</div>

					<div class="table-container">
						<div class="table-info">
							<span>
								${i18n.t('table.info.total')} <strong id="displ_totalCount">0</strong> ${i18n.t('table.info.records')}
								| ${i18n.t('table.page')} <strong id="displ_curPage">1</strong> / <strong id="displ_totPage">1</strong>
								| QTY : <span id="displ_tQty" style="color:#007bff"></span>
							</span>
							<div class="action-buttons-right">
							    ${btnHtml}
								<button class="btn btn-success" onclick="displ_downloadExcel()">Excel</button>
							</div>
						</div>

						<table class="data-table displ" id="displ_table">
							<thead>
								<tr>
									${chkHtml}
									<th class="noVal">No</th>
									<th class='statusVal' data-sort="STATUS">${i18n.t('table.status')}</th>
									<th class="dateVal"     data-sort="SDATE">${i18n.t('search.date')}</th>
									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
									<th class="itemcodeVal" data-sort="SPEC">${i18n.t('search.oitemcode')}</th>
									<th class="lineVal"     data-sort="CAR">${i18n.t('search.car') || 'Car'}</th>
									<th class="barcodeVal"  data-sort="BARCODE">Barcode</th>
									<th class="okngQtyVal"  data-sort="QTY" data-type="number">QTY</th>
									<th class="lineVal"     data-sort="SOURCE">구분</th>
									<th class="lineVal"     data-sort="SOURCE2">${i18n.t('search.judgment') || '판정'}</th>
									<th class="lineVal"     data-sort="STORAGE">${i18n.t('search.storage') || 'Storage'}</th>
									<th class="cnameVal"    data-sort="LOGINID">Login ID</th>
									<th class="ymdhmsVal"   data-sort="YMDHMS">YMDHMS</th>
								</tr>
							</thead>
							<tbody id="displ_tbody"></tbody>
						</table>

						<div class="pagination" id="displ_pagination"></div>
						<div class="items-per-page-selector">
							<label for="displ_ipp">${i18n.t('table.itemsPerPage')}:</label>
							<select id="displ_ipp" class="items-per-page-select">
								<option value="100" selected>100</option>
								<option value="300">300</option>
								<option value="1000">1000</option>
							</select>
						</div>
					</div>
				</div>
			</div>`;

		$('.w_contentArea').append(html);
		displ_bindEvents();
	}

	function displ_renderTable() {
		const isWms = $(".loginId").text().trim().toLowerCase() === "wms";
		let rows = '';
		displ_pageData.forEach((d, i) => {
			const no = (displ_currentPage - 1) * displ_itemsPerPage + i + 1;

			let statusText = d.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
            let statusClass = d.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';

			rows += `<tr>
				${isWms ? `<td class='checkboxVal'><input type="checkbox" class="displ_chk row-checkbox" data-delete="${d.IID}|${d.SDATE}|${d.FACTORY}|${d.STORAGE}|${d.BARCODE}|${d.MES_KEY}|${d.SOURCE}"></td>` : ''}
				<td class="noVal">${no}</td>
				<td class="statusVal"><span class="${statusClass}">${statusText}</span></td>
				<td class="dateVal">${d.SDATE    || d.sdate    || ''}</td>
				<td class="itemcodeVal">${d.ITEMCODE || d.itemcode || ''}</td>
				<td class="itemcodeVal">${d.SPEC    || d.spec    || ''}</td>
				<td class="lineVal">${d.CAR      || d.car      || ''}</td>
				<td class="barcodeVal">${d.BARCODE  || d.barcode  || ''}</td>
				<td class="okngQtyVal">${Number(d.QTY || d.qty || 0).toLocaleString()}</td>
				<td class="lineVal">${d.SOURCE   || d.source   || ''}</td>
				<td class="lineVal">${d.SOURCE2  || d.source2  || ''}</td>
				<td class="lineVal">${d.STORAGE  || d.storage  || ''}</td>
				<td class="cnameVal">${d.LOGINID  || d.loginid  || ''}</td>
				<td class="ymdhmsVal">${d.YMDHMS   || d.ymdhms   || ''}</td>
			</tr>`;
		});
		$('#displ_tbody').html(rows);
		$('.displ_chkAll').prop('checked', false);
	}

	function displ_renderPagination() {
		let html = '';
		const cur = displ_currentPage, tot = displ_totalPages;
		html += `<button class="displ-page-btn${cur === 1 ? ' disabled' : ''}" data-page="${cur - 1}">&lt;</button>`;
		const s = Math.max(1, cur - 5), e = Math.min(tot, cur + 5);
		if (s > 1) { html += `<button class="displ-page-btn" data-page="1">1</button>`; if (s > 2) html += `<span class="page-dots">...</span>`; }
		for (let p = s; p <= e; p++) html += `<button class="displ-page-btn${p === cur ? ' active' : ''}" data-page="${p}">${p}</button>`;
		if (e < tot) { if (e < tot - 1) html += `<span class="page-dots">...</span>`; html += `<button class="displ-page-btn" data-page="${tot}">${tot}</button>`; }
		html += `<button class="displ-page-btn${cur >= tot ? ' disabled' : ''}" data-page="${cur + 1}">&gt;</button>`;
		$('#displ_pagination').html(html);
	}

	function displ_updateCount() {
		$('#displ_totalCount').text(Number(displ_totalCount).toLocaleString());
		$('#displ_curPage').text(displ_currentPage);
		$('#displ_totPage').text(displ_totalPages);
	}

	function displ_getParams() {
		return {
			fromDate: $('#displ_fromDate').val(),
			toDate:   $('#displ_toDate').val(),
			itemcode: $('#displ_itemcode').val().trim().toUpperCase(),
			spec:     $('#displ_spec').val().trim().toUpperCase(),
			car:      $('#displ_car').val().trim().toUpperCase(),
			barcode:  $('#displ_barcode').val().trim().toUpperCase(),
			source:   $('#displ_source').val(),
			judgment: $('#displ_judgment').val()
		};
	}

	function displ_reset() {
		const { fromDate, toDate } = displ_defaultDateRange();
		$('#displ_fromDate').val(fromDate);
		$('#displ_toDate').val(toDate);
		$('#displ_itemcode, #displ_spec, #displ_car, #displ_barcode').val('');
		$('#displ_source').val('');
		$('#displ_judgment').val('SCRAP');
		displ_totalQty = 0;
		$('#displ_tQty').text('0');
		displ_currentPage = 1;
		displ_dbSearch({ fromDate, toDate, judgment: 'SCRAP' });
	}

	function displ_bindEvents() {
		$('#displ_searchBtn').off('click').on('click', function () {
			displ_currentPage = 1;
			displ_dbSearch(displ_getParams());
		});
		$('#displ_clearBtn').off('click').on('click', displ_reset);

		$('#displ_ipp').off('change').on('change', function () {
			setCookie('itemsPerPage', $(this).val());
			displ_currentPage = 1;
			displ_paginate();
			displ_renderTable();
			displ_renderPagination();
			displ_updateCount();
		});

		$(document).off('click', '.displ-page-btn').on('click', '.displ-page-btn', function () {
			if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;
			const p = parseInt($(this).data('page'));
			if (p > 0) { displ_currentPage = p; displ_paginate(); displ_renderTable(); displ_renderPagination(); displ_updateCount(); }
		});

		$('#displ_table thead th[data-sort]').off('click').on('click', function () {
			displ_sort($(this).data('sort'), $(this).data('type') || 'string');
		});

		$('#view_mQuality_disposal_list input, #view_mQuality_disposal_list select').off('keypress').on('keypress', function (e) {
			if (e.which === 13) { displ_currentPage = 1; displ_dbSearch(displ_getParams()); }
		});
	}

	// 헤더 전체 체크 → 현재 페이지 모든 행 체크/해제
	$(document).off('change', '.displ_chkAll').on('change', '.displ_chkAll', function () {
		const checked = $(this).prop('checked');
		$('#displ_tbody .displ_chk').prop('checked', checked);
	});

	// 개별 행 체크 시 헤더 상태 동기화
	$(document).off('change', '#displ_tbody .displ_chk').on('change', '#displ_tbody .displ_chk', function () {
		const total   = $('#displ_tbody .displ_chk').length;
		const checked = $('#displ_tbody .displ_chk:checked').length;
		$('.displ_chkAll').prop('checked', total > 0 && checked === total);
	});

	function displ_defaultDateRange() {
		const today = new Date();
		return { toDate: fmt(today), fromDate: fmt(new Date(today.getFullYear(), today.getMonth(), 1)) };
	}

	function fmt(d) {
		return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
	}

	function getCookie(name) {
		const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return m ? decodeURIComponent(m[2]) : '';
	}

	function setCookie(name, val, days = 365) {
		const d = new Date();
		d.setTime(d.getTime() + days * 86400000);
		document.cookie = name + '=' + encodeURIComponent(val) + ';expires=' + d.toUTCString() + ';path=/';
	}

	$(document).on("click", ".btnIntfScrapDelete", function() {

		if ($(".displ_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}

		const iidList = [];
		$(".displ_chk:checked").each(function() {
			let iid = $(this).data('delete');
			if (iid) iidList.push(iid);
		});

		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		if (!confirm(i18n.t('confirmation.interface.progress'))) {
			return;
		}

		showLoading("data");

		$.ajax({
			url: "/scrap_intf_delete",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				hideLoading();
				let searchVal = displ_getParams();
				displ_dbSearch(searchVal);
				$('.displ_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				hideLoading();
				window.handleAjaxError(xhr, status, error);
			}
		});
	});
});

window.displ_downloadExcel = function () {
	ExcelExporter.downloadExcel(displ_filteredData, window.displColumns, {
		fileName: 'Disposal_List',
		sheetName: 'Disposal'
	});
};
