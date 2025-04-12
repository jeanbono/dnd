<script setup lang="ts">
import { ref } from 'vue';
import { useMonsterStore } from '@/stores/monster';

const monsterStore = useMonsterStore();

// Données du formulaire gérées localement
const monsterData = ref({
  name: '',
  initiative: 0,
  hp: 0,
  maxHp: 0,
  ac: 10,
  notes: '',
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  conditions: []
});

function handleSubmit() {
  monsterStore.addMonster(monsterData.value);
  resetForm();
}

function handleCancel() {
  monsterStore.toggleAddingMonster();
  resetForm();
}

function resetForm() {
  monsterData.value = {
    name: '',
    initiative: 0,
    hp: 0,
    maxHp: 0,
    ac: 10,
    notes: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    conditions: []
  };
}
</script>

<template>
  <div class="bg-gray-100 p-3 sm:p-4 rounded-md mb-4 sm:mb-6">
    <h3 class="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Ajouter un Monstre</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">Nom</label>
        <input 
          v-model="monsterData.name" 
          type="text" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">Initiative</label>
        <input 
          v-model.number="monsterData.initiative" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">PV</label>
        <input 
          v-model.number="monsterData.hp" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">PV Max</label>
        <input 
          v-model.number="monsterData.maxHp" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">CA</label>
        <input 
          v-model.number="monsterData.ac" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
    </div>
    
    <h4 class="font-semibold mt-3 sm:mt-4 mb-1 sm:mb-2 text-sm sm:text-base">Caractéristiques</h4>
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">FOR</label>
        <input 
          v-model.number="monsterData.strength" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">DEX</label>
        <input 
          v-model.number="monsterData.dexterity" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">CON</label>
        <input 
          v-model.number="monsterData.constitution" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">INT</label>
        <input 
          v-model.number="monsterData.intelligence" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">SAG</label>
        <input 
          v-model.number="monsterData.wisdom" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">CHA</label>
        <input 
          v-model.number="monsterData.charisma" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
    </div>
    
    <div class="mt-3 sm:mt-4">
      <label class="block text-xs sm:text-sm font-medium mb-1">Notes</label>
      <textarea 
        v-model="monsterData.notes" 
        class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md h-16 sm:h-24 text-sm"
      ></textarea>
    </div>
    
    <div class="flex flex-wrap gap-2 mt-3 sm:mt-4">
      <button 
        @click="handleSubmit" 
        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm flex-grow sm:flex-grow-0"
      >
        <span class="sm:hidden">+ Monstre</span>
        <span class="hidden sm:inline">Ajouter le Monstre</span>
      </button>
      <button 
        @click="handleCancel" 
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm"
      >
        Annuler
      </button>
    </div>
  </div>
</template>
