<script setup lang="ts">
import { defineProps, defineEmits, computed, ref } from 'vue';
import { type Monster } from '../../stores/monster';
import MonsterStats from './MonsterStats.vue';

const props = defineProps<{
  monster: Monster;
  isCollapsed: boolean;
  isEditing: boolean;
  rollResult: { monsterId: string, roll: number, modifier: number, total: number } | null;
  showStats: boolean;
}>();

const emit = defineEmits<{
  toggleCollapse: [id: string];
  toggleStats: [id: string];
  updateHp: [monster: Monster, change: number];
  edit: [monster: Monster];
  remove: [id: string];
  rollInitiative: [monster: Monster];
  saveEdit: [monster: Monster, updatedData: Partial<Monster>];
  cancelEdit: [id: string];
}>();

const editedMonster = ref<Partial<Monster>>({...props.monster});

const hpPercentage = computed(() => {
  const percentage = (props.monster.hp / props.monster.maxHp) * 100;
  return Math.max(0, Math.min(100, percentage));
});

const hpColor = computed(() => {
  if (hpPercentage.value > 50) return 'bg-green-500';
  if (hpPercentage.value > 25) return 'bg-yellow-500';
  return 'bg-red-500';
});

// Calculate ability score modifier according to D&D 5e rules
function getAbilityModifier(score?: number): number {
  if (!score) return 0;
  return Math.floor((score - 10) / 2);
}

// Get formatted ability score display
function getAbilityScoreDisplay(score?: number): string {
  if (!score) return '— (±0)';
  const modifier = getAbilityModifier(score);
  const sign = modifier >= 0 ? '+' : '';
  return `${score} (${sign}${modifier})`;
}

function startEditing() {
  editedMonster.value = {...props.monster};
  emit('edit', props.monster);
}

function saveChanges() {
  emit('saveEdit', props.monster, editedMonster.value);
}

function cancelEditing() {
  emit('cancelEdit', props.monster.id);
}
</script>

<template>
  <div 
    class="bg-white rounded-md shadow border border-gray-200 flex flex-col"
    :class="{ 'ring-2 ring-purple-500': rollResult && rollResult.monsterId === monster.id }"
    :id="`monster-${monster.id}`"
  >
    <!-- Monster Header - Always Visible -->
    <div class="flex justify-between items-center p-4">
      <div class="flex items-center">
        <div class="drag-handle cursor-move p-1 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div v-if="isEditing">
          <input 
            v-model="editedMonster.name" 
            type="text" 
            class="font-bold text-lg border border-gray-300 rounded px-2 py-1 w-full"
          />
          <div class="flex items-center space-x-2 mt-1">
            <div class="flex items-center">
              <span class="text-sm text-gray-500 mr-1">Initiative:</span>
              <input 
                v-model.number="editedMonster.initiative" 
                type="number" 
                class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
              />
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 mr-1">CA:</span>
              <input 
                v-model.number="editedMonster.ac" 
                type="number" 
                class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
              />
            </div>
          </div>
        </div>
        <div v-else>
          <h3 class="font-bold text-lg">{{ monster.name }}</h3>
          <div class="text-sm text-gray-500">
            Initiative: {{ monster.initiative }} | CA: {{ monster.ac }}
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <template v-if="isEditing">
          <button 
            @click="saveChanges" 
            class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Enregistrer
          </button>
          <button 
            @click="cancelEditing" 
            class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Annuler
          </button>
        </template>
        <template v-else>
          <button 
            @click="startEditing" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Modifier
          </button>
          <button 
            @click="emit('rollInitiative', monster)" 
            class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm"
          >
            ⚄ Initiative
          </button>
          <button 
            @click="emit('toggleCollapse', monster.id)" 
            class="bg-gray-200 hover:bg-gray-300 p-1 rounded-md"
          >
            <svg v-if="isCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </template>
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
            class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
          />
          <span class="text-sm text-gray-500">/</span>
          <input 
            v-model.number="editedMonster.maxHp" 
            type="number" 
            class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
          />
        </div>
        <div v-if="!isEditing" class="flex space-x-1">
          <button 
            @click="emit('updateHp', monster, -1)" 
            class="bg-red-100 hover:bg-red-200 text-red-800 px-2 rounded"
          >
            -1
          </button>
          <button 
            @click="emit('updateHp', monster, -5)" 
            class="bg-red-100 hover:bg-red-200 text-red-800 px-2 rounded"
          >
            -5
          </button>
          <button 
            @click="emit('updateHp', monster, 1)" 
            class="bg-green-100 hover:bg-green-200 text-green-800 px-2 rounded"
          >
            +1
          </button>
          <button 
            @click="emit('updateHp', monster, 5)" 
            class="bg-green-100 hover:bg-green-200 text-green-800 px-2 rounded"
          >
            +5
          </button>
        </div>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          class="h-2.5 rounded-full" 
          :class="hpColor"
          :style="{ width: `${hpPercentage}%` }"
        ></div>
      </div>
    </div>
    
    <!-- Collapsible Content -->
    <div v-if="!isCollapsed" class="px-4 pb-4">
      <!-- Roll Result Animation -->
      <div 
        v-if="rollResult && rollResult.monsterId === monster.id" 
        class="bg-purple-100 p-2 rounded-md mb-2 text-sm animate-pulse"
      >
        Initiative: {{ rollResult.roll }} + {{ rollResult.modifier }} = {{ rollResult.total }}
      </div>
      
      <!-- Monster Stats Section -->
      <div class="mt-3 bg-gray-50 rounded-md border border-gray-200">
        <!-- Stats Header with Toggle Button -->
        <div 
          @click="emit('toggleStats', monster.id)" 
          class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <h3 class="font-medium text-gray-700">Caractéristiques</h3>
          <div class="flex items-center gap-1">
            <span class="text-sm text-gray-600">{{ showStats ? 'Masquer' : 'Afficher' }}</span>
            <svg v-if="showStats" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        <!-- Stats Content -->
        <div v-if="showStats" class="border-t border-gray-200">
          <div v-if="isEditing" class="p-3">
            <div class="grid grid-cols-3 gap-4 md:grid-cols-6">
              <div class="text-center">
                <div class="font-medium text-gray-700">FOR</div>
                <input 
                  v-model.number="editedMonster.strength" 
                  type="number" 
                  class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
                />
              </div>
              <div class="text-center">
                <div class="font-medium text-gray-700">DEX</div>
                <input 
                  v-model.number="editedMonster.dexterity" 
                  type="number" 
                  class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
                />
              </div>
              <div class="text-center">
                <div class="font-medium text-gray-700">CON</div>
                <input 
                  v-model.number="editedMonster.constitution" 
                  type="number" 
                  class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
                />
              </div>
              <div class="text-center">
                <div class="font-medium text-gray-700">INT</div>
                <input 
                  v-model.number="editedMonster.intelligence" 
                  type="number" 
                  class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
                />
              </div>
              <div class="text-center">
                <div class="font-medium text-gray-700">SAG</div>
                <input 
                  v-model.number="editedMonster.wisdom" 
                  type="number" 
                  class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
                />
              </div>
              <div class="text-center">
                <div class="font-medium text-gray-700">CHA</div>
                <input 
                  v-model.number="editedMonster.charisma" 
                  type="number" 
                  class="border border-gray-300 rounded w-14 px-1 py-0.5 text-sm"
                />
              </div>
            </div>
          </div>
          <MonsterStats 
            v-else-if="monster.strength || monster.dexterity || monster.constitution || monster.intelligence || monster.wisdom || monster.charisma"
            :monster="monster"
            :getAbilityScoreDisplay="getAbilityScoreDisplay"
          />
        </div>
      </div>
      
      <!-- Notes -->
      <div class="mt-2">
        <span class="text-sm text-gray-500">Notes</span>
        <div v-if="isEditing">
          <textarea 
            v-model="editedMonster.notes" 
            class="w-full p-2 border border-gray-300 rounded-md text-sm"
            rows="3"
          ></textarea>
        </div>
        <div v-else-if="monster.notes" class="bg-gray-50 p-2 rounded-md text-sm whitespace-pre-wrap">{{ monster.notes }}</div>
        <div v-else class="bg-gray-50 p-2 rounded-md text-sm text-gray-400 italic">Aucune note</div>
      </div>
      
      <!-- Action Buttons -->
      <div v-if="!isEditing" class="flex justify-end space-x-2 mt-4">
        <button 
          @click="emit('remove', monster.id)" 
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>
