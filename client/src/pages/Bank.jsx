import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useFetch } from '../useFetch.js';
import { Loading, ErrorBox } from '../components/State.jsx';
import BankPay from '../components/BankPay.jsx';
import { rankOf } from '../data/bankMessages.js';
import '../bank.css';

const Decoy = () => (
  <div className="bk-decoy" aria-hidden="true"><i style={{ width: '92%' }} /><i style={{ width: '70%' }} /><i style={{ width: '81%' }} /></div>
);

export default function Bank() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const { data, loading, error } = useFetch(api.bank, [user?.id, tick]);
  const [payOpen, setPayOpen] = useState(false);
  const payRef = useRef(null);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const { units, me, price, salesOpen, paid } = data;
  const locked = units.filter((u) => !u.unlocked);
  const lockedReady = locked.filter((u) => u.ready);
  const rank = rankOf(me?.xp);
  const openPay = () => { setPayOpen(true); setTimeout(() => payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); };

  return (
    <div className="bk-page">
      <h1>بنك أسئلة الترم الأول</h1>
      <p className="bk-sub">أسئلة بنمط الامتحان مع شرح فوري لكل إجابة. الوحدة الأولى مجانًا للتجربة.</p>

      {me ? (
        <div className="bk-me">
          <span className="bk-rank-e" aria-hidden="true">{rank.e}</span>
          <strong>{rank.title}</strong>
          <span className="bk-streak">🔥 {me.streakDays}<small>{me.streakDays === 1 ? 'يوم متواصل' : 'أيام متواصلة'}</small></span>
          <div className="bk-prog">
            <div className="bk-xp" role="progressbar" aria-valuenow={rank.progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${rank.progress}%` }} /></div>
            <small>{me.xp} نقطة{rank.next ? ` · فاضل ${rank.toNext} ونبقى ${rank.next.title} ${rank.next.e}` : ' · وصلت لأعلى لقب!'}</small>
          </div>
        </div>
      ) : (
        <div className="bk-guest">🏅 <Link to="/register">سجّل حساب</Link> أو <Link to="/login">ادخل</Link> عشان نحفظ نتايجك ونحسبلك النقاط والألقاب وأيام التزامك.</div>
      )}

      <div className="bk-units">
        {units.map((u) => {
          const best = me?.best?.[u.number];
          const meta = u.ready ? `${u.questionCount} سؤال · ${u.objectiveCount} موضوعي و${u.essayCount} مقالي` : 'بيتجهّز دلوقتي';
          const head = (
            <>
              <span className="bk-num">{u.number}</span>
              <h3>{u.title}</h3>
              <span className="bk-meta">{meta}</span>
              <span className="bk-side">
                {u.free && <span className="bk-tag free">مجانية</span>}
                {u.unlocked && u.ready && best && <span className="bk-ring" style={{ '--p': best.percent }}><span>{best.percent}%</span></span>}
                {u.unlocked && u.ready && best?.partial && <span className="bk-meta">جزء من الوحدة</span>}
                {u.unlocked && u.ready && !best && <span className="bk-tag">ابدأ ←</span>}
                {!u.unlocked && <span className="bk-tag">{u.ready ? '🔒 مدفوعة' : 'قريبًا'}</span>}
              </span>
            </>
          );
          if (u.unlocked && u.ready) return <Link key={u.number} to={`/bank/unit/${u.number}`} className="bk-unit open">{head}</Link>;
          return (
            <div key={u.number} className={`bk-unit locked${u.ready ? '' : ' soon'}`} onClick={u.ready && salesOpen ? openPay : undefined} style={u.ready && salesOpen ? { cursor: 'pointer' } : undefined}>
              {head}{u.ready && <Decoy />}
            </div>
          );
        })}
      </div>

      {!paid && locked.length > 0 && (
        <section className="bk-pay" ref={payRef} aria-labelledby="bk-pay-h">
          <h2 id="bk-pay-h">{salesOpen && lockedReady.length ? 'افتح باقي وحدات الترم' : 'باقي الوحدات جاية قريبًا'}</h2>
          <p style={{ margin: 0, opacity: .95 }}>{salesOpen && lockedReady.length ? `وحدات ${lockedReady.map((u) => u.number).join('، ')} بنفس أسلوب الوحدة الأولى.` : 'بنكتب باقي الأسئلة وبنراجعها بعناية. أول ما تجهز هتلاقي الاشتراك هنا.'}</p>
          <ul>
            <li>أسئلة اختيار وصح/خطأ ومقالي بنمط الامتحان</li>
            <li>شرح لكل إجابة مع رقم الصفحة في الكتاب</li>
            <li>نقاط وألقاب وتتبّع لأخطائك</li>
          </ul>
          {salesOpen && lockedReady.length > 0 && (
            <>
              <div className="bk-price"><b>{price}</b><span>جنيه، مرة واحدة تفتح كل الوحدات</span></div>
              {!payOpen && <button type="button" className="bk-cta" onClick={openPay}>افتح البنك دلوقتي</button>}
              {payOpen && <BankPay price={price} onChanged={() => setTick((t) => t + 1)} />}
            </>
          )}
        </section>
      )}
      {paid && <p className="bk-note" style={{ marginTop: 18 }}>✅ اشتراكك مفعّل. كل الوحدات المتاحة مفتوحة لك.</p>}
    </div>
  );
}
