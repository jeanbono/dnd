<script setup lang="ts">
import { ref } from 'vue';
import { useMonsterStore } from '@/stores/monster';
import { isValidNumber } from '@/utils/validationUtils';

const monsterStore = useMonsterStore();

// Données du formulaire gérées localement
const monsterData = ref({
  name: '',
  initiative: undefined as number | undefined,
  hp: undefined as number | undefined,
  maxHp: undefined as number | undefined,
  ac: 10,
  notes: '',
  strength: undefined as number | undefined,
  dexterity: undefined as number | undefined,
  constitution: undefined as number | undefined,
  intelligence: undefined as number | undefined,
  wisdom: undefined as number | undefined,
  charisma: undefined as number | undefined,
  conditions: []
});

const formSubmitted = ref(false);

// Références pour les champs numériques
const strengthInput = ref<HTMLInputElement | null>(null);
const dexterityInput = ref<HTMLInputElement | null>(null);
const constitutionInput = ref<HTMLInputElement | null>(null);
const intelligenceInput = ref<HTMLInputElement | null>(null);
const wisdomInput = ref<HTMLInputElement | null>(null);
const charismaInput = ref<HTMLInputElement | null>(null);
const initiativeInput = ref<HTMLInputElement | null>(null);

function handleSubmit() {
  formSubmitted.value = true;
  // Vérifier que tous les champs obligatoires sont remplis
  if (
    monsterData.value.name && 
    isValidNumber(monsterData.value.initiative) &&
    isValidNumber(monsterData.value.strength) &&
    isValidNumber(monsterData.value.dexterity) &&
    isValidNumber(monsterData.value.constitution) &&
    isValidNumber(monsterData.value.intelligence) &&
    isValidNumber(monsterData.value.wisdom) &&
    isValidNumber(monsterData.value.charisma)
  ) {
    // S'assurer que tous les champs requis sont présents avec des valeurs par défaut si nécessaire
    const completeMonsterData = {
      name: monsterData.value.name,
      initiative: monsterData.value.initiative || 0,
      hp: monsterData.value.hp !== undefined ? monsterData.value.hp : 0,
      maxHp: monsterData.value.maxHp !== undefined ? monsterData.value.maxHp : 0,
      ac: monsterData.value.ac ?? 10,
      // Inclure toutes les caractéristiques
      strength: monsterData.value.strength,
      dexterity: monsterData.value.dexterity,
      constitution: monsterData.value.constitution,
      intelligence: monsterData.value.intelligence,
      wisdom: monsterData.value.wisdom,
      charisma: monsterData.value.charisma,
      notes: monsterData.value.notes ?? '',
      conditions: monsterData.value.conditions ?? []
    };
    
    monsterStore.addMonster(completeMonsterData);
    resetForm();
  } else {
    console.log("Validation échouée: champs obligatoires manquants", {
      name: !!monsterData.value.name,
      initiative: isValidNumber(monsterData.value.initiative),
      strength: isValidNumber(monsterData.value.strength),
      dexterity: isValidNumber(monsterData.value.dexterity),
      constitution: isValidNumber(monsterData.value.constitution),
      intelligence: isValidNumber(monsterData.value.intelligence),
      wisdom: isValidNumber(monsterData.value.wisdom),
      charisma: isValidNumber(monsterData.value.charisma)
    });
  }
}

function handleCancel() {
  monsterStore.toggleAddingMonster();
  resetForm();
}

function resetForm() {
  monsterData.value = {
    name: '',
    initiative: undefined,
    hp: undefined,
    maxHp: undefined,
    ac: 10,
    notes: '',
    strength: undefined,
    dexterity: undefined,
    constitution: undefined,
    intelligence: undefined,
    wisdom: undefined,
    charisma: undefined,
    conditions: []
  };
  formSubmitted.value = false;
}
</script>

<template>
  <!-- Formulaire d'ajout de monstre -->
  <div class="bg-gray-100 p-3 sm:p-4 rounded-md mb-4 sm:mb-6">
    <h3 class="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Ajouter un Monstre</h3>
    
    <!-- Champs obligatoires -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3">
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">
          Nom <span class="text-red-500">*</span>
        </label>
        <input 
          v-model="monsterData.name" 
          type="text" 
          class="w-full p-1.5 sm:p-2 border rounded-md text-sm"
          :class="{ 'border-red-500 bg-red-50': monsterData.name === '' && formSubmitted, 'border-gray-300': !(monsterData.name === '' && formSubmitted) }"
          required
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">
          Initiative <span class="text-red-500">*</span>
        </label>
        <input 
          v-model.number="monsterData.initiative" 
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
            v-model.number="monsterData.strength" 
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
            v-model.number="monsterData.dexterity" 
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
            v-model.number="monsterData.constitution" 
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
            v-model.number="monsterData.intelligence" 
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
            v-model.number="monsterData.wisdom" 
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
            v-model.number="monsterData.charisma" 
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
          v-model.number="monsterData.hp" 
          type="number" 
          class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
        >
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium mb-1">PV Max <span class="text-gray-400 text-xs">(opt.)</span></label>
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
    
    <div class="mt-3">
      <label class="block text-xs sm:text-sm font-medium mb-1">Notes</label>
      <textarea 
        v-model="monsterData.notes" 
        rows="2" 
        class="w-full p-1.5 sm:p-2 border border-gray-300 rounded-md text-sm"
      ></textarea>
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
