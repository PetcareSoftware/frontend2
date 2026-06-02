import { ValidationError, equalsByProperties } from './utils.js';
import { Batch } from './batch.js';


export class Supply {
  id = null;
  sku = '';
  name = '';
  description = '';
  type = '';
  category = '';
  quantity = 0;
  unitCost = 0;
  minStock = 10;
  umbral = 10;
  batches = [];

  constructor({
    id, sku, name, description, type, category,
    quantity, unitCost, minStock, umbral, batches,
  }) {
    this.id = id ?? this.id;
    this.sku = sku || this.sku;
    this.name = name || this.name;
    this.description = description ?? this.description;
    this.type = type || this.type;
    this.category = category || this.category;
    this.quantity = quantity ?? this.quantity;
    this.unitCost = unitCost ?? this.unitCost;
    this.minStock = minStock ?? umbral ?? this.minStock;
    this.umbral = this.minStock;
    this.batches = Array.isArray(batches) ?
      batches.map((entry) => entry instanceof Batch ? entry : Batch.fromApi(entry)) :
      [];
  }

  validate() {
    if (!this.name) {
      throw new ValidationError('Nombre vacío', 'name');
    }
    if (!(this.category || this.type)) {
      throw new ValidationError('Categoría vacía', 'category');
    }
    if (!(Number.isInteger(this.minStock) && this.minStock >= 1)) {
      throw new ValidationError('Stock mínimo inválido', 'minStock');
    }

    return true;
  }

  toApi() {
    const data = {
      name: this.name,
      category: this.category || this.type,
      description: this.description || '',
      min_stock: this.minStock,
    };

    if (this.sku) {
      data.sku = this.sku;
    }

    return data;
  }

  static fromApi(data) {
    const batches = data.batches ?? data.lots ?? [];
    const minStock = Number(data.min_stock ?? data.min_stock_alert ?? data.minStock ?? data.umbral ?? 10);

    return new Supply({
      id: data.id ?? null,
      sku: data.sku ?? '',
      name: data.name ?? '',
      description: data.description ?? '',
      type: data.type ?? data.category ?? '',
      category: data.category ?? '',
      quantity: Number(data.quantity ?? data.current_stock ?? 0),
      unitCost: Number(data.unitCost ?? data.unit_cost ?? 0),
      minStock,
      umbral: minStock,
      batches: Array.isArray(batches) ? batches.map((batch) => Batch.fromApi(batch)) : [],
    });
  }

  toApiCreate(initialStock = null) {
    const data = this.toApi();

    if (initialStock != null) {
      data.initial_stock = Number(initialStock);
    }

    return data;
  }

  toApiUpdate() {
    return this.toApi();
  }

  equals(other) {
    if (!other) {
      return false;
    }

    return this.id != null && other.id != null ?
      this.id === other.id :
      equalsByProperties(this, other, ['sku', 'name']);
  }
}