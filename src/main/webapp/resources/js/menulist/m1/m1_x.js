/*$(document).ready(function() {


	window.call_m1_1 = function(menuId) {

		//loadCSSForMenu("/m1/m1_1.css");

		showLoading("data");

		$.ajax({
			url: "/read_user",
			type: "POST",
			data: JSON.stringify(),
			contentType: "application/json",
			success: function(data) {
				console.log("-- 조회. 사용자 정보 --")
				console.log(data)


				globalUserData = data;
				filteredUserData = data;
				currentUserPage = 1;

				renderUserView();

				hideLoading();
			}
		});
	}
});

let globalUserData = []; // 전체 사용자 데이터 저장
let currentUserPage = 1; // 현재 페이지
let userItemsPerPage = 1000; // 페이지당 항목 수
let filteredUserData = []; // 검색 필터링된 데이터
// 사용자 뷰 렌더링 함수
function renderUserView() {
	let content_output = `
			<div class="divBlockControl" id="view_m1_1">
				<div class="content-body">
					<!-- 검색 영역 -->
					<div class="search-area">
						<div class="search-row">
							<div class="search_userCondition">${i18n.t('search.accessStatus')} <!-- 활성여부 --></div>
								<select id="searchVal_userCondition" >
									<option value="">${i18n.t('search.all')}<!-- 전체 --></option>
									<option value="N">${i18n.t('search.disabled')}<!-- 비활성화 --></option>
									<option value="Y">${i18n.t('search.enabled')}<!-- 활성화 --></option>
								</select>
							</div>
							<div class="search-label">
								<div class="search_buName">${i18n.t('search.bu_name')}<!-- BU_NAME --></div>
								<input type="text" id="searchVal_buName" />
							</div>
							<div class="search-label">
								<div class="search_ksName">${i18n.t('search.ks_name')}<!-- KS_NAME --></div>
								<input type="text" id="searchVal_ksName" />
							</div>
							<div class="search-label">
								<div class="search_id">${i18n.t('search.ks_id')}<!-- KS_ID --></div>
								<input type="text" id="searchVal_id" />
							</div>
							<div class="search-label">
								<div class="search_sabun">${i18n.t('search.ks_sabun')}<!-- KS_SABUN --></div>
								<input type="text" id="searchVal_sabun" />
							</div>
							<div class="search-label">
								<div class="search_inDate">${i18n.t('search.ks_indate')}<!-- KS_INDATE --></div>
								<input type="date" id="searchVal_inDate" />
							</div>
							<button class="btn btn-success btnUserSearch" style="width:6%">${i18n.t('btn.search')}<!-- 검색 --></button>
							<button class="btn btn-secondary btnUserSearchInit" style="width:6%">${i18n.t('btn.clear')}<!-- 초기화 --></button>
						</div>
						
					</div>
					
					<!-- 탭 -->
					<div class="tab-container">
						<div class="tab">목록</div>
					</div>
					
					<!-- 테이블 -->
					<div class="table-container" style="padding: 0px 29px">
						<div class="action-buttons">
							<button class="btn btn-success">신규 등록</button>
							<button class="btn btn-primary">수정</button>
							<button class="btn btn-secondary">삭제</button>
							<button class="btn btn-secondary">엑셀 다운로드</button>
						</div>
						
						<div class="table-info">
							<div class="userBtnArea">
								<div class="userArea_left">
									<span>${i18n.t('table.info.total')} <strong id="userTotalCount">${filteredUserData.length}</strong> ${i18n.t('table.info.records')} | 
									${i18n.t('table.page')} <strong id="userCurrentPageInfo">${currentUserPage}</strong>/<strong id="userTotalPageInfo">${Math.ceil(filteredUserData.length / userItemsPerPage)}</strong></span>
								</div>
								<div class="userArea_right">
									<div class="userEditArea">
										<input type="button" class="btn btn-success" id="userAccess" value="${i18n.t('btn.access.enable')}"> 
										<input type="button" class="btn btn-warning" id="userBlock" value="${i18n.t('btn.access.block')}"> 
									</div>
								</div>
							</div>
						</div>
						
						<table class="data-table m1_1">
							<thead>
								<tr>
									<th>
										<input type="checkbox" class="user_chkAll">
									</th>
									<th>${i18n.t('table.no')}</th>
									<th>${i18n.t('table.access')}</th>
									<th>BU_NAME</th>
									<th>KS_NAME</th>
									<th>KS_ID</th>
									<th>KS_SABUN</th>
									<th>KS_INDATE</th>
									<th>Menu Access</th>
								</tr>
							</thead>
							<tbody id="userTableBody">
							</tbody>
						</table>
						
						<!-- 페이지네이션 -->
						<div class="pagination" id="userPaginationContainer">
						</div>
					</div>
				</div>
			</div>
		`;

	//$(".w_contentArea").html(content_output);

	$(".w_contentArea").append(content_output); // 기존 내용 보존 + 새 뷰 추가


	// 테이블 데이터 렌더링
	renderUserTableData();

	// 페이지네이션 렌더링
	renderUserPagination();

	// 이벤트 바인딩
	bindUserEvents();

}

// 사용자 테이블 데이터 렌더링
function renderUserTableData() {
	let tableBody = "";
	let startIndex = (currentUserPage - 1) * userItemsPerPage;
	let endIndex = Math.min(startIndex + userItemsPerPage, filteredUserData.length);

	for (let i = startIndex; i < endIndex; i++) {
		let rowNumber = i + 1;
		// 날짜 형식 변환 (yyyymmdd -> yyyy-mm-dd)
		let formattedDate = formatDateFromYYYYMMDD(filteredUserData[i].ks_indate);

		tableBody += `
				<tr>
					<td><input type="checkbox" class="user_chkRow" data-sabun="${filteredUserData[i].ks_sabun}"></td>
					<td>${rowNumber}</td>
					<td>
						<span class="status-badge 
				       		${filteredUserData[i].ks_wmsloginyn === 'Y' ? 'status-complete' : 'status-waiting'}">
				    		${filteredUserData[i].ks_wmsloginyn === 'Y' ? i18n.t('table.enabled') : i18n.t('table.disabled')}
				  		</span>
				  	</td>
					<td>${filteredUserData[i].bu_name || ''}</td>
					<td>${filteredUserData[i].ks_name || ''}</td>
					<td>${filteredUserData[i].ks_id || ''}</td>
					<td>${filteredUserData[i].ks_sabun || ''}</td>
					<td>${formattedDate}</td>
				</tr>
			`;
	}

	$("#userTableBody").html(tableBody);

	// 정보 업데이트
	$("#userTotalCount").text(filteredUserData.length);
	$("#userCurrentPageInfo").text(currentUserPage);
	$("#userTotalPageInfo").text(Math.ceil(filteredUserData.length / userItemsPerPage));
}

// 사용자 페이지네이션 렌더링
function renderUserPagination() {
	let totalPages = Math.ceil(filteredUserData.length / userItemsPerPage);
	let paginationHtml = "";

	// 이전 버튼
	if (currentUserPage > 1) {
		paginationHtml += `<button class="user-page-btn" data-page="${currentUserPage - 1}">&lt;</button>`;
	} else {
		paginationHtml += `<button class="user-page-btn disabled">&lt;</button>`;
	}

	// 페이지 번호 버튼들
	let startPage = Math.max(1, currentUserPage - 5);
	let endPage = Math.min(totalPages, currentUserPage + 5);

	// 첫 페이지
	if (startPage > 1) {
		paginationHtml += `<button class="user-page-btn" data-page="1">1</button>`;
		if (startPage > 2) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
	}

	// 중간 페이지들
	for (let i = startPage; i <= endPage; i++) {
		if (i === currentUserPage) {
			paginationHtml += `<button class="user-page-btn active" data-page="${i}">${i}</button>`;
		} else {
			paginationHtml += `<button class="user-page-btn" data-page="${i}">${i}</button>`;
		}
	}

	// 마지막 페이지
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<span class="page-dots">...</span>`;
		}
		paginationHtml += `<button class="user-page-btn" data-page="${totalPages}">${totalPages}</button>`;
	}

	// 다음 버튼
	if (currentUserPage < totalPages) {
		paginationHtml += `<button class="user-page-btn" data-page="${currentUserPage + 1}">&gt;</button>`;
	} else {
		paginationHtml += `<button class="user-page-btn disabled">&gt;</button>`;
	}

	$("#userPaginationContainer").html(paginationHtml);
}

// 사용자 이벤트 바인딩
function bindUserEvents() {
	// 검색 버튼 클릭
	$(".btnUserSearch").off('click').on('click', function() {
		performUserSearch();
	});

	// 초기화 버튼 클릭
	$(".btnUserSearchInit").off('click').on('click', function() {
		resetUserSearch();
	});

	// 페이지네이션 버튼 클릭
	$(document).off('click', '.user-page-btn').on('click', '.user-page-btn', function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			let page = parseInt($(this).data('page'));
			if (page && page > 0) {
				currentUserPage = page;
				renderUserTableData();
				renderUserPagination();
			}
		}
	});

	// 엔터키 검색
	$('#view_m1_1 input[type="text"], #view_m1_1 input[type="date"]').off('keypress').on('keypress', function(e) {
		if (e.which === 13) {
			performUserSearch();
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
function performUserSearch() {
	let searchCriteria = {
		userCond: $("#searchVal_userCondition").val(),
		buName: $("#searchVal_buName").val().toLowerCase(),
		ksName: $("#searchVal_ksName").val().toLowerCase(),
		id: $("#searchVal_id").val().toLowerCase(),
		sabun: $("#searchVal_sabun").val().toLowerCase(),
		inDate: $("#searchVal_inDate").val() // yyyy-mm-dd 형식
	};

	filteredUserData = globalUserData.filter(item => {
		let dateMatch = true;

		// 날짜 검색 처리 (yyyymmdd 형식 DB 데이터와 yyyy-mm-dd 형식 검색값 비교)
		if (searchCriteria.inDate && item.ks_indate) {
			// 검색값을 yyyymmdd 형식으로 변환
			let searchDateFormatted = formatDateToYYYYMMDD(searchCriteria.inDate);
			// DB 값과 직접 비교
			dateMatch = item.ks_indate.toString() === searchDateFormatted;
		} else if (searchCriteria.inDate && !item.ks_indate) {
			dateMatch = false;
		}

		return (
			// 검색 필드 추가되면 구현
			(!searchCriteria.userCond || item.ks_wmsloginyn === searchCriteria.userCond) &&  // 정확한 매칭
			(!searchCriteria.buName || (item.bu_name && item.bu_name.toLowerCase().includes(searchCriteria.buName))) &&
			(!searchCriteria.ksName || (item.ks_name && item.ks_name.toLowerCase().includes(searchCriteria.ksName))) &&
			(!searchCriteria.id || (item.ks_id && item.ks_id.toLowerCase().includes(searchCriteria.id))) &&
			(!searchCriteria.sabun || (item.ks_sabun && item.ks_sabun.toLowerCase().includes(searchCriteria.sabun))) &&
			dateMatch
		);
	});

	currentUserPage = 1;
	renderUserTableData();
	renderUserPagination();

	console.log(`검색 결과: ${filteredUserData.length}건`);
	console.log(`검색 조건 - 날짜: ${searchCriteria.inDate} (${formatDateToYYYYMMDD(searchCriteria.inDate)})`);
}

// 사용자 검색 초기화
function resetUserSearch() {
	$("#searchVal_userCondition").val('');
	$("#searchVal_buName").val('');
	$("#searchVal_ksName").val('');
	$("#searchVal_id").val('');
	$("#searchVal_sabun").val('');
	$("#searchVal_inDate").val('');

	filteredUserData = globalUserData;
	currentUserPage = 1;
	renderUserTableData();
	renderUserPagination();

	console.log('검색 조건이 초기화되었습니다.');
}

// 사용자 페이지당 항목 수 변경 (필요시 사용)
window.changeUserItemsPerPage = function(newItemsPerPage) {
	userItemsPerPage = newItemsPerPage;
	currentUserPage = 1;
	renderUserTableData();
	renderUserPagination();
}

// 전체 사용자 데이터 export (필요시 사용)
window.exportUserData = function() {
	return {
		total: globalUserData.length,
		filtered: filteredUserData.length,
		currentPage: currentUserPage,
		itemsPerPage: userItemsPerPage,
		data: filteredUserData
	};
}



$(document).on("click", "#userAccess", function() {
	if (confirm("Enable selected accounts ?")) {

		const sList = [];
		//user_chkRow 반복문 활성여부 체크
		$(".user_chkRow:checked").each(function() {
			let sabun = $(this).data('sabun');
			let sabunList = {
				sabun: sabun
			}
			sList.push(sabunList);
		})

		$.ajax({
			url: "/userAccess",
			type: "POST",
			data: JSON.stringify(sList),
			contentType: "application/json",
			success: function(res) {
				alert(res.message);
				if (res.success) {
					showLoading("data");

					$(".w_contentArea").empty();

					$.ajax({
						url: "/read_user",
						type: "POST",
						data: JSON.stringify(),
						contentType: "application/json",
						success: function(data) {
							console.log("-- 조회. 사용자 정보 --")
							console.log(data)


							globalUserData = data;
							filteredUserData = data;
							currentUserPage = 1;

							renderUserView();
						}
					});
				}
				setTimeout(function() {
					hideLoading();
				}, 3000);
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

});



$(document).on("click", "#userBlock", function() {
	if (confirm("Block Access selected accounts ?")) {

		const sList = [];
		//user_chkRow 반복문 활성여부 체크
		$(".user_chkRow:checked").each(function() {
			let sabun = $(this).data('sabun');
			let sabunList = {
				sabun: sabun
			}
			sList.push(sabunList);
		})

		$.ajax({
			url: "/userBlock",
			type: "POST",
			data: JSON.stringify(sList),
			contentType: "application/json",
			success: function(res) {
				alert(res.message);
				if (res.success) {
					showLoading("data");

					$(".w_contentArea").empty();

					$.ajax({
						url: "/read_user",
						type: "POST",
						data: JSON.stringify(),
						contentType: "application/json",
						success: function(data) {
							console.log("-- 조회. 사용자 정보 --")
							console.log(data)


							globalUserData = data;
							filteredUserData = data;
							currentUserPage = 1;

							renderUserView();
						}
					});
				}
				setTimeout(function() {
					hideLoading();
				}, 3000);
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
});*/



