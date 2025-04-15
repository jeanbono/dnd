<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useMonsterStore } from '@/stores/monster';
import { isValidNumber } from '@/utils/validationUtils';
import { calculateAbilityModifier } from '@/utils/abilityUtils';

const props = defineProps<{
  characterType?: 'player' | 'monster';
  initialData?: any;
}>();

const playerStore = usePlayerStore();
const monsterStore = useMonsterStore();

// Determinant le type de personnage
const characterType = computed(() => props.characterType || 'player');

// Données de formulaire
const formData = ref({
  name: props.initialData?.name || '',
  initiative: props.initialData?.initiative || 0,
  hp: props.initialData?.hp,
  maxHp: props.initialData?.maxHp,
  ac: props.initialData?.ac || 10,
  dexterity: props.initialData?.dexterity || 10,
  strength: props.initialData?.strength || 10,
  constitution: props.initialData?.constitution || 10,
  intelligence: props.initialData?.intelligence || 10,
  wisdom: props.initialData?.wisdom || 10,
  charisma: props.initialData?.charisma || 10,
  notes: props.initialData?.notes || ''
});

// État de validation
const formSubmitted = ref(false);
const nameInput = ref<HTMLInputElement | null>(null);
const dexterityInput = ref<HTMLInputElement | null>(null);
const strengthInput = ref<HTMLInputElement | null>(null);
const constitutionInput = ref<HTMLInputElement | null>(null);
const intelligenceInput = ref<HTMLInputElement | null>(null);
const wisdomInput = ref<HTMLInputElement | null>(null);
const charismaInput = ref<HTMLInputElement | null>(null);

// Getters pour l'interface
const dexModifier = computed(() => calculateAbilityModifier(formData.value.dexterity));
const initiativeModifier = computed(() => dexModifier.value);

// Actions
function submitForm() {
  formSubmitted.value = true;
  
  // Vérification que tous les champs obligatoires sont remplis
  if (
    formData.value.name && 
    isValidNumber(formData.value.dexterity) &&
    isValidNumber(formData.value.strength) &&
    isValidNumber(formData.value.constitution) &&
    isValidNumber(formData.value.intelligence) &&
    isValidNumber(formData.value.wisdom) &&
    isValidNumber(formData.value.charisma)
  ) {
    // Ajouter le personnage au store approprié
    if (characterType.value === 'player') {
      playerStore.addPlayer({
        name: formData.value.name,
        initiative: formData.value.initiative,
        hp: formData.value.hp,
        maxHp: formData.value.maxHp,
        ac: formData.value.ac,
        dexterity: formData.value.dexterity,
        strength: formData.value.strength,
        constitution: formData.value.constitution,
        intelligence: formData.value.intelligence,
        wisdom: formData.value.wisdom,
        charisma: formData.value.charisma,
        notes: formData.value.notes,
        conditions: []
      });
      playerStore.cancelAddingPlayer();
    } else {
      monsterStore.addMonster({
        name: formData.value.name,
        initiative: formData.value.initiative,
        hp: formData.value.hp,
        maxHp: formData.value.maxHp,
        ac: formData.value.ac,
        dexterity: formData.value.dexterity,
        strength: formData.value.strength,
        constitution: formData.value.constitution,
        intelligence: formData.value.intelligence,
        wisdom: formData.value.wisdom,
        charisma: formData.value.charisma,
        notes: formData.value.notes,
        conditions: []
      });
      monsterStore.toggleAddingMonster();
    }
    
    // Réinitialiser le formulaire
    resetForm();
  } else {
    console.log("Validation échouée: champs obligatoires manquants", {
      name: !!formData.value.name,
      dexterity: isValidNumber(formData.value.dexterity),
      strength: isValidNumber(formData.value.strength),
      constitution: isValidNumber(formData.value.constitution),
      intelligence: isValidNumber(formData.value.intelligence),
      wisdom: isValidNumber(formData.value.wisdom),
      charisma: isValidNumber(formData.value.charisma)
    });
  }
}

function cancelForm() {
  if (characterType.value === 'player') {
    playerStore.cancelAddingPlayer();
  } else {
    monsterStore.toggleAddingMonster();
  }
  resetForm();
}

function resetForm() {
  formData.value = {
    name: '',
    initiative: 0,
    hp: undefined,
    maxHp: undefined,
    ac: 10,
    dexterity: 10,
    strength: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    notes: ''
  };
  formSubmitted.value = false;
}

function rollInitiative() {
  // Lancer un d20 pour l'initiative
  const roll = Math.floor(Math.random() * 20) + 1;
  formData.value.initiative = Math.max(1, roll + dexModifier.value);
}
</script>

<template>
  <div class="bg-white p-4 rounded-md shadow mb-4 border border-gray-200">
    <div class="mb-4">
      <h3 class="text-lg font-bold">{{ characterType === 'player' ? 'Ajouter un Joueur' : 'Ajouter un Monstre' }}</h3>
      <p class="text-sm text-gray-500">Remplissez le formulaire pour ajouter un {{ characterType === 'player' ? 'joueur' : 'monstre' }} à votre rencontre</p>
    </div>
    
    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Nom et Initiative -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">
            Nom <span class="text-red-500">*</span>
          </label>
          <div>
            <input 
              v-model="formData.name" 
              type="text" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': formData.name === '' && formSubmitted, 'border-gray-300': !(formData.name === '' && formSubmitted) }"
              ref="nameInput"
              autofocus
              required
            >
            <p v-if="formData.name === '' && formSubmitted" class="mt-1 text-sm text-red-500">Le nom est requis</p>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Initiative</label>
          <div class="flex">
            <input 
              v-model.number="formData.initiative" 
              type="number" 
              class="w-full p-2 border border-gray-300 rounded-l-md"
              required
            >
            <button 
              type="button" 
              @click="rollInitiative" 
              class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-r-md"
              title="Lancer l'initiative (1d20 + modificateur de Dextérité)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500">Modificateur d'initiative: {{ initiativeModifier >= 0 ? '+' + initiativeModifier : initiativeModifier }}</p>
        </div>
      </div>
      
      <!-- Points de vie et CA -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">Points de Vie <span class="text-gray-400 text-xs">(opt.)</span></label>
          <input 
            v-model.number="formData.hp" 
            type="number" 
            class="w-full p-2 border border-gray-300 rounded-md"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">PV Maximum <span class="text-gray-400 text-xs">(opt.)</span></label>
          <input 
            v-model.number="formData.maxHp" 
            type="number" 
            class="w-full p-2 border border-gray-300 rounded-md"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Classe d'Armure</label>
          <input 
            v-model.number="formData.ac" 
            type="number" 
            class="w-full p-2 border border-gray-300 rounded-md"
          >
        </div>
      </div>
      
      <!-- Caractéristiques -->
      <div class="bg-gray-50 p-3 rounded-md border border-gray-200 mb-3">
        <h4 class="text-sm font-medium mb-2">Caractéristiques</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label class="block text-xs font-medium mb-1">
              Force <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="formData.strength" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && strengthInput && strengthInput.value === '', 'border-gray-300': !(formSubmitted && strengthInput && strengthInput.value === '') }"
              ref="strengthInput"
              required
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Dextérité <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="formData.dexterity" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && dexterityInput && dexterityInput.value === '', 'border-gray-300': !(formSubmitted && dexterityInput && dexterityInput.value === '') }"
              ref="dexterityInput"
              required
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Constitution <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="formData.constitution" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && constitutionInput && constitutionInput.value === '', 'border-gray-300': !(formSubmitted && constitutionInput && constitutionInput.value === '') }"
              ref="constitutionInput"
              required
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Intelligence <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="formData.intelligence" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && intelligenceInput && intelligenceInput.value === '', 'border-gray-300': !(formSubmitted && intelligenceInput && intelligenceInput.value === '') }"
              ref="intelligenceInput"
              required
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Sagesse <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="formData.wisdom" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && wisdomInput && wisdomInput.value === '', 'border-gray-300': !(formSubmitted && wisdomInput && wisdomInput.value === '') }"
              ref="wisdomInput"
              required
            >
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Charisme <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="formData.charisma" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': formSubmitted && charismaInput && charismaInput.value === '', 'border-gray-300': !(formSubmitted && charismaInput && charismaInput.value === '') }"
              ref="charismaInput"
              required
            >
          </div>
        </div>
      </div>
      
      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium mb-1">Notes</label>
        <textarea 
          v-model="formData.notes" 
          rows="3" 
          class="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Ajoutez des notes supplémentaires ici..."
        ></textarea>
      </div>
      
      <!-- Boutons -->
      <div class="flex justify-end space-x-2">
        <button 
          type="button" 
          @click="cancelForm" 
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Ajouter
        </button>
      </div>
    </form>
  </div>
</template>