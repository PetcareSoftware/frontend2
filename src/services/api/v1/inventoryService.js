import api from './api.js';
import { Supply } from '@/models/supply.js';
import { Batch } from '@/models/batch.js';
import { Consumption } from '@/models/consumption.js';
import { unwrapApiList } from '@/lib/utils.js';


export const SUPPLIES_BASE = 'supplies/';
export const BATCHES_BASE = 'batches/';
export const CONSUME_BASE = 'consume/';


export class InventoryService {
  static async list(params = {}) {
    const response = await api.get(SUPPLIES_BASE, { params });
    const rows = unwrapApiList(response.data);

    return rows.map((row) => Supply.fromApi(row));
  }

  static async get(id) {
    const response = await api.get(`${SUPPLIES_BASE}${id}/`);

    return Supply.fromApi(response.data);
  }

  static async create(supply, initialStock = null) {
    const payload = supply instanceof Supply ? supply.toApiCreate(initialStock) : supply;
    const response = await api.post(SUPPLIES_BASE, payload);

    return Supply.fromApi(response.data);
  }

  static async update(id, supply) {
    const payload = supply instanceof Supply ? supply.toApiUpdate() : supply;
    const response = await api.patch(`${SUPPLIES_BASE}${id}/`, payload);

    return Supply.fromApi(response.data);
  }

  static async delete(id) {
    const response = await api.delete(`${SUPPLIES_BASE}${id}/`);

    return response.data;
  }

  static async createBatch(batch) {
    const payload = batch instanceof Batch ? batch.toApiCreate() : batch;
    const response = await api.post(BATCHES_BASE, payload);
    const body = response.data;

    if (body?.batch) {
      return Batch.fromApi(body.batch);
    }

    return null;
  }

  static async consume(consumption) {
    const payload = consumption instanceof Consumption ? consumption.toApiCreate() : consumption;
    const response = await api.post(CONSUME_BASE, payload);

    return Consumption.fromApi(response.data);
  }
}

/** @deprecated Compatibilidad con useAppStore. */
export async function listSupplies(params = {}) {
  const supplies = await InventoryService.list(params);

  return supplies.map((supply) => ({
    id: supply.id,
    sku: supply.sku,
    name: supply.name,
    category: supply.category || supply.type,
    description: supply.description,
    quantity: supply.quantity,
    unitCost: supply.unitCost,
    minStock: supply.minStock,
    batches: supply.batches.map((batch) => ({
      batch: batch.batch,
      expirationDate: batch.expirationDate,
      quantity: batch.quantity,
      initialStock: batch.initialStock,
    })),
  }));
}

/** @deprecated Compatibilidad con useAppStore. */
export async function createBatch(batch) {
  const normalized = Batch.fromApi(batch);
  const created = await InventoryService.createBatch(normalized);

  return created ? created.toApi() : null;
}

/** @deprecated Compatibilidad con useAppStore. */
export async function consumeSupply(payload) {
  const normalized = payload instanceof Consumption ? payload : Consumption.fromApi(payload);
  const result = await InventoryService.consume(normalized);

  return {
    message: result.message,
    supply_id: result.supplyId,
    name: result.name,
    remaining_stock: result.remainingStock,
  };
}
