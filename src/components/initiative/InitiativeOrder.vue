<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useTurnStore } from '@/stores/turn';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';
import { useDialogStore } from '@/stores/dialog';
import NewCombatDialog from '@/components/initiative/NewCombatDialog.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { Condition, getConditionEffects } from '@/utils/conditionUtils';
import Sortable from "sortablejs";

// Stores
const turnStore = useTurnStore();
const monsterStore = useMonsterStore();
const playerStore = usePlayerStore();
const dialogStore = useDialogStore();

// Références pour les conteneurs drag & drop
const initiativeListRef = ref<HTMLElement | null>(null);
const waitingListRef = ref<HTMLElement | null>(null);

// Function to scroll to a monster in the monster list
function scrollToMonster(monsterId: string) {
  const monsterElement = document.getElementById(`monster-${monsterId}`);
  if (monsterElement) {
    // Scroll avec un offset pour que l'élément soit bien visible
    const yOffset = -100; // Ajuster cette valeur selon les besoins
    const y = monsterElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
    
    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
    
    // Ajouter une classe de mise en évidence temporaire
    monsterElement.classList.add('highlight-element');
    setTimeout(() => {
      monsterElement.classList.remove('highlight-element');
    }, 2000);
  }
}

// Function to scroll to a player in the player list
function scrollToPlayer(playerId: string) {
  const playerElement = document.getElementById(`player-${playerId}`);
  if (playerElement) {
    // Scroll avec un offset pour que l'élément soit bien visible
    const yOffset = -100; // Ajuster cette valeur selon les besoins
    const y = playerElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
    
    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
    
    // Ajouter une classe de mise en évidence temporaire
    playerElement.classList.add('highlight-element');
    setTimeout(() => {
      playerElement.classList.remove('highlight-element');
    }, 2000);
  }
}

// Function to advance to the next turn
function nextTurn() {
  turnStore.nextTurn();
  monsterStore.decrementConditionDurations();
  playerStore.decrementConditionDurations();
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
  // Récupérer tous les joueurs et monstres actifs
  const players = playerStore.players.map(player => ({
    ...player,
    type: 'player'
  }));
  
  const monsters = monsterStore.monsters.map(monster => ({
    ...monster,
    type: 'monster'
  }));
  
  // Filtrer les personnages qui ne sont pas en attente
  const allCharacters = [...players, ...monsters].filter(character => {
    if (!character || !character.id) return false;
    return !turnStore.isWaiting(character.id, character.type as 'player' | 'monster');
  });
  
  // Trier par initiative (décroissant) puis par DEX (décroissant)
  return allCharacters.sort((a, b) => {
    if (!a || !b) return 0;
    if (a.initiative !== b.initiative) {
      return b.initiative - a.initiative;
    }
    // En cas d'égalité d'initiative, utiliser le modificateur de DEX
    const aDexMod = getDexModifier(a);
    const bDexMod = getDexModifier(b);
    return bDexMod - aDexMod;
  });
});

// Récupérer les personnages en attente
const waitingCharacters = computed(() => {
  // Récupérer tous les joueurs et monstres
  const players = playerStore.players.map(player => ({
    ...player,
    type: 'player'
  }));
  
  const monsters = monsterStore.monsters.map(monster => ({
    ...monster,
    type: 'monster'
  }));
  
  // Filtrer les personnages qui sont en attente
  const allCharacters = [...players, ...monsters].filter(character => {
    if (!character || !character.id) return false;
    return turnStore.isWaiting(character.id, character.type as 'player' | 'monster');
  });
  
  // Trier par initiative (décroissant) puis par DEX (décroissant)
  return allCharacters.sort((a, b) => {
    if (!a || !b) return 0;
    if (a.initiative !== b.initiative) {
      return b.initiative - a.initiative;
    }
    // En cas d'égalité d'initiative, utiliser le modificateur de DEX
    const aDexMod = getDexModifier(a);
    const bDexMod = getDexModifier(b);
    return bDexMod - aDexMod;
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
            console.log('Moving to waiting list:', id, type);
            if (id && type) {
              turnStore.addToWaiting(id, type as 'player' | 'monster');
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
            console.log('Moving to initiative list:', id, type);
            if (id && type) {
              turnStore.removeFromWaiting(id, type as 'player' | 'monster');
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
  monsterStore.rollAllInitiatives();
  
  // On pourrait ajouter ici un feedback visuel temporaire
  // pour montrer que les initiatives ont été lancées
  const initiativeList = initiativeListRef.value;
  if (initiativeList) {
    initiativeList.classList.add('highlight-rolled');
    setTimeout(() => {
      initiativeList.classList.remove('highlight-rolled');
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
      <h2 class="text-xl font-semibold">Ordre d'Initiative</h2>
      
      <!-- Boutons de navigation du tour avec leurs icônes originales -->
      <div class="flex items-center gap-2 sm:space-x-3 w-full sm:w-auto">
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
        <p class="text-gray-500">Aucun personnage dans l'ordre d'initiative pour le moment. Ajoutez des joueurs et des monstres pour commencer.</p>
      </div>
      
      <template v-else>
        <div class="mb-4 p-3 bg-yellow-50 rounded-md text-sm text-yellow-700">
          <p>Les personnages sont classés par initiative (la plus élevée en premier). Glissez-déposez les personnages entre les listes pour les mettre en attente ou les réactiver.</p>
        </div>
        
        <!-- Liste d'initiative principale -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4 flex-col sm:flex-row w-full">
            <h3 class="text-lg font-semibold mb-2 sm:mb-0 self-start">Ordre d'initiative</h3>
            
            <button 
                @click="rollAllMonsterInitiatives()" 
                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm flex items-center w-full sm:w-auto justify-center sm:justify-start"
                :title="'Lancer l\'initiative pour tous les monstres'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span class="sm:hidden inline-block align-middle">Roll initiatives</span>
                <span class="hidden sm:inline-block align-middle">Lancer les initiatives</span>
              </button>
          </div>
      
          <!-- Conteneur pour le drag & drop -->
          <div ref="initiativeListRef" class="initiative-list space-y-2 border-2 border-dashed border-gray-300 p-4 rounded-lg">
            <!-- Message quand la liste est vide -->
            <div v-if="initiativeOrder.length === 0" class="text-center py-6 text-gray-500">
              Aucun personnage dans l'ordre d'initiative. Ajoutez des joueurs ou des monstres pour commencer le combat.
            </div>
            
            <!-- Joueurs et monstres -->
            <div v-for="(character, index) in initiativeOrder" :key="`initiative-${character.id}`"
                 class="cursor-move"
                 :data-id="character.id"
                 :data-type="character.type">
              <div :class="{
                      'bg-blue-50 border-blue-200': character.type === 'player',
                      'bg-red-50 border-red-200': character.type === 'monster',
                      'ml-0 mr-auto': character.type === 'player',
                      'ml-auto mr-0': character.type === 'monster'
                    }"
                   class="p-2 rounded-md flex justify-between items-center border hover:bg-opacity-70 w-full sm:w-1/2 cursor-pointer hover:shadow-md transition-all duration-200"
                   :title="character.type === 'player' ? 'Cliquez pour voir ce joueur' : 'Cliquez pour voir ce monstre'"
                   @click="character.type === 'player' ? scrollToPlayer(character.id) : scrollToMonster(character.id)">
                <div class="flex items-center">
                  <div class="font-bold text-xl mr-3 w-6 text-center">{{ index + 1 }}</div>
                  <div class="flex-grow">
                    <div class="flex items-center flex-wrap">
                      <span class="font-medium mr-1">{{ character.name }}</span>
                      <!-- Badges pour écrans moyens et larges -->
                      <div class="hidden md:flex flex-wrap items-center gap-1">
                        <span v-if="hasDisadvantageOnAttacks(character)" 
                              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Ce personnage a un désavantage aux jets d\'attaque' : 'Ce monstre a un désavantage aux jets d\'attaque'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                          Désavantage
                        </span>
                        <span v-if="hasAdvantageAgainstAttacks(character)" 
                              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Les attaques contre ce personnage ont un avantage' : 'Les attaques contre ce monstre ont un avantage'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          Avantage contre
                        </span>
                      </div>
                      
                      <!-- Version intermédiaire pour tablettes -->
                      <div class="hidden sm:flex md:hidden flex-wrap items-center gap-1">
                        <span v-if="hasDisadvantageOnAttacks(character)" 
                              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Ce personnage a un désavantage aux jets d\'attaque' : 'Ce monstre a un désavantage aux jets d\'attaque'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                        </span>
                        <span v-if="hasAdvantageAgainstAttacks(character)" 
                              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Les attaques contre ce personnage ont un avantage' : 'Les attaques contre ce monstre ont un avantage'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        </span>
                      </div>
                      
                      <!-- Badges compacts pour écrans très étroits -->
                      <div class="flex sm:hidden flex-wrap items-center gap-1">
                        <span v-if="hasDisadvantageOnAttacks(character)" 
                              class="inline-flex items-center px-1 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Ce personnage a un désavantage aux jets d\'attaque' : 'Ce monstre a un désavantage aux jets d\'attaque'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                        </span>
                        <span v-if="hasAdvantageAgainstAttacks(character)" 
                              class="inline-flex items-center px-1 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Les attaques contre ce personnage ont un avantage' : 'Les attaques contre ce monstre ont un avantage'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div class="text-sm text-gray-600">
                      <span>Initiative : {{ character.initiative }}</span>
                      <span class="ml-2">DEX : {{ getDexModifier(character) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Compteur d'états -->
                <Tooltip placement="top" :offset-distance="10">
                  <div 
                    class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help"
                    v-if="character.conditions && character.conditions.length > 0"
                  >
                    {{ character.conditions.length }}
                  </div>
                  
                  <template #content>
                    <div class="bg-gray-800 text-white text-xs rounded p-2" style="min-width: 200px; max-width: 300px;">
                      <div class="font-semibold mb-1">États actifs :</div>
                      <div class="grid grid-cols-1 gap-2">
                        <div v-for="condition in character.conditions" :key="condition.condition.id" class="mb-2">
                          <div class="font-medium text-blue-300">{{ getConditionDetails(condition).title }}</div>
                          <ul v-if="getConditionDetails(condition).effects" class="list-disc pl-4 mt-1 text-gray-300 text-xs">
                            <li v-for="(effect, index) in getConditionDetails(condition).effects" :key="index" class="mb-1">
                              {{ effect }}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </template>
                </Tooltip>
              </div>
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
                 :data-type="character.type">
              <div :class="{
                      'bg-blue-50 border-blue-200': character.type === 'player',
                      'bg-red-50 border-red-200': character.type === 'monster',
                      'ml-0 mr-auto': character.type === 'player',
                      'ml-auto mr-0': character.type === 'monster'
                    }"
                   class="p-2 rounded-md flex justify-between items-center border hover:bg-opacity-70 w-full sm:w-1/2 cursor-pointer hover:shadow-md transition-all duration-200"
                   :title="character.type === 'player' ? 'Cliquez pour voir ce joueur' : 'Cliquez pour voir ce monstre'"
                   @click="character.type === 'player' ? scrollToPlayer(character.id) : scrollToMonster(character.id)">
                <div class="flex items-center">
                  <div class="font-bold text-xl mr-3 w-6 text-center">{{ index + 1 }}</div>
                  <div class="flex-grow">
                    <div class="flex items-center flex-wrap">
                      <span class="font-medium mr-1">{{ character.name }}</span>
                      <!-- Badges pour écrans moyens et larges -->
                      <div class="hidden md:flex flex-wrap items-center gap-1">
                        <span v-if="hasDisadvantageOnAttacks(character)" 
                              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Ce personnage a un désavantage aux jets d\'attaque' : 'Ce monstre a un désavantage aux jets d\'attaque'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                          Désavantage
                        </span>
                        <span v-if="hasAdvantageAgainstAttacks(character)" 
                              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Les attaques contre ce personnage ont un avantage' : 'Les attaques contre ce monstre ont un avantage'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          Avantage contre
                        </span>
                      </div>
                      
                      <!-- Version intermédiaire pour tablettes -->
                      <div class="hidden sm:flex md:hidden flex-wrap items-center gap-1">
                        <span v-if="hasDisadvantageOnAttacks(character)" 
                              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Ce personnage a un désavantage aux jets d\'attaque' : 'Ce monstre a un désavantage aux jets d\'attaque'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                        </span>
                        <span v-if="hasAdvantageAgainstAttacks(character)" 
                              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Les attaques contre ce personnage ont un avantage' : 'Les attaques contre ce monstre ont un avantage'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        </span>
                      </div>
                      
                      <!-- Badges compacts pour écrans très étroits -->
                      <div class="flex sm:hidden flex-wrap items-center gap-1">
                        <span v-if="hasDisadvantageOnAttacks(character)" 
                              class="inline-flex items-center px-1 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Ce personnage a un désavantage aux jets d\'attaque' : 'Ce monstre a un désavantage aux jets d\'attaque'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                        </span>
                        <span v-if="hasAdvantageAgainstAttacks(character)" 
                              class="inline-flex items-center px-1 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 shadow-sm" 
                              :title="character.type === 'player' ? 'Les attaques contre ce personnage ont un avantage' : 'Les attaques contre ce monstre ont un avantage'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div class="text-sm text-gray-600">
                      <span>Initiative : {{ character.initiative }}</span>
                      <span class="ml-2">DEX : {{ getDexModifier(character) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Compteur d'états -->
                <Tooltip placement="top" :offset-distance="10">
                  <div 
                    class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help"
                    v-if="character.conditions && character.conditions.length > 0"
                  >
                    {{ character.conditions.length }}
                  </div>
                  
                  <template #content>
                    <div class="bg-gray-800 text-white text-xs rounded p-2" style="min-width: 200px; max-width: 300px;">
                      <div class="font-semibold mb-1">États actifs :</div>
                      <div class="grid grid-cols-1 gap-2">
                        <div v-for="condition in character.conditions" :key="condition.condition.id" class="mb-2">
                          <div class="font-medium text-blue-300">{{ getConditionDetails(condition).title }}</div>
                          <ul v-if="getConditionDetails(condition).effects" class="list-disc pl-4 mt-1 text-gray-300 text-xs">
                            <li v-for="(effect, index) in getConditionDetails(condition).effects" :key="index" class="mb-1">
                              {{ effect }}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </template>
                </Tooltip>
              </div>
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
