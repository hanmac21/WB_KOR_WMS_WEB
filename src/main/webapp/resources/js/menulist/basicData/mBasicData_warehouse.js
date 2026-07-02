/* --------------------------------------------------------------
 * 📌 창고 구조 관리
 * -------------------------------------------------------------- */

let allServerData = [];
let filteredData_warehouse = [];
let globalWarehouseData = [];
let totalWarehouseCount = 0;

$(document).ready(function() {

	window.filteredWarehouseData = [];

	// 메인 호출 함수 - 초기 로딩 시 전체 데이터 조회
	window.call_mBasicData_warehouse = function(menuId) {
		showLoading("data");

		performWarehouseDBSearch({ });
	}
});

// DB에서 데이터 조회하는 함수
function performWarehouseDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_warehouse",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria
		}),
		contentType: "application/json",
		success: function(response) {
			console.log("-- DB 조회 결과 (전체) --");
			console.log(response);

			// ✅ 서버 응답 구조 확인 및 데이터 추출
			let records = [];
			let totalCount = 0;

			// Case 1: response가 배열인 경우
			if (Array.isArray(response)) {
				records = response;
				totalCount = response.length > 0 && response[0].TOTALCOUNT !== undefined ? response[0].TOTALCOUNT : records.length;
			}
			// Case 2: response가 객체이고 records 속성이 있는 경우
			else if (response && response.records) {
				records = response.records;
				totalCount = response.totalCount || records.length;
			}
			// Case 3: response의 첫 번째 항목에 TOTALCOUNT가 있는 경우 (MyBatis 서브쿼리 방식)
			else if (response && response.length > 0 && response[0].TOTALCOUNT !== undefined) {
				records = response;
				totalCount = response[0].TOTALCOUNT || 0;
			}

			console.log("추출된 레코드 수:", records.length);
			console.log("전체 카운트:", totalCount);

			// ✅ 변수에 할당
			allServerData = records;
			filteredData_warehouse = [...allServerData];
			globalWarehouseData = filteredData_warehouse;
			window.filteredWarehouseData = globalWarehouseData;
			totalWarehouseCount = filteredData_warehouse.length;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mBasicData_warehouse').length) {
				renderWarehouseView();
			} else {
				renderWarehouseTableData();
				updateWarehouseTotalCount();
			}
			hideLoading();
		},
		error: function(xhr, status, error) {
			console.error("DB 조회 실패:", error);
			console.error("응답:", xhr.responseText);
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

// 사용자 뷰 렌더링 함수
function renderWarehouseView() {
	let content_output = `
			<div class="divBlockControl" id="view_mBasicData_warehouse">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area" style="height: 69px">
						<div class="search-row">
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnWarehouseSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnWarehouseSearchInit">${i18n.t('btn.clear')}<!-- 초기화--> </button>
						</div>
					</div>
					
					<!-- 탭 -->
					<div class="tab-container">
						<div class="tab">목록</div>
					</div>
					
					<!-- 테이블 -->
					<div class="table-container">
						<div class="table-info">
							<span>${i18n.t('table.info.total')} <strong id="warehouseTotalCount">${totalWarehouseCount}</strong> ${i18n.t('table.info.records')}
							</span>
							<div class="action-buttons-right mBasicData_warehouse">
								<div id="defaultActions" class="action-group">
									<input type="button" value="${i18n.t('btn.create')}" class="btn btn-success btnWarehouseCreare"/>
									<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnWarehouseDelete"/>
								</div>
							</div>
						</div>
						<table class="data-table mBasicData_warehouse" id="warehouseTable">
							<thead>
								<tr>
									<th class='checkboxVal'>
									    <input type="checkbox" class="warehouse_chkAll" />
									</th>
									<th class = 'factoryVal'>${i18n.t('search.factory')}<!-- STORAGE --></th>
									<th class = 'storageVal'>${i18n.t('search.storage')}<!-- STORAGE --></th>
									<th class = 'storageVal'>${i18n.t('search.type')}<!-- STORAGE --></th>
								</tr>
							</thead>
							<tbody id="warehouseSummaryTableBody">
							</tbody>
						</table>
					</div>
				</div>
			</div>
		`;

	$(".w_contentArea").append(content_output);

	// 테이블 데이터 렌더링
	renderWarehouseTableData();
	// 이벤트 바인딩
	bindWarehouseEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateWarehouseTotalCount();
}

function updateWarehouseTotalCount() {
	$('#warehouseTotalCount').text(Number(totalWarehouseCount).toLocaleString());
}

function renderWarehouseTableData() {
	let tableBody = "";

	for (let i = 0; i < globalWarehouseData.length; i++) {
		let data = globalWarehouseData[i];

		tableBody += `
            <tr>
				<td class='checkboxVal'><input type="checkbox" class="warehouse_chk"
					data-iid="${data.IID}">
				</td>
				<td class = 'factoryVal'>${data.FACTORY || ''}</td>
				<td class = 'storageVal'>${data.STORAGE || ''}</td>
				<td class = 'storageVal'>${data.MEMO2 || ''}</td>
            </tr>
        `;
	}

	$("#warehouseSummaryTableBody").html(tableBody);
	$('.warehouse_chkAll').prop('checked', false);
}

function bindWarehouseEvents() {
	// 전체 선택 체크박스
	$(document).off('change', '.warehouse_chkAll').on('change', '.warehouse_chkAll', function() {
		let isChecked = $(this).is(':checked');
		$('.warehouse_chk').prop('checked', isChecked);
	});

	// 개별 체크박스
	$(document).off('change', '.warehouse_chk').on('change', '.warehouse_chk', function() {
		let totalCheckboxes = $('.warehouse_chk').length;
		let checkedCheckboxes = $('.warehouse_chk:checked').length;
		$('.warehouse_chkAll').prop('checked', totalCheckboxes === checkedCheckboxes);
	});

	$(".btnWarehouseSearch").off('click').on('click', function() {
		performWarehouseSearch();
	});

	$(".btnWarehouseSearchInit").off('click').on('click', function() {
		resetWarehouseSearch();
	});

	$('#view_mBasicData_warehouse input[type="text"], #view_mBasicData_warehouse input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performWarehouseSearch();
		}
	});

	// 생성 버튼
	$(".btnWarehouseCreare").off('click').on('click', function() {
		openWarehouseCreateModal();
	});

	// 삭제 버튼
	$(".btnWarehouseDelete").off('click').on('click', function() {
		deleteWarehouse();
	});
}

function performWarehouseSearch() {
	performWarehouseDBSearch({ });
}

function resetWarehouseSearch() {
	performWarehouseDBSearch({ });

	console.log('검색 조건이 초기화되었습니다.');
}

window.exportWarehouseData = function() {
	return {
		total: filteredData_warehouse.length,
		data: filteredData_warehouse
	};
}
/* --------------------------------------------------------------
 * 창고 추가 (모달)
 * -------------------------------------------------------------- */

// 생성 모달 열기
function openWarehouseCreateModal() {
	// 이미 열려 있으면 중복 생성 방지
	if ($('#warehouseCreateModal').length) {
		return;
	}

	let modalHtml = `
		<div class="warehouse-modal-overlay" id="warehouseCreateModal">
			<div class="warehouse-modal-box">
				<div class="warehouse-modal-header">
					<span>${i18n.t('btn.create')}</span>
					<button type="button" class="warehouse-modal-close">&times;</button>
				</div>
				<div class="warehouse-modal-body">
					<div class="warehouse-form-row">
						<label>${i18n.t('search.storage')}</label>
						<input type="text" id="inputWarehouseStorage" placeholder="${i18n.t('search.storage')}" />
					</div>
					<div class="warehouse-form-row">
						<label>${i18n.t('search.type')}</label>
						<div class="warehouse-radio-group">
							<label class="warehouse-radio">
								<input type="radio" name="warehouseType" value="사내" checked> 사내
							</label>
							<label class="warehouse-radio">
								<input type="radio" name="warehouseType" value="사외"> 사외
							</label>
						</div>
					</div>
				</div>
				<div class="warehouse-modal-footer">
					<button type="button" class="btn btn-success btnWarehouseCreateConfirm">${i18n.t('btn.save')}</button>
					<button type="button" class="btn btn-secondary warehouse-modal-close">${i18n.t('btn.cancel')}</button>
				</div>
			</div>
		</div>
	`;

	$('body').append(modalHtml);

	// 닫기 버튼
	$('.warehouse-modal-close').off('click').on('click', function() {
		closeWarehouseCreateModal();
	});

	// 저장 버튼
	$('.btnWarehouseCreateConfirm').off('click').on('click', function() {
		submitWarehouseCreate();
	});

	// 엔터키로 저장
	$('#inputWarehouseStorage').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			submitWarehouseCreate();
		}
	});

	// 입력창에 포커스
	$('#inputWarehouseStorage').focus();
}

// 생성 모달 닫기
function closeWarehouseCreateModal() {
	$('#warehouseCreateModal').remove();
}

// 생성 요청
function submitWarehouseCreate() {
	let storage = $('#inputWarehouseStorage').val().trim().toUpperCase();
	let type = $('input[name="warehouseType"]:checked').val();

	if (storage === '') {
		alert(i18n.t('search.storage'));
		$('#inputWarehouseStorage').focus();
		return;
	}

	showLoading("data");

	$.ajax({
		url: "/create_warehouse",
		type: "POST",
		data: JSON.stringify({
			storage: storage,
			type: type
		}),
		contentType: "application/json",
		success: function(response) {
			hideLoading();
			closeWarehouseCreateModal();
			performWarehouseDBSearch({ });
		},
		error: function(xhr, status, error) {
			console.error("창고 생성 실패:", error);
			console.error("응답:", xhr.responseText);
			hideLoading();
			alert("창고 추가에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

/* --------------------------------------------------------------
 * 창고 삭제
 * -------------------------------------------------------------- */

function deleteWarehouse() {
	// 체크된 항목의 IID 수집
	let selectedIds = [];
	$('.warehouse_chk:checked').each(function() {
		selectedIds.push($(this).data('iid'));
	});

	if (selectedIds.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	if (!confirm(i18n.t('confirmation.items.delete'))) {
		return;
	}

	showLoading("data");

	$.ajax({
		url: "/delete_warehouse",
		type: "POST",
		data: JSON.stringify({
			iids: selectedIds
		}),
		contentType: "application/json",
		success: function(response) {
			hideLoading();
			// 목록 재조회
			performWarehouseDBSearch({ });
		},
		error: function(xhr, status, error) {
			console.error("창고 삭제 실패:", error);
			console.error("응답:", xhr.responseText);
			hideLoading();
			alert("창고 삭제에 실패했습니다. 다시 시도해주세요.");
		}
	});
}