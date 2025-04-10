import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import MonsterCard from '../../../components/monsters/MonsterCard.vue'
import {useMonsterStore} from '../../../stores/monster'

// Mock the MonsterStats component
vi.mock('../../../components/monsters/MonsterStats.vue', () => ({
  default: {
    name: 'MonsterStats',
    template: '<div data-testid="monster-stats">Monster Stats</div>',
    props: ['monsterId']
  }
}))

describe('MonsterCard', () => {
  let store: ReturnType<typeof useMonsterStore>
  let testMonsterId: string

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    store = useMonsterStore()
    
    // Ajouter un monstre de test
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      strength: 8,
      dexterity: 14,
      constitution: 10,
      intelligence: 10,
      wisdom: 8,
      charisma: 8,
      notes: 'Test notes'
    })
    
    // Récupérer l'ID du monstre
    testMonsterId = store.monsters[0].id
  })

  it('renders correctly in view mode', () => {
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Vérifier que le nom du monstre est affiché
    expect(wrapper.html()).toContain('Goblin')
    
    // Vérifier que les informations de base sont affichées
    expect(wrapper.html()).toContain('Initiative: 2')
    expect(wrapper.html()).toContain('CA: 15')
    
    // Vérifier que les boutons d'action sont présents
    expect(wrapper.find('button.bg-blue-600').exists()).toBe(true)
    expect(wrapper.find('button.bg-purple-600').exists()).toBe(true)
  })

  it('renders correctly in edit mode', async () => {
    // Mettre le monstre en mode édition
    store.startEditingMonster(testMonsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Vérifier que les champs d'édition sont présents
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.findAll('input[type="number"]').length).toBeGreaterThan(0)
    
    // Vérifier que les boutons de sauvegarde et d'annulation sont présents
    expect(wrapper.find('button.bg-green-600').exists()).toBe(true)
    expect(wrapper.find('button.bg-gray-300').exists()).toBe(true)
  })

  it('emits toggleCollapse event when collapse button is clicked', async () => {
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Espionner la méthode toggleCollapse du store
    const spy = vi.spyOn(store, 'toggleCollapse')
    
    // Cliquer sur le bouton de repli
    const collapseButton = wrapper.find('.bg-gray-200')
    await collapseButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(testMonsterId)
  })

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Espionner la méthode startEditingMonster du store
    const spy = vi.spyOn(store, 'startEditingMonster')
    
    // Cliquer sur le bouton d'édition
    const editButton = wrapper.find('button.bg-blue-600')
    await editButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(testMonsterId)
  })

  it('emits rollInitiative event when initiative button is clicked', async () => {
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Espionner la méthode rollInitiative du store
    const spy = vi.spyOn(store, 'rollInitiative')
    
    // Cliquer sur le bouton d'initiative
    const initiativeButton = wrapper.find('button.bg-purple-600')
    await initiativeButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(testMonsterId)
  })

  it('emits updateHp event when HP buttons are clicked', async () => {
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Espionner la méthode updateMonsterHp du store
    const spy = vi.spyOn(store, 'updateMonsterHp')
    
    // Cliquer sur le bouton d'augmentation des HP
    const increaseButton = wrapper.find('button.bg-green-100')
    await increaseButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID et la bonne valeur
    expect(spy).toHaveBeenCalledWith(testMonsterId, 1)
    
    // Réinitialiser le spy
    spy.mockClear()
    
    // Cliquer sur le bouton de diminution des HP
    const decreaseButton = wrapper.find('button.bg-red-100')
    await decreaseButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID et la bonne valeur
    expect(spy).toHaveBeenCalledWith(testMonsterId, -1)
  })

  it('emits toggleStats event when stats header is clicked', async () => {
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Espionner la méthode toggleStats du store
    const spy = vi.spyOn(store, 'toggleStats')
    
    // Cliquer sur le bouton pour afficher les stats
    const statsButton = wrapper.find('button.bg-indigo-600')
    await statsButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(testMonsterId)
  })

  it('shows monster stats when showStats is true', async () => {
    // Activer l'affichage des stats
    store.toggleStats(testMonsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Vérifier que les stats sont affichées
    expect(wrapper.find('[data-testid="monster-stats"]').exists()).toBe(true)
  })

  it('emits saveEdit event when save button is clicked in edit mode', async () => {
    // Mettre le monstre en mode édition
    store.startEditingMonster(testMonsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Espionner la méthode saveEditedMonster du store
    const spy = vi.spyOn(store, 'saveEditedMonster')
    
    // Cliquer sur le bouton de sauvegarde
    const saveButton = wrapper.find('button.bg-green-600')
    await saveButton.trigger('click')
    
    // Vérifier que la méthode a été appelée
    expect(spy).toHaveBeenCalled()
  })

  it('emits cancelEdit event when cancel button is clicked in edit mode', async () => {
    // Mettre le monstre en mode édition
    store.startEditingMonster(testMonsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Espionner la méthode cancelEditing du store
    const spy = vi.spyOn(store, 'cancelEditing')
    
    // Cliquer sur le bouton d'annulation
    const cancelButton = wrapper.find('button.bg-gray-300')
    await cancelButton.trigger('click')
    
    // Vérifier que la méthode a été appelée
    expect(spy).toHaveBeenCalled()
  })

  it('shows roll result when provided', async () => {
    // Simuler un résultat de jet d'initiative
    store.rollResult = {
      monsterId: testMonsterId,
      roll: 15,
      modifier: 2,
      total: 17
    }
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId: testMonsterId
      }
    })

    // Vérifier que le résultat du jet est affiché
    expect(wrapper.html()).toContain('15 (d20) + 2 (DEX) = 17')
  })
})
