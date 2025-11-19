import api from './axios.js';

export const teamApi = {
  getAll: async () => {
    return api.get('/teams');
  },
  getById: async (id) => {
    return api.get(`/teams/${id}`);
  },
  create: async (data) => {
    return api.post('/teams', data);
  },
  join: async (id) => {
    return api.post(`/teams/${id}`);
  },
  update: async (id, data) => api.put(`/teams/${id}`, data),
  delete: async (id) => api.delete(`/teams/${id}`),
};

export default teamApi;
