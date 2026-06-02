import { ValidationError } from "./utils";
import { Treatment } from "./treatment";


export class Vaccination extends Treatment {
  name = '';
  lot = '';
  notes = '';

  constructor({ id, petId, name, date, nextDate, appliedBy, lot, notes }) {
    super({ id, petId, date, nextDate, appliedBy });
    this.name = name || this.name;
    this.lot = lot || this.lot;
    this.notes = notes;
  }

  validate() {
    super.validate();

    if (! this.name) {
      throw new ValidationError('Nombre de vacuna vacío', 'name');
    }
    if (! this.lot) {
      throw new ValidationError('Número de lote vacío', 'lot');
    }
    if (this.notes && typeof this.notes !== 'string') {
      throw new ValidationError('Notas inválidas', 'notes');
    }

    return true;
  }
}
