<script setup lang="ts">
import { ref } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();

// Données du formulaire gérées localement
const playerData = ref({
  name: '',
  initiative: undefined as number | undefined, // Valeur vide par défaut
  hp: undefined,
  maxHp: undefined,
  ac: 10,
  dexterity: undefined as number | undefined, // Dextérité vide par défaut
  notes: '',
  conditions: []
});

const formSubmitted = ref(false);
const initiativeInput = ref<HTMLInputElement | null>(null);
const dexterityInput = ref<HTMLInputElement | null>(null);

function handleSubmit() {
  formSubmitted.value = true;
  // Vérifier que le nom, l'initiative et la dextérité sont remplis
  if (
    playerData.value.name && 
    initiativeInput.value && initiativeInput.value.value !== '' &&
    dexterityInput.value && dexterityInput.value.value !== ''
  ) {
    // S'assurer que tous les champs requis sont présents avec des valeurs par défaut si nécessaire
    const completePlayerData = {
      name: playerData.value.name,
      initiative: playerData.value.initiative || 0, // Utiliser 0 comme valeur par défaut si undefined
      hp: playerData.value.hp !== undefined ? playerData.value.hp : undefined,
      maxHp: playerData.value.maxHp !== undefined ? playerData.value.maxHp : undefined,
      ac: playerData.value.ac ?? 10,
      dexterity: playerData.value.dexterity || 0, // Utiliser 0 comme valeur par défaut si undefined
      notes: playerData.value.notes ?? '',
      conditions: playerData.value.conditions ?? []
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
    initiative: undefined,
    hp: undefined,
    maxHp: undefined,
    ac: 10,
    dexterity: undefined,
    notes: '',
    conditions: []
  };
  formSubmitted.value = false;
}
</script>

<template>
  <div class="bg-gray-100 p-3 sm:p-4 rounded-md mb-4 sm:mb-6">
    <h3 class="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Ajouter un Joueur</h3>
    
    <!-- Champs obligatoires -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-3">
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">
          Nom <span class="text-red-500">*</span>
        </label>
        <input 
          v-model="playerData.name" 
          type="text" 
          class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
          :class="{ 'border-red-500 bg-red-50': playerData.name === '' && formSubmitted, 'border-gray-300': !(playerData.name === '' && formSubmitted) }"
          required
        >
        <p v-if="playerData.name === '' && formSubmitted" class="mt-0.5 text-xs text-red-500">
          Le nom est obligatoire
        </p>
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">
          Initiative <span class="text-red-500">*</span>
        </label>
        <input 
          v-model.number="playerData.initiative" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
          :class="{ 'border-red-500 bg-red-50': formSubmitted && initiativeInput && initiativeInput.value === '', 'border-gray-300': !(formSubmitted && initiativeInput && initiativeInput.value === '') }"
          ref="initiativeInput"
          required
        >
        <p v-if="formSubmitted && initiativeInput && initiativeInput.value === ''" class="mt-0.5 text-xs text-red-500">
          L'initiative est obligatoire
        </p>
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">
          Dextérité <span class="text-red-500">*</span>
        </label>
        <input 
          v-model.number="playerData.dexterity" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
          :class="{ 'border-red-500 bg-red-50': formSubmitted && dexterityInput && dexterityInput.value === '', 'border-gray-300': !(formSubmitted && dexterityInput && dexterityInput.value === '') }"
          ref="dexterityInput"
          required
        >
        <p v-if="formSubmitted && dexterityInput && dexterityInput.value === ''" class="mt-0.5 text-xs text-red-500">
          La dextérité est obligatoire
        </p>
      </div>
    </div>
    
    <!-- Champs optionnels -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">PV <span class="text-gray-400 text-xs">(opt.)</span></label>
        <input 
          v-model.number="playerData.hp" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">PV Max <span class="text-gray-400 text-xs">(opt.)</span></label>
        <input 
          v-model.number="playerData.maxHp" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">CA</label>
        <input 
          v-model.number="playerData.ac" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
    </div>
    
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4">
      <p class="text-xs text-gray-500 mb-2 sm:mb-0">Les champs marqués d'un <span class="text-red-500">*</span> sont obligatoires</p>
      
      <div class="flex flex-wrap gap-2">
        <button 
          @click="handleCancel" 
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm"
        >
          Annuler
        </button>
        <button 
          @click="handleSubmit" 
          class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm"
        >
          Ajouter
        </button>
      </div>
    </div>
  </div>
</template>
