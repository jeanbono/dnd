import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Character, CharacterType, type CharacterGroup } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import { calculateAbilityModifier } from '@/utils/abilityUtils';

export const useCharacterStore = defineStore('character', () => {
  const characters = ref<Character[]>([]);
  const groups = ref<CharacterGroup[]>([]);
  // Ordre des éléments dans les listes
  const playerOrder = ref<string[]>([]);
  const monsterOrder = ref<string[]>([]);
  const isAddingCharacter = ref(false);
  const addingType = ref<CharacterType | null>(null);
  const editingCharacterId = ref<string | null>(null);
  const editingGroupId = ref<string | null>(null);
  const expandedCharacters = ref<Record<string, boolean>>({});
  const expandedGroups = ref<Record<string, boolean>>({});

  // Ajout d'un personnage
  function addCharacter(character: Omit<Character, 'id'>) {
    const newCharacter: Character = { ...character, id: uuidv4() };
    characters.value.push(newCharacter);
    
    // Ajouter l'ID du nouveau personnage à l'ordre correspondant
    if (character.type === CharacterType.PLAYER) {
      playerOrder.value.push(newCharacter.id);
    } else {
      monsterOrder.value.push(newCharacter.id);
    }
    
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
    // Retirer le personnage de son groupe s'il en a un
    const character = getCharacterById(id);
    const characterGroup = getCharacterGroup(id);
    if (character && characterGroup) {
      characterGroup.characterIds = characterGroup.characterIds.filter(cId => cId !== id);
    }
    
    // Retirer le personnage de l'ordre correspondant
    if (character?.type === CharacterType.PLAYER) {
      playerOrder.value = playerOrder.value.filter(itemId => itemId !== id);
    } else if (character?.type === CharacterType.MONSTER) {
      monsterOrder.value = monsterOrder.value.filter(itemId => itemId !== id);
    }
    
    characters.value = characters.value.filter(c => c.id !== id);
  }

  // Dupliquer un character
  function duplicateCharacter(id: string) {
    console.log("duplicateCharacter", id)
    const character = getCharacterById(id);
    if (!character) return null;
    const newCharacter = { ...character, id: uuidv4() };
    characters.value.push(newCharacter);

    // Ajouter l'ID du nouveau personnage à l'ordre correspondant
    const characterGroup = getCharacterGroup(id)
    if (characterGroup) {
      // Ajouter le character au groupe en dessous de la position du character original
      const characterIdx = characterGroup.characterIds.indexOf(id);
      console.log(characterIdx)
      if (characterIdx !== -1) {
        characterGroup.characterIds.splice(characterIdx + 1, 0, newCharacter.id);
      }
    } else {
        const characterIdx = character.type === CharacterType.PLAYER ? playerOrder.value.indexOf(id) : monsterOrder.value.indexOf(id);
        if (characterIdx !== -1) {
          character.type === CharacterType.PLAYER ? playerOrder.value.splice(characterIdx + 1, 0, newCharacter.id) : monsterOrder.value.splice(characterIdx + 1, 0, newCharacter.id);
        }
    }
    return newCharacter;
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

  // Initiative
  function rollInitiative(id: string) {
    const character = getCharacterById(id);
    if (!character) return null;
    const roll = Math.floor(Math.random() * 20) + 1;
    const modifier = character.dexterity ? calculateAbilityModifier(character.dexterity) : 0;
    const total = Math.max(1, roll + modifier);
    updateCharacter(id, { initiative: total });
    return { id, roll, modifier, total };
  }
  function rollAllInitiatives(type?: CharacterType) {
    // 1. Tirer l'initiative pour chaque groupe du type
    groups.value.forEach(group => {
      if (!type || group.type === type) {
        // Calculer le bonus d'initiative max du groupe
        const members = group.characterIds
          .map(id => getCharacterById(id))
          .filter(c => !!c);
        if (members.length > 0) {
          const maxDex = Math.max(...members.map(c => c.dexterity ? calculateAbilityModifier(c.dexterity) : 0));
          const roll = Math.floor(Math.random() * 20) + 1;
          const total = roll + maxDex;
          // Appliquer à tous les membres
          members.forEach(c => updateCharacterInitiative(c.id, total));
          // Mettre à jour l'initiative du groupe
          group.initiative = total;
        }
      }
    });
    // 2. Tirer l'initiative pour chaque personnage non groupé du type
    characters.value.forEach(c => {
      if ((!type || c.type === type) && !getCharacterGroup(c.id)) {
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
    // Supprimer tous les groupes du type spécifié
    groups.value = groups.value.filter(g => g.type !== type);
    // Supprimer tous les personnages du type spécifié
    characters.value = characters.value.filter(c => c.type !== type);
    
    // Réinitialiser l'ordre
    if (type === CharacterType.PLAYER) {
      playerOrder.value = [];
    } else {
      monsterOrder.value = [];
    }
  }

  // HP/Initiative
  function updateCharacterHp(id: string, change: number) {
    const character = getCharacterById(id);
    if (!character) return;
    const previousHp = character.hp || 0;
    character.hp = Math.max(0, previousHp + change);
    // Si le personnage vient de tomber à 0hp (et n'est pas mort), reset les death saves et isStable
    if (previousHp > 0 && character.hp === 0 && !character.isDead) {
      character.deathSavesSuccess = 0;
      character.deathSavesFail = 0;
      character.isStable = false;
    }
    // Si le personnage est soigné alors qu'il faisait des jets contre la mort (mais pas mort), reset aussi
    if (character.hp > 0 && !character.isDead && (character.deathSavesSuccess || character.deathSavesFail)) {
      character.deathSavesSuccess = 0;
      character.deathSavesFail = 0;
      character.isStable = false;
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
  
  // Gestion des groupes de personnages
  
  // Créer un nouveau groupe
  function createGroup(name: string, type: CharacterType, characterIds: string[] = [], initiative: number = 0) {
    const groupId = uuidv4();
    const newGroup: CharacterGroup = {
      id: groupId,
      name,
      initiative,
      type,
      characterIds: [...characterIds]
    };
    
    groups.value.push(newGroup);

    // Ajouter le groupe à l'ordre correspondant et suppression des characters
    if (type === CharacterType.PLAYER) {
      playerOrder.value = [
        ...playerOrder.value.filter(itemId => !characterIds.includes(itemId)),
        groupId
      ];
    } else {
      monsterOrder.value = [
        ...monsterOrder.value.filter(itemId => !characterIds.includes(itemId)),
        groupId
      ];
    }
    
    return newGroup;
  }
  
  // Mettre à jour un groupe
  function updateGroup(id: string, updates: Partial<Omit<CharacterGroup, 'id'>>) {
    const idx = groups.value.findIndex(g => g.id === id);
    if (idx !== -1) {
      groups.value[idx] = { ...groups.value[idx], ...updates };
      editingGroupId.value = null;
    }
  }
  
  // Supprimer un groupe
  function removeGroup(id: string) {
    const group = getGroupById(id);
    if (group) {
      // Remettre les personnages du groupe dans l'ordre correspondant
      const orderArr = group.type === CharacterType.PLAYER ? playerOrder.value : monsterOrder.value;
      // Ajoute les membres du groupe juste après la position du groupe dans l'ordre
      const groupIdx = orderArr.indexOf(id);
      if (groupIdx !== -1) {
        // Retirer le groupe de l'ordre
        orderArr.splice(groupIdx, 1, ...group.characterIds);
      } else {
        // Si le groupe n'est pas dans l'ordre, ajoute à la fin
        orderArr.push(...group.characterIds);
      }

      // Supprimer le groupe
      groups.value = groups.value.filter(g => g.id !== id);
    }
  }
  
  // Mettre à jour l'initiative d'un groupe en fonction de ses membres
  function updateGroupInitiative(groupId: string) {
    const group = getGroupById(groupId);
    if (!group || group.characterIds.length === 0) return;

    // Récupérer toutes les initiatives des membres valides
    const initiatives = group.characterIds
      .map(id => {
        const c = getCharacterById(id);
        return c?.initiative ?? 0;
      });

    if (initiatives.length === 0) return;
    const highestInitiative = Math.max(...initiatives);
    if (group.initiative !== highestInitiative) {
      group.initiative = highestInitiative;
    }
  }
  
  // Obtenir un groupe par son ID
  function getGroupById(id: string) {
    return groups.value.find(g => g.id === id);
  }
  
  // Obtenir tous les groupes d'un type
  function getGroupsByType(type: CharacterType) {
    return groups.value.filter(g => g.type === type);
  }
  
  // Obtenir les personnages d'un groupe
  function getCharactersByGroupId(groupId: string) {
    const group = getGroupById(groupId);
    if (!group) return [];
    
    // Récupérer les personnages dans l'ordre défini par characterIds
    return group.characterIds
      .map(id => getCharacterById(id))
      .filter((character): character is Character => character !== undefined);
  }

  function getCharacterGroup(characterId: string): CharacterGroup | undefined {
    return groups.value.find(g => g.characterIds.includes(characterId));
  }
  
  // Gestion de l'expansion des groupes
  function toggleExpandGroup(groupId: string) {
    expandedGroups.value[groupId] = !expandedGroups.value[groupId];
  }
  
  function isGroupExpanded(groupId: string): boolean {
    return !!expandedGroups.value[groupId];
  }

  // Update the initiative for a character by ID
  function updateCharacterInitiative(id: string, initiative: number) {
    updateCharacter(id, { initiative });
    // Si le personnage appartient à un groupe, mettre à jour l'initiative du groupe
    const character = getCharacterById(id);
    if (character) {
      const characterGroup = getCharacterGroup(character.id);
      if (characterGroup) {
        updateGroupInitiative(characterGroup.id);
      }
    }
  }

  // Gestion des jets contre la mort (death saves)
  function addDeathSave(id: string, isSuccess: boolean) {
    const character = getCharacterById(id);
    if (!character || character.isDead || character.isStable) return;
    if (isSuccess) {
      character.deathSavesSuccess = (character.deathSavesSuccess || 0) + 1;
      if (character.deathSavesSuccess >= 3) {
        character.isStable = true;
        character.deathSavesFail = 0;
      }
    } else {
      character.deathSavesFail = (character.deathSavesFail || 0) + 1;
      if (character.deathSavesFail >= 3) {
        character.isDead = true;
        character.deathSavesSuccess = 0;
      }
    }
  }

  return {
    characters,
    groups,
    playerOrder,
    monsterOrder,
    isAddingCharacter,
    addingType,
    editingCharacterId,
    editingGroupId,
    expandedCharacters,
    expandedGroups,
    toggleExpand,
    isExpanded,
    toggleExpandGroup,
    isGroupExpanded,
    addCharacter,
    updateCharacter,
    removeCharacter,
    duplicateCharacter,
    startAddingCharacter,
    cancelAddingCharacter,
    toggleAddingCharacter,
    startEditingCharacter,
    cancelEditingCharacter,
    getCharacterById,
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
    // Fonctions de gestion des groupes
    createGroup,
    updateGroup,
    removeGroup,
    updateGroupInitiative,
    getGroupById,
    getGroupsByType,
    getCharactersByGroupId,
    getCharacterGroup,
    updateCharacterInitiative,
    addDeathSave,
  };
},
{
  persist: {
    pick: [
      'characters',
      'groups',
      'playerOrder',
      'monsterOrder',
      'expandedCharacters',
      'expandedGroups'
    ]
  }
});
