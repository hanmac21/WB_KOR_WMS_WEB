/* --------------------------------------------------------------
 * 📌 기초자료 - 창고 관리
 * 비고: 
 * -------------------------------------------------------------- */


$(document).ready(function() {

	let globalwarehouseData = []; // 전체 창고관리 데이터 저장
	let currentwarehousePage = 1; // 현재 페이지
	let warehouseItemsPerPage = 1000; // 페이지당 항목 수
	let filteredwarehouseData = []; // 검색 필터링된 데이터



	window.call_m1_7 = function() {

		//loadCSSForMenu("/m2/m2.css");

		showLoading("data");

		$.ajax({
			//url: "/read_inbound_warehouse",
			url: "/read_warehouse",
			type: "POST",
			data: JSON.stringify(),
			contentType: "application/json",
			success: function(data) {
				console.log("-- 조회. 입고조회 창고 정보 --")
				console.log(data)


				globalwarehouseData = data;
				filteredwarehouseData = data;
				currentwarehousePage = 1;

				renderWarehouseEditView();

				renderwarehouseView();

				hideLoading()

			}
		});
	}

	// 창고관리 뷰 렌더링 함수
	function renderwarehouseView() {
		let content_output = `
			<div class="divBlockControl" id="view_m1_7">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_factory">${i18n.t('search.factory')}<!-- FACTORY --></div>
								<select id="searchVal_factory" >
									<option value="WBTA">WBTA</option>
								</select>
							</div>
							<div class="search-label">
								<div class="search_storage">${i18n.t('search.storage')}<!-- STORAGE --></div>
								<select id="searchVal_storage" >
									<!-- 동적으로 추가 -->
								</select>
							</div>
							<div class="search-label">
								<div class="search_car">${i18n.t('search.car')}<!-- car --></div>
								<input type="text" id="searchVal_car" />
							</div>
						</div>
							<div class="search_button_area">
								<button class="btn btn-primary btnWarehouseSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
								<button class="btn btn-secondary btnWarehouseSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
							</div>
						
					</div>
					
					<!-- 탭 -->
					<div class="tab-container">
						<div class="tab">목록</div>
					</div>
					
					<!-- 테이블 -->
					<div class="table-container">
						<div class="table-header-actions">
                        <div class="table-info m1_7">
                            <span>${i18n.t('table.info.total')} <strong id="warehouseTotalCount">${filteredwarehouseData.length}</strong> ${i18n.t('table.info.records')} | 
                            ${i18n.t('table.page')} <strong id="warehouseCurrentPageInfo">${currentwarehousePage}</strong>/<strong id="warehouseTotalPageInfo">${Math.ceil(filteredwarehouseData.length / warehouseItemsPerPage)}</strong></span> 
                            
                            <!-- 선택된 항목 수 표시 (-) -->
                            <span class="selection-info" id="warehouseSelectionInfo" style="display: none;">
                                | ${i18n.t('table.selectItems')}<!-- 선택된 항목 --> : <span class="selected-count" id="warehouseSelectedCount">0</span>${i18n.t('table.info.records')}<!-- 건 -->
                            </span>
	                        <div class="action-buttons-right m1_7">
	                            <!-- 기본 상태: 신규 등록 버튼만 표시 -->
	                            <div id="defaultActions" class="action-group">
	                                <button class="btn btn-success" id="btnInsert_warehouse">✚ ${i18n.t('btn.addNew')}<!-- 신규 등록 --></button>
	                            </div>
	                            
	                            <!-- 선택 상태: 수정/삭제/취소 버튼 표시 -->
	                            <div id="selectedActions" class="action-group" style="display: none;">
									<button class="btn btn-success" id="btnPrint_label">${i18n.t('btn.print')}<!-- 발행 --></button>
	                                <button class="btn btn-primary" id="btnEdit_warehouse">${i18n.t('btn.edit')}<!-- 수정 --></button>
	                                <button class="btn btn-danger" id="btnDelete_warehouse">${i18n.t('btn.delete')}<!-- 삭제 --></button>
	                                <button class="btn btn-secondary" id="btnCancel_warehouse">${i18n.t('btn.cancel')}<!-- 취소 --></button>
	                            </div>
	                        </div>
                        </div>
                        
                    </div>
						
						<table class="data-table m1_7">
							<thead>
								<tr>	
									<th class="checkbox-cell">
										<input type="checkbox" class="select-all-warehouse-checkbox">
									</th>
									<th class="noVal">${i18n.t('table.no')}<!-- No --></th>
									<th class="factoryVal">${i18n.t('search.factory')}<!-- FACTORY --></th>
									<th class="storageVal">${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class="carVal">${i18n.t('search.car')}<!-- car --></th>
									<th class="itemnameVal">${i18n.t('table.warehouseLocation')}<!-- WAREHOUSE<br>LOCATION --></th>
								</tr>
							</thead>
							<tbody id="warehouseTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="warehousePaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;

		//$(".w_contentArea").html(content_output);

		$(".w_contentArea").append(content_output); // 기존 내용 보존 + 새 뷰 추가

		// 공장 및 창고 선택
		renderFactoryStorage();

		// 테이블 데이터 렌더링
		renderwarehouseTableData();

		// 검색 실행
		performwarehouseSearch();

		// 페이지네이션 렌더링
		renderwarehousePagination();

		// 이벤트 바인딩
		bindwarehouseEvents();
	}

	// 공장 및 창고 선택 함수
	function renderFactoryStorage() {
		const factory = $('#searchVal_factory');
		const storage = $('#searchVal_storage');
		const savedFactory = getCookie('selectedFactory');

		// 공장별 창고 옵션 설정
		function updateStorageOptions(factoryValue) {
			storage.empty();

			const options = {
				'WBTA': ['all', 'INBOUND', 'PRODUCT', 'OUTBOUND'],
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

	// 창고관리 테이블 데이터 렌더링
	function renderwarehouseTableData() {
		let tableBody = "";
		let startIndex = (currentwarehousePage - 1) * warehouseItemsPerPage;
		let endIndex = Math.min(startIndex + warehouseItemsPerPage, filteredwarehouseData.length);

		for (let i = startIndex; i < endIndex; i++) {
			let rowNumber = i + 1;
			// 날짜 형식 변환 (yyyymmdd -> yyyy-mm-dd)
			//let formattedDate = formatDateFromYYYYMMDD(filteredwarehouseData[i].ks_indate);
			let sumData = (filteredwarehouseData[i].factory || '') +
				" - " + (filteredwarehouseData[i].storage || '') +
				" - " + (filteredwarehouseData[i].rack || '');


			tableBody += `
				<tr>
					<td class="checkbox-cell">
						<input type="checkbox" class="warehouse-row-checkbox" data-iid="${filteredwarehouseData[i].iid}">
					</td>
					<td class="noVal">${rowNumber}</td>
					<td class="factoryVal">${filteredwarehouseData[i].factory || ''}</td>
					<td class="storageVal">${filteredwarehouseData[i].storage || ''}</td>
					<td class="carVal">${filteredwarehouseData[i].rack || ''}</td>
					<td class="itemnameVal">${sumData}</td>
				</tr>
			`;
		}

		$("#warehouseTableBody").html(tableBody);

		// 정보 업데이트
		$("#warehouseTotalCount").text(filteredwarehouseData.length.toLocaleString());
		$("#warehouseCurrentPageInfo").text(currentwarehousePage);
		$("#warehouseTotalPageInfo").text(Math.ceil(filteredwarehouseData.length / warehouseItemsPerPage));
	}

	// 창고관리 페이지네이션 렌더링
	function renderwarehousePagination() {
		let totalPages = Math.ceil(filteredwarehouseData.length / warehouseItemsPerPage);
		let paginationHtml = "";

		// 이전 버튼
		if (currentwarehousePage > 1) {
			paginationHtml += `<button class="warehouse-page-btn" data-page="${currentwarehousePage - 1}">&lt;</button>`;
		} else {
			paginationHtml += `<button class="warehouse-page-btn disabled">&lt;</button>`;
		}

		// 페이지 번호 버튼들
		let startPage = Math.max(1, currentwarehousePage - 5);
		let endPage = Math.min(totalPages, currentwarehousePage + 5);

		// 첫 페이지
		if (startPage > 1) {
			paginationHtml += `<button class="warehouse-page-btn" data-page="1">1</button>`;
			if (startPage > 2) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
		}

		// 중간 페이지들
		for (let i = startPage; i <= endPage; i++) {
			if (i === currentwarehousePage) {
				paginationHtml += `<button class="warehouse-page-btn active" data-page="${i}">${i}</button>`;
			} else {
				paginationHtml += `<button class="warehouse-page-btn" data-page="${i}">${i}</button>`;
			}
		}

		// 마지막 페이지
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				paginationHtml += `<span class="page-dots">...</span>`;
			}
			paginationHtml += `<button class="warehouse-page-btn" data-page="${totalPages}">${totalPages}</button>`;
		}

		// 다음 버튼
		if (currentwarehousePage < totalPages) {
			paginationHtml += `<button class="warehouse-page-btn" data-page="${currentwarehousePage + 1}">&gt;</button>`;
		} else {
			paginationHtml += `<button class="warehouse-page-btn disabled">&gt;</button>`;
		}

		$("#warehousePaginationContainer").html(paginationHtml);
	}

	// 창고관리 이벤트 바인딩
	function bindwarehouseEvents() {
		// 검색 버튼 클릭
		$(".btnWarehouseSearch").off('click').on('click', function() {
			performwarehouseSearch();
		});

		// 초기화 버튼 클릭
		$(".btnWarehouseSearchInit").off('click').on('click', function() {
			resetwarehouseSearch();
		});

		// 페이지네이션 버튼 클릭
		$(document).off('click', '.warehouse-page-btn').on('click', '.warehouse-page-btn', function() {
			if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
				let page = parseInt($(this).data('page'));
				if (page && page > 0) {
					currentwarehousePage = page;
					renderwarehouseTableData();
					renderwarehousePagination();
				}
			}
		});

		// 엔터키 검색
		$('#view_m1_7 input[type="text"], #view_m1_7 input[type="date"]').off('keypress').on('keypress', function(e) {
			if (e.which === 13) {
				performwarehouseSearch();
			}
		});

		// 전체 선택 체크박스 이벤트
		$(document).on('change', '.select-all-warehouse-checkbox', function() {
			const isChecked = $(this).is(':checked');
			$('.warehouse-row-checkbox').prop('checked', isChecked);
			updatewarehouseButtonState(); // 🔴 기존: updateSelectAllState() → 🟢 변경: updatewarehouseButtonState()
		});

		// 개별 체크박스 이벤트 (수정)
		$(document).on('change', '.warehouse-row-checkbox', function() {
			updateSelectAllState(); // 🟢 추가
			updatewarehouseButtonState(); // 이미 있었음
		});

		// 🟢 취소 버튼 이벤트 (-)
		$(document).on('click', '#btnCancel_warehouse', function() {
			$('.select-all-warehouse-checkbox').prop('checked', false);
			$('.warehouse-row-checkbox').prop('checked', false);
			updatewarehouseButtonState();
		});

		// 🟢 수정 버튼 이벤트 
		$(document).on('click', '#btnEdit_warehouse', function() {
			const selectedItems = $('.warehouse-row-checkbox:checked');
			if (selectedItems.length === 0) {
				alert('수정할 항목을 선택해주세요.');
				return;
			}
			if (selectedItems.length > 1) {
				alert('수정은 한 개의 항목만 선택해주세요.');
				return;
			}

			const selectedRow = selectedItems.closest("tr");

			const storage = selectedRow.find('.storage').text().trim();
			const factory = selectedRow.find('.factory').text().trim();
			const car = selectedRow.find('.car').text().trim();

			//console.log(car+moduleVal+levelcode+position)

			const iid = selectedRow.find('td.checkbox-cell .warehouse-row-checkbox').data("iid");
			console.log('수정할 ID:', iid);

			document.getElementById('modalTitle').textContent = i18n.t('title.editTask')/*작업 수정*/;
			document.getElementById('warehouseEditModal').style.display = 'flex';
			// 폼 초기화
			document.querySelectorAll('.modal-body input').forEach(input => input.value = '');
			document.querySelectorAll('.modal-body select').forEach(select => select.selectedIndex = 0);

			const saveButton = document.querySelector('.btn-save');
			saveButton.removeAttribute('id'); // 혹시 이전 id가 있다면 제거
			saveButton.id = 'btn_update_warehouse';
			saveButton.dataset.uid = iid;

			$("#m1_7_storage").val(storage);
			$("#m1_7_factory").val(factory);
			$("#m1_7_car").val(car);
		});

		// 🟢 삭제 버튼 이벤트 (-)
		$(document).on('click', '#btnDelete_warehouse', function() {
			const selectedItems = $('.warehouse-row-checkbox:checked');
			if (selectedItems.length === 0) {
				alert('삭제할 항목을 선택해주세요.');
				return;
			}


			if (confirm(`선택된 ${selectedItems.length}개 항목을 삭제하시겠습니까?`)) {

				const iidList = [];

				selectedItems.each(function() {
					const row = $(this).closest('tr');
					const iid = row.find('td.checkbox-cell .warehouse-row-checkbox').data("iid");
					console.log('삭제할 ID:', iid);
					iidList.push(iid);
				});

				console.log(iidList);

				// 실제 삭제 API 호출 로직 추가
				$.ajax({
					url: "/delete_warehouse",
					type: "POST",
					data: JSON.stringify(iidList),
					contentType: "application/json",
					success: function(data) {

						closeModal();
						reloadWarehouseTable()
						$('.select-all-warehouse-checkbox').prop('checked', false);
						$('.warehouse-row-checkbox').prop('checked', false);
						updatewarehouseButtonState();
					},
					error: function(xhr, status, error) {
						console.error("삭제 실패:", error);
						alert("삭제 중 오류가 발생했습니다.");
						hideLoading();
					}
				});


				$('.select-all-warehouse-checkbox').prop('checked', false);
				$('.warehouse-row-checkbox').prop('checked', false);
				updatewarehouseButtonState();
				renderwarehouseTableData();
			}
		});

		// 🟢 발행 버튼 이벤트 
		$(document).on('click', '#btnPrint_label', function() {
			const selectedItems = $('.warehouse-row-checkbox:checked');
			const iidList = [];

			selectedItems.each(function() {
				const row = $(this).closest('tr');
				const iid = row.find('td.checkbox-cell .warehouse-row-checkbox').data("iid");
				console.log('발행할 ID:', iid);
				iidList.push(iid);
			});

			if (!iidList.length) {
				alert('선택된 항목이 없습니다.');
				return;
			}

			console.log(iidList);

			// 동적 폼 생성
			const form = $('<form>', {
				method: 'POST',                // HTTP POST 방식으로 전송
				action: '/WarehouseLabel',     // 요청 보낼 URL
				target: 'LabelPrintWindow'     // 요청 결과를 띄울 창 이름(=window.open 이름)
			});

			form.append($('<input>', {
				type: 'hidden',
				name: 'iidList',
				value: JSON.stringify(iidList)
			}));

			$('body').append(form);

			// 새창 열기
			window.open('', 'LabelPrintWindow', 'width=800,height=600,scrollbars=yes');

			// 전송 후 폼 제거
			form[0].submit();
			form.remove();
		});
	}

	// 창고관리 검색 수행
	function performwarehouseSearch() {
		let searchCriteria = {
			storage: $("#searchVal_storage").val().trim().toUpperCase(),
			factory: $("#searchVal_factory").val().trim().toUpperCase(),
			car: $("#searchVal_car").val().trim().toUpperCase()
		};

		// 'ALL' 값 처리
		if (searchCriteria.storage === 'ALL') searchCriteria.storage = '';
		if (searchCriteria.factory === 'ALL') searchCriteria.factory = '';

		filteredwarehouseData = globalwarehouseData.filter(item => {
			return (
				(!searchCriteria.storage || (item.storage && item.storage.toUpperCase().includes(searchCriteria.storage))) &&
				(!searchCriteria.factory || (item.factory && item.factory.toUpperCase().includes(searchCriteria.factory))) &&
				(!searchCriteria.car || (item.rack && item.rack.toUpperCase() === searchCriteria.car))
			);
		});

		currentwarehousePage = 1;
		renderwarehouseTableData();
		renderwarehousePagination();

		console.log(`검색 결과: ${filteredwarehouseData.length}건`);
		console.log(`검색 조건`);
		console.log(searchCriteria);
	}


	// 창고관리 검색 초기화
	function resetwarehouseSearch() {
		$("#searchVal_storage").val('all');
		$("#searchVal_factory").val('WBTA');
		$("#searchVal_car").val('');

		filteredwarehouseData = globalwarehouseData;
		currentwarehousePage = 1;
		renderwarehouseTableData();
		renderwarehousePagination();

		console.log('검색 조건이 초기화되었습니다.');
	}


	// 창고관리 페이지당 항목 수 변경 (필요시 사용)
	window.changewarehouseItemsPerPage = function(newItemsPerPage) {
		warehouseItemsPerPage = newItemsPerPage;
		currentwarehousePage = 1;
		renderwarehouseTableData();
		renderwarehousePagination();
	}

	// 전체 창고관리 데이터 export (필요시 사용)
	window.exportwarehouseData = function() {
		return {
			total: globalwarehouseData.length,
			filtered: filteredwarehouseData.length,
			currentPage: currentwarehousePage,
			itemsPerPage: warehouseItemsPerPage,
			data: filteredwarehouseData
		};
	}

	function reloadWarehouseTable() {
		if (!$('.loading-overlay').is(':visible')) {
			showLoading("insert");
		}

		$.ajax({
			url: "/read_warehouse",
			type: "POST",
			data: JSON.stringify(),
			contentType: "application/json",
			success: function(data) {
				console.log("-- 리로드. 창고 정보 --");
				console.log(data);

				globalwarehouseData = data;
				filteredwarehouseData = data;
				currentwarehousePage = 1;

				$('.select-all-warehouse-checkbox').prop('checked', false);
				$('.warehouse-row-checkbox').prop('checked', false);
				updatewarehouseButtonState();

				renderwarehouseTableData();
				renderwarehousePagination();

				hideLoading();
			},
			error: function(xhr, status, error) {
				console.error("데이터 로드 실패:", error);
				alert("데이터를 불러오는 중 오류가 발생했습니다.");
				hideLoading();
			}
		});
	}

	window.reloadWarehouseTable = reloadWarehouseTable;
});




/* =============================== 아래부터 신규 ===========================*/
// 창고관리 모달창 삽입
function renderWarehouseEditView() {
	$("#warehouseEditModal").empty();

	let prependModal = `
			<div class="modal m1_7_edit">
	            <div class="modal-header">
	                <h3 class="modal-title" id="modalTitle"></h3>
	                <button class="modal-close" onclick="closeModal()">&times;</button>
	            </div>
	            <div class="modal-body">
	                <div class="form-grid">
	                    <div class="form-group">
	                        <label>${i18n.t('search.factory')}<!-- FACTORY --></label>
							<select id="m1_7_factory" >
								<option value="WBTA">WBTA</option>
							</select>
	                    </div>
	                    <div class="form-group">
	                        <label>${i18n.t('search.storage')}<!-- STORAGE --></label>
							<select id="m1_7_storage" >
								<option value="INBOUND">INBOUND</option>
								<option value="PRODUCT">PRODUCT</option>
								<option value="OUTBOUND">OUTBOUND</option>
							</select>
	                    </div>
	                    <div class="form-group">
	                        <label>${i18n.t('search.car')}<!-- car --></label>
	                        <select id="m1_7_car" >                       	
								<option value="AIR">AIR</option>
								<option value="CN7A">CN7A</option>
								<option value="Cva PE">Cva PE</option>
								<option value="DL3">DL3</option>
								<option value="DN">DN</option>
								<option value="EDV">EDV</option>
								<option value="GRAVITY">GRAVITY</option>
								<option value="LQ2">LQ2</option>
								<option value="MQ4">MQ4</option>
								<option value="MVa">MVa</option>
								<option value="MX5a">MX5a</option>
								<option value="NQ5">NQ5</option>
								<option value="NQ5a">NQ5a</option>
								<option value="NQ5a PE">NQ5a PE</option>
								<option value="NX4">NX4</option>
								<option value="Public">Public</option>
								<option value="R1S">R1S</option>
								<option value="R1T">R1T</option>
								<option value="TMa">TMa</option>
								<option value="UMA">UMA</option>
							</select>
	                    </div>
	                </div>
	            </div>
	            <div class="modal-footer">
	                <button class="btn-save">${i18n.t('btn.save')}<!-- 저장 --></button>
	                <button class="btn-cancel" onclick="closeModal()">${i18n.t('btn.cancel')}<!-- 취소 --></button>
	            </div>
      	  </div>
		`
	$("#warehouseEditModal").prepend(prependModal);
}

// 신규 등록 모달 열기
$(document).on("click", "#btnInsert_warehouse", function() {
	document.getElementById('modalTitle').textContent = '신규 등록';
	document.getElementById('warehouseEditModal').style.display = 'flex';
	// 폼 초기화
	document.querySelectorAll('.modal-body input').forEach(input => input.value = '');
	document.querySelectorAll('.modal-body select').forEach(select => select.selectedIndex = 0);

	const saveButton = document.querySelector('.btn-save');
	saveButton.removeAttribute('id'); // 혹시 이전 id가 있다면 제거
	saveButton.id = 'btn_insert_warehouse';
})

// 수정 모달 열기
function openEditModal() {
	if (selectedRows.size === 0) {
		showToast('수정할 항목을 선택해주세요.', 'error');
		return;
	}
	if (selectedRows.size > 1) {
		showToast('한 번에 하나의 항목만 수정할 수 있습니다.', 'error');
		return;
	}

	document.getElementById('modalTitle').textContent = '항목 수정';
	document.getElementById('warehouseEditModal').style.display = 'flex';
}

$(document).on("click", "#btn_insert_warehouse", function() {
	let storage = $("#m1_7_storage").val().trim();
	let factory = $("#m1_7_factory").val().trim();
	let car = $("#m1_7_car").val().trim();

	// 필수 입력값 유효성 검사
	if (!storage || !factory || !car) {
		let con = confirm("누락된 정보가 있습니다. 등록하시겠습니까?")
		if (!con) {
			return;
		}

	}
	const warehouse_insertVal = {
		storage,
		factory,
		car
	}

	showLoading("insert");

	$.ajax({
		url: "/insert_warehouse",
		type: "POST",
		data: JSON.stringify(warehouse_insertVal),
		contentType: "application/json",
		success: function(data) {
			//얼럿, 리프레시
			//alert("창고 정보가 등록되었습니다.")
			closeModal();
			reloadWarehouseTable()
		},
		error: function(xhr, status, error) {
			// ❌ alert(res.message) <- res 없음 (버그)
			window.handleAjaxError(xhr, status, error);
		}
	})
});

$(document).on("click", "#btn_update_warehouse", function() {
	let iid = $(this).data("uid");
	let storage = $("#m1_7_storage").val().trim();
	let factory = $("#m1_7_factory").val().trim();
	let car = $("#m1_7_car").val().trim();

	// 필수 입력값 유효성 검사
	if (!storage || !factory || !car) {
		let con = confirm("누락된 정보가 있습니다. 수정하시겠습니까?");
		if (!con) {
			return;
		}
	}

	showLoading("update");

	const warehouse_updateVal = {
		iid,
		storage,
		factory,
		car
	}

	$.ajax({
		url: "/update_warehouse",
		type: "POST",
		data: JSON.stringify(warehouse_updateVal),
		contentType: "application/json",
		success: function(data) {

			closeModal();
			reloadWarehouseTable()
		},
		error: function(xhr, status, error) {
			console.error("수정 실패:", error);
			alert("수정 중 오류가 발생했습니다.");
			hideLoading();
		}
	});
});

// 버튼 상태 업데이트 함수
function updatewarehouseButtonState() {
	const checkedItems = $('.warehouse-row-checkbox:checked').length;

	if (checkedItems > 0) {
		// 선택된 항목이 있을 때: 수정/삭제/취소 버튼 표시
		$('#defaultActions').hide();
		$('#selectedActions').show();
		$('#warehouseSelectionInfo').show();
		$('#warehouseSelectedCount').text(checkedItems);
	} else {
		// 선택된 항목이 없을 때: 신규 등록 버튼만 표시
		$('#defaultActions').show();
		$('#selectedActions').hide();
		$('#warehouseSelectionInfo').hide();
	}
}

// 전체 선택 체크박스 상태 업데이트
function updateSelectAllState() {
	const totalCheckboxes = $('.warehouse-row-checkbox').length;
	const checkedCheckboxes = $('.warehouse-row-checkbox:checked').length;

	if (checkedCheckboxes === 0) {
		$('.select-all-warehouse-checkbox').prop('indeterminate', false);
		$('.select-all-warehouse-checkbox').prop('checked', false);
	} else if (checkedCheckboxes === totalCheckboxes) {
		$('.select-all-warehouse-checkbox').prop('indeterminate', false);
		$('.select-all-warehouse-checkbox').prop('checked', true);
	} else {
		$('.select-all-warehouse-checkbox').prop('indeterminate', true);
	}
}



function closeModal() {
	document.getElementById('warehouseEditModal').style.display = 'none';
	document.querySelectorAll('.modal-body input').forEach(input => input.value = '');
	document.querySelectorAll('.modal-body select').forEach(select => select.selectedIndex = 0);
}


