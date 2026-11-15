import { useMemo, useState } from 'react';
import { simulate, curve, bitrate, nyquistOk } from './lib/audio.js';

const W = 640, H = 280, PAD = 28;
const px = (t) => PAD + t * (W - 2 * PAD);
const py = (x) => H / 2 - x * (H / 2 - PAD);
const points = (arr) => arr.map((p) => `${px(p.t).toFixed(1)},${py(p.x ?? p.value).toFixed(1)}`).join(' ');

export default function AudioSampling() {
  const [sim, setSim] = useState({ freq: 2, rate: 16, bits: 3 });
  const [file, setFile] = useState({ rate: 44100, bits: 16, channels: 2, seconds: 60 });

  const samples = useMemo(() => simulate(sim), [sim]);
  const wave = useMemo(() => curve(sim.freq), [sim.freq]);
  const recon = samples.map((s) => ({ t: s.t, value: s.value }));
  const ok = nyquistOk(sim.freq, sim.rate);
  const set = (k) => (e) => setSim({ ...sim, [k]: Number(e.target.value) });

  return (
    <div className="tool">
      <h3>محاكاة رقمنة الصوت</h3>
      <div className="tool-grid">
        <label className="slider-col">تردد الموجة: {sim.freq} Hz
          <input type="range" min="1" max="8" value={sim.freq} onChange={set('freq')} />
        </label>
        <label className="slider-col">تردد أخذ العينات: {sim.rate} عيّنة/ثانية
          <input type="range" min="2" max="64" value={sim.rate} onChange={set('rate')} />
        </label>
        <label className="slider-col">عمق bit الكمي: {sim.bits} bit ({2 ** sim.bits} مستوى)
          <input type="range" min="1" max="6" value={sim.bits} onChange={set('bits')} />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label="رسم الموجة الأصلية والعيّنات">
        <line x1={PAD} x2={W - PAD} y1={H / 2} y2={H / 2} className="axis" />
        <polyline points={points(wave)} className="wave" fill="none" />
        <polyline points={points(recon)} className="recon" fill="none" />
        {samples.map((s, i) => (
          <g key={i}>
            <line x1={px(s.t)} x2={px(s.t)} y1={H / 2} y2={py(s.value)} className="stem" />
            <circle cx={px(s.t)} cy={py(s.value)} r="3.5" className="dot" />
          </g>
        ))}
      </svg>
      <p className="legend"><span className="k wave" /> الموجة الأصلية <span className="k recon" /> الصوت بعد الرقمنة</p>
      <p className={`box ${ok ? '' : 'warn'}`}>
        {ok
          ? 'تردد أخذ العينات أكبر من ضعف تردد الموجة، لذلك يمكن إعادة بناء شكل الموجة (نظرية أخذ العينات). جرّب تقليل عمق bit الكمي لترى القيم تتقارب.'
          : 'تردد أخذ العينات لا يتجاوز ضعف تردد الموجة، فلا يمكن إعادة بناء شكل الموجة الأصلية بدقة (نظرية أخذ العينات).'}
      </p>

      <h3>كمية بيانات الصوت</h3>
      <div className="tool-grid">
        <label className="field">تردد أخذ العينات
          <select value={file.rate} onChange={(e) => setFile({ ...file, rate: Number(e.target.value) })}>
            {[8000, 22050, 44100, 48000].map((r) => <option key={r} value={r}>{r.toLocaleString('en')} Hz</option>)}
          </select>
        </label>
        <label className="field">عمق bit الكمي
          <select value={file.bits} onChange={(e) => setFile({ ...file, bits: Number(e.target.value) })}>
            {[8, 16, 24].map((b) => <option key={b} value={b}>{b} bit</option>)}
          </select>
        </label>
        <label className="field">القنوات
          <select value={file.channels} onChange={(e) => setFile({ ...file, channels: Number(e.target.value) })}>
            <option value={1}>1 (أحادية / Monaural)</option><option value={2}>2 (مجسمة / stereo)</option>
          </select>
        </label>
        <label className="field">المدة (ثانية)
          <input type="number" dir="ltr" min="1" max="36000" value={file.seconds}
            onChange={(e) => setFile({ ...file, seconds: Math.max(1, Math.min(36000, Math.round(Number(e.target.value)) || 1)) })} />
        </label>
      </div>
      <p className="box">
        كمية البيانات في الثانية: <b dir="ltr">{bitrate(file).toLocaleString('en')} bit</b> · في {file.seconds} ثانية: <b dir="ltr">{(bitrate(file) * file.seconds).toLocaleString('en')} bit</b>
      </p>
      <p className="muted">كمية البيانات (bit) في الثانية = تردد أخذ العينات × عمق bit الكمي × عدد القنوات.</p>
    </div>
  );
}
