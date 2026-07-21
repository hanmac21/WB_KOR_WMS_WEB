/* --------------------------------------------------------------
 * 📌 서열 관리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_sequenceT = [];
let globalSequenceTData = [];
let currentSequenceTPage = 1;
let sequenceTItemsPerPage = 100;
let totalSequenceTCount = 0;
let totalSequenceTPages = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredSequenceTData = [];
	window.sequenceTColumns = [
		{ key: 'SDATE', header: 'DATE' },
		{ key: 'COMPLETEYN', header: 'STATUS' },
		{ key: 'SPEC', header: 'CUSTCODE' },
		{ key: 'ITEMNAME', header: 'ITEMNAME' },
		{ key: 'OP4', header: 'OP4' },
		{ key: 'TIME', header: 'TIME' },
		{ key: 'SEQ', header: 'SEQ' },
		{ key: 'QTY', header: 'QTY' },
		{ key: 'COLORCODE', header: 'COLOR CODE' },
		{ key: 'ROW3_LH_CODE', header: '3RD LH' },
		{ key: 'ROW3_RH_CODE', header: '3RD RH' },
		{ key: 'ROW3_CTR_CODE', header: '3RD CTR' },
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_sequence_t = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();
		const line = 'T'

		performSequenceTDBSearch({ line, fromDate });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSequenceTDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_sequence",
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
				filteredData_sequenceT = [...allServerData];

				// 페이지 초기화
				currentSequenceTPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_sequence_t').length) {
					renderSequenceTView();
				} else {
					renderSequenceTTableData();
					renderSequenceTPagination();
					updateSequenceTTotalCount();
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
		sequenceTItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSequenceTCount = filteredData_sequenceT.length;
		totalSequenceTPages = Math.ceil(totalSequenceTCount / sequenceTItemsPerPage);

		const startIndex = (currentSequenceTPage - 1) * sequenceTItemsPerPage;
		const endIndex = startIndex + sequenceTItemsPerPage;

		globalSequenceTData = filteredData_sequenceT.slice(startIndex, endIndex);
		window.filteredSequenceTData = globalSequenceTData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_sequenceT.sort((a, b) => {
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

		currentSequenceTPage = 1;
		applyClientPagination();

		renderSequenceTTableData();
		renderSequenceTPagination();
		updateSequenceTTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSequenceTView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_sequence_t">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
								<input type="date" id="sequenceT_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_status">${i18n.t('search.status')}</div>
								<select id="sequenceT_searchVal_status">
									<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="Y">완료</option>
									<option value="N">미검수</option>
								</select>
							</div>
							<div class="search-label">
								<div class="search_oitemcode">${i18n.t('search.customercode')}</div>
								<input type="text" id="sequenceT_searchVal_oitemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="sequenceT_searchVal_itemname" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSequenceTSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnSequenceTSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="sequenceTTotalCount">${totalSequenceTCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="sequenceTCurrentPageInfo">${currentSequenceTPage}</strong>/<strong id="sequenceTTotalPageInfo">${totalSequenceTPages}</strong>
							</span>
							<div class="action-buttons-right mPurchase_sequence_t">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-primary" id="sequenceTExcelUploadBtn" onclick="uploadSequenceTData()">LINE T 업로드</button>
									<button class="btn btn-success" id="sequenceTExcelBtn" onclick="downloadAllSequenceTData()">Excel</button>
								</div>
							</div>							
						</div>
						<table class="data-table mPurchase_sequence_t" id="sequenceTTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}</th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}</th>
									<th class='carVal' data-sort="COMPLETEYN">${i18n.t('search.status')}</th>
									<th class='carVal' data-sort="HALC">HALC</th>
									<th class='oitemcodeVal' data-sort="SPEC">${i18n.t('search.customercode')}</th>
									<th class='itemnameVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
									<th class='carVal' data-sort="OP4">OP4</th>
									<th class='carVal' data-sort="TIME">TIME</th>
									<th class='carVal' data-sort="SEQ">SEQ</th>
									<th class='carVal' data-sort="QTY">QTY</th>
									<th class='carVal' data-sort="COLORCODE">색상코드</th>
									<th class='oitemcodeVal' data-sort="ROW3_LH_CODE">3RD LH</th>
									<th class='oitemcodeVal' data-sort="ROW3_RH_CODE">3RD RH</th>
									<th class='oitemcodeVal' data-sort="ROW3_CTR_CODE">3RD CTR</th>
								</tr>
							</thead>
							<tbody id="sequenceTDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="sequenceTPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="sequenceT_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="sequenceT_itemsPerPage" class="items-per-page-select">
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

		const { fromDate, toDate } = getDefaultDateRange();
		$("#sequenceT_searchVal_fromDate").val(fromDate);
		$("#sequenceT_itemsPerPage").val(sequenceTItemsPerPage);

		// 테이블 데이터 렌더링
		renderSequenceTTableData();
		// 페이지네이션 렌더링
		renderSequenceTPagination();
		// 이벤트 바인딩
		bindSequenceTEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSequenceTTotalCount();
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

	function updateSequenceTTotalCount() {
		$('#sequenceTTotalCount').text(Number(totalSequenceTCount).toLocaleString());
		$('#sequenceTCurrentPageInfo').text(currentSequenceTPage);
		$('#sequenceTTotalPageInfo').text(totalSequenceTPages);
	}

	function renderSequenceTTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSequenceTData.length; i++) {
			let rowNumber = (currentSequenceTPage - 1) * sequenceTItemsPerPage + i + 1;
			let data = globalSequenceTData[i];

			let status = data.COMPLETEYN === 'Y' ? "완료" : "미검수";

			tableBody += `
				<tr>
					<td class='noVal'>${rowNumber}</td>
					<td class='dateVal'>${data.SDATE || ''}</td>
					<td class='carVal'>${status}</td>
					<td class='carVal'>${data.HALC || ''}</td>
					<td class='oitemcodeVal'>${data.SPEC || ''}</td>
					<td class='itemnameVal'>${data.ITEMNAME || ''}</td>
					<td class='carVal'>${data.OP4 || ''}</td>
					<td class='carVal'>${data.TIME || ''}</td>
					<td class='carVal'>${data.SEQ || ''}</td>
					<td class='carVal'>${data.QTY || ''}</td>
					<td class='carVal'>${data.COLORCODE || ''}</td>
					<td class='oitemcodeVal'>${data.ROW3_LH_CODE || ''}</td>
					<td class='oitemcodeVal'>${data.ROW3_RH_CODE || ''}</td>
					<td class='oitemcodeVal'>${data.ROW3_CTR_CODE || ''}</td>
	            </tr>
			`;
		}

		$("#sequenceTDetailTableBody").html(tableBody);
	}

	function renderSequenceTPagination() {
		let paginationHtml = "";

		if (currentSequenceTPage > 1) {
			paginationHtml += `<button class="sequenceT-page-btn" data-page="${currentSequenceTPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="sequenceT-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSequenceTPage - 5);
		let endPage = Math.min(totalSequenceTPages, currentSequenceTPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="sequenceT-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSequenceTPage) {
				paginationHtml += `<button class="sequenceT-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="sequenceT-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSequenceTPages) {
			if (endPage < totalSequenceTPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="sequenceT-page-btn" data-page="${totalSequenceTPages}">${totalSequenceTPages}</button>`;
		}

		if (currentSequenceTPage < totalSequenceTPages) {
			paginationHtml += `<button class="sequenceT-page-btn" data-page="${currentSequenceTPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="sequenceT-page-btn disabled">&gt;</button>`;
		}

		$("#sequenceTPaginationContainer").html(paginationHtml);
	}

	function bindSequenceTEvents() {
		$(".btnSequenceTSearch").off('click').on('click', function() {
			performSequenceTSearch();
		});

		$(".btnSequenceTSearchInit").off('click').on('click', function() {
			resetSequenceTSearch();
		});

		$('#sequenceT_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSequenceTItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.sequenceT-page-btn').on('click', '.sequenceT-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSequenceTPage = page;
					applyClientPagination();
					renderSequenceTTableData();
					renderSequenceTPagination();
					updateSequenceTTotalCount();
				}
			}
		});

		$('#sequenceTTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_sequence_t input[type="text"], #view_mPurchase_sequence_t input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSequenceTSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#sequenceT_searchVal_fromDate").val(),
			status: $("#sequenceT_searchVal_status").val(),
			oitemcode: $("#sequenceT_searchVal_oitemcode").val().trim().toUpperCase(),
			itemname: $("#sequenceT_searchVal_itemname").val().trim().toUpperCase(),
			line : "T"
		};
	}

	function performSequenceTSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSequenceTPage = 1;
		performSequenceTDBSearch(searchCriteria);
	}

	function resetSequenceTSearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		$("#sequenceT_searchVal_fromDate").val(fromDate)
		$("#sequenceT_searchVal_status").val('')
		$("#sequenceT_searchVal_oitemcode").val('');
		$("#sequenceT_searchVal_itemname").val('');

		currentSequenceTPage = 1;

		let line = 'T';

		performSequenceTDBSearch({ line, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSequenceTItemsPerPage = function(newItemsPerPage) {
		sequenceTItemsPerPage = newItemsPerPage;
		currentSequenceTPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSequenceTTableData();
		renderSequenceTPagination();
		updateSequenceTTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSequenceTData = function() {
		return {
			total: filteredData_sequenceT.length,
			currentPage: currentSequenceTPage,
			itemsPerPage: sequenceTItemsPerPage,
			data: filteredData_sequenceT
		};
	}
});

// 데이터 엑셀 업로드
window.uploadSequenceTData = function() {
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
		formData.append("line", "T");

		showLoading("data");

		$.ajax({
			url: `/upload_sequenceLine`,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			success: function(res){
				hideLoading();

				const insertCount = (res && res.insertCount != null) ? res.insertCount : '';

				alert(`총 ${insertCount}건 업로드가 완료되었습니다.`);

				window.call_mPurchase_sequence_t();
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
window.downloadAllSequenceTData = function() {
	showLoading("export");

	const processedData = filteredData_sequenceT.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.sequenceTColumns, {
		fileName: 'sequenceT_All',
		sheetName: 'sequenceT'
	});

	hideLoading();
};
