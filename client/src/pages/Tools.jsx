import { Link } from 'react-router-dom';
import { visibleTools } from '../tools/registry.js';

const STAGES = { 'grade-1': 'الصف الأول الثانوي', 'grade-2': 'الصف الثاني الثانوي' };

export default function Tools() {
  return (
    <>
      <h1 className="page-title">الأدوات التفاعلية</h1>
      <p className="muted lead">جرّب المفاهيم بنفسك: كل أداة مرتبطة بدروس من المنهج وتعمل بالكامل داخل متصفحك.</p>
      <div className="grid tools-grid">
        {visibleTools.map((t) => (
          <article className="card tool-card" key={t.slug}>
            {t.icon && <img className="tool-icon" src={t.icon} alt="" loading="lazy" width="200" height="170" />}
            <span className="badge">{STAGES[t.stage]}</span>
            <h3>{t.title}</h3>
            <p className="muted">{t.description}</p>
            <Link className="btn" to={`/tools/${t.slug}`}>افتح الأداة <span className="btn-arrow" aria-hidden="true">←</span></Link>
          </article>
        ))}
      </div>
    </>
  );
}
