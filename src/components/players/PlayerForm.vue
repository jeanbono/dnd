<script setup lang="ts">
import { ref } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { isValidNumber } from '@/utils/validationUtils';

const playerStore = usePlayerStore();

// Données du formulaire gérées localement
const playerData = ref({
  name: '',
  initiative: undefined as number | undefined, // Valeur vide par défaut
  hp: undefined,
  maxHp: undefined,
  ac: 10,
  // Toutes les caractéristiques de D&D
  strength: undefined as number | undefined,
  dexterity: undefined as number | undefined,
  constitution: undefined as number | undefined,
  intelligence: undefined as number | undefined,
  wisdom: undefined as number | undefined,
  charisma: undefined as number | undefined,
  notes: '',
  conditions: []
});

const formSubmitted = ref(false);

// Référence pour les inputs numériques
const initiativeInput = ref<HTMLInputElement | null>(null);
const strengthInput = ref<HTMLInputElement | null>(null);
const dexterityInput = ref<HTMLInputElement | null>(null);
const constitutionInput = ref<HTMLInputElement | null>(null);
const intelligenceInput = ref<HTMLInputElement | null>(null);
const wisdomInput = ref<HTMLInputElement | null>(null);
const charismaInput = ref<HTMLInputElement | null>(null);

function handleSubmit() {
  formSubmitted.value = true;
  // Vérifier que tous les champs obligatoires sont remplis
  if (
    playerData.value.name && 
    isValidNumber(playerData.value.initiative) &&
    isValidNumber(playerData.value.strength) &&
    isValidNumber(playerData.value.dexterity) &&
    isValidNumber(playerData.value.constitution) &&
    isValidNumber(playerData.value.intelligence) &&
    isValidNumber(playerData.value.wisdom) &&
    isValidNumber(playerData.value.charisma)
  ) {
    // S'assurer que tous les champs requis sont présents avec des valeurs par défaut si nécessaire
    const completePlayerData = {
      name: playerData.value.name,
      initiative: playerData.value.initiative || 0, // Utiliser 0 comme valeur par défaut si undefined
      hp: playerData.value.hp !== undefined ? playerData.value.hp : undefined,
      maxHp: playerData.value.maxHp !== undefined ? playerData.value.maxHp : undefined,
      ac: playerData.value.ac ?? 10,
      // Inclure toutes les caractéristiques
      strength: playerData.value.strength || 10,
      dexterity: playerData.value.dexterity || 10,
      constitution: playerData.value.constitution || 10,
      intelligence: playerData.value.intelligence || 10,
      wisdom: playerData.value.wisdom || 10,
      charisma: playerData.value.charisma || 10,
      notes: playerData.value.notes ?? '',
      conditions: playerData.value.conditions ?? []
    };
    
    playerStore.addPlayer(completePlayerData);
    resetForm();
  } else {
    console.log("Validation échouée: champs obligatoires manquants", {
      name: !!playerData.value.name,
      initiative: isValidNumber(playerData.value.initiative),
      strength: isValidNumber(playerData.value.strength),
      dexterity: isValidNumber(playerData.value.dexterity),
      constitution: isValidNumber(playerData.value.constitution),
      intelligence: isValidNumber(playerData.value.intelligence),
      wisdom: isValidNumber(playerData.value.wisdom),
      charisma: isValidNumber(playerData.value.charisma)
    });
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
    strength: undefined,
    dexterity: undefined,
    constitution: undefined,
    intelligence: undefined,
    wisdom: undefined,
    charisma: undefined,
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
      </div>
    </div>
    
    <!-- Caractéristiques -->
    <div class="bg-gray-50 p-3 rounded-md border border-gray-200 mb-3">
      <h3 class="text-sm font-medium mb-2">Caractéristiques</h3>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <div>
          <label class="block text-xs font-medium mb-1">Force <span class="text-red-500">*</span></label>
          <input 
            v-model.number="playerData.strength" 
            type="number" 
            class="w-full p-1.5 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': formSubmitted && strengthInput && strengthInput.value === '', 'border-gray-300': !(formSubmitted && strengthInput && strengthInput.value === '') }"
            required
            ref="strengthInput"
          >
        </div>
        <div>
          <label class="block text-xs font-medium mb-1">Dextérité <span class="text-red-500">*</span></label>
          <input 
            v-model.number="playerData.dexterity" 
            type="number" 
            class="w-full p-1.5 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': formSubmitted && dexterityInput && dexterityInput.value === '', 'border-gray-300': !(formSubmitted && dexterityInput && dexterityInput.value === '') }"
            required
            ref="dexterityInput"
          >
        </div>
        <div>
          <label class="block text-xs font-medium mb-1">Constitution <span class="text-red-500">*</span></label>
          <input 
            v-model.number="playerData.constitution" 
            type="number" 
            class="w-full p-1.5 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': formSubmitted && constitutionInput && constitutionInput.value === '', 'border-gray-300': !(formSubmitted && constitutionInput && constitutionInput.value === '') }"
            required
            ref="constitutionInput"
          >
        </div>
        <div>
          <label class="block text-xs font-medium mb-1">Intelligence <span class="text-red-500">*</span></label>
          <input 
            v-model.number="playerData.intelligence" 
            type="number" 
            class="w-full p-1.5 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': formSubmitted && intelligenceInput && intelligenceInput.value === '', 'border-gray-300': !(formSubmitted && intelligenceInput && intelligenceInput.value === '') }"
            required
            ref="intelligenceInput"
          >
        </div>
        <div>
          <label class="block text-xs font-medium mb-1">Sagesse <span class="text-red-500">*</span></label>
          <input 
            v-model.number="playerData.wisdom" 
            type="number" 
            class="w-full p-1.5 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': formSubmitted && wisdomInput && wisdomInput.value === '', 'border-gray-300': !(formSubmitted && wisdomInput && wisdomInput.value === '') }"
            required
            ref="wisdomInput"
          >
        </div>
        <div>
          <label class="block text-xs font-medium mb-1">Charisme <span class="text-red-500">*</span></label>
          <input 
            v-model.number="playerData.charisma" 
            type="number" 
            class="w-full p-1.5 border rounded-md text-sm"
            :class="{ 'border-red-500 bg-red-50': formSubmitted && charismaInput && charismaInput.value === '', 'border-gray-300': !(formSubmitted && charismaInput && charismaInput.value === '') }"
            required
            ref="charismaInput"
          >
        </div>
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
