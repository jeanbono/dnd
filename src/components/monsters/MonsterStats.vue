<script setup lang="ts">
import { computed } from 'vue';
import { useMonsterStore } from '@/stores/monster';
import { getAbilityScoreDisplay } from '@/utils/abilityUtils';

const props = defineProps<{
  monsterId: string;
}>();

const monsterStore = useMonsterStore();
const monster = computed(() => monsterStore.getMonsterById(props.monsterId));
</script>

<template>
  <div class="p-3" v-if="monster">
    <!-- Version mobile: 3 colonnes -->
    <div class="grid grid-cols-3 gap-4 md:hidden">
      <div class="text-center">
        <div class="font-medium text-gray-700">FOR</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.strength) }}</div>
      </div>
      <div class="text-center">
        <div class="font-medium text-gray-700">DEX</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.dexterity) }}</div>
      </div>
      <div class="text-center">
        <div class="font-medium text-gray-700">CON</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.constitution) }}</div>
      </div>
      <div class="text-center">
        <div class="font-medium text-gray-700">INT</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.intelligence) }}</div>
      </div>
      <div class="text-center">
        <div class="font-medium text-gray-700">SAG</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.wisdom) }}</div>
      </div>
      <div class="text-center">
        <div class="font-medium text-gray-700">CHA</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.charisma) }}</div>
      </div>
    </div>
    
    <!-- Version desktop: 6 colonnes -->
    <div class="hidden md:flex md:justify-between md:items-center md:gap-4">
      <div class="text-center flex-1">
        <div class="font-medium text-gray-700">FOR</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.strength) }}</div>
      </div>
      <div class="text-center flex-1">
        <div class="font-medium text-gray-700">DEX</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.dexterity) }}</div>
      </div>
      <div class="text-center flex-1">
        <div class="font-medium text-gray-700">CON</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.constitution) }}</div>
      </div>
      <div class="text-center flex-1">
        <div class="font-medium text-gray-700">INT</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.intelligence) }}</div>
      </div>
      <div class="text-center flex-1">
        <div class="font-medium text-gray-700">SAG</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.wisdom) }}</div>
      </div>
      <div class="text-center flex-1">
        <div class="font-medium text-gray-700">CHA</div>
        <div class="bg-gray-100 rounded-md py-1 px-2">{{ getAbilityScoreDisplay(monster.charisma) }}</div>
      </div>
    </div>
  </div>
</template>
