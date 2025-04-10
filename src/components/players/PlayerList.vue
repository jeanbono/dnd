<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Player, usePlayerStore } from '../../stores/player';
import Sortable from 'sortablejs';
import PlayerForm from './PlayerForm.vue';
import PlayerCard from './PlayerCard.vue';

const store = usePlayerStore();
const containerRef = ref<HTMLElement | null>(null);
const isAddingPlayer = ref(false);
const tempPlayerData = ref<Partial<Player>>({});
const playerFormRef = ref<InstanceType<typeof PlayerForm> | null>(null);

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
        const newOrder = [...store.players];
        const movedItem = newOrder.splice(evt.oldIndex!, 1)[0];
        newOrder.splice(evt.newIndex!, 0, movedItem);
        
        // Update the store
        store.reorderPlayers(newOrder);
      }
    });
  }
}

function removePlayer(id: string) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
    store.removePlayer(id);
  }
}

function savePlayer(id: string, data: Partial<Player>) {
  store.updatePlayer(id, data);
}

function resetForm() {
  isAddingPlayer.value = false;
  tempPlayerData.value = {
    name: '',
    initiative: 0,
    dexterity: 10,
    notes: ''
  };
}

function handleFormAdd() {
  if (playerFormRef.value && playerFormRef.value.playerData) {
    const playerData = playerFormRef.value.playerData;
    
    if (playerData.name && playerData.initiative !== undefined && playerData.dexterity !== undefined) {
      store.addPlayer(playerData as Omit<Player, 'id'>);
      resetForm();
    }
  }
}
</script>

<template>
  <div class="p-4 bg-white rounded-md shadow border border-gray-200 mb-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Joueurs</h2>
      <div class="flex space-x-2">
        <button 
          @click="isAddingPlayer = !isAddingPlayer" 
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          {{ isAddingPlayer ? 'Annuler' : 'Ajouter un Joueur' }}
        </button>
      </div>
    </div>
    
    <!-- Player Form for adding new players only -->
    <PlayerForm 
      v-if="isAddingPlayer" 
      :editingPlayer="null"
      :initialData="tempPlayerData"
      @add="handleFormAdd"
      @cancel="resetForm"
      ref="playerFormRef"
    />
    
    <!-- Player List with Drag and Drop -->
    <div v-if="store.players.length === 0" class="text-center py-6 bg-gray-100 rounded-md">
      <p class="text-gray-500">Aucun joueur ajouté. Ajoutez votre premier joueur pour commencer le suivi.</p>
    </div>
    
    <div v-else class="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
      <p>Glissez les joueurs pour les réorganiser. Cliquez sur "Modifier" pour éditer un joueur directement.</p>
    </div>
    
    <div ref="containerRef" class="space-y-3">
      <PlayerCard
        v-for="player in store.players"
        :key="player.id"
        :player="player"
        @save="savePlayer"
        @remove="removePlayer"
      />
    </div>
  </div>
</template>
