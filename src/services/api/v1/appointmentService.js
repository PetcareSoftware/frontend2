import api from '@/services/api/v1/api';

export const appointmentService = {
  scheduleAppointment(data) {
    return api.post('/appointments/', data);
  },
  cancelAppointment(id, cancellation_reason) {
    return api.post(`/appointments/${id}/cancel/`, { cancellation_reason });
  },
  confirmAppointment(id) {
    return api.post(`/appointments/${id}/confirm/`);
  },
  getTodayAppointments(params) {
    return api.get('/appointments/today/', { params });
  },
  getTodayByVet(vetId) {
    return api.get(`/appointments/today/by-vet/${vetId}/`);
  },
  checkIn(id) {
    return api.post(`/appointments/${id}/check-in/`);
  },
  createConsultation(id, data) {
    return api.post(`/appointments/${id}/consultations/`, data);
  },
};
