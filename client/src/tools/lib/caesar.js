export const ALPHABETS = {
  latin: { name: 'English (A–Z)', letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  arabic: { name: 'العربية (28 حرفاً)', letters: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي' },
};

// إزاحة كل حرف بمقدار shift. الرموز خارج الأبجدية تبقى كما هي.
export function shiftText(text, shift, key = 'latin') {
  const L = ALPHABETS[key].letters;
  const n = L.length;
  const k = ((shift % n) + n) % n;
  return [...text].map((ch) => {
    if (key === 'latin') {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90) return L[(c - 65 + k) % n];
      if (c >= 97 && c <= 122) return L[(c - 97 + k) % n].toLowerCase();
      return ch;
    }
    const i = L.indexOf(ch);
    return i === -1 ? ch : L[(i + k) % n];
  }).join('');
}

// تجربة كل الإزاحات الممكنة
export function bruteForce(cipher, key = 'latin') {
  const n = ALPHABETS[key].letters.length;
  return Array.from({ length: n }, (_, s) => ({ shift: s, text: shiftText(cipher, -s, key) }));
}

export function letterFrequency(text, key = 'latin') {
  const L = ALPHABETS[key].letters;
  const counts = Object.fromEntries([...L].map((l) => [l, 0]));
  for (const ch of text) {
    const up = key === 'latin' ? ch.toUpperCase() : ch;
    if (up in counts && (key !== 'latin' || /[A-Za-z]/.test(ch))) counts[up] += 1;
  }
  return [...L].map((letter) => ({ letter, count: counts[letter] }));
}
