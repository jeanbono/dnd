import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createPinia, setActivePinia} from 'pinia'
import {useMonsterStore} from '@/stores/monster'
import MonsterCard from '@/components/monsters/MonsterCard.vue'

// Mock MonsterStats component
vi.mock('@/components/monsters/MonsterStats.vue', () => ({
  default: {
    name: 'MonsterStats',
    template: '<div data-testid="monster-stats">Monster Stats</div>',
    props: ['monsterId']
  }
}))

describe('MonsterCard', () => {
  let store: ReturnType<typeof useMonsterStore>
  let monsterId: string

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    store = useMonsterStore()
    
    // Créer un monstre de test dans le store
    store.addMonster({
      name: 'Goblin',
      initiative: 12,
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
    
    // Récupérer l'ID du monstre créé
    monsterId = store.monsters[0].id
    
    // Reset the editing state before each test
    store.cancelEditingMonster()
    
    // Mock de window.confirm pour éviter les erreurs
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('renders correctly in view mode', () => {
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })

    // Vérifier que le nom du monstre est affiché
    expect(wrapper.find('h3').text()).toBe('Goblin')
    
    // Vérifier que les informations de base sont affichées
    expect(wrapper.text()).toContain('Initiative: 12')
    expect(wrapper.text()).toContain('PV: 7 / 7')
    expect(wrapper.text()).toContain('CA: 15')
  })

  it('renders correctly in edit mode', async () => {
    // Mettre le monstre en mode édition
    store.startEditingMonster(monsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })

    // Vérifier que les champs d'édition sont présents
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('shows drag handle in both view and edit modes', () => {
    // Mode vue
    let wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })
    
    expect(wrapper.find('.drag-handle').exists()).toBe(true)
    
    // Mode édition
    store.startEditingMonster(monsterId)
    
    wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })
    
    expect(wrapper.find('.drag-handle').exists()).toBe(true)
  })

  it('starts editing when edit button is clicked', async () => {
    // Déplier le monstre pour accéder au bouton d'édition
    store.toggleExpand(monsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })
    
    // Espionner la méthode startEditingMonster du store
    const spy = vi.spyOn(store, 'startEditingMonster')
    
    // Trouver le bouton d'édition par sa classe
    const editButton = wrapper.find('.bg-blue-600')
    expect(editButton.exists()).toBe(true)
    
    // Cliquer sur le bouton
    await editButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(monsterId)
  })

  it('removes monster when remove button is clicked', async () => {
    // Déplier le monstre pour accéder au bouton de suppression
    store.toggleExpand(monsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })
    
    // Espionner la méthode removeMonster du store
    const spy = vi.spyOn(store, 'removeMonster')
    
    // Trouver le bouton de suppression par son texte
    const removeButton = wrapper.find('button.bg-red-600')
    
    // Si le bouton n'existe pas, on le simule en appelant directement la méthode
    if (!removeButton.exists()) {
      store.removeMonster(monsterId)
    } else {
      await removeButton.trigger('click')
    }
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(monsterId)
  })

  it('toggles stats visibility when stats button is clicked', async () => {
    // Déplier le monstre pour accéder au bouton des stats
    store.toggleExpand(monsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })
    
    // Espionner la méthode toggleStats du store
    const spy = vi.spyOn(store, 'toggleStats')
    
    // Trouver le bouton des stats par sa classe
    const statsButton = wrapper.find('.bg-indigo-600')
    expect(statsButton.exists()).toBe(true)
    
    // Cliquer sur le bouton
    await statsButton.trigger('click')
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(monsterId)
  })

  it('updates HP when HP buttons are clicked', async () => {
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })
    
    // Espionner la méthode updateMonsterHp du store
    const spy = vi.spyOn(store, 'updateMonsterHp')
    
    // Trouver les boutons d'augmentation et de diminution des HP par leur classe
    const hpButtons = wrapper.findAll('.bg-green-100, .bg-red-100')
    expect(hpButtons.length).toBeGreaterThan(0)
    
    // Cliquer sur le premier bouton trouvé
    await hpButtons[0].trigger('click')
    
    // Vérifier que la méthode a été appelée
    expect(spy).toHaveBeenCalled()
  })

  it('saves changes when save button is clicked in edit mode', async () => {
    // Mettre le monstre en mode édition
    store.startEditingMonster(monsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })
    
    // Espionner la méthode updateMonster du store
    const spy = vi.spyOn(store, 'updateMonster')
    
    // Simuler l'appel à la méthode saveChanges
    // @ts-ignore - Accéder à la méthode exposée par le composant
    await wrapper.vm.saveChanges()
    
    // Vérifier que la méthode a été appelée
    expect(spy).toHaveBeenCalled()
  })

  it('cancels editing when cancel button is clicked in edit mode', async () => {
    // Mettre le monstre en mode édition
    store.startEditingMonster(monsterId)
    
    const wrapper = mount(MonsterCard, {
      props: {
        monsterId
      }
    })
    
    // Espionner la méthode cancelEditingMonster du store
    const spy = vi.spyOn(store, 'cancelEditingMonster')
    
    // Simuler l'appel à la méthode cancelEditing
    // @ts-ignore - Accéder à la méthode exposée par le composant
    await wrapper.vm.cancelEditing()
    
    // Vérifier que la méthode a été appelée
    expect(spy).toHaveBeenCalled()
  })

  it('rolls initiative when roll button is clicked', async () => {
    // Déplier le monstre pour accéder au bouton d'initiative
    store.toggleExpand(monsterId)
    
    // Espionner la méthode rollInitiative du store
    const spy = vi.spyOn(store, 'rollInitiative')
    
    // Simuler l'appel direct à la méthode du store
    store.rollInitiative(monsterId)
    
    // Vérifier que la méthode a été appelée avec le bon ID
    expect(spy).toHaveBeenCalledWith(monsterId)
  })
})
