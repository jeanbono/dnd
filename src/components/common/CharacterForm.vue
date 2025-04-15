<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useMonsterStore } from '@/stores/monster';
import { calculateAbilityModifier } from '@/utils/abilityUtils';
import { useForm, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

const props = defineProps<{
  characterType?: 'player' | 'monster';
  initialData?: any;
}>();

const playerStore = usePlayerStore();
const monsterStore = useMonsterStore();

// Determinant le type de personnage
const characterType = computed(() => props.characterType || 'player');

// Définition du schéma de validation avec yup
const validationSchema = yup.object({
  name: yup.string().required('Le nom est requis'),
  initiative: yup.number()
    .typeError('L\'initiative doit être un nombre')
    .required('L\'initiative est requise'),
  hp: yup.number().nullable().transform((value) => (isNaN(value) ? null : value))
    .typeError('Les points de vie doivent être un nombre'),
  maxHp: yup.number().nullable().transform((value) => (isNaN(value) ? null : value))
    .typeError('Les PV maximum doivent être un nombre'),
  ac: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
  dexterity: yup.number()
    .typeError('La dextérité doit être un nombre')
    .required('La dextérité est requise')
    .min(1, 'Doit être au moins 1'),
  strength: yup.number()
    .typeError('La force doit être un nombre')
    .required('La force est requise')
    .min(1, 'Doit être au moins 1'),
  constitution: yup.number()
    .typeError('La constitution doit être un nombre')
    .required('La constitution est requise')
    .min(1, 'Doit être au moins 1'),
  intelligence: yup.number()
    .typeError('L\'intelligence doit être un nombre')
    .required('L\'intelligence est requise')
    .min(1, 'Doit être au moins 1'),
  wisdom: yup.number()
    .typeError('La sagesse doit être un nombre')
    .required('La sagesse est requise')
    .min(1, 'Doit être au moins 1'),
  charisma: yup.number()
    .typeError('Le charisme doit être un nombre')
    .required('Le charisme est requis')
    .min(1, 'Doit être au moins 1'),
  notes: yup.string()
});

// Valeurs initiales pour le formulaire
const initialValues = {
  name: props.initialData?.name || '',
  initiative: props.initialData?.initiative || 0,
  hp: props.initialData?.hp || null,
  maxHp: props.initialData?.maxHp || null,
  ac: props.initialData?.ac || null,
  dexterity: props.initialData?.dexterity || 10,
  strength: props.initialData?.strength || 10,
  constitution: props.initialData?.constitution || 10,
  intelligence: props.initialData?.intelligence || 10,
  wisdom: props.initialData?.wisdom || 10,
  charisma: props.initialData?.charisma || 10,
  notes: props.initialData?.notes || ''
};

// Initialisation du formulaire avec vee-validate
const { handleSubmit, resetForm, values, errors, setFieldValue } = useForm({
  validationSchema,
  initialValues
});

// Gestionnaire de soumission
const onSubmit = handleSubmit((formValues) => {
  // Conversion des valeurs en nombre où nécessaire
  const processedValues = {
    ...formValues,
    initiative: Number(formValues.initiative),
    hp: formValues.hp !== null ? Number(formValues.hp) : undefined,
    maxHp: formValues.maxHp !== null ? Number(formValues.maxHp) : undefined,
    ac: formValues.ac !== null ? Number(formValues.ac) : undefined,
    dexterity: Number(formValues.dexterity),
    strength: Number(formValues.strength),
    constitution: Number(formValues.constitution),
    intelligence: Number(formValues.intelligence),
    wisdom: Number(formValues.wisdom),
    charisma: Number(formValues.charisma)
  };

  // Ajouter le personnage au store approprié
  if (characterType.value === 'player') {
    playerStore.addPlayer({
      ...processedValues,
      conditions: []
    });
    playerStore.cancelAddingPlayer();
  } else {
    monsterStore.addMonster({
      ...processedValues,
      conditions: []
    });
    monsterStore.toggleAddingMonster();
  }
  
  // Réinitialiser le formulaire
  resetForm();
});

// Getters pour l'interface
const dexModifier = computed(() => calculateAbilityModifier(Number(values.dexterity)));
const initiativeModifier = computed(() => dexModifier.value);

function cancelForm() {
  if (characterType.value === 'player') {
    playerStore.cancelAddingPlayer();
  } else {
    monsterStore.toggleAddingMonster();
  }
  resetForm();
}

function rollInitiative() {
  // Lancer un d20 pour l'initiative
  const roll = Math.floor(Math.random() * 20) + 1;
  setFieldValue('initiative', Math.max(1, roll + dexModifier.value));
}
</script>

<template>
  <div class="bg-white p-4 rounded-md shadow mb-4 border border-gray-200">
    <div class="mb-4">
      <h3 class="text-lg font-bold">{{ characterType === 'player' ? 'Ajouter un Joueur' : 'Ajouter un Monstre' }}</h3>
      <p class="text-sm text-gray-500">Remplissez le formulaire pour ajouter un {{ characterType === 'player' ? 'joueur' : 'monstre' }} à votre rencontre</p>
    </div>
    
    <form @submit.prevent="onSubmit" class="space-y-4">
      <!-- Nom et Initiative -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">
            Nom <span class="text-red-500">*</span>
          </label>
          <Field 
            name="name" 
            type="text" 
            class="w-full p-2 border rounded-md"
            :class="{ 'border-red-500 bg-red-50': errors.name, 'border-gray-300': !errors.name }"
            autofocus
          />
          <ErrorMessage name="name" class="mt-1 text-sm text-red-500" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">
            Initiative <span class="text-red-500">*</span>
          </label>
          <div class="flex">
            <Field 
              name="initiative" 
              type="number" 
              class="w-full p-2 border rounded-l-md"
              :class="{ 'border-red-500 bg-red-50': errors.initiative, 'border-gray-300': !errors.initiative }"
            />
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
          <ErrorMessage name="initiative" class="mt-1 text-sm text-red-500" />
          <p class="mt-1 text-xs text-gray-500">Modificateur d'initiative: {{ initiativeModifier >= 0 ? '+' + initiativeModifier : initiativeModifier }}</p>
        </div>
      </div>
      
      <!-- Points de vie et CA -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">Points de Vie <span class="text-gray-400 text-xs">(opt.)</span></label>
          <Field 
            name="hp" 
            type="number" 
            class="w-full p-2 border rounded-md"
            :class="{ 'border-red-500 bg-red-50': errors.hp, 'border-gray-300': !errors.hp }"
          />
          <ErrorMessage name="hp" class="mt-1 text-sm text-red-500" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">PV Maximum <span class="text-gray-400 text-xs">(opt.)</span></label>
          <Field 
            name="maxHp" 
            type="number" 
            class="w-full p-2 border rounded-md"
            :class="{ 'border-red-500 bg-red-50': errors.maxHp, 'border-gray-300': !errors.maxHp }"
          />
          <ErrorMessage name="maxHp" class="mt-1 text-sm text-red-500" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Classe d'Armure <span class="text-gray-400 text-xs">(opt.)</span></label>
          <Field 
            name="ac" 
            type="number" 
            class="w-full p-2 border rounded-md"
            :class="{ 'border-red-500 bg-red-50': errors.ac, 'border-gray-300': !errors.ac }"
          />
          <ErrorMessage name="ac" class="mt-1 text-sm text-red-500" />
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
            <Field 
              name="strength" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': errors.strength, 'border-gray-300': !errors.strength }"
            />
            <ErrorMessage name="strength" class="mt-1 text-sm text-red-500" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Dextérité <span class="text-red-500">*</span>
            </label>
            <Field 
              name="dexterity" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': errors.dexterity, 'border-gray-300': !errors.dexterity }"
            />
            <ErrorMessage name="dexterity" class="mt-1 text-sm text-red-500" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Constitution <span class="text-red-500">*</span>
            </label>
            <Field 
              name="constitution" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': errors.constitution, 'border-gray-300': !errors.constitution }"
            />
            <ErrorMessage name="constitution" class="mt-1 text-sm text-red-500" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Intelligence <span class="text-red-500">*</span>
            </label>
            <Field 
              name="intelligence" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': errors.intelligence, 'border-gray-300': !errors.intelligence }"
            />
            <ErrorMessage name="intelligence" class="mt-1 text-sm text-red-500" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Sagesse <span class="text-red-500">*</span>
            </label>
            <Field 
              name="wisdom" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': errors.wisdom, 'border-gray-300': !errors.wisdom }"
            />
            <ErrorMessage name="wisdom" class="mt-1 text-sm text-red-500" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">
              Charisme <span class="text-red-500">*</span>
            </label>
            <Field 
              name="charisma" 
              type="number" 
              class="w-full p-2 border rounded-md"
              :class="{ 'border-red-500 bg-red-50': errors.charisma, 'border-gray-300': !errors.charisma }"
            />
            <ErrorMessage name="charisma" class="mt-1 text-sm text-red-500" />
          </div>
        </div>
      </div>
      
      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium mb-1">Notes</label>
        <Field 
          as="textarea" 
          name="notes" 
          rows="3" 
          class="w-full p-2 border rounded-md"
          :class="{ 'border-red-500 bg-red-50': errors.notes, 'border-gray-300': !errors.notes }"
          placeholder="Ajoutez des notes supplémentaires ici..."
        />
        <ErrorMessage name="notes" class="mt-1 text-sm text-red-500" />
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