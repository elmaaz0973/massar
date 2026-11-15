// تكميم قيمة بين -1 و1 إلى 2^bits مستوى
export function quantize(x, bits) {
  const levels = 2 ** bits;
  const level = Math.round(((x + 1) / 2) * (levels - 1));
  return { level, value: (level / (levels - 1)) * 2 - 1 };
}

// محاكاة أخذ عيّنات من موجة جيبية تردّدها freq لمدة seconds
export function simulate({ freq, rate, bits, seconds = 1 }) {
  const n = Math.floor(rate * seconds);
  return Array.from({ length: n }, (_, i) => {
    const t = i / rate;
    const x = Math.sin(2 * Math.PI * freq * t);
    return { t, x, ...quantize(x, bits) };
  });
}

export function curve(freq, seconds = 1, points = 400) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const t = (i / points) * seconds;
    return { t, x: Math.sin(2 * Math.PI * freq * t) };
  });
}

export const audioBytes = ({ rate, bits, channels, seconds }) => Math.ceil((rate * bits * channels * seconds) / 8);
export const bitrate = ({ rate, bits, channels }) => rate * bits * channels; // بت/ثانية
// شرط نيكويست: معدل العيّنات يجب أن يزيد على ضعف أعلى تردد
export const nyquistOk = (freq, rate) => rate > 2 * freq;
