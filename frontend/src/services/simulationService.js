import api from './api';

export const simulationService = {
  create: (data) => api.post('/simulations', data).then((r) => r.data.data),
  getById: (id) => api.get(`/simulations/${id}`).then((r) => r.data.data),
  getRecommendations: (assessmentId) =>
    api.get(`/recommendations/${assessmentId}`).then((r) => r.data.data),
};
