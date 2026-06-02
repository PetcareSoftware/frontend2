import api from './api.js';
import { Consumption } from '@/models/consumption.js';


export const CONSUME_BASE = 'consume/';


export class ConsumptionService {
  static async consume(consumption) {
    const payload = consumption instanceof Consumption ? consumption.toApi() : consumption;
    const response = await api.post(CONSUME_BASE, payload);

    return Consumption.fromApi(response.data);
  }
}

/** @deprecated Compatibilidad temporal. */
export async function consumeSupply(payload) {
  const result = await ConsumptionService.consume(payload);

  return {
    message: result.message,
    supply_id: result.supplyId,
    name: result.name,
    remaining_stock: result.remainingStock,
  };
}