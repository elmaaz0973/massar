import { request } from './api.js';

export const adminApi = {
  lessons: () => request('GET', '/admin/lessons'),
  lesson: (id) => request('GET', `/admin/lessons/${id}`),
  save: (id, body) => request('PUT', `/admin/lessons/${id}`, body),
  quiz: (id) => request('GET', `/admin/lessons/${id}/quiz`),
  saveQuiz: (id, questions) => request('PUT', `/admin/lessons/${id}/quiz`, { questions }),
  deleteQuiz: (id) => request('DELETE', `/admin/lessons/${id}/quiz`),
  bankPayments: (status = 'pending') => request('GET', `/bank/admin/payments?status=${status}`),
  bankReview: (id, action, note = '') => request('POST', `/bank/admin/payments/${id}/${action}`, { note }),
};
