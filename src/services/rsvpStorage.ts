import { supabase } from '../lib/supabase'
import { createEmptyResponse } from '../lib/rsvp'
import type {
  EventId,
  Invitation,
  RsvpResponse,
} from '../types/rsvp'

interface InvitationPayload {
  token: string
  eventIds: EventId[]
  response: RsvpResponse | null
}

export interface LoadedInvitation {
  invitation: Invitation
  response: RsvpResponse | null
}

export interface RsvpRepository {
  load(invitation: Invitation): Promise<LoadedInvitation | null>
  save(token: string, response: RsvpResponse): Promise<RsvpResponse>
}

function isPreviewToken(token: string) {
  return token === 'preview' || token.includes('review')
}

function mergeResponse(response: RsvpResponse): RsvpResponse {
  const empty = createEmptyResponse()

  return {
    ...empty,
    ...response,
    events: {
      ...empty.events,
      ...response.events,
    },
  }
}

class LocalRsvpRepository implements RsvpRepository {
  private key(token: string) {
    return `wedding-rsvp:${token}`
  }

  async load(invitation: Invitation): Promise<LoadedInvitation> {
    const stored = window.localStorage.getItem(this.key(invitation.token))
    let response: RsvpResponse | null = null

    if (stored) {
      try {
        response = mergeResponse(JSON.parse(stored) as RsvpResponse)
      } catch {
        window.localStorage.removeItem(this.key(invitation.token))
      }
    }

    return { invitation, response }
  }

  async save(token: string, response: RsvpResponse): Promise<RsvpResponse> {
    const saved = {
      ...response,
      submittedAt: new Date().toISOString(),
    }

    window.localStorage.setItem(this.key(token), JSON.stringify(saved))
    return saved
  }
}

class SupabaseRsvpRepository implements RsvpRepository {
  async load(invitation: Invitation): Promise<LoadedInvitation | null> {
    const { data, error } = await supabase.rpc('get_invitation', {
      p_token: invitation.token,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return null
    }

    const payload = data as InvitationPayload

    return {
      invitation: {
        token: payload.token,
        eventIds: payload.eventIds,
      },
      response: payload.response
        ? mergeResponse(payload.response)
        : null,
    }
  }

  async save(token: string, response: RsvpResponse): Promise<RsvpResponse> {
    const responses = Object.fromEntries(
      Object.entries(response.events).filter(
        ([, eventResponse]) => eventResponse.attending !== null,
      ),
    )

    const { data, error } = await supabase.rpc('save_rsvp', {
      p_token: token,
      p_guest_name: response.guestName,
      p_email: response.email,
      p_phone: response.phone,
      p_responses: responses,
    })

    if (error) {
      throw new Error(error.message)
    }

    return mergeResponse(data as RsvpResponse)
  }
}

const localRepository = new LocalRsvpRepository()
const remoteRepository = new SupabaseRsvpRepository()

export const rsvpRepository: RsvpRepository = {
  load(invitation) {
    return isPreviewToken(invitation.token)
      ? localRepository.load(invitation)
      : remoteRepository.load(invitation)
  },
  save(token, response) {
    return isPreviewToken(token)
      ? localRepository.save(token, response)
      : remoteRepository.save(token, response)
  },
}
