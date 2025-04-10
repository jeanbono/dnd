import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import type {Player} from '../../../stores/player'
import {usePlayerStore} from '../../../stores/player'
import PlayerCard from '../../../components/players/PlayerCard.vue'

describe('PlayerCard', () => {
  let store: ReturnType<typeof usePlayerStore>
  let testPlayer: Player

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    store = usePlayerStore()
    
    // Créer un joueur de test
    testPlayer = {
      id: 'test-player-id',
      name: 'Aragorn',
      initiative: 15,
      dexterity: 16,
      notes: 'Ranger du Nord'
    }
    
    // Reset the editing state before each test
    store.editingPlayerId = null
    
    // Mock de window.confirm pour éviter les erreurs
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('renders correctly in view mode', () => {
    const wrapper = mount(PlayerCard, {
      props: {
        player: testPlayer
      }
    })

    // Vérifier que le nom du joueur est affiché
    expect(wrapper.find('h3').text()).toBe('Aragorn')
    
    // Vérifier que les informations de base sont affichées
    expect(wrapper.text()).toContain('Initiative: 15')
    expect(wrapper.text()).toContain('DEX: 16')
    
    // Vérifier que les boutons d'action sont présents
    expect(wrapper.findAll('button').length).toBe(2)
    expect(wrapper.findAll('button')[0].text()).toBe('Modifier')
    expect(wrapper.findAll('button')[1].text()).toBe('Supprimer')
  })

  it('renders correctly in edit mode', async () => {
    // Add the player to the store first
    store.players = [testPlayer]
    
    // Mettre le joueur en mode édition
    store.startEditingPlayer(testPlayer.id)
    
    const wrapper = mount(PlayerCard, {
      props: {
        player: testPlayer
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
        player: testPlayer
      }
    })
    
    expect(wrapper.find('.drag-handle').exists()).toBe(true)
    
    // Mode édition
    // Add the player to the store first
    store.players = [testPlayer]
    store.startEditingPlayer(testPlayer.id)
    
    wrapper = mount(PlayerCard, {
      props: {
        player: testPlayer
      }
    })
    
    expect(wrapper.find('.drag-handle').exists()).toBe(true)
  })

  it('starts editing when edit button is clicked', async () => {
    // Add the player to the store first
    store.players = [testPlayer]
    
    // Espionner la méthode startEditingPlayer du store
    const spy = vi.spyOn(store, 'startEditingPlayer')
    
    const wrapper = mount(PlayerCard, {
      props: {
        player: testPlayer
      }
    })
    
    // Cliquer sur le bouton d'édition
    const editButton = wrapper.findAll('button')[0]
    await editButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(testPlayer.id)
  })

  it('removes player when remove button is clicked', async () => {
    // Add the player to the store first
    store.players = [testPlayer]
    
    // Espionner la méthode removePlayer du store
    const spy = vi.spyOn(store, 'removePlayer')
    
    const wrapper = mount(PlayerCard, {
      props: {
        player: testPlayer
      }
    })
    
    // Cliquer sur le bouton de suppression
    const removeButton = wrapper.findAll('button')[1]
    await removeButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(testPlayer.id)
  })

  it('saves changes when save button is clicked in edit mode', async () => {
    // Add the player to the store first
    store.players = [testPlayer]
    
    // Mettre le joueur en mode édition
    store.startEditingPlayer(testPlayer.id)
    
    // Espionner la méthode saveEditedPlayer du store
    const spy = vi.spyOn(store, 'saveEditedPlayer')
    
    const wrapper = mount(PlayerCard, {
      props: {
        player: testPlayer
      }
    })

    // Cliquer sur le bouton d'enregistrement
    const saveButton = wrapper.findAll('button')[1]
    await saveButton.trigger('click')
    
    // Vérifier que la méthode a été appelée
    expect(spy).toHaveBeenCalled()
  })

  it('cancels editing when cancel button is clicked in edit mode', async () => {
    // Add the player to the store first
    store.players = [testPlayer]
    
    // Mettre le joueur en mode édition
    store.startEditingPlayer(testPlayer.id)
    
    // Espionner la méthode cancelEditing du store
    const spy = vi.spyOn(store, 'cancelEditing')
    
    const wrapper = mount(PlayerCard, {
      props: {
        player: testPlayer
      }
    })

    // Cliquer sur le bouton d'annulation
    const cancelButton = wrapper.findAll('button')[0]
    await cancelButton.trigger('click')
    
    // Vérifier que la méthode a été appelée
    expect(spy).toHaveBeenCalled()
  })

  it('displays dexterity modifier correctly', () => {
    const wrapper = mount(PlayerCard, {
      props: {
        player: testPlayer
      }
    })

    // La formule pour le modificateur est (dex - 10) / 2, arrondi à l'inférieur
    // Pour une dextérité de 16, le modificateur devrait être +3
    expect(wrapper.text()).toContain('DEX: 16 (+3)')
  })
})
