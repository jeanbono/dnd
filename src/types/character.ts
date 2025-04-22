export enum CharacterType {
  PLAYER = 'player',
  MONSTER = 'monster',
}

export interface Character {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac?: number;
  notes?: string;
  // Caractéristiques principales
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  // Conditions/États
  conditions: { condition: any; duration?: number; level?: number }[];
  // Type (joueur/monstre)
  type: CharacterType;
  deathSavesSuccess?: number;
  deathSavesFail?: number;
  isStable?: boolean;
  isDead?: boolean;
}

export interface CharacterGroup {
  id: string;
  name: string;
  initiative: number;
  type: CharacterType;
  characterIds: string[];
}
