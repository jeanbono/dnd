<script setup lang="ts">
import { ref } from 'vue';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';
import { 
  Condition,
  type ConditionData,
} from '@/utils/conditionUtils';

const props = defineProps<{
  creatureId: string;
  creatureType: 'monster' | 'player';
}>();

const monsterStore = useMonsterStore();
const playerStore = usePlayerStore();

const isOpen = ref(false);
const showExhaustionLevels = ref(false);
const showDurationInput = ref<ConditionData | null>(null);
const conditionDuration = ref<number>(1);

// Fonction pour basculer l'état du menu dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  showExhaustionLevels.value = false;
  showDurationInput.value = null;
};

// Fonction pour fermer le menu dropdown
const closeDropdown = () => {
  isOpen.value = false;
  showExhaustionLevels.value = false;
  showDurationInput.value = null;
};

// Fonction pour ajouter une condition (quand la durée n'est pas nécessaire)
const addCondition = (condition: ConditionData, level?: number, duration?: number) => {
  if (props.creatureType === 'monster') {
    monsterStore.addCondition(props.creatureId, condition, level, duration);
  } else {
    playerStore.addCondition(props.creatureId, condition, level, duration);
  }
  closeDropdown();
};

// Fonction pour montrer le sous-menu des niveaux d'épuisement
const showExhaustion = () => {
  showExhaustionLevels.value = true;
  showDurationInput.value = null;
};

// Fonction pour montrer l'input de durée
const promptForDuration = (condition: ConditionData) => {
  showDurationInput.value = condition;
  showExhaustionLevels.value = false;
};

// Fonction pour ajouter une condition avec durée
const addConditionWithDuration = () => {
  if (showDurationInput.value) {
    addCondition(showDurationInput.value, undefined, conditionDuration.value);
  }
};

// Lorsqu'on clique à l'extérieur du dropdown, on le ferme
const handleClickOutside = (event: MouseEvent) => {
  const dropdown = document.getElementById('condition-dropdown');
  if (dropdown && !dropdown.contains(event.target as Node) && isOpen.value) {
    closeDropdown();
  }
};

// Ajouter l'écouteur d'événements au montage du composant
document.addEventListener('mousedown', handleClickOutside);
document.addEventListener('touchstart', handleClickOutside);
</script>

<template>
  <!-- Utilisation du menu dropdown pour l'ajout de conditions -->
  <div class="relative inline-block text-left" id="condition-dropdown">
    <button 
      @click="toggleDropdown"
      class="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition-all duration-200 bg-purple-100 text-purple-800 hover:bg-purple-200 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      État
    </button>

    <!-- Menu dropdown -->
    <div 
      v-if="isOpen" 
      class="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
    >
      <div v-if="!showExhaustionLevels && !showDurationInput" class="py-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
        <!-- Liste des conditions -->
        <button 
          v-for="condition in Object.values(Condition)"
          :key="condition.id"
          @click="condition.id === 'exhaustion' ? showExhaustion() : (condition.hasDuration ? promptForDuration(condition) : addCondition(condition))"
          class="text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-900 transition-colors duration-150 flex items-center"
        >
          <span class="w-3 h-3 rounded-full mr-2" 
                :class="{
                  'bg-gray-500': ['blinded', 'deafened', 'petrified'].includes(condition.id),
                  'bg-purple-500': ['charmed', 'frightened'].includes(condition.id),
                  'bg-blue-500': ['grappled', 'restrained'].includes(condition.id),
                  'bg-blue-400': ['prone'].includes(condition.id),
                  'bg-green-600': ['poisoned'].includes(condition.id),
                  'bg-red-500': ['paralyzed', 'stunned', 'unconscious'].includes(condition.id),
                  'bg-indigo-400': ['invisible'].includes(condition.id),
                  'bg-yellow-500': ['exhaustion'].includes(condition.id),
                }">
          </span>
          {{ condition.label }}
        </button>
      </div>

      <!-- Sous-menu pour les niveaux d'épuisement -->
      <div v-if="showExhaustionLevels" class="py-1">
        <div class="px-4 py-2 text-sm text-gray-600 border-b">
          Niveau d'épuisement :
        </div>
        <button 
          v-for="level in [1, 2, 3, 4, 5, 6]" 
          :key="`exhaustion-${level}`"
          @click="addCondition(Condition.EXHAUSTION, level)"
          class="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 transition-colors duration-150 flex items-center justify-between"
          :class="{
            'text-yellow-700 bg-yellow-50': level <= 2,
            'text-orange-700 bg-orange-50': level > 2 && level <= 4,
            'text-red-700 bg-red-50': level >= 5
          }"
        >
          <span class="font-medium">Niveau {{ level }}</span>
          <span class="text-xs">
            {{ level === 1 ? 'Désavantage aux tests de caractéristique' : 
               level === 2 ? 'Vitesse réduite de moitié' :
               level === 3 ? 'Désavantage aux jets d\'attaque et de sauvegarde' :
               level === 4 ? 'Points de vie maximum diminués de moitié' :
               level === 5 ? 'Vitesse réduite à 0' :
               'Mort' }}
          </span>
        </button>
        <button 
          @click="closeDropdown"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
        >
          Retour
        </button>
      </div>

      <!-- Input pour la durée de la condition -->
      <div v-if="showDurationInput" class="py-1">
        <div class="px-4 py-2 text-sm text-gray-600 border-b">
          Durée (en tours) pour "{{ showDurationInput.label }}" :
        </div>
        <div class="p-4">
          <input 
            type="number" 
            v-model="conditionDuration" 
            min="1" 
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
          <div class="mt-4 flex justify-between">
            <button 
              @click="closeDropdown"
              class="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Annuler
            </button>
            <button 
              @click="addConditionWithDuration"
              class="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation subtile au survol */
button:hover {
  transform: translateY(-1px);
}

/* Styles des éléments du menu */
.origin-top-left {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 400px;
  overflow-y: auto;
}

/* Amélioration du style des indicateurs de niveau */
.w-3.h-3.rounded-full {
  display: inline-block;
  flex-shrink: 0;
}
</style>