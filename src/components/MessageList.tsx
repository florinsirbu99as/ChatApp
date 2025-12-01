// src/components/MessageList.tsx

import { Message } from '@/types/api'
import { useState, useEffect, useRef } from 'react'

type MessageListProps = {
  messages: Message[]
  loading: boolean
  error: string | null
  photoCache?: Record<string, string>
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading, error, photoCache = {} }) => {
  // Debug: log messages to see structure
  console.log('Messages in MessageList:', messages)
  console.log('Photo Cache:', photoCache)
  
  // Speichert vom Backend geholte Fotos, um sie anzuzeigen
  const [fetchedPhotos, setFetchedPhotos] = useState<Record<string, string>>({})
  const fetchingRef = useRef<Set<string>>(new Set()) //Verhindert doppelte Requests

  // Hole Fotos vom Backend für Nachrichten die eine photoid haben
  useEffect(() => {
    const fetchPhotos = async () => {
      // Filtere Nachrichten die Fotos haben und nicht im Cache sind
      const photoIds = messages
        .filter(msg => msg.photoid && !photoCache[msg.photoid] && !fetchedPhotos[msg.photoid] && !fetchingRef.current.has(msg.photoid))
        .map(msg => msg.photoid)
        .filter((id): id is string => id !== undefined)
        .slice(0, 5) //nur 5 Fotos gleichzeitig laden

      if (photoIds.length === 0) return

      console.log(`[MessageList] Hole ${photoIds.length} Fotos vom Backend (max 5 gleichzeitig)`)

      //markiere diese Fotos als "wird geladen"
      photoIds.forEach(id => fetchingRef.current.add(id))

     // Hole jedes Foto einzeln vom Backend via /api/photo
      for (const photoid of photoIds) {
        try {
          console.log(`[MessageList] Hole Foto: ${photoid}`)
          
          //Timeout für Request (10 Sekunden)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)
          
          const response = await fetch(`/api/photo?photoid=${photoid}`, {
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            const data = await response.json()
            console.log(`[MessageList] Foto erfolgreich geholt ${photoid}`)
            // Speichere das geholte Foto im State
            setFetchedPhotos(prev => ({
              ...prev,
              [photoid]: data.photo,
            }))
          } else {
            console.error(`[MessageList] Fehler beim Abrufen des Fotos ${photoid}: ${response.status}`)
            // Markiere als fehlgeschlagen, um nicht wieder zu versuchen
            setFetchedPhotos(prev => ({
              ...prev,
              [photoid]: 'error',
            }))
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            console.error(`[MessageList] Timeout beim Abrufen des Fotos ${photoid}`)
          } else {
            console.error(`[MessageList] Fehler beim Abrufen des Fotos ${photoid}:`, err)
          }
          // Markiere als fehlgeschlagen
          setFetchedPhotos(prev => ({
            ...prev,
            [photoid]: 'error',
          }))
        } finally {
          //Entferne aus "wird geladen" 
          fetchingRef.current.delete(photoid)
        }
        
        //Kleine Pause zwischen Requests (200ms)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    fetchPhotos()
  }, [messages, photoCache]) //fetchedPhotos aus Dependencies entfernt
  
  const formatMessageDate = (value?: string | number) => {
    if (value == null) return ''

    const m = /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/.exec(String(value).trim())
    if (!m) return `${value} (Invalid date format)`

    const [, Y, M, D, h, mi, s] = m.map(Number)
    const date = new Date(Y, M - 1, D, h, mi, s) // als lokale Zeit interpretiert

    if (isNaN(date.getTime())) return `${value} (Invalid date)`

    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Europe/Berlin',
    }).format(date)
  }

  // Wandelt Positions-Zeichenkette ("lat,lng") in Zahlen um
  const parsePosition = (position?: string): { lat: number; lng: number } | null => {
    if (!position) return null
    // Ensure position is a string
    const positionStr = typeof position === 'string' ? position : String(position)
    const trimmed = positionStr.trim()
    if (!trimmed) return null

    const parts = trimmed.split(',')
    if (parts.length !== 2) return null

    const lat = Number(parts[0])
    const lng = Number(parts[1])

    if (Number.isNaN(lat) || Number.isNaN(lng)) return null

    return { lat, lng }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
      {loading && <p>Loading messages...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {Array.isArray(messages) &&
        messages.map((message) => {
          const myId = typeof window !== 'undefined' ? localStorage.getItem('userid') : null
          const isMine = myId && message.userid === myId
          const coords = parsePosition(message.position)
          const hasLocation = !!coords

          return (
            <div
              key={message.id || message.messageid || `${message.userid}-${message.time}`}
              style={{
                display: 'flex',
                justifyContent: isMine ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  padding: 12,
                  backgroundColor: isMine ? '#2563eb' : '#f8f9fa', // blau vs. grau
                  color: isMine ? '#ffffff' : '#111111',
                  border: '1px solid',
                  borderColor: isMine ? '#2563eb' : '#dee2e6',
                  borderRadius: 8,
                  maxWidth: '70%',
                }}
              >
                {!isMine && (
                  <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#1f2937' }}>
                    {message.nickname || message.usernick || message.userid || 'Unknown user'}
                  </div>
                )}
                {message.photo && (
                  <div style={{ marginBottom: message.text ? 8 : 0 }}>
                    {/* Zeige Foto direkt wenn es im message.photo Field gespeichert ist */}
                    <img 
                      src={message.photo} 
                      alt="Nachrichtenanhang" 
                      style={{ maxWidth: '100%', borderRadius: 6, maxHeight: 300 }}
                    />
                  </div>
                )}
                {message.photoid && (
                  <div style={{ marginBottom: message.text ? 8 : 0 }}>
                    {/* Versuche zuerst gecachtes Foto (vom aktuellen Benutzer gesendet) */}
                    {photoCache[message.photoid] ? (
                      <img 
                        src={photoCache[message.photoid]} 
                        alt="Nachrichtenanhang" 
                        style={{ maxWidth: '100%', borderRadius: 6, maxHeight: 300 }}
                      />
                    ) : fetchedPhotos[message.photoid] && fetchedPhotos[message.photoid] !== 'error' ? (
                      /* Dann versuche vom Backend geholtes Foto */
                      <img 
                        src={fetchedPhotos[message.photoid]} 
                        alt="Nachrichtenanhang" 
                        style={{ maxWidth: '100%', borderRadius: 6, maxHeight: 300 }}
                      />
                    ) : fetchedPhotos[message.photoid] === 'error' ? (
                      /* Zeige Fehler wenn Abrufen fehlgeschlagen ist */
                      <div style={{
                        padding: 12,
                        backgroundColor: '#fee',
                        borderRadius: 6,
                        color: '#c33',
                        fontSize: '0.9em',
                      }}>
                        ⚠️ Photo not available
                      </div>
                    ) : (
                      /* Zeige Ladesymbol wenn Abrufen lädt */
                      <div style={{
                        padding: 12,
                        backgroundColor: '#eee',
                        borderRadius: 6,
                        color: '#666',
                        fontSize: '0.9em',
                      }}>
                        ⏳ Load photo...
                      </div>
                    )}
                  </div>
                )}
                {/* Standortnachricht anzeigen */}
                {hasLocation && coords && (
                  <div style={{ marginBottom: message.text ? 8 : 0 }}>
                    {/* Titel der Standortnachricht */}
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      📍 Shared location
                    </div>

                    {/* Koordinaten */}
                    <div style={{ fontSize: '0.9em', marginBottom: 4 }}>
                      {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </div>

                    {/* Link zu Google Maps */}
                    <a
                      href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.9em',
                        textDecoration: 'underline',
                        color: isMine ? '#bfdbfe' : '#2563eb',
                      }}
                    >
                      Open in Maps
                    </a>
                  </div>
                )}

                {/* Normaler Text */}
                {message.text && <p style={{ margin: 0 }}>{message.text}</p>}

                {(message.timestamp || message.time) && (
                  <div
                    style={{
                      fontSize: '0.85em',
                      marginTop: 4,
                      color: isMine ? 'rgba(255,255,255,0.8)' : '#6c757d',
                    }}
                  >
                    {formatMessageDate(message.timestamp || message.time || '')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      {!loading && (!Array.isArray(messages) || messages.length === 0) && <p>No messages in this chat yet.</p>}
    </div>
  )
}

export default MessageList