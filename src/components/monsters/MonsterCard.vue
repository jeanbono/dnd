<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useMonsterStore } from '../../stores/monster';
import MonsterStats from './MonsterStats.vue';

const props = defineProps<{
  monsterId: string;
}>();

const monsterStore = useMonsterStore();
const monster = computed(() => monsterStore.getMonsterById(props.monsterId)!);

// Computed properties
const isExpanded = computed(() => monsterStore.isExpanded(props.monsterId));
const isEditing = computed(() => monsterStore.editingMonsterId === props.monsterId);
const showStats = computed(() => monsterStore.isStatsShown(props.monsterId));

// Données d'édition gérées localement
const editedMonster = ref({
  name: '',
  initiative: 0,
  hp: 0,
  maxHp: 0,
  ac: 0,
  notes: '',
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
});

// Mettre à jour les données d'édition quand le monstre change
watch(() => monster.value, (newMonster) => {
  if (newMonster && !isEditing.value) {
    editedMonster.value = {
      name: newMonster.name,
      initiative: newMonster.initiative,
      hp: newMonster.hp,
      maxHp: newMonster.maxHp,
      ac: newMonster.ac,
      notes: newMonster.notes || '',
      strength: newMonster.strength || 10,
      dexterity: newMonster.dexterity || 10,
      constitution: newMonster.constitution || 10,
      intelligence: newMonster.intelligence || 10,
      wisdom: newMonster.wisdom || 10,
      charisma: newMonster.charisma || 10
    };
  }
}, { deep: true, immediate: true });

// Réinitialiser les données d'édition quand on entre en mode édition
watch(isEditing, (editing) => {
  if (editing && monster.value) {
    editedMonster.value = {
      name: monster.value.name,
      initiative: monster.value.initiative,
      hp: monster.value.hp,
      maxHp: monster.value.maxHp,
      ac: monster.value.ac,
      notes: monster.value.notes || '',
      strength: monster.value.strength || 10,
      dexterity: monster.value.dexterity || 10,
      constitution: monster.value.constitution || 10,
      intelligence: monster.value.intelligence || 10,
      wisdom: monster.value.wisdom || 10,
      charisma: monster.value.charisma || 10
    };
  }
});

const hpPercentage = computed(() => {
  if (!monster.value) return 0;
  const percentage = (monster.value.hp / monster.value.maxHp) * 100;
  return Math.max(0, Math.min(100, percentage));
});

const hpColor = computed(() => {
  if (hpPercentage.value > 50) return 'bg-green-500';
  if (hpPercentage.value > 25) return 'bg-yellow-500';
  return 'bg-red-500';
});

const rollResult = computed(() => monsterStore.rollResult);

// Actions
function saveChanges() {
  if (isEditing.value) {
    monsterStore.updateMonster(props.monsterId, editedMonster.value);
    monsterStore.cancelEditingMonster();
  }
}

function cancelEditing() {
  monsterStore.cancelEditingMonster();
}
</script>

<template>
  <div 
    class="bg-white rounded-md shadow border border-gray-200 flex flex-col"
    :class="{ 'ring-2 ring-purple-500': rollResult && rollResult.monsterId === monsterId }"
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
            class="bg-red-100 hover:bg-red-200 text-red-700 px-2 rounded"
          >
            -1
          </button>
          <button 
            @click="monsterStore.updateMonsterHp(monsterId, -5)" 
            class="bg-red-100 hover:bg-red-200 text-red-700 px-2 rounded"
          >
            -5
          </button>
          <button 
            @click="monsterStore.updateMonsterHp(monsterId, 1)" 
            class="bg-green-100 hover:bg-green-200 text-green-700 px-2 rounded"
          >
            +1
          </button>
          <button 
            @click="monsterStore.updateMonsterHp(monsterId, 5)" 
            class="bg-green-100 hover:bg-green-200 text-green-700 px-2 rounded"
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
        v-if="rollResult && rollResult.monsterId === monsterId" 
        class="bg-purple-100 p-2 rounded-md mb-2 text-sm animate-pulse"
      >
        Initiative: {{ rollResult.roll }} + {{ rollResult.modifier }} = {{ rollResult.total }}
      </div>
      
      <!-- Monster Details -->
      <div v-if="!isEditing" class="flex flex-col">
        <div class="flex justify-between items-center mb-2">
          <button 
            @click="monsterStore.toggleStats(monsterId)" 
            class="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
          >
            <span>{{ showStats ? 'Masquer stats' : 'Afficher stats' }}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4 ml-1" 
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
          
          <div class="flex space-x-2">
            <button 
              @click="monsterStore.rollInitiative(monsterId)" 
              class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Lancer Initiative
            </button>
            <button 
              @click="monsterStore.startEditingMonster(monsterId)" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Modifier
            </button>
          </div>
        </div>
        
        <!-- Stats Panel -->
        <div 
          v-if="showStats" 
          class="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3 transition-all duration-300"
        >
          <MonsterStats 
            :monsterId="monsterId" 
          />
        </div>
        
        <div v-if="monster?.notes" class="mt-2">
          <h4 class="font-semibold text-sm mb-1">Notes:</h4>
          <div class="text-sm bg-gray-50 p-2 rounded-md whitespace-pre-wrap">{{ monster.notes }}</div>
        </div>
      </div>
      
      <!-- Edit Mode -->
      <div v-else class="flex flex-col">
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label class="block text-sm font-medium mb-1">Nom</label>
            <input 
              v-model="editedMonster.name" 
              type="text" 
              class="w-full p-2 border border-gray-300 rounded-md"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Initiative</label>
            <input 
              v-model.number="editedMonster.initiative" 
              type="number" 
              class="w-full p-2 border border-gray-300 rounded-md"
            >
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
        
        <div class="flex justify-end space-x-2 mt-3">
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
      
      <div v-if="!isEditing" class="flex justify-end space-x-2 mt-4">
        <button 
          @click="monsterStore.removeMonster(monsterId)" 
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>
