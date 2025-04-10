<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { type Monster, useMonsterStore } from '../../stores/monster';
import Sortable from 'sortablejs';
import MonsterSearch from './MonsterSearch.vue';
import InitiativeOrder from '../initiative/InitiativeOrder.vue';
import PlayerList from '../players/PlayerList.vue';
import MonsterForm from './MonsterForm.vue';
import MonsterCard from './MonsterCard.vue';

const store = useMonsterStore();
const monsters = computed(() => store.monsters);
const containerRef = ref<HTMLElement | null>(null);
const rollResult = ref<{ monsterId: string, roll: number, modifier: number, total: number } | null>(null);
const collapsedMonsters = ref<Set<string>>(new Set());
const showStatsForMonster = ref<Record<string, boolean>>({});
const editingMonster = ref<string | null>(null);
const tempMonsterData = ref<Partial<Monster>>({});
const isAddingMonster = ref(false);
const showMonsterSearch = ref(false);

onMounted(() => {
  setupSortable();
});

function setupSortable() {
  if (containerRef.value) {
    Sortable.create(containerRef.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'bg-gray-100',
      onEnd(evt: Sortable.SortableEvent) {
        // Get the new order of monsters
        const newOrder = [...monsters.value];
        const movedItem = newOrder.splice(evt.oldIndex!, 1)[0];
        newOrder.splice(evt.newIndex!, 0, movedItem);
        
        // Update the store
        store.reorderMonsters(newOrder);
      }
    });
  }
}

function toggleCollapse(monsterId: string) {
  if (collapsedMonsters.value.has(monsterId)) {
    collapsedMonsters.value.delete(monsterId);
  } else {
    collapsedMonsters.value.add(monsterId);
  }
}

function isCollapsed(monsterId: string): boolean {
  return collapsedMonsters.value.has(monsterId);
}

function addMonster() {
  if (!isAddingMonster.value) {
    isAddingMonster.value = true;
    return;
  }
  
  // Get the form component reference and access its data
  const monsterFormRef = document.querySelector('monster-form');
  if (!monsterFormRef) return;
  
  const monsterData = tempMonsterData.value;
  
  if (monsterData.name && monsterData.hp !== undefined && monsterData.maxHp !== undefined) {
    store.addMonster(monsterData as Omit<Monster, 'id'>);
    resetForm();
  }
}

function updateHp(monster: Monster, change: number) {
  const newHp = Math.max(0, Math.min(monster.maxHp, monster.hp + change));
  store.updateMonster(monster.id, { hp: newHp });
}

function removeMonster(id: string) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce monstre ?')) {
    store.removeMonster(id);
    
    // If we were editing this monster, reset the form
    if (editingMonster.value === id) {
      resetForm();
    }
  }
}

function rollInitiative(monster: Monster) {
  const result = store.rollInitiative(monster.id);
  if (result) {
    rollResult.value = {
      monsterId: monster.id,
      roll: result.roll,
      modifier: result.modifier,
      total: result.total
    };
    
    // Clear the roll result after 3 seconds
    setTimeout(() => {
      rollResult.value = null;
    }, 3000);
  }
}

function rollAllInitiatives() {
  monsters.value.forEach(monster => {
    store.rollInitiative(monster.id);
  });
}

function toggleStats(monsterId: string) {
  // Ensure the object exists
  if (!showStatsForMonster.value) {
    showStatsForMonster.value = {};
  }
  
  // Toggle the stats visibility for this monster
  showStatsForMonster.value[monsterId] = !showStatsForMonster.value[monsterId];
}

function isStatsShown(monsterId: string): boolean {
  return !!showStatsForMonster.value[monsterId];
}

function editMonster(monster: Monster) {
  editingMonster.value = monster.id;
}

function saveEditedMonster(monster: Monster, updatedData: Partial<Monster>) {
  store.updateMonster(monster.id, updatedData);
  editingMonster.value = null;
}

function cancelEditingMonster(id: string) {
  editingMonster.value = null;
}

function resetForm() {
  isAddingMonster.value = false;
  editingMonster.value = null;
  tempMonsterData.value = {
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
  };
}

// Computed property for form state
const formState = computed(() => {
  return {
    editingMonster: editingMonster.value,
    initialData: tempMonsterData.value
  };
});

// Handle form events
function handleFormAdd() {
  const monsterData = tempMonsterData.value;
  
  if (monsterData.name && monsterData.hp !== undefined && monsterData.maxHp !== undefined) {
    store.addMonster(monsterData as Omit<Monster, 'id'>);
    resetForm();
  }
}

function handleFormSave(id: string) {
  store.updateMonster(id, tempMonsterData.value);
  resetForm();
}
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-center">Suivi de Combat D&D</h1>
    
    <!-- Initiative Order Component -->
    <InitiativeOrder />
    
    <!-- Players Section -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Joueurs</h2>
      </div>
      <PlayerList />
    </div>
    
    <!-- Monsters Section -->
    <div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Monstres</h2>
        <div class="flex space-x-2">
          <button 
            @click="isAddingMonster = !isAddingMonster" 
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            {{ isAddingMonster ? 'Annuler' : 'Ajouter un Monstre' }}
          </button>
          <button 
            @click="showMonsterSearch = !showMonsterSearch" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            {{ showMonsterSearch ? 'Masquer la Recherche' : 'Rechercher un Monstre' }}
          </button>
          <button 
            @click="rollAllInitiatives" 
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
          >
            ⚄ Initiative pour Tous
          </button>
        </div>
      </div>
      
      <!-- Monster Search -->
      <MonsterSearch v-if="showMonsterSearch" />
      
      <!-- Monster Form -->
      <MonsterForm 
        v-if="isAddingMonster" 
        v-model:monsterData="tempMonsterData"
        :editingMonster="editingMonster"
        :initialData="tempMonsterData"
        @add="handleFormAdd"
        @save="handleFormSave"
        @cancel="cancelEditingMonster"
      />
      
      <!-- Monster List with Drag and Drop -->
      <div v-if="monsters.length === 0" class="text-center py-8 bg-gray-100 rounded-md">
        <p class="text-gray-500">Aucun monstre ajouté. Ajoutez votre premier monstre pour commencer le suivi.</p>
      </div>
      
      <div v-else class="mb-4 p-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
        <p>Glissez les monstres pour les réorganiser. Cliquez sur le bouton pour développer/réduire les détails du monstre.</p>
      </div>
      
      <div ref="containerRef" class="space-y-3">
        <MonsterCard
          v-for="monster in monsters"
          :key="monster.id"
          :monster="monster"
          :isCollapsed="isCollapsed(monster.id)"
          :isEditing="editingMonster === monster.id"
          :rollResult="rollResult"
          :showStats="isStatsShown(monster.id)"
          @toggleCollapse="toggleCollapse"
          @toggleStats="toggleStats"
          @updateHp="updateHp"
          @edit="editMonster"
          @saveEdit="saveEditedMonster"
          @cancelEdit="cancelEditingMonster"
          @remove="removeMonster"
          @rollInitiative="rollInitiative"
        />
      </div>
    </div>
  </div>
</template>
