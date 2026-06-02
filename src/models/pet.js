import {
  ValidationError, NEG_NAME_REGEXP, DATE_REGEXP
} from './utils.js';


export class Pet {
  id = '';
  ownerId = '';
  name = '';
  species = '';
  breed = '';
  birthDate = '';
  weight = 0;
  color = '';
  microchip = '';

  static SPECIES = {
    dog: 'dog',
    cat: 'cat',
    bird: 'bird',
    rabbit: 'rabbit',
    other: 'other',
  };

  constructor({ id, ownerId, name, species, breed, birthDate, weight, color, microchip }) {
    this.id = id;
    this.ownerId = ownerId || this.ownerId;
    this.name = name || this.name;
    this.species = species || this.species;
    this.breed = breed || this.breed;
    this.birthDate = birthDate || this.birthDate;
    this.weight = weight;
    this.color = color;
    this.microchip = microchip;
  }

  validate() {
    if (! this.ownerId) {
      throw new ValidationError('ID de propietario vacío', 'ownerId');
    }
    if (NEG_NAME_REGEXP.test(this.name)) {
      throw new ValidationError('Nombre inválido', 'name');
    }
    if (! this.constructor.SPECIES.includes(this.species)) {
      throw new ValidationError('Especie inválida', 'species')
    }
    if (NEG_NAME_REGEXP.test(this.breed)) {
      throw new ValidationError('Especie inválida', 'breed');
    }
    if (this.birthDate && ! DATE_REGEXP.test(this.birthDate)) {
      throw new ValidationError('Fecha de nacimiento inválida', 'birthDate');
    }
    if (this.weight && !(typeof this.weight === 'number' && this.weight >= 0)) {
      throw new ValidationError('Peso inválido', 'weight');
    }
    if (this.color && NEG_NAME_REGEXP.test(this.color)) {
      throw new ValidationError('Color inválido', 'color');
    }

    return true;
  }

  toApi() {
    const data = {
      id: this.id,
      owner_id: this.ownerId,
      name: this.name,
      species: this.species,
      breed: this.breed,
      date_of_birth: this.birthDate,
      sex: 'M',
      weight_kg: this.weight,
      created_at: new Date().toISOString(),
    };

    return data;
  }

  static fromApi(data) {
    return new Pet({
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      birthDate: data.date_of_birth,
      weight: data.weight_kg,
    });
  }

  toApiUpdate() {
    let data = this.toApi();
    delete data.id;
    delete data.owner_id;
    delete data.created_at;

    return data;
  }

  equals(other) {
    return this.id === other.id || (
      this.ownerId === other.owner_id && this.name.toLowerCase() === other.name.toLowerCase() );
  }
}
