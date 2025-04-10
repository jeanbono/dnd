import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from '../../stores/player'

// Mock UUID pour des tests déterministes
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid')
}))

// Mock localStorage
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn()
})

describe('Player Store', () => {
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks()
    
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())
  })

  it('should initialize with empty players array', () => {
    const store = usePlayerStore()
    expect(store.players).toEqual([])
  })

  it('should add a player', () => {
    const store = usePlayerStore()
    const player = {
      name: 'Aragorn',
      initiative: 3,
      dexterity: 16,
      notes: 'Ranger du Nord'
    }
    
    store.addPlayer(player)
    
    expect(store.players.length).toBe(1)
    expect(store.players[0]).toEqual({
      ...player,
      id: 'test-uuid'
    })
  })

  it('should remove a player', () => {
    const store = usePlayerStore()
    store.addPlayer({
      name: 'Aragorn',
      initiative: 3,
      dexterity: 16
    })
    
    const id = store.players[0].id
    
    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    
    store.removePlayer(id)
    
    expect(store.players.length).toBe(0)
    
    // Clean up mock
    confirmSpy.mockRestore()
  })

  it('should update a player', () => {
    const store = usePlayerStore()
    store.addPlayer({
      name: 'Aragorn',
      initiative: 3,
      dexterity: 16
    })
    
    const id = store.players[0].id
    store.updatePlayer(id, { name: 'Strider' })
    
    expect(store.players[0].name).toBe('Strider')
  })

  it('should update player initiative', () => {
    const store = usePlayerStore()
    store.addPlayer({
      name: 'Aragorn',
      initiative: 3,
      dexterity: 16
    })
    
    const id = store.players[0].id
    store.updatePlayerInitiative(id, 7)
    
    expect(store.players[0].initiative).toBe(7)
  })

  it('should reorder players', () => {
    const store = usePlayerStore()
    store.addPlayer({
      name: 'Aragorn',
      initiative: 3,
      dexterity: 16
    })
    
    // Get the v4 mock from the uuid module
    const { v4: uuidMock } = vi.hoisted(() => ({ v4: vi.fn() }))
    
    // Change the mock return value for the next call
    uuidMock.mockReturnValueOnce('test-uuid-2')
    
    store.addPlayer({
      name: 'Legolas',
      initiative: 5,
      dexterity: 18
    })
    
    // Inverser l'ordre
    const newOrder = [...store.players].reverse()
    store.reorderPlayers(newOrder)
    
    expect(store.players[0].name).toBe('Legolas')
    expect(store.players[1].name).toBe('Aragorn')
  })

  it('should calculate ability modifiers correctly', () => {
    const store = usePlayerStore()
    
    // Selon les règles de D&D 5e
    expect(store.getAbilityModifier(1)).toBe(-5)
    expect(store.getAbilityModifier(4)).toBe(-3)
    expect(store.getAbilityModifier(10)).toBe(0)
    expect(store.getAbilityModifier(15)).toBe(2)
    expect(store.getAbilityModifier(20)).toBe(5)
    expect(store.getAbilityModifier(30)).toBe(10)
  })

  it('should format ability modifier display correctly', () => {
    const store = usePlayerStore()
    
    expect(store.getAbilityModifierDisplay(10)).toBe('+0')
    expect(store.getAbilityModifierDisplay(18)).toBe('+4')
    expect(store.getAbilityModifierDisplay(7)).toBe('-2')
  })

  it('should handle editing state correctly', () => {
    const store = usePlayerStore()
    store.addPlayer({
      name: 'Aragorn',
      initiative: 3,
      dexterity: 16
    })
    
    const id = store.players[0].id
    
    // Par défaut, aucun joueur n'est en cours d'édition
    expect(store.editingPlayerId).toBe(null)
    expect(store.isEditingAnyPlayer).toBe(false)
    
    // Commencer l'édition
    store.startEditingPlayer(id)
    expect(store.editingPlayerId).toBe(id)
    expect(store.isEditingAnyPlayer).toBe(true)
    expect(store.currentEditingPlayer).toEqual(store.players[0])
    
    // Annuler l'édition
    store.cancelEditing()
    expect(store.editingPlayerId).toBe(null)
    expect(store.isEditingAnyPlayer).toBe(false)
  })

  it('should save edited player', () => {
    const store = usePlayerStore()
    store.addPlayer({
      name: 'Aragorn',
      initiative: 3,
      dexterity: 16
    })
    
    const id = store.players[0].id
    
    // Commencer l'édition
    store.startEditingPlayer(id)
    
    // Modifier les données temporaires
    store.tempPlayerData.name = 'Strider'
    
    // Sauvegarder les modifications
    store.saveEditedPlayer()
    
    // Vérifier que les données ont été mises à jour
    expect(store.players[0].name).toBe('Strider')
    expect(store.editingPlayerId).toBe(null)
  })

  it('should reset form correctly', () => {
    const store = usePlayerStore()
    
    // Modifier les données temporaires
    store.tempPlayerData.name = 'Aragorn'
    store.tempPlayerData.initiative = 3
    store.tempPlayerData.dexterity = 16
    store.tempPlayerData.notes = 'Ranger du Nord'
    
    // Réinitialiser le formulaire
    store.resetForm()
    
    // Vérifier que les données ont été réinitialisées
    expect(store.tempPlayerData).toEqual({
      name: '',
      initiative: 0,
      dexterity: 10,
      notes: ''
    })
    expect(store.isAddingPlayer).toBe(false)
  })
})
