import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'
import ScannerPage from '@/pages/ScannerPage'
import ResultPage from '@/pages/ResultPage'
import HistoryPage from '@/pages/HistoryPage'
import ScanDetailPage from '@/pages/ScanDetailPage'
import AuthPage from '@/pages/AuthPage'
import ProfilePage from '@/pages/ProfilePage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import TermsPage from '@/pages/TermsPage'

function AppContent() {
  useAuth()

  return (
    <>
      <Routes>
        <Route path="/" element={<ScannerPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<ScanDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
      <AuthModal />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
