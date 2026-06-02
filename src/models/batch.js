import {
  ValidationError, DATE_REGEXP, equalsByProperties,
} from './utils.js';


export class Batch {
  id = null;
  supplyId = null;
  batch = '';
  expirationDate = '';
  quantity = 0;
  initialStock = null;
  acquisitionCost = null;
  createdAt = null;
  supplyName = '';
  supplySku = '';
  observations = '';

  constructor({
    id, supplyId, batch, expirationDate, quantity, initialStock,
    acquisitionCost, createdAt, supplyName, supplySku, observations,
  }) {
    this.id = id ?? this.id;
    this.supplyId = supplyId ?? this.supplyId;
    this.batch = batch || this.batch;
    this.expirationDate = expirationDate || this.expirationDate;
    this.quantity = quantity ?? this.quantity;
    this.initialStock = initialStock ?? this.initialStock;
    this.acquisitionCost = acquisitionCost ?? this.acquisitionCost;
    this.createdAt = createdAt ?? this.createdAt;
    this.supplyName = supplyName || this.supplyName;
    this.supplySku = supplySku || this.supplySku;
    this.observations = observations || this.observations;
  }

  validate() {
    if (!this.batch) {
      throw new ValidationError('Código de lote inválido', 'batch');
    }
    if (!DATE_REGEXP.test(this.expirationDate)) {
      throw new ValidationError('Fecha de vencimiento inválida', 'expirationDate');
    }
    if (!(Number.isInteger(this.quantity) && this.quantity > 0)) {
      throw new ValidationError('Cantidad inválida', 'quantity');
    }

    return true;
  }

  toApi() {
    const data = {
      insumoId: this.supplyId,
      quantity: this.quantity,
      batch: this.batch,
      expirationDate: this.expirationDate,
      details: '',
      observations: this.observations || '',
    };

    if (this.acquisitionCost != null) {
      data.acquisitionCost = this.acquisitionCost;
    }

    return data;
  }

  static fromApi(data) {
    return new Batch({
      id: data.id ?? null,
      supplyId: data.supply ?? data.supply_id ?? data.supplyId ?? data.insumoId ?? null,
      batch: data.batch ?? data.lot_number ?? '',
      expirationDate: data.expirationDate ?? data.expiration_date ?? data.expiry_date ?? '',
      quantity: Number(data.quantity ?? data.current_stock ?? 0),
      initialStock: data.initial_stock ?? data.initialStock ?? null,
      acquisitionCost: data.acquisition_cost ?? data.acquisitionCost ?? null,
      createdAt: data.created_at ?? data.createdAt ?? null,
      supplyName: data.supply_name ?? '',
      supplySku: data.supply_sku ?? '',
      observations: data.observations ?? '',
    });
  }

  toApiCreate() {
    return this.toApi();
  }

  equals(other) {
    if (!other) {
      return false;
    }

    return this.id != null && other.id != null ?
      this.id === other.id :
      equalsByProperties(this, other, ['supplyId', 'batch', 'expirationDate']);
  }
}