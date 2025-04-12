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
  initiative: undefined as number | undefined,
  hp: undefined as number | undefined,
  maxHp: undefined as number | undefined,
  ac: 10,
  dexterity: undefined as number | undefined,
  notes: ''
});

const formSubmitted = ref(false);
const initiativeInput = ref<HTMLInputElement | null>(null);
const dexterityInput = ref<HTMLInputElement | null>(null);

// Mettre à jour les données d'édition quand le joueur change
watch(() => player.value, (newPlayer) => {
  if (newPlayer && !isEditing.value) {
    editedPlayer.value = {
      name: newPlayer.name,
      initiative: newPlayer.initiative,
      hp: newPlayer.hp,
      maxHp: newPlayer.maxHp,
      ac: newPlayer.ac,
      dexterity: newPlayer.dexterity, // Utiliser la dextérité du joueur
      notes: newPlayer.notes
    };
  }
}, { deep: true, immediate: true });

// Réinitialiser les données d'édition quand on entre en mode édition
watch(isEditing, (editing) => {
  if (editing && player.value) {
    editedPlayer.value = {
      name: player.value.name,
      initiative: player.value.initiative,
      hp: player.value.hp,
      maxHp: player.value.maxHp,
      ac: player.value.ac,
      dexterity: player.value.dexterity, // Utiliser la dextérité du joueur
      notes: player.value.notes
    };
  }
}, { immediate: true });

// Calculer le modificateur de dextérité
const dexModifier = computed(() => {
  if (!player.value) return '';
  const dex = player.value.dexterity; // Utiliser la dextérité du joueur
  return playerStore.getAbilityModifierDisplay(dex);
});

const hpColor = computed(() => {
  if (!player.value || player.value.hp === undefined || player.value.maxHp === undefined || player.value.maxHp === 0) return '';
  const hpPercentage = (player.value.hp / player.value.maxHp) * 100;
  if (hpPercentage > 75) return 'bg-green-500';
  if (hpPercentage > 50) return 'bg-yellow-500';
  if (hpPercentage > 25) return 'bg-orange-500';
  return 'bg-red-500';
});

const hpPercentage = computed(() => {
  if (!player.value || player.value.hp === undefined || player.value.maxHp === undefined || player.value.maxHp === 0) return 0;
  return (player.value.hp / player.value.maxHp) * 100;
});

// Actions
function startEditing() {
  playerStore.startEditingPlayer(props.playerId);
}

function cancelEditing() {
  playerStore.cancelEditingPlayer();
  formSubmitted.value = false;
}

function saveChanges() {
  formSubmitted.value = true;
  // Vérifier que le nom, l'initiative et la dextérité sont remplis
  if (
    editedPlayer.value.name && 
    initiativeInput.value && initiativeInput.value.value !== '' &&
    dexterityInput.value && dexterityInput.value.value !== ''
  ) {
    playerStore.updatePlayer(props.playerId, {
      name: editedPlayer.value.name,
      initiative: editedPlayer.value.initiative || 0, // Utiliser 0 comme valeur par défaut si undefined
      hp: editedPlayer.value.hp,
      maxHp: editedPlayer.value.maxHp,
      ac: editedPlayer.value.ac,
      dexterity: editedPlayer.value.dexterity || 0, // Utiliser 0 comme valeur par défaut si undefined
      notes: editedPlayer.value.notes
    });
    formSubmitted.value = false;
  }
}
</script>

<template>
  <div v-if="player" class="bg-white rounded-md shadow border border-gray-200 p-4" :id="`player-${player.id}`">
    <!-- En-tête du joueur - Toujours visible -->
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center">
        <div class="drag-handle cursor-move p-1 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-lg">{{ player.name }}</h3>
          <div class="text-sm text-gray-500">
            Initiative: {{ player.initiative }} | CA: {{ player.ac }} | DEX: {{ player.dexterity }} ({{ dexModifier }})
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          v-if="!isEditing"
          @click="startEditing" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
        >
          <span class="hidden xs:inline">Modifier</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 xs:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          v-if="!isEditing"
          @click="playerStore.removePlayer(player.id)" 
          class="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
        >
          <span class="hidden xs:inline">Supprimer</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 xs:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- View Mode -->
    <div v-if="!isEditing" class="flex flex-col">
      <!-- Barre de points de vie -->
      <div v-if="player && player.hp !== undefined && player.maxHp !== undefined && player.maxHp > 0" class="mb-3">
        <div class="flex justify-between text-sm mb-1">
          <span>PV: {{ player.hp }} / {{ player.maxHp }}</span>
          
          <div class="flex space-x-1">
            <button 
              @click="playerStore.updatePlayerHp(playerId, -1)" 
              class="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              -1
            </button>
            <button 
              @click="playerStore.updatePlayerHp(playerId, -5)" 
              class="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              -5
            </button>
            <button 
              @click="playerStore.updatePlayerHp(playerId, 1)" 
              class="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              +1
            </button>
            <button 
              @click="playerStore.updatePlayerHp(playerId, 5)" 
              class="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              +5
            </button>
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            :class="[hpColor, 'h-2 rounded-full transition-all duration-300']" 
            :style="{ width: `${hpPercentage}%` }"
          ></div>
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
      <!-- Champs obligatoires -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">
            Nom <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="editedPlayer.name" 
            type="text" 
            class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': editedPlayer.name === '' && formSubmitted, 'border-gray-300': !(editedPlayer.name === '' && formSubmitted) }"
            required
          >
          <p v-if="editedPlayer.name === '' && formSubmitted" class="mt-0.5 text-xs text-red-500">
            Le nom est obligatoire
          </p>
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">
            Initiative <span class="text-red-500">*</span>
          </label>
          <input 
            v-model.number="editedPlayer.initiative" 
            type="number" 
            class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': formSubmitted && initiativeInput && initiativeInput.value === '', 'border-gray-300': !(formSubmitted && initiativeInput && initiativeInput.value === '') }"
            ref="initiativeInput"
            required
          >
          <p v-if="formSubmitted && initiativeInput && initiativeInput.value === ''" class="mt-0.5 text-xs text-red-500">
            L'initiative est obligatoire
          </p>
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">
            Dextérité <span class="text-red-500">*</span>
          </label>
          <input 
            v-model.number="editedPlayer.dexterity" 
            type="number" 
            class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': formSubmitted && dexterityInput && dexterityInput.value === '', 'border-gray-300': !(formSubmitted && dexterityInput && dexterityInput.value === '') }"
            ref="dexterityInput"
            required
          >
          <p v-if="formSubmitted && dexterityInput && dexterityInput.value === ''" class="mt-0.5 text-xs text-red-500">
            La dextérité est obligatoire
          </p>
        </div>
      </div>
      
      <!-- Champs optionnels -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">PV <span class="text-gray-400 text-xs">(opt.)</span></label>
          <input 
            v-model.number="editedPlayer.hp" 
            type="number" 
            class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
          >
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">PV Max <span class="text-gray-400 text-xs">(opt.)</span></label>
          <input 
            v-model.number="editedPlayer.maxHp" 
            type="number" 
            class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
          >
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">CA</label>
          <input 
            v-model.number="editedPlayer.ac" 
            type="number" 
            class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
          >
        </div>
      </div>
      
      <div class="mb-3">
        <label class="block text-xs sm:text-sm font-medium mb-1">Notes</label>
        <textarea 
          v-model="editedPlayer.notes" 
          rows="3" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        ></textarea>
      </div>
      
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 sm:mt-4">
        <p class="text-xs text-gray-500 mb-2 sm:mb-0">Les champs marqués d'un <span class="text-red-500">*</span> sont obligatoires</p>
        
        <div class="flex flex-wrap gap-2">
          <button 
            @click="cancelEditing" 
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm"
          >
            Annuler
          </button>
          <button 
            @click="saveChanges" 
            class="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
