<script setup lang="ts">
import { computed } from 'vue';
import { Condition, conditionDescriptions, exhaustionLevelDescriptions, conditionTranslations } from '@/utils/conditionUtils';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';

const props = defineProps<{
  condition: Condition;
  level?: number;
  duration?: number;
  creatureId: string;
  creatureType: 'monster' | 'player';
}>();

const monsterStore = useMonsterStore();
const playerStore = usePlayerStore();

// Fonction pour supprimer la condition
function removeCondition() {
  if (props.creatureType === 'monster') {
    monsterStore.removeCondition(props.creatureId, props.condition);
  } else {
    playerStore.removeCondition(props.creatureId, props.condition);
  }
}

// Détermine la couleur du badge en fonction de la condition
const badgeColor = computed(() => {
  switch (props.condition) {
    case Condition.BLINDED:
    case Condition.DEAFENED:
      return 'bg-gray-500'; // Gris pour les conditions sensorielles
    case Condition.CHARMED:
    case Condition.FRIGHTENED:
      return 'bg-purple-500'; // Violet pour les conditions mentales
    case Condition.EXHAUSTION:
      // Différentes couleurs selon le niveau d'épuisement
      if (props.level === 1) return 'bg-yellow-500';
      if (props.level === 2) return 'bg-orange-400';
      if (props.level === 3) return 'bg-orange-500';
      if (props.level === 4) return 'bg-red-400';
      if (props.level === 5) return 'bg-red-500';
      if (props.level === 6) return 'bg-red-700';
      return 'bg-yellow-500';
    case Condition.GRAPPLED:
    case Condition.RESTRAINED:
      return 'bg-blue-500'; // Bleu pour les conditions de mouvement restreint
    case Condition.POISONED:
      return 'bg-green-600'; // Vert pour empoisonné
    case Condition.PRONE:
      return 'bg-blue-400'; // Bleu clair pour à terre
    case Condition.STUNNED:
    case Condition.PARALYZED:
      return 'bg-indigo-500'; // Indigo pour les conditions qui empêchent d'agir
    case Condition.UNCONSCIOUS:
    case Condition.PETRIFIED:
      return 'bg-gray-700'; // Gris foncé pour les conditions les plus sévères
    case Condition.INVISIBLE:
      return 'bg-teal-500'; // Teal pour invisible
    case Condition.INCAPACITATED:
      return 'bg-purple-600'; // Violet foncé pour incapable d'agir
    default:
      return 'bg-gray-500';
  }
});

// Obtient le nom à afficher pour la condition
const conditionName = computed(() => {
  if (props.condition === Condition.EXHAUSTION) {
    return `${conditionTranslations[Condition.EXHAUSTION]} ${props.level || 1}`;
  }
  return conditionTranslations[props.condition];
});

// Obtient la description complète pour le tooltip
const tooltipDescription = computed(() => {
  if (props.condition === Condition.EXHAUSTION && props.level !== undefined) {
    return `${exhaustionLevelDescriptions[props.level]}`;
  }
  return conditionDescriptions[props.condition];
});
</script>

<template>
  <div 
    :class="[badgeColor, 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white mr-2 mb-1 cursor-pointer hover:opacity-90']"
    :title="tooltipDescription"
    @click="removeCondition"
  >
    {{ conditionName }}
    {{ props.duration ? ` (${props.duration} tours)` : '' }}
    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>
  </div>
</template>
