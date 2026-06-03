import api from './api';

export const lostItemService = {
  getAll: async (params) => {
    const { data } = await api.get('/lost-items', { params });
    return data;
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/lost-items/${id}`);
    return data;
  },
  
  create: async (formData) => {
    const { data } = await api.post('/lost-items', formData);
    return data;
  },

  getNearby: async (params) => {
    const { data } = await api.get('/lost-items/nearby', { params });
    return data;
  },

  update: async (id, updateData) => {
    const { data } = await api.put(`/lost-items/${id}`, updateData);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/lost-items/${id}`);
    return data;
  }
};
