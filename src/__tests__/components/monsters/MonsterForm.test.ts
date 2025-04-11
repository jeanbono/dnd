import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useMonsterStore } from '@/stores/monster'
import MonsterForm from '@/components/monsters/MonsterForm.vue'

describe('MonsterForm', () => {
  let store: ReturnType<typeof useMonsterStore>

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    store = useMonsterStore()
  })

  it('renders correctly', () => {
    const wrapper = mount(MonsterForm)

    // Vérifier que le titre est présent
    expect(wrapper.find('h3').text()).toBe('Ajouter un Monstre')
    
    // Vérifier que les champs sont présents
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(0)
    
    // Vérifier que les boutons sont présents
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
    expect(buttons[0].text()).toBe('Ajouter le Monstre')
    expect(buttons[1].text()).toBe('Annuler')
  })

  it('updates local form data when inputs change', async () => {
    const wrapper = mount(MonsterForm)

    // Remplir le formulaire
    const nameInput = wrapper.find('input[type="text"]')
    const initiativeInput = wrapper.findAll('input[type="number"]')[0]
    const hpInput = wrapper.findAll('input[type="number"]')[1]
    
    await nameInput.setValue('Dragon')
    await initiativeInput.setValue(5)
    await hpInput.setValue(100)
    
    // Vérifier que les valeurs des inputs ont été mises à jour
    expect((nameInput.element as HTMLInputElement).value).toBe('Dragon')
    expect((initiativeInput.element as HTMLInputElement).value).toBe('5')
    expect((hpInput.element as HTMLInputElement).value).toBe('100')
  })

  it('calls addMonster when form is submitted', async () => {
    const addMonsterSpy = vi.spyOn(store, 'addMonster')
    
    const wrapper = mount(MonsterForm)

    // Remplir le formulaire
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('Dragon')
    
    // Cliquer sur le bouton d'ajout
    const addButton = wrapper.find('button.bg-green-600')
    await addButton.trigger('click')
    
    // Vérifier que addMonster a été appelé avec les bonnes données
    expect(addMonsterSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Dragon',
      initiative: 0, // Valeur par défaut
      hp: 0, // Valeur par défaut
      maxHp: 0, // Valeur par défaut
      ac: 0 // Valeur par défaut
    }))
  })

  it('calls cancelAddingMonster when cancel button is clicked', async () => {
    const cancelAddingMonsterSpy = vi.spyOn(store, 'cancelAddingMonster')
    
    const wrapper = mount(MonsterForm)

    // Cliquer sur le bouton d'annulation
    const cancelButton = wrapper.find('button.bg-gray-300')
    await cancelButton.trigger('click')
    
    // Vérifier que cancelAddingMonster a été appelé
    expect(cancelAddingMonsterSpy).toHaveBeenCalled()
  })
  
  it('resets form data after submission', async () => {
    const wrapper = mount(MonsterForm)

    // Remplir le formulaire
    const nameInput = wrapper.find('input[type="text"]')
    await nameInput.setValue('Dragon')
    
    // Cliquer sur le bouton d'ajout
    const addButton = wrapper.find('button.bg-green-600')
    await addButton.trigger('click')
    
    // Vérifier que les champs ont été réinitialisés
    expect((nameInput.element as HTMLInputElement).value).toBe('')
  })

  it('shows empty form even when a monster is being edited', async () => {
    // Ajouter un monstre au store
    store.addMonster({
      name: 'Existing Monster',
      initiative: 5,
      hp: 30,
      maxHp: 30,
      ac: 16,
      notes: 'Existing notes'
    })
    
    const monsterId = store.monsters[0].id
    
    // Commencer l'édition du monstre
    store.startEditingMonster(monsterId)
    
    // Monter le composant après avoir commencé l'édition
    const wrapper = mount(MonsterForm)
    
    // Vérifier que le formulaire est vide malgré l'édition en cours
    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe('')
    expect((wrapper.findAll('input[type="number"]')[0].element as HTMLInputElement).value).toBe('0') // initiative
  })
})
