import { describe, it, expect } from 'vitest'
import { calculateAbilityModifier, getAbilityScoreDisplay } from '../../utils/abilityUtils'

describe('Ability Utils', () => {
  describe('calculateAbilityModifier', () => {
    it('should calculate correct modifier for score 10 (average)', () => {
      expect(calculateAbilityModifier(10)).toBe(0)
    })

    it('should calculate correct modifier for above average scores', () => {
      expect(calculateAbilityModifier(12)).toBe(1)
      expect(calculateAbilityModifier(14)).toBe(2)
      expect(calculateAbilityModifier(16)).toBe(3)
      expect(calculateAbilityModifier(18)).toBe(4)
      expect(calculateAbilityModifier(20)).toBe(5)
      expect(calculateAbilityModifier(30)).toBe(10)
    })

    it('should calculate correct modifier for below average scores', () => {
      expect(calculateAbilityModifier(8)).toBe(-1)
      expect(calculateAbilityModifier(6)).toBe(-2)
      expect(calculateAbilityModifier(4)).toBe(-3)
      expect(calculateAbilityModifier(2)).toBe(-4)
      expect(calculateAbilityModifier(1)).toBe(-5)
    })

    it('should handle odd scores correctly', () => {
      // Odd scores should have the same modifier as the even score below them
      expect(calculateAbilityModifier(11)).toBe(0) // Same as 10
      expect(calculateAbilityModifier(13)).toBe(1) // Same as 12
      expect(calculateAbilityModifier(15)).toBe(2) // Same as 14
      expect(calculateAbilityModifier(9)).toBe(-1) // Same as 8
      expect(calculateAbilityModifier(7)).toBe(-2) // Same as 6
    })

    it('should handle extreme values', () => {
      expect(calculateAbilityModifier(0)).toBe(-5)
      expect(calculateAbilityModifier(100)).toBe(45)
    })
  })

  describe('getAbilityScoreDisplay', () => {
    it('should format scores with positive modifiers correctly', () => {
      expect(getAbilityScoreDisplay(12)).toBe('12 (+1)')
      expect(getAbilityScoreDisplay(16)).toBe('16 (+3)')
      expect(getAbilityScoreDisplay(20)).toBe('20 (+5)')
    })

    it('should format scores with negative modifiers correctly', () => {
      expect(getAbilityScoreDisplay(9)).toBe('9 (-1)')
      expect(getAbilityScoreDisplay(7)).toBe('7 (-2)')
      expect(getAbilityScoreDisplay(3)).toBe('3 (-4)')
    })

    it('should format scores with zero modifier correctly', () => {
      expect(getAbilityScoreDisplay(10)).toBe('10 (+0)')
      expect(getAbilityScoreDisplay(11)).toBe('11 (+0)')
    })

    it('should handle undefined scores correctly', () => {
      expect(getAbilityScoreDisplay(undefined)).toBe('—')
    })

    it('should handle extreme values', () => {
      expect(getAbilityScoreDisplay(0)).toBe('0 (-5)')
      expect(getAbilityScoreDisplay(30)).toBe('30 (+10)')
    })
  })
})
