<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Condition, conditionTranslations } from '@/utils/conditionUtils';
import type { ConditionWithLevel } from '@/utils/conditionUtils';
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
const selectedCondition = ref<Condition | null>(null);
const exhaustionLevel = ref<number>(1);
const conditionDuration = ref<number | null>(null);
const showAddMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);

// Obtenir le niveau actuel d'épuisement
const currentExhaustionLevel = computed(() => {
  const exhaustionCondition = props.conditions?.find(c => c.condition === Condition.EXHAUSTION);
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
  const existingConditions = new Set((props.conditions || []).map(c => c.condition));
  
  return Object.values(Condition)
    .filter(condition => {
      // L'épuisement est uniquement pour les joueurs
      if (condition === Condition.EXHAUSTION && props.creatureType !== 'player') {
        return false;
      }
      return !existingConditions.has(condition);
    })
    .sort();
});

// Vérifie si la créature a déjà une condition d'épuisement
const hasExhaustion = computed(() => {
  return props.conditions?.some(c => c.condition === Condition.EXHAUSTION) || false;
});

// Ajouter une condition
function addCondition() {
  if (!selectedCondition.value) return;
  
  if (selectedCondition.value === Condition.EXHAUSTION) {
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

// Supprimer une condition
function removeCondition(condition: Condition) {
  if (props.creatureType === 'monster') {
    monsterStore.removeCondition(props.creatureId, condition);
  } else {
    playerStore.removeCondition(props.creatureId, condition);
  }
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
  <div class="condition-manager">
    <!-- Affichage des conditions actuelles et bouton d'ajout -->
    <div class="flex flex-wrap items-center">
      <template v-if="props.conditions && props.conditions.length > 0">
        <ConditionBadge 
          v-for="conditionItem in props.conditions" 
          :key="conditionItem.condition"
          :condition="conditionItem.condition"
          :level="conditionItem.level"
          :duration="conditionItem.duration"
          :creatureId="props.creatureId"
          :creatureType="props.creatureType"
          class="mr-2 mb-1"
        />
      </template>
      
      <!-- Bouton pour ajouter des conditions avec menu déroulant -->
      <div class="relative inline-block mb-1">
        <button 
          @click.stop="toggleAddMenu"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-500 bg-blue-50 border border-blue-200 mr-2 hover:bg-blue-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <span v-if="!props.conditions || props.conditions.length === 0">Ajouter un état</span>
          <span v-else>État</span>
        </button>
        
        <!-- Menu déroulant pour ajouter des conditions -->
        <div 
          v-if="showAddMenu" 
          ref="menuRef"
          @click.stop
          class="absolute left-0 top-full mt-1 w-56 bg-white rounded-md shadow-lg p-3 border border-gray-200 text-sm z-50"
        >
          <!-- Sélection de condition -->
          <div class="mb-2">
            <select 
              v-if="availableConditions.length > 0"
              v-model="selectedCondition"
              class="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              :key="'condition-select-' + (props.conditions?.length || 0)"
            >
              <option :value="null">Sélectionner un état</option>
              <option 
                v-for="condition in availableConditions" 
                :key="condition" 
                :value="condition"
              >
                {{ conditionTranslations[condition] }}
              </option>
            </select>
            <div 
              v-else
              class="p-2 text-center text-gray-500 bg-gray-50 rounded-md"
            >
              Tous les états disponibles ont déjà été ajoutés.
            </div>
          </div>
          
          <!-- Durée de la condition -->
          <div class="mb-2" v-if="selectedCondition !== Condition.EXHAUSTION">
            <input 
              v-model.number="conditionDuration"
              type="number" 
              min="1" 
              class="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              placeholder="Durée (optionnelle)"
            />
            <span class="text-xs">Durée en tours (optionnelle)</span>
          </div>
          
          <!-- Gestion de l'épuisement -->
          <div class="mb-2" v-if="props.creatureType === 'player' && (selectedCondition === Condition.EXHAUSTION || hasExhaustion)">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input 
                  v-model.number="exhaustionLevel"
                  type="range" 
                  min="1" 
                  max="6" 
                  class="w-24 mr-2"
                />
                <span class="text-xs">Lvl {{ exhaustionLevel }}</span>
              </div>
              
              <div v-if="!hasExhaustion">
                <button 
                  @click="updateExhaustion"
                  class="bg-green-500 hover:bg-green-600 text-white p-1 rounded-sm text-xs"
                  title="Ajouter l'épuisement"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div v-else class="flex space-x-1">
                <button 
                  @click="updateExhaustion"
                  class="bg-green-500 hover:bg-green-600 text-white p-1 rounded-sm text-xs"
                  title="Mettre à jour le niveau d'épuisement"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button 
                  @click="removeCondition(Condition.EXHAUSTION)"
                  class="bg-red-500 hover:bg-red-600 text-white p-1 rounded-sm text-xs"
                  title="Supprimer l'épuisement"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex justify-between mt-2">
            <button 
              @click="addCondition"
              :disabled="!selectedCondition || availableConditions.length === 0"
              :class="[
                'px-2 py-0.5 rounded text-xs',
                selectedCondition && availableConditions.length > 0
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              Ajouter
            </button>
            
            <button 
              v-if="props.conditions && props.conditions.length > 0"
              @click="clearAllConditions"
              class="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-xs"
            >
              Tout effacer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
