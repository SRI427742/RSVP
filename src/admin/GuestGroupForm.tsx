import { FormEvent, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  validateNewInvitation,
  type NewInvitation,
  type NewInvitationErrors,
} from '../lib/adminInvitation'
import type { EventId } from '../types/rsvp'

interface GuestGroupFormProps {
  isSaving: boolean
  onCreate: (
    displayName: string,
    email: string,
    phone: string,
    eventIds: EventId[],
  ) => Promise<void>
}

const emptyInvitation = (): NewInvitation => ({
  displayName: '',
  email: '',
  phone: '',
  eventIds: [],
})

const eventOptions: Array<{ id: EventId; label: string }> = [
  { id: 'haldi', label: 'Haldi' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'vratham', label: 'Vratham' },
]

export function GuestGroupForm({
  isSaving,
  onCreate,
}: GuestGroupFormProps) {
  const [invitation, setInvitation] =
    useState<NewInvitation>(emptyInvitation)
  const [errors, setErrors] = useState<NewInvitationErrors>({})
  const [submitError, setSubmitError] = useState<string>()

  function updateField(
    field: 'displayName' | 'email' | 'phone',
    value: string,
  ) {
    setInvitation((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({
      ...current,
      [field === 'displayName' ? 'displayName' : 'contact']: undefined,
    }))
    setSubmitError(undefined)
  }

  function toggleEvent(eventId: EventId) {
    setInvitation((current) => ({
      ...current,
      eventIds: current.eventIds.includes(eventId)
        ? current.eventIds.filter((id) => id !== eventId)
        : [...current.eventIds, eventId],
    }))
    setErrors((current) => ({ ...current, events: undefined }))
    setSubmitError(undefined)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateNewInvitation(invitation)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      await onCreate(
        invitation.displayName.trim(),
        invitation.email.trim(),
        invitation.phone.trim(),
        invitation.eventIds,
      )
      setInvitation(emptyInvitation())
      setErrors({})
      setSubmitError(undefined)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'The invitation could not be created. Please try again.',
      )
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__heading">
        <div>
          <p className="eyebrow">New invitation</p>
          <h2>Add a guest group</h2>
          <p className="admin-panel__description">
            Add the person or family you will share this invitation with.
          </p>
        </div>
      </div>

      <form className="guest-group-form" onSubmit={submit} noValidate>
        <label
          className={`text-field${
            errors.displayName ? ' field--error' : ''
          }`}
        >
          <span>Guest or group name</span>
          <input
            type="text"
            autoComplete="name"
            value={invitation.displayName}
            onChange={(event) =>
              updateField('displayName', event.target.value)
            }
            placeholder="Example: Rao family"
            aria-invalid={Boolean(errors.displayName)}
          />
          {errors.displayName && (
            <small className="field-error" role="alert">
              {errors.displayName}
            </small>
          )}
        </label>

        <div
          className={`invitation-contact${
            errors.contact ? ' field--error' : ''
          }`}
        >
          <div className="field-heading">
            <span>Invitation contact</span>
            <small>Email or phone is required</small>
          </div>
          <label className="text-field">
            <span>Email</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={invitation.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="guest@example.com"
              aria-invalid={Boolean(errors.contact)}
            />
          </label>
          <label className="text-field">
            <span>Phone</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={invitation.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="(214) 555-0123"
              aria-invalid={Boolean(errors.contact)}
            />
          </label>
          {errors.contact && (
            <small className="field-error" role="alert">
              {errors.contact}
            </small>
          )}
        </div>

        <fieldset className={errors.events ? 'field--error' : ''}>
          <legend>Invite to</legend>
          <div className="event-checkboxes">
            {eventOptions.map((event) => (
              <label key={event.id}>
                <input
                  type="checkbox"
                  checked={invitation.eventIds.includes(event.id)}
                  onChange={() => toggleEvent(event.id)}
                />
                <span>{event.label}</span>
              </label>
            ))}
          </div>
          {errors.events && (
            <small className="field-error" role="alert">
              {errors.events}
            </small>
          )}
        </fieldset>

        <button className="primary-button" type="submit" disabled={isSaving}>
          <Plus size={18} />
          {isSaving ? 'Creating…' : 'Create invitation'}
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
