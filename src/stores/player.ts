import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
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
  const isAddingPlayer = ref(false);
  const editingPlayerId = ref<string | null>(null);
  const tempPlayerData = ref<Partial<Player>>({
    name: '',
    initiative: 0,
    dexterity: 10,
    notes: ''
  });
  
  // Computed properties
  const isEditingAnyPlayer = computed(() => editingPlayerId.value !== null);
  const currentEditingPlayer = computed(() => {
    if (!editingPlayerId.value) return null;
    return players.value.find(player => player.id === editingPlayerId.value) || null;
  });
  
  // Watch for changes to players and save to localStorage
  watch(players, (newPlayers) => {
    localStorage.setItem('dnd-combat-tracker-players', JSON.stringify(newPlayers));
  }, { deep: true });

  // Player management functions
  function addPlayer(playerData: Omit<Player, 'id'>) {
    // Create default player data
    const defaultData: Omit<Player, 'id'> = {
      name: playerData.name || '',
      initiative: playerData.initiative || 0,
      dexterity: playerData.dexterity !== undefined ? playerData.dexterity : 10,
      notes: playerData.notes || ''
    };
    
    const player: Player = {
      id: uuidv4(),
      ...defaultData
    };
    players.value.push(player);
    resetForm();
  }

  function updatePlayer(id: string, data: Partial<Omit<Player, 'id'>>) {
    const index = players.value.findIndex(player => player.id === id);
    if (index !== -1) {
      players.value[index] = { ...players.value[index], ...data };
    }
    // If we're updating the player we're currently editing, also update the temp data
    if (editingPlayerId.value === id) {
      tempPlayerData.value = { ...tempPlayerData.value, ...data };
    }
  }

  function updatePlayerInitiative(id: string, initiative: number) {
    updatePlayer(id, { initiative });
  }

  function removePlayer(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      players.value = players.value.filter(player => player.id !== id);
      
      // If we were editing this player, reset the form
      if (editingPlayerId.value === id) {
        resetForm();
      }
    }
  }

  function reorderPlayers(newOrder: Player[]) {
    players.value = newOrder;
  }

  // Editing functions
  function startAddingPlayer() {
    resetForm();
    isAddingPlayer.value = true;
  }
  
  function startEditingPlayer(id: string) {
    const player = players.value.find(p => p.id === id);
    if (player) {
      editingPlayerId.value = id;
      tempPlayerData.value = { ...player };
    }
  }
  
  function cancelEditing() {
    resetForm();
  }
  
  function saveEditedPlayer() {
    if (editingPlayerId.value) {
      updatePlayer(editingPlayerId.value, tempPlayerData.value);
      resetForm();
    }
  }
  
  function resetForm() {
    isAddingPlayer.value = false;
    editingPlayerId.value = null;
    tempPlayerData.value = {
      name: '',
      initiative: 0,
      dexterity: 10,
      notes: ''
    };
  }

  // Utility functions
  function getAbilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }
  
  function getAbilityModifierDisplay(score: number): string {
    const mod = getAbilityModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  return {
    // State
    players,
    isAddingPlayer,
    editingPlayerId,
    tempPlayerData,
    
    // Computed
    isEditingAnyPlayer,
    currentEditingPlayer,
    
    // Actions
    addPlayer,
    updatePlayer,
    updatePlayerInitiative,
    removePlayer,
    reorderPlayers,
    startAddingPlayer,
    startEditingPlayer,
    cancelEditing,
    saveEditedPlayer,
    resetForm,
    
    // Utilities
    getAbilityModifier,
    getAbilityModifierDisplay
  };
});
