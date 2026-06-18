import type { WeddingEvent } from '../types/rsvp'

const eventDays: Record<WeddingEvent['id'], number> = {
  haldi: 27,
  wedding: 28,
  vratham: 29,
}

function formatDays(days: number[]) {
  if (days.length === 1) {
    return `August ${days[0]}, 2026`
  }

  if (days.length === 2) {
    return `August ${days[0]} & ${days[1]}, 2026`
  }

  return `August ${days[0]}–${days[days.length - 1]}, 2026`
}

export function getInvitationSummary(events: WeddingEvent[]) {
  const days = events.map((event) => eventDays[event.id]).sort((a, b) => a - b)
  const cities = [...new Set(events.map((event) => event.city))]
  const location = cities.length === 1 ? `${cities[0]}, Texas` : 'Dallas, Texas'

  return `${formatDays(days)} · ${location}`
}
