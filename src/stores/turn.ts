import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTurnStore = defineStore('turn', () => {
  // État
  const currentTurn = ref(1);
  const waitingCharacters = ref<{ id: string; type: 'player' | 'monster' }[]>([]);
  
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
  
  // Ajouter un personnage à la liste d'attente
  function addToWaiting(characterId: string, characterType: 'player' | 'monster') {
    // Vérifier si le personnage est déjà dans la liste d'attente
    const alreadyWaiting = waitingCharacters.value.some(
      c => c.id === characterId && c.type === characterType
    );

    if (!alreadyWaiting) {
      waitingCharacters.value.push({ id: characterId, type: characterType });
    }
  }

  // Retirer un personnage de la liste d'attente
  function removeFromWaiting(characterId: string, characterType: 'player' | 'monster') {
    waitingCharacters.value = waitingCharacters.value.filter(
      c => !(c.id === characterId && c.type === characterType)
    );
  }

  // Vérifier si un personnage est en attente
  function isWaiting(characterId: string, characterType: 'player' | 'monster'): boolean {
    return waitingCharacters.value.some(
      c => c.id === characterId && c.type === characterType
    );
  }

  // Vider la liste d'attente
  function clearWaitingList() {
    waitingCharacters.value = [];
  }

  return {
    // État
    currentTurn,
    waitingCharacters,
    
    // Actions
    nextTurn,
    resetTurn,
    setTurn,
    addToWaiting,
    removeFromWaiting,
    isWaiting,
    clearWaitingList
  };
},
{ persist: true });
