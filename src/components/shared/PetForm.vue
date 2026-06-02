<script>
  import { petFormTemplate as formTemplate } from '@/lib/petcare';
</script>
<script setup>
  import { ref, reactive, computed, watch, watchEffect, onBeforeUnmount } from 'vue';
  import { useAppStore } from '@/stores/useAppStore';
  import { useToastStore } from '@/stores/useToastStore';
  import { getPet, speciesMeta, breedsBySpecies } from '@/lib/petcare';

  const appStore = useAppStore();
  const toastStore = useToastStore();

  const props = defineProps({
    pet: {
      type: [Object, null],
      validator(value, props) {
        if (value && props.petId) {
          return false;
        } else if (value == null) {
          return true;
        }
        return [...Object.keys(formTemplate), "id"].every(k => k in value);
      }
    },
    petId: [Number, String, null],
  });

  const emit = defineEmits({
    cancel(petId) { return true },
    save(petId) { return true },
  });

  const selectedPet = ref(null);
  // Evita computed para no reaccionar a cambios en appStore
  watch(props, () => {
    selectedPet.value = props.pet || (props.petId ? getPet(appStore.pets, props.petId) : null);
  }, { immediate: true });

  const isEditing = computed(() => !!selectedPet.value);

  /*
  onBeforeUnmount(() => {
    emit('cancel', selectedPet.id);
  })
  */

  const form = reactive({...formTemplate});

  const availableBreeds = computed(() => breedsBySpecies[form.species] || ['Otro']);

  function loadPet() {
    const pet = selectedPet.value;
    if (pet) {
      form.name = pet.name || '';
      form.species = pet.species || 'dog';
      form.breed = pet.breed || availableBreeds.value[0];
      form.sex = pet.sex || 'M';
      form.birthDate = pet.birthDate || '';
      form.weight = pet.weight || '';
      form.color = pet.color || '';
      form.notes = pet.notes || '';
    } else {
      Object.assign(form, formTemplate);
    }
  }
  watchEffect(loadPet);

  function savePet() {
    if (!form.name || !form.breed || !form.birthDate) {
      toastStore.push({ title: 'Completa los campos requeridos', type: 'error' });
      return;
    }

    let pet = { ...form, ownerId: appStore.currentUserId };
    pet.weight = Number(pet.weight) || 0;

    if (isEditing.value) {
      pet.id = selectedPet.value.id;
      appStore.updatePet(pet);

      toastStore.push({
        title: 'Mascota actualizada',
        description: `Los datos de ${pet.name} fueron actualizados.`,
        type: 'success',
      });
    } else {
      pet.id = `p${Date.now()}`;
      appStore.addPet(pet);

      toastStore.push({
        title: 'Mascota agregada',
        description: `${pet.name} se sumó al perfil.`,
        type: 'success',
      });
    }

    emit('save', pet.id);
  }

  function cancel() {
    emit('cancel', selectedPet.value && selectedPet.value.id);
  }
</script>

<template>
  <section class="card">
    <div class="input-row">
      <label class="field field--required">
        <span class="field__label">Nombre</span>
        <input v-model="form.name" class="input" type="text"/>
      </label>
      <div class="input-grid">
        <label class="field field--required">
          <span class="field__label">Especie</span>
          <select v-model="form.species" class="select" @change="form.breed = availableBreeds[0]">
            <option v-for="(info, name) in speciesMeta" :key="name" :value="name">{{ info.label }}</option>
          </select>
        </label>
        <label class="field field--required">
          <span class="field__label">Raza</span>
          <select v-model="form.breed" class="select">
            <option v-for="breed in availableBreeds" :key="breed" :value="breed">{{ breed }}</option>
          </select>
        </label>
      </div>
      <div class="input-grid">
        <label class="field">
          <span class="field__label">Sexo</span>
          <select v-model="form.sex" class="select">
            <option value="M">Macho (M)</option>
            <option value="F">Hembra (F)</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Fecha de nacimiento *</span>
          <input v-model="form.birthDate" class="input" type="date"/>
        </label>
      </div>
      <div class="input-grid">
        <label class="field">
          <span class="field__label">Peso (kg)</span>
          <input v-model="form.weight" class="input" type="number" min="0" step="0.1"/>
        </label>
        <label class="field">
          <span class="field__label">Color</span>
          <input v-model="form.color" class="input" type="text"/>
        </label>
      </div>
      <label class="field">
        <span class="field__label">Notas</span>
        <textarea v-model="form.notes" class="textarea" rows="3"></textarea>
      </label>
      <div class="toolbar">
        <button class="btn btn--ghost" type="button" @click="cancel">
          Cancelar
        </button>
        <button class="btn btn--primary" type="button" @click="savePet">
          {{ isEditing ? 'Guardar cambios' : 'Agregar mascota' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.toolbar {
  margin-top: 16px;
}
</style>
