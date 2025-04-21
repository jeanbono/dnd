<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import MonsterList from './components/monsters/MonsterList.vue'
import PlayerList from './components/players/PlayerList.vue'
import InitiativeOrder from './components/initiative/InitiativeOrder.vue'

const showScrollTop = ref(false);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleScroll() {
  showScrollTop.value = window.scrollY > 200;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-indigo-800 text-white p-4 shadow-md">
      <div class="w-full max-w-4xl mx-auto px-2 sm:px-4">
        <h1 class="text-xl sm:text-2xl font-bold">D&D Combat Tracker</h1>
      </div>
    </header>

    <!-- Bouton remonter en haut -->
    <button
      v-show="showScrollTop"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-200"
      aria-label="Remonter en haut"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </button>

    <main class="w-full max-w-4xl mx-auto py-4 sm:py-6 px-2 sm:px-4">
      <!-- Initiative Order Component -->
      <section class="bg-white p-3 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8">
        <InitiativeOrder />
      </section>
      
      <!-- Players Section -->
      <section class="bg-white p-3 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8">
        <PlayerList />
      </section>
      
      <!-- Monsters Section -->
      <section class="bg-white p-3 sm:p-6 rounded-lg shadow-md">
        <MonsterList />
      </section>
    </main>
    
    <footer class="mt-8 sm:mt-12 py-4 border-t border-gray-200 text-center text-gray-500 text-sm">
      <p>D&D Combat Tracker &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style scoped>
/* Styles responsifs supplémentaires */
@media (max-width: 640px) {
  section {
    border-radius: 0.5rem;
  }
}
</style>
