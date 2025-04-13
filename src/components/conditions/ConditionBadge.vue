<script setup lang="ts">
import { computed } from 'vue';
import { Condition, getConditionEffects, type ConditionData, type ConditionWithLevel } from '@/utils/conditionUtils';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';
import Tooltip from '@/components/common/Tooltip.vue';

const props = defineProps<{
  condition: ConditionData;
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
  if (props.condition.id === Condition.BLINDED.id) return 'bg-gray-500';
  if (props.condition.id === Condition.DEAFENED.id) return 'bg-gray-500';
  if (props.condition.id === Condition.CHARMED.id) return 'bg-purple-500';
  if (props.condition.id === Condition.FRIGHTENED.id) return 'bg-purple-500';
  if (props.condition.id === Condition.EXHAUSTION.id) {
    // Différentes couleurs selon le niveau d'épuisement
    if (props.level === 1) return 'bg-yellow-500';
    if (props.level === 2) return 'bg-orange-400';
    if (props.level === 3) return 'bg-orange-500';
    if (props.level === 4) return 'bg-red-400';
    if (props.level === 5) return 'bg-red-500';
    if (props.level === 6) return 'bg-red-700';
    return 'bg-yellow-500';
  }
  if (props.condition.id === Condition.GRAPPLED.id) return 'bg-blue-500';
  if (props.condition.id === Condition.RESTRAINED.id) return 'bg-blue-500';
  if (props.condition.id === Condition.POISONED.id) return 'bg-green-600';
  if (props.condition.id === Condition.PRONE.id) return 'bg-blue-400';
  if (props.condition.id === Condition.PARALYZED.id) return 'bg-red-500';
  if (props.condition.id === Condition.STUNNED.id) return 'bg-red-500';
  if (props.condition.id === Condition.UNCONSCIOUS.id) return 'bg-red-500';
  if (props.condition.id === Condition.PETRIFIED.id) return 'bg-gray-600';
  if (props.condition.id === Condition.INVISIBLE.id) return 'bg-indigo-400';
  
  // Couleur par défaut
  return 'bg-gray-400';
});

// Détermine la couleur du texte (blanc ou noir) en fonction de la couleur de fond
const textColor = computed(() => {
  // Couleurs de fond foncées nécessitent du texte blanc
  if (props.condition.id === Condition.BLINDED.id ||
      props.condition.id === Condition.DEAFENED.id ||
      props.condition.id === Condition.CHARMED.id ||
      props.condition.id === Condition.FRIGHTENED.id ||
      props.condition.id === Condition.GRAPPLED.id ||
      props.condition.id === Condition.RESTRAINED.id ||
      props.condition.id === Condition.POISONED.id ||
      props.condition.id === Condition.PARALYZED.id ||
      props.condition.id === Condition.STUNNED.id ||
      props.condition.id === Condition.UNCONSCIOUS.id ||
      props.condition.id === Condition.PETRIFIED.id ||
      props.condition.id === Condition.PRONE.id ||
      (props.condition.id === Condition.EXHAUSTION.id && props.level && props.level > 2)) {
    return 'text-white';
  }
  
  // Couleurs de fond claires nécessitent du texte noir
  return 'text-black';
});

// Détermine le texte à afficher pour la condition
const badgeText = computed(() => {
  if (props.condition.id === Condition.EXHAUSTION.id && props.level) {
    return `${props.condition.label} ${props.level}`;
  }
  
  let text = props.condition.label;
  
  // Ajouter la durée si elle est définie
  if (props.duration !== undefined) {
    text += ` (${props.duration})`;
  }
  
  return text;
});

// Obtenir les effets de la condition pour l'infobulle
const conditionEffects = computed(() => {
  // Créer un objet ConditionWithLevel pour utiliser avec getConditionEffects
  const conditionWithLevel: ConditionWithLevel = {
    condition: props.condition,
    level: props.level,
    duration: props.duration
  };
  
  return getConditionEffects(conditionWithLevel);
});
</script>

<template>
  <Tooltip placement="top" :offset-distance="10">
    <div 
      class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium mr-2 mb-1 cursor-pointer hover:opacity-80 shadow-sm transition-all duration-200 hover:shadow"
      :class="[badgeColor, textColor]"
      @click="removeCondition"
    >
      <span class="mr-1">{{ badgeText }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    
    <template #content>
      <div class="bg-gray-800 text-white text-xs rounded p-2">
        <div class="font-semibold mb-1">{{ props.condition.label }}{{ props.level ? ` (niveau ${props.level})` : '' }} :</div>
        <ul class="list-disc pl-4">
          <li v-for="(effect, index) in conditionEffects" :key="index" class="mb-1">
            {{ effect }}
          </li>
        </ul>
      </div>
    </template>
  </Tooltip>
</template>

<style scoped>
/* Animation subtile au survol */
div[class*="inline-flex"]:hover {
  transform: translateY(-1px);
}
</style>
