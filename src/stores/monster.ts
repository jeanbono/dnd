import { defineStore } from 'pinia'
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { calculateAbilityModifier, getAbilityScoreDisplay } from '@/utils/abilityUtils';
import { decrementConditionDuration, Condition } from '@/utils/conditionUtils';
import type { ConditionData } from '@/utils/conditionUtils';

export interface Monster {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  notes: string;
  apiId?: string;
  // Caractéristiques
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  // Conditions/États
  conditions: { condition: ConditionData; duration?: number; level?: number }[];
}

interface MonsterSearchResult {
  index: string;
  name: string;
  url: string;
}

interface MonsterSearchResponse {
  count: number;
  results: MonsterSearchResult[];
}

interface MonsterDetailResponse {
  index: string;
  name: string;
  armor_class: Array<{
    value: number;
    type: string;
  }>;
  hit_points: number;
  challenge_rating: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  special_abilities?: Array<{
    name: string;
    desc: string;
  }>;
  actions?: Array<{
    name: string;
    desc: string;
  }>;
}

export const useMonsterStore = defineStore('monsters', () => {
  // State
  const monsters = ref<Monster[]>([]);
  const searchResults = ref<MonsterSearchResult[]>([]);
  const isSearching = ref(false);
  const searchError = ref<string | null>(null);
  const isAddingMonster = ref(false);
  const editingMonsterId = ref<string | null>(null);
  const showStatsForMonster = ref<Record<string, boolean>>({});
  const expandedMonsters = ref<Record<string, boolean>>({});
  
  // Computed properties
  const isEditingAnyMonster = computed(() => editingMonsterId.value !== null);
  const currentEditingMonster = computed(() => {
    if (!editingMonsterId.value) return null;
    return monsters.value.find(monster => monster.id === editingMonsterId.value) || null;
  });
  
  // Monster management functions
  function addMonster(monsterData: Omit<Monster, 'id'>) {
    // Create default monster data
    const defaultData: Omit<Monster, 'id'> = {
      name: monsterData.name || '',
      initiative: monsterData.initiative || 0,
      hp: monsterData.hp || 10,
      maxHp: monsterData.maxHp || 10,
      ac: monsterData.ac || 10,
      notes: monsterData.notes || '',
      strength: monsterData.strength,
      dexterity: monsterData.dexterity,
      constitution: monsterData.constitution,
      intelligence: monsterData.intelligence,
      wisdom: monsterData.wisdom,
      charisma: monsterData.charisma,
      apiId: monsterData.apiId,
      conditions: monsterData.conditions || []
    };
    
    const monster: Monster = {
      id: uuidv4(),
      ...defaultData
    };
    monsters.value.push(monster);
    isAddingMonster.value = false;
  }
  
  function removeMonster(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce monstre ?')) {
      monsters.value = monsters.value.filter(monster => monster.id !== id);
      
      // Nettoyer les états UI associés
      delete expandedMonsters.value[id];
      delete showStatsForMonster.value[id];
      
      // If we were editing this monster, reset the editing state
      if (editingMonsterId.value === id) {
        editingMonsterId.value = null;
      }
    }
  }
  
  function updateMonster(id: string, updates: Partial<Monster>) {
    const index = monsters.value.findIndex(monster => monster.id === id);
    if (index !== -1) {
      monsters.value[index] = { ...monsters.value[index], ...updates };
    }
  }
  
  function updateMonsterHp(id: string, change: number) {
    const monster = monsters.value.find(m => m.id === id);
    if (monster) {
      monster.hp = Math.max(0, Math.min(monster.maxHp, monster.hp + change));
    }
  }
  
  function reorderMonsters(newOrder: Monster[]) {
    monsters.value = newOrder;
  }
  
  // UI state management
  function toggleExpand(monsterId: string) {
    // Utiliser un objet pour stocker les monstres dépliés
    expandedMonsters.value[monsterId] = !expandedMonsters.value[monsterId];
  }
  
  function isExpanded(monsterId: string): boolean {
    return !!expandedMonsters.value[monsterId];
  }
  
  function toggleStats(monsterId: string) {
    showStatsForMonster.value[monsterId] = !showStatsForMonster.value[monsterId];
  }
  
  function isStatsShown(monsterId: string): boolean {
    return !!showStatsForMonster.value[monsterId];
  }
  
  // Editing functions
  function startAddingMonster() {
    isAddingMonster.value = true;
  }
  
  function cancelAddingMonster() {
    isAddingMonster.value = false;
  }
  
  function startEditingMonster(id: string) {
    editingMonsterId.value = id;
  }
  
  function cancelEditingMonster() {
    editingMonsterId.value = null;
  }
  
  // Toggle adding monster state
  function toggleAddingMonster() {
    isAddingMonster.value = !isAddingMonster.value;
  }
  
  // Roll initiative for a monster based on its dexterity
  function rollInitiative(id: string): { monsterId: string, roll: number, modifier: number, total: number } {
    const monster = monsters.value.find(m => m.id === id);
    if (!monster) return { monsterId: id, roll: 0, modifier: 0, total: 0 };
    
    // Get dexterity modifier
    const dexMod = monster.dexterity ? calculateAbilityModifier(monster.dexterity) : 0;
    
    // Roll d20
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + dexMod;
    
    // Update monster initiative
    updateMonster(id, { initiative: total });
    
    return { monsterId: id, roll, modifier: dexMod, total };
  }
  
  function rollAllInitiatives() {
    const results: { monsterId: string, roll: number, modifier: number, total: number }[] = [];
    monsters.value.forEach(monster => {
      const result = rollInitiative(monster.id);
      results.push(result);
    });
    
    return results;
  }
  
  function getMonsterById(id: string): Monster | undefined {
    return monsters.value.find(monster => monster.id === id);
  }
  
  async function searchMonsters(name: string) {
    if (!name.trim()) {
      searchResults.value = [];
      return;
    }
    
    isSearching.value = true;
    searchError.value = null;
    
    try {
      const response = await fetch(`https://www.dnd5eapi.co/api/monsters/?name=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monsters');
      }
      
      const data: MonsterSearchResponse = await response.json();
      searchResults.value = data.results;
    } catch (error) {
      searchError.value = error instanceof Error ? error.message : 'An unknown error occurred';
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }
  
  async function addMonsterFromApi(url: string) {
    isSearching.value = true;
    searchError.value = null;
    
    try {
      const response = await fetch(`https://www.dnd5eapi.co${url}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monster details');
      }
      
      const data: MonsterDetailResponse = await response.json();
      
      // Extract armor class - use the first one if multiple are available
      const ac = data.armor_class.length > 0 ? data.armor_class[0].value : 10;
      
      // Create a new monster from the API data
      const monster: Omit<Monster, 'id'> = {
        name: data.name,
        initiative: 0, // Will be rolled later
        hp: data.hit_points,
        maxHp: data.hit_points,
        ac,
        notes: createNotesFromApiData(data),
        apiId: data.index,
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
        conditions: []
      };
      
      // Add the monster
      addMonster(monster);
      
      // Automatically roll initiative for the new monster
      const newMonster = monsters.value.find(m => m.name === data.name && m.apiId === data.index);
      if (newMonster) {
        rollInitiative(newMonster.id);
      }
      
      // Clear search results
      searchResults.value = [];
    } catch (error) {
      searchError.value = error instanceof Error ? error.message : 'An unknown error occurred';
    } finally {
      isSearching.value = false;
    }
  }
  
  function createNotesFromApiData(data: MonsterDetailResponse): string {
    let notes = `Challenge Rating: ${data.challenge_rating}\n\n`;
    
    if (data.special_abilities && data.special_abilities.length > 0) {
      notes += "Special Abilities:\n";
      data.special_abilities.forEach(ability => {
        notes += `- ${ability.name}: ${ability.desc}\n`;
      });
      notes += "\n";
    }
    
    if (data.actions && data.actions.length > 0) {
      notes += "Actions:\n";
      data.actions.forEach(action => {
        notes += `- ${action.name}: ${action.desc}\n`;
      });
    }
    
    return notes;
  }

  // Gestion des conditions
  function addCondition(monsterId: string, condition: ConditionData, duration?: number | null) {
    const monster = getMonsterById(monsterId);
    if (!monster) return;
    
    // Vérifier si la condition existe déjà
    const existingConditionIndex = monster.conditions.findIndex(c => c.condition.id === condition.id);
    
    if (existingConditionIndex >= 0) {
      // La condition existe déjà, on ne fait rien
      return;
    }
    
    // Ajouter la nouvelle condition
    monster.conditions.push({
      condition,
      duration: duration && duration > 0 ? duration : undefined
    });
  }
  
  function removeCondition(monsterId: string, condition: ConditionData) {
    const monster = getMonsterById(monsterId);
    if (!monster) return;
    
    monster.conditions = monster.conditions.filter(c => c.condition.id !== condition.id);
  }
  
  function hasCondition(monsterId: string, condition: ConditionData): boolean {
    const monster = getMonsterById(monsterId);
    if (!monster) return false;
    
    return monster.conditions.some(c => c.condition.id === condition.id);
  }
  
  function updateExhaustionLevel(monsterId: string, level: number) {
    const monster = getMonsterById(monsterId);
    if (!monster) return;

    // Vérifier si le monstre a déjà l'épuisement
    const exhaustionIndex = monster.conditions.findIndex(c => c.condition.id === Condition.EXHAUSTION.id);

    if (level <= 0) {
      // Supprimer l'épuisement si le niveau est 0 ou négatif
      if (exhaustionIndex >= 0) {
        monster.conditions.splice(exhaustionIndex, 1);
      }
    } else {
      if (exhaustionIndex >= 0) {
        // Mettre à jour le niveau d'épuisement existant
        monster.conditions[exhaustionIndex].level = level;
      } else {
        // Ajouter une nouvelle condition d'épuisement
        monster.conditions.push({
          condition: Condition.EXHAUSTION,
          level: level
        });
      }
    }
  }
  
  function clearAllConditions(monsterId: string) {
    const monster = getMonsterById(monsterId);
    if (!monster) return;
    
    monster.conditions = [];
  }
  
  function decrementConditionDurations() {
    monsters.value.forEach(monster => {
      // Créer un tableau des conditions à supprimer
      const conditionsToRemove: ConditionData[] = [];
      
      // Vérifier chaque condition
      monster.conditions.forEach(condition => {
        if (decrementConditionDuration(condition)) {
          conditionsToRemove.push(condition.condition);
        }
      });
      
      // Supprimer les conditions expirées
      conditionsToRemove.forEach(condition => {
        removeCondition(monster.id, condition);
      });
    });
  }
  
  // Fonction pour supprimer tous les monstres
  function removeAllMonsters() {
    monsters.value = [];
  }
  
  // Fonction pour supprimer toutes les conditions de tous les monstres
  function clearAllMonstersConditions() {
    monsters.value.forEach(monster => {
      monster.conditions = [];
    });
  }
  
  return {
    // State
    monsters,
    searchResults,
    isSearching,
    searchError,
    isAddingMonster,
    editingMonsterId,
    showStatsForMonster,
    expandedMonsters,
    
    // Computed
    isEditingAnyMonster,
    currentEditingMonster,
    
    // Functions
    addMonster,
    updateMonster,
    updateMonsterHp,
    removeMonster,
    addMonsterFromApi,
    getMonsterById,
    searchMonsters,
    rollInitiative,
    rollAllInitiatives,
    toggleAddingMonster,
    startEditingMonster,
    cancelEditingMonster,
    toggleStats,
    toggleExpand,
    isExpanded,
    isStatsShown,
    reorderMonsters,
    addCondition,
    removeCondition,
    hasCondition,
    updateExhaustionLevel,
    clearAllConditions,
    decrementConditionDurations,
    removeAllMonsters,
    clearAllMonstersConditions,
    createNotesFromApiData,
    getAbilityScoreDisplay,
    startAddingMonster,
    cancelAddingMonster
  };
},
{ 
  persist: {
    pick: [
      'monsters', 
      'expandedMonsters', 
      'showStatsForMonster'
    ]
  } 
});
