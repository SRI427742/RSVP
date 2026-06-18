import { describe, expect, it } from 'vitest'
import { weddingEvents } from '../data/events'
import type { EventId } from '../types/rsvp'
import { getInvitationSummary } from './invitationSummary'

function events(...eventIds: EventId[]) {
  return weddingEvents.filter((event) => eventIds.includes(event.id))
}

describe('getInvitationSummary', () => {
  it.each([
    [['haldi'], 'August 27, 2026 · Frisco, Texas'],
    [['wedding'], 'August 28, 2026 · Irving, Texas'],
    [['vratham'], 'August 29, 2026 · Farmers Branch, Texas'],
    [['haldi', 'wedding'], 'August 27 & 28, 2026 · Dallas, Texas'],
    [['haldi', 'vratham'], 'August 27 & 29, 2026 · Dallas, Texas'],
    [['wedding', 'vratham'], 'August 28 & 29, 2026 · Dallas, Texas'],
    [
      ['haldi', 'wedding', 'vratham'],
      'August 27–29, 2026 · Dallas, Texas',
    ],
  ])('summarizes %s correctly', (eventIds, expected) => {
    expect(getInvitationSummary(events(...(eventIds as EventId[])))).toBe(
      expected,
    )
  })
})
