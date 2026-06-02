import api from './api';

export const matchService = {
  getMyMatches: async () => {
    const { data } = await api.get('/matches/my-matches');
    return data;
  },
  
  getMatchesForLostItem: async (id) => {
    const { data } = await api.get(`/matches/lost/${id}`);
    return data;
  },
  
  getMatchesForFoundItem: async (id) => {
    const { data } = await api.get(`/matches/found/${id}`);
    return data;
  },

  triggerManualMatch: async (itemId, itemType) => {
    const { data } = await api.post('/matches/manual', { itemId, itemType });
    return data;
  }
};
