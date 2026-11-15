import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { ErrorBox } from './State.jsx';

// يعرض المحتوى لحسابات الإدارة فقط
export default function AdminGate({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="state">جارٍ التحقق…</p>;
  if (!user) {
    return (
      <div className="state">
        <p>سجّل الدخول بحساب الإدارة للمتابعة.</p>
        <Link className="btn" to="/login" state={{ from: location.pathname }}>دخول</Link>
      </div>
    );
  }
  if (user.role !== 'admin') return <ErrorBox message="هذه الصفحة للإدارة فقط" />;
  return children;
}
