import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import MonsterStats from '../../../components/monsters/MonsterStats.vue'
import {createPinia, setActivePinia} from 'pinia'

// Mock the monster store
vi.mock('../../../stores/monster', () => ({
  useMonsterStore: vi.fn(() => ({
    getMonsterById: vi.fn((id) => {
      if (id === 'test-monster-id') {
        return {
          id: 'test-monster-id',
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
          charisma: 8
        }
      } else if (id === 'incomplete-monster-id') {
        return {
          id: 'incomplete-monster-id',
          name: 'Incomplete Goblin',
          initiative: 2,
          hp: 7,
          maxHp: 10,
          ac: 15
        }
      }
      return null
    }),
    getAbilityModifier: vi.fn((score) => Math.floor((score - 10) / 2)),
  }))
}))

describe('MonsterStats', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders all ability scores correctly', () => {
    const wrapper = mount(MonsterStats, {
      props: {
        monsterId: 'test-monster-id'
      }
    })

    // Vérifier que toutes les caractéristiques sont affichées
    expect(wrapper.text()).toContain('FOR')
    expect(wrapper.text()).toContain('DEX')
    expect(wrapper.text()).toContain('CON')
    expect(wrapper.text()).toContain('INT')
    expect(wrapper.text()).toContain('SAG')
    expect(wrapper.text()).toContain('CHA')

    // Vérifier que les valeurs sont correctement formatées
    expect(wrapper.text()).toContain('8 (-1)')  // FOR
    expect(wrapper.text()).toContain('14 (+2)') // DEX
    expect(wrapper.text()).toContain('10 (+0)') // CON
    expect(wrapper.text()).toContain('10 (+0)') // INT
    expect(wrapper.text()).toContain('8 (-1)')  // SAG
    expect(wrapper.text()).toContain('8 (-1)')  // CHA
  })

  it('renders correctly on mobile and desktop', () => {
    const wrapper = mount(MonsterStats, {
      props: {
        monsterId: 'test-monster-id'
      }
    })

    // Vérifier que la version mobile existe
    expect(wrapper.find('.grid.grid-cols-3.gap-4.md\\:hidden').exists()).toBe(true)
    
    // Vérifier que la version desktop existe
    expect(wrapper.find('.hidden.md\\:flex').exists()).toBe(true)
  })

  it('handles missing ability scores gracefully', () => {
    const wrapper = mount(MonsterStats, {
      props: {
        monsterId: 'incomplete-monster-id'
      }
    })

    // Vérifier que les valeurs par défaut sont affichées
    expect(wrapper.text()).toContain('— (±0)')
  })
})
