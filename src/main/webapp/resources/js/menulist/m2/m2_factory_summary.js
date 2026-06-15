/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_factory_summary 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : factorySummary -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : FactorySummary -> NewMenuName
 * 4. 표시된 오류 및 = 부분 수정
 * 5. AJAX 호출명 따라 백단 코드 생성
 * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
 * 
 * 백단 참고사항
 * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경  
 * 
 * 아래 Document Ready 부터 복 붙
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalFactorySummaryData = []; // 현재 조회된 데이터 저장
	let currentFactorySummaryPage = 1; // 현재 페이지
	let factorySummaryItemsPerPage = 1000; // 페이지당 항목 수
	let totalFactorySummaryCount = 0; // 서버에서 받은 총 개수 저장
	let totalFactorySummaryQty = 0; // 서버에서 받은 총 개수 저장
	let totalFactorySummaryPages = 0; // 서버에서 받은 총 페이지
	window.filteredFactorySummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.factorySummaryColumns = [
		{ key: 'SDATE', header: 'sdate' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_factory_summary = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		
		const factory = getCookie('selectedFactory');

	    const movefactory = factory === 'SALTILLO' ? 'PUEBLA' : factory === 'PUEBLA' ? 'SALTILLO' : 'all';
		
		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performFactorySummaryDBSearch({ fromDate, toDate, factory, movefactory });
	}

	// DB에서 데이터 조회하는 함수
	function performFactorySummaryDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_factorySummary",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentFactorySummaryPage,
				itemsPerPage: factorySummaryItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalFactorySummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalFactorySummaryCount = data.totalCount || 0;
				totalFactorySummaryQty = data.totalQty || 0;
				totalFactorySummaryPages = data.totalPages || 0;
				currentFactorySummaryPage = data.currentPage || 0;
				window.filteredFactorySummaryData = globalFactorySummaryData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_factory_summary').length) {
					renderFactorySummaryView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderFactorySummaryTableData();
					renderFactorySummaryPagination();
					updateFactorySummaryTotalCount();
					updateFactorySummaryTotalQty();
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
	function renderFactorySummaryView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_factory_summary">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="factorySummary_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="factorySummary_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="factorySummary_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory.to')}<!-- FACTORY --></div>
								<select id="factorySummary_searchVal_movefactory" >
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="factorySummary_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="factorySummary_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="factorySummary_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnFactorySummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnFactorySummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="factorySummaryTotalCount">${totalFactorySummaryCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="factorySummaryCurrentPageInfo">${currentFactorySummaryPage}</strong>/<strong id="factorySummaryTotalPageInfo">${totalFactorySummaryPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "factorySummaryTotalQty"></strong>
							</span>
							<div class="action-buttons-right m2_factory_summary">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="factorySummaryExcelBtn" onclick="downloadAllFactorySummaryData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_factory_summary">
							<thead>
								<tr>
									<th>${i18n.t('table.no')}<!-- No --></th>
									<th>${i18n.t('search.date')}<!-- DATE --></th>
									<th>${i18n.t('search.car')}<!-- CAR --></th>
									<th>${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th>${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th>${i18n.t('search.qty')}<!-- QTY --></th>
								</tr>
							</thead>
							<tbody id="factorySummaryTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="factorySummaryPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		// = 위에 data-table, search-row i18n 부분 추가
		/*<button class="btn btn-success" id="factorySummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredFactorySummaryData, factorySummaryColumns, {fileName:'FactorySummary', sheetName:'FactorySummary'})">Excel</button>*/
		$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function(){
			const { fromDate, toDate } = getDefaultDateRange();
			$("#factorySummary_searchVal_fromDate").val(fromDate);
			$("#factorySummary_searchVal_toDate").val(toDate);
  		})();

		// 공장 및 창고 선택
		renderFactoryStorage();		
		// 테이블 데이터 렌더링
		renderFactorySummaryTableData();
		// 페이지네이션 렌더링
		renderFactorySummaryPagination();
		// 이벤트 바인딩
		bindFactorySummaryEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateFactorySummaryTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateFactorySummaryTotalQty();

	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const factory = $('#factorySummary_searchVal_factory');
	    const moveFactory = $('#factorySummary_searchVal_movefactory');
	    const savedFactory = getCookie('selectedFactory');

	    // 저장된 공장 선택
	    if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
	        factory.val(savedFactory);
	    }
	    
	    const cur = (factory.val() || '').toString();
	    moveFactory.val(cur === 'SALTILLO' ? 'PUEBLA' : cur === 'PUEBLA' ? 'SALTILLO' : 'all');
	    
	    // 공장 변경 시 공장 업데이트
	    factory.on('change', function() {
	        const v = ($(this).val() || '').toString();
	        moveFactory.val(v === "SALTILLO" ? 'PUEBLA' : v === 'PUEBLA' ? 'SALTILLO' : 'all');
	    });
	}
	
	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	    return match ? decodeURIComponent(match[2]) : '';
	}
	
	// 총 개수를 업데이트하는 함수
	function updateFactorySummaryTotalCount() {
		$('#factorySummaryTotalCount').text(totalFactorySummaryCount);
	}
	// 총 개수를 업데이트하는 함수
	function updateFactorySummaryTotalQty() {
		$('#factorySummaryTotalQty').text(totalFactorySummaryQty.toLocaleString());
	}
	function renderFactorySummaryTableData() {
		let tableBody = "";

		//console.log("globalFactorySummaryData:", globalFactorySummaryData);
		//console.log("데이터 개수:", globalFactorySummaryData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalFactorySummaryData.length; i++) {
			let rowNumber = (currentFactorySummaryPage - 1) * factorySummaryItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalFactorySummaryData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
                <td>${rowNumber}</td>
                <td>${globalFactorySummaryData[i].SDATE || globalFactorySummaryData[i].sdate || ''}</td>
				<td>${globalFactorySummaryData[i].CAR || globalFactorySummaryData[i].car || ''}</td>
				<td>${globalFactorySummaryData[i].ITEMCODE || globalFactorySummaryData[i].itemcode || ''}</td>
				<td>${globalFactorySummaryData[i].ITEMNAME || globalFactorySummaryData[i].itemname || ''}</td>
				<td>${globalFactorySummaryData[i].QTY || globalFactorySummaryData[i].qty || ''}</td>
            </tr>
        `;
		}
		// =
		//console.log("생성된 tableBody:", tableBody);
		$("#factorySummaryTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderFactorySummaryPagination() {
		let totalPages = Math.ceil(totalFactorySummaryCount / factorySummaryItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentFactorySummaryPage > 1) {
			paginationHtml += `<button class="factorySummary-page-btn" data-page="${currentFactorySummaryPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factorySummary-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentFactorySummaryPage - 5);
		let endPage = Math.min(totalPages, currentFactorySummaryPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="factorySummary-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentFactorySummaryPage) {
				paginationHtml += `<button class="factorySummary-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factorySummary-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factorySummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentFactorySummaryPage < totalPages) {
			paginationHtml += `<button class="factorySummary-page-btn" data-page="${currentFactorySummaryPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factorySummary-page-btn disabled">&gt;</button>`;
		}

		$('#factorySummaryTotalPageInfo').text(totalPages);
		$("#factorySummaryPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindFactorySummaryEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnFactorySummarySearch").off('click').on('click', function() {
			performFactorySummarySearch();
		});

		// 초기화 버튼 클릭
		$(".btnFactorySummarySearchInit").off('click').on('click', function() {
			resetFactorySummarySearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.factorySummary-page-btn').on('click', '.factorySummary-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentFactorySummaryPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performFactorySummaryDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_factory_summary input[type="text"], #view_m2_factory_summary input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performFactorySummarySearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#factorySummary_searchVal_fromDate").val(),
			toDate: $("#factorySummary_searchVal_toDate").val(),
			factory : $("#factorySummary_searchVal_factory").val(),
			movefactory : $("#factorySummary_searchVal_movefactory").val(),
			car : $("#factorySummary_searchVal_car").val().trim(),
			itemcode : $("#factorySummary_searchVal_itemcode").val().trim(),
			itemname: $("#factorySummary_searchVal_itemname").val().trim()
		};
	}
	// =
	// 검색 수행 함수 - DB 조회
	function performFactorySummarySearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentFactorySummaryPage = 1;
		performFactorySummaryDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetFactorySummarySearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
	    const movefactory = factory === 'SALTILLO' ? 'PUEBLA' : factory === 'PUEBLA' ? 'SALTILLO' : 'all';
	    
		$("#factorySummary_searchVal_fromDate").val(fromDate);
		$("#factorySummary_searchVal_toDate").val(toDate);
		$("#factorySummary_searchVal_factory").val(factory); 
		$("#factorySummary_searchVal_movefactory").val(movefactory); 
		$("#factorySummary_searchVal_car").val(''); 
		$("#factorySummary_searchVal_itemcode").val(''); 
		$("#factorySummary_searchVal_itemname").val(''); 
		// =
		// 초기화 후 전체 데이터 다시 조회
		currentFactorySummaryPage = 1;
		performFactorySummaryDBSearch({ fromDate, toDate, factory, movefactory });

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
	window.changeFactorySummaryItemsPerPage = function(newItemsPerPage) {
		factorySummaryItemsPerPage = newItemsPerPage;
		currentFactorySummaryPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performFactorySummaryDBSearch(searchCriteria);
	}

	window.exportFactorySummaryData = function() {
		return {
			total: globalFactorySummaryData.length,
			currentPage: currentFactorySummaryPage,
			itemsPerPage: factorySummaryItemsPerPage,
			data: globalFactorySummaryData
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
window.downloadAllFactorySummaryData = function() {
	let searchCriteria = {
		fromDate : $("#factorySummary_searchVal_fromDate").val(),
		toDate : $("#factorySummary_searchVal_toDate").val(),
		movefactory : $("#factorySummary_searchVal_movefactory").val(),
		car : $("#factorySummary_searchVal_car").val().trim(),
		itemcode : $("#factorySummary_searchVal_itemcode").val().trim(),
		itemname: $("#factorySummary_searchVal_itemname").val().trim()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_factorySummary_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.factorySummaryColumns, {
				fileName: 'FactorySummary_All',
				sheetName: 'FactorySummary'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

