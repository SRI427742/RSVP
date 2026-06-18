import type { AdminGuestGroup } from '../types/admin'
import type { EventId } from '../types/rsvp'

export function getResponseCount(guestGroups: AdminGuestGroup[]) {
  return guestGroups.filter((group) => group.contact).length
}

export function getEventMetrics(
  guestGroups: AdminGuestGroup[],
  eventId: EventId,
) {
  return {
    invitedGroups: guestGroups.filter((group) =>
      group.eventIds.includes(eventId),
    ).length,
    attendingGuests: guestGroups.reduce(
      (total, group) =>
        total +
        (group.responses[eventId]?.attending
          ? group.responses[eventId]?.guestCount ?? 0
          : 0),
      0,
    ),
  }
}
