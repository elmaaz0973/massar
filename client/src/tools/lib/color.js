export const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(Number(v) || 0)));
export const toHex2 = (v) => clamp255(v).toString(16).toUpperCase().padStart(2, '0');
export const toBin8 = (v) => clamp255(v).toString(2).padStart(8, '0');
export const rgbToHex = ({ r, g, b }) => `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export const colorCount = (bitsPerPixel) => 2 ** bitsPerPixel;
export const imageBytes = (width, height, bitsPerPixel) => Math.ceil((width * height * bitsPerPixel) / 8);

export function formatBytes(bytes) {
  const units = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
  const text = i === 0 ? String(v) : v.toFixed(2).replace(/\.?0+$/, '');
  return `${text} ${units[i]}`;
}
