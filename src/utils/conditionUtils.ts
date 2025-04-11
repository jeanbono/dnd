/**
 * Utilitaires pour la gestion des conditions/états des créatures
 */

/**
 * Énumération des différentes conditions possibles
 */
export enum Condition {
  BLINDED = 'blinded',        // Aveuglé
  CHARMED = 'charmed',        // Charmé
  DEAFENED = 'deafened',      // Assourdi
  EXHAUSTION = 'exhaustion',  // Épuisement (avec niveaux)
  FRIGHTENED = 'frightened',  // Effrayé
  GRAPPLED = 'grappled',      // Agrippé
  INCAPACITATED = 'incapacitated', // Incapable d'agir
  INVISIBLE = 'invisible',    // Invisible
  PARALYZED = 'paralyzed',    // Paralysé
  PETRIFIED = 'petrified',    // Pétrifié
  POISONED = 'poisoned',      // Empoisonné
  PRONE = 'prone',            // À terre
  RESTRAINED = 'restrained',  // Entravé
  STUNNED = 'stunned',        // Étourdi
  UNCONSCIOUS = 'unconscious' // Inconscient
}

/**
 * Interface pour une condition avec niveau (comme l'épuisement)
 */
export interface ConditionWithLevel {
  condition: Condition;
  level?: number; // Utilisé principalement pour l'épuisement
  duration?: number; // Durée en nombre de tours (optionnel)
}

/**
 * Traductions françaises des noms de conditions
 */
export const conditionTranslations: Record<Condition, string> = {
  [Condition.BLINDED]: 'Aveuglé',
  [Condition.CHARMED]: 'Charmé',
  [Condition.DEAFENED]: 'Assourdi',
  [Condition.EXHAUSTION]: 'Épuisement',
  [Condition.FRIGHTENED]: 'Effrayé',
  [Condition.GRAPPLED]: 'Agrippé',
  [Condition.INCAPACITATED]: 'Incapable d\'agir',
  [Condition.INVISIBLE]: 'Invisible',
  [Condition.PARALYZED]: 'Paralysé',
  [Condition.PETRIFIED]: 'Pétrifié',
  [Condition.POISONED]: 'Empoisonné',
  [Condition.PRONE]: 'À terre',
  [Condition.RESTRAINED]: 'Entravé',
  [Condition.STUNNED]: 'Étourdi',
  [Condition.UNCONSCIOUS]: 'Inconscient'
};

/**
 * Descriptions des conditions pour l'affichage
 */
export const conditionDescriptions: Record<Condition, string> = {
  [Condition.BLINDED]: `${conditionTranslations[Condition.BLINDED]} - Ne voit pas, rate les jets nécessitant la vue. Désavantage aux attaques, avantage aux attaques contre.`,
  [Condition.CHARMED]: `${conditionTranslations[Condition.CHARMED]} - Ne peut pas attaquer le charmeur. Le charmeur a avantage aux interactions sociales.`,
  [Condition.DEAFENED]: `${conditionTranslations[Condition.DEAFENED]} - N'entend pas, rate les jets nécessitant l'ouïe.`,
  [Condition.EXHAUSTION]: `${conditionTranslations[Condition.EXHAUSTION]} - Effets cumulatifs selon le niveau (1-6).`,
  [Condition.FRIGHTENED]: `${conditionTranslations[Condition.FRIGHTENED]} - Désavantage aux jets quand la source est visible. Ne peut s'approcher volontairement.`,
  [Condition.GRAPPLED]: `${conditionTranslations[Condition.GRAPPLED]} - Vitesse réduite à 0, pas de bonus de vitesse.`,
  [Condition.INCAPACITATED]: `${conditionTranslations[Condition.INCAPACITATED]} - Ne peut effectuer aucune action ni réaction.`,
  [Condition.INVISIBLE]: `${conditionTranslations[Condition.INVISIBLE]} - Ne peut être vu sans magie. Avantage aux attaques, désavantage aux attaques contre.`,
  [Condition.PARALYZED]: `${conditionTranslations[Condition.PARALYZED]} - Incapable d'agir, ne peut bouger ni parler. Rate jets Force/Dex. Coups critiques à 1,5m.`,
  [Condition.PETRIFIED]: `${conditionTranslations[Condition.PETRIFIED]} - Transformé en substance solide. Incapable d'agir, résistance aux dégâts.`,
  [Condition.POISONED]: `${conditionTranslations[Condition.POISONED]} - Désavantage aux jets d'attaque et de caractéristique.`,
  [Condition.PRONE]: `${conditionTranslations[Condition.PRONE]} - Peut ramper. Désavantage aux attaques. Avantage aux attaques contre à 1,5m, sinon désavantage.`,
  [Condition.RESTRAINED]: `${conditionTranslations[Condition.RESTRAINED]} - Vitesse à 0. Désavantage aux attaques et jets Dex. Avantage aux attaques contre.`,
  [Condition.STUNNED]: `${conditionTranslations[Condition.STUNNED]} - Incapable d'agir, ne peut bouger, parle difficilement. Rate jets Force/Dex. Avantage aux attaques contre.`,
  [Condition.UNCONSCIOUS]: `${conditionTranslations[Condition.UNCONSCIOUS]} - Incapable d'agir, tombe à terre. Rate jets Force/Dex. Avantage aux attaques contre, critiques à 1,5m.`
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
  const { condition, level } = conditionWithLevel;
  
  if (condition === Condition.EXHAUSTION && level !== undefined) {
    return `${conditionTranslations[Condition.EXHAUSTION]} (Niveau ${level}) - ${exhaustionLevelDescriptions[level]}`;
  }
  
  return conditionDescriptions[condition];
}

/**
 * Vérifie si une condition est active pour une créature
 */
export function hasCondition(conditions: ConditionWithLevel[], condition: Condition): boolean {
  return conditions.some(c => c.condition === condition);
}

/**
 * Obtient le niveau d'épuisement d'une créature (0 si aucun)
 */
export function getExhaustionLevel(conditions: ConditionWithLevel[]): number {
  const exhaustion = conditions.find(c => c.condition === Condition.EXHAUSTION);
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
  Condition.FRIGHTENED,
  // L'épuisement niveau 3+ donne un désavantage
];

/**
 * Vérifie si une créature a un désavantage aux jets d'attaque en fonction de ses conditions
 */
export function hasDisadvantage(conditions: ConditionWithLevel[]): boolean {
  // Vérifier si la créature a une condition qui donne un désavantage
  const hasDisadvantageCondition = conditions.some(c => 
    disadvantageConditions.includes(c.condition)
  );
  
  // Vérifier si la créature a un niveau d'épuisement de 3 ou plus
  const exhaustion = conditions.find(c => c.condition === Condition.EXHAUSTION);
  const hasExhaustionDisadvantage = exhaustion?.level !== undefined && exhaustion.level >= 3;
  
  return hasDisadvantageCondition || hasExhaustionDisadvantage;
}

/**
 * Décrémente la durée d'une condition et retourne true si la condition doit être supprimée
 */
export function decrementConditionDuration(condition: ConditionWithLevel): boolean {
  // L'épuisement n'a pas de durée
  if (condition.condition === Condition.EXHAUSTION) {
    return false;
  }
  
  // Si la condition a une durée définie
  if (condition.duration !== undefined) {
    condition.duration -= 1;
    // Retourne true si la durée est arrivée à 0 (condition à supprimer)
    return condition.duration <= 0;
  }
  
  // Si la condition n'a pas de durée définie, elle est permanente
  return false;
}
