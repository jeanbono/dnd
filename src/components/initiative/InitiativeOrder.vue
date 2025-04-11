<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';

const monsterStore = useMonsterStore();
const playerStore = usePlayerStore();

// Trigger for re-computing the initiative order
const initiativeUpdateTrigger = ref(0);

// Function to scroll to a monster in the monster list
function scrollToMonster(monsterId: string) {
  const monsterElement = document.getElementById(`monster-${monsterId}`);
  if (monsterElement) {
    monsterElement.scrollIntoView({ behavior: 'smooth' });
  }
}

// Combine monsters and players and sort by initiative
const initiativeOrder = computed(() => {
  // This is just to trigger a re-computation when initiative is updated
  initiativeUpdateTrigger.value;
  
  const combined = [
    ...monsterStore.monsters.map(monster => ({
      id: monster.id,
      name: monster.name,
      initiative: monster.initiative,
      dexterity: monster.dexterity,
      type: 'monster'
    })),
    ...playerStore.players.map(player => ({
      id: player.id,
      name: player.name,
      initiative: player.initiative,
      dexterity: player.dexterity,
      type: 'player'
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
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Ordre d'Initiative</h2>
  
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
             class="p-2 rounded-md flex justify-between items-center bg-blue-50 border border-blue-200">
          <div class="flex items-center">
            <div class="font-bold text-xl mr-3 w-6 text-center">{{ index + 1 }}</div>
            <div>
              <span class="font-medium">{{ character.name }}</span>
              <div class="text-sm text-gray-600">
                <span>Initiative : {{ character.initiative }}</span>
                <span class="ml-2">DEX : {{ character.dexterity }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="invisible"></div>
        
        <!-- Monster column -->
        <div v-if="character.type === 'monster'"
             :id="`initiative-monster-${character.id}`"
             class="p-2 rounded-md flex justify-between items-center bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100"
             @click="scrollToMonster(character.id)">
          <div class="flex items-center">
            <div class="font-bold text-xl mr-3 w-6 text-center">{{ index + 1 }}</div>
            <div>
              <span class="font-medium">{{ character.name }}</span>
              <div class="text-sm text-gray-600">
                <span>Initiative : {{ character.initiative }}</span>
                <span class="ml-2">DEX : {{ character.dexterity }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="invisible"></div>
      </template>
    </div>
  </template>
</template>
