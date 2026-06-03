import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { AlertService } from '@/services/api/v1/alertService';
import { Alert } from '@/models/alert.js';
import { supplies as seedSupplies } from '@/data/mockData';
import { evaluateProductAlertState } from '@/lib/inventory';
import { USE_MOCK_DATA, getLocked, getLockWatcher } from './utils';


function mapSeedAlerts() {
  return seedSupplies.flatMap((supply) => {
    const { alertClass, messages } = evaluateProductAlertState({
      ...supply,
      minStock: supply.minStock,
    });

    if (alertClass === 'normal' || !messages.length) {
      return [];
    }

    return messages.map((message) => Alert.fromApi({
      supply_id: supply.id,
      supply_name: supply.name,
      supply_sku: supply.sku ?? '',
      alert_type: 'LOW_STOCK',
      severity: alertClass,
      message,
      current_value: supply.quantity,
    }));
  });
}


export const useAlertStore = defineStore('alert', () => {


  // State

  const alerts = ref([]);
  const status = ref({
    loading: false,
    loadingOne: false,
    sending: false,
    sendingOne: false,
  });
  const lock = ref(null);


  // Getters

  const criticalAlerts = computed(() => {
    return alerts.value.filter((alert) => alert.severity === 'critical');
  });
  const locked = computed(() => {
    return getLocked(status.value);
  });


  // Extra

  watch(locked, getLockWatcher(lock), { flush: 'sync' });


  // Actions

  async function fetchAll(params = {}) {
    status.value.loading = true;

    try {
      const newAlerts = USE_MOCK_DATA ? mapSeedAlerts() : await AlertService.list(params);

      if (!newAlerts) {
        return;
      }

      alerts.value = newAlerts;

      return newAlerts;
    } finally {
      status.value.loading = false;
    }
  }


  return {
    alerts, status, lock,
    criticalAlerts, locked,
    fetchAll,
  };
});