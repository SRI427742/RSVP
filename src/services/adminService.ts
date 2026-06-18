import { supabase } from '../lib/supabase'
import type {
  AdminDashboardData,
  AdminGuestGroup,
} from '../types/admin'
import type { EventId } from '../types/rsvp'

export async function loadAdminDashboard(): Promise<AdminDashboardData> {
  const { data, error } = await supabase.rpc('get_admin_dashboard')

  if (error) {
    if (
      error.code === 'PGRST202' &&
      error.message.includes('create_guest_group')
    ) {
      throw new Error(
        'The invitation contact database update has not been installed.',
      )
    }

    throw new Error(error.message)
  }

  return data as AdminDashboardData
}

export async function createGuestGroup(
  displayName: string,
  email: string,
  phone: string,
  eventIds: EventId[],
): Promise<AdminGuestGroup> {
  const { data, error } = await supabase.rpc('create_guest_group', {
    p_display_name: displayName,
    p_invite_email: email,
    p_invite_phone: phone,
    p_event_ids: eventIds,
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    ...(data as AdminGuestGroup),
    contact: null,
    responses: {},
  }
}

export async function deleteGuestGroup(groupId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_guest_group', {
    p_group_id: groupId,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export function getInvitationUrl(token: string) {
  return `${window.location.origin}/?invite=${token}`
}
