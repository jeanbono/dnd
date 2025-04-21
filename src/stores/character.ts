import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Character, CharacterType } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';

export const useCharacterStore = defineStore('character', () => {
  const characters = ref<Character[]>([]);
  const isAddingCharacter = ref(false);
  const addingType = ref<CharacterType | null>(null);
  const editingCharacterId = ref<string | null>(null);
  const expandedCharacters = ref<Record<string, boolean>>({});

  // Ajout d'un personnage
  function addCharacter(character: Omit<Character, 'id'>) {
    const newCharacter: Character = { ...character, id: uuidv4() };
    characters.value.push(newCharacter);
    isAddingCharacter.value = false;
    return newCharacter;
  }

  // Edition d'un personnage
  function updateCharacter(id: string, updates: Partial<Omit<Character, 'id'>>) {
    const idx = characters.value.findIndex(c => c.id === id);
    if (idx !== -1) {
      characters.value[idx] = { ...characters.value[idx], ...updates };
      editingCharacterId.value = null;
    }
  }

  // Suppression d'un personnage
  function removeCharacter(id: string) {
    characters.value = characters.value.filter(c => c.id !== id);
  }

  // Réordonner les personnages d'un type
  function reorderCharacters(newOrder: Character[], type: CharacterType) {
    const others = characters.value.filter(c => c.type !== type);
    characters.value = [...others, ...newOrder];
  }

  // Gestion UI ajout/édition
  function startAddingCharacter(type: CharacterType) {
    isAddingCharacter.value = true;
    addingType.value = type;
  }
  function cancelAddingCharacter() {
    isAddingCharacter.value = false;
    addingType.value = null;
  }
  function startEditingCharacter(id: string) {
    editingCharacterId.value = id;
  }
  function cancelEditingCharacter() {
    editingCharacterId.value = null;
  }

  // Toggle ajout personnage (player/monster)
  function toggleAddingCharacter(type: CharacterType) {
    if (isAddingCharacter.value && addingType.value === type) {
      cancelAddingCharacter();
    } else {
      startAddingCharacter(type);
    }
  }

  // Utilitaires
  function getCharacterById(id: string) {
    return characters.value.find(c => c.id === id);
  }
  function getPlayers() {
    return characters.value.filter(c => c.type === CharacterType.PLAYER);
  }
  function getMonsters() {
    return characters.value.filter(c => c.type === CharacterType.MONSTER);
  }

  // Initiative
  function rollInitiative(id: string) {
    const character = getCharacterById(id);
    if (!character) return null;
    const roll = Math.floor(Math.random() * 20) + 1;
    const modifier = character.dexterity ? Math.floor((character.dexterity - 10) / 2) : 0;
    const total = Math.max(1, roll + modifier);
    updateCharacter(id, { initiative: total });
    return { id, roll, modifier, total };
  }
  function rollAllInitiatives(type?: CharacterType) {
    characters.value.forEach(c => {
      if (!type || c.type === type) {
        rollInitiative(c.id);
      }
    });
  }

  // Gestion des conditions
  function addCondition(characterId: string, condition: any, duration?: number | null, level?: number) {
    const character = getCharacterById(characterId);
    if (character) {
      character.conditions.push({ condition, duration: duration ?? undefined, level });
    }
  }
  function removeCondition(characterId: string, condition: any) {
    const character = getCharacterById(characterId);
    if (character) {
      character.conditions = character.conditions.filter(c => c.condition !== condition);
    }
  }

  function hasCondition(characterId: string, condition: any): boolean {
    const character = getCharacterById(characterId);
    return !!character && character.conditions.some(c => c.condition === condition);
  }

  function clearAllCharactersConditions() {
    characters.value.forEach(c => {
        c.conditions = [];
    });
  }
  function decrementConditionDurations() {
    characters.value.forEach(character => {
      character.conditions.forEach(cond => {
        if (cond.duration !== undefined && cond.duration !== null) {
          cond.duration = Math.max(0, cond.duration - 1);
        }
      });
      character.conditions = character.conditions.filter(cond => cond.duration === undefined || cond.duration > 0);
    });
  }

  // Efface toutes les conditions d'un personnage donné
  function clearAllConditions(characterId: string) {
    const character = getCharacterById(characterId);
    if (character) {
      character.conditions = [];
    }
  }

  // Suppression massive
  function removeAllCharactersOfType(type: CharacterType) {
    characters.value = characters.value.filter(c => c.type !== type);
  }

  // HP/Initiative
  function updateCharacterHp(id: string, change: number) {
    const character = getCharacterById(id);
    if (character) {
      character.hp = Math.max(0, Math.min(character.maxHp, character.hp + change));
    }
  }

  function setCharacters(newCharacters: Character[]) {
    characters.value = newCharacters;
  }

  // Gestion de l'expansion des cartes personnages (pour UI)
  function toggleExpand(characterId: string) {
    expandedCharacters.value[characterId] = !expandedCharacters.value[characterId];
  }
  function isExpanded(characterId: string): boolean {
    return !!expandedCharacters.value[characterId];
  }

  return {
    characters,
    isAddingCharacter,
    addingType,
    editingCharacterId,
    expandedCharacters,
    toggleExpand,
    isExpanded,
    addCharacter,
    updateCharacter,
    removeCharacter,
    reorderCharacters,
    startAddingCharacter,
    cancelAddingCharacter,
    toggleAddingCharacter,
    startEditingCharacter,
    cancelEditingCharacter,
    getCharacterById,
    getPlayers,
    getMonsters,
    rollInitiative,
    rollAllInitiatives,
    addCondition,
    removeCondition,
    hasCondition,
    clearAllConditions,
    clearAllCharactersConditions,
    decrementConditionDurations,
    removeAllCharactersOfType,
    updateCharacterHp,
    setCharacters,
  };
},
{
  persist: {
    pick: [
      'characters',
      'expandedCharacters'
    ]
  }
});
