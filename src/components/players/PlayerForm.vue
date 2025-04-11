<script setup lang="ts">
import { ref } from 'vue';
import { usePlayerStore } from '../../stores/player';

const playerStore = usePlayerStore();

// Données du formulaire gérées localement
const playerData = ref({
  name: '',
  initiative: 0,
  dexterity: 10,
  notes: ''
});

function handleSubmit() {
  if (playerData.value.name) {
    // S'assurer que tous les champs requis sont présents avec des valeurs par défaut si nécessaire
    const completePlayerData = {
      name: playerData.value.name,
      initiative: playerData.value.initiative ?? 0,
      dexterity: playerData.value.dexterity ?? 10,
      notes: playerData.value.notes ?? ''
    };
    
    playerStore.addPlayer(completePlayerData);
    resetForm();
  }
}

function handleCancel() {
  playerStore.cancelAddingPlayer();
  resetForm();
}

function resetForm() {
  playerData.value = {
    name: '',
    initiative: 0,
    dexterity: 10,
    notes: ''
  };
}
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-md mb-6">
    <h3 class="font-semibold mb-3">Ajouter un Joueur</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Nom</label>
        <input 
          v-model="playerData.name" 
          type="text" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Initiative</label>
        <input 
          v-model.number="playerData.initiative" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Dextérité</label>
        <input 
          v-model.number="playerData.dexterity" 
          type="number" 
          class="w-full p-2 border border-gray-300 rounded-md"
        >
      </div>
    </div>
    
    <div class="flex space-x-2 mt-4">
      <button 
        @click="handleSubmit" 
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer"
      >
        Ajouter le Joueur
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
