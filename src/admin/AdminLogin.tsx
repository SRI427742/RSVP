import { FormEvent, useState } from 'react'
import { Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'

const adminEmail = 'gollasriharsha19@gmail.com'

export function AdminLogin() {
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSending(true)
    setMessage(undefined)
    setError(undefined)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: adminEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    })

    if (authError?.code === 'over_email_send_rate_limit') {
      setError(
        'Supabase has reached its email limit. Please wait up to one hour before requesting another link.',
      )
    } else if (authError?.status === 429) {
      setError(
        'Please wait at least one minute before requesting another login link.',
      )
    } else if (authError) {
      setError(
        `The login link could not be sent. ${authError.message}`,
      )
    } else {
      setMessage(`A secure login link was sent to ${adminEmail}.`)
    }

    setIsSending(false)
  }

  return (
    <main className="admin-login">
      <div className="admin-login__card">
        <div className="footer__monogram" aria-hidden="true">
          N <span>&</span> S
        </div>
        <p className="eyebrow">Private host access</p>
        <h1>Wedding dashboard</h1>
        <p>
          Manage invitations and responses using a secure link sent to the
          administrator email.
        </p>
        <form onSubmit={sendMagicLink}>
          <div className="admin-login__email">
            <Mail size={18} strokeWidth={1.5} />
            <span>{adminEmail}</span>
          </div>
          <button className="primary-button" type="submit" disabled={isSending}>
            {isSending ? 'Sending link…' : 'Email secure login link'}
          </button>
        </form>
        {message && <p className="admin-notice">{message}</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
