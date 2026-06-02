import {
  ValidationError, DATE_REGEXP, TIME_REGEXP
} from "./utils";


export class Appointment {
  id = '';
  petId = '';
  ownerId = '';
  vetId = '';
  date = '';
  time = '';
  reason = '';
  status = '';

  static STATUS = {
    scheduled: 'scheduled',
    confirmed: 'confirmed',
    waiting: 'waiting',
    in_progress: 'in_progress',
    completed: 'completed',
    cancelled: 'cancelled',
  }

  constructor({ id, petId, ownerId, vetId, date , time , reason , status }) {
    this.id = id;
    this.petId = petId || this.petId;
    this.ownerId = ownerId || this.ownerId;
    this.vetId = vetId;
    this.date = date || this.date;
    this.time = time || this.time;
    this.reason = reason || this.reason;
    this.status = status;
  }

  validate() {
    if (! this.petId) {
      throw new ValidationError('ID de mascota vacío', 'petId');
    }
    if (! this.ownerId) {
      throw new ValidationError('ID de propietario vacío', 'ownerId');
    }
    if (! DATE_REGEXP.test(this.date)) {
      throw new ValidationError('Fecha inválida', 'date');
    }
    if (! TIME_REGEXP.test(this.time)) {
      throw new ValidationError('Hora inválida', 'time');
    }
    if (! this.reason) {
      throw new ValidationError('Razón vacía', 'reason');
    }
    if (! (this.status in this.constructor.STATUS)) {
      throw new ValidationError('Estado inválido', 'status');
    }

    return true;
  }
}
