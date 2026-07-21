/* --------------------------------------------------------------
 * 📌 서열 관리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_sequenceSummary = [];
let globalSequenceSummaryData = [];
let currentSequenceSummaryPage = 1;
let sequenceSummaryItemsPerPage = 100;
let totalSequenceSummaryCount = 0;
let totalSequenceSummaryPages = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {

	window.filteredSequenceSummaryData = [];
	window.sequenceSummaryColumns = [
		{ key: 'SDATE', header: 'Date' },
		{ key: 'LINE', header: 'Line' },
		{ key: 'TIME', header: 'Time' },
		{ key: 'SEQ', header: 'SEQ' },
		{ key: 'YQTY', header: 'Y COUNT' },
		{ key: 'NQTY', header: 'N COUNT' },
		{ key: 'QTY', header: 'QTY' },
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_sequence_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();

		performSequenceSummaryDBSearch({ fromDate, toDate });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performSequenceSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_sequenceSummary",
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
				filteredData_sequenceSummary = [...allServerData];

				// 페이지 초기화
				currentSequenceSummaryPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_sequence_summary').length) {
					renderSequenceSummaryView();
				} else {
					renderSequenceSummaryTableData();
					renderSequenceSummaryPagination();
					updateSequenceSummaryTotalCount();
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
		sequenceSummaryItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalSequenceSummaryCount = filteredData_sequenceSummary.length;
		totalSequenceSummaryPages = Math.ceil(totalSequenceSummaryCount / sequenceSummaryItemsPerPage);

		const startIndex = (currentSequenceSummaryPage - 1) * sequenceSummaryItemsPerPage;
		const endIndex = startIndex + sequenceSummaryItemsPerPage;

		globalSequenceSummaryData = filteredData_sequenceSummary.slice(startIndex, endIndex);
		window.filteredSequenceSummaryData = globalSequenceSummaryData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_sequenceSummary.sort((a, b) => {
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

		currentSequenceSummaryPage = 1;
		applyClientPagination();

		renderSequenceSummaryTableData();
		renderSequenceSummaryPagination();
		updateSequenceSummaryTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderSequenceSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_sequence_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}</div>
								<input type="date" id="sequenceSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="sequenceSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="search_line">라인</div>
								<select id="sequenceSummary_searchVal_line">
									<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="F">LINE F</option>
									<option value="R">LINE R</option>
									<option value="T">LINE T</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnSequenceSummarySearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnSequenceSummarySearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="sequenceSummaryTotalCount">${totalSequenceSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="sequenceSummaryCurrentPageInfo">${currentSequenceSummaryPage}</strong>/<strong id="sequenceSummaryTotalPageInfo">${totalSequenceSummaryPages}</strong>
							</span>
							<div class="action-buttons-right mPurchase_sequence_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-primary" id="sequenceSummaryExcelUploadBtn" onclick="uploadSequenceSummaryData()">전체 LINE 업로드</button>
									<button class="btn btn-success" id="sequenceSummaryExcelBtn" onclick="downloadAllSequenceSummaryData()">Excel</button>
								</div>
							</div>							
						</div>
						<table class="data-table mPurchase_sequence_summary" id="sequenceSummaryTable">
							<thead>
								<tr>
									<th class='noVal'>${i18n.t('table.no')}</th>
									<th class='dateVal' data-sort="SDATE" data-type="date">${i18n.t('search.date')}</th>
									<th class='carVal' data-sort="LINE">라인</th>
									<th class='carVal' data-sort="TIME">번호</th>
									<th class='itemcodeVal' data-sort="SEQ">총 건수</th>
									<th class='itemcodeVal' data-sort="YQTY">서열 검사 건수</th>
									<th class='itemcodeVal' data-sort="NQTY">서열 미검사 건수</th>
									<th class='itemcodeVal' data-sort="QTY">총 수량</th>
									<th class='itemcodeVal' data-sort="">서열 일치 여부</th>
								</tr>
							</thead>
							<tbody id="sequenceSummaryDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="sequenceSummaryPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="sequenceSummary_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="sequenceSummary_itemsPerPage" class="items-per-page-select">
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
		$("#sequenceSummary_searchVal_fromDate").val(fromDate);
		$("#sequenceSummary_searchVal_toDate").val(toDate);
		$("#sequenceSummary_itemsPerPage").val(sequenceSummaryItemsPerPage);

		// 테이블 데이터 렌더링
		renderSequenceSummaryTableData();
		// 페이지네이션 렌더링
		renderSequenceSummaryPagination();
		// 이벤트 바인딩
		bindSequenceSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateSequenceSummaryTotalCount();
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

	function updateSequenceSummaryTotalCount() {
		$('#sequenceSummaryTotalCount').text(Number(totalSequenceSummaryCount).toLocaleString());
		$('#sequenceSummaryCurrentPageInfo').text(currentSequenceSummaryPage);
		$('#sequenceSummaryTotalPageInfo').text(totalSequenceSummaryPages);
	}

	function renderSequenceSummaryTableData() {
		let tableBody = "";

		for (let i = 0; i < globalSequenceSummaryData.length; i++) {
			let rowNumber = (currentSequenceSummaryPage - 1) * sequenceSummaryItemsPerPage + i + 1;
			let data = globalSequenceSummaryData[i];

			const yQty = Number(data.YQTY || 0);
			const nQty = Number(data.NQTY || 0);

			let complete;

			if (yQty === 0) {
				complete = "미검사";
			} else if (yQty === nQty) {
				complete = "검사 완료";
			} else if (nQty > yQty) {
				complete = "검사 중";
			} else {
				complete = "검사 중";
			}

			tableBody += `
				<tr>
					<td class='noVal'>${rowNumber}</td>
					<td class='dateVal'>${data.SDATE || ''}</td>
					<td class='carVal'>${data.LINE || ''}</td>
					<td class='carVal'>${data.TIME || ''}</td>
					<td class='itemcodeVal'>${data.SEQ || ''}</td>
					<td class='itemcodeVal'>${data.YQTY || '0'}</td>
					<td class='itemcodeVal'>${data.NQTY || '0'}</td>
					<td class='itemcodeVal'>${data.QTY || ''}</td>
					<td class='itemcodeVal'>${complete}</td>
	            </tr>
			`;
		}

		$("#sequenceSummaryDetailTableBody").html(tableBody);
	}

	function renderSequenceSummaryPagination() {
		let paginationHtml = "";

		if (currentSequenceSummaryPage > 1) {
			paginationHtml += `<button class="sequenceSummary-page-btn" data-page="${currentSequenceSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="sequenceSummary-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentSequenceSummaryPage - 5);
		let endPage = Math.min(totalSequenceSummaryPages, currentSequenceSummaryPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="sequenceSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentSequenceSummaryPage) {
				paginationHtml += `<button class="sequenceSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="sequenceSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalSequenceSummaryPages) {
			if (endPage < totalSequenceSummaryPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="sequenceSummary-page-btn" data-page="${totalSequenceSummaryPages}">${totalSequenceSummaryPages}</button>`;
		}

		if (currentSequenceSummaryPage < totalSequenceSummaryPages) {
			paginationHtml += `<button class="sequenceSummary-page-btn" data-page="${currentSequenceSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="sequenceSummary-page-btn disabled">&gt;</button>`;
		}

		$("#sequenceSummaryPaginationContainer").html(paginationHtml);
	}

	function bindSequenceSummaryEvents() {
		$(".btnSequenceSummarySearch").off('click').on('click', function() {
			performSequenceSummarySearch();
		});

		$(".btnSequenceSummarySearchInit").off('click').on('click', function() {
			resetSequenceSummarySearch();
		});

		$('#sequenceSummary_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeSequenceSummaryItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.sequenceSummary-page-btn').on('click', '.sequenceSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentSequenceSummaryPage = page;
					applyClientPagination();
					renderSequenceSummaryTableData();
					renderSequenceSummaryPagination();
					updateSequenceSummaryTotalCount();
				}
			}
		});

		$('#sequenceSummaryTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_sequence_summary input[type="text"], #view_mPurchase_sequence_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performSequenceSummarySearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#sequenceSummary_searchVal_fromDate").val(),
			line: $("#sequenceSummary_searchVal_line").val()
		};
	}

	function performSequenceSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentSequenceSummaryPage = 1;
		performSequenceSummaryDBSearch(searchCriteria);
	}

	function resetSequenceSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		$("#sequenceSummary_searchVal_fromDate").val(fromDate);
		$("#sequenceSummary_searchVal_toDate").val(toDate);
		$("#sequenceSummary_searchVal_line").val('');

		currentSequenceSummaryPage = 1;
		performSequenceSummaryDBSearch({ fromDate, toDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeSequenceSummaryItemsPerPage = function(newItemsPerPage) {
		sequenceSummaryItemsPerPage = newItemsPerPage;
		currentSequenceSummaryPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderSequenceSummaryTableData();
		renderSequenceSummaryPagination();
		updateSequenceSummaryTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportSequenceSummaryData = function() {
		return {
			total: filteredData_sequenceSummary.length,
			currentPage: currentSequenceSummaryPage,
			itemsPerPage: sequenceSummaryItemsPerPage,
			data: filteredData_sequenceSummary
		};
	}
});

// 데이터 엑셀 업로드
window.uploadSequenceSummaryData = function() {
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
			url: `/upload_sequenceAll`,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			success: function(res){
				hideLoading();

				const insertCount = (res && res.insertCount != null) ? res.insertCount : '';

				alert(`총 ${insertCount}건 업로드가 완료되었습니다.`);

				window.call_mPurchase_sequence_summary();
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
window.downloadAllSequenceSummaryData = function() {
	showLoading("export");

	const processedData = filteredData_sequenceSummary.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.sequenceSummaryColumns, {
		fileName: 'sequenceSummary_All',
		sheetName: 'sequenceSummary'
	});

	hideLoading();
};
