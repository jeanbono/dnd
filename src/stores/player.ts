import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { Condition } from '@/utils/conditionUtils';
import type { ConditionData } from '@/utils/conditionUtils';

export interface Player {
  id: string;
  name: string;
  initiative: number;
  hp?: number;
  maxHp?: number;
  ac: number;
  dexterity: number;
  strength?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  notes: string;
  conditions: { condition: ConditionData; level?: number; duration?: number }[];
}

export const usePlayerStore = defineStore('player', () => {
  const players = ref<Player[]>([]);
  const isAddingPlayer = ref(false);
  const editingPlayerId = ref<string | null>(null);
  const expandedPlayers = ref<Record<string, boolean>>({});

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
      hp: playerData.hp,
      maxHp: playerData.maxHp,
      ac: playerData.ac !== undefined ? playerData.ac : 10,
      dexterity: playerData.dexterity || 10,
      strength: playerData.strength,
      constitution: playerData.constitution,
      intelligence: playerData.intelligence,
      wisdom: playerData.wisdom,
      charisma: playerData.charisma,
      notes: playerData.notes || '',
      conditions: playerData.conditions || []
    };

    const newPlayer: Player = {
      id: uuidv4(),
      ...defaultData
    };

    players.value.push(newPlayer);
    isAddingPlayer.value = false;
    return newPlayer;
  }

  function updatePlayer(playerId: string, playerData: Partial<Omit<Player, 'id'>>) {
    const playerIndex = players.value.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      // Mettre à jour seulement les champs fournis
      const updatedPlayer = {
        ...players.value[playerIndex],
        ...playerData
      };
      
      players.value[playerIndex] = updatedPlayer;
      editingPlayerId.value = null;
    }
  }

  function updatePlayerHp(id: string, change: number) {
    const player = players.value.find(p => p.id === id);
    if (player && player.hp !== undefined && player.maxHp !== undefined) {
      player.hp = Math.max(0, Math.min(player.maxHp, player.hp + change));
    }
  }

  function updatePlayerInitiative(id: string, initiative: number) {
    updatePlayer(id, { initiative });
  }

  function removePlayer(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      players.value = players.value.filter(player => player.id !== id);
      delete expandedPlayers.value[id];

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
  function addCondition(playerId: string, condition: ConditionData, duration?: number | null, level?: number) {
    const player = getPlayerById(playerId);
    if (!player) return;

    // Vérifier si la condition existe déjà
    const existingConditionIndex = player.conditions.findIndex(c => c.condition.id === condition.id);

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
      level: condition === Condition.EXHAUSTION ? level || 1 : undefined,
      duration: condition !== Condition.EXHAUSTION && duration && duration > 0 ? duration : undefined
    });
  }

  function removeCondition(playerId: string, condition: ConditionData) {
    const player = getPlayerById(playerId);
    if (!player) return;

    player.conditions = player.conditions.filter(c => c.condition.id !== condition.id);
  }

  function updateExhaustionLevel(playerId: string, level: number) {
    const player = getPlayerById(playerId);
    if (!player) return;

    // Vérifier si le joueur a déjà l'épuisement
    const exhaustionIndex = player.conditions.findIndex(c => c.condition.id === Condition.EXHAUSTION.id);

    if (level <= 0) {
      // Supprimer l'épuisement si le niveau est 0 ou négatif
      if (exhaustionIndex >= 0) {
        player.conditions.splice(exhaustionIndex, 1);
      }
    } else {
      if (exhaustionIndex >= 0) {
        // Mettre à jour le niveau d'épuisement existant
        player.conditions[exhaustionIndex].level = level;
      } else {
        // Ajouter une nouvelle condition d'épuisement
        player.conditions.push({
          condition: Condition.EXHAUSTION,
          level: level
        });
      }
    }
  }

  function hasCondition(playerId: string, condition: ConditionData): boolean {
    const player = getPlayerById(playerId);
    if (!player) return false;

    return player.conditions.some(c => c.condition.id === condition.id);
  }

  function getExhaustionLevelForPlayer(playerId: string): number {
    const player = getPlayerById(playerId);
    if (!player) return 0;

    const exhaustionCondition = player.conditions.find(c => c.condition.id === Condition.EXHAUSTION.id);
    return exhaustionCondition?.level || 0;
  }

  function clearAllConditions(playerId: string) {
    const player = getPlayerById(playerId);
    if (!player) return;

    player.conditions = [];
  }

  function decrementConditionDurations() {
    players.value.forEach(player => {
      // Créer un tableau des conditions à supprimer
      const conditionsToRemove: ConditionData[] = [];

      // Vérifier chaque condition
      player.conditions.forEach(condition => {
        if (condition.duration && condition.duration > 0) {
          condition.duration--;
          if (condition.duration <= 0) {
            conditionsToRemove.push(condition.condition);
          }
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

  // Gestion de l'expansion des joueurs
  function toggleExpand(playerId: string) {
    expandedPlayers.value[playerId] = !expandedPlayers.value[playerId];

  }

  function isExpanded(playerId: string): boolean {
    return !!expandedPlayers.value[playerId];
  }

  return {
    // State
    players,
    isAddingPlayer,
    editingPlayerId,
    expandedPlayers,

    // Computed
    isEditingAnyPlayer,
    currentEditingPlayer,

    // Functions
    addPlayer,
    updatePlayer,
    updatePlayerHp,
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
    decrementConditionDurations,

    // Expansion
    toggleExpand,
    isExpanded
  };
},
{
  persist: {
    pick: [
      'players',
      'expandedPlayers'
    ],
  }
});
