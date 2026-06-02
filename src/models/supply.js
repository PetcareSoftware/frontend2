import { ValidationError } from "./utils";
import { Batch } from "./batch";


export class Supply {
  id = '';
  name = '';
  type = '';
  quantity = 0;
  unitCost = 0;
  minStock = 0;
  batches = [new Batch('A', '1970-01-01')];

  constructor({ id, name, type, quantity, unitCost, minStock, batches }) {
    this.id = id;
    this.name = name || this.name;
    this.type = type || this.type;
    this.quantity = quantity || this.quantity;
    this.unitCost = unitCost || this.unitCost;
    this.minStock = minStock || this.minStock;
    this.batches = Array.isArray(batches) ?
      batches.map(batch => new Batch(batch)) :
      batches || [];
  }

  validate() {
    if (! this.name) {
      throw new ValidationError('Nombre vacío', 'name');
    }
    if (! this.type) {
      throw new ValidationError('Tipo vacío', 'type');
    }
    if (! (Number.isInteger(this.quantity) && this.quantity >= 0)) {
      throw new ValidationError('Cantidad inválida', 'quantity');
    }
    if (!(typeof this.unitCost === 'number' && this.unitCost >= 0)) {
      throw new ValidationError('Costo unitario inválido', 'unitCost');
    }
    if (! (Number.isInteger(this.minStock) && this.minStock >= 0)) {
      throw new ValidationError('Nivel mínimo inválido', 'minStock');
    }
    if (!Array.isArray(this.batches) || this.batches.length === 0) {
      throw new ValidationError('Debe haber al menos un lote', 'batches');
    }
    if (! (this.batches && this.batches.every)) {
      throw new ValidationError('Lotes vacíos', 'batches');
    }
    try {
      this.batches.every(batch => batch.validate());
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new ValidationError('Lotes inválidos', 'batches', { cause: e });
      }
      throw e;
    }

    return true;
  }
}
