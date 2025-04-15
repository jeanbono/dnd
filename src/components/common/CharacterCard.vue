<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useMonsterStore } from '@/stores/monster';
import ConditionManager from '@/components/conditions/ConditionManager.vue';
import CharacterStats from '@/components/common/CharacterStats.vue';
import { isValidNumber } from '@/utils/validationUtils';

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

// Données d'édition gérées localement
const editedCharacter = ref({
  name: '',
  initiative: undefined as number | undefined,
  hp: undefined as number | undefined,
  maxHp: undefined as number | undefined,
  ac: 10,
  dexterity: undefined as number | undefined,
  strength: undefined as number | undefined,
  constitution: undefined as number | undefined,
  intelligence: undefined as number | undefined,
  wisdom: undefined as number | undefined,
  charisma: undefined as number | undefined,
  notes: ''
});

const formSubmitted = ref(false);
const initiativeInput = ref<HTMLInputElement | null>(null);
const strengthInput = ref<HTMLInputElement | null>(null);
const dexterityInput = ref<HTMLInputElement | null>(null);
const constitutionInput = ref<HTMLInputElement | null>(null);
const intelligenceInput = ref<HTMLInputElement | null>(null);
const wisdomInput = ref<HTMLInputElement | null>(null);
const charismaInput = ref<HTMLInputElement | null>(null);

// Mettre à jour les données d'édition quand le personnage change
watch(() => character.value, (newCharacter) => {
  if (newCharacter && !isEditing.value) {
    editedCharacter.value = {
      name: newCharacter.name,
      initiative: newCharacter.initiative,
      hp: newCharacter.hp,
      maxHp: newCharacter.maxHp,
      ac: newCharacter.ac,
      dexterity: newCharacter.dexterity,
      strength: newCharacter.strength,
      constitution: newCharacter.constitution,
      intelligence: newCharacter.intelligence,
      wisdom: newCharacter.wisdom,
      charisma: newCharacter.charisma,
      notes: newCharacter.notes
    };
  }
}, { deep: true, immediate: true });

// Réinitialiser les données d'édition quand on entre en mode édition
watch(isEditing, (editing) => {
  if (editing && character.value) {
    editedCharacter.value = {
      name: character.value.name,
      initiative: character.value.initiative,
      hp: character.value.hp,
      maxHp: character.value.maxHp,
      ac: character.value.ac,
      dexterity: character.value.dexterity,
      strength: character.value.strength,
      constitution: character.value.constitution,
      intelligence: character.value.intelligence,
      wisdom: character.value.wisdom,
      charisma: character.value.charisma,
      notes: character.value.notes
    };
  }
}, { immediate: true });

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
  formSubmitted.value = false;
}

function saveChanges() {
  formSubmitted.value = true;
  
  // Vérifier que tous les champs obligatoires sont remplis et validés
  if (
    editedCharacter.value.name && 
    isValidNumber(editedCharacter.value.initiative) &&
    isValidNumber(editedCharacter.value.strength) &&
    isValidNumber(editedCharacter.value.dexterity) &&
    isValidNumber(editedCharacter.value.constitution) &&
    isValidNumber(editedCharacter.value.intelligence) &&
    isValidNumber(editedCharacter.value.wisdom) &&
    isValidNumber(editedCharacter.value.charisma)
  ) {
    if (props.characterType === 'player') {
      playerStore.updatePlayer(props.characterId, {
        name: editedCharacter.value.name,
        initiative: editedCharacter.value.initiative || 0,
        hp: editedCharacter.value.hp,
        maxHp: editedCharacter.value.maxHp,
        ac: editedCharacter.value.ac,
        dexterity: editedCharacter.value.dexterity,
        strength: editedCharacter.value.strength,
        constitution: editedCharacter.value.constitution,
        intelligence: editedCharacter.value.intelligence,
        wisdom: editedCharacter.value.wisdom,
        charisma: editedCharacter.value.charisma,
        notes: editedCharacter.value.notes
      });
    } else {
      monsterStore.updateMonster(props.characterId, {
        name: editedCharacter.value.name,
        initiative: editedCharacter.value.initiative || 0,
        hp: editedCharacter.value.hp,
        maxHp: editedCharacter.value.maxHp,
        ac: editedCharacter.value.ac,
        dexterity: editedCharacter.value.dexterity,
        strength: editedCharacter.value.strength,
        constitution: editedCharacter.value.constitution,
        intelligence: editedCharacter.value.intelligence,
        wisdom: editedCharacter.value.wisdom,
        charisma: editedCharacter.value.charisma,
        notes: editedCharacter.value.notes
      });
    }
    formSubmitted.value = false;
    cancelEditing();
  } else {
    console.log("Validation échouée: champs obligatoires manquants", {
      name: !!editedCharacter.value.name,
      initiative: isValidNumber(editedCharacter.value.initiative),
      strength: isValidNumber(editedCharacter.value.strength),
      dexterity: isValidNumber(editedCharacter.value.dexterity),
      constitution: isValidNumber(editedCharacter.value.constitution),
      intelligence: isValidNumber(editedCharacter.value.intelligence),
      wisdom: isValidNumber(editedCharacter.value.wisdom),
      charisma: isValidNumber(editedCharacter.value.charisma)
    });
  }
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
    <div v-else class="flex flex-col">
      <!-- Champs obligatoires -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">
            Nom <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="editedCharacter.name" 
            type="text" 
            class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': editedCharacter.name === '' && formSubmitted, 'border-gray-300': !(editedCharacter.name === '' && formSubmitted) }"
            required
          >
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">
            Initiative <span class="text-red-500">*</span>
          </label>
          <input 
            v-model.number="editedCharacter.initiative" 
            type="number" 
            class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': formSubmitted && initiativeInput && initiativeInput.value === '', 'border-gray-300': !(formSubmitted && initiativeInput && initiativeInput.value === '') }"
            ref="initiativeInput"
            required
          >
        </div>
      </div>
      
      <!-- Caractéristiques -->
      <div class="bg-gray-50 p-3 rounded-md border border-gray-200 mb-3">
        <h4 class="text-sm font-medium mb-2">Caractéristiques</h4>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <div>
            <label class="block text-xs font-medium mb-1">Force <span class="text-red-500">*</span></label>
            <input 
              v-model.number="editedCharacter.strength" 
              type="number" 
              class="w-full p-1.5 border rounded-md text-sm"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && strengthInput && strengthInput.value === '', 'border-gray-300': !(formSubmitted && strengthInput && strengthInput.value === '') }"
              required
              ref="strengthInput"
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Dextérité <span class="text-red-500">*</span></label>
            <input 
              v-model.number="editedCharacter.dexterity" 
              type="number" 
              class="w-full p-1.5 border rounded-md text-sm"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && dexterityInput && dexterityInput.value === '', 'border-gray-300': !(formSubmitted && dexterityInput && dexterityInput.value === '') }"
              required
              ref="dexterityInput"
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Constitution <span class="text-red-500">*</span></label>
            <input 
              v-model.number="editedCharacter.constitution" 
              type="number" 
              class="w-full p-1.5 border rounded-md text-sm"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && constitutionInput && constitutionInput.value === '', 'border-gray-300': !(formSubmitted && constitutionInput && constitutionInput.value === '') }"
              required
              ref="constitutionInput"
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Intelligence <span class="text-red-500">*</span></label>
            <input 
              v-model.number="editedCharacter.intelligence" 
              type="number" 
              class="w-full p-1.5 border rounded-md text-sm"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && intelligenceInput && intelligenceInput.value === '', 'border-gray-300': !(formSubmitted && intelligenceInput && intelligenceInput.value === '') }"
              required
              ref="intelligenceInput"
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Sagesse <span class="text-red-500">*</span></label>
            <input 
              v-model.number="editedCharacter.wisdom" 
              type="number" 
              class="w-full p-1.5 border rounded-md text-sm"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && wisdomInput && wisdomInput.value === '', 'border-gray-300': !(formSubmitted && wisdomInput && wisdomInput.value === '') }"
              required
              ref="wisdomInput"
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Charisme <span class="text-red-500">*</span></label>
            <input 
              v-model.number="editedCharacter.charisma" 
              type="number" 
              class="w-full p-1.5 border rounded-md text-sm"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && charismaInput && charismaInput.value === '', 'border-gray-300': !(formSubmitted && charismaInput && charismaInput.value === '') }"
              required
              ref="charismaInput"
            >
          </div>
        </div>
      </div>
      
      <!-- Champs optionnels -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">PV <span class="text-gray-400 text-xs">(opt.)</span></label>
          <input 
            v-model.number="editedCharacter.hp" 
            type="number" 
            class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
          >
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">PV Max <span class="text-gray-400 text-xs">(opt.)</span></label>
          <input 
            v-model.number="editedCharacter.maxHp" 
            type="number" 
            class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
          >
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-medium mb-1">CA</label>
          <input 
            v-model.number="editedCharacter.ac" 
            type="number" 
            class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
          >
        </div>
      </div>
      
      <div class="mb-3">
        <label class="block text-xs sm:text-sm font-medium mb-1">Notes</label>
        <textarea 
          v-model="editedCharacter.notes" 
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