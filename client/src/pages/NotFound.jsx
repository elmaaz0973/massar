import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="state">
      <h1>الصفحة غير موجودة</h1>
      <Link className="btn" to="/">العودة للرئيسية</Link>
    </div>
  );
}
