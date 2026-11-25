// يعزل المقاطع الرياضية/اللاتينية (أرقام، رموز سفلية ₂ ₁₆، أسس ⁴، معادلات 13 ÷ 2 = 6) داخل النص العربي
// حتى لا ينعكس ترتيبها في الاتجاه من اليمين لليسار: مثلاً (D6)₁₆ كانت تظهر ₁₆(D6).
const TOK = '[A-Za-z0-9()₀-₉⁰-⁹¹²³×÷+=−\\-.]+';
const RUN = new RegExp(`${TOK}(?:\\s+${TOK})*`, 'g');
const NEEDS = /[0-9₀-₉⁰-⁹¹²³×÷+=−]/;

export default function Bi({ text }) {
  if (typeof text !== 'string' || !text) return text ?? null;
  const out = [];
  let last = 0, key = 0;
  for (const m of text.matchAll(RUN)) {
    let run = m[0];
    const tail = run.match(/[.\-]+$/);            // علامة نهاية الجملة تبقى خارج المقطع
    if (tail) run = run.slice(0, -tail[0].length);
    if (!run || !NEEDS.test(run)) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<bdi key={key++} dir="ltr">{run}</bdi>);
    last = m.index + run.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
