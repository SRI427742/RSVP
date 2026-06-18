import type { EventId } from '../types/rsvp'

export interface NewInvitation {
  displayName: string
  email: string
  phone: string
  eventIds: EventId[]
}

export type NewInvitationErrors = Partial<
  Record<'displayName' | 'contact' | 'events', string>
>

export function validateNewInvitation(
  invitation: NewInvitation,
): NewInvitationErrors {
  const errors: NewInvitationErrors = {}

  if (!invitation.displayName.trim()) {
    errors.displayName = 'Enter a guest or group name.'
  }

  if (!invitation.email.trim() && !invitation.phone.trim()) {
    errors.contact = 'Enter an email address or phone number.'
  } else if (
    invitation.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitation.email.trim())
  ) {
    errors.contact = 'Enter a valid email address.'
  } else if (
    invitation.phone.trim() &&
    invitation.phone.replace(/\D/g, '').length < 7
  ) {
    errors.contact = 'Enter a valid phone number.'
  }

  if (invitation.eventIds.length === 0) {
    errors.events = 'Select at least one event.'
  }

  return errors
}

export function buildInvitationMessage(
  displayName: string,
  invitationUrl: string,
) {
  return `Nikhitha & Sri Harsha invite ${displayName} to celebrate with us. View your invitation and RSVP here: ${invitationUrl}`
}
