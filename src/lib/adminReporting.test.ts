import { describe, expect, it } from 'vitest'
import { adminPreviewGroups } from '../admin/adminPreviewData'
import { buildGuestCsvRows } from './adminCsv'
import { getEventMetrics, getResponseCount } from './adminMetrics'

describe('admin dashboard reporting', () => {
  it('counts responded groups once', () => {
    expect(getResponseCount(adminPreviewGroups)).toBe(2)
  })

  it('counts attendance independently for each event', () => {
    expect(getEventMetrics(adminPreviewGroups, 'haldi')).toEqual({
      invitedGroups: 2,
      attendingGuests: 4,
    })
    expect(getEventMetrics(adminPreviewGroups, 'wedding')).toEqual({
      invitedGroups: 3,
      attendingGuests: 6,
    })
    expect(getEventMetrics(adminPreviewGroups, 'vratham')).toEqual({
      invitedGroups: 1,
      attendingGuests: 0,
    })
  })

  it('does not combine one family across multiple events', () => {
    const rao = adminPreviewGroups[0]

    expect(rao.responses.haldi?.guestCount).toBe(4)
    expect(rao.responses.wedding?.guestCount).toBe(4)
  })

  it('exports invitation and RSVP contacts separately', () => {
    const rows = buildGuestCsvRows([adminPreviewGroups[0]])

    expect(rows[0].slice(0, 5)).toEqual([
      'Rao family',
      'rao@example.com',
      '(214) 555-0101',
      'Anita Rao',
      'anita@example.com',
    ])
  })

  it('creates one export row per invited event', () => {
    expect(buildGuestCsvRows(adminPreviewGroups)).toHaveLength(6)
  })
})
