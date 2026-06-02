import { ValidationError } from './utils.js';
import { PurchaseOrderItem } from './purchaseOrderItem.js';


export class PurchaseOrder {
  static STATUS_TO_API = {
    Pendiente: 'REQUESTED',
    Aprobada: 'APPROVED',
    Rechazada: 'CANCELLED',
  };

  static STATUS_UI = {
    REQUESTED: 'Pendiente',
    APPROVED: 'Aprobada',
    RECEIVED: 'Aprobada',
    CANCELLED: 'Rechazada',
  };

  id = null;
  supplierId = null;
  supplierName = '';
  managerId = null;
  status = 'REQUESTED';
  estado = 'Pendiente';
  total = 0;
  createdAt = null;
  updatedAt = null;
  items = [];

  constructor({
    id, supplierId, supplierName, managerId, status, estado,
    total, createdAt, updatedAt, items,
  }) {
    this.id = id ?? this.id;
    this.supplierId = supplierId ?? this.supplierId;
    this.supplierName = supplierName || this.supplierName;
    this.managerId = managerId ?? this.managerId;
    this.status = status || this.status;
    this.estado = estado || this.constructor.STATUS_UI[this.status] || this.estado;
    this.total = total ?? this.total;
    this.createdAt = createdAt ?? this.createdAt;
    this.updatedAt = updatedAt ?? this.updatedAt;
    this.items = Array.isArray(items) ?
      items.map((entry) => entry instanceof PurchaseOrderItem ? entry : PurchaseOrderItem.fromApi(entry)) :
      [];
  }

  validate() {
    if (!this.supplierId) {
      throw new ValidationError('Proveedor requerido', 'supplierId');
    }
    if (!this.items.length) {
      throw new ValidationError('Debe incluir al menos un ítem', 'items');
    }
    this.items.forEach((item) => item.validate());

    return true;
  }

  toApi() {
    return {
      proveedor: this.supplierId,
      items: this.items.map((item) => item.toApi()),
    };
  }

  static fromApi(data) {
    const status = data.status ?? 'REQUESTED';

    return new PurchaseOrder({
      id: data.id ?? null,
      supplierId: data.supplier ?? data.supplier_id ?? data.supplierId ?? data.proveedor ?? null,
      supplierName: data.supplier_name ?? '',
      managerId: data.manager ?? data.manager_id ?? data.managerId ?? null,
      status,
      estado: this.STATUS_UI[status] ?? data.status_display ?? data.estado ?? status,
      total: Number(data.total_cost ?? data.total ?? 0),
      createdAt: data.created_at ?? null,
      updatedAt: data.updated_at ?? null,
      items: Array.isArray(data.items) ? data.items.map((item) => PurchaseOrderItem.fromApi(item)) : [],
    });
  }

  toApiCreate() {
    return this.toApi();
  }

  toApiStatusUpdate(estado) {
    return { status: this.constructor.STATUS_TO_API[estado] ?? estado };
  }

  equals(other) {
    return this.id != null && other?.id != null && this.id === other.id;
  }
}