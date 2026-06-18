import { useMemo, useState } from 'react'
import {
  Check,
  Copy,
  Mail,
  MessageSquareText,
  Search,
  Trash2,
} from 'lucide-react'
import { buildInvitationMessage } from '../lib/adminInvitation'
import { getInvitationUrl } from '../services/adminService'
import type { AdminGuestGroup } from '../types/admin'

interface GuestGroupListProps {
  guestGroups: AdminGuestGroup[]
  onDelete: (groupId: string) => Promise<void>
}

export function GuestGroupList({
  guestGroups,
  onDelete,
}: GuestGroupListProps) {
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string>()
  const [deletingId, setDeletingId] = useState<string>()

  const visibleGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return guestGroups
    }

    return guestGroups.filter((group) =>
      [
        group.displayName,
        group.inviteEmail,
        group.invitePhone,
        group.contact?.guestName,
        group.contact?.email,
        group.contact?.phone,
      ].some((value) => value?.toLowerCase().includes(normalized)),
    )
  }, [guestGroups, query])

  async function copyLink(group: AdminGuestGroup) {
    await navigator.clipboard.writeText(getInvitationUrl(group.token))
    setCopiedId(group.id)
    window.setTimeout(() => setCopiedId(undefined), 1800)
  }

  function emailInvitation(group: AdminGuestGroup) {
    const invitationUrl = getInvitationUrl(group.token)
    const subject = 'Nikhitha & Sri Harsha Wedding Invitation'
    const body = buildInvitationMessage(group.displayName, invitationUrl)
    window.location.href = `mailto:${encodeURIComponent(
      group.inviteEmail,
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  function textInvitation(group: AdminGuestGroup) {
    const invitationUrl = getInvitationUrl(group.token)
    const body = buildInvitationMessage(group.displayName, invitationUrl)
    window.location.href = `sms:${group.invitePhone}?&body=${encodeURIComponent(
      body,
    )}`
  }

  async function deleteGroup(group: AdminGuestGroup) {
    const confirmed = window.confirm(
      `Delete the invitation for ${group.displayName}?`,
    )
    if (!confirmed) {
      return
    }

    setDeletingId(group.id)
    try {
      await onDelete(group.id)
    } finally {
      setDeletingId(undefined)
    }
  }

  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__heading admin-panel__heading--row">
        <div>
          <p className="eyebrow">Invitation list</p>
          <h2>Guest groups</h2>
        </div>
        <label className="admin-search">
          <Search size={17} strokeWidth={1.5} />
          <span className="sr-only">Search guest groups</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search guests"
          />
        </label>
      </div>

      {visibleGroups.length === 0 ? (
        <p className="admin-empty">
          {guestGroups.length === 0
            ? 'Create your first invitation to begin.'
            : 'No guest groups match this search.'}
        </p>
      ) : (
        <div className="guest-table-wrap">
          <table className="guest-table">
            <thead>
              <tr>
                <th>Guest group</th>
                <th>Events</th>
                <th>Status</th>
                <th>Attendance</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleGroups.map((group) => {
                return (
                  <tr key={group.id}>
                    <td data-label="Guest group">
                      <strong>{group.displayName}</strong>
                      <small>
                        {[group.inviteEmail, group.invitePhone]
                          .filter(Boolean)
                          .join(' · ')}
                      </small>
                      {group.contact && (
                        <small className="response-contact">
                          RSVP: {group.contact.email || group.contact.phone}
                        </small>
                      )}
                    </td>
                    <td data-label="Events">
                      <div className="event-tags">
                        {group.eventIds.map((eventId) => (
                          <span key={eventId}>{eventId}</span>
                        ))}
                      </div>
                    </td>
                    <td data-label="Status">
                      <span
                        className={`status-pill ${
                          group.contact
                            ? 'status-pill--responded'
                            : 'status-pill--pending'
                        }`}
                      >
                        {group.contact ? 'Responded' : 'Pending'}
                      </span>
                    </td>
                    <td data-label="Attendance">
                      {group.contact ? (
                        <div className="attendance-summary">
                          {group.eventIds.map((eventId) => {
                            const response = group.responses[eventId]
                            return (
                              <span key={eventId}>
                                {eventId.slice(0, 1).toUpperCase()}:{' '}
                                {response?.attending
                                  ? response.guestCount
                                  : response
                                    ? 'No'
                                    : '—'}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td data-label="Actions">
                      <div className="table-actions">
                        {group.inviteEmail && (
                          <button
                            type="button"
                            onClick={() => emailInvitation(group)}
                            aria-label={`Email invitation to ${group.displayName}`}
                          >
                            <Mail size={17} />
                          </button>
                        )}
                        {group.invitePhone && (
                          <button
                            type="button"
                            onClick={() => textInvitation(group)}
                            aria-label={`Text invitation to ${group.displayName}`}
                          >
                            <MessageSquareText size={17} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => copyLink(group)}
                          aria-label={`Copy invitation link for ${group.displayName}`}
                        >
                          {copiedId === group.id ? (
                            <Check size={17} />
                          ) : (
                            <Copy size={17} />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === group.id}
                          onClick={() => deleteGroup(group)}
                          aria-label={`Delete invitation for ${group.displayName}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
