<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlayerStore, type Player } from '@/stores/player';
import { useMonsterStore, type Monster } from '@/stores/monster';
import ConditionManager from '@/components/conditions/ConditionManager.vue';
import CharacterStats from '@/components/common/CharacterStats.vue';
import CharacterForm from '@/components/common/CharacterForm.vue';

const props = defineProps<{
  characterId: string;
  characterType: 'player' | 'monster';
}>();

const playerStore = usePlayerStore();
const monsterStore = useMonsterStore();

// Computed properties pour accéder au store approprié selon le type de personnage
const character = computed(() => {
  return props.characterType === 'player' 
    ? playerStore.getPlayerById(props.characterId)
    : monsterStore.getMonsterById(props.characterId);
});

// État d'édition
const isEditing = computed(() => {
  return props.characterType === 'player' 
    ? playerStore.editingPlayerId === props.characterId
    : monsterStore.editingMonsterId === props.characterId;
});

// Couleur de la barre de PV
const hpColor = computed(() => {
  if (!character.value || character.value.hp === undefined || character.value.maxHp === undefined || character.value.maxHp === 0) return '';
  
  const hpPercentage = (character.value.hp / character.value.maxHp) * 100;
  if (hpPercentage > 75) return 'bg-green-500';
  if (hpPercentage > 50) return 'bg-yellow-500';
  if (hpPercentage > 25) return 'bg-orange-500';
  return 'bg-red-500';
});

const hpPercentage = computed(() => {
  if (!character.value || character.value.hp === undefined || character.value.maxHp === undefined || character.value.maxHp === 0) return 0;
  return (character.value.hp / character.value.maxHp) * 100;
});

const isExpanded = computed(() => {
  if (props.characterType === 'monster') {
    return monsterStore.isExpanded(props.characterId);
  } else {
    // Pour les joueurs, on utilisera l'état du store
    return playerStore.isExpanded(props.characterId);
  }
});

// État local pour le résultat du lancer d'initiative
const showInitiativeResult = ref(false);

function cancelEditing() {
  if (props.characterType === 'player') {
    playerStore.cancelEditingPlayer();
  } else {
    monsterStore.cancelEditingMonster();
  }
}

function handleSubmit(characterData: Player | Monster) {
  if (props.characterType === 'player') {
    playerStore.updatePlayer(props.characterId, characterData);
  } else {
    monsterStore.updateMonster(props.characterId, characterData);
  }
  cancelEditing();
}

function toggleExpand() {
  if (props.characterType === 'monster') {
    monsterStore.toggleExpand(props.characterId);
  } else {
    playerStore.toggleExpand(props.characterId);
  }
}

function rollInitiative() {
  if (props.characterType === 'monster' && character.value) {
    // Appel direct au store pour faire le lancer
    monsterStore.rollInitiative(props.characterId);
    
    // Afficher brièvement la confirmation de mise à jour
    showInitiativeResult.value = true;
    
    // Masquer après quelques secondes
    setTimeout(() => {
      showInitiativeResult.value = false;
    }, 2000);
  }
}

function updateHp(value: number) {
  if (props.characterType === 'player') {
    playerStore.updatePlayerHp(props.characterId, value);
  } else {
    monsterStore.updateMonsterHp(props.characterId, value);
  }
}

function removeCharacter() {
  if (props.characterType === 'player') {
    playerStore.removePlayer(props.characterId);
  } else {
    monsterStore.removeMonster(props.characterId);
  }
}

function startEditing() {
  if (props.characterType === 'player') {
    playerStore.startEditingPlayer(props.characterId);
  } else {
    monsterStore.startEditingMonster(props.characterId);
  }
}
</script>

<style scoped>
.initiative-updated {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background-color: rgba(124, 58, 237, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.initiative-updated::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(124, 58, 237, 0), rgba(124, 58, 237, 0.3), rgba(124, 58, 237, 0));
  animation: shine 1.5s ease-in-out infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>

<template>
  <div v-if="character" class="bg-white rounded-md shadow border border-gray-200 p-4" 
       :id="`${characterType}-${characterId}`"
  >
    <!-- En-tête du personnage - Toujours visible -->
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center">
        <div class="drag-handle cursor-move p-1 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-lg">{{ character.name }}</h3>
          <div class="text-sm text-gray-500">
            Initiative: {{ character.initiative }}
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          v-if="!isEditing"
          @click="startEditing" 
          class="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors duration-200 ease-in-out"
          title="Modifier le personnage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          v-if="!isEditing"
          @click="removeCharacter" 
          class="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors duration-200 ease-in-out"
          title="Supprimer le personnage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        
        <!-- Bouton d'expansion pour joueurs et monstres -->
        <button 
          v-if="!isEditing" 
          @click="toggleExpand" 
          class="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200 ease-in-out"
          title="Afficher/masquer les détails"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isExpanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- View Mode -->
    <div v-if="!isEditing" class="flex flex-col">
      <!-- Barre de points de vie améliorée -->
      <div v-if="character && character.hp !== undefined && character.maxHp !== undefined && character.maxHp > 0" class="mb-3">
        <div class="flex justify-between items-center mb-1">
          <div class="flex items-center space-x-2">
            <!-- CA avec icône de bouclier -->
            <div v-if="character.ac" class="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="ml-1.5 font-semibold text-base text-gray-800">{{ character.ac }}</span>
            </div>
            
            <!-- Points de vie -->
            <div class="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
              <div class="flex items-baseline ml-1.5">
                <span class="font-semibold text-base text-gray-800">{{ character.hp }}</span>
                <span class="text-gray-500 text-xs mx-0.5">/</span>
                <span class="text-gray-600 text-sm">{{ character.maxHp }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-1">
            <button 
              @click="updateHp(-1)" 
              class="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              -1
            </button>
            <button 
              @click="updateHp(-5)" 
              class="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              -5
            </button>
            <button 
              @click="updateHp(1)" 
              class="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              +1
            </button>
            <button 
              @click="updateHp(5)" 
              class="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              +5
            </button>
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div 
            :class="[hpColor, 'h-2.5 rounded-full transition-all duration-300 flex items-center justify-end pr-1']" 
            :style="{ width: `${hpPercentage}%` }"
          >
            <div v-if="hpPercentage > 15" class="h-1.5 w-1 bg-white rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
      
      <!-- Contenu étendu -->
      <div v-if="isExpanded">
        <!-- Animation simple du lancer d'initiative -->
        <div v-if="characterType === 'monster'" class="flex items-center mb-3">
          <!-- Bouton de lancer d'initiative -->
          <button 
            @click="rollInitiative" 
            class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
            :class="{ 'opacity-50 cursor-not-allowed': showInitiativeResult }"
            :disabled="showInitiativeResult"
            title="Lancer l'initiative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Lancer Initiative</span>
          </button>
          
          <!-- Affichage du résultat du lancer sur la même ligne -->
          <div v-if="showInitiativeResult" class="ml-3">
            <div class="initiative-updated">
              <span class="font-medium mr-2">{{ character.initiative }}</span>
              <span class="text-sm text-purple-700">Nouvelle initiative</span>
            </div>
          </div>
        </div>
      
        <!-- Statistiques du personnage -->
        <CharacterStats 
          v-if="character"
          :strength="character.strength"
          :dexterity="character.dexterity"
          :constitution="character.constitution"
          :intelligence="character.intelligence"
          :wisdom="character.wisdom"
          :charisma="character.charisma"
        />
      
        <!-- Gestionnaire de conditions -->
        <ConditionManager 
          :conditions="character.conditions"
          :creature-type="characterType"
          :creature-id="characterId"
        />
        
        <!-- Notes du personnage -->
        <div v-if="character.notes" class="mt-4">
          <h4 class="font-semibold text-sm mb-1">Notes:</h4>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ character.notes }}</p>
        </div>
      </div>
    </div>
    
    <!-- Edit Mode -->
    <div v-if="isEditing" class="flex flex-col">
      <CharacterForm 
        :character="character" 
        :character-type="characterType"
        :is-edit="true"
        @submit="handleSubmit" 
        @cancel="cancelEditing" 
      />
    </div>
  </div>
</template>