import { useState } from 'react'
import Tesseract from 'tesseract.js'

export function useOCR() {
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  async function extractText(imageData) {
    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      const result = await Tesseract.recognize(imageData, 'eng', {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            setProgress(Math.round(info.progress * 100))
          }
        },
      })

      return result.data.text
    } catch (err) {
      setError(
        'Failed to read the image. Please try again or use manual entry.'
      )
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  return { extractText, progress, isProcessing, error }
}
