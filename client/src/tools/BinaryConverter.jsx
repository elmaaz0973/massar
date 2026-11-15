import { useState } from 'react';
import { parseInBase, toBase, bitLength, groupBits, divisionSteps, placeValues, hexToBinaryGroups } from './lib/numbers.js';

const FIELDS = [
  { base: 10, label: 'عشري (Decimal)', placeholder: '22' },
  { base: 2, label: 'ثنائي (Binary)', placeholder: '10110' },
  { base: 16, label: 'سادس عشر (Hex)', placeholder: '16' },
];

export default function BinaryConverter() {
  const [active, setActive] = useState({ base: 10, text: '22' });
  const parsed = parseInBase(active.text, active.base);
  const n = parsed.value;

  const shown = (base) => (base === active.base ? active.text : n !== undefined ? toBase(n, base) : '');
  const bin = n !== undefined ? toBase(n, 2) : '';
  const hex = n !== undefined ? toBase(n, 16) : '';
  const steps = n !== undefined ? divisionSteps(n) : null;
  const bits = n !== undefined ? bitLength(n) : 0;

  return (
    <div className="tool">
      <div className="tool-grid">
        {FIELDS.map((f) => (
          <label className="field" key={f.base}>{f.label}
            <input dir="ltr" inputMode={f.base === 16 ? 'text' : 'numeric'} placeholder={f.placeholder}
              value={shown(f.base)} onChange={(e) => setActive({ base: f.base, text: e.target.value })} />
          </label>
        ))}
      </div>
      {parsed.error && <p className="state error">{parsed.error}</p>}

      {n !== undefined && (
        <>
          <p className="box">
            العدد <b dir="ltr">{n.toString()}</b> يحتاج إلى <b>{bits}</b> بت
            {' '}(<b>{Math.ceil(bits / 8)}</b> بايت)، ويُكتب في صورة 4 بتات: <b dir="ltr">{groupBits(bin)}</b>
          </p>

          <h3>قيمة كل خانة في العدد الثنائي</h3>
          <div className="table-wrap">
            <table className="tool-table" dir="ltr">
              <tbody>
                <tr>{placeValues(bin).map((p, i) => <td key={i} className="muted">{p.weight.toString()}</td>)}</tr>
                <tr>{placeValues(bin).map((p, i) => <td key={i} className={p.bit === '1' ? 'on' : ''}>{p.bit}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <p className="muted">اجمع قيم الخانات التي فيها 1: {placeValues(bin).filter((p) => p.bit === '1').map((p) => p.weight.toString()).join(' + ') || '0'} = {n.toString()}</p>

          <h3>من العشري إلى الثنائي بالقسمة على 2</h3>
          {steps ? (
            <div className="table-wrap">
              <table className="tool-table" dir="ltr">
                <thead><tr><th>العدد</th><th>÷ 2</th><th>الباقي</th></tr></thead>
                <tbody>{steps.map((s, i) => <tr key={i}><td>{s.dividend}</td><td>{s.quotient}</td><td className="on">{s.remainder}</td></tr>)}</tbody>
              </table>
            </div>
          ) : <p className="muted">خطوات القسمة تُعرض للأعداد الأصغر من 2³² فقط.</p>}
          <p className="muted">اقرأ الباقي من الأسفل إلى الأعلى: <b dir="ltr">{bin}</b></p>

          <h3>من الثنائي إلى السادس عشر (كل 4 بتات = رمز واحد)</h3>
          <div className="table-wrap">
            <table className="tool-table" dir="ltr">
              <tbody>
                <tr>{hexToBinaryGroups(hex.padStart(Math.ceil(bin.length / 4), '0')).map((g, i) => <td key={i} className="muted">{g.bits}</td>)}</tr>
                <tr>{hexToBinaryGroups(hex.padStart(Math.ceil(bin.length / 4), '0')).map((g, i) => <td key={i} className="on">{g.digit}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
