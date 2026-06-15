/* --------------------------------------------------------------
 * 📌 기초자료 - 거래처 관리
 * 비고: 페이징 처리 및 검색 기능 포함
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalCustomerData = []; // 전체 거래처 데이터 저장 (변수명 수정)
	let currentCustomerPage = 1; // 현재 페이지 (변수명 수정)
	let customerItemsPerPage = 1000; // 페이지당 항목 수
	let filteredCustomerData = []; // 검색 필터링된 데이터 (변수명 수정)

	window.call_m1_4 = function() {
		//loadCSSForMenu("/m1/m1_4.css");
		
		showLoading("data");
		
		$.ajax({
			url: "/read_customer",
			type: "POST",
			data: JSON.stringify(),
			contentType: "application/json",
			success: function(data) {
				console.log("-- 조회. 거래처 정보 --")
				console.log(data)

				hideLoading()

				globalCustomerData = data;
				filteredCustomerData = data;
				currentCustomerPage = 1;

				renderCustomerView();
			}
		});
	}

	// 거래처 뷰 렌더링 함수
	function renderCustomerView() {
		let content_output = `
			<div class="divBlockControl" id="view_m1_4">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_cuCode">CU_CODE</div>
								<input type="text" id="searchVal_cuCode" />
							</div>
							<div class="search-label">
								<div class="search_cuSangho">CU_SANGHO</div>
								<input type="text" id="searchVal_cuSangho" />
							</div>
							<div class="search-label">
								<div class="search_cuMaster">CU_MASTER</div>
								<input type="text" id="searchVal_cuMaster" />
							</div>
							<div class="search-label">
								<div class="search_cuAdcode">CU_ADCODE</div>
								<input type="text" id="searchVal_cuAdcode" />
							</div>
							<div class="search-label">
								<div class="search_cuJuso">CU_JUSO</div>
								<input type="text" id="searchVal_cuJuso" />
							</div>
							<div class="search-label">
								<div class="search_cuTAdd">CU_T_ADD</div>
								<input type="text" id="searchVal_cuTAdd" />
							</div>
							<div class="search-label">
								<div class="search_chkBuy">CHK_BUY</div>
								<input type="text" id="searchVal_chkBuy" />
							</div>
							<div class="search-label">
								<div class="search_chkSale">CHK_SALE</div>
								<input type="text" id="searchVal_chkSale" />
							</div>
							<div class="search-label">
								<div class="search_cuBigo">CU_BIGO</div>
								<input type="text" id="searchVal_cuBigo" />
							</div>
							<div class="search-label">
								<div class="search_cuAbbr">CU_ABBR</div>
								<input type="text" id="searchVal_cuAbbr" />
							</div>
							
							<button class="btnCustomerSearch">검색</button>
							<button class="btnCustomerSearchInit">초기화</button>
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
							<button class="btn btn-secondary">엑셀 다운로드</button>
						</div>
						
						<div class="table-info">
							<span>총 <strong id="customerTotalCount">${filteredCustomerData.length}</strong>건 | 
							페이지 <strong id="customerCurrentPageInfo">${currentCustomerPage}</strong>/<strong id="customerTotalPageInfo">${Math.ceil(filteredCustomerData.length / customerItemsPerPage)}</strong></span>
						</div>
						
						<table class="data-table">
							<thead>
								<tr>
									<th>NO</th>
									<th>CU_CODE</th>
									<th>CU_SANGHO</th>
									<th>CU_MASTER</th>
									<th>CU_ADCODE</th>
									<th>CU_JUSO</th>
									<th>CU_T_ADD</th>
									<th>CHK_BUY</th>
									<th>CHK_SALE</th>
									<th>CU_BIGO</th>
									<th>CU_ABBR</th>
								</tr>
							</thead>
							<tbody id="customerTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="customerPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;

		//$(".w_contentArea").html(content_output);
		$(".w_contentArea").append(content_output);

		// 테이블 데이터 렌더링
		renderCustomerTableData();

		// 페이지네이션 렌더링
		renderCustomerPagination();

		// 이벤트 바인딩
		bindCustomerEvents();
	}

	// 거래처 테이블 데이터 렌더링
	function renderCustomerTableData() {
		let tableBody = "";
		let startIndex = (currentCustomerPage - 1) * customerItemsPerPage;
		let endIndex = Math.min(startIndex + customerItemsPerPage, filteredCustomerData.length);

		for (let i = startIndex; i < endIndex; i++) {
			let rowNumber = i + 1;
			tableBody += `
				<tr>
					<td>${rowNumber}</td>
					<td>${filteredCustomerData[i].cu_code || ''}</td>
					<td>${filteredCustomerData[i].cu_sangho || ''}</td>
					<td>${filteredCustomerData[i].cu_master || ''}</td>
					<td>${filteredCustomerData[i].cu_adcode || ''}</td>
					<td>${filteredCustomerData[i].cu_juso || ''}</td>
					<td>${filteredCustomerData[i].cu_t_add || ''}</td>
					<td>${filteredCustomerData[i].chk_buy || ''}</td>
					<td>${filteredCustomerData[i].chk_sale || ''}</td>
					<td>${filteredCustomerData[i].cu_bigo || ''}</td>
					<td>${filteredCustomerData[i].cu_abbr || ''}</td>
				</tr>
			`;
		}

		$("#customerTableBody").html(tableBody);

		// 정보 업데이트
		$("#customerTotalCount").text(filteredCustomerData.length);
		$("#customerCurrentPageInfo").text(currentCustomerPage);
		$("#customerTotalPageInfo").text(Math.ceil(filteredCustomerData.length / customerItemsPerPage));
	}

	// 거래처 페이지네이션 렌더링
	function renderCustomerPagination() {
		let totalPages = Math.ceil(filteredCustomerData.length / customerItemsPerPage);
		let paginationHtml = "";

		// 이전 버튼
		if (currentCustomerPage > 1) {
			paginationHtml += `<button class="customer-page-btn" data-page="${currentCustomerPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="customer-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentCustomerPage - 5);
		let endPage = Math.min(totalPages, currentCustomerPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="customer-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentCustomerPage) {
				paginationHtml += `<button class="customer-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="customer-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="customer-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentCustomerPage < totalPages) {
			paginationHtml += `<button class="customer-page-btn" data-page="${currentCustomerPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="customer-page-btn disabled">&gt;</button>`;
		}

		$("#customerPaginationContainer").html(paginationHtml);
	}

	// 거래처 이벤트 바인딩
	function bindCustomerEvents() {
		// 검색 버튼 클릭
		$(".btnCustomerSearch").off('click').on('click', function() {
			performCustomerSearch();
		});

		// 초기화 버튼 클릭
		$(".btnCustomerSearchInit").off('click').on('click', function() {
			resetCustomerSearch();
		});

		// 페이지네이션 버튼 클릭
		$(document).off('click', '.customer-page-btn').on('click', '.customer-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentCustomerPage = page;
					renderCustomerTableData();
					renderCustomerPagination();
				}
			}
		});

		// 엔터키 검색
		$('#view_m1_4 input[type="text"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performCustomerSearch();
			}
		});
	}

	// 거래처 검색 수행
	function performCustomerSearch() {
		let searchCriteria = {
			cuCode: $("#searchVal_cuCode").val().toLowerCase(),
			cuSangho: $("#searchVal_cuSangho").val().toLowerCase(),
			cuMaster: $("#searchVal_cuMaster").val().toLowerCase(),
			cuAdcode: $("#searchVal_cuAdcode").val().toLowerCase(),
			cuJuso: $("#searchVal_cuJuso").val().toLowerCase(),
			cuTAdd: $("#searchVal_cuTAdd").val().toLowerCase(),
			chkBuy: $("#searchVal_chkBuy").val().toLowerCase(),
			chkSale: $("#searchVal_chkSale").val().toLowerCase(),
			cuBigo: $("#searchVal_cuBigo").val().toLowerCase(),
			cuAbbr: $("#searchVal_cuAbbr").val().toLowerCase()
		};

		filteredCustomerData = globalCustomerData.filter(item => {
			return (
				(!searchCriteria.cuCode || (item.cu_code && item.cu_code.toLowerCase().includes(searchCriteria.cuCode))) &&
				(!searchCriteria.cuSangho || (item.cu_sangho && item.cu_sangho.toLowerCase().includes(searchCriteria.cuSangho))) &&
				(!searchCriteria.cuMaster || (item.cu_master && item.cu_master.toLowerCase().includes(searchCriteria.cuMaster))) &&
				(!searchCriteria.cuAdcode || (item.cu_adcode && item.cu_adcode.toLowerCase().includes(searchCriteria.cuAdcode))) &&
				(!searchCriteria.cuJuso || (item.cu_juso && item.cu_juso.toLowerCase().includes(searchCriteria.cuJuso))) &&
				(!searchCriteria.cuTAdd || (item.cu_t_add && item.cu_t_add.toLowerCase().includes(searchCriteria.cuTAdd))) &&
				(!searchCriteria.chkBuy || (item.chk_buy && item.chk_buy.toLowerCase().includes(searchCriteria.chkBuy))) &&
				(!searchCriteria.chkSale || (item.chk_sale && item.chk_sale.toLowerCase().includes(searchCriteria.chkSale))) &&
				(!searchCriteria.cuBigo || (item.cu_bigo && item.cu_bigo.toLowerCase().includes(searchCriteria.cuBigo))) &&
				(!searchCriteria.cuAbbr || (item.cu_abbr && item.cu_abbr.toLowerCase().includes(searchCriteria.cuAbbr)))
			);
		});

		currentCustomerPage = 1;
		renderCustomerTableData();
		renderCustomerPagination();
		
		console.log(`거래처 검색 결과: ${filteredCustomerData.length}건`);
	}

	// 거래처 검색 초기화
	function resetCustomerSearch() {
		$("#searchVal_cuCode").val('');
		$("#searchVal_cuSangho").val('');
		$("#searchVal_cuMaster").val('');
		$("#searchVal_cuAdcode").val('');
		$("#searchVal_cuJuso").val('');
		$("#searchVal_cuTAdd").val('');
		$("#searchVal_chkBuy").val('');
		$("#searchVal_chkSale").val('');
		$("#searchVal_cuBigo").val('');
		$("#searchVal_cuAbbr").val('');

		filteredCustomerData = globalCustomerData;
		currentCustomerPage = 1;
		renderCustomerTableData();
		renderCustomerPagination();
		
		console.log('거래처 검색 조건이 초기화되었습니다.');
	}

	// 거래처 페이지당 항목 수 변경 (필요시 사용)
	window.changeCustomerItemsPerPage = function(newItemsPerPage) {
		customerItemsPerPage = newItemsPerPage;
		currentCustomerPage = 1;
		renderCustomerTableData();
		renderCustomerPagination();
	}

	// 거래처 데이터 export (필요시 사용)
	window.exportCustomerData = function() {
		return {
			total: globalCustomerData.length,
			filtered: filteredCustomerData.length,
			currentPage: currentCustomerPage,
			itemsPerPage: customerItemsPerPage,
			data: filteredCustomerData
		};
	}

});