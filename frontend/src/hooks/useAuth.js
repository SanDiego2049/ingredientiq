import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, session, loading, setUser, setSession, setLoading, clearAuth } =
    useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  return { user, session, loading, clearAuth }
}
