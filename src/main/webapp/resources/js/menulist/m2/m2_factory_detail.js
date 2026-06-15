/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m2_factory_detail 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : factoryDetail -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : FactoryDetail -> NewMenuName
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

	let globalFactoryDetailData = []; // 현재 조회된 데이터 저장
	let currentFactoryDetailPage = 1; // 현재 페이지
	let factoryDetailItemsPerPage = 1000; // 페이지당 항목 수
	let totalFactoryDetailCount = 0; // 서버에서 받은 총 개수 저장
	let totalFactoryDetailQty = 0; // 서버에서 받은 총 개수 저장
	let totalFactoryDetailPages = 0; // 서버에서 받은 총 페이지
	window.filteredFactoryDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.factoryDetailColumns = [
		{ key: 'SDATE', header: 'sdate' },
		{ key: 'CONFITMYN', header: 'confirmyn' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'MOVEFACTORY', header: 'movefactory' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'OUTQTY', header: 'outqty' },
		{ key: 'INQTY', header: 'inqty' },
		{ key: 'LOT', header: 'lot' },
		{ key: 'SEQ', header: 'seq' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'UESRNAME', header: 'username' },
		{ key: 'YMDHMS', header: 'ymdhms' },
		{ key: 'UESRNAME', header: 'username' },
		{ key: 'YMDHMS', header: 'ymdhms' },
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_factory_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		
		const factory = getCookie('selectedFactory');

	    const movefactory = factory === 'SALTILLO' ? 'PUEBLA' : factory === 'PUEBLA' ? 'SALTILLO' : 'all';
		
		// 초기 로딩: 기본 날짜 범위, 공장으로 조회
		performFactoryDetailDBSearch({ fromDate, toDate, factory, movefactory });
	}

	// DB에서 데이터 조회하는 함수
	function performFactoryDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_factoryDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentFactoryDetailPage,
				itemsPerPage: factoryDetailItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalFactoryDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalFactoryDetailCount = data.totalCount || 0;
				totalFactoryDetailQty = data.totalQty || 0;
				totalFactoryDetailPages = data.totalPages || 0;
				currentFactoryDetailPage = data.currentPage || 0;
				window.filteredFactoryDetailData = globalFactoryDetailData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_factory_detail').length) {
					renderFactoryDetailView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderFactoryDetailTableData();
					renderFactoryDetailPagination();
					updateFactoryDetailTotalCount();
					updateFactoryDetailTotalQty();
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
	function renderFactoryDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_factory_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="factoryDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="factoryDetail_searchVal_toDate" />
							</div>
							<div class="search-label m2_factory_detail">
								<div class="search_factoryDetailCondition">${i18n.t('search.input.status')}<!-- 불출상태 --></div>
								<select id="factoryDetail_searchVal_Condition" >
									<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="N">${i18n.t('search.input.waiting')}<!-- 불출 대기중 --></option>
									<option value="Y">${i18n.t('search.input.completed')}<!-- 불출 완료 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="factoryDetail_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory.to')}<!-- FACTORY --></div>
								<select id="factoryDetail_searchVal_movefactory" >
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="factoryDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="factoryDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="factoryDetail_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnFactoryDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnFactoryDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="factoryDetailTotalCount">${totalFactoryDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="factoryDetailCurrentPageInfo">${currentFactoryDetailPage}</strong>/<strong id="factoryDetailTotalPageInfo">${totalFactoryDetailPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "factoryDetailTotalQty"></strong>
							</span>
							<div class="action-buttons-right m2_factory_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="factoryDetailExcelBtn" onclick="downloadAllFactoryDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_factory_detail">
							<thead>
								<tr>
									<th>${i18n.t('table.no')}<!-- No --></th>
									<th>${i18n.t('search.date')}<!-- DATE --></th>
									<th>${i18n.t('search.confirmyn')}<!-- CONFIRMYN --></th>
									<th>${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th>${i18n.t('search.factory.to')}<!-- TO FACTORY --></th>
									<th>${i18n.t('search.car')}<!-- CAR --></th>
									<th>${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th>${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th>${i18n.t('search.qty.out')}<!-- OUTQTY --></th>
									<th>${i18n.t('search.qty.in')}<!-- INQTY --></th>
									<th>${i18n.t('table.lot')}<!-- LOT --></th>
									<th>${i18n.t('table.seq')}<!-- SEQ --></th>
									<th>${i18n.t('search.location')}<!-- LOCATION --></th>
									<th>${i18n.t('search.userName')}<!-- USER --></th>
									<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
									<th>${i18n.t('search.userName')}<!-- USER --></th>
									<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
								</tr>
							</thead>
							<tbody id="factoryDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="factoryDetailPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		// = 위에 data-table, search-row i18n 부분 추가
		/*<button class="btn btn-success" id="factoryDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredFactoryDetailData, factoryDetailColumns, {fileName:'FactoryDetail', sheetName:'FactoryDetail'})">Excel</button>*/
		$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function(){
			const { fromDate, toDate } = getDefaultDateRange();
			$("#factoryDetail_searchVal_fromDate").val(fromDate);
			$("#factoryDetail_searchVal_toDate").val(toDate);
  		})();

		// 공장 및 창고 선택
		renderFactoryStorage();		
		// 테이블 데이터 렌더링
		renderFactoryDetailTableData();
		// 페이지네이션 렌더링
		renderFactoryDetailPagination();
		// 이벤트 바인딩
		bindFactoryDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateFactoryDetailTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateFactoryDetailTotalQty();

	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const factory = $('#factoryDetail_searchVal_factory');
	    const moveFactory = $('#factoryDetail_searchVal_movefactory');
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
	function updateFactoryDetailTotalCount() {
		$('#factoryDetailTotalCount').text(totalFactoryDetailCount);
	}
	// 총 개수를 업데이트하는 함수
	function updateFactoryDetailTotalQty() {
		$('#factoryDetailTotalQty').text(totalFactoryDetailQty.toLocaleString());
	}
	function renderFactoryDetailTableData() {
		let tableBody = "";

		//console.log("globalFactoryDetailData:", globalFactoryDetailData);
		//console.log("데이터 개수:", globalFactoryDetailData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalFactoryDetailData.length; i++) {
			let rowNumber = (currentFactoryDetailPage - 1) * factoryDetailItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalFactoryDetailData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
                <td>${rowNumber}</td>
                <td>${globalFactoryDetailData[i].SDATE || globalFactoryDetailData[i].sdate || ''}</td>
				<td>${globalFactoryDetailData[i].CONFIRMYN || globalFactoryDetailData[i].confirmyn || ''}</td>
				<td>${globalFactoryDetailData[i].FACTORY || globalFactoryDetailData[i].factory || ''}</td>
				<td>${globalFactoryDetailData[i].MOVEFACTORY || globalFactoryDetailData[i].movefactory || ''}</td>
				<td>${globalFactoryDetailData[i].CAR || globalFactoryDetailData[i].car || ''}</td>
				<td>${globalFactoryDetailData[i].ITEMCODE || globalFactoryDetailData[i].itemcode || ''}</td>
				<td>${globalFactoryDetailData[i].ITEMNAME || globalFactoryDetailData[i].itemname || ''}</td>
				<td>${globalFactoryDetailData[i].OUTQTY || globalFactoryDetailData[i].outqty || ''}</td>
				<td>${globalFactoryDetailData[i].INQTY || globalFactoryDetailData[i].inqty || ''}</td>
				<td></td><!-- LOT -->
				<td></td><!-- NO -->
				<td>${globalFactoryDetailData[i].LOCATION || globalFactoryDetailData[i].location || ''}</td>
				<td>${globalFactoryDetailData[i].USERNAME || globalFactoryDetailData[i].username || ''}</td>
				<td>${globalFactoryDetailData[i].YMDHMS || globalFactoryDetailData[i].ymdhms || ''}</td>
				<td>${globalFactoryDetailData[i].USERNAME || globalFactoryDetailData[i].username || ''}</td>
				<td>${globalFactoryDetailData[i].YMDHMS_C || globalFactoryDetailData[i].ymdhms_c || ''}</td>
            </tr>
        `;
		}
		// =
		//console.log("생성된 tableBody:", tableBody);
		$("#factoryDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderFactoryDetailPagination() {
		let totalPages = Math.ceil(totalFactoryDetailCount / factoryDetailItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentFactoryDetailPage > 1) {
			paginationHtml += `<button class="factoryDetail-page-btn" data-page="${currentFactoryDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="factoryDetail-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentFactoryDetailPage - 5);
		let endPage = Math.min(totalPages, currentFactoryDetailPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="factoryDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentFactoryDetailPage) {
				paginationHtml += `<button class="factoryDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="factoryDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="factoryDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentFactoryDetailPage < totalPages) {
			paginationHtml += `<button class="factoryDetail-page-btn" data-page="${currentFactoryDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="factoryDetail-page-btn disabled">&gt;</button>`;
		}

		$('#factoryDetailTotalPageInfo').text(totalPages);
		$("#factoryDetailPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindFactoryDetailEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnFactoryDetailSearch").off('click').on('click', function() {
			performFactoryDetailSearch();
		});

		// 초기화 버튼 클릭
		$(".btnFactoryDetailSearchInit").off('click').on('click', function() {
			resetFactoryDetailSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.factoryDetail-page-btn').on('click', '.factoryDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentFactoryDetailPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performFactoryDetailDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_factory_detail input[type="text"], #view_m2_factory_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performFactoryDetailSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			confirm_yn : $("#factoryDetail_searchVal_Condition").val(),
			fromDate: $("#factoryDetail_searchVal_fromDate").val(),
			toDate: $("#factoryDetail_searchVal_toDate").val(),
			factory : $("#factoryDetail_searchVal_factory").val(),
			movefactory : $("#factoryDetail_searchVal_movefactory").val(),
			car : $("#factoryDetail_searchVal_car").val().trim(),
			itemcode : $("#factoryDetail_searchVal_itemcode").val().trim(),
			itemname: $("#factoryDetail_searchVal_itemname").val().trim()
		};
	}
	// =
	// 검색 수행 함수 - DB 조회
	function performFactoryDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentFactoryDetailPage = 1;
		performFactoryDetailDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetFactoryDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
	    const movefactory = factory === 'SALTILLO' ? 'PUEBLA' : factory === 'PUEBLA' ? 'SALTILLO' : 'all';
	    
	    $("#factoryDetail_searchVal_Condition").val(""),
		$("#factoryDetail_searchVal_fromDate").val(fromDate);
		$("#factoryDetail_searchVal_fromDate").val(fromDate);
		$("#factoryDetail_searchVal_toDate").val(toDate);
		$("#factoryDetail_searchVal_factory").val(factory); 
		$("#factoryDetail_searchVal_movefactory").val(movefactory); 
		$("#factoryDetail_searchVal_car").val(''); 
		$("#factoryDetail_searchVal_itemcode").val(''); 
		$("#factoryDetail_searchVal_itemname").val(''); 
		// =
		// 초기화 후 전체 데이터 다시 조회
		currentFactoryDetailPage = 1;
		performFactoryDetailDBSearch({ fromDate, toDate, factory, movefactory });

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
	window.changeFactoryDetailItemsPerPage = function(newItemsPerPage) {
		factoryDetailItemsPerPage = newItemsPerPage;
		currentFactoryDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performFactoryDetailDBSearch(searchCriteria);
	}

	window.exportFactoryDetailData = function() {
		return {
			total: globalFactoryDetailData.length,
			currentPage: currentFactoryDetailPage,
			itemsPerPage: factoryDetailItemsPerPage,
			data: globalFactoryDetailData
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
window.downloadAllFactoryDetailData = function() {
	let searchCriteria = {
		confirm_yn : $("#factoryDetail_searchVal_Condition").val(),
		fromDate : $("#factoryDetail_searchVal_fromDate").val(),
		toDate : $("#factoryDetail_searchVal_toDate").val(),
		factory : $("#factoryDetail_searchVal_factory").val(),
		movefactory : $("#factoryDetail_searchVal_movefactory").val(),
		car : $("#factoryDetail_searchVal_car").val().trim(),
		itemcode : $("#factoryDetail_searchVal_itemcode").val().trim(),
		itemname: $("#factoryDetail_searchVal_itemname").val().trim()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_factoryDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.factoryDetailColumns, {
				fileName: 'FactoryDetail_All',
				sheetName: 'FactoryDetail'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

