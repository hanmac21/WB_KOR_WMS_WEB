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

// 출력 라벨 타입 옵션
const LABELINFO_OPTIONS = ['내부 일반', '출고 일반', '내부 소형', 'H/REST'];

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
				const toOrigin = (v) => (v === null || v === undefined) ? "" : String(v);

				allServerData.forEach(r => {
					r.__ORIGIN_CLOSE_CUSTOMER    = toOrigin(r.CLOSE_CUSTOMER    ?? r.close_customer);
					r.__ORIGIN_DELIVERY_CUSTOMER = toOrigin(r.DELIVERY_CUSTOMER  ?? r.delibery_customer);
					r.__ORIGIN_LABEL_INFO        = toOrigin(r.LABELINFO          ?? r.labelinfo);
					r.__ORIGIN_LABEL_1           = toOrigin(r.LABEL1             ?? r.label1);
					r.__ORIGIN_LABEL_2           = toOrigin(r.LABEL2             ?? r.label2);
					r.__ORIGIN_LABEL_3           = toOrigin(r.LABEL3             ?? r.label3);
					r.__ORIGIN_LABEL_4           = toOrigin(r.LABEL4             ?? r.label4);
					r.__ORIGIN_LABEL_5           = toOrigin(r.LABEL5             ?? r.label5);
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
								<div class="searchVal_spex">${i18n.t('search.spec')}<!-- SPEC --></div>
								<input type="text" id="productInfo_searchVal_spec" />
							</div>
							<div class="search-label">
								<div class="searchVal_custcode">${i18n.t('search.customercode')}<!-- CUSTCODE --></div>
								<input type="text" id="productInfo_searchVal_custcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_close">마감처<!-- CUSTCODE --></div>
								<input type="text" id="productInfo_searchVal_close" />
							</div>
							<div class="search-label">
								<div class="searchVal_delivery">납품처<!-- CUSTCODE --></div>
								<input type="text" id="productInfo_searchVal_delivery" />
							</div><div class="search-label">
							<div class="searchVal_labelinfo">출력 라벨 타입<!-- LABELINFO --></div>
								<select id="productInfo_searchVal_labelinfo">
									<option value="">전체</option>
									<option value="내부 일반">내부 일반</option>
									<option value="출고 일반">출고 일반</option>
									<option value="내부 소형">내부 소형</option>
									<option value="H/REST">H/REST</option>
								</select>
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
									<button class="btn btn-success" id="productInfoSaveBtn">Save</button>
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
									<th class = "itemcodeVal" data-sort="CLOSE_CUSTOMER">마감처<!-- ITEMCODE --></th>
									<th class = "itemcodeVal" data-sort="DELIVERY_CUSTOMER">납품처<!-- ITEMCODE --></th>
									<th class = "itemcodeVal" data-sort="LABELINFO">출력 라벨 타입<!-- ITEMCODE --></th>
									<th class = "itemcodeVal" data-sort="LABEL1">라벨 1<!-- ITEMCODE --></th>
									<th class = "itemcodeVal" data-sort="LABEL2">라벨 2<!-- ITEMCODE --></th>
									<th class = "itemcodeVal" data-sort="LABEL3">라벨 3<!-- ITEMCODE --></th>
									<th class = "itemcodeVal" data-sort="LABEL4">라벨 4<!-- ITEMCODE --></th>
									<th class = "itemcodeVal" data-sort="LABEL5">라벨 5<!-- ITEMCODE --></th>
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
			const ccVal = (data.CLOSE_CUSTOMER ?? data.close_customer);
			const dcVal = (data.DELIVERY_CUSTOMER ?? data.delibery_customer);
			const liVal = (data.LABELINFO ?? data.labelinfo);
			const l1Val = (data.LABEL1 ?? data.label1);
			const l2Val = (data.LABEL2 ?? data.label2);
			const l3Val = (data.LABEL3 ?? data.label3);
			const l4Val = (data.LABEL4 ?? data.label4);
			const l5Val = (data.LABEL5 ?? data.label5);

			const ccStr = (ccVal === null || ccVal === undefined) ? "" : String(ccVal);
			const dcStr = (dcVal === null || dcVal === undefined) ? "" : String(dcVal);
			const liStr = (liVal === null || liVal === undefined) ? "" : String(liVal);
			const l1Str = (l1Val === null || l1Val === undefined) ? "" : String(l1Val);
			const l2Str = (l2Val === null || l2Val === undefined) ? "" : String(l2Val);
			const l3Str = (l3Val === null || l3Val === undefined) ? "" : String(l3Val);
			const l4Str = (l4Val === null || l4Val === undefined) ? "" : String(l4Val);
			const l5Str = (l5Val === null || l5Val === undefined) ? "" : String(l5Val);

			// 최초 기준값(origin)
			const occ = String(data.__ORIGIN_CLOSE_CUSTOMER ?? "");
			const odc = String(data.__ORIGIN_DELIVERY_CUSTOMER ?? "");
			const oli = String(data.__ORIGIN_LABEL_INFO ?? "");
			const ol1 = String(data.__ORIGIN_LABEL_1 ?? "");
			const ol2 = String(data.__ORIGIN_LABEL_2 ?? "");
			const ol3 = String(data.__ORIGIN_LABEL_3 ?? "");
			const ol4 = String(data.__ORIGIN_LABEL_4 ?? "");
			const ol5 = String(data.__ORIGIN_LABEL_5 ?? "");

			// changed 계산(문자열 기준)
			const ccChanged = ccStr !== occ;
			const dcChanged = dcStr !== odc;
			const liChanged = liStr !== oli;
			const l1Changed = l1Str !== ol1;
			const l2Changed = l2Str !== ol2;
			const l3Changed = l3Str !== ol3;
			const l4Changed = l4Str !== ol4;
			const l5Changed = l5Str !== ol5;
			const rowChanged = ccChanged || dcChanged || liChanged || l1Changed || l2Changed || l3Changed || l4Changed || l5Changed;

			// 출력 라벨 타입(labelinfo) select 옵션 생성
			// 현재값이 목록에 없으면 빈 선택 + 해당 값을 옵션으로 추가하여 유실 방지
			let liOptions = `<option value=""></option>`;
			let liFound = false;
			for (let k = 0; k < LABELINFO_OPTIONS.length; k++) {
				const opt = LABELINFO_OPTIONS[k];
				const sel = (liStr === opt) ? 'selected' : '';
				if (sel) liFound = true;
				liOptions += `<option value="${opt}" ${sel}>${opt}</option>`;
			}
			if (!liFound && liStr !== "") {
				liOptions += `<option value="${liStr}" selected>${liStr}</option>`;
			}

			tableBody += `
				<tr data-itemcode="${data.ITEMCODE || data.itemcode || ''}" class="${rowChanged ? 'row-changed' : ''}">
					<td class = "noVal">${rowNumber}</td>
					<td class = "cucodeVal">${data.ITEMTYPE || data.itemcodetype || ''}</td>
					<td class = "cucodeVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "specVal">${data.SPEC || data.spec || ''}</td>
					<td class = "locationVal">${data.CUSTCODE || data.custcode || ''}</td>
					<td class = "itemcodeVal">
						<input type='text' class="text-input ${ccChanged ? 'changed' : ''}" data-field="close" 
							value="${ccStr}" data-origin="${occ}">
					</td>
					<td class = "itemcodeVal">
						<input type='text' class="text-input ${dcChanged ? 'changed' : ''}" data-field="delivery" 
							value="${dcStr}" data-origin="${odc}">
					</td>
					<td class = "itemcodeVal">
						<select class="text-input ${liChanged ? 'changed' : ''}" data-field="labelinfo" data-origin="${oli}">
							${liOptions}
						</select>
					</td>
					<td class = "itemcodeVal">
						<input type='text' class="text-input ${l1Changed ? 'changed' : ''}" data-field="label1" 
							value="${l1Str}" data-origin="${ol1}">
					</td>
					<td class = "itemcodeVal">
						<input type='text' class="text-input ${l2Changed ? 'changed' : ''}" data-field="label2" 
							value="${l2Str}" data-origin="${ol2}">
					</td>
					<td class = "itemcodeVal">
						<input type='text' class="text-input ${l3Changed ? 'changed' : ''}" data-field="label3" 
							value="${l3Str}" data-origin="${ol3}">
					</td>
					<td class = "itemcodeVal">
						<input type='text' class="text-input ${l4Changed ? 'changed' : ''}" data-field="label4" 
							value="${l4Str}" data-origin="${ol4}">
					</td>
					<td class = "itemcodeVal">
						<input type='text' class="text-input ${l5Changed ? 'changed' : ''}" data-field="label5" 
							value="${l5Str}" data-origin="${ol5}">
					</td>
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

		// ✅ 값 변경 감지 + allServerData 즉시 반영 (페이지 이동/정렬해도 유지)
		//    input(text) + select(labelinfo) 모두 .text-input 클래스 공유
		$(document).off('input change', '#productInfoTable .text-input').on('input change', '#productInfoTable .text-input', function () {
			const tr = $(this).closest('tr');

			const itemcode = tr.data('itemcode');
			const field = $(this).data('field');
			if (!itemcode || !field) return;

			// 화면 값(공백 trim) - select도 val()로 동일하게 동작
			const currentRaw = ($(this).val() ?? "").trim();
			const originRaw = String($(this).attr('data-origin') ?? "").trim();

			// 1) changed 토글
			const isChanged = (currentRaw !== originRaw);
			$(this).toggleClass('changed', isChanged);
			tr.toggleClass('row-changed', tr.find('.text-input.changed').length > 0);

			// 2) allServerData에 현재값 반영 (trim 값으로)
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
			close: $("#productInfo_searchVal_close").val().trim().toUpperCase(),
			delivery: $("#productInfo_searchVal_delivery").val().trim().toUpperCase(),
			labelinfo: $("#productInfo_searchVal_labelinfo").val(),
		};
	}


	function performProductInfoSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentProductInfoPage = 1;
		performProductInfoDBSearch(searchCriteria);
	}

	function resetProductInfoSearch() {

		$("#productInfo_searchVal_itemType").val('');
		$("#productInfo_searchVal_car").val('');
		$("#productInfo_searchVal_itemcode").val('');
		$("#productInfo_searchVal_itemname").val('');
		$("#productInfo_searchVal_spec").val('');
		$("#productInfo_searchVal_custcode").val('');
		$("#productInfo_searchVal_close").val('');
		$("#productInfo_searchVal_delivery").val('');
		$("#productInfo_searchVal_labelinfo").val('');   // select → 전체

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

	$(document).off("click", "#productInfoSaveBtn").on("click", "#productInfoSaveBtn", function () {
		const payload = [];

		const loginId = getCookie('userLoginId');

		$('#productInfoTable tbody tr.row-changed').each(function(){
			const tr = $(this);
			const itemcode = tr.data("itemcode").toString();

			if(!itemcode) return;

			const rowObj = { itemcode: itemcode, loginid: loginId };

			// 변경된 input/select만 담기
			tr.find(".text-input.changed").each(function(){
				const field = $(this).data("field").toString();
				let value = $(this).val();

				if(!field) return;

				// 앞뒤 공백 제거 (null 방어 포함). 문자 코드/라벨 값이므로 문자열 그대로 전달
				value = (value == null) ? "" : value.trim();
				rowObj[field] = value;
			});

			// itemcode, loginid 외에 변경된 필드가 있는지 체크
			if(Object.keys(rowObj).length > 2){
				payload.push(rowObj);
			}
		});

		if (payload.length == 0){
			alert(i18n.t('validation.no.change.items'));
			return;
		}

		if (!confirm(i18n.tf('confirmation.items.save', payload.length))){
			return;
		}

		showLoading("data");

		$.ajax({
			url: "/save_productInfo_changed",
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify({ records: payload }),
			success: function (res) {

				// data-field → origin 키 매핑
				const ORIGIN_MAP = {
					close:     '__ORIGIN_CLOSE_CUSTOMER',
					delivery:  '__ORIGIN_DELIVERY_CUSTOMER',
					labelinfo: '__ORIGIN_LABEL_INFO',
					label1:    '__ORIGIN_LABEL_1',
					label2:    '__ORIGIN_LABEL_2',
					label3:    '__ORIGIN_LABEL_3',
					label4:    '__ORIGIN_LABEL_4',
					label5:    '__ORIGIN_LABEL_5'
				};

				// DOM: origin 갱신 + changed 표시 제거 (input/select 공통)
				$("#productInfoTable tbody tr.row-changed").each(function () {
					$(this).find(".text-input.changed").each(function () {
						const v = $(this).val();
						$(this).attr("data-origin", v);
						$(this).data("origin", v);
						$(this).removeClass("changed");
					});

					$(this).removeClass("row-changed");
				});

				// allServerData의 origin도 payload 기준으로 갱신
				const savedMap = {};
				payload.forEach(p => { savedMap[String(p.itemcode)] = p; });

				allServerData.forEach(r => {
					const code = String(r.ITEMCODE ?? r.itemcode ?? "");
					const saved = savedMap[code];
					if (!saved) return;

					Object.keys(saved).forEach(field => {
						if (field === 'itemcode' || field === 'loginid') return;
						const originKey = ORIGIN_MAP[field];
						if (originKey) {
							r[originKey] = String(saved[field] ?? "");
						}
					});
				});

				hideLoading();

				alert(i18n.t('success.user.update'));
			},
			error: function (xhr, status, err) {
				console.error(err);
				hideLoading();
				alert("저장 실패");
			}
		});
	});

});