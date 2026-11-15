import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Auth({ mode }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/me';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="login" onSubmit={submit}>
      <h1>{isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h1>
      {isRegister && (
        <label className="field">الاسم
          <input value={form.name} onChange={set('name')} autoComplete="name" required minLength={2} maxLength={60} />
        </label>
      )}
      <label className="field">البريد الإلكتروني
        <input type="email" dir="ltr" value={form.email} onChange={set('email')} autoComplete="email" required />
      </label>
      <label className="field">كلمة المرور
        <input type="password" dir="ltr" value={form.password} onChange={set('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 8 : undefined} />
        {isRegister && <small className="muted">8 أحرف على الأقل</small>}
      </label>
      {error && <p className="state error">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'لحظة…' : isRegister ? 'إنشاء الحساب' : 'دخول'}</button>
      <p className="muted">
        {isRegister ? <>لديك حساب؟ <Link to="/login" state={location.state}>سجّل الدخول</Link></> : <>ليس لديك حساب؟ <Link to="/register" state={location.state}>أنشئ حساباً</Link></>}
      </p>
    </form>
  );
}
