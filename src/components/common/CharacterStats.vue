<template>
  <div class="grid grid-cols-6 w-full bg-slate-100 rounded px-2 py-1 border border-slate-200 mb-2">
    <div v-for="ability in abilities" :key="ability.name" class="flex flex-col items-center">
      <span class="text-xs font-semibold text-slate-500">{{ ability.name }}</span>
      <div class="flex items-baseline gap-1.5">
        <span class="text-sm font-semibold">{{ ability.score }}</span>
        <span class="text-xs text-slate-500">{{ getFormattedModifier(ability.score) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getFormattedModifier } from '@/utils/abilityUtils';

const props = defineProps({
  strength: {
    type: Number,
    required: false,
    default: undefined
  },
  dexterity: {
    type: Number,
    required: false,
    default: undefined
  },
  constitution: {
    type: Number,
    required: false,
    default: undefined
  },
  intelligence: {
    type: Number,
    required: false,
    default: undefined
  },
  wisdom: {
    type: Number,
    required: false,
    default: undefined
  },
  charisma: {
    type: Number,
    required: false,
    default: undefined
  }
});

const abilities = computed(() => {
  const stats = [];
  if (props.strength !== undefined) stats.push({ name: 'FOR', score: props.strength });
  if (props.dexterity !== undefined) stats.push({ name: 'DEX', score: props.dexterity });
  if (props.constitution !== undefined) stats.push({ name: 'CON', score: props.constitution });
  if (props.intelligence !== undefined) stats.push({ name: 'INT', score: props.intelligence });
  if (props.wisdom !== undefined) stats.push({ name: 'SAG', score: props.wisdom });
  if (props.charisma !== undefined) stats.push({ name: 'CHA', score: props.charisma });
  return stats;
});
</script>

<style scoped>
/* Classes Tailwind utilisées dans le template */
</style>