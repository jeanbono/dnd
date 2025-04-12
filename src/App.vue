<script setup lang="ts">
import MonsterList from './components/monsters/MonsterList.vue'
import PlayerList from './components/players/PlayerList.vue'
import InitiativeOrder from './components/initiative/InitiativeOrder.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-indigo-800 text-white p-4 shadow-md">
      <div class="w-full max-w-4xl mx-auto px-2 sm:px-4">
        <h1 class="text-xl sm:text-2xl font-bold">D&D Combat Tracker</h1>
      </div>
    </header>
    
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
