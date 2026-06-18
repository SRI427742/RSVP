import { describe, expect, it } from 'vitest'
import {
  createEmptyResponse,
  updateEventResponse,
  validateResponse,
} from './rsvp'
import type { Invitation } from '../types/rsvp'

const allEvents: Invitation = {
  token: 'test',
  eventIds: ['haldi', 'wedding', 'vratham'],
}

describe('RSVP validation', () => {
  it('reports all missing required values', () => {
    expect(validateResponse(createEmptyResponse(), allEvents)).toEqual({
      guestName: 'Please enter your name.',
      contact: 'Please provide a phone number or email.',
      haldi: 'Please select an answer.',
      wedding: 'Please select an answer.',
      vratham: 'Please select an answer.',
    })
  })

  it('accepts phone-only contact and mixed event responses', () => {
    const response = createEmptyResponse()
    response.guestName = 'Guest'
    response.phone = '2145550123'
    response.events.haldi.attending = 'yes'
    response.events.haldi.guestCount = 3
    response.events.wedding.attending = 'no'
    response.events.vratham.attending = 'yes'

    expect(validateResponse(response, allEvents)).toEqual({})
  })

  it('validates only events assigned to the invitation', () => {
    const response = createEmptyResponse()
    response.guestName = 'Guest'
    response.email = 'guest@example.com'
    response.events.wedding.attending = 'yes'

    expect(
      validateResponse(response, {
        token: 'wedding-only',
        eventIds: ['wedding'],
      }),
    ).toEqual({})
  })

  it('rejects malformed email and short phone values', () => {
    const response = createEmptyResponse()
    response.guestName = 'Guest'
    response.email = 'bad'
    response.phone = '123'
    response.events.wedding.attending = 'no'

    expect(
      validateResponse(response, {
        token: 'wedding-only',
        eventIds: ['wedding'],
      }),
    ).toMatchObject({
      contact: 'Please enter a valid phone number.',
    })
  })

  it('keeps event updates isolated', () => {
    const original = createEmptyResponse()
    const updated = updateEventResponse(original, 'haldi', {
      attending: 'yes',
      guestCount: 4,
    })

    expect(updated.events.haldi).toMatchObject({
      attending: 'yes',
      guestCount: 4,
    })
    expect(updated.events.wedding).toEqual(original.events.wedding)
    expect(updated.events.vratham).toEqual(original.events.vratham)
  })
})
