import type { AdminGuestGroup } from '../types/admin'

function escapeCell(value: string | number | boolean | undefined) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

export function downloadGuestCsv(guestGroups: AdminGuestGroup[]) {
  const headers = [
    'Guest Group',
    'Invitation Email',
    'Invitation Phone',
    'Contact Name',
    'Email',
    'Phone',
    'Event',
    'Attending',
    'Guest Count',
    'Additional Names',
    'Response Updated',
  ]

  const rows = buildGuestCsvRows(guestGroups)

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(','))
    .join('\n')
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'wedding-rsvp-guests.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function buildGuestCsvRows(guestGroups: AdminGuestGroup[]) {
  return guestGroups.flatMap((group) =>
    group.eventIds.map((eventId) => {
      const response = group.responses[eventId]

      return [
        group.displayName,
        group.inviteEmail,
        group.invitePhone,
        group.contact?.guestName,
        group.contact?.email,
        group.contact?.phone,
        eventId,
        response ? (response.attending ? 'Yes' : 'No') : 'Pending',
        response?.attending ? response.guestCount : '',
        response?.additionalNames,
        response?.updatedAt,
      ]
    }),
  )
}
