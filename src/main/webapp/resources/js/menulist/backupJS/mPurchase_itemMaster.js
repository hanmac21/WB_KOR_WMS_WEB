/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

/*let allServerData = [];
let filteredData = [];
let globalItemMasterData = [];
let currentItemMasterPage = 1;
let itemMasterItemsPerPage = 100;
let totalItemMasterCount = 0;
let totalItemMasterPages = 0;
let totalQty = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';
$(document).ready(function() {

	window.filteredItemMasterData = [];
	window.itemMasterColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' },
		{ key: 'BARCODE', header: 'barcode' }
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_itemMaster = function(menuId) {
		showLoading("data");

		const factory = getCookie('selectedFactory');
		const { fromDate, toDate } = getDefaultDateRange();
		let storage = 'Material';

		performItemMasterDBSearch({ factory, storage, toDate, fromDate });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performItemMasterDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_itemMaster",
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

				// 페이지 초기화
				currentItemMasterPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_itemMaster').length) {
					renderItemMasterView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderItemMasterTableData();
					renderItemMasterPagination();
					updateItemMasterTotalCount();
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
		itemMasterItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalItemMasterCount = filteredData.length;
		totalItemMasterPages = Math.ceil(totalItemMasterCount / itemMasterItemsPerPage);

		// 현재 페이지 범위 계산
		const startIndex = (currentItemMasterPage - 1) * itemMasterItemsPerPage;
		const endIndex = startIndex + itemMasterItemsPerPage;

		// 현재 페이지 데이터 추출
		globalItemMasterData = filteredData.slice(startIndex, endIndex);
		window.filteredItemMasterData = globalItemMasterData;
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
		currentItemMasterPage = 1;
		applyClientPagination();

		// 테이블 업데이트
		renderItemMasterTableData();
		renderItemMasterPagination();
		updateItemMasterTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderItemMasterView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_itemMaster">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_itemType">${i18n.t('search.itemType')}</div>
								<input type="text" id="itemMaster_searchVal_itemType" />
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}</div>
								<input type="text" id="itemMaster_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="search_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="itemMaster_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="search_itemname">${i18n.t('search.itemName')}</div>
								<input type="text" id="itemMaster_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="search_spec">${i18n.t('search.spec')}</div>
								<input type="text" id="itemMaster_searchVal_spec" />
							</div>
							<div class="search-label">
								<div class="search_oitemCode">OITEMCODE</div>
								<input type="text" id="itemMaster_searchVal_oitemCode" />
							</div>
							<div class="search-label">
								<div class="search_oitemName">OITEMNAME</div>
								<input type="text" id="itemMaster_searchVal_oitemName" />
							</div>
							<div class="search-label">
								<div class="search_spec2">${i18n.t('search.spec2')}</div>
								<input type="text" id="itemMaster_searchVal_spec2" />
							</div>
							<div class="search-label">
								<div class="search_labelColor">${i18n.t('search.labelColor')}</div>
								<input type="text" id="itemMaster_searchVal_labelColor" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnSearch">${i18n.t('btn.search')}</button>
								<button class="btn btn-secondary btnSearchInit">${i18n.t('btn.clear')}</button>
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
							<span>${i18n.t('table.info.total')} <strong id="itemMasterTotalCount">${totalItemMasterCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="itemMasterCurrentPageInfo">${currentItemMasterPage}</strong>/<strong id="itemMasterTotalPageInfo">${totalItemMasterPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="itemMasterTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right mPurchase_itemMaster">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="itemMasterExcelBtn" onclick="downloadAllItemMasterData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_itemMaster" id="itemMasterTable">
							<thead>
								<tr>
									<th class="noVal" data-sort="NO">${i18n.t('table.no')}</th>
									<th class="itemtypeVal" data-sort="ITEMTYPE">${i18n.t('search.itemType')}</th>
									<th class="carVal" data-sort="CAR">${i18n.t('search.car')}</th>
									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}</th>
									<th class="itemnameLongVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}</th>
									<th class="specVal" data-sort="SPEC">${i18n.t('search.spec')}</th>
									<th class="oitemcodeVal" data-sort="OITEMCODE">OITEMCODE</th>
									<th class="oitemnameVal" data-sort="OITEMNAME">OITEMNAME</th>
									<th class="spec2Val" data-sort="SPEC2">${i18n.t('search.spec2')}</th>
									<th class="labelcolorVal" data-sort="LABELCOLOR">${i18n.t('search.labelColor')}</th>
								</tr>
							</thead>
							<tbody id="itemMasterDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="itemMasterPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="itemMaster_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="itemMaster_itemsPerPage" class="items-per-page-select">
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
			$("#itemMaster_searchVal_toDate").val(toDate);
			$("#itemMaster_searchVal_fromDate").val(fromDate);

			// ✅ Select 초기값 설정 추가!
			$("#itemMaster_itemsPerPage").val(itemMasterItemsPerPage);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderItemMasterTableData();
		// 페이지네이션 렌더링
		renderItemMasterPagination();
		// 이벤트 바인딩
		bindItemMasterEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateItemMasterTotalCount();
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
		const factory = $('#itemMaster_searchVal_factory');
		const storage = $('#itemMaster_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'Material+Sideseat+Outside', 'all'],
				'PUEBLA': ['Material', 'PRODUCT', 'all'],
				'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'all']
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			storage.val(storageList[0]);
		}

		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
			factory.val(savedFactory);
		}

		updateStorageOptions(savedFactory || '');

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

	function updateItemMasterTotalCount() {
		$('#itemMasterTotalCount').text(Number(totalItemMasterCount).toLocaleString());
		$('#itemMasterCurrentPageInfo').text(currentItemMasterPage);
		$('#itemMasterTotalPageInfo').text(totalItemMasterPages);
	}

	function renderItemMasterTableData() {
		let tableBody = "";

		for (let i = 0; i < globalItemMasterData.length; i++) {
			let rowNumber = (currentItemMasterPage - 1) * itemMasterItemsPerPage + i + 1;

			tableBody += `
	            <tr>
	                <td class="noVal">${rowNumber}</td>
					<td class="itemtypeVal">${globalItemMasterData[i].ITEMTYPE || globalItemMasterData[i].itemtype || ''}</td>
					<td class="carVal">${globalItemMasterData[i].CAR || globalItemMasterData[i].car || ''}</td>
					<td class="itemcodeVal">${globalItemMasterData[i].ITEMCODE || globalItemMasterData[i].itemcode || ''}</td>
					<td class="itemnameLongVal">${globalItemMasterData[i].ITEMNAME || globalItemMasterData[i].itemname || ''}</td>
					<td class="specVal">${globalItemMasterData[i].SPEC || globalItemMasterData[i].spec || ''}</td>
					<td class="oitemcodeVal">${globalItemMasterData[i].OITEMCODE || globalItemMasterData[i].oitemcode || ''}</td>
					<td class="oitemnameVal">${globalItemMasterData[i].OITEMNAME || globalItemMasterData[i].oitemname || ''}</td>
					<td class="spec2Val">${globalItemMasterData[i].SPEC2 || globalItemMasterData[i].spec2 || ''}</td>
					<td class="labelcolorVal">${globalItemMasterData[i].LABELCOLOR || globalItemMasterData[i].labelcolor || ''}</td>
	            </tr>
        `;
		}

		$("#itemMasterDetailTableBody").html(tableBody);
	}

	function renderItemMasterPagination() {
		let paginationHtml = "";

		if (currentItemMasterPage > 1) {
			paginationHtml += `<button class="itemMaster-page-btn" data-page="${currentItemMasterPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="itemMaster-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentItemMasterPage - 5);
		let endPage = Math.min(totalItemMasterPages, currentItemMasterPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="itemMaster-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentItemMasterPage) {
				paginationHtml += `<button class="itemMaster-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="itemMaster-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalItemMasterPages) {
			if (endPage < totalItemMasterPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="itemMaster-page-btn" data-page="${totalItemMasterPages}">${totalItemMasterPages}</button>`;
		}

		if (currentItemMasterPage < totalItemMasterPages) {
			paginationHtml += `<button class="itemMaster-page-btn" data-page="${currentItemMasterPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="itemMaster-page-btn disabled">&gt;</button>`;
		}

		$("#itemMasterPaginationContainer").html(paginationHtml);
	}

	function bindItemMasterEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnItemMasterSearch").off('click').on('click', function() {
			performItemMasterSearch();
		});

		// 초기화 버튼 클릭
		$(".btnItemMasterSearchInit").off('click').on('click', function() {
			resetItemMasterSearch();
		});

		// ✅ 페이지당 항목 수 변경 이벤트 추가
		$('#itemMaster_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeItemMasterItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
		$(document).off('click', '.itemMaster-page-btn').on('click', '.itemMaster-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentItemMasterPage = page;
					applyClientPagination();
					renderItemMasterTableData();
					renderItemMasterPagination();
					updateItemMasterTotalCount();
				}
			}
		});

		// 헤더 클릭 시 정렬
		$('#itemMasterTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mPurchase_itemMaster input[type="text"], #view_mPurchase_itemMaster input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performItemMasterSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			itemType: $("#itemMaster_searchVal_itemType").val().trim().toUpperCase(),
			car: $("#itemMaster_searchVal_car").val().trim().toUpperCase(),
			itemCode: $("#itemMaster_searchVal_itemcode").val().trim().toUpperCase(),
			itemName: $("#itemMaster_searchVal_itemname").val().trim().toUpperCase(),
			spec: $("#itemMaster_searchVal_spec").val().trim().toUpperCase(),
			oitemCode: $("#itemMaster_searchVal_oitemCode").val().trim().toUpperCase(),
			oitemName: $("#itemMaster_searchVal_oitemName").val().trim().toUpperCase(),
			spec2: $("#itemMaster_searchVal_spec2").val().trim().toUpperCase(),
			labelColor: $("#itemMaster_searchVal_labelColor").val().trim().toUpperCase()
		};
	}

	function performItemMasterSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentItemMasterPage = 1;
		performItemMasterDBSearch(searchCriteria);
	}

	function resetItemMasterSearch() {
		const factory = getCookie('selectedFactory');
		const storage = 'Material';
		const { fromDate, toDate } = getDefaultDateRange();

		$("#itemMaster_searchVal_itemType").val('');
		$("#itemMaster_searchVal_car").val('');
		$("#itemMaster_searchVal_itemcode").val('');
		$("#itemMaster_searchVal_itemname").val('');
		$("#itemMaster_searchVal_spec").val('');
		$("#itemMaster_searchVal_oitemCode").val('');
		$("#itemMaster_searchVal_oitemName").val('');
		$("#itemMaster_searchVal_spec2").val('');
		$("#itemMaster_searchVal_labelColor").val('');

		currentItemMasterPage = 1;
		performItemMasterDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".itemMasterTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeItemMasterItemsPerPage = function(newItemsPerPage) {
		itemMasterItemsPerPage = newItemsPerPage;
		currentItemMasterPage = 1; // 페이지를 1로 초기화

		// ✅ 쿠키에 저장 추가!
		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderItemMasterTableData();
		renderItemMasterPagination();
		updateItemMasterTotalCount();

		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
	}

	window.exportItemMasterData = function() {
		return {
			total: filteredData.length,
			currentPage: currentItemMasterPage,
			itemsPerPage: itemMasterItemsPerPage,
			data: filteredData
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllItemMasterData = function() {
	let searchCriteria = {
		itemType: $("#searchVal_itemType").val().trim().toUpperCase(),
		car: $("#searchVal_car").val().trim().toUpperCase(),
		itemCode: $("#searchVal_itemcode").val().trim().toUpperCase(),
		itemName: $("#searchVal_itemname").val().trim().toUpperCase(),
		spec: $("#searchVal_spec").val().trim().toUpperCase(),
		oitemCode: $("#searchVal_oitemCode").val().trim().toUpperCase(),
		oitemName: $("#searchVal_oitemName").val().trim().toUpperCase(),
		spec2: $("#searchVal_spec2").val().trim().toUpperCase(),
		labelColor: $("#searchVal_labelColor").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_itemMaster",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log(response);

			ExcelExporter.downloadExcel(filteredData, window.itemMasterColumns, {
				fileName: 'itemMaster_All',
				sheetName: 'itemMaster'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
}; */