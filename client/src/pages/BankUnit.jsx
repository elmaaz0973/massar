import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useFetch } from '../useFetch.js';
import { Loading, ErrorBox } from '../components/State.jsx';
import Confetti from '../components/Confetti.jsx';
import Bi from '../components/Bidi.jsx';
import { messageFor, essayMessage, finishMessage, rankOf, leftMessage } from '../data/bankMessages.js';
import '../bank.css';

const LETTERS = ['أ', 'ب', 'ج', 'د'];
const TYPE = { mcq: 'اختيار من متعدد', tf: 'صح / خطأ', essay: 'مقالي' };
const COMBO_BONUS = { 3: 5, 5: 5, 7: 10, 10: 15 };
function splitModel(text) {
  const parts = text.split('|').map((x) => x.trim()).filter(Boolean);
  let marking = '';
  const last = parts.length - 1;
  const m = parts[last]?.match(/\s*\((درج[^)]*)\)\s*$/);
  if (m) { marking = m[1]; parts[last] = parts[last].replace(m[0], '').trim(); }
  return { items: parts, marking };
}
// حفظ مكان الطالب في الجزء الذي يحلّه (في متصفحه فقط) كي يكمل لاحقاً من حيث وقف
const storeKey = (uid, n, lesson) => `masar:bank:${uid || 'guest'}:${n}:${lesson || 'all'}`;
const readSaved = (k) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v && typeof v === 'object' ? v : null; } catch { return null; } };
const writeSaved = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ممتلئ/ممنوع */ } };
const clearSaved = (k) => { try { localStorage.removeItem(k); } catch { /* لا شيء */ } };
const buzz = (ms) => { try { navigator.vibrate?.(ms); } catch { /* غير مدعوم */ } };

export default function BankUnit() {
  const { n } = useParams();
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const [state, setState] = useState({ loading: true });
  const [run, setRun] = useState(0);
  const [part, setPart] = useState(undefined);   // undefined: لم يُختر بعد | '' : الوحدة كاملة | slug: درس بعينه

  useEffect(() => {
    let alive = true;
    setState({ loading: true }); setPart(undefined);
    api.bankUnit(n)
      .then((d) => {
        if (!alive) return;
        const want = sp.get('lesson');
        setState({ data: d });
        setPart(d.lessons.some((l) => l.slug === want) ? want : d.lessons.length > 1 ? undefined : '');
      })
      .catch((e) => alive && setState({ error: e.message, status: e.status }));
    return () => { alive = false; };
  }, [n, user?.id]);

  if (state.loading) return <Loading />;
  if (state.error) {
    return (
      <div className="bk-page">
        <ErrorBox message={state.error} />
        <p style={{ textAlign: 'center' }}>
          {state.status === 401 && <><Link className="btn" to="/login">تسجيل الدخول</Link>{' '}</>}
          <Link className="btn ghost" to="/bank">رجوع لبنك الأسئلة</Link>
        </p>
      </div>
    );
  }
  const d = state.data;
  if (part === undefined) return <Intro unit={d.unit} lessons={d.lessons} total={d.questions.length} uid={user?.id} onPick={setPart} />;
  const qs = part ? d.questions.filter((x) => x.lesson === part) : d.questions;
  const i = d.lessons.findIndex((l) => l.slug === part);
  return (
    <Arena
      key={`${part}-${run}`} unit={d.unit} lesson={part} lessonMeta={d.lessons[i]} multi={d.lessons.length > 1}
      nextLesson={part && d.lessons[i + 1] ? d.lessons[i + 1] : null} questions={qs}
      onRestart={() => setRun((r) => r + 1)} onBack={() => setPart(undefined)} onPick={setPart}
    />
  );
}

// شاشة اختيار الجزء: الوحدة كاملة أو درساً درساً (مفيدة للوحدات الطويلة كالوحدة 6)
function Intro({ unit, lessons, total, uid, onPick }) {
  const { data: hub } = useFetch(api.bank, [uid]);
  const me = hub?.me;
  const saved = (slug) => { const s = readSaved(storeKey(uid, unit.number, slug)); return s ? Object.keys(s.answers || {}).length + Object.keys(s.essays || {}).length : 0; };
  const ring = (r) => r && <span className="bk-ring" style={{ '--p': r.percent }}><span>{r.percent}%</span></span>;
  const whole = me?.best?.[unit.number];
  return (
    <div className="bk-page">
      <p className="crumbs"><Link to="/bank">بنك الأسئلة</Link> / الوحدة {unit.number}</p>
      <h1>الوحدة {unit.number}: {unit.title}</h1>
      <p className="bk-sub">اختار الدرس اللي عايز تتدرب عليه، أو حلّ الوحدة كاملة. تقدّمك بيتحفظ وتقدر تكمّل من حيث وقفت.</p>
      <div className="bk-units bk-parts">
        <button type="button" className="bk-unit open bk-part" onClick={() => onPick('')}>
          <span className="bk-num">★</span>
          <h3>الوحدة كاملة</h3>
          <span className="bk-meta">{total} سؤال في جلسة واحدة{saved('') > 0 ? ` · ▶ تقدّم محفوظ (${saved('')})` : ''}</span>
          <span className="bk-side">{whole && !whole.partial ? ring(whole) : <span className="bk-tag">ابدأ ←</span>}</span>
        </button>
        {lessons.map((l) => (
          <button key={l.slug} type="button" className="bk-unit open bk-part" onClick={() => onPick(l.slug)}>
            <span className="bk-num bk-num-s">{l.slug.replace('lesson-', '')}</span>
            <h3>{l.title}</h3>
            <span className="bk-meta">{l.count} سؤال · {l.objectiveCount} موضوعي و{l.count - l.objectiveCount} مقالي{saved(l.slug) > 0 ? ` · ▶ تقدّم محفوظ (${saved(l.slug)})` : ''}</span>
            <span className="bk-side">{me?.lessons?.[l.slug] ? ring(me.lessons[l.slug]) : <span className="bk-tag">ابدأ ←</span>}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Arena({ unit, lesson, lessonMeta, multi, nextLesson, questions, onRestart, onBack, onPick }) {
  const { user } = useAuth();
  const n = unit.number;
  const key = storeKey(user?.id, n, lesson);
  const [init] = useState(() => {                    // استعادة تقدّم محفوظ (مع تجاهل أسئلة لم تعد موجودة)
    const sv = readSaved(key); if (!sv) return null;
    const ids = new Set(questions.map((x) => x.id));
    const keep = (o) => Object.fromEntries(Object.entries(o || {}).filter(([id]) => ids.has(id)));
    const answers = keep(sv.answers), essays = keep(sv.essays);
    if (!Object.keys(answers).length && !Object.keys(essays).length) return null;
    return { ...sv, answers, essays, idx: Math.min(Math.max(Number(sv.idx) || 0, 0), questions.length - 1) };
  });
  const [resumed, setResumed] = useState(Boolean(init));
  const [idx, setIdx] = useState(init?.idx ?? 0);
  const [answers, setAnswers] = useState(init?.answers ?? {});      // id -> { choice, res }
  const [essays, setEssays] = useState(init?.essays ?? {});        // id -> { model, rating }
  const [draft, setDraft] = useState('');
  const [combo, setCombo] = useState(init?.combo ?? 0);
  const [bestCombo, setBestCombo] = useState(init?.bestCombo ?? 0);
  const [xp, setXp] = useState(init?.xp ?? 0);
  const [coach, setCoach] = useState(init?.coach ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);
  const lastMsg = useRef('');
  const top = useRef(null);

  const q = questions[idx];
  const done = q && (q.type === 'essay' ? essays[q.id]?.rating : answers[q.id]);
  const hotKey = useRef(0);

  useEffect(() => { top.current?.scrollIntoView({ block: 'start' }); }, [idx, result]);
  useEffect(() => {
    if (result) return;
    if (!Object.keys(answers).length && !Object.keys(essays).length) return;
    writeSaved(key, { idx, answers, essays, combo, bestCombo, xp, coach, ts: Date.now() });
  }, [idx, answers, essays, combo, bestCombo, xp, coach, result]);
  const restart = () => { clearSaved(key); onRestart(); };

  const say = (m) => { lastMsg.current = m.t; return m; };

  async function choose(choice) {
    if (answers[q.id] || busy) return;
    setBusy(true); setErr('');
    try {
      const res = await api.bankCheck(n, q.id, choice);
      const nextCombo = res.correct ? combo + 1 : 0;
      const bonus = res.correct ? COMBO_BONUS[nextCombo] || 0 : 0;
      setAnswers((a) => ({ ...a, [q.id]: { choice, res } }));
      setCombo(nextCombo); setBestCombo((b) => Math.max(b, nextCombo));
      if (res.correct) { hotKey.current++; setXp((x) => x + 10 + bonus); buzz(25); } else buzz([40, 40, 40]);
      setCoach({ ...say(messageFor(res.correct, nextCombo, lastMsg.current)), correct: res.correct, bonus });
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  async function reveal() {
    if (busy) return;
    setBusy(true); setErr('');
    try {
      const r = await api.bankReveal(n, q.id);
      setEssays((s) => ({ ...s, [q.id]: { model: r, rating: null } }));
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  function rate(rating) {
    setEssays((s) => ({ ...s, [q.id]: { ...s[q.id], rating } }));
    setXp((x) => x + (rating === 'good' ? 10 : rating === 'part' ? 5 : 0));
    setCoach({ ...say(essayMessage(rating)), correct: rating !== 'miss', part: rating === 'part' });
  }

  function skipEssay() {
    setEssays((s) => ({ ...s, [q.id]: { model: null, rating: 'miss' } }));
    setCoach(null); setDraft('');
    if (idx < questions.length - 1) setIdx(idx + 1); else finish();
  }

  async function next() {
    setCoach(null); setDraft('');
    if (idx < questions.length - 1) return setIdx(idx + 1);
    finish();
  }

  async function finish() {
    setBusy(true); setErr('');
    try {
      const list = Object.entries(answers).map(([id, a]) => ({ id, choice: a.choice }));
      setResult(await api.bankFinish(n, list, lesson));
      clearSaved(key);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  if (result) return <Result unit={unit} lessonMeta={lessonMeta} multi={multi} nextLesson={nextLesson} questions={questions} answers={answers} essays={essays} result={result} xp={xp} bestCombo={bestCombo} user={user} onRestart={restart} onBack={onBack} onPick={onPick} top={top} />;

  const total = questions.length;
  const a = q.type !== 'essay' ? answers[q.id] : null;
  const e = q.type === 'essay' ? essays[q.id] : null;
  const segClass = (x, i) => {
    const s = x.type === 'essay' ? essays[x.id]?.rating : answers[x.id];
    if (i === idx && !s) return 'cur';
    if (!s) return '';
    return (x.type === 'essay' ? s !== 'miss' : s.res.correct) ? 'ok' : 'bad';
  };

  return (
    <div className="bk-page" ref={top}>
      <p className="crumbs">
        <Link to="/bank">بنك الأسئلة</Link> / {multi ? <button type="button" className="linklike" onClick={onBack}>الوحدة {n}: {unit.title}</button> : <>الوحدة {n}: {unit.title}</>}
        {lessonMeta ? <> / {lessonMeta.title}</> : null}
      </p>

      {resumed && (
        <div className="bk-resume" role="status">
          <span>▶️ كملنا من حيث وقفت.</span>
          <button type="button" className="linklike" onClick={restart}>ابدأ من جديد</button>
          <button type="button" className="bk-x" aria-label="إخفاء" onClick={() => setResumed(false)}>✕</button>
        </div>
      )}

      <div className="bk-hud" aria-label="تقدّمك">
        <div className="bk-hud-row">
          <span>سؤال {idx + 1} من {total}</span>
          <span className={`bk-combo${combo >= 3 ? ' hot' : ''}`} key={hotKey.current}>🔥 {combo}</span>
          <span>⭐ {xp}</span>
        </div>
        <div className="bk-segs" aria-hidden="true">{questions.map((x, i) => <i key={x.id} className={segClass(x, i)} />)}</div>
      </div>

      <section className="bk-q" key={q.id}>
        <div className="bk-chips">
          <span className="badge">{TYPE[q.type]}</span>
          {q.level && <span className="badge">{q.level}</span>}
          {q.type === 'essay' && q.marks ? <span className="badge">{q.marks} درجات</span> : null}
        </div>
        <p className="bk-prompt"><Bi text={q.prompt} /></p>

        {q.type !== 'essay' ? (
          <div className="bk-opts" role="group" aria-label="الخيارات">
            {q.options.map((opt, i) => {
              let cls = '';
              if (a) cls = i === a.res.correctIndex ? 'right' : i === a.choice ? 'wrong' : 'dim';
              return (
                <button key={i} type="button" className={`bk-opt ${cls}`} disabled={Boolean(a) || busy} onClick={() => choose(i)}>
                  <span className="bk-k">{a && i === a.res.correctIndex ? '✓' : a && i === a.choice ? '✕' : LETTERS[i]}</span>
                  <span><Bi text={opt} /></span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bk-essay">
            {!e && (
              <>
                <textarea value={draft} onChange={(ev) => setDraft(ev.target.value)} placeholder="اكتب إجابتك هنا (للتدريب فقط، مش بتتحفظ)…" />
                <button type="button" className="btn" style={{ margin: 0, width: '100%', justifyContent: 'center' }} disabled={busy} onClick={reveal}>اعرض الإجابة النموذجية</button>
                <p style={{ textAlign: 'center', margin: 0 }}><button type="button" className="bk-skip" onClick={skipEssay}>تخطّي السؤال</button></p>
              </>
            )}
            {e?.model && (
              <>
                <div className="bk-model">
                  <b>الإجابة النموذجية:</b>
                  {(() => { const { items, marking } = splitModel(e.model.modelAnswer); return (<><ul>{items.map((x, i) => <li key={i}><Bi text={x} /></li>)}</ul>{marking && <p className="muted" style={{ marginTop: 8 }}>توزيع الدرجات: {marking}</p>}</>); })()}
                </div>
                {!e.rating && (
                  <>
                    <p style={{ margin: '8px 0', fontWeight: 700 }}>قيّم إجابتك بصراحة:</p>
                    <div className="bk-rate">
                      <button type="button" onClick={() => rate('good')}>✅ جاوبت صح</button>
                      <button type="button" onClick={() => rate('part')}>🟡 جزء منها</button>
                      <button type="button" onClick={() => rate('miss')}>🔴 محتاج مراجعة</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {err && <p className="state error" role="alert">{err}</p>}

        <div aria-live="polite">
          {coach && done && (
            <div className={`bk-coach${coach.correct ? (coach.part ? ' part' : '') : ' bad'}`}>
              <span className="bk-e" aria-hidden="true">{coach.e}</span>
              <strong>{coach.t}</strong>
              {a && <p><Bi text={a.res.explanation} /></p>}
              {a?.res.source && <p className="bk-src">راجع {a.res.source} من الكتاب</p>}
              {coach.bonus > 0 && <p className="bk-src">+{coach.bonus} نقطة مكافأة تتابع 🎁</p>}
              <p className="bk-left">{leftMessage(total - idx - 1, total, coach.correct)}</p>
            </div>
          )}
        </div>
      </section>

      {done && (
        <div className="bk-next">
          <button type="button" className="btn" disabled={busy} onClick={next}>{idx < total - 1 ? `السؤال التالي · فاضل ${total - idx - 1}` : busy ? 'جارٍ حساب نتيجتك…' : 'شوف نتيجتك 🏁'}</button>
        </div>
      )}
    </div>
  );
}

function Result({ unit, lessonMeta, multi, nextLesson, questions, answers, essays, result, xp, bestCombo, user, onRestart, onBack, onPick, top }) {
  const { data: hub } = useFetch(api.bank, [user?.id]);
  const msg = finishMessage(result.percent);
  const wrong = questions.filter((q) => q.type !== 'essay' && answers[q.id] && !answers[q.id].res.correct);
  const nextLocked = hub?.units?.find((u) => !u.unlocked && u.ready);
  const rank = rankOf(hub?.me?.xp);

  return (
    <div className="bk-page" ref={top}>
      <Confetti fire={result.percent >= 70} />
      <p className="crumbs"><Link to="/bank">بنك الأسئلة</Link> / الوحدة {unit.number}{lessonMeta ? ` / ${lessonMeta.title}` : ''}</p>
      <div className="bk-result">
        <div className="bk-score" style={{ '--p': result.percent }}><div><b>{result.percent}%</b><small>{result.correct} من {result.total}</small></div></div>
        <div style={{ fontSize: '2.2rem' }} aria-hidden="true">{msg.e}</div>
        <h2>{msg.t}</h2>
        <p className="muted">{msg.s}</p>
        <div className="bk-stats">
          <span>⭐ {xp} نقطة</span>
          <span>🔥 أطول تتابع {bestCombo}</span>
          {user && hub?.me && <span>{rank.e} {rank.title}</span>}
          {user && hub?.me && rank.next && <span>فاضل {rank.toNext} نقطة وتبقى {rank.next.title} {rank.next.e}</span>}
        </div>
        {result.saved
          ? <p className="muted">تم حفظ نتيجتك في حسابك.</p>
          : <p className="muted"><Link to="/register">سجّل حساب</Link> أو <Link to="/login">ادخل</Link> عشان نحفظ نتيجتك ونحسبلك النقاط.</p>}

        {nextLocked && hub.salesOpen && !hub.paid && (
          <div className="bk-pay" style={{ textAlign: 'start' }}>
            <h2>خلّصت الوحدة {unit.number}، وباقي الترم مستنيك 🔓</h2>
            <p style={{ margin: 0 }}>الوحدات {hub.units.filter((u) => !u.unlocked && u.ready).map((u) => u.number).join('، ')} بنفس الأسلوب، بـ {hub.price} جنيه بس.</p>
            <p style={{ margin: '12px 0 0' }}><Link className="bk-cta" to="/bank" style={{ textDecoration: 'none' }}>افتح باقي الوحدات</Link></p>
          </div>
        )}

        <div className="bk-actions">
          {nextLesson && <button type="button" className="btn" onClick={() => onPick(nextLesson.slug)}>الدرس التالي: {nextLesson.title}</button>}
          <button type="button" className={`btn${nextLesson ? ' ghost' : ''}`} onClick={onRestart}>حاول تاني</button>
          {multi && <button type="button" className="btn ghost" onClick={onBack}>اختيار جزء آخر من الوحدة</button>}
          <Link className="btn ghost" to="/bank">رجوع لبنك الأسئلة</Link>
        </div>

        {wrong.length > 0 && (
          <div className="bk-review">
            <h3 style={{ margin: 0 }}>راجع أخطاءك ({wrong.length})</h3>
            {wrong.map((q) => {
              const a = answers[q.id];
              return (
                <div key={q.id}>
                  <b><Bi text={q.prompt} /></b><br />
                  <span style={{ color: 'var(--danger)' }}>إجابتك: <Bi text={q.options[a.choice]} /></span><br />
                  <span style={{ color: 'var(--ok)' }}>الصحيح: <Bi text={q.options[a.res.correctIndex]} /></span><br />
                  <span className="muted"><Bi text={a.res.explanation} />{a.res.source ? ` (${a.res.source})` : ''}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
