import api from './api.js';
import { PurchaseOrder } from '@/models/purchaseOrder.js';
import { Supplier } from '@/models/supplier.js';
import { unwrapApiList } from '@/models/utils.js';


export const PURCHASE_ORDERS_BASE = 'purchase-orders/';
export const SUPPLIERS_BASE = 'suppliers/';


export class PurchaseService {
  static async list(params = {}) {
    const response = await api.get(PURCHASE_ORDERS_BASE, { params });
    const rows = unwrapApiList(response.data);

    return rows.map((row) => PurchaseOrder.fromApi(row));
  }

  static async get(id) {
    const response = await api.get(`${PURCHASE_ORDERS_BASE}${id}/`);

    return PurchaseOrder.fromApi(response.data);
  }

  static async create(order) {
    const payload = order instanceof PurchaseOrder ? order.toApiCreate() : order;
    const response = await api.post(PURCHASE_ORDERS_BASE, payload);

    return PurchaseOrder.fromApi(response.data);
  }

  static async delete(id) {
    const response = await api.delete(`${PURCHASE_ORDERS_BASE}${id}/`);

    return response.data;
  }

  static async updateStatus(id, estado) {
    const status = PurchaseOrder.STATUS_TO_API[estado] ?? estado;

    let response;
    if (status === 'APPROVED') {
      response = await api.post(`${PURCHASE_ORDERS_BASE}${id}/approve/`, {});
    } else if (status === 'CANCELLED') {
      response = await api.post(`${PURCHASE_ORDERS_BASE}${id}/cancel/`, { reason: '' });
    } else {
      response = await api.get(`${PURCHASE_ORDERS_BASE}${id}/`);
    }

    return PurchaseOrder.fromApi(response.data);
  }

  static async listSuppliers(params = {}) {
    const response = await api.get(SUPPLIERS_BASE, { params });
    const rows = unwrapApiList(response.data);

    return rows.map((row) => Supplier.fromApi(row));
  }

  static async getSupplier(id) {
    const response = await api.get(`${SUPPLIERS_BASE}${id}/`);

    return Supplier.fromApi(response.data);
  }
}

/** @deprecated Compatibilidad con useAppStore. */
export async function listPurchaseOrders(params = {}) {
  const orders = await PurchaseService.list(params);

  return orders.map((order) => ({
    id: order.id,
    supplier: order.supplierId,
    supplier_name: order.supplierName,
    manager: order.managerId,
    total_cost: order.total,
    status: order.status,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      supply: item.supplyId,
      supply_name: item.supplyName,
      supply_sku: item.supplySku,
      quantity_requested: item.quantity,
      unit_cost: item.unitCost,
    })),
  }));
}

/** @deprecated Compatibilidad con useAppStore. */
export async function createPurchaseOrder(order) {
  const created = await PurchaseService.create(order);

  return {
    id: created.id,
    supplier: created.supplierId,
    supplier_name: created.supplierName,
    manager: created.managerId,
    total_cost: created.total,
    status: created.status,
    created_at: created.createdAt,
    updated_at: created.updatedAt,
    items: created.items.map((item) => ({
      id: item.id,
      supply: item.supplyId,
      quantity_requested: item.quantity,
      unit_cost: item.unitCost,
    })),
  };
}

/** @deprecated Compatibilidad con useAppStore. */
export async function updatePurchaseOrderStatus(orderId, status) {
  const updated = await PurchaseService.updateStatus(orderId, status);

  return {
    id: updated.id,
    supplier: updated.supplierId,
    supplier_name: updated.supplierName,
    manager: updated.managerId,
    total_cost: updated.total,
    status: updated.status,
    created_at: updated.createdAt,
    updated_at: updated.updatedAt,
    items: updated.items.map((item) => ({
      id: item.id,
      supply: item.supplyId,
      quantity_requested: item.quantity,
      unit_cost: item.unitCost,
    })),
  };
}

/** @deprecated Compatibilidad con useAppStore. */
export async function listSuppliers(params = {}) {
  const suppliers = await PurchaseService.listSuppliers(params);

  return suppliers.map((supplier) => supplier.toApi());
}