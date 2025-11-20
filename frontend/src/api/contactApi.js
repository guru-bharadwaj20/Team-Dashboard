import api from './axios.js';

export const contactApi = {
  submitMessage: async (name, email, subject, message) => {
    const res = await api.post('/contact', {
      name,
      email,
      subject,
      message,
    });
    return res;
  },

  getAllMessages: async () => {
    const res = await api.get('/contact');
    return res;
  },

  getMessageById: async (id) => {
    const res = await api.get(`/contact/${id}`);
    return res;
  },

  updateMessageStatus: async (id, status) => {
    const res = await api.put(`/contact/${id}/status`, { status });
    return res;
  },

  deleteMessage: async (id) => {
    const res = await api.delete(`/contact/${id}`);
    return res;
  },
};

export default contactApi;
