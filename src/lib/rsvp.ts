import type {
  EventId,
  EventResponse,
  Invitation,
  RsvpErrors,
  RsvpResponse,
} from '../types/rsvp'

const emptyEventResponse = (): EventResponse => ({
  attending: null,
  guestCount: 1,
  additionalNames: '',
})

export function createEmptyResponse(): RsvpResponse {
  return {
    guestName: '',
    email: '',
    phone: '',
    events: {
      haldi: emptyEventResponse(),
      wedding: emptyEventResponse(),
      vratham: emptyEventResponse(),
    },
  }
}

export function validateResponse(
  response: RsvpResponse,
  invitation: Invitation,
): RsvpErrors {
  const errors: RsvpErrors = {}

  if (!response.guestName.trim()) {
    errors.guestName = 'Please enter your name.'
  }

  if (!response.email.trim() && !response.phone.trim()) {
    errors.contact = 'Please provide a phone number or email.'
  }

  if (
    response.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(response.email.trim())
  ) {
    errors.contact = 'Please enter a valid email address.'
  }

  if (
    response.phone.trim() &&
    response.phone.replace(/\D/g, '').length < 7
  ) {
    errors.contact = 'Please enter a valid phone number.'
  }

  invitation.eventIds.forEach((eventId) => {
    const eventResponse = response.events[eventId]

    if (!eventResponse.attending) {
      errors[eventId] = 'Please select an answer.'
    } else if (
      eventResponse.attending === 'yes' &&
      eventResponse.guestCount < 1
    ) {
      errors[eventId] = 'Please enter at least one guest.'
    }
  })

  return errors
}

export function updateEventResponse(
  response: RsvpResponse,
  eventId: EventId,
  update: Partial<EventResponse>,
): RsvpResponse {
  return {
    ...response,
    events: {
      ...response.events,
      [eventId]: {
        ...response.events[eventId],
        ...update,
      },
    },
  }
}
