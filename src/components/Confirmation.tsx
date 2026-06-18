import { Check, Pencil } from 'lucide-react'
import type { RsvpResponse, WeddingEvent } from '../types/rsvp'

interface ConfirmationProps {
  events: WeddingEvent[]
  response: RsvpResponse
  onEdit: () => void
}

export function Confirmation({
  events,
  response,
  onEdit,
}: ConfirmationProps) {
  const attending = events.filter(
    (event) => response.events[event.id].attending === 'yes',
  )

  return (
    <section className="confirmation section" id="rsvp" aria-live="polite">
      <div className="confirmation__mark" aria-hidden="true">
        <Check size={28} strokeWidth={1.5} />
      </div>
      <p className="eyebrow">Response received</p>
      <h2>Thank you, {response.guestName}.</h2>
      {attending.length > 0 ? (
        <>
          <p>We look forward to celebrating with you.</p>
          <div className="confirmation__events">
            {attending.map((event) => (
              <div key={event.id}>
                <span>{event.name}</span>
                <strong>
                  {response.events[event.id].guestCount}{' '}
                  {response.events[event.id].guestCount === 1
                    ? 'guest'
                    : 'guests'}
                </strong>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>
          We will miss celebrating with you, and we appreciate your response.
        </p>
      )}
      <button className="secondary-button" type="button" onClick={onEdit}>
        <Pencil size={16} strokeWidth={1.5} />
        Edit response
      </button>
    </section>
  )
}
