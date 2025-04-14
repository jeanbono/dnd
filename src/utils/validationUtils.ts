/**
 * Vérifie si une valeur numérique est valide (ni undefined, ni null, ni chaîne vide)
 * Cette fonction permet de contourner les limitations de TypeScript pour la validation des champs numériques
 */
export function isValidNumber(value: number | string | undefined | null): boolean {
  if (value === undefined || value === null || value === '') return false;
  
  return true;
}