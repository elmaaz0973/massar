// يقرأ ملف درس Markdown بصيغة:
// ---
// objectives:
// - هدف أول
// - هدف ثانٍ
// ---
// نص الدرس...
export function parseLessonFile(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const m = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { objectives: [], source: '', content: normalized.trim() };

  const objectives = [];
  let source = '';
  let inObjectives = false;
  for (const line of m[1].split('\n')) {
    const src = line.match(/^source:\s*(.+)$/);
    if (src) { source = src[1].trim(); inObjectives = false; continue; }
    if (/^objectives:\s*$/.test(line)) { inObjectives = true; continue; }
    const item = line.match(/^\s*-\s+(.*)$/);
    if (inObjectives && item) objectives.push(item[1].trim());
    else if (line.trim()) inObjectives = false;
  }
  return { objectives, source, content: m[2].trim() };
}
