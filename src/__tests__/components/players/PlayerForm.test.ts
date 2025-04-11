import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {usePlayerStore} from '../../../stores/player'
import PlayerForm from '../../../components/players/PlayerForm.vue'

describe('PlayerForm', () => {
  let store: ReturnType<typeof usePlayerStore>

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    store = usePlayerStore()
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

  it('updates local form data when inputs change', async () => {
    const wrapper = mount(PlayerForm)

    // Remplir le formulaire
    const inputs = wrapper.findAll('input')
    const nameInput = inputs[0]
    const initiativeInput = inputs[1]
    const dexterityInput = inputs[2]
    
    await nameInput.setValue('Legolas')
    await initiativeInput.setValue(5)
    await dexterityInput.setValue(18)
    
    // Vérifier que les valeurs des inputs ont été mises à jour
    expect(nameInput.element.value).toBe('Legolas')
    expect(initiativeInput.element.value).toBe('5')
    expect(dexterityInput.element.value).toBe('18')
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
    expect(addPlayerSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Legolas',
      initiative: 0, // Valeur par défaut
      dexterity: 10, // Valeur par défaut
      notes: ''
    }))
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

  it('calls cancelAddingPlayer when cancel button is clicked', async () => {
    const cancelAddingPlayerSpy = vi.spyOn(store, 'cancelAddingPlayer')
    
    const wrapper = mount(PlayerForm)

    // Cliquer sur le bouton d'annulation
    const cancelButton = wrapper.findAll('button')[1]
    await cancelButton.trigger('click')
    
    // Vérifier que cancelAddingPlayer a été appelé
    expect(cancelAddingPlayerSpy).toHaveBeenCalled()
  })
  
  it('resets form data after submission', async () => {
    const wrapper = mount(PlayerForm)

    // Remplir le formulaire
    const inputs = wrapper.findAll('input')
    const nameInput = inputs[0]
    await nameInput.setValue('Legolas')
    
    // Cliquer sur le bouton d'ajout
    const addButton = wrapper.findAll('button')[0]
    await addButton.trigger('click')
    
    // Vérifier que les champs ont été réinitialisés
    expect(nameInput.element.value).toBe('')
  })
})
