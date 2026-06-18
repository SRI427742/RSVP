import { ArrowDown, Heart } from 'lucide-react'
import { getInvitationSummary } from '../lib/invitationSummary'
import type { WeddingEvent } from '../types/rsvp'

interface HeroProps {
  events: WeddingEvent[]
}

export function Hero({ events }: HeroProps) {
  return (
    <header className="hero">
      <div className="hero__pattern" aria-hidden="true" />
      <div className="hero__aura" aria-hidden="true" />

      <div className="hero__panel">
        <div className="hero__content">
          <p className="hero__monogram" aria-label="Nikhitha and Sri Harsha">
            <Heart
              className="hero__monogram-heart"
              size={92}
              strokeWidth={1.2}
              aria-hidden="true"
            />
            <span>N & S</span>
          </p>
          <p className="eyebrow">Together with our families</p>
          <h1>
            <span>Nikhitha</span>
            <span className="hero__ampersand">Weds</span>
            <span>Sri Harsha</span>
          </h1>
          <p className="hero__message">
            With the blessings of our families, we invite you to celebrate our
            wedding.
          </p>
          <p className="hero__date">
            <span>{getInvitationSummary(events)}</span>
          </p>
          <a className="hero__cta" href="#rsvp">
            RSVP
          </a>
        </div>
      </div>

      <a className="hero__scroll" href="#celebrations" aria-label="View events">
        <span>Discover</span>
        <ArrowDown size={18} strokeWidth={1.5} />
      </a>
    </header>
  )
}
