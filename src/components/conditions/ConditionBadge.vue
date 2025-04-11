<script setup lang="ts">
import { computed } from 'vue';
import { Condition, conditionDescriptions, exhaustionLevelDescriptions, type ConditionData } from '@/utils/conditionUtils';
import { useMonsterStore } from '@/stores/monster';
import { usePlayerStore } from '@/stores/player';

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
  
  // Couleur spécifique pour "À terre"
  if (props.condition.id === Condition.PRONE.id) {
    return 'text-yellow-800';
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

// Description de la condition pour l'infobulle
const tooltipText = computed(() => {
  if (props.condition.id === Condition.EXHAUSTION.id && props.level) {
    return exhaustionLevelDescriptions[props.level];
  }
  return conditionDescriptions[props.condition.id] || '';
});
</script>

<template>
  <div 
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium relative group mr-2 mb-1 cursor-pointer hover:opacity-80"
    :class="[badgeColor, textColor]"
    @click="removeCondition"
  >
    {{ badgeText }}
    
    <!-- Tooltip avec la description de la condition -->
    <div class="absolute left-1/2 bottom-full mb-2 hidden group-hover:block z-10 transform -translate-x-1/2">
      <div class="bg-gray-800 text-white text-xs rounded p-2 shadow-lg" style="min-width: 200px; max-width: 300px;">
        {{ tooltipText }}
        <div class="absolute left-1/2 top-full transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
      </div>
    </div>
  </div>
</template>
