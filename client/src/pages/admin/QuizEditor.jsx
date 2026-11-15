import { useEffect, useState } from 'react';
import { adminApi } from '../../adminApi.js';

const blank = () => ({ prompt: '', optionsText: '', correctIndex: 0, explanation: '', source: '' });
const toForm = (q) => ({ prompt: q.prompt, optionsText: q.options.join('\n'), correctIndex: q.correctIndex, explanation: q.explanation || '', source: q.source || '' });
const toApi = (q) => ({ prompt: q.prompt, options: q.optionsText.split('\n').map((o) => o.trim()).filter(Boolean), correctIndex: q.correctIndex, explanation: q.explanation, source: q.source });

export default function QuizEditor({ lessonId }) {
  const [qs, setQs] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi.quiz(lessonId).then(({ questions }) => setQs(questions.map(toForm))).catch((e) => setError(e.message));
  }, [lessonId]);

  if (!qs) return error ? <p className="state error">{error}</p> : null;

  const update = (i, patch) => { setQs(qs.map((q, j) => (j === i ? { ...q, ...patch } : q))); setMsg(''); };

  async function save() {
    setBusy(true); setError(''); setMsg('');
    try {
      if (qs.length === 0) await adminApi.deleteQuiz(lessonId);
      else await adminApi.saveQuiz(lessonId, qs.map(toApi));
      setMsg(qs.length === 0 ? 'تم حذف الكويز ✓' : 'تم حفظ الكويز ✓');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="quiz-editor">
      <h2>كويز الدرس</h2>
      <p className="muted">خيار في كل سطر (من 2 إلى 6). يظهر الكويز للطلاب فقط عندما يكون الدرس منشوراً.</p>

      {qs.map((q, i) => {
        const optionCount = Math.max(2, q.optionsText.split('\n').filter((o) => o.trim()).length);
        return (
          <div className="qcard" key={i}>
            <div className="admin-head">
              <strong>سؤال {i + 1}</strong>
              <button className="linklike" onClick={() => { setQs(qs.filter((_, j) => j !== i)); setMsg(''); }}>حذف السؤال</button>
            </div>
            <label className="field">نص السؤال
              <input value={q.prompt} onChange={(e) => update(i, { prompt: e.target.value })} />
            </label>
            <label className="field">الخيارات
              <textarea rows={4} value={q.optionsText} onChange={(e) => update(i, { optionsText: e.target.value })} />
            </label>
            <label className="field">رقم الإجابة الصحيحة
              <select value={Math.min(q.correctIndex, optionCount - 1)} onChange={(e) => update(i, { correctIndex: Number(e.target.value) })}>
                {Array.from({ length: optionCount }, (_, k) => <option key={k} value={k}>{k + 1}</option>)}
              </select>
            </label>
            <label className="field">شرح الإجابة
              <input value={q.explanation} onChange={(e) => update(i, { explanation: e.target.value })} />
            </label>
            <label className="field">رقم الصفحة في الكتاب (مطلوب، مثل: ص 64)
              <input value={q.source} onChange={(e) => update(i, { source: e.target.value })} maxLength={100} />
            </label>
          </div>
        );
      })}

      {error && <p className="state error">{error}</p>}
      {msg && <p className="state ok">{msg}</p>}

      <div className="actions">
        <button className="btn ghost" onClick={() => setQs([...qs, blank()])} disabled={qs.length >= 30}>+ إضافة سؤال</button>
        <button className="btn" onClick={save} disabled={busy}>حفظ الكويز</button>
      </div>
    </section>
  );
}
