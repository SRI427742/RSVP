import { describe, expect, it } from 'vitest'
import { weddingEvents } from '../data/events'
import { getEventArtwork } from './eventArtwork'

describe('event artwork', () => {
  it('uses the Haldi portrait for Haldi tiles', () => {
    const haldi = weddingEvents.find((event) => event.id === 'haldi')

    expect(haldi && getEventArtwork(haldi)).toBe(
      '/images/haldi-portrait.png',
    )
  })

  it('uses event portraits for each ceremony tile', () => {
    const wedding = weddingEvents.find((event) => event.id === 'wedding')
    const vratham = weddingEvents.find((event) => event.id === 'vratham')

    expect(wedding && getEventArtwork(wedding)).toBe(
      '/images/wedding-portrait.png',
    )
    expect(vratham && getEventArtwork(vratham)).toBe(
      '/images/vratham-portrait.png',
    )
  })
})
