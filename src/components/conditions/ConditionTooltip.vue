<script setup lang="ts">
import { Condition, getConditionEffects } from '@/utils/conditionUtils';

// Définition des props
defineProps<{
  character: any
}>();

// Fonction pour obtenir les détails d'une condition
function getConditionDetails(conditionWithLevel: any): { title: string; effects?: string[] } {
  const conditionId = conditionWithLevel.condition.id;
  let title = '';
  
  // Trouver le titre de la condition
  Object.values(Condition).forEach(c => {
    if (c.id === conditionId) {
      title = c.label;
    }
  });
  
  // Ajouter le niveau pour l'épuisement
  if (conditionId === 'exhaustion' && conditionWithLevel.level) {
    title = `${title} (niveau ${conditionWithLevel.level})`;
  }
  
  // Obtenir les effets depuis le référentiel de conditions
  const effects = getConditionEffects(conditionWithLevel);
  
  return { title, effects };
}
</script>

<template>
  <div class="absolute hidden group-hover:block left-0 bottom-full mb-2 z-20">
    <div class="bg-gray-800 text-white text-xs rounded p-2 shadow-lg opacity-100" style="min-width: 300px; max-width: 450px;">
      <div class="font-semibold mb-1">États actifs :</div>
      <div class="grid grid-cols-1 gap-2">
        <div v-for="condition in character.conditions" :key="condition.condition.id" class="mb-2">
          <div class="font-medium text-blue-300">{{ getConditionDetails(condition).title }}</div>
          <ul v-if="getConditionDetails(condition).effects" class="list-disc pl-4 mt-1 text-gray-300 text-xs">
            <li v-for="(effect, index) in getConditionDetails(condition).effects" :key="index" class="mb-1">
              {{ effect }}
            </li>
          </ul>
        </div>
      </div>
      <div class="absolute left-3 top-full transform -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
    </div>
  </div>
</template>
