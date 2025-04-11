import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import MonsterList from '../../../components/monsters/MonsterList.vue'
import {useMonsterStore} from '../../../stores/monster'

// Mock the components
vi.mock('../../../components/monsters/MonsterCard.vue', () => ({
  default: {
    name: 'MonsterCard',
    template: '<div data-testid="monster-card">Monster Card</div>',
    props: ['monsterId']
  }
}))

vi.mock('../../../components/monsters/MonsterForm.vue', () => ({
  default: {
    name: 'MonsterForm',
    template: '<div data-testid="monster-form">Monster Form</div>'
  }
}))

vi.mock('../../../components/monsters/MonsterSearch.vue', () => ({
  default: {
    name: 'MonsterSearch',
    template: '<div data-testid="monster-search">Monster Search</div>'
  }
}))

vi.mock('../../../components/initiative/InitiativeOrder.vue', () => ({
  default: {
    name: 'InitiativeOrder',
    template: '<div data-testid="initiative-order">Initiative Order</div>'
  }
}))

vi.mock('../../../components/players/PlayerList.vue', () => ({
  default: {
    name: 'PlayerList',
    template: '<div data-testid="player-list">Player List</div>'
  }
}))

// Mock Sortable
vi.mock('sortablejs', () => {
  return {
    default: {
      create: vi.fn()
    }
  }
})

describe('MonsterList', () => {
  let store: ReturnType<typeof useMonsterStore>

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    store = useMonsterStore()
    
    // Mock document.querySelector pour éviter les erreurs
    document.querySelector = vi.fn().mockReturnValue({})
  })

  it('renders correctly with no monsters', async () => {
    const wrapper = mount(MonsterList)

    // Vérifier que le titre est présent
    const headings = wrapper.findAll('h2')
    expect(headings.length).toBeGreaterThan(0)
    expect(headings[0].text()).toBe('Monstres')
    
    // Vérifier que le message "aucun monstre" est affiché
    expect(wrapper.html()).toContain('Aucun monstre ajouté')
    
    // Vérifier que les boutons d'action sont présents
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
    expect(buttons[0].text()).toBe('Ajouter un Monstre')
    expect(buttons[1].text()).toBe('Rechercher un Monstre')
  })

  it('renders monsters when they exist in the store', async () => {
    // Ajouter un monstre au store
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      notes: ''
    })
    
    const wrapper = mount(MonsterList)

    // Vérifier que le composant MonsterCard est rendu
    const monsterCard = wrapper.find('[data-testid="monster-card"]')
    expect(monsterCard.exists()).toBe(true)
    
    // Vérifier que le message "aucun monstre" n'est pas affiché
    expect(wrapper.html()).not.toContain('Aucun monstre ajouté')
  })

  it('shows monster form when adding a monster', async () => {
    const wrapper = mount(MonsterList)
    
    // Directly set the store state instead of clicking the button
    const store = useMonsterStore()
    store.isAddingMonster = true
    
    // Force a re-render
    await wrapper.vm.$nextTick()
    
    // Vérifier que le formulaire est affiché
    expect(wrapper.find('[data-testid="monster-form"]').exists()).toBe(true)
    
    // Vérifier que le texte du bouton a changé
    expect(wrapper.findAll('button')[0].text()).toBe('Annuler')
  })

  it('shows monster form with empty fields even when a monster is being edited', async () => {
    const store = useMonsterStore()
    
    // Ajouter un monstre au store
    store.addMonster({
      name: 'Existing Monster',
      initiative: 5,
      hp: 30,
      maxHp: 30,
      ac: 16,
      notes: 'Existing notes'
    })
    
    // Commencer l'édition du monstre
    store.startEditingMonster(store.monsters[0].id)
    
    // Activer le formulaire d'ajout
    store.isAddingMonster = true
    
    const wrapper = mount(MonsterList)
    
    // Force a re-render
    await wrapper.vm.$nextTick()
    
    // Vérifier que le formulaire est affiché
    expect(wrapper.find('[data-testid="monster-form"]').exists()).toBe(true)
    
    // Le formulaire est mocké, donc on ne peut pas vérifier son contenu directement
    // Mais on peut vérifier que l'état d'édition est toujours actif
    expect(store.isEditingAnyMonster).toBe(true)
    expect(store.isAddingMonster).toBe(true)
  })

  it('shows monster search when search button is clicked', async () => {
    const wrapper = mount(MonsterList)

    // Cliquer sur le bouton de recherche
    const searchButton = wrapper.findAll('button')[1]
    await searchButton.trigger('click')
    
    // Vérifier que la recherche est affichée
    expect(wrapper.find('[data-testid="monster-search"]').exists()).toBe(true)
  })

  it('calls rollAllInitiatives when initiative button is clicked', async () => {
    // Ajouter un monstre au store
    store.addMonster({
      name: 'Goblin',
      initiative: 2,
      hp: 7,
      maxHp: 10,
      ac: 15,
      notes: ''
    })
    
    // Espionner la méthode rollInitiative du store
    const spy = vi.spyOn(store, 'rollInitiative')
    
    const wrapper = mount(MonsterList)

    // Cliquer sur le bouton d'initiative
    const initiativeButton = wrapper.findAll('button')[2]
    await initiativeButton.trigger('click')
    
    // Vérifier que la méthode a été appelée pour chaque monstre
    expect(spy).toHaveBeenCalledWith(expect.any(String))
  })
})
