/* --------------------------------------------------------------
 * 📌 기초자료 - 제품 관리 (서버 사이드 페이징)
 * 비고: 페이지마다 서버에서 100개씩 데이터 조회
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let currentPage = 1; // 현재 페이지
	let itemsPerPage = 1000; // 페이지당 항목 수
	let totalCount = 0; // 전체 데이터 개수
	let totalPages = 0; // 전체 페이지 수
	let currentSearchCriteria = {}; // 현재 검색 조건

	window.call_m1_3 = function() {
		//loadCSSForMenu("/m1/m1_3.css");
		
		// 초기 화면 렌더링
		renderProductView();
		
		// 첫 페이지 데이터 로드
		loadProductData(1);
		
		showLoading("data");
		
	}

	// 제품 뷰 렌더링 함수
	function renderProductView() {
		let content_output = `
			<div class="divBlockControl" id="view_m1_3">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_itemType">${i18n.t('search.itemType')}</div>
								<input type="text" id="searchVal_itemType" />
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}</div>
								<input type="text" id="searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="search_spec">${i18n.t('search.spec')}</div>
								<input type="text" id="searchVal_spec" />
							</div>
							<div class="search-label">
								<div class="search_oitemCode">OITEMCODE</div>
								<input type="text" id="searchVal_oitemCode" />
							</div>
							<div class="search-label">
								<div class="search_oitemName">OITEMNAME</div>
								<input type="text" id="searchVal_oitemName" />
							</div>
							<div class="search-label">
								<div class="search_spec2">${i18n.t('search.spec2')}</div>
								<input type="text" id="searchVal_spec2" />
							</div>
							<div class="search-label">
								<div class="search_labelColor">${i18n.t('search.labelColor')}</div>
								<input type="text" id="searchVal_labelColor" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnSearch">${i18n.t('btn.search')}</button>
								<button class="btn btn-secondary btnSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="totalCount">0</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="currentPageInfo">1</strong>/<strong id="totalPageInfo">1</strong> | 
							<span id="pageRange">1-100</span></span>
						</div>
						
						<table class="data-table m1_3">
							<thead>
								<tr>
									<th>${i18n.t('table.no')}</th>
									<th>${i18n.t('search.itemType')}</th>
									<th>${i18n.t('search.car')}</th>
									<th>${i18n.t('search.itemCode')}</th>
									<th>${i18n.t('search.itemName')}</th>
									<th>${i18n.t('search.spec')}</th>
									<th>OITEMCODE</th>
									<th>OITEMNAME</th>
									<th>${i18n.t('search.spec2')}</th>
									<th>${i18n.t('search.labelColor')}</th>
								</tr>
							</thead>
							<tbody id="productTableBody">
								<tr>
									<td colspan="10" class="loading-row">
										<div class="mini-spinner m1_3 m1_3"></div>
										${i18n.t('info.retrieving')}
									</td>
								</tr>
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="paginationContainer">
							<button class="page-btn disabled">&lt;</button>
							<button class="page-btn active">1</button>
							<button class="page-btn disabled">&gt;</button>
						</div>
					</div>
				</div>
			</div>
		`;

		//$(".w_contentArea").html(content_output);
		$(".w_contentArea").append(content_output);
		
		// 이벤트 바인딩
		bindEvents();
	}

	// 제품 데이터 로드 함수
	function loadProductData(page, searchCriteria = {}) {
		// 로딩 상태 표시
		showTableLoading();
		
		
		// 서버에 전송할 파라미터
		let requestData = {
			page: page,
			pageSize: itemsPerPage,
			searchCriteria: searchCriteria
		};

		console.log("-- 제품 데이터 요청 --");
		console.log("페이지:", page);
		console.log("검색 조건:", searchCriteria);

		$.ajax({
			url: "/read_product_paged", // 서버 사이드 페이징 API
			type: "POST",
			data: JSON.stringify(requestData),
			contentType: "application/json",
			success: function(response) {
				console.log("-- 제품 데이터 응답 --");
				console.log(response);
				
				hideLoading()
				
				// 응답 데이터 구조: 
				// {
				//   data: [...],
				//   totalCount: 1000,
				//   currentPage: 1,
				//   totalPages: 10
				// }

				currentPage = response.currentPage || page;
				totalCount = response.totalCount || 0;
				totalPages = response.totalPages || 0;
				currentSearchCriteria = searchCriteria;

				// 테이블 데이터 렌더링
				renderTableData(response.data || []);
				
				// 페이지네이션 렌더링
				renderPagination();
				
				// 테이블 정보 업데이트
				updateTableInfo();
				/*	setTimeout(() => {
						renderTableData(response.data || []);
						renderPagination();
						updateTableInfo();
					}, 300000);*/ // 3초 유지*/
			},
			error: function(xhr, status, error) {
				console.error("제품 데이터 로드 실패:", error);
				showTableError("데이터를 불러오는 중 오류가 발생했습니다.");
				hideLoading();
			}
		});
	}

	// 테이블 데이터 렌더링
	function renderTableData(data) {
		let tableBody = "";
		
		if (data.length === 0) {
			tableBody = `
				<tr>
					<td colspan="10" class="empty-row">
						검색 결과가 없습니다.
					</td>
				</tr>
			`;
		} else {
			for (let i = 0; i < data.length; i++) {
				let item = data[i];
				let globalRowNumber = (currentPage - 1) * itemsPerPage + i + 1;
				
				tableBody += `
					<tr>
						<td>${globalRowNumber}</td>
						<td>${item.itemtype || ''}</td>
						<td>${item.car || ''}</td>
						<td>${item.itemcode || ''}</td>
						<td>${item.itemname || ''}</td>
						<td>${item.spec || ''}</td>
						<td>${item.oitemcode || ''}</td>
						<td>${item.oitemname || ''}</td>
						<td>${item.spec2 || ''}</td>
						<td>${item.labelcolor || ''}</td>
					</tr>
				`;
			}
		}

		$("#productTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderPagination() {
		let paginationHtml = "";

		// 이전 버튼
		if (currentPage > 1) {
			paginationHtml += `<button class="page-btn" data-page="${currentPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentPage - 5);
		let endPage = Math.min(totalPages, currentPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentPage) {
				paginationHtml += `<button class="page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentPage < totalPages) {
			paginationHtml += `<button class="page-btn" data-page="${currentPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="page-btn disabled">&gt;</button>`;
		}

		$("#paginationContainer").html(paginationHtml);
	}

	// 테이블 정보 업데이트
	function updateTableInfo() {
		let startRecord = (currentPage - 1) * itemsPerPage + 1;
		let endRecord = Math.min(currentPage * itemsPerPage, totalCount);
		
		console.log(totalCount + " / " + currentPage + " / " + totalPages)
		$("#totalCount").text(totalCount.toLocaleString());
		$("#currentPageInfo").text(currentPage);
		$("#totalPageInfo").text(totalPages);
		$("#pageRange").text(`${startRecord.toLocaleString()}-${endRecord.toLocaleString()}`);
	}

	// 이벤트 바인딩
	function bindEvents() {
		// 검색 버튼 클릭
		$(document).off('click', '.btnSearch').on('click', '.btnSearch', function() {
			//console.log("검색 버튼 클릭됨"); // 디버그 로그
			performSearch();
		});

		// 초기화 버튼 클릭
		$(document).off('click', '.btnSearchInit').on('click', '.btnSearchInit', function() {
			//console.log("초기화 버튼 클릭됨"); // 디버그 로그 
			resetSearch();
		});

		// 페이지네이션 버튼 클릭
		$(document).off('click', '.page-btn').on('click', '.page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					//console.log("페이지 이동:", page); // 디버그 로그
					loadProductData(page, currentSearchCriteria);
				}
			}
		});

		// 선택자 사용 및 이벤트 위임 방식
		$(document).off('keypress', '#view_m1_3 input[type="text"]').on('keypress', '#view_m1_3 input[type="text"]', function(e) {
			if (e.which === 13) { // Enter 키
				console.log("엔터키 입력됨 - 검색 실행"); // 디버그 로그 
				e.preventDefault(); // 기본 동작 방지
				performSearch();
			}
		});

		// 검색 입력 필드에 포커스 아웃 시에도 검색 가능하도록
		$(document).off('blur', '#view_m1_3 input[type="text"]').on('blur', '#view_m1_3 input[type="text"]', function() {
			// 필요시 blur 이벤트에서도 처리 가능
		});
	}

	// 검색 수행
	function performSearch() {
		let searchCriteria = {
			itemtype: $("#searchVal_itemType").val().trim(),
			car: $("#searchVal_car").val().trim(),
			itemcode: $("#searchVal_itemcode").val().trim(),
			itemname: $("#searchVal_itemname").val().trim(),
			spec: $("#searchVal_spec").val().trim(),
			oitemcode: $("#searchVal_oitemCode").val().trim(),
			oitemname: $("#searchVal_oitemName").val().trim(),
			spec2: $("#searchVal_spec2").val().trim(),
			labelcolor: $("#searchVal_labelColor").val().trim()
		};

		// 빈 값 제거
		Object.keys(searchCriteria).forEach(key => {
			if (!searchCriteria[key]) {
				delete searchCriteria[key];
			}
		});

		console.log("검색 실행:", searchCriteria);

		// 검색 시 첫 페이지로 이동
		loadProductData(1, searchCriteria);
	}

	// 검색 초기화
	function resetSearch() {
		$("#searchVal_itemType").val('');
		$("#searchVal_car").val('');
		$("#searchVal_itemcode").val('');
		$("#searchVal_itemname").val('');
		$("#searchVal_spec").val('');
		$("#searchVal_oitemCode").val('');
		$("#searchVal_oitemName").val('');
		$("#searchVal_spec2").val('');
		$("#searchVal_labelColor").val('');

		console.log("검색 조건 초기화");

		// 검색 조건 없이 첫 페이지 로드
		loadProductData(1, {});
	}

	// 테이블 로딩 상태 표시
	function showTableLoading() {
		$("#productTableBody").html(`
			<tr>
				<td colspan="10" class="loading-row">
					<div class="mini-spinner m1_3 m1_3"></div>
					${i18n.t('info.retrieving')} <!-- 데이터를 불러오는 중입니다... -->
				</td>
			</tr>
		`);
	}

	// 테이블 에러 상태 표시
	function showTableError(message) {
		$("#productTableBody").html(`
			<tr>
				<td colspan="10" class="error-row">
					⚠️ ${message}
					<button class="retry-btn" onclick="loadProductData(${currentPage}, currentSearchCriteria)">다시 시도</button>
				</td>
			</tr>
		`);
	}

	// 페이지 새로고침 (외부에서 호출 가능)
	window.refreshProductData = function() {
		loadProductData(currentPage, currentSearchCriteria);
	}

	// 특정 페이지로 이동 (외부에서 호출 가능)
	window.goToProductPage = function(page) {
		if (page >= 1 && page <= totalPages) {
			loadProductData(page, currentSearchCriteria);
		}
	}

	// 현재 상태 정보 반환 (외부에서 호출 가능)
	window.getProductPageInfo = function() {
		return {
			currentPage: currentPage,
			totalPages: totalPages,
			totalCount: totalCount,
			itemsPerPage: itemsPerPage,
			searchCriteria: currentSearchCriteria
		};
	}

	// 페이지 크기 변경 (외부에서 호출 가능)
	window.changeProductPageSize = function(newPageSize) {
		itemsPerPage = newPageSize;
		loadProductData(1, currentSearchCriteria);
	}

	// 전역에서 검색 함수 호출 가능하도록
	window.performProductSearch = performSearch;
	window.resetProductSearch = resetSearch;

});