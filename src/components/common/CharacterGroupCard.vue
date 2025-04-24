<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCharacterStore } from '@/stores/character';
import { type Character, type CharacterType } from '@/types/character';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronDown, faChevronUp, faDiceD20, faTrashCan, faUsers } from '@fortawesome/free-solid-svg-icons';
import CharacterCard from '@/components/common/CharacterCard.vue';
import Draggable from 'vuedraggable';
import { calculateAbilityModifier } from "@/utils/abilityUtils.ts";

const props = defineProps<{
  groupId: string;
  characterType: CharacterType;
}>();

const characterStore = useCharacterStore();
const group = computed(() => characterStore.getGroupById(props.groupId));
const characters = computed(() => {
  const group = characterStore.getGroupById(props.groupId);
  if (!group) return [];
  return group.characterIds
    .map(id => characterStore.getCharacterById(id));
});
const charactersLocal = ref([...characters.value].filter((c): c is Character => !!c));
watch(characters, newVal => { charactersLocal.value = newVal.filter((c): c is Character => !!c); });
const isExpanded = computed(() => characterStore.isGroupExpanded(props.groupId));
const maxInitiativeBonus = computed(() => {
  return characters.value.length > 0
    ? Math.max(...characters.value.map(c => c?.dexterity ? calculateAbilityModifier(c.dexterity)
    : 0)) : 0;
});

// Ajout du watcher pour appliquer l'initiative du groupe aux nouveaux membres
watch(
  () => group.value?.characterIds,
  (newIds, oldIds) => {
    if (!group.value) return;
    if (!oldIds) return;
    // Détecte les nouveaux membres ajoutés
    const added = newIds?.filter(id => !oldIds.includes(id)) || [];
    if (added.length && group.value.initiative) {
      added.forEach(id => {
        characterStore.updateCharacterInitiative(id, group?.value?.initiative ?? 0);
      });
    }
  },
  { deep: true }
);

function toggleExpand() {
  characterStore.toggleExpandGroup(props.groupId);
}

function removeGroup() {
  if (window.confirm(`Confirmer la suppression du groupe « ${group.value?.name ?? ''} » ? Les personnages du groupe seront conservés.`)) {
    characterStore.removeGroup(props.groupId);
  }
}

function rollGroupInitiative() {
  // Lancer l'initiative pour le groupe (avec le bonus max)
  const bonus = maxInitiativeBonus.value;
  const roll = Math.floor(Math.random() * 20) + 1;
  const groupInitiative = roll + bonus;
  characterStore.updateGroupInitiative(props.groupId);
  // Appliquer le même résultat à tous les membres
  characters.value.forEach(character => {
    if (!character) return;
    characterStore.updateCharacterInitiative(character.id, groupInitiative);
  });
}

function updateGroupName(event: Event) {
  const input = event.target as HTMLInputElement;
  if (group.value && input.value.trim()) {
    characterStore.updateGroup(props.groupId, { name: input.value.trim() });
  }
}
</script>

<template>
  <div v-if="group" class="bg-white rounded-md shadow border border-gray-200 p-4 mb-4">
    <!-- En-tête du groupe - Toujours visible -->
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center">
        <div class="drag-handle cursor-move p-1 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" /></svg>
        </div>
        <div class="flex items-center">
          <font-awesome-icon :icon="faUsers" class="text-indigo-600 mr-2" />
          <input 
            :value="group.name" 
            @change="updateGroupName" 
            class="font-bold text-lg bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-1"
            :placeholder="'Nom du groupe'"
          />
          <div class="text-sm text-gray-500 ml-2">
            Initiative : {{ group.initiative }}
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="rollGroupInitiative"
          class="text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors duration-200 ease-in-out flex items-center justify-center w-9 h-9"
          title="Lancer l'initiative pour tous les membres du groupe"
        >
          <font-awesome-icon :icon="faDiceD20" class="text-lg" />
        </button>
        <button
          @click="removeGroup"
          class="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors duration-200 ease-in-out flex items-center justify-center w-9 h-9"
          title="Supprimer le groupe"
        >
          <font-awesome-icon :icon="faTrashCan" class="text-lg" />
        </button>

        <!-- Bouton d'expansion pour le groupe -->
        <button
          @click="toggleExpand"
          class="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out flex items-center justify-center w-9 h-9"
          :title="isExpanded ? 'Réduire' : 'Afficher les membres'"
        >
          <font-awesome-icon :icon="isExpanded ? faChevronUp : faChevronDown" class="text-lg" />
        </button>
      </div>
    </div>

    <!-- Contenu du groupe (personnages) -->
    <div v-if="isExpanded" class="mt-4 pl-4 border-l-2 border-indigo-200">
      <Draggable
        v-model="group.characterIds"
        item-key="id"
        handle=".drag-handle"
        class="space-y-3 group-container"
        ghost-class="bg-gray-100"
        animation=200
        :group="props.characterType"
        :empty-insert-threshold="40"
      >
        <template #item="{ element }">
          <CharacterCard
            :character-id="element"
            :character-type="group.type"
            :show-drag-handle="true"
            :show-initiative="false"
            :can-roll-initiative="false"
          />
        </template>
      </Draggable>
    </div>
  </div>
</template>

<style scoped>
  .group-container:empty::before {
    content: "Glissez un personnage ici";
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    background: #fafafa;
    height: 40px; /* ou ce qui convient */
    border: 2px dashed #bbb;
    border-radius: 6px;
  }
</style>