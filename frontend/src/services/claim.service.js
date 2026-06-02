import api from './api';

export const claimService = {
  submitClaim: async (claimData) => {
    const { data } = await api.post('/claims', claimData);
    return data;
  },
  
  resubmitClaim: async (claimData) => {
    const { data } = await api.post('/claims/resubmit', claimData);
    return data;
  },
  
  getMyClaims: async () => {
    const { data } = await api.get('/claims/mine');
    return data;
  },
  
  getClaimsForMyItems: async () => {
    const { data } = await api.get('/claims/for-my-items');
    return data;
  }
};
