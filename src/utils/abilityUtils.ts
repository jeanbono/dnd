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
 * Calcule et formate le modificateur d'une caractéristique
 * @param score Valeur de la caractéristique
 * @returns Le modificateur formaté (ex: "+3" ou "-1")
 */
export function getFormattedModifier(score: number | undefined): string {
  if (score === undefined || score === null) return '-';
  
  const mod = calculateAbilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
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
