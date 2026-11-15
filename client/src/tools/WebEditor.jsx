import { useEffect, useState } from 'react';
import { buildSrcDoc } from './lib/webdoc.js';

const STARTERS = {
  counter: {
    name: 'عدّاد بسيط',
    html: '<h1>عدّاد الضغطات</h1>\n<p>عدد الضغطات: <span id="n">0</span></p>\n<button id="btn">اضغط هنا</button>',
    css: 'h1 { color: #2563eb; }\nbutton { padding: 8px 20px; font-size: 1rem; border-radius: 8px; cursor: pointer; }',
    js: "let count = 0;\ndocument.getElementById('btn').addEventListener('click', () => {\n  count += 1;\n  document.getElementById('n').textContent = count;\n});",
  },
  card: {
    name: 'بطاقة تعريف',
    html: '<div class="card">\n  <h2>اسمك هنا</h2>\n  <p>طالب في الصف الثاني الثانوي</p>\n  <a href="#">تواصل معي</a>\n</div>',
    css: '.card { max-width: 280px; margin: auto; padding: 20px; border-radius: 16px; background: #eef3ff; text-align: center; }\n.card h2 { margin: 0 0 4px; }',
    js: '',
  },
};
const MAX = 50_000;
const TABS = [['html', 'HTML'], ['css', 'CSS'], ['js', 'JavaScript']];

export default function WebEditor() {
  const [code, setCode] = useState(STARTERS.counter);
  const [tab, setTab] = useState('html');
  const [doc, setDoc] = useState(() => buildSrcDoc(STARTERS.counter));

  // تحديث المعاينة بعد توقف الكتابة
  useEffect(() => {
    const t = setTimeout(() => setDoc(buildSrcDoc(code)), 400);
    return () => clearTimeout(t);
  }, [code]);

  const total = code.html.length + code.css.length + code.js.length;

  return (
    <div className="tool">
      <div className="actions">
        <label className="field inline">ابدأ من قالب
          <select value="" onChange={(e) => e.target.value && setCode(STARTERS[e.target.value])}>
            <option value="">اختر…</option>
            {Object.entries(STARTERS).map(([id, s]) => <option key={id} value={id}>{s.name}</option>)}
          </select>
        </label>
        <span className="muted">{total.toLocaleString('en')} / {MAX.toLocaleString('en')} حرف</span>
      </div>

      <div className="editor-split">
        <div>
          <div className="tabs" role="tablist">
            {TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}
          </div>
          <textarea className="code-area" dir="ltr" spellCheck={false} rows={18} value={code[tab]}
            onChange={(e) => { const v = e.target.value; if (total - code[tab].length + v.length <= MAX) setCode({ ...code, [tab]: v }); }} />
        </div>
        <div>
          <div className="tabs"><span className="muted">المعاينة</span></div>
          {/* sandbox بدون allow-same-origin: الكود لا يصل إلى بيانات الموقع أو حسابك */}
          <iframe title="معاينة" className="preview-frame" sandbox="allow-scripts" srcDoc={doc} />
        </div>
      </div>
      <p className="muted">المعاينة معزولة تماماً عن الموقع، ولا تستطيع الاتصال بالإنترنت أو تحميل صور خارجية. الصور تُستخدم بصيغة data: فقط.</p>
    </div>
  );
}
