import api from '@/services/api/v1/api';

export const notificationService = {
  getNotifications(params) {
    return api.get('/notifications/', { params });
  },
  markAsRead(id) {
    return api.patch(`/notifications/${id}/read/`);
  },
  markAllAsRead() {
    return api.patch('/notifications/read-all/');
  },
};
