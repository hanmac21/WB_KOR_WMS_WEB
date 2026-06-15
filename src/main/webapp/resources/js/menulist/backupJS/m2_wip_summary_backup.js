/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_wip_summary 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : wipSummary -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : WipSummary -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */
/*let globalWipSummaryData = []; // 현재 조회된 데이터 저장
let currentWipSummaryPage = 1; // 현재 페이지
let wipSummaryItemsPerPage = 1000; // 페이지당 항목 수
let totalWipSummaryCount = 0; // 서버에서 받은 총 개수 저장
let totalWipSummaryQty = 0; // 서버에서 받은 총 개수 저장
let totalWipSummaryPages = 0; // 서버에서 받은 총 페이지

$(document).ready(function() {

	window.filteredWipSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.wipSummaryColumns = [
		{ header: 'INDATE', key: 'INDATE' },
		{ header: 'FACTORY', key: 'FACTORY' },
		{ header: 'STORAGE', key: 'STORAGE' },
		{ header: 'CAR', key: 'CAR' },
		{ header: 'ITEMCODE', key: 'ITEMCODE' },
		{ header: 'ITEMNAME', key: 'ITEMNAME' },
		{ header: 'QTY', key: 'QTY' },
		{ header: 'WCCODE', key: 'WCCODE' }
		//{ header: 'YMDHMS', key: 'YMDHMS' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_wip_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performWipSummaryDBSearch({ fromDate, toDate, factory });
	}
});

// DB에서 데이터 조회하는 함수
function performWipSummaryDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_wipSummary",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentWipSummaryPage,
			itemsPerPage: wipSummaryItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalWipSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalWipSummaryCount = data.totalCount || 0;
			totalWipSummaryQty = data.totalQty || 0;
			totalWipSummaryPages = data.totalPages || 0;
			currentWipSummaryPage = data.currentPage || 0;
			window.filteredWipSummaryData = globalWipSummaryData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m2_wip_summary').length) {
				renderWipSummaryView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderWipSummaryTableData();
				renderWipSummaryPagination();
				updateWipSummaryTotalCount();
				updateWipSummaryTotalQty();
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

// 사용자 뷰 렌더링 함수
function renderWipSummaryView() {
	let content_output = `
			<div class="divBlockControl" id="view_m2_wip_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<!--<div class="search-label">
								<div class="searchVal_condition">${i18n.t('search.input.status')} 불출상태 </div>
								<select id="wipSummary_searchVal_condition" >
									<option value="">${i18n.t('search.all')} 전체</option>
									<option value="N">${i18n.t('search.input.waiting')} 불출 대기중 </option>
									<option value="Y">${i18n.t('search.input.completed')} 불출 완료 </option>
								</select>
							</div>-->
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="wipSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="wipSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="wipSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="wipSummary_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_wccode">${i18n.t('search.wccode')}<!-- WCCODE --></div>
								<select id="wipSummary_searchVal_wccode" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="wipSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="wipSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="wipSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnWipSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnWipSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="wipSummaryTotalCount">${totalWipSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="wipSummaryCurrentPageInfo">${currentWipSummaryPage}</strong>/<strong id="wipSummaryTotalPageInfo">${totalWipSummaryPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "wipSummaryTotalQty"></strong>
							</span>
							<div class="action-buttons-right m2_wip_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="wipSummaryExcelBtn" onclick="downloadAllWipSummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_wip_summary">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<!--<th class = "statusVal">${i18n.t('table.status')} STATUS </th>	-->									
									<th class = "dateVal">${i18n.t('search.date')}<!-- INDATE --></th>										
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "wccodeVal">${i18n.t('search.wccode')}<!-- WCCODE --></th>
								</tr>
							</thead>
							<tbody id="wipSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="wipSummaryPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
	// = 위에 data-table, search-row i18n 부분 추가
	/*<button class="btn btn-success" id="wipSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredWipSummaryData, wipSummaryColumns, {fileName:'WipSummary', sheetName:'WipSummary'})">Excel</button>*/
	
	/* 250925 미사용 컬럼 정리 */
	/*
		<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
									<th>Ifno<!-- wmskey --></th>
		
		<td>${globalWipSummaryData[i].LAST_YMDHMS || ''}</td>
				<td>${globalWipSummaryData[i].WMS_KEY || ''}</td>
	*/
	
	/*$(".w_contentArea").append(content_output);

	// ⬇️ 추가: 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#wipSummary_searchVal_fromDate").val(fromDate);
		$("#wipSummary_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderWipSummaryTableData();
	// 페이지네이션 렌더링
	renderWipSummaryPagination();
	// 이벤트 바인딩
	bindWipSummaryEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateWipSummaryTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateWipSummaryTotalQty();

}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#wipSummary_searchVal_factory');
	const storage = $('#wipSummary_searchVal_storage');
	const wccode = $('#wipSummary_searchVal_wccode');
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

	// 공장 변경 시 창고, 작업장 업데이트
	factory.on('change', function() {
		updateStorageOptions($(this).val());
		updateWccodeOptions($(this).val());
	});
}

// 정규식으로 쿠기 가져오기
function getCookie(cookieName) {
	const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	return match ? decodeURIComponent(match[2]) : '';
}


// 총 개수를 업데이트하는 함수
function updateWipSummaryTotalCount() {
	$('#wipSummaryTotalCount').text(totalWipSummaryCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateWipSummaryTotalQty() {
	$('#wipSummaryTotalQty').text(totalWipSummaryQty.toLocaleString());
}
function renderWipSummaryTableData() {
	let tableBody = "";

	//console.log("globalWipSummaryData:", globalWipSummaryData);
	//console.log("데이터 개수:", globalWipSummaryData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalWipSummaryData.length; i++) {
		let rowNumber = (currentWipSummaryPage - 1) * wipSummaryItemsPerPage + i + 1;
		//console.log(`행 ${i}:`, globalWipSummaryData[i]); // 각 행 데이터 확인

		tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "dateVal">${globalWipSummaryData[i].INDATE || ''}</td>
				<td class = "factoryVal">${globalWipSummaryData[i].FACTORY || ''}</td>
				<td class = "storageVal">${globalWipSummaryData[i].STORAGE || ''}</td>
				<td class = "carVal">${globalWipSummaryData[i].CAR || ''}</td>
				<td class = "itemcodeVal">${globalWipSummaryData[i].ITEMCODE || ''}</td>
				<td class = "itemnameVal">${globalWipSummaryData[i].ITEMNAME || ''}</td>
				<td class = "qtyVal">${Number(globalWipSummaryData[i].QTY || 0).toLocaleString()}</td>
				<td class = "wccodeVal">${globalWipSummaryData[i].WCCODE || ''}</td>
            </tr>
        `;
	}
	// =
	//console.log("생성된 tableBody:", tableBody);
	$("#wipSummaryTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderWipSummaryPagination() {
	let totalPages = Math.ceil(totalWipSummaryCount / wipSummaryItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentWipSummaryPage > 1) {
		paginationHtml += `<button class="wipSummary-page-btn" data-page="${currentWipSummaryPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="wipSummary-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentWipSummaryPage - 5);
	let endPage = Math.min(totalPages, currentWipSummaryPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="wipSummary-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentWipSummaryPage) {
			paginationHtml += `<button class="wipSummary-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="wipSummary-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="wipSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentWipSummaryPage < totalPages) {
		paginationHtml += `<button class="wipSummary-page-btn" data-page="${currentWipSummaryPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="wipSummary-page-btn disabled">&gt;</button>`;
	}

	$('#wipSummaryCurrentPageInfo').text(currentWipSummaryPage);
	$('#wipSummaryTotalPageInfo').text(totalPages);
	$("#wipSummaryPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindWipSummaryEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnWipSummarySearch").off('click').on('click', function() {
		performWipSummarySearch();
	});

	// 초기화 버튼 클릭
	$(".btnWipSummarySearchInit").off('click').on('click', function() {
		resetWipSummarySearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.wipSummary-page-btn').on('click', '.wipSummary-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentWipSummaryPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performWipSummaryDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m2_wip_summary input[type="text"], #view_m2_wip_summary input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performWipSummarySearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		fromDate: $("#wipSummary_searchVal_fromDate").val(),
		toDate: $("#wipSummary_searchVal_toDate").val(),
		factory : $("#wipSummary_searchVal_factory").val(),
		storage: $("#wipSummary_searchVal_storage").val(),
		wccode: $("#wipSummary_searchVal_wccode").val(),
		car: $("#wipSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#wipSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#wipSummary_searchVal_itemname").val().trim().toUpperCase()
	};
}
// =
// 검색 수행 함수 - DB 조회
function performWipSummarySearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentWipSummaryPage = 1;
	performWipSummaryDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetWipSummarySearch() {
	const { fromDate, toDate } = getDefaultDateRange();
	const factory = getCookie('selectedFactory');

	$("#wipSummary_searchVal_fromDate").val(fromDate);
	$("#wipSummary_searchVal_toDate").val(toDate);
	$("#wipSummary_searchVal_cucode").val('');
	$("#wipSummary_searchVal_car").val('');
	$("#wipSummary_searchVal_itemcode").val('');
	$("#wipSummary_searchVal_itemname").val('');

	// 공장, 창고, 작업장 초기화
	renderFactoryStorage();
	
	// =
	// 초기화 후 전체 데이터 다시 조회
	currentWipSummaryPage = 1;
	performWipSummaryDBSearch({ fromDate, toDate, factory });

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
window.changeWipSummaryItemsPerPage = function(newItemsPerPage) {
	wipSummaryItemsPerPage = newItemsPerPage;
	currentWipSummaryPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performWipSummaryDBSearch(searchCriteria);
}

window.exportWipSummaryData = function() {
	return {
		total: globalWipSummaryData.length,
		currentPage: currentWipSummaryPage,
		itemsPerPage: wipSummaryItemsPerPage,
		data: globalWipSummaryData
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


window.downloadAllWipSummaryData = function() {
	let searchCriteria = getCurrentSearchCriteria();
	// =

	showLoading("export");

	$.ajax({
		url: "/read_wip_summary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.wipSummaryColumns, {
				fileName: 'WipSummary_All',
				sheetName: 'WipSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

/*$(document).on("click", ".btnIntfWipSummary", function() {

	if ($(".status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	const iidList = [];
	$(".wipSummary_chk:checked").each(function() {
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
			performWipSummaryDBSearch(searchVal);
			
			// 전체 선택 해제
			$('.wipSummary_chkAll').prop('checked', false);
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

$(document).on("click", ".btnIntfWipSummaryDelete", function() {

	if ($(".status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}


	const iidList = [];
	$(".wipSummary_chk:checked").each(function() {
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
			performWipSummaryDBSearch(searchVal);
			
			// 전체 선택 해제
			$('.wipSummary_chkAll').prop('checked', false);
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
		}
	});

});*/
