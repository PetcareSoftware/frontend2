import api from './api.js';
import { Alert } from '@/models/alert.js';
import { unwrapApiList } from '@/lib/utils.js';


export const ALERTS_BASE = 'alerts/';


export class AlertService {
  static async list(params = {}) {
    const response = await api.get(ALERTS_BASE, { params });
    const rows = unwrapApiList(response.data?.alerts ?? response.data);

    return rows.map((row) => Alert.fromApi(row));
  }
}

/** @deprecated Compatibilidad temporal. */
export async function listCriticalAlerts(params = {}) {
  const alerts = await AlertService.list(params);

  return {
    alerts: alerts.map((alert) => alert.toApi()),
  };
}