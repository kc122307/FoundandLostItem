import api from './api';

export const chatService = {
  getChats: async () => {
    const { data } = await api.get('/chats');
    return data;
  },
  
  startChat: async (matchId) => {
    const { data } = await api.post('/chats/start', { matchId });
    return data;
  },
  
  getMessages: async (chatId, params) => {
    const { data } = await api.get(`/chats/${chatId}/messages`, { params });
    return data;
  },

  sendImageMessage: async (formData) => {
    const { data } = await api.post('/chats/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
};
