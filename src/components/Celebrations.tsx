import type { WeddingEvent } from '../types/rsvp'
import {
  getCelebrationHeading,
  getCelebrationMessage,
} from '../lib/invitationCopy'
import { EventCard } from './EventCard'

interface CelebrationsProps {
  events: WeddingEvent[]
}

export function Celebrations({ events }: CelebrationsProps) {
  return (
    <section className="celebrations section" id="celebrations">
      <div className="section-heading">
        <p className="eyebrow">You are invited</p>
        <h2>{getCelebrationHeading(events)}</h2>
        <p>{getCelebrationMessage(events)}</p>
      </div>

      <div className="event-grid">
        {events.map((event, index) => (
          <EventCard event={event} index={index} key={event.id} />
        ))}
      </div>
    </section>
  )
}
