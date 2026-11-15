import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useFetch } from '../useFetch.js';
import { Loading, ErrorBox } from '../components/State.jsx';

export default function Me() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error } = useFetch(
    () => (user ? Promise.all([api.stages(), api.progress()]) : Promise.resolve(null)),
    [user?.id]
  );

  if (authLoading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: '/me' }} replace />;
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const [stages, progress] = data;
  const active = stages.filter((s) => !s.comingSoon);

  return (
    <>
      <h1>أهلاً {user.name}</h1>

      <h2>تقدّمك في المراحل</h2>
      <div className="grid">
        {active.map((s) => {
          const done = progress.completed.filter((c) => c.stageSlug === s.slug).length;
          const pct = s.publishedCount ? Math.min(100, Math.round((done / s.publishedCount) * 100)) : 0;
          return (
            <article key={s._id} className="card">
              <h3>{s.title}</h3>
              <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
              <p className="muted">أكملت {done} من {s.publishedCount} درساً منشوراً</p>
              <Link className="btn" to={`/stages/${s.slug}`}>تابع التعلم</Link>
            </article>
          );
        })}
      </div>

      <h2>نتائج الكويزات</h2>
      {progress.quizBest.length === 0 ? (
        <p className="muted">لم تحلّ أي كويز بعد.</p>
      ) : (
        <ul className="lessons box-list">
          {progress.quizBest.map((q) => (
            <li key={q.lessonId}>
              <Link to={`/stages/${q.stageSlug}/lessons/${q.slug}`}><span className="lnum">{q.number}</span> {q.title}</Link>
              <span className={`badge ${q.percent >= 60 ? '' : 'soft'}`}>أفضل نتيجة {q.percent}%</span>
            </li>
          ))}
        </ul>
      )}

      <h2>آخر الدروس المكتملة</h2>
      {progress.completed.length === 0 ? (
        <p className="muted">ابدأ أول درس لك من إحدى المراحل.</p>
      ) : (
        <ul className="lessons box-list">
          {progress.completed.slice(0, 8).map((c) => (
            <li key={c.lessonId}><Link to={`/stages/${c.stageSlug}/lessons/${c.slug}`}><span className="lnum">{c.number}</span> {c.title}</Link> <span className="done">✓</span></li>
          ))}
        </ul>
      )}
    </>
  );
}
