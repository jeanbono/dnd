<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useCharacterStore} from '@/stores/character';
import Sortable from 'sortablejs';
import CharacterCard from '@/components/common/CharacterCard.vue';
import CharacterForm from '@/components/common/CharacterForm.vue';
import {type Character, CharacterType} from "@/types/character.ts";

const characterStore = useCharacterStore();
const containerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  setupSortable();
});

const handleSubmit = (playerData: Omit<Character, 'id'>) => {
  characterStore.addCharacter({
    ...playerData,
    type: CharacterType.PLAYER,
    // S'assurer que toutes les propriétés requises existent
    hp: playerData.hp ?? 1,
    maxHp: playerData.maxHp ?? 1,
    strength: playerData.strength ?? 10,
    dexterity: playerData.dexterity ?? 10,
    constitution: playerData.constitution ?? 10,
    intelligence: playerData.intelligence ?? 10,
    wisdom: playerData.wisdom ?? 10,
    charisma: playerData.charisma ?? 10,
    initiative: playerData.initiative ?? 0,
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
        const newOrder = [...characterStore.characters.filter(c => c.type === CharacterType.PLAYER)];
        const movedItem = newOrder.splice(evt.oldIndex!, 1)[0];
        newOrder.splice(evt.newIndex!, 0, movedItem);
        characterStore.reorderCharacters && characterStore.reorderCharacters(newOrder, CharacterType.PLAYER);
      }
    });
  }
}
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
    <h2 class="text-xl sm:text-2xl font-bold">Joueurs</h2>
    <div class="flex flex-wrap gap-2">
      <button 
        @click="characterStore.startAddingCharacter(CharacterType.PLAYER)" 
        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-base flex-grow sm:flex-grow-0"
        v-if="!characterStore.isAddingCharacter || characterStore.addingType !== CharacterType.PLAYER"
      >
        <span class="sm:hidden">+ Joueur</span>
        <span class="hidden sm:inline">Ajouter un Joueur</span>
      </button>
    </div>
  </div>
  
  <!-- Player Form for adding new players only -->
  <div v-if="characterStore.isAddingCharacter && characterStore.addingType === CharacterType.PLAYER" class="bg-white p-4 rounded-md shadow mb-4 border border-gray-200">
    <CharacterForm 
      :character-type="CharacterType.PLAYER"
      @submit="handleSubmit"
      @cancel="characterStore.cancelAddingCharacter"
    />
  </div>
  
  <!-- Player List with Drag and Drop -->
  <div v-if="characterStore.characters.filter(c => c.type === CharacterType.PLAYER).length === 0" class="text-center py-8 bg-gray-100 rounded-md">
    <p class="text-gray-500">Aucun joueur ajouté. Ajoutez votre premier joueur pour commencer le suivi.</p>
  </div>
  
  <div v-else class="mb-4 p-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
    <p>Glissez les joueurs pour les réorganiser. Cliquez sur le bouton pour développer/réduire les détails du joueur.</p>
  </div>
  
  <div ref="containerRef" class="space-y-3">
    <CharacterCard 
      v-for="player in characterStore.characters.filter(c => c.type === CharacterType.PLAYER)" 
      :key="player.id" 
      :character-id="player.id"
      :character-type="CharacterType.PLAYER"
    />
  </div>
</template>
