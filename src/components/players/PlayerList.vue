<script setup lang="ts">
import { ref } from 'vue';
import { useCharacterStore } from '@/stores/character';
import CharacterForm from '@/components/common/CharacterForm.vue';
import CharacterCard from '@/components/common/CharacterCard.vue';
import CharacterGroupCard from '@/components/common/CharacterGroupCard.vue';
import GroupCreationForm from '@/components/common/GroupCreationForm.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { CharacterType } from "@/types/character.ts";
import Draggable from "vuedraggable";

const characterStore = useCharacterStore();
// Utiliser les éléments ordonnés du store
const isCreatingGroup = ref(false);

const handleSubmit = (playerData: any) => {
  characterStore.addCharacter({
    ...playerData,
    type: CharacterType.PLAYER,
    conditions: [],
  });
  characterStore.cancelAddingCharacter && characterStore.cancelAddingCharacter();
};

const handleCreateGroup = (groupData: { name: string; characterIds: string[]; type: CharacterType }) => {
  characterStore.createGroup(groupData.name, groupData.type, groupData.characterIds);
  isCreatingGroup.value = false;
};

</script>

<template>
  <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2 md:gap-0">
    <h2 class="text-xl md:text-2xl font-bold">Joueurs</h2>
    <div class="flex flex-wrap justify-between md:gap-2">
      <button 
        @click="characterStore.toggleAddingCharacter(CharacterType.PLAYER)" 
        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base w-[48%] md:w-auto"
        v-if="!characterStore.isAddingCharacter || characterStore.addingType !== CharacterType.PLAYER"
      >
        <span class="md:hidden">+ Joueur</span>
        <span class="hidden md:inline">Ajouter un Joueur</span>
      </button>
      <button 
        @click="isCreatingGroup = !isCreatingGroup" 
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base flex items-center justify-center w-[48%] md:w-auto"
      >
        <font-awesome-icon :icon="faUserGroup" class="mr-1.5" />
        <span class="md:hidden">{{ isCreatingGroup ? 'Annuler' : '+ Groupe' }}</span>
        <span class="hidden md:inline">{{ isCreatingGroup ? 'Annuler Groupe' : 'Créer un Groupe' }}</span>
      </button>
    </div>
  </div>
  
  <!-- Player Form for adding new players -->
  <div v-if="characterStore.isAddingCharacter && characterStore.addingType === CharacterType.PLAYER" class="bg-white p-4 rounded-md shadow mb-4 border border-gray-200">
    <CharacterForm 
      :character-type="CharacterType.PLAYER"
      @submit="handleSubmit"
      @cancel="characterStore.cancelAddingCharacter && characterStore.cancelAddingCharacter()"
    />
  </div>
  
  <!-- Group Creation Form -->
  <GroupCreationForm 
    v-if="isCreatingGroup"
    :character-type="CharacterType.PLAYER"
    @submit="handleCreateGroup"
    @cancel="isCreatingGroup = false"
  />
  
  <!-- Player List with Drag and Drop -->
  <div v-if="characterStore.playerOrder.length === 0" class="text-center py-8 bg-gray-100 rounded-md">
    <p class="text-gray-500">Aucun joueur ajouté. Ajoutez votre premier joueur pour commencer le suivi.</p>
  </div>
  
  <div v-else class="mb-4 p-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
    <p>Glissez les joueurs pour les réorganiser. Cliquez sur le bouton pour développer/réduire les détails du joueur.</p>
    <p class="mt-1">Vous pouvez glisser-déposer un joueur dans un groupe ou entre groupes.</p>
  </div>

  <Draggable
      v-model="characterStore.playerOrder"
      item-key="id"
      handle=".drag-handle"
      class="space-y-3"
      ghost-class="bg-indigo-100"
      :group="CharacterType.PLAYER"
  >
    <template #item="{ element }">
      <CharacterGroupCard
          v-if="characterStore.getGroupById(element)"
          :group-id="element"
          :character-type="CharacterType.PLAYER"
      />
      <CharacterCard
          v-else
          :character-id="element"
          :character-type="CharacterType.PLAYER"
          :show-drag-handle="true"
          :can-roll-initiative="false"
          :show-initiative="true"
      />
    </template>
  </Draggable>
</template>
