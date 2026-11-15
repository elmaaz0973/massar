import { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    if (!getAuthToken()) return;
    api.me()
      .then(({ user }) => setUser(user))
      .catch((e) => { if (e.status === 401) setAuthToken(''); })
      .finally(() => setLoading(false));
  }, []);

  const accept = ({ token, user }) => { setAuthToken(token); setUser(user); return user; };
  const value = {
    user,
    loading,
    login: async (email, password) => accept(await api.login({ email, password })),
    register: async (name, email, password) => accept(await api.register({ name, email, password })),
    logout: () => { setAuthToken(''); setUser(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
