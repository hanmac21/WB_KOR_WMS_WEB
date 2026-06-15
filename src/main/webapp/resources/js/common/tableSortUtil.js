/**
 * 테이블 정렬 유틸리티
 * 사용법: TableSortUtil.init(tableSelector, dataArray, renderFunction)
 */
const TableSortUtil = (function() {

	let sortStates = {}; // 각 테이블별 정렬 상태 저장

	/**
	 * 테이블 정렬 초기화
	 * @param {string} tableId - 테이블 고유 ID
	 * @param {function} getDataFunc - 현재 데이터를 반환하는 함수
	 * @param {function} renderFunc - 테이블을 다시 그리는 함수
	 */
	function init(tableId, getDataFunc, renderFunc) {
		sortStates[tableId] = {
			currentColumn: null,
			currentOrder: 'asc'
		};

		// 헤더 클릭 이벤트 바인딩
		$(`#${tableId} thead th[data-sort]`).off('click.tableSort').on('click.tableSort', function() {
			const column = $(this).data('sort');
			const dataType = $(this).data('type') || 'string'; // string, number, date

			handleSort(tableId, column, dataType, getDataFunc, renderFunc);
		});
	}

	/**
	 * 정렬 처리
	 */
	function handleSort(tableId, column, dataType, getDataFunc, renderFunc) {
		const state = sortStates[tableId];

		// 같은 컬럼 클릭 시 오름차순 ↔ 내림차순 토글
		if (state.currentColumn === column) {
			state.currentOrder = state.currentOrder === 'asc' ? 'desc' : 'asc';
		} else {
			// 다른 컬럼 클릭 시 새로운 컬럼으로 오름차순 정렬
			state.currentColumn = column;
			state.currentOrder = 'asc';
		}

		// 데이터 정렬
		const data = getDataFunc();
		const sortedData = sortData(data, column, state.currentOrder, dataType);

		// 테이블 다시 그리기
		renderFunc(sortedData);

		// 헤더에 정렬 표시 업데이트
		updateSortIndicators(tableId, column, state.currentOrder);
	}

	/**
	 * 데이터 정렬
	 */
	function sortData(data, column, order, dataType) {
		return [...data].sort((a, b) => {
			let valA = a[column] || a[column.toLowerCase()] || '';
			let valB = b[column] || b[column.toLowerCase()] || '';

			// 데이터 타입별 처리
			if (dataType === 'number') {
				valA = parseFloat(valA) || 0;
				valB = parseFloat(valB) || 0;
			} else if (dataType === 'date') {
				valA = new Date(valA).getTime() || 0;
				valB = new Date(valB).getTime() || 0;
			} else {
				valA = String(valA).toUpperCase();
				valB = String(valB).toUpperCase();
			}

			if (valA < valB) return order === 'asc' ? -1 : 1;
			if (valA > valB) return order === 'asc' ? 1 : -1;
			return 0;
		});
	}

	/**
	 * 헤더에 정렬 방향 표시
	 */
	function updateSortIndicators(tableId, column, order) {
		// 모든 정렬 표시 제거
		$(`#${tableId} thead th`).removeClass('sort-asc sort-desc');

		// 현재 정렬 컬럼에 표시 추가
		$(`#${tableId} thead th[data-sort="${column}"]`).addClass(`sort-${order}`);

		// 스크롤을 맨 위로 이동
		window.scrollTo({ top: 0, behavior: 'smooth' });
		// 또는 테이블 컨테이너만 스크롤하려면:
		// $(`#${tableId}`).closest('.table-container').scrollTop(0);
	}

	/**
	 * 정렬 상태 초기화
	 */
	function reset(tableId) {
		if (sortStates[tableId]) {
			sortStates[tableId] = {
				currentColumn: null,
				currentOrder: 'asc'
			};
			$(`#${tableId} thead th`).removeClass('sort-asc sort-desc');
		}
	}

	return {
		init: init,
		reset: reset
	};
})();

// 전역으로 사용 가능하도록 설정
window.TableSortUtil = TableSortUtil;