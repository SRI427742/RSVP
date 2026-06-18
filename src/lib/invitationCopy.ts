import type { WeddingEvent } from '../types/rsvp'

function joinEventNames(events: WeddingEvent[]) {
  const names = events.map((event) => event.name)

  if (names.length === 1) {
    return names[0]
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`
  }

  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

export function getHeroMessage(events: WeddingEvent[]) {
  return `With joyful hearts, we invite you to join us for the ${joinEventNames(events)}.`
}

export function getCelebrationHeading(events: WeddingEvent[]) {
  return events.length === 1 ? events[0].name : joinEventNames(events)
}

export function getCelebrationMessage(events: WeddingEvent[]) {
  if (events.length === 1) {
    return `We would be delighted to have you with us for this special occasion.`
  }

  return `We would be delighted to have you with us for these special occasions.`
}
