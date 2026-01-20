'use client'

import { Message } from '@/types/api'
import { useState, useEffect, useRef } from 'react'
//import { MapPin } from "lucide-react" //falls man sich entscheidet doch ein Icon zu nehmen

type MessageListProps = {
  messages: Message[]
  loading: boolean
  error: string | null
  photoCache?: Record<string, string>
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading, error, photoCache = {} }) => {
  // Speichert vom Backend geholte Fotos, um sie anzuzeigen
  const [fetchedPhotos, setFetchedPhotos] = useState<Record<string, string>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const fetchingRef = useRef<Set<string>>(new Set()) //Verhindert doppelte Requests

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUserId(localStorage.getItem('userid'))
    }
  }, [])

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

      //markiere diese Fotos als "wird geladen"
      photoIds.forEach(id => fetchingRef.current.add(id))

     // Hole jedes Foto einzeln vom Backend via /api/photo
      for (const photoid of photoIds) {
        try {
          //Timeout für Request (10 Sekunden)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)
          
          const response = await fetch(`/api/photo?photoid=${photoid}`, {
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            const data = await response.json()
            // Speichere das geholte Foto im State
            setFetchedPhotos(prev => ({
              ...prev,
              [photoid]: data.photo,
            }))
          } else {
            // Markiere als fehlgeschlagen, um nicht wieder zu versuchen
            setFetchedPhotos(prev => ({
              ...prev,
              [photoid]: 'error',
            }))
          }
        } catch (err) {
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

  // Helper to decode HTML entities like &#34;
  const decodeHtml = (html: string) => {
    if (typeof window === 'undefined') return html
    // Basic decode for JSON parsing
    return html.replace(/&#34;/g, '"')
               .replace(/&quot;/g, '"')
  }

  // Parses a potential file message
  const parseFileMessage = (text?: string) => {
    if (!text) return null
    // The backend might return HTML-encoded entities
    const decodedText = text.includes('&#') ? decodeHtml(text) : text
    if (!decodedText.startsWith('[FILE_V1]')) return null
    try {
      const jsonStr = decodedText.substring(9)
      return JSON.parse(jsonStr) as { url: string; name: string; size: number; type: string; caption?: string }
    } catch (e) {
      return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {Array.isArray(messages) &&
        messages.map((message) => {
          const isMine = currentUserId && message.userid === currentUserId
          const coords = parsePosition(message.position)
          const hasLocation = !!coords
          const fileData = parseFileMessage(message.text)

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
                  backgroundColor: isMine ? '#2563eb' : '#ffffff', 
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
                      alt="Message attachment" 
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
                        alt="Message attachment" 
                        style={{ maxWidth: '100%', borderRadius: 6, maxHeight: 300 }}
                      />
                    ) : fetchedPhotos[message.photoid] && fetchedPhotos[message.photoid] !== 'error' ? (
                      /* Dann versuche vom Backend geholtes Foto */
                      <img 
                        src={fetchedPhotos[message.photoid]} 
                        alt="Message attachment" 
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
                      {/*<MapPin className="h-5 w-5" />*/}
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

                {/* Dateianhang anzeigen */}
                {fileData && (
                  <div style={{ marginBottom: fileData.caption ? 8 : 0 }}>
                    {fileData.type.startsWith('image/') ? (
                      <img 
                        src={fileData.url} 
                        alt={fileData.name} 
                        style={{ maxWidth: '100%', borderRadius: 6, maxHeight: 300 }}
                      />
                    ) : (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 12, 
                          padding: 10, 
                          backgroundColor: isMine ? 'rgba(255,255,255,0.1)' : '#f3f4f6', 
                          borderRadius: 6,
                          border: '1px solid',
                          borderColor: isMine ? 'rgba(255,255,255,0.2)' : '#e5e7eb'
                        }}
                      >
                        <div style={{ fontSize: '1.5em' }}>
                          {fileData.type.includes('pdf') ? '📄' : '📁'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.9em', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {fileData.name}
                          </div>
                          <div style={{ fontSize: '0.8em', opacity: 0.8 }}>
                            {(fileData.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <a 
                          href={fileData.url} 
                          download={fileData.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '4px 8px',
                            backgroundColor: isMine ? '#ffffff' : '#2563eb',
                            color: isMine ? '#2563eb' : '#ffffff',
                            borderRadius: 4,
                            textDecoration: 'none',
                            fontSize: '0.8em',
                            fontWeight: 'bold'
                          }}
                        >
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Normaler Text oder Bild-Unterschrift */}
                {fileData ? (
                   fileData.caption && <p style={{ margin: 0 }}>{fileData.caption}</p>
                ) : (
                   message.text && <p style={{ margin: 0 }}>{message.text}</p>
                )}

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