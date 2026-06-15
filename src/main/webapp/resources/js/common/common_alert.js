// ===============================
// ✅ Language helpers
// ===============================
window.getLang = function() {
	const m = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
	let lang = m ? decodeURIComponent(m[1]) : "";
	if (!lang) lang = (localStorage.getItem("lang") || "ko");

	lang = String(lang).toLowerCase();
	if (lang.startsWith("ko")) return "ko";
	if (lang.startsWith("es")) return "es";
	return "en";
};

window.getNoDmlMessage = function() {
	const dict = {
		ko: "데이터 수정 권한이 없습니다.",
		en: "You do not have permission to edit data.",
		es: "No tiene permiso para editar los datos."
	};
	return dict[window.getLang()] || dict.ko;
};

// ===============================
// ✅ Permission modal
// ===============================
window.showNoEditPermissionAlert = function(message) {
	if ($("#noEditPermissionModal").length) $("#noEditPermissionModal").remove();

	const lang = window.getLang();
	const subDict = {
		ko: "권한이 필요한 경우 관리자에게 문의해 주세요.",
		en: "Please contact your administrator if you need access.",
		es: "Si necesita acceso, contacte a su administrador."
	};
	const okDict = { ko: "확인", en: "OK", es: "OK" };
	const titleDict = { ko: "권한", en: "Permission", es: "Permiso" };

	const msg = message || window.getNoDmlMessage();
	const sub = subDict[lang] || subDict.ko;
	const ok = okDict[lang] || okDict.ko;
	const title = titleDict[lang] || titleDict.ko;

	const modalHtml = `
	<div id="noEditPermissionModal"
		style="position:fixed; inset:0; background:rgba(15,23,42,0.45);
		display:flex; align-items:center; justify-content:center; z-index:9999;">
	  <div style="background:#fff; width:360px; max-width:92%;
		border-radius:12px; box-shadow:0 18px 45px rgba(15,23,42,0.35);
		overflow:hidden; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

		<div style="background:linear-gradient(135deg,#ef4444,#dc2626); color:#f9fafb;
			padding:12px 16px; display:flex; align-items:center; justify-content:space-between;">
		  <div style="display:flex; align-items:center; gap:8px;">
			<span style="display:inline-flex; width:22px; height:22px; border-radius:999px;
				background:rgba(15,23,42,0.25); align-items:center; justify-content:center; font-size:14px;">!</span>
			<span style="font-size:15px; font-weight:600;">${title}</span>
		  </div>
		  <button id="noEditCloseTop" style="border:none; background:transparent; color:#e5e7eb;
			font-size:16px; cursor:pointer; padding:0 4px;" aria-label="Close">✕</button>
		</div>

		<div style="padding:16px; font-size:14px; color:#111827; line-height:1.5;">
		  <div style="margin-bottom:6px; font-weight:700;">${msg}</div>
		  <div style="font-size:12px; color:#6b7280;">${sub}</div>
		</div>

		<div style="padding:12px 16px; display:flex; justify-content:flex-end; background:#f9fafb;
			border-top:1px solid #e5e7eb;">
		  <button id="noEditCloseBottom" style="padding:7px 14px; font-size:12px; border-radius:999px;
			border:none; background:#ef4444; color:#f9fafb; cursor:pointer; font-weight:600;">${ok}</button>
		</div>
	  </div>
	</div>`;

	$("body").append(modalHtml);
	$("#noEditCloseTop, #noEditCloseBottom").on("click", function() {
		$("#noEditPermissionModal").remove();
	});
};

// ===============================
// ✅ 전역 더블클릭 방지
// ===============================
$(document).on('click', 'input[type="button"], button', function() {
	const $btn = $(this);
	if ($btn.data('dc-lock')) return false;
	$btn.data('dc-lock', true);
	setTimeout(() => $btn.removeData('dc-lock'), 500);
});

window.handleAjaxError = function(xhr, status, error) {
	if (typeof hideLoading === "function") hideLoading();

	if (xhr && xhr.status === 403) {
		const msg = (typeof window.getNoDmlMessage === "function")
			? window.getNoDmlMessage()
			: "데이터 수정 권한이 없습니다.";

		if (typeof window.showNoEditPermissionAlert === "function") {
			window.showNoEditPermissionAlert(msg);
		} else {
			alert(msg);
		}
		return;
	}

	const details =
		(xhr && xhr.responseText && String(xhr.responseText).trim())
			? xhr.responseText
			: (error || status || "Unknown error");

	const message =
		"An error occurred while processing the request.\n\n" +
		"HTTP: " + (xhr ? xhr.status : "N/A") + "\n" +
		"Details:\n" + details;

	if (typeof window.showCopyableAlert === "function") {
		window.showCopyableAlert(message);
	} else {
		alert(message);
	}
};

