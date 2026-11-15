const DIGITS = '0123456789ABCDEF';
const LIMIT = 2n ** 64n;

// يقرأ نصاً في نظام عددي (2 أو 10 أو 16). يرجع {value} أو {error} أو {empty}
export function parseInBase(input, base) {
  let s = String(input).replace(/[\s_]/g, '').toUpperCase();
  if (base === 2 && s.startsWith('0B')) s = s.slice(2);
  if (base === 16 && s.startsWith('0X')) s = s.slice(2);
  if (!s) return { empty: true };

  const allowed = DIGITS.slice(0, base);
  for (const ch of s) {
    if (!allowed.includes(ch)) return { error: `الرمز "${ch}" غير مسموح في هذا النظام` };
  }
  let n = 0n;
  const b = BigInt(base);
  for (const ch of s) n = n * b + BigInt(DIGITS.indexOf(ch));
  if (n >= LIMIT) return { error: 'الحد الأقصى المدعوم هو 64 بت' };
  return { value: n };
}

export const toBase = (n, base) => n.toString(base).toUpperCase();
export const bitLength = (n) => (n === 0n ? 1 : n.toString(2).length);

// يقسم الأرقام الثنائية لمجموعات من 4 (أو size) من اليمين
export function groupBits(bin, size = 4) {
  const pad = (size - (bin.length % size)) % size;
  return ('0'.repeat(pad) + bin).match(new RegExp(`.{${size}}`, 'g')).join(' ');
}

// خطوات القسمة على 2 لتحويل عدد عشري إلى ثنائي (للأعداد الأصغر من 2^32)
export function divisionSteps(n) {
  if (n >= 2n ** 32n) return null;
  let x = Number(n);
  if (x === 0) return [{ dividend: 0, quotient: 0, remainder: 0 }];
  const steps = [];
  while (x > 0) {
    steps.push({ dividend: x, quotient: Math.floor(x / 2), remainder: x % 2 });
    x = Math.floor(x / 2);
  }
  return steps;
}

// قيمة كل خانة في عدد ثنائي
export function placeValues(bin) {
  return [...bin].map((bit, i) => ({ bit, weight: 2n ** BigInt(bin.length - 1 - i) }));
}

// كل رمز سادس عشر ↔ 4 بتات
export function hexToBinaryGroups(hex) {
  return [...hex].map((d) => ({ digit: d, bits: parseInt(d, 16).toString(2).padStart(4, '0') }));
}
