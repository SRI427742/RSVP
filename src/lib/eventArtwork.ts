import type { WeddingEvent } from '../types/rsvp'

const artworkByEventId: Partial<Record<WeddingEvent['id'], string>> = {
  haldi: '/images/haldi-portrait.png',
  wedding: '/images/wedding-portrait.png',
  vratham: '/images/vratham-portrait.png',
}

export function getEventArtwork(event: WeddingEvent) {
  return artworkByEventId[event.id]
}
