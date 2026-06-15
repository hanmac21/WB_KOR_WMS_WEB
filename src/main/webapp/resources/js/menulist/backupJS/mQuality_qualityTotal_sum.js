///* --------------------------------------------------------------
// * 📌 구매 - 재고 - 재고실사 (클라이언트 정렬/페이징 버전)
// * 비고: 초기 조회 시 전체 데이터를 받아두고, 정렬/페이징은 클라이언트에서 처리
// * -------------------------------------------------------------- */
//
//let allServerData = [];
//let filteredData = [];
//let globalQualityTotalSumData = [];
//let currentQualityTotalSumPage = 1;
//let qualityTotalSumItemsPerPage = 100;
//let totalQualityTotalSumCount = 0;
//let totalQualityTotalSumPages = 0;
//let currentSortColumn = null;
//let currentSortOrder = 'asc';
//
//let totalQty = 0;
//let totalOkQty = 0;
//let totalNgQty = 0;
//
//$(document).ready(function() {
//
//	window.filteredQualityTotalSumData = [];
//	window.qualityTotalSumColumns = [
//		{ key: 'SDATE', header: 'date' },
//		{ key: 'ITEMCODE', header: 'itemcode' },
//		{ key: 'ITEMNAME', header: 'itemname' },
//		{ key: 'CAR', header: 'car' },
//
//		{ key: 'QTY', header: 'qty', type: 'number' },
//		{ key: 'OKQTY', header: 'okqty', type: 'number' },
//		{ key: 'NGQTY', header: 'ngqty', type: 'number' },
//
//		{ key: 'LINE', header: 'line' },
//		{ key: 'SOURCE', header: 'source' },
//		{ key: 'SOURCE2', header: 'source2' },
//
//		{ key: 'MAINCATEGORY', header: 'maincategory' },
//		{ key: 'SUBCATEGORY', header: 'subcategory' },
//		{ key: 'DETAILCATEGORY', header: 'detailcategory' },     // ⚠️ HTML엔 DATAILCATEGORY 오타였음
//		{ key: 'JUDGMENT', header: 'judgment' },
//
//		{ key: 'CUSTNAME', header: 'custname' },
//		{ key: 'MEMO', header: 'memo' },
//		{ key: 'UNIT', header: 'unit' },
//	];
//
//	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
//	window.call_mQuality_qualityTotal_sum = function(menuId) {
//		showLoading("data");
//
//		const factory = getCookie('selectedFactory');
//		const { fromDate, toDate } = getDefaultDateRange();
//		let storage = 'Material';
//
//		performQualityTotalSumDBSearch({ factory, storage, toDate, fromDate });
//	}
//
//	// ============================================================
//	// ✅ 총합(전체 records 기준) 계산 유틸
//	// ============================================================
//	function toNumberSafe(v) {
//		if (v === null || v === undefined) return 0;
//		let s = String(v).trim();
//		if (!s) return 0;
//
//		// "1,234.56" 같은 케이스 대응
//		s = s.replace(/,/g, '');
//
//		const n = Number(s);
//		return Number.isFinite(n) ? n : 0;
//	}
//
//	function calcTotalsFromRows(rows) {
//		let tQty = 0;
//		let tOk = 0;
//		let tNg = 0;
//
//		for (let i = 0; i < rows.length; i++) {
//			const r = rows[i] || {};
//			tQty += toNumberSafe(r.QTY ?? r.qty);
//			tOk += toNumberSafe(r.OKQTY ?? r.okqty);
//			tNg += toNumberSafe(r.NGQTY ?? r.ngqty);
//		}
//
//		return { tQty, tOk, tNg };
//	}
//	// DB에서 전체 데이터 조회 (검색 조건 변경 시에만 호출)
//	function performQualityTotalSumDBSearch(searchCriteria) {
//		showLoading("data");
//
//		$.ajax({
//			url: "/read_qualityTotalSum",
//			type: "POST",
//			data: JSON.stringify({
//				searchParams: searchCriteria
//				// page, itemsPerPage 없음 = 전체 조회
//			}),
//			contentType: "application/json",
//			success: function(response) {
//				console.log("-- DB 조회 결과 (전체) --");
//				console.log(response);
//
//				allServerData = response.records || [];
//				filteredData = [...allServerData];
//
//				// ✅ records[0]에 TOTALQTY/TOTALOKQTY/TOTALNGQTY가 붙어서 내려오는 케이스 대응
//				const first = filteredData[0] || {};
//
//				const serverTotalQty =
//					response.totalQty ?? first.TOTALQTY ?? first.totalqty ?? first.totalQty;
//				const serverTotalOk =
//					response.totalOkQty ?? first.TOTALOKQTY ?? first.totalokqty ?? first.totalOkQty;
//				const serverTotalNg =
//					response.totalNgQty ?? first.TOTALNGQTY ?? first.totalngqty ?? first.totalNgQty;
//
//				const hasServerTotals =
//					serverTotalQty !== undefined || serverTotalOk !== undefined || serverTotalNg !== undefined;
//
//				if (hasServerTotals) {
//					totalQty = toNumberSafe(serverTotalQty);
//					totalOkQty = toNumberSafe(serverTotalOk);
//					totalNgQty = toNumberSafe(serverTotalNg);
//				} else {
//					// ✅ 서버 totals가 정말 없으면 클라이언트 합산
//					const t = calcTotalsFromRows(filteredData);
//					totalQty = t.tQty;
//					totalOkQty = t.tOk;
//					totalNgQty = t.tNg;
//				}
//
//				currentQualityTotalSumPage = 1;
//				currentSortColumn = null;
//				currentSortOrder = 'asc';
//
//				applyClientPagination();
//
//				if (!$('#view_mQuality_qualityTotal_sum').length) {
//					renderQualityTotalSumView();
//				} else {
//					renderQualityTotalSumTableData();
//					renderQualityTotalSumPagination();
//					updateQualityTotalSumTotalCount();
//				}
//
//				setTimeout(updateTotalQty, 0);
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
//	// 클라이언트에서 페이징 처리
//	function applyClientPagination() {
//		// ✅ 렌더링할 때마다 쿠키에서 읽기
//		qualityTotalSumItemsPerPage = parseInt(getCookie('itemsPerPage')) || 100;
//
//		totalQualityTotalSumCount = filteredData.length;
//		totalQualityTotalSumPages = Math.ceil(totalQualityTotalSumCount / qualityTotalSumItemsPerPage);
//
//		// 현재 페이지 범위 계산
//		const startIndex = (currentQualityTotalSumPage - 1) * qualityTotalSumItemsPerPage;
//		const endIndex = startIndex + qualityTotalSumItemsPerPage;
//
//		// 현재 페이지 데이터 추출
//		globalQualityTotalSumData = filteredData.slice(startIndex, endIndex);
//		window.filteredQualityTotalSumData = globalQualityTotalSumData;
//	}
//
//	// 클라이언트에서 정렬 처리
//	function applyClientSort(column, dataType) {
//		// 같은 컬럼 클릭 시 정렬 방향 토글
//		if (currentSortColumn === column) {
//			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
//		} else {
//			currentSortColumn = column;
//			currentSortOrder = 'asc';
//		}
//
//		// 데이터 정렬
//		filteredData.sort((a, b) => {
//			let valA = a[column] || a[column.toLowerCase()] || '';
//			let valB = b[column] || b[column.toLowerCase()] || '';
//
//			// 데이터 타입별 처리
//			if (dataType === 'number') {
//				valA = parseFloat(valA) || 0;
//				valB = parseFloat(valB) || 0;
//			} else if (dataType === 'date') {
//				valA = new Date(valA).getTime() || 0;
//				valB = new Date(valB).getTime() || 0;
//			} else {
//				valA = String(valA).toUpperCase();
//				valB = String(valB).toUpperCase();
//			}
//
//			if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
//			if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
//			return 0;
//		});
//
//		// 페이지 1로 초기화 후 다시 페이징
//		currentQualityTotalSumPage = 1;
//		applyClientPagination();
//
//		// 테이블 업데이트
//		renderQualityTotalSumTableData();
//		renderQualityTotalSumPagination();
//		updateQualityTotalSumTotalCount();
//
//		// 헤더에 정렬 표시 업데이트
//		updateSortIndicators(column);
//	}
//
//	// 헤더에 정렬 방향 표시
//	function updateSortIndicators(column) {
//		$('.data-table thead th').removeClass('sort-asc sort-desc');
//		$(`.data-table thead th[data-sort="${column}"]`).addClass(`sort-${currentSortOrder}`);
//	}
//
//	// 사용자 뷰 렌더링 함수
//	function renderQualityTotalSumView() {
//		let content_output = `
//			<div class="divBlockControl" id="view_mQuality_qualityTotal_sum">
//				<div class="content-body">
//					<!-- 검색 영역 -->
//					<div class="search-area">
//						<div class="search-row">
//							<div class="search-label">
//								<div class="searchVal_fromDate">${i18n.t('search.date')}<!-- DATE --></div>
//								<input type="date" id="qualityTotalSum_searchVal_fromDate" /> 
//							</div>
//							<div class="search-label">
//								<div class="searchVal_toDate">　</div>
//								<input type="date" id="qualityTotalSum_searchVal_toDate" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_factory">${i18n.t('search.factory')}</div>
//								<select id="qualityTotalSum_searchVal_factory" class="factory-select">
//									<option value="SALTILLO">Saltillo</option>
//									<option value="PUEBLA">Puebla</option>
//									<option value="all">${i18n.t('search.all')} </option>
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
//								<select id="qualityTotalSum_searchVal_storage" >
//									<!-- 동적으로 추가 -->
//								</select>
//							</div>
//							<div class="search-label">
//								<div class="searchVal_car">${i18n.t('search.car')}<!-- CAR --></div>
//								<input type="text" id="qualityTotalSum_searchVal_car" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemcode">${i18n.t('search.itemCode')}<!-- ITEMCODE --></div>
//								<input type="text" id="qualityTotalSum_searchVal_itemcode" />
//							</div>
//							<div class="search-label">
//								<div class="searchVal_itemname">${i18n.t('search.itemName')}<!-- ITEMNAME --></div>
//								<input type="text" id="qualityTotalSum_searchVal_itemname" />
//							</div>
//						</div>
//						<div class="search_button_area">
//							<button class="btn btn-primary btnQualityTotalSumSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
//							<button class="btn btn-secondary btnQualityTotalSumSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
//						</div>
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
//							<span>
//								${i18n.t('table.info.total')}
//								<strong id="qualityTotalSumTotalCount">${totalQualityTotalSumCount}</strong>
//								${i18n.t('table.info.records')}
//								|
//								${i18n.t('table.page')}
//								<strong id="qualityTotalSumCurrentPageInfo">${currentQualityTotalSumPage}</strong>/
//								<strong id="qualityTotalSumTotalPageInfo">${totalQualityTotalSumPages}</strong>
//								|
//								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span>
//								<span class="qualityTotalSumTotalQty" style="color:#007bff"></span>
//						
//								<span style="margin-left:10px;">OK : </span>
//								<span class="qualityTotalSumTotalOkQty" style="color:#28a745"></span>
//						
//								<span style="margin-left:10px;">NG : </span>
//								<span class="qualityTotalSumTotalNgQty" style="color:#dc3545"></span>
//							</span>
//						
//							<div class="action-buttons-right mQuality_qualityTotal_sum">
//								<div id="defaultActions" class="action-group">
//									<button class="btn btn-success" id="qualityTotalSumExcelBtn" onclick="downloadAllQualityTotalSumData()">Excel</button>
//								</div>
//							</div>
//						</div>
//
//						<table class="data-table mQuality_qualityTotal_sum" id="qualityTotalSumTable">
//							<thead>
//								<tr>
//									<th class="noVal">${i18n.t('table.no')}<!-- No --></th>
//									<th class="dateVal" data-sort="SDATE">${i18n.t('search.sdate')}<!-- ITEMCODE --></th>
//									<th class="itemcodeVal" data-sort="ITEMCODE">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
//									<th class="itemnameVal" data-sort="ITEMNAME">${i18n.t('search.itemName')}<!-- ITEMNAME --></th>
//									<th class="carVal" data-sort="CAR">${i18n.t('search.car')}<!-- CAR --></th>
//									<th class="qtyVal" data-sort="QTY" data-type="number">${i18n.t('search.qty')}<!-- Qty --></th>
//									<th class="qtyVal" data-sort="OKQTY" data-type="number">${i18n.t('search.okqty')}<!-- OKQty --></th>
//									<th class="qtyVal" data-sort="NGQTY" data-type="number">${i18n.t('search.ngqty')}<!-- NGQty --></th>
//									<th class="qtyVal" data-sort="LINE">${i18n.t('search.lineno')}<!-- LINE --></th>
//									<th class="qtyVal" data-sort="SOURCE">${i18n.t('search.source')}<!-- SOURCE --></th>
//									<th class="qtyVal" data-sort="SOURCE2">Source2<!-- SOURCE --></th>
//									<th class="qtyVal" data-sort="MAINCATEGORY">${i18n.t('search.maincategory')}<!-- MAINCATEGORY --></th>
//									<th class="qtyVal">Sub Category<!-- No --></th>
//									<th class="qtyVal">Detail Category<!-- No --></th>
//									<th class="qtyVal">Judgment<!-- No --></th>
//									<th class="itemnameVal">${i18n.t('search.custname')}<!-- No --></th>
//									<th class="qtyVal">${i18n.t('search.memo')}<!-- No --></th>
//									<th class="qtyVal">Unit<!-- No --></th>
//								</tr>
//							</thead>
//							<tbody id="qualityTotalSumDetailTableBody">
//							</tbody>
//						</table>
//						
//						<!-- 페이지네이션 -->
//						<div class="pagination" id="qualityTotalSumPaginationContainer">
//						</div>
//						<div class="items-per-page-selector">
//					        <label for="qualityTotalSum_itemsPerPage">${i18n.t('table.itemsPerPage')}:</label>
//					        <select id="qualityTotalSum_itemsPerPage" class="items-per-page-select">
//					            <option value="100" selected>100</option>
//					            <option value="300">300</option>
//					            <option value="1000">1000</option>
//					        </select>
//					    </div>
//					</div>
//				</div>
//			</div>
//		`;
//
//		$(".w_contentArea").append(content_output);
//
//		// 화면에 기본 날짜 세팅
//		(function() {
//			const { fromDate, toDate } = getDefaultDateRange();
//			$("#qualityTotalSum_searchVal_toDate").val(toDate);
//			$("#qualityTotalSum_searchVal_fromDate").val(fromDate);
//
//			// ✅ Select 초기값 설정 추가!
//			$("#qualityTotalSum_itemsPerPage").val(qualityTotalSumItemsPerPage);
//		})();
//
//		// 공장 및 창고 선택
//		renderFactoryStorage();
//		// 테이블 데이터 렌더링
//		renderQualityTotalSumTableData();
//		// 페이지네이션 렌더링
//		renderQualityTotalSumPagination();
//		// 이벤트 바인딩
//		bindQualityTotalSumEvents();
//		// 초기 렌더링 후 카운트 업데이트
//		updateQualityTotalSumTotalCount();
//	}
//
//	function fmtLocalDate(d) {
//		const y = d.getFullYear();
//		const m = String(d.getMonth() + 1).padStart(2, '0');
//		const dd = String(d.getDate()).padStart(2, '0');
//		return `${y}-${m}-${dd}`;
//	}
//
//	function getDefaultDateRange() {
//		const today = new Date();
//		const toDate = fmtLocalDate(today);
//		const fromDate = fmtLocalDate(today);
//		return { fromDate, toDate };
//	}
//
//	// 공장 및 창고 선택 함수
//	function renderFactoryStorage() {
//		const factory = $('#qualityTotalSum_searchVal_factory');
//		const storage = $('#qualityTotalSum_searchVal_storage');
//		const savedFactory = getCookie('selectedFactory');
//
//		function updateStorageOptions(factoryValue) {
//			storage.empty();
//
//			const options = {
//				'SALTILLO': ['Material', 'Fabric', 'Side seat', 'Outside', 'Material+Sideseat+Outside', 'all'],
//				'PUEBLA': ['Material', 'PRODUCT', 'all'],
//				'': ['Material', 'Fabric', 'Side seat', 'Outside', 'PRODUCT', 'all']
//			};
//
//			const storageSum = options[factoryValue] || options[''];
//
//			storageSum.forEach(item => {
//				const text = item === 'all' ? i18n.t('search.all') : item;
//				storage.append(`<option value="${item}">${text}</option>`);
//			});
//
//			storage.val(storageSum[0]);
//		}
//
//		if (savedFactory && factory.find(`option[value="${savedFactory}"]`).length) {
//			factory.val(savedFactory);
//		}
//
//		updateStorageOptions(savedFactory || '');
//
//		factory.on('change', function() {
//			updateStorageOptions($(this).val());
//		});
//	}
//
//	function getCookie(cookieName) {
//		const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//		return match ? decodeURIComponent(match[2]) : '';
//	}
//
//	// ✅ 추가!
//	function setCookie(cookieName, value, days = 365) {
//		const date = new Date();
//		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//		const expires = "expires=" + date.toUTCString();
//		document.cookie = cookieName + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
//	}
//
//	function updateQualityTotalSumTotalCount() {
//		$('#qualityTotalSumTotalCount').text(Number(totalQualityTotalSumCount).toLocaleString());
//		$('#qualityTotalSumCurrentPageInfo').text(currentQualityTotalSumPage);
//		$('#qualityTotalSumTotalPageInfo').text(totalQualityTotalSumPages);
//	}
//
//	function renderQualityTotalSumTableData() {
//		let tableBody = "";
//
//		for (let i = 0; i < globalQualityTotalSumData.length; i++) {
//			let rowNumber = (currentQualityTotalSumPage - 1) * qualityTotalSumItemsPerPage + i + 1;
//
//			tableBody += `
//            <tr>
//                <td class="noVal">${rowNumber}</td>
//                <td class="dateVal">${globalQualityTotalSumData[i].SDATE || globalQualityTotalSumData[i].sdate || ''}</td>
//                <td class="itemcodeVal">${globalQualityTotalSumData[i].ITEMCODE || globalQualityTotalSumData[i].itemcode || ''}</td>
//                <td class="itemnameVal">${globalQualityTotalSumData[i].ITEMNAME || globalQualityTotalSumData[i].itemname || ''}</td>
//                <td class="carVal">${globalQualityTotalSumData[i].CAR || globalQualityTotalSumData[i].car || ''}</td>
//                <td class="qtyVal">${Number(globalQualityTotalSumData[i].QTY || globalQualityTotalSumData[i].qty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalQualityTotalSumData[i].OKQTY || globalQualityTotalSumData[i].okqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${Number(globalQualityTotalSumData[i].NGQTY || globalQualityTotalSumData[i].ngqty || 0).toLocaleString()}</td>
//                <td class="qtyVal">${globalQualityTotalSumData[i].LINE || globalQualityTotalSumData[i].line || ''}</td>
//                <td class="qtyVal">${globalQualityTotalSumData[i].SOURCE || globalQualityTotalSumData[i].source || ''}</td>
//                <td class="qtyVal">${globalQualityTotalSumData[i].SOURCE2 || globalQualityTotalSumData[i].source2 || ''}</td>
//                <td class="qtyVal">${globalQualityTotalSumData[i].MAINCATEGORY || globalQualityTotalSumData[i].maincategory || ''}</td>
//                <td class="qtyVal">${globalQualityTotalSumData[i].SUBCATEGORY || globalQualityTotalSumData[i].subcategory || ''}</td>
//                <td class="qtyVal">${globalQualityTotalSumData[i].DETAILCATEGORY || globalQualityTotalSumData[i].detailcategory || ''}</td>
//                <td class="qtyVal">${globalQualityTotalSumData[i].JUDGMENT || globalQualityTotalSumData[i].judgement || ''}</td>
//                <td class="itemnameVal">${globalQualityTotalSumData[i].CUSTNAME || globalQualityTotalSumData[i].custname || ''}</td>
//                <td class="qtyVal">${globalQualityTotalSumData[i].MEMO || globalQualityTotalSumData[i].memo || ''}</td>
//                <td class="qtyVal">${globalQualityTotalSumData[i].UNIT || globalQualityTotalSumData[i].unit || ''}</td>
//                
//            </tr>
//        `;
//		}
//
//		$("#qualityTotalSumDetailTableBody").html(tableBody);
//	}
//
//	function renderQualityTotalSumPagination() {
//		let paginationHtml = "";
//
//		if (currentQualityTotalSumPage > 1) {
//			paginationHtml += `<button class="qualityTotalSum-page-btn" data-page="${currentQualityTotalSumPage - 1}">&lt;</button>`;
//		} else {
//			paginationHtml += `<button class="qualityTotalSum-page-btn disabled">&lt;</button>`;
//		}
//
//		let startPage = Math.max(1, currentQualityTotalSumPage - 5);
//		let endPage = Math.min(totalQualityTotalSumPages, currentQualityTotalSumPage + 5);
//
//		if (startPage > 1) {
//			paginationHtml += `<button class="qualityTotalSum-page-btn" data-page="1">1</button>`;
//			if (startPage > 2) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//		}
//
//		for (let i = startPage; i <= endPage; i++) {
//			if (i === currentQualityTotalSumPage) {
//				paginationHtml += `<button class="qualityTotalSum-page-btn active" data-page="${i}">${i}</button>`;
//			} else {
//				paginationHtml += `<button class="qualityTotalSum-page-btn" data-page="${i}">${i}</button>`;
//			}
//		}
//
//		if (endPage < totalQualityTotalSumPages) {
//			if (endPage < totalQualityTotalSumPages - 1) {
//				paginationHtml += `<span class="page-dots">...</span>`;
//			}
//			paginationHtml += `<button class="qualityTotalSum-page-btn" data-page="${totalQualityTotalSumPages}">${totalQualityTotalSumPages}</button>`;
//		}
//
//		if (currentQualityTotalSumPage < totalQualityTotalSumPages) {
//			paginationHtml += `<button class="qualityTotalSum-page-btn" data-page="${currentQualityTotalSumPage + 1}">&gt;</button>`;
//		} else {
//			paginationHtml += `<button class="qualityTotalSum-page-btn disabled">&gt;</button>`;
//		}
//
//		$("#qualityTotalSumPaginationContainer").html(paginationHtml);
//	}
//
//	function bindQualityTotalSumEvents() {
//		// 검색 버튼 클릭 - DB에서 새로 조회
//		$(".btnQualityTotalSumSearch").off('click').on('click', function() {
//			performQualityTotalSumSearch();
//		});
//
//		// 초기화 버튼 클릭
//		$(".btnQualityTotalSumSearchInit").off('click').on('click', function() {
//			resetQualityTotalSumSearch();
//		});
//
//		// ✅ 페이지당 항목 수 변경 이벤트 추가
//		$('#qualityTotalSum_itemsPerPage').off('change').on('change', function() {
//			const newItemsPerPage = parseInt($(this).val());
//			changeQualityTotalSumItemsPerPage(newItemsPerPage);
//		});
//
//		// 페이지네이션 버튼 클릭 - 클라이언트에서 페이징 처리
//		$(document).off('click', '.qualityTotalSum-page-btn').on('click', '.qualityTotalSum-page-btn', function() {
//			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
//				let page = parseInt($(this).data('page'));
//				if (page && page > 0) {
//					currentQualityTotalSumPage = page;
//					applyClientPagination();
//					renderQualityTotalSumTableData();
//					renderQualityTotalSumPagination();
//					updateQualityTotalSumTotalCount();
//				}
//			}
//		});
//
//		// 헤더 클릭 시 정렬
//		$('#qualityTotalSumTable thead th[data-sort]').off('click').on('click', function() {
//			const column = $(this).data('sort');
//			const dataType = $(this).data('type') || 'string';
//			applyClientSort(column, dataType);
//		});
//
//		// 엔터키 검색
//		$('#view_mQuality_qualityTotal_sum input[type="text"], #view_mQuality_qualityTotal_sum input[type="date"]').off('keypress').on('keypress', function(e) {
//			if (e.which === 13) {
//				performQualityTotalSumSearch();
//			}
//		});
//	}
//
//	function getCurrentSearchCriteria() {
//		return {
//			fromDate: $("#qualityTotalSum_searchVal_fromDate").val(),
//			toDate: $("#qualityTotalSum_searchVal_toDate").val(),
//			factory: $("#qualityTotalSum_searchVal_factory").val(),
//			storage: $("#qualityTotalSum_searchVal_storage").val(),
//			car: $("#qualityTotalSum_searchVal_car").val().trim().toUpperCase(),
//			itemcode: $("#qualityTotalSum_searchVal_itemcode").val().trim().toUpperCase(),
//			itemname: $("#qualityTotalSum_searchVal_itemname").val().trim().toUpperCase()
//		};
//	}
//
//	function performQualityTotalSumSearch() {
//		let searchCriteria = getCurrentSearchCriteria();
//		console.log("검색 조건:", searchCriteria);
//
//		currentQualityTotalSumPage = 1;
//		performQualityTotalSumDBSearch(searchCriteria);
//	}
//
//	function resetQualityTotalSumSearch() {
//		const factory = getCookie('selectedFactory');
//		const storage = 'Material';
//		const { fromDate, toDate } = getDefaultDateRange();
//
//		$("#qualityTotalSum_searchVal_fromDate").val(fromDate);
//		$("#qualityTotalSum_searchVal_toDate").val(toDate);
//		$("#qualityTotalSum_searchVal_factory").val(factory);
//		$("#qualityTotalSum_searchVal_storage").val('Material');
//		$("#qualityTotalSum_searchVal_car").val('');
//		$("#qualityTotalSum_searchVal_itemcode").val('');
//		$("#qualityTotalSum_searchVal_itemname").val('');
//
//		currentQualityTotalSumPage = 1;
//		performQualityTotalSumDBSearch({ factory, storage, toDate, fromDate });
//
//		console.log('검색 조건이 초기화되었습니다.');
//	}
//
//	function updateTotalQty() {
//		const $wrap = $("#view_mQuality_qualityTotal_sum");
//
//		// ✅ 뷰가 아직 안 만들어졌으면(또는 제거되었으면) 잠깐 뒤 재시도
//		if ($wrap.length === 0) {
//			setTimeout(updateTotalQty, 50);
//			return;
//		}
//
//		// ✅ totals span이 아직 없으면(렌더 타이밍) 잠깐 뒤 재시도
//		const $qty = $wrap.find(".qualityTotalSumTotalQty");
//		const $ok = $wrap.find(".qualityTotalSumTotalOkQty");
//		const $ng = $wrap.find(".qualityTotalSumTotalNgQty");
//
//		if ($qty.length === 0 || $ok.length === 0 || $ng.length === 0) {
//			setTimeout(updateTotalQty, 50);
//			return;
//		}
//
//		$qty.text(Number(totalQty || 0).toLocaleString());
//		$ok.text(Number(totalOkQty || 0).toLocaleString());
//		$ng.text(Number(totalNgQty || 0).toLocaleString());
//	}
//
//
//	window.changeQualityTotalSumItemsPerPage = function(newItemsPerPage) {
//		qualityTotalSumItemsPerPage = newItemsPerPage;
//		currentQualityTotalSumPage = 1; // 페이지를 1로 초기화
//
//		// ✅ 쿠키에 저장 추가!
//		setCookie('itemsPerPage', newItemsPerPage);
//
//		applyClientPagination();
//		renderQualityTotalSumTableData();
//		renderQualityTotalSumPagination();
//		updateQualityTotalSumTotalCount();
//
//		console.log(`페이지당 항목 수가 ${newItemsPerPage}개로 변경되었습니다.`);
//	}
//
//	window.exportQualityTotalSumData = function() {
//		return {
//			total: filteredData.length,
//			currentPage: currentQualityTotalSumPage,
//			itemsPerPage: qualityTotalSumItemsPerPage,
//			data: filteredData
//		};
//	}
//});
//
//// 전체 데이터 엑셀 다운로드
//window.downloadAllQualityTotalSumData = function() {
//	let searchCriteria = {
//		fromDate: $("#qualityTotalSum_searchVal_fromDate").val(),
//		toDate: $("#qualityTotalSum_searchVal_toDate").val(),
//		factory: $("#qualityTotalSum_searchVal_factory").val(),
//		storage: $("#qualityTotalSum_searchVal_storage").val(),
//		car: $("#qualityTotalSum_searchVal_car").val().trim().toUpperCase(),
//		itemcode: $("#qualityTotalSum_searchVal_itemcode").val().trim().toUpperCase(),
//		itemname: $("#qualityTotalSum_searchVal_itemname").val().trim().toUpperCase()
//	};
//
//	showLoading("export");
//
//	$.ajax({
//		url: "/read_qualityTotalSum",
//		type: "POST",
//		data: JSON.stringify({
//			searchParams: searchCriteria
//		}),
//		contentType: "application/json",
//		success: function(response) {
//			console.log(response);
//
//			const excelRows = response.records || [];
//
//			ExcelExporter.downloadExcel(excelRows, window.qualityTotalSumColumns, {
//				fileName: 'qualityTotalSum_All',
//				sheetName: 'qualityTotalSum'
//			});
//
//			hideLoading();
//		},
//		error: function() {
//			alert("전체 데이터 조회에 실패했습니다.");
//			hideLoading();
//		}
//	});
//};