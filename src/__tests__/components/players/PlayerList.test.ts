import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import type {Player} from '../../../stores/player'
import {usePlayerStore} from '../../../stores/player'
// Import components after mocking
import PlayerList from '../../../components/players/PlayerList.vue'
import PlayerForm from '../../../components/players/PlayerForm.vue'
import PlayerCard from '../../../components/players/PlayerCard.vue'

// Mock Sortable before importing PlayerList
vi.mock('sortablejs', () => ({
  default: {
    create: vi.fn()
  }
}))

// Mock child components to simplify testing
vi.mock('../../../components/players/PlayerCard.vue', () => ({
  default: {
    name: 'PlayerCard',
    props: ['player'],
    template: '<div class="player-card" :data-id="player.id">{{ player.name }}</div>'
  }
}))

vi.mock('../../../components/players/PlayerForm.vue', () => ({
  default: {
    name: 'PlayerForm',
    template: '<div class="player-form">Player Form</div>'
  }
}))

describe('PlayerList', () => {
  let store: ReturnType<typeof usePlayerStore>

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    store = usePlayerStore()
    
    // Reset store state
    store.players = []
    store.isAddingPlayer = false
    
    // Mock document.querySelector for Sortable
    document.querySelector = vi.fn().mockReturnValue({})
    
    // Clear mocks
    vi.clearAllMocks()
  })

  it('renders correctly with no players', () => {
    const wrapper = mount(PlayerList)

    // Vérifier que le titre est présent
    expect(wrapper.find('h2').text()).toBe('Joueurs')
    
    // Vérifier que le message "aucun joueur" est affiché
    expect(wrapper.text()).toContain('Aucun joueur ajouté')
    
    // Vérifier que le bouton d'action est présent
    expect(wrapper.find('button').text()).toBe('Ajouter un Joueur')
    
    // Vérifier que le PlayerForm n'est pas affiché
    expect(wrapper.findComponent(PlayerForm).exists()).toBe(false)
  })

  it('renders players when they exist in the store', async () => {
    // Ajouter des joueurs au store
    store.players = [
      { id: '1', name: 'Aragorn', initiative: 3, dexterity: 16, notes: '' },
      { id: '2', name: 'Legolas', initiative: 5, dexterity: 18, notes: '' }
    ] as Player[]
    
    const wrapper = mount(PlayerList)

    // Vérifier que les PlayerCard sont rendus
    const playerCards = wrapper.findAllComponents(PlayerCard)
    expect(playerCards.length).toBe(2)
    
    // Vérifier que le message "aucun joueur" n'est pas affiché
    expect(wrapper.text()).not.toContain('Aucun joueur ajouté')
    
    // Vérifier que le message d'aide pour le glisser-déposer est affiché
    expect(wrapper.text()).toContain('Glissez les joueurs pour les réorganiser')
  })

  it('shows player form when add button is clicked', async () => {
    // Spy on the startAddingPlayer method
    const startAddingPlayerSpy = vi.spyOn(store, 'startAddingPlayer')
    
    const wrapper = mount(PlayerList)
    
    // Initially, the form should not be visible
    expect(wrapper.findComponent(PlayerForm).exists()).toBe(false)
    expect(wrapper.find('button').text()).toBe('Ajouter un Joueur')
    
    // Click the "Add Player" button
    await wrapper.find('button').trigger('click')
    
    // Verify the store method was called
    expect(startAddingPlayerSpy).toHaveBeenCalled()
    
    // Manually update the store state since the spy doesn't actually call the method
    store.isAddingPlayer = true
    await wrapper.vm.$nextTick()
    
    // The form should now be visible
    expect(wrapper.findComponent(PlayerForm).exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Annuler')
  })

  it('initializes Sortable in onMounted', async () => {
    // Import Sortable to access the mock
    const Sortable = (await import('sortablejs')).default
    
    mount(PlayerList)
    
    // Vérifier que Sortable.create a été appelé
    expect(Sortable.create).toHaveBeenCalled()
    
    // Vérifier les options passées à Sortable.create
    const createOptions = vi.mocked(Sortable.create).mock.calls[0][1]
    expect(createOptions).toHaveProperty('animation', 150)
    expect(createOptions).toHaveProperty('handle', '.drag-handle')
    expect(createOptions).toHaveProperty('ghostClass', 'bg-gray-100')
    expect(createOptions).toHaveProperty('onEnd')
  })
})
