import api from './api';

export const assessmentService = {
  create: (data) => api.post('/assessments', data).then((r) => r.data.data),
  getById: (id) => api.get(`/assessments/${id}`).then((r) => r.data.data),
  getByUser: (userId) => api.get(`/assessments/user/${userId}`).then((r) => r.data.data),
};
