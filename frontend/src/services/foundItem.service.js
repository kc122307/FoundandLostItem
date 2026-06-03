import api from './api';

export const foundItemService = {
  getAll: async (params) => {
    const { data } = await api.get('/found-items', { params });
    return data;
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/found-items/${id}`);
    return data;
  },
  
  create: async (formData) => {
    const { data } = await api.post('/found-items', formData);
    return data;
  },

  getNearby: async (params) => {
    const { data } = await api.get('/found-items/nearby', { params });
    return data;
  },

  update: async (id, updateData) => {
    const { data } = await api.put(`/found-items/${id}`, updateData);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/found-items/${id}`);
    return data;
  }
};
