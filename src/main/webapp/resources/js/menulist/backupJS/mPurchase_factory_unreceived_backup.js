/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
 * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
 * -------------------------------------------------------------- */

// ✅ 전역 변수로 통일
/*let allServerData = [];
let filteredData_purchaseFactoryUnreceived = [];
let globalfactoryUnreceivedData = [];
let currentfactoryUnreceivedPage = 1;
let factoryUnreceivedItemsPerPage = 100;
let totalfactoryUnreceivedCount = 0;
let totalfactoryUnreceivedPages = 0;
let currentSortColumn = null;
let currentSortOrder = 'asc';

$(document).ready(function() {
	window.filteredfactoryUnreceivedData = [];
	window.factoryUnreceivedColumns = [

		{ key: 'FROMFACTORY', header: 'Sent Factory' },      // 보낸 공장
		{ key: 'FROMDATE', header: 'Sent Date' },            // 보낸 날짜
		{ key: 'TOFACTORY', header: 'Receive Factory' },     // 받는 공장
		{ key: 'TODATE', header: 'Receive Date' },           // 받은 날짜
		{ key: 'CAR', header: 'Car' },                       // 차량
		{ key: 'ITEMCODE', header: 'Item Code' },            // 품목코드
		{ key: 'ITEMNAME', header: 'Item Name' },            // 품목명
		{ key: 'FROMQTY', header: 'Sent Qty', type: 'number' }, // 출고수량
		{ key: 'TOQTY', header: 'Recevie Qty', type: 'number' },    // 입고수량
		{ key: 'BARCODE', header: 'LOT' },                   // LOT
		{ key: 'TOSTORAGE', header: 'Receive Storage' },     // 받는 창고
		{ key: 'COMPLETE', header: 'Unreceived' }              // 완료여부
	];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mPurchase_factory_Unreceived = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		const moveFactory = getCookie('selectedFactory');

		const factory = moveFactory === 'SALTILLO' ? 'PUEBLA' : moveFactory === 'PUEBLA' ? 'SALTILLO' : 'all';

		console.log("FACTORY - " + factory + " // Move - " + moveFactory);

		performfactoryUnreceivedDBSearch({ fromDate, toDate, factory, moveFactory });
	}

	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
	function performfactoryUnreceivedDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_factoryUnreceived",
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
				filteredData_purchaseFactoryUnreceived = [...allServerData]; // 초기에는 필터링 없음
				totalQty = response.totalQty || 0;

				// 페이지 초기화
				currentfactoryUnreceivedPage = 1;
				currentSortColumn = null;
				currentSortOrder = 'asc';

				// 클라이언트에서 페이징 처리
				applyClientPagination();

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mPurchase_factory_Unreceived').length) {
					renderfactoryUnreceivedView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderfactoryUnreceivedTableData();
					renderfactoryUnreceivedPagination();
					updatefactoryUnreceivedTotalCount();
				}

				// 총 수량 업데이트
				//updateTotalQty();

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
		factoryUnreceivedItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;

		totalfactoryUnreceivedCount = filteredData_purchaseFactoryUnreceived.length;
		totalfactoryUnreceivedPages = Math.ceil(totalfactoryUnreceivedCount / factoryUnreceivedItemsPerPage);

		// 현재 페이지 범위 계산
		const startIndex = (currentfactoryUnreceivedPage - 1) * factoryUnreceivedItemsPerPage;
		const endIndex = startIndex + factoryUnreceivedItemsPerPage;

		// 현재 페이지 데이터 추출
		globalfactoryUnreceivedData = filteredData_purchaseFactoryUnreceived.slice(startIndex, endIndex);
		window.filteredfactoryUnreceivedData = globalfactoryUnreceivedData;
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
		filteredData_purchaseFactoryUnreceived.sort((a, b) => {
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
		currentfactoryUnreceivedPage = 1;
		applyClientPagination();

		// 테이블 업데이트
		renderfactoryUnreceivedTableData();
		renderfactoryUnreceivedPagination();
		updatefactoryUnreceivedTotalCount();

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(column);
	}

	// 헤더에 정렬 방향 표시
	function updateSortIndicators(column) {
		$('.data-table thead th').removeClass('sort-asc sort-desc');
		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
	}

	// 사용자 뷰 렌더링 함수
	function renderfactoryUnreceivedView() {
		let content_output = `
			<div class="divBlockControl" id="view_mPurchase_factory_Unreceived">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate"> ${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="factoryUnreceived_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="factoryUnreceived_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.sentfactory')}<!-- FACTORY --></div>
								<select id="factoryUnreceived_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_moveFactory">${i18n.t('search.receivefactory')}<!-- MOVE FACTORY --></div>
								<select id="factoryUnreceived_searchVal_moveFactory" >
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_moveStorage">${i18n.t('search.receivestorage')}<!-- MOVE STORAGE --></div>
								<select id="factoryUnreceived_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>							
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="factoryUnreceived_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="factoryUnreceived_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnFactoryUnreceivedSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnFactoryUnreceivedSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="factoryUnreceivedTotalCount">${totalfactoryUnreceivedCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="factoryUnreceivedCurrentPageInfo">${currentfactoryUnreceivedPage}</strong>/<strong id="factoryUnreceivedTotalPageInfo">${totalfactoryUnreceivedPages}</strong> |  
								<!-- <span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="factoryUnreceivedTotalQty" style="color:#007bff"></span> --> 
							</span>
							<div class="action-buttons-right mPurchase_factory_Unreceived">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="factoryUnreceivedExcelBtn" onclick="downloadAllfactoryUnreceivedData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mPurchase_factory_Unreceived" id="factoryUnreceivedTable">
							<thead>
								<tr>
									<!--<th class="checkboxVal"><input type="checkbox" class="inbound_chkAll"></th>-->
									<th class="noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class="itemcodeVal" data-sort="FROMFACTORY">${i18n.t('search.sentfactory')}<!-- 보낸 FACTORY --></th>
									<th class="itemcodeVal" data-sort="FROMDATE" data-type="date">${i18n.t('search.sentdate')}<!-- 보낸 SDATE --></th>
									<th class="itemcodeVal" data-sort="TOFACTORY">${i18n.t('search.receivefactory')}<!-- 받은 MOVEFACTORY --></th>
									<th class="itemcodeVal" data-sort="TODATE" data-type="date">${i18n.t('search.receivedate')}<!-- 받은SDATE --></th>
									<th class="carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class="scanqtyVal" data-sort="FROMQTY" data-type="number">${i18n.t('search.qty.out')}<!-- OUTQTY --></th>
									<th class="unpackqtyVal" data-sort="TOQTY" data-type="number">${i18n.t('search.qty.in')}<!-- INQTY --></th>
									<th class="barcodeVal" data-sort="BARCODE">LOT<!-- LOT --></th>
									<!--<th class="storageVal">${i18n.t('search.storage')} 보낸 STORAGE </th>-->
									<th class="wccodeVal" data-sort="TOSTORAGE">${i18n.t('search.receivestorage')}<!--받은 MOVESTORAGE --></th>
									<th class="dateVal" data-sort="COMPLETE"><!-- LOT -->Unreceived</th>
									<th class="carVal"><!-- LOT -->Check</th>
								</tr>
							</thead>
							<tbody id="factoryUnreceivedDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="factoryUnreceivedPaginationContainer">
						</div>
						<div class="items-per-page-selector">
					        <label for="factoryUnreceived_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
					        <select id="factoryUnreceived_itemsPerPage" class="items-per-page-select">
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
			$("#factoryUnreceived_searchVal_toDate").val(toDate);
			$("#factoryUnreceived_searchVal_fromDate").val(fromDate);
			$("#factoryUnreceived_searchVal_storage").val('all');

			// ✅✅ 중요: Select 값을 쿠키에서 읽은 값으로 설정
			$("#factoryUnreceived_itemsPerPage").val(factoryUnreceivedItemsPerPage);
			console.log("🎯 Select 초기값 설정됨:", factoryUnreceivedItemsPerPage);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderfactoryUnreceivedTableData();
		// 페이지네이션 렌더링
		renderfactoryUnreceivedPagination();
		// 이벤트 바인딩
		bindfactoryUnreceivedEvents();
		// 초기 렌더링 후 카운트 업데이트
		updatefactoryUnreceivedTotalCount();
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
		const factory = $('#factoryUnreceived_searchVal_factory');
		const moveFactory = $('#factoryUnreceived_searchVal_moveFactory');
		const storage = $('#factoryUnreceived_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'Material+Sideseat+Outside', 'all'],
				'PUEBLA': ['Material', 'PRODUCT', 'all'],
				'all': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'Material+Sideseat+Outside', 'all']
			};

			const storageList = options[factoryValue] || options['all'];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			//storage.val(storageList[0]);
			//전체로 고정
			storage.val('all');
		}

		// ✅ 보낸 공장과 받는 공장을 반대로 설정하는 함수
		function getOppositeFactory(currentFactory) {
			if (currentFactory === 'SALTILLO') return 'PUEBLA';
			if (currentFactory === 'PUEBLA') return 'SALTILLO';
			return 'all';
		}

		// ✅ 초기값 설정
		if (savedFactory) {
			const sentFactory = getOppositeFactory(savedFactory);
			factory.val(sentFactory);
			moveFactory.val(savedFactory);
		}

		updateStorageOptions(moveFactory.val() || savedFactory || '');

		// ✅ 보낸 공장 변경 시 → 받는 공장도 자동 변경
		factory.on('change', function() {
			const selectedFactory = $(this).val();
			const oppositeFactory = getOppositeFactory(selectedFactory);

			moveFactory.val(oppositeFactory);
			updateStorageOptions(oppositeFactory);
		});

		// ✅ 받는 공장 변경 시 → 보낸 공장도 자동 변경 & 창고 업데이트
		moveFactory.on('change', function() {
			const selectedMoveFactory = $(this).val();
			const oppositeFactory = getOppositeFactory(selectedMoveFactory);

			factory.val(oppositeFactory);
			updateStorageOptions(selectedMoveFactory);
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
		const cookieString = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";

		console.log("🍪 setCookie 호출:", cookieName, "=", value);
		console.log("🍪 쿠키 문자열:", cookieString);

		document.cookie = cookieString;

		// 저장 확인
		const savedValue = getCookie(cookieName);
		console.log("🍪 저장 확인:", cookieName, "=", savedValue);
	}

	function updatefactoryUnreceivedTotalCount() {
		$('#factoryUnreceivedTotalCount').text(Number(totalfactoryUnreceivedCount).toLocaleString());
		$('#factoryUnreceivedCurrentPageInfo').text(currentfactoryUnreceivedPage);
		$('#factoryUnreceivedTotalPageInfo').text(totalfactoryUnreceivedPages);
	}

	function renderfactoryUnreceivedTableData() {
		let tableBody = "";

		for (let i = 0; i < globalfactoryUnreceivedData.length; i++) {
			let rowNumber = (currentfactoryUnreceivedPage - 1) * factoryUnreceivedItemsPerPage + i + 1;

			if (globalfactoryUnreceivedData[i].complete == 'O') {
				check = 'X'
			} else {
				check = 'O'
			}

			tableBody += `
            <tr>
                <td class="noVal">${rowNumber}</td>
                <td class="itemcodeVal">${globalfactoryUnreceivedData[i].FROMFACTORY || globalfactoryUnreceivedData[i].fromfactory || ''}</td>
                <td class="itemcodeVal">${globalfactoryUnreceivedData[i].FROMDATE || globalfactoryUnreceivedData[i].fromdate || ''}</td>
                <td class="itemcodeVal">${globalfactoryUnreceivedData[i].TOFACTORY || globalfactoryUnreceivedData[i].tofactory || ''}</td>
                <td class="itemcodeVal">${globalfactoryUnreceivedData[i].TODATE || globalfactoryUnreceivedData[i].todate || ''}</td>
                <td class="carVal">${globalfactoryUnreceivedData[i].CAR || globalfactoryUnreceivedData[i].car || ''}</td>
                <td class="itemcodeVal">${globalfactoryUnreceivedData[i].ITEMCODE || globalfactoryUnreceivedData[i].itemcode || ''}</td>
                <td class="itemnameVal">${globalfactoryUnreceivedData[i].ITEMNAME || globalfactoryUnreceivedData[i].itemname || ''}</td>
                <td class="scanqtyVal">${Number(globalfactoryUnreceivedData[i].FROMQTY || globalfactoryUnreceivedData[i].fromqty || 0).toLocaleString()}</td>
                <td class="unpackqtyVal">${Number(globalfactoryUnreceivedData[i].TOQTY || globalfactoryUnreceivedData[i].toqty || 0).toLocaleString()}</td>
                <td class="barcodeVal">${globalfactoryUnreceivedData[i].BARCODE || globalfactoryUnreceivedData[i].barcode || ''}</td>
                <td class="wccodeVal">${globalfactoryUnreceivedData[i].FROMSTORAGE || globalfactoryUnreceivedData[i].fromstorage || ''}</td>
                <td class="dateVal">${globalfactoryUnreceivedData[i].COMPLETE || globalfactoryUnreceivedData[i].complete || ''}</td>
                <td class = "carVal">${check}</td>
            </tr>
        `;
		}

		$("#factoryUnreceivedDetailTableBody").html(tableBody);
	}

	function renderfactoryUnreceivedPagination() {
		let paginationHtml = "";

		if (currentfactoryUnreceivedPage > 1) {
			paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="${currentfactoryUnreceivedPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryUnreceived-page-btn disabled">&lt;</button>`;
		}

		let startPage = Math.max(1, currentfactoryUnreceivedPage - 5);
		let endPage = Math.min(totalfactoryUnreceivedPages, currentfactoryUnreceivedPage + 5);

		if (startPage > 1) {
			paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			if (i === currentfactoryUnreceivedPage) {
				paginationHtml += `<button class="factoryUnreceived-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		if (endPage < totalfactoryUnreceivedPages) {
			if (endPage < totalfactoryUnreceivedPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="${totalfactoryUnreceivedPages}">${totalfactoryUnreceivedPages}</button>`;
		}

		if (currentfactoryUnreceivedPage < totalfactoryUnreceivedPages) {
			paginationHtml += `<button class="factoryUnreceived-page-btn" data-page="${currentfactoryUnreceivedPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryUnreceived-page-btn disabled">&gt;</button>`;
		}

		$("#factoryUnreceivedPaginationContainer").html(paginationHtml);
	}

	function bindfactoryUnreceivedEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnFactoryUnreceivedSearch").off('click').on('click', function() {
			performfactoryUnreceivedSearch();
		});

		// 초기화 버튼 클릭
		$(".btnFactoryUnreceivedSearchInit").off('click').on('click', function() {
			resetfactoryUnreceivedSearch();
		});

		// ✅ 페이지당 항목 수 변경 이벤트 추가
		$('#factoryUnreceived_itemsPerPage').off('change').on('change', function() {
			const newItemsPerPage = parseInt($(this).val());
			changeFactoryUnreceivedItemsPerPage(newItemsPerPage);
		});

		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
		$(document).off('click', '.factoryUnreceived-page-btn').on('click', '.factoryUnreceived-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentfactoryUnreceivedPage = page;
					applyClientPagination();
					renderfactoryUnreceivedTableData();
					renderfactoryUnreceivedPagination();
					updatefactoryUnreceivedTotalCount();
				}
			}
		});

		// 헤더 클릭 시 정렬
		$('#factoryUnreceivedTable thead th[data-sort]').off('click').on('click', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string';
			applyClientSort(column, dataType);
		});

		// 엔터키 검색
		$('#view_mPurchase_factory_Unreceived input[type="text"], #view_mPurchase_factory_Unreceived input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performfactoryUnreceivedSearch();
			}
		});
	}

	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#factoryUnreceived_searchVal_fromDate").val(),
			toDate: $("#factoryUnreceived_searchVal_toDate").val(),
			factory: $("#factoryUnreceived_searchVal_factory").val(),
			moveFactory: $("#factoryUnreceived_searchVal_moveFactory").val(),
			storage: $("#factoryUnreceived_searchVal_storage").val(),
			car: ($("#factoryUnreceived_searchVal_car").val() || '').trim().toUpperCase(),
			itemcode: ($("#factoryUnreceived_searchVal_itemcode").val() || '').trim().toUpperCase(),
			itemname: ($("#factoryUnreceived_searchVal_itemname").val() || '').trim().toUpperCase()
		};
	}

	function performfactoryUnreceivedSearch() {
		let searchCriteria = getCurrentSearchCriteria();
		console.log("검색 조건:", searchCriteria);

		currentfactoryUnreceivedPage = 1;
		performfactoryUnreceivedDBSearch(searchCriteria);
	}

	function resetfactoryUnreceivedSearch() {
		const { fromDate, toDate } = getDefaultDateRange();

		const moveFactory = getCookie('selectedFactory');
		const factory = moveFactory === 'SALTILLO' ? 'PUEBLA' : moveFactory === 'PUEBLA' ? 'SALTILLO' : 'all';
		const storage = 'all';

		$("#factoryUnreceived_searchVal_fromDate").val(fromDate);
		$("#factoryUnreceived_searchVal_toDate").val(toDate);
		$("#factoryUnreceived_searchVal_car").val('');
		$("#factoryUnreceived_searchVal_itemcode").val('');
		$("#factoryUnreceived_searchVal_itemname").val('');

		// 공장, 창고 기본값 설정
		renderFactoryStorage();
		
		currentfactoryUnreceivedPage = 1;
		performfactoryUnreceivedDBSearch({ factory, storage, toDate, fromDate });

		console.log('검색 조건이 초기화되었습니다.');
	}

	function updateTotalQty() {
		$(".factoryUnreceivedTotalQty").text(Number(totalQty).toLocaleString());
	}

	window.changeFactoryUnreceivedItemsPerPage = function(newItemsPerPage) {
		factoryUnreceivedItemsPerPage = newItemsPerPage;
		currentfactoryUnreceivedPage = 1;

		// ✅ 쿠키에 저장
		setCookie('itemsPerPage', newItemsPerPage);

		applyClientPagination();
		renderfactoryUnreceivedTableData();
		renderfactoryUnreceivedPagination();
		updatefactoryUnreceivedTotalCount();
	}

	window.exportfactoryUnreceivedData = function() {
		return {
			total: filteredData_purchaseFactoryUnreceived.length,
			currentPage: currentfactoryUnreceivedPage,
			itemsPerPage: factoryUnreceivedItemsPerPage,
			data: filteredData_purchaseFactoryUnreceived
		};
	}
});

// 전체 데이터 엑셀 다운로드
window.downloadAllfactoryUnreceivedData = function() {
	let searchCriteria = {
		fromDate: $("#factoryUnreceived_searchVal_fromDate").val(),
		toDate: $("#factoryUnreceived_searchVal_toDate").val(),
		factory: $("#factoryUnreceived_searchVal_factory").val(),
		moveFactory: $("#factoryUnreceived_searchVal_moveFactory").val(),
		storage: $("#factoryUnreceived_searchVal_storage").val(),
		car: ($("#factoryUnreceived_searchVal_car").val() || '').trim().toUpperCase(),
		itemcode: ($("#factoryUnreceived_searchVal_itemcode").val() || '').trim().toUpperCase(),
		itemname: ($("#factoryUnreceived_searchVal_itemname").val() || '').trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_factoryUnreceived",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log(response);

			ExcelExporter.downloadExcel(filteredData_purchaseFactoryUnreceived, window.factoryUnreceivedColumns, {
				fileName: 'factoryUnreceived_All',
				sheetName: 'factoryUnreceived'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};*/