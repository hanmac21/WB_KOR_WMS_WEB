/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

/*let allServerData = [];
let filteredData = [];
let globalStockCountWIPListData = [];
let totalStockCountWIPListCount = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';
$(document).ready(function() {

	window.filteredStockCountWIPListData = [];
	window.stockCountWIPListColumns = [
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'good', type: 'number' },
		{ key: 'BQTY', header: 'defect', type: 'number' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mProduction_stock_count_wip_list = function(menuId) {
		renderStockCountWIPListView();
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performStockCountWIPListDBSearch() {
		showLoading("data");
		let searchCriteria = getCurrentSearchCriteria();
		console.log(searchCriteria)
		$.ajax({
			url: "/read_stockCountWIPWrokList",
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
				filteredData = [...allServerData]; // 초기에는 필터링 없음
				totalQty = response.totalQty || 0;

				currentSortColumn = null;
				currentSortOrder = 'asc';
				
				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_stock_count_wip_list').length) {
					renderStockCountWIPListView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderStockCountWIPListTableData();
					updateStockCountWIPListTotalCount();
				}

				// 총 수량 업데이트
				updateTotalQty();

				$(".btnIntfStockCountWIPList").prop("disabled", false);
				
				hideLoading();
			},
			error: function(xhr, status, error) {
				console.error("DB 조회 실패:", error);
				hideLoading();
				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
			}
		});
	}

	// realstock DB에서 저장항목 조회
	function performStockCountWIPRealstockListDBSearch() {
		showLoading("data");
		let searchCriteria = getCurrentSearchCriteria();
		console.log(searchCriteria)
		$.ajax({
			url: "/read_stockCountWIPWrokList",
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
				filteredData = [...allServerData]; // 초기에는 필터링 없음
				totalQty = response.totalQty || 0;

				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_stock_count_wip_list').length) {
					renderStockCountWIPListView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderStockCountWIPListTableData();
					updateStockCountWIPListTotalCount();
				}

				// 총 수량 업데이트
				updateTotalQty();

				$(".btnIntfStockCountWIPList").prop("disabled", false);

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
	function applyClientPagination() {//
		totalStockCountWIPListCount = filteredData.length;

		globalStockCountWIPListData = filteredData;
		window.filteredStockCountWIPListData = globalStockCountWIPListData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		// 입력한 수량을 filteredData에 저장
		syncQtyFromTableToData();

		// 같은 컬럼 클릭 시 정렬 방향 토글
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		// 데이터 정렬
		filteredData.sort((a, b) => {
			let valA, valB;

			// 수량 컬럼일 때는 inputQty 기준으로
			if (column === 'QTY') {
				// 콤마 제거 후 숫자로 변환
				const rawA = String(a.inputQty || '0').replace(/,/g, '');
				const rawB = String(b.inputQty || '0').replace(/,/g, '');
				valA = parseFloat(rawA) || 0;
				valB = parseFloat(rawB) || 0;
			} else {
				valA = a[column] || a[column.toLowerCase()] || '';
				valB = b[column] || b[column.toLowerCase()] || '';

				if (dataType === 'number') {
					// 다른 숫자 컬럼도 콤마 제거 후 변환
					const rawA = String(valA).replace(/,/g, '');
					const rawB = String(valB).replace(/,/g, '');
					valA = parseFloat(rawA) || 0;
					valB = parseFloat(rawB) || 0;
				} else if (dataType === 'date') {
					valA = new Date(valA).getTime() || 0;
					valB = new Date(valB).getTime() || 0;
				} else {
					valA = String(valA).toUpperCase();
					valB = String(valB).toUpperCase();
				}
			}

			if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
			if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		applyClientPagination();

		// 테이블 업데이트
		renderStockCountWIPListTableData();
		updateStockCountWIPListTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderStockCountWIPListView() {
		let content_output = `
			<div class="divBlockControl" id="view_mProduction_stock_count_wip_list">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="stockCountWIPList_searchVal_date" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="stockCountWIPList_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="stockCountWIPList_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory" >${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id = "stockCountWIPList_searchVal_factory" class="factory-select">
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage" >${i18n.t('search.wccode')}<!-- WC --></div>
								<select id = "stockCountWIPList_searchVal_wc_production" >
									<option value="SALTILLO-H/REST">SALTILLO-H/REST</option>
									<option value="SALTILLO-OUTSIDE">SALTILLO-OUTSIDE</option>
									<option value="SALTILLO-AUNDE">SALTILLO-AUNDE</option>
									<option value="PUEBLA-WORKSHOP">PUEBLA-WORKSHOP</option>
								</select>
							</div>
						</div>
						<div class="search_button_area">
							<!--<button class="btn btn-primary btnTableSearch">${i18n.t('btn.search')} 검색</button>-->
							<!--<button class="btn btn-warning btnStockCountWIPListSearch">VIEW location에서 itemcode 가져오는 버튼 251129주석 shj</button>-->
							<button class="btn btn-warning btnStockCountWIPRealstockSearch">SEARCH</button>
							<button class="btn btn-secondary btnStockCountWIPListSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="stockCountWIPListTotalCount">${totalStockCountWIPListCount}</strong> ${i18n.t('table.info.records')} |  
							<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="stockCountWIPListTotalQty" style="color:#007bff">0</span>
							</span>
							<div class="action-buttons-right mProduction_stock_count_wip_list">
								<div id="defaultActions" class="action-group">									
								<button class="btn btn-success" id="productStockcountWIPListExcelForm">Excel Form</button>
									<input type="file" id="excelFile" accept=".xlsx, .xls" style="display:none;"/>
						            <input type="button" class="btn btnFileSelect" value="Select File" style="background-color: #185c37; color: white;">
									<!-- <button class="btn btn-success" id="stockCountWIPListExcelBtn" onclick="downloadAllStockCountWIPListData()">Excel</button> -->
								</div>
							</div>	
							<div class="btnItemsArea" style="margin-left:24px;">
								<input class="btn" type= "date" id="stockCountWIPListDate" />
								<select class="btn" id = "stockCountWIPListWorkshop_production">
									<option value="SALTILLO-H/REST">SALTILLO-H/REST</option>
									<option value="SALTILLO-OUTSIDE">SALTILLO-OUTSIDE</option>
									<option value="SALTILLO-AUNDE">SALTILLO-AUNDE</option>
									<option value="PUEBLA-WORKSHOP">PUEBLA-WORKSHOP</option>
								</select>
								<button class="btn btn-primary" id="stockCountWIPListSaveBtn">Save</button>
								<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfStockCountWIPList"/>
								<!--<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfStockCountWIPListDelete"/>-->

							</div>
						</div>
						<table class="data-table mProduction_stock_count_wip_list" id="stockCountWIPListTable">
							<thead>
								<tr>
									<th class="noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class="itemnameVal-long" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class="qtyInputVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- Qty --></th>
									<th class="locationVal" data-sort="WCCODE">${i18n.t('search.wccode')}<!-- 작업장 --></th>
								</tr>
							</thead>
							<tbody id="stockCountWIPListDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<!-- <div class="pagination" id="stockCountWIPListPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="stockCountWIPList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="stockCountWIPList_itemsPerPage" class="items-per-page-select">
					            <option value="100" selected>100</option>
					            <option value="300">300</option>
					            <option value="1000">1000</option>
					        </select>
					    </div>
					     -->
					</div>
				</div>
			</div>
		`;

		$(".w_contentArea").append(content_output);
		
		// ✅ 여기부터 추가하면 100% 정상 동작합니다
		const factoryCode = (getCookie('selectedFactory') || '').toUpperCase();
		const $factorySelect = $('#stockCountWIPList_searchVal_factory');
		$factorySelect.empty();

		if (factoryCode) {
			$factorySelect.append(`<option value="${factoryCode}">${factoryCode}</option>`);
		} else {
			$factorySelect.append(`<option value="">SELECT</option>`);
		}
		
		// ✅ 오늘 날짜 세팅
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const today = `${year}-${month}-${day}`;

		if (!$('#stockCountWIPList_searchVal_date').val()) {
			$('#stockCountWIPList_searchVal_date').val(today);
		}
		if (!$('#stockCountWIPListDate').val()) {
			$('#stockCountWIPListDate').val(today);
		}
		// 테이블 데이터 렌더링
		renderStockCountWIPListTableData();
		// 이벤트 바인딩
		bindStockCountWIPListEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateStockCountWIPListTotalCount();

		//renderFactoryStorage();

		$(function() {
			const factory = (getCookie('selectedFactory') || '').toUpperCase(); // 예: 'SALTILLO', 'PUEBLA'
			const $select = $('#stockCountWIPList_searchVal_wc_production');
			const $select_inList = $('#stockCountWIPListWorkshop_production');

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
				$select.append('<option value="SALTILLO-H/REST">SALTILLO-H/REST</option>');
				$select_inList.append('<option value="SALTILLO-H/REST">SALTILLO-H/REST</option>');
			} else if (factory === 'PUEBLA') {
				$select.append('<option value="PUEBLA-WORKSHOP">PUEBLA-WORKSHOP</option>');
				$select_inList.append('<option value="PUEBLA-WORKSHOP">PUEBLA-WORKSHOP</option>');
			} else {
				$select.append('<option value="SALTILLO-H/REST">SALTILLO-H/REST</option>');
				$select.append('<option value="SALTILLO-OUTSIDE">SALTILLO-OUTSIDE</option>');
				$select.append('<option value="SALTILLO-AUNDE">SALTILLO-AUNDE</option>');
				$select.append('<option value="PUEBLA-WORKSHOP">PUEBLA-WORKSHOP</option>');
				$select_inList.append('<option value="SALTILLO-H/REST">SALTILLO-H/REST</option>');
				$select_inList.append('<option value="SALTILLO-OUTSIDE">SALTILLO-OUTSIDE</option>');
				$select_inList.append('<option value="SALTILLO-AUNDE">SALTILLO-AUNDE</option>');
				$select_inList.append('<option value="PUEBLA-WORKSHOP">PUEBLA-WORKSHOP</option>');
			}
			//} else {
			//}
		});
	}

	function renderFactoryStorage() {
		const storage = $('#productionStockCountList_searchVal_storage');

		// 공장별 창고 옵션 설정
		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'SALTILLO': ['H/REST'],
				'PUEBLA': ['Workshop'],
				'': ['H/REST', 'Workshop', 'all']
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			// 첫 번째 옵션 선택 (Material)
			storage.val(storageList[0]);
		}

		// 저장된 공장 선택
		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}

		updateStorageOptions(savedFactory || '');

		// 공장 변경 시 창고 업데이트
		factory.on('change', function() {
			updateStorageOptions($(this).val());
		});
	}

	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	function updateStockCountWIPListTotalCount() {
		$('#stockCountWIPListTotalCount').text(Number(totalStockCountWIPListCount).toLocaleString());
	}

	// DB에서 데이터 가져올 때 테이블
	function renderStockCountWIPListTableData() {
		let tableBody = "";
		let totalQty = 0;
		for (let i = 0; i < globalStockCountWIPListData.length; i++) {
			let data = globalStockCountWIPListData[i];
			let qty = data.inputQty || data.QTY || data.qty || 0;
			let workLocation = data.factory + " - " + data.storage;
			let date = $('#stockCountWIPList_searchVal_date').val() || '';
			tableBody += `
            <tr class= "stockCountWIPList" data-unique = "${date}_${data.itemcode}_${workLocation}_${qty}">
                <td class="noVal">${i + 1}</td>
                <td class="itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
                <td class="itemnameVal-long">${data.ITEMNAME || data.itemname || ''}</td>
                <td class="qtyInputVal">
                	<input type="text" data-original = "${qty}" value = "${qty || ''}" />
                </td>
                <td class="locationVal">${workLocation}</td>
            </tr>
        `;
			totalQty = totalQty + Number(qty);
		}
		$("#stockCountWIPListDetailTableBody").html(tableBody);

		$(".stockCountWIPListTotalQty").text(Number(totalQty).toLocaleString());
	}

	// 엑셀 업로드일 떄 테이블 
	function renderExcelUploadStockCountWIPListTableData(list) {
		let tableBody = "";
		let excelTotalQty = 0;

		for (let i = 0; i < list.length; i++) {

			tableBody += `
            <tr>
                <td class="noVal">${i + 1}</td>	
                <td class="itemcodeVal">${list[i].ITEMCODE || list[i].itemcode || ''}</td>
                <td class="itemnameVal-long">${list[i].ITEMNAME || list[i].itemname || ''}</td>
                <td class="qtyInputVal">
                	<input type="text" data-original = "${list[i].qty}" value = "${Number(list[i].QTY || list[i].qty || 0).toLocaleString()}" />
                </td>
            </tr>
			`;
			excelTotalQty += list[i].qty;
		}

		$("#stockCountWIPListDetailTableBody").html(tableBody);

		$(".stockCountWIPListTotalQty").text(Number(excelTotalQty).toLocaleString());
		$('#stockCountWIPListTotalCount').text(Number(list.length).toLocaleString());
	}

	function bindStockCountWIPListEvents() {
		// 테이블에서 검색(필터링)
		$(".btnTableSearch").off('click').on('click', function() {
			stockCountWIPListTableSearch();
		});

		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnStockCountWIPListSearch").off('click').on('click', function() {
			performStockCountWIPListDBSearch();
		});

		// 검색 버튼 클릭 - realstock DB에서 저장항목 조회
		$(".btnStockCountWIPRealstockSearch").off('click').on('click', function() {
			performStockCountWIPRealstockListDBSearch();
		});

		// 초기화 버튼 클릭
		$(".btnStockCountWIPListSearchInit").off('click').on('click', function() {
			resetStockCountWIPListSearch();
		});

		// 엑셀폼 다운로드
		$("#productStockcountWIPListExcelForm").off('click').on('click', function() {
			productStockcountWIPListExcelForm();
		});

		// 파일 선택 버튼 클릭
		$(".btnFileSelect").off('click').on('click', function() {
			$('#excelFile').click();
		});

		// 파일 클릭시 기존 선택 값 초기화
		$("#excelFile").off('click').on('click', function() {
			$(this).val('');
		});

		// 파일 선택 시
		$("#excelFile").off('change').on('change', function() {
			excelFileUpload(this.files[0]);
		});

		// 저장 버튼 클릭 시
		$('#stockCountWIPListSaveBtn').off('click').on('click', function() {
			saveStockCountWIPList();
		});

		$(document).on('input', '#stockCountWIPListDetailTableBody .qtyInputVal input', function() {
			const $input = $(this);
			let raw = $input.val();

			// 1) 숫자 + 소수점 + 콤마만 남기기
			raw = raw.replace(/[^0-9.,]/g, '');

			// 2) 콤마 모두 제거 (순수 숫자 + 소수점만 남김)
			raw = raw.replace(/,/g, '');

			// 3) 소수점 여러 개 들어오면 첫 번째만 허용
			const parts = raw.split('.');
			if (parts.length > 2) {
				raw = parts[0] + '.' + parts.slice(1).join('');
			}

			if (raw === '') {
				$input.val('');
				$input.removeClass('qty-changed');
				updateStockCountWIPListSummary();
				return;
			}

			let display = raw;

			// 4) 소수점이 있는 경우에도 정수 부분에 콤마 포맷 적용
			if (raw.includes('.')) {
				const [intPart, decimalPart] = raw.split('.');
				if (intPart === '') {
					// ".5" 같은 경우
					display = '.' + decimalPart;
				} else {
					const intNum = parseInt(intPart, 10);
					if (isNaN(intNum)) {
						$input.val('');
						$input.removeClass('qty-changed');
						updateStockCountWIPListSummary();
						return;
					}
					// 정수 부분만 콤마 포맷 + 소수점 + 소수 부분
					display = intNum.toLocaleString('en-US') + '.' + decimalPart;
				}
			} else {
				// 소수점이 없는 정수인 경우
				const intNum = parseInt(raw, 10);
				if (isNaN(intNum)) {
					$input.val('');
					$input.removeClass('qty-changed');
					updateStockCountWIPListSummary();
					return;
				}
				display = intNum.toLocaleString('en-US');
			}

			// 5) 화면에 보여줄 값 세팅
			$input.val(display);

			// 6) 원래 값과 현재 값 비교해서 변경 여부 표시
			const original = String($input.data('original') ?? '');
			const currentNormalized = raw;

			if (currentNormalized === original) {
				$input.removeClass('qty-changed');
			} else {
				$input.addClass('qty-changed');
			}

			// 7) 합계 갱신
			updateStockCountWIPListSummary();
		});

		// 헤더 클릭 시 정렬
		$('#stockCountWIPListTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색 - SEARCH 버튼 이벤트랑 동일함
		$('#view_mProduction_stock_count_wip_list input[type="text"], #view_mProduction_stock_count_wip_list input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				stockCountWIPListTableSearch();
			}
		});
	}

	// 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			itemcode: $("#stockCountWIPList_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#stockCountWIPList_searchVal_itemname").val().trim().toUpperCase(),
			sdate: $("#stockCountWIPList_searchVal_date").val().trim().toUpperCase(),
			wc: $("#stockCountWIPList_searchVal_wc_production").val().trim().toUpperCase()
		};
	}

	// SEARCH 버튼 눌러서 검색 조건으로 필터링 하는 함수
	function stockCountWIPListTableSearch() {
		const searchCriteria = getCurrentSearchCriteria();
		const itemcode = searchCriteria.itemcode;
		const itemname = searchCriteria.itemname;
		const sdate = searchCriteria.date;
		const wc = searchCriteria.wc;
		// 검색어 둘 다 비어있으면 전체 표시
		if (!itemcode && !itemname) {
			$("#stockCountWIPListDetailTableBody tr").show();
			updateStockCountWIPListSummary();
			return;
		}

		$("#stockCountWIPListDetailTableBody tr").each(function() {
			const $tr = $(this);

			const itemcodeText = $tr.find(".itemcodeVal").text().trim().toUpperCase();
			const itemnameText = $tr.find(".itemnameVal-long").text().trim().toUpperCase();

			let visible = true;

			// 품번 조건
			if (itemcode && !itemcodeText.includes(itemcode)) {
				visible = false;
			}

			// 품명 조건
			if (itemname && !itemnameText.includes(itemname)) {
				visible = false;
			}

			$tr.toggle(visible);
		});

		// 필터링 결과 기준으로 합계/건수 갱신
		updateStockCountWIPListSummary();
	}

	// CLEAR 버튼 누르면 테이블 삭제 및 건수/수량 초기화
	function resetStockCountWIPListSearch() {
		$("#stockCountWIPListDetailTableBody").html('');

		$(".stockCountWIPListTotalQty").text('0');
		$('#stockCountWIPListTotalCount').text('0');
		console.log('Search conditions have been reset.');

	}

	function productStockcountWIPListExcelForm() {
		window.location.href = "/stockCountExcelFormDownload";
	}
	// 수량을 0으로 초기화
	function updateTotalQty() {
		//$(".stockCountWIPListTotalQty").text('0');
	}

	// 화면에 입력된 수량을 filteredData에 반영
	function syncQtyFromTableToData() {
		$('#stockCountWIPListDetailTableBody tr').each(function() {
			const itemcode = $(this).find('.itemcodeVal').text().trim();
			const qtyStr = $(this).find('.qtyInputVal input').val().trim();

			if (!itemcode) return;

			const row = filteredData.find(r =>
				(r.ITEMCODE || r.itemcode || '').toString().trim() === itemcode
			);

			if (row) {
				row.inputQty = qtyStr;   // 새로운 속성에 저장 (이름은 마음대로)
			}
		});
	}

	// 건수/수량 업데이트
	function updateStockCountWIPListSummary() {
		let totalQty = 0;
		let rowCount = 0;

		$("#stockCountWIPListDetailTableBody tr:visible").each(function() {
			rowCount++;

			let v = $(this).find(".qtyInputVal input").val() || "";
			v = v.replace(/,/g, "").trim();   // 콤마 제거

			if (v !== "") {
				const num = parseFloat(v);
				if (!isNaN(num)) {
					totalQty += num;
				}
			}
		});

		// 수량 합계
		$(".stockCountWIPListTotalQty").text(totalQty.toLocaleString());

		// 행 개수
		$("#stockCountWIPListTotalCount").text(rowCount.toLocaleString());
	}


	// 엑셀 업로드 함수
	function excelFileUpload(file) {
		//console.log(file);

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
					return;
				}

				// 헤더 정렬을 위해서 값 추가
				let excelData = res.data || [];
				filteredData = [...excelData];
			    $(".btnIntfStockCountWIPList").prop("disabled", true);
				renderExcelUploadStockCountWIPListTableData(res.data);

				hideLoading();
			},
			error: function(err) {
				console.log(err);
				hideLoading();
			}
		});
	}

	// 테이블에서 값 가져오기
	function getStockCountWIPList() {
		var list = [];

		$('#stockCountWIPListDetailTableBody').find('tr').each(function() {
			var tr = $(this);

			var itemcode = tr.find('td.itemcodeVal').text();
			var qtyStr = tr.find('td.qtyInputVal input').val() || '';

			if (!qtyStr || qtyStr.trim() === '') return;					// 값이 공백이면 제외 
			var qty = qtyStr ? Number(qtyStr.replace(/,/g, '')) : 0;

			list.push({
				itemcode: itemcode,
				qty: qty
			});
		});

		return list;
	}


	// 재공재고실사 저장
	function saveStockCountWIPList() {
		const dataList = getStockCountWIPList();
		const workshop = $('#stockCountWIPListWorkshop_production').val();
		const factory = getCookie('selectedFactory');
		const loginid = getCookie("userLoginId");
		const date = $("#stockCountWIPListDate").val();
		console.log(dataList);

		if (dataList.length === 0) {
			alert("No data available.");
			return;
		}

		showLoading("data");
		if (confirm(`Do you want to save ${dataList.length} items to ${workshop}?`)) {
			$.ajax({
				url: `/insertStockCountWIPList`,
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
					hideLoading();
				},
				error: function(err) {
					console.log(err);
					hideLoading();
				}
			});
		} else {
			return;
		}
	}
	//	window.exportStockCountWIPListData = function() {
	//		return {
	//			total: filteredData.length,
	//			currentPage: currentStockCountWIPListPage,
	//			itemsPerPage: stockCountWIPListItemsPerPage,
	//			data: filteredData
	//		};
	//	}
});

// 인터페이스 등록
$(document).on("click", ".btnIntfStockCountWIPList", function() {

	const iidList = [];
	$(".stockCountWIPList").each(function() {
		let iid = $(this).data('unique');
		iidList.push(iid);
	});
	
	// 체크된 요소가 없으면 경고창 표시 후 리턴
	if (iidList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.interface.progress'))) {
		return;
	}

	showLoading("data");

	console.log(iidList)
	$.ajax({
		url: "/stockCountPurWIPListIntf",
		type: "POST",
		data: JSON.stringify(iidList),
		contentType: "application/json",
		success: function(data) {
			//performStockCountWIPRealstockListDBSearch();
			alert(i18n.t('message.interface.completed'));
			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("요청 실패");
			console.error("Status:", status);       // 예: "error"
			console.error("Error:", error);         // 예: 서버 응답 메시지
			console.error("Response:", xhr.responseText); // 서버 응답 본문
			alert("오류가 발생했습니다: " + error);
			hideLoading();
		}
	});

});

// 전체 데이터 엑셀 다운로드
window.downloadAllStockCountWIPListData = function() {
	let searchCriteria = getCurrentSearchCriteria();

	showLoading("export");

	$.ajax({
		url: "/read_stockCountWIPList",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log(response);

			ExcelExporter.downloadExcel(filteredData, window.stockCountWIPListColumns, {
				fileName: 'stockCountWIPList_All',
				sheetName: 'stockCountWIPList'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};*/
