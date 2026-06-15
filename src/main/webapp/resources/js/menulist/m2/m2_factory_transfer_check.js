/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_factory_transfer_check 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : common -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : Common -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

/* --------------------------------------------------------------
 * 📌 구매 - 이동 - 공장 이동 완료
 * 비고: 
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalFactoryTransferCheckData = []; // 현재 조회된 데이터 저장
	let currentFactoryTransferCheckPage = 1; // 현재 페이지
	let factoryTransferCheckItemsPerPage = 1000; // 페이지당 항목 수
	let totalFactoryTransferCheckCount = 0; // 서버에서 받은 총 개수 저장
	let totalFactoryTransferCheckPages = 0; // 서버에서 받은 총 페이지
	let menuType = null;
	let saveStorageForInit = null;

	window.filteredFactoryTransferCheckData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.factoryTransferCheckColumns = [
		{ key: 'SDATE', header: 'date' },
		{ key: 'FACTORY', header: 'sent factory' },
		{ key: 'STORAGE', header: 'sent storage' },
		{ key: 'MOVEFACTORY', header: 'received factory' },
		{ key: 'MOVESTORAGE', header: 'received storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },

		{ key: 'QTY', header: 'qty' },                 // receiving qty
		{ key: 'STATUS', header: 'status' },           // Complete / Checking
		{ key: 'SALTILLO_QTY', header: 'saltillo' },   // 계산값
		{ key: 'PUEBLA_QTY', header: 'puebla' },       // 계산값

		{ key: 'BARCODE', header: 'lot' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_factory_transfer_check = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		const moveFactory = getCookie('selectedFactory');

		const factory = moveFactory === 'SALTILLO' ? 'PUEBLA' : moveFactory === 'PUEBLA' ? 'SALTILLO' : 'all';

		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performFactoryTransferCheckDBSearch({ fromDate, toDate, moveFactory, factory });

		// ✅ 또는 이벤트 리스너로 받기
		document.addEventListener('menuTypeChanged', function(e) {
			console.log("Menu Type:", e.detail.menuType);
			menuType = e.detail.menuType;
			console.log("Data Matching:", e.detail.dataMatching);
		});
	}

	// DB에서 데이터 조회하는 함수
	function performFactoryTransferCheckDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_factoryTransferCheck",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentFactoryTransferCheckPage,
				itemsPerPage: factoryTransferCheckItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {

				// ✅ 서버 페이징 응답 기준
				globalFactoryTransferCheckData = data.records || [];

				totalFactoryTransferCheckCount = Number(data.totalCount || 0);
				totalFactoryTransferCheckPages = Number(data.totalPages || 1);
				currentFactoryTransferCheckPage = Number(data.currentPage || currentFactoryTransferCheckPage);

				window.filteredFactoryTransferCheckData = globalFactoryTransferCheckData;

				if (!$('#view_m2_factory_transfer_check').length) {
					renderFactoryTransferCheckView();
				} else {
					renderFactoryTransferCheckTableData();      // ✅ 서버가 이미 현재페이지 rows만 주므로 slice 불필요
					renderFactoryTransferCheckPagination();     // ✅ totalCount 기반 페이지
					updateFactoryTransferCheckTotalCount();
				}

				hideLoading();
			},
			error: function() {
				hideLoading();
				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
			}
		});
	}


	// 사용자 뷰 렌더링 함수
	function renderFactoryTransferCheckView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_factory_transfer_check">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate"> ${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="factoryTransferCheck_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="factoryTransferCheck_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.sentfactory')}<!-- FACTORY --></div>
								<select id="factoryTransferCheck_searchVal_factory">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_moveFactory">${i18n.t('search.receivefactory')}<!-- MOVE FACTORY --></div>
								<select id="factoryTransferCheck_searchVal_moveFactory" >
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_moveStorage">${i18n.t('search.receivestorage')}<!-- MOVE STORAGE --></div>
								<select id="factoryTransferCheck_searchVal_moveStorage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>							
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="factoryTransferCheck_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="factoryTransferCheck_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="searchVal_status">Status</div>
									<select id="factoryTransferCheck_searchVal_status">
										<option value="all">All</option>
										<option value="COMPLETE">Complete</option>
										<option value="CHECKING">Checking</option>
									</select>
								</div>
							</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnFactoryTransferCheckSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnFactoryTransferCheckSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
						    <strong id="factoryTransferCheckTotalCount">${totalFactoryTransferCheckCount}</strong>
						    ${i18n.t('table.info.records')}
						    |
						    ${i18n.t('table.page')}
						    <strong id="factoryTransferCheckCurrentPageInfo">${currentFactoryTransferCheckPage}</strong>/
						    <strong id="factoryTransferCheckTotalPageInfo">${Math.ceil(globalFactoryTransferCheckData.length / factoryTransferCheckItemsPerPage)}</strong>
						    |
						
						    <!-- ✅ 합계 표시 추가 -->
						    <span style="margin-left:10px;">살티요 : </span>
						    <span id="factoryTransferCheckTotalSaltillo" style="color:#007bff;font-weight:700;">0</span>
						
						    <span style="margin-left:10px;">푸에블라 : </span>
						    <span id="factoryTransferCheckTotalPuebla" style="color:#007bff;font-weight:700;">0</span>
						  </span>
						
						  <div class="action-buttons-right m2_factory_transfer_check">
						    <div id="defaultActions" class="action-group">
						      <button class="btn btn-success" id="factoryTransferCheckExcelBtn" onclick="downloadAllFactoryTransferCheckData()">Excel</button>
						    </div>
						  </div>
						</div>

						<table class="data-table m2_factory_transfer_check">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal">${i18n.t('table.date')}<!-- DATE --></th>
									<th class = "factoryVal">${i18n.t('search.sentfactory')}<!-- 보낸 FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.sentstorage')}<!-- 보낸 STORAGE --></th>
									<th class = "factoryVal">${i18n.t('search.receivefactory')}<!-- 받은 MOVEFACTORY --></th>
									<th class = "storageVal">${i18n.t('search.receivestorage')}<!-- 받은 STORAGE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- 차종 --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "qtyVal">${i18n.t('search.qty.stockCheck')}<!-- QTY --></th>
									<th class = "qtyVal">${i18n.t('search.factory.saltillo')}<!-- QTY --></th>
									<th class = "qtyVal">${i18n.t('search.factory.puebla')}<!-- QTY --></th>
									<th class = "barcodeVal">LOT<!-- LOT --></th>
								</tr>
							</thead>
							<tbody id="factoryTransferCheckTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="factoryTransferCheckPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		// = 위에 data-table, search-row i18n 부분 추가
		$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function() {
			const { fromDate, toDate } = getDefaultDateRange();
			$("#factoryTransferCheck_searchVal_fromDate").val(fromDate);
			$("#factoryTransferCheck_searchVal_toDate").val(toDate);
		})();

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderFactoryTransferCheckTableData();
		// 페이지네이션 렌더링
		renderFactoryTransferCheckPagination();
		// 이벤트 바인딩
		bindFactoryTransferCheckEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateFactoryTransferCheckTotalCount();
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const factory = $('#factoryTransferCheck_searchVal_factory');
		const moveFactory = $('#factoryTransferCheck_searchVal_moveFactory');
		const storage = $('#factoryTransferCheck_searchVal_moveStorage');
		const savedFactory = getCookie('selectedFactory');

		// 공장별 창고 옵션 설정
		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'SALTILLO': ['all', 'Material', 'PRODUCT', 'Fabric', 'Side seat', 'P1 W/HOUSE', 'Outside'],
				'PUEBLA': ['all', 'Material', 'PRODUCT'],
				'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'P1 W/HOUSE', 'all']
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const text = item === 'all' ? i18n.t('search.all') : item;
				storage.append(`<option value="${item}">${text}</option>`);
			});

			// 첫 번째 옵션 선택 (Material)
			//storage.val(storageList[0]);
			// ✅ menuType에 따라 storage 설정
			console.log(menuType)
			if (menuType === "purchase") {
				saveStorageForInit = "Material";
				$("#factoryTransferCheck_searchVal_moveStorage").val('Material');
			} else if (menuType === "fabric") {
				saveStorageForInit = "Fabric";
				$("#factoryTransferCheck_searchVal_moveStorage").val('Fabric');
			} else if (menuType === "sales") {
				saveStorageForInit = "P1 W/HOUSE";
				$("#factoryTransferCheck_searchVal_moveStorage").val('P1 W/HOUSE');
			}
		}

		// 저장된 공장 선택
		if (savedFactory && moveFactory.find(`option[value="${savedFactory}"]`).length) {
			moveFactory.val(savedFactory);
		}

		const cur = (moveFactory.val() || '').toString();
		factory.val(cur === 'SALTILLO' ? 'PUEBLA' : cur === 'PUEBLA' ? 'SALTILLO' : 'all');

		updateStorageOptions(savedFactory || '');

		// 무브팩토리 변경 시 창고, 팩토리 업데이트
		moveFactory.on('change', function() {
			updateStorageOptions($(this).val());
			const v = ($(this).val() || '').toString();
			factory.val(v === "SALTILLO" ? 'PUEBLA' : v === 'PUEBLA' ? 'SALTILLO' : 'all');
		});

		// 팩토리 변경 시 -> 무브팩토리 자동 변경
		factory.on('change', function() {
			const v = ($(this).val() || '').toString();
			moveFactory.val(v === "SALTILLO" ? 'PUEBLA' : v === 'PUEBLA' ? 'SALTILLO' : 'all');
			updateStorageOptions(moveFactory.val());
		});
	}

	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	function updateFactoryTransferCheckTotalCount() {
		$('#factoryTransferCheckTotalCount').text((totalFactoryTransferCheckCount || 0).toLocaleString());
	}


	function renderFactoryTransferCheckTableData() {
		let tableBody = "";

		const rows = globalFactoryTransferCheckData || []; // ✅ 이미 현재 페이지 데이터

		if (rows.length === 0) {
			$("#factoryTransferCheckTableBody").html(`
			      <tr><td class="noVal" colspan="14" style="text-align:center;padding:20px;">No data</td></tr>
			    `);
			updateFactoryTransferCheckTotalsByFactory([]);
			return;
		}

		for (let i = 0; i < rows.length; i++) {
			const rowNumber = (currentFactoryTransferCheckPage - 1) * factoryTransferCheckItemsPerPage + i + 1;

			const row = rows[i] || {};
			const statusRaw = (row.STATUS || row.status || '').toString().trim().toUpperCase();
			const isComplete = (statusRaw === 'COMPLETE');

			const badgeClass = isComplete ? 'badge badge-complete' : 'badge badge-checking';
			const rowClass = isComplete ? 'row-complete' : 'row-checking';
			const statusText = isComplete ? 'Complete' : 'Checking';

			const qty = toNum(row.QTY ?? row.qty);
			const sendingQty = toNum(row.SENDING_QTY ?? row.sending_qty);

			const moveFactory = (row.MOVEFACTORY || row.movefactory || '').toString().trim().toUpperCase();
			let saltilloQty = 0, pueblaQty = 0;

			if (moveFactory === "SALTILLO") { saltilloQty = qty; pueblaQty = sendingQty; }
			else if (moveFactory === "PUEBLA") { pueblaQty = qty; saltilloQty = sendingQty; }

			tableBody += `
		      <tr class="${rowClass}">
		        <td class="noVal">${rowNumber}</td>
		        <td class="dateVal">${row.SDATE || row.sdate || ''}</td>
		        <td class="factoryVal">${row.FACTORY || row.factory || ''}</td>
		        <td class="storageVal">${row.STORAGE || row.storage || ''}</td>
		        <td class="factoryVal">${row.MOVEFACTORY || row.movefactory || ''}</td>
		        <td class="storageVal">${row.MOVESTORAGE || row.movestorage || ''}</td>
		        <td class="carVal">${row.CAR || row.car || ''}</td>
		        <td class="itemcodeVal">${row.ITEMCODE || row.itemcode || ''}</td>
		        <td class="itemnameVal">${row.ITEMNAME || row.itemname || ''}</td>
		        <td class="qtyVal">${qty.toLocaleString()}</td>
		        <td class="qtyVal"><span class="${badgeClass}">${statusText}</span></td>
		        <td class="qtyVal">${saltilloQty.toLocaleString()}</td>
		        <td class="qtyVal">${pueblaQty.toLocaleString()}</td>
		        <td class="barcodeVal">${row.BARCODE || row.barcode || ''}</td>
		      </tr>
		    `;
		}

		$("#factoryTransferCheckTableBody").html(tableBody);

		// ✅ 현재 페이지 합계
		updateFactoryTransferCheckTotalsByFactory(rows);
	}


	// ✅ render에서 쓰는 숫자 변환 유틸(없으면 꼭 추가)
	function toNum(v) {
		if (v === null || v === undefined) return 0;
		const s = String(v).replace(/,/g, '').trim();
		if (!s) return 0;
		const n = Number(s);
		return Number.isFinite(n) ? n : 0;
	}

	function updateFactoryTransferCheckTotalsByFactory(rows) {
		let saltilloTotal = 0;
		let pueblaTotal = 0;

		for (let i = 0; i < rows.length; i++) {
			const r = rows[i] || {};
			const moveFactory = (r.MOVEFACTORY || r.movefactory || '').toString().toUpperCase();

			const qty = Number(r.QTY ?? r.qty ?? 0) || 0;
			const sendingQty = Number(r.SENDING_QTY ?? r.sending_qty ?? 0) || 0;

			// ✅ 현재 코드 로직 기준: movefactory가 SALTILLO면 qty=Saltillo, sending= Puebla 로 표기하셨죠
			if (moveFactory === 'SALTILLO') {
				saltilloTotal += qty;
				pueblaTotal += sendingQty;
			} else if (moveFactory === 'PUEBLA') {
				// 반대 케이스도 자연스럽게 합산되게 처리
				pueblaTotal += qty;
				saltilloTotal += sendingQty;
			} else {
				// all/기타면 일단 qty는 받은 공장 기준으로만 더하고, sending은 반대 공장 추정이 불가 → 둘 다 더하지 않음(원하시면 여기 로직 바꿔드릴게요)
			}
		}

		$("#factoryTransferCheckTotalSaltillo").text(saltilloTotal.toLocaleString());
		$("#factoryTransferCheckTotalPuebla").text(pueblaTotal.toLocaleString());
	}



	// 페이지네이션 렌더링
	function renderFactoryTransferCheckPagination() {
		let totalPages = Math.ceil(totalFactoryTransferCheckCount / factoryTransferCheckItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentFactoryTransferCheckPage > 1) {
			paginationHtml += `<button class="factoryTransferCheck-page-btn" data-page="${currentFactoryTransferCheckPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryTransferCheck-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentFactoryTransferCheckPage - 5);
		let endPage = Math.min(totalPages, currentFactoryTransferCheckPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="factoryTransferCheck-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentFactoryTransferCheckPage) {
				paginationHtml += `<button class="factoryTransferCheck-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryTransferCheck-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryTransferCheck-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentFactoryTransferCheckPage < totalPages) {
			paginationHtml += `<button class="factoryTransferCheck-page-btn" data-page="${currentFactoryTransferCheckPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryTransferCheck-page-btn disabled">&gt;</button>`;
		}

		$("#factoryTransferCheckCurrentPageInfo").html(currentFactoryTransferCheckPage);
		$("#factoryTransferCheckTotalPageInfo").html(totalPages);
		$("#factoryTransferCheckPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindFactoryTransferCheckEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnFactoryTransferCheckSearch").off('click').on('click', function() {
			performFactoryTransferCheckSearch();
		});

		// 초기화 버튼 클릭
		$(".btnFactoryTransferCheckSearchInit").off('click').on('click', function() {
			resetFactoryTransferCheckSearch();
		});

		$(document).off('click', '.factoryTransferCheck-page-btn').on('click', '.factoryTransferCheck-page-btn', function() {
			if ($(this).hasClass('disabled') || $(this).hasClass('active')) return;

			const page = parseInt($(this).data('page'), 10);
			if (!page) return;

			currentFactoryTransferCheckPage = page;

			const searchCriteria = getCurrentSearchCriteria();
			performFactoryTransferCheckDBSearch(searchCriteria); // ✅ 서버 재조회
		});



		// 엔터키 검색
		$('#view_m2_factory_transfer_check input[type="text"], #view_m2_factory_transfer_check input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performFactoryTransferCheckSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		let moveStorage = '';
		if ($("#factoryTransferCheck_searchVal_moveStorage").val() == 'all') {
			moveStorage = 'all';
		} else {
			moveStorage = $("#factoryTransferCheck_searchVal_moveStorage").val();
		}

		let status = ($("#factoryTransferCheck_searchVal_status").val() || 'all');

		return {
			fromDate: $("#factoryTransferCheck_searchVal_fromDate").val(),
			toDate: $("#factoryTransferCheck_searchVal_toDate").val(),
			factory: $("#factoryTransferCheck_searchVal_factory").val(),
			moveFactory: $("#factoryTransferCheck_searchVal_moveFactory").val(),
			moveStorage: moveStorage,
			itemcode: $("#factoryTransferCheck_searchVal_itemcode").val().trim(),
			itemname: $("#factoryTransferCheck_searchVal_itemname").val().trim(),
			status: status
		};
	}
	// =
	// 검색 수행 함수 - DB 조회
	function performFactoryTransferCheckSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentFactoryTransferCheckPage = 1;
		performFactoryTransferCheckDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetFactoryTransferCheckSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
		const moveFactory = factory === 'SALTILLO' ? 'PUEBLA' : factory === 'PUEBLA' ? 'SALTILLO' : 'all';

		$("#factoryTransferCheck_searchVal_fromDate").val(fromDate);
		$("#factoryTransferCheck_searchVal_toDate").val(toDate);
		$("#factoryTransferCheck_searchVal_factory").val(factory);
		$("#factoryTransferCheck_searchVal_moveFactory").val(moveFactory);
		$("#factoryTransferCheck_searchVal_moveStorage").val(saveStorageForInit);
		$("#factoryTransferCheck_searchVal_itemcode").val();
		$("#factoryTransferCheck_searchVal_itemname").val();
		// =

		// 초기화 후 전체 데이터 다시 조회
		currentFactoryTransferCheckPage = 1;
		performFactoryTransferCheckDBSearch({ fromDate, toDate, factory, moveFactory });

		console.log('검색 조건이 초기화되었습니다.');
	}

	// 날짜 형식 변환 함수들
	function formatDateToYYYYMMDD(dateStr) {
		if (!dateStr) return '';
		return dateStr.replace(/-/g, '');
	}

	function formatDateFromYYYYMMDD(dateStr) {
		if (!dateStr || dateStr.length !== 8) return '';
		return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
	}

	// 유틸리티 함수들
	window.changeFactoryTransferCheckItemsPerPage = function(newItemsPerPage) {
		factoryTransferCheckItemsPerPage = newItemsPerPage;
		currentFactoryTransferCheckPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performFactoryTransferCheckDBSearch(searchCriteria);
	}

	window.exportFactoryTransferCheckData = function() {
		return {
			total: globalFactoryTransferCheckData.length,
			currentPage: currentFactoryTransferCheckPage,
			itemsPerPage: factoryTransferCheckItemsPerPage,
			data: globalFactoryTransferCheckData
		};
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

});
window.downloadAllFactoryTransferCheckData = function() {
	let moveStorage = '';
	if ($("#factoryTransferCheck_searchVal_moveStorage").val() == 'all') {
		moveStorage = '';
	} else {
		moveStorage = $("#factoryTransferCheck_searchVal_moveStorage").val();
	}

	let searchCriteria = {
		fromDate: $("#factoryTransferCheck_searchVal_fromDate").val(),
		toDate: $("#factoryTransferCheck_searchVal_toDate").val(),
		factory: $("#factoryTransferCheck_searchVal_factory").val(),
		moveFactory: $("#factoryTransferCheck_searchVal_moveFactory").val(),
		moveStorage: moveStorage,
		itemcode: $("#factoryTransferCheck_searchVal_itemcode").val().trim(),
		itemname: $("#factoryTransferCheck_searchVal_itemname").val().trim(),
		status: ($("#factoryTransferCheck_searchVal_status").val() || 'all') // ✅ 추가
	};

	showLoading("export");

	// ✅ 숫자 안전 변환
	function toNum(v) {
		if (v === null || v === undefined) return 0;
		const s = String(v).replace(/,/g, '').trim();
		if (!s) return 0;
		const n = Number(s);
		return Number.isFinite(n) ? n : 0;
	}

	$.ajax({
		url: "/read_factoryTransferCheck_all",
		type: "POST",
		data: JSON.stringify({ searchParams: searchCriteria }),
		contentType: "application/json",
		success: function(res) {
			console.log(res);

			// ✅ 서버 응답이 배열이든 {records:[]}든 모두 대응
			const rawRows = Array.isArray(res) ? res : (res.records || []);

			// ✅ 엑셀용 rows 가공: STATUS / SALTILLO_QTY / PUEBLA_QTY 생성
			const excelRows = rawRows.map(row => {
				const qty = toNum(row.QTY ?? row.qty);
				const sendingQty = toNum(row.SENDING_QTY ?? row.sending_qty);

				// 서버가 STATUS 주면 그걸 우선 사용
				let statusRaw = (row.STATUS ?? row.status ?? '').toString().trim().toUpperCase();

				// ✅ STATUS가 없으면 qty == sendingQty면 COMPLETE로 계산(원하시는 케이스 대응)
				if (!statusRaw) {
					statusRaw = (qty === sendingQty) ? 'COMPLETE' : 'CHECKING';
				}

				const statusText = (statusRaw === 'COMPLETE') ? 'Complete' : 'Checking';

				const moveFactory = (row.MOVEFACTORY ?? row.movefactory ?? '').toString().trim().toUpperCase();

				let saltilloQty = 0;
				let pueblaQty = 0;

				// 화면에서 쓰신 로직과 동일하게 맞춤
				if (moveFactory === 'SALTILLO') {
					saltilloQty = qty;
					pueblaQty = sendingQty;
				} else if (moveFactory === 'PUEBLA') {
					pueblaQty = qty;
					saltilloQty = sendingQty;
				} else {
					// 혹시 all/빈값이면 둘 다 0으로 둠 (필요하면 규칙 바꾸세요)
					saltilloQty = 0;
					pueblaQty = 0;
				}

				return {
					...row,
					STATUS: statusText,
					SALTILLO_QTY: saltilloQty,
					PUEBLA_QTY: pueblaQty
				};
			});

			ExcelExporter.downloadExcel(excelRows, window.factoryTransferCheckColumns, {
				fileName: 'FactoryTransferCheck_All',
				sheetName: 'FactoryTransferCheck'
			});

			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};


