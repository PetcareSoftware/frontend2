import api from '@/services/api/v1/api';

export const waitingListService = {
  getWaitingList(vetId) {
    const params = vetId ? { vet_id: vetId } : {};
    return api.get('/waiting-list/', { params });
  },
  callNext(id) {
    return api.post(`/waiting-list/${id}/call-next/`);
  },
};
