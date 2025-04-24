<script setup lang="ts">
import { ref } from 'vue';
import { useCharacterStore } from '@/stores/character';
import { CharacterType } from '@/types/character';
import MonsterSearch from '@/components/monsters/MonsterSearch.vue';
import CharacterForm from '@/components/common/CharacterForm.vue';
import CharacterCard from '@/components/common/CharacterCard.vue';
import CharacterGroupCard from '@/components/common/CharacterGroupCard.vue';
import GroupCreationForm from '@/components/common/GroupCreationForm.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import Draggable from 'vuedraggable';

const characterStore = useCharacterStore();
const showMonsterSearch = ref(false);
const isCreatingGroup = ref(false);

const handleSubmit = (monsterData: any) => {
  characterStore.addCharacter({
    ...monsterData,
    type: CharacterType.MONSTER,
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
    <h2 class="text-xl md:text-2xl font-bold">Monstres</h2>
    <div class="flex flex-row gap-1 ml-0 md:ml-4 shrink-0 max-w-full overflow-x-auto">
      <button 
        @click="characterStore.toggleAddingCharacter(CharacterType.MONSTER)" 
        class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs md:text-sm whitespace-nowrap min-w-[80px]"
        v-if="!characterStore.isAddingCharacter || characterStore.addingType !== CharacterType.MONSTER"
      >
        <span class="md:hidden">+ Monstre</span>
        <span class="hidden md:inline">Ajouter un Monstre</span>
      </button>
      <button 
        @click="showMonsterSearch = !showMonsterSearch" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs md:text-sm whitespace-nowrap min-w-[80px]"
      >
        <span class="md:hidden">{{ showMonsterSearch ? 'Masquer' : 'Rechercher' }}</span>
        <span class="hidden md:inline">{{ showMonsterSearch ? 'Masquer la Recherche' : 'Rechercher un Monstre' }}</span>
      </button>
      <button 
        @click="isCreatingGroup = !isCreatingGroup" 
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs md:text-sm flex items-center justify-center whitespace-nowrap min-w-[80px]"
      >
        <font-awesome-icon :icon="faUserGroup" class="mr-1" />
        <span class="md:hidden">{{ isCreatingGroup ? 'Annuler' : '+ Groupe' }}</span>
        <span class="hidden md:inline">{{ isCreatingGroup ? 'Annuler' : 'Créer un Groupe' }}</span>
      </button>
    </div>
  </div>
  
  <!-- Monster Search -->
  <MonsterSearch v-if="showMonsterSearch" />
  
  <!-- Monster Form for adding new monsters -->
  <div v-if="characterStore.isAddingCharacter && characterStore.addingType === CharacterType.MONSTER" class="bg-white p-4 rounded-md shadow mb-4 border border-gray-200">
    <CharacterForm 
      :character-type="CharacterType.MONSTER"
      @submit="handleSubmit"
      @cancel="characterStore.cancelAddingCharacter && characterStore.cancelAddingCharacter()"
    />
  </div>
  
  <!-- Group Creation Form -->
  <GroupCreationForm 
    v-if="isCreatingGroup"
    :character-type="CharacterType.MONSTER"
    @submit="handleCreateGroup"
    @cancel="isCreatingGroup = false"
  />
  
  <!-- Monster List with Drag and Drop -->
  <div v-if="characterStore.monsterOrder.length === 0" class="text-center py-8 bg-gray-100 rounded-md">
    <p class="text-gray-500">Aucun monstre ajouté. Ajoutez votre premier monstre pour commencer le suivi.</p>
  </div>
  
  <div v-else class="mb-4 p-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
    <p>Glissez les monstres pour les réorganiser. Cliquez sur le bouton pour développer/réduire les détails du monstre.</p>
    <p class="mt-1">Vous pouvez glisser-déposer un monstre dans un groupe ou entre groupes.</p>
  </div>
  
  <Draggable
    v-model="characterStore.monsterOrder"
    item-key="id"
    handle=".drag-handle"
    class="space-y-3"
    ghost-class="bg-indigo-100"
    animation=200
    :group="CharacterType.MONSTER"
  >
    <template #item="{ element }">
      <CharacterGroupCard
        v-if="characterStore.getGroupById(element)"
        :group-id="element"
        :character-type="CharacterType.MONSTER"
      />
      <CharacterCard
        v-else
        :character-id="element"
        :character-type="CharacterType.MONSTER"
        :show-drag-handle="true"
        :can-roll-initiative="true"
        :show-initiative="true"
      />
    </template>
  </Draggable>
</template>
