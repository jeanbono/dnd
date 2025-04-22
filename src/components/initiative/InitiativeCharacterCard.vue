<script setup lang="ts">
import Tooltip from '@/components/common/Tooltip.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBolt, faDiceD20, faSkull } from '@fortawesome/free-solid-svg-icons';
import { useCharacterStore } from '@/stores/character';

const characterStore = useCharacterStore();

const emit = defineEmits(['cardClick']);

const props = defineProps({
  character: { type: Object, required: true },
  index: { type: Number, required: true },
  hasDisadvantageOnAttacks: { type: Function, required: true },
  hasAdvantageAgainstAttacks: { type: Function, required: true },
  getConditionDetails: { type: Function, required: true }
});

function addDeathSave(isSuccess: boolean) {
  characterStore.addDeathSave(props.character.id, isSuccess);
}

function resurrectCharacter() {
  characterStore.updateCharacter(props.character.id, {
    isDead: false,
    isStable: true,
    deathSavesSuccess: 0,
    deathSavesFail: 0
  });
}

// Génère la liste des tags d'état spéciaux à afficher
const specialTags = [
  {
    show: () => props.character && props.hasDisadvantageOnAttacks(props.character),
    key: 'disadvantage',
    bg: 'bg-red-50 text-red-700 border border-red-200',
    icon: () => '⚠️',
    label: 'Désavantage',
    tooltip: props.character && props.character.type === 'player' ?
      'Ce personnage a un désavantage aux jets d\'attaque' :
      'Ce monstre a un désavantage aux jets d\'attaque'
  },
  {
    show: () => props.character && props.hasAdvantageAgainstAttacks(props.character),
    key: 'advantage',
    bg: 'bg-green-50 text-green-700 border border-green-200',
    icon: () => '🎯',
    label: 'Avantage contre',
    tooltip: props.character && props.character.type === 'player' ?
      'Les attaques contre ce personnage ont un avantage' :
      'Les attaques contre ce monstre ont un avantage'
  },
];

</script>

<template>
  <div v-if="props.character">
    <div
      class="card-initiative"
      :class="[
        props.character.isDead
          ? (props.character.type === 'player' ? 'bg-gray-300 border-gray-400 opacity-70 grayscale' : 'bg-gray-300 border-gray-400 opacity-70 grayscale')
          : props.character.hp === 0
            ? 'bg-red-200 border-red-400 animate-flash-red'
            : (props.character.type === 'player' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'),
        props.character.type === 'player' ? 'ml-0 mr-auto' : 'ml-auto mr-0',
        'p-2 rounded-md flex justify-between items-center border hover:bg-opacity-70 w-full sm:w-1/2 cursor-pointer hover:shadow-md transition-all duration-200'
      ]"
      @click="$emit('cardClick', props.character)"
      style="position: relative;"
    >
      <div class="flex items-center">
        <div class="font-bold text-xl mr-3 w-6 text-center">{{ props.index + 1 }}</div>
        <div class="flex-grow flex flex-col min-w-0">
          <div class="flex items-center min-w-0">
            <span class="font-bold text-lg truncate max-w-[120px]">{{ props.character.name }}</span>
            <span v-if="props.character.isDead"
              class="ml-2 px-2 py-0.5 rounded-lg border-2 border-red-700 bg-gradient-to-r from-red-700 to-red-400 text-white text-xs font-bold flex items-center gap-1 shadow-sm animate-pulse"
              style="letter-spacing:0.03em; opacity:0.96;">
              <font-awesome-icon :icon="faSkull" class="w-4 h-4 mr-1 -ml-1 text-white/90" />
              Mort
            </span>
            <template v-if="!props.character.isDead">
              <template v-for="tag in specialTags" :key="tag.key">
                <span
                  v-if="tag.show && tag.show() && tag.bg && tag.label && tag.icon"
                  :class="[tag.bg, 'px-1.5 py-0.5 rounded text-xs font-semibold', 'ml-2']"
                  :title="tag.tooltip"
                >
                  <span class="mr-1">{{ tag.icon() }}</span>{{ tag.label }}
                </span>
              </template>
            </template>
          </div>
          <div v-if="!props.character.isDead" class="flex gap-2 mt-0.5 mb-0.5">
            <div class="flex items-center bg-white border border-gray-200 rounded px-2 py-0.5 shadow-sm text-xs font-semibold text-gray-700">
              <font-awesome-icon :icon="faDiceD20" class="h-4 w-4 text-purple-600 mr-1" />
              <span class="font-semibold text-base text-gray-800">{{ props.character.initiative }}</span>
            </div>
            <div class="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-0.5 shadow-sm text-xs font-semibold text-gray-700">
              <font-awesome-icon :icon="faBolt" class="h-4 w-4 text-yellow-500 mr-1" />
              <span>DEX</span>
              <span class="ml-1 text-base font-bold text-gray-900">{{ props.character.dexterity }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Interface jets contre la mort compacte, hover géré en pur CSS -->
      <div
        v-if="props.character.hp === 0 && !props.character.isDead && !props.character.isStable"
        class="absolute inset-x-0 top-2 z-20 flex items-center justify-center"
      >
        <div
          class="death-save-ui-compact group flex flex-col items-center gap-0.5 bg-white/80 rounded shadow px-2 py-1 border border-yellow-100 transition-all duration-200 opacity-60 scale-95 hover:opacity-100 hover:scale-100"
        >
          <div class="flex gap-2">
            <div class="flex gap-0.5">
              <span v-for="n in 3" :key="'success'+n" class="w-4 h-4 rounded-full border flex items-center justify-center text-xs transition-all duration-200"
                :class="n <= (props.character.deathSavesSuccess || 0) ? 'bg-green-400 border-green-600 text-white' : 'bg-white border-green-200 text-green-300'">
                <svg v-if="n <= (props.character.deathSavesSuccess || 0)" xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              </span>
            </div>
            <div class="flex gap-0.5">
              <span v-for="n in 3" :key="'fail'+n" class="w-4 h-4 rounded-full border flex items-center justify-center text-xs transition-all duration-200"
                :class="n <= (props.character.deathSavesFail || 0) ? 'bg-red-400 border-red-600 text-white' : 'bg-white border-red-200 text-red-300'">
                <svg v-if="n <= (props.character.deathSavesFail || 0)" xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </span>
            </div>
          </div>
          <div class="flex gap-1 mt-0.5 death-save-btns">
            <button class="px-1 py-0.5 bg-green-100 rounded hover:bg-green-200 border border-green-300 text-green-800 font-bold text-[11px] shadow transition" @click.stop="addDeathSave(true)">
              +1 ✓
            </button>
            <button class="px-1 py-0.5 bg-red-100 rounded hover:bg-red-200 border border-red-300 text-red-800 font-bold text-[11px] shadow transition" @click.stop="addDeathSave(false)">
              +1 ✗
            </button>
          </div>
        </div>
      </div>
      <!-- Bouton ressusciter simple et centré verticalement -->
      <div v-if="props.character.isDead" class="absolute right-2 top-1/2 -translate-y-1/2 flex justify-end pointer-events-auto">
        <button class="bg-yellow-100 border border-yellow-400 text-yellow-900 rounded px-2 py-0.5 font-bold shadow hover:bg-yellow-200 transition text-xs"
          style="min-width: 0; height: 28px; line-height: 1.1; padding-top: 2px; padding-bottom: 2px;"
          @click.stop="resurrectCharacter">
          Ressusciter
        </button>
      </div>
      <!-- Compteur d'états -->
      <Tooltip placement="top" :offset-distance="10">
        <div 
          class="relative flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold cursor-help"
          v-if="props.character.conditions && props.character.conditions.length > 0 && !props.character.isDead"
        >
          {{ props.character.conditions.length }}
        </div>
        <template #content>
          <div class="bg-gray-800 text-white text-xs rounded p-2" style="min-width: 200px; max-width: 300px;">
            <div class="font-semibold mb-1">États actifs :</div>
            <div class="grid grid-cols-1 gap-2">
              <div v-for="condition in props.character.conditions" :key="condition.condition.id" class="mb-2">
                <div class="font-medium text-blue-300">{{ props.getConditionDetails(condition).title }}</div>
                <ul v-if="props.getConditionDetails(condition).effects" class="list-disc pl-4 mt-1 text-gray-300 text-xs">
                  <li v-for="(effect, index) in props.getConditionDetails(condition).effects" :key="index" class="mb-1">
                    {{ effect }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </Tooltip>
    </div>
  </div>
</template>

<style scoped>
.bg-gradient-to-r.from-red-600.to-red-400 {
  background: linear-gradient(90deg, #dc2626 60%, #f87171 100%) !important;
  border-color: #dc2626 !important;
}
@keyframes flash-red {
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.25); }
  50% { box-shadow: 0 0 8px 2px rgba(220, 38, 38, 0.18); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.25); }
}
.animate-flash-red {
  animation: flash-red 1.2s infinite;
}
/* Retire toute trace des anciennes classes d'aura ou halo */
.divine-aura, .divine-halo, .divine-btn-glow { display: none !important; }
.death-save-ui-compact {
  min-width: 120px;
  max-width: 200px;
  box-shadow: 0 2px 10px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(255,220,100,0.05);
  cursor: pointer;
}
.death-save-ui-compact .death-save-btns {
  display: none;
}
.death-save-ui-compact:hover .death-save-btns {
  display: flex;
}
</style>
