import api from '@/services/api/v1/api';

export const vetService = {
  getSlots(vetId, date) {
    const params = date ? { date } : {};
    return api.get(`/vets/${vetId}/slots/`, { params });
  },
  getCalendar(from, to) {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return api.get('/schedules/calendar/', { params });
  },
};
