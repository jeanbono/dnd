<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useCharacterStore} from '@/stores/character';
import Sortable from 'sortablejs';
import MonsterSearch from '@/components/monsters/MonsterSearch.vue';
import CharacterForm from '@/components/common/CharacterForm.vue';
import CharacterCard from '@/components/common/CharacterCard.vue';
import {CharacterType} from "@/types/character.ts";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faDiceD20 } from '@fortawesome/free-solid-svg-icons';

const characterStore = useCharacterStore();
const monsters = computed(() => characterStore.characters.filter(c => c.type === CharacterType.MONSTER));
const containerRef = ref<HTMLElement | null>(null);
const showMonsterSearch = ref(false);

onMounted(() => {
  setupSortable();
});

const handleSubmit = (monsterData: any) => {
  characterStore.addCharacter({
    ...monsterData,
    type: CharacterType.MONSTER,
    conditions: [],
  });
  characterStore.cancelAddingCharacter && characterStore.cancelAddingCharacter();
};

function setupSortable() {
  if (containerRef.value) {
    Sortable.create(containerRef.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'bg-gray-100',
      onEnd(evt: Sortable.SortableEvent) {
        const newOrder = [...monsters.value];
        const movedItem = newOrder.splice(evt.oldIndex!, 1)[0];
        newOrder.splice(evt.newIndex!, 0, movedItem);
        characterStore.reorderCharacters && characterStore.reorderCharacters(newOrder, CharacterType.MONSTER);
      }
    });
  }
}
</script>

<template>
  <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2 md:gap-0">
    <h2 class="text-xl md:text-2xl font-bold">Monstres</h2>
    <div class="flex flex-wrap justify-between md:gap-2">
      <button 
        @click="characterStore.toggleAddingCharacter(CharacterType.MONSTER)" 
        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base w-[32%] md:w-auto"
        v-if="!characterStore.isAddingCharacter || characterStore.addingType !== CharacterType.MONSTER"
      >
        <span class="md:hidden">+ Monstre</span>
        <span class="hidden md:inline">Ajouter un Monstre</span>
      </button>
      <button 
        @click="showMonsterSearch = !showMonsterSearch" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base w-[32%] md:w-auto"
      >
        <span class="md:hidden">{{ showMonsterSearch ? 'Masquer' : 'Rechercher' }}</span>
        <span class="hidden md:inline">{{ showMonsterSearch ? 'Masquer la Recherche' : 'Rechercher un Monstre' }}</span>
      </button>
      <button 
        @click="characterStore.rollAllInitiatives(CharacterType.MONSTER)" 
        class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base flex items-center justify-center w-[32%] md:w-auto"
        title="Lancer l'initiative pour tous les monstres"
      >
        <font-awesome-icon :icon="faDiceD20" class="mr-1.5" />
        <span class="md:hidden inline-block align-middle">Roll</span>
        <span class="hidden md:inline-block align-middle">Roll Initiatives</span>
      </button>
    </div>
  </div>
  
  <!-- Monster Search -->
  <MonsterSearch v-if="showMonsterSearch" />
  
  <!-- Player Form for adding new players only -->
  <div v-if="characterStore.isAddingCharacter && characterStore.addingType === CharacterType.MONSTER" class="bg-white p-4 rounded-md shadow mb-4 border border-gray-200">
    <CharacterForm 
      :character-type="CharacterType.MONSTER"
      @submit="handleSubmit"
      @cancel="characterStore.cancelAddingCharacter && characterStore.cancelAddingCharacter()"
    />
  </div>
  
  <!-- Monster List with Drag and Drop -->
  <div v-if="monsters.length === 0" class="text-center py-8 bg-gray-100 rounded-md">
    <p class="text-gray-500">Aucun monstre ajouté. Ajoutez votre premier monstre pour commencer le suivi.</p>
  </div>
  
  <div v-else class="mb-4 p-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
    <p>Glissez les monstres pour les réorganiser. Cliquez sur le bouton pour développer/réduire les détails du monstre.</p>
  </div>
  
  <div ref="containerRef" class="space-y-3">
    <CharacterCard
      v-for="monster in monsters"
      :key="monster.id"
      :character-id="monster.id"
      :character-type="CharacterType.MONSTER"
    />
  </div>
</template>
