import {
  ValidationError, DATE_REGEXP
} from './utils.js';
import { User } from './user.js';


export class Owner extends User {
  id = '';
  name = '';
  email = '';
  phone = '';
  address = '';
  createdAt = '';

  constructor({ id, name, email, phone, address, createdAt }) {
    super({ id, name, email });
    this.phone = phone || this.phone;
    this.address = address || this.address;
    this.createdAt = createdAt;
  }

  validate() {
    super.validate();

    if (this.phone && ! /^\+?[\d-]+$/.test(this.phone)) {
      throw new ValidationError('Teléfono inválido', 'phone');
    }
    if (this.createdAt && ! DATE_REGEXP.test(this.createdAt)) {
      throw new ValidationError('Fecha inválida', 'createdAt');
    }

    return true;
  }

  toApi() {
    const user = super.toApi();
    const data = {
      id: user.id,
      user: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      phone: this.phone,
      address: this.address,
      createdAt: this.createdAt,
    };

    return data;
  }

  static fromApi(data) {
    return new Owner({
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      email: data?.user.email,
      phone: data.phone,
      address: data.address,
      createdAt: data.createdAt,
    });
  }

  toApiUpdateProfile() {
    let data = this.toApi();
    data = {
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      phone: data.phone,
      address: data.address,
    };

    return data;
  }

  equals(other) {
    return super.equals(other);
  }
}
