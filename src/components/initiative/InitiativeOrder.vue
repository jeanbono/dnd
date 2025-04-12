<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useTurnStore } from '@/stores/turn';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';
import { useDialogStore } from '@/stores/dialog';
import NewCombatDialog from '@/components/initiative/NewCombatDialog.vue';
import ConditionTooltip from '@/components/conditions/ConditionTooltip.vue';
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
</script>

<template>
  <div class="mb-6">
    <!-- Affichage épique du tour -->
    <div class="relative mb-6 flex justify-center">
      <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 opacity-10 rounded-xl"></div>
      <div class="relative py-4 px-6 flex flex-col items-center">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-4xl font-bold text-purple-700">
            Tour {{ turnStore.currentTurn }}
          </span>
        </div>
      </div>
    </div>

    <!-- Header avec boutons -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Ordre d'Initiative</h2>
      <div class="flex items-center space-x-3">
        <button 
          @click="nextTurn()" 
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          Tour suivant
        </button>
        <button 
          @click="startNewCombat" 
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow transition-all duration-200 hover:shadow-lg flex items-center h-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Nouveau combat
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
          <h3 class="text-xl font-semibold mb-4">Ordre d'initiative</h3>
          
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
                   class="p-2 rounded-md flex justify-between items-center border hover:bg-opacity-70 w-1/2 cursor-pointer hover:shadow-md transition-all duration-200"
                   :title="character.type === 'player' ? 'Cliquez pour voir ce joueur' : 'Cliquez pour voir ce monstre'"
                   @click="character.type === 'player' ? scrollToPlayer(character.id) : scrollToMonster(character.id)">
                <div class="flex items-center">
                  <div class="font-bold text-xl mr-3 w-6 text-center">{{ index + 1 }}</div>
                  <div class="flex-grow">
                    <div class="flex items-center">
                      <span class="font-medium">{{ character.name }}</span>
                      <span v-if="hasDisadvantageOnAttacks(character)" 
                            class="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full" 
                            :title="character.type === 'player' ? 'Ce personnage a un désavantage aux jets d\'attaque' : 'Ce monstre a un désavantage aux jets d\'attaque'">
                        Désavantage
                      </span>
                      <span v-if="hasAdvantageAgainstAttacks(character)" 
                            class="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full" 
                            :title="character.type === 'player' ? 'Les attaques contre ce personnage ont un avantage' : 'Les attaques contre ce monstre ont un avantage'">
                        Avantage contre
                      </span>
                    </div>
                    <div class="text-sm text-gray-600">
                      <span>Initiative : {{ character.initiative }}</span>
                      <span class="ml-2">DEX : {{ getDexModifier(character) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Compteur d'états -->
                <div v-if="character.conditions && character.conditions.length > 0" 
                     class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help group">
                  {{ character.conditions.length }}
                  <ConditionTooltip :character="character" />
                </div>
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
            <div class="text-center py-6 text-gray-500">
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
                   class="p-2 rounded-md flex justify-between items-center border hover:bg-opacity-70 w-1/2 cursor-pointer hover:shadow-md transition-all duration-200"
                   :title="character.type === 'player' ? 'Cliquez pour voir ce joueur' : 'Cliquez pour voir ce monstre'"
                   @click="character.type === 'player' ? scrollToPlayer(character.id) : scrollToMonster(character.id)">
                <div class="flex items-center">
                  <div class="font-bold text-xl mr-3 w-6 text-center">{{ index + 1 }}</div>
                  <div class="flex-grow">
                    <div class="flex items-center">
                      <span class="font-medium">{{ character.name }}</span>
                      <span v-if="hasDisadvantageOnAttacks(character)" 
                            class="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full" 
                            :title="character.type === 'player' ? 'Ce personnage a un désavantage aux jets d\'attaque' : 'Ce monstre a un désavantage aux jets d\'attaque'">
                        Désavantage
                      </span>
                      <span v-if="hasAdvantageAgainstAttacks(character)" 
                            class="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full" 
                            :title="character.type === 'player' ? 'Les attaques contre ce personnage ont un avantage' : 'Les attaques contre ce monstre ont un avantage'">
                        Avantage contre
                      </span>
                    </div>
                    <div class="text-sm text-gray-600">
                      <span>Initiative : {{ character.initiative }}</span>
                      <span class="ml-2">DEX : {{ getDexModifier(character) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Compteur d'états -->
                <div v-if="character.conditions && character.conditions.length > 0" 
                     class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help group">
                  {{ character.conditions.length }}
                  <ConditionTooltip :character="character" />
                </div>
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
</style>
