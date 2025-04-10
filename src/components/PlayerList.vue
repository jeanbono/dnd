<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePlayerStore, type Player } from '../stores/player';
import Sortable from 'sortablejs';

const store = usePlayerStore();
const players = computed(() => store.players);
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
        const newOrder = [...store.players];
        const movedItem = newOrder.splice(evt.oldIndex!, 1)[0];
        newOrder.splice(evt.newIndex!, 0, movedItem);
        
        // Update the store
        store.reorderPlayers(newOrder);
      }
    });
  }
}

const newPlayer = ref<Omit<Player, 'id'>>({
  name: '',
  initiative: 0,
  dexterity: 10
});

const isAddingPlayer = ref(false);
const editingPlayer = ref<string | null>(null);
const tempPlayerData = ref<Partial<Player>>({});

function editPlayer(player: Player) {
  editingPlayer.value = player.id;
  tempPlayerData.value = { ...player };
}

function saveEditedPlayer(id: string) {
  if (editingPlayer.value === id) {
    store.updatePlayer(id, {
      name: tempPlayerData.value.name,
      initiative: Number(tempPlayerData.value.initiative),
      dexterity: Number(tempPlayerData.value.dexterity)
    });
    editingPlayer.value = null;
  }
}

function cancelEditingPlayer() {
  editingPlayer.value = null;
  tempPlayerData.value = {};
}

function addPlayer() {
  if (newPlayer.value.name.trim()) {
    store.addPlayer({
      ...newPlayer.value,
      initiative: Number(newPlayer.value.initiative)
    });
    
    // Reset form
    newPlayer.value = {
      name: '',
      initiative: 0,
      dexterity: 10
    };
    isAddingPlayer.value = false;
  }
}

function removePlayer(id: string) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
    store.removePlayer(id);
  }
}
</script>

<template>
  <div class="p-4 bg-white rounded-md shadow border border-gray-200 mb-6">
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-xl font-semibold">Joueurs</h2>
      <button 
        @click="isAddingPlayer = !isAddingPlayer" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer"
      >
        {{ isAddingPlayer ? 'Annuler' : 'Ajouter un Joueur' }}
      </button>
    </div>
    
    <!-- Add Player Form -->
    <div v-if="isAddingPlayer" class="bg-gray-100 p-4 rounded-md mb-4">
      <h3 class="font-semibold mb-3">Ajouter un Joueur</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nom</label>
          <input v-model="newPlayer.name" class="w-full p-2 border rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Initiative</label>
          <input v-model.number="newPlayer.initiative" type="number" class="w-full p-2 border rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Dextérité</label>
          <input v-model.number="newPlayer.dexterity" type="number" class="w-full p-2 border rounded-md" />
          <span class="text-xs text-gray-500">
            {{ newPlayer.dexterity }} ({{ store.getAbilityModifier(newPlayer.dexterity) >= 0 ? '+' : '' }}{{ store.getAbilityModifier(newPlayer.dexterity) }})
          </span>
        </div>
      </div>
      
      <button 
        @click="addPlayer" 
        class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer"
      >
        Ajouter le Joueur
      </button>
    </div>
    
    <!-- Player List with Drag and Drop -->
    <div v-if="players.length === 0" class="text-center py-6 bg-gray-100 rounded-md">
      <p class="text-gray-500">Aucun joueur ajouté. Ajoutez votre premier joueur pour commencer le suivi.</p>
    </div>
    
    <div v-else class="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
      <p>Glissez les joueurs pour les réorganiser.</p>
    </div>
    
    <div ref="containerRef" class="space-y-3">
      <div 
        v-for="player in players" 
        :key="player.id"
        class="bg-white rounded-md shadow border border-gray-200 p-4 flex justify-between items-center"
      >
        <div class="flex items-center">
          <div class="drag-handle cursor-move p-1 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-lg">
              <input v-if="editingPlayer === player.id" v-model="tempPlayerData.name" class="border rounded-md p-1 w-full" />
              <span v-else>{{ player.name }}</span>
            </h3>
            <div class="text-sm text-gray-500">
              <div class="flex items-center mb-1">
                <span class="mr-2 w-20">Initiative:</span>
                <input 
                  v-if="editingPlayer === player.id"
                  v-model.number="tempPlayerData.initiative"
                  type="number" 
                  class="w-16 p-1 border rounded-md text-center"
                />
                <span v-else>{{ player.initiative }}</span>
              </div>
              <div class="flex items-center">
                <span class="mr-2 w-20">Dextérité:</span>
                <input 
                  v-if="editingPlayer === player.id"
                  v-model.number="tempPlayerData.dexterity"
                  type="number" 
                  class="w-16 p-1 border rounded-md text-center"
                />
                <span v-else>{{ player.dexterity }} ({{ store.getAbilityModifier(player.dexterity) >= 0 ? '+' : '' }}{{ store.getAbilityModifier(player.dexterity) }})</span>
              </div>
              <div class="flex gap-2 mt-2" v-if="editingPlayer === player.id">
                <button 
                  @click="saveEditedPlayer(player.id)" 
                  class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                >
                  Enregistrer
                </button>
                <button 
                  @click="cancelEditingPlayer" 
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            @click="editPlayer(player)" 
            class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm cursor-pointer"
            v-if="editingPlayer !== player.id"
          >
            Modifier
          </button>
          <button 
            @click="removePlayer(player.id)" 
            class="text-red-500 hover:text-red-700 cursor-pointer"
            title="Supprimer le joueur"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
