import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminGate from '../../components/AdminGate.jsx';
import Markdown from '../../components/Markdown.jsx';
import { Loading, ErrorBox } from '../../components/State.jsx';
import { adminApi } from '../../adminApi.js';
import QuizEditor from './QuizEditor.jsx';

function Editor() {
  const { id } = useParams();
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.lesson(id)
      .then(({ lesson, stage, unit }) => {
        setMeta({ stage, unit, number: lesson.number, slug: lesson.slug });
        setForm({ title: lesson.title, objectives: lesson.objectives.join('\n'), content: lesson.content, status: lesson.status, source: lesson.source || '' });
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error && !form) return <ErrorBox message={error} />;
  if (!form) return <Loading />;

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setMsg(''); };

  async function save(status = form.status) {
    setSaving(true); setError(''); setMsg('');
    try {
      await adminApi.save(id, {
        title: form.title,
        objectives: form.objectives.split('\n'),
        content: form.content,
        source: form.source,
        status,
      });
      setForm((f) => ({ ...f, status }));
      setMsg(status === 'published' ? 'تم الحفظ والنشر ✓' : 'تم الحفظ كمسودة ✓');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p className="crumbs"><Link to="/admin">لوحة التحكم</Link> / {meta.stage.title} / {meta.unit.title}</p>
      <div className="admin-head">
        <h1><span className="lnum">{meta.number}</span> تحرير الدرس</h1>
        <Link className="btn ghost" to={`/stages/${meta.stage.slug}/lessons/${meta.slug}`} target="_blank">معاينة في الموقع</Link>
      </div>

      <label className="field">العنوان
        <input value={form.title} onChange={set('title')} />
      </label>

      <label className="field">المرجع في الكتاب (الدرس والصفحات)
        <input value={form.source} onChange={set('source')} maxLength={300} />
      </label>

      <label className="field">أهداف التعلم (هدف في كل سطر)
        <textarea rows={4} value={form.objectives} onChange={set('objectives')} />
      </label>

      <div className="editor">
        <label className="field">المحتوى (Markdown)
          <textarea className="code" rows={26} dir="auto" value={form.content} onChange={set('content')} spellCheck={false} />
        </label>
        <div className="field">
          <span>المعاينة</span>
          <div className="preview"><Markdown>{form.content || '_لا يوجد محتوى بعد_'}</Markdown></div>
        </div>
      </div>

      {error && <p className="state error">{error}</p>}
      {msg && <p className="state ok">{msg}</p>}

      <div className="actions">
        <button className="btn" disabled={saving} onClick={() => save('published')}>حفظ ونشر</button>
        <button className="btn ghost" disabled={saving} onClick={() => save('draft')}>حفظ كمسودة</button>
        <span className="muted">الحالة الحالية: {form.status === 'published' ? 'منشور' : 'مسودة'}</span>
      </div>

      <QuizEditor lessonId={id} />
    </>
  );
}

export default function AdminEditor() {
  return <AdminGate><Editor /></AdminGate>;
}
