<script setup lang="ts">
import { defineProps, defineEmits, computed, ref } from 'vue';
import { type Player } from '../../stores/player';

const props = defineProps<{
  player: Player;
}>();

const emit = defineEmits<{
  save: [id: string, data: Partial<Player>];
  remove: [id: string];
}>();

// Local state for editing
const isEditing = ref(false);
const editedPlayer = ref<Partial<Player>>({});

// Calculate ability modifier from score
function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

const dexModifier = computed(() => {
  const dex = isEditing.value ? editedPlayer.value.dexterity || props.player.dexterity : props.player.dexterity;
  const mod = getAbilityModifier(dex);
  return mod >= 0 ? `+${mod}` : mod;
});

function startEditing() {
  editedPlayer.value = { ...props.player };
  isEditing.value = true;
}

function cancelEditing() {
  isEditing.value = false;
}

function saveChanges() {
  emit('save', props.player.id, editedPlayer.value);
  isEditing.value = false;
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
          <h3 class="font-bold text-lg">{{ player.name }}</h3>
          <div class="text-sm text-gray-500">
            Initiative: {{ player.initiative }} | DEX: {{ player.dexterity }} ({{ dexModifier }})
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
          @click="emit('remove', player.id)" 
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
