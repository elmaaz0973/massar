import robotSvg from '../components/robotSvg.js';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useFetch } from '../useFetch.js';
import { Loading, ErrorBox } from '../components/State.jsx';

export default function Home() {
  const { data, loading, error } = useFetch(api.stages, []);

  return (
    <>
      <section className="hero">
        <div className="robot hero-robot" aria-hidden="true" dangerouslySetInnerHTML={{ __html: robotSvg }} />
        <img className="hero-logo" src="/brand/logo.png" alt="مسار" width="260" height="166" />
        <h1>تعلّم البرمجة والذكاء الاصطناعي بسهولة</h1>
        <p>شروحات مبسطة وتمارين وأدوات تفاعلية لكل مراحل الثانوية في نظام البكالوريا.</p>
      </section>

      <h2>اختر مرحلتك</h2>
      {loading && <Loading />}
      {error && <ErrorBox message={error} />}
      <div className="grid">
        {data?.filter((s) => s.slug !== 'grade-3').map((s) => (
          <article key={s._id} className={`card ${s.comingSoon ? 'disabled' : ''}`}>
            <h3>{s.title}</h3>
            <p className="subject">{s.subject}</p>
            <p className="muted">{s.description}</p>
            {s.comingSoon ? (
              <span className="badge">قريباً</span>
            ) : (
              <>
                <p className="muted">{s.lessonsCount} درساً · المنشور {s.publishedCount}</p>
                <Link className="btn" to={`/stages/${s.slug}`}>ابدأ التعلم</Link>
              </>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
