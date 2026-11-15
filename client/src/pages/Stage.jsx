import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useFetch } from '../useFetch.js';
import { Loading, ErrorBox } from '../components/State.jsx';
import CurriculumMap from '../components/CurriculumMap.jsx';
import { termOfUnit } from '../data/curriculum.js';

const TERMS = { 1: 'الترم الأول', 2: 'الترم الثاني' };

export default function Stage() {
  const { stageSlug } = useParams();
  const { user } = useAuth();
  const { data, loading, error } = useFetch(() => api.stage(stageSlug), [stageSlug]);
  const prog = useFetch(() => (user ? api.progress() : Promise.resolve(null)), [user?.id]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const { stage, units } = data;
  const terms = [...new Set(units.map((u) => termOfUnit(stage.slug, u)))].sort();
  const doneIds = new Set((prog.data?.completed ?? []).map((c) => c.lessonId));
  const published = units.flatMap((u) => u.lessons).filter((l) => l.status === 'published');
  const doneCount = published.filter((l) => doneIds.has(String(l._id))).length;
  const pct = published.length ? Math.round((doneCount / published.length) * 100) : 0;

  return (
    <>
      <p className="crumbs"><Link to="/">الرئيسية</Link> / {stage.title}</p>
      <h1>{stage.title}</h1>
      <p className="subject">{stage.subject}</p>

      {user && published.length > 0 && (
        <div className="box">
          <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
          <p className="muted">أكملت {doneCount} من {published.length} درساً منشوراً</p>
        </div>
      )}

      {stage.comingSoon && <p className="state">محتوى هذه المرحلة قيد الإعداد وسيُضاف قريباً.</p>}

      <CurriculumMap stage={stage} units={units} />

      {terms.map((t) => (
        <section key={t}>
          <h2 className="term">{TERMS[t]}</h2>
          {units.filter((u) => termOfUnit(stage.slug, u) === t).map((u) => (
            <details key={u._id} id={`unit-${u.number}`} className="unit" open>
              <summary><span className="num">{u.number}</span> {u.title}</summary>
              <ul className="lessons">
                {u.lessons.map((l) => (
                  <li key={l._id}>
                    <Link to={`/stages/${stage.slug}/lessons/${l.slug}`}>
                      <span className="lnum">{l.number}</span> {l.title}
                    </Link>
                    {doneIds.has(String(l._id)) && <span className="done" title="مكتمل">✓</span>}
                    {l.status !== 'published' && <span className="badge soft">قيد الإعداد</span>}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </section>
      ))}
    </>
  );
}
