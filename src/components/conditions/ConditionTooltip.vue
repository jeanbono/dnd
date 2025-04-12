<script setup lang="ts">
import { Condition, getConditionEffects } from '@/utils/conditionUtils';
import { ref, onMounted, onUnmounted } from 'vue';

// Définition des props
defineProps<{
  character: any
}>();

// Références pour le positionnement
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipPosition = ref({
  left: false,
  top: false
});

// Fonction pour calculer la position du tooltip
function updateTooltipPosition() {
  if (!tooltipRef.value) return;
  
  const tooltip = tooltipRef.value;
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  
  // Vérifier si le tooltip dépasse à droite
  if (tooltipRect.right > viewportWidth) {
    tooltipPosition.value.left = true;
  } else {
    tooltipPosition.value.left = false;
  }
  
  // Vérifier si le tooltip dépasse en haut
  if (tooltipRect.top < 0) {
    tooltipPosition.value.top = true;
  } else {
    tooltipPosition.value.top = false;
  }
}

// Ajouter les écouteurs d'événements
onMounted(() => {
  window.addEventListener('resize', updateTooltipPosition);
  window.addEventListener('scroll', updateTooltipPosition);
  
  // Petit délai pour s'assurer que le DOM est prêt
  setTimeout(updateTooltipPosition, 100);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTooltipPosition);
  window.removeEventListener('scroll', updateTooltipPosition);
});

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
  <div 
    ref="tooltipRef"
    class="absolute hidden group-hover:block z-20"
    :class="{
      'left-0 right-auto': !tooltipPosition.left,
      'right-0 left-auto': tooltipPosition.left,
      'bottom-full mb-2': !tooltipPosition.top,
      'top-full mt-2': tooltipPosition.top
    }"
  >
    <div class="bg-gray-800 text-white text-xs rounded p-2 shadow-lg opacity-100" style="min-width: 200px; max-width: 300px;">
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
      <div 
        class="absolute transform w-2 h-2 bg-gray-800"
        :class="{
          'left-3 top-full -translate-y-1/2 rotate-45': !tooltipPosition.top && !tooltipPosition.left,
          'right-3 top-full -translate-y-1/2 rotate-45': !tooltipPosition.top && tooltipPosition.left,
          'left-3 bottom-full translate-y-1/2 rotate-45': tooltipPosition.top && !tooltipPosition.left,
          'right-3 bottom-full translate-y-1/2 rotate-45': tooltipPosition.top && tooltipPosition.left
        }"
      ></div>
    </div>
  </div>
</template>
