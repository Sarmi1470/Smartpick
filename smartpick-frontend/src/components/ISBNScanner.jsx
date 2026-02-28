import { useState, useRef, useEffect } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import Webcam from 'react-webcam'
import { Camera, X, Loader2, Scan, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ISBNScanner({ onScan, onClose, mode = 'single' }) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [manualIsbn, setManualIsbn] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [codeReader, setCodeReader] = useState(null)
  const webcamRef = useRef(null)

  // Initialize barcode reader
  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    setCodeReader(reader)
    
    return () => {
      if (reader) {
        reader.reset()
      }
    }
  }, [])

  // Start camera scanning
  const startCamera = async () => {
    setError('')
    setScanning(true)
    setIsCameraActive(true)
    
    try {
      // Get video stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (webcamRef.current) {
        webcamRef.current.video.srcObject = stream
      }
      
      // Start decoding
      if (codeReader) {
        codeReader.decodeFromVideoDevice(null, webcamRef.current.video, (result, err) => {
          if (result) {
            const isbn = result.getText()
            handleSuccessfulScan(isbn)
          }
          if (err && !(err.message.includes('NotFoundException'))) {
            console.error('Scan error:', err)
          }
        })
      }
    } catch (err) {
      setError('Camera access denied. Please use manual entry.')
      setIsCameraActive(false)
      setScanning(false)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.video.srcObject) {
      const tracks = webcamRef.current.video.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
    if (codeReader) {
      codeReader.reset()
    }
    setIsCameraActive(false)
    setScanning(false)
  }

  // Handle successful scan
  const handleSuccessfulScan = (isbn) => {
    // Clean ISBN (remove any non-digit characters)
    const cleanIsbn = isbn.replace(/[^\d]/g, '')
    
    // Validate ISBN-10 or ISBN-13
    if (cleanIsbn.length === 10 || cleanIsbn.length === 13) {
      stopCamera()
      onScan(cleanIsbn)
    } else {
      setError('Invalid ISBN format. Please try again.')
    }
  }

  // Handle manual submit
  const handleManualSubmit = (e) => {
    e.preventDefault()
    const cleanIsbn = manualIsbn.replace(/[^\d]/g, '')
    
    if (cleanIsbn.length === 10 || cleanIsbn.length === 13) {
      onScan(cleanIsbn)
    } else {
      setError('Please enter a valid 10 or 13 digit ISBN')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-charcoal/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-2xl glass-card p-6 md:p-8">
        {/* Close button */}
        <button
          onClick={() => {
            stopCamera()
            onClose()
          }}
          className="absolute top-4 right-4 text-text-secondary hover:text-muted-gold transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="font-playfair text-2xl md:text-3xl mb-6">
          {mode === 'single' ? '📖 Scan a Book' : '⚖️ Scan Books to Compare'}
        </h2>

        {/* Camera view */}
        {isCameraActive && (
          <div className="relative mb-6 rounded-xl overflow-hidden border-2 border-muted-gold/30">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: 'environment',
                width: 1280,
                height: 720
              }}
              className="w-full h-auto"
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-64 h-32 border-2 border-muted-gold rounded-lg animate-pulse">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 
                            text-muted-gold text-sm whitespace-nowrap">
                  📸 Align barcode here
                </div>
              </div>
            </div>

            {/* Scanning status */}
            {scanning && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                          bg-deep-charcoal/90 px-4 py-2 rounded-full flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-gold" />
                <span className="text-sm">Scanning...</span>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="space-y-4">
          {!isCameraActive ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={startCamera}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Camera className="w-5 h-5" />
                <span>Use Camera</span>
              </button>
              
              <button
                onClick={() => setIsCameraActive(false)}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3"
              >
                <BookOpen className="w-5 h-5" />
                <span>Manual Entry</span>
              </button>
            </div>
          ) : (
            <button
              onClick={stopCamera}
              className="w-full btn-secondary py-3"
            >
              Stop Camera
            </button>
          )}

          {/* Manual entry form */}
          <form onSubmit={handleManualSubmit} className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualIsbn}
                onChange={(e) => setManualIsbn(e.target.value)}
                placeholder="Enter ISBN (e.g., 9780451524935)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 
                         text-text-primary placeholder-text-secondary/50 
                         focus:outline-none focus:border-muted-gold/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!manualIsbn}
                className="px-6 py-3 bg-muted-gold/20 border border-muted-gold/30 
                         rounded-xl text-muted-gold hover:bg-muted-gold/30 
                         transition-all duration-300 disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Scan className="w-5 h-5" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </form>

          {/* Helper text */}
          <p className="text-xs text-text-secondary/60 text-center mt-4">
            {mode === 'single' 
              ? 'Scan one book to get AI-powered insights'
              : 'Scan multiple books (2-5) and I\'ll help you compare them'}
          </p>
        </div>

        {/* Mode-specific instructions */}
        {mode === 'compare' && (
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="font-medium text-soft-lavender mb-2">📋 Comparison Mode</h3>
            <p className="text-sm text-text-secondary">
              Scan your first book, then keep scanning others. 
              When you're done, click "Compare Them" to start the quiz.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}