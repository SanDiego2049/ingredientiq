import { useEffect } from 'react'
import { FlipHorizontal } from 'lucide-react'
import { useCamera } from '@/hooks/useCamera'
import CaptureButton from './CaptureButton'
import ManualEntryFallback from './ManualEntryFallback'

function CameraViewfinder({ onCapture, onManualSubmit }) {
  const {
    videoRef,
    isReady,
    error,
    startCamera,
    stopCamera,
    toggleCamera,
    captureImage,
  } = useCamera()

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  function handleCapture() {
    const imageData = captureImage()
    if (imageData) onCapture(imageData)
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 items-center w-full px-4 pt-12">
        <p className="text-sm text-red-600 text-center">{error}</p>
        <ManualEntryFallback onSubmit={onManualSubmit} />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Camera viewfinder"
        className="w-full h-full object-cover"
      />

      {/* Guide box overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-40 border-2 border-white rounded-xl opacity-70" />
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 w-full flex items-center justify-center gap-8">
        <CaptureButton onCapture={handleCapture} disabled={!isReady} />
        <button
          onClick={toggleCamera}
          aria-label="Toggle camera"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <FlipHorizontal size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default CameraViewfinder
