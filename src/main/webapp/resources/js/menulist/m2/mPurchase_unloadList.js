/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_unloadList = [];
let globalUnloadListData = [];
let currentUnloadListPage = 1;
let unloadListItemsPerPage = 100;
let totalUnloadListCount = 0;
let totalUnloadListPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

let menuType = null;
let saveStorageForInit = null;
let pendingUnloadListInit = false;

$(document).ready(function() {
	window.filteredUnloadListData = [];
	window.unloadListColumns = [
		{ key: 'BARCODE', header: 'Barcode' },
		{ key: 'SDATE', header: 'Date' },
		{ key: 'FACTORY', header: 'Factory' },
		{ key: 'STORAGE', header: 'Storage' },
		{ key: 'CAR', header: 'Car' },
		{ key: 'ITEMCODE', header: 'Itemcode' },
		{ key: 'ITEMNAME', header: 'Itemname' },
		{ key: 'QTY', header: 'Qty' },
		{ key: 'OLDLOCATION', header: 'Old Location' },
		{ key: 'SOURCE', header: 'Source' },
		{ key: 'RACK', header: 'Rack' }
	];


	// 메인 호출 함수 - 메뉴 클릭 시 호출
	window.call_mPurchase_unloadList = function(menuId) {
		showLoading("data");

		const factory = getCookie('selectedFactory');
		
		performUnloadListDBSearch({ factory });
	};

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performUnloadListDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_unloadList",
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
				filteredData_unloadList = [...allServerData];
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentUnloadListPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_unloadList').length) {
					renderUnloadListView();
				} else {
					renderUnloadListTableData();
					renderUnloadListPagination();
					updateUnloadListTotalCount();
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
		unloadListItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalUnloadListCount = filteredData_unloadList.length;
		totalUnloadListPages = Math.ceil(totalUnloadListCount / unloadListItemsPerPage);

		const startIndex = (currentUnloadListPage - 1) * unloadListItemsPerPage;
		const endIndex = startIndex + unloadListItemsPerPage;

		globalUnloadListData = filteredData_unloadList.slice(startIndex, endIndex);
		window.filteredUnloadListData = globalUnloadListData;
	}

	// 클라이언트에서 정렬 처리
	function applyClientSort(column, dataType) {
		if (currentSortColumn === column) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortColumn = column;
			currentSortOrder = 'asc';
		}

		filteredData_unloadList.sort((a, b) => {
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

		currentUnloadListPage = 1;
		applyClientPagination();

		renderUnloadListTableData();
		renderUnloadListPagination();
		updateUnloadListTotalCount();

		updateSortIndicators(column);

	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderUnloadListView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_unloadList">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="unloadList_searchVal_factory" class="factory-select">
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="unloadList_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="unloadList_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="unloadList_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="unloadList_searchVal_itemname" />
							</div>	
							<div class="search-label">
								<div class="searchVal_source">${i18n.t('search.type')}<!-- SOURCE --></div>
								<input type="text" id="unloadList_searchVal_source" />
							</div>
							<div class="search-label">
								<div class="searchVal_rack">RACK<!-- RACK --></div>
								<input type="text" id="unloadList_searchVal_rack" />
							</div>
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnUnloadListSearch">${i18n.t('btn.search')}</button>
							<button class="btn btn-secondary btnUnloadListSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="unloadListTotalCount">${totalUnloadListCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="unloadListCurrentPageInfo">${currentUnloadListPage}</strong>/<strong id="unloadListTotalPageInfo">${totalUnloadListPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="unloadListTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_unloadList">
								<div id="defaultActions" class="action-group">
									<input type="button" value="${i18n.t('btn.exceptionOut')}" class="btn btn-success btnExceptionOut_unloadList"/>
									<button class="btn btn-success" id="unloadListExcelBtn" onclick="downloadAllUnloadListData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_unloadList" id="unloadListTable">
							<thead>
								<tr>
									<th class = "checkboxVal">
										<input type="checkbox" class="unloadList_chkAll">
									</th>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "barcodeVal" data-sort="BARCODE">${i18n.t('search.barcode')}<!-- BARTCODE --></th>
									<th class = "dateVal" data-sort="SDATE">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "factoryVal" data-sort="FACTORY">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal" data-sort="STORAGE">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameLongVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "locationVal" data-sort="OLDLOCATION">OLD LOCATION<!-- OLD LOCATION --></th>
									<th class = "locationVal" data-sort="SOURCE">${i18n.t('search.type')}<!-- SOURCE --></th>
									<th class = "noVal" data-sort="RACK">${i18n.t('search.rack')}<!-- RACK --></th>
								</tr>
							</thead>
							<tbody id="unloadListDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="unloadListPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="unloadList_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="unloadList_itemsPerPage" class="items-per-page-select">
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

		$("#unloadList_itemsPerPage").val(unloadListItemsPerPage);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderUnloadListTableData();
		// 페이지네이션 렌더링
		renderUnloadListPagination();
		// 이벤트 바인딩
		bindUnloadListEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateUnloadListTotalCount();
	}
	
	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const factory = $('#unloadList_searchVal_factory');
		const storage = $('#unloadList_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		// 공장별 창고 옵션 설정
		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'WBTA': ['MATERIAL', 'PRODUCT', 'all']
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			// 첫 번째 옵션 선택 (all)
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

	function setCookie(cookieName, value, days = 365) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + date.toUTCString();
		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function updateUnloadListTotalCount() {
		$(".unloadListTotalQty").text(Number(totalQty).toLocaleString());
		$('#unloadListTotalCount').text(Number(totalUnloadListCount).toLocaleString());
		$('#unloadListCurrentPageInfo').text(currentUnloadListPage);
		$('#unloadListTotalPageInfo').text(totalUnloadListPages);
	}

	function renderUnloadListTableData() {
		let tableBody = "";

		for (let i = 0; i < globalUnloadListData.length; i++) {
			let rowNumber = (currentUnloadListPage - 1) * unloadListItemsPerPage + i + 1;
			let data = globalUnloadListData[i];
			
			tableBody += `
				<tr>
		            <td class = "checkboxVal"><input type="checkbox" class="unloadList_chk" 
            			data-unique="${data.BARCODE}_${data.SDATE}_${data.FACTORY}_${data.STORAGE}_${data.QTY}_${data.SOURCE}"></td>
                	<td class = "noVal">${rowNumber}</td>
					<td class = "barcodeVal">${data.BARCODE || data.barcode || ''}</td>
		            <td class = "dateVal">${data.SDATE || data.SDATE || ''}</td>
					<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
					<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
					<td class = "carVal">${data.CAR || data.car || ''}</td>
					<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
					<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
					<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
					<td class = "locationVal">${data.OLDLOCATION || data.oldlocation || ''}</td>
					<td class = "locationVal">${data.SOURCE || data.source || ''}</td>
					<td class = "noVal">${data.RACK || data.rack || ''}</td>
		        </tr>
			`;
		}

		$("#unloadListDetailTableBody").html(tableBody);
		$(".unloadList_chkAll").prop("checked", false);
	}

	function renderUnloadListPagination() {
		let paginationHtml = "";

		if (currentUnloadListPage > 1) {
			paginationHtml += `<button class="unloadList-page-btn" data-page="${currentUnloadListPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="unloadList-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentUnloadListPage - 5);
		let endPage = Math.min(totalUnloadListPages, currentUnloadListPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="unloadList-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentUnloadListPage) {
				paginationHtml += `<button class="unloadList-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="unloadList-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalUnloadListPages) {
			if (endPage < totalUnloadListPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="unloadList-page-btn" data-page="${totalUnloadListPages}">${totalUnloadListPages}</button>`;
		}

		if (currentUnloadListPage < totalUnloadListPages) {
			paginationHtml += `<button class="unloadList-page-btn" data-page="${currentUnloadListPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="unloadList-page-btn disabled">&gt;</button>`;
		}

		$("#unloadListPaginationContainer").html(paginationHtml);
	}

	function bindUnloadListEvents() {
		// 전체 선택 체크박스
		$(document).off('change', '.unloadList_chkAll').on('change', '.unloadList_chkAll', function() {
			let isChecked = $(this).is(':checked');
			$('.unloadList_chk').prop('checked', isChecked);
		});

		// 개별 체크박스
		$(document).off('change', '.unloadList_chk').on('change', '.unloadList_chk', function() {
			let totalCheckboxes = $('.unloadList_chk').length;
			let checkedCheckboxes = $('.unloadList_chk:checked').length;
			$('.unloadList_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
		});

		$(".btnUnloadListSearch").off('click').on('click', function() {
			performUnloadListSearch();
		});

		$(".btnUnloadListSearchInit").off('click').on('click', function() {
			resetUnloadListSearch();
		});

		$('#unloadList_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeUnloadListItemsPerPage(newItemsPerPage);
		});

		$(document).off('click', '.unloadList-page-btn').on('click', '.unloadList-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentUnloadListPage = page;
					applyClientPagination();
					renderUnloadListTableData();
					renderUnloadListPagination();
					updateUnloadListTotalCount();
				}
			}
		});

		$('#unloadListTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		$('#view_mPurchase_unloadList input[type="text"], #view_mPurchase_unloadList input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performUnloadListSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			factory: $("#unloadList_searchVal_factory").val(),
			storage: $("#unloadList_searchVal_storage").val(),
			car: $("#unloadList_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#unloadList_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#unloadList_searchVal_itemname").val().trim().toUpperCase(),
			source: $("#unloadList_searchVal_source").val().trim().toUpperCase(),
			rack: $("#unloadList_searchVal_rack").val().trim().toUpperCase()
		};
	}

	function performUnloadListSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentUnloadListPage = 1;
		performUnloadListDBSearch(searchCriteria);
	}

	function resetUnloadListSearch() {
		renderFactoryStorage();
		
		$("#unloadList_searchVal_car").val('');
		$("#unloadList_searchVal_itemcode").val('');
		$("#unloadList_searchVal_itemname").val('');
		$("#unloadList_searchVal_source").val('');
		$("#unloadList_searchVal_rack").val('');
		
		const factory = getCookie('selectedFactory');

		currentUnloadListPage = 1;
		performUnloadListDBSearch({ factory });

		console.log('검색 조건이 초기화되었습니다.');
	}

	window.changeUnloadListItemsPerPage = function(newItemsPerPage) {
		unloadListItemsPerPage = newItemsPerPage;
		currentUnloadListPage = 1;

		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderUnloadListTableData();
		renderUnloadListPagination();
		updateUnloadListTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportUnloadListData = function() {
		return {
			total: filteredData_unloadList.length,
			currentPage: currentUnloadListPage,
			itemsPerPage: unloadListItemsPerPage,
			data: filteredData_unloadList
		};
	}

	$(document).on("click", ".btnExceptionOut_unloadList", function() {
		const loginid = sessionStorage.getItem('userId') || 'Name Not Found';//getCookie("userLoginId");
		const sabun = getCookie("sabun");

		const iidList = [];
		$(".unloadList_chk:checked").each(function() {
			let iid = $(this).data('unique');
			iidList.push(iid);
		});

		// 체크된 요소가 없으면 경고창 표시 후 리턴
		if (iidList.length === 0) {
			alert(i18n.t('validation.no.select.items'));
			return;
		}

		console.log(iidList)
		console.log(sabun);
		if (confirm("Do you want to proceed with an exception load?")) {
			showLoading("data");
			$.ajax({
				url: `/insertExcpetionOutput`,
				type: "POST",
				data: JSON.stringify({
					loginid: loginid,
					sabun: sabun,
					list: iidList,
					memo: "LOADEXCEPTION-UNLOAD"
				}),
				contentType: "application/json",
				success: function(data) {
					//				loadUnloadedPage(1);
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performUnloadListDBSearch(searchCriteria);
					hideLoading();
				},
				error: function(xhr, status, error) {
					// ❌ alert(res.message) <- res 없음 (버그)
					window.handleAjaxError(xhr, status, error);
				}

			});
		} else {
			hideLoading();
		}

	});
});

// 전체 데이터 엑셀 다운로드
window.downloadAllUnloadListData = function() {
	showLoading("export");

	const processedData = filteredData_unloadList.map(item => {
		return {
			...item
		};
	});

	ExcelExporter.downloadExcel(processedData, window.unloadListColumns, {
		fileName: 'unloadList_All',
		sheetName: 'unloadList'
	});

	hideLoading();
};
