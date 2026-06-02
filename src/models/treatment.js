import {
  ValidationError, DATE_REGEXP
} from "./utils";


export class Treatment {
  id = '';
  petId = '';
  date = '';
  nextDate = '';
  appliedBy = '';

  constructor({ id, petId, date, nextDate, appliedBy }) {
    this.id = id;
    this.petId = petId || this.petId;
    this.date = date || this.date;
    this.nextDate = nextDate;
    this.appliedBy = appliedBy;
  }

  validate() {
    if (! this.petId) {
      throw new ValidationError('ID de mascota vacío', 'petId');
    }
    if (! DATE_REGEXP.test(this.date)) {
      throw new ValidationError('Fecha de vacunación inválida', 'date');
    }
    if (this.nextDate && ! DATE_REGEXP.test(this.nextDate)) {
      throw new ValidationError('Fecha de próxima vacunación inválida', 'nextDate');
    }

    return true;
  }
}
