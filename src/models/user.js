import {
  ValidationError, NEG_NAME_REGEXP, EMAIL_SIMPLE_REGEXP
} from './utils.js';


export class User {
  id = ''
  name = ''
  email = ''

  constructor({ id, name, email }) {
    this.id = id;
    this.name = name || this.name;
    this.email = email || this.email;
  }

  validate() {
    if (NEG_NAME_REGEXP.test(this.name)) {
      throw new ValidationError('Nombre inválido', 'name');
    }
    if (! EMAIL_SIMPLE_REGEXP.test(this.email)) {
      throw new ValidationError('Correo inválido', 'email');
    }

    return true;
  }

  toApi() {
    const [first_name, last_name] = this.name.split(" ", 1);
    const data = {
      id: this.id,
      email: this.email,
      first_name,
      last_name,
    };

    return data;
  }

  static fromApi(data) {
    return new User({
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      email: data?.email,
    });
  }

  toApiCreate() {
    const data = this.toApi();
    delete data.id;

    return data;
  }

  equals(other) {
    return this.id === other.id || this.email === other.email || (
      this.name.toLowerCase() === other.name.toLowerCase() );
  }
}
