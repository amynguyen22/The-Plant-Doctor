import { describe, it, expect } from 'vitest'
import { analyze } from '@/lib/analyze'

describe('analyze()', () => {
  it('flags Underwatering when soil very dry + wilting', () => {
    const res = analyze(['wilting'], { soil_dry: true }, 10, 50, '')
    expect(res[0].issue).toBe('Underwatering')
    expect(res[0].confidence).toBeGreaterThanOrEqual(0.7)
  })

  it('flags Root rot from overwatering when mushy stem present', () => {
    const res = analyze(['yellowing', 'mushy_stem'], { soil_soggy: true }, 80, 50, '')
    expect(res[0].issue).toContain('Root rot')
    expect(res[0].confidence).toBeGreaterThanOrEqual(0.9)
    expect(res[0].urgency).toBe('high')
  })

  it('flags Spider mites if webbing is present', () => {
    const res = analyze(['webbing'], {}, 50, 50, '')
    expect(res.find(r => r.issue === 'Spider mites')).toBeTruthy()
  })

  it('nudges nutrient deficiency confidence down if fertilized recently', () => {
    const base = analyze(['yellowing'], { fertilized: false }, 50, 50, '')
    const after = analyze(['yellowing'], { fertilized: true }, 50, 50, '')
    const baseItem = base.find(r => r.issue.includes('nutrient'))
    const afterItem = after.find(r => r.issue.includes('nutrient'))
    expect(baseItem && afterItem).toBeTruthy()
    expect((afterItem!.confidence) <= (baseItem!.confidence)).toBe(true)
  })
})
