<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';
import { useTurnStore } from '@/stores/turn';
import { useDialogStore } from '@/stores/dialog';
import { hasDisadvantage, conditionTranslations } from '@/utils/conditionUtils';
import type { ConditionWithLevel } from '@/utils/conditionUtils';
import NewCombatDialog from '@/components/initiative/NewCombatDialog.vue';

const monsterStore = useMonsterStore();
const playerStore = usePlayerStore();
const turnStore = useTurnStore();
const dialogStore = useDialogStore();

// Trigger for re-computing the initiative order
const initiativeUpdateTrigger = ref(0);

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
  
  // Trigger a re-computation of the initiative order
  initiativeUpdateTrigger.value++;
}

// Combine monsters and players and sort by initiative
const initiativeOrder = computed(() => {
  const combined = [
    ...monsterStore.monsters.map(monster => ({
      id: monster.id,
      name: monster.name,
      initiative: monster.initiative,
      dexterity: monster.dexterity,
      type: 'monster',
      conditions: monster.conditions,
      hasDisadvantage: hasDisadvantage(monster.conditions)
    })),
    ...playerStore.players.map(player => ({
      id: player.id,
      name: player.name,
      initiative: player.initiative,
      dexterity: player.dexterity,
      type: 'player',
      conditions: player.conditions,
      hasDisadvantage: hasDisadvantage(player.conditions)
    }))
  ];
  
  // Sort by initiative (highest to lowest)
  // If initiative is tied, sort by dexterity (highest to lowest)
  return combined.sort((a, b) => {
    if (a.initiative !== b.initiative) {
      return b.initiative - a.initiative;
    }
    // If initiative is tied, sort by dexterity
    return (b.dexterity || 0) - (a.dexterity || 0);
  });
});

// Check if there are any characters
const hasCharacters = computed(() => {
  return initiativeOrder.value.length > 0;
});

// Fonction pour formater la liste des conditions pour l'infobulle
function formatConditionsList(conditions: ConditionWithLevel[] | undefined) {
  if (!conditions || conditions.length === 0) return "Aucun état";
  
  return conditions.map(c => {
    const name = conditionTranslations[c.condition];
    return c.level ? `${name} (niveau ${c.level})` : name;
  }).join(', ');
}

function startNewCombat() {
  dialogStore.showNewCombatDialog = true;
}
</script>

<template>
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-semibold">Ordre d'Initiative</h2>
    <div class="flex items-center space-x-2">
      <span class="text-gray-700">Tour: {{ turnStore.currentTurn }}</span>
      <button 
        @click="nextTurn" 
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
        v-if="hasCharacters"
      >
        Tour suivant
      </button>
      <button 
        @click="startNewCombat" 
        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
      >
        Nouveau combat
      </button>
    </div>
  </div>
  
  <div v-if="!hasCharacters" class="text-center py-6 bg-gray-100 rounded-md">
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
                <span v-if="character.hasDisadvantage" 
                      class="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full" 
                      title="Ce personnage a un désavantage aux jets d'attaque">
                  Désavantage
                </span>
              </div>
              <div class="text-sm text-gray-600">
                <span>Initiative : {{ character.initiative }}</span>
                <span class="ml-2">DEX : {{ character.dexterity }}</span>
              </div>
            </div>
          </div>
          
          <!-- Compteur d'états -->
          <div v-if="character.conditions && character.conditions.length > 0" 
               class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help group"
          >
            {{ character.conditions.length }}
            <!-- Infobulle détaillée -->
            <div class="absolute hidden group-hover:block right-0 bottom-full mb-2 w-48 p-2 bg-white border border-gray-200 rounded shadow-lg text-xs text-gray-700 z-50">
              <div class="font-semibold mb-1">États actifs :</div>
              <ul class="list-disc pl-4">
                <li v-for="condition in character.conditions" :key="condition.condition">
                  {{ conditionTranslations[condition.condition] }}
                  <span v-if="condition.level">(niveau {{ condition.level }})</span>
                </li>
              </ul>
              <div class="absolute right-0 bottom-0 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
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
                <span v-if="character.hasDisadvantage" 
                      class="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full" 
                      title="Ce monstre a un désavantage aux jets d'attaque">
                  Désavantage
                </span>
              </div>
              <div class="text-sm text-gray-600">
                <span>Initiative : {{ character.initiative }}</span>
                <span class="ml-2">DEX : {{ character.dexterity }}</span>
              </div>
            </div>
          </div>
          
          <!-- Compteur d'états -->
          <div v-if="character.conditions && character.conditions.length > 0" 
               class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help group"
          >
            {{ character.conditions.length }}
            <!-- Infobulle détaillée -->
            <div class="absolute hidden group-hover:block right-0 bottom-full mb-2 w-48 p-2 bg-white border border-gray-200 rounded shadow-lg text-xs text-gray-700 z-50">
              <div class="font-semibold mb-1">États actifs :</div>
              <ul class="list-disc pl-4">
                <li v-for="condition in character.conditions" :key="condition.condition">
                  {{ conditionTranslations[condition.condition] }}
                  <span v-if="condition.level">(niveau {{ condition.level }})</span>
                </li>
              </ul>
              <div class="absolute right-0 bottom-0 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
            </div>
          </div>
        </div>
        <div v-else class="invisible"></div>
      </template>
    </div>
  </template>
  
  <NewCombatDialog />
</template>
