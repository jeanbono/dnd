<script setup lang="ts">
import Tooltip from '@/components/common/Tooltip.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faDiceD20, faBolt } from '@fortawesome/free-solid-svg-icons';

const emit = defineEmits(['cardClick']);

const props = defineProps({
  character: { type: Object, required: true },
  index: { type: Number, required: true },
  hasDisadvantageOnAttacks: { type: Function, required: true },
  hasAdvantageAgainstAttacks: { type: Function, required: true },
  getConditionDetails: { type: Function, required: true }
});

// Génère la liste des tags d'état spéciaux à afficher
const specialTags = [
  {
    show: () => props.character.hp === 0,
    key: 'mort',
    bg: 'bg-gray-700 text-white',
    icon: () => '💀',
    label: 'Mort',
    tooltip: 'Ce personnage est mort.'
  },
  {
    show: () => props.hasDisadvantageOnAttacks(props.character),
    key: 'disadvantage',
    bg: 'bg-red-50 text-red-700 border border-red-200',
    icon: () => '⚠️',
    label: 'Désavantage',
    tooltip: props.character.type === 'player' ?
      'Ce personnage a un désavantage aux jets d\'attaque' :
      'Ce monstre a un désavantage aux jets d\'attaque'
  },
  {
    show: () => props.hasAdvantageAgainstAttacks(props.character),
    key: 'advantage',
    bg: 'bg-green-50 text-green-700 border border-green-200',
    icon: () => '🎯',
    label: 'Avantage contre',
    tooltip: props.character.type === 'player' ?
      'Les attaques contre ce personnage ont un avantage' :
      'Les attaques contre ce monstre ont un avantage'
  },
];

</script>

<template>
  <div
    :class="[
      character.hp === 0
        ? (character.type === 'player' ? 'bg-gray-300 border-gray-400 opacity-70 grayscale' : 'bg-gray-300 border-gray-400 opacity-70 grayscale')
        : (character.type === 'player' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'),
      character.type === 'player' ? 'ml-0 mr-auto' : 'ml-auto mr-0',
      'p-2 rounded-md flex justify-between items-center border hover:bg-opacity-70 w-full sm:w-1/2 cursor-pointer hover:shadow-md transition-all duration-200'
    ]"
    :title="character.type === 'player' ? 'Cliquez pour voir ce joueur' : 'Cliquez pour voir ce monstre'"
    @click="$emit('cardClick', character)"
  >
    <div class="flex items-center">
      <div class="font-bold text-xl mr-3 w-6 text-center">{{ index + 1 }}</div>
      <div class="flex-grow">
        <div class="flex items-center flex-wrap">
          <span class="font-medium mr-1">{{ character.name }}</span>
          <div class="flex flex-wrap items-center gap-1">
            <template v-for="tag in specialTags" :key="tag.key">
              <span
                v-if="tag.show()"
                :class="[
                  'inline-flex items-center rounded-md text-xs font-medium shadow-sm mb-1',
                  'h-5 px-1 py-0.5',
                  'sm:h-6 sm:px-2 sm:py-1',
                  tag.bg
                ]"
              >
                <span v-if="typeof tag.icon() === 'string'" class="emoji-tag" v-html="tag.icon()" />
                <span class="ml-1 hidden sm:inline">{{ tag.label }}</span>
              </span>
            </template>
          </div>
        </div>
        <div class="flex gap-2 mt-1 mb-1">
          <!-- Initiative avec icône de dé FontAwesome -->
          <div class="flex items-center bg-white border border-gray-200 rounded px-2 py-0.5 shadow-sm text-xs font-semibold text-gray-700">
            <font-awesome-icon :icon="faDiceD20" class="h-4 w-4 text-purple-600 mr-1" />
            <span class="font-semibold text-base text-gray-800">{{ character.initiative }}</span>
          </div>
          <!-- DEX avec icône éclaire FontAwesome -->
          <div class="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-0.5 shadow-sm text-xs font-semibold text-gray-700">
            <font-awesome-icon :icon="faBolt" class="h-4 w-4 text-yellow-500 mr-1" />
            <span>DEX</span>
            <span class="ml-1 text-base font-bold text-gray-900">{{ character.dexterity }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Compteur d'états -->
    <Tooltip placement="top" :offset-distance="10">
      <div 
        class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help"
        v-if="character.conditions && character.conditions.length > 0"
      >
        {{ character.conditions.length }}
      </div>
      <template #content>
        <div class="bg-gray-800 text-white text-xs rounded p-2" style="min-width: 200px; max-width: 300px;">
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
        </div>
      </template>
    </Tooltip>
  </div>
</template>

<style scoped>
.emoji-tag {
  font-size: 1em;
  line-height: 1;
  width: 1.25em;
  height: 1.25em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
