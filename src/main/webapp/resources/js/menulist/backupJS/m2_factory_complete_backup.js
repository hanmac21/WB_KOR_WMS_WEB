/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_factory_complete 을 전부 사용하는 메뉴명으로 Replace
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

/*$(document).ready(function() {

	let globalFactoryCompleteData = []; // 현재 조회된 데이터 저장
	let currentFactoryCompletePage = 1; // 현재 페이지
	let factoryCompleteItemsPerPage = 1000; // 페이지당 항목 수
	let totalFactoryCompleteCount = 0; // 서버에서 받은 총 개수 저장
	let totalFactoryCompletePages = 0; // 서버에서 받은 총 페이지
	window.filteredFactoryCompleteData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.factoryCompleteColumns = [
		{ key: 'FROMFACTORY', header: 'sent factory' },
		{ key: 'FROMDATE', header: 'sent date' },
		{ key: 'TOFACTORY', header: 'received factory' },
		{ key: 'TODATE', header: 'received date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'FROMQTY', header: 'sent qty' },
		{ key: 'TOQTY', header: 'received qty' },
		{ key: 'BARCODE', header: 'lot' },
		{ key: 'TOSTORAGE', header: 'received storage' },
		{ key: 'COMPLETE', header: 'complete' }
		/*{ key: 'BDATE', header: 'lot' }, // =
		{ key: 'LOGINID', header: 'user' }, // =
		{ key: 'HHMM', header: 'hh:mm' } // =*/
	/*];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_factory_complete = function(menuId) {
		showLoading("data");

		const { fromDate, toDate } = getDefaultDateRange();

		const moveFactory = getCookie('selectedFactory');
		
		const factory = moveFactory === 'SALTILLO' ? 'PUEBLA' : moveFactory === 'PUEBLA' ? 'SALTILLO' : 'all';
		
		console.log("FACTORY - " + factory + " // Move - " + moveFactory);
		
		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performFactoryCompleteDBSearch({ fromDate, toDate, factory, moveFactory }); /* 자동으로 안들어감 확인 */
	/*}

	// DB에서 데이터 조회하는 함수
	function performFactoryCompleteDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_factoryComplete",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentFactoryCompletePage,
				itemsPerPage: factoryCompleteItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalFactoryCompleteData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalFactoryCompleteCount = data.totalCount || 0;
				totalFactoryCompletePages = data.totalPages || 0;
				currentFactoryCompletePage = data.currentPage || 0;
				window.filteredFactoryCompleteData = globalFactoryCompleteData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_factory_complete').length) {
					renderFactoryCompleteView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderFactoryCompleteTableData();
					renderFactoryCompletePagination();
					updateFactoryCompleteTotalCount();
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

	// 사용자 뷰 렌더링 함수
	function renderFactoryCompleteView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_factory_complete">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate"> ${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="factoryComplete_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="factoryComplete_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.sentfactory')}<!-- FACTORY --></div>
								<select id="factoryComplete_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_moveFactory">${i18n.t('search.receivefactory')}<!-- MOVE FACTORY --></div>
								<select id="factoryComplete_searchVal_moveFactory" >
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_moveStorage">${i18n.t('search.receivestorage')}<!-- MOVE STORAGE --></div>
								<select id="factoryComplete_searchVal_moveStorage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>							
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="factoryComplete_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="factoryComplete_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnFactoryCompleteSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnFactoryCompleteSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="factoryCompleteTotalCount">${totalFactoryCompleteCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="factoryCompleteCurrentPageInfo">${currentFactoryCompletePage}</strong>/<strong id="factoryCompleteTotalPageInfo">${Math.ceil(globalFactoryCompleteData.length / factoryCompleteItemsPerPage)}</strong> | 
							</span>
							<div class="action-buttons-right m2_factory_complete">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="factoryCompleteExcelBtn" onclick="downloadAllFactoryCompleteData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_factory_complete">
							<thead>
								<tr>
									<!--<th class = "checkboxVal"><input type="checkbox" class="inbound_chkAll"></th>-->
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "factoryVal-notarrived">${i18n.t('search.sentfactory')}<!-- 보낸 FACTORY --></th>
									<th class = "dateVal"> ${i18n.t('search.sentdate')}<!-- 보낸 SDATE --></th>
									<th class = "factoryVal-notarrived">${i18n.t('search.receivefactory')}<!-- 받은 MOVEFACTORY --></th>
									<th class = "dateVal"> ${i18n.t('search.receivedate')}<!-- 받은SDATE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty.out')}<!-- OUTQTY --></th>
									<th class = "qtyVal">${i18n.t('search.qty.in')}<!-- INQTY --></th>
									<th class = "barcodeVal">LOT<!-- LOT --></th>
									<!--<th class = "storageVal">${i18n.t('search.storage')} 보낸 STORAGE </th>-->
									<th class = "storageVal">${i18n.t('search.receivestorage')}<!--받은  MOVESTORAGE --></th>
									<th class = "carVal"><!-- LOT -->Complete</th>
									<th class = "carVal"><!-- LOT -->Check</th>
								</tr>
							</thead>
							<tbody id="factoryCompleteTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="factoryCompletePaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
/*									<th class = "lotVal">LOT<!--LOT --></th>
									<th class = "loginidVal">${i18n.t('search.user')}<!-- USER --></th>
									<th class = "hhmmVal">HH:MM<!-- HHMM --></th>*/
		// = 위에 data-table, search-row i18n 부분 추가
		/*<button class="btn btn-success" id="factoryCompleteExcelBtn" onclick="ExcelExporter.downloadExcel(filteredFactoryCompleteData, factoryCompleteColumns, {fileName:'FactoryComplete', sheetName:'FactoryComplete'})">Excel</button>*/
		/*$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function(){
			const { fromDate, toDate } = getDefaultDateRange();
			$("#factoryComplete_searchVal_fromDate").val(fromDate);
			$("#factoryComplete_searchVal_toDate").val(toDate);
  		})();
		
		// 공장 및 창고 선택
		renderFactoryStorage();	
		// 테이블 데이터 렌더링
		renderFactoryCompleteTableData();
		// 페이지네이션 렌더링
		renderFactoryCompletePagination();
		// 이벤트 바인딩
		bindFactoryCompleteEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateFactoryCompleteTotalCount();
	}
	
	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const factory = $('#factoryComplete_searchVal_factory');
	    const moveFactory = $('#factoryComplete_searchVal_moveFactory');
	    const storage = $('#factoryComplete_searchVal_moveStorage');
	    const savedFactory = getCookie('selectedFactory');

	    // 공장별 창고 옵션 설정
	    function updateStorageOptions(factoryValue) {
	        storage.empty();
	        
	        const options = {
	            'SALTILLO': ['all', 'Material', 'Fabric', 'Side seat', 'Outside'],
	            'PUEBLA': ['all', 'Material', 'PRODUCT'],
	            '': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'all']
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

	// 총 개수를 업데이트하는 함수
	function updateFactoryCompleteTotalCount() {
		$('#factoryCompleteTotalCount').text(totalFactoryCompleteCount.toLocaleString());
	}

	function renderFactoryCompleteTableData() {
		let tableBody = "";

		//console.log("globalFactoryCompleteData:", globalFactoryCompleteData);
		//console.log("데이터 개수:", globalFactoryCompleteData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalFactoryCompleteData.length; i++) {
			let rowNumber = (currentFactoryCompletePage - 1) * factoryCompleteItemsPerPage + i + 1;

			let statusText = globalFactoryCompleteData[i].CONFIRMYN === 'Y' ? '확정 완료' : '확정 대기중';
			let statusClass = globalFactoryCompleteData[i].CONFIRMYN === 'Y' ? 'status-completed' : 'status-waiting';
			

			let statusCompleteText = globalFactoryCompleteData[i].COMPLETEYN === 'Y' ? '이동 완료' : '이동 대기중';
			let statusCompleteClass = globalFactoryCompleteData[i].COMPLETEYN === 'Y' ? 'status-completed' : 'status-waiting';
			
			//console.log(`행 ${i}:`, globalFactoryCompleteData[i]); // 각 행 데이터 확인
			
			let fromQty = globalFactoryCompleteData[i].OUTQTY || globalFactoryCompleteData[i].outqty || 0;
			let toQty = globalFactoryCompleteData[i].INQTY || globalFactoryCompleteData[i].inqty || 0;
			
			// 계산 예시들:
			let totalQty = Number(fromQty) + Number(toQty);        // 합계
			let diffQty = Number(toQty) - Number(fromQty);         // 차이 (입고 - 출고)
			let netQty = Number(fromQty) - Number(toQty);          // 순 이동량 (출고 - 입고)
			let check = ""
			if(globalFactoryCompleteData[i].complete == 'O'){
				check= 'X'
			}else{
				check= 'O'
			}
			tableBody += `
            <tr>
				<!--<td class = "checkboxVal"><input type="checkbox" class="inbound_chk ${statusClass}" 
					data-iid="${globalFactoryCompleteData[i].MAX_IID}" 
					data-unique="${globalFactoryCompleteData[i].SDATE || ''}_${globalFactoryCompleteData[i].ITEMCODE || ''}_${globalFactoryCompleteData[i].QTY || ''}">
				</td>-->
                <td class = "noVal">${rowNumber}</td>
                <td class = "factoryVal-notarrived">${globalFactoryCompleteData[i].FROMFACTORY || globalFactoryCompleteData[i].fromfactory || ''}</td>
				<td class = "dateVal">${globalFactoryCompleteData[i].FROMDATE || globalFactoryCompleteData[i].fromdate || ''}</td>
				<td class = "factoryVal-notarrived">${globalFactoryCompleteData[i].TOFACTORY || globalFactoryCompleteData[i].tofactory || ''}</td>
				<td class = "dateVal">${globalFactoryCompleteData[i].TODATE || globalFactoryCompleteData[i].todate || ''}</td>
				<td class = "carVal">${globalFactoryCompleteData[i].CAR || globalFactoryCompleteData[i].car || ''}</td>
				<td class = "itemcodeVal">${globalFactoryCompleteData[i].ITEMCODE || globalFactoryCompleteData[i].itemcode || ''}</td>
				<td class = "itemnameVal">${globalFactoryCompleteData[i].ITEMNAME || globalFactoryCompleteData[i].itemname || ''}</td>
				<td class = "qtyVal">${Number(globalFactoryCompleteData[i].FROMQTY || globalFactoryCompleteData[i].fromqty || 0).toLocaleString()}</td>
				<td class = "qtyVal">${Number(globalFactoryCompleteData[i].TOQTY || globalFactoryCompleteData[i].toqty || 0).toLocaleString()}</td>
                <td class = "barcodeVal">${globalFactoryCompleteData[i].BARCODE || globalFactoryCompleteData[i].barcode || ''}</td>
				<td class = "storageVal">${globalFactoryCompleteData[i].TOSTORAGE || globalFactoryCompleteData[i].tostorage || ''}</td>
				<td class = "carVal">${globalFactoryCompleteData[i].COMPLETE || globalFactoryCompleteData[i].complete || ''}</td>
				<td class = "carVal">${check}</td>
            </tr>
        `;
		}
/*				<td class = "lotVal">${globalFactoryCompleteData[i].BDATE || globalFactoryCompleteData[i].bdate || ''}</td>
				<td class = "loginidVal">${globalFactoryCompleteData[i].LOGINID || globalFactoryCompleteData[i].loginid || ''}</td>
				<td class = "hhmmVal">${globalFactoryCompleteData[i].HHMM || globalFactoryCompleteData[i].hhmm || ''}</td>*/
		// =
		//console.log("생성된 tableBody:", tableBody);
		/*$("#factoryCompleteTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderFactoryCompletePagination() {
		let totalPages = Math.ceil(totalFactoryCompleteCount / factoryCompleteItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentFactoryCompletePage > 1) {
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="${currentFactoryCompletePage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryComplete-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentFactoryCompletePage - 5);
		let endPage = Math.min(totalPages, currentFactoryCompletePage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentFactoryCompletePage) {
				paginationHtml += `<button class="factoryComplete-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryComplete-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentFactoryCompletePage < totalPages) {
			paginationHtml += `<button class="factoryComplete-page-btn" data-page="${currentFactoryCompletePage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryComplete-page-btn disabled">&gt;</button>`;
		}

		$("#factoryCompleteCurrentPageInfo").html(currentFactoryCompletePage);
		$("#factoryCompleteTotalPageInfo").html(totalPages);
		$("#factoryCompletePaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindFactoryCompleteEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnFactoryCompleteSearch").off('click').on('click', function() {
			performFactoryCompleteSearch();
		});

		// 초기화 버튼 클릭
		$(".btnFactoryCompleteSearchInit").off('click').on('click', function() {
			resetFactoryCompleteSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.factoryComplete-page-btn').on('click', '.factoryComplete-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentFactoryCompletePage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performFactoryCompleteDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_factory_complete input[type="text"], #view_m2_factory_complete input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performFactoryCompleteSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		let moveStorage = '';
		if($("#factoryComplete_searchVal_moveStorage").val() == 'all'){
			moveStorage = '';
		}else{
			moveStorage = $("#factoryComplete_searchVal_moveStorage").val();
		}
		return {
			fromDate: $("#factoryComplete_searchVal_fromDate").val(),
			toDate: $("#factoryComplete_searchVal_toDate").val(),
			factory : $("#factoryComplete_searchVal_factory").val(),
			moveFactory : $("#factoryComplete_searchVal_moveFactory").val(),
			moveStorage : moveStorage,
			itemcode : $("#factoryComplete_searchVal_itemcode").val().trim(),
			itemname : $("#factoryComplete_searchVal_itemname").val().trim()
		};
	}
	// =
	// 검색 수행 함수 - DB 조회
	function performFactoryCompleteSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentFactoryCompletePage = 1;
		performFactoryCompleteDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetFactoryCompleteSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
	    const moveFactory = factory === 'SALTILLO' ? 'PUEBLA' : factory === 'PUEBLA' ? 'SALTILLO' : 'all';
		
		$("#factoryComplete_searchVal_fromDate").val(fromDate);
		$("#factoryComplete_searchVal_toDate").val(toDate);
		$("#factoryComplete_searchVal_factory").val(factory); 
		$("#factoryComplete_searchVal_moveFactory").val(moveFactory);
		$("#factoryComplete_searchVal_moveStorage").val('all');
		$("#factoryComplete_searchVal_itemcode").val();	
		$("#factoryComplete_searchVal_itemname").val();
		// =

		// 초기화 후 전체 데이터 다시 조회
		currentFactoryCompletePage = 1;
		performFactoryCompleteDBSearch({ fromDate, toDate, factory, moveFactory });

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
	window.changeFactoryCompleteItemsPerPage = function(newItemsPerPage) {
		factoryCompleteItemsPerPage = newItemsPerPage;
		currentFactoryCompletePage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performFactoryCompleteDBSearch(searchCriteria);
	}

	window.exportFactoryCompleteData = function() {
		return {
			total: globalFactoryCompleteData.length,
			currentPage: currentFactoryCompletePage,
			itemsPerPage: factoryCompleteItemsPerPage,
			data: globalFactoryCompleteData
		};
	}
	
	function fmtLocalDate(d){
		const y = d.getFullYear();
		const m = String(d.getMonth()+1).padStart(2,'0');
		const dd = String(d.getDate()).padStart(2,'0');
		return `${y}-${m}-${dd}`;
	}
	
	function getDefaultDateRange(){
		const today = new Date();
		const toDate = fmtLocalDate(today);
		const fromDate = fmtLocalDate(today);
		return { fromDate, toDate };
	}

});
window.downloadAllFactoryCompleteData = function() {
	let moveStorage = '';
	if($("#factoryComplete_searchVal_moveStorage").val() == 'all'){
		moveStorage = '';
	}else{
		moveStorage = $("#factoryComplete_searchVal_moveStorage").val();
	}
	let searchCriteria = {
		fromDate: $("#factoryComplete_searchVal_fromDate").val(),
		toDate: $("#factoryComplete_searchVal_toDate").val(),
		factory : $("#factoryComplete_searchVal_factory").val(),
		moveFactory : $("#factoryComplete_searchVal_moveFactory").val(),
		moveStorage :moveStorage,
		itemcode : $("#factoryComplete_searchVal_itemcode").val().trim(),
		itemname : $("#factoryComplete_searchVal_itemname").val().trim()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_factoryComplete_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.factoryCompleteColumns, {
				fileName: 'FactoryComplete_All',
				sheetName: 'FactoryComplete'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};*/

