/* --------------------------------------------------------------
 * 📌 불출 - 불출조회 - Detail (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */

/*let globalWipDetailData = []; // 현재 조회된 데이터 저장
let currentWipDetailPage = 1; // 현재 페이지
let wipDetailItemsPerPage = 1000; // 페이지당 항목 수
let totalWipDetailCount = 0; // 서버에서 받은 총 개수 저장
let totalWipDetailQty = 0; // 서버에서 받은 총 수량 저장
let totalWipDetailPages = 0; // 서버에서 받은 총 페이지
window.filteredWipDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
window.wipDetailColumns = [
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
	window.call_m2_wip_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performWipDetailDBSearch({ fromDate, toDate, factory });
	}
});

//DB에서 데이터 조회하는 함수
function performWipDetailDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_wipDetail",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentWipDetailPage,
			itemsPerPage: wipDetailItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalWipDetailData = data.records || data || [];
			totalWipDetailCount = data.totalCount || 0;
			totalWipDetailQty = data.totalQty || 0;
			totalWipDetailPages = data.totalPages || 0;
			currentWipDetailPage = data.currentPage || currentWipDetailPage;
			window.filteredWipDetailData = globalWipDetailData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_wip_detail').length) {
				renderWipDetailView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderWipDetailTableData();
				renderWipDetailPagination();
				updateWipDetailTotalCount();
				updateWipDetailTotalQty();
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
function renderWipDetailView() {
	let btnAreaHtml = "";
	let nohtml = "";
	let loginid = $(".loginId").text().trim().toLowerCase();
	if (loginid  == "wms" ||loginid =="master") {
        btnAreaHtml = `
            <div class="btnInterfaceCommon btnWipSummaryItemsArea" style="margin-left:24px;">
                <input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfWipDetail"/>
                <input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfWipDetailDelete"/>
            </div>
        `;
		nohtml = `
		<th class = "checkboxVal">
			<input type="checkbox" class="wipDetail_chkAll">
		</th>
		<th class = 'noVal'>${i18n.t('table.no')}<!-- No --></th>
		<th class = "statusVal">${i18n.t('table.status')}<!-- STATUS --></th>
		<th class = 'intfVal'>${i18n.t('table.ifno')}<!-- 인터페이스 --></th>
		`
    }else{
		nohtml = `<th class = 'noVal'>${i18n.t('table.no')}<!-- No --></th>`
	}
	let content_output = `
		<div class="divBlockControl" id="view_m2_wip_detail">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row m2_2_3">
						<div class="search-label">
							<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
							<input type="date" id="wipDetail_searchVal_fromDate" /> 
						</div>
						<div class="search-label">
							<div class="searchVal_toDate">　</div>
							<input type="date" id="wipDetail_searchVal_toDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
							<select id="wipDetail_searchVal_factory" class="factory-select">
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
							<select id="wipDetail_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_wccode">${i18n.t('search.wccode')}<!-- WCCODE --></div>
							<select id="wipDetail_searchVal_wccode" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<!-- <div class="search-label">
							<div class="searchVal_barcode">${i18n.t('search.barcode')}BARCODE </div>
							<input type="text" id="wipDetail_searchVal_barcode" />
						</div>-->
						<div class="search-label">
							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
							<input type="text" id="wipDetail_searchVal_car" />
						</div>
						<div class="search-label">
							<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEM CODE --></div>
							<input type="text" id="wipDetail_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEM NAME --></div>
							<input type="text" id="wipDetail_searchVal_itemname" />
						</div>
						<!-- <div class="search-label">
							<div class="searchVal_roomcode">${i18n.t('search.location')}LOCATION</div>
							<input type="text" id="wipDetail_searchVal_roomcode" />
						</div>-->
					</div>
					<div class="search_button_area">
						<button class="btn btn-primary btnWipDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
						<button class="btn btn-secondary btnWipDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
						<button class="btn btn-secondary" onclick="downloadAllWipDetailData()">엑셀 다운로드</button>
					</div>
					
					<div class="table-info">
						<span>${i18n.t('table.info.total')} <strong id="wipDetailTotalCount">0</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="wipDetailCurrentPageInfo">1</strong>/<strong id="wipDetailTotalPageInfo">1</strong> |
							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="wipDetailTotalQty" style="color:#007bff">0</span>
						</span>
						<div class="action-buttons-right m2_2_3">
							<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnWipDelete"/>
							<button class="btn btn-success" id="wipDetailExcelBtn" onclick="downloadAllWipDetailData()">Excel</button>
						</div>
						${btnAreaHtml}   <!-- 조건부 버튼 영역 -->
					</div>
					
					<table class="data-table m2_wip_detail">
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
						<tbody id="wipDetailTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="wipDetailPaginationContainer">
					</div>
				</div>
			</div>
		</div>
	`;

	/*
		<div class="search-label">
							<div class="search_workMoveCondition">${i18n.t('search.input.status')}<!-- 불출상태 --></div>
							<select id="wipDetail_searchVal_workMoveCondition" >
								<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
								<option value="N">${i18n.t('search.input.waiting')}<!-- 불출 대기중 --></option>
								<option value="Y">${i18n.t('search.input.completed')}<!-- 불출 완료 --></option>
							</select>
						</div>
	
		<th><input type="checkbox" id="checkAll" /></th>
		<th>${i18n.t('table.status')}<!-- STATUS --></th>
		
		
		<button class="btn btn-success" id="wipBtn" disabled>${i18n.t('btn.workMove.release')}<!-- 불출 등록 --></button>
		<button class="btn btn-warning" id="wipCancelBtn" disabled>${i18n.t('btn.workMove.cancel')}<!-- 불출 취소 --></button>
		
		<td><input type="checkbox" class="workMove_chkRow intf_${globalWipDetailData[i].intf_yn}" data-global-index="${globalIndex}" data-filtered-index="${i}" data-chk-wipbar="${globalWipDetailData[i].barcode || ''}" data-chk-meskey="${globalWipDetailData[i].meskey || ''}"/></td>
		
		<td><span class="status-badge ${workMoveStatus === i18n.t('search.input.completed') ? 'status-complete' : 'status-waiting'}">${workMoveStatus}</span></td>
	*/

	/*$(".w_contentArea").append(content_output);

	// 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#wipDetail_searchVal_fromDate").val(fromDate);
		$("#wipDetail_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderWipDetailTableData();
	// 페이지네이션 렌더링
	renderWipDetailPagination();
	// 이벤트 바인딩
	bindWipDetailEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateWipDetailTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateWipDetailTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#wipDetail_searchVal_factory');
	const storage = $('#wipDetail_searchVal_storage');
	const wccode = $('#wipDetail_searchVal_wccode');
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
function updateWipDetailTotalCount() {
	$('#wipDetailTotalCount').text(totalWipDetailCount.toLocaleString());
	$('#wipDetailCurrentPageInfo').text(currentWipDetailPage);
}

// 총 수량을 업데이트하는 함수
function updateWipDetailTotalQty() {
	$('.wipDetailTotalQty').text(totalWipDetailQty.toLocaleString());
}

// 불출상태 판단 함수
function getWipStatus(item) {
	if (item.intf_yn === 'Y' || item.INTF_YN === 'Y' || item.confirm_yn === 'Y' || item.CONFIRM_YN === 'Y') {
		return i18n.t('search.input.completed');
	} else {
		return i18n.t('search.input.waiting');
	}
}

function renderWipDetailTableData() {
	let tableBody = "";

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalWipDetailData.length; i++) {
		console.log("ddddd" + globalWipDetailData[i].intf_yn);
		
		let rowNumber = (currentWipDetailPage - 1) * wipDetailItemsPerPage + i + 1;
		let un = globalWipDetailData[i]
		let statusText = globalWipDetailData[i].intf_yn === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
				let statusClass = globalWipDetailData[i].intf_yn === 'Y' ? 'status-completed' : 'status-waiting';
		// globalIndex 계산: 전체 데이터에서의 실제 인덱스
		/*let globalIndex = globalWipDetailData.findIndex(item =>
			JSON.stringify(item) === JSON.stringify(globalWipDetailData[i])
		);
		// 만약 찾지 못했다면 현재 인덱스 사용
		if (globalIndex === -1) {
			globalIndex = i;
		}*/

		/*let workMoveStatus = getWipStatus(globalWipDetailData[i]);

		let barcode = globalWipDetailData[i].barcode || globalWipDetailData[i].BARCODE || ''
		let lot = barcode.split(',')[1];
		let nohtml = '';
		let loginid = $(".loginId").text().trim().toLowerCase();
		if (loginid  == "wms" ||loginid =="master") {
			nohtml = `<td class = "checkboxVal"><input type="checkbox" class="wipDetail_chk ${statusClass}" 
		            		data-unique="${un.indate}_${un.itemcode}_${un.intf_yn}_${un.qty}_${un.factory}_${un.storage}_${un.barcode}_${un.wms_key}"
		            		data-delete="${un.iid}_${un.indate}_${un.factory}_${un.storage}_${un.barcode}"></td>					
			<td class = 'noVal'>${rowNumber}</td>
			<td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
			<td class = "intfVal">${globalWipDetailData[i].wms_key || globalWipDetailData[i].WMS_KEY || ''}</td>`
		}else{
			nohtml = `<td class = 'noVal'>${rowNumber}</td>`
		}
		tableBody += `
			<tr>
				${nohtml}
				<td class = "dateVal">${globalWipDetailData[i].indate || globalWipDetailData[i].INDATE || ''}</td>
				<td class = "factoryVal">${globalWipDetailData[i].factory || globalWipDetailData[i].FACTORY || ''}</td>
				<td class = "storageVal">${globalWipDetailData[i].storage || globalWipDetailData[i].STORAGE || ''}</td>
				<td class = "wccodeVal">${globalWipDetailData[i].wccode || globalWipDetailData[i].WCCODE || ''}</td>
				<td class = "carVal">${globalWipDetailData[i].car || globalWipDetailData[i].CAR || ''}</td>
				<td class = "itemcodeVal">${globalWipDetailData[i].itemcode || globalWipDetailData[i].ITEMCODE || ''}</td>
				<td class = "itemnameVal">${globalWipDetailData[i].itemname || globalWipDetailData[i].ITEMNAME || ''}</td>
				<td class = "qtyVal">${Number((globalWipDetailData[i].qty || globalWipDetailData[i].QTY) || 0).toLocaleString()}</td>
				<td class = "locationVal">${globalWipDetailData[i].roomcode || globalWipDetailData[i].ROOMCODE || ''}</td>
				<td class = "userVal">${globalWipDetailData[i].loginid || globalWipDetailData[i].LOGINID || ''}</td>
				<td class = "hhmmVal">${globalWipDetailData[i].hhmm || globalWipDetailData[i].hhmm || ''}</td>
				<td class = "barcodeVal">
					<input type="hidden" class="iidVal" value="${globalWipDetailData[i].iid || ''}">
					${globalWipDetailData[i].barcode || globalWipDetailData[i].BARCODE || ''}
				</td>
			</tr>
		`;
	}

	$("#wipDetailTableBody").html(tableBody);
	$(".wipDetail_chkAll").prop("checked", false);


	// 체크박스 상태 업데이트
	updateCheckboxStatus();
}

// 페이지네이션 렌더링
function renderWipDetailPagination() {
	let totalPages = Math.ceil(totalWipDetailCount / wipDetailItemsPerPage);
	let paginationHtml = "";

	// 이전 버튼
	if (currentWipDetailPage > 1) {
		paginationHtml += `<button class="wipDetail-page-btn" data-page="${currentWipDetailPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="wipDetail-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentWipDetailPage - 5);
	let endPage = Math.min(totalPages, currentWipDetailPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="wipDetail-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentWipDetailPage) {
			paginationHtml += `<button class="wipDetail-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="wipDetail-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="wipDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentWipDetailPage < totalPages) {
		paginationHtml += `<button class="wipDetail-page-btn" data-page="${currentWipDetailPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="wipDetail-page-btn disabled">&gt;</button>`;
	}

	$('#wipDetailTotalPageInfo').text(totalPages);
	$("#wipDetailPaginationContainer").html(paginationHtml);
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
function bindWipDetailEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.wipDetail_chkAll').on('change', '.wipDetail_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.wipDetail_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.wipDetail_chk').on('change', '.wipDetail_chk', function() {
		let totalCheckboxes = $('.wipDetail_chk').length;
		let checkedCheckboxes = $('.wipDetail_chk:checked').length;
		$('.wipDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});
	// 검색 버튼 클릭
	$(".btnWipDetailSearch").off('click').on('click', function() {
		performWipDetailSearch();
	});

	// 초기화 버튼 클릭
	$(".btnWipDetailSearchInit").off('click').on('click', function() {
		resetWipDetailSearch();
	});

	// 페이지네이션 버튼 클릭
	$(document).off('click', '.wipDetail-page-btn').on('click', '.wipDetail-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentWipDetailPage = page;
				let searchCriteria = getCurrentSearchCriteria();
				performWipDetailDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_wip_detail input[type="text"], #view_m2_wip_detail input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performWipDetailSearch();
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
//					performWipDetailDBSearch(searchCriteria);
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
//					performWipDetailDBSearch(searchCriteria);
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
		workMoveCondition: $("#wipDetail_searchVal_workMoveCondition").val(),
		fromDate: $("#wipDetail_searchVal_fromDate").val(),
		toDate: $("#wipDetail_searchVal_toDate").val(),
		factory: $("#wipDetail_searchVal_factory").val(),
		storage: $("#wipDetail_searchVal_storage").val(),
		wccode: $("#wipDetail_searchVal_wccode").val(),
		/*barcode: $("#wipDetail_searchVal_barcode").val().trim().toUpperCase(),*/
		/*car: $("#wipDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#wipDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#wipDetail_searchVal_itemname").val().trim().toUpperCase(),
		/*roomcode: $("#wipDetail_searchVal_roomcode").val().trim().toUpperCase()*/
	/*};
}

// 검색 수행 함수 - DB 조회
function performWipDetailSearch() {
	let searchCriteria = getCurrentSearchCriteria();
	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentWipDetailPage = 1;
	performWipDetailDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetWipDetailSearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const factory = getCookie('selectedFactory');

	$("#wipDetail_searchVal_workMoveCondition").val('');
	$("#wipDetail_searchVal_fromDate").val(fromDate);
	$("#wipDetail_searchVal_toDate").val(toDate);
	/*$("#wipDetail_searchVal_barcode").val('');*/
	/*$("#wipDetail_searchVal_car").val('');
	$("#wipDetail_searchVal_itemcode").val('');
	$("#wipDetail_searchVal_itemname").val('');
	/*$("#wipDetail_searchVal_roomcode").val('');*/

	// 공장, 창고, 작업장 초기화
	/*renderFactoryStorage();

	// 초기화 후 전체 데이터 다시 조회
	currentWipDetailPage = 1;
	performWipDetailDBSearch({ fromDate, toDate, factory });

	console.log('검색 조건이 초기화되었습니다.');
}

// 유틸리티 함수들
window.changeWipDetailItemsPerPage = function(newItemsPerPage) {
	wipDetailItemsPerPage = newItemsPerPage;
	currentWipDetailPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performWipDetailDBSearch(searchCriteria);
}

window.exportWipDetailData = function() {
	return {
		total: globalWipDetailData.length,
		currentPage: currentWipDetailPage,
		itemsPerPage: wipDetailItemsPerPage,
		data: globalWipDetailData
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
window.downloadAllWipDetailData = function() {
	let searchCriteria = {
		workMoveCondition: $("#wipDetail_searchVal_workMoveCondition").val(),
		fromDate: $("#wipDetail_searchVal_fromDate").val(),
		toDate: $("#wipDetail_searchVal_toDate").val(),
		factory: $("#wipDetail_searchVal_factory").val(),
		storage: $("#wipDetail_searchVal_storage").val(),
		wccode: $("#wipDetail_searchVal_wccode").val(),
		/*barcode: $("#wipDetail_searchVal_barcode").val().trim().toUpperCase(),*/
		/*car: $("#wipDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#wipDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#wipDetail_searchVal_itemname").val().trim().toUpperCase(),
		/*roomcode: $("#wipDetail_searchVal_roomcode").val().trim().toUpperCase()*/
	/*};

	showLoading("export");

	$.ajax({
		url: "/read_wipDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data);
			ExcelExporter.downloadExcel(data, window.wipDetailColumns, {
				fileName: 'WipDetail_All',
				sheetName: 'WipDetail'
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
$(document).on("click", ".btnWipDelete", function() {	
	if ($(".wipDetail_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items.delete'));
		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
		return;
	}
	
	const iidList = [];
	$(".wipDetail_chk:checked").each(function() {
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

	const loginid = getCookie("userLoginId");
	
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
			performWipDetailDBSearch(searchVal);	
			
			// 전체 선택 해제
			$('.wipDetail_chkAll').prop('checked', false);
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

$(document).on("click", ".btnIntfWipDetail", function() {

	if ($(".wipDetail_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}
	
	const iidList = [];
	$(".wipDetail_chk:checked").each(function() {
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
		url: "/workmove_confirm_summary",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performWipDetailDBSearch(searchVal);
			
			// 전체 선택 해제
			$('.wipDetail_chkAll').prop('checked', false);
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

$(document).on("click", ".btnIntfWipDetailDelete", function() {

	if ($(".wipDetail_chk.status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}
		
	const iidList = [];
	$(".wipDetail_chk:checked").each(function() {
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
		url: "/workMove_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performWipDetailDBSearch(searchVal);
			
			// 전체 선택 해제
			$('.wipDetail_chkAll').prop('checked', false);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

}); */