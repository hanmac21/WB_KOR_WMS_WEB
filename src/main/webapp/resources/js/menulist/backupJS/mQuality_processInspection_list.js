///* --------------------------------------------------------------
// * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
// * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
// * -------------------------------------------------------------- */
//
//// ✅ 전역 변수로 이동 (파일 최상단)
//let allServerData = [];
//let filteredData = [];
//let globalprocessInspectionListData = [];
//let currentprocessInspectionListPage = 1;
//let processInspectionListItemsPerPage = 100;
//let totalprocessInspectionListCount = 0;
//let totalprocessInspectionListPages = 0;
//let currentSortColumn = null;
//let currentSortOrder = 'asc';
//
//let totalQty = 0;
//let totalOkQty = 0;
//let totalNgQty = 0;
//
//$(document).ready(function() {
//
//	window.filteredprocessInspectionListData = [];
//	window.processInspectionListColumns = [
//		{ key: 'NO', header: 'no', type: 'number' },   // rowNumber
//		{ key: 'SDATE', header: 'date' },
//		{ key: 'ITEMCODE', header: 'itemcode' },
//		{ key: 'ITEMNAME', header: 'itemname' },
//		{ key: 'CAR', header: 'car' },
//
//		{ key: 'QTY', header: 'qty', type: 'number' },
//		{ key: 'OKQTY', header: 'okqty', type: 'number' },
//		{ key: 'NGQTY', header: 'ngqty', type: 'number' },
//
//		{ key: 'LINE', header: 'line' },
//		{ key: 'SOURCE', header: 'source' },
//
//		{ key: 'MAINCATEGORY', header: 'maincategory' },
//		{ key: 'SUBCATEGORY', header: 'subcategory' },
//		{ key: 'DETAILCATEGORY', header: 'detailcategory' },     // ⚠️ HTML엔 DATAILCATEGORY 오타였음
//		{ key: 'JUDGMENT', header: 'judgment' },
//
//		{ key: 'CUSTNAME', header: 'custname' },
//		{ key: 'MEMO', header: 'memo' },
//		{ key: 'UNIT', header: 'unit' },
//		{ key: 'HHMM', header: 'hh:mm' },
//
//		{ key: 'BARCODE', header: 'barcode' },
//		{ key: 'DEFBARCODE', header: 'defbarcode' }
//	];
//
//	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
//	window.call_mQuality_processInspection_list = function(menuId) {
//		showLoading("data");
//
//		const factory = getCookie('selectedFactory');
//		const { fromDate, toDate } = getDefaultDateRange();
//		let storage = 'Material';
//
//		performprocessInspectionListDBSearch({ factory, storage, toDate, fromDate });
//	}
//
//	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
//	function performprocessInspectionListDBSearch(searchCriteria) {
//		showLoading("data");
//
//		$.ajax({
//			url: "/read_processInspectionList",
//			type: "POST",
//			data: JSON.stringify({
//				searchParams: searchCriteria
//				// page, itemsPerPage 없음 = 전체 조회
//			}),
//			contentType: "application/json",
//			success: function(response) {
//				console.log("-- DB 조회 결과 (전체) --");
//				console.log(response);
//
//				// 서버에서 받은 전체 데이터 저장
//				allServerData = response.records || [];
//				filteredData = [...allServerData]; // 초기에는 필터링 없음
//
//				// 페이지 초기화
//				currentprocessInspectionListPage = 1;
//				currentSortColumn = null;
//				currentSortOrder = 'asc';
//
//				// 클라이언트에서 페이징 처리
//				applyClientPagination();
//
//				// 첫 번째 검색이라면 뷰를 렌더링
//				if (!$('#view_mQuality_processInspection_list').length) {
//					renderprocessInspectionListView();
//				} else {
//					// 기존 뷰가 있다면 테이블만 업데이트
//					renderprocessInspectionListTableData();
//					renderprocessInspectionListPagination();
//					updateprocessInspectionListTotalCount();
//				}
//
//				// ✅ totals: OVER() 컬럼은 첫 row에서만 가져오면 됨
//				totalQty = 0;
//				totalOkQty = 0;
//				totalNgQty = 0;
//
//				if (response.records && response.records.length > 0) {
//					const r0 = response.records[0];
//					totalQty = Number(r0.TOTALQTY ?? r0.totalqty ?? 0) || 0;
//					totalOkQty = Number(r0.TOTALOKQTY ?? r0.totalokqty ?? 0) || 0;
//					totalNgQty = Number(r0.TOTALNGQTY ?? r0.totalngqty ?? 0) || 0;
//				}
//
//				// 총 수량 업데이트
//				updateTotalQty();
//
//				hideLoading();
//			},
//			error: function(xhr, status, error) {
//				console.error("DB 조회 실패:", error);
//				hideLoading();
//				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
//			}
//		});
//	}
//
//	// 클라이언트에서 페이징 처리
//	function applyClientPagination() {
//		// ✅ 렌더링할 때마다 쿠키에서 읽기
//		processInspectionListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;
//
//		totalprocessInspectionListCount = filteredData.length;
//		totalprocessInspectionListPages = Math.ceil(totalprocessInspectionListCount / processInspectionListItemsPerPage);
//
//		// 현재 페이지 범위 계산
//		const startIndex = (currentprocessInspectionListPage - 1) * processInspectionListItemsPerPage;
//		const endIndex = startIndex + processInspectionListItemsPerPage;
//
//		// 현재 페이지 데이터 추출
//		globalprocessInspectionListData = filteredData.slice(startIndex, endIndex);
//		window.filteredprocessInspectionListData = globalprocessInspectionListData;
//	}
//
//	// 클라이언트에서 정렬 처리
//	function applyClientSort(column, dataType) {
//		// 같은 컬럼 클릭 시 정렬 방향 토글
//		if (currentSortColumn === column) {
//			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
//		} else {
//			currentSortColumn = column;
//			currentSortOrder = 'asc';
//		}
//
//		// 데이터 정렬
//		filteredData.sort((a, b) => {
//			let valA = a[column] || a[column.toLowerCase()] || '';
//			let valB = b[column] || b[column.toLowerCase()] || '';
//
//			// 데이터 타입별 처리
//			if (dataType === 'number') {
//				valA = parseFloat(valA) || 0;
//				valB = parseFloat(valB) || 0;
//			} else if (dataType === 'date') {
//				valA = new Date(valA).getTime() || 0;
//				valB = new Date(valB).getTime() || 0;
//			} else {
//				valA = String(valA).toUpperCase();
//				valB = String(valB).toUpperCase();
//			}
//
//			if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
//			if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
//			return 0;
//		});
//
//		// 페이지 1로 초기화 후 다시 페이징
//		currentprocessInspectionListPage = 1;
//		applyClientPagination();
//
//		// 테이블 업데이트
//		renderprocessInspectionListTableData();
//		renderprocessInspectionListPagination();
//		updateprocessInspectionListTotalCount();
//
//		// 헤더에 정렬 표시 업데이트
//		updateSortIndicators(column);
//	}
//
//	// 헤더에 정렬 방향 표시
//	function updateSortIndicators(column) {
//		$('.data-table thead th').removeClass('sort-asc sort-desc');
//		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
//	}
//
//	// 사용자 뷰 렌더링 함수
//	function renderprocessInspectionListView() {
//		let content_output = `
//			<div class="divBlockControl" id="view_mQuality_processInspection_list">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//								<input type="date" id="processInspectionList_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="processInspectionList_searchVal_toDate" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}</div>
//								<select id="processInspectionList_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')} </option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="processInspectionList_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="processInspectionList_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="processInspectionList_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="processInspectionList_searchVal_itemname" />
//							</div>
//						</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnprocessInspectionListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnprocessInspectionListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
//						</div>
//					</div>
//					
//					<!-- 탭 -->
//					<div class="tab-container">
//						<div class="tab">목록</div>
//					</div>
//					
//					<!-- 테이블 -->
//					<div class="table-container">
//						<div class="action-buttons">
//							<button class="btn btn-secondary">엑셀 다운로드</button>
//						</div>
//						
//					<div class="table-info">
//						<span>
//							${i18n.t('table.info.total')}
//							<strong id="processInspectionListTotalCount">${totalprocessInspectionListCount}</strong>
//							${i18n.t('table.info.records')}
//							|
//							${i18n.t('table.page')}
//							<strong id="processInspectionListCurrentPageInfo">${currentprocessInspectionListPage}</strong>/
//							<strong id="processInspectionListTotalPageInfo">${totalprocessInspectionListPages}</strong>
//							|
//							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span>
//							<span class="processInspectionListTotalQty" style="color:#007bff"></span>
//					
//							<span style="margin-left:10px;">OK : </span>
//							<span class="processInspectionListTotalOkQty" style="color:#28a745"></span>
//					
//							<span style="margin-left:10px;">NG : </span>
//							<span class="processInspectionListTotalNgQty" style="color:#dc3545"></span>
//						</span>
//					
//						<div class="action-buttons-right mQuality_processInspection_list">
//							<div id="defaultActions" class="action-group">
//								<button class="btn btn-success" id="processInspectionListExcelBtn" onclick="downloadAllprocessInspectionListData()">Excel</button>
//							</div>
//						</div>
//					</div>
//						<table class="data-table mQuality_processInspection_list" id="processInspectionListTable">
//							<thead>
//								<tr>
//									<th class="noVal">${i18n.t('table.no')}<!-- No --></th>
//									<th class="dateVal" data-sort="SDATE">${i18n.t('search.sdate')}<!-- ITEMCODE --></th>
//									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									<th class="carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
//									<th class="qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- Qty --></th>
//									<th class="qtyVal" data-sort="OKQTY" data-type="number">${i18n.t('search.okqty')}<!-- OKQty --></th>
//									<th class="qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('search.ngqty')}<!-- NGQty --></th>
//									<th class="qtyVal" data-sort="LINE">${i18n.t('search.lineno')}<!-- LINE --></th>
//									<th class="qtyVal" data-sort="SOURCE">${i18n.t('search.source')}<!-- SOURCE --></th>
//									<th class="qtyVal" data-sort="MAINCATEGORY">${i18n.t('search.maincategory')}<!-- MAINCATEGORY --></th>
//									<th class="qtyVal">Sub Category<!-- No --></th>
//									<th class="qtyVal">Detail Category<!-- No --></th>
//									<th class="qtyVal">Judgment<!-- No --></th>
//									<th class="itemnameVal">${i18n.t('search.custname')}<!-- No --></th>
//									<th class="qtyVal">${i18n.t('search.memo')}<!-- No --></th>
//									<th class="qtyVal">Unit<!-- No --></th>
//									<th class="hhmmVal" data-sort="HHMM">${i18n.t('table.time')}<!-- HHMM --></th>
//									<th class="barcodeVal" data-sort="HHMM">Lot<!-- HHMM --></th>
//									<th class="barcodeVal" data-sort="HHMM">DEFT Barcode<!-- HHMM --></th>
//								</tr>
//							</thead>
//							<tbody id="processInspectionListDetailTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="processInspectionListPaginationContainer">
//						</div>
//						
//						<!-- ✅ 이 부분 추가! -->
//						<div class="items-per-page-selector">
//						    <label for="processInspectionList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
//						    <select id="processInspectionList_itemsPerPage" class="items-per-page-select">
//						        <option value="100" selected>100</option>
//						        <option value="300">300</option>
//						        <option value="1000">1000</option>
//						    </select>
//						</div>
//
//					</div>
//				</div>
//			</div>
//		`;
//
//		$(".w_contentArea").append(content_output);
//
//		// 화면에 기본 날짜 세팅
//		(function() {
//			const { fromDate, toDate } = getDefaultDateRange();
//			$("#processInspectionList_searchVal_toDate").val(toDate);
//			$("#processInspectionList_searchVal_fromDate").val(fromDate);
//
//			// ✅ Select 초기값 설정 추가!
//			$("#processInspectionList_itemsPerPage").val(processInspectionListItemsPerPage);
//		})();
//
//		// 공장 및 창고 선택
//		renderFactoryStorage();
//		// 테이블 데이터 렌더링
//		renderprocessInspectionListTableData();
//		// 페이지네이션 렌더링
//		renderprocessInspectionListPagination();
//		// 이벤트 바인딩
//		bindprocessInspectionListEvents();
//		// 초기 렌더링 후 카운트 업데이트
//		updateprocessInspectionListTotalCount();
//	}
//
//	function fmtLocalDate(d) {
//		const y = d.getFullYear();
//		const m = String(d.getMonth() + 1).padStart(2, '0');
//		const dd = String(d.getDate()).padStart(2, '0');
//		return `${y}-${m}-${dd}`;
//	}
//
//	function getDefaultDateRange() {
//		const today = new Date();
//		const toDate = fmtLocalDate(today);
//		const fromDate = fmtLocalDate(today);
//		return { fromDate, toDate };
//	}
//
//	// 공장 및 창고 선택 함수
//	function renderFactoryStorage() {
//		const factory = $('#processInspectionList_searchVal_factory');
//		const storage = $('#processInspectionList_searchVal_storage');
//		const savedFactory = getCookie('selectedFactory');
//
//		function updateStorageOptions(factoryValue) {
//			storage.empty();
//
//			const options = {
//				'SALTILLO': ['REDCAGE'],
//				'PUEBLA': ['REDCAGE'],
//				'': ['REDCAGE']
//			};
//
//			const storageList = options[factoryValue] || options[''];
//
//			storageList.forEach(item => {
//				const text = item === 'all' ? i18n.t('search.all') : item;
//				storage.append(`<option value="${item}">${text}</option>`);
//			});
//
//			storage.val(storageList[0]);
//		}
//
//		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
//			factory.val(savedFactory);
//		}
//
//		updateStorageOptions(savedFactory || '');
//
//		factory.on('change', function() {
//			updateStorageOptions($(this).val());
//		});
//	}
//
//	function getCookie(cookieName) {
//		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//		return match ? decodeURIComponent(match[2]) : '';
//	}
//
//	// ✅ 추가!
//	function setCookie(cookieName, value, days = 365) {
//		const date = new Date();
//		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//		const expires = "expires=" + date.toUTCString();
//		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
//	}
//
//	function updateprocessInspectionListTotalCount() {
//		$('#processInspectionListTotalCount').text(Number(totalprocessInspectionListCount).toLocaleString());
//		$('#processInspectionListCurrentPageInfo').text(currentprocessInspectionListPage);
//		$('#processInspectionListTotalPageInfo').text(totalprocessInspectionListPages);
//	}
//
//	function renderprocessInspectionListTableData() {
//		let tableBody = "";
//
//		for (let i = 0; i < globalprocessInspectionListData.length; i++) {
//			let rowNumber = (currentprocessInspectionListPage - 1) * processInspectionListItemsPerPage + i + 1;
//
//			tableBody += `
//            <tr>
//                <td class="noVal">${rowNumber}</td>
//                <td class="dateVal">${globalprocessInspectionListData[i].SDATE || globalprocessInspectionListData[i].sdate || ''}</td>
//                <td class="itemcodeVal">${globalprocessInspectionListData[i].ITEMCODE || globalprocessInspectionListData[i].itemcode || ''}</td>
//                <td class="itemnameVal">${globalprocessInspectionListData[i].ITEMNAME || globalprocessInspectionListData[i].itemname || ''}</td>
//                <td class="carVal">${globalprocessInspectionListData[i].CAR || globalprocessInspectionListData[i].car || ''}</td>
//                <td class="qtyVal">${Number(globalprocessInspectionListData[i].QTY || globalprocessInspectionListData[i].qty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalprocessInspectionListData[i].OKQTY || globalprocessInspectionListData[i].okqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalprocessInspectionListData[i].NGQTY || globalprocessInspectionListData[i].ngqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${globalprocessInspectionListData[i].LINE || globalprocessInspectionListData[i].line || ''}</td>
//                <td class="qtyVal">${globalprocessInspectionListData[i].SOURCE || globalprocessInspectionListData[i].source || ''}</td>
//                <td class="qtyVal">${globalprocessInspectionListData[i].MAINCATEGORY || globalprocessInspectionListData[i].maincategory || ''}</td>
//                <td class="qtyVal">${globalprocessInspectionListData[i].SUBCATEGORY || globalprocessInspectionListData[i].subcategory || ''}</td>
//                <td class="qtyVal">${globalprocessInspectionListData[i].DETAILCATEGORY || globalprocessInspectionListData[i].detailcategory || ''}</td>
//                <td class="qtyVal">${globalprocessInspectionListData[i].JUDGMENT || globalprocessInspectionListData[i].judgement || ''}</td>
//                <td class="itemnameVal">${globalprocessInspectionListData[i].CUSTNAME || globalprocessInspectionListData[i].custname || ''}</td>
//                <td class="qtyVal">${globalprocessInspectionListData[i].MEMO || globalprocessInspectionListData[i].memo || ''}</td>
//                <td class="qtyVal">${globalprocessInspectionListData[i].UNIT || globalprocessInspectionListData[i].unit || ''}</td>
//                <td class="hhmmVal">${globalprocessInspectionListData[i].HHMM || globalprocessInspectionListData[i].hhmm || ''}</td>
//                <td class="barcodeVal">${globalprocessInspectionListData[i].BARCODE || globalprocessInspectionListData[i].barcode || ''}</td>
//                <td class="barcodeVal">${globalprocessInspectionListData[i].DEFBARCODE || globalprocessInspectionListData[i].defbarcode || ''}</td>
//            </tr>
//        `;
//		}
//
//		$("#processInspectionListDetailTableBody").html(tableBody);
//	}
//
//	function renderprocessInspectionListPagination() {
//		let paginationHtml = "";
//
//		if (currentprocessInspectionListPage > 1) {
//			paginationHtml += `<button class="processInspectionList-page-btn" data-page="${currentprocessInspectionListPage - 1}">&lt;</button>`;
//		} else {
//			paginationHtml += `<button class="processInspectionList-page-btn disabled">&lt;</button>`;
//		}
//
//		let startPage = Math.max(1, currentprocessInspectionListPage - 5);
//		let endPage = Math.min(totalprocessInspectionListPages, currentprocessInspectionListPage + 5);
//
//		if (startPage > 1) {
//			paginationHtml += `<button class="processInspectionList-page-btn" data-page="1">1</button>`;
//			if (startPage > 2) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//		}
//
//		for (let i = startPage; i <= endPage; i++) {
//			if (i === currentprocessInspectionListPage) {
//				paginationHtml += `<button class="processInspectionList-page-btn active" data-page="${i}">${i}</button>`;
//			} else {
//				paginationHtml += `<button class="processInspectionList-page-btn" data-page="${i}">${i}</button>`;
//			}
//		}
//
//		if (endPage < totalprocessInspectionListPages) {
//			if (endPage < totalprocessInspectionListPages - 1) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//			paginationHtml += `<button class="processInspectionList-page-btn" data-page="${totalprocessInspectionListPages}">${totalprocessInspectionListPages}</button>`;
//		}
//
//		if (currentprocessInspectionListPage < totalprocessInspectionListPages) {
//			paginationHtml += `<button class="processInspectionList-page-btn" data-page="${currentprocessInspectionListPage + 1}">&gt;</button>`;
//		} else {
//			paginationHtml += `<button class="processInspectionList-page-btn disabled">&gt;</button>`;
//		}
//
//		$("#processInspectionListPaginationContainer").html(paginationHtml);
//	}
//
//	function bindprocessInspectionListEvents() {
//		// 검색 버튼 클릭 - DB에서 새로 조회
//		$(".btnprocessInspectionListSearch").off('click').on('click', function() {
//			performprocessInspectionListSearch();
//		});
//
//		// 초기화 버튼 클릭
//		$(".btnprocessInspectionListSearchInit").off('click').on('click', function() {
//			resetprocessInspectionListSearch();
//		});
//
//		// ✅ 페이지당 항목 수 변경 이벤트 추가!
//		$('#processInspectionList_itemsPerPage').off('change').on('change', function() {
//			const newItemsPerPage = parseInt($(this).val());
//			changeprocessInspectionListItemsPerPage(newItemsPerPage);
//		});
//
//		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
//		$(document).off('click', '.processInspectionList-page-btn').on('click', '.processInspectionList-page-btn', function() {
//			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//				let page = parseInt($(this).data('page'));
//				if (page && page > 0) {
//					currentprocessInspectionListPage = page;
//					applyClientPagination();
//					renderprocessInspectionListTableData();
//					renderprocessInspectionListPagination();
//					updateprocessInspectionListTotalCount();
//				}
//			}
//		});
//
//		// 헤더 클릭 시 정렬
//		$('#processInspectionListTable thead th[data-sort]').off('click').on('click', function() {
//			const column = $(this).data('sort');
//			const dataType = $(this).data('type') || 'string';
//			applyClientSort(column, dataType);
//		});
//
//		// 엔터키 검색
//		$('#view_mQuality_processInspection_list input[type="text"], #view_mQuality_processInspection_list input[type="date"]').off('keypress').on('keypress', function(e) {
//			if (e.which === 13) {
//				performprocessInspectionListSearch();
//			}
//		});
//	}
//
//	function getCurrentSearchCriteria() {
//		return {
//			fromDate: $("#processInspectionList_searchVal_fromDate").val(),
//			toDate: $("#processInspectionList_searchVal_toDate").val(),
//			factory: $("#processInspectionList_searchVal_factory").val(),
//			storage: $("#processInspectionList_searchVal_storage").val(),
//			car: $("#processInspectionList_searchVal_car").val().trim().toUpperCase(),
//			itemcode: $("#processInspectionList_searchVal_itemcode").val().trim().toUpperCase(),
//			itemname: $("#processInspectionList_searchVal_itemname").val().trim().toUpperCase()
//		};
//	}
//
//	function performprocessInspectionListSearch() {
//		let searchCriteria = getCurrentSearchCriteria();
//		console.log("검색 조건:", searchCriteria);
//
//		currentprocessInspectionListPage = 1;
//		performprocessInspectionListDBSearch(searchCriteria);
//	}
//
//	function resetprocessInspectionListSearch() {
//		const factory = getCookie('selectedFactory');
//		const storage = 'Material';
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		$("#processInspectionList_searchVal_fromDate").val(fromDate);
//		$("#processInspectionList_searchVal_toDate").val(toDate);
//		$("#processInspectionList_searchVal_factory").val(factory);
//		$("#processInspectionList_searchVal_storage").val('Material');
//		$("#processInspectionList_searchVal_car").val('');
//		$("#processInspectionList_searchVal_itemcode").val('');
//		$("#processInspectionList_searchVal_itemname").val('');
//
//		currentprocessInspectionListPage = 1;
//		performprocessInspectionListDBSearch({ factory, storage, toDate, fromDate });
//
//		console.log('검색 조건이 초기화되었습니다.');
//	}
//
//	function updateTotalQty() {
//		$(".processInspectionListTotalQty").text(Number(totalQty).toLocaleString());
//		$(".processInspectionListTotalOkQty").text(Number(totalOkQty).toLocaleString());
//		$(".processInspectionListTotalNgQty").text(Number(totalNgQty).toLocaleString());
//	}
//
//	window.changeprocessInspectionListItemsPerPage = function(newItemsPerPage) {
//		processInspectionListItemsPerPage = newItemsPerPage;
//		currentprocessInspectionListPage = 1;
//
//		// ✅ 쿠키에 저장 추가!
//		setCookie('itemsPerPage', newItemsPerPage);
//
//		applyClientPagination();
//		renderprocessInspectionListTableData();
//		renderprocessInspectionListPagination();
//		updateprocessInspectionListTotalCount();
//	}
//
//	window.exportprocessInspectionListData = function() {
//		return {
//			total: filteredData.length,
//			currentPage: currentprocessInspectionListPage,
//			itemsPerPage: processInspectionListItemsPerPage,
//			data: filteredData
//		};
//	}
//});
//
//// 전체 데이터 엑셀 다운로드
//window.downloadAllprocessInspectionListData = function() {
//	let searchCriteria = {
//		fromDate: $("#processInspectionList_searchVal_fromDate").val(),
//		toDate: $("#processInspectionList_searchVal_toDate").val(),
//		factory: $("#processInspectionList_searchVal_factory").val(),
//		storage: $("#processInspectionList_searchVal_storage").val(),
//		car: $("#processInspectionList_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#processInspectionList_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#processInspectionList_searchVal_itemname").val().trim().toUpperCase()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_processInspectionList",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(response) {
//			console.log(response);
//
//			ExcelExporter.downloadExcel(filteredData, window.processInspectionListColumns, {
//				fileName: 'processInspectionList_All',
//				sheetName: 'processInspectionList'
//			});
//			hideLoading();
//		},
//		error: function() {
//			alert("전체 데이터 조회에 실패했습니다.");
//			hideLoading();
//		}
//	});
//};