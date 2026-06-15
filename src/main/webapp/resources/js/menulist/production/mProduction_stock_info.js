/* --------------------------------------------------------------
 * 📌 Purchase - Stock - Stock Detail
 * 비고: 
 * -------------------------------------------------------------- */


$(document).ready(function() {

	let globalProductionStockInfoData = []; // 현재 조회된 데이터 저장
	let currentProductionStockInfoPage = 1; // 현재 페이지
	let productionStockInfoItemsPerPage = 1000; // 페이지당 항목 수
	let totalProductionStockInfoCount = 0; // 서버에서 받은 총 개수 저장
	let totalProductionStockInfoQty = 0; // 서버에서 받은 총 개수 저장
	let totalProductionStockInfoPages = 0; // 서버에서 받은 총 페이지
	window.filteredProductionStockInfoData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.productionStockInfoColumns = [
		{ key: 'INDATE', header: 'indate' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'QTY', header: 'qty' },
		{ key: 'BARCODE', header: 'lot' },
	];


	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mProduction_stock_info = function(menuId) {		
		renderProductionStockInfoView();
	}

	// DB에서 데이터 조회하는 함수
	function performProductionStockInfoDBSearch(searchCriteria) {
		showLoading("data");
		
		$.ajax({
			url: "/read_productionStockInfo",
			type: "POST",
			data: JSON.stringify({
				barcode : $("#productionStockInfo_searchVal_barcode").val().trim(),
				searchParams: searchCriteria,
				page: currentProductionStockInfoPage,
				itemsPerPage: productionStockInfoItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalProductionStockInfoData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalProductionStockInfoCount = data.totalCount || 0;
				totalProductionStockInfoQty = data.totalQty || 0;
				totalProductionStockInfoPages = data.totalPages || 0;
				currentProductionStockInfoPage = data.currentPage || 0;
				window.filteredProductionStockInfoData = globalProductionStockInfoData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_mProduction_stock_info').length) {
					renderProductionStockInfoView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderProductionStockInfoTableData();
					renderProductionStockInfoPagination();
					updateProductionStockInfoTotalCount();
					updateProductionStockInfoTotalQty();
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
	function renderProductionStockInfoView() {
		let content_output = `
			<div class="divBlockControl" id="view_mProduction_stock_info">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<!--<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.location')}LOCATION</div>
								<input type="text" id="productionStockInfo_searchVal_location" />
							</div> -->
							<div class="search-label">
								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="productionStockInfo_searchVal_factory" >
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="productionStockInfo_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.location')}</div>
								<input type="text" id="productionStockInfo_searchVal_location" />
							</div>
							<div class="search-label">
								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}</div>
								<input type="text" id="productionStockInfo_searchVal_itemcode" />
							</div>
							<div class="search-label" style ="width: 30%;">
								<div class="searchVal_barcode">${i18n.t('search.barcode')}</div>
								<input type="text" id="productionStockInfo_searchVal_barcode" />
							</div>
						</div>
							<div class="search_button_area_horizontal">
								<button class="btn btn-primary btnProductionStockInfoSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnProductionStockInfoSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="productionStockInfoTotalCount">${totalProductionStockInfoCount}</strong> ${i18n.t('table.info.records')} | 
								<!-- ${i18n.t('table.page')} <strong id="productionStockInfoCurrentPageInfo">${currentProductionStockInfoPage}</strong>/<strong id="productionStockInfoTotalPageInfo">${totalProductionStockInfoPages}</strong> | --> 
								${i18n.t('table.info.qty')} : <strong id = "productionStockInfoTotalQty"></strong>
							</span>
							<div class="action-buttons-right mProduction_stock_info">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="productionStockInfoExcelBtn" onclick="downloadAllProductionStockInfoData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table mProduction_stock_info">
							<thead>
								<tr>
									<tr>
										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
									    <th class = "dateVal">${i18n.t('search.date')}<!-- INSDATE --></th>					    
									    <th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
										<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
										<th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>
									    <th class = "itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>									    
									    <th class = "barcodeVal">${i18n.t('table.lot')}<!-- BARCODE --></th>									    
									</tr>
								</tr>
							</thead>
							<tbody id="productionStockInfoTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<!-- <div class="pagination" id="productionStockInfoPaginationContainer">
						</div>  -->
					</div>
				</div>
			</div>
		`;
		/*<button class="btn btn-success" id="productionStockInfoExcelBtn" onclick="ExcelExporter.downloadExcel(filteredProductionStockInfoData, productionStockInfoColumns, {fileName:'ProductionStockInfo', sheetName:'ProductionStockInfo'})">Excel</button>*/

		/* 임시 주석 필요시 사용
		<div class="search-label">
								<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
								<input type="text" id="searchVal_location" />
							</div>
							<th>${i18n.t('search.location')}<!-- LOCATION --></th>
							<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
		*/
		$(".w_contentArea").append(content_output);

		// 공장 및 창고 선택
		renderFactoryStorage();
		// 테이블 데이터 렌더링
		renderProductionStockInfoTableData();
		// 페이지네이션 렌더링
		renderProductionStockInfoPagination();
		// 이벤트 바인딩
		bindProductionStockInfoEvents();
		// 초기 렌더링 후 카운트 업데이트
		updateProductionStockInfoTotalCount();
		// 초기 렌더링 후 수량 업데이트
		updateProductionStockInfoTotalQty();
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const factory = $('#productionStockInfo_searchVal_factory');
		const storage = $('#productionStockInfo_searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		// 공장별 창고 옵션 설정
		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'SALTILLO': ['H/REST'],
				'PUEBLA': ['Workshop'],
				'': ['H/REST', 'Workshop', 'all']
			};

			const storageList = options[factoryValue] || options[''];

			storageList.forEach(item => {
				const value = item;
				const text = item === 'all' ? i18n.t('search.all') : item; // text는 그대로
				storage.append(`<option value="${value}">${text}</option>`);
			});

			// 첫 번째 옵션 선택
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

	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : '';
	}

	// 총 개수를 업데이트하는 함수
	function updateProductionStockInfoTotalCount() {
		$('#productionStockInfoTotalCount').text(totalProductionStockInfoCount.toLocaleString());
	}
	// 총 개수를 업데이트하는 함수
	function updateProductionStockInfoTotalQty() {
		$('#productionStockInfoTotalQty').text(totalProductionStockInfoQty.toLocaleString());
	}

	function renderProductionStockInfoTableData() {
		let tableBody = "";

		//console.log("globalProductionStockInfoData:", globalProductionStockInfoData);
		//console.log("데이터 개수:", globalProductionStockInfoData.length);
		$("#productionStockInfoCurrentPageInfo").text(currentProductionStockInfoPage);
		$("#productionStockInfoTotalPageInfo").text(totalProductionStockInfoPages);
		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalProductionStockInfoData.length; i++) {
			let rowNumber = (currentProductionStockInfoPage - 1) * productionStockInfoItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalProductionStockInfoData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr class="modal_productionStockInfoDetail_open" data-barcode="${globalProductionStockInfoData[i].barcode}">
            	<td class = "noVal">${Number(rowNumber).toLocaleString()}</td>
				<td class = "dateVal">${globalProductionStockInfoData[i].INDATE || globalProductionStockInfoData[i].indate || ''}</td>
				<td class = "factoryVal">${globalProductionStockInfoData[i].FACTORY || globalProductionStockInfoData[i].factory || ''}</td>
				<td class = "storageVal">${globalProductionStockInfoData[i].STORAGE || globalProductionStockInfoData[i].storage || ''}</td>
				<td class = "locationVal">${globalProductionStockInfoData[i].LOCATION || globalProductionStockInfoData[i].location || ''}</td>
				<td class = "itemnameLongVal">${globalProductionStockInfoData[i].ITEMNAME || globalProductionStockInfoData[i].itemname || ''}</td>
				<td class = "itemcodeVal">${globalProductionStockInfoData[i].ITEMCODE || globalProductionStockInfoData[i].itemcode || ''}</td>
				<td class = "qtyVal">${Number(globalProductionStockInfoData[i].QTY || globalProductionStockInfoData[i].qty || 0).toLocaleString()}</td>				
				<td class = "barcodeVal">${globalProductionStockInfoData[i].BARCODE || globalProductionStockInfoData[i].barcode || ''}</td>
            </tr>
        `;
		}

		/* 임시 주석 필요시 사용
		<td>${globalProductionStockInfoData[i].LOCATION || globalProductionStockInfoData[i].location || ''}</td>
		<td>${globalProductionStockInfoData[i].YMDHMS || globalProductionStockInfoData[i].ymdhms || ''}</td>
				*/
		//console.log("생성된 tableBody:", tableBody);
		$("#productionStockInfoTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderProductionStockInfoPagination() {
		let totalPages = Math.ceil(totalProductionStockInfoCount / productionStockInfoItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentProductionStockInfoPage > 1) {
			paginationHtml += `<button class="productionStockInfo-page-btn" data-page="${currentProductionStockInfoPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="productionStockInfo-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentProductionStockInfoPage - 5);
		let endPage = Math.min(totalPages, currentProductionStockInfoPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="productionStockInfo-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentProductionStockInfoPage) {
				paginationHtml += `<button class="productionStockInfo-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="productionStockInfo-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="productionStockInfo-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentProductionStockInfoPage < totalPages) {
			paginationHtml += `<button class="productionStockInfo-page-btn" data-page="${currentProductionStockInfoPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="productionStockInfo-page-btn disabled">&gt;</button>`;
		}

		$("#productionStockInfoPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindProductionStockInfoEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnProductionStockInfoSearch").off('click').on('click', function() {
			performProductionStockInfoSearch();
		});

		// 초기화 버튼 클릭
		$(".btnProductionStockInfoSearchInit").off('click').on('click', function() {
			resetProductionStockInfoSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.productionStockInfo-page-btn').on('click', '.productionStockInfo-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentProductionStockInfoPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performProductionStockInfoDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_mProduction_stock_info input[type="text"], #view_mProduction_stock_info input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performProductionStockInfoSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			factory: $("#productionStockInfo_searchVal_factory").val(),
			storage: $("#productionStockInfo_searchVal_storage").val('H/REST'),
			location: $("#productionStockInfo_searchVal_location").val().trim().toUpperCase(),
			itemcode: $("#productionStockInfo_searchVal_itemcode").val().trim(),
			barcode: $("#productionStockInfo_searchVal_barcode").val().trim()
			/*location: $("#productionStockInfo_searchVal_location").val().trim(), */
		};
	}

	// 검색 수행 함수 - DB 조회
	function performProductionStockInfoSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);
		
		/*if (searchCriteria.barcode) {
			// 필요하면 안내 메시지 활성화
			//alert("Enter barcode or itemcode");
			return;
		}*/
		
		// 페이지를 1로 초기화하고 DB에서 검색
		currentProductionStockInfoPage = 1;
		performProductionStockInfoDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetProductionStockInfoSearch() {
		const factory = getCookie('selectedFactory');
		
		renderFactoryStorage();
		
		$("#productionStockInfo_searchVal_location").val(''),	
		$("#productionStockInfo_searchVal_itemcode").val(''),	
		$("#productionStockInfo_searchVal_barcode").val('')

//		// 초기화 후 전체 데이터 다시 조회
//		currentProductionStockInfoPage = 1;
//		performProductionStockInfoDBSearch({ factory });

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
	window.changeProductionStockInfoItemsPerPage = function(newItemsPerPage) {
		productionStockInfoItemsPerPage = newItemsPerPage;
		currentProductionStockInfoPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performProductionStockInfoDBSearch(searchCriteria);
	}

	window.exportProductionStockInfoData = function() {
		return {
			total: globalProductionStockInfoData.length,
			currentPage: currentProductionStockInfoPage,
			itemsPerPage: productionStockInfoItemsPerPage,
			data: globalProductionStockInfoData
		};
	}

});
window.downloadAllProductionStockInfoData = function() {
	let searchCriteria = {
		factory: $("#productionStockInfo_searchVal_factory").val(),
		storage: $("#productionStockInfo_searchVal_storage").val(),
		location: $("#productionStockInfo_searchVal_location").val().trim().toUpperCase(),
		itemcode: $("#productionStockInfo_searchVal_itemcode").val().trim(),
		barcode: $("#productionStockInfo_searchVal_barcode").val().trim(),
	};

	showLoading("export");

	$.ajax({
		url: "/read_productionStockInfo_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.productionStockInfoColumns, {
				fileName: 'ProductionStockInfo_All',
				sheetName: 'ProductionStockInfo'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

function openModal() {
	$('#overlay_productionStockInfoDetail_2').addClass('active');
	$('#modalContainer_productionStockInfoDetail_2').addClass('active');
	$(".modal_productionStockInfoDetail_bg").addClass("show");
}

function closeModal() {
	$('#overlay_productionStockInfoDetail_2').removeClass('active');
	$('#modalContainer_productionStockInfoDetail_2').removeClass('active');
	$(".modal_productionStockInfoDetail_bg").removeClass("show");
}

// 모달 열기
$(document).on("click", ".modal_productionStockInfoDetail_open", function(e) {
	
	showLoading("data");
	
	let barcode = $(this).data("barcode");
	let itemcode = $(this).find(".itemcodeVal").text();
	
	//console.log(barcode);
	console.log(itemcode);
	$.ajax({
			url: "/read_productionStockInfoInclude_total",
			type: "POST",
			data: itemcode,
			contentType: "application/json",
			success: function(data) {
				console.log(data)
				
				openModal();
				
				let qtySum = 0;
				$(".barcodeList_productionStockInfoDetail_2").empty();

				$(".date_productionStockInfoDetail_2").text(i18n.t('table.info.total') + " "+ data.length + i18n.t('table.info.records'));
				let output = `
					<table class="modal_productionStockInfoTableControl">
						<thead>
							<th>${i18n.t('search.date')}</th>
							<th class = "qtyVal">${i18n.t('search.qty')}</th>
							<th class = "locationVal">${i18n.t('search.location')}</th>
						</thead>
						<tbody>
				`;
				for(i=0;i<data.length;i++) {
					output += `
							<tr>
								<td class = "dateVal">${data[i].INDATE}</td>
								<td class = "qtyVal">${Number(data[i].QTY).toLocaleString()}</td>
								<td class = "locationVal">${data[i].LOCATION}</td>
							</tr>
					`
					qtySum += parseInt(data[i].QTY);
				}
				output += "</tbody></table>";
				
				$(".count_productionStockInfoDetail_2").text(i18n.t('table.info.qty') + " : " + Number(qtySum).toLocaleString());
				$(".barcodeList_productionStockInfoDetail_2").prepend(output);
				hideLoading();
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

// 닫기 버튼
$(document).on("click", "#closeBtn_productionStockInfoDetail", function(e) {
	closeModal();
});

// 오버레이 클릭
$(document).on("click", "#overlay_productionStockInfoDetail", function(e) {
	closeModal();
});
