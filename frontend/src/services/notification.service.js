import api from './api';

export const notificationService = {
  getMyNotifications: async (params) => {
    const { data } = await api.get('/notifications', { params });
    return data;
  },
  
  markRead: async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },
  
  markAllRead: async () => {
    const { data } = await api.put('/notifications/mark-all-read');
    return data;
  },

  deleteNotification: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  }
};
