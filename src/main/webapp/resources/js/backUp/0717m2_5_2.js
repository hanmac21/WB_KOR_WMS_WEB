/* --------------------------------------------------------------
 * 📌 구매 - 적재 - LOCATION 현황
 * 비고: 수정된 완전 버전
 * -------------------------------------------------------------- */

$(document).ready(function() {

    // 🔧 **핵심 수정**: 모든 함수를 전역(window)에 등록
    window.testClick = function() {
        alert('테스트 버튼 클릭됨! 기본 클릭은 작동합니다.');
        console.log('🧪 테스트 클릭 성공');
    }

    window.selectRack = function(rackId) {
        console.log('🎯 RACK 선택됨:', rackId);

        // Active 클래스 토글
        $('.rack-item').removeClass('active');
        $(`[data-rack="${rackId}"]`).addClass('active');

        // 헤더 업데이트
        $('#current-rack-title').text(`RACK ${rackId} 구조도`);

        // 적재율 정보 업데이트
        const rackInfo = {
            'A': '적재율: 30% (50/150)',
            'B': '적재율: 75% (120/160)',
            'C': '적재율: 45% (90/200)',
            'D': '적재율: 85% (170/200)'
        };
        $('#current-rack-info').text(rackInfo[rackId]);

        // 구조도 생성
        generateStructure(rackId);
    }

    window.generateStructure = function(rackId) {
        // 단순화된 적재 상태 (흰색/초록색)
        const getRandomStatus = () => Math.random() > 0.5 ? 'occupied' : 'empty';

        let html = `
        	<div class="warehouse-grid-positionGuide">
        		<span>POSITION 1</span>
                <span>POSITION 2</span>
        		<span>POSITION 1</span>
                <span>POSITION 2</span>
        		<span>POSITION 1</span>
                <span>POSITION 2</span>
        		<span>POSITION 1</span>
                <span>POSITION 2</span>
        		<span>POSITION 1</span>
                <span>POSITION 2</span>
        		<span>POSITION 1</span>
                <span>POSITION 2</span>
        		<span>POSITION 1</span>
                <span>POSITION 2</span>
        	</div>
            <div class="warehouse-grid-container">
                <!-- Level D -->
                <div class="level-row">
                    <div class="level-label level-d">LEVEL D</div>
                    <div class="modules-row">
        `;

        // 01~07 모듈 생성
        for (let i = 1; i <= 7; i++) {
            const moduleNum = i.toString().padStart(2, '');
            const status1 = getRandomStatus();
            const status2 = getRandomStatus();

            html += `
                <div class="module-container">
                    <div class="position-box pos-header">
                        <span>POSITION 1</span>
                        <span>POSITION 2</span>
                    </div>
                    <div class="position-box pos-content">
                        <div class="position-slot ${status1}" onclick="clickPosition('${rackId}-${moduleNum}-D-1', '${status1}')"></div>
                        <div class="position-slot ${status2}" onclick="clickPosition('${rackId}-${moduleNum}-D-2', '${status2}')"></div>
                    </div>
                    <div class="module-number">${moduleNum}</div>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
                
                <!-- Level C -->
                <div class="level-row">
                    <div class="level-label level-c">LEVEL C</div>
                    <div class="modules-row">
        `;

        for (let i = 1; i <= 7; i++) {
            const moduleNum = i.toString().padStart(2, '');
            const status1 = getRandomStatus();
            const status2 = getRandomStatus();

            html += `
                <div class="module-container">
                    <div class="position-box pos-header">
                        <span>POSITION 1</span>
                        <span>POSITION 2</span>
                    </div>
                    <div class="position-box pos-content">
                        <div class="position-slot ${status1}" onclick="clickPosition('${rackId}-${moduleNum}-C-1', '${status1}')"></div>
                        <div class="position-slot ${status2}" onclick="clickPosition('${rackId}-${moduleNum}-C-2', '${status2}')"></div>
                    </div>
                    <div class="module-number">${moduleNum}</div>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
                
                <!-- Level B -->
                <div class="level-row">
                    <div class="level-label level-b">LEVEL B</div>
                    <div class="modules-row">
        `;

        for (let i = 1; i <= 7; i++) {
            const moduleNum = i.toString().padStart(2, '');
            const status1 = getRandomStatus();
            const status2 = getRandomStatus();

            html += `
                <div class="module-container">
                    <div class="position-box pos-header">
                        <span>POSITION 1</span>
                        <span>POSITION 2</span>
                    </div>
                    <div class="position-box pos-content">
                        <div class="position-slot ${status1}" onclick="clickPosition('${rackId}-${moduleNum}-B-1', '${status1}')"></div>
                        <div class="position-slot ${status2}" onclick="clickPosition('${rackId}-${moduleNum}-B-2', '${status2}')"></div>
                    </div>
                    <div class="module-number">${moduleNum}</div>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
                
                <!-- Level A -->
                <div class="level-row">
                    <div class="level-label level-a">LEVEL A</div>
                    <div class="modules-row">
        `;

        for (let i = 1; i <= 7; i++) {
            const moduleNum = i.toString().padStart(2, '0');
            const status1 = getRandomStatus();
            const status2 = getRandomStatus();

            html += `
                <div class="module-container">
                    <div class="position-box pos-header">
                        <span>POSITION 2</span>
                        <span>POSITION 1</span>
                    </div>
                    <div class="position-box pos-content">
                        <div class="position-slot ${status2}" onclick="clickPosition('${rackId}-${moduleNum}-A-2', '${status2}')"></div>
                        <div class="position-slot ${status1}" onclick="clickPosition('${rackId}-${moduleNum}-A-1', '${status1}')"></div>
                    </div>
                    <div class="module-number level-a-number">${moduleNum}<br>MODULE</div>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
            </div>
            
            <div class="warehouse-grid-moduleGuide">
            	<div class="moduleCommon">01<br>Module</div>
            	<div class="moduleCommon">02<br>Module</div>
            	<div class="moduleCommon">03<br>Module</div>
            	<div class="moduleCommon">04<br>Module</div>
            	<div class="moduleCommon">05<br>Module</div>
            	<div class="moduleCommon">06<br>Module</div>
            	<div class="moduleCommon">07<br>Module</div>
            </div>
                    
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color empty"></div>
                    <span>빈 공간</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color occupied"></div>
                    <span>적재됨</span>
                </div>
            </div>
        `;

        $('#warehouse-display').html(html);
    }

    window.clickPosition = function(location, status) {
        const statusText = status === 'occupied' ? '적재됨' : '빈 공간';
        alert(`위치: ${location}\n상태: ${statusText}`);
        console.log('📍 포지션 클릭:', location, statusText);
    }

    // 전역 함수로 등록
    window.call_m2_5_2 = function() {
        console.log('🚀 call_m2_5_2 호출됨');
        
        let content_output = `
        <div class="divBlockControl" id="view_m2_5_2">
            <!-- 좌측 RACK 리스트 영역 -->
            <div class="rack-list-area">
                <div class="rack-list-header">
                    RACK 적재 현황<br>
                    <span style="font-size: 11pt; opacity: 0.8;">60% | 430 / 710</span>
                </div>
                
                <div class="rack-item" data-rack="A" onclick="selectRack('A')">
                    <div class="rack-name">RACK A</div>
                    <div class="rack-usage">30%</div>
                    <div class="rack-details">50 / 150</div>
                </div>
                
                <div class="rack-item" data-rack="B" onclick="selectRack('B')">
                    <div class="rack-name">RACK B</div>
                    <div class="rack-usage">75%</div>
                    <div class="rack-details">120 / 160</div>
                </div>
                
                <div class="rack-item" data-rack="C" onclick="selectRack('C')">
                    <div class="rack-name">RACK C</div>
                    <div class="rack-usage">45%</div>
                    <div class="rack-details">90 / 200</div>
                </div>
                
                <div class="rack-item" data-rack="D" onclick="selectRack('D')">
                    <div class="rack-name">RACK D</div>
                    <div class="rack-usage">85%</div>
                    <div class="rack-details">170 / 200</div>
                </div>
            </div>

            <!-- 우측 구조도 영역 -->
            <div class="structure-area">
                <div class="structure-header">
                    <div class="structure-title" id="current-rack-title">RACK을 선택해주세요</div>
                    <div class="structure-info" id="current-rack-info">좌측 목록에서 RACK을 클릭하여 구조도를 확인하세요</div>
                </div>

                <div class="warehouse-structure" id="warehouse-display">
                    <div class="empty-state">
                        <h3>📦</h3>
                        <h3>창고 구조도</h3>
                        <p>RACK을 선택하면 상세 구조가 표시됩니다</p>
                    </div>
                </div>
            </div>
        </div>
        `;
		/*<button class="test-button" onclick="testClick()">클릭 테스트</button>*/
        // 기존 내용 제거 후 새 내용 추가
        $("#view_m2_5_2").remove();
        $(".w_contentArea").prepend(content_output);
        
        console.log('✅ HTML 삽입 완료');
    }

    console.log('📚 스크립트 로드 완료');
});