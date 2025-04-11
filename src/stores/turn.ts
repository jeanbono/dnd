import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTurnStore = defineStore('turn', () => {
  // État
  const currentTurn = ref(1);
  
  // Actions
  function nextTurn() {
    currentTurn.value++;
  }
  
  function resetTurn() {
    currentTurn.value = 1;
  }
  
  function setTurn(turn: number) {
    if (turn >= 1) {
      currentTurn.value = turn;
    }
  }
  
  return {
    // État
    currentTurn,
    
    // Actions
    nextTurn,
    resetTurn,
    setTurn
  };
},
{ persist: true });
