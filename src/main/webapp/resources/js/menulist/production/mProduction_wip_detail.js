/* --------------------------------------------------------------
 * 📌 불출 - 불출조회 - Detail (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */

let globalProductionWipDetailData = []; // 현재 조회된 데이터 저장
let currentProductionWipDetailPage = 1; // 현재 페이지
let productionWipDetailItemsPerPage = 1000; // 페이지당 항목 수
let totalProductionWipDetailCount = 0; // 서버에서 받은 총 개수 저장
let totalProductionWipDetailQty = 0; // 서버에서 받은 총 수량 저장
let totalProductionWipDetailPages = 0; // 서버에서 받은 총 페이지
window.filteredProductionWipDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
window.productionWipDetailColumns = [
	{ key: 'INTF_YN', header: 'Status' },
	{ key: 'WMS_KEY', header: 'Ifno' },
	{ key: 'INDATE', header: 'Date' },
	{ key: 'FACTORY', header: 'Factory' },
	{ key: 'STORAGE', header: 'Storage' },
	{ key: 'WCCODE', header: 'Wccode' },
	{ key: 'CAR', header: 'Car' },
	{ key: 'ITEMCODE', header: 'Itemcode' },
	{ key: 'ITEMNAME', header: 'Itemname' },
	{ key: 'QTY', header: 'Qty' },
	{ key: 'ROOMCODE', header: 'Location' },
	{ key: 'LOGINID', header: 'User' },
	{ key: 'HHMM', header: 'Time' },
	{ key: 'BARCODE', header: 'Barcode' },
];

$(document).ready(function() {
	// 메인 호출 함수 - 초기 로딩 시에는 날짜, 공장으로 조회
	window.call_mProduction_wip_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performProductionWipDetailDBSearch({ fromDate, toDate, factory });
	}
});

//DB에서 데이터 조회하는 함수
function performProductionWipDetailDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_productionWipDetail",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentProductionWipDetailPage,
			itemsPerPage: productionWipDetailItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalProductionWipDetailData = data.records || data || [];
			totalProductionWipDetailCount = data.totalCount || 0;
			totalProductionWipDetailQty = data.totalQty || 0;
			totalProductionWipDetailPages = data.totalPages || 0;
			currentProductionWipDetailPage = data.currentPage || currentProductionWipDetailPage;
			window.filteredProductionWipDetailData = globalProductionWipDetailData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mProduction_wip_detail').length) {
				renderProductionWipDetailView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderProductionWipDetailTableData();
				renderProductionWipDetailPagination();
				updateProductionWipDetailTotalCount();
				updateProductionWipDetailTotalQty();
			}

			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("DB 조회 실패:", error);
			console.error("Response:", xhr.responseText);
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

// 사용자 뷰 렌더링 함수
function renderProductionWipDetailView() {
	let btnAreaHtml = "";
	let nohtml = "";
	let loginid = $(".loginId").text().trim().toLowerCase();
	if (loginid  == "wms" ||loginid =="master") {
        btnAreaHtml = `
            <div class="btnInterfaceCommon btnWipSummaryItemsArea" style="margin-left:24px;">
                <input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfProductionWipDetail"/>
                <input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfProductionWipDetailDelete"/>
            </div>
        `;
		nohtml = `
		<th class = "checkboxVal">
			<input type="checkbox" class="productionWipDetail_chkAll">
		</th>
		<th class = 'noVal'>${i18n.t('table.no')}<!-- No --></th>
		<th class = "statusVal">${i18n.t('table.status')}<!-- STATUS --></th>
		<th class = 'intfVal'>${i18n.t('table.ifno')}<!-- 인터페이스 --></th>
		`
    }else{
		nohtml = `<th class = 'noVal'>${i18n.t('table.no')}<!-- No --></th>`
	}
	let content_output = `
		<div class="divBlockControl" id="view_mProduction_wip_detail">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row m3_2_3">
						<div class="search-label">
							<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
							<input type="date" id="productionWipDetail_searchVal_fromDate" /> 
						</div>
						<div class="search-label">
							<div class="searchVal_toDate">　</div>
							<input type="date" id="productionWipDetail_searchVal_toDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
							<select id="productionWipDetail_searchVal_factory" class="factory-select">
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
							<select id="productionWipDetail_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_wccode">${i18n.t('search.wccode')}<!-- WCCODE --></div>
							<select id="productionWipDetail_searchVal_wccode" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<!-- <div class="search-label">
							<div class="searchVal_barcode">${i18n.t('search.barcode')}BARCODE </div>
							<input type="text" id="productionWipDetail_searchVal_barcode" />
						</div>-->
						<div class="search-label">
							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
							<input type="text" id="productionWipDetail_searchVal_car" />
						</div>
						<div class="search-label">
							<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEM CODE --></div>
							<input type="text" id="productionWipDetail_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEM NAME --></div>
							<input type="text" id="productionWipDetail_searchVal_itemname" />
						</div>
						<!-- <div class="search-label">
							<div class="searchVal_roomcode">${i18n.t('search.location')}LOCATION</div>
							<input type="text" id="productionWipDetail_searchVal_roomcode" />
						</div>-->
					</div>
					<div class="search_button_area">
						<button class="btn btn-primary btnProductionWipDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
						<button class="btn btn-secondary btnProductionWipDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
					</div>
				</div>
				
				<!-- 탭 -->
				<div class="tab-container">
					<div class="tab">목록</div>
				</div>
				
				<!-- 테이블 -->
				<div class="table-container">
					<div class="action-buttons">
						<button class="btn btn-success">신규 등록</button>
						<button class="btn btn-primary">수정</button>
						<button class="btn btn-secondary">삭제</button>
						<button class="btn btn-secondary" onclick="downloadAllProductionWipDetailData()">엑셀 다운로드</button>
					</div>
					
					<div class="table-info">
						<span>${i18n.t('table.info.total')} <strong id="productionWipDetailTotalCount">0</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="productionWipDetailCurrentPageInfo">1</strong>/<strong id="productionWipDetailTotalPageInfo">1</strong> |
							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="productionWipDetailTotalQty" style="color:#007bff">0</span>
						</span>
						<div class="action-buttons-right m3_2_3">
							<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnProductionWipDelete"/>
							<button class="btn btn-success" id="productionWipDetailExcelBtn" onclick="downloadAllProductionWipDetailData()">Excel</button>
						</div>
						${btnAreaHtml}   <!-- 조건부 버튼 영역 -->
					</div>
					
					<table class="data-table mProduction_wip_detail">
						<thead>
							<tr>
								${nohtml}		
								<th class = 'dateVal'>${i18n.t('search.date')}<!-- INDATE --></th>
								<th class = 'factoryVal'>${i18n.t('search.factory')}<!-- FACTORY --></th>
								<th class = 'storageVal'>${i18n.t('search.storage')}<!-- STORAGE --></th>									
								<th class = 'wccodeVal'>${i18n.t('search.wccode')}<!-- WCCODE --></th>
								<th class = 'carVal'>${i18n.t('search.car')}<!-- CAR --></th>
								<th class = 'itemcodeVal'>${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
								<th class = 'itemnameVal'>${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
								<th class = 'qtyVal'>${i18n.t('search.qty')}<!-- QTY --></th>
								<th class = 'locationVal'>${i18n.t('search.location')}<!-- LOCATION --></th>
								<th class = 'userVal'>${i18n.t('search.user')}<!-- USER --></th>
								<th class = 'hhmmVal'>${i18n.t('table.time')}<!-- HHMM --></th>
								<th class = 'barcodeVal'>${i18n.t('search.barcode')}<!-- BARCODE --></th>
							</tr>
						</thead>
						<tbody id="productionWipDetailTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="productionWipDetailPaginationContainer">
					</div>
				</div>
			</div>
		</div>
	`;

	/*
		<div class="search-label">
							<div class="search_workMoveCondition">${i18n.t('search.input.status')}<!-- 불출상태 --></div>
							<select id="productionWipDetail_searchVal_workMoveCondition" >
								<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
								<option value="N">${i18n.t('search.input.waiting')}<!-- 불출 대기중 --></option>
								<option value="Y">${i18n.t('search.input.completed')}<!-- 불출 완료 --></option>
							</select>
						</div>
	
		<th><input type="checkbox" id="checkAll" /></th>
		<th>${i18n.t('table.status')}<!-- STATUS --></th>
		
		
		<button class="btn btn-success" id="wipBtn" disabled>${i18n.t('btn.workMove.release')}<!-- 불출 등록 --></button>
		<button class="btn btn-warning" id="wipCancelBtn" disabled>${i18n.t('btn.workMove.cancel')}<!-- 불출 취소 --></button>
		
		<td><input type="checkbox" class="workMove_chkRow intf_${globalProductionWipDetailData[i].intf_yn}" data-global-index="${globalIndex}" data-filtered-index="${i}" data-chk-wipbar="${globalProductionWipDetailData[i].barcode || ''}" data-chk-meskey="${globalProductionWipDetailData[i].meskey || ''}"/></td>
		
		<td><span class="status-badge ${workMoveStatus === i18n.t('search.input.completed') ? 'status-complete' : 'status-waiting'}">${workMoveStatus}</span></td>
	*/

	$(".w_contentArea").append(content_output);

	// 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#productionWipDetail_searchVal_fromDate").val(fromDate);
		$("#productionWipDetail_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderProductionWipDetailTableData();
	// 페이지네이션 렌더링
	renderProductionWipDetailPagination();
	// 이벤트 바인딩
	bindProductionWipDetailEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateProductionWipDetailTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateProductionWipDetailTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#productionWipDetail_searchVal_factory');
	const storage = $('#productionWipDetail_searchVal_storage');
	const wccode = $('#productionWipDetail_searchVal_wccode');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'all'],
			'PUEBLA': ['Material', 'PRODUCT', 'all'],
			'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'all']
		};

		const storageList = options[factoryValue] || options[''];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage.append(`<option value="${item}">${text}</option>`);
		});

		storage.val(storageList[0]);
	}

	// 공장별 작업장 옵션 설정
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

		// 첫 번째 옵션 선택 (Material)
		wccode.val(wccodeList[0]);
	}

	// 저장된 공장 선택
	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
		factory.val(savedFactory);
	}

	updateStorageOptions(savedFactory || '');
	updateWccodeOptions(savedFactory || '');

	// 공장 변경 시 창고 업데이트
	factory.on('change', function() {
		updateStorageOptions($(this).val());
		updateWccodeOptions($(this).val());
	});
}

// 정규식으로 쿠키 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}

// 총 개수를 업데이트하는 함수
function updateProductionWipDetailTotalCount() {
	$('#productionWipDetailTotalCount').text(totalProductionWipDetailCount.toLocaleString());
	$('#productionWipDetailCurrentPageInfo').text(currentProductionWipDetailPage);
}

// 총 수량을 업데이트하는 함수
function updateProductionWipDetailTotalQty() {
	$('.productionWipDetailTotalQty').text(totalProductionWipDetailQty.toLocaleString());
}

// 불출상태 판단 함수
function getWipStatus(item) {
	if (item.intf_yn === 'Y' || item.INTF_YN === 'Y' || item.confirm_yn === 'Y' || item.CONFIRM_YN === 'Y') {
		return i18n.t('search.input.completed');
	} else {
		return i18n.t('search.input.waiting');
	}
}

function renderProductionWipDetailTableData() {
	let tableBody = "";

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalProductionWipDetailData.length; i++) {
		console.log("ddddd" + globalProductionWipDetailData[i].intf_yn);
		
		let rowNumber = (currentProductionWipDetailPage - 1) * productionWipDetailItemsPerPage + i + 1;
		let un = globalProductionWipDetailData[i]
		let statusText = globalProductionWipDetailData[i].intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
				let statusClass = globalProductionWipDetailData[i].intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
		// globalIndex 계산: 전체 데이터에서의 실제 인덱스
		/*let globalIndex = globalProductionWipDetailData.findIndex(item =>
			JSON.stringify(item) === JSON.stringify(globalProductionWipDetailData[i])
		);
		// 만약 찾지 못했다면 현재 인덱스 사용
		if (globalIndex === -1) {
			globalIndex = i;
		}*/

		let workMoveStatus = getWipStatus(globalProductionWipDetailData[i]);

		let barcode = globalProductionWipDetailData[i].barcode || globalProductionWipDetailData[i].BARCODE || ''
		let lot = barcode.split(',')[1];
		let nohtml = '';
		let loginid = $(".loginId").text().trim().toLowerCase();
		if (loginid  == "wms" ||loginid =="master") {
			nohtml = `<td class = "checkboxVal"><input type="checkbox" class="productionWipDetail_chk ${statusClass}" 
		            		data-unique="${un.indate}_${un.itemcode}_${un.intf_yn}_${un.qty}_${un.factory}_${un.storage}_${un.barcode}_${un.wms_key}"
		            		data-delete="${un.iid}_${un.indate}_${un.factory}_${un.storage}_${un.barcode}"></td>					
			<td class = 'noVal'>${rowNumber}</td>
			<td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
			<td class = "intfVal">${globalProductionWipDetailData[i].wms_key || globalProductionWipDetailData[i].WMS_KEY || ''}</td>`
		}else{
			nohtml = `<td class = 'noVal'>${rowNumber}</td>`
		}
		tableBody += `
			<tr>
				${nohtml}
				<td class = "dateVal">${globalProductionWipDetailData[i].indate || globalProductionWipDetailData[i].INDATE || ''}</td>
				<td class = "factoryVal">${globalProductionWipDetailData[i].factory || globalProductionWipDetailData[i].FACTORY || ''}</td>
				<td class = "storageVal">${globalProductionWipDetailData[i].storage || globalProductionWipDetailData[i].STORAGE || ''}</td>
				<td class = "wccodeVal">${globalProductionWipDetailData[i].wccode || globalProductionWipDetailData[i].WCCODE || ''}</td>
				<td class = "carVal">${globalProductionWipDetailData[i].car || globalProductionWipDetailData[i].CAR || ''}</td>
				<td class = "itemcodeVal">${globalProductionWipDetailData[i].itemcode || globalProductionWipDetailData[i].ITEMCODE || ''}</td>
				<td class = "itemnameVal">${globalProductionWipDetailData[i].itemname || globalProductionWipDetailData[i].ITEMNAME || ''}</td>
				<td class = "qtyVal">${Number((globalProductionWipDetailData[i].qty || globalProductionWipDetailData[i].QTY) || 0).toLocaleString()}</td>
				<td class = "locationVal">${globalProductionWipDetailData[i].roomcode || globalProductionWipDetailData[i].ROOMCODE || ''}</td>
				<td class = "userVal">${globalProductionWipDetailData[i].loginid || globalProductionWipDetailData[i].LOGINID || ''}</td>
				<td class = "hhmmVal">${globalProductionWipDetailData[i].hhmm || globalProductionWipDetailData[i].hhmm || ''}</td>
				<td class = "barcodeVal">
					<input type="hidden" class="iidVal" value="${globalProductionWipDetailData[i].iid || ''}">
					${globalProductionWipDetailData[i].barcode || globalProductionWipDetailData[i].BARCODE || ''}
				</td>
			</tr>
		`;
	}

	$("#productionWipDetailTableBody").html(tableBody);
	$(".productionWipDetail_chkAll").prop("checked", false);


	// 체크박스 상태 업데이트
	updateCheckboxStatus();
}

// 페이지네이션 렌더링
function renderProductionWipDetailPagination() {
	let totalPages = Math.ceil(totalProductionWipDetailCount / productionWipDetailItemsPerPage);
	let paginationHtml = "";

	// 이전 버튼
	if (currentProductionWipDetailPage > 1) {
		paginationHtml += `<button class="productionWipDetail-page-btn" data-page="${currentProductionWipDetailPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="productionWipDetail-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentProductionWipDetailPage - 5);
	let endPage = Math.min(totalPages, currentProductionWipDetailPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="productionWipDetail-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentProductionWipDetailPage) {
			paginationHtml += `<button class="productionWipDetail-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="productionWipDetail-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="productionWipDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentProductionWipDetailPage < totalPages) {
		paginationHtml += `<button class="productionWipDetail-page-btn" data-page="${currentProductionWipDetailPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="productionWipDetail-page-btn disabled">&gt;</button>`;
	}

	$('#productionWipDetailTotalPageInfo').text(totalPages);
	$("#productionWipDetailPaginationContainer").html(paginationHtml);
}

// 체크박스 상태 업데이트 함수
function updateCheckboxStatus() {
	let totalCheckboxes = $('.workMove_chkRow').length;
	let checkedCheckboxes = $('.workMove_chkRow:checked').length;

	// 전체 선택 체크박스 상태 업데이트
	if (checkedCheckboxes === 0) {
		$('#checkAll').prop('indeterminate', false);
		$('#checkAll').prop('checked', false);
	} else if (checkedCheckboxes === totalCheckboxes) {
		$('#checkAll').prop('indeterminate', false);
		$('#checkAll').prop('checked', true);
	} else {
		$('#checkAll').prop('indeterminate', true);
	}

	// 선택된 항목 수 업데이트
	updateSelectedCount();

	// 액션 버튼 상태 업데이트
	updateActionButtonsVisibility();
}

// 선택된 항목 수 업데이트
function updateSelectedCount() {
	let selectedCount = $('.workMove_chkRow:checked').length;
	$('#selectedCount').text(selectedCount);
}

// 액션 버튼 표시/숨김 업데이트
function updateActionButtonsVisibility() {
	const selected = $('.workMove_chkRow:checked');
	const selectedCount = selected.length;

	const $btnRelease = $('#wipBtn');
	const $btnCancel = $('#wipCancelBtn');

	// 선택 없음 → 기본 상태(둘 다 비활성)
	if (selectedCount === 0) {
		$btnRelease.prop('disabled', true);
		$btnCancel.prop('disabled', true);
		return;
	}

	// 선택된 행들의 상태
	let status = null;
	selected.each(function() {
		const s = $(this).closest('tr').find('.status-badge').text().trim();
		status = s;
		return false;
	});

	// 상태에 따른 버튼 제어
	if (status === i18n.t('search.input.waiting')) {
		$btnRelease.prop('disabled', false);
		$btnCancel.prop('disabled', true);
	} else if (status === i18n.t('search.input.completed')) {
		$btnRelease.prop('disabled', true);
		$btnCancel.prop('disabled', false);
	} else {
		$btnRelease.prop('disabled', true);
		$btnCancel.prop('disabled', true);
	}
}

// 이벤트 바인딩
function bindProductionWipDetailEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.productionWipDetail_chkAll').on('change', '.productionWipDetail_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.productionWipDetail_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.productionWipDetail_chk').on('change', '.productionWipDetail_chk', function() {
		let totalCheckboxes = $('.productionWipDetail_chk').length;
		let checkedCheckboxes = $('.productionWipDetail_chk:checked').length;
		$('.productionWipDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});
	// 검색 버튼 클릭
	$(".btnProductionWipDetailSearch").off('click').on('click', function() {
		performProductionWipDetailSearch();
	});

	// 초기화 버튼 클릭
	$(".btnProductionWipDetailSearchInit").off('click').on('click', function() {
		resetProductionWipDetailSearch();
	});

	// 페이지네이션 버튼 클릭
	$(document).off('click', '.productionWipDetail-page-btn').on('click', '.productionWipDetail-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentProductionWipDetailPage = page;
				let searchCriteria = getCurrentSearchCriteria();
				performProductionWipDetailDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_mProduction_wip_detail input[type="text"], #view_mProduction_wip_detail input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performProductionWipDetailSearch();
		}
	});

	// 전체 선택 체크박스 이벤트
	$('#checkAll').off('change').on('change', function() {
		let isChecked = $(this).prop('checked');
		$('.workMove_chkRow').prop('checked', isChecked);
		updateSelectedCount();
		updateActionButtonsVisibility();
	});

	// 개별 체크박스 이벤트
	$(document).off('change', '.workMove_chkRow').on('change', '.workMove_chkRow', function() {
		const isChecked = $(this).prop('checked');
		const $row = $(this).closest('tr');
		const currentStatus = $row.find('.status-badge').text().trim();
		const meskey = $(this).data('chk-meskey');

		if (isChecked) {
			// 상태 충돌 체크
			let alreadyCheckedStatus = null;
			let conflict = false;

			$('.workMove_chkRow:checked').each(function() {
				let status = $(this).closest('tr').find('.status-badge').text().trim();
				if (!alreadyCheckedStatus) {
					alreadyCheckedStatus = status;
				} else if (alreadyCheckedStatus !== status) {
					conflict = true;
					return false;
				}
			});

			if (conflict) {
				alert("불출 상태가 다른 항목은 동시에 선택할 수 없습니다.");
				$(this).prop('checked', false);
				return;
			}
		}

		updateCheckboxStatus();
	});

//	// 불출 등록 버튼 클릭
//	$("#wipBtn").off('click').on('click', function() {
//		if (confirm("Are you sure you want to confirm the release?")) {
//
//			if ($("input.workMove_chkRow:checked").length === 0) {
//				alert("Please select a release item first.");
//				return;
//			} else if ($("input.intf_Y:checked").length > 0) {
//				alert("A confirmed release schedule is selected. Please check it.");
//				return;
//			}
//
//			const wipList = [];
//
//			$("input[class='workMove_chkRow intf_N']:checked").each(function() {
//				let currentTr = $(this).closest('tr');
//				let iid = currentTr.find('.workMove_iidVal').val();
//				let barcode = currentTr.find('.workMove_barcodeVal').text().trim();
//				let factory = currentTr.find('.workMove_factoryVal').text();
//				let storage = currentTr.find('.workMove_storageVal').text();
//				let car = currentTr.find('.workMove_carVal').text();
//				let indate = currentTr.find('.workMove_indateVal').text();
//				let itemcode = currentTr.find('.workMove_itemcodeVal').text();
//				let itemname = currentTr.find('.workMove_itemnameVal').text();
//				let qty = currentTr.find('.workMove_qtyVal').text();
//				let roomcode = currentTr.find('.workMove_roomcodeVal').text();
//				let wccode = currentTr.find('.workMove_wccodeVal').text();
//
//				let wms_key = $(this).data('wmskey');
//
//				let pushList = {
//					iid: iid || ' ',
//					barcode: barcode || ' ',
//					car: car || ' ',
//					indate: indate || ' ',
//					itemcode: itemcode || ' ',
//					itemname: itemname || ' ',
//					qty: qty || ' ',
//					roomcode: roomcode || ' ',
//					wccode: wccode || ' ',
//					ymdhms: ymdhms || ' ',
//					wms_key: wms_key || ' '
//				};
//
//				wipList.push(pushList);
//			});
//
//			if (wipList.length === 0) {
//				alert('선택된 항목이 없습니다.');
//				return;
//			}
//
//			showLoading("insert");
//			$.ajax({
//				type: "post",
//				url: "workMove_confirm",
//				traditional: true,
//				contentType: "application/json; charset=UTF-8",
//				data: JSON.stringify(wipList),
//				success: function(result) {
//					hideLoading();
//					alert("불출등록되었습니다.");
//					// 현재 검색 조건으로 다시 조회
//					let searchCriteria = getCurrentSearchCriteria();
//					performProductionWipDetailDBSearch(searchCriteria);
//				},
//				error: function(request, status, error) {
//					hideLoading();
//					if (request.status == 500) {
//						alert('처리도중 에러가 발생하였습니다.');
//					} else if (request.status == 0) {
//						alert('Wi-Fi 또는 데이터 연결이 없습니다.');
//					} else {
//						console.log("code: " + request.status + ", message: " + request.responseText + ", error: " + error);
//						alert("오류가 발생했습니다: " + error);
//					}
//				}
//			});
//		}
//	});
//
//	// 불출 취소 버튼 클릭
//	$("#wipCancelBtn").off('click').on('click', function() {
//		if (confirm("Are you sure you want to cancel the release?")) {
//
//			if ($("input.workMove_chkRow:checked").length === 0) {
//				alert("Please select a release item first.");
//				return;
//			} else if ($("input.intf_N:checked").length > 0) {
//				alert("Some items are still pending release. Please check.");
//				return;
//			}
//
//			const wipList = [];
//
//			$("input[class='workMove_chkRow intf_Y']:checked").each(function() {
//
//				let currentTr = $(this).closest('tr');
//				let iid = currentTr.find('.workMove_iidVal').val();
//				let barcode = currentTr.find('.workMove_barcodeVal').text().trim();
//				let factory = currentTr.find('.workMove_factoryVal').text();
//				let storage = currentTr.find('.workMove_storageVal').text();
//				let car = currentTr.find('.workMove_carVal').text();
//				let indate = currentTr.find('.workMove_indateVal').text();
//				let itemcode = currentTr.find('.workMove_itemcodeVal').text();
//				let itemname = currentTr.find('.workMove_itemnameVal').text();
//				let qty = currentTr.find('.workMove_qtyVal').text();
//				let roomcode = currentTr.find('.workMove_roomcodeVal').text();
//				let wccode = currentTr.find('.workMove_wccodeVal').text();
//				let wms_key = $(this).data('wmskey');
//
//				console.log(wms_key)
//				let pushList = {
//					iid: iid || ' ',
//					barcode: barcode || ' ',
//					car: car || ' ',
//					indate: indate || ' ',
//					itemcode: itemcode || ' ',
//					itemname: itemname || ' ',
//					qty: qty || ' ',
//					roomcode: roomcode || ' ',
//					wccode: wccode || ' ',
//					wms_key: wms_key || ' ',
//					ymdhms: ymdhms || ' '
//				}
//
//				wipList.push(pushList);
//			});
//
//			if (wipList.length === 0) {
//				alert('선택된 항목이 없습니다.');
//				return;
//			}
//
//			showLoading("insert");
//			$.ajax({
//				type: "post",
//				url: "workMove_confirm_cancel",
//				traditional: true,
//				contentType: "application/json; charset=UTF-8",
//				data: JSON.stringify(wipList),
//				success: function(result) {
//					hideLoading();
//					alert("불출등록이 취소되었습니다.");
//					// 현재 검색 조건으로 다시 조회
//					let searchCriteria = getCurrentSearchCriteria();
//					performProductionWipDetailDBSearch(searchCriteria);
//				},
//				error: function(request, status, error) {
//					hideLoading();
//					if (request.status == 500) {
//						alert('처리도중 에러가 발생하였습니다.');
//					} else if (request.status == 0) {
//						alert('Wi-Fi 또는 데이터 연결이 없습니다.');
//					} else {
//						console.log("code: " + request.status + ", message: " + request.responseText + ", error: " + error);
//						alert("오류가 발생했습니다: " + error);
//					}
//				}
//			});
//		}
//	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		workMoveCondition: $("#productionWipDetail_searchVal_workMoveCondition").val(),
		fromDate: $("#productionWipDetail_searchVal_fromDate").val(),
		toDate: $("#productionWipDetail_searchVal_toDate").val(),
		factory: $("#productionWipDetail_searchVal_factory").val(),
		storage: $("#productionWipDetail_searchVal_storage").val(),
		wccode: $("#productionWipDetail_searchVal_wccode").val(),
		/*barcode: $("#productionWipDetail_searchVal_barcode").val().trim().toUpperCase(),*/
		car: $("#productionWipDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionWipDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionWipDetail_searchVal_itemname").val().trim().toUpperCase(),
		/*roomcode: $("#productionWipDetail_searchVal_roomcode").val().trim().toUpperCase()*/
	};
}

// 검색 수행 함수 - DB 조회
function performProductionWipDetailSearch() {
	let searchCriteria = getCurrentSearchCriteria();
	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentProductionWipDetailPage = 1;
	performProductionWipDetailDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetProductionWipDetailSearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const factory = getCookie('selectedFactory');

	$("#productionWipDetail_searchVal_workMoveCondition").val('');
	$("#productionWipDetail_searchVal_fromDate").val(fromDate);
	$("#productionWipDetail_searchVal_toDate").val(toDate);
	/*$("#productionWipDetail_searchVal_barcode").val('');*/
	$("#productionWipDetail_searchVal_car").val('');
	$("#productionWipDetail_searchVal_itemcode").val('');
	$("#productionWipDetail_searchVal_itemname").val('');
	/*$("#productionWipDetail_searchVal_roomcode").val('');*/

	// 공장, 창고, 작업장 초기화
	renderFactoryStorage();

	// 초기화 후 전체 데이터 다시 조회
	currentProductionWipDetailPage = 1;
	performProductionWipDetailDBSearch({ fromDate, toDate, factory });

	console.log('검색 조건이 초기화되었습니다.');
}

// 유틸리티 함수들
window.changeProductionWipDetailItemsPerPage = function(newItemsPerPage) {
	productionWipDetailItemsPerPage = newItemsPerPage;
	currentProductionWipDetailPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performProductionWipDetailDBSearch(searchCriteria);
}

window.exportProductionWipDetailData = function() {
	return {
		total: globalProductionWipDetailData.length,
		currentPage: currentProductionWipDetailPage,
		itemsPerPage: productionWipDetailItemsPerPage,
		data: globalProductionWipDetailData
	};
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



// 엑셀 다운로드 함수
window.downloadAllProductionWipDetailData = function() {
	let searchCriteria = {
		workMoveCondition: $("#productionWipDetail_searchVal_workMoveCondition").val(),
		fromDate: $("#productionWipDetail_searchVal_fromDate").val(),
		toDate: $("#productionWipDetail_searchVal_toDate").val(),
		factory: $("#productionWipDetail_searchVal_factory").val(),
		storage: $("#productionWipDetail_searchVal_storage").val(),
		wccode: $("#productionWipDetail_searchVal_wccode").val(),
		/*barcode: $("#productionWipDetail_searchVal_barcode").val().trim().toUpperCase(),*/
		car: $("#productionWipDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionWipDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionWipDetail_searchVal_itemname").val().trim().toUpperCase(),
		/*roomcode: $("#productionWipDetail_searchVal_roomcode").val().trim().toUpperCase()*/
	};

	showLoading("export");

	$.ajax({
		url: "/read_productionWipDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data);
			ExcelExporter.downloadExcel(data, window.productionWipDetailColumns, {
				fileName: 'ProductionWipDetail_All',
				sheetName: 'ProductionWipDetail'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

//삭제
$(document).on("click", ".btnProductionWipDelete", function() {	
	if ($(".productionWipDetail_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items.delete'));
		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
		return;
	}
	
	if (!confirm(i18n.t('confirmation.items.delete'))) {
		return;
	}
	
	const iidList = [];
	$(".productionWipDetail_chk:checked").each(function() {
		let iid = $(this).data('delete');
		iidList.push(iid);
	});
	
	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}
	
	showLoading("data");

	const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
	
	console.log(iidList)
	$.ajax({
		url: "/deleteWip",
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
                        } else if (item.failReason === 'WORKMOVE AND OUTBOUND'){
                        	message += `- WIP And Location Time Different\n${item.barcode}\n`; 
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
			performProductionWipDetailDBSearch(searchVal);	
			
			// 전체 선택 해제
			$('.productionWipDetail_chkAll').prop('checked', false);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});
});

$(document).on("click", ".btnIntfProductionWipDetail", function() {

	if ($(".productionWipDetail_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	const iidList = [];
	$(".productionWipDetail_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	showLoading("data");

	console.log(iidList)
	$.ajax({
		url: "/workmove_confirm_summary",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performProductionWipDetailDBSearch(searchVal);
			
			// 전체 선택 해제
			$('.productionWipDetail_chkAll').prop('checked', false);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

});

$(document).on("click", ".btnIntfProductionWipDetailDelete", function() {

	if ($(".productionWipDetail_chk.status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}


	const iidList = [];
	$(".productionWipDetail_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	showLoading("data");

	console.log(iidList)
	$.ajax({
		url: "/workMove_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performProductionWipDetailDBSearch(searchVal);
			
			// 전체 선택 해제
			$('.productionWipDetail_chkAll').prop('checked', false);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

});