/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_unpack_summary 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : unpackSummary -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : UnpackSummary -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

/*$(document).ready(function() {

	let globalUnpackSummaryData = []; // 현재 조회된 데이터 저장
	let currentUnpackSummaryPage = 1; // 현재 페이지
	let unpackSummaryItemsPerPage = 1000; // 페이지당 항목 수
	let totalUnpackSummaryCount = 0; // 서버에서 받은 총 개수 저장
	let totalUnpackSummaryQty = 0; // 서버에서 받은 총 개수 저장
	let totalUnpackSummaryPages = 0; // 서버에서 받은 총 페이지
	window.filteredUnpackSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.unpackSummaryColumns = [
		{ key: 'SDATE', header: 'sdate' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' }, 
		{ key: 'PRINT_QTY', header: 'print_qty' }, 
		{ key: 'SCANQTY', header: 'scan_qty' }, 
		{ key: 'REMAINING_QTY', header: 'remaining_qty' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_unpack_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		
		const factory = getCookie('selectedFactory');
		
		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performUnpackSummaryDBSearch({ fromDate, toDate, factory });
	}

	// DB에서 데이터 조회하는 함수
	function performUnpackSummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_unpackSummary",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentUnpackSummaryPage,
				itemsPerPage: unpackSummaryItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalUnpackSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalUnpackSummaryCount = data.totalCount || 0;
				totalUnpackSummaryQty = data.totalQty || 0;
				totalUnpackSummaryPages = data.totalPages || 0;
				currentUnpackSummaryPage = data.currentPage || 0;
				window.filteredUnpackSummaryData = globalUnpackSummaryData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_unpack_summary').length) {
					renderUnpackSummaryView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderUnpackSummaryTableData();
					renderUnpackSummaryPagination();
					updateUnpackSummaryTotalCount();
					updateUnpackSummaryTotalQty();
				}

				hideLoading();
			},
			error: function(xhr, status, error) {
				console.error("DB 조회 실패:", error);
				 console.error('[WIP Return Detail][AJAX ERROR]',
					      { status, error, httpStatus: xhr.status, resp: xhr.responseText });
				hideLoading();
				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
			}
		});
	}

	// 사용자 뷰 렌더링 함수
	function renderUnpackSummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_unpack_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="unpackSummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="unpackSummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="unpackSummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="unpackSummary_searchVal_storage" >
									<option value="Material">Material</option>
									<option value="Fabric" >Fabric</option>
									<option value="Side seat" >Side seat</option>
									<option value="Outside" >Outside</option>
									<option value="PRODUCT" >PRODUCT</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="unpackSummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="unpackSummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="unpackSummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnUnpackSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnUnpackSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="unpackSummaryTotalCount">${totalUnpackSummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="unpackSummaryCurrentPageInfo">${currentUnpackSummaryPage}</strong>/<strong id="unpackSummaryTotalPageInfo">${totalUnpackSummaryPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "unpackSummaryTotalQty"></strong>
							</span>
							<div class="action-buttons-right m2_unpack_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="unpackSummaryExcelBtn" onclick="downloadAllUnpackSummaryData()">Excel</button>
								</div> 
							</div>
						</div>
						<table class="data-table m2_unpack_summary">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal">${i18n.t('table.date')}<!-- INDATE --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "scanqtyVal">${i18n.t('search.qty.print')}<!-- PRINT_QTY --></th>
									<th class = "scanqtyVal">${i18n.t('search.qty.scan')}<!-- SCAN_QTY --></th>
									<th class = "scanqtyVal">${i18n.t('search.qty.remain')}<!-- REMAIN_QTY --></th>
								</tr>
							</thead>
							<tbody id="unpackSummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="unpackSummaryPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		// = 위에 data-table, search-row i18n 부분 추가
		/*<button class="btn btn-success" id="unpackSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredUnpackSummaryData, unpackSummaryColumns, {fileName:'UnpackSummary', sheetName:'UnpackSummary'})">Excel</button>*/
		/*$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function(){
			const { fromDate, toDate } = getDefaultDateRange();
			$("#unpackSummary_searchVal_fromDate").val(fromDate);
			$("#unpackSummary_searchVal_toDate").val(toDate);
  		})();
		
		// 공장 및 창고 선택
		renderFactoryStorage();	
		// 테이블 데이터 렌더링
		renderUnpackSummaryTableData();
		// 페이지네이션 렌더링
		renderUnpackSummaryPagination();
		// 이벤트 바인딩
		bindUnpackSummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateUnpackSummaryTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateUnpackSummaryTotalQty();

	}

	// 공장 및 창고 선택
	function renderFactoryStorage() {
	    const factory = $('#unpackSummary_searchVal_factory');
	    const storage = $('#unpackSummary_searchVal_storage');
	    const savedFactory = getCookie('selectedFactory');

	    // 공장별 창고 옵션 설정
	    function updateStorageOptions(factoryValue) {
	        storage.empty();
	        
	        const options = {
	            'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'all'],
	            'PUEBLA': ['Material', 'PRODUCT', 'all'],
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
	    if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
	        factory.val(savedFactory);
	    }
	    
	    updateStorageOptions(savedFactory || '');

	    // 공장 변경 시 창고 업데이트
	    factory.on('change', function() {
	        updateStorageOptions($(this).val());
	    });
	    
	    window.autoSetStorageFields();
	}
	
	// 쿠키 가져오기
	function getCookie(cookieName) {
	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	    return match ? decodeURIComponent(match[2]) : '';
	}
	
	// 총 개수를 업데이트하는 함수
	function updateUnpackSummaryTotalCount() {
		$('#unpackSummaryTotalCount').text(totalUnpackSummaryCount);
	}
	// 총 개수를 업데이트하는 함수
	function updateUnpackSummaryTotalQty() {
		$('#unpackSummaryTotalQty').text(totalUnpackSummaryQty.toLocaleString());
	}
	function renderUnpackSummaryTableData() {
		let tableBody = "";

		//console.log("globalUnpackSummaryData:", globalUnpackSummaryData);
		//console.log("데이터 개수:", globalUnpackSummaryData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalUnpackSummaryData.length; i++) {
			let rowNumber = (currentUnpackSummaryPage - 1) * unpackSummaryItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalUnpackSummaryData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "dateVal">${globalUnpackSummaryData[i].SDATE || globalUnpackSummaryData[i].sdate || ''}</td>
				<td class = "factoryVal">${globalUnpackSummaryData[i].FACTORY || globalUnpackSummaryData[i].factory || ''}</td>
				<td class = "storageVal">${globalUnpackSummaryData[i].STORAGE || globalUnpackSummaryData[i].storage || ''}</td>
				<td class = "carVal">${globalUnpackSummaryData[i].CAR || globalUnpackSummaryData[i].car || ''}</td>
				<td class = "itemcodeVal">${globalUnpackSummaryData[i].ITEMCODE || globalUnpackSummaryData[i].itemcode || ''}</td>
				<td class = "itemnameVal">${globalUnpackSummaryData[i].ITEMNAME || globalUnpackSummaryData[i].itemname || ''}</td>
				<td class = "qtyVal">${Number(globalUnpackSummaryData[i].QTY || globalUnpackSummaryData[i].qty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackSummaryData[i].PRINT_QTY || globalUnpackSummaryData[i].print_qty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackSummaryData[i].SCANQTY || globalUnpackSummaryData[i].scanqty || 0).toLocaleString()}</td>
				<td class = "scanqtyVal">${Number(globalUnpackSummaryData[i].REMAINING_QTY || globalUnpackSummaryData[i].remaining_qty || 0).toLocaleString()}</td>
            </tr>
        `;
		}
		// =
		//console.log("생성된 tableBody:", tableBody);
		$("#unpackSummaryTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderUnpackSummaryPagination() {
		let totalPages = Math.ceil(totalUnpackSummaryCount / unpackSummaryItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentUnpackSummaryPage > 1) {
			paginationHtml += `<button class="unpackSummary-page-btn" data-page="${currentUnpackSummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="unpackSummary-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentUnpackSummaryPage - 5);
		let endPage = Math.min(totalPages, currentUnpackSummaryPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="unpackSummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentUnpackSummaryPage) {
				paginationHtml += `<button class="unpackSummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="unpackSummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="unpackSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentUnpackSummaryPage < totalPages) {
			paginationHtml += `<button class="unpackSummary-page-btn" data-page="${currentUnpackSummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="unpackSummary-page-btn disabled">&gt;</button>`;
		}
		
		$('#unpackSummaryCurrentPageInfo').text(currentUnpackSummaryPage);
		$('#unpackSummaryTotalPageInfo').text(totalPages);
		$("#unpackSummaryPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindUnpackSummaryEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnUnpackSummarySearch").off('click').on('click', function() {
			performUnpackSummarySearch();
		});

		// 초기화 버튼 클릭
		$(".btnUnpackSummarySearchInit").off('click').on('click', function() {
			resetUnpackSummarySearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.unpackSummary-page-btn').on('click', '.unpackSummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentUnpackSummaryPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performUnpackSummaryDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_unpack_summary input[type="text"], #view_m2_unpack_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performUnpackSummarySearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#unpackSummary_searchVal_fromDate").val(),
			toDate: $("#unpackSummary_searchVal_toDate").val(),
			factory : $("#unpackSummary_searchVal_factory").val().trim(),
			storage : $("#unpackSummary_searchVal_storage").val().trim(),
			car : $("#unpackSummary_searchVal_car").val().trim().toUpperCase(),
			itemcode : $("#unpackSummary_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#unpackSummary_searchVal_itemname").val().trim().toUpperCase()
		};
	}
	// =
	// 검색 수행 함수 - DB 조회
	function performUnpackSummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentUnpackSummaryPage = 1;
		performUnpackSummaryDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetUnpackSummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
		$("#unpackSummary_searchVal_fromDate").val(fromDate);
		$("#unpackSummary_searchVal_toDate").val(toDate);
		$("#unpackSummary_searchVal_factory").val(factory); 
		$("#unpackSummary_searchVal_storage").val('Material'); 
		$("#unpackSummary_searchVal_car").val(''); 
		$("#unpackSummary_searchVal_itemcode").val(''); 
		$("#unpackSummary_searchVal_itemname").val(''); 
		// =
		// 초기화 후 전체 데이터 다시 조회
		currentUnpackSummaryPage = 1;
		performUnpackSummaryDBSearch({ fromDate, toDate, factory });

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
	window.changeUnpackSummaryItemsPerPage = function(newItemsPerPage) {
		unpackSummaryItemsPerPage = newItemsPerPage;
		currentUnpackSummaryPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performUnpackSummaryDBSearch(searchCriteria);
	}

	window.exportUnpackSummaryData = function() {
		return {
			total: globalUnpackSummaryData.length,
			currentPage: currentUnpackSummaryPage,
			itemsPerPage: unpackSummaryItemsPerPage,
			data: globalUnpackSummaryData
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
window.downloadAllUnpackSummaryData = function() {
	let searchCriteria = {
		fromDate : $("#unpackSummary_searchVal_fromDate").val(),
		toDate : $("#unpackSummary_searchVal_toDate").val(),
		factory : $("#unpackSummary_searchVal_factory").val(),
		storage : $("#unpackSummary_searchVal_storage").val(),
		car : $("#unpackSummary_searchVal_car").val().trim().toUpperCase(),
		itemcode : $("#unpackSummary_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#unpackSummary_searchVal_itemname").val().trim().toUpperCase()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_unpackSummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.unpackSummaryColumns, {
				fileName: 'UnpackSummary_All',
				sheetName: 'UnpackSummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};
*/
