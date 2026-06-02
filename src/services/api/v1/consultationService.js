import api from '@/services/api/v1/api';

export const consultationService = {
  registerSupplies(id, data) {
    return api.post(`/consultations/${id}/supplies-used/`, data);
  },
};
