import {
  ValidationError, NEG_NAME_REGEXP
} from './utils.js';


export class Veterinarian {
  id = '';
  name = '';
  specialty = '';
  avatar = '';

  constructor({ id, name, specialty, avatar }) {
    this.id = id;
    this.name = name || this.name;
    this.specialty = specialty || this.specialty;
    this.avatar = avatar;
  }

  validate() {
    if (NEG_NAME_REGEXP.test(this.name)) {
      throw new ValidationError('Nombre inválido', 'name');
    }
    if (NEG_NAME_REGEXP.test(this.specialty)) {
      throw new ValidationError('Especialidad inválida', 'specialty');
    }

    return true;
  }
}
