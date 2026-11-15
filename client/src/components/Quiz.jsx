import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useFetch } from '../useFetch.js';

export default function Quiz({ lessonId, onPassed }) {
  const { user } = useAuth();
  const { data, loading, error } = useFetch(() => api.quiz(lessonId), [lessonId]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (loading || error || !data) return null; // لا يظهر شيء إن لم يوجد كويز

  const { questions } = data;
  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  async function submit() {
    setSubmitting(true); setSubmitError('');
    try {
      const res = await api.submitQuiz(lessonId, questions.map((_, i) => answers[i]));
      setResult(res);
      if (res.passed && res.saved) onPassed?.();
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="quiz">
      <h2>تحقق من فهمك</h2>

      {questions.map((q, i) => {
        const r = result?.results[i];
        return (
          <fieldset key={i} className="q" disabled={Boolean(result)}>
            <legend><span className="lnum">{i + 1}</span> {q.prompt}</legend>
            {q.options.map((opt, j) => {
              const cls = r ? (j === r.correctIndex ? 'right' : j === r.chosen ? 'wrong' : '') : '';
              return (
                <label key={j} className={`opt ${cls}`}>
                  <input type="radio" name={`q${i}`} checked={answers[i] === j} onChange={() => setAnswers({ ...answers, [i]: j })} />
                  <span>{opt}</span>
                </label>
              );
            })}
            {r && (
              <p className={`feedback ${r.correct ? 'ok' : 'bad'}`}>
                {r.correct ? 'إجابة صحيحة. ' : 'إجابة غير صحيحة. '}{r.explanation}{r.source && <span className="source-note"> (راجع {r.source} من الكتاب)</span>}
              </p>
            )}
          </fieldset>
        );
      })}

      {submitError && <p className="state error">{submitError}</p>}

      {!result ? (
        <button className="btn" disabled={!allAnswered || submitting} onClick={submit}>
          {submitting ? 'جارٍ التصحيح…' : 'تصحيح الإجابات'}
        </button>
      ) : (
        <div className={`box result ${result.passed ? 'pass' : ''}`}>
          <h3>نتيجتك: {result.score} من {result.total} ({result.percent}%)</h3>
          <p>
            {result.passed ? 'أحسنت! اجتزت الكويز.' : `تحتاج ${Math.round(result.passRatio * 100)}% على الأقل للنجاح. راجع الدرس وحاول مرة أخرى.`}
          </p>
          {result.saved
            ? <p className="muted">تم حفظ نتيجتك في سجل تقدّمك.</p>
            : <p className="muted"><Link to="/login">سجّل دخولك</Link> لحفظ نتيجتك وتتبع تقدّمك.</p>}
          <button className="btn ghost" onClick={() => { setResult(null); setAnswers({}); }}>إعادة المحاولة</button>
        </div>
      )}
    </section>
  );
}
