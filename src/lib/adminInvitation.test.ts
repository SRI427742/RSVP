import { describe, expect, it } from 'vitest'
import {
  buildInvitationMessage,
  validateNewInvitation,
  type NewInvitation,
} from './adminInvitation'

const validInvitation = (
  update: Partial<NewInvitation> = {},
): NewInvitation => ({
  displayName: 'Rao family',
  email: 'rao@example.com',
  phone: '',
  eventIds: ['wedding'],
  ...update,
})

describe('validateNewInvitation', () => {
  it('accepts email-only invitations', () => {
    expect(validateNewInvitation(validInvitation())).toEqual({})
  })

  it('accepts phone-only invitations', () => {
    expect(
      validateNewInvitation(
        validInvitation({ email: '', phone: '(214) 555-0123' }),
      ),
    ).toEqual({})
  })

  it('accepts invitations with both contact methods', () => {
    expect(
      validateNewInvitation(
        validInvitation({ phone: '(214) 555-0123' }),
      ),
    ).toEqual({})
  })

  it('accepts every event combination', () => {
    const combinations: NewInvitation['eventIds'][] = [
      ['haldi'],
      ['wedding'],
      ['vratham'],
      ['haldi', 'wedding'],
      ['haldi', 'vratham'],
      ['wedding', 'vratham'],
      ['haldi', 'wedding', 'vratham'],
    ]

    combinations.forEach((eventIds) => {
      expect(
        validateNewInvitation(validInvitation({ eventIds })),
      ).toEqual({})
    })
  })

  it('requires a guest or group name', () => {
    expect(
      validateNewInvitation(validInvitation({ displayName: '  ' })),
    ).toMatchObject({
      displayName: 'Enter a guest or group name.',
    })
  })

  it('requires email or phone', () => {
    expect(
      validateNewInvitation(validInvitation({ email: '', phone: '' })),
    ).toMatchObject({
      contact: 'Enter an email address or phone number.',
    })
  })

  it('rejects malformed email', () => {
    expect(
      validateNewInvitation(
        validInvitation({ email: 'not-an-email' }),
      ),
    ).toMatchObject({
      contact: 'Enter a valid email address.',
    })
  })

  it('rejects short phone numbers', () => {
    expect(
      validateNewInvitation(
        validInvitation({ email: '', phone: '123' }),
      ),
    ).toMatchObject({
      contact: 'Enter a valid phone number.',
    })
  })

  it('requires at least one event', () => {
    expect(
      validateNewInvitation(validInvitation({ eventIds: [] })),
    ).toMatchObject({
      events: 'Select at least one event.',
    })
  })

  it('returns all independent validation errors together', () => {
    expect(
      validateNewInvitation(
        validInvitation({
          displayName: '',
          email: '',
          phone: '',
          eventIds: [],
        }),
      ),
    ).toEqual({
      displayName: 'Enter a guest or group name.',
      contact: 'Enter an email address or phone number.',
      events: 'Select at least one event.',
    })
  })
})

describe('buildInvitationMessage', () => {
  it('includes the group name and exact invitation URL', () => {
    expect(
      buildInvitationMessage(
        'Rao family',
        'https://example.com/?invite=abc123',
      ),
    ).toContain(
      'Rao family to celebrate with us. View your invitation and RSVP here: https://example.com/?invite=abc123',
    )
  })
})
