import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useProgress } from '../ProgressContext.jsx';

// كاش بسيط: لا نعيد طلب هيكل المرحلة مع كل تنقل بين الدروس
const cache = new Map();
function useStageUnits(stageSlug) {
  const [data, setData] = useState(cache.get(stageSlug) || null);
  useEffect(() => {
    if (cache.has(stageSlug)) { setData(cache.get(stageSlug)); return undefined; }
    let alive = true;
    api.stage(stageSlug).then((d) => { cache.set(stageSlug, d); if (alive) setData(d); }).catch(() => {});
    return () => { alive = false; };
  }, [stageSlug]);
  return data;
}

const Check = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

function Items({ stageSlug, lessons, currentSlug, ids }) {
  return (
    <ol className="toc-list">
      {lessons.map((l) => {
        const published = l.status === 'published';
        const done = ids.has(String(l._id));
        const active = l.slug === currentSlug;
        return (
          <li key={l._id} className={`toc-item${active ? ' active' : ''}${published ? '' : ' draft'}${done ? ' done' : ''}`}>
            <span className="toc-dot" role="img" aria-label={done ? 'مكتمل' : 'غير مكتمل'}>{done && <Check />}</span>
            <Link to={`/stages/${stageSlug}/lessons/${l.slug}`} aria-current={active ? 'page' : undefined}>
              <span className="toc-num">{l.number}</span> {l.title}
              {!published && <small>قيد الإعداد</small>}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export default function LessonSidebar({ stageSlug, currentUnitId, currentSlug }) {
  const data = useStageUnits(stageSlug);
  const { user } = useAuth();
  const { ids } = useProgress();
  const [allUnits, setAllUnits] = useState(false);
  const [open, setOpen] = useState(false); // للشاشات الصغيرة فقط
  const box = useRef(null);

  const units = data?.units ?? [];
  const current = units.find((u) => String(u._id) === String(currentUnitId));
  const published = current ? current.lessons.filter((l) => l.status === 'published') : [];
  const doneCount = published.filter((l) => ids.has(String(l._id))).length;
  const pct = published.length ? Math.round((doneCount / published.length) * 100) : 0;

  // نُمرّر الدرس الحالي إلى منتصف القائمة داخلها فقط (دون تحريك الصفحة)
  useEffect(() => {
    const el = box.current?.querySelector('[aria-current="page"]');
    if (el && box.current) box.current.scrollTop = el.offsetTop - box.current.clientHeight / 2 + el.clientHeight / 2;
  }, [data, currentSlug, allUnits, open]);

  // أغلق الدرج في الموبايل عند الانتقال لدرس آخر
  useEffect(() => { setOpen(false); }, [currentSlug]);

  if (!current) return <aside className="lesson-toc" aria-label="فهرس الوحدة" />;

  return (
    <aside className={`lesson-toc${open ? ' open' : ''}`} aria-label="فهرس الوحدة">
      <button type="button" className="toc-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>فهرس الوحدة</span>
        <span className="toc-toggle-info">{user ? `${doneCount}/${published.length}` : `${current.lessons.length} دروس`} {open ? '▴' : '▾'}</span>
      </button>

      <div className="toc-body">
        <div className="toc-head">
          <h2>{allUnits ? 'كل الوحدات' : current.title}</h2>
          {user && published.length > 0 && (
            <>
              <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
              <p className="muted toc-count">أكملت {doneCount} من {published.length} درساً</p>
            </>
          )}
          {!user && <p className="muted toc-count"><Link to="/login">سجّل دخولك</Link> لتتبع الدروس التي أكملتها.</p>}
          <div className="toc-mode" role="group" aria-label="نطاق الفهرس">
            <button type="button" className={!allUnits ? 'on' : ''} aria-pressed={!allUnits} onClick={() => setAllUnits(false)}>وحدة واحدة</button>
            <button type="button" className={allUnits ? 'on' : ''} aria-pressed={allUnits} onClick={() => setAllUnits(true)}>كل الوحدات</button>
          </div>
        </div>

        <div className="toc-scroll" ref={box}>
          {!allUnits && <Items stageSlug={stageSlug} lessons={current.lessons} currentSlug={currentSlug} ids={ids} />}
          {allUnits && units.map((u) => (
            <details key={u._id} className="toc-unit" open={String(u._id) === String(currentUnitId)}>
              <summary><span className="num">{u.number}</span> {u.title}</summary>
              <Items stageSlug={stageSlug} lessons={u.lessons} currentSlug={currentSlug} ids={ids} />
            </details>
          ))}
        </div>
      </div>
    </aside>
  );
}
