import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { Condition, getExhaustionLevel, decrementConditionDuration } from '@/utils/conditionUtils';
import type { ConditionWithLevel } from '@/utils/conditionUtils';

export interface Player {
  id: string;
  name: string;
  initiative: number;
  dexterity: number;
  notes?: string;
  // Conditions/États
  conditions: ConditionWithLevel[];
}

export const usePlayerStore = defineStore('player', () => {
  const players = ref<Player[]>([]);
  const isAddingPlayer = ref(false);
  const editingPlayerId = ref<string | null>(null);
  
  // Computed properties
  const isEditingAnyPlayer = computed(() => editingPlayerId.value !== null);
  const currentEditingPlayer = computed(() => {
    if (!editingPlayerId.value) return null;
    return players.value.find(player => player.id === editingPlayerId.value) || null;
  });

  // Player management functions
  function addPlayer(playerData: Omit<Player, 'id'>) {
    // Create default player data
    const defaultData: Omit<Player, 'id'> = {
      name: playerData.name || '',
      initiative: playerData.initiative || 0,
      dexterity: playerData.dexterity !== undefined ? playerData.dexterity : 10,
      notes: playerData.notes || '',
      conditions: playerData.conditions || []
    };
    
    const player: Player = {
      id: uuidv4(),
      ...defaultData
    };
    players.value.push(player);
    isAddingPlayer.value = false;
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
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      players.value = players.value.filter(player => player.id !== id);
      
      // If we were editing this player, reset the editing state
      if (editingPlayerId.value === id) {
        editingPlayerId.value = null;
      }
    }
  }

  function reorderPlayers(newOrder: Player[]) {
    players.value = newOrder;
  }

  function getPlayerById(id: string): Player | undefined {
    return players.value.find(player => player.id === id);
  }

  // UI state management
  function startAddingPlayer() {
    isAddingPlayer.value = true;
  }
  
  function cancelAddingPlayer() {
    isAddingPlayer.value = false;
  }
  
  function startEditingPlayer(id: string) {
    editingPlayerId.value = id;
  }
  
  function cancelEditingPlayer() {
    editingPlayerId.value = null;
  }

  // Utility functions
  function getAbilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }
  
  function getAbilityModifierDisplay(score: number): string {
    const mod = getAbilityModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  // Gestion des conditions
  function addCondition(playerId: string, condition: Condition, duration?: number | null, level?: number) {
    const player = getPlayerById(playerId);
    if (!player) return;
    
    // Vérifier si la condition existe déjà
    const existingConditionIndex = player.conditions.findIndex(c => c.condition === condition);
    
    if (existingConditionIndex >= 0) {
      // Si c'est l'épuisement, on incrémente le niveau
      if (condition === Condition.EXHAUSTION && level) {
        player.conditions[existingConditionIndex].level = level;
      }
      // Sinon, la condition existe déjà, on ne fait rien
      return;
    }
    
    // Ajouter la nouvelle condition
    player.conditions.push({
      condition,
      level: condition === Condition.EXHAUSTION ? (level || 1) : undefined,
      duration: condition !== Condition.EXHAUSTION && duration && duration > 0 ? duration : undefined
    });
  }
  
  function removeCondition(playerId: string, condition: Condition) {
    const player = getPlayerById(playerId);
    if (!player) return;
    
    player.conditions = player.conditions.filter(c => c.condition !== condition);
  }
  
  function updateExhaustionLevel(playerId: string, level: number) {
    const player = getPlayerById(playerId);
    if (!player) return;
    
    // Vérifier si le joueur a déjà l'épuisement
    const exhaustionIndex = player.conditions.findIndex(c => c.condition === Condition.EXHAUSTION);
    
    if (level <= 0) {
      // Supprimer l'épuisement si le niveau est 0 ou négatif
      if (exhaustionIndex >= 0) {
        player.conditions.splice(exhaustionIndex, 1);
      }
    } else if (level > 6) {
      // Limiter à 6 maximum (mort)
      if (exhaustionIndex >= 0) {
        player.conditions[exhaustionIndex].level = 6;
      } else {
        player.conditions.push({ condition: Condition.EXHAUSTION, level: 6 });
      }
    } else {
      // Mettre à jour ou ajouter l'épuisement
      if (exhaustionIndex >= 0) {
        player.conditions[exhaustionIndex].level = level;
      } else {
        player.conditions.push({ condition: Condition.EXHAUSTION, level });
      }
    }
  }
  
  function hasCondition(playerId: string, condition: Condition): boolean {
    const player = getPlayerById(playerId);
    if (!player) return false;
    
    return player.conditions.some(c => c.condition === condition);
  }
  
  function getExhaustionLevelForPlayer(playerId: string): number {
    const player = getPlayerById(playerId);
    if (!player) return 0;
    
    return getExhaustionLevel(player.conditions);
  }
  
  function clearAllConditions(playerId: string) {
    const player = getPlayerById(playerId);
    if (!player) return;
    
    player.conditions = [];
  }

  function decrementConditionDurations() {
    players.value.forEach(player => {
      // Créer un tableau des conditions à supprimer
      const conditionsToRemove: Condition[] = [];
      
      // Vérifier chaque condition
      player.conditions.forEach(condition => {
        if (decrementConditionDuration(condition)) {
          conditionsToRemove.push(condition.condition);
        }
      });
      
      // Supprimer les conditions expirées
      conditionsToRemove.forEach(condition => {
        removeCondition(player.id, condition);
      });
    });
  }

  function clearAllPlayersConditions() {
    players.value.forEach(player => {
      player.conditions = [];
    });
  }

  return {
    // State
    players,
    isAddingPlayer,
    editingPlayerId,
    
    // Computed
    isEditingAnyPlayer,
    currentEditingPlayer,
    
    // Functions
    addPlayer,
    updatePlayer,
    updatePlayerInitiative,
    removePlayer,
    reorderPlayers,
    getPlayerById,
    startAddingPlayer,
    cancelAddingPlayer,
    startEditingPlayer,
    cancelEditingPlayer,
    getAbilityModifier,
    getAbilityModifierDisplay,
    
    // Conditions
    addCondition,
    removeCondition,
    updateExhaustionLevel,
    hasCondition,
    getExhaustionLevelForPlayer,
    clearAllConditions,
    clearAllPlayersConditions,
    decrementConditionDurations
  };
},
{ persist: true });
