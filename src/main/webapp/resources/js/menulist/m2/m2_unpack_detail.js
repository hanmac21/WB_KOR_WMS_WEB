/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_unpack_detail 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : unpackDetail -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : UnpackDetail -> NewMenuName
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

	let globalUnpackDetailData = []; // 현재 조회된 데이터 저장
	let currentUnpackDetailPage = 1; // 현재 페이지
	let unpackDetailItemsPerPage = 1000; // 페이지당 항목 수
	let totalUnpackDetailCount = 0; // 서버에서 받은 총 개수 저장
	let totalUnpackDetailQty = 0; // 서버에서 받은 총 개수 저장
	let totalUnpackDetailPages = 0; // 서버에서 받은 총 페이지
	window.filteredUnpackDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.unpackDetailColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'PRINT_QTY', header: 'Print qty' },
		{ key: 'SCANQTY', header: 'Scan qty' },
		{ key: 'REMAINING_QTY', header: 'Remain qty' },
		{ key: 'LOCATION', header: 'Location' },
		{ key: 'LOGINID', header: 'User' },
		{ key: 'HHMM', header: 'Time' },
		{ key: 'BARCODE', header: 'Barcode' }
		//{ key: 'SCANQTY', header: 'scanqty' },

		// 나중에 쿼리 수정 후 빈 key값 쿼리명으로 추가
	];

	// 메인 호출 함수 - 초기 로딩 시에는 날짜, 공장으로 조회
	window.call_m2_unpack_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performUnpackDetailDBSearch({ fromDate, toDate, factory });
	}

	// DB에서 데이터 조회하는 함수
	function performUnpackDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_unpackDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentUnpackDetailPage,
				itemsPerPage: unpackDetailItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalUnpackDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalUnpackDetailCount = data.totalCount || 0;
				totalUnpackDetailQty = data.totalQty || 0;
				totalUnpackDetailPages = data.totalPages || 0;
				currentUnpackDetailPage = data.currentPage || 0;
				window.filteredUnpackDetailData = globalUnpackDetailData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_unpack_detail').length) {
					renderUnpackDetailView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderUnpackDetailTableData();
					renderUnpackDetailPagination();
					updateUnpackDetailTotalCount();
					updateUnpackDetailTotalQty();
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
	function renderUnpackDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_unpack_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="unpackDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="unpackDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="unpackDetail_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="unpackDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="unpackDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="unpackDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="unpackDetail_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnUnpackDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnUnpackDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="unpackDetailTotalCount">${totalUnpackDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="unpackDetailCurrentPageInfo">${currentUnpackDetailPage}</strong>/<strong id="unpackDetailTotalPageInfo">${totalUnpackDetailPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "unpackDetailTotalQty"></strong>
							</span>
							<div class="action-buttons-right m2_unpack_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="unpackDetailExcelBtn" onclick="downloadAllUnpackDetailData()">Excel</button>
								</div> 
							</div>
						</div>
						<table class="data-table m2_unpack_detail">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "scanqtyVal">${i18n.t('search.qty.print')}<!-- PRINT_QTY --></th>
									<th class = "scanqtyVal">${i18n.t('search.qty.scan')}<!-- SCAN_QTY --></th>
									<th class = "scanqtyVal">${i18n.t('search.qty.remain')}<!-- REMAIN_QTY --></th>
									<th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>
									<th class = "loginidVal">${i18n.t('search.user')}<!-- USER --></th>
									<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>
									<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="unpackDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="unpackDetailPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		// = 위에 data-table, search-row i18n 부분 추가
		/*<button class="btn btn-success" id="unpackDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredUnpackDetailData, unpackDetailColumns, {fileName:'UnpackDetail', sheetName:'UnpackDetail'})">Excel</button>*/
		$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#unpackDetail_searchVal_fromDate").val(fromDate);
			$("#unpackDetail_searchVal_toDate").val(toDate);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderUnpackDetailTableData();
		// 페이지네이션 렌더링
		renderUnpackDetailPagination();
		// 이벤트 바인딩
		bindUnpackDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateUnpackDetailTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateUnpackDetailTotalQty();

	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const factory = $('#unpackDetail_searchVal_factory');
		const storage = $('#unpackDetail_searchVal_storage');
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
	function updateUnpackDetailTotalCount() {
		$('#unpackDetailTotalCount').text(totalUnpackDetailCount);
	}
	// 총 개수를 업데이트하는 함수
	function updateUnpackDetailTotalQty() {
		$('#unpackDetailTotalQty').text(totalUnpackDetailQty.toLocaleString());
	}
	function renderUnpackDetailTableData() {
		let tableBody = "";

		//console.log("globalUnpackDetailData:", globalUnpackDetailData);
		//console.log("데이터 개수:", globalUnpackDetailData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalUnpackDetailData.length; i++) {
			let rowNumber = (currentUnpackDetailPage - 1) * unpackDetailItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalUnpackDetailData[i]); // 각 행 데이터 확인

			let remainingQty = (globalUnpackDetailData[i].QTY || globalUnpackDetailData[i].qty || 0) -
				(globalUnpackDetailData[i].SCANQTY || globalUnpackDetailData[i].scanqty || 0);

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "dateVal">${globalUnpackDetailData[i].SDATE || globalUnpackDetailData[i].sdate || ''}</td>
                <td class = "factoryVal">${globalUnpackDetailData[i].FACTORY || globalUnpackDetailData[i].factory || ''}</td>
				<td class = "storageVal">${globalUnpackDetailData[i].STORAGE || globalUnpackDetailData[i].storage || ''}</td>
				<td class = "carVal">${globalUnpackDetailData[i].CAR || globalUnpackDetailData[i].car || ''}</td>
				<td class = "itemcodeVal">${globalUnpackDetailData[i].ITEMCODE || globalUnpackDetailData[i].itemcode || ''}</td>
				<td class = "itemnameVal">${globalUnpackDetailData[i].ITEMNAME || globalUnpackDetailData[i].itemname || ''}</td>
				<td class = "qtyVal">${Number(globalUnpackDetailData[i].QTY || globalUnpackDetailData[i].qty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackDetailData[i].PRINT_QTY || globalUnpackDetailData[i].print_qty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackDetailData[i].SCANQTY || globalUnpackDetailData[i].scanqty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal openUnpackModal">${Number(remainingQty).toLocaleString()}</td>
				<td class = "locationVal">${globalUnpackDetailData[i].LOCATION || globalUnpackDetailData[i].location || ''}</td>
				<td class = "loginidVal">${globalUnpackDetailData[i].LOGINID || globalUnpackDetailData[i].loginid || ''}</td>
				<td class = "hhmmVal">${globalUnpackDetailData[i].HHMM || globalUnpackDetailData[i].hhmm || ''}</td>
				<td class = "barcodeVal">${globalUnpackDetailData[i].BARCODE || globalUnpackDetailData[i].barcode || ''}</td>
            </tr>
        `;
		}
		// =
		//console.log("생성된 tableBody:", tableBody);
		$("#unpackDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderUnpackDetailPagination() {
		let totalPages = Math.ceil(totalUnpackDetailCount / unpackDetailItemsPerPage); // 변경
		let paginationHtml = "";

		console.log(unpackDetailItemsPerPage);
		console.log(totalPages);

		// 이전 버튼
		if (currentUnpackDetailPage > 1) {
			paginationHtml += `<button class="unpackDetail-page-btn" data-page="${currentUnpackDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="unpackDetail-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentUnpackDetailPage - 5);
		let endPage = Math.min(totalPages, currentUnpackDetailPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="unpackDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentUnpackDetailPage) {
				paginationHtml += `<button class="unpackDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="unpackDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="unpackDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentUnpackDetailPage < totalPages) {
			paginationHtml += `<button class="unpackDetail-page-btn" data-page="${currentUnpackDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="unpackDetail-page-btn disabled">&gt;</button>`;
		}

		$('#unpackDetailCurrentPageInfo').text(currentUnpackDetailPage);
		$('#unpackDetailTotalPageInfo').text(totalPages);
		$("#unpackDetailPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindUnpackDetailEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnUnpackDetailSearch").off('click').on('click', function() {
			performUnpackDetailSearch();
		});

		// 초기화 버튼 클릭
		$(".btnUnpackDetailSearchInit").off('click').on('click', function() {
			resetUnpackDetailSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.unpackDetail-page-btn').on('click', '.unpackDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentUnpackDetailPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performUnpackDetailDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_unpack_detail input[type="text"], #view_m2_unpack_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performUnpackDetailSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#unpackDetail_searchVal_fromDate").val(),
			toDate: $("#unpackDetail_searchVal_toDate").val(),
			factory: $("#unpackDetail_searchVal_factory").val().trim(),
			storage: $("#unpackDetail_searchVal_storage").val().trim(),
			car: $("#unpackDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#unpackDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#unpackDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}
	// =
	// 검색 수행 함수 - DB 조회
	function performUnpackDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentUnpackDetailPage = 1;
		performUnpackDetailDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetUnpackDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		$("#unpackDetail_searchVal_fromDate").val(fromDate);
		$("#unpackDetail_searchVal_toDate").val(toDate);
		$("#unpackDetail_searchVal_factory").val(factory);
		$("#unpackDetail_searchVal_storage").val('Material');
		$("#unpackDetail_searchVal_car").val('');
		$("#unpackDetail_searchVal_itemcode").val('');
		$("#unpackDetail_searchVal_itemname").val('');
		// =
		// 초기화 후 전체 데이터 다시 조회
		currentUnpackDetailPage = 1;
		performUnpackDetailDBSearch({ fromDate, toDate, factory });

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
	window.changeUnpackDetailItemsPerPage = function(newItemsPerPage) {
		unpackDetailItemsPerPage = newItemsPerPage;
		currentUnpackDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performUnpackDetailDBSearch(searchCriteria);
	}

	window.exportUnpackDetailData = function() {
		return {
			total: globalUnpackDetailData.length,
			currentPage: currentUnpackDetailPage,
			itemsPerPage: unpackDetailItemsPerPage,
			data: globalUnpackDetailData
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
window.downloadAllUnpackDetailData = function() {
	let searchCriteria = {
		fromDate: $("#unpackDetail_searchVal_fromDate").val(),
		toDate: $("#unpackDetail_searchVal_toDate").val(),
		factory: $("#unpackDetail_searchVal_factory").val(),
		storage: $("#unpackDetail_searchVal_storage").val(),
		car: $("#unpackDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#unpackDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#unpackDetail_searchVal_itemname").val().trim().toUpperCase()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_unpackDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.unpackDetailColumns, {
				fileName: 'UnpackDetail_All',
				sheetName: 'UnpackDetail'
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

