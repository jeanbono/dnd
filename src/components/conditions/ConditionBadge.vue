<script setup lang="ts">
import { computed } from 'vue';
import { Condition, type ConditionData, getConditionEffects } from '@/utils/conditionUtils';
import { useCharacterStore } from '@/stores/character';
import Tooltip from '@/components/common/Tooltip.vue';

const props = defineProps<{
  condition: ConditionData;
  level?: number;
  duration?: number;
  creatureId: string;
}>();

const characterStore = useCharacterStore();

// Fonction pour supprimer la condition
function removeCondition() {
  characterStore.removeCondition(props.creatureId, props.condition);
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
</script>

<template>
  <Tooltip placement="top" :offset-distance="8">
    <span
      :class="['inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium shadow-sm transition-all duration-200', badgeColor, textColor, 'mr-2 mb-1 cursor-pointer hover:opacity-80 hover:shadow']"
      @click.stop="removeCondition"
    >
      {{ props.condition.label }}
      <span v-if="props.level" class="ml-1 font-bold">{{ props.level }}</span>
      <span v-if="props.duration" class="ml-1">({{ props.duration }})</span>
    </span>
    <template #content>
      <div class="bg-gray-800 text-white text-xs rounded p-2" style="min-width: 150px; max-width: 300px;">
        <div class="font-semibold mb-1">Effets :</div>
        <ul class="list-disc pl-4 mt-1 text-gray-300 text-xs">
          <li v-for="(effect, idx) in getConditionEffects(props)" :key="idx">{{ effect }}</li>
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
