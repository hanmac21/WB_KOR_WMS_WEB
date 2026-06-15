/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */
(function() {

	let allServerData = [];
	let filteredData_productionStockCountWIPList = [];
	let globalProductionStockCountWIPListData = [];
	let currentProductionStockCountWIPListPage = 1;
	let productionStockCountWIPListItemsPerPage = 100;
	let totalProductionStockCountWIPListCount = 0;
	let totalProductionStockCountWIPListPages = 0;
	let totalQty = 0;
	let currentSortColumn = null;
	let currentSortOrder = 'asc';
	let saveWorkCenter = null;

	// ✅ 엑셀 업로드 여부 플래그
	let hasExcelUploaded = false;

	// 테이블 구조 수정 (입력 테이블로 변경)
	function renderProductionStockCountWIPListTableData() {
		let tableBody = "";
		for (let i = 0; i < globalProductionStockCountWIPListData.length; i++) {
			let data = globalProductionStockCountWIPListData[i];
			let rowNumber = (currentProductionStockCountWIPListPage - 1) * productionStockCountWIPListItemsPerPage + i + 1;

			let storage = data.STORAGE || data.storage;
			let itemcode = data.ITEMCODE || data.itemcode;
			let itemname = data.ITEMNAME || data.itemname || '';
			let qty = data.inputQty || data.QTY || data.qty || 0;
			let bqty = data.BQTY || data.bqty || 0;
			let workLocation = data.FACTORY + " - " + data.STORAGE;
			let totalqty = data.TOTALQTY || data.totalqty || 0;
			let totalbqty = data.TOTALBQTY || data.totalbqty || 0;
			let totalqty_all = data.TOTALQTY_ALL || data.totalqty_all || 0;

			const date = $("#productionStockCountWIPList_searchVal_date").val();
			//console.log('data')
			//console.log(data);

			//console.log('date')
			//console.log(date);
			tableBody += `
		        <tr class= "productionStockCountWIPList_row" data-unique = '${date}_${itemcode}_${workLocation}_${qty}_${bqty}'>
		            <td class="noVal">${rowNumber}</td>
		            <td class="itemcodeVal">${itemcode}</td>
		            <td class="itemnameVal-long">${itemname}</td>
		            <td class="qtyInputVal">
		                <input type="text" value="${qty}" />
		            </td>
		            <td class="bqtyInputVal">
		                <input type="text" value="${bqty}" />
		            </td>
		        </tr>
		        `;

			const fmt = v => Number(v || 0).toLocaleString();

			// 🔵 전체 수량 합 (OK+NG)
			$(".productionStockCountWIPListTotalQty").text(fmt(totalqty_all));

			// OK / NG 합계
			$("#productionStockCountWIPListTotalOksum").text(fmt(totalqty));
			$("#productionStockCountWIPListTotalNgsum").text(fmt(totalbqty));

		}
		$("#productionStockCountWIPListDetailTableBody").html(tableBody);
		// ✅ 테이블 다시 그린 후, 현재 화면 기준으로 합계 재계산
		updateProductionStockCountWIPListSummary();
	}

	function renderProductionStockCountWIPListPagination() {
		let paginationHtml = "";

		if (currentProductionStockCountWIPListPage > 1) {
			paginationHtml += `<button class="productionStockCountWIPList-page-btn" data-page="${currentProductionStockCountWIPListPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="productionStockCountWIPList-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentProductionStockCountWIPListPage - 5);
		let endPage = Math.min(totalProductionStockCountWIPListPages, currentProductionStockCountWIPListPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="productionStockCountWIPList-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentProductionStockCountWIPListPage) {
				paginationHtml += `<button class="productionStockCountWIPList-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="productionStockCountWIPList-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalProductionStockCountWIPListPages) {
			if (endPage < totalProductionStockCountWIPListPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="productionStockCountWIPList-page-btn" data-page="${totalProductionStockCountWIPListPages}">${totalProductionStockCountWIPListPages}</button>`;
		}

		if (currentProductionStockCountWIPListPage < totalProductionStockCountWIPListPages) {
			paginationHtml += `<button class="productionStockCountWIPList-page-btn" data-page="${currentProductionStockCountWIPListPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="productionStockCountWIPList-page-btn disabled">&gt;</button>`;
		}

		$("#productionStockCountWIPListPaginationContainer").html(paginationHtml);
	}

	function updateProductionStockCountWIPListTotalCount() {
		$('#productionStockCountWIPListTotalCount').text(Number(totalProductionStockCountWIPListCount).toLocaleString());
		$('#productionStockCountWIPListCurrentPageInfo').text(currentProductionStockCountWIPListPage);
		$('#productionStockCountWIPListTotalPageInfo').text(totalProductionStockCountWIPListPages);
	}


	$(document).ready(function() {

		window.filteredProductionStockCountWIPListData = [];
		window.productionStockCountWIPListColumns = [
			{ key: 'ITEMCODE', header: 'itemcode' },
			{ key: 'ITEMNAME', header: 'itemname' },
			{ key: 'QTY', header: 'ok', type: 'number' },
			{ key: 'BQTY', header: 'ng', type: 'number' }
		];

		// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
		window.call_mProduction_stock_count_wip_list = function(menuId) {
			showLoading("data");

			const factory = getCookie('selectedFactory');
			const { toDate } = getDefaultDateRange();
			let storage = 'Material';

			// 재공재고실사 초기 검색값 방지
			//performProductionStockCountWIPListDBSearch({ factory, wc: saveWorkCenter, date: toDate });

			// 초기 화면은 그려줌
			renderProductionStockCountWIPListView();
			hideLoading();

		}

		// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
		function performProductionStockCountWIPListDBSearch(searchCriteria) {
			showLoading("data");

			$.ajax({
				url: "/read_purchaseStockCountWIPList",
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
					filteredData_productionStockCountWIPList = [...allServerData]; // 초기에는 필터링 없음
					console.log(filteredData_productionStockCountWIPList);
					totalQty = response.totalQty || 0;

					// 페이지 초기화
					currentProductionStockCountWIPListPage = 1;
					currentSortColumn = null;
					currentSortOrder = 'asc';

					// 클라이언트에서 페이징 처리
					applyClientPagination_production();

					// 첫 번째 검색이라면 뷰를 렌더링
					if (!$('#view_mProduction_stock_count_wip_list').length) {
						renderProductionStockCountWIPListView();
					} else {
						// 기존 뷰가 있다면 테이블만 업데이트
						renderProductionStockCountWIPListTableData();
						renderProductionStockCountWIPListPagination();
						updateProductionStockCountWIPListTotalCount();
					}

					// 총 수량 업데이트
					updateTotalQty();

					//$(".btnProductionIntfStockCountWIPList").prop("disabled", false);
					$(".btnProductionIntfStockCountWIPList").removeClass("ERPGuideAlert");

					hideLoading();
				},
				error: function(xhr, status, error) {
					console.log("🔥 LOCAL ajax error:", status, error);
					console.log("Response:", xhr.responseText);

					const message = "An error occurred while processing the request.\n\n"
						+ "Details:\n"
						+ (xhr.responseText || error || status || "Unknown error");

					// 🔹 기본 alert 대신 커스텀 모달 사용
					window.showCopyableAlert(message);

					hideLoading();
				}
			});
		}

		// 클라이언트에서 페이징 처리
		function applyClientPagination_production() {
			// ✅ 렌더링할 때마다 쿠키에서 읽기
			productionStockCountWIPListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

			totalProductionStockCountWIPListCount = filteredData_productionStockCountWIPList.length;
			totalProductionStockCountWIPListPages = Math.ceil(totalProductionStockCountWIPListCount / productionStockCountWIPListItemsPerPage);

			// 현재 페이지 범위 계산
			const startIndex = (currentProductionStockCountWIPListPage - 1) * productionStockCountWIPListItemsPerPage;
			const endIndex = startIndex + productionStockCountWIPListItemsPerPage;

			// 현재 페이지 데이터 추출
			globalProductionStockCountWIPListData = filteredData_productionStockCountWIPList.slice(startIndex, endIndex);
			window.filteredProductionStockCountWIPListData = globalProductionStockCountWIPListData;
		}

		// 🔹 바깥에서도 쓸 수 있게 export
		window.applyClientPagination_production = applyClientPagination_production;

		// 클라이언트에서 정렬 처리
		function applyClientSort_production(column, dataType) {

			$('#productionStockCountWIPListDetailTableBody tr').each(function(index) {
				const $tr = $(this);
				const qtyVal = $tr.find('.qtyInputVal input').val().replace(/,/g, '') || '0';
				const bqtyVal = $tr.find('.bqtyInputVal input').val().replace(/,/g, '') || '0';

				// 현재 페이지의 filteredData_productionStockCountWIPList 아이템 찾기
				const dataIndex = (currentProductionStockCountWIPListPage - 1) * productionStockCountWIPListItemsPerPage + index;
				if (filteredData_productionStockCountWIPList[dataIndex]) {
					filteredData_productionStockCountWIPList[dataIndex].QTY = parseFloat(qtyVal) || 0;
					filteredData_productionStockCountWIPList[dataIndex].BQTY = parseFloat(bqtyVal) || 0;
				}
			});

			// 같은 컬럼 클릭 시 정렬 방향 토글
			if (currentSortColumn === column) {
				currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
			} else {
				currentSortColumn = column;
				currentSortOrder = 'asc';
			}

			// 데이터 정렬
			filteredData_productionStockCountWIPList.sort((a, b) => {
				let valA = a[column] || a[column.toLowerCase()] || '';
				let valB = b[column] || b[column.toLowerCase()] || '';

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
			currentProductionStockCountWIPListPage = 1;
			applyClientPagination_production();

			// 테이블 업데이트
			renderProductionStockCountWIPListTableData();
			renderProductionStockCountWIPListPagination();
			updateProductionStockCountWIPListTotalCount();

			// 헤더에 정렬 표시 업데이트
			updateSortIndicators(column);
		}

		// 헤더에 정렬 방향 표시
		function updateSortIndicators(column) {
			$('.data-table thead th').removeClass('sort-asc sort-desc');
			$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
		}

		// 사용자 뷰 렌더링 함수
		function renderProductionStockCountWIPListView() {
			let content_output = `
			<div class="divBlockControl" id="view_mProduction_stock_count_wip_list">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="productionStockCountWIPList_searchVal_date" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="productionStockCountWIPList_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="productionStockCountWIPList_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory" >${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id = "productionStockCountWIPList_searchVal_factory" class="factory-select">
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage" >${i18n.t('search.wccode')}<!-- WC --></div>
								<select id = "productionStockCountWIPList_searchVal_wc" >
									<option value="SALTILLO-H/REST">SALTILLO-H/REST</option>
									<option value="SALTILLO-REDCAGE">SALTILLO-REDCAGE</option>
									<option value="SALTILLO-OUTSIDE">SALTILLO-OUTSIDE</option>
									<option value="SALTILLO-AUNDE">SALTILLO-AUNDE</option>
									<option value="PUEBLA-WORKSHOP">PUEBLA-WORKSHOP</option>
									<option value="PUEBLA-REDCAGE">PUEBLA-REDCAGE</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<!--<button class="btn btn-primary btnTableSearch">${i18n.t('btn.search')} 검색</button>-->
							<!--<button class="btn btn-warning btnProductionStockCountWIPListSearch">VIEW location에서 itemcode 가져오는 버튼 251129주석 shj</button>-->
							<button class="btn btn-primary btnProductionStockCountWIPListSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnProductionStockCountWIPListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							    <strong id="productionStockCountWIPListTotalCount"></strong>
							    ${i18n.t('table.info.records')} |
							    <span class="tqtyTitle">
							        ${i18n.t('table.info.qty')} :
							    </span>
							    <span class="productionStockCountWIPListTotalQty" style="color:#007bff">
							        0
							    </span>
							</span>
							
							<span>
							    | ${i18n.t('table.info.oksum')}
							    <strong id="productionStockCountWIPListTotalOksum">0</strong>
							    ${i18n.t('table.info.records')}
							</span>
							
							<span>
							    | ${i18n.t('table.info.ngsum')}
							    <strong id="productionStockCountWIPListTotalNgsum">0</strong>
							    ${i18n.t('table.info.records')}
							</span>

							<div class="action-buttons-right mProduction_stock_count_wip_list">
								<div id="defaultActions" class="action-group">									
								<button class="btn btn-success" id="productionStockcountWIPListExcelForm">Excel Form</button>
									<input type="file" id="excelFile_production" accept=".xlsx, .xls" style="display:none;"/>
						            <input type="button" class="btn btnFileSelect_production" value="Select File" style="background-color: #185c37; color: white;">
									<button class="btn btn-success" id="productionStockCountWIPListExcelBtn" onclick="downloadAllProductionStockCountWIPListData()">Excel</button>
								</div>
							</div>	
							<div class="btnItemsArea" style="margin-left:24px;">
								<input class="btn" type= "date" id="productionStockCountWIPListDate" />
								<select class="btn" id = "productionStockCountWIPListWorkshop">
									<option value="SALTILLO-H/REST">SALTILLO-H/REST</option>
									<option value="SALTILLO-REDCAGE">SALTILLO-REDCAGE</option>
									<option value="SALTILLO-OUTSIDE">SALTILLO-OUTSIDE</option>
									<option value="SALTILLO-AUNDE">SALTILLO-AUNDE</option>
									<option value="PUEBLA-WORKSHOP">PUEBLA-WORKSHOP</option>
									<option value="PUEBLA-REDCAGE">PUEBLA-REDCAGE</option>
								</select>
								<button class="btn btn-primary" id="productionStockCountWIPListSaveBtn">Save</button>
								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnProductionIntfStockCountWIPList"/>
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnProductionIntfStockCountWIPListDelete"/>

							</div>
						</div>
						<table class="data-table mProduction_stock_count_wip_list" id="productionStockCountWIPListTable">
							<thead>
								<tr>
									<th class="noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class="itemnameVal-long" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class="qtyInputVal" data-sort="QTY" data-type="number">${i18n.t('search.wip.qty')}<!-- Qty --></th>
									<th class="bqtyInputVal" data-sort="BQTY" data-type="number">${i18n.t('search.wip.bqty')}<!-- Qty --></th>
								</tr>
							</thead>
							<tbody id="productionStockCountWIPListDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="productionStockCountWIPListPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="productionStockCountWIPList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="productionStockCountWIPList_itemsPerPage" class="items-per-page-select">
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
				const { fromDate, toDate } = getDefaultDateRange();
				const factory = getCookie('selectedFactory');  // ✅ 추가

				$("#productionStockCountWIPList_searchVal_date").val(toDate);
				$("#productionStockCountWIPListDate").val(toDate);

				$("#productionStockCountWIPList_searchVal_factory").val(factory);

				// ✅ 수정 후
				const savedItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;
				productionStockCountWIPListItemsPerPage = savedItemsPerPage;
				$("#productionStockCountWIPList_itemsPerPage").val(savedItemsPerPage);
			})();

			// 공장 및 창고 선택
			renderFactoryStorage();
			// 테이블 데이터 렌더링
			renderProductionStockCountWIPListTableData();
			window.renderProductionStockCountWIPListTableData = renderProductionStockCountWIPListTableData;
			// 페이지네이션 렌더링
			renderProductionStockCountWIPListPagination();
			window.renderProductionStockCountWIPListPagination = renderProductionStockCountWIPListPagination;
			// 이벤트 바인딩
			bindProductionStockCountWIPListEvents();
			// 초기 렌더링 후 카운트 업데이트
			updateProductionStockCountWIPListTotalCount();
			window.updateProductionStockCountWIPListTotalCount = updateProductionStockCountWIPListTotalCount;

			$(function() {
				const factory = (getCookie('selectedFactory') || '').toUpperCase(); // 예: 'SALTILLO', 'PUEBLA'
				const $select = $('#productionStockCountWIPList_searchVal_wc');
				const $select_inList = $('#productionStockCountWIPListWorkshop');

				// 제목에서 "구매 > 재고실사 >" 이런 텍스트 가져오기
				const rawTitle = $('.w_titleText_1').text() || '';
				const mainMenu = (rawTitle
					.split('>')
					.map(t => t.trim())
					.filter(Boolean)[0]) || '';   // 첫 번째 값: '구매' 또는 '생산'

				// 기존 옵션 제거
				$select.empty();
				$select_inList.empty();

				console.log('factory')
				console.log($(".w_titleText_1").text())

				// 🔹 1차: 메뉴(구매 / 생산)
				//if (mainMenu === '생산' || mainMenu === 'Production' || mainMenu === 'Producción') {
				// 👉 생산 메뉴일 때 (원하시는 옵션으로 수정)
				if (factory === 'SALTILLO') {
					if (mainMenu === '생산' || mainMenu === 'Production' || mainMenu === 'Producción') {
						$select.append('<option value="H/REST">SALTILLO-H/REST</option>');
						$select_inList.append('<option value="H/REST">SALTILLO-H/REST</option>');						
						saveWorkCenter = 'SALTILLO-H/REST';
					}else{
						$select.append('<option value="REDCAGE">SALTILLO-REDCAGE</option>');
						$select_inList.append('<option value="REDCAGE">SALTILLO-REDCAGE</option>');
						saveWorkCenter = 'SALTILLO-REDCAGE';
					}
					
				} else if (factory === 'PUEBLA') {
					if (mainMenu === '생산' || mainMenu === 'Production' || mainMenu === 'Producción') {
						$select.append('<option value="WORKSHOP">PUEBLA-WORKSHOP</option>');
						$select_inList.append('<option value="WORKSHOP">PUEBLA-WORKSHOP</option>');
						saveWorkCenter = 'PUEBLA-WORKSHOP';
					}else{
						$select.append('<option value="REDCAGE">PUEBLA-REDCAGE</option>');
						$select_inList.append('<option value="REDCAGE">PUEBLA-REDCAGE</option>');
						saveWorkCenter = 'PUEBLA-REDCAGE';
					}				
				} else {
					$select.append('<option value="H/REST">SALTILLO-H/REST</option>');
					$select.append('<option value="OUTSIDE">SALTILLO-OUTSIDE</option>');
					$select.append('<option value="AUNDE">SALTILLO-AUNDE</option>');
					$select.append('<option value="WORKSHOP">PUEBLA-WORKSHOP</option>');
					$select_inList.append('<option value="H/REST">SALTILLO-H/REST</option>');
					$select_inList.append('<option value="OUTSIDE">SALTILLO-OUTSIDE</option>');
					$select_inList.append('<option value="AUNDE">SALTILLO-AUNDE</option>');
					$select_inList.append('<option value="WORKSHOP">PUEBLA-WORKSHOP</option>');
					saveWorkCenter = 'SALTILLO-H/REST';
				}
				//} else {
				//}
			});

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
			const fromDate = fmtLocalDate(today);
			return { fromDate, toDate };
		}

		// 공장 및 창고 선택 함수
		function renderFactoryStorage() {
			const factory = $('#productionStockCountWIPList_searchVal_factory');
			const storage = $('#productionStockCountWIPList_searchVal_wc');
			const savedFactory = getCookie('selectedFactory');

			function updateStorageOptions(factoryValue) {
				storage.empty();

				const options = {
					'SALTILLO': ['SALTILLO-OUTSIDE', 'SALTILLO-AUNDE'],
					'PUEBLA': ['PUEBLA-WORKSHOP'],
					'': ['SALTILLO-H/REST', 'SALTILLO-OUTSIDE', 'SALTILLO-AUNDE', 'PUEBLA-WORKSHOP', 'all']
				};

				const storageList = options[factoryValue] || options[''];

				storageList.forEach(item => {
					const text = item === 'all' ? i18n.t('search.all') : item;
					storage.append(`<option value="${item}">${text}</option>`);
				});

				storage.val(storageList[0]);
			}

			// ✅ 수정: 동적으로 factory option 생성
			factory.empty();

			if (savedFactory === 'SALTILLO') {
				factory.append(`<option value="SALTILLO">Saltillo</option>`);
			} else if (savedFactory === 'PUEBLA') {
				factory.append(`<option value="PUEBLA">Puebla</option>`);
			} else {
				factory.append(`<option value="">All</option>`);
			}
			/*factory.append(`<option value="SALTILLO">Saltillo</option>`);
			factory.append(`<option value="PUEBLA">Puebla</option>`);
			factory.append(`<option value="">All</option>`);*/

			// ✅ 수정: savedFactory 값이 있으면 설정
			if (savedFactory && savedFactory !== '') {
				factory.val(savedFactory);
			} else {
				factory.val('SALTILLO'); // 기본값
			}

			// ✅ 수정: factory 값에 따라 storage 업데이트
			updateStorageOptions(factory.val());

			factory.on('change', function() {
				updateStorageOptions($(this).val());
			});

			factory.on('change', function() {
				updateStorageOptions($(this).val());
			});
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


		function bindProductionStockCountWIPListEvents() {
			// 검색 버튼 클릭 - DB에서 새로 조회
			$(".btnProductionStockCountWIPListSearch").off('click').on('click', function() {
				performProductionStockCountWIPListSearch();
			});

			// 초기화 버튼 클릭
			$(".btnProductionStockCountWIPListSearchInit").off('click').on('click', function() {
				resetProductionStockCountWIPListSearch();
			});

			// ✅ 추가: 엑셀 폼 다운로드
			$("#productionStockcountWIPListExcelForm").off('click').on('click', function() {
				productionStockcountWIPListExcelForm();
			});

			// ✅ 추가: 파일 선택 버튼
			$(".btnFileSelect_production").off('click').on('click', function() {
				//$("#productionStockCountWIPListDetailTableBody").empty();
				$('#excelFile_production').click();
			});
			// 페이지당 건수 변경
			$(document).off('change', '#productionStockCountWIPList_itemsPerPage')
				.on('change', '#productionStockCountWIPList_itemsPerPage', function() {
					const val = parseInt($(this).val(), 10) || 100;
					changeProductionStockCountWIPListItemsPerPage(val);
				});

			$("#excelFile_production").off('change').on('change', function() {

				// 이미 업로드된 엑셀 있을 때 처리
				if (hasExcelUploaded) {
					const msg =
						"There is already uploaded Excel data.\n" +
						"To load a new file, please refresh the page first.\n\n" +
						"Do you want to refresh now?";

					if (confirm(msg)) {
						sessionStorage.setItem('autoOpenMenuId', 'mProduction_stock_count_wip_list');
						location.reload();
					}

					// ✅ 선택값 초기화
					this.value = "";
					return;
				}

				/// 최초/중복오류 등 모든 경우 공통 처리
				if (this.files[0]) {
					const file = this.files[0];

					// ✅ 여기서 파일명 + 용량 로그 출력
					console.log(
						`[Excel Upload] name: ${file.name}, size: ${(file.size / 1024).toFixed(1)} KB`
					);

					excelFileUpload_production(file);
				}

				// ✅ 여기서 항상 비워줌 → 같은 파일 다시 선택해도 change 발생
				this.value = "";
			});


			// ✅ 추가: Save 버튼
			$('#productionStockCountWIPListSaveBtn').off('click').on('click', function() {
				saveProductionStockCountWIPList();
			});

			// 페이지네이션 버튼 클릭
			$(document).off('click', '.productionStockCountWIPList-page-btn').on('click', '.productionStockCountWIPList-page-btn', function() {
				if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
					let page = parseInt($(this).data('page'));
					if (page && page > 0) {
						currentProductionStockCountWIPListPage = page;
						applyClientPagination_production();
						renderProductionStockCountWIPListTableData();
						renderProductionStockCountWIPListPagination();
						updateProductionStockCountWIPListTotalCount();
					}
				}
			});

			// ✅ 테이블 입력값 변경 감지 (QTY 입력)
			$(document).on('input', '#productionStockCountWIPListDetailTableBody .qtyInputVal input', function() {
				const $input = $(this);
				let raw = $input.val();

				// 1) 숫자 + 소수점 + 콤마만 남기기
				raw = raw.replace(/[^0-9.,]/g, '');

				// 2) 콤마 모두 제거
				raw = raw.replace(/,/g, '');

				// 3) 소수점 여러 개 들어오면 첫 번째만 허용
				const parts = raw.split('.');
				if (parts.length > 2) {
					raw = parts[0] + '.' + parts.slice(1).join('');
				}

				if (raw === '') {
					$input.val('');
					$input.removeClass('qty-changed');

					const rowIndex = $input.closest('tr').index();
					const globalIndex =
						(currentProductionStockCountWIPListPage - 1) * productionStockCountWIPListItemsPerPage + rowIndex;

					if (filteredData_productionStockCountWIPList[globalIndex]) {
						filteredData_productionStockCountWIPList[globalIndex].QTY = 0;
						filteredData_productionStockCountWIPList[globalIndex].qty = 0;
					}

					updateProductionStockCountWIPListSummary();
					return;
				}


				// 🔹 숫자 값
				let numericVal = parseFloat(raw);
				if (isNaN(numericVal)) numericVal = 0;

				let display = raw;

				// 4) 소수점이 있는 경우
				if (raw.includes('.')) {
					const [intPart, decimalPart] = raw.split('.');
					if (intPart === '') {
						// ".5" 이런 입력은 그대로 두되, 합계 계산용으로는 numericVal 사용
						display = '.' + decimalPart;
					} else {
						const intNum = parseInt(intPart, 10);
						if (isNaN(intNum)) {
							$input.val('');
							$input.removeClass('qty-changed');
							updateProductionStockCountWIPListSummary();
							return;
						}
						display = intNum.toLocaleString('en-US') + '.' + decimalPart;
					}
				} else {
					// 5) 정수인 경우
					const intNum = parseInt(raw, 10);
					if (isNaN(intNum)) {
						$input.val('');
						$input.removeClass('qty-changed');
						updateProductionStockCountWIPListSummary();
						return;
					}
					display = intNum.toLocaleString('en-US');
				}

				// 6) 화면에 보여줄 값 세팅
				$input.val(display);

				// 7) 원래 값과 현재 값 비교
				const original = String($input.data('original') ?? '');
				const currentNormalized = raw;

				if (currentNormalized === original) {
					$input.removeClass('qty-changed');
				} else {
					$input.addClass('qty-changed');
				}

				// 🔹 8) filteredData_productionStockCountWIPList에 현재 페이지의 해당 행 반영
				const rowIndex = $input.closest('tr').index(); // 0-based
				const globalIndex = (currentProductionStockCountWIPListPage - 1) * productionStockCountWIPListItemsPerPage + rowIndex;

				if (filteredData_productionStockCountWIPList[globalIndex]) {
					filteredData_productionStockCountWIPList[globalIndex].QTY = numericVal;
					filteredData_productionStockCountWIPList[globalIndex].qty = numericVal;
				}

				// 9) 합계 갱신
				updateProductionStockCountWIPListSummary();
			});


			// 헤더 클릭 시 정렬
			$('#productionStockCountWIPListTable thead th[data-sort]').off('click').on('click', function() {
				const column = $(this).data('sort');
				const dataType = $(this).data('type') || 'string';
				applyClientSort_production(column, dataType);
			});

			// 엔터키 검색
			$('#view_mProduction_stock_count_wip_list input[type="text"], #view_mProduction_stock_count_wip_list input[type="date"]').off('keypress').on('keypress', function(e) {
				if (e.which === 13) {
					performProductionStockCountWIPListSearch();
				}
			});
		}

		// ✅ 전체(filteredData_productionStockCountWIPList) 기준으로 합계 계산 (페이지/페이지당 개수와 무관)
		window.updateProductionStockCountWIPListSummary = function() {
			let sumOkAll = 0; // QTY 전체 합
			let sumNgAll = 0; // BQTY 전체 합

			// 👉 항상 filteredData_productionStockCountWIPList 전체 기준으로 돌면서 합계
			(filteredData_productionStockCountWIPList || []).forEach(function(row) {
				const qVal = parseFloat(row.QTY ?? row.qty ?? 0) || 0;
				const bVal = parseFloat(row.BQTY ?? row.bqty ?? 0) || 0;

				sumOkAll += qVal;
				sumNgAll += bVal;
			});

			const totalAll = sumOkAll + sumNgAll;

			// 🔵 파란 숫자: QTY + BQTY 전체 합
			$(".productionStockCountWIPListTotalQty").text(
				Number(totalAll).toLocaleString()
			);

			// OK / NG 합계 (전체 기준)
			$("#productionStockCountWIPListTotalOksum").text(
				Number(sumOkAll).toLocaleString()
			);
			$("#productionStockCountWIPListTotalNgsum").text(
				Number(sumNgAll).toLocaleString()
			);
		};



		function getCurrentSearchCriteria() {
			return {
				itemcode: $("#productionStockCountWIPList_searchVal_itemcode").val().trim().toUpperCase() || '',
				itemname: $("#productionStockCountWIPList_searchVal_itemname").val().trim().toUpperCase() || '',
				date: $("#productionStockCountWIPList_searchVal_date").val().trim().toUpperCase() || '',
				factory: $("#productionStockCountWIPList_searchVal_factory").val().trim().toUpperCase() || '',
				wc: $("#productionStockCountWIPList_searchVal_wc").val().trim().toUpperCase() || ''
			};
		}

		function performProductionStockCountWIPListSearch() {
			let searchCriteria = getCurrentSearchCriteria();
			console.log("검색 조건:", searchCriteria);

			currentProductionStockCountWIPListPage = 1;
			performProductionStockCountWIPListDBSearch(searchCriteria);
		}

		function resetProductionStockCountWIPListSearch() {
			const factory = getCookie('selectedFactory');
			const { fromDate, toDate } = getDefaultDateRange();

			let parts = saveWorkCenter.split("-");
			let storage = parts[1];   // OUTSIDE

			console.log(storage);   // OUTSIDE


			$("#productionStockCountWIPList_searchVal_date").val(toDate);
			$("#productionStockCountWIPList_searchVal_factory").val(factory);
			$("#productionStockCountWIPList_searchVal_wc").val(storage);
			$("#productionStockCountWIPList_searchVal_itemcode").val('');
			$("#productionStockCountWIPList_searchVal_itemname").val('');

			// 🔽🔽🔽 엑셀 업로드 상태/버튼도 같이 초기화 🔽🔽🔽
			hasExcelUploaded = false;                           // 다시 업로드 가능 상태로
			$("#excelFile_production")
				.prop("disabled", false)                       // input 활성화
				.val("");                                      // 선택된 파일 이름도 초기화

			$(".btnFileSelect_production")
				.prop("disabled", false)                       // 버튼 활성화
				.css("opacity", "1");                          // 흐려진 스타일 복원

			// 혹시 남아 있을 수 있는 ERP 경고 플래그도 같이 해제 (안전용)
			$(".btnProductionIntfStockCountWIPList").removeClass("ERPGuideAlert");

			currentProductionStockCountWIPListPage = 1;
			performProductionStockCountWIPListDBSearch({ factory, wc: saveWorkCenter, date: toDate });

			console.log('검색 조건이 초기화되었습니다.');
		}

		function updateTotalQty() {
			// 서버 totalQty 말고, 현재 테이블 기준으로 다시 계산
			updateProductionStockCountWIPListSummary();
		}

		window.changeProductionStockCountWIPListItemsPerPage = function(newItemsPerPage) {
			productionStockCountWIPListItemsPerPage = newItemsPerPage;
			currentProductionStockCountWIPListPage = 1; // 페이지를 1로 초기화

			// ✅ 쿠키에 저장 추가!
			setCookie('itemsPerPage', newItemsPerPage);

			applyClientPagination_production();
			renderProductionStockCountWIPListTableData();
			renderProductionStockCountWIPListPagination();
			updateProductionStockCountWIPListTotalCount();

			console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
		}

		window.exportProductionStockCountWIPListData = function() {
			return {
				total: filteredData_productionStockCountWIPList.length,
				currentPage: currentProductionStockCountWIPListPage,
				itemsPerPage: productionStockCountWIPListItemsPerPage,
				data: filteredData_productionStockCountWIPList
			};
		}

		// 🔽 새로고침 후 “이 페이지만” 자동으로 다시 열기
		const autoMenuId = sessionStorage.getItem('autoOpenMenuId');

		if (autoMenuId === 'mProduction_stock_count_wip_list') {
			// 한번 썼으면 즉시 삭제
			sessionStorage.removeItem('autoOpenMenuId');

			if (typeof window.call_mProduction_stock_count_wip_list === 'function') {
				window.call_mProduction_stock_count_wip_list(autoMenuId);
			} else {
				// 혹시 모를 경우 대비 – 메뉴 버튼 클릭 방식
				$('#mProduction_stock_count_wip_list').trigger('click');
			}
		}


	});

	// 전체 데이터 엑셀 다운로드
	window.downloadAllProductionStockCountWIPListData = function() {

		// ✅ 현재 검색 기준 전체 데이터 사용
		const exportData = filteredData_productionStockCountWIPList.map(row => ({
			ITEMCODE: row.ITEMCODE || row.itemcode || '',
			ITEMNAME: row.ITEMNAME || row.itemname || '',
			QTY: Number(row.QTY || row.qty || 0),
			BQTY: Number(row.BQTY || row.bqty || 0)
		}));

		showLoading("export");

		ExcelExporter.downloadExcel(exportData, window.productionStockCountWIPListColumns, {
			fileName: 'productionStockCountWIPList_All',
			sheetName: 'productionStockCountWIPList'
		});

		hideLoading();
	};

	function productionStockcountWIPListExcelForm() {
		window.location.href = "/stockCountExcelFormDownload";
	}

	// 엑셀 파일 업로드
	function excelFileUpload_production(file) {
		if (!file) {
			alert("Please select an Excel file.");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		showLoading("import");

		$.ajax({
			url: `excelUpload`,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			success: function(res) {
				console.log(res);
				if (!res.success) {
					alert(res.message || "Excel Processing Failed");
					hideLoading();
					return;
				}

				// ✅ 데이터 정규화 (소문자 → 대문자)
				let excelData = res.data || [];

				if (!excelData || excelData.length === 0) {
					alert('No data available');
					hideLoading();
					return;
				}

				const normalizedData = excelData.map(item => ({
					ITEMCODE: item.itemcode || item.ITEMCODE || '',
					ITEMNAME: item.itemname || item.ITEMNAME || '',
					QTY: item.qty || item.QTY || 0,
					BQTY: item.bqty || item.BQTY || 0,
					SDATE: item.sdate || item.SDATE || '',
					FACTORY: item.factory || item.FACTORY || '',
					STORAGE: item.storage || item.STORAGE || ''
				}));

				// 🔴🔴🔴 여기서 중복 ITEMCODE 전체 검사 + 모아서 표시
				const seen = new Set();        // 이미 한 번 나온 코드들
				const duplicates = new Set();  // 중복으로 발견된 코드들만 저장

				for (const row of normalizedData) {
					const code = String(row.ITEMCODE || '').trim().toUpperCase();
					if (!code) continue; // 빈 코드는 스킵

					if (seen.has(code)) {
						// 이미 한 번 본 코드면 → 중복 목록에 넣기
						duplicates.add(code);
					} else {
						// 처음 나오는 코드면 seen에 기록
						seen.add(code);
					}
				}

				// ✅ 전체 검사 끝난 뒤에 한 번만 체크
				if (duplicates.size > 0) {
					const listText = [...duplicates].join('\n - ');
					/*alert(
						`The uploaded Excel file contains duplicated ITEMCODE values.\n\n` +
						`Please remove duplicates and try again.\n\n` +
						`Duplicated codes:\n - ${listText}`
					);*/
					showCopyableAlert(
						`The uploaded Excel file contains duplicated ITEMCODE values.\n\n` +
						`Please remove duplicates and try again.\n\n` +
						`Duplicated codes:\n - ${listText}`
					);


					hideLoading();
					return; // 👉 뒤 로직(필터 저장/테이블 렌더링 등) 실행 안 함
				}

				// ✅ filteredData_productionStockCountWIPList에 정규화된 데이터 저장 (전체 데이터는 filteredData_productionStockCountWIPList에)
				filteredData_productionStockCountWIPList = [...normalizedData];
				allServerData = [...normalizedData];
				totalQty = normalizedData.reduce((sum, item) => sum + (parseFloat(item.QTY || 0)), 0);

				$(".btnProductionIntfStockCountWIPList").addClass("ERPGuideAlert");
				hasExcelUploaded = true;

				currentProductionStockCountWIPListPage = 1;
				window.applyClientPagination_production();

				// 🔧 이 3줄을 수정하세요! 
				window.renderProductionStockCountWIPListTableData();      // ✅ window. 추가
				window.renderProductionStockCountWIPListPagination();     // ✅ window. 추가
				window.updateProductionStockCountWIPListTotalCount();     // ✅ window. 추가
				window.updateProductionStockCountWIPListSummary();

				$(".btnFileSelect_production").prop("disabled", true).css("opacity", "0.5");
				$("#excelFile_production").prop("disabled", true);

				hideLoading();
			},
			error: function(xhr, status, error) {
				console.log("🔥 LOCAL ajax error:", status, error);
				console.log("Response:", xhr.responseText);

				const message = "An error occurred while processing the request.\n\n"
					+ "Details:\n"
					+ (xhr.responseText || error || status || "Unknown error");

				// 🔹 기본 alert 대신 커스텀 모달 사용
				window.showCopyableAlert(message);

				hideLoading();
			}
		});

	}
	// ✅ 전체 filteredData_productionStockCountWIPList 기준으로 Save 리스트 만들기 (페이지 상관 없이 모두 저장)
	function getProductionStockCountWIPList() {
		const list = [];

		(filteredData_productionStockCountWIPList || []).forEach(function(row) {
			const itemcode = (row.ITEMCODE || row.itemcode || '').toString().trim();
			const itemname = (row.ITEMNAME || row.itemname || '').toString().trim();

			// 숫자값 (QTY / BQTY)
			const qty = Number(row.QTY ?? row.qty ?? 0) || 0;
			const bqty = Number(row.BQTY ?? row.bqty ?? 0) || 0;

			// 품번 없으면 버림 (방어용)
			if (!itemcode) {
				return;
			}

			// ❗ 필요하시면 둘 다 0인 건 제외도 가능
			// if (qty === 0 && bqty === 0) return;

			list.push({
				itemcode: itemcode,
				itemname: itemname,
				qty: qty,
				bqty: bqty
			});
		});

		return list;
	}


	function saveProductionStockCountWIPList() {
		const dataList = getProductionStockCountWIPList();
		const workshop = $('#productionStockCountWIPListWorkshop').val();
		const factory = getCookie('selectedFactory');
		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
		const date = $("#productionStockCountWIPListDate").val();
		console.log(dataList);

		if (dataList.length === 0) {
			alert("No data available.");
			return;
		}

		showLoading("data");

		if (confirm(
			`You are about to save ${dataList.length} items.\n\n` +
			`Date      : ${date}\n` +
			`factory: ${factory}\n` +
			`WorkCenter: ${workshop}\n\n` +
			`Do you want to continue?`
		)) {
			$.ajax({
				url: `/insertStockCountWIPList_purchase`,
				type: 'POST',
				data: JSON.stringify({
					list: dataList,
					factory: factory,
					workshop: workshop,
					loginid: loginid,
					date: date
				}),
				contentType: "application/json",
				success: function(res) {
					console.log(res);

					let pass = dataList.length - res;

					if (pass > 0) {
						alert(`${res} items have been saved. (${pass} unchanged items were skipped.)`);
					} else {
						alert(`${res} items have been saved.`);
					}

					// 1) 저장 로딩 종료
					hideLoading();

					// 2) 방금 저장한 조건을 검색 영역에 세팅
					$("#productionStockCountWIPList_searchVal_date").val(date);
					$("#productionStockCountWIPList_searchVal_factory").val(factory);

					// workshop 값과 검색용 wc 값이 다를 수 있으니,
					// 'SALTILLO-OUTSIDE' 형태면 뒤쪽만 잘라서 사용
					let wcForSearch = workshop;
					if (wcForSearch.indexOf('-') >= 0) {
						wcForSearch = wcForSearch.split('-')[1];  // OUTSIDE
					}
					$("#productionStockCountWIPList_searchVal_wc").val(wcForSearch);

					// 3) 기존 SEARCH 버튼 한 번 눌러서 재조회
					$(".btnProductionStockCountWIPListSearch").trigger("click");
				},
				error: function(xhr, status, error) {
					console.log("🔥 LOCAL ajax error:", status, error);
					console.log("Response:", xhr.responseText);

					const message = "An error occurred while processing the request.\n\n"
						+ "Details:\n"
						+ (xhr.responseText || error || status || "Unknown error");

					// 🔹 기본 alert 대신 커스텀 모달 사용
					window.showCopyableAlert(message);

					hideLoading();
				}
			});
		} else {
			hideLoading();
			return;
		}
	}

	// 엑셀 업로드일 때 테이블 
	function renderExcelUploadProductionStockCountWIPListTableData(list) {
		let tableBody = "";
		let excelTotalOk = 0;
		let excelTotalNg = 0;

		for (let i = 0; i < list.length; i++) {
			const qty = parseFloat(list[i].QTY || list[i].qty || 0);
			const bqty = parseFloat(list[i].BQTY || list[i].bqty || 0);

			excelTotalOk += qty;
			excelTotalNg += bqty;

			tableBody += `
            <tr>
                <td class="noVal">${i + 1}</td>	
                <td class="itemcodeVal">${list[i].ITEMCODE || list[i].itemcode || ''}</td>
                <td class="itemnameVal-long">${list[i].ITEMNAME || list[i].itemname || ''}</td>
                <td class="qtyInputVal">
                    <input type="text" data-original="${qty}" value="${Number(qty).toLocaleString()}" />
                </td>
                <td class="bqtyInputVal">
                    <input type="text" value="${bqty}" />
                </td>
            </tr>
        `;
		}

		$("#productionStockCountWIPListDetailTableBody").html(tableBody);

		const excelTotalAll = excelTotalOk + excelTotalNg;

		// 🔵 전체 합계
		$(".productionStockCountWIPListTotalQty").text(Number(excelTotalAll).toLocaleString());
		// OK / NG 합계
		$("#productionStockCountWIPListTotalOksum").text(Number(excelTotalOk).toLocaleString());
		$("#productionStockCountWIPListTotalNgsum").text(Number(excelTotalNg).toLocaleString());

		// 레코드 개수
		$('#productionStockCountWIPListTotalCount').text(Number(list.length).toLocaleString());
	}

	// 인터페이스 등록
	$(document).on("click", ".btnProductionIntfStockCountWIPList", function() {

		// 🔒 엑셀 업로드 후 저장/재조회 전에는 막기
		if ($(this).hasClass('ERPGuideAlert')) {
			alert("Save the uploaded Excel data first.\nThen reload the list by date to enable the ERP interface.");
			return;
		}

		// 1️⃣ 현재 페이지에 보이는 값들 먼저 filteredData_productionStockCountWIPList에 동기화 (마지막 미-blur 입력 반영)
		$('#productionStockCountWIPListDetailTableBody tr').each(function(index) {
			const $tr = $(this);
			const qtyStr = $tr.find('.qtyInputVal input').val() || '';
			const bqStr = $tr.find('.bqtyInputVal input').val() || '';

			const qty = qtyStr ? Number(qtyStr.replace(/,/g, '')) : 0;
			const bqty = bqStr ? Number(bqStr.replace(/,/g, '')) : 0;

			const globalIndex =
				(currentProductionStockCountWIPListPage - 1) * productionStockCountWIPListItemsPerPage + index;

			if (filteredData_productionStockCountWIPList[globalIndex]) {
				filteredData_productionStockCountWIPList[globalIndex].QTY = qty;
				filteredData_productionStockCountWIPList[globalIndex].qty = qty;
				filteredData_productionStockCountWIPList[globalIndex].BQTY = bqty;
				filteredData_productionStockCountWIPList[globalIndex].bqty = bqty;
			}
		});

		// 2️⃣ filteredData_productionStockCountWIPList 전체 기준으로 IID 리스트 생성
		const iidList = [];

		(filteredData_productionStockCountWIPList || []).forEach(function(row) {
			const date = (row.SDATE || row.sdate || $("#productionStockCountWIPList_searchVal_date").val() || '').toString().trim();
			const itemcode = (row.ITEMCODE || row.itemcode || '').toString().trim();
			const factory = (row.FACTORY || row.factory || '').toString().trim();
			const storage = (row.STORAGE || row.storage || '').toString().trim();
			const qty = Number(row.QTY ?? row.qty ?? 0) || 0;
			const bqty = Number(row.BQTY ?? row.bqty ?? 0) || 0;

			// 필수값 없으면 스킵
			if (!date || !itemcode || !factory || !storage) {
				return;
			}

			const workLocation = `${factory} - ${storage}`;
			// 기존 data-unique 포맷 재현: date_itemcode_factory - storage_qty_bqty
			const iid = `${date}_${itemcode}_${workLocation}_${qty}_${bqty}`;

			iidList.push(iid);
		});

		// 체크된 요소(실제론 전체 행) 없으면 경고
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		// 3️⃣ 첫 번째 IID로 날짜/공장/작업장 파싱 (기존 로직 유지)
		const first = iidList[0];                // 예: 2025-11-30_W1019..._SALTILLO - OUTSIDE_112_0
		const tokens = first.split('_');

		let date = tokens[0] || '';            // 2025-11-30
		let factory = '';
		let workshop = '';

		if (tokens[2]) {                          // "SALTILLO - OUTSIDE"
			const fs = tokens[2].split('-');
			if (fs.length >= 2) {
				factory = (fs[0] || '').trim();  // SALTILLO
				workshop = (fs[1] || '').trim();  // OUTSIDE
			} else {
				factory = tokens[2].trim();
			}
		}
		let intfDate = $("#productionStockCountWIPListDate").val();
		let wc = $("#productionStockCountWIPListWorkshop").val();

		// 4️⃣ 컨펌 메시지
		const msg =
			`ERP interface will be executed with the following parameters:\n\n` +
			`Date         : ${intfDate}\n` +
			`Factory      : ${factory}\n` +
			`WorkCenter: ${wc}\n` +
			`Total rows   : ${iidList.length}\n\n` +
			`Do you want to continue?`;

		if (!confirm(msg)) {
			return;
		}

		showLoading("data");

		console.log('iidList');
		console.log(iidList);

		const intfParam = {
			iidList: iidList,
			intfDate: intfDate,
			wc: wc,
			factory: factory
		}


		$.ajax({
			url: "/stockCountPurWIPListIntf",
			type: "POST",
			data: JSON.stringify(intfParam),
			contentType: "application/json",
			success: function(data) {
				//				console.log(data);
				if (data && data === 1) {
					alert(i18n.t('message.interface.completed'));
				} else if (data && data === 10) {
					alert(i18n.t('warning.closed.storage'));
				} else if (data && data === 11) {
					alert(i18n.t('warning.closed.workshop'));
				} else if (data && data === 12) {
					alert(i18n.t('warning.locked'));
				}
				hideLoading();
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});

	// .bqtyInputVal 안의 input 공통 적용
	$(document).on('blur', '.bqtyInputVal input', function() {
		let val = $(this).val().trim();
		if (val === '') return;

		// 소수점이 있는 경우
		if (val.includes('.')) {
			let parts = val.split('.', 2);
			let intPart = parts[0];   // 소수점 앞
			let fracPart = parts[1];  // 소수점 뒤

			// 소수점 앞이 전부 0이거나 비어 있으면 0으로
			// 예) "", "0", "000"  -> "0"
			if (/^0*$/.test(intPart)) {
				intPart = '0';
			} else {
				// 그 외는 앞의 0만 제거
				// 예) "001" -> "1"
				intPart = intPart.replace(/^0+/, '');
			}

			val = intPart + '.' + fracPart;

		} else {
			// 정수만 있는 경우
			if (/^0+$/.test(val)) {
				// 전부 0이면 0 하나만
				val = '0';
			} else {
				// 앞의 0만 제거
				val = val.replace(/^0+/, '');
			}
		}

		$(this).val(val);

		// 🔹 숫자값 계산
		let numericVal = parseFloat(val);
		if (isNaN(numericVal)) numericVal = 0;

		// 🔹 filteredData_productionStockCountWIPList에도 반영
		const $input = $(this);
		const rowIndex = $input.closest('tr').index();
		const globalIndex =
			(currentProductionStockCountWIPListPage - 1) * productionStockCountWIPListItemsPerPage + rowIndex;

		if (filteredData_productionStockCountWIPList[globalIndex]) {
			filteredData_productionStockCountWIPList[globalIndex].BQTY = numericVal;
			filteredData_productionStockCountWIPList[globalIndex].bqty = numericVal;
		}

		// 🔹 합계 다시 계산
		updateProductionStockCountWIPListSummary();
	});


	$(document).on("click", ".btnProductionIntfStockCountWIPListDelete", function() {
		let date = $("#productionStockCountWIPListDate").val();
		let wccode = $("#productionStockCountWIPListWorkshop").val();
		let factory = $("#productionStockCountWIPList_searchVal_factory").val();
		console.log(date + " - " + wccode);

		// 화면에 보여줄 메시지
		const msg =
			`Do you want to delete ERP data?\n\n` +
			`Date : ${date}\n` +
			`Factory : ${factory}\n` +
			`WorkCenter : ${wccode}`;

		if (!confirm(msg)) {
			return; // 사용자가 취소하면 여기서 끝
		}

		const param = {
			date: date,
			wccode: wccode,
			factory: factory
		}

		$.ajax({
			url: "/stockCountPurWIPListIntf_delete",
			type: "POST",
			data: JSON.stringify(param),
			contentType: "application/json",
			success: function(data) {
				if (data === 12) {
					alert(i18n.t('warning.locked'));
					hideLoading();
					return;
				}
				alert(`ERP deletion has been completed successfully.\nA total of ${data} records have been removed.`);
			},
			error: function(xhr, status, error) {
				console.log("🔥 LOCAL ajax error:", status, error);
				console.log("Response:", xhr.responseText);

				const message = "An error occurred while processing the request.\n\n"
					+ "Details:\n"
					+ (xhr.responseText || error || status || "Unknown error");

				// 🔹 기본 alert 대신 커스텀 모달 사용
				window.showCopyableAlert(message);

				hideLoading();
			}
		});


	});


})();
