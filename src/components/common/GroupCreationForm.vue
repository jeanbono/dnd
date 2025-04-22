<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCharacterStore } from '@/stores/character';
import { CharacterType } from '@/types/character';

const props = defineProps<{
  characterType: CharacterType;
}>();

const emit = defineEmits(['submit', 'cancel']);

const characterStore = useCharacterStore();
const groupName = ref('');
const selectedCharacterIds = ref<string[]>([]);

const availableCharacters = computed(() => {
  if (props.characterType === CharacterType.PLAYER) {
    return characterStore.characters.filter(c => 
      c.type === CharacterType.PLAYER && !characterStore.getCharacterGroup(c.id)
    );
  } else {
    return characterStore.characters.filter(c => 
      c.type === CharacterType.MONSTER && !characterStore.getCharacterGroup(c.id)
    );
  }
});

function handleSubmit() {
  if (groupName.value.trim() && selectedCharacterIds.value.length >= 2) {
    emit('submit', {
      name: groupName.value.trim(),
      characterIds: selectedCharacterIds.value,
      type: props.characterType
    });
    resetForm();
  }
}

function resetForm() {
  groupName.value = '';
  selectedCharacterIds.value = [];
}

function toggleCharacterSelection(characterId: string) {
  const index = selectedCharacterIds.value.indexOf(characterId);
  if (index === -1) {
    selectedCharacterIds.value.push(characterId);
  } else {
    selectedCharacterIds.value.splice(index, 1);
  }
}

function cancel() {
  resetForm();
  emit('cancel');
}
</script>

<template>
  <div class="bg-white p-4 rounded-md shadow mb-4 border border-gray-200">
    <h3 class="text-lg font-semibold mb-4">Créer un nouveau groupe</h3>
    
    <div class="mb-4">
      <label for="groupName" class="block text-sm font-medium text-gray-700 mb-1">Nom du groupe</label>
      <input 
        id="groupName" 
        v-model="groupName" 
        type="text" 
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Nom du groupe"
      />
    </div>
    
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Sélectionner les personnages (minimum 2)</label>
      
      <div v-if="availableCharacters.length === 0" class="text-center py-4 bg-gray-100 rounded-md">
        <p class="text-gray-500">Aucun personnage disponible pour créer un groupe.</p>
      </div>
      
      <div v-else class="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
        <div 
          v-for="character in availableCharacters" 
          :key="character.id"
          class="flex items-center p-2 hover:bg-gray-50 rounded-md"
        >
          <input 
            type="checkbox" 
            :id="`character-${character.id}`" 
            :value="character.id" 
            :checked="selectedCharacterIds.includes(character.id)"
            @change="toggleCharacterSelection(character.id)"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label :for="`character-${character.id}`" class="ml-2 block text-sm text-gray-900">
            {{ character.name }} (Initiative: {{ character.initiative }})
          </label>
        </div>
      </div>
      
      <div v-if="selectedCharacterIds.length > 0" class="mt-2 text-sm text-gray-600">
        {{ selectedCharacterIds.length }} personnage(s) sélectionné(s)
      </div>
      <div v-if="selectedCharacterIds.length === 1" class="mt-1 text-sm text-red-500">
        Vous devez sélectionner au moins 2 personnages pour créer un groupe
      </div>
    </div>
    
    <div class="flex justify-end space-x-3">
      <button 
        @click="cancel" 
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Annuler
      </button>
      <button 
        @click="handleSubmit" 
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        :disabled="groupName.trim() === '' || selectedCharacterIds.length < 2"
        :class="{ 'opacity-50 cursor-not-allowed': groupName.trim() === '' || selectedCharacterIds.length < 2 }"
      >
        Créer le groupe
      </button>
    </div>
  </div>
</template>
