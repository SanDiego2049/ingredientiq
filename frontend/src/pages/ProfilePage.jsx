import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/services/authService'

function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { loading } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error(err)
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100">
        <button
          onClick={() => navigate('/')}
          aria-label="Go back"
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-bold text-gray-800 text-lg">Profile</h1>
      </div>

      <div className="flex flex-col gap-4 px-4 py-6 max-w-lg mx-auto w-full">
        {/* User info */}
        <div className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
            <User size={24} className="text-green-600" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">
              {user?.user_metadata?.full_name ?? 'User'}
            </span>
            <span className="text-sm text-gray-400">{user?.email}</span>
          </div>
        </div>

        {/* Sign out */}
        <Button
          variant="danger"
          onClick={handleSignOut}
          disabled={signingOut}
          fullWidth
        >
          <LogOut size={16} className="mr-2" aria-hidden="true" />
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  )
}

export default ProfilePage
