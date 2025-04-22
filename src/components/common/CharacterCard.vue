<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCharacterStore } from '@/stores/character';
import ConditionManager from '@/components/conditions/ConditionManager.vue';
import CharacterStats from '@/components/common/CharacterStats.vue';
import CharacterForm from '@/components/common/CharacterForm.vue';
import { type CharacterType } from '@/types/character';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPen, faClone, faTrashCan, faChevronDown, faChevronUp, faDiceD20, faShieldAlt, faHeart } from '@fortawesome/free-solid-svg-icons';

const props = defineProps<{
  characterId: string;
  characterType: CharacterType;
  showDragHandle?: boolean;
  showInitiative?: boolean;
  canRollInitiative?: boolean;
}>();

const characterStore = useCharacterStore();

const character = computed(() => characterStore.getCharacterById(props.characterId));

const isEditing = computed(() => characterStore.editingCharacterId === props.characterId);
const isExpanded = computed(() => characterStore.isExpanded(props.characterId));

const hpColor = computed(() => {
  if (!character.value || character.value.hp === undefined || character.value.maxHp === undefined || character.value.maxHp === 0) return '';
  const hpPercentage = (character.value.hp / character.value.maxHp) * 100;
  if (hpPercentage > 75) return 'bg-green-500';
  if (hpPercentage > 50) return 'bg-yellow-500';
  if (hpPercentage > 25) return 'bg-orange-500';
  return 'bg-red-500';
});

const hpPercentage = computed(() => {
  if (!character.value || character.value.hp === undefined || character.value.maxHp === undefined || character.value.maxHp === 0) return 0;
  return (character.value.hp / character.value.maxHp) * 100;
});

const showInitiativeResult = ref(false);

function cancelEditing() {
  characterStore.cancelEditingCharacter();
}

function handleSubmit(characterData: any) {
  characterStore.updateCharacter(props.characterId, characterData);
}

function toggleExpand() {
  characterStore.toggleExpand(props.characterId);
}

function rollInitiative() {
  characterStore.rollInitiative(props.characterId);
  showInitiativeResult.value = true;
  setTimeout(() => (showInitiativeResult.value = false), 1200);
}

function updateHp(value: number) {
  characterStore.updateCharacterHp(props.characterId, value);
}

function removeCharacter() {
  if (window.confirm(`Confirmer la suppression du personnage « ${character.value?.name ?? ''} » ?`)) {
    characterStore.removeCharacter(props.characterId);
  }
}

function startEditing() {
  characterStore.startEditingCharacter(props.characterId);
}

function duplicateCharacter() {
  characterStore.duplicateCharacter(props.characterId);
}

</script>

<template>
  <div v-if="character" class="bg-white rounded-md shadow border border-gray-200 p-4"
       :id="`${characterType}-${characterId}`"
  >
    <!-- En-tête du personnage - Toujours visible -->
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center">
        <div v-if="showDragHandle !== false" class="drag-handle cursor-move p-1 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" /></svg>
        </div>
        <div>
          <h3 class="font-bold text-lg">{{ character.name }}</h3>
          <div v-if="showInitiative !== false" class="text-sm text-gray-500">
            Initiative: {{ character.initiative }}
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button
          v-if="!isEditing"
          @click="startEditing"
          class="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors duration-200 ease-in-out flex items-center justify-center w-9 h-9"
          title="Modifier le personnage"
        >
          <font-awesome-icon :icon="faPen" class="text-lg" />
        </button>
        <!-- Bouton Dupliquer (uniquement pour les monstres) -->
        <button
          v-if="!isEditing && characterType === 'monster'"
          @click="duplicateCharacter"
          class="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition-colors duration-200 ease-in-out flex items-center justify-center w-9 h-9"
          title="Dupliquer ce monstre"
        >
          <font-awesome-icon :icon="faClone" class="text-lg" />
        </button>
        <button
          v-if="!isEditing"
          @click="removeCharacter"
          class="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors duration-200 ease-in-out flex items-center justify-center w-9 h-9"
          title="Supprimer le personnage"
        >
          <font-awesome-icon :icon="faTrashCan" class="text-lg" />
        </button>

        <!-- Bouton d'expansion pour joueurs et monstres -->
        <button
          v-if="!isEditing"
          @click="toggleExpand"
          class="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out flex items-center justify-center w-9 h-9"
          :title="isExpanded ? 'Réduire' : 'Afficher plus'"
        >
          <font-awesome-icon :icon="isExpanded ? faChevronUp : faChevronDown" class="text-lg" />
        </button>
      </div>
    </div>

    <!-- View Mode -->
    <div v-if="!isEditing" class="flex flex-col">
      <!-- Barre de points de vie améliorée -->
      <div v-if="character && character.hp !== undefined && character.maxHp !== undefined && character.maxHp > 0" class="mb-3">
        <div class="flex justify-between items-center mb-1">
          <div class="flex items-center space-x-2">
            <!-- CA avec icône de bouclier -->
            <div v-if="character.ac" class="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
              <font-awesome-icon :icon="faShieldAlt" class="h-4 w-4 text-blue-500" />
              <span class="ml-1.5 font-semibold text-base text-gray-800">{{ character.ac }}</span>
            </div>

            <!-- Points de vie -->
            <div class="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
              <font-awesome-icon :icon="faHeart" class="h-4 w-4 text-red-500" />
              <div class="flex items-baseline ml-1.5">
                <span class="font-semibold text-base text-gray-800">{{ character.hp }}</span>
                <span class="text-gray-500 text-xs mx-0.5">/</span>
                <span class="text-gray-600 text-sm">{{ character.maxHp }}</span>
              </div>
            </div>
          </div>

          <div class="flex space-x-1">
            <button
              @click="updateHp(-1)"
              class="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              -1
            </button>
            <button
              @click="updateHp(-5)"
              class="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              -5
            </button>
            <button
              @click="updateHp(1)"
              class="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              +1
            </button>
            <button
              @click="updateHp(5)"
              class="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs sm:text-sm"
            >
              +5
            </button>
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div
            :class="[hpColor, 'h-2.5 rounded-full transition-all duration-300 flex items-center justify-end pr-1']"
            :style="{ width: `${hpPercentage}%` }"
          >
            <div v-if="hpPercentage > 15" class="h-1.5 w-1 bg-white rounded-full opacity-60"></div>
          </div>
        </div>
      </div>

      <!-- Contenu étendu -->
      <div v-if="isExpanded">
        <!-- Animation simple du lancer d'initiative -->
        <div v-if="characterType === 'monster'" class="flex items-center mb-3">
          <!-- Bouton de lancer d'initiative (standard) -->
          <button
            v-if="canRollInitiative !== false"
            @click="rollInitiative"
            class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
            :class="{ 'opacity-50 cursor-not-allowed': showInitiativeResult }"
            :disabled="showInitiativeResult"
            title="Lancer l'initiative"
          >
            <font-awesome-icon :icon="faDiceD20" class="text-lg mr-2" />
            <span>Lancer l'initiative</span>
          </button>

          <!-- Affichage du résultat du lancer sur la même ligne -->
          <div v-if="showInitiativeResult" class="ml-3">
            <div class="initiative-updated">
              <span class="font-medium mr-2">{{ character.initiative }}</span>
              <span class="text-sm text-purple-700">Nouvelle initiative</span>
            </div>
          </div>
        </div>

        <!-- Statistiques du personnage -->
        <CharacterStats
          v-if="character"
          :strength="character.strength"
          :dexterity="character.dexterity"
          :constitution="character.constitution"
          :intelligence="character.intelligence"
          :wisdom="character.wisdom"
          :charisma="character.charisma"
        />

        <!-- Gestionnaire de conditions -->
        <ConditionManager
          :conditions="character.conditions"
          :creature-type="characterType"
          :creature-id="characterId"
        />

        <!-- Notes du personnage -->
        <div v-if="character.notes" class="mt-4">
          <h4 class="font-semibold text-sm mb-1">Notes:</h4>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ character.notes }}</p>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-if="isEditing" class="flex flex-col">
      <CharacterForm
        :character="character"
        :character-type="characterType"
        :is-edit="true"
        @submit="handleSubmit"
        @cancel="cancelEditing"
      />
    </div>
  </div>
</template>

<style scoped>
.initiative-updated {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background-color: rgba(124, 58, 237, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.initiative-updated::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(124, 58, 237, 0), rgba(124, 58, 237, 0.3), rgba(124, 58, 237, 0));
  animation: shine 1.5s ease-in-out infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>