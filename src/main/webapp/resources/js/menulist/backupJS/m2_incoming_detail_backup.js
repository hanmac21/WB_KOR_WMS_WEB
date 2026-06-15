/* --------------------------------------------------------------
 * 📌 입고 - 입고조회 - Detail (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */

/*let globalIncomingDetailData = []; // 현재 조회된 데이터 저장
let currentIncomingDetailPage = 1; // 현재 페이지
let incomingDetailItemsPerPage = 1000; // 페이지당 항목 수
let totalIncomingDetailCount = 0; // 서버에서 받은 총 개수 저장
let totalIncomingDetailQty = 0; // 서버에서 받은 총 수량 저장
let totalIncomingDetailPages = 0; // 서버에서 받은 총 페이지
window.filteredIncomingDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
window.incomingDetailColumns = [
	{ key: 'INDATE', header: 'Date' },
	{ key: 'TYPE', header: 'Type' },
	{ key: 'FACTORY', header: 'Factory' },
	{ key: 'STORAGE', header: 'Storage' },
	{ key: 'CAR', header: 'Car' },
	{ key: 'ITEMCODE', header: 'Itemcode' },
	{ key: 'ITEMNAME', header: 'Itemname' },
	{ key: 'QTY', header: 'Qty' },
	{ key: 'INVOICENO', header: 'Invoice No' },
	{ key: 'LOGINID', header: 'User' },
	{ key: 'HHMM', header: 'Time' },
	{ key: 'BARCODE', header: 'barcode' }
];

$(document).ready(function() {
	// 메인 호출 함수 - 초기 로딩 시에는 날짜, 공장으로 조회
	window.call_m2_incoming_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performIncomingDetailDBSearch({ fromDate, toDate, factory });
	}

});



// DB에서 데이터 조회하는 함수
function performIncomingDetailDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_incomingDetail",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentIncomingDetailPage,
			itemsPerPage: incomingDetailItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalIncomingDetailData = data.records || data || [];
			totalIncomingDetailCount = data.totalCount || 0;
			totalIncomingDetailQty = data.totalQty || 0;
			totalIncomingDetailPages = data.totalPages || 0;
			currentIncomingDetailPage = data.currentPage || currentIncomingDetailPage;
			window.filteredIncomingDetailData = globalIncomingDetailData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_incoming_detail').length) {
				renderIncomingDetailView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderIncomingDetailTableData();
				renderIncomingDetailPagination();
				updateIncomingDetailTotalCount();
				updateIncomingDetailTotalQty();
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
function renderIncomingDetailView() {
	let content_output = `
		<div class="divBlockControl" id="view_m2_incoming_detail">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row m2_3_1">
						<div class="search-label">
							<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
							<input type="date" id="incomingDetail_searchVal_fromDate" /> 
						</div>
						<div class="search-label">
							<div class="searchVal_toDate">　</div>
							<input type="date" id="incomingDetail_searchVal_toDate" />
						</div>
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.type.purchase')}</div>
							<select id="incomingDetail_searchVal_supplytype" >
								<option value="all">${i18n.t('search.all')} </option>
								<option value="NORMAL">${i18n.t('search.type.normal')} </option>
								<option value="FREE">${i18n.t('search.type.free')} </option>
							</select>
						</div>
						
						<div class="search-label">
							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
							<select id="incomingDetail_searchVal_factory" class="factory-select">
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
							</select>
						</div>
						<div class="search-label">
							<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
							<select id="incomingDetail_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div>
						<div class="search-label">
							<div class="search_car">${i18n.t('search.car')}<!-- CAR --></div>
							<input type="text" id="incomingDetail_searchVal_car" />
						</div>
						<div class="search-label">
							<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEM CODE --></div>
							<input type="text" id="incomingDetail_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEM NAME --></div>
							<input type="text" id="incomingDetail_searchVal_itemname" />
						</div>
						<div class="search-label">
							<div class="search_invoice_no">${i18n.t('search.invoiceNo')}<!-- INVOICE NO --></div>
							<input type="text" id="incomingDetail_searchVal_invoice_no" />
						</div>
						<div class="search-label">
							<div class="searchVal_factory">DELETED</div>
							<select id="incomingDetail_searchVal_useyn" >
								<option value="Y">N</option>
								<option value="N">Y </option>
							</select>
						</div>
					</div>
					<div class="search_button_area">
						<button class="btn btn-primary btnIncomingDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
						<button class="btn btn-secondary btnIncomingDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
						<button class="btn btn-secondary" onclick="downloadAllIncomingDetailData()">엑셀 다운로드</button>
					</div>
					
					<div class="table-info">
						<span>${i18n.t('table.info.total')} <strong id="incomingDetailTotalCount">0</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="incomingDetailCurrentPageInfo">1</strong>/<strong id="incomingDetailTotalPageInfo">1</strong> | 
							<!-- ${i18n.t('table.selectItems')} : <strong id="selectedCount">0</strong>${i18n.t('table.info.records')} | --> 
							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="incomingDetailTotalQty" style="color:#007bff">0</span>
						</span>
						<div class="action-buttons-right m2_3_1">							
							<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnIncomingDelete"/>
							<button class="btn btn-success" id="incomingDetailExcelBtn" onclick="downloadAllIncomingDetailData()">Excel</button>
						</div>
					</div>
					
					<table class="data-table m2_incoming_detail">
						<thead>
							<tr>
								<th class = 'checkboxVal'>
									<input type="checkbox" class="incoming_chkAll" />
								</th>
								<th class = 'noVal'>${i18n.t('table.no')}<!-- No --></th>
								<th class = "statusVal">${i18n.t('table.status')}</th>		
								<th class = 'dateVal'>${i18n.t('search.date')}<!-- INDATE --></th>
								<th class = 'dateVal'>${i18n.t('search.type.purchase')}<!-- type --></th>
								<th class = 'factoryVal'>${i18n.t('search.factory')}<!-- FACTORY --></th>
								<th class = 'storageVal'>${i18n.t('search.storage')}<!-- STORAGE --></th>
								<th class = 'carVal'>${i18n.t('search.car')}<!-- CAR --></th>
								<th class = 'itemcodeVal'>${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
								<th class = 'itemnameMedVal'>${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
								<th class = 'qtyVal'>${i18n.t('search.qty')}<!-- QTY --></th>
								<th class = 'invoiceNoVal'>${i18n.t('search.invoiceNo')}<!-- INVOICE_NO --></th>
								<th class = 'loginidVal'>${i18n.t('search.user')}<!-- LOGINID --></th>
								<th class = 'hhmmVal'>${i18n.t('table.time')}<!-- HH:MM --></th>
								<th class = 'barcodeVal'>${i18n.t('search.barcode')}<!-- LOT --></th>
							</tr>
						</thead>
						<tbody id="incomingDetailTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="incomingDetailPaginationContainer">
					</div>
				</div>
			</div>
		</div>
	`;

	$(".w_contentArea").append(content_output);

	// 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#incomingDetail_searchVal_fromDate").val(fromDate);
		$("#incomingDetail_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderIncomingDetailTableData();
	// 페이지네이션 렌더링
	renderIncomingDetailPagination();
	// 이벤트 바인딩
	bindIncomingDetailEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateIncomingDetailTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateIncomingDetailTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#incomingDetail_searchVal_factory');
	const storage = $('#incomingDetail_searchVal_storage');
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

	// 저장된 공장 선택
	if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
		factory.val(savedFactory);
	}

	updateStorageOptions(savedFactory || '');

	// 공장 변경 시 창고 업데이트
	factory.on('change', function() {
		updateStorageOptions($(this).val());
	});
}

// 정규식으로 쿠키 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}

// 총 개수를 업데이트하는 함수
function updateIncomingDetailTotalCount() {
	$('#incomingDetailTotalCount').text(totalIncomingDetailCount.toLocaleString());
	$('#incomingDetailCurrentPageInfo').text(currentIncomingDetailPage);
}

// 총 수량을 업데이트하는 함수
function updateIncomingDetailTotalQty() {
	$('.incomingDetailTotalQty').text(totalIncomingDetailQty.toLocaleString());
}

// 입고상태 판단 함수
function getInboundStatus(item) {
	if (item.intf_yn === 'Y' || item.INTF_YN === 'Y' || item.confirm_yn === 'Y' || item.CONFIRM_YN === 'Y') {
		return i18n.t('search.inbound.completed');
	} else {
		return i18n.t('search.inbound.waiting');
	}
}

function renderIncomingDetailTableData() {
	let tableBody = "";

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalIncomingDetailData.length; i++) {
		let rowNumber = (currentIncomingDetailPage - 1) * incomingDetailItemsPerPage + i + 1;
		let data = globalIncomingDetailData[i];

		let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
		let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';

		// globalIndex 계산: 전체 데이터에서의 실제 인덱스
		let globalIndex = globalIncomingDetailData.findIndex(item =>
			JSON.stringify(item) === JSON.stringify(globalIncomingDetailData[i])
		);
		// 만약 찾지 못했다면 현재 인덱스 사용
		if (globalIndex === -1) {
			globalIndex = i;
		}

		let inboundStatus = getInboundStatus(globalIncomingDetailData[i]);

		//변환작업
		let ymdhms = globalIncomingDetailData[i].YMDHMS || '';
		let hhmm = ymdhms.substring(8, 10) + ":" + ymdhms.substring(10, 12);
		//console.log("변환 시간 - " + hhmm);

		let supplyType = '';
		if (globalIncomingDetailData[i].CUSTCODE == '0039') {
			supplyType = `${i18n.t('search.type.free')}`
		} else {
			supplyType = `${i18n.t('search.type.normal')}`
		}
		tableBody += `
			<tr>
				<td class = 'checkboxVal'><input type="checkbox" class="incoming_chk ${statusClass} row-checkbox" 
					data-global-index="${globalIndex}" data-filtered-index="${i}" data-chk-inboundbar="${globalIncomingDetailData[i].barcode || ''}" data-chk-meskey="${globalIncomingDetailData[i].meskey || ''}"				
        			data-delete="${globalIncomingDetailData[i].IID}_${globalIncomingDetailData[i].INDATE}_${globalIncomingDetailData[i].FACTORY}_${globalIncomingDetailData[i].STORAGE}_${globalIncomingDetailData[i].BARCODE}">
				</td>
				<td class = 'noVal'>${rowNumber}</td>
			    <td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
				<td class = 'dateVal'>${globalIncomingDetailData[i].indate || globalIncomingDetailData[i].INDATE || ''}</td>
				<td class = 'dateVal'>${supplyType}</td>
				<td class = 'factoryVal'>${globalIncomingDetailData[i].factory || globalIncomingDetailData[i].FACTORY || ''}</td>
				<td class = 'storageVal'>${globalIncomingDetailData[i].storage || globalIncomingDetailData[i].STORAGE || ''}</td>
				<td class = 'carVal'>${globalIncomingDetailData[i].car || globalIncomingDetailData[i].CAR || ''}</td>
				<td class = 'itemcodeVal'>${globalIncomingDetailData[i].itemcode || globalIncomingDetailData[i].ITEMCODE || ''}</td>
				<td class = 'itemnameMedVal'>${globalIncomingDetailData[i].itemname || globalIncomingDetailData[i].ITEMNAME || ''}</td>
				<td class = 'qtyVal'>${Number((globalIncomingDetailData[i].qty ?? globalIncomingDetailData[i].QTY) || 0).toLocaleString()}</td>
				<td class = 'invoiceNoVal'>${globalIncomingDetailData[i].invoiceno || globalIncomingDetailData[i].INVOICENO || ''}</td>
				<td class = 'loginidVal'>${globalIncomingDetailData[i].loginid || globalIncomingDetailData[i].LOGINID || ''}</td>
				<td class = 'hhmmVal'>${hhmm || ''}</td>
				<td class = 'barcodeVal '>${globalIncomingDetailData[i].barcode || globalIncomingDetailData[i].BARCODE || ''}</td>
			</tr>
		`;
	}

	$("#incomingDetailTableBody").html(tableBody);
	$(".incoming_chkAll").prop("checked", false);


	// 체크박스 상태 업데이트
	updateCheckboxStatus();
}

// 페이지네이션 렌더링
function renderIncomingDetailPagination() {
	let totalPages = Math.ceil(totalIncomingDetailCount / incomingDetailItemsPerPage);
	let paginationHtml = "";

	// 이전 버튼
	if (currentIncomingDetailPage > 1) {
		paginationHtml += `<button class="incomingDetail-page-btn" data-page="${currentIncomingDetailPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="incomingDetail-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentIncomingDetailPage - 5);
	let endPage = Math.min(totalPages, currentIncomingDetailPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="incomingDetail-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentIncomingDetailPage) {
			paginationHtml += `<button class="incomingDetail-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="incomingDetail-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="incomingDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentIncomingDetailPage < totalPages) {
		paginationHtml += `<button class="incomingDetail-page-btn" data-page="${currentIncomingDetailPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="incomingDetail-page-btn disabled">&gt;</button>`;
	}

	$('#incomingDetailTotalPageInfo').text(totalPages);
	$("#incomingDetailPaginationContainer").html(paginationHtml);
}

// 체크박스 상태 업데이트 함수
function updateCheckboxStatus() {
	let totalCheckboxes = $('.row-checkbox').length;
	let checkedCheckboxes = $('.row-checkbox:checked').length;

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
	let selectedCount = $('.row-checkbox:checked').length;
	$('#selectedCount').text(selectedCount);
}

// 액션 버튼 표시/숨김 업데이트
function updateActionButtonsVisibility() {
	const selected = $('.row-checkbox:checked');
	const selectedCount = selected.length;

	const $btnRegister = $('#inboundBtn');
	const $btnCancel = $('#inboundCancelBtn');

	// 선택 없음 → 기본 상태(둘 다 비활성)
	if (selectedCount === 0) {
		$btnRegister.prop('disabled', true);
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
	if (status === i18n.t('search.inbound.waiting')) {
		$btnRegister.prop('disabled', false);
		$btnCancel.prop('disabled', true);
	} else if (status === i18n.t('search.inbound.completed')) {
		$btnRegister.prop('disabled', true);
		$btnCancel.prop('disabled', false);
	} else {
		$btnRegister.prop('disabled', true);
		$btnCancel.prop('disabled', true);
	}
}

// 이벤트 바인딩
function bindIncomingDetailEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.incoming_chkAll').on('change', '.incoming_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.incoming_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.incoming_chk').on('change', '.incoming_chk', function() {
		let totalCheckboxes = $('.incoming_chk').length;
		let checkedCheckboxes = $('.incoming_chk:checked').length;
		$('.incoming_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});

	// 검색 버튼 클릭
	$(".btnIncomingDetailSearch").off('click').on('click', function() {
		performIncomingDetailSearch();
	});

	// 초기화 버튼 클릭
	$(".btnIncomingDetailSearchInit").off('click').on('click', function() {
		resetIncomingDetailSearch();
	});

	// 페이지네이션 버튼 클릭
	$(document).off('click', '.incomingDetail-page-btn').on('click', '.incomingDetail-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentIncomingDetailPage = page;
				let searchCriteria = getCurrentSearchCriteria();
				performIncomingDetailDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_incoming_detail input[type="text"], #view_m2_incoming_detail input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performIncomingDetailSearch();
		}
	});

	// 전체 선택 체크박스 이벤트
	$('#checkAll').off('change').on('change', function() {
		let isChecked = $(this).prop('checked');
		$('.row-checkbox').prop('checked', isChecked);
		updateSelectedCount();
		updateActionButtonsVisibility();
	});

	// 개별 체크박스 이벤트
	$(document).off('change', '.row-checkbox').on('change', '.row-checkbox', function() {
		const isChecked = $(this).prop('checked');
		const $row = $(this).closest('tr');
		const currentStatus = $row.find('.status-badge').text().trim();
		const meskey = $(this).data('chk-meskey');

		if (isChecked) {
			// 상태 충돌 체크
			let alreadyCheckedStatus = null;
			let conflict = false;

			$('.row-checkbox:checked').each(function() {
				let status = $(this).closest('tr').find('.status-badge').text().trim();
				if (!alreadyCheckedStatus) {
					alreadyCheckedStatus = status;
				} else if (alreadyCheckedStatus !== status) {
					conflict = true;
					return false;
				}
			});

			if (conflict) {
				alert("입고 상태가 다른 항목은 동시에 선택할 수 없습니다.");
				$(this).prop('checked', false);
				return;
			}

			// meskey 그룹 체크
			if (meskey) {
				$(`.row-checkbox[data-chk-meskey="${meskey}"]`).prop('checked', true);
			}
		} else {
			// 체크 해제 시에도 meskey 그룹 같이 해제
			if (meskey) {
				$(`.row-checkbox[data-chk-meskey="${meskey}"]`).prop('checked', false);
			}
		}

		updateCheckboxStatus();
	});

	// 입고 등록 버튼 클릭
	$("#inboundBtn").off('click').on('click', function() {
		console.log('입고 등록 버튼 클릭');
		const inboundList = [];
		$('.row-checkbox:checked').each(function() {
			inboundList.push($(this).attr("data-chk-inboundbar"));
		});

		if (inboundList.length === 0) {
			alert('선택된 항목이 없습니다.');
			return;
		}

		showLoading("insert");
		$.ajax({
			type: "post",
			url: "inbound_confirm",
			traditional: true,
			contentType: "application/json; charset=UTF-8",
			data: JSON.stringify(inboundList),
			success: function(result) {
				hideLoading();
				alert("입고등록되었습니다.");
				// 현재 검색 조건으로 다시 조회
				let searchCriteria = getCurrentSearchCriteria();
				performIncomingDetailDBSearch(searchCriteria);
			},
			error: function(request, status, error) {
				hideLoading();
				if (request.status == 500) {
					alert('처리도중 에러가 발생하였습니다.');
				} else if (request.status == 0) {
					alert('Wi-Fi 또는 데이터 연결이 없습니다.');
				} else {
					console.log("code: " + request.status + ", message: " + request.responseText + ", error: " + error);
					alert("오류가 발생했습니다: " + error);
				}
			}
		});
	});

	// 입고 취소 버튼 클릭
	$("#inboundCancelBtn").off('click').on('click', function() {
		console.log('입고 취소 버튼 클릭');
		const inboundList = [];
		$('.row-checkbox:checked').each(function() {
			inboundList.push($(this).attr("data-chk-meskey"));
		});

		if (inboundList.length === 0) {
			alert('선택된 항목이 없습니다.');
			return;
		}

		showLoading("insert");
		$.ajax({
			type: "post",
			url: "inbound_confirm_cancel",
			traditional: true,
			contentType: "application/json; charset=UTF-8",
			data: JSON.stringify(inboundList),
			success: function(result) {
				hideLoading();
				alert("입고등록이 취소되었습니다.");
				// 현재 검색 조건으로 다시 조회
				let searchCriteria = getCurrentSearchCriteria();
				performIncomingDetailDBSearch(searchCriteria);
			},
			error: function(request, status, error) {
				hideLoading();
				if (request.status == 500) {
					alert('처리도중 에러가 발생하였습니다.');
				} else if (request.status == 0) {
					alert('Wi-Fi 또는 데이터 연결이 없습니다.');
				} else {
					console.log("code: " + request.status + ", message: " + request.responseText + ", error: " + error);
					alert("오류가 발생했습니다: " + error);
				}
			}
		});
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		inboundCondition: $("#incomingDetail_searchVal_inboundCondition").val(),
		fromDate: $("#incomingDetail_searchVal_fromDate").val(),
		toDate: $("#incomingDetail_searchVal_toDate").val(),
		supplytype: $("#incomingDetail_searchVal_supplytype").val(),
		useyn: $("#incomingDetail_searchVal_useyn").val(),
		factory: $("#incomingDetail_searchVal_factory").val(),
		storage: $("#incomingDetail_searchVal_storage").val(),
		car: $("#incomingDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#incomingDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#incomingDetail_searchVal_itemname").val().trim().toUpperCase(),
		invoice_no: $("#incomingDetail_searchVal_invoice_no").val().trim().toUpperCase()
	};
}

// 검색 수행 함수 - DB 조회
function performIncomingDetailSearch() {
	let searchCriteria = getCurrentSearchCriteria();
	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentIncomingDetailPage = 1;
	performIncomingDetailDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetIncomingDetailSearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const factory = getCookie('selectedFactory');

	$("#incomingDetail_searchVal_inboundCondition").val('');
	$("#incomingDetail_searchVal_fromDate").val(fromDate);
	$("#incomingDetail_searchVal_toDate").val(toDate);
	$("#incomingDetail_searchVal_supplytype").val('all'),
		$("#incomingDetail_searchVal_useyn").val(''),
		$("#incomingDetail_searchVal_factory").val(factory);
	$("#incomingDetail_searchVal_storage").val('Material');
	$("#incomingDetail_searchVal_car").val('');
	$("#incomingDetail_searchVal_itemcode").val('');
	$("#incomingDetail_searchVal_itemname").val('');
	$("#incomingDetail_searchVal_invoice_no").val('');
	$("#incomingDetail_searchVal_useyn").val('Y');

	// 초기화 후 전체 데이터 다시 조회
	currentIncomingDetailPage = 1;
	performIncomingDetailDBSearch({ fromDate, toDate, factory });

	console.log('검색 조건이 초기화되었습니다.');
}

// 유틸리티 함수들
window.changeIncomingDetailItemsPerPage = function(newItemsPerPage) {
	incomingDetailItemsPerPage = newItemsPerPage;
	currentIncomingDetailPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performIncomingDetailDBSearch(searchCriteria);
}

window.exportIncomingDetailData = function() {
	return {
		total: globalIncomingDetailData.length,
		currentPage: currentIncomingDetailPage,
		itemsPerPage: incomingDetailItemsPerPage,
		data: globalIncomingDetailData
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
window.downloadAllIncomingDetailData = function() {
	let searchCriteria = {
		inboundCondition: $("#incomingDetail_searchVal_inboundCondition").val(),
		supplytype: $("#incomingDetail_searchVal_supplytype").val(),
		supplytype: $("#incomingDetail_searchVal_useyn").val(),
		fromDate: $("#incomingDetail_searchVal_fromDate").val(),
		toDate: $("#incomingDetail_searchVal_toDate").val(),
		factory: $("#incomingDetail_searchVal_factory").val(),
		storage: $("#incomingDetail_searchVal_storage").val(),
		car: $("#incomingDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#incomingDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#incomingDetail_searchVal_itemname").val().trim().toUpperCase(),
		invoice_no: $("#incomingDetail_searchVal_invoice_no").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_incomingDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data);
			// ✅ 엑셀 내보내기 전 데이터 가공
			const processedData = data.map(item => {
				// 새로운 필드 추가
				return {
					...item,
					TYPE: item.CUSTCODE === '0039'
						? i18n.t('search.type.free')   // "Free Supply"
						: i18n.t('search.type.normal') // "Standard"
				};
			});
			ExcelExporter.downloadExcel(processedData, window.incomingDetailColumns, {
				fileName: 'IncomingDetail_All',
				sheetName: 'IncomingDetail'
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
$(document).on("click", ".btnIncomingDelete", function() {
	if ($(".incoming_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items.delete'));
		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
		return;
	}

	const iidList = [];
	$(".incoming_chk:checked").each(function() {
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
		url: "/deleteIncoming",
		type: "POST",
		data: JSON.stringify({
			iidList: iidList,
			loginid: loginid
		}),
		contentType: "application/json",
		success: function(data) {
			if (!data.success) {
				hideLoading();

				let message = "";

				// 검증 실패
				if (data.failList && data.failList.length > 0) {
					message = "Some items cannot be deleted\n\n"; // 삭제할 수 없는 항목이 있습니다.

					data.failList.forEach(function(item) {
						if (item.failReason === 'INVALID_KIND') {
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
				else if (data.failReason === 'DELETE_FAILED') {
					message = "Failed to delete\n\n";
					message += `Operation: ${data.failedOperation}\n`;
					message += `Barcode: ${data.failedBarcode}\n\n`;
				}


				alert(message);
				return;
			}

			let searchVal = getCurrentSearchCriteria();
			performIncomingDetailDBSearch(searchVal);

			// 전체 선택 해제
			$('.incoming_chkAll').prop('checked', false);
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





// 테이블의 바코드 칸 클릭 이벤트 전메뉴 공통으로 사용
// 모달 열기
$(document).on('click', '.barcodeVal', function(e) {
	// 객체 가져오기
	const sel = window.getSelection && window.getSelection();
	// 조건식 : 선택 영역이 최소 1개 + 선택된 텍스트 길이가 0 보다 커야함 + 선택의 시작 노드가 현재 셀 내부인지 확인
	const hasSelection = sel && sel.rangeCount > 0 && sel.toString().length > 0 && (this.contains(sel.anchorNode) || this === sel.anchorNode);

	if (hasSelection) {
		// 부모 tr 모달 클릭도 막고, 모달 열지 않음
		e.stopPropagation();
		return;
	}

	// ⬇️ 이 한 줄만 추가하면, 다음 1회 showLoading은 스크롤 보존
	window.__preserveScrollNextLoading = true;

	const barcodeValue = $(this).text().trim();

	// TH 내부 클릭이면 리턴
	if ($(this).closest('th').length) return;

	$("#qrcode").empty();

	showLoading("data");

	$.ajax({
		url: `/show_stockHistory`,
		type: "POST",
		data: {
			barcode: barcodeValue
		},
		success: function(data) {
			console.log(data);

			renderModal(data);

			$('.modal-title-barcode').text(barcodeValue);

			// QR 코드 생성
			new QRCode(document.getElementById("qrcode"), {
				text: barcodeValue,
				width: 200,
				height: 200
			});

			$("#qrAndHistoryModal").css("display", "flex");

			hideLoading();
		},
		error: function() {
			hideLoading();
		}
	});
});

//히스토리 모달 렌더링
async function renderModal(data) {
	const modalHistoryDiv = document.getElementById('modalHistoryDiv');
	modalHistoryDiv.innerHTML = '';

	if (!data || data.length === 0) {
		// 빈 상태 표시
		modalHistoryDiv.innerHTML = `
	        <div class="empty-state">
	            <div class="empty-state-icon">📋</div>
	            <div class="empty-state-text">There is no history</div>
	        </div>
	    `;
	} else {
		// 히스토리 카드들 생성
		let historyHtml = '';
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			const sequenceNumber = data.length - i;

			let checkBarcode = item.BARCODE.charAt(0);  // 첫 번째 글자
			let checkBarcodeKor = item.BARCODE.split(",")[3];  // 콤마 맨 뒤 값 (SCMMEX)
			let checkBarcodeMex = item.BARCODE.split(",")[4];  // 콤마 맨 뒤 값 (WMSMEX)

			// 수량 포맷팅
			let qtyFormatted = '-';
			if (item.QTY) {
				const num = Number(item.QTY);
				qtyFormatted = Number.isInteger(num)
					? num.toLocaleString()
					: num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
			}

			// 공통 필드: 날짜/시간, 수량
			historyHtml += `<div class="history-card">`
			if (item.KIND == 'PALLET') {

				console.log(checkBarcode + " -- " + checkBarcodeKor);
				if (checkBarcode != "P") {
					return;
				} else {
					if (checkBarcodeKor == "SCMMEX") {
						historyHtml += `
			                <div class="history-header korBackground">
								<span class = "quantity-badge">${sequenceNumber} </span>
			                    <span>${item.KIND}</span>
			                </div>
		               `
					} else {
						historyHtml += `
			                <div class="history-header">
								<span class = "quantity-badge">${sequenceNumber} </span>
			                    <span>${item.KIND}</span>
			                </div>
		               `
					}
				}
			} else if (item.KIND == 'BARCODE' || item.KIND == 'PALLET_BARCODE' || item.KIND == 'PALLET_BARCODE_INCLUDE') {
				console.log(checkBarcode + " -- " + checkBarcodeKor + "--" + checkBarcodeMex);
				if (checkBarcodeMex == "WMSMEX") {
					historyHtml += `
			                <div class="history-header mexBackground">
								<span class = "quantity-badge">${sequenceNumber} </span>
			                    <span>${item.KIND}</span>
			                </div>
		               `
				}
			} else {
				historyHtml += `
	                <div class="history-header">
						<span class = "quantity-badge">${sequenceNumber} </span>
	                    <span>${item.KIND}</span>
	                </div>
               `
			}
			historyHtml += `
	                <div class="history-items">
	                    <div class="history-item">
	                        <!-- <div class="item-detail">
	                            <div class="detail-label">${i18n.t('table.useyn')}</div>
	                            <div class="detail-value">${item.USEYN || '-'}</div>
	                        </div>-->
	                        <div class="item-detail">
	                           <div class="detail-label">${i18n.t('search.barcode')}</div>
	                            <div class="detail-value">${item.BARCODE || '-'}</div>
	                        </div>
	                        <div class="item-detail">
	                            <div class="detail-label">${i18n.t('table.time')}</div>
	                            <div class="detail-value">${item.TIME || '-'}</div>
	                        </div>
	                        <div class="item-detail">
	                            <div class="detail-label">${i18n.t('search.qty')}</div>
	                            <div class="detail-value">${qtyFormatted}</div>
	                        </div>`;
			if (item.KIND == 'PALLET' && checkBarcode == "P" && checkBarcodeKor == "SCMMEX") {
				try {
					const data = await $.ajax({
						url: "/show_stockHistory_sangho",
						type: "POST",
						data: {
							custCode: item.CUSTCODE
						}
					});

					historyHtml += `
						<div class="item-detail">
				            <div class="detail-label">${i18n.t('search.factory')}</div>
				                <div class="detail-value">
				                <span class="detail-value">KOREA - ${data.CU_SANGHO}</span>
				            </div>
				        </div>
			    `;
				} catch (error) {
					console.error("CUSTNAME NOT FOUND:", error);
				}

			} else {
				historyHtml += `
										<div class="item-detail">
				                            <div class="detail-label">${i18n.t('search.factory')}</div>
				                            <div class="detail-value">
				                                <span class="detail-value">${item.FACTORY || '-'}</span>
				                            </div>
				                        </div>
			                        `;
			}
			// kind 값에 따라 추가 필드 표시
			if (item.KIND && (item.KIND.includes('WIP') || item.KIND.includes('LOCATION'))) {
				// location 필드 추가
				if (item.LOCATION) {
					historyHtml += `
	                    <div class="item-detail">
	                        <div class="detail-label">${i18n.t('search.location')}</div>
	                        <div class="detail-value">${item.LOCATION}</div>
	                    </div>`;
				}
			}

			if (item.KIND && (item.KIND.includes('BARCODE') || item.KIND.includes('PALLET'))) {
				// location 필드 추가
				if (item.LASTSTATUS) {
					historyHtml += `
	                    <div class="item-detail">
	                        <div class="detail-label">${i18n.t('table.laststatus')}</div>
	                        <div class="detail-value">${item.LASTSTATUS}</div>
	                    </div>`;
				}
			}

			if (item.KIND && (item.KIND.includes('WORKMOVE'))) {
				// work 필드 추가
				if (item.WORK) {
					historyHtml += `
	                    <div class="item-detail">
	                        <div class="detail-label">Work</div>
	                        <div class="detail-value">${item.WORK}</div>
	                    </div>`;
				}
			}

			/*//*/ 공장간이송 추가
			if(item.KIND== 'FACTORY MOVE SENDING'){
				// factory 필드 추가
				if (item.FACTORY) {
					historyHtml += `
						<div class="item-detail">
							<div class="detail-label">${i18n.t('search.factory')}</div>
							<div class="detail-value">${item.FACTORY}</div>
						</div>`;
				}
			}
			if(item.KIND== 'FACTORY MOVE RECEIVE'){
				// factory 필드 추가
				if (item.FACTORY) {
					historyHtml += `
						<div class="item-detail">
							<div class="detail-label">${i18n.t('search.factory')}</div>
							<div class="detail-value">${item.FACTORY}</div>
						</div>
						<div class="item-detail">
							<div class="detail-label">${i18n.t('search.storage')}</div>
							<div class="detail-value">${item.STORAGE}</div>
						</div>`;
				}
			}*/

			// LOGINID 필드 추가
			/*if (item.LOGINID && item.LOGINID != ' ') {
				historyHtml += `
                    <div class="item-detail">
                        <div class="detail-label">${i18n.t('search.user')}</div>
                        <div class="detail-value">${item.LOGINID || '-'}</div>
                    </div>`;
			}

			if (item.KIND == 'STOCK MOVE' || item.KIND == 'FACTORY MOVE' || item.KIND == 'FACTORY SENDING' || item.KIND == 'FACTORY RECEIVE') {
				const factory = item.FACTORY || '';
				const storage = item.STORAGE || '';
				const custcode = item.CUSTCODE || '';
				const custname = item.CUSTNAME || '';
				historyHtml += `
               	   	<div class="item-detail">
        	            <div class="detail-label">${i18n.t('search.location')}</div>
    	        		<div class="detail-value">${factory} ${storage} -> ${custcode} ${custname}</div>
	            	</div>
	            `
			} else if (item.KIND == 'LOAD') {

				const custcode = item.CUSTCODE || '';
				const storage = item.STORAGE || '';
				try {

					const data = await $.ajax({
						url: "/show_stockHistory_sangho",
						type: "POST",
						data: {
							custCode: custcode
						}
					});

					historyHtml += `
			           	<div class="item-detail">
			            	<div class="detail-label">${i18n.t('search.location')}</div>
			    			<div class="detail-value">${storage} -> ${data.CU_SANGHO || ''}</div>
				       	</div>
				    `
				} catch (error) {
					console.error("CUSTNAME NOT FOUND:", error);
				}

			}
			/*if(item.STORAGE != ' '){
				historyHtml += `
					<div class="item-detail">
						<div class="detail-label">${i18n.t('search.storage')}</div>
						<div class="detail-value">${item.STORAGE}</div>
					</div>
				`
			}*/

			/*historyHtml += `
	                    </div>
	                </div>
	            </div>`;
		}
		modalHistoryDiv.innerHTML = historyHtml;
	}
}

// 닫기 버튼 동작
$(document).on("click", ".modal-close", function() {
	$("#qrAndHistoryModal").css("display", "none");
});

// 모달 배경 클릭 시 닫기
$(document).on('click', '#qrAndHistoryModal', function(e) {
	if (e.target === this) $(this).hide();
});*/
