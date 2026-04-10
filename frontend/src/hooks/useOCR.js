import { useState } from 'react'
import Tesseract from 'tesseract.js'

function preprocessImage(imageData) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')

      // Scale up to hit ~300 DPI equivalent — single biggest quality improvement
      const scale = 3
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      const ctx = canvas.getContext('2d')

      // Fill with white background first — removes transparency/alpha issues
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw scaled image on white background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Get pixel data
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageDataObj.data

      for (let i = 0; i < data.length; i += 4) {
        // Convert to greyscale using luminance formula
        const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

        // Apply Otsu-style adaptive threshold
        // Instead of fixed 128, use 160 — biased toward keeping more text
        const threshold = grey < 160 ? 0 : 255

        data[i] = threshold
        data[i + 1] = threshold
        data[i + 2] = threshold
        data[i + 3] = 255 // Force full opacity — no alpha channel
      }

      ctx.putImageData(imageDataObj, 0, 0)

      // Add a white border — Tesseract struggles with text touching edges
      const borderedCanvas = document.createElement('canvas')
      const border = 20
      borderedCanvas.width = canvas.width + border * 2
      borderedCanvas.height = canvas.height + border * 2
      const borderedCtx = borderedCanvas.getContext('2d')
      borderedCtx.fillStyle = '#ffffff'
      borderedCtx.fillRect(0, 0, borderedCanvas.width, borderedCanvas.height)
      borderedCtx.drawImage(canvas, border, border)

      resolve(borderedCanvas.toDataURL('image/png'))
    }
    img.src = imageData
  })
}

export function useOCR() {
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  async function extractText(imageData) {
    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      const processedImage = await preprocessImage(imageData)

      const result = await Tesseract.recognize(processedImage, 'eng', {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            setProgress(Math.round(info.progress * 100))
          }
        },
        // PSM 11 — sparse text, find as much text as possible in no particular order
        // Best for food labels which are not clean uniform text blocks
        tessedit_pageseg_mode: '11',
        // Disable dictionary — ingredient names are not real words
        load_system_dawg: '0',
        load_freq_dawg: '0',
      })

      const text = result.data.text.trim()
      return text.length > 0 ? text : null
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
