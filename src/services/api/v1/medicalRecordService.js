import api from '@/services/api/v1/api';

export const medicalRecordService = {
  getSummary(petId) {
    return api.get(`/pets/${petId}/medical-record/summary/`);
  },
  getCompleteRecord(petId) {
    return api.get(`/pets/${petId}/medical-record/`);
  },
};
