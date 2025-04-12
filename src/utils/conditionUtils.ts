/**
 * Utilitaires pour la gestion des conditions/états des créatures
 */

/**
 * Interface pour une condition avec ses propriétés
 */
export interface ConditionData {
  id: string;
  label: string;
  effects?: string[]; // Liste des effets de la condition
}

/**
 * Énumération des différentes conditions possibles avec leurs libellés et effets
 */
export const Condition: Record<string, ConditionData> = {
  BLINDED: { 
    id: 'blinded', 
    label: 'Aveuglé',
    effects: [
      'Échec automatique aux tests de caractéristique basés sur la vue',
      'Désavantage aux jets d\'attaque',
      'Les attaques contre la créature ont un avantage'
    ]
  },
  CHARMED: { 
    id: 'charmed', 
    label: 'Charmé',
    effects: [
      'La créature ne peut pas attaquer celui qui l\'a charmée',
      'Celui qui a charmé la créature a un avantage aux tests de caractéristique sociaux contre elle'
    ]
  },
  DEAFENED: { 
    id: 'deafened', 
    label: 'Assourdi',
    effects: [
      'Échec automatique aux tests de caractéristique basés sur l\'ouïe'
    ]
  },
  EXHAUSTION: { 
    id: 'exhaustion', 
    label: 'Épuisement',
    // Les effets de l'épuisement sont gérés séparément via getExhaustionEffects
  },
  FRIGHTENED: { 
    id: 'frightened', 
    label: 'Effrayé',
    effects: [
      'Désavantage aux tests de caractéristique et jets d\'attaque tant que la source de la peur est visible',
      'Ne peut pas se rapprocher volontairement de la source de sa peur'
    ]
  },
  GRAPPLED: { 
    id: 'grappled', 
    label: 'Agrippé',
    effects: [
      'Vitesse réduite à 0',
      'Fin de l\'état si celui qui agrippe est incapable d\'agir'
    ]
  },
  INCAPACITATED: { 
    id: 'incapacitated', 
    label: 'Incapable d\'agir',
    effects: [
      'Ne peut pas effectuer d\'actions ni de réactions'
    ]
  },
  INVISIBLE: { 
    id: 'invisible', 
    label: 'Invisible',
    effects: [
      'Impossible à voir sans magie ou sens spécial',
      'Considéré comme fortement obscurci pour les attaques',
      'Avantage aux jets d\'attaque',
      'Les attaques contre la créature ont un désavantage'
    ]
  },
  PARALYZED: { 
    id: 'paralyzed', 
    label: 'Paralysé',
    effects: [
      'Incapable d\'agir (incapacité)',
      'Ne peut pas bouger ni parler',
      'Échec automatique aux jets de sauvegarde de Force et de Dextérité',
      'Avantage aux attaques contre la créature',
      'Coup critique automatique si l\'attaquant est à moins de 1,5m'
    ]
  },
  PETRIFIED: { 
    id: 'petrified', 
    label: 'Pétrifié',
    effects: [
      'Transformé en substance solide inanimée',
      'Poids multiplié par 10',
      'Ne vieillit plus',
      'Incapable d\'agir (incapacité)',
      'Avantage aux attaques contre la créature',
      'Échec automatique aux jets de sauvegarde de Force et de Dextérité',
      'Résistance à tous les dégâts'
    ]
  },
  POISONED: { 
    id: 'poisoned', 
    label: 'Empoisonné',
    effects: [
      'Désavantage aux jets d\'attaque et aux tests de caractéristique'
    ]
  },
  PRONE: { 
    id: 'prone', 
    label: 'À terre',
    effects: [
      'Peut seulement ramper ou se relever (coûte la moitié du mouvement)',
      'Désavantage aux jets d\'attaque',
      'Avantage aux attaques au corps à corps contre la créature',
      'Désavantage aux attaques à distance contre la créature'
    ]
  },
  RESTRAINED: { 
    id: 'restrained', 
    label: 'Entravé',
    effects: [
      'Vitesse réduite à 0',
      'Désavantage aux jets d\'attaque',
      'Les attaques contre la créature ont un avantage',
      'Désavantage aux jets de sauvegarde de Dextérité'
    ]
  },
  STUNNED: { 
    id: 'stunned', 
    label: 'Étourdi',
    effects: [
      'Incapable d\'agir (incapacité)',
      'Ne peut parler que de façon hésitante',
      'Échec automatique aux jets de sauvegarde de Force et de Dextérité',
      'Avantage aux attaques contre la créature'
    ]
  },
  UNCONSCIOUS: { 
    id: 'unconscious', 
    label: 'Inconscient',
    effects: [
      'Incapable d\'agir (incapacité)',
      'Inconscient, lâche tout ce qu\'il tient et tombe à terre',
      'Échec automatique aux jets de sauvegarde de Force et de Dextérité',
      'Avantage aux attaques contre la créature',
      'Coup critique automatique si l\'attaquant est à moins de 1,5m'
    ]
  }
};

/**
 * Interface pour une condition avec niveau (comme l'épuisement)
 */
export interface ConditionWithLevel {
  condition: ConditionData;
  level?: number; // Utilisé principalement pour l'épuisement
  duration?: number; // Durée en nombre de tours (optionnel)
}

/**
 * Descriptions spécifiques pour les niveaux d'épuisement
 */
export const exhaustionLevelDescriptions: Record<number, string> = {
  1: 'Désavantage aux jets de caractéristique',
  2: 'Vitesse diminuée de moitié',
  3: 'Désavantage aux jets d\'attaque et de sauvegarde',
  4: 'Maximum de points de vie diminué de moitié',
  5: 'Vitesse réduite à 0',
  6: 'Mort'
};

/**
 * Retourne tous les effets cumulatifs de l'épuisement jusqu'au niveau spécifié
 */
export function getExhaustionEffects(level: number): string[] {
  const effects: string[] = [];
  
  // Limiter le niveau entre 1 et 6
  const validLevel = Math.min(Math.max(1, level), 6);
  
  // Ajouter tous les effets jusqu'au niveau spécifié (cumulatif)
  for (let i = 1; i <= validLevel; i++) {
    effects.push(exhaustionLevelDescriptions[i]);
  }
  
  return effects;
}

/**
 * Obtient les effets détaillés d'une condition
 */
export function getConditionEffects(conditionWithLevel: ConditionWithLevel): string[] {
  const { condition, level } = conditionWithLevel;
  
  // Cas spécial pour l'épuisement qui a des niveaux
  if (condition.id === Condition.EXHAUSTION.id && level !== undefined) {
    return getExhaustionEffects(level);
  }
  
  // Pour les autres conditions, retourner les effets définis
  return condition.effects || ['Aucune information disponible sur les effets de cette condition'];
}

/**
 * Obtient le niveau d'épuisement d'une créature (0 si aucun)
 */
export function getExhaustionLevel(conditions: ConditionWithLevel[]): number {
  const exhaustion = conditions.find(c => c.condition.id === Condition.EXHAUSTION.id);
  return exhaustion?.level || 0;
}

/**
 * Liste des conditions qui donnent un désavantage aux jets d'attaque
 */
export const disadvantageConditions = [
  Condition.BLINDED,
  Condition.POISONED,
  Condition.PRONE,
  Condition.RESTRAINED,
  Condition.FRIGHTENED
];

/**
 * Liste des conditions qui donnent un avantage aux attaques contre la créature
 */
export const advantageAgainstConditions = [
  Condition.BLINDED,
  Condition.PARALYZED,
  Condition.PRONE,
  Condition.RESTRAINED,
  Condition.STUNNED,
  Condition.UNCONSCIOUS
];

/**
 * Vérifie si une créature a un désavantage aux jets d'attaque en fonction de ses conditions
 */
export function hasDisadvantage(conditions: ConditionWithLevel[]): boolean {
  // Vérifier les conditions standard qui donnent un désavantage
  const hasDisadvantageCondition = conditions.some(c => 
    disadvantageConditions.some(dc => dc.id === c.condition.id)
  );
  
  // Vérifier l'épuisement de niveau 3 ou plus
  const exhaustionLevel = getExhaustionLevel(conditions);
  const hasDisadvantageFromExhaustion = exhaustionLevel >= 3;
  
  return hasDisadvantageCondition || hasDisadvantageFromExhaustion;
}

/**
 * Vérifie si les attaques contre une créature ont un avantage en fonction de ses conditions
 */
export function hasAdvantageAgainst(conditions: ConditionWithLevel[]): boolean {
  // Vérifier les conditions standard qui donnent un avantage aux attaques contre
  const hasAdvantageCondition = conditions.some(c => 
    advantageAgainstConditions.some(ac => ac.id === c.condition.id)
  );
  
  // Vérifier si la créature est inconsciente (donne automatiquement un avantage)
  const isUnconscious = conditions.some(c => c.condition.id === Condition.UNCONSCIOUS.id);
  
  return hasAdvantageCondition || isUnconscious;
}

/**
 * Décrémente la durée d'une condition et retourne true si la condition doit être supprimée
 */
export function decrementConditionDuration(condition: ConditionWithLevel): boolean {
  // Si la condition n'a pas de durée ou si c'est l'épuisement, ne pas la décrémenter
  if (condition.duration === undefined || condition.condition === Condition.EXHAUSTION) {
    return false;
  }
  
  // Décrémenter la durée
  condition.duration--;
  
  // Retourner true si la durée est arrivée à 0 (condition à supprimer)
  return condition.duration <= 0;
}
