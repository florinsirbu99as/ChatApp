'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Schnittstelle für die Kamera-Modal-Props
interface CameraModalProps {
  isOpen: boolean // Modal ist offen/geschlossen
  onClose: () => void // Callback wenn Modal geschlossen wird
  onCapture: (imageData: string) => void // Callback wenn Foto aufgenommen wird
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null) // Referenz zum Video-Element für Kamera-Vorschau
  const canvasRef = useRef<HTMLCanvasElement>(null) // Referenz zum Canvas zum Speichern des Fotos
  const [isCameraActive, setIsCameraActive] = useState(false) // Status: Kamera läuft?
  const streamRef = useRef<MediaStream | null>(null) // Speichert den Kamera-Stream
  const [capturedImage, setCapturedImage] = useState<string | null>(null) // Das aufgenommene Foto als Base64

  // Starte Kamera wenn Modal öffnet
  useEffect(() => {
    if (!isOpen) return

    const startCamera = async () => {
      try {
        // Fordere Zugriff auf die Kamera des Geräts an
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Rückkamera auf Mobilgeräten verwenden
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false, // Kein Audio für Chat-Fotos
        })

        // Verbinde den Kamera-Stream mit dem Video-Element
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          setIsCameraActive(true) // Markiere Kamera als aktiv
        }
      } catch (err) {
        console.error('Fehler beim Zugriff auf Kamera:', err)
        alert('Kamera konnte nicht aufgerufen werden. Bitte überprüfe die Berechtigungen.')
      }
    }

    startCamera()

    // Cleanup: Kamera stoppen wenn Modal geschlossen wird
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        setIsCameraActive(false)
      }
    }
  }, [isOpen])

  const handleCapture = () => {
    // Zeichne das aktuelle Video-Frame auf Canvas
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        // Setze Canvas-Größe auf die aktuelle Video-Größe
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        
        // Spiegele das Bild (wie ein Spiegel-Selfie)
        context.save()
        context.scale(-1, 1)
        context.translate(-canvasRef.current.width, 0)
        context.drawImage(videoRef.current, 0, 0)
        context.restore()
        
        // Konvertiere Canvas zu Base64-String (PNG-Format)
        const imageData = canvasRef.current.toDataURL('image/png')
        setCapturedImage(imageData) // Speichere das Foto
      }
    }
  }

  const handleRetake = () => {
    // Leere das gespeicherte Foto um neue Aufnahme zu ermöglichen
    setCapturedImage(null)
  }

  const handleClose = () => {
    // Stoppe die Kamera und schließe Modal
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      setIsCameraActive(false)
    }
    setCapturedImage(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>Foto aufnehmen</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Kamera-Vorschau - Wird immer gerendert, aber versteckt wenn Foto angezeigt */}
          <div className={`relative w-full bg-black rounded-lg overflow-hidden aspect-video ${capturedImage ? 'hidden' : ''}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Spiegele das Video
            />
          </div>

          {!capturedImage ? (
            <>
              {/* Zeige Kamera-Status an */}
              <div className="text-center text-sm text-gray-500">
                {isCameraActive ? '✓ Kamera ist bereit' : 'Starte Kamera...'}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCapture}
                  disabled={!isCameraActive}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Foto aufnehmen
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* Vorschau des aufgenommenen Fotos */}
              <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
                <img
                  src={capturedImage}
                  alt="Aufgenommenes Foto"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center text-sm text-gray-500">
                Foto-Vorschau
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleRetake}>
                  Erneut versuchen
                </Button>
                <Button
                  onClick={() => {
                    onCapture(capturedImage) // Sende Foto an Parent-Komponente
                    handleClose()
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Foto speichern
                </Button>
              </DialogFooter>
            </>
          )}
        </div>

        {/* Verstecktes Canvas zum Aufnehmen des Fotos */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
