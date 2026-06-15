/* --------------------------------------------------------------
 * 📌 구매 - 재고 - 재고실사 (DB 검색 버전)
 * 비고: 검색 버튼 클릭 시마다 DB에서 조회
 * -------------------------------------------------------------- */

$(document).ready(function() {

	let globalErpInterfaceDetailData = []; // 현재 조회된 데이터 저장
	let currentErpInterfaceDetailPage = 1; // 현재 페이지
	let erpInterfaceDetailItemsPerPage = 1000; // 페이지당 항목 수
	let totalErpInterfaceDetailCount = 0; // 서버에서 받은 총 개수 저장
	let totalErpInterfaceDetailQty = 0; // 서버에서 받은 총 개수 저장
	let totalErpInterfaceDetailPages = 0; // 서버에서 받은 총 페이지
	window.filteredErpInterfaceDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
	window.erpInterfaceDetailColumns = [
		{ key: 'SCANTYPE', header: 'scantype' },
		{ key: 'FACTORY', header: 'factory' },
		{ key: 'STORAGE', header: 'storage' },
		{ key: 'SDATE', header: 'date' },
		{ key: 'CAR', header: 'car' },
		{ key: 'ITEMCODE', header: 'itemcode' },
		{ key: 'ITEMNAME', header: 'itemname' },
		{ key: 'QTY', header: 'qty', type: 'number' },
		{ key: 'BARCODE', header: 'barcode' },
		{ key: 'LOCATION', header: 'location' },
		{ key: 'LOGINID', header: 'user' },
		{ key: 'HHMM', header: 'hh:mm' }
	];

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_m2_erpInterface_detail = function(menuId) {
		//showLoading("data");
		
		const factory = getCookie('selectedFactory');
		
		// 초기 로딩: 기본 공장으로 조회
		//performErpInterfaceDetailDBSearch({ factory });
		// 초기에 화면 그려지지 않도록 기초화면만 그려줌
		renderErpInterfaceDetailView();
	}

	// DB에서 데이터 조회하는 함수
	function performErpInterfaceDetailDBSearch(searchCriteria) {
		showLoading("data");

		$.ajax({
			url: "/read_erpInterfaceDetail",
			type: "POST",
			data: JSON.stringify({
				searchParams: searchCriteria,
				page: currentErpInterfaceDetailPage,
				itemsPerPage: erpInterfaceDetailItemsPerPage
			}),
			contentType: "application/json",
			success: function(data) {
				console.log("-- DB 조회 결과 --");
				console.log(data);

				globalErpInterfaceDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
				totalErpInterfaceDetailCount = data.totalCount || 0;
				totalErpInterfaceDetailQty = data.totalQty || 0;
				totalErpInterfaceDetailPages = data.totalPages || 0;
				window.filteredErpInterfaceDetailData = globalErpInterfaceDetailData;

				// 첫 번째 검색이라면 뷰를 렌더링
				if (!$('#view_m2_erpInterface_detail').length) {
					renderErpInterfaceDetailView();
				} else {
					// 기존 뷰가 있다면 테이블만 업데이트
					renderErpInterfaceDetailTableData();
					renderErpInterfaceDetailPagination();
					updateErpInterfaceDetailTotalCount();
					updateErpInterfaceDetailTotalQty();
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
	function renderErpInterfaceDetailView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_erpInterface_detail">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="erpInterfaceDetail_searchVal_sdate">${i18n.t('search.date')}<!-- SDATE --></div>
								<input type="date" id="erpInterfaceDetail_searchVal_sdate" />
							</div>
							<div class="search-label">
							<div class="erpInterfaceDetail_searchVal_scantype">${i18n.t('search.scanType')}<!-- SCANTYPE --></div>
								<select id="erpInterfaceDetail_searchVal_scantype" >
									<option value="LOCATION" >${i18n.t('search.location')}</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="BARCODE">${i18n.t('search.barcode')}</option>
								</select>
							</div>
							<div class="search-label">
								<div class="erpInterfaceDetail_searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="erpInterfaceDetail_searchVal_factory" class="factory-select">
									<option value="SALTILLO">Saltillo</option>
									<option value="PUEBLA">Puebla</option>
									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="erpInterfaceDetail_searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="erpInterfaceDetail_searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="erpInterfaceDetail_searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
								<input type="text" id="erpInterfaceDetail_searchVal_car" />
							</div>
							<div class="search-label">
								<div class="erpInterfaceDetail_searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
								<input type="text" id="erpInterfaceDetail_searchVal_itemcode" />
							</div>
							<div class="search-label">
								<div class="erpInterfaceDetail_searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
								<input type="text" id="erpInterfaceDetail_searchVal_itemname" />
							</div>
							<div class="search-label">
								<div class="erpInterfaceDetail_searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
								<input type="text" id="erpInterfaceDetail_searchVal_location" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnErpInterfaceDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnErpInterfaceDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<span>${i18n.t('table.info.total')} <strong id="erpInterfaceDetailTotalCount">${totalErpInterfaceDetailCount}</strong> ${i18n.t('table.info.records')} | 
								${i18n.t('table.page')} <strong id="erpInterfaceDetailCurrentPageInfo">${currentErpInterfaceDetailPage}</strong>/<strong id="erpInterfaceDetailTotalPageInfo">${totalErpInterfaceDetailPages}</strong> |  
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="erpInterfaceDetailTotalQty" style="color:#007bff"></span> 
							</span>
							<div class="action-buttons-right m2_erpInterface_detail">
								<div id="defaultActions" class="action-group">
									<button class="btn btn-success" id="erpInterfaceDetailExcelBtn" onclick="downloadAllErpInterfaceDetailData()">Excel</button>
								</div>
							</div>
						</div>
						<table class="data-table m2_erpInterface_detail">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "scantypeVal">${i18n.t('search.scanType')}<!-- SCANTYPE --></th>
									<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = "dateVal">${i18n.t('search.date')}<!-- SDATE --></th>
									<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
									<th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>   
									<th class = "userVal">${i18n.t('search.user')}<!-- LOGINID --></th>									    
									<th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>	
								</tr>
							</thead>
							<tbody id="erpInterfaceDetailTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="erpInterfaceDetailPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;
		/*<button class="btn btn-success" id="erpInterfaceDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredErpInterfaceDetailData, erpInterfaceDetailColumns, {fileName:'ErpInterfaceDetail', sheetName:'ErpInterfaceDetail'})">Excel</button>*/
		$(".w_contentArea").append(content_output);

		// 공장 및 창고 선택
		renderFactoryStorage();	
		// 테이블 데이터 렌더링
		//renderErpInterfaceDetailTableData();
		// 페이지네이션 렌더링
		//renderErpInterfaceDetailPagination();
		// 이벤트 바인딩
		bindErpInterfaceDetailEvents();
		// 초기 렌더링 후 카운트 업데이트
		//updateErpInterfaceDetailTotalCount();
		// 초기 렌더링 후 수량 업데이트
		//updateErpInterfaceDetailTotalQty();
		
		(function() {
			const today = new Date();
			const toDate = fmtLocalDate(today);
			$("#erpInterfaceDetail_searchVal_sdate").val(toDate);
		})();
		function fmtLocalDate(d) {
			const y = d.getFullYear();
			const m = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			return `${y}-${m}-${dd}`;
		}
	}


	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
	    const factory = $('#erpInterfaceDetail_searchVal_factory');
	    const storage = $('#erpInterfaceDetail_searchVal_storage');
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
	}
	
	// 정규식으로 쿠기 가져오기
	function getCookie(cookieName) {
	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
	    return match ? decodeURIComponent(match[2]) : '';
	}
	
	// 총 개수를 업데이트하는 함수
	function updateErpInterfaceDetailTotalCount() {
		$('#erpInterfaceDetailTotalCount').text(Number(totalErpInterfaceDetailCount).toLocaleString());
	}

	//총 개수를 업데이트하는 함수
	function updateErpInterfaceDetailTotalQty() {
		$('.erpInterfaceDetailTotalQty').text(totalErpInterfaceDetailQty.toLocaleString());
	}

	function renderErpInterfaceDetailTableData() {
		let tableBody = "";

		//console.log("globalErpInterfaceDetailData:", globalErpInterfaceDetailData);
		//console.log("데이터 개수:", globalErpInterfaceDetailData.length);

		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
		for (let i = 0; i < globalErpInterfaceDetailData.length; i++) {
			let rowNumber = (currentErpInterfaceDetailPage - 1) * erpInterfaceDetailItemsPerPage + i + 1;

			//console.log(`행 ${i}:`, globalErpInterfaceDetailData[i]); // 각 행 데이터 확인

			tableBody += `
            <tr>
                <td class = "noVal">${rowNumber}</td>
                <td class = "scantypeVal">${globalErpInterfaceDetailData[i].SCANTYPE || globalErpInterfaceDetailData[i].scantype || ''}</td>
                <td class = "factoryVal">${globalErpInterfaceDetailData[i].FACTORY || globalErpInterfaceDetailData[i].factory || ''}</td>
                <td class = "storageVal">${globalErpInterfaceDetailData[i].STORAGE || globalErpInterfaceDetailData[i].storage || ''}</td>
                <td class = "dateVal">${globalErpInterfaceDetailData[i].SDATE || globalErpInterfaceDetailData[i].sdate || ''}</td>
                <td class = "carVal">${globalErpInterfaceDetailData[i].CAR || globalErpInterfaceDetailData[i].car || ''}</td>
                <td class = "itemcodeVal">${globalErpInterfaceDetailData[i].ITEMCODE || globalErpInterfaceDetailData[i].itemcode || ''}</td>
                <td class = "itemnameVal">${globalErpInterfaceDetailData[i].ITEMNAME || globalErpInterfaceDetailData[i].itemname || ''}</td>
                <td class = "qtyVal">${Number(globalErpInterfaceDetailData[i].QTY || globalErpInterfaceDetailData[i].qty || 0).toLocaleString()}</td>
                <td class = "barcodeVal">${globalErpInterfaceDetailData[i].BARCODE || globalErpInterfaceDetailData[i].barcode || ''}</td>
                <td class = "locationVal">${globalErpInterfaceDetailData[i].LOCATION || globalErpInterfaceDetailData[i].location || ''}</td>
                <td class = "userVal">${globalErpInterfaceDetailData[i].LOGINID || globalErpInterfaceDetailData[i].loginid || ''}</td>
                <td class = "hhmmVal">${globalErpInterfaceDetailData[i].HHMM || globalErpInterfaceDetailData[i].hhmm || ''}</td>
            </tr>
        `;
		}

		//console.log("생성된 tableBody:", tableBody);
		$("#erpInterfaceDetailTableBody").html(tableBody);
	}

	// 페이지네이션 렌더링
	function renderErpInterfaceDetailPagination() {
		let totalPages = Math.ceil(totalErpInterfaceDetailCount / erpInterfaceDetailItemsPerPage); // 변경
		let paginationHtml = "";

		// 이전 버튼
		if (currentErpInterfaceDetailPage > 1) {
			paginationHtml += `<button class="erpInterfaceDetail-page-btn" data-page="${currentErpInterfaceDetailPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="erpInterfaceDetail-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentErpInterfaceDetailPage - 5);
		let endPage = Math.min(totalPages, currentErpInterfaceDetailPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="erpInterfaceDetail-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentErpInterfaceDetailPage) {
				paginationHtml += `<button class="erpInterfaceDetail-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="erpInterfaceDetail-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="erpInterfaceDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentErpInterfaceDetailPage < totalPages) {
			paginationHtml += `<button class="erpInterfaceDetail-page-btn" data-page="${currentErpInterfaceDetailPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="erpInterfaceDetail-page-btn disabled">&gt;</button>`;
		}

		$("#erpInterfaceDetailPaginationContainer").html(paginationHtml);
	}

	// 이벤트 바인딩
	function bindErpInterfaceDetailEvents() {
		// 검색 버튼 클릭 - DB에서 새로 조회
		$(".btnErpInterfaceDetailSearch").off('click').on('click', function() {
			performErpInterfaceDetailSearch();
		});

		// 초기화 버튼 클릭
		$(".btnErpInterfaceDetailSearchInit").off('click').on('click', function() {
			resetErpInterfaceDetailSearch();
		});

		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
		$(document).off('click', '.erpInterfaceDetail-page-btn').on('click', '.erpInterfaceDetail-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentErpInterfaceDetailPage = page;
					// 현재 검색 조건으로 DB에서 새 페이지 조회
					let searchCriteria = getCurrentSearchCriteria();
					performErpInterfaceDetailDBSearch(searchCriteria);
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_erpInterface_detail input[type="text"], #view_m2_erpInterface_detail input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performErpInterfaceDetailSearch();
			}
		});
	}

	// 현재 검색 조건 수집 함수
	function getCurrentSearchCriteria() {
		return {
			scantype: $("#erpInterfaceDetail_searchVal_scantype").val(),
			factory: $("#erpInterfaceDetail_searchVal_factory").val(),
			storage: $("#erpInterfaceDetail_searchVal_storage").val(),
			sdate: $("#erpInterfaceDetail_searchVal_sdate").val(),
			car: $("#erpInterfaceDetail_searchVal_car").val().trim().toUpperCase(),
			itemcode: $("#erpInterfaceDetail_searchVal_itemcode").val().trim().toUpperCase(),
			itemname: $("#erpInterfaceDetail_searchVal_itemname").val().trim().toUpperCase(),
			location: $("#erpInterfaceDetail_searchVal_location").val().trim().toUpperCase()
		};
	}

	// 검색 수행 함수 - DB 조회
	function performErpInterfaceDetailSearch() {
		let searchCriteria = getCurrentSearchCriteria();

		console.log("검색 조건:", searchCriteria);

		// 페이지를 1로 초기화하고 DB에서 검색
		currentErpInterfaceDetailPage = 1;
		performErpInterfaceDetailDBSearch(searchCriteria);
	}

	// 검색 조건 초기화
	function resetErpInterfaceDetailSearch() {
		const factory = getCookie('selectedFactory');
		
		$("#erpInterfaceDetail_searchVal_scantype").val('LOCATION');
		$("#erpInterfaceDetail_searchVal_factory").val(factory);
		$("#erpInterfaceDetail_searchVal_storage").val('Material');
		$("#erpInterfaceDetail_searchVal_sdate").val('');
		$("#erpInterfaceDetail_searchVal_car").val('');
		$("#erpInterfaceDetail_searchVal_itemcode").val('');
		$("#erpInterfaceDetail_searchVal_itemname").val('');
		$("#erpInterfaceDetail_searchVal_location").val('');

		console.log($("#erpInterfaceDetail_searchVal_scantype").val());
		
		// 초기화 후 전체 데이터 다시 조회
		currentErpInterfaceDetailPage = 1;
		performErpInterfaceDetailDBSearch({ factory });

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
	window.changeErpInterfaceDetailItemsPerPage = function(newItemsPerPage) {
		erpInterfaceDetailItemsPerPage = newItemsPerPage;
		currentErpInterfaceDetailPage = 1;
		let searchCriteria = getCurrentSearchCriteria();
		performErpInterfaceDetailDBSearch(searchCriteria);
	}

	window.exportErpInterfaceDetailData = function() {
		return {
			total: globalErpInterfaceDetailData.length,
			currentPage: currentErpInterfaceDetailPage,
			itemsPerPage: erpInterfaceDetailItemsPerPage,
			data: globalErpInterfaceDetailData
		};
	}
});


window.downloadAllErpInterfaceDetailData = function() {
	let searchCriteria = {
		factory: $("#erpInterfaceDetail_searchVal_factory").val(),
		storage: $("#erpInterfaceDetail_searchVal_storage").val(),
		scantype: $("#erpInterfaceDetail_searchVal_scantype").val(),
		sdate: $("#erpInterfaceDetail_searchVal_sdate").val(),
		car: $("#erpInterfaceDetail_searchVal_car").val().trim().toUpperCase(),
		itemcode: $("#erpInterfaceDetail_searchVal_itemcode").val().trim().toUpperCase(),
		itemname: $("#erpInterfaceDetail_searchVal_itemname").val().trim().toUpperCase(),
		location: $("#erpInterfaceDetail_searchVal_location").val().trim().toUpperCase()
	};

	showLoading("export");

	$.ajax({
		url: "/read_erpInterfaceDetail_all",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(data) {
			console.log(data)
			ExcelExporter.downloadExcel(data, window.erpInterfaceDetailColumns, {
				fileName: 'ErpInterfaceDetail_All',
				sheetName: 'ErpInterfaceDetail'
			});
			hideLoading();
		},
		error: function() {
			alert("전체 데이터 조회에 실패했습니다.");
			hideLoading();
		}
	});
};

