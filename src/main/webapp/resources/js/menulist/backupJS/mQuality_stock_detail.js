///* --------------------------------------------------------------
// * 📌 Purchase - Stock - Stock Detail
// * 비고: 
// * -------------------------------------------------------------- */
//
//
//$(document).ready(function() {
//
//	let globalQualityStockDetailData = []; // 현재 조회된 데이터 저장
//	let currentQualityStockDetailPage = 1; // 현재 페이지
//	let qualityStockDetailItemsPerPage = 1000; // 페이지당 항목 수
//	let totalQualityStockDetailCount = 0; // 서버에서 받은 총 개수 저장
//	let totalQualityStockDetailQty = 0; // 서버에서 받은 총 개수 저장
//	let totalQualityStockDetailPages = 0; // 서버에서 받은 총 페이지
//	window.filteredQualityStockDetailData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
//	window.qualityStockDetailColumns = [
//		{ key: 'FACTORY', header: 'factory' },
//		{ key: 'STORAGE', header: 'storage' },
//		{ key: 'INDATE', header: 'indate' },
//		{ key: 'CAR', header: 'car' },
//		{ key: 'ITEMCODE', header: 'itemcode' },
//		{ key: 'SPEC', header: 'customer code' },
//		{ key: 'ITEMNAME', header: 'itemname' },
//		{ key: 'LOCATION', header: 'location' },
//		{ key: 'QTY', header: 'qty' },
//		{ key: 'LOGINID', header: 'user' },
//		{ key: 'HHMM', header: 'hh:mm' },
//		{ key: 'BARCODE', header: 'Barcode' }
//	];
//
//
//	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
//	window.call_mQuality_stock_detail = function(menuId) {
//		showLoading("data");
//		
//		const factory = getCookie('selectedFactory');
//		const storage = 'REDCAGE';
//		
//		// 초기 로딩: 공장으로 조회
//		performQualityStockDetailDBSearch({ factory, storage });
//	}
//
//	// DB에서 데이터 조회하는 함수
//	function performQualityStockDetailDBSearch(searchCriteria) {
//		showLoading("data");
//
//		$.ajax({
//			url: "/read_qualityStockDetail",
//			type: "POST",
//			data: JSON.stringify({
//				searchParams: searchCriteria,
//				page: currentQualityStockDetailPage,
//				itemsPerPage: qualityStockDetailItemsPerPage
//			}),
//			contentType: "application/json",
//			success: function(data) {
//				console.log("-- DB 조회 결과 --");
//				console.log(data);
//
//				globalQualityStockDetailData = data.records || data || []; // 서버 응답 구조에 맞게 조정
//				totalQualityStockDetailCount = data.totalCount || 0;
//				totalQualityStockDetailQty = data.totalQty || 0;
//				totalQualityStockDetailPages = data.totalPages || 0;
//				currentQualityStockDetailPage = data.currentPage || 0;
//				window.filteredQualityStockDetailData = globalQualityStockDetailData;
//
//				// 첫 번째 검색이라면 뷰를 렌더링
//				if (!$('#view_mQuality_stock_detail').length) {
//					renderQualityStockDetailView();
//				} else {
//					// 기존 뷰가 있다면 테이블만 업데이트
//					renderQualityStockDetailTableData();
//					renderQualityStockDetailPagination();
//					updateQualityStockDetailTotalCount();
//					updateQualityStockDetailTotalQty();
//				}
//
//				hideLoading();
//			},
//			error: function(xhr, status, error) {
//				console.error("DB 조회 실패:", error);
//				hideLoading();
//				alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
//			}
//		});
//	}
//
//	// 사용자 뷰 렌더링 함수
//	function renderQualityStockDetailView() {
//		let content_output = `
//			<div class="divBlockControl" id="view_mQuality_stock_detail">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
//								<select id="qualityStockDetail_searchVal_factory">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="qualityStockDetail_searchVal_storage" >
//									<option value="REDCAGE">REDCAGE</option>
//								</select>
//							</div>
//							
//							
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="qualityStockDetail_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="qualityStockDetail_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="qualityStockDetail_searchVal_itemname" />
//							</div>
//						</div>
//							<div class="search_button_area">
//								<button class="btn btn-primary btnQualityStockDetailSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//								<button class="btn btn-secondary btnQualityStockDetailSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
//							</div>
//					</div>
//					
//					<!-- 탭 -->
//					<div class="tab-container">
//						<div class="tab">목록</div>
//					</div>
//					
//					<!-- 테이블 -->
//					<div class="table-container">
//						<div class="action-buttons">
//							<button class="btn btn-secondary">엑셀 다운로드</button>
//						</div>
//						
//						<div class="table-info">
//							<span>${i18n.t('table.info.total')} <strong id="qualityStockDetailTotalCount">${totalQualityStockDetailCount}</strong> ${i18n.t('table.info.records')} | 
//								${i18n.t('table.page')} <strong id="qualityStockDetailCurrentPageInfo">${currentQualityStockDetailPage}</strong>/<strong id="qualityStockDetailTotalPageInfo">${totalQualityStockDetailPages}</strong> | 
//								${i18n.t('table.info.qty')} : <strong id = "qualityStockDetailTotalQty"></strong>
//							</span>
//							<div class="action-buttons-right mQuality_stock_detail">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="qualityStockDetailExcelBtn" onclick="downloadAllQualityStockDetailData()">Excel</button>
//								</div>
//							</div>
//						</div>
//						<table class="data-table mQuality_stock_detail">
//							<thead>
//								<tr>
//									<tr>
//										<th class = "noVal">${i18n.t('table.no')}<!-- NO --></th>
//									    <th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
//									    <th class = "storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>									    
//									    <th class = "dateVal">${i18n.t('search.date')}<!-- INSDATE --></th>
//									    <th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
//									    <th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									    <th class = "itemcodeVal">${i18n.t('search.customercode')}<!-- CUSTCODE --></th>
//									    <th class = "itemnameVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									    <th class = "locationVal">${i18n.t('search.location')}<!-- LOCATION --></th>
//									    <th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>									    
//									    <th class = "userVal">${i18n.t('search.user')}<!-- LOGINID --></th>									    
//									    <th class = "hhmmVal">${i18n.t('table.time')}<!-- HHMM --></th>									    
//										<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- LOT --></th>									    
//									</tr>
//								</tr>
//							</thead>
//							<tbody id="qualityStockDetailTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="qualityStockDetailPaginationContainer">
//						</div>
//					</div>
//				</div>
//			</div>
//		`;
//		/* 날짜 임시 주석
//		<div class="search-label">
//								<div class="searchVal_indate">${i18n.t('search.date')}<!-- indate --></div>
//								<input type="date" id="qualityStockDetail_searchVal_indate" />
//							</div>
//		
//		*/
//		
//		/*<button class="btn btn-success" id="qualityStockDetailExcelBtn" onclick="ExcelExporter.downloadExcel(filteredQualityStockDetailData, qualityStockDetailColumns, {fileName:'QualityStockDetail', sheetName:'QualityStockDetail'})">Excel</button>*/
//		
//		/* 임시 주석 필요시 사용
//		<div class="search-label">
//								<div class="searchVal_location">${i18n.t('search.location')}<!-- LOCATION --></div>
//								<input type="text" id="searchVal_location" />
//							</div>
//							<th>${i18n.t('search.location')}<!-- LOCATION --></th>
//							<th>${i18n.t('search.ymdhms')}<!-- YMDHMS --></th>
//		*/
//		$(".w_contentArea").append(content_output);
//
//		// 공장 및 창고 선택
////		renderFactoryStorage();		
//		// 테이블 데이터 렌더링
//		renderQualityStockDetailTableData();
//		// 페이지네이션 렌더링
//		renderQualityStockDetailPagination();
//		// 이벤트 바인딩
//		bindQualityStockDetailEvents();
//		// 초기 렌더링 후 카운트 업데이트
//		updateQualityStockDetailTotalCount();
//		// 초기 렌더링 후 수량 업데이트
//		updateQualityStockDetailTotalQty();
//	}
//	
//	// 251223 DH - 창고 고정값으로 REDCAGE가 들어가서 아래 함수 주석처리함
////	function renderFactoryStorage() {
////		const factory = $('#qualityStockDetail_searchVal_factory');
////		const storage = $('#qualityStockDetail_searchVal_storage');
////		const savedFactory = getCookie('selectedFactory');
////	
////		let userChangedStorage = false;
////	
////		// ✅ 사용자가 창고를 직접 바꾸면 자동세팅이 덮어쓰지 못하게 플래그 ON
////		storage.off('change.user').on('change.user', function() {
////			userChangedStorage = true;
////		});
////	
////		function updateStorageOptions(factoryValue) {
////			storage.empty();
////	
////			const options = {
////				SALTILLO: ['REDCAGE'],
////				PUEBLA: ['Material', 'PRODUCT', 'all'],
////				'': ['REDCAGE']
////			};
////	
////			const storageList = options[factoryValue] || options[''];
////	
////			storageList.forEach(item => {
////				const text = item === 'all' ? i18n.t('search.all') : item;
////				storage.append(`<option value="${item}">${text}</option>`);
////			});
////	
////			// ✅ 공장 바뀔 때만 기본값 세팅 (이때는 사용자가 바꾸기 전이므로 플래그 리셋)
////			userChangedStorage = false;
////			storage.val(storageList[0]);
////	
////			// ✅ 여기서 autoSetStorageFields가 창고를 다시 덮어쓰면 “선택 불가”가 됩니다.
////			// window.autoSetStorageFields();  // ❌ 제거(또는 조건부)
////		}
////	
////		// 저장된 공장 선택
////		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
////			factory.val(savedFactory);
////		}
////	
////		updateStorageOptions(savedFactory || '');
////	
////		// 공장 변경 시에만 창고 옵션 다시 구성
////		factory.off('change.factory').on('change.factory', function() {
////			updateStorageOptions($(this).val());
////	
////			// ✅ 공장 변경 직후에만 자동세팅이 필요하면 여기서 1회만 호출
////			if (typeof window.autoSetStorageFields === 'function') {
////				window.autoSetStorageFields();
////			}
////		});
////	
////		// ✅ 초기 1회만 필요하면 여기서만 호출 (원하시면 주석 해제)
////		// if (typeof window.autoSetStorageFields === 'function') {
////		//     window.autoSetStorageFields();
////		// }
////	}
//
//	
//	// 정규식으로 쿠기 가져오기
//	function getCookie(cookieName) {
//	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//	    return match ? decodeURIComponent(match[2]) : '';
//	}
//	
//	// 총 개수를 업데이트하는 함수
//	function updateQualityStockDetailTotalCount() {
//		$('#qualityStockDetailTotalCount').text(totalQualityStockDetailCount.toLocaleString());
//	}
//	// 총 개수를 업데이트하는 함수
//	function updateQualityStockDetailTotalQty() {
//		$('#qualityStockDetailTotalQty').text(totalQualityStockDetailQty.toLocaleString());
//	}
//
//	function renderQualityStockDetailTableData() {
//		let tableBody = "";
//
//		//console.log("globalQualityStockDetailData:", globalQualityStockDetailData);
//		//console.log("데이터 개수:", globalQualityStockDetailData.length);
//		$("#qualityStockDetailCurrentPageInfo").text(currentQualityStockDetailPage);
//		$("#qualityStockDetailTotalPageInfo").text(totalQualityStockDetailPages);
//		// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
//		for (let i = 0; i < globalQualityStockDetailData.length; i++) {
//			let rowNumber = (currentQualityStockDetailPage - 1) * qualityStockDetailItemsPerPage + i + 1;
//
//			//console.log(`행 ${i}:`, globalQualityStockDetailData[i]); // 각 행 데이터 확인
//
//			tableBody += `
//            <tr>
//            	<td class = "noVal">${rowNumber}</td>
//				<td class = "factoryVal">${globalQualityStockDetailData[i].FACTORY || globalQualityStockDetailData[i].factory || ''}</td>
//				<td class = "storageVal">${globalQualityStockDetailData[i].STORAGE || globalQualityStockDetailData[i].storage || ''}</td>				
//				<td class = "dateVal">${globalQualityStockDetailData[i].INSDATE || globalQualityStockDetailData[i].indate || ''}</td>
//				<td class = "carVal">${globalQualityStockDetailData[i].CAR || globalQualityStockDetailData[i].car || ''}</td>
//				<td class = "itemcodeVal">${globalQualityStockDetailData[i].ITEMCODE || globalQualityStockDetailData[i].itemcode || ''}</td>
//				<td class = "itemcodeVal">${globalQualityStockDetailData[i].SPEC || globalQualityStockDetailData[i].spec || ''}</td>
//				<td class = "itemnameVal">${globalQualityStockDetailData[i].ITEMNAME || globalQualityStockDetailData[i].itemname || ''}</td>
//				<td class = "locationVal">${globalQualityStockDetailData[i].LOCATION || globalQualityStockDetailData[i].location || ''}</td>
//				<td class = "qtyVal">${Number(globalQualityStockDetailData[i].QTY || globalQualityStockDetailData[i].qty || 0).toLocaleString()}</td>				
//				<td class = "userVal">${globalQualityStockDetailData[i].LOGINID || globalQualityStockDetailData[i].loginid || ''}</td>
//				<td class = "hhmmVal">${globalQualityStockDetailData[i].HHMM || globalQualityStockDetailData[i].hhmm || ''}</td>
//				<td class = "barcodeVal">${globalQualityStockDetailData[i].BARCODE || globalQualityStockDetailData[i].barcode || ''}</td>
//            </tr>
//        `;
//		}
//		
//		/* 임시 주석 필요시 사용
//		<td>${globalQualityStockDetailData[i].LOCATION || globalQualityStockDetailData[i].location || ''}</td>
//		<td>${globalQualityStockDetailData[i].YMDHMS || globalQualityStockDetailData[i].ymdhms || ''}</td>
//				*/
//		//console.log("생성된 tableBody:", tableBody);
//		$("#qualityStockDetailTableBody").html(tableBody);
//	}
//
//	// 페이지네이션 렌더링
//	function renderQualityStockDetailPagination() {
//		let totalPages = Math.ceil(totalQualityStockDetailCount / qualityStockDetailItemsPerPage); // 변경
//		let paginationHtml = "";
//
//		// 이전 버튼
//		if (currentQualityStockDetailPage > 1) {
//			paginationHtml += `<button class="qualityStockDetail-page-btn" data-page="${currentQualityStockDetailPage - 1}">&lt;</button>`;
//		} else {
//			paginationHtml += `<button class="qualityStockDetail-page-btn disabled">&lt;</button>`;
//		}
//
//		// 페이지 번호 버튼들
//		let startPage = Math.max(1, currentQualityStockDetailPage - 5);
//		let endPage = Math.min(totalPages, currentQualityStockDetailPage + 5);
//
//		// 첫 페이지
//		if (startPage > 1) {
//			paginationHtml += `<button class="qualityStockDetail-page-btn" data-page="1">1</button>`;
//			if (startPage > 2) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//		}
//
//		// 중간 페이지들
//		for (let i = startPage; i <= endPage; i++) {
//			if (i === currentQualityStockDetailPage) {
//				paginationHtml += `<button class="qualityStockDetail-page-btn active" data-page="${i}">${i}</button>`;
//			} else {
//				paginationHtml += `<button class="qualityStockDetail-page-btn" data-page="${i}">${i}</button>`;
//			}
//		}
//
//		// 마지막 페이지
//		if (endPage < totalPages) {
//			if (endPage < totalPages - 1) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//			paginationHtml += `<button class="qualityStockDetail-page-btn" data-page="${totalPages}">${totalPages}</button>`;
//		}
//
//		// 다음 버튼
//		if (currentQualityStockDetailPage < totalPages) {
//			paginationHtml += `<button class="qualityStockDetail-page-btn" data-page="${currentQualityStockDetailPage + 1}">&gt;</button>`;
//		} else {
//			paginationHtml += `<button class="qualityStockDetail-page-btn disabled">&gt;</button>`;
//		}
//
//		$("#qualityStockDetailPaginationContainer").html(paginationHtml);
//	}
//
//	// 이벤트 바인딩
//	function bindQualityStockDetailEvents() {
//		// 검색 버튼 클릭 - DB에서 새로 조회
//		$(".btnQualityStockDetailSearch").off('click').on('click', function() {
//			performQualityStockDetailSearch();
//		});
//
//		// 초기화 버튼 클릭
//		$(".btnQualityStockDetailSearchInit").off('click').on('click', function() {
//			resetQualityStockDetailSearch();
//		});
//
//		// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
//		$(document).off('click', '.qualityStockDetail-page-btn').on('click', '.qualityStockDetail-page-btn', function() {
//			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//				let page = parseInt($(this).data('page'));
//				if (page && page > 0) {
//					currentQualityStockDetailPage = page;
//					// 현재 검색 조건으로 DB에서 새 페이지 조회
//					let searchCriteria = getCurrentSearchCriteria();
//					performQualityStockDetailDBSearch(searchCriteria);
//				}
//			}
//		});
//
//		// 엔터키 검색
//		$('#view_mQuality_stock_detail input[type="text"], #view_mQuality_stock_detail input[type="date"]').off('keypress').on('keypress', function(e) {
//			if (e.which === 13) {
//				performQualityStockDetailSearch();
//			}
//		});
//	}
//
//	// 현재 검색 조건 수집 함수
//	function getCurrentSearchCriteria() {
//		return {
//			factory: $("#qualityStockDetail_searchVal_factory").val(),
//			storage: $("#qualityStockDetail_searchVal_storage").val(),
//			indate: $("#qualityStockDetail_searchVal_indate").val(),
//			car: $("#qualityStockDetail_searchVal_car").val().trim().toUpperCase(),
//			itemcode: $("#qualityStockDetail_searchVal_itemcode").val().trim().toUpperCase(),
//			itemname: $("#qualityStockDetail_searchVal_itemname").val().trim().toUpperCase()
//		};
//	}
//
//	// 검색 수행 함수 - DB 조회
//	function performQualityStockDetailSearch() {
//		let searchCriteria = getCurrentSearchCriteria();
//
//		console.log("검색 조건:", searchCriteria);
//
//		// 페이지를 1로 초기화하고 DB에서 검색
//		currentQualityStockDetailPage = 1;
//		performQualityStockDetailDBSearch(searchCriteria);
//	}
//
//	// 검색 조건 초기화
//	function resetQualityStockDetailSearch() {
//		const factory = getCookie('selectedFactory');
//		
//		$("#qualityStockDetail_searchVal_factory").val(factory);
//		$("#qualityStockDetail_searchVal_car").val('');
//		$("#qualityStockDetail_searchVal_itemcode").val('');
//		$("#qualityStockDetail_searchVal_itemname").val('');
//
//		// 공장, 창고 기본값 설정
////		renderFactoryStorage()
//		
//		// 초기화 후 전체 데이터 다시 조회
//		currentQualityStockDetailPage = 1;
//		performQualityStockDetailDBSearch({ factory });
//
//		console.log('검색 조건이 초기화되었습니다.');
//	}
//
//	// 날짜 형식 변환 함수들
//	function formatDateToYYYYMMDD(dateStr) {
//		if (!dateStr) return '';
//		return dateStr.replace(/-/g, '');
//	}
//
//	function formatDateFromYYYYMMDD(dateStr) {
//		if (!dateStr || dateStr.length !== 8) return '';
//		return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
//	}
//
//	// 유틸리티 함수들
//	window.changeQualityStockDetailItemsPerPage = function(newItemsPerPage) {
//		qualityStockDetailItemsPerPage = newItemsPerPage;
//		currentQualityStockDetailPage = 1;
//		let searchCriteria = getCurrentSearchCriteria();
//		performQualityStockDetailDBSearch(searchCriteria);
//	}
//
//	window.exportQualityStockDetailData = function() {
//		return {
//			total: globalQualityStockDetailData.length,
//			currentPage: currentQualityStockDetailPage,
//			itemsPerPage: qualityStockDetailItemsPerPage,
//			data: globalQualityStockDetailData
//		};
//	}
//
//});
//window.downloadAllQualityStockDetailData = function() {
//	let searchCriteria = {
//		factory: $("#qualityStockDetail_searchVal_factory").val(),
//		storage: $("#qualityStockDetail_searchVal_storage").val(),
//		indate: $("#qualityStockDetail_searchVal_indate").val(),
//		car: $("#qualityStockDetail_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#qualityStockDetail_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#qualityStockDetail_searchVal_itemname").val().trim().toUpperCase()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_qualityStockDetail_all",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(data) {
//			console.log(data)
//			ExcelExporter.downloadExcel(data, window.qualityStockDetailColumns, {
//				fileName: 'QualityStockDetail_All',
//				sheetName: 'QualityStockDetail'
//			});
//			hideLoading();
//		},
//		error: function() {
//			alert("전체 데이터 조회에 실패했습니다.");
//			hideLoading();
//		}
//	});
//};
