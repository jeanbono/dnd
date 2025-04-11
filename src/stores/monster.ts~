import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { calculateAbilityModifier, getAbilityScoreDisplay } from '../utils/abilityUtils';

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
  
  // Load expanded monsters from localStorage if available
  const savedExpandedMonsters = localStorage.getItem('dnd-combat-tracker-expanded-monsters');
  const initialExpandedMonsters = savedExpandedMonsters ? JSON.parse(savedExpandedMonsters) : [];
  
  // State
  const monsters = ref<Monster[]>(initialMonsters);
  const searchResults = ref<MonsterSearchResult[]>([]);
  const isSearching = ref(false);
  const searchError = ref<string | null>(null);
  const isAddingMonster = ref(false);
  const editingMonsterId = ref<string | null>(null);
  const showStatsForMonster = ref<Record<string, boolean>>({});
  // Gérer les monstres ouverts plutôt que repliés (initialiser avec les valeurs sauvegardées)
  const expandedMonsters = ref<Set<string>>(new Set(initialExpandedMonsters));
  const rollResult = ref<{ monsterId: string, roll: number, modifier: number, total: number } | null>(null);
  
  // Computed properties
  const isEditingAnyMonster = computed(() => editingMonsterId.value !== null);
  const currentEditingMonster = computed(() => {
    if (!editingMonsterId.value) return null;
    return monsters.value.find(monster => monster.id === editingMonsterId.value) || null;
  });
  
  // Watch for changes to monsters and save to localStorage
  watch(monsters, (newMonsters) => {
    localStorage.setItem('dnd-combat-tracker-monsters', JSON.stringify(newMonsters));
  }, { deep: true });

  // Watch for changes to expanded monsters and save to localStorage
  watch(expandedMonsters, (newExpandedMonsters) => {
    localStorage.setItem('dnd-combat-tracker-expanded-monsters', JSON.stringify([...newExpandedMonsters]));
  });

  // Monster management functions
  function addMonster(monsterData: Omit<Monster, 'id'>) {
    // Create default monster data
    const defaultData: Omit<Monster, 'id'> = {
      name: monsterData.name || '',
      initiative: monsterData.initiative || 0,
      hp: monsterData.hp || 0,
      maxHp: monsterData.maxHp || 0,
      ac: monsterData.ac || 0,
      notes: monsterData.notes || '',
      strength: monsterData.strength,
      dexterity: monsterData.dexterity,
      constitution: monsterData.constitution,
      intelligence: monsterData.intelligence,
      wisdom: monsterData.wisdom,
      charisma: monsterData.charisma
    };
    
    const monster: Monster = {
      id: uuidv4(),
      ...defaultData
    };
    monsters.value.push(monster);
    
    // Par défaut, les nouveaux monstres sont repliés (pas besoin d'ajouter à expandedMonsters)
    
    isAddingMonster.value = false;
  }
  
  function removeMonster(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce monstre ?')) {
      monsters.value = monsters.value.filter(monster => monster.id !== id);
      
      // Nettoyer les états UI associés
      expandedMonsters.value.delete(id);
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
    if (expandedMonsters.value.has(monsterId)) {
      expandedMonsters.value.delete(monsterId);
    } else {
      expandedMonsters.value.add(monsterId);
    }
    
    // Sauvegarder immédiatement l'état d'expansion dans le localStorage
    localStorage.setItem('dnd-combat-tracker-expanded-monsters', JSON.stringify([...expandedMonsters.value]));
  }
  
  function isExpanded(monsterId: string): boolean {
    return expandedMonsters.value.has(monsterId);
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
  
  // Roll initiative for a monster based on its dexterity
  function rollInitiative(id: string) {
    const monster = monsters.value.find(m => m.id === id);
    if (!monster) return;
    
    // Get dexterity modifier
    const dexMod = monster.dexterity ? calculateAbilityModifier(monster.dexterity) : 0;
    
    // Roll d20
    const roll = Math.floor(Math.random() * 20) + 1;
    
    // Calculate total
    const total = roll + dexMod;
    
    // Update monster initiative
    updateMonster(id, { initiative: total });
    
    // Store roll result for display
    rollResult.value = {
      monsterId: id,
      roll,
      modifier: dexMod,
      total
    };
    
    // Clear roll result after 3 seconds
    setTimeout(() => {
      if (rollResult.value?.monsterId === id) {
        rollResult.value = null;
      }
    }, 3000);
  }
  
  function rollAllInitiatives() {
    monsters.value.forEach(monster => {
      rollInitiative(monster.id);
    });
  }
  
  function toggleAddingMonster() {
    isAddingMonster.value = !isAddingMonster.value;
    if (!isAddingMonster.value) {
      // Si on ferme le formulaire d'ajout, réinitialiser l'état d'édition
      editingMonsterId.value = null;
    }
  }
  
  function addMonsterFromTemp() {
    // Cette fonction n'est plus nécessaire car nous n'utilisons plus tempMonsterData
    // Elle est conservée pour compatibilité mais devrait être remplacée par addMonster
    console.warn('addMonsterFromTemp is deprecated, use addMonster instead');
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
        charisma: data.charisma
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
    rollResult,
    
    // Computed
    isEditingAnyMonster,
    currentEditingMonster,
    
    // Actions
    addMonster,
    removeMonster,
    updateMonster,
    updateMonsterHp,
    reorderMonsters,
    toggleExpand,
    isExpanded,
    toggleStats,
    isStatsShown,
    startAddingMonster,
    cancelAddingMonster,
    startEditingMonster,
    cancelEditingMonster,
    rollInitiative,
    rollAllInitiatives,
    toggleAddingMonster,
    addMonsterFromTemp,
    getMonsterById,
    searchMonsters,
    addMonsterFromApi,
    createNotesFromApiData,
    getAbilityScoreDisplay
  };
});
