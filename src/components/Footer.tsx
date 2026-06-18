import { getInvitationSummary } from '../lib/invitationSummary'
import type { WeddingEvent } from '../types/rsvp'

interface FooterProps {
  events: WeddingEvent[]
}

export function Footer({ events }: FooterProps) {
  return (
    <footer>
      <div className="footer__monogram" aria-hidden="true">
        N <span>&</span> S
      </div>
      <p>{getInvitationSummary(events)}</p>
    </footer>
  )
}
