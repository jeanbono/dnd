<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Condition, type ConditionData, type ConditionWithLevel } from '@/utils/conditionUtils';
import ConditionBadge from '@/components/conditions/ConditionBadge.vue';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';

const props = defineProps<{
  // Les conditions actuelles de la créature
  conditions: ConditionWithLevel[];
  // Type de créature (pour les libellés)
  creatureType: 'monster' | 'player';
  // ID de la créature
  creatureId: string;
}>();

// Stores
const monsterStore = useMonsterStore();
const playerStore = usePlayerStore();

// État local
const selectedCondition = ref<ConditionData | null>(null);
const exhaustionLevel = ref<number>(1);
const conditionDuration = ref<number | null>(null);
const showAddMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);

// Obtenir le niveau actuel d'épuisement
const currentExhaustionLevel = computed(() => {
  const exhaustionCondition = props.conditions?.find(c => c.condition.id === Condition.EXHAUSTION.id);
  return exhaustionCondition?.level || 1;
});

// Initialiser le slider avec le niveau actuel d'épuisement
exhaustionLevel.value = currentExhaustionLevel.value;

// Mettre à jour le niveau d'épuisement lorsqu'il change
watch(currentExhaustionLevel, (newLevel) => {
  exhaustionLevel.value = newLevel;
});

// Liste des conditions disponibles (sans l'épuisement qui est géré séparément)
const availableConditions = computed(() => {
  // S'assurer que conditions existe avant d'y accéder
  const existingConditionIds = new Set((props.conditions || []).map(c => c.condition.id));
  
  return Object.values(Condition)
    .filter(condition => {
      // L'épuisement est uniquement pour les joueurs
      if (condition.id === Condition.EXHAUSTION.id && props.creatureType !== 'player') {
        return false;
      }
      return !existingConditionIds.has(condition.id);
    })
    .sort((a, b) => a.label.localeCompare(b.label));
});

// Vérifie si la créature a déjà une condition d'épuisement
const hasExhaustion = computed(() => {
  return props.conditions?.some(c => c.condition.id === Condition.EXHAUSTION.id) || false;
});

// Ajouter une condition
function addCondition() {
  if (!selectedCondition.value) return;
  
  if (selectedCondition.value.id === Condition.EXHAUSTION.id) {
    updateExhaustion();
  } else {
    if (props.creatureType === 'monster') {
      monsterStore.addCondition(props.creatureId, selectedCondition.value, conditionDuration.value);
    } else {
      playerStore.addCondition(props.creatureId, selectedCondition.value, conditionDuration.value);
    }
  }
  
  selectedCondition.value = null;
  conditionDuration.value = null;
  showAddMenu.value = false;
}

// Ajouter ou mettre à jour l'épuisement
function updateExhaustion() {
  if (props.creatureType === 'player') {
    playerStore.updateExhaustionLevel(props.creatureId, Number(exhaustionLevel.value));
  }
  showAddMenu.value = false;
}

// Effacer toutes les conditions
function clearAllConditions() {
  if (props.creatureType === 'monster') {
    monsterStore.clearAllConditions(props.creatureId);
  } else {
    playerStore.clearAllConditions(props.creatureId);
  }
  showAddMenu.value = false;
}

// Supprimer l'épuisement
function removeExhaustion() {
  playerStore.removeCondition(props.creatureId, Condition.EXHAUSTION);
  showAddMenu.value = false;
}

// Gestion du clic en dehors du menu
function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node) && showAddMenu.value) {
    showAddMenu.value = false;
    selectedCondition.value = null;
    conditionDuration.value = null;
  }
}

// Toggle du menu d'ajout
function toggleAddMenu() {
  showAddMenu.value = !showAddMenu.value;
  if (showAddMenu.value) {
    selectedCondition.value = null;
    conditionDuration.value = null;
  }
}

// Ajout et suppression des event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="condition-manager relative">
    <!-- Affichage des conditions actuelles et bouton d'ajout -->
    <div class="flex flex-wrap items-center">
      <template v-if="props.conditions && props.conditions.length > 0">
        <ConditionBadge 
          v-for="conditionItem in props.conditions" 
          :key="conditionItem.condition.id"
          :condition="conditionItem.condition"
          :level="conditionItem.level"
          :duration="conditionItem.duration"
          :creatureId="props.creatureId"
          :creatureType="props.creatureType"
        />
      </template>
      
      <div class="relative inline-block">
        <button 
          @click.stop="toggleAddMenu"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-500 bg-blue-50 border border-blue-200 mr-2 mb-1 hover:bg-blue-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un état
        </button>
        
        <!-- Menu d'ajout de condition -->
        <div 
          v-if="showAddMenu"
          ref="menuRef"
          class="absolute z-10 left-0 top-full mt-1 bg-white rounded-md shadow-lg p-4 w-64 border border-gray-200"
        >
          <!-- Modification du niveau d'épuisement si déjà présent -->
          <div v-if="hasExhaustion && props.creatureType === 'player'" class="mb-3 p-2 bg-blue-50 rounded-md border border-blue-100">
            <div class="text-xs font-medium text-gray-700 mb-1">Épuisement</div>
            <div class="flex items-center justify-between">
              <input 
                v-model.number="exhaustionLevel" 
                type="range" 
                min="1" 
                max="6" 
                class="flex-grow h-3 mr-1"
                style="min-width: 80px; max-width: 120px;"
              />
              <div class="flex items-center flex-shrink-0">
                <span class="text-xs font-medium mr-1">Lvl {{ exhaustionLevel }}</span>
                <button 
                  @click="updateExhaustion"
                  class="p-1 rounded text-white bg-green-500 hover:bg-green-600 mr-1"
                  title="Mettre à jour"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button 
                  @click="removeExhaustion"
                  class="p-1 rounded text-white bg-red-500 hover:bg-red-600"
                  title="Supprimer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Sélection de condition -->
          <div class="mb-2">
            <select 
              v-if="availableConditions.length > 0"
              v-model="selectedCondition" 
              class="w-full p-2 border border-gray-300 rounded-md"
            >
              <option :value="null">Sélectionner un état</option>
              <option 
                v-for="condition in availableConditions" 
                :key="condition.id" 
                :value="condition"
              >
                {{ condition.label }}
              </option>
            </select>
            <div v-else class="text-gray-500 text-sm">
              Toutes les conditions sont déjà appliquées.
            </div>
          </div>
          
          <!-- Durée (pour les conditions autres que l'épuisement) -->
          <div v-if="selectedCondition && selectedCondition.id !== Condition.EXHAUSTION.id" class="mb-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Durée (en tours)
            </label>
            <input 
              v-model.number="conditionDuration" 
              type="number" 
              min="1"
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Laisser vide pour permanent"
            />
          </div>
          
          <!-- Niveau d'épuisement (uniquement pour l'épuisement) -->
          <div v-if="selectedCondition && selectedCondition.id === Condition.EXHAUSTION.id && props.creatureType === 'player'" class="mb-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Niveau d'épuisement
            </label>
            <div class="flex items-center">
              <input 
                v-model.number="exhaustionLevel" 
                type="range" 
                min="1" 
                max="6" 
                class="w-full mr-2"
              />
              <span class="text-sm font-medium">{{ exhaustionLevel }}</span>
            </div>
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex justify-between mt-2">
            <button 
              @click="addCondition"
              :disabled="!selectedCondition || availableConditions.length === 0"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium',
                (!selectedCondition || availableConditions.length === 0) 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              ]"
            >
              Ajouter
            </button>
            
            <button 
              v-if="props.conditions && props.conditions.length > 0"
              @click="clearAllConditions"
              class="px-3 py-1 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600"
            >
              Tout effacer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
