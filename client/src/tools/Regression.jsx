import { useMemo, useRef, useState } from 'react';
import { linearRegression, predict, describeCorrelation } from './lib/regression.js';

const W = 520, H = 380, L = 44, B = 40, T = 16, R = 16;
const PW = W - L - R, PH = H - T - B;
const sx = (x) => L + (x / 10) * PW;
const sy = (y) => T + PH - (y / 10) * PH;

const PRESETS = {
  'علاقة طردية': [[1, 1.5], [2, 2.4], [3, 3.9], [4, 4.1], [5, 5.6], [6, 6.2], [7, 7.5], [8, 8.1], [9, 9.2]],
  'علاقة عكسية': [[1, 9], [2, 8.2], [3, 7.1], [4, 6.4], [5, 5.2], [6, 4.1], [7, 3.3], [8, 2.2], [9, 1.4]],
  'لا توجد علاقة': [[1, 6], [2, 2], [3, 8], [4, 4], [5, 9], [6, 3], [7, 7], [8, 1], [9, 5]],
  'قيمة شاذة': [[1, 1.4], [2, 2.2], [3, 3.1], [4, 4.3], [5, 4.9], [6, 6.1], [7, 6.8], [8, 8], [9, 1]],
};
const toPts = (arr) => arr.map(([x, y]) => ({ x, y }));
const round1 = (v) => Math.round(v * 10) / 10;
const f = (v, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : '—');

export default function Regression() {
  const [pts, setPts] = useState(toPts(PRESETS['علاقة طردية']));
  const [resid, setResid] = useState(true);
  const [xq, setXq] = useState(5);
  const svg = useRef(null);
  const model = useMemo(() => linearRegression(pts), [pts]);

  function addPoint(e) {
    const rect = svg.current.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * W - L) / PW * 10;
    const y = (1 - (((e.clientY - rect.top) / rect.height) * H - T) / PH) * 10;
    if (x < 0 || x > 10 || y < 0 || y > 10) return;
    setPts((p) => (p.length >= 60 ? p : [...p, { x: round1(x), y: round1(y) }]));
  }

  const line = model && { x1: 0, y1: predict(model, 0), x2: 10, y2: predict(model, 10) };

  return (
    <div className="tool">
      <div className="actions">
        {Object.keys(PRESETS).map((name) => <button key={name} className="btn ghost small" onClick={() => setPts(toPts(PRESETS[name]))}>{name}</button>)}
        <button className="btn ghost small" onClick={() => setPts([])}>مسح الكل</button>
        <label className="check"><input type="checkbox" checked={resid} onChange={(e) => setResid(e.target.checked)} /> إظهار البواقي</label>
      </div>
      <p className="muted">اضغط على الرسم لإضافة نقطة، واضغط على نقطة لحذفها. جرّب إضافة قيمة بعيدة عن الباقي ولاحظ تأثيرها على الخط.</p>

      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="plot clickable" onClick={addPoint} role="img" aria-label="مخطط انتشار مع خط الانحدار">
        <defs><clipPath id="plotarea"><rect x={L} y={T} width={PW} height={PH} /></clipPath></defs>
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={sx(v)} x2={sx(v)} y1={T} y2={T + PH} className="grid" />
            <line x1={L} x2={L + PW} y1={sy(v)} y2={sy(v)} className="grid" />
            <text x={sx(v)} y={H - 18} className="tick" textAnchor="middle">{v}</text>
            <text x={L - 8} y={sy(v) + 4} className="tick" textAnchor="end">{v}</text>
          </g>
        ))}
        <rect x={L} y={T} width={PW} height={PH} className="frame" />
        {model && resid && pts.map((p, i) => <line key={i} x1={sx(p.x)} x2={sx(p.x)} y1={sy(p.y)} y2={sy(predict(model, p.x))} className="resid" clipPath="url(#plotarea)" />)}
        {line && <line x1={sx(line.x1)} y1={sy(line.y1)} x2={sx(line.x2)} y2={sy(line.y2)} className="fit" clipPath="url(#plotarea)" />}
        {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="6" className="pt" onClick={(e) => { e.stopPropagation(); setPts(pts.filter((_, j) => j !== i)); }} />)}
      </svg>

      {model ? (
        <>
          <div className="box">
            <p>معادلة خط الانحدار: <b dir="ltr">ŷ = {f(model.slope)}x {model.intercept < 0 ? '−' : '+'} {f(Math.abs(model.intercept))}</b></p>
            <p>معامل الارتباط: <b dir="ltr">r = {f(model.r)}</b> · معامل التحديد: <b dir="ltr">R² = {f(model.r2)}</b> · عدد النقاط: <b>{model.n}</b></p>
            <p>التفسير: {describeCorrelation(model.r)}.{model.r2 !== null && ` يفسّر الخط حوالي ${Math.round(model.r2 * 100)}% من تغيّر y.`}</p>
          </div>
          <label className="field inline">تنبؤ: عند x =
            <input type="number" dir="ltr" step="0.5" value={xq} onChange={(e) => setXq(Number(e.target.value))} />
          </label>
          <p>القيمة المتوقعة: <b dir="ltr">ŷ = {f(predict(model, xq), 2)}</b>{(xq < 0 || xq > 10) && <span className="muted"> (خارج نطاق البيانات؛ التنبؤ هنا غير موثوق)</span>}</p>
        </>
      ) : (
        <p className="state">أضف نقطتين على الأقل (بقيم x مختلفة) لرسم خط الانحدار.</p>
      )}
      <p className="muted">ارتباط قوي لا يعني أن أحد المتغيرين سبب في الآخر.</p>
    </div>
  );
}
