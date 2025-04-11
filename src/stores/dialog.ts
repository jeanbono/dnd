import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDialogStore = defineStore('dialog', () => {
  // État
  const showNewCombatDialog = ref(false);
  
  // Actions
  function openNewCombatDialog() {
    showNewCombatDialog.value = true;
  }
  
  function closeNewCombatDialog() {
    showNewCombatDialog.value = false;
  }
  
  return {
    // État
    showNewCombatDialog,
    
    // Actions
    openNewCombatDialog,
    closeNewCombatDialog
  };
});
