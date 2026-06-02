import { ValidationError } from "./utils";


export class RevenueData {
  label = '';
  amount = 0;

  constructor({ label, amount }) {
    this.label = label || this.label;
    this.amount = amount || this.amount;
  }

  validate() {
    if (! this.label) {
      throw new ValidationError('Etiqueta de dato vacía', 'label');
    }
    if (! Number.isFinite(this.amount)) {
      throw new ValidationError('Cantidad inválida', 'amount');
    }

    return true;
  }
}
