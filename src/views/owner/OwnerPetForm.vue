<script setup>
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import PageHeader from '@/components/shared/PageHeader.vue';
  import PetForm from '@/components/shared/PetForm.vue';

  const route = useRoute();
  const router = useRouter();

  const isEditing = computed(() => !!route.params.id);

  function done() {
    router.push('/portal/pets');
  }

  function goBack() {
    router.back();
  }
</script>

<template>
  <div class="stack">
    <PageHeader
      :title="isEditing ? 'Editar Mascota' : 'Agregar Mascota'"
      subtitle="Completa los datos de la mascota para su historia clínica."
    >
      <template #actions>
        <button class="btn btn--ghost" type="button" @click="goBack">Volver</button>
      </template>
    </PageHeader>

    <PetForm :petId="$route.params.id" @cancel="goBack" @save="done"/>
  </div>
</template>

<style scoped>
</style>
