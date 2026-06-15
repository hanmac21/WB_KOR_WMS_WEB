/* --------------------------------------------------------------
 * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * 
 * DB 검색 버전 초기 세팅 파일
 * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
 * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
 * 
 * 1. 메뉴명 m5_qualityDefect_detail 을 전부 사용하는 메뉴명으로 Replace
 * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : qualityDefectDetail -> newMenuName
 * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : QualityDefectDetail -> NewMenuName
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

	let globalQualityDefectDetailData = []; // 현재 조회된 데이터 저장
	let currentQualityDefectDetailPage = 1; // 현재 페이지
	let qualityDefectDetailItemsPerPage = 1000; // 페이지당 항목 수
	let totalQualityDefectDetailCount = 0; // 서버에서 받은 총 개수 저장
	let totalQualityDefectDetailQty = 0; // 서버에서 받은 총 개수 저장
	let totalQualityDefectDetailPages = 0; // 서버에서 받은 총 페이지
	window.filteredQualityDefectDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.qualityDefectDetailColumns = [
		{ key: 'SDATE', header: 'sdate' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'LOGINID', header: 'loginid' },
		{ key: 'TIME', header: 'time' },
		{ key: 'BARCODE', header: 'barcode' },
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m5_qualityDefect_detail = function(menuId) {
		showLoading("data");
		const { fromDate, toDate } = getDefaultDateRange();
		
		const factory = getCookie('selectedFactory');

		// 초기 로딩: 기본 날짜 범위로 조회
		performQualityDefectDetailDBSearch({ fromDate, toDate, factory });
	}

	// DB에서 데이터 조회하는 함수
	function performQualityDefectDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_qualityDefectDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentQualityDefectDetailPage,
				itemsPerPage: qualityDefectDetailItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalQualityDefectDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalQualityDefectDetailCount = data.totalCount || 0;
				totalQualityDefectDetailQty = data.totalQty || 0;
				totalQualityDefectDetailPages = data.totalPages || 0;
				currentQualityDefectDetailPage = data.currentPage || 0;
				window.filteredQualityDefectDetailData = globalQualityDefectDetailData;
				
				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m5_qualityDefect_detail').length) {
					renderQualityDefectDetailView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderQualityDefectDetailTableData();
					renderQualityDefectDetailPagination();
					updateQualityDefectDetailTotalCount();
					updateQualityDefectDetailTotalQty();
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
	function renderQualityDefectDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_m5_qualityDefect_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
								<input type="date" id="qualityDefectDetail_searchVal_fromDate" /> 
							</div>
							<div class="search-label">
								<div class="searchVal_toDate">　</div>
								<input type="date" id="qualityDefectDetail_searchVal_toDate" />
							</div>
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="qualityDefectDetail_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="qualityDefectDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="qualityDefectDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="qualityDefectDetail_searchVal_itemname" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnQualityDefectDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary QualityDefectDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="qualityDefectDetailTotalCount">${totalQualityDefectDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="qualityDefectDetailCurrentPageInfo">${currentQualityDefectDetailPage}</strong>/<strong id="qualityDefectDetailTotalPageInfo">${totalQualityDefectDetailPages}</strong> | 
								${i18n.t('table.info.qty')} : <strong id = "qualityDefectDetailTotalQty"></strong>
							</span>
							<div class="action-buttons-right m5_qualityDefect_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="qualityDefectDetailExcelBtn" onclick="downloadAllQualityDefectDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m5_qualityDefect_detail">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameMedVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "loginidVal">${i18n.t('search.user')}<!-- loginid --></th>
									<th class = "timeVal">${i18n.t('table.time')}<!-- TIME --></th>
									<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
								</tr>
							</thead>
							<tbody id="qualityDefectDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="qualityDefectDetailPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		// = 위에 data-table, search-row i18n 부분 추가
		/*<button class="btn btn-success" id="qualityDefectDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredQualityDefectDetailData, qualityDefectDetailColumns, {fileName:'QualityDefectDetail', sheetName:'QualityDefectDetail'})">Excel</button>*/
		/*$(".w_contentArea").append(content_output);

		// ⬇️ 추가: 화면에 기본 날짜 세팅
		(function(){
			const { fromDate, toDate } = getDefaultDateRange();
			$("#qualityDefectDetail_searchVal_fromDate").val(fromDate);
			$("#qualityDefectDetail_searchVal_toDate").val(toDate);
  		})();
		
		// 공장 및 창고 선택
		renderFactoryStorage();	
		// 테이블 데이터 렌더링
		renderQualityDefectDetailTableData();
		// 페이지네이션 렌더링
		renderQualityDefectDetailPagination();
		// 이벤트 바인딩
		bindQualityDefectDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateQualityDefectDetailTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateQualityDefectDetailTotalQty();

	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const factory = $('#qualityDefectDetail_searchVal_factory');
	    const savedFactory = getCookie('selectedFactory');

	    // 저장된 공장 선택
	    if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
	        factory.val(savedFactory);
	    }	    
	}
	
	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	    return match ? decodeURIComponent(match[2]) : '';
	}
	
	// 총 개수를 업데이트하는 함수
	function updateQualityDefectDetailTotalCount() {
		$('#qualityDefectDetailTotalCount').text(Number(totalQualityDefectDetailCount).toLocaleString());
	}
	// 총 개수를 업데이트하는 함수
	function updateQualityDefectDetailTotalQty() {
		$('#qualityDefectDetailTotalQty').text(totalQualityDefectDetailQty.toLocaleString());
	}
	function renderQualityDefectDetailTableData() {
		let tableBody = "";

		//console.log("globalQualityDefectDetailData:", globalQualityDefectDetailData);
		//console.log("데이터 개수:", globalQualityDefectDetailData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalQualityDefectDetailData.length; i++) {
			let rowNumber = (currentQualityDefectDetailPage - 1) * qualityDefectDetailItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalQualityDefectDetailData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "dateVal">${globalQualityDefectDetailData[i].SDATE || globalQualityDefectDetailData[i].sdate || ''}</td>
				<td class = "factoryVal">${globalQualityDefectDetailData[i].FACTORY || globalQualityDefectDetailData[i].factory || ''}</td>
				<td class = "carVal">${globalQualityDefectDetailData[i].CAR || globalQualityDefectDetailData[i].car || ''}</td>
				<td class = "itemcodeVal">${globalQualityDefectDetailData[i].ITEMCODE || globalQualityDefectDetailData[i].itemcode || ''}</td>
				<td class = "itemnameMedVal">${globalQualityDefectDetailData[i].ITEMNAME || globalQualityDefectDetailData[i].itemname || ''}</td>
				<td class = "qtyVal">${Number(globalQualityDefectDetailData[i].QTY || globalQualityDefectDetailData[i].qty || 0).toLocaleString()}</td>
				<td class = "loginidVal">${globalQualityDefectDetailData[i].LOGINID || globalQualityDefectDetailData[i].loginid || ''}</td>
				<td class = "timeVal">${globalQualityDefectDetailData[i].TIME || globalQualityDefectDetailData[i].time || ''}</td>
				<td class = "barcodeVal">${globalQualityDefectDetailData[i].BARCODE || globalQualityDefectDetailData[i].barcode || ''}</td>
            </tr>
        `;
		}
		// =
		//console.log("생성된 tableBody:", tableBody);
		$("#qualityDefectDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderQualityDefectDetailPagination() {
		let totalPages = Math.ceil(totalQualityDefectDetailCount / qualityDefectDetailItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentQualityDefectDetailPage > 1) {
			paginationHtml += `<button class="qualityDefectDetail-page-btn" data-page="${currentQualityDefectDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="qualityDefectDetail-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentQualityDefectDetailPage - 5);
		let endPage = Math.min(totalPages, currentQualityDefectDetailPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="qualityDefectDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentQualityDefectDetailPage) {
				paginationHtml += `<button class="qualityDefectDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="qualityDefectDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="qualityDefectDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentQualityDefectDetailPage < totalPages) {
			paginationHtml += `<button class="qualityDefectDetail-page-btn" data-page="${currentQualityDefectDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="qualityDefectDetail-page-btn disabled">&gt;</button>`;
		}

		$('#qualityDefectDetailTotalPageInfo').text(totalPages);
		$("#qualityDefectDetailPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindQualityDefectDetailEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnQualityDefectDetailSearch").off('click').on('click', function() {
			performQualityDefectDetailSearch();
		});

		// 초기화 버튼 클릭
		$(".btnQualityDefectDetailSearchInit").off('click').on('click', function() {
			resetQualityDefectDetailSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.qualityDefectDetail-page-btn').on('click', '.qualityDefectDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentQualityDefectDetailPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performQualityDefectDetailDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m5_qualityDefect_detail input[type="text"], #view_m5_qualityDefect_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performQualityDefectDetailSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			fromDate: $("#qualityDefectDetail_searchVal_fromDate").val(),
			toDate: $("#qualityDefectDetail_searchVal_toDate").val(),
			factory : $("#qualityDefectDetail_searchVal_factory").val(),
			car : $("#qualityDefectDetail_searchVal_car").val().trim(),
			itemcode : $("#qualityDefectDetail_searchVal_itemcode").val().trim(),
			itemname: $("#qualityDefectDetail_searchVal_itemname").val().trim()
		};
	}
	// =
	// 검색 수행 함수 - DB 조회
	function performQualityDefectDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentQualityDefectDetailPage = 1;
		performQualityDefectDetailDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetQualityDefectDetailSearch() {
		const { fromDate, toDate } = getDefaultDateRange();
		const factory = getCookie('selectedFactory');
		
		$("#qualityDefectDetail_searchVal_fromDate").val(fromDate);
		$("#qualityDefectDetail_searchVal_toDate").val(toDate);
		$("#qualityDefectDetail_searchVal_factory").val(factory);
		$("#qualityDefectDetail_searchVal_car").val(''); 
		$("#qualityDefectDetail_searchVal_itemcode").val(''); 
		$("#qualityDefectDetail_searchVal_itemname").val(''); 
		// =
		// 초기화 후 전체 데이터 다시 조회
		currentQualityDefectDetailPage = 1;
		performQualityDefectDetailDBSearch({ fromDate, toDate, factory });

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
	window.changeQualityDefectDetailItemsPerPage = function(newItemsPerPage) {
		qualityDefectDetailItemsPerPage = newItemsPerPage;
		currentQualityDefectDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performQualityDefectDetailDBSearch(searchCriteria);
	}

	window.exportQualityDefectDetailData = function() {
		return {
			total: globalQualityDefectDetailData.length,
			currentPage: currentQualityDefectDetailPage,
			itemsPerPage: qualityDefectDetailItemsPerPage,
			data: globalQualityDefectDetailData
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
window.downloadAllQualityDefectDetailData = function() {
	let searchCriteria = {
		fromDate : $("#qualityDefectDetail_searchVal_fromDate").val(),
		toDate : $("#qualityDefectDetail_searchVal_toDate").val(),
		factory : $("#qualityDefectDetail_searchVal_factory").val(),
		car : $("#qualityDefectDetail_searchVal_car").val().trim(),
		itemcode : $("#qualityDefectDetail_searchVal_itemcode").val().trim(),
		itemname: $("#qualityDefectDetail_searchVal_itemname").val().trim()
	};
	// =

	showLoading("export");

	$.ajax({
		url: "/read_qualityDefectDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.qualityDefectDetailColumns, {
				fileName: 'QualityDefectDetail_All',
				sheetName: 'QualityDefectDetail'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};*/

