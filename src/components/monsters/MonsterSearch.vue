<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMonsterStore } from '../../stores/monster';

const store = useMonsterStore();
const searchQuery = ref('');
const isLoading = ref(false);
const debouncedSearchTimeout = ref<number | null>(null);

// Debounced search function
function debouncedSearch() {
  // Clear any existing timeout
  if (debouncedSearchTimeout.value) {
    clearTimeout(debouncedSearchTimeout.value);
  }
  
  // Set a new timeout
  debouncedSearchTimeout.value = setTimeout(() => {
    performSearch();
  }, 300) as unknown as number;
}

// Perform the actual search
async function performSearch() {
  if (!searchQuery.value.trim()) {
    return;
  }
  
  isLoading.value = true;
  await store.searchMonsters(searchQuery.value);
  isLoading.value = false;
}

// Add a monster from the API
async function addMonster(url: string) {
  isLoading.value = true;
  const success = await store.addMonsterFromApi(url);
  isLoading.value = false;
  
  if (success) {
    // Clear search results after adding
    searchQuery.value = '';
    store.searchResults = [];
  }
}

// Watch for changes to the search query
watch(searchQuery, () => {
  debouncedSearch();
});
</script>

<template>
  <div class="mb-6">
    <h3 class="font-semibold mb-3">Rechercher un Monstre</h3>
    <div class="flex">
      <input 
        v-model="searchQuery" 
        placeholder="Rechercher un monstre (e.g. gobelin, dragon)" 
        class="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button 
        @click="performSearch" 
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-md cursor-pointer"
        :disabled="isLoading || !searchQuery.trim()"
      >
        <span v-if="isLoading">Recherche en cours...</span>
        <span v-else>Rechercher</span>
      </button>
    </div>
    
    <!-- Search Results -->
    <div v-if="store.searchResults.length > 0" class="mt-4 bg-white border rounded-md shadow-sm">
      <div class="p-3 border-b bg-gray-50 font-medium">
        {{ store.searchResults.length }} monstres trouvés
      </div>
      <ul class="divide-y">
        <li v-for="monster in store.searchResults" :key="monster.index" class="p-3 hover:bg-gray-50">
          <div class="flex justify-between items-center">
            <span class="font-medium">{{ monster.name }}</span>
            <button 
              @click="addMonster(monster.url)"
              class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
              :disabled="isLoading"
            >
              Ajouter
            </button>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- No Results Message -->
    <div v-else-if="searchQuery && !isLoading && store.searchResults.length === 0" class="mt-4 p-4 bg-gray-100 rounded-md text-center">
      Aucun monstre trouvé pour "{{ searchQuery }}".
    </div>
    
    <!-- Error Message -->
    <div v-if="store.searchError" class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
      Erreur : {{ store.searchError }}
    </div>
  </div>
</template>
