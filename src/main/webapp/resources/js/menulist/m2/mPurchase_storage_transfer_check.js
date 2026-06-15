/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 mPurchase_storage_transfer_check 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : common -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : Common -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

/* --------------------------------------------------------------
 * 📌 구매 - 이동 - 공장 이동 완료
 * 비고: 
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalStorageTransferCheckData = []; // 현재 조회된 데이터 저장
	let currentStorageTransferCheckPage = 1; // 현재 페이지
	let storageTransferCheckItemsPerPage = 1000; // 페이지당 항목 수
	let totalStorageTransferCheckCount = 0; // 서버에서 받은 총 개수 저장
	let totalStorageTransferCheckPages = 0; // 서버에서 받은 총 페이지

	window.filteredStorageTransferCheckData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.storageTransferCheckColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'STORAGE1', header: 'sent storage' },
		{ key: 'STORAGE2', header: 'received storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'OITEMCODE', header: 'spec' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'STATUS', header: 'status' },           // Complete / Checking
		{ key: 'SENDING_QTY', header: 'sending_qty', type:'number' },
		{ key: 'BARCODE', header: 'lot' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mPurchase_storage_transfer_check = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		const storage1=  'all';
		const storage2=  'all';

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performStorageTransferCheckDBSearch({ fromDate, toDate, storage1, storage2 });
	}

	// DB에서 데이터 조회하는 함수
	function performStorageTransferCheckDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_storageTransferCheck",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentStorageTransferCheckPage,
				itemsPerPage: storageTransferCheckItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {

				// ✅ 서버 페이징 응답 기준
				globalStorageTransferCheckData = data.records || [];

				totalStorageTransferCheckCount = Number(data.totalCount || 0);
				totalStorageTransferCheckPages = Number(data.totalPages || 1);
				currentStorageTransferCheckPage = Number(data.currentPage || currentStorageTransferCheckPage);

				window.filteredStorageTransferCheckData = globalStorageTransferCheckData;

				if (!$('#view_mPurchase_storage_transfer_check').length) {
					renderStorageTransferCheckView();
				} else {
					renderStorageTransferCheckTableData();      // ✅ 서버가 이미 현재페이지 rows만 주므로 slice 불필요
					renderStorageTransferCheckPagination();     // ✅ totalCount 기반 페이지
					updateStorageTransferCheckTotalCount();
				}

				hideLoading();
			},
			error: function() {
				hideLoading();
				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
			}
		});
	}


	// 사용자 뷰 렌더링 함수
	function renderStorageTransferCheckView() {
		let content_output;
		content_output = `
			<div class="divBlockControl" id="view_mPurchase_storage_transfer_check">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate"> ${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="storageTransferCheck_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="storageTransferCheck_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage1">${i18n.t('search.sentstorage')}<!-- MOVE FACTORY --></div>
								<select id="storageTransferCheck_searchVal_storage1" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage2">${i18n.t('search.receivestorage')}<!-- MOVE STORAGE --></div>
								<select id="storageTransferCheck_searchVal_storage2" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="storageTransferCheck_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_oitemcode">${i18n.t('search.customercode')}<!-- ITEMCODE --></div>
								<input type="text" id="storageTransferCheck_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="storageTransferCheck_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_status">Status</div>
									<select id="storageTransferCheck_searchVal_status">
										<option value="all">All</option>
										<option value="COMPLETE">Complete</option>
										<option value="CHECKING">Checking</option>
									</select>
								</div>
							</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnStorageTransferCheckSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnStorageTransferCheckSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
						  <span>
						    ${i18n.t('table.info.total')}
						    <strong id="storageTransferCheckTotalCount">${totalStorageTransferCheckCount}</strong>
						    ${i18n.t('table.info.records')}
						    |
						    ${i18n.t('table.page')}
						    <strong id="storageTransferCheckCurrentPageInfo">${currentStorageTransferCheckPage}</strong>/
						    <strong id="storageTransferCheckTotalPageInfo">${Math.ceil(globalStorageTransferCheckData.length / storageTransferCheckItemsPerPage)}</strong>
						  </span>
						
						  <div class="action-buttons-right mPurchase_storage_transfer_check">
						    <div id="defaultActions" class="action-group">
						      <button class="btn btn-success" id="storageTransferCheckExcelBtn" onclick="downloadAllStorageTransferCheckData()">Excel</button>
						    </div>
						  </div>
						</div>

						<table class="data-table mPurchase_storage_transfer_check">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal">${i18n.t('table.date')}<!-- DATE --></th>
									<th class = "storageVal">${i18n.t('search.sentstorage')}<!-- 보낸 STORAGE --></th>
									<th class = "storageVal">${i18n.t('search.receivestorage')}<!-- 받은 STORAGE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- 차종 --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemcodeVal">${i18n.t('search.customercode')}<!-- OITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "cucodeVal">${i18n.t('search.qty.stockCheck')}<!-- QTY --></th>
									<th class = "qtyVal">${i18n.t('search.qty.out')}<!-- QTY --></th>
									<th class = "barcodeVal">LOT<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="storageTransferCheckTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="storageTransferCheckPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		// = 위에 data-table, search-row i18n 부분 추가
		$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#storageTransferCheck_searchVal_fromDate").val(fromDate);
			$("#storageTransferCheck_searchVal_toDate").val(toDate);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderStorageTransferCheckTableData();
		// 페이지네이션 렌더링
		renderStorageTransferCheckPagination();
		// 이벤트 바인딩
		bindStorageTransferCheckEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateStorageTransferCheckTotalCount();
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const storage1 = $('#storageTransferCheck_searchVal_storage1');
		const storage2 = $('#storageTransferCheck_searchVal_storage2');

		storage1.empty();
		storage2.empty();

		const storageList = ['all', 'INBOUND', 'PRODUCT', 'OUTSIDE'];

		storageList.forEach(item => {
			const text = item === 'all' ? i18n.t('search.all') : item;
			storage1.append(`<option value="${item}">${text}</option>`);
			storage2.append(`<option value="${item}">${text}</option>`);
		});

		// 첫 번째 옵션 선택 (Material)
		storage1.val(storageList[0]);
		storage2.val(storageList[0]);
	}

	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	function updateStorageTransferCheckTotalCount() {
		$('#storageTransferCheckTotalCount').text((totalStorageTransferCheckCount || 0).toLocaleString());
	}


	function renderStorageTransferCheckTableData() {
		let tableBody = "";

		const rows = globalStorageTransferCheckData || []; // ✅ 이미 현재 페이지 데이터

		if (rows.length === 0) {
			$("#storageTransferCheckTableBody").html(`
			      <tr><td class="noVal" colspan="14" style="text-align:center;padding:20px;">No data</td></tr>
			    `);
			return;
		}

		for (let i = 0; i < rows.length; i++) {
			const rowNumber = (currentStorageTransferCheckPage - 1) * storageTransferCheckItemsPerPage + i + 1;

			const row = rows[i] || {};
			const statusRaw = (row.STATUS || row.status || '').toString().trim().toUpperCase();
			const isComplete = (statusRaw === 'COMPLETE');

			const badgeClass = isComplete ? 'badge badge-complete' : 'badge badge-checking';
			const rowClass = isComplete ? 'row-complete' : 'row-checking';
			const statusText = isComplete ? 'Complete' : 'Checking';

			const qty = toNum(row.QTY ?? row.qty);

			tableBody += `
		      <tr class="${rowClass}">
		        <td class="noVal">${rowNumber}</td>
		        <td class="dateVal">${row.SDATE || row.sdate || ''}</td>
		        <td class="storageVal">${row.STORAGE1 || row.storage1 || ''}</td>
		        <td class="storageVal">${row.STORAGE2 || row.storage2 || ''}</td>
		        <td class="carVal">${row.CAR || row.car || ''}</td>
		        <td class="itemcodeVal">${row.ITEMCODE || row.itemcode || ''}</td>
		        <td class="itemcodeVal">${row.OITEMCODE || row.oitemcode || ''}</td>
		        <td class="itemnameVal">${row.ITEMNAME || row.itemname || ''}</td>
		        <td class="qtyVal">${qty.toLocaleString()}</td>
		        <td class="cucodeVal"><span class="${badgeClass}">${statusText}</span></td>
		        <td class="qtyVal">${Number(row.SENDING_QTY || row.sending_qty || 0).toLocaleString()}</td>
		        <td class="barcodeVal">${row.BARCODE || row.barcode || ''}</td>
		      </tr>
		    `;
		}

		$("#storageTransferCheckTableBody").html(tableBody);
	}


	// ✅ render에서 쓰는 숫자 변환 유틸(없으면 꼭 추가)
	function toNum(v) {
		if (v === null || v === undefined) return 0;
		const s = String(v).replace(/,/g, '').trim();
		if (!s) return 0;
		const n = Number(s);
		return Number.isFinite(n) ? n : 0;
	}

	// 페이지네이션 렌더링
	function renderStorageTransferCheckPagination() {
		let totalPages = Math.ceil(totalStorageTransferCheckCount / storageTransferCheckItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentStorageTransferCheckPage > 1) {
			paginationHtml += `<button class="storageTransferCheck-page-btn" data-page="${currentStorageTransferCheckPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="storageTransferCheck-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentStorageTransferCheckPage - 5);
		let endPage = Math.min(totalPages, currentStorageTransferCheckPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="storageTransferCheck-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentStorageTransferCheckPage) {
				paginationHtml += `<button class="storageTransferCheck-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="storageTransferCheck-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="storageTransferCheck-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentStorageTransferCheckPage < totalPages) {
			paginationHtml += `<button class="storageTransferCheck-page-btn" data-page="${currentStorageTransferCheckPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="storageTransferCheck-page-btn disabled">&gt;</button>`;
		}

		$("#storageTransferCheckCurrentPageInfo").html(currentStorageTransferCheckPage);
		$("#storageTransferCheckTotalPageInfo").html(totalPages);
		$("#storageTransferCheckPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindStorageTransferCheckEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnStorageTransferCheckSearch").off('click').on('click', function() {
			performStorageTransferCheckSearch();
		});

		// 초기화 버튼 클릭
		$(".btnStorageTransferCheckSearchInit").off('click').on('click', function() {
			resetStorageTransferCheckSearch();
		});

		$(document).off('click', '.storageTransferCheck-page-btn').on('click', '.storageTransferCheck-page-btn', function() {
			if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;

			const page = parseInt($(this).data('page'), 10);
			if (!page) return;

			currentStorageTransferCheckPage = page;

			const searchCriteria = getCurrentSearchCriteria();
			performStorageTransferCheckDBSearch(searchCriteria); // ✅ 서버 재조회
		});



		// 엔터키 검색
		$('#view_mPurchase_storage_transfer_check input[type="text"], #view_mPurchase_storage_transfer_check input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performStorageTransferCheckSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		let status = ($("#storageTransferCheck_searchVal_status").val() || 'all');

		return {
			fromDate: $("#storageTransferCheck_searchVal_fromDate").val(),
			toDate: $("#storageTransferCheck_searchVal_toDate").val(),
			storage1: $("#storageTransferCheck_searchVal_storage1").val(),
			storage2: $("#storageTransferCheck_searchVal_storage2").val(),
			itemcode: $("#storageTransferCheck_searchVal_itemcode").val().trim(),
			oitemcode: $("#storageTransferCheck_searchVal_oitemcode").val().trim(),
			itemname: $("#storageTransferCheck_searchVal_itemname").val().trim(),
			status: status
		};
	}
	// =
	// 검색 수행 함수 - DB 조회
	function performStorageTransferCheckSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentStorageTransferCheckPage = 1;
		performStorageTransferCheckDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetStorageTransferCheckSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const storage1 = 'all';
		const storage2 = 'all';

		$("#storageTransferCheck_searchVal_fromDate").val(fromDate);
		$("#storageTransferCheck_searchVal_toDate").val(toDate);
		$("#storageTransferCheck_searchVal_storage1").val('all');
		$("#storageTransferCheck_searchVal_storage2").val('all');
		$("#storageTransferCheck_searchVal_itemcode").val('');
		$("#storageTransferCheck_searchVal_oitemcode").val('');
		$("#storageTransferCheck_searchVal_itemname").val('');
		// =

		// 초기화 후 전체 데이터 다시 조회
		currentStorageTransferCheckPage = 1;
		performStorageTransferCheckDBSearch({ fromDate, toDate, storage1, storage2 });

		console.log('검색 조건이 초기화되었습니다.');
	}

	// 유틸리티 함수들
	window.changeStorageTransferCheckItemsPerPage = function(newItemsPerPage) {
		storageTransferCheckItemsPerPage = newItemsPerPage;
		currentStorageTransferCheckPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performStorageTransferCheckDBSearch(searchCriteria);
	}

	window.exportStorageTransferCheckData = function() {
		return {
			total: globalStorageTransferCheckData.length,
			currentPage: currentStorageTransferCheckPage,
			itemsPerPage: storageTransferCheckItemsPerPage,
			data: globalStorageTransferCheckData
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
window.downloadAllStorageTransferCheckData = function() {
	let searchCriteria = {
		fromDate: $("#storageTransferCheck_searchVal_fromDate").val(),
		toDate: $("#storageTransferCheck_searchVal_toDate").val(),
		storage1: $("#storageTransferCheck_searchVal_storage1").val(),
		storage2: $("#storageTransferCheck_searchVal_storage2").val(),
		itemcode: $("#storageTransferCheck_searchVal_itemcode").val().trim(),
		oitemcode: $("#storageTransferCheck_searchVal_oitemcode").val().trim(),
		itemname: $("#storageTransferCheck_searchVal_itemname").val().trim(),
		status: ($("#storageTransferCheck_searchVal_status").val() || 'all') // ✅ 추가
	};

	showLoading("export");

	// ✅ 숫자 안전 변환
	function toNum(v) {
		if (v === null || v === undefined) return 0;
		const s = String(v).replace(/,/g, '').trim();
		if (!s) return 0;
		const n = Number(s);
		return Number.isFinite(n) ? n : 0;
	}

	$.ajax({
		url: "/read_storageTransferCheck_all",
		type: "POST",
		data: JSON.stringify({ searchParams: searchCriteria }),
		contentType: "application/json",
		success: function(res) {
			console.log(res);

			// ✅ 서버 응답이 배열이든 {records:[]}든 모두 대응
			const rawRows = Array.isArray(res) ? res : (res.records || []);

			// ✅ 엑셀용 rows 가공: STATUS / SALTILLO_QTY / PUEBLA_QTY 생성
			const excelRows = rawRows.map(row => {
				const qty = toNum(row.QTY ?? row.qty);
				const sendingQty = toNum(row.SENDING_QTY ?? row.sending_qty);

				// 서버가 STATUS 주면 그걸 우선 사용
				let statusRaw = (row.STATUS ?? row.status ?? '').toString().trim().toUpperCase();

				// ✅ STATUS가 없으면 qty == sendingQty면 COMPLETE로 계산(원하시는 케이스 대응)
				if (!statusRaw) {
					statusRaw = (qty === sendingQty) ? 'COMPLETE' : 'CHECKING';
				}

				const statusText = (statusRaw === 'COMPLETE') ? 'Complete' : 'Checking';

				return {
					...row,
					STATUS: statusText,
				};
			});

			ExcelExporter.downloadExcel(excelRows, window.storageTransferCheckColumns, {
				fileName: 'StorageTransferCheck_All',
				sheetName: 'StorageTransferCheck'
			});

			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};


