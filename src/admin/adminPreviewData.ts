import type { AdminGuestGroup } from '../types/admin'

export const adminPreviewGroups: AdminGuestGroup[] = [
  {
    id: 'preview-1',
    displayName: 'Rao family',
    token: 'preview-rao',
    inviteEmail: 'rao@example.com',
    invitePhone: '(214) 555-0101',
    eventIds: ['haldi', 'wedding', 'vratham'],
    createdAt: '2026-06-15T12:00:00Z',
    contact: {
      guestName: 'Anita Rao',
      email: 'anita@example.com',
      phone: '',
      updatedAt: '2026-06-15T13:00:00Z',
    },
    responses: {
      haldi: {
        attending: true,
        guestCount: 4,
        additionalNames: 'Vijay, Maya, Arjun',
        updatedAt: '2026-06-15T13:00:00Z',
      },
      wedding: {
        attending: true,
        guestCount: 4,
        additionalNames: 'Vijay, Maya, Arjun',
        updatedAt: '2026-06-15T13:00:00Z',
      },
      vratham: {
        attending: false,
        guestCount: 1,
        additionalNames: '',
        updatedAt: '2026-06-15T13:00:00Z',
      },
    },
  },
  {
    id: 'preview-2',
    displayName: 'Kumar family',
    token: 'preview-kumar',
    inviteEmail: '',
    invitePhone: '(469) 555-0102',
    eventIds: ['wedding'],
    createdAt: '2026-06-15T11:00:00Z',
    contact: null,
    responses: {},
  },
  {
    id: 'preview-3',
    displayName: 'Meera & Karthik',
    token: 'preview-meera',
    inviteEmail: 'meera@example.com',
    invitePhone: '',
    eventIds: ['haldi', 'wedding'],
    createdAt: '2026-06-15T10:00:00Z',
    contact: {
      guestName: 'Meera',
      email: '',
      phone: '(972) 555-0103',
      updatedAt: '2026-06-15T14:00:00Z',
    },
    responses: {
      haldi: {
        attending: false,
        guestCount: 1,
        additionalNames: '',
        updatedAt: '2026-06-15T14:00:00Z',
      },
      wedding: {
        attending: true,
        guestCount: 2,
        additionalNames: 'Karthik',
        updatedAt: '2026-06-15T14:00:00Z',
      },
    },
  },
]
