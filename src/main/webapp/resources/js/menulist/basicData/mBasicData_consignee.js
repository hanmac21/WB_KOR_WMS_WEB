let globalConsigneeData = [];     // 현재 조회된 데이터 저장
let currentConsigneePage = 1;     // 유지(서버가 page를 요구할 수 있어 남김)
let consigneeItemsPerPage = 1000; // 유지

//선택된 행(수정/삭제에 사용)
let selectedConsigneeRow = null;
let selectedConsigneeRowKey = null; // PK가 있다면(예: id / CONSIGNEE_ID 등) 여기에 저장

$(document).ready(function () {
	window.call_mBasicData_consignee = function (menuId) {
		showLoading("data");

		if (!$("#view_mBasicData_consignee").length) {
			renderConsigneeView();
		}

		clearConsigneeForm();
		clearConsigneeSelection();

		performConsigneeDBSearch(getCurrentSearchCriteria());
	};
});


/* =========================
 * 조회
 * ========================= */
function performConsigneeDBSearch(searchCriteria) {
	showLoading("data");

	$.ajax({
		url: "/read_consignee",
		type: "POST",
		data: JSON.stringify({
			searchParams: searchCriteria,
			page: currentConsigneePage,
			itemsPerPage: consigneeItemsPerPage
		}),
		contentType: "application/json",
		success: function (data) {
			globalConsigneeData = data.records || data || [];
			renderConsigneeTableData();
			hideLoading();
		},
		error: function (xhr, status, error) {
			console.error("DB 조회 실패:", error);
			hideLoading();
			alert("데이터 조회에 실패했습니다. 다시 시도해주세요.");
		}
	});
}

// 사용자 뷰 렌더링 함수
function renderConsigneeView() {
	let content_output = `
		<div class="divBlockControl" id="view_mBasicData_consignee">
			<div class="content-body">
				<!-- 검색 영역 -->
				<div class="search-area">
					<div class="search-row">
						<div class="search-header">
							<div class="search-label">
								<div class="label-title">Consignee<!-- consignee --></div>
								<input type="text" id="consignee" />								
							</div>
							<div class="search-btns">								
								<input type="button" value="${i18n.t('btn.search')}" class="btn btn-primary btnConsigneeSearch"/>
								<input type="button" value="${i18n.t('btn.create')}" class="btn btn-success btnConsigneeCreate"/>
								<input type="button" value="${i18n.t('btn.edit')}" class="btn btn-warning btnConsigneeUpdate"/>
								<input type="button" value="${i18n.t('btn.delete')}" class="btn btn-danger btnConsigneeDelete"/>
								<input type="button" value="${i18n.t('btn.clear')}" class="btn btn-secondary btnConsigneeClear"/>
							</div>
						</div>
						<div class="search-body">								
							<div class="search-label">
								<div class="label-title">cinfo1<!-- cinfo1 --></div>
								<input type="text" id="cinfo1" />
							</div>
							<div class="search-label">
								<div class="label-title">cinfo2<!-- cinfo2 --></div>
								<input type="text" id="cinfo2" />
							</div>
							<div class="search-label">
								<div class="label-title">cinfo3<!-- cinfo3 --></div>
								<input type="text" id="cinfo3" />
							</div>
							<div class="search-label">
								<div class="label-title">cinfo4<!-- cinfo4 --></div>
								<input type="text" id="cinfo4" />
							</div>
							<div class="search-label">
								<div class="label-title">cinfo5<!-- cinfo5 --></div>
								<input type="text" id="cinfo5" />
							</div>
							<div class="search-label">
								<div class="label-title">dinfo1<!-- dinfo1 --></div>
								<input type="text" id="dinfo1" />
							</div>
							<div class="search-label">
								<div class="label-title">dinfo2<!-- dinfo2 --></div>
								<input type="text" id="dinfo2" />
							</div>
							<div class="search-label">
								<div class="label-title">dinfo3<!-- dinfo3 --></div>
								<input type="text" id="dinfo3" />
							</div>
							<div class="search-label">
								<div class="label-title">dinfo4<!-- dinfo4 --></div>
								<input type="text" id="dinfo4" />
							</div>
							<div class="search-label">
								<div class="label-title">dinfo5<!-- dinfo5 --></div>
								<input type="text" id="dinfo5" />
							</div>
						</div>
					</div>
				</div>
				
				<!-- 테이블 -->
				<div class="table-container">
					<table class="data-table mBasicData_consignee">
						<thead>
							<tr>
								<th class="noVal">No.</th>
								<th class="consigneeVal">Consignee</th>
								<th class="consigneeVal">cinfo1</th>
								<th class="consigneeVal">cinfo2</th>
								<th class="consigneeVal">cinfo3</th>
								<th class="consigneeVal">cinfo4</th>
								<th class="consigneeVal">cinfo5</th>
								<th class="consigneeVal">dinfo1</th>
								<th class="consigneeVal">dinfo2</th>
								<th class="consigneeVal">dinfo3</th>
								<th class="consigneeVal">dinfo4</th>
								<th class="consigneeVal">dinfo5</th>
							</tr>
						</thead>
						<tbody id="consigneeTableBody">
						</tbody>
					</table>
					
					<!-- 페이지네이션 -->
					<div class="pagination" id="consigneePaginationContainer">
					</div>
				</div>
			</div>
		</div>
	`;
	$(".w_contentArea").append(content_output);

	bindConsigneeEvents();
}

function renderConsigneeTableData() {
	let tableBody = "";

	for (let i = 0; i < globalConsigneeData.length; i++) {
		let data = globalConsigneeData[i] || {};
		console.log(data);
		let rowKey = data.IID || ""; 

		tableBody += `
			<tr data-index="${i}" data-rowkey="${rowKey}">
				<td>${i+1}</td>
				<td class="consigneeVal">${data.CONSIGNEE || ""}</td>
				<td class="consigneeVal">${data.CINFO1 || ""}</td>
				<td class="consigneeVal">${data.CINFO2 || ""}</td>
				<td class="consigneeVal">${data.CINFO3 || ""}</td>
				<td class="consigneeVal">${data.CINFO4 || ""}</td>
				<td class="consigneeVal">${data.CINFO5 || ""}</td>
				<td class="consigneeVal">${data.DINFO1 || ""}</td>
				<td class="consigneeVal">${data.DINFO2 || ""}</td>
				<td class="consigneeVal">${data.DINFO3 || ""}</td>
				<td class="consigneeVal">${data.DINFO4 || ""}</td>
				<td class="consigneeVal">${data.DINFO5 || ""}</td>
			</tr>
		`;
	}

	$("#consigneeTableBody").html(tableBody);
}

function bindConsigneeEvents() {
	// Search
	$(document).off("click", ".btnConsigneeSearch").on("click", ".btnConsigneeSearch", function () {
		currentConsigneePage = 1;
		clearConsigneeSelection();
		performConsigneeDBSearch(getCurrentSearchCriteria());
	});

	// Enter 검색
	$(document).off("keypress", "#view_mBasicData_consignee input[type='text']").on("keypress", "#view_mBasicData_consignee input[type='text']", function (e) {
		if (e.which === 13) {
			currentConsigneePage = 1;
			clearConsigneeSelection();
			performConsigneeDBSearch(getCurrentSearchCriteria());
		}
	});

	// ✅ TR 클릭 → 상단 입력 자동 세팅 + 선택 강조
	$(document).off("click", "#consigneeTableBody tr").on("click", "#consigneeTableBody tr", function () {
		$("#consigneeTableBody tr").removeClass("selected");
		$(this).addClass("selected");

		let idx = parseInt($(this).data("index"), 10);
		if (isNaN(idx) || !globalConsigneeData[idx]) return;

		selectedConsigneeRow = globalConsigneeData[idx];
		selectedConsigneeRowKey = $(this).data("rowkey") || null;

		setConsigneeForm(selectedConsigneeRow);
	});

	// ✅ 등록
	$(document).off("click", ".btnConsigneeCreate").on("click", ".btnConsigneeCreate", function () {
		const payload = getConsigneeFormPayload();

		const consigneeVal = payload.CONSIGNEE ?? payload.consignee;
		// 필수값 검증 (원하시면 규칙 추가)
		if (!consigneeVal) {
			alert("CONSIGNEE is required");
			$("#consignee").focus();
			return;
		}

		// ✅ 중복 등록 방지 (같은 CONSIGNEE가 이미 있으면 등록 막기)
		if (isDuplicateConsignee(consigneeVal)) {
			alert("이미 등록된 CONSIGNEE 입니다.");
			$("#consignee").focus();
			return;
		}

		if (!confirm("등록하시겠습니까?")) return;
		createConsignee(payload);
	});

	// ✅ 수정
	$(document).off("click", ".btnConsigneeUpdate").on("click", ".btnConsigneeUpdate", function () {
		if (!selectedConsigneeRow) {
			alert("수정할 항목을 테이블에서 먼저 선택해주세요.");
			return;
		}

		const payload = getConsigneeFormPayload();
		
		if (selectedConsigneeRowKey) {
			payload.id = selectedConsigneeRowKey;
		}

		if (!confirm("수정하시겠습니까?")) return;
		updateConsignee(payload);
	});

	// ✅ 삭제
	$(document).off("click", ".btnConsigneeDelete").on("click", ".btnConsigneeDelete", function () {
		if (!selectedConsigneeRow) {
			alert("삭제할 항목을 테이블에서 먼저 선택해주세요.");
			return;
		}

		const payload = {};

		// PK 기반 삭제 권장
		if (selectedConsigneeRowKey) {
			payload.id = selectedConsigneeRowKey;
		} else {
			// PK가 없다면 최소한의 식별값으로(비추)
			payload.consignee = $("#consignee").val() || "";
		}

		if (!confirm("삭제하시겠습니까?")) return;
		deleteConsignee(payload);
	});

	// ✅ 초기화
	$(document).off("click", ".btnConsigneeClear").on("click", ".btnConsigneeClear", function () {
		clearConsigneeForm();
		clearConsigneeSelection();
	});
}

/* =========================
 * 입력값 → payload
 * ========================= */
function getConsigneeFormPayload() {
	return {
		consignee: $("#consignee").val() || "",
		cinfo1: $("#cinfo1").val() || "",
		cinfo2: $("#cinfo2").val() || "",
		cinfo3: $("#cinfo3").val() || "",
		cinfo4: $("#cinfo4").val() || "",
		cinfo5: $("#cinfo5").val() || "",
		dinfo1: $("#dinfo1").val() || "",
		dinfo2: $("#dinfo2").val() || "",
		dinfo3: $("#dinfo3").val() || "",
		dinfo4: $("#dinfo4").val() || "",
		dinfo5: $("#dinfo5").val() || ""
	};
}

/* =========================
 * 검색조건
 * - 지금은 입력값 그대로 검색조건으로 사용
 * - 필요하면 일부만 검색조건으로 쓰도록 바꾸시면 됩니다.
 * ========================= */
function getCurrentSearchCriteria() {
	return getConsigneeFormPayload();
}

/* =========================
 * 폼 세팅/초기화
 * ========================= */
function setConsigneeForm(data) {
	data = data || {};
	$("#consignee").val(data.CONSIGNEE || "");
	$("#cinfo1").val(data.CINFO1 || "");
	$("#cinfo2").val(data.CINFO2 || "");
	$("#cinfo3").val(data.CINFO3 || "");
	$("#cinfo4").val(data.CINFO4 || "");
	$("#cinfo5").val(data.CINFO5 || "");
	$("#dinfo1").val(data.DINFO1 || "");
	$("#dinfo2").val(data.DINFO2 || "");
	$("#dinfo3").val(data.DINFO3 || "");
	$("#dinfo4").val(data.DINFO4 || "");
	$("#dinfo5").val(data.DINFO5 || "");
}

function clearConsigneeForm() {
	setConsigneeForm({});
}

function clearConsigneeSelection() {
	selectedConsigneeRow = null;
	selectedConsigneeRowKey = null;
	$("#consigneeTableBody tr").removeClass("selected");
}

// 중복 체크 함수
function isDuplicateConsignee(consigneeValue, excludeIid) {
	const target = String(consigneeValue || "").trim().toUpperCase();
	if (!target) return false;

	for (let i = 0; i < (globalConsigneeData || []).length; i++) {
		const row = globalConsigneeData[i] || {};
		const rowConsignee = String(row.CONSIGNEE ?? row.consignee ?? "").trim().toUpperCase();
		const rowIid = row.IID ?? row.iid ?? null;

		if (excludeIid && String(rowIid) === String(excludeIid)) continue; // (수정 시 본인 제외용)
		if (rowConsignee && rowConsignee === target) return true;
	}
	return false;
}



/* =========================
 * 등록
 * ========================= */
function createConsignee(payload) {
	showLoading("data");

	$.ajax({
		url: "/create_consignee",
		type: "POST",
		data: JSON.stringify(payload),
		contentType: "application/json",
		success: function (res) {
			// ✅ 백단 응답 규격에 맞춰서 수정하세요
			// 예: res.success === true
			hideLoading();

			// 등록 후 재조회
			clearConsigneeForm();
			clearConsigneeSelection();
			performConsigneeDBSearch(getCurrentSearchCriteria());
		},
		error: function (xhr, status, error) {
			console.error("등록 실패:", error, xhr.responseText);
			hideLoading();
			alert("등록에 실패했습니다.");
		}
	});
}

/* =========================
 * 수정
 * ========================= */
function updateConsignee(payload) {
	showLoading("data");

	$.ajax({
		url: "/update_consignee",
		type: "POST",
		data: JSON.stringify(payload),
		contentType: "application/json",
		success: function (res) {
			hideLoading();

			clearConsigneeForm();
			clearConsigneeSelection();
			performConsigneeDBSearch(getCurrentSearchCriteria());
		},
		error: function (xhr, status, error) {
			console.error("수정 실패:", error, xhr.responseText);
			hideLoading();
			alert("수정에 실패했습니다.");
		}
	});
}

/* =========================
 * 삭제
 * ========================= */
function deleteConsignee(payload) {
	showLoading("data");

	$.ajax({
		url: "/delete_consignee",
		type: "POST",
		data: JSON.stringify(payload),
		contentType: "application/json",
		success: function (res) {
			hideLoading();

			clearConsigneeForm();
			clearConsigneeSelection();
			performConsigneeDBSearch(getCurrentSearchCriteria());
		},
		error: function (xhr, status, error) {
			console.error("삭제 실패:", error, xhr.responseText);
			hideLoading();
			alert("삭제에 실패했습니다.");
		}
	});
}

