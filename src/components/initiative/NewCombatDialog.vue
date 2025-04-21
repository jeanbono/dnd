<script setup lang="ts">
import {ref} from 'vue';
import {useCharacterStore} from '@/stores/character';
import {useTurnStore} from '@/stores/turn';
import {useDialogStore} from '@/stores/dialog';
import {CharacterType} from "@/types/character.ts";

const characterStore = useCharacterStore();
const turnStore = useTurnStore();
const dialogStore = useDialogStore();

// Options pour le nouveau combat
const clearConditions = ref(true);
const removeMonsters = ref(true);

function startNewCombat() {
  // Réinitialiser le compteur de tours
  turnStore.resetTurn();
  
  // Supprimer les monstres si l'option est sélectionnée
  if (removeMonsters.value) {
    characterStore.removeAllCharactersOfType(CharacterType.MONSTER);
  }
  
  // Supprimer les conditions si l'option est sélectionnée
  if (clearConditions.value) {
    // Supprimer les conditions des personnages
    characterStore.clearAllCharactersConditions();
  }
  
  // Fermer la boîte de dialogue
  dialogStore.closeNewCombatDialog();
}

function cancel() {
  dialogStore.closeNewCombatDialog();
}
</script>

<template>
  <div v-if="dialogStore.showNewCombatDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 class="text-xl font-semibold mb-4">Démarrer un nouveau combat</h2>
      
      <p class="text-gray-600 mb-4">
        Cette action va réinitialiser le compteur de tours et peut supprimer les monstres et les effets en cours.
      </p>
      
      <div class="space-y-3 mb-6">
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="clearConditions" 
            v-model="clearConditions" 
            class="mr-2"
          />
          <label for="clearConditions">Supprimer tous les effets en cours (conditions)</label>
        </div>
        
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="removeMonsters" 
            v-model="removeMonsters" 
            class="mr-2"
          />
          <label for="removeMonsters">Supprimer tous les monstres</label>
        </div>
      </div>
      
      <div class="flex justify-end space-x-2">
        <button 
          @click="cancel" 
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Annuler
        </button>
        <button 
          @click="startNewCombat" 
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          Démarrer un nouveau combat
        </button>
      </div>
    </div>
  </div>
</template>
