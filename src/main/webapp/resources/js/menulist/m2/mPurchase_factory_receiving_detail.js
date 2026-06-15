/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_factoryReceivingDetail = [];
let globalFactoryReceivingDetailData = [];
let currentFactoryReceivingDetailPage = 1;
let factoryReceivingDetailItemsPerPage = 100;
let totalFactoryReceivingDetailCount = 0;
let totalFactoryReceivingDetailPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

let menuType = null;
let saveStorageForInit = null;
let pendingFactoryReceivingDetailInit = false;

$(document).ready(function() {
	window.filteredFactoryReceivingDetailData = [];
	window.factoryReceivingDetailColumns = [
		{ key: 'SDATE', header: 'sdate' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'lot' }
	];

	// 👉 실제 조회를 담당하는 내부 함수
	function initFactoryReceivingDetailSearch() {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');

		let storage = '';
		if (menuType === "purchase") {
			storage = 'Material';
		} else if (menuType === "fabric") {
			storage ='Fabric';
		} else if (menuType === "sales") {
			storage = 'P1 W/HOUSE';
		}
		
		performFactoryReceivingDetailDBSearch({ fromDate, toDate, factory, storage });
	}

	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_factory_receiving_detail = function(menuId) {
		// 👉 “이 메뉴는 열렸다” 표시만 먼저 해 둠
		pendingFactoryReceivingDetailInit = true;

		// 아직 menuType이 없으면 바로 나가고, 아래 이벤트에서 다시 불러줌
		if (!menuType) {
			console.log('menuType 없음 → menuTypeChanged 올 때까지 대기');
			return;
		}

		// menuType 이미 있으면 바로 실행
		initFactoryReceivingDetailSearch();
	};

	// ✅ 메뉴 타입 이벤트 리스너
	document.addEventListener('menuTypeChanged', function(e) {
		menuType = e.detail.menuType;

		// 👉 메뉴는 이미 열렸고(menu 클릭됨), menuType만 늦게 왔을 때
		if (pendingFactoryReceivingDetailInit) {
			console.log('menuType 세팅 완료 → 대기 중이던 초기 조회 실행');
			pendingFactoryReceivingDetailInit = false;
			initFactoryReceivingDetailSearch();
		}
	});

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performFactoryReceivingDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_factoryReceivingDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria
			}),
			contentType: "application/json",
			success: function(response) {
				console.log("-- DB 조회 결과 (전체) --");
				console.log(response);

				// 서버에서 받은 전체 데이터 저장
				allServerData = response.records || [];
				filteredData_factoryReceivingDetail = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentFactoryReceivingDetailPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_factory_receiving_detail').length) {
					renderFactoryReceivingDetailView();
				} else {
					renderFactoryReceivingDetailTableData();
					renderFactoryReceivingDetailPagination();
					updateFactoryReceivingDetailTotalCount();
				}

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
		factoryReceivingDetailItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalFactoryReceivingDetailCount = filteredData_factoryReceivingDetail.length;
		totalFactoryReceivingDetailPages = Math.ceil(totalFactoryReceivingDetailCount / factoryReceivingDetailItemsPerPage);

		const startIndex = (currentFactoryReceivingDetailPage - 1) * factoryReceivingDetailItemsPerPage;
		const endIndex = startIndex + factoryReceivingDetailItemsPerPage;

		globalFactoryReceivingDetailData = filteredData_factoryReceivingDetail.slice(startIndex, endIndex);
		window.filteredFactoryReceivingDetailData = globalFactoryReceivingDetailData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_factoryReceivingDetail.sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

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

		currentFactoryReceivingDetailPage = 1;
		applyClientPagination();

		renderFactoryReceivingDetailTableData();
		renderFactoryReceivingDetailPagination();
		updateFactoryReceivingDetailTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderFactoryReceivingDetailView() {
		let loginid = $(".loginId").text().trim().toLowerCase();

		let btnHtml = "";
		if (loginid == "wms") {
			btnHtml = `
	            <input type="button" value="관리자용 삭제" class="btn btn-danger btnAdminFactoryReceivingDetailDelete"/>
	        `;
		}

		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_factory_receiving_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="factoryReceivingDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="factoryReceivingDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="factoryReceivingDetail_searchVal_factory" class="factory-select">
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="factoryReceivingDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="factoryReceivingDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="factoryReceivingDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="factoryReceivingDetail_searchVal_itemname" />
							</div>	
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnFactoryReceivingDetailSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnFactoryReceivingDetailSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="factoryReceivingDetailTotalCount">${totalFactoryReceivingDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="factoryReceivingDetailCurrentPageInfo">${currentFactoryReceivingDetailPage}</strong>/<strong id="factoryReceivingDetailTotalPageInfo">${totalFactoryReceivingDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="factoryReceivingDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_factory_receiving_detail">
								<div id="defaultActions" class="action-group">
									${btnHtml}
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnFactoryReceivingDetailDelete"/>
									<button class="btn btn-success" id="factoryReceivingDetailExcelBtn" onclick="downloadAllFactoryReceivingDetailData()">Excel</button>
								</div>
							</div>
							<div class="btnInterfaceCommon btnFactoryReceivingItemsArea" style="margin-left:24px;">
								<!-- <input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfFactoryReceiving"/> -->
								<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfFactoryReceivingDetailDelete"/>
							</div>
						</div>
						<table class="data-table mPurchase_factory_receiving_detail" id="factoryReceivingDetailTable">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="factoryReceivingDetail_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "statusVal" data-sort="INTF_YN">${i18n.t('table.status')}<!-- STATUS --> </th>
									<th class = "dateVal" data-sort="OUTDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "factoryVal" data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal" data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameLongVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "loginidVal" data-sort="LOGINID">${i18n.t('search.user')}<!-- USER --></th>
									<th class = "hhmmVal" data-sort="HHMM">${i18n.t('table.time')}<!-- TIME --></th>
									<th class = "barcodeVal" data-sort="BARCODE">${i18n.t('search.barcode')}<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="factoryReceivingDetailDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="factoryReceivingDetailPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="factoryReceivingDetail_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="factoryReceivingDetail_itemsPerPage" class="items-per-page-select">
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
		const { fromDate, toDate } = getDefaultDateRange();
		$("#factoryReceivingDetail_searchVal_fromDate").val(fromDate);
		$("#factoryReceivingDetail_searchVal_toDate").val(toDate);
		$("#factoryReceivingDetail_itemsPerPage").val(factoryReceivingDetailItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderFactoryReceivingDetailTableData();
		// 페이지네이션 렌더링
		renderFactoryReceivingDetailPagination();
		// 이벤트 바인딩
		bindFactoryReceivingDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateFactoryReceivingDetailTotalCount();
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
	    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const fromDate = fmtLocalDate(firstDayOfMonth);
		return { fromDate, toDate };
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const factory = $('#factoryReceivingDetail_searchVal_factory');
		const storage = $('#factoryReceivingDetail_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		// 공장별 창고 옵션 설정
		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'SALTILLO': ['all', 'Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'P1 W/HOUSE'],
				'PUEBLA': ['all', 'Material', 'PRODUCT'],
				'': ['all', 'Material', 'Fabric', 'Side seat', 'Outside', 'AUNDE', 'PRODUCT', 'P1 W/HOUSE']
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			if (menuType === "purchase") {
				saveStorageForInit = "Material";
				storage.val('Material');
			} else if (menuType === "fabric") {
				saveStorageForInit = "Fabric";
				storage.val('Fabric');
			} else if (menuType === "sales") {
				saveStorageForInit = "P1 W/HOUSE";
				storage.val('P1 W/HOUSE');
			}
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

	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function updateFactoryReceivingDetailTotalCount() {
		$(".factoryReceivingDetailTotalQty").text(Number(totalQty).toLocaleString());
		$('#factoryReceivingDetailTotalCount').text(Number(totalFactoryReceivingDetailCount).toLocaleString());
		$('#factoryReceivingDetailCurrentPageInfo').text(currentFactoryReceivingDetailPage);
		$('#factoryReceivingDetailTotalPageInfo').text(totalFactoryReceivingDetailPages);
	}

	function renderFactoryReceivingDetailTableData() {
		let tableBody = "";

		for (let i = 0; i < globalFactoryReceivingDetailData.length; i++) {
			let rowNumber = (currentFactoryReceivingDetailPage - 1) * factoryReceivingDetailItemsPerPage + i + 1;
			let data = globalFactoryReceivingDetailData[i];

			let statusText = data.INTF_YN === 'Y' ? i18n.t('search.input.completed') : i18n.t('search.input.waiting');
			let statusClass = data.INTF_YN === 'Y' ? 'status-completed' : 'status-waiting';
			
			tableBody += `
				<tr>
		            <td class = "checkboxVal"><input type="checkbox" class="factoryReceivingDetail_chk ${statusClass}" 
		            	data-unique="${data.SDATE}_${data.ITEMCODE}_${data.INTF_YN}_${data.QTY}_${data.FACTORY}_${data.STORAGE}_${data.BARCODE}_${data.SOURCE}"
		    			data-delete="${data.IID}_${data.SDATE}_${data.FACTORY}_${data.STORAGE}_${data.BARCODE}">
		    		</td>
				    <td class = "noVal">${rowNumber}</td>
					<td class = "statusVal"><span class="${statusClass}">${statusText}</span></td>
		            <td class = "dateVal">${data.SDATE || data.sdate || ''}</td>
					<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
					<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "loginidVal">${data.LOGINID || data.loginid || ''}</td><!-- LOGINID -->
					<td class = "hhmmVal">${data.HHMM || data.hhmm || ''}</td><!-- HHMM -->
					<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td><!-- LOT -->
		        </tr>
			`;
		}

		$("#factoryReceivingDetailDetailTableBody").html(tableBody);
		$(".factoryReceivingDetail_chkAll").prop("checked", false);
	}

	function renderFactoryReceivingDetailPagination() {
		let paginationHtml = "";

		if (currentFactoryReceivingDetailPage > 1) {
			paginationHtml += `<button class="factoryReceivingDetail-page-btn" data-page="${currentFactoryReceivingDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryReceivingDetail-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentFactoryReceivingDetailPage - 5);
		let endPage = Math.min(totalFactoryReceivingDetailPages, currentFactoryReceivingDetailPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="factoryReceivingDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentFactoryReceivingDetailPage) {
				paginationHtml += `<button class="factoryReceivingDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryReceivingDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalFactoryReceivingDetailPages) {
			if (endPage < totalFactoryReceivingDetailPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryReceivingDetail-page-btn" data-page="${totalFactoryReceivingDetailPages}">${totalFactoryReceivingDetailPages}</button>`;
		}

		if (currentFactoryReceivingDetailPage < totalFactoryReceivingDetailPages) {
			paginationHtml += `<button class="factoryReceivingDetail-page-btn" data-page="${currentFactoryReceivingDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryReceivingDetail-page-btn disabled">&gt;</button>`;
		}

		$("#factoryReceivingDetailPaginationContainer").html(paginationHtml);
	}

	function bindFactoryReceivingDetailEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.factoryReceivingDetail_chkAll').on('change', '.factoryReceivingDetail_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.factoryReceivingDetail_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.factoryReceivingDetail_chk').on('change', '.factoryReceivingDetail_chk', function() {
			let totalCheckboxes = $('.factoryReceivingDetail_chk').length;
			let checkedCheckboxes = $('.factoryReceivingDetail_chk:checked').length;
			$('.factoryReceivingDetail_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnFactoryReceivingDetailSearch").off('click').on('click', function() {
			performFactoryReceivingDetailSearch();
		});

		$(".btnFactoryReceivingDetailSearchInit").off('click').on('click', function() {
			resetFactoryReceivingDetailSearch();
		});

		$('#factoryReceivingDetail_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeFactoryReceivingDetailItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.factoryReceivingDetail-page-btn').on('click', '.factoryReceivingDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentFactoryReceivingDetailPage = page;
					applyClientPagination();
					renderFactoryReceivingDetailTableData();
					renderFactoryReceivingDetailPagination();
					updateFactoryReceivingDetailTotalCount();
				}
			}
		});

		$('#factoryReceivingDetailTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_factory_receiving_detail input[type="text"], #view_mPurchase_factory_receiving_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performFactoryReceivingDetailSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#factoryReceivingDetail_searchVal_fromDate").val(),
			toDate: $("#factoryReceivingDetail_searchVal_toDate").val(),
			factory: $("#factoryReceivingDetail_searchVal_factory").val(),
			storage: $("#factoryReceivingDetail_searchVal_storage").val(),
			car: $("#factoryReceivingDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#factoryReceivingDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#factoryReceivingDetail_searchVal_itemname").val().trim().toUpperCase()
		};
	}

	function performFactoryReceivingDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentFactoryReceivingDetailPage = 1;
		performFactoryReceivingDetailDBSearch(searchCriteria);
	}

	function resetFactoryReceivingDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		
		$("#factoryReceivingDetail_searchVal_fromDate").val(fromDate);
		$("#factoryReceivingDetail_searchVal_toDate").val(toDate);
		$("#factoryReceivingDetail_searchVal_car").val('');
		$("#factoryReceivingDetail_searchVal_itemcode").val('');
		$("#factoryReceivingDetail_searchVal_itemname").val('');
		
		renderFactoryStorage();
		const factory = getCookie('selectedFactory');

		let storage = '';
		if (menuType === "purchase") {
			storage = 'Material';
		} else if (menuType === "fabric") {
			storage ='Fabric';
		} else if (menuType === "sales") {
			storage = 'P1 W/HOUSE';
		}

		currentFactoryReceivingDetailPage = 1;
		performFactoryReceivingDetailDBSearch({ fromDate, toDate, factory, storage });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeFactoryReceivingDetailItemsPerPage = function(newItemsPerPage) {
		factoryReceivingDetailItemsPerPage = newItemsPerPage;
		currentFactoryReceivingDetailPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderFactoryReceivingDetailTableData();
		renderFactoryReceivingDetailPagination();
		updateFactoryReceivingDetailTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportFactoryReceivingDetailData = function() {
		return {
			total: filteredData_factoryReceivingDetail.length,
			currentPage: currentFactoryReceivingDetailPage,
			itemsPerPage: factoryReceivingDetailItemsPerPage,
			data: filteredData_factoryReceivingDetail
		};
	}

	//데이터 삭제
	$(document).on("click", ".btnFactoryReceivingDetailDelete", function() {

		const iidList = [];
		const uniqueList = [];
		$(".factoryReceivingDetail_chk:checked").each(function() {
			let iid = $(this).data('delete');
			iidList.push(iid);
		});

		$(".factoryReceivingDetail_chk:checked").each(function() {
			let unique = $(this).data('unique');
			const row = unique.split("_");
			uniqueList.push(row[8]);
		});

		// 인퍼테이스 사용 시 주석 해제
		if ($(".status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items.delete'));
			// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
			return;
		}
		
		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		if (!confirm(i18n.t('confirmation.items.delete'))) {
			return;
		}

		showLoading("data");
		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
		console.log(iidList)
		$.ajax({
			url: "/deleteFactoryReceiving",
			type: "POST",
			data: JSON.stringify({
				loginid: loginid,
				iidList:iidList}),
			contentType: "application/json",
			success: function(data) {
				if (!data.success) {
					hideLoading();

					let message = "";

					// 검증 실패
					if (data.failList && data.failList.length > 0) {
						message = "Some items cannot be deleted\n\n"; // 삭제할 수 없는 항목이 있습니다.

						data.failList.forEach(function(item) {
							if (item.failReason === 'INVALID_KIND') {
								alert(`Code Error!`);
								return;
							} else if (item.failReason === 'POST_PROCESSING') {
								message += `- Post-processing data exists\n${item.barcode}\n`; // 후처리 데이터 존재
							} else if (item.failReason === 'MAGAM') {
								message += `- Monthly closing completed\n${item.barcode}\n`; // 월 마감 완료
							}
						});

					}
					// 삭제 실패
					else if (data.failReason === 'DELETE_FAILED') {
						message = "Failed to delete\n\n";
						message += `Operation: ${data.failedOperation}\n`;
						message += `Barcode: ${data.failedBarcode}\n\n`;
					}

					alert(message);
					return;
				}

				let searchVal = getCurrentSearchCriteria();
				performFactoryReceivingDetailDBSearch(searchVal);

				// 전체 선택 해제
				$('.factoryReceivingDetail_chkAll').prop('checked', false);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});
	});


	// 관리자용 삭제
	$(document).on("click", ".btnAdminFactoryReceivingDetailDelete", function() {

		const iidList = [];
		$(".factoryReceivingDetail_chk:checked").each(function() {
			let iid = $(this).data('delete');
			iidList.push(iid);
		});

		// 인퍼테이스 사용 시 주석 해제
		if ($(".status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items.delete'));
			// 확정된 항목이 있습니다. 인퍼테이스 삭제 후 항목을 삭제할 수 있습니다.
			return;
		}

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		if (!confirm(i18n.t('confirmation.items.delete'))) {
			return;
		}

		const reason = prompt("사유를 입력해 주세요");

		if (reason === null) return;

		if (reason.trim() === "") {
			alert("내용이 비어 있습니다.");
			return;
		}

		showLoading("data");

		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");

		console.log(iidList)
		$.ajax({
			url: "/deleteFactoryReceiving",
			type: "POST",
			data: JSON.stringify({
				iidList: iidList,
				loginid: loginid,
				reason: reason,
				admin: true
			}),
			contentType: "application/json",
			success: function(data) {
				hideLoading();
				if (data.success) {
					alert("삭제 완료");

					let searchVal = getCurrentSearchCriteria();
					performFactoryReceivingDetailDBSearch(searchVal);

					// 전체 선택 해제
					$('.factoryReceivingDetail_chkAll').prop('checked', false);
				} else {
					alert("삭제에 실패했습니다.");
				}
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

	//인터페이스 등록
	$(document).on("click", ".btnIntfFactoryReceivingDetail", function() {

		if ($(".factoryReceivingDetail_chk.status-completed:checked").length > 0) {
			alert(i18n.t('validation.confirm.items'));
			return;
		}

		const iidList = [];
		$(".factoryReceivingDetail_chk:checked").each(function() {
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
			url: "/factoryReceiving_confirm_summary",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performFactoryReceivingDetailDBSearch(searchVal);
			},
			error: function(xhr, status, error) {
				console.error("요청 실패");
				console.error("Status:", status);       // 예: "error"
				console.error("Error:", error);         // 예: 서버 응답 메시지
				console.error("Response:", xhr.responseText); // 서버 응답 본문
				alert("오류가 발생했습니다: " + error);
			}
		});

	});

	//인터페이스 등록 취소
	$(document).on("click", ".btnIntfFactoryReceivingDetailDelete", function() {

		if ($(".factoryReceivingDetail_chk.status-waiting:checked").length > 0) {
			alert(i18n.t('validation.unconfirm.items'));
			return;
		}

		const iidList = [];
		$(".factoryReceivingDetail_chk:checked").each(function() {
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
			url: "/factoryReceiving_confirm_summary_cancel",
			type: "POST",
			data: JSON.stringify(iidList),
			contentType: "application/json",
			success: function(data) {
				let searchVal = getCurrentSearchCriteria();
				performFactoryReceivingDetailDBSearch(searchVal);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}

		});

	});

});

// 전체 데이터 엑셀 다운로드
window.downloadAllFactoryReceivingDetailData = function() {
	showLoading("export");

	const processedData = filteredData_factoryReceivingDetail.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.factoryReceivingDetailColumns, {
		fileName: 'factoryReceivingDetail_All',
		sheetName: 'factoryReceivingDetail'
	});

	hideLoading();
};
