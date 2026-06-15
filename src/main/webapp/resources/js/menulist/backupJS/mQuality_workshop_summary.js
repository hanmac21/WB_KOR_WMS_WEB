// /* --------------------------------------------------------------
//  * 📌 대메뉴 - 중메뉴 - 메뉴명 (DB 검색 버전)
//  * 비고: 검색 버튼 클릭 시마다 DB에서 조회
//  *
//  * DB 검색 버전 초기 세팅 파일
//  * = <- 기호 부분 찾아 수정, 일부러 오류 발생 시켜서 표시 해 놓음.
//  * 오류 난 부분 위에 예시를 하나 두었으니 보고 작성
//  *
//  * 1. 메뉴명 mQuality_workshop_summary 을 전부 사용하는 메뉴명으로 Replace
//  * 2. 앞글자 소문자 전부 메뉴영어명으로 Replace : qualityWorkshopSummary -> newMenuName
//  * 3. 앞글대 대문자 전부 메뉴영어명으로 Replace : QualityWorkshopSummary -> NewMenuName
//  * 4. 표시된 오류 및 = 부분 수정
//  * 5. AJAX 호출명 따라 백단 코드 생성
//  * 6. CSS 스타일 후속조치 - row 내부 요소 길이조절
//  *
//  * 백단 참고사항
//  * - Mapper.xml 에서 검색값 잘 확인 해야함 SQL IF 문. 형식에 맞게 변경
//  *
//  * 아래 Document Ready 부터 복 붙
//  * -------------------------------------------------------------- */
//
//
// let globalQualityWorkshopSummaryData = []; // 현재 조회된 데이터 저장
// let currentQualityWorkshopSummaryPage = 1; // 현재 페이지
// let qualityWorkshopSummaryItemsPerPage = 1000; // 페이지당 항목 수
// let totalQualityWorkshopSummaryCount = 0; // 서버에서 받은 총 개수 저장
// let totalQualityWorkshopSummaryQty = 0; // 서버에서 받은 총 개수 저장
// let totalQualityWorkshopSummaryPages = 0; // 서버에서 받은 총 페이지
// let menuType = null;
// let saveStorageForInit = null;
// let pendingQualityWorkshopSummaryInit = false;
// window.filteredQualityWorkshopSummaryData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)
// window.qualityWorkshopSummaryColumns = [
// 	{ key: 'INDATE', header: 'date' },
// 	{ key: 'FACTORY', header: 'factory' },
// 	{ key: 'STORAGE', header: 'from storage' },
// 	{ key: 'WCCODE', header: 'to storage' },
// 	{ key: 'CAR', header: 'car' },
// 	{ key: 'ITEMCODE', header: 'itemcode' },
// 	{ key: 'ITEMNAME', header: 'itemname' },
// 	{ key: 'QTY', header: 'qty' },
// ];
//
// $(document).ready(function() {
// 	// 👉 실제 조회 함수
// 	function initQualityWorkshopSummarySearch() {
// 		showLoading("data");
// 		const { fromDate, toDate } = getDefaultDateRange();
// 		const factory = getCookie('selectedFactory');
//
//
// 		performQualityWorkshopSummaryDBSearch({ fromDate, toDate, factory });
// 	}
//
// 	// 메인 호출 함수 - 메뉴 클릭 시 호출
// 	window.call_mQuality_workshop_summary = function(menuId) {
// 		// 이 메뉴는 열렸다 → 플래그만 세팅
// 		pendingQualityWorkshopSummaryInit = true;
//
// 		// menuType 아직 없으면 대기
// 		if (!menuType) {
// 			return;
// 		}
//
// 		// menuType 이미 있으면 바로 조회
// 		initQualityWorkshopSummarySearch();
// 	};
//
// 	// ✅ 메뉴 타입 변경 이벤트 (한 번만 등록)
// 	document.addEventListener('menuTypeChanged', function(e) {
// 		menuType = e.detail.menuType;
//
// 		// 메뉴는 이미 눌려 있고, menuType만 늦게 들어온 경우
// 		if (pendingQualityWorkshopSummaryInit) {
// 			pendingQualityWorkshopSummaryInit = false;
// 			initQualityWorkshopSummarySearch();
// 		}
// 	});
// });
//
// // DB에서 데이터 조회하는 함수
// function performQualityWorkshopSummaryDBSearch(searchCriteria) {
// 	showLoading("data");
//
// 	$.ajax({
// 		url: "/read_qualityWorkshopSummary",
// 		type: "POST",
// 		data: JSON.stringify({
// 			searchParams: searchCriteria,
// 			page: currentQualityWorkshopSummaryPage,
// 			itemsPerPage: qualityWorkshopSummaryItemsPerPage
// 		}),
// 		contentType: "application/json",
// 		success: function(data) {
// 			console.log("-- DB 조회 결과 --");
// 			console.log(data);
//
// 			globalQualityWorkshopSummaryData = data.records || data || []; // 서버 응답 구조에 맞게 조정
// 			totalQualityWorkshopSummaryCount = data.totalCount || 0;
// 			totalQualityWorkshopSummaryQty = data.totalQty || 0;
// 			totalQualityWorkshopSummaryPages = data.totalPages || 0;
// 			currentQualityWorkshopSummaryPage = data.currentPage || 0;
// 			window.filteredQualityWorkshopSummaryData = globalQualityWorkshopSummaryData;
//
// 			// 첫 번째 검색이라면 뷰를 렌더링
// 			if (!$('#view_mQuality_workshop_summary').length) {
// 				renderQualityWorkshopSummaryView();
// 			} else {
// 				// 기존 뷰가 있다면 테이블만 업데이트
// 				renderQualityWorkshopSummaryTableData();
// 				renderQualityWorkshopSummaryPagination();
// 				updateQualityWorkshopSummaryTotalCount();
// 				updateQualityWorkshopSummaryTotalQty();
// 			}
//
// 			hideLoading();
// 		},
// 		error: function(xhr, status, error) {
// 			console.error("DB 조회 실패:", error);
// 			hideLoading();
// 			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
// 		}
// 	});
// }
//
// // 사용자 뷰 렌더링 함수
// function renderQualityWorkshopSummaryView() {
// 	let content_output = `
// 		<div class="divBlockControl" id="view_mQuality_workshop_summary">
// 			<div class="content-body">
// 				<!-- 검색 영역 -->
// 				<div class="search-area">
// 					<div class="search-row">
// 						<div class="search-label">
// 							<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
// 							<input type="date" id="qualityWorkshopSummary_searchVal_fromDate" />
// 						</div>
// 						<div class="search-label">
// 							<div class="searchVal_toDate">　</div>
// 							<input type="date" id="qualityWorkshopSummary_searchVal_toDate" />
// 						</div>
// 						<!-- <div class="search-label">
// 							<div class="search_qualityWorkshopSummaryCondition">${i18n.t('search.input.status')}상태</div>
// 							<select id="qualityWorkshopSummary_searchVal_condition" >
// 								<option value="">${i18n.t('search.all')} 전체 </option>
// 								<option value="N">${i18n.t('search.input.waiting')} 대기중</option>
// 								<option value="Y">${i18n.t('search.input.completed')} 완료 </option>
// 							</select>
// 						</div>-->
// 						<div class="search-label">
// 							<div class="searchVal_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
// 							<select id="qualityWorkshopSummary_searchVal_factory" class="factory-select">
// 								<option value="all">${i18n.t('search.all')}<!-- 전체 --></option>
// 								<option value="SALTILLO">Saltillo</option>
// 								<option value="PUEBLA">Puebla</option>
// 							</select>
// 						</div>
// 						<div class="search-label">
// 							<div class="searchVal_storage">${i18n.t('search.storage.from')}<!-- FROM STORAGE --></div>
// 							<select id="qualityWorkshopSummary_searchVal_storage1" >
// 								<!-- 동적으로 추가 -->
// 							</select>
// 						</div>
// 						<div class="search-label">
// 							<div class="searchVal_storage">${i18n.t('search.storage.to')}<!-- TO STORAGE --></div>
// 							<select id="qualityWorkshopSummary_searchVal_storage2" >
// 								<!-- 동적으로 추가 -->
// 							</select>
// 						</div>
// 						<div class="search-label">
// 							<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
// 							<input type="text" id="qualityWorkshopSummary_searchVal_car" />
// 						</div>
// 						<div class="search-label">
// 							<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
// 							<input type="text" id="qualityWorkshopSummary_searchVal_itemcode" />
// 						</div>
// 						<div class="search-label">
// 							<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
// 							<input type="text" id="qualityWorkshopSummary_searchVal_itemname" />
// 						</div>
// 					</div>
// 						<div class="search_button_area">
// 							<button class="btn btn-primary btnQualityWorkshopSummarySearch">${i18n.t('btn.search')}<!-- 검색 --></button>
// 							<button class="btn btn-secondary btnQualityWorkshopSummarySearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
// 						</div>
// 				</div>
//
// 				<!-- 탭 -->
// 				<div class="tab-container">
// 					<div class="tab">목록</div>
// 				</div>
//
// 				<!-- 테이블 -->
// 				<div class="table-container">
// 					<div class="action-buttons">
// 						<button class="btn btn-secondary">엑셀 다운로드</button>
// 					</div>
//
// 					<div class="table-info">
// 						<span>${i18n.t('table.info.total')} <strong id="qualityWorkshopSummaryTotalCount">${totalQualityWorkshopSummaryCount}</strong> ${i18n.t('table.info.records')} |
// 							${i18n.t('table.page')} <strong id="qualityWorkshopSummaryCurrentPageInfo">${currentQualityWorkshopSummaryPage}</strong>/<strong id="qualityWorkshopSummaryTotalPageInfo">${totalQualityWorkshopSummaryPages}</strong> |
// 							${i18n.t('table.info.qty')} : <strong id = "qualityWorkshopSummaryTotalQty"></strong>
// 						</span>
// 						<div class="action-buttons-right mQuality_workshop_summary">
// 							<div id="defaultActions" class="action-group">
// 								<button class="btn btn-success" id="qualityWorkshopSummaryExcelBtn" onclick="downloadAllQualityWorkshopSummaryData()">Excel</button>
// 							</div>
// 						</div>
// 						<!--<div class="btnInterfaceCommon btnStorageItemsArea" style="margin-left:24px;">
// 							<input type="button" value="${i18n.t('btn.Intf')}" class="btn btn-success btnIntfStorage"/>
// 							<input type="button" value="${i18n.t('btn.Intf.delete')}" class="btn btn-warning btnIntfStorageDelete"/>
// 						</div>-->
// 					</div>
// 					<table class="data-table mQuality_workshop_summary">
// 						<thead>
// 							<tr>
// 								<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
// 								<!-- <th class = "statusVal">${i18n.t('table.status')}<!-- 상태 </th>-->
// 								<th class = "dateVal">${i18n.t('search.date')}<!-- DATE --></th>
// 								<th class = "factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
// 								<th class = "storageVal">${i18n.t('search.storage.from')}<!-- From STORAGE --></th>
// 								<th class = "storageVal">${i18n.t('search.storage.to')}<!-- To STORAGE --></th>
// 								<th class = "carVal">${i18n.t('search.car')}<!-- CAR --></th>
// 								<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
// 								<th class = "itemnameLongVal">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
// 								<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
// 							</tr>
// 						</thead>
// 						<tbody id="qualityWorkshopSummaryTableBody">
// 						</tbody>
// 					</table>
//
// 					<!-- 페이지네이션 -->
// 					<div class="pagination" id="qualityWorkshopSummaryPaginationContainer">
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	`;
// 	// = 위에 data-table, search-row i18n 부분 추가
// 	/*<button class="btn btn-success" id="qualityWorkshopSummaryExcelBtn" onclick="ExcelExporter.downloadExcel(filteredQualityWorkshopSummaryData, qualityWorkshopSummaryColumns, {fileName:'QualityWorkshopSummary', sheetName:'QualityWorkshopSummary'})">Excel</button>*/
// 	$(".w_contentArea").append(content_output);
//
// 	// ⬇️ 추가: 화면에 기본 날짜 세팅
// 	(function(){
// 		const { fromDate, toDate } = getDefaultDateRange();
// 		$("#qualityWorkshopSummary_searchVal_fromDate").val(fromDate);
// 		$("#qualityWorkshopSummary_searchVal_toDate").val(toDate);
// 		})();
//
// 	// 공장 및 창고 선택
// 	renderFactoryStorage();
// 	// 테이블 데이터 렌더링
// 	renderQualityWorkshopSummaryTableData();
// 	// 페이지네이션 렌더링
// 	renderQualityWorkshopSummaryPagination();
// 	// 이벤트 바인딩
// 	bindQualityWorkshopSummaryEvents();
// 	// 초기 렌더링 후 카운트 업데이트
// 	updateQualityWorkshopSummaryTotalCount();
// 	// 초기 렌더링 후 수량 업데이트
// 	updateQualityWorkshopSummaryTotalQty();
//
// }
//
// // 공장 및 창고 선택 함수
// function renderFactoryStorage() {
//     const factory = $('#qualityWorkshopSummary_searchVal_factory');
//     const storage1 = $('#qualityWorkshopSummary_searchVal_storage1');
//     const storage2 = $('#qualityWorkshopSummary_searchVal_storage2');
//     const savedFactory = getCookie('selectedFactory');
//
//     // 공장별 창고 옵션 설정
//     function updateStorageOptions(factoryValue) {
//         storage1.empty();
//         storage2.empty();
//
//         const options = {
//             'SALTILLO': ['REDCAGE', 'H/REST'],
//             'PUEBLA': ['REDCAGE', 'WORKSHOP']
//         };
//
//         const storageList = options[factoryValue] || options[''];
//
//         storageList.forEach(item => {
//             const text = item === 'all' ? i18n.t('search.all') : item;
//             storage1.append(`<option value="${item}">${text}</option>`);
//             storage2.append(`<option value="${item}">${text}</option>`);
//         });
//
//         // 첫 번째 옵션 선택
//         storage1.val(storageList[0]);
//         storage2.val(storageList[1]);
//     }
//
//     // 저장된 공장 선택
//     if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
//         factory.val(savedFactory);
//     }
//
//     updateStorageOptions(savedFactory || '');
//
//     // 공장 변경 시 창고 업데이트
//     factory.on('change', function() {
//         updateStorageOptions($(this).val());
//     });
//
// 	storage1.on('change', function() {
// 		const facVal = factory.val();
// 		const stoVal = $(this).val();
// 		if (facVal === 'SALTILLO'){
// 			storage2.val(stoVal === 'REDCAGE' ? "H/REST" : "REDCAGE");
// 		} else {
// 			storage2.val(stoVal === 'REDCAGE' ? "WORKSHOP" : "REDCAGE");
// 		}
// 	});
//
// 	storage2.on('change', function() {
// 		const facVal = factory.val();
// 		const stoVal = $(this).val();
// 		if (facVal === 'SALTILLO'){
// 			storage1.val(stoVal === 'REDCAGE' ? "H/REST" : "REDCAGE");
// 		} else {
// 			storage1.val(stoVal === 'REDCAGE' ? "WORKSHOP" : "REDCAGE");
// 		}
// 	});
// }
//
// // 정규식으로 쿠기 가져오기
// function getCookie(cookieName) {
//     const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//     return match ? decodeURIComponent(match[2]) : '';
// }
//
// // 총 개수를 업데이트하는 함수
// function updateQualityWorkshopSummaryTotalCount() {
// 	$('#qualityWorkshopSummaryTotalCount').text(totalQualityWorkshopSummaryCount);
// }
// // 총 개수를 업데이트하는 함수
// function updateQualityWorkshopSummaryTotalQty() {
// 	$('#qualityWorkshopSummaryTotalQty').text(totalQualityWorkshopSummaryQty.toLocaleString());
// }
// function renderQualityWorkshopSummaryTableData() {
// 	let tableBody = "";
//
// 	//console.log("globalQualityWorkshopSummaryData:", globalQualityWorkshopSummaryData);
// 	//console.log("데이터 개수:", globalQualityWorkshopSummaryData.length);
//
// 	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
// 	for (let i = 0; i < globalQualityWorkshopSummaryData.length; i++) {
// 		let rowNumber = (currentQualityWorkshopSummaryPage - 1) * qualityWorkshopSummaryItemsPerPage + i + 1;
//
// 		let data = globalQualityWorkshopSummaryData[i];
// 		//console.log(`행 ${i}:`, globalQualityWorkshopSummaryData[i]); // 각 행 데이터 확인
// 		let wccode = data.wccode.split('-')[1];
//
// 		tableBody += `
//         <tr>
//             <td class = "noVal">${rowNumber}</td>
//             <td class = "dateVal">${data.INDATE || data.indate || ''}</td>
// 			<td class = "factoryVal">${data.FACTORY || data.factory || ''}</td>
// 			<td class = "storageVal">${data.STORAGE || data.storage || ''}</td>
// 			<td class = "storageVal">${wccode}</td>
// 			<td class = "carVal">${data.CAR || data.car || ''}</td>
// 			<td class = "itemcodeVal">${data.ITEMCODE || data.itemcode || ''}</td>
// 			<td class = "itemnameLongVal">${data.ITEMNAME || data.itemname || ''}</td>
// 			<td class = "qtyVal">${Number(data.QTY || data.qty || 0).toLocaleString()}</td>
//         </tr>
//     `;
// 	}
// 	// =
// 	//console.log("생성된 tableBody:", tableBody);
// 	$("#qualityWorkshopSummaryTableBody").html(tableBody);
// }
//
// // 페이지네이션 렌더링
// function renderQualityWorkshopSummaryPagination() {
// 	let totalPages = Math.ceil(totalQualityWorkshopSummaryCount / qualityWorkshopSummaryItemsPerPage); // 변경
// 	let paginationHtml = "";
//
// 	// 이전 버튼
// 	if (currentQualityWorkshopSummaryPage > 1) {
// 		paginationHtml += `<button class="qualityWorkshopSummary-page-btn" data-page="${currentQualityWorkshopSummaryPage - 1}">&lt;</button>`;
// 	} else {
// 		paginationHtml += `<button class="qualityWorkshopSummary-page-btn disabled">&lt;</button>`;
// 	}
//
// 	// 페이지 번호 버튼들
// 	let startPage = Math.max(1, currentQualityWorkshopSummaryPage - 5);
// 	let endPage = Math.min(totalPages, currentQualityWorkshopSummaryPage + 5);
//
// 	// 첫 페이지
// 	if (startPage > 1) {
// 		paginationHtml += `<button class="qualityWorkshopSummary-page-btn" data-page="1">1</button>`;
// 		if (startPage > 2) {
// 			paginationHtml += `<span class="page-dots">...</span>`;
// 		}
// 	}
//
// 	// 중간 페이지들
// 	for (let i = startPage; i <= endPage; i++) {
// 		if (i === currentQualityWorkshopSummaryPage) {
// 			paginationHtml += `<button class="qualityWorkshopSummary-page-btn active" data-page="${i}">${i}</button>`;
// 		} else {
// 			paginationHtml += `<button class="qualityWorkshopSummary-page-btn" data-page="${i}">${i}</button>`;
// 		}
// 	}
//
// 	// 마지막 페이지
// 	if (endPage < totalPages) {
// 		if (endPage < totalPages - 1) {
// 			paginationHtml += `<span class="page-dots">...</span>`;
// 		}
// 		paginationHtml += `<button class="qualityWorkshopSummary-page-btn" data-page="${totalPages}">${totalPages}</button>`;
// 	}
//
// 	// 다음 버튼
// 	if (currentQualityWorkshopSummaryPage < totalPages) {
// 		paginationHtml += `<button class="qualityWorkshopSummary-page-btn" data-page="${currentQualityWorkshopSummaryPage + 1}">&gt;</button>`;
// 	} else {
// 		paginationHtml += `<button class="qualityWorkshopSummary-page-btn disabled">&gt;</button>`;
// 	}
//
// 	$('#qualityWorkshopSummaryTotalPageInfo').text(totalPages);
// 	$("#qualityWorkshopSummaryPaginationContainer").html(paginationHtml);
// }
//
// // 이벤트 바인딩
// function bindQualityWorkshopSummaryEvents() {
// 	// 검색 버튼 클릭 - DB에서 새로 조회
// 	$(".btnQualityWorkshopSummarySearch").off('click').on('click', function() {
// 		performQualityWorkshopSummarySearch();
// 	});
//
// 	// 초기화 버튼 클릭
// 	$(".btnQualityWorkshopSummarySearchInit").off('click').on('click', function() {
// 		resetQualityWorkshopSummarySearch();
// 	});
//
// 	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
// 	$(document).off('click', '.qualityWorkshopSummary-page-btn').on('click', '.qualityWorkshopSummary-page-btn', function() {
// 		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
// 			let page = parseInt($(this).data('page'));
// 			if (page && page > 0) {
// 				currentQualityWorkshopSummaryPage = page;
// 				// 현재 검색 조건으로 DB에서 새 페이지 조회
// 				let searchCriteria = getCurrentSearchCriteria();
// 				performQualityWorkshopSummaryDBSearch(searchCriteria);
// 			}
// 		}
// 	});
//
// 	// 엔터키 검색
// 	$('#view_mQuality_workshop_summary input[type="text"], #view_mQuality_workshop_summary input[type="date"]').off('keypress').on('keypress', function(e) {
// 		if (e.which === 13) {
// 			performQualityWorkshopSummarySearch();
// 		}
// 	});
// }
//
// // 현재 검색 조건 수집 함수
// function getCurrentSearchCriteria() {
// 	return {
// 		/*intf_yn: $("#qualityWorkshopSummary_searchVal_condition").val(),*/
// 		fromDate: $("#qualityWorkshopSummary_searchVal_fromDate").val(),
// 		toDate: $("#qualityWorkshopSummary_searchVal_toDate").val(),
// 		factory : $("#qualityWorkshopSummary_searchVal_factory").val(),
// 		storage1 : $("#qualityWorkshopSummary_searchVal_storage1").val(),
// 		storage2 : $("#qualityWorkshopSummary_searchVal_storage2").val(),
// 		car : $("#qualityWorkshopSummary_searchVal_car").val().trim().toUpperCase(),
// 		itemcode : $("#qualityWorkshopSummary_searchVal_itemcode").val().trim().toUpperCase(),
// 		itemname: $("#qualityWorkshopSummary_searchVal_itemname").val().trim().toUpperCase()
// 	};
// }
// // =
// // 검색 수행 함수 - DB 조회
// function performQualityWorkshopSummarySearch() {
// 	let searchCriteria = getCurrentSearchCriteria();
//
// 	console.log("검색 조건:", searchCriteria);
//
// 	// 페이지를 1로 초기화하고 DB에서 검색
// 	currentQualityWorkshopSummaryPage = 1;
// 	performQualityWorkshopSummaryDBSearch(searchCriteria);
// }
//
// // 검색 조건 초기화
// function resetQualityWorkshopSummarySearch() {
// 	const { fromDate, toDate } = getDefaultDateRange();
// 	const factory = getCookie('selectedFactory');
// 	renderFactoryStorage();
//
// 	$("#qualityWorkshopSummary_searchVal_condition").val('');
// 	$("#qualityWorkshopSummary_searchVal_fromDate").val(fromDate);
// 	$("#qualityWorkshopSummary_searchVal_toDate").val(toDate);
// 	$("#qualityWorkshopSummary_searchVal_car").val('');
// 	$("#qualityWorkshopSummary_searchVal_itemcode").val('');
// 	$("#qualityWorkshopSummary_searchVal_itemname").val('');
// 	// =
// 	// 초기화 후 전체 데이터 다시 조회
// 	currentQualityWorkshopSummaryPage = 1;
// 	performQualityWorkshopSummaryDBSearch({ fromDate, toDate, factory });
//
// 	console.log('검색 조건이 초기화되었습니다.');
// }
//
// // 날짜 형식 변환 함수들
// function formatDateToYYYYMMDD(dateStr) {
// 	if (!dateStr) return '';
// 	return dateStr.replace(/-/g, '');
// }
//
// function formatDateFromYYYYMMDD(dateStr) {
// 	if (!dateStr || dateStr.length !== 8) return '';
// 	return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
// }
//
// // 유틸리티 함수들
// window.changeQualityWorkshopSummaryItemsPerPage = function(newItemsPerPage) {
// 	qualityWorkshopSummaryItemsPerPage = newItemsPerPage;
// 	currentQualityWorkshopSummaryPage = 1;
// 	let searchCriteria = getCurrentSearchCriteria();
// 	performQualityWorkshopSummaryDBSearch(searchCriteria);
// }
//
// window.exportQualityWorkshopSummaryData = function() {
// 	return {
// 		total: globalQualityWorkshopSummaryData.length,
// 		currentPage: currentQualityWorkshopSummaryPage,
// 		itemsPerPage: qualityWorkshopSummaryItemsPerPage,
// 		data: globalQualityWorkshopSummaryData
// 	};
// }
//
// function fmtLocalDate(d){
// 	const y = d.getFullYear();
// 	const m = String(d.getMonth()+1).padStart(2,'0');
// 	const dd = String(d.getDate()).padStart(2,'0');
// 	return `${y}-${m}-${dd}`;
// }
//
// function getDefaultDateRange(){
// 	const today = new Date();
// 	const toDate = fmtLocalDate(today);
//     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
// 	const fromDate = fmtLocalDate(firstDayOfMonth);
// 	return { fromDate, toDate };
// }
//
// window.downloadAllQualityWorkshopSummaryData = function() {
// 	let searchCriteria = {
// 		fromDate : $("#qualityWorkshopSummary_searchVal_fromDate").val(),
// 		toDate : $("#qualityWorkshopSummary_searchVal_toDate").val(),
// 		factory : $("#qualityWorkshopSummary_searchVal_factory").val(),
// 		storage1 : $("#qualityWorkshopSummary_searchVal_storage1").val(),
// 		storage2 : $("#qualityWorkshopSummary_searchVal_storage2").val(),
// 		car : $("#qualityWorkshopSummary_searchVal_car").val().trim().toUpperCase(),
// 		itemcode : $("#qualityWorkshopSummary_searchVal_itemcode").val().trim().toUpperCase(),
// 		itemname: $("#qualityWorkshopSummary_searchVal_itemname").val().trim().toUpperCase()
// 	};
// 	// =
//
// 	showLoading("export");
//
// 	$.ajax({
// 		url: "/read_qualityWorkshopSummary_all",
// 		type: "POST",
// 		data: JSON.stringify({
// 			searchParams: searchCriteria
// 		}),
// 		contentType: "application/json",
// 		success: function(data) {
// 			console.log(data)
// 			ExcelExporter.downloadExcel(data, window.qualityWorkshopSummaryColumns, {
// 				fileName: 'QualityWorkshopSummary_All',
// 				sheetName: 'QualityWorkshopSummary'
// 			});
// 			hideLoading();
// 		},
// 		error: function() {
// 			alert("전체 데이터 조회에 실패했습니다.");
// 			hideLoading();
// 		}
// 	});
// };
