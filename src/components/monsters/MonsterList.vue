<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMonsterStore } from '@/stores/monster';
import Sortable from 'sortablejs';
import MonsterSearch from '@/components/monsters/MonsterSearch.vue';
import MonsterForm from '@/components/monsters/MonsterForm.vue';
import MonsterCard from '@/components/monsters/MonsterCard.vue';

const monsterStore = useMonsterStore();
const monsters = computed(() => monsterStore.monsters);
const containerRef = ref<HTMLElement | null>(null);
const showMonsterSearch = ref(false);
const monsterCardRefs = ref<Record<string, any>>({});

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
        monsterStore.reorderMonsters(newOrder);
      }
    });
  }
}

function rollAllInitiatives() {
  // Récupérer toutes les références aux composants MonsterCard
  const refs = monsterCardRefs.value;
  
  // Lancer l'initiative pour chaque monstre
  monsters.value.forEach(monster => {
    const ref = refs[monster.id];
    if (ref && typeof ref.rollInitiative === 'function') {
      ref.rollInitiative();
    }
  });
}
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
    <h2 class="text-xl sm:text-2xl font-bold">Monstres</h2>
    <div class="flex flex-wrap gap-2">
      <button 
        @click="monsterStore.toggleAddingMonster()" 
        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base flex-grow sm:flex-grow-0"
        v-if="!monsterStore.isAddingMonster"
      >
        <span class="sm:hidden">+ Monstre</span>
        <span class="hidden sm:inline">Ajouter un Monstre</span>
      </button>
      <button 
        @click="showMonsterSearch = !showMonsterSearch" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base flex-grow sm:flex-grow-0"
      >
        <span class="sm:hidden">{{ showMonsterSearch ? 'Masquer' : 'Rechercher' }}</span>
        <span class="hidden sm:inline">{{ showMonsterSearch ? 'Masquer la Recherche' : 'Rechercher un Monstre' }}</span>
      </button>
      <button 
        @click="rollAllInitiatives" 
        class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span class="sm:hidden inline-block align-middle">Roll</span>
        <span class="hidden sm:inline-block align-middle">Lancer toutes les initiatives</span>
      </button>
    </div>
  </div>
  
  <!-- Monster Search -->
  <MonsterSearch v-if="showMonsterSearch" />
  
  <!-- Monster Form -->
  <MonsterForm 
    v-if="monsterStore.isAddingMonster" 
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
      :monsterId="monster.id"
      :ref="el => { if (el) monsterCardRefs[monster.id] = el }"
    />
  </div>
</template>
