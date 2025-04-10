import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export interface Player {
  id: string;
  name: string;
  initiative: number;
  dexterity: number;
  notes?: string;
}

export const usePlayerStore = defineStore('player', () => {
  // Load players from localStorage if available
  const savedPlayers = localStorage.getItem('dnd-combat-tracker-players');
  const initialPlayers = savedPlayers ? JSON.parse(savedPlayers) : [];
  
  const players = ref<Player[]>(initialPlayers);
  
  // Watch for changes to players and save to localStorage
  watch(players, (newPlayers) => {
    localStorage.setItem('dnd-combat-tracker-players', JSON.stringify(newPlayers));
  }, { deep: true });

  function addPlayer(playerData: Omit<Player, 'id'>) {
    const player: Player = {
      id: uuidv4(),
      ...playerData
    };
    players.value.push(player);
  }

  function updatePlayer(id: string, data: Partial<Omit<Player, 'id'>>) {
    const index = players.value.findIndex(player => player.id === id);
    if (index !== -1) {
      players.value[index] = { ...players.value[index], ...data };
    }
  }

  function updatePlayerInitiative(id: string, initiative: number) {
    updatePlayer(id, { initiative });
  }

  function removePlayer(id: string) {
    players.value = players.value.filter(player => player.id !== id);
  }

  function reorderPlayers(newOrder: Player[]) {
    players.value = newOrder;
  }

  // Calculate ability modifier from score
  function getAbilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  return {
    players,
    addPlayer,
    updatePlayer,
    updatePlayerInitiative,
    removePlayer,
    reorderPlayers,
    getAbilityModifier
  };
});
