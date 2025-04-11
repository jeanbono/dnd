<script setup lang="ts">
import { computed } from 'vue';
import { useTurnStore } from '@/stores/turn';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';
import { useDialogStore } from '@/stores/dialog';
import { hasDisadvantage } from '@/utils/conditionUtils';
import NewCombatDialog from '@/components/initiative/NewCombatDialog.vue';

const turnStore = useTurnStore();
const monsterStore = useMonsterStore();
const playerStore = usePlayerStore();
const dialogStore = useDialogStore();

// Function to scroll to a monster in the monster list
function scrollToMonster(monsterId: string) {
  const monsterElement = document.getElementById(`monster-${monsterId}`);
  if (monsterElement) {
    monsterElement.scrollIntoView({ behavior: 'smooth' });
  }
}

// Function to advance to the next turn
function nextTurn() {
  // Increment the turn counter in the store
  turnStore.nextTurn();
  // Decrement condition durations for all creatures
  monsterStore.decrementConditionDurations();
  playerStore.decrementConditionDurations();
}

// Computed properties
const currentTurn = computed(() => turnStore.currentTurn);
const initiativeOrder = computed(() => {
  // Récupérer tous les monstres et joueurs
  const monsters = monsterStore.monsters.map(monster => ({
    ...monster,
    type: 'monster' as const
  }));
  
  const players = playerStore.players.map(player => ({
    ...player,
    type: 'player' as const
  }));
  
  // Combiner et trier par initiative (décroissant)
  return [...monsters, ...players]
    .sort((a, b) => b.initiative - a.initiative);
});

// Fonction pour déterminer si une créature a un désavantage aux jets d'attaque
function hasDisadvantageOnAttacks(character: any) {
  return character.conditions && character.conditions.length > 0 && hasDisadvantage(character.conditions);
}

// Fonction pour obtenir le modificateur de dextérité (pour les joueurs)
function getDexModifier(character: any) {
  if (character.type === 'player') {
    // Utiliser une valeur par défaut pour dexterity
    return '+0';
  }
  
  // Pour les monstres, utiliser la dextérité si disponible
  if (character.type === 'monster' && character.dexterity) {
    const mod = Math.floor((character.dexterity - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }
  
  return '+0';
}

function startNewCombat() {
  dialogStore.showNewCombatDialog = true;
}

// Fonction pour formater la liste des conditions pour l'infobulle
function formatConditionsList(conditions: any[] | undefined) {
  if (!conditions || conditions.length === 0) return "Aucun état";
  
  return conditions.map(c => {
    const name = c.condition.label;
    // Vérifier si la condition est l'épuisement et si elle a un niveau
    if (c.condition.id === 1 && c.level !== undefined) {
      return `${name} (niveau ${c.level})`;
    }
    return name;
  }).join(', ');
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
          <span class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600">
            Tour {{ currentTurn }}
          </span>
        </div>
      </div>
    </div>

    <!-- Header avec boutons -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Ordre d'Initiative</h2>
      <div class="flex items-center space-x-3">
        <button 
          @click="nextTurn" 
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow transition-all duration-200 hover:shadow-lg flex items-center h-10"
          v-if="initiativeOrder.length > 0"
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
      <div v-if="initiativeOrder.length === 0" class="text-center py-6 bg-gray-100 rounded-md">
        <p class="text-gray-500">Aucun personnage dans l'ordre d'initiative pour le moment. Ajoutez des joueurs et des monstres pour commencer.</p>
      </div>
      
      <template v-else>
        <div class="mb-4 p-3 bg-yellow-50 rounded-md text-sm text-yellow-700">
          <p>Les personnages sont classés par initiative (la plus élevée en premier). En cas d'égalité, le personnage avec la plus grande dextérité passe en premier.</p>
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <!-- Headers -->
          <h3 class="text-lg font-medium mb-2 text-blue-700 text-center">Joueurs</h3>
          <h3 class="text-lg font-medium mb-2 text-red-700 text-center">Monstres</h3>
          
          <!-- Initiative rows -->
          <template v-for="(character, index) in initiativeOrder" :key="`initiative-row-${index}`">
            <!-- Player column -->
            <div v-if="character.type === 'player'"
                 class="p-2 rounded-md flex justify-between items-center bg-blue-50 border border-blue-200"
                 :title="formatConditionsList(character.conditions)">
              <div class="flex items-center">
                <div class="font-bold text-xl mr-3 w-6 text-center">{{ index + 1 }}</div>
                <div class="flex-grow">
                  <div class="flex items-center">
                    <span class="font-medium">{{ character.name }}</span>
                    <span v-if="hasDisadvantageOnAttacks(character)" 
                          class="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full" 
                          title="Ce personnage a un désavantage aux jets d'attaque">
                      Désavantage
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
                   class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help group"
              >
                {{ character.conditions.length }}
                <!-- Infobulle détaillée -->
                <div class="absolute hidden group-hover:block left-1/2 bottom-full mb-2 transform -translate-x-1/2 z-10">
                  <div class="bg-gray-800 text-white text-xs rounded p-2 shadow-lg" style="min-width: 200px; max-width: 300px;">
                    <div class="font-semibold mb-1">États actifs :</div>
                    <ul class="list-disc pl-4">
                      <li v-for="condition in character.conditions" :key="condition.condition.id">
                        {{ formatConditionsList([condition]) }}
                      </li>
                    </ul>
                    <div class="absolute left-1/2 top-full transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="invisible"></div>
            
            <!-- Monster column -->
            <div v-if="character.type === 'monster'"
                 :id="`initiative-monster-${character.id}`"
                 class="p-2 rounded-md flex justify-between items-center bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100"
                 @click="scrollToMonster(character.id)"
                 :title="formatConditionsList(character.conditions)">
              <div class="flex items-center">
                <div class="font-bold text-xl mr-3 w-6 text-center">{{ index + 1 }}</div>
                <div class="flex-grow">
                  <div class="flex items-center">
                    <span class="font-medium">{{ character.name }}</span>
                    <span v-if="hasDisadvantageOnAttacks(character)" 
                          class="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full" 
                          title="Ce monstre a un désavantage aux jets d'attaque">
                      Désavantage
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
                   class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help group"
              >
                {{ character.conditions.length }}
                <!-- Infobulle détaillée -->
                <div class="absolute hidden group-hover:block left-1/2 bottom-full mb-2 transform -translate-x-1/2 z-10">
                  <div class="bg-gray-800 text-white text-xs rounded p-2 shadow-lg" style="min-width: 200px; max-width: 300px;">
                    <div class="font-semibold mb-1">États actifs :</div>
                    <ul class="list-disc pl-4">
                      <li v-for="condition in character.conditions" :key="condition.condition.id">
                        {{ formatConditionsList([condition]) }}
                      </li>
                    </ul>
                    <div class="absolute left-1/2 top-full transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="invisible"></div>
          </template>
        </div>
      </template>
    </div>
  </div>
  <NewCombatDialog />
</template>
