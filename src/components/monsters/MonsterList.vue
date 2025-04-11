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
  monsters.value.forEach(monster => {
    monsterStore.rollInitiative(monster.id);
  });
}
</script>

<template>
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-bold">Monstres</h2>
    <div class="flex space-x-2">
      <button 
        @click="monsterStore.toggleAddingMonster()" 
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
      >
        {{ monsterStore.isAddingMonster ? 'Annuler' : 'Ajouter un Monstre' }}
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
    />
  </div>
</template>
