import { ValidationError, equalsByProperties } from './utils.js';


export class Consumption {
  supplyId = null;
  quantity = 0;
  consultationId = null;
  message = '';
  name = '';
  remainingStock = null;

  constructor({ supplyId, quantity, consultationId, message, name, remainingStock }) {
    this.supplyId = supplyId ?? this.supplyId;
    this.quantity = quantity ?? this.quantity;
    this.consultationId = consultationId ?? this.consultationId;
    this.message = message || this.message;
    this.name = name || this.name;
    this.remainingStock = remainingStock ?? this.remainingStock;
  }

  validate() {
    if (!this.supplyId) {
      throw new ValidationError('Insumo requerido', 'supplyId');
    }
    if (!(Number.isInteger(this.quantity) && this.quantity > 0)) {
      throw new ValidationError('Cantidad invalida', 'quantity');
    }

    return true;
  }

  toApi() {
    const data = {
      supplyId: this.supplyId,
      quantity: this.quantity,
      consultationId: this.consultationId,
      message: this.message,
      name: this.name,
      remainingStock: this.remainingStock,
    };

    return data;
  }

  static fromApi(data) {
    return new Consumption({
      supplyId: data.supply_id ?? data.supplyId ?? null,
      quantity: Number(data.quantity ?? 0),
      consultationId: data.consultation_id ?? data.consultationId ?? null,
      message: data.message ?? '',
      name: data.name ?? '',
      remainingStock: data.remaining_stock ?? null,
    });
  }

  toApiCreate() {
    const data = {
      supply_id: this.supplyId,
      quantity: this.quantity,
    };

    if (this.consultationId != null) {
      data.consultation_id = this.consultationId;
    }

    return data;
  }

  equals(other) {
    return equalsByProperties(this, other, ['supplyId', 'quantity', 'consultationId']);
  }
}
