import type { EventId, Invitation } from '../types/rsvp'

const validEventIds: EventId[] = ['haldi', 'wedding', 'vratham']

export function getInvitation(): Invitation {
  const params = new URLSearchParams(window.location.search)
  const requestedEvents = params
    .get('events')
    ?.split(',')
    .filter((eventId): eventId is EventId =>
      validEventIds.includes(eventId as EventId),
    )

  return {
    token: params.get('invite') ?? 'preview',
    eventIds: requestedEvents?.length ? requestedEvents : validEventIds,
  }
}
