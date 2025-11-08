'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '@/lib/types/chat'
import { sendChatMessage } from '@/lib/api/chat'
import ChatMessageBubble from './ChatMessageBubble'
import ChatInput from './ChatInput'
import styles from './ChatInterface.module.css'

export default function ChatInterface() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'agent',
      content: "Hi! I'm your Toyota AI assistant. I'm here to help you find the perfect Toyota vehicle based on your needs. Tell me about your daily commute, family size, or what features matter most to you!",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    // Add user message to chat history
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    }

    const updatedHistory = [...chatHistory, userMessage]
    setChatHistory(updatedHistory)
    setIsLoading(true)

    try {
      // Send entire chat history to backend
      const agentResponse = await sendChatMessage(updatedHistory)

      // Add agent response to chat history
      const agentMessage: ChatMessage = {
        role: 'agent',
        content: agentResponse,
        timestamp: new Date(),
      }

      setChatHistory([...updatedHistory, agentMessage])
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'agent',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      }
      setChatHistory([...updatedHistory, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {chatHistory.map((message, index) => (
          <ChatMessageBubble key={index} message={message} />
        ))}
        {isLoading && (
          <div className={styles.loadingIndicator}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}

