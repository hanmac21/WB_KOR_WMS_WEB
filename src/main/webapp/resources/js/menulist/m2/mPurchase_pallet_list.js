/* --------------------------------------------------------------
 * 📌 구매 - 팔레트라벨 - 팔레트라벨 목록 (클라이언트 정렬/페이징 버전)
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_palletList = [];
let globalPalletListData = [];
let currentPalletListPage = 1;
let palletListItemsPerPage = 100;
let totalPalletListCount = 0;
let totalPalletListPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_pallet_list = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		performPalletListDBSearch({ fromDate, toDate });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performPalletListDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_palletList",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				allServerData = response.records || [];
				filteredData_palletList = [...allServerData];
				totalQty = response.totalQty || 0;

				currentPalletListPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				applyClientPagination();

				if (!$('#view_mPurchase_pallet_list').length) {
					renderPalletListView();
				} else {
					renderPalletListTableData();
					renderPalletListPagination();
					updatePalletListTotalCount();
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

	// 클라이언트에서 페이징 처리
	function applyClientPagination() {
		palletListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalPalletListCount = filteredData_palletList.length;
		totalPalletListPages = Math.ceil(totalPalletListCount / palletListItemsPerPage);

		const startIndex = (currentPalletListPage - 1) * palletListItemsPerPage;
		const endIndex = startIndex + palletListItemsPerPage;

		globalPalletListData = filteredData_palletList.slice(startIndex, endIndex);
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_palletList.sort((a, b) => {
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

		currentPalletListPage = 1;
		applyClientPagination();

		renderPalletListTableData();
		renderPalletListPagination();
		updatePalletListTotalCount();

		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderPalletListView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_pallet_list">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row m2_3_1">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
								<input type="date" id="palletList_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="palletList_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_barcode">${i18n.t('search.barcode')}<!-- BARCODE --></div>
								<input type="text" id="palletList_searchVal_barcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_custcode">${i18n.t('search.cucode')}<!-- CUSTCODE --></div>
								<input type="text" id="palletList_searchVal_custcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_custname">${i18n.t('search.cname')}<!-- CUSTNAME --></div>
								<input type="text" id="palletList_searchVal_custname" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="palletList_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_issue">${i18n.t('search.issue')}<!-- ISSUE --></div>
								<select style="height:27px;" id ="palletList_searchVal_issue">
									<option value = "all">${i18n.t('search.all')}<!-- All --></option> 
									<option value = "Y">${i18n.t('search.issued')}<!-- Issued --></option> 
									<option value = "N">${i18n.t('search.notIssued')}<!-- Not Issued --></option> 
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnPalletListSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnPalletListSearchInit">${i18n.t('btn.clear')}</button>
						</div>
					</div>
					
					<!-- 탭 -->
					<div class="tab-container">
						<div class="tab">목록</div>
					</div>
					
					<!-- 테이블 -->
					<div class="table-container">
						<div class="table-info">
							<span>${i18n.t('table.info.total')} <strong id="palletListTotalCount">${totalPalletListCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="palletListCurrentPageInfo">${currentPalletListPage}</strong>/<strong id="palletListTotalPageInfo">${totalPalletListPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="palletListTotalQty" style="color:#007bff"></span> 
							</span>							
						</div>
						<table class="data-table mPurchase_pallet_list" id="palletListTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}</th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}</th>
									<th class='barcodeVal' data-sort="BARCODE">${i18n.t('search.barcode')}</th>
									<th class='cucodeVal' data-sort="CUSTCODE">${i18n.t('search.cucode')}</th>
									<th class='cnameVal' data-sort="CUSTNAME">${i18n.t('search.cname')}</th>
									<th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
									<th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
									<th class="scanqtyVal" data-sort="BOXCOUNT" data-type="number">${i18n.t('search.boxcount')}<!-- BOX COUNT --></th>
									<th class="statusVal" data-sort="">${i18n.t('table.status')}<!-- STATUS --></th>
									<th class="itemcodeVal">
										<input type='checkbox' class="pallet_printChkAll">
										<button class='btn print-btn' onclick='palletAll()'>${i18n.t('btn.issue.all')}<!-- Print All --></button>
									</th>
									<th class="itemcodeVal">
										<input type='checkbox' class="pallet_deleteChkAll">
										<button class='btn del-btn' onclick='fnAllDel()'>${i18n.t('btn.delete')}<!-- Delete --></button>
									</th>
								</tr>
							</thead>
							<tbody id="palletListDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="palletListPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="palletList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="palletList_itemsPerPage" class="items-per-page-select">
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

		const { fromDate, toDate } = getDefaultDateRange();
		$("#palletList_searchVal_toDate").val(toDate);
		$("#palletList_searchVal_fromDate").val(fromDate);
		$("#palletList_itemsPerPage").val(palletListItemsPerPage);

		renderPalletListTableData();
		renderPalletListPagination();
		bindPalletListEvents();
		updatePalletListTotalCount();
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

	function updatePalletListTotalCount() {
		$(".palletListTotalQty").text(Number(totalQty).toLocaleString());
		$('#palletListTotalCount').text(Number(totalPalletListCount).toLocaleString());
		$('#palletListCurrentPageInfo').text(currentPalletListPage);
		$('#palletListTotalPageInfo').text(totalPalletListPages);
	}

	function renderPalletListTableData() {
		let tableBody = "";

		for (let i = 0; i < globalPalletListData.length; i++) {
			let rowNumber = (currentPalletListPage - 1) * palletListItemsPerPage + i + 1;
			let data = globalPalletListData[i];

			let print = '';
			let issued = '';
			if (data.PRINTYN === 'Y') {
				print = `<button class='btn reprint-btn' onclick="pprint('${data.PBARCODE}',${data.QTY})">${i18n.t('btn.reIssue')}</button>`;
				issued = `<td class="statusVal" style="color:green;">${i18n.t('search.issued')}</td>`;
			} else {
				print = `<button class='btn print-btn' onclick="pprint('${data.PBARCODE}',${data.QTY})">${i18n.t('btn.issue')}</button>`;
				issued = `<td class="statusVal" style="color:red;">${i18n.t('search.notIssued')}</td>`;
			}

			tableBody += `
				<tr>
					<td class='noVal'>${rowNumber}</td>
					<td class='dateVal'>${data.SDATE || ''}</td>
					<td class='barcodeVal'>${data.PBARCODE || ''}</td>
					<td class='cucodeVal'>${data.CUSTCODE || ''}</td>
					<td class='cnameVal'>${data.CUSTNAME || ''}</td>
					<td class='itemcodeVal'>${data.ITEMCODE || ''}</td>
					<td class='qtyVal'>${Number(data.QTY || 0).toLocaleString()}</td>
					<td class='scanqtyVal'>${Number(data.BOXCOUNT || 0).toLocaleString()}</td>
					${issued}
					<td class="itemcodeVal">
						<input type='checkbox' class='print-check pallet_printChkRow' data-print="${data.PBARCODE}">
						${print}
					</td>
					<td class="itemcodeVal">
						<input type='checkbox' class='chkbox pallet_deleteChkRow' data-chkbar="${data.PBARCODE}">
						<button class='btn del-btn' onclick="fnDel('${data.PBARCODE}')">${i18n.t('btn.delete')}<!-- Delete --></button>
					</td>
				</tr>
			`;
		}

		$("#palletListDetailTableBody").html(tableBody);
		$('.pallet_printChkAll').prop('checked', false);
		$('.pallet_deleteChkAll').prop('checked', false);
	}

	function renderPalletListPagination() {
		let paginationHtml = "";

		if (currentPalletListPage > 1) {
			paginationHtml += `<button class="palletList-page-btn" data-page="${currentPalletListPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="palletList-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentPalletListPage - 5);
		let endPage = Math.min(totalPalletListPages, currentPalletListPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="palletList-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentPalletListPage) {
				paginationHtml += `<button class="palletList-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="palletList-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalPalletListPages) {
			if (endPage < totalPalletListPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="palletList-page-btn" data-page="${totalPalletListPages}">${totalPalletListPages}</button>`;
		}

		if (currentPalletListPage < totalPalletListPages) {
			paginationHtml += `<button class="palletList-page-btn" data-page="${currentPalletListPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="palletList-page-btn disabled">&gt;</button>`;
		}

		$("#palletListPaginationContainer").html(paginationHtml);
	}

	function bindPalletListEvents() {
		$(document).off('change', '.incoming_chkAll').on('change', '.incoming_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.incoming_chk').prop('checked', isChecked);
		});

		$(".btnPalletListSearch").off('click').on('click', function() {
			performPalletListSearch();
		});

		$(".btnPalletListSearchInit").off('click').on('click', function() {
			resetPalletListSearch();
		});

		$('#palletList_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changePalletListItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.palletList-page-btn').on('click', '.palletList-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentPalletListPage = page;
					applyClientPagination();
					renderPalletListTableData();
					renderPalletListPagination();
					updatePalletListTotalCount();
				}
			}
		});

		$('#palletListTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_pallet_list input[type="text"], #view_mPurchase_pallet_list input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performPalletListSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#palletList_searchVal_fromDate").val(),
			toDate: $("#palletList_searchVal_toDate").val(),
			barcode: $("#palletList_searchVal_barcode").val().trim().toUpperCase(),
			custcode: $("#palletList_searchVal_custcode").val().trim().toUpperCase(),
			custname: $("#palletList_searchVal_custname").val().trim().toUpperCase(),
			itemcode: $("#palletList_searchVal_itemcode").val().trim().toUpperCase(),
			issue: $("#palletList_searchVal_issue").val()
		};
	}

	function performPalletListSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentPalletListPage = 1;
		performPalletListDBSearch(searchCriteria);
	}

	function resetPalletListSearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		$("#palletList_searchVal_fromDate").val(fromDate);
		$("#palletList_searchVal_toDate").val(toDate);
		$("#palletList_searchVal_barcode").val('');
		$("#palletList_searchVal_custcode").val('');
		$("#palletList_searchVal_custname").val('');
		$("#palletList_searchVal_itemcode").val('');
		$("#palletList_searchVal_issue").val('all');

		currentPalletListPage = 1;
		performPalletListDBSearch({ fromDate, toDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changePalletListItemsPerPage = function(newItemsPerPage) {
		palletListItemsPerPage = newItemsPerPage;
		currentPalletListPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderPalletListTableData();
		renderPalletListPagination();
		updatePalletListTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportPalletListData = function() {
		return {
			total: filteredData_palletList.length,
			currentPage: currentPalletListPage,
			itemsPerPage: palletListItemsPerPage,
			data: filteredData_palletList
		};
	}

	window.pprint = function(pbarcode, qty) {
		$.ajax({
			type: "post",
			url: "pprint_yn_up",
			dataType: "html",
			data: {
				pbarcode: pbarcode
			},
		}).done(function(data) {});
		window.open("pallet_label_A3_print?pbarcode=" + pbarcode + "&qty=" + qty + "#zoom=33", "Report Print", 'height=500, width=600');
	}

	window.palletAll = function() {
		const palletList = [];

		$('.print-check:checked').each(function() {
			const val = $(this).data('print');
			if (val) palletList.push(val);
		});

		if (palletList.length === 0) {
			alert("출력할 항목을 선택하세요.");
			return;
		}

		console.log("barcodelist : " + palletList);

		$.ajax({
			type: "post",
			url: "pprint_yn_up",
			traditional: true,
			data: { pbarcode: palletList.join(";") },
			dataType: "json"
		}).done(function(data) {
			window.open("pallet_label_A3_print?pbarcode=" + palletList.join(";") + "&qty=" + 0 + "#zoom=33", "Report Print", 'height=500, width=600');
		});
	}

	window.fnDel = function(barcode) {
		if (confirm("Are you sure you want to delete?")) {
			$.ajax({
				type: "get",
				url: "pallet_del",
				dataType: "html",
				data: {
					pbarcode: barcode
				},
				error: function(xhr, status, error) {
					window.handleAjaxError(xhr, status, error);
				}
			}).done(function(data) {
				call_mPurchase_pallet_list(); // ✅ 2번 함수명으로 변경
			});
		} else {
			return false;
		}
	}

	window.fnAllDel = function() {
		var cnt = $("input[class='chkbox']:checked").length;

		if (cnt == 0) {
			alert("No history selected.");
			return false;
		}

		if (confirm("Are you sure you want to delete " + cnt + " records?")) {
			var checkArr = [];

			$("input[class='chkbox']:checked").each(function() {
				checkArr.push($(this).attr("data-chkBar"));
			});

			$.ajax({
				type: "get",
				url: "pallet_delAll",
				dataType: "html",
				data: {
					delList: checkArr
				}
			}).done(function(data) {
				call_mPurchase_pallet_list(); // ✅ 2번 함수명으로 변경
			});
		} else {
			return false;
		}
	}

});


$(document).on("click", ".pallet_printChkAll", function() {
	var isChecked = $(this).prop('checked');
	$('.pallet_printChkRow').prop('checked', isChecked);
});

$(document).on("click", ".pallet_printChkRow", function() {
	var totalRows = $('.pallet_printChkRow').length;
	var checkedRows = $('.pallet_printChkRow:checked').length;
	$('.pallet_printChkAll').prop('checked', totalRows === checkedRows);
});

$(document).on("click", ".pallet_deleteChkAll", function() {
	var isChecked = $(this).prop('checked');
	$('.pallet_deleteChkRow').prop('checked', isChecked);
});

$(document).on("click", ".pallet_deleteChkRow", function() {
	var totalRows = $('.pallet_deleteChkRow').length;
	var checkedRows = $('.pallet_deleteChkRow:checked').length;
	$('.pallet_deleteChkAll').prop('checked', totalRows === checkedRows);
});