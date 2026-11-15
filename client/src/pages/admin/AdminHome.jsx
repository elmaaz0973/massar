import { Link } from 'react-router-dom';
import AdminGate from '../../components/AdminGate.jsx';
import { Loading, ErrorBox } from '../../components/State.jsx';
import { adminApi } from '../../adminApi.js';
import { useFetch } from '../../useFetch.js';

function Dashboard() {
  const { data, loading, error } = useFetch(adminApi.lessons, []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const all = data.flatMap((s) => s.units.flatMap((u) => u.lessons));
  const published = all.filter((l) => l.status === 'published').length;

  return (
    <>
      <div className="admin-head">
        <h1>لوحة التحكم</h1>
      </div>
      <p className="muted">منشور {published} من {all.length} درساً.</p>

      {data.filter((s) => s.units.length > 0).map(({ stage, units }) => (
        <section key={stage._id}>
          <h2 className="term">{stage.title}</h2>
          {units.map((u) => (
            <details key={u._id} className="unit">
              <summary><span className="num">{u.number}</span> {u.title}</summary>
              <ul className="lessons">
                {u.lessons.map((l) => (
                  <li key={l._id}>
                    <Link to={`/admin/lessons/${l._id}`}><span className="lnum">{l.number}</span> {l.title}</Link>
                    <span className={`badge ${l.status === 'published' ? '' : 'soft'}`}>
                      {l.status === 'published' ? 'منشور' : l.hasContent ? 'مسودة' : 'فارغ'}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </section>
      ))}
    </>
  );
}

export default function AdminHome() {
  return <AdminGate><Dashboard /></AdminGate>;
}
