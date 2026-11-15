import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const COLORS = [
  { id: 'blue', label: 'الأزرق' },
  { id: 'purple', label: 'البنفسجي' },
  { id: 'teal', label: 'التركواز' },
  { id: 'cyan', label: 'السماوي' },
];

const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* التخزين غير متاح */ } };

const initialMode = () => {
  const saved = read('masar-mode');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
const initialColor = () => {
  const saved = read('masar-color');
  return COLORS.some((c) => c.id === saved) ? saved : 'blue';
};

const Ctx = createContext(null);
export const useTheme = () => useContext(Ctx);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(initialMode);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.mode = mode;
    el.dataset.theme = color;
    el.style.colorScheme = mode;
    write('masar-mode', mode);
    write('masar-color', color);
  }, [mode, color]);

  const value = useMemo(() => ({ mode, color, setColor, toggleMode: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }), [mode, color]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
