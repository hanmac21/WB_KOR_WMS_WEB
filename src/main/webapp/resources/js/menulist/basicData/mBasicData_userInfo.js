let globalUserInfoData = []; // 현재 조회된 데이터 저장
let currentUserInfoPage = 1; // 현재 페이지
let userInfoItemsPerPage = 1000; // 페이지당 항목 수
let totalUserInfoCount = 0; // 서버에서 받은 총 개수 저장
let totalUserInfoTotalPages = 0; // 서버에서 받은 총 개수 저장
$(document).ready(function() {

	window.filteredUserInfoData = []; // 현재 표시되는 데이터 (엑셀 다운로드용)

	// 메인 호출 함수 - 초기 로딩 시에는 검색 조건 없이 전체 조회
	window.call_mBasicData_userInfo = function(menuId) {
		showLoading("data");

		// 초기 로딩 시에는 빈 검색 조건으로 조회
		performUserInfoDBSearch({});
	}
});
// DB에서 데이터 조회하는 함수
function performUserInfoDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_userInfo",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentUserInfoPage,
			itemsPerPage: userInfoItemsPerPage
		}),
		contentType: "application/json",
		success: function(data) {
			console.log("-- DB 조회 결과 --");
			console.log(data);

			globalUserInfoData = data.records || data || []; // 서버 응답 구조에 맞게 조정
			totalUserInfoCount = data.totalCount || 0;
			window.filteredUserInfoData = globalUserInfoData;

			totalUserInfoTotalPages = data.totalPages;
			currentUserInfoPage = data.currentPage;

			// 첫 번째 검색이라면 뷰를 렌더링
			if (!$('#view_mBasicData_userInfo').length) {
				renderUserInfoView();
			} else {
				// 기존 뷰가 있다면 테이블만 업데이트
				renderUserInfoTableData();
				renderUserInfoPagination();
				updateUserInfoTotalCount();
			}

			hideLoading();

			batchMenuList();
		},
		error: function(xhr, status, error) {
			console.error("DB 조회 실패:", error);
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

// 사용자 뷰 렌더링 함수
function renderUserInfoView() {
	let content_output = `
			<div class="divBlockControl" id="view_mBasicData_userInfo">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search-label">
								<div class="search_access">${i18n.t('search.accessStatus')}</div>
								<select id="userInfo_searchVal_access">
									<option value="">${i18n.t('search.all')}</option>
									<option value="N">${i18n.t('search.disabled')}</option>
									<option value="Y">${i18n.t('search.enabled')}</option>
								</select>
							</div>
							<div class="search-label">
								<div class="search_buName">${i18n.t('search.bu_name')}</div>
								<input type="text" id="userInfo_searchVal_buName" />
							</div>
							<div class="search-label">
								<div class="search_ksName">${i18n.t('search.ks_name')}<!-- KS_NAME --></div>
								<input type="text" id="userInfo_searchVal_ksName" />
							</div>
							<div class="search-label">
								<div class="search_ksId">${i18n.t('search.ks_id')}<!-- KS_ID --></div>
								<input type="text" id="userInfo_searchVal_ksId" />
							</div>							
						</div>
						<div class="search_button_area">
							<button class="btn btn-primary btnUserInfoSearch">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnUserInfoSearchInit">${i18n.t('btn.clear')}<!-- 초기화 --></button>
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
							<div class="userBtnArea">
								<div class="userArea_left">
									<span>${i18n.t('table.info.total')}<strong id="userInfoTotalCount">${totalUserInfoCount}</strong> ${i18n.t('table.info.records')} | 
									${i18n.t('table.page')} <strong id="userInfoCurrentPageInfo">${currentUserInfoPage}</strong>/<strong id="userInfoTotalPageInfo">${totalUserInfoTotalPages}</strong></span>
								</div>
								<div class="userArea_right">
									<div class="userEditArea">										
										<!-- <input type="button" class="btn btn-primary" id="userFactoryAccess" value="${i18n.t('btn.access.factory.edit')}"> 
										<input type="button" class="btn btn-success" id="userAccess" value="${i18n.t('btn.access.enable')}"> 
										<input type="button" class="btn btn-warning" id="userBlock" value="${i18n.t('btn.access.block')}"> 
										<input type="button" class="btn btn-info" id="userFactory" value="${i18n.t('btn.access.factory')}">
										<input type="button" class="btn btn-info" id="userDepartment" value="${i18n.t('btn.access.depart')}"> -->
										<!-- // 260409 DH - 메뉴 권한 기능 임시 제거 
										<input type="button" class="btn btn-primary" id="usersMenuAccess" value="${i18n.t('btn.access.permission')}"> -->
										<input type="button" class="btn btn-info" id="userUpdate" value="${i18n.t('btn.user.update')}">
									</div>
									
									<div class="userInsertArea">
										<input type="button" class="btn btn-success" id="userInsert" value="${i18n.t('btn.access.insert')}">
										<input type="button" class="btn btn-danger" id="userDelete" value="${i18n.t('btn.access.delete')}">
 									</div>
								</div>
							</div>
						</div>
						
						<table class="data-table mBasicData_userInfo">
							<thead>
								<tr>
									<th>
										<input type="checkbox" class="user_chkAll">
									</th>
									<th>${i18n.t('table.no')}</th>
									<th>${i18n.t('table.access')}</th>
									<th>${i18n.t('search.bu_name')}</th>
									<th>${i18n.t('search.ks_name')}</th>
									<th>${i18n.t('search.ks_id')}</th>
									<!--<th>${i18n.t('search.ks_sabun')}</th>-->
									<th>${i18n.t('search.ks_indate')}</th>
									<!-- <th>${i18n.t('table.access.menu')}</th> -->
								</tr>
							</thead>
							<tbody id="userInfoTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="userInfoPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;

	$(".w_contentArea").append(content_output);

	// 테이블 데이터 렌더링
	renderUserInfoTableData();
	// 페이지네이션 렌더링
	renderUserInfoPagination();
	// 이벤트 바인딩
	bindUserInfoEvents();
	// 초기 렌더링 후 카운트 업데이트
	updateUserInfoTotalCount();
}

// 총 개수를 업데이트하는 함수
function updateUserInfoTotalCount() {
	$('#userInfoTotalCount').text(totalUserInfoCount);
}

function renderUserInfoTableData() {
	let tableBody = "";

	$("#userInfoCurrentPageInfo").text(currentUserInfoPage);
	$("#userInfoTotalPageInfo").text(totalUserInfoTotalPages);

	// 서버에서 이미 페이징된 데이터를 받았으므로 startIndex, endIndex 계산 불필요
	for (let i = 0; i < globalUserInfoData.length; i++) {
		let rowNumber = (currentUserInfoPage - 1) * userInfoItemsPerPage + i + 1;
		let data = globalUserInfoData[i];

		// 날짜 형식 변환
		let formattedDate = formatDateFromYYYYMMDD(data.ks_indate || data.KS_INDATE);

		tableBody += `
	            <tr>
					<td><input type="checkbox" class="user_chkRow" data-depat="${data.bu_name || data.BU_NAME || ''}" data-id="${data.ks_id || data.KS_ID}" data-name="${data.ks_name || data.KS_NAME || ''}"></td>
					<td>${rowNumber}</td>
					<td>
						<span class="status-badge 
				       		${(data.ks_wmsloginyn || data.KS_WMSLOGINYN) === 'Y' ? 'status-complete' : 'status-waiting'}">
				    		${(data.ks_wmsloginyn || data.KS_WMSLOGINYN) === 'Y' ? i18n.t('table.enabled') : i18n.t('table.disabled')}
				  		</span>
				  	</td>
					<td>${data.bu_name || data.BU_NAME || ''}</td>
					<td>${data.ks_name || data.KS_NAME || ''}</td>
					<td>${data.ks_id || data.KS_ID || ''}</td>
					<!--<td>${data.ks_sabun || data.KS_SABUN || ''}</td>-->
					<td>${formattedDate}</td>
					<!-- <td><input type="button" class="modalMenuAccess" value="${i18n.t('btn.edit')}" data-ksinfo="${data.ks_wmsloginyn}_${data.bu_name}_${data.ks_name}_${data.ks_id}_${data.ks_indate}"</td> -->
				</tr>
	        `;
	}

	$("#userInfoTableBody").html(tableBody);
}

// 페이지네이션 렌더링
function renderUserInfoPagination() {
	let totalPages = Math.ceil(totalUserInfoCount / userInfoItemsPerPage);
	let paginationHtml = "";

	// 이전 버튼
	if (currentUserInfoPage > 1) {
		paginationHtml += `<button class="userInfo-page-btn" data-page="${currentUserInfoPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="userInfo-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentUserInfoPage - 5);
	let endPage = Math.min(totalPages, currentUserInfoPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="userInfo-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentUserInfoPage) {
			paginationHtml += `<button class="userInfo-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="userInfo-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="userInfo-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentUserInfoPage < totalPages) {
		paginationHtml += `<button class="userInfo-page-btn" data-page="${currentUserInfoPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="userInfo-page-btn disabled">&gt;</button>`;
	}

	$("#userInfoPaginationContainer").html(paginationHtml);
}

// 이벤트 바인딩
function bindUserInfoEvents() {
	// 검색 버튼 클릭 - DB에서 새로 조회
	$(".btnUserInfoSearch").off('click').on('click', function() {
		performUserInfoSearch();
	});

	// 초기화 버튼 클릭
	$(".btnUserInfoSearchInit").off('click').on('click', function() {
		resetUserInfoSearch();
	});

	// 페이지네이션 버튼 클릭 - DB에서 해당 페이지 데이터 조회
	$(document).off('click', '.userInfo-page-btn').on('click', '.userInfo-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentUserInfoPage = page;
				// 현재 검색 조건으로 DB에서 새 페이지 조회
				let searchCriteria = getCurrentSearchCriteria();
				performUserInfoDBSearch(searchCriteria);
			}
		}
	});

	// 엔터키 검색
	$('#view_mBasicData_userInfo input[type="text"], #view_mBasicData_userInfo input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performUserInfoSearch();
		}
	});
}

// 현재 검색 조건 수집 함수
function getCurrentSearchCriteria() {
	return {
		access: $("#userInfo_searchVal_access").val(),
		buName: $("#userInfo_searchVal_buName").val().trim(),
		ksName: $("#userInfo_searchVal_ksName").val().trim(),
		ksId: $("#userInfo_searchVal_ksId").val().trim(),
		//ksIndate: $("#userInfo_searchVal_ksIndate").val()
	};
}

// 검색 수행 함수 - DB 조회
function performUserInfoSearch() {
	let searchCriteria = getCurrentSearchCriteria();

	console.log("검색 조건:", searchCriteria);

	// 페이지를 1로 초기화하고 DB에서 검색
	currentUserInfoPage = 1;
	performUserInfoDBSearch(searchCriteria);
}

// 검색 조건 초기화
function resetUserInfoSearch() {
	$("#userInfo_searchVal_access").val('');
	$("#userInfo_searchVal_buName").val('');
	$("#userInfo_searchVal_ksName").val('');
	$("#userInfo_searchVal_ksId").val('');
	$("#userInfo_searchVal_ksSabun").val('');
	//$("#userInfo_searchVal_ksIndate").val('');

	// 초기화 후 전체 데이터 다시 조회
	currentUserInfoPage = 1;
	performUserInfoDBSearch({});

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
window.changeUserInfoItemsPerPage = function(newItemsPerPage) {
	userInfoItemsPerPage = newItemsPerPage;
	currentUserInfoPage = 1;
	let searchCriteria = getCurrentSearchCriteria();
	performUserInfoDBSearch(searchCriteria);
}

window.exportUserInfoData = function() {
	return {
		total: globalUserInfoData.length,
		currentPage: currentUserInfoPage,
		itemsPerPage: userInfoItemsPerPage,
		data: globalUserInfoData
	};
}

$(document).on("click", "#userDelete", function() {
	if (confirm(i18n.t('confirmation.account.delete'))) {
		const sList = [];
		$(".user_chkRow:checked").each(function() {
			let id = $(this).data('id');
			sList.push({ id: id });
		});

		if (sList.length === 0) {
			alert(i18n.t('validation.account.required'));
			return;
		}
		//console.log(sList);
		$.ajax({
			url: "/userDelete",
			type: "POST",
			data: JSON.stringify(sList),
			contentType: "application/json",
			success: function(res) {
				alert(i18n.t('success.user.delete'));
				let searchCriteria = getCurrentSearchCriteria();
				performUserInfoDBSearch(searchCriteria);
			},
			error: function(xhr, status, error) {
				// ❌ alert(res.message) <- res 없음 (버그)
				window.handleAjaxError(xhr, status, error);
			}
		});
	}
});


// 전체 선택/해제
$(document).on("click", ".user_chkAll", function() {
	let isChecked = $(this).is(':checked');
	$('.user_chkRow').prop('checked', isChecked);
});

// 개별 체크박스 클릭 시 전체 체크박스 상태 업데이트
$(document).on("click", ".user_chkRow", function() {
	let totalCount = $('.user_chkRow').length;
	let checkedCount = $('.user_chkRow:checked').length;
	$('.user_chkAll').prop('checked', totalCount === checkedCount);
});

/* 모달 메뉴 리스트 userInfo 탭 킬 때 한번만 호출, 적용*/
function batchMenuList() {
	console.log("함수 실행됨");

	$(".userInfoModal_commonContentArea").remove();
	// input#answer01의 형제 요소 중 div를 찾기
	//const $accordionContent = $('.menuListCallBack_1')
	//console.log("아코디언 컨텐츠 div 개수:", $accordionContent.length);

	let menuHtml_1 = '';
	let menuHtml_2 = '';
	let menuHtml_3 = '';
	let menuHtml_4 = '';
	let menuHtml_5 = '';
	let menuHtml_sales = '';

	// 해당 div 안의 p.divBlockTrigger 찾기
	// menuList1
	$('.menuListCallBack_1').find('p.divBlockTrigger').each(function(index) {
		const menuText = $(this).text().trim();
		let matchingVal = $(this).data('matching');
		const firstClass = index === 0 ? ' first-item' : '';
		menuHtml_1 += `
		    <div class="userInfoModal_commonContentArea menuList1${firstClass}">
		        <div class="userInfoModal_commonMenu">
		            <input type="checkbox" class="userInfoModal_chkCommon" data-unique="${matchingVal}">
		            <div class="userInfoModal_commonMenuTitle">${menuText}</div>
		        </div>
		    </div>
		    `;
	});

	// menuList2
	$('.menuListCallBack_2').find('p.divBlockTrigger').each(function(index) {		
		const menuText = $(this).text().trim();
		let matchingVal = $(this).data('matching');
		const firstClass = index === 0 ? ' first-item' : '';
		menuHtml_2 += `
		    <div class="userInfoModal_commonContentArea menuList2${firstClass}">
		        <div class="userInfoModal_commonMenu">
		            <input type="checkbox" class="userInfoModal_chkCommon" data-unique="${matchingVal}">
		            <div class="userInfoModal_commonMenuTitle">${menuText}</div>
		        </div>
		    </div>
		    `;
	});

	// menuList3
	$('.menuListCallBack_3').find('p.divBlockTrigger').each(function(index) {		
		const menuText = $(this).text().trim();
		let matchingVal = $(this).data('matching');
		const firstClass = index === 0 ? ' first-item' : '';
		menuHtml_3 += `
		    <div class="userInfoModal_commonContentArea menuList3${firstClass}">
		        <div class="userInfoModal_commonMenu">
		            <input type="checkbox" class="userInfoModal_chkCommon" data-unique="${matchingVal}">
		            <div class="userInfoModal_commonMenuTitle">${menuText}</div>
		        </div>
		    </div>
		    `;
	});

	$('.menuListCallBack_sales').find('p.divBlockTrigger').each(function(index) {		
		const menuText = $(this).text().trim();
		let matchingVal = $(this).data('matching');
		const firstClass = index === 0 ? ' first-item' : '';
		menuHtml_sales += `
		    <div class="userInfoModal_commonContentArea menuList5${firstClass}">
		        <div class="userInfoModal_commonMenu">
		            <input type="checkbox" class="userInfoModal_chkCommon" data-unique="${matchingVal}">
		            <div class="userInfoModal_commonMenuTitle">${menuText}</div>
		        </div>
		    </div>
		    `;
	});

	$('.userInfoModal_menu1').after(menuHtml_1);
	$('.userInfoModal_menu2').after(menuHtml_2);
	$('.userInfoModal_menu3').after(menuHtml_3);
	$('.userInfoModal_menuSales').after(menuHtml_sales);

	// 그룹핑 실행
	groupDuplicateCheckboxes();
}



// 모든 HTML 생성이 완료된 후 실행
function groupDuplicateCheckboxes() {
	const uniqueValues = {};

	// 1단계: 모든 체크박스의 data-unique 값을 수집하고 개수 세기
	$('.userInfoModal_chkCommon').each(function() {
		const unique = $(this).data('unique');
		if (!uniqueValues[unique]) {
			uniqueValues[unique] = [];
		}
		uniqueValues[unique].push(this);
	});

	// 2단계: 2개 이상인 것들에 그룹 클래스 추가
	Object.keys(uniqueValues).forEach((unique, groupIndex) => {
		if (uniqueValues[unique].length >= 2) {
			// 같은 unique 값을 가진 요소들에 동일한 그룹 클래스 추가
			$(uniqueValues[unique]).addClass(`checkbox-group-${groupIndex}`);

			console.log(`그룹 생성: ${unique} (${uniqueValues[unique].length}개)`);
		}
	});
}

// 체크박스 직접 클릭 시에도 그룹 동작
$(document).on('change', '.userInfoModal_chkCommon', function() {
	triggerGroupAction(this);
});
// 그룹 동작 함수
function triggerGroupAction(checkbox) {
	const $checkbox = $(checkbox);
	const groupClasses = $checkbox.attr('class').match(/checkbox-group-\d+/g);

	if (groupClasses) {
		const isChecked = $checkbox.prop('checked');

		groupClasses.forEach(groupClass => {
			$(`.${groupClass}`).prop('checked', isChecked);
		});
	}
}

let roleMenuMap = {}; // { ROLE_ID: Set([MENU_CODE...]) }
let selectedRoles = new Set(); // 토글로 선택된 역할들
let currentUserMenuState = []; // 현재 사용자들의 메뉴 상태 저장
let initialSelectedRoles = new Set(); // 초기 사용자들의 역할 저장
let isInitialLoad = true; // 최초 로딩 여부 플래그

$(document).on('click', '#usersMenuAccess', function () {
	const idsList = [];
	$('.user_chkRow:checked').each(function () {
		idsList.push($(this).data('id'));
	});
	
	if (idsList.length === 0) {
		alert(i18n.t('validation.no.select.items'));
		return;
	}

	showLoading("data");
	
	$.ajax({
		url: "/read_users_access_init",
		type: "POST",
		data: JSON.stringify(idsList),
		contentType: "application/json",
		success: function (res) {
//			console.log(res);
			
			// roleMenuMap 구성
			roleMenuMap = {};
			res.roleMenus.forEach(data => {
				const role = data.ROLE_ID || data.role_id;
				const menu = data.MENU_CODE || data.menu_code;
				if (!roleMenuMap[role]) 
					roleMenuMap[role] = new Set();
				roleMenuMap[role].add(menu);
			});
			
			renderRoleList(res.roles, idsList.length);

			// 사용자 메뉴 상태를 전역 변수에 저장
			currentUserMenuState = res.userMenus || [];
			
			// 최초 로딩 플래그 설정
			isInitialLoad = true;
			
			// 초기 상태: 사용자 권한만 표시
			applyUserMenuState(currentUserMenuState);
			
			hideLoading();
			
			$('.usersInfo').removeClass("isNotActive");
			$('.userInfo').addClass("isNotActive");
			$('#userCount').text(idsList.length);
			$('#userInfoMenuAccessModal').fadeIn(200);
		},
		error: function (xhr, status, error) {
			hideLoading();
			window.handleAjaxError(xhr, status, error);
		}
	});
});

function renderRoleList(roleRows, totalCnt) {
	const list = $('#roleList');
	list.empty();
	
	selectedRoles = new Set();
	initialSelectedRoles = new Set();
	
	roleRows.forEach(role => {
		const roleId = role.ROLE_ID || role.role_id;
		const assignedCnt = Number(role.ASSIGNED_CNT || role.assigned_cnt || 0);
		const isAssigned = assignedCnt > 0; 

		if (isAssigned) {
			selectedRoles.add(roleId);
			initialSelectedRoles.add(roleId);
		}
		
		list.append(`
			<div class="role-item ${isAssigned ? 'assigned' : ''}" data-role="${roleId}">
				${roleId}
				<span class="badge">${assignedCnt}/${totalCnt}</span>
			</div>
		`);
	});
}

$(document).on('click', '.role-item', function () {
	const roleId = $(this).data('role');
	if (!roleId) return;

	// 역할 클릭 시 최초 로딩 상태 해제
	isInitialLoad = false;

	const wasAssigned = $(this).hasClass('assigned');
	const isOn = !wasAssigned;
	
	if (roleId === 'MANAGER' && isOn){
		$('.role-item').removeClass('assigned');
		$(this).addClass('assigned');
		
		selectedRoles.clear();
		selectedRoles.add('MANAGER');
	} else if (roleId === 'MANAGER' && !isOn) {
		// MANAGER 비활성화: 그냥 제거만
		$(this).removeClass('assigned');
		selectedRoles.delete('MANAGER');
	} else {
		// 다른 역할 클릭 시: MANAGER가 있으면 제거
		if (selectedRoles.has('MANAGER')) {
			$('.role-item[data-role="MANAGER"]').removeClass('assigned');
			selectedRoles.delete('MANAGER');
		}
		
		$(this).toggleClass('assigned');
		
		if (isOn) selectedRoles.add(roleId);
		else      selectedRoles.delete(roleId);	
	}
	
	applySelectedRoles();
});

function applySelectedRoles() {
	// 선택된 역할들의 메뉴 합집합 계산
	const unionAllowed = new Set();
	
	selectedRoles.forEach(rid => {
		const s = roleMenuMap[rid];
		if (!s) return;
		s.forEach(code => unionAllowed.add(code));
	});
	
	// 모든 체크박스 초기화
	$(".userInfoBigMenuCommon, .userInfoModal_chkCommon").prop('checked', false).prop('indeterminate', false);
	
	// 1단계: 사용자 권한 상태 적용 (최초 로딩일 때만 M 상태 적용)
	const all = $(".userInfoBigMenuCommon, .userInfoModal_chkCommon");
	
	currentUserMenuState.forEach(data => {
		const code = data.MENU_CODE || data.menu_code;
		const state = (data.STATE || data.state || 'N').toUpperCase();
		if (!code) return;

		const chk = all.filter(`[data-unique="${code}"]`);
		if (chk.length === 0) return;

		if (state === 'Y') {
			chk.prop('checked', true).prop('indeterminate', false);
		} else if (state === 'M') {
			// 최초 로딩일 때만 M 상태(indeterminate) 적용
			if (isInitialLoad) {
				chk.prop('checked', false).prop('indeterminate', true);
			} else {
				// 역할 재클릭 시에는 체크 상태로 변경
				chk.prop('checked', true).prop('indeterminate', false);
			}
		} else if (state === 'N') {
			chk.prop('checked', false).prop('indeterminate', false);
		}
	});
	
	// 2단계: 추가된 역할의 메뉴 체크 (초기 역할에 없던 것만)
	selectedRoles.forEach(rid => {
		if (initialSelectedRoles.has(rid)) return;
		
		const menus = roleMenuMap[rid];
		if (!menus) return;
		
		menus.forEach(code => {
			const chk = all.filter(`[data-unique="${code}"]`);
			chk.prop('checked', true).prop('indeterminate', false);
		});
	});
	
	// 3단계: 제거된 역할의 메뉴 체크 해제 (초기 역할에 있었는데 제거된 것만)
	initialSelectedRoles.forEach(rid => {
		if (selectedRoles.has(rid)) return;
		
		const menus = roleMenuMap[rid];
		if (!menus) return;
		
		menus.forEach(code => {
			let isInOtherRole = false;
			selectedRoles.forEach(otherRid => {
				if (roleMenuMap[otherRid] && roleMenuMap[otherRid].has(code)) {
					isInOtherRole = true;
				}
			});
			
			if (!isInOtherRole) {
				const chk = all.filter(`[data-unique="${code}"]`);
				chk.prop('checked', false).prop('indeterminate', false);
			}
		});
	});

	checkBigMenu();
}

function applyUserMenuState(rows) {
	const all = $(".userInfoBigMenuCommon, .userInfoModal_chkCommon");
	
	// 초기화
	all.prop('checked', false).prop('indeterminate', false);
	
	// 사용자 메뉴 상태에 따라 설정
	(rows || []).forEach(x => {
		const code = x.MENU_CODE || x.menu_code;
		const state = (x.STATE || x.state || 'N').toUpperCase();
		if (!code) return;

		const $chk = all.filter(`[data-unique="${code}"]`);
		if ($chk.length === 0) return;

		if (state === 'Y') {
			$chk.prop('checked', true).prop('indeterminate', false);
		} else if (state === 'M') {
			// 최초 로딩일 때만 indeterminate 적용
			if (isInitialLoad) {
				$chk.prop('checked', false).prop('indeterminate', true);
			} else {
				$chk.prop('checked', true).prop('indeterminate', false);
			}
		} else if (state === 'N') {
			$chk.prop('checked', false).prop('indeterminate', false);
		}
	});

	checkBigMenu();
}


//대메뉴 클릭 시 역할 자동 선택/해제 (MANAGER 제외)
$(document).on('click', '.userInfoBigMenuCommon', function(e) {
	// 대메뉴 클릭 시 최초 로딩 상태 해제
	isInitialLoad = false;
	
	let controlType = $(this).data('control');
	let isChecked = $(this).is(':checked');
	let menuCode = $(this).data('unique');
	
	// 하위 메뉴 체크 상태 변경
	$("." + controlType + "_parent").find('.userInfoModal_chkCommon').prop('checked', isChecked).prop('indeterminate', false);

	// 대메뉴 체크/해제에 따라 해당 메뉴를 포함하는 역할 추가/제거 (MANAGER 제외)
	if (menuCode) {
		Object.keys(roleMenuMap).forEach(roleId => {
			if (roleId === 'MANAGER') return; // MANAGER 제외
			
			if (roleMenuMap[roleId].has(menuCode)) {
				if (isChecked) {
					// 체크 시: 역할 추가
					selectedRoles.add(roleId);
					$(`.role-item[data-role="${roleId}"]`).addClass('assigned');
				} else {
					// 체크 해제 시: 역할 제거
					selectedRoles.delete(roleId);
					$(`.role-item[data-role="${roleId}"]`).removeClass('assigned');
				}
			}
		});
	}

	// 체크 상태에 따른 스타일 변경
	if (isChecked) {
		$("." + controlType + "_parent").css("opacity", "1");
		$("." + controlType + "_parent > div").css("pointer-events", "all");
	} else {
		$("." + controlType + "_parent").css("opacity", "0.7");
		$("." + controlType + "_parent > div").css("pointer-events", "none");
	}
});

function checkBigMenu() {
	// 각 대분류 메뉴의 체크 상태를 확인
	$('.userInfoBigMenuCommon').each(function() {
		let controlType = $(this).data('control');
		
		// checked 또는 indeterminate 상태 확인
		const isActive = $(this).is(':checked') || $(this).prop('indeterminate');

		if (isActive) {
			// 체크되거나 혼합 상태일 때
			$("." + controlType + "_parent").css({
				"opacity": "1"
			});
			$("." + controlType + "_parent > div").css({
				"pointer-events": "all"
			});
		} else {
			// 체크 해제된 상태일 때
			$("." + controlType + "_parent").css({
				"opacity": "0.7"
			});
			$("." + controlType + "_parent > div").css({
				"pointer-events": "none"
			});
		}
	});
}


// 모달 닫기 이벤트들
// X 버튼 클릭
$(document).on('click', '.userInfoModal-close', function() {
	$('#userInfoMenuAccessModal').fadeOut(200);
});

$(document).on('click', '.userInfoModal_btnCancel', function() {
	$('#userInfoMenuAccessModal').fadeOut(200);
});

// 오버레이 클릭
$(document).on('click', '#userInfoMenuAccessModal', function(e) {
	if (e.target === this) {
		$(this).fadeOut(200);
	}
});

// ESC 키로 닫기
$(document).on('keydown', function(e) {
	if (e.keyCode === 27 && $('#userInfoMenuAccessModal').is(':visible')) {
		$('#userInfoMenuAccessModal').fadeOut(200);
	}
});

$(document).on('click', '.userInfoModal_commonMenu', function(e) {
	const $checkbox = $(this).find('.userInfoModal_chkCommon');

	// 체크박스 자체를 클릭한 경우가 아닐 때만 토글
	if (e.target !== $checkbox[0]) {
		$checkbox.prop('checked', !$checkbox.prop('checked'));
		// 그룹 동작 실행
		triggerGroupAction($checkbox[0]);
	}
});


$(document).on('click', '.userInfoModal_btnInit', function(e) {
	if (confirm(i18n.t('confirmation.permission.revoked'))) {

		// 확인 시 동작
		$(".userInfoModal_chkCommon").prop("checked", false);
	}
});

$(document).on('click', '.userInfoModal_btnSuccess', function(e){
	if (!confirm(i18n.t('confirmation.permission.save'))) return;
	
	const idsList = [];
	$('.user_chkRow:checked').each(function() {
		idsList.push($(this).data('id'));
	});
	
	// 현재 assigned된 역할 = 모든 사용자에게 부여할 역할
	const finalRoles = Array.from(selectedRoles);
	
	// 역할에 따라 활성화 되어야 하는 메뉴 계산
	const roleBaseMenus = new Set();
	selectedRoles.forEach(role => {
		const menu = roleMenuMap[role];
		if (menu)
			menu.forEach(m => roleBaseMenus.add(m));
	});
	
	// 현재 체크된 메뉴 수집
	const checkedMenus = [];
	$('.userInfoBigMenuCommon:checked, .userInfoModal_chkCommon:checked').each(function(){
		const code = $(this).data('unique');
		if (code)
			checkedMenus.push(code);
	});
	
	// 예외 계산
	const overrideAdded = []; 		// 역할 외 추가된 메뉴
	const overrideRemoved = [];		// 역할에서 제외된 메뉴
	
	// 역할에 포함되지 않은 메뉴 추가
	checkedMenus.forEach(menu => {
		if (!roleBaseMenus.has(menu)){
			overrideAdded.push(menu);
		}
	});
	
	// 역할에 포함되어 있는 메뉴 중 체크되지 않은 메뉴 제외
	roleBaseMenus.forEach(menu => {
		if (!checkedMenus.includes(menu)){
			overrideRemoved.push(menu);
		}
	});
	
	// 서버로 전송할 데이터 구성
	const saveData = {
		userIds: idsList,
		finalRoles: finalRoles,
		isManager: selectedRoles.has('MANAGER'),
		overrideAdded: overrideAdded,
		overrideRemoved: overrideRemoved
	};
	
	console.log("저장할 데이터:", saveData);
	
	showLoading("data");
	
	$.ajax({
		url: `/update_user_menu_access`,
		type: "POST",
		data: JSON.stringify(saveData),
		contentType: "application/json",
		success: function(data){
			console.log(data);
			if (data >= 1) {
				alert(i18n.t('success.permission.save'));
				$(".userInfoModal-close").click();
			} else {
				alert(i18n.t('error.process.failed'));
			}
			hideLoading();

			// 체크박스 해제
			$('.user_chkAll:checked').prop('checked', false);
			$('.user_chkRow:checked').prop('checked', false);
		},
		error: function(xhr, status, error) {
			window.handleAjaxError(xhr, status, error);
		}		
	});
});

// 쿠키 값을 가져오는 함수
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
	return null;
}

// 모달 열기
$(document).on('click', '#userInsert', function(e) {
	$('#modal_userInsertForm').show();
	$('input[name="KS_INDATE"]').val(new Date().toISOString().split('T')[0]);
	
	// 패스워드 공백 방지
	$("#userInsert_pass").off("input keydown").on("input keydown", function(e) {
		if (e.type === "keydown" && e.keyCode === 32) {
			e.preventDefault();
		} else if (e.type === "input") {
			$(this).val($(this).val().replace(/\s/g, ''));
		}
	});
	$("#userInsert_indate").on("keydown", function(e) {
		e.preventDefault();
		return false;
	});
});

$(document).on('click', '#userInsert_busor', function() {
	const isOthers = $(this).val() === 'others';
	const input = $('.others_depatInput');

	input.toggle(isOthers);
	input.prop('disable', !isOthers);
	if (!isOthers) input.val('');
});

// 모달 닫기
$(document).on('click', '.modal_userInsertForm_close, #modal_userInsertForm_cancel', function() {
	$('#modal_userInsertForm').hide();
	$('#form_userInsertForm')[0].reset();
});

const headingTexts = [i18n.t('modal.title.basic'), i18n.t('modal.title.factory'), i18n.t('modal.title.department'), i18n.t('modal.title.account'), i18n.t('modal.title.security')];
let userData = [];

//모달 열기
$(document).on('click', '#userUpdate', function(e) {
	const $checked = $(".user_chkRow:checked");

	if ($checked.length === 0) {
		alert(i18n.t('validation.account.required'));
		return;
	}

	if ($checked.length > 1) {
		alert(i18n.t('validation.account.one'));
		return;
	}

	const id = $checked.data('id');

	$.ajax({
		url: `getUserInfo`,
		type: "GET",
		data: { id: id },
		success: function(res) {
			userData = res;			// 초반 데이터를 저장
			console.log(userData);

			let name = res.KS_NAME || '';
			let id = res.KS_ID || '';
			let indate = res.KS_INDATE || '';
			let wmsloginyn = res.KS_WMSLOGINYN || '';
			let factoryAccess = res.KS_FACTORY_ACCESS || '';
			let factory = res.KS_FACTORY || '';
			let busor = res.KS_BUSOR || '';
			let dmlAccess = res.KS_DML_ACCESS || '';

			// 이름 설정
			$('.userInfo-name').text(name);
			// 아이디 설정
			$('.userInfo-id').text(id);
			// 부서 설정
			$('.userInfo-dept').text($(".user_chkRow:checked").data('depat'));

			// 날짜 포멧 후 설정
			if (indate) {
				let date = indate.slice(0, 4) + '-' + indate.slice(4, 6) + '-' + indate.slice(6, 8);
				$('.userInfo-indate').text(date);
			}

			// 사용자 활성화, 비활성화 설정
			if (wmsloginyn === 'Y') {		// 활성화
				$('.modal_userUpdateForm_status_badge')
					.removeClass('modal_userUpdateForm_status_inactive')
					.addClass('modal_userUpdateForm_status_active')
					.text(i18n.t('search.enabled'));
			} else {						// 비활성화
				$('.modal_userUpdateForm_status_badge')
					.removeClass('modal_userUpdateForm_status_active')
					.addClass('modal_userUpdateForm_status_inactive')
					.text(i18n.t('search.disabled'));
			}

			// 근무 공장 설정
			$('.modal_userUpdateForm_select').val(factory);

			// 접근 공장 설정
			if (factoryAccess === 'ALL') {
				setFactoryAccess('ALL');
			} else if (factoryAccess === 'SALTILLO') {
				setFactoryAccess('SALTILLO');
			} else if (factoryAccess === 'PUEBLA') {
				setFactoryAccess('PUEBLA');
			}

			// 부서 설정
			$(".modal_userUpdateForm_text").val($(".user_chkRow:checked").data('depat'));

			// 편집 권한 설정
			$("input[value='dml_access']").prop("checked", dmlAccess === 'Y');

			// 로그인 권한 설정
			$("input[value='login_access']").prop('checked', wmsloginyn === 'Y');

			// 비밀번호 입력 값 초기화
			$('#pw_current, #pw_new, #pw_confirm').val('');

			// 모달 창 출력
			$('.modal_userUpdateForm').css('display', 'flex');
		}
	});
});

// 공장 설정
function setFactoryAccess(factoryAccess) {
	const all = $('input[name="factoryAccess"]');

	all.prop("checked", false);

	const target = $(`input[name="factoryAccess"][value="${factoryAccess}"]`);
	if (target.length) {
		target.prop("checked", true);
	}
}

// 사용자 클릭 시: 하나만 남기기
$(document).on("change", 'input[name="factoryAccess"]', function() {
	const $all = $('input[name="factoryAccess"]');

	if ($(this).is(":checked")) {
		$all.not(this).prop("checked", false);
	} else {
		$(this).prop("checked", true);
	}

	const selected = $('input[name="factoryAccess"]:checked').val() || null;
});

// 
$(document).on('click', '.modal_userUpdateForm_nav_item', function(e) {
	e.preventDefault();   // ✅ 중요: button 기본 submit 막기
	e.stopPropagation();  // ✅ 혹시 모를 중복 클릭 버블 방지

	const idx = parseInt($(this).data('panel'), 10) || 0;
	resetUserUpdateModal(idx);
});

// 모달 선택 초기화
function closeUserUpdateModal() {
	resetUserUpdateModal(0);
	$('.modal_userUpdateForm').hide();
}

// 모달 x 버튼 클릭 시
$(document).on('click', '.modal_userUpdateForm_close', function(e) {
	e.preventDefault();
	closeUserUpdateModal();
});

// 모달 취소 버튼 클릭 시
$(document).on('click', '.modal_userUpdateForm_btn_secondary', function(e) {
	e.preventDefault();
	closeUserUpdateModal();
});

// 모달 선택 화면 설정
function resetUserUpdateModal(panelIndex) {
	const idx = parseInt(panelIndex, 10) || 0;

	$('.modal_userUpdateForm_nav_item')
		.removeClass('active')
		.filter(`[data-panel="${idx}"]`)
		.addClass('active');

	$('.modal_userUpdateForm_section')
		.removeClass('active')
		.eq(idx)
		.addClass('active');

	$('#userUpdate_currentTitle').text(headingTexts[idx]);
}

//Others 클릭 시 부서 입력 창 보이게
$(document).on('click', '#newUserDepartment', function(e) {
	const othersInput = $('.others_departInput');

	const inputVal = $('#newUserDepartment').val();

	if (inputVal === 'others') {
		othersInput.css('display', 'block');
	} else {
		othersInput.css('display', 'none');
		othersInput.val('');
	}
});

// 저장 버튼
$(document).on('click', '#btnChangeInfo', function(e) {
	e.preventDefault();

	// 데이터 가져오기
	const payload = buildUserUpdatePayload();

	// 필수값 체크
	if (!payload.factory) {
		alert(i18n.t('validation.factory.select.exactly'));
		return;
	}

	// 현재 부서랑 새 부서랑 동일한지 
	if (userData.KS_BUSOR === $("#newUserDepartment").val()) {
		alert(i18n.t('validation.department.same'));
		return;
	}

	console.log(payload);

	$.ajax({
		url: `/updateUserInfo`,
		type: "POST",
		data: JSON.stringify(payload),
		contentType: "application/json",
		success: function(res) {
			if (!res || res.success !== true) {
				alert((res && res.message) ? res.message : i18n.t('error.save.data'));
				return;
			}

			alert(i18n.t('success.user.update'));
			$(".modal_userUpdateForm").hide();

			let searchCriteria = getCurrentSearchCriteria();
			performUserInfoDBSearch(searchCriteria);
		},
		error: function(xhr, status, error) {
			// ❌ alert(res.message) <- res 없음 (버그)
			window.handleAjaxError(xhr, status, error);
		}
	});
});

// 비밀번호 변경
$(document).on("click", "#btnChangePassword", function(e) {
	e.preventDefault();

	const userId = userData.KS_ID;

	const newPw = ($("#pw_new").val() || "").trim();
	const confirmPw = ($("#pw_confirm").val() || "").trim();

	if (!newPw || !confirmPw) {
		alert("새/확인 비밀번호를 모두 입력해 주세요.");
		return;
	}

	if (newPw !== confirmPw) {
		alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
		return;
	}

	const payload = {
		id: userId,
		newPw: newPw
	};

	$.ajax({
		url: "/updateUserPassword",
		type: "POST",
		data: JSON.stringify(payload),
		contentType: "application/json",
		success: function(res) {
			if (!res || res.success !== true) {
				alert((res && res.message) ? i18n.t(res.message) : "비밀번호 변경에 실패했습니다.");
				return;
			}

			alert("비밀번호가 변경되었습니다.");

			// ✅ 입력칸 초기화
			$("#pw_new, #pw_confirm").val("");
		},
		error: function(xhr, status, error) {
			window.handleAjaxError && window.handleAjaxError(xhr, status, error);
			alert("비밀번호 변경 중 오류가 발생했습니다.");
		}
	});
});


// 전체 저장 payload 만들기
function buildUserUpdatePayload() {
	// 사용자
	const userId = userData.KS_ID;

	// 근무 공장
	const factory = $('#user_factory').val() || "WBTA";

	// 공장 접근 권한
	const factoryAccess = $('input[name="factoryAccess"]:checked').val() || "ALL";

	// 부서
	const newDep = $("#newUserDepartment").val() || "";
	const othersDep = ($("#modal_userUpdateForm_department").val() || "").trim();

	let busor = '';
	if (newDep === "") {
		busor = userData.KS_BUSOR;
	} else {
		// newDep가 others면 입력값 사용, 아니면 select 값 사용
		busor = (newDep === "others") ? othersDep : newDep;
	}

	// 편집 권한
	const dmlAccess = $("input[value='dml_access']").is(":checked") ? "Y" : "N";

	// 로그인 권한
	const loginAccess = $("input[value='login_access']").is(":checked") ? "Y" : "N";

	return {
		id: userId,
		factory,
		factoryAccess,
		busor,
		dmlAccess,
		loginAccess
	};
}

$(document).on('focus', '.others_depatInput', function() {
	$(".modal_userInsertForm_label").val("others");
})

//사용자 등록하기
$(document).on('click', '#userInsertConfirm', function() {
	let id = $("#userInsert_id").val().trim();
	let pass = $("#userInsert_pass").val().trim();
	let busor = $("#userInsert_busor").val().trim();
	let factory = $("#userInsert_factory").val().trim();
	let name = $("#userInsert_name").val();
	let sdate = $("#userInsert_sdate").val().trim();
	let busorText = $(".others_depatInput").val().trim();

	//유효성 체크

	//공백체크
	// 공백 체크
	if (!id) {
		alert(i18n.t('validation.enter.id'));
		$("#userInsert_id").focus();
		return;
	}
	if (!pass) {
		alert(i18n.t('validation.enter.password'));
		$("#userInsert_pass").focus();
		return;
	}
	if (!name) {
		alert(i18n.t('validation.enter.name'));
		$("#userInsert_name").focus();
		return;
	}

	if (id.includes(' ')) {
		alert(i18n.t('validation.id.space'));
		// 모든 공백을 '.'으로 변환
		var newId = id.replace(/\s+/g, '.');

		// 변환된 ID를 input 필드에 다시 적용
		$("#userInsert_id").val(newId);
		return false;
	}
	// 패스워드 공백방지 적용완료
	// 부서선택 필수
	if (busor === "default") {
		alert(i18n.t('validation.department.select.exactly'));
		$("#userInsert_busor").focus().trigger('click');
		return
	} else if (busor === "others" && busorText === "") {
		alert(i18n.t('validation.department.6code'));
		$(".others_depatInput").val("").focus();
		return
	} else if (busor === "others" && !/^\d+$/.test(busorText)) {
		alert(i18n.t('validation.department.number'));
		$(".others_depatInput").val("").focus();
		return
	} else if (busor === "others" && !/^\d{6}$/.test(busorText)) {
		alert(i18n.t('validation.department.6code.exactly'));
		$(".others_depatInput").val("").focus();
		return
	}

	// 공장선택 필수
	if (factory == "default") {
		alert(i18n.t('validation.factory.select.exactly'));
		$("#userInsert_factory").focus().trigger('click');
		return
	}

	const loginid = getCookie("userLoginId");

	const userInfo = {
		ks_id: id,
		ks_passwd: pass,
		ks_busor: busor,
		ks_factory: factory,
		ks_name: name,
		ks_indate: sdate.replaceAll("-", ""),
		ks_inuser: loginid,
		ks_busorText: busorText || ''
	}

	console.log(" INSERT USER INFO ")
	console.log(userInfo)

	$.ajax({
		url: "/check_wms_account",
		type: "POST",
		data: JSON.stringify(userInfo),
		contentType: "application/json",
		success: function(checkResult) {
			//console.log(checkResult)
			if (checkResult === 1) {
				alert(i18n.t('validation.duplicate.id'));
				return;
			} else {

				$.ajax({
					url: "/insert_user_account",
					type: "POST",
					data: JSON.stringify(userInfo),
					contentType: "application/json",
					success: function(iCount) {
						if (iCount > 1) {
							alert(i18n.t('success.user.registered.pendingPermission'));
						} else {
							alert(i18n.t('success.user.registered.withExistingPermission'));
						}
						$('#modal_userInsertForm').hide();
						$('#form_userInsertForm')[0].reset();
						let searchVal = getCurrentSearchCriteria();
						performUserInfoDBSearch(searchVal);
					},
					error: function(xhr, status, error) {
						// ❌ alert(res.message) <- res 없음 (버그)
						window.handleAjaxError(xhr, status, error);
					}

				});

			}

		},
		error: function(xhr, status, error) {
			// ❌ alert(res.message) <- res 없음 (버그)
			window.handleAjaxError(xhr, status, error);
		}

	});
});
