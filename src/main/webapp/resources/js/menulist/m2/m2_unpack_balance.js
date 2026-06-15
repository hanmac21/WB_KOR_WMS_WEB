/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_unpack_balance 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : unpackBalance -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : UnpackBalance -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalUnpackBalanceData = []; // 현재 조회된 데이터 저장
	let currentUnpackBalancePage = 1; // 현재 페이지
	let unpackBalanceItemsPerPage = 1000; // 페이지당 항목 수
	let totalUnpackBalanceCount = 0; // 서버에서 받은 총 개수 저장
	let totalUnpackBalanceQty = 0; // 서버에서 받은 총 개수 저장
	let totalUnpackBalancePages = 0; // 서버에서 받은 총 페이지
	window.filteredUnpackBalanceData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.unpackBalanceColumns = [
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'UNPACKED_QTY', header: 'unpacked qty' },
		{ key: 'DIFF_QTY', header: 'remain qty' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 날짜, 공장으로 조회
	window.call_m2_unpack_balance = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performUnpackBalanceDBSearch({ fromDate, toDate, factory });
	}

	// DB에서 데이터 조회하는 함수
	function performUnpackBalanceDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_unpackBalance",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentUnpackBalancePage,
				itemsPerPage: unpackBalanceItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalUnpackBalanceData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalUnpackBalanceCount = data.totalCount || 0;
				totalUnpackBalanceQty = data.totalQty || 0;
				totalUnpackBalancePages = data.totalPages || 0;
				currentUnpackBalancePage = data.currentPage || 0;
				window.filteredUnpackBalanceData = globalUnpackBalanceData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_unpack_balance').length) {
					renderUnpackBalanceView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderUnpackBalanceTableData();
					renderUnpackBalancePagination();
					updateUnpackBalanceTotalCount();
					updateUnpackBalanceTotalQty();
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
	function renderUnpackBalanceView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_unpack_balance">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="unpackBalance_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="unpackBalance_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="unpackBalance_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="unpackBalance_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label" style ="width: 30%;">
								<div class="searchVal_barcode">${i18n.t('search.barcode')}</div>
								<input type="text" id="unpackBalance_searchVal_barcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="unpackBalance_searchVal_itemcode" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnUnpackBalanceSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnUnpackBalanceSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="unpackBalanceTotalCount">${totalUnpackBalanceCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="unpackBalanceCurrentPageInfo">${currentUnpackBalancePage}</strong>/<strong id="unpackBalanceTotalPageInfo">${totalUnpackBalancePages}</strong>
							</span>
							<div class="action-buttons-right m2_unpack_balance">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="unpackBalanceExcelBtn" onclick="downloadAllUnpackBalanceData()">Excel</button>
								</div> 
							</div>
						</div>
						<table class="data-table m2_unpack_balance">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "barcodeVal">${i18n.t('table.lot')}<!-- BARCODE --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "scanqtyVal">${i18n.t('search.qty.unpacked')}<!-- Unpacked QTY --></th>
									<th class = "scanqtyVal">${i18n.t('search.qty.remain')}<!-- REMAIN QTY --></th>
								</tr>
							</thead>
							<tbody id="unpackBalanceTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="unpackBalancePaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		// = 위에 data-table, search-row i18n 부분 추가
		/*<button class="btn btn-success" id="unpackBalanceExcelBtn" onclick="ExcelExporter.downloadExcel(filteredUnpackBalanceData, unpackBalanceColumns, {fileName:'UnpackBalance', sheetName:'UnpackBalance'})">Excel</button>*/
		
		/*
		 | 
								${i18n.t('table.info.qty')} : <strong id = "unpackBalanceTotalQty"></strong>
		*/
		$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#unpackBalance_searchVal_fromDate").val(fromDate);
			$("#unpackBalance_searchVal_toDate").val(toDate);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderUnpackBalanceTableData();
		// 페이지네이션 렌더링
		renderUnpackBalancePagination();
		// 이벤트 바인딩
		bindUnpackBalanceEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateUnpackBalanceTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateUnpackBalanceTotalQty();

	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const factory = $('#unpackBalance_searchVal_factory');
		const storage = $('#unpackBalance_searchVal_storage');
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
		
		window.autoSetStorageFields();
	}

	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// 총 개수를 업데이트하는 함수
	function updateUnpackBalanceTotalCount() {
		$('#unpackBalanceTotalCount').text(totalUnpackBalanceCount);
	}
	// 총 개수를 업데이트하는 함수
	function updateUnpackBalanceTotalQty() {
		$('#unpackBalanceTotalQty').text(totalUnpackBalanceQty.toLocaleString());
	}
	function renderUnpackBalanceTableData() {
		let tableBody = "";

		//console.log("globalUnpackBalanceData:", globalUnpackBalanceData);
		//console.log("데이터 개수:", globalUnpackBalanceData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalUnpackBalanceData.length; i++) {
			let rowNumber = (currentUnpackBalancePage - 1) * unpackBalanceItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalUnpackBalanceData[i]); // 각 행 데이터 확인

			let remainingQty = (globalUnpackBalanceData[i].QTY || globalUnpackBalanceData[i].qty || 0) -
				(globalUnpackBalanceData[i].SCANQTY || globalUnpackBalanceData[i].scanqty || 0);

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "factoryVal">${globalUnpackBalanceData[i].FACTORY || globalUnpackBalanceData[i].factory || ''}</td>
				<td class = "storageVal">${globalUnpackBalanceData[i].STORAGE || globalUnpackBalanceData[i].storage || ''}</td>
                <td class = "dateVal">${globalUnpackBalanceData[i].SDATE || globalUnpackBalanceData[i].sdate || ''}</td>
				<td class = "barcodeVal">${globalUnpackBalanceData[i].BARCODE || globalUnpackBalanceData[i].barcode || ''}</td>
				<td class = "itemcodeVal">${globalUnpackBalanceData[i].ITEMCODE || globalUnpackBalanceData[i].itemcode || ''}</td>
				<td class = "qtyVal">${Number(globalUnpackBalanceData[i].QTY || globalUnpackBalanceData[i].qty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackBalanceData[i].UNPACKED_QTY || globalUnpackBalanceData[i].unpacked_qty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackBalanceData[i].DIFF_QTY || globalUnpackBalanceData[i].diff_qty || 0).toLocaleString()}</td>
            </tr>
        `;
		}
		// =
		//console.log("생성된 tableBody:", tableBody);
		$("#unpackBalanceTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderUnpackBalancePagination() {
		let totalPages = Math.ceil(totalUnpackBalanceCount / unpackBalanceItemsPerPage); // 변경
		let paginationHtml = "";

		console.log(unpackBalanceItemsPerPage);
		console.log(totalPages);

		// 이전 버튼
		if (currentUnpackBalancePage > 1) {
			paginationHtml += `<button class="unpackBalance-page-btn" data-page="${currentUnpackBalancePage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="unpackBalance-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentUnpackBalancePage - 5);
		let endPage = Math.min(totalPages, currentUnpackBalancePage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="unpackBalance-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentUnpackBalancePage) {
				paginationHtml += `<button class="unpackBalance-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="unpackBalance-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="unpackBalance-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentUnpackBalancePage < totalPages) {
			paginationHtml += `<button class="unpackBalance-page-btn" data-page="${currentUnpackBalancePage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="unpackBalance-page-btn disabled">&gt;</button>`;
		}

		$('#unpackBalanceCurrentPageInfo').text(currentUnpackBalancePage);
		$('#unpackBalanceTotalPageInfo').text(totalPages);
		$("#unpackBalancePaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindUnpackBalanceEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnUnpackBalanceSearch").off('click').on('click', function() {
			performUnpackBalanceSearch();
		});

		// 초기화 버튼 클릭
		$(".btnUnpackBalanceSearchInit").off('click').on('click', function() {
			resetUnpackBalanceSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.unpackBalance-page-btn').on('click', '.unpackBalance-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentUnpackBalancePage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performUnpackBalanceDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_unpack_balance input[type="text"], #view_m2_unpack_balance input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performUnpackBalanceSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#unpackBalance_searchVal_fromDate").val(),
			toDate: $("#unpackBalance_searchVal_toDate").val(),
			factory: $("#unpackBalance_searchVal_factory").val().trim(),
			storage: $("#unpackBalance_searchVal_storage").val().trim(),
			barcode: $("#unpackBalance_searchVal_barcode").val().trim(),
			itemcode: $("#unpackBalance_searchVal_itemcode").val().trim().toUpperCase()
		};
	}
	// 검색 수행 함수 - DB 조회
	function performUnpackBalanceSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentUnpackBalancePage = 1;
		performUnpackBalanceDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetUnpackBalanceSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		$("#unpackBalance_searchVal_fromDate").val(fromDate);
		$("#unpackBalance_searchVal_toDate").val(toDate);
		$("#unpackBalance_searchVal_factory").val(factory);
		$("#unpackBalance_searchVal_storage").val('Material');
		$("#unpackBalance_searchVal_barcode").val('');
		$("#unpackBalance_searchVal_itemcode").val('');
		// =
		// 초기화 후 전체 데이터 다시 조회
		currentUnpackBalancePage = 1;
		performUnpackBalanceDBSearch({ fromDate, toDate, factory });

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
	window.changeUnpackBalanceItemsPerPage = function(newItemsPerPage) {
		unpackBalanceItemsPerPage = newItemsPerPage;
		currentUnpackBalancePage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performUnpackBalanceDBSearch(searchCriteria);
	}

	window.exportUnpackBalanceData = function() {
		return {
			total: globalUnpackBalanceData.length,
			currentPage: currentUnpackBalancePage,
			itemsPerPage: unpackBalanceItemsPerPage,
			data: globalUnpackBalanceData
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
	    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const fromDate = fmtLocalDate(firstDayOfMonth);
		return { fromDate, toDate };
	}

});
window.downloadAllUnpackBalanceData = function() {
	let searchCriteria = {
		fromDate: $("#unpackBalance_searchVal_fromDate").val(),
		toDate: $("#unpackBalance_searchVal_toDate").val(),
		factory: $("#unpackBalance_searchVal_factory").val().trim(),
		storage: $("#unpackBalance_searchVal_storage").val().trim(),
		barcode: $("#unpackBalance_searchVal_barcode").val().trim(),
		itemcode: $("#unpackBalance_searchVal_itemcode").val().trim().toUpperCase()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_unpackBalance_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.unpackBalanceColumns, {
				fileName: 'UnpackBalance_All',
				sheetName: 'UnpackBalance'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

//모달 열기
$(document).on("click", ".openUnpackModal", function(e) {
	const row = $(this).closest("tr");
	const barcode = row.find(".barcodeVal").text();

	let isLoading = true;

	if (isLoading) {
		showLoading("data");

		$.ajax({
			url: `/searchUnpackBarcodes`,
			type: "POST",
			data: JSON.stringify({ barcode: barcode }),
			contentType: "application/json",
			success: function(data) {
				console.log(data)

				renderUnpackBarcodeListModal(data.list);
				openModal();
				hideLoading();
			},
			error: function(xhr, status, error) {
				console.error("요청 실패");
				console.error("Status:", status);       // 예: "error"
				console.error("Error:", error);         // 예: 서버 응답 메시지
				console.error("Response:", xhr.responseText); // 서버 응답 본문
				alert("오류가 발생했습니다: " + error);
				hideLoading();
			}
		});
	}
});
function renderUnpackBarcodeListModal(list) {
	const tbody = document.getElementById('tableBody');
	const itemCount = document.getElementById('itemCount');

	if (!list || list.length === 0) {
		tbody.innerHTML = `
            <tr>
                <td colspan="2">
                    <div class="empty-state">
                        <div class="empty-state-icon">📦</div>
                        <div class="empty-state-text">No Data</div>
                    </div>
                </td>
            </tr>
        `;
		itemCount.textContent = '(0 items)';
		return;
	}

	const rowsHtml = list.map((it, idx) => {
		return `
          <tr>
            <td>${idx + 1}</td>
            <td class="barcode-cell">${it.BARCODE}</td>
          </tr>`;
	}).join('');

	tbody.innerHTML = rowsHtml;
	itemCount.textContent = `(${i18n.t('table.info.total')} ${list.length} ${i18n.t('table.info.records')})`;
}

function openModal() {
	document.getElementById('modalOverlay').style.display = 'flex';
	document.body.style.overflow = 'hidden';
}


// 모달 닫기
$(document).on("click", ".closeUnpackModal", function(e) {
	document.getElementById('modalOverlay').style.display = 'none';
	document.body.style.overflow = 'auto';
});

