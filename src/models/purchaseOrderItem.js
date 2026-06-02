import { ValidationError } from './utils.js';


export class PurchaseOrderItem {
  id = null;
  supplyId = null;
  supplyName = '';
  supplySku = '';
  quantity = 0;
  unitCost = 0;

  constructor({ id, supplyId, supplyName, supplySku, quantity, unitCost }) {
    this.id = id ?? this.id;
    this.supplyId = supplyId ?? this.supplyId;
    this.supplyName = supplyName || this.supplyName;
    this.supplySku = supplySku || this.supplySku;
    this.quantity = quantity ?? this.quantity;
    this.unitCost = unitCost ?? this.unitCost;
  }

  validate() {
    if (!this.supplyId) {
      throw new ValidationError('Insumo requerido', 'supplyId');
    }
    if (!(Number.isInteger(this.quantity) && this.quantity > 0)) {
      throw new ValidationError('Cantidad inválida', 'quantity');
    }
    if (!(typeof this.unitCost === 'number' && this.unitCost > 0)) {
      throw new ValidationError('Costo unitario inválido', 'unitCost');
    }

    return true;
  }

  toApi() {
    return {
      insumoId: this.supplyId,
      nombre: this.supplyName || undefined,
      cantidad: this.quantity,
      costoUnitario: this.unitCost,
    };
  }

  static fromApi(data) {
    return new PurchaseOrderItem({
      id: data.id ?? null,
      supplyId: data.supply ?? data.supply_id ?? data.supplyId ?? data.insumoId,
      supplyName: data.supply_name ?? data.nombre ?? '',
      supplySku: data.supply_sku ?? '',
      quantity: Number(data.quantity_requested ?? data.cantidad ?? data.quantity ?? 0),
      unitCost: Number(data.unit_cost ?? data.costoUnitario ?? data.unitCost ?? 0),
    });
  }

  equals(other) {
    return this.id != null && other?.id != null ?
      this.id === other.id :
      this.supplyId === other?.supplyId && this.quantity === other?.quantity;
  }
}