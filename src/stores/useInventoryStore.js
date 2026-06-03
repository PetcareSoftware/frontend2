import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { InventoryService } from '@/services/api/v1/inventoryService';
import { Supply } from '@/models/supply.js';
import { Batch } from '@/models/batch.js';
import { supplies as seedSupplies } from '@/data/mockData';
import { findReplace } from '@/lib/utils';
import { USE_MOCK_DATA, getSelectedById, getLocked, getLockWatcher } from './utils';


function mapSeedSupplies() {
  return seedSupplies.map((entry) => Supply.fromApi({
    id: entry.id,
    name: entry.name,
    category: entry.type,
    quantity: entry.quantity,
    unitCost: entry.unitCost,
    min_stock: entry.minStock,
    batches: entry.batches,
  }));
}


export const useInventoryStore = defineStore('inventory', () => {


  // State

  const supplies = ref([]);
  const selectedSupplyId = ref(null);
  const selectedBatchId = ref(null);
  const status = ref({
    loading: false,
    loadingOne: false,
    sending: false,
    sendingOne: false,
  });
  const lock = ref(null);


  // Getters

  const selectedSupply = computed(() => {
    return getSelectedById(selectedSupplyId.value, getFromStore);
  });
  const locked = computed(() => {
    return getLocked(status.value);
  });


  // Extra

  watch(locked, getLockWatcher(lock), { flush: 'sync' });


  // Actions

  async function get(id) {
    let supply = getFromStore(id);

    if (!supply) {
      supply = await fetchOne(id);
    }

    return supply;
  }

  async function fetchOne(id) {
    status.value.loadingOne = true;

    try {
      const newSupply = USE_MOCK_DATA ?
        mapSeedSupplies().find((supply) => Number(supply.id) === Number(id)) :
        await InventoryService.get(id);

      if (!newSupply) {
        return;
      }

      saveInStore(newSupply);

      return newSupply;
    } finally {
      status.value.loadingOne = false;
    }
  }

  async function fetchAll() {
    status.value.loading = true;

    try {
      const newSupplies = USE_MOCK_DATA ? mapSeedSupplies() : await InventoryService.list();

      if (!newSupplies) {
        return;
      }

      supplies.value = newSupplies;

      return newSupplies;
    } finally {
      status.value.loading = false;
    }
  }

  async function add(newSupply) {
    status.value.sendingOne = true;

    try {
      if (USE_MOCK_DATA) {
        if (supplies.value.find((supply) => supply.equals(newSupply))) {
          throw new Error('Este insumo ya existe');
        }

        const created = Supply.fromApi({
          ...newSupply,
          id: newSupply.id ?? `s${Date.now()}`,
          category: newSupply.category ?? newSupply.type,
          min_stock: newSupply.minStock ?? 10,
        });

        saveInStore(created);

        return created;
      }

      const created = await InventoryService.create(newSupply);
      saveInStore(created);

      return created;
    } finally {
      status.value.sendingOne = false;
    }
  }

  async function update(newSupply) {
    status.value.sendingOne = true;

    try {
      if (USE_MOCK_DATA) {
        const normalized = Supply.fromApi(newSupply);
        const oldIndex = findReplace(supplies.value, (old) => old.id === normalized.id, normalized);
        if (oldIndex < 0) {
          throw new Error('Este insumo no existe');
        }

        return normalized;
      }

      const updated = await InventoryService.update(newSupply.id, newSupply);
      saveInStore(updated);

      return updated;
    } finally {
      status.value.sendingOne = false;
    }
  }

  async function addBatch(supplyId, batch) {
    status.value.sending = true;

    try {
      const newBatch = Batch.fromApi({
        ...batch,
        supply: supplyId,
      });

      if (USE_MOCK_DATA) {
        const supply = getFromStore(supplyId);
        if (!supply) {
          throw new Error('Insumo no encontrado');
        }

        supply.quantity += newBatch.quantity;
        supply.batches.push(newBatch);
        saveInStore(supply);

        return newBatch;
      }

      await InventoryService.createBatch(newBatch);
      await fetchOne(supplyId);

      return newBatch;
    } finally {
      status.value.sending = false;
    }
  }

  function getFromStore(id) {
    return supplies.value.find((supply) => Number(supply.id) === Number(id));
  }

  function saveInStore(newSupply) {
    const oldIndex = findReplace(supplies.value, (old) => old.id === newSupply.id, newSupply);
    if (oldIndex < 0) {
      supplies.value.push(newSupply);
    }
  }


  return {
    supplies, selectedSupplyId, selectedBatchId, status, lock,
    selectedSupply, locked,
    get, fetchOne, fetchAll, add, update, addBatch, getFromStore, saveInStore,
  };
});