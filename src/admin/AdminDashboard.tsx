import { Download, LogOut, RefreshCw } from 'lucide-react'
import { downloadGuestCsv } from '../lib/adminCsv'
import { supabase } from '../lib/supabase'
import type { AdminGuestGroup } from '../types/admin'
import type { EventId } from '../types/rsvp'
import { AdminMetrics } from './AdminMetrics'
import { GuestGroupForm } from './GuestGroupForm'
import { GuestGroupList } from './GuestGroupList'

interface AdminDashboardProps {
  guestGroups: AdminGuestGroup[]
  isRefreshing: boolean
  isCreating: boolean
  onRefresh: () => Promise<void>
  onCreate: (
    displayName: string,
    email: string,
    phone: string,
    eventIds: EventId[],
  ) => Promise<void>
  onDelete: (groupId: string) => Promise<void>
}

export function AdminDashboard({
  guestGroups,
  isRefreshing,
  isCreating,
  onRefresh,
  onCreate,
  onDelete,
}: AdminDashboardProps) {
  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Nikhitha & Sri Harsha</p>
          <h1>Guest dashboard</h1>
        </div>
        <div className="admin-header__actions">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => downloadGuestCsv(guestGroups)}
            disabled={guestGroups.length === 0}
          >
            <Download size={17} />
            Export CSV
          </button>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </header>

      <AdminMetrics guestGroups={guestGroups} />

      <div className="admin-content-grid">
        <GuestGroupForm isSaving={isCreating} onCreate={onCreate} />
        <GuestGroupList guestGroups={guestGroups} onDelete={onDelete} />
      </div>
    </main>
  )
}
