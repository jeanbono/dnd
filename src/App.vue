<script setup lang="ts">
import MonsterList from './components/monsters/MonsterList.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-indigo-800 text-white p-4 shadow-md">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-2xl font-bold">D&D Combat Tracker</h1>
      </div>
    </header>
    
    <main class="max-w-4xl mx-auto py-6 px-4">
      <MonsterList />
    </main>
    
    <footer class="mt-12 py-4 border-t border-gray-200 text-center text-gray-500 text-sm">
      <p>D&D Combat Tracker &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style scoped>
/* No styles defined */
</style>
