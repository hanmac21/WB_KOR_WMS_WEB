///* --------------------------------------------------------------
// * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
// * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
// * -------------------------------------------------------------- */
//
//let allServerData = [];
//let filteredData = [];
//let globalIncomingInspectionListData = [];
//let currentIncomingInspectionListPage = 1;
//let incomingInspectionListItemsPerPage = 100;
//let totalIncomingInspectionListCount = 0;
//let totalIncomingInspectionListPages = 0;
//let currentSortColumn = null;
//let currentSortOrder = 'asc';
//
//let totalQty = 0;
//let totalOkQty = 0;
//let totalNgQty = 0;
//
//$(document).ready(function() {
//
//	window.filteredIncomingInspectionListData = [];
//	window.incomingInspectionListColumns = [
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
//	window.call_mQuality_incomingInspection_list = function(menuId) {
//		showLoading("data");
//
//		const factory = getCookie('selectedFactory');
//		const { fromDate, toDate } = getDefaultDateRange();
//		let storage = 'Material';
//
//		performIncomingInspectionListDBSearch({ factory, storage, toDate, fromDate });
//	}
//
//	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
//	function performIncomingInspectionListDBSearch(searchCriteria) {
//		showLoading("data");
//
//		$.ajax({
//			url: "/read_incomingInspectionList",
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
//				totalQty = response.totalQty || 0;
//
//				// 페이지 초기화
//				currentIncomingInspectionListPage = 1;
//				currentSortColumn = null;
//				currentSortOrder = 'asc';
//
//				// 클라이언트에서 페이징 처리
//				applyClientPagination();
//
//				// 첫 번째 검색이라면 뷰를 렌더링
//				if (!$('#view_mQuality_incomingInspection_list').length) {
//					renderIncomingInspectionListView();
//				} else {
//					// 기존 뷰가 있다면 테이블만 업데이트
//					renderIncomingInspectionListTableData();
//					renderIncomingInspectionListPagination();
//					updateIncomingInspectionListTotalCount();
//				}
//
//				if (response.records && response.records.length > 0) {
//					const r0 = response.records[0];
//
//					totalQty = Number(r0.TOTALQTY ?? r0.totalqty ?? 0) || 0;
//					totalOkQty = Number(r0.TOTALOKQTY ?? r0.totalokqty ?? 0) || 0;
//					totalNgQty = Number(r0.TOTALNGQTY ?? r0.totalngqty ?? 0) || 0;
//				}
//
//				// ✅ 만약 서버가 totals를 records에 붙여서 주는 구조라면(방금 SQL처럼 OVER())
//				// response.totalQty가 없을 때 첫 row에서 가져오기
//				if ((!response.totalQty && response.records && response.records.length > 0)) {
//					const r0 = response.records[0];
//					totalQty = r0.TOTALQTY ?? r0.totalqty ?? totalQty;
//					totalOkQty = r0.TOTALOKQTY ?? r0.totalokqty ?? totalOkQty;
//					totalNgQty = r0.TOTALNGQTY ?? r0.totalngqty ?? totalNgQty;
//				}
//
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
//		incomingInspectionListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;
//
//		totalIncomingInspectionListCount = filteredData.length;
//		totalIncomingInspectionListPages = Math.ceil(totalIncomingInspectionListCount / incomingInspectionListItemsPerPage);
//
//		// 현재 페이지 범위 계산
//		const startIndex = (currentIncomingInspectionListPage - 1) * incomingInspectionListItemsPerPage;
//		const endIndex = startIndex + incomingInspectionListItemsPerPage;
//
//		// 현재 페이지 데이터 추출
//		globalIncomingInspectionListData = filteredData.slice(startIndex, endIndex);
//		window.filteredIncomingInspectionListData = globalIncomingInspectionListData;
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
//		currentIncomingInspectionListPage = 1;
//		applyClientPagination();
//
//		// 테이블 업데이트
//		renderIncomingInspectionListTableData();
//		renderIncomingInspectionListPagination();
//		updateIncomingInspectionListTotalCount();
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
//	function renderIncomingInspectionListView() {
//		let content_output = `
//			<div class="divBlockControl" id="view_mQuality_incomingInspection_list">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//								<input type="date" id="incomingInspectionList_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="incomingInspectionList_searchVal_toDate" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}</div>
//								<select id="incomingInspectionList_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')} </option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="incomingInspectionList_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="incomingInspectionList_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="incomingInspectionList_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="incomingInspectionList_searchVal_itemname" />
//							</div>
//						</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnIncomingInspectionListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnIncomingInspectionListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//								<strong id="incomingInspectionListTotalCount">${totalIncomingInspectionListCount}</strong>
//								${i18n.t('table.info.records')}
//								|
//								${i18n.t('table.page')}
//								<strong id="incomingInspectionListCurrentPageInfo">${currentIncomingInspectionListPage}</strong>/
//								<strong id="incomingInspectionListTotalPageInfo">${totalIncomingInspectionListPages}</strong>
//								|
//								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span>
//								<span class="incomingInspectionListTotalQty" style="color:#007bff"></span>
//						
//								<span style="margin-left:10px;">OK : </span>
//								<span class="incomingInspectionListTotalOkQty" style="color:#28a745"></span>
//						
//								<span style="margin-left:10px;">NG : </span>
//								<span class="incomingInspectionListTotalNgQty" style="color:#dc3545"></span>
//							</span>
//						
//							<div class="action-buttons-right mQuality_incomingInspection_list">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="incomingInspectionListExcelBtn" onclick="downloadAllIncomingInspectionListData()">Excel</button>
//								</div>
//							</div>
//						</div>
//
//						<table class="data-table mQuality_incomingInspection_list" id="incomingInspectionListTable">
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
//							<tbody id="incomingInspectionListDetailTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="incomingInspectionListPaginationContainer">
//						</div>
//						<div class="items-per-page-selector">
//					        <label for="incomingInspectionList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
//					        <select id="incomingInspectionList_itemsPerPage" class="items-per-page-select">
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
//			$("#incomingInspectionList_searchVal_toDate").val(toDate);
//			$("#incomingInspectionList_searchVal_fromDate").val(fromDate);
//
//			// ✅ Select 초기값 설정 추가!
//			$("#incomingInspectionList_itemsPerPage").val(incomingInspectionListItemsPerPage);
//		})();
//
//		// 공장 및 창고 선택
//		renderFactoryStorage();
//		// 테이블 데이터 렌더링
//		renderIncomingInspectionListTableData();
//		// 페이지네이션 렌더링
//		renderIncomingInspectionListPagination();
//		// 이벤트 바인딩
//		bindIncomingInspectionListEvents();
//		// 초기 렌더링 후 카운트 업데이트
//		updateIncomingInspectionListTotalCount();
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
//		const factory = $('#incomingInspectionList_searchVal_factory');
//		const storage = $('#incomingInspectionList_searchVal_storage');
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
//	function updateIncomingInspectionListTotalCount() {
//		$('#incomingInspectionListTotalCount').text(Number(totalIncomingInspectionListCount).toLocaleString());
//		$('#incomingInspectionListCurrentPageInfo').text(currentIncomingInspectionListPage);
//		$('#incomingInspectionListTotalPageInfo').text(totalIncomingInspectionListPages);
//	}
//
//	function renderIncomingInspectionListTableData() {
//		let tableBody = "";
//
//		for (let i = 0; i < globalIncomingInspectionListData.length; i++) {
//			let rowNumber = (currentIncomingInspectionListPage - 1) * incomingInspectionListItemsPerPage + i + 1;
//
//			tableBody += `
//            <tr>
//                <td class="noVal">${rowNumber}</td>
//                <td class="dateVal">${globalIncomingInspectionListData[i].SDATE || globalIncomingInspectionListData[i].sdate || ''}</td>
//                <td class="itemcodeVal">${globalIncomingInspectionListData[i].ITEMCODE || globalIncomingInspectionListData[i].itemcode || ''}</td>
//                <td class="itemnameVal">${globalIncomingInspectionListData[i].ITEMNAME || globalIncomingInspectionListData[i].itemname || ''}</td>
//                <td class="carVal">${globalIncomingInspectionListData[i].CAR || globalIncomingInspectionListData[i].car || ''}</td>
//                <td class="qtyVal">${Number(globalIncomingInspectionListData[i].QTY || globalIncomingInspectionListData[i].qty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalIncomingInspectionListData[i].OKQTY || globalIncomingInspectionListData[i].okqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalIncomingInspectionListData[i].NGQTY || globalIncomingInspectionListData[i].ngqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${globalIncomingInspectionListData[i].LINE || globalIncomingInspectionListData[i].line || ''}</td>
//                <td class="qtyVal">${globalIncomingInspectionListData[i].SOURCE || globalIncomingInspectionListData[i].source || ''}</td>
//                <td class="qtyVal">${globalIncomingInspectionListData[i].MAINCATEGORY || globalIncomingInspectionListData[i].maincategory || ''}</td>
//                <td class="qtyVal">${globalIncomingInspectionListData[i].SUBCATEGORY || globalIncomingInspectionListData[i].subcategory || ''}</td>
//                <td class="qtyVal">${globalIncomingInspectionListData[i].DETAILCATEGORY || globalIncomingInspectionListData[i].detailcategory || ''}</td>
//                <td class="qtyVal">${globalIncomingInspectionListData[i].JUDGMENT || globalIncomingInspectionListData[i].judgement || ''}</td>
//                <td class="itemnameVal">${globalIncomingInspectionListData[i].CUSTNAME || globalIncomingInspectionListData[i].custname || ''}</td>
//                <td class="qtyVal">${globalIncomingInspectionListData[i].MEMO || globalIncomingInspectionListData[i].memo || ''}</td>
//                <td class="qtyVal">${globalIncomingInspectionListData[i].UNIT || globalIncomingInspectionListData[i].unit || ''}</td>
//                <td class="hhmmVal">${globalIncomingInspectionListData[i].HHMM || globalIncomingInspectionListData[i].hhmm || ''}</td>
//                <td class="barcodeVal">${globalIncomingInspectionListData[i].BARCODE || globalIncomingInspectionListData[i].barcode || ''}</td>
//                <td class="barcodeVal">${globalIncomingInspectionListData[i].DEFBARCODE || globalIncomingInspectionListData[i].defbarcode || ''}</td>
//                
//            </tr>
//        `;
//		}
//
//		$("#incomingInspectionListDetailTableBody").html(tableBody);
//	}
//
//	function renderIncomingInspectionListPagination() {
//		let paginationHtml = "";
//
//		if (currentIncomingInspectionListPage > 1) {
//			paginationHtml += `<button class="incomingInspectionList-page-btn" data-page="${currentIncomingInspectionListPage - 1}">&lt;</button>`;
//		} else {
//			paginationHtml += `<button class="incomingInspectionList-page-btn disabled">&lt;</button>`;
//		}
//
//		let startPage = Math.max(1, currentIncomingInspectionListPage - 5);
//		let endPage = Math.min(totalIncomingInspectionListPages, currentIncomingInspectionListPage + 5);
//
//		if (startPage > 1) {
//			paginationHtml += `<button class="incomingInspectionList-page-btn" data-page="1">1</button>`;
//			if (startPage > 2) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//		}
//
//		for (let i = startPage; i <= endPage; i++) {
//			if (i === currentIncomingInspectionListPage) {
//				paginationHtml += `<button class="incomingInspectionList-page-btn active" data-page="${i}">${i}</button>`;
//			} else {
//				paginationHtml += `<button class="incomingInspectionList-page-btn" data-page="${i}">${i}</button>`;
//			}
//		}
//
//		if (endPage < totalIncomingInspectionListPages) {
//			if (endPage < totalIncomingInspectionListPages - 1) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//			paginationHtml += `<button class="incomingInspectionList-page-btn" data-page="${totalIncomingInspectionListPages}">${totalIncomingInspectionListPages}</button>`;
//		}
//
//		if (currentIncomingInspectionListPage < totalIncomingInspectionListPages) {
//			paginationHtml += `<button class="incomingInspectionList-page-btn" data-page="${currentIncomingInspectionListPage + 1}">&gt;</button>`;
//		} else {
//			paginationHtml += `<button class="incomingInspectionList-page-btn disabled">&gt;</button>`;
//		}
//
//		$("#incomingInspectionListPaginationContainer").html(paginationHtml);
//	}
//
//	function bindIncomingInspectionListEvents() {
//		// 검색 버튼 클릭 - DB에서 새로 조회
//		$(".btnIncomingInspectionListSearch").off('click').on('click', function() {
//			performIncomingInspectionListSearch();
//		});
//
//		// 초기화 버튼 클릭
//		$(".btnIncomingInspectionListSearchInit").off('click').on('click', function() {
//			resetIncomingInspectionListSearch();
//		});
//
//		// ✅ 페이지당 항목 수 변경 이벤트 추가
//		$('#incomingInspectionList_itemsPerPage').off('change').on('change', function() {
//			const newItemsPerPage = parseInt($(this).val());
//			changeIncomingInspectionListItemsPerPage(newItemsPerPage);
//		});
//
//		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
//		$(document).off('click', '.incomingInspectionList-page-btn').on('click', '.incomingInspectionList-page-btn', function() {
//			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//				let page = parseInt($(this).data('page'));
//				if (page && page > 0) {
//					currentIncomingInspectionListPage = page;
//					applyClientPagination();
//					renderIncomingInspectionListTableData();
//					renderIncomingInspectionListPagination();
//					updateIncomingInspectionListTotalCount();
//				}
//			}
//		});
//
//		// 헤더 클릭 시 정렬
//		$('#incomingInspectionListTable thead th[data-sort]').off('click').on('click', function() {
//			const column = $(this).data('sort');
//			const dataType = $(this).data('type') || 'string';
//			applyClientSort(column, dataType);
//		});
//
//		// 엔터키 검색
//		$('#view_mQuality_incomingInspection_list input[type="text"], #view_mQuality_incomingInspection_list input[type="date"]').off('keypress').on('keypress', function(e) {
//			if (e.which === 13) {
//				performIncomingInspectionListSearch();
//			}
//		});
//	}
//
//	function getCurrentSearchCriteria() {
//		return {
//			fromDate: $("#incomingInspectionList_searchVal_fromDate").val(),
//			toDate: $("#incomingInspectionList_searchVal_toDate").val(),
//			factory: $("#incomingInspectionList_searchVal_factory").val(),
//			storage: $("#incomingInspectionList_searchVal_storage").val(),
//			car: $("#incomingInspectionList_searchVal_car").val().trim().toUpperCase(),
//			itemcode: $("#incomingInspectionList_searchVal_itemcode").val().trim().toUpperCase(),
//			itemname: $("#incomingInspectionList_searchVal_itemname").val().trim().toUpperCase()
//		};
//	}
//
//	function performIncomingInspectionListSearch() {
//		let searchCriteria = getCurrentSearchCriteria();
//		console.log("검색 조건:", searchCriteria);
//
//		currentIncomingInspectionListPage = 1;
//		performIncomingInspectionListDBSearch(searchCriteria);
//	}
//
//	function resetIncomingInspectionListSearch() {
//		const factory = getCookie('selectedFactory');
//		const storage = 'Material';
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		$("#incomingInspectionList_searchVal_fromDate").val(fromDate);
//		$("#incomingInspectionList_searchVal_toDate").val(toDate);
//		$("#incomingInspectionList_searchVal_factory").val(factory);
//		$("#incomingInspectionList_searchVal_storage").val('Material');
//		$("#incomingInspectionList_searchVal_car").val('');
//		$("#incomingInspectionList_searchVal_itemcode").val('');
//		$("#incomingInspectionList_searchVal_itemname").val('');
//
//		currentIncomingInspectionListPage = 1;
//		performIncomingInspectionListDBSearch({ factory, storage, toDate, fromDate });
//
//		console.log('검색 조건이 초기화되었습니다.');
//	}
//
//	function updateTotalQty() {
//		$(".incomingInspectionListTotalQty").text(Number(totalQty).toLocaleString());
//		$(".incomingInspectionListTotalOkQty").text(Number(totalOkQty).toLocaleString());
//		$(".incomingInspectionListTotalNgQty").text(Number(totalNgQty).toLocaleString());
//	}
//
//
//	window.changeIncomingInspectionListItemsPerPage = function(newItemsPerPage) {
//		incomingInspectionListItemsPerPage = newItemsPerPage;
//		currentIncomingInspectionListPage = 1; // 페이지를 1로 초기화
//
//		// ✅ 쿠키에 저장 추가!
//		setCookie('itemsPerPage', newItemsPerPage);
//
//		applyClientPagination();
//		renderIncomingInspectionListTableData();
//		renderIncomingInspectionListPagination();
//		updateIncomingInspectionListTotalCount();
//
//		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
//	}
//
//	window.exportIncomingInspectionListData = function() {
//		return {
//			total: filteredData.length,
//			currentPage: currentIncomingInspectionListPage,
//			itemsPerPage: incomingInspectionListItemsPerPage,
//			data: filteredData
//		};
//	}
//});
//
//// 전체 데이터 엑셀 다운로드
//window.downloadAllIncomingInspectionListData = function() {
//	let searchCriteria = {
//		fromDate: $("#incomingInspectionList_searchVal_fromDate").val(),
//		toDate: $("#incomingInspectionList_searchVal_toDate").val(),
//		factory: $("#incomingInspectionList_searchVal_factory").val(),
//		storage: $("#incomingInspectionList_searchVal_storage").val(),
//		car: $("#incomingInspectionList_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#incomingInspectionList_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#incomingInspectionList_searchVal_itemname").val().trim().toUpperCase()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_incomingInspectionList",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(response) {
//			console.log(response);
//
//			ExcelExporter.downloadExcel(filteredData, window.incomingInspectionListColumns, {
//				fileName: 'incomingInspectionList_All',
//				sheetName: 'incomingInspectionList'
//			});
//			hideLoading();
//		},
//		error: function() {
//			alert("전체 데이터 조회에 실패했습니다.");
//			hideLoading();
//		}
//	});
//};