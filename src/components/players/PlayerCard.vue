<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { type Player, usePlayerStore } from '../../stores/player';

const props = defineProps<{
  player: Player;
}>();

const emit = defineEmits<{
  edit: [player: Player];
  remove: [id: string];
}>();

const store = usePlayerStore();

// Calculate ability modifier from score
function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

const dexModifier = computed(() => {
  const mod = getAbilityModifier(props.player.dexterity);
  return mod >= 0 ? `+${mod}` : mod;
});
</script>

<template>
  <div class="bg-white rounded-md shadow border border-gray-200 p-4">
    <div class="flex justify-between items-center">
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
          @click="emit('edit', player)" 
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
  </div>
</template>
