///* --------------------------------------------------------------
// * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
// * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
// * -------------------------------------------------------------- */
//
//let allServerData = [];
//let filteredData = [];
//let globalWarehouseInspectionListData = [];
//let currentWarehouseInspectionListPage = 1;
//let warehouseInspectionListItemsPerPage = 100;
//let totalWarehouseInspectionListCount = 0;
//let totalWarehouseInspectionListPages = 0;
//let currentSortColumn = null;
//let currentSortOrder = 'asc';
//
//let totalQty = 0;
//let totalOkQty = 0;
//let totalNgQty = 0;
//
//$(document).ready(function() {
//
//	window.filteredWarehouseInspectionListData = [];
//	window.warehouseInspectionListColumns = [
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
//	window.call_mQuality_warehouseInspection_list = function(menuId) {
//		showLoading("data");
//
//		const factory = getCookie('selectedFactory');
//		const { fromDate, toDate } = getDefaultDateRange();
//		let storage = 'Material';
//
//		performWarehouseInspectionListDBSearch({ factory, storage, toDate, fromDate });
//	}
//
//	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
//	function performWarehouseInspectionListDBSearch(searchCriteria) {
//		showLoading("data");
//
//		$.ajax({
//			url: "/read_warehouseInspectionList",
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
//				// ✅ totals 초기화
//				totalQty = 0;
//				totalOkQty = 0;
//				totalNgQty = 0;
//
//				// ✅ SQL이 OVER()로 totals를 records에 붙여서 주는 경우: 첫 row에서 꺼냄
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
//				// ✅ 페이지 초기화
//				currentWarehouseInspectionListPage = 1;
//				currentSortColumn = null;
//				currentSortOrder = 'asc';
//
//				// ✅ 클라이언트 페이징 (globalWarehouseInspectionListData 채움)
//				applyClientPagination();
//
//				// ✅ 화면이 없으면 최초 렌더, 있으면 테이블만 갱신
//				if (!$('#view_mQuality_warehouseInspection_list').length) {
//					renderWarehouseInspectionListView();
//				} else {
//					renderWarehouseInspectionListTableData();
//					renderWarehouseInspectionListPagination();
//					updateWarehouseInspectionListTotalCount();
//				}
//
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
//		warehouseInspectionListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;
//
//		totalWarehouseInspectionListCount = filteredData.length;
//		totalWarehouseInspectionListPages = Math.ceil(totalWarehouseInspectionListCount / warehouseInspectionListItemsPerPage);
//
//		// 현재 페이지 범위 계산
//		const startIndex = (currentWarehouseInspectionListPage - 1) * warehouseInspectionListItemsPerPage;
//		const endIndex = startIndex + warehouseInspectionListItemsPerPage;
//
//		// 현재 페이지 데이터 추출
//		globalWarehouseInspectionListData = filteredData.slice(startIndex, endIndex);
//		window.filteredWarehouseInspectionListData = globalWarehouseInspectionListData;
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
//		currentWarehouseInspectionListPage = 1;
//		applyClientPagination();
//
//		// 테이블 업데이트
//		renderWarehouseInspectionListTableData();
//		renderWarehouseInspectionListPagination();
//		updateWarehouseInspectionListTotalCount();
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
//	function renderWarehouseInspectionListView() {
//		let content_output = `
//			<div class="divBlockControl" id="view_mQuality_warehouseInspection_list">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//								<input type="date" id="warehouseInspectionList_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="warehouseInspectionList_searchVal_toDate" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}</div>
//								<select id="warehouseInspectionList_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')} </option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="warehouseInspectionList_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="warehouseInspectionList_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="warehouseInspectionList_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="warehouseInspectionList_searchVal_itemname" />
//							</div>
//						</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnWarehouseInspectionListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnWarehouseInspectionListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//						<div class="table-info">
//							<span>
//								${i18n.t('table.info.total')}
//								<strong id="warehouseInspectionListTotalCount">${totalWarehouseInspectionListCount}</strong>
//								${i18n.t('table.info.records')}
//								|
//								${i18n.t('table.page')}
//								<strong id="warehouseInspectionListCurrentPageInfo">${currentWarehouseInspectionListPage}</strong>/
//								<strong id="warehouseInspectionListTotalPageInfo">${totalWarehouseInspectionListPages}</strong>
//								|
//								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span>
//								<span class="warehouseInspectionListTotalQty" style="color:#007bff"></span>
//						
//								<span style="margin-left:10px;">OK : </span>
//								<span class="warehouseInspectionListTotalOkQty" style="color:#28a745"></span>
//						
//								<span style="margin-left:10px;">NG : </span>
//								<span class="warehouseInspectionListTotalNgQty" style="color:#dc3545"></span>
//							</span>
//						
//							<div class="action-buttons-right mQuality_warehouseInspection_list">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="warehouseInspectionListExcelBtn" onclick="downloadAllWarehouseInspectionListData()">Excel</button>
//								</div>
//							</div>
//						</div>
//
//						<table class="data-table mQuality_warehouseInspection_list" id="warehouseInspectionListTable">
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
//							<tbody id="warehouseInspectionListDetailTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="warehouseInspectionListPaginationContainer">
//						</div>
//						<div class="items-per-page-selector">
//					        <label for="warehouseInspectionList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
//					        <select id="warehouseInspectionList_itemsPerPage" class="items-per-page-select">
//					            <option value="100" selected>100</option>
//					            <option value="300">300</option>
//					            <option value="1000">1000</option>
//					        </select>
//					    </div>
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
//			$("#warehouseInspectionList_searchVal_toDate").val(toDate);
//			$("#warehouseInspectionList_searchVal_fromDate").val(fromDate);
//
//			// ✅ Select 초기값 설정 추가!
//			$("#warehouseInspectionList_itemsPerPage").val(warehouseInspectionListItemsPerPage);
//		})();
//
//		// 공장 및 창고 선택
//		renderFactoryStorage();
//		// 테이블 데이터 렌더링
//		renderWarehouseInspectionListTableData();
//		// 페이지네이션 렌더링
//		renderWarehouseInspectionListPagination();
//		// 이벤트 바인딩
//		bindWarehouseInspectionListEvents();
//		// 초기 렌더링 후 카운트 업데이트
//		updateWarehouseInspectionListTotalCount();
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
//		const factory = $('#warehouseInspectionList_searchVal_factory');
//		const storage = $('#warehouseInspectionList_searchVal_storage');
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
//	function updateWarehouseInspectionListTotalCount() {
//		$('#warehouseInspectionListTotalCount').text(Number(totalWarehouseInspectionListCount).toLocaleString());
//		$('#warehouseInspectionListCurrentPageInfo').text(currentWarehouseInspectionListPage);
//		$('#warehouseInspectionListTotalPageInfo').text(totalWarehouseInspectionListPages);
//	}
//
//	function renderWarehouseInspectionListTableData() {
//		let tableBody = "";
//
//		for (let i = 0; i < globalWarehouseInspectionListData.length; i++) {
//			let rowNumber = (currentWarehouseInspectionListPage - 1) * warehouseInspectionListItemsPerPage + i + 1;
//
//			tableBody += `
//            <tr>
//                <td class="noVal">${rowNumber}</td>
//                <td class="dateVal">${globalWarehouseInspectionListData[i].SDATE || globalWarehouseInspectionListData[i].sdate || ''}</td>
//                <td class="itemcodeVal">${globalWarehouseInspectionListData[i].ITEMCODE || globalWarehouseInspectionListData[i].itemcode || ''}</td>
//                <td class="itemnameVal">${globalWarehouseInspectionListData[i].ITEMNAME || globalWarehouseInspectionListData[i].itemname || ''}</td>
//                <td class="carVal">${globalWarehouseInspectionListData[i].CAR || globalWarehouseInspectionListData[i].car || ''}</td>
//                <td class="qtyVal">${Number(globalWarehouseInspectionListData[i].QTY || globalWarehouseInspectionListData[i].qty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalWarehouseInspectionListData[i].OKQTY || globalWarehouseInspectionListData[i].okqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalWarehouseInspectionListData[i].NGQTY || globalWarehouseInspectionListData[i].ngqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${globalWarehouseInspectionListData[i].LINE || globalWarehouseInspectionListData[i].line || ''}</td>
//                <td class="qtyVal">${globalWarehouseInspectionListData[i].SOURCE || globalWarehouseInspectionListData[i].source || ''}</td>
//                <td class="qtyVal">${globalWarehouseInspectionListData[i].MAINCATEGORY || globalWarehouseInspectionListData[i].maincategory || ''}</td>
//                <td class="qtyVal">${globalWarehouseInspectionListData[i].SUBCATEGORY || globalWarehouseInspectionListData[i].subcategory || ''}</td>
//                <td class="qtyVal">${globalWarehouseInspectionListData[i].DETAILCATEGORY || globalWarehouseInspectionListData[i].detailcategory || ''}</td>
//                <td class="qtyVal">${globalWarehouseInspectionListData[i].JUDGMENT || globalWarehouseInspectionListData[i].judgement || ''}</td>
//                <td class="itemnameVal">${globalWarehouseInspectionListData[i].CUSTNAME || globalWarehouseInspectionListData[i].custname || ''}</td>
//                <td class="qtyVal">${globalWarehouseInspectionListData[i].MEMO || globalWarehouseInspectionListData[i].memo || ''}</td>
//                <td class="qtyVal">${globalWarehouseInspectionListData[i].UNIT || globalWarehouseInspectionListData[i].unit || ''}</td>
//                <td class="hhmmVal">${globalWarehouseInspectionListData[i].HHMM || globalWarehouseInspectionListData[i].hhmm || ''}</td>
//                <td class="barcodeVal">${globalWarehouseInspectionListData[i].BARCODE || globalWarehouseInspectionListData[i].barcode || ''}</td>
//                <td class="barcodeVal">${globalWarehouseInspectionListData[i].DEFBARCODE || globalWarehouseInspectionListData[i].defbarcode || ''}</td>
//            </tr>
//        `;
//		}
//
//		$("#warehouseInspectionListDetailTableBody").html(tableBody);
//	}
//
//	function renderWarehouseInspectionListPagination() {
//		let paginationHtml = "";
//
//		if (currentWarehouseInspectionListPage > 1) {
//			paginationHtml += `<button class="warehouseInspectionList-page-btn" data-page="${currentWarehouseInspectionListPage - 1}">&lt;</button>`;
//		} else {
//			paginationHtml += `<button class="warehouseInspectionList-page-btn disabled">&lt;</button>`;
//		}
//
//		let startPage = Math.max(1, currentWarehouseInspectionListPage - 5);
//		let endPage = Math.min(totalWarehouseInspectionListPages, currentWarehouseInspectionListPage + 5);
//
//		if (startPage > 1) {
//			paginationHtml += `<button class="warehouseInspectionList-page-btn" data-page="1">1</button>`;
//			if (startPage > 2) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//		}
//
//		for (let i = startPage; i <= endPage; i++) {
//			if (i === currentWarehouseInspectionListPage) {
//				paginationHtml += `<button class="warehouseInspectionList-page-btn active" data-page="${i}">${i}</button>`;
//			} else {
//				paginationHtml += `<button class="warehouseInspectionList-page-btn" data-page="${i}">${i}</button>`;
//			}
//		}
//
//		if (endPage < totalWarehouseInspectionListPages) {
//			if (endPage < totalWarehouseInspectionListPages - 1) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//			paginationHtml += `<button class="warehouseInspectionList-page-btn" data-page="${totalWarehouseInspectionListPages}">${totalWarehouseInspectionListPages}</button>`;
//		}
//
//		if (currentWarehouseInspectionListPage < totalWarehouseInspectionListPages) {
//			paginationHtml += `<button class="warehouseInspectionList-page-btn" data-page="${currentWarehouseInspectionListPage + 1}">&gt;</button>`;
//		} else {
//			paginationHtml += `<button class="warehouseInspectionList-page-btn disabled">&gt;</button>`;
//		}
//
//		$("#warehouseInspectionListPaginationContainer").html(paginationHtml);
//	}
//
//	function bindWarehouseInspectionListEvents() {
//		// 검색 버튼 클릭 - DB에서 새로 조회
//		$(".btnWarehouseInspectionListSearch").off('click').on('click', function() {
//			performWarehouseInspectionListSearch();
//		});
//
//		// 초기화 버튼 클릭
//		$(".btnWarehouseInspectionListSearchInit").off('click').on('click', function() {
//			resetWarehouseInspectionListSearch();
//		});
//
//		// ✅ 페이지당 항목 수 변경 이벤트 추가
//		$('#warehouseInspectionList_itemsPerPage').off('change').on('change', function() {
//			const newItemsPerPage = parseInt($(this).val());
//			changeWarehouseInspectionListItemsPerPage(newItemsPerPage);
//		});
//
//		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
//		$(document).off('click', '.warehouseInspectionList-page-btn').on('click', '.warehouseInspectionList-page-btn', function() {
//			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//				let page = parseInt($(this).data('page'));
//				if (page && page > 0) {
//					currentWarehouseInspectionListPage = page;
//					applyClientPagination();
//					renderWarehouseInspectionListTableData();
//					renderWarehouseInspectionListPagination();
//					updateWarehouseInspectionListTotalCount();
//				}
//			}
//		});
//
//		// 헤더 클릭 시 정렬
//		$('#warehouseInspectionListTable thead th[data-sort]').off('click').on('click', function() {
//			const column = $(this).data('sort');
//			const dataType = $(this).data('type') || 'string';
//			applyClientSort(column, dataType);
//		});
//
//		// 엔터키 검색
//		$('#view_mQuality_warehouseInspection_list input[type="text"], #view_mQuality_warehouseInspection_list input[type="date"]').off('keypress').on('keypress', function(e) {
//			if (e.which === 13) {
//				performWarehouseInspectionListSearch();
//			}
//		});
//	}
//
//	function getCurrentSearchCriteria() {
//		return {
//			fromDate: $("#warehouseInspectionList_searchVal_fromDate").val(),
//			toDate: $("#warehouseInspectionList_searchVal_toDate").val(),
//			factory: $("#warehouseInspectionList_searchVal_factory").val(),
//			storage: $("#warehouseInspectionList_searchVal_storage").val(),
//			car: $("#warehouseInspectionList_searchVal_car").val().trim().toUpperCase(),
//			itemcode: $("#warehouseInspectionList_searchVal_itemcode").val().trim().toUpperCase(),
//			itemname: $("#warehouseInspectionList_searchVal_itemname").val().trim().toUpperCase()
//		};
//	}
//
//	function performWarehouseInspectionListSearch() {
//		let searchCriteria = getCurrentSearchCriteria();
//		console.log("검색 조건:", searchCriteria);
//
//		currentWarehouseInspectionListPage = 1;
//		performWarehouseInspectionListDBSearch(searchCriteria);
//	}
//
//	function resetWarehouseInspectionListSearch() {
//		const factory = getCookie('selectedFactory');
//		const storage = 'Material';
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		$("#warehouseInspectionList_searchVal_fromDate").val(fromDate);
//		$("#warehouseInspectionList_searchVal_toDate").val(toDate);
//		$("#warehouseInspectionList_searchVal_factory").val(factory);
//		$("#warehouseInspectionList_searchVal_storage").val('Material');
//		$("#warehouseInspectionList_searchVal_car").val('');
//		$("#warehouseInspectionList_searchVal_itemcode").val('');
//		$("#warehouseInspectionList_searchVal_itemname").val('');
//
//		currentWarehouseInspectionListPage = 1;
//		performWarehouseInspectionListDBSearch({ factory, storage, toDate, fromDate });
//
//		console.log('검색 조건이 초기화되었습니다.');
//	}
//
//	function updateTotalQty() {
//		$(".warehouseInspectionListTotalQty").text(Number(totalQty).toLocaleString());
//		$(".warehouseInspectionListTotalOkQty").text(Number(totalOkQty).toLocaleString());
//		$(".warehouseInspectionListTotalNgQty").text(Number(totalNgQty).toLocaleString());
//	}
//
//
//	window.changeWarehouseInspectionListItemsPerPage = function(newItemsPerPage) {
//		warehouseInspectionListItemsPerPage = newItemsPerPage;
//		currentWarehouseInspectionListPage = 1; // 페이지를 1로 초기화
//
//		// ✅ 쿠키에 저장 추가!
//		setCookie('itemsPerPage', newItemsPerPage);
//
//		applyClientPagination();
//		renderWarehouseInspectionListTableData();
//		renderWarehouseInspectionListPagination();
//		updateWarehouseInspectionListTotalCount();
//
//		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
//	}
//
//	window.exportWarehouseInspectionListData = function() {
//		return {
//			total: filteredData.length,
//			currentPage: currentWarehouseInspectionListPage,
//			itemsPerPage: warehouseInspectionListItemsPerPage,
//			data: filteredData
//		};
//	}
//});
//
//// 전체 데이터 엑셀 다운로드
//window.downloadAllWarehouseInspectionListData = function() {
//	let searchCriteria = {
//		fromDate: $("#warehouseInspectionList_searchVal_fromDate").val(),
//		toDate: $("#warehouseInspectionList_searchVal_toDate").val(),
//		factory: $("#warehouseInspectionList_searchVal_factory").val(),
//		storage: $("#warehouseInspectionList_searchVal_storage").val(),
//		car: $("#warehouseInspectionList_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#warehouseInspectionList_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#warehouseInspectionList_searchVal_itemname").val().trim().toUpperCase()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_warehouseInspectionList",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(response) {
//			console.log(response);
//
//			ExcelExporter.downloadExcel(filteredData, window.warehouseInspectionListColumns, {
//				fileName: 'warehouseInspectionList_All',
//				sheetName: 'warehouseInspectionList'
//			});
//			hideLoading();
//		},
//		error: function() {
//			alert("전체 데이터 조회에 실패했습니다.");
//			hideLoading();
//		}
//	});
//};