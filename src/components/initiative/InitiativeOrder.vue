<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMonsterStore } from '../../stores/monster';
import { usePlayerStore } from '../../stores/player';

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

// Separate the initiative order into players and monsters while preserving the global order
const playerSlots = computed(() => {
  const slots: Array<{position: number, character: any | null}> = [];
  
  initiativeOrder.value.forEach((character, index) => {
    if (character.type === 'player') {
      slots.push({
        position: index,
        character
      });
    } else {
      // Add an empty slot for monsters to maintain alignment
      slots.push({ position: index, character: null });
    }
  });
  
  return slots;
});

const monsterSlots = computed(() => {
  const slots: Array<{position: number, character: any | null}> = [];
  
  initiativeOrder.value.forEach((character, index) => {
    if (character.type === 'monster') {
      slots.push({
        position: index,
        character
      });
    } else {
      // Add an empty slot for players to maintain alignment
      slots.push({ position: index, character: null });
    }
  });
  
  return slots;
});

// Check if there are any characters
const hasCharacters = computed(() => {
  return initiativeOrder.value.length > 0;
});
</script>

<template>
  <div class="p-4 bg-white rounded-md shadow border border-gray-200 mb-6">
    <h2 class="text-xl font-semibold mb-4">Ordre d'Initiative</h2>
    
    <div v-if="!hasCharacters" class="text-center py-6 bg-gray-100 rounded-md">
      <p class="text-gray-500">Aucun personnage dans l'ordre d'initiative pour le moment. Ajoutez des joueurs et des monstres pour commencer.</p>
    </div>
    
    <template v-else>
      <div class="mb-4 p-3 bg-yellow-50 rounded-md text-sm text-yellow-700">
        <p>Les personnages sont classés par initiative (la plus élevée en premier). En cas d'égalité, le personnage avec la plus grande dextérité passe en premier.</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <!-- Left column: Players -->
        <div>
          <h3 class="text-lg font-medium mb-3 text-blue-700 text-center">Joueurs</h3>
          <div class="space-y-2">
            <template v-for="slot in playerSlots" :key="`player-slot-${slot.position}`">
              <div 
                v-if="slot.character"
                class="p-3 rounded-md flex justify-between items-center bg-blue-50 border border-blue-200"
              >
                <div class="flex items-center">
                  <div class="font-bold text-2xl mr-4 w-8 text-center">{{ slot.position + 1 }}</div>
                  <div>
                    <span class="font-medium">{{ slot.character.name }}</span>
                    <div class="text-sm text-gray-600">
                      <span>Initiative : {{ slot.character.initiative }}</span>
                      <span class="ml-2">DEX : {{ slot.character.dexterity }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div 
                v-else
                class="p-3 rounded-md border border-dashed border-gray-200 h-16 opacity-0"
              ></div>
            </template>
          </div>
        </div>
        
        <!-- Right column: Monsters -->
        <div>
          <h3 class="text-lg font-medium mb-3 text-red-700 text-center">Monstres</h3>
          <div class="space-y-2">
            <template v-for="slot in monsterSlots" :key="`monster-slot-${slot.position}`">
              <div 
                v-if="slot.character"
                :id="`initiative-monster-${slot.character.id}`"
                class="p-3 rounded-md flex justify-between items-center bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100"
                @click="scrollToMonster(slot.character.id)"
              >
                <div class="flex items-center">
                  <div class="font-bold text-2xl mr-4 w-8 text-center">{{ slot.position + 1 }}</div>
                  <div>
                    <span class="font-medium">{{ slot.character.name }}</span>
                    <div class="text-sm text-gray-600">
                      <span>Initiative : {{ slot.character.initiative }}</span>
                      <span class="ml-2">DEX : {{ slot.character.dexterity }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div 
                v-else
                class="p-3 rounded-md border border-dashed border-gray-200 h-16 opacity-0"
              ></div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
