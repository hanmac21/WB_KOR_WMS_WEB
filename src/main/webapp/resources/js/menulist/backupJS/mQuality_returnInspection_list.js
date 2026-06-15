///* --------------------------------------------------------------
// * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
// * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
// * -------------------------------------------------------------- */
//
//let allServerData = [];
//let filteredData = [];
//let globalreturnInspectionListData = [];
//let currentreturnInspectionListPage = 1;
//let returnInspectionListItemsPerPage = 100;
//let totalreturnInspectionListCount = 0;
//let totalreturnInspectionListPages = 0;
//let currentSortColumn = null;
//let currentSortOrder = 'asc';
//
//let totalQty = 0;
//let totalOkQty = 0;
//let totalNgQty = 0;
//
//$(document).ready(function() {
//	window.filteredreturnInspectionListData = [];
//	window.returnInspectionListColumns = [
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
//	window.call_mQuality_returnInspection_list = function(menuId) {
//		showLoading("data");
//
//		const factory = getCookie('selectedFactory');
//		const { fromDate, toDate } = getDefaultDateRange();
//		let storage = 'Material';
//
//		performreturnInspectionListDBSearch({ factory, storage, toDate, fromDate });
//	}
//
//	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
//	function performreturnInspectionListDBSearch(searchCriteria) {
//		showLoading("data");
//
//		$.ajax({
//			url: "/read_returnInspectionList",
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
//				currentreturnInspectionListPage = 1;
//				currentSortColumn = null;
//				currentSortOrder = 'asc';
//
//				// 클라이언트에서 페이징 처리
//				applyClientPagination();
//
//				// 첫 번째 검색이라면 뷰를 렌더링
//				if (!$('#view_mQuality_returnInspection_list').length) {
//					renderreturnInspectionListView();
//				} else {
//					// 기존 뷰가 있다면 테이블만 업데이트
//					renderreturnInspectionListTableData();
//					renderreturnInspectionListPagination();
//					updatereturnInspectionListTotalCount();
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
//		// ✅ 첫 줄에 추가
//		returnInspectionListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;
//
//		totalreturnInspectionListCount = filteredData.length;
//		totalreturnInspectionListPages = Math.ceil(totalreturnInspectionListCount / returnInspectionListItemsPerPage);
//
//		// 현재 페이지 범위 계산
//		const startIndex = (currentreturnInspectionListPage - 1) * returnInspectionListItemsPerPage;
//		const endIndex = startIndex + returnInspectionListItemsPerPage;
//
//		// 현재 페이지 데이터 추출
//		globalreturnInspectionListData = filteredData.slice(startIndex, endIndex);
//		window.filteredreturnInspectionListData = globalreturnInspectionListData;
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
//		currentreturnInspectionListPage = 1;
//		applyClientPagination();
//
//		// 테이블 업데이트
//		renderreturnInspectionListTableData();
//		renderreturnInspectionListPagination();
//		updatereturnInspectionListTotalCount();
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
//	function renderreturnInspectionListView() {
//		let content_output = `
//			<div class="divBlockControl" id="view_mQuality_returnInspection_list">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//								<input type="date" id="returnInspectionList_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="returnInspectionList_searchVal_toDate" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}</div>
//								<select id="returnInspectionList_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')} </option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="returnInspectionList_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="returnInspectionList_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="returnInspectionList_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="returnInspectionList_searchVal_itemname" />
//							</div>
//						</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnreturnInspectionListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnreturnInspectionListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
//							<span>${i18n.t('table.info.total')} <strong id="returnInspectionListTotalCount">${totalreturnInspectionListCount}</strong> ${i18n.t('table.info.records')} | 
//								${i18n.t('table.page')} <strong id="returnInspectionListCurrentPageInfo">${currentreturnInspectionListPage}</strong>/<strong id="returnInspectionListTotalPageInfo">${totalreturnInspectionListPages}</strong> |  
//								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="returnInspectionListTotalQty" style="color:#007bff"></span> 
//							</span>
//							<div class="action-buttons-right mQuality_returnInspection_list">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="returnInspectionListExcelBtn" onclick="downloadAllreturnInspectionListData()">Excel</button>
//								</div>
//							</div>
//						</div>
//						<table class="data-table mQuality_returnInspection_list" id="returnInspectionListTable">
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
//							<tbody id="returnInspectionListDetailTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="returnInspectionListPaginationContainer">
//						</div>
//						<div class="items-per-page-selector">
//						    <label for="returnInspectionList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
//						    <select id="returnInspectionList_itemsPerPage" class="items-per-page-select">
//						        <option value="100" selected>100</option>
//						        <option value="300">300</option>
//						        <option value="1000">1000</option>
//						    </select>
//						</div>
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
//			$("#returnInspectionList_searchVal_toDate").val(toDate);
//			$("#returnInspectionList_searchVal_fromDate").val(fromDate);
//
//			// ✅ 추가
//			$("#returnInspectionList_itemsPerPage").val(returnInspectionListItemsPerPage);
//		})();
//
//		// 공장 및 창고 선택
//		renderFactoryStorage();
//		// 테이블 데이터 렌더링
//		renderreturnInspectionListTableData();
//		// 페이지네이션 렌더링
//		renderreturnInspectionListPagination();
//		// 이벤트 바인딩
//		bindreturnInspectionListEvents();
//		// 초기 렌더링 후 카운트 업데이트
//		updatereturnInspectionListTotalCount();
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
//		const factory = $('#returnInspectionList_searchVal_factory');
//		const storage = $('#returnInspectionList_searchVal_storage');
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
//	// ✅ 추가
//	function setCookie(cookieName, value, days = 365) {
//		const date = new Date();
//		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//		const expires = "expires=" + date.toUTCString();
//		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
//	}
//
//	function updatereturnInspectionListTotalCount() {
//		$('#returnInspectionListTotalCount').text(Number(totalreturnInspectionListCount).toLocaleString());
//		$('#returnInspectionListCurrentPageInfo').text(currentreturnInspectionListPage);
//		$('#returnInspectionListTotalPageInfo').text(totalreturnInspectionListPages);
//	}
//
//	function renderreturnInspectionListTableData() {
//		let tableBody = "";
//
//		for (let i = 0; i < globalreturnInspectionListData.length; i++) {
//			let rowNumber = (currentreturnInspectionListPage - 1) * returnInspectionListItemsPerPage + i + 1;
//
//			tableBody += `
//            <tr>
//                <td class="noVal">${rowNumber}</td>
//                <td class="dateVal">${globalreturnInspectionListData[i].SDATE || globalreturnInspectionListData[i].sdate || ''}</td>
//                <td class="itemcodeVal">${globalreturnInspectionListData[i].ITEMCODE || globalreturnInspectionListData[i].itemcode || ''}</td>
//                <td class="itemnameVal">${globalreturnInspectionListData[i].ITEMNAME || globalreturnInspectionListData[i].itemname || ''}</td>
//                <td class="carVal">${globalreturnInspectionListData[i].CAR || globalreturnInspectionListData[i].car || ''}</td>
//                <td class="qtyVal">${Number(globalreturnInspectionListData[i].QTY || globalreturnInspectionListData[i].qty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalreturnInspectionListData[i].OKQTY || globalreturnInspectionListData[i].okqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalreturnInspectionListData[i].NGQTY || globalreturnInspectionListData[i].ngqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${globalreturnInspectionListData[i].LINE || globalreturnInspectionListData[i].line || ''}</td>
//                <td class="qtyVal">${globalreturnInspectionListData[i].SOURCE || globalreturnInspectionListData[i].source || ''}</td>
//                <td class="qtyVal">${globalreturnInspectionListData[i].MAINCATEGORY || globalreturnInspectionListData[i].maincategory || ''}</td>
//                <td class="qtyVal">${globalreturnInspectionListData[i].SUBCATEGORY || globalreturnInspectionListData[i].subcategory || ''}</td>
//                <td class="qtyVal">${globalreturnInspectionListData[i].DETAILCATEGORY || globalreturnInspectionListData[i].detailcategory || ''}</td>
//                <td class="qtyVal">${globalreturnInspectionListData[i].JUDGMENT || globalreturnInspectionListData[i].judgement || ''}</td>
//                <td class="itemnameVal">${globalreturnInspectionListData[i].CUSTNAME || globalreturnInspectionListData[i].custname || ''}</td>
//                <td class="qtyVal">${globalreturnInspectionListData[i].MEMO || globalreturnInspectionListData[i].memo || ''}</td>
//                <td class="qtyVal">${globalreturnInspectionListData[i].UNIT || globalreturnInspectionListData[i].unit || ''}</td>
//                <td class="hhmmVal">${globalreturnInspectionListData[i].HHMM || globalreturnInspectionListData[i].hhmm || ''}</td>
//                <td class="barcodeVal">${globalreturnInspectionListData[i].BARCODE || globalreturnInspectionListData[i].barcode || ''}</td>
//                <td class="barcodeVal">${globalreturnInspectionListData[i].DEFBARCODE || globalreturnInspectionListData[i].defbarcode || ''}</td>
//            </tr>
//        `;
//		}
//
//		$("#returnInspectionListDetailTableBody").html(tableBody);
//	}
//
//	function renderreturnInspectionListPagination() {
//		let paginationHtml = "";
//
//		if (currentreturnInspectionListPage > 1) {
//			paginationHtml += `<button class="returnInspectionList-page-btn" data-page="${currentreturnInspectionListPage - 1}">&lt;</button>`;
//		} else {
//			paginationHtml += `<button class="returnInspectionList-page-btn disabled">&lt;</button>`;
//		}
//
//		let startPage = Math.max(1, currentreturnInspectionListPage - 5);
//		let endPage = Math.min(totalreturnInspectionListPages, currentreturnInspectionListPage + 5);
//
//		if (startPage > 1) {
//			paginationHtml += `<button class="returnInspectionList-page-btn" data-page="1">1</button>`;
//			if (startPage > 2) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//		}
//
//		for (let i = startPage; i <= endPage; i++) {
//			if (i === currentreturnInspectionListPage) {
//				paginationHtml += `<button class="returnInspectionList-page-btn active" data-page="${i}">${i}</button>`;
//			} else {
//				paginationHtml += `<button class="returnInspectionList-page-btn" data-page="${i}">${i}</button>`;
//			}
//		}
//
//		if (endPage < totalreturnInspectionListPages) {
//			if (endPage < totalreturnInspectionListPages - 1) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//			paginationHtml += `<button class="returnInspectionList-page-btn" data-page="${totalreturnInspectionListPages}">${totalreturnInspectionListPages}</button>`;
//		}
//
//		if (currentreturnInspectionListPage < totalreturnInspectionListPages) {
//			paginationHtml += `<button class="returnInspectionList-page-btn" data-page="${currentreturnInspectionListPage + 1}">&gt;</button>`;
//		} else {
//			paginationHtml += `<button class="returnInspectionList-page-btn disabled">&gt;</button>`;
//		}
//
//		$("#returnInspectionListPaginationContainer").html(paginationHtml);
//	}
//
//	function bindreturnInspectionListEvents() {
//		// 검색 버튼 클릭 - DB에서 새로 조회
//		$(".btnreturnInspectionListSearch").off('click').on('click', function() {
//			performreturnInspectionListSearch();
//		});
//
//		// 초기화 버튼 클릭
//		$(".btnreturnInspectionListSearchInit").off('click').on('click', function() {
//			resetreturnInspectionListSearch();
//		});
//
//		// ✅ 추가
//		$('#returnInspectionList_itemsPerPage').off('change').on('change', function() {
//			const newItemsPerPage = parseInt($(this).val());
//			changereturnInspectionListItemsPerPage(newItemsPerPage);
//		});
//
//		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
//		$(document).off('click', '.returnInspectionList-page-btn').on('click', '.returnInspectionList-page-btn', function() {
//			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//				let page = parseInt($(this).data('page'));
//				if (page && page > 0) {
//					currentreturnInspectionListPage = page;
//					applyClientPagination();
//					renderreturnInspectionListTableData();
//					renderreturnInspectionListPagination();
//					updatereturnInspectionListTotalCount();
//				}
//			}
//		});
//
//		// 헤더 클릭 시 정렬
//		$('#returnInspectionListTable thead th[data-sort]').off('click').on('click', function() {
//			const column = $(this).data('sort');
//			const dataType = $(this).data('type') || 'string';
//			applyClientSort(column, dataType);
//		});
//
//		// 엔터키 검색
//		$('#view_mQuality_returnInspection_list input[type="text"], #view_mQuality_returnInspection_list input[type="date"]').off('keypress').on('keypress', function(e) {
//			if (e.which === 13) {
//				performreturnInspectionListSearch();
//			}
//		});
//	}
//
//	function getCurrentSearchCriteria() {
//		return {
//			fromDate: $("#returnInspectionList_searchVal_fromDate").val(),
//			toDate: $("#returnInspectionList_searchVal_toDate").val(),
//			factory: $("#returnInspectionList_searchVal_factory").val(),
//			storage: $("#returnInspectionList_searchVal_storage").val(),
//			car: $("#returnInspectionList_searchVal_car").val().trim().toUpperCase(),
//			itemcode: $("#returnInspectionList_searchVal_itemcode").val().trim().toUpperCase(),
//			itemname: $("#returnInspectionList_searchVal_itemname").val().trim().toUpperCase()
//		};
//	}
//
//	function performreturnInspectionListSearch() {
//		let searchCriteria = getCurrentSearchCriteria();
//		console.log("검색 조건:", searchCriteria);
//
//		currentreturnInspectionListPage = 1;
//		performreturnInspectionListDBSearch(searchCriteria);
//	}
//
//	function resetreturnInspectionListSearch() {
//		const factory = getCookie('selectedFactory');
//		const storage = 'Material';
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		$("#returnInspectionList_searchVal_fromDate").val(fromDate);
//		$("#returnInspectionList_searchVal_toDate").val(toDate);
//		$("#returnInspectionList_searchVal_factory").val(factory);
//		$("#returnInspectionList_searchVal_storage").val('Material');
//		$("#returnInspectionList_searchVal_car").val('');
//		$("#returnInspectionList_searchVal_itemcode").val('');
//		$("#returnInspectionList_searchVal_itemname").val('');
//
//		currentreturnInspectionListPage = 1;
//		performreturnInspectionListDBSearch({ factory, storage, toDate, fromDate });
//
//		console.log('검색 조건이 초기화되었습니다.');
//	}
//
//	function updateTotalQty() {
//		$(".returnInspectionListTotalQty").text(Number(totalQty).toLocaleString());
//	}
//
//	window.changereturnInspectionListItemsPerPage = function(newItemsPerPage) {
//		returnInspectionListItemsPerPage = newItemsPerPage;
//		currentreturnInspectionListPage = 1;
//
//		// ✅ 추가
//		setCookie('itemsPerPage', newItemsPerPage);
//
//		applyClientPagination();
//		renderreturnInspectionListTableData();
//		renderreturnInspectionListPagination();
//		updatereturnInspectionListTotalCount();
//	}
//
//	window.exportreturnInspectionListData = function() {
//		return {
//			total: filteredData.length,
//			currentPage: currentreturnInspectionListPage,
//			itemsPerPage: returnInspectionListItemsPerPage,
//			data: filteredData
//		};
//	}
//});
//
//// 전체 데이터 엑셀 다운로드
//window.downloadAllreturnInspectionListData = function() {
//	let searchCriteria = {
//		fromDate: $("#returnInspectionList_searchVal_fromDate").val(),
//		toDate: $("#returnInspectionList_searchVal_toDate").val(),
//		factory: $("#returnInspectionList_searchVal_factory").val(),
//		storage: $("#returnInspectionList_searchVal_storage").val(),
//		car: $("#returnInspectionList_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#returnInspectionList_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#returnInspectionList_searchVal_itemname").val().trim().toUpperCase()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_returnInspectionList",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(response) {
//			console.log(response);
//
//			ExcelExporter.downloadExcel(filteredData, window.returnInspectionListColumns, {
//				fileName: 'returnInspectionList_All',
//				sheetName: 'returnInspectionList'
//			});
//			hideLoading();
//		},
//		error: function() {
//			alert("전체 데이터 조회에 실패했습니다.");
//			hideLoading();
//		}
//	});
//};