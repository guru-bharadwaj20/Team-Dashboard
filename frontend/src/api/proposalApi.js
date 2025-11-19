import api from './axios.js';

export const proposalApi = {
  getByTeamId: async (teamId) => api.get(`/teams/${teamId}/proposals`),
  getById: async (id) => api.get(`/proposals/${id}`),
  create: async (teamId, data) => api.post(`/teams/${teamId}/proposals`, data),
  vote: async (proposalId, option) => api.post(`/proposals/${proposalId}/votes`, { option }),
  results: async (proposalId) => api.get(`/proposals/${proposalId}/results`),
  getComments: async (proposalId) => api.get(`/proposals/${proposalId}/comments`),
  addComment: async (proposalId, text) => api.post(`/proposals/${proposalId}/comments`, { text }),
};

export default proposalApi;
