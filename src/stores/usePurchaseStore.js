import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { PurchaseService } from '@/services/api/v1/purchaseService';
import { PurchaseOrder } from '@/models/purchaseOrder.js';
import { PurchaseOrderItem } from '@/models/purchaseOrderItem.js';
import { findReplace } from '@/lib/utils';
import { USE_MOCK_DATA, getSelectedById, getLocked, getLockWatcher } from './utils';


const mockPurchaseOrders = [];


export const usePurchaseStore = defineStore('purchase', () => {


  // State

  const purchaseOrders = ref([]);
  const suppliers = ref([]);
  const selectedOrderId = ref(null);
  const status = ref({
    loading: false,
    loadingOne: false,
    sending: false,
    sendingOne: false,
  });
  const lock = ref(null);


  // Getters

  const selectedOrder = computed(() => {
    return getSelectedById(selectedOrderId.value, getFromStore);
  });
  const pendingOrders = computed(() => {
    return purchaseOrders.value.filter((order) => order.estado === 'Pendiente');
  });
  const locked = computed(() => {
    return getLocked(status.value);
  });


  // Extra

  watch(locked, getLockWatcher(lock), { flush: 'sync' });


  // Actions

  async function get(id) {
    let order = getFromStore(id);

    if (!order) {
      order = await fetchOne(id);
    }

    return order;
  }

  async function fetchOne(id) {
    status.value.loadingOne = true;

    try {
      const newOrder = USE_MOCK_DATA ?
        mockPurchaseOrders.find((order) => order.id === id) :
        await PurchaseService.get(id);

      if (!newOrder) {
        return;
      }

      saveInStore(newOrder);

      return newOrder;
    } finally {
      status.value.loadingOne = false;
    }
  }

  async function fetchAll() {
    status.value.loading = true;

    try {
      const newOrders = USE_MOCK_DATA ? [...mockPurchaseOrders] : await PurchaseService.list();

      if (!newOrders) {
        return;
      }

      purchaseOrders.value = newOrders;

      return newOrders;
    } finally {
      status.value.loading = false;
    }
  }

  async function add(newOrder) {
    status.value.sendingOne = true;

    try {
      if (USE_MOCK_DATA) {
        const created = PurchaseOrder.fromApi({
          ...newOrder,
          id: newOrder.id ?? `PO-${Date.now()}`,
          status: 'REQUESTED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        mockPurchaseOrders.push(created);
        saveInStore(created);

        return created;
      }

      const created = await PurchaseService.create(newOrder);
      saveInStore(created);

      return created;
    } finally {
      status.value.sendingOne = false;
    }
  }

  async function updateStatus(id, estado) {
    status.value.sendingOne = true;

    try {
      if (USE_MOCK_DATA) {
        const current = getFromStore(id);
        if (!current) {
          throw new Error('Esta orden no existe');
        }

        current.status = PurchaseOrder.STATUS_TO_API[estado] ?? current.status;
        current.estado = estado;
        findReplace(mockPurchaseOrders, (old) => old.id === id, current);
        saveInStore(current);

        return current;
      }

      const updated = await PurchaseService.updateStatus(id, estado);
      saveInStore(updated);

      return updated;
    } finally {
      status.value.sendingOne = false;
    }
  }

  async function fetchAllSuppliers() {
    status.value.loading = true;

    try {
      const newSuppliers = USE_MOCK_DATA ? [] : await PurchaseService.listSuppliers();

      if (!newSuppliers) {
        return;
      }

      suppliers.value = newSuppliers;

      return newSuppliers;
    } finally {
      status.value.loading = false;
    }
  }

  function buildOrderFromItems(items, inventoryGetter, supplierId) {
    const orderItems = items.map((item) => {
      const supply = inventoryGetter(item.supplyId ?? item.insumoId);

      return PurchaseOrderItem.fromApi({
        insumoId: item.supplyId ?? item.insumoId,
        nombre: supply?.name ?? item.nombre,
        cantidad: Number(item.quantity),
        costoUnitario: Number(supply?.unitCost ?? item.unitCost ?? 1),
      });
    });

    return PurchaseOrder.fromApi({
      proveedor: supplierId,
      items: orderItems.map((entry) => entry.toApi()),
      status: 'REQUESTED',
    });
  }

  function getFromStore(id) {
    return purchaseOrders.value.find((order) => order.id === id);
  }

  function saveInStore(newOrder) {
    const oldIndex = findReplace(purchaseOrders.value, (old) => old.id === newOrder.id, newOrder);
    if (oldIndex < 0) {
      purchaseOrders.value.push(newOrder);
    }
  }


  return {
    purchaseOrders, suppliers, selectedOrderId, status, lock,
    selectedOrder, pendingOrders, locked,
    get, fetchOne, fetchAll, add, updateStatus, fetchAllSuppliers,
    buildOrderFromItems, getFromStore, saveInStore,
  };
});