import { describe, it, expect, vi, afterEach } from 'vitest'
import { persistHistorySafely } from '@/lib/storage'
import { STORAGE_KEY_V2 } from '@/lib/constants'
import type { CaseRecord } from '@/lib/types'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

function sampleCase(i = 0): CaseRecord {
  return {
    id: `id_${i}`,
    createdAt: Date.now(),
    plantName: `P${i}`,
    plantType: 'Testus',
    environment: '',
    notes: 'x'.repeat(50),
    symptoms: [],
    toggles: {},
    moistureLevel: 50,
    lightLevel: 50,
    results: [{ issue: 'None', confidence: 0.2, reasons: [], actions: [] }],
    thumbUrl: 'data:image/jpeg;base64,' + 'A'.repeat(250),
  }
}

describe('persistHistorySafely', () => {
  it('saves a small history without errors', () => {
    const hist = [sampleCase(1), sampleCase(2), sampleCase(3)]
    expect(() => persistHistorySafely(hist)).not.toThrow()
    const stored = localStorage.getItem(STORAGE_KEY_V2)
    expect(stored).toBeTruthy()
  })

  it('prunes or strips thumbnails on quota error', () => {
    const original = localStorage.setItem.bind(localStorage)
    let calls = 0
    vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation((k: string, v: string) => {
      calls++
      if (calls === 1) {
        const err: any = new Error('exceeded the quota')
        err.name = 'QuotaExceededError'
        throw err
      }
      return original(k, v)
    })

    const big = new Array(200).fill(0).map((_, i) => sampleCase(i))
    expect(() => persistHistorySafely(big)).not.toThrow()

    const stored = localStorage.getItem(STORAGE_KEY_V2)
    expect(stored).toBeTruthy()
    expect(stored!.length).toBeLessThan(JSON.stringify(big).length)
  })
})
