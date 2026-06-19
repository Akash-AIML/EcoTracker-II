import api from './api';

export const userService = {
  createOrFind: (data) => api.post('/users', data).then((r) => r.data.data),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data.data),
};
