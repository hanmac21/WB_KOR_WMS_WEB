/* 창고검사 List - source = 'STORAGE' */

let whInsp_allData = [];
let whInsp_filteredData = [];
let whInsp_pageData = [];
let whInsp_currentPage = 1;
let whInsp_itemsPerPage = 100;
let whInsp_totalCount = 0;
let whInsp_totalPages = 0;
let whInsp_sortColumn = null;
let whInsp_sortOrder = 'asc';
let whInsp_totalQty = 0;

$(document).ready(function () {

	window.whInspColumns = [
		{ key: 'SDATE',   header: 'date' },
		{ key: 'ITEMCODE',header: 'itemcode' },
		{ key: 'SPEC',    header: 'spec' },
		{ key: 'CAR',     header: 'car' },
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'QTY',     header: 'qty', type: 'number' },
		{ key: 'SOURCE2', header: 'judgment' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'LOGINID', header: 'loginid' },
		{ key: 'YMDHMS',  header: 'ymdhms' }
	];

	window.call_mQuality_warehouse_inspection_list = function () {
		showLoading('data');
		const { fromDate, toDate } = whInsp_defaultDateRange();
		whInsp_dbSearch({ fromDate, toDate, source: 'STORAGE' });
	};

	function whInsp_dbSearch(params) {
		showLoading('data');
		$.ajax({
			url: '/read_warehouseInspectionList',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ searchParams: params }),
			success: function (res) {
				whInsp_allData = res.records || [];
				whInsp_filteredData = [...whInsp_allData];
				whInsp_currentPage = 1;
				whInsp_sortColumn = null;
				whInsp_sortOrder = 'asc';

				whInsp_totalQty = whInsp_allData.length > 0
					? Number(whInsp_allData[0].TOTALQTY || whInsp_allData[0].totalqty || 0)
					: 0;

				whInsp_paginate();

				if (!$('#view_mQuality_warehouse_inspection_list').length) {
					whInsp_renderView();
				} else {
					whInsp_renderTable();
					whInsp_renderPagination();
					whInsp_updateCount();
					$('#whInsp_tQty').text(Number(whInsp_totalQty).toLocaleString());
				}
				hideLoading();
			},
			error: function () {
				hideLoading();
				alert('데이터 조회에 실패했습니다.');
			}
		});
	}

	function whInsp_paginate() {
		whInsp_itemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;
		whInsp_totalCount = whInsp_filteredData.length;
		whInsp_totalPages = Math.ceil(whInsp_totalCount / whInsp_itemsPerPage);
		const start = (whInsp_currentPage - 1) * whInsp_itemsPerPage;
		whInsp_pageData = whInsp_filteredData.slice(start, start + whInsp_itemsPerPage);
	}

	function whInsp_sort(column, dataType) {
		if (whInsp_sortColumn === column) {
			whInsp_sortOrder = whInsp_sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			whInsp_sortColumn = column;
			whInsp_sortOrder = 'asc';
		}
		whInsp_filteredData.sort((a, b) => {
			let va = a[column] || a[column.toLowerCase()] || '';
			let vb = b[column] || b[column.toLowerCase()] || '';
			if (dataType === 'number') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
			else { va = String(va).toUpperCase(); vb = String(vb).toUpperCase(); }
			if (va < vb) return whInsp_sortOrder === 'asc' ? -1 : 1;
			if (va > vb) return whInsp_sortOrder === 'asc' ?  1 : -1;
			return 0;
		});
		whInsp_currentPage = 1;
		whInsp_paginate();
		whInsp_renderTable();
		whInsp_renderPagination();
		whInsp_updateCount();
		$('.data-table.whInsp thead th').removeClass('sort-asc sort-desc');
		$(`.data-table.whInsp thead th[data-sort="${column}"]`).addClass('sort-' + whInsp_sortOrder);
	}

	function whInsp_renderView() {
		const { fromDate, toDate } = whInsp_defaultDateRange();
		let loginid = $(".loginId").text().trim().toLowerCase();
		let btnHtml = "";
        if (loginid == "wms") {
            btnHtml = `
                <input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfStorageInspectionDelete"/>
            `;
        }
		const html = `
			<div class="divBlockControl" id="view_mQuality_warehouse_inspection_list">
				<div class="content-body">
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div>${i18n.t('search.date')}</div>
								<input type="date" id="whInsp_fromDate" value="${fromDate}" />
							</div>
							<div class="search-label">
								<div>　</div>
								<input type="date" id="whInsp_toDate" value="${toDate}" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.itemCode')}</div>
								<input type="text" id="whInsp_itemcode" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.oitemcode')}</div>
								<input type="text" id="whInsp_spec" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.car') || 'Car'}</div>
								<input type="text" id="whInsp_car" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.barcode')}</div>
								<input type="text" id="whInsp_barcode" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.judgment') || '판정'}</div>
								<select id="whInsp_judgment">
									<option value="">${i18n.t('search.all')}</option>
									<option value="SCRAP">SCRAP</option>
									<option value="RETURN">RETURN</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary" id="whInsp_searchBtn">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary" id="whInsp_clearBtn">${i18n.t('btn.clear')}</button>
						</div>
					</div>

					<div class="tab-container">
						<div class="tab">${i18n.t('quality.inspection.warehouse') || '창고검사'}</div>
					</div>

					<div class="table-container">
						<div class="table-info">
							<span>
								${i18n.t('table.info.total')} <strong id="whInsp_totalCount">0</strong> ${i18n.t('table.info.records')}
								| ${i18n.t('table.page')} <strong id="whInsp_curPage">1</strong> / <strong id="whInsp_totPage">1</strong>
								| QTY : <span id="whInsp_tQty" style="color:#007bff"></span>
							</span>
							<div class="action-buttons-right">
								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnWhInspDelete"/>
								${btnHtml}
								<button class="btn btn-success" onclick="whInsp_downloadExcel()">Excel</button>
							</div>
						</div>

						<table class="data-table whInsp" id="whInsp_table">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="whInsp_chkAll" />
									</th>
									<th class="noVal">${i18n.t('table.no')}</th>
									<th class='statusVal' data-sort="STATUS">${i18n.t('table.status')}</th>
									<th class="dateVal"     data-sort="SDATE">${i18n.t('search.date')}</th>
									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
									<th class="itemcodeVal" data-sort="SPEC">${i18n.t('search.oitemcode')}</th>
									<th class="lineVal"     data-sort="CAR">${i18n.t('search.car') || 'Car'}</th>
									<th class="barcodeVal"  data-sort="BARCODE">${i18n.t('search.barcode')}</th>
									<th class="okngQtyVal"  data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
									<th class="lineVal"     data-sort="SOURCE2">${i18n.t('search.judgment') || '판정'}</th>
									<th class="lineVal"     data-sort="STORAGE">${i18n.t('search.storage') || 'Storage'}</th>
									<th class="cnameVal"    data-sort="LOGINID">${i18n.t('search.user')}</th>
									<th class="ymdhmsVal"   data-sort="YMDHMS">${i18n.t('table.time')}</th>
								</tr>
							</thead>
							<tbody id="whInsp_tbody"></tbody>
						</table>

						<div class="pagination" id="whInsp_pagination"></div>
						<div class="items-per-page-selector">
							<label for="whInsp_ipp">${i18n.t('table.itemsPerPage')}:</label>
							<select id="whInsp_ipp" class="items-per-page-select">
								<option value="100" selected>100</option>
								<option value="300">300</option>
								<option value="1000">1000</option>
							</select>
						</div>
					</div>
				</div>
			</div>`;

		$('.w_contentArea').append(html);

		whInsp_renderTable();
		whInsp_renderPagination();
		whInsp_updateCount();
		$('#whInsp_tQty').text(Number(whInsp_totalQty).toLocaleString());
		whInsp_bindEvents();
	}

	function whInsp_renderTable() {
		let rows = '';
		whInsp_pageData.forEach((d, i) => {
			const no = (whInsp_currentPage - 1) * whInsp_itemsPerPage + i + 1;

			let statusText = d.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
            let statusClass = d.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';

			rows += `<tr>
				<td class='checkboxVal'><input type="checkbox" class="whInsp_chk row-checkbox"
					data-delete="${d.IID}|${d.SDATE}|${d.FACTORY}|${d.STORAGE}|${d.BARCODE}|${d.MES_KEY}|${d.SOURCE}">
				</td>
				<td class="noVal">${no}</td>
				<td class="statusVal"><span class="${statusClass}">${statusText}</span></td>
				<td class="dateVal">${d.SDATE    || d.sdate    || ''}</td>
				<td class="itemcodeVal">${d.ITEMCODE || d.itemcode || ''}</td>
				<td class="itemcodeVal">${d.SPEC    || d.spec    || ''}</td>
				<td class="lineVal">${d.CAR      || d.car      || ''}</td>
				<td class="barcodeVal">${d.BARCODE  || d.barcode  || ''}</td>
				<td class="okngQtyVal">${Number(d.QTY || d.qty || 0).toLocaleString()}</td>
				<td class="lineVal">${d.SOURCE2  || d.source2  || ''}</td>
				<td class="lineVal">${d.STORAGE  || d.storage  || ''}</td>
				<td class="cnameVal">${d.LOGINID  || d.loginid  || ''}</td>
				<td class="ymdhmsVal">${d.YMDHMS   || d.ymdhms   || ''}</td>
			</tr>`;
		});
		$('#whInsp_tbody').html(rows);
		$('.whInsp_chkAll').prop('checked', false);
	}

	function whInsp_renderPagination() {
		let html = '';
		const cur = whInsp_currentPage, tot = whInsp_totalPages;
		html += `<button class="whInsp-page-btn${cur === 1 ? ' disabled' : ''}" data-page="${cur - 1}">&lt;</button>`;
		const s = Math.max(1, cur - 5), e = Math.min(tot, cur + 5);
		if (s > 1) { html += `<button class="whInsp-page-btn" data-page="1">1</button>`; if (s > 2) html += `<span class="page-dots">...</span>`; }
		for (let p = s; p <= e; p++) html += `<button class="whInsp-page-btn${p === cur ? ' active' : ''}" data-page="${p}">${p}</button>`;
		if (e < tot) { if (e < tot - 1) html += `<span class="page-dots">...</span>`; html += `<button class="whInsp-page-btn" data-page="${tot}">${tot}</button>`; }
		html += `<button class="whInsp-page-btn${cur >= tot ? ' disabled' : ''}" data-page="${cur + 1}">&gt;</button>`;
		$('#whInsp_pagination').html(html);
	}

	function whInsp_updateCount() {
		$('#whInsp_totalCount').text(Number(whInsp_totalCount).toLocaleString());
		$('#whInsp_curPage').text(whInsp_currentPage);
		$('#whInsp_totPage').text(whInsp_totalPages);
	}

	function whInsp_getParams() {
		return {
			source:   'STORAGE',
			fromDate: $('#whInsp_fromDate').val(),
			toDate:   $('#whInsp_toDate').val(),
			itemcode: $('#whInsp_itemcode').val().trim().toUpperCase(),
			spec:     $('#whInsp_spec').val().trim().toUpperCase(),
			car:      $('#whInsp_car').val().trim().toUpperCase(),
			barcode:  $('#whInsp_barcode').val().trim().toUpperCase(),
			judgment: $('#whInsp_judgment').val()
		};
	}

	function whInsp_reset() {
		const { fromDate, toDate } = whInsp_defaultDateRange();
		$('#whInsp_fromDate').val(fromDate);
		$('#whInsp_toDate').val(toDate);
		$('#whInsp_itemcode, #whInsp_spec, #whInsp_car, #whInsp_barcode').val('');
		$('#whInsp_judgment').val('');
		whInsp_totalQty = 0;
		$('#whInsp_tQty').text('0');
		whInsp_currentPage = 1;
		whInsp_dbSearch({ source: 'STORAGE', fromDate, toDate });
	}

	function whInsp_bindEvents() {
		$('#whInsp_searchBtn').off('click').on('click', function () {
			whInsp_currentPage = 1;
			whInsp_dbSearch(whInsp_getParams());
		});
		$('#whInsp_clearBtn').off('click').on('click', whInsp_reset);

		$('#whInsp_ipp').off('change').on('change', function () {
			setCookie('itemsPerPage', $(this).val());
			whInsp_currentPage = 1;
			whInsp_paginate();
			whInsp_renderTable();
			whInsp_renderPagination();
			whInsp_updateCount();
		});

		$(document).off('click', '.whInsp-page-btn').on('click', '.whInsp-page-btn', function () {
			if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;
			const p = parseInt($(this).data('page'));
			if (p > 0) { whInsp_currentPage = p; whInsp_paginate(); whInsp_renderTable(); whInsp_renderPagination(); whInsp_updateCount(); }
		});

		$('#whInsp_table thead th[data-sort]').off('click').on('click', function () {
			whInsp_sort($(this).data('sort'), $(this).data('type') || 'string');
		});

		$('#view_mQuality_warehouse_inspection_list input, #view_mQuality_warehouse_inspection_list select').off('keypress').on('keypress', function (e) {
			if (e.which === 13) { whInsp_currentPage = 1; whInsp_dbSearch(whInsp_getParams()); }
		});
	}

	// 헤더 전체 체크 → 현재 페이지 모든 행 체크/해제
	$(document).off('change', '.whInsp_chkAll').on('change', '.whInsp_chkAll', function () {
		const checked = $(this).prop('checked');
		$('#whInsp_tbody .whInsp_chk').prop('checked', checked);
	});

	// 개별 행 체크 시 헤더 상태 동기화
	$(document).off('change', '#whInsp_tbody .whInsp_chk').on('change', '#whInsp_tbody .whInsp_chk', function () {
		const total   = $('#whInsp_tbody .whInsp_chk').length;
		const checked = $('#whInsp_tbody .whInsp_chk:checked').length;
		$('.whInsp_chkAll').prop('checked', total > 0 && checked === total);
	});

	function whInsp_defaultDateRange() {
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

	$(document).on("click", ".btnWhInspDelete", function() {
		const iidList = [];
		$(".whInsp_chk:checked").each(function() {
			let iid = $(this).data('delete');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		if (!confirm(i18n.t('confirmation.items.delete'))) {
			return;
		}

		showLoading("data");

		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");

		console.log(iidList)

		$.ajax({
			url: "/updateWhInsp",
			type: "POST",
			data: JSON.stringify({
				iidList: iidList,
				loginid: loginid,
				admin: false
			}),
			contentType: "application/json",
			success: function(data) {
				if (data && data.success) {
					alert(i18n.tf('success.barcode.delete', data.deleteCount || 0));
				}

				let searchVal = whInsp_getParams();
				whInsp_dbSearch(searchVal);

				// 전체 선택 해제
				$('.whInsp_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}
		});
	});

	$(document).on("click", ".btnIntfStorageInspectionDelete", function() {

        	if ($(".whInsp_chk.status-waiting:checked").length > 0) {
        		alert(i18n.t('validation.unconfirm.items'));
        		return;
        	}

        	const iidList = [];
        	$(".whInsp_chk:checked").each(function() {
        		let iid = $(this).data('delete');
        		if (iid) iidList.push(iid);
        	});

        	// 체크된 요소가 없으면 경고창 표시 후 리턴
        	if (iidList.length === 0) {
        		alert(i18n.t('validation.no.select.items'));
        		return;
        	}

        	if (!confirm(i18n.t('confirmation.interface.progress'))) {
        		return;
        	}

        	showLoading("data");

        	$.ajax({
        		url: "/storageInspection_intf_delete",
        		type: "POST",
        		data: JSON.stringify(iidList),
        		contentType: "application/json",
        		success: function(data) {
        			hideLoading();
        			let msg = [];

        			if (msg.length > 0) {
        				alert("The following items were not processed:\n" + msg.join("\n"));
        			}

        			// 재조회
                    let searchVal = whInsp_getParams();
                    whInsp_dbSearch(searchVal);

                    // 전체 선택 해제
                    $('.whInsp_chkAll').prop('checked', false);


        		},
        		error: function(xhr, status, error) {
        			hideLoading();
        			window.handleAjaxError(xhr, status, error);
        		}

        	});

        });
});

window.whInsp_downloadExcel = function () {
	ExcelExporter.downloadExcel(whInsp_filteredData, window.whInspColumns, {
		fileName: 'WarehouseInspection_List',
		sheetName: 'WarehouseInspection'
	});
};
