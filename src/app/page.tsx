'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  text: string
  sender: string
  timestamp: Date
  isSent: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize socket connection when component mounts
    if (typeof window !== 'undefined' && isJoined) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')
      
      socketRef.current.on('connect', () => {
        setIsConnected(true)
        socketRef.current?.emit('user_join', username)
      })

      socketRef.current.on('disconnect', () => {
        setIsConnected(false)
      })

      socketRef.current.on('message', (message: Omit<Message, 'isSent'>) => {
        setMessages(prev => [...prev, { ...message, isSent: false }])
      })

      return () => {
        socketRef.current?.disconnect()
      }
    }
  }, [isJoined, username])

  const handleJoin = () => {
    if (username.trim()) {
      setIsJoined(true)
    }
  }

  const sendMessage = () => {
    if (inputText.trim() && socketRef.current) {
      const message: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: username,
        timestamp: new Date(),
        isSent: true
      }
      
      setMessages(prev => [...prev, message])
      socketRef.current.emit('send_message', {
        text: inputText,
        sender: username,
        timestamp: new Date()
      })
      setInputText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isJoined) {
        sendMessage()
      } else {
        handleJoin()
      }
    }
  }

  if (!isJoined) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">ChatApp</h1>
            <p className="mt-2 text-gray-600">Enter your name to start chatting</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              maxLength={50}
            />
            <button
              onClick={handleJoin}
              disabled={!username.trim()}
              className="w-full rounded-lg bg-blue-500 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Join Chat
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">ChatApp</h1>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.isSent
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900 shadow-sm'
              }`}>
                {!message.isSent && (
                  <p className="text-xs font-medium mb-1 opacity-70">{message.sender}</p>
                )}
                <p className="break-words">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isSent ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            maxLength={500}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || !isConnected}
            className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}