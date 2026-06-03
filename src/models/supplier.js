import { ValidationError, EMAIL_SIMPLE_REGEXP } from './utils.js';


export class Supplier {
  id = null;
  name = '';
  email = '';
  phone = '';
  address = '';

  constructor({ id, name, email, phone, address }) {
    this.id = id ?? this.id;
    this.name = name || this.name;
    this.email = email || this.email;
    this.phone = phone || this.phone;
    this.address = address || this.address;
  }

  validate() {
    if (!this.name) {
      throw new ValidationError('Nombre vacío', 'name');
    }
    if (this.email && !EMAIL_SIMPLE_REGEXP.test(this.email.split('@')[0])) {
      throw new ValidationError('Correo inválido', 'email');
    }

    return true;
  }

  toApi() {
    const data = {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
    };

    return data;
  }

  static fromApi(data) {
    return new Supplier({
      id: data.id ?? null,
      name: data.name ?? '',
      email: data.email ?? data.contact_email ?? '',
      phone: data.phone ?? '',
      address: data.address ?? '',
    });
  }

  toApiCreate() {
    const data = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
    };

    return data;
  }

  equals(other) {
    return this.id != null && other?.id != null && this.id === other.id;
  }
}
