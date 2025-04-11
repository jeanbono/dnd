import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import InitiativeOrder from '@/components/initiative/InitiativeOrder.vue'
import { useMonsterStore } from '@/stores/monster'
import { usePlayerStore } from '@/stores/player'

describe('InitiativeOrder', () => {
  let monsterStore: ReturnType<typeof useMonsterStore>
  let playerStore: ReturnType<typeof usePlayerStore>

  beforeEach(() => {
    // Configuration de Pinia
    setActivePinia(createPinia())
    monsterStore = useMonsterStore()
    playerStore = usePlayerStore()
    
    // Ajouter quelques monstres et joueurs pour les tests
    monsterStore.addMonster({
      name: 'Goblin',
      initiative: 12,
      hp: 7,
      maxHp: 7,
      ac: 15,
      dexterity: 14,
      notes: ''
    })
    
    monsterStore.addMonster({
      name: 'Orc',
      initiative: 8,
      hp: 15,
      maxHp: 15,
      ac: 13,
      dexterity: 12,
      notes: ''
    })
    
    playerStore.addPlayer({
      name: 'Aragorn',
      initiative: 18,
      dexterity: 16
    })
    
    playerStore.addPlayer({
      name: 'Legolas',
      initiative: 20,
      dexterity: 18
    })
  })

  it('renders correctly', () => {
    const wrapper = mount(InitiativeOrder)

    // Vérifier que le titre est présent
    expect(wrapper.find('h2').text()).toBe('Ordre d\'Initiative')
    
    // Vérifier que tous les participants sont affichés
    expect(wrapper.html()).toContain('Legolas')
    expect(wrapper.html()).toContain('Aragorn')
    expect(wrapper.html()).toContain('Goblin')
    expect(wrapper.html()).toContain('Orc')
  })

  it('sorts participants by initiative in descending order', () => {
    const wrapper = mount(InitiativeOrder)

    // Vérifier que l'ordre est correct (par initiative décroissante)
    const html = wrapper.html()
    const legolasIndex = html.indexOf('Legolas')
    const aragornIndex = html.indexOf('Aragorn')
    const goblinIndex = html.indexOf('Goblin')
    const orcIndex = html.indexOf('Orc')
    
    // Verify order: Legolas (20) > Aragorn (18) > Goblin (12) > Orc (8)
    expect(legolasIndex).toBeLessThan(aragornIndex)
    expect(aragornIndex).toBeLessThan(goblinIndex)
    expect(goblinIndex).toBeLessThan(orcIndex)
  })

  it('displays initiative values for each participant', () => {
    const wrapper = mount(InitiativeOrder)

    // Vérifier que les valeurs d'initiative sont affichées
    const html = wrapper.html()
    
    expect(html).toContain('Initiative : 20') // Legolas
    expect(html).toContain('Initiative : 18') // Aragorn
    expect(html).toContain('Initiative : 12') // Goblin
    expect(html).toContain('Initiative : 8')  // Orc
  })

  it('updates when initiative values change', async () => {
    const wrapper = mount(InitiativeOrder)

    // Modifier l'initiative d'un monstre
    monsterStore.updateMonster(monsterStore.monsters[0].id, { initiative: 25 })
    await wrapper.vm.$nextTick()
    
    // Vérifier que l'ordre a été mis à jour en vérifiant le HTML
    const html = wrapper.html()
    const goblinIndex = html.indexOf('Goblin')
    const legolasIndex = html.indexOf('Legolas')
    
    // Verify new order: Goblin (25) > Legolas (20)
    expect(goblinIndex).toBeLessThan(legolasIndex)
  })

  it('applies different styles to monsters and players', () => {
    const wrapper = mount(InitiativeOrder)

    // Vérifier que les joueurs et les monstres ont des classes différentes
    const playerElements = wrapper.findAll('.bg-blue-50')
    const monsterElements = wrapper.findAll('.bg-red-50')
    
    // Check that we have player and monster elements (without checking exact count)
    expect(playerElements.length).toBeGreaterThan(0)
    expect(monsterElements.length).toBeGreaterThan(0)
    
    // Check content of elements - use text() instead of html()
    expect(playerElements[0].text()).toContain('Legolas')
    // The second player element might not be at index 1, so check all player elements for Aragorn
    const hasAragorn = playerElements.some(el => el.text().includes('Aragorn'))
    expect(hasAragorn).toBe(true)
    
    // Check monster elements
    expect(monsterElements[0].text()).toContain('Goblin')
    // The second monster element might not be at index 1, so check all monster elements for Orc
    const hasOrc = monsterElements.some(el => el.text().includes('Orc'))
    expect(hasOrc).toBe(true)
  })

  it('shows empty state when there are no participants', async () => {
    // Supprimer tous les monstres et joueurs
    monsterStore.monsters.splice(0, monsterStore.monsters.length)
    playerStore.players.splice(0, playerStore.players.length)
    
    const wrapper = mount(InitiativeOrder)

    // Vérifier que le message d'état vide est affiché
    expect(wrapper.html()).toContain('Aucun personnage dans l\'ordre d\'initiative')
  })
})
