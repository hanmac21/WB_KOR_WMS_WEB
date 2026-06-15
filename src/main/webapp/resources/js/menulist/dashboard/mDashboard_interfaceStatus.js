/* --------------------------------------------------------------
 * 📌 Interface Status Dashboard
 * -------------------------------------------------------------- */

$(document).ready(function () {

	let globalInterfaceStatusData = [];

	// ============================================================
	// 호출
	// ============================================================
	window.call_mDashboard_interfaceStatus = function (menuId) {

		$("#view_mDashboard_interfaceStatus").remove();

		createInterfaceStatusLayout();
		setDefaultDateRange();
		bindInterfaceStatusEvents();
		readInterfaceStatusDashboard();
	};

	// ============================================================
	// 날짜
	// ============================================================
	function getTodayYMD() {
		const d = new Date();
		return d.getFullYear() + "-" +
			String(d.getMonth()+1).padStart(2,"0") + "-" +
			String(d.getDate()).padStart(2,"0");
	}

	function getFirstDayOfMonth(){
		const d = new Date();
		return d.getFullYear() + "-" +
			String(d.getMonth()+1).padStart(2,"0") + "-01";
	}

	function setDefaultDateRange(){

		$("#ifStatus_sdate").val(getFirstDayOfMonth());
		$("#ifStatus_edate").val(getTodayYMD());

	}

	// ============================================================
	// AJAX
	// ============================================================
	function readInterfaceStatusDashboard(){

		const sdate = ($("#ifStatus_sdate").val() || "").replaceAll("-","");
		const edate = ($("#ifStatus_edate").val() || "").replaceAll("-","");

		showLoading("data");

		$.ajax({

			url: "/read_dashboard_interfaceStatus",
			type: "POST",
			dataType: "json",
			contentType: "application/json",

			data: JSON.stringify({
				sdate: sdate,
				edate: edate
			}),

			success: function(response){

				hideLoading("data");

				if(response && response.success){

					globalInterfaceStatusData = response.data || [];

					renderInterfaceStatusDashboard(globalInterfaceStatusData);

				}else{

					renderInterfaceStatusDashboard([]);

				}

			},

			error:function(){

				hideLoading("data");
				renderInterfaceStatusDashboard([]);

			}

		});

	}

	// ============================================================
	// Layout
	// ============================================================
	function createInterfaceStatusLayout(){

		const html = `

		<div class="divBlockControl" id="view_mDashboard_interfaceStatus">

			<div class="content-body ifStatus-dashboard">

				<div class="ifStatus-wrap">

					<div class="ifStatus-searchBar">

						<div class="ifStatus-searchItem">
							<label class="ifStatus-searchLabel">FROM</label>
							<input type="date" id="ifStatus_sdate" class="ifStatus-searchInput"/>
						</div>

						<div class="ifStatus-searchItem">
							<label class="ifStatus-searchLabel">TO</label>
							<input type="date" id="ifStatus_edate" class="ifStatus-searchInput"/>
						</div>

						<div class="ifStatus-searchBtnWrap">
							<button type="button" id="ifStatus_btnSearch" class="ifStatus-btnSearch">조회</button>
						</div>

					</div>

					<div class="ifStatus-gridSection">
						<div class="ifStatus-grid" id="ifStatus_cardContainer"></div>
					</div>

				</div>

			</div>

		</div>

		`;

		$(".w_contentArea").append(html);

	}

	// ============================================================
	// 이벤트
	// ============================================================
	function bindInterfaceStatusEvents(){

		$("#ifStatus_btnSearch").off("click").on("click",function(){

			readInterfaceStatusDashboard();

		});

	}

	// ============================================================
	// 전체 render
	// ============================================================
	function renderInterfaceStatusDashboard(data){

		const grouped = {};

		data.forEach(function(row){

			const name = row.NAME;

			if(!grouped[name]){

				grouped[name] = {
					NAME:name,
					WMS_QTY:0,
					WMS_CNT:0,
					ERP_QTY:0,
					ERP_CNT:0
				};

			}

			if(row.KIND === "WMS"){

				grouped[name].WMS_QTY = nvlNumber(row.QTY);
				grouped[name].WMS_CNT = nvlNumber(row.CNT);

			}else{

				grouped[name].ERP_QTY = nvlNumber(row.QTY);
				grouped[name].ERP_CNT = nvlNumber(row.CNT);

			}

		});

		renderInterfaceStatusCards(Object.values(grouped));

	}

	// ============================================================
	// 카드
	// ============================================================
	function renderInterfaceStatusCards(data){

		const $container = $("#ifStatus_cardContainer");

		$container.empty();

		if(!data || data.length===0){

			$container.append(`
				<div class="ifStatus-emptyBox">
					<div class="ifStatus-emptyTitle">No Data</div>
				</div>
			`);

			return;
		}

		let html="";

		data.forEach(function(item){

			const diffQty = Math.abs(item.WMS_QTY - item.ERP_QTY);
			const diffCnt = Math.abs(item.WMS_CNT - item.ERP_CNT);

			const isMatch = diffQty===0 && diffCnt===0;

			html += `

			<div class="ifStatus-card ${isMatch?"ifStatus-card-match":"ifStatus-card-warning"}">

				<div class="ifStatus-cardTop">

					<div class="ifStatus-cardTitle">${escapeHtml(item.NAME)}</div>

					<div class="ifStatus-cardBadge ${isMatch?"ifStatus-badge-match":"ifStatus-badge-warning"}">
						${isMatch?"MATCH":"CHECK"}
					</div>

				</div>

				<div class="ifStatus-cardMid">
					<div class="ifStatus-systemHeader">WMS</div>
					<div class="ifStatus-systemHeader">ERP</div>
				</div>

				<div class="ifStatus-cardBottom">

					<div class="ifStatus-systemBox">

						<div class="ifStatus-metricRow">
							<div class="ifStatus-metricLabel">QTY</div>
							<div class="ifStatus-metricValue">${formatNumber(item.WMS_QTY)}</div>
						</div>

						<div class="ifStatus-metricRow">
							<div class="ifStatus-metricLabel">COUNT</div>
							<div class="ifStatus-metricValue">${formatNumber(item.WMS_CNT)}</div>
						</div>

					</div>

					<div class="ifStatus-systemBox">

						<div class="ifStatus-metricRow">
							<div class="ifStatus-metricLabel">QTY</div>
							<div class="ifStatus-metricValue">${formatNumber(item.ERP_QTY)}</div>
						</div>

						<div class="ifStatus-metricRow">
							<div class="ifStatus-metricLabel">COUNT</div>
							<div class="ifStatus-metricValue">${formatNumber(item.ERP_CNT)}</div>
						</div>

					</div>

				</div>

				<div class="ifStatus-cardFooter">

					<div class="ifStatus-diffItem">
						<span class="ifStatus-diffLabel">QTY GAP</span>
						<span class="ifStatus-diffValue">${formatNumber(diffQty)}</span>
					</div>

					<div class="ifStatus-diffItem">
						<span class="ifStatus-diffLabel">COUNT GAP</span>
						<span class="ifStatus-diffValue">${formatNumber(diffCnt)}</span>
					</div>

				</div>

			</div>

			`;

		});

		$container.append(html);

	}

	// ============================================================
	// util
	// ============================================================
	function nvlNumber(v){

		const num = parseFloat(v);

		return isNaN(num)?0:num;

	}

	function formatNumber(v){

		return nvlNumber(v).toLocaleString("en-US");

	}

	function escapeHtml(str){

		if(str==null) return "";

		return String(str)
			.replace(/&/g,"&amp;")
			.replace(/</g,"&lt;")
			.replace(/>/g,"&gt;")
			.replace(/"/g,"&quot;")
			.replace(/'/g,"&#39;");

	}

});