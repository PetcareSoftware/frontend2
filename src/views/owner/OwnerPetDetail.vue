<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import PetDetail from '@/components/shared/PetDetail.vue';
  import { useAppStore } from '@/stores/useAppStore';
  import { getPet } from '@/lib/petcare';

  const appStore = useAppStore();
  const route = useRoute();
  const router = useRouter();

  const selectedPet = ref(null);

  onMounted(() => {
    const pet = getPet(appStore.pets, route.params.id);
    if (pet) {
      selectedPet.value = pet;
    } else {
      router.push('/portal/pets');
    }
  });

  function goBack() {
    router.push('/portal/pets');
  }

  function editPet() {
    router.push(`/portal/pets/${selectedPet.value.id}/edit`);
  }
</script>

<template>
  <div class="stack" v-if="selectedPet">
    <PageHeader
      :title="`Historial Médico de ${selectedPet.name}`"
      subtitle="Consulta todos los registros, vacunas y detalle clínico."
    >
      <template #actions>
        <div class="page-header__action-group">
          <button class="btn btn--ghost" type="button" @click="goBack">Volver</button>
          <button class="btn btn--primary" type="button" @click="editPet">Editar Datos</button>
        </div>
      </template>
    </PageHeader>

    <PetDetail :pet="selectedPet"/>
  </div>
</template>

<style scoped>
</style>
