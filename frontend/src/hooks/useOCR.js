import { useState } from 'react'
import Tesseract from 'tesseract.js'

function preprocessImage(imageData) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')

      // Scale up the image 2x — Tesseract performs much better on larger images
      const scale = 2
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      const ctx = canvas.getContext('2d')

      // Scale up
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Get pixel data
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageDataObj.data

      for (let i = 0; i < data.length; i += 4) {
        // Step 1 — Convert to greyscale using luminance formula
        const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

        // Step 2 — Increase contrast by pushing pixels toward black or white
        const contrast = 1.5
        const factor =
          (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255))
        const adjusted = factor * (grey - 128) + 128

        // Step 3 — Clamp to 0-255
        const final = Math.min(255, Math.max(0, adjusted))

        // Step 4 — Apply threshold — anything below 128 becomes black, above becomes white
        const threshold = final < 128 ? 0 : 255

        data[i] = threshold // R
        data[i + 1] = threshold // G
        data[i + 2] = threshold // B
        // Alpha stays the same
      }

      ctx.putImageData(imageDataObj, 0, 0)
      resolve(canvas.toDataURL('image/png'))
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
      // Preprocess before sending to Tesseract
      const processedImage = await preprocessImage(imageData)

      const result = await Tesseract.recognize(processedImage, 'eng', {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            setProgress(Math.round(info.progress * 100))
          }
        },
        tessedit_pageseg_mode: '6', // Assume a single uniform block of text
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
