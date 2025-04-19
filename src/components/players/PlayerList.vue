<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePlayerStore, type Player } from '@/stores/player';
import Sortable from 'sortablejs';
import CharacterCard from '@/components/common/CharacterCard.vue';
import CharacterForm from '@/components/common/CharacterForm.vue';

const playerStore = usePlayerStore();
const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  setupSortable();
});

const handleSubmit = (playerData: Player) => {
  playerStore.addPlayer({
    ...playerData,
    conditions: []
  });
  playerStore.cancelAddingPlayer();
};

function setupSortable() {
  if (containerRef.value) {
    Sortable.create(containerRef.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'bg-gray-100',
      onEnd(evt: Sortable.SortableEvent) {
        // Get the new order of players
        const newOrder = [...playerStore.players];
        const movedItem = newOrder.splice(evt.oldIndex!, 1)[0];
        newOrder.splice(evt.newIndex!, 0, movedItem);
        
        // Update the store
        playerStore.reorderPlayers(newOrder);
      }
    });
  }
}
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
    <h2 class="text-xl sm:text-2xl font-bold">Joueurs</h2>
    <div class="flex flex-wrap gap-2">
      <button 
        @click="playerStore.startAddingPlayer()" 
        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-base flex-grow sm:flex-grow-0"
        v-if="!playerStore.isAddingPlayer"
      >
        <span class="sm:hidden">+ Joueur</span>
        <span class="hidden sm:inline">Ajouter un Joueur</span>
      </button>
    </div>
  </div>
  
  <!-- Player Form for adding new players only -->
  <div v-if="playerStore.isAddingPlayer" class="bg-white p-4 rounded-md shadow mb-4 border border-gray-200">
    <CharacterForm 
      character-type="player"
      @submit="handleSubmit"
      @cancel="playerStore.cancelAddingPlayer"
    />
  </div>
  
  <!-- Player List with Drag and Drop -->
  <div v-if="playerStore.players.length === 0" class="text-center py-8 bg-gray-100 rounded-md">
    <p class="text-gray-500">Aucun joueur ajouté. Ajoutez votre premier joueur pour commencer le suivi.</p>
  </div>
  
  <div v-else class="mb-4 p-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
    <p>Glissez les joueurs pour les réorganiser. Cliquez sur le bouton pour développer/réduire les détails du joueur.</p>
  </div>
  
  <div ref="containerRef" class="space-y-3">
    <CharacterCard 
      v-for="player in playerStore.players" 
      :key="player.id" 
      :character-id="player.id"
      character-type="player"
    />
  </div>
</template>
