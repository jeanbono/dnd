<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {type Monster, useMonsterStore} from '../stores/monster';
import Sortable from 'sortablejs';
import MonsterSearch from './MonsterSearch.vue';
import InitiativeOrder from './InitiativeOrder.vue';
import PlayerList from './PlayerList.vue';

const store = useMonsterStore();
const monsters = computed(() => store.monsters);
const containerRef = ref<HTMLElement | null>(null);
const rollResult = ref<{ monsterId: string, roll: number, modifier: number, total: number } | null>(null);
const collapsedMonsters = ref<Set<string>>(new Set());
const editingMonster = ref<string | null>(null);
const tempMonsterData = ref<Partial<Monster>>({});

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

const newMonster = ref<Omit<Monster, 'id'>>({
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

const isAddingMonster = ref(false);
const showStatsFor = ref<string | null>(null);

function toggleCollapse(monsterId: string) {
  if (collapsedMonsters.value.has(monsterId)) {
    collapsedMonsters.value.delete(monsterId);
  } else {
    collapsedMonsters.value.add(monsterId);
    // If stats are shown, hide them when collapsing
    if (showStatsFor.value === monsterId) {
      showStatsFor.value = null;
    }
  }
}

function isCollapsed(monsterId: string): boolean {
  return collapsedMonsters.value.has(monsterId);
}

function addMonster() {
  if (newMonster.value.name.trim()) {
    store.addMonster({
      ...newMonster.value,
      initiative: Number(newMonster.value.initiative),
      hp: Number(newMonster.value.hp),
      maxHp: Number(newMonster.value.maxHp),
      ac: Number(newMonster.value.ac),
      strength: Number(newMonster.value.strength),
      dexterity: Number(newMonster.value.dexterity),
      constitution: Number(newMonster.value.constitution),
      intelligence: Number(newMonster.value.intelligence),
      wisdom: Number(newMonster.value.wisdom),
      charisma: Number(newMonster.value.charisma)
    });
    
    resetForm();
  }
}

function updateHp(monster: Monster, change: number) {
  const newHp = Math.max(0, Math.min(monster.maxHp, monster.hp + change));
  store.updateMonster(monster.id, { hp: newHp });
}

function removeMonster(id: string) {
  if (confirm('Are you sure you want to remove this monster?')) {
    store.removeMonster(id);
    // Clean up references to this monster
    collapsedMonsters.value.delete(id);
    if (showStatsFor.value === id) {
      showStatsFor.value = null;
    }
  }
}

function rollInitiative(monster: Monster) {
  // Use the store's rollInitiative method
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
  if (showStatsFor.value === monsterId) {
    showStatsFor.value = null;
  } else {
    showStatsFor.value = monsterId;
  }
}

function editMonster(monster: Monster) {
  editingMonster.value = monster.id;
  tempMonsterData.value = { ...monster };
}

function saveEditedMonster(id: string) {
  if (editingMonster.value === id) {
    store.updateMonster(id, tempMonsterData.value);
    editingMonster.value = null;
  }
}

function cancelEditingMonster() {
  editingMonster.value = null;
  tempMonsterData.value = {};
}

function resetForm() {
  editingMonster.value = null;
  isAddingMonster.value = false;
  newMonster.value = {
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
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-center">Suivi de Combat D&D</h1>
    
    <!-- Initiative Order Component -->
    <InitiativeOrder />
    
    <!-- Player List Component -->
    <PlayerList />
    
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-xl font-semibold">Liste des Monstres</h2>
      <div class="flex gap-2">
        <button 
          @click="rollAllInitiatives" 
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer"
          v-if="monsters.length > 0"
        >
          Roll toutes les Initiatives
        </button>
        <button 
          @click="isAddingMonster ? resetForm() : isAddingMonster = true" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md cursor-pointer"
        >
          {{ isAddingMonster ? 'Annuler' : 'Ajouter un Monstre' }}
        </button>
      </div>
    </div>
    
    <!-- Monster Search -->
    <MonsterSearch />
    
    <!-- Add Custom Monster Form -->
    <div v-if="isAddingMonster" class="bg-gray-100 p-4 rounded-md mb-6">
      <h3 class="font-semibold mb-3">{{ editingMonster ? 'Modifier le Monstre' : 'Ajouter un Monstre' }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nom</label>
          <input v-model="newMonster.name" class="w-full p-2 border rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Initiative</label>
          <input v-model.number="newMonster.initiative" type="number" class="w-full p-2 border rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">PV</label>
          <input v-model.number="newMonster.hp" type="number" class="w-full p-2 border rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">PV Max</label>
          <input v-model.number="newMonster.maxHp" type="number" class="w-full p-2 border rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">CA</label>
          <input v-model.number="newMonster.ac" type="number" class="w-full p-2 border rounded-md" />
        </div>
      </div>
      
      <h4 class="font-medium mt-4 mb-2">Caractéristiques</h4>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">FOR</label>
          <input v-model.number="newMonster.strength" type="number" class="w-full p-2 border rounded-md" />
          <span class="text-xs text-gray-500">
            {{ store.getAbilityScoreDisplay(newMonster.strength) }}
          </span>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">DEX</label>
          <input v-model.number="newMonster.dexterity" type="number" class="w-full p-2 border rounded-md" />
          <span class="text-xs text-gray-500">
            {{ store.getAbilityScoreDisplay(newMonster.dexterity) }}
          </span>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">CON</label>
          <input v-model.number="newMonster.constitution" type="number" class="w-full p-2 border rounded-md" />
          <span class="text-xs text-gray-500">
            {{ store.getAbilityScoreDisplay(newMonster.constitution) }}
          </span>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">INT</label>
          <input v-model.number="newMonster.intelligence" type="number" class="w-full p-2 border rounded-md" />
          <span class="text-xs text-gray-500">
            {{ store.getAbilityScoreDisplay(newMonster.intelligence) }}
          </span>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">SAG</label>
          <input v-model.number="newMonster.wisdom" type="number" class="w-full p-2 border rounded-md" />
          <span class="text-xs text-gray-500">
            {{ store.getAbilityScoreDisplay(newMonster.wisdom) }}
          </span>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">CHA</label>
          <input v-model.number="newMonster.charisma" type="number" class="w-full p-2 border rounded-md" />
          <span class="text-xs text-gray-500">
            {{ store.getAbilityScoreDisplay(newMonster.charisma) }}
          </span>
        </div>
      </div>
      
      <div class="mt-4">
        <label class="block text-sm font-medium mb-1">Notes</label>
        <textarea v-model="newMonster.notes" class="w-full p-2 border rounded-md"></textarea>
      </div>
      
      <button 
        @click="editingMonster ? saveEditedMonster(editingMonster) : addMonster()" 
        class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer"
      >
        {{ editingMonster ? 'Enregistrer les Modifications' : 'Ajouter le Monstre' }}
      </button>
    </div>
    
    <!-- Monster List with Drag and Drop -->
    <div v-if="monsters.length === 0" class="text-center py-8 bg-gray-100 rounded-md">
      <p class="text-gray-500">Aucun monstre ajouté. Ajoutez votre premier monstre pour commencer le suivi.</p>
    </div>
    
    <div v-else class="mb-4 p-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
      <p>Glissez les monstres pour les réorganiser. Cliquez sur le bouton pour développer/réduire les détails du monstre.</p>
    </div>
    
    <div ref="containerRef" class="space-y-3">
      <div 
        v-for="monster in monsters" 
        :key="monster.id"
        class="bg-white rounded-md shadow border border-gray-200 flex flex-col"
        :class="{ 'ring-2 ring-purple-500': rollResult && rollResult.monsterId === monster.id }"
        :id="`monster-${monster.id}`"
      >
        <!-- Monster Header - Always Visible -->
        <div class="flex justify-between items-center p-4">
          <div class="flex items-center">
            <div class="drag-handle cursor-move p-1 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
              </svg>
            </div>
            <div class="flex items-center">
              <div v-if="editingMonster === monster.id">
                <input v-model="tempMonsterData.name" class="font-bold text-lg border rounded-md p-1 mb-1" />
              </div>
              <h3 v-else class="font-bold text-lg">{{ monster.name }}</h3>
              <div class="ml-3 text-sm text-gray-500">
                <span class="mr-2">Init: {{ monster.initiative }}</span>
                <span class="mr-2">CA: {{ monster.ac }}</span>
                <span>PV: {{ monster.hp }}/{{ monster.maxHp }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              @click="toggleCollapse(monster.id)" 
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm cursor-pointer"
              title="Développer/Réduire"
            >
              {{ isCollapsed(monster.id) ? 'Développer' : 'Réduire' }}
            </button>
            <button 
              v-if="!isCollapsed(monster.id)"
              @click="toggleStats(monster.id)" 
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm cursor-pointer"
              title="Afficher les Caractéristiques"
            >
              Caractéristiques
            </button>
            <button 
              @click="rollInitiative(monster)" 
              class="bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded text-sm cursor-pointer"
              title="Roll l'Initiative"
            >
              Roll
            </button>
            <button 
              @click="editMonster(monster)" 
              class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-sm cursor-pointer"
              title="Modifier le Monstre"
              v-if="editingMonster !== monster.id"
            >
              Modifier
            </button>
            <button 
              @click="removeMonster(monster.id)" 
              class="text-red-500 hover:text-red-700 cursor-pointer"
              title="Supprimer le Monstre"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Monster Details - Only Visible When Not Collapsed -->
        <div v-if="!isCollapsed(monster.id)" class="px-4 pb-4">
          <!-- Roll Result Animation -->
          <div 
            v-if="rollResult && rollResult.monsterId === monster.id" 
            class="bg-purple-100 p-2 rounded-md mb-2 text-sm animate-pulse"
          >
            <span class="font-medium">Résultat du Lancer d'Initiative:</span> 
            {{ rollResult.roll }} (d20) {{ rollResult.modifier >= 0 ? '+' : '' }}{{ rollResult.modifier }} (DEX) = {{ rollResult.total }}
          </div>
          
          <!-- Stats Table -->
          <div v-if="showStatsFor === monster.id" class="bg-gray-50 p-2 rounded-md mb-3 text-sm">
            <div v-if="editingMonster === monster.id" class="grid grid-cols-6 gap-1 text-center">
              <div class="font-medium">FOR</div>
              <div class="font-medium">DEX</div>
              <div class="font-medium">CON</div>
              <div class="font-medium">INT</div>
              <div class="font-medium">SAG</div>
              <div class="font-medium">CHA</div>
              
              <input v-model.number="tempMonsterData.strength" type="number" class="w-full p-1 border rounded-md text-center" />
              <input v-model.number="tempMonsterData.dexterity" type="number" class="w-full p-1 border rounded-md text-center" />
              <input v-model.number="tempMonsterData.constitution" type="number" class="w-full p-1 border rounded-md text-center" />
              <input v-model.number="tempMonsterData.intelligence" type="number" class="w-full p-1 border rounded-md text-center" />
              <input v-model.number="tempMonsterData.wisdom" type="number" class="w-full p-1 border rounded-md text-center" />
              <input v-model.number="tempMonsterData.charisma" type="number" class="w-full p-1 border rounded-md text-center" />
            </div>
            <div v-else class="grid grid-cols-6 gap-1 text-center">
              <div class="font-medium">FOR</div>
              <div class="font-medium">DEX</div>
              <div class="font-medium">CON</div>
              <div class="font-medium">INT</div>
              <div class="font-medium">SAG</div>
              <div class="font-medium">CHA</div>
              
              <div>{{ store.getAbilityScoreDisplay(monster.strength) }}</div>
              <div>{{ store.getAbilityScoreDisplay(monster.dexterity) }}</div>
              <div>{{ store.getAbilityScoreDisplay(monster.constitution) }}</div>
              <div>{{ store.getAbilityScoreDisplay(monster.intelligence) }}</div>
              <div>{{ store.getAbilityScoreDisplay(monster.wisdom) }}</div>
              <div>{{ store.getAbilityScoreDisplay(monster.charisma) }}</div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div>
              <span class="text-sm text-gray-500">Initiative</span>
              <input v-model.number="tempMonsterData.initiative" type="number" class="w-full p-2 border rounded-md" v-if="editingMonster === monster.id" />
              <p class="font-medium" v-else>{{ monster.initiative }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">CA</span>
              <input v-model.number="tempMonsterData.ac" type="number" class="w-full p-2 border rounded-md" v-if="editingMonster === monster.id" />
              <p class="font-medium" v-else>{{ monster.ac }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">PV</span>
              <div class="flex items-center">
                <button 
                  @click="updateHp(monster, -1)" 
                  class="bg-red-100 hover:bg-red-200 text-red-700 w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                  v-if="!editingMonster || editingMonster !== monster.id"
                >
                  -
                </button>
                <div v-if="editingMonster === monster.id" class="flex items-center">
                  <input v-model.number="tempMonsterData.hp" type="number" class="w-16 p-2 border rounded-md mr-2" />
                  <span class="mx-1">/</span>
                  <input v-model.number="tempMonsterData.maxHp" type="number" class="w-16 p-2 border rounded-md ml-2" />
                </div>
                <span class="mx-2 font-medium" v-else>{{ monster.hp }} / {{ monster.maxHp }}</span>
                <button 
                  @click="updateHp(monster, 1)" 
                  class="bg-green-100 hover:bg-green-200 text-green-700 w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                  v-if="!editingMonster || editingMonster !== monster.id"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="monster.notes || editingMonster === monster.id" class="mt-2">
            <span class="text-sm text-gray-500">Notes</span>
            <textarea 
              v-if="editingMonster === monster.id" 
              v-model="tempMonsterData.notes" 
              class="w-full p-2 border rounded-md min-h-[100px] resize-vertical"
              rows="5"
            ></textarea>
            <div class="text-sm mt-1 whitespace-pre-line" v-else>{{ monster.notes }}</div>
          </div>
          <div class="flex gap-2 mt-2" v-if="editingMonster === monster.id">
            <button 
              @click="saveEditedMonster(monster.id)" 
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer"
            >
              Enregistrer les Modifications
            </button>
            <button 
              @click="cancelEditingMonster()" 
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
