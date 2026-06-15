/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_incoming_summary 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : incomingSummary -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : IncomingSummary -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */
/*let globalIncomingSummaryData = []; // 현재 조회된 데이터 저장
let currentIncomingSummaryPage = 1; // 현재 페이지
let incomingSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalIncomingSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalIncomingSummaryQty = 0; // 서버에서 받은 총 개수 저장
let totalIncomingSummaryPages = 0; // 서버에서 받은 총 페이지

$(document).ready(function() {

	window.filteredIncomingSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.incomingSummaryColumns = [
		{ header: 'INTF_YN', key: 'INTF_YN' },
		{ header: 'INDATE', key: 'INDATE' },
		{ header: 'TYPE', key: 'TYPE' },
		{ header: 'FACTORY', key: 'FACTORY' },
		{ header: 'STORAGE', key: 'STORAGE' },
		{ header: 'CUSTCODE', key: 'CUSTCODE' },
		{ header: 'CNAME', key: 'CNAME' },
		{ header: 'CAR', key: 'CAR' },
		{ header: 'ITEMCODE', key: 'ITEMCODE' },
		{ header: 'ITEMNAME', key: 'ITEMNAME' },
		{ header: 'QTY', key: 'QTY' },
		{ header: 'INVOICENO', key: 'INVOICENO' },
		{ header: 'IFNO', key: 'IFNO' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_incoming_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performIncomingSummaryDBSearch({ fromDate, toDate, factory });
	}
});

// DB에서 데이터 조회하는 함수
function performIncomingSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_incomingSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentIncomingSummaryPage,
			itemsPerPage: incomingSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalIncomingSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalIncomingSummaryCount = data.totalCount || 0;
			totalIncomingSummaryQty = data.totalQty || 0;
			totalIncomingSummaryPages = data.totalPages || 0;
			currentIncomingSummaryPage = data.currentPage || 0;
			window.filteredIncomingSummaryData = globalIncomingSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_incoming_summary').length) {
				renderIncomingSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderIncomingSummaryTableData();
				renderIncomingSummaryPagination();
				updateIncomingSummaryTotalCount();
				updateIncomingSummaryTotalQty();

				hideLoading();
			}

			//			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("DB 조회 실패:", error);
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

// 사용자 뷰 렌더링 함수
function renderIncomingSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_m2_incoming_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_inboundCondition">${i18n.t('search.inbound.status')}<!-- 입고상태 --></div>
								<select id="incomingSummary_searchVal_condition" >
									<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="N">${i18n.t('search.inbound.waiting')}<!-- 입고 대기중 --></option>
									<option value="Y">${i18n.t('search.inbound.completed')}<!-- 입고 완료 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="incomingSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="incomingSummary_searchVal_toDate" />
							</div>
							 <div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.type.purchase')}</div>
								<select id="incomingSummary_searchVal_supplytype" >
									<option value="all">${i18n.t('search.all')} </option>
									<option value="NORMAL">${i18n.t('search.type.normal')} </option>
									<option value="FREE">${i18n.t('search.type.free')} </option>
								</select>
							</div> 
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="incomingSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="incomingSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_cucode">${i18n.t('search.cucode')}<!-- CUCODE --></div>
								<input type="text" id="incomingSummary_searchVal_cucode" />
							</div>
							<div class="search-label">
								<div class="searchVal_cname">${i18n.t('search.cname')}<!-- CNAME --></div>
								<input type="text" id="incomingSummary_searchVal_cname" />
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="incomingSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="incomingSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="incomingSummary_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_invoice_no">${i18n.t('search.invoiceNo')}<!-- ITEMNAME --></div>
								<input type="text" id="incomingSummary_searchVal_invoice_no" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnIncomingSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnIncomingSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화--> </button>
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
							<span>${i18n.t('table.info.total')} <strong id="incomingSummaryTotalCount">${totalIncomingSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="incomingSummaryCurrentPageInfo">${currentIncomingSummaryPage}</strong>/<strong id="incomingSummaryTotalPageInfo">${totalIncomingSummaryPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "incomingSummaryTotalQty"></strong>
							</span>
							<div class="btnInterfaceCommon btnIncomingSummaryItemsArea" style="margin-left:24px;">
								<select id = "incomingSummarySupplier">
								</select>
								<button class="btn btn-success" id="incomingSummaryChangeBtn" onclick="">Change</button>
							</div>
							<div class="action-buttons-right m2_incoming_summary">
								<div id="defaultActions" class="action-group">
									
									<button class="btn btn-success" id="incomingSummaryExcelBtn" onclick="downloadAllIncomingSummaryData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnIncomingSummaryItemsArea" style="margin-left:24px;">
								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfIncomingSummary"/>
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfIncomingSummaryDelete"/>
							</div>
						</div>
						<table class="data-table m2_incoming_summary">
							<thead>
								<tr>						
									<th class = 'checkboxVal'>
										<input type="checkbox" class="incomingSummary_chkAll">
									</th>
									<th class = 'noVal'>${i18n.t('table.no')}<!-- No --></th>
									<th class = 'statusVal'>${i18n.t('table.status')}<!-- STATUS --></th>
									<th class = 'dateVal'>${i18n.t('search.date')}<!-- INDATE --></th>
									<th class = 'dateVal'>${i18n.t('search.type.purchase')}<!-- SUPPLY TYPE --></th>
									<th class = 'factoryVal'>${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = 'storageVal'>${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = 'cucodeVal'>${i18n.t('search.cucode')}<!-- CUCODE --></th>
									<th class = 'cnameVal'>${i18n.t('search.cname')}<!-- CNAME --></th>
									<th class = 'carVal'>${i18n.t('search.car')}<!-- CAR --></th>
									<th class = 'itemcodeVal'>${i18n.t('search.itemCode')}<!-- ITEM CODE --></th>
									<th class = 'itemnameMedVal'>${i18n.t('search.itemName')}<!-- ITEM NAME --></th>
									<th class = 'qtyVal'>${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = 'invoiceNoVal'>${i18n.t('search.invoiceNo')}<!-- INVOICE NO --></th>
									<th class = 'intfVal'>${i18n.t('table.ifno')}<!-- 인터페이스 --></th>
								</tr>
							</thead>
							<tbody id="incomingSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="incomingSummaryPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
	// = 위에 data-table, search-row i18n 부분 추가
	/*<button class="btn btn-success" id="incomingSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredIncomingSummaryData, incomingSummaryColumns, {fileName:'IncomingSummary', sheetName:'IncomingSummary'})">Excel</button>*/
	/*$(".w_contentArea").append(content_output);

	// ⬇️ 추가: 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#incomingSummary_searchVal_fromDate").val(fromDate);
		$("#incomingSummary_searchVal_toDate").val(toDate);
	})();

	// 공급사 데이터 가져오기
	selectSupplier();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderIncomingSummaryTableData();
	// 페이지네이션 렌더링
	renderIncomingSummaryPagination();
	// 이벤트 바인딩
	bindIncomingSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateIncomingSummaryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateIncomingSummaryTotalQty();

}

function selectSupplier() {
	$.ajax({
		url: "/selectSupplier",
		type: "POST",
		contentType: "application/json",
		success: function(data) {
			console.log("-- select Supplier --");
			console.log(data);
			let $select = $("#incomingSummarySupplier");
			$select.empty(); // 기존 option 제거

			$.each(data, function(index, value) {
				$select.append($("<option>", {
					value: value,
					text: value.split("_")[1]
				}));
			});
			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("DB 조회 실패:", error);
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#incomingSummary_searchVal_factory');
	const storage = $('#incomingSummary_searchVal_storage');
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

		// 첫 번째 옵션 선택 (Material)
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

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}


// 총 개수를 업데이트하는 함수
function updateIncomingSummaryTotalCount() {
	$('#incomingSummaryTotalCount').text(totalIncomingSummaryCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateIncomingSummaryTotalQty() {
	$('#incomingSummaryTotalQty').text(totalIncomingSummaryQty.toLocaleString());
}
function renderIncomingSummaryTableData() {
	let tableBody = "";

	//console.log("globalIncomingSummaryData:", globalIncomingSummaryData);
	//console.log("데이터 개수:", globalIncomingSummaryData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalIncomingSummaryData.length; i++) {
		let rowNumber = (currentIncomingSummaryPage - 1) * incomingSummaryItemsPerPage + i + 1;
		let un = globalIncomingSummaryData[i]
		let statusText = globalIncomingSummaryData[i].INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
		let statusClass = globalIncomingSummaryData[i].INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
		//console.log(`행 ${i}:`, globalIncomingSummaryData[i]); // 각 행 데이터 확인

		let check = '';
		let supplyType = '';
		if (un.CUSTCODE == '0039') {
			check = `<td class = 'checkboxVal'><input type="checkbox" class="incomingSummary_chk ${statusClass}" disabled
			            		data-unique="${un.INDATE}_${un.ITEMCODE}_${un.CUSTCODE}_${un.QTY}_${un.FACTORY}_${un.STORAGE}_${un.IFNO}_${un.INVOICENO}"></td>`
			supplyType = `${i18n.t('search.type.free')}`
		} else {
			check = `<td class = 'checkboxVal'><input type="checkbox" class="incomingSummary_chk ${statusClass}" 
			            		data-unique="${un.INDATE}_${un.ITEMCODE}_${un.CUSTCODE}_${un.QTY}_${un.FACTORY}_${un.STORAGE}_${un.IFNO}_${un.INVOICENO}"></td>`
			supplyType = `${i18n.t('search.type.normal')}`
		}
		tableBody += `
            <tr>
            	${check}
                <td class = 'noVal'>${rowNumber}</td>
                <td class = 'statusVal'><span class="${statusClass}">${statusText}</span></td>
                <td class = 'dateVal'>${globalIncomingSummaryData[i].INDATE || ''}</td>
                <td class = 'dateVal'>${supplyType}</td>
				<td class = 'factoryVal'>${globalIncomingSummaryData[i].FACTORY || ''}</td>
				<td class = 'storageVal'>${globalIncomingSummaryData[i].STORAGE || ''}</td>
				<td class = 'cucodeVal'>${globalIncomingSummaryData[i].CUSTCODE || ''}</td>
				<td class = 'cnameVal'>${globalIncomingSummaryData[i].CNAME || ''}</td>
				<td class = 'carVal'>${globalIncomingSummaryData[i].CAR || ''}</td>
				<td class = 'itemcodeVal'>${globalIncomingSummaryData[i].ITEMCODE || ''}</td>
				<td class = 'itemnameMedVal'>${globalIncomingSummaryData[i].ITEMNAME || ''}</td>
				<td class = 'qtyVal'>${Number(globalIncomingSummaryData[i].QTY || '').toLocaleString()}</td>
				<td class = 'invoiceNoVal'>${globalIncomingSummaryData[i].INVOICENO || ''}</td>
				<td class = 'intfVal'>${globalIncomingSummaryData[i].IFNO || ''}</td>
            </tr>
        `;
	}
	// =
	//console.log("생성된 tableBody:", tableBody);
	$("#incomingSummaryTableBody").html(tableBody);
	$(".incomingSummary_chkAll").prop("checked", false);
}

// 페이지네이션 렌더링
function renderIncomingSummaryPagination() {
	let totalPages = Math.ceil(totalIncomingSummaryCount / incomingSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentIncomingSummaryPage > 1) {
		paginationHtml += `<button class="incomingSummary-page-btn" data-page="${currentIncomingSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="incomingSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentIncomingSummaryPage - 5);
	let endPage = Math.min(totalPages, currentIncomingSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="incomingSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentIncomingSummaryPage) {
			paginationHtml += `<button class="incomingSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="incomingSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="incomingSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentIncomingSummaryPage < totalPages) {
		paginationHtml += `<button class="incomingSummary-page-btn" data-page="${currentIncomingSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="incomingSummary-page-btn disabled">&gt;</button>`;
	}

	$('#incomingSummaryCurrentPageInfo').text(currentIncomingSummaryPage);
	$('#incomingSummaryTotalPageInfo').text(totalPages);
	$("#incomingSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindIncomingSummaryEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.incomingSummary_chkAll').on('change', '.incomingSummary_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.incomingSummary_chk:not(:disabled)').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.incomingSummary_chk').on('change', '.incomingSummary_chk', function() {
		const totalCheckboxes = $('.incomingSummary_chk:not(:disabled)').length; // disabled 제외
		const checkedCheckboxes = $('.incomingSummary_chk:checked:not(:disabled)').length; // disabled 제외
		$('.incomingSummary_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnIncomingSummarySearch").off('click').on('click', function() {
		performIncomingSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnIncomingSummarySearchInit").off('click').on('click', function() {
		resetIncomingSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.incomingSummary-page-btn').on('click', '.incomingSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentIncomingSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performIncomingSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_incoming_summary input[type="text"], #view_m2_incoming_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performIncomingSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		inboundCondition: $("#incomingSummary_searchVal_condition").val(),
		fromDate: $("#incomingSummary_searchVal_fromDate").val(),
		toDate: $("#incomingSummary_searchVal_toDate").val(),
		supplytype: $("#incomingSummary_searchVal_supplytype").val(),
		factory: $("#incomingSummary_searchVal_factory").val(),
		storage: $("#incomingSummary_searchVal_storage").val(),
		cucode: $("#incomingSummary_searchVal_cucode").val().trim().toUpperCase(),
		cname: $("#incomingSummary_searchVal_cname").val().trim().toUpperCase(),
		car: $("#incomingSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#incomingSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#incomingSummary_searchVal_itemname").val().trim().toUpperCase(),
		invoice_no: $("#incomingSummary_searchVal_invoice_no").val().trim().toUpperCase()
	};
}
// =
// 검색 수행 함수 - DB 조회
function performIncomingSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentIncomingSummaryPage = 1;
	performIncomingSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetIncomingSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const factory = getCookie('selectedFactory');

	$("#incomingSummary_searchVal_fromDate").val(fromDate);
	$("#incomingSummary_searchVal_toDate").val(toDate);
	$("#incomingSummary_searchVal_factory").val(factory);
	$("#incomingSummary_searchVal_storage").val('Material');
	$("#incomingSummary_searchVal_cucode").val('');
	$("#incomingSummary_searchVal_cname").val('');
	$("#incomingSummary_searchVal_car").val('');
	$("#incomingSummary_searchVal_itemcode").val('');
	$("#incomingSummary_searchVal_itemname").val('');
	$("#incomingSummary_searchVal_invoice_no").val('');

	// =
	// 초기화 후 전체 데이터 다시 조회
	currentIncomingSummaryPage = 1;
	performIncomingSummaryDBSearch({ fromDate, toDate, factory });

	console.log('검색 조건이 초기화되었습니다.');
}

// 날짜 형식 변환 함수들
function formatDateToYYYYMMDD(dateStr) {
	if (!dateStr) return '';
	return dateStr.replace(/-/g, '');
}

function formatDateFromYYYYMMDD(dateStr) {
	if (!dateStr || dateStr.length !== 8) return '';
	return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
}

// 유틸리티 함수들
window.changeIncomingSummaryItemsPerPage = function(newItemsPerPage) {
	incomingSummaryItemsPerPage = newItemsPerPage;
	currentIncomingSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performIncomingSummaryDBSearch(searchCriteria);
}

window.exportIncomingSummaryData = function() {
	return {
		total: globalIncomingSummaryData.length,
		currentPage: currentIncomingSummaryPage,
		itemsPerPage: incomingSummaryItemsPerPage,
		data: globalIncomingSummaryData
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


window.downloadAllIncomingSummaryData = function() {
	let searchCriteria = getCurrentSearchCriteria();
	// =

	showLoading("export");

	$.ajax({
		url: "/read_incomingListSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
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
			ExcelExporter.downloadExcel(processedData, window.incomingSummaryColumns, {
				fileName: 'IncomingSummary_All',
				sheetName: 'IncomingSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

//공급사 업데이트
$(document).on("click", "#incomingSummaryChangeBtn", function() {
	if ($(".incomingSummary_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	const iidList = [];
	$(".incomingSummary_chk:checked").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	data = {
		iidList: iidList,
		supplier: $("#incomingSummarySupplier").val()
	}
	
	if (confirm("Do you want to register the supplier?")) {
		showLoading("data");
		$.ajax({
			url: "/incommingSupplierUpdate",
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			success: function(data) {
				console.log("-- Supplier update --");
				console.log(data);
				$(".btnIncomingSummarySearch").trigger("click");
				hideLoading();
			},
			error: function(xhr, status, error) {
				console.error("DB 조회 실패:", error);
				hideLoading();
				alert("Fail");
			}
		});
	}
});

$(document).on("click", ".btnIntfIncomingSummary", function() {

	if ($(".incomingSummary_chk.status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	let hasUndefined = false;

	const iidList = [];
	$(".incomingSummary_chk:checked").each(function() {
		let iid = $(this).data('unique');
		if (!iid || iid.split("_")[2] === 'undefined') {
			alert("Supplier Code is Empty");
			hasUndefined = true;
			return false; // 🔹 each 반복 중단
		}
		iidList.push(iid);
	});

	// 하나라도 undefined면 전체 중단
	if (hasUndefined) return;

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	showLoading("data");

	console.log("체크하기")
	console.log(iidList)
	
	return;
	$.ajax({
		url: "/inbound_confirm_summary",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let msg = [];
			if (data.magamCnt > 0) msg.push(`closed: ${data.magamCnt} case(s)`);
			if (data.lockCnt > 0) msg.push(`lock: ${data.lockCnt} case(s)`);
			if (msg.length > 0) {
				alert("The following items were not processed:\n" + msg.join("\n"));
			} else {

			}
			let searchVal = getCurrentSearchCriteria();
			performIncomingSummaryDBSearch(searchVal);

			// 전체 선택 해제
			$('.incomingSummary_chkAll').prop('checked', false);

		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			hideLoading();
			alert("오류가 발생했습니다: " + error);
		}
	});

});

$(document).on("click", ".btnIntfIncomingSummaryDelete", function() {

	if ($(".incomingSummary_chk.status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	let hasUndefined = false;

	const iidList = [];
	$(".incomingSummary_chk:checked").each(function() {
		let iid = $(this).data('unique');
		if (!iid || iid.split("_")[2] === 'undefined') {
			alert("Supplier Code is Empty");
			hasUndefined = true;
			return false; // 🔹 each 반복 중단
		}
		iidList.push(iid);
	});

	// 하나라도 undefined면 전체 중단
	if (hasUndefined) return;

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
		url: "/inbound_confirm_summary_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let msg = [];

			if (data.magamCnt > 0) msg.push(`closed: ${data.magamCnt} case(s)`);
			if (data.lockCnt > 0) msg.push(`lock: ${data.lockCnt} case(s)`);
			if (data.buyCnt > 0) msg.push(`Purchase confirmed: ${data.buyCnt} case(s)`);
			if (data.laterCnt > 0) msg.push(`Post-processing done: ${data.laterCnt} case(s)`);
			if (data.noExistCnt > 0) msg.push(`No deletable records: ${data.noExistCnt} case(s)`);

			if (msg.length > 0) {
				alert("The following items were not processed:\n" + msg.join("\n"));
			} else {

			}
			let searchVal = getCurrentSearchCriteria();
			performIncomingSummaryDBSearch(searchVal);

			// 전체 선택 해제
			$('.incomingSummary_chkAll').prop('checked', false);
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
*/