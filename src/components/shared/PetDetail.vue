<script>
  import { petFormTemplate as formTemplate } from '@/lib/petcare';
</script>
<script setup>
  import { computed, ref, watch } from 'vue';
  import PetAvatar from '@/components/shared/PetAvatar.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import {
    formatDate,
    getPet,
    getPetConsultations,
    getPetVaccines,
    getPetDewormings,
    getSpeciesLabel,
    sexCodeToName,
  } from '@/lib/petcare';

  const appStore = useAppStore();

  const props = defineProps({
    pet: {
      type: Object,
      validator(value, props) {
        if (value && props.petId) {
          return false;
        }
        return [...Object.keys(formTemplate), 'id'].every(k => k in value);
      }
    },
    petId: [Number, String],
  });

  const selectedPet = ref(null);
  // Evita computed para no reaccionar a cambios en appStore
  watch(props, () => {
    selectedPet.value = props.pet || (props.petId ? getPet(appStore.pets, props.petId) : {});
    for (const key in formTemplate) {
      selectedPet.value[key] || (selectedPet.value[key] = '');
      if (key === 'birthDate') {
        try {
          formatDate(selectedPet.value[key]);
        } catch (e) {
          selectedPet.value[key] = '';
        }
      }
    }
  }, { immediate: true });

  const selectedPetConsultations = computed(() =>
    selectedPet.value ? getPetConsultations(appStore.consultations, selectedPet.value.id) : []
  );
  const selectedPetVaccines = computed(() =>
    selectedPet.value ? getPetVaccines(appStore.vaccines, selectedPet.value.id) : []
  );
  const selectedPetDewormings = computed(() =>
    selectedPet.value ? getPetDewormings(appStore.dewormings, selectedPet.value.id) : []
  );
</script>

<template>
  <section class="card">
    <div class="stack">
      <div class="pet-header-info">
        <PetAvatar :pet="selectedPet" size="lg" style="width: 80px; height: 80px;" />
        <div>
          <h3 class="pet-name">{{ selectedPet.name || 'Sin nombre' }}</h3>
          <p class="pet-summary">
            {{ selectedPet.breed || 'Raza no registrada' }} · {{ sexCodeToName[selectedPet.sex] || 'Sexo no registrado' }}
          </p>
        </div>
      </div>

      <div class="input-grid">
        <div>
          <p class="eyebrow">Especie</p>
          <p class="pet-data">{{ getSpeciesLabel(selectedPet.species) }}</p>
        </div>
        <div>
          <p class="eyebrow">Fecha de nacimiento</p>
          <p class="pet-data">{{ selectedPet.birthDate ? formatDate(selectedPet.birthDate) : 'No registrado' }}</p>
        </div>
        <div>
          <p class="eyebrow">Peso</p>
          <p class="pet-data">{{ selectedPet.weight ? `${selectedPet.weight} kg` : 'No registrado' }}</p>
        </div>
        <div>
          <p class="eyebrow">Color</p>
          <p class="pet-data">{{ selectedPet.color || 'No registrado' }}</p>
        </div>
      </div>

      <div v-if="selectedPet.notes">
        <p class="eyebrow">Notas</p>
        <p class="pet-notes">
          {{ selectedPet.notes }}
        </p>
      </div>

      <div>
        <h4 class="history-title">Historial Clínico</h4>

        <div v-if="selectedPetConsultations.length > 0" class="history-section">
          <p class="eyebrow" style="margin-bottom: 8px;">Consultas</p>
          <div class="history-list">
            <div v-for="consult in selectedPetConsultations" :key="consult.id" class="history-item">
              <div class="history-item-header">
                <strong class="history-item-title">{{ formatDate(consult.date) }}</strong>
                <span class="chip chip--sage chip--shift-up" style="font-size: 0.75rem;">{{ consult.diagnosis || 'Sin diagnóstico' }}</span>
              </div>
              <p class="history-item-desc">{{ consult.symptoms || consult.notes || 'Consulta de rutina' }}</p>
            </div>
          </div>
        </div>

        <div v-if="selectedPetVaccines.length > 0" class="history-section">
          <p class="eyebrow" style="margin-bottom: 8px;">Vacunas</p>
          <div class="history-list">
            <div v-for="vaccine in selectedPetVaccines" :key="vaccine.id" class="history-item">
              <div class="history-item-header">
                <strong class="history-item-title">{{ vaccine.name }}</strong>
                <span class="history-item-date">{{ formatDate(vaccine.date) }}</span>
              </div>
              <p v-if="vaccine.nextDate" class="history-item-next">Próxima dosis: {{ formatDate(vaccine.nextDate) }}</p>
            </div>
          </div>
        </div>

        <div v-if="selectedPetDewormings.length > 0" class="history-section">
          <p class="eyebrow" style="margin-bottom: 8px;">Desparasitaciones</p>
          <div class="history-list">
            <div v-for="deworm in selectedPetDewormings" :key="deworm.id" class="history-item">
              <div class="history-item-header">
                <strong class="history-item-title">{{ deworm.product }}</strong>
                <span class="history-item-date">{{ formatDate(deworm.date) }}</span>
              </div>
              <p v-if="deworm.nextDate" class="history-item-next">Próxima dosis: {{ formatDate(deworm.nextDate) }}</p>
            </div>
          </div>
        </div>

        <div v-if="selectedPetConsultations.length === 0 && selectedPetVaccines.length === 0 && selectedPetDewormings.length === 0">
          <p class="muted">No hay registros médicos disponibles para esta mascota.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pet-header-info {
  display: flex;
  gap: 20px;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(194, 167, 105, 0.15);
}

.pet-name {
  margin: 0;
  font-size: 1.6rem;
  color: var(--text-strong);
}

.pet-summary {
  margin: 4px 0 0;
  color: rgba(61, 61, 61, 0.8);
  font-size: 1rem;
}

.pet-data {
  margin: 4px 0 0;
  font-weight: 600;
}

.pet-notes {
  margin: 8px 0 0;
  padding: 12px;
  background: rgba(194, 167, 105, 0.08);
  border-radius: 12px;
  line-height: 1.5;
}

.history-title {
  margin: 24px 0 16px;
  font-size: 1.2rem;
  color: var(--text-strong);
  border-bottom: 1px solid rgba(194, 167, 105, 0.15);
  padding-bottom: 8px;
}

.history-section {
  margin-bottom: 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.history-item-title {
  color: var(--text-strong);
}

.history-item-date {
  font-size: 0.85rem;
  color: var(--text-muted, rgba(61, 61, 61, 0.68));
}

.history-item-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted, rgba(61, 61, 61, 0.68));
}

.history-item-next {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted, rgba(61, 61, 61, 0.68));
}
</style>
