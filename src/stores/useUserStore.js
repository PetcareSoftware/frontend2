import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useAppStore } from './useAppStore';
import { useOwnerStore } from './useOwnerStore';

const USE_MOCK_DATA = true;

export const useUserStore = defineStore('user', () => {
  const appStore = useAppStore();
  const ownerStore = useOwnerStore();


// Getters

  const current = computed(() => {
    const currentId = appStore.currentUserId;
    return currentId != null ? getFromStore(currentId) : undefined;
  });

  const users = computed(() => {
    return [].concat(ownerStore.owners);
  });


  // Actions

  async function add(newUser) {
    return ownerStore.add(newUser);
  }

  function getFromStore(id) {
    return users.value.find(user => user.id === id);
  }


  return {
    lock: ownerStore.lock,
    current, users, locked: ownerStore.locked,
    add, getFromStore,
  }
});
