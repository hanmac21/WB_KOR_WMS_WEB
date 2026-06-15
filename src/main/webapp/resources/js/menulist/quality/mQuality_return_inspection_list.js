/* 반품검사 List - source = 'RETURN' */

let rtInsp_allData = [];
let rtInsp_filteredData = [];
let rtInsp_pageData = [];
let rtInsp_currentPage = 1;
let rtInsp_itemsPerPage = 100;
let rtInsp_totalCount = 0;
let rtInsp_totalPages = 0;
let rtInsp_sortColumn = null;
let rtInsp_sortOrder = 'asc';
let rtInsp_totalQty = 0;

$(document).ready(function () {

	window.rtInspColumns = [
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

	window.call_mQuality_return_inspection_list = function () {
		showLoading('data');
		const { fromDate, toDate } = rtInsp_defaultDateRange();
		rtInsp_dbSearch({  fromDate, toDate, source: 'RETURN' });
	};

	function rtInsp_dbSearch(params) {
		showLoading('data');
		$.ajax({
			url: '/read_returnInspectionList',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ searchParams: params }),
			success: function (res) {
				rtInsp_allData = res.records || [];
				rtInsp_filteredData = [...rtInsp_allData];
				rtInsp_currentPage = 1;
				rtInsp_sortColumn = null;
				rtInsp_sortOrder = 'asc';

				rtInsp_totalQty = rtInsp_allData.length > 0
					? Number(rtInsp_allData[0].TOTALQTY || rtInsp_allData[0].totalqty || 0)
					: 0;

				rtInsp_paginate();

				if (!$('#view_mQuality_return_inspection_list').length) {
					rtInsp_renderView();
				} else {
					rtInsp_renderTable();
					rtInsp_renderPagination();
					rtInsp_updateCount();
					$('#rtInsp_tQty').text(Number(rtInsp_totalQty).toLocaleString());
				}
				hideLoading();
			},
			error: function () {
				hideLoading();
				alert('데이터 조회에 실패했습니다.');
			}
		});
	}

	function rtInsp_paginate() {
		rtInsp_itemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;
		rtInsp_totalCount = rtInsp_filteredData.length;
		rtInsp_totalPages = Math.ceil(rtInsp_totalCount / rtInsp_itemsPerPage);
		const start = (rtInsp_currentPage - 1) * rtInsp_itemsPerPage;
		rtInsp_pageData = rtInsp_filteredData.slice(start, start + rtInsp_itemsPerPage);
	}

	function rtInsp_sort(column, dataType) {
		if (rtInsp_sortColumn === column) {
			rtInsp_sortOrder = rtInsp_sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			rtInsp_sortColumn = column;
			rtInsp_sortOrder = 'asc';
		}
		rtInsp_filteredData.sort((a, b) => {
			let va = a[column] || a[column.toLowerCase()] || '';
			let vb = b[column] || b[column.toLowerCase()] || '';
			if (dataType === 'number') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
			else { va = String(va).toUpperCase(); vb = String(vb).toUpperCase(); }
			if (va < vb) return rtInsp_sortOrder === 'asc' ? -1 : 1;
			if (va > vb) return rtInsp_sortOrder === 'asc' ?  1 : -1;
			return 0;
		});
		rtInsp_currentPage = 1;
		rtInsp_paginate();
		rtInsp_renderTable();
		rtInsp_renderPagination();
		rtInsp_updateCount();
		$('.data-table.rtInsp thead th').removeClass('sort-asc sort-desc');
		$(`.data-table.rtInsp thead th[data-sort="${column}"]`).addClass('sort-' + rtInsp_sortOrder);
	}

	function rtInsp_renderView() {
		const { fromDate, toDate } = rtInsp_defaultDateRange();
        let loginid = $(".loginId").text().trim().toLowerCase();
        let btnHtml = "";
		if (loginid == "wms") {
            btnHtml = `
                <input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfReturnInspectionDelete"/>
            `;
        }
		const html = `
			<div class="divBlockControl" id="view_mQuality_return_inspection_list">
				<div class="content-body">
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div>${i18n.t('search.date')}</div>
								<input type="date" id="rtInsp_fromDate" value="${fromDate}" />
							</div>
							<div class="search-label">
								<div>　</div>
								<input type="date" id="rtInsp_toDate" value="${toDate}" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.itemCode')}</div>
								<input type="text" id="rtInsp_itemcode" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.oitemcode')}</div>
								<input type="text" id="rtInsp_spec" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.car') || 'Car'}</div>
								<input type="text" id="rtInsp_car" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.barcode')}</div>
								<input type="text" id="rtInsp_barcode" />
							</div>
							<div class="search-label">
								<div>${i18n.t('search.judgment') || '판정'}</div>
								<select id="rtInsp_judgment">
									<option value="">${i18n.t('search.all')}</option>
									<option value="SCRAP">SCRAP</option>
									<option value="RETURN">RETURN</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary" id="rtInsp_searchBtn">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary" id="rtInsp_clearBtn">${i18n.t('btn.clear')}</button>
						</div>
					</div>

					<div class="tab-container">
						<div class="tab">${i18n.t('quality.inspection.return') || '반품검사'}</div>
					</div>

					<div class="table-container">
						<div class="table-info">
							<span>
								${i18n.t('table.info.total')} <strong id="rtInsp_totalCount">0</strong> ${i18n.t('table.info.records')}
								| ${i18n.t('table.page')} <strong id="rtInsp_curPage">1</strong> / <strong id="rtInsp_totPage">1</strong>
								| QTY : <span id="rtInsp_tQty" style="color:#007bff"></span>
							</span>
							<div class="action-buttons-right">
								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnRtInspDelete"/>
								${btnHtml}
								<button class="btn btn-success" onclick="rtInsp_downloadExcel()">Excel</button>
							</div>
						</div>

						<table class="data-table rtInsp" id="rtInsp_table">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="rtInsp_chkAll" />
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
							<tbody id="rtInsp_tbody"></tbody>
						</table>

						<div class="pagination" id="rtInsp_pagination"></div>
						<div class="items-per-page-selector">
							<label for="rtInsp_ipp">${i18n.t('table.itemsPerPage')}:</label>
							<select id="rtInsp_ipp" class="items-per-page-select">
								<option value="100" selected>100</option>
								<option value="300">300</option>
								<option value="1000">1000</option>
							</select>
						</div>
					</div>
				</div>
			</div>`;

		$('.w_contentArea').append(html);

		rtInsp_renderTable();
		rtInsp_renderPagination();
		rtInsp_updateCount();
		$('#rtInsp_tQty').text(Number(rtInsp_totalQty).toLocaleString());
		rtInsp_bindEvents();
	}

	function rtInsp_renderTable() {
		let rows = '';
		rtInsp_pageData.forEach((d, i) => {
			const no = (rtInsp_currentPage - 1) * rtInsp_itemsPerPage + i + 1;

			let statusText = d.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
            let statusClass = d.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';

			rows += `<tr>
				<td class='checkboxVal'><input type="checkbox" class="rtInsp_chk row-checkbox" 
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
		$('#rtInsp_tbody').html(rows);
		$('.rtInsp_chkAll').prop('checked', false);
	}

	function rtInsp_renderPagination() {
		let html = '';
		const cur = rtInsp_currentPage, tot = rtInsp_totalPages;
		html += `<button class="rtInsp-page-btn${cur === 1 ? ' disabled' : ''}" data-page="${cur - 1}">&lt;</button>`;
		const s = Math.max(1, cur - 5), e = Math.min(tot, cur + 5);
		if (s > 1) { html += `<button class="rtInsp-page-btn" data-page="1">1</button>`; if (s > 2) html += `<span class="page-dots">...</span>`; }
		for (let p = s; p <= e; p++) html += `<button class="rtInsp-page-btn${p === cur ? ' active' : ''}" data-page="${p}">${p}</button>`;
		if (e < tot) { if (e < tot - 1) html += `<span class="page-dots">...</span>`; html += `<button class="rtInsp-page-btn" data-page="${tot}">${tot}</button>`; }
		html += `<button class="rtInsp-page-btn${cur >= tot ? ' disabled' : ''}" data-page="${cur + 1}">&gt;</button>`;
		$('#rtInsp_pagination').html(html);
	}

	function rtInsp_updateCount() {
		$('#rtInsp_totalCount').text(Number(rtInsp_totalCount).toLocaleString());
		$('#rtInsp_curPage').text(rtInsp_currentPage);
		$('#rtInsp_totPage').text(rtInsp_totalPages);
	}

	function rtInsp_getParams() {
		return {
			source:   'RETURN',
			fromDate: $('#rtInsp_fromDate').val(),
			toDate:   $('#rtInsp_toDate').val(),
			itemcode: $('#rtInsp_itemcode').val().trim().toUpperCase(),
			spec:     $('#rtInsp_spec').val().trim().toUpperCase(),
			car:      $('#rtInsp_car').val().trim().toUpperCase(),
			barcode:  $('#rtInsp_barcode').val().trim().toUpperCase(),
			judgment: $('#rtInsp_judgment').val()
		};
	}

	function rtInsp_reset() {
		const { fromDate, toDate } = rtInsp_defaultDateRange();
		$('#rtInsp_fromDate').val(fromDate);
		$('#rtInsp_toDate').val(toDate);
		$('#rtInsp_itemcode, #rtInsp_spec, #rtInsp_car, #rtInsp_barcode').val('');
		$('#rtInsp_judgment').val('');
		rtInsp_totalQty = 0;
		$('#rtInsp_tQty').text('0');
		rtInsp_currentPage = 1;
		rtInsp_dbSearch({ source: 'RETURN', fromDate, toDate });
	}

	function rtInsp_bindEvents() {
		$('#rtInsp_searchBtn').off('click').on('click', function () {
			rtInsp_currentPage = 1;
			rtInsp_dbSearch(rtInsp_getParams());
		});
		$('#rtInsp_clearBtn').off('click').on('click', rtInsp_reset);

		$('#rtInsp_ipp').off('change').on('change', function () {
			setCookie('itemsPerPage', $(this).val());
			rtInsp_currentPage = 1;
			rtInsp_paginate();
			rtInsp_renderTable();
			rtInsp_renderPagination();
			rtInsp_updateCount();
		});

		$(document).off('click', '.rtInsp-page-btn').on('click', '.rtInsp-page-btn', function () {
			if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;
			const p = parseInt($(this).data('page'));
			if (p > 0) { rtInsp_currentPage = p; rtInsp_paginate(); rtInsp_renderTable(); rtInsp_renderPagination(); rtInsp_updateCount(); }
		});

		$('#rtInsp_table thead th[data-sort]').off('click').on('click', function () {
			rtInsp_sort($(this).data('sort'), $(this).data('type') || 'string');
		});

		$('#view_mQuality_return_inspection_list input, #view_mQuality_return_inspection_list select').off('keypress').on('keypress', function (e) {
			if (e.which === 13) { rtInsp_currentPage = 1; rtInsp_dbSearch(rtInsp_getParams()); }
		});
	}

	// 헤더 전체 체크 → 현재 페이지 모든 행 체크/해제
	$(document).off('change', '.rtInsp_chkAll').on('change', '.rtInsp_chkAll', function () {
		const checked = $(this).prop('checked');
		$('#rtInsp_tbody .rtInsp_chk').prop('checked', checked);
	});

	// 개별 행 체크 시 헤더 상태 동기화
	$(document).off('change', '#rtInsp_tbody .rtInsp_chk').on('change', '#rtInsp_tbody .rtInsp_chk', function () {
		const total   = $('#rtInsp_tbody .rtInsp_chk').length;
		const checked = $('#rtInsp_tbody .rtInsp_chk:checked').length;
		$('.rtInsp_chkAll').prop('checked', total > 0 && checked === total);
	});

	function rtInsp_defaultDateRange() {
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

	$(document).on("click", ".btnRtInspDelete", function() {
		const iidList = [];
		$(".rtInsp_chk:checked").each(function() {
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
			url: "/updateRtInsp",
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

				let searchVal = rtInsp_getParams();
				rtInsp_dbSearch(searchVal);

				// 전체 선택 해제
				$('.rtInsp_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}
		});
	});

	$(document).on("click", ".btnIntfReturnInspectionDelete", function() {

    	if ($(".rtInsp_chk.status-waiting:checked").length > 0) {
    		alert(i18n.t('validation.unconfirm.items'));
    		return;
    	}

    	const iidList = [];
    	$(".rtInsp_chk:checked").each(function() {
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
    		url: "/returnInspection_intf_delete",
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
                let searchVal = rtInsp_getParams();
                rtInsp_dbSearch(searchVal);

                // 전체 선택 해제
                $('.rtInsp_chkAll').prop('checked', false);


    		},
    		error: function(xhr, status, error) {
    			hideLoading();
    			window.handleAjaxError(xhr, status, error);
    		}

    	});

    });
});

window.rtInsp_downloadExcel = function () {
	ExcelExporter.downloadExcel(rtInsp_filteredData, window.rtInspColumns, {
		fileName: 'ReturnInspection_List',
		sheetName: 'ReturnInspection'
	});
};
