import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, User } from 'lucide-react'
import CameraViewfinder from '@/components/scanner/CameraViewfinder'
import TextReviewDrawer from '@/components/scanner/TextReviewDrawer'
import OcrProgressBar from '@/components/scanner/OcrProgressBar'
import ManualEntryFallback from '@/components/scanner/ManualEntryFallback'
import Spinner from '@/components/ui/Spinner'
import { useOCR } from '@/hooks/useOCR'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useRepeatDetection } from '@/hooks/useRepeatDetection'
import { useGuestScans } from '@/hooks/useGuestScans'
import { useAuthStore } from '@/store/authStore'
import { useScanStore } from '@/store/scanStore'
import { hashIngredients } from '@shared/hash'

function ScannerPage() {
  const navigate = useNavigate()
  const [showManual, setShowManual] = useState(false)
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [duplicatePrompt, setDuplicatePrompt] = useState(null)

  const { extractText, progress, isProcessing } = useOCR()
  const { analyse, isAnalysing, error } = useAnalysis()
  const { checkForRepeat } = useRepeatDetection()
  const { addGuestScan } = useGuestScans()
  const { session } = useAuthStore()
  const { setCurrentIngredients } = useScanStore()
  const { user } = useAuthStore()

  async function handleCapture(imageData) {
    const text = await extractText(imageData)
    if (text) {
      setExtractedText(text)
      setReviewDrawerOpen(true)
    }
  }

  async function handleAnalyse(ingredients) {
    setCurrentIngredients(ingredients)

    const { isDuplicate, hash, cachedScan } = await checkForRepeat(ingredients)

    if (isDuplicate) {
      setDuplicatePrompt({ hash, cachedScan, ingredients })
      return
    }

    await runAnalysis(ingredients)
  }

  async function runAnalysis(ingredients) {
    const result = await analyse(ingredients)
    if (!result) return

    const hash = await hashIngredients(ingredients)

    if (!session) {
      addGuestScan({
        product_name: 'Unnamed Product',
        raw_ingredients: ingredients,
        ingredient_hash: hash,
        verdict: result.verdict,
        summary: result.summary,
        analysis_json: result,
      })
    }

    navigate('/result')
  }

  if (duplicatePrompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 gap-6">
        <p className="text-gray-700 font-medium text-center">
          You have scanned this product before. Use the cached result?
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={() => {
              useScanStore
                .getState()
                .setLastResult(duplicatePrompt.cachedScan.analysis_json)
              navigate('/result')
            }}
            className="flex-1 rounded-xl bg-green-600 text-white py-2 font-medium hover:bg-green-700"
          >
            Use Cached
          </button>
          <button
            onClick={() => {
              setDuplicatePrompt(null)
              runAnalysis(duplicatePrompt.ingredients)
            }}
            className="flex-1 rounded-xl bg-gray-100 text-gray-700 py-2 font-medium hover:bg-gray-200"
          >
            Re-analyse
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-4">
        <h1 className="text-white font-bold text-lg">IngredientIQ</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/history')}
            aria-label="View history"
            className="text-white hover:text-green-400 transition-colors"
          >
            <History size={24} />
          </button>
          {user && (
            <button
              onClick={() => navigate('/profile')}
              aria-label="View profile"
              className="text-white hover:text-green-400 transition-colors"
            >
              <User size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Camera or Manual */}
      {showManual ? (
        <div className="flex flex-col items-center justify-center h-full px-6 bg-gray-50">
          <div className="w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Enter Ingredients Manually
            </h2>
            <ManualEntryFallback onSubmit={handleAnalyse} />
            <button
              onClick={() => setShowManual(false)}
              className="mt-4 text-sm text-green-600 hover:underline w-full text-center"
            >
              Use camera instead
            </button>
          </div>
        </div>
      ) : (
        <CameraViewfinder
          onCapture={handleCapture}
          onManualSubmit={handleAnalyse}
        />
      )}

      {/* OCR Progress */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 px-8">
          <OcrProgressBar progress={progress} />
        </div>
      )}

      {/* Analysing overlay */}
      {isAnalysing && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-white text-sm">Analysing ingredients...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute bottom-24 left-4 right-4 bg-red-600 text-white text-sm rounded-xl px-4 py-3 text-center">
          {error}
        </div>
      )}

      {/* Manual entry toggle */}
      {!showManual && (
        <button
          onClick={() => setShowManual(true)}
          className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-xs hover:text-white"
        >
          Type ingredients manually instead
        </button>
      )}

      {/* Text Review Drawer */}
      <TextReviewDrawer
        isOpen={reviewDrawerOpen}
        onClose={() => setReviewDrawerOpen(false)}
        extractedText={extractedText}
        onConfirm={handleAnalyse}
      />
    </div>
  )
}

export default ScannerPage
