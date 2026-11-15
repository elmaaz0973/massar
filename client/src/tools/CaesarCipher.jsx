import { useMemo, useState } from 'react';
import { ALPHABETS, shiftText, bruteForce, letterFrequency } from './lib/caesar.js';

export default function CaesarCipher() {
  const [key, setKey] = useState('latin');
  const [mode, setMode] = useState('encrypt');
  const [shift, setShift] = useState(3);
  const [text, setText] = useState('Hello, World!');

  const letters = ALPHABETS[key].letters;
  const n = letters.length;
  const k = shift % n;
  const output = shiftText(text, mode === 'encrypt' ? k : -k, key);
  const attempts = useMemo(() => bruteForce(mode === 'encrypt' ? output : text, key), [mode, output, text, key]);
  const freq = useMemo(() => letterFrequency(mode === 'encrypt' ? output : text, key), [mode, output, text, key]);
  const max = Math.max(1, ...freq.map((f) => f.count));
  const shifted = [...letters].map((l) => shiftText(l, mode === 'encrypt' ? k : -k, key));

  function changeAlphabet(next) {
    setKey(next);
    setShift((s) => s % ALPHABETS[next].letters.length);
    setText(next === 'latin' ? 'Hello, World!' : 'مرحبا بالعالم');
  }

  return (
    <div className="tool">
      <div className="tool-grid">
        <label className="field">الأبجدية
          <select value={key} onChange={(e) => changeAlphabet(e.target.value)}>
            {Object.entries(ALPHABETS).map(([id, a]) => <option key={id} value={id}>{a.name}</option>)}
          </select>
        </label>
        <label className="field">العملية
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="encrypt">تشفير</option><option value="decrypt">فك التشفير</option>
          </select>
        </label>
        <label className="slider-col">مفتاح الإزاحة: {k}
          <input type="range" min="0" max={n - 1} value={k} onChange={(e) => setShift(Number(e.target.value))} />
        </label>
      </div>

      <label className="field">{mode === 'encrypt' ? 'النص الأصلي' : 'النص المشفّر'}
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} dir="auto" />
      </label>
      <div className="box">
        <strong>{mode === 'encrypt' ? 'النص المشفّر' : 'النص بعد فك التشفير'}:</strong>
        <p className="out" dir="auto">{output || '—'}</p>
      </div>

      <h3>عجلة الإزاحة</h3>
      <div className="table-wrap">
        <table className="tool-table wheel" dir={key === 'latin' ? 'ltr' : 'rtl'}>
          <tbody>
            <tr>{[...letters].map((l) => <td key={l}>{l}</td>)}</tr>
            <tr>{shifted.map((l, i) => <td key={i} className="on">{l}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="muted">الصف الأول هو الحرف الأصلي، والثاني هو ما يُستبدل به. الأرقام والرموز والمسافات تبقى كما هي.</p>

      <details className="box">
        <summary>كسر الشفرة: جرّب كل المفاتيح الممكنة ({n} احتمالاً فقط!)</summary>
        <p className="muted">لأن عدد المفاتيح قليل، يمكن للمهاجم تجربتها كلها في لحظة. هذا يسمى هجوم القوة الغاشمة.</p>
        <ul className="attempts">
          {attempts.map((a) => <li key={a.shift} className={a.shift === k ? 'hit' : ''}><span className="lnum">{a.shift}</span> <span dir="auto">{a.text}</span></li>)}
        </ul>
      </details>

      <details className="box">
        <summary>تحليل تكرار الحروف في النص المشفّر</summary>
        <p className="muted">الحروف الشائعة في اللغة تظل شائعة بعد الإزاحة، ولذلك يكشف المحلل المفتاح من الأنماط.</p>
        <div className="freq" dir="ltr">
          {freq.map((f) => (
            <div key={f.letter} className="freq-col" title={`${f.letter}: ${f.count}`}>
              <span className="freq-bar" style={{ height: `${(f.count / max) * 80}px` }} />
              <span>{f.letter}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
