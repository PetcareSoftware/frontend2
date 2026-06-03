import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { InventoryService } from '@/services/api/v1/inventoryService';
import { Consumption } from '@/models/consumption.js';
import { USE_MOCK_DATA, getLocked, getLockWatcher } from './utils';


export const useConsumptionStore = defineStore('consumption', () => {


  // State

  const lastConsumption = ref(null);
  const status = ref({
    loading: false,
    loadingOne: false,
    sending: false,
    sendingOne: false,
  });
  const lock = ref(null);


  // Getters

  const locked = computed(() => {
    return getLocked(status.value);
  });


  // Extra

  watch(locked, getLockWatcher(lock), { flush: 'sync' });


  // Actions

  async function consume(consumption) {
    status.value.sendingOne = true;

    try {
      const payload = consumption instanceof Consumption ?
        consumption :
        Consumption.fromApi(consumption);
      payload.validate();

      const result = USE_MOCK_DATA ? payload : await InventoryService.consume(payload);
      lastConsumption.value = result;

      return result;
    } finally {
      status.value.sendingOne = false;
    }
  }


  return {
    lastConsumption, status, lock,
    locked,
    consume,
  };
});
