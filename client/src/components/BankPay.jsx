import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

// نموذج الدفع اليدوي عبر إنستاباي: الطالب يحوّل ثم يرسل رقم العملية، والأدمن يوافق فيُفتح البنك.
export default function BankPay({ price, onChanged }) {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [mine, setMine] = useState(null);
  const [form, setForm] = useState({ reference: '', payerName: user?.name || '', payerPhone: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.bankPayInfo().then(setInfo).catch(() => {});
    if (user) api.bankMyPayment().then(setMine).catch(() => {});
  }, [user?.id]);

  if (!user) {
    return (
      <div className="bk-form">
        <p style={{ margin: 0, fontWeight: 700 }}>سجّل دخولك الأول عشان نربط الاشتراك بحسابك.</p>
        <Link className="btn" to="/login" style={{ justifyContent: 'center' }}>تسجيل الدخول</Link>
        <Link to="/register" style={{ textAlign: 'center' }}>معنديش حساب؟ سجّل دلوقتي</Link>
      </div>
    );
  }

  if (mine?.status === 'pending') {
    return <div className="bk-form"><p className="bk-note">⏳ طلبك (رقم العملية {mine.reference}) قيد المراجعة. هيتفعّل البنك أول ما نتأكد من التحويل، وغالبًا خلال ساعات.</p></div>;
  }

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await api.bankPay(form);
      setMine({ status: 'pending', reference: form.reference.toUpperCase() });
      onChanged?.();
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const copy = async () => { try { await navigator.clipboard.writeText(info.account); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* غير متاح */ } };

  return (
    <form className="bk-form" onSubmit={submit}>
      {mine?.status === 'rejected' && <p className="bk-note err">تعذّر قبول طلبك السابق{mine.note ? `: ${mine.note}` : ''}. تأكد من رقم العملية وأرسل طلبًا جديدًا.</p>}
      <ol>
        <li>حوّل <b>{price} جنيه</b> على رقم المحفظة / إنستاباي ده (نفس الرقم):</li>
        <li>خد <b>رقم العملية</b> من رسالة أو إشعار التحويل.</li>
        <li>اكتبه هنا وابعت الطلب.</li>
      </ol>
      {info?.account
        ? <div className="bk-acct"><span>{info.account}</span><button type="button" onClick={copy}>{copied ? 'تم النسخ ✓' : 'نسخ'}</button></div>
        : <p className="bk-note">بيانات الحساب هتظهر هنا قريبًا.</p>}
      {info?.accountName && <p className="muted" style={{ margin: 0 }}>اسم الحساب: {info.accountName}</p>}
      <label>رقم العملية<input value={form.reference} onChange={set('reference')} required minLength={6} maxLength={40} inputMode="text" autoComplete="off" /></label>
      <label>اسم صاحب التحويل<input value={form.payerName} onChange={set('payerName')} required minLength={2} maxLength={60} /></label>
      <label>رقم الهاتف (اختياري)<input value={form.payerPhone} onChange={set('payerPhone')} inputMode="tel" maxLength={16} /></label>
      {err && <p className="bk-note err" role="alert">{err}</p>}
      <button className="btn" disabled={busy} style={{ justifyContent: 'center', margin: 0, alignSelf: 'stretch' }}>{busy ? 'جارٍ الإرسال…' : 'ابعت طلب التفعيل'}</button>
    </form>
  );
}
