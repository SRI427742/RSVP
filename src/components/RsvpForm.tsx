import { FormEvent } from 'react'
import { Send } from 'lucide-react'
import type {
  EventId,
  RsvpErrors,
  RsvpResponse,
  WeddingEvent,
} from '../types/rsvp'
import { EventRsvp } from './EventRsvp'

interface RsvpFormProps {
  events: WeddingEvent[]
  response: RsvpResponse
  errors: RsvpErrors
  submitError?: string
  isSaving: boolean
  onContactChange: (
    field: 'guestName' | 'email' | 'phone',
    value: string,
  ) => void
  onEventChange: (
    eventId: EventId,
    update: Partial<RsvpResponse['events'][EventId]>,
  ) => void
  onSubmit: () => void
}

export function RsvpForm({
  events,
  response,
  errors,
  submitError,
  isSaving,
  onContactChange,
  onEventChange,
  onSubmit,
}: RsvpFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="rsvp-section section" id="rsvp">
      <div className="rsvp-intro">
        <p className="eyebrow">Kindly respond</p>
        <h2>RSVP</h2>
        <p>
          Please let us know which celebrations you can attend. You can return
          to this invitation and update your response at any time.
        </p>
      </div>

      <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
        <div className="contact-fields">
          <label
            className={`text-field${errors.guestName ? ' field--error' : ''}`}
          >
            <span>Your name</span>
            <input
              type="text"
              autoComplete="name"
              value={response.guestName}
              onChange={(event) =>
                onContactChange('guestName', event.target.value)
              }
              aria-invalid={Boolean(errors.guestName)}
              aria-describedby={errors.guestName ? 'name-error' : undefined}
            />
            {errors.guestName && (
              <small className="field-error" id="name-error" role="alert">
                {errors.guestName}
              </small>
            )}
          </label>

          <div
            className={`contact-pair${errors.contact ? ' field--error' : ''}`}
          >
            <p>
              How may we reach you? <small>One is required</small>
            </p>
            <div>
              <label className="text-field">
                <span>Email</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={response.email}
                  onChange={(event) =>
                    onContactChange('email', event.target.value)
                  }
                  aria-invalid={Boolean(errors.contact)}
                />
              </label>
              <span className="contact-pair__or">or</span>
              <label className="text-field">
                <span>Phone</span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={response.phone}
                  onChange={(event) =>
                    onContactChange('phone', event.target.value)
                  }
                  aria-invalid={Boolean(errors.contact)}
                />
              </label>
            </div>
            {errors.contact && (
              <small className="field-error" role="alert">
                {errors.contact}
              </small>
            )}
          </div>
        </div>

        <div className="event-responses">
          {events.map((event) => (
            <EventRsvp
              key={event.id}
              event={event}
              response={response.events[event.id]}
              error={errors[event.id]}
              onChange={(update) => onEventChange(event.id, update)}
            />
          ))}
        </div>

        <button className="primary-button" type="submit" disabled={isSaving}>
          <span>{isSaving ? 'Saving response…' : 'Send RSVP'}</span>
          <Send size={18} strokeWidth={1.5} />
        </button>
        {submitError && (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        )}
      </form>
    </section>
  )
}
