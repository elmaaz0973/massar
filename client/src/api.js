const KEY = 'auth-token';
export const getAuthToken = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const setAuthToken = (t) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* التخزين غير متاح */ } };

export async function request(method, path, body) {
  const token = getAuthToken();
  const res = await fetch(`/api${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'تعذّر تحميل البيانات');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  stages: () => request('GET', '/stages'),
  stage: (slug) => request('GET', `/stages/${slug}`),
  lesson: (stageSlug, lessonSlug) => request('GET', `/stages/${stageSlug}/lessons/${lessonSlug}`),

  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  me: () => request('GET', '/auth/me'),

  progress: () => request('GET', '/progress'),
  complete: (lessonId) => request('POST', `/progress/lessons/${lessonId}`),
  uncomplete: (lessonId) => request('DELETE', `/progress/lessons/${lessonId}`),

  quiz: (lessonId) => request('GET', `/lessons/${lessonId}/quiz`),
  bank: () => request('GET', '/bank'),
  bankUnit: (n) => request('GET', `/bank/units/${n}`),
  bankCheck: (n, id, choice) => request('POST', `/bank/units/${n}/check`, { id, choice }),
  bankReveal: (n, id) => request('POST', `/bank/units/${n}/reveal`, { id }),
  bankFinish: (n, answers, lesson = '') => request('POST', `/bank/units/${n}/finish`, { answers, lesson }),
  bankPayInfo: () => request('GET', '/bank/pay-info'),
  bankMyPayment: () => request('GET', '/bank/payments/mine'),
  bankPay: (body) => request('POST', '/bank/payments', body),

  submitQuiz: (lessonId, answers) => request('POST', `/lessons/${lessonId}/quiz/submit`, { answers }),
};
