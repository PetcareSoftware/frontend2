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
  batches = [];

  constructor({
    id, sku, name, description, type, category,
    quantity, unitCost, minStock, batches,
  }) {
    this.id = id ?? this.id;
    this.sku = sku || this.sku;
    this.name = name || this.name;
    this.description = description ?? this.description;
    this.type = type || this.type;
    this.category = category || this.category;
    this.quantity = quantity ?? this.quantity;
    this.unitCost = unitCost ?? this.unitCost;
    this.minStock = minStock ?? this.minStock;
    this.batches = Array.isArray(batches) ?
      batches.map((entry) => entry instanceof Batch ? entry : Batch.fromApi(entry)) :
      [];
  }

  validate() {
    if (!this.name) {
      throw new ValidationError('Nombre vacio', 'name');
    }
    if (!(this.category || this.type)) {
      throw new ValidationError('Categoria vacia', 'category');
    }
    if (!(Number.isInteger(this.minStock) && this.minStock >= 1)) {
      throw new ValidationError('Stock minimo invalido', 'minStock');
    }

    return true;
  }

  toApi() {
    const data = {
      id: this.id,
      sku: this.sku,
      name: this.name,
      description: this.description,
      type: this.type,
      category: this.category || this.type,
      quantity: this.quantity,
      unitCost: this.unitCost,
      minStock: this.minStock,
      batches: this.batches.map((batch) => batch.toApi()),
    };

    return data;
  }

  static fromApi(data) {
    const batches = data.batches ?? data.lots ?? [];

    return new Supply({
      id: data.id ?? null,
      sku: data.sku ?? '',
      name: data.name ?? '',
      description: data.description ?? '',
      type: data.type ?? data.category ?? '',
      category: data.category ?? data.type ?? '',
      quantity: Number(data.quantity ?? data.current_stock ?? 0),
      unitCost: Number(data.unitCost ?? data.unit_cost ?? 0),
      minStock: Number(data.min_stock ?? data.minStock ?? data.umbral ?? 10),
      batches: Array.isArray(batches) ? batches.map((batch) => Batch.fromApi(batch)) : [],
    });
  }

  toApiCreate(initialStock = null) {
    const data = {
      name: this.name,
      category: this.category || this.type,
      description: this.description || '',
      min_stock: this.minStock,
    };

    if (this.sku) {
      data.sku = this.sku;
    }
    if (initialStock != null) {
      data.initial_stock = Number(initialStock);
    }

    return data;
  }

  toApiUpdate() {
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

  equals(other) {
    if (!other) {
      return false;
    }

    return this.id != null && other.id != null ?
      this.id === other.id :
      equalsByProperties(this, other, ['sku', 'name']);
  }
}
