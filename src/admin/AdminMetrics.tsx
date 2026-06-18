import type { AdminGuestGroup } from '../types/admin'
import type { EventId } from '../types/rsvp'
import { getEventMetrics, getResponseCount } from '../lib/adminMetrics'

interface AdminMetricsProps {
  guestGroups: AdminGuestGroup[]
}

const events: Array<{ id: EventId; name: string }> = [
  { id: 'haldi', name: 'Haldi' },
  { id: 'wedding', name: 'Wedding' },
  { id: 'vratham', name: 'Vratham' },
]

export function AdminMetrics({ guestGroups }: AdminMetricsProps) {
  const responded = getResponseCount(guestGroups)

  return (
    <section className="admin-metrics" aria-label="RSVP summary">
      <article>
        <span>Guest groups</span>
        <strong>{guestGroups.length}</strong>
        <small>{responded} responded</small>
      </article>
      {events.map((event) => {
        const { invitedGroups, attendingGuests } = getEventMetrics(
          guestGroups,
          event.id,
        )

        return (
          <article key={event.id}>
            <span>{event.name}</span>
            <strong>{attendingGuests}</strong>
            <small>
              {invitedGroups}{' '}
              {invitedGroups === 1 ? 'group' : 'groups'} invited
            </small>
          </article>
        )
      })}
    </section>
  )
}
