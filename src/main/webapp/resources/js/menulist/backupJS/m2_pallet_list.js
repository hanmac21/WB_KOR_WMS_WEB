/*
/!* --------------------------------------------------------------
 * 📌 구매 - 팔레트라벨 - 팔레트라벨 목록
 * 비고: 체크박스 기능 추가 (GlobalIndex 오류 수정)
 * -------------------------------------------------------------- *!/

$(document).ready(function() {

	let globalPalletData = []; // 전체 사용자 데이터 저장
	let currentPalletPage = 1; // 현재 페이지
	let palletItemsPerPage = 1000; // 페이지당 항목 수
	let filteredPalletData = []; // 검색 필터링된 데이터

	window.call_m2_pallet_list = function() {

		showLoading("data");

		$.ajax({
			url: "/read_pallet",
			type: "POST",
			data: JSON.stringify(),
			contentType: "application/json",
			success: function(data) {
				console.log("-- 조회. 팔레트 라벨 리스트 --")
				console.log(data)

				globalPalletData = data;
				filteredPalletData = data;
				currentPalletPage = 1;

				renderPalletView();

				updateTotalQty()

				if (typeof window.initAccordionMenu === 'function') {
					window.initAccordionMenu();
				}

				hideLoading()

			}
		});



	}

	function updateTotalQty(searchMap) {
		if (!searchMap) {
			searchMap = {}; // null이면 빈 객체로 변경
		}

		const startdate = $('#searchVal_pallet_startdate').val();
		const enddate = $('#searchVal_pallet_enddate').val();

		console.log(startdate);
		console.log(enddate);

		searchMap.startdate = startdate;
		searchMap.enddate = enddate;

		console.log(searchMap);

		$.ajax({
			url: "/updateTotalQty_palletList",
			type: "POST",
			data: JSON.stringify(searchMap),
			contentType: "application/json",
			success: function(data) {
				$(".palletListTotalQty").text(Number(data).toLocaleString());
			},
			error: function(xhr, status, error) {
				console.error("요청 실패");
				console.error("Status:", status);       // 예: "error"
				console.error("Error:", error);         // 예: 서버 응답 메시지
				console.error("Response:", xhr.responseText); // 서버 응답 본문
				alert("오류가 발생했습니다: " + error);
			}
		});
	}

	// 사용자 뷰 렌더링 함수
	function renderPalletView() {
		let content_output = `
			<div class="divBlockControl" id="view_m2_pallet_list">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row m2_pallet_list">
							<div class="search-label m2_pallet_list">
								<div class="search_pallet_startdate">${i18n.t('search.date')}<!-- START DATE --></div>
								<input type="date" id="searchVal_pallet_startdate" />
							</div>
							<div class="search-label m2_pallet_list">
								<div class="search_pallet_enddate">　<!-- END DATE --></div>
								<input type="date" id="searchVal_pallet_enddate" />
							</div>
							<div class="search-label m2_pallet_list">
								<div class="search_pallet_barcode">${i18n.t('search.barcode')}<!-- BARCODE --></div>
								<input type="text" id="searchVal_pallet_barcode" />
							</div>
							<div class="search-label m2_pallet_list">
								<div class="search_cucode">${i18n.t('search.cucode')}<!-- PARTNER CODE --></div>
								<input type="text" id="searchVal_pallet_cucode" />
							</div>
							<div class="search-label m2_pallet_list">
								<div class="search_cname">${i18n.t('search.cname')}<!-- PARTNER NAME --></div>
								<input type="text" id="searchVal_pallet_cname" />
							</div>
							<div class="search-label m2_pallet_list">
								<div class="search_itemcode">${i18n.t('search.itemCode')}<!-- ITEM CODE --></div>
								<input type="text" id="searchVal_pallet_itemcode" />
							</div>
							<div class="search-label m2_pallet_list">
								<div class="search_itemcode">${i18n.t('search.issue')}<!-- ISSUE --></div>
								<select style="height:27px;" id ="searchVal_pallet_issue">
									<option value = "all">${i18n.t('search.all')}<!-- All --></option>
									<option value = "Y">${i18n.t('search.issued')}<!-- Issued --></option>
									<option value = "N">${i18n.t('search.notIssued')}<!-- Not Issued --></option>
								</select>
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnPalletSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnPalletSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
							</div>

					</div>

					<!-- 탭 -->
					<div class="tab-container">
						<div class="tab">목록</div>
					</div>

					<!-- 테이블 -->
					<div class="table-container">
						<div class="action-buttons">
							<button class="btn btn-success">신규 등록</button>
							<button class="btn btn-primary">수정</button>
							<button class="btn btn-secondary">삭제</button>
							<button class="btn btn-secondary">엑셀 다운로드</button>
						</div>

						<div class="table-info">
							<span>${i18n.t('table.info.total')} <strong id="palletTotalCount">${filteredPalletData.length}</strong> ${i18n.t('table.info.records')} |
								${i18n.t('table.page')} <strong id="palletCurrentPageInfo">${currentPalletPage}</strong>/<strong id="palletTotalPageInfo">${Math.ceil(filteredPalletData.length / palletItemsPerPage)}</strong> |
								<!-- ${i18n.t('table.selectItems')} : <strong id="selectedCount">0</strong>${i18n.t('table.info.records')} | -->
								<span class="tqtyTitle">${i18n.t('table.info.qty')} : </span><span class="palletListTotalQty" style="color:#007bff"></span>
							</span>
							<div class="action-buttons-right m2_pallet_list">
	                            <!-- 기본 상태: 신규 등록 버튼만 표시 -->

	                            <!-- 선택 상태: 수정/삭제/취소 버튼 표시 -->
	                            <div id="selectedActions" class="action-group" style="display: none;">
	                                <button class="btn btn-primary" id="btnEdit_warehouse">수정</button>
	                                <button class="btn btn-danger" id="btnDelete_warehouse">삭제</button>
	                                <button class="btn btn-secondary" id="btnCancel_warehouse">취소</button>
	                            </div>
	                        </div>

						</div>

						<table class="data-table m2_pallet_list">
							<thead>
								<tr>
									<th class = "noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class = "dateVal">${i18n.t('table.date')}<!-- DATE --></th>
									<th class = "barcodeVal">${i18n.t('search.barcode')}<!-- BARCODE --></th>
									<th class = "cucodeVal">${i18n.t('search.cucode')}<!-- PARTNER CODE --></th>
									<th class = "cnameVal">${i18n.t('search.cname')}<!-- PARTNER NAME --></th>
									<th class = "itemcodeVal">${i18n.t('search.itemCode')}<!-- ITEMCODE --></th>
									<th class = "qtyVal">${i18n.t('search.qty')}<!-- QTY --></th>
									<th class = "scanqtyVal">${i18n.t('search.boxcount')}<!-- BOX COUNT --></th>
									<th class = "statusVal">${i18n.t('table.status')}<!-- STATUS --></th>
									<th><input type = 'checkbox' class="pallet_printChkAll"><button class='btn print-btn pallet_printChkAll' onclick = 'palletAll()'>${i18n.t('btn.issue.all')}<!-- Print All --></button></th>
									<th><input type = 'checkbox' class="pallet_deleteChkAll"><button class= 'btn del-btn pallet_deleteChkAll' onclick = 'fnAllDel()'>${i18n.t('btn.delete')}<!-- Delete --></button></th>
								</tr>
							</thead>
							<tbody id="palletTableBody">
							</tbody>
						</table>

						<!-- 페이지네이션 -->
						<div class="pagination" id="palletPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;

		//$(".w_contentArea").html(content_output);

		$(".w_contentArea").append(content_output); // 기존 내용 보존 + 새 뷰 추가

		// 날짜 기본값 세팅
		const { fromDate, toDate } = getDefaultDateRange();
		$("#searchVal_pallet_startdate").val(fromDate);
		$("#searchVal_pallet_enddate").val(toDate);

		// 테이블 데이터 렌더링
		renderPalletTableData();

		// 페이지네이션 렌더링
		renderPalletPagination();

		// 이벤트 바인딩
		bindPalletEvents();

	}

	function getDefaultDateRange() {
		const today = new Date();
		const toDate = fmtLocalDate(today);
	    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const fromDate = fmtLocalDate(firstDayOfMonth);
		return { fromDate, toDate };
	}

	function fmtLocalDate(d) {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${dd}`;
	}

	// 입고상태 판단 함수 (DB 컬럼의 구분자에 따라 상태 결정)
	function getPalletStatus(item) {
		// DB에서 받은 데이터의 특정 컬럼을 확인하여 입고상태를 판단
		// 예시: item.status_flag가 'Y'이면 입고완료, 'N'이면 입고대기중
		// 실제 구분자는 데이터 구조에 맞게 수정 필요

		if (item.status_flag === 'Y' || item.pallet_status === '완료' || item.pallet_yn === 'Y') {
			return '입고 완료';
		} else if (item.status_flag === 'N' || item.pallet_status === '대기' || item.pallet_yn === 'N') {
			return '입고 대기중';
		} else {
			// 기본값 또는 데이터가 없는 경우
			return '입고 대기중';
		}
	}

	// 사용자 테이블 데이터 렌더링
	function renderPalletTableData() {
		let tableBody = "";
		let startIndex = (currentPalletPage - 1) * palletItemsPerPage;
		let endIndex = Math.min(startIndex + palletItemsPerPage, filteredPalletData.length);

		for (let i = startIndex; i < endIndex; i++) {
			let rowNumber = i + 1;
			// globalIndex 계산: 전체 데이터에서의 실제 인덱스
			let globalIndex = globalPalletData.findIndex(item =>
				JSON.stringify(item) === JSON.stringify(filteredPalletData[i])
			);
			// 만약 찾지 못했다면 현재 인덱스 사용
			if (globalIndex === -1) {
				globalIndex = i;
			}

			// 날짜 형식 변환 (yyyymmdd -> yyyy-mm-dd)
			let formattedDate = formatDateFromYYYYMMDD(filteredPalletData[i].ks_indate);
			let palletStatus = getPalletStatus(filteredPalletData[i]);

			let print = ''
			let issued = ''
			if (filteredPalletData[i].printyn == 'Y') {
				print = `<button class ='btn reprint-btn' onclick = "pprint('${filteredPalletData[i].pbarcode}',${filteredPalletData[i].qty})">${i18n.t('btn.reIssue')}</button>`;/!*RePrint*!/
				issued = `<td class = "statusVal" style="color:green;">${i18n.t('search.issued')}</td>`/!*Issued*!/
			} else {
				print = `<button class ='btn print-btn' onclick = "pprint('${filteredPalletData[i].pbarcode}',${filteredPalletData[i].qty})">${i18n.t('btn.issue')}</button>`;/!*Print*!/
				issued = `<td class = "statusVal" style="color:red;">${i18n.t('search.notIssued')}</td>`;/!*Not Issued*!/
			}
			tableBody += `
				<tr data-index="${i}" data-global-index="${globalIndex}">
					<td class = "noVal">${rowNumber}</td>
					<td class = "dateVal">${filteredPalletData[i].mdate || ''}</td>
					<td class = "barcodeVal">${filteredPalletData[i].pbarcode || ''}</td>
					<td class = "cucodeVal">${filteredPalletData[i].ccode || ''}</td>
					<td class = "cnameVal">${filteredPalletData[i].cname || ''}</td>
					<td class = "itemcodeVal">${filteredPalletData[i].itemcode || ''}</td>
					<td class = "qtyVal">${filteredPalletData[i].qty || ''}</td>
					<td class = "scanqtyVal">${filteredPalletData[i].boxcount || ''}</td>
					${issued}
					<td>
						<input type = 'checkbox' class= 'print-check pallet_printChkRow' data-print = ${filteredPalletData[i].pbarcode}>
						${print}
					</td>
					<td>
						<input type = 'checkbox' class='chkbox pallet_deleteChkRow' data-chkbar = ${filteredPalletData[i].pbarcode}>
						<button class = 'btn del-btn' onclick = "fnDel('${filteredPalletData[i].pbarcode}')">${i18n.t('btn.delete')}<!-- Delete --></button>
					</td>
				</tr>
			`;
		}

		$("#palletTableBody").html(tableBody);

		// 정보 업데이트
		$("#palletTotalCount").text(filteredPalletData.length);
		$("#palletCurrentPageInfo").text(currentPalletPage);
		$("#palletTotalPageInfo").text(Math.ceil(filteredPalletData.length / palletItemsPerPage));

		// 모든 스크롤 맨 위로 이동
		window.scrollTo(0, 0);
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;

		// 모든 스크롤 가능한 요소들 맨 위로 이동
		document.querySelectorAll('*').forEach(element => {
			if (element.scrollTop > 0) {
				element.scrollTop = 0;
			}
			if (element.scrollLeft > 0) {
				element.scrollLeft = 0;
			}
		});

		// 체크박스 상태 업데이트
		updateCheckboxStatus();
	}

	window.pprint = function(pbarcode, qty) {
		$.ajax({
			type: "post",
			url: "pprint_yn_up",
			dataType: "html",
			data: {
				pbarcode: pbarcode
			},
		}).done(function(data) {
		});
		window.open("pallet_label_A3_print?pbarcode=" + pbarcode + "&qty=" + qty + "#zoom=33", "Report Print", 'height=500, width=600');
	}

	window.palletAll = function() {
		const palletList = [];

		$('.print-check:checked').each(function() {
			const val = $(this).data('print');
			if (val) palletList.push(val);
		});

		if (palletList.length === 0) {
			alert("출력할 항목을 선택하세요.");
			return;
		}
		console.log("barcodelist : " + palletList)
		$.ajax({
			type: "post",
			url: "pprint_yn_up",
			traditional: true,
			data: { pbarcode: palletList.join(";") },
			dataType: "json"
		}).done(function(data) {
			window.open("pallet_label_A3_print?pbarcode=" + palletList.join(";") + "&qty=" + 0 + "#zoom=33", "Report Print", 'height=500, width=600');
		});
	}

	window.fnDel = function(barcode) {
		//alert(barcode);
		if (confirm("Are you sure you want to delete?")) {
			$.ajax({
				type: "get",
				url: "pallet_del",
				dataType: "html",
				data: {
					pbarcode: barcode
				},
				error: function(xhr, status, error) {
					// ❌ alert(res.message) <- res 없음 (버그)
					window.handleAjaxError(xhr, status, error);
				}

			}).done(function(data) {
				call_m2_pallet_list();
			});
		} else {
			return false;
		}

	}

	window.fnAllDel = function() {

		//var startdate = $('#startdate').val();
		//alert(startdate);
		var cnt = $("input[class='chkbox']:checked").length;

		if (cnt == 0) {
			alert("No history selected.");
			return false;
		}

		if (confirm("Are you sure you want to delete " + cnt + "records?")) {

			var checkArr = new Array();

			$("input[class='chkbox']:checked").each(function() {
				checkArr.push($(this).attr("data-chkBar"));
			});

			//alert(checkArr);

			$.ajax({
				type: "get",
				url: "pallet_delAll",
				dataType: "html",
				data: {
					delList: checkArr
				}
			}).done(function(data) {
				call_m2_pallet_list();
			});

		} else {
			return false;
		}
	}
	// 사용자 페이지네이션 렌더링
	function renderPalletPagination() {
		let totalPages = Math.ceil(filteredPalletData.length / palletItemsPerPage);
		let paginationHtml = "";

		// 이전 버튼
		if (currentPalletPage > 1) {
			paginationHtml += `<button class="pallet-page-btn" data-page="${currentPalletPage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="pallet-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentPalletPage - 5);
		let endPage = Math.min(totalPages, currentPalletPage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="pallet-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentPalletPage) {
				paginationHtml += `<button class="pallet-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="pallet-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="pallet-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentPalletPage < totalPages) {
			paginationHtml += `<button class="pallet-page-btn" data-page="${currentPalletPage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="pallet-page-btn disabled">&gt;</button>`;
		}

		$("#palletPaginationContainer").html(paginationHtml);
	}

	// 체크박스 상태 업데이트 함수
	function updateCheckboxStatus() {
		let totalCheckboxes = $('.row-checkbox').length;
		let checkedCheckboxes = $('.row-checkbox:checked').length;

		// 전체 선택 체크박스 상태 업데이트
		if (checkedCheckboxes === 0) {
			$('#checkAll').prop('indeterminate', false);
			$('#checkAll').prop('checked', false);
		} else if (checkedCheckboxes === totalCheckboxes) {
			$('#checkAll').prop('indeterminate', false);
			$('#checkAll').prop('checked', true);
		} else {
			$('#checkAll').prop('indeterminate', true);
		}

		// 선택된 항목 수 업데이트
		updateSelectedCount();

		// 액션 버튼 상태 업데이트
		updateActionButtonsVisibility();
	}

	// 선택된 항목 수 업데이트
	function updateSelectedCount() {
		let selectedCount = $('.row-checkbox:checked').length;
		$('#selectedCount').text(selectedCount);
	}

	// 액션 버튼 표시/숨김 업데이트
	function updateActionButtonsVisibility() {
		let selectedCount = $('.row-checkbox:checked').length;

		if (selectedCount > 0) {
			//$('#defaultActions').hide();
			//$('#selectedActions').show(); 수정 삭제 보류
		} else {
			//$('#defaultActions').show();
			//$('#selectedActions').hide(); 수정 삭제 보류
		}
	}

	// 선택된 항목들의 데이터 가져오기
	function getSelectedItems() {
		let selectedItems = [];
		$('.row-checkbox:checked').each(function() {
			let globalIndex = $(this).data('global-index');
			let filteredIndex = $(this).data('filtered-index');
			selectedItems.push({
				globalIndex: globalIndex,
				filteredIndex: filteredIndex,
				data: filteredPalletData[filteredIndex]
			});
		});
		return selectedItems;
	}

	// 사용자 이벤트 바인딩
	function bindPalletEvents() {
		// 전체 선택 체크박스 이벤트
		$('#checkAll').off('change').on('change', function() {
			let isChecked = $(this).prop('checked');
			$('.row-checkbox').prop('checked', isChecked);
			updateSelectedCount();
			updateActionButtonsVisibility();
		});

		// 개별 체크박스 이벤트
		$(document).off('change', '.row-checkbox').on('change', '.row-checkbox', function() {
			updateCheckboxStatus();
		});

		// 입고 등록 버튼 클릭
		/!*$("#btnInsert_warehouse\\").off('click').on('click', function() {
			console.log('입고 등록 버튼 클릭');
			// 여기에 입고 등록 로직 추가
		});*!/

		// 수정 버튼 클릭
		$("#btnEdit_warehouse").off('click').on('click', function() {
			let selectedItems = getSelectedItems();
			if (selectedItems.length === 0) {
				alert('수정할 항목을 선택해주세요.');
				return;
			}
			if (selectedItems.length > 1) {
				alert('수정은 한 번에 하나의 항목만 가능합니다.');
				return;
			}

			console.log('선택된 항목 수정:', selectedItems[0]);
			// 여기에 수정 로직 추가
		});

		// 삭제 버튼 클릭
		$("#btnDelete_warehouse").off('click').on('click', function() {
			let selectedItems = getSelectedItems();
			if (selectedItems.length === 0) {
				alert('삭제할 항목을 선택해주세요.');
				return;
			}

			if (confirm(`선택된 ${selectedItems.length}개 항목을 삭제하시겠습니까?`)) {
				console.log('선택된 항목들 삭제:', selectedItems);
				// 여기에 삭제 로직 추가
			}
		});

		// 취소 버튼 클릭
		$("#btnCancel_warehouse").off('click').on('click', function() {
			// 모든 체크박스 해제
			$('.row-checkbox').prop('checked', false);
			$('#checkAll').prop('checked', false);
			updateCheckboxStatus();
		});

		// 검색 버튼 클릭
		$(".btnPalletSearch").off('click').on('click', function() {
			performPalletSearch();
		});

		// 초기화 버튼 클릭
		$(".btnPalletSearchInit").off('click').on('click', function() {
			resetPalletSearch();
		});

		// 페이지네이션 버튼 클릭
		$(document).off('click', '.pallet-page-btn').on('click', '.pallet-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentPalletPage = page;
					renderPalletTableData();
					renderPalletPagination();
				}
			}
		});

		// 엔터키 검색
		$('#view_m2_pallet_list input[type="text"], #view_m2_pallet_list input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performPalletSearch();
			}
		});
	}

	// 날짜 형식 변환 함수들
	function formatDateToYYYYMMDD(dateStr) {
		// yyyy-mm-dd 형식을 yyyymmdd 형식으로 변환
		if (!dateStr) return '';
		return dateStr.replace(/-/g, '');
	}

	function formatDateFromYYYYMMDD(dateStr) {
		// yyyymmdd 형식을 yyyy-mm-dd 형식으로 변환
		if (!dateStr || dateStr.length !== 8) return '';
		return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
	}

	function isValidDate(dateStr) {
		// 날짜 유효성 검사
		if (!dateStr) return false;
		let date = new Date(dateStr);
		return date instanceof Date && !isNaN(date);
	}

	// 사용자 검색 수행
	function performPalletSearch() {
		let searchCriteria = {
			startdate: $("#searchVal_pallet_startdate").val(),
			enddate: $("#searchVal_pallet_enddate").val(),
			barcode: $("#searchVal_pallet_barcode").val().trim().toUpperCase(),
			cucode: $("#searchVal_pallet_cucode").val().trim().toUpperCase(),
			cname: $("#searchVal_pallet_cname").val().trim().toUpperCase(),
			itemcode: $("#searchVal_pallet_itemcode").val().trim().toUpperCase(),
			issue: $("#searchVal_pallet_issue").val()
		};

		updateTotalQty(searchCriteria)

		filteredPalletData = globalPalletData.filter(item => {
			// 1️⃣ issue 조건 처리
			let statusMatch = true;
			if (searchCriteria.issue && searchCriteria.issue !== "all") {
				statusMatch = item.printyn === searchCriteria.issue;
			}
			// 2️⃣ 날짜 변환 (yyyymmdd -> yyyy-mm-dd)
			let itemDate = null;
			if (item.mdate && item.mdate.length === 8) {
				let formatted = item.mdate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
				itemDate = new Date(formatted);
			}

			let startDate = searchCriteria.startdate ? new Date(searchCriteria.startdate) : null;
			let endDate = searchCriteria.enddate ? new Date(searchCriteria.enddate) : null;

			let dateMatch = true;
			if (startDate && endDate && itemDate) {
				dateMatch = itemDate >= startDate && itemDate <= endDate;
			}
			return (
				statusMatch &&
				dateMatch &&
				(!searchCriteria.barcode || (item.pbarcode && item.pbarcode.toUpperCase().includes(searchCriteria.barcode))) &&
				(!searchCriteria.cucode || (item.ccode && item.ccode.toUpperCase().includes(searchCriteria.cucode))) &&
				(!searchCriteria.cname || (item.cname && item.cname.toUpperCase().includes(searchCriteria.cname))) &&
				(!searchCriteria.itemcode || (item.itemcode && item.itemcode.toUpperCase().includes(searchCriteria.itemcode)))
			);
		});

		currentPalletPage = 1;

		renderPalletTableData();
		renderPalletPagination();

		console.log(`검색 결과: ${filteredPalletData.length}건`);
		console.log(filteredPalletData);
	}

	// 사용자 검색 초기화
	function resetPalletSearch() {
		$("#searchVal_palletCondition").val('');
		$("#searchVal_pallet_startdate").val('');
		$("#searchVal_cucode").val('');
		$("#searchVal_cname").val('');
		$("#searchVal_car").val('');
		$("#searchVal_itemcode").val('');
		$("#searchVal_itemname").val('');

		filteredPalletData = globalPalletData;
		currentPalletPage = 1;
		renderPalletTableData();
		renderPalletPagination();

		console.log('검색 조건이 초기화되었습니다.');
	}

	// 사용자 페이지당 항목 수 변경 (필요시 사용)
	window.changePalletItemsPerPage = function(newItemsPerPage) {
		palletItemsPerPage = newItemsPerPage;
		currentPalletPage = 1;
		renderPalletTableData();
		renderPalletPagination();
	}

	// 전체 사용자 데이터 export (필요시 사용)
	window.exportPalletData = function() {
		return {
			total: globalPalletData.length,
			filtered: filteredPalletData.length,
			currentPage: currentPalletPage,
			itemsPerPage: palletItemsPerPage,
			data: filteredPalletData
		};
	}

	// 선택된 항목들 export (필요시 사용)
	window.exportSelectedData = function() {
		return getSelectedItems();
	}

});


$(document).on("click", ".pallet_printChkAll", function() {
	var isChecked = $(this).prop('checked');
	$('.pallet_printChkRow').prop('checked', isChecked);
});

// 개별 체크박스 클릭 시 전체 선택 상태 업데이트
$(document).on("click", ".pallet_printChkRow", function() {
	var totalRows = $('.pallet_printChkRow').length;
	var checkedRows = $('.pallet_printChkRow:checked').length;

	$('.pallet_printChkAll').prop('checked', totalRows === checkedRows);
});

$(document).on("click", ".pallet_deleteChkAll", function() {
	var isChecked = $(this).prop('checked');
	$('.pallet_deleteChkRow').prop('checked', isChecked);
});

// 개별 체크박스 클릭 시 전체 선택 상태 업데이트
$(document).on("click", ".pallet_deleteChkRow", function() {
	var totalRows = $('.pallet_deleteChkRow').length;
	var checkedRows = $('.pallet_deleteChkRow:checked').length;

	$('.pallet_deleteChkAll').prop('checked', totalRows === checkedRows);
});
*/
