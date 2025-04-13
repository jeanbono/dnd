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
      // Filtrer uniquement les conditions qui ne sont pas déjà appliquées
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
  } else if (props.creatureType === 'monster') {
    monsterStore.updateExhaustionLevel(props.creatureId, Number(exhaustionLevel.value));
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
  if (props.creatureType === 'monster') {
    monsterStore.removeCondition(props.creatureId, Condition.EXHAUSTION);
  } else {
    playerStore.removeCondition(props.creatureId, Condition.EXHAUSTION);
  }
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
          class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium shadow-sm transition-all duration-200 bg-purple-100 text-purple-800 hover:bg-purple-200 hover:shadow mr-2 mb-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un état
        </button>
        
        <!-- Menu d'ajout de condition -->
        <div 
          v-if="showAddMenu"
          ref="menuRef"
          class="absolute z-10 left-0 top-full mt-1 bg-white rounded-lg shadow-xl p-4 w-72 border border-gray-100"
        >
          <!-- Modification du niveau d'épuisement si déjà présent -->
          <div v-if="hasExhaustion" class="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div class="text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
              <span>Épuisement</span>
              <div class="text-xs font-semibold py-0.5 px-1.5 bg-amber-200 text-amber-800 rounded">
                Niveau {{ exhaustionLevel }}
              </div>
            </div>
            <div class="flex flex-col">
              <div class="w-full mb-2">
                <input 
                  v-model.number="exhaustionLevel" 
                  type="range" 
                  min="1" 
                  max="6" 
                  class="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                  :class="{
                    'accent-yellow-500': exhaustionLevel <= 2,
                    'accent-orange-500': exhaustionLevel > 2 && exhaustionLevel <= 4,
                    'accent-red-600': exhaustionLevel >= 5
                  }"
                />
                <div class="flex justify-between text-xs text-gray-500 px-1 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                </div>
              </div>
              <div class="flex justify-between mt-2">
                <button 
                  @click="updateExhaustion"
                  class="px-2 py-1 rounded-md text-xs font-medium text-white bg-green-500 hover:bg-green-600 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Mettre à jour
                </button>
                <button 
                  @click="removeExhaustion"
                  class="px-2 py-1 rounded-md text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
          
          <!-- En-tête du menu de sélection si l'épuisement est déjà présent -->
          <div v-if="hasExhaustion" class="border-t border-gray-100 pt-3 mb-3">
            <h4 class="text-sm font-medium text-gray-800 mb-2">Ajouter un autre état</h4>
          </div>
          
          <!-- Sélection de condition -->
          <div class="mb-3">
            <select 
              v-if="availableConditions.length > 0"
              v-model="selectedCondition" 
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all"
            >
              <option :value="null">Sélectionner un état</option>
              <optgroup v-if="!hasExhaustion && availableConditions.some(c => c.id === 'exhaustion')" label="État spécial">
                <option 
                  v-for="condition in availableConditions.filter(c => c.id === 'exhaustion')" 
                  :key="condition.id" 
                  :value="condition"
                >
                  {{ condition.label }}
                </option>
              </optgroup>
              <optgroup label="États standards">
                <option 
                  v-for="condition in availableConditions.filter(c => c.id !== 'exhaustion')" 
                  :key="condition.id" 
                  :value="condition"
                >
                  {{ condition.label }}
                </option>
              </optgroup>
            </select>
            <div v-else class="text-gray-500 text-sm py-2 px-3 bg-gray-50 rounded-md">
              Toutes les conditions sont déjà appliquées.
            </div>
          </div>
          
          <!-- Durée (pour les conditions autres que l'épuisement) -->
          <div v-if="selectedCondition && selectedCondition.id !== Condition.EXHAUSTION.id" class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Durée (en tours)
            </label>
            <div class="flex items-center">
              <input 
                v-model.number="conditionDuration" 
                type="number" 
                min="1"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                placeholder="Laisser vide pour permanent"
              />
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Laisser vide pour un état permanent
            </div>
          </div>
          
          <!-- Niveau d'épuisement (uniquement pour l'épuisement) -->
          <div v-if="selectedCondition && selectedCondition.id === Condition.EXHAUSTION.id" class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Niveau d'épuisement
            </label>
            <div class="w-full mb-2">
              <input 
                v-model.number="exhaustionLevel" 
                type="range" 
                min="1" 
                max="6" 
                class="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                :class="{
                  'accent-yellow-500': exhaustionLevel <= 2,
                  'accent-orange-500': exhaustionLevel > 2 && exhaustionLevel <= 4,
                  'accent-red-600': exhaustionLevel >= 5
                }"
              />
              <div class="flex justify-between text-xs text-gray-500 px-1 mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>
            <div class="text-sm mt-2 p-2 rounded-md" :class="{
              'bg-yellow-50 text-yellow-800': exhaustionLevel <= 2,
              'bg-orange-50 text-orange-800': exhaustionLevel > 2 && exhaustionLevel <= 4,
              'bg-red-50 text-red-800': exhaustionLevel >= 5
            }">
              <div class="font-medium">Niveau {{ exhaustionLevel }} :</div>
              <div v-if="exhaustionLevel === 1">Désavantage aux tests de caractéristique</div>
              <div v-if="exhaustionLevel === 2">Vitesse réduite de moitié</div>
              <div v-if="exhaustionLevel === 3">Désavantage aux jets d'attaque et de sauvegarde</div>
              <div v-if="exhaustionLevel === 4">Points de vie maximum divisés par deux</div>
              <div v-if="exhaustionLevel === 5">Vitesse réduite à 0</div>
              <div v-if="exhaustionLevel === 6" class="font-semibold">Mort</div>
            </div>
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex justify-between mt-4 pt-3 border-t border-gray-100 gap-2">
            <button 
              v-if="props.conditions && props.conditions.length > 0"
              @click="clearAllConditions"
              class="flex-1 px-2 py-1 rounded-md text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Tout effacer
            </button>
            
            <button 
              @click="addCondition"
              :disabled="!selectedCondition || availableConditions.length === 0"
              :class="[
                'flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center justify-center',
                (!selectedCondition || availableConditions.length === 0) 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Style spécifique pour les sliders */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #9333ea; /* bg-purple-600 */
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  cursor: pointer;
  margin-top: -7px; /* Pour centrer le curseur par rapport à la track */
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #9333ea; /* bg-purple-600 */
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  cursor: pointer;
}

/* Style pour la track du slider */
input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background-color: #fcd34d; /* bg-amber-300 */
}

input[type="range"]::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background-color: #fcd34d; /* bg-amber-300 */
}

/* Animation du menu */
.absolute[v-if="showAddMenu"] {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
