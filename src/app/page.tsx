'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR, { mutate } from 'swr'
import axios from 'axios'

interface Message {
  id: string
  text: string
  sender: string
  timestamp: string
  userId: string
}

interface User {
  id: string
  name: string
  lastSeen: string
}

// API configuration - replace with your actual API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jsonplaceholder.typicode.com'

// Fetcher function for SWR
const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function ChatPage() {
  const [inputText, setInputText] = useState('')
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data for demo purposes - replace with your API endpoints
  const { data: messages = [], error: messagesError } = useSWR<Message[]>(
    isJoined ? '/api/messages' : null,
    () => fetchMessages(),
    { 
      refreshInterval: 2000, // Poll every 2 seconds for new messages
      revalidateOnFocus: true 
    }
  )

  const { data: users = [], error: usersError } = useSWR<User[]>(
    isJoined ? '/api/users' : null,
    () => fetchUsers(),
    { refreshInterval: 5000 }
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mock API functions - replace with your actual API calls
  const fetchMessages = async (): Promise<Message[]> => {
    // This is a mock implementation
    // Replace with your actual API endpoint
    try {
      const response = await axios.get(`${API_BASE_URL}/posts?_limit=10`)
      return response.data.map((post: any, index: number) => ({
        id: post.id.toString(),
        text: post.title,
        sender: `User ${post.userId}`,
        timestamp: new Date(Date.now() - (10 - index) * 60000).toISOString(),
        userId: post.userId.toString()
      }))
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      return []
    }
  }

  const fetchUsers = async (): Promise<User[]> => {
    // This is a mock implementation
    // Replace with your actual API endpoint
    try {
      const response = await axios.get(`${API_BASE_URL}/users?_limit=5`)
      return response.data.map((user: any) => ({
        id: user.id.toString(),
        name: user.name,
        lastSeen: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to fetch users:', error)
      return []
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim()) return

    const newMessage: Omit<Message, 'id'> = {
      text: inputText,
      sender: username,
      userId: userId,
      timestamp: new Date().toISOString()
    }

    try {
      // Post message to your API
      const response = await axios.post(`${API_BASE_URL}/posts`, {
        title: inputText,
        body: inputText,
        userId: parseInt(userId) || 1
      })

      // Optimistically update the local state
      const optimisticMessage: Message = {
        id: response.data.id?.toString() || Date.now().toString(),
        ...newMessage
      }

      // Update the cache
      mutate('/api/messages', (currentMessages: Message[] = []) => [
        ...currentMessages,
        optimisticMessage
      ], false)

      setInputText('')
      
      // Revalidate to get the latest data from server
      mutate('/api/messages')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleJoin = async () => {
    if (!username.trim()) return

    try {
      // Create or get user from your API
      const response = await axios.post(`${API_BASE_URL}/users`, {
        name: username,
        email: `${username.toLowerCase()}@example.com`
      })

      setUserId(response.data.id?.toString() || '1')
      setIsJoined(true)

      // Send join message
      await axios.post(`${API_BASE_URL}/posts`, {
        title: `${username} joined the chat`,
        body: `${username} has joined the conversation`,
        userId: response.data.id || 1
      })

      // Refresh messages
      mutate('/api/messages')
    } catch (error) {
      console.error('Failed to join chat:', error)
      // Still allow joining even if API fails
      setUserId('1')
      setIsJoined(true)
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
            <p className="mt-1 text-sm text-gray-500">Uses REST API for real-time messaging</p>
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

  const isLoading = !messages && !messagesError
  const hasError = messagesError

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">ChatApp</h1>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${
            hasError ? 'bg-red-500' : isLoading ? 'bg-yellow-500' : 'bg-green-500'
          }`} />
          <span className="text-sm text-gray-600">
            {hasError ? 'Offline' : isLoading ? 'Connecting...' : 'Online'}
          </span>
          {users.length > 0 && (
            <span className="text-xs text-gray-500">
              {users.length} user{users.length > 1 ? 's' : ''} online
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading messages...</p>
            </div>
          </div>
        ) : hasError ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-red-500">Failed to load messages</p>
              <button 
                onClick={() => mutate('/api/messages')}
                className="mt-2 text-blue-500 hover:text-blue-700"
              >
                Try again
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.userId === userId
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwnMessage
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}>
                  {!isOwnMessage && (
                    <p className="text-xs font-medium mb-1 opacity-70">{message.sender}</p>
                  )}
                  <p className="break-words">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            )
          })
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
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}