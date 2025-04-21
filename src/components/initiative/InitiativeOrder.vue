<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useTurnStore } from '@/stores/turn';
import { useCharacterStore } from '@/stores/character';
import { useDialogStore } from '@/stores/dialog';
import { CharacterType } from '@/types/character';
import NewCombatDialog from '@/components/initiative/NewCombatDialog.vue';
import InitiativeCharacterCard from './InitiativeCharacterCard.vue';
import { Condition, getConditionEffects } from '@/utils/conditionUtils';
import Sortable from "sortablejs";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faDiceD20 } from '@fortawesome/free-solid-svg-icons';

// Stores
const turnStore = useTurnStore();
const characterStore = useCharacterStore();
const dialogStore = useDialogStore();

// Références pour les conteneurs drag & drop
const initiativeListRef = ref<HTMLElement | null>(null);
const waitingListRef = ref<HTMLElement | null>(null);

const isRollingInitiative = ref(false);

// Function to scroll to a monster in the monster list
function scrollToCharacter(characterId: string, characterType: CharacterType) {
  // Cherche d'abord dans la MonsterList ou PlayerList
  const targetType = characterType || '';
  let cardSelector = '';
  if (targetType === CharacterType.MONSTER) {
    cardSelector = `#monster-${characterId}`;
  } else if (targetType === CharacterType.PLAYER) {
    cardSelector = `#player-${characterId}`;
  } else {
    // fallback: tente les deux
    cardSelector = `#monster-${characterId}, #player-${characterId}`;
  }
  const card = document.querySelector(cardSelector) as HTMLElement;
  if (card) {
    const yOffset = -100;
    const y = card.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
    return;
  }
}

// Function to advance to the next turn
function nextTurn() {
  turnStore.nextTurn();
  characterStore.decrementConditionDurations();
}

// Récupérer le modificateur de DEX pour le tri
function getDexModifier(character: any): number {
  if (!character || typeof character.dexterity === 'undefined') {
    return 0;
  }
  return Math.floor((character.dexterity - 10) / 2);
}

// Calculer l'ordre d'initiative
const initiativeOrder = computed(() => {
  // Tous les personnages actifs (filtre custom si besoin)
  return characterStore.characters.filter(c => !turnStore.isWaiting(c.id, c.type))
    .sort((a, b) => {
      if (a.initiative !== b.initiative) return b.initiative - a.initiative;
      return b.dexterity - a.dexterity;
    });
});

// Récupérer les personnages en attente
const waitingCharacters = computed(() => {
  return characterStore.characters.filter(c => turnStore.isWaiting(c.id, c.type))
    .sort((a, b) => {
      if (a.initiative !== b.initiative) return b.initiative - a.initiative;
      return b.dexterity - a.dexterity;
    });
});

// S'assurer que le drag & drop est configuré après le rendu du composant
onMounted(() => {
  setupDragAndDrop();
});

// Reconfigurer le drag & drop quand la liste d'initiative ou la liste d'attente change
watch([() => initiativeOrder.value, () => waitingCharacters.value], () => {
  nextTick(() => {
    setupDragAndDrop();
  });
});

// Configuration du drag & drop avec Sortable.js
function setupDragAndDrop() {
  // Détruire les instances précédentes si elles existent
  if (initiativeListRef.value) {
    // Utiliser une approche sécurisée pour accéder à _sortable
    const element = initiativeListRef.value as any;
    if (element._sortable) {
      element._sortable.destroy();
      element._sortable = null;
    }
  }

  if (waitingListRef.value) {
    // Utiliser une approche sécurisée pour accéder à _sortable
    const element = waitingListRef.value as any;
    if (element._sortable) {
      element._sortable.destroy();
      element._sortable = null;
    }
  }

  // Initialiser la liste d'initiative - uniquement pour le drag out
  if (initiativeListRef.value) {
    // Stocker l'instance pour pouvoir la détruire plus tard
    (initiativeListRef.value as any)._sortable = Sortable.create(initiativeListRef.value, {
      group: {
        name: "characters",
        pull: 'clone', // Utiliser un clone pour le drag au lieu de l'élément original
        put: false // Ne pas permettre de déposer directement dans cette liste
      },
      animation: 0,
      sort: false, // Désactiver le tri au sein de la liste
      onStart: function () {
        // Mettre en surbrillance la zone d'attente quand on commence à glisser
        if (waitingListRef.value) {
          waitingListRef.value.classList.add('highlight-dropzone');
        }
      },
      onEnd: function (evt: any) {
        // Retirer la surbrillance
        if (waitingListRef.value) {
          waitingListRef.value.classList.remove('highlight-dropzone');
        }

        // Vérifier si l'élément a été déposé sur la zone d'attente
        const waitingRect = waitingListRef.value?.getBoundingClientRect();
        if (waitingRect && evt.originalEvent instanceof MouseEvent) {
          const x = evt.originalEvent.clientX;
          const y = evt.originalEvent.clientY;

          if (x >= waitingRect.left && x <= waitingRect.right &&
              y >= waitingRect.top && y <= waitingRect.bottom) {
            // L'élément a été déposé sur la zone d'attente
            const id = evt.item.getAttribute('data-id');
            const type = evt.item.getAttribute('data-type');
            if (id && type) {
              turnStore.addToWaiting(id, type as CharacterType);
            }
          }
        }
      }
    });
  }

  // Initialiser la liste d'attente - uniquement pour le drag out
  if (waitingListRef.value) {
    // Stocker l'instance pour pouvoir la détruire plus tard
    (waitingListRef.value as any)._sortable = Sortable.create(waitingListRef.value, {
      group: {
        name: "characters",
        pull: 'clone', // Utiliser un clone pour le drag au lieu de l'élément original
        put: false // Ne pas permettre de déposer directement dans cette liste
      },
      animation: 0,
      sort: false, // Désactiver le tri au sein de la liste
      onStart: function () {
        // Mettre en surbrillance la liste d'initiative quand on commence à glisser
        if (initiativeListRef.value) {
          initiativeListRef.value.classList.add('highlight-dropzone');
        }
      },
      onEnd: function (evt: any) {
        // Retirer la surbrillance
        if (initiativeListRef.value) {
          initiativeListRef.value.classList.remove('highlight-dropzone');
        }

        // Vérifier si l'élément a été déposé sur la liste d'initiative
        const initiativeRect = initiativeListRef.value?.getBoundingClientRect();
        if (initiativeRect && evt.originalEvent instanceof MouseEvent) {
          const x = evt.originalEvent.clientX;
          const y = evt.originalEvent.clientY;

          if (x >= initiativeRect.left && x <= initiativeRect.right &&
              y >= initiativeRect.top && y <= initiativeRect.bottom) {
            // L'élément a été déposé sur la liste d'initiative
            const id = evt.item.getAttribute('data-id');
            const type = evt.item.getAttribute('data-type');
            if (id && type) {
              turnStore.removeFromWaiting(id, type as CharacterType);
            }
          }
        }
      }
    });
  }
}

// Fonction pour déterminer si une créature a un désavantage aux jets d'attaque
function hasDisadvantageOnAttacks(character: any): boolean {
  // Vérifier si le personnage a des conditions
  if (!character || !character.conditions) return false;
  
  // Vérifier s'il y a une condition d'épuisement de niveau 3 ou plus
  const exhaustionCondition = character.conditions.find((c: any) => 
    c.condition.id === 'exhaustion' && c.level && c.level >= 3
  );
  
  if (exhaustionCondition) {
    return true;
  }
  
  // Vérifier les autres conditions qui donnent un désavantage aux jets d'attaque
  return character.conditions.some((condition: any) => {
    const conditionId = condition.condition.id;
    return ['blinded', 'poisoned', 'restrained'].includes(conditionId);
  });
}

// Fonction pour déterminer si les attaques contre une créature ont un avantage
function hasAdvantageAgainstAttacks(character: any): boolean {
  // Vérifier si le personnage a des conditions
  if (!character || !character.conditions) return false;
  
  // Vérifier les conditions qui donnent un avantage aux attaques contre la créature
  return character.conditions.some((condition: any) => {
    const conditionId = condition.condition.id;
    return ['blinded', 'paralyzed', 'prone', 'restrained', 'stunned', 'unconscious'].includes(conditionId);
  });
}

// Fonction pour ouvrir la boîte de dialogue de nouveau combat
function startNewCombat() {
  dialogStore.openNewCombatDialog();
}

// Fonction pour obtenir les détails d'une condition (remplace la fonction dans ConditionTooltip)
function getConditionDetails(conditionWithLevel: any): { title: string; effects?: string[] } {
  const conditionId = conditionWithLevel.condition.id;
  let title = '';
  
  // Trouver le titre de la condition
  Object.values(Condition).forEach(c => {
    if (c.id === conditionId) {
      title = c.label;
    }
  });
  
  // Ajouter le niveau pour l'épuisement
  if (conditionId === 'exhaustion' && conditionWithLevel.level) {
    title = `${title} (niveau ${conditionWithLevel.level})`;
  }
  
  // Obtenir les effets depuis le référentiel de conditions
  const effects = getConditionEffects(conditionWithLevel);
  
  return { title, effects };
}

// Fonction pour lancer l'initiative de tous les monstres
function rollAllMonsterInitiatives() {
  isRollingInitiative.value = true;
  characterStore.rollAllInitiatives(CharacterType.MONSTER);
  
  // Mettre en surbrillance la liste d'initiative
  const initiativeList = initiativeListRef.value;
  if (initiativeList) {
    initiativeList.classList.add('highlight-rolled');
    setTimeout(() => {
      initiativeList.classList.remove('highlight-rolled');
      isRollingInitiative.value = false;
    }, 1000);
  }
}
</script>

<template>
  <div class="mb-6">
    <!-- Affichage épique du tour -->
    <div class="relative mb-4 sm:mb-6 flex justify-center">
      <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 opacity-10 rounded-xl"></div>
      <div class="relative py-3 sm:py-4 px-4 sm:px-6 flex flex-col items-center">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-purple-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-3xl sm:text-4xl font-bold text-purple-700">
            Tour {{ turnStore.currentTurn }}
          </span>
        </div>
      </div>
    </div>

    <!-- Header avec boutons de navigation du tour -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">      
      <!-- Boutons de navigation du tour avec leurs icônes originales -->
      <div class="flex items-center gap-2 sm:space-x-3 w-full sm:w-auto sm:mx-auto">
        <button 
          @click="nextTurn()" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm flex items-center justify-center w-1/2 sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span class="sm:hidden">Tour +</span>
          <span class="hidden sm:inline">Tour suivant</span>
        </button>
        <button 
          @click="startNewCombat" 
          class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm flex items-center justify-center w-1/2 sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Nouveau combat</span>
        </button>
      </div>
    </div>
    
    <div>
      <div v-if="initiativeOrder.length === 0 && waitingCharacters.length === 0" class="text-center py-6 bg-gray-100 rounded-md">
        <p class="text-gray-500">Aucun personnage dans l'ordre d'initiative pour le moment. Ajoutez des personnages pour commencer.</p>
      </div>
      
      <template v-else>
        <div class="mb-4 p-3 bg-yellow-50 rounded-md text-sm text-yellow-700">
          <p>Les personnages sont classés par initiative (la plus élevée en premier). Glissez-déposez les personnages entre les listes pour les mettre en attente ou les réactiver.</p>
        </div>
        
        <!-- Liste d'initiative principale -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4 flex-col sm:flex-row w-full">
            <h2 class="text-lg font-semibold mb-2 sm:mb-0 self-start">Ordre d'initiative</h2>
            
            <button 
                @click="rollAllMonsterInitiatives()" 
                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm flex items-center w-full sm:w-auto justify-center sm:justify-start"
                :title="'Lancer l\'initiative pour tous les personnages'"
                :class="{ 'opacity-50 cursor-not-allowed': isRollingInitiative }"
                :disabled="isRollingInitiative"
              >
                <font-awesome-icon :icon="faDiceD20" class="h-4 w-4 mr-1.5 inline-block" />
                <span class="sm:hidden inline-block align-middle">Roll initiatives</span>
                <span class="hidden sm:inline-block align-middle">Lancer les initiatives</span>
              </button>
          </div>
      
          <!-- Conteneur pour le drag & drop -->
          <div ref="initiativeListRef" class="initiative-list space-y-2 border-2 border-dashed border-gray-300 p-4 rounded-lg">
            <!-- Message quand la liste est vide -->
            <div v-if="initiativeOrder.length === 0" class="text-center py-6 text-gray-500">
              Aucun personnage dans l'ordre d'initiative. Ajoutez des personnages pour commencer le combat.
            </div>
            
            <!-- Joueurs et monstres -->
            <div v-for="(character, index) in initiativeOrder" :key="`initiative-${character.id}`"
                 class="cursor-move"
                 :data-id="character.id"
                 :data-type="character.type"
                 :id="`character-${character.id}`">
              <InitiativeCharacterCard
                :character="character"
                :index="index"
                :hasDisadvantageOnAttacks="hasDisadvantageOnAttacks"
                :hasAdvantageAgainstAttacks="hasAdvantageAgainstAttacks"
                :getConditionDetails="getConditionDetails"
                @cardClick="scrollToCharacter(character.id, character.type)"
              />
            </div>
          </div>
        </div>
        
        <!-- Encart "Personnages en attente" -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Personnages en attente
          </h2>
          
          <div v-if="waitingCharacters.length === 0" class="waiting-list space-y-2 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300" ref="waitingListRef">
            <!-- Liste vide - le style CSS affichera un texte d'aide -->
            <div class="text-center py-6 text-gray-500 text-sm sm:text-base">
              Aucun personnage en attente. Glissez-déposez des personnages depuis la liste d'initiative pour les mettre en attente.
            </div>
          </div>
          
          <div v-else ref="waitingListRef" class="waiting-list space-y-2 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
            <div v-for="(character, index) in waitingCharacters" :key="`waiting-${character.id}`"
                 class="cursor-move"
                 :data-id="character.id"
                 :data-type="character.type"
                 :id="`character-${character.id}`">
              <InitiativeCharacterCard
                :character="character"
                :index="index"
                :hasDisadvantageOnAttacks="hasDisadvantageOnAttacks"
                :hasAdvantageAgainstAttacks="hasAdvantageAgainstAttacks"
                :getDexModifier="getDexModifier"
                :getConditionDetails="getConditionDetails"
                @cardClick="scrollToCharacter(character.id, character.type)"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <NewCombatDialog />
</template>

<style scoped>
/* Styles pour le drag & drop */
.initiative-list, .waiting-list {
  min-height: 50px;
  transition: all 0.2s ease;
}

.highlight-dropzone {
  background-color: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.5);
}

/* Animation pour mettre en surbrillance les éléments */
.highlight-element {
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(124, 58, 237, 0); }
  100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
}

/* Style pour les éléments actuellement en cours de déplacement */
.sortable-ghost {
  opacity: 0.4;
  background-color: transparent !important;
}

/* Style pour les éléments en cours de déplacement */
.sortable-drag {
  opacity: 0.8;
  background-color: transparent !important;
}

/* Style pour les éléments clonés lors du drag & drop */
.sortable-chosen {
  background-color: transparent !important;
}

/* Style pour le tour actuel */
.current-turn {
  border-left: 4px solid #7c3aed;
  background-color: rgba(124, 58, 237, 0.1);
}

/* Style global pour les boutons */
button {
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.97);
}

/* Animation pour le roll d'initiatives */
.highlight-rolled {
  animation: highlight-roll 1s ease-in-out;
}

@keyframes highlight-roll {
  0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
  50% { box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.3); }
  100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
}
</style>
