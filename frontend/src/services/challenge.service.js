import api from './api';

export const challengeService = {
  createChallenge: async (challengeData) => {
    const { data } = await api.post('/challenges', challengeData);
    return data;
  },

  answerChallenge: async ({ challengeId, ownerAnswers }) => {
    const { data } = await api.post(`/challenges/${challengeId}/answer`, { ownerAnswers });
    return data;
  },

  getMyChallenges: async () => {
    const { data } = await api.get('/challenges/mine');
    return data;
  },

  getChallengeById: async (id) => {
    const { data } = await api.get(`/challenges/${id}`);
    return data;
  }
};
