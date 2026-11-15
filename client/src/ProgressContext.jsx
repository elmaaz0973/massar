import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';

// الدروس المكتملة للطالب، مشتركة بين صفحة الدرس والفهرس الجانبي ليتحدّثا فوراً معاً.
const Ctx = createContext({ ids: new Set(), setDone: () => {} });
export const useProgress = () => useContext(Ctx);

export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    setIds(new Set());
    if (!user) return undefined;
    let alive = true;
    api.progress()
      .then((p) => alive && setIds(new Set(p.completed.map((c) => String(c.lessonId)))))
      .catch(() => {});
    return () => { alive = false; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setDone = useCallback((id, done) => setIds((prev) => {
    const next = new Set(prev);
    if (done) next.add(String(id)); else next.delete(String(id));
    return next;
  }), []);

  const value = useMemo(() => ({ ids, setDone }), [ids, setDone]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
