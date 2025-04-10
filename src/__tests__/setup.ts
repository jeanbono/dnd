import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock global objects
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn()
})

vi.stubGlobal('confirm', vi.fn(() => true))

// Mock UUID pour des tests déterministes
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid')
}))

// Configuration globale pour @vue/test-utils
config.global.stubs = {
  transition: true,
  'router-link': true,
  'router-view': true
}

// Désactiver les avertissements de Vue
config.global.config.warnHandler = () => null
