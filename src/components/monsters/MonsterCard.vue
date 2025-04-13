<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { useMonsterStore } from '@/stores/monster';
import MonsterStats from '@/components/monsters/MonsterStats.vue';
import ConditionManager from '@/components/conditions/ConditionManager.vue';

const props = defineProps<{
  monsterId: string;
}>();

const emit = defineEmits([]);

const monsterStore = useMonsterStore();
const monster = computed(() => monsterStore.getMonsterById(props.monsterId)!);

// État d'édition
const isEditing = computed(() => monsterStore.editingMonsterId === props.monsterId);
const editedMonster = ref({
  name: '',
  hp: 0,
  maxHp: 0,
  ac: 0,
  initiative: undefined as number | undefined,
  notes: '',
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
});

const formSubmitted = ref(false);
const initiativeInput = ref<HTMLInputElement | null>(null);

// Mettre à jour les données d'édition lorsque le monstre change
watch(monster, (newMonster) => {
  if (newMonster) {
    editedMonster.value = {
      name: newMonster.name,
      hp: newMonster.hp,
      maxHp: newMonster.maxHp,
      ac: newMonster.ac,
      initiative: newMonster.initiative,
      notes: newMonster.notes,
      strength: newMonster.strength || 10,
      dexterity: newMonster.dexterity || 10,
      constitution: newMonster.constitution || 10,
      intelligence: newMonster.intelligence || 10,
      wisdom: newMonster.wisdom || 10,
      charisma: newMonster.charisma || 10
    };
  }
}, { immediate: true });

// Computed properties
const hpPercentage = computed(() => {
  if (!monster.value || monster.value.maxHp === 0) return 0;
  return Math.max(0, Math.min(100, (monster.value.hp / monster.value.maxHp) * 100));
});

const hpColor = computed(() => {
  const percentage = hpPercentage.value;
  if (percentage > 50) return 'bg-green-500';
  if (percentage > 25) return 'bg-yellow-500';
  return 'bg-red-500';
});

const isExpanded = computed(() => {
  return monsterStore.isExpanded(props.monsterId);
});

const showStats = computed(() => {
  return monsterStore.isStatsShown(props.monsterId);
});

// Gestion locale du résultat du lancer d'initiative
const rollResult = ref<{ roll: number, modifier: number, total: number } | null>(null);
let clearInitiativeTimer: number | null = null;
const isRolling = ref(false);

// Actions
function saveChanges() {
  formSubmitted.value = true;
  // Vérifier que le nom est rempli et que l'initiative est définie
  if (editedMonster.value.name && 
      initiativeInput.value && 
      initiativeInput.value.value !== '') {
    // Assurer que l'initiative est un nombre
    const monsterData = {
      ...editedMonster.value,
      initiative: editedMonster.value.initiative || 0 // Utiliser 0 comme valeur par défaut si undefined
    };
    monsterStore.updateMonster(props.monsterId, monsterData);
    monsterStore.cancelEditingMonster();
    formSubmitted.value = false;
  }
}

function cancelEditing() {
  monsterStore.cancelEditingMonster();
  formSubmitted.value = false;
}

// Fonction pour lancer l'initiative
function rollInitiative() {
  // Annuler tout timer précédent
  if (clearInitiativeTimer) {
    clearTimeout(clearInitiativeTimer);
    clearInitiativeTimer = null;
  }
  
  // Activer l'animation
  isRolling.value = true;
  
  // Exécuter le roll immédiatement via le store
  const result = monsterStore.rollInitiative(props.monsterId);
  
  // Stocker le résultat localement pour l'affichage
  rollResult.value = result;
  
  // Programmer l'effacement du résultat après 3 secondes
  clearInitiativeTimer = window.setTimeout(() => {
    rollResult.value = null;
    isRolling.value = false;
    clearInitiativeTimer = null;
  }, 3000);
}

// Exposer la méthode pour qu'elle puisse être appelée par le parent
defineExpose({
  rollInitiative
});

// S'assurer d'annuler le timer si le composant est détruit
onUnmounted(() => {
  if (clearInitiativeTimer) {
    clearTimeout(clearInitiativeTimer);
  }
});
</script>

<style scoped>
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

.initiative-result-animation {
  animation: fadeInOut 3s ease-in-out;
}

.ring-transition {
  transition: box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out;
}
</style>

<template>
  <div 
    class="bg-white rounded-md shadow border border-gray-200 flex flex-col ring-transition"
    :class="{ 'ring-2 ring-purple-500 border-purple-300': isRolling }"
    :id="`monster-${monsterId}`"
  >
    <!-- Monster Header - Always Visible -->
    <div class="flex justify-between items-center p-4">
      <div class="flex items-center">
        <div class="drag-handle cursor-move p-1 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-lg">{{ monster?.name }}</h3>
          <div class="text-sm text-gray-500">
            Initiative: {{ monster?.initiative }} | CA: {{ monster?.ac }}
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          v-if="!isEditing"
          @click="monsterStore.startEditingMonster(monsterId)" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs sm:text-sm"
        >
          <span class="hidden xs:inline">Modifier</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 xs:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          v-if="!isEditing"
          @click="monsterStore.removeMonster(monsterId)" 
          class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs sm:text-sm"
        >
          <span class="hidden xs:inline">Supprimer</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 xs:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button 
          @click="monsterStore.toggleExpand(monsterId)" 
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded-md"
        >
          <svg v-if="isExpanded" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- HP Bar -->
    <div class="px-4 pb-2">
      <div class="flex justify-between text-sm mb-1">
        <span v-if="!isEditing">PV: {{ monster?.hp }} / {{ monster?.maxHp }}</span>
        <div v-else class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">PV:</span>
          <input 
            v-model.number="editedMonster.hp" 
            type="number" 
            class="w-16 p-1 border border-gray-300 rounded-md text-sm"
          >
          <span>/</span>
          <input 
            v-model.number="editedMonster.maxHp" 
            type="number" 
            class="w-16 p-1 border border-gray-300 rounded-md text-sm"
          >
        </div>
        
        <div v-if="!isEditing" class="flex space-x-1">
          <button 
            @click="monsterStore.updateMonsterHp(monsterId, -1)" 
            class="bg-red-100 hover:bg-red-200 text-red-700 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm"
          >
            -1
          </button>
          <button 
            @click="monsterStore.updateMonsterHp(monsterId, -5)" 
            class="bg-red-100 hover:bg-red-200 text-red-700 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm"
          >
            -5
          </button>
          <button 
            @click="monsterStore.updateMonsterHp(monsterId, 1)" 
            class="bg-green-100 hover:bg-green-200 text-green-700 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm"
          >
            +1
          </button>
          <button 
            @click="monsterStore.updateMonsterHp(monsterId, 5)" 
            class="bg-green-100 hover:bg-green-200 text-green-700 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm"
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
    
    <!-- Expanded Content -->
    <div v-if="isExpanded" class="px-4 pb-4">
      <!-- Roll Result Animation -->
      <div 
        v-if="rollResult" 
        class="bg-purple-100 p-2 rounded-md mb-2 text-sm initiative-result-animation transition-all duration-300 ease-in-out"
        :class="{ 'opacity-100': isRolling, 'opacity-0': !isRolling }"
      >
        Initiative: {{ rollResult.roll }} + {{ rollResult.modifier }} = {{ rollResult.total }}
      </div>
      
      <!-- Monster Details -->
      <div v-if="!isEditing" class="flex flex-col">
        <div class="flex justify-between items-center gap-2 mb-2">
          <button 
            @click="monsterStore.toggleStats(monsterId)" 
            class="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-md text-xs sm:text-sm"
          >
            <span>{{ showStats ? 'Masquer stats' : 'Afficher stats' }}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-3 w-3 sm:h-4 sm:w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                :d="showStats ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" 
              />
            </svg>
          </button>
          
          <button 
            @click="rollInitiative" 
            class="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-xs sm:text-sm flex items-center"
            title="Lancer l'initiative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="sm:hidden inline-block align-middle">Roll</span>
            <span class="hidden sm:inline-block align-middle">Lancer Initiative</span>
          </button>
        </div>
        
        <!-- Stats Panel -->
        <MonsterStats v-if="showStats" :monsterId="monsterId" class="mb-4" />
        
        <!-- Gestionnaire de conditions -->
        <ConditionManager 
          v-if="!isEditing"
          :conditions="monster.conditions"
          creature-type="monster"
          :creature-id="monsterId"
          class="mb-4"
        />
        
        <div v-if="monster?.notes" class="mt-2">
          <h4 class="font-semibold text-sm mb-1">Notes:</h4>
          <div class="text-sm bg-gray-50 p-2 rounded-md whitespace-pre-wrap">{{ monster.notes }}</div>
        </div>
      </div>
      
      <!-- Edit Mode -->
      <div v-else class="flex flex-col">
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label class="block text-sm font-medium mb-1">
              Nom <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="editedMonster.name" 
              type="text" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': editedMonster.name === '' && formSubmitted, 'border-gray-300': !(editedMonster.name === '' && formSubmitted) }"
              required
            >
            <p v-if="editedMonster.name === '' && formSubmitted" class="mt-1 text-xs text-red-500">
              Le nom est obligatoire
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">
              Initiative <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="editedMonster.initiative" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && initiativeInput && initiativeInput.value === '', 'border-gray-300': !(formSubmitted && initiativeInput && initiativeInput.value === '') }"
              ref="initiativeInput"
              required
            >
            <p v-if="formSubmitted && initiativeInput && initiativeInput.value === ''" class="mt-1 text-xs text-red-500">
              L'initiative est obligatoire
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">CA</label>
            <input 
              v-model.number="editedMonster.ac" 
              type="number" 
              class="w-full p-2 border border-gray-300 rounded-md"
            >
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label class="block text-xs mb-1">FOR</label>
            <input 
              v-model.number="editedMonster.strength" 
              type="number" 
              class="w-full p-1 border border-gray-300 rounded-md text-sm"
            >
          </div>
          <div>
            <label class="block text-xs mb-1">DEX</label>
            <input 
              v-model.number="editedMonster.dexterity" 
              type="number" 
              class="w-full p-1 border border-gray-300 rounded-md text-sm"
            >
          </div>
          <div>
            <label class="block text-xs mb-1">CON</label>
            <input 
              v-model.number="editedMonster.constitution" 
              type="number" 
              class="w-full p-1 border border-gray-300 rounded-md text-sm"
            >
          </div>
          <div>
            <label class="block text-xs mb-1">INT</label>
            <input 
              v-model.number="editedMonster.intelligence" 
              type="number" 
              class="w-full p-1 border border-gray-300 rounded-md text-sm"
            >
          </div>
          <div>
            <label class="block text-xs mb-1">SAG</label>
            <input 
              v-model.number="editedMonster.wisdom" 
              type="number" 
              class="w-full p-1 border border-gray-300 rounded-md text-sm"
            >
          </div>
          <div>
            <label class="block text-xs mb-1">CHA</label>
            <input 
              v-model.number="editedMonster.charisma" 
              type="number" 
              class="w-full p-1 border border-gray-300 rounded-md text-sm"
            >
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Notes</label>
          <textarea 
            v-model="editedMonster.notes" 
            class="w-full p-2 border border-gray-300 rounded-md h-24 text-sm"
          ></textarea>
        </div>
        
        <div class="flex justify-between items-center mt-4">
          <p class="text-xs text-gray-500">Les champs marqués d'un <span class="text-red-500">*</span> sont obligatoires</p>
          
          <div class="flex space-x-2">
            <button 
              @click="cancelEditing" 
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
            >
              Annuler
            </button>
            <button 
              @click="saveChanges" 
              class="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="!isEditing" class="flex justify-between mt-4">
        <!-- Le bouton "Gérer les états" a été supprimé car il était redondant -->
      </div>
    </div>
  </div>
</template>
