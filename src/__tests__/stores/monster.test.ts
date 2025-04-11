import { setActivePinia, createPinia } from 'pinia'
import { useMonsterStore } from '../../stores/monster'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { calculateAbilityModifier, getAbilityScoreDisplay } from '../../utils/abilityUtils'

describe('Monster Store', () => {
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
    
    // Mocker Math.random pour les tests de lancer d'initiative
    vi.spyOn(Math, 'random').mockReturnValue(0.7)
  })
  
  it('should initialize with empty monsters array', () => {
    const store = useMonsterStore()
    expect(store.monsters).toEqual([])
  })
  
  it('should add a monster', () => {
    const store = useMonsterStore()
    
    // Ajouter un monstre
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: 'Small green creature',
      strength: 8,
      dexterity: 14,
      constitution: 10,
      intelligence: 10,
      wisdom: 8,
      charisma: 8
    })
    
    // Vérifier que le monstre a été ajouté
    expect(store.monsters.length).toBe(1)
    expect(store.monsters[0].name).toBe('Goblin')
    expect(store.monsters[0].hp).toBe(7)
    
    // Vérifier que le monstre a un ID
    expect(store.monsters[0].id).toBeDefined()
  })
  
  it('should update a monster', () => {
    const store = useMonsterStore()
    
    // Ajouter un monstre
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: 'Small green creature'
    })
    
    const monsterId = store.monsters[0].id
    
    // Mettre à jour le monstre
    store.updateMonster(monsterId, {
      name: 'Hobgoblin',
      hp: 11,
      maxHp: 11
    })
    
    // Vérifier que le monstre a été mis à jour
    expect(store.monsters[0].name).toBe('Hobgoblin')
    expect(store.monsters[0].hp).toBe(11)
    expect(store.monsters[0].maxHp).toBe(11)
    expect(store.monsters[0].ac).toBe(15) // Inchangé
  })
  
  it('should update monster HP', () => {
    const store = useMonsterStore()
    
    // Ajouter un monstre
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: 'Small green creature'
    })
    
    const monsterId = store.monsters[0].id
    
    // Réduire les PV
    store.updateMonsterHp(monsterId, -3)
    expect(store.monsters[0].hp).toBe(4)
    
    // Augmenter les PV
    store.updateMonsterHp(monsterId, 2)
    expect(store.monsters[0].hp).toBe(6)
    
    // Vérifier que les PV ne peuvent pas dépasser maxHp
    store.updateMonsterHp(monsterId, 5)
    expect(store.monsters[0].hp).toBe(7)
    
    // Vérifier que les PV ne peuvent pas être négatifs
    store.updateMonsterHp(monsterId, -10)
    expect(store.monsters[0].hp).toBe(0)
  })
  
  it('should remove a monster', () => {
    const store = useMonsterStore()
    
    // Mocker confirm pour qu'il retourne toujours true
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    
    // Ajouter un monstre
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: 'Small green creature'
    })
    
    const monsterId = store.monsters[0].id
    
    // Supprimer le monstre
    store.removeMonster(monsterId)
    
    // Vérifier que le monstre a été supprimé
    expect(store.monsters.length).toBe(0)
  })
  
  it('should not remove a monster if confirm returns false', () => {
    const store = useMonsterStore()
    
    // Mocker confirm pour qu'il retourne false
    vi.spyOn(window, 'confirm').mockImplementation(() => false)
    
    // Ajouter un monstre
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: 'Small green creature'
    })
    
    const monsterId = store.monsters[0].id
    
    // Tenter de supprimer le monstre
    store.removeMonster(monsterId)
    
    // Vérifier que le monstre n'a pas été supprimé
    expect(store.monsters.length).toBe(1)
  })
  
  it('should reorder monsters', () => {
    const store = useMonsterStore()
    
    // Ajouter deux monstres
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: 'Small green creature'
    })
    
    store.addMonster({
      name: 'Orc',
      initiative: 0,
      hp: 15,
      maxHp: 15,
      ac: 13,
      notes: 'Brutish humanoid'
    })
    
    // Récupérer les monstres
    const monster1 = store.monsters[0]
    const monster2 = store.monsters[1]
    
    // Réordonner les monstres
    store.reorderMonsters([monster2, monster1])
    
    // Vérifier que les monstres ont été réordonnés
    expect(store.monsters[0].name).toBe('Orc')
    expect(store.monsters[1].name).toBe('Goblin')
  })
  
  it('should toggle monster expand state', () => {
    const store = useMonsterStore()
    
    // Ajouter un monstre
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: 'Small green creature'
    })
    
    const id = store.monsters[0].id
    
    // Par défaut, le monstre n'est pas déplié
    expect(store.isExpanded(id)).toBe(false)
    
    // Déplier le monstre
    store.toggleExpand(id)
    expect(store.isExpanded(id)).toBe(true)
    
    // Replier le monstre
    store.toggleExpand(id)
    expect(store.isExpanded(id)).toBe(false)
  })
  
  it('should toggle monster stats visibility', () => {
    const store = useMonsterStore()
    
    // Ajouter un monstre
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: 'Small green creature'
    })
    
    const id = store.monsters[0].id
    
    // Par défaut, les stats ne sont pas affichées
    expect(store.isStatsShown(id)).toBe(false)
    
    // Afficher les stats
    store.toggleStats(id)
    expect(store.isStatsShown(id)).toBe(true)
    
    // Masquer les stats
    store.toggleStats(id)
    expect(store.isStatsShown(id)).toBe(false)
  })
  
  it('should calculate ability modifier correctly', () => {
    // Tester différentes valeurs
    expect(calculateAbilityModifier(10)).toBe(0)
    expect(calculateAbilityModifier(12)).toBe(1)
    expect(calculateAbilityModifier(8)).toBe(-1)
    expect(calculateAbilityModifier(20)).toBe(5)
    expect(calculateAbilityModifier(1)).toBe(-5)
  })
  
  it('should format ability score display correctly', () => {
    // Tester différentes valeurs
    expect(getAbilityScoreDisplay(10)).toBe('10 (+0)')
    expect(getAbilityScoreDisplay(18)).toBe('18 (+4)')
    expect(getAbilityScoreDisplay(7)).toBe('7 (-2)')
    expect(getAbilityScoreDisplay(undefined)).toBe('—')
  })
  
  it('should roll initiative for a monster', () => {
    const store = useMonsterStore()
    
    // Ajouter un monstre avec dextérité 14 (modificateur +2)
    store.addMonster({
      name: 'Goblin',
      initiative: 0,
      hp: 7,
      maxHp: 7,
      ac: 15,
      dexterity: 14,
      notes: ''
    })
    
    const id = store.monsters[0].id
    
    // Lancer l'initiative (avec Math.random mocké à 0.7)
    // 0.7 * 20 + 1 = 15 (d20), +2 (DEX) = 17
    store.rollInitiative(id)
    
    // Vérifier que l'initiative a été mise à jour
    expect(store.monsters[0].initiative).toBe(17)
    
    // Vérifier que le résultat du lancer est enregistré
    expect(store.rollResult).toEqual({
      monsterId: id,
      roll: 15,
      modifier: 2,
      total: 17
    })
  })
  
  it('should roll initiative for all monsters', () => {
    const store = useMonsterStore()
    
    // Ajouter deux monstres
    store.addMonster({
      name: 'Goblin',
      initiative: 0,
      hp: 7,
      maxHp: 7,
      ac: 15,
      dexterity: 14,
      notes: ''
    })
    
    store.addMonster({
      name: 'Orc',
      initiative: 0,
      hp: 15,
      maxHp: 15,
      ac: 13,
      dexterity: 12,
      notes: ''
    })
    
    // Lancer l'initiative pour tous les monstres
    store.rollAllInitiatives()
    
    // Vérifier que l'initiative a été mise à jour pour tous les monstres
    expect(store.monsters[0].initiative).toBe(17) // 15 (d20) + 2 (DEX)
    expect(store.monsters[1].initiative).toBe(16) // 15 (d20) + 1 (DEX)
  })
  
  it('should handle editing state correctly', () => {
    const store = useMonsterStore()
    
    // Ajouter un monstre
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: ''
    })
    
    const id = store.monsters[0].id
    
    // Vérifier l'état initial
    expect(store.editingMonsterId).toBe(null)
    expect(store.isEditingAnyMonster).toBe(false)
    
    // Commencer l'édition
    store.startEditingMonster(id)
    expect(store.editingMonsterId).toBe(id)
    expect(store.isEditingAnyMonster).toBe(true)
    
    // Annuler l'édition
    store.cancelEditingMonster()
    expect(store.editingMonsterId).toBe(null)
    expect(store.isEditingAnyMonster).toBe(false)
  })
  
  it('should get monster by id', () => {
    const store = useMonsterStore()
    
    // Ajouter un monstre
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 7,
      ac: 15,
      notes: ''
    })
    
    const id = store.monsters[0].id
    
    // Récupérer le monstre par son ID
    const monster = store.getMonsterById(id)
    
    // Vérifier que le bon monstre a été récupéré
    expect(monster).toBeDefined()
    expect(monster?.name).toBe('Goblin')
    
    // Tester avec un ID inexistant
    const nonExistentMonster = store.getMonsterById('non-existent-id')
    expect(nonExistentMonster).toBeUndefined()
  })
  
  it('should toggle adding monster state', () => {
    const store = useMonsterStore()
    
    // Vérifier l'état initial
    expect(store.isAddingMonster).toBe(false)
    
    // Activer l'ajout de monstre
    store.startAddingMonster()
    expect(store.isAddingMonster).toBe(true)
    
    // Désactiver l'ajout de monstre
    store.cancelAddingMonster()
    expect(store.isAddingMonster).toBe(false)
  })
})
