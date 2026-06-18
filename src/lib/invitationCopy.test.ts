import { describe, expect, it } from 'vitest'
import { weddingEvents } from '../data/events'
import type { EventId } from '../types/rsvp'
import {
  getCelebrationHeading,
  getCelebrationMessage,
  getHeroMessage,
} from './invitationCopy'

function events(...eventIds: EventId[]) {
  return weddingEvents.filter((event) => eventIds.includes(event.id))
}

describe('invitation copy', () => {
  it('names a single invited event', () => {
    const weddingOnly = events('wedding')

    expect(getHeroMessage(weddingOnly)).toBe(
      'With joyful hearts, we invite you to join us for the Wedding.',
    )
    expect(getCelebrationHeading(weddingOnly)).toBe('Wedding')
    expect(getCelebrationMessage(weddingOnly)).toBe(
      'We would be delighted to have you with us for this special occasion.',
    )
  })

  it('names two invited events', () => {
    const haldiAndWedding = events('haldi', 'wedding')

    expect(getHeroMessage(haldiAndWedding)).toBe(
      'With joyful hearts, we invite you to join us for the Haldi and Wedding.',
    )
    expect(getCelebrationHeading(haldiAndWedding)).toBe('Haldi and Wedding')
  })

  it('names all invited events', () => {
    const allEvents = events('haldi', 'wedding', 'vratham')

    expect(getHeroMessage(allEvents)).toBe(
      'With joyful hearts, we invite you to join us for the Haldi, Wedding, and Vratham.',
    )
    expect(getCelebrationHeading(allEvents)).toBe(
      'Haldi, Wedding, and Vratham',
    )
  })
})
