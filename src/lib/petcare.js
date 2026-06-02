import { timeSlots as seedTimeSlots } from '@/data/mockData';
import { ref } from 'vue';
import { daysFromNow, getTodayDate, getTodayShortDate } from './utils';
export { daysFromNow , getTodayDate, getTodayShortDate };

export const statusMeta = {
  scheduled: { label: 'Programada', className: 'chip--brand' },
  confirmed: { label: 'Confirmada', className: 'chip--success' },
  waiting: { label: 'En Espera', className: 'chip--cream' },
  in_progress: { label: 'En Consulta', className: 'chip--warning' },
  completed: { label: 'Completada', className: 'chip--sage' },
  cancelled: { label: 'Cancelada', className: 'chip--danger' },
};

export const speciesMeta = {
  dog: { label: 'Perro', icon: 'dog', className: 'chip--brand' },
  cat: { label: 'Gato', icon: 'cat', className: 'chip--sage' },
  bird: { label: 'Ave', icon: 'bird', className: 'chip--cream' },
  rabbit: { label: 'Conejo', icon: 'rabbit', className: 'chip--warning' },
  other: { label: 'Otro', icon: 'paw-print', className: 'chip--brand' },
};

export const breedsBySpecies = {
  dog: ['Golden Retriever', 'Bulldog Francés', 'Pastor Alemán', 'Labrador', 'Boxer', 'Mestizo', 'Otro'],
  cat: ['Persa', 'Siamés', 'Bengala', 'Mestizo', 'Otro'],
  bird: ['Canario', 'Loro', 'Otro'],
  rabbit: ['Enano', 'Belier', 'Otro'],
  other: ['Otro'],
};

export const petFormTemplate = {
  name: '',
  species: 'dog',
  breed: 'Golden Retriever',
  sex: 'M',
  birthDate: '',
  weight: '',
  color: '',
  notes: '',
};

export const sexCodeToName = {
  M: 'Macho',
  F: 'Hembra',
}

export const appointmentTransitions = {
  scheduled: ["scheduled", "confirmed", "waiting", "in_progress", "cancelled"],
  confirmed: ["scheduled", "confirmed", "waiting", "in_progress", "cancelled"],
  waiting: ["confirmed", "waiting", "in_progress", "cancelled"],
  in_progress: ["confirmed", "waiting", "in_progress", "completed", "cancelled"],
  completed: ["in_progress", "completed"],
  cancelled: ["scheduled", "in_progress", "cancelled"],
};

export function getSpeciesLabel(codename) {
  const species = speciesMeta[codename];
  return species && species.label || 'Otro';
}

export function formatDate(value, locale = 'es-VE') {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export function formatDateLong(value, locale = 'es-VE') {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(`${value}T12:00:00`)
  );
}

export function formatMoney(
  value,
  { locale = 'en-US', currency = 'USD', maximumFractionDigits = 0 } = {}
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(value);
}

export function getOwner(owners, ownerId) {
  return owners.find((owner) => owner.id === ownerId);
}

export function getPet(pets, petId) {
  return pets.find((pet) => pet.id === petId);
}

export function getVet(vets, vetId) {
  return vets.find((vet) => vet.id === vetId);
}

export function getOwnerPets(pets, ownerId) {
  return pets.filter((pet) => pet.ownerId === ownerId);
}

export function getOwnerAppointments(appointments, ownerId) {
  return appointments
    .filter((appointment) => appointment.ownerId === ownerId)
    .slice()
    .sort(sortAppointments);
}

export function getPetAppointments(appointments, petId) {
  return appointments
    .filter((appointment) => appointment.petId === petId)
    .slice()
    .sort(sortAppointments);
}

export function getPetConsultations(consultations, petId) {
  return consultations
    .filter((consultation) => consultation.petId === petId)
    .slice()
    .sort(sortByDateDesc);
}

export function getPetVaccines(vaccines, petId) {
  return vaccines
    .filter((item) => item.petId === petId)
    .slice()
    .sort(sortByDateDesc);
}

export function getPetDewormings(dewormings, petId) {
  return dewormings
    .filter((item) => item.petId === petId)
    .slice()
    .sort(sortByDateDesc);
}

export function getAppointmentsByDate(appointments, date) {
  return appointments
    .filter((appointment) => appointment.date === date)
    .slice()
    .sort(sortAppointments);
}


export function getTodayAppointments(appointments, date = getTodayDate()) {
  return getAppointmentsByDate(appointments, date);
}


export function sortAppointments(left, right) {
  return `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`);
}

function sortByDateDesc(left, right) {
  return `${right.date}`.localeCompare(`${left.date}`);
}

export function countByStatus(appointments, status) {
  return appointments.filter((appointment) => appointment.status === status).length;
}

export function countUpcoming(appointments, today = getTodayDate()) {
  return appointments.filter(
    (appointment) => appointment.date >= today && appointment.status !== 'cancelled'
  ).length;
}

export function countCompleted(appointments) {
  return appointments.filter((appointment) => appointment.status === 'completed').length;
}

export function countWaiting(appointments) {
  return appointments.filter((appointment) => appointment.status === 'waiting').length;
}

export function getAppointmentStats(appointments) {
  return {
    scheduled: countByStatus(appointments, 'scheduled'),
    confirmed: countByStatus(appointments, 'confirmed'),
    in_progress: countByStatus(appointments, 'in_progress'),
    completed: countCompleted(appointments),
    waiting: countWaiting(appointments),
  };
}

export function getAppointmentsByVet(appointments, vetId) {
  return appointments
    .filter((appointment) => appointment.vetId === vetId)
    .slice()
    .sort(sortAppointments);
}

export function getLatestConsultation(consultations, petId) {
  return getPetConsultations(consultations, petId)[0] || null;
}

export function getLatestVaccine(vaccines, petId) {
  return getPetVaccines(vaccines, petId)[0] || null;
}

export function getLatestDeworming(dewormings, petId) {
  return getPetDewormings(dewormings, petId)[0] || null;
}

export const timeSlots = seedTimeSlots;

export function switchRoleLocal(item, appStore, router) {
  appStore.setRole(item.key, item.userId || undefined);

  const baseRoutes = {
    owner: '/portal/dashboard',
    vet: '/vet/dashboard',
    receptionist: '/reception/dashboard',
  };

  if (baseRoutes[item.key]) {
    router.push(baseRoutes[item.key]);
  }
}

export function getSupply(supplies, supplyId) {
  return supplies.find((supply) => supply.id === supplyId);
}

export function throttle(fn, delay = 250) {
  let wait = false;
  return function(...args) {
    if (!wait) {
      fn(...args);

      wait = true;
      setTimeout(() => { wait = false; }, delay);
    }
  }
}

export const viewSize = {
  width: ref(window.innerWidth),
  height: ref(window.innerHeight),
};
window.addEventListener("resize", throttle(() => {
  viewSize.width.value = window.innerWidth;
  viewSize.height.value = window.innerHeight;
}));
