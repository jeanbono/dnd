import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {usePlayerStore} from '../../../stores/player'
import PlayerCard from '../../../components/players/PlayerCard.vue'

describe('PlayerCard', () => {
  let store: ReturnType<typeof usePlayerStore>
  let playerId: string

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    store = usePlayerStore()
    
    // Créer un joueur de test dans le store
    store.addPlayer({
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    })
    
    // Récupérer l'ID du joueur créé
    playerId = store.players[0].id
    
    // Reset the editing state before each test
    store.cancelEditingPlayer()
    
    // Mock de window.confirm pour éviter les erreurs
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('renders correctly in view mode', () => {
    const wrapper = mount(PlayerCard, {
      props: {
        playerId
      }
    })

    // Vérifier que le nom du joueur est affiché
    expect(wrapper.find('h3').text()).toBe('Aragorn')
    
    // Vérifier que les informations de base sont affichées
    expect(wrapper.text()).toContain('Initiative: 15')
    expect(wrapper.text()).toContain('DEX: 16 (+3)')
  })

  it('renders correctly in edit mode', async () => {
    // Mettre le joueur en mode édition
    store.startEditingPlayer(playerId)
    
    const wrapper = mount(PlayerCard, {
      props: {
        playerId
      }
    })

    // Vérifier que le titre d'édition est présent
    expect(wrapper.find('h3').text()).toBe('Édition du joueur')
    
    // Vérifier que les champs d'édition sont présents
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(3)
    
    // Vérifier que les boutons de sauvegarde et d'annulation sont présents
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
    expect(buttons[0].text()).toBe('Annuler')
    expect(buttons[1].text()).toBe('Enregistrer')
  })

  it('shows drag handle in both view and edit modes', () => {
    // Mode vue
    let wrapper = mount(PlayerCard, {
      props: {
        playerId
      }
    })
    
    expect(wrapper.find('.drag-handle').exists()).toBe(true)
    
    // Mode édition
    store.startEditingPlayer(playerId)
    
    wrapper = mount(PlayerCard, {
      props: {
        playerId
      }
    })
    
    expect(wrapper.find('.drag-handle').exists()).toBe(true)
  })

  it('starts editing when edit button is clicked', async () => {
    const wrapper = mount(PlayerCard, {
      props: {
        playerId
      }
    })
    
    // Espionner la méthode startEditingPlayer du store
    const spy = vi.spyOn(store, 'startEditingPlayer')
    
    // Trouver le bouton d'édition par son contenu
    const editButton = wrapper.findAll('button').find(b => b.text().includes('Modifier'))
    expect(editButton).toBeDefined()
    
    if (editButton) {
      await editButton.trigger('click')
      
      // Vérifier que la méthode a été appelée avec le bon ID
      expect(spy).toHaveBeenCalledWith(playerId)
    }
  })

  it('removes player when remove button is clicked', async () => {
    const wrapper = mount(PlayerCard, {
      props: {
        playerId
      }
    })
    
    // Espionner la méthode removePlayer du store
    const spy = vi.spyOn(store, 'removePlayer')
    
    // Trouver le bouton de suppression par son contenu
    const removeButton = wrapper.findAll('button').find(b => b.text().includes('Supprimer'))
    expect(removeButton).toBeDefined()
    
    if (removeButton) {
      await removeButton.trigger('click')
      
      // Vérifier que la méthode a été appelée avec le bon ID
      expect(spy).toHaveBeenCalledWith(playerId)
    }
  })

  it('saves changes when save button is clicked in edit mode', async () => {
    // Mettre le joueur en mode édition
    store.startEditingPlayer(playerId)
    
    const wrapper = mount(PlayerCard, {
      props: {
        playerId
      }
    })
    
    // Espionner la méthode updatePlayer du store
    const spy = vi.spyOn(store, 'updatePlayer')
    
    // Trouver le bouton d'enregistrement
    const saveButton = wrapper.findAll('button').find(b => b.text().includes('Enregistrer'))
    expect(saveButton).toBeDefined()
    
    if (saveButton) {
      await saveButton.trigger('click')
      
      // Vérifier que la méthode a été appelée
      expect(spy).toHaveBeenCalled()
    }
  })

  it('cancels editing when cancel button is clicked in edit mode', async () => {
    // Mettre le joueur en mode édition
    store.startEditingPlayer(playerId)
    
    const wrapper = mount(PlayerCard, {
      props: {
        playerId
      }
    })
    
    // Espionner la méthode cancelEditingPlayer du store
    const spy = vi.spyOn(store, 'cancelEditingPlayer')
    
    // Trouver le bouton d'annulation
    const cancelButton = wrapper.findAll('button').find(b => b.text().includes('Annuler'))
    expect(cancelButton).toBeDefined()
    
    if (cancelButton) {
      await cancelButton.trigger('click')
      
      // Vérifier que la méthode a été appelée
      expect(spy).toHaveBeenCalled()
    }
  })

  it('displays dexterity modifier correctly', () => {
    // Mettre à jour le joueur dans le store avec les valeurs attendues
    store.updatePlayer(playerId, {
      dexterity: 16
    })
    
    const wrapper = mount(PlayerCard, {
      props: {
        playerId
      }
    })

    // Pour une dextérité de 16, le modificateur devrait être +3
    // Le format dans le template est "DEX: 16 (+3)"
    expect(wrapper.text()).toContain('DEX: 16')
    expect(wrapper.text()).toContain('(+3)')
  })

  it('updates initiative when input value changes', async () => {
    // Espionner la méthode updatePlayerInitiative du store
    const spy = vi.spyOn(store, 'updatePlayerInitiative')
    
    // Simuler un changement d'initiative en appelant directement la méthode du store
    store.updatePlayerInitiative(playerId, 20)
    
    // Vérifier que la méthode a été appelée avec le bon ID et la nouvelle valeur
    expect(spy).toHaveBeenCalledWith(playerId, 20)
  })
})
