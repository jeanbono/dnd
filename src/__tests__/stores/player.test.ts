import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from '../../stores/player'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Player Store', () => {
  beforeEach(() => {
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())
    
    // Mocker localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: vi.fn((key: string) => {
          return store[key] || null
        }),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString()
        }),
        clear: vi.fn(() => {
          store = {}
        })
      }
    })()
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })
  })
  
  it('should initialize with empty players array', () => {
    const store = usePlayerStore()
    expect(store.players).toEqual([])
  })
  
  it('should add a player', () => {
    const store = usePlayerStore()
    
    // Ajouter un joueur
    store.addPlayer({
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    })
    
    // Vérifier que le joueur a été ajouté
    expect(store.players.length).toBe(1)
    expect(store.players[0].name).toBe('Aragorn')
    expect(store.players[0].initiative).toBe(15)
    expect(store.players[0].dexterity).toBe(16)
    expect(store.players[0].notes).toBe('Ranger du Nord')
    
    // Vérifier que le joueur a un ID
    expect(store.players[0].id).toBeDefined()
  })
  
  it('should update a player', () => {
    const store = usePlayerStore()
    
    // Ajouter un joueur
    store.addPlayer({
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    })
    
    const playerId = store.players[0].id
    
    // Mettre à jour le joueur
    store.updatePlayer(playerId, {
      name: 'Strider',
      initiative: 16
    })
    
    // Vérifier que le joueur a été mis à jour
    expect(store.players[0].name).toBe('Strider')
    expect(store.players[0].initiative).toBe(16)
    expect(store.players[0].dexterity).toBe(16) // Inchangé
    expect(store.players[0].notes).toBe('Ranger du Nord') // Inchangé
  })
  
  it('should update player initiative', () => {
    const store = usePlayerStore()
    
    // Ajouter un joueur
    store.addPlayer({
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    })
    
    const playerId = store.players[0].id
    
    // Mettre à jour l'initiative du joueur
    store.updatePlayerInitiative(playerId, 20)
    
    // Vérifier que l'initiative a été mise à jour
    expect(store.players[0].initiative).toBe(20)
  })
  
  it('should remove a player', () => {
    const store = usePlayerStore()
    
    // Mocker confirm pour qu'il retourne toujours true
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    
    // Ajouter un joueur
    store.addPlayer({
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    })
    
    const playerId = store.players[0].id
    
    // Supprimer le joueur
    store.removePlayer(playerId)
    
    // Vérifier que le joueur a été supprimé
    expect(store.players.length).toBe(0)
  })
  
  it('should not remove a player if confirm returns false', () => {
    const store = usePlayerStore()
    
    // Mocker confirm pour qu'il retourne false
    vi.spyOn(window, 'confirm').mockImplementation(() => false)
    
    // Ajouter un joueur
    store.addPlayer({
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    })
    
    const playerId = store.players[0].id
    
    // Tenter de supprimer le joueur
    store.removePlayer(playerId)
    
    // Vérifier que le joueur n'a pas été supprimé
    expect(store.players.length).toBe(1)
  })
  
  it('should reorder players', () => {
    const store = usePlayerStore()
    
    // Ajouter deux joueurs
    store.addPlayer({
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    })
    
    store.addPlayer({
      name: 'Legolas',
      initiative: 18,
      dexterity: 20,
      notes: 'Elfe archer'
    })
    
    // Récupérer les IDs des joueurs
    const player1 = store.players[0]
    const player2 = store.players[1]
    
    // Réordonner les joueurs
    store.reorderPlayers([player2, player1])
    
    // Vérifier que les joueurs ont été réordonnés
    expect(store.players[0].name).toBe('Legolas')
    expect(store.players[1].name).toBe('Aragorn')
  })
  
  it('should calculate ability modifier correctly', () => {
    const store = usePlayerStore()
    
    // Tester différentes valeurs
    expect(store.getAbilityModifier(10)).toBe(0)
    expect(store.getAbilityModifier(12)).toBe(1)
    expect(store.getAbilityModifier(8)).toBe(-1)
    expect(store.getAbilityModifier(20)).toBe(5)
    expect(store.getAbilityModifier(1)).toBe(-5)
  })
  
  it('should format ability modifier display correctly', () => {
    const store = usePlayerStore()
    
    // Tester différentes valeurs
    expect(store.getAbilityModifierDisplay(10)).toBe('+0')
    expect(store.getAbilityModifierDisplay(12)).toBe('+1')
    expect(store.getAbilityModifierDisplay(8)).toBe('-1')
    expect(store.getAbilityModifierDisplay(20)).toBe('+5')
    expect(store.getAbilityModifierDisplay(1)).toBe('-5')
  })
  
  it('should handle editing state correctly', () => {
    const store = usePlayerStore()
    
    // Ajouter un joueur
    store.addPlayer({
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    })
    
    const playerId = store.players[0].id
    
    // Vérifier l'état initial
    expect(store.editingPlayerId).toBe(null)
    expect(store.isEditingAnyPlayer).toBe(false)
    
    // Commencer l'édition
    store.startEditingPlayer(playerId)
    expect(store.editingPlayerId).toBe(playerId)
    expect(store.isEditingAnyPlayer).toBe(true)
    
    // Annuler l'édition
    store.cancelEditingPlayer()
    expect(store.editingPlayerId).toBe(null)
    expect(store.isEditingAnyPlayer).toBe(false)
  })
  
  it('should get player by id', () => {
    const store = usePlayerStore()
    
    // Ajouter un joueur
    store.addPlayer({
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    })
    
    const playerId = store.players[0].id
    
    // Récupérer le joueur par son ID
    const player = store.getPlayerById(playerId)
    
    // Vérifier que le bon joueur a été récupéré
    expect(player).toBeDefined()
    expect(player?.name).toBe('Aragorn')
    
    // Tester avec un ID inexistant
    const nonExistentPlayer = store.getPlayerById('non-existent-id')
    expect(nonExistentPlayer).toBeUndefined()
  })
  
  it('should toggle adding player state', () => {
    const store = usePlayerStore()
    
    // Vérifier l'état initial
    expect(store.isAddingPlayer).toBe(false)
    
    // Activer l'ajout de joueur
    store.startAddingPlayer()
    expect(store.isAddingPlayer).toBe(true)
    
    // Désactiver l'ajout de joueur
    store.cancelAddingPlayer()
    expect(store.isAddingPlayer).toBe(false)
  })
})
