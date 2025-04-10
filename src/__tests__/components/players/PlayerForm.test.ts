import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import type {Player} from '../../../stores/player'
import {usePlayerStore} from '../../../stores/player'
import PlayerForm from '../../../components/players/PlayerForm.vue'

describe('PlayerForm', () => {
  let store: ReturnType<typeof usePlayerStore>

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    store = usePlayerStore()
    
    // Reset form data before each test
    store.tempPlayerData = {
      name: '',
      initiative: 0,
      dexterity: 10,
      notes: ''
    }
  })

  it('renders correctly', () => {
    const wrapper = mount(PlayerForm)

    // Vérifier que le titre est présent
    expect(wrapper.find('h3').text()).toBe('Ajouter un Joueur')
    
    // Vérifier que les champs sont présents
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(3) // Nom, Initiative, Dextérité
    
    // Vérifier que les labels sont corrects
    const labels = wrapper.findAll('label')
    expect(labels[0].text()).toBe('Nom')
    expect(labels[1].text()).toBe('Initiative')
    expect(labels[2].text()).toBe('Dextérité')
    
    // Vérifier que les boutons sont présents
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
    expect(buttons[0].text()).toBe('Ajouter le Joueur')
    expect(buttons[1].text()).toBe('Annuler')
  })

  it('binds form fields to store data', async () => {
    const wrapper = mount(PlayerForm)

    // Remplir le formulaire
    const inputs = wrapper.findAll('input')
    const nameInput = inputs[0]
    const initiativeInput = inputs[1]
    const dexterityInput = inputs[2]
    
    await nameInput.setValue('Legolas')
    await initiativeInput.setValue(5)
    await dexterityInput.setValue(18)
    
    // Vérifier que les données du store ont été mises à jour
    expect(store.tempPlayerData.name).toBe('Legolas')
    expect(store.tempPlayerData.initiative).toBe(5)
    expect(store.tempPlayerData.dexterity).toBe(18)
  })

  it('calls addPlayer when form is submitted with valid data', async () => {
    const addPlayerSpy = vi.spyOn(store, 'addPlayer')
    
    const wrapper = mount(PlayerForm)

    // Remplir le formulaire avec des données valides
    const nameInput = wrapper.findAll('input')[0]
    await nameInput.setValue('Legolas')
    
    // Cliquer sur le bouton d'ajout
    const addButton = wrapper.findAll('button')[0]
    await addButton.trigger('click')
    
    // Vérifier que addPlayer a été appelé avec les bonnes données
    expect(addPlayerSpy).toHaveBeenCalledWith({
      name: 'Legolas',
      initiative: 0, // Valeur par défaut
      dexterity: 10, // Valeur par défaut
      notes: ''
    } as Omit<Player, 'id'>)
  })

  it('does not call addPlayer when form is submitted with invalid data', async () => {
    const addPlayerSpy = vi.spyOn(store, 'addPlayer')
    
    const wrapper = mount(PlayerForm)

    // Ne pas remplir le nom (requis)
    
    // Cliquer sur le bouton d'ajout
    const addButton = wrapper.findAll('button')[0]
    await addButton.trigger('click')
    
    // Vérifier que addPlayer n'a pas été appelé
    expect(addPlayerSpy).not.toHaveBeenCalled()
  })

  it('calls resetForm when cancel button is clicked', async () => {
    const resetFormSpy = vi.spyOn(store, 'resetForm')
    
    const wrapper = mount(PlayerForm)

    // Cliquer sur le bouton d'annulation
    const cancelButton = wrapper.findAll('button')[1]
    await cancelButton.trigger('click')
    
    // Vérifier que resetForm a été appelé
    expect(resetFormSpy).toHaveBeenCalled()
  })
})
