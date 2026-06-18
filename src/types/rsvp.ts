export type EventId = 'haldi' | 'wedding' | 'vratham'

export type Attendance = 'yes' | 'no' | null

export interface WeddingEvent {
  id: EventId
  name: string
  date: string
  time: string
  venue: string
  address: string
  city: string
  tone: 'saffron' | 'green' | 'rose'
}

export interface EventResponse {
  attending: Attendance
  guestCount: number
  additionalNames: string
}

export interface RsvpResponse {
  guestName: string
  email: string
  phone: string
  events: Record<EventId, EventResponse>
  submittedAt?: string
}

export interface Invitation {
  token: string
  eventIds: EventId[]
}

export type RsvpErrors = Partial<
  Record<
    'guestName' | 'contact' | EventId,
    string
  >
>
