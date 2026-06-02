import {
  ValidationError, DATE_REGEXP
} from "./utils";


export class Consultation {
  id = '';
  appointmentId = '';
  petId = '';
  vetId = '';
  date = '';
  weight = 0;
  temperature = 0;
  symptoms = '';
  diagnosis = '';
  treatment = '';
  prescriptions = [''];
  followUpDate = '';
  notes = '';

  constructor({
    id, appointmentId, petId, vetId, date, weight, temperature, symptoms, diagnosis,
    treatment, prescriptions, followUpDate, notes
  }) {
    this.id = id;
    this.appointmentId = appointmentId || this.appointmentId;
    this.petId = petId || this.petId;
    this.vetId = vetId || this.vetId;
    this.date = date || this.date;
    this.weight = weight;
    this.temperature = temperature;
    this.symptoms = symptoms || this.symptoms;
    this.diagnosis = diagnosis || this.diagnosis;
    this.treatment = treatment || this.treatment;
    this.prescriptions = prescriptions || [];
    this.followUpDate = followUpDate;
    this.notes = notes;
  }

  validate() {
    if (! this.appointmentId) {
      throw new ValidationError('ID de cita vacío', 'appointmentId');
    }
    if (! this.petId) {
      throw new ValidationError('ID de mascota vacío', 'petId');
    }
    if (! this.vetId) {
      throw new ValidationError('ID de veterinario vacío', 'vetId');
    }
    if (! DATE_REGEXP.test(this.date)) {
      throw new ValidationError('Fecha de consulta inválida', 'date');
    }
    if (this.weight && !(typeof this.weight === 'number' && this.weight >= 0)) {
      throw new ValidationError('Peso inválida', 'weight');
    }
    if (this.temperature && !(typeof this.temperature === 'number' && this.temperature >= -273.16)) {
      throw new ValidationError('Temperatura inválida', 'temperature');
    }
    if (! this.symptoms) {
      throw new ValidationError('Síntomas no están definidos', 'symptoms');
    }
    if (! this.diagnosis) {
      throw new ValidationError('Diagnóstico vacío', 'diagnosis');
    }
    if (! this.treatment) {
      throw new ValidationError('Tratamiento vacío', 'treatment');
    }
    if (! (this.prescriptions && this.prescriptions.every && this.prescriptions.every(p => p))) {
      throw new ValidationError('Prescripciones vacías', 'prescriptions');
    }
    if (this.followUpDate && ! DATE_REGEXP.test(this.followUpDate)) {
      throw new ValidationError('Fecha de próxima consulta inválida', 'date');
    }
    if (this.notes && typeof this.notes !== 'string') {
      throw new ValidationError('Notas inválidas', 'notes');
    }

    return true;
  }
}
