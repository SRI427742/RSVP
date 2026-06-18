import type { EventId } from './rsvp'

export interface AdminContact {
  guestName: string
  email: string
  phone: string
  updatedAt: string
}

export interface AdminEventResponse {
  attending: boolean
  guestCount: number
  additionalNames: string
  updatedAt: string
}

export interface AdminGuestGroup {
  id: string
  displayName: string
  token: string
  inviteEmail: string
  invitePhone: string
  eventIds: EventId[]
  createdAt: string
  contact: AdminContact | null
  responses: Partial<Record<EventId, AdminEventResponse>>
}

export interface AdminDashboardData {
  guestGroups: AdminGuestGroup[]
}
