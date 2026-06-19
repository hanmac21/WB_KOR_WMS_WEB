/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData = [];
let globalProductInfoData = [];
let currentProductInfoPage = 1;
let productInfoItemsPerPage = 100;
let totalProductInfoCount = 0;
let totalProductInfoPages = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

let totalQty = 0;

$(document).ready(function() {

	window.filteredProductInfoData = [];
	window.productInfoColumns = [
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mBasicData_productInfo = function(menuId) {
		showLoading("data");
		
		performProductInfoDBSearch({ });
	}
	

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performProductInfoDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_productInfo",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
				// page, itemsPerPage 없음 = 전체 조회
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				// 서버에서 받은 전체 데이터 저장
				allServerData = response.records || [];
				
				// ✅ 최초 기준값(origin) 보관 (공백 포함)
				allServerData.forEach(r => {
					const uwRaw = (r.UNIT_WEIGHT ?? r.unit_weight);
					const pwRaw = (r.PALLET_WEIGHT ?? r.pallet_weight);

					// origin은 문자열로 저장 (""도 보존)
					r.__ORIGIN_UNIT_WEIGHT  = (uwRaw === null || uwRaw === undefined) ? "" : String(uwRaw);
					r.__ORIGIN_PALLET_WEIGHT = (pwRaw === null || pwRaw === undefined) ? "" : String(pwRaw);
				});

				
				filteredData = [...allServerData]; // 초기에는 필터링 없음
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentProductInfoPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mBasicData_productInfo').length) {
					renderProductInfoView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderProductInfoTableData();
					renderProductInfoPagination();
					updateProductInfoTotalCount();
				}

				if (response.records && response.records.length > 0) {
					const r0 = response.records[0];

					totalQty = Number(r0.TOTALQTY ?? r0.totalqty ?? 0) || 0;
				}

				// ✅ 만약 서버가 totals를 records에 붙여서 주는 구조라면(방금 SQL처럼 OVER())
				// response.totalQty가 없을 때 첫 row에서 가져오기
				if ((!response.totalQty && response.records && response.records.length > 0)) {
					const r0 = response.records[0];
					totalQty = r0.TOTALQTY ?? r0.totalqty ?? totalQty;
				}


				// 총 수량 업데이트
				updateTotalQty();

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
		// ✅ 렌더링할 때마다 쿠키에서 읽기
		productInfoItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalProductInfoCount = filteredData.length;
		totalProductInfoPages = Math.ceil(totalProductInfoCount / productInfoItemsPerPage);

		// 현재 페이지 범위 계산
		const startIndex = (currentProductInfoPage - 1) * productInfoItemsPerPage;
		const endIndex = startIndex + productInfoItemsPerPage;

		// 현재 페이지 데이터 추출
		globalProductInfoData = filteredData.slice(startIndex, endIndex);
		window.filteredProductInfoData = globalProductInfoData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {		
		// 같은 컬럼 클릭 시 정렬 방향 토글
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		// 데이터 정렬
		filteredData.sort((a, b) => {
			let valA = a[column] ?? a[column.toLowerCase()] ?? '';
			let valB = b[column] ?? b[column.toLowerCase()] ?? '';

			// 데이터 타입별 처리
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

		// 페이지 1로 초기화 후 다시 페이징
		currentProductInfoPage = 1;
		applyClientPagination();

		// 테이블 업데이트
		renderProductInfoTableData();
		renderProductInfoPagination();
		updateProductInfoTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderProductInfoView() {
		let content_output = `
			<div class="divBlockControl" id="view_mBasicData_productInfo">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.itemType')}<!-- ITEMTYPE --></div>
								<input type="text" id="productInfo_searchVal_itemType" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="productInfo_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productInfo_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productInfo_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.spec')}<!-- SPEC --></div>
								<input type="text" id="productInfo_searchVal_spec" />
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.customercode')}<!-- CUSTCODE --></div>
								<input type="text" id="productInfo_searchVal_custcode" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnProductInfoSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnProductInfoSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
								<strong id="productInfoTotalCount">${totalProductInfoCount}</strong>
								${i18n.t('table.info.records')}
								|
								${i18n.t('table.page')}
								<strong id="productInfoCurrentPageInfo">${currentProductInfoPage}</strong>/
								<strong id="productInfoTotalPageInfo">${totalProductInfoPages}</strong>
								<!--|
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span>
								<span class="productInfoTotalQty" style="color:#007bff"></span>-->
							</span>
						
							<div class="action-buttons-right mBasicData_productInfo">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="productInfoSaveBtn" style="display:none;">Save</button>
									<button class="btn btn-success" id="productInfoExcelBtn" onclick="downloadAllProductInfoData()" style="display:none;">Execl</button>
								</div>
							</div>
						</div>

						<table class="data-table mBasicData_productInfo" id="productInfoTable">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
								    <th class = "cucodeVal" data-sort="ITEMTYPE">${i18n.t('search.itemType')}<!-- ITEMTYPE --></th>
									<th class = "cucodeVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = 'itemnameLongVal' data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = 'specVal' data-sort="SPEC">${i18n.t('search.spec')}<!-- SPEC --></th>									
									<th class = 'locationVal' data-sort="CUSTCODE">${i18n.t('search.customercode')}<!-- CUCODE --></th>
								</tr>
							</thead>
							<tbody id="productInfoListTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="productInfoPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="productInfo_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="productInfo_itemsPerPage" class="items-per-page-select">
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

		// 화면에 기본 날짜 세팅
		(function() {
			// ✅ Select 초기값 설정 추가!
			$("#productInfo_itemsPerPage").val(productInfoItemsPerPage);
		})();
		
		// 테이블 데이터 렌더링
		renderProductInfoTableData();
		// 페이지네이션 렌더링
		renderProductInfoPagination();
		// 이벤트 바인딩
		bindProductInfoEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateProductInfoTotalCount();
	}
	
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// ✅ 추가!
	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function updateProductInfoTotalCount() {
		$('#productInfoTotalCount').text(Number(totalProductInfoCount).toLocaleString());
		$('#productInfoCurrentPageInfo').text(currentProductInfoPage);
		$('#productInfoTotalPageInfo').text(totalProductInfoPages);
	}

	function renderProductInfoTableData() {
		let tableBody = "";

		for (let i = 0; i < globalProductInfoData.length; i++) {
			let rowNumber = (currentProductInfoPage - 1) * productInfoItemsPerPage + i + 1;
			let data = globalProductInfoData[i];

			// 현재값(화면 표시용) - null/undefined만 공백, 0은 유지
			const uwVal = (data.UNIT_WEIGHT ?? data.unit_weight);
			const pwVal = (data.PALLET_WEIGHT ?? data.pallet_weight);

			const uwStr = (uwVal === null || uwVal === undefined) ? "" : String(uwVal);
			const pwStr = (pwVal === null || pwVal === undefined) ? "" : String(pwVal);

			// 최초 기준값(origin)
			const ouw = String(data.__ORIGIN_UNIT_WEIGHT ?? "");
			const opw = String(data.__ORIGIN_PALLET_WEIGHT ?? "");

			// changed 계산(문자열 기준)
			const uwChanged = uwStr !== ouw;
			const pwChanged = pwStr !== opw;
			const rowChanged = uwChanged || pwChanged;
			
			tableBody += `
            <tr data-itemcode="${data.ITEMCODE || data.itemcode || ''}" class="${rowChanged ? 'row-changed' : ''}">
            	<td class = "noVal">${rowNumber}</td>
				<td class = "cucodeVal">${data.ITEMTYPE || data.itemcodetype || ''}</td>
				<td class = "cucodeVal">${data.CAR || data.car || ''}</td>
				<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
				<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
				<td class = "specVal">${data.SPEC || data.spec || ''}</td>
				<td class = "locationVal">${data.CUSTCODE || data.custcode || ''}</td>
            </tr>
        `;
		}

		$("#productInfoListTableBody").html(tableBody);
	}

	function renderProductInfoPagination() {
		let paginationHtml = "";

		if (currentProductInfoPage > 1) {
			paginationHtml += `<button class="productInfo-page-btn" data-page="${currentProductInfoPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="productInfo-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentProductInfoPage - 5);
		let endPage = Math.min(totalProductInfoPages, currentProductInfoPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="productInfo-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentProductInfoPage) {
				paginationHtml += `<button class="productInfo-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="productInfo-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalProductInfoPages) {
			if (endPage < totalProductInfoPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="productInfo-page-btn" data-page="${totalProductInfoPages}">${totalProductInfoPages}</button>`;
		}

		if (currentProductInfoPage < totalProductInfoPages) {
			paginationHtml += `<button class="productInfo-page-btn" data-page="${currentProductInfoPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="productInfo-page-btn disabled">&gt;</button>`;
		}

		$("#productInfoPaginationContainer").html(paginationHtml);
	}

	function bindProductInfoEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnProductInfoSearch").off('click').on('click', function() {
			performProductInfoSearch();
		});

		// 초기화 버튼 클릭
		$(".btnProductInfoSearchInit").off('click').on('click', function() {
			resetProductInfoSearch();
		});

		// ✅ 페이지당 항목 수 변경 이벤트 추가
		$('#productInfo_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeProductInfoItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
		$(document).off('click', '.productInfo-page-btn').on('click', '.productInfo-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentProductInfoPage = page;
					applyClientPagination();
					renderProductInfoTableData();
					renderProductInfoPagination();
					updateProductInfoTotalCount();
				}
			}
		});

		// 헤더 클릭 시 정렬
		$('#productInfoTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mBasicData_productInfo input[type="text"], #view_mBasicData_productInfo input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performProductInfoSearch();
			}
		});
		
		// ✅ 수량 변경 감지 + allServerData 즉시 반영 (페이지 이동/정렬해도 유지)
		$(document).off('input change', '#productInfoTable .qty-input').on('input change', '#productInfoTable .qty-input', function () {
			const tr = $(this).closest('tr');

			const itemcode = tr.data('itemcode');
			const field = $(this).data('field');
			if (!itemcode || !field) return;

			// 화면 값(공백 허용)
			const currentRaw = ($(this).val() ?? "");
			const originRaw = String($(this).attr('data-origin') ?? "");

			// 1) changed 토글 (문자열 비교)
			const isChanged = (String(currentRaw) !== originRaw);
			$(this).toggleClass('changed', isChanged);
			tr.toggleClass('row-changed', tr.find('.qty-input.changed').length > 0);

			// 2) allServerData에 현재값 반영 (공백이면 "" 저장)
			const target = allServerData.find(r => String(r.ITEMCODE ?? r.itemcode ?? '') === itemcode);
			if (target) {
				target[field] = currentRaw;
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			itemtype: $("#productInfo_searchVal_itemType").val().trim().toUpperCase(),
			car: $("#productInfo_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#productInfo_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#productInfo_searchVal_itemname").val().trim().toUpperCase(),
			spec: $("#productInfo_searchVal_spec").val().trim().toUpperCase(),
			custcode: $("#productInfo_searchVal_custcode").val().trim().toUpperCase(),
		};
	}


	function performProductInfoSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentProductInfoPage = 1;
		performProductInfoDBSearch(searchCriteria);
	}

	function resetProductInfoSearch() {
		
		$("#productInfo_searchVal_itemcode").val('');
		$("#productInfo_searchVal_itemname").val('');

		// ✅ totals 즉시 초기화 (UI도 즉시 반영)
		totalQty = 0;
		updateTotalQty();

		currentProductInfoPage = 1;
		performProductInfoDBSearch({ });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".productInfoTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeProductInfoItemsPerPage = function(newItemsPerPage) {
		productInfoItemsPerPage = newItemsPerPage;
		currentProductInfoPage = 1; // 페이지를 1로 초기화

		// ✅ 쿠키에 저장 추가!
		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderProductInfoTableData();
		renderProductInfoPagination();
		updateProductInfoTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportProductInfoData = function() {
		return {
			total: filteredData.length,
			currentPage: currentProductInfoPage,
			itemsPerPage: productInfoItemsPerPage,
			data: filteredData
		};
	}
});
