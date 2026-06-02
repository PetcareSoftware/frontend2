import {
  ValidationError, DATE_REGEXP
} from "./utils";


export class Batch {
  batch = '';
  expirationDate = '';

  constructor({ batch, expirationDate }) {
    this.batch = batch || this.batch;
    this.expirationDate = expirationDate || this.expirationDate;
  }

  validate() {
    if (! this.batch) {
      throw new ValidationError('Código de lote inválido');
    }
    if (! DATE_REGEXP.test(this.expirationDate)) {
      throw new ValidationError('Fecha de vencimiento inválida');
    }

    return true;
  }
}
