import api from './axios.js';

export const notificationApi = {
  getAll: async () => api.get('/notifications'),
  markAsRead: async (id) => api.patch(`/notifications/${id}`),
  delete: async (id) => api.delete(`/notifications/${id}`),
  clearAll: async () => api.delete('/notifications'),
};

export default notificationApi;
