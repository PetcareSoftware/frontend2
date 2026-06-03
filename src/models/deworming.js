import { ValidationError } from "./utils";
import { Treatment } from "./treatment";


export class Deworming extends Treatment {
  product = '';
  weight = 0;

  constructor({ id, petId, product, date, nextDate, appliedBy, weight }) {
    super({ id, petId, date, nextDate, appliedBy });
    this.product = product || this.product;
    this.weight = weight;
  }

  validate() {
    super.validate();

    if (! this.product) {
      throw new ValidationError('Producto vacío', 'product');
    }
    if (this.weight && !(typeof this.weight === 'number' && this.weight >= 0)) {
      throw new ValidationError('Peso inválida', 'weight');
    }

    return true;
  }

  toApi() {
    const data = super.toApi();
    data.product = this.product;
    data.weight = this.weight;

    return data;
  }

  toApiCreate() {
    const data = this.toApi();
    delete data.id;

    return data;
  }
}
