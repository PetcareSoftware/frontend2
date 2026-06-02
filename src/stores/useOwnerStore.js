import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAppStore } from './useAppStore';
import { OwnerService } from '@/services/api/v1/ownerService';
import { owners as seedOwners } from '@/data/mockData';
import { findReplace } from '@/lib/utils';
import { USE_MOCK_DATA, getSelectedById, getLocked, getLockWatcher } from './utils';


export const useOwnerStore = defineStore('owner', () => {
  const appStore = useAppStore();


  // State

  const owners = ref([]);
  const selectedId = ref(null);
  const status = ref({
    loading: false, loadingOne: false, sendingOne: false
  });
  const lock = ref(null);


  // Getters

  const selected = computed(() => {
    return getSelectedById(selectedId.value, getFromStore);
  });
  const locked = computed(() => {
    return getLocked(status.value);
  });


  // Extra

  watch(locked, getLockWatcher(lock), { flush: 'sync' });


  // Actions

  async function get(id) {
    let owner = getFromStore(id);

    if (!owner) {
      owner = await fetchOne(id);
    }

    return owner;
  }

  async function fetchOne(id) {
    const newOwner = USE_MOCK_DATA ?
      seedOwners.find(owner => owner.id === id) :
      await OwnerService.get(id);

    if (!newOwner) return;

    saveInStore(newOwner);
    return newOwner;
  }

  async function fetchAll() {
    const newOwners = USE_MOCK_DATA ?
      seedOwners :
      await OwnerService.list();

    if (!newOwners) return;

    owners.value = newOwners;
    return newOwners;
  }

  async function add(newOwner) {
    if (USE_MOCK_DATA) {
      if (seedOwners.find(owner => owner.equals(newOwner)) ) {
        throw new Error('Esta cuenta ya existe');
      }
      seedOwners.push(newOwner);
    } else {
      await OwnerService.create(newOwner);

      try {
        newOwner = await OwnerService.getMe();
      } catch (e) {
        const newError = Error(
          'Hubo un problema. La cuenta puede haberse creado o no. Por favor, recargue la página');
        newError.cause = e;
        throw newError;
      }
    }

    return newOwner;
  }

  async function update(newOwner) {
    if (USE_MOCK_DATA) {
      const oldIndex = findReplace(seedOwners, (old) => old.id === newOwner.id, newOwner);
      if (oldIndex < 0) {
        throw new Error('Esta cuenta no existe');
      }
    } else {
      if (newOwner.id === appStore.currentUserId) {
        newOwner = await OwnerService.updateMe(newOwner);
      } else {
        throw new Error('No se puede actualizar la cuenta de otro propietario');
      }
    }

    saveInStore(newOwner);
    return newOwner;
  }

  function getFromStore(id) {
    return owners.value.find(owner => owner.id === id);
  }

  function saveInStore(newOwner) {
    const oldIndex = findReplace(owners.value, (old) => old.id === newOwner.id, newOwner);
    if (oldIndex < 0) {
      owners.value.push(newOwner);
    }
  }


  return {
    owners, selectedId, status, lock,
    selected, locked,
    get, fetchOne, fetchAll, add, update, getFromStore, saveInStore,
  }
});
