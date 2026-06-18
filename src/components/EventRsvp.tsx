import { Minus, Plus } from 'lucide-react'
import type {
  EventResponse,
  WeddingEvent,
} from '../types/rsvp'

interface EventRsvpProps {
  event: WeddingEvent
  response: EventResponse
  error?: string
  onChange: (update: Partial<EventResponse>) => void
}

export function EventRsvp({
  event,
  response,
  error,
  onChange,
}: EventRsvpProps) {
  const errorId = `${event.id}-error`

  return (
    <fieldset
      className={`event-rsvp${error ? ' field--error' : ''}`}
      aria-describedby={error ? errorId : undefined}
    >
      <legend>
        Will you join us for the <strong>{event.name}</strong>?
      </legend>

      <div className="attendance-options">
        <label>
          <input
            type="radio"
            name={`${event.id}-attendance`}
            checked={response.attending === 'yes'}
            onChange={() => onChange({ attending: 'yes' })}
          />
          <span>Joyfully accepts</span>
        </label>
        <label>
          <input
            type="radio"
            name={`${event.id}-attendance`}
            checked={response.attending === 'no'}
            onChange={() => onChange({ attending: 'no', guestCount: 1 })}
          />
          <span>Regretfully declines</span>
        </label>
      </div>

      {response.attending === 'yes' && (
        <div className="event-rsvp__details">
          <div className="count-field">
            <span id={`${event.id}-count-label`}>Number attending</span>
            <div
              className="stepper"
              role="group"
              aria-labelledby={`${event.id}-count-label`}
            >
              <button
                type="button"
                aria-label="Decrease number attending"
                disabled={response.guestCount <= 1}
                onClick={() =>
                  onChange({
                    guestCount: Math.max(1, response.guestCount - 1),
                  })
                }
              >
                <Minus size={16} />
              </button>
              <output aria-live="polite">{response.guestCount}</output>
              <button
                type="button"
                aria-label="Increase number attending"
                onClick={() =>
                  onChange({ guestCount: response.guestCount + 1 })
                }
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <label className="text-field">
            <span>
              Additional guest names <small>Optional</small>
            </span>
            <input
              type="text"
              value={response.additionalNames}
              onChange={(event) =>
                onChange({ additionalNames: event.target.value })
              }
              placeholder="Names, separated by commas"
            />
          </label>
        </div>
      )}

      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
