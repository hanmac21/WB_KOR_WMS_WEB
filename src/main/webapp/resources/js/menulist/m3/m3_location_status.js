///* --------------------------------------------------------------
// * 📌 구매 - 적재 - LOCATION 현황 (DB 연동 버전)
// * 비고: 수정된 완전 버전 - RACK W 스타일 적용 + 아코디언 기능 + DB 연동
// * -------------------------------------------------------------- */
//
//const { post } = require("jquery");
//
//$(document).ready(function() {
//
//	// 🔧 **핵심 수정**: 모든 함수를 전역(window)에 등록
//	window.testClick = function() {
//		alert('테스트 버튼 클릭됨! 기본 클릭은 작동합니다.');
//		console.log('🧪 테스트 클릭 성공');
//	}
//
//	// 🆕 **DB 연동 1**: RACK 목록 데이터를 DB에서 불러오는 함수
//	window.loadRackListData = function() {
//		return new Promise((resolve, reject) => {
//			$.ajax({
//				url: '/rack/list', // 실제 API 엔드포인트로 수정 필요
//				type: 'POST',
//				dataType: 'json',
//				data: {
//					// 필터 조건들
//					storage: $('#rack-filter-storageVal').val() || 'default',
//					factory: $('#rack-filter-factoryVal').val() || 'default',
//					searchType: $('#rack-filter-searchVal').val() || 'default',
//					keyword: $('#searchVal-keyword').val() || ''
//				},
//				success: function(response) {
//					console.log('✅ RACK 목록 데이터 로드 성공:', response);
//					resolve(response.data || response);
//				},
//				error: function(xhr, status, error) {
//					console.error('❌ RACK 목록 데이터 로드 실패:', error);
//					reject(error);
//				}
//			});
//		});
//	}
//
//	// 🆕 **DB 연동 2**: 특정 RACK의 상세 적재 정보를 DB에서 불러오는 함수
//	window.loadRackDetailData = function(rackId) {
//
//		showLoading("data")
//
//		return new Promise((resolve, reject) => {
//			$.ajax({
//				url: '/rack/detail', // 실제 API 엔드포인트로 수정 필요
//				type: 'POST',
//				dataType: 'json',
//				data: {
//					rackId: rackId,
//					// 추가 필터 조건이 있다면 포함
//					storage: $('#rack-filter-storageVal').val() || 'default',
//					factory: $('#rack-filter-factoryVal').val() || 'default'
//				},
//				success: function(response) {
//					console.log('✅ RACK 상세 데이터 로드 성공:', response);
//					resolve(response.data || response);
//				},
//				error: function(xhr, status, error) {
//					console.error('❌ RACK 상세 데이터 로드 실패:', error);
//					reject(error);
//				}
//			});
//		});
//	}
//
//	window.selectRack = function(rackId) {
//		console.log('🎯 RACK 선택됨:', rackId);
//
//		// Active 클래스 토글
//		$('.rack-item').removeClass('active');
//		$(`[data-rack="${rackId}"]`).addClass('active');
//
//		// 헤더 업데이트
//		$('#current-rack-title').text(`RACK ${rackId}`);
//
//		// 🆕 **DB 연동 3**: AJAX로 실제 RACK 정보 불러오기
//		loadRackDetailData(rackId).then(function(rackData) {
//			console.log("DEB 1 - rackData")
//			console.log(rackData)
//			// DB에서 받은 데이터로 헤더 정보 업데이트
//			const utilizationRate = rackData.utilizationRate || 0;
//			const currentCount = rackData.currentCount || 0;
//			const totalCapacity = rackData.totalCapacity || 0;
//
//			$('#current-rack-info').text(`${utilizationRate}% ${currentCount} / ${totalCapacity}`);
//
//			// 구조도 생성 (DB 데이터 전달)
//			generateStructure(rackId, rackData);
//		}).catch(function(error) {
//			console.error('RACK 데이터 로드 실패:', error);
//			// 에러 시 기본 메시지 표시
//			$('#current-rack-info').text('데이터 로드 실패');
//		});
//	}
//
//	// 🔥 **라인 58-62 함수 시그니처 변경**: DB 데이터를 받도록 수정
//	window.generateStructure = function(rackId, rackData) {
//		let html = `
//            <div class="rack-main">
//                <!-- 좌측 레벨 표시 -->
//                <div class="level-sidebar" style="display:none;">
//                    <div class="level-item level-d">Level D</div>
//                    <div class="level-item level-c">Level C</div>
//                    <div class="level-item level-b">Level B</div>
//                    <div class="level-item level-a">Level A</div>
//                </div>
//                
//                <!-- 모듈들 -->
//                <div class="modules-container" id="modules-container">
//        `;
//
//		// 🆕 **DB 연동 4**: DB에서 받은 모듈 수 사용 (기본값 9)
//		const moduleCount = rackData?.MODULES ?? 9;
//
//		console.log('rackData (json):\n', JSON.stringify(rackData, null, 2));
//		console.log('moduleCount : ' + moduleCount);
//
//		// Module 생성 - DB 데이터 기반으로 수정
//		for (let i = 1; i <= moduleCount; i++) {
//			const moduleNum = i.toString().padStart(2, '0');
//
//			// 🆕 **DB 연동 5**: 해당 모듈의 DB 데이터 가져오기
//			const moduleData = rackData?.modules?.[i - 1] || {};
//
//			html += `
//                <!-- Module ${moduleNum} -->
//                <div class="module">
//                    <div class="module-header">Module ${moduleNum}</div>
//                    <div class="position-headers">
//                        <div class="position-header">Position 1</div>
//                        <div class="position-header">Position 2</div>
//                    </div>
//                    
//                    <!-- Level D -->
//                    <div class="level-row level-d-bg">
//            `;
//			if($("#rack-filter-factoryVal").val() == 'SALTILLO'){
//				// 각 레벨(D, C, B, A)과 포지션(1, 2) 처리
//				['D', 'C', 'B', 'A'].forEach(level => {
//					if (level !== 'D') {
//						html += `
//	                    </div>
//	                    
//	                    <!-- Level ${level} -->
//	                    <div class="level-row level-${level.toLowerCase()}-bg">
//	                    `;
//					}
//	
//					for (let pos = 1; pos <= 2; pos++) {	
//						const positionId = `${rackId}-${i}-${level}-${pos}`;
//	
//						// 🆕 **DB 연동 6**: DB에서 해당 포지션의 실제 데이터 가져오기 //개선
//						const positionData = moduleData?.positions?.find(p =>
//							p.positionId === positionId ||
//							(p.module == i && p.level == level && p.position == pos)
//						) || {};
//						console.log(" LOCA INFO - POS ")
//						console.log(positionData)
//						console.log(moduleData)
//	
//						const status = positionData.status || 'empty'; // 'occupied' or 'empty'
//						//const warehouseInfo = positionData.carInfo || {};
//	
//						html += `
//	                    <div class="position-box ${status}" data-position="${positionId}" onclick="clickPosition('${positionId}', '${status}', ${JSON.stringify(positionData).replace(/"/g, '&quot;')})">
//	                `;
//	
//						// 🔥 **라인 122, 136, 150, 164 임시 차량 정보 주석처리 및 실제 데이터 사용**
//						console.log(" LOCA INFO ")
//						if (status === 'occupied') {
//							// DB에서 받은 실제 차량 정보 사용
//							html += `<div class="car-info">${positionData.carname || 'N/A'}<br>${positionData.itemcode || 'N/A'}<br></div>`;
//							html += `<div class="pallet-icon"><img src="../resources/images/rbg_pallet.png"></div>`;
//						} else {
//							html += `<div class="car-info-empty">EMPTY</div>`;
//						}
//	
//						html += `
//	                        <div class="position-label">${positionId}</div>
//	                    </div>
//	                    `;
//					}
//				});
//			}else{
//				// 각 레벨(D, C, B, A)과 포지션(1, 2) 처리
//				['4', '3', '2', '1'].forEach(level => {
//					if (level !== '4') {
//						let levelClass = ""
//						if(level == '3'){
//							levelClass = 'c'
//						}else if(level == '2'){
//							levelClass = 'b'
//						}else if(level == '1'){
//							levelClass = 'a'
//						}
//						html += `
//	                    </div>
//	                    
//	                    <!-- Level ${level} -->
//	                    <div class="level-row level-${levelClass}-bg">
//	                    `;
//					}
//	
//					for (let pos2 = 1; pos2 <= 2; pos2++) {
//						let pos = "";
//						if(pos2 ==1){
//							pos ='L'
//						}else if(pos2 ==2){
//							pos ='R'
//						}
//						// 🔥 **라인 119, 133, 147, 161 임시 상태 생성 주석처리**
//						// const status = getRandomStatus();
//	
//						const positionId = `${rackId}-${i}-${level}-${pos}`;
//	
//						// 🆕 **DB 연동 6**: DB에서 해당 포지션의 실제 데이터 가져오기 //개선
//						const positionData = moduleData?.positions?.find(p =>
//							p.positionId === positionId ||
//							(p.module == i && p.level == level && p.position == pos)
//						) || {};
//						console.log(" LOCA INFO - POS ")
//						console.log(positionData)
//						console.log(moduleData)
//	
//						const status = positionData.status || 'empty'; // 'occupied' or 'empty'
//						//const warehouseInfo = positionData.carInfo || {};
//	
//						html += `
//	                    <div class="position-box ${status}" data-position="${positionId}" onclick="clickPosition('${positionId}', '${status}', ${JSON.stringify(positionData).replace(/"/g, '&quot;')})">
//	                `;
//	
//						// 🔥 **라인 122, 136, 150, 164 임시 차량 정보 주석처리 및 실제 데이터 사용**
//						console.log(" LOCA INFO ")
//						if (status === 'occupied') {
//							// DB에서 받은 실제 차량 정보 사용
//							html += `<div class="car-info">${positionData.carname || 'N/A'}<br>${positionData.itemcode || 'N/A'}<br></div>`;
//							html += `<div class="pallet-icon"><img src="../resources/images/rbg_pallet.png"></div>`;
//						} else {
//							html += `<div class="car-info-empty">EMPTY</div>`;
//						}
//	
//						html += `
//	                        <div class="position-label">${positionId}</div>
//	                    </div>
//	                    `;
//					}
//				});
//			}
//
//			html += `
//                    </div>
//                </div>
//            `;
//		}
//
//		html += `
//                </div>
//            </div>
//        `;
//
//		$('#warehouse-display').html(html);
//
//		// 🆕 가로 스크롤 기능 추가
//		setupHorizontalScroll();
//
//		inputSideBar();
//
//		hideLoading();
//	}
//
//	window.clickPosition = function(location) {
//		// 모달에 데이터 설정
//		$('#modalLocation').text(location);
//		location = $("#rack-filter-factoryVal").val() + "-" + $("#rack-filter-storageVal").val() + "-" + location
//		// 점검 필요
//		//showLoading("data");
//
//		$.ajax({
//			url: "/rack/locationDetail",
//			method: 'POST',
//			data: { location },
//			success: function(result) {
//				console.log(result);
//
//				renderInfo(result.list);
//			},
//		});
//	}
//
//	function renderInfo(list) {
//		const infoListBody = $(".modal-body");
//
//		infoListBody.find('.modal-data').remove();
//
//		var infoHtml = "";
//		list.forEach(function(data) {
//			//			console.log("DEBUG -- DATA;")
//			//			console.log(data);
//			infoHtml += `
//					<div class="modal-data">							
//						<div class="modal-info">
//							<div class="info-label">${i18n.t('search.itemCode')}</div>
//							<div class="info-value" id="modalItemCode">${data.ITEMCODE}</div>
//						</div>
//						<div class="modal-info">
//							<div class="info-label">${i18n.t('search.itemName')}</div>
//							<div class="info-value" id="modalItemName">${data.ITEMNAME}</div>
//						</div>
//						<div class="modal-info">
//							<div class="info-label">${i18n.t('search.qty')}</div>
//							<div class="info-value" id="modalCarType">${data.QTY}</div>
//						</div>
//						<div class="modal-info">
//							<div class="info-label">${i18n.t('search.indate')}</div>
//							<div class="info-value" id="modalInboundDate">${data.INDATE}</div>	
//						</div>
//						<div class="modal-info">
//							<div class="info-label">${i18n.t('table.storage.date')}</div>
//							<div class="info-value" id="modalStorageDate">${data.LOCDATE}</div>
//						</div>
//						<div class="modal-info">
//							<div class="info-label">${i18n.t('table.lot')}</div>
//							<div class="info-value" id="modalLot">${data.LOT}</div>
//						</div>
//						<div class="modal-info">
//							<div class="info-label">${i18n.t('search.barcode')}</div>
//							<div class="info-value" id="modalBarcode">${data.BARCODE}</div>
//						</div>
//					</div>
//			`;
//		});
//		infoListBody.append(infoHtml);
//
//		// 모달 표시
//		$('#positionModal').css("display", "flex");
//
//		hideLoading();
//	}
//
//	// 🆕 아코디언 토글 함수
//	window.toggleAccordion = function() {
//		const accordionContent = $('#accordion-content');
//		const accordionHeader = $('#accordion-toggle');
//
//		//accordionContent.toggleClass('active');
//		//accordionHeader.toggleClass('active');
//
//		console.log('🔄 아코디언 토글');
//	}
//
//	// 🆕 필터 상태 업데이트 함수
//	window.updateFilterStatus = function() {
//		const storage = $('#rack-filter-storageVal').val();
//		const factory = $('#rack-filter-factoryVal').val();
//		const searchType = $('#rack-filter-searchVal').val();
//		const keyword = $('#searchVal-keyword').val();
//
//		let activeFilters = [];
//
//		if (storage !== 'default') activeFilters.push('저장소');
//		if (factory !== 'default') activeFilters.push('공장');
//		if (searchType !== 'default') activeFilters.push('종류');
//		if (keyword && keyword.trim() !== '') activeFilters.push('키워드');
//
//		const filterStatusText = activeFilters.length === 0 ? '전체 조건' : i18n.tf('filter.search.info', activeFilters.length)/*`${activeFilters.length}개 필터 적용`*/;
//		$('#filter-status').text(filterStatusText);
//
//		console.log('📊 필터 상태 업데이트:', filterStatusText);
//	}
//
//
//	// 공장에 따른 창고 옵션 초기화
//	function initFactoryStorageFilter($root) {
//	    const factory = $root.find('#rack-filter-factoryVal')[0]; // 공장 select
//	    const storage = $root.find('#rack-filter-storageVal')[0]; // 창고 select
//	    if (!factory || !storage) return;
//
//	    // 현재 렌더된 옵션을 템플릿으로 스냅샷
//	    const template = Array.from(storage.options).map(o => ({ value: o.value, label: o.text }));
//
//	    // 공장별 허용 규칙
//	    const rules = {
//	        'SALTILLO': ['H/REST', 'Material', 'Fabric', 'Side seat', 'Outside'],
//	        'PUEBLA' : ['MATERIAL', 'PRODUCT'],
//	    };
//
//	    // 공장별 기본 창고
//	    const defaults = {
//	        'SALTILLO': 'H/REST',
//	        'PUEBLA' : 'MATERIAL',
//	    };
//
//	    const norm = v => String(v || '').trim();
//
//	    function updatePart2(siteRaw) {
//	        const site = norm(siteRaw);
//	        const allowed = rules[site] || [];
//	        let prefer = defaults[site];
//			const menuType = getMenuType();       // ← 여기서 sales/purchase 가져옴
//			  console.log('메뉴타입:', menuType || '(blank)');
//
//			  if (menuType === 'sales') {
//			    prefer = 'Fabric';                  // sales면 강제 FABRIC
//			  }
//
//	        // 🔑 템플릿 쓰지 말고 '허용값'으로 새로 구성 → 케이스를 rules에 맞춰 강제
//	        storage.innerHTML = '';
//
//	        if (allowed.length) {
//	            // 중복 방지(허용값 안에 중복이 없더라도 안전하게)
//	            const seen = new Set();
//	            allowed.forEach(v => {
//	                const key = String(v).trim();
//	                if (!seen.has(key.toLowerCase())) {
//	                    // 라벨도 값과 동일하게(푸에블라는 대문자 유지)
//	                    storage.add(new Option(key, key));
//	                    seen.add(key.toLowerCase());
//	                }
//	            });
//	        } else {
//	            // 허용값이 없으면 원본 유지(필요 시 제거 가능)
//	            template.forEach(opt => storage.add(new Option(opt.label, opt.value)));
//	        }
//
//	        // 기본값 선택 (없으면 첫 번째)
//	        if (prefer && Array.from(storage.options).some(o => o.value === prefer)) {
//	            storage.value = prefer;
//	        } else if (storage.options.length) {
//	            storage.selectedIndex = 0;
//	        }
//
//	        storage.dispatchEvent(new Event('change'));
//	    }
//
//	    // 공장 선택 변경 시 창고 갱신
//	    factory.addEventListener('change', () => updatePart2(factory.value));
//		// ✅ 메뉴 타입이 변경되면 창고를 다시 업데이트 (함수 안에 위치!) 대메뉴 구분시 사용!!
//		if (!window.menuTypeEventBound) {
//		    document.addEventListener('menuTypeChanged', function(e) {
//		        const currentFactory = $('#rack-filter-factoryVal').val();
//		        updatePart2(currentFactory);
//		        setTimeout(() => performSearch(), 150);
//		    });
//		    window.menuTypeEventBound = true;
//		}
//	    const storedFactory = getCookie('selectedFactory');
//	    if (storedFactory) {
//	        // factory에 해당 값이 존재하면 선택
//	        const hasOption = Array.from(factory.options).some(
//	            o => norm(o.value).toLowerCase() === storedFactory.toLowerCase()
//	        );
//	        if (hasOption) {
//	            // 실제 옵션의 원래 value로 맞춰줌 (대소문자 유지)
//	            const realVal = Array.from(factory.options).find(
//	                o => norm(o.value).toLowerCase() === storedFactory.toLowerCase()
//	            ).value;
//	            factory.value = realVal;
//	        }
//	    }
//	    
//	    // 초기 1회 적용
//	    updatePart2(factory.value);
//	}
//	
//
//	
//	// 정규식으로 쿠기 가져오기
//	function getCookie(cookieName) {
//	    const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
//	    return match ? decodeURIComponent(match[2]) : '';
//	}
//
//
//
//	// 🔥 **라인 235-242 함수 수정**: DB 연동으로 검색 기능 개선
//	window.performSearch = function() {
//		console.log('🔍 검색 실행');
//		
//		changeWarehouseImg();
//		
//		updateFilterStatus();
//
//		// 🆕 **DB 연동 8**: 필터 조건에 따른 RACK 목록 다시 로드
//		loadRackListData().then(function(rackListData) {
//			updateRackList(rackListData);
//			// 기존 RACK 아이템들 제거
//			rackListContainer.find('.rack-item').remove();
//			rackListContainer.find('.btn_unstorageItems').remove();
//		}).catch(function(error) {
//			console.error('검색 실패:', error);
//		});
//	}
//	
//	// 창고 구조도 변경 함수
//	window.changeWarehouseImg = function(){
//		$("#warehouse-display").empty();
//		console.log("empty");
//		if($("#rack-filter-factoryVal").val() == 'SALTILLO'){
//			if ($("#rack-filter-storageVal").val() == 'Fabric') {
//				$("#warehouse-display").append('<img src="../resources/images/locationmap_fabric.png" style = "width:100%">')
//			} else {
//				$("#warehouse-display").append('<img src="../resources/images/locationmap.png" style = "width:100%">')
//			}			
//		}else{
//			$("#warehouse-display").append('<img src="../resources/images/locationmap_puebla.png" style = "width:87%">')
//		}
//	}
//
//	// 🆕 **DB 연동 9**: RACK 목록을 업데이트하는 함수
//	window.updateRackList = function(rackListData) {
//		const rackListContainer = $('.rack-list-area');
//		const headerAndFilter = rackListContainer.find('.rack-list-header, .accordion-container');
//
//		// 기존 RACK 아이템들 제거
//		rackListContainer.find('.rack-item').remove();
//		rackListContainer.find('.btn_unstorageItems').remove();
//
//		// 새로운 RACK 아이템들 추가
//		var rackHtml = "";
//		rackListData.forEach(function(rack) {
//			//console.log("DEBUG __ rack")
//			//console.log(rack)
//			const cap = Number(rack.TOTAL_STORAGE_CAPACITY) || 0;
//			const cur = Number(rack.currentCount) || 0;
//			const percent = cap ? Math.round((cur / cap) * 100) : 0;
//			rackHtml += `
//				<div class="rack-item" data-rack="${rack.rackId}" onclick="selectRack('${rack.rackId}')">
//					<div class="rack-name">RACK ${rack.rackId}</div>
//					<div class="rack-usage">${percent}%</div>
//					<div class="rack-details">${rack.currentCount} / ${rack.TOTAL_STORAGE_CAPACITY}</div>
//				</div>
//			`;
//		});
//
//		rackListContainer.find('.rack-item').remove();
//		rackListContainer.find('.btn_unstorageItems').remove();
//
//		rackListContainer.innerHTML = '';
//		rackListContainer.append(rackHtml);
//
//		// 전체 적재율 업데이트
//		const totalCurrent = rackListData.reduce((sum, rack) => sum + rack.currentCount, 0);
//		const totalCapacity = rackListData.reduce((sum, rack) => sum + rack.TOTAL_STORAGE_CAPACITY, 0);
//		const overallRate = totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0;
//
//		$('.rack-filter-resultArea').html(`
//			${i18n.t('filter.title')}<br>
//			<span style="font-size: 16pt; opacity: 0.8;">${overallRate}% | ${totalCurrent} / ${totalCapacity}</span>
//		`);
//	}
//
//	// 전역 함수로 등록
//	window.call_m3_location_status = function() {
//		console.log('🚀 call_m3_location_status 호출됨');
//
//		let content_output = `
//	        <div class="divBlockControl" id="view_m3_location_status">
//	            <!-- 좌측 RACK 리스트 영역 -->
//	            <div class="rack-list-area">
//	                <div class="rack-list-header">
//	                	<div class="rack-filter-resultArea">
//		                    ${i18n.t('filter.title')}<br>
//		                    <span style="font-size: 11pt; opacity: 0.8;">${i18n.t('table.loading')}</span>
//	                	</div>
//	                	
//	                	<!-- 🆕 아코디언 필터 영역 -->
//	                	<div class="accordion-container">
//	                		<div class="accordion-header active" id="accordion-toggle" onclick="toggleAccordion()">
//	                			<div class="accordion-title">
//	                				<span>🔍</span>
//	                				<span>${i18n.t('filter.search')}</span>
//	                				<span class="filter-status" id="filter-status">${i18n.t('filter.search.all')}</span>
//	                			</div>
//	                			<div class="accordion-icon">▼</div>
//	                		</div>
//	                		
//	                		<div class="accordion-content active" id="accordion-content">
//			                	<div class="rack-filter-area">
//					                <div class="filter-group">
//					                    <label class="filter-label">${i18n.t('search.factory')}</label>
//					                    <select id="rack-filter-factoryVal" onchange="updateFilterStatus()">
//					                        <option value="SALTILLO">Saltillo</option>
//					                        <option value="PUEBLA">Puebla</option>
//					                    </select>
//					                </div>
//					                
//					                <div class="filter-group">
//					                    <label class="filter-label">${i18n.t('search.storage')}</label>
//					                    <select id="rack-filter-storageVal" onchange="updateFilterStatus()">
//					                        <option value="Material">MATERIAL</option>
//											<option value="PRODUCT">PRODUCT</option>
//											<option value="MATERIAL">MATERIAL</option>
//					                        <option value="Fabric">FABRIC</option>
//					                        <option value="Side seat">SIDE SEAT</option>
//					                        <option value="Outside">OUTSIDE</option>
//					                    </select>
//					                </div>
//					                
//					                <div class="search-section">
//					                    <div class="search-input-group">
//					                        <button class="search-btn" id="rack-btnSearch" onclick="performSearch()">${i18n.t('btn.search')}</button>
//					                    </div>
//					                </div>
//					            </div>
//	                		</div>
//	                	</div>
//	                </div>
//	                
//	                <!-- 🔥 **라인 321-343 주석처리**: 임시 하드코딩된 RACK 아이템들 제거 -->
//	                <!-- RACK 아이템들은 loadRackListData()를 통해 동적으로 생성됨 -->
//	                <!--
//	                <div class="rack-item" data-rack="A" onclick="selectRack('A')">
//	                    <div class="rack-name">RACK A</div>
//	                    <div class="rack-usage">30%</div>
//	                    <div class="rack-details">50 / 150</div>
//	                </div>
//	                
//	                <div class="rack-item" data-rack="B" onclick="selectRack('B')">
//	                    <div class="rack-name">RACK B</div>
//	                    <div class="rack-usage">75%</div>
//	                    <div class="rack-details">120 / 160</div>
//	                </div>
//	                
//	                <div class="rack-item" data-rack="C" onclick="selectRack('C')">
//	                    <div class="rack-usage">45%</div>
//	                    <div class="rack-details">90 / 200</div>
//	                </div>
//	                
//	                <div class="rack-item" data-rack="D" onclick="selectRack('D')">
//	                    <div class="rack-name">RACK D</div>
//	                    <div class="rack-usage">85%</div>
//	                    <div class="rack-details">170 / 200</div>
//	                </div>
//	                -->
//	            </div>
//	
//	            <!-- 우측 구조도 영역 -->
//	            <div class="structure-area">
//	                <div class="structure-header">
//	                    <div class="structure-title" id="current-rack-title">RACK을 선택해주세요</div>
//	                    <div class="structure-info" id="current-rack-info">적재율 · 적재량 / 총 적재량</div>
//	                </div>
//	
//	                <div class="warehouse-structure" id="warehouse-display">
//						<img src="../resources/images/locationmap.png" style = "width:100%">
//	                    
//	                </div>
//	            </div>
//	        </div>
//        `;
//
//		// 기존 내용 제거 후 새 내용 추가
//		$("#view_m3_location_status").remove();
//		$(".w_contentArea").prepend(content_output);
//
//		// ✅ 필터 초기화 (여기서 즉시 실행해야 동작)
//		initFactoryStorageFilter($('#view_m3_location_status'));
//
//		// 창고 구조도 변경
//		changeWarehouseImg();
//		
//		// 🆕 **DB 연동 10**: 페이지 로드 시 초기 RACK 목록 데이터 불러오기
//		loadRackListData().then(function(rackListData) {
//			initFactoryStorageFilter($('#view_m3_location_status'));
//			updateRackList(rackListData);
//			updateFilterStatus();
//		}).catch(function(error) {
//			console.error('초기 데이터 로드 실패:', error);
//			// 에러 시 기본 메시지 표시
//			$('.rack-filter-resultArea').html(`
//				${i18n.t('filter.title')}<br>
//				<span style="font-size: 11pt; opacity: 0.8;">${i18n.t('error.failed.data.load')}</span>
//			`);
//		});
//
//		// 모달 이벤트 바인딩
//		$(document).on('click', '.close', function() {
//			$('#positionModal').hide();
//		});
//
//		$(document).on('click', function(event) {
//			if (event.target.id === 'positionModal') {
//				$('#positionModal').hide();
//			}
//		});
//
//		console.log('✅ HTML 삽입 완료');
//	}
//
//	console.log('📚 스크립트 로드 완료');
//
//	// 🆕 가로 스크롤 기능 설정
//	window.setupHorizontalScroll = function() {
//		const modulesContainer = document.getElementById('modules-container');
//
//		if (modulesContainer) {
//			// 마우스 휠 이벤트 리스너 추가
//			modulesContainer.addEventListener('wheel', function(e) {
//				// 기본 세로 스크롤 방지
//				e.preventDefault();
//
//				// 휠 델타 값에 따라 가로 스크롤
//				const scrollAmount = e.deltaY * 2; // 스크롤 속도 조정
//				modulesContainer.scrollLeft += scrollAmount;
//
//				console.log('🔄 가로 스크롤:', scrollAmount);
//			});
//
//			console.log('✅가로 스크롤 설정 완료');
//		}
//	}
//
//});
//
//function inputSideBar() {
//	if($('#rack-filter-factoryVal').val()== 'SALTILLO'){
//		level_low = ["a", "b", "c", "d"];
//		level_up = ["A", "B", "C", "D"];
//	}else{
//		level_low = ["1", "2", "3", "4"];
//		level_up = ["1", "2", "3", "4"];
//	}
//	for (i = 0; i < 4; i++) {
//		if(level_up[i] == 1){
//			level_low[i] ='a'
//		}else if(level_up[i] == 2){
//			level_low[i] ='b'
//		}else if(level_up[i] == 3){
//			level_low[i] ='c'
//		}else if(level_up[i] == 4){
//			level_low[i] ='d'
//		}
//		let output = `
//			<div class="level-item level-${level_low[i]}">Level ${level_up[i]}</div> 
//		`;
//		$(".level-" + level_low[i] + "-bg").first().prepend(output);
//	}
//
//	$(".module").first().css({
//		flex: '0 0 325px'
//	})
//	$(".module-header").first().css({
//		width: '267px',
//		'margin-left': 'auto'
//	})
//	$(".position-headers").first().css({
//		width: '267px',
//		'margin-left': 'auto'
//	})
//	$(".module .position-box:first-child").first().css({
//		width: '133px !important',
//	})
//	$(".module .position-box").first().css({
//		width: '133px',
//		'margin-left': 'auto'
//	})
//
//}
//
//
///* =============================== 아래부터 신규 ===========================*/
//// 창고관리 모달창 삽입
////모달 닫기 (없으면 추가)
//function closeModal() {
//	$('#editModal').hide().empty();
//}
//
//// 안전한 텍스트 출력용
//function escapeHtml(v) {
//	return String(v ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
//}
//
//// 수량 포맷
//function fmtQty(v) {
//	const n = Number(v);
//	return Number.isFinite(n) ? n.toLocaleString() : escapeHtml(v);
//}
//
//function getCookie(name) {
//  const cookies = document.cookie ? document.cookie.split('; ') : [];
//  for (const c of cookies) {
//    const [k, v] = c.split('=');
//    if (k === decodeURIComponent(name)) {
//      return decodeURIComponent(v || '');
//    }
//  }
//  return null; // 없으면 null
//}