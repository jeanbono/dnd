import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMonsterStore } from '../../stores/monster'

// Mock UUID pour des tests déterministes
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid')
}))

// Mock localStorage
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn()
})

describe('Monster Store', () => {
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks()
    
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())
  })

  it('should initialize with empty monsters array', () => {
    const store = useMonsterStore()
    expect(store.monsters).toEqual([])
  })

  it('should add a monster', () => {
    const store = useMonsterStore()
    const monster = {
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      notes: ''
    }
    
    store.addMonster(monster)
    
    expect(store.monsters.length).toBe(1)
    // Check only the properties we care about
    expect(store.monsters[0].id).toBe('test-uuid')
    expect(store.monsters[0].name).toBe('Goblin')
    expect(store.monsters[0].initiative).toBe(2)
    expect(store.monsters[0].hp).toBe(7)
    expect(store.monsters[0].maxHp).toBe(10)
    expect(store.monsters[0].ac).toBe(15)
    expect(store.monsters[0].notes).toBe('')
  })

  it('should remove a monster', () => {
    const store = useMonsterStore()
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      notes: ''
    })
    
    const id = store.monsters[0].id
    
    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    
    store.removeMonster(id)
    
    expect(store.monsters.length).toBe(0)
    
    // Clean up mock
    confirmSpy.mockRestore()
  })

  it('should update a monster', () => {
    const store = useMonsterStore()
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      notes: ''
    })
    
    const id = store.monsters[0].id
    store.updateMonster(id, { name: 'Hobgoblin' })
    
    expect(store.monsters[0].name).toBe('Hobgoblin')
  })

  it('should update monster HP', () => {
    const store = useMonsterStore()
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      notes: ''
    })
    
    const id = store.monsters[0].id
    store.updateMonsterHp(id, 2)
    
    expect(store.monsters[0].hp).toBe(9)
  })

  it('should reorder monsters', () => {
    const store = useMonsterStore()
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      notes: ''
    })
    
    store.addMonster({
      name: 'Orc',
      initiative: 1,
      hp: 15,
      maxHp: 15,
      ac: 13,
      notes: ''
    })
    
    // Inverser l'ordre
    const newOrder = [...store.monsters].reverse()
    store.reorderMonsters(newOrder)
    
    expect(store.monsters[0].name).toBe('Orc')
    expect(store.monsters[1].name).toBe('Goblin')
  })

  it('should toggle monster stats visibility', () => {
    const store = useMonsterStore()
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      notes: ''
    })
    
    const id = store.monsters[0].id
    
    // Par défaut, les stats ne sont pas affichées
    expect(store.isStatsShown(id)).toBe(false)
    
    // Activer l'affichage des stats
    store.toggleStats(id)
    expect(store.isStatsShown(id)).toBe(true)
    
    // Désactiver l'affichage des stats
    store.toggleStats(id)
    expect(store.isStatsShown(id)).toBe(false)
  })

  it('should toggle monster collapse state', () => {
    const store = useMonsterStore()
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      notes: ''
    })
    
    const id = store.monsters[0].id
    
    // Par défaut, le monstre n'est pas replié
    expect(store.isCollapsed(id)).toBe(false)
    
    // Replier le monstre
    store.toggleCollapse(id)
    expect(store.isCollapsed(id)).toBe(true)
    
    // Déplier le monstre
    store.toggleCollapse(id)
    expect(store.isCollapsed(id)).toBe(false)
  })

  it('should calculate ability modifiers correctly', () => {
    const store = useMonsterStore()
    
    // Selon les règles de D&D 5e
    expect(store.calculateAbilityModifier(1)).toBe(-5)
    expect(store.calculateAbilityModifier(4)).toBe(-3)
    expect(store.calculateAbilityModifier(10)).toBe(0)
    expect(store.calculateAbilityModifier(15)).toBe(2)
    expect(store.calculateAbilityModifier(20)).toBe(5)
    expect(store.calculateAbilityModifier(30)).toBe(10)
  })

  it('should format ability score display correctly', () => {
    const store = useMonsterStore()
    
    expect(store.getAbilityScoreDisplay(10)).toBe('10 (+0)')
    expect(store.getAbilityScoreDisplay(18)).toBe('18 (+4)')
    expect(store.getAbilityScoreDisplay(7)).toBe('7 (-2)')
    expect(store.getAbilityScoreDisplay(undefined)).toBe('— (±0)')
  })

  it('should roll initiative for a monster', () => {
    // Mock Math.random pour un résultat déterministe
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    
    const store = useMonsterStore()
    store.addMonster({
      name: 'Goblin',
      initiative: 0,
      hp: 7,
      maxHp: 10,
      ac: 15,
      dexterity: 14, // Modifier +2
      notes: ''
    })
    
    const id = store.monsters[0].id
    store.rollInitiative(id)
    
    // Avec Math.random = 0.5, le dé donne 10 (0.5 * 20 + 1)
    // Avec un modificateur de +2, le total est 13
    expect(store.monsters[0].initiative).toBe(13)
    
    // Nettoyer le mock
    randomSpy.mockRestore()
  })
})
