/**
 * Utilitaires pour la gestion des conditions/états des créatures
 */

/**
 * Interface pour une condition avec ses propriétés
 */
export interface ConditionData {
  id: string;
  label: string;
}

/**
 * Énumération des différentes conditions possibles avec leurs libellés
 */
export const Condition: Record<string, ConditionData> = {
  BLINDED: { id: 'blinded', label: 'Aveuglé' },
  CHARMED: { id: 'charmed', label: 'Charmé' },
  DEAFENED: { id: 'deafened', label: 'Assourdi' },
  EXHAUSTION: { id: 'exhaustion', label: 'Épuisement' },
  FRIGHTENED: { id: 'frightened', label: 'Effrayé' },
  GRAPPLED: { id: 'grappled', label: 'Agrippé' },
  INCAPACITATED: { id: 'incapacitated', label: 'Incapable d\'agir' },
  INVISIBLE: { id: 'invisible', label: 'Invisible' },
  PARALYZED: { id: 'paralyzed', label: 'Paralysé' },
  PETRIFIED: { id: 'petrified', label: 'Pétrifié' },
  POISONED: { id: 'poisoned', label: 'Empoisonné' },
  PRONE: { id: 'prone', label: 'À terre' },
  RESTRAINED: { id: 'restrained', label: 'Entravé' },
  STUNNED: { id: 'stunned', label: 'Étourdi' },
  UNCONSCIOUS: { id: 'unconscious', label: 'Inconscient' }
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
 * Traductions françaises des noms de conditions
 */
export const conditionTranslations: Record<string, string> = {
  [Condition.BLINDED.id]: Condition.BLINDED.label,
  [Condition.CHARMED.id]: Condition.CHARMED.label,
  [Condition.DEAFENED.id]: Condition.DEAFENED.label,
  [Condition.EXHAUSTION.id]: Condition.EXHAUSTION.label,
  [Condition.FRIGHTENED.id]: Condition.FRIGHTENED.label,
  [Condition.GRAPPLED.id]: Condition.GRAPPLED.label,
  [Condition.INCAPACITATED.id]: Condition.INCAPACITATED.label,
  [Condition.INVISIBLE.id]: Condition.INVISIBLE.label,
  [Condition.PARALYZED.id]: Condition.PARALYZED.label,
  [Condition.PETRIFIED.id]: Condition.PETRIFIED.label,
  [Condition.POISONED.id]: Condition.POISONED.label,
  [Condition.PRONE.id]: Condition.PRONE.label,
  [Condition.RESTRAINED.id]: Condition.RESTRAINED.label,
  [Condition.STUNNED.id]: Condition.STUNNED.label,
  [Condition.UNCONSCIOUS.id]: Condition.UNCONSCIOUS.label
};

/**
 * Descriptions des conditions pour l'affichage
 */
export const conditionDescriptions: Record<string, string> = {
  [Condition.BLINDED.id]: `${Condition.BLINDED.label} - Ne voit pas, rate les jets nécessitant la vue. Désavantage aux attaques, avantage aux attaques contre.`,
  [Condition.CHARMED.id]: `${Condition.CHARMED.label} - Ne peut pas attaquer le charmeur. Le charmeur a avantage aux interactions sociales.`,
  [Condition.DEAFENED.id]: `${Condition.DEAFENED.label} - N'entend pas, rate les jets nécessitant l'ouïe.`,
  [Condition.EXHAUSTION.id]: `${Condition.EXHAUSTION.label} - Effets cumulatifs selon le niveau (1-6).`,
  [Condition.FRIGHTENED.id]: `${Condition.FRIGHTENED.label} - Désavantage aux jets quand la source est visible. Ne peut s'approcher volontairement.`,
  [Condition.GRAPPLED.id]: `${Condition.GRAPPLED.label} - Vitesse réduite à 0, pas de bonus de vitesse.`,
  [Condition.INCAPACITATED.id]: `${Condition.INCAPACITATED.label} - Ne peut effectuer aucune action ni réaction.`,
  [Condition.INVISIBLE.id]: `${Condition.INVISIBLE.label} - Ne peut être vu sans magie. Avantage aux attaques, désavantage aux attaques contre.`,
  [Condition.PARALYZED.id]: `${Condition.PARALYZED.label} - Incapable d'agir, ne peut bouger ni parler. Rate jets Force/Dex. Coups critiques à 1,5m.`,
  [Condition.PETRIFIED.id]: `${Condition.PETRIFIED.label} - Transformé en substance solide. Incapable d'agir, résistance aux dégâts.`,
  [Condition.POISONED.id]: `${Condition.POISONED.label} - Désavantage aux jets d'attaque et de caractéristique.`,
  [Condition.PRONE.id]: `${Condition.PRONE.label} - Peut ramper. Désavantage aux attaques. Avantage aux attaques contre à 1,5m, sinon désavantage.`,
  [Condition.RESTRAINED.id]: `${Condition.RESTRAINED.label} - Vitesse à 0. Désavantage aux attaques et jets Dex. Avantage aux attaques contre.`,
  [Condition.STUNNED.id]: `${Condition.STUNNED.label} - Incapable d'agir, ne peut bouger, parle difficilement. Rate jets Force/Dex. Avantage aux attaques contre.`,
  [Condition.UNCONSCIOUS.id]: `${Condition.UNCONSCIOUS.label} - Incapable d'agir, tombe à terre. Rate jets Force/Dex. Avantage aux attaques contre, critiques à 1,5m.`
};

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
 * Obtient la description complète d'une condition, y compris le niveau d'épuisement si applicable
 */
export function getConditionDescription(conditionWithLevel: ConditionWithLevel): string {
  const { condition, level, duration } = conditionWithLevel;
  
  let description = condition.label;
  
  // Ajouter le niveau pour l'épuisement
  if (condition === Condition.EXHAUSTION && level !== undefined) {
    description += ` (niveau ${level})`;
  }
  
  // Ajouter la durée si elle est définie
  if (duration !== undefined) {
    description += ` (${duration} tour${duration > 1 ? 's' : ''})`;
  }
  
  return description;
}

/**
 * Vérifie si une condition est active pour une créature
 */
export function hasCondition(conditions: ConditionWithLevel[], condition: ConditionData): boolean {
  return conditions.some(c => c.condition.id === condition.id);
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
