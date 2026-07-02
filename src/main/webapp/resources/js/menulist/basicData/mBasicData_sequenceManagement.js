/* --------------------------------------------------------------
 * 📌 서열 관리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_sequenceManagement = [];
let globalSequenceManagementData = [];
let currentSequenceManagementPage = 1;
let sequenceManagementItemsPerPage = 100;
let totalSequenceManagementCount = 0;
let totalSequenceManagementPages = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredSequenceManagementData = [];
	window.sequenceManagementColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CUSTNAME', header: 'Supplier' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'OITEMCODE', header: 'spec' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' },
		{ key: 'INVOICENO', header: 'invoiceno' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'time' },
		{ key: 'BARCODE', header: 'barcode' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mBasicData_sequenceManagement = function(menuId) {
		showLoading("data");

		performSequenceManagementDBSearch({ });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSequenceManagementDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_sequenceManagement",
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
				filteredData_sequenceManagement = [...allServerData];

				// 페이지 초기화
				currentSequenceManagementPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mBasicData_sequenceManagement').length) {
					renderSequenceManagementView();
				} else {
					renderSequenceManagementTableData();
					renderSequenceManagementPagination();
					updateSequenceManagementTotalCount();
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
		sequenceManagementItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSequenceManagementCount = filteredData_sequenceManagement.length;
		totalSequenceManagementPages = Math.ceil(totalSequenceManagementCount / sequenceManagementItemsPerPage);

		const startIndex = (currentSequenceManagementPage - 1) * sequenceManagementItemsPerPage;
		const endIndex = startIndex + sequenceManagementItemsPerPage;

		globalSequenceManagementData = filteredData_sequenceManagement.slice(startIndex, endIndex);
		window.filteredSequenceManagementData = globalSequenceManagementData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_sequenceManagement.sort((a, b) => {
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

		currentSequenceManagementPage = 1;
		applyClientPagination();

		renderSequenceManagementTableData();
		renderSequenceManagementPagination();
		updateSequenceManagementTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSequenceManagementView() {
		let content_output = `
			<div class="divBlockControl" id="view_mBasicData_sequenceManagement">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}</div>
								<input type="text" id="sequenceManagement_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="sequenceManagement_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}</div>
								<input type="text" id="sequenceManagement_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="sequenceManagement_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSequenceManagementSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnSequenceManagementSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="sequenceManagementTotalCount">${totalSequenceManagementCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="sequenceManagementCurrentPageInfo">${currentSequenceManagementPage}</strong>/<strong id="sequenceManagementTotalPageInfo">${totalSequenceManagementPages}</strong>
							</span>
							<div class="action-buttons-right mBasicData_sequenceManagement">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-primary" id="sequenceManagementExcelUploadBtn" onclick="uploadSequenceManagementData()">업로드</button>
									<button class="btn btn-success" id="sequenceManagementExcelBtn" onclick="downloadAllSequenceManagementData()">Excel</button>
								</div>
							</div>							
						</div>
						<table class="data-table mBasicData_sequenceManagement" id="sequenceManagementTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}</th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}</th>
									<th class='cnameVal' data-sort="COLORNAME">색상 명</th>
									<th class='carVal' data-sort="MATERIAL">재질</th>
									<th class='carVal' data-sort="REGION">지역</th>
									<th class='carVal' data-sort="CAR">LX3</th>
									<th class='carVal' data-sort="COLORCODE">색상코드</th>
									<th class='carVal' data-sort="ROW1_HEADREST">FRT H/REST</th>
									<th class='carVal' data-sort="ROW1_HCODE">FRT CODE</th>
									<th class='carVal' data-sort="ROW2_HEADREST">2ND H/REST</th>
									<th class='carVal' data-sort="ROW2_SEAT">좌석</th>
									<th class='carVal' data-sort="ROW2_HCODE">2ND CODE</th>
									<th class='carVal' data-sort="LIMOUSINE">리무진</th>
									<th class='carVal' data-sort="ROW3_HEADREST">3RD H/REST</th>
									<th class='carVal' data-sort="ROW3_HCODE">3RD CODE</th>
									<th class='itemcodeVal' data-sort="ROW1_LH_CODE">FRT LH</th>
									<th class='itemcodeVal' data-sort="ROW1_RH_CODE">FRT RH</th>
									<th class='itemcodeVal' data-sort="ROW2_LH_CODE">2ND LH</th>
									<th class='itemcodeVal' data-sort="ROW2_RH_CODE">2ND RH</th>
									<th class='itemcodeVal' data-sort="ROW2_CTR_CODE">2ND CTR</th>
									<th class='itemcodeVal' data-sort="ROW3_LH_CODE">3RD LH</th>
									<th class='itemcodeVal' data-sort="ROW3_RH_CODE">3RD RH</th>
									<th class='itemcodeVal' data-sort="ROW3_CTR_CODE">3RD CTR</th>
									<th class='carVal' data-sort="LX2_PE_CODE">LX2 PE CODE</th>
								</tr>
							</thead>
							<tbody id="sequenceManagementDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="sequenceManagementPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="sequenceManagement_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="sequenceManagement_itemsPerPage" class="items-per-page-select">
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

		$("#sequenceManagement_itemsPerPage").val(sequenceManagementItemsPerPage);

		// 테이블 데이터 렌더링
		renderSequenceManagementTableData();
		// 페이지네이션 렌더링
		renderSequenceManagementPagination();
		// 이벤트 바인딩
		bindSequenceManagementEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSequenceManagementTotalCount();
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

	function updateSequenceManagementTotalCount() {
		$('#sequenceManagementTotalCount').text(Number(totalSequenceManagementCount).toLocaleString());
		$('#sequenceManagementCurrentPageInfo').text(currentSequenceManagementPage);
		$('#sequenceManagementTotalPageInfo').text(totalSequenceManagementPages);
	}

	function renderSequenceManagementTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSequenceManagementData.length; i++) {
			let rowNumber = (currentSequenceManagementPage - 1) * sequenceManagementItemsPerPage + i + 1;
			let data = globalSequenceManagementData[i];

			tableBody += `
				<tr>
					<td class='noVal'>${rowNumber}</td>
					<td class='dateVal'>${data.SDATE || ''}</td>
					<td class='cnameVal'>${data.COLORNAME || ''}</td>
					<td class='carVal'>${data.MATERIAL || ''}</td>
					<td class='carVal'>${data.REGION || ''}</td>
					<td class='carVal'>${data.CAR || ''}</td>
					<td class='carVal'>${data.COLORCODE || ''}</td>
					<td class='carVal'>${data.ROW1_HEADREST || ''}</td>
					<td class='carVal'>${data.ROW1_HCODE || ''}</td>
					<td class='carVal'>${data.ROW2_HEADREST || ''}</td>
					<td class='carVal'>${data.ROW2_SEAT || ''}</td>
					<td class='carVal'>${data.ROW2_HCODE || ''}</td>
					<td class='carVal'>${data.LIMOUSINE || ''}</td>
					<td class='carVal'>${data.ROW3_HEADREST || ''}</td>
					<td class='carVal'>${data.ROW3_HCODE || ''}</td>
					<td class='itemcodeVal'>${data.ROW1_LH_CODE || ''}</td>
					<td class='itemcodeVal'>${data.ROW1_RH_CODE || ''}</td>
					<td class='itemcodeVal'>${data.ROW2_LH_CODE || ''}</td>
					<td class='itemcodeVal'>${data.ROW2_RH_CODE || ''}</td>
					<td class='itemcodeVal'>${data.ROW2_CTR_CODE || ''}</td>
					<td class='itemcodeVal'>${data.ROW3_LH_CODE || ''}</td>
					<td class='itemcodeVal'>${data.ROW3_RH_CODE || ''}</td>
					<td class='itemcodeVal'>${data.ROW3_CTR_CODE || ''}</td>
					<td class='carVal'>${data.LX2_PE_CODE || ''}</td>
	            </tr>
			`;
		}

		$("#sequenceManagementDetailTableBody").html(tableBody);
	}

	function renderSequenceManagementPagination() {
		let paginationHtml = "";

		if (currentSequenceManagementPage > 1) {
			paginationHtml += `<button class="sequenceManagement-page-btn" data-page="${currentSequenceManagementPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="sequenceManagement-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSequenceManagementPage - 5);
		let endPage = Math.min(totalSequenceManagementPages, currentSequenceManagementPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="sequenceManagement-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSequenceManagementPage) {
				paginationHtml += `<button class="sequenceManagement-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="sequenceManagement-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSequenceManagementPages) {
			if (endPage < totalSequenceManagementPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="sequenceManagement-page-btn" data-page="${totalSequenceManagementPages}">${totalSequenceManagementPages}</button>`;
		}

		if (currentSequenceManagementPage < totalSequenceManagementPages) {
			paginationHtml += `<button class="sequenceManagement-page-btn" data-page="${currentSequenceManagementPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="sequenceManagement-page-btn disabled">&gt;</button>`;
		}

		$("#sequenceManagementPaginationContainer").html(paginationHtml);
	}

	function bindSequenceManagementEvents() {
		$(".btnSequenceManagementSearch").off('click').on('click', function() {
			performSequenceManagementSearch();
		});

		$(".btnSequenceManagementSearchInit").off('click').on('click', function() {
			resetSequenceManagementSearch();
		});

		$('#sequenceManagement_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSequenceManagementItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.sequenceManagement-page-btn').on('click', '.sequenceManagement-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSequenceManagementPage = page;
					applyClientPagination();
					renderSequenceManagementTableData();
					renderSequenceManagementPagination();
					updateSequenceManagementTotalCount();
				}
			}
		});

		$('#sequenceManagementTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mBasicData_sequenceManagement input[type="text"], #view_mBasicData_sequenceManagement input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSequenceManagementSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#sequenceManagement_searchVal_fromDate").val(),
			toDate: $("#sequenceManagement_searchVal_toDate").val(),
			useyn: $("#sequenceManagement_searchVal_useyn").val(),
			storage: $("#sequenceManagement_searchVal_storage").val(),
			cname: $("#sequenceManagement_searchVal_cname").val().trim().toUpperCase(),
			car: $("#sequenceManagement_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#sequenceManagement_searchVal_itemcode").val().trim().toUpperCase(),
			oitemcode: $("#sequenceManagement_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#sequenceManagement_searchVal_itemname").val().trim().toUpperCase(),
		};
	}

	function performSequenceManagementSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSequenceManagementPage = 1;
		performSequenceManagementDBSearch(searchCriteria);
	}

	function resetSequenceManagementSearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		$("#sequenceManagement_searchVal_fromDate").val(fromDate);
		$("#sequenceManagement_searchVal_toDate").val(toDate);
		$("#sequenceManagement_searchVal_useyn").val('Y');
		$("#sequenceManagement_searchVal_cname").val('');
		$("#sequenceManagement_searchVal_car").val('');
		$("#sequenceManagement_searchVal_itemcode").val('');
		$("#sequenceManagement_searchVal_oitemcode").val('');
		$("#sequenceManagement_searchVal_itemname").val('');


		currentSequenceManagementPage = 1;
		performSequenceManagementDBSearch({ });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSequenceManagementItemsPerPage = function(newItemsPerPage) {
		sequenceManagementItemsPerPage = newItemsPerPage;
		currentSequenceManagementPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSequenceManagementTableData();
		renderSequenceManagementPagination();
		updateSequenceManagementTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSequenceManagementData = function() {
		return {
			total: filteredData_sequenceManagement.length,
			currentPage: currentSequenceManagementPage,
			itemsPerPage: sequenceManagementItemsPerPage,
			data: filteredData_sequenceManagement
		};
	}
});

// 데이터 엑셀 업로드
window.uploadSequenceManagementData = function() {
	// 동적으로 파일 input 생성 (xlsx, xls 허용)
	let fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = ".xlsx,.xls";
	fileInput.style.display = "none";

	fileInput.addEventListener("change", function(e) {
		const file = e.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		showLoading("data");

		$.ajax({
			url: `/upload_sequenceInfo`,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			success: function(res){
				hideLoading();

				const insertCount = (res && res.insertCount != null) ? res.insertCount : '';

				alert(`총 ${insertCount}건 업로드가 완료되었습니다.`);

				window.call_mBasicData_sequenceManagement();
			},
			error: function(xhr, status, error) {
				console.error("업로드 실패:", error);
				hideLoading();

				// 백엔드에서 에러 메시지를 내려주면 함께 표시
				let msg = "업로드에 실패했습니다. 파일을 확인 후 다시 시도해주세요.";
				if (xhr.responseJSON && xhr.responseJSON.message) {
					msg = xhr.responseJSON.message;
				}
				alert(msg);
			}
		});

		// 동일 파일 재선택 가능하도록 초기화
		fileInput.value = '';
	});

	// 파일 선택 창 열기
	fileInput.click();
};

// 전체 데이터 엑셀 다운로드
window.downloadAllSequenceManagementData = function() {
	showLoading("export");

	const processedData = filteredData_sequenceManagement.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.sequenceManagementColumns, {
		fileName: 'sequenceManagement_All',
		sheetName: 'sequenceManagement'
	});

	hideLoading();
};
