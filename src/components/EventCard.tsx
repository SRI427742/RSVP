import { CalendarDays, Clock3, MapPin } from 'lucide-react'
import { getEventArtwork } from '../lib/eventArtwork'
import type { WeddingEvent } from '../types/rsvp'

interface EventCardProps {
  event: WeddingEvent
  index: number
}

export function EventCard({ event, index }: EventCardProps) {
  const artwork = getEventArtwork(event)
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venue}, ${event.address}`,
  )}`

  return (
    <article
      className={`event-card event-card--${event.tone} event-card--${event.id}`}
    >
      <div className="event-card__media">
        {artwork ? (
          <img
            src={artwork}
            alt={`${event.name} portrait of Nikhitha and Sri Harsha`}
          />
        ) : (
          <div className="event-card__placeholder" aria-hidden="true">
            <span>{event.name}</span>
          </div>
        )}
      </div>
      <div className="event-card__body">
        <div className="event-card__number" aria-hidden="true">
          0{index + 1}
        </div>
        <div className="event-card__ornament" aria-hidden="true" />
        <h3>{event.name}</h3>
        <dl>
          <div>
            <dt>
              <CalendarDays size={18} strokeWidth={1.5} />
              <span className="sr-only">Date</span>
            </dt>
            <dd>{event.date}</dd>
          </div>
          <div>
            <dt>
              <Clock3 size={18} strokeWidth={1.5} />
              <span className="sr-only">Time</span>
            </dt>
            <dd>{event.time}</dd>
          </div>
          <div>
            <dt>
              <MapPin size={18} strokeWidth={1.5} />
              <span className="sr-only">Location</span>
            </dt>
            <dd>
              <strong>{event.venue}</strong>
              <span>{event.address}</span>
            </dd>
          </div>
        </dl>
        <a href={mapUrl} target="_blank" rel="noreferrer">
          View map
        </a>
      </div>
    </article>
  )
}
