<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import PetAvatar from '@/components/shared/PetAvatar.vue';
  import DashboardCard from '@/components/shared/DashboardCard.vue';
  import PetForm from '@/components/shared/PetForm.vue';
  import PetDetail from '@/components/shared/PetDetail.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import {
    formatDate,
    getLatestConsultation,
    getLatestVaccine,
    getOwnerPets,
    getSpeciesLabel,
    viewSize,
  } from '@/lib/petcare';

  const appStore = useAppStore();
  const router = useRouter();
  const viewWidth = viewSize.width;

  const pets = computed(() => getOwnerPets(appStore.pets, appStore.currentUserId));
  const currentPet = ref(null);
  const isViewing = ref(true);

  function viewPet(pet) {
    if (viewWidth.value > 1180) {
      isViewing.value = true;
      currentPet.value = pet;
    } else {
      router.push(`/portal/pets/${pet.id}`);
    }
  }

  function editPet(pet) {
    if (viewWidth.value > 1180) {
      isViewing.value = false;
      currentPet.value = pet;
    } else {
      router.push(`/portal/pets/${pet.id}/edit`);
    }
  }

  function addPet() {
    if (viewWidth.value > 1180) {
      isViewing.value = false;
      currentPet.value = null;
    } else {
      router.push('/portal/pets/add');
    }
  }
</script>

<template>
  <div class="stack">
    <PageHeader title="Mis Mascotas" subtitle="Gestión de mascotas vinculadas al propietario.">
      <template #actions>
        <button class="btn btn--primary" type="button" @click="addPet">
          + Agregar Mascota
        </button>
      </template>
    </PageHeader>

    <section class="split">
      <DashboardCard title="Mascotas registradas" icon="paw-print">
        <div class="list">
          <article v-for="pet in pets" :key="pet.id" class="list__item">
            <div class="toolbar__group">
              <PetAvatar :pet="pet" size="sm" />
              <div class="list__item-main">
                <p class="list__title">{{ pet.name }}</p>
                <p class="list__subtitle">{{ pet.breed }} · {{ pet.color }}</p>
                <p class="list__subtitle">
                  Última consulta:
                  {{
                    getLatestConsultation(appStore.consultations, pet.id)?.date
                      ? formatDate(getLatestConsultation(appStore.consultations, pet.id).date)
                      : 'Sin consultas'
                  }}
                </p>
              </div>
            </div>
            <div class="stack pet-status">
              <span class="chip chip--sage">{{ getSpeciesLabel(pet.species) }}</span>
              <span class="muted"
                >Vacunas:
                {{ getLatestVaccine(appStore.vaccines, pet.id) ? 'Activas' : 'Sin datos' }}</span
              >
              <div class="pet-actions">
                <button class="btn btn--soft pet-action-btn" type="button" @click="viewPet(pet)">Ver detalle</button>
                <button class="btn btn--brand pet-action-btn" type="button" @click="editPet(pet)">Editar</button>
              </div>
            </div>
          </article>
          <p v-if="!pets.length" class="muted">Todavía no hay mascotas asociadas.</p>
        </div>
      </DashboardCard>

      <PetDetail v-if="isViewing" class="pet-form" :pet="currentPet"/>
      <PetForm v-else class="pet-form" :pet="currentPet"
        @cancel="currentPet = null" @save="currentPet = null"
      />
    </section>
  </div>
</template>

<style scoped>
.pets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pet-status {
  justify-items: end;
  gap: 8px;
}

.pet-actions {
  display: flex;
  gap: 8px;
}

.pet-action-btn {
  padding: 4px 12px;
  font-size: 0.8rem;
}

@media (max-width: 1180px) {
  .pet-form {
    display: none;
  }
}
</style>
