;(function (global) {
  const hasXLSX = typeof XLSX !== 'undefined';

  // --- 안전한 파일명 만들기 ---
  function safeFileName(name) {
    return (name || 'download').replace(/[\\/:*?"<>|]/g, '_').trim() || 'download';
  }

  // --- Date → 문자열 변환 ---
  function fmtDate(v) {
    if (!(v instanceof Date)) return v;
    const p = n => String(n).padStart(2,'0');
    return `${v.getFullYear()}-${p(v.getMonth()+1)}-${p(v.getDate())} ${p(v.getHours())}:${p(v.getMinutes())}`;
  }

  const formatters = {
    number: v => {
      if (v == null || v === '') return '';
      const n = Number(v);
      return Number.isFinite(n) ? n : v;
    },
    text: v => {
      if (v instanceof Date) return fmtDate(v);
      return v == null ? '' : String(v);
    },
  };

  // 컬럼 자동생성 (columns 안주면 키명 기준)
  function normalizeColumns(data, columns) {
    if (columns && columns.length) return columns;
    if (!Array.isArray(data) || data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.map(k => ({ key: k, header: k }));
  }
  
  // qty 류 컬럼 자동 감지 (qty, inqty, outqty, ...qty)
  function isQtyKey(key) {
    if (!key) return false;
    const k = String(key).trim().toLowerCase().replace(/\s+/g, '');
    return k === 'qty' || k === 'inqty' || k === 'outqty' || /qty$/.test(k) || k.endsWith('qty');
  }

  // 자동 열 너비 계산
  function autoWidths(header, body, min = 8, max = 40) {
    return header.map((h, i) => {
      const maxLen = Math.max(
        String(h).length,
        ...body.map(r => (r[i] != null ? String(r[i]).length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 2, min), max) };
    });
  }

  // --- XLSX 저장 ---
  function toXLSX(rows, columns, opts = {}) {
    if (!hasXLSX) throw new Error('XLSX 라이브러리가 없습니다.');
    if (!Array.isArray(rows) || rows.length === 0) {
		hideLoading();
		alert('No data available');
		return;
	}
	
	
    const cols = normalizeColumns(rows, columns);
    const header = cols.map(c => c.header ?? c.key);
    const body = rows.map(r =>
      cols.map(c => {
		//250912 hj 주석 
        /*const val = r[c.key];
        if (c.type === 'number' || ['qty','amount','price'].includes(c.key))
          return formatters.number(val);
        return formatters.text(val);*/
		const key = (c.key ?? c.field ?? '').toString();
		    const val = r[key];
		    // 명시 type=number 이거나 qty 류면 숫자로 저장
		    if (c.type === 'number' || isQtyKey(key)) return formatters.number(val);
		    return formatters.text(val);
      })
    );

    const aoa = [header, ...body];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = autoWidths(header, body);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, opts.sheetName || 'Sheet1');

    const base = safeFileName(opts.fileName || 'download');
    XLSX.writeFile(wb, `${base}_${timeStamp()}.xlsx`);
  }

  // --- CSV 저장 ---
  function toCSV(rows, columns, opts = {}) {
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('데이터 없음');

    const cols = normalizeColumns(rows, columns);
    const header = cols.map(c => c.header ?? c.key);
    const lines = [header];

    for (const r of rows) {
      lines.push(
        cols.map(c => {
			//250912 hj주석 숫자컬럼
          //let v = r[c.key];
          //v = v instanceof Date ? fmtDate(v) : (v == null ? '' : String(v));
		  const key = (c.key ?? c.field ?? '').toString();
		        let v;
		        if (c.type === 'number' || isQtyKey(key)) {
		          const n = formatters.number(r[key]);     // 숫자로 변환
		          v = (n === '' ? '' : String(n));
		        } else {
		          v = r[key];
		          v = v instanceof Date ? fmtDate(v) : (v == null ? '' : String(v));
		        }
          if (/[",\n]/.test(v)) v = `"${v.replace(/"/g,'""')}"`;
          return v;
        })
      );
    }

    const csv = '\uFEFF' + lines.map(a => a.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const base = safeFileName(opts.fileName || 'download');
    a.download = `${base}_${timeStamp()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- 버튼 바인딩 ---
  function bind(buttonSelector, getDataFn, columns, opts = {}) {
    const $btn = (window.jQuery || window.$) ? $(buttonSelector) : null;
    const handler = () => {
      try {
        const data = getDataFn();
        if (opts.forceCSV || !hasXLSX) toCSV(data, columns, opts);
        else toXLSX(data, columns, opts);
      } catch (e) {
        console.error(e);
        alert(e.message || '엑셀 다운로드 중 오류가 발생했습니다.');
      }
    };
    if ($btn) $btn.off('click').on('click', handler);
    else document.querySelector(buttonSelector)?.addEventListener('click', handler);
  }

  // --- 타임스탬프 ---
  function timeStamp() {
    const d = new Date();
    const p = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
  }

  // --- 공용 원샷 헬퍼 ---
  function downloadExcel(rows, columns, opts = {}) {
    if (opts.forceCSV || !hasXLSX) toCSV(rows, columns, opts);
    else toXLSX(rows, columns, opts);
  }

  // 공개 API
  global.ExcelExporter = { toXLSX, toCSV, bind, normalizeColumns, downloadExcel };
})(window);
