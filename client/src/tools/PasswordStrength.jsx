import { useState } from 'react';

// إرشادات إنشاء كلمات المرور كما وردت في الكتاب (الصف الأول، الدرس 2-3، ص 34)
const GUIDELINES = [
  'استخدم سلسلة أحرف (طويلة) قدر الإمكان.',
  '(اجمع) بين الأحرف الكبيرة والصغيرة والأرقام والرموز.',
  'لا تستخدم معلومات شخصية مثل تاريخ ميلادك أو عنوان بريدك الإلكتروني أو معرف المستخدم.',
  'لا تُعد استخدام كلمات المرور المستخدمة في خدمات أخرى.',
];

const KINDS = [
  ['أحرف صغيرة', /[a-z]/],
  ['أحرف كبيرة', /[A-Z]/],
  ['أرقام', /[0-9]/],
  ['رموز', /[^A-Za-z0-9\u0621-\u064a\s]/],
];

export default function PasswordStrength() {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);

  return (
    <div className="tool">
      <p className="box">ما تكتبه هنا يبقى داخل متصفحك ولا يُرسل لأي مكان. مع ذلك لا تكتب كلمة مرورك الحقيقية في أي موقع غير موثوق؛ جرّب أمثلة مشابهة لها.</p>

      <h3>إرشادات إنشاء كلمات المرور (من الكتاب)</h3>
      <ul>{GUIDELINES.map((g) => <li key={g}>{g}</li>)}</ul>

      <label className="field">جرّب كلمة مرور
        <input type={show ? 'text' : 'password'} dir="ltr" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" spellCheck={false} />
      </label>
      <label className="check"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> إظهار الحروف</label>

      {pw && (
        <div className="table-wrap">
          <table className="tool-table">
            <tbody>
              <tr><td>الطول</td><td dir="ltr">{[...pw].length}</td></tr>
              {KINDS.map(([name, re]) => (
                <tr key={name}><td>{name}</td><td>{re.test(pw) ? '✓ موجودة' : '✗ غير موجودة'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">تفحص الأداة الطول وأنواع الأحرف فقط. أما الإرشادان الثالث والرابع (المعلومات الشخصية، وإعادة استخدام كلمة المرور) فعليك أنت مراجعتهما.</p>
    </div>
  );
}
