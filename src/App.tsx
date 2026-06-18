import { useEffect, useMemo, useState } from 'react'
import { Celebrations } from './components/Celebrations'
import { Confirmation } from './components/Confirmation'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { InvitationUnavailable } from './components/InvitationUnavailable'
import { RsvpForm } from './components/RsvpForm'
import { getInvitation } from './config/invitation'
import { weddingEvents } from './data/events'
import {
  createEmptyResponse,
  updateEventResponse,
  validateResponse,
} from './lib/rsvp'
import { rsvpRepository } from './services/rsvpStorage'
import type {
  EventId,
  Invitation,
  RsvpErrors,
  RsvpResponse,
} from './types/rsvp'

const initialInvitation = getInvitation()

export default function App() {
  const [invitation, setInvitation] =
    useState<Invitation>(initialInvitation)
  const [response, setResponse] = useState<RsvpResponse>(createEmptyResponse)
  const [errors, setErrors] = useState<RsvpErrors>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [submitError, setSubmitError] = useState<string>()

  const visibleEvents = useMemo(
    () =>
      weddingEvents.filter((event) => invitation.eventIds.includes(event.id)),
    [invitation.eventIds],
  )

  useEffect(() => {
    rsvpRepository
      .load(initialInvitation)
      .then((loaded) => {
        if (!loaded) {
          setIsUnavailable(true)
          return
        }

        setInvitation(loaded.invitation)
        if (loaded.response) {
          setResponse(loaded.response)
        }
      })
      .catch(() => setIsUnavailable(true))
      .finally(() => setIsLoading(false))
  }, [])

  function updateContact(
    field: 'guestName' | 'email' | 'phone',
    value: string,
  ) {
    setResponse((current) => ({ ...current, [field]: value }))
    setSubmitError(undefined)
    setErrors((current) => ({
      ...current,
      [field === 'guestName' ? 'guestName' : 'contact']: undefined,
    }))
  }

  function updateEvent(
    eventId: EventId,
    update: Partial<RsvpResponse['events'][EventId]>,
  ) {
    setResponse((current) => updateEventResponse(current, eventId, update))
    setSubmitError(undefined)
    setErrors((current) => ({ ...current, [eventId]: undefined }))
  }

  async function submitResponse() {
    const nextErrors = validateResponse(response, invitation)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>('.field--error')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }

    setIsSaving(true)
    setSubmitError(undefined)

    try {
      const saved = await rsvpRepository.save(invitation.token, response)
      setResponse(saved)
      setErrors({})
      setIsEditing(false)
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>('#rsvp')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch {
      setSubmitError(
        'We could not save your response. Please try again in a moment.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="loading-screen">
        <div className="loading-screen__monogram">N & S</div>
        <span>Preparing your invitation</span>
      </main>
    )
  }

  if (isUnavailable) {
    return <InvitationUnavailable />
  }

  const hasSavedResponse = Boolean(response.submittedAt)

  return (
    <>
      <Hero events={visibleEvents} />
      <main>
        <Celebrations events={visibleEvents} />
        {hasSavedResponse && !isEditing ? (
          <Confirmation
            events={visibleEvents}
            response={response}
            onEdit={() => setIsEditing(true)}
          />
        ) : (
          <RsvpForm
            events={visibleEvents}
            response={response}
            errors={errors}
            submitError={submitError}
            isSaving={isSaving}
            onContactChange={updateContact}
            onEventChange={updateEvent}
            onSubmit={submitResponse}
          />
        )}
      </main>
      <Footer events={visibleEvents} />
    </>
  )
}
