import { defineStore } from 'pinia'
import { ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export interface Monster {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  notes: string;
  apiId?: string;
  // D&D Stats
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
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
  // Load monsters from localStorage if available
  const savedMonsters = localStorage.getItem('dnd-combat-tracker-monsters');
  const initialMonsters = savedMonsters ? JSON.parse(savedMonsters) : [];
  
  const monsters = ref<Monster[]>(initialMonsters);
  const searchResults = ref<MonsterSearchResult[]>([]);
  const isSearching = ref(false);
  const searchError = ref<string | null>(null);
  
  // Watch for changes to monsters and save to localStorage
  watch(monsters, (newMonsters) => {
    localStorage.setItem('dnd-combat-tracker-monsters', JSON.stringify(newMonsters));
  }, { deep: true });

  function addMonster(monsterData: Omit<Monster, 'id'>) {
    // Create default monster data with ability scores set to 10
    const defaultData: Partial<Monster> = {
      name: monsterData.name || '',
      initiative: monsterData.initiative || 0,
      hp: monsterData.hp || 0,
      maxHp: monsterData.maxHp || 0,
      ac: monsterData.ac || 0,
      notes: monsterData.notes || '',
      strength: monsterData.strength !== undefined ? monsterData.strength : 10,
      dexterity: monsterData.dexterity !== undefined ? monsterData.dexterity : 10,
      constitution: monsterData.constitution !== undefined ? monsterData.constitution : 10,
      intelligence: monsterData.intelligence !== undefined ? monsterData.intelligence : 10,
      wisdom: monsterData.wisdom !== undefined ? monsterData.wisdom : 10,
      charisma: monsterData.charisma !== undefined ? monsterData.charisma : 10,
      apiId: monsterData.apiId
    };
    
    const monster: Monster = {
      id: uuidv4(),
      ...defaultData as Omit<Monster, 'id'>
    };
    monsters.value.push(monster);
  }
  
  function removeMonster(id: string) {
    const index = monsters.value.findIndex(monster => monster.id === id);
    if (index !== -1) {
      monsters.value.splice(index, 1);
    }
  }
  
  function updateMonster(id: string, updates: Partial<Monster>) {
    const monster = monsters.value.find(m => m.id === id);
    if (monster) {
      Object.assign(monster, updates);
    }
  }
  
  function reorderMonsters(newOrder: Monster[]) {
    monsters.value = newOrder;
  }
  
  // Calculate ability score modifier according to D&D 5e rules
  function calculateAbilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }
  
  // Get formatted ability score display
  function getAbilityScoreDisplay(score?: number): string {
    if (!score) return '—';
    const modifier = calculateAbilityModifier(score);
    const sign = modifier >= 0 ? '+' : '';
    return `${score} (${sign}${modifier})`;
  }
  
  // Roll initiative for a monster based on its dexterity
  function rollInitiative(id: string) {
    const monster = monsters.value.find(m => m.id === id);
    if (monster) {
      // Roll d20
      const d20Roll = Math.floor(Math.random() * 20) + 1;
      
      // Calculate dexterity modifier
      const dexMod = monster.dexterity ? calculateAbilityModifier(monster.dexterity) : 0;
      
      // Set initiative to d20 roll + dex modifier
      const initiative = d20Roll + dexMod;
      updateMonster(id, { initiative });
      
      return { roll: d20Roll, modifier: dexMod, total: initiative };
    }
    return null;
  }
  
  async function searchMonsters(name: string) {
    if (!name.trim()) {
      searchResults.value = [];
      return;
    }
    
    isSearching.value = true;
    searchError.value = null;
    
    try {
      const response = await fetch(`https://www.dnd5eapi.co/api/2014/monsters?name=${encodeURIComponent(name)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data: MonsterSearchResponse = await response.json();
      searchResults.value = data.results;
    } catch (error) {
      console.error('Error searching monsters:', error);
      searchError.value = error instanceof Error ? error.message : 'Unknown error occurred';
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }
  
  async function addMonsterFromApi(url: string) {
    try {
      const response = await fetch(`https://www.dnd5eapi.co${url}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data: MonsterDetailResponse = await response.json();
      
      // Extract AC (armor class) from the response
      const ac = data.armor_class && data.armor_class.length > 0 
        ? data.armor_class[0].value 
        : 10;
      
      // Extract special abilities and actions as notes
      const specialAbilities = data.special_abilities 
        ? data.special_abilities.map(ability => `${ability.name}: ${ability.desc}`).join('\n\n') 
        : '';
        
      const actions = data.actions 
        ? data.actions.map(action => `${action.name}: ${action.desc}`).join('\n\n') 
        : '';
        
      const notes = [
        `Challenge Rating: ${data.challenge_rating}`,
        specialAbilities ? `Special Abilities:\n${specialAbilities}` : '',
        actions ? `Actions:\n${actions}` : ''
      ].filter(Boolean).join('\n\n');
      
      // Add the monster to the store
      const newMonster = {
        name: data.name,
        initiative: 0, // Will be rolled separately
        hp: data.hit_points,
        maxHp: data.hit_points,
        ac,
        notes,
        apiId: data.index,
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma
      };
      
      addMonster(newMonster);
      
      // Roll initiative for the newly added monster
      const monsterId = monsters.value[monsters.value.length - 1].id;
      rollInitiative(monsterId);
      
      return true;
    } catch (error) {
      console.error('Error adding monster from API:', error);
      return false;
    }
  }

  return {
    monsters,
    searchResults,
    isSearching,
    searchError,
    addMonster,
    removeMonster,
    updateMonster,
    reorderMonsters,
    calculateAbilityModifier,
    getAbilityScoreDisplay,
    rollInitiative,
    searchMonsters,
    addMonsterFromApi
  };
});
