/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m3_production_detail 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : productionDetail -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : ProductionDetail -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

/*let globalProductionDetailData = []; // 현재 조회된 데이터 저장
let currentProductionDetailPage = 1; // 현재 페이지
let productionDetailItemsPerPage = 1000; // 페이지당 항목 수
let totalProductionDetailCount = 0; // 서버에서 받은 총 개수 저장
let totalProductionDetailQty = 0; // 서버에서 받은 총 개수 저장
let totalProductionDetailPages = 0; // 서버에서 받은 총 페이지
let totalProductionDetailTotalPages = 0; // 서버에서 받은 총 페이지 수
window.filteredProductionDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
window.productionDetailColumns = [
	{ key: 'SDATE', header: 'Date' },				// INDATE or OUTDATE or SDATE로 변경
	{ key: 'FACTORY', header: 'Factory' },
	/*{ key: 'STORAGE', header: 'Storage' },*/
	/*{ key: 'CAR', header: 'Car' },
	{ key: 'ITEMCODE', header: 'Item Code' },
	{ key: 'ITEMNAME', header: 'Item Name' },
	{ key: 'QTY', header: 'Qty' },
	{ key: 'LOGINID', header: 'User' },
	{ key: 'HHMM', header: 'Time' },
	{ key: 'BARCODE', header: 'Barcode' }
];

$(document).ready(function() {
	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m3_production_detail = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performProductionDetailDBSearch({ fromDate, toDate, factory });
	}
});

// DB에서 데이터 조회하는 함수
function performProductionDetailDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_productionDetail",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentProductionDetailPage,
			itemsPerPage: productionDetailItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalProductionDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalProductionDetailCount = data.totalCount || 0;
			totalProductionDetailQty = data.totalQty || 0;
			totalProductionDetailPages = data.totalPages || 0;
			currentProductionDetailPage = data.currentPage || 0;
			window.filteredProductionDetailData = globalProductionDetailData;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_m3_production_detail').length) {
				renderProductionDetailView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderProductionDetailTableData();
				renderProductionDetailPagination();
				updateProductionDetailTotalCount();
				updateProductionDetailTotalQty();
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
function renderProductionDetailView() {
	let content_output = `
		<div class="divBlockControl" id="view_m3_production_detail">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-label">
							<div class="productionDetail_searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
							<input type="date" id="productionDetail_searchVal_fromDate"/> 
						</div>
						<div class="search-label">
							<div class="productionDetail_searchVal_toDate">　</div>
							<input type="date" id="productionDetail_searchVal_toDate"/>
						</div>
						<div class="search-label">
							<div class="productionDetail_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
							<select id="productionDetail_searchVal_factory" class="factory-select">
								<option value="SALTILLO">Saltillo</option>
								<option value="PUEBLA">Puebla</option>
								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
							</select>
						</div>
						<div class="search-label">
							<div class="productionDetail_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
							<input type="text" id="productionDetail_searchVal_car" />
						</div>
						<div class="search-label">
							<div class="productionDetail_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
							<input type="text" id="productionDetail_searchVal_itemcode" />
						</div>
						<div class="search-label">
							<div class="productionDetail_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
							<input type="text" id="productionDetail_searchVal_itemname" />
						</div>
					</div>
					<div class="search_button_area">
						<button class="btn btn-primary btnProductionDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
						<button class="btn btn-secondary btnProductionDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
						<span>${i18n.t('table.info.total')} <strong id="productionDetailTotalCount">${totalProductionDetailCount}</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="productionDetailCurrentPageInfo">${currentProductionDetailPage}</strong>/<strong id="productionDetailTotalPageInfo">${totalProductionDetailPages}</strong> |
							${i18n.t('table.info.qty')} : <strong id = "productionDetailTotalQty"></strong> 
						</span>
						<div class="action-buttons-right m3_production_detail">
							<div id="defaultActions" class="action-group">
								<!-- <input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnProductionDetailDelete"/> -->
								<button class="btn btn-success" id="productionDetailExcelBtn" onclick="downloadAllProductionDetailData()">Excel</button>
							</div>
						</div>
					</div>
					<table class="data-table m3_production_detail">
						<thead>
							<tr>
								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
								<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
								<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
								<th class = "loginidVal">${i18n.t('search.user')}<!-- USER --></th>
								<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>
								<th class = "hhmmVal">${i18n.t('table.lineno')}<!-- LINENO --></th>
								<th class = "hhmmVal">${i18n.t('search.wccode')}<!-- WORKPLACE --></th>
								<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- LOT --></th>
							</tr>
						</thead>
						<tbody id="productionDetailTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="productionDetailPaginationContainer">
					</div>
				</div>
			</div>
		</div>
	`;
	/*								<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>*/
	// = 위에 data-table, search-row i18n 부분 추가
	/*<button class="btn btn-success" id="productionDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionDetailData, productionDetailColumns, {fileName:'ProductionDetail', sheetName:'ProductionDetail'})">Excel</button>*/

	/*
	<!-- <div class="search-label">
							<div class="productionDetail_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
							<select id="productionDetail_searchVal_storage" >
								<!-- 동적으로 추가 -->
							</select>
						</div> -->
	
	*/


	/*$(".w_contentArea").append(content_output);

	// ⬇️ 추가: 화면에 기본 날짜 세팅
	(function() {
		const { fromDate, toDate } = getDefaultDateRange();
		$("#productionDetail_searchVal_fromDate").val(fromDate);
		$("#productionDetail_searchVal_toDate").val(toDate);
	})();

	// 공장 및 창고 선택
	renderFactoryStorage();
	// 테이블 데이터 렌더링
	renderProductionDetailTableData();
	// 페이지네이션 렌더링
	renderProductionDetailPagination();
	// 이벤트 바인딩
	bindProductionDetailEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateProductionDetailTotalCount();
	// 초기 렌더링 후 수량 업데이트
	updateProductionDetailTotalQty();
}

// 공장 및 창고 선택 함수
function renderFactoryStorage() {
	const factory = $('#productionDetail_searchVal_factory');
	const storage = $('#productionDetail_searchVal_storage');
	const savedFactory = getCookie('selectedFactory');

	// 공장별 창고 옵션 설정
	function updateStorageOptions(factoryValue) {
		storage.empty();

		const options = {
			'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'all'],
			'PUEBLA': ['PRODUCT', 'Material', 'all'],
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
function updateProductionDetailTotalCount() {
	$('#productionDetailTotalCount').text(totalProductionDetailCount.toLocaleString());
}
// 총 개수를 업데이트하는 함수
function updateProductionDetailTotalQty() {
	$('#productionDetailTotalQty').text(totalProductionDetailQty.toLocaleString());
}

function renderProductionDetailTableData() {
	let tableBody = "";

	//console.log("globalProductionDetailData:", globalProductionDetailData);
	//console.log("데이터 개수:", globalProductionDetailData.length);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalProductionDetailData.length; i++) {
		let rowNumber = (currentProductionDetailPage - 1) * productionDetailItemsPerPage + i + 1;
		let data = globalProductionDetailData[i];

		//console.log(`행 ${i}:`, data); // 각 행 데이터 확인

		tableBody += `
        <tr>
            <td class = "noVal">${rowNumber}</td>
		    <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
		    <td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
		    <td class = "carVal">${data.CAR || data.car || ''}</td>
		    <td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
		    <td class = "itemnameMedVal">${data.ITEMNAME || data.itemname || ''}</td>
		    <td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
			<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td>
			<td class = "hhmmVal">${data.TIME || data.time || ''}</td>
			<td class = "hhmmVal">${data.LINENO || data.lineno || ''}</td>
			<td class = "hhmmVal">${data.WORKPLACE || data.workplace || ''}</td>
			<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
        </tr>
    `;
	}
	// =
	/*		    <td class = "storageVal">${data.STORAGE || data.storage || ''}</td>*/
	//console.log("생성된 tableBody:", tableBody);
	/*$("#productionDetailTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderProductionDetailPagination() {
	let totalPages = Math.ceil(totalProductionDetailCount / productionDetailItemsPerPage); // 변경
	let paginationHtml = "";

	// 이전 버튼
	if (currentProductionDetailPage > 1) {
		paginationHtml += `<button class="productionDetail-page-btn" data-page="${currentProductionDetailPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="productionDetail-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentProductionDetailPage - 5);
	let endPage = Math.min(totalPages, currentProductionDetailPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="productionDetail-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentProductionDetailPage) {
			paginationHtml += `<button class="productionDetail-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="productionDetail-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="productionDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentProductionDetailPage < totalPages) {
		paginationHtml += `<button class="productionDetail-page-btn" data-page="${currentProductionDetailPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="productionDetail-page-btn disabled">&gt;</button>`;
	}

	$('#productionDetailTotalPageInfo').text(totalPages);
	$("#productionDetailPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindProductionDetailEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnProductionDetailSearch").off('click').on('click', function() {
		performProductionDetailSearch();
	});

	// 초기화 버튼 클릭
	$(".btnProductionDetailSearchInit").off('click').on('click', function() {
		resetProductionDetailSearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.productionDetail-page-btn').on('click', '.productionDetail-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentProductionDetailPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performProductionDetailDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_m3_production_detail input[type="text"], #view_m3_production_detail input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performProductionDetailSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		fromDate: $("#productionDetail_searchVal_fromDate").val(),
		toDate: $("#productionDetail_searchVal_toDate").val(),
		factory: $("#productionDetail_searchVal_factory").val(),
		storage: $("#productionDetail_searchVal_storage").val(),
		car: $("#productionDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#productionDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#productionDetail_searchVal_itemname").val().trim().toUpperCase()
	};
}
// =
// 검색 수행 함수 - DB 조회
function performProductionDetailSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentProductionDetailPage = 1;
	performProductionDetailDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetProductionDetailSearch() {
	// 날짜 지정
	const { fromDate, toDate } = getDefaultDateRange();

	// 공장, 창고, 작업장 초기화
	renderFactoryStorage();

	$("#productionDetail_searchVal_fromDate").val(fromDate);
	$("#productionDetail_searchVal_toDate").val(toDate);
	$("#productionDetail_searchVal_car").val('');
	$("#productionDetail_searchVal_itemcode").val('');
	$("#productionDetail_searchVal_itemname").val('');

	// =
	// 초기화 후 전체 데이터 다시 조회
	currentProductionDetailPage = 1;
	performProductionDetailDBSearch({});

	console.log('검색 조건이 초기화되었습니다.');
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

// 유틸리티 함수들
window.changeProductionDetailItemsPerPage = function(newItemsPerPage) {
	productionDetailItemsPerPage = newItemsPerPage;
	currentProductionDetailPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performProductionDetailDBSearch(searchCriteria);
}

window.exportProductionDetailData = function() {
	return {
		total: globalProductionDetailData.length,
		currentPage: currentProductionDetailPage,
		itemsPerPage: productionDetailItemsPerPage,
		data: globalProductionDetailData
	};
}

window.downloadAllProductionDetailData = function() {
	let searchCriteria = getCurrentSearchCriteria();

	showLoading("export");

	$.ajax({
		url: "/read_productionDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionDetailColumns, {
				fileName: 'ProductionDetail_All',
				sheetName: 'ProductionDetail'
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
$(document).on("click", ".btnProductionDetailDelete", function() {
	if ($(".productionDetail_chk status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items.delete'));
		// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
		return;
	}

	if (!confirm(i18n.t('confirmation.items.delete'))) {
		return;
	}

	const iidList = [];
	$(".productionDetail_chk:checked").each(function() {
		let iid = $(this).data('delete');
		iidList.push(iid);
	});

	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	showLoading("data");

	const loginid = getCookie("userLoginId");

	console.log(iidList)
	$.ajax({
		url: "/deleteProductionDetail",
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
			performProductionDetailDBSearch(searchVal);

			// 전체 선택 해제
			$('.productionDetail_chkAll').prop('checked', false);
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



// 인터페이스 등록
$(document).on("click", ".btnIntfProductionDetail", function() {
	if ($(".productionDetail_chk status-completed:checked").length > 0) {
		alert(i18n.t('validation.confirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	const iidList = [];
	$(".productionDetail_chk:checked").each(function() {
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
		url: "/productionDetail_confirm",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performProductionDetailDBSearch(searchVal);

			// 전체 선택 해제
			$('.productionDetail_chkAll').prop('checked', false);
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

// 인터페이스 삭제
$(document).on("click", ".btnIntfProductionDetailDelete", function() {
	if ($(".productionDetail_chk status-waiting:checked").length > 0) {
		alert(i18n.t('validation.unconfirm.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}


	const iidList = [];
	$(".productionDetail_chk:checked").each(function() {
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
		url: "/productionDetail_confirm_cancel",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			let searchVal = getCurrentSearchCriteria();
			performProductionDetailDBSearch(searchVal);

			// 전체 선택 해제
			$('.productionDetail_chkAll').prop('checked', false);
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

