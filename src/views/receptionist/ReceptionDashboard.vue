<script setup>
  import { computed } from 'vue';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import StatCard from '@/components/shared/StatCard.vue';
  import DashboardCard from '@/components/shared/DashboardCard.vue';
  import StatusBadge from '@/components/shared/StatusBadge.vue';
  import PetAvatar from '@/components/shared/PetAvatar.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import {
    formatDate,
    getAppointmentStats,
    getPet,
    getVet,
    getTodayAppointments,
    getTodayDate,
    getAppointmentsByVet,
    timeSlots,
  } from '@/lib/petcare';

  const appStore = useAppStore();
  const todayDate = computed(() => getTodayDate());
  const todayAppointments = computed(() => getTodayAppointments(appStore.appointments));
  const stats = computed(() => getAppointmentStats(todayAppointments.value));

  const vetAvailability = computed(() => {
    return appStore.vets.map(vet => {
      const vetAppointments = getAppointmentsByVet(todayAppointments.value, vet.id);
      const occupiedSlots = vetAppointments.map(a => a.time);
      const availableSlots = timeSlots.filter(t => !occupiedSlots.includes(t));
      return {
        vet,
        availableSlots,
      };
    });
  });
</script>

<template>
  <div class="stack">
    <PageHeader
      title="Dashboard de Recepción"
      subtitle="Operaciones del día, agenda y acciones rápidas."
    />

    <section class="grid grid--4">
      <StatCard label="Programadas" :value="stats.scheduled" icon="calendar-days" />
      <StatCard
        label="Confirmadas"
        :value="stats.confirmed"
        icon="check-circle-2"
        tone-class="chip--sage"
      />
      <StatCard
        label="En consulta"
        :value="stats.in_progress"
        icon="stethoscope"
        tone-class="chip--warning"
      />
      <StatCard
        label="En espera"
        :value="stats.waiting"
        icon="hourglass"
        tone-class="chip--cream"
      />
    </section>

    <section class="split">
      <DashboardCard title="Agenda de hoy" icon="calendar-days">
        <div class="list">
          <article
            v-for="appointment in todayAppointments"
            :key="appointment.id"
            class="list__item"
          >
            <div class="toolbar__group">
              <PetAvatar :pet="getPet(appStore.pets, appointment.petId)" size="sm" />
              <div class="list__item-main">
                <p class="list__title">
                  {{ appointment.time }} · {{ getPet(appStore.pets, appointment.petId)?.name }}
                  <span v-if="appointment.type === 'Emergencia'" class="chip chip--danger chip--sm chip--shift-up" style="margin-left: 8px;">
                    Emergencia{{appointment.priority ? ` (${appointment.priority})`: ''}}
                  </span>
                </p>
                <p class="list__subtitle">
                  {{ appointment.reason }} · {{ getVet(appStore.vets, appointment.vetId)?.name }}
                </p>
              </div>
            </div>
            <div class="toolbar__group" style="gap: 0.5rem">
              <StatusBadge :status="appointment.status" />
              <button
                v-if="appointment.status === 'scheduled'"
                @click="appStore.updateAppointment({ ...appointment, status: 'confirmed' })"
                class="btn btn--sm btn--soft"
              >
                Confirmar
              </button>
              <button
                v-if="appointment.status === 'confirmed'"
                @click="appStore.updateAppointment({ ...appointment, status: 'waiting' })"
                class="btn btn--sm btn--brand"
              >
                Check-in
              </button>
            </div>
          </article>
        </div>
      </DashboardCard>

 <div class="stack">
        <DashboardCard title="Resumen operativo" icon="clipboard-list">
          <div class="stack">
            <div class="hero-intro">
              <p class="eyebrow">Fecha actual</p>
              <h2 class="hero-intro__title">{{ formatDate(todayDate) }}</h2>
              <p class="hero-intro__text">
                La recepción puede usar esta vista para confirmar citas, atender llegadas y
                administrar la lista de espera.
              </p>
            </div>
            <div class="summary-grid">
              <article class="summary-grid__item card">
                <p class="summary-grid__item-title eyebrow">Agenda</p>
                <strong>{{ todayAppointments.length }}</strong>
              </article>
              <article class="summary-grid__item card">
                <p class="summary-grid__item-title eyebrow">Pacientes</p>
                <strong>{{ todayAppointments.length }}</strong>
              </article>
              <article class="summary-grid__item card">
                <p class="summary-grid__item-title eyebrow">Consultorios</p>
                <strong>3</strong>
              </article>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Disponibilidad Veterinaria" icon="clock">
          <div class="stack">
            <article v-for="v in vetAvailability" :key="v.vet.id" class="card">
              <div class="toolbar__group" style="justify-content: space-between; margin-bottom: 0.5rem">
                <strong>{{ v.vet.name }}</strong>
                <span class="chip chip--sage">{{ v.availableSlots.length }} libres</span>
              </div>
              <div class="schedule-grid">
                <span v-for="time in v.availableSlots" :key="time" class="schedule-grid__slot chip chip--sm">
                  {{ time }}
                </span>
                <p v-if="!v.availableSlots.length" class="schedule-grid__info muted">Sin turnos disponibles hoy.</p>
              </div>
            </article>
          </div>
        </DashboardCard>
      </div>
    </section>
  </div>
</template>

<style scoped>
.schedule-grid {
  display: grid;
  gap: 0.25rem;
  justify-content: space-evenly;
  grid-template-columns: repeat(auto-fill, calc((2px + 0.5rem)*2 + 3.75ch));
}

.schedule-grid__slot {
  font-size: 0.75rem;
}

.schedule-grid__info {
  font-size: 0.8rem;
}
</style>
