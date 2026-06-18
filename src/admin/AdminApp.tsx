import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import {
  createGuestGroup,
  deleteGuestGroup,
  loadAdminDashboard,
} from '../services/adminService'
import type { AdminGuestGroup } from '../types/admin'
import type { EventId } from '../types/rsvp'
import { AdminDashboard } from './AdminDashboard'
import { AdminLogin } from './AdminLogin'
import { adminPreviewGroups } from './adminPreviewData'

export function AdminApp() {
  const isPreview =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has('preview')
  const [session, setSession] = useState<Session | null>(null)
  const [guestGroups, setGuestGroups] = useState<AdminGuestGroup[]>(
    isPreview ? adminPreviewGroups : [],
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [accessError, setAccessError] = useState<string>()

  useEffect(() => {
    if (isPreview) {
      setIsLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [isPreview])

  const refreshDashboard = useCallback(async () => {
    if (isPreview) {
      return
    }

    setIsRefreshing(true)
    setAccessError(undefined)

    try {
      const dashboard = await loadAdminDashboard()
      setGuestGroups(dashboard.guestGroups)
    } catch {
      setAccessError(
        'This account is not authorized, or the admin database setup is incomplete.',
      )
    } finally {
      setIsRefreshing(false)
    }
  }, [isPreview])

  useEffect(() => {
    if (isPreview) {
      return
    }

    if (!session) {
      setGuestGroups([])
      return
    }

    refreshDashboard()
  }, [isPreview, refreshDashboard, session])

  async function addGuestGroup(
    displayName: string,
    email: string,
    phone: string,
    eventIds: EventId[],
  ) {
    setIsCreating(true)
    try {
      if (isPreview) {
        const created: AdminGuestGroup = {
          id: crypto.randomUUID(),
          displayName,
          token: `preview-${Date.now()}`,
          inviteEmail: email,
          invitePhone: phone,
          eventIds,
          createdAt: new Date().toISOString(),
          contact: null,
          responses: {},
        }
        setGuestGroups((current) => [created, ...current])
        return
      }

      const created = await createGuestGroup(
        displayName,
        email,
        phone,
        eventIds,
      )
      setGuestGroups((current) => [created, ...current])
    } finally {
      setIsCreating(false)
    }
  }

  async function removeGuestGroup(groupId: string) {
    if (!isPreview) {
      await deleteGuestGroup(groupId)
    }
    setGuestGroups((current) =>
      current.filter((group) => group.id !== groupId),
    )
  }

  if (isLoading) {
    return (
      <main className="loading-screen">
        <div className="loading-screen__monogram">N & S</div>
        <span>Opening the dashboard</span>
      </main>
    )
  }

  if (!session && !isPreview) {
    return <AdminLogin />
  }

  if (accessError) {
    return (
      <main className="admin-access-error">
        <h1>Dashboard unavailable</h1>
        <p>{accessError}</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </button>
      </main>
    )
  }

  return (
    <AdminDashboard
      guestGroups={guestGroups}
      isRefreshing={isRefreshing}
      isCreating={isCreating}
      onRefresh={refreshDashboard}
      onCreate={addGuestGroup}
      onDelete={removeGuestGroup}
    />
  )
}
