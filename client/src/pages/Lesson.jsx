import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useProgress } from '../ProgressContext.jsx';
import { useFetch } from '../useFetch.js';
import { Loading, ErrorBox } from '../components/State.jsx';
import Markdown from '../components/Markdown.jsx';
import Quiz from '../components/Quiz.jsx';
import AdSlot from '../components/AdSlot.jsx';
import LessonSidebar from '../components/LessonSidebar.jsx';
import { toolsForLesson } from '../tools/registry.js';
import '../bank.css';

export default function Lesson() {
  const { stageSlug, lessonSlug } = useParams();
  const { user } = useAuth();
  const { ids, setDone } = useProgress();
  const location = useLocation();
  const { data, loading, error } = useFetch(() => api.lesson(stageSlug, lessonSlug), [stageSlug, lessonSlug]);
  const [busy, setBusy] = useState(false);
  const [outline, setOutline] = useState([]);
  const [activeSec, setActiveSec] = useState('');
  const proseRef = useRef(null);
  const lessonId = data?.lesson._id;
  const done = lessonId ? ids.has(String(lessonId)) : false;
  const content = data?.lesson.content;

  // «في هذا الدرس»: نقرأ العناوين من المحتوى المعروض (دون تغيير نص الدرس) ونعطيها معرّفات للقفز إليها
  useEffect(() => {
    setOutline([]); setActiveSec('');
    const root = proseRef.current;
    if (!root) return undefined;
    const h3 = [...root.querySelectorAll('h3')];
    const heads = h3.length ? h3 : [...root.querySelectorAll('h2')];
    heads.forEach((h, i) => { h.id = `sec-${i}`; });
    setOutline(heads.map((h, i) => ({ id: `sec-${i}`, text: h.textContent })));
    if (!('IntersectionObserver' in window) || heads.length < 2) return undefined;
    const io = new IntersectionObserver((entries) => {
      const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (seen) setActiveSec(seen.target.id);
    }, { rootMargin: '-80px 0px -65% 0px' });
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [lessonId, content]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const { stage, unit, lesson, prev, next, hasQuiz } = data;
  const base = `/stages/${stage.slug}`;
  const published = lesson.status === 'published';
  // الأدوات تظهر فقط في الدروس المنشورة (أي التي طابقناها بالكتاب)
  const related = published ? toolsForLesson(stage.slug, lesson.slug) : [];

  async function toggleDone() {
    setBusy(true);
    try {
      await (done ? api.uncomplete(lesson._id) : api.complete(lesson._id));
      setDone(lesson._id, !done);
    } catch { /* نتجاهل؛ يمكن إعادة المحاولة */ } finally { setBusy(false); }
  }

  return (
    <div className="lesson-layout">
      <LessonSidebar stageSlug={stage.slug} currentUnitId={unit._id} currentSlug={lesson.slug} />

      <article className="lesson-main">
        <AdSlot position="top" />

        <p className="crumbs">
          <Link to="/">الرئيسية</Link> / <Link to={base}>{stage.title}</Link> / {unit.title}
        </p>
        <h1><span className="lnum">{lesson.number}</span> {lesson.title}</h1>

        {lesson.source && <p className="source-note">المرجع في الكتاب: {lesson.source}</p>}

        {lesson.objectives.length > 0 && (
          <section className="box">
            <h3>أهداف التعلم</h3>
            <ul>{lesson.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
          </section>
        )}

        {published && outline.length > 1 && (
          <nav className="box outline" aria-label="في هذا الدرس">
            <h3>في هذا الدرس</h3>
            <ul>
              {outline.map((o) => (
                <li key={o.id}>
                  <a href={`#${o.id}`} className={activeSec === o.id ? 'on' : ''} onClick={(e) => { e.preventDefault(); document.getElementById(o.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{o.text}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {published ? <Markdown ref={proseRef}>{lesson.content}</Markdown> : <p className="state">شرح هذا الدرس قيد الإعداد وسيُنشر قريباً.</p>}

        {related.length > 0 && (
          <section className="box">
            <h3>جرّب بنفسك</h3>
            <ul>{related.map((t) => <li key={t.slug}><Link to={`/tools/${t.slug}`}>{t.title}</Link> — {t.description}</li>)}</ul>
          </section>
        )}

        <AdSlot position="inline" />

        {hasQuiz && <Quiz lessonId={lesson._id} onPassed={() => setDone(lesson._id, true)} />}

        {published && stage.slug === 'grade-1' && unit.number >= 1 && unit.number <= 7 && (
          <aside className="bk-lesson-link">
            <span className="bk-le" aria-hidden="true">🎯</span>
            <div><strong>تدرّب أكتر على هذا الدرس</strong><span className="sub">أسئلة بنمط الامتحان مع شرح فوري ورسائل تشجيع</span></div>
            <Link className="btn" to={`/bank/unit/${unit.number}?lesson=${lesson.slug}`}>افتح بنك الأسئلة</Link>
          </aside>
        )}

        {published && (
          <div className="complete">
            {user ? (
              <button className={`btn ${done ? 'ghost' : ''}`} disabled={busy} onClick={toggleDone}>
                {done ? '✓ أكملت هذا الدرس (اضغط للتراجع)' : 'تم، أكملت هذا الدرس'}
              </button>
            ) : (
              <p className="muted"><Link to="/login" state={{ from: location.pathname }}>سجّل دخولك</Link> لتتبع الدروس التي أكملتها.</p>
            )}
          </div>
        )}

        <nav className="pager">
          {prev ? <Link to={`${base}/lessons/${prev.slug}`}>→ {prev.title}</Link> : <span />}
          {next ? <Link to={`${base}/lessons/${next.slug}`}>{next.title} ←</Link> : <span />}
        </nav>
      </article>

      <aside className="lesson-ad" aria-label="إعلان جانبي"><AdSlot position="side" /></aside>
    </div>
  );
}
