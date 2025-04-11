/**
 * Utilitaires pour les caractéristiques (abilities) des personnages et monstres
 */

/**
 * Calcule le modificateur d'une caractéristique selon les règles de D&D 5e
 * @param score Valeur de la caractéristique
 * @returns Le modificateur calculé
 */
export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Formate l'affichage d'une caractéristique avec son modificateur
 * @param score Valeur de la caractéristique
 * @returns Chaîne formatée (ex: "14 (+2)" ou "—" si undefined)
 */
export function getAbilityScoreDisplay(score?: number): string {
  if (score === undefined) return '—';
  
  const modifier = calculateAbilityModifier(score);
  const sign = modifier >= 0 ? '+' : '';
  return `${score} (${sign}${modifier})`;
}
