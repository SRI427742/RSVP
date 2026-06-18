export function InvitationUnavailable() {
  return (
    <main className="invitation-unavailable">
      <div className="footer__monogram" aria-hidden="true">
        N <span>&</span> S
      </div>
      <h1>Invitation unavailable</h1>
      <p>
        This invitation link is not valid. Please use the original link that
        was shared with you.
      </p>
    </main>
  )
}
