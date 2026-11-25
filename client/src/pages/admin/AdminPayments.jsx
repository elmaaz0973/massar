import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminGate from '../../components/AdminGate.jsx';
import { Loading, ErrorBox } from '../../components/State.jsx';
import { adminApi } from '../../adminApi.js';
import { useFetch } from '../../useFetch.js';

function List() {
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState('');
  const { data, loading, error } = useFetch(() => adminApi.bankPayments('pending'), [tick]);
  async function review(id, action) {
    setMsg('');
    try { await adminApi.bankReview(id, action); setTick((t) => t + 1); } catch (e) { setMsg(e.message); }
  }
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  return (
    <>
      <div className="admin-head"><h1>طلبات الدفع</h1><Link className="btn ghost" to="/admin">رجوع</Link></div>
      <p className="muted">تأكد من وصول المبلغ في تطبيق البنك ومطابقة رقم العملية قبل القبول.</p>
      {msg && <p className="state error">{msg}</p>}
      {data.length === 0 && <p className="state">لا توجد طلبات قيد المراجعة.</p>}
      {data.map((p) => (
        <div key={p.id} className="box">
          <b>{p.user?.name || '—'}</b> · {p.user?.email}<br />
          المبلغ: {p.amount} جنيه · رقم العملية: <b dir="ltr">{p.reference}</b><br />
          صاحب التحويل: {p.payerName}{p.payerPhone ? ` · ${p.payerPhone}` : ''} · <span className="muted">{new Date(p.createdAt).toLocaleString('ar-EG')}</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn" onClick={() => review(p.id, 'approve')}>قبول وفتح البنك</button>
            <button className="btn ghost" onClick={() => review(p.id, 'reject')}>رفض</button>
          </div>
        </div>
      ))}
    </>
  );
}

export default function AdminPayments() { return <AdminGate><List /></AdminGate>; }
