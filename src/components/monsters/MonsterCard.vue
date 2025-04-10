<script setup lang="ts">
import { computed } from 'vue';
import { useMonsterStore } from '../../stores/monster';
import MonsterStats from './MonsterStats.vue';

const props = defineProps<{
  monsterId: string;
}>();

const monsterStore = useMonsterStore();
const monster = computed(() => monsterStore.getMonsterById(props.monsterId)!);

// Computed properties
const isCollapsed = computed(() => monsterStore.isCollapsed(props.monsterId));
const isEditing = computed(() => monsterStore.editingMonsterId === props.monsterId);
const showStats = computed(() => monsterStore.isStatsShown(props.monsterId));
const editedMonster = computed(() => monsterStore.tempMonsterData);

const hpPercentage = computed(() => {
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
  monsterStore.saveEditedMonster();
}

function cancelEditing() {
  monsterStore.cancelEditing();
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
          <h3 class="font-bold text-lg">{{ monster.name }}</h3>
          <div class="text-sm text-gray-500">
            Initiative: {{ monster.initiative }} | CA: {{ monster.ac }}
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          @click="monsterStore.toggleCollapse(monsterId)" 
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded-md"
        >
          <svg v-if="isCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- HP Bar -->
    <div class="px-4 pb-2">
      <div class="flex justify-between text-sm mb-1">
        <span v-if="!isEditing">PV: {{ monster.hp }} / {{ monster.maxHp }}</span>
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
            class="bg-red-200 hover:bg-red-300 text-red-700 px-2 rounded"
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
            class="bg-green-200 hover:bg-green-300 text-green-700 px-2 rounded"
          >
            +5
          </button>
        </div>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          :class="hpColor" 
          class="h-2.5 rounded-full" 
          :style="{ width: `${hpPercentage}%` }"
        ></div>
      </div>
    </div>
    
    <!-- Monster Content - Collapsible -->
    <div v-if="!isCollapsed" class="px-4 pb-4">
      <!-- Roll Result Animation -->
      <div 
        v-if="rollResult && rollResult.monsterId === monsterId" 
        class="bg-purple-100 p-2 rounded-md mb-2 text-sm animate-pulse"
      >
        <span class="font-bold">Initiative:</span> 
        {{ rollResult.roll }} (d20) + {{ rollResult.modifier }} (DEX) = {{ rollResult.total }}
      </div>
      
      <!-- Monster Actions -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button 
          v-if="!isEditing"
          @click="monsterStore.rollInitiative(monsterId)" 
          class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm"
        >
          ⚄ Initiative
        </button>
        <button 
          v-if="!isEditing"
          @click="monsterStore.toggleStats(monsterId)" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
        >
          {{ showStats ? 'Masquer Stats' : 'Voir Stats' }}
        </button>
        <button 
          v-if="!isEditing"
          @click="monsterStore.startEditingMonster(monsterId)" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Modifier
        </button>
      </div>
      
      <!-- Monster Stats -->
      <MonsterStats 
        v-if="showStats && !isEditing" 
        :monsterId="monsterId" 
      />
      
      <!-- Edit Form -->
      <div v-if="isEditing" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
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
            <label class="block text-sm font-medium mb-1">Classe d'Armure</label>
            <input 
              v-model.number="editedMonster.ac" 
              type="number" 
              class="w-full p-2 border border-gray-300 rounded-md"
            >
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold mb-2">Caractéristiques</h4>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">FOR</label>
              <input 
                v-model.number="editedMonster.strength" 
                type="number" 
                class="w-full p-2 border border-gray-300 rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">DEX</label>
              <input 
                v-model.number="editedMonster.dexterity" 
                type="number" 
                class="w-full p-2 border border-gray-300 rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">CON</label>
              <input 
                v-model.number="editedMonster.constitution" 
                type="number" 
                class="w-full p-2 border border-gray-300 rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">INT</label>
              <input 
                v-model.number="editedMonster.intelligence" 
                type="number" 
                class="w-full p-2 border border-gray-300 rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">SAG</label>
              <input 
                v-model.number="editedMonster.wisdom" 
                type="number" 
                class="w-full p-2 border border-gray-300 rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">CHA</label>
              <input 
                v-model.number="editedMonster.charisma" 
                type="number" 
                class="w-full p-2 border border-gray-300 rounded-md"
              >
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Notes</label>
          <textarea 
            v-model="editedMonster.notes" 
            class="w-full p-2 border border-gray-300 rounded-md h-24"
          ></textarea>
        </div>
      </div>
      
      <!-- Monster Notes -->
      <div v-if="!isEditing && monster.notes" class="mt-4 text-sm text-gray-700 whitespace-pre-line">
        {{ monster.notes }}
      </div>
      
      <!-- Edit/Delete Buttons -->
      <div v-if="!isEditing" class="flex justify-end space-x-2 mt-4">
        <button 
          @click="monsterStore.removeMonster(monsterId)" 
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Supprimer
        </button>
      </div>
      
      <!-- Save/Cancel Buttons for Edit Mode -->
      <div v-if="isEditing" class="flex justify-end space-x-2 mt-4">
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
  </div>
</template>
