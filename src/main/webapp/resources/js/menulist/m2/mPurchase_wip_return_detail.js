/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_wipReturnDetail = [];
let globalWipReturnDetailData = [];
let currentWipReturnDetailPage = 1;
let wipReturnDetailItemsPerPage = 100;
let totalWipReturnDetailCount = 0;
let totalWipReturnDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredWipReturnDetailData = [];
	window.wipReturnDetailColumns = [
		{ key: 'INTF_YN', header: 'Status' },
		{ key: 'INDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'ROOMCODE', header: 'Location' },
		{ key: 'WCCODE', header: 'Wccode' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'HHMM', header: 'Time' },
		{ key: 'BARCODE', header: 'Barcode' },
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_wip_return_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		performWipReturnDetailDBSearch({ factory, toDate, fromDate });
	}

});
// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
function performWipReturnDetailDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_wipReturnDetail",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log("-- DB 조회 결과 (전체) --");
			console.log(response);

			// 서버에서 받은 전체 데이터 저장
			allServerData = response.records || [];
			filteredData_wipReturnDetail = [...allServerData];
			totalQty = response.totalQty || 0;

			// 페이지 초기화
			currentWipReturnDetailPage = 1;
			currentSortColumn = null;
			currentSortOrder = 'asc';

			// 클라이언트에서 페이징 처리
			applyClientPagination();

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mPurchase_wip_return_detail').length) {
				renderWipReturnDetailView();
			} else {
				renderWipReturnDetailTableData();
				renderWipReturnDetailPagination();
				updateWipReturnDetailTotalCount();
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
	wipReturnDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

	totalWipReturnDetailCount = filteredData_wipReturnDetail.length;
	totalWipReturnDetailPages = Math.ceil(totalWipReturnDetailCount / wipReturnDetailItemsPerPage);

	const startIndex = (currentWipReturnDetailPage - 1) * wipReturnDetailItemsPerPage;
	const endIndex = startIndex + wipReturnDetailItemsPerPage;

	globalWipReturnDetailData = filteredData_wipReturnDetail.slice(startIndex, endIndex);
	window.filteredWipReturnDetailData = globalWipReturnDetailData;
}

// 클라이언트에서 정렬 처리
function applyClientSort(column, dataType) {
	if (currentSortColumn === column) {
		currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
	} else {
		currentSortColumn = column;
		currentSortOrder = 'asc';
	}

	filteredData_wipReturnDetail.sort((a, b) => {
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

	currentWipReturnDetailPage = 1;
	applyClientPagination();

	renderWipReturnDetailTableData();
	renderWipReturnDetailPagination();
	updateWipReturnDetailTotalCount();

	updateSortIndicators(column);
}

// 헤더에 정렬 방향 표시
function updateSortIndicators(column) {
	$('.data-table thead th').removeClass('sort-asc sort-desc');
	$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
}

// 사용자 뷰 렌더링 함수
function renderWipReturnDetailView() {
	let loginid = $(".loginId").text().trim().toLowerCase();

	let btnHtml = "";
	if (loginid == "wms") {
		btnHtml = `
            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminWipReturnDelete"/>
        `;
	}
	
	let content_output = `
			<div class="divBlockControl" id="view_mPurchase_wip_return_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row mPurchase_wip_detail">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="wipReturnDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="wipReturnDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="wipReturnDetail_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="wipReturnDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_wccode">${i18n.t('search.wccode')}<!-- WCCODE --></div>
								<select id="wipReturnDetail_searchVal_wccode" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="wipReturnDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEM CODE --></div>
								<input type="text" id="wipReturnDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEM NAME --></div>
								<input type="text" id="wipReturnDetail_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnWipReturnDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnWipReturnDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="wipReturnDetailTotalCount">${totalWipReturnDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="wipReturnDetailCurrentPageInfo">${currentWipReturnDetailPage}</strong>/<strong id="wipReturnDetailTotalPageInfo">${totalWipReturnDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="wipReturnDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_wip_return_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnWipReturnDetailDelete"/>
									<button class="btn btn-success" id="wipReturnDetailExcelBtn" onclick="downloadAllWipReturnDetailData()">Excel</button>
								</div>
							</div>								
							<div class="btnIntfCommon btnWipReturnDetailItemsArea">
								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfWipReturnDetail"/>
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfWipReturnDetailCancel"/>
							</div>
						</div>
						<table class="data-table mPurchase_wip_return_detail" id="wipReturnDetailTable">
							<thead>
								<tr>
							        <th class="checkboxVal">
										<input type="checkbox" class="wipReturnDetail_chkAll">
									</th>	
									<th class="noVal">${i18n.t('table.no')}</th>
									<th class="statusVal" data-sort="STATUS">${i18n.t('table.status')}</th>
							        <th class='dateVal' data-sort="INDATE" data-type="date">${i18n.t('search.date')}</th>
							        <th class='factoryVal' data-sort="FACTORY">${i18n.t('search.factory')}</th>
							        <th class='storageVal' data-sort="STORAGE">${i18n.t('search.storage')}</th>
							        <th class='carVal' data-sort="CAR">${i18n.t('search.car')}</th>
							        <th class='itemcodeVal' data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
							        <th class='itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
							        <th class='qtyVal' data-sort="QTY" data-type="number">${i18n.t('search.qty')}</th>
							        <th class='locationVal' data-sort="ROOMCODE">${i18n.t('search.location')}</th>
									<th class="wccodeVal" data-sort="WCCODE">${i18n.t('search.wccode')}</th>
							        <th class='loginidVal' data-sort="LOGINID">${i18n.t('search.user')}</th>
							        <th class='hhmmVal' data-sort="HHMM">${i18n.t('table.time')}</th>
							        <th class='barcodeVal' data-sort="BARCODE">${i18n.t('search.barcode')}</th>
							    </tr>
							</thead>
							<tbody id="wipReturnDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="wipReturnDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="wipReturnDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="wipReturnDetail_itemsPerPage" class="items-per-page-select">
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

	// 화면에 기본 날짜 세팅
	const { fromDate, toDate } = getDefaultDateRange();
	$("#wipReturnDetail_searchVal_toDate").val(toDate);
	$("#wipReturnDetail_searchVal_fromDate").val(fromDate);
	$("#wipReturnDetail_itemsPerPage").val(wipReturnDetailItemsPerPage);

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderWipReturnDetailTableData();
	// 페이지네이션 렌더링
	renderWipReturnDetailPagination();
	// 이벤트 바인딩
	bindWipReturnDetailEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateWipReturnDetailTotalCount();
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

// ✅ 수정 필요
function renderFactoryStorage() {
	const factory = $('#wipReturnDetail_searchVal_factory');
	const storage = $('#wipReturnDetail_searchVal_storage');
	const wccode = $('#wipReturnDetail_searchVal_wccode'); // ✅ 추가
	const savedFactory = getCookie('selectedFactory');

	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'P1 W/HOUSE', 'all'],
			'PUEBLA': ['Material', 'PRODUCT', 'all'],
			'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'P1 W/HOUSE', 'all']
		};

		const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		storage.val(storageList[0]);

		window.autoSetStorageFields();
	}

	// ✅ 추가
	function updateWccodeOptions(factoryValue) {
		wccode.empty();

		const options = {
			'SALTILLO': ['H/REST', 'OUTSIDE', 'all'],
			'PUEBLA': ['Workshop', 'all'],
			'': ['H/REST', 'OUTSIDE', 'WORKSHOP', 'all']
		};

		const wccodeList = options[factoryValue] || options[''];

		wccodeList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			wccode.append(`<option value="${item}">${text}</option>`);
		});

		wccode.val(wccodeList[0]);
	}

	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
		factory.val(savedFactory);
	}

	updateStorageOptions(savedFactory || '');
	updateWccodeOptions(savedFactory || ''); // ✅ 추가

	factory.on('change', function() {
		updateStorageOptions($(this).val());
		updateWccodeOptions($(this).val()); // ✅ 추가
	});
	window.autoSetStorageFields();
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

function updateWipReturnDetailTotalCount() {
	$(".wipReturnDetailTotalQty").text(Number(totalQty).toLocaleString());
	$('#wipReturnDetailTotalCount').text(Number(totalWipReturnDetailCount).toLocaleString());
	$('#wipReturnDetailCurrentPageInfo').text(currentWipReturnDetailPage);
	$('#wipReturnDetailTotalPageInfo').text(totalWipReturnDetailPages);
}

function renderWipReturnDetailTableData() {
	let tableBody = "";

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalWipReturnDetailData.length; i++) {
		let rowNumber = (currentWipReturnDetailPage - 1) * wipReturnDetailItemsPerPage + i + 1;
		let data = globalWipReturnDetailData[i];
		let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
		let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';

		tableBody += `
			<tr>				
			    <td class = "checkboxVal"><input type="checkbox" class="wipReturnDetail_chk ${statusClass}" 
	    			data-unique="${data.INDATE}_${data.ITEMCODE}_${data.INTF_YN}_${data.QTY}_${data.FACTORY}_${data.STORAGE}_${data.BARCODE}_${data.WMS_KEY}"
	    			data-delete="${data.IID}_${data.INDATE}_${data.FACTORY}_${data.STORAGE}_${data.BARCODE}">
	    		</td>
			    <td class = "noVal">${rowNumber}</td>
			    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
	            <td class = "dateVal">${data.INDATE || data.indate || ''}</td>
	            <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
				<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
				<td class = "carVal">${data.CAR || data.car || ''}</td>
				<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
				<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
				<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
				<td class = "locationVal">${data.ROOMCODE || data.roomcode || ''}</td>
				<td class = "wccodeVal">${data.WCCODE || data.wccode || ''}</td>
				<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
				<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td>
				<td class = 'barcodeVal'>${data.barcode || data.BARCODE || ''}</td>
			</tr>
		`;
	}

	$("#wipReturnDetailTableBody").html(tableBody);
	$(".wipReturnDetail_chkAll").prop("checked", false);


	// 체크박스 상태 업데이트
	updateCheckboxStatus();
}

function renderWipReturnDetailPagination() {
	let paginationHtml = "";

	if (currentWipReturnDetailPage > 1) {
		paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="${currentWipReturnDetailPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="wipReturnDetail-page-btn disabled">&lt;</button>`;
	}

	let startPage = Math.max(1, currentWipReturnDetailPage - 5);
	let endPage = Math.min(totalWipReturnDetailPages, currentWipReturnDetailPage + 5);

	if (startPage > 1) {
		paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	for (let i = startPage; i <= endPage; i++) {
		if (i === currentWipReturnDetailPage) {
			paginationHtml += `<button class="wipReturnDetail-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	if (endPage < totalWipReturnDetailPages) {
		if (endPage < totalWipReturnDetailPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="${totalWipReturnDetailPages}">${totalWipReturnDetailPages}</button>`;
	}

	if (currentWipReturnDetailPage < totalWipReturnDetailPages) {
		paginationHtml += `<button class="wipReturnDetail-page-btn" data-page="${currentWipReturnDetailPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="wipReturnDetail-page-btn disabled">&gt;</button>`;
	}

	$("#wipReturnDetailPaginationContainer").html(paginationHtml);
}

function bindWipReturnDetailEvents() {
	// ✅ 전체 선택 체크박스 (수정)
	$(document).off('change', '.wipReturnDetail_chkAll').on('change', '.wipReturnDetail_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.wipReturnDetail_chk:not(:disabled)').prop('checked', isChecked);
	});

	// ✅ 개별 체크박스 (추가)
	$(document).off('change', '.wipReturnDetail_chk').on('change', '.wipReturnDetail_chk', function() {
		const totalCheckboxes = $('.wipReturnDetail_chk:not(:disabled)').length;
		const checkedCheckboxes = $('.wipReturnDetail_chk:checked:not(:disabled)').length;
		$('.wipReturnDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});

	$(".btnWipReturnDetailSearch").off('click').on('click', function() {
		performWipReturnDetailSearch();
	});

	$(".btnWipReturnDetailSearchInit").off('click').on('click', function() {
		resetWipReturnDetailSearch();
	});

	$('#wipReturnDetail_itemsPerPage').off('change').on('change', function() {
		const newItemsPerPage = parseInt($(this).val());
		changeWipReturnDetailItemsPerPage(newItemsPerPage);
	});

	$(document).off('click', '.wipReturnDetail-page-btn').on('click', '.wipReturnDetail-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentWipReturnDetailPage = page;
				applyClientPagination();
				renderWipReturnDetailTableData();
				renderWipReturnDetailPagination();
				updateWipReturnDetailTotalCount();
			}
		}
	});

	$('#wipReturnDetailTable thead th[data-sort]').off('click').on('click', function() {
		const column = $(this).data('sort');
		const dataType = $(this).data('type') || 'string';
		applyClientSort(column, dataType);
	});

	$('#view_mPurchase_wip_return_detail input[type="text"], #view_mPurchase_wip_return_detail input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performWipReturnDetailSearch();
		}
	});
}

function getCurrentSearchCriteria() {
	return {
		fromDate: $("#wipReturnDetail_searchVal_fromDate").val(),
		toDate: $("#wipReturnDetail_searchVal_toDate").val(),
		factory: $("#wipReturnDetail_searchVal_factory").val(),
		storage: $("#wipReturnDetail_searchVal_storage").val(),
		car: $("#wipReturnDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#wipReturnDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#wipReturnDetail_searchVal_itemname").val().trim().toUpperCase(),
		wccode: $("#wipReturnDetail_searchVal_wccode").val(),
	};
}

function performWipReturnDetailSearch() {
	let searchCriteria = getCurrentSearchCriteria();
	console.log("검색 조건:", searchCriteria);

	currentWipReturnDetailPage = 1;
	performWipReturnDetailDBSearch(searchCriteria);
}

function resetWipReturnDetailSearch() {
	const factory = getCookie('selectedFactory');
	const { fromDate, toDate } = getDefaultDateRange();

	$("#wipReturnDetail_searchVal_fromDate").val(fromDate);
	$("#wipReturnDetail_searchVal_toDate").val(toDate);
	$("#wipReturnDetail_searchVal_car").val('');
	$("#wipReturnDetail_searchVal_itemcode").val('');
	$("#wipReturnDetail_searchVal_itemname").val('');

	// 공장, 창고, 작업장 초기화
	renderFactoryStorage();

	currentWipReturnDetailPage = 1;
	performWipReturnDetailDBSearch({ factory, storage: 'Material', toDate, fromDate });

	console.log('검색 조건이 초기화되었습니다.');
}


window.changeWipReturnDetailItemsPerPage = function(newItemsPerPage) {
	wipReturnDetailItemsPerPage = newItemsPerPage;
	currentWipReturnDetailPage = 1;

	setCookie('itemsPerPage', newItemsPerPage);

	applyClientPagination();
	renderWipReturnDetailTableData();
	renderWipReturnDetailPagination();
	updateWipReturnDetailTotalCount();

	console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
}

window.exportWipReturnDetailData = function() {
	return {
		total: filteredData_wipReturnDetail.length,
		currentPage: currentWipReturnDetailPage,
		itemsPerPage: wipReturnDetailItemsPerPage,
		data: filteredData_wipReturnDetail
	};
}


// 전체 데이터 엑셀 다운로드
window.downloadAllWipReturnDetailData = function() {
	showLoading("export");

	// ✅ WIP Detail은 데이터 가공 없이 그대로 내보냄
	ExcelExporter.downloadExcel(filteredData_wipReturnDetail, window.wipReturnDetailColumns, {
		fileName: 'wipReturnDetail_All',
		sheetName: 'wipReturnDetail'
	});

	hideLoading();
};

//데이터 삭제
$(document).on("click", ".btnWipReturnDetailDelete", function() {	
	if ($(".wipReturnDetail_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items.delete'));
		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
		return;
	}
	
	const iidList = [];
	$(".wipReturnDetail_chk:checked").each(function() {
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
		url: "/deleteWipReturn",
		type: "POST",
		data: JSON.stringify({
			iidList : iidList,
			loginid : loginid
		}),
		contentType: "application/json",
		success: function(data) {
         if (!data.success) {
             hideLoading();
             
             let message = "";
             
             // 검증 실패
             if (data.failList && data.failList.length > 0){
             	message = "Some items cannot be deleted\n\n"; // 삭제할 수 없는 항목이 있습니다.
                 
                 data.failList.forEach(function(item) {
                 	if (item.failReason === 'INVALID_KIND'){
                 		alert(`Code Error!`);
                 		return;
                 	} else if (item.failReason === 'POST_PROCESSING') {
                         message += `- Post-processing data exists\n${item.barcode}\n`; // 후처리 데이터 존재
                     } else if (item.failReason === 'MAGAM') {
                         message += `- Monthly closing completed\n${item.barcode}\n`; // 월 마감 완료
                     }
                 });
                 
             }
             // 삭제 실패
             else if (data.failReason === 'DELETE_FAILED'){
             	message = "Failed to delete\n\n";
             	message += `Operation: ${data.failedOperation}\n`;
             	message += `Barcode: ${data.failedBarcode}\n\n`;	
             }   
             
             
             alert(message);
             return;
         }
			
			let searchVal = getCurrentSearchCriteria();
			performWipReturnDetailDBSearch(searchVal);	
			
			// 전체 선택 해제
			$('.wipReturnDetail_chkAll').prop('checked', false);
		},
		error: function(xhr, status, error) {
			// ❌ alert(res.message) <- res 없음 (버그)
			window.handleAjaxError(xhr, status, error);
		}
	});
});


//관리자용 삭제
$(document).on("click", ".btnAdminWipReturnDelete", function() {	
	if ($(".wipReturnDetail_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items.delete'));
		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
		return;
	}
	
	const iidList = [];
	$(".wipReturnDetail_chk:checked").each(function() {
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
	
	const reason = prompt("사유를 입력해 주세요");
	
	if (reason === null) return;
	
 if (reason.trim() === "") {
     alert("내용이 비어 있습니다.");
     return;
 }
 
	showLoading("data");

	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
	
	console.log(iidList)
	$.ajax({
		url: "/deleteWipReturn",
		type: "POST",
		data: JSON.stringify({
			iidList: iidList,
			loginid: loginid,
			reason: reason,
			admin: true
		}),
		contentType: "application/json",
		success: function(data) {
			hideLoading();
			if (data.success) {
		        alert("삭제 완료");
		        let searchVal = getCurrentSearchCriteria();
		        performWipReturnDetailDBSearch(searchVal);	
		        
		        // 전체 선택 해제
		        $('.wipReturnDetail_chkAll').prop('checked', false);
			} else {
		        alert("삭제에 실패했습니다.");
		    }			
		},
		error: function(xhr, status, error) {
			console.log("🔥 LOCAL ajax error:", status, error);
			console.log("Response:", xhr.responseText);

			const message = "An error occurred while processing the request.\n\n"
				+ "Details:\n"
				+ (xhr.responseText || error || status || "Unknown error");

			// 🔹 기본 alert 대신 커스텀 모달 사용
			window.showCopyableAlert(message);

			hideLoading();
		}
	});
});

// ✅ 추가 필요
function getWipStatus(item) {
	if (item.intf_yn === 'Y' || item.INTF_YN === 'Y' || item.confirm_yn === 'Y' || item.CONFIRM_YN === 'Y') {
		return i18n.t('search.input.completed');
	} else {
		return i18n.t('search.input.waiting');
	}
}
// ✅ 추가 필요
function updateCheckboxStatus() {
	let totalCheckboxes = $('.wipReturnDetail_chk:not(:disabled)').length;
	let checkedCheckboxes = $('.wipReturnDetail_chk:checked:not(:disabled)').length;

	if (checkedCheckboxes === 0) {
		$('.wipReturnDetail_chkAll').prop('indeterminate', false);
		$('.wipReturnDetail_chkAll').prop('checked', false);
	} else if (checkedCheckboxes === totalCheckboxes) {
		$('.wipReturnDetail_chkAll').prop('indeterminate', false);
		$('.wipReturnDetail_chkAll').prop('checked', true);
	} else {
		$('.wipReturnDetail_chkAll').prop('indeterminate', true);
	}
}

//인터페이스 등록
$(document).on("click", ".btnIntfWipReturnDetail", function() {
	if ($(".wipReturnDetail_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}
	
	const iidList = [];
	$(".wipReturnDetail_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
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

	console.log(iidList)
	$.ajax({
		url: "/wipReturn_confirm_summary",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performWipReturnDetailDBSearch(searchVal);
			
			// 전체 선택 해제
			$('.wipReturnDetail_chkAll').prop('checked', false);
		},
		error: function(xhr, status, error) {
			// ❌ alert(res.message) <- res 없음 (버그)
			window.handleAjaxError(xhr, status, error);
		}
	});

});

//인터페이스 삭제
$(document).on("click", ".btnIntfWipReturnDetailCancel", function() {
	if ($(".wipReturnDetail_chk.status-waiting:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}
	
	const iidList = [];
	$(".wipReturnDetail_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
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

	console.log(iidList)
	$.ajax({
		url: "/wipReturn_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performWipReturnDetailDBSearch(searchVal);
			
			// 전체 선택 해제
			$('.wipReturnDetail_chkAll').prop('checked', false);
		},
		error: function(xhr, status, error) {
			// ❌ alert(res.message) <- res 없음 (버그)
			window.handleAjaxError(xhr, status, error);
		}
	});

});