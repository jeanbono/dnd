<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePlayerStore } from '@/stores/player';
import Sortable from 'sortablejs';
import PlayerForm from '@/components/players/PlayerForm.vue';
import PlayerCard from '@/components/players/PlayerCard.vue';

const playerStore = usePlayerStore();
const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  setupSortable();
});

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
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-bold">Joueurs</h2>
    <div class="flex space-x-2">
      <button 
        @click="playerStore.startAddingPlayer()" 
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        v-if="!playerStore.isAddingPlayer"
      >
        Ajouter un Joueur
      </button>
    </div>
  </div>
  
  <!-- Player Form for adding new players only -->
  <PlayerForm v-if="playerStore.isAddingPlayer" />
  
  <!-- Player List with Drag and Drop -->
  <div v-if="playerStore.players.length === 0" class="text-center py-6 bg-gray-100 rounded-md">
    <p class="text-gray-500">Aucun joueur ajouté. Ajoutez votre premier joueur pour commencer le suivi.</p>
  </div>
  
  <div v-else class="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
    <p>Glissez les joueurs pour les réorganiser. Cliquez sur "Modifier" pour éditer un joueur directement.</p>
  </div>
  
  <div ref="containerRef" class="space-y-3">
    <PlayerCard
      v-for="player in playerStore.players"
      :key="player.id"
      :playerId="player.id"
    />
  </div>
</template>
