import { useState } from 'react';
import { clamp255, toBin8, rgbToHex, colorCount } from './lib/color.js';

const DEPTHS = [
  { bits: 1, label: '1 bit (مستويان)' },
  { bits: 8, label: '8 bit (256 مستوى)' },
  { bits: 24, label: '24 bit (الألوان الكاملة)' },
];

export default function ColorBits() {
  const [rgb, setRgb] = useState({ r: 255, g: 128, b: 0 });
  const [size, setSize] = useState({ w: 1280, h: 720, bits: 24 });
  const hex = rgbToHex(rgb);
  const setChannel = (k) => (e) => setRgb({ ...rgb, [k]: clamp255(e.target.value) });
  const num = (v) => Math.max(1, Math.min(20000, Math.round(Number(v)) || 1));

  return (
    <div className="tool">
      <h3>الألوان بنظام RGB</h3>
      <div className="color-row">
        <div className="swatch" style={{ background: hex }} aria-label={`اللون ${hex}`} />
        <div className="sliders">
          {[['r', 'الأحمر'], ['g', 'الأخضر'], ['b', 'الأزرق']].map(([k, label]) => (
            <label key={k} className="slider">{label}
              <input type="range" min="0" max="255" value={rgb[k]} onChange={setChannel(k)} />
              <input type="number" min="0" max="255" dir="ltr" value={rgb[k]} onChange={setChannel(k)} />
            </label>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="tool-table" dir="ltr">
          <thead><tr><th>Channel</th><th>Decimal</th><th>Binary (8 bits)</th></tr></thead>
          <tbody>
            {[['R', rgb.r], ['G', rgb.g], ['B', rgb.b]].map(([name, v]) => (
              <tr key={name}><td>{name}</td><td>{v}</td><td>{toBin8(v)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">الألوان الكاملة (24-bit): 24 bit = 3 × 8 bit، أي 256 مستوى (2⁸) لكل لون من الأحمر والأخضر والأزرق: <b dir="ltr">{toBin8(rgb.r)} {toBin8(rgb.g)} {toBin8(rgb.b)}</b></p>

      <h3>حجم بيانات الصورة</h3>
      <div className="tool-grid">
        <label className="field">عدد pixels أفقي
          <input type="number" dir="ltr" min="1" value={size.w} onChange={(e) => setSize({ ...size, w: num(e.target.value) })} />
        </label>
        <label className="field">عدد pixels رأسي
          <input type="number" dir="ltr" min="1" value={size.h} onChange={(e) => setSize({ ...size, h: num(e.target.value) })} />
        </label>
        <label className="field">عدد bits لمعلومات اللون
          <select value={size.bits} onChange={(e) => setSize({ ...size, bits: Number(e.target.value) })}>
            {DEPTHS.map((d) => <option key={d.bits} value={d.bits}>{d.label}</option>)}
          </select>
        </label>
      </div>
      <p className="box">
        عدد pixels: <b dir="ltr">{(size.w * size.h).toLocaleString('en')}</b> ·
        عدد المستويات الممكنة لكل pixel: <b dir="ltr">{colorCount(size.bits).toLocaleString('en')}</b> ·
        حجم بيانات الصورة: <b dir="ltr">{(size.w * size.h * size.bits).toLocaleString('en')} bit</b>
      </p>
      <p className="muted">حجم بيانات الصورة [bit] = (عدد pixels رأسي × عدد pixels أفقي) × عدد bits لمعلومات اللون.</p>
    </div>
  );
}
