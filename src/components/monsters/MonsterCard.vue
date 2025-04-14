<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { useMonsterStore } from '@/stores/monster';
import ConditionManager from '@/components/conditions/ConditionManager.vue';
import CharacterStats from '@/components/common/CharacterStats.vue';
import { isValidNumber } from '@/utils/validationUtils';

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

// Gestion locale du résultat du lancer d'initiative
const rollResult = ref<{ roll: number, modifier: number, total: number } | null>(null);
let clearInitiativeTimer: number | null = null;
const isRolling = ref(false);

// Références pour les champs de formulaire
const initiativeInput = ref<HTMLInputElement | null>(null);
const strengthInput = ref<HTMLInputElement | null>(null);
const dexterityInput = ref<HTMLInputElement | null>(null);
const constitutionInput = ref<HTMLInputElement | null>(null);
const intelligenceInput = ref<HTMLInputElement | null>(null);
const wisdomInput = ref<HTMLInputElement | null>(null);
const charismaInput = ref<HTMLInputElement | null>(null);

// Actions
function saveChanges() {
  formSubmitted.value = true;
  // Vérifier que tous les champs obligatoires sont remplis
  if (
    editedMonster.value.name && 
    isValidNumber(editedMonster.value.initiative) &&
    isValidNumber(editedMonster.value.strength) &&
    isValidNumber(editedMonster.value.dexterity) &&
    isValidNumber(editedMonster.value.constitution) &&
    isValidNumber(editedMonster.value.intelligence) &&
    isValidNumber(editedMonster.value.wisdom) &&
    isValidNumber(editedMonster.value.charisma)
  ) {
    // Assurer que l'initiative est un nombre
    const monsterData = {
      ...editedMonster.value,
      initiative: editedMonster.value.initiative || 0 // Utiliser 0 comme valeur par défaut si undefined
    };
    monsterStore.updateMonster(props.monsterId, monsterData);
    monsterStore.cancelEditingMonster();
    formSubmitted.value = false;
  } else {
    console.log("Validation échouée: champs obligatoires manquants", {
      name: !!editedMonster.value.name,
      initiative: isValidNumber(editedMonster.value.initiative),
      strength: isValidNumber(editedMonster.value.strength),
      dexterity: isValidNumber(editedMonster.value.dexterity),
      constitution: isValidNumber(editedMonster.value.constitution),
      intelligence: isValidNumber(editedMonster.value.intelligence),
      wisdom: isValidNumber(editedMonster.value.wisdom),
      charisma: isValidNumber(editedMonster.value.charisma)
    });
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
            Initiative: {{ monster?.initiative }}
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          v-if="!isEditing"
          @click="monsterStore.startEditingMonster(monsterId)" 
          class="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors duration-200 ease-in-out"
          title="Modifier le monstre"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          v-if="!isEditing"
          @click="monsterStore.removeMonster(monsterId)" 
          class="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors duration-200 ease-in-out"
          title="Supprimer le monstre"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button 
          @click="monsterStore.toggleExpand(monsterId)" 
          class="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out"
        >
          <svg v-if="isExpanded" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
          <svg v-else xmlns="http://www.w.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- HP Bar avec design amélioré -->
    <div class="px-4 pb-2">
      <div class="flex justify-between items-center mb-1">
        <div v-if="!isEditing" class="flex items-center space-x-2">
          <!-- CA avec icône de bouclier -->
          <div v-if="monster.ac" class="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="ml-1.5 font-semibold text-base text-gray-800">{{ monster.ac }}</span>
          </div>
          
          <!-- Points de vie -->
          <div class="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            <div class="flex items-baseline ml-1.5">
              <span class="font-semibold text-base text-gray-800">{{ monster.hp }}</span>
              <span class="text-gray-500 text-xs mx-0.5">/</span>
              <span class="text-gray-600 text-sm">{{ monster.maxHp }}</span>
            </div>
          </div>
        </div>
        
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
      <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div 
          :class="[hpColor, 'h-2.5 rounded-full transition-all duration-300 flex items-center justify-end pr-1']" 
          :style="{ width: `${hpPercentage}%` }"
        >
          <div v-if="hpPercentage > 15" class="h-1.5 w-1 bg-white rounded-full opacity-60"></div>
        </div>
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
        
        <!-- Stats minimalistes toujours visibles -->
        <CharacterStats 
          :strength="monster?.strength"
          :dexterity="monster?.dexterity"
          :constitution="monster?.constitution"
          :intelligence="monster?.intelligence"
          :wisdom="monster?.wisdom"
          :charisma="monster?.charisma"
        />
        
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
        <!-- Champs obligatoires -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-1">
              Nom <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="editedMonster.name" 
              type="text" 
              class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
              :class="{ 'border-red-500 bg-red-50': editedMonster.name === '' && formSubmitted, 'border-gray-300': !(editedMonster.name === '' && formSubmitted) }"
              required
            >
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-1">
              Initiative <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="editedMonster.initiative" 
              type="number" 
              class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && initiativeInput && initiativeInput.value === '', 'border-gray-300': !(formSubmitted && initiativeInput && initiativeInput.value === '') }"
              required
              ref="initiativeInput"
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
                v-model.number="editedMonster.strength" 
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
                v-model.number="editedMonster.dexterity" 
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
                v-model.number="editedMonster.constitution" 
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
                v-model.number="editedMonster.intelligence" 
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
                v-model.number="editedMonster.wisdom" 
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
                v-model.number="editedMonster.charisma" 
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
              v-model.number="editedMonster.hp" 
              type="number" 
              class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
            >
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-1">PV Max <span class="text-gray-400 text-xs">(opt.)</span></label>
            <input 
              v-model.number="editedMonster.maxHp" 
              type="number" 
              class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
            >
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-medium mb-1">CA</label>
            <input 
              v-model.number="editedMonster.ac" 
              type="number" 
              class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
            >
          </div>
        </div>
        
        <div class="mb-3">
          <label class="block text-xs sm:text-sm font-medium mb-1">Notes</label>
          <textarea 
            v-model="editedMonster.notes" 
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
      
      <div v-if="!isEditing" class="flex justify-between mt-4">
        <!-- Le bouton "Gérer les états" a été supprimé car il était redondant -->
      </div>
    </div>
  </div>
</template>
