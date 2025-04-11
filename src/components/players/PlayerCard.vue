<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePlayerStore } from '@/stores/player';
import ConditionManager from '@/components/conditions/ConditionManager.vue';

const props = defineProps<{
  playerId: string;
}>();

const playerStore = usePlayerStore();
const player = computed(() => playerStore.getPlayerById(props.playerId));

// Computed properties
const isEditing = computed(() => playerStore.editingPlayerId === props.playerId);

// Données d'édition gérées localement
const editedPlayer = ref({
  name: '',
  initiative: 0,
  dexterity: 10,
  notes: ''
});

// Mettre à jour les données d'édition quand le joueur change
watch(() => player.value, (newPlayer) => {
  if (newPlayer && !isEditing.value) {
    editedPlayer.value = {
      name: newPlayer.name,
      initiative: newPlayer.initiative,
      dexterity: newPlayer.dexterity,
      notes: newPlayer.notes || ''
    };
  }
}, { deep: true, immediate: true });

// Réinitialiser les données d'édition quand on entre en mode édition
watch(isEditing, (editing) => {
  if (editing && player.value) {
    editedPlayer.value = {
      name: player.value.name,
      initiative: player.value.initiative,
      dexterity: player.value.dexterity,
      notes: player.value.notes || ''
    };
  }
});

const dexModifier = computed(() => {
  if (!player.value) return '';
  const dex = isEditing.value ? editedPlayer.value.dexterity : player.value.dexterity;
  return playerStore.getAbilityModifierDisplay(dex);
});

// Actions
function startEditing() {
  playerStore.startEditingPlayer(props.playerId);
}

function cancelEditing() {
  playerStore.cancelEditingPlayer();
}

function saveChanges() {
  if (playerStore.editingPlayerId === props.playerId) {
    playerStore.updatePlayer(props.playerId, editedPlayer.value);
    playerStore.cancelEditingPlayer();
  }
}
</script>

<template>
  <div v-if="player" class="bg-white rounded-md shadow border border-gray-200 p-4">
    <!-- View Mode -->
    <div v-if="!isEditing" class="flex flex-col">
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
            @click="startEditing" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Modifier
          </button>
          <button 
            @click="playerStore.removePlayer(player.id)" 
            class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Supprimer
          </button>
        </div>
      </div>
      
      <!-- Gestionnaire de conditions -->
      <ConditionManager 
        :conditions="player.conditions"
        creature-type="player"
        :creature-id="playerId"
        class="mt-4"
      />
      
      <!-- Notes du joueur -->
      <div v-if="player.notes" class="mt-4">
        <h4 class="font-semibold text-sm mb-1">Notes:</h4>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ player.notes }}</p>
      </div>
    </div>
    
    <!-- Edit Mode -->
    <div v-else class="flex flex-col">
      <div class="flex items-center mb-3">
        <div class="drag-handle cursor-move p-1 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h3 class="font-bold text-lg">Édition du joueur</h3>
      </div>
      
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
      
      <div class="mt-2 mb-3">
        <label class="block text-sm font-medium mb-1">Notes</label>
        <textarea 
          v-model="editedPlayer.notes" 
          rows="2"
          class="w-full p-2 border border-gray-300 rounded-md"
        ></textarea>
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
