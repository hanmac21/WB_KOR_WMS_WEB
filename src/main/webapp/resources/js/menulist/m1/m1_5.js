/* --------------------------------------------------------------
 * 📌 기초자료 - BOM 관리 (서버 사이드 페이징 + Tree Accordion)
 * 비고: 페이지마다 서버에서 100개씩 Tree 데이터 조회
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let currentBomPage = 1; // 현재 페이지
	let bomItemsPerPage = 1000; // 페이지당 항목 수
	let totalBomCount = 0; // 전체 데이터 개수
	let totalBomPages = 0; // 전체 페이지 수
	let currentBomSearchCriteria = {}; // 현재 검색 조건
	let expandedItems = new Set(); // 펼쳐진 항목들 추적 (페이지별)

	window.call_m1_5 = function() {
		// 초기 화면 렌더링
		renderBomView();

		// 첫 페이지 데이터 로드
		loadBomData(1);

		showLoading("data");
	}

	// BOM 데이터 로드 함수 (서버 사이드 페이징)
	function loadBomData(page, searchCriteria = {}) {
		// 페이지 변경 시 확장 상태 무조건 초기화
		expandedItems.clear();
		
		// 로딩 상태 표시
		showBomTableLoading();
		
		/* 로딩창 디버깅 */
		//setTimeout(function() {
		
		
		// 서버에 전송할 파라미터
		let requestData = {
			page: page,
			pageSize: bomItemsPerPage,
			searchCriteria: searchCriteria
		};

		console.log("-- BOM 데이터 요청 --");
		console.log("페이지:", page);
		console.log("검색 조건:", searchCriteria);

		$.ajax({
			url: "/read_bom_paged", // 서버 사이드 페이징 API
			type: "POST",
			data: JSON.stringify(requestData),
			contentType: "application/json",
			success: function(response) {
				console.log("-- BOM 데이터 응답 --");
				console.log(response);

				hideLoading();

				// 응답 데이터 구조: 
				// {
				//   data: [...], // 이미 Tree 구조로 변환된 데이터
				//   totalCount: 1000,
				//   currentPage: 1,
				//   totalPages: 10
				// }

				currentBomPage = response.currentPage || page;
				totalBomCount = response.totalCount || 0;
				totalBomPages = response.totalPages || 0;
				currentBomSearchCriteria = searchCriteria;

				// 페이지 변경 시 확장 상태 초기화
				if (page !== currentBomPage || JSON.stringify(searchCriteria) !== JSON.stringify(currentBomSearchCriteria)) {
					expandedItems.clear();
				}
				
				// 🔥 데이터 로드 완료 후 확장 상태 재확인
				expandedItems.clear();
				console.log("데이터 로드 후 확장 상태:", expandedItems.size);
				

				// 테이블 데이터 렌더링
				renderBomTreeData(response.data || []);

				// 페이지네이션 렌더링
				renderBomPagination();

				// 테이블 정보 업데이트
				updateBomTableInfo();
			},
			error: function(xhr, status, error) {
				console.error("BOM 데이터 로드 실패:", error);
				showBomTableError("데이터를 불러오는 중 오류가 발생했습니다.");
				hideLoading();
			}
		});
		
		//}, 300000);
	}

	// BOM 뷰 렌더링 함수
	function renderBomView() {
		let content_output = `
			<div class="divBlockControl" id="view_m1_5">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_subName">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="searchVal_subName" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="search_spec">${i18n.t('search.spec3')}<!-- SPEC --></div>
								<input type="text" id="searchVal_spec" />
							</div>
							<div class="search-label">
								<div class="search_conDate">CONDATE</div>
								<input type="text" id="searchVal_conDate" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnBomSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnBomSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<button class="btn btn-info" id="expandAllBtn">전체 펼치기</button>
							<button class="btn btn-warning" id="collapseAllBtn">전체 접기</button>
						</div>
						
						<div class="table-info">
							<span>${i18n.t('table.info.total')} <strong id="bomTotalCount">0</strong> ${i18n.t('table.info.records')} | 
							${i18n.t('table.page')} <strong id="bomCurrentPageInfo">1</strong>/<strong id="bomTotalPageInfo">1</strong> | 
							<span id="bomPageRange">1-100</span></span>
						</div>
						
						<div class="bom-tree-container">
							<table class="data-table bom-tree-table m1_5">
								<thead>
									<tr>
										<th style="width: 40px;"></th>
										<th>${i18n.t('table.no')}<!-- NO --></th>
										<th>${i18n.t('search.car')}<!-- CAR --></th>
										<th>${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
										<th>${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
										<th>${i18n.t('search.spec3')}<!-- SPEC --></th>
										<th>CONDATE</th>
										<th>QTYPER</th>
										<th>ORDERIDX</th>
									</tr>
								</thead>
								<tbody id="bomTreeTableBody">
									<tr>
										<td colspan="9" class="loading-row">
											<div class="mini-spinner m1_5"></div>
											${i18n.t('info.retrieving')}<!-- 데이터를 불러오는 중입니다... -->
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="bomPaginationContainer">
							<button class="bom-page-btn disabled">&lt;</button>
							<button class="bom-page-btn active">1</button>
							<button class="bom-page-btn disabled">&gt;</button>
						</div>
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);

		// 이벤트 바인딩
		bindBomEvents();
	}

	// BOM Tree 테이블 데이터 렌더링 (서버에서 받은 페이지별 데이터)
	function renderBomTreeData(pageData) {
		let tableBody = "";

		if (pageData.length === 0) {
			tableBody = `
				<tr>
					<td colspan="9" class="empty-row">
						검색 결과가 없습니다.
					</td>
				</tr>
			`;
		} else {
			for (let i = 0; i < pageData.length; i++) {
				let parent = pageData[i];
				let globalRowNumber = (currentBomPage - 1) * bomItemsPerPage + i + 1;
				let hasChildren = parent.children && parent.children.length > 0;
				let isExpanded = expandedItems.has(parent.id);

				// 상위 항목 렌더링
				tableBody += `
					<tr class="parent-row ${isExpanded ? 'expanded' : ''}" data-parent-id="${parent.id}">
						<td>
							${hasChildren ? `<span class="expand-icon ${isExpanded ? 'expanded' : ''}">▶</span>` : '<span class="no-children">●</span>'}
						</td>
						<td>${globalRowNumber}</td>
						<td>${parent.subname || ''}</td>
						<td>${parent.itemcode || ''}</td>
						<td>${parent.itemname || ''}</td>
						<td>${parent.spec || ''}</td>
						<td>${parent.condate || ''}</td>
						<td>-</td>
						<td>-</td>
					</tr>
				`;

				// 하위 항목들 렌더링
				if (hasChildren) {
					parent.children.forEach((child, childIndex) => {
						tableBody += `
							<tr class="child-row ${!isExpanded ? 'child-hidden' : 'child-visible'}" 
								data-parent-id="${parent.id}" style="${!isExpanded ? 'display: none;' : ''}">
								<td></td>
								<td>${globalRowNumber}-${childIndex + 1}</td>
								<td>${i18n.t('table.subItem')}<!-- 하위품목 --></td>
								<td>${child.itemcode || ''}</td>
								<td>${child.itemname || ''}</td>
								<td>${child.spec || ''}</td>
								<td>-</td>
								<td>${child.qtyper || 0}</td>
								<td>${child.orderidx || 0}</td>
							</tr>
						`;
					});
				}
			}
		}

		$("#bomTreeTableBody").html(tableBody);

		setTimeout(() => {
			$('.child-row.child-hidden').hide();
			$('.child-row.child-visible').show();
		}, 50);
	}

	// BOM 페이지네이션 렌더링
	function renderBomPagination() {
		let paginationHtml = "";

		// 이전 버튼
		if (currentBomPage > 1) {
			paginationHtml += `<button class="bom-page-btn" data-page="${currentBomPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="bom-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentBomPage - 5);
		let endPage = Math.min(totalBomPages, currentBomPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="bom-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentBomPage) {
				paginationHtml += `<button class="bom-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="bom-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalBomPages) {
			if (endPage < totalBomPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="bom-page-btn" data-page="${totalBomPages}">${totalBomPages}</button>`;
		}

		// 다음 버튼
		if (currentBomPage < totalBomPages) {
			paginationHtml += `<button class="bom-page-btn" data-page="${currentBomPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="bom-page-btn disabled">&gt;</button>`;
		}

		$("#bomPaginationContainer").html(paginationHtml);
	}

	// BOM 테이블 정보 업데이트
	function updateBomTableInfo() {
		let startRecord = (currentBomPage - 1) * bomItemsPerPage + 1;
		let endRecord = Math.min(currentBomPage * bomItemsPerPage, totalBomCount);

		$("#bomTotalCount").text(totalBomCount.toLocaleString());
		$("#bomCurrentPageInfo").text(currentBomPage);
		$("#bomTotalPageInfo").text(totalBomPages);
		$("#bomPageRange").text(`${startRecord.toLocaleString()}-${endRecord.toLocaleString()}`);
	}

	// BOM 이벤트 바인딩
	function bindBomEvents() {
		// 검색 버튼 클릭
		$(document).off('click', '.btnBomSearch').on('click', '.btnBomSearch', function() {
			performBomSearch();
		});

		// 초기화 버튼 클릭
		$(document).off('click', '.btnBomSearchInit').on('click', '.btnBomSearchInit', function() {
			resetBomSearch();
		});

		// 페이지네이션 버튼 클릭
		$(document).off('click', '.bom-page-btn').on('click', '.bom-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					loadBomData(page, currentBomSearchCriteria);
				}
			}
		});

		// 부모 행 클릭 이벤트 (아코디언 토글)
		$(document).off('click', '.parent-row').on('click', '.parent-row', function() {
			let parentId = $(this).data('parent-id');
			toggleBomTreeNode(parentId);
		});

		// 전체 펼치기 버튼
		$(document).off('click', '#expandAllBtn').on('click', '#expandAllBtn', function() {
			expandAllBomNodes();
		});

		// 전체 접기 버튼
		$(document).off('click', '#collapseAllBtn').on('click', '#collapseAllBtn', function() {
			collapseAllBomNodes();
		});

		// 엔터키 검색
		$(document).off('keypress', '#view_m1_5 input[type="text"]').on('keypress', '#view_m1_5 input[type="text"]', function(e) {
			if (e.which === 13) {
				e.preventDefault();
				performBomSearch();
			}
		});
	}

	// BOM 검색 수행
	function performBomSearch() {
		let searchCriteria = {
			subname: $("#searchVal_subName").val().trim(),
			itemcode: $("#searchVal_itemcode").val().trim(),
			itemname: $("#searchVal_itemname").val().trim(),
			spec: $("#searchVal_spec").val().trim(),
			condate: $("#searchVal_conDate").val().trim()
		};

		// 빈 값 제거
		Object.keys(searchCriteria).forEach(key => {
			if (!searchCriteria[key]) {
				delete searchCriteria[key];
			}
		});

		console.log("BOM 검색 실행:", searchCriteria);

		// 검색 시 첫 페이지로 이동
		loadBomData(1, searchCriteria);
	}

	// BOM 검색 초기화
	function resetBomSearch() {
		$("#searchVal_subName").val('');
		$("#searchVal_itemcode").val('');
		$("#searchVal_itemname").val('');
		$("#searchVal_spec").val('');
		$("#searchVal_conDate").val('');

		console.log("BOM 검색 조건 초기화");

		// 검색 조건 없이 첫 페이지 로드
		loadBomData(1, {});
	}

	// Tree 노드 토글 함수 (현재 페이지 데이터만 대상)
	function toggleBomTreeNode(parentId) {
		if (!parentId) return;

		let $childRows = $(`.child-row[data-parent-id="${parentId}"]`);
		let $parentRow = $(`.parent-row[data-parent-id="${parentId}"]`);
		let $expandIcon = $parentRow.find('.expand-icon');

		if (expandedItems.has(parentId)) {
			// 접기
			expandedItems.delete(parentId);
			$expandIcon.removeClass('expanded');
			$parentRow.removeClass('expanded');

			$childRows.each(function(index) {
				let $row = $(this);
				setTimeout(() => {
					$row.removeClass('child-visible').addClass('child-hidden');
				}, index * 50);
			});

			setTimeout(() => {
				$childRows.slideUp({
					duration: 400,
					easing: 'easeOutCubic',
					complete: function() {
						$(this).removeClass('child-visible child-hidden');
					}
				});
			}, 100);

		} else {
			// 펼치기
			expandedItems.add(parentId);
			$expandIcon.addClass('expanded');
			$parentRow.addClass('expanded');

			$childRows.hide().slideDown({
				duration: 500,
				easing: 'easeOutBack',
				start: function() {
					$childRows.each(function(index) {
						let $row = $(this);
						setTimeout(() => {
							$row.removeClass('child-hidden').addClass('child-visible');
						}, index * 100);
					});
				}
			});
		}
	}

	// 현재 페이지의 모든 노드 펼치기
	function expandAllBomNodes() {
		$('.parent-row').each(function(index) {
			let parentId = $(this).data('parent-id');
			let hasChildren = $(this).find('.expand-icon').length > 0;

			if (hasChildren && !expandedItems.has(parentId)) {
				setTimeout(() => {
					expandedItems.add(parentId);

					let $childRows = $(`.child-row[data-parent-id="${parentId}"]`);
					let $parentRow = $(this);
					let $expandIcon = $parentRow.find('.expand-icon');

					$expandIcon.addClass('expanded');
					$parentRow.addClass('expanded');

					$childRows.hide().slideDown({
						duration: 600,
						easing: 'easeOutBack',
						start: function() {
							$childRows.each(function(childIndex) {
								let $row = $(this);
								setTimeout(() => {
									$row.removeClass('child-hidden').addClass('child-visible');
								}, childIndex * 80);
							});
						}
					});
				}, index * 150);
			}
		});
	}

	// 현재 페이지의 모든 노드 접기
	function collapseAllBomNodes() {
		$('.parent-row').each(function(index) {
			let parentId = $(this).data('parent-id');

			if (expandedItems.has(parentId)) {
				setTimeout(() => {
					let $childRows = $(`.child-row[data-parent-id="${parentId}"]`);
					let $parentRow = $(this);
					let $expandIcon = $parentRow.find('.expand-icon');

					$expandIcon.removeClass('expanded');
					$parentRow.removeClass('expanded');

					$childRows.each(function(childIndex) {
						let $row = $(this);
						let reverseIndex = $childRows.length - childIndex - 1;
						setTimeout(() => {
							$row.removeClass('child-visible').addClass('child-hidden');
						}, reverseIndex * 60);
					});

					setTimeout(() => {
						$childRows.slideUp({
							duration: 350,
							easing: 'easeOutCubic',
							complete: function() {
								$(this).removeClass('child-visible child-hidden');
							}
						});
					}, 300);

				}, index * 100);
			}
		});

		expandedItems.clear();
	}

	// BOM 테이블 로딩 상태 표시
	function showBomTableLoading() {
		$("#bomTreeTableBody").html(`
			<tr>
				<td colspan="9" class="loading-row">
					<div class="mini-spinner m1_5"></div>
					${i18n.t('info.retrieving')}<!-- 데이터를 불러오는 중입니다... -->
				</td>
			</tr>
		`);
	}

	// BOM 테이블 에러 상태 표시
	function showBomTableError(message) {
		$("#bomTreeTableBody").html(`
			<tr>
				<td colspan="9" class="error-row">
					⚠️ ${message}
					<button class="retry-btn" onclick="loadBomData(${currentBomPage}, currentBomSearchCriteria)">다시 시도</button>
				</td>
			</tr>
		`);
	}

	// 외부 호출 가능한 함수들
	window.refreshBomData = function() {
		loadBomData(currentBomPage, currentBomSearchCriteria);
	}

	window.goToBomPage = function(page) {
		if (page >= 1 && page <= totalBomPages) {
			loadBomData(page, currentBomSearchCriteria);
		}
	}

	window.getBomPageInfo = function() {
		return {
			currentPage: currentBomPage,
			totalPages: totalBomPages,
			totalCount: totalBomCount,
			itemsPerPage: bomItemsPerPage,
			searchCriteria: currentBomSearchCriteria,
			expandedItems: Array.from(expandedItems)
		};
	}

	window.changeBomPageSize = function(newPageSize) {
		bomItemsPerPage = newPageSize;
		loadBomData(1, currentBomSearchCriteria);
	}

	window.performBomSearch = performBomSearch;
	window.resetBomSearch = resetBomSearch;

	// easing 함수들 (기존과 동일)
	$.easing.easeOutCubic = function(x, t, b, c, d) {
		return c * ((t = t / d - 1) * t * t + 1) + b;
	};

	$.easing.easeOutBack = function(x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	};

});