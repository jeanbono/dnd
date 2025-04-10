<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { type Player, usePlayerStore } from '../../stores/player';

const props = defineProps<{
  player: Player;
}>();

const playerStore = usePlayerStore();

// Computed properties
const isEditing = computed(() => playerStore.editingPlayerId === props.player.id);
const editedPlayer = computed(() => playerStore.tempPlayerData);

const dexModifier = computed(() => {
  const dex = isEditing.value ? editedPlayer.value.dexterity || props.player.dexterity : props.player.dexterity;
  return playerStore.getAbilityModifierDisplay(dex);
});

// Actions
function startEditing() {
  playerStore.startEditingPlayer(props.player.id);
}

function cancelEditing() {
  playerStore.cancelEditing();
}

function saveChanges() {
  playerStore.saveEditedPlayer();
}
</script>

<template>
  <div class="bg-white rounded-md shadow border border-gray-200 p-4">
    <!-- View Mode -->
    <div v-if="!isEditing" class="flex justify-between items-center">
      <div class="flex items-center">
        <div class="drag-handle cursor-move p-1 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-lg">{{ props.player.name }}</h3>
          <div class="text-sm text-gray-500">
            Initiative: {{ props.player.initiative }} | DEX: {{ props.player.dexterity }} ({{ dexModifier }})
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          @click="startEditing" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Modifier
        </button>
        <button 
          @click="playerStore.removePlayer(props.player.id)" 
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Supprimer
        </button>
      </div>
    </div>
    
    <!-- Edit Mode -->
    <div v-else class="flex flex-col">
      <div class="grid grid-cols-3 gap-2 mb-3">
        <div>
          <label class="block text-sm font-medium mb-1">Nom</label>
          <input 
            v-model="editedPlayer.name" 
            type="text" 
            class="w-full p-2 border border-gray-300 rounded-md"
          >
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Initiative</label>
          <input 
            v-model.number="editedPlayer.initiative" 
            type="number" 
            class="w-full p-2 border border-gray-300 rounded-md"
          >
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Dextérité</label>
          <input 
            v-model.number="editedPlayer.dexterity" 
            type="number" 
            class="w-full p-2 border border-gray-300 rounded-md"
          >
        </div>
      </div>
      
      <div class="flex justify-end space-x-2">
        <button 
          @click="cancelEditing" 
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-md text-sm"
        >
          Annuler
        </button>
        <button 
          @click="saveChanges" 
          class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Enregistrer
        </button>
      </div>
    </div>
  </div>
</template>
