<script setup lang="ts">
import { ref } from 'vue';
import { useMonsterStore } from '../../stores/monster';

const monsterStore = useMonsterStore();

// Données du formulaire gérées localement
const monsterData = ref({
  name: '',
  initiative: 0,
  hp: 0,
  maxHp: 0,
  ac: 0,
  notes: '',
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
});

function handleSubmit() {
  monsterStore.addMonster(monsterData.value);
  resetForm();
}

function handleCancel() {
  monsterStore.cancelAddingMonster();
  resetForm();
}

function resetForm() {
  monsterData.value = {
    name: '',
    initiative: 0,
    hp: 0,
    maxHp: 0,
    ac: 0,
    notes: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  };
}
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-md mb-6">
    <h3 class="font-semibold mb-3">Ajouter un Monstre</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Nom</label>
        <input 
          v-model="monsterData.name" 
          type="text" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Initiative</label>
        <input 
          v-model.number="monsterData.initiative" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Points de Vie</label>
        <input 
          v-model.number="monsterData.hp" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Points de Vie Max</label>
        <input 
          v-model.number="monsterData.maxHp" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Classe d'Armure</label>
        <input 
          v-model.number="monsterData.ac" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
    </div>
    
    <h4 class="font-semibold mt-4 mb-2">Caractéristiques</h4>
    <div class="grid grid-cols-2 md:grid-cols-6 gap-2">
      <div>
        <label class="block text-sm font-medium mb-1">FOR</label>
        <input 
          v-model.number="monsterData.strength" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">DEX</label>
        <input 
          v-model.number="monsterData.dexterity" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">CON</label>
        <input 
          v-model.number="monsterData.constitution" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">INT</label>
        <input 
          v-model.number="monsterData.intelligence" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">SAG</label>
        <input 
          v-model.number="monsterData.wisdom" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">CHA</label>
        <input 
          v-model.number="monsterData.charisma" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
    </div>
    
    <div class="mt-4">
      <label class="block text-sm font-medium mb-1">Notes</label>
      <textarea 
        v-model="monsterData.notes" 
        class="w-full p-2 border border-gray-300 rounded-md h-24"
      ></textarea>
    </div>
    
    <div class="flex space-x-2 mt-4">
      <button 
        @click="handleSubmit" 
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer"
      >
        Ajouter le Monstre
      </button>
      <button 
        @click="handleCancel" 
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md cursor-pointer"
      >
        Annuler
      </button>
    </div>
  </div>
</template>
