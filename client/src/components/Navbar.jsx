import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { COLORS, useTheme } from '../theme.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { mode, color, setColor, toggleMode } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="مسار – الرئيسية">
          <img src="/brand/logo-sm.png" alt="مسار" width="64" height="41" />
          <span>منصة التعلم الذاتي</span>
        </Link>
        <nav>
          <NavLink to="/" end>الرئيسية</NavLink>
          <NavLink to="/stages/grade-1">الصف الأول</NavLink>
          <NavLink to="/stages/grade-2">الصف الثاني</NavLink>
          <NavLink to="/bank">بنك الأسئلة</NavLink>
          <NavLink to="/tools">الأدوات</NavLink>
        </nav>
        <div className="theme-switchers" role="group" aria-label="إعدادات المظهر">
          <button type="button" className="theme-icon" onClick={toggleMode} aria-label={mode === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'} title={mode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}>
            {mode === 'dark' ? '☀' : '☾'}
          </button>
          <button type="button" className="theme-icon palette-toggle" onClick={() => setPaletteOpen((o) => !o)} aria-label="اختيار لون المنصة" aria-expanded={paletteOpen} title="لون المنصة">🎨</button>
          <div className={`theme-colors${paletteOpen ? ' open' : ''}`}>
            {COLORS.map((c) => (
              <button key={c.id} type="button" className={`theme-btn ${c.id}${color === c.id ? ' active' : ''}`} onClick={() => { setColor(c.id); setPaletteOpen(false); }} aria-label={c.label} aria-pressed={color === c.id} title={c.label} />
            ))}
          </div>
        </div>
        <nav className="account">
          {user ? (
            <>
              <NavLink to="/me">تقدّمي</NavLink>
              {user.role === 'admin' && <NavLink to="/admin">لوحة التحكم</NavLink>}
              <button className="linklike" onClick={() => { logout(); navigate('/'); }}>خروج</button>
            </>
          ) : (
            <>
              <NavLink to="/login">دخول</NavLink>
              <Link className="btn small" to="/register">حساب جديد</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
