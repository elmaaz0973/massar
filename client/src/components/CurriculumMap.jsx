import { GRADE1_MAP } from '../data/curriculum.js';

const ARABIC_TERM = { 1: 'الترم الأول', 2: 'الترم الثاني' };

// الصف الأول: الخريطة المعتمدة كما وصلت. الصف الثاني: تُبنى من وحدات المنصة نفسها (لا تُنقل وحدات الصف الأول).
function buildTerms(stage, units) {
  if (stage.slug === 'grade-1') return GRADE1_MAP;
  return [1, 2]
    .map((t) => ({
      term: t,
      title: null,
      units: units.filter((u) => u.term === t).map((u) => ({ number: u.number, label: `الوحدة ${u.number}: ${u.title}` })),
    }))
    .filter((t) => t.units.length);
}

export default function CurriculumMap({ stage, units }) {
  const terms = buildTerms(stage, units);
  if (!terms.length) return null;
  const total = terms.reduce((n, t) => n + t.units.length, 0);

  return (
    <section className="cmap" aria-label="خريطة المنهج">
      <div className="cmap-head">
        <h2>خريطة المنهج</h2>
        <p className="muted">{total} وحدة موزعة على ترمين — اضغط على أي وحدة للانتقال إلى دروسها.</p>
      </div>
      <div className="cmap-grid">
        {terms.map((t) => (
          <article className={`cmap-card term-${t.term}`} key={t.term}>
            <header>
              <div className="cmap-count" aria-label={`${t.units.length} وحدات`}>
                <strong>{t.units.length}</strong>
                <span>{t.units.length === 1 ? 'وحدة' : t.units.length === 2 ? 'وحدتان' : t.units.length <= 10 ? 'وحدات' : 'وحدة'}</span>
              </div>
              <div>
                <h3>{ARABIC_TERM[t.term]}</h3>
                {t.title && <p className="muted">{t.title}</p>}
              </div>
            </header>
            <ol>
              {t.units.map((u) => (
                <li key={u.number}>
                  <a href={`#unit-${u.number}`}>
                    <span className="num">{u.number}</span>
                    <span>{u.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}
