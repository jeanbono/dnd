<script setup lang="ts">
import { ref, computed, defineEmits, defineProps } from 'vue';
import { type Player } from '../../stores/player';

const props = defineProps<{
  editingPlayer: string | null;
  initialData?: Partial<Player>;
}>();

const emit = defineEmits<{
  add: [];
  save: [id: string];
  cancel: [];
}>();

const playerData = ref<Partial<Player>>({
  name: '',
  initiative: 0,
  dexterity: 10,
  ...props.initialData
});

const isEditing = computed(() => !!props.editingPlayer);

function handleSubmit() {
  if (isEditing.value && props.editingPlayer) {
    emit('save', props.editingPlayer);
  } else {
    emit('add');
  }
}

function handleCancel() {
  emit('cancel');
}

// Expose playerData to parent component
defineExpose({ playerData });
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-md mb-6">
    <h3 class="font-semibold mb-3">{{ isEditing ? 'Modifier le Joueur' : 'Ajouter un Joueur' }}</h3>
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
        {{ isEditing ? 'Enregistrer les Modifications' : 'Ajouter le Joueur' }}
      </button>
      <button 
        v-if="isEditing" 
        @click="handleCancel" 
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md cursor-pointer"
      >
        Annuler
      </button>
    </div>
  </div>
</template>
